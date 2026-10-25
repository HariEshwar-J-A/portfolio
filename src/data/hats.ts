import type { SectionId } from '../store/slices/navigationSlice';

export const SITE_ORIGIN = 'https://harieshwar.dev';
export const PROFILE_IMAGE_PATH = '/assets/images/profile-picture.jpg';

export type HatId = 'full-stack' | 'ai-engineer';

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
  projectOrder: ['freelance-booking', 'expense-tracker', 'habit-tracker', 'portfolio'],
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
  projectOrder: ['info-sentry', 'horamind', 'bridgecare'],
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

export const HATS: Record<HatId, HatConfig> = {
  'full-stack': fullStack,
  'ai-engineer': aiEngineer,
};

export const HAT_LIST: HatConfig[] = Object.values(HATS);

export const isHatPath = (pathname: string): boolean => {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return HAT_LIST.some((hat) => hat.path === normalized);
};
