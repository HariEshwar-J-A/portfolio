import React from 'react';
import { AGENT_NAME } from '../../../data/osIdentity';

interface ChessClocksProps {
  visitorMs: number;
  sentryMs: number;
  turn: 'w' | 'b';
  visitorIsWhite?: boolean;
  lowThresholdMs?: number;
}

const formatClock = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const ClockFace: React.FC<{
  label: string;
  ms: number;
  active: boolean;
  low: boolean;
}> = ({ label, ms, active, low }) => (
  <div
    className={`rounded-xl border px-4 py-3 font-mono transition ${active ? 'scale-[1.02]' : 'opacity-75'}`}
    style={{
      borderColor: active ? 'var(--os-primary)' : 'color-mix(in srgb, var(--os-primary) 25%, transparent)',
      backgroundColor: low
        ? 'color-mix(in srgb, #ef4444 22%, transparent)'
        : active
          ? 'color-mix(in srgb, var(--os-primary) 16%, transparent)'
          : 'transparent',
      animation: low && active ? 'pulse 1s ease-in-out infinite' : undefined,
    }}
    aria-label={`${label} clock ${formatClock(ms)}${active ? ', ticking' : ''}${low ? ', low time' : ''}`}
  >
    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{label}</p>
    <p className={`mt-1 text-2xl font-black tabular-nums ${low ? 'text-red-400' : ''}`}>
      {formatClock(ms)}
      {low && <span className="ml-2 text-xs font-bold uppercase tracking-wider">Low</span>}
    </p>
  </div>
);

const ChessClocks: React.FC<ChessClocksProps> = ({
  visitorMs,
  sentryMs,
  turn,
  visitorIsWhite = true,
  lowThresholdMs = 20_000,
}) => {
  const visitorActive = visitorIsWhite ? turn === 'w' : turn === 'b';
  return (
    <div className="grid grid-cols-2 gap-3" role="group" aria-label="Game clocks">
      <ClockFace
        label="You"
        ms={visitorMs}
        active={visitorActive}
        low={visitorMs < lowThresholdMs}
      />
      <ClockFace
        label={AGENT_NAME}
        ms={sentryMs}
        active={!visitorActive}
        low={sentryMs < lowThresholdMs}
      />
    </div>
  );
};

export default ChessClocks;
