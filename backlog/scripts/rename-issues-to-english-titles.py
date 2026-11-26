"""Đổi tiêu đề các issue đã tạo sang tiêu đề tiếng Anh `title_en` của backlog/backlog.yaml
(dạng [PREFIX][màn / function][vai] English title — người dùng chốt 2026-11-26). Chạy song song được với
push-backlog-to-project.py: không ghi issue-map.csv, chỉ đọc; lấy tiêu đề hiện tại từ GitHub nên chạy lại được.

    python -X utf8 backlog/scripts/rename-issues-to-english-titles.py [--gap 15]
"""
import importlib.util
import os
import sys
import time
import yaml

spec = importlib.util.spec_from_file_location("gh_helpers", os.path.join(os.path.dirname(__file__), "github-api-helpers.py"))
H = importlib.util.module_from_spec(spec)
spec.loader.exec_module(H)
GAP = float(sys.argv[sys.argv.index("--gap") + 1]) if "--gap" in sys.argv else 15.0

doc = yaml.safe_load(open(os.path.join(H.ROOT, "backlog", "backlog.yaml"), encoding="utf-8"))
en = {x["id"]: x.get("title_en") for x in doc["issues"] + doc["epics"]}
M = H.load_map()
current, page = {}, 1
while True:
    rows = H.gh(["api", f"repos/{H.OWNER}/{H.REPO}/issues?state=all&per_page=100&page={page}"])
    current.update({str(r["number"]): r["title"] for r in rows if "pull_request" not in r})
    if len(rows) < 100:
        break
    page += 1
todo = [(x, r["number"]) for x, r in M.items() if r.get("number") and en.get(x) and current.get(r["number"]) not in (None, en[x])]
print(f"cần đổi {len(todo)} tiêu đề", flush=True)
for n, (x, num) in enumerate(sorted(todo, key=lambda t: int(t[1])), 1):
    H.gh(["api", f"repos/{H.OWNER}/{H.REPO}/issues/{num}", "-X", "PATCH", "--input", "-"], {"title": en[x]})
    print(f"renamed #{num} {x}", flush=True)
    time.sleep(GAP)
print("rename done", len(todo))
