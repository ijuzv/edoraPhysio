export function siteOrigin(){try{const u=new URL(process.env.SITE_URL);return u.protocol==='https:'?u.origin:''}catch{return ''}}
export const privatePaths=['/practitioner/','/feedback/','/privacy/','/terms/'];
