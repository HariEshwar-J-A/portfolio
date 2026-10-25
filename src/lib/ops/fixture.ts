import type { OpsBody } from './buildOps';

/** Local preview only. These are not Cloudflare numbers. */
export const FIXTURE_MARKER = 'SAMPLE_NOT_LIVE';

export const OPS_SAMPLE_BUNDLE = { jsBytes: 5_518_640, jsGzipBytes: 1_677_490 };

export const OPS_FIXTURE: OpsBody & { mock: true } = {
  mock: true,
  ok: true,
  range: '7d',
  updatedAt: '2026-10-25T00:00:00.000Z',
  footnote: FIXTURE_MARKER,
  traffic: {
    visits: 80,
    pageViews: 140,
    trend: [
      { date: '2026-10-19', visits: 10 },
      { date: '2026-10-20', visits: null },
      { date: '2026-10-21', visits: 15 },
      { date: '2026-10-22', visits: 20 },
      { date: '2026-10-23', visits: 10 },
      { date: '2026-10-24', visits: 15 },
      { date: '2026-10-25', visits: 10 },
    ],
    countries: [
      { name: 'Canada', visits: 40 },
      { name: 'India', visits: 25 },
      { name: 'United States', visits: 20 },
      { name: 'Germany', visits: 10 },
      { name: 'Other', visits: 15 },
    ],
  },
  hats: [
    { path: '/', visits: 50 },
    { path: '/full-stack', visits: 15 },
    { path: '/ai-engineer', visits: 10 },
    { path: '/sde', visits: null },
    { path: '/fde', visits: null },
    { path: '/pm', visits: null },
    { path: '/chess', visits: 5 },
  ],
  sources: [
    { bucket: 'direct', visits: 35 },
    { bucket: 'github', visits: 20 },
    { bucket: 'search', visits: 15 },
    { bucket: 'linkedin', visits: 10 },
  ],
  speed: { lcpMs: 1800, inpMs: 120, cls: 0.04 },
  health: {
    httpStatus: 200,
    sha: 'sample0',
    committedAt: '2026-10-24T12:00:00.000Z',
    subject: 'Sample commit for local preview',
  },
};
