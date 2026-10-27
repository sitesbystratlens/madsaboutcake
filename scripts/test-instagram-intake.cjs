#!/usr/bin/env node
// Source-only free syntax and pure mapping tests. Does not run Apify or Sheets.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('integrations/Instagram.gs','utf8');
const ctx=vm.createContext({
 console,Date,Map,Set,JSON,Number,String,Array,Error,RegExp,URL,
 Utilities:{formatDate:()=> '2026-10-27 10:00'},
});
vm.runInContext(src,ctx,{filename:'Instagram.gs'});
const checks=vm.runInContext('[testMadsInstagramMapping(),testMadsIntakeMapping()]',ctx);
assert.equal(checks.length,2);
assert(checks.every(s=>s.startsWith('PASS:')));
console.log(JSON.stringify({status:'PASS',checks},null,2));
