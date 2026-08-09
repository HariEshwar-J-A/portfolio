import React, { Suspense, lazy, useEffect } from 'react';
import { Provider } from 'react-redux';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { store } from './store/store';
import HomePage from './pages/HomePage';
import ThemeVariables from './components/ThemeVariables';
import AiRouteLoader from './components/AiRouteLoader';
import ScrollToTop from './components/ScrollToTop';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import {
  playgroundImport,
  prefetchPlaygroundRoute,
  threeDImport,
} from './lib/experienceRoutes';

const ThreeDPortfolioPage = lazy(threeDImport);
const OsPlaygroundPage = lazy(playgroundImport);

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

/**
 * Suspense is per-route so a lazy suspend cannot tear down the router shell.
 * No opacity-0 wrapper here: after the chunk resolves the page must paint
 * immediately — a stuck PageFade left /ai as an empty ambient background.
 */
const LazyPage: React.FC<{ pathname: string; children: React.ReactNode }> = ({
  pathname,
  children,
}) => (
  <RouteErrorBoundary pathname={pathname}>
    <Suspense fallback={<AiRouteLoader pathname={pathname} />}>{children}</Suspense>
  </RouteErrorBoundary>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  // Prefetch the small Games chunk on idle; 3D waits for hover (see Header).
  useEffect(() => {
    const ric = window.requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    const cancelRic = window.cancelIdleCallback as ((id: number) => void) | undefined;
    const idle = ric?.(prefetchPlaygroundRoute, { timeout: 1500 });
    const fallback = idle == null ? window.setTimeout(prefetchPlaygroundRoute, 600) : null;
    return () => {
      if (idle != null) cancelRic?.(idle);
      if (fallback != null) window.clearTimeout(fallback);
    };
  }, []);

  return (
    // Do not use mode="wait": nested presence (intent wizard, etc.) can
    // deadlock the exit and leave the next route on a forever loader.
    <AnimatePresence>
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
            <LazyPage pathname="/3d">
              <ThreeDPortfolioPage />
            </LazyPage>
          }
        />
        <Route
          path="/ai"
          element={
            <LazyPage pathname="/ai">
              <OsPlaygroundPage />
            </LazyPage>
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
      <ScrollToTop />
      <AnimatedRoutes />
    </Provider>
  );
}

export default App;
