import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Square } from 'chess.js';
import { Chess } from 'chess.js';
import { eventFromAnalysis, pickPrefab, type BanterEvent } from '../data/chessBanter';
import { AGENT_NAME, HUMAN_RATING_ANCHOR, LICHESS_URL } from '../data/osIdentity';
import { nextSkillLevel } from '../lib/chess/adaptiveSkill';
import {
  type ChessStats,
  readChessStats,
  writeChessStats,
} from '../lib/chess/chessStorage';
import {
  BACKGROUND_FORFEIT_MS,
  shouldCancelBackgroundTimer,
  shouldStartBackgroundTimer,
} from '../lib/chess/forfeitGuards';
import { estimateMoveCpl, pieceUnicode } from '../lib/chess/gameUtils';
import { buildPgn, pgnDownloadFilename } from '../lib/chess/pgn';
import { skillToElo, updateElo } from '../lib/chess/rating';
import { sanitizeText } from '../lib/chess/sanitize';
import { StockfishEngine, uciToFromTo } from '../lib/chess/stockfishWorker';

export type TimePresetId = '3+2' | '5|0' | '10|0';

export const TIME_PRESETS: Record<
  TimePresetId,
  { label: string; initialMs: number; incrementMs: number; pgn: string }
> = {
  '3+2': { label: '3+2', initialMs: 180_000, incrementMs: 2_000, pgn: '180+2' },
  '5|0': { label: '5|0', initialMs: 300_000, incrementMs: 0, pgn: '300+0' },
  '10|0': { label: '10|0', initialMs: 600_000, incrementMs: 0, pgn: '600+0' },
};

export type ChatLine = { id: string; from: 'sentry' | 'you' | 'system'; text: string };

export type GamePhase = 'lobby' | 'playing' | 'ended';

export type EndReason =
  | 'checkmate'
  | 'timeout'
  | 'resign'
  | 'forfeit'
  | 'draw'
  | 'stalemate';

type Side = 'w' | 'b';

const visitorIsWhite = true;

