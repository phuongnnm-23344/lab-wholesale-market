"""Gộp 3 file backlog luồng P1 (backlog/p1-streams/{a,b,c}-backlog.yaml) thành backlog/backlog.yaml.

Quyết định của PL (tách issue thô, gộp câu hỏi trùng, phụ thuộc chéo luồng, ưu tiên, Iteration 1,
điều kiện dùng thử S1, đánh số PREMISE) nằm ở backlog/scripts/p1-merge-decisions.yaml.

Chạy từ gốc repo:  python backlog/scripts/merge-stream-backlogs.py
"""
import math
import os
import re
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = lambda *a: os.path.join(ROOT, *a)
load = lambda p: yaml.safe_load(open(p, encoding="utf-8"))
ID_RE = re.compile(r"\b[ABC]-(?:FG\d\d|PLAT|TEST|CLR)-\d\d(?:\.\d+)?\b")
PREFIX_RE = re.compile(r"^((?:\[[^\]]+\])+)\s*")

D = load(P("backlog", "scripts", "p1-merge-decisions.yaml"))
streams = {s: load(P("backlog", "p1-streams", f"{s}-backlog.yaml")) for s in "abc"}
epics = [e for s in "abc" for e in streams[s]["epics"]]
issues = [dict(i, stream=s.upper()) for s in "abc" for i in streams[s]["issues"]]
by_id = {i["id"]: i for i in issues}
remap = {}  # ID cũ / tham chiếu đơn vị → danh sách ID mới
_rr = {}


def uniq(xs):
    out = []
    for x in xs:
        if x not in out:
            out.append(x)
    return out


def assignee(stream, role, fallback):
    pool = D["pools"].get(stream, {}).get(role)
    if not pool:
        return fallback
    k = (stream, role)
    _rr[k] = _rr.get(k, -1) + 1
    return pool[_rr[k] % len(pool)]


def parts(hours, role):
    n = max(1, math.ceil(hours / 16))
    base, extra = divmod(hours, n)
    names = D["part_names"][role]
    return [(base + (1 if k < extra else 0), names[k] if n > 1 else None, k + 1, n) for k in range(n)]


def strip_needs_spec(i):
    if i["kind"] != "rough":
        i["labels"] = [l for l in i["labels"] if l != "needs-spec"]


def relabel(labels, role):
    return uniq([l for l in labels if not l.startswith("role:")] + ["role:" + role, "needs-spec"])


# 1) Gộp câu hỏi trùng
for drop, m in D["merge_clarify"].items():
    d, k = by_id.pop(drop), by_id[m["keep"]]
    k["title"] = m["title"]
    k["hours_hint"] = max(k["hours_hint"], d["hours_hint"])
    for f in ("labels", "spec_refs", "rfp_refs", "depends_on", "dod"):
        k[f] = uniq(k[f] + d[f])
    k["description"] = k["description"].rstrip() + f"\nGộp từ {drop} (câu hỏi trùng giữa luồng, L5-D09): " + d["description"].strip()
    remap[drop] = [m["keep"]]
issues = [i for i in issues if i["id"] in by_id]

# 2) Tách issue thô cấp 1 theo đơn vị
new_children = {}
for pid, units in D["split_level1"].items():
    p = by_id[pid]
    pre = PREFIX_RE.match(p["title"]).group(1)
    assert sum(u[2] for u in units) == p["hours_hint"], pid
    kids, seq = [], 0
    for ui, (utitle, role, hours) in enumerate(units, 1):
        ids = []
        for h, part, k, n in parts(hours, role):
            seq += 1
            cid = f"{pid}.{seq}"
            title = f"{pre} {utitle}" + (f" ({k}/{n} {part})" if part else "")
            kids.append(dict(id=cid, epic=p["epic"], parent=pid, kind="rough", title=title, role=role,
                             assignee=assignee(p["stream"], role, p["assignee"]), labels=relabel(p["labels"], role),
                             spec_refs=list(p["spec_refs"]), rfp_refs=list(p["rfp_refs"]), depends_on=[],
                             depends_on_spec=[], hours_hint=h, stream=p["stream"], dod=list(p["dod"]),
                             description=f"Đơn vị 「{utitle}」 của {pid}. Tách theo quy tắc độ hạt (task-breakdown §1, "
                                         f"L5-D08): issue thô lá ≤ 16 giờ; giờ lấy từ ước LAB-1 ghi ở {pid}."))
            ids.append(cid)
        remap[f"{pid}#{ui}"] = ids
    new_children[pid] = kids

# 3) Tách sub-issue thô > 16 giờ thành sub-issue anh em (phần 1 giữ ID)
for sid in D["split_sub"]:
    s = by_id[sid]
    pre = PREFIX_RE.match(s["title"]).group(1)
    core = s["title"][len(PREFIX_RE.match(s["title"]).group(0)):].replace(" (chưa spec)", "")
    sibs = [i["id"] for i in issues if i.get("parent") == s["parent"]] + sum(
        ([c["id"] for c in v] for v in new_children.values()), [])
    nxt = max(int(x.rsplit(".", 1)[1]) for x in sibs if x.startswith(s["parent"] + ".")) + 1
    ids, extra = [], []
    for h, part, k, n in parts(s["hours_hint"], s["role"]):
        t = f"{pre} {core} ({k}/{n} {part})"
        if len(t) > 80:
            t = f"{pre} {core.split(' — ')[0]} ({k}/{n} {part})"
        if k == 1:
            s.update(title=t, hours_hint=h)
            ids.append(sid)
        else:
            nid = f"{s['parent']}.{nxt}"
            nxt += 1
            extra.append(dict(s, id=nid, title=t, hours_hint=h, assignee=assignee(s["stream"], s["role"], s["assignee"]),
                              depends_on=list(s["depends_on"]), labels=list(s["labels"]), dod=list(s["dod"])))
            ids.append(nid)
    s["description"] = s["description"].rstrip() + " Tách thành " + ", ".join(ids) + " (L5-D08)."
    for e in extra:
        e["description"] = s["description"]
    remap[sid] = ids
    new_children.setdefault(s["parent"], []).extend(extra)

