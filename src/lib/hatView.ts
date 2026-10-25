import type { LeadBullet } from '../data/hats';

/**
 * Move `order` ids to the front. Items not listed keep their original
 * relative order after the requested ones.
 */
export const applyOrder = <T>(
  items: readonly T[],
  order: readonly string[],
  idOf: (item: T) => string
): T[] => {
  const rank = new Map(order.map((id, index) => [id, index]));
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aRank = rank.get(idOf(a.item));
      const bRank = rank.get(idOf(b.item));
      return (aRank ?? order.length + a.index) - (bRank ?? order.length + b.index);
    })
    .map(({ item }) => item);
};

export const HAT_LEAD_CAP = 3;
export const HAT_FALLBACK_BULLETS = 2;
export const HAT_PROJECT_PREVIEW = 3;
export const HAT_ACHIEVEMENT_PREVIEW = 3;

/** Lead bullets first, in the configured order. The rest stay in source order. */
export const splitLeadBullets = (
  bullets: readonly string[],
  leads?: readonly LeadBullet[]
): { lead: string[]; rest: string[] } => {
  if (!leads || leads.length === 0) return { lead: [...bullets], rest: [] };
  const leadIndexes = new Set(leads.map((lead) => lead.index));
  const lead = leads
    .filter((entry) => entry.index >= 0 && entry.index < bullets.length)
    .map((entry) => bullets[entry.index]);
  const rest = bullets.filter((_, index) => !leadIndexes.has(index));
  return { lead, rest };
};

/**
 * On a hat, show at most three configured leads (or the first two bullets
 * when a role has no lead list). Off a hat, show every bullet.
 */
export const bulletsForHat = (
  bullets: readonly string[],
  leads: readonly LeadBullet[] | undefined,
  active: boolean
): { lead: string[]; rest: string[] } => {
  if (!active) return splitLeadBullets(bullets, leads);
  const source =
    leads && leads.length > 0
      ? leads.slice(0, HAT_LEAD_CAP)
      : bullets.slice(0, HAT_FALLBACK_BULLETS).map((includes, index) => ({ index, includes }));
  return splitLeadBullets(bullets, source);
};

/** First words of an existing description. Nothing is added. */
export const projectShortLine = (description: string, maxWords = 12): string => {
  const words = description.replace(/\s+/g, ' ').trim().split(' ');
  if (words.length <= maxWords) return words.join(' ');
  return `${words.slice(0, maxWords).join(' ').replace(/[,:;–—-]+$/, '')}…`;
};
