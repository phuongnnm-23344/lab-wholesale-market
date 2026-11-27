"""P3: sinh các bảng số của estimate.md từ backlog/estimate-swp-hours.csv (+ estimate-lab1-comparison.yaml).

Khối được thay: <!-- BEGIN GEN kind-check -->, epic-totals, lab1-compare. Chạy sau build-estimate-swp-hours.py.

    python -X utf8 backlog/scripts/render-estimate-tables.py
"""
import collections
import csv
import os
import re

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.dirname(os.path.abspath(__file__))
rows = list(csv.DictReader(open(os.path.join(ROOT, "backlog", "estimate-swp-hours.csv"), encoding="utf-8")))
leaves = [r for r in rows if r["level"] == "leaf"]
for r in leaves:
    r["swp"], r["h"], r["hint"] = int(r["swp_final"]), float(r["hours"]), int(r["hours_hint"])
d = yaml.safe_load(open(os.path.join(ROOT, "backlog", "backlog.yaml"), encoding="utf-8"))
epic_title = {e["id"]: e["title_en"] for e in d["epics"]}


def n(x):
    """Số kiểu Việt: 1.234 / 2,5."""
    s = f"{x:,.2f}".rstrip("0").rstrip(".") if isinstance(x, float) else f"{x:,}"
    return s.replace(",", "_").replace(".", ",").replace("_", ".")


def signed(x):
    return ("+" if x > 0 else "−" if x < 0 else "") + n(abs(x))


def pct(a, b):
    return f"{(a - b) / b * 100:+.0f}%".replace("-", "−") if b else "—"


# 1. Giờ sơ bộ / SWP theo loại việc — kiểm một hệ số k
KIND = [("dev", "dev"), ("test", "test"), ("design", "thiết kế"), ("clarify", "làm rõ"), ("rough", "thô (giữ chỗ)")]
kind_tbl = ["| Loại lá | Số lá | SWP | Giờ sơ bộ (P1) | Giờ sơ bộ / SWP | Giờ = SWP × 2 | Chênh so với giờ sơ bộ |", "|---|---|---|---|---|---|---|"]
for k, label in KIND:
    ls = [r for r in leaves if r["kind"] == k]
    s, h, hint = sum(r["swp"] for r in ls), sum(r["h"] for r in ls), sum(r["hint"] for r in ls)
    kind_tbl.append(f"| {label} | {len(ls)} | {n(s)} | {n(hint)} | {n(round(hint / s, 2))} | {n(h)} | {signed(h - hint)} ({pct(h, hint)}) |")
S, Hh, Hi = sum(r["swp"] for r in leaves), sum(r["h"] for r in leaves), sum(r["hint"] for r in leaves)
kind_tbl.append(f"| **Tổng** | **{len(leaves)}** | **{n(S)}** | **{n(Hi)}** | **{n(round(Hi / S, 2))}** | **{n(Hh)}** | **{signed(Hh - Hi)} ({pct(Hh, Hi)})** |")

# 2. Tổng theo epic
by_epic = collections.OrderedDict((e["id"], []) for e in d["epics"])
issues_in_epic = collections.Counter(r["epic"] for r in rows if r["level"] != "epic")
for r in leaves:
    by_epic[r["epic"]].append(r)
ep_tbl = ["| Epic | Số issue (lá / tất cả) | Tổng SWP | Tổng giờ | Ghi chú |", "|---|---|---|---|---|"]
for e, ls in by_epic.items():
    num = next(r["number"] for r in rows if r["id"] == e)
    rough = [r for r in ls if r["kind"] == "rough"]
    big = [r for r in ls if r["kind"] != "rough" and r["h"] > 16]
    note = []
    if rough:
        note.append(f"{len(rough)} lá thô: giữ chỗ {n(sum(r['hint'] for r in rough))} giờ LAB-1 → {n(sum(r['h'] for r in rough))} giờ")
    if big:
        note.append(f"> 16 giờ, tách trước sprint: " + ", ".join(f"#{r['number']}" for r in big))
    ep_tbl.append(f"| #{num} {e} — {epic_title[e]} | {len(ls)} / {issues_in_epic[e]} | {n(sum(r['swp'] for r in ls))} | "
                  f"{n(sum(r['h'] for r in ls))} | {'; '.join(note) or '—'} |")
ep_tbl.append(f"| **Tổng** (18 epic) | **{len(leaves)} / {sum(issues_in_epic.values())}** | **{n(S)}** | **{n(Hh)}** | "
              f"giờ sơ bộ {n(Hi)}; cha / epic = tổng con |")

# 3. So với LAB-1
cmp_ = yaml.safe_load(open(os.path.join(HERE, "estimate-lab1-comparison.yaml"), encoding="utf-8"))["rows"]
lab_tbl = ["| Phần | LAB-1 (giờ) | LAB-5 giờ sơ bộ (P1) | LAB-5 (giờ = SWP × 2) | Chênh LAB-5 − LAB-1 | Vì sao |", "|---|---|---|---|---|---|"]
t1 = t5 = th = 0
covered = set()
for c in cmp_:
    l1 = round(c["lab1_days"] * 8, 1)
    sel = c["lab5"]
    if sel:
        ls = [r for r in leaves if (not sel.get("epics") or r["epic"] in sel["epics"])
              and (not sel.get("kinds") or r["kind"] in sel["kinds"]) and r["kind"] not in sel.get("exclude_kinds", [])]
        covered |= {r["id"] for r in ls}
        h5, hi = sum(r["h"] for r in ls), sum(r["hint"] for r in ls)
        cells = (n(hi), n(h5), f"{signed(h5 - l1)} ({pct(h5, l1)})")
    else:
        h5 = hi = 0
        cells = ("—", "—", f"{signed(-l1)}")
    t1, t5, th = t1 + l1, t5 + h5, th + hi
    l1s = n(l1) + (f" ({c['lab1_note']})" if c.get("lab1_note") else "")
    lab_tbl.append(f"| {c['part']} | {l1s} | {cells[0]} | {cells[1]} | {cells[2]} | {c['why']} |")
assert covered == {r["id"] for r in leaves}, f"lá chưa được so: {sorted({r['id'] for r in leaves} - covered)[:5]}"
lab_tbl.append(f"| **Tổng (trước buffer 15%)** | **{n(t1)}** | **{n(th)}** | **{n(t5)}** | **{signed(t5 - t1)} ({pct(t5, t1)})** | "
               f"LAB-1 1.486,3 人日; buffer 15% (11,15 人月 ≈ 1.784 giờ) không so |")

path = os.path.join(ROOT, "estimate.md")
doc = open(path, encoding="utf-8").read()
for name, tbl in (("kind-check", kind_tbl), ("epic-totals", ep_tbl), ("lab1-compare", lab_tbl)):
    doc, k = re.subn(rf"(<!-- BEGIN GEN {name} -->\n).*?(<!-- END GEN {name} -->)",
                     lambda m: m.group(1) + "\n".join(tbl) + "\n" + m.group(2), doc, flags=re.S)
    assert k == 1, f"thiếu khối GEN {name} trong estimate.md"
open(path, "w", encoding="utf-8", newline="\n").write(doc)
print(f"estimate.md: lá {len(leaves)}, SWP {S}, giờ {Hh}; LAB-1 {t1} giờ, LAB-5 {t5} giờ")
