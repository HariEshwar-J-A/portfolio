import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Command, Gamepad2, Trophy } from 'lucide-react';
import { RootState } from '../store/store';
import { navigateTo } from '../store/slices/navigationSlice';
import { useTheme } from '../hooks/useTheme';
import { useExploration, XP_PER_SECTION } from '../hooks/useExploration';
import { OPEN_PALETTE_EVENT } from './CommandPalette';

const TOAST_DURATION_MS = 3200;

/**
 * Game-style heads-up display layered over the homepage:
 *  - left rail quest tracker (one "quest" per section, ticked once visited)
 *  - XP / rank card with progress bar and keyboard controls legend
 *  - achievement toasts when a new section is explored
 *  - thin scroll-progress bar pinned to the top edge on all viewports
 */
const GameHud: React.FC = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { activeSection } = useSelector((state: RootState) => state.navigation);
  const { sections, visited, progress, xp, rank, rankLevel, isComplete, lastUnlock, clearUnlock } =
    useExploration();
  const [scrollProgress, setScrollProgress] = useState(0);
  const isDark = theme.mode === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll <= 0 ? 0 : Math.min(1, window.scrollY / maxScroll));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!lastUnlock) return;
    const timeout = window.setTimeout(clearUnlock, TOAST_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [lastUnlock, clearUnlock]);

  const railSurface = isDark
    ? 'border-white/10 bg-slate-950/70 text-white'
    : 'border-slate-200 bg-white/85 text-slate-900';

  return (
    <>
      {/* Scroll progress bar */}
      <div className="fixed left-0 top-0 z-[60] h-[3px] w-full bg-transparent">
        <div
          className="h-full origin-left bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${scrollProgress})` }}
        />
      </div>

      {/* Quest tracker rail (desktop) */}
      <nav
        aria-label="Section quest tracker"
        className={`fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-1 rounded-2xl border p-2 shadow-xl backdrop-blur-xl lg:flex ${railSurface}`}
      >
        {sections.map((section, index) => {
          const isActive = activeSection === section;
          const isVisited = visited.includes(section);

          return (
            <button
              key={section}
              type="button"
              onClick={() => dispatch(navigateTo(section))}
              className="group relative flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-cyan-400/10"
              aria-label={`Go to ${section}`}
              aria-current={isActive ? 'true' : undefined}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black transition ${
                  isActive
                    ? 'scale-110 bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                    : isVisited
                      ? isDark
                        ? 'bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-400/40'
                        : 'bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/40'
                      : isDark
                        ? 'bg-white/10 text-slate-400'
                        : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isVisited && !isActive ? <Check size={11} strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={`pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] opacity-0 shadow-lg transition group-hover:opacity-100 ${
                  isDark
                    ? 'border-white/10 bg-slate-950/95 text-white'
                    : 'border-slate-200 bg-white text-slate-900'
                }`}
              >
                {section}
                {isVisited ? ' · cleared' : ''}
              </span>
            </button>
          );
        })}
      </nav>

      {/* XP / rank card + controls legend (desktop) */}
      <div
        className={`fixed bottom-5 left-5 z-40 hidden w-60 flex-col gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl lg:flex ${railSurface}`}
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
            <Gamepad2 size={13} />
            Explorer HUD
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
              isComplete
                ? 'bg-amber-400/20 text-amber-500 ring-1 ring-amber-400/40'
                : isDark
                  ? 'bg-white/10 text-slate-300'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            LV {rankLevel} · {rank}
          </span>
        </div>
        <div>
          <div className={`h-2 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
              initial={false}
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className={`mt-1.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {xp} XP · {visited.length}/{sections.length} sections explored
          </p>
        </div>
        <div
          className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          <span>
            <kbd className="hud-kbd">W</kbd>/<kbd className="hud-kbd">S</kbd> move
          </span>
          <span>
            <kbd className="hud-kbd">1–{sections.length}</kbd> jump
          </span>
          <span>
            <kbd className="hud-kbd">T</kbd> theme
          </span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
            className="inline-flex items-center gap-1 font-bold text-cyan-500 transition hover:text-cyan-400"
          >
            <Command size={11} />
            +K palette
          </button>
        </div>
      </div>

      {/* Achievement toasts */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-2">
        <AnimatePresence>
          {lastUnlock && (
            <motion.div
              key={lastUnlock}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
                isDark
                  ? 'border-cyan-300/30 bg-slate-950/90 text-white'
                  : 'border-blue-300/60 bg-white/95 text-slate-900'
              }`}
              role="status"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.5)]">
                <Trophy size={16} />
              </span>
              <span>
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                  {isComplete ? 'Legend rank achieved' : 'Quest complete'}
                </span>
                <span className="block text-sm font-bold capitalize">
                  {lastUnlock} explored · +{XP_PER_SECTION} XP
                </span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default GameHud;
