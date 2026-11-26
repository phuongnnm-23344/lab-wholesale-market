"""Sinh các bảng của task-breakdown.md từ backlog/backlog.yaml (giữa các dấu <!-- BEGIN GEN x --> / <!-- END GEN x -->).

Bảng sinh: spec-issue (mục 2), gaps (mục 4), epic-counts (mục 1). Mục 3 (完納奨励金) viết tay.
Chạy từ gốc repo:  python backlog/scripts/render-task-breakdown-tables.py
"""
import collections
import glob
import os
import re
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = yaml.safe_load(open(os.path.join(ROOT, "backlog", "backlog.yaml"), encoding="utf-8"))
iss = d["issues"]
by = {i["id"]: i for i in iss}
kids = collections.defaultdict(list)
for i in iss:
    if i["parent"]:
        kids[i["parent"]].append(i["id"])
cell = lambda s: str(s).replace("|", "\\|").replace("\n", " ")


def text_of(i):
    return " ".join(i["spec_refs"] + [i["title"]])


def compress(ids):
    """Bỏ sub-issue khi cha đã có trong danh sách; cha ghi số sub-issue."""
    s = set(ids)
    out = []
    for x in ids:
        p = by[x]["parent"]
        if p and p in s:
            continue
        out.append(f"{x} ({len(kids[x])} sub)" if kids.get(x) else x)
    return ", ".join(out)


def epics_of(ids):
    return ", ".join(sorted({by[x]["epic"] for x in ids}))


def match(pattern):
    rx = re.compile(pattern)
    return [i["id"] for i in iss if rx.search(text_of(i))]


def not_issued_for(keys):
    rows = [n for n in d["not_issued"] if any(k in n["spec"] for k in keys)]
    return "; ".join(f"{n['spec']} — {n['reason']}" + (f" → {', '.join(n['covered_by'])}" if n["covered_by"] and "→" not in n["reason"] else "") for n in rows) or "—"


rows = []
spec_files = sorted(glob.glob(os.path.join(ROOT, "specs", "*", "*", "*.md")))
for f in spec_files:
    b = os.path.basename(f)[:-3]
    if "_templates" in f or not b.endswith(("_SPEC", "_FUNC", "_TECH")):
        continue
    key = b.replace("_SPEC", "").replace("_TECH", "")
    ids = match(re.escape(key) + r"(?![\d-])")
    rel = os.path.relpath(f, ROOT).replace("\\", "/")
    rows.append((f"`{rel}`", epics_of(ids), compress(ids), not_issued_for([key])))
for feat in sorted(os.listdir(os.path.join(ROOT, "specs", "system-design", "api-design"))):
    p = os.path.join(ROOT, "specs", "system-design", "api-design", feat)
    if not os.path.isdir(p):
        continue
    codes = sorted(re.match(r"(API-[A-Z]+-\d{3})", x).group(1) for x in os.listdir(p) if x.startswith("API-"))
    pre = codes[0][:-3]
    ids = match(re.escape(pre))
    rows.append((f"API Design `{feat}/` ({codes[0]}..{codes[-1][-3:]}, {len(codes)} file)", epics_of(ids), compress(ids), "—"))
for f in sorted(glob.glob(os.path.join(ROOT, "specs", "system-design", "database-design", "*_DB.md"))):
    key = os.path.basename(f)[:-3]
    ids = match(re.escape(key))
    rows.append((f"Database Design `{key}.md`", epics_of(ids), compress(ids), not_issued_for([key])))
NO_ISSUE = {"ADR-010": "Không có việc làm riêng: ADR-010 là ranh giới phạm vi (option tách riêng, người quyết cuối, "
                       "không OCR / AI) — giữ bằng nhãn rule:human-decision, DoD chung mục 1.2 và việc không đưa option vào backlog 第1期"}
for adr in ["ARCHITECTURE"] + [f"ADR-{n:03d}" for n in range(1, 11)]:
    ids = match(re.escape(adr) + r"\b")
    rows.append((f"`{adr}`", epics_of(ids) or "—", compress(ids) or "—", NO_ISSUE.get(adr, "—")))
for n in d["not_issued"]:
    if True:  # mọi dòng not_issued thành một hàng (gồm phần Option / 第2期 không vào backlog)
        ids = n["covered_by"]
        rows.append((n["spec"], epics_of(ids) or "—", compress(ids) or "—", n["reason"]))

spec_tbl = ["| Spec (mã / file LAB-4) | Epic | Issue / sub-issue | Phần spec chưa thành issue và vì sao |", "|---|---|---|---|"]
spec_tbl += ["| " + " | ".join(cell(c) for c in r) + " |" for r in rows]

H = {"fix-design": "sửa thiết kế — PREMISE.md {r} (đề xuất; áp vào spec sau Gate A)",
     "assumption": "giả định — PREMISE.md {r}", "clarify": "tạo issue làm rõ {r}", "open": "để mở — {o}"}
KIND_NOTE = {"design": " (issue thiết kế: viết spec, khách duyệt theo đợt thiết kế)"}
gap_tbl = ["| # | Spec | Chỗ hở / mâu thuẫn | Xử lý | Nguồn |", "|---|---|---|---|---|"]
for g in d["gaps"]:
    x = H[g["handling"]].format(r=g.get("ref"), o=g.get("open_reason"))
    if g["handling"] == "clarify":
        x += KIND_NOTE.get(by[g["ref"]]["kind"], "")
    gap_tbl.append(f"| {g['id']} | {cell(g['spec'])} | {cell(g['problem'])} | {cell(x)} | {g['source_id']} |")

cnt = collections.OrderedDict((e["id"], [e["title"], e["priority"], e["planned_sprint"], 0, 0, 0, 0]) for e in d["epics"])
for i in iss:
    r = cnt[i["epic"]]
    r[4 if i["parent"] else 3] += 1
    if i["id"] not in kids:
        r[5] += 1
        r[6] += i["hours_hint"]
ep_tbl = ["| Epic | Tên | Ưu tiên (gốc) | Sprint (WBS LAB-1) | Issue cấp 1 | Sub-issue | Lá | Giờ sơ bộ (lá) |", "|---|---|---|---|---|---|---|---|"]
for e, r in cnt.items():
    ep_tbl.append(f"| {e} | {cell(r[0])} | {r[1]} | {r[2]} | {r[3]} | {r[4]} | {r[5]} | {r[6]} |")
tot = [sum(r[k] for r in cnt.values()) for k in (3, 4, 5, 6)]
ep_tbl.append(f"| **Tổng** | 18 epic | | | **{tot[0]}** | **{tot[1]}** | **{tot[2]}** | **{tot[3]}** |")

path = os.path.join(ROOT, "task-breakdown.md")
doc = open(path, encoding="utf-8").read()
for name, tbl in (("spec-issue", spec_tbl), ("gaps", gap_tbl), ("epic-counts", ep_tbl)):
    doc = re.sub(rf"(<!-- BEGIN GEN {name} -->\n).*?(<!-- END GEN {name} -->)",
                 lambda m: m.group(1) + "\n".join(tbl) + "\n" + m.group(2), doc, flags=re.S)
open(path, "w", encoding="utf-8", newline="\n").write(doc)
print(f"spec rows={len(rows)} gap rows={len(d['gaps'])}")
