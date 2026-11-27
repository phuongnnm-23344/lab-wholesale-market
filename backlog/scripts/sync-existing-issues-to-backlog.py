"""Đồng bộ issue ĐÃ có trên GitHub với backlog/backlog.yaml: tiêu đề (title_en), thân, nhãn, field Priority.

push-backlog-to-project.py chỉ tạo issue mới; script này dùng khi backlog đổi nội dung issue cũ (vd. Gate B: lá thu hẹp,
cha mới, nhãn needs-split). Chạy lại được: chỉ ghi chỗ khác; giãn --gap giây giữa hai lần ghi. Không đụng Point / Hours.

    python -X utf8 backlog/scripts/sync-existing-issues-to-backlog.py --only ID,ID [--gap 2] [--dry-run]

`--only` bắt buộc: issue #1..#285 tạo trước khi thân có dòng "Tiêu đề (VI)" nên thân lệch khuôn hiện tại; chỉ đồng bộ issue
mà backlog vừa đổi, không ghi lại hàng trăm thân issue không đổi nội dung.
"""
import argparse
import importlib.util
import os
import time


def load(name):
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), os.path.join(os.path.dirname(__file__), name + ".py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


P = load("push-backlog-to-project")  # body(), set_field(), iss, eps, M, H
H = P.H
LABEL_COLORS = {"needs-split": ("d93f0b", "Lá > 16 giờ: tách và chấm lại trước buổi lập kế hoạch sprint (L5-D08)")}


def read_repo():
    out, cursor = {}, None
    while True:
        q = """query($o:String!,$r:String!,$c:String){repository(owner:$o,name:$r){issues(first:100,after:$c,states:[OPEN,CLOSED]){
          pageInfo{hasNextPage endCursor} nodes{number title body labels(first:30){nodes{name}}}}}}"""
        page = H.graphql(q, o=H.OWNER, r=H.REPO, **({"c": cursor} if cursor else {}))["repository"]["issues"]
        for n in page["nodes"]:
            out[n["number"]] = dict(title=n["title"], body=n["body"] or "", labels={l["name"] for l in n["labels"]["nodes"]})
        if not page["pageInfo"]["hasNextPage"]:
            return out
        cursor = page["pageInfo"]["endCursor"]


def read_priority():
    out, cursor = {}, None
    while True:
        q = """query($p:ID!,$c:String){node(id:$p){... on ProjectV2{items(first:100,after:$c){pageInfo{hasNextPage endCursor}
          nodes{id fieldValueByName(name:"Priority"){... on ProjectV2ItemFieldSingleSelectValue{name}}}}}}}"""
        page = H.graphql(q, p=P.cfg["project_id"], **({"c": cursor} if cursor else {}))["node"]["items"]
        for n in page["nodes"]:
            out[n["id"]] = (n["fieldValueByName"] or {}).get("name")
        if not page["pageInfo"]["hasNextPage"]:
            return out
        cursor = page["pageInfo"]["endCursor"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gap", type=float, default=2.0)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--only", required=True)
    a = ap.parse_args()
    only = set(a.only.split(",")) - {""}
    existing = {l["name"] for l in H.gh(["api", f"repos/{H.OWNER}/{H.REPO}/labels?per_page=100", "--paginate"])}
    for name, (color, desc) in LABEL_COLORS.items():
        if name not in existing and not a.dry_run:
            H.gh(["api", f"repos/{H.OWNER}/{H.REPO}/labels", "-X", "POST", "--input", "-"], {"name": name, "color": color, "description": desc})
            print("label tạo", name)
    gh_issues, prio = read_repo(), read_priority()
    n = 0
    for x, r in P.M.items():
        if not r.get("number") or x not in only:
            continue
        meta = P.iss.get(x) or P.eps[x]
        want_title = meta.get("title_en") or meta["title"]
        want_labels = set((["epic"] + meta["labels"]) if x in P.eps else meta["labels"])
        cur = gh_issues[int(r["number"])]
        patch = {}
        if cur["title"] != want_title:
            patch["title"] = want_title
        if cur["body"].replace("\r\n", "\n").strip() != P.body(x).strip():
            patch["body"] = P.body(x)
        if not want_labels <= cur["labels"]:
            patch["labels"] = sorted(want_labels | cur["labels"])  # chỉ thêm nhãn, không gỡ nhãn người khác gắn
        if patch:
            print(f"#{r['number']} {x}: {', '.join(patch)}", flush=True)
            if not a.dry_run:
                H.gh(["api", f"repos/{H.OWNER}/{H.REPO}/issues/{r['number']}", "-X", "PATCH", "--input", "-"], patch)
                n += 1
                time.sleep(a.gap)
        if prio.get(r["item_id"]) != meta["priority"]:
            print(f"#{r['number']} {x}: Priority {prio.get(r['item_id'])} → {meta['priority']}", flush=True)
            if not a.dry_run:
                P.set_field(r["item_id"], "Priority", meta["priority"])
                n += 1
                time.sleep(a.gap)
    print(f"sync xong: {n} lần ghi" + (" (dry-run)" if a.dry_run else ""))


if __name__ == "__main__":
    main()
