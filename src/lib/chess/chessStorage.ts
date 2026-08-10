import { AGENT_NAME } from '../../data/osIdentity';
import { clampInt } from './sanitize';
import {
  BASE_SENTRY_ELO,
  DEFAULT_START_SKILL,
  eloToSkill,
  ENGINE_ELO_CAP,
  INITIAL_VISITOR_ELO,
} from './rating';

/**
 * v2 = one-time arena reset (Aug 2026).
 * Old `hari-os-chess-v1` (and earlier) saves are discarded so every client
 * starts at Sentry 2000 instead of carrying stale low skill / Elo.
 */
export const CHESS_STORAGE_KEY = 'hari-os-chess-v2';
const LEGACY_CHESS_STORAGE_KEYS = ['hari-os-chess-v1', 'hari-os-chess'] as const;

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

/** Drop pre-v2 local saves once per browser (idempotent). */
export const purgeLegacyChessStorage = (): void => {
  try {
    for (const key of LEGACY_CHESS_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
  } catch {
    /* private mode / blocked storage */
  }
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
  // Trust only explicit v2 sentryElo; never reconstruct from legacy skill maps.
  const sentryElo =
    typeof raw.sentryElo === 'number' && Number.isFinite(raw.sentryElo)
      ? clampInt(raw.sentryElo, BASE_SENTRY_ELO, ENGINE_ELO_CAP, BASE_SENTRY_ELO)
      : BASE_SENTRY_ELO;

  return {
    userWins,
    sentryWins: clampInt(raw.sentryWins ?? raw.aiWins ?? raw.hariWins, 0, 1_000_000, 0),
    draws: clampInt(raw.draws, 0, 1_000_000, 0),
    visitorElo: clampInt(raw.visitorElo, 100, 3000, INITIAL_VISITOR_ELO),
    sentryElo,
    // Always derive skill from sentryElo so a stale skillLevel cannot weaken the engine.
    skillLevel: eloToSkill(sentryElo),
    gamesPlayed: clampInt(raw.gamesPlayed, 0, 1_000_000, 0),
    recentPgns,
    unlockedIds: Array.isArray(raw.unlockedIds)
      ? raw.unlockedIds.filter((id): id is string => typeof id === 'string').slice(0, 40)
      : [],
  };
};

export const readChessStats = (): ChessStats => {
  try {
    purgeLegacyChessStorage();
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
