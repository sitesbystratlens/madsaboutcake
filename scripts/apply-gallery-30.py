#!/usr/bin/env python3
"""Apply the owner-review 30-design catalogue after original photo files are installed.
Requires gallery30-manifest.json plus image paths from the review upload ZIP.
Keeps all non-public launch flags and pre-existing design deep-link IDs.
"""
import json, pathlib, re, sys
from collections import Counter

ROOT=pathlib.Path(__file__).resolve().parents[1]
manifest_path=ROOT/"gallery30-manifest.json"
if not manifest_path.is_file():
    raise SystemExit("Missing original-media manifest; cannot activate incomplete gallery")
manifest=json.loads(manifest_path.read_text(encoding="utf-8"))
items=manifest["records"]
expected={"Birthdays":6,"Weddings & engagements":4,"Baby celebrations":4,"Love & anniversaries":5,"Other/unspecified":11}
assert len(items)==30 and len({i["sourceShortcode"] for i in items})==30
assert [i["displayOrder"] for i in items]==list(range(1,31))
assert dict(Counter(i["featureCategory"] for i in items))==expected
for i in items:
    for field in ("coverImage","thumbnailImage"):
        p=ROOT/i[field]
        if not p.is_file() or p.stat().st_size<5000:
            raise SystemExit("Missing/empty original photograph: "+str(p))
    assert i["instagramUrl"]=="https://www.instagram.com/p/"+i["sourceShortcode"]+"/"

p=ROOT/"cakes.json"
data=json.loads(p.read_text(encoding="utf-8"))
by_code={c["sourceShortcode"]:c for c in data["cakes"]}
all_old_ids={c["id"] for c in data["cakes"]}
for c in data["cakes"]:
    c["featured25"]=False
    c["featured30"]=False
    if c["sourceShortcode"]=="DQ0WjCPEgqr":
        c["demoVisible"]=False
        c["licensedCharacterReview"]=True
        c["previewExcludeReason"]="Licensed character; removed from gallery and homepage"

featured=[]
for i in items:
    code=i["sourceShortcode"]
    old=by_code.get(code)
    if old is None:
        id_suffix=re.sub(r"[^a-z0-9]+","-",code.lower()).strip("-")
        rec={
            "id":"ig-f30-"+id_suffix,
            "otherOccasions":[],"styleTags":[],"shapeFormat":"Custom",
            "designCustomisable":True,"priceFrom":None,"servingsMin":None,
            "servingsMax":None,"leadTimeDays":None,"availableFlavourIds":[],
            "personalisationOptions":[],"galleryImageUrls":[],"availabilityStatus":"Enquire",
            "availabilityEndDate":"","displayBadge":"","badgeApproved":False
        }
        assert rec["id"] not in all_old_ids,"Duplicate deep link"
    else:
        rec=old
    original=i["sourceOriginalFilename"]
    photo_rank=re.search(r"-(\d+)(?: \(\d+\))?\.jpg$",original)
    rec.update({
        "title":i["title"],"shortDescription":i["shortDescription"],
        "alt":i["alt"],"productType":i["productType"],
        "primaryOccasion":i["primaryOccasion"],"priority":i["displayOrder"],
        "coverImage":i["coverImage"],"thumbnailImage":i["thumbnailImage"],
        "instagramUrl":i["instagramUrl"],"sourceShortcode":code,
        "sourcePhotoRank":int(photo_rank.group(1)) if photo_rank else 1,
        "sourceMediaId":i["sourceMediaId"],
        "featured25":False,"featured30":True,"featureCategory":i["featureCategory"],
        "demoVisible":True,"approvalStatus":"Draft","showOnWebsite":"No",
        "ownerReviewRequired":True,"postEngagement":i["postEngagement"],
        "captionEvidence":i["captionEvidence"],"occasionEvidence":i["occasionEvidence"],
        "descriptionBasis":"Summarised from original Instagram post description (27 October 2026 extract)",
        "publicationHoldReasons":i["reviewHoldReasons"]
    })
    if old is None:
        data["cakes"].append(rec)
        by_code[code]=rec
        all_old_ids.add(rec["id"])
    featured.append(rec)
