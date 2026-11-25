"""Export the Mermaid sequence diagrams of every Technical Design (BM-2-901-53) to PNG.

The Mermaid block inside each specs/{feature}/technical-design/{DESIGN_ID}_TECH.md stays the
source of truth; the PNG is generated from it so the two never drift. Re-run after editing a
diagram.

Naming (template BM-2-901-53 section 2): ./assets/{DESIGN_ID}_sequence.png for the first block,
./assets/{DESIGN_ID}_sequence-{n}.png for block n >= 2 of the same file.

Usage (from anywhere; paths are resolved from this file's location):
    python scripts/export-mermaid-png.py                    # all TECH files
    python scripts/export-mermaid-png.py TRADE_AITAI_CONFIRM  # only the listed Design IDs
    python scripts/export-mermaid-png.py --list             # show Design IDs and output paths

Requires: Python 3.10+, Node.js (npx). Renders with @mermaid-js/mermaid-cli (pinned below),
using Segoe UI / Arial for Latin + Vietnamese and a Japanese system font (Yu Gothic / Meiryo on
Windows, Hiragino on macOS, Noto Sans CJK on Linux) so 日本語 labels do not turn into boxes.
"""
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MMDC = "@mermaid-js/mermaid-cli@11.4.2"
SCALE = "2"  # device scale factor: sharper text in the PNG
# Latin font with full Vietnamese glyphs first (JP fonts lack precomposed ố/ữ…, which then
# render as base letter + loose accent); the browser falls back per glyph to the JP font.
FONT = ('"Segoe UI", Arial, "Noto Sans", "Yu Gothic UI", "Yu Gothic", Meiryo, '
        '"Hiragino Sans", "Noto Sans CJK JP", sans-serif')
BLOCK_RE = re.compile(r"^```mermaid[ \t]*\n(.*?)^```[ \t]*$", re.S | re.M)

MERMAID_CONFIG = {
    "theme": "default",
    "themeVariables": {"fontFamily": FONT},
    "sequence": {"useMaxWidth": False, "wrap": False},
}
# CSS injected into the page puppeteer renders in, so every text node uses the JP font.
PAGE_CSS = f"* {{ font-family: {FONT} !important; }}"


def tech_files():
    return sorted((REPO / "specs").glob("*/technical-design/*_TECH.md"))


def design_id(path):
    return path.name[: -len("_TECH.md")]


def png_name(did, n):
    return f"{did}_sequence.png" if n == 1 else f"{did}_sequence-{n}.png"


def blocks(path):
    return [m.group(1) for m in BLOCK_RE.finditer(path.read_text(encoding="utf-8"))]


def render(npx, src, out, cfg, css):
    cmd = [npx, "-y", MMDC, "-i", str(src), "-o", str(out), "-c", str(cfg),
           "-C", str(css), "-b", "white", "-s", SCALE]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        raise RuntimeError((res.stderr or res.stdout).strip()[-800:])


def main(args):
    files = {design_id(p): p for p in tech_files()}
    if args[:1] == ["--list"]:
        for did, p in files.items():
            for n in range(1, len(blocks(p)) + 1):
                print(did, (p.parent / "assets" / png_name(did, n)).relative_to(REPO).as_posix())
        return 0
    unknown = [a for a in args if a not in files]
    if unknown:
        print("Unknown Design ID:", ", ".join(unknown), "- use --list", file=sys.stderr)
        return 2
    npx = shutil.which("npx")
    if not npx:
        print("npx not found - install Node.js first", file=sys.stderr)
        return 2

    failed = 0
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        cfg, css = tmp / "mermaid-config.json", tmp / "page.css"
        cfg.write_text(json.dumps(MERMAID_CONFIG), encoding="utf-8")
        css.write_text(PAGE_CSS, encoding="utf-8")
        for did in args or files:
            path = files[did]
            for n, body in enumerate(blocks(path), start=1):
                src = tmp / f"{did}_{n}.mmd"
                src.write_text(body, encoding="utf-8")
                out = path.parent / "assets" / png_name(did, n)
                out.parent.mkdir(parents=True, exist_ok=True)
                try:
                    render(npx, src, out, cfg, css)
                    print("wrote", out.relative_to(REPO).as_posix())
                except RuntimeError as err:
                    failed += 1
                    print(f"FAILED {did} block {n}: {err}", file=sys.stderr)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
