import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { workspaceHtml } from './workspace.js';
const times=['7:00 AM–10:00 AM','10:00 AM–1:00 PM','1:00 PM–4:00 PM','4:00 PM–7:30 PM'];
const digest=value=>createHash('sha256').update(value).digest();
const clean=value=>typeof value==='string'?value.trim():'';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date());
const xml=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

export function validateBooking(input){
  const data={name:clean(input.name),age:Number(input.age),phone:clean(input.phone),location:clean(input.location),type:input.type,date:input.date,time:input.time,consent:input.consent};
  if(data.name.length<2||data.name.length>100)return {error:'Please enter your full name (2–100 characters).'};
  if(!Number.isInteger(data.age)||data.age<1||data.age>120)return {error:'Please enter an age between 1 and 120.'};
  const digits=data.phone.replace(/\D/g,'');
  if(!/^\+?[\d\s()-]{8,20}$/.test(data.phone)||digits.length<8||digits.length>15)return {error:'Please enter a valid contact number.'};
  if(data.location.length<2||data.location.length>120)return {error:'Please enter your locality or city.'};
  if(!['home','online'].includes(data.type))return {error:'Please choose a home visit or online consultation.'};
  if(typeof data.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(data.date))return {error:'Please choose a valid date.'};
  const parsed=new Date(data.date+'T12:00:00Z');
  if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==data.date||data.date<today()||data.date>String(Number(today().slice(0,4))+1)+today().slice(4))return {error:'Please choose a date within the next year.'};
  if(parsed.getUTCDay()===0)return {error:'Please choose Monday to Saturday. We are closed on Sundays.'};
  if(!times.includes(data.time))return {error:'Please choose an available time window.'};
  if(data.consent!==true)return {error:'Please agree to the privacy policy and terms before continuing.'};
  return {data};
}
function validateFeedback(input){
  const rating=Number(input.rating),message=clean(input.message);
  if(!Number.isInteger(rating)||rating<1||rating>5)return {error:'Please choose a rating.'};
  if(message.length<5||message.length>2000)return {error:'Please enter feedback between 5 and 2,000 characters.'};
  if(input.consent!==true)return {error:'Please consent to sharing this feedback.'};
  return {data:{rating,message,consent:true}};
}
async function readJson(req){
  if(!req.headers.get('content-type')?.startsWith('application/json'))throw {status:415,message:'Please send a JSON request.'};
  let bytes=0;const chunks=[];
  for await(const chunk of req.body ?? []){bytes+=chunk.length;if(bytes>16384)throw {status:413,message:'This request is too large.'};chunks.push(chunk)}
  try{const value=JSON.parse(Buffer.concat(chunks).toString());if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value}catch{throw {status:400,message:'Please check the request and try again.'}}
}
export function createApi(options={}){
  const cfg={trustProxy:process.env.TRUST_PROXY==='true',enabled:process.env.BOOKING_ENABLED==='true',webhook:process.env.NOTIFICATION_WEBHOOK_URL||'',webhookToken:process.env.NOTIFICATION_WEBHOOK_TOKEN||'',key:process.env.PRACTITIONER_KEY||'',siteUrl:process.env.SITE_URL||'',indexing:process.env.PUBLIC_INDEXING==='true',fetch:globalThis.fetch,...options};
  let siteUrl='';try{const u=new URL(cfg.siteUrl);if(u.protocol==='https:')siteUrl=u.origin}catch{}
  const sessions=new Map(),limits=new Map(),requests=new Map();
  const sweep=()=>{const now=Date.now();for(const [k,v] of sessions)if(v.expires<now)sessions.delete(k);for(const [k,v] of limits)if(v.expires<now)limits.delete(k);for(const [k,v] of requests)if(v.expires<now)requests.delete(k)};
  const limited=(ip,kind,max)=>{const k=ip+':'+kind;let v=limits.get(k);if(!v){v={count:0,expires:Date.now()+15*60e3};limits.set(k,v)}return ++v.count>max};
  const session=req=>{const id=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('eudora_session='))?.slice(15);return sessions.get(id)};
  const cookie=(id,age)=>`eudora_session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${siteUrl?'; Secure':''}`;

  return async function handle(req){
    sweep();
    const responseHeaders=new Headers({'Cache-Control':'no-store'});
    const json=(status,payload)=>Response.json(payload,{status,headers:responseHeaders});
    try{
      const path=new URL(req.url).pathname.replace(/\/$/,'');
      if(path.startsWith('/api/')){
        
        const origin=req.headers.get('origin');
        const localOrigin=new URL(req.url).protocol+'//'+(req.headers.get('host')||new URL(req.url).host);
        if(req.method!=='GET'&&origin&&origin!==(siteUrl||localOrigin))return json(403,{error:'This request is not allowed.'});
        // Trust forwarding headers only behind a proxy that overwrites them.
        const ip=cfg.trustProxy?(req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown'):'local';
        if(path==='/api/practitioner/login'&&req.method==='POST'){
          if(limited(ip,'login',10))return json(429,{error:'Too many attempts. Please try again in 15 minutes.'});
          if(cfg.key.length<24)return json(503,{error:'Practitioner access has not been configured yet.'});
          const input=await readJson(req);
          if(typeof input.key!=='string'||!timingSafeEqual(digest(input.key),digest(cfg.key)))return json(401,{error:'The access key was not recognised.'});
          const id=randomBytes(32).toString('hex');sessions.set(id,{csrf:randomBytes(24).toString('hex'),expires:Date.now()+3600e3});
          responseHeaders.set('Set-Cookie',cookie(id,3600));return json(200,{ok:true});
        }
        if(path.startsWith('/api/practitioner/')){
          const s=session(req);if(!s)return json(401,{error:'Please sign in to the practitioner workspace.'});
          if(path==='/api/practitioner/workspace'&&req.method==='GET')return json(200,{html:workspaceHtml,csrf:s.csrf});
          if(path==='/api/practitioner/logout'&&req.method==='POST'){
            if(req.headers.get('x-csrf-token')!==s.csrf)return json(403,{error:'Please refresh and try again.'});
            for(const [id,value]of sessions)if(value===s)sessions.delete(id);
            responseHeaders.set('Set-Cookie',cookie('',0));return json(200,{ok:true});
          }
          return json(404,{error:'Not found.'});
        }
        if((path==='/api/bookings'||path==='/api/feedback')&&req.method==='POST'){
          if(limited(ip,'submission',20))return json(429,{error:'Too many requests. Please try again later or contact us directly.'});
          const input=await readJson(req),validated=path==='/api/bookings'?validateBooking(input):validateFeedback(input);
          if(validated.error)return json(400,{error:validated.error});
          if(!cfg.enabled||!cfg.webhook.startsWith('https://'))return json(503,{code:'NOT_CONFIGURED',error:'Online requests are not available yet. Please contact us on WhatsApp or by phone.'});
          const key=req.headers.get('idempotency-key');
          if(typeof key!=='string'||!/^[\w-]{16,100}$/.test(key))return json(400,{error:'Please refresh the page and try again.'});
          const fingerprint=digest(JSON.stringify(validated.data)).toString('hex'),keyId=path+':'+key;
          const existing=requests.get(keyId);
          if(existing&&existing.fingerprint!==fingerprint)return json(409,{error:'The request has changed. Please try submitting it again.'});
          if(existing){const result=await existing.promise;return json(result.status,result.body)}
          const promise=(async()=>{
            try{
              const reply=await cfg.fetch(cfg.webhook,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','Idempotency-Key':key,...(cfg.webhookToken?{Authorization:`Bearer ${cfg.webhookToken}`}:{})},body:JSON.stringify({event:path==='/api/bookings'?'consultation.requested':'feedback.received',id:key,receivedAt:new Date().toISOString(),data:validated.data}),signal:AbortSignal.timeout(10000)});
              if(!reply.ok)throw Error('Delivery failed');
              return {status:200,body:{ok:true,requestId:key}};
            }catch{return {status:502,body:{error:'We couldn’t confirm delivery. Please retry or contact us directly.'}}}
          })();
          requests.set(keyId,{fingerprint,promise,expires:Date.now()+24*3600e3});
          const result=await promise;if(result.status!==200)requests.delete(keyId);return json(result.status,result.body);
        }
      }
      return json(404,{error:'Not found.'});
    }catch(error){return json(error.status||500,{error:error.status?error.message:'Something went wrong. Please try again.'})}
  };
}
export const handleApi=createApi();
