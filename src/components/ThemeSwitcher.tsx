import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { RootState } from '../store/store';
import { setPalette } from '../store/slices/themeSlice';
import { useTheme } from '../hooks/useTheme';
import { themePalettes } from '../data/osPersona';

/** Popover picker for the HARI.AI theme personas. */
const ThemeSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const activePalette = useSelector((state: RootState) => state.theme.palette);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isDark = theme.mode === 'dark';

  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('pointerdown', handlePointer);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('pointerdown', handlePointer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="p-2 rounded-full transition-colors"
        aria-label="Choose theme persona"
        aria-expanded={isOpen}
      >
        <Palette size={20} style={{ color: theme.colors.primary }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`absolute right-0 top-full z-[60] mt-2 w-72 overflow-hidden rounded-2xl border p-2 shadow-2xl backdrop-blur-xl ${
              isDark ? 'border-white/10 bg-slate-950/95' : 'border-slate-200 bg-white/95'
            }`}
            role="menu"
          >
            <p
              className={`px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.25em] ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Theme personas · T cycles
            </p>
            {themePalettes.map((palette) => {
              const isActive = palette.id === activePalette;
              return (
                <button
                  key={palette.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => {
                    dispatch(setPalette(palette.id));
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isActive
                      ? isDark
                        ? 'bg-white/10'
                        : 'bg-slate-100'
                      : isDark
                        ? 'hover:bg-white/5'
                        : 'hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="mt-1 h-4 w-4 shrink-0 rounded-full ring-2 ring-white/20"
                    style={{
                      background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                    }}
                  />
                  <span className="flex-1">
                    <span
                      className={`flex items-center gap-2 text-sm font-bold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {palette.label}
                      {isActive && <Check size={13} style={{ color: palette.primary }} />}
                    </span>
                    <span className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {palette.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
