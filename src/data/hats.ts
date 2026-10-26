import type { SectionId } from '../store/slices/navigationSlice';

export const SITE_ORIGIN = 'https://harieshwar.dev';
export const PROFILE_IMAGE_PATH = '/assets/images/profile-picture.jpg';

export type HatId = 'full-stack' | 'ai-engineer' | 'sde' | 'chess' | 'fde' | 'pm';

/** A bullet to surface first. `includes` is a phrase already in that bullet. */
export interface LeadBullet {
  index: number;
  includes: string;
}

export interface HatProofPoint {
  metric: string;
  label: string;
}

export interface HatConfig {
  id: HatId;
  path: string;
  label: string;
  roleTitle: string;
  /** Short line under the name. Does not repeat roleTitle. */
  roleLine: string;
  headline: string;
  /** On-screen support line. seo.description can be longer. */
  summary: string;
  primaryCta: { label: string; section: SectionId };
  sectionOrder: SectionId[];
  /** Per role id. Roles stay in date order; only these bullets move up. */
  leadBullets: Record<string, LeadBullet[]>;
  /** Ids to show first. Anything not listed keeps its original order after these. */
  projectOrder: string[];
  skillCategoryOrder: string[];
  achievementOrder: string[];
  proofPoints: HatProofPoint[];
  /** Quiet text links under the primary button. */
  links?: { label: string; href: string }[];
  /**
   * Verified rating only. Leave null when the repo has none.
   * TODO(harieshwar): chess has no verified rating in this repo.
   * osIdentity.HUMAN_RATING_ANCHOR is a site persona, not a rating. Do not render it.
   */
  rating?: string | null;
  /** One extra sentence of existing facts. Omitted on screen when unset. */
  detail?: string;
  seo: {
    title: string;
    description: string;
  };
}

const FULL_STACK_SUMMARY =
  '6+ years building web platforms across enterprise security, industrial IoT and consumer SaaS. At ECAM | GardaWorld I build Angular, Node.js and PostgreSQL apps; as a freelancer I shipped a sports academy booking platform on Next.js 15 with a full Stripe stack.';

const AI_ENGINEER_SUMMARY =
  'Built InfoSentry, a self-hosted platform with eight LLM agents, RAG on ChromaDB and budget-aware model routing under $7.30/month. At ECAM I led an organization-wide Cursor and GitHub Copilot pilot (60% productivity lift) and a Figma MCP design-to-code workflow.';

const fullStack: HatConfig = {
  id: 'full-stack',
  path: '/full-stack',
  label: 'Full-stack',
  roleTitle: 'Full-Stack Developer',
  roleLine: 'React, Angular, and Node.js',
  headline: 'Full-stack developer for enterprise software and SaaS.',
  summary: 'Six years with React, Angular, and Node.js on PostgreSQL.',
  primaryCta: { label: 'See the work', section: 'experience' },
  sectionOrder: [
    'about',
    'experience',
    'projects',
    'skills',
    'education',
    'achievements',
    'products',
    'contact',
  ],
  leadBullets: {
    ecam: [
      { index: 0, includes: 'Angular (v15), Node.js (v20+), and PostgreSQL' },
      { index: 7, includes: '3 new enterprise applications' },
      { index: 3, includes: 'Salesforce data streams' },
    ],
    npx: [
      { index: 1, includes: 'Modernized a React codebase' },
      { index: 2, includes: 'read-only views' },
      { index: 3, includes: 'Standardized React/Node.js patterns' },
    ],
    freelance: [
      { index: 7, includes: 'sports academy platform' },
      { index: 8, includes: 'full Stripe revenue stack' },
      { index: 5, includes: 'Contentful CMS and Shopify Plus' },
    ],
    'soliton-senior': [
      { index: 0, includes: 'micro-frontends' },
      { index: 2, includes: 'Node.js REST APIs' },
      { index: 6, includes: 'React.js, Node.js, PostgreSQL, and AWS' },
    ],
  },
  projectOrder: ['freelance-booking', 'expense-tracker', 'habit-tracker', 'portfolio', 'harbour'],
  skillCategoryOrder: ['Frontend', 'Backend & APIs', 'Cloud & DevOps', 'AI & LLM'],
  achievementOrder: ['ecam-recognition', 'star-soliton', 'internal-hackathon'],
  proofPoints: [
    { metric: '18%', label: 'Azure spend cut' },
    { metric: '99.9%', label: 'Streaming uptime' },
    { metric: '3', label: 'Enterprise apps' },
  ],
  seo: {
    title: 'Harieshwar J A | Full-Stack Developer',
    description: FULL_STACK_SUMMARY,
  },
};

