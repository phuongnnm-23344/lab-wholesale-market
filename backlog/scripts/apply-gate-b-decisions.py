"""Bước 3 của build-backlog.py: sửa backlog theo Expert Gate B (gate-b-decisions.yaml), người dùng chốt 2026-11-27.

M-01: tách 4 lá 完納奨励金 > 16 giờ (issue cấp 1 → cha + sub-issue; lá cấp 2 → thu hẹp + sub-issue anh em, giữ tối đa 2 cấp);
nhãn `needs-split` cho lá đã có spec còn > 16 giờ. M-02: thêm issue thô design system và sửa lỗi sau 総合テスト.
Hàm apply(doc) sửa tại chỗ, trả về dict cho backlog.yaml (rescore_pending: lá đổi phạm vi chờ chấm lại; rỗng khi đã chấm).
"""
import os
import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
G = yaml.safe_load(open(os.path.join(HERE, "gate-b-decisions.yaml"), encoding="utf-8"))


def uniq(xs):
    return list(dict.fromkeys(xs))


def apply(doc, title_en):
    """title_en: dict id → tiêu đề tiếng Anh (issue-titles-en.yaml), được bổ sung / sửa cho issue mới và lá thu hẹp."""
    iss = doc["issues"]
    by = {i["id"]: i for i in iss}

    def child(p, cid, c, parent):
        i = dict(p, id=cid, parent=parent, title=c["title"] if c["title"].startswith("[") else f"[FG-09] {c['title']}",
                 hours_hint=c["hours"], description=c["description"], dod=list(c["dod"]), stream="PL",
                 depends_on=list(c.get("depends_on", [])), labels=list(p["labels"]), spec_refs=list(p["spec_refs"]),
                 rfp_refs=list(p["rfp_refs"]), depends_on_spec=list(p.get("depends_on_spec") or []))
        title_en[cid] = c["title_en"]
        return i

    # issue cấp 1 → cha: con kế thừa phụ thuộc của cha (con đầu) để vẫn chờ đúng khối trước
    for pid, rows in G["split_children"].items():
        p = by[pid]
        assert not p["parent"], pid
        at = iss.index(p) + 1
        for k, c in enumerate(rows, 1):
            i = child(p, f"{pid}.{k}", c, pid)
            if k == 1:
                i["depends_on"] = uniq(p["depends_on"] + i["depends_on"])
            iss.insert(at + k - 1, i)
            by[i["id"]] = i
        p["description"] = (p["description"] or "").strip() + f"\n\nTách thành {len(rows)} sub-issue sau Gate B (L5-D08, người dùng chốt 2026-11-27). Chỉ lá chấm SWP.\n"
        p["dod"] = [f"{len(rows)} sub-issue xong"] + p["dod"]

    # lá cấp 2 → thu hẹp + anh em cùng cha
    for lid, s in G["split_siblings"].items():
        leaf = by[lid]
        n = s["narrow"]
        leaf.update(title=n["title"], hours_hint=n["hours"], description=n["description"], dod=list(n["dod"]))
        title_en[lid] = n["title_en"]
        at = iss.index(leaf) + 1
        for k, c in enumerate(s["add"]):
            i = child(leaf, c["id"], c, leaf["parent"])
            iss.insert(at + k, i)
            by[i["id"]] = i
    new_ids = {c["id"] for s in G["split_siblings"].values() for c in s["add"]}
    for old, new in G["redirect_depends"].items():
        for i in iss:
            if old in i["depends_on"] and i["id"] not in new_ids:
                i["depends_on"] = uniq(i["depends_on"] + [new])

    # M-02: issue thô mới
    for r in G["new_rough"]:
        ep = next(e for e in doc["epics"] if e["id"] == r["epic"])
        feat = [l for l in ep["labels"] if l.startswith("feature:")][:1]
        i = dict(id=r["id"], epic=r["epic"], parent=None, kind="rough", priority=None, iteration=None, milestone=None, acceptance=[],
                 title=r["title"], role=r["role"], assignee=r["assignee"],
                 labels=uniq(feat + ["kind:rough", f"role:{r['role']}", "needs-spec"]), spec_refs=list(r["spec"]),
                 rfp_refs=list(r["rfp"]), depends_on=list(r["depends_on"]), depends_on_spec=[], hours_hint=r["hours"], stream="PL",
                 description=r["description"], dod=list(r["dod"]))
        title_en[r["id"]] = r["title_en"]
        last = max(n for n, x in enumerate(iss) if x["epic"] == r["epic"])
        iss.insert(last + 1, i)
        by[i["id"]] = i

    # M-01: nhãn needs-split (lá đã có spec, > 16 giờ theo SWP × k, tách trước sprint planning dự kiến)
    for x in G["needs_split"]:
        by[x]["labels"] = uniq(by[x]["labels"] + ["needs-split"])
        by[x]["dod"] = uniq(by[x]["dod"] + ["Tách thành lá ≤ 16 giờ và chấm lại SWP trước buổi lập kế hoạch của sprint dự kiến (needs-split, L5-D08)"])

    # cha = tổng con
    kids = {}
    for i in iss:
        if i["parent"]:
            kids.setdefault(i["parent"], []).append(i)
    for p, ks in kids.items():
        by[p]["hours_hint"] = sum(k["hours_hint"] for k in ks)
    return {"rescore_pending": list(G.get("rescore_pending") or [])}
