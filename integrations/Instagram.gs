/**
 * Mads About Cake · Apify Instagram Post Scraper → existing "IG Extract" Google Sheet tab
 * No automatic publication. Writes IG Extract and Config!B2 only.
 *
 * 1. Paste into Extensions → Apps Script of the Mads About Cake workbook and save.
 * 2. Store APIFY_API_TOKEN privately under Project Settings → Script properties.
 * Instagram-only module: exports refreshMadsInstagram() and data helpers.
 * Does not create the Sheets menu or write Socials Dash.
 * Spreadsheet tab setup + formatting are automatic; manual extraction only.
 *
 * Provides a compact 9-column link-picking list; imports are invoked on demand.
 * The first setup/refresh safely migrates the previous 11-column IG Extract layout.
 * Leaves the old test tab untouched; users may delete it manually once satisfied.
 */
const MADS_IG = Object.freeze({
    tabName: 'IG Extract',
  username: 'madsaboutcake',
  actor: 'apify~instagram-post-scraper',
  postsPerRun: 30,         // Latest 30 per manual import; existing older posts are retained.
  maxSavedRows: 650,
  timezone: 'Australia/Melbourne'
});

// A–I only. This is a discovery/link-copying workspace, not an approvals tracker.
const MADS_IG_HEADERS = [
  'posted_at', 'post_type', 'post_url', 'caption', 'cover_image_url',
  'mentions_tags', 'paid_partnership', 'likes', 'views'
];
// Recognise the previous layout exactly before deleting any columns.
const MADS_IG_OLD_HEADERS = MADS_IG_HEADERS.concat(['review_status', 'notes']);

function setupMadsInstagram() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(MADS_IG.tabName);
  if (!sheet) throw new Error('IG Extract is missing. Import the four-tab workbook; no new tabs were made.');
  const size = MADS_IG_HEADERS.length;
  if (sheet.getMaxColumns() < size)
    sheet.insertColumnsAfter(sheet.getMaxColumns(), size - sheet.getMaxColumns());

  if (sheet.getLastRow()) {
    const existing = sheet.getRange(1, 1, 1, size).getValues()[0].map(v => String(v).trim());
    const isCurrent = existing.every((header, i) => header === MADS_IG_HEADERS[i]);
    if (!isCurrent) {
      throw new Error('IG Extract headings are unrecognised. Nothing was changed: check the first 9 columns.');
    }
    // Migrate only when J/K contain the EXACT legacy columns. Never guess.
    const oldHeadings = sheet.getMaxColumns() >= MADS_IG_OLD_HEADERS.length
      ? sheet.getRange(1, 1, 1, MADS_IG_OLD_HEADERS.length).getValues()[0].map(v => String(v).trim())
      : [];
    const isOld = oldHeadings.length === MADS_IG_OLD_HEADERS.length &&
      oldHeadings.every((h, i) => h === MADS_IG_OLD_HEADERS[i]);
    if (isOld) {
      if (sheet.getLastColumn() > MADS_IG_OLD_HEADERS.length)
        throw new Error('IG Extract contains additional data after column K. No migration performed.');
      const filter = sheet.getFilter();
      if (filter) filter.remove(); // Remove the 11-column filter before deleting J:K.
      sheet.deleteColumns(10, 2); // Remove legacy Review Status and Notes, not post data.
      console.log('IG Extract migrated safely from 11 to 9 columns.');
    } else if (sheet.getLastColumn() > size) {
      throw new Error('Unexpected data after column I: IG Extract was not changed.');
    }
  } else {
    sheet.getRange(1, 1, 1, size).setValues([MADS_IG_HEADERS]);
  }

  sheet.getRange(1, 1, 1, size)
    .setBackground('#e7eee6').setFontColor('#243b30').setFontWeight('bold');
  sheet.setFrozenRows(1);
  const widths = [130, 90, 270, 430, 310, 270, 125, 75, 75];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));
  if (!sheet.getFilter())
    sheet.getRange(1, 1, sheet.getMaxRows(), size).createFilter();
  formatMadsIGExtract();
  return 'IG Extract is ready (9 columns). Recipes, collaborations and the website are unchanged.';
}

