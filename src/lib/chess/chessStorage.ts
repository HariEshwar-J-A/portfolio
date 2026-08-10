import { AGENT_NAME } from '../../data/osIdentity';
import { clampInt } from './sanitize';
import {
  BASE_SENTRY_ELO,
  DEFAULT_START_SKILL,
  eloToSkill,
  ENGINE_ELO_CAP,
  INITIAL_VISITOR_ELO,
  MAX_SKILL,
  MIN_SKILL,
  SENTRY_ELO_STEP,
} from './rating';

export const CHESS_STORAGE_KEY = 'hari-os-chess-v1';

export interface ChessStats {
  userWins: number;
  sentryWins: number;
  draws: number;
  visitorElo: number;
  /** Persistent Sentry strength — starts at 2000, +100 per visitor win. */
  sentryElo: number;
  skillLevel: number;
  gamesPlayed: number;
  recentPgns: { id: string; pgn: string; endedAt: string }[];
  unlockedIds: string[];
}

export const EMPTY_CHESS_STATS: ChessStats = {
  userWins: 0,
  sentryWins: 0,
  draws: 0,
  visitorElo: INITIAL_VISITOR_ELO,
  sentryElo: BASE_SENTRY_ELO,
  skillLevel: DEFAULT_START_SKILL,
  gamesPlayed: 0,
  recentPgns: [],
  unlockedIds: [],
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const migrateSentryElo = (raw: Record<string, unknown>, userWins: number): number => {
  if (typeof raw.sentryElo === 'number' && Number.isFinite(raw.sentryElo)) {
    return clampInt(raw.sentryElo, BASE_SENTRY_ELO, ENGINE_ELO_CAP, BASE_SENTRY_ELO);
  }
  // Older saves: reconstruct from wins (one step per win) rather than noisy skill map.
  return clampInt(
    BASE_SENTRY_ELO + userWins * SENTRY_ELO_STEP,
    BASE_SENTRY_ELO,
    ENGINE_ELO_CAP,
    BASE_SENTRY_ELO,
  );
};

export const parseChessStats = (raw: unknown): ChessStats => {
  if (!isRecord(raw)) return { ...EMPTY_CHESS_STATS };

  const recentPgns: ChessStats['recentPgns'] = [];
  if (Array.isArray(raw.recentPgns)) {
    for (const item of raw.recentPgns.slice(0, 20)) {
      if (!isRecord(item)) continue;
      if (typeof item.id !== 'string' || typeof item.pgn !== 'string') continue;
      if (item.pgn.length > 50_000) continue;
      recentPgns.push({
        id: item.id.slice(0, 64),
        pgn: item.pgn.slice(0, 50_000),
        endedAt: typeof item.endedAt === 'string' ? item.endedAt.slice(0, 40) : new Date().toISOString(),
      });
    }
  }

  const userWins = clampInt(raw.userWins, 0, 1_000_000, 0);
  const sentryElo = migrateSentryElo(raw, userWins);

  return {
    userWins,
    sentryWins: clampInt(raw.sentryWins ?? raw.aiWins ?? raw.hariWins, 0, 1_000_000, 0),
    draws: clampInt(raw.draws, 0, 1_000_000, 0),
    visitorElo: clampInt(raw.visitorElo, 100, 3000, INITIAL_VISITOR_ELO),
    sentryElo,
    skillLevel: clampInt(raw.skillLevel, MIN_SKILL, MAX_SKILL, eloToSkill(sentryElo)),
    gamesPlayed: clampInt(raw.gamesPlayed, 0, 1_000_000, 0),
    recentPgns,
    unlockedIds: Array.isArray(raw.unlockedIds)
      ? raw.unlockedIds.filter((id): id is string => typeof id === 'string').slice(0, 40)
      : [],
  };
};

export const readChessStats = (): ChessStats => {
  try {
    const raw = window.localStorage.getItem(CHESS_STORAGE_KEY);
    if (!raw) return { ...EMPTY_CHESS_STATS };
    return parseChessStats(JSON.parse(raw) as unknown);
  } catch {
    return { ...EMPTY_CHESS_STATS };
  }
};

export const writeChessStats = (stats: ChessStats): void => {
  const safe = parseChessStats(stats);
  window.localStorage.setItem(CHESS_STORAGE_KEY, JSON.stringify(safe));
};

export const scoreboardLabel = () =>
  ({ you: 'You', sentry: AGENT_NAME }) as const;
