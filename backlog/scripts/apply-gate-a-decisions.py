"""Bước 2 của build-backlog.py: sửa cấu trúc backlog theo Expert Gate A (gate-a-decisions.yaml).

Issue thiết kế (kind: design) thay issue "viết spec" cũ; issue thô chờ issue thiết kế (rolling-wave, L5-D08);
issue dev mới cho màn cần ở S1; tách 保証金 / 参加上限; checkpoint S4 thành cha + sub-issue; câu hỏi mới;
sửa not_issued; bỏ chữ nội bộ. Hàm apply(doc) sửa tại chỗ.
"""
import os
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
G = yaml.safe_load(open(os.path.join(ROOT, "backlog", "scripts", "gate-a-decisions.yaml"), encoding="utf-8"))
POOLS = yaml.safe_load(open(os.path.join(ROOT, "backlog", "scripts", "p1-merge-decisions.yaml"), encoding="utf-8"))["pools"]
POOLS = dict(POOLS, PL=POOLS["C"])


def uniq(xs):
    return list(dict.fromkeys(xs))


def fg(epic):
    return "FG-" + epic[5:] if epic.startswith("EP-FG") else epic[3:]


def apply(doc):
    iss = doc["issues"]
    by = {i["id"]: i for i in iss}
    ep_labels = {e["id"]: e["labels"] for e in doc["epics"]}
    remap, rr = {}, {}

    def pick(stream, role):
        if role in ("QA", "BrSE", "INFRA"):
            return {"QA": f"QA-{'ABC'.index(stream) + 1}" if stream in "ABC" else "QA-1", "BrSE": "BrSE-1", "INFRA": "INFRA-1"}[role]
        pool = POOLS.get(stream, {}).get(role) or ["BrSE-1"]
        rr[(stream, role)] = rr.get((stream, role), -1) + 1
        return pool[rr[(stream, role)] % len(pool)]

    def base(epic, role, kind, extra=()):
        feat = [l for l in ep_labels.get(epic, []) if l.startswith("feature:")][:1]
        cons = ["constraint:完納奨励金"] if epic == "EP-FG09" else []
        fgl = [f"fg:{fg(epic)}"] if epic.startswith("EP-FG") else []
        return uniq(fgl + feat + [f"kind:{kind}", f"role:{role}"] + cons + list(extra))

    def mk(id_, epic, kind, role, title, hours, parent=None, **kw):
        i = dict(id=id_, epic=epic, parent=parent, kind=kind, title=title, role=role, assignee=kw.get("assignee") or pick(id_[0], role),
                 labels=kw.get("labels") or base(epic, role, kind), spec_refs=kw.get("spec", []), rfp_refs=kw.get("rfp", []),
                 depends_on=list(kw.get("depends_on", [])), depends_on_spec=[], hours_hint=hours, stream="PL",
                 description=kw.get("description", ""), dod=list(kw.get("dod", [])), milestone=kw.get("milestone"))
        iss.append(i)
        by[id_] = i
        return i

    for x in G["delete"]:
        iss.remove(by.pop(x))

    # Issue thiết kế
    for d in G["design"]:
        old = [by.pop(r) for r in d["replaces"]]
        for o in old:
            iss.remove(o)
            remap[o["id"]] = d["id"]
        ms = G["milestones"][d["ms"]]
        spec = d.get("spec") or uniq(sum((o["spec_refs"] for o in old), [])) or ["SCREEN-LIST"]
        rfp = d.get("rfp") or uniq(sum((o["rfp_refs"] for o in old), [])) or uniq(sum((by[c]["rfp_refs"] for c in d["covers"]), []))
        deps = uniq(sum((o["depends_on"] for o in old), []) + d.get("depends", []))
        desc = (f"Viết thiết kế cho phần chưa có spec (L4-D08) trước sprint dùng nó — {ms}. "
                f"Giờ theo cách tính 基本設計 của LAB-1: Screen Spec 8 giờ / màn, thiết kế logic / API ≈ 15% giờ BE."
                + (f" Thay issue 「viết spec」 {', '.join(o['id'] for o in old)}." if old else ""))
        dod = ["Tài liệu theo khuôn spec-standards (BM-2-901-51 / 52 / 53 / 54), review nội bộ, khách duyệt ở " + ms]
        if d["covers"]:
            dod.append("Issue thô " + ", ".join(d["covers"]) + " được tách thành lá dev / test ≤ 16 giờ trước buổi lập kế hoạch sprint dự kiến")
        pre = f"[{fg(d['epic'])}][設計] "
        leaves = d.get("leaves") or []
        role = d.get("role") or leaves[0][1]
        mk(d["id"], d["epic"], "design", role, pre + d["title"], d.get("hours", 0), spec=spec, rfp=rfp, depends_on=deps,
           description=desc, dod=dod, milestone=ms)
        for n, (t, r, h) in enumerate(leaves, 1):
            mk(f"{d['id']}.{n}", d["epic"], "design", r, pre + t, h, parent=d["id"], spec=spec, rfp=rfp, description=desc,
               dod=dod[:1], milestone=ms)
        for c in d["covers"] + d.get("unblocks", []):
            by[c]["depends_on"] = uniq(by[c]["depends_on"] + [d["id"]])

    # Issue mới khác
    for n in G["new"]:
        lab = base(n["epic"], n["role"], n["kind"], n.get("rules", []))
        if n.get("labels"):
            lab = uniq(n["labels"] + [f"kind:{n['kind']}", f"role:{n['role']}"])
        rfp = by[n["rfp_from"]]["rfp_refs"] if n.get("rfp_from") else n.get("rfp", [])
        mk(n["id"], n["epic"], n["kind"], n["role"], n["title"], n.get("hours", 0), parent=n.get("parent"), spec=n.get("spec", []),
           rfp=rfp, depends_on=n.get("depends_on", []), dod=n.get("dod", []), labels=lab,
           description=n.get("description", "Thêm sau Expert Gate A (FB-EXP-327..340)."))
        for k, (t, r, h) in enumerate(n.get("children", []), 1):
            mk(f"{n['id']}.{k}", n["epic"], n["kind"], r, f"[{fg(n['epic'])}] {t}", h, parent=n["id"], spec=n.get("spec", []),
               rfp=rfp, dod=n.get("dod", []), labels=base(n["epic"], r, n["kind"], n.get("rules", [])),
               description="Phần việc của " + n["id"] + ".")

    for x, u in G["update"].items():
        u = dict(u)
        if "milestone" in u:
            u["milestone"] = G["milestones"][u["milestone"]]
        by[x].update(u)
        if "role" in u:
            by[x]["labels"] = uniq([l for l in by[x]["labels"] if not l.startswith("role:")] + ["role:" + u["role"]])
    for pid, rows in G["children"].items():
        p = by[pid]
        for k, (t, kind, r, who, h) in enumerate(rows, 1):
            mk(f"{pid}.{k}", p["epic"], kind, r, f"[{fg(p['epic'])}] {t}", h, parent=pid, assignee=who, spec=p["spec_refs"],
               rfp=p["rfp_refs"], labels=uniq([l for l in p["labels"] if not l.startswith("role:")] + ["role:" + r]),
               dod=p["dod"], description="Phần việc của " + pid + ".", milestone=p.get("milestone"))
    for x, deps in G["set_depends"].items():
        by[x]["depends_on"] = list(deps)
    for x, deps in G["add_depends"].items():
        by[x]["depends_on"] = uniq(by[x]["depends_on"] + deps)
    for x, lines in G["add_dod"].items():
        by[x]["dod"] = uniq(by[x]["dod"] + lines)

    # Tham chiếu tới issue đã thay
    rm = lambda x: remap.get(x, x)
    for i in iss:
        i["depends_on"] = uniq([rm(x) for x in i["depends_on"] if rm(x) != i["id"]])
    for g in doc["gaps"]:
        if g["handling"] == "clarify":
            g["ref"] = rm(g["ref"])
    for n in doc["not_issued"]:
        n["covered_by"] = uniq([rm(x) for x in n["covered_by"]])
        for f in G["not_issued_fix"]:
            if n["spec"].startswith(f["match"]):
                n["covered_by"], n["reason"] = f["covered_by"], f["reason"]

    def clean(s):
        for a, b in G["text_replace"]:
            s = s.replace(a, b)
        return s
    for i in iss:
        i["description"] = clean(i["description"] or "")
        i["spec_refs"] = [clean(s) for s in i["spec_refs"]]
        i["depends_on_spec"] = [clean(s) for s in i.get("depends_on_spec") or []]
    for g in doc["gaps"]:
        g["problem"], g["spec"] = clean(g["problem"]), clean(g["spec"])
    for n in doc["not_issued"]:
        n["reason"], n["spec"] = clean(n["reason"]), clean(n["spec"])

    # Cha = tổng con; issue thô: DoD rolling-wave theo issue thiết kế nó chờ
    kids = {}
    for i in iss:
        if i["parent"]:
            kids.setdefault(i["parent"], []).append(i)
    for p, ks in kids.items():
        by[p]["hours_hint"] = sum(k["hours_hint"] for k in ks)
    for i in iss:
        i.setdefault("milestone", None)
        if i["kind"] != "rough":
            i["labels"] = [l for l in i["labels"] if l != "needs-spec"]
            continue
        src = [x for x in i["depends_on"] + (by[i["parent"]]["depends_on"] if i["parent"] else []) if by[x]["kind"] == "design"]
        i["dod"] = [f"Tách thành lá dev / test ≤ 16 giờ khi issue thiết kế {', '.join(uniq(src)) or '—'} xong, trước buổi lập kế hoạch "
                    "của sprint dự kiến (rolling-wave, L5-D08)", "Giờ hiện tại là chỗ giữ effort theo LAB-1, không phải cam kết"]
    order = {i["id"]: n for n, i in enumerate(iss)}
    top = lambda i: i["parent"] or i["id"]
    iss.sort(key=lambda i: (order[top(i)], 0 if not i["parent"] else int(i["id"].rsplit(".", 1)[1])))
    return remap
