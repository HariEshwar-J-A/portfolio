import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Briefcase,
  Compass,
  Handshake,
  Heart,
  Sparkles,
  X,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { setFocus, setViewMode } from '../store/slices/viewSlice';
import type { FocusId, ViewMode } from '../store/slices/viewSlice';
import UnderConstruction from './UnderConstruction';
import { OPEN_COLLAB_EVENT } from './CollabWizard';

/** Dispatch this event (header, palette, banner) to reopen the wizard. */
export const OPEN_INTENT_EVENT = 'portfolio:open-intent';
const SEEN_KEY = 'hari-ai-intent-done';

const INTENTS: { id: FocusId; label: string; blurb: string; icon: React.ReactNode }[] = [
  {
    id: 'hiring',
    label: 'I want to hire him',
    blurb: 'For a role, a team, or a contract',
    icon: <Briefcase size={20} />,
  },
  {
    id: 'collaboration',
    label: 'I want to collaborate',
    blurb: 'Products, open source, content, ideas',
    icon: <Handshake size={20} />,
  },
  {
    id: 'explore',
    label: 'Show me everything',
    blurb: 'The full portfolio, no filter',
    icon: <Compass size={20} />,
  },
  {
    id: 'personal',
    label: 'Something else entirely',
    blurb: 'Chess, esports, photography, or just hello',
    icon: <Heart size={20} />,
  },
];

const DETAIL_CHIPS: Record<Exclude<FocusId, 'explore'>, string[]> = {
  hiring: ['Frontend / React', 'Full-stack', 'Backend / APIs', 'AI / GenAI', 'Cloud / DevOps', 'IoT / Industrial'],
  collaboration: ['A product or startup', 'Open source', 'Freelance / contract work', 'Teaching or content'],
  personal: ['Chess', 'Esports', 'Drone / photography', 'Sports', 'Astrology', 'Just saying hi'],
};

const STEP2_TITLES: Record<Exclude<FocusId, 'explore'>, string> = {
  hiring: 'What are you hiring for?',
  collaboration: 'What do you want to build?',
  personal: 'What brings you by?',
};

/**
 * HARI.AI's front door: asks what the visitor came for, then tailors
 * the portfolio — section order, emphasis, and quick links — so they
 * reach their goal with less noise. The chat concierge (OpenRouter) is
 * visibly under construction; today everything is selection-based.
 * "Show me everything" (or skipping) goes straight to the full site.
 */
