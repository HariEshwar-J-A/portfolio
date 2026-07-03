import React from 'react';
import { useTheme } from '../hooks/useTheme';

/**
 * Fixed, full-viewport ambient layer that every section floats above:
 * a theme-aware base wash, three slowly drifting aurora blobs, a dot
 * grid, and a soft vignette. Pure CSS animation — pauses automatically
 * under prefers-reduced-motion (see index.css).
 */
const AmbientBackground: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  const blobs = isDark
    ? [
        'radial-gradient(circle, rgba(34,211,238,0.16), transparent 65%)',
        'radial-gradient(circle, rgba(99,102,241,0.18), transparent 65%)',
        'radial-gradient(circle, rgba(217,70,239,0.10), transparent 65%)',
      ]
    : [
        'radial-gradient(circle, rgba(59,130,246,0.14), transparent 65%)',
        'radial-gradient(circle, rgba(99,102,241,0.12), transparent 65%)',
        'radial-gradient(circle, rgba(16,185,129,0.10), transparent 65%)',
      ];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base wash */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #020617 0%, #0b1120 45%, #020617 100%)'
            : 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 45%, #f8fafc 100%)',
        }}
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
