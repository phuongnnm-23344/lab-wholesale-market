"""P3: sinh các bảng số của estimate.md từ backlog/estimate-swp-hours.csv (+ estimate-lab1-comparison.yaml).

Khối được thay (<!-- BEGIN GEN x --> / <!-- END GEN x -->): pending, kind-check, epic-totals, lab1-compare, lab1-bridge.
Chạy sau build-estimate-swp-hours.py.

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
blabels = {i["id"]: i["labels"] for i in d["issues"]}
bkids = {i["parent"] for i in d["issues"] if i["parent"]}
# lá trong backlog chưa có SWP (issue mới sau Gate B) hoặc đổi phạm vi chờ chấm lại
pending = sorted(({i["id"] for i in d["issues"] if i["id"] not in bkids} - {r["id"] for r in leaves}) | set(d.get("rescore_pending") or []))


def n(x):
    """Số kiểu Việt: 1.234 / 2,5."""
    s = f"{x:,.2f}".rstrip("0").rstrip(".") if isinstance(x, float) else f"{x:,}"
    return s.replace(",", "_").replace(".", ",").replace("_", ".")


def signed(x):
    return ("+" if x > 0 else "−" if x < 0 else "") + n(abs(x))


def pct(a, b):
    return f"{(a - b) / b * 100:+.0f}%".replace("-", "−") if b else "—"


is_fg = lambda sel: bool(sel) and all(e.startswith("EP-FG") for e in sel.get("epics", ["x"]))

# 0. Lá đang chờ chấm
pend_tbl = [f"> **Đang chờ chấm SWP ({len(pending)} lá, sau Gate B):** {', '.join(pending)}. Các bảng dưới là số của các lần chấm đã có: lá mới chưa có trong bảng, lá đổi phạm vi còn SWP cũ; "
            "người dùng chốt điểm rồi chạy lại build → ghi field → render."] if pending else []

# 1. Giờ sơ bộ / SWP theo loại việc — kiểm một hệ số k
KIND = [("dev", "dev"), ("test", "test"), ("design", "thiết kế"), ("clarify", "làm rõ"), ("rough", "thô (giữ chỗ)")]
kind_tbl = ["| Loại lá | Số lá | SWP | Giờ sơ bộ (P1) | Giờ sơ bộ / SWP | Giờ = SWP × 2 | Chênh so với giờ sơ bộ |", "|---|---|---|---|---|---|---|"]
for k, label in KIND:
    ls = [r for r in leaves if r["kind"] == k]
    s, h, hint = sum(r["swp"] for r in ls), sum(r["h"] for r in ls), sum(r["hint"] for r in ls)
    kind_tbl.append(f"| {label} | {len(ls)} | {n(s)} | {n(hint)} | {n(round(hint / s, 2))} | {n(h)} | {signed(h - hint)} ({pct(h, hint)}) |")
S, Hh, Hi = sum(r["swp"] for r in leaves), sum(r["h"] for r in leaves), sum(r["hint"] for r in leaves)
kind_tbl.append(f"| **Tổng** | **{len(leaves)}** | **{n(S)}** | **{n(Hi)}** | **{n(round(Hi / S, 2))}** | **{n(Hh)}** | **{signed(Hh - Hi)} ({pct(Hh, Hi)})** |")
# Gate B m-02: dự báo cả đợt = lá không thô theo SWP × 2 + lá thô theo giờ giữ chỗ LAB-1
fc_nr = sum(r["h"] for r in leaves if r["kind"] != "rough")
fc_rg = sum(r["hint"] for r in leaves if r["kind"] == "rough")
kind_tbl.append(f"| **Giờ dự báo cả đợt** (đo tải mốc S2–S8) | | | | | **{n(fc_nr + fc_rg)}** | "
                f"= lá không thô SWP × 2 ({n(fc_nr)}) + lá thô theo giờ giữ chỗ ({n(fc_rg)}) |")

# 2. Tổng theo epic
by_epic = collections.OrderedDict((e["id"], []) for e in d["epics"])
issues_in_epic = collections.Counter(r["epic"] for r in rows if r["level"] != "epic")
for r in leaves:
    by_epic[r["epic"]].append(r)
ep_tbl = ["| Epic | Số issue (lá / tất cả) | Tổng SWP | Tổng giờ | Ghi chú |", "|---|---|---|---|---|"]
for e, ls in by_epic.items():
    num = next(r["number"] for r in rows if r["id"] == e)
    rough = [r for r in ls if r["kind"] == "rough"]
    split = [r for r in ls if "needs-split" in blabels.get(r["id"], [])]
    note = []
    if rough:
        note.append(f"{len(rough)} lá thô: giữ chỗ {n(sum(r['hint'] for r in rough))} giờ LAB-1 → {n(sum(r['h'] for r in rough))} giờ")
    if split:
        note.append("needs-split (> 16 giờ, tách trước sprint planning): " + ", ".join(f"#{r['number']}" for r in split))
    ep_tbl.append(f"| #{num} {e} — {epic_title[e]} | {len(ls)} / {issues_in_epic[e]} | {n(sum(r['swp'] for r in ls))} | "
                  f"{n(sum(r['h'] for r in ls))} | {'; '.join(note) or '—'} |")
ep_tbl.append(f"| **Tổng** (18 epic) | **{len(leaves)} / {sum(issues_in_epic.values())}** | **{n(S)}** | **{n(Hh)}** | "
              f"giờ sơ bộ {n(Hi)}; cha / epic = tổng con |")

# 3. So với LAB-1 + cầu nối chênh
CMP = yaml.safe_load(open(os.path.join(HERE, "estimate-lab1-comparison.yaml"), encoding="utf-8"))
lab_tbl = ["| Phần | LAB-1 (giờ) | LAB-5 giờ sơ bộ (P1) | LAB-5 (giờ = SWP × 2) | Chênh LAB-5 − LAB-1 | Vì sao |", "|---|---|---|---|---|---|"]
t1 = t5 = th = fg_l1 = 0
covered, bridge_other = set(), []
for c in CMP["rows"]:
    l1 = round(c["lab1_days"] * 8, 1)
    sel = c["lab5"]
    if sel:
        ls = [r for r in leaves if (not sel.get("epics") or r["epic"] in sel["epics"])
              and (not sel.get("kinds") or r["kind"] in sel["kinds"]) and r["kind"] not in sel.get("exclude_kinds", [])]
        covered |= {r["id"] for r in ls}
        h5, hi = sum(r["h"] for r in ls), sum(r["hint"] for r in ls)
        cells = (n(hi), n(h5), f"{signed(h5 - l1)} ({pct(h5, l1)})")
        if is_fg(sel):
            fg_l1 += l1
        else:
            bridge_other.append((c["part"], l1 - h5, "dòng cùng tên ở §4"))
    else:
        h5 = hi = 0
        cells = ("—", "—", f"{signed(-l1)}")
        src = c.get("lab1_note", "") + (" — **số còn lại theo phép trừ**, không đo độc lập" if "LAB-4" in c["part"] else "")
        bridge_other.append((c["part"], l1, src))
    t1, t5, th = t1 + l1, t5 + h5, th + hi
    l1s = n(l1) + (f" ({c['lab1_note']})" if c.get("lab1_note") else "")
    lab_tbl.append(f"| {c['part']} | {l1s} | {cells[0]} | {cells[1]} | {cells[2]} | {c['why']} |")
assert covered == {r["id"] for r in leaves}, f"lá chưa được so: {sorted({r['id'] for r in leaves} - covered)[:5]}"
lab_tbl.append(f"| **Tổng (trước buffer 15%)** | **{n(t1)}** | **{n(th)}** | **{n(t5)}** | **{signed(t5 - t1)} ({pct(t5, t1)})** | "
               f"LAB-1 1.486,3 人日; buffer 15% (11,15 人月 ≈ 1.784 giờ) không so |")

# Gate B m-03: tách chênh của 15 dòng FG thành thô quy đổi / QA / デザイン / phần chưa giải thích
fg = [r for r in leaves if r["epic"].startswith("EP-FG") and r["kind"] != "design"]
fg_gap = fg_l1 - sum(r["h"] for r in fg)
B = CMP["bridge"]
b_rough = sum(r["hint"] - r["h"] for r in fg if r["kind"] == "rough")
b_qa = B["lab1_fg_qa_days"] * 8 - sum(r["h"] for r in fg if r["kind"] == "test")
b_ds = B["lab1_fg_design_days"] * 8
bridge = [("FG-01..15: issue thô quy đổi (giờ giữ chỗ LAB-1 → SWP × 2)", b_rough, "§2.2; PREMISE L5-A01"),
          ("FG-01..15: QA nằm trong dòng FG LAB-1, LAB-5 không có lá (chạy case theo DoD 4)", b_qa,
           f"QA {n(B['lab1_fg_qa_days'])} 人日 − lá test FG; giữ 30% năng lực QA (L5-D12)"),
          ("FG-01..15: cột デザイン trong dòng FG LAB-1 (hình màn, ngoài 基本設計)", b_ds, f"{n(B['lab1_fg_design_days'])} 人日"),
          ("FG-01..15: **chưa giải thích bằng số** (FE × 1,3 cho 2 bố cục, giờ dev / test LAB-5 ước thấp hơn LAB-1)",
           fg_gap - b_rough - b_qa - b_ds, "phần còn lại của chênh 15 dòng FG")] + bridge_other
br_tbl = ["| Khoản | Giờ (LAB-1 − LAB-5) | Nguồn |", "|---|---|---|"]
br_tbl += [f"| {k} | {n(round(v, 1))} | {src} |" for k, v, src in bridge]
br_tbl.append(f"| **Tổng = chênh dòng Tổng §4** | **{n(round(sum(v for _, v, _ in bridge), 1))}** | |")
assert abs(sum(v for _, v, _ in bridge) - (t1 - t5)) < 0.5, "cầu nối không khớp tổng chênh"

path = os.path.join(ROOT, "estimate.md")
doc = open(path, encoding="utf-8").read()
for name, tbl in (("pending", pend_tbl), ("kind-check", kind_tbl), ("epic-totals", ep_tbl), ("lab1-compare", lab_tbl),
                  ("lab1-bridge", br_tbl)):
    doc, k = re.subn(rf"(<!-- BEGIN GEN {name} -->\n).*?(<!-- END GEN {name} -->)",
                     lambda m: m.group(1) + "".join(x + "\n" for x in tbl) + m.group(2), doc, flags=re.S)
    assert k == 1, f"thiếu khối GEN {name} trong estimate.md"
open(path, "w", encoding="utf-8", newline="\n").write(doc)
print(f"estimate.md: lá {len(leaves)}, SWP {S}, giờ {Hh}; dự báo {fc_nr + fc_rg}; chờ chấm {len(pending)}; LAB-1 {t1} giờ, LAB-5 {t5} giờ")