const SDE_SUMMARY =
  'Mocha, Playwright, and Jest in CI, plus 99.9% streaming uptime.';

const CHESS_SUMMARY =
  'Led RMDEC Boys Chess team to top-3 zonal finishes for 3 consecutive years.';

const sde: HatConfig = {
  id: 'sde',
  path: '/sde',
  label: 'SDE',
  roleTitle: 'Software Engineer',
  roleLine: 'Systems, reliability, and scale',
  headline: 'CI, tests, and uptime on production systems.',
  summary: SDE_SUMMARY,
  primaryCta: { label: 'See the work', section: 'experience' },
  sectionOrder: [
    'about',
    'experience',
    'skills',
    'projects',
    'achievements',
    'education',
    'products',
    'contact',
  ],
  leadBullets: {
    ecam: [
      { index: 1, includes: 'Mocha and Playwright' },
      { index: 4, includes: '99.9% uptime' },
      { index: 2, includes: 'reduced recurring monthly infrastructure spend by 18%' },
    ],
    npx: [
      { index: 2, includes: 'zero regressions' },
      { index: 3, includes: 'Husky + lint-staged' },
    ],
    freelance: [
      { index: 3, includes: 'Jest, React Testing Library, and Cypress' },
      { index: 4, includes: '99.9% uptime' },
      { index: 2, includes: 'reducing manual deployment effort by 40%' },
    ],
    soti: [
      { index: 0, includes: 'Jenkins using Groovy' },
      { index: 3, includes: 'GoCD to Jenkins' },
      { index: 2, includes: 'BDD testing' },
    ],
    'soliton-engineer': [
      { index: 1, includes: 'Jest & React Testing Library' },
      { index: 3, includes: '5M+' },
      { index: 5, includes: 'OPC UA to Azure' },
    ],
    'soliton-senior': [
      { index: 0, includes: 'micro-frontends' },
      { index: 2, includes: 'reducing response times by 25%' },
      { index: 7, includes: 'pull-request checklist' },
    ],
    zoho: [{ index: 0, includes: 'Java backend' }],
  },
  projectOrder: ['freelance-booking', 'node-jhora', 'info-sentry'],
  skillCategoryOrder: ['Cloud & DevOps', 'Backend & APIs', 'Frontend', 'AI & LLM'],
  achievementOrder: ['internal-hackathon', 'ecam-recognition', 'star-soliton'],
  proofPoints: [
    { metric: '99.9%', label: 'Streaming uptime' },
    { metric: '18%', label: 'Azure spend' },
    { metric: '65%', label: 'Faster first load' },
  ],
  seo: {
    title: 'Harieshwar J A | Software Engineer',
    description:
      'CI and tests across the same roles: Mocha, Playwright, and Snyk on Azure DevOps; Jest, React Testing Library, and Cypress; Jenkins and a GoCD migration; 99.9% streaming uptime; an 18% Azure spend cut; 5M+ logs a day on an Elastic stack.',
  },
};

