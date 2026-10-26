/**
 * Exact live-demo allowlist. Iframe URLs come only from this list.
 * Never from user input, query params, or project copy.
 *
 * Entries are https demos already linked on project cards.
 * GitHub repos and company sites are not demos and are not listed.
 */
export interface LivePreviewTarget {
  id: string;
  projectId: string;
  title: string;
  /** Page the card already links to. */
  url: string;
  /** Exact origin that may appear in frame-src and in the iframe. */
  origin: string;
  /**
   * False for the portfolio's own origin. Those targets never receive
   * the cross-origin sandbox (allow-scripts + allow-same-origin).
   */
  crossOrigin: boolean;
}

export const PORTFOLIO_SITE_ORIGIN = 'https://harieshwar.dev';

export const LIVE_PREVIEWS: readonly LivePreviewTarget[] = [
  {
    id: 'harbour',
    projectId: 'harbour',
    title: 'Harbour',
    url: 'https://harieshwar-ai.github.io/deal-tracker/',
    origin: 'https://harieshwar-ai.github.io',
    crossOrigin: true,
  },
  {
    id: 'habit-tracker',
    projectId: 'habit-tracker',
    title: 'Habit Tracker PWA',
    url: 'https://trackmyhabit.netlify.app',
    origin: 'https://trackmyhabit.netlify.app',
    crossOrigin: true,
  },
  {
    id: 'portfolio',
    projectId: 'portfolio',
    title: 'Portfolio Website',
    url: 'https://harieshwar.dev',
    origin: 'https://harieshwar.dev',
    crossOrigin: false,
  },
];

/** Synthetic health id. No URL is fetched. Client shows it only on a local/dev preview. */
export const DEV_DOWN_PREVIEW_ID = 'down';

export const CROSS_ORIGIN_SANDBOX =
  'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox';

export function previewById(id: string): LivePreviewTarget | undefined {
  return LIVE_PREVIEWS.find((entry) => entry.id === id);
}

export function previewForProject(projectId: string): LivePreviewTarget | undefined {
  return LIVE_PREVIEWS.find((entry) => entry.projectId === projectId);
}

export function isPortfolioHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === 'harieshwar.dev' || host.endsWith('.harieshwar.dev');
}

/** Sandbox string for a cross-origin allowlisted app, or null when it must not be framed. */
export function sandboxFor(target: LivePreviewTarget): string | null {
  if (!target.crossOrigin) return null;
  if (CROSS_ORIGIN_SANDBOX.includes('allow-top-navigation')) return null;
  let url: URL;
  try {
    url = new URL(target.url);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (url.origin !== target.origin) return null;
  if (isPortfolioHost(url.hostname)) return null;
  return CROSS_ORIGIN_SANDBOX;
}

export function frameSrcOrigins(): string[] {
  const origins: string[] = [];
  for (const target of LIVE_PREVIEWS) {
    if (sandboxFor(target) && !origins.includes(target.origin)) origins.push(target.origin);
  }
  return origins;
}

/**
 * Document policy for the portfolio.
 * script-src unsafe-eval: plotly's stackgl bundle calls `new Function` when the map chunk loads.
 * wasm-unsafe-eval: Stockfish compiles WASM in a same-origin worker.
 * style-src unsafe-inline: MUI/Emotion injects style tags.
 * connect-src cdn.plot.ly: scattergeo fetches topojson from there.
 * Cloudflare beacon and EmailJS stay allowed. frame-src is the allowlist only.
 */
export function contentSecurityPolicy(): string {
  const frames = frameSrcOrigins().join(' ');
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.pexels.com",
    "font-src 'self' data:",
    "connect-src 'self' https://api.emailjs.com https://cloudflareinsights.com https://static.cloudflareinsights.com https://cdn.plot.ly",
    "worker-src 'self' blob:",
    `frame-src ${frames}`,
    "media-src 'self' blob:",
    "form-action 'self'",
  ].join('; ');
}

/** Tablet/desktop modal. Phones, including landscape, stay on a new tab. */
export function viewportAllowsEmbed(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  if (!window.matchMedia('(min-width: 768px)').matches) return false;
  const coarseOnly =
    window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(any-pointer: fine)').matches;
  if (coarseOnly && window.matchMedia('(max-device-width: 767px)').matches) return false;
  return true;
}
