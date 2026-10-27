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
assert(html.includes('v3-10-plum-actions-studio-experience-20261028'),'Homepage V3.9 version marker missing');
assert(html.includes('noindex,nofollow'),'Owner concept must remain noindexed');
assert(html.includes('/assets/home-v3.css?v=20261028-v41'),'V3.11 CSS missing or stale');
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
assert(css.includes('--v3-rose:#f15ea0'),'Exact logo pink missing');
assert(css.includes('--v3-berry:#f15ea0'),'Brand accents must match the logo pink');
assert(css.includes('--v3-peach:#fedcde'),'Logo backdrop must stay exact');
assert(css.includes('.site-header .nav-shell{min-height:112px;max-width:1440px;justify-content:center'),'Centred logo layout missing');
assert(css.includes('.site-header{background:var(--v3-peach);border:0;box-shadow:none}'),'Heavy pink header divider remains');
assert(css.includes('.mads-v3 .opening{position:relative;background:#fff1ee'),'Warm studio opening missing');
assert(css.includes('.mads-v3 .occasion{padding:78px 0 87px;background:#f3eae5}'),'Neutral occasion browsing surface missing');
assert(css.includes('.mads-v3 .sip{background:#533047;color:#fff8f4'),'Editorial contrast section missing');
assert(html.includes('CUSTOM CAKES &amp; CUPCAKES · MELBOURNE'),'Product positioning not immediately clear');

