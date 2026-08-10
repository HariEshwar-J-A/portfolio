import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Check, Flame, X } from 'lucide-react';
import { quizQuestions, FRAGMENT_CATEGORY_LABELS } from '../../data/arcadeData';
import { useTheme } from '../../hooks/useTheme';
import { glassPanel } from '../SectionShell';
import AiGuide, { pickLine } from './AiGuide';

const ASK_LINES = [
  'I wrote this one about my human myself.',
  "Let's see how well you know him.",
  'Careful — I grade on streaks.',
  'This one separates visitors from future collaborators.',
  'Easy one. Or is it?',
];

const CORRECT_LINES = [
  "Correct. You'd get along with him.",
  'Verified — updating your file.',
  "Sharp. He'd approve.",
  'Streak rising. Even I am impressed.',
];

const WRONG_LINES = [
  'Not quite — but now you know him better.',
  'Wrong, but I decoded the truth for you anyway.',
  "He surprises everyone. Don't feel bad.",
];

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

interface QuizModuleProps {
  onAnswer: (isCorrect: boolean, fragmentId: string, streak: number) => void;
}

/**
 * Neural Sync — an endless quiz about Hari. The pool reshuffles when
 * exhausted, streaks multiply XP, and every answer (right or wrong)
 * decodes a memory fragment for the archive.
 */
const QuizModule: React.FC<QuizModuleProps> = ({ onAnswer }) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const [order, setOrder] = useState(() => shuffle(quizQuestions));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [guideLine, setGuideLine] = useState(() => pickLine(ASK_LINES));

  const question = order[index];
  const optionOrder = useMemo(
    () => shuffle(question.options.map((_, optionIndex) => optionIndex)),
    [question]
  );
  const isRevealed = picked !== null;
  const isCorrect = picked === question.correctIndex;

  const pick = (optionIndex: number) => {
    if (isRevealed) return;
    setPicked(optionIndex);
    const correct = optionIndex === question.correctIndex;
    const nextStreak = correct ? streak + 1 : 0;
    setStreak(nextStreak);
    setGuideLine(pickLine(correct ? CORRECT_LINES : WRONG_LINES, guideLine));
    onAnswer(correct, question.id, nextStreak);
  };

  const next = () => {
    setPicked(null);
    setGuideLine(pickLine(ASK_LINES, guideLine));
    if (index + 1 >= order.length) {
      // The sync never ends — reshuffle and go again.
      setOrder(shuffle(quizQuestions));
      setIndex(0);
      setRound((r) => r + 1);
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <div className={`${glassPanel(isDark)} relative overflow-hidden p-6 md:p-8`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
          <BrainCircuit size={15} />
          Neural sync · round {round}
        </p>
        <p className="flex items-center gap-1.5 font-mono text-xs" style={{ color: streak > 0 ? 'var(--os-accent)' : undefined }}>
          <Flame size={14} />
          streak ×{streak}
        </p>
      </div>

      <AiGuide message={guideLine} />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${round}-${question.id}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.22 }}
        >
          <p className={`mt-4 text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {FRAGMENT_CATEGORY_LABELS[question.category]}
          </p>
          <h3 className="mt-2 text-xl font-bold leading-snug md:text-2xl">{question.question}</h3>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {optionOrder.map((optionIndex) => {
              const isThisPicked = picked === optionIndex;
              const isAnswer = optionIndex === question.correctIndex;
              const showState = isRevealed && (isThisPicked || isAnswer);

              return (
                <button
                  key={optionIndex}
                  type="button"
                  disabled={isRevealed}
                  onClick={() => pick(optionIndex)}
                  className={`flex items-center justify-between gap-2 rounded-xl border p-3.5 text-left text-sm font-medium transition ${
                    isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/70'
                  } ${!isRevealed ? 'hover:-translate-y-0.5' : ''}`}
                  style={
                    showState
                      ? {
                          borderColor: isAnswer ? 'var(--os-primary)' : '#f87171',
                          backgroundColor: isAnswer
                            ? 'color-mix(in srgb, var(--os-primary) 14%, transparent)'
                            : 'rgba(248,113,113,0.12)',
                        }
                      : undefined
                  }
                >
                  {question.options[optionIndex]}
                  {showState &&
                    (isAnswer ? (
                      <Check size={16} style={{ color: 'var(--os-primary)' }} />
                    ) : (
                      <X size={16} className="text-red-400" />
                    ))}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-5 rounded-xl border p-4"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--os-primary) 35%, transparent)',
                    backgroundColor: 'color-mix(in srgb, var(--os-primary) 8%, transparent)',
                  }}
                >
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
                    {isCorrect ? '◉ sync confirmed' : '◉ recalibrated'} · memory fragment decoded
                  </p>
                  <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {question.fragment}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={next}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--os-primary)' }}
                >
                  Next transmission
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizModule;
