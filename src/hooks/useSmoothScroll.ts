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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ lerp: 0.1 });
    activeLenis = lenis;

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
