"""P4: đọc nhật ký giả lập theo ngày của một Iteration (progress/iteration-1-daily.csv), kiểm tính nhất quán, dựng trạng thái
cuối mỗi ngày. Dùng chung cho render-iteration-burndown.py, set-iteration-status-on-project.py, verify-github-project.py.

Nhật ký chỉ ghi khi có thay đổi (event=status) hoặc việc ngoài issue (unplanned / reserve / external). Cột hours = giờ làm thật
cho issue kể từ dòng trước của chính issue đó. Tập cam kết = lá có iteration "Iteration 1" trong backlog/estimate-swp-hours.csv.

    python -X utf8 backlog/scripts/iteration-daily-log.py      # kiểm + in tóm tắt (exit 1 nếu lỗi)
"""
import csv
import datetime as dt
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOG = os.path.join(ROOT, "progress", "iteration-1-daily.csv")
EST = os.path.join(ROOT, "backlog", "estimate-swp-hours.csv")
ITERATION = "Iteration 1"
START, END = dt.date(2027, 2, 1), dt.date(2027, 2, 12)
STATUSES = ["Todo", "In Progress", "In Review", "Blocked", "Done"]
# chuyển trạng thái hợp lệ (Done là cuối; Blocked từ Todo / In Progress, gỡ chặn thì về In Progress)
NEXT = {"Todo": {"In Progress", "Blocked"}, "In Progress": {"In Review", "Blocked"}, "Blocked": {"In Progress"},
        "In Review": {"Done", "In Progress"}, "Done": set()}


def workdays():
    d, out = START, []
    while d <= END:
        if d.weekday() < 5:
            out.append(d.isoformat())
        d += dt.timedelta(days=1)
    return out


def load_estimate():
    return list(csv.DictReader(open(EST, encoding="utf-8")))


def committed(rows=None):
    """id → dòng estimate của các lá thuộc Iteration 1 (đơn vị đếm burndown)."""
    rows = rows or load_estimate()
    return {r["id"]: r for r in rows if r["iteration"] == ITERATION and r["level"] == "leaf"}


def parents_in_iteration(rows=None):
    rows = rows or load_estimate()
    return {r["id"]: r for r in rows if r["iteration"] == ITERATION and r["level"] != "leaf"}


def load_log(path=LOG):
    return list(csv.DictReader(open(path, encoding="utf-8")))


def daily_status(log, leaves):
    """{ngày: {id: trạng thái cuối ngày}} cho mọi lá cam kết (chưa có dòng nào = Todo)."""
    cur = {x: "Todo" for x in leaves}
    out = {}
    by_day = {}
    for r in log:
        if r["event"] == "status":
            by_day.setdefault(r["date"], []).append(r)
    for d in workdays():
        for r in by_day.get(d, []):
            cur[r["backlog_id"]] = r["status"]
        out[d] = dict(cur)
    return out


def final_status(log=None, leaves=None, rows=None):
    """id → trạng thái cuối sprint; gồm cả issue cha (Done khi mọi con Done, Todo khi chưa con nào bắt đầu, còn lại In Progress)."""
    rows = rows or load_estimate()
    leaves = leaves or committed(rows)
    last = daily_status(log if log is not None else load_log(), leaves)[workdays()[-1]]
    for pid in parents_in_iteration(rows):
        kids = [last[r["id"]] for r in rows if r["parent_id"] == pid and r["id"] in last]
        last[pid] = "Done" if kids and all(k == "Done" for k in kids) else "Todo" if all(k == "Todo" for k in kids) else "In Progress"
    return last


def validate(log, leaves, deps):
    """Lỗi: ngày ngoài sprint / cuối tuần, issue ngoài tập cam kết, số issue sai, chuyển trạng thái sai, Done trước phụ thuộc."""
    err, days = [], set(workdays())
    cur = {x: "Todo" for x in leaves}
    done_day = {}
    for n, r in enumerate(log, 2):
        if r["date"] not in days:
            err.append(f"dòng {n}: ngày {r['date']} không phải ngày làm của sprint")
        if r["event"] not in ("status", "unplanned", "reserve", "external"):
            err.append(f"dòng {n}: event lạ {r['event']}")
        if r["event"] != "status":
            continue
        x = r["backlog_id"]
        if x not in leaves:
            err.append(f"dòng {n}: {x} không thuộc tập cam kết {ITERATION}")
            continue
        if r["issue"] != leaves[x]["number"]:
            err.append(f"dòng {n}: #{r['issue']} ≠ #{leaves[x]['number']} ({x})")
        s = r["status"]
        if s not in STATUSES:
            err.append(f"dòng {n}: trạng thái lạ {s}")
        elif s != cur[x] and s not in NEXT[cur[x]]:
            err.append(f"dòng {n}: {x} {cur[x]} → {s} không hợp lệ")
        cur[x] = s
        if s == "Done":
            done_day[x] = r["date"]
    for x, d in done_day.items():
        for p in deps.get(x, []):
            if p in leaves and (p not in done_day or done_day[p] > d):
                err.append(f"{x} Done {d} trước phụ thuộc {p} ({done_day.get(p, 'chưa Done')})")
    return err


def load_deps():
    import yaml  # chỉ cần khi kiểm
    b = yaml.safe_load(open(os.path.join(ROOT, "backlog", "backlog.yaml"), encoding="utf-8"))
    return {i["id"]: i.get("depends_on") or [] for i in b["issues"]}


def hours_by(log, key):
    out = {}
    for r in log:
        if r["hours"]:
            out[r[key]] = out.get(r[key], 0) + float(r["hours"])
    return out


def main():
    rows = load_estimate()
    leaves = committed(rows)
    log = load_log()
    err = validate(log, leaves, load_deps())
    fin = final_status(log, leaves, rows)
    swp = sum(float(r["swp_final"]) for r in leaves.values())
    hrs = sum(float(r["hours"]) for r in leaves.values())
    print(f"cam kết: {len(leaves)} lá / {swp:g} SWP / {hrs:g} giờ; cha trong Iteration: {sorted(parents_in_iteration(rows))}")
    for s in STATUSES:
        ids = [x for x in leaves if fin[x] == s]
        print(f"  {s:12} {len(ids):3} lá  {sum(float(leaves[x]['swp_final']) for x in ids):5g} SWP  "
              f"{sum(float(leaves[x]['hours']) for x in ids):6g} giờ")
    by_issue = {r["backlog_id"]: 0.0 for r in log if r["event"] == "status"}
    for r in log:
        if r["event"] == "status" and r["hours"]:
            by_issue[r["backlog_id"]] += float(r["hours"])
    extra = sum(float(r["hours"]) for r in log if r["event"] in ("unplanned", "reserve") and r["hours"])
    print(f"giờ thật trên issue cam kết: {sum(by_issue.values()):g}; ngoài issue (unplanned + reserve): {extra:g}")
    for e in err:
        print("ERR", e)
    print(f"errors={len(err)}")
    sys.exit(1 if err else 0)


if __name__ == "__main__":
    main()
