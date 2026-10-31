import { HAT_LIST } from '../data/hats';
import { OPS_PATH } from './ops/copy';
import { PRIVACY_PATH } from './privacyCopy';
import { PLAYGROUND_PATH, THREE_D_PATH } from './routeMeta';

/** Public pages with their own URL. `/os` redirects to `/ai` and is not listed. */
export const SITEMAP_PATHS = [
  '/',
  ...HAT_LIST.map((hat) => hat.path),
  THREE_D_PATH,
  PLAYGROUND_PATH,
  OPS_PATH,
  PRIVACY_PATH,
] as const;
