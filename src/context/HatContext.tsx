import React from 'react';
import type { HatConfig } from '../data/hats';
import { HatContext } from './hat-context';

export const HatProvider: React.FC<{ hat: HatConfig | null; children: React.ReactNode }> = ({
  hat,
  children,
}) => <HatContext.Provider value={hat}>{children}</HatContext.Provider>;
