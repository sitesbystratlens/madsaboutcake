
/* Mads About Cake: first-release preview.
   Important: Pexels photos below are editorial placeholders, NOT Mads About Cake products.
   Replace with studio-approved photography before public launch. */
const CONFIG = {
  instagram: 'https://ig.me/m/madsaboutcake',
  instagramProfile: 'https://www.instagram.com/madsaboutcake/',
  // Preview mode: form details remain in the browser and are never submitted.
};

const PRODUCT_TYPES=['Cake','Cupcakes','Other Treats'];
const PUBLIC_OCCASIONS=['Birthdays','Weddings & engagements','Baby celebrations','Love & anniversaries'];
const OCCASIONS=[...PUBLIC_OCCASIONS,'Religious & Cultural','Graduations','Corporate & Events','Other Celebrations'];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeCover=s=>typeof s==='string'&&/^assets\/(?:cake-covers|creations|featured-25|gallery-30(?:/thumbs)?)\/[\w-]+\.(?:jpe?g|png|webp|avif)$/.test(s);
const imageOf=c=>safeCover(c.coverImage)?'/'+c.coverImage:'/assets/mads-logo.webp';
const slug=s=>String(s).toLowerCase().replace(/\s+/g,'-');
const matchesOccasion=(c,o)=>c.primaryOccasion===o||c.otherOccasions.includes(o);
function normalise(c){
 if(!c||typeof c.id!=='string'||!/^[a-z0-9-]+$/.test(c.id)||typeof c.title!=='string'||!PRODUCT_TYPES.includes(c.productType))return null;
 return {...c,title:c.title.slice(0,140),image:imageOf(c),thumbnail:safeCover(c.thumbnailImage)?'/'+c.thumbnailImage:imageOf(c),alt:typeof c.alt==='string'?c.alt.slice(0,180):'Cake',
  primaryOccasion:OCCASIONS.includes(c.primaryOccasion)?c.primaryOccasion:'',
  otherOccasions:Array.isArray(c.otherOccasions)?c.otherOccasions.filter(o=>OCCASIONS.includes(o)):[],
  styleTags:Array.isArray(c.styleTags)?c.styleTags.filter(t=>typeof t==='string'&&t.length<80):[]};
}
function enquiryUrl(c){
 const q=new URLSearchParams({type:c.productType==='Cupcakes'?'cupcakes':'cake',design:c.id});
 return '/enquire/?'+q.toString();
}
function cardHtml(c){
 const credit=c.photoCredit?'<p class="gallery-credit">'+esc(c.photoCredit)+'</p>':'';
 const url='/cakes/?design='+encodeURIComponent(c.id);
 return '<article class="gallery-card" data-id="'+esc(c.id)+'">'+
 '<a class="gallery-photo" href="'+url+'" aria-label="View '+esc(c.title)+' design"><img loading="lazy" decoding="async" src="'+esc(c.thumbnail)+'" alt="'+esc(c.alt)+'" width="480" height="600"><span class="gallery-photo__arrow" aria-hidden="true">↗</span></a>'+
 '<div class="gallery-info"><div><small>'+esc(c.productType+(c.primaryOccasion?' · '+c.primaryOccasion:''))+'</small><h3><a class="gallery-title-link" href="'+url+'">'+esc(c.title)+'</a></h3>'+credit+'</div></div></article>';
}
function showDesign(c,concept){
 const root=document.getElementById('design-detail'),browse=document.getElementById('browse-gallery'),hero=document.getElementById('gallery-hero');
 if(!root||!browse)return false;
 if(hero)hero.hidden=true; browse.hidden=true;root.hidden=false;
 const draft=concept||c.approvalStatus!=='Approved'||c.showOnWebsite!=='Yes';
 const meta=[['Product',c.productType]];
 if(c.primaryOccasion)meta.push(['Occasion',c.primaryOccasion]);
 if(c.shapeFormat)meta.push(['Format',c.shapeFormat]);
 if(!draft&&Number(c.servingsMin)>0)meta.push(['Serves from',c.servingsMin]);
 if(!draft&&Number(c.priceFrom)>0)meta.push(['Price from','A$'+Number(c.priceFrom).toLocaleString('en-AU')]);
 const originalPost=typeof c.instagramUrl==='string'&&/^https:\/\/www\.instagram\.com\/(?:p|reel)\/[\w-]+\/?$/.test(c.instagramUrl)?c.instagramUrl:'';
 const instagramLink=originalPost?
  '<a class="design-instagram-link" href="'+esc(originalPost)+'" target="_blank" rel="noopener noreferrer" aria-label="View original '+esc(c.title)+' post on Instagram (opens in new tab)" title="View original post on Instagram">'+
  '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none"></circle></svg></a>':'';
 root.innerHTML='<div><a class="detail-back" href="/cakes/">← Back to all creations</a><div class="design-detail-media"><img class="design-detail-image" src="'+esc(c.image)+'" alt="'+esc(c.alt)+'">'+instagramLink+'</div></div>'+
 '<div class="design-detail-copy"><span class="eyebrow">'+esc(c.productType)+'</span><h1>'+esc(c.title)+'</h1>'+
 '<p class="lede">'+esc(c.shortDescription||'See the design and share what you would like to personalise.')+'</p>'+
 '<dl class="design-meta">'+meta.map(x=>'<dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd>').join('')+'</dl>'+
 (c.photoCredit?'<p class="gallery-credit">'+esc(c.photoCredit)+'</p>':'')+
 '<p>Inspired by this design? Tell us your date, colour preferences, flavours and changes you have in mind.</p>'+
 '<a class="btn" href="'+esc(enquiryUrl(c))+'">Ask about this design →</a>'+
 '<p class="detail-hint">Availability, flavours and final details are confirmed when you contact us.</p></div>';
 return true;
}
function initGallery(records,concept){
 const root=document.querySelector('[data-gallery]');if(!root)return;
 const params=new URLSearchParams(location.search),id=params.get('design');
 if(id){const c=records.find(x=>x.id===id);if(c&&(!concept||c.demoVisible!==false)&&showDesign(c,concept))return;}
 const listed=concept?records.filter(c=>c.featured30===true):records;
 root.innerHTML=listed.map(cardHtml).join('');
 const buttons=[...document.querySelectorAll('[data-product]')],occasion=document.getElementById('occasion-filter');
 let product=['cake','cupcakes','other-treats'].includes(params.get('product'))?params.get('product'):'all';
 const used=new Set(listed.map(c=>slug(c.productType))),otherButton=buttons.find(b=>b.dataset.product==='other-treats');
 if(otherButton)otherButton.hidden=!used.has('other-treats');
 if(occasion){
  for(const o of PUBLIC_OCCASIONS.filter(o=>listed.some(c=>matchesOccasion(c,o)))){
   const opt=document.createElement('option');opt.value=o;opt.textContent=o;occasion.appendChild(opt);
  }
  if([...occasion.options].some(o=>o.value===params.get('occasion')))occasion.value=params.get('occasion');
 }
 function update(){
  let count=0;
  for(const card of root.querySelectorAll('.gallery-card')){
   const c=listed.find(x=>x.id===card.dataset.id);
   const visible=!!c&&(product==='all'||slug(c.productType)===product)&&(!occasion||occasion.value==='all'||matchesOccasion(c,occasion.value));
   card.hidden=!visible;if(visible)count++;
  }
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.product===product)));
  const counter=document.getElementById('gallery-count');if(counter)counter.textContent=count+' '+(count===1?'design':'designs')+' shown';
  const empty=document.getElementById('gallery-empty');if(empty)empty.hidden=count>0;
  const q=new URLSearchParams();
  if(product!=='all')q.set('product',product);
  if(occasion&&occasion.value!=='all')q.set('occasion',occasion.value);
  history.replaceState(null,'','/cakes/'+(q.toString()?'?'+q.toString():''));
 }
 for(const b of buttons)b.addEventListener('click',()=>{product=b.dataset.product;update()});
 if(occasion)occasion.addEventListener('change',update);
 update();
}
/* Approved website image slots are distinct from portfolio products. Each slot can
   reference an already-published cake or an independently cached website image. */
