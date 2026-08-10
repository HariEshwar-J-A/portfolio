import { AGENT_NAME, HUMAN_NAME, HUMAN_RATING_ANCHOR } from './osIdentity';

export interface ChessUnlock {
  id: string;
  title: string;
  body: string;
  /** Minimum settled/live match Elo to unlock (0 = other criteria). */
  minElo?: number;
  /** Minimum games played. */
  minGames?: number;
  /** Minimum wins vs Sentry. */
  minWins?: number;
  /** Minimum plies played in a single match. */
  minMatchPlies?: number;
}

/** Facts about Harieshwar's chess life — unlocked as visitors level up in the arena. */
export const CHESS_UNLOCKS: ChessUnlock[] = [
  {
    id: 'captain',
    title: 'College captain',
    body: `${HUMAN_NAME} captained his college chess team — boards, clocks, and pep talks.`,
    minMatchPlies: 6,
  },
  {
    id: 'zonal',
    title: 'Zonal podiums',
    body: 'Three consecutive years of zonal podium finishes. Pressure was a habit.',
    minElo: 1000,
  },
  {
    id: 'coach',
    title: 'From 4 to 50',
    body: 'He coached a 4-player squad into a 50-player program. Teaching is part of the game.',
    minGames: 1,
  },
  {
    id: 'lifestyle',
    title: 'Chess as lifestyle',
    body: `On this site, chess isn't a hobby badge — it's how ${HUMAN_NAME} thinks ten moves ahead.`,
    minWins: 1,
  },
  {
    id: 'gap',
    title: 'The real board',
    body: `Sentry is his bot. The human anchors near ~${HUMAN_RATING_ANCHOR} Elo here — challenge HariEshwar on Lichess for the real thing.`,
    minElo: 1200,
  },
  {
    id: 'grind',
    title: 'Keep climbing',
    body: `${AGENT_NAME} will keep raising the ceiling as you improve. The gap to ${HUMAN_NAME} is the point of the climb.`,
    minElo: 1600,
  },
];

export const chessLevelFor = (opts: {
  visitorElo: number;
  gamesPlayed: number;
  userWins: number;
}): number => {
  const fromElo = Math.max(0, Math.floor((opts.visitorElo - 800) / 150));
  const fromGames = Math.floor(opts.gamesPlayed / 2);
  const fromWins = opts.userWins;
  return 1 + fromElo + fromGames + fromWins;
};

export const unlocksEarned = (opts: {
  visitorElo: number;
  gamesPlayed: number;
  userWins: number;
  matchPlies: number;
  already: string[];
}): ChessUnlock[] => {
  const have = new Set(opts.already);
  return CHESS_UNLOCKS.filter((u) => {
    if (have.has(u.id)) return false;
    if (u.minElo != null && opts.visitorElo < u.minElo) return false;
    if (u.minGames != null && opts.gamesPlayed < u.minGames) return false;
    if (u.minWins != null && opts.userWins < u.minWins) return false;
    if (u.minMatchPlies != null && opts.matchPlies < u.minMatchPlies) return false;
    return true;
  });
};
