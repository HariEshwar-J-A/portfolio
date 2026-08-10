import { describe, expect, it } from 'vitest';
import { eventFromAnalysis, pickPrefab, PREFAB_BANTER } from '../../data/chessBanter';
import { parseChessStats } from './chessStorage';
import { shouldStartBackgroundTimer, shouldCancelBackgroundTimer } from './forfeitGuards';
import { normalizeBanterRequest, buildSentrySystemPrompt } from './gameUtils';

describe('banterFallback', () => {
  it('picks prefab lines for known events', () => {
    expect(pickPrefab('blunder', 0)).toBe(PREFAB_BANTER.blunder[0]);
    expect(pickPrefab('opening', 1)).toBe(PREFAB_BANTER.opening[1]);
  });

  it('maps analysis to events', () => {
    expect(
      eventFromAnalysis({
        ply: 2,
        visitorIsWhite: true,
        inCheck: false,
        visitorClockMs: 60_000,
        pieceCount: 32,
      }),
    ).toBe('opening');
    expect(
      eventFromAnalysis({
        ply: 20,
        visitorIsWhite: true,
        inCheck: true,
        visitorClockMs: 60_000,
        pieceCount: 20,
      }),
    ).toBe('check');
    expect(
      eventFromAnalysis({
        ply: 20,
        visitorIsWhite: true,
        inCheck: false,
        visitorClockMs: 5_000,
        pieceCount: 20,
      }),
    ).toBe('timeScramble');
  });
});

describe('chessStorage', () => {
  it('recovers from corrupt / out-of-range payloads', () => {
    const stats = parseChessStats({
      userWins: -5,
      sentryWins: 9999999,
      visitorElo: 'nope',
      skillLevel: 99,
      recentPgns: [{ id: 'a', pgn: 'x'.repeat(60_000) }, 'bad'],
    });
    expect(stats.userWins).toBe(0);
    expect(stats.sentryWins).toBe(1_000_000);
    expect(stats.visitorElo).toBe(800);
    expect(stats.sentryElo).toBe(2000);
    expect(stats.skillLevel).toBe(20);
    expect(stats.recentPgns).toHaveLength(0);
  });
});

describe('forfeitGuards', () => {
  it('starts timer when hidden and cancels when visible', () => {
    expect(shouldStartBackgroundTimer('hidden')).toBe(true);
    expect(shouldCancelBackgroundTimer('visible')).toBe(true);
  });
});

describe('banter request normalization', () => {
  it('rejects non-objects and caps fields', () => {
    expect(normalizeBanterRequest(null)).toBeNull();
    const n = normalizeBanterRequest({
      userMessage: 'a'.repeat(500),
      evalPawns: 999,
      fen: 'bad\u0000fen',
    });
    expect(n?.userMessage?.length).toBe(200);
    expect(n?.evalPawns).toBe(40);
    expect(n?.fen).not.toContain('\u0000');
  });

  it('system prompt identifies Sentry not the human and sets voice', () => {
    const p = buildSentrySystemPrompt();
    expect(p).toContain('Sentry');
    expect(p).toContain('NOT Harieshwar');
    expect(p).toMatch(/competitive/i);
    expect(p).toMatch(/sarcastic/i);
  });
});
