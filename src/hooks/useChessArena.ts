import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Square } from 'chess.js';
import { Chess } from 'chess.js';
import { evaluateDrawOffer, isDrawRequest } from '../lib/chess/drawOffer';
import { eventFromAnalysis, FALLBACK_MODE_NOTICE, pickPrefab, type BanterEvent } from '../data/chessBanter';
import {
  chessLevelFor,
  unlocksEarned,
  type ChessUnlock,
} from '../data/chessUnlocks';
import { AGENT_NAME, HUMAN_RATING_ANCHOR, LICHESS_URL } from '../data/osIdentity';
import { nextSkillLevel } from '../lib/chess/adaptiveSkill';
import {
  EMPTY_CHESS_STATS,
  type ChessStats,
  readChessStats,
  writeChessStats,
} from '../lib/chess/chessStorage';
import {
  BACKGROUND_FORFEIT_MS,
  shouldCancelBackgroundTimer,
  shouldStartBackgroundTimer,
} from '../lib/chess/forfeitGuards';
import { estimateMoveCpl } from '../lib/chess/gameUtils';
import { buildPgn, pgnDownloadFilename } from '../lib/chess/pgn';
import type { PromoPiece } from '../lib/chess/pieceAssets';
import {
  chaseSentryRating,
  eloToSkill,
  livePerformanceRating,
  ratingGapToHari,
  settleMatchRating,
  skillToElo,
} from '../lib/chess/rating';
import { sanitizeText } from '../lib/chess/sanitize';
import { StockfishEngine, uciToFromTo } from '../lib/chess/stockfishWorker';

export type TimePresetId = '3+2' | '5|0' | '10|0';
export type ColorChoice = 'w' | 'b' | 'random';

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
export type EndReason = 'checkmate' | 'timeout' | 'resign' | 'forfeit' | 'draw' | 'stalemate';
export type PendingPromotion = { from: Square; to: Square };

type Side = 'w' | 'b';

export const useChessArena = () => {
  const [stats, setStats] = useState<ChessStats>(() => {
    if (typeof window === 'undefined') return { ...EMPTY_CHESS_STATS };
    return readChessStats();
  });
  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [preset, setPreset] = useState<TimePresetId>('5|0');
  const [colorChoice, setColorChoice] = useState<ColorChoice>('w');
  const [visitorIsWhite, setVisitorIsWhite] = useState(true);
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
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  /** Live performance rating inside the current match (null until enough moves). */
  const [matchRating, setMatchRating] = useState<number | null>(null);
  const [matchBotElo, setMatchBotElo] = useState(() => skillToElo(stats.skillLevel));
  const [movesSan, setMovesSan] = useState<string[]>([]);
  const [freshUnlock, setFreshUnlock] = useState<ChessUnlock | null>(null);
  const matchRatingRef = useRef<number | null>(null);
  const matchBotEloRef = useRef(matchBotElo);

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
  const visitorIsWhiteRef = useRef(visitorIsWhite);
  const bgTimerRef = useRef<number | null>(null);
  const plyRef = useRef(0);
  const skillRef = useRef(stats.skillLevel);
  const presetRef = useRef(preset);

  useEffect(() => {
    visitorClockRef.current = visitorClockMs;
  }, [visitorClockMs]);
  useEffect(() => {
    sentryClockRef.current = sentryClockMs;
  }, [sentryClockMs]);
  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);
  useEffect(() => {
    visitorIsWhiteRef.current = visitorIsWhite;
  }, [visitorIsWhite]);
  useEffect(() => {
    presetRef.current = preset;
  }, [preset]);
  useEffect(() => {
    matchBotEloRef.current = matchBotElo;
  }, [matchBotElo]);

  const banterModeRef = useRef<'llm' | 'fallback'>('llm');
  const fallbackNoticeSentRef = useRef(false);

  useEffect(() => {
    banterModeRef.current = banterMode;
  }, [banterMode]);

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

  const applyUnlocks = useCallback(
    (base: ChessStats, matchPlies: number, visitorEloForUnlock: number) => {
      const earned = unlocksEarned({
        visitorElo: visitorEloForUnlock,
        gamesPlayed: base.gamesPlayed,
        userWins: base.userWins,
        matchPlies,
        already: base.unlockedIds,
      });
      if (earned.length === 0) return base;
      const nextIds = [...base.unlockedIds, ...earned.map((u) => u.id)];
      setFreshUnlock(earned[earned.length - 1]!);
      announce(`Unlocked: ${earned.map((u) => u.title).join(', ')}`);
      for (const u of earned) {
        pushChat('system', `Unlocked · ${u.title}: ${u.body}`);
      }
      return { ...base, unlockedIds: nextIds };
    },
    [announce, pushChat],
  );

  /** Raise live Sentry strength when the visitor’s performance climbs. */
  const chaseSentryLive = useCallback(async (visitorLive: number, previousVisitorLive?: number) => {
    const prevBot = matchBotEloRef.current;
    const next = chaseSentryRating(visitorLive, prevBot, previousVisitorLive);
    if (next <= prevBot) return;
    matchBotEloRef.current = next;
    setMatchBotElo(next);
    const skill = eloToSkill(next);
    skillRef.current = Math.max(skillRef.current, skill);
    try {
      await engineRef.current?.setSkill(skill, next);
      pushChat('system', `${AGENT_NAME} adjusted to ${next} Elo — keeping pace with you.`);
      announce(`${AGENT_NAME} raised to ${next} Elo.`);
    } catch {
      /* keep UI rating even if engine option fails */
    }
  }, [announce, pushChat]);

  /** Score the visitor's last move, update live Elo, then raise Sentry before they reply. */
  const scoreVisitorAndChase = useCallback(async () => {
    const engine = engineRef.current;
    const g = gameRef.current;
    if (!engine || !activeRef.current) return;

    const evalBefore = lastEvalRef.current;
    const previousLive = matchRatingRef.current ?? readChessStats().visitorElo;
    try {
      const ev = await engine.evaluate(g.fen(), 10);
      const pawns = ev.scoreCp / 100;
      const moverIsWhite = visitorIsWhiteRef.current;
      const cpl = estimateMoveCpl(evalBefore, pawns, moverIsWhite);
      cplSamplesRef.current.push(cpl);
      lastEvalRef.current = pawns;
      setEvalPawns(pawns);

      const meanCpl =
        cplSamplesRef.current.reduce((a, b) => a + b, 0) / cplSamplesRef.current.length;
      // Anchor live perf to settled rating + samples so early noise doesn't pin to bot Elo.
      const settled = readChessStats().visitorElo;
      const vsBot = livePerformanceRating(meanCpl, matchBotEloRef.current);
      const live = Math.round(settled * 0.35 + vsBot * 0.65);
      matchRatingRef.current = live;
      setMatchRating(live);
      await chaseSentryLive(live, previousLive);
    } catch {
      // Still nudge Sentry if the visitor is clearly outperforming their settled rating.
      const peak = Math.max(previousLive, readChessStats().visitorElo);
      await chaseSentryLive(peak, previousLive);
    }
  }, [chaseSentryLive]);

  const enterFallbackBanter = useCallback(
    (event: BanterEvent, salt: number) => {
      const wasLive = banterModeRef.current === 'llm';
      setBanterMode('fallback');
      banterModeRef.current = 'fallback';
      if (wasLive || !fallbackNoticeSentRef.current) {
        fallbackNoticeSentRef.current = true;
        pushChat('system', FALLBACK_MODE_NOTICE);
        announce('Live banter offline. Using Sentry prefilled persona lines.');
      }
      pushChat('sentry', pickPrefab(event, salt));
    },
    [announce, pushChat],
  );

  const requestBanter = useCallback(
    async (event: BanterEvent, extra?: { userMessage?: string; lastMove?: string }) => {
      const salt = plyRef.current + Date.now();

      if (banterModeRef.current === 'fallback') {
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
          enterFallbackBanter(event, salt);
          return;
        }
        pushChat('sentry', data.text);
      } catch {
        enterFallbackBanter(event, salt);
      }
    },
    [enterFallbackBanter, pushChat],
  );

  const endGame = useCallback(
    async (reason: EndReason, gameResult: '1-0' | '0-1' | '1/2-1/2') => {
      if (endingRef.current || !activeRef.current) return;
      endingRef.current = true;
      activeRef.current = false;
      setPendingPromotion(null);
      setPhase('ended');
      setEndReason(reason);
      setResult(gameResult);
      setThinking(false);

      const viw = visitorIsWhiteRef.current;
      const visitorWon = (gameResult === '1-0' && viw) || (gameResult === '0-1' && !viw);
      const sentryWon = (gameResult === '0-1' && viw) || (gameResult === '1-0' && !viw);
      const draw = gameResult === '1/2-1/2';

      const meanCpl =
        cplSamplesRef.current.length > 0
          ? cplSamplesRef.current.reduce((a, b) => a + b, 0) / cplSamplesRef.current.length
          : 80;

      const current = readChessStats();
      const oppElo = matchBotEloRef.current;
      const score: 0 | 0.5 | 1 = visitorWon ? 1 : draw ? 0.5 : 0;
      const perf =
        matchRatingRef.current ??
        (cplSamplesRef.current.length > 0 ? livePerformanceRating(meanCpl, oppElo) : oppElo);
      const nextElo = settleMatchRating(perf, oppElo, score);
      setMatchRating(nextElo);
      matchRatingRef.current = nextElo;
      const nextSkill = nextSkillLevel({
        currentSkill: skillRef.current,
        meanCpl,
        result: visitorWon ? 'win' : draw ? 'draw' : 'loss',
      });

      const pgn = buildPgn({
        visitorIsWhite: viw,
        result: gameResult,
        timeControl: TIME_PRESETS[presetRef.current].pgn,
        movesSan: movesSanRef.current,
      });

      let nextStats: ChessStats = {
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
      nextStats = applyUnlocks(nextStats, movesSanRef.current.length, nextElo);
      persistStats(nextStats);

      const banterEvent: BanterEvent =
        reason === 'forfeit'
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
    [announce, applyUnlocks, persistStats, requestBanter],
  );

  // Clock: tick the side whose turn it is
  useEffect(() => {
    if (phase !== 'playing' || pendingPromotion) return;
    const id = window.setInterval(() => {
      if (!activeRef.current) return;
      const viw = visitorIsWhiteRef.current;
      const visitorToMove = turnRef.current === (viw ? 'w' : 'b');
      if (visitorToMove) {
        setVisitorClockMs((ms) => {
          const next = ms - 100;
          if (next <= 0) {
            void endGame('timeout', viw ? '0-1' : '1-0');
            return 0;
          }
          return next;
        });
      } else {
        setSentryClockMs((ms) => {
          const next = ms - 100;
          if (next <= 0) {
            void endGame('timeout', viw ? '1-0' : '0-1');
            return 0;
          }
          return next;
        });
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, pendingPromotion, endGame]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const forfeit = () => {
      void endGame('forfeit', visitorIsWhiteRef.current ? '0-1' : '1-0');
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

  const playEngineMove = useCallback(async () => {
    const g = gameRef.current;
    const engine = engineRef.current;
    const viw = visitorIsWhiteRef.current;
    if (!engine || !activeRef.current) return;

    setThinking(true);
    try {
      // Re-assert live strength so the reply uses the chased Elo (not a stale skill).
      await engine.setSkill(skillRef.current, matchBotEloRef.current);

      const thinkMs = Math.min(2000, Math.max(200, sentryClockRef.current / 20));
      const { bestMove } = await engine.getBestMove(g.fen(), thinkMs);
      const parsed = uciToFromTo(bestMove);
      if (!parsed || !activeRef.current) return;

      const move = g.move({
        from: parsed.from,
        to: parsed.to,
        promotion: (parsed.promotion as PromoPiece) || 'q',
      });
      if (!move) return;

      movesSanRef.current.push(move.san);
      setMovesSan([...movesSanRef.current]);
      setLastMove({ from: move.from, to: move.to });
      syncBoard();
      announce(`${AGENT_NAME} played ${move.san}`);

      const inc = TIME_PRESETS[presetRef.current].incrementMs;
      if (inc) setSentryClockMs((ms) => ms + inc);

      try {
        const ev = await engine.evaluate(g.fen(), 10);
        const pawns = ev.scoreCp / 100;
        lastEvalRef.current = pawns;
        setEvalPawns(pawns);

        const mid = readChessStats();
        const withUnlocks = applyUnlocks(
          { ...mid, visitorElo: matchRatingRef.current ?? mid.visitorElo },
          movesSanRef.current.length,
          matchRatingRef.current ?? mid.visitorElo,
        );
        if (withUnlocks.unlockedIds.length !== mid.unlockedIds.length) {
          persistStats({ ...withUnlocks, visitorElo: mid.visitorElo });
        }

        const event = eventFromAnalysis({
          ply: plyRef.current,
          visitorCpl:
            cplSamplesRef.current.length > 0
              ? cplSamplesRef.current[cplSamplesRef.current.length - 1]!
              : 50,
          evalPawns: pawns,
          visitorIsWhite: viw,
          inCheck: g.inCheck(),
          visitorClockMs: visitorClockRef.current,
          pieceCount: g.board().flat().filter(Boolean).length,
        });
        void requestBanter(event, { lastMove: move.san });
      } catch {
        void requestBanter('iMoved', { lastMove: move.san });
      }

      if (g.isCheckmate()) {
        await endGame('checkmate', viw ? '0-1' : '1-0');
      } else if (g.isDraw() || g.isStalemate()) {
        await endGame(g.isStalemate() ? 'stalemate' : 'draw', '1/2-1/2');
      }
    } catch {
      pushChat('system', `${AGENT_NAME} hiccup — try again or refresh.`);
    } finally {
      setThinking(false);
    }
  }, [announce, applyUnlocks, endGame, persistStats, pushChat, requestBanter, syncBoard]);

  const afterVisitorMove = useCallback(
    async (san: string) => {
      movesSanRef.current.push(san);
      setMovesSan([...movesSanRef.current]);
      const g = gameRef.current;
      const viw = visitorIsWhiteRef.current;
      syncBoard();
      announce(`You played ${san}`);

      // Mid-match unlocks from ply count (e.g. college captain).
      const mid = readChessStats();
      const withUnlocks = applyUnlocks(mid, movesSanRef.current.length, matchRatingRef.current ?? mid.visitorElo);
      if (withUnlocks.unlockedIds.length !== mid.unlockedIds.length) {
        persistStats(withUnlocks);
      }

      if (g.isCheckmate()) {
        await endGame('checkmate', viw ? '1-0' : '0-1');
        return;
      }
      if (g.isDraw() || g.isStalemate()) {
        await endGame(g.isStalemate() ? 'stalemate' : 'draw', '1/2-1/2');
        return;
      }

      const inc = TIME_PRESETS[presetRef.current].incrementMs;
      if (inc) setVisitorClockMs((ms) => ms + inc);

      // Adapt Sentry to this match's live visitor rating BEFORE the reply.
      await scoreVisitorAndChase();
      await playEngineMove();
    },
    [announce, applyUnlocks, endGame, persistStats, playEngineMove, scoreVisitorAndChase, syncBoard],
  );

  const commitVisitorMove = useCallback(
    (from: Square, to: Square, promotion?: PromoPiece) => {
      if (phase !== 'playing' || thinking) return false;
      // Block other moves while a promotion is open, unless we are resolving it
      if (pendingPromotion && !promotion) return false;
      const viw = visitorIsWhiteRef.current;
      if (gameRef.current.turn() !== (viw ? 'w' : 'b')) return false;

      const move = gameRef.current.move({
        from,
        to,
        ...(promotion ? { promotion } : {}),
      });
      if (!move) return false;

      setPendingPromotion(null);
      setSelected(null);
      setLegalTargets([]);
      setLastMove({ from: move.from, to: move.to });
      void afterVisitorMove(move.san);
      return true;
    },
    [afterVisitorMove, pendingPromotion, phase, thinking],
  );

  const onSquareClick = useCallback(
    (sq: Square) => {
      setCursorSquare(sq);
      if (phase !== 'playing' || thinking || pendingPromotion) return;
      const g = gameRef.current;
      const viw = visitorIsWhiteRef.current;
      if (g.turn() !== (viw ? 'w' : 'b')) return;

      if (selected) {
        if (selected === sq) {
          setSelected(null);
          setLegalTargets([]);
          return;
        }
        if (legalTargets.includes(sq)) {
          const piece = g.get(selected);
          const needsPromo =
            piece?.type === 'p' &&
            ((piece.color === 'w' && sq[1] === '8') || (piece.color === 'b' && sq[1] === '1'));
          if (needsPromo) {
            setPendingPromotion({ from: selected, to: sq });
            setSelected(null);
            setLegalTargets([]);
            announce('Choose a promotion piece');
            return;
          }
          commitVisitorMove(selected, sq);
          return;
        }
      }

      const piece = g.get(sq);
      if (piece && piece.color === (viw ? 'w' : 'b')) {
        setSelected(sq);
        setLegalTargets(g.moves({ square: sq, verbose: true }).map((m) => m.to));
      } else {
        setSelected(null);
        setLegalTargets([]);
      }
    },
    [announce, commitVisitorMove, legalTargets, pendingPromotion, phase, selected, thinking],
  );

  const resolvePromotion = useCallback(
    (piece: PromoPiece) => {
      if (!pendingPromotion) return;
      commitVisitorMove(pendingPromotion.from, pendingPromotion.to, piece);
    },
    [commitVisitorMove, pendingPromotion],
  );

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    announce('Promotion cancelled');
  }, [announce]);

  const startGame = useCallback(async () => {
    endingRef.current = false;
    activeRef.current = true;

    const resolvedWhite =
      colorChoice === 'random' ? Math.random() < 0.5 : colorChoice === 'w';
    setVisitorIsWhite(resolvedWhite);
    visitorIsWhiteRef.current = resolvedWhite;

    gameRef.current = new Chess();
    movesSanRef.current = [];
    setMovesSan([]);
    cplSamplesRef.current = [];
    lastEvalRef.current = 0;
    plyRef.current = 0;
    const p = TIME_PRESETS[preset];
    setVisitorClockMs(p.initialMs);
    setSentryClockMs(p.initialMs);
    setSelected(null);
    setLegalTargets([]);
    setLastMove(null);
    setPendingPromotion(null);
    setEndReason(null);
    setResult(null);
    setEvalPawns(0);
    setChat([]);
    setFreshUnlock(null);
    setBanterMode('llm');
    banterModeRef.current = 'llm';
    fallbackNoticeSentRef.current = false;
    // Start at least a margin above settled visitor Elo so Sentry stays the hunter.
    const botElo = chaseSentryRating(stats.visitorElo, skillToElo(skillRef.current));
    matchBotEloRef.current = botElo;
    setMatchBotElo(botElo);
    skillRef.current = Math.max(skillRef.current, eloToSkill(botElo));
    setMatchRating(null);
    matchRatingRef.current = null;
    setCursorSquare(resolvedWhite ? 'e2' : 'e7');
    setPhase('playing');
    syncBoard();

    const sideLabel = resolvedWhite ? 'White' : 'Black';
    announce(`Game started. You play ${sideLabel}. Timed only — leaving forfeits.`);
    pushChat(
      'system',
      `HARI.OS · Chess Arena online. You are ${sideLabel}. Playing ${AGENT_NAME} — a chess bot by Harieshwar.`,
    );
    void requestBanter('opening');

    if (!engineRef.current) engineRef.current = new StockfishEngine();
    try {
      await engineRef.current.init();
      await engineRef.current.setSkill(skillRef.current, botElo);
      setEngineReady(true);
      // If visitor is Black, Sentry (White) moves first
      if (!resolvedWhite) {
        await playEngineMove();
      }
    } catch {
      setEngineReady(false);
      pushChat('system', `${AGENT_NAME} failed to start. Refresh and try again.`);
      activeRef.current = false;
      setPhase('lobby');
    }
  }, [announce, colorChoice, playEngineMove, preset, pushChat, requestBanter, stats.visitorElo, syncBoard]);

  const resign = useCallback(() => {
    void endGame('resign', visitorIsWhiteRef.current ? '0-1' : '1-0');
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

      if (phase === 'playing' && isDrawRequest(clean)) {
        const salt = plyRef.current + Date.now();
        pushChat('sentry', pickPrefab('drawAskJoke', salt));

        const g = gameRef.current;
        const claim = evaluateDrawOffer({
          isThreefoldRepetition: g.isThreefoldRepetition(),
          isDrawByFiftyMoves: g.isDrawByFiftyMoves(),
          isInsufficientMaterial: g.isInsufficientMaterial(),
          isStalemate: g.isStalemate(),
          absEvalPawns: Number.isFinite(lastEvalRef.current)
            ? Math.abs(lastEvalRef.current)
            : undefined,
          ply: plyRef.current,
        });

        window.setTimeout(() => {
          if (!activeRef.current) return;
          if (claim.accept) {
            pushChat('sentry', pickPrefab('drawAccept', salt + 1));
            announce(`Draw agreed (${claim.reason}).`);
            void endGame('draw', '1/2-1/2');
          } else {
            pushChat('sentry', pickPrefab('drawDecline', salt + 2));
            announce('Draw declined. Play on.');
          }
        }, 700);
        return;
      }

      void requestBanter('idle', { userMessage: clean });
    },
    [announce, endGame, phase, pushChat, requestBanter],
  );

  const requestDraw = useCallback(() => {
    sendUserChat('draw');
  }, [sendUserChat]);

  useEffect(() => () => engineRef.current?.dispose(), []);

  const boardSquares = useMemo(() => {
    const g = new Chess(fen);
    const rows: Array<Array<{ square: Square; pieceLabel: string; isDark: boolean }>> = [];
    for (let rank = 7; rank >= 0; rank--) {
      const row = [];
      for (let file = 0; file < 8; file++) {
        const square = `${'abcdefgh'[file]}${rank + 1}` as Square;
        const p = g.get(square);
        row.push({
          square,
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
      if (phase !== 'playing' || pendingPromotion) return;
      const files = 'abcdefgh';
      const file = files.indexOf(cursorSquare[0]);
      const rank = Number(cursorSquare[1]) - 1;
      let nf = file;
      let nr = rank;
      const flip = !visitorIsWhiteRef.current;
      if (e.key === 'ArrowLeft') nf = flip ? Math.min(7, file + 1) : Math.max(0, file - 1);
      if (e.key === 'ArrowRight') nf = flip ? Math.max(0, file - 1) : Math.min(7, file + 1);
      if (e.key === 'ArrowUp') nr = flip ? Math.max(0, rank - 1) : Math.min(7, rank + 1);
      if (e.key === 'ArrowDown') nr = flip ? Math.min(7, rank + 1) : Math.max(0, rank - 1);
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
    [announce, cursorSquare, onSquareClick, pendingPromotion, phase],
  );

  const visitorToMove = turn === (visitorIsWhite ? 'w' : 'b');
  const turnLabel = visitorToMove
    ? thinking
      ? `${AGENT_NAME} thinking…`
      : 'Your move'
    : thinking
      ? `${AGENT_NAME} thinking…`
      : `${AGENT_NAME} to move`;

  const displayVisitorElo = matchRating ?? stats.visitorElo;
  const effectiveSentryElo =
    phase === 'playing' || phase === 'ended' ? matchBotElo : skillToElo(stats.skillLevel);
  const latestInteraction = chat.length > 0 ? chat[chat.length - 1]! : null;

  return {
    stats,
    phase,
    preset,
    setPreset,
    colorChoice,
    setColorChoice,
    visitorIsWhite,
    boardSquares,
    selected,
    legalTargets,
    lastMove,
    visitorClockMs,
    sentryClockMs,
    turn,
    turnLabel,
    chat,
    latestInteraction,
    banterMode,
    engineReady,
    thinking,
    endReason,
    result,
    liveRegion,
    evalPawns,
    cursorSquare,
    pendingPromotion,
    resolvePromotion,
    cancelPromotion,
    matchRating,
    matchBotElo,
    movesSan,
    freshUnlock,
    arenaLevel: chessLevelFor({
      visitorElo: displayVisitorElo,
      gamesPlayed: stats.gamesPlayed,
      userWins: stats.userWins,
    }),
    gapToHari: ratingGapToHari(displayVisitorElo),
    /** Rating shown for the user: live match rating when available, else last settled. */
    displayVisitorElo,
    effectiveSentryElo,
    humanAnchor: HUMAN_RATING_ANCHOR,
    lichessUrl: LICHESS_URL,
    sideToMove: turn,
    inCheck: (() => {
      try {
        return new Chess(fen).inCheck();
      } catch {
        return false;
      }
    })(),
    startGame,
    resign,
    requestDraw,
    onSquareClick,
    onKeyDown,
    exportLatestPgn,
    sendUserChat,
    backToLobby: () => {
      setPendingPromotion(null);
      setFreshUnlock(null);
      setPhase('lobby');
    },
  };
};
