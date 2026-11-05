#!/usr/bin/env node
import {chromium} from 'playwright';
import fs from 'node:fs';
const BASE='http://127.0.0.1:4173',widths=[1440,768,390,320];
const cases=[
 ['home','/',0],
 ['weddings','/weddings/',6],
 ['celebrations','/celebrations/',24],
 ['tiramisu','/tiramisu-cakes/',2],
 ['sip','/decorate-and-sip/',0],
 ['care','/cake-care/',0],
 ['all','/cakes/',32],
 ['contact','/enquire/',0],
 ['about','/about/',0],
 ['notfound','/404.html',0],
 ['pricing','/pricing/',0]
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
  if(width<=768){
    const toggle=page.locator('[data-mobile-nav-toggle]');
    const mobile=page.locator('[data-mobile-nav]');
    const desktop=page.locator('.brand-links');
    if(!(await toggle.isVisible()))problems.push('Mobile hamburger not visible');
    if(await desktop.isVisible())problems.push('Desktop multi-row navigation should be hidden');
    if(await toggle.getAttribute('aria-expanded')!=='false')problems.push('Hamburger should begin collapsed');
    if(!await page.locator('.mobile-header-contact[href="/enquire/"]').isVisible())problems.push('Mobile header should link to Contact page');
    await toggle.click();
    if(await toggle.getAttribute('aria-expanded')!=='true'||!(await mobile.isVisible()))problems.push('Hamburger failed to reveal menu');
    const cakesToggle=mobile.locator('[data-mobile-cakes-toggle]');
    const cakesPanel=mobile.locator('[data-mobile-cakes-panel]');
    if(await cakesToggle.getAttribute('aria-expanded')!=='false'||await cakesPanel.isVisible())problems.push('Cakes accordion must start collapsed');
    if(await mobile.locator('.mobile-site-menu__group-link[href="/cakes/"]').count()!==1)problems.push('Cakes & cupcakes group must link to full gallery');
    if(await mobile.locator('.mobile-site-menu__primary>a').count()!==3)problems.push('Mobile navigation must have Decorate & Sip, Pickup and Contact, without Prices');
    await cakesToggle.click();
    if(await cakesToggle.getAttribute('aria-expanded')!=='true'||!(await cakesPanel.isVisible()))problems.push('Cakes category accordion did not open');
    if(await cakesPanel.locator('a').count()!==3)problems.push('Cakes group should show Weddings, Celebrations and Tiramisu');
    if((await cakesPanel.locator('a[href="/tiramisu-cakes/"]').innerText()).replace(/↗/g,'').trim()!=='Tiramisu')problems.push('Subcategory label should be Tiramisu, not Tiramisu cakes');
    await cakesToggle.click();
    if(await cakesPanel.isVisible())problems.push('Cakes accordion could not collapse');
    const logo=page.locator('.brand-link img');
    const alpha=await logo.evaluate(async img=>{
      await img.decode();const canvas=document.createElement('canvas');canvas.width=360;canvas.height=96;
      const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,360,96);
      return ctx.getImageData(0,0,1,1).data[3];
    });
    if(alpha>16)problems.push('Wordmark background not transparent; corner alpha='+alpha);
    const layout=await page.evaluate(()=>({
      headerZ:getComputedStyle(document.querySelector('.site-header')).zIndex,
      backdropZ:getComputedStyle(document.querySelector('[data-mobile-backdrop]')).zIndex,
      backdropInHeader:document.querySelector('.site-header').contains(document.querySelector('[data-mobile-backdrop]'))
    }));
    if(layout.backdropInHeader||Number(layout.backdropZ)>=Number(layout.headerZ))problems.push('Backdrop is dimming header and logo: '+JSON.stringify(layout));
    await toggle.press('Escape');
    if(await toggle.getAttribute('aria-expanded')!=='false'||await mobile.isVisible())problems.push('Escape did not close hamburger');
    await toggle.click();
    await page.locator('[data-mobile-backdrop]').click({position:{x:6,y:700}});
    if(await toggle.getAttribute('aria-expanded')!=='false')problems.push('Backdrop did not dismiss menu');
  }
  if(width===1440){
    const dropdown=page.locator('[data-cake-toggle]');
    if(await dropdown.count()!==1)problems.push('Desktop cakes dropdown toggle missing');
    else {
      await dropdown.click();
      if(await dropdown.getAttribute('aria-expanded')!=='true')problems.push('Desktop category menu did not open');
      if(!await page.locator('[data-cake-panel] a[href="/cakes/"]').getByText('Explore all').count())problems.push('Desktop Explore all entry missing');
      await dropdown.press('Escape');
      if(await dropdown.getAttribute('aria-expanded')!=='false')problems.push('Desktop Escape close failed');
    }
  }
  if(name==='home'){
    const logo=await page.locator('.brand-link img').evaluate(el=>({src:el.getAttribute('src'),loaded:el.complete&&el.naturalWidth>0}));
    if(!logo.src.includes('wordmark-owner-transparent.png')||!logo.loaded)problems.push('Canva original transparent wordmark is missing or not loaded');
    if(!await page.locator('link[rel="icon"][href*="monogram-owner-transparent.png"]').count())problems.push('Official monogram favicon is missing');
  }
  if(name==='home'){
    const imgSets=await page.evaluate(()=>{
      const hero=[...document.querySelectorAll('.hero-art img')].map(img=>new URL(img.src).pathname);
      const cards=[...document.querySelectorAll('.category-card__image img')].map(img=>new URL(img.src).pathname);
      return {hero,cards};
    });
    if(imgSets.cards.some(path=>imgSets.hero.includes(path)))problems.push('Category covers still duplicate hero photographs');
    const frames=await page.locator('.category-card__image').evaluateAll(xs=>xs.map(el=>({w:el.clientWidth,h:el.clientHeight})));
    if(frames.some(f=>Math.abs(f.w/f.h-0.8)>0.08))problems.push('Category covers must retain consistent 4:5 framing');
    if(!imgSets.cards[0]?.includes('DYJ42NMkqlU')||!imgSets.cards[1]?.includes('DCv93Blhb1I')||!imgSets.cards[2]?.includes('DeoN1h7PHzB'))problems.push('Curated category covers missing');
  }
  if(name==='pricing'){
    if(await page.locator('img.contact-signature').count())problems.push('Temporary reconstructed signature must not be shown');
  }
  if(name==='home'){
    if(!await page.locator('.hero-actions>a.btn[href="/cakes/"]').isVisible())problems.push('Explore our creations primary CTA must be visible at every viewport');
    if(await page.locator('.statement .btn[data-ig-contact]').count())problems.push('Burgundy statement duplicates enquiry CTA');
    if(await page.locator('.statement-line').count()!==4)problems.push('Burgundy statement must have four editorial lines');
    if((await page.locator('.statement-line').last().textContent()).trim()!=='celebrating.')problems.push('Celebrating must be on its own line');
    if(width>=981){
      const metrics=await page.evaluate(()=>{
        const statement=document.querySelector('.section.statement'),contact=document.querySelector('.contact-strip');
        const copy=statement.querySelector('.statement-grid>div>p');
        return {top:statement.getBoundingClientRect().height,contact:contact.getBoundingClientRect().height,font:parseFloat(getComputedStyle(copy).fontSize)};
      });
      if(metrics.font<19)problems.push('Statement supporting copy too small: '+metrics.font+'px');
      if(metrics.top<390||Math.abs(metrics.top-metrics.contact)>110)problems.push('Statement and cream contact bands unbalanced: '+JSON.stringify(metrics));
    }
  }
  if(name==='home'&&width<=650){
    if(await page.locator('.hero-copy .btn[data-ig-contact]').isVisible())problems.push('Duplicate mobile Instagram hero button still visible');
    if(await page.locator('.hero-copy .hero-contact-icons').isVisible())problems.push('Hero icons duplicate mobile sticky contact bar');
    if(!await page.locator('.mobile-contact-bar a').count())problems.push('Mobile sticky DM and SMS bar missing');
  }
  if(name==='sip'&&width<=650){
    if(await page.locator('.decorate-page-hero .hero-contact-icons').count())problems.push('Workshop hero icons should be removed');
    const heading=await page.locator('main h1').evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth,br:el.querySelector('br')!==null,nowrap:getComputedStyle(el).whiteSpace}));
    if(heading.br||heading.nowrap!=='nowrap'||heading.scroll>heading.client+2)problems.push('Decorate & Sip heading wraps or overflows at '+width+': '+JSON.stringify(heading));
  }
  if(name==='care'&&width<=650){
    const color=await page.locator('.care-panel--reminder .care-panel__icon').evaluate(el=>getComputedStyle(el).backgroundColor);
    if(color!=='rgb(246, 244, 240)')problems.push('Heart badge is not brand cream: '+color);
  }
  if(name==='sip'){
    if(await page.locator('.decorate-page-hero .hero-contact-icons').count())problems.push('Workshop hero must not repeat contact links');
    const size=await page.locator('.decorate-page-hero .copy').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
    if(size<(width<=650?17.5:19.5))problems.push('Decorate & Sip hero description remains too small: '+size+'px');
  }
  if(name==='home'&&width===1440){
    const actions=page.locator('.hero-contact-icons a');
    if(await actions.count()!==2)problems.push('Hero needs exactly two contact icons');
    if(await actions.first().getAttribute('aria-label')!=='Direct message Mads on Instagram')problems.push('Instagram icon accessible name missing');
    if(!(await actions.nth(1).getAttribute('href'))?.startsWith('sms:'))problems.push('SMS icon target missing');
  }
  if(name==='home'&&width===1440){
    const footer=page.locator('.brand-footer');
    if(await footer.locator('a[href="/weddings/"]').count())problems.push('Footer repeats wedding category');
    if(!await footer.getByText('Handcrafted sweets for every occasion.').count())problems.push('Owner brand copy missing');
    const brandImg=footer.locator('.footer-brand__mark img');
    if(!await brandImg.count()||!(await brandImg.evaluate(el=>el.complete&&el.naturalWidth>0)))problems.push('Original stacked footer brand logo did not load');
    if(await footer.getByText('Help & contact').count())problems.push('Footer should only say Contact');
    if(await footer.locator('.footer-contact-icons a').count()!==2)problems.push('Footer quick message actions missing');
    if(await footer.locator('nav[aria-label="Footer explore"] a').count()!==4)problems.push('Footer Explore should have four links');
    const exploreLinks=await footer.locator('nav[aria-label="Footer explore"] a').evaluateAll(xs=>xs.map(x=>({path:new URL(x.href).pathname,label:x.textContent.trim()})));
    if(exploreLinks.map(x=>x.path).join(',')!=='/cakes/,/decorate-and-sip/,/cake-care/,/pricing/'||exploreLinks.at(-1)?.label!=='Pricing')problems.push('Pricing must be labelled Pricing and appear below Pickup & care');
    if(await page.locator('.brand-links a[href="/pricing/"]').count())problems.push('Pricing should not appear in top desktop navigation');
    if(await page.locator('.mobile-site-menu__primary a[href="/pricing/"]').count())problems.push('Pricing should not appear in mobile primary navigation');
    if(await footer.locator('nav[aria-label="Footer contact"] a').count()!==1)problems.push('Footer Contact needs one text link and two icons');
    if(!await footer.locator('a[aria-label="DM on Instagram"]').count())problems.push('DM icon label missing');
    if(!await footer.locator('a[aria-label="Text 0425 819 951"]').count())problems.push('SMS icon label missing');
    if((await footer.textContent()).includes('Custom cakes by enquiry only'))problems.push('Old footer disclaimer remains');
    if(!(await page.locator('main').textContent()).includes('Your idea. Mads’ craft.'))problems.push('Mads personal homepage copy missing');
    if(!await page.locator('.contact-strip .btn[data-ig-contact]').count())problems.push('Instagram action missing');
    if(!await page.locator('.contact-strip .btn[data-mobile-link]').count())problems.push('SMS action missing');
  }


  // Visual hierarchy regression guard; previous checks covered overflow but
  // not inconsistent H1/H2/H3 relationships or intro/body typography.
  const type=await page.evaluate(()=>{
    const px=selector=>{const el=document.querySelector(selector);return el?parseFloat(getComputedStyle(el).fontSize):null};
    return {
      h1:px('main h1'),eyebrow:px('main .eyebrow'),copy:px('main .copy'),
      pricingH2:px('main .pricing-body > h2.section-title'),
      pricingH3:px('main .pricing-panel h3'),
      pricingCopy:px('main .pricing-intro-copy'),
      priceNote:px('main .pricing-source-note')
    };
  });
  const near=(x,y)=>x!==null&&Math.abs(x-y)<1.3;
  const mobileExpected=width===320?{page:38,hero:50,h2:30,h3:23}:{page:40,hero:54,h2:32,h3:24};
  if(width<=390){
    if(!near(type.eyebrow,11))problems.push('Eyebrow scale drift: '+type.eyebrow);
    if(name==='home'){
      if(!near(type.h1,mobileExpected.hero))problems.push('Homepage H1 scale drift: '+type.h1);
    }else if(name==='sip'){
      if(type.h1<28||type.h1>36)problems.push('Constrained Sip H1 scale drift: '+type.h1);
    }else if(name!=='notfound'){
      if(!near(type.h1,mobileExpected.page))problems.push('Interior page H1 scale drift: '+type.h1);
    }
    if(type.copy!==null&&name!=='sip'&&!near(type.copy,16))problems.push('Body intro scale drift: '+type.copy);
  }
  if(name==='pricing'){
    const h1=type.h1,h2=type.pricingH2,h3=type.pricingH3;
    if(h1===null||h2===null||h3===null||!(h1>h2&&h2>h3))
      problems.push('Pricing title hierarchy wrong (must be H1 > H2 > H3): '+[h1,h2,h3].join('/'));
    if(width<=390){
      if(!near(h2,mobileExpected.h2)||!near(h3,mobileExpected.h3))
        problems.push('Mobile pricing type tokens drift: '+[h2,h3].join('/'));
      if(!near(type.pricingCopy,16)||!near(type.priceNote,14))
        problems.push('Pricing descriptive font mismatch: '+[type.pricingCopy,type.priceNote].join('/'));
    }
  }


  if(name==='home'&&!(await page.locator('main').textContent()).includes('Every cake is handcrafted for your occasion'))
    problems.push('Homepage bespoke-service copy must be positive');
  if(name==='pricing'){
    const note=await page.locator('.pricing-source-note').textContent();
    if(note.includes('October 2025')||!note.includes('Prices are a guide'))
      problems.push('Pricing must not expose internal brand-guide dates and must clarify quote variability');
  }
  if(name==='contact'){
    if((await page.locator('main').textContent()).includes("website orders and bookings aren't available"))
      problems.push('Contact page still uses negative platform copy');
  }
  if(width<=650){
    const stickyCount=await page.locator('.mobile-contact-bar').count();
    if(name==='contact'){
      if(stickyCount)problems.push('Contact page duplicates mobile sticky buttons');
      if(!await page.locator('.enquire-page .page-hero .btns').isVisible())
        problems.push('Dedicated contact page actions must remain visible on mobile');
    }else if(!stickyCount)problems.push('Browsing pages must retain accessible sticky contact actions');
    if(await page.locator('.contact-strip').count()){
      if(await page.locator('.contact-strip__inner > div:last-child').isVisible())
        problems.push('Mobile closing band duplicates sticky contact actions');
    }
  }else if(await page.locator('.contact-strip').count()){
    if(!await page.locator('.contact-strip .btns').isVisible())
      problems.push('Desktop contact band must retain direct enquiry buttons');
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
   if(!await page.locator('#gallery-count').textContent().then(s=>s.includes('of 6 ')))problems.push('Weddings subset not 6');
   await page.locator('#gallery-filters [data-filter="celebrations"]').click();
   if(!await page.locator('#gallery-count').textContent().then(s=>s.includes('of 24 ')))problems.push('Celebrations subset not 24');
   await page.locator('#gallery-filters [data-filter="tiramisu"]').click();
   if(!await page.locator('#gallery-count').textContent().then(s=>s.includes('of 2 ')))problems.push('Tiramisu subset not 2');
   await page.locator('#gallery-filters [data-filter="all"]').click();
   await page.locator('#gallery-show-more').click();
   if(await page.locator('.gallery-card').count()!==24)problems.push('Show more not revealing additional 12');
  }
  if(name==='all'&&width===390){
    await page.goto(BASE+'/cakes/?filter=weddings',{waitUntil:'domcontentloaded',timeout:25000});
    await page.locator('.gallery-card').first().waitFor({timeout:18000});
    const state=await page.locator('#gallery-filters [data-filter="weddings"]').getAttribute('aria-pressed');
    const text=await page.locator('#gallery-count').textContent();
    if(state!=='true'||!text.includes('of 6 '))problems.push('Weddings gallery shortcut must deep-link to 6 filtered designs');
  }
  if(name==='care'){
    const guide=await page.locator('main').textContent();
    for(const phrase of ['passenger-side floor','Temperature matters','Once you’re home','approximately 1–2 hours','A final little reminder'])if(!guide.includes(phrase))problems.push('Owner care text missing: '+phrase);
    if(await page.locator('.care-panel').count()!==4)problems.push('Care guide must have four content panels');
    const careIcons=await page.locator('.care-panel__icon').evaluateAll(xs=>xs.map(el=>({kind:el.dataset.icon,svg:!!el.querySelector('svg')})));
    if(careIcons.length!==4||careIcons.some(c=>!c.svg)||careIcons.map(c=>c.kind).join(',')!=='transport,temperature,refrigeration,heart')
      problems.push('Care guide requires four consistent single-colour SVG icons');
    const separators=await page.locator('.care-bullets li').evaluateAll(xs=>xs.map(el=>getComputedStyle(el).borderTopWidth));
    if(separators.some(x=>x!=='0px'))problems.push('Care bullet list should not have row dividers');
  }
  if(name==='pricing'){
   const pricingPanels=await page.locator('.pricing-panel').evaluateAll(xs=>xs.map(el=>({top:getComputedStyle(el).borderTopWidth,left:getComputedStyle(el).borderLeftWidth,right:getComputedStyle(el).borderRightWidth})));
   if(pricingPanels.some(p=>p.left!=='0px'||p.right!=='0px'||p.top==='0px'))problems.push('Pricing must use paper-inspired horizontal rules instead of boxed panels');
   const rows=await page.locator('.pricing-table tbody tr').count();
   if(rows!==11)problems.push('Pricing page must show 5 cake sizes and 6 additions');
   if(!await page.locator('.pricing-source-note').count())problems.push('Pricing source provenance missing');
  }
  if(name==='tiramisu'&&width===390){
    if(await page.locator('.gallery-card').count()!==2)problems.push('Custom and original tiramisu both expected');
  }
  if(name==='celebrations'&&width===390&&await page.locator('#gallery-filters:visible').count())problems.push('Celebration page should not expose duplicate subcategories');
  if(['home','all','care','weddings','celebrations','tiramisu'].includes(name)&&width===390){
    if(await page.locator('img.contact-signature').count())problems.push('Unapproved reconstructed signature still shown');
  }
  if(name==='sip'){
    if(!await page.locator('.decorate-story__grid').count())problems.push('Workshop story image/copy grid missing');
    if(await page.locator('.photo-composition--single').count())problems.push('Legacy sparse workshop photo layout remains');
  }
  if(await page.locator('.contact-strip').count()===1){
    const gap=await page.evaluate(()=>{
      const contact=document.querySelector('.contact-strip'),foot=document.querySelector('.brand-footer');
      return Math.round(foot.getBoundingClientRect().top-contact.getBoundingClientRect().bottom);
    });
    if(gap>4)problems.push('Excess whitespace between contact section and footer: '+gap+'px');
  }
  if(width<=390){
    const headingStroke=await page.locator('main h1').evaluate(el=>getComputedStyle(el).webkitTextStrokeWidth);
    if(!headingStroke||Number.parseFloat(headingStroke)<.65)problems.push('Brand display hairlines need stronger legibility treatment');
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
else console.log('OWNER REVIEW QA PASS: 11 pages x 4 widths; six gallery filters; staged reveal; direct message and mobile contact; no broken imagery.');
