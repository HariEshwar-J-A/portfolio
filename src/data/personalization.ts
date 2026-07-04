import { portfolioData, OfferingsData, MarketingData } from './portfolioData';
import type { SectionId } from '../store/slices/navigationSlice';
import type { FocusId } from '../store/slices/viewSlice';

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  'about',
  'skills',
  'experience',
  'education',
  'projects',
  'products',
  'achievements',
  'contact',
];

export interface FocusConfig {
  /** Personalized section order — most relevant first. */
  order: SectionId[];
  /** Sections HARI.AI highlights with a "picked for you" marker. */
  emphasized: SectionId[];
  /** Banner copy, in the AI's voice. */
  bannerTitle: string;
  bannerLine: string;
  /** Quick jump chips shown in the banner. */
  quickLinks: { label: string; section: SectionId }[];
}

export const FOCUS_CONFIGS: Record<FocusId, FocusConfig> = {
  hiring: {
    order: ['about', 'skills', 'experience', 'projects', 'education', 'achievements', 'products', 'contact'],
    emphasized: ['skills', 'experience', 'projects'],
    bannerTitle: 'Hiring mode',
    bannerLine: "I've reordered everything for a hiring decision: capabilities first, then the track record that backs them.",
    quickLinks: [
      { label: 'Skills', section: 'skills' },
      { label: 'Experience', section: 'experience' },
      { label: 'Projects', section: 'projects' },
      { label: 'Contact', section: 'contact' },
    ],
  },
  collaboration: {
    order: ['about', 'products', 'projects', 'skills', 'experience', 'achievements', 'education', 'contact'],
    emphasized: ['products', 'projects', 'contact'],
    bannerTitle: 'Collaboration mode',
    bannerLine: 'Builders first: his live product, shipped projects, and the fastest channel to start something together.',
    quickLinks: [
      { label: 'InfoSentry', section: 'products' },
      { label: 'Projects', section: 'projects' },
      { label: 'Contact', section: 'contact' },
    ],
  },
  personal: {
    order: ['about', 'achievements', 'projects', 'skills', 'experience', 'education', 'products', 'contact'],
    emphasized: ['achievements', 'contact'],
    bannerTitle: 'Off-the-clock mode',
    bannerLine: 'Chess, esports, drone photography, astrology — the fun layer lives in my Playground. The recognition wall is a good preview.',
    quickLinks: [
      { label: 'Achievements', section: 'achievements' },
      { label: 'Contact', section: 'contact' },
    ],
  },
  explore: {
    order: DEFAULT_SECTION_ORDER,
    emphasized: [],
    bannerTitle: 'Full tour',
    bannerLine: 'No filter — everything about my human, in his preferred order.',
    quickLinks: [],
  },
};

/**
 * Searchable text per section, always built from the COMPREHENSIVE
 * content — so smart search finds keywords even while the visitor is
 * in the minimalist view.
 */
export const buildSearchIndex = (): Record<SectionId, string> => {
  const { personal, experience, education, skills, projects, achievements, contact } = portfolioData;
  const flagship = OfferingsData.flagship;

  return {
    about: [
      personal.name,
      personal.title,
      personal.bio,
      MarketingData.headline,
      MarketingData.tagline,
      MarketingData.heroOrbitLabels.join(' '),
    ].join(' '),
    skills: [
      ...skills.flatMap((category) => [category.category, ...category.skills.map((s) => s.name)]),
      'frontend backend cloud devops iot ai genai data visualization years experience',
    ].join(' '),
    experience: experience
      .flatMap((exp) => [exp.company, exp.position, exp.location, exp.description, ...exp.achievements])
      .join(' '),
    education: education
      .flatMap((edu) => [edu.institution, edu.degree, edu.field, edu.location, edu.description ?? '', edu.gpa ?? ''])
      .join(' '),
    projects: projects
      .flatMap((project) => [project.title, project.description, ...project.technologies])
      .join(' '),
    products: [
      flagship.name,
      flagship.tagline,
      flagship.description,
      ...flagship.modules.flatMap((m) => [m.key, m.blurb]),
      ...flagship.stats.map((s) => `${s.value} ${s.label}`),
    ].join(' '),
    achievements: achievements.flatMap((a) => [a.title, a.description]).join(' '),
    contact: `contact email message hire reach location linkedin github collaborate ${contact.email} ${contact.location}`,
  };
};

/** Short snippet around the first match, for search result hints. */
export const matchSnippet = (text: string, query: string, radius = 34): string => {
  const lower = text.toLowerCase();
  const firstWord = query.toLowerCase().split(/\s+/).filter(Boolean)[0] ?? '';
  const index = firstWord ? lower.indexOf(firstWord) : -1;
  if (index === -1) return text.slice(0, radius * 2).trim();
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + firstWord.length + radius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
};
