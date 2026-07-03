import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { navigateTo } from '../store/slices/navigationSlice';
import type { SectionId } from '../store/slices/navigationSlice';
import { RootState } from '../store/store';
import { useTheme } from '../hooks/useTheme';
import { Menu, X, Box, Newspaper, Command, Gamepad2 } from 'lucide-react';
import { OPEN_PALETTE_EVENT } from './CommandPalette';
import ThemeSwitcher from './ThemeSwitcher';

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
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? `${isDark ? 'bg-slate-950/85 backdrop-blur-md' : 'bg-white/85 backdrop-blur-md'} shadow-md`
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-mono text-xl font-bold tracking-tight">
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: 'var(--os-primary)' }} />
          <span className={isDark ? 'text-white' : 'text-slate-900'}>
            hari<span style={{ color: 'var(--os-primary)' }}>.os</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center space-x-4">
          {sections.map((section) => {
            const isActive = activeSection === section;

            return (
              <button
                key={section}
                onClick={() => handleNavigation(section)}
                className={`relative pb-1 text-sm font-medium capitalize transition-colors ${
                  isActive
                    ? ''
                    : isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-700 hover:text-black'
                }`}
                style={{ color: isActive ? 'var(--os-primary)' : undefined }}
              >
                {section}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, var(--os-primary), var(--os-secondary))',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 ${
              isDark
                ? 'border-slate-700 bg-slate-800/80 text-slate-300'
                : 'border-slate-300 bg-white/80 text-slate-600'
            }`}
            aria-label="Open command palette"
          >
            <Command size={13} />
            <span className="hidden 2xl:inline">Ctrl K</span>
          </button>

          {/* Playground — the gamified exploration mode */}
          <Link to="/os" className="os-border-flow rounded-full p-[1.5px] transition hover:-translate-y-0.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                isDark ? 'bg-slate-950/90 text-white' : 'bg-white/95 text-slate-900'
              }`}
            >
              <Gamepad2 size={14} style={{ color: 'var(--os-primary)' }} />
              Playground
            </span>
          </Link>

          <a
            href="https://sentry.harieshwar.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold shadow-lg transition hover:-translate-y-0.5 border border-white/20"
            style={{
              backgroundColor: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.95)',
              color: isDark ? '#f1f5f9' : '#0f172a',
            }}
          >
            <Newspaper size={14} />
            Info Sentry
          </a>

          <Link
            to="/3d"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--os-primary)' }}
          >
            <Box size={14} />
            3D
          </Link>

          <ThemeSwitcher />
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center gap-2 xl:hidden">
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
            className={`xl:hidden absolute w-full px-6 py-5 shadow-xl backdrop-blur-xl ${
              isDark ? 'bg-slate-950/95 border-t border-white/10' : 'bg-white/95 border-t border-slate-200'
            }`}
          >
            <nav className="flex flex-col gap-1">
              {sections.map((section, index) => {
                const isActive = activeSection === section;

                return (
                  <motion.button
                    key={section}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.035, duration: 0.18 }}
                    onClick={() => handleNavigation(section)}
                    className={`rounded-xl px-3 py-2.5 text-left text-base font-medium capitalize transition ${
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
                    {section}
                  </motion.button>
                );
              })}

              <div className={`my-3 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />

              <Link
                to="/os"
                onClick={() => setIsMobileMenuOpen(false)}
                className="os-border-flow rounded-full p-[1.5px]"
              >
                <span
                  className={`flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold ${
                    isDark ? 'bg-slate-950/90 text-white' : 'bg-white/95 text-slate-900'
                  }`}
                >
                  <Gamepad2 size={16} style={{ color: 'var(--os-primary)' }} />
                  Enter the Playground
                </span>
              </Link>

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
                Command palette
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
                onClick={() => setIsMobileMenuOpen(false)}
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