assert(css.includes('background:#553047;color:#fff'),'Enquiry send button needs the plum palette');
assert(!/#f25c9e|#a92361/i.test(css),'Retired pink palette remains in V3 styles');
assert(/announcement\[data-studio-announcement\]\s*\{[\s\S]*?background:var\(--v3-ink\);color:#fff/.test(css),'Order-closure banner must use plum and legible white text');
assert(css.includes('min-height:29px;font:600 12px/1.4 var(--sans)'),'Order notice should be subtle, not oversized');
assert(!html.includes('SWIPE FOR MORE'),'Old swipe prompt visible on desktop');
assert(main.includes('id="cake-enquiry"')&&main.includes('data-studio-enquiry-form'),'Homepage enquiry experience missing');
assert(main.includes('Send enquiry ↗')&&main.includes('data-studio-enquiry-form'),'Category enquiry form missing');
assert(!main.includes('Prepare my message')&&!main.includes('Copy message'),'Copy-message workflow returned');
for(const name of ['Custom creations','Decorate &amp; Sip','Other'])assert(main.includes('<optgroup label="'+name+'">'),'Grouped enquiry option missing '+name);
for(const topic of ['cake','cupcakes','workshop-booking','workshop-question','general','corporate-event','partnership','something-else'])assert(main.includes('value="'+topic+'"'),'Enquiry topic missing '+topic);
assert(!main.includes('studio-service-options')&&!main.includes('studio-service-choice'),'Old category step remains');
assert(css.includes('.studio-enquiry-form .enquiry-submit .action-solid{')&&css.includes('background:#553047;color:#fff'),'Plum send button missing');
assert(!main.includes('Pretty little details.')&&main.includes('A closer look.'),'Marketing-template heading still present');
assert(main.includes('<h2 id="home-enquiry-title">Got an idea?</h2>'),'Homepage enquiry intro duplicates the form heading');
assert(main.includes('<strong>Let’s hear it.</strong>'),'Homepage form heading does not reflect the conversational copy');
assert(read('enquire/index.html').includes('<strong>Let’s hear it.</strong>'),'Dedicated enquiry form uses inconsistent heading');
assert(css.includes('object-fit:contain;background:transparent;mix-blend-mode:normal;filter:none'),'Footer logo must match the normal header image rendering');
assert(!css.includes('mix-blend-mode:multiply'),'Multiply blend mode still darkens logo');
assert(main.includes('Say it with cake.')&&main.includes('Daisy cake for a little daisy.'),'Caption-led wording missing');
assert(css.includes('.mads-v3 .action-solid{display:inline-flex;align-items:center;gap:9px;justify-content:center;background:var(--v3-ink);color:#fff'),'Homepage primary CTA must be plum');
assert(css.includes('.mads-v3 .action-line{font-size:12px;font-weight:800;color:var(--v3-ink)'),'Homepage secondary CTA must be plum');
assert(css.includes('background:var(--studio-plum);border-color:var(--studio-plum)'),'Secondary pages primary CTA must be plum');
const session=read('decorate-and-sip/index.html');
assert(session.includes('workshop-facts')&&session.includes('three-colour buttercream palette'),'Workshop facts not applied');
assert(session.includes('four-inch')&&/grazing[, ]+beverage/i.test(session),'Workshop inclusions not grounded');
assert(session.includes('DF9zz10BNtL'),'Real workshop evidence link missing');
for(const name of ['index.html','cakes/index.html','decorate-and-sip/index.html','about/index.html','enquire/index.html','404.html'])
 assert(read(name).includes('href="https://www.stratlens.com/websites/"'),'Sites by Stratlens destination wrong: '+name);
for(const p of ['index.html','enquire/index.html']){
 const page=read(p);
 assert.equal((page.match(/data-studio-enquiry-form/g)||[]).length,1,'Exactly one form needed: '+p);
 assert.equal((page.match(/<optgroup label=/g)||[]).length,3,'One grouped select required: '+p);
 assert(!page.includes('name="creationType"')&&!page.includes('name="otherTopic"'),'Secondary category step remains: '+p);
}
assert(script.includes('name="enquiryTopic"')===false||script.includes('form.elements.enquiryTopic'),'Enquiry selection not wired');
assert(script.includes('if(!url){'),'Must not falsely send unconfigured Formspree enquiries');
assert(script.includes("if(!response.ok)throw"),'Must verify Formspree delivery before reporting success');
assert(read('enquire/index.html').includes('data-studio-enquiry-form'),'Dedicated enquiry form not unified');
assert(script.includes('initStudioEnquiryForms()'),'Formspree-ready submission handler not wired');
assert.equal(JSON.parse(read('assets/enquiry-settings.json')).formspreeEndpoint,'','Formspree must remain unconfigured until owner approval');
assert(!main.includes("<h1>Life's sweeter <span>"),'Old dual-colour hero treatment returned');
const notice=JSON.parse(read('assets/studio-notices.json'));
assert.equal(notice.enabled,true,'Order availability banner should be enabled');
assert.equal(notice.message,'Not taking new orders for December 2026','Incorrect studio notice');
assert.equal(Object.keys(notice).sort().join(','),'enabled,message,schemaVersion','Notice should have no sample labels or unnecessary links');
assert(script.includes('initStudioNotice();initStudioEnquiryForms()'),'Studio form and notice not initialised');

assert(css.includes('@media(max-width:800px)'),'Mobile presentation missing');
assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'V3 CSS unbalanced');
assert.equal((base.match(/\{/g)||[]).length,(base.match(/\}/g)||[]).length,'Base CSS unbalanced');
for(const name of ['index.html','about/index.html','cakes/index.html','decorate-and-sip/index.html','enquire/index.html','404.html']){
 const page=read(name);
 assert(page.includes('home-v3.css?v=20261028-v41'),'V3.11 theme absent or stale on '+name);
 const header=page.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0]||'';
 assert(header.includes('class="brand brand--centered"'),'Header logo is not centred: '+name);
 assert(header.includes('alt="Mads About Cake"'),'Header logo needs accessible name: '+name);
 assert(!header.includes('nav-list')&&!header.includes('nav-toggle')&&!header.includes('brand-wordmark'),'Header still has redundant navigation: '+name);
 assert(page.includes('class="concept-ribbon"'),'Design concept strip missing: '+name);
 assert(page.includes('href="/about/"'),'About missing from footer: '+name);
 assert.equal((page.match(/class="footer-instagram"/g)||[]).length,0,'Unwanted Instagram icon: '+name);
 assert(page.includes('>Instagram ↗</a>'),'Instagram text link missing: '+name);
 assert(page.includes('>Custom creations</a>'),'Concise footer category missing: '+name);
 assert(page.includes('data-studio-announcement'),'Studio notice missing: '+name);
 assert(page.includes('Not taking new orders for December 2026'),'December notice absent: '+name);
 assert(!/(EXAMPLE NOTICE|Illustrative only|Concept preview|Demo only|Independent website concept)/i.test(page),'Unwanted demo wording on '+name);
}
for(const record of portfolio)assert(fs.existsSync(record.coverImage),'Missing creation: '+record.id);
assert(script.includes('data-home-occasions'),'Occasion filtering not supported');
console.log('V3.11 PASS: consistent logo rendering, conversational enquiry headings, plum availability banner, and page styling.');
