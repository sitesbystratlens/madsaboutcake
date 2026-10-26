
/* Mads About Cake: first-release preview.
   Important: Pexels photos below are editorial placeholders, NOT Mads About Cake products.
   Replace with studio-approved photography before public launch. */
const CONFIG = {
  instagram: 'https://ig.me/m/madsaboutcake',
  instagramProfile: 'https://www.instagram.com/madsaboutcake/',
  formEndpoint: '', // Optional Formspree-compatible endpoint: https://formspree.io/f/...
};
const pexels = (id, width=960) => 'https://images.pexels.com/photos/'+id+'/pexels-photo-'+id+'.jpeg?auto=compress&cs=tinysrgb&w='+width;
const GALLERY = [
  {id:'rose-piping',title:'Rose piping',category:'Vintage',style:'vintage',image:pexels(29192489),alt:'Sample pink and white cake with detailed buttercream piping'},
  {id:'ribbon-romance',title:'Ribbon romance',category:'Florals',style:'floral',image:pexels(33100289),alt:'Sample floral cake with pink ribbons'},
  {id:'pink-occasion',title:'Pink occasion',category:'Celebrations',style:'celebration',image:pexels(18140854),alt:'Sample elegant pink floral birthday cake'},
  {id:'chapter-cake',title:'Chapter cake',category:'Statement',style:'statement',image:pexels(23358438),alt:'Sample pink birthday cake with a chapter message'},
  {id:'soft-florals',title:'Soft florals',category:'Florals',style:'floral',image:pexels(33932383),alt:'Sample pink and gold floral celebration cake'},
  {id:'party-pink',title:'Party in pink',category:'Celebrations',style:'celebration',image:pexels(18210554),alt:'Sample bright pink birthday cake with flower decoration'},
  {id:'pink-on-pink',title:'Pink on pink',category:'Statement',style:'statement',image:pexels(7180252),alt:'Sample pink cake with playful decorations'},
  {id:'sprinkle-moment',title:'Sprinkle moment',category:'Vintage',style:'vintage',image:pexels(9405268),alt:'Sample birthday cake with pink frosting and decorations'},
  {id:'bow-detail',title:'All tied up',category:'Statement',style:'statement',image:pexels(33100289),alt:'Sample contemporary cake with floral decoration and ribbon'},
];
const escapeHtml = s=>String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function initNavigation(){
 const toggle=document.querySelector('.nav-toggle'), nav=document.querySelector('.nav-list');
 if(!toggle||!nav)return;
 toggle.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Close ✕':'Menu ☰';});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu ☰';}});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu ☰';}));
}
function enquiryUrl(style=''){return '/enquire/?type=cake'+(style?'&style='+encodeURIComponent(style):'');}
function galleryCard(c){
 return '<article class="gallery-card" data-category="'+escapeHtml(c.style)+'"><a class="gallery-photo" href="'+enquiryUrl(c.title)+'" aria-label="Enquire about a cake inspired by '+escapeHtml(c.title)+'"><img loading="lazy" decoding="async" src="'+escapeHtml(c.image)+'" alt="'+escapeHtml(c.alt)+'"></a><div class="gallery-info"><div><small>'+escapeHtml(c.category)+'</small><h3>'+escapeHtml(c.title)+'</h3></div><a href="'+enquiryUrl(c.title)+'">Enquire ↗</a></div></article>';
}
function initGallery(){
 const root=document.querySelector('[data-gallery]');if(!root)return;
 const count=root.dataset.count?Number(root.dataset.count):GALLERY.length;
 root.innerHTML=GALLERY.slice(0,count).map(galleryCard).join('');
 const filters=document.querySelectorAll('[data-filter]');
 const preferred=(new URLSearchParams(window.location.search).get('style')||'').toLowerCase();
 filters.forEach(b=>b.addEventListener('click',()=>{
  const filter=b.dataset.filter;
  filters.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  root.querySelectorAll('.gallery-card').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter;});
  const live=document.getElementById('gallery-count');if(live)live.textContent=(filter==='all'?GALLERY.slice(0,count).length:GALLERY.slice(0,count).filter(x=>x.style===filter).length)+' designs shown';
 }));
 const matching=[...filters].find(b=>b.dataset.filter===preferred);
 if(matching)matching.click();
}
function initEnquiry(){
 const form=document.getElementById('enquiry-form');if(!form)return;
 const params=new URLSearchParams(window.location.search);
 const mode=params.get('type')==='workshop'?'workshop':'cake';
 const modeInput=form.querySelector('input[name="enquiryType"][value="'+mode+'"]');
 if(modeInput)modeInput.checked=true;
 const style=params.get('style'); if(style&&form.elements.styleReference)form.elements.styleReference.value=style.slice(0,160);
 const dateField=form.elements.eventDate;
 if(dateField){const date=new Date();const local=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().split('T')[0];dateField.min=local;}
 const message=document.getElementById('form-status'),backup=document.querySelector('.copy-backup');
 function updateMode(){
  const type=form.querySelector('input[name="enquiryType"]:checked')?.value||'cake';
  form.querySelectorAll('[data-mode]').forEach(el=>{el.hidden=el.dataset.mode!==type;el.querySelectorAll('input,select,textarea').forEach(input=>{input.disabled=el.hidden;});});
  const btn=form.querySelector('[type="submit"]');if(btn)btn.textContent=CONFIG.formEndpoint?'Send enquiry →':'Prepare Instagram enquiry →';
  message.hidden=true; if(backup)backup.classList.remove('is-visible');
 }
 form.querySelectorAll('input[name="enquiryType"]').forEach(r=>r.addEventListener('change',updateMode));
 updateMode();
 form.addEventListener('submit',async e=>{
  e.preventDefault();message.hidden=false;message.textContent='';
  if(!form.reportValidity())return;
  const data=Object.fromEntries(new FormData(form).entries());
  data.subject=data.enquiryType==='workshop'?'Decorate & Sip enquiry':'Custom cake enquiry';
  data.source='Mads About Cake concept website';
  const submit=form.querySelector('[type="submit"]');
  if(CONFIG.formEndpoint){
   submit.disabled=true;submit.textContent='Sending…';
   try{
    const response=await fetch(CONFIG.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)});
    if(!response.ok)throw new Error('Submission failed');
    form.reset();updateMode();message.hidden=false;message.textContent='Thank you — your enquiry has been sent. We will be in touch after reviewing your request.';
   }catch(err){message.hidden=false;message.textContent='Your enquiry could not be sent. Please reach out via Instagram instead: @madsaboutcake.';}
   finally{submit.disabled=false;submit.textContent='Send enquiry →';}
   return;
  }
  const content=Object.entries(data).filter(([key])=>!['source','consent'].includes(key)).map(([key,value])=>key.replace(/([A-Z])/g,' $1').replace(/^./,m=>m.toUpperCase())+': '+value).join('\n');
  const text='Hi Mads! I would love to enquire.\n\n'+content+'\n\nThank you!';
  const preview=document.getElementById('prepared-enquiry');
  if(preview)preview.value=text;
  if(backup)backup.classList.add('is-visible');
  if(navigator.clipboard&&window.isSecureContext){
   try{await navigator.clipboard.writeText(text);message.textContent='Enquiry copied. Tap “Open Instagram DMs”, paste your message and press send to complete the enquiry.';}
   catch(err){message.textContent='Your message is ready below. Copy it, then open Instagram DMs and press send.';}
  }else{message.textContent='Your message is ready below. Copy it, then open Instagram DMs and press send.';}
  if(backup)backup.scrollIntoView({behavior:'smooth',block:'nearest'});
 });
 const copy=document.getElementById('copy-enquiry');
 if(copy)copy.addEventListener('click',async()=>{const field=document.getElementById('prepared-enquiry');if(!field)return;field.select();try{await navigator.clipboard.writeText(field.value);copy.textContent='Copied ✓';}catch(err){document.execCommand('copy');copy.textContent='Selected — copy text';}});
}
document.addEventListener('DOMContentLoaded',()=>{initNavigation();initGallery();initEnquiry();});
