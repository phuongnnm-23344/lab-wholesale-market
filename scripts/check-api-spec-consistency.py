"""Consistency checks for API Design files (BM-2-901-52) under specs/system-design/api-design/.

Rules (Gate 2 G2-m01 / G2-M03):
  1. Every JSON example inside <pre>…</pre> parses (examples that are not JSON, e.g. PDF, are skipped).
  2. A backtick token in the Note column must not contain a snake_case name unless that name is a
     table / column / function defined somewhere in specs/ outside api-design (Database Design,
     FUNC, TECH). JSON keys are camelCase (api-conventions quy ước 4).
  3. The legacy error key `error_extra` must not appear anywhere in specs/ (outside _templates/).
  4. An error example must not put the field path inside detail: `"detail": { "field": … }`.

Usage (from the repo root):  python scripts/check-api-spec-consistency.py
Exit code 0 = clean, 1 = findings printed.
"""
import html
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SPECS = REPO / "specs"
API_DIR = SPECS / "system-design" / "api-design"
SNAKE = re.compile(r"\b[a-z]+(?:_[a-z0-9]+)+\b")
SKIP_PREFIX = ("app", "fn", "v_", "uq_", "idx", "trg")


def known_identifiers():
    ids = set()
    for path in SPECS.rglob("*.md"):
        rel = path.relative_to(SPECS).as_posix()
        if rel.startswith(("system-design/api-design/", "_templates/")):
            continue
        ids |= set(SNAKE.findall(path.read_text(encoding="utf-8")))
    return ids


def check_api_file(path, ids):
    text = path.read_text(encoding="utf-8")
    name = path.relative_to(API_DIR).as_posix()
    findings = []
    for line in text.splitlines():
        if not line.startswith("| "):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split(" | ")]
        if len(cells) < 5:
            continue
        for token in re.findall(r"`([^`]+)`", cells[-1]):
            for key in SNAKE.findall(token):
                if not key.startswith(SKIP_PREFIX) and key not in ids:
                    findings.append(f"{name}: Note has snake_case `{key}` (in `{token}`)")
    for match in re.finditer(r"<pre>(.*?)</pre>", text):
        body = html.unescape(match.group(1).replace("<br>", "\n").replace("&nbsp;", " "))
        if not body.strip().startswith(("{", "[")):
            continue
        try:
            json.loads(body)
        except json.JSONDecodeError as exc:
            findings.append(f"{name}: JSON example does not parse ({exc}): {body[:60]!r}")
    if re.search(r'"detail":\s*\{\s*"field"', text):
        findings.append(f'{name}: field path inside detail — use top-level "field"')
    return findings


def main():
    ids = known_identifiers()
    findings = []
    for path in sorted(API_DIR.glob("*/API-*_API.md")):
        findings += check_api_file(path, ids)
    for path in SPECS.rglob("*.md"):
        rel = path.relative_to(SPECS).as_posix()
        if not rel.startswith("_templates/") and "error_extra" in path.read_text(encoding="utf-8"):
            findings.append(f"{rel}: legacy key error_extra")
    for item in findings:
        print(item)
    print(f"checked {len(list(API_DIR.glob('*/API-*_API.md')))} API files — {len(findings)} finding(s)")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
