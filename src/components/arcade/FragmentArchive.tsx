import React from 'react';
import { motion } from 'framer-motion';
import { Archive, Lock, Medal } from 'lucide-react';
import { quizQuestions, FRAGMENT_CATEGORY_LABELS } from '../../data/arcadeData';
import type { Achievement } from '../../hooks/useArcade';
import { useTheme } from '../../hooks/useTheme';
import { glassPanel } from '../SectionShell';

interface FragmentArchiveProps {
  decodedIds: string[];
  achievements: Achievement[];
}

/**
 * The Fragment Archive — everything visitors have decoded about Hari so
 * far, plus the achievement ladder. Locked entries tease what's left,
 * which is exactly why the exploration never feels finished.
 */
const FragmentArchive: React.FC<FragmentArchiveProps> = ({ decodedIds, achievements }) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const decoded = quizQuestions.filter((q) => decodedIds.includes(q.id));
  const mutedText = isDark ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="space-y-6">
      <div className={`${glassPanel(isDark)} p-6 md:p-8`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
            <Archive size={15} />
            Fragment archive
          </p>
          <p className={`font-mono text-xs ${mutedText}`}>
            {decoded.length}/{quizQuestions.length} decoded · run Neural Sync to find more
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {quizQuestions.map((question, index) => {
            const isDecoded = decodedIds.includes(question.id);
            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: (index % 6) * 0.04 }}
                className={`rounded-xl border p-4 ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/70'
                }`}
                style={
                  isDecoded
                    ? { borderColor: 'color-mix(in srgb, var(--os-primary) 35%, transparent)' }
                    : undefined
                }
              >
                <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${mutedText}`}>
                  {FRAGMENT_CATEGORY_LABELS[question.category]} · #{String(index + 1).padStart(2, '0')}
                </p>
                {isDecoded ? (
                  <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {question.fragment}
                  </p>
                ) : (
                  <p className={`mt-2 flex items-center gap-2 font-mono text-sm ${mutedText}`}>
                    <Lock size={13} />
                    ▓▓▓ encrypted — decode via neural sync ▓▓▓
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className={`${glassPanel(isDark)} p-6 md:p-8`}>
        <p className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
          <Medal size={15} />
          Achievement ladder — it keeps growing
        </p>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-xl border p-3.5 transition ${
                isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/70'
              } ${achievement.unlocked ? '' : 'opacity-55'}`}
              style={
                achievement.unlocked
                  ? {
                      borderColor: 'color-mix(in srgb, var(--os-primary) 40%, transparent)',
                      boxShadow: '0 0 12px color-mix(in srgb, var(--os-primary) 18%, transparent)',
                    }
                  : undefined
              }
            >
              <p className="flex items-center gap-2 text-sm font-bold">
                {achievement.unlocked ? (
                  <span style={{ color: 'var(--os-primary)' }}>◉</span>
                ) : (
                  <Lock size={12} className={mutedText} />
                )}
                {achievement.label}
              </p>
              <p className={`mt-0.5 text-xs ${mutedText}`}>{achievement.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FragmentArchive;