const WEBSITE_SLOTS=new Set([
 'home_hero_main','home_hero_accent','home_category_cakes','home_category_cupcakes',
 'home_category_other','home_workshop_feature','home_about_feature','cakes_bottom_feature',
 'about_main','about_detail_one','about_detail_two','workshop_main','workshop_secondary'
]);
const siteImagePath=s=>typeof s==='string'&&/^assets\/(?:site-images|cake-covers)\/[\w-]+\.(?:png|jpe?g|webp|avif)$/.test(s);
async function applyWebsiteImages(records){
 try{
  const r=await fetch('/site-images.json',{cache:'no-cache'});
  if(!r.ok)throw Error('No website image snapshot');
  const snapshot=await r.json();
  if(!Array.isArray(snapshot.images)||snapshot.images.length>40)throw Error('Invalid website image snapshot');
  const demo=snapshot.meta?.mode==='concept-preview';
  const byId=new Map(records.map(c=>[c.id,c]));
  const unique=new Set();
  for(const item of snapshot.images){
   if(!item||!WEBSITE_SLOTS.has(item.slotId)||unique.has(item.slotId))continue;
   unique.add(item.slotId);
   if(!(demo?item.demoVisible!==false:item.approvalStatus==='Approved'&&item.showOnWebsite==='Yes'))continue;
   const source=byId.get(item.sourceItemId);
   const selected=siteImagePath(item.imagePath)?'/'+item.imagePath:source?.image;
   if(!selected)continue;
   const target=document.querySelector('[data-image-slot="'+item.slotId+'"]');
   if(!target)continue;
   const focal=['center','top','bottom','left','right'].includes(item.focalPosition)?item.focalPosition:'center';
   const alt=typeof item.altText==='string'&&item.altText.trim()?item.altText.slice(0,200):source?.alt;
   if(target.tagName==='IMG'){target.src=selected;target.style.objectPosition=focal;if(alt)target.alt=alt;}
   else{
    const variable=target.dataset.cakeVariable||'--hero-image';
    target.style.setProperty(variable,'url("'+selected+'")');
    target.style.backgroundPosition=focal;
    if(alt)target.setAttribute('aria-label',alt);
   }
  }
 }catch(e){console.warn('Site image selections not applied:',e.message);}
}

