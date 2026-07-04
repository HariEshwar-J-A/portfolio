import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bot } from 'lucide-react';
import { RootState } from '../store/store';
import { useTheme } from '../hooks/useTheme';
import { getPalette, sectionNarration } from '../data/osPersona';

const TYPE_SPEED_MS = 18;

/**
 * HARI.AI's voice: a slim floating status line that types a short,
 * first-person observation about its human for whichever section is in
 * view. Lines are deliberately brief and the bar clamps to the viewport
 * so nothing overflows, down to phone widths.
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
    // pointer-events-none: purely informational — taps must reach the content behind it
    <div
      aria-live="polite"
      className={`pointer-events-none fixed bottom-4 left-1/2 z-40 flex w-[min(38rem,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[10px] shadow-xl backdrop-blur-xl sm:gap-3 sm:px-5 sm:py-2.5 sm:text-xs ${
        isDark
          ? 'border-white/10 bg-slate-950/75 text-slate-300'
          : 'border-slate-200 bg-white/85 text-slate-600'
      }`}
    >
      <Bot size={14} className="shrink-0" style={{ color: palette.primary }} />
      <span className="hidden shrink-0 font-bold tracking-widest sm:inline" style={{ color: palette.primary }}>
        HARI.AI
      </span>
      <span className="min-w-0 flex-1 truncate">
        {typed}
        <span className="animate-pulse" style={{ color: palette.primary }}>
          ▌
        </span>
      </span>
    </div>
  );
};

export default SystemNarrator;
