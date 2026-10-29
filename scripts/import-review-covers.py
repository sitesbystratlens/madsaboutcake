#!/usr/bin/env python3
"""One-time owner-review cover import from explicitly enumerated public Instagram posts.

No profile crawling, login, or client-side Instagram requests. Failed covers stay
missing with an honest review-page fallback, never a substituted stock image.
"""
import concurrent.futures
import html
import io
import json
import re
import sys
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

import requests
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'data/gallery-review-candidates.json').read_text())
CATALOGUE = json.loads((ROOT / 'cakes.json').read_text())
# Signed CDN source links are a one-time import input; do not leave them on the published static site.
SOURCE_URL_FILE = ROOT / 'data/gallery-review-photo-urls.json'
SOURCE_MEDIA = json.loads(SOURCE_URL_FILE.read_text()).get('urls', {}) if SOURCE_URL_FILE.is_file() else {}
DEST = ROOT / 'assets/gallery-review-covers'
DEST.mkdir(parents=True, exist_ok=True)
SHORT = re.compile(r'^[A-Za-z0-9_-]{5,32}$')
HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
           'Accept-Language': 'en-US,en;q=0.9'}
MAX_BYTES = 8_000_000

class MetaReader(HTMLParser):
    def __init__(self):
        super().__init__()
        self.image = ''
    def handle_starttag(self, tag, attrs):
        if tag != 'meta' or self.image: return
        a = dict(attrs)
        if (a.get('property') or a.get('name')) in ('og:image', 'twitter:image'):
            self.image = html.unescape(a.get('content', ''))

def allowed_image(url):
    u = urlparse(url)
    host = (u.hostname or '').lower()
    return u.scheme == 'https' and not u.username and not u.password and (host.endswith('.cdninstagram.com') or host == 'cdninstagram.com' or host.endswith('.fbcdn.net') or host == 'fbcdn.net' or host.endswith('.instagram.com') or host == 'instagram.com')

def read_image(s, code):
    if not allowed_image(s): raise ValueError('IG image host not allowed')
    r = requests.get(s, timeout=17, headers={**HEADERS, 'Referer': 'https://www.instagram.com/'}, stream=True)
    r.raise_for_status()
    if not allowed_image(r.url): raise ValueError('Unsafe redirect')
    parts = []; size = 0
    for part in r.iter_content(64*1024):
        size += len(part)
        if size > MAX_BYTES: raise ValueError('image too large')
        parts.append(part)
    raw = b''.join(parts)
    with Image.open(io.BytesIO(raw)) as orig:
        im = ImageOps.exif_transpose(orig)
        if im.width < 250 or im.height < 250: raise ValueError('image too small')
        im = im.convert('RGB')
        im.thumbnail((1050, 1350), Image.Resampling.LANCZOS)
        out = DEST / (code + '.webp')
        im.save(out, 'WEBP', quality=83, method=5)
    return f'SAVED {code}: {out.stat().st_size} bytes'

def import_one(code):
    messages = []
    # Prefer the already-collected, per-post source photo. Instagram page HTML
    # no longer exposes OG images consistently to unauthenticated requests.
    direct = SOURCE_MEDIA.get(code, '')
    if direct:
        try:
            return read_image(direct, code)
        except Exception as e:
            messages.append(f'direct image {type(e).__name__}: {str(e)[:95]}')
    try:
        u = 'https://www.instagram.com/p/' + code + '/'
        r = requests.get(u, timeout=17, headers=HEADERS)
        r.raise_for_status()
        if urlparse(r.url).hostname not in ('www.instagram.com','instagram.com','m.instagram.com'):
            raise ValueError('Unexpected post redirect')
        reader = MetaReader(); reader.feed(r.text[:1_500_000])
        if not reader.image: raise ValueError('Instagram OG image not available')
        return read_image(reader.image, code)
    except Exception as e:
        messages.append(f'OG fallback {type(e).__name__}: {str(e)[:95]}')
        return f'FAILED {code}: ' + ' | '.join(messages)

def main():
    codes=list(dict.fromkeys(DATA['birthdayConfirmed']+DATA['birthdayThemed']+DATA['cupcakes']))
    if len(codes)!=70 or not all(SHORT.fullmatch(c) for c in codes):
        raise SystemExit('Unexpected candidate inventory; refusing to import')
    existing={c.get('sourceShortcode') for c in CATALOGUE['cakes'] if (ROOT / str(c.get('coverImage',''))).is_file()}
    missing=[c for c in codes if c not in existing and not (DEST/(c+'.webp')).is_file()]
    print(f'Review candidates: {len(codes)}, existing site covers: {len(set(codes)&existing)}, to fetch: {len(missing)}',flush=True)
    if '--check' in sys.argv:
        return
    results=[]
    # Small worker pool to avoid hammering Instagram and to stay within CI limits.
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        futures=[pool.submit(import_one, code) for code in missing]
        for f in concurrent.futures.as_completed(futures):
            outcome=f.result()
            print(outcome,flush=True)
            results.append(outcome)
    successes=sum(x.startswith('SAVED') for x in results)
    failures=[x for x in results if x.startswith('FAILED')]
    (ROOT / 'data/review-import-report.json').write_text(json.dumps({'uniquePosts':len(codes),'coversAlreadyLocal':len(set(codes)&existing),'downloaded':successes,'missing':failures},indent=2)+'\n')
    print(f'Complete: {successes} imported, {len(failures)} unavailable',flush=True)
    # A partial import is still useful; missing covers are reported accurately by the review site.

if __name__=='__main__': main()
