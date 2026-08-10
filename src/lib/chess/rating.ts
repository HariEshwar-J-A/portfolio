import { HUMAN_RATING_ANCHOR } from '../../data/osIdentity';
import { clampInt } from './sanitize';

/** Engine ceiling matches the Harieshwar arena rating frame. */
export const ENGINE_ELO_CAP = HUMAN_RATING_ANCHOR;
export const ENGINE_ELO_FLOOR = 800;

/** Margin Sentry tries to keep above the visitor during a live match. */
export const SENTRY_CHASE_MARGIN = 140;

/** Approximate Elo for engine skill level 0–20. */
export const skillToElo = (skill: number): number => {
  const s = clampInt(skill, 0, 20, 4);
  return Math.round(ENGINE_ELO_FLOOR + s * ((ENGINE_ELO_CAP - ENGINE_ELO_FLOOR) / 20));
};

export const eloToSkill = (elo: number): number => {
  const e = clampInt(elo, ENGINE_ELO_FLOOR, ENGINE_ELO_CAP, 1040);
  return clampInt(
    Math.round(((e - ENGINE_ELO_FLOOR) / (ENGINE_ELO_CAP - ENGINE_ELO_FLOOR)) * 20),
    0,
    20,
    4,
  );
};

export const updateElo = (
  player: number,
  opponent: number,
  score: 0 | 0.5 | 1,
  k = 32,
): number => {
  const p = clampInt(player, 100, ENGINE_ELO_CAP, 800);
  const o = clampInt(opponent, 100, ENGINE_ELO_CAP, 1500);
  const expected = 1 / (1 + 10 ** ((o - p) / 400));
  return Math.round(p + k * (score - expected));
};

export const livePerformanceRating = (meanCpl: number, opponentElo: number): number => {
  const cpl = Number.isFinite(meanCpl) ? Math.max(0, meanCpl) : 80;
  const o = clampInt(opponentElo, ENGINE_ELO_FLOOR, ENGINE_ELO_CAP, 1040);
  const offset = (50 - cpl) * 8;
  return clampInt(Math.round(o + offset), 400, ENGINE_ELO_CAP, o);
};

/**
 * Raise Sentry's live rating as the visitor improves — never easier mid-match.
 * Stay ahead so the user does not win easily; cap at Hari's ceiling.
 */
export const chaseSentryRating = (visitorLive: number, currentSentry: number): number => {
  const target = Math.min(ENGINE_ELO_CAP, visitorLive + SENTRY_CHASE_MARGIN);
  return clampInt(Math.max(currentSentry, target), ENGINE_ELO_FLOOR, ENGINE_ELO_CAP, currentSentry);
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
export const DEFAULT_START_SKILL = 4;
export const MAX_SKILL = 20;
export const MIN_SKILL = 0;
