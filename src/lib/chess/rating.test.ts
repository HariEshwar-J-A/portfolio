import { describe, expect, it } from 'vitest';
import { eloToSkill, skillToElo, updateElo } from './rating';
import { nextSkillLevel } from './adaptiveSkill';

describe('rating', () => {
  it('maps skill to elo within arena band', () => {
    expect(skillToElo(0)).toBe(800);
    expect(skillToElo(20)).toBe(2000);
    expect(eloToSkill(2000)).toBe(20);
  });

  it('updates elo after a win vs stronger opponent', () => {
    const next = updateElo(800, 1400, 1, 32);
    expect(next).toBeGreaterThan(800);
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
