#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';
const required=['title','instagram_url','product_type','occasion','show_on_website','featured','priority'];
const products=['Cake','Cupcakes','Other Treats'],occasions=['Birthdays','Weddings & Engagements','Baby Showers & Gender Reveals','Anniversaries','Religious & Cultural','Graduations','Corporate & Events','Other Celebrations'];
function csvRows(t){let out=[],row=[],value='',q=false;t=String(t).replace(/^\uFEFF/,'');for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'&&t[i+1]==='"'){value+='"';i++;}else if(c==='"')q=false;else value+=c;}else if(c==='"')q=true;else if(c===','){row.push(value);value='';}else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(value);if(row.some(x=>x.trim()))out.push(row);row=[];value='';}else value+=c;}if(q)throw Error('Bad quote');row.push(value);if(row.some(x=>x.trim()))out.push(row);return out;}
const clean=(x,n=200)=>String(x??'').trim().slice(0,n);
const yes=x=>['yes','true','1'].includes(clean(x).toLowerCase());
const tags=x=>clean(x,800).split(';').map(s=>clean(s,70)).filter(Boolean).slice(0,15);
const number=x=>Number(x)>0?Number(x):null;
const natural=x=>x!==''&&Number.isInteger(Number(x))&&Number(x)>=0?Number(x):null;
function instagram(v){try{const u=new URL(clean(v,800));return u.protocol==='https:'&&['instagram.com','www.instagram.com'].includes(u.hostname)&&/^\/(p|reel|tv)\/[\w-]+\/?$/.test(u.pathname)?'https://www.instagram.com'+u.pathname:'';}catch{return '';}}
function convert(csv,prior){
 const rows=csvRows(csv);if(rows.length<2||rows.length>501)throw Error('Invalid number of rows');
 const h=rows[0].map(x=>clean(x).toLowerCase()),idx=Object.fromEntries(h.map((x,i)=>[x,i]));
 for(const key of required)if(!(key in idx))throw Error('Missing '+key);
 const previous=new Map((prior.cakes||[]).map(c=>[c.id,c])),used=new Set(),items=[];
 for(const [i,row] of rows.slice(1).entries()){
  const get=k=>idx[k]===undefined?'':clean(row[idx[k]],1600);
  if(!yes(get('show_on_website')))continue;
  const url=instagram(get('instagram_url')),productType=get('product_type'),primaryOccasion=get('occasion');
  const code=(url.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)\/?$/)||[])[1]||'';
  const id=get('item_id')||'ig-'+[...code].map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join('');
  if(!/^[a-z0-9-]+$/.test(id)||!get('title')||!url||!products.includes(productType)||!occasions.includes(primaryOccasion)||used.has(id))throw Error('Invalid approved row '+(i+2));
  used.add(id);const priorItem=previous.get(id);
  items.push({id,title:get('title'),productType,primaryOccasion,otherOccasions:tags(get('other_occasions')).filter(x=>occasions.includes(x)),
   styleTags:tags(get('style_tags')),shapeFormat:'',shortDescription:get('short_description'),alt:get('alt_text')||get('title'),instagramUrl:url,
   coverImage:priorItem&&/^assets\/creations\/[\w-]+\.webp$/.test(priorItem.coverImage||'')&&fs.existsSync(priorItem.coverImage)?priorItem.coverImage:(priorItem?.instagramUrl===url?priorItem.coverImage||'':''),previewImage:'',
   priority:natural(get('priority'))??999,featuredHome:yes(get('featured')),homepageOrder:natural(get('priority'))??999,showOnWebsite:'Yes',approvalStatus:'Approved',demoVisible:false,
   displayBadge:['Popular','Best seller','New'].includes(get('badge_label'))&&yes(get('badge_confirmed'))?get('badge_label'):'',badgeApproved:yes(get('badge_confirmed')),
   priceFrom:number(get('price_from_aud')),servingsMin:number(get('servings_min')),servingsMax:number(get('servings_max')),
   leadTimeDays:natural(get('lead_time_days')),designCustomisable:yes('Yes'),
   availableFlavourIds:tags(get('available_flavour_ids')),personalisationOptions:tags(get('personalisation_options')),
   availabilityStatus:get('availability_status')||'Enquire',availabilityEndDate:get('availability_end_date')||'',galleryImageUrls:[]});
 }
 if(!items.length)throw Error('No visible rows. Existing snapshot retained.');
 return items.sort((a,b)=>a.priority-b.priority);
}
async function main(){
 if(process.argv.includes('--test')){assert.equal(csvRows('a,b\n"foo,bar",z')[1][0],'foo,bar');assert.equal(instagram('http://localhost/p/ABC/'),'');console.log('Portfolio importer tests passed');return;}
 const u=new URL(process.env.MADS_CREATIONS_CSV_URL||'');
 if(u.protocol!=='https:'||u.hostname!=='docs.google.com'||!u.pathname.startsWith('/spreadsheets/d/')||u.searchParams.get('tqx')!=='out:csv')throw Error('Configure MADS_CREATIONS_CSV_URL for the public Creation Visibility CSV');
 const r=await fetch(u.href,{signal:AbortSignal.timeout(18000)});if(!r.ok)throw Error('CSV HTTP '+r.status);
 const csv=await r.text();if(csv.length>800000)throw Error('CSV too big');
 const items=convert(csv,JSON.parse(fs.readFileSync('cakes.json','utf8')));console.log('Visible rows:',items.length);
 if(!process.argv.includes('--publish')){console.log('Validation only. No files changed.');return;}
 fs.writeFileSync('cakes.json',JSON.stringify({meta:{version:3,mode:'production',source:'manual-creation-visibility-sheet'},cakes:items},null,2)+'\n');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
