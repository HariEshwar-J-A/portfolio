import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import type { SectionId } from '../store/slices/navigationSlice';

const STORAGE_KEY = 'portfolio-exploration-v1';
export const XP_PER_SECTION = 150;

export interface ExplorationRank {
  title: string;
  threshold: number;
}

const RANKS: ExplorationRank[] = [
  { title: 'Visitor', threshold: 0 },
  { title: 'Explorer', threshold: 0.25 },
  { title: 'Adventurer', threshold: 0.5 },
  { title: 'Architect', threshold: 0.75 },
  { title: 'Legend', threshold: 1 },
];

const readStoredSections = (validSections: SectionId[]): SectionId[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is SectionId => validSections.includes(id as SectionId));
  } catch {
    return [];
  }
};

/**
 * Gamified exploration state: tracks which sections the visitor has seen
 * (persisted across visits), derives XP, progress, and a rank title, and
 * exposes the most recent unlock so the HUD can toast it.
 */
export const useExploration = () => {
  const { activeSection, sections } = useSelector((state: RootState) => state.navigation);
  const [visited, setVisited] = useState<SectionId[]>(() => readStoredSections(sections));
  const [lastUnlock, setLastUnlock] = useState<SectionId | null>(null);

  useEffect(() => {
    setVisited((current) => {
      if (current.includes(activeSection)) return current;
      const next = [...current, activeSection];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable (private mode) — progress lives for this session only.
      }
      setLastUnlock(activeSection);
      return next;
    });
  }, [activeSection]);

  const clearUnlock = useCallback(() => setLastUnlock(null), []);

  const progress = sections.length === 0 ? 0 : visited.length / sections.length;
  const rank = RANKS.reduce((acc, candidate) => (progress >= candidate.threshold ? candidate : acc), RANKS[0]);
  const rankLevel = RANKS.indexOf(rank) + 1;

  return {
    sections,
    visited,
    progress,
    xp: visited.length * XP_PER_SECTION,
    rank: rank.title,
    rankLevel,
    isComplete: visited.length === sections.length,
    lastUnlock,
    clearUnlock,
  };
};
