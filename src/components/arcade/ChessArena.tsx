import React from 'react';
import { Crown, Download, Flag, Swords } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { glassPanel } from '../SectionShell';
import { AGENT_NAME, HUMAN_RATING_ANCHOR, OS_NAME, chessProcessLabel } from '../../data/osIdentity';
import { TIME_PRESETS, useChessArena } from '../../hooks/useChessArena';
import ChessBoard from './chess/ChessBoard';
import ChessClocks from './chess/ChessClocks';
import ChessChat from './chess/ChessChat';
import { GameOverPanel, PlayRealHariCta } from './chess/GameOverPanel';

/**
 * Chess Arena — timed HARI.OS process managed by Sentry (WASM Stockfish + banter).
 */
const ChessArena: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const arena = useChessArena();

  const turnLabel =
    arena.turn === 'w'
      ? arena.thinking
        ? `${AGENT_NAME} thinking (Black)`
        : 'White to move'
      : `${AGENT_NAME} to move (Black)`;

  return (
    <div className={`${glassPanel(isDark)} relative overflow-hidden p-4 md:p-8`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.25em]"
            style={{ color: 'var(--os-primary)' }}
          >
            <Swords size={15} />
            Chess Arena
          </p>
          <p className={`mt-1 font-mono text-[10px] uppercase tracking-[0.18em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {chessProcessLabel}
          </p>
        </div>
        <div className="font-mono text-xs" aria-live="polite">
          <span className="opacity-60">Score </span>
          <strong>You {arena.stats.userWins}</strong>
          <span className="mx-1 opacity-40">·</span>
          <strong>
            {AGENT_NAME} {arena.stats.sentryWins}
          </strong>
          {arena.stats.draws > 0 && (
            <>
              <span className="mx-1 opacity-40">·</span>
              <span className="opacity-70">Draws {arena.stats.draws}</span>
            </>
          )}
        </div>
      </div>

      {/* Screen reader live region */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {arena.liveRegion}
      </div>

      {arena.phase === 'lobby' && (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h3 className="flex items-center gap-2 text-2xl font-black">
              <Crown size={22} style={{ color: 'var(--os-primary)' }} />
              Challenge {AGENT_NAME}
            </h3>
            <p className={`mt-3 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Timed games only. {AGENT_NAME} starts easy and adapts after each game so you stay challenged —
              not crushed. Closing or leaving this page forfeits to {AGENT_NAME}. Your rating vs this process is
              local (~{arena.stats.visitorElo}); real {OS_NAME.split('.')[0]} on Lichess is ~{HUMAN_RATING_ANCHOR}.
            </p>

            <fieldset className="mt-6">
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
                ▸ {AGENT_NAME} skill ~{arena.stats.skillLevel}/20 (≈{arena.effectiveSentryElo} Elo)
              </li>
              <li>▸ Games played {arena.stats.gamesPlayed}</li>
              <li>▸ Banter uses LLM when available; otherwise prefab voice from live eval</li>
            </ul>
          </div>
          <PlayRealHariCta isDark={isDark} />
        </div>
      )}

      {(arena.phase === 'playing' || arena.phase === 'ended') && (
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,36rem)_1fr]">
          <div className="space-y-4">
            <ChessClocks
              visitorMs={arena.visitorClockMs}
              sentryMs={arena.sentryClockMs}
              turn={arena.turn}
            />
            <ChessBoard
              squares={arena.boardSquares}
              selected={arena.selected}
              legalTargets={arena.legalTargets}
              lastMove={arena.lastMove}
              cursorSquare={arena.cursorSquare}
              inCheck={arena.inCheck}
              turnLabel={turnLabel}
              onSquareClick={arena.onSquareClick}
              onKeyDown={arena.onKeyDown}
              isDarkTheme={isDark}
            />
            {arena.phase === 'playing' && (
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-mono text-xs opacity-70" aria-live="polite">
                  {turnLabel}
                  {arena.thinking ? '…' : ''}
                  {arena.evalPawns !== 0 && (
                    <span className="ml-2">
                      eval {arena.evalPawns > 0 ? '+' : ''}
                      {arena.evalPawns.toFixed(1)}
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={arena.resign}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold ${
                    isDark ? 'border-white/20' : 'border-slate-300'
                  }`}
                >
                  <Flag size={12} /> Resign
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {arena.phase === 'ended' ? (
              <GameOverPanel
                result={arena.result}
                endReason={arena.endReason}
                visitorElo={arena.stats.visitorElo}
                sentryElo={arena.effectiveSentryElo}
                canExport={arena.stats.recentPgns.length > 0}
                onExport={arena.exportLatestPgn}
                onRematch={() => void arena.startGame()}
                onLobby={arena.backToLobby}
                isDark={isDark}
              />
            ) : (
              <ChessChat
                lines={arena.chat}
                banterMode={arena.banterMode}
                onSend={arena.sendUserChat}
                isDark={isDark}
              />
            )}
            {arena.phase === 'playing' && <PlayRealHariCta isDark={isDark} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessArena;
