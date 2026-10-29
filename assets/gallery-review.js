/* Independent, owner-only gallery review. No server submissions or hidden publishing. */
(() => {
'use strict';
const el=id=>document.getElementById(id);
const STORAGE='mads-owner-gallery-review-v1';
const choices=['undecided','keep','remove'];
let candidates=null,catalogue=null,records=[],currentGroup='birthdays',state={decisions:{},notes:{},overall:''};
let storageAvailable=true;
const postUrl=c=>'https://www.instagram.com/p/'+encodeURIComponent(c)+'/';
const clean=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validPath=s=>typeof s==='string'&&/^assets\/(?:gallery-30(?:\/thumbs)?|featured-25|creations|cake-covers)\/[\w.-]+\.(?:webp|jpe?g|png|avif)$/.test(s);
const validCode=s=>/^[A-Za-z0-9_-]{5,32}$/.test(s);
function readStorage(){
 try { const raw=localStorage.getItem(STORAGE);if(raw){const saved=JSON.parse(raw);
 if(saved&&typeof saved==='object')state={decisions:saved.decisions||{},notes:saved.notes||{},overall:typeof saved.overall==='string'?saved.overall:''};}}
 catch(e){storageAvailable=false;el('feedback').textContent='Browser storage is disabled. Please download a CSV regularly.';}
}
function save(){
 try {localStorage.setItem(STORAGE,JSON.stringify(state));}
 catch(e){storageAvailable=false;el('feedback').textContent='Your browser could not save locally. Download a CSV backup.';}
}
function findCurrent(code){
 const c=(catalogue.cakes||[]).find(x=>x.sourceShortcode===code);
 return c||null;
}
function build(){
 const groups=[
  ...candidates.birthdayConfirmed.map((code,i)=>({code,group:'birthdays',evidence:'Confirmed birthday / age',sequence:i})),
  ...candidates.birthdayThemed.map((code,i)=>({code,group:'birthdays',evidence:'Themed — birthday not confirmed',sequence:i+candidates.birthdayConfirmed.length})),
  ...candidates.cupcakes.map((code,i)=>({code,group:'cupcakes',evidence:'Cupcake / mixed order',sequence:i}))
 ];
 records=groups.filter(x=>validCode(x.code)).map(x=>{
  const found=findCurrent(x.code);
  const alreadyFeatured=!!found?.featured30;
  const inGroup=x.group==='birthdays'
   ?alreadyFeatured&&(found.primaryOccasion==='Birthdays'||(found.otherOccasions||[]).includes('Birthdays'))
   :alreadyFeatured&&found.productType==='Cupcakes';
  const status=inGroup?'Currently featured':alreadyFeatured?'On site in another filter':'Not featured';
  const photo=validPath(found?.coverImage)?'/'+found.coverImage:'/assets/gallery-review-covers/'+x.code+'.webp';
  return {...x,title:candidates.labels[x.code]||found?.title||x.code,photo,found,status,alreadyFeatured};
 });
 el('overall-notes').value=state.overall||'';
 el('overall-notes').addEventListener('input',e=>{state.overall=e.target.value.slice(0,15000);save();});
 const params=new URLSearchParams(location.search);
 const tab=params.get('category');
 currentGroup=tab==='cupcakes'?'cupcakes':'birthdays';
 el('context').textContent='Select Keep or Remove for each design; your decisions apply in both lists when a post appears twice. The existing gallery is unchanged.';
 bind();
 render();
}
function chosen(code){return choices.includes(state.decisions[code])?state.decisions[code]:'undecided';}
function visibleItems(){
 const term=el('search').value.trim().toLowerCase(),status=el('status').value,sort=el('sort').value;
 let list=records.filter(c=>c.group===currentGroup&&(status==='all'||chosen(c.code)===status)&&
 (!term||(c.title+' '+c.code+' '+c.evidence).toLowerCase().includes(term)));
 if(sort==='name')list.sort((a,b)=>a.title.localeCompare(b.title));
 else if(sort==='existing')list.sort((a,b)=>Number(b.alreadyFeatured)-Number(a.alreadyFeatured)||a.sequence-b.sequence);
 else list.sort((a,b)=>a.sequence-b.sequence);
 return list;
}
function cardHtml(c){
 const decision=chosen(c.code),note=state.notes[c.code]||'',isNew=c.status==='Not featured';
 const badge=c.status==='Currently featured'?'Currently featured':c.status==='On site in another filter'?'Featured under Cakes':'Not in curated gallery';
 const decisionButtons=choices.map(choice=>'<button type="button" data-decision="'+choice+'" aria-pressed="'+String(decision===choice)+'">'+({keep:'✓ Keep',remove:'× Remove',undecided:'? Decide later'}[choice])+'</button>').join('');
 return '<article class="review-card" data-code="'+clean(c.code)+'" data-decision="'+decision+'">'+
 '<button type="button" class="review-image-button" aria-label="Enlarge photo of '+clean(c.title)+'">'+
 '<img loading="lazy" decoding="async" src="'+clean(c.photo)+'" alt="'+clean(c.title)+'" onerror="" />'+
 '<span class="image-fallback" hidden><strong>Photo not available yet</strong><span>Use the original Instagram post link below.</span></span></button>'+
 '<div class="card-copy"><div class="card-tags">'+clean(badge)+' · '+clean(c.evidence)+'</div>'+
 '<h2>'+clean(c.title)+'</h2>'+
 '<p class="card-caption">'+(isNew?'Additional Instagram candidate': 'Part of the current website selection')+'</p>'+
 '<a class="post-link" href="'+postUrl(c.code)+'" target="_blank" rel="noopener noreferrer">View original Instagram post ↗</a></div>'+
 '<footer><div class="decision-buttons" role="group" aria-label="Review '+clean(c.title)+'">'+decisionButtons+'</div>'+
 '<label class="note-label" for="note-'+clean(c.code)+'-'+c.group+'">Notes (optional)</label>'+
 '<textarea class="card-note" id="note-'+clean(c.code)+'-'+c.group+'" maxlength="1500" placeholder="e.g. keep but use photo 2…">'+clean(note)+'</textarea>'+
 '</footer></article>';
}
function render(){
 document.querySelectorAll('[data-group]').forEach(btn=>btn.setAttribute('aria-selected',String(btn.dataset.group===currentGroup)));
 const groupRecords=records.filter(c=>c.group===currentGroup);
 const counts={keep:0,remove:0,undecided:0};
 groupRecords.forEach(c=>counts[chosen(c.code)]++);
 el('total').textContent=groupRecords.length;el('kept').textContent=counts.keep;el('removed').textContent=counts.remove;el('undecided').textContent=counts.undecided;
 const shown=visibleItems();
 el('cards').innerHTML=shown.map(cardHtml).join('');
 el('empty').hidden=shown.length!==0;
 el('context').textContent=(currentGroup==='birthdays'
 ?'33 caption-confirmed birthdays plus 7 themed possibilities. Themed candidates are clearly labelled; generic hashtags alone do not confirm birthdays.'
 :'34 cupcake-related posts. Mixed cake-and-cupcake sets are included and labelled. The coconut set remains in Love & Anniversaries.')+
 ' '+shown.length+' designs shown. Selections save in this browser.';
 el('cards').querySelectorAll('.review-card').forEach(card=>{
  const code=card.dataset.code,c=records.find(x=>x.code===code&&x.group===currentGroup);
  const img=card.querySelector('img'),fallback=card.querySelector('.image-fallback');
  function broken(){img.hidden=true;fallback.hidden=false;card.querySelector('.review-image-button').disabled=true;}
  img.addEventListener('error',broken);
  if(img.complete&&img.naturalWidth===0)broken();
  card.querySelector('.review-image-button').addEventListener('click',()=>{
   if(!img.naturalWidth)return;
   el('dialog-image').src=img.src;el('dialog-image').alt=c.title;el('dialog-caption').textContent=c.title;
   el('photo-dialog').showModal();
  });
  card.querySelectorAll('[data-decision]').forEach(btn=>btn.addEventListener('click',()=>{
   state.decisions[code]=btn.dataset.decision;save();
   const focusCode=code;render();
   const selected=Array.from(el('cards').querySelectorAll('.review-card')).find(x=>x.dataset.code===focusCode);
   selected?.querySelector('[data-decision="'+state.decisions[code]+'"]')?.focus({preventScroll:true});
  }));
  card.querySelector('.card-note').addEventListener('input',e=>{state.notes[code]=e.target.value.slice(0,1500);save();});
 });
}
function unique(){return [...new Map(records.map(c=>[c.code,c])).values()];}
function exportData(){
 return unique().map(c=>({code:c.code,title:c.title,birthday:records.some(x=>x.code===c.code&&x.group==='birthdays'),
 cupcake:records.some(x=>x.code===c.code&&x.group==='cupcakes'),currentGallery:c.status,
 decision:chosen(c.code),note:state.notes[c.code]||'',source:postUrl(c.code)}));
}
function reviewText(){
 const lines=['MADS ABOUT CAKE — GALLERY REVIEW','Saved decisions (shared across Birthday and Cupcake lists)',''];
 for(const g of ['birthdays','cupcakes']){
  const list=records.filter(x=>x.group===g);
  lines.push(g==='birthdays'?'BIRTHDAYS':'CUPCAKES');
  for(const c of list){
   const d=chosen(c.code),note=state.notes[c.code]||'';
   if(d==='undecided'&&!note)continue;
   lines.push((d==='keep'?'KEEP':d==='remove'?'REMOVE':'UNDECIDED')+' — '+c.title+' — '+postUrl(c.code)+(note?' — Note: '+note.replace(/\s+/g,' '):''));
  }
  lines.push('Decided '+list.filter(c=>chosen(c.code)!=='undecided').length+' of '+list.length,'');
 }
 if(state.overall)lines.push('OVERALL NOTES',state.overall);
 lines.push('Note: no gallery changes are applied automatically.');
 return lines.join('\n');
}
async function copy(){
 const t=reviewText();
 try{await navigator.clipboard.writeText(t);el('feedback').textContent='Copied! Paste into ChatGPT when ready.';}
 catch(e){const node=document.createElement('textarea');node.value=t;document.body.appendChild(node);node.select();const worked=document.execCommand('copy');node.remove();el('feedback').textContent=worked?'Copied! Paste into ChatGPT.':'Copy unavailable. Use Download CSV instead.';}
}
function download(){
 const rows=[['Shortcode','Design','Birthday list','Cupcake list','Review','Current gallery','Notes','Instagram']];
 for(const c of exportData())rows.push([c.code,c.title,c.birthday?'Yes':'No',c.cupcake?'Yes':'No',c.decision,c.currentGallery,c.note,c.source]);
 rows.push([],['Overall notes',state.overall]);
 const csv=rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='Mads_Gallery_Review_'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 el('feedback').textContent='CSV downloaded. You can upload it here for the final selections.';
}
function bind(){
 document.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{
  currentGroup=b.dataset.group;
  const u=new URL(location.href);u.searchParams.set('category',currentGroup);history.replaceState(null,'',u);
  el('search').value='';el('status').value='all';render();
 }));
 for(const id of ['search','status','sort'])el(id).addEventListener(id==='search'?'input':'change',render);
 for(const id of ['copy','copy-bottom'])el(id).addEventListener('click',copy);
 for(const id of ['download','download-bottom'])el(id).addEventListener('click',download);
 el('close-dialog').addEventListener('click',()=>el('photo-dialog').close());
 el('photo-dialog').addEventListener('click',e=>{if(e.target===el('photo-dialog'))el('photo-dialog').close();});
}
async function init(){
 readStorage();
 try{
  const [r1,r2]=await Promise.all([fetch('/data/gallery-review-candidates.json',{cache:'no-cache'}),fetch('/cakes.json',{cache:'no-cache'})]);
  if(!r1.ok||!r2.ok)throw Error('Unable to load review records');
  candidates=await r1.json();catalogue=await r2.json();
  if(candidates.birthdayConfirmed.length!==33||candidates.birthdayThemed.length!==7||candidates.cupcakes.length!==34)throw Error('Candidate list changed unexpectedly');
  build();
 }catch(err){el('context').textContent='The gallery could not load: '+err.message+'. Refresh the page and try again.';}
}
document.addEventListener('DOMContentLoaded',init);
})();
