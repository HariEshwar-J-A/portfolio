import { describe, expect, it } from 'vitest';
import { SITE_ORIGIN } from '../data/hats';
import { SITEMAP_PATHS } from './publicRoutes';
import { sitemapXml } from './sitemap';

describe('sitemap', () => {
  it('lists every public route with an absolute URL', () => {
    const xml = sitemapXml(SITE_ORIGIN, SITEMAP_PATHS);
    expect(xml).toContain('<loc>https://harieshwar.dev/</loc>');
    expect(xml).toContain('<loc>https://harieshwar.dev/full-stack</loc>');
    expect(xml).toContain('<loc>https://harieshwar.dev/chess</loc>');
    expect(xml).toContain('<loc>https://harieshwar.dev/3d</loc>');
    expect(xml).toContain('<loc>https://harieshwar.dev/ai</loc>');
    expect(xml).toContain('<loc>https://harieshwar.dev/ops</loc>');
    expect(xml).toContain('<loc>https://harieshwar.dev/privacy</loc>');
    expect(xml).not.toContain('https://harieshwar.dev/privacy/');
    expect(xml).not.toContain('https://harieshwar.dev/os<');
  });
});
