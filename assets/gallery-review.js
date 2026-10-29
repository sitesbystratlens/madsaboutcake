/* Owner-only visual discovery. No submissions or catalogue mutations. */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const STORAGE='mads-owner-gallery-review-v1'; // MUST remain stable: previous decisions are saved here.
const decisionsAllowed=['undecided','keep','remove'];
const GROUPS=[
 {id:'birthdays',name:'Birthdays',description:'33 birthday/age-confirmed and 7 visually themed possibilities. A possible theme does not establish the occasion.'},
 {id:'cupcakes',name:'Cupcakes',description:'34 cupcake or mixed cake-and-cupcake posts, including the coconut set retained under Love & Anniversaries.'},
 {id:'weddings',name:'Weddings & engagements',description:'12 wedding, engagement, bridal or pre-wedding posts, plus 6 style-led possibilities not confirmed as wedding orders.'},
 {id:'baby',name:'Baby celebrations',description:'9 baby-related posts including one user-labelled cupcake set, plus 9 tentative themes and first-birthday crossover designs.'},
 {id:'love',name:'Love & anniversaries',description:'10 love/anniversary or owner-kept examples, plus 12 possible hearts, bows, mini cakes and work/business anniversary examples. Not all are romantic.'},
 {id:'popular',name:'Popular · uncategorised',description:'Posts with at least 45 historical Instagram likes, or already featured without an occasion, excluding confirmed occasion groups and workshop/promotional posts. Likes are a screening signal, not sales or engagement rate.'}
];
const GROUP_LABEL=Object.fromEntries(GROUPS.map(g=>[g.id,g.name]));
const CATEGORY_OPTIONS=[
 ['','Not sure yet'],['Vintage piping','Vintage piping'],['Floral / garden','Floral / garden'],['Statement / tiered','Statement / tiered'],
 ['Novelty / characters','Novelty / characters'],['Mini cakes','Mini cakes'],['Flavours / fruit','Flavours / fruit'],
 ['Religious / cultural','Religious / cultural'],['Graduation','Graduation'],['Seasonal','Seasonal'],
 ['Corporate / career','Corporate / career'],['Milestone celebrations','Milestone celebrations'],['Other','Other — add note']
];
let base=null,additional=null,catalogue=null,priorReview=null,records=[],currentGroup='birthdays';
let state={decisions:{},notes:{},overall:'',groupDecisions:{},groupNotes:{},suggestedCategories:{}};
const clean=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const postUrl=s=>'https://www.instagram.com/p/'+encodeURIComponent(s)+'/';
const validCode=s=>/^[A-Za-z0-9_-]{5,32}$/.test(s);
const validPhoto=s=>typeof s==='string'&&/^assets\/(?:gallery-30(?:\/thumbs)?|featured-25|creations|cake-covers|gallery-review-covers)\/[\w.-]+\.(?:webp|png|jpe?g|avif)$/.test(s);
const legacyGroup=g=>g==='birthdays'||g==='cupcakes';
const decision=(code,group)=>{
 const val=legacyGroup(group)?state.decisions[code]:state.groupDecisions[group]?.[code];
 return decisionsAllowed.includes(val)?val:'undecided';
};
const note=(code,group)=>legacyGroup(group)?(state.notes[code]||''):(state.groupNotes[group]?.[code]||'');
const categoryChoice=code=>state.suggestedCategories[code]||'';
function readStorage(){
 try {
  const s=localStorage.getItem(STORAGE);
  if(!s)return;
  const saved=JSON.parse(s);
  if(saved&&typeof saved==='object'){
   for(const k of ['decisions','notes','groupDecisions','groupNotes','suggestedCategories'])if(saved[k]&&typeof saved[k]==='object')state[k]=saved[k];
   if(typeof saved.overall==='string')state.overall=saved.overall;
  }
 }catch(e){$('feedback').textContent='Browser storage is disabled. Download CSV often to preserve your decisions.';}
}
function save(){
 try{localStorage.setItem(STORAGE,JSON.stringify(state))}
 catch(e){$('feedback').textContent='Browser could not save your review locally. Please download CSV now.';}
}
function setDecision(code,group,val){
 if(!decisionsAllowed.includes(val))return;
 if(legacyGroup(group))state.decisions[code]=val;
 else (state.groupDecisions[group]??={})[code]=val;
 save();
}
function setNote(code,group,val){
 if(legacyGroup(group))state.notes[code]=val.slice(0,1500);
 else (state.groupNotes[group]??={})[code]=val.slice(0,1500);
 save();
}
function makeRecords(){
 const combos=[
  ...base.birthdayConfirmed.map((code,i)=>({code,group:'birthdays',evidence:'Birthday / age evidenced',sequence:i})),
  ...base.birthdayThemed.map((code,i)=>({code,group:'birthdays',evidence:'Themed — occasion unconfirmed',sequence:base.birthdayConfirmed.length+i})),
  ...base.cupcakes.map((code,i)=>({code,group:'cupcakes',evidence:'Cupcake / mixed order',sequence:i})),
  ...additional.weddingsConfirmed.map((code,i)=>({code,group:'weddings',evidence:'Wedding, bridal or pre-wedding source',sequence:i})),
  ...additional.weddingsPossible.map((code,i)=>({code,group:'weddings',evidence:'Style-led suggestion — not confirmed',sequence:i+additional.weddingsConfirmed.length})),
  ...additional.babyConfirmed.map((code,i)=>({code,group:'baby',evidence:code==='C7tO9F4B8lX'?'Baby occasion noted by reviewer':'Baby occasion evidenced',sequence:i})),
  ...additional.babyPossible.map((code,i)=>({code,group:'baby',evidence:'First birthday crossover / visual suggestion',sequence:i+additional.babyConfirmed.length})),
  ...additional.loveConfirmed.map((code,i)=>({code,group:'love',evidence:code==='Db2wuYpEoIe'?'Anniversary category retained by reviewer':'Love / anniversary / mini-heart candidate',sequence:i})),
  ...additional.lovePossible.map((code,i)=>({code,group:'love',evidence:['DIYSdKZhbxK','C88mW3FyNh8'].includes(code)?'Work / business anniversary, not romantic':'Visual style only — occasion not established',sequence:i+additional.loveConfirmed.length})),
  ...additional.popularUncategorised.map((code,i)=>({code,group:'popular',evidence:'Uncategorised discovery candidate',sequence:i}))
 ];
 const existing=new Map((catalogue.cakes||[]).map(x=>[x.sourceShortcode,x]));
 records=combos.filter(x=>validCode(x.code)).map(x=>{
  const item=existing.get(x.code),meta=additional.metadata?.[x.code]||{},featured=!!item?.featured30;
  const currentOccasions=[item?.primaryOccasion,...(item?.otherOccasions||[])].filter(Boolean);
  const inGroup=featured&&(x.group==='birthdays'?currentOccasions.includes('Birthdays'):
   x.group==='cupcakes'?item?.productType==='Cupcakes'||(item?.otherProductTypes||[]).includes('Cupcakes'):
   x.group==='weddings'?currentOccasions.includes('Weddings & engagements')&&!item?.holdOccasionFilterUntilOwnerApproval:
   x.group==='baby'?currentOccasions.includes('Baby celebrations')&&!item?.holdOccasionFilterUntilOwnerApproval:
   x.group==='love'?currentOccasions.includes('Love & anniversaries'):
   item?.featureCategory==='Other/unspecified');
  const status=inGroup?'Featured in this group':featured?'Featured elsewhere':'Not in featured gallery';
  const photo=validPhoto(item?.coverImage)?'/'+item.coverImage:'/assets/gallery-review-covers/'+x.code+'.webp';
  return {...x,title:meta.title||base.labels[x.code]||item?.title||x.code,caption:meta.caption||'',likes:Number.isFinite(meta.likes)?meta.likes:null,
   photo,status,featured,source:postUrl(x.code)};
 });
}
function cardHtml(r){
 const d=decision(r.code,r.group),n=note(r.code,r.group),chosenCategory=categoryChoice(r.code);
 const categoryField=r.group==='popular'?'<label class="note-label" for="category-'+clean(r.code)+'">Could this belong to a new category?</label>'+
 '<select class="category-choice" id="category-'+clean(r.code)+'">'+CATEGORY_OPTIONS.map(([v,t])=>'<option value="'+clean(v)+'"'+(chosenCategory===v?' selected':'')+'>'+clean(t)+'</option>').join('')+'</select>':'';
 return '<article class="review-card" data-code="'+clean(r.code)+'" data-decision="'+d+'">'+
  '<button class="review-image-button" type="button" aria-label="Enlarge '+clean(r.title)+' image">'+
  '<img src="'+clean(r.photo)+'" alt="'+clean(r.title)+'" loading="lazy" decoding="async">'+
  '<span class="image-fallback" hidden><strong>Photo temporarily unavailable</strong><span>Use the original Instagram post below.</span></span></button>'+
  '<div class="card-copy"><div class="card-tags">'+clean(r.status)+' · '+clean(r.evidence)+'</div>'+
  '<h2>'+clean(r.title)+'</h2>'+
  (r.caption?'<p class="card-caption">'+clean(r.caption)+'</p>':'')+
  '<div class="card-stats">'+(r.likes!==null?'Historical Instagram likes: <b>'+r.likes+'</b>':'Historical likes unavailable')+'</div>'+
  '<a class="post-link" href="'+r.source+'" target="_blank" rel="noopener noreferrer">View original Instagram post ↗</a></div>'+
  '<footer><div class="decision-buttons" role="group" aria-label="Choose '+clean(r.title)+'">'+
  decisionsAllowed.map(x=>'<button type="button" data-decision="'+x+'" aria-pressed="'+(d===x)+'">'+({keep:'✓ Keep',remove:'× Remove',undecided:'? Later'}[x])+'</button>').join('')+'</div>'+
  categoryField+
  '<label class="note-label" for="note-'+clean(r.code)+'-'+r.group+'">Notes (optional)</label>'+
  '<textarea class="card-note" id="note-'+clean(r.code)+'-'+r.group+'" maxlength="1500" placeholder="e.g. suitable for floral cakes, photo 2…">'+clean(n)+'</textarea></footer></article>';
}
function shown(){
 const search=$('search').value.trim().toLowerCase(),filter=$('status').value,sort=$('sort').value;
 const arr=records.filter(x=>x.group===currentGroup&&(filter==='all'||decision(x.code,x.group)===filter)&&
 (!search||(x.title+' '+x.code+' '+x.caption+' '+x.evidence).toLowerCase().includes(search)));
 if(sort==='name')arr.sort((a,b)=>a.title.localeCompare(b.title));
 else if(sort==='popularity')arr.sort((a,b)=>(b.likes??-1)-(a.likes??-1)||a.sequence-b.sequence);
 else if(sort==='existing')arr.sort((a,b)=>Number(b.featured)-Number(a.featured)||a.sequence-b.sequence);
 else arr.sort((a,b)=>a.sequence-b.sequence);
 return arr;
}
function render(){
 document.querySelectorAll('[data-group]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.group===currentGroup)));
 const current=records.filter(x=>x.group===currentGroup);
 const count=val=>current.filter(x=>decision(x.code,x.group)===val).length;
 $('total').textContent=current.length;$('kept').textContent=count('keep');$('removed').textContent=count('remove');$('undecided').textContent=count('undecided');
 const list=shown();$('cards').innerHTML=list.map(cardHtml).join('');$('empty').hidden=!!list.length;
 const g=GROUPS.find(x=>x.id===currentGroup);
 $('context').textContent=g.description+' '+list.length+' posts visible. Selections save automatically on this device.';
 for(const card of $('cards').querySelectorAll('.review-card')){
  const code=card.dataset.code,r=records.find(x=>x.code===code&&x.group===currentGroup);
  const img=card.querySelector('img'),fb=card.querySelector('.image-fallback');
  function broken(){img.hidden=true;fb.hidden=false;card.querySelector('.review-image-button').disabled=true}
  img.addEventListener('error',broken);
  if(img.complete&&img.naturalWidth===0)broken();
  card.querySelector('.review-image-button').addEventListener('click',()=>{
   if(!img.naturalWidth)return;
   $('dialog-image').src=img.src;$('dialog-image').alt=r.title;$('dialog-caption').textContent=r.title;
   $('photo-dialog').showModal();
  });
  card.querySelectorAll('[data-decision]').forEach(btn=>btn.addEventListener('click',()=>{
   setDecision(code,currentGroup,btn.dataset.decision);render();
   const selected=Array.from($('cards').querySelectorAll('.review-card')).find(x=>x.dataset.code===code);
   selected?.querySelector('[data-decision="'+btn.dataset.decision+'"]')?.focus({preventScroll:true});
  }));
  card.querySelector('.card-note').addEventListener('input',e=>setNote(code,currentGroup,e.target.value));
  card.querySelector('.category-choice')?.addEventListener('change',e=>{state.suggestedCategories[code]=e.target.value;save()});
 }
}
function exportRows(){return records.map(r=>({
 group:r.group,code:r.code,title:r.title,decision:decision(r.code,r.group),
 note:note(r.code,r.group),category: r.group==='popular'?categoryChoice(r.code):'',
 status:r.status,instagram:r.source,likes:r.likes,sourceEvidence:r.evidence
}));}
function reviewText(){
 const lines=['MADS ABOUT CAKE — OWNER REVIEW','Decisions are per-category for Weddings, Baby, Love and Popular. Birthday/Cupcake decisions retain their previous shared selection.',''];
 for(const g of GROUPS){
  const items=exportRows().filter(x=>x.group===g.id);
  lines.push(g.name.toUpperCase());
  for(const r of items)if(r.decision!=='undecided'||r.note||r.category)lines.push(r.decision.toUpperCase()+' — '+r.title+' — '+r.instagram+(r.category?' — Category: '+r.category:'')+(r.note?' — Note: '+r.note.replace(/\s+/g,' '):''));
  lines.push('Decided '+items.filter(x=>x.decision!=='undecided').length+' of '+items.length,'');
 }
 if(state.overall)lines.push('OVERALL NOTES',state.overall);
 lines.push('No changes to the live curated gallery are made by these decisions.');
 return lines.join('\n');
}
async function copy(){
 const t=reviewText();
 try{await navigator.clipboard.writeText(t);$('feedback').textContent='Copied. Paste the review here.'}
 catch(e){
  const area=document.createElement('textarea');area.value=t;document.body.appendChild(area);area.select();
  const ok=document.execCommand('copy');area.remove();$('feedback').textContent=ok?'Copied. Paste into ChatGPT.':'Copy was blocked; download CSV instead.';
 }
}
function csvDownload(){
 const rows=[['Section','Shortcode','Design','Decision','Notes','Suggested category','Current gallery','Instagram','Historical likes','Evidence']];
 for(const r of exportRows())rows.push([GROUP_LABEL[r.group],r.code,r.title,r.decision,r.note,r.category,r.status,r.instagram,r.likes??'',r.sourceEvidence]);
 rows.push([],['Overall notes',state.overall]);
 const csv=rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='Mads_Full_Gallery_Review_'+new Date().toISOString().slice(0,10)+'.csv';
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 $('feedback').textContent='Full review CSV downloaded. Upload it here when finished.';
}
function bind(){
 document.querySelectorAll('[data-group]').forEach(button=>button.addEventListener('click',()=>{
  currentGroup=button.dataset.group;const url=new URL(location.href);url.searchParams.set('category',currentGroup);window.history.replaceState(null,'',url);
  $('search').value='';$('status').value='all';$('sort').value=currentGroup==='popular'?'popularity':'existing';render();
 }));
 for(const id of ['search','status','sort'])$(id).addEventListener(id==='search'?'input':'change',render);
 for(const id of ['copy','copy-bottom'])$(id).addEventListener('click',copy);
 for(const id of ['download','download-bottom'])$(id).addEventListener('click',csvDownload);
 $('close-dialog').addEventListener('click',()=>$('photo-dialog').close());
 $('photo-dialog').addEventListener('click',e=>{if(e.target===$('photo-dialog'))$('photo-dialog').close()});
 $('overall-notes').value=state.overall||'';
 $('overall-notes').addEventListener('input',e=>{state.overall=e.target.value.slice(0,15000);save()});
}
function seedHistory(){
 const ds=priorReview?.decisions||{};
 for(const [code,value] of Object.entries(ds)){
  if(!Object.hasOwn(state.decisions,code) && decisionsAllowed.includes(value.review))state.decisions[code]=value.review;
  if(!Object.hasOwn(state.notes,code)&&value.note)state.notes[code]=value.note;
 }
 save();
}
async function init(){
 readStorage();
 try{
  const paths=['/data/gallery-review-candidates.json','/data/gallery-review-additional.json','/cakes.json','/data/gallery-owner-decisions-2026-10-30.json'];
  const rs=await Promise.all(paths.map(path=>fetch(path,{cache:'no-cache'})));
  if(rs.some(r=>!r.ok))throw Error('Review source file unavailable');
  [base,additional,catalogue,priorReview]=await Promise.all(rs.map(r=>r.json()));
  if(base.birthdayConfirmed?.length!==33||base.birthdayThemed?.length!==7||base.cupcakes?.length!==34||
   additional.weddingsConfirmed?.length!==12||additional.weddingsPossible?.length!==6||
   additional.babyConfirmed?.length!==9||additional.babyPossible?.length!==9||
   additional.loveConfirmed?.length!==10||additional.lovePossible?.length!==12||
   additional.popularUncategorised?.length<20)throw Error('Unexpected review candidate counts');
  seedHistory();makeRecords();
  for(const g of GROUPS){const b=document.querySelector('[data-group="'+g.id+'"]');if(b)b.querySelector('span').textContent=records.filter(x=>x.group===g.id).length;}
  const tab=new URLSearchParams(location.search).get('category');
  currentGroup=GROUPS.some(g=>g.id===tab)?tab:'birthdays';
  $('sort').value=currentGroup==='popular'?'popularity':'existing';bind();render();
 }catch(e){$('context').textContent='Could not load review: '+e.message+'. Refresh after deployment.';}
}
document.addEventListener('DOMContentLoaded',init);
})();