async function initPortfolio(){
 let records=[],concept=true;
 try{
  const response=await fetch('/cakes.json',{cache:'no-cache'});
  if(!response.ok)throw Error('Catalogue unavailable');
  const data=await response.json();
  if(!Array.isArray(data.cakes)||data.cakes.length>650)throw Error('Invalid catalogue');
  concept=data.meta?.mode==='concept-preview';
  records=data.cakes.filter(c=>concept?c.demoVisible!==false:
     (c.approvalStatus==='Approved'&&c.showOnWebsite==='Yes'))
    .map(normalise).filter(Boolean)
    .sort((a,b)=>(Number(a.priority)||999)-(Number(b.priority)||999));
 }catch(e){console.warn('Gallery unavailable:',e.message)}
 if(concept){
  const ids=new Map(records.map(c=>[c.id,c]));
  document.querySelectorAll('img[data-cake-image]').forEach(img=>{
   const c=ids.get(img.dataset.cakeImage);
   if(c){img.src=c.image;img.alt=c.alt;}
  });
 }
 // Homepage and category hero imagery stays site-owned, not controlled by the Sheet.
 document.querySelectorAll('[data-product-card]').forEach(card=>{
  card.hidden=!records.some(c=>c.productType===card.dataset.productCard);
 });
 const occasionNav=document.querySelector('[data-home-occasions]');
 if(occasionNav)occasionNav.querySelectorAll('a').forEach(a=>{
  const occasion=new URL(a.href).searchParams.get('occasion');
  a.hidden=!records.some(c=>matchesOccasion(c,occasion));
 });


 initGallery(records,concept);
}
function initNavigation(){
 const toggle=document.querySelector('.nav-toggle'), nav=document.querySelector('.nav-list');
 if(!toggle||!nav)return;
 toggle.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Close ✕':'Menu ☰';});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu ☰';}});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu ☰';}));
}

/** Swap in WebP photographs curated from the public Instagram media archive when uploaded to the site.
 * Fallback stock images remain visible until that one-time GitHub asset upload.
 */
function initCuratedImageSwaps(){
 document.querySelectorAll('img[data-curated-src]').forEach(img=>{
  const local=img.dataset.curatedSrc;
  if(!/^\/assets\/creations\/[\w-]+\.webp$/.test(local))return;
  const probe=new Image();
  probe.decoding='async';
  probe.onload=()=>{img.src=local;};
  probe.src=local;
 });
}
document.addEventListener('error',event=>{
 const img=event.target;
 if(!(img instanceof HTMLImageElement)||img.dataset.fallbackApplied==='yes')return;
 img.dataset.fallbackApplied='yes';img.src='/assets/mads-logo.webp';
},true);

/** Studio availability banner, edited through assets/studio-notices.json. */

