import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  ArrowLeft,
  BrainCircuit,
  Grid3X3,
  Handshake,
  KeyRound,
  Sparkles,
  Swords,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useArcade } from '../hooks/useArcade';
import AmbientBackground from '../components/AmbientBackground';
import ThemeSwitcher from '../components/ThemeSwitcher';
import CollabWizard, { OPEN_COLLAB_EVENT } from '../components/CollabWizard';
import QuizModule from '../components/arcade/QuizModule';
import ScrambleModule from '../components/arcade/ScrambleModule';
import MemoryModule from '../components/arcade/MemoryModule';
import ChessArena from '../components/arcade/ChessArena';
import FragmentArchive from '../components/arcade/FragmentArchive';

type ModuleId = 'sync' | 'cipher' | 'grid' | 'chess' | 'archive';

const MODULES: { id: ModuleId; label: string; blurb: string; icon: React.ReactNode }[] = [
  { id: 'sync', label: 'Neural Sync', blurb: 'Endless quiz — decode who Hari is', icon: <BrainCircuit size={18} /> },
  { id: 'cipher', label: 'Cipher Scramble', blurb: 'Unscramble his world, forever', icon: <KeyRound size={18} /> },
  { id: 'grid', label: 'Pattern Grid', blurb: 'Match the obsessions', icon: <Grid3X3 size={18} /> },
  { id: 'chess', label: 'Chess Arena', blurb: 'Coming soon — bring a board', icon: <Swords size={18} /> },
  { id: 'archive', label: 'Fragment Archive', blurb: 'Everything decoded so far', icon: <Archive size={18} /> },
];

/**
 * HARI.OS Playground — the gamified exploration mode, separate from the
 * base portfolio. A futuristic AI-lab where visitors earn unbounded XP
 * through quizzes and puzzles, decode memory fragments about Hari, and
 * keep being nudged toward the collaboration channel.
 */
const OsPlaygroundPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const arcade = useArcade();
  const [activeModule, setActiveModule] = useState<ModuleId>('sync');

  useEffect(() => {
    document.title = 'HARI.OS Playground | Explore Harieshwar';
    document.body.className = isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900';
  }, [isDark]);

  useEffect(() => {
    if (arcade.lastLevelUp === null) return;
    const timeout = window.setTimeout(arcade.clearLevelUp, 4200);
    return () => window.clearTimeout(timeout);
  }, [arcade.lastLevelUp, arcade.clearLevelUp]);

  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <AmbientBackground />
      <CollabWizard />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-6 md:px-8">
        {/* Lab chrome */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur transition ${
              isDark ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white/70 text-slate-800'
            }`}
          >
            <ArrowLeft size={15} className="transition group-hover:-translate-x-1" />
            hari.os portfolio
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_COLLAB_EVENT))}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--os-primary)' }}
            >
              <Handshake size={15} />
              Collaborate
            </button>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Title */}
        <div className="mt-10 text-center">
          <p className="font-mono text-xs font-black uppercase tracking-[0.35em]" style={{ color: 'var(--os-primary)' }}>
            <Sparkles size={13} className="mr-1 inline" />
            exploration mode
          </p>
          <h1 className="os-glitch mt-3 font-mono text-4xl font-black tracking-tight md:text-6xl">
            HARI.OS<span style={{ color: 'var(--os-primary)' }}> PLAYGROUND</span>
          </h1>
          <p className={`mx-auto mt-4 max-w-xl text-sm leading-relaxed md:text-base ${mutedText}`}>
            An intelligence you can play with. Every round decodes another fragment of who Hari is —
            and the archive never runs dry. XP has no cap. Neither does he.
          </p>
        </div>

        {/* Explorer status — persona-colored, always-growing progression */}
        <div className="os-border-flow mx-auto mt-8 max-w-3xl rounded-2xl p-[1.5px]">
          <div
            className={`flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl px-5 py-4 backdrop-blur-xl ${
              isDark ? 'bg-slate-950/85' : 'bg-white/90'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={16} style={{ color: 'var(--os-primary)' }} />
              <span className="font-mono text-sm font-black">
                LV {arcade.level}
              </span>
            </div>
            <div className="min-w-[10rem] flex-1">
              <div className={`h-2 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--os-primary), var(--os-secondary))' }}
                  initial={false}
                  animate={{ width: `${Math.round(arcade.levelProgress * 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <p className={`mt-1 font-mono text-[10px] ${mutedText}`}>
                {arcade.stats.xp} xp · {arcade.xpToNext} to next level · levels are infinite
              </p>
            </div>
            <div className={`font-mono text-[11px] ${mutedText}`}>
              fragments {arcade.stats.fragments.length} · best streak {arcade.stats.bestStreak}
            </div>
          </div>
        </div>

        {/* Module switcher */}
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {MODULES.map((module) => {
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => setActiveModule(module.id)}
                className={`rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5 ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/70'
                } ${isActive ? 'os-pulse-glow' : ''}`}
                style={
                  isActive
                    ? {
                        borderColor: 'var(--os-primary)',
                        backgroundColor: 'color-mix(in srgb, var(--os-primary) 10%, transparent)',
                      }
                    : undefined
                }
                aria-pressed={isActive}
              >
                <span style={{ color: 'var(--os-primary)' }}>{module.icon}</span>
                <p className="mt-1.5 text-sm font-bold">{module.label}</p>
                <p className={`mt-0.5 text-[11px] leading-snug ${mutedText}`}>{module.blurb}</p>
              </button>
            );
          })}
        </div>

        {/* Active module */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeModule === 'sync' && <QuizModule onAnswer={arcade.recordAnswer} />}
              {activeModule === 'cipher' && <ScrambleModule onSolve={arcade.recordScramble} />}
              {activeModule === 'grid' && <MemoryModule onWin={arcade.recordMemoryWin} />}
              {activeModule === 'chess' && <ChessArena />}
              {activeModule === 'archive' && (
                <FragmentArchive decodedIds={arcade.stats.fragments} achievements={arcade.achievements} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Standing invitation */}
        <p className={`mt-10 text-center font-mono text-xs ${mutedText}`}>
          decoded something you like?{' '}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_COLLAB_EVENT))}
            className="font-bold underline decoration-dotted underline-offset-4 hover-primary"
            style={{ color: 'var(--os-primary)' }}
          >
            open the collaboration channel
          </button>{' '}
          — hari responds to humans faster than to pings.
        </p>
      </div>

      {/* Level-up toast → collaboration nudge */}
      <AnimatePresence>
        {arcade.lastLevelUp !== null && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[90] max-w-xs rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
              isDark ? 'border-white/10 bg-slate-950/90' : 'border-slate-200 bg-white/95'
            }`}
            style={{ borderColor: 'color-mix(in srgb, var(--os-primary) 45%, transparent)' }}
            role="status"
          >
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: 'var(--os-primary)' }}>
              ◉ level up
            </p>
            <p className="mt-1 text-sm font-bold">
              Explorer level {arcade.lastLevelUp} reached — the archive goes deeper.
            </p>
            <button
              type="button"
              onClick={() => {
                arcade.clearLevelUp();
                window.dispatchEvent(new Event(OPEN_COLLAB_EVENT));
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
              style={{ backgroundColor: 'var(--os-primary)' }}
            >
              <Handshake size={13} />
              Tell Hari yourself
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OsPlaygroundPage;
