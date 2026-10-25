import { buildOpsPayload, readRange, type OpsBody } from '../../src/lib/ops/buildOps';

const TTL_MS = 12 * 60 * 1000;
const FAIL_TTL_MS = 60 * 1000;

const cache = new Map<string, { at: number; body: OpsBody }>();

const json = (body: OpsBody, status = 200) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': body.ok ? 'public, max-age=60, s-maxage=720' : 'public, max-age=60',
    'X-Content-Type-Options': 'nosniff',
  },
  body: JSON.stringify(body),
});

export const handler = async (event: {
  httpMethod?: string;
  queryStringParameters?: Record<string, string | undefined> | null;
}) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { Allow: 'GET' }, body: '' };
  }

  const range = readRange(event.queryStringParameters?.range);
  const hit = cache.get(range);
  const maxAge = hit?.body.ok ? TTL_MS : FAIL_TTL_MS;
  if (hit && Date.now() - hit.at < maxAge) return json(hit.body);

  const body = await buildOpsPayload({
    range,
    token: process.env.CF_ANALYTICS_TOKEN,
    shaHint: process.env.COMMIT_REF,
  });
  cache.set(range, { at: Date.now(), body });
  return json(body);
};
