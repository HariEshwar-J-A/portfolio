/** Canonical URLs for pages we prerender. Home keeps its trailing slash. */
export const sitemapXml = (origin: string, paths: readonly string[]): string => {
  const urls = paths
    .map((path) => {
      const loc = path === '/' ? `${origin}/` : `${origin}${path}`;
      return `  <url><loc>${loc}</loc></url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};
