import React, { useEffect, useRef } from 'react';
import { pieceSrc, PROMO_OPTIONS, type PromoPiece } from '../../../lib/chess/pieceAssets';

interface PromotionOverlayProps {
  color: 'w' | 'b';
  onChoose: (piece: PromoPiece) => void;
  onCancel: () => void;
}

const LABELS: Record<PromoPiece, string> = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
};

const PromotionOverlay: React.FC<PromotionOverlayProps> = ({ color, onChoose, onCancel }) => {
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
      style={{ backgroundColor: 'color-mix(in srgb, #020617 72%, transparent)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose promotion piece"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }}
    >
      <div
        className="rounded-2xl border p-4 shadow-2xl"
        style={{
          borderColor: 'color-mix(in srgb, var(--os-primary) 45%, transparent)',
          backgroundColor: 'color-mix(in srgb, #0f172a 92%, var(--os-primary))',
        }}
      >
        <p className="mb-3 text-center font-mono text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: 'var(--os-primary)' }}>
          Promote pawn
        </p>
        <div className="flex gap-2">
          {PROMO_OPTIONS.map((piece, i) => (
            <button
              key={piece}
              ref={i === 0 ? firstRef : undefined}
              type="button"
              onClick={() => onChoose(piece)}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2"
              style={{
                borderColor: 'color-mix(in srgb, var(--os-primary) 35%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--os-primary) 12%, transparent)',
                outlineColor: 'var(--os-accent)',
              }}
              aria-label={`Promote to ${LABELS[piece]}`}
            >
              <img src={pieceSrc(color, piece)} alt="" className="h-10 w-10 object-contain" draggable={false} />
              <span className="mt-0.5 font-mono text-[9px] uppercase tracking-wider opacity-70">{LABELS[piece]}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full rounded-lg border py-1.5 font-mono text-[10px] uppercase tracking-wider opacity-70"
          style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 25%, transparent)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PromotionOverlay;
