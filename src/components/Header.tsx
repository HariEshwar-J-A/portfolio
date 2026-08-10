import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { navigateTo } from '../store/slices/navigationSlice';
import type { SectionId } from '../store/slices/navigationSlice';
import { RootState } from '../store/store';
import { toggleViewMode } from '../store/slices/viewSlice';
import { useTheme } from '../hooks/useTheme';
import {
  Menu,
  X,
  Box,
  Newspaper,
  Command,
  Gamepad2,
  Sparkles,
  ChevronDown,
  Maximize2,
  Minimize2,
  MoreHorizontal,
} from 'lucide-react';
import { OPEN_PALETTE_EVENT } from './CommandPalette';
import { CLOSE_INTENT_EVENT, OPEN_INTENT_EVENT } from './IntentWizard';
import ThemeSwitcher from './ThemeSwitcher';
import { prefetchThreeDRoute, prefetchPlaygroundRoute } from '../lib/experienceRoutes';

/** Dismiss the visit concierge before leaving for Games/3D. */
const dismissIntentWizard = () => {
  window.dispatchEvent(new Event(CLOSE_INTENT_EVENT));
};

/**
 * Compact labels in the bar — full names stay in title/mobile menu.
 */
const SECTION_LABELS: Record<SectionId, string> = {
  about: 'About',
  skills: 'Skills',
  experience: 'Work',
  education: 'Edu',
  projects: 'Build',
  products: 'Apps',
  achievements: 'Wins',
  contact: 'Contact',
};

const SECTION_TITLES: Record<SectionId, string> = {
  about: 'About',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  projects: 'Projects',
  products: 'Products',
  achievements: 'Achievements',
  contact: 'Contact',
};

/**
 * One-click in the bar: section tabs, Play AI, theme.
 * Everything else lives in a single stacked "More" menu so the header
 * does not feel like a control panel.
 */
