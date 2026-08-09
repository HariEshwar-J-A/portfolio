/** Shared dynamic imports for the experience routes (Games + 3D). */

type ModuleDefault<T> = { default: T };

const RELOAD_KEY = 'hari-chunk-reload';

/**
 * Vite emits hashed chunk URLs. After a deploy, a tab still holding an old
 * main bundle will request deleted files and get a failed dynamic import.
 * Retry once via full reload so the browser picks up the new index.html.
 */
export async function importWithDeployRecovery<T>(
  factory: () => Promise<ModuleDefault<T>>
): Promise<ModuleDefault<T>> {
  try {
    const mod = await factory();
    try {
      sessionStorage.removeItem(RELOAD_KEY);
    } catch {
      /* ignore */
    }
    return mod;
  } catch (error) {
    let alreadyReloaded = false;
    try {
      alreadyReloaded = sessionStorage.getItem(RELOAD_KEY) === '1';
    } catch {
      /* ignore */
    }
    if (!alreadyReloaded && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(RELOAD_KEY, '1');
      } catch {
        /* ignore */
      }
      window.location.reload();
      // Stay pending until the reload tears the page down.
      return new Promise(() => undefined);
    }
    throw error;
  }
}

export const threeDImport = () =>
  importWithDeployRecovery(() => import('../pages/ThreeDPortfolioPage'));

export const playgroundImport = () =>
  importWithDeployRecovery(() => import('../pages/OsPlaygroundPage'));

/** Warm the Games chunk eagerly; 3D is ~1.3MB so it only prefetches on intent (hover/focus). */
export const prefetchExperienceRoutes = () => {
  void playgroundImport().catch(() => undefined);
  void threeDImport().catch(() => undefined);
};

export const prefetchPlaygroundRoute = () => {
  void playgroundImport().catch(() => undefined);
};

export const prefetchThreeDRoute = () => {
  void threeDImport().catch(() => undefined);
};
