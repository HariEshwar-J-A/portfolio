import React, { useEffect, useState } from 'react';
import { Construction } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const BUILD_STEPS = [
  'compiling chat.module …',
  'wiring OpenRouter uplink …',
  'teaching it my human …',
  'calibrating answers …',
];

/**
 * Animated "in development" panel for features that aren't live yet
 * (the OpenRouter-powered concierge chat). Scanline + cycling build log
 * — same visual language as the chess arena.
 */
const UnderConstruction: React.FC<{ title: string; note?: string }> = ({ title, note }) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(
      () => setStepIndex((index) => (index + 1) % BUILD_STEPS.length),
      1400
    );
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 ${
        isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/70'
      }`}
      style={{ borderColor: 'color-mix(in srgb, var(--os-accent) 40%, transparent)' }}
    >
      <div className="os-scanline" aria-hidden />
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.2em]"
          style={{ borderColor: 'var(--os-accent)', color: 'var(--os-accent)' }}
        >
          <Construction size={11} />
          Under construction
        </span>
        <p className="text-sm font-bold">{title}</p>
      </div>
      <p className={`mt-2 font-mono text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        <span style={{ color: 'var(--os-primary)' }}>▸</span> {BUILD_STEPS[stepIndex]}
        <span className="animate-pulse" style={{ color: 'var(--os-primary)' }}>
          ▌
        </span>
      </p>
      {note && <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{note}</p>}
    </div>
  );
};

export default UnderConstruction;
