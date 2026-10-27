/**
 * Mads About Cake · Apify Instagram Post Scraper → existing "IG Extract" Google Sheet tab
 * No automatic publication. Writes IG Extract, Instagram Intake and Config!ig_refresh.
 *
 * 1. Paste into Extensions → Apps Script of the Mads About Cake workbook and save.
 * 2. Store APIFY_API_TOKEN privately under Project Settings → Script properties.
 * Instagram-only module: exports refreshMadsInstagram() and data helpers.
 * Also exposes the Mads Content menu and an owner-review intake; no Socials Dash.
 * Run Setup once; then Refresh IG data on demand. No schedule or Task ID is required.
 *
 * Provides a compact 9-column link-picking list; imports are invoked on demand.
 * Retains previously imported posts while preserving owner-editable review columns.
 */
const MADS_IG = Object.freeze({
  tabName: 'IG Extract',
  username: 'madsaboutcake',
  actor: 'apify~instagram-post-scraper',
  postsPerRun: 30,         // Latest 30 per manual import; existing older posts are retained.
  maxSavedRows: 300,
  timezone: 'Australia/Melbourne'
});

// A–I only. This is a discovery/link-copying workspace, not an approvals tracker.
const MADS_IG_HEADERS = [
  'posted_at', 'post_type', 'post_url', 'caption', 'cover_image_url',
  'mentions_tags', 'paid_partnership', 'likes', 'views'
];
// Recognise the previous layout exactly before deleting any columns.
const MADS_IG_OLD_HEADERS = MADS_IG_HEADERS.concat(['review_status', 'notes']);

function setupMadsInstagramExtract() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(MADS_IG.tabName);
  if (!sheet) sheet = ss.insertSheet(MADS_IG.tabName);
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
  formatMadsInstagramExtract();
  return 'IG Extract is ready (9 columns). Recipes, collaborations and the website are unchanged.';
}

/** Apply a concise, readable layout to existing data WITHOUT starting a billable Apify run. */
function formatMadsInstagramExtract() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(MADS_IG.tabName);
  if (!sheet) throw new Error('IG Extract does not exist yet. Run setupMadsInstagramExtract first.');
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
  const cell = ss.getRangeByName('ig_refresh');
  if (!cell || cell.getSheet().getName() !== 'Config' ||
      cell.getNumRows() !== 1 || cell.getNumColumns() !== 1) {
    throw new Error("Before calling Apify, create a single-cell named range 'ig_refresh' on the Config tab.");
  }
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
    // Fail without incurring Apify charges when owner-maintained intake columns differ.
    _madsEnsureIntake_(false);
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

    const incoming = _madsNormalizePosts_(items);
    if (!incoming.length) throw new Error('No valid @madsaboutcake posts returned. Sheet content preserved.');

    // Do not create or change the sheet until the API response is validated.
    setupMadsInstagramExtract();
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
    formatMadsInstagramExtract();
    SpreadsheetApp.flush();
    // Mirror the extracted posts into the owner review sheet, never overwriting Q:X.
    _madsPopulateIntake_(items);
    SpreadsheetApp.flush();
    // Only record success after the API result was validated and the extract was written/formatted.
    // Text is explicitly formatted in Melbourne local time, regardless of spreadsheet timezone.
    const completedAt = new Date();
    lastRefreshCell.setNumberFormat('@');
    lastRefreshCell.setValue(Utilities.formatDate(completedAt, MADS_IG.timezone, 'dd/MM/yyyy HH:mm'));
    SpreadsheetApp.flush();
    PropertiesService.getScriptProperties().setProperty('MADS_IG_LAST_REFRESH', completedAt.toISOString());
    console.log('IG Extract refreshed: ' + incoming.length + ' current posts; ' +
      rows.length + ' total unique posts. No website publishing.');
    return {postsFromApify: incoming.length, totalPosts: rows.length, tab: MADS_IG.tabName};
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


/* Mads About Cake: importer setup, review workspace and publication guard.
 * Raw IG Extract A:I mirrors the tested Mammabao implementation.
 * Instagram Intake A:P is extractor-owned; Q:X is edited/approved by the owner.
 */
