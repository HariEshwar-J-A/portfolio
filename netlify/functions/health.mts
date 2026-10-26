import { HEALTH_CLOSED, healthForId, probePreview, requestOnce, type HealthBody } from '../../src/lib/livePreviewHealth.ts';

const TTL_MS = 5 * 60 * 1000;

const cache = new Map<string, { at: number; body: HealthBody }>();

const json = (body: HealthBody, status = 200, cacheable = true) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': cacheable ? 'public, max-age=300' : 'private, max-age=0',
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

  const id = event.queryStringParameters?.id ?? '';
  if (!/^[a-z0-9-]{1,40}$/.test(id)) return json(HEALTH_CLOSED, 400, false);

  const target = healthForId(id);
  if (target === 'down') return json(HEALTH_CLOSED);
  if (!target) return json(HEALTH_CLOSED, 400, false);

  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return json(hit.body);

  const body = await probePreview(target, requestOnce);
  cache.set(id, { at: Date.now(), body });
  return json(body);
};
