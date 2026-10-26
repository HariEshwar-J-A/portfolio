/** Best-effort contact rate limit. Netlify Blobs when the runtime provides it, otherwise this process. */

export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 60 * 60 * 1000;

export interface HitStore {
  get(key: string): Promise<number[] | null>;
  set(key: string, hits: number[]): Promise<void>;
}

export function memoryStore(): HitStore {
  const buckets = new Map<string, number[]>();
  return {
    async get(key) {
      return buckets.get(key) ?? null;
    },
    async set(key, hits) {
      buckets.set(key, hits);
    },
  };
}

const memory = memoryStore();
let preferred: HitStore | null = null;

export async function takeSlot(
  store: HitStore,
  key: string,
  now: number,
  limit = RATE_LIMIT,
  windowMs = RATE_WINDOW_MS,
): Promise<boolean> {
  const recent = ((await store.get(key)) ?? []).filter((stamp) => now - stamp < windowMs);
  if (recent.length >= limit) return false;
  recent.push(now);
  await store.set(key, recent);
  return true;
}

async function blobStore(): Promise<HitStore | null> {
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('contact-rate');
    return {
      async get(key) {
        const value = await store.get(key, { type: 'json' });
        if (!Array.isArray(value)) return null;
        return value.filter((stamp): stamp is number => typeof stamp === 'number');
      },
      async set(key, hits) {
        await store.setJSON(key, hits);
      },
    };
  } catch {
    return null;
  }
}

export async function allowContact(key: string, now = Date.now()): Promise<boolean> {
  if (!preferred) preferred = (await blobStore()) ?? memory;
  try {
    return await takeSlot(preferred, key, now);
  } catch {
    preferred = memory;
    return takeSlot(memory, key, now);
  }
}
