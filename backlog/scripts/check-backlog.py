"""Kiểm backlog/backlog.yaml: ID, tham chiếu, giờ, nhãn, tiêu đề, 承認, ràng buộc 完納奨励金, độ phủ spec.

Chạy từ gốc repo:  python backlog/scripts/check-backlog.py [--counts] [--file <backlog.yaml khác, để thử mẫu sai>]
Thoát mã 1 nếu có lỗi. Cảnh báo (WARN) không làm hỏng lần chạy.
"""
import collections
import glob
import os
import re
import sys
import yaml

sys.stdout.reconfigure(encoding="utf-8")  # console Windows (cp1252) không in được tiếng Việt / Nhật

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = sys.argv[sys.argv.index("--file") + 1] if "--file" in sys.argv else os.path.join(ROOT, "backlog", "backlog.yaml")
d = yaml.safe_load(open(SRC, encoding="utf-8"))
iss, eps = d["issues"], {e["id"]: e for e in d["epics"]}
by = {i["id"]: i for i in iss}
err, warn = [], []
E = lambda *a: err.append(" ".join(map(str, a)))
kids = collections.defaultdict(list)
for i in iss:
    if i["parent"]:
        kids[i["parent"]].append(i)

RULES = {"rule:aitai-main", "rule:permit-vs-approval", "rule:human-decision", "rule:no-overwrite", "rule:versioned-rule"}
FEAT = {"party", "lot", "trade", "delivery", "settle", "incentive", "rule", "iam", "report", "notify", "audit", "ops",
        "migrate", "platform", "test"}
HOURS = {"dev": (4, 16), "test": (4, 16), "design": (4, 16), "rough": (2, 10 ** 4), "clarify": (1, 4)}  # thô: đơn vị tự nhiên, không trần (L5-D08)
RANK = lambda p: int(p[1])
INTERNAL_APPROVAL = re.compile(r"[12]次承認|承認待ち|承認者|規則版承認|社内の?承認|承認権限|承認フロー")
OK_CTX = ("売買参加者", "許可", "参加上限", "approval", "承認ライフサイクル", "承認申請", "承認ブロック", "承認登録", "資格", "vòng đời 承認", "テスト 承認", "không dùng", "không có chữ", "L4-D03", "luật 2", "yêu cầu 承認", "với 承認")

if len(by) != len(iss):
    E("trùng ID", [k for k, v in collections.Counter(i["id"] for i in iss).items() if v > 1])
for i in iss:
    x = i["id"]
    if not re.fullmatch(r"[ABC]-(FG\d\d|PLAT|TEST|CLR)-\d\d(\.\d+)?", x):
        E("ID sai dạng", x)
    if i["epic"] not in eps:
        E("epic không có", x, i["epic"])
    p = by.get(i["parent"]) if i["parent"] else None
    if i["parent"] and (not p or p["parent"] or p["epic"] != i["epic"]):
        E("parent sai (thiếu / quá 2 cấp / khác epic)", x, i["parent"])
    for y in i["depends_on"]:
        if y not in by or y == x:
            E("depends_on sai", x, y)
    lab = set(i["labels"])
    for l in lab:
        ok = (l in RULES or l == "needs-spec" or l == "constraint:完納奨励金" or re.fullmatch(r"fg:FG-\d\d", l)
              or l.split(":")[0] in ("kind", "role") or (l.startswith("feature:") and l[8:] in FEAT))
        if not ok:
            E("nhãn ngoài danh sách", x, l)
    if f"kind:{i['kind']}" not in lab or f"role:{i['role']}" not in lab:
        E("nhãn kind/role lệch trường", x)
    if (i["kind"] == "rough") != ("needs-spec" in lab):
        E("needs-spec chỉ và luôn cho rough", x)
    if i["epic"].startswith("EP-FG") and f"fg:FG-{i['epic'][5:]}" not in lab:
        E("thiếu nhãn fg của epic", x)
    inc = "constraint:完納奨励金" in lab
    if i["epic"] == "EP-FG09" and not inc:
        E("FG-09 thiếu nhãn constraint:完納奨励金", x)
    if inc and i["epic"] not in ("EP-FG09", "EP-CLAR"):
        E("nhãn constraint:完納奨励金 ngoài FG-09 / CLAR", x)
    t = i["title"]
    if len(t) > 80:
        E("tiêu đề > 80", x, len(t))
    pre = "[要確認]" if i["kind"] == "clarify" else None
    if not re.match(r"^\[(FG-\d\d|PLAT|TEST|要確認)\]", t) or (pre and not t.startswith(pre)):
        E("tiền tố tiêu đề", x)
    if i["kind"] == "rough" and ("[概算]" not in t or re.search(r"\(\d+/\d+ ", t)):
        E("rough thiếu [概算] hoặc còn tách theo khuôn tầng", x)
    if i["kind"] == "design" and "[設計]" not in t:
        E("design thiếu [設計]", x)
    if not i["rfp_refs"]:
        E("rfp_refs rỗng", x)
    if not re.fullmatch(r"(BE|FE|QA|INFRA|BrSE)-\d", i["assignee"] or ""):
        E("assignee", x, i["assignee"])
    if i["priority"] not in ("P1", "P2", "P3", "P4"):
        E("priority", x)
    text = " ".join([t, i["description"] or ""] + list(i["dod"]))
    if INTERNAL_APPROVAL.search(text):
        E("承認 dùng cho duyệt nội bộ", x, INTERNAL_APPROVAL.search(text).group(0))
    for m in re.finditer("承認", text):
        win = text[max(0, m.start() - 30): m.end() + 30]
        if not any(c in win for c in OK_CTX):
            warn.append(f"承認 cần xem tay: {x}: …{win}…")
    h = i["hours_hint"]
    if x in kids:
        s = sum(k["hours_hint"] for k in kids[x])
        if h != s:
            E("giờ cha ≠ tổng con", x, h, s)
    elif not HOURS[i["kind"]][0] <= h <= HOURS[i["kind"]][1]:
        E("giờ lá ngoài khoảng", x, i["kind"], h)

