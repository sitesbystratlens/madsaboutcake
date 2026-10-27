/**
 * Mads About Cake | Compact 3-tab Sheets integration.
 * Same Apify actor and mapping as Mammabao. Only Portfolio, Instagram and Website.
 * Imported A:J; suggestions K:N; owner review O:T; timestamp X1.
 * Nothing publishes automatically; no owner Instagram credentials required.
 */
const MADS_IG={username:'madsaboutcake',actor:'apify~instagram-post-scraper',postsPerRun:30,timezone:'Australia/Melbourne'};
const MADS_HEADERS=[
 'shortcode','instagram_url','media_type','posted_at','caption','cover_url','carousel_urls','likes','views','hashtags',
 'suggested_product','suggested_occasion','suggested_style_tags','suggested_title',
 'owner_product_type','owner_occasion','owner_style_tags','owner_title','decision','notes'
];
const MADS_PRODUCTS=['Cake','Cupcakes','Other Treats'];
const MADS_OCCASIONS=['Birthdays','Weddings & Engagements','Baby Showers & Gender Reveals','Anniversaries','Religious & Cultural','Graduations','Corporate & Events','Other Celebrations'];
function onOpen(){
 SpreadsheetApp.getUi().createMenu('Mads Content')
 .addItem('Set up (free)','setupMadsInstagram')
 .addItem('Refresh IG data (Apify)','refreshMadsInstagram')
 .addSeparator().addItem('Add selected posts to Portfolio','addMadsPostsToPortfolio')
 .addToUi();
}
function _madsSheet_(setup){
 const ss=SpreadsheetApp.getActiveSpreadsheet();
 let sh=ss.getSheetByName('Instagram');
 if(!sh&&setup)sh=ss.insertSheet('Instagram');
 if(!sh)throw Error('Instagram tab not found. Import the 3-tab workbook.');
 if(sh.getMaxColumns()<24)sh.insertColumnsAfter(sh.getMaxColumns(),24-sh.getMaxColumns());
 const head=sh.getRange(1,1,1,20).getValues()[0].map(x=>String(x).trim());
 if(head.every(x=>!x)){
  if(!setup)throw Error('Run Set up (free) first.');
  sh.getRange(1,1,1,20).setValues([MADS_HEADERS]);
  sh.setFrozenRows(1);sh.setFrozenColumns(2);
 }else if(head.some((x,i)=>x!==MADS_HEADERS[i])){
  throw Error('Instagram tab uses old headings. Use the simplified 3-tab workbook without overwriting any existing data.');
 }
 const stampLabel=String(sh.getRange('W1').getValue()||'');
 if(stampLabel&&stampLabel!=='Last successful IG refresh')throw Error('Instagram W1 already contains other data.');
 if(setup&&!stampLabel){
  sh.getRange('W1').setValue('Last successful IG refresh');
  if(!sh.getRange('X1').getValue())sh.getRange('X1').setValue('Not yet run');
 }
 return sh;
}
function setupMadsInstagram(){
 const ss=SpreadsheetApp.getActiveSpreadsheet();
 if(!ss.getSheetByName('Portfolio')||!ss.getSheetByName('Website'))throw Error('The Portfolio and Website tabs must exist.');
 _madsSheet_(true);
 return 'Instagram ready. No new tabs or paid calls.';
}
function _madsSuggestions_(caption,id){
 const s=String(caption||'').toLowerCase(),styles=[];
 const product=/\bcupcakes?\b/.test(s)?'Cupcakes':/\bcakes?\b|\blambeth\b|\bbuttercream\b/.test(s)?'Cake':'';
 let occasion='';
 if(/wedding|engagement|bridal/.test(s))occasion='Weddings & Engagements';
 else if(/baby shower|gender reveal/.test(s))occasion='Baby Showers & Gender Reveals';
 else if(/birthday|bday/.test(s))occasion='Birthdays';
 else if(/anniversary/.test(s))occasion='Anniversaries';
 else if(/baptis|christen|communion|eid|diwali/.test(s))occasion='Religious & Cultural';
 else if(/graduat/.test(s))occasion='Graduations';
 else if(/corporate|office event/.test(s))occasion='Corporate & Events';
 if(/vintage|piping|piped|lambeth|ruffle/.test(s))styles.push('Vintage piping');
 if(/floral|flower|bloom/.test(s))styles.push('Floral');
 if(/bow|ribbon/.test(s))styles.push('Bows & ribbons');
 const first=String(caption||'').split(/\r?\n/)[0].replace(/#[\w]+/g,'').trim();
 return [product,occasion,styles.join('; '),first.length>3&&first.length<81?first:'Instagram design '+id].map(_madsSafeCell_);
}
function _madsRecord_(item){
 if(!item||item.ownerUsername&&String(item.ownerUsername).toLowerCase()!==MADS_IG.username)return null;
 const r=_madsNormalizePosts_([item])[0];
 if(!r)return null;
 const id=_madsShortCodeFromUrl_(r[2]);if(!id)return null;
 const images=[item.displayUrl,...(Array.isArray(item.images)?item.images:[]),...(Array.isArray(item.childPosts)?item.childPosts.map(c=>c&&c.displayUrl):[])];
 const urls=[...new Set(images.filter(x=>typeof x==='string'&&/^https:\/\//.test(x)))].slice(0,15);
 const tags=[...new Set([...String(item.caption||'').matchAll(/#([\w]+)/g)].map(x=>x[1]))];
 return {id,raw:[id,r[2],r[1],r[0],r[3],r[4],_madsSafeCell_(urls.join('; ')),r[7],r[8],_madsSafeCell_(tags.join('; '))],
  suggested:_madsSuggestions_(item.caption,id)};
}
function refreshMadsInstagram(){
 const token=PropertiesService.getScriptProperties().getProperty('APIFY_API_TOKEN');
 if(!token||token.trim().length<12)throw Error('Set APIFY_API_TOKEN in Apps Script Script properties.');
 const lock=LockService.getScriptLock();
 if(!lock.tryLock(2000))throw Error('Another refresh is running.');
 try{
  const sh=_madsSheet_(false);
  if(sh.getRange('W1').getValue()!=='Last successful IG refresh')throw Error('Run free setup first.');
  const input={username:[MADS_IG.username],resultsLimit:MADS_IG.postsPerRun,dataDetailLevel:'detailedData',skipPinnedPosts:true};
  const response=UrlFetchApp.fetch('https://api.apify.com/v2/acts/'+MADS_IG.actor+'/run-sync-get-dataset-items?format=json',{
   method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+token.trim(),Accept:'application/json'},
   payload:JSON.stringify(input),muteHttpExceptions:true
  });
  if(![200,201].includes(response.getResponseCode()))throw Error('Apify HTTP '+response.getResponseCode()+'; existing data preserved.');
  let items;
  try{items=JSON.parse(response.getContentText())}catch{throw Error('Invalid Apify JSON; existing data preserved.')}
  if(!Array.isArray(items)||!items.length)throw Error('Apify returned no posts; existing data preserved.');
  const unique=new Map();
  items.forEach(x=>{const r=_madsRecord_(x);if(r&&!unique.has(r.id))unique.set(r.id,r)});
  if(!unique.size)throw Error('No valid Mads posts; existing data preserved.');
  const count=Math.max(0,sh.getLastRow()-1),existing=new Map();
  if(count)sh.getRange(2,1,count,1).getValues().forEach((v,i)=>{if(v[0]&&!existing.has(String(v[0])))existing.set(String(v[0]),i+2)});
  const add=[],update=[];
  unique.forEach(r=>{
   if(existing.has(r.id))update.push({row:existing.get(r.id),values:r.raw});
   else add.push(r.raw.concat(r.suggested,['','','','','Review','']));
  });
  if(count+add.length>500)throw Error('Instagram exceeds 500 rows. Archive old posts first.');
  update.forEach(r=>sh.getRange(r.row,1,1,10).setValues([r.values]));
  if(add.length){
   const start=sh.getLastRow()+1;
   if(sh.getMaxRows()<start+add.length-1)sh.insertRowsAfter(sh.getMaxRows(),start+add.length-1-sh.getMaxRows());
   sh.getRange(start,1,add.length,20).setValues(add);
  }
  SpreadsheetApp.flush();
  sh.getRange('X1').setNumberFormat('@');
  sh.getRange('X1').setValue(Utilities.formatDate(new Date(),MADS_IG.timezone,'dd/MM/yyyy HH:mm'));
  SpreadsheetApp.flush();
  return {newPosts:add.length,updatedPosts:update.length};
 }finally{lock.releaseLock()}
}
/* Proven Mammabao extraction normalizers retained unchanged. */
function _madsNormalizePosts_(items) {
  const records = [], seen = new Set();
  items.forEach(item => {
    if (!item || typeof item !== 'object') return;
    const owner = String(item.ownerUsername || '').toLowerCase();
    if (owner && owner !== MADS_IG.username) return;
    const shortCode = String(item.shortCode || item.shortcode || '').trim();
    if (!/^[\w-]{5,80}$/.test(shortCode) || seen.has(shortCode)) return;
    seen.add(shortCode);
    const productType = String(item.productType || '').toLowerCase();
    const type = String(item.type || '').toLowerCase();
    const postType = productType === 'clips' || type === 'reel' ? 'Reel' :
      type === 'sidecar' || productType === 'carousel_container' ? 'Carousel' :
      type === 'image' ? 'Photo' : String(item.type || 'Post');
    const provided = String(item.url || '');
    const postUrl = /^https:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[\w-]+\/?(?:\?.*)?$/i.test(provided)
      ? provided.split('?')[0] : 'https://www.instagram.com/p/' + shortCode + '/';
    const images = Array.isArray(item.images) ? item.images : [];
    const cover = _madsHttpsMedia_(item.displayUrl) ||
      _madsHttpsMedia_(images[0]) ||
      _madsHttpsMedia_(item.childPosts && item.childPosts[0] && item.childPosts[0].displayUrl);
    const handles = [];
    _madsList_(item.mentions).forEach(v => handles.push(v));
    _madsList_(item.taggedUsers).forEach(v => handles.push(v));
    _madsList_(item.coauthorProducers).forEach(v => handles.push(v));
    const caption = String(item.caption || '');
    const regex = /@([A-Za-z0-9._]+)/g;
    let match;
    while ((match = regex.exec(caption)) !== null) handles.push(match[1]);
    const mentions = [...new Set(handles.map(v => String(v).trim().replace(/^@/, '').toLowerCase())
      .filter(v => v && v !== MADS_IG.username))].map(v => '@' + v).join(', ');

    // Reel metrics may be absent; missing ≠ zero. Do not infer partnership from mentions.
    const views = item.videoPlayCount == null ? item.videoViewCount : item.videoPlayCount;
    const paid = item.paidPartnership === true ? 'Flagged' :
      item.paidPartnership === false ? 'Not flagged' : 'Unknown';
    records.push([
      _madsSafeCell_(_madsUtcTime_(item.timestamp).slice(0, 10)),
      postType,
      _madsSafeCell_(postUrl),
      _madsSafeCell_(caption),
      _madsSafeCell_(cover),
      _madsSafeCell_(mentions),
      paid,
      _madsNumber_(item.likesCount),
      _madsNumber_(views)
    ]);
  });
  return records;
}

function _madsShortCodeFromUrl_(value) {
  const match = String(value || '').match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/i);
  return match ? match[1] : '';
}

function _madsList_(values) {
  if (!Array.isArray(values)) return [];
  return values.map(v => typeof v === 'string' ? v :
    v && typeof v === 'object' ? (v.username || v.userName || '') : ''
  ).filter(Boolean);
}

function _madsHttpsMedia_(value) {
  const s = String(value == null ? '' : value).trim();
  return /^https:\/\/[^\s]+$/i.test(s) ? s : '';
}

function _madsUtcTime_(value) {
  const s = String(value == null ? '' : value).trim();
  const match = s.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) UTC$/);
  return match ? match[1] + 'T' + match[2] + 'Z' : s;
}

function _madsNumber_(value) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n : '';
}

function _madsSafeCell_(value) {
  const s = String(value == null ? '' : value).slice(0, 45000);
  return /^[\s]*[=+\-@]/.test(s) ? "'" + s : s;
}


function addMadsPostsToPortfolio(){
 const ss=SpreadsheetApp.getActiveSpreadsheet(),ig=_madsSheet_(false),p=ss.getSheetByName('Portfolio');
 if(!p)throw Error('Portfolio missing.');
 const width=p.getLastColumn(),head=p.getRange(1,1,1,width).getValues()[0].map(String);
 for(const k of ['item_id','title','product_type','primary_occasion','instagram_url','approval_status','show_on_website'])
   if(!head.includes(k))throw Error('Portfolio missing '+k);
 const count=Math.max(0,p.getLastRow()-1),idCol=head.indexOf('item_id')+1;
 const existing=new Set(count?p.getRange(2,idCol,count,1).getValues().flat().map(String):[]);
 const n=Math.max(0,ig.getLastRow()-1);if(!n)return 'No Instagram posts yet.';
 const rows=ig.getRange(2,1,n,20).getValues(),out=[],chosen=[],problems=[];
 const set=(x,k,v)=>{const i=head.indexOf(k);if(i>=0)x[i]=v};
 rows.forEach((r,i)=>{
  if(r[18]!=='Add to Portfolio')return;
  const shortcode=String(r[0]||'');
  if(!/^[A-Za-z0-9_-]{5,80}$/.test(shortcode)){problems.push('row '+(i+2)+' shortcode');return}
  const id='ig-'+[...shortcode].map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join('');
  if(existing.has(id)){chosen.push(i+2);return}
  const product=String(r[14]||r[10]||''),occasion=String(r[15]||r[11]||''),title=String(r[17]||r[13]||'').slice(0,140);
  if(!MADS_PRODUCTS.includes(product)||!MADS_OCCASIONS.includes(occasion)||title.length<3){
   problems.push('row '+(i+2)+' needs product, occasion and title');return;
  }
  const record=Array(width).fill('');
  set(record,'item_id',id);set(record,'title',title);set(record,'product_type',product);
  set(record,'primary_occasion',occasion);set(record,'style_tags',String(r[16]||r[12]||''));
  set(record,'instagram_url',String(r[1]||''));set(record,'alt_text','Mads About Cake design — '+title);
  set(record,'featured_home','No');set(record,'show_on_website','No');set(record,'approval_status','Draft');
  set(record,'published_date',String(r[3]||''));set(record,'internal_notes','From Instagram. Confirm details before publishing.');
  out.push(record);chosen.push(i+2);existing.add(id);
 });
 if(out.length){
  const start=p.getLastRow()+1;
  if(p.getMaxRows()<start+out.length-1)p.insertRowsAfter(p.getMaxRows(),start+out.length-1-p.getMaxRows());
  p.getRange(start,1,out.length,width).setValues(out);SpreadsheetApp.flush();
 }
 chosen.forEach(i=>ig.getRange(i,19).setValue('Added to Portfolio'));
 return out.length+' drafts added; website unchanged.'+(problems.length?' Check '+problems.join(', '):'');
}
function testMadsInstagramMapping(){
 const item={ownerUsername:'madsaboutcake',shortCode:'AbC123456',type:'Image',timestamp:'2026-10-26T00:00:00Z',
  caption:'Birthday cupcakes with bows #cake',displayUrl:'https://example.com/photo.jpg',likesCount:12};
 const rec=_madsRecord_(item);
 if(!rec||rec.raw.length!==10||rec.suggested.length!==4||rec.suggested[0]!=='Cupcakes'||rec.suggested[1]!=='Birthdays')
   throw Error('Instagram mapping test failed');
 return 'PASS: Mads source and category mapping';
}