const chess: HatConfig = {
  id: 'chess',
  path: '/chess',
  label: 'Chess',
  roleTitle: 'Chess captain',
  roleLine: 'Zonal boards and a 50-player program',
  headline: 'College captain, and a Stockfish arena on this site.',
  summary: CHESS_SUMMARY,
  detail:
    'Chess Arena at /ai?game=chess plays Stockfish. Sentry lines come from the chess-banter function.',
  // TODO(harieshwar): no verified rating is stored. Do not fill this with HUMAN_RATING_ANCHOR.
  rating: null,
  links: [
    { label: 'Chess Arena', href: '/ai?game=chess' },
    { label: 'Lichess', href: 'https://lichess.org/@/HariEshwar' },
  ],
  primaryCta: { label: 'See the record', section: 'achievements' },
  sectionOrder: [
    'about',
    'achievements',
    'projects',
    'experience',
    'skills',
    'education',
    'products',
    'contact',
  ],
  leadBullets: {},
  projectOrder: [],
  skillCategoryOrder: ['Frontend', 'Backend & APIs', 'Cloud & DevOps', 'AI & LLM'],
  achievementOrder: ['chess-captain'],
  proofPoints: [
    { metric: '3', label: 'Zonal top-3s' },
    { metric: '4', label: 'Players at start' },
    { metric: '50', label: 'Players in program' },
  ],
  seo: {
    title: 'Harieshwar J A | Chess',
    description:
      'Captained the RMDEC Boys Chess team to top-3 zonal finishes for 3 consecutive years and grew the program from 4 to 50 players. Chess Arena (/ai?game=chess) plays Stockfish; the chess-banter function writes Sentry lines. Lichess handle HariEshwar. No rating is published here.',
  },
};

const aiEngineer: HatConfig = {
  id: 'ai-engineer',
  path: '/ai-engineer',
  label: 'AI Engineer',
  roleTitle: 'AI Engineer',
  roleLine: 'Multi-agent, RAG, and MCP',
  headline: 'LLM systems on a full-stack base.',
  summary: 'InfoSentry runs eight agents and RAG under $7.30 a month.',
  primaryCta: { label: 'See InfoSentry', section: 'products' },
  sectionOrder: [
    'about',
    'products',
    'projects',
    'skills',
    'experience',
    'achievements',
    'education',
    'contact',
  ],
  leadBullets: {
    ecam: [
      { index: 5, includes: 'Cursor and GitHub Copilot' },
      { index: 6, includes: 'Figma MCP design-to-code' },
    ],
    npx: [{ index: 0, includes: 'agentic AI' }],
    freelance: [
      { index: 1, includes: 'AI chatbot with OpenAI' },
      { index: 9, includes: 'Google AI Hackathon' },
      { index: 0, includes: 'using GenAI' },
    ],
    'soliton-engineer': [{ index: 4, includes: 'ML anomaly-detection' }],
  },
  projectOrder: ['info-sentry', 'horamind', 'bridgecare', 'harbour'],
  skillCategoryOrder: ['AI & LLM', 'Backend & APIs', 'Frontend', 'Cloud & DevOps'],
  achievementOrder: ['langchain-academy', 'google-ai-hackathon'],
  proofPoints: [
    { metric: '8', label: 'LLM agents' },
    { metric: '$7.30', label: 'Monthly LLM cap' },
    { metric: '60%', label: 'Pilot productivity' },
  ],
  seo: {
    title: 'Harieshwar J A | AI Engineer',
    description: AI_ENGINEER_SUMMARY,
  },
};

const FDE_SUMMARY =
  'Sports academy platform for a freelance client: 24 pages, 22 API handlers, 53 RLS policies. ECAM pilot stayed inside ECAM.';

const PM_SUMMARY =
  'Owned end-to-end delivery of 3 enterprise apps. No product-manager title is listed.';

