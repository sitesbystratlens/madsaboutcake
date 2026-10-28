#!/usr/bin/env python3
"""One-time owner-preview asset import. Never hotlink temporary Instagram CDN URLs."""
import io, json, os, pathlib, sys, time, urllib.parse, urllib.request
from PIL import Image, ImageOps

root = pathlib.Path(__file__).resolve().parent.parent
manifest = json.loads((root/"scripts/featured-25-source-urls.json").read_text())
files = manifest["files"]
assert len(files) == 25 and len({f["path"] for f in files}) == 25
out = []
errors = []
for i, record in enumerate(files, 1):
    dest = root/record["path"]
    dest.parent.mkdir(parents=True, exist_ok=True)
    url=record["sourceUrl"]
    host=urllib.parse.urlparse(url).hostname or ""
    if not (url.startswith("https://") and (host.endswith(".instagram.com") or host.endswith(".cdninstagram.com") or host.endswith(".fbcdn.net"))):
        errors.append(f'{record["media"]}: URL host not allowed'); continue
    payload=None
    for attempt in range(3):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; MadsPreviewAssetImporter/1.0)","Accept":"image/avif,image/webp,image/*,*/*;q=0.8","Referer":"https://www.instagram.com/"})
            with urllib.request.urlopen(req,timeout=25) as res:
                if "image" not in res.headers.get("Content-Type","").lower():
                    raise ValueError("Not image MIME: "+res.headers.get("Content-Type",""))
                payload=res.read(12_000_000)
            if len(payload)<2000: raise ValueError("Image too small")
            break
        except Exception as exc:
            print(f"Attempt {attempt+1}: {record['media']}: {exc}",flush=True)
            time.sleep(min(3,attempt+1))
    if payload is None:
        errors.append(f'{record["media"]}: download failed'); continue
    try:
        src=Image.open(io.BytesIO(payload))
        src=ImageOps.exif_transpose(src)
        if src.width<450 or src.height<450:raise ValueError("Source resolution too low")
        if src.mode!="RGB":src=src.convert("RGB")
        src.thumbnail((1200,1600),Image.Resampling.LANCZOS)
        src.save(dest,format="WEBP",quality=81,method=6)
        if dest.stat().st_size<4000:raise ValueError("Output too small")
        out.append({"media":record["media"],"path":record["path"],"width":src.width,"height":src.height,"size":dest.stat().st_size})
        print(f'{i:02d}/25 {record["media"]}: {src.width}x{src.height} -> {dest.stat().st_size} bytes',flush=True)
    except Exception as exc:
        errors.append(f'{record["media"]}: {exc}')
if errors:
    print("Import incomplete; do NOT activate the gallery. Errors:",errors,file=sys.stderr)
    sys.exit(1)
assert len(out)==25
(root/"scripts/featured-25-import-report.json").write_text(json.dumps(out,indent=2)+"\n")
print("All 25 images imported and verified; safe to publish preview catalogue.",flush=True)
