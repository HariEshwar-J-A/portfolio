import { HUMAN_RATING_ANCHOR } from '../../data/osIdentity';
import { clampInt } from './sanitize';

/** Fixed baseline — Sentry stays here until the visitor beats it. */
export const BASE_SENTRY_ELO = 2000;
/** After each visitor win, Sentry climbs by this much (never mid-match). */
export const SENTRY_ELO_STEP = 100;
/** Ceiling matches the Harieshwar arena rating frame. */
export const ENGINE_ELO_CAP = HUMAN_RATING_ANCHOR;
export const ENGINE_ELO_FLOOR = 800;

/** Map engine Elo → Stockfish skill 0–20 (2000 ≈ skill 11). */
export const eloToSkill = (elo: number): number => {
  const e = clampInt(elo, ENGINE_ELO_FLOOR, ENGINE_ELO_CAP, BASE_SENTRY_ELO);
  return clampInt(
    Math.round(((e - ENGINE_ELO_FLOOR) / (ENGINE_ELO_CAP - ENGINE_ELO_FLOOR)) * 20),
    0,
    20,
    11,
  );
};

export const skillToElo = (skill: number): number => {
  const s = clampInt(skill, 0, 20, 11);
  return Math.round(ENGINE_ELO_FLOOR + s * ((ENGINE_ELO_CAP - ENGINE_ELO_FLOOR) / 20));
};

/** Raise Sentry only when the visitor wins a finished game. */
export const bumpSentryEloOnUserWin = (currentSentryElo: number): number => {
  const cur = clampInt(currentSentryElo, BASE_SENTRY_ELO, ENGINE_ELO_CAP, BASE_SENTRY_ELO);
  return clampInt(cur + SENTRY_ELO_STEP, BASE_SENTRY_ELO, ENGINE_ELO_CAP, cur);
};

export const updateElo = (
  player: number,
  opponent: number,
  score: 0 | 0.5 | 1,
  k = 32,
): number => {
  const p = clampInt(player, 100, ENGINE_ELO_CAP, 800);
  const o = clampInt(opponent, 100, ENGINE_ELO_CAP, BASE_SENTRY_ELO);
  const expected = 1 / (1 + 10 ** ((o - p) / 400));
  return Math.round(p + k * (score - expected));
};

export const livePerformanceRating = (meanCpl: number, opponentElo: number): number => {
  const cpl = Number.isFinite(meanCpl) ? Math.max(0, meanCpl) : 80;
  const o = clampInt(opponentElo, ENGINE_ELO_FLOOR, ENGINE_ELO_CAP, BASE_SENTRY_ELO);
  const offset = (50 - cpl) * 8;
  return clampInt(Math.round(o + offset), 400, ENGINE_ELO_CAP, o);
};

export const settleMatchRating = (
  matchPerf: number,
  opponentElo: number,
  score: 0 | 0.5 | 1,
): number => {
  const perf = clampInt(matchPerf, 400, ENGINE_ELO_CAP, opponentElo);
  const withResult = updateElo(perf, opponentElo, score, 16);
  return clampInt(Math.round(perf * 0.75 + withResult * 0.25), 400, ENGINE_ELO_CAP, perf);
};

export const ratingGapToHari = (visitorElo: number): number =>
  Math.max(0, HUMAN_RATING_ANCHOR - clampInt(visitorElo, 0, ENGINE_ELO_CAP, 800));

export { HUMAN_RATING_ANCHOR };
export const INITIAL_VISITOR_ELO = 800;
export const DEFAULT_START_SKILL = eloToSkill(BASE_SENTRY_ELO);
export const MAX_SKILL = 20;
export const MIN_SKILL = 0;
