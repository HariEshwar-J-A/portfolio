import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { store } from './store/store';
import HomePage from './pages/HomePage';
import ThemeVariables from './components/ThemeVariables';
import AiRouteLoader from './components/AiRouteLoader';

const ThreeDPortfolioPage = lazy(() => import('./pages/ThreeDPortfolioPage'));
const OsPlaygroundPage = lazy(() => import('./pages/OsPlaygroundPage'));

/** How long HARI.AI "prepares" a destination before revealing it. */
const LOADER_MS = 950;

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
  const previousPath = useRef(location.pathname);
  const [loaderPath, setLoaderPath] = useState<string | null>(null);

  // On every route change, HARI.AI covers the swap with a loader scripted
  // for the destination. Skipped on first paint (boot/Suspense handle it)
  // and under prefers-reduced-motion.
  useEffect(() => {
    if (previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setLoaderPath(location.pathname);
    const timeout = window.setTimeout(() => setLoaderPath(null), LOADER_MS);
    return () => window.clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence>
        {loaderPath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[180]"
          >
            <AiRouteLoader pathname={loaderPath} />
          </motion.div>
        )}
      </AnimatePresence>

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
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeVariables />
      {/* Lazy chunks show the same AI loader, so slow loads just extend it */}
      <Suspense fallback={<AiRouteLoader />}>
        <AnimatedRoutes />
      </Suspense>
    </Provider>
  );
}

export default App;
