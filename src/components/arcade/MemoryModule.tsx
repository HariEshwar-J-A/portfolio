import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Crown, Gamepad2, Grid3X3, Moon, RotateCcw, Rocket, Trophy } from 'lucide-react';
import { memoryPairs } from '../../data/arcadeData';
import { useTheme } from '../../hooks/useTheme';
import { glassPanel } from '../SectionShell';
import AiGuide, { pickLine } from './AiGuide';

const START_LINE = 'His obsessions come in pairs. Find them all.';

const MATCH_LINES = [
  'Pair locked. That is one of his loves.',
  'Match. You are mapping him fast.',
  'Another pair down — he approves of your memory.',
];

const MISS_LINES = [
  'Not a pair. His interests run deep — keep looking.',
  'Close. The grid remembers even when you do not.',
];

const WIN_LINE = 'Grid cleared. Your pattern recognition rivals mine.';

const ICONS: Record<string, React.ReactNode> = {
  gamepad: <Gamepad2 size={22} />,
  crown: <Crown size={22} />,
  camera: <Camera size={22} />,
  moon: <Moon size={22} />,
  trophy: <Trophy size={22} />,
  rocket: <Rocket size={22} />,
};

interface Card {
  key: number;
  pairId: string;
  label: string;
  icon: string;
}

const dealCards = (): Card[] => {
  const cards = memoryPairs.flatMap((pair, pairIndex) => [
    { key: pairIndex * 2, pairId: pair.id, label: pair.label, icon: pair.icon },
    { key: pairIndex * 2 + 1, pairId: pair.id, label: pair.label, icon: pair.icon },
  ]);
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
};

interface MemoryModuleProps {
  onWin: () => void;
}

/**
 * Pattern Grid — match the pairs of Hari's obsessions. Every cleared
 * grid re-deals, so the pattern hunt never ends.
 */
const MemoryModule: React.FC<MemoryModuleProps> = ({ onWin }) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const [cards, setCards] = useState<Card[]>(dealCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [guideLine, setGuideLine] = useState(START_LINE);
  const isWon = useMemo(() => matched.length === memoryPairs.length, [matched]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    setMoves((count) => count + 1);
    const [a, b] = flipped.map((key) => cards.find((card) => card.key === key)!);
    const timeout = window.setTimeout(() => {
      if (a.pairId === b.pairId) {
        setMatched((current) => {
          const next = [...current, a.pairId];
          setGuideLine(
            next.length === memoryPairs.length ? WIN_LINE : pickLine(MATCH_LINES)
          );
          return next;
        });
      } else {
        setGuideLine(pickLine(MISS_LINES));
      }
      setFlipped([]);
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [flipped, cards]);

  useEffect(() => {
    if (isWon) onWin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWon]);

  const flip = (key: number) => {
    setFlipped((current) =>
      current.length === 2 || current.includes(key) ? current : [...current, key]
    );
  };

  const reset = () => {
    setCards(dealCards());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGuideLine(START_LINE);
  };

  return (
    <div className={`${glassPanel(isDark)} relative overflow-hidden p-6 md:p-8`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
          <Grid3X3 size={15} />
          Pattern grid
        </p>
        <p className={`font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          moves: {moves} · pairs: {matched.length}/{memoryPairs.length}
        </p>
      </div>

      <AiGuide message={guideLine} />

      <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-2.5 sm:grid-cols-4">
        {cards.map((card) => {
          const isFaceUp = flipped.includes(card.key) || matched.includes(card.pairId);
          const isMatched = matched.includes(card.pairId);

          return (
            <motion.button
              key={card.key}
              type="button"
              onClick={() => flip(card.key)}
              disabled={isFaceUp}
              whileTap={{ scale: 0.94 }}
              animate={{ rotateY: isFaceUp ? 0 : 180 }}
              transition={{ duration: 0.3 }}
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-bold uppercase tracking-wide transition ${
                isDark ? 'border-white/10' : 'border-slate-200'
              }`}
              style={{
                backgroundColor: isFaceUp
                  ? 'color-mix(in srgb, var(--os-primary) 12%, transparent)'
                  : isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.75)',
                borderColor: isMatched ? 'var(--os-primary)' : undefined,
                boxShadow: isMatched
                  ? '0 0 14px color-mix(in srgb, var(--os-primary) 40%, transparent)'
                  : undefined,
              }}
              aria-label={isFaceUp ? card.label : 'Hidden card'}
            >
              {isFaceUp ? (
                <>
                  <span style={{ color: 'var(--os-primary)' }}>{ICONS[card.icon]}</span>
                  {card.label}
                </>
              ) : (
                <span className="font-mono text-lg" style={{ color: 'var(--os-secondary)' }}>
                  ?
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {isWon && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className="font-mono text-xs font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
            ◉ grid cleared in {moves} moves · +120 xp
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--os-primary)' }}
          >
            <RotateCcw size={16} />
            Re-deal the grid
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MemoryModule;