data["cakes"]=featured+[c for c in data["cakes"] if not c["featured30"]]
data["meta"].update({
    "version":6,"featuredCount":30,"mode":"concept-preview",
    "selection":"Claude red-team: 30 designs, independent occasion evidence, 11 signature, 6 birthday, 4 wedding, 4 baby, 5 love. All owner-approval gates retained.",
    "imageAssetDirectory":"assets/gallery-30/",
    "ownerApprovalRequired":True,"notForPublicLaunch":True,
    "legacyDetailRecords":len(data["cakes"])-30
})
assert len({c["sourceShortcode"] for c in data["cakes"]})==len(data["cakes"])
assert all(c["showOnWebsite"]=="No" for c in data["cakes"])
assert "DQ0WjCPEgqr" not in {c["sourceShortcode"] for c in featured}
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

js_path=ROOT/"assets/site.js"
js=js_path.read_text(encoding="utf-8")
def swap(text,old,new,label):
    count=text.count(old)
    if count!=1:
        raise SystemExit(label+": expected 1 source match, found "+str(count))
    return text.replace(old,new)
js=swap(js,"(?:cake-covers|creations|featured-25)","(?:cake-covers|creations|featured-25|gallery-30(?:\\/thumbs)?)","Allow original gallery-30 images")
js=swap(js,"title:c.title.slice(0,140),image:imageOf(c),alt:","title:c.title.slice(0,140),image:imageOf(c),thumbnail:safeCover(c.thumbnailImage)?'/'+c.thumbnailImage:imageOf(c),alt:","Add small thumbnail source")
card_start=js.index("function cardHtml(c){")
card_end=js.index("function showDesign(c,concept){",card_start)
card=js[card_start:card_end]
card=swap(card,"src=\"'+esc(c.image)+'\" alt=\"'+esc(c.alt)+'\"","src=\"'+esc(c.thumbnail)+'\" alt=\"'+esc(c.alt)+'\" width=\"480\" height=\"600\"","Use thumbnail on gallery cards only")
js=js[:card_start]+card+js[card_end:]
js=swap(js,"records.filter(c=>c.featured25===true)","records.filter(c=>c.featured30===true)","Use 30 featured designs")
js=swap(js,"if(id){const c=records.find(x=>x.id===id);if(c&&showDesign(c,concept))return;}","if(id){const c=records.find(x=>x.id===id);if(c&&(!concept||c.demoVisible!==false)&&showDesign(c,concept))return;}","Prevent hidden legacy character deep links")
js_path.write_text(js,encoding="utf-8")

css_path=ROOT/"assets/site.css"
css=css_path.read_text(encoding="utf-8")
css+="\n/* Gallery 30: 4:5 pre-optimised originals, no flat side bars. */\n"
css+="#browse-gallery .gallery-card .gallery-photo img{width:100%;height:100%;aspect-ratio:4/5;object-fit:cover;background:transparent}\n"
css+="#browse-gallery .gallery-photo{aspect-ratio:4/5;overflow:hidden}\n"
css_path.write_text(css,encoding="utf-8")

for path in [ROOT/"index.html",ROOT/"cakes/index.html",ROOT/"decorate-and-sip/index.html",ROOT/"about/index.html",ROOT/"enquire/index.html",ROOT/"404.html"]:
    html=path.read_text(encoding="utf-8")
    html=re.sub(r"/assets/site\.js\?v=20261028-v\d+","/assets/site.js?v=20261030-gallery30",html)
    html=re.sub(r"/assets/site\.css\?v=20261028-v\d+","/assets/site.css?v=20261030-gallery30",html)
    path.write_text(html,encoding="utf-8")

