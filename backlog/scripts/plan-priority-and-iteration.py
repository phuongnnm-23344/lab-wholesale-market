"""Bước 3 của build-backlog.py: ưu tiên lan theo phụ thuộc, Iteration 1 trong năng lực, điều kiện dùng thử S1.

- Ưu tiên (L5-D11): ưu tiên gốc theo epic (thứ tự của khách) + ngoại lệ; rồi
  ưu tiên = max(ưu tiên riêng, ưu tiên của mọi issue phụ thuộc vào nó), lan cả cha ↔ con, tới khi ổn định.
- Iteration 1 (L5-D10): năng lực = người trong roster × per_person_hours; cam kết các lá gắn AC-S1 + phụ thuộc của chúng,
  rồi lấp phần còn lại theo ưu tiên; mọi phụ thuộc của issue cam kết nằm trong Iteration 1, hoặc thuộc EP-PLAT (S0),
  hoặc là issue thiết kế 設計第1波 / câu hỏi. Người phụ trách cân lại trong roster (≤ per_person_hours).
"""
import os
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
G = yaml.safe_load(open(os.path.join(ROOT, "backlog", "scripts", "gate-a-decisions.yaml"), encoding="utf-8"))
RANK = lambda p: int(p[1])


def allowed_outside(i):
    """Phụ thuộc được phép nằm ngoài Iteration 1: S0 nền tảng, thiết kế 第1波, đúng các câu hỏi khách trong outside_ok_clarify."""
    return (i["epic"] == "EP-PLAT" or i["id"] in G["iteration1"]["outside_ok_clarify"]
            or (i["kind"] == "design" and (i.get("milestone") or "").startswith("設計第1波")))


def plan(doc):
    iss = doc["issues"]
    by = {i["id"]: i for i in iss}
    kids = {}
    for i in iss:
        if i["parent"]:
            kids.setdefault(i["parent"], []).append(i["id"])
    ovr = G["priority_override"]
    for i in iss:
        i["priority"] = ovr.get(i["id"]) or ovr.get(i["parent"]) or G["priority_by_epic"][i["epic"]]
    base = {i["id"]: i["priority"] for i in iss}
    changed = True
    while changed:
        changed = False
        for i in iss:
            links = [by[d] for d in i["depends_on"]] + [by[c] for c in kids.get(i["id"], [])]
            if i["parent"]:
                links.append(by[i["parent"]])
            for j in links:
                if RANK(j["priority"]) > RANK(i["priority"]):
                    j["priority"] = i["priority"]
                    changed = True
    raised = sorted(x for x in by if by[x]["priority"] != base[x])

    # Iteration 1
    it = G["iteration1"]
    leaf = lambda x: x not in kids
    excl = set(it["exclude"])
    cand = {i["id"] for i in iss if leaf(i["id"]) and i["epic"] in it["epics"] and i["kind"] in ("dev", "test")
            and i["id"] not in excl and i["parent"] not in excl} | set(it["include_extra"])
    cap_role = {r: len(p) * it["per_person_hours"] for r, p in it["roster"].items()}
    load = {r: 0 for r in cap_role}
    chosen = set()

    def need(x, acc):
        """Lá x + mọi lá nó cần trong Iteration 1 (phụ thuộc không được phép nằm ngoài)."""
        if x in acc or x in chosen:
            return True
        acc.add(x)
        for d in by[x]["depends_on"] + ([] if not by[x]["parent"] else by[by[x]["parent"]]["depends_on"]):
            for y in ([d] if leaf(d) else kids[d]):
                if allowed_outside(by[y]) or y in chosen or y in acc:
                    continue
                if y not in cand or not need(y, acc):
                    return False
        return True

    def take(x, force=False):
        acc = set()
        if not need(x, acc):
            return False
        add = {r: sum(by[y]["hours_hint"] for y in acc if by[y]["role"] == r) for r in load}
        if not force and any(load[r] + add[r] > cap_role[r] for r in load):
            return False
        for r in load:
            load[r] += add[r]
        chosen.update(acc)
        return True

    ac_leaves = [x for ac in G["acceptance_s1"] for x in ac["issues"] if leaf(x) and by[x]["kind"] in ("dev", "test")]
    unmet = [x for x in ac_leaves if not take(x, force=True)]
    for x in sorted(cand - chosen, key=lambda x: (RANK(by[x]["priority"]), x)):
        take(x)
    # cân người phụ trách trong roster
    cap = it["per_person_hours"]

    def pack(items, team):
        """Chia lá cho người cùng vai, mỗi người ≤ cap (quay lui; số lá trong một sprint nhỏ)."""
        items = sorted(items, key=lambda x: (-by[x]["hours_hint"], x))
        load_p, assign = {p: 0 for p in team}, {}

        def go(k):
            if k == len(items):
                return True
            h, seen = by[items[k]]["hours_hint"], set()
            for p in team:
                if load_p[p] + h <= cap and load_p[p] not in seen:
                    seen.add(load_p[p])
                    load_p[p] += h
                    assign[items[k]] = p
                    if go(k + 1):
                        return True
                    load_p[p] -= h
            return False
        if not go(0):  # không chia được trong cap → chia đều nhất có thể
            load_p = {p: 0 for p in team}
            for x in items:
                assign[x] = min(team, key=lambda p: load_p[p])
                load_p[assign[x]] += by[x]["hours_hint"]
        return assign, load_p

    per = {}
    for role, team in it["roster"].items():
        assign, lp = pack([x for x in chosen if by[x]["role"] == role], team)
        per.update(lp)
        for x, p in assign.items():
            by[x]["assignee"] = p
    for i in iss:
        i["iteration"] = None
    for x in chosen:
        by[x]["iteration"] = it["name"]
    for p, ks in kids.items():
        if all(k in chosen for k in ks):
            by[p]["iteration"] = it["name"]
            # Cha không có giờ riêng: người phụ trách = người của lá con đầu tiên, để không lọt người ngoài đội Iteration (Gate C m-06)
            by[p]["assignee"] = by[ks[0]]["assignee"]
    for i in iss:
        i["acceptance"] = [ac["id"] for ac in G["acceptance_s1"] if i["id"] in ac["issues"]]
    for e in doc["epics"]:
        e["priority"] = G["priority_by_epic"][e["id"]]
        e["planned_sprint"] = G["planned_sprint"][e["id"]]
    doc["iteration1"] = dict(name=it["name"], dates=it["dates"], per_person_hours=it["per_person_hours"], roster=it["roster"],
                             outside_ok_clarify=it["outside_ok_clarify"],
                             capacity_by_role=cap_role, committed_hours_by_role=load, committed_by_person=per,
                             committed_leaves=len(chosen), committed_hours=sum(load.values()),
                             acceptance=G["acceptance_s1"], unmet_acceptance=unmet)
    return dict(raised=raised, unmet=unmet)
