#!/usr/bin/env python3
"""Fetch real, free-licensed photos for products/projects from Wikimedia Commons
(CC/public-domain), center-crop to 4:3, save as assets/img/<name>.jpg.
Falls back to picsum.photos if Commons has no usable match. Run: python3 scripts/fetch-images.py"""
import json, io, os, sys, urllib.parse, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")
UA = "PSE-site-image-fetch/1.0 (https://powersolutions-sa.com; info@powersolutions-sa.com)"
SKIP = ("diagram","map","chart","graph","logo","icon","seal","flag","coat","plan",
        "drawing","schematic","poster","screenshot","label","symbol",".svg","svg",
        "landsat","satellite","iss-","aerial","from space","sentinel","topograph",
        "pride","parade","stamp","banknote","portrait")
USED = set()  # dedupe Commons titles across items

# Equipment = topical (location-neutral); KSA terms only where they yield real matches.
# Project scenes = Saudi-first so the gallery reads as KSA.
PRODUCTS = {
    "generators": ["diesel generator set", "power generator caterpillar"],
    "light-towers": ["mobile light tower", "construction light tower"],
    "power-distribution": ["electrical switchgear", "power distribution panel"],
    "ups": ["uninterruptible power supply", "UPS battery room"],
    "renewable-energy": ["KAPSARC solar Riyadh", "Saudi Arabia solar power", "solar power plant"],
    "monitoring-control": ["electrical control panel", "power plant control room"],
    "energy-management": ["Saudi Arabia power station", "electrical substation"],
    "custom-solutions": ["containerised generator", "portable power generator"],
}
PROJECTS = {
    "project-1": ["Riyadh skyline", "King Abdullah Financial District", "Kingdom Centre Riyadh"],
    "project-2": ["King Fahd International Stadium", "Riyadh night skyline"],
    "project-3": ["King Fahad Medical City", "King Faisal Specialist Hospital", "hospital Riyadh"],
    "project-4": ["King Abdullah Financial District construction", "Riyadh construction site", "construction crane"],
    "project-5": ["Riyadh Boulevard", "Jeddah corniche", "Riyadh Season"],
    "project-6": ["Saudi Arabia solar farm", "Sudair solar", "solar panels array"],
}

def get(url, binary=False, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read() if binary else r.read().decode("utf-8")

def commons_candidates(query):
    q = urllib.parse.urlencode({
        "action": "query", "generator": "search", "gsrsearch": query,
        "gsrnamespace": "6", "gsrlimit": "12", "prop": "imageinfo",
        "iiprop": "url|mime|size", "iiurlwidth": "1200", "format": "json",
    })
    data = json.loads(get("https://commons.wikimedia.org/w/api.php?" + q))
    pages = data.get("query", {}).get("pages", {})
    out = []
    for p in pages.values():
        ii = (p.get("imageinfo") or [{}])[0]
        out.append((p.get("title",""), ii))
    # search returns an 'index' order; sort by it to respect relevance
    out.sort(key=lambda t: pages_index(pages, t[0]))
    return out

def pages_index(pages, title):
    for p in pages.values():
        if p.get("title") == title:
            return p.get("index", 999)
    return 999

def crop_43(im, w=1000, h=750):
    im = im.convert("RGB")
    tr = w / h
    iw, ih = im.size
    ir = iw / ih
    if ir > tr:      # too wide -> crop sides
        nw = int(ih * tr); x = (iw - nw)//2; im = im.crop((x,0,x+nw,ih))
    else:            # too tall -> crop top/bottom
        nh = int(iw / tr); y = (ih - nh)//2; im = im.crop((0,y,iw,y+nh))
    return im.resize((w,h), Image.LANCZOS)

def save(im, name):
    path = os.path.join(IMG, name + ".jpg")
    crop_43(im).save(path, "JPEG", quality=82, optimize=True)
    return path

def try_commons(name, query):
    for title, ii in commons_candidates(query):
        mime = ii.get("mime",""); url = ii.get("thumburl") or ii.get("url")
        if mime not in ("image/jpeg","image/png") or not url: continue
        tl = title.lower()
        if title in USED: continue
        if any(s in tl for s in SKIP): continue
        tw, th = ii.get("thumbwidth",0), ii.get("thumbheight",0)
        if tw and th and tw < th*0.85: continue   # skip portrait
        try:
            im = Image.open(io.BytesIO(get(url, binary=True)))
            if im.size[0] < 500: continue
            save(im, name)
            USED.add(title)
            return title.replace("File:","")
        except Exception:
            continue
    return None

def fallback(name):
    im = Image.open(io.BytesIO(get(f"https://picsum.photos/seed/{name}/1000/750", binary=True)))
    save(im, name)
    return "picsum (generic)"

def main():
    items = list(PRODUCTS.items()) + list(PROJECTS.items())
    for name, queries in items:
        src = None; used = None
        for q in queries:
            try:
                src = try_commons(name, q)
            except Exception as e:
                print(f"  commons error {name} '{q}': {e}", file=sys.stderr); src = None
            if src: used = q; break
        if not src:
            try: src = fallback(name)
            except Exception as e: src = f"FAILED ({e})"
        print(f"{name:20s} [{used or 'fallback'}] <- {src}")

if __name__ == "__main__":
    main()
