"""P2 bước 1: tạo GitHub Project (user-owned, PRIVATE), các field và nhãn của backlog. Chạy lại được (bỏ qua cái đã có).

    python -X utf8 backlog/scripts/setup-github-project.py

Field: Status (Todo · In Progress · In Review · Blocked · Done), Priority (P1–P4), Iteration (Iteration 1..8 theo
sprint S1..S8 của WBS LAB-1), Point (SWP — trống tới P3), Hours (trống tới P3: Hours = SWP × k, plan §4),
「Người phụ trách (giả định)」 (text), 「Đợt / mốc」 (đợt thiết kế 第1–4波, mốc S4). Ghi ID vào backlog/github-project-config.json.
"""
import importlib.util
import os
import yaml

spec = importlib.util.spec_from_file_location("gh_helpers", os.path.join(os.path.dirname(__file__), "github-api-helpers.py"))
H = importlib.util.module_from_spec(spec)
spec.loader.exec_module(H)

TITLE = "Product A — 桜水産市場 LAB-5 backlog"
SPRINTS = ["2027-02-01", "2027-02-15", "2027-03-01", "2027-03-15", "2027-03-29", "2027-04-12", "2027-04-26", "2027-05-10"]
STATUS = [("Todo", "GRAY"), ("In Progress", "YELLOW"), ("In Review", "BLUE"), ("Blocked", "RED"), ("Done", "GREEN")]
PRIO = [("P1", "RED"), ("P2", "ORANGE"), ("P3", "YELLOW"), ("P4", "GRAY")]
COLORS = {"epic": "5319e7", "fg": "c5def5", "feature": "bfdadc", "kind": "d4c5f9", "role": "fef2c0", "rule": "f9d0c4",
          "constraint": "b60205", "needs-spec": "e4e669"}

cfg = H.load_config()
doc = yaml.safe_load(open(os.path.join(H.ROOT, "backlog", "backlog.yaml"), encoding="utf-8"))

# Nhãn
labels = sorted({l for i in doc["issues"] for l in i["labels"]} | {l for e in doc["epics"] for l in e["labels"]} | {"epic"})
for l in labels:
    H.gh(["label", "create", l, "--repo", f"{H.OWNER}/{H.REPO}", "--force", "--color", COLORS.get(l.split(":")[0], "ededed")])
print("labels", len(labels))

# Project
if "project_id" not in cfg:
    owner = H.graphql("query{viewer{id}}")["viewer"]["id"]
    p = H.graphql("mutation($o:ID!,$t:String!){createProjectV2(input:{ownerId:$o,title:$t}){projectV2{id number url}}}",
                  o=owner, t=TITLE)["createProjectV2"]["projectV2"]
    cfg.update(project_id=p["id"], project_number=p["number"], project_url=p["url"], fields={})
    H.save_config(cfg)
pid = cfg["project_id"]
print("project", cfg["project_url"])


def existing_fields():
    q = """query($p:ID!){node(id:$p){... on ProjectV2{fields(first:50){nodes{
      ... on ProjectV2FieldCommon{id name dataType}
      ... on ProjectV2SingleSelectField{options{id name}}
      ... on ProjectV2IterationField{configuration{iterations{id title startDate}}}}}}}}"""
    return {f["name"]: f for f in H.graphql(q, p=pid)["node"]["fields"]["nodes"] if f}


def opts(pairs):
    return "[" + ",".join(f'{{name:"{n}",color:{c},description:""}}' for n, c in pairs) + "]"


F = existing_fields()
# Status: thay bộ lựa chọn mặc định
if set(o["name"] for o in F["Status"]["options"]) != {n for n, _ in STATUS}:
    H.graphql(f'mutation($f:ID!){{updateProjectV2Field(input:{{fieldId:$f,singleSelectOptions:{opts(STATUS)}}}){{projectV2Field{{... on ProjectV2SingleSelectField{{id}}}}}}}}',
              f=F["Status"]["id"])
mil = list(dict.fromkeys(m for m in (i.get("milestone") for i in doc["issues"]) if m))
for name, kind, extra in [("Priority", "SINGLE_SELECT", f"singleSelectOptions:{opts(PRIO)}"),
                          ("Đợt / mốc", "SINGLE_SELECT", f"singleSelectOptions:{opts([(m, 'PURPLE') for m in mil])}"),
                          ("Point", "NUMBER", ""), ("Hours", "NUMBER", ""), ("Người phụ trách (giả định)", "TEXT", ""),
                          ("Iteration", "ITERATION",
                           'iterationConfiguration:{startDate:"2027-02-01",duration:14,iterations:['
                           + ",".join(f'{{title:"Iteration {n}",startDate:"{d}",duration:14}}' for n, d in enumerate(SPRINTS, 1)) + "]}")]:
    if name in F:
        continue
    q = (f'mutation($p:ID!,$n:String!){{createProjectV2Field(input:{{projectId:$p,dataType:{kind},name:$n'
         + (f",{extra}" if extra else "") + "}){projectV2Field{... on ProjectV2FieldCommon{id}}}}")
    H.graphql(q, p=pid, n=name)
    print("field", name)

F = existing_fields()
cfg["fields"] = {n: {"id": f["id"], "options": {o["name"]: o["id"] for o in f.get("options", [])},
                     "iterations": {it["title"]: it["id"] for it in (f.get("configuration") or {}).get("iterations", [])}}
                 for n, f in F.items()}
H.save_config(cfg)
print({n: (len(v["options"]) or len(v["iterations"]) or "") for n, v in cfg["fields"].items()})
