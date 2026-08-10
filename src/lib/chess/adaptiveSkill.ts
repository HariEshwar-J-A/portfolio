import { clampInt } from './sanitize';
import { DEFAULT_START_SKILL, MAX_SKILL, MIN_SKILL } from './rating';

export interface AdaptiveInput {
  currentSkill: number;
  /** Mean centipawn loss for the visitor (lower = stronger). */
  meanCpl: number;
  /** 0–100 rough accuracy if available; optional. */
  accuracy?: number;
  result: 'win' | 'loss' | 'draw';
}

const PER_GAME_CLAMP = 3;

/**
 * Slide Stockfish skill so visitors stay challenged, not crushed.
 * High CPL / losses → easier; low CPL / wins → harder.
 */
export const nextSkillLevel = (input: AdaptiveInput): number => {
  const current = clampInt(input.currentSkill, MIN_SKILL, MAX_SKILL, DEFAULT_START_SKILL);
  const cpl = Number.isFinite(input.meanCpl) ? Math.max(0, input.meanCpl) : 80;

  let target = current;
  if (cpl > 120 || (input.accuracy !== undefined && input.accuracy < 55)) {
    target = current - 2;
  } else if (cpl > 80) {
    target = current - 1;
  } else if (cpl < 35 || (input.accuracy !== undefined && input.accuracy > 85)) {
    target = current + 2;
  } else if (cpl < 55) {
    target = current + 1;
  }

  if (input.result === 'win' && cpl < 70) target += 1;
  if (input.result === 'loss' && cpl > 90) target -= 1;

  const delta = Math.max(-PER_GAME_CLAMP, Math.min(PER_GAME_CLAMP, target - current));
  return clampInt(current + delta, MIN_SKILL, MAX_SKILL, current);
};

export const START_SKILL = DEFAULT_START_SKILL;
