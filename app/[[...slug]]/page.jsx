import parse from 'html-react-parser';
import { notFound } from 'next/navigation';
import { pages, cta } from '../../src/content.js';
import { siteOrigin, privatePaths } from '../../src/metadata.js';
export const dynamic='force-dynamic';
async function findPage(params){const {slug=[]}=await params;return pages.find(p=>p.path==='/'+(slug.length?slug.join('/')+'/':''))}
export async function generateMetadata({params}){
 const page=await findPage(params);if(!page)return {};
 const origin=siteOrigin(),isPrivate=privatePaths.includes(page.path),index=process.env.PUBLIC_INDEXING==='true'&&!!origin&&!isPrivate;
 return {title:page.title+' | Eudora Movement House',description:page.description,robots:{index,follow:index},alternates:origin&&!isPrivate?{canonical:origin+page.path}:undefined,openGraph:{title:page.title+' | Eudora Movement House',description:page.description,type:'website',...(origin&&!isPrivate?{url:origin+page.path,images:[origin+'/assets/eduro-logo.png']}:{})}};
}
export default async function Page({params}){const page=await findPage(params);if(!page)notFound();return <main id="main">{parse(page.body)}{page.ctaShow?parse(cta):null}</main>}
