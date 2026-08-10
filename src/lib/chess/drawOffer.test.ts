import { describe, expect, it } from 'vitest';
import { evaluateDrawOffer, isDrawRequest } from './drawOffer';

describe('isDrawRequest', () => {
  it('detects common draw phrases', () => {
    expect(isDrawRequest('can we draw?')).toBe(true);
    expect(isDrawRequest('I offer a draw')).toBe(true);
    expect(isDrawRequest('lets draw')).toBe(true);
    expect(isDrawRequest('nice move')).toBe(false);
  });
});

describe('evaluateDrawOffer', () => {
  it('accepts threefold / material / stalemate claims', () => {
    expect(
      evaluateDrawOffer({
        isThreefoldRepetition: true,
        isDrawByFiftyMoves: false,
        isInsufficientMaterial: false,
        isStalemate: false,
        ply: 10,
      }).reason,
    ).toBe('threefold');
    expect(
      evaluateDrawOffer({
        isThreefoldRepetition: false,
        isDrawByFiftyMoves: false,
        isInsufficientMaterial: true,
        isStalemate: false,
        ply: 10,
      }).accept,
    ).toBe(true);
  });

  it('accepts dead-even eval after enough ply, otherwise declines', () => {
    expect(
      evaluateDrawOffer({
        isThreefoldRepetition: false,
        isDrawByFiftyMoves: false,
        isInsufficientMaterial: false,
        isStalemate: false,
        absEvalPawns: 0.1,
        ply: 24,
      }).accept,
    ).toBe(true);
    expect(
      evaluateDrawOffer({
        isThreefoldRepetition: false,
        isDrawByFiftyMoves: false,
        isInsufficientMaterial: false,
        isStalemate: false,
        absEvalPawns: 1.2,
        ply: 30,
      }).accept,
    ).toBe(false);
  });
});
