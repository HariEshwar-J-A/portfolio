import { OPS_FOOTNOTE } from './copy';
import {
  bucketReferrers,
  foldRows,
  hatViews,
  publishCount,
  type SourceBucket,
} from './privacy';

export type OpsRange = '7d' | '30d';

export interface OpsHealth {
  httpStatus: number | null;
  sha: string | null;
  committedAt: string | null;
  subject: string | null;
}

export interface OpsAnalytics {
  visits: number | null;
  pageViews: number | null;
  trend: { date: string; visits: number | null }[];
  countries: { name: string; visits: number }[];
  hats: { path: string; visits: number | null }[];
  sources: { bucket: SourceBucket; visits: number }[];
  speed: { lcpMs: number | null; inpMs: number | null; cls: number | null };
}

export type OpsBody =
  | {
      ok: true;
      range: OpsRange;
      updatedAt: string;
      footnote: string;
      traffic: Pick<OpsAnalytics, 'visits' | 'pageViews' | 'trend' | 'countries'>;
      hats: OpsAnalytics['hats'];
      sources: OpsAnalytics['sources'];
      speed: OpsAnalytics['speed'];
      health: OpsHealth;
    }
  | { ok: false; reason: 'warming'; footnote: string; health: OpsHealth };

const ACCOUNT_TAG = '8b292f8507043103ee29d3d21087a079';
const SITE_TAG = '142b0d30ffbe40db91dc67e8ae6c3009';
const HOST = 'harieshwar.dev';
const GRAPHQL = 'https://api.cloudflare.com/client/v4/graphql';
const REPO = 'HariEshwar-J-A/portfolio';

const QUERY = `query Ops($account: String!, $site: String!, $host: String!, $start: Time!, $end: Time!) {
  viewer {
    accounts(filter: { accountTag: $account }) {
      totals: rumPageloadEventsAdaptiveGroups(limit: 1, filter: { siteTag: $site, requestHost: $host, datetime_geq: $start, datetime_leq: $end }) {
        count
        sum { visits }
      }
      days: rumPageloadEventsAdaptiveGroups(limit: 40, orderBy: [count_DESC], filter: { siteTag: $site, requestHost: $host, datetime_geq: $start, datetime_leq: $end }) {
        sum { visits }
        dimensions { date }
      }
      countries: rumPageloadEventsAdaptiveGroups(limit: 40, orderBy: [count_DESC], filter: { siteTag: $site, requestHost: $host, datetime_geq: $start, datetime_leq: $end }) {
        sum { visits }
        dimensions { countryName }
      }
      paths: rumPageloadEventsAdaptiveGroups(limit: 80, orderBy: [count_DESC], filter: { siteTag: $site, requestHost: $host, datetime_geq: $start, datetime_leq: $end }) {
        sum { visits }
        dimensions { requestPath }
      }
      referrers: rumPageloadEventsAdaptiveGroups(limit: 80, orderBy: [count_DESC], filter: { siteTag: $site, requestHost: $host, datetime_geq: $start, datetime_leq: $end }) {
        sum { visits }
        dimensions { refererHost }
      }
      vitals: rumWebVitalsEventsAdaptiveGroups(limit: 1, filter: { siteTag: $site, requestHost: $host, datetime_geq: $start, datetime_leq: $end }) {
        count
        quantiles { largestContentfulPaintP75 interactionToNextPaintP75 cumulativeLayoutShiftP75 }
      }
    }
  }
}`;

const visitsOf = (row: { count?: number; sum?: { visits?: number } } | undefined): number => {
  const visits = row?.sum?.visits;
  if (typeof visits === 'number' && Number.isFinite(visits)) return visits;
  return typeof row?.count === 'number' ? row.count : 0;
};

const ms = (micro: number | null | undefined): number | null => {
  if (typeof micro !== 'number' || micro < 0) return null;
  return Math.round(micro / 1000);
};

const clsOf = (value: number | null | undefined): number | null => {
  if (typeof value !== 'number' || value < 0) return null;
  return Math.round(value * 1000) / 1000;
};

interface CfAccount {
  totals?: { count?: number; sum?: { visits?: number } }[];
  days?: { sum?: { visits?: number }; dimensions?: { date?: string } }[];
  countries?: { sum?: { visits?: number }; dimensions?: { countryName?: string } }[];
  paths?: { sum?: { visits?: number }; dimensions?: { requestPath?: string } }[];
  referrers?: { sum?: { visits?: number }; dimensions?: { refererHost?: string } }[];
  vitals?: {
    count?: number;
    quantiles?: {
      largestContentfulPaintP75?: number;
      interactionToNextPaintP75?: number;
      cumulativeLayoutShiftP75?: number;
    };
  }[];
}

