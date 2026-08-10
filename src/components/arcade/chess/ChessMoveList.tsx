import React, { useEffect, useRef } from 'react';
import { AGENT_NAME } from '../../../data/osIdentity';

interface ChessMoveListProps {
  movesSan: string[];
  isDark: boolean;
  /** Fill sidebar height instead of a short strip under the board. */
  tall?: boolean;
}

/** Always-visible move list (1. e4 e5 2. Nf3 …). */
const ChessMoveList: React.FC<ChessMoveListProps> = ({ movesSan, isDark, tall }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rows: { n: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < movesSan.length; i += 2) {
    rows.push({
      n: Math.floor(i / 2) + 1,
      white: movesSan[i],
      black: movesSan[i + 1],
    });
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [movesSan.length]);

  return (
    <div
      className={`flex min-h-0 flex-col rounded-xl border ${tall ? 'h-full min-h-[12rem]' : ''}`}
      style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 28%, transparent)' }}
      aria-label="Move list"
    >
      <div
        className="shrink-0 border-b px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.2em] opacity-70"
        style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 18%, transparent)' }}
      >
        Moves
      </div>
      <div
        ref={scrollerRef}
        className={`min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-xs ${
          tall ? '' : 'max-h-40'
        } ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
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
      <p className="sr-only">
        {AGENT_NAME} game moves
      </p>
    </div>
  );
};

export default ChessMoveList;