async function initStudioNotice(){
 const banner=document.querySelector('[data-studio-announcement]');if(!banner)return;
 banner.hidden=true;
 try{
  const response=await fetch('/assets/studio-notices.json',{cache:'no-cache'});
  if(!response.ok)return;
  const data=await response.json();
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Australia/Melbourne',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  const melbourneToday=parts.year+'-'+parts.month+'-'+parts.day;
  const expires=typeof data.expires==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(data.expires)?data.expires:'';
  if(data.show!==true||!expires||melbourneToday>expires||typeof data.message!=='string'||!data.message.trim())return;
  const message=banner.querySelector('[data-notice-text]');
  if(message)message.textContent=data.message.slice(0,240);
  banner.hidden=false;
 }catch(error){banner.hidden=true;}
}
async function getStudioFormEndpoint(){
 try{
  const res=await fetch('/assets/enquiry-settings.json',{cache:'no-cache'});
  if(!res.ok)return '';
  const config=await res.json(),endpoint=String(config.formspreeEndpoint||'').trim();
  return /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint)?endpoint:'';
 }catch(err){return '';}
}
async function loadDesignFromQuery(form,params){
 const design=params.get('design');
 if(!design||!/^ig-[a-z0-9-]+$/.test(design))return;
 try{
  const response=await fetch('/cakes.json',{cache:'no-cache'});
  if(!response.ok)return;
  const data=await response.json(),concept=data.meta?.mode==='concept-preview';
  const item=(data.cakes||[]).find(c=>c.id===design&&
    (concept?c.demoVisible!==false:c.approvalStatus==='Approved'&&c.showOnWebsite==='Yes'));
  if(!item)return;
  const ref=typeof item.instagramUrl==='string'&&/^https:\/\/www\.instagram\.com\/(?:p|reel)\/[\w-]+\/?$/.test(item.instagramUrl)?item.instagramUrl:'';
  if(form.elements.designId)form.elements.designId.value=item.id;
  if(form.elements.selectedDesign)form.elements.selectedDesign.value=item.title;
  if(form.elements.referenceLink)form.elements.referenceLink.value=ref;
  const message=form.elements.namedItem('message');
  if(message&&!message.value.trim())message.value="I'm interested in a design like your "+item.title+(ref?' ('+ref+')':'')+".\n\n";
 }catch(err){/* Invalid design leaves a blank, usable enquiry. */}
}
function initStudioEnquiryForms(){
 const forms=document.querySelectorAll('[data-studio-enquiry-form]');if(!forms.length)return;
 const endpointPromise=getStudioFormEndpoint();
 forms.forEach(form=>{
  const status=form.querySelector('[data-studio-enquiry-status]'),submit=form.querySelector('button[type="submit"]');
  const topic=form.elements.enquiryTopic,params=new URLSearchParams(location.search);
  const requested=params.get('type'),product=params.get('product');
  if(requested==='workshop'||requested==='decorate-and-sip')topic.value='decorate-and-sip';
  else if(requested==='other')topic.value='something-else';
  else if(product==='Cupcakes'||requested==='cupcakes')topic.value='cupcakes';
  else if(product==='Cake'||requested==='cake')topic.value='cake';
  if(form.elements.sourcePage)form.elements.sourcePage.value=location.pathname;
  const date=form.elements.eventDate;
  if(date){const today=new Date();date.min=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);}
  void loadDesignFromQuery(form,params);
  function setStatus(message,withInstagram=false){
   status.hidden=false;status.replaceChildren();
   status.append(document.createTextNode(message));
   if(withInstagram){
    const link=document.createElement('a');link.href='https://ig.me/m/madsaboutcake';link.target='_blank';link.rel='noopener noreferrer';
    link.textContent='message @madsaboutcake on Instagram';status.append(document.createTextNode(' '),link,document.createTextNode('.'));
   }
  }
  function updateTopic(){
   if(form.elements.category)form.elements.category.value=topic.selectedOptions[0]?.dataset.group||'';
  }
  topic.addEventListener('change',()=>{updateTopic();if(status)status.hidden=true;});updateTopic();
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   if(!form.checkValidity()){const invalid=form.querySelector(':invalid');if(invalid)invalid.focus();form.reportValidity();return;}
   if(!status||!submit)return;
   if(form.elements._gotcha?.value)return;
   const endpoint=await endpointPromise;
   if(!endpoint){setStatus("This is a preview, so the contact form isn't connected yet. Please",true);return;}
   submit.disabled=true;submit.textContent='Sending…';status.hidden=true;
   try{
    const payload=new FormData(form);
    payload.set('_subject','Website enquiry: '+String(topic.selectedOptions[0]?.textContent||'Cake')+' from '+String(payload.get('name')||'visitor'));
    const response=await fetch(endpoint,{method:'POST',body:payload,headers:{Accept:'application/json'}});
    if(!response.ok)throw Error('Submission failed');
    const firstName=String(payload.get('name')||'').trim().split(/\s+/)[0];
    form.reset();updateTopic();
    setStatus('Thanks'+(firstName?', '+firstName:'')+'. Your message has been received. We’ll reply by email.');
   }catch(error){setStatus("Sorry, that didn’t send. Please try again, or",true);}
   finally{submit.disabled=false;submit.textContent='Send message ↗';}
  });
 });
}
document.addEventListener('DOMContentLoaded',()=>{initNavigation();initCuratedImageSwaps();initPortfolio();initStudioNotice();initStudioEnquiryForms();});

