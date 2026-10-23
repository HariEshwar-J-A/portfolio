import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HAT_LIST, PROFILE_IMAGE_PATH, SITE_ORIGIN } from '../src/data/hats.ts';

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

for (const hat of HAT_LIST) {
  const url = `${SITE_ORIGIN}${hat.path}`;
  let page = html;
  page = page.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(hat.seo.title)}</title>`);
  page = replaceMeta(page, 'name', 'description', hat.seo.description);
  page = replaceMeta(page, 'property', 'og:title', hat.seo.title);
  page = replaceMeta(page, 'property', 'og:description', hat.seo.description);
  page = replaceMeta(page, 'property', 'og:url', url);
  page = replaceMeta(page, 'property', 'og:image', image);
  page = replaceMeta(page, 'name', 'twitter:title', hat.seo.title);
  page = replaceMeta(page, 'name', 'twitter:description', hat.seo.description);
  page = replaceMeta(page, 'name', 'twitter:image', image);

  const canonical = `<link rel="canonical" href="${url}" />`;
  if (/<link rel="canonical" href="[^"]*"\s*\/?>/.test(page)) {
    page = page.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, canonical);
  } else {
    page = page.replace('</head>', `    ${canonical}\n  </head>`);
  }

  const directory = resolve(root, 'dist', hat.path.slice(1));
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, 'index.html'), page);
  console.log(`prerendered ${hat.path} -> dist${hat.path}/index.html`);
}