const fde: HatConfig = {
  id: 'fde',
  path: '/fde',
  label: 'FDE',
  roleTitle: 'Freelance delivery',
  roleLine: 'A booking platform and an internal pilot',
  headline: 'Client work from freelance, plus the ECAM pilot.',
  summary: FDE_SUMMARY,
  primaryCta: { label: 'See the platform', section: 'projects' },
  sectionOrder: [
    'about',
    'projects',
    'experience',
    'products',
    'skills',
    'achievements',
    'education',
    'contact',
  ],
  leadBullets: {
    freelance: [
      { index: 7, includes: 'sports academy platform' },
      { index: 8, includes: 'full Stripe revenue stack' },
      { index: 5, includes: 'Contentful CMS and Shopify Plus' },
    ],
    ecam: [
      { index: 5, includes: 'Cursor and GitHub Copilot' },
      { index: 6, includes: 'Figma MCP design-to-code' },
    ],
  },
  projectOrder: ['freelance-booking'],
  skillCategoryOrder: ['Backend & APIs', 'Frontend', 'Cloud & DevOps', 'AI & LLM'],
  achievementOrder: ['ecam-recognition'],
  proofPoints: [
    { metric: '24', label: 'Platform pages' },
    { metric: '22', label: 'API handlers' },
    { metric: '53', label: 'RLS policies' },
  ],
  seo: {
    title: 'Harieshwar J A | Freelance delivery',
    description:
      'Freelance delivery includes a sports academy platform for a freelance client: a Next.js 15 court-booking platform with 24 pages, 22 API handlers, a 15-table PostgreSQL schema under 53 RLS policies, and a full Stripe stack, plus Contentful and Shopify Plus. The Cursor and GitHub Copilot pilot and the Figma MCP workflow were inside ECAM | GardaWorld, not a separate client deployment.',
  },
};

const pm: HatConfig = {
  id: 'pm',
  path: '/pm',
  label: 'Product-minded',
  roleTitle: 'Product-minded engineer',
  roleLine: 'Scope, priorities, and what shipped',
  headline: 'Delivery ownership, without a PM title.',
  summary: PM_SUMMARY,
  primaryCta: { label: 'See the work', section: 'experience' },
  sectionOrder: [
    'about',
    'experience',
    'products',
    'projects',
    'achievements',
    'skills',
    'education',
    'contact',
  ],
  leadBullets: {
    ecam: [
      { index: 7, includes: '3 new enterprise applications' },
      { index: 8, includes: 'cost-effective solutions' },
      { index: 9, includes: 'Mentored interns' },
    ],
    'soliton-engineer': [{ index: 6, includes: 'story-point completion by 30%' }],
    'soliton-senior': [
      { index: 4, includes: 'Owned Agile end-to-end delivery' },
      { index: 7, includes: 'pull-request checklist' },
      { index: 3, includes: 'sprint velocity by 15%' },
    ],
  },
  projectOrder: ['info-sentry', 'freelance-booking'],
  skillCategoryOrder: ['Frontend', 'Backend & APIs', 'AI & LLM', 'Cloud & DevOps'],
  achievementOrder: ['ecam-recognition', 'google-ai-hackathon', 'star-soliton'],
  proofPoints: [
    { metric: '3', label: 'Enterprise apps' },
    { metric: '30%', label: 'Story-point lift' },
    { metric: '15%', label: 'Sprint velocity' },
  ],
  seo: {
    title: 'Harieshwar J A | Product-minded engineer',
    description:
      'No product-manager title is listed. The record that is here: end-to-end delivery of 3 enterprise applications at ECAM, formal recognition for cost-effective prioritization, a Scrum change that raised story-point completion by 30%, a 15% sprint-velocity lift, and the pull-request checklist at Soliton.',
  },
};

export const HATS: Record<HatId, HatConfig> = {
  'full-stack': fullStack,
  'ai-engineer': aiEngineer,
  sde,
  chess,
  fde,
  pm,
};

export const HAT_LIST: HatConfig[] = Object.values(HATS);

export const isHatPath = (pathname: string): boolean => {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return HAT_LIST.some((hat) => hat.path === normalized);
};
