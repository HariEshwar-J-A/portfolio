import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  ArrowLeft,
  Box,
  BrainCircuit,
  Gamepad2,
  Grid3X3,
  Handshake,
  KeyRound,
  Menu,
  Sparkles,
  Swords,
  TrendingUp,
  X,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { applyPlaygroundMeta } from '../lib/pageMeta';
import { useArcade } from '../hooks/useArcade';
import AmbientBackground from '../components/AmbientBackground';
import ThemeSwitcher from '../components/ThemeSwitcher';
import CollabWizard, { OPEN_COLLAB_EVENT } from '../components/CollabWizard';
import QuizModule from '../components/arcade/QuizModule';
import ScrambleModule from '../components/arcade/ScrambleModule';
import MemoryModule from '../components/arcade/MemoryModule';
import ChessArena from '../components/arcade/ChessArena';
import LeaveMatchModal from '../components/arcade/chess/LeaveMatchModal';
import FragmentArchive from '../components/arcade/FragmentArchive';
import NavMenu from '../components/nav/NavMenu';
import { HAT_LIST } from '../data/hats';
import { PLAY_LINKS } from '../lib/siteNav';
import { prefetchThreeDRoute } from '../lib/experienceRoutes';

type ModuleId = 'sync' | 'cipher' | 'grid' | 'chess' | 'archive';

const MODULES: { id: ModuleId; label: string; short: string; blurb: string; icon: React.ReactNode }[] = [
  { id: 'sync', label: 'Neural Sync', short: 'Sync', blurb: 'Endless quiz — decode who Hari is', icon: <BrainCircuit size={15} /> },
  { id: 'cipher', label: 'Cipher Scramble', short: 'Cipher', blurb: 'Unscramble his world, forever', icon: <KeyRound size={15} /> },
  { id: 'grid', label: 'Pattern Grid', short: 'Grid', blurb: 'Match the obsessions', icon: <Grid3X3 size={15} /> },
  { id: 'chess', label: 'Chess Arena', short: 'Chess', blurb: 'Timed duel vs Sentry', icon: <Swords size={15} /> },
  { id: 'archive', label: 'Fragment Archive', short: 'Archive', blurb: 'Everything decoded so far', icon: <Archive size={15} /> },
];

/**
 * HARI.OS Playground — gamified exploration with a portfolio-style top
 * navbar: game modes are tabs, not a card grid. Processes managed by Sentry.
 */
const OsPlaygroundPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const arcade = useArcade();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGame = searchParams.get('game');
  const [activeModule, setActiveModule] = useState<ModuleId>(
    initialGame === 'cipher' || initialGame === 'grid' || initialGame === 'chess' || initialGame === 'archive'
      ? initialGame
      : 'sync'
  );
  const [playOpen, setPlayOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chessMatchActive, setChessMatchActive] = useState(false);
  const [pendingLeave, setPendingLeave] = useState<null | (() => void)>(null);

  const activeMeta = MODULES.find((module) => module.id === activeModule) ?? MODULES[0];
  const focusChessMatch = activeModule === 'chess' && chessMatchActive;

  useEffect(() => {
    applyPlaygroundMeta();
    document.body.className = isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900';
  }, [isDark]);

  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';

  useEffect(() => {
    if (arcade.lastLevelUp === null) return;
    const timeout = window.setTimeout(arcade.clearLevelUp, 4200);
    return () => window.clearTimeout(timeout);
  }, [arcade.lastLevelUp, arcade.clearLevelUp]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const requestLeave = useCallback(
    (proceed: () => void) => {
      if (!chessMatchActive) {
        proceed();
        return;
      }
      setPendingLeave(() => proceed);
    },
    [chessMatchActive],
  );

  const openCollab = () => {
    window.dispatchEvent(new Event(OPEN_COLLAB_EVENT));
  };

  const stayInMatch = useCallback(() => {
    setPendingLeave(null);
  }, []);

  const confirmLeave = useCallback(() => {
    const next = pendingLeave;
    setPendingLeave(null);
    next?.();
  }, [pendingLeave]);

  // Browser back during a live match → confirm before leaving /ai
  useEffect(() => {
    if (!chessMatchActive) return;
    const marker = `${window.location.pathname}${window.location.search}`;
    window.history.pushState({ chessGuard: true }, '', marker);
    const onPopState = () => {
      window.history.pushState({ chessGuard: true }, '', marker);
      setPendingLeave(() => () => navigate('/'));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [chessMatchActive, navigate]);

  useEffect(() => {
    const game = searchParams.get('game');
    if (game === 'sync' || game === 'cipher' || game === 'grid' || game === 'chess' || game === 'archive') {
      setActiveModule(game);
    }
  }, [searchParams]);

  const selectModule = (id: ModuleId) => {
    if (id === activeModule) {
      setIsMobileMenuOpen(false);
      return;
    }
    requestLeave(() => {
      setActiveModule(id);
      setIsMobileMenuOpen(false);
      const next = new URLSearchParams(searchParams);
      if (id === 'sync') next.delete('game');
      else next.set('game', id);
      setSearchParams(next, { replace: true });
    });
  };

  const leaveTo = (to: string) => {
    requestLeave(() => navigate(to));
  };

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    requestLeave(() => navigate('/'));
  };

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <AmbientBackground />
      <CollabWizard />
      <LeaveMatchModal
        open={pendingLeave !== null}
        isDark={isDark}
        onStay={stayInMatch}
        onLeave={confirmLeave}
      />

      {/* Fixed top navbar — same rhythm as the portfolio header */}
      <header
        className={`fixed left-0 top-0 z-[130] w-full transition-all duration-300 ${
          isScrolled
            ? `${isDark ? 'bg-slate-950/85 backdrop-blur-md' : 'bg-white/85 backdrop-blur-md'} shadow-md`
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
          <Link
            to="/"
            onClick={goHome}
            className={`group inline-flex shrink-0 items-center gap-2 font-mono text-sm font-bold tracking-tight md:text-base ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <ArrowLeft size={15} className="opacity-70 transition group-hover:-translate-x-0.5 group-hover:opacity-100" />
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: 'var(--os-primary)' }} />
            <span>
              hari<span style={{ color: 'var(--os-primary)' }}>.os</span>
              <span className={`ml-1.5 hidden font-sans text-xs font-semibold sm:inline ${mutedText}`}>playground</span>
            </span>
          </Link>

          {/* Desktop game tabs — short labels; full names are on the button. */}
          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-5 px-2 md:flex lg:gap-6 xl:gap-8"
            aria-label="Playground games"
          >
            {MODULES.map((module) => {
              const isActive = activeModule === module.id;
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => selectModule(module.id)}
                  className={`relative inline-flex shrink-0 items-center gap-2 px-2.5 pb-1.5 text-sm font-medium tracking-wide transition-colors lg:px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--os-primary)] ${
                    isActive
                      ? ''
                      : isDark
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-700 hover:text-black'
                  }`}
                  style={{ color: isActive ? 'var(--os-primary)' : undefined }}
                  aria-label={module.label}
                  title={`${module.label} — ${module.blurb}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="opacity-80">{module.icon}</span>
                  <span>{module.short}</span>
                  {isActive && (
                    <motion.span
                      layoutId="playground-nav-underline"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full lg:inset-x-3"
                      style={{
                        background: 'linear-gradient(90deg, var(--os-primary), var(--os-secondary))',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop controls */}
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <NavMenu
              kind="listbox"
              menuLabel="View as role"
              className="hidden lg:block"
              trigger={
                <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${mutedText}`}>
                  View as
                </span>
              }
              triggerClassName={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--os-primary)] ${
                isDark ? 'border-slate-700 bg-slate-800/80 text-slate-200' : 'border-slate-300 bg-white/80 text-slate-700'
              }`}
              panelClassName={isDark ? 'border-white/10 bg-slate-950/95 text-slate-200' : 'border-slate-200 bg-white/95 text-slate-700'}
              itemClassName={isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}
              open={viewOpen}
              onOpenChange={(next) => {
                setViewOpen(next);
                if (next) setPlayOpen(false);
              }}
              groups={[
                {
                  id: 'roles',
                  label: 'Role',
                  items: [
                    { id: 'full', label: 'Full portfolio', description: 'Back to the full site', onSelect: () => leaveTo('/') },
                    ...HAT_LIST.map((hat) => ({
                      id: hat.id,
                      label: hat.label,
                      description: hat.roleLine,
                      onSelect: () => leaveTo(hat.path),
                    })),
                  ],
                },
              ]}
            />
            <NavMenu
              className="hidden lg:block"
              menuLabel="Play"
              trigger={
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                    isDark ? 'bg-slate-950/90 text-white' : 'bg-white/95 text-slate-900'
                  }`}
                >
                  <Gamepad2 size={14} style={{ color: 'var(--os-primary)' }} />
                  Play
                </span>
              }
              triggerClassName="os-border-flow inline-flex rounded-full p-[1.5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--os-primary)]"
              panelClassName={isDark ? 'border-white/10 bg-slate-950/95 text-slate-200' : 'border-slate-200 bg-white/95 text-slate-700'}
              itemClassName={isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}
              open={playOpen}
              onOpenChange={(next) => {
                setPlayOpen(next);
                if (next) setViewOpen(false);
              }}
              groups={[
                {
                  id: 'play',
                  items: PLAY_LINKS.map((link) => ({
                    id: link.id,
                    label: link.label,
                    description: link.description,
                    selected: (link.id === 'chess' && activeModule === 'chess') || (link.id === 'playground' && activeModule !== 'chess'),
                    icon: link.id === '3d' ? <Box size={16} /> : link.id === 'chess' ? <Swords size={16} /> : <Gamepad2 size={16} />,
                    onSelect: () => {
                      if (link.id === '3d') {
                        prefetchThreeDRoute();
                        leaveTo(link.to);
                        return;
                      }
                      if (link.id === 'chess') selectModule('chess');
                      else selectModule('sync');
                    },
                  })),
                },
              ]}
            />
            {!focusChessMatch && (
              <div
                className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] 2xl:flex ${
                  isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-white/70 text-slate-600'
                }`}
                title={`${arcade.stats.xp} XP · ${arcade.xpToNext} to next level`}
              >
                <TrendingUp size={13} style={{ color: 'var(--os-primary)' }} />
                <span className="font-black">LV {arcade.level}</span>
                <span className={mutedText}>· {arcade.stats.xp} xp</span>
              </div>
            )}
            <button
              type="button"
              onClick={openCollab}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-lg transition hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--os-primary)', color: 'var(--os-on-primary)' }}
              title="Collaborate"
            >
              <Handshake size={14} />
              <span className="hidden lg:inline">Collaborate</span>
            </button>
            <ThemeSwitcher />
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className={`rounded-lg p-2 transition md:hidden ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className={`border-t px-4 py-3 md:hidden ${
                isDark ? 'border-white/10 bg-slate-950/95' : 'border-slate-200 bg-white/95'
              }`}
            >
              <nav className="flex flex-col gap-1" aria-label="Playground games">
                {MODULES.map((module, index) => {
                  const isActive = activeModule === module.id;
                  return (
                    <motion.button
                      key={module.id}
                      type="button"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => selectModule(module.id)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                      }`}
                      style={
                        isActive
                          ? {
                              color: 'var(--os-primary)',
                              backgroundColor: 'color-mix(in srgb, var(--os-primary) 10%, transparent)',
                            }
                          : undefined
                      }
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span style={{ color: 'var(--os-primary)' }}>{module.icon}</span>
                      <span className="flex-1">
                        {module.label}
                        <span className={`mt-0.5 block text-[11px] font-normal ${mutedText}`}>{module.blurb}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </nav>
              <p className={`mb-1 mt-3 px-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] ${mutedText}`}>
                View as
              </p>
              <button
                type="button"
                onClick={() => leaveTo('/')}
                className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
              >
                Full portfolio
              </button>
              {HAT_LIST.map((hat) => (
                <button
                  key={hat.id}
                  type="button"
                  onClick={() => leaveTo(hat.path)}
                  className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                >
                  {hat.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => leaveTo('/3d')}
                onMouseEnter={prefetchThreeDRoute}
                className={`mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
              >
                <Box size={16} style={{ color: 'var(--os-primary)' }} />
                3D Portfolio
              </button>
              <div className={`mt-3 flex items-center justify-between gap-2 border-t pt-3 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <p className={`font-mono text-[11px] ${mutedText}`}>
                  LV {arcade.level} · {arcade.stats.xp} xp · {arcade.stats.fragments.length} fragments
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openCollab();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: 'var(--os-primary)' }}
                  >
                    <Handshake size={13} />
                    Collaborate
                  </button>
                  <ThemeSwitcher />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div
        className={`relative z-10 mx-auto px-4 pb-20 pt-24 md:px-8 md:pt-28 ${
          focusChessMatch ? 'max-w-7xl' : 'max-w-6xl'
        }`}
      >
        {/* Compact intro — hidden during an active chess match to free board space */}
        {!focusChessMatch && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--os-primary)' }}>
                <Sparkles size={12} className="mr-1 inline" />
                exploration mode · {activeMeta.label}
              </p>
              <h1 className="os-glitch mt-2 font-mono text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
                HARI.OS<span style={{ color: 'var(--os-primary)' }}> PLAYGROUND</span>
              </h1>
              <p className={`mt-2 max-w-xl text-sm leading-relaxed ${mutedText}`}>{activeMeta.blurb}</p>
            </div>

            <div className="os-border-flow w-full max-w-sm rounded-2xl p-[1.5px] sm:w-72">
              <div
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 backdrop-blur-xl ${
                  isDark ? 'bg-slate-950/85' : 'bg-white/90'
                }`}
              >
                <TrendingUp size={16} style={{ color: 'var(--os-primary)' }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-sm font-black">LV {arcade.level}</span>
                    <span className={`font-mono text-[10px] ${mutedText}`}>
                      {arcade.stats.fragments.length} frag · streak {arcade.stats.bestStreak}
                    </span>
                  </div>
                  <div className={`mt-1.5 h-1.5 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, var(--os-primary), var(--os-secondary))' }}
                      initial={false}
                      animate={{ width: `${Math.round(arcade.levelProgress * 100)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active module */}
        <div className={focusChessMatch ? 'mt-2' : 'mt-8'}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: focusChessMatch ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: focusChessMatch ? 0 : -18 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeModule === 'sync' && <QuizModule onAnswer={arcade.recordAnswer} />}
              {activeModule === 'cipher' && <ScrambleModule onSolve={arcade.recordScramble} />}
              {activeModule === 'grid' && <MemoryModule onWin={arcade.recordMemoryWin} />}
              {activeModule === 'chess' && <ChessArena onMatchActiveChange={setChessMatchActive} />}
              {activeModule === 'archive' && (
                <FragmentArchive decodedIds={arcade.stats.fragments} achievements={arcade.achievements} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {!focusChessMatch && (
          <p className={`mt-10 text-center font-mono text-xs ${mutedText}`}>
            decoded something you like?{' '}
            <button
              type="button"
              onClick={openCollab}
              className="font-bold underline decoration-dotted underline-offset-4 hover-primary"
              style={{ color: 'var(--os-primary)' }}
            >
              open the collaboration channel
            </button>{' '}
            — hari responds to humans faster than to pings.
          </p>
        )}
      </div>

      <AnimatePresence>
        {arcade.lastLevelUp !== null && !focusChessMatch && (
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
                openCollab();
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
