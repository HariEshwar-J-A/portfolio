import React from 'react';
import { useLocation } from 'react-router-dom';
import { HatProvider } from '../context/HatContext';
import { hatForPath } from '../lib/siteNav';
import HomePage from './HomePage';

/** Stays mounted across `/` and hat routes so the header does not remount. */
const PortfolioShell: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <HatProvider hat={hatForPath(pathname)}>
      <HomePage />
    </HatProvider>
  );
};

export default PortfolioShell;
