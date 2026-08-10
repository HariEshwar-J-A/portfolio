import React, { useEffect } from 'react';
import { Crown, Download, Flag, Handshake, Swords } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { glassPanel } from '../SectionShell';
import { AGENT_NAME, HUMAN_NAME, HUMAN_RATING_ANCHOR, chessProcessLabel } from '../../data/osIdentity';
import { PIECE_SET_CREDIT } from '../../lib/chess/pieceAssets';
import { TIME_PRESETS, useChessArena, type ColorChoice } from '../../hooks/useChessArena';
import ChessBoard from './chess/ChessBoard';
import ChessClocks from './chess/ChessClocks';
import ChessBanterToast from './chess/ChessBanterToast';
import ChessMoveList from './chess/ChessMoveList';
import ChessProgress from './chess/ChessProgress';
import PromotionOverlay from './chess/PromotionOverlay';
import { GameOverPanel, PlayRealHariCta } from './chess/GameOverPanel';

const COLOR_OPTIONS: { id: ColorChoice; label: string }[] = [
  { id: 'w', label: 'White' },
  { id: 'b', label: 'Black' },
  { id: 'random', label: 'Random' },
];

interface ChessArenaProps {
  /** True while a timed match is actively being played (not lobby / ended). */
  onMatchActiveChange?: (active: boolean) => void;
}

/**
 * Chess Arena — timed duel vs Sentry, a chess bot by Harieshwar.
 * Pieces: free cburnett set (CC BY-SA 3.0 / GPL).
 */
