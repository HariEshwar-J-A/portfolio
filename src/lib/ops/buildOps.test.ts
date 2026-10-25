import { describe, expect, it } from 'vitest';
import { buildOpsPayload } from './buildOps';
import { handler } from '../../../netlify/functions/ops.mts';

const healthFetch = (url: string) => {
  if (url === 'https://harieshwar.dev') return new Response(null, { status: 200 });
  if (url.includes('api.github.com')) {
    return new Response(
      JSON.stringify({
        sha: '2439828abcdef',
        commit: { message: 'Merge pull request #12\n\nbody', committer: { date: '2026-10-24T12:00:00Z' } },
      }),
      { status: 200 },
    );
  }
  return new Response('nope', { status: 500 });
};

describe('ops degradation', () => {
  it('rejects every method except GET', async () => {
    const response = await handler({ httpMethod: 'POST' });
    expect(response.statusCode).toBe(405);
  });

  it('returns a warming payload with no counts when the token is missing', async () => {
    const body = await buildOpsPayload({
      range: '7d',
      token: undefined,
      fetchImpl: (input) => Promise.resolve(healthFetch(String(input))),
    });
    expect(body.ok).toBe(false);
    if (body.ok) return;
    expect(body.reason).toBe('warming');
    expect(body.health.httpStatus).toBe(200);
    expect(body.health.sha).toBe('2439828');
    expect(body).not.toHaveProperty('traffic');
    expect(JSON.stringify(body)).not.toContain('CF_ANALYTICS');
  });

  it('warms up when Cloudflare returns an error', async () => {
    const body = await buildOpsPayload({
      range: '30d',
      token: 'secret-token',
      fetchImpl: (input) => {
        const url = String(input);
        if (url.includes('graphql')) return Promise.resolve(new Response(JSON.stringify({ errors: [{ message: 'nope' }] }), { status: 200 }));
        return Promise.resolve(healthFetch(url));
      },
    });
    expect(body.ok).toBe(false);
    expect(JSON.stringify(body)).not.toContain('secret-token');
  });

  it('publishes only aggregated rows from a Cloudflare payload', async () => {
    const cf = {
      data: {
        viewer: {
          accounts: [
            {
              totals: [{ count: 22, sum: { visits: 16 } }],
              days: [{ sum: { visits: 16 }, dimensions: { date: '2026-10-20' } }],
              countries: [
                { sum: { visits: 12 }, dimensions: { countryName: 'Canada' } },
                { sum: { visits: 3 }, dimensions: { countryName: 'Japan' } },
              ],
              paths: [
                { sum: { visits: 9 }, dimensions: { requestPath: '/full-stack?utm=secret' } },
                { sum: { visits: 2 }, dimensions: { requestPath: '/chess' } },
              ],
              referrers: [
                { sum: { visits: 11 }, dimensions: { refererHost: 'https://github.com/HariEshwar-J-A/portfolio?tab=readme' } },
              ],
              vitals: [
                {
                  count: 8,
                  quantiles: {
                    largestContentfulPaintP75: 1_800_000,
                    interactionToNextPaintP75: 120_000,
                    cumulativeLayoutShiftP75: 0.041,
                  },
                },
              ],
            },
          ],
        },
      },
    };

    const body = await buildOpsPayload({
      range: '7d',
      token: 'secret-token',
      now: new Date('2026-10-25T00:00:00Z'),
      fetchImpl: (input) => {
        const url = String(input);
        if (url.includes('graphql')) return Promise.resolve(new Response(JSON.stringify(cf), { status: 200 }));
        return Promise.resolve(healthFetch(url));
      },
    });

    expect(body.ok).toBe(true);
    if (!body.ok) return;
    expect(body.traffic.visits).toBe(15);
    expect(body.traffic.countries.map((row) => row.name)).toEqual(['Canada']);
    expect(body.hats.find((row) => row.path === '/chess')?.visits).toBeNull();
    expect(body.sources).toEqual([{ bucket: 'github', visits: 10 }]);
    expect(body.speed).toEqual({ lcpMs: 1800, inpMs: 120, cls: 0.041 });
    const encoded = JSON.stringify(body);
    expect(encoded).not.toContain('utm=secret');
    expect(encoded).not.toContain('tab=readme');
    expect(encoded).not.toContain('Japan');
    expect(encoded).not.toContain('secret-token');
  });
});
