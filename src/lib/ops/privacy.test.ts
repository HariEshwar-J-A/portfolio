import { describe, expect, it } from 'vitest';
import { bucketDomain, bucketReferrers, domainOf, foldRows, hatViews, publishCount, stripPath } from './privacy';

describe('ops privacy', () => {
  it('strips query strings and trailing slashes from paths', () => {
    expect(stripPath('/full-stack?ref=secret&email=a@b.c')).toBe('/full-stack');
    expect(stripPath('/chess/')).toBe('/chess');
    expect(stripPath('/')).toBe('/');
  });

  it('keeps the referrer host and drops the path and query', () => {
    expect(domainOf('https://github.com/HariEshwar-J-A/portfolio?tab=readme')).toBe('github.com');
    expect(domainOf('https://www.linkedin.com/in/someone')).toBe('linkedin.com');
    expect(domainOf('http://203.0.113.8/path?q=1')).toBeNull();
    expect(domainOf('')).toBeNull();
    expect(domainOf('https://t.co/abc123')).toBe('t.co');
  });

  it('buckets known domains and leaves the rest as other', () => {
    expect(bucketDomain(null)).toBe('direct');
    expect(bucketDomain('harieshwar.dev')).toBe('direct');
    expect(bucketDomain('google.co.uk')).toBe('search');
    expect(bucketDomain('lnkd.in')).toBe('linkedin');
    expect(bucketDomain('github.com')).toBe('github');
    expect(bucketDomain('x.com')).toBe('x');
    expect(bucketDomain('news.ycombinator.com')).toBe('other');
  });

  it('folds rows under 5 into Other and rounds the rest to the nearest 5', () => {
    expect(publishCount(4)).toBeNull();
    expect(publishCount(7)).toBe(5);
    const folded = foldRows([
      { key: 'Canada', visits: 12 },
      { key: 'India', visits: 3 },
      { key: 'Japan', visits: 2 },
    ]);
    expect(folded).toEqual([
      { key: 'Canada', visits: 10 },
      { key: 'Other', visits: 5 },
    ]);
    expect(JSON.stringify(folded)).not.toContain('India');
    expect(JSON.stringify(folded)).not.toContain('3');
  });

  it('does not publish a referrer domain, and hides a bucket that is still under 5', () => {
    const sources = bucketReferrers([
      { referrer: 'https://github.com/HariEshwar-J-A/portfolio?tab=readme', visits: 11 },
      { referrer: 'https://linkedin.com/feed?trk=secret', visits: 3 },
      { referrer: null, visits: 8 },
    ]);
    expect(sources).toEqual([
      { bucket: 'github', visits: 10 },
      { bucket: 'direct', visits: 10 },
    ]);
    const encoded = JSON.stringify(sources);
    expect(encoded).not.toContain('github.com');
    expect(encoded).not.toContain('tab=readme');
    expect(encoded).not.toContain('linkedin');
  });

  it('lists hat paths only and hides counts under 5', () => {
    const hats = hatViews([
      { path: '/full-stack?utm=secret', visits: 9 },
      { path: '/chess/', visits: 2 },
      { path: '/private?token=abc', visits: 40 },
    ]);
    expect(hats.find((row) => row.path === '/full-stack')?.visits).toBe(10);
    expect(hats.find((row) => row.path === '/chess')?.visits).toBeNull();
    expect(hats.find((row) => row.path === '/')?.visits).toBeNull();
    expect(JSON.stringify(hats)).not.toContain('utm=');
    expect(JSON.stringify(hats)).not.toContain('private');
    expect(JSON.stringify(hats)).not.toContain('token=abc');
  });
});
