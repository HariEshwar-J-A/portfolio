import React from 'react';
import type { Square } from 'chess.js';
import { pieceSrc, type PieceColor, type PieceType } from '../../../lib/chess/pieceAssets';

interface BoardSquare {
  square: Square;
  pieceLabel: string;
  isDark: boolean;
}

interface ChessBoardProps {
  squares: BoardSquare[][];
  selected: Square | null;
  legalTargets: Square[];
  lastMove: { from: Square; to: Square } | null;
  cursorSquare: Square;
  inCheck: boolean;
  /** Side currently to move ('w' | 'b') — used for check highlight. */
  sideToMove: 'w' | 'b';
  turnLabel: string;
  flipped: boolean;
  onSquareClick: (sq: Square) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const parsePiece = (label: string): { type: PieceType; color: PieceColor } | null => {
  if (!label || label === 'empty') return null;
  const [side, t] = label.split(' ');
  if (!t || !'kqrbnp'.includes(t)) return null;
  return { type: t as PieceType, color: side === 'White' ? 'w' : 'b' };
};

const squareBg = (isDarkSq: boolean): string =>
  isDarkSq
    ? 'color-mix(in srgb, var(--os-secondary) 42%, color-mix(in srgb, var(--os-primary) 28%, #1e293b))'
    : 'color-mix(in srgb, var(--os-primary) 18%, #f1f5f9)';

const ChessBoard: React.FC<ChessBoardProps> = ({
  squares,
  selected,
  legalTargets,
  lastMove,
  cursorSquare,
  inCheck,
  sideToMove,
  turnLabel,
  flipped,
  onSquareClick,
  onKeyDown,
}) => {
  const cells = flipped ? [...squares].reverse().map((row) => [...row].reverse()).flat() : squares.flat();
  const rankLabels = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const fileLabels = flipped ? 'hgfedcba' : 'abcdefgh';

  return (
    <div
      role="grid"
      aria-label={`Chess board. ${turnLabel}${inCheck ? ' Check!' : ''}`}
      aria-rowcount={8}
      aria-colcount={8}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="mx-auto w-full max-w-[min(96vw,42rem)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ ['--tw-ring-color' as string]: 'var(--os-primary)' }}
    >
      <div className="flex items-stretch gap-1">
        <div
          className="grid w-3 shrink-0 py-0 font-mono text-[10px] leading-none opacity-50"
          aria-hidden
          style={{ gridTemplateRows: 'repeat(8, minmax(0, 1fr))' }}
        >
          {rankLabels.map((r) => (
            <span key={r} className="flex items-center justify-center">
              {r}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="grid w-full overflow-hidden rounded-xl border-2 shadow-lg"
            style={{
              aspectRatio: '1 / 1',
              gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(8, minmax(0, 1fr))',
              borderColor: inCheck
                ? 'color-mix(in srgb, #ef4444 70%, var(--os-primary))'
                : 'color-mix(in srgb, var(--os-primary) 55%, #0f172a)',
            }}
          >
            {cells.map((cell, index) => {
              const row = Math.floor(index / 8) + 1;
              const col = (index % 8) + 1;
              const isSelected = selected === cell.square;
              const isLegal = legalTargets.includes(cell.square);
              const isLastFrom = !!lastMove && lastMove.from === cell.square;
              const isLastTo = !!lastMove && lastMove.to === cell.square;
              const isLast = isLastFrom || isLastTo;
              const isCursor = cursorSquare === cell.square;
              const parsed = parsePiece(cell.pieceLabel);
              const isCheckedKing =
                inCheck && parsed?.type === 'k' && parsed.color === sideToMove;

              let bg = squareBg(cell.isDark);
              if (isCheckedKing) bg = '#dc2626';
              else if (isSelected) bg = 'color-mix(in srgb, var(--os-accent) 55%, #fde68a)';
              else if (isLastTo) bg = 'color-mix(in srgb, var(--os-primary) 55%, #fef08a)';
              else if (isLastFrom) bg = 'color-mix(in srgb, var(--os-secondary) 50%, #fde68a)';

              return (
                <button
                  key={cell.square}
                  type="button"
                  role="gridcell"
                  aria-rowindex={row}
                  aria-colindex={col}
                  aria-label={`${cell.square}, ${cell.pieceLabel}${isCheckedKing ? ', in check' : ''}${isLast ? ', last move' : ''}`}
                  aria-selected={isSelected}
                  onClick={() => onSquareClick(cell.square)}
                  className="relative m-0 box-border flex min-h-0 min-w-0 items-center justify-center overflow-hidden border-0 p-0"
                  style={{
                    backgroundColor: bg,
                    width: '100%',
                    height: '100%',
                    boxShadow: isCheckedKing
                      ? 'inset 0 0 0 3px #fef2f2, inset 0 0 12px rgba(239,68,68,0.85)'
                      : isLast
                        ? 'inset 0 0 0 2px color-mix(in srgb, var(--os-accent) 80%, transparent)'
                        : isCursor
                          ? 'inset 0 0 0 2px var(--os-accent)'
                          : undefined,
                    animation: isCheckedKing ? 'pulse 1.1s ease-in-out infinite' : undefined,
                  }}
                >
                  {parsed && (
                    <img
                      src={pieceSrc(parsed.color, parsed.type)}
                      alt=""
                      draggable={false}
                      className="pointer-events-none h-[86%] w-[86%] select-none object-contain"
                    />
                  )}
                  {isLegal && !parsed && (
                    <span
                      aria-hidden
                      className="absolute rounded-full"
                      style={{
                        width: '26%',
                        height: '26%',
                        backgroundColor: 'color-mix(in srgb, var(--os-primary) 45%, transparent)',
                      }}
                    />
                  )}
                  {isLegal && parsed && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{ boxShadow: 'inset 0 0 0 3px color-mix(in srgb, #ef4444 75%, transparent)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div
            className="mt-1 grid font-mono text-[10px] opacity-50"
            style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}
            aria-hidden
          >
            {fileLabels.split('').map((f) => (
              <span key={f} className="text-center">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
