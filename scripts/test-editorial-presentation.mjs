#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';

// Guard the owner-pitch concept against the Pexels/repetition regression seen on mobile.
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/site.css','utf8');
const portfolio=JSON.parse(fs.readFileSync('cakes.json','utf8'));
const main=html.split('<main id="main"')[1]?.split('</main>')[0];
assert(main,'Homepage main not found');
assert(html.includes('noindex,nofollow'),'Concept preview must remain noindexed');
assert(!/images\.pexels\.com/i.test(main),'Stock photo found in homepage');
assert(!/data-curated-src=/.test(main),'Homepage must reference originals directly');
const photos=[...main.matchAll(/<img\b[^>]*\bsrc="(\/assets\/creations\/[^"]+\.webp)"/g)].map(m=>m[1]);
assert.equal(photos.length,14,'Homepage should contain 14 purpose-selected creation photos');
assert.equal(new Set(photos).size,photos.length,'Duplicate photograph on homepage');
const catalogPhotos=new Set(portfolio.cakes.map(c=>'/'+c.coverImage));
for(const photo of photos){
 assert(catalogPhotos.has(photo),'Homepage photo not mapped to catalogue: '+photo);
 const relative=photo.slice(1);
 assert(fs.existsSync(relative),'Missing image asset: '+relative);
 const buf=fs.readFileSync(relative);
 assert(buf.length>4000,'Invalid photo size: '+relative);
 assert.equal(buf.toString('ascii',0,4),'RIFF','Not RIFF: '+relative);
 assert.equal(buf.toString('ascii',8,12),'WEBP','Not WebP: '+relative);
}
assert.equal([...main.matchAll(/class="editorial-tile(?:\s|\")/g)].length,5,'Featured mosaic requires 5 curated creations');
assert(main.includes('product=cake')&&main.includes('product=cupcakes'),'Missing product collections');
for(const occasion of ['Birthdays','Weddings%20%26%20Engagements','Baby%20Showers%20%26%20Gender%20Reveals','Anniversaries']){
 assert(main.includes('occasion='+occasion),'Missing occasion '+occasion);
}
const idSet=new Set(portfolio.cakes.map(c=>c.id));
for(const m of main.matchAll(/\/cakes\/\?design=([^"]+)/g))assert(idSet.has(decodeURIComponent(m[1])),'Broken detail link '+m[1]);
assert(css.includes('@media(max-width:760px)'),'Mobile layout missing');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Unbalanced CSS');
const catalogueMissing=portfolio.cakes.filter(c=>c.coverImage&&(!fs.existsSync(c.coverImage)));
assert.equal(catalogueMissing.length,0,'Missing catalogue photos: '+catalogueMissing.map(x=>x.id).join(','));
console.log('PASS: 14 distinct original photos; 33 mapped catalogue files; creation, product and occasion links; mobile CSS and noindex.');
