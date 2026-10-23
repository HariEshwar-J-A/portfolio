import { createContext, useContext } from 'react';
import type { HatConfig } from '../data/hats';

export const HatContext = createContext<HatConfig | null>(null);

export const useHat = (): HatConfig | null => useContext(HatContext);
