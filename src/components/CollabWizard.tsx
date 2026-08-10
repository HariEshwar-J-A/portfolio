import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Code2,
  Copy,
  Handshake,
  Mail,
  Rocket,
  Sparkles,
  X,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTheme } from '../hooks/useTheme';
import { portfolioData } from '../data/portfolioData';

/** Dispatch this event (hero badge, palette, HUD) to open the wizard. */
export const OPEN_COLLAB_EVENT = 'portfolio:open-collab';

type RoleId = 'recruiter' | 'founder' | 'engineer' | 'other';
type IntentId = 'role' | 'contract' | 'product' | 'community';

const ROLES: { id: RoleId; label: string; blurb: string; icon: React.ReactNode }[] = [
  {
    id: 'recruiter',
    label: 'Recruiter / Hiring manager',
    blurb: 'Hiring for a team or a role',
    icon: <Briefcase size={20} />,
  },
  {
    id: 'founder',
    label: 'Founder / Product owner',
    blurb: 'Building something, need engineering firepower',
    icon: <Rocket size={20} />,
  },
  {
    id: 'engineer',
    label: 'Engineer / Peer',
    blurb: 'Talk shop, open source, or trade notes',
    icon: <Code2 size={20} />,
  },
  {
    id: 'other',
    label: 'Someone else',
    blurb: 'Every good collaboration starts somewhere',
    icon: <Sparkles size={20} />,
  },
];

const INTENTS: { id: IntentId; label: string; blurb: string }[] = [
  { id: 'role', label: 'Discuss a full-time role', blurb: 'A position that fits an architect-level full-stack engineer' },
  { id: 'contract', label: 'Contract / freelance project', blurb: 'Scoped work across web, IoT, AI, or cloud' },
  { id: 'product', label: 'Build a product together', blurb: 'Co-create, contribute, or join forces on something live' },
  { id: 'community', label: 'Mentorship / talk / community', blurb: 'Knowledge sharing, speaking, or guidance' },
];

const TIMELINES = ['As soon as possible', 'Within a month', 'This quarter', 'Just exploring'] as const;

const ROLE_LINES: Record<RoleId, string> = {
  recruiter: "I'm reaching out on the hiring side — your profile stood out.",
  founder: "I'm building a product and looking for serious engineering firepower.",
  engineer: "I'm a fellow engineer and enjoyed going through your work.",
  other: 'I came across your portfolio and wanted to reach out.',
};

const INTENT_LINES: Record<IntentId, string> = {
  role: "I'd like to discuss a full-time opportunity that I believe matches your architect-level, full-stack background.",
  contract:
    'I have a contract project where your experience across web, IoT, AI, and cloud would be a strong fit.',
  product: "I'd like to explore building or collaborating on a product together.",
  community: "I'd love to arrange a mentorship session, talk, or knowledge exchange.",
};

const TIMELINE_LINES: Record<(typeof TIMELINES)[number], string> = {
  'As soon as possible': "On timing: I'm hoping to move quickly.",
  'Within a month': 'On timing: ideally within the next month.',
  'This quarter': 'On timing: sometime this quarter works well.',
  'Just exploring': "On timing: no rush — I'm exploring for now.",
};

const INTENT_SUBJECTS: Record<IntentId, string> = {
  role: 'Full-time opportunity',
  contract: 'Contract project',
  product: 'Product collaboration',
  community: 'Mentorship / community',
};

const STEP_TITLES = ['Who are you?', 'What brings you here?', 'A few details', 'Your draft is ready'];

/**
 * Guided collaboration wizard: three quick prompts with pre-curated
 * answers (plus a free-text note), then HARI.AI assembles a ready-to-send
 * email draft — open in the visitor's mail app or copy to clipboard.
 */
