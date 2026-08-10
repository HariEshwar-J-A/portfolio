import { clampInt } from './sanitize';

/** Approximate Elo for engine skill level 0–20 (Sentry strength band). */
export const skillToElo = (skill: number): number => {
  const s = clampInt(skill, 0, 20, 4);
  // Rough calibrated curve: 0≈800 … 20≈2000 (Hari anchor ceiling for this arena)
  return Math.round(800 + s * 60);
};

export const eloToSkill = (elo: number): number => {
  const e = clampInt(elo, 800, 2000, 1040);
  return clampInt(Math.round((e - 800) / 60), 0, 20, 4);
};

export const updateElo = (
  player: number,
  opponent: number,
  score: 0 | 0.5 | 1,
  k = 32,
): number => {
  const p = clampInt(player, 100, 3000, 800);
  const o = clampInt(opponent, 100, 3000, 1500);
  const expected = 1 / (1 + 10 ** ((o - p) / 400));
  return Math.round(p + k * (score - expected));
};

/**
 * Live performance rating inside a single match from mean centipawn loss.
 * ~50 CPL ≈ equal to the bot; cleaner play climbs above it, blunders fall below.
 */
export const livePerformanceRating = (meanCpl: number, opponentElo: number): number => {
  const cpl = Number.isFinite(meanCpl) ? Math.max(0, meanCpl) : 80;
  const o = clampInt(opponentElo, 400, 2400, 1040);
  const offset = (50 - cpl) * 8;
  return clampInt(Math.round(o + offset), 400, 2400, o);
};

/**
 * Final rating after a match: mostly in-match performance, light nudge from result.
 */
export const settleMatchRating = (
  matchPerf: number,
  opponentElo: number,
  score: 0 | 0.5 | 1,
): number => {
  const perf = clampInt(matchPerf, 400, 2400, opponentElo);
  const withResult = updateElo(perf, opponentElo, score, 16);
  return clampInt(Math.round(perf * 0.75 + withResult * 0.25), 400, 2400, perf);
};

export const INITIAL_VISITOR_ELO = 800;
export const DEFAULT_START_SKILL = 4;
export const MAX_SKILL = 20;
export const MIN_SKILL = 0;
