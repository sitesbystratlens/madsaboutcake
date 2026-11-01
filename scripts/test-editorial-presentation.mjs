#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const db=JSON.parse(read('cakes.json'));
const brand=read('assets/brand-site.css'),site=read('assets/brand-site.js');
const pages=['index.html','weddings/index.html','celebrations/index.html','tiramisu-cakes/index.html','decorate-and-sip/index.html','cake-care/index.html','cakes/index.html','enquire/index.html','about/index.html','404.html'];
const chosen=db.cakes.filter(c=>c.featured30);
const wedding=chosen.filter(c=>c.primaryOccasion==='Weddings & engagements'||(c.otherOccasions||[]).includes('Weddings & engagements'));
const tir=chosen.filter(c=>/tiramisu/i.test([c.title,c.shortDescription,c.captionEvidence].join(' ')));
const celebrations=chosen.filter(c=>!wedding.includes(c)&&!tir.includes(c));
assert.equal(chosen.length,120,'Keep owner-selected 120 photo entries');
assert.equal(wedding.length,9,'Weddings must retain nine selected designs');
assert.equal(tir.length,1,'Only one tiramisu post verified by caption; do not invent extras');
assert.equal(celebrations.length,110,'Celebrations include all other creations, without loss');
assert(brand.includes('#9A2849')&&brand.includes('#F6F4F0'),'Use exact brand hexes from PDF');
for(const font of ['Perandory Condensed','Amorea','Amsterdam Four','Helvetica Now Display'])assert(brand.includes(font),'Named brand font missing: '+font);
assert(!brand.includes('#fedcde')&&!brand.includes('#f15ea0'),'Legacy blush/pink must not return to public layout');
assert(read('assets/brand/wordmark-set-2.svg').includes('data:image/webp;base64,'),'Use actual wordmark artwork extracted from brand guide');
assert(read('assets/brand/monogram-set-2.svg').includes('data:image/webp;base64,'),'Use actual monogram artwork extracted from brand guide');
assert(site.includes("const PHONE=''"),'Phone must not be guessed');
assert(site.includes('data-mobile-pending')||site.includes('[data-mobile-pending]'),'Owner missing phone must be disclosed, not fake linked');
assert(!/add to cart|checkout|select a date|book now/i.test(site),'No automated orders or bookings');
assert(site.includes('category=c=>isTiramisu(c)'),'Tiramisu classification missing');
assert(site.includes(":'celebrations'"),'Celebration fallback missing');
for(const p of pages){
 const h=read(p);
 assert(h.includes('noindex,nofollow'),'Preview must stay no-indexed: '+p);
 assert(h.includes('brand-site.css?v=20261102-2'),'Branded style not enabled: '+p);
 assert(h.includes('brand-site.js?v=20261102-1'),'Branded browser logic not enabled: '+p);
 assert(h.includes('/assets/brand/wordmark-set-2.svg'),'Official logo missing on: '+p);
 assert(h.includes('href="/cake-care/"')&&h.includes('href="/weddings/"')&&h.includes('href="/celebrations/"')&&h.includes('href="/tiramisu-cakes/"')&&h.includes('href="/decorate-and-sip/"'),'Category or care navigation missing: '+p);
 assert(h.includes('https://www.instagram.com/madsaboutcake/'),'Manual Instagram enquiry missing on '+p);
 assert(h.includes('<main id="main">'),'Semantic main content missing '+p);
 assert(h.includes('<h1'),'Page heading missing '+p);
}
for(const path of ['weddings/index.html','celebrations/index.html','tiramisu-cakes/index.html']){
 const h=read(path);
 assert(h.includes('data-gallery='),'Filtered original creation grid missing '+path);
 assert(h.includes('data-mobile-link hidden'),'Phone placeholder must never be a fabricated tel link '+path);
}
const home=read('index.html');
assert((home.match(/class="category-card"/g)||[]).length===4,'Four main category tiles required');
assert(home.includes('Message')||home.includes('Enquire on Instagram'),'Hero manual contact CTA missing');
assert(!home.includes('Say it with cake.'),'Old homepage not replaced');
const workshop=read('decorate-and-sip/index.html');
assert(workshop.includes('DSR06gjEgJK-no-visible-faces.webp')&&workshop.includes('DHDXe4EB9Le-cupcake-edition.webp'),'Verified past workshop pictures missing');
const care=read('cake-care/index.html');
for(const fragment of ['passenger-side floor','lap','support it from underneath','squeezing the sides'])assert(care.includes(fragment),'Owner care text incomplete: '+fragment);
assert(!/fridge|refrigerat|room.temperature|store for/i.test(care),'Do not invent storage directions absent from owner text');
const contact=read('enquire/index.html');
assert(!contact.includes('<form'),'No online booking or order form');
assert(contact.includes('availability')&&contact.includes('Message on Instagram'),'Manual enquiry journey needed');
for(const c of chosen)assert(fs.existsSync(c.coverImage),'Missing original creation image '+c.coverImage);
console.log('BRAND SITE PASS: exact crimson/cream, official logo, four categories, 120 source creations, manual contact and owner-supplied cake-care text.');
