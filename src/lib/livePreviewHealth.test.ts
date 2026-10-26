import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import {
  CROSS_ORIGIN_SANDBOX,
  LIVE_PREVIEWS,
  contentSecurityPolicy,
  previewForProject,
  sandboxFor,
} from '../data/livePreviews';
import {
  embeddableFromHeaders,
  frameAncestorsBlocks,
  healthForId,
  nextHop,
  probePreview,
  xfoBlocks,
} from './livePreviewHealth';

describe('live preview allowlist', () => {
  it('matches every project demo link and skips repositories', () => {
    const demos = portfolioData.projects.filter((project) => project.demoLink);
    expect(demos.map((project) => project.id).sort()).toEqual(['habit-tracker', 'harbour', 'portfolio']);
    for (const project of demos) {
      const entry = previewForProject(project.id);
      expect(entry?.url).toBe(project.demoLink);
      expect(entry?.url.startsWith('https://')).toBe(true);
      expect(entry?.url).not.toContain('github.com');
    }
    expect(LIVE_PREVIEWS.map((entry) => entry.id)).not.toContain('down');
  });

  it('never gives the portfolio origin the cross-origin sandbox', () => {
    const portfolio = previewForProject('portfolio');
    expect(portfolio?.crossOrigin).toBe(false);
    expect(sandboxFor(portfolio!)).toBeNull();
    expect(CROSS_ORIGIN_SANDBOX).not.toContain('allow-top-navigation');
    expect(sandboxFor(previewForProject('harbour')!)).toBe(CROSS_ORIGIN_SANDBOX);
    expect(contentSecurityPolicy()).not.toContain('https://harieshwar.dev');
    expect(contentSecurityPolicy()).toContain('frame-src https://harieshwar-ai.github.io https://trackmyhabit.netlify.app');
    expect(contentSecurityPolicy()).toContain("frame-ancestors 'self'");
    expect(contentSecurityPolicy()).toContain('https://static.cloudflareinsights.com');
    expect(contentSecurityPolicy()).toContain('https://api.emailjs.com');
    expect(contentSecurityPolicy()).toContain('https://cdn.plot.ly');
  });

  it('publishes the same policy and SAMEORIGIN in Netlify headers', () => {
    const policy = contentSecurityPolicy();
    const toml = readFileSync('netlify.toml', 'utf8');
    const headers = readFileSync('public/_headers', 'utf8');
    expect(toml).toContain(`Content-Security-Policy = "${policy}"`);
    expect(toml).toContain('X-Frame-Options = "SAMEORIGIN"');
    expect(toml).toContain('from = "/api/health"');
    expect(headers).toContain(`Content-Security-Policy: ${policy}`);
    expect(headers).toContain('X-Frame-Options: SAMEORIGIN');
  });
});

describe('live preview health', () => {
  const harbour = previewForProject('harbour')!;

  it('treats DENY, SAMEORIGIN, and frame-ancestors as not embeddable', () => {
    expect(xfoBlocks(null)).toBe(false);
    expect(xfoBlocks('DENY')).toBe(true);
    expect(xfoBlocks('SAMEORIGIN')).toBe(true);
    expect(embeddableFromHeaders({}, harbour.origin)).toBe(true);
    expect(embeddableFromHeaders({ 'x-frame-options': 'SAMEORIGIN' }, harbour.origin)).toBe(false);
    expect(embeddableFromHeaders({ 'x-frame-options': 'DENY' }, harbour.origin)).toBe(false);
    expect(frameAncestorsBlocks("frame-ancestors 'none'", harbour.origin)).toBe(true);
    expect(frameAncestorsBlocks("frame-ancestors 'self'", harbour.origin)).toBe(true);
    expect(frameAncestorsBlocks("frame-ancestors 'self'", 'https://harieshwar.dev')).toBe(false);
    expect(frameAncestorsBlocks('frame-ancestors https://harieshwar.dev', harbour.origin)).toBe(false);
    expect(frameAncestorsBlocks('frame-ancestors https://example.com', harbour.origin)).toBe(true);
  });

  it('follows redirects only inside the allowlisted origin', () => {
    expect(nextHop(harbour.url, '/watchlist', harbour.origin)).toBe('https://harieshwar-ai.github.io/watchlist');
    expect(nextHop(harbour.url, 'https://evil.example/phish', harbour.origin)).toBeNull();
    expect(nextHop(harbour.url, 'http://harieshwar-ai.github.io/deal-tracker/', harbour.origin)).toBeNull();
    expect(nextHop(harbour.url, 'https://user:pass@harieshwar-ai.github.io/', harbour.origin)).toBeNull();
  });

  it('fails closed when a redirect leaves the origin and never requests that URL', async () => {
    const requested: string[] = [];
    const body = await probePreview(harbour, async (url) => {
      requested.push(url);
      return { status: 302, headers: { location: 'https://evil.example/steal' } };
    });
    expect(body).toEqual({ up: false, embeddable: false });
    expect(requested).toEqual([harbour.url]);
  });

  it('reports embeddable only when the final same-origin response allows framing', async () => {
    let hops = 0;
    const body = await probePreview(harbour, async (url) => {
      hops += 1;
      if (hops === 1 && url === harbour.url) {
        return { status: 302, headers: { location: '/ready' } };
      }
      return { status: 200, headers: {} };
    });
    expect(body).toEqual({ up: true, embeddable: true });
    expect(hops).toBe(2);

    const blocked = await probePreview(harbour, async () => ({
      status: 200,
      headers: { 'x-frame-options': 'SAMEORIGIN' },
    }));
    expect(blocked).toEqual({ up: true, embeddable: false });
  });

  it('accepts only allowlist ids and the synthetic down id', () => {
    const found = healthForId('harbour');
    expect(found !== 'down' && found?.id).toBe('harbour');
    expect(healthForId('down')).toBe('down');
    expect(healthForId('https://evil.example')).toBeNull();
    expect(healthForId('../ops')).toBeNull();
  });
});