const CollabWizard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const email = portfolioData.contact.email;
  const focusDetail = useSelector((state: RootState) => state.view.focusDetail);

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<RoleId | null>(null);
  const [intent, setIntent] = useState<IntentId | null>(null);
  const [timeline, setTimeline] = useState<(typeof TIMELINES)[number]>('This quarter');
  const [senderName, setSenderName] = useState('');
  const [organization, setOrganization] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const open = () => {
      setIsOpen(true);
      setStep(0);
      setCopied(false);
      // Carry what they told the intent wizard into the draft.
      setNote((current) => current || (focusDetail ? `Context: ${focusDetail}` : ''));
    };
    window.addEventListener(OPEN_COLLAB_EVENT, open);
    return () => window.removeEventListener(OPEN_COLLAB_EVENT, open);
  }, [focusDetail]);

  useEffect(() => {
    document.documentElement.dataset.modalOpen = isOpen ? 'true' : 'false';
    if (isOpen) window.requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
    return () => {
      document.documentElement.dataset.modalOpen = 'false';
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const draft = useMemo(() => {
    if (!role || !intent) return { subject: '', body: '' };
    const from = organization.trim() || senderName.trim();
    const subject = `${INTENT_SUBJECTS[intent]} — ${from || 'hello from your next collaborator'}`;
    const noteBlock = note.trim() ? `\n${note.trim()}\n` : '';
    const signature = senderName.trim() ? `\nBest,\n${senderName.trim()}` : '\nBest,\n[Your name]';
    const body = [
      'Hi Harieshwar,',
      '',
      `${ROLE_LINES[role]} ${INTENT_LINES[intent]}`,
      TIMELINE_LINES[timeline],
      noteBlock ? noteBlock.trim() : null,
      'Looking forward to hearing from you.',
      signature.trim(),
    ]
      .filter((part): part is string => part !== null)
      .join('\n\n');
    return { subject, body };
  }, [role, intent, timeline, senderName, organization, note]);

  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${email}\nSubject: ${draft.subject}\n\n${draft.body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = mailtoHref;
    }
  };

  const canContinue = (step === 0 && role !== null) || (step === 1 && intent !== null) || step === 2;

  const optionCard = (selected: boolean) =>
    selected
      ? 'ring-2 shadow-lg'
      : isDark
        ? 'hover:border-white/30'
        : 'hover:border-slate-400';

  const surface = isDark
    ? 'border-white/10 bg-slate-900/95 text-white'
    : 'border-slate-200 bg-white/95 text-slate-900';
  const cardBase = isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/70';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBase = `w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition focus:border-current ${
    isDark ? 'border-white/15 placeholder:text-slate-600' : 'border-slate-300 placeholder:text-slate-400'
  }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
          onMouseDown={close}
          role="dialog"
          aria-modal="true"
          aria-label="Collaboration wizard"
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
            className={`flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border shadow-2xl outline-none ${surface}`}
          >
            {/* Assistant header */}
            <div
              className={`flex items-center justify-between border-b px-6 py-4 ${
                isDark ? 'border-white/10' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  <Handshake size={18} />
                </span>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: theme.colors.primary }}>
                    HARI.AI · Collaboration assistant
                  </p>
                  <p className="text-sm font-bold">{STEP_TITLES[step]}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close wizard"
                className={`rounded-full p-2 transition ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Progress */}
            <div className="flex gap-1.5 px-6 pt-4">
              {STEP_TITLES.map((title, index) => (
                <span
                  key={title}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      index <= step ? theme.colors.primary : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  }}
                />
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {step === 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ROLES.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setRole(option.id)}
                          className={`rounded-2xl border p-4 text-left transition ${cardBase} ${optionCard(role === option.id)}`}
                          style={role === option.id ? { borderColor: theme.colors.primary, ['--tw-ring-color' as never]: `${theme.colors.primary}66` } : undefined}
                        >
                          <span style={{ color: theme.colors.primary }}>{option.icon}</span>
                          <p className="mt-2 font-bold">{option.label}</p>
                          <p className={`mt-1 text-xs ${mutedText}`}>{option.blurb}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid gap-3">
                      {INTENTS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setIntent(option.id)}
                          className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${cardBase} ${optionCard(intent === option.id)}`}
                          style={intent === option.id ? { borderColor: theme.colors.primary, ['--tw-ring-color' as never]: `${theme.colors.primary}66` } : undefined}
                        >
                          <span>
                            <p className="font-bold">{option.label}</p>
                            <p className={`mt-0.5 text-xs ${mutedText}`}>{option.blurb}</p>
                          </span>
                          {intent === option.id && <Check size={18} style={{ color: theme.colors.primary }} />}
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <div>
                        <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${mutedText}`}>Timeline</p>
                        <div className="flex flex-wrap gap-2">
                          {TIMELINES.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setTimeline(option)}
                              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                timeline === option ? 'text-white' : cardBase
                              }`}
                              style={
                                timeline === option
                                  ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                  : undefined
                              }
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={senderName}
                          onChange={(event) => setSenderName(event.target.value)}
                          placeholder="Your name (optional)"
                          className={inputBase}
                          aria-label="Your name"
                        />
                        <input
                          value={organization}
                          onChange={(event) => setOrganization(event.target.value)}
                          placeholder="Company / team (optional)"
                          className={inputBase}
                          aria-label="Company or team"
                        />
                      </div>
                      <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Anything specific — role details, product idea, links… (optional)"
                        rows={4}
                        className={`${inputBase} resize-none`}
                        aria-label="Custom note"
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <p className={`mb-3 font-mono text-xs ${mutedText}`}>
                        ▍I composed this from your answers — edit anything after it opens in your mail app
                      </p>
                      <div className={`rounded-2xl border p-5 font-mono text-sm leading-relaxed ${cardBase}`}>
                        <p className={mutedText}>To: {email}</p>
                        <p className="mt-1 font-bold">Subject: {draft.subject}</p>
                        <hr className={`my-3 ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
                        <p className="whitespace-pre-wrap">{draft.body}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer actions */}
            <div
              className={`flex items-center justify-between gap-3 border-t px-6 py-4 ${
                isDark ? 'border-white/10' : 'border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => (step === 0 ? close() : setStep((s) => s - 1))}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ArrowLeft size={16} />
                {step === 0 ? 'Close' : 'Back'}
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              ) : (
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                      isDark ? 'border-white/15 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy draft'}
                  </button>
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    <Mail size={16} />
                    Open in email app
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CollabWizard;
