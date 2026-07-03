import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTheme } from '../hooks/useTheme';
import { getPalette, sectionNarration } from '../data/osPersona';

const TYPE_SPEED_MS = 18;

/**
 * The voice of HARI.OS: a slim, fixed status line that types out an
 * observation about Harieshwar for whichever section is in view —
 * the site narrating its subject like an intelligence.
 */
const SystemNarrator: React.FC = () => {
  const { theme } = useTheme();
  const palette = getPalette(useSelector((state: RootState) => state.theme.palette));
  const { activeSection } = useSelector((state: RootState) => state.navigation);
  const line = sectionNarration[activeSection] ?? '';
  const [typed, setTyped] = useState('');
  const isDark = theme.mode === 'dark';

  useEffect(() => {
    setTyped('');
    if (!line) return;
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setTyped(line.slice(0, index));
      if (index >= line.length) window.clearInterval(interval);
    }, TYPE_SPEED_MS);
    return () => window.clearInterval(interval);
  }, [line]);

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-5 left-1/2 z-40 hidden w-[min(44rem,calc(100vw-24rem))] -translate-x-1/2 items-center gap-3 rounded-full border px-5 py-2.5 font-mono text-xs shadow-xl backdrop-blur-xl lg:flex ${
        isDark
          ? 'border-white/10 bg-slate-950/70 text-slate-300'
          : 'border-slate-200 bg-white/80 text-slate-600'
      }`}
    >
      <span
        className="h-2 w-2 shrink-0 animate-pulse rounded-full"
        style={{ backgroundColor: palette.primary }}
      />
      <span className="shrink-0 font-bold tracking-widest" style={{ color: palette.primary }}>
        HARI.OS
      </span>
      <span className="truncate">
        {typed}
        <span className="animate-pulse" style={{ color: palette.primary }}>
          ▌
        </span>
      </span>
    </div>
  );
};

export default SystemNarrator;