export const useChessArena = () => {
  const [stats, setStats] = useState<ChessStats>(() => {
    if (typeof window === 'undefined') {
      return {
        userWins: 0,
        sentryWins: 0,
        draws: 0,
        visitorElo: 800,
        skillLevel: 4,
        gamesPlayed: 0,
        recentPgns: [],
      };
    }
    return readChessStats();
  });
  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [preset, setPreset] = useState<TimePresetId>('5|0');
  const [fen, setFen] = useState(() => new Chess().fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [visitorClockMs, setVisitorClockMs] = useState(TIME_PRESETS['5|0'].initialMs);
  const [sentryClockMs, setSentryClockMs] = useState(TIME_PRESETS['5|0'].initialMs);
  const [turn, setTurn] = useState<Side>('w');
  const [chat, setChat] = useState<ChatLine[]>([]);
  const [banterMode, setBanterMode] = useState<'llm' | 'fallback'>('llm');
  const [engineReady, setEngineReady] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [endReason, setEndReason] = useState<EndReason | null>(null);
  const [result, setResult] = useState<'1-0' | '0-1' | '1/2-1/2' | null>(null);
  const [liveRegion, setLiveRegion] = useState('');
  const [evalPawns, setEvalPawns] = useState(0);
  const [cursorSquare, setCursorSquare] = useState<Square>('e2');

  const gameRef = useRef(new Chess());
  const engineRef = useRef<StockfishEngine | null>(null);
  const movesSanRef = useRef<string[]>([]);
  const cplSamplesRef = useRef<number[]>([]);
  const lastEvalRef = useRef(0);
  const activeRef = useRef(false);
  const endingRef = useRef(false);
  const visitorClockRef = useRef(visitorClockMs);
  const sentryClockRef = useRef(sentryClockMs);
  const turnRef = useRef(turn);
  const bgTimerRef = useRef<number | null>(null);
  const plyRef = useRef(0);
  const skillRef = useRef(stats.skillLevel);

  useEffect(() => {
    visitorClockRef.current = visitorClockMs;
  }, [visitorClockMs]);
  useEffect(() => {
    sentryClockRef.current = sentryClockMs;
  }, [sentryClockMs]);
  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  const persistStats = useCallback((next: ChessStats) => {
    writeChessStats(next);
    setStats(next);
    skillRef.current = next.skillLevel;
  }, []);

  const pushChat = useCallback((from: ChatLine['from'], text: string) => {
    const clean = sanitizeText(text, 280);
    if (!clean) return;
    setChat((prev) => [...prev.slice(-40), { id: `${Date.now()}-${Math.random()}`, from, text: clean }]);
  }, []);

  const announce = useCallback((msg: string) => {
    setLiveRegion(msg);
  }, []);

  const requestBanter = useCallback(
    async (event: BanterEvent, extra?: { userMessage?: string; lastMove?: string }) => {
      const salt = plyRef.current + Date.now();
      const fallback = () => {
        setBanterMode('fallback');
        pushChat('sentry', pickPrefab(event, salt));
      };

      if (banterMode === 'fallback') {
        pushChat('sentry', pickPrefab(event, salt));
        return;
      }

      try {
        const res = await fetch('/api/chess-banter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event,
            lastMove: extra?.lastMove,
            fen: gameRef.current.fen(),
            evalPawns: lastEvalRef.current,
            visitorClockMs: visitorClockRef.current,
            sentryClockMs: sentryClockRef.current,
            ply: plyRef.current,
            userMessage: extra?.userMessage,
          }),
        });
        const data = (await res.json()) as { text?: string; fallback?: boolean };
        if (!res.ok || data.fallback || !data.text) {
          fallback();
          return;
        }
        pushChat('sentry', data.text);
      } catch {
        fallback();
      }
    },
    [banterMode, pushChat],
  );

  const endGame = useCallback(
    async (reason: EndReason, gameResult: '1-0' | '0-1' | '1/2-1/2') => {
      if (endingRef.current || !activeRef.current) return;
      endingRef.current = true;
      activeRef.current = false;
      setPhase('ended');
      setEndReason(reason);
      setResult(gameResult);
      setThinking(false);

      const visitorWon =
        (gameResult === '1-0' && visitorIsWhite) || (gameResult === '0-1' && !visitorIsWhite);
      const sentryWon =
        (gameResult === '0-1' && visitorIsWhite) || (gameResult === '1-0' && !visitorIsWhite);
      const draw = gameResult === '1/2-1/2';

      const meanCpl =
        cplSamplesRef.current.length > 0
          ? cplSamplesRef.current.reduce((a, b) => a + b, 0) / cplSamplesRef.current.length
          : 80;

      const current = readChessStats();
      const oppElo = skillToElo(skillRef.current);
      const score: 0 | 0.5 | 1 = visitorWon ? 1 : draw ? 0.5 : 0;
      const nextElo = updateElo(current.visitorElo, oppElo, score);
      const nextSkill = nextSkillLevel({
        currentSkill: skillRef.current,
        meanCpl,
        result: visitorWon ? 'win' : draw ? 'draw' : 'loss',
      });

      const pgn = buildPgn({
        visitorIsWhite,
        result: gameResult,
        timeControl: TIME_PRESETS[preset].pgn,
        movesSan: movesSanRef.current,
      });

      const next: ChessStats = {
        ...current,
        userWins: current.userWins + (visitorWon ? 1 : 0),
        sentryWins: current.sentryWins + (sentryWon ? 1 : 0),
        draws: current.draws + (draw ? 1 : 0),
        visitorElo: nextElo,
        skillLevel: nextSkill,
        gamesPlayed: current.gamesPlayed + 1,
        recentPgns: [
          { id: `g-${Date.now()}`, pgn, endedAt: new Date().toISOString() },
          ...current.recentPgns,
        ].slice(0, 20),
      };
      persistStats(next);

      const banterEvent: BanterEvent = reason === 'forfeit'
        ? 'forfeit'
        : visitorWon
          ? 'gameOverLoss'
          : draw
            ? 'gameOverDraw'
            : 'gameOverWin';
      void requestBanter(banterEvent);
      announce(
        visitorWon
          ? 'You won.'
          : draw
            ? 'Draw.'
            : reason === 'forfeit'
              ? `${AGENT_NAME} wins by forfeit.`
              : `${AGENT_NAME} wins.`,
      );
    },
    [announce, persistStats, preset, requestBanter],
  );

  // Clock tick
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      if (!activeRef.current) return;
      if (turnRef.current === 'w') {
        setVisitorClockMs((ms) => {
          const next = ms - 100;
          if (next <= 0) {
            void endGame('timeout', visitorIsWhite ? '0-1' : '1-0');
            return 0;
          }
          return next;
        });
      } else {
        setSentryClockMs((ms) => {
          const next = ms - 100;
          if (next <= 0) {
            void endGame('timeout', visitorIsWhite ? '1-0' : '0-1');
            return 0;
          }
          return next;
        });
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, endGame]);

  // Forfeit on leave / background
  useEffect(() => {
    if (phase !== 'playing') return;

    const forfeit = () => {
      void endGame('forfeit', visitorIsWhite ? '0-1' : '1-0');
    };

    const onPageHide = () => forfeit();
    const onVis = () => {
      if (shouldStartBackgroundTimer(document.visibilityState)) {
        if (bgTimerRef.current) window.clearTimeout(bgTimerRef.current);
        bgTimerRef.current = window.setTimeout(forfeit, BACKGROUND_FORFEIT_MS);
      } else if (shouldCancelBackgroundTimer(document.visibilityState)) {
        if (bgTimerRef.current) {
          window.clearTimeout(bgTimerRef.current);
          bgTimerRef.current = null;
        }
      }
    };

    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVis);
      if (bgTimerRef.current) window.clearTimeout(bgTimerRef.current);
    };
  }, [phase, endGame]);

  const syncBoard = useCallback(() => {
    const g = gameRef.current;
    setFen(g.fen());
    setTurn(g.turn());
    plyRef.current = g.history().length;
  }, []);

  const afterVisitorMove = useCallback(
    async (san: string) => {
      movesSanRef.current.push(san);
      const g = gameRef.current;
      syncBoard();
      announce(`You played ${san}`);

      if (g.isCheckmate()) {
        await endGame('checkmate', visitorIsWhite ? '1-0' : '0-1');
        return;
      }
      if (g.isDraw() || g.isStalemate()) {
        await endGame(g.isStalemate() ? 'stalemate' : 'draw', '1/2-1/2');
        return;
      }

      // increment visitor clock
      const inc = TIME_PRESETS[preset].incrementMs;
      if (inc) setVisitorClockMs((ms) => ms + inc);

      setThinking(true);
      const engine = engineRef.current;
      if (!engine) {
        setThinking(false);
        return;
      }

      try {
        const evalBefore = lastEvalRef.current;
        const thinkMs = Math.min(2000, Math.max(200, sentryClockRef.current / 20));
        const { bestMove } = await engine.getBestMove(g.fen(), thinkMs);
        const parsed = uciToFromTo(bestMove);
        if (!parsed || !activeRef.current) {
          setThinking(false);
          return;
        }
        const move = g.move({
          from: parsed.from,
          to: parsed.to,
          promotion: (parsed.promotion as 'q' | 'r' | 'b' | 'n') || 'q',
        });
        if (!move) {
          setThinking(false);
          return;
        }
        movesSanRef.current.push(move.san);
        setLastMove({ from: move.from, to: move.to });
        syncBoard();
        announce(`${AGENT_NAME} played ${move.san}`);

        if (inc) setSentryClockMs((ms) => ms + inc);

        // background eval for adaptive + banter (non-blocking-ish)
        try {
          const ev = await engine.evaluate(g.fen(), 10);
          const pawns = ev.scoreCp / 100;
          const cpl = estimateMoveCpl(evalBefore, pawns, true);
          cplSamplesRef.current.push(cpl);
          lastEvalRef.current = pawns;
          setEvalPawns(pawns);
          const event = eventFromAnalysis({
            ply: plyRef.current,
            visitorCpl: cpl,
            evalPawns: pawns,
            visitorIsWhite,
            inCheck: g.inCheck(),
            visitorClockMs: visitorClockRef.current,
            pieceCount: g.board().flat().filter(Boolean).length,
          });
          void requestBanter(event, { lastMove: move.san });
        } catch {
          void requestBanter('iMoved', { lastMove: move.san });
        }

        if (g.isCheckmate()) {
          await endGame('checkmate', visitorIsWhite ? '0-1' : '1-0');
        } else if (g.isDraw() || g.isStalemate()) {
          await endGame(g.isStalemate() ? 'stalemate' : 'draw', '1/2-1/2');
        }
      } catch {
        pushChat('system', `${AGENT_NAME} engine hiccup — try again or refresh.`);
      } finally {
        setThinking(false);
      }
    },
    [announce, endGame, preset, pushChat, requestBanter, syncBoard],
  );

  const tryMove = useCallback(
    (from: Square, to: Square, promotion: 'q' | 'r' | 'b' | 'n' = 'q') => {
      if (phase !== 'playing' || thinking) return false;
      if (gameRef.current.turn() !== (visitorIsWhite ? 'w' : 'b')) return false;
      const move = gameRef.current.move({ from, to, promotion });
      if (!move) return false;
      setSelected(null);
      setLegalTargets([]);
      setLastMove({ from: move.from, to: move.to });
      void afterVisitorMove(move.san);
      return true;
    },
    [afterVisitorMove, phase, thinking],
  );

  const onSquareClick = useCallback(
    (sq: Square) => {
      setCursorSquare(sq);
      if (phase !== 'playing' || thinking) return;
      const g = gameRef.current;
      if (g.turn() !== (visitorIsWhite ? 'w' : 'b')) return;

      if (selected) {
        if (selected === sq) {
          setSelected(null);
          setLegalTargets([]);
          return;
        }
        if (legalTargets.includes(sq)) {
          const piece = g.get(selected);
          const needsPromo = piece?.type === 'p' && (sq[1] === '8' || sq[1] === '1');
          tryMove(selected, sq, needsPromo ? 'q' : 'q');
          return;
        }
      }

      const piece = g.get(sq);
      if (piece && piece.color === (visitorIsWhite ? 'w' : 'b')) {
        setSelected(sq);
        const moves = g.moves({ square: sq, verbose: true });
        setLegalTargets(moves.map((m) => m.to));
      } else {
        setSelected(null);
        setLegalTargets([]);
      }
    },
    [legalTargets, phase, selected, thinking, tryMove],
  );

  const startGame = useCallback(async () => {
    endingRef.current = false;
    activeRef.current = true;
    gameRef.current = new Chess();
    movesSanRef.current = [];
    cplSamplesRef.current = [];
    lastEvalRef.current = 0;
    plyRef.current = 0;
    const p = TIME_PRESETS[preset];
    setVisitorClockMs(p.initialMs);
    setSentryClockMs(p.initialMs);
    setSelected(null);
    setLegalTargets([]);
    setLastMove(null);
    setEndReason(null);
    setResult(null);
    setEvalPawns(0);
    setChat([]);
    setPhase('playing');
    syncBoard();
    announce('Game started. You play White. Timed game only — leaving forfeits.');
    pushChat('system', `HARI.OS · Chess Arena process online. Opponent: ${AGENT_NAME}.`);
    void requestBanter('opening');

    if (!engineRef.current) {
      engineRef.current = new StockfishEngine();
    }
    try {
      await engineRef.current.init();
      await engineRef.current.setSkill(skillRef.current);
      setEngineReady(true);
    } catch {
      setEngineReady(false);
      pushChat('system', 'Engine failed to load. Refresh and try again.');
      activeRef.current = false;
      setPhase('lobby');
    }
  }, [announce, preset, pushChat, requestBanter, syncBoard]);

  const resign = useCallback(() => {
    void endGame('resign', visitorIsWhite ? '0-1' : '1-0');
  }, [endGame]);

  const exportLatestPgn = useCallback(() => {
    const latest = stats.recentPgns[0];
    if (!latest) return;
    const blob = new Blob([latest.pgn], { type: 'application/vnd.chess-pgn' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pgnDownloadFilename();
    a.click();
    URL.revokeObjectURL(url);
  }, [stats.recentPgns]);

  const sendUserChat = useCallback(
    (text: string) => {
      const clean = sanitizeText(text, 200);
      if (!clean) return;
      pushChat('you', clean);
      void requestBanter('idle', { userMessage: clean });
    },
    [pushChat, requestBanter],
  );

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
    };
  }, []);

  const boardSquares = useMemo(() => {
    const g = new Chess(fen);
    const rows: Array<
      Array<{
        square: Square;
        piece: string;
        pieceLabel: string;
        isDark: boolean;
      }>
    > = [];
    for (let rank = 7; rank >= 0; rank--) {
      const row = [];
      for (let file = 0; file < 8; file++) {
        const square = `${'abcdefgh'[file]}${rank + 1}` as Square;
        const p = g.get(square);
        row.push({
          square,
          piece: p ? pieceUnicode(p.type, p.color) : '',
          pieceLabel: p ? `${p.color === 'w' ? 'White' : 'Black'} ${p.type}` : 'empty',
          isDark: (file + rank) % 2 === 0,
        });
      }
      rows.push(row);
    }
    return rows;
  }, [fen]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (phase !== 'playing') return;
      const files = 'abcdefgh';
      const file = files.indexOf(cursorSquare[0]);
      const rank = Number(cursorSquare[1]) - 1;
      let nf = file;
      let nr = rank;
      if (e.key === 'ArrowLeft') nf = Math.max(0, file - 1);
      if (e.key === 'ArrowRight') nf = Math.min(7, file + 1);
      if (e.key === 'ArrowUp') nr = Math.min(7, rank + 1);
      if (e.key === 'ArrowDown') nr = Math.max(0, rank - 1);
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const next = `${files[nf]}${nr + 1}` as Square;
        setCursorSquare(next);
        announce(next);
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSquareClick(cursorSquare);
      }
    },
    [announce, cursorSquare, onSquareClick, phase],
  );

  return {
    stats,
    phase,
    preset,
    setPreset,
    boardSquares,
    selected,
    legalTargets,
    lastMove,
    visitorClockMs,
    sentryClockMs,
    turn,
    chat,
    banterMode,
    engineReady,
    thinking,
    endReason,
    result,
    liveRegion,
    evalPawns,
    cursorSquare,
    effectiveSentryElo: skillToElo(stats.skillLevel),
    humanAnchor: HUMAN_RATING_ANCHOR,
    lichessUrl: LICHESS_URL,
    inCheck: (() => {
      try {
        return new Chess(fen).inCheck();
      } catch {
        return false;
      }
    })(),
    startGame,
    resign,
    onSquareClick,
    onKeyDown,
    exportLatestPgn,
    sendUserChat,
    backToLobby: () => setPhase('lobby'),
  };
};
