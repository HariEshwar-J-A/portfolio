import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { portfolioData } from '../../data/portfolioData';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  colors: typeof portfolioData.colors;
}

const initialState: ThemeState = {
  mode: 'light',
  colors: portfolioData.colors,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
    },
    updateColors: (state, action: PayloadAction<typeof portfolioData.colors>) => {
      state.colors = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, updateColors } = themeSlice.actions;
export default themeSlice.reducer;