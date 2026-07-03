import { takeLatest, select } from 'redux-saga/effects';
import { toggleTheme, setTheme, setPalette, cyclePalette } from '../slices/themeSlice';
import { RootState } from '../store';

// Persist the selected theme persona so it survives visits.
function* persistTheme() {
  const theme: RootState['theme'] = yield select((state: RootState) => state.theme);
  try {
    localStorage.setItem('theme', theme.mode);
    localStorage.setItem('theme-palette', theme.palette);
  } catch {
    // Storage unavailable (private mode) — theme resets next visit.
  }
}

export function* watchTheme() {
  yield takeLatest(
    [toggleTheme.type, setTheme.type, setPalette.type, cyclePalette.type],
    persistTheme
  );
}
