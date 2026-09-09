import { siteOrigin } from '@/src/metadata';

export const dynamic = 'force-dynamic';

export function GET(): Response {
  const origin = siteOrigin();

  const content =
    process.env.PUBLIC_INDEXING === 'true' && origin
      ? `User-agent: *\nAllow: /\nDisallow: /practitioner/\nDisallow: /api/\nDisallow: /feedback/\nSitemap: ${origin}/sitemap.xml\n`
      : `User-agent: *\nDisallow: /\n`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
