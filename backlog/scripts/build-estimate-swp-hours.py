"""SWP đã chốt (payload nhúng trong các báo cáo HTML của tkm:sun-estimate) → giờ = SWP × K → backlog/estimate-swp-hours.csv.

Nguồn: báo cáo P3 `reports/sun-estimate-lab5-project1-*.html` + mọi báo cáo `reports/sun-estimate-lab5-*.html` khác (chấm lại / chấm chéo lần)
(Gate B: lá mới / lá đổi phạm vi), theo thứ tự `rescore_reports` của gate-b-decisions.yaml. Lần sau thay lần trước cho cùng số issue; lá P3 nay đã thành cha thì bỏ.
Lá: Point = finalSWP, Hours = finalSWP × K (làm tròn 0,5 giờ). Cha / epic (theo cây trong backlog.yaml): Point = tổng SWP lá
con cháu, Hours = tổng Hours con. Script kiểm: mọi lá trong backlog có đúng một điểm; cha không bị ảnh hưởng bởi lần chấm lại
khớp SWP cha trong payload P3; mỗi payload đã hiệu chỉnh.

    python -X utf8 backlog/scripts/build-estimate-swp-hours.py
"""
import csv
import glob
import json
import os
import re
import sys

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = 2.0  # giờ / SWP — một hệ số cho mọi issue; cách chốt: estimate.md §2.1
OUT = os.path.join(ROOT, "backlog", "estimate-swp-hours.csv")
FIELDS = ["id", "number", "level", "epic", "parent_id", "kind", "iteration", "hours_hint", "swp_initial", "swp_final", "hours"]


def payload(path):
    html = open(path, encoding="utf-8").read()
    m = re.search(r'<script id="report-data" type="application/json">(.*?)</script>', html, re.S)
    p = json.loads(m.group(1))
    if p["run"]["calibrationStatus"] != "calibrated":
        sys.exit(f"{path}: payload chưa hiệu chỉnh")
    return p


def num(ref):
    return int(ref.rsplit("#", 1)[1])


def hours_of(swp):
    return round(swp * K * 2) / 2


def main():
    base = glob.glob(os.path.join(ROOT, "reports", "sun-estimate-lab5-project1-*.html"))
    # thứ tự chấm lại ghi trong gate-b-decisions.yaml (generatedAt trong payload trùng ngày nên không dùng để sắp)
    G = yaml.safe_load(open(os.path.join(os.path.dirname(__file__), "gate-b-decisions.yaml"), encoding="utf-8"))
    rescores = [os.path.join(ROOT, "reports", f) for f in G["rescore_reports"]]
    found = {os.path.basename(f) for f in glob.glob(os.path.join(ROOT, "reports", "sun-estimate-lab5-*.html"))} - {os.path.basename(base[0])}
    if found != set(G["rescore_reports"]):
        sys.exit(f"rescore_reports lệch với reports/: {sorted(found ^ set(G['rescore_reports']))}")
    if len(base) != 1:
        sys.exit(f"cần đúng 1 báo cáo P3 trong reports/, thấy {len(base)}")
    p3 = payload(base[0])
    scored = {num(x["issueRef"]): x for x in p3["issues"]}
    rescored = set()
    for f in rescores:  # chấm lại thay điểm cũ
        for x in payload(f)["issues"]:
            scored[num(x["issueRef"])] = x
            rescored.add(num(x["issueRef"]))

    M = {r["id"]: int(r["number"]) for r in csv.DictReader(open(os.path.join(ROOT, "backlog", "issue-map.csv"), encoding="utf-8"))}
    d = yaml.safe_load(open(os.path.join(ROOT, "backlog", "backlog.yaml"), encoding="utf-8"))
    by = {i["id"]: i for i in d["issues"]}
    kids = {}
    for i in d["issues"]:
        kids.setdefault(i["parent"] or i["epic"], []).append(i["id"])
    if d.get("rescore_pending"):
        sys.exit(f"còn rescore_pending: {d['rescore_pending']}")

    rows = {}

    def total(x):
        """(SWP ban đầu, SWP chốt, giờ) cộng dồn từ lá."""
        if x in rows:
            r = rows[x]
            return r["swp_initial"], r["swp_final"], r["hours"]
        if x not in kids:  # lá
            n, i = M[x], by[x]
            if n not in scored:
                sys.exit(f"lá {x} (#{n}) chưa có SWP")
            s = scored[n]
            rows[x] = dict(id=x, number=n, level="leaf", epic=i["epic"], parent_id=i["parent"] or i["epic"], kind=i["kind"],
                           iteration=i.get("iteration") or "", hours_hint=i["hours_hint"], swp_initial=s["initialSWP"],
                           swp_final=s["finalSWP"], hours=hours_of(s["finalSWP"]))
            return total(x)
        a = [total(c) for c in kids[x]]
        i = by.get(x)
        rows[x] = dict(id=x, number=M[x], level="parent" if i else "epic", epic=i["epic"] if i else x,
                       parent_id=(i["parent"] or i["epic"]) if i else "", kind=i["kind"] if i else "",
                       iteration=(i.get("iteration") or "") if i else "", hours_hint="", swp_initial=sum(t[0] for t in a),
                       swp_final=sum(t[1] for t in a), hours=sum(t[2] for t in a))
        return total(x)

    for e in d["epics"]:
        total(e["id"])
    if set(rows) != set(M):
        sys.exit(f"lệch issue-map: thiếu {sorted(set(M) - set(rows))[:5]}, thừa {sorted(set(rows) - set(M))[:5]}")
    leaves = [r for r in rows.values() if r["level"] == "leaf"]
    unused = {n for n in scored if n not in {r["number"] for r in leaves}}  # lá P3 nay là cha
    # cha không chứa lá chấm lại / lá cũ đã thành cha phải khớp SWP cha của payload P3
    touched = {r["parent_id"] for r in leaves if r["number"] in rescored} | {rows[x]["parent_id"] for x in rows if rows[x]["number"] in unused}
    while True:
        more = {rows[x]["parent_id"] for x in touched if x in rows and rows[x]["parent_id"]} - touched
        if not more:
            break
        touched |= more
    for x in p3["parents"]:
        r = next(v for v in rows.values() if v["number"] == num(x["issueRef"]))
        if r["id"] not in touched and r["swp_final"] != x["finalSWP"]:
            sys.exit(f"{r['id']}: SWP cha {r['swp_final']} ≠ payload P3 {x['finalSWP']}")

    with open(OUT, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        for r in sorted(rows.values(), key=lambda r: r["number"]):
            w.writerow(r)
    print(f"nguồn {os.path.basename(base[0])} + {len(rescores)} báo cáo chấm lại ({len(rescored)} lá); bỏ {len(unused)} lá P3 nay là cha; "
          f"K={K}; {len(rows)} dòng (lá {len(leaves)}, cha / epic {len(rows) - len(leaves)})")
    print(f"lá: SWP ban đầu {sum(r['swp_initial'] for r in leaves)} → chốt {sum(r['swp_final'] for r in leaves)}; "
          f"giờ {sum(r['hours'] for r in leaves)}; giờ sơ bộ {sum(r['hours_hint'] for r in leaves)}")


if __name__ == "__main__":
    main()
