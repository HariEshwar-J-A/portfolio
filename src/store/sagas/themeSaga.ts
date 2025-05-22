import { takeLatest, put, select } from 'redux-saga/effects';
import { toggleTheme, setTheme } from '../slices/themeSlice';
import { RootState } from '../store';

// This saga could be extended to save theme preference to local storage
function* handleThemeToggle() {
  const currentTheme = yield select((state: RootState) => state.theme.mode);
  localStorage.setItem('theme', currentTheme);
}

export function* watchTheme() {
  yield takeLatest([toggleTheme.type, setTheme.type], handleThemeToggle);
}