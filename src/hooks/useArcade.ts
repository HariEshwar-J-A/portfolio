import { useCallback, useEffect, useRef, useState } from 'react';
import { quizQuestions } from '../data/arcadeData';

const STORAGE_KEY = 'hari-ai-arcade-v1';

export interface ArcadeStats {
  xp: number;
  answers: number;
  correct: number;
  bestStreak: number;
  scrambleSolves: number;
  memoryWins: number;
  fragments: string[];
}

const EMPTY_STATS: ArcadeStats = {
  xp: 0,
  answers: 0,
  correct: 0,
  bestStreak: 0,
  scrambleSolves: 0,
  memoryWins: 0,
  fragments: [],
};

const readStats = (): ArcadeStats => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATS;
    const parsed = JSON.parse(raw) as Partial<ArcadeStats>;
    return {
      ...EMPTY_STATS,
      ...parsed,
      fragments: Array.isArray(parsed.fragments) ? parsed.fragments : [],
    };
  } catch {
    return EMPTY_STATS;
  }
};

/** Unbounded level curve — there is always a next level. */
export const levelForXp = (xp: number) => Math.floor(Math.sqrt(xp / 60)) + 1;
export const xpForLevel = (level: number) => Math.ceil(60 * (level - 1) ** 2);

export interface Achievement {
  id: string;
  label: string;
  detail: string;
  unlocked: boolean;
}

const buildAchievements = (stats: ArcadeStats): Achievement[] => {
  const level = levelForXp(stats.xp);
  const ladder: Achievement[] = [
    { id: 'first-sync', label: 'First sync', detail: 'Answer your first question', unlocked: stats.answers >= 1 },
    { id: 'streak-5', label: 'Locked in', detail: 'Hit a 5-answer streak', unlocked: stats.bestStreak >= 5 },
    { id: 'streak-10', label: 'Diamond focus', detail: 'Hit a 10-answer streak', unlocked: stats.bestStreak >= 10 },
    { id: 'fragments-10', label: 'Archivist', detail: 'Decode 10 memory fragments', unlocked: stats.fragments.length >= 10 },
    {
      id: 'fragments-all',
      label: 'Full picture',
      detail: `Decode all ${quizQuestions.length} fragments`,
      unlocked: stats.fragments.length >= quizQuestions.length,
    },
    { id: 'scramble-5', label: 'Cipher apprentice', detail: 'Solve 5 scrambles', unlocked: stats.scrambleSolves >= 5 },
    { id: 'scramble-25', label: 'Cipher master', detail: 'Solve 25 scrambles', unlocked: stats.scrambleSolves >= 25 },
    { id: 'memory-3', label: 'Pattern seeker', detail: 'Clear the grid 3 times', unlocked: stats.memoryWins >= 3 },
  ];
  // Endless level milestones: always show the next locked one.
  const milestones = [5, 10, 15, 25, 50, 100];
  const nextIndex = milestones.findIndex((m) => level < m);
  const shown = nextIndex === -1 ? milestones : milestones.slice(0, nextIndex + 1);
  shown.forEach((milestone) =>
    ladder.push({
      id: `level-${milestone}`,
      label: `Level ${milestone}`,
      detail: `Reach explorer level ${milestone}`,
      unlocked: level >= milestone,
    })
  );
  return ladder;
};

/**
 * Persistent, never-ending progression for the HARI.AI Playground:
 * unbounded XP/levels, streaks, fragment discovery, and an achievement
 * ladder that always dangles the next milestone.
 */
export const useArcade = () => {
  const [stats, setStats] = useState<ArcadeStats>(readStats);
  const [lastLevelUp, setLastLevelUp] = useState<number | null>(null);
  const levelRef = useRef(levelForXp(stats.xp));

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Private mode — progress lives for this session only.
    }
  }, [stats]);

  const applyXp = useCallback((patch: Partial<ArcadeStats>, gained: number) => {
    setStats((current) => {
      const next = { ...current, ...patch, xp: current.xp + gained };
      const newLevel = levelForXp(next.xp);
      if (newLevel > levelRef.current) {
        levelRef.current = newLevel;
        setLastLevelUp(newLevel);
      }
      return next;
    });
  }, []);

  const recordAnswer = useCallback(
    (isCorrect: boolean, fragmentId: string, streak: number) => {
      setStats((current) => {
        const fragments = current.fragments.includes(fragmentId)
          ? current.fragments
          : [...current.fragments, fragmentId];
        const gained = isCorrect ? 40 + Math.min(streak, 5) * 10 : 5;
        const next: ArcadeStats = {
          ...current,
          answers: current.answers + 1,
          correct: current.correct + (isCorrect ? 1 : 0),
          bestStreak: Math.max(current.bestStreak, isCorrect ? streak : 0),
          fragments,
          xp: current.xp + gained,
        };
        const newLevel = levelForXp(next.xp);
        if (newLevel > levelRef.current) {
          levelRef.current = newLevel;
          setLastLevelUp(newLevel);
        }
        return next;
      });
    },
    []
  );

  const recordScramble = useCallback(() => {
    setStats((current) => {
      const next = { ...current, scrambleSolves: current.scrambleSolves + 1, xp: current.xp + 60 };
      const newLevel = levelForXp(next.xp);
      if (newLevel > levelRef.current) {
        levelRef.current = newLevel;
        setLastLevelUp(newLevel);
      }
      return next;
    });
  }, []);

  const recordMemoryWin = useCallback(() => {
    setStats((current) => {
      const next = { ...current, memoryWins: current.memoryWins + 1, xp: current.xp + 120 };
      const newLevel = levelForXp(next.xp);
      if (newLevel > levelRef.current) {
        levelRef.current = newLevel;
        setLastLevelUp(newLevel);
      }
      return next;
    });
  }, []);

  const clearLevelUp = useCallback(() => setLastLevelUp(null), []);

  const level = levelForXp(stats.xp);
  const currentFloor = xpForLevel(level);
  const nextCeiling = xpForLevel(level + 1);
  const levelProgress = Math.min(1, (stats.xp - currentFloor) / Math.max(1, nextCeiling - currentFloor));

  return {
    stats,
    level,
    levelProgress,
    xpToNext: nextCeiling - stats.xp,
    achievements: buildAchievements(stats),
    lastLevelUp,
    clearLevelUp,
    recordAnswer,
    recordScramble,
    recordMemoryWin,
    applyXp,
  };
};