const Header: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { activeSection, sections } = useSelector((state: RootState) => state.navigation);
  const viewMode = useSelector((state: RootState) => state.view.mode);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const isDark = theme.mode === 'dark';
  const isMinimal = viewMode === 'minimal';
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMoreOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMoreOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMoreOpen]);

  const handleNavigation = (section: SectionId) => {
    dispatch(navigateTo(section));
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);
  };

  const menuPanelClass = isDark
    ? 'border-white/10 bg-slate-950/95 text-slate-200'
    : 'border-slate-200 bg-white/95 text-slate-700';
  const menuItemClass = isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100';
  const menuMuted = isDark ? 'text-slate-500' : 'text-slate-400';

  // Never paint portfolio chrome on experience routes (avoids dual fixed headers).
  if (!isHome) return null;

  return (
    // z-[120]: stay above the visit-concierge modal so Play AI remains reachable on first visit
    <header
      className={`fixed top-0 left-0 w-full z-[120] transition-all duration-300 ${
        isScrolled
          ? `${isDark ? 'bg-slate-950/85 backdrop-blur-md' : 'bg-white/85 backdrop-blur-md'} shadow-md`
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:gap-4 md:px-6 md:py-4">
        <div className="relative z-10 flex shrink-0 items-center gap-2 font-mono text-lg font-bold tracking-tight md:text-xl">
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: 'var(--os-primary)' }} />
          <span className={isDark ? 'text-white' : 'text-slate-900'}>
                  hari<span style={{ color: 'var(--os-primary)' }}>.os</span>
          </span>
        </div>

        {/* Primary: page sections only */}
        <nav
          className="hidden min-w-0 items-center justify-center gap-3 overflow-x-auto px-2 lg:flex xl:gap-5 2xl:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Page sections"
        >
          {sections.map((section) => {
            const isActive = activeSection === section;
            const label = SECTION_LABELS[section] ?? section;
            const title = SECTION_TITLES[section] ?? section;

            return (
              <button
                key={section}
                type="button"
                onClick={() => handleNavigation(section)}
                title={title}
                className={`relative inline-flex shrink-0 items-center px-2 pb-1.5 text-sm font-medium tracking-wide transition-colors xl:px-2.5 ${
                  isActive
                    ? ''
                    : isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-700 hover:text-black'
                }`}
                style={{ color: isActive ? 'var(--os-primary)' : undefined }}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full xl:inset-x-2.5"
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

        {/* One-click: Play AI + More stack + theme */}
        <div className="relative z-10 flex shrink-0 items-center justify-end gap-2 xl:gap-2.5">
          <Link
            to="/ai"
            onMouseEnter={prefetchPlaygroundRoute}
            onFocus={prefetchPlaygroundRoute}
            onClick={dismissIntentWizard}
            className="os-border-flow hidden rounded-full p-[1.5px] transition hover:-translate-y-0.5 lg:inline-flex"
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                isDark ? 'bg-slate-950/90 text-white' : 'bg-white/95 text-slate-900'
              }`}
            >
              <Gamepad2 size={14} style={{ color: 'var(--os-primary)' }} />
              Play AI
            </span>
          </Link>

          <div className="relative hidden lg:block" ref={moreRef}>
            <button
              type="button"
              onClick={() => setIsMoreOpen((open) => !open)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5 ${
                isDark
                  ? 'border-slate-700 bg-slate-800/80 text-slate-300'
                  : 'border-slate-300 bg-white/80 text-slate-600'
              }`}
              aria-expanded={isMoreOpen}
              aria-haspopup="menu"
              aria-label="More actions"
            >
              <MoreHorizontal size={15} />
              More
              <ChevronDown size={13} className={`transition ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isMoreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  role="menu"
                  className={`absolute right-0 top-[calc(100%+0.5rem)] w-64 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${menuPanelClass}`}
                >
                  <div className={`border-b px-3.5 py-2.5 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <p className={`font-mono text-[10px] font-black uppercase tracking-[0.22em] ${menuMuted}`}>
                      Experiences
                    </p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      to="/3d"
                      role="menuitem"
                      onMouseEnter={prefetchThreeDRoute}
                      onFocus={prefetchThreeDRoute}
                      onClick={() => {
                        dismissIntentWizard();
                        closeMenus();
                      }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${menuItemClass}`}
                    >
                      <Box size={16} style={{ color: 'var(--os-primary)' }} />
                      <span>
                        3D Portfolio
                        <span className={`mt-0.5 block text-[11px] font-normal ${menuMuted}`}>
                          Spatial walkthrough
                        </span>
                      </span>
                    </Link>
                    <a
                      href="https://sentry.harieshwar.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      role="menuitem"
                      onClick={closeMenus}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${menuItemClass}`}
                    >
                      <Newspaper size={16} style={{ color: 'var(--os-primary)' }} />
                      <span>
                        Info Sentry
                        <span className={`mt-0.5 block text-[11px] font-normal ${menuMuted}`}>
                          News intelligence product
                        </span>
                      </span>
                    </a>
                  </div>

                  <div className={`border-y px-3.5 py-2.5 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <p className={`font-mono text-[10px] font-black uppercase tracking-[0.22em] ${menuMuted}`}>
                      Visit tools
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        closeMenus();
                        window.dispatchEvent(new Event(OPEN_INTENT_EVENT));
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${menuItemClass}`}
                    >
                      <Sparkles size={16} style={{ color: 'var(--os-primary)' }} />
                      Personalize my visit
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        closeMenus();
                        window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${menuItemClass}`}
                    >
                      <Command size={16} style={{ color: 'var(--os-primary)' }} />
                      <span className="flex flex-1 items-center justify-between gap-2">
                        Search & commands
                        <kbd className={`font-mono text-[10px] ${menuMuted}`}>⌘K</kbd>
                      </span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        dispatch(toggleViewMode());
                        setIsMoreOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${menuItemClass}`}
                    >
                      {isMinimal ? (
                        <Minimize2 size={16} style={{ color: 'var(--os-primary)' }} />
                      ) : (
                        <Maximize2 size={16} style={{ color: 'var(--os-primary)' }} />
                      )}
                      {isMinimal ? 'Switch to full view' : 'Switch to minimal view'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden lg:block">
            <ThemeSwitcher />
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full p-2 transition-colors"
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
      </div>

      {/* Mobile Menu — same priority: sections, Play AI, then grouped extras */}
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
              <p className={`mb-1 px-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] ${menuMuted}`}>
                On this page
              </p>
              {sections.map((section, index) => {
                const isActive = activeSection === section;
                const label = SECTION_TITLES[section] ?? section;

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
                  closeMenus();
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
                  Play with HARI.OS
                </span>
              </Link>

              <p className={`mb-1 mt-4 px-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] ${menuMuted}`}>
                Experiences
              </p>
              <Link
                to="/3d"
                onClick={() => {
                  dismissIntentWizard();
                  closeMenus();
                }}
                onMouseEnter={prefetchThreeDRoute}
                onFocus={prefetchThreeDRoute}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${menuItemClass}`}
              >
                <Box size={16} style={{ color: 'var(--os-primary)' }} />
                3D Portfolio
              </Link>
              <a
                href="https://sentry.harieshwar.dev"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenus}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${menuItemClass}`}
              >
                <Newspaper size={16} style={{ color: 'var(--os-primary)' }} />
                Info Sentry
              </a>

              <p className={`mb-1 mt-3 px-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] ${menuMuted}`}>
                Visit tools
              </p>
              <button
                type="button"
                onClick={() => {
                  closeMenus();
                  window.dispatchEvent(new Event(OPEN_INTENT_EVENT));
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${menuItemClass}`}
              >
                <Sparkles size={16} style={{ color: 'var(--os-primary)' }} />
                Personalize my visit
              </button>
              <button
                type="button"
                onClick={() => {
                  closeMenus();
                  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${menuItemClass}`}
              >
                <Command size={16} style={{ color: 'var(--os-primary)' }} />
                Search & commands
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(toggleViewMode());
                  setIsMobileMenuOpen(false);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${menuItemClass}`}
              >
                {isMinimal ? (
                  <Minimize2 size={16} style={{ color: 'var(--os-primary)' }} />
                ) : (
                  <Maximize2 size={16} style={{ color: 'var(--os-primary)' }} />
                )}
                {isMinimal ? 'Switch to full view' : 'Switch to minimal view'}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
