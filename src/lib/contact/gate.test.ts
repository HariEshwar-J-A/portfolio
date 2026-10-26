import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { portfolioData } from '../../data/portfolioData';
import { VISITOR_CONFIRMATION, mailBodies, reviewContact } from './gate';
import { memoryStore, takeSlot } from './rateLimit';

const NOW = 1_700_000_000_000;
const BANNED = ['harieshwarja.official', '@gmail.com'].join('');

const validBody = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    subject: 'Hello',
    message: 'A note about the work.',
    company: '',
    t: NOW - 10_000,
    ...overrides,
  });

const review = (overrides: Partial<Parameters<typeof reviewContact>[0]> = {}, bodyOverrides?: Record<string, unknown>) =>
  reviewContact({
    method: 'POST',
    origin: 'https://harieshwar.dev',
    requestHost: 'harieshwar.dev',
    rawBody: validBody(bodyOverrides),
    now: NOW,
    ...overrides,
  });

describe('contact gate', () => {
  it('accepts a same-origin message and keeps the confirmation free of the visitor text', () => {
    const result = review();
    expect(result.kind).toBe('send');
    if (result.kind !== 'send') return;
    const mail = mailBodies(result.contact);
    expect(mail.confirmText).toBe(VISITOR_CONFIRMATION);
    expect(mail.confirmText).not.toContain('A note about the work.');
    expect(mail.ownerText).toContain('A note about the work.');
    expect(mail.ownerText).toContain('ada@example.com');
  });

  it('rejects the wrong method, another origin, an oversized body, and a bad email', () => {
    expect(review({ method: 'GET' }).kind).toBe('error');
    expect(review({ origin: 'https://evil.example' })).toMatchObject({ kind: 'error', status: 403 });
    expect(review({ rawBody: 'x'.repeat(10_241) })).toMatchObject({ kind: 'error', status: 413 });
    expect(review({}, { email: 'not an email' })).toMatchObject({ kind: 'error', status: 400 });
    expect(review({}, { email: 'ada@example.com\nBcc: x' })).toMatchObject({ kind: 'error', status: 400 });
  });

  it('strips line breaks from header fields and silently drops the honeypot and a fast fill', () => {
    const result = review({}, { name: 'Ada\r\nBcc: x', subject: 'Hi\nthere' });
    expect(result.kind).toBe('send');
    if (result.kind !== 'send') return;
    expect(result.contact.name).toBe('Ada Bcc: x');
    expect(result.contact.subject).toBe('Hi there');
    expect(review({}, { company: 'Acme' })).toEqual({ kind: 'drop' });
    expect(review({}, { t: NOW - 1000 })).toEqual({ kind: 'drop' });
  });

  it('allows the fifth request in an hour and refuses the sixth', async () => {
    const store = memoryStore();
    for (let i = 0; i < 5; i += 1) {
      expect(await takeSlot(store, 'ip', NOW + i)).toBe(true);
    }
    expect(await takeSlot(store, 'ip', NOW + 5)).toBe(false);
  });

  it('publishes only the public address', () => {
    expect(portfolioData.contact.email).toBe('harieshwar.dev@gmail.com');
    expect(JSON.stringify(portfolioData)).not.toContain('harieshwarja');
    const skip = new Set(['node_modules', 'dist', '.git', '.playwright-mcp']);
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        if (skip.has(name)) continue;
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
          walk(path);
          continue;
        }
        if (!/\.(ts|tsx|js|mjs|html|md|json|toml|txt|xml)$/.test(name)) continue;
        if (path.endsWith('gate.test.ts') || path.endsWith('package-lock.json')) continue;
        const text = readFileSync(path, 'utf8');
        if (text.includes(BANNED.split('.')[0]) || text.includes(BANNED)) hits.push(relative('.', path));
      }
    };
    walk('.');
    expect(hits).toEqual([]);
  });
});