/** Apply a concise, readable layout to existing data WITHOUT starting a billable Apify run. */
function formatMadsIGExtract() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(MADS_IG.tabName);
  if (!sheet) throw new Error('IG Extract does not exist yet. Run setupMadsInstagram first.');
  const width = MADS_IG_HEADERS.length;
  const current = sheet.getRange(1, 1, 1, width).getValues()[0].map(String);
  if (current.some((header, i) => header.trim() !== MADS_IG_HEADERS[i]))
    throw new Error('Unexpected IG Extract column layout. No formatting changes made.');
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);
  sheet.getRange(1, 4).setNote('Full caption is retained in the cell. The grid intentionally shows a clipped preview; select the cell to read the full caption in the formula bar.');
  sheet.getRange(1, 5).setNote('Instagram-hosted media URLs may expire. Use verified, cached website images for publishing.');
  sheet.getRange(1, 7).setNote('A missing platform label does not confirm whether a post was sponsored. Review separately.');
  const count = Math.max(0, sheet.getLastRow() - 1);
  if (count) {
    const data = sheet.getRange(2, 1, count, width);
    // Keep captions in the underlying cell while showing only a compact preview.
    data.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    data.setVerticalAlignment('middle');
    // setRowHeights() permits auto-expansion for multiline captions.
    // The Forced variant guarantees compact heights even after fresh data is written.
    sheet.setRowHeightsForced(2, count, 64);
  }
  return 'Formatted ' + count + ' IG Extract rows. No Apify call or content changes.';
}


/** Resolve a pre-existing, single-cell Config named range before any paid API call.
 * The name must be created in Google Sheets; extraction must not silently skip status reporting.
 */
function _madsIGRefreshCell_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = ss.getSheetByName('Config');
  if (!config || String(config.getRange('A2').getValue()).trim() !== 'Last successful IG refresh')
    throw new Error('Config!A2 must say Last successful IG refresh before paid import.');
  const cell = config.getRange('B2');
  if (!cell || cell.getNumRows() !== 1 || cell.getNumColumns() !== 1)
    throw new Error('Config!B2 is not a valid single-cell refresh timestamp.');
  return cell;
}

function refreshMadsInstagram() {
  const token = PropertiesService.getScriptProperties().getProperty('APIFY_API_TOKEN');
  if (!token || token.trim().length < 12)
    throw new Error('Add the secret APIFY_API_TOKEN in Apps Script > Project Settings > Script properties.');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(2000)) throw new Error('Another Instagram import is currently running.');
  try {
    // Validate the required named range before making a potentially paid Apify request.
    const lastRefreshCell = _madsIGRefreshCell_();
    _madsRequireFourTabs_();
    // The Actor selected and tested in Apify Console is Instagram POST Scraper.
    const input = {
      username: [MADS_IG.username],
      resultsLimit: MADS_IG.postsPerRun,
      dataDetailLevel: 'detailedData',
      skipPinnedPosts: true
    };
    const response = UrlFetchApp.fetch(
      'https://api.apify.com/v2/acts/' + MADS_IG.actor +
      '/run-sync-get-dataset-items?format=json',
      {
        method: 'post',
        contentType: 'application/json',
        headers: {Authorization: 'Bearer ' + token.trim(), Accept: 'application/json'},
        payload: JSON.stringify(input),
        muteHttpExceptions: true,
        followRedirects: true
      }
    );
    if (response.getResponseCode() !== 200 && response.getResponseCode() !== 201) {
      throw new Error('Apify returned HTTP ' + response.getResponseCode() +
        '. Check your Apify Console Actor runs and account credits. Sheet contents were preserved.');
    }
    let items;
    try { items = JSON.parse(response.getContentText()); }
    catch (err) { throw new Error('Apify output was not valid JSON. Existing sheet content was preserved.'); }
    if (!Array.isArray(items) || !items.length)
      throw new Error('Apify returned no posts. Existing sheet content was preserved.');

    const stats = _madsSaveItems_(items);
    // Only record success after the API result was validated and the extract was written/formatted.
    // Text is explicitly formatted in Melbourne local time, regardless of spreadsheet timezone.
    const completedAt = new Date();
    lastRefreshCell.setNumberFormat('@');
    lastRefreshCell.setValue(Utilities.formatDate(completedAt, MADS_IG.timezone, 'dd/MM/yyyy HH:mm'));
    SpreadsheetApp.flush();
    PropertiesService.getScriptProperties().setProperty('MADS_IG_LAST_REFRESH', completedAt.toISOString());
    console.log('IG Extract refreshed: ' + stats.postsFromApify + ' current posts; ' + stats.totalPosts + ' total unique posts.');
    return stats;
  } finally {
    lock.releaseLock();
  }
}

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

