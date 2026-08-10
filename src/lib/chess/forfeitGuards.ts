/** Leave / background forfeit helpers for timed Chess Arena games. */

export const BACKGROUND_FORFEIT_MS = 15_000;

export type ForfeitReason = 'pagehide' | 'route' | 'background_timeout';

/**
 * Decide whether a visibility change should start the background timer.
 * Hidden → start; visible → cancel.
 */
export const shouldStartBackgroundTimer = (visibilityState: string): boolean =>
  visibilityState === 'hidden';

export const shouldCancelBackgroundTimer = (visibilityState: string): boolean =>
  visibilityState === 'visible';
