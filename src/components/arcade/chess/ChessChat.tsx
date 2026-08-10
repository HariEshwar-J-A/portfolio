import React, { useState } from 'react';
import { AGENT_NAME } from '../../../data/osIdentity';
import { FALLBACK_MODE_NOTICE } from '../../../data/chessBanter';
import type { ChatLine } from '../../../hooks/useChessArena';

interface ChessChatProps {
  lines: ChatLine[];
  banterMode: 'llm' | 'fallback';
  onSend: (text: string) => void;
  isDark: boolean;
}

const ChessChat: React.FC<ChessChatProps> = ({ lines, banterMode, onSend, isDark }) => {
  const [draft, setDraft] = useState('');
  const isFallback = banterMode === 'fallback';

  return (
    <div
      className="flex h-full min-h-[16rem] flex-col rounded-xl border"
      style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 30%, transparent)' }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 20%, transparent)' }}
      >
        <span>{AGENT_NAME} chat</span>
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-black tracking-[0.14em]"
          style={{
            color: isFallback ? '#fbbf24' : 'var(--os-primary)',
            backgroundColor: isFallback
              ? 'color-mix(in srgb, #f59e0b 18%, transparent)'
              : 'color-mix(in srgb, var(--os-primary) 14%, transparent)',
            border: `1px solid ${isFallback ? 'color-mix(in srgb, #f59e0b 45%, transparent)' : 'color-mix(in srgb, var(--os-primary) 35%, transparent)'}`,
          }}
          aria-live="polite"
        >
          {isFallback ? 'Prefilled persona' : 'Live LLM'}
        </span>
      </div>

      {isFallback && (
        <div
          className="border-b px-3 py-2 text-xs leading-snug"
          style={{
            borderColor: 'color-mix(in srgb, #f59e0b 25%, transparent)',
            backgroundColor: 'color-mix(in srgb, #f59e0b 12%, transparent)',
            color: isDark ? '#fde68a' : '#92400e',
          }}
          role="status"
        >
          {FALLBACK_MODE_NOTICE}
        </div>
      )}

      <div
        className="flex-1 space-y-2 overflow-y-auto px-3 py-3 text-sm"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {lines.length === 0 && (
          <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>Banter appears here.</p>
        )}
        {lines.map((line) => (
          <p key={line.id} className="leading-snug">
            <span
              className="mr-2 font-mono text-[10px] font-black uppercase tracking-wider"
              style={{
                color:
                  line.from === 'sentry'
                    ? 'var(--os-primary)'
                    : line.from === 'you'
                      ? 'var(--os-accent)'
                      : isDark
                        ? '#fbbf24'
                        : '#b45309',
              }}
            >
              {line.from === 'sentry' ? AGENT_NAME : line.from === 'you' ? 'You' : 'System'}
            </span>
            {line.text}
          </p>
        ))}
      </div>
      <form
        className="flex gap-2 border-t p-2"
        style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 20%, transparent)' }}
        onSubmit={(e) => {
          e.preventDefault();
          onSend(draft);
          setDraft('');
        }}
      >
        <label className="sr-only" htmlFor="chess-chat-input">
          Message {AGENT_NAME}
        </label>
        <input
          id="chess-chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={200}
          placeholder="Talk to Sentry…"
          className={`flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}
          style={{ ['--tw-ring-color' as string]: 'var(--os-primary)' }}
        />
        <button
          type="submit"
          className="rounded-lg px-3 py-2 text-xs font-bold text-white"
          style={{ backgroundColor: 'var(--os-primary)' }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChessChat;
