import React from 'react';
import { AGENT_NAME } from '../../../data/osIdentity';

interface ChessMoveListProps {
  movesSan: string[];
  isDark: boolean;
}

/** Always-visible move list (1. e4 e5 2. Nf3 …). */
const ChessMoveList: React.FC<ChessMoveListProps> = ({ movesSan, isDark }) => {
  const rows: { n: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < movesSan.length; i += 2) {
    rows.push({
      n: Math.floor(i / 2) + 1,
      white: movesSan[i],
      black: movesSan[i + 1],
    });
  }

  return (
    <div
      className="rounded-xl border"
      style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 28%, transparent)' }}
      aria-label="Move list"
    >
      <div
        className="border-b px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.2em] opacity-70"
        style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 18%, transparent)' }}
      >
        Moves · You vs {AGENT_NAME}
      </div>
      <div
        className={`max-h-40 overflow-y-auto px-3 py-2 font-mono text-xs ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}
      >
        {rows.length === 0 ? (
          <p className="opacity-50">No moves yet.</p>
        ) : (
          <ol className="space-y-0.5">
            {rows.map((row) => (
              <li key={row.n} className="grid grid-cols-[1.75rem_1fr_1fr] gap-2">
                <span className="opacity-40">{row.n}.</span>
                <span>{row.white ?? ''}</span>
                <span>{row.black ?? ''}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default ChessMoveList;
