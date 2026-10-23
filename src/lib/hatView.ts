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
