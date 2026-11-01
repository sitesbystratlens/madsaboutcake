#!/usr/bin/env node
import {chromium} from 'playwright';
import fs from 'node:fs';
const BASE='http://127.0.0.1:4173',widths=[1440,768,390,320];
const cases=[
 ['home','/',0],
 ['weddings','/weddings/',9],
 ['celebrations','/celebrations/',110],
 ['tiramisu','/tiramisu-cakes/',1],
 ['sip','/decorate-and-sip/',0],
 ['care','/cake-care/',0],
 ['all','/cakes/',120],
 ['contact','/enquire/',0],
 ['about','/about/',0],
 ['notfound','/404.html',0]
];
fs.mkdirSync('qa-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
const errs=[],reports=[];
for(const [name,url,total] of cases)for(const width of widths){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 const problems=[];
 try{
  await page.goto(BASE+url,{waitUntil:'domcontentloaded',timeout:25000});
  await page.locator('main h1').waitFor({timeout:12000});
  if(total)await page.locator('.gallery-card').first().waitFor({timeout:18000});
  await page.evaluate(async()=>{
   const imgs=[...document.images].slice(0,10);
   await Promise.all(imgs.map(img=>{img.loading='eager';return img.decode().catch(()=>null)}));
  });
  const info=await page.evaluate(()=>{
   const head=document.querySelector('.brand-link img');
   const images=[...document.images].filter(img=>img.loading!=='lazy');
   return {title:document.title,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,
    heading:document.querySelector('main h1')?.textContent.trim(),logo:head?.naturalWidth||0,
    nav:document.querySelectorAll('.brand-links a').length,
    cards:document.querySelectorAll('.gallery-card').length,
    broken:images.filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.src),
    crimson:getComputedStyle(document.querySelector('.brand-topline')).backgroundColor,
    dm:[...document.querySelectorAll('a[href="https://ig.me/m/madsaboutcake"]')].length,
    phone:[...document.querySelectorAll('a[href="sms:+61425819951"]')].length,
    publicData:document.querySelector('[data-gallery]')?.dataset.gallery||''};
  });
  if(info.scrollWidth>width+3)problems.push('horizontal overflow '+info.scrollWidth+'/'+width);
  if(!info.heading)problems.push('H1 missing');
  if(!info.logo)problems.push('brand logo missing');
  if(info.nav<6)problems.push('six navigation entries required');
  if(info.crimson!=='rgb(154, 40, 73)')problems.push('brand palette mismatch');
  if(!info.dm)problems.push('Instagram direct message links missing');
  if(!info.phone)problems.push('confirmed text messaging number not linked');
  if(info.broken.length)problems.push('broken images: '+info.broken.slice(0,4).join(','));
  const expectedInitial=Math.min(total,12);
  if(info.cards!==expectedInitial)problems.push('expected '+expectedInitial+' initial cards, got '+info.cards);
  if(total){
   const announcement=await page.locator('#gallery-count').textContent();
   if(!announcement.includes('of '+total+' '))problems.push('gallery count inaccurate: '+announcement);
   const button=page.locator('.gallery-card [data-preview]').first();
   if(!await button.count())problems.push('on-page photo preview missing');
   else if(width===390){
    await button.click();const dlg=page.locator('#creation-dialog');
    if(!await dlg.evaluate(e=>e.open))problems.push('photo dialog did not open');
    if(!await dlg.locator('[data-dialog-copy]').count())problems.push('copy design reference missing');
    await dlg.locator('.creation-dialog__close').click();
   }
  }
  if((name==='celebrations'||name==='all')&&width===390){
   const buttons=page.locator('#gallery-filters [data-filter]');
   if(await buttons.count()!==6)problems.push('six gallery subfilters missing');
   await page.locator('#gallery-filters [data-filter="birthdays"]').click();
   const expectedBirthdays=name==='celebrations'?49:50;
   if(!await page.locator('#gallery-count').textContent().then(s=>s.includes('of '+expectedBirthdays+' ')))problems.push('Birthday subset not '+expectedBirthdays);
   await page.locator('#gallery-filters [data-filter="cupcakes"]').click();
   if(!await page.locator('#gallery-count').textContent().then(s=>s.includes('of 27 ')))problems.push('Cupcake subset not 27');
   await page.locator('#gallery-filters [data-filter="all"]').click();
   await page.locator('#gallery-show-more').click();
   if(await page.locator('.gallery-card').count()!==24)problems.push('Show more not revealing additional 12');
  }
  if(name==='care'&&!(await page.locator('main').textContent()).includes('passenger-side floor'))problems.push('owner care text missing');
  if(name==='sip'&&await page.locator('main img[src*="DSR06gjEgJK"]').count()!==1)problems.push('workshop image duplicated');
  if(name==='contact'){
   const text=await page.locator('main').textContent();
   if(!text.includes('Helpful details for your message'))problems.push('enquiry checklist missing');
   if(await page.locator('form').count())problems.push('unapproved order form');
  }
  if(pageErrors.length)problems.push('browser errors: '+pageErrors.join('; '));
  await page.screenshot({path:'qa-screenshots/'+name+'-'+width+'.png',fullPage:true,animations:'disabled',timeout:35000});
  reports.push({name,width,...info,problems});
  if(problems.length)errs.push(name+' @ '+width+': '+problems.join('; '));
  console.log(JSON.stringify({name,width,cards:info.cards,overflow:info.scrollWidth-width,problems}));
 }catch(e){errs.push(name+' @ '+width+': '+e.message)}
 await page.close();
}
await browser.close();
fs.writeFileSync('qa-screenshots/report.json',JSON.stringify({cases:reports,errors:errs},null,2));
if(errs.length){console.error('OWNER REVIEW QA FAILED:\n'+errs.join('\n'));process.exitCode=1}
else console.log('OWNER REVIEW QA PASS: 10 pages x 4 widths; six gallery filters; staged reveal; direct message and mobile contact; no broken imagery.');
