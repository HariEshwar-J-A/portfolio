import { PROFILE_IMAGE_PATH, SITE_ORIGIN, type HatConfig } from '../data/hats';
import { OPS_DESCRIPTION, OPS_PATH, OPS_TITLE } from './ops/copy';

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
    setMeta('property', 'og:url', SITE_ORIGIN);
    setMeta('property', 'og:image', PROFILE_IMAGE_PATH);
    setMeta('name', 'twitter:title', DEFAULT_OG_TITLE);
    setMeta('name', 'twitter:description', DEFAULT_OG_DESCRIPTION);
    setMeta('name', 'twitter:image', PROFILE_IMAGE_PATH);
    setCanonical(`${SITE_ORIGIN}/`);
    return;
  }

  const url = `${SITE_ORIGIN}${hat.path}`;
  const image = `${SITE_ORIGIN}${PROFILE_IMAGE_PATH}`;
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

/** `/ops` uses the same no-slash canonical as the hat pages. */
export const applyOpsMeta = () => {
  const url = `${SITE_ORIGIN}${OPS_PATH}`;
  const image = `${SITE_ORIGIN}${PROFILE_IMAGE_PATH}`;
  document.title = OPS_TITLE;
  setMeta('name', 'description', OPS_DESCRIPTION);
  setMeta('property', 'og:title', OPS_TITLE);
  setMeta('property', 'og:description', OPS_DESCRIPTION);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', image);
  setMeta('name', 'twitter:title', OPS_TITLE);
  setMeta('name', 'twitter:description', OPS_DESCRIPTION);
  setMeta('name', 'twitter:image', image);
  setCanonical(url);
};
