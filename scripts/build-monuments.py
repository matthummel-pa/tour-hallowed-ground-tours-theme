#!/usr/bin/env python3
"""Build data/monuments.json from OSM + public-domain Wikimedia Commons photos."""
from __future__ import annotations

import json
import math
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "monuments.json"
UA = "HallowedGroundConcept/1.0 (Gettysburg map; educational concept site)"
OVERPASS = "https://overpass-api.de/api/interpreter"
COMMONS = "https://commons.wikimedia.org/w/api.php"
BBOX = (39.78, -77.265, 39.852, -77.215)
PD_HINTS = (
    "public domain",
    "pd-",
    "pd/",
    "cc0",
    "us government",
    "pd-usgov",
    "work of the united states",
    "pd-old",
    "pd-us",
    "no known copyright",
    "copyright expired",
)


def get_json(url: str, data: bytes | None = None) -> dict:
    req = urllib.request.Request(url, data=data, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=90) as res:
        return json.loads(res.read().decode("utf-8"))


def haversine_m(lat1, lon1, lat2, lon2) -> float:
    r = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def fetch_osm() -> list[dict]:
    query = f"""[out:json][timeout:60];
(
  nwr["historic"~"memorial|monument"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
  nwr["memorial"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
);
out center tags;
"""
    data = get_json(OVERPASS, query.encode("utf-8"))
    out = []
    seen = set()
    for el in data.get("elements", []):
        tags = el.get("tags") or {}
        lat = el.get("lat") or (el.get("center") or {}).get("lat")
        lon = el.get("lon") or (el.get("center") or {}).get("lon")
        if lat is None or lon is None:
            continue
        key = (round(float(lat), 6), round(float(lon), 6), tags.get("name") or "")
        if key in seen:
            continue
        seen.add(key)
        title = tags.get("name") or tags.get("memorial:name") or "Unnamed monument"
        mid = f"osm-{el.get('type', 'n')}-{el.get('id')}"
        out.append(
            {
                "id": mid,
                "title": title,
                "lat": round(float(lat), 6),
                "lng": round(float(lon), 6),
                "category": "monument",
                "osmType": tags.get("historic") or tags.get("memorial") or "monument",
            }
        )
    return out


def geosearch_grid() -> list[dict]:
    files = {}
    lats = [BBOX[0] + i * 0.008 for i in range(int((BBOX[2] - BBOX[0]) / 0.008) + 2)]
    lons = [BBOX[1] + i * 0.008 for i in range(int((BBOX[3] - BBOX[1]) / 0.008) + 2)]
    for lat in lats:
        for lon in lons:
            params = {
                "action": "query",
                "list": "geosearch",
                "gscoord": f"{lat}|{lon}",
                "gsradius": "800",
                "gslimit": "500",
                "gsnamespace": "6",
                "format": "json",
            }
            url = COMMONS + "?" + urllib.parse.urlencode(params)
            try:
                data = get_json(url)
            except Exception:
                time.sleep(0.4)
                continue
            for hit in data.get("query", {}).get("geosearch", []):
                files[hit["title"]] = hit
            time.sleep(0.05)
    return list(files.values())


def is_pd(meta: dict) -> bool:
    blob = " ".join(
        str((meta.get(k) or {}).get("value") or "")
        for k in (
            "LicenseShortName",
            "License",
            "UsageTerms",
            "Copyrighted",
            "Permission",
            "LicenseUrl",
        )
    ).lower()
    if not blob.strip():
        return False
    if "cc by" in blob or "creative commons attribution" in blob:
        if "cc0" not in blob and "public domain" not in blob:
            return False
    return any(h in blob for h in PD_HINTS)


