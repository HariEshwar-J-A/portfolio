import { useEffect } from 'react';
import Lenis from 'lenis';

let activeLenis: Lenis | null = null;

/** The live Lenis instance, if smooth scrolling is active (null under reduced motion). */
export const getLenis = (): Lenis | null => activeLenis;

/**
 * Drives buttery smooth scrolling for the whole page via Lenis.
 * Skipped entirely when the visitor prefers reduced motion — native
 * scrolling (with CSS smooth behavior disabled) takes over.
 */
export const useSmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, 0);
      return;
    }

    const lenis = new Lenis({ lerp: 0.1 });
    activeLenis = lenis;
    // Open at the hero, unless the link named a section (for example /#contact).
    const hashId = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : '';
    const target = hashId ? document.getElementById(hashId) : null;
    if (target) {
      lenis.scrollTo(target, { offset: -80, immediate: true, force: true });
    } else {
      lenis.scrollTo(0, { immediate: true, force: true });
    }

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };
    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
      activeLenis = null;
    };
  }, []);
};
