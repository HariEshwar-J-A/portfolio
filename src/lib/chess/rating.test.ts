import { describe, expect, it } from 'vitest';
import {
  chaseSentryRating,
  eloToSkill,
  livePerformanceRating,
  settleMatchRating,
  skillToElo,
  updateElo,
} from './rating';
import { nextSkillLevel } from './adaptiveSkill';

describe('rating', () => {
  it('maps skill to elo within arena band', () => {
    expect(skillToElo(0)).toBe(800);
    expect(skillToElo(20)).toBe(3000);
    expect(eloToSkill(3000)).toBe(20);
  });

  it('chases visitor live rating without easing mid-match', () => {
    expect(chaseSentryRating(1200, 1000)).toBe(1340);
    expect(chaseSentryRating(1100, 1340)).toBe(1340);
    expect(chaseSentryRating(2900, 2800)).toBe(3000);
  });

  it('updates elo after a win vs stronger opponent', () => {
    const next = updateElo(800, 1400, 1, 32);
    expect(next).toBeGreaterThan(800);
  });

  it('estimates higher live rating for low CPL vs the bot', () => {
    const opp = 1040;
    const sharp = livePerformanceRating(20, opp);
    const messy = livePerformanceRating(120, opp);
    expect(sharp).toBeGreaterThan(opp);
    expect(messy).toBeLessThan(opp);
  });

  it('settles match rating near performance with a result nudge', () => {
    const settled = settleMatchRating(1400, 1200, 1);
    expect(settled).toBeGreaterThan(1300);
    expect(settled).toBeLessThan(1500);
  });
});

describe('adaptiveSkill', () => {
  it('raises skill after accurate win', () => {
    expect(
      nextSkillLevel({ currentSkill: 4, meanCpl: 30, accuracy: 90, result: 'win' }),
    ).toBeGreaterThan(4);
  });

  it('lowers skill after blunder-heavy loss and clamps per game', () => {
    const next = nextSkillLevel({ currentSkill: 10, meanCpl: 200, accuracy: 40, result: 'loss' });
    expect(next).toBeLessThan(10);
    expect(10 - next).toBeLessThanOrEqual(3);
  });
});
