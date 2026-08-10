import React, { useEffect, useState } from 'react';
import { AGENT_NAME } from '../../../data/osIdentity';
import type { ChatLine } from '../../../hooks/useChessArena';

interface ChessBanterToastProps {
  latest: ChatLine | null;
  isDark: boolean;
  /** Auto-hide after this many ms (default 4500). */
  ttlMs?: number;
}

/**
 * Single-message toast under the move list. Replaces itself on each new line,
 * then disappears — no persistent chat pane in-game.
 */
const ChessBanterToast: React.FC<ChessBanterToastProps> = ({ latest, isDark, ttlMs = 4500 }) => {
  const [visible, setVisible] = useState<ChatLine | null>(null);

  useEffect(() => {
    if (!latest) {
      setVisible(null);
      return;
    }
    setVisible(latest);
    const id = window.setTimeout(() => setVisible(null), ttlMs);
    return () => window.clearTimeout(id);
  }, [latest?.id, ttlMs]);

  if (!visible) return null;

  const label =
    visible.from === 'sentry' ? AGENT_NAME : visible.from === 'you' ? 'You' : 'System';

  return (
    <div
      className="rounded-xl border px-3 py-2.5 text-sm leading-snug shadow-lg transition-opacity"
      style={{
        borderColor: 'color-mix(in srgb, var(--os-primary) 35%, transparent)',
        backgroundColor: isDark
          ? 'color-mix(in srgb, var(--os-primary) 12%, #0f172a)'
          : 'color-mix(in srgb, var(--os-primary) 8%, #ffffff)',
      }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className="mr-2 font-mono text-[10px] font-black uppercase tracking-wider"
        style={{
          color:
            visible.from === 'sentry'
              ? 'var(--os-primary)'
              : visible.from === 'you'
                ? 'var(--os-accent)'
                : isDark
                  ? '#fbbf24'
                  : '#b45309',
        }}
      >
        {label}
      </span>
      {visible.text}
    </div>
  );
};

export default ChessBanterToast;
