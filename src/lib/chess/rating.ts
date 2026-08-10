import { clampInt } from './sanitize';

/** Approximate Elo for Stockfish UCI_LimitStrength Skill Level 0–20. */
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

export const INITIAL_VISITOR_ELO = 800;
export const DEFAULT_START_SKILL = 4;
export const MAX_SKILL = 20;
export const MIN_SKILL = 0;
