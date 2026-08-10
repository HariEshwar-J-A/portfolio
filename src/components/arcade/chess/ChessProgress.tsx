import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { AGENT_NAME, HUMAN_NAME, HUMAN_RATING_ANCHOR } from '../../../data/osIdentity';
import { CHESS_UNLOCKS, chessLevelFor, type ChessUnlock } from '../../../data/chessUnlocks';
import { ratingGapToHari } from '../../../lib/chess/rating';

interface ChessProgressProps {
  visitorElo: number;
  sentryElo: number;
  gamesPlayed: number;
  userWins: number;
  unlockedIds: string[];
  /** Newly unlocked this session — shown prominently. */
  freshUnlock: ChessUnlock | null;
  isDark: boolean;
}

const ChessProgress: React.FC<ChessProgressProps> = ({
  visitorElo,
  sentryElo,
  gamesPlayed,
  userWins,
  unlockedIds,
  freshUnlock,
  isDark,
}) => {
  const level = chessLevelFor({ visitorElo, gamesPlayed, userWins });
  const gap = ratingGapToHari(visitorElo);
  const unlocked = new Set(unlockedIds);

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl border px-3 py-3"
        style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 28%, transparent)' }}
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
              Arena level {level}
            </p>
            <p className="mt-1 text-sm leading-snug">
              You <strong style={{ color: 'var(--os-accent)' }}>{visitorElo}</strong>
              <span className="mx-1.5 opacity-40">·</span>
              {AGENT_NAME} <strong style={{ color: 'var(--os-primary)' }}>{sentryElo}</strong>
            </p>
          </div>
          <div className="text-right font-mono text-[11px]">
            <p className="opacity-50">{HUMAN_NAME} ~{HUMAN_RATING_ANCHOR}</p>
            <p className="mt-0.5 font-bold" style={{ color: 'var(--os-secondary)' }}>
              {gap > 0 ? `${gap} Elo to climb` : 'Ceiling reached'}
            </p>
          </div>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full"
          style={{ backgroundColor: 'color-mix(in srgb, var(--os-primary) 15%, transparent)' }}
          aria-hidden
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.round((visitorElo / HUMAN_RATING_ANCHOR) * 100))}%`,
              backgroundColor: 'var(--os-accent)',
            }}
          />
        </div>
      </div>

      {freshUnlock && (
        <div
          className="rounded-xl border px-3 py-2.5 text-sm"
          style={{
            borderColor: 'color-mix(in srgb, var(--os-accent) 45%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--os-accent) 12%, transparent)',
          }}
          role="status"
        >
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--os-accent)' }}>
            Unlocked · {freshUnlock.title}
          </p>
          <p className="mt-1 leading-snug">{freshUnlock.body}</p>
        </div>
      )}

      <div>
        <p className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
          About {HUMAN_NAME}&apos;s chess
        </p>
        <ul className="space-y-1.5">
          {CHESS_UNLOCKS.map((u) => {
            const open = unlocked.has(u.id);
            return (
              <li
                key={u.id}
                className={`flex gap-2 rounded-lg border px-2.5 py-2 text-xs leading-snug ${
                  open ? '' : isDark ? 'opacity-50' : 'opacity-60'
                }`}
                style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 18%, transparent)' }}
              >
                <span className="mt-0.5 shrink-0" style={{ color: open ? 'var(--os-accent)' : undefined }}>
                  {open ? <Unlock size={12} /> : <Lock size={12} />}
                </span>
                <span>
                  <span className="font-bold">{u.title}</span>
                  {open ? (
                    <span className={`mt-0.5 block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{u.body}</span>
                  ) : (
                    <span className="mt-0.5 block opacity-70">Keep playing to unlock.</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ChessProgress;
