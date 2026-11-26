"""Bước 1 của build-backlog.py: gộp 3 file backlog luồng P1 (backlog/p1-streams/{a,b,c}-backlog.yaml).

Quyết định PL lúc gộp (tách issue thô theo đơn vị tự nhiên, gộp câu hỏi trùng, phụ thuộc chéo luồng,
đánh số PREMISE) ở backlog/scripts/p1-merge-decisions.yaml. Hàm merge() trả về dict backlog;
bước sau (apply-gate-a-decisions.py, plan-priority-and-iteration.py) sửa tiếp rồi mới ghi file.
"""
import os
import re
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = lambda *a: os.path.join(ROOT, *a)
load = lambda p: yaml.safe_load(open(p, encoding="utf-8"))
ID_RE = re.compile(r"\b[ABC]-(?:FG\d\d|PLAT|TEST|CLR)-\d\d(?:\.\d+)?\b")
PREFIX_RE = re.compile(r"^((?:\[[^\]]+\])+)\s*")


def uniq(xs):
    out = []
    for x in xs:
        if x not in out:
            out.append(x)
    return out


def merge():
    D = load(P("backlog", "scripts", "p1-merge-decisions.yaml"))
    streams = {s: load(P("backlog", "p1-streams", f"{s}-backlog.yaml")) for s in "abc"}
    epics = [e for s in "abc" for e in streams[s]["epics"]]
    issues = [dict(i, stream=s.upper()) for s in "abc" for i in streams[s]["issues"]]
    by_id = {i["id"]: i for i in issues}
    remap, rr = {}, {}

    def assignee(stream, role, fallback):
        pool = D["pools"].get(stream, {}).get(role)
        if not pool:
            return fallback
        rr[(stream, role)] = rr.get((stream, role), -1) + 1
        return pool[rr[(stream, role)] % len(pool)]

    # 1) Gộp câu hỏi trùng giữa luồng (L5-D09)
    for drop, m in D["merge_clarify"].items():
        d, k = by_id.pop(drop), by_id[m["keep"]]
        k["title"] = m["title"]
        k["hours_hint"] = max(k["hours_hint"], d["hours_hint"])
        for f in ("labels", "spec_refs", "rfp_refs", "depends_on", "dod"):
            k[f] = uniq(k[f] + d[f])
        k["description"] = k["description"].rstrip() + f"\nGộp từ {drop} (câu hỏi trùng giữa luồng, L5-D09): " + d["description"].strip()
        remap[drop] = [m["keep"]]
    issues = [i for i in issues if i["id"] in by_id]

    # 2) Issue thô cấp 1 gộp nhiều đơn vị → cha + một con cho mỗi đơn vị tự nhiên (L5-D08)
    children = {}
    for pid, units in D["split_level1"].items():
        p = by_id[pid]
        pre = PREFIX_RE.match(p["title"]).group(1)
        assert sum(u[2] for u in units) == p["hours_hint"], pid
        kids = []
        for n, (utitle, role, hours) in enumerate(units, 1):
            cid = f"{pid}.{n}"
            labels = uniq([l for l in p["labels"] if not l.startswith("role:")] + ["role:" + role, "needs-spec"])
            kids.append(dict(id=cid, epic=p["epic"], parent=pid, kind="rough", title=f"{pre} {utitle}", role=role,
                             assignee=assignee(p["stream"], role, p["assignee"]), labels=labels,
                             spec_refs=list(p["spec_refs"]), rfp_refs=list(p["rfp_refs"]), depends_on=[],
                             depends_on_spec=[], hours_hint=hours, stream=p["stream"], dod=list(p["dod"]),
                             description=f"Đơn vị tự nhiên 「{utitle}」 của {pid}; giờ = ước LAB-1 (chỗ giữ effort, L5-D08)."))
            remap[f"{pid}#{n}"] = [cid]
        children[pid] = kids

    out = []
    for i in issues:
        out.append(i)
        out.extend(children.get(i["id"], []))
    out += [dict(n, stream="PL") for n in D["new_issues"]]
    by_id = {i["id"]: i for i in out}
    for i in out:
        if i["kind"] != "rough":
            i["labels"] = [l for l in i["labels"] if l != "needs-spec"]

    expand = lambda r: remap.get(r, [r])

    # 3) Phụ thuộc: remap + ID luồng khác nêu trong depends_on_spec + phụ thuộc chéo luồng đã chốt
    for i in out:
        deps = sum((expand(x) for x in i["depends_on"]), [])
        deps += [x for t in i.get("depends_on_spec") or [] for x in ID_RE.findall(t) if x in by_id and x[0] != i["id"][0]]
        i["depends_on"] = uniq([x for x in deps if x != i["id"]])
    for k, v in D["add_depends"].items():
        for t in expand(k):
            by_id[t]["depends_on"] = uniq(by_id[t]["depends_on"] + sum((expand(x) for x in v), []))

    # 4) Chỗ hở (đánh số L5-G), phần chưa thành issue
    pm = D["premise_map"]
    gaps = [dict(g, stream=s.upper()) for s in "abc" for g in streams[s]["gaps"]] + [dict(g, stream="PL") for g in D["new_gaps"]]
    for n, g in enumerate(gaps, 1):
        g.update(D["gap_overrides"].get(g["id"], {}))
        g["source_id"], g["id"] = g["id"], f"L5-G{n:02d}"
        if g["handling"] in ("fix-design", "assumption"):
            g["ref"] = pm[g["ref"]]
        elif g["handling"] == "clarify":
            g["ref"] = expand(g["ref"])[0]
    not_issued = [dict(x, stream=s.upper(), covered_by=uniq(sum((expand(c) for c in x["covered_by"]), [])))
                  for s in "abc" for x in streams[s]["not_issued"]]
    return dict(epics=epics, issues=out, gaps=gaps, not_issued=not_issued, premise_map=pm,
                constraint_note=streams["b"]["constraint_note"])
