/* Mads About Cake — owner-led 2025 brand refresh, 2026 gallery concept.
   All examples sourced from the curated 120 Instagram posts, not inventing products.
   No cart, booking, date selector or order form: contact is manual. */
(() => {
'use strict';
const IG='https://www.instagram.com/madsaboutcake/';
const PHONE='0425 819 951'; // Confirmed by site owner through the project contact.
const byId=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=s=>typeof s==='string'&&/^assets\/(?:gallery-30|gallery-review-covers|gallery-final-covers|featured-25|creations)\/[\w./-]+\.webp$/.test(s);
const selected=c=>c.featured30===true;
const isTiramisu=c=>/tiramisu/i.test([c.title,c.shortDescription,c.captionEvidence].join(' '));
const isWedding=c=>c.primaryOccasion==='Weddings & engagements'||(c.otherOccasions||[]).includes('Weddings & engagements');
const category=c=>isTiramisu(c)?'tiramisu':isWedding(c)?'weddings':'celebrations';
const pretty={weddings:'Wedding cakes',celebrations:'Celebration cakes',tiramisu:'Tiramisu cakes'};
const galleryCard=(c,i)=>{
 const path=safeUrl(c.coverImage)?'/'+c.coverImage:'/assets/mads-logo.webp';
 const photo=c.instagramUrl&&/^https:\/\/www\.instagram\.com\/p\/[\w-]+\/$/.test(c.instagramUrl)?c.instagramUrl:IG;
 const name=esc(c.title);
 return '<article class="gallery-card"><a class="gallery-card__photo" href="'+esc(photo)+'" target="_blank" rel="noopener noreferrer" aria-label="View original Instagram post for '+name+'"><img src="'+esc(path)+'" alt="'+esc(c.alt||c.title)+'" loading="lazy" decoding="async"></a>'+
  '<div class="gallery-card__meta"><p class="eyebrow">A past creation / '+String(i+1).padStart(2,'0')+'</p><h3>'+name+'</h3>'+
  '<div class="gallery-card__links"><a href="'+esc(photo)+'" target="_blank" rel="noopener noreferrer">View on Instagram ↗</a><a href="'+IG+'" target="_blank" rel="noopener noreferrer">Enquire about similar ↗</a></div></div></article>';
};
async function setupGallery(){
 const root=document.querySelector('[data-gallery]');if(!root)return;
 const key=root.dataset.gallery;try{
  const res=await fetch('/cakes.json',{cache:'no-store'});if(!res.ok)throw new Error('Unable to load creations');
  const db=await res.json();
  let filtered=(db.cakes||[]).filter(selected).filter(c=>key==='all'||category(c)===key);
  if(key==='tiramisu')filtered.sort((a,b)=>Number(b.postEngagement?.likes||0)-Number(a.postEngagement?.likes||0));
  if(key==='celebrations')filtered.sort((a,b)=>(a.priority??1000)-(b.priority??1000));
  const detail=new URLSearchParams(location.search).get('design');
  if(detail){const j=filtered.findIndex(c=>c.id===detail);if(j>0)filtered.unshift(...filtered.splice(j,1));}
  root.innerHTML=filtered.map(galleryCard).join('');
  const count=byId('gallery-count');if(count)count.textContent=filtered.length+' '+(filtered.length===1?'creation':'creations')+' to explore';
  if(!filtered.length)root.innerHTML='<p class="empty">More creations will be added here as Madara approves her selection. You can still enquire directly on Instagram.</p>';
 }catch(e){root.innerHTML='<p class="empty">The gallery is unavailable at the moment. <a href="'+IG+'">Browse Mads on Instagram ↗</a></p>';}
}
function initContact(){
 document.querySelectorAll('[data-ig-contact]').forEach(a=>{a.href=IG;a.target='_blank';a.rel='noopener noreferrer'});
 document.querySelectorAll('[data-mobile-link]').forEach(a=>{
  const digits=PHONE.replace(/[^+\d]/g,'');
  if(digits){a.href='tel:+61'+digits.slice(1);a.textContent='Call '+PHONE;a.hidden=false;}
  else{a.hidden=true;}
 });
 document.querySelectorAll('[data-mobile-pending]').forEach(x=>{x.classList.toggle('visible',!PHONE);x.textContent=PHONE?'':'Mobile contact button will appear once the studio confirms its public number.'});
}
function init(){
 initContact();setupGallery();
}
document.addEventListener('DOMContentLoaded',init);
})();