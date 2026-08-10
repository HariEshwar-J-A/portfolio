import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { navigateTo } from '../store/slices/navigationSlice';
import type { SectionId } from '../store/slices/navigationSlice';
import { RootState } from '../store/store';
import { useTheme } from '../hooks/useTheme';
import { Menu, X, Box, Newspaper, Command, Gamepad2, Sparkles } from 'lucide-react';
import { OPEN_PALETTE_EVENT } from './CommandPalette';
import { CLOSE_INTENT_EVENT, OPEN_INTENT_EVENT } from './IntentWizard';
import ThemeSwitcher from './ThemeSwitcher';
import ViewModeToggle from './ViewModeToggle';
import { prefetchThreeDRoute, prefetchPlaygroundRoute } from '../lib/experienceRoutes';

/** Dismiss the visit concierge before leaving for Games/3D. */
const dismissIntentWizard = () => {
  window.dispatchEvent(new Event(CLOSE_INTENT_EVENT));
};

/** Short labels keep generous tab gaps from crowding the bar below 2xl. */
const SECTION_LABELS: Record<SectionId, { full: string; short: string }> = {
  about: { full: 'About', short: 'About' },
  skills: { full: 'Skills', short: 'Skills' },
  experience: { full: 'Experience', short: 'Work' },
  education: { full: 'Education', short: 'Edu' },
  projects: { full: 'Projects', short: 'Build' },
  products: { full: 'Products', short: 'Apps' },
  achievements: { full: 'Achievements', short: 'Wins' },
  contact: { full: 'Contact', short: 'Contact' },
};

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { activeSection, sections } = useSelector((state: RootState) => state.navigation);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDark = theme.mode === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (section: SectionId) => {
    dispatch(navigateTo(section));
    setIsMobileMenuOpen(false);
  };

  return (
    // z-[120]: stay above the visit-concierge modal so Play AI / 3D remain reachable on first visit
    <header
      className={`fixed top-0 left-0 w-full z-[120] transition-all duration-300 ${
        isScrolled
          ? `${isDark ? 'bg-slate-950/85 backdrop-blur-md' : 'bg-white/85 backdrop-blur-md'} shadow-md`
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
        <div className="flex shrink-0 items-center gap-2 font-mono text-lg font-bold tracking-tight md:text-xl">
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: 'var(--os-primary)' }} />
          <span className={isDark ? 'text-white' : 'text-slate-900'}>
            hari<span style={{ color: 'var(--os-primary)' }}>.ai</span>
          </span>
        </div>

        {/* Desktop Navigation — same tab rhythm as /ai (breathing room + short/full labels) */}
        <nav className="hidden min-w-0 flex-1 items-center justify-end gap-3 lg:flex xl:gap-4">
          <div className="flex min-w-0 items-center justify-center gap-5 px-2 xl:gap-6 2xl:gap-8">
            {sections.map((section) => {
              const isActive = activeSection === section;
              const labels = SECTION_LABELS[section] ?? { full: section, short: section };

              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => handleNavigation(section)}
                  title={labels.full}
                  className={`relative inline-flex shrink-0 items-center px-2.5 pb-1.5 text-sm font-medium tracking-wide transition-colors xl:px-3 ${
                    isActive
                      ? ''
                      : isDark
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-700 hover:text-black'
                  }`}
                  style={{ color: isActive ? 'var(--os-primary)' : undefined }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="hidden 2xl:inline">{labels.full}</span>
                  <span className="2xl:hidden">{labels.short}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full xl:inset-x-3"
                      style={{
                        background: 'linear-gradient(90deg, var(--os-primary), var(--os-secondary))',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Destinations — the other experiences */}
          <div
            className={`flex shrink-0 items-center gap-2.5 border-l pl-4 xl:gap-3 xl:pl-5 ${
              isDark ? 'border-white/10' : 'border-slate-200'
            }`}
          >
            <Link
              to="/ai"
              onMouseEnter={prefetchPlaygroundRoute}
              onFocus={prefetchPlaygroundRoute}
              onClick={dismissIntentWizard}
              className="os-border-flow rounded-full p-[1.5px] transition hover:-translate-y-0.5"
            >
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                  isDark ? 'bg-slate-950/90 text-white' : 'bg-white/95 text-slate-900'
                }`}
              >
                <Gamepad2 size={14} style={{ color: 'var(--os-primary)' }} />
                <span className="hidden xl:inline">Play AI</span>
                <span className="xl:hidden">AI</span>
              </span>
            </Link>

            <Link
              to="/3d"
              onMouseEnter={prefetchThreeDRoute}
              onFocus={prefetchThreeDRoute}
              onClick={dismissIntentWizard}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--os-primary)' }}
            >
              <Box size={14} />
              3D
            </Link>

            <a
              href="https://sentry.harieshwar.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold shadow-lg transition hover:-translate-y-0.5 xl:inline-flex"
              style={{
                backgroundColor: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.95)',
                color: isDark ? '#f1f5f9' : '#0f172a',
              }}
            >
              <Newspaper size={14} />
              Info Sentry
            </a>
          </div>

          {/* Controls — concierge, search, density, appearance */}
          <div
            className={`flex shrink-0 items-center gap-1.5 border-l pl-4 xl:gap-2 xl:pl-5 ${
              isDark ? 'border-white/10' : 'border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_INTENT_EVENT))}
              className="rounded-full p-2 transition hover:-translate-y-0.5"
              aria-label="Personalize my visit"
              title="For you — tell HARI.AI why you're here"
            >
              <Sparkles size={19} style={{ color: 'var(--os-primary)' }} />
            </button>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 ${
                isDark
                  ? 'border-slate-700 bg-slate-800/80 text-slate-300'
                  : 'border-slate-300 bg-white/80 text-slate-600'
              }`}
              aria-label="Search and commands"
              title="Smart search & commands (Ctrl K)"
            >
              <Command size={13} />
              <span className="hidden 2xl:inline">Ctrl K</span>
            </button>

            <ViewModeToggle />
            <ThemeSwitcher />
          </div>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center gap-1 lg:hidden">
          <ViewModeToggle />
          <ThemeSwitcher />

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X size={24} className={isDark ? 'text-white' : 'text-slate-900'} />
            ) : (
              <Menu size={24} className={isDark ? 'text-white' : 'text-slate-900'} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`absolute w-full px-6 py-5 shadow-xl backdrop-blur-xl lg:hidden ${
              isDark ? 'bg-slate-950/95 border-t border-white/10' : 'bg-white/95 border-t border-slate-200'
            }`}
          >
            <nav className="flex flex-col gap-1">
              {sections.map((section, index) => {
                const isActive = activeSection === section;
                const label = SECTION_LABELS[section]?.full ?? section;

                return (
                  <motion.button
                    key={section}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.035, duration: 0.18 }}
                    onClick={() => handleNavigation(section)}
                    className={`rounded-xl px-3 py-2.5 text-left text-base font-medium transition ${
                      isActive
                        ? ''
                        : isDark
                          ? 'text-slate-300 hover:bg-white/5'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    style={
                      isActive
                        ? {
                            color: 'var(--os-primary)',
                            backgroundColor: 'color-mix(in srgb, var(--os-primary) 10%, transparent)',
                          }
                        : undefined
                    }
                  >
                    {label}
                  </motion.button>
                );
              })}

              <div className={`my-3 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />

              <Link
                to="/ai"
                onClick={() => {
                  dismissIntentWizard();
                  setIsMobileMenuOpen(false);
                }}
                onMouseEnter={prefetchPlaygroundRoute}
                onFocus={prefetchPlaygroundRoute}
                className="os-border-flow rounded-full p-[1.5px]"
              >
                <span
                  className={`flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold ${
                    isDark ? 'bg-slate-950/90 text-white' : 'bg-white/95 text-slate-900'
                  }`}
                >
                  <Gamepad2 size={16} style={{ color: 'var(--os-primary)' }} />
                  Play with HARI.AI
                </span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.dispatchEvent(new Event(OPEN_INTENT_EVENT));
                }}
                className={`mt-2 inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/80 text-slate-300'
                    : 'border-slate-300 bg-white/80 text-slate-600'
                }`}
              >
                <Sparkles size={16} style={{ color: 'var(--os-primary)' }} />
                Personalize my visit
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
                }}
                className={`mt-2 inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/80 text-slate-300'
                    : 'border-slate-300 bg-white/80 text-slate-600'
                }`}
              >
                <Command size={16} />
                Search & commands
              </button>

              <a
                href="https://sentry.harieshwar.dev"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition border border-white/20"
                style={{
                  backgroundColor: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)',
                  color: isDark ? '#f1f5f9' : '#0f172a',
                }}
              >
                <Newspaper size={16} />
                Info Sentry
              </a>

              <Link
                to="/3d"
                onClick={() => {
                  dismissIntentWizard();
                  setIsMobileMenuOpen(false);
                }}
                onMouseEnter={prefetchThreeDRoute}
                onFocus={prefetchThreeDRoute}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg transition"
                style={{ backgroundColor: 'var(--os-primary)' }}
              >
                <Box size={16} />
                3D Portfolio
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
