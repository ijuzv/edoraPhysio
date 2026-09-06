'use client';
import { useEffect } from 'react';
export default function Interactions(){useEffect(()=>{
 const controller=new AbortController();
 const listen=(target,type,handler,options={})=>target?.addEventListener(type,handler,{...options,signal:controller.signal});
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
listen(menu,'click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
listen(document,'keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.click();menu.focus()}});
nav?.querySelectorAll('a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page')});
const header=document.querySelector('.site-header');
listen(window,'scroll',()=>header?.classList.toggle('scrolled',scrollY>10),{passive:true});
const booking=document.querySelector('#booking-form');
const status=(form,message,error=false)=>{const el=form.querySelector('.form-status');el.textContent=message;el.classList.toggle('error',error);el.focus()};
const requestKeys=new WeakMap();
async function submitForm(form,path,data){
  let state=requestKeys.get(form);const fingerprint=JSON.stringify(data);
  if(!state||state.fingerprint!==fingerprint){state={fingerprint,key:crypto.randomUUID()};requestKeys.set(form,state)}
  const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':state.key},body:JSON.stringify(data)});
  let result;try{result=await response.json()}catch{throw new Error('We couldn’t complete this request. Please try again or contact us directly.')}
  if(!response.ok){const err=new Error(result.error||'Please try again.');err.code=result.code;throw err}return result;
}
if(booking){
  const date=booking.elements.date;date.min=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
  if(new URLSearchParams(location.search).get('type')==='online')booking.elements.type.value='online';
  listen(date,'input',()=>{date.setCustomValidity(date.value&&new Date(date.value+'T12:00:00+05:30').getUTCDay()===0?'Please choose Monday to Saturday.':'')});
  listen(booking,'submit',async e=>{
    e.preventDefault();if(!booking.reportValidity())return;
    const data=Object.fromEntries(new FormData(booking));data.consent=booking.elements.consent.checked;
    if(!/^\+?[\d\s()-]{8,20}$/.test(data.phone)||data.phone.replace(/\D/g,'').length<8){status(booking,'Please enter a valid contact number, including the country code if outside India.',true);booking.elements.phone.focus();return}
    const button=booking.querySelector('button[type=submit]');button.disabled=true;
    booking.querySelector('.request-fallback').hidden=true;
    try{await submitForm(booking,'/api/bookings',data);status(booking,'Thank you. Your consultation request has been received. We’ll contact you to discuss availability; your appointment is not yet confirmed.');booking.reset();requestKeys.delete(booking)}
    catch(error){status(booking,error.message,true);const fallback=booking.querySelector('.request-fallback');fallback.hidden=false;const message=`Hello Eudora Movement House, I would like to request a consultation.\nName: ${data.name}\nAge: ${data.age}\nPhone: ${data.phone}\nLocation: ${data.location}\nConsultation: ${data.type==='online'?'Online':'Home visit'}\nPreferred date: ${data.date}\nPreferred time: ${data.time} IST\nI understand the appointment will be confirmed separately.`;booking.querySelector('#whatsapp-request').href='https://wa.me/917418158876?text='+encodeURIComponent(message)}
    finally{button.disabled=false}
  });
}
const feedback=document.querySelector('#feedback-form');
listen(feedback,'submit',async e=>{e.preventDefault();if(!feedback.reportValidity())return;const button=feedback.querySelector('button');button.disabled=true;try{await submitForm(feedback,'/api/feedback',{...Object.fromEntries(new FormData(feedback)),consent:feedback.elements.consent.checked});status(feedback,'Thank you for sharing your feedback. It has been received privately.');feedback.reset();requestKeys.delete(feedback)}catch(error){status(feedback,error.message,true)}finally{button.disabled=false}});

const login=document.querySelector('#login-form');
let csrf='';
async function openWorkspace(){const r=await fetch('/api/practitioner/workspace',{signal:controller.signal});if(!r.ok)return false;const data=await r.json();if(controller.signal.aborted)return false;csrf=data.csrf;document.querySelector('#practitioner-login').hidden=true;const container=document.querySelector('#practitioner-workspace');container.hidden=false;container.innerHTML=data.html;setupWorkspace(container);return true}
if(login){openWorkspace().catch(()=>{});listen(login,'submit',async e=>{e.preventDefault();const button=login.querySelector('button');button.disabled=true;try{const r=await fetch('/api/practitioner/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:login.elements.key.value})});const data=await r.json();if(!r.ok)throw Error(data.error);login.reset();await openWorkspace()}catch(error){status(login,error.message,true)}finally{button.disabled=false}})}
function setupWorkspace(container){
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const chart=container.querySelector('.chart-preview');const form=container.querySelector('#tool-form');
  let mode='exercise';
  const render=()=>{
    const data=Object.fromEntries(new FormData(form));const chosen=[...form.querySelectorAll('[name=exercise]:checked')].map(x=>x.value);
    chart.innerHTML=`<div class="brand"><img src="/assets/eduro-logo.png" alt="Eudora Movement House"></div><p class="eyebrow">${mode==='exercise'?'Your movement plan':'Consultation summary'}</p><h2>${esc(data.patient||'Patient name')}</h2><p>${esc(data.date||'')} · Varshini Balamurugan, MPT, BPT</p>${mode==='exercise'?`<ol>${chosen.map(x=>`<li><h3>${esc(x)}</h3></li>`).join('')}</ol><h3>Individual instructions</h3><p style="white-space:pre-wrap">${esc(data.instructions||'Add the prescribed dosage, frequency and individual guidance before sharing.')}</p>`:`<dl><dt>Reason for consultation</dt><dd>${esc(data.reason||'—')}</dd><dt>Assessment / findings</dt><dd>${esc(data.findings||'—')}</dd><dt>Plan and advice</dt><dd>${esc(data.plan||'—')}</dd><dt>Follow-up</dt><dd>${esc(data.followup||'—')}</dd></dl>`}<p class="chart-footer">Prepared by your physiotherapist for your individual care.<br>Eudora Movement House · +91 74181 58876</p>`;
  };
  listen(form,'input',render);
  container.querySelectorAll('[role=tab]').forEach(tab=>listen(tab,'click',()=>{mode=tab.dataset.mode;container.querySelectorAll('[role=tab]').forEach(x=>x.setAttribute('aria-selected',String(x===tab)));container.querySelector('#exercise-fields').hidden=mode!=='exercise';container.querySelector('#summary-fields').hidden=mode!=='summary';render()}));
  listen(container.querySelector('.print-button'),'click',()=>{if(!form.elements.patient.value.trim()){form.elements.patient.focus();form.elements.patient.reportValidity();return}window.print()});
  listen(container.querySelector('.signout'),'click',async()=>{await fetch('/api/practitioner/logout',{method:'POST',headers:{'X-CSRF-Token':csrf}});location.reload()});
  render();
}

return ()=>controller.abort();
},[]);return null;}
