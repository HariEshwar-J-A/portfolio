import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getLenis } from '../hooks/useSmoothScroll';
import { isPortfolioPath } from '../lib/siteNav';

/** Jump the window (and Lenis, if active) to the top of the document. */
export const scrollDocumentToTop = (immediate = true) => {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { immediate, force: true });
  }
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

/**
 * Resets scroll on every client-side route change so leaving /3d (very tall)
 * or /ai never drops the visitor mid-homepage (e.g. end of Experience).
 */
const ScrollToTop = () => {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    const from = prevPath.current;
    prevPath.current = location.pathname;
    const keepSection = Boolean(
      (location.state as { keepSection?: boolean } | null)?.keepSection
    );
    // Role switches stay on the section you were reading. Every other
    // route change still opens at the top, unless the link named a section.
    if (from && keepSection && isPortfolioPath(from) && isPortfolioPath(location.pathname)) {
      return;
    }
    const hashId = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    const scrollToTarget = () => {
      const target = hashId ? document.getElementById(hashId) : null;
      if (!target) {
        scrollDocumentToTop(true);
        return;
      }
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(target, { offset: -80, immediate: true, force: true });
        return;
      }
      target.scrollIntoView({ block: 'start' });
    };
    scrollToTarget();
    const raf = window.requestAnimationFrame(scrollToTarget);
    return () => window.cancelAnimationFrame(raf);
  }, [location.pathname, location.key, location.state, location.hash]);

  return null;
};

export default ScrollToTop;
