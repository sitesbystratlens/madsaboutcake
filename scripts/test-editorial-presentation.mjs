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
assert(html.includes('v3-2-polish-enquiry-notice-20261028'),'Homepage V3.2 version marker missing');
assert(html.includes('noindex,nofollow'),'Owner concept must remain noindexed');
assert(html.includes('/assets/home-v3.css?v=20261028-v32'),'V3.2 CSS missing or stale');
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
assert(css.includes('--v3-peach:#fedcde'),'Exact logo backdrop colour missing');
assert(css.includes('--v3-rose:#f25c9e'),'Exact logo pink missing');
assert(!html.includes('SWIPE FOR MORE'),'Old swipe prompt visible on desktop');
assert(main.includes('id="home-enquiry-form"')&&main.includes('id="cake-enquiry"'),'Homepage enquiry experience missing');
assert(main.includes('Demo only.')&&main.includes('Nothing is sent or saved'),'Form demo disclosure missing');
assert(!main.includes("<h1>Life's sweeter <span>"),'Old dual-colour hero treatment returned');
const notice=JSON.parse(read('assets/studio-notices.json'));
assert.equal(notice.enabled,true,'Example studio notice should be demonstrable');
assert.equal(notice.isExample,true,'Example availability must not appear confirmed');
assert(/December 2026/.test(notice.message),'Sample date banner missing');
assert(notice.linkHref==='/#cake-enquiry','Announcement action must open homepage form');
assert(script.includes('initStudioNotice();initHomeEnquiry()'),'Home form and notice not initialised');

assert(css.includes('@media(max-width:800px)'),'Mobile presentation missing');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'V3 CSS unbalanced');
assert.equal((base.match(/\{/g)||[]).length,(base.match(/\}/g)||[]).length,'Base CSS unbalanced');
for(const name of ['index.html','about/index.html','cakes/index.html','decorate-and-sip/index.html','enquire/index.html','404.html']){
 const page=read(name);
 assert(page.includes('home-v3.css?v=20261028-v32'),'V3.2 theme absent or stale on '+name);
 const header=page.match(/<nav class="nav-list"[\s\S]*?<\/nav>/)?.[0]||'';
 assert(header.includes('>Creations</a>')&&header.includes('>Deco &amp; Sip</a>')&&header.includes('>Let’s talk cake</a>'),'Incorrect navigation: '+name);
 assert(!header.includes('>About</a>')&&!header.includes('>Occasions</a>'),'Cluttered header: '+name);
 assert(page.includes('href="/about/"'),'About missing from footer: '+name);
 assert.equal((page.match(/class="footer-instagram"/g)||[]).length,0,'Unwanted Instagram icon: '+name);
 assert(page.includes('>Instagram ↗</a>'),'Instagram text link missing: '+name);
 assert(page.includes('>Custom creations</a>'),'Concise footer category missing: '+name);
 assert(page.includes('data-studio-announcement'),'Configurable announcement missing: '+name);
}
for(const record of portfolio)assert(fs.existsSync(record.coverImage),'Missing creation: '+record.id);
assert(script.includes('data-home-occasions'),'Occasion filtering not supported');
console.log('V3.2 PASS: 10 photos, logo palette, premium hero, editable illustrative notice, embedded demo form and text-only Instagram footer.');
