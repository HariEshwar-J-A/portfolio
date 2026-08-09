import React, { Suspense, lazy, useEffect } from 'react';
import { Provider } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
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
 * Enter-only route transition.
 *
 * No AnimatePresence / exit animation at the route level: keeping the
 * previous tree mounted while the next enters left two fixed z-120
 * headers (home + playground) stacked during the crossfade.
 *
 * Opacity-only — no transform/filter — so `position: fixed` chrome stays
 * viewport-anchored and does not detach into a containing block.
 */
const PageEnter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.28, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

/**
 * Suspense is per-route so a lazy suspend cannot tear down the router shell.
 * Chunk resolves → page paints immediately inside PageEnter (no stuck
 * opacity-0 from a competing exit animation).
 */
const LazyPage: React.FC<{ pathname: string; children: React.ReactNode }> = ({
  pathname,
  children,
}) => (
  <RouteErrorBoundary pathname={pathname}>
    <Suspense fallback={<AiRouteLoader pathname={pathname} />}>{children}</Suspense>
  </RouteErrorBoundary>
);

const AppRoutes: React.FC = () => {
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
    <Routes>
      <Route
        path="/"
        element={
          <PageEnter>
            <HomePage />
          </PageEnter>
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
            <PageEnter>
              <OsPlaygroundPage />
            </PageEnter>
          </LazyPage>
        }
      />
      <Route path="/os" element={<Navigate to="/ai" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeVariables />
      <ScrollToTop />
      <AppRoutes />
    </Provider>
  );
}

export default App;
