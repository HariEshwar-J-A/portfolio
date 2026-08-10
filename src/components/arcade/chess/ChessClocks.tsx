import React from 'react';
import { AGENT_NAME } from '../../../data/osIdentity';

interface ClockFaceProps {
  label: string;
  rating?: number;
  ms: number;
  active: boolean;
  low: boolean;
  compact?: boolean;
}

export const formatClock = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const ClockFace: React.FC<ClockFaceProps> = ({ label, rating, ms, active, low, compact }) => (
  <div
    className={`flex items-center justify-between gap-3 rounded-lg border font-mono transition ${
      compact ? 'px-3 py-1.5' : 'px-4 py-2'
    } ${active ? '' : 'opacity-70'}`}
    style={{
      borderColor: active ? 'var(--os-primary)' : 'color-mix(in srgb, var(--os-primary) 25%, transparent)',
      backgroundColor: low
        ? 'color-mix(in srgb, #ef4444 22%, transparent)'
        : active
          ? 'color-mix(in srgb, var(--os-primary) 14%, transparent)'
          : 'color-mix(in srgb, var(--os-primary) 6%, transparent)',
      animation: low && active ? 'pulse 1s ease-in-out infinite' : undefined,
    }}
    aria-label={`${label}${rating !== undefined ? ` rating ${rating}` : ''} clock ${formatClock(ms)}${active ? ', ticking' : ''}${low ? ', low time' : ''}`}
  >
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-70">{label}</p>
      {rating !== undefined && (
        <p className="mt-0.5 text-[11px] font-bold tabular-nums" style={{ color: 'var(--os-primary)' }}>
          {rating}
          <span className="ml-1 font-medium opacity-50">Elo</span>
        </p>
      )}
    </div>
    <span className={`shrink-0 tabular-nums font-black ${compact ? 'text-lg' : 'text-xl'} ${low ? 'text-red-400' : ''}`}>
      {formatClock(ms)}
      {low && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider">Low</span>}
    </span>
  </div>
);

interface ChessClocksProps {
  visitorMs: number;
  sentryMs: number;
  turn: 'w' | 'b';
  visitorIsWhite?: boolean;
  visitorRating?: number;
  sentryRating?: number;
  lowThresholdMs?: number;
  /** Which clock to render — use separately above/below the board. */
  which: 'sentry' | 'visitor';
}

const ChessClocks: React.FC<ChessClocksProps> = ({
  visitorMs,
  sentryMs,
  turn,
  visitorIsWhite = true,
  visitorRating,
  sentryRating,
  lowThresholdMs = 20_000,
  which,
}) => {
  const visitorActive = visitorIsWhite ? turn === 'w' : turn === 'b';
  if (which === 'sentry') {
    return (
      <ClockFace
        label={AGENT_NAME}
        rating={sentryRating}
        ms={sentryMs}
        active={!visitorActive}
        low={sentryMs < lowThresholdMs}
        compact
      />
    );
  }
  return (
    <ClockFace
      label="You"
      rating={visitorRating}
      ms={visitorMs}
      active={visitorActive}
      low={visitorMs < lowThresholdMs}
      compact
    />
  );
};

export default ChessClocks;
