"""P2 bước 3: đếm qua API và so với backlog/backlog.yaml — issue, item trong Project, quan hệ cha / con, field
(Status: Todo, trừ item Iteration 1 lấy trạng thái cuối sprint từ progress/iteration-1-daily.csv — P4).

    python -X utf8 backlog/scripts/verify-github-project.py
"""
import importlib.util
import os
import re
import sys
import yaml

spec = importlib.util.spec_from_file_location("gh_helpers", os.path.join(os.path.dirname(__file__), "github-api-helpers.py"))
H = importlib.util.module_from_spec(spec)
spec.loader.exec_module(H)
doc = yaml.safe_load(open(os.path.join(H.ROOT, "backlog", "backlog.yaml"), encoding="utf-8"))
iss = {i["id"]: i for i in doc["issues"]}
want = {e["id"]: None for e in doc["epics"]} | {x: (i["parent"] or i["epic"]) for x, i in iss.items()}
cfg, M = H.load_config(), H.load_map()
# Status mong đợi: trạng thái cuối sprint theo nhật ký giả lập (P4) cho item Iteration 1, còn lại Todo
spec = importlib.util.spec_from_file_location("daily_log", os.path.join(os.path.dirname(__file__), "iteration-daily-log.py"))
L = importlib.util.module_from_spec(spec)
spec.loader.exec_module(L)
SPRINT_STATUS = L.final_status() if os.path.exists(L.LOG) else {}

# issue trong repo (đọc ID backlog từ thân), cha
found, cursor = {}, None
while True:
    q = """query($o:String!,$r:String!,$c:String){repository(owner:$o,name:$r){issues(first:100,after:$c,states:[OPEN,CLOSED]){
      pageInfo{hasNextPage endCursor} nodes{number body parent{number}}}}}"""
    kw = dict(o=H.OWNER, r=H.REPO) | ({"c": cursor} if cursor else {})
    page = H.graphql(q, sub_issues=True, **kw)["repository"]["issues"]
    for n in page["nodes"]:
        m = re.search(r"<!-- backlog-id: (\S+) -->", n["body"] or "")
        if m:
            found[m.group(1)] = (n["number"], (n["parent"] or {}).get("number"))
    if not page["pageInfo"]["hasNextPage"]:
        break
    cursor = page["pageInfo"]["endCursor"]

# item trong Project + field
items, cursor = {}, None
while True:
    q = """query($p:ID!,$c:String){node(id:$p){... on ProjectV2{items(first:100,after:$c){pageInfo{hasNextPage endCursor}
      nodes{content{... on Issue{number}} fieldValues(first:15){nodes{
        ... on ProjectV2ItemFieldSingleSelectValue{name field{... on ProjectV2FieldCommon{name}}}
        ... on ProjectV2ItemFieldIterationValue{title field{... on ProjectV2FieldCommon{name}}}
        ... on ProjectV2ItemFieldTextValue{text field{... on ProjectV2FieldCommon{name}}}}}}}}}}"""
    page = H.graphql(q, p=cfg["project_id"], **({"c": cursor} if cursor else {}))["node"]["items"]
    for n in page["nodes"]:
        vals = {v["field"]["name"]: v.get("name") or v.get("title") or v.get("text") for v in n["fieldValues"]["nodes"] if v.get("field")}
        items[(n["content"] or {}).get("number")] = vals
    if not page["pageInfo"]["hasNextPage"]:
        break
    cursor = page["pageInfo"]["endCursor"]

err = []
num = {x: v[0] for x, v in found.items()}
for x, p in want.items():
    if x not in found:
        err.append(f"thiếu issue {x}")
        continue
    if p and found[x][1] != num.get(p):
        err.append(f"cha sai {x}: #{found[x][1]} ≠ #{num.get(p)} ({p})")
    v = items.get(found[x][0])
    if v is None:
        err.append(f"không có trong Project {x}")
        continue
    meta = iss.get(x) or next(e for e in doc["epics"] if e["id"] == x)
    exp = {"Status": SPRINT_STATUS.get(x, "Todo"), "Priority": meta["priority"]}
    if x in iss:
        exp["Người phụ trách (giả định)"] = meta["assignee"]
        if meta["iteration"]:
            exp["Iteration"] = meta["iteration"]
        if meta.get("milestone"):
            exp["Đợt / mốc"] = meta["milestone"]
    for k, e in exp.items():
        if v.get(k) != e:
            err.append(f"field {k} sai ở {x}: {v.get(k)} ≠ {e}")
extra = set(found) - set(want)
print(f"yaml: {len(doc['epics'])} epic + {len(iss)} issue = {len(want)}; repo: {len(found)} issue có backlog-id; "
      f"Project: {len(items)} item; Iteration 1: {sum(1 for v in items.values() if v.get('Iteration') == 'Iteration 1')} item; "
      f"thừa: {sorted(extra)}; issue-map: {sum(1 for r in M.values() if r.get('number'))}")
for e in err[:40]:
    print("ERR", e)
print(f"errors={len(err)}")
sys.exit(1 if err or extra else 0)
