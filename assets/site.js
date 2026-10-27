
/* Mads About Cake: first-release preview.
   Important: Pexels photos below are editorial placeholders, NOT Mads About Cake products.
   Replace with studio-approved photography before public launch. */
const CONFIG = {
  instagram: 'https://ig.me/m/madsaboutcake',
  instagramProfile: 'https://www.instagram.com/madsaboutcake/',
  // Preview mode: form details remain in the browser and are never submitted.
};
const pexels = (id, width=960) => 'https://images.pexels.com/photos/'+id+'/pexels-photo-'+id+'.jpeg?auto=compress&cs=tinysrgb&w='+width;

const PRODUCT_TYPES=['Cake','Cupcakes','Other Treats'];
const OCCASIONS=['Birthdays','Weddings & Engagements','Baby Showers & Gender Reveals','Anniversaries','Religious & Cultural','Graduations','Corporate & Events','Other Celebrations'];
const fallback=[
 {id:'rose-piping',title:'Rose piping',productType:'Cake',primaryOccasion:'Birthdays',styleTags:['Vintage piping'],alt:'Rose-piped cake',previewImage:pexels(29192489)},
 {id:'cupcake-florals',title:'Floral cupcakes',productType:'Cupcakes',primaryOccasion:'Birthdays',styleTags:['Floral'],alt:'Floral cupcakes',previewImage:pexels(1055272)}
];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeCover=s=>typeof s==='string'&&/^assets\/(?:cake-covers|creations)\/[\w-]+\.(?:jpe?g|png|webp|avif)$/.test(s);
const safePreview=s=>typeof s==='string'&&/^https:\/\/images\.pexels\.com\/photos\/\d+\/pexels-photo-\d+\.jpeg(?:\?.*)?$/.test(s)?s:'';
const imageOf=c=>safeCover(c.coverImage)?'/'+c.coverImage:(safePreview(c.previewImage)||pexels(29192489));
const slug=s=>String(s).toLowerCase().replace(/\s+/g,'-');
const matchesOccasion=(c,o)=>c.primaryOccasion===o||c.otherOccasions.includes(o);
function normalise(c){
 if(!c||typeof c.id!=='string'||!/^[a-z0-9-]+$/.test(c.id)||typeof c.title!=='string'||!PRODUCT_TYPES.includes(c.productType))return null;
 return {...c,title:c.title.slice(0,140),image:imageOf(c),alt:typeof c.alt==='string'?c.alt.slice(0,180):'Cake',
  primaryOccasion:OCCASIONS.includes(c.primaryOccasion)?c.primaryOccasion:'',
  otherOccasions:Array.isArray(c.otherOccasions)?c.otherOccasions.filter(o=>OCCASIONS.includes(o)):[],
  styleTags:Array.isArray(c.styleTags)?c.styleTags.filter(t=>typeof t==='string'&&t.length<80):[]};
}
function enquiryUrl(c){
 const q=new URLSearchParams({type:'cake',product:c.productType,design:c.id,designTitle:c.title});
 if(c.primaryOccasion)q.set('occasion',c.primaryOccasion);
 if(typeof c.instagramUrl==='string'&&/^https:\/\/www\.instagram\.com\/(p|reel|tv)\/[\w-]+\/?$/.test(c.instagramUrl))q.set('reference',c.instagramUrl);
 return '/enquire/?'+q.toString();
}
function cardHtml(c){
 return '<article class="gallery-card" data-id="'+esc(c.id)+'">'+(c.badgeApproved===true&&['Popular','Best seller','New'].includes(c.displayBadge)?'<span class="gallery-card__feature">'+esc(c.displayBadge)+'</span>':c.featuredHome===true?'<span class="gallery-card__feature">Featured</span>':'')+'<a class="gallery-photo" href="/cakes/?design='+encodeURIComponent(c.id)+'"><img loading="lazy" decoding="async" src="'+esc(c.image)+'" data-fallback-src="'+esc(safePreview(c.previewImage)||pexels(c.productType==='Cupcakes'?1055272:29192489))+'" alt="'+esc(c.alt)+'"></a><div class="gallery-info"><div><small>'+esc(c.productType+(c.primaryOccasion?' · '+c.primaryOccasion:''))+'</small><h3>'+esc(c.title)+'</h3></div><a href="/cakes/?design='+encodeURIComponent(c.id)+'">View design ↗</a></div></article>';
}
function showDesign(c,concept){
 const root=document.getElementById('design-detail'),browse=document.getElementById('browse-gallery'),hero=document.getElementById('gallery-hero');
 if(!root||!browse)return false;
 if(hero)hero.hidden=true; browse.hidden=true;root.hidden=false;
 const draft=concept||c.approvalStatus!=='Approved'||c.showOnWebsite!=='Yes';
 const meta=[['Product',c.productType]];
 if(c.primaryOccasion)meta.push(['Occasion',c.primaryOccasion]);
 meta.push(['Style',c.styleTags.join(', ')||'Custom']);
 if(c.shapeFormat)meta.push(['Format',c.shapeFormat]);
 if(!draft&&Number(c.servingsMin)>0)meta.push(['Serves from',c.servingsMin]);
 if(!draft&&Number(c.priceFrom)>0)meta.push(['Price from','A$'+Number(c.priceFrom).toLocaleString('en-AU')]);
 root.innerHTML='<div><a class="detail-back" href="/cakes/">← Back to all creations</a><img class="design-detail-image" src="'+esc(c.image)+'" data-fallback-src="'+esc(safePreview(c.previewImage)||pexels(29192489))+'" alt="'+esc(c.alt)+'"></div>'+
 '<div class="design-detail-copy"><span class="eyebrow">'+esc(c.productType)+'</span><h1>'+esc(c.title)+'</h1>'+
 '<p class="lede">'+esc(c.shortDescription||'Explore the design and share what you would like to personalise.')+'</p>'+
 '<dl class="design-meta">'+meta.map(x=>'<dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd>').join('')+'</dl>'+
 '<p>Inspired by this design? Tell us your date, colour preferences, flavours and any changes you have in mind.</p>'+
 '<a class="btn" href="'+esc(enquiryUrl(c))+'">Enquire about this design →</a>'+
 '<p class="detail-hint">Availability, flavours and final details are confirmed on enquiry.</p></div>';
 return true;
}
function initGallery(records,concept){
 const root=document.querySelector('[data-gallery]');if(!root)return;
 const params=new URLSearchParams(location.search),id=params.get('design');
 if(id){const c=records.find(x=>x.id===id);if(c&&showDesign(c,concept))return;}
 root.innerHTML=records.map(cardHtml).join('');
 const buttons=[...document.querySelectorAll('[data-product]')];
 const occasion=document.getElementById('occasion-filter'),style=document.getElementById('style-filter');
 let product=['cake','cupcakes','other-treats'].includes(params.get('product'))?params.get('product'):'all';
 const used=new Set(records.map(c=>slug(c.productType)));
 const otherButton=buttons.find(b=>b.dataset.product==='other-treats');if(otherButton)otherButton.hidden=!used.has('other-treats');
 if(occasion){
  for(const o of OCCASIONS.filter(o=>records.some(c=>matchesOccasion(c,o)))){let opt=document.createElement('option');opt.value=o;opt.textContent=o;occasion.appendChild(opt);}
  if([...occasion.options].some(o=>o.value===params.get('occasion')))occasion.value=params.get('occasion');
 }
 if(style){
  const values=[...new Set(records.flatMap(c=>c.styleTags))].sort();
  for(const s of values){let opt=document.createElement('option');opt.value=s;opt.textContent=s;style.appendChild(opt);}
  if(values.includes(params.get('style')))style.value=params.get('style');
 }
 function update(){
  let count=0;
  for(const card of root.querySelectorAll('.gallery-card')){
   const c=records.find(x=>x.id===card.dataset.id);
   const visible=!!c&&(product==='all'||slug(c.productType)===product)&&
     (!occasion||occasion.value==='all'||matchesOccasion(c,occasion.value))&&
     (!style||style.value==='all'||c.styleTags.includes(style.value));
   card.hidden=!visible;if(visible)count++;
  }
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.product===product)));
  const counter=document.getElementById('gallery-count');if(counter)counter.textContent=count+' '+(count===1?'design':'designs')+' shown';
  const empty=document.getElementById('gallery-empty');if(empty)empty.hidden=count>0;
  const q=new URLSearchParams();
  if(product!=='all')q.set('product',product);
  if(occasion&&occasion.value!=='all')q.set('occasion',occasion.value);
  if(style&&style.value!=='all')q.set('style',style.value);
  history.replaceState(null,'','/cakes/'+(q.toString()?'?'+q.toString():''));
 }
 for(const b of buttons)b.addEventListener('click',()=>{product=b.dataset.product;update()});
 if(occasion)occasion.addEventListener('change',update);
 if(style)style.addEventListener('change',update);
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
 let records=fallback.map(normalise),concept=true;
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
 }catch(e){console.warn('Using fallback gallery:',e.message)}
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
 if(!(img instanceof HTMLImageElement))return;
 const fallback=img.getAttribute('data-fallback-src');
 if(fallback&&safePreview(fallback)&&img.src!==fallback){
  img.removeAttribute('data-fallback-src');
  img.src=fallback;
 }
},true);

