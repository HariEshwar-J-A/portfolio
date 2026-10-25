import type { SectionId } from '../store/slices/navigationSlice';
import { HAT_LIST, isHatPath, type HatConfig } from '../data/hats';

export interface SectionLink {
  id: SectionId;
  label: string;
}

/** The only section links in the bar. Everything else is in the compact menu or ⌘K. */
export const PRIMARY_SECTIONS: readonly SectionLink[] = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export const MORE_SECTIONS: readonly SectionLink[] = [
  { id: 'skills', label: 'Skills' },
  { id: 'products', label: 'Products' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'education', label: 'Education' },
];

export interface PlayLink {
  id: 'playground' | 'chess' | '3d';
  label: string;
  description: string;
  to: string;
}

/** One playful entry. Chess stays on /ai; /os still redirects there. */
export const PLAY_LINKS: readonly PlayLink[] = [
  {
    id: 'playground',
    label: 'AI Playground',
    description: 'Quizzes and puzzles',
    to: '/ai',
  },
  {
    id: 'chess',
    label: 'Chess Arena',
    description: 'Timed duel against Sentry',
    to: '/ai?game=chess',
  },
  {
    id: '3d',
    label: '3D Portfolio',
    description: 'Spatial walkthrough',
    to: '/3d',
  },
];

export const normalizePath = (pathname: string): string =>
  pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

export const isPortfolioPath = (pathname: string): boolean => {
  const path = normalizePath(pathname);
  return path === '/' || isHatPath(path);
};

export const hatForPath = (pathname: string): HatConfig | null => {
  const path = normalizePath(pathname);
  return HAT_LIST.find((hat) => hat.path === path) ?? null;
};

/** Home and hats share one shell so the header does not remount when the role changes. */
export const portfolioShellKey = (pathname: string): string =>
  isPortfolioPath(pathname) ? 'portfolio' : normalizePath(pathname);

export const activePlayId = (pathname: string, game: string | null): PlayLink['id'] | null => {
  const path = normalizePath(pathname);
  if (path === '/3d') return '3d';
  if (path === '/ai') return game === 'chess' ? 'chess' : 'playground';
  return null;
};

export const ALL_SECTION_IDS: readonly SectionId[] = [
  'about',
  'skills',
  'experience',
  'education',
  'projects',
  'products',
  'achievements',
  'contact',
];
