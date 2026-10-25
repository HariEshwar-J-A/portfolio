import React, { Suspense, lazy, useEffect } from 'react';
import { Provider } from 'react-redux';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { store } from './store/store';
import HomePage from './pages/HomePage';
import { HAT_LIST } from './data/hats';
import { HatProvider } from './context/HatContext';
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
 * Suspense is per-route so a lazy suspend cannot tear down the router shell.
 * The route fade uses AnimatePresence mode="wait": the previous tree
 * finishes its opacity exit before the next mounts, so two fixed z-120
 * headers never stack. Opacity only — no transform or filter — so
 * position:fixed chrome stays viewport-anchored.
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
    <AnimatePresence mode="wait">
      <m.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {/* Inner presence keeps header layoutId (and other motion nodes)
            from registering on this exit. Without it, mode="wait" never
            finishes and the next route stays unmounted. */}
        <AnimatePresence initial={false}>
          <div key="page">
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          {HAT_LIST.map((hat) => (
            <Route
              key={hat.id}
              path={hat.path}
              element={
                <HatProvider hat={hat}>
                  <HomePage />
                </HatProvider>
              }
            />
          ))}
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
          </div>
        </AnimatePresence>
      </m.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Provider store={store}>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domAnimation} strict={false}>
          <ThemeVariables />
          <ScrollToTop />
          <AppRoutes />
        </LazyMotion>
      </MotionConfig>
    </Provider>
  );
}

export default App;
