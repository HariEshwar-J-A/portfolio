import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, KeyRound, Lightbulb, RotateCcw } from 'lucide-react';
import { scrambleWords } from '../../data/arcadeData';
import { useTheme } from '../../hooks/useTheme';
import { glassPanel } from '../SectionShell';
import AiGuide, { pickLine } from './AiGuide';

const GREET_LINES = [
  "A cipher from his world. Unscramble it.",
  'I encrypted this one lightly. You have got this.',
  'His life, scrambled. Restore it.',
  'This word matters to him. Decode it and see why.',
];

const SOLVED_LINES = [
  'Broken. He would call that clean work.',
  'Decrypted — you are getting good at him.',
  'Cipher down. The archive grows.',
];

const WRONG_LINES = [
  'The cipher holds. Try another angle.',
  'Close, maybe. The letters say no.',
];

const HINT_LINE = 'Fine — a nudge. Do not tell him I helped.';

const shuffleLetters = (word: string): string => {
  const letters = word.split('');
  let scrambled = word;
  // Retry until it actually looks scrambled (guaranteed for len > 1).
  for (let attempts = 0; attempts < 12 && scrambled === word; attempts += 1) {
    for (let i = letters.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    scrambled = letters.join('');
  }
  return scrambled;
};

const shuffleOrder = (length: number): number[] => {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

interface ScrambleModuleProps {
  onSolve: () => void;
}

/**
 * Cipher Scramble — a nod to the word-scramble game Hari once built.
 * Unscramble words from his stack and his life; the deck reshuffles
 * forever.
 */
const ScrambleModule: React.FC<ScrambleModuleProps> = ({ onSolve }) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const [deck, setDeck] = useState(() => shuffleOrder(scrambleWords.length));
  const [position, setPosition] = useState(0);
  const [guess, setGuess] = useState('');
  const [status, setStatus] = useState<'playing' | 'solved' | 'wrong'>('playing');
  const [showHint, setShowHint] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [guideLine, setGuideLine] = useState(() => pickLine(GREET_LINES));

  const entry = scrambleWords[deck[position]];
  const scrambled = useMemo(() => shuffleLetters(entry.word), [entry]);

  const advance = () => {
    setGuess('');
    setStatus('playing');
    setShowHint(false);
    setGuideLine(pickLine(GREET_LINES, guideLine));
    if (position + 1 >= deck.length) {
      setDeck(shuffleOrder(scrambleWords.length));
      setPosition(0);
    } else {
      setPosition(position + 1);
    }
  };

  const check = (event: React.FormEvent) => {
    event.preventDefault();
    if (status === 'solved') return;
    if (guess.trim().toUpperCase() === entry.word) {
      setStatus('solved');
      setSolvedCount((count) => count + 1);
      setGuideLine(pickLine(SOLVED_LINES, guideLine));
      onSolve();
    } else {
      setStatus('wrong');
      setGuideLine(pickLine(WRONG_LINES, guideLine));
    }
  };

  return (
    <div className={`${glassPanel(isDark)} relative overflow-hidden p-6 md:p-8`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
          <KeyRound size={15} />
          Cipher scramble
        </p>
        <p className={`font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          decoded: {solvedCount} · deck loops forever
        </p>
      </div>

      <AiGuide message={guideLine} />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${deck[position]}-${position}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.22 }}
          className="mt-6 text-center"
        >
          <div className="flex flex-wrap justify-center gap-2">
            {scrambled.split('').map((letter, letterIndex) => (
              <motion.span
                key={`${letterIndex}-${letter}`}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ delay: letterIndex * 0.05, duration: 0.25 }}
                className={`flex h-12 w-10 items-center justify-center rounded-lg border font-mono text-xl font-black md:h-14 md:w-12 ${
                  isDark ? 'border-white/15 bg-white/5' : 'border-slate-300 bg-white/80'
                }`}
                style={{
                  boxShadow:
                    status === 'solved'
                      ? '0 0 14px color-mix(in srgb, var(--os-primary) 55%, transparent)'
                      : undefined,
                  borderColor: status === 'solved' ? 'var(--os-primary)' : undefined,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          <form onSubmit={check} className="mx-auto mt-6 flex max-w-sm gap-2">
            <input
              value={guess}
              onChange={(event) => {
                setGuess(event.target.value);
                if (status === 'wrong') setStatus('playing');
              }}
              placeholder="Decode the word…"
              disabled={status === 'solved'}
              aria-label="Your answer"
              className={`w-full rounded-xl border bg-transparent px-4 py-2.5 text-center font-mono text-sm uppercase tracking-widest outline-none transition ${
                isDark ? 'border-white/15 placeholder:text-slate-600' : 'border-slate-300 placeholder:text-slate-400'
              }`}
              style={{ borderColor: status === 'wrong' ? '#f87171' : undefined }}
            />
            <button
              type="submit"
              disabled={status === 'solved' || guess.trim() === ''}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-40"
              style={{ backgroundColor: 'var(--os-primary)' }}
            >
              Try
            </button>
          </form>

          {status === 'wrong' && (
            <p className="mt-3 text-xs font-bold text-red-400">Not quite — the cipher holds.</p>
          )}

          {status === 'solved' ? (
            <div className="mt-4">
              <p className="font-mono text-xs font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
                ◉ cipher broken · +60 xp
              </p>
              <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{entry.hint}</p>
              <button
                type="button"
                onClick={advance}
                className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--os-primary)' }}
              >
                Next cipher
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="mt-4 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowHint(true);
                  setGuideLine(HINT_LINE);
                }}
                className={`inline-flex items-center gap-1.5 text-xs font-bold transition hover-primary ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <Lightbulb size={14} />
                {showHint ? entry.hint : 'Reveal hint'}
              </button>
              <button
                type="button"
                onClick={advance}
                className={`inline-flex items-center gap-1.5 text-xs font-bold transition hover-primary ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <RotateCcw size={14} />
                Skip
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ScrambleModule;