/** Free offline test: no Apify calls, no Sheet writes. */
function testMadsInstagramMapping() {
  const items = [
    {shortCode:'DepxZd7yOJo',url:'https://www.instagram.com/p/DepxZd7yOJo/',
     type:'Video',productType:'clips',ownerUsername:'madsaboutcake',
     timestamp:'2026-10-18 22:43:52 UTC',caption:'Dumplings with @gagasforguthealth',
     displayUrl:'https://example.com/dumplings.jpg',likesCount:25,videoPlayCount:665},
    {shortCode:'De5TEHqEhhH',type:'Sidecar',productType:'carousel_container',
     ownerUsername:'madsaboutcake',timestamp:'2026-10-24T23:19:49Z',
     caption:'=2+2',displayUrl:'Proxied content',
     images:['https://example.com/carousel.webp']},
    {shortCode:'EXTRA123',ownerUsername:'other-user'}
  ];
  const rows = _madsNormalizePosts_(items);
  if (rows.length !== 2 || rows.some(r => r.length !== 9) ||
      rows[0][1] !== 'Reel' || rows[0][0] !== '2026-10-18' ||
      rows[0][5] !== "'@gagasforguthealth" || rows[0][8] !== 665 ||
      rows[1][1] !== 'Carousel' || rows[1][4] !== 'https://example.com/carousel.webp' ||
      rows[1][3] !== "'=2+2")
    throw new Error('IG Extract compact mapping test failed');
  return 'PASS: 9 columns, Reel/Carousel, dates, mentions, media fallback, metric and caption safety.';
}

/** Single write/merge implementation for normal and historical extractions. */
function _madsSaveItems_(items) {
  const incoming = _madsNormalizePosts_(items);
  if (!incoming.length) throw new Error('No valid @madsaboutcake posts returned. Sheet content preserved.');

  // Do not create or change the sheet until the API response is validated.
  setupMadsInstagram();
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(MADS_IG.tabName);
  const width = MADS_IG_HEADERS.length;
  const originalCount = Math.max(0, sheet.getLastRow() - 1);
  const existing = originalCount ? sheet.getRange(2, 1, originalCount, width).getValues() : [];
  const previous = new Map();
  existing.forEach(row => {
    const key = _madsShortCodeFromUrl_(row[2]);
    if (key && !previous.has(key)) previous.set(key, row);
  });
  const data = new Map();
  incoming.forEach(row => {
    const key = _madsShortCodeFromUrl_(row[2]);
    if (!key || data.has(key)) return;
    data.set(key, row);
  });
  previous.forEach((row, key) => { if (!data.has(key)) data.set(key, row); });
  const rows = Array.from(data.values())
    .sort((a, b) => String(b[0]).localeCompare(String(a[0])) || String(a[2]).localeCompare(String(b[2])))
    .slice(0, MADS_IG.maxSavedRows);
  if (!rows.length) throw new Error('No valid records to write. Sheet preserved.');
  if (sheet.getMaxRows() < rows.length + 1)
    sheet.insertRowsAfter(sheet.getMaxRows(), rows.length + 1 - sheet.getMaxRows());

  sheet.getRange(2, 1, rows.length, width).setValues(rows);
  if (originalCount > rows.length)
    sheet.getRange(rows.length + 2, 1, originalCount - rows.length, width).clearContent();
  sheet.getRange(2, 1, rows.length, 1).setNumberFormat('@');
  sheet.getRange(2, 1, rows.length, 3).setNumberFormat('@');
  // Apply formatting after all write operations have actually reached Sheets.
  SpreadsheetApp.flush();
  formatMadsIGExtract();
  SpreadsheetApp.flush();
  return {postsFromApify:incoming.length,totalPosts:rows.length,tab:MADS_IG.tabName};
}

