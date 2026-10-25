import { describe, expect, it } from 'vitest';
import { HAT_LIST } from './hats';
import { sectionNarration } from './osPersona';
import { MarketingData, OfferingsData, portfolioData } from './portfolioData';
import { DEFAULT_SECTION_ORDER } from './personalization';
import { applyOrder, bulletsForHat, projectShortLine, splitLeadBullets } from '../lib/hatView';

const factCorpus = JSON.stringify({
  personal: portfolioData.personal,
  experience: portfolioData.experience,
  projects: portfolioData.projects,
  achievements: portfolioData.achievements,
  offerings: OfferingsData,
  proof: MarketingData.proofPoints,
});

describe('hat views', () => {
  const roles = new Map(portfolioData.experience.map((role) => [role.id, role]));
  const projectIds = new Set(portfolioData.projects.map((project) => project.id));
  const skillCategories = new Set(portfolioData.skills.map((category) => category.category));
  const achievementIds = new Set(portfolioData.achievements.map((item) => item.id));

  it('gives work, projects, and achievements stable unique ids', () => {
    expect(new Set(roles.keys()).size).toBe(portfolioData.experience.length);
    expect(projectIds.size).toBe(portfolioData.projects.length);
    expect(achievementIds.size).toBe(portfolioData.achievements.length);
    expect(roles.get('soliton-senior')?.company).toBe('Soliton Technologies');
    expect(roles.get('soliton-engineer')?.company).toBe('Soliton Technologies');
    expect(roles.get('soliton-intern')?.company).toBe('Soliton Technologies');
  });

  it.each(HAT_LIST)('$id only references ids and bullet indexes that exist', (hat) => {
    expect(new Set(hat.sectionOrder)).toEqual(new Set(DEFAULT_SECTION_ORDER));
    expect(hat.sectionOrder).toHaveLength(DEFAULT_SECTION_ORDER.length);

    for (const [roleId, leads] of Object.entries(hat.leadBullets)) {
      const role = roles.get(roleId);
      expect(role, roleId).toBeDefined();
      const seen = new Set<number>();
      for (const lead of leads) {
        expect(seen.has(lead.index), `${hat.id} ${roleId} #${lead.index}`).toBe(false);
        seen.add(lead.index);
        expect(lead.index).toBeGreaterThanOrEqual(0);
        expect(lead.index).toBeLessThan(role!.achievements.length);
        expect(role!.achievements[lead.index]).toContain(lead.includes);
      }
    }

    for (const id of hat.projectOrder) expect(projectIds.has(id), id).toBe(true);
    for (const category of hat.skillCategoryOrder) expect(skillCategories.has(category), category).toBe(true);
    for (const id of hat.achievementOrder) expect(achievementIds.has(id), id).toBe(true);

    for (const point of hat.proofPoints) {
      expect(factCorpus, point.metric).toContain(point.metric);
      const labelWords = point.label.trim().split(/\s+/);
      expect(labelWords.length, point.label).toBeGreaterThanOrEqual(2);
      expect(labelWords.length, point.label).toBeLessThanOrEqual(4);
    }

    expect(hat.summary.trim().split(/\s+/).length).toBeLessThanOrEqual(20);
    expect(hat.roleLine.toLowerCase().includes(hat.roleTitle.toLowerCase())).toBe(false);
    for (const leads of Object.values(hat.leadBullets)) {
      expect(leads.length).toBeGreaterThanOrEqual(1);
      expect(leads.length).toBeLessThanOrEqual(3);
    }
  });

  it('puts requested ids first and keeps the rest in original order', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
    expect(applyOrder(items, ['c', 'a'], (item) => item.id).map((item) => item.id)).toEqual([
      'c',
      'a',
      'b',
      'd',
    ]);
  });

  it('keeps a short project line inside the existing description', () => {
    for (const project of portfolioData.projects) {
      const line = projectShortLine(project.description);
      const normalized = project.description.replace(/\s+/g, ' ').trim();
      if (line.endsWith('…')) {
        expect(normalized.startsWith(line.slice(0, -1))).toBe(true);
      } else {
        expect(line).toBe(normalized);
      }
    }
  });

  it('caps hat bullets and shows every bullet off a hat', () => {
    const bullets = ['a', 'b', 'c', 'd', 'e'];
    expect(bulletsForHat(bullets, undefined, false)).toEqual({ lead: bullets, rest: [] });
    expect(bulletsForHat(bullets, undefined, true)).toEqual({
      lead: ['a', 'b'],
      rest: ['c', 'd', 'e'],
    });
    expect(
      bulletsForHat(
        bullets,
        [
          { index: 4, includes: 'e' },
          { index: 1, includes: 'b' },
          { index: 0, includes: 'a' },
          { index: 2, includes: 'c' },
        ],
        true
      )
    ).toEqual({ lead: ['e', 'b', 'a'], rest: ['c', 'd'] });
  });

  it('does not publish freelance client names or client sites', () => {
    const published = JSON.stringify({
      experience: portfolioData.experience,
      projects: portfolioData.projects,
      achievements: portfolioData.achievements,
      personal: portfolioData.personal,
      offerings: OfferingsData,
      marketing: MarketingData,
      hats: HAT_LIST,
      narration: sectionNarration,
    });
    expect(published).not.toMatch(/world sports|worldsports|worldsportsacademy|\bWSA\b/i);
  });

  it('folds non-lead bullets after the configured ones', () => {
    const bullets = ['a', 'b', 'c', 'd'];
    expect(splitLeadBullets(bullets)).toEqual({ lead: bullets, rest: [] });
    expect(
      splitLeadBullets(bullets, [
        { index: 2, includes: 'c' },
        { index: 0, includes: 'a' },
      ])
    ).toEqual({ lead: ['c', 'a'], rest: ['b', 'd'] });
  });
});
