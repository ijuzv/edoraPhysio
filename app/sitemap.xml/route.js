import { pages } from '../../src/content.js';
import { siteOrigin, privatePaths } from '../../src/metadata.js';
export const dynamic='force-dynamic';
export function GET(){const origin=siteOrigin();if(!origin)return Response.json({error:'The production domain has not been configured.'},{status:503});return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.filter(p=>!privatePaths.includes(p.path)).map(p=>'<url><loc>'+origin+p.path+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml'}})}
