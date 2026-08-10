import { describe, expect, it } from 'vitest';
import {
  BASE_SENTRY_ELO,
  bumpSentryEloOnUserWin,
  eloToSkill,
  livePerformanceRating,
  settleMatchRating,
  skillToElo,
  updateElo,
} from './rating';
import { nextSentryEloAfterGame, nextSkillLevel } from './adaptiveSkill';

describe('rating', () => {
  it('maps 2000 Elo near mid-high skill', () => {
    expect(eloToSkill(BASE_SENTRY_ELO)).toBe(11);
    expect(skillToElo(11)).toBe(2010);
    expect(eloToSkill(3000)).toBe(20);
  });

  it('bumps Sentry by 100 on visitor wins only', () => {
    expect(bumpSentryEloOnUserWin(2000)).toBe(2100);
    expect(bumpSentryEloOnUserWin(2900)).toBe(3000);
    expect(bumpSentryEloOnUserWin(3000)).toBe(3000);
    expect(nextSentryEloAfterGame(2000, 'win')).toBe(2100);
    expect(nextSentryEloAfterGame(2100, 'loss')).toBe(2100);
    expect(nextSentryEloAfterGame(2100, 'draw')).toBe(2100);
  });

  it('updates elo after a win vs stronger opponent', () => {
    const next = updateElo(800, 1400, 1, 32);
    expect(next).toBeGreaterThan(800);
  });

  it('estimates higher live rating for low CPL vs the bot', () => {
    const opp = 2000;
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
  it('no longer slides skill from CPL', () => {
    expect(
      nextSkillLevel({ currentSkill: 11, meanCpl: 30, accuracy: 90, result: 'win' }),
    ).toBe(11);
  });
});
