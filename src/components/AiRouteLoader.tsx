import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface LoaderScript {
  title: string;
  lines: string[];
}

/** What HARI.AI says while it "prepares" each destination. */
const ROUTE_SCRIPTS: Record<string, LoaderScript> = {
  '/': {
    title: 'Portfolio',
    lines: ['reassembling his story…', 'polishing the glass panels…', 'waking the narrator…'],
  },
  '/ai': {
    title: 'Playground',
    lines: ['spinning up my games…', 'shuffling the quiz deck…', 'hiding the memory fragments…'],
  },
  '/3d': {
    title: '3D Experience',
    lines: ['rendering the third dimension…', 'aligning the stars…', 'warming up the shaders…'],
  },
};

const FALLBACK_SCRIPT: LoaderScript = {
  title: 'Next scene',
  lines: ['loading…', 'almost there…'],
};

/**
 * Full-screen AI loader shown between routes and while lazy chunks
 * download (the Suspense fallback uses the same component, so a slow
 * network just extends the same animation instead of swapping visuals).
 */
const AiRouteLoader: React.FC<{ pathname?: string }> = ({ pathname }) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const path = pathname ?? window.location.pathname;
  const script = ROUTE_SCRIPTS[path] ?? FALLBACK_SCRIPT;
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(
      () => setLineIndex((index) => (index + 1) % script.lines.length),
      650
    );
    return () => window.clearInterval(interval);
  }, [script]);

  return (
    <div
      className={`fixed inset-0 z-[180] flex items-center justify-center backdrop-blur-md ${
        isDark ? 'bg-[#020617]/92 text-white' : 'bg-slate-50/95 text-slate-900'
      }`}
      role="status"
      aria-label={`Loading ${script.title}`}
    >
      <div className="flex w-full max-w-xs flex-col items-center px-6 text-center">
        {/* Bot avatar with breathing glow */}
        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="os-pulse-glow flex h-14 w-14 items-center justify-center rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, var(--os-primary), var(--os-secondary))' }}
        >
          <Bot size={26} />
        </motion.span>

        <p className="mt-4 font-mono text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--os-primary)' }}>
          HARI.AI · preparing
        </p>
        <p className="mt-1 text-xl font-black tracking-tight">{script.title}</p>

        <p className={`mt-3 h-5 font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span style={{ color: 'var(--os-primary)' }}>▸</span> {script.lines[lineIndex]}
        </p>

        {/* Indeterminate persona-gradient sweep */}
        <div className={`mt-4 h-1 w-44 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
          <div className="os-border-flow h-full w-full rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default AiRouteLoader;
