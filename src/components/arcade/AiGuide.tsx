import React, { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const TYPE_SPEED_MS = 16;

/** Pick a random line, avoiding an immediate repeat where possible. */
export const pickLine = (pool: string[], avoid?: string): string => {
  const candidates = pool.length > 1 && avoid ? pool.filter((line) => line !== avoid) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
};

interface AiGuideProps {
  message: string;
}

/**
 * HARI.AI as game host: an avatar + typed speech bubble that reacts to
 * every step of a module with predefined lines. Not a real model — just
 * the app's flow wearing a personality.
 */
const AiGuide: React.FC<AiGuideProps> = ({ message }) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const [typed, setTyped] = useState('');

  useEffect(() => {
    setTyped('');
    if (!message) return;
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setTyped(message.slice(0, index));
      if (index >= message.length) window.clearInterval(interval);
    }, TYPE_SPEED_MS);
    return () => window.clearInterval(interval);
  }, [message]);

  return (
    <div className="mt-4 flex items-start gap-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
        style={{
          background: 'linear-gradient(135deg, var(--os-primary), var(--os-secondary))',
        }}
        aria-hidden
      >
        <Bot size={16} />
      </span>
      <div
        className={`min-w-0 rounded-2xl rounded-tl-sm border px-3.5 py-2.5 text-sm leading-relaxed ${
          isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-white/75 text-slate-700'
        }`}
        style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 25%, transparent)' }}
        aria-live="polite"
      >
        <span className="mr-1.5 font-mono text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--os-primary)' }}>
          hari.ai
        </span>
        {typed}
        <span className="animate-pulse" style={{ color: 'var(--os-primary)' }}>
          ▌
        </span>
      </div>
    </div>
  );
};

export default AiGuide;
