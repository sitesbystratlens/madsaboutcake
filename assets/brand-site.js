/* Mads About Cake — owner-approved category structure, manual enquiries only.
   Gallery reads an intentionally minimal PUBLIC data file. Internal owner review
   information is excluded from the Cloudflare asset deployment. */
(() => {
'use strict';
const IG_PROFILE='https://www.instagram.com/madsaboutcake/';
const IG_DM='https://ig.me/m/madsaboutcake';
const PHONE='0425 819 951';
const SMS='sms:+61425819951';
const DATA='/assets/public-creations.json';
const STEP=12;
const byId=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safePhoto=p=>typeof p==='string'&&/^assets\/(?:gallery-30|gallery-review-covers|gallery-final-covers|featured-25|creations)\/[\w./-]+\.webp$/.test(p);
const safeIg=url=>typeof url==='string'&&/^https:\/\/www\.instagram\.com\/p\/[A-Za-z0-9_-]{5,32}\/$/.test(url)?url:IG_PROFILE;
const FILTERS=[
 ['all','All'],
 ['weddings','Weddings'],
 ['celebrations','Celebrations'],
 ['tiramisu','Tiramisu']
];
const currentSection=list=>list.filter(c=>c&&typeof c==='object');
function matchFilter(c,f){
 // Offerings, not formats: cakes and cupcakes remain within their occasion.
 return f==='all'||c.section===f;
}
function dialog(){
 let d=byId('creation-dialog');
 if(d)return d;
 d=document.createElement('dialog');
 d.id='creation-dialog';d.className='creation-dialog';
 d.innerHTML='<div class="creation-dialog__inner"><button type="button" class="creation-dialog__close" aria-label="Close photograph">×</button><img alt=""><h2 class="creation-dialog__title"></h2><p>Like this creation? Mention its reference when you get in touch.</p><p class="creation-dialog__ref"></p><div class="btns"><button class="btn btn-outline" type="button" data-dialog-copy>Copy reference</button><a class="btn" href="'+IG_DM+'" target="_blank" rel="noopener noreferrer">Message Mads ↗</a><a class="dialog-post" href="'+IG_PROFILE+'" target="_blank" rel="noopener noreferrer">Original post ↗</a></div></div>';
 document.body.appendChild(d);
 d.querySelector('.creation-dialog__close').addEventListener('click',()=>d.close());
 d.addEventListener('click',e=>{if(e.target===d)d.close()});
 return d;
}
async function copyText(text){
 try{await navigator.clipboard.writeText(text);return true}
 catch(e){
  const field=document.createElement('textarea');field.value=text;field.style.position='fixed';field.style.opacity='0';
  document.body.appendChild(field);field.select();const ok=document.execCommand('copy');field.remove();return ok;
 }
}
function openPreview(c){
 const d=dialog();
 d.querySelector('img').src='/'+(safePhoto(c.coverImage)?c.coverImage:c.thumbnailImage);
 d.querySelector('img').alt=c.alt||c.title;
 d.querySelector('.creation-dialog__title').textContent=c.title;
 d.querySelector('.creation-dialog__ref').textContent='Design reference: '+c.code;
 d.querySelector('.dialog-post').href=safeIg(c.instagramUrl);
 const copy=d.querySelector('[data-dialog-copy]');copy.textContent='Copy reference';
 copy.onclick=async()=>{copy.textContent=(await copyText('Mads About Cake — '+c.title+' (reference '+c.code+')'))?'Reference copied ✓':'Copy unavailable'};
 d.showModal();
}
function galleryCard(c){
 const img=safePhoto(c.thumbnailImage)?c.thumbnailImage:c.coverImage;
 const title=esc(c.title),alt=esc(c.alt||c.title);
 return '<article class="gallery-card">'+
  '<button class="gallery-card__photo" type="button" data-preview="'+esc(c.code)+'" aria-label="View larger photo of '+title+'"><img loading="lazy" decoding="async" src="/'+esc(img)+'" alt="'+alt+'"></button>'+
  '<div class="gallery-card__meta"><h3>'+title+'</h3>'+
  '<div class="gallery-card__links"><a href="'+esc(safeIg(c.instagramUrl))+'" target="_blank" rel="noopener noreferrer">Original Instagram post ↗</a>'+
  '<button type="button" data-copy="'+esc(c.code)+'">Copy reference</button></div></div></article>';
}
function setupGallery(){
 const root=document.querySelector('[data-gallery]');if(!root)return;
 const key=root.dataset.gallery;
 fetch(DATA,{cache:'default'}).then(r=>{if(!r.ok)throw new Error('Gallery unavailable');return r.json()}).then(db=>{
  const all=currentSection(db.creations||[]);
  let items=all.filter(c=>key==='all'||c.section===key).sort((a,b)=>(a.priority??1000)-(b.priority??1000));
  if(key==='tiramisu'){items=items.slice().sort((a,b)=>a.title.localeCompare(b.title))}
  const selected=new URLSearchParams(location.search).get('design');
  if(selected){const n=items.findIndex(c=>c.id===selected||c.code===selected);if(n>0)items.unshift(...items.splice(n,1))}
  const requested=new URLSearchParams(location.search).get('filter');
  let filter=FILTERS.some(([value])=>value===requested)?requested:'all',shown=STEP;
  const count=byId('gallery-count'),filterHost=byId('gallery-filters'),more=byId('gallery-show-more');
  if(filterHost && key==='all'){
   filterHost.hidden=false;
   function filters(){
    filterHost.innerHTML=FILTERS.map(([value,label])=>{
     const n=items.filter(c=>matchFilter(c,value)).length;
     return '<button type="button" class="filter-chip" data-filter="'+value+'" aria-pressed="'+(filter===value)+'">'+esc(label)+' <span>'+n+'</span></button>';
    }).join('');
    filterHost.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
      filter=b.dataset.filter;shown=STEP;draw();filters();
    }));
   }
   filters();
  }
  function draw(){
   const list=items.filter(c=>matchFilter(c,filter));
   const visible=list.slice(0,shown);
   root.innerHTML=visible.map(galleryCard).join('');
   if(!list.length)root.innerHTML='<p class="empty">No creations in this group yet. Explore the other categories or message Mads about a custom idea.</p>';
   if(count)count.textContent='Showing '+visible.length+' of '+list.length+' '+(list.length===1?'creation':'creations');
   if(more){more.hidden=visible.length===list.length;more.textContent='Show more creations';more.onclick=()=>{shown+=STEP;draw();}}
   root.querySelectorAll('[data-preview]').forEach(button=>button.addEventListener('click',()=>{
    const c=all.find(x=>x.code===button.dataset.preview);if(c)openPreview(c);
   }));
   root.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
    const c=all.find(x=>x.code===button.dataset.copy);if(!c)return;
    button.textContent=await copyText('Mads About Cake — '+c.title+' (reference '+c.code+')')?'Copied ✓':'Copy unavailable';
   }));
  }
  draw();
 }).catch(()=>{
  root.innerHTML='<p class="empty">The gallery is temporarily unavailable. <a href="'+IG_PROFILE+'" target="_blank" rel="noopener noreferrer">Visit Mads on Instagram ↗</a></p>';
  const count=byId('gallery-count');if(count)count.textContent='Gallery unavailable';
 });
}
function initCakeNav(){
 const menu=document.querySelector('[data-cake-menu]');
 if(!menu)return;
 const toggle=menu.querySelector('[data-cake-toggle]');
 const panel=menu.querySelector('[data-cake-panel]');
 if(!toggle||!panel)return;
 const open=()=>!panel.hidden;
 const setOpen=value=>{
  panel.hidden=!value;
  toggle.setAttribute('aria-expanded',String(value));
 };
 toggle.addEventListener('click',()=>setOpen(!open()));
 document.addEventListener('pointerdown',e=>{
  if(open()&&!menu.contains(e.target))setOpen(false);
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&open()){
   setOpen(false);toggle.focus();
  }
 });
 menu.addEventListener('focusout',e=>{
  if(open()&&!menu.contains(e.relatedTarget))setOpen(false);
 });
}
function initContact(){
 document.querySelectorAll('[data-ig-contact]').forEach(a=>{a.href=IG_DM;a.target='_blank';a.rel='noopener noreferrer'});
 document.querySelectorAll('[data-mobile-link]').forEach(a=>{a.href=SMS;a.textContent='Text '+PHONE;a.hidden=false});
 document.querySelectorAll('[data-mobile-pending]').forEach(e=>e.remove());
 const sticky=document.createElement('nav');
 sticky.className='mobile-contact-bar';sticky.setAttribute('aria-label','Quick contact');
 sticky.innerHTML='<a href="'+IG_DM+'" target="_blank" rel="noopener noreferrer">Instagram message ↗</a><a href="'+SMS+'">Text '+PHONE+'</a>';
 document.body.appendChild(sticky);
}
document.addEventListener('DOMContentLoaded',()=>{initCakeNav();initContact();setupGallery()});
})();