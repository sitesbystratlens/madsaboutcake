#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const port=4173;
const base='http://127.0.0.1:'+port;
const widths=[1440,768,390,320];
const pages=[
 ['home','/'],['cakes','/cakes/'],['cake-detail','/cakes/?design=ig-f25-dgm5hj1hcjf'],
 ['decorate-and-sip','/decorate-and-sip/'],['about','/about/'],['enquire','/enquire/'],['review','/review/']
];
const out='qa-screenshots';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
let failures=[],results=[];
for(const [slug,url] of pages){
 for(const width of widths){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
  const exceptions=[];
  page.on('pageerror',error=>exceptions.push(error.message));
  await page.goto(base+url,{waitUntil:'domcontentloaded',timeout:20000});
  await page.locator('body').waitFor();
  if(slug==='review')await page.locator('.review-card').first().waitFor({timeout:15000});
  // Force below-the-fold native lazy images to load before counting failures and capturing a full-page screenshot.
  await page.evaluate(async()=>{
   const images=[...document.images];
   for(const img of images)if(img.loading==='lazy')img.loading='eager';
   await Promise.all(images.map(img=>img.decode().catch(()=>null)));
  });
  await page.waitForTimeout(150);
  const info=await page.evaluate(()=>{
   const visible=e=>{const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&!e.hidden;};
   const imgs=[...document.images];
   const nav=[...document.querySelectorAll('.mads-main-nav a')].filter(visible);
   const doc=document.documentElement;
   const facts={
    pageTitle:document.title,
    documentWidth:doc.scrollWidth,
    viewportWidth:innerWidth,
    imageCount:imgs.length,
    brokenImages:imgs.filter(x=>visible(x)&&x.complete&&x.naturalWidth===0).map(x=>x.getAttribute('src')),
    visibleNavigation:nav.map(a=>a.textContent.trim()),
    mainHeading:document.querySelector('main h1')?.textContent.trim()||'',
    cssFont:getComputedStyle(document.querySelector('main h1')||document.body).fontFamily,
    fontLoaded:document.fonts.check('600 40px Fraunces'),
    bannerVisible:[...document.querySelectorAll('[data-studio-announcement]')].some(visible),
    galleryCards:[...document.querySelectorAll('[data-gallery] .gallery-card')].filter(visible).length,
    formCount:document.querySelectorAll('[data-studio-enquiry-form]').length,
    overflowElements:[...document.querySelectorAll('body *')].filter(el=>{const rect=el.getBoundingClientRect();return rect.width>0&&rect.right>innerWidth+4&&getComputedStyle(el).position!=='fixed';}).slice(0,10).map(el=>({tag:el.tagName,cls:String(el.className).slice(0,90),right:Math.round(el.getBoundingClientRect().right)}))
   };
   return facts;
  });
  const screenshot=path.join(out,slug+'-'+width+'.png');
  await page.screenshot({path:screenshot,fullPage:true,animations:'disabled',timeout:20000});
  const problem=[];
  if(info.documentWidth>width+4)problem.push('horizontal overflow '+info.documentWidth+' > '+width);
  if(info.brokenImages.length)problem.push('broken images '+info.brokenImages.join(','));
  if(slug!=='review'&&info.visibleNavigation.length<3)problem.push('insufficient visible navigation');
  if(!info.mainHeading)problem.push('missing H1');
  if(exceptions.length)problem.push('uncaught JS '+exceptions.join('; '));
  if(slug==='cakes'){
   const source=JSON.parse(fs.readFileSync('cakes.json','utf8'));
   if(info.galleryCards!==source.meta.featuredCount)problem.push('expected '+source.meta.featuredCount+' gallery designs, saw '+info.galleryCards);
  }
  if(slug==='cakes'&&(width===1440||width===390)){
   for(const label of ['Birthdays','Weddings & engagements','Baby celebrations','Love & anniversaries']){
    await page.locator('#occasion-filter').selectOption({label});
    const visible=await page.locator('[data-gallery] .gallery-card:not([hidden])').count();
    const source=JSON.parse(fs.readFileSync('cakes.json','utf8'));
    const expected=source.cakes.filter(c=>c.featured30===true&&!c.holdOccasionFilterUntilOwnerApproval&&(c.primaryOccasion===label||(c.otherOccasions||[]).includes(label))).length;
    if(visible!==expected)problem.push(label+' has '+visible+' items, expected '+expected);
    if(width===1440&&['Baby celebrations','Weddings & engagements'].includes(label)){
     const grid=await page.locator('[data-gallery]').evaluate(el=>({shown:el.querySelectorAll('.gallery-card:not([hidden])').length,columns:getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length}));
     if(grid.shown<6||grid.columns!==3)problem.push(label+' must display a complete desktop three-column block '+JSON.stringify(grid));
    }
    if(width===1440&&visible===4){
     const layout=await page.locator('[data-gallery]').evaluate(el=>({count:el.dataset.visibleCount,columns:getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length}));
     if(layout.count!=='4'||layout.columns!==2)problem.push(label+' should render a balanced 2x2 grid '+JSON.stringify(layout));
    }
   }
   await page.locator('#occasion-filter').selectOption('all');
  }
  if(slug==='decorate-and-sip'){
   const presentation=await page.evaluate(()=>{
    const title=document.querySelector('.workshop-hero__copy h1');
    const numbers=[...document.querySelectorAll('.workshop-detail__num')];
    return {heading:title?.textContent?.trim(),accentCount:document.querySelectorAll('.workshop-hero__accent').length,
      numbers:numbers.map(el=>({text:el.textContent.trim(),fontSize:parseFloat(getComputedStyle(el).fontSize),
        borderRadius:getComputedStyle(el).borderRadius,background:getComputedStyle(el).backgroundColor}))};
   });
   if(presentation.accentCount!==0||presentation.numbers.length!==3||presentation.numbers.some(n=>n.fontSize<40||n.borderRadius!=='0px'))problem.push('Workshop should have one-colour title and refined typographic steps '+JSON.stringify(presentation));
   const heroSrc=await page.locator('.workshop-hero__media img').getAttribute('src');
   if(!heroSrc?.endsWith('DSR06gjEgJK-no-visible-faces.webp'))problem.push('Face-safe studio photograph not selected');
  }
  if(slug==='home'&&width===1440){
   const heading=await page.locator('.occasion .section-head h2').evaluate(el=>({text:el.innerText,whiteSpace:getComputedStyle(el).whiteSpace}));
   if(!heading.text.includes('What are we celebrating?')||heading.whiteSpace!=='nowrap')problem.push('Desktop occasion heading does not resolve to one line '+JSON.stringify(heading));
  }
  if(slug==='cakes'){
   const counts=await page.evaluate(()=>({cardActions:document.querySelectorAll('[data-gallery] .gallery-card-actions').length,photoLinks:document.querySelectorAll('[data-gallery] .gallery-photo[href*="design="]').length,titleLinks:document.querySelectorAll('[data-gallery] .gallery-title-link[href*="design="]').length,arrows:document.querySelectorAll('[data-gallery] .gallery-photo__arrow').length}));
   if(counts.cardActions!==0)problem.push('repeated gallery CTAs '+counts.cardActions);
   const expectedGalleryCount=await page.evaluate(async()=>{const r=await fetch('/cakes.json');const d=await r.json();return d.meta.featuredCount;});
   if(counts.photoLinks!==expectedGalleryCount||counts.titleLinks!==expectedGalleryCount||counts.arrows!==expectedGalleryCount)problem.push('gallery click targets missing; expected '+expectedGalleryCount+' '+JSON.stringify(counts));
  }
  if(slug==='cake-detail'){
   const post=await page.locator('#design-detail .design-instagram-link').evaluate(el=>({href:el.href,rel:el.rel,target:el.target,visible:el.getBoundingClientRect().width>0}));
   if(post.href!=='https://www.instagram.com/p/DGM5hj1hcJf/'||post.target!=='_blank'||!post.rel.includes('noopener')||!post.visible)problem.push('original Instagram link missing or incorrect '+JSON.stringify(post));
   if((await page.locator('#design-detail a[href*="/enquire/"]').count())!==1)problem.push('detail enquiry link missing');
  }
  if(slug==='decorate-and-sip'){
   const answers=await page.locator('.faq-list').textContent();
   if(/\bMads\b/.test(answers)||!answers.includes('we’ve')&&!answers.includes('We’re'))problem.push('FAQ studio voice not consistent');
   if((await page.locator('.faq-list details').count())!==4)problem.push('FAQ count differs');
  }
  if(slug==='review'&&(width===1440||width===390)){
    const birthdayCount=await page.locator('.review-card').count();
    if(birthdayCount!==54)problem.push('Birthday owner-review list has '+birthdayCount+' posts, expected 54');
    await page.locator('[data-group="cupcakes"]').click();
    const cupcakeCount=await page.locator('.review-card').count();
    if(cupcakeCount!==35)problem.push('Cupcake owner-review list has '+cupcakeCount+' posts, expected 35');
    const extraGroups=[['weddings',18],['baby',18],['love',22],['other',28]];
    for(const [group,expectedCount] of extraGroups){
      await page.locator('[data-group="'+group+'"]').click();
      const actual=await page.locator('.review-card').count();
      if(actual!==expectedCount)problem.push('Owner '+group+' review has '+actual+' items; expected '+expectedCount);
      const misses=await page.locator('.review-card').evaluateAll(async cards=>{
        const imgs=cards.map(x=>x.querySelector('img'));
        await Promise.all(imgs.map(img=>{img.loading='eager';return img.decode().catch(()=>null)}));
        return imgs.filter(img=>img.naturalWidth===0).map(img=>img.src);
      });
      if(misses.length)problem.push(group+' has '+misses.length+' missing original preview photographs: '+misses.slice(0,3).join(','));
    }
    const popularFirst=page.locator('.review-card').first();
    const popularCode=await popularFirst.getAttribute('data-code');
    await popularFirst.locator('.category-choice').selectOption('Floral / garden');
    await popularFirst.locator('[data-decision="keep"]').click();
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.review-card').first().waitFor();
    const popularRetained=page.locator('.review-card[data-code="'+popularCode+'"]');
    if(await popularRetained.locator('.category-choice').inputValue()!=='Floral / garden'||
       await popularRetained.locator('[data-decision="keep"]').getAttribute('aria-pressed')!=='true')
      problem.push('Other-category discovery decision not persisted after refresh');
    await page.locator('[data-group="birthdays"]').click();
    const first=page.locator('.review-card').first();
    const source=await first.getAttribute('data-code');
    await first.locator('[data-decision="keep"]').click();
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.review-card').first().waitFor();
    const retained=page.locator('.review-card[data-code="'+source+'"] [data-decision="keep"]');
    if(await retained.getAttribute('aria-pressed')!=='true')problem.push('Owner Keep selection does not survive refresh');
    if(!await page.locator('.review-card .post-link[href^="https://www.instagram.com/p/"]').count())problem.push('Source-post links missing');
    if((await page.locator('.review-header .brand').count())!==1||(await page.locator('.review-header .back').count())!==1)problem.push('Review navigation links missing');
    if((await page.locator('body').evaluate(el=>el.scrollWidth))>width+4)problem.push('review horizontal overflow');
  }
  if(slug==='enquire'&&info.formCount!==1)problem.push('missing enquiry form');
  results.push({page:slug,width,screenshot,...info,problems:problem});
  if(problem.length)failures.push(slug+' '+width+': '+problem.join('; '));
  console.log(JSON.stringify({page:slug,width,broken:info.brokenImages.length,overflow:info.documentWidth-width,nav:info.visibleNavigation.length,cards:info.galleryCards,fontLoaded:info.fontLoaded,problems:problem}));
  await page.close();
 }
}
await browser.close();
fs.writeFileSync(path.join(out,'qa-results.json'),JSON.stringify({date:new Date().toISOString(),source:'GitHub main, local static server',results,failures},null,2));
if(failures.length){console.error('VISUAL QA BLOCKERS:\n'+failures.join('\n'));process.exitCode=1;}
else console.log('VISUAL QA PASS: screenshots captured across 6 pages × 4 widths, no broken images or overflow.');
