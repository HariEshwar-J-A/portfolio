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
    let current: Element | null = null;
    let observer: IntersectionObserver | null = null;

    const attach = () => {
      const footer = document.querySelector('footer');
      if (footer === current) return;
      observer?.disconnect();
      current = footer;
      if (!footer) {
        setFooterVisible(false);
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => setFooterVisible(entry.isIntersecting),
        { threshold: 0.01 },
      );
      observer.observe(footer);
    };

    attach();
    // Ops and privacy mount their footer after the lazy chunk, so a one-shot
    // query on this effect misses it and the note stays on the footer links.
    const mutations = new MutationObserver(attach);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer?.disconnect();
      mutations.disconnect();
    };
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
      className={`fixed z-50 border shadow-xl backdrop-blur-xl max-md:inset-x-3 max-md:flex max-md:items-center max-md:gap-2 max-md:rounded-full max-md:px-3 max-md:py-1.5 max-md:text-xs md:right-3 md:block md:w-[min(14.5rem,calc(100vw-5rem))] md:rounded-2xl md:p-3 md:text-sm ${
        footerVisible ? 'max-md:bottom-44 md:bottom-24' : 'max-md:bottom-[4.75rem] md:bottom-20 xl:bottom-4'
      } ${
        isDark
          ? 'border-white/10 bg-slate-950 text-slate-200 shadow-black/20'
          : 'border-slate-200 bg-white text-slate-800 shadow-slate-300/30'
      }`}
    >
      <p className="leading-snug max-md:min-w-0 max-md:flex-1 max-md:truncate">
        This site uses cookieless analytics. No tracking cookies.
      </p>
      <div className="flex shrink-0 items-center gap-1.5 md:mt-2.5 md:gap-2">
        <Link
          to={PRIVACY_PATH}
          className={`rounded-lg px-2 py-1 text-xs font-semibold underline-offset-4 hover:underline md:px-2.5 md:py-1.5 md:text-sm ${focusRing}`}
          style={{ color: 'var(--os-primary)' }}
        >
          Privacy
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className={`ml-auto rounded-lg px-2.5 py-1 text-xs font-semibold md:px-3 md:py-1.5 md:text-sm ${focusRing}`}
          style={{ backgroundColor: 'var(--os-primary)', color: 'var(--os-on-primary)' }}
        >
          OK
        </button>
      </div>
    </m.aside>
  );
};

export default AnalyticsNotice;
