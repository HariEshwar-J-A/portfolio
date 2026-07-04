import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ViewMode = 'minimal' | 'comprehensive';

/** Why the visitor is here — set by the intent wizard, null = untargeted. */
export type FocusId = 'hiring' | 'collaboration' | 'personal' | 'explore';

interface ViewState {
  mode: ViewMode;
  focus: FocusId | null;
  /** Free-text detail from the wizard (e.g. the role being hired for). */
  focusDetail: string | null;
}

const readInitialState = (): ViewState => {
  const state: ViewState = { mode: 'comprehensive', focus: null, focusDetail: null };
  try {
    const storedMode = window.localStorage.getItem('view-mode');
    if (storedMode === 'minimal' || storedMode === 'comprehensive') state.mode = storedMode;
    const storedFocus = window.sessionStorage.getItem('view-focus');
    if (storedFocus) {
      const parsed = JSON.parse(storedFocus) as Partial<ViewState>;
      if (parsed.focus) state.focus = parsed.focus;
      if (typeof parsed.focusDetail === 'string') state.focusDetail = parsed.focusDetail;
    }
  } catch {
    // Storage unavailable — defaults stand.
  }
  return state;
};

const viewSlice = createSlice({
  name: 'view',
  initialState: readInitialState(),
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.mode = action.payload;
    },
    toggleViewMode: (state) => {
      state.mode = state.mode === 'minimal' ? 'comprehensive' : 'minimal';
    },
    setFocus: (state, action: PayloadAction<{ focus: FocusId; detail?: string }>) => {
      state.focus = action.payload.focus;
      state.focusDetail = action.payload.detail?.trim() || null;
    },
    clearFocus: (state) => {
      state.focus = null;
      state.focusDetail = null;
    },
  },
});

export const { setViewMode, toggleViewMode, setFocus, clearFocus } = viewSlice.actions;
export default viewSlice.reducer;
