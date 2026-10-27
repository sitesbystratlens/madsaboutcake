#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=(p)=>fs.readFileSync(p,'utf8');
const html=read('index.html');
const css=read('assets/home-v3.css');
const base=read('assets/site.css');
const script=read('assets/site.js');
const portfolio=JSON.parse(read('cakes.json')).cakes;
const main=html.split('<main id="main"')[1]?.split('</main>')[0];
assert(main,'No V3 homepage content');
assert(html.includes('v3-lookbook-20261028'),'Homepage is not V3');
assert(html.includes('noindex,nofollow'),'Owner concept must remain noindexed');
assert(html.includes('/assets/home-v3.css?v=20261028-v3'),'V3 CSS missing or stale');
assert(main.includes('class="cake-showcase"'),'Full-cake lookbook missing');
assert(!/class="(?:v2-hero|editorial-hero|studio-hero)"/.test(main),'Generic split hero still present');
assert(main.includes('id="occasions"'),'Broken occasions header link');
assert(main.includes('data-home-occasions'),'Occasion menu unbound');
assert(!main.includes('images.pexels.com'),'Stock photo found');
assert(!main.includes('data-curated-src='),'Unexpected delayed photo replacement');
const images=[...main.matchAll(/<img\b[^>]*src="(\/assets\/creations\/[^"]+\.webp)"/g)].map(m=>m[1]);
assert.equal(images.length,10,'V3 requires ten selected photographs');
assert.equal(new Set(images).size,10,'Duplicate homepage photograph');
const chosen=['DauWQoCkuB1','DKLsLPThQcx','DNKl7y9BcgU','DPaoBCZkl_W','DJjIJNxB1ap','DQ0WjCPEgqr','DINfRR_BzYm','DEtTLWXBBce','C8JF0_IyYGt','DWv0b5kkrWE'];
const byPath=new Map(portfolio.map(c=>['/'+c.coverImage,c]));
assert.deepEqual(images.map(x=>byPath.get(x)?.sourceShortcode).sort(),chosen.sort(),'Image selection drifted');
for(const p of images){
 const f=p.slice(1);
 assert(fs.existsSync(f),'Missing cake photograph: '+p);
 const buffer=fs.readFileSync(f);
 assert.equal(buffer.toString('ascii',0,4),'RIFF','Invalid WebP header: '+p);
 assert.equal(buffer.toString('ascii',8,12),'WEBP','Invalid WebP media: '+p);
}
assert.equal((main.match(/<section\b/g)||[]).length,5,'V3 must have five intentional sections');
assert(main.includes('https://www.instagram.com/p/DF9zz10BNtL/'),'Real Decorate & Sip session link missing');
assert(css.includes('object-fit:contain'),'Missing full-cake image-fit rule');
assert(css.includes('--v3-peach:#ffdddc'),'Logo-derived peach is missing');
assert(css.includes('@media(max-width:800px)'),'Mobile presentation missing');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'V3 CSS unbalanced');
assert.equal((base.match(/\{/g)||[]).length,(base.match(/\}/g)||[]).length,'Base CSS unbalanced');
for(const name of ['index.html','about/index.html','cakes/index.html','decorate-and-sip/index.html','enquire/index.html','404.html']){
 assert(read(name).includes('home-v3.css'),'V3 theme absent on '+name);
}
for(const record of portfolio)assert(fs.existsSync(record.coverImage),'Missing creation: '+record.id);
assert(script.includes('data-home-occasions'),'Occasion filtering not supported');
console.log('V3 PASS: lookbook, ten distinct actual cake images, whole-cake fit, five sections, live category targets, sitewide branding.');
