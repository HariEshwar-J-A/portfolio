import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLenis } from '../hooks/useSmoothScroll';

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
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollDocumentToTop(true);
    // Lenis may mount a frame later on the homepage — pin top again next paint.
    const raf = window.requestAnimationFrame(() => scrollDocumentToTop(true));
    return () => window.cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
