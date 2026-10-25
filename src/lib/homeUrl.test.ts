import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { HOME_URL } from './pageMeta';

describe('home URL', () => {
  it('uses the same trailing-slash URL for canonical and og:url', () => {
    expect(HOME_URL).toBe('https://harieshwar.dev/');
    const html = readFileSync(resolve('index.html'), 'utf8');
    expect(html).toContain(`<link rel="canonical" href="${HOME_URL}" />`);
    expect(html).toContain(`<meta property="og:url" content="${HOME_URL}" />`);
  });
});