/* Four-tab-only Google Sheets editor — matched to Mammabao's compact model. */
const MADS_COLUMNS=['item_id','title','instagram_url','product_type','occasion','style_tags',
 'show_on_website','featured','priority','short_description','other_occasions','alt_text','notes'];
function _madsRequireFourTabs_(){
 const ss=SpreadsheetApp.getActiveSpreadsheet();
 ['Read Me','Config','Creation Visibility','IG Extract'].forEach(name=>{
  if(!ss.getSheetByName(name))throw new Error('Missing '+name+'. Use the four-tab workbook.');
 });
 const cv=ss.getSheetByName('Creation Visibility');
 const actual=cv.getRange(1,1,1,MADS_COLUMNS.length).getValues()[0].map(String);
 if(actual.some((v,i)=>v!==MADS_COLUMNS[i]))throw new Error('Creation Visibility headers do not match the four-tab workbook.');
 return ss;
}
function _madsDropdown_(sheet,targetRange,optionRange){
 const rule=SpreadsheetApp.newDataValidation().requireValueInRange(optionRange,true)
  .setAllowInvalid(false).build();
 sheet.getRange(targetRange).setDataValidation(rule);
}
function setupMadsFourTabWorkbook(){
 const ss=_madsRequireFourTabs_();
 setupMadsInstagram();
 const cv=ss.getSheetByName('Creation Visibility'),co=ss.getSheetByName('Config');
 _madsDropdown_(cv,'D2:D500',co.getRange('D2:D50'));
 _madsDropdown_(cv,'E2:E500',co.getRange('E2:E50'));
 _madsDropdown_(cv,'G2:G500',co.getRange('G2:G50'));
 _madsDropdown_(cv,'H2:H500',co.getRange('H2:H50'));
 if(String(co.getRange('A2').getValue()).trim()!=='Last successful IG refresh')
  throw new Error('Config!A2 label changed; update it before running.');
 return 'Four tabs validated and Creation Visibility dropdowns refreshed; no Apify charge.';
}
function onOpen(){
 SpreadsheetApp.getUi().createMenu('Mads About Cake')
  .addItem('Refresh latest 30 IG posts','refreshMadsInstagram')
  .addSeparator()
  .addItem('Start full history import (once)','startMadsHistoryImport')
  .addItem('Collect finished history import','collectMadsHistoryImport')
  .addSeparator()
  .addItem('Set up dropdowns (free)','setupMadsFourTabWorkbook')
  .addToUi();
}
function _madsToken_(){
 const token=PropertiesService.getScriptProperties().getProperty('APIFY_API_TOKEN');
 if(!token||token.trim().length<12)throw new Error('Set APIFY_API_TOKEN under Apps Script Project Settings.');
 return token.trim();
}
function _madsGetJson_(url,opts){
 const res=UrlFetchApp.fetch(url,Object.assign({muteHttpExceptions:true,
  headers:{Authorization:'Bearer '+_madsToken_(),Accept:'application/json'}},opts||{}));
 if(res.getResponseCode()<200||res.getResponseCode()>=300)
  throw new Error('Apify HTTP '+res.getResponseCode()+'; inspect Apify Console for details.');
 try{return JSON.parse(res.getContentText());}
 catch{throw new Error('Apify returned non-JSON data.');}
}
/** Starts asynchronous ONE-TIME full history. Initial actor start can incur fees.
 * Separate collect action avoids Apps Script synchronous timeouts.
 */
