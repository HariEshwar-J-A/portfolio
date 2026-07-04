import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Gamepad2, Mail, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RootState } from '../store/store';
import { clearFocus } from '../store/slices/viewSlice';
import { navigateTo } from '../store/slices/navigationSlice';
import { useTheme } from '../hooks/useTheme';
import { FOCUS_CONFIGS } from '../data/personalization';
import { OPEN_COLLAB_EVENT } from './CollabWizard';

/**
 * Sticky strip under the header while a visit intent is active: shows
 * what HARI.AI personalized, the visitor's own words, quick jumps to
 * the emphasized sections, and a way back to the untargeted view.
 */
const PersonalizedBanner: React.FC = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const { focus, focusDetail } = useSelector((state: RootState) => state.view);
  const config = focus ? FOCUS_CONFIGS[focus] : null;

  return (
    <AnimatePresence>
      {focus && focus !== 'explore' && config && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-x-0 top-[64px] z-40 px-3 sm:px-6"
        >
          <div
            className={`mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border px-4 py-2.5 shadow-xl backdrop-blur-xl ${
              isDark ? 'border-white/10 bg-slate-950/80' : 'border-slate-200 bg-white/90'
            }`}
            style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 35%, transparent)' }}
            role="status"
          >
            <p className="flex min-w-0 items-center gap-2 text-xs">
              <Bot size={14} className="shrink-0" style={{ color: 'var(--os-primary)' }} />
              <span className="font-mono font-black uppercase tracking-[0.15em]" style={{ color: 'var(--os-primary)' }}>
                {config.bannerTitle}
              </span>
              {focusDetail && (
                <span className={`hidden truncate md:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  · {focusDetail}
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              {config.quickLinks.map((link) => (
                <button
                  key={link.section}
                  type="button"
                  onClick={() => dispatch(navigateTo(link.section))}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition hover:-translate-y-0.5 ${
                    isDark ? 'border-white/15 text-slate-300' : 'border-slate-300 text-slate-600'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {focus === 'personal' ? (
                <Link
                  to="/ai"
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white transition hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--os-primary)' }}
                >
                  <Gamepad2 size={12} />
                  Playground
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event(OPEN_COLLAB_EVENT))}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white transition hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--os-primary)' }}
                >
                  <Mail size={12} />
                  Draft email
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => dispatch(clearFocus())}
              aria-label="Turn off personalization"
              className={`ml-auto rounded-full p-1.5 transition ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PersonalizedBanner;
