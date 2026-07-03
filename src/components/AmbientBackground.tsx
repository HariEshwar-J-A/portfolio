import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTheme } from '../hooks/useTheme';
import { getPalette } from '../data/osPersona';

/**
 * Fixed, full-viewport ambient layer that every section floats above:
 * the active theme persona's base wash, three slowly drifting aurora
 * blobs, a dot grid, and a soft vignette. Pure CSS animation — pauses
 * automatically under prefers-reduced-motion (see index.css).
 */
const AmbientBackground: React.FC = () => {
  const { theme } = useTheme();
  const palette = getPalette(useSelector((state: RootState) => state.theme.palette));
  const isDark = theme.mode === 'dark';
  const blobs = palette.blobs;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base wash */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ background: palette.ambientBase }}
      />

      {/* Aurora blobs */}
      <div
        className="animate-aurora-1 absolute -left-[15%] top-[-10%] h-[55vmax] w-[55vmax] rounded-full blur-3xl"
        style={{ background: blobs[0] }}
      />
      <div
        className="animate-aurora-2 absolute right-[-18%] top-[22%] h-[60vmax] w-[60vmax] rounded-full blur-3xl"
        style={{ background: blobs[1] }}
      />
      <div
        className="animate-aurora-3 absolute bottom-[-22%] left-[18%] h-[50vmax] w-[50vmax] rounded-full blur-3xl"
        style={{ background: blobs[2] }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${
            isDark ? 'rgba(148,163,184,0.14)' : 'rgba(100,116,139,0.16)'
          } 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          maskImage: 'radial-gradient(ellipse 85% 70% at 50% 40%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 40%, black 30%, transparent 100%)',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgba(2,6,23,0.55) 100%)'
            : 'radial-gradient(ellipse 120% 90% at 50% 45%, transparent 60%, rgba(226,232,240,0.5) 100%)',
        }}
      />
    </div>
  );
};

export default AmbientBackground;
