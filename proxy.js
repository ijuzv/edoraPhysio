import { NextResponse } from 'next/server';
export function proxy(request){
 const nonce=Buffer.from(crypto.randomUUID()).toString('base64');
 const csp="default-src 'self'; script-src 'self' 'nonce-"+nonce+"'"+(process.env.NODE_ENV==='development'?" 'unsafe-eval'":"")+"; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-src https://maps.google.com; frame-ancestors 'none'; form-action 'self'; base-uri 'self'";
 const headers=new Headers(request.headers);headers.set('Content-Security-Policy',csp);
 const response=NextResponse.next({request:{headers}});
 response.headers.set('Content-Security-Policy',csp);
 response.headers.set('X-Content-Type-Options','nosniff');
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 response.headers.set('X-Frame-Options','DENY');
 return response;
}
export const config={matcher:['/((?!_next/static|_next/image|assets/).*)']};
