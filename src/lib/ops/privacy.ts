/** Server-side privacy for the public ops payload. Raw rows never leave this module. */

export const MIN_VISITS = 5;
export const COUNT_STEP = 5;

export const HAT_PATHS = ['/', '/full-stack', '/ai-engineer', '/sde', '/fde', '/pm', '/chess'] as const;

export type HatPath = (typeof HAT_PATHS)[number];
export type SourceBucket = 'search' | 'linkedin' | 'github' | 'x' | 'direct' | 'other';

const SEARCH_HOSTS = [
  'bing.com',
  'duckduckgo.com',
  'yahoo.com',
  'baidu.com',
  'ecosia.org',
  'search.brave.com',
  'yandex.com',
  'yandex.ru',
];

const matchesHost = (domain: string, host: string) => domain === host || domain.endsWith(`.${host}`);

export const stripPath = (raw: string): string => {
  const path = raw.split('?')[0].split('#')[0].trim();
  if (!path.startsWith('/')) return '/';
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
};

/** Host only. Full URLs, paths, and query strings are dropped. */
export const domainOf = (referrer: string | null | undefined): string | null => {
  if (!referrer) return null;
  const trimmed = referrer.trim();
  if (!trimmed || trimmed === '(direct)' || trimmed === '$direct') return null;

  let host = trimmed;
  if (trimmed.includes('://') || trimmed.startsWith('//')) {
    try {
      host = new URL(trimmed.includes('://') ? trimmed : `https:${trimmed}`).hostname;
    } catch {
      return null;
    }
  } else {
    host = trimmed.split('/')[0].split('?')[0];
  }

  host = host.split(':')[0].replace(/\.$/, '').toLowerCase();
  if (host.startsWith('www.')) host = host.slice(4);
  if (!host || host.includes('/') || host.includes('?') || host.includes('@')) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  return host;
};

export const bucketDomain = (domain: string | null): SourceBucket => {
  if (!domain || domain === 'harieshwar.dev') return 'direct';
  if (domain === 'lnkd.in' || domain === 'linkedin.com' || domain.endsWith('.linkedin.com')) return 'linkedin';
  if (domain === 'github.com' || domain.endsWith('.github.com')) return 'github';
  if (domain === 'x.com' || domain === 't.co' || domain === 'twitter.com' || domain.endsWith('.twitter.com')) {
    return 'x';
  }
  if (domain.startsWith('google.') || domain.includes('.google.') || SEARCH_HOSTS.some((host) => matchesHost(domain, host))) {
    return 'search';
  }
  return 'other';
};

/** Null when the count would identify a group under 5. Otherwise the nearest 5. */
export const publishCount = (visits: number): number | null => {
  if (!Number.isFinite(visits) || visits < MIN_VISITS) return null;
  return Math.round(visits / COUNT_STEP) * COUNT_STEP;
};

export interface CountRow {
  key: string;
  visits: number;
}

/** Fold keys under 5 into Other. Other itself is dropped when it is still under 5. */
export const foldRows = (rows: CountRow[]): { key: string; visits: number }[] => {
  const kept: CountRow[] = [];
  let other = 0;
  for (const row of rows) {
    if (row.visits < MIN_VISITS || row.key === 'Other') other += row.visits;
    else kept.push(row);
  }
  const published = kept
    .map((row) => ({ key: row.key, visits: publishCount(row.visits) }))
    .filter((row): row is { key: string; visits: number } => row.visits != null);
  const otherVisits = publishCount(other);
  if (otherVisits != null) published.push({ key: 'Other', visits: otherVisits });
  return published;
};

export const bucketReferrers = (rows: { referrer: string | null; visits: number }[]): { bucket: SourceBucket; visits: number }[] => {
  const byDomain = new Map<string, number>();
  for (const row of rows) {
    const domain = domainOf(row.referrer);
    const key = domain ?? '';
    byDomain.set(key, (byDomain.get(key) ?? 0) + row.visits);
  }

  const buckets = new Map<SourceBucket, number>();
  let small = 0;
  for (const [domain, visits] of byDomain) {
    if (visits < MIN_VISITS) {
      small += visits;
      continue;
    }
    const bucket = bucketDomain(domain || null);
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + visits);
  }
  if (small >= MIN_VISITS) buckets.set('other', (buckets.get('other') ?? 0) + small);

  return [...buckets.entries()]
    .map(([bucket, visits]) => ({ bucket, visits: publishCount(visits) }))
    .filter((row): row is { bucket: SourceBucket; visits: number } => row.visits != null);
};

export const hatViews = (rows: { path: string; visits: number }[]): { path: HatPath; visits: number | null }[] => {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const path = stripPath(row.path);
    if (!HAT_PATHS.includes(path as HatPath)) continue;
    totals.set(path, (totals.get(path) ?? 0) + row.visits);
  }
  return HAT_PATHS.map((path) => ({ path, visits: publishCount(totals.get(path) ?? 0) }));
};
