#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const html=read('index.html');
const css=read('assets/home-v2.css');
const baseCSS=read('assets/site.css');
const catalogue=JSON.parse(read('cakes.json')).cakes;
const main=html.split('<main id="main"')[1]?.split('</main>')[0];
assert(main,'V2 homepage missing');
assert(html.includes('mads-layout-version" content="v2-cake-studio-20261027"'),'Missing V2 version marker');
assert(html.includes('name="robots" content="noindex,nofollow"'),'Concept must remain noindexed');
assert(html.includes('home-v2.css?v=20261027-v2'),'Missing cache-busted V2 stylesheet');
assert(html.includes('href="/#occasions"'),'Missing occasion navigation');
assert(!main.includes('images.pexels.com'),'Stock photography on homepage');
assert(!main.includes('data-curated-src='),'Delayed JavaScript photo swapping is prohibited');
const photos=[...main.matchAll(/<img\b[^>]*\bsrc="(\/assets\/creations\/[^"]+\.webp)"/g)].map(m=>m[1]);
assert.equal(photos.length,10,'V2 must use precisely 10 purpose-selected photographs');
assert.equal(new Set(photos).size,10,'Homepage duplicated a cake photo');
const expected=[
'DIh_oHjBhxN','DLwgsy0BGLv','C8JF0_IyYGt',
'DPLsqIzkpHn','DJjIJNxB1ap','DQ0WjCPEgqr','DINfRR_BzYm',
'DKLsLPThQcx','DL49HXIhTeY','DJQ5RLthPKp'
];
const codes=new Set(catalogue.filter(c=>photos.includes('/'+c.coverImage)).map(c=>c.sourceShortcode));
assert.deepEqual([...codes].sort(),[...expected].sort(),'Wrong image assignment for V2');
for(const photo of photos){
 const path=photo.slice(1);
 assert(fs.existsSync(path),'Missing photo '+path);
 const buf=fs.readFileSync(path);
 assert(buf.length>4000,'Empty photo '+path);
 assert.equal(buf.toString('ascii',0,4),'RIFF','Invalid WebP '+path);
 assert.equal(buf.toString('ascii',8,12),'WEBP','Invalid WebP '+path);
}
assert.equal((main.match(/<section\b/g)||[]).length,6,'V2 must use six editorial acts');
assert(main.includes('id="occasions"'),'Missing occasion anchor');
assert(main.includes('/cakes/?product=cake')&&main.includes('/cakes/?product=cupcakes'),'Missing product entries');
for(const filter of ['Birthdays','Weddings%20%26%20Engagements','Baby%20Showers%20%26%20Gender%20Reveals','Anniversaries']){
 assert(main.includes('occasion='+filter),'Missing occasion: '+filter);
}
for(const m of main.matchAll(/\/cakes\/\?design=([^"]+)/g))
 assert(catalogue.some(c=>c.id===decodeURIComponent(m[1])),'Broken design detail: '+m[1]);
assert(main.includes('https://www.instagram.com/p/DF9zz10BNtL/'),'Missing genuine session evidence');
assert(!main.includes('gallery-card__feature'),'No unverified popularity badges');
assert(css.includes('--m2-peach:#ffdddc')&&css.includes('.brand-logo'),'Logo branding lost');
for(const style of [css,baseCSS])assert.equal((style.match(/\{/g)||[]).length,(style.match(/\}/g)||[]).length,'Unbalanced stylesheet');
for(const p of ['index.html','cakes/index.html','about/index.html','decorate-and-sip/index.html','enquire/index.html','404.html']){
 const page=read(p);
 assert(page.includes('home-v2.css'),'Missing shared brand CSS: '+p);
 assert(page.includes('v2-footer-brand'),'Footer missing branded lockup: '+p);
 assert(page.includes('href="/#occasions"'),'Missing occasion nav: '+p);
}
for(const creation of catalogue){
 assert(fs.existsSync(creation.coverImage),'Gallery photo missing: '+creation.coverImage);
}
console.log('V2 PASS — 6 acts, 10 unique authentic photographs, 33 gallery assets, filters, noindex and sitewide logo.');