# tiêu đề GitHub tiếng Anh: [PREFIX][màn / function][vai] English title (người dùng chốt 2026-11-26)
pre_of = lambda ep: "CLAR" if ep == "EP-CLAR" else ("FG-" + ep[5:] if ep.startswith("EP-FG") else ep[3:])
if any(i.get("title_en") for i in iss):
    seen = collections.Counter()
    for x in iss + d["epics"]:
        t, is_ep = x.get("title_en"), x["id"].startswith("EP-")
        p_ = pre_of(x["id"] if is_ep else x["epic"])
        rx = rf"^\[{re.escape(p_)}\]\[EPIC\] \S" if is_ep else rf"^\[{re.escape(p_)}\]\[[A-Za-z0-9.+_-]+\]\[{x['role']}\] \S"
        if not t or not re.match(rx, t) or len(t) > 100 or re.search(r"[^\x20-\x7e–—]", t):
            E("title_en sai dạng / không phải tiếng Anh", x["id"], t)
        seen[t] += 1
        if not is_ep and "決裁" in (x["title"] or "") and "承認" not in (x["title"] or "") and "approval" in (t or "").lower():
            E("決裁 dịch thành approval (luật 2)", x["id"])
    dup = [t for t, n in seen.items() if n > 1]
    if dup:
        E("title_en trùng", dup[:5])

# chu trình phụ thuộc
state = {}
def visit(n, path):
    state[n] = 1
    for m in by[n]["depends_on"]:
        if state.get(m) == 1:
            E("chu trình phụ thuộc", " → ".join(path + [m]))
        elif m in by and not state.get(m):
            visit(m, path + [m])
    state[n] = 2
for n in by:
    if not state.get(n):
        visit(n, [n])

# ưu tiên không ngược chiều phụ thuộc (issue được phụ thuộc phải ưu tiên ≥ issue phụ thuộc nó)
for i in iss:
    for y in i["depends_on"]:
        if y in by and RANK(by[y]["priority"]) > RANK(i["priority"]):
            E("ưu tiên ngược phụ thuộc", f"{x if False else i['id']} ({i['priority']}) → {y} ({by[y]['priority']})")

# issue thô phải chờ một issue thiết kế (rolling-wave)
for i in iss:
    if i["kind"] == "rough" and i["id"] not in kids:
        src = i["depends_on"] + (by[i["parent"]]["depends_on"] if i["parent"] else [])
        if not any(by[y]["kind"] == "design" for y in src if y in by):
            E("issue thô không chờ issue thiết kế nào", i["id"])

# Iteration 1: phụ thuộc không ra ngoài (trừ S0 nền tảng, thiết kế 第1波, câu hỏi khách); năng lực
IT = d["iteration1"]["name"]
outside_ok = lambda j: (j["epic"] == "EP-PLAT" or j["id"] in d["iteration1"]["outside_ok_clarify"]
                        or (j["kind"] == "design" and (j.get("milestone") or "").startswith("設計第1波")))
for i in iss:
    if i["iteration"] != IT:
        continue
    for y in i["depends_on"]:
        j = by.get(y)
        if j and j["iteration"] != IT and not outside_ok(j) and not (y in kids and all(by[k]["iteration"] == IT for k in kids[y])):
            E("Iteration 1 phụ thuộc issue ngoài Iteration 1", i["id"], "→", y)
cap = d["iteration1"]["per_person_hours"]
load = collections.Counter()
for i in iss:
    if i["iteration"] == IT and i["id"] not in kids:
        load[i["assignee"]] += i["hours_hint"]
for p, h in load.items():
    if h > cap:
        E("người phụ trách vượt năng lực Iteration 1", p, h, ">", cap)
    if not any(p in t for t in d["iteration1"]["roster"].values()):
        E("người phụ trách ngoài roster S1", p)

# 完納奨励金: K1..K9 và TV-01..15
fg9 = [i for i in iss if i["epic"] == "EP-FG09"]
for k in range(1, 10):
    if not any(re.search(rf"\bK{k}\b", i["title"]) for i in fg9):
        E("không có issue cho khối", f"K{k}")
