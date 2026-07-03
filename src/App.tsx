import React, { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { store } from './store/store';
import HomePage from './pages/HomePage';
import ThemeVariables from './components/ThemeVariables';

const ThreeDPortfolioPage = lazy(() => import('./pages/ThreeDPortfolioPage'));
const OsPlaygroundPage = lazy(() => import('./pages/OsPlaygroundPage'));

/**
 * Cinematic fade between routes. No `filter` here: a persistent filter
 * (even blur(0px)) turns the wrapper into a containing block and breaks
 * every fixed-position element inside (header, narrator, palette).
 */
const PageFade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 14, scale: 0.995 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -14, scale: 0.995 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
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
          path="/ai"
          element={
            <PageFade>
              <OsPlaygroundPage />
            </PageFade>
          }
        />
        <Route path="/os" element={<Navigate to="/ai" replace />} />
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
