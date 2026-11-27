"""P2 bước 2: tạo issue từ backlog/backlog.yaml, nối epic → issue → sub-issue, thêm vào Project, đặt field.

    python -X utf8 backlog/scripts/push-backlog-to-project.py [--only ID,ID,...] [--limit N] [--gap 7.5]

- Chạy lại được, không tạo trùng: mỗi bước của mỗi ID ghi vào backlog/issue-map.csv (number, node_id, item_id, linked, fields_set).
- Thứ tự topo: epic → cha → issue được phụ thuộc trước, nên thân issue ghi được `#số` của phụ thuộc ngay.
- Giãn nhịp: tạo issue cách nhau `--gap` giây (mặc định 7,5 → ≤ 480 issue / giờ, dưới giới hạn 500 / giờ của GitHub).
- Hours, Point để trống (điền ở P3).
"""
import importlib.util
import os
import sys
import time
import yaml

spec = importlib.util.spec_from_file_location("gh_helpers", os.path.join(os.path.dirname(__file__), "github-api-helpers.py"))
H = importlib.util.module_from_spec(spec)
spec.loader.exec_module(H)
arg = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
ONLY = set(arg("--only", "").split(",")) - {""}
LIMIT, GAP = int(arg("--limit", "100000")), float(arg("--gap", "7.5"))

doc = yaml.safe_load(open(os.path.join(H.ROOT, "backlog", "backlog.yaml"), encoding="utf-8"))
cfg, M = H.load_config(), H.load_map()
F = cfg["fields"]
iss = {i["id"]: i for i in doc["issues"]}
eps = {e["id"]: e for e in doc["epics"]}
parent_of = lambda x: (iss[x]["parent"] or iss[x]["epic"]) if x in iss else None

# thứ tự topo (Kahn, giữ thứ tự yaml)
order_src = list(eps) + list(iss)
deps = {x: ([parent_of(x)] if parent_of(x) else []) + (iss[x]["depends_on"] if x in iss else []) for x in order_src}
done, order = set(), []
while len(order) < len(order_src):
    nxt = [x for x in order_src if x not in done and all(d in done for d in deps[x])]
    assert nxt, "chu trình"
    for x in nxt:
        done.add(x)
        order.append(x)


def ref(x):
    t = iss[x]["title"] if x in iss else eps[x]["title"]
    return (f"#{M[x]['number']}" if x in M and M[x].get("number") else "(chưa tạo)") + f" `{x}` {t}"


def body(x):
    if x in eps:
        e = eps[x]
        return (f"<!-- backlog-id: {x} -->\n**Tiêu đề (VI):** {e['title']}\n\n**Epic** `{x}` · Ưu tiên gốc: {e['priority']} · Sprint dự kiến (WBS LAB-1): {e['planned_sprint']}\n\n"
                f"{e.get('summary', '').strip()}\n\n**ID RFP:** {', '.join(e.get('rfp_refs') or []) or '—'}\n\n"
                "Issue / sub-issue con: xem mục Sub-issues. Nguồn: `backlog/backlog.yaml`, `task-breakdown.md`.")
    i = iss[x]
    L = [f"<!-- backlog-id: {x} -->", f"**Tiêu đề (VI):** {i['title']}",
         f"**ID backlog** `{x}` · Epic `{i['epic']}` · Loại `{i['kind']}` · Vai {i['role']} · Người phụ trách (giả định) {i['assignee']} · "
         f"Giờ sơ bộ {i['hours_hint']} · Ưu tiên {i['priority']}" + (f" · {i['iteration']}" if i["iteration"] else "")
         + (f" · Mốc: {i['milestone']}" if i.get("milestone") else "") + (f" · Điều kiện dùng thử: {', '.join(i['acceptance'])}" if i["acceptance"] else ""),
         "", "### Mô tả", (i["description"] or "").strip(), "", "### Điều kiện xong (DoD riêng; DoD chung: task-breakdown.md §1.2)"]
    L += [f"- [ ] {d}" for d in i["dod"]] or ["- (theo DoD chung)"]
    L += ["", "### Phụ thuộc"] + ([f"- {ref(d)}" for d in i["depends_on"]] or ["- —"])
    if i.get("depends_on_spec"):
        L += [f"- (spec) {s}" for s in i["depends_on_spec"]]
    L += ["", "### Spec LAB-4"] + [f"- {s}" for s in i["spec_refs"]] + ["", f"**ID RFP:** {', '.join(i['rfp_refs'])}"]
    return "\n".join(L)