function startMadsHistoryImport(){
 const ss=_madsRequireFourTabs_(),config=ss.getSheetByName('Config');
 _madsIGRefreshCell_();
 const previous=String(config.getRange('B4').getValue()||'').trim();
 const status=String(config.getRange('B3').getValue()||'');
 if(previous&&status!=='Failed')throw new Error('A history run is already recorded. Collect it before starting another billable run.');
 const payload=JSON.stringify({username:[MADS_IG.username],resultsLimit:500,
  dataDetailLevel:'detailedData',skipPinnedPosts:false});
 const result=_madsGetJson_('https://api.apify.com/v2/acts/'+MADS_IG.actor+'/runs',
  {method:'post',contentType:'application/json',payload});
 const run=result.data||result;
 if(!/^[A-Za-z0-9]+$/.test(String(run.id||'')))throw new Error('Actor did not return a valid run ID; check Apify Console before retrying.');
 config.getRange('B4').setNumberFormat('@');
 config.getRange('B4').setValue(run.id);
 config.getRange('B3').setValue('Running — collect after Apify finishes');
 return 'Started one full-history Actor run. No posts were imported yet. Run ID: '+run.id;
}
function collectMadsHistoryImport(){
 const ss=_madsRequireFourTabs_(),config=ss.getSheetByName('Config');
 const runId=String(config.getRange('B4').getValue()||'').trim();
 if(!/^[A-Za-z0-9]+$/.test(runId))throw new Error('No valid history run ID at Config!B4.');
 const response=_madsGetJson_('https://api.apify.com/v2/actor-runs/'+runId);
 const run=response.data||response;
 if(run.status==='RUNNING'||run.status==='READY')return 'History import is still running in Apify. Try collecting after it finishes.';
 if(run.status!=='SUCCEEDED')throw new Error('Actor status is '+run.status+'. Existing IG Extract preserved.');
 const dataset=String(run.defaultDatasetId||'');
 if(!/^[A-Za-z0-9]+$/.test(dataset))throw new Error('No dataset found on completed Actor.');
 const items=[];
 for(let offset=0;offset<600;offset+=100){
  const part=_madsGetJson_('https://api.apify.com/v2/datasets/'+dataset+
   '/items?format=json&clean=true&limit=100&offset='+offset);
  if(!Array.isArray(part))throw new Error('Unexpected dataset page. IG Extract was not changed.');
  items.push(...part);
  if(part.length<100)break;
 }
 if(!items.length)throw new Error('Completed history run yielded no posts. IG Extract preserved.');
 // Validate all item data before writing. Older posts are retained by the merge logic.
 const valid=_madsNormalizePosts_(items);
 if(!valid.length)throw new Error('No valid @madsaboutcake posts in historical dataset.');
 const stats=_madsSaveItems_(items);
 SpreadsheetApp.flush();
 const timestamp=Utilities.formatDate(new Date(),MADS_IG.timezone,'dd/MM/yyyy HH:mm');
 const refresh=_madsIGRefreshCell_();refresh.setNumberFormat('@');refresh.setValue(timestamp);
 config.getRange('B3').setValue('Collected '+stats.postsFromApify+' posts');
 SpreadsheetApp.flush();
 return 'History imported: '+stats.postsFromApify+' records retrieved; '+stats.totalPosts+' unique saved in IG Extract.';
}
