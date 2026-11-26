"""Check relative Markdown links and #anchors (GitHub heading slugs).

Usage (from repo root):
    python scripts/check-markdown-links.py            # whole repo (skips prototype/, wiki-template/, webhook/, _templates/)
    python scripts/check-markdown-links.py ja specs   # only Markdown files under the given folders/files

Exit code 1 when any link is broken. Links inside ``` fences and inline code are ignored.
"""
import os
import re
import sys
import unicodedata
from urllib.parse import unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP = ("prototype", "wiki-template", "webhook", ".git", "node_modules")
LINK = re.compile(r'!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
FENCE = re.compile(r"^\s*(```|~~~).*?^\s*\1", re.S | re.M)
HEADING = re.compile(r"^#{1,6}\s+(.+?)\s*#*\s*$", re.M)


def slug(text):
    """GitHub-style anchor slug for a heading text."""
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text.strip().lower())
    out = []
    for ch in text:
        if ch == " ":
            out.append("-")
        elif ch == "-" or ch == "_" or unicodedata.category(ch)[0] in "LNM":
            out.append(ch)
    return "".join(out)


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


_anchor_cache = {}


def anchors(path):
    """Set of anchors a Markdown file exposes (headings with -n suffix for duplicates, <a id/name>)."""
    if path not in _anchor_cache:
        txt = FENCE.sub("", read(path))
        found, seen = set(), {}
        for m in HEADING.finditer(txt):
            s = slug(m.group(1))
            n = seen.get(s, 0)
            found.add(s if n == 0 else f"{s}-{n}")
            seen[s] = n + 1
        found.update(re.findall(r'<a\s+(?:name|id)="([^"]+)"', txt))
        _anchor_cache[path] = found
    return _anchor_cache[path]


def markdown_files(targets):
    for t in targets:
        t = os.path.join(ROOT, t)
        if os.path.isfile(t):
            yield t
            continue
        for d, _, fs in os.walk(t):
            parts = os.path.relpath(d, ROOT).split(os.sep)
            if parts[0] in SKIP or "_templates" in parts:
                continue
            yield from (os.path.join(d, f) for f in fs if f.endswith(".md"))


def check(path):
    txt = FENCE.sub("", read(path))
    txt = re.sub(r"`[^`\n]*`", "", txt)
    for m in LINK.finditer(txt):
        url = m.group(1)
        if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", url):
            continue
        target, _, frag = url.partition("#")
        dest = path if not target else os.path.normpath(os.path.join(os.path.dirname(path), unquote(target)))
        if not os.path.exists(dest):
            yield url, "missing file"
        elif frag and dest.endswith(".md") and unquote(frag) not in anchors(dest):
            yield url, "missing anchor"


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    targets = sys.argv[1:] or ["."]
    files = sorted(set(markdown_files(targets)))
    broken = 0
    for f in files:
        for url, why in check(f):
            broken += 1
            print(f"{os.path.relpath(f, ROOT)}: {url} ({why})")
    print(f"files={len(files)} broken={broken}")
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
