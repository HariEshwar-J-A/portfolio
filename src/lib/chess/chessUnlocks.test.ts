import { describe, expect, it } from 'vitest';
import { unlocksEarned, chessLevelFor } from '../../data/chessUnlocks';

describe('chessUnlocks', () => {
  it('unlocks captain after enough plies', () => {
    const earned = unlocksEarned({
      visitorElo: 800,
      gamesPlayed: 0,
      userWins: 0,
      matchPlies: 6,
      already: [],
    });
    expect(earned.some((u) => u.id === 'captain')).toBe(true);
  });

  it('does not re-unlock', () => {
    const earned = unlocksEarned({
      visitorElo: 2000,
      gamesPlayed: 10,
      userWins: 5,
      matchPlies: 40,
      already: ['captain', 'zonal', 'coach', 'lifestyle', 'gap', 'grind'],
    });
    expect(earned).toHaveLength(0);
  });

  it('levels up from elo and activity', () => {
    expect(chessLevelFor({ visitorElo: 800, gamesPlayed: 0, userWins: 0 })).toBe(1);
    expect(chessLevelFor({ visitorElo: 1100, gamesPlayed: 2, userWins: 1 })).toBeGreaterThan(1);
  });
});
