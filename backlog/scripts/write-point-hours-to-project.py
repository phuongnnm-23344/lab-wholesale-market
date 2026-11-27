"""P3: ghi field Point (SWP đã chốt) và Hours (SWP × K) lên GitHub Project từ backlog/estimate-swp-hours.csv.

Chạy lại được: đọc giá trị hiện có, chỉ ghi ô khác; giãn nhịp --gap giây giữa hai lần ghi; xong thì đọc lại
toàn bộ Project và so từng dòng (exit 1 nếu lệch).

    python -X utf8 backlog/scripts/write-point-hours-to-project.py [--gap 2] [--only ID,ID] [--dry-run] [--verify-only]
"""
import argparse
import csv
import importlib.util
import os
import sys
import time

spec = importlib.util.spec_from_file_location("gh_helpers", os.path.join(os.path.dirname(__file__), "github-api-helpers.py"))
H = importlib.util.module_from_spec(spec)
spec.loader.exec_module(H)

# số ghi thẳng vào câu lệnh: `gh -F` không ép "82.0" thành Float
MUT = """mutation($p:ID!,$i:ID!,$f:ID!){updateProjectV2ItemFieldValue(input:{projectId:$p,itemId:$i,fieldId:$f,
  value:{number:%s}}){projectV2Item{id}}}"""


def read_project(cfg):
    """item_id → {"Point": x, "Hours": y} đọc từ Project."""
    out, cursor = {}, None
    while True:
        q = """query($p:ID!,$c:String){node(id:$p){... on ProjectV2{items(first:100,after:$c){pageInfo{hasNextPage endCursor}
          nodes{id fieldValues(first:20){nodes{... on ProjectV2ItemFieldNumberValue{number field{... on ProjectV2FieldCommon{name}}}}}}}}}}"""
        page = H.graphql(q, p=cfg["project_id"], **({"c": cursor} if cursor else {}))["node"]["items"]
        for n in page["nodes"]:
            out[n["id"]] = {v["field"]["name"]: v["number"] for v in n["fieldValues"]["nodes"] if v.get("field")}
        if not page["pageInfo"]["hasNextPage"]:
            return out
        cursor = page["pageInfo"]["endCursor"]


def targets(only):
    M = H.load_map()
    rows = list(csv.DictReader(open(os.path.join(H.ROOT, "backlog", "estimate-swp-hours.csv"), encoding="utf-8")))
    if len(rows) != len(M):
        sys.exit(f"estimate-swp-hours.csv có {len(rows)} dòng ≠ issue-map {len(M)}")
    return [(r["id"], M[r["id"]]["item_id"], float(r["swp_final"]), float(r["hours"])) for r in rows if not only or r["id"] in only]


def compare(cfg, want):
    cur = read_project(cfg)
    bad = [(x, cur.get(it), p, h) for x, it, p, h in want
           if cur.get(it, {}).get("Point") != p or cur.get(it, {}).get("Hours") != h]
    return cur, bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gap", type=float, default=2.0)
    ap.add_argument("--only", default="")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--verify-only", action="store_true")
    a = ap.parse_args()
    cfg = H.load_config()
    fid = {k: cfg["fields"][k]["id"] for k in ("Point", "Hours")}
    want = targets(set(filter(None, a.only.split(","))))
    if not a.verify_only:
        cur = read_project(cfg)
        todo = [(x, it, f, v) for x, it, p, h in want for f, v in (("Point", p), ("Hours", h)) if cur.get(it, {}).get(f) != v]
        print(f"cần ghi {len(todo)} ô / {2 * len(want)}", flush=True)
        for k, (x, it, f, v) in enumerate(todo, 1):
            if a.dry_run:
                print(f"  [dry] {x} {f}={v}")
                continue
            H.graphql(MUT % repr(float(v)), p=cfg["project_id"], i=it, f=fid[f])
            if k % 50 == 0 or k == len(todo):
                print(f"  đã ghi {k}/{len(todo)} (vừa xong {x} {f}={v})", flush=True)
            time.sleep(a.gap)
    _, bad = compare(cfg, want)
    print(f"đọc lại: {len(want)} item, khớp {len(want) - len(bad)}, lệch {len(bad)}")
    for b in bad[:20]:
        print("  lệch", b)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