/** Studio availability banner, edited through assets/studio-notices.json. */
async function initStudioNotice(){
 const banner=document.querySelector('[data-studio-announcement]');
 if(!banner)return;
 try{
  const response=await fetch('/assets/studio-notices.json',{cache:'no-cache'});
  if(!response.ok)return;
  const data=await response.json();
  if(data.enabled===false||typeof data.message!=='string'||!data.message.trim()){banner.hidden=true;return;}
  const message=banner.querySelector('[data-notice-text]');
  if(message)message.textContent=data.message.slice(0,240);
  banner.hidden=false;
 }catch(error){ /* The default text stays visible if the optional settings file cannot load. */ }
}
/** Formspree-ready enquiries: never claim delivery without a successful POST. */
async function getStudioFormEndpoint(){
 try{
 const res=await fetch('/assets/enquiry-settings.json',{cache:'no-cache'});
 if(!res.ok)return '';
 const config=await res.json();
 const endpoint=String(config.formspreeEndpoint||'').trim();
 return /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint)?endpoint:'';
 }catch(err){return '';}
}
function initStudioEnquiryForms(){
 const forms=document.querySelectorAll('[data-studio-enquiry-form]');
 if(!forms.length)return;
 const endpoint=getStudioFormEndpoint();
 forms.forEach(form=>{
  const status=form.querySelector('[data-studio-enquiry-status]');
  const submit=form.querySelector('button[type="submit"]');
  const params=new URLSearchParams(location.search);
  const radio=form.querySelector('input[name="category"][value="'+(params.get('type')==='workshop'?'workshop':'creations')+'"]');
  if(radio)radio.checked=true;
  if(form.elements.creationType&&['Cake','Cupcakes'].includes(params.get('product')))form.elements.creationType.value=params.get('product');
  if(form.elements.selectedDesign)form.elements.selectedDesign.value=(params.get('designTitle')||params.get('style')||'').slice(0,160);
  const ref=params.get('reference')||'';
  if(form.elements.referenceLink&&/^https:\/\/www\.instagram\.com\/(?:p|reel|tv)\//.test(ref))form.elements.referenceLink.value=ref.slice(0,500);
  if(form.elements.sourcePage)form.elements.sourcePage.value=location.pathname;
  const date=form.elements.eventDate;
  if(date){const now=new Date();date.min=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);}
  function updateCategory(){
   const chosen=form.querySelector('input[name="category"]:checked')?.value||'creations';
   form.querySelectorAll('[data-studio-category]').forEach(group=>{
    const on=group.dataset.studioCategory===chosen;
    group.hidden=!on;group.querySelectorAll('input,select,textarea').forEach(field=>field.disabled=!on);
   });
   if(status){status.hidden=true;status.replaceChildren();}
  }
  form.querySelectorAll('input[name="category"]').forEach(radio=>radio.addEventListener('change',updateCategory));
  updateCategory();
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   if(!form.reportValidity()||!status||!submit)return;
   if(form.elements._gotcha?.value)return;
   status.hidden=false;status.replaceChildren();
   const url=await endpoint;
   if(!url){
    status.append(document.createTextNode('Online enquiries are not available here yet. Please '));
    const link=document.createElement('a');
    link.href='https://ig.me/m/madsaboutcake';link.target='_blank';link.rel='noopener noreferrer';link.textContent='contact Mads on Instagram';
    status.append(link,document.createTextNode(' instead.'));
    return;
   }
   submit.disabled=true;submit.textContent='Sending…';
   try{
    const payload=new FormData(form);
    payload.set('_subject','Mads About Cake — '+String(payload.get('category')||'general')+' enquiry');
    const response=await fetch(url,{method:'POST',body:payload,headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('Not delivered');
    form.reset();updateCategory();status.hidden=false;
    status.textContent="Thank you. Your enquiry has been sent.";
   }catch(error){
    status.textContent="Your enquiry couldn't be sent. Please try again or contact Mads on Instagram.";
   }finally{submit.disabled=false;submit.textContent='Send enquiry ↗';}
  });
 });
}
document.addEventListener('DOMContentLoaded',()=>{initNavigation();initCuratedImageSwaps();initPortfolio();initStudioNotice();initStudioEnquiryForms();});

