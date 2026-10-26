#!/usr/bin/env node
import fs from 'node:fs';
const catalog=JSON.parse(fs.readFileSync('cakes.json','utf8'));
if(catalog.meta?.mode!=='production')throw Error('Not a production catalogue');
const missing=catalog.cakes.filter(x=>!/^assets\/cake-covers\/[\w-]+\.(?:jpg|jpeg|png|webp|avif)$/.test(x.coverImage||'')||!fs.existsSync(x.coverImage));
if(missing.length){console.error('Missing approved covers:',missing.map(x=>x.id).join(', '));process.exitCode=1;}
else console.log('Verified images:',catalog.cakes.length);
