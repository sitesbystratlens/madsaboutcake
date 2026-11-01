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
  if(width===390){
    const dropdown=page.locator('[data-cake-toggle]');
    if(await dropdown.count()!==1)problems.push('Cakes dropdown toggle missing');
    else{
      if(await dropdown.getAttribute('aria-expanded')!=='false')problems.push('Dropdown should start closed');
      await dropdown.click();
      if(await dropdown.getAttribute('aria-expanded')!=='true')problems.push('Dropdown did not open on tap');
      const menu=page.locator('[data-cake-panel]');
      if(await menu.locator('a').count()!==4)problems.push('Expected four gallery shortcuts');
      if(await menu.locator('a[href="/cakes/?filter=cupcakes"]').count())problems.push('Cupcakes should not be separate from occasion categories');
      if(!await menu.getByText('Custom creations').count())problems.push('Custom creations entry missing');
      if(!await page.locator('.brand-links a[href="/cake-care/"]').getByText('Care guide').count())problems.push('Care guide navigation missing');
      await dropdown.press('Escape');
      if(await dropdown.getAttribute('aria-expanded')!=='false')problems.push('Escape did not dismiss dropdown');
      if(!await page.locator('.nav-cakes__main[href="/cakes/"]').count())problems.push('Main cakes link is not All creations');
    }
  }
  if(name==='home'&&width===1440){
    const footer=page.locator('.brand-footer');
    if(await footer.locator('a[href="/weddings/"]').count())problems.push('Footer repeats wedding category');
    if(!await footer.getByText('Handcrafted sweets for every occasion.').count())problems.push('Owner brand copy missing');
    if(!await page.locator('.contact-strip .btn[data-ig-contact]').count())problems.push('Instagram action missing');
    if(!await page.locator('.contact-strip .btn[data-mobile-link]').count())problems.push('SMS action missing');
  }

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
  if(name==='all'&&width===390){
   const buttons=page.locator('#gallery-filters [data-filter]');
   if(await buttons.count()!==4)problems.push('four owner category filters required');
   await page.locator('#gallery-filters [data-filter="weddings"]').click();
   if(!await page.locator('#gallery-count').textContent().then(s=>s.includes('of 9 ')))problems.push('Weddings subset not 9');
   await page.locator('#gallery-filters [data-filter="celebrations"]').click();
   if(!await page.locator('#gallery-count').textContent().then(s=>s.includes('of 110 ')))problems.push('Celebrations subset not 110');
   await page.locator('#gallery-filters [data-filter="tiramisu"]').click();
   if(!await page.locator('#gallery-count').textContent().then(s=>s.includes('of 1 ')))problems.push('Tiramisu subset not 1');
   await page.locator('#gallery-filters [data-filter="all"]').click();
   await page.locator('#gallery-show-more').click();
   if(await page.locator('.gallery-card').count()!==24)problems.push('Show more not revealing additional 12');
  }
  if(name==='all'&&width===390){
    await page.goto(BASE+'/cakes/?filter=weddings',{waitUntil:'domcontentloaded',timeout:25000});
    await page.locator('.gallery-card').first().waitFor({timeout:18000});
    const state=await page.locator('#gallery-filters [data-filter="weddings"]').getAttribute('aria-pressed');
    const text=await page.locator('#gallery-count').textContent();
    if(state!=='true'||!text.includes('of 9 '))problems.push('Weddings gallery shortcut must deep-link to 9 filtered designs');
  }
  if(name==='care'){
    const guide=await page.locator('main').textContent();
    for(const phrase of ['passenger-side floor','Temperature matters','Once you’re home','approximately 1–2 hours','A final little reminder'])if(!guide.includes(phrase))problems.push('Owner care text missing: '+phrase);
    if(await page.locator('.care-panel').count()!==4)problems.push('Care guide must have four content panels');
    if(await page.locator('.care-panel__icon').count()!==4)problems.push('Care guide must include four visual icons');
  }
  if(name==='celebrations'&&width===390&&await page.locator('#gallery-filters:visible').count())problems.push('Celebration page should not expose duplicate subcategories');
  if(['home','all','care','weddings','celebrations','tiramisu'].includes(name)&&width===390){
    if(!await page.locator('img.contact-signature').count())problems.push('Preview xoxo signature missing');
  }
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
