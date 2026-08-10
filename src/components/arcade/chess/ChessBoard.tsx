import React from 'react';
import type { Square } from 'chess.js';

interface BoardSquare {
  square: Square;
  piece: string;
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
  kingSquare?: Square | null;
  turnLabel: string;
  onSquareClick: (sq: Square) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isDarkTheme: boolean;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  squares,
  selected,
  legalTargets,
  lastMove,
  cursorSquare,
  inCheck,
  turnLabel,
  onSquareClick,
  onKeyDown,
  isDarkTheme,
}) => {
  return (
    <div
      role="grid"
      aria-label={`Chess board. ${turnLabel}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="mx-auto w-full max-w-[min(92vw,36rem)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ ['--tw-ring-color' as string]: 'var(--os-primary)' }}
    >
      <div
        className="grid aspect-square w-full grid-cols-8 overflow-hidden rounded-2xl border-2 shadow-xl"
        style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 55%, transparent)' }}
      >
        {squares.flat().map((cell) => {
          const isSelected = selected === cell.square;
          const isLegal = legalTargets.includes(cell.square);
          const isLast =
            lastMove && (lastMove.from === cell.square || lastMove.to === cell.square);
          const isCursor = cursorSquare === cell.square;
          const bg = cell.isDark
            ? 'color-mix(in srgb, var(--os-primary) 32%, transparent)'
            : isDarkTheme
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(255,255,255,0.92)';

          return (
            <button
              key={cell.square}
              type="button"
              role="gridcell"
              aria-label={`${cell.square}, ${cell.pieceLabel}`}
              aria-selected={isSelected}
              onClick={() => onSquareClick(cell.square)}
              className="relative flex items-center justify-center text-[clamp(1.35rem,4.2vw,2.35rem)] transition"
              style={{
                backgroundColor: isSelected
                  ? 'color-mix(in srgb, var(--os-accent) 45%, transparent)'
                  : isLast
                    ? 'color-mix(in srgb, var(--os-secondary) 35%, transparent)'
                    : bg,
                boxShadow: isCursor ? `inset 0 0 0 2px var(--os-accent)` : undefined,
                color: cell.pieceLabel.startsWith('Black')
                  ? 'var(--os-secondary)'
                  : isDarkTheme
                    ? '#f8fafc'
                    : '#0f172a',
              }}
            >
              <span aria-hidden>{cell.piece}</span>
              {isLegal && (
                <span
                  aria-hidden
                  className="absolute h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: cell.piece
                      ? 'color-mix(in srgb, var(--os-accent) 70%, transparent)'
                      : 'color-mix(in srgb, var(--os-primary) 55%, transparent)',
                  }}
                />
              )}
              {inCheck && cell.pieceLabel.includes('king') && cell.pieceLabel.startsWith(
                turnLabel.includes('White') ? 'White' : turnLabel.includes('Black') ? 'Black' : '',
              ) && (
                <span className="sr-only">King in check</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
        Arrows move cursor · Enter selects · Timed only
      </p>
    </div>
  );
};

export default ChessBoard;
