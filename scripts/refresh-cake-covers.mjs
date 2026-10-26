#!/usr/bin/env node
/**
 * Import authorised public Instagram post/reel preview covers into local files.
 * Run manually from GitHub Actions after updating cakes.json with post URLs.
 * Never logs in, crawls a profile, or makes client-side/visitor IG requests.
 * Resolution order: existing valid local cover > public post OG image > preview fallback.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const FILE='cakes.json', FOLDER='assets/cake-covers';
const MAX_HTML=1_500_000, MAX_IMG=8_000_000;
const MAX_ITEMS=50;
const SHORT=/^[A-Za-z0-9_-]{5,32}$/;
function validPost(value){
 try {
  const u=new URL(String(value||'').trim());
  if(u.protocol!=='https:'||!['instagram.com','www.instagram.com','m.instagram.com'].includes(u.hostname)||u.username||u.password||u.port)return null;
  const m=u.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]{5,32})\/?$/);
  return m?{url:'https://www.instagram.com/'+m[1]+'/'+m[2]+'/',shortcode:m[2]}:null;
 }catch{return null;}
}
function safeImageUrl(raw){
 try {
  const u=new URL(raw);const h=u.hostname.toLowerCase();
  if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||!(/(^|\.)cdninstagram\.com$/.test(h)||/(^|\.)fbcdn\.net$/.test(h)||/(^|\.)instagram\.com$/.test(h)))return '';
  return u.href;
 }catch{return '';}
}
function getMeta(html,name){
 for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){
  if(!new RegExp('(?:name|property)\\s*=\\s*["\\x27]'+name+'["\\x27]','i').test(tag))continue;
  let s=(tag.match(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i)||[])[2]||'';
  return s.replace(/&amp;/gi,'&').replace(/&#(?:x([0-9a-f]+)|([0-9]+));/gi,(_,hex,dec)=>String.fromCodePoint(parseInt(hex||dec,hex?16:10)));
 }
 return '';
}
async function readBytes(url,max,accept='*/*',allowedRedirects=3){
 let target=url;
 for(let attempt=0;attempt<=allowedRedirects;attempt++){
  const res=await fetch(target,{redirect:'manual',signal:AbortSignal.timeout(20000),headers:{'Accept':accept,'User-Agent':'Mozilla/5.0 (compatible; MadsAboutCakeSitePublisher/1.0)'}});
  if([301,302,303,307,308].includes(res.status)){
   const next=new URL(res.headers.get('location')||'',target).href;
   if(accept==='text/html'){if(!validPost(next))throw Error('unexpected Instagram page redirect');}
   else if(!safeImageUrl(next))throw Error('unsafe image redirect');
   target=next;await res.body?.cancel();continue;
  }
  if(!res.ok)throw Error('HTTP '+res.status);
  if(Number(res.headers.get('content-length')||0)>max)throw Error('response too large');
  let n=0;const buffers=[];
  for await(const part of res.body){n+=part.byteLength;if(n>max)throw Error('download exceeds size limit');buffers.push(Buffer.from(part));}
  return {body:Buffer.concat(buffers),type:(res.headers.get('content-type')||'').toLowerCase()};
 }
 throw Error('too many redirects');
}
function extFor(type,b){
 if(type.includes('image/jpeg')&&b[0]===255&&b[1]===216&&b[2]===255)return 'jpg';
 if(type.includes('image/png')&&b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71)return 'png';
 if(type.includes('image/webp')&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')return 'webp';
 if(type.includes('image/avif')&&b.toString('ascii',4,12).includes('ftypavif'))return 'avif';
 return '';
}
const localCover=s=>/^assets\/cake-covers\/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|webp|png|avif)$/.test(String(s||''));
async function importCovers(){
 if(!fs.existsSync(FILE))throw Error('Missing '+FILE);
 const data=JSON.parse(fs.readFileSync(FILE,'utf8'));
 assert(Array.isArray(data.cakes)&&data.cakes.length<=MAX_ITEMS,'cakes.json must contain up to '+MAX_ITEMS+' cakes');
 fs.mkdirSync(FOLDER,{recursive:true});
 let ok=0,failed=0,skipped=0;
 for(const c of data.cakes){
  if(!c||typeof c.id!=='string'||!/^[a-z0-9-]+$/.test(c.id))throw Error('invalid cake id');
  if(localCover(c.coverImage)&&fs.existsSync(c.coverImage)){skipped++;continue;}
  if(!c.instagramUrl){skipped++;continue;}
  const post=validPost(c.instagramUrl);
  if(!post){console.error('Invalid post link for',c.id);failed++;continue;}
  try{
   const page=await readBytes(post.url,MAX_HTML,'text/html');
   if(!page.type.includes('text/html'))throw Error('post did not return HTML');
   const imageUrl=safeImageUrl(getMeta(page.body.toString('utf8'),'og:image'));
   if(!imageUrl)throw Error('no accessible Instagram Open Graph cover');
   const img=await readBytes(imageUrl,MAX_IMG,'image/avif,image/webp,image/png,image/jpeg');
   const ext=extFor(img.type,img.body);
   if(!ext)throw Error('post cover did not return a supported image');
   const digest=crypto.createHash('sha256').update(img.body).digest('hex').slice(0,12);
   const path=FOLDER+'/'+post.shortcode+'-'+digest+'.'+ext;
   fs.writeFileSync(path,img.body);
   c.coverImage=path;ok++;
   console.log('Cached cover for',c.id,path,img.body.length+' bytes');
  }catch(e){failed++;console.error('Cover unavailable for',c.id+':',e.message);}
 }
 if(ok)fs.writeFileSync(FILE,JSON.stringify(data,null,2)+'\n');
 console.log(JSON.stringify({newCovers:ok,failed,skipped}));
 // Publish any successful imports while reporting partial misses.
 if(failed&&!ok)process.exitCode=1;
}
function tests(){
 assert.equal(validPost('https://www.instagram.com/p/ABCxyz90_/')?.shortcode,'ABCxyz90_');
 assert.equal(validPost('https://www.instagram.com/madsaboutcake/'),null);
 assert.equal(validPost('https://evil.example/p/ABCxyz90_/'),null);
 assert.equal(safeImageUrl('http://scontent.cdninstagram.com/a.jpg'),'');
 assert.equal(safeImageUrl('https://localhost/test.jpg'),'');
 assert.equal(safeImageUrl('https://scontent.cdninstagram.com/test.jpg').startsWith('https://'),true);
 assert.equal(getMeta('<meta property="og:image" content="https://scontent.cdninstagram.com/a.jpg?a=1&amp;b=2">','og:image'),'https://scontent.cdninstagram.com/a.jpg?a=1&b=2');
 assert.equal(extFor('image/jpeg',Buffer.from([255,216,255,0])),'jpg');
 assert.equal(localCover('assets/cake-covers/ABC123-xyz.jpg'),true);
 console.log('Instagram cover importer self-tests passed.');
}
if(process.argv.includes('--test'))tests();
else importCovers().catch(e=>{console.error(e);process.exitCode=1;});
