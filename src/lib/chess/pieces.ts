/** Free-licensed cburnett piece helpers (Colin M.L. Burnett / Lichess). */

export type PieceCode = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
export type PieceColor = 'w' | 'b';

export const PIECE_ASSET_BASE = '/chess/cburnett';

export const pieceSrc = (color: PieceColor, type: PieceCode): string =>
  `${PIECE_ASSET_BASE}/${color}${type.toUpperCase()}.svg`;

export const PROMOTION_PIECES: PieceCode[] = ['q', 'r', 'b', 'n'];