const IntentWizard: React.FC = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  const [isOpen, setIsOpen] = useState(() => {
    try {
      return window.sessionStorage.getItem(SEEN_KEY) !== 'true';
    } catch {
      return true;
    }
  });
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<FocusId | null>(null);
  const [chips, setChips] = useState<string[]>([]);
  const [detail, setDetail] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const open = () => {
      setIsOpen(true);
      setStep(0);
    };
    window.addEventListener(OPEN_INTENT_EVENT, open);
    return () => window.removeEventListener(OPEN_INTENT_EVENT, open);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.modalOpen = isOpen ? 'true' : 'false';
    if (isOpen) window.requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.documentElement.dataset.modalOpen = 'false';
    };
  }, [isOpen]);

  const close = () => {
    try {
      window.sessionStorage.setItem(SEEN_KEY, 'true');
    } catch {
      // Session storage unavailable — the wizard may greet again.
    }
    setIsOpen(false);
    setStep(0);
    setIntent(null);
    setChips([]);
    setDetail('');
  };

  const applyFocus = (focus: FocusId, viewMode?: ViewMode) => {
    const combinedDetail = [...chips, detail.trim()].filter(Boolean).join(' · ');
    dispatch(setFocus({ focus, detail: combinedDetail }));
    if (viewMode) dispatch(setViewMode(viewMode));
    close();
  };

  const pickIntent = (id: FocusId) => {
    setIntent(id);
    setChips([]);
    if (id === 'explore') {
      setStep(2); // explore skips details — straight to view choice
    } else {
      setStep(1);
    }
  };

  const toggleChip = (chip: string) =>
    setChips((current) =>
      current.includes(chip) ? current.filter((c) => c !== chip) : [...current, chip]
    );

  const detailIntent = intent && intent !== 'explore' ? intent : null;

  const surface = isDark
    ? 'border-white/10 bg-slate-900/95 text-white'
    : 'border-slate-200 bg-white/95 text-slate-900';
  const cardBase = isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/70';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[115] flex items-center justify-center bg-slate-950/60 px-3 py-6 backdrop-blur-sm sm:px-4"
          onMouseDown={close}
          role="dialog"
          aria-modal="true"
          aria-label="Visit personalization wizard"
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === 'Escape') close();
            }}
            className={`flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border shadow-2xl outline-none ${surface}`}
          >
            {/* AI header */}
            <div className={`flex items-center justify-between border-b px-5 py-4 sm:px-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg, var(--os-primary), var(--os-secondary))' }}
                >
                  <Bot size={18} />
                </span>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
                    HARI.AI · Visit concierge
                  </p>
                  <p className="text-sm font-bold">
                    {step === 0 && 'What did you come here for?'}
                    {step === 1 && detailIntent && STEP2_TITLES[detailIntent]}
                    {step === 2 && 'How much detail do you want?'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Skip and browse freely"
                className={`rounded-full p-2 transition ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {step === 0 && (
                    <>
                      <p className={`text-sm leading-relaxed ${mutedText}`}>
                        I'm Harieshwar's AI. Tell me why you're here and I'll rearrange his portfolio
                        around your goal — less noise, faster decisions.
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {INTENTS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => pickIntent(option.id)}
                            className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${cardBase}`}
                            style={{ borderColor: undefined }}
                          >
                            <span style={{ color: 'var(--os-primary)' }}>{option.icon}</span>
                            <p className="mt-2 font-bold">{option.label}</p>
                            <p className={`mt-1 text-xs ${mutedText}`}>{option.blurb}</p>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={close}
                        className={`mt-4 w-full text-center text-xs font-bold underline decoration-dotted underline-offset-4 hover-primary ${mutedText}`}
                      >
                        Skip — just let me browse
                      </button>
                    </>
                  )}

                  {step === 1 && detailIntent && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {DETAIL_CHIPS[detailIntent].map((chip) => {
                          const isSelected = chips.includes(chip);
                          return (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => toggleChip(chip)}
                              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                                isSelected ? 'text-white' : cardBase
                              }`}
                              style={
                                isSelected
                                  ? { backgroundColor: 'var(--os-primary)', borderColor: 'var(--os-primary)' }
                                  : undefined
                              }
                            >
                              {chip}
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        value={detail}
                        onChange={(event) => setDetail(event.target.value)}
                        placeholder={
                          detailIntent === 'hiring'
                            ? 'Optional: role title, stack, seniority, location…'
                            : 'Optional: anything specific you have in mind…'
                        }
                        rows={3}
                        className={`mt-4 w-full resize-none rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition focus:border-current ${
                          isDark ? 'border-white/15 placeholder:text-slate-600' : 'border-slate-300 placeholder:text-slate-400'
                        }`}
                        aria-label="Details"
                      />
                    </>
                  )}

                  {step === 2 && (
                    <>
                      {intent === 'explore' ? (
                        <p className={`text-sm leading-relaxed ${mutedText}`}>
                          Two ways to read my human — pick your depth. You can switch anytime from
                          the header.
                        </p>
                      ) : (
                        <p className={`text-sm leading-relaxed ${mutedText}`}>
                          Got it. I'll put the most relevant sections first and mark them for you.
                          One last thing — how much detail do you want?
                        </p>
                      )}
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => applyFocus(intent ?? 'explore', 'minimal')}
                          className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${cardBase}`}
                        >
                          <p className="font-bold">Minimalist</p>
                          <p className={`mt-1 text-xs leading-snug ${mutedText}`}>
                            A quick peek — headlines, highlights, no deep dives.
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFocus(intent ?? 'explore', 'comprehensive')}
                          className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5"
                          style={{
                            borderColor: 'var(--os-primary)',
                            backgroundColor: 'color-mix(in srgb, var(--os-primary) 10%, transparent)',
                          }}
                        >
                          <p className="flex items-center gap-1.5 font-bold">
                            Comprehensive
                            <Sparkles size={13} style={{ color: 'var(--os-primary)' }} />
                          </p>
                          <p className={`mt-1 text-xs leading-snug ${mutedText}`}>
                            The full record — charts, achievements, every detail.
                          </p>
                        </button>
                      </div>

                      {intent && intent !== 'explore' && (
                        <div className="mt-5">
                          <UnderConstruction
                            title="Concierge chat — ask me anything about him"
                            note="Soon I'll answer free-form questions over OpenRouter and pull up exactly what you need. Until then, my curated views above do the guiding."
                          />
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between gap-3 border-t px-5 py-3.5 sm:px-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(step === 2 && intent === 'explore' ? 0 : step - 1)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              ) : (
                <span className={`font-mono text-[10px] ${mutedText}`}>reopen me anytime — header ✦</span>
              )}

              {step === 1 && detailIntent && (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      // Direct line for people who already know what they want.
                      applyFocus(detailIntent);
                      window.dispatchEvent(new Event(OPEN_COLLAB_EVENT));
                    }}
                    className={`hidden items-center gap-1.5 text-xs font-bold underline decoration-dotted underline-offset-4 hover-primary sm:inline-flex ${mutedText}`}
                  >
                    Skip to drafting an email
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
                    style={{ backgroundColor: 'var(--os-primary)' }}
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntentWizard;
