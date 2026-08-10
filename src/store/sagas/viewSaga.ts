import { takeLatest, select } from 'redux-saga/effects';
import { setViewMode, toggleViewMode, setFocus, clearFocus } from '../slices/viewSlice';
import { RootState } from '../store';

// View mode persists across visits; visit intent only for this session.
function* persistView() {
  const view: RootState['view'] = yield select((state: RootState) => state.view);
  try {
    localStorage.setItem('view-mode', view.mode);
    if (view.focus) {
      sessionStorage.setItem(
        'view-focus',
        JSON.stringify({ focus: view.focus, focusDetail: view.focusDetail })
      );
    } else {
      sessionStorage.removeItem('view-focus');
    }
  } catch {
    // Storage unavailable — preferences reset next visit.
  }
}

export function* watchView() {
  yield takeLatest(
    [setViewMode.type, toggleViewMode.type, setFocus.type, clearFocus.type],
    persistView
  );
}
