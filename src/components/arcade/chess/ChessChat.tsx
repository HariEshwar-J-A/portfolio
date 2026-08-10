import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { AGENT_NAME } from '../../../data/osIdentity';
import { FALLBACK_MODE_NOTICE } from '../../../data/chessBanter';
import type { ChatLine } from '../../../hooks/useChessArena';

interface ChessChatProps {
  lines: ChatLine[];
  banterMode: 'llm' | 'fallback';
  onSend: (text: string) => void;
  isDark: boolean;
  /** Latest interaction only — previous ones disappear from this pane. */
  latest: ChatLine | null;
}

/**
 * Closed by default. Interactions pane shows only the newest line;
 * full chat opens on demand.
 */
const ChessChat: React.FC<ChessChatProps> = ({ lines, banterMode, onSend, isDark, latest }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const isFallback = banterMode === 'fallback';

  return (
    <div className="space-y-2">
      {isFallback && (
        <div
          className="rounded-lg border px-3 py-2 text-[11px] leading-snug"
          style={{
            borderColor: 'color-mix(in srgb, #f59e0b 35%, transparent)',
            backgroundColor: 'color-mix(in srgb, #f59e0b 12%, transparent)',
            color: isDark ? '#fde68a' : '#92400e',
          }}
          role="status"
        >
          {FALLBACK_MODE_NOTICE}
        </div>
      )}

      {/* Single latest interaction */}
      <div
        className="rounded-xl border px-3 py-2.5 text-sm leading-snug"
        style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 28%, transparent)' }}
        aria-live="polite"
        aria-atomic="true"
      >
        {latest ? (
          <p>
            <span
              className="mr-2 font-mono text-[10px] font-black uppercase tracking-wider"
              style={{
                color:
                  latest.from === 'sentry'
                    ? 'var(--os-primary)'
                    : latest.from === 'you'
                      ? 'var(--os-accent)'
                      : isDark
                        ? '#fbbf24'
                        : '#b45309',
              }}
            >
              {latest.from === 'sentry' ? AGENT_NAME : latest.from === 'you' ? 'You' : 'System'}
            </span>
            {latest.text}
          </p>
        ) : (
          <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>
            Interactions appear here one at a time.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold ${
            isDark ? 'border-white/20' : 'border-slate-300'
          }`}
          aria-expanded={open}
        >
          {open ? <X size={12} /> : <MessageCircle size={12} />}
          {open ? 'Close chat' : 'Open chat'}
        </button>
        <span
          className="rounded-full px-2 py-1 font-mono text-[9px] font-black uppercase tracking-[0.14em]"
          style={{
            color: isFallback ? '#fbbf24' : 'var(--os-primary)',
            backgroundColor: isFallback
              ? 'color-mix(in srgb, #f59e0b 18%, transparent)'
              : 'color-mix(in srgb, var(--os-primary) 14%, transparent)',
          }}
        >
          {isFallback ? 'Prefilled persona' : 'Live LLM'}
        </span>
      </div>

      {open && (
        <div
          className="flex min-h-[12rem] flex-col rounded-xl border"
          style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 30%, transparent)' }}
        >
          <div
            className="flex-1 space-y-2 overflow-y-auto px-3 py-3 text-sm"
            role="log"
            aria-live="polite"
          >
            {lines.length === 0 && (
              <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>No messages yet.</p>
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
      )}
    </div>
  );
};

export default ChessChat;