const ChessArena: React.FC<ChessArenaProps> = ({ onMatchActiveChange }) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const arena = useChessArena();
  const inPlay = arena.phase === 'playing' || arena.phase === 'ended';
  const matchActive = arena.phase === 'playing';

  useEffect(() => {
    onMatchActiveChange?.(matchActive);
    return () => onMatchActiveChange?.(false);
  }, [matchActive, onMatchActiveChange]);

  // Native tab-close / refresh prompt while a match is live.
  useEffect(() => {
    if (!matchActive) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [matchActive]);

  return (
    <div className={`${glassPanel(isDark)} relative overflow-hidden p-3 md:p-5`}>
      {!inPlay && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p
              className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.2em]"
              style={{ color: 'var(--os-primary)' }}
            >
              <Swords size={13} />
              Chess Arena
            </p>
            <p className={`mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {chessProcessLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 font-mono text-[11px]">
            <span>
              You <strong style={{ color: 'var(--os-accent)' }}>{arena.stats.visitorElo}</strong>
            </span>
            <span className="opacity-30">·</span>
            <span>
              {AGENT_NAME} <strong style={{ color: 'var(--os-primary)' }}>{arena.effectiveSentryElo}</strong>
            </span>
            <span className="opacity-30">·</span>
            <span>
              {arena.stats.userWins}–{arena.stats.sentryWins}
            </span>
          </div>
        </div>
      )}

      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {arena.liveRegion}
      </div>

      {arena.phase === 'lobby' && (
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h3 className="flex items-center gap-2 text-2xl font-black">
              <Crown size={22} style={{ color: 'var(--os-primary)' }} />
              Challenge {AGENT_NAME}
            </h3>
            <p className={`mt-3 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Timed games only against <strong>{AGENT_NAME}</strong> — a chess bot by Harieshwar. Pick your color;
              {AGENT_NAME} starts at 2000 Elo and gains +100 only when you beat it (cap ~{HUMAN_RATING_ANCHOR}).
              Leaving the page forfeits.
            </p>

            <div
              className="mt-5 grid grid-cols-2 gap-3 rounded-xl border p-3 font-mono"
              style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 30%, transparent)' }}
              aria-label="Ratings"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">Your rating</p>
                <p className="mt-1 text-2xl font-black tabular-nums" style={{ color: 'var(--os-accent)' }}>
                  {arena.stats.visitorElo}
                  <span className="ml-1 text-xs font-bold opacity-50">Elo</span>
                </p>
                <p className="mt-0.5 text-[10px] opacity-50">
                  {arena.stats.gamesPlayed === 0
                    ? 'Set live from how you play this match'
                    : `Last match settled · ${arena.stats.gamesPlayed} games`}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">{AGENT_NAME} (next match)</p>
                <p className="mt-1 text-2xl font-black tabular-nums" style={{ color: 'var(--os-primary)' }}>
                  {arena.effectiveSentryElo}
                  <span className="ml-1 text-xs font-bold opacity-50">Elo</span>
                </p>
                <p className="mt-0.5 text-[10px] opacity-50">Starts at 2000 · +100 when you win</p>
              </div>
            </div>

            <fieldset className="mt-6">
              <legend className="font-mono text-[10px] font-black uppercase tracking-[0.25em] opacity-70">
                Your color
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => arena.setColorChoice(opt.id)}
                    className="rounded-xl border px-4 py-2 text-sm font-bold transition"
                    style={{
                      borderColor:
                        arena.colorChoice === opt.id
                          ? 'var(--os-primary)'
                          : 'color-mix(in srgb, var(--os-primary) 25%, transparent)',
                      backgroundColor:
                        arena.colorChoice === opt.id
                          ? 'color-mix(in srgb, var(--os-primary) 20%, transparent)'
                          : 'transparent',
                    }}
                    aria-pressed={arena.colorChoice === opt.id}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-5">
              <legend className="font-mono text-[10px] font-black uppercase tracking-[0.25em] opacity-70">
                Time control
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(TIME_PRESETS) as Array<keyof typeof TIME_PRESETS>).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => arena.setPreset(id)}
                    className="rounded-xl border px-4 py-2 text-sm font-bold transition"
                    style={{
                      borderColor:
                        arena.preset === id
                          ? 'var(--os-primary)'
                          : 'color-mix(in srgb, var(--os-primary) 25%, transparent)',
                      backgroundColor:
                        arena.preset === id
                          ? 'color-mix(in srgb, var(--os-primary) 20%, transparent)'
                          : 'transparent',
                    }}
                    aria-pressed={arena.preset === id}
                  >
                    {TIME_PRESETS[id].label}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={() => void arena.startGame()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--os-primary)' }}
            >
              <Swords size={16} />
              Start timed game
            </button>

            {arena.stats.recentPgns.length > 0 && (
              <button
                type="button"
                onClick={arena.exportLatestPgn}
                className={`ml-3 mt-6 inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold ${
                  isDark ? 'border-white/20' : 'border-slate-300'
                }`}
              >
                <Download size={16} /> Export last PGN
              </button>
            )}

            <ul className={`mt-5 space-y-1.5 font-mono text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <li>
                ▸ Score You {arena.stats.userWins} – {AGENT_NAME} {arena.stats.sentryWins}
                {arena.stats.draws > 0 ? ` · Draws ${arena.stats.draws}` : ''}
              </li>
              <li>
                ▸ Gap to {HUMAN_NAME}: {arena.gapToHari} Elo · challenge HariEshwar on Lichess
              </li>
              <li>▸ {PIECE_SET_CREDIT}</li>
            </ul>
          </div>
          <div className="space-y-4">
            <ChessProgress
              visitorElo={arena.displayVisitorElo}
              sentryElo={arena.effectiveSentryElo}
              gamesPlayed={arena.stats.gamesPlayed}
              userWins={arena.stats.userWins}
              unlockedIds={arena.stats.unlockedIds}
              freshUnlock={arena.freshUnlock}
              isDark={isDark}
            />
            <PlayRealHariCta isDark={isDark} />
          </div>
        </div>
      )}

      {inPlay && (
        <div className="mt-1 grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(11rem,15rem)] xl:grid-cols-[minmax(0,1fr)_minmax(13rem,17rem)]">
          {/* Board column — take the space */}
          <div className="relative mx-auto w-full max-w-[min(96vw,40rem)] space-y-1.5 lg:mx-0 lg:max-w-none">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
              <span className="opacity-60">
                {arena.visitorIsWhite ? 'White' : 'Black'} vs {AGENT_NAME}
                <span className="mx-1.5 opacity-30">·</span>
                You {arena.displayVisitorElo}
                <span className="mx-1 opacity-30">/</span>
                {AGENT_NAME} {arena.effectiveSentryElo}
              </span>
              {arena.phase === 'playing' && (
                <span className="opacity-70" aria-live="polite">
                  {arena.inCheck ? <span className="font-bold text-red-500">Check! </span> : null}
                  {arena.turnLabel}
                  {arena.thinking ? '…' : ''}
                </span>
              )}
            </div>

            <ChessClocks
              which="sentry"
              visitorMs={arena.visitorClockMs}
              sentryMs={arena.sentryClockMs}
              turn={arena.turn}
              visitorIsWhite={arena.visitorIsWhite}
              visitorRating={arena.displayVisitorElo}
              sentryRating={arena.effectiveSentryElo}
            />

            <div className="relative">
              <ChessBoard
                squares={arena.boardSquares}
                selected={arena.selected}
                legalTargets={arena.legalTargets}
                lastMove={arena.lastMove}
                cursorSquare={arena.cursorSquare}
                inCheck={arena.inCheck}
                sideToMove={arena.sideToMove}
                turnLabel={arena.turnLabel}
                flipped={!arena.visitorIsWhite}
                onSquareClick={arena.onSquareClick}
                onKeyDown={arena.onKeyDown}
              />
              {arena.pendingPromotion && (
                <PromotionOverlay
                  color={arena.visitorIsWhite ? 'w' : 'b'}
                  onChoose={arena.resolvePromotion}
                  onCancel={arena.cancelPromotion}
                />
              )}
            </div>

            <ChessClocks
              which="visitor"
              visitorMs={arena.visitorClockMs}
              sentryMs={arena.sentryClockMs}
              turn={arena.turn}
              visitorIsWhite={arena.visitorIsWhite}
              visitorRating={arena.displayVisitorElo}
              sentryRating={arena.effectiveSentryElo}
            />

            {arena.phase === 'playing' && (
              <div className="flex flex-wrap justify-end gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={arena.requestDraw}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold ${
                    isDark ? 'border-white/20' : 'border-slate-300'
                  }`}
                >
                  <Handshake size={11} /> Draw
                </button>
                <button
                  type="button"
                  onClick={arena.resign}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold ${
                    isDark ? 'border-white/20' : 'border-slate-300'
                  }`}
                >
                  <Flag size={11} /> Resign
                </button>
              </div>
            )}
          </div>

          {/* Sidebar: moves + toast (or game over) */}
          <div className="flex min-h-0 flex-col gap-2 lg:min-h-[28rem]">
            {arena.phase === 'ended' ? (
              <GameOverPanel
                result={arena.result}
                endReason={arena.endReason}
                visitorElo={arena.displayVisitorElo}
                sentryElo={arena.effectiveSentryElo}
                canExport={arena.stats.recentPgns.length > 0}
                onExport={arena.exportLatestPgn}
                onRematch={() => void arena.startGame()}
                onLobby={arena.backToLobby}
                isDark={isDark}
              />
            ) : (
              <>
                <div className="min-h-0 flex-1">
                  <ChessMoveList movesSan={arena.movesSan} isDark={isDark} tall />
                </div>
                <ChessBanterToast latest={arena.latestInteraction} isDark={isDark} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessArena;
