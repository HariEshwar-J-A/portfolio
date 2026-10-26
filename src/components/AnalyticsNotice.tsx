import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion, m } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { PRIVACY_NOTICE_KEY, PRIVACY_PATH } from '../lib/privacyCopy';

const readOpen = (): boolean => {
  try {
    return window.localStorage.getItem(PRIVACY_NOTICE_KEY) !== '1';
  } catch {
    return true;
  }
};

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--os-primary)]';

/**
 * Informational corner note. Cookieless analytics does not need a consent
 * gate. Dismissal is remembered in localStorage so it does not return.
 */
const AnalyticsNotice: React.FC = () => {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(readOpen);
  const [footerVisible, setFooterVisible] = useState(false);
  const isDark = theme.mode === 'dark';

  useEffect(() => {
    if (!open) return;
    const footer = document.querySelector('footer');
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [open]);

  if (!open) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(PRIVACY_NOTICE_KEY, '1');
    } catch {
      // Private mode — hide it for this view anyway.
    }
    setOpen(false);
  };

  return (
    <m.aside
      role="region"
      aria-label="Analytics notice"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.35, ease: 'easeOut' }}
      className={`fixed right-3 z-50 w-[min(14.5rem,calc(100vw-5rem))] rounded-2xl border p-3 text-sm shadow-xl backdrop-blur-xl ${
        footerVisible ? 'bottom-28 sm:bottom-24' : 'bottom-20 xl:bottom-4'
      } ${
        isDark
          ? 'border-white/10 bg-slate-950/75 text-slate-200 shadow-black/20'
          : 'border-white/70 bg-white/80 text-slate-800 shadow-slate-300/30'
      }`}
    >
      <p className="leading-snug">This site uses cookieless analytics. No tracking cookies.</p>
      <div className="mt-2.5 flex items-center gap-2">
        <Link
          to={PRIVACY_PATH}
          className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold underline-offset-4 hover:underline ${focusRing}`}
          style={{ color: 'var(--os-primary)' }}
        >
          Privacy
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className={`ml-auto rounded-lg px-3 py-1.5 text-sm font-semibold text-white ${focusRing}`}
          style={{ backgroundColor: 'var(--os-primary)' }}
        >
          OK
        </button>
      </div>
    </m.aside>
  );
};

export default AnalyticsNotice;
