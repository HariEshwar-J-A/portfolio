/** Decisions for POST /api/contact. No network and no secrets. */

export const BODY_CAP = 10 * 1024;
export const MIN_FILL_MS = 3000;
export const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const VISITOR_CONFIRMATION = 'Thanks, I got your message and will reply soon. Harieshwar';

const LIMITS = { name: 80, email: 254, subject: 120, message: 4000 } as const;

const EMAIL =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export interface NormalizedContact {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type GateResult =
  | { kind: 'error'; status: 400 | 403 | 405 | 413 }
  | { kind: 'drop' }
  | { kind: 'send'; contact: NormalizedContact };

const isControl = (char: string) => {
  const code = char.charCodeAt(0);
  return code <= 31 || code === 127;
};

export function stripHeader(value: string): string {
  let out = '';
  for (const char of value) out += isControl(char) ? ' ' : char;
  return out.replace(/\s+/g, ' ').trim();
}

export function hostsMatch(originHost: string, requestHost: string): boolean {
  const bare = (host: string) => host.toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
  const origin = bare(originHost);
  const request = bare(requestHost);
  if (!origin || !request) return false;
  if (origin === request) return true;
  const apex = (host: string) => host.replace(/^www\./, '');
  return apex(origin) === apex(request) && apex(origin) === 'harieshwar.dev';
}

export function originAllowed(origin: string | null | undefined, requestHost: string | null | undefined): boolean {
  if (!origin || !requestHost) return false;
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    return hostsMatch(url.host, requestHost.split(',')[0]?.trim() ?? '');
  } catch {
    return false;
  }
}

function readString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const clean = stripHeader(value);
  if (!clean || clean.length > max) return null;
  return clean;
}

export function reviewContact(input: {
  method: string;
  origin: string | null;
  requestHost: string | null;
  rawBody: string;
  now: number;
}): GateResult {
  if (input.method !== 'POST') return { kind: 'error', status: 405 };
  if (!originAllowed(input.origin, input.requestHost)) return { kind: 'error', status: 403 };
  if (input.rawBody.length > BODY_CAP) return { kind: 'error', status: 413 };

  let body: unknown;
  try {
    body = JSON.parse(input.rawBody);
  } catch {
    return { kind: 'error', status: 400 };
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { kind: 'error', status: 400 };

  const record = body as Record<string, unknown>;
  const company = record.company;
  if (typeof company === 'string' && company.trim().length > 0) return { kind: 'drop' };
  if (company != null && typeof company !== 'string') return { kind: 'error', status: 400 };

  const opened = record.t;
  if (typeof opened !== 'number' || !Number.isFinite(opened)) return { kind: 'drop' };
  const age = input.now - opened;
  if (age < MIN_FILL_MS || age > MAX_AGE_MS || opened > input.now + 60_000) return { kind: 'drop' };

  const name = readString(record.name, LIMITS.name);
  const email = readString(record.email, LIMITS.email);
  const subject = readString(record.subject, LIMITS.subject);
  const message =
    typeof record.message === 'string'
      ? [...record.message]
          .filter((char) => char.charCodeAt(0) !== 0)
          .join('')
          .replace(/\r\n?/g, '\n')
          .trim()
      : '';
  if (!name || !email || !subject || !message || message.length > LIMITS.message) return { kind: 'error', status: 400 };
  if (!EMAIL.test(email) || email.includes('..')) return { kind: 'error', status: 400 };

  return { kind: 'send', contact: { name, email, subject, message } };
}

export function mailBodies(contact: NormalizedContact): { ownerText: string; confirmText: string; confirmSubject: string } {
  return {
    ownerText: `${contact.name} <${contact.email}>\n\n${contact.message}`,
    confirmText: VISITOR_CONFIRMATION,
    confirmSubject: 'I got your message',
  };
}