export const toAnalytics = (account: CfAccount): OpsAnalytics => {
  const total = account.totals?.[0];
  const pageViews = typeof total?.count === 'number' ? total.count : 0;
  const trend = (account.days ?? [])
    .map((row) => ({ date: row.dimensions?.date ?? '', visits: visitsOf(row) }))
    .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({ date: row.date, visits: publishCount(row.visits) }));

  const countries = foldRows(
    (account.countries ?? []).map((row) => ({
      key: (row.dimensions?.countryName || 'Other').slice(0, 56),
      visits: visitsOf(row),
    })),
  ).map((row) => ({ name: row.key, visits: row.visits }));

  const speedRow = account.vitals?.[0];
  const enough = (speedRow?.count ?? 0) >= 5;
  const quantiles = enough ? speedRow?.quantiles : undefined;

  return {
    visits: publishCount(visitsOf(total)),
    pageViews: publishCount(pageViews),
    trend,
    countries,
    hats: hatViews((account.paths ?? []).map((row) => ({ path: row.dimensions?.requestPath ?? '/', visits: visitsOf(row) }))),
    sources: bucketReferrers(
      (account.referrers ?? []).map((row) => ({
        referrer: row.dimensions?.refererHost ?? null,
        visits: visitsOf(row),
      })),
    ),
    speed: {
      lcpMs: ms(quantiles?.largestContentfulPaintP75),
      inpMs: ms(quantiles?.interactionToNextPaintP75),
      cls: clsOf(quantiles?.cumulativeLayoutShiftP75),
    },
  };
};

const emptyHealth = (): OpsHealth => ({ httpStatus: null, sha: null, committedAt: null, subject: null });

const readHealth = async (fetchImpl: typeof fetch, shaHint: string | undefined): Promise<OpsHealth> => {
  const health = emptyHealth();
  const sha = shaHint && /^[0-9a-f]{7,40}$/i.test(shaHint) ? shaHint : null;
  const commitUrl = `https://api.github.com/repos/${REPO}/commits/${sha ?? 'main'}`;

  const [site, commit] = await Promise.all([
    fetchImpl(`https://${HOST}`, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) }).catch(() => null),
    fetchImpl(commitUrl, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'harieshwar-ops' },
      signal: AbortSignal.timeout(8000),
    }).catch(() => null),
  ]);

  if (site) health.httpStatus = site.status;
  if (commit?.ok) {
    const body = (await commit.json().catch(() => null)) as {
      sha?: string;
      commit?: { message?: string; committer?: { date?: string } };
    } | null;
    if (body?.sha && /^[0-9a-f]{7,40}$/i.test(body.sha)) health.sha = body.sha.slice(0, 7);
    const date = body?.commit?.committer?.date;
    if (typeof date === 'string') health.committedAt = date;
    const subject = body?.commit?.message?.split('\n')[0]?.trim();
    if (subject) health.subject = subject.slice(0, 80);
  }
  return health;
};

export const readRange = (value: string | undefined): OpsRange => (value === '30d' ? '30d' : '7d');

export const buildOpsPayload = async (options: {
  range: OpsRange;
  token: string | undefined;
  now?: Date;
  shaHint?: string;
  fetchImpl?: typeof fetch;
}): Promise<OpsBody> => {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? new Date();
  const health = await readHealth(fetchImpl, options.shaHint);
  const warming = (): OpsBody => ({ ok: false, reason: 'warming', footnote: OPS_FOOTNOTE, health });

  const token = options.token?.trim();
  if (!token) return warming();

  const end = now.toISOString();
  const start = new Date(now.getTime() - (options.range === '30d' ? 30 : 7) * 86_400_000).toISOString();

  let payload: { errors?: unknown[]; data?: { viewer?: { accounts?: CfAccount[] } } };
  try {
    const response = await fetchImpl(GRAPHQL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: QUERY,
        variables: { account: ACCOUNT_TAG, site: SITE_TAG, host: HOST, start, end },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return warming();
    payload = (await response.json()) as typeof payload;
  } catch {
    return warming();
  }

  if (payload.errors?.length || !payload.data?.viewer?.accounts?.[0]) return warming();
  const analytics = toAnalytics(payload.data.viewer.accounts[0]);

  return {
    ok: true,
    range: options.range,
    updatedAt: now.toISOString(),
    footnote: OPS_FOOTNOTE,
    traffic: {
      visits: analytics.visits,
      pageViews: analytics.pageViews,
      trend: analytics.trend,
      countries: analytics.countries,
    },
    hats: analytics.hats,
    sources: analytics.sources,
    speed: analytics.speed,
    health,
  };
};
