import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SectionId = 'about' | 'skills' | 'experience' | 'education' | 'projects' | 'achievements' | 'contact';

interface NavigationState {
  activeSection: SectionId;
  sections: SectionId[];
  isAnimating: boolean;
}

const initialState: NavigationState = {
  activeSection: 'about',
  sections: ['about', 'skills', 'experience', 'education', 'projects', 'achievements', 'contact'],
  isAnimating: false,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setActiveSection: (state, action: PayloadAction<SectionId>) => {
      state.activeSection = action.payload;
    },
    startAnimation: (state) => {
      state.isAnimating = true;
    },
    endAnimation: (state) => {
      state.isAnimating = false;
    },
    navigateTo: (state, action: PayloadAction<SectionId>) => {
      // Handled by saga
    },
  },
});

export const {
  setActiveSection,
  startAnimation,
  endAnimation,
  navigateTo,
} = navigationSlice.actions;

export default navigationSlice.reducer;