import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { navigateTo } from '../store/slices/navigationSlice';
import { RootState } from '../store/store';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Menu, X } from 'lucide-react';

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

  const handleNavigation = (section: string) => {
    dispatch(navigateTo(section as any));
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
        <div className="text-2xl font-bold" style={{ color: theme.colors.primary700 }}>
          Portfolio
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => handleNavigation(section)}
              className={`text-base font-medium capitalize transition-colors ${
                activeSection === section
                  ? `text-primary-700`
                  : theme.mode === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
              }`}
              style={{ 
                color: activeSection === section ? theme.colors.primary700 : undefined 
              }}
            >
              {section}
            </button>
          ))}
          
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
        <div className="flex items-center md:hidden">
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
            aria-expanded={isMobileMenuOpen}
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
          className={`md:hidden absolute w-full py-4 px-6 shadow-lg ${
            theme.mode === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <nav className="flex flex-col space-y-4">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => handleNavigation(section)}
                className={`text-base font-medium capitalize transition-colors ${
                  activeSection === section
                    ? `text-primary-700`
                    : theme.mode === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
                }`}
                style={{ 
                  color: activeSection === section ? theme.colors.primary700 : undefined 
                }}
                role="menuitem"
              >
                {section}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;