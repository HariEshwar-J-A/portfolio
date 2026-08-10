import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SectionId =
  | 'about'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'products'
  | 'achievements'
  | 'contact';

interface NavigationState {
  activeSection: SectionId;
  sections: SectionId[];
  isAnimating: boolean;
}

const initialState: NavigationState = {
  activeSection: 'about',
  sections: ['about', 'skills', 'experience', 'education', 'projects', 'products', 'achievements', 'contact'],
  isAnimating: false,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setActiveSection: (state, action: PayloadAction<SectionId>) => {
      state.activeSection = action.payload;
    },
    /** Reorder sections — used by the intent wizard's personalized views. */
    setSections: (state, action: PayloadAction<SectionId[]>) => {
      state.sections = action.payload;
    },
    startAnimation: (state) => {
      state.isAnimating = true;
    },
    endAnimation: (state) => {
      state.isAnimating = false;
    },
    navigateTo: (state, action: PayloadAction<SectionId>) => {
      void state;
      void action;
      // Handled by saga
    },
  },
});

export const {
  setActiveSection,
  setSections,
  startAnimation,
  endAnimation,
  navigateTo,
} = navigationSlice.actions;

export default navigationSlice.reducer;