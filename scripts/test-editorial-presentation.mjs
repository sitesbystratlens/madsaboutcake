#!/usr/bin/env node
import fs from 'node:fs';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const site=read('assets/site.js'),css=read('assets/home-v3.css'),base=read('assets/site.css');
const data=JSON.parse(read('cakes.json')),notice=JSON.parse(read('assets/studio-notices.json'));
const pages=['index.html','cakes/index.html','decorate-and-sip/index.html','about/index.html','enquire/index.html','404.html'];
assert(data.cakes.length>=33);
const featured=data.cakes.filter(c=>c.featured30===true);
assert.equal(featured.length,30,'30 original Instagram designs expected');
assert.equal(new Set(featured.map(c=>c.sourceShortcode)).size,30,'One selection per source post');
for(const [category,count] of Object.entries({'Birthdays':6,'Weddings & engagements':4,'Baby celebrations':4,'Love & anniversaries':5,'Other/unspecified':11}))assert.equal(featured.filter(c=>c.featureCategory===category).length,count,'Wrong selected category count '+category);
assert(featured.every(c=>c.coverImage.startsWith('assets/gallery-30/')),'Curated photos must be local hosted original derivatives');
assert(featured.every(c=>typeof c.captionEvidence==='string'&&c.captionEvidence.trim().length>10),'Each featured cake needs an original-caption evidence field');
assert(featured.every(c=>typeof c.descriptionBasis==='string'&&c.descriptionBasis.includes('Instagram post description')),'Every featured summary must cite the owner caption');
const valentine=featured.find(c=>c.sourceShortcode==='DGM5hj1hcJf');
assert(valentine?.coverImage==='assets/gallery-30/DGM5hj1hcJf-M259.webp'&&valentine.sourcePhotoRank===3,'Must use complete cake photograph from same Instagram carousel');

