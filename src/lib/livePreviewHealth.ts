/**
 * Server-side availability probe. Import from the Netlify function only.
 * The browser never sees a raw URL: it sends an allowlist id.
 */
import https from 'node:https';
import type { IncomingHttpHeaders } from 'node:http';
import {
  DEV_DOWN_PREVIEW_ID,
  PORTFOLIO_SITE_ORIGIN,
  type LivePreviewTarget,
  previewById,
} from '../data/livePreviews.ts';

export interface HealthBody {
  up: boolean;
  embeddable: boolean;
}

export const HEALTH_CLOSED: HealthBody = { up: false, embeddable: false };

const PROBE_BUDGET_MS = 4000;
const MAX_HOPS = 4;

export function headerValue(headers: IncomingHttpHeaders, name: string): string | null {
  const raw = headers[name.toLowerCase()];
  if (Array.isArray(raw)) return raw.filter(Boolean).join(', ');
  return raw ?? null;
}

/** Any X-Frame-Options value blocks a cross-origin parent. DENY and SAMEORIGIN are the usual ones. */
export function xfoBlocks(value: string | null): boolean {
  if (!value) return false;
  const first = value.split(',')[0]?.trim().toLowerCase() ?? '';
  return first.length > 0;
}

/** True when this CSP would stop the portfolio from framing the target. */
export function frameAncestorsBlocks(
  csp: string | null,
  targetOrigin: string,
  portfolioOrigin: string = PORTFOLIO_SITE_ORIGIN,
): boolean {
  if (!csp) return false;
  return onePolicyBlocks(csp, targetOrigin, portfolioOrigin);
}

function onePolicyBlocks(csp: string, targetOrigin: string, portfolioOrigin: string): boolean {
  const directive = csp
    .split(';')
    .map((part) => part.trim())
    .find((part) => /^frame-ancestors\b/i.test(part));
  if (!directive) return false;
  const sources = directive
    .split(/\s+/)
    .slice(1)
    .map((source) => source.replace(/\/$/, '').toLowerCase());
  if (sources.length === 0 || sources.includes("'none'") || sources.includes('none')) return true;
  if (sources.includes('*')) return false;
  const us = portfolioOrigin.toLowerCase().replace(/\/$/, '');
  if (sources.includes(us)) return false;
  if (sources.includes('https:') && us.startsWith('https:')) return false;
  if (sources.includes("'self'") && targetOrigin.toLowerCase() === us) return false;
  return true;
}

export function embeddableFromHeaders(
  headers: IncomingHttpHeaders,
  targetOrigin: string,
): boolean {
  if (xfoBlocks(headerValue(headers, 'x-frame-options'))) return false;
  const csp = headers['content-security-policy'];
  const policies = Array.isArray(csp) ? csp : csp ? [csp] : [];
  return !policies.some((policy) => frameAncestorsBlocks(policy, targetOrigin));
}

/** Next URL, or null when the redirect must not be followed. */
export function nextHop(current: string, location: string | null, allowedOrigin: string): string | null {
  if (!location || !location.trim()) return null;
  let next: URL;
  try {
    next = new URL(location.trim(), current);
  } catch {
    return null;
  }
  if (next.protocol !== 'https:') return null;
  if (next.username || next.password) return null;
  if (next.origin !== allowedOrigin) return null;
  return next.toString();
}

export interface ProbeResponse {
  status: number;
  headers: IncomingHttpHeaders;
}

export type ProbeRequest = (url: string, method: 'HEAD' | 'GET', timeoutMs: number) => Promise<ProbeResponse>;

function isRedirect(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

export async function probePreview(target: LivePreviewTarget, request: ProbeRequest): Promise<HealthBody> {
  let current: string;
  try {
    const initial = new URL(target.url);
    if (initial.protocol !== 'https:' || initial.origin !== target.origin) return HEALTH_CLOSED;
    current = initial.toString();
  } catch {
    return HEALTH_CLOSED;
  }

  const started = Date.now();
  let sawHeadReject = false;

  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    const remaining = PROBE_BUDGET_MS - (Date.now() - started);
    if (remaining <= 0) return HEALTH_CLOSED;
    const method = sawHeadReject ? 'GET' : 'HEAD';
    let response: ProbeResponse;
    try {
      response = await request(current, method, remaining);
    } catch {
      return HEALTH_CLOSED;
    }

    if (isRedirect(response.status)) {
      const location = nextHop(current, headerValue(response.headers, 'location'), target.origin);
      if (!location) return HEALTH_CLOSED;
      current = location;
      sawHeadReject = false;
      continue;
    }

    if (!sawHeadReject && (response.status === 400 || response.status === 405 || response.status === 501)) {
      sawHeadReject = true;
      continue;
    }

    if ((response.status >= 200 && response.status < 300) || response.status === 304) {
      return { up: true, embeddable: embeddableFromHeaders(response.headers, target.origin) };
    }

    return HEALTH_CLOSED;
  }

  return HEALTH_CLOSED;
}

export function requestOnce(url: string, method: 'HEAD' | 'GET', timeoutMs: number): Promise<ProbeResponse> {
  return new Promise((resolve, reject) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch (error) {
      reject(error);
      return;
    }
    if (parsed.protocol !== 'https:') {
      reject(new Error('https only'));
      return;
    }
    const req = https.request(
      url,
      {
        method,
        timeout: timeoutMs,
        headers: { 'user-agent': 'harieshwar-portfolio-health', accept: '*/*' },
      },
      (res) => {
        res.resume();
        resolve({ status: res.statusCode ?? 0, headers: res.headers });
      },
    );
    req.on('timeout', () => {
      req.destroy(new Error('timeout'));
    });
    req.on('error', reject);
    req.end();
  });
}

export function healthForId(id: string): LivePreviewTarget | 'down' | null {
  if (id === DEV_DOWN_PREVIEW_ID) return 'down';
  return previewById(id) ?? null;
}
