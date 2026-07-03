import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { navigateTo } from '../store/slices/navigationSlice';
import { useTheme } from '../hooks/useTheme';

/**
 * Minimal section indicator for the base portfolio — quiet dots, no
 * scores or quests. The active dot takes the persona's primary color.
 */
const SectionDots: React.FC = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { activeSection, sections } = useSelector((state: RootState) => state.navigation);
  const isDark = theme.mode === 'dark';

  return (
    <nav
      aria-label="Sections"
      className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
    >
      {sections.map((section) => {
        const isActive = activeSection === section;

        return (
          <button
            key={section}
            type="button"
            onClick={() => dispatch(navigateTo(section))}
            aria-label={`Go to ${section}`}
            aria-current={isActive ? 'true' : undefined}
            className="group relative flex h-5 w-5 items-center justify-center"
          >
            <span
              className="h-2 w-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: isActive
                  ? 'var(--os-primary)'
                  : isDark
                    ? 'rgba(255,255,255,0.25)'
                    : 'rgba(15,23,42,0.2)',
                transform: isActive ? 'scale(1.5)' : undefined,
                boxShadow: isActive
                  ? '0 0 10px color-mix(in srgb, var(--os-primary) 70%, transparent)'
                  : undefined,
              }}
            />
            <span
              className={`pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100 ${
                isDark
                  ? 'border-white/10 bg-slate-950/90 text-white'
                  : 'border-slate-200 bg-white/95 text-slate-900'
              }`}
            >
              {section}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default SectionDots;
