import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { navigateTo } from '../store/slices/navigationSlice';
import type { SectionId } from '../store/slices/navigationSlice';
import { RootState } from '../store/store';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Menu, X, Box, Newspaper, Command } from 'lucide-react';
import { OPEN_PALETTE_EVENT } from './CommandPalette';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { activeSection, sections } = useSelector((state: RootState) => state.navigation);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          ? `${theme.mode === 'dark' ? 'bg-slate-900/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'} shadow-md` 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
          Portfolio
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center space-x-5">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => handleNavigation(section)}
              className={`text-sm font-medium capitalize transition-colors ${
                activeSection === section
                  ? `text-${theme.colors.primary}`
                  : theme.mode === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
              }`}
              style={{
                color: activeSection === section ? theme.colors.primary : undefined
              }}
            >
              {section}
            </button>
          ))}

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 ${
              theme.mode === 'dark'
                ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-cyan-400/50'
                : 'border-slate-300 bg-white/80 text-slate-600 hover:border-blue-400/60'
            }`}
            aria-label="Open command palette"
          >
            <Command size={14} />
            <span className="hidden lg:inline">Ctrl K</span>
          </button>

          <a
            href="https://sentry.harieshwar.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 border border-white/20"
            style={{
              backgroundColor: theme.mode === 'dark' ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.95)',
              color: theme.mode === 'dark' ? '#f1f5f9' : '#0f172a',
            }}
          >
            <Newspaper size={16} />
            Info Sentry
          </a>

          <Link
            to="/3d"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <Box size={16} />
            3D Portfolio
          </Link>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors"
            aria-label="Toggle theme"
          >
            {theme.mode === 'dark' ? (
              <Sun size={20} className="text-yellow-300" />
            ) : (
              <Moon size={20} className="text-slate-700" />
            )}
          </button>
        </nav>
        
        {/* Mobile Navigation Toggle */}
        <div className="flex items-center xl:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 mr-2 rounded-full transition-colors"
            aria-label="Toggle theme"
          >
            {theme.mode === 'dark' ? (
              <Sun size={20} className="text-yellow-300" />
            ) : (
              <Moon size={20} className="text-slate-700" />
            )}
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} className={theme.mode === 'dark' ? 'text-white' : 'text-slate-900'} />
            ) : (
              <Menu size={24} className={theme.mode === 'dark' ? 'text-white' : 'text-slate-900'} />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className={`xl:hidden absolute w-full py-4 px-6 shadow-lg ${
            theme.mode === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}
        >
          <nav className="flex flex-col space-y-4">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => handleNavigation(section)}
                className={`text-base font-medium capitalize transition-colors ${
                  activeSection === section
                    ? `text-${theme.colors.primary}`
                    : theme.mode === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
                }`}
                style={{ 
                  color: activeSection === section ? theme.colors.primary : undefined 
                }}
              >
                {section}
              </button>
            ))}

          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              theme.mode === 'dark'
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
            className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition border border-white/20"
            style={{
              backgroundColor: theme.mode === 'dark' ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)',
              color: theme.mode === 'dark' ? '#f1f5f9' : '#0f172a',
            }}
          >
            <Newspaper size={16} />
            Info Sentry
          </a>

          <Link
            to="/3d"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg transition"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <Box size={16} />
            3D Portfolio
          </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;