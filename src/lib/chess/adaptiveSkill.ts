import { clampInt } from './sanitize';
import {
  BASE_SENTRY_ELO,
  bumpSentryEloOnUserWin,
  DEFAULT_START_SKILL,
  eloToSkill,
  ENGINE_ELO_CAP,
  MAX_SKILL,
  MIN_SKILL,
} from './rating';

export interface AdaptiveInput {
  currentSkill: number;
  meanCpl: number;
  accuracy?: number;
  result: 'win' | 'loss' | 'draw';
}

/**
 * Engine strength no longer slides from CPL.
 * Kept for call-site compatibility — returns the same skill unless unused.
 * Prefer {@link nextSentryEloAfterGame}.
 */
export const nextSkillLevel = (input: AdaptiveInput): number => {
  const current = clampInt(input.currentSkill, MIN_SKILL, MAX_SKILL, DEFAULT_START_SKILL);
  return current;
};

/** Persist Sentry Elo: +100 only on visitor win, else unchanged (floor 2000). */
export const nextSentryEloAfterGame = (
  currentSentryElo: number,
  result: 'win' | 'loss' | 'draw',
): number => {
  const cur = clampInt(currentSentryElo, BASE_SENTRY_ELO, ENGINE_ELO_CAP, BASE_SENTRY_ELO);
  if (result !== 'win') return cur;
  return bumpSentryEloOnUserWin(cur);
};

export const skillForSentryElo = (sentryElo: number): number => eloToSkill(sentryElo);

export const START_SKILL = DEFAULT_START_SKILL;
