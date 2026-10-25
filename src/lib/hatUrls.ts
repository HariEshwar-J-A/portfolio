/** File Netlify should serve for a hat path. A directory index would 301 to the trailing slash. */
export const hatHtmlName = (path: string): string => {
  const slug = path.startsWith('/') ? path.slice(1) : path;
  if (!slug || slug.endsWith('/') || slug.includes('/')) {
    throw new Error(`hat path must be one segment without a trailing slash: ${path}`);
  }
  return `${slug}.html`;
};

/**
 * Keep the URL the app already uses.
 * `/full-stack/` 301s to `/full-stack`, which rewrites to `full-stack.html`.
 */
export const hatRedirectRules = (paths: readonly string[]): string =>
  paths
    .map((path) => `${path}/  ${path}  301\n${path}  /${hatHtmlName(path)}  200`)
    .join('\n');
