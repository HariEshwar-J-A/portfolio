/**
 * HARI.OS — operating system shell for Harieshwar's portfolio.
 * Sentry — AI agent that manages HARI.OS processes (themes, games, mail).
 * Theme personas, boot sequence, and per-section narration live here.
 */

import { AGENT_NAME, OS_NAME } from './osIdentity';

export type PaletteId = 'aurora' | 'grandmaster' | 'circuit' | 'daylight';

export interface ThemePalette {
  id: PaletteId;
  label: string;
  /** Why this theme exists — shown in the theme switcher. */
  description: string;
  mode: 'dark' | 'light';
  primary: string;
  secondary: string;
  accent: string;
  /** Gradient for the hero display name. */
  heroGradient: string;
  /** Base wash behind everything. */
  ambientBase: string;
  /** Radial gradients for the three drifting aurora blobs. */
  blobs: [string, string, string];
}

export const themePalettes: ThemePalette[] = [
  {
    id: 'aurora',
    label: 'Aurora',
    description: 'The builder-explorer default — night sky, northern lights.',
    mode: 'dark',
    primary: '#38bdf8',
    secondary: '#818cf8',
    accent: '#f472b6',
    heroGradient: 'linear-gradient(120deg, #f8fafc 0%, #67e8f9 55%, #818cf8 100%)',
    ambientBase: 'linear-gradient(180deg, #020617 0%, #0b1120 45%, #020617 100%)',
    blobs: [
      'radial-gradient(circle, rgba(34,211,238,0.16), transparent 65%)',
      'radial-gradient(circle, rgba(99,102,241,0.18), transparent 65%)',
      'radial-gradient(circle, rgba(217,70,239,0.10), transparent 65%)',
    ],
  },
  {
    id: 'grandmaster',
    label: 'Grandmaster',
    description: 'Charcoal and gold — the chess captain who thinks ten moves ahead.',
    mode: 'dark',
    primary: '#f59e0b',
    secondary: '#eab308',
    accent: '#fb923c',
    heroGradient: 'linear-gradient(120deg, #fafaf9 0%, #fcd34d 55%, #f59e0b 100%)',
    ambientBase: 'linear-gradient(180deg, #0c0a09 0%, #1c1917 45%, #0c0a09 100%)',
    blobs: [
      'radial-gradient(circle, rgba(245,158,11,0.14), transparent 65%)',
      'radial-gradient(circle, rgba(234,179,8,0.10), transparent 65%)',
      'radial-gradient(circle, rgba(168,85,247,0.08), transparent 65%)',
    ],
  },
  {
    id: 'circuit',
    label: 'Circuit',
    description: 'Emerald on black — electrical engineering roots, industrial IoT edge.',
    mode: 'dark',
    primary: '#34d399',
    secondary: '#2dd4bf',
    accent: '#a3e635',
    heroGradient: 'linear-gradient(120deg, #f0fdf4 0%, #6ee7b7 55%, #2dd4bf 100%)',
    ambientBase: 'linear-gradient(180deg, #020805 0%, #04120c 45%, #020805 100%)',
    blobs: [
      'radial-gradient(circle, rgba(52,211,153,0.15), transparent 65%)',
      'radial-gradient(circle, rgba(45,212,191,0.13), transparent 65%)',
      'radial-gradient(circle, rgba(163,230,53,0.08), transparent 65%)',
    ],
  },
  {
    id: 'daylight',
    label: 'Daylight',
    description: 'Clean, minimal, professional — signal without the dark room.',
    mode: 'light',
    primary: '#2563eb',
    secondary: '#6366f1',
    accent: '#059669',
    heroGradient: 'linear-gradient(120deg, #0f172a 0%, #2563eb 55%, #6366f1 100%)',
    ambientBase: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 45%, #f8fafc 100%)',
    blobs: [
      'radial-gradient(circle, rgba(59,130,246,0.14), transparent 65%)',
      'radial-gradient(circle, rgba(99,102,241,0.12), transparent 65%)',
      'radial-gradient(circle, rgba(16,185,129,0.10), transparent 65%)',
    ],
  },
];

export const defaultPaletteId: PaletteId = 'aurora';

export const getPalette = (id: PaletteId): ThemePalette =>
  themePalettes.find((palette) => palette.id === id) ?? themePalettes[0];

/** Lines typed out during the first-visit boot overlay. */
export const bootLines = [
  `${OS_NAME} — booting…`,
  `> hi. I'm ${AGENT_NAME}, the agent that runs ${OS_NAME}.`,
  '> I manage his portfolio processes: games, themes, mail drafts.',
  '> loading his story ................... OK',
  '> linking his product: InfoSentry ..... OK',
  '> picking an outfit (theme persona) ... OK',
  '> ready. let me introduce my human.',
];

/**
 * What Sentry says about its human, per section.
 * Kept short so the floating bar never overflows on narrow screens.
 */
export const sectionNarration: Record<string, string> = {
  about: 'Meet my human: Harieshwar — senior full-stack & AI systems engineer.',
  skills: "I've indexed his stack. React, Next, Node, Angular, RAG, MCP, cloud.",
  experience: 'His career log: Zoho → Soliton → SOTI → NPX → ECAM. Only up.',
  education: 'Credentials: M.Eng @ McMaster (3.9 GPA) · B.E. EEE.',
  projects: 'InfoSentry, WSA, node-jhora, HoraMind — everything here shipped.',
  products: 'InfoSentry — his multi-agent flagship. I consider it family.',
  achievements: 'Hackathon mentor win, 2× Star awards, chess captain. My human.',
  contact: 'I draft the email. You just hit send.',
};
