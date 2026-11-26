"""Dựng backlog/backlog.yaml từ đầu vào P1 + các quyết định của PL. Chạy từ gốc repo:

    python -X utf8 backlog/scripts/build-backlog.py
    python -X utf8 backlog/scripts/check-backlog.py --counts
    python -X utf8 backlog/scripts/render-task-breakdown-tables.py

Bước: merge-stream-backlogs (gộp 3 luồng, p1-merge-decisions.yaml) → apply-gate-a-decisions (sửa theo Expert Gate A,
gate-a-decisions.yaml) → plan-priority-and-iteration (ưu tiên lan theo phụ thuộc, Iteration 1 trong năng lực).
"""
import importlib.util
import os
import yaml

HERE = os.path.dirname(os.path.abspath(__file__))


def mod(name):
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), os.path.join(HERE, name + ".py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


FIELDS = ["id", "epic", "parent", "kind", "priority", "iteration", "milestone", "acceptance", "title", "title_en", "role", "assignee",
          "labels", "spec_refs", "rfp_refs", "depends_on", "depends_on_spec", "hours_hint", "stream", "description", "dod"]

doc = mod("merge-stream-backlogs").merge()
mod("apply-gate-a-decisions").apply(doc)
res = mod("plan-priority-and-iteration").plan(doc)
# Tiêu đề issue trên GitHub: tiếng Anh theo dạng [PREFIX][màn / function][vai] (người dùng chốt 2026-11-26); `title` tiếng Việt giữ cho tài liệu
TEN = os.path.join(HERE, "issue-titles-en.yaml")
EN = yaml.safe_load(open(TEN, encoding="utf-8")) if os.path.exists(TEN) else {}
for x in doc["issues"] + doc["epics"]:
    x["title_en"] = EN.get(x["id"])
out = dict(
    meta=dict(generated_by="backlog/scripts/build-backlog.py",
              sources=["backlog/p1-streams/{a,b,c}-backlog.yaml", "backlog/scripts/p1-merge-decisions.yaml",
                       "backlog/scripts/gate-a-decisions.yaml"],
              note="Nguồn chuẩn của backlog LAB-5; dựng lại bằng build-backlog.py, không sửa tay."),
    iteration1=doc["iteration1"], constraint_note=doc["constraint_note"], epics=doc["epics"],
    issues=[{f: i.get(f) for f in FIELDS} for i in doc["issues"]],
    gaps=doc["gaps"], not_issued=doc["not_issued"], premise_map=doc["premise_map"])
with open(os.path.join(os.path.dirname(HERE), "backlog.yaml"), "w", encoding="utf-8", newline="\n") as f:
    yaml.safe_dump(out, f, allow_unicode=True, sort_keys=False, width=200)
it = doc["iteration1"]
print(f"issues={len(doc['issues'])} level1={sum(1 for i in doc['issues'] if not i['parent'])} "
      f"sub={sum(1 for i in doc['issues'] if i['parent'])} priority_raised={len(res['raised'])} "
      f"iteration1: {it['committed_leaves']} lá / {it['committed_hours']} giờ, cap {it['capacity_by_role']}, "
      f"load {it['committed_hours_by_role']}, unmet_AC={res['unmet']}")
