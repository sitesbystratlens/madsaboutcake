#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const port=4173;
const base='http://127.0.0.1:'+port;
const widths=[1440,768,390,320];
const pages=[
 ['home','/'],['cakes','/cakes/'],['cake-detail','/cakes/?design=ig-4449685f6f486a4268784e'],
 ['decorate-and-sip','/decorate-and-sip/'],['about','/about/'],['enquire','/enquire/']
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
  if(info.visibleNavigation.length<3)problem.push('insufficient visible navigation');
  if(!info.mainHeading)problem.push('missing H1');
  if(exceptions.length)problem.push('uncaught JS '+exceptions.join('; '));
  if(slug==='cakes'&&info.galleryCards<25)problem.push('unexpected gallery count '+info.galleryCards);
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
