"""Hàm dùng chung cho setup-github-project.py và push-backlog-to-project.py: gọi `gh`, chờ khi bị giới hạn tốc độ,
đọc / ghi cấu hình Project và bảng ánh xạ ID backlog → issue."""
import csv
import json
import os
import subprocess
import time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OWNER, REPO = "phuongnnm-23344", "lab-wholesale-market"
CONFIG = os.path.join(ROOT, "backlog", "github-project-config.json")
MAP = os.path.join(ROOT, "backlog", "issue-map.csv")
MAP_FIELDS = ["id", "number", "node_id", "item_id", "linked", "fields_set"]


def gh(args, payload=None, retries=8):
    """Chạy `gh ...`; trả JSON. Gặp giới hạn tốc độ (secondary / abuse / 403 / 429) thì chờ rồi thử lại."""
    wait = 60
    for attempt in range(retries):
        r = subprocess.run(["gh"] + args, input=json.dumps(payload) if payload is not None else None,
                           capture_output=True, text=True, encoding="utf-8")
        out = (r.stdout or "") + (r.stderr or "")
        if r.returncode == 0 and '"errors"' not in r.stdout[:200]:
            return json.loads(r.stdout) if r.stdout.strip() else {}
        low = out.lower()
        network = any(k in low for k in ("timeout", "connection reset", "eof", "tls", "502", "503", "504", "no such host"))
        if network and retries > 1:
            print(f"  ... lỗi mạng, thử lại sau 20s (lần {attempt + 1})", flush=True)
            time.sleep(20)
            continue
        if network:
            raise ConnectionError(out[:300])
        if "rate limit" in low or "abuse" in low or "was submitted too quickly" in low or "429" in low:
            print(f"  ... giới hạn tốc độ, chờ {wait}s (lần {attempt + 1})", flush=True)
            time.sleep(wait)
            wait = min(wait * 2, 900)
            continue
        raise RuntimeError(f"gh {' '.join(args[:3])} lỗi: {out[:800]}")
    raise RuntimeError("hết số lần thử lại vì giới hạn tốc độ")


def graphql(query, sub_issues=False, **vars_):
    args = ["api", "graphql", "-f", f"query={query}"]
    if sub_issues:
        args += ["-H", "GraphQL-Features: sub_issues"]
    for k, v in vars_.items():
        args += (["-F", f"{k}={v}"] if isinstance(v, (int, float)) else ["-f", f"{k}={v}"])
    return gh(args)["data"]


def load_config():
    return json.load(open(CONFIG, encoding="utf-8")) if os.path.exists(CONFIG) else {}


def save_config(c):
    json.dump(c, open(CONFIG, "w", encoding="utf-8"), ensure_ascii=False, indent=2)


def load_map():
    if not os.path.exists(MAP):
        return {}
    return {r["id"]: r for r in csv.DictReader(open(MAP, encoding="utf-8", newline=""))}


def save_map(m):
    with open(MAP, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=MAP_FIELDS)
        w.writeheader()
        for k in sorted(m, key=lambda x: int(m[x]["number"] or 0)):
            w.writerow({f: m[k].get(f, "") for f in MAP_FIELDS})
