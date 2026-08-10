import { describe, expect, it } from 'vitest';
import { buildPgn, pgnDownloadFilename } from './pgn';

describe('pgn', () => {
  it('builds headers with sanitized names', () => {
    const pgn = buildPgn({
      visitorName: 'Bob"\nEvil',
      visitorIsWhite: true,
      result: '1-0',
      timeControl: '300+0',
      movesSan: ['e4', 'e5', 'Nf3'],
      date: new Date(Date.UTC(2026, 7, 10)),
    });
    expect(pgn).toContain('[White "Bob Evil"]');
    expect(pgn).toContain('[Black "Sentry"]');
    expect(pgn).toContain('1. e4 e5 2. Nf3');
    expect(pgn).toContain('[Result "1-0"]');
  });

  it('produces safe download filenames', () => {
    expect(pgnDownloadFilename(new Date('2026-08-10T12:00:00Z'))).toMatch(/^hari-os-chess-.*\.pgn$/);
  });
});
