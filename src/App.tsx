import React, { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { store } from './store/store';
import HomePage from './pages/HomePage';

const ThreeDPortfolioPage = lazy(() => import('./pages/ThreeDPortfolioPage'));

function App() {
  return (
    <Provider store={store}>
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
            Loading experience...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/3d" element={<ThreeDPortfolioPage />} />
        </Routes>
      </Suspense>
    </Provider>
  );
}

export default App;