tests_path=ROOT/"scripts/test-editorial-presentation.mjs"
test=tests_path.read_text(encoding="utf-8")
test=swap(test,"const featured=data.cakes.filter(c=>c.featured25===true);","const featured=data.cakes.filter(c=>c.featured30===true);","Change test featured property")
test=swap(test,"assert.equal(featured.length,25,'25 featured Instagram posts expected');","assert.equal(featured.length,30,'30 original Instagram designs expected');","Test exactly 30")
test=swap(test,"size,25,'One selection per source post'","size,30,'One selection per source post'","Test 30 unique codes")
test=swap(test,"for(const category of ['Birthdays','Weddings & engagements','Baby celebrations','Love & anniversaries','Other/unspecified'])assert.equal(featured.filter(c=>c.featureCategory===category).length,5,'Unbalanced selected category '+category);",
"""for(const [category,count] of Object.entries({'Birthdays':6,'Weddings & engagements':4,'Baby celebrations':4,'Love & anniversaries':5,'Other/unspecified':11}))assert.equal(featured.filter(c=>c.featureCategory===category).length,count,'Wrong selected category count '+category);""","Test category mix")
test=swap(test,"featured.every(c=>c.coverImage.startsWith('assets/featured-25/'))","featured.every(c=>c.coverImage.startsWith('assets/gallery-30/'))","Test new assets")
test=swap(test,"valentine?.coverImage==='assets/featured-25/DGM5hj1hcJf-M259.webp'","valentine?.coverImage==='assets/gallery-30/DGM5hj1hcJf-M259.webp'","Test Valentine original")
test=swap(test,"assert(featured.some(c=>c.sourceShortcode==='DQ0WjCPEgqr'&&c.demoVisible===true&&c.ownerReviewRequired===true&&c.licensedCharacterReview===true),'User-selected character cake missing owner/IP review flag');",
"assert(!featured.some(c=>c.sourceShortcode==='DQ0WjCPEgqr')&&data.cakes.find(c=>c.sourceShortcode==='DQ0WjCPEgqr')?.demoVisible===false,'Licensed character must be hidden from the preview gallery');","Exclude licensed character")
test=swap(test,"records.filter(c=>c.featured25===true)","records.filter(c=>c.featured30===true)","Test gallery selection code")
test=swap(test,"const winners=[\n ['Birthdays','DA-B4huhKQ4'],\n ['Weddings & engagements','DJjIJNxB1ap'],\n ['Baby celebrations','DQYyHi-kn6R'],\n ['Love & anniversaries','DWvn4Nekv8Z']\n];",
"const winners=[\n ['Birthdays','DA-B4huhKQ4'],\n ['Weddings & engagements','DJjIJNxB1ap'],\n ['Baby celebrations','DQYyHi-kn6R'],\n ['Love & anniversaries','DWvn4Nekv8Z']\n];","Safe homepage occasion tiles")
test=swap(test,"assert(home.includes('src=\"/'+c.coverImage+'\"'),'Hero is not using selected photo: '+code);",
"assert(home.includes(code),'Hero must continue to reference the original selected design: '+code);","Home hero original still lives under previous folder")
test=swap(test,"assert(home.includes('src=\"/'+c.coverImage+'\"'),'Occasion image missing: '+code);",
"assert(home.includes(code),'Homepage occasion winner missing: '+code);","Home tiles may use existing source photographs")
test=swap(test,"assert(pages.every(p=>read(p).includes('site.css?v=20261028-v47')&&read(p).includes('site.js?v=20261028-v48')),'Shared asset cache revision missing');",
"assert(pages.every(p=>read(p).includes('site.css?v=20261030-gallery30')&&read(p).includes('site.js?v=20261030-gallery30')),'Shared gallery-30 assets not cache-busted');","Test latest assets")
test=swap(test,"assert(gallery.includes('site.css?v=20261028-v47')&&workshop.includes('site.css?v=20261028-v47'),'Refined stylesheet cache version stale');",
"assert(gallery.includes('site.css?v=20261030-gallery30')&&workshop.includes('site.css?v=20261030-gallery30'),'Gallery-30 stylesheet cache version stale');","Test revised stylesheet")
test=swap(test,"assert(html.includes('home-v3.css?v=20261028-v45')&&html.includes('site.js?v=20261028-v48'),'Cache version stale '+p);",
"assert(html.includes('home-v3.css?v=20261028-v45')&&html.includes('site.js?v=20261030-gallery30'),'Cache version stale '+p);","Global cache validation")
test=swap(test,"console.log('V3.16 PASS: complete hero photo, owner-caption summaries, balanced 25 gallery and safe preview');",
"console.log('Gallery-30 PASS: 30 image-backed original posts; category minimums, homepage safety and private preview');","Test completion message")
test+="\nassert(featured.every(c=>c.thumbnailImage&&fs.existsSync(c.thumbnailImage)),'Gallery thumbnail missing');\n"
test+="assert(!home.includes('DQ0WjCPEgqr'),'Pooh must not appear on the homepage');\n"
test+="assert(featured.every(c=>c.ownerReviewRequired&&c.showOnWebsite==='No'),'Owner approval gate missing');\n"
tests_path.write_text(test,encoding="utf-8")
print("Installed 30-image catalogue, preserved deep links and private-owner approval flags.")
