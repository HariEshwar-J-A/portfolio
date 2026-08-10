import { afterEach, describe, expect, it } from 'vitest';
import { __resetRateLimitForTests, handleChessBanter } from './banterApi';

afterEach(() => {
  __resetRateLimitForTests();
  delete process.env.SENTRY_CHESS_LLM_KEY;
});

describe('handleChessBanter', () => {
  it('rejects non-POST', async () => {
    const res = await handleChessBanter({ httpMethod: 'GET' });
    expect(res.statusCode).toBe(405);
  });

  it('rejects oversized bodies', async () => {
    const res = await handleChessBanter({
      httpMethod: 'POST',
      body: 'x'.repeat(5_000),
    });
    expect(res.statusCode).toBe(413);
    expect(JSON.parse(res.body).fallback).toBe(true);
  });

  it('returns 503 with fallback when API key missing', async () => {
    const res = await handleChessBanter({
      httpMethod: 'POST',
      body: JSON.stringify({ event: 'idle' }),
    });
    expect(res.statusCode).toBe(503);
    expect(JSON.parse(res.body).fallback).toBe(true);
  });

  it('rate limits repeated requests from same IP', async () => {
    process.env.SENTRY_CHESS_LLM_KEY = 'test-key';
    const headers = { 'x-forwarded-for': '1.2.3.4' };
    let last = 200;
    for (let i = 0; i < 25; i++) {
      const res = await handleChessBanter({
        httpMethod: 'POST',
        headers,
        body: JSON.stringify({ event: 'idle' }),
      });
      last = res.statusCode;
    }
    expect(last).toBe(429);
  });
});
