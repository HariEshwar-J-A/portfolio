import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { portfolioData } from '../../data/portfolioData';
import { defaultPaletteId, getPalette, themePalettes } from '../../data/osPersona';
import type { PaletteId } from '../../data/osPersona';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  colors: typeof portfolioData.colors;
  palette: PaletteId;
}

const readStoredPalette = (): PaletteId => {
  try {
    const stored = window.localStorage.getItem('theme-palette');
    if (stored && themePalettes.some((palette) => palette.id === stored)) {
      return stored as PaletteId;
    }
  } catch {
    // Storage unavailable — fall through to default.
  }
  return defaultPaletteId;
};

const applyPalette = (state: ThemeState, id: PaletteId) => {
  const palette = getPalette(id);
  state.palette = palette.id;
  state.mode = palette.mode;
  state.colors = {
    ...state.colors,
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
  };
};

const buildInitialState = (): ThemeState => {
  const state: ThemeState = {
    mode: 'dark',
    colors: portfolioData.colors,
    palette: defaultPaletteId,
  };
  applyPalette(state, readStoredPalette());
  return state;
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: buildInitialState(),
  reducers: {
    /** Legacy light/dark toggle — hops between Daylight and Aurora personas. */
    toggleTheme: (state) => {
      applyPalette(state, state.mode === 'light' ? defaultPaletteId : 'daylight');
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      applyPalette(state, action.payload === 'light' ? 'daylight' : defaultPaletteId);
    },
    setPalette: (state, action: PayloadAction<PaletteId>) => {
      applyPalette(state, action.payload);
    },
    /** Steps to the next theme persona (bound to the T key). */
    cyclePalette: (state) => {
      const index = themePalettes.findIndex((palette) => palette.id === state.palette);
      applyPalette(state, themePalettes[(index + 1) % themePalettes.length].id);
    },
    updateColors: (state, action: PayloadAction<typeof portfolioData.colors>) => {
      state.colors = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, setPalette, cyclePalette, updateColors } = themeSlice.actions;
export default themeSlice.reducer;
