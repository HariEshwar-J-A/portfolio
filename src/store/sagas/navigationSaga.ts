import { takeLatest, put } from 'redux-saga/effects';
import { navigateTo, setActiveSection, startAnimation, endAnimation } from '../slices/navigationSlice';
import { getLenis } from '../../hooks/useSmoothScroll';

function* handleNavigate(action: ReturnType<typeof navigateTo>) {
  const sectionId = action.payload;

  // Start animation
  yield put(startAnimation());

  // Scroll to section — through Lenis when active so easing stays consistent
  const element = document.getElementById(sectionId);
  if (element) {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(element, { offset: -64, duration: 1.1 });
    } else {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  // Set active section
  yield put(setActiveSection(sectionId));
  
  // Hold the scene-transition veil for the Lenis travel duration
  yield new Promise(resolve => setTimeout(resolve, 1100));
  yield put(endAnimation());
}

export function* watchNavigation() {
  yield takeLatest(navigateTo.type, handleNavigate);
}