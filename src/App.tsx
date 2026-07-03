import React, { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { store } from './store/store';
import HomePage from './pages/HomePage';
import ThemeVariables from './components/ThemeVariables';

const ThreeDPortfolioPage = lazy(() => import('./pages/ThreeDPortfolioPage'));
const OsPlaygroundPage = lazy(() => import('./pages/OsPlaygroundPage'));

/** Soft fade/slide between routes so page switches feel continuous. */
const PageFade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.28, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageFade>
              <HomePage />
            </PageFade>
          }
        />
        <Route
          path="/3d"
          element={
            <PageFade>
              <ThreeDPortfolioPage />
            </PageFade>
          }
        />
        <Route
          path="/os"
          element={
            <PageFade>
              <OsPlaygroundPage />
            </PageFade>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeVariables />
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
            Loading experience...
          </div>
        }
      >
        <AnimatedRoutes />
      </Suspense>
    </Provider>
  );
}

export default App;
