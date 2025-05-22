import { takeLatest, put } from 'redux-saga/effects';
import { navigateTo, setActiveSection, startAnimation, endAnimation } from '../slices/navigationSlice';

function* handleNavigate(action: ReturnType<typeof navigateTo>) {
  const sectionId = action.payload;
  
  // Start animation
  yield put(startAnimation());
  
  // Scroll to section
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Set active section
  yield put(setActiveSection(sectionId));
  
  // End animation after delay
  yield new Promise(resolve => setTimeout(resolve, 500));
  yield put(endAnimation());
}

export function* watchNavigation() {
  yield takeLatest(navigateTo.type, handleNavigate);
}