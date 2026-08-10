/**
 * Free-licensed chess piece assets (cburnett).
 * Author: Colin M.L. Burnett
 * License: CC BY-SA 3.0 and/or GPL (dual-licensed)
 * Via: lichess-org/lila public/piece/cburnett
 * Local copy: /chess/cburnett/*.svg + LICENSE.txt
 */

export type PieceColor = 'w' | 'b';
export type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
export type PromoPiece = 'q' | 'r' | 'b' | 'n';

const TYPE_FILE: Record<PieceType, string> = {
  k: 'K',
  q: 'Q',
  r: 'R',
  b: 'B',
  n: 'N',
  p: 'P',
};

export const pieceSrc = (color: PieceColor, type: PieceType): string =>
  `/chess/cburnett/${color}${TYPE_FILE[type]}.svg`;

export const PIECE_SET_CREDIT =
  'Pieces: cburnett by Colin M.L. Burnett (CC BY-SA 3.0 / GPL)';

export const PROMO_OPTIONS: PromoPiece[] = ['q', 'r', 'b', 'n'];