def imageinfo(titles: list[str]) -> dict[str, dict]:
    out = {}
    for i in range(0, len(titles), 40):
        chunk = titles[i : i + 40]
        params = {
            "action": "query",
            "titles": "|".join(chunk),
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|mime|size",
            "iiurlwidth": "720",
            "format": "json",
        }
        url = COMMONS + "?" + urllib.parse.urlencode(params)
        try:
            data = get_json(url)
        except Exception:
            time.sleep(0.5)
            continue
        pages = (data.get("query") or {}).get("pages") or {}
        for page in pages.values():
            info = (page.get("imageinfo") or [None])[0]
            if not info:
                continue
            mime = info.get("mime") or ""
            if not mime.startswith("image/"):
                continue
            meta = info.get("extmetadata") or {}
            if not is_pd(meta):
                continue
            title = page.get("title") or ""
            out[title] = {
                "title": title,
                "thumb": info.get("thumburl") or info.get("url"),
                "url": info.get("url"),
                "page": f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}",
                "license": (meta.get("LicenseShortName") or {}).get("value") or "Public domain",
                "artist": re.sub("<[^>]+>", "", (meta.get("Artist") or {}).get("value") or "").strip(),
            }
        time.sleep(0.08)
    return out


def tokens(s: str) -> set[str]:
    s = urllib.parse.unquote(s.lower())
    s = re.sub(r"^(file:)", "", s)
    s = re.sub(r"https?://\S+", " ", s)
    s = re.sub(r"\.(jpg|jpeg|png|tif|tiff|gif)$", "", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    stop = {
        "gettysburg", "monument", "memorial", "marker", "statue", "pa",
        "national", "military", "park", "battlefield", "the", "of", "and",
        "at", "on", "in", "to", "a", "jpg", "png", "thumb", "wikipedia",
        "commons", "upload", "file", "width", "px",
    }
    out = set()
    for w in s.split():
        if not w or w in stop or len(w) < 2:
            continue
        out.add(w)
        m = re.match(r"(\d+)(st|nd|rd|th)$", w)
        if m:
            out.add(m.group(1))
    return out


def distinctive(s: str) -> set[str]:
    keep = set()
    for w in tokens(s):
        if w.isdigit() or re.match(r"\d+(st|nd|rd|th)$", w) or len(w) >= 4:
            keep.add(w)
    return keep


SKIP_FILE = (
    "eisenhower", "tourist", "overland", "cyclorama", "prisoner",
    "national_tower", "forney_airfield", "caisson_park", "panoramio",
)


def attach_images(monuments: list[dict], geo_files: list[dict], pd: dict[str, dict]) -> None:
    geo_pd = []
    for g in geo_files:
        info = pd.get(g["title"])
        if not info:
            continue
        blob = (g["title"] + " " + info.get("thumb", "")).lower()
        if any(b in blob for b in SKIP_FILE):
            continue
        if re.search(r"national military park \d+", urllib.parse.unquote(g["title"].lower())):
            continue
        geo_pd.append({**g, **info})

    used = set()
    for mon in monuments:
        best = None
        best_score = 1e18
        mtok = distinctive(mon["title"])
        for img in geo_pd:
            if img["title"] in used:
                continue
            dist = haversine_m(mon["lat"], mon["lng"], img["lat"], img["lon"])
            if dist > 40:
                continue
            overlap = mtok & distinctive(img["title"])
            if not overlap:
                continue
            score = dist - (len(overlap) * 25)
            if score < best_score:
                best_score = score
                best = img
        if best:
            used.add(best["title"])
            thumb = (best["thumb"] or "").split("?")[0]
            mon["image"] = thumb
            credit = best["license"]
            if best.get("artist"):
                credit = f"{best['artist']}; {credit}"
            mon["imageCredit"] = f"Wikimedia Commons, public domain ({credit})"
            mon["imagePage"] = best["page"]


def main() -> None:
    print("OSM…")
    monuments = fetch_osm()
    print("  ", len(monuments), "monuments")
    print("Commons geosearch…")
    geo = geosearch_grid()
    print("  ", len(geo), "geotagged files")
    print("License filter…")
    pd = imageinfo([g["title"] for g in geo])
    print("  ", len(pd), "public-domain images")
    attach_images(monuments, geo, pd)
    with_img = sum(1 for m in monuments if m.get("image"))
    print("  matched", with_img)
    payload = {
        "version": 1,
        "title": "Gettysburg battlefield monuments",
        "note": "Coordinates from OpenStreetMap (ODbL). Photographs are Wikimedia Commons files identified as public domain or U.S. government work. Not every pin has a verified public-domain photo.",
        "attribution": "© OpenStreetMap contributors. Photos: Wikimedia Commons (public domain / U.S. government).",
        "monuments": monuments,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    print("wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
