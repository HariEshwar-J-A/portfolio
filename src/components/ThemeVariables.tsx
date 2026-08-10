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
  }, [palette]);

  return null;
};

export default ThemeVariables;
