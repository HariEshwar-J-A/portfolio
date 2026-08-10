import React from 'react';
import { Crown, Download, Flag, Swords } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { glassPanel } from '../SectionShell';
import { AGENT_NAME, HUMAN_RATING_ANCHOR, chessProcessLabel } from '../../data/osIdentity';
import { PIECE_SET_CREDIT } from '../../lib/chess/pieceAssets';
import { TIME_PRESETS, useChessArena, type ColorChoice } from '../../hooks/useChessArena';
import ChessBoard from './chess/ChessBoard';
import ChessClocks from './chess/ChessClocks';
import ChessChat from './chess/ChessChat';
import PromotionOverlay from './chess/PromotionOverlay';
import { GameOverPanel, PlayRealHariCta } from './chess/GameOverPanel';

const COLOR_OPTIONS: { id: ColorChoice; label: string }[] = [
  { id: 'w', label: 'White' },
  { id: 'b', label: 'Black' },
  { id: 'random', label: 'Random' },
];

/**
 * Chess Arena — timed duel vs Sentry, a chess bot by Harieshwar.
 * Pieces: free cburnett set (CC BY-SA 3.0 / GPL).
 */
const ChessArena: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const arena = useChessArena();
  const inPlay = arena.phase === 'playing' || arena.phase === 'ended';

  return (
    <div className={`${glassPanel(isDark)} relative overflow-hidden p-3 md:p-6`}>
      <div className={`flex flex-wrap items-center justify-between gap-2 ${inPlay ? '' : 'mb-2'}`}>
        <div className="min-w-0">
          <p
            className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.2em]"
            style={{ color: 'var(--os-primary)' }}
          >
            <Swords size={13} />
            Chess Arena
            {inPlay && (
              <span className="font-normal normal-case tracking-normal opacity-50">
                · {AGENT_NAME} · you are {arena.visitorIsWhite ? 'White' : 'Black'}
              </span>
            )}
          </p>
          {!inPlay && (
            <p className={`mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {chessProcessLabel}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 font-mono text-[11px]" aria-live="polite">
          <span>
            <span className="opacity-50">You </span>
            <strong style={{ color: 'var(--os-accent)' }}>{arena.displayVisitorElo}</strong>
            <span className="opacity-40"> Elo</span>
            {arena.phase === 'playing' && arena.matchRating !== null && (
              <span className="ml-1 text-[9px] uppercase tracking-wider opacity-40">live</span>
            )}
          </span>
          <span className="opacity-30">·</span>
          <span>
            <span className="opacity-50">{AGENT_NAME} </span>
            <strong style={{ color: 'var(--os-primary)' }}>{arena.effectiveSentryElo}</strong>
            <span className="opacity-40"> Elo</span>
          </span>
          <span className="opacity-30">·</span>
          <span>
            <span className="opacity-50">Score </span>
            <strong>You {arena.stats.userWins}</strong>
            <span className="mx-1 opacity-30">–</span>
            <strong>
              {AGENT_NAME} {arena.stats.sentryWins}
            </strong>
          </span>
        </div>
      </div>

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
              {AGENT_NAME} adapts after each game. Leaving the page forfeits. Local rating ~{arena.stats.visitorElo};
              real Hari on Lichess ~{HUMAN_RATING_ANCHOR}.
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
                <p className="mt-0.5 text-[10px] opacity-50">
                  Skill {arena.stats.skillLevel}/20 · adapts after each match
                </p>
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
              <li>▸ Real Hari on Lichess ~{HUMAN_RATING_ANCHOR} ({'HariEshwar'})</li>
              <li>▸ {PIECE_SET_CREDIT}</li>
            </ul>
          </div>
          <PlayRealHariCta isDark={isDark} />
        </div>
      )}

      {inPlay && (
        <div className="mt-3 grid items-start gap-4 xl:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
          <div className="relative mx-auto w-full max-w-[34rem] space-y-2">
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
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <p className="font-mono text-[11px] opacity-70" aria-live="polite">
                  {arena.turnLabel}
                  {arena.thinking ? '…' : ''}
                </p>
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
            <p className="font-mono text-[9px] opacity-40">{PIECE_SET_CREDIT}</p>
          </div>

          <div className="min-h-0 space-y-3">
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
