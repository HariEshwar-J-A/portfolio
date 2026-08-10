/** Detect casual draw requests in chat. */
const DRAW_PATTERNS = [
  /\bdraw\b/i,
  /\bremis\b/i,
  /\boffer(ing)?\s+(a\s+)?draw\b/i,
  /\b(can|could|shall|should)\s+we\s+draw\b/i,
  /\blet'?s\s+draw\b/i,
  /\bhalf\s*point\b/i,
  /\b1\/2\b/,
  /\bagreed?\s+draw\b/i,
  /\btake\s+the\s+draw\b/i,
];

export const isDrawRequest = (text: string): boolean => {
  const t = text.trim();
  if (!t) return false;
  return DRAW_PATTERNS.some((re) => re.test(t));
};

export type DrawClaimReason = 'threefold' | 'fifty' | 'material' | 'stalemate' | 'eval' | null;

/**
 * When a visitor asks for a draw, decide if Sentry should accept.
 * Fun first (caller banters); accept only on real draw claims or dead-even eval.
 */
export const evaluateDrawOffer = (opts: {
  isThreefoldRepetition: boolean;
  isDrawByFiftyMoves: boolean;
  isInsufficientMaterial: boolean;
  isStalemate: boolean;
  /** Absolute eval in pawns from either side; undefined if unknown. */
  absEvalPawns?: number;
  ply: number;
}): { accept: boolean; reason: DrawClaimReason } => {
  if (opts.isStalemate) return { accept: true, reason: 'stalemate' };
  if (opts.isThreefoldRepetition) return { accept: true, reason: 'threefold' };
  if (opts.isDrawByFiftyMoves) return { accept: true, reason: 'fifty' };
  if (opts.isInsufficientMaterial) return { accept: true, reason: 'material' };
  if (
    opts.absEvalPawns !== undefined &&
    opts.ply >= 20 &&
    opts.absEvalPawns <= 0.35
  ) {
    return { accept: true, reason: 'eval' };
  }
  return { accept: false, reason: null };
};
