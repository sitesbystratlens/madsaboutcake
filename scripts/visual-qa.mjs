#!/usr/bin/env node
import {chromium} from 'playwright';
import fs from 'node:fs';
const BASE='http://127.0.0.1:4173',widths=[1440,768,390,320];
const cases=[
 ['home','/',null],
 ['weddings','/weddings/',9],
 ['celebrations','/celebrations/',110],
 ['tiramisu','/tiramisu-cakes/',1],
 ['sip','/decorate-and-sip/',null],
 ['care','/cake-care/',null],
 ['all','/cakes/',120],
 ['contact','/enquire/',null]
];
const browser=await chromium.launch({headless:true});
let errors=[],results=[];
fs.mkdirSync('qa-screenshots',{recursive:true});
for(const [name,url,wanted] of cases)for(const width of widths){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 try{
  await page.goto(BASE+url,{waitUntil:'domcontentloaded',timeout:25000});
  await page.locator('main h1').waitFor({timeout:12000});
  if(wanted!==null)await page.locator('.gallery-card').first().waitFor({timeout:18000});
  await page.evaluate(async()=>{
   const im=[...document.images].filter(x=>x.loading!=='lazy').slice(0,18);
   await Promise.all(im.map(x=>x.decode().catch(()=>null)));
  });
  const info=await page.evaluate(()=>{
   const logo=document.querySelector('.brand-link img'),body=document.body;
   const imgs=[...document.images].filter(x=>x.loading!=='lazy');
   return {title:document.title,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,
    heading:document.querySelector('main h1')?.textContent.trim(),
    logo:logo?.naturalWidth||0,nav:document.querySelectorAll('.brand-links a').length,
    cards:document.querySelectorAll('.gallery-card').length,
    broken:imgs.filter(x=>x.complete&&x.naturalWidth===0).map(x=>x.src),
    crimson:getComputedStyle(document.querySelector('.brand-topline')).backgroundColor,
    igLinks:document.querySelectorAll('a[href="https://www.instagram.com/madsaboutcake/"]').length,
    phoneLinks:[...document.querySelectorAll('[data-mobile-link]')].filter(x=>!x.hidden).length,
    phonePending:[...document.querySelectorAll('[data-mobile-pending]')].filter(x=>getComputedStyle(x).display!=='none').length,
    overflowItems:[...document.querySelectorAll('body *')].filter(x=>{const r=x.getBoundingClientRect();return r.right>innerWidth+4&&r.width>0}).slice(0,12).map(x=>({tag:x.tagName,cls:String(x.className).slice(0,60),right:Math.round(x.getBoundingClientRect().right),width:Math.round(x.getBoundingClientRect().width),text:(x.textContent||'').trim().slice(0,50)}))};
  });
  const problems=[];
  if(info.scrollWidth>width+3)problems.push('horizontal overflow '+info.scrollWidth+' caused by '+JSON.stringify(info.overflowItems));
  if(!info.heading)problems.push('H1 missing');
  if(!info.logo)problems.push('brand logo did not render');
  if(info.nav<6)problems.push('category nav incomplete');
  if(info.crimson!=='rgb(154, 40, 73)')problems.push('wrong crimson '+info.crimson);
  if(info.igLinks<2)problems.push('Instagram enquiry absent');
  if(info.phoneLinks)problems.push('Unconfirmed phone number exposed');
  if(info.broken.length)problems.push('broken image(s) '+info.broken.slice(0,3).join(','));
  if(wanted!==null&&info.cards!==wanted)problems.push('expected '+wanted+' creations, saw '+info.cards);
  if(name==='care'&&!(await page.locator('main').textContent()).includes('passenger-side floor'))problems.push('care instructions absent');
  if(name==='contact'&&(await page.locator('form').count()))problems.push('order form unexpectedly present');
  if(pageErrors.length)problems.push('browser error '+pageErrors.join('; '));
  await page.screenshot({path:'qa-screenshots/'+name+'-'+width+'.png',fullPage:true,animations:'disabled',timeout:35000});
  results.push({name,width,...info,problems});
  if(problems.length)errors.push(name+' '+width+': '+problems.join('; '));
  console.log(JSON.stringify({page:name,width,cards:info.cards,logo:info.logo,overflow:info.scrollWidth-width,problems}));
 }catch(e){errors.push(name+' '+width+': '+e.message);}
 await page.close();
}
await browser.close();
fs.writeFileSync('qa-screenshots/report.json',JSON.stringify({cases:results,errors},null,2));
if(errors.length){console.error('REBRAND QA FAILED:\n'+errors.join('\n'));process.exitCode=1;}
else console.log('REBRAND QA PASS: 8 pages × 4 breakpoints, branded logo, no broken imagery, manual enquiry and exact category counts');
