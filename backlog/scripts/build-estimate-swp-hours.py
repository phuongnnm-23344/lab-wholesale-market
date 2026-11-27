"""P3: SWP đã chốt (payload nhúng trong báo cáo HTML của tkm:sun-estimate) → giờ = SWP × K → backlog/estimate-swp-hours.csv.

Lá: Point = finalSWP, Hours = finalSWP × K (làm tròn 0,5 giờ). Cha / epic: Point = SWP cộng dồn trong payload,
Hours = tổng Hours của con. Script kiểm: SWP cha = tổng SWP lá con cháu; mọi issue trong issue-map có đúng một dòng.

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


def report_payload():
    """Đọc payload JSON nhúng trong báo cáo HTML (nguồn duy nhất của SWP)."""
    files = sorted(glob.glob(os.path.join(ROOT, "reports", "sun-estimate-lab5-*.html")))
    if len(files) != 1:
        sys.exit(f"cần đúng 1 báo cáo HTML trong reports/, thấy {len(files)}")
    html = open(files[0], encoding="utf-8").read()
    m = re.search(r'<script id="report-data" type="application/json">(.*?)</script>', html, re.S)
    return os.path.relpath(files[0], ROOT), json.loads(m.group(1))


def num(ref):
    return int(ref.rsplit("#", 1)[1])


def hours_of(swp):
    return round(swp * K * 2) / 2


def main():
    html_path, p = report_payload()
    if p["run"]["calibrationStatus"] != "calibrated":
        sys.exit("payload chưa hiệu chỉnh (calibrationStatus != calibrated)")
    n2id = {int(r["number"]): r["id"] for r in csv.DictReader(open(os.path.join(ROOT, "backlog", "issue-map.csv"), encoding="utf-8"))}
    d = yaml.safe_load(open(os.path.join(ROOT, "backlog", "backlog.yaml"), encoding="utf-8"))
    by = {i["id"]: i for i in d["issues"]}
    epics = {e["id"] for e in d["epics"]}

    rows = {}
    for x in p["issues"]:
        n = num(x["issueRef"]); i = by[n2id[n]]
        rows[n] = dict(id=i["id"], number=n, level="leaf", epic=i["epic"], parent_id=i["parent"] or i["epic"], kind=i["kind"],
                       iteration=i.get("iteration") or "", hours_hint=i["hours_hint"], swp_initial=x["initialSWP"],
                       swp_final=x["finalSWP"], hours=hours_of(x["finalSWP"]))
    parents = {num(x["issueRef"]): x for x in p["parents"]}

    def total(n):
        """(SWP, giờ) cộng dồn từ lá; kiểm SWP payload của cha."""
        if n in rows and rows[n]["level"] == "leaf":
            return rows[n]["swp_final"], rows[n]["hours"]
        s = h = 0
        for c in parents[n]["childRefs"]:
            cs, ch = total(num(c))
            s, h = s + cs, h + ch
        if s != parents[n]["finalSWP"]:
            sys.exit(f"#{n}: SWP payload {parents[n]['finalSWP']} ≠ tổng lá {s}")
        return s, h

    for n, x in parents.items():
        xid = n2id[n]
        s, h = total(n)
        i = by.get(xid, {})
        rows[n] = dict(id=xid, number=n, level="epic" if xid in epics else "parent", epic=xid if xid in epics else i["epic"],
                       parent_id="" if xid in epics else (i["parent"] or i["epic"]), kind="" if xid in epics else i["kind"],
                       iteration=i.get("iteration") or "", hours_hint="", swp_initial=x["initialSWP"], swp_final=s, hours=h)
    missing = set(n2id) - set(rows)
    if missing:
        sys.exit(f"issue không có trong payload: {sorted(missing)[:10]}")
    with open(OUT, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        for n in sorted(rows):
            w.writerow(rows[n])
    leaves = [r for r in rows.values() if r["level"] == "leaf"]
    print(f"nguồn {html_path}; K={K}; {len(rows)} dòng (lá {len(leaves)}, cha {len(rows) - len(leaves)})")
    print(f"lá: SWP ban đầu {sum(r['swp_initial'] for r in leaves)} → chốt {sum(r['swp_final'] for r in leaves)}; "
          f"giờ {sum(r['hours'] for r in leaves)}; giờ sơ bộ {sum(r['hours_hint'] for r in leaves)}")


if __name__ == "__main__":
    main()
