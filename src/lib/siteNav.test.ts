import { describe, expect, it } from 'vitest';
import { HAT_LIST } from '../data/hats';
import {
  ALL_SECTION_IDS,
  MORE_SECTIONS,
  PLAY_LINKS,
  PRIMARY_SECTIONS,
  activePlayId,
  hatForPath,
  isPortfolioPath,
  portfolioShellKey,
} from './siteNav';

describe('site nav', () => {
  it('shows four primary section labels and parks the rest in one menu', () => {
    expect(PRIMARY_SECTIONS).toHaveLength(4);
    expect(PRIMARY_SECTIONS.map((section) => section.label)).toEqual([
      'About',
      'Work',
      'Projects',
      'Contact',
    ]);
    const ids = [...PRIMARY_SECTIONS, ...MORE_SECTIONS].map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual([...ALL_SECTION_IDS].sort());
  });

  it('treats home and hats as one shell and leaves play routes alone', () => {
    expect(isPortfolioPath('/')).toBe(true);
    expect(isPortfolioPath('/full-stack')).toBe(true);
    expect(isPortfolioPath('/ai-engineer/')).toBe(true);
    expect(isPortfolioPath('/ai')).toBe(false);
    expect(isPortfolioPath('/3d')).toBe(false);
    expect(isPortfolioPath('/os')).toBe(false);
    expect(isPortfolioPath('/ops')).toBe(false);
    expect(isPortfolioPath('/privacy')).toBe(false);
    expect(PRIMARY_SECTIONS.some((section) => section.label === 'Privacy')).toBe(false);
    expect(PRIMARY_SECTIONS.some((section) => section.label === 'Ops')).toBe(false);
    expect(portfolioShellKey('/full-stack')).toBe('portfolio');
    expect(portfolioShellKey('/')).toBe(portfolioShellKey('/ai-engineer'));
    expect(portfolioShellKey('/ai')).toBe('/ai');
    expect(hatForPath('/full-stack')?.id).toBe('full-stack');
    expect(hatForPath('/')).toBeNull();
    expect(HAT_LIST.every((hat) => hatForPath(hat.path)?.id === hat.id)).toBe(true);
  });

  it('keeps play on the existing urls', () => {
    expect(PLAY_LINKS.map((link) => link.to)).toEqual(['/ai', '/ai?game=chess', '/3d']);
    expect(activePlayId('/ai', null)).toBe('playground');
    expect(activePlayId('/ai', 'chess')).toBe('chess');
    expect(activePlayId('/3d', null)).toBe('3d');
    expect(activePlayId('/', null)).toBeNull();
  });
});
