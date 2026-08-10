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
  turnLabel: string;
  /** When true, Black is at the bottom (visitor plays Black). */
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

/** Light squares: soft tint of theme primary. Dark squares: deeper mix with secondary. */
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
      aria-label={`Chess board. ${turnLabel}`}
      aria-rowcount={8}
      aria-colcount={8}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="mx-auto w-full max-w-[min(96vw,34rem)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
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
              borderColor: 'color-mix(in srgb, var(--os-primary) 55%, #0f172a)',
            }}
          >
            {cells.map((cell, index) => {
              const row = Math.floor(index / 8) + 1;
              const col = (index % 8) + 1;
              const isSelected = selected === cell.square;
              const isLegal = legalTargets.includes(cell.square);
              const isLast =
                !!lastMove && (lastMove.from === cell.square || lastMove.to === cell.square);
              const isCursor = cursorSquare === cell.square;
              const parsed = parsePiece(cell.pieceLabel);
              const isCheckedKing =
                inCheck &&
                parsed?.type === 'k' &&
                ((turnLabel.toLowerCase().includes('white') && parsed.color === 'w') ||
                  ((turnLabel.toLowerCase().includes('black') ||
                    turnLabel.toLowerCase().includes('sentry') ||
                    turnLabel.toLowerCase().includes('thinking')) &&
                    parsed.color === 'b'));

              let bg = squareBg(cell.isDark);
              if (isCheckedKing) bg = 'color-mix(in srgb, #ef4444 65%, var(--os-accent))';
              else if (isSelected) bg = 'color-mix(in srgb, var(--os-accent) 55%, #fde68a)';
              else if (isLast) bg = 'color-mix(in srgb, var(--os-secondary) 40%, #fef9c3)';

              return (
                <button
                  key={cell.square}
                  type="button"
                  role="gridcell"
                  aria-rowindex={row}
                  aria-colindex={col}
                  aria-label={`${cell.square}, ${cell.pieceLabel}`}
                  aria-selected={isSelected}
                  onClick={() => onSquareClick(cell.square)}
                  className="relative m-0 box-border flex min-h-0 min-w-0 items-center justify-center overflow-hidden border-0 p-0"
                  style={{
                    backgroundColor: bg,
                    width: '100%',
                    height: '100%',
                    boxShadow: isCursor ? 'inset 0 0 0 2px var(--os-accent)' : undefined,
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