const MADS_INTAKE_HEADERS = [
  'shortcode','instagram_url','media_type','posted_at','caption','hashtags',
  'cover_url_temporary','carousel_urls_temporary','image_count','likes','comments',
  'last_imported_at','suggested_product_type','suggested_occasion',
  'suggested_style_tags','suggested_title','owner_product_type','owner_occasion',
  'owner_style_tags','owner_title','owner_decision','workflow_status',
  'apify_run_id','owner_notes'
];
const MADS_PRODUCT_TYPES = ['Cake','Cupcakes','Other Treats'];
const MADS_OCCASIONS = [
  'Birthdays','Weddings & Engagements','Baby Showers & Gender Reveals',
  'Anniversaries','Religious & Cultural','Graduations','Corporate & Events',
  'Other Celebrations'
];

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Mads Content')
    .addItem('Set up Instagram tabs (free)', 'setupMadsInstagram')
    .addItem('Refresh IG data (Apify)', 'refreshMadsInstagram')
    .addSeparator()
    .addItem('Add reviewed posts to Portfolio', 'promoteMadsIntakeToPortfolio')
    .addToUi();
}

/** Setup is nonbillable. Avoid replacing existing Config settings. */
function setupMadsInstagram() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let config = ss.getSheetByName('Config');
  if (!config) {
    config = ss.insertSheet('Config');
    config.getRange('A1:B1').setValues([['Mads About Cake · extract status','Last completed (Melbourne time)']]);
    config.getRange('A2').setValue('Instagram import');
    config.getRange('A1:B1').setBackground('#fadeDB').setFontColor('#553047').setFontWeight('bold');
    config.setColumnWidth(1, 240); config.setColumnWidth(2, 230);
  }
  const named = ss.getRangeByName('ig_refresh');
  if (named) {
    if (named.getSheet().getName() !== 'Config' || named.getNumRows() !== 1 ||
        named.getNumColumns() !== 1)
      throw new Error("Existing named range ig_refresh must be exactly one Config cell. No changes made.");
  } else {
    const cell=config.getRange('B2');
    if (cell.getFormula() || cell.getValue() !== '')
      throw new Error("Config!B2 already contains content. Choose an empty cell and create named range ig_refresh.");
    ss.setNamedRange('ig_refresh', cell);
  }
  setupMadsInstagramExtract();
  _madsEnsureIntake_(true);
  return 'Ready: IG Extract (9 columns), Instagram Intake (24 columns), Config!ig_refresh. No Apify request made.';
}

/** Validates layout. Existing owner fields are never reset or recreated. */
function _madsEnsureIntake_(createIfMissing) {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  let sheet=ss.getSheetByName('Instagram Intake');
  if (!sheet && !createIfMissing) throw new Error('Missing Instagram Intake tab. Run Set up Instagram tabs before any paid refresh.');
  if (!sheet) sheet=ss.insertSheet('Instagram Intake');
  if (sheet.getMaxColumns()<MADS_INTAKE_HEADERS.length) sheet.insertColumnsAfter(sheet.getMaxColumns(),MADS_INTAKE_HEADERS.length-sheet.getMaxColumns());
  const width=MADS_INTAKE_HEADERS.length;
  const headers=sheet.getRange(1,1,1,width).getValues()[0].map(x=>String(x).trim());
  if (headers.every(h=>!h)) {
    if (!createIfMissing)throw new Error('Instagram Intake headings are blank: run free setup before scraping.');
    sheet.getRange(1,1,1,width).setValues([MADS_INTAKE_HEADERS]);
    sheet.getRange(1,1,1,width).setBackground('#A82D62').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(2);
  } else if (headers.some((h,i)=>h!==MADS_INTAKE_HEADERS[i])) {
    throw new Error('Instagram Intake header mismatch. Columns A:X must match v5 workbook. Existing owner work was not overwritten.');
  }
  return sheet;
}

function _madsTypeForIntake_(item,rawType) {
  const p=String(item.productType||'').toLowerCase(),t=String(item.type||'').toLowerCase();
  return p==='clips'||t==='reel'?'Reel':p==='carousel_container'||t==='sidecar'?'Carousel':rawType||'Photo';
}