tv = set()
for i in fg9:
    if i["kind"] != "test":
        continue
    s = " ".join([i["title"], i["description"]] + i["dod"])  # không tính spec_refs: dải TV-01..15 ở đó không chứng minh có kịch bản
    for m in re.finditer(r"TV-(\d\d)((?:\s*(?:,|/|\.\.|–)\s*(?:TV-)?\d\d\b)*)", s):
        nums = [int(m.group(1))] + [int(n) for n in re.findall(r"\d\d", m.group(2))]
        rng = re.search(r"(\.\.|–)", m.group(2) or "")
        tv |= set(range(nums[0], nums[-1] + 1)) if rng and len(nums) == 2 else set(nums)
miss = sorted(set(range(1, 16)) - tv)
if miss:
    E("TV chưa có issue test FG-09", miss)

# Iteration 1 và điều kiện dùng thử S1
for ac in d["iteration1"]["acceptance"]:
    if not ac["issues"]:
        E("AC không có issue", ac["id"])
    if ac.get("screen") and not any(by[x]["role"] == "FE" and by[x]["kind"] == "dev" and by[x]["iteration"] == d["iteration1"]["name"]
                                    for x in ac["issues"] if x in by):
        E("AC cần thao tác trên màn nhưng không có màn FE nào trong Iteration 1", ac["id"])
    for x in ac["issues"]:
        if x not in by or (by[x]["kind"] not in ("design", "clarify") and by[x]["iteration"] != d["iteration1"]["name"]):
            E("issue của AC không thuộc Iteration 1", ac["id"], x)

# chỗ hở, phần chưa thành issue
pmv = set(d["premise_map"].values())
for g in d["gaps"]:
    h, r = g["handling"], g.get("ref")
    if h not in ("fix-design", "assumption", "clarify", "open"):
        E("gap handling", g["id"])
    if h in ("fix-design", "assumption") and r not in pmv or h == "clarify" and r not in by or h == "open" and not g.get("open_reason"):
        E("gap ref", g["id"], h, r)
for n in d["not_issued"]:
    for x in n["covered_by"]:
        if x not in by:
            E("not_issued trỏ issue không có", x)
    if not n["covered_by"] and (not re.search(r"第2期|Option|không làm|không tính|khách để sau|ngoài phạm vi", n["reason"])
                                or re.search(r"tạo issue|nối khi gộp|sẽ làm", n["reason"])):
        E("not_issued không có issue mà lý do là việc chưa làm", n["spec"][:60])
for txt in [n["reason"] for n in d["not_issued"]] + [g["problem"] for g in d["gaps"]]:
    if re.search(r"luồng [ABC]\b|PL nối", txt):
        E("chữ nội bộ (luồng / PL nối) trong bảng nộp", txt[:60])

# độ phủ spec LAB-4: mỗi SPEC / FUNC / TECH / API / DB phải có ở spec_refs hoặc not_issued
def rng_ids(s):
    out = set(re.findall(r"API-[A-Z]+-\d{3}", s))
    for pre, a, b in re.findall(r"(API-[A-Z]+-)(\d{3})\s*(?:\.\.|–)\s*(\d{3})", s):
        out |= {f"{pre}{n:03d}" for n in range(int(a), int(b) + 1)}
    return out
refs = " ".join(r for i in iss for r in i["spec_refs"] + [i["title"]]) + " " + " ".join(n["spec"] for n in d["not_issued"])
want = set()
for f in glob.glob(os.path.join(ROOT, "specs", "**", "*.md"), recursive=True):
    b = os.path.basename(f)[:-3]
    if "_templates" in f or b in ("_index", "README"):
        continue
    if b.endswith(("_SPEC", "_FUNC", "_TECH", "_DB")) or b.startswith("API-"):
        want.add(b.replace("_API", "").replace("_SPEC", "").replace("_TECH", ""))
apis = rng_ids(refs)
print("spec LAB-4 cần phủ:", len(want)) if "--counts" in sys.argv else None
uncovered = sorted(w for w in want if (w not in apis) if w not in refs)
if uncovered:
    E("spec LAB-4 chưa có ở issue / not_issued", uncovered)

for w in warn:
    print("WARN", w)
for e in err:
    print("ERR ", e)
if "--counts" in sys.argv or not err:
    c = collections.OrderedDict((e, [0, 0, 0, 0]) for e in eps)
    for i in iss:
        r = c[i["epic"]]
        r[1 if i["parent"] else 0] += 1
        if i["id"] not in kids:
            r[2] += 1
            r[3] += i["hours_hint"]
    print("epic  level1  sub  leaves  leaf_hours")
    for e, r in c.items():
        print(e, *r)
    lv = [i for i in iss if i["id"] not in kids]
    print("TOTAL", sum(r[0] for r in c.values()), sum(r[1] for r in c.values()), len(lv), sum(i["hours_hint"] for i in lv))
    print("kinds(leaf)", dict(collections.Counter(i["kind"] for i in lv)))
    it = [i for i in lv if i["iteration"]]
    print("Iteration 1 leaves", len(it), "hours", sum(i["hours_hint"] for i in it))
print(f"errors={len(err)} warnings={len(warn)}")
sys.exit(1 if err else 0)
