import { describe, expect, it } from 'vitest';
import { HAT_LIST, SITE_ORIGIN } from '../data/hats';
import { OPS_PATH } from './ops/copy';
import { PRIVACY_PATH } from './privacyCopy';
import { sitemapXml } from './sitemap';

describe('sitemap', () => {
  it('lists the home slash, every hat, ops, and privacy', () => {
    const xml = sitemapXml(SITE_ORIGIN, ['/', ...HAT_LIST.map((hat) => hat.path), OPS_PATH, PRIVACY_PATH]);
    expect(xml).toContain('<loc>https://harieshwar.dev/</loc>');
    expect(xml).toContain('<loc>https://harieshwar.dev/full-stack</loc>');
    expect(xml).toContain('<loc>https://harieshwar.dev/ops</loc>');
    expect(xml).toContain('<loc>https://harieshwar.dev/privacy</loc>');
    expect(xml).not.toContain('https://harieshwar.dev/privacy/');
  });
});