out = []
for i in issues:
    out.append(i)
    out.extend(new_children.get(i["id"], []))
for n in D["new_issues"]:
    out.append(dict(n, stream="PL"))
_top = {i["id"]: k for k, i in enumerate(out) if not i.get("parent")}
out.sort(key=lambda i: (_top[i.get("parent") or i["id"]], int(i["id"].rsplit(".", 1)[1]) if i.get("parent") else 0))
by_id = {i["id"]: i for i in out}
for i in out:
    strip_needs_spec(i)


def expand(ref):
    if ref not in remap:
        return [ref]
    return sum(([r] if r == ref else expand(r) for r in remap[ref]), [])


# 4) Tham chiếu: remap + phụ thuộc chéo luồng + ID nêu rõ trong depends_on_spec
for i in out:
    deps = sum((expand(x) for x in i["depends_on"]), [])
    # chỉ lấy ID luồng khác nêu trong depends_on_spec (ID cùng luồng: luồng đã tự quyết có đưa vào depends_on hay không)
    deps += [x for t in i.get("depends_on_spec") or [] for x in ID_RE.findall(t) if x in by_id and x[0] != i["id"][0]]
    i["depends_on"] = uniq([x for x in deps if x != i["id"]])
for k, v in D["add_depends"].items():
    for t in expand(k):
        by_id[t]["depends_on"] = uniq(by_id[t]["depends_on"] + sum((expand(x) for x in v), []))

# 5) Ưu tiên
ovr = {t: v for k, v in D["priority_override"].items() for t in expand(k)}
for i in out:
    i["priority"] = ovr.get(i["id"]) or ovr.get(i.get("parent")) or D["priority_by_epic"][i["epic"]]
rank = lambda p: int(p[1])
for i in out:
    if i["kind"] == "clarify":
        users = [j["priority"] for j in out if i["id"] in j["depends_on"] and j["kind"] != "clarify"]
        if users:
            i["priority"] = min(users, key=rank)

# 6) Iteration 1 + điều kiện dùng thử S1
it = D["iteration1"]
excl = set(sum((expand(x) for x in it["exclude"]), []))
chosen = {i["id"] for i in out if i["epic"] in it["epics"] and i["kind"] in ("dev", "test")
          and i["id"] not in excl and i.get("parent") not in excl}
chosen |= set(sum((expand(x) for x in it["include_extra"]), []))
chosen |= {by_id[c]["parent"] for c in chosen if by_id[c].get("parent")}
for i in out:
    i["iteration"] = it["name"] if i["id"] in chosen else None
    i["acceptance"] = []
for ac in D["acceptance_s1"]:
    ac["issues"] = uniq(sum((expand(x) for x in ac["issues"]), []))
    for x in ac["issues"]:
        by_id[x]["acceptance"].append(ac["id"])

# 7) Epic, chỗ hở, phần chưa thành issue
for e in epics:
    e["priority"] = D["priority_by_epic"][e["id"]]
    e["planned_sprint"] = D["planned_sprint"][e["id"]]
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

FIELDS = ["id", "epic", "parent", "kind", "priority", "iteration", "acceptance", "title", "role", "assignee", "labels",
          "spec_refs", "rfp_refs", "depends_on", "depends_on_spec", "hours_hint", "stream", "description", "dod"]
doc = dict(
    meta=dict(generated_by="backlog/scripts/merge-stream-backlogs.py",
              sources=[f"backlog/p1-streams/{s}-backlog.yaml" for s in "abc"] + ["backlog/scripts/p1-merge-decisions.yaml"],
              note="Nguồn chuẩn của backlog LAB-5. Sửa backlog = sửa file này (P2 trở đi); 3 file luồng giữ làm đầu vào thô P1."),
    iteration1=dict(name=it["name"], dates="2027-02-01 → 2027-02-12 (S1 LAB-1)", acceptance=D["acceptance_s1"]),
    constraint_note=streams["b"]["constraint_note"],
    epics=epics,
    issues=[{f: i.get(f) for f in FIELDS} for i in out],
    gaps=gaps, not_issued=not_issued, premise_map=pm)
with open(P("backlog", "backlog.yaml"), "w", encoding="utf-8", newline="\n") as f:
    yaml.safe_dump(doc, f, allow_unicode=True, sort_keys=False, width=200)
print(f"epics={len(epics)} issues={len(out)} level1={sum(1 for i in out if not i['parent'])} "
      f"sub={sum(1 for i in out if i['parent'])} gaps={len(gaps)} iteration1={len(chosen)}")