function _madsGuessFromCaption_(caption,shortCode) {
  const s=String(caption||'').toLowerCase(),styles=[];
  const product=/\bcupcakes?\b|\bcup cake\b/.test(s)?'Cupcakes':/\bcakes?\b|\bbuttercream\b|\blambeth\b/.test(s)?'Cake':'';
  let occasion='';
  if(/wedding|bridal|bride|engagement|fianc[eé]/.test(s))occasion='Weddings & Engagements';
  else if(/baby shower|gender reveal|oh baby|boy or girl/.test(s))occasion='Baby Showers & Gender Reveals';
  else if(/birthday|bday|turning\s+\d+/.test(s))occasion='Birthdays';
  else if(/anniversary/.test(s))occasion='Anniversaries';
  else if(/christen|baptis|communion|eid|diwali|ramadan/.test(s))occasion='Religious & Cultural';
  else if(/graduat/.test(s))occasion='Graduations';
  else if(/corporate|work event|office event/.test(s))occasion='Corporate & Events';
  if(/vintage|lambeth|ruffle|piping|piped/.test(s))styles.push('Vintage piping');
  if(/floral|flower|bloom|rose/.test(s))styles.push('Floral');
  if(/bow|ribbon/.test(s))styles.push('Bows & ribbons');
  if(/novelty|character|cartoon/.test(s))styles.push('Novelty / character');
  if(/minimal|simple|understated/.test(s))styles.push('Minimal');
  if(/sculptural|texture/.test(s))styles.push('Sculptural');
  const first=String(caption||'').split(/\r?\n/)[0].replace(/#[\w]+/g,'').trim();
  return {product,occasion,styles:styles.join('; '),
    title:first.length>=4&&first.length<=80?first:'Instagram creation '+shortCode};
}

/** Instagram URLs are references, not durable hotlinked website media. */
function _madsIntakeRow_(item) {
  const raw=_madsNormalizePosts_([item])[0];if (!raw)return null;
  const code=_madsShortCodeFromUrl_(raw[2]);
  if (!code)return null;
  const captions=String(item.caption||'');
  const hashtags=[...new Set([...captions.matchAll(/#([a-zA-Z0-9_]+)/g)].map(x=>x[1]))].join('; ');
  const sources=[item.displayUrl, ...(Array.isArray(item.images)?item.images:[]),
     ...(Array.isArray(item.childPosts)?item.childPosts.map(p=>p&&p.displayUrl):[])];
  const images=[...new Set(sources.filter(x=>typeof x==='string'&&/^https:\/\//i.test(x)))].slice(0,15);
  const guess=_madsGuessFromCaption_(captions,code);
  const now=Utilities.formatDate(new Date(),MADS_IG.timezone,'yyyy-MM-dd HH:mm:ss');
  const vals=[
    code,raw[2],_madsTypeForIntake_(item,raw[1]),raw[0],raw[3],hashtags,
    raw[4],images.map(x=>_madsSafeCell_(x)).join('; '),images.length||'',raw[7],
    _madsNumber_(item.commentsCount),now,guess.product,guess.occasion,
    guess.styles,guess.title
  ].map((x,i)=>typeof x==='string'?_madsSafeCell_(x):x);
  return {code,values:vals};
}

/** Upsert only source columns A:L for existing rows. Preserve M:X, including owner Q:X.
 * Suggestions M:P are created once and never overwritten on future refreshes.
 */
function _madsPopulateIntake_(items) {
  const sheet=_madsEnsureIntake_(false), count=Math.max(0,sheet.getLastRow()-1);
  const ids=count?sheet.getRange(2,1,count,1).getValues().flat():[];
  const existing=new Map();
  ids.forEach((id,i)=>{if(id&&!existing.has(String(id)))existing.set(String(id),i+2);});
  const seen=new Set(), additions=[], updates=[];
  for(const item of items) {
    const row=_madsIntakeRow_(item);if(!row||seen.has(row.code))continue;
    seen.add(row.code);
    if(existing.has(row.code))updates.push({at:existing.get(row.code),values:row.values.slice(0,12)});
    else{
      const full=row.values.concat(['','','','','Review','New','Direct Apify refresh','']);
      if(full.length!==24)throw new Error('Internal intake schema mismatch');
      additions.push(full);
      existing.set(row.code,sheet.getLastRow()+additions.length);
    }
  }
  if(!updates.length&&!additions.length)throw new Error('Apify returned no valid posts for Instagram Intake; old sheet retained.');
  if(count+additions.length>1000)throw new Error('Instagram Intake would exceed 1000 rows; archive old rows before refreshing.');
  for(const change of updates)sheet.getRange(change.at,1,1,12).setValues([change.values]);
  if(additions.length) {
    const row=sheet.getLastRow()+1;
    if(sheet.getMaxRows()<row+additions.length-1)sheet.insertRowsAfter(sheet.getMaxRows(),row+additions.length-1-sheet.getMaxRows());
    sheet.getRange(row,1,additions.length,24).setValues(additions);
  }
  console.log('Instagram Intake: '+additions.length+' new, '+updates.length+' existing source rows updated; owner classifications unchanged.');
  return {newPosts:additions.length,updatedPosts:updates.length};
}

function _madsPortfolioId_(shortCode) {
  // GitHub site identifiers allow lowercase letters, numbers and hyphens only.
  // Hex-encode the case-sensitive IG shortcode so two differently cased IDs never collide.
  return 'ig-'+[...String(shortCode)].map(ch=>ch.charCodeAt(0).toString(16).padStart(2,'0')).join('');
}

/** Editorial approval for intake only. Does NOT publish to the website.
 * Product/occasion/title must be reviewed; Portfolio receives Draft + No.
 */
function promoteMadsIntakeToPortfolio() {
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(3000))throw new Error('Another content operation is in progress.');
  try{
    const ss=SpreadsheetApp.getActiveSpreadsheet(),intake=_madsEnsureIntake_(false);
    const p=ss.getSheetByName('Portfolio');if(!p)throw new Error('Missing Portfolio tab');
    const n=p.getLastColumn();
    const headers=p.getRange(1,1,1,n).getValues()[0].map(String);
    const required=['item_id','title','product_type','primary_occasion','instagram_url','show_on_website','approval_status'];
    required.forEach(k=>{if(!headers.includes(k))throw new Error('Portfolio is missing '+k);});
    const size=Math.max(0,p.getLastRow()-1);
    const existing=new Set(size?p.getRange(2,headers.indexOf('item_id')+1,size,1).getValues().flat().map(String):[]);
    const cnt=Math.max(0,intake.getLastRow()-1);
    if(!cnt)return 'Nothing in Instagram Intake';
    const rows=intake.getRange(2,1,cnt,24).getValues(),append=[],promoted=[],issues=[];
    const set=(target,name,val)=>{const i=headers.indexOf(name);if(i>=0)target[i]=val;};
    const priorities=size&&headers.includes('gallery_order')?p.getRange(2,headers.indexOf('gallery_order')+1,size,1).getValues().flat().map(Number).filter(Number.isFinite):[];
    let priority=Math.max(0,...priorities)+10;
    rows.forEach((r,i)=>{
      if(r[20]!=='Approve for portfolio'||r[21]==='Added to Portfolio')return;
      const shortCode=String(r[0]||'');
      if(!/^[A-Za-z0-9_-]{5,80}$/.test(shortCode)) {issues.push('Row '+(i+2)+': invalid shortcode');return;}
      const id=_madsPortfolioId_(shortCode);
      if(existing.has(id)){intake.getRange(i+2,22).setValue('Already in Portfolio');return;}
      const product=String(r[16]||r[12]||'').trim(),occasion=String(r[17]||r[13]||'').trim(),title=String(r[19]||r[15]||'').trim();
      if(!MADS_PRODUCT_TYPES.includes(product)||!MADS_OCCASIONS.includes(occasion)||title.length<3){
        issues.push('Row '+(i+2)+': valid product, occasion and title required');return;
      }
      const dest=Array(n).fill('');
      set(dest,'item_id',id);set(dest,'title',title);set(dest,'product_type',product);
      set(dest,'primary_occasion',occasion);set(dest,'style_tags',String(r[18]||r[14]||''));
      set(dest,'instagram_url',String(r[1]||''));
      set(dest,'alt_text','Mads About Cake creation — '+title);
      set(dest,'featured_home','No');set(dest,'gallery_order',priority);
      set(dest,'show_on_website','No');set(dest,'approval_status','Draft');
      set(dest,'published_date',String(r[3]||''));
      set(dest,'internal_notes','Imported from reviewed Instagram Intake. Confirm design, image rights and publish approval.');
      append.push(dest);existing.add(id);promoted.push(i+2);priority+=10;
    });
    if(append.length){
      const r=p.getLastRow()+1;if(p.getMaxRows()<r+append.length-1)p.insertRowsAfter(p.getMaxRows(),r+append.length-1-p.getMaxRows());
      p.getRange(r,1,append.length,n).setValues(append);
      SpreadsheetApp.flush();
      promoted.forEach(i=>intake.getRange(i,22).setValue('Added to Portfolio'));
    }
    return append.length+' designs added to Portfolio as Draft/No (not published). '+issues.join('; ');
  } finally{lock.releaseLock();}
}

function testMadsIntakeMapping() {
  const test={ownerUsername:'madsaboutcake',shortCode:'ABCde0123',type:'Sidecar',productType:'carousel_container',
    caption:'Birthday cupcake box with bows #birthday',timestamp:'2026-10-25T00:10:00Z',
    displayUrl:'https://example.com/cake.jpg',likesCount:14,commentsCount:2};
  const out=_madsIntakeRow_(test);
  if(!out||out.code!=='ABCde0123'||out.values.length!==16||
      out.values[12]!=='Cupcakes'||out.values[13]!=='Birthdays'||
      !out.values[14].includes('Bows & ribbons')||
      !/^ig-[a-f0-9]+$/.test(_madsPortfolioId_(out.code)))
    throw new Error('Mads Instagram Intake mapping test failed');
  return 'PASS: import mapping and reversible shortcode ID transformation';
}
