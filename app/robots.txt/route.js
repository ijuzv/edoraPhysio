import { siteOrigin } from '../../src/metadata.js';
export const dynamic='force-dynamic';
export function GET(){const origin=siteOrigin();return new Response(process.env.PUBLIC_INDEXING==='true'&&origin?'User-agent: *\nAllow: /\nDisallow: /practitioner/\nDisallow: /api/\nDisallow: /feedback/\nSitemap: '+origin+'/sitemap.xml\n':'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain'}})}
