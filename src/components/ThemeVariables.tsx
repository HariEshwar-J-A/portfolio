import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { getPalette } from '../data/osPersona';

/**
 * Mirrors the active theme persona into CSS custom properties so every
 * background, border, progress bar, and keyframe animation recolors
 * itself the moment the persona changes.
 */
const ThemeVariables: React.FC = () => {
  const palette = getPalette(useSelector((state: RootState) => state.theme.palette));

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--os-primary', palette.primary);
    root.setProperty('--os-secondary', palette.secondary);
    root.setProperty('--os-accent', palette.accent);
    // Light persona fills (aurora, grandmaster, circuit) fail white-on-primary.
    // Daylight's blue is dark enough for white.
    root.setProperty('--os-on-primary', palette.mode === 'dark' ? '#0f172a' : '#ffffff');
    root.setProperty('--os-muted', palette.mode === 'dark' ? '#94a3b8' : '#475569');
  }, [palette]);

  return null;
};

export default ThemeVariables;
