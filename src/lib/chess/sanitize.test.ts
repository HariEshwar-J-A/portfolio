import { describe, expect, it } from 'vitest';
import { sanitizeFilename, sanitizePgnTag, sanitizeText, clampInt } from './sanitize';

describe('sanitizeText', () => {
  it('strips control characters and caps length', () => {
    expect(sanitizeText('hi\u0000there', 20)).toBe('hithere');
    expect(sanitizeText('a'.repeat(500), 10)).toBe('a'.repeat(10));
  });

  it('rejects non-strings', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(12)).toBe('');
  });
});

describe('sanitizePgnTag', () => {
  it('removes quotes and newlines', () => {
    expect(sanitizePgnTag('Evil"\nTag')).toBe('Evil Tag');
  });
});

describe('sanitizeFilename', () => {
  it('blocks path traversal and forces .pgn', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('passwd.pgn');
    expect(sanitizeFilename('..')).toBe('game.pgn');
    expect(sanitizeFilename('ok-game.pgn')).toBe('ok-game.pgn');
  });
});

describe('clampInt', () => {
  it('clamps and falls back', () => {
    expect(clampInt(99, 0, 20, 4)).toBe(20);
    expect(clampInt('nope', 0, 20, 4)).toBe(4);
  });
});
