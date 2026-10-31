import { PROFILE_IMAGE_PATH, SITE_ORIGIN, type HatConfig } from '../data/hats';
import { OPS_DESCRIPTION, OPS_PATH, OPS_TITLE } from './ops/copy';
import { PRIVACY_DESCRIPTION, PRIVACY_PATH, PRIVACY_TITLE } from './privacyCopy';
import {
  PLAYGROUND_DESCRIPTION,
  PLAYGROUND_PATH,
  PLAYGROUND_TITLE,
  THREE_D_DESCRIPTION,
  THREE_D_PATH,
  THREE_D_TITLE,
} from './routeMeta';

export {
  PLAYGROUND_DESCRIPTION,
  PLAYGROUND_PATH,
  PLAYGROUND_TITLE,
  THREE_D_DESCRIPTION,
  THREE_D_PATH,
  THREE_D_TITLE,
};

/** Home canonical and og:url. Hat and `/ops` URLs stay slash-free. */
export const HOME_URL = `${SITE_ORIGIN}/`;
export const PROFILE_IMAGE_URL = `${SITE_ORIGIN}${PROFILE_IMAGE_PATH}`;

const DEFAULT_TITLE = 'Harieshwar J A | Senior Full-Stack Developer';
const DEFAULT_DESCRIPTION =
  'Harieshwar J A — Senior Full-Stack Developer. Interactive portfolio featuring InfoSentry (multi-agent AI), a 3D WebGL experience, and production work across React, Node.js, AI/LLM systems, and cloud.';
const DEFAULT_OG_TITLE = 'Harieshwar J A — Senior Full-Stack Developer';
const DEFAULT_OG_DESCRIPTION =
  'Interactive, gamified portfolio with a 3D experience — multi-agent AI, React/Node.js, and cloud. Featuring InfoSentry.';

const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const setCanonical = (href: string) => {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

/** Hat routes get their own title, description, and canonical. `/` keeps the static tags. */
export const applyPageMeta = (hat: HatConfig | null) => {
  if (!hat) {
    document.title = DEFAULT_TITLE;
    setMeta('name', 'description', DEFAULT_DESCRIPTION);
    setMeta('property', 'og:title', DEFAULT_OG_TITLE);
    setMeta('property', 'og:description', DEFAULT_OG_DESCRIPTION);
    setMeta('property', 'og:url', HOME_URL);
    setMeta('property', 'og:image', PROFILE_IMAGE_URL);
    setMeta('name', 'twitter:title', DEFAULT_OG_TITLE);
    setMeta('name', 'twitter:description', DEFAULT_OG_DESCRIPTION);
    setMeta('name', 'twitter:image', PROFILE_IMAGE_URL);
    setCanonical(HOME_URL);
    return;
  }

  const url = `${SITE_ORIGIN}${hat.path}`;
  const image = PROFILE_IMAGE_URL;
  document.title = hat.seo.title;
  setMeta('name', 'description', hat.seo.description);
  setMeta('property', 'og:title', hat.seo.title);
  setMeta('property', 'og:description', hat.seo.description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', image);
  setMeta('name', 'twitter:title', hat.seo.title);
  setMeta('name', 'twitter:description', hat.seo.description);
  setMeta('name', 'twitter:image', image);
  setCanonical(url);
};

const applyStandaloneMeta = (path: string, title: string, description: string) => {
  const url = `${SITE_ORIGIN}${path}`;
  const image = PROFILE_IMAGE_URL;
  document.title = title;
  setMeta('name', 'description', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', image);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);
  setCanonical(url);
};

/** `/ops` uses the same no-slash canonical as the hat pages. */
export const applyOpsMeta = () => applyStandaloneMeta(OPS_PATH, OPS_TITLE, OPS_DESCRIPTION);

/** `/privacy` uses the same no-slash canonical as the hat pages. */
export const applyPrivacyMeta = () => applyStandaloneMeta(PRIVACY_PATH, PRIVACY_TITLE, PRIVACY_DESCRIPTION);

export const applyThreeDMeta = () => applyStandaloneMeta(THREE_D_PATH, THREE_D_TITLE, THREE_D_DESCRIPTION);

export const applyPlaygroundMeta = () =>
  applyStandaloneMeta(PLAYGROUND_PATH, PLAYGROUND_TITLE, PLAYGROUND_DESCRIPTION);