assert.equal(new Set(data.cakes.map(c=>c.sourceShortcode)).size,data.cakes.length,'Duplicate post in combined gallery and legacy catalogue');
assert.equal(data.meta.mode,'concept-preview');
assert(data.cakes.every(c=>c.showOnWebsite==='No'),'Owner photos should remain unapproved');
assert(!featured.some(c=>c.sourceShortcode==='DQ0WjCPEgqr')&&data.cakes.find(c=>c.sourceShortcode==='DQ0WjCPEgqr')?.demoVisible===false,'Licensed character must be hidden from the preview gallery');
assert(data.cakes.every(c=>!(/independent website concept/i.test(c.shortDescription+' '+c.alt))),'Internal catalogue text');
for(const code of ['DNKl7y9BcgU','DPLhTN5kgDE']){const c=data.cakes.find(x=>x.sourceShortcode===code);assert(c&&!/(first|ninth)[- ]birthday/i.test(c.alt),'Unsupported age in alt text '+code);}
assert(site.includes("PUBLIC_OCCASIONS=['Birthdays','Weddings & engagements','Baby celebrations','Love & anniversaries']"));
assert(site.includes('const listed=concept?records.filter(c=>c.featured30===true):records'),'Preview list must use 25 selected posts while production supports approved records');
assert(site.includes('loadDesignFromQuery(form,params)'),'Design reference lookup absent');
assert(site.includes('data.show!==true')&&notice.show===false&&notice.message==='','Unapproved closure banner');
assert(site.includes('melbourneToday>expires'),'Notice expiry missing');
assert(JSON.parse(read('assets/enquiry-settings.json')).formspreeEndpoint==='','Unapproved contact destination');
assert(site.includes('if(!response.ok)throw'),'Form success not checked');
assert(site.includes("the contact form isn't connected yet"),'Preview disclosure absent');
assert(!site.includes('images.pexels.com'),'Stock-photo fallback');
assert(css.includes('mix-blend-mode:normal;filter:none'),'Logo blending not corrected');
assert(css.includes('background:var(--v3-ink);color:#fff'),'Banner should be plum');
assert(css.includes('color:#a53265')&&css.includes('border-color:#9b7a88'),'Contrast tokens absent');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'CSS brackets mismatch');
assert.equal((base.match(/\{/g)||[]).length,(base.match(/\}/g)||[]).length,'Base CSS brackets mismatch');
for(const p of pages){
 const html=read(p);
 assert(html.includes('noindex,nofollow'),'Preview indexed: '+p);
 assert(html.includes('data-studio-announcement role="note" hidden'),'Closure exposed before JS: '+p);
 assert(html.includes('mads-main-nav'),'Nav absent '+p);
 const nav=html.match(/<nav class="mads-main-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1]||'';
 assert.equal((nav.match(/<a\s/g)||[]).length,3,'Primary navigation should have exactly 3 links: '+p);
 assert(!nav.includes('href="/about/"'),'About should live in the footer rather than top navigation: '+p);
 assert(nav.includes('href="/cakes/"')&&nav.includes('href="/decorate-and-sip/"')&&nav.includes('href="/enquire/"'),'Primary navigation destinations missing '+p);
 assert(nav.includes('>Contact us</a>'),'Contact navigation label should match owner wording '+p);
 assert(!nav.includes('>Enquire</a>'),'Formal contact label should not appear in header '+p);
 assert(html.includes('href="/about/"'),'About footer link must remain available: '+p);

 assert(html.includes('home-v3.css?v=20261030-refine1')&&html.includes('site.js?v=20261030-refine1'),'Cache version stale '+p);
 assert(html.includes('href="https://www.stratlens.com/websites/"'),'Footer credit link wrong '+p);
 assert(!html.includes('made for meaningful moments'),'Generic footer '+p);
}
const homeCss=read('assets/home-v3.css');
const home=read('index.html'),gallery=read('cakes/index.html'),workshop=read('decorate-and-sip/index.html'),enquire=read('enquire/index.html');
assert(home.includes('Say it with cake.')&&home.includes('What are we <i>celebrating?</i>'),'Homepage headings changed');
assert(css.includes('.workshop-hero .workshop-hero__copy h1 .workshop-hero__accent'),'Workshop pink accent missing');
assert(workshop.includes('class="workshop-hero__accent"'),'Workshop headline must have accented & Sip');
assert(css.includes('.workshop-inclusions .workshop-detail__num'),'Workshop numbered steps not emphasised');
assert(site.includes('root.dataset.visibleCount=String(count);'),'Gallery count must drive balanced 2×2 grid');
assert(css.includes('.gallery-grid[data-visible-count="4"]'),'Four-card filtered gallery layout missing');
assert(homeCss.includes('.occasion .section-head h2{font-size:clamp(49px,4.1vw,66px);white-space:nowrap}'),'Desktop occasion heading should be single line');

assert(!home.includes('CUSTOM CAKES &amp; CUPCAKES · MELBOURNE'),'Homepage repeated the navigation category in an eyebrow');
const opening=home.match(/<section class="opening">([\s\S]*?)<div class="cake-showcase">/)?.[1]||'';
assert((opening.match(/class="action-solid"/g)||[]).length===1,'Hero should have one primary action');
assert(!opening.includes('class="action-line"')&&!opening.includes('>Enquire ↗</a>'),'Hero duplicates Enquire already in main navigation');
assert(home.includes('href="/#cake-enquiry"')===false,'Legacy same-page Enquire hero link remains');

assert(home.includes('Got an idea?')&&home.includes('Let’s hear it.'),'Owner-preferred headings changed');
for(const p of ['index.html','enquire/index.html']){
 const formPage=read(p);
 assert(formPage.includes('What can we help with?'),'Contact form still uses formal enquiry wording: '+p);
 assert(formPage.includes('Send message ↗'),'Contact form CTA not updated: '+p);
 assert(!formPage.includes('Send enquiry ↗')&&!formPage.includes("What's your enquiry about?"),'Old formal contact labels remain: '+p);
}
assert(site.includes("submit.textContent='Send message ↗'"),'Contact submit button reset text stale');
assert(!home.includes('BIRTHDAYS, BIG DAYS & MORE'),'Redundant occasion eyebrow remains');
assert(!workshop.includes('FROM A REAL SESSION')&&!workshop.includes('HENS PARTIES · BIRTHDAYS · GROUP SESSIONS'),'Redundant session labels remain');

assert(home.includes('DIiAw_lBkM1')&&home.includes('See a session clip ↗'),'Homepage short session clip link missing');
assert(workshop.includes('DSR06gjEgJK-hens-setup.webp')&&workshop.includes('DHDXe4EB9Le-cupcake-edition.webp'),'Original session photographs missing');
assert(workshop.includes('href="https://www.instagram.com/p/DSR06gjEgJK/"'),'Main session photo not linked to its original post');
assert((workshop.match(/See a session clip/g)||[]).length===1,'One accurate session-video CTA expected');
assert(!workshop.includes('FROM A REAL SESSION')&&!workshop.includes('HENS PARTIES · BIRTHDAYS · GROUP SESSIONS'),'Redundant workshop header labels remain');
assert(workshop.includes('See a short clip from a Decorate &amp; Sip group session on Instagram'),'Session clip accessible description missing');
assert(!workshop.includes('studio-session-media')&&!workshop.includes('studio-group-invite'),'Text-only workshop placeholders remain');
assert(fs.existsSync('assets/workshops/DSR06gjEgJK-hens-setup.webp')&&fs.existsSync('assets/workshops/DHDXe4EB9Le-cupcake-edition.webp'),'Workshop images not installed');


const codes=['DGM5hj1hcJf','DJQ5RLthPKp','DP-QFm2EhMp'];
const winners=[
 ['Birthdays','DA-B4huhKQ4'],
 ['Weddings & engagements','DJjIJNxB1ap'],
 ['Baby celebrations','DQYyHi-kn6R'],
 ['Love & anniversaries','DWvn4Nekv8Z']
];
const byCode=new Map(featured.map(c=>[c.sourceShortcode,c]));
for(const code of codes){
 const c=byCode.get(code);
 assert(c,'Hero source is not in the featured 25: '+code);
 assert(home.includes('href="/cakes/?design='+c.id+'"'),'Hero has incorrect gallery detail link: '+code);
 assert(home.includes(code),'Hero must continue to reference the original selected design: '+code);
}
for(const [category,code] of winners){
 const c=byCode.get(code);
 assert(c?.featureCategory===category,'Wrong occasion for winner '+code);
 assert(home.includes(code),'Homepage occasion winner missing: '+code);
}
assert(home.includes('v3-16-full-view-caption-led-homepage-20261028'),'Current homepage version marker missing');
assert(!home.includes('DGM5hj1hcJf-M258.webp'),'Zoomed-in Valentine crop still on landing page');
assert(home.includes('DGM5hj1hcJf-M259.webp'),'Full view Valentine photograph missing on homepage');
assert(home.includes('Valentine’s minis with strawberries.')&&home.includes('Garden party ready.')&&home.includes('Hand-cut wafer paper.'),'Homepage cake microcopy must summarise real post captions');
assert(home.includes('Matched to the birthday dress'),"Birthday occasion copy must be grounded in the owner's words");

assert(!home.includes('DauWQoCkuB1'),'Explicit cake must not return to homepage');
assert(!home.includes('DQ0WjCPEgqr'),'Licensed character photo must not appear on the homepage');
assert(css.includes('.mads-v3 .look-left .look-img img,')&&css.includes('object-fit:contain;object-position:center;background:transparent'),'Hero image framing must be full-cake / no zoom');
assert(home.includes('edit-photo-frame--gold')&&home.includes('edit-photo-frame--butterfly')&&home.includes('edit-photo-frame--garden'),'Detail photographs must be deliberately cropped');
assert(!read('about/index.html').includes('<div class="about-photo"><img src="/assets/creations/02_pink-ribbon'),'About repeats homepage hero');
assert(read('about/index.html').includes('21_red-rose-celebration-cake_DLJrSt0BmNc.webp'),'About opening must show piped buttercream roses');
assert(css.includes('.mads-v3 .occ-love .occ-img img{object-fit:cover'),'Selective small tile crop missing');
assert(css.includes('.mads-v3 .look-center .look-img img,.mads-v3 .look-right .look-img img{object-fit:contain}'),'Whole hero cakes should stay visible');
assert(css.includes('.mads-v3 .edit-grid .edit-photo-frame{display:block;overflow:hidden'),'Detail photo crop frame missing');
assert(css.includes('.mads-v3 .look-left .look-img{height:clamp(275px,31vw,395px);aspect-ratio:auto}'),'Full-cake left hero framing missing');
assert(css.includes('.gallery-info .gallery-card-actions{display:flex;flex-direction:row;flex-wrap:wrap'),'Gallery tablet overflow layout not fixed');
assert(home.includes('DGM5hj1hcJf-M259.webp')&&home.includes('loading="eager"'),'First hero full-view source or loading attribute missing');
assert(home.includes('DJjIJNxB1ap-M324.webp'),'Engagement-ranked wedding photo missing');
assert(data.cakes.find(c=>c.sourceShortcode==='DauWQoCkuB1')?.demoVisible===false,'Explicit novelty cake remains visible in preview gallery');
assert(!workshop.includes('DRjMFHikhm-')&&!workshop.includes('DauWQoCkuB1'),'Unrelated product photos on workshop page');
assert(!gallery.includes('id="style-filter"'),'Style filter still public');
assert(gallery.includes('gallery-compact__toolbar')&&gallery.includes('gallery-compact__head'),'Gallery header not consolidated');
assert(!gallery.includes('<p class="eyebrow">CAKES &amp; CUPCAKES</p>'),'Repeated gallery eyebrow still present');
assert(gallery.includes('A little inspiration from past creations.'),'Gallery description should be concise and in the studio voice');
assert(!gallery.includes('Mads’ past creations'),'Gallery intro still repeats Mads');
const galleryNav=gallery.match(/<nav class="mads-main-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1]||'';
assert(galleryNav.includes('class="nav-short">Cakes</span>')&&galleryNav.includes('class="nav-long">Cakes &amp; cupcakes</span>'),'Keep concise mobile nav that includes cupcakes on desktop');

assert(data.cakes.every(c=>typeof c.instagramUrl==='string'&&/^https:\/\/www\.instagram\.com\/(?:p|reel)\/[\w-]+\/?$/.test(c.instagramUrl)),'Every catalogue design should retain its original Instagram URL');
const cardMarkup=site.slice(site.indexOf('function cardHtml(c){'),site.indexOf('function showDesign(c,concept){'));
assert(cardMarkup.includes('gallery-photo__arrow')&&cardMarkup.includes('gallery-title-link'),'Gallery photos and titles must link to the design');
assert(!cardMarkup.includes('gallery-card-actions')&&!cardMarkup.includes('Ask about this design')&&!cardMarkup.includes('View design ↗'),'Repeated gallery actions must be removed');
const detailMarkup=site.slice(site.indexOf('function showDesign(c,concept){'),site.indexOf('function initGallery(records,concept){'));
assert(detailMarkup.includes('design-instagram-link')&&detailMarkup.includes('originalPost')&&detailMarkup.includes('noopener noreferrer'),'Original Instagram link missing from design drill through');
assert(detailMarkup.includes('Ask about this design →'),'Enquiry must stay inside the detail page');
assert(base.includes('.gallery-photo__arrow')&&base.includes('.design-instagram-link'),'Gallery link styling missing');
assert(pages.every(p=>read(p).includes('site.css?v=20261030-refine1')&&read(p).includes('site.js?v=20261030-refine1')),'Shared gallery-30 assets not cache-busted');
const faqMarkup=workshop.match(/<div class="faq-list">([\s\S]*?)<\/div>/)?.[1]||'';
assert.equal((faqMarkup.match(/<details>/g)||[]).length,4,'Four clear workshop FAQs expected');
assert(!/\bMads\b/.test(faqMarkup),'FAQs should speak as We rather than Mads');
assert(faqMarkup.includes('we’ve hosted private')&&faqMarkup.includes('We’re based in Glen Iris')&&faqMarkup.includes('We’ll confirm exactly')&&faqMarkup.includes('we’ve run a cupcake edition'),'Workshop FAQs should answer plainly in studio voice');

assert(!gallery.includes('class="feature-strip"')&&!gallery.includes('GOT A DESIGN IN MIND?'),'Redundant enquiry section still displayed on gallery/drill-through');
assert(gallery.includes('site.css?v=20261030-refine1')&&workshop.includes('site.css?v=20261030-refine1'),'Gallery-30 stylesheet cache version stale');
assert(workshop.includes('This is lovely! Thank you for hosting us Madara'),'Real guest comment absent from Decorate and Sip');
assert(workshop.includes('https://www.instagram.com/p/DR9AAqlEovY/'),'Guest comment not attributed to original Instagram post');

assert(base.includes('Cake gallery: compact overview')&&base.includes('Decorate & Sip: authentic session photos'),'New gallery/workshop CSS absent');

assert(gallery.includes('<h1>Find a cake'),'Gallery H1 absent');
assert(enquire.includes('<h1 id="enquiry-page-title">Got an idea?</h1>'),'Enquiry heading incorrect');
assert(enquire.includes('<p class="eyebrow">CONTACT US</p>'),'Contact page label should be friendly');
assert(enquire.includes('<title>Contact us | Mads About Cake, Melbourne</title>'),'Contact page title mismatch');
for(const p of ['index.html','enquire/index.html']){
 const html=read(p);
 assert.equal((html.match(/data-studio-enquiry-form/g)||[]).length,1);
 assert.equal((html.match(/<option value="(cake|cupcakes|decorate-and-sip|something-else)"/g)||[]).length,4);
 assert(html.includes('name="designId"')&&html.includes('studio-message-help'),'Design fields absent');
}
for(const c of data.cakes)assert(fs.existsSync(c.coverImage),'Missing photo '+c.coverImage);
console.log('Gallery-30 PASS: 30 image-backed original posts; category minimums, homepage safety and private preview');

assert(featured.every(c=>c.thumbnailImage&&fs.existsSync(c.thumbnailImage)),'Gallery thumbnail missing');
assert(!home.includes('DQ0WjCPEgqr'),'Pooh must not appear on the homepage');
assert(featured.every(c=>c.ownerReviewRequired&&c.showOnWebsite==='No'),'Owner approval gate missing');
