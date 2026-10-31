import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HAT_LIST, PROFILE_IMAGE_PATH, SITE_ORIGIN } from '../src/data/hats.ts';
import { hatHtmlName, hatRedirectRules } from '../src/lib/hatUrls.ts';
import { OPS_DESCRIPTION, OPS_PATH, OPS_TITLE } from '../src/lib/ops/copy.ts';
import { PRIVACY_DESCRIPTION, PRIVACY_PATH, PRIVACY_TITLE } from '../src/lib/privacyCopy.ts';
import {
  PLAYGROUND_DESCRIPTION,
  PLAYGROUND_PATH,
  PLAYGROUND_TITLE,
  THREE_D_DESCRIPTION,
  THREE_D_PATH,
  THREE_D_TITLE,
} from '../src/lib/routeMeta.ts';
import { sitemapXml } from '../src/lib/sitemap.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distIndexPath = resolve(root, 'dist/index.html');
const html = readFileSync(distIndexPath, 'utf8');
const image = `${SITE_ORIGIN}${PROFILE_IMAGE_PATH}`;

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const replaceMeta = (source, attr, key, content) => {
  const pattern = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  if (!pattern.test(source)) {
    throw new Error(`dist/index.html is missing <meta ${attr}="${key}">`);
  }
  return source.replace(pattern, `$1${escapeHtml(content)}$2`);
};

const writePage = (path, title, description) => {
  const url = `${SITE_ORIGIN}${path}`;
  let page = html;
  page = page.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  page = replaceMeta(page, 'name', 'description', description);
  page = replaceMeta(page, 'property', 'og:title', title);
  page = replaceMeta(page, 'property', 'og:description', description);
  page = replaceMeta(page, 'property', 'og:url', url);
  page = replaceMeta(page, 'property', 'og:image', image);
  page = replaceMeta(page, 'name', 'twitter:title', title);
  page = replaceMeta(page, 'name', 'twitter:description', description);
  page = replaceMeta(page, 'name', 'twitter:image', image);

  const canonical = `<link rel="canonical" href="${url}" />`;
  if (/<link rel="canonical" href="[^"]*"\s*\/?>/.test(page)) {
    page = page.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, canonical);
  } else {
    page = page.replace('</head>', `    ${canonical}\n  </head>`);
  }

  const fileName = hatHtmlName(path);
  writeFileSync(resolve(root, 'dist', fileName), page);
  console.log(`prerendered ${path} -> dist/${fileName}`);
};

for (const hat of HAT_LIST) writePage(hat.path, hat.seo.title, hat.seo.description);
writePage(THREE_D_PATH, THREE_D_TITLE, THREE_D_DESCRIPTION);
writePage(PLAYGROUND_PATH, PLAYGROUND_TITLE, PLAYGROUND_DESCRIPTION);
writePage(OPS_PATH, OPS_TITLE, OPS_DESCRIPTION);
writePage(PRIVACY_PATH, PRIVACY_TITLE, PRIVACY_DESCRIPTION);

const sitemapPaths = ['/', ...HAT_LIST.map((hat) => hat.path), THREE_D_PATH, PLAYGROUND_PATH, OPS_PATH, PRIVACY_PATH];
writeFileSync(resolve(root, 'dist/sitemap.xml'), sitemapXml(SITE_ORIGIN, sitemapPaths));
console.log(`wrote sitemap.xml (${sitemapPaths.length} urls)`);

const redirectsPath = resolve(root, 'dist/_redirects');
const marker = '/* /index.html  200';
const redirects = readFileSync(redirectsPath, 'utf8');
if (!redirects.includes(marker)) {
  throw new Error('dist/_redirects is missing the SPA fallback');
}
const block = [
  '# Hat pages are dist/<id>.html, not a directory index.',
  '# A directory index makes Netlify Pretty URLs 301 the no-slash path to the slash form.',
  '# These rules keep the no-slash URL that canonical, og:url, and in-app links already use.',
  hatRedirectRules(sitemapPaths.filter((path) => path !== '/')),
  '',
].join('\n');
if (!redirects.includes(block)) {
  writeFileSync(redirectsPath, redirects.replace(marker, `${block}${marker}`));
}
