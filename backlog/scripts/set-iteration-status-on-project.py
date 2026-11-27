"""P4: đặt Status cuối sprint trên GitHub Project cho các item Iteration 1, theo nhật ký giả lập progress/iteration-1-daily.csv
(trạng thái cuối của 26 lá + cha A-FG01-19). Không đóng issue (sprint là giả lập 2027; đóng bây giờ thì closedAt = 2026, lệch lịch).
Không đụng Point / Hours / item ngoài Iteration 1.

Chạy lại được: đọc Status hiện có, chỉ ghi ô khác, giãn --gap giây; xong thì đọc lại toàn bộ Project, so từng item và in bảng
Trạng thái · Số issue (lá) · Tổng SWP đếm từ Project (exit 1 nếu lệch).

    python -X utf8 backlog/scripts/set-iteration-status-on-project.py [--gap 2] [--dry-run] [--verify-only]
"""
import argparse
import importlib.util
import os
import sys
import time


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(os.path.dirname(__file__), file))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


H = load("gh_helpers", "github-api-helpers.py")
L = load("daily_log", "iteration-daily-log.py")

MUT = """mutation($p:ID!,$i:ID!,$f:ID!,$o:String!){updateProjectV2ItemFieldValue(input:{projectId:$p,itemId:$i,fieldId:$f,
  value:{singleSelectOptionId:$o}}){projectV2Item{id}}}"""


def read_project(cfg):
    """item_id → {"number", "Status", "Iteration", "Point"} đọc từ Project."""
    out, cursor = {}, None
    q = """query($p:ID!,$c:String){node(id:$p){... on ProjectV2{items(first:100,after:$c){pageInfo{hasNextPage endCursor}
      nodes{id content{... on Issue{number}} fieldValues(first:20){nodes{
        ... on ProjectV2ItemFieldSingleSelectValue{name field{... on ProjectV2FieldCommon{name}}}
        ... on ProjectV2ItemFieldIterationValue{title field{... on ProjectV2FieldCommon{name}}}
        ... on ProjectV2ItemFieldNumberValue{number field{... on ProjectV2FieldCommon{name}}}}}}}}}}"""
    while True:
        page = H.graphql(q, p=cfg["project_id"], **({"c": cursor} if cursor else {}))["node"]["items"]
        for n in page["nodes"]:
            v = {x["field"]["name"]: x.get("name") or x.get("title") or x.get("number") for x in n["fieldValues"]["nodes"] if x.get("field")}
            v["number"] = (n["content"] or {}).get("number")
            out[n["id"]] = v
        if not page["pageInfo"]["hasNextPage"]:
            return out
        cursor = page["pageInfo"]["endCursor"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gap", type=float, default=2.0)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--verify-only", action="store_true")
    a = ap.parse_args()
    cfg, M = H.load_config(), H.load_map()
    rows = L.load_estimate()
    leaves = L.committed(rows)
    want = {M[x]["item_id"]: (x, s) for x, s in L.final_status(rows=rows).items()}
    fid, opt = cfg["fields"]["Status"]["id"], cfg["fields"]["Status"]["options"]
    if not a.verify_only:
        cur = read_project(cfg)
        todo = [(it, x, s) for it, (x, s) in want.items() if cur.get(it, {}).get("Status") != s]
        print(f"cần ghi {len(todo)} / {len(want)} item", flush=True)
        for it, x, s in todo:
            print(f"  {'[dry] ' if a.dry_run else ''}#{M[x]['number']} {x} → {s}", flush=True)
            if not a.dry_run:
                H.graphql(MUT, p=cfg["project_id"], i=it, f=fid, o=opt[s])
                time.sleep(a.gap)
    cur = read_project(cfg)
    bad = [(x, cur.get(it, {}).get("Status"), s) for it, (x, s) in want.items() if cur.get(it, {}).get("Status") != s]
    it1 = [v for v in cur.values() if v.get("Iteration") == L.ITERATION]
    extra = [v["number"] for v in it1 if str(v["number"]) not in {M[x]["number"] for x in L.final_status(rows=rows)}]
    leaf_no = {r["number"] for r in leaves.values()}
    print(f"đọc lại: {len(want)} item Iteration 1, khớp {len(want) - len(bad)}, lệch {len(bad)}; "
          f"Project có {len(it1)} item Iteration 1, ngoài danh sách {extra}")
    print("| Trạng thái | Số issue (lá) | Tổng SWP |")
    for s in L.STATUSES:
        lv = [v for v in it1 if v.get("Status") == s and str(v["number"]) in leaf_no]
        print(f"| {s} | {len(lv)} | {sum(v.get('Point') or 0 for v in lv):g} |")
    for b in bad:
        print("  lệch", b)
    sys.exit(1 if bad or extra else 0)


if __name__ == "__main__":
    main()
