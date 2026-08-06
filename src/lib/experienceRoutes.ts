/** Shared dynamic imports for the experience routes (Games + 3D). */
export const threeDImport = () => import('../pages/ThreeDPortfolioPage');
export const playgroundImport = () => import('../pages/OsPlaygroundPage');

/** Warm the Games chunk eagerly; 3D is ~1.3MB so it only prefetches on intent (hover/focus). */
export const prefetchExperienceRoutes = () => {
  void playgroundImport();
  void threeDImport();
};

export const prefetchPlaygroundRoute = () => {
  void playgroundImport();
};

export const prefetchThreeDRoute = () => {
  void threeDImport();
};
