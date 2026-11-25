"""Render the HTML wireframes (wireframes/html/{SCREEN_ID}.html) to PDF + PNG.

One HTML per screen is the single source. Outputs:
  wireframes/pdf/wireframes-all.pdf   one page per screen (page height = content height)
  wireframes/png/{SCREEN_ID}.png      one image per screen
  --spec: also copies the PNG to specs/{feature}/screen-specification/assets/{SCREEN_ID}_annotated.png
          for every screen that has a {SCREEN_ID}_SPEC.md (replaces the block-drawn image).

Usage (from anywhere; paths are resolved from this file's location):
    python scripts/render-wireframes.py                 # all screens -> PDF + PNG
    python scripts/render-wireframes.py SC-04-01        # only the listed screens (PDF holds only them)
    python scripts/render-wireframes.py --spec          # + update spec annotated images
    python scripts/render-wireframes.py --list          # screens, and whether a spec exists

Requires: Python 3.10+, PyMuPDF (`pymupdf`), and a Chromium-family browser. Browser lookup order:
env CHROME_PATH, Microsoft Edge, Google Chrome, Chrome under ~/.cache/puppeteer (from mermaid-cli),
newest first; a browser that hangs is skipped. No network access and no extra packages.
Fonts: "Segoe UI"/Arial first (full Vietnamese glyphs), then "Yu Gothic UI"/Meiryo for Japanese
(see wireframes/html/_shared/wireframe.css).
"""
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import pymupdf

REPO = Path(__file__).resolve().parent.parent
HTML_DIR = REPO / "wireframes" / "html"
PDF_OUT = REPO / "wireframes" / "pdf" / "wireframes-all.pdf"
PNG_DIR = REPO / "wireframes" / "png"
PNG_DPI = 144  # 960pt-wide page -> 1920px PNG: sharp enough for small Japanese text
PRINT_TIMEOUT = 60  # seconds per screen; a working browser needs ~5 s
EDGE_PATHS = [r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
              r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
              r"C:\Program Files\Google\Chrome\Application\chrome.exe",
              "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]


def browser_candidates():
    """Ordered candidates. Some puppeteer Chrome builds (148, 154) hang on --print-to-pdf on
    Windows, so each candidate is tried with a timeout and the first that works is kept."""
    out = [os.environ.get("CHROME_PATH", "")] + EDGE_PATHS
    cache = Path.home() / ".cache" / "puppeteer" / "chrome"
    out += [str(p) for p in sorted(cache.glob("*/chrome-*/chrome*"), reverse=True)
            if p.name in ("chrome.exe", "chrome")]
    out += [shutil.which(n) or "" for n in ("chromium", "google-chrome", "chrome")]
    seen = []
    for p in out:
        if p and Path(p).is_file() and p not in seen:
            seen.append(p)
    return seen


def screens():
    return {p.stem: p for p in sorted(HTML_DIR.glob("SC-*.html"))}


def spec_path(screen_id):
    hits = list((REPO / "specs").glob(f"*/screen-specification/{screen_id}_SPEC.md"))
    return hits[0] if hits else None


def print_pdf(browser, html, out_pdf, profile):
    cmd = [browser, "--headless", "--disable-gpu", "--no-pdf-header-footer", "--no-first-run",
           f"--user-data-dir={profile}", "--allow-file-access-from-files",
           f"--print-to-pdf={out_pdf}", html.resolve().as_uri()]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                         timeout=PRINT_TIMEOUT)
    if not out_pdf.is_file() or out_pdf.stat().st_size == 0:
        raise RuntimeError((res.stderr or res.stdout or "no PDF written").strip()[-600:])


def print_with_fallback(browsers, html, out_pdf, profile):
    """Print with browsers[0]; on a hang, drop it and retry with the next candidate."""
    while browsers:
        try:
            return print_pdf(browsers[0], html, out_pdf, profile)
        except subprocess.TimeoutExpired:
            print("browser timed out, trying next:", browsers.pop(0), file=sys.stderr)
    raise RuntimeError("no browser could print the page - set CHROME_PATH")


def check_single_page(doc, screen_id):
    if doc.page_count != 1:
        raise RuntimeError(f"{screen_id}: expected 1 PDF page, got {doc.page_count} "
                           "(is _shared/fit-print-page-to-content.js included last?)")


def main(args):
    flags = {a for a in args if a.startswith("--")}
    ids = [a for a in args if not a.startswith("--")]
    all_screens = screens()
    if "--list" in flags:
        for sid in all_screens:
            sp = spec_path(sid)
            print(sid, sp.relative_to(REPO).as_posix() if sp else "(no spec)")
        return 0
    unknown = [i for i in ids if i not in all_screens]
    if unknown:
        print("Unknown screen:", ", ".join(unknown), "- use --list", file=sys.stderr)
        return 2
    browsers = browser_candidates()
    if not browsers:
        print("No Chromium browser found - set CHROME_PATH", file=sys.stderr)
        return 2

    PNG_DIR.mkdir(parents=True, exist_ok=True)
    PDF_OUT.parent.mkdir(parents=True, exist_ok=True)
    merged, failed = pymupdf.open(), 0
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        for sid in ids or all_screens:
            one = tmp / f"{sid}.pdf"
            try:
                print_with_fallback(browsers, all_screens[sid], one, tmp / "profile")
                with pymupdf.open(one) as doc:
                    check_single_page(doc, sid)
                    png = PNG_DIR / f"{sid}.png"
                    doc[0].get_pixmap(dpi=PNG_DPI).save(png)
                    merged.insert_pdf(doc)
                print("wrote", png.relative_to(REPO).as_posix())
                sp = spec_path(sid) if "--spec" in flags else None
                if sp:
                    dest = sp.parent / "assets" / f"{sid}_annotated.png"
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(png, dest)
                    print("wrote", dest.relative_to(REPO).as_posix())
            except RuntimeError as err:
                failed += 1
                print(f"FAILED {sid}: {err}", file=sys.stderr)
    if merged.page_count:
        merged.set_metadata({"title": "Wireframes", "creator": "scripts/render-wireframes.py"})
        merged.save(PDF_OUT, garbage=3, deflate=True)
        print("wrote", PDF_OUT.relative_to(REPO).as_posix(), f"({merged.page_count} pages)")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
