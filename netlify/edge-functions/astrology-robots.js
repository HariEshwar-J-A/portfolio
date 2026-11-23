// Netlify does not apply _headers to proxied responses, and a second
// X-Robots-Tag would still leave the upstream noindex in force.
// Replace that header with one indexable value. Leave every other header as the origin sent it.

export default async (_request, context) => {
  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("x-robots-tag", "all");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const config = { path: ["/astrology", "/astrology/*"] };