def set_field(item, name, value):
    f = F[name]
    if name in ("Priority", "Status", "Đợt / mốc"):
        v = f'{{singleSelectOptionId:"{f["options"][value]}"}}'
    elif name == "Iteration":
        v = f'{{iterationId:"{f["iterations"][value]}"}}'
    else:
        v = f'{{text:"{value}"}}'
    H.graphql(f'mutation($p:ID!,$i:ID!,$f:ID!){{updateProjectV2ItemFieldValue(input:{{projectId:$p,itemId:$i,fieldId:$f,value:{v}}}){{projectV2Item{{id}}}}}}',
              p=cfg["project_id"], i=item, f=f["id"])



def main():
    n_new = 0
    for x in order:
        if ONLY and x not in ONLY:
            continue
        r = M.setdefault(x, {"id": x})
        if not r.get("number"):
            if n_new >= LIMIT:
                break
            meta = iss.get(x) or eps[x]
            labels = (["epic"] + meta["labels"]) if x in eps else meta["labels"]
            title = meta.get("title_en") or meta["title"]
            res = None
            for attempt in range(6):
                try:  # POST không tự thử lại: lỗi mạng có thể đã tạo issue → tìm theo backlog-id trước khi tạo lại
                    res = H.gh(["api", f"repos/{H.OWNER}/{H.REPO}/issues", "-X", "POST", "--input", "-"],
                               {"title": title, "body": body(x), "labels": sorted(set(labels))}, retries=1)
                    break
                except ConnectionError:
                    time.sleep(20)
                    recent = H.gh(["api", f"repos/{H.OWNER}/{H.REPO}/issues?state=all&per_page=5&sort=created&direction=desc"])
                    hit = [i for i in recent if f"<!-- backlog-id: {x} -->" in (i.get("body") or "")]
                    if hit:
                        res = hit[0]
                        break
            assert res, f"không tạo được {x}"
            r.update(number=str(res["number"]), node_id=res["node_id"])
            H.save_map(M)
            n_new += 1
            print(f"created #{res['number']} {x}", flush=True)
            time.sleep(GAP)
        p = parent_of(x)
        if p and not r.get("linked"):
            H.graphql("mutation($p:ID!,$c:ID!){addSubIssue(input:{issueId:$p,subIssueId:$c}){issue{id}}}", sub_issues=True,
                      p=M[p]["node_id"], c=r["node_id"])
            r["linked"] = "1"
            H.save_map(M)
        if not r.get("item_id"):
            # Project tự thêm sub-issue khi nối cha (auto-add sub-issues) hoặc lần chạy trước đã thêm → tra lại, có độ trễ
            def lookup():
                nodes = H.graphql("query($c:ID!){node(id:$c){... on Issue{projectItems(first:10){nodes{id project{id}}}}}}",
                                  c=r["node_id"])["node"]["projectItems"]["nodes"]
                return [n["id"] for n in nodes if n["project"]["id"] == cfg["project_id"]]
            have = lookup()
            if not have:
                try:
                    have = [H.graphql("mutation($p:ID!,$c:ID!){addProjectV2ItemById(input:{projectId:$p,contentId:$c}){item{id}}}",
                                      p=cfg["project_id"], c=r["node_id"])["addProjectV2ItemById"]["item"]["id"]]
                except RuntimeError as ex:
                    if "already exists" not in str(ex):
                        raise
                    for _ in range(10):
                        time.sleep(3)
                        have = lookup()
                        if have:
                            break
                    assert have, f"không tìm được item của {x}"
            r["item_id"] = have[0]
            H.save_map(M)
        if not r.get("fields_set"):
            meta = iss.get(x) or eps[x]
            set_field(r["item_id"], "Status", "Todo")
            set_field(r["item_id"], "Priority", meta["priority"])
            if x in iss:
                set_field(r["item_id"], "Người phụ trách (giả định)", meta["assignee"])
                if meta["iteration"]:
                    set_field(r["item_id"], "Iteration", meta["iteration"])
                if meta.get("milestone"):
                    set_field(r["item_id"], "Đợt / mốc", meta["milestone"])
            r["fields_set"] = "1"
            H.save_map(M)
    print("done; mapped", sum(1 for v in M.values() if v.get("number")), "/", len(order))


if __name__ == "__main__":
    main()
