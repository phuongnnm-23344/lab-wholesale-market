 > **LAB-2 prototype (Product A — 桜水産市場, dữ liệu giả):** xem [`prototype/README.md`](prototype/README.md).
> App: https://lab-wholesale-market-fup2.vercel.app/ · tài khoản demo, mật khẩu, kịch bản demo đều ở README đó.
> Ngay dưới là điều hướng bộ thiết kế LAB-4; từ mục "GitHub Project Management Template" trở xuống là README của template quản lý dự án Sun* mà repo được dựng từ đó.

# Product A — 桜水産市場: tài liệu thiết kế LAB-4 (nhánh `ver/lab-4`)

Repo này giữ hai thứ của dự án luyện tập Product A (hệ thống hỗ trợ vận hành chợ bán buôn thủy sản 株式会社 桜水産市場 — khách hàng, số liệu, dữ liệu đều hư cấu):

- **Prototype LAB-2** chạy thật ở `prototype/` (không sửa trong LAB-4).
- **Bộ thiết kế LAB-4** (requirement, spec, kiến trúc, ADR, wireframe) theo chuẩn công ty [`sun-asterisk-internal/spec-standards`](https://github.com/sun-asterisk-internal/spec-standards) — QC-01 *Quy chuẩn Cấu trúc Thư mục Spec trên GitHub* (`0.32.1`).

Đọc theo thứ tự: **`PREMISE.md` → `architecture/` → `wireframes/` → `specs/`**. Bộ thiết kế này là input để break task ở LAB-5.

## 1. Bảng điều hướng

| Nhóm / file | Chứa gì | Template | Kế thừa / mới | Người viết | Bảng tra |
|---|---|---|---|---|---|
| [`PREMISE.md`](PREMISE.md) | Tiền đề của LAB-4: thêm/bỏ so với LAB-1, giả định mới, hướng đi đã chốt, cách xử lý chỗ prototype làm khác | Frontmatter + History theo quy ước chuẩn | **Mới** (yêu cầu đề) | PL | — |
| [`requirements/`](requirements/) | **WHAT** — tài liệu yêu cầu `REQ-{số Story}-{slug}.md` | `BM-2-901-63` | Kế thừa | BrSE / PL | [`requirements/_index.md`](requirements/_index.md) |
| [`specs/`](specs/) | **HOW** — Screen Specification · Function Specifications · Technical Design trong `specs/{feature}/`; Database Design · API Design trong `specs/system-design/`; tài liệu dùng chung trong `specs/_common/` | `BM-2-901-50` … `BM-2-901-54` | Kế thừa | PL (BrSE, Tech Lead, Dev) | [`specs/_index.md`](specs/_index.md) |
| [`architecture/`](architecture/) | Kiến trúc to-be: thành phần hệ thống, luồng dữ liệu chính, điểm tích hợp | Không có trong chuẩn | **Mới** (yêu cầu đề) | PL (Tech Lead) | [`architecture/_index.md`](architecture/_index.md) |
| [`architecture/adr/`](architecture/adr/) | ADR: bối cảnh · quyết định · phương án đã bỏ · hệ quả | Không có trong chuẩn | **Mới** (yêu cầu đề) | PL (Tech Lead) | [`architecture/adr/_index.md`](architecture/adr/_index.md) |
| [`wireframes/`](wireframes/) | 画面一覧 / 画面遷移 (70 màn 第1期), wireframe to-be cho 10 màn cốt lõi + 5 màn bổ sung; Screen Specification đầy đủ cho **12 màn** (10 màn đại diện + 2 màn nối của delivery — PREMISE L4-D07) | Không có trong chuẩn | **Mới** (yêu cầu đề) | PL | [`wireframes/_index.md`](wireframes/_index.md) |
| `AI-report.md` | Cách dùng AI trong LAB-4: skill, prompt, cách review, lỗi AI và cách sửa | — | **Mới** (yêu cầu đề) | PL | *(viết ở P4)* |
| [`prototype/`](prototype/) | Code prototype LAB-2 (Next.js + Supabase), README demo | — | Có từ LAB-2 | PL | [`prototype/README.md`](prototype/README.md) |

Nhóm thư mục mức repo khác (`.github/`, `docs/`, `webhook/`, các script `*.sh` trong `scripts/`) là phần của template quản lý dự án Sun*; script của bộ thiết kế LAB-4 ở mục 5 — xem từ mục "GitHub Project Management Template" trở xuống.

## 2. Quy ước của dự án theo QC-01

| Điểm QC-01 để dự án chọn | Dự án chọn |
|---|---|
| Kiểu tên nhánh version (§2) | Theo **milestone / phase** của khóa học: `ver/lab-4`, `ver/lab-5`, … — không trộn kiểu version sản phẩm |
| Chia `specs/{screen-or-feature}/` (§2 ghi chú) | Theo **feature** (cụm nghiệp vụ, kebab-case tiếng Anh), trùng tên module ở `architecture/ARCHITECTURE.md` §2. Danh sách feature và feature của 12 màn có Screen Specification (10 màn đại diện + SC-06-04, SC-06-05 — PREMISE L4-D07) đã chốt ở [`specs/_index.md`](specs/_index.md) (Gate 1 m-03) |
| Screen ID | Giữ ID màn hình của LAB-1 (`SC-xx-yy`) để truy được về 画面一覧 LAB-1 và prototype LAB-2; tên file `SC-xx-yy_SPEC.md`. *Lệch quy tắc §4 (`{tiền tố}_{TÊN}` viết HOA) — xem §3* |
| Nguồn khuôn `_templates/` | `spec-standards` nhánh `main`, commit `72c1dda` (2026-11-05). Hai thư mục `_templates/` copy cùng một lượt |

## 3. Ngoại lệ có chủ đích so với QC-01

| # | Quy định QC-01 | Dự án làm | Lý do |
|---|---|---|---|
| 1 | §1: spec nằm trong Management Repository riêng, **không** để trong repo code | Spec đặt chung repo với `prototype/` | Bài lab: một repo để reviewer xem prototype và thiết kế cạnh nhau, đối chiếu thiết kế với bảng dữ liệu thật của LAB-2. Dự án thật sẽ tách hai repo, trỏ nhau qua README |
| 2 | §2: chỉ có `requirements/`, `specs/` là nhóm chuẩn | Thêm `architecture/`, `wireframes/` và hai file `PREMISE.md`, `AI-report.md` ở gốc | §1 cho phép thêm nhóm cùng cấp nếu có dòng trong README; đề LAB-4 yêu cầu các nhóm này |
| 3 | §2: viết trên nhánh `ver/{tên}` mở từ `main`, merge lên `main` khi release | Nhánh `ver/lab-4` mở từ `main` (bản LAB-2 `0a99d10`), merge lên `main` lúc nộp LAB-4 | Đúng quy tắc; "release" ở đây là lúc nộp bài |
| 4 | §4: Screen ID dạng `{tiền tố}_{TÊN}` | Giữ `SC-xx-yy` | Truy vết LAB-1 → LAB-2 → LAB-4 → task LAB-5 bằng một ID |
| 5 | §2: tên bản mẫu `sample-AUTH_DB.md`, `sample-AUTH_FUNC.md`, `sample-AUTH_LOGIN_TECH.md` | Giữ tên thật trong `spec-standards/03-specs/02-samples/` (`sample-AUTH_DATABASE.md`, `sample-AUTH_FUNCTIONS.md`, `sample-AUTH_LOGIN_DETAIL.md`) | Ràng buộc 5: không sửa khuôn/bản mẫu tại chỗ. Cây ở QC-01 §2 và bộ bản mẫu thật đang lệch nhau ở repo chuẩn |
| 8 | BM-2-901-50 §4: Index và Khoá ngoại viết dạng bảng | Database Design viết Index / Khoá ngoại theo **một dòng** (mặc định) hoặc **dạng bảng như khuôn** — hai cách chứa cùng thông tin (tên index, cột, unique, điều kiện partial; FK, `ON DELETE`), cách viết ở một bảng **không mang nghĩa**. Danh sách bảng đang viết dạng bảng và cú pháp một dòng: `MKT_DB.md` §4.0 | 60 bảng, phần lớn chỉ có PK + 1–3 FK — bảng nhiều dòng làm file dài mà không thêm thông tin; các bảng viết trước khi có quy ước giữ nguyên dạng bảng, không chuyển (Gate 1 recheck n-07, D-03) |
| 6 | Bản mẫu chỉ có một cho mỗi loại | Screen Specification dùng `sample-LOGIN_SPEC.md` (bản mẫu của `BM-2-901-51`); không copy `BM-01-spec-template.md` và `sample-AD_LOGIN_SPEC.md` | Dự án dùng khuôn ISO `BM-2-901-51`; BM-01 là khuôn thứ hai cho cùng việc, chuẩn chưa chốt bỏ cái nào |
| 7 | §4, §5 ràng buộc 1: Database Design `{DB_ID}_DB.md` — **một file một nhóm bảng** | Database Design chia 9 file theo cụm (`IAM_AUDIT_DB.md`, `PARTY_DB.md`, `RULE_DB.md`, `CLOSE_DB.md`, `LOT_DB.md`, `TRADE_DB.md`, `ADJUST_DB.md`, `BILLING_DB.md`, `INCENTIVE_DB.md`) — đúng quy định; **thêm một file tổng `MKT_DB.md`** không phải một nhóm bảng: nguyên tắc chung, quy ước + enum dùng chung, ERD tổng quan, view công bố, bảng lệch to-be ↔ prototype, kết quả parity, điểm mở. Tất cả đặt ở gốc `database-design/` vì bảng của mỗi cụm được nhiều feature dùng (ràng buộc 3) | Quy ước và enum dùng chung cho cả 58 bảng — chép vào 9 file là trái DRY và dễ lệch; bảng lệch / parity là yêu cầu của đề LAB-4 cho cả schema, không thuộc cụm nào. Người dùng chốt tách file (PREMISE L4-D04) |
| 9 | BM-2-901-51 §4.1: cột `ID` theo section chữ (`A`, `B`…) và item `1.0`, tham chiếu dạng `A-2` | Cột `ID` / `No` = **số item của wireframe to-be** (`[1]`, `[2]`…); chữ `A/B/C` chỉ là nhóm hiển thị; khung chung dùng `C-xx` của `wireframes/_common-layout.md` | Truy vết một số duy nhất từ wireframe (Gate 1, khách đã góp ý theo số) → Screen Specification → ảnh annotated → issue LAB-5; đánh số lại theo khuôn sẽ làm gãy mọi tham chiếu `[n]` trong feedback và ADR |
| 10 | BM-2-901-51: không có mục phân quyền theo vai; §6 chỉ là ghi chú chung | Thêm **§4.4 Phân quyền theo vai** (bảng vai × item: hiện / ẩn / chỉ đọc / thao tác) và các mục §6.x (trạng thái, offline, câu hỏi mở) | Đề LAB-4 bắt buộc "phân quyền hiển thị theo vai" và trạng thái (rỗng, lỗi, 423, chờ duyệt, offline) cho mỗi màn; giữ nguyên các mục của khuôn, chỉ thêm mục |
| 11 | BM-2-901-51 §3: `_layout.png` xuất từ Figma / Draw.io / XD | Không có Figma; ảnh `{SCREEN_ID}_annotated.png` vẽ bằng script Pillow từ dữ liệu bố cục của wireframe to-be (mục 5), ảnh as-is của prototype để ở `wireframes/assets/` | Dự án chưa có file thiết kế; wireframe Markdown là nguồn to-be đã qua Gate 1. Ảnh dựng lại được bằng một lệnh nên số trên ảnh luôn khớp cột `No` |

Link tương đối bên trong các file bản mẫu (`../01-templates/…`) trỏ theo cấu trúc của repo chuẩn nên không mở được trong repo này — giữ nguyên theo ràng buộc 5.

## 4. Kế thừa từ spec-standards và tạo mới

*Khung — P4 điền đủ khi bộ thiết kế xong.*

| File / template | Vị trí | Kế thừa / mới | Bản nguồn | Ghi chú |
|---|---|---|---|---|
| `BM-2-901-50-database-design-template.md` + `sample-AUTH_DATABASE.md` | `specs/_templates/` | Kế thừa, giữ nguyên | `72c1dda` | |
| `BM-2-901-51-screen-specification-template.md` + `sample-LOGIN_SPEC.md` | `specs/_templates/` | Kế thừa, giữ nguyên | `72c1dda` | |
| `BM-2-901-52-api-design-template.md` + `sample-AUTH_LOGIN_API.md` | `specs/_templates/` | Kế thừa, giữ nguyên | `72c1dda` | |
| `BM-2-901-53-technical-design-template.md` + `sample-AUTH_LOGIN_DETAIL.md` | `specs/_templates/` | Kế thừa, giữ nguyên | `72c1dda` | Thay bản cũ `BM-2-901-53-detail-design-template.md` |
| `BM-2-901-54-function-specifications-template.md` + `sample-AUTH_FUNCTIONS.md` | `specs/_templates/` | Kế thừa, giữ nguyên | `72c1dda` | |
| `BM-2-901-63-requirement-document-template.md` + `sample-REQ-2609-01.md` | `requirements/_templates/` | Kế thừa, giữ nguyên | `72c1dda` | |
| `log-convention.md` | `specs/_common/` | Kế thừa, thêm mục 4 áp dụng cho dự án | `72c1dda` | |
| `api-conventions.md`, `api-list.md`, `error-codes.md` | `specs/_common/` | **Mới** — khuôn BM-2-901-52 trỏ tới ba file này nhưng repo chuẩn chưa có (ISS-36) | — | P3: body lỗi theo prototype (khác ví dụ `errors[]` của khuôn — lý do ở `api-conventions.md` quy ước 3) |
| `render-annotated-screens.py` + `annotated_screens/` | `scripts/` | Mới | — | Dựng ảnh đánh số cho Screen Specification (mục 5) |
| `check-api-spec-consistency.py` | `scripts/` | Mới | — | Kiểm API Design (mục 5) — Gate 2 G2-m01 |
| Các `_index.md` | mỗi thư mục | Kế thừa quy định QC-01 §3 | — | |
| `PREMISE.md` | gốc | Mới | — | |
| Khuôn kiến trúc, khuôn ADR | `architecture/` | Mới | — | *(P2-A)* |
| Khuôn 画面一覧 / 画面遷移 / wireframe | `wireframes/` | Mới | — | *(P2-C)* |
| `AI-report.md` | gốc | Mới | — | *(P4)* |
| Tài liệu spec theo từng feature | `specs/{feature}/`, `specs/system-design/` | Viết theo khuôn kế thừa | — | *(P2-B, P3)* |

## 5. Script của bộ thiết kế

### Script dựng ảnh annotated (Screen Specification)

Ảnh đánh số `specs/{feature}/screen-specification/assets/{SCREEN_ID}_annotated.png` được dựng từ wireframe to-be (không từ ảnh prototype). Số đỏ trên ảnh = cột ID / No ở §4.1 của Screen Specification, khớp 1-1. Wireframe đổi item thì sửa dữ liệu bố cục trong `scripts/annotated_screens/*.py` rồi chạy lại.

| Việc | Lệnh (chạy ở gốc repo) |
|---|---|
| Dựng cả 12 màn | `python scripts/render-annotated-screens.py` |
| Dựng một vài màn | `python scripts/render-annotated-screens.py SC-05-02 SC-03-05` |
| Xem danh sách màn + đường dẫn ảnh | `python scripts/render-annotated-screens.py --list` |

- Phụ thuộc: Python 3.10+, Pillow, font tiếng Nhật (Meiryo / Yu Gothic trên Windows, Hiragino trên macOS, Noto Sans CJK trên Linux) — hoặc đặt biến `ANNOT_FONT_REGULAR` / `ANNOT_FONT_BOLD` trỏ tới file font.
- Mã nguồn: `scripts/render-annotated-screens.py` (danh sách màn → thư mục feature) · `scripts/annotated_screens/` (`lot_trade.py`, `party.py`, `delivery.py`, `settle.py`, `incentive_rule.py`: dữ liệu bố cục từng màn; `box_layout.py`: hàm vẽ chung của party / delivery / settle; `common.py`: tìm font).

### Script kiểm API Design

`python scripts/check-api-spec-consistency.py` (chạy ở gốc repo; chỉ dùng thư viện chuẩn) — quét 42 file `specs/system-design/api-design/**`: JSON ví dụ trong `<pre>` parse được; token trong backtick ở cột `Note` không còn tên snake_case trừ khi là tên bảng / cột / hàm có trong Database Design hoặc FUNC / TECH; không còn khóa cũ `error_extra`; lỗi dạng `"detail": { "field": … }` (khóa trường phải ở `field` gốc). Thoát mã 1 khi có lỗi.

---

# GitHub Project Management Template

**Version 1.0** — Maintained by PEC (Process Elevation Consultant), Sun Asterisk

A standardized project management template for Sun Asterisk engineering teams, designed to replace Pherusa with GitHub Projects as the unified work tracking platform.

This repository serves as the **source template** for all new projects. When Infra bootstraps a new repository, they use this template to provision a fully configured GitHub Project board, issue templates, and workflow automations in minutes.

---

## 📖 Documentation

Full guidelines live on dedicated pages — use the one that matches your audience:

| 👤 Audience | 📚 Docs | 🔗 Link |
| :--- | :--- | :--- |
| **Internal (Sun\* members)** | Wiki — complete guidelines for company members | **[📘 GitHub Wiki](https://github.com/framgia/management_template/wiki)** |
| **External / Customer** | Public GitHub Page (EN / VI / Customer) | **[🌐 GitHub Page](https://framgia.github.io/management_template/)** |

> 💡 If you are a customer or an external partner, use the **GitHub Page**. If you are a Sun\* member, use the **Wiki**. The sections below are a quick technical reference for this template.

---

## What is included 

### Issue Templates (14 tracker types)

| # | Template | Purpose |
|---|---|---|
| 01 | Epic | Large initiatives grouping multiple stories |
| 02 | Story | User-facing feature or requirement |
| 03 | Change Request | Scope change within an ongoing project |
| 04 | UI Design | Design task |
| 05 | Dev Task | Development implementation task |
| 06 | Test Design | Test case design |
| 07 | Test Execution | Test execution record |
| 08 | QA Bug | Bug found during QA testing |
| 09 | UAT Bug | Bug found during UAT |
| 10 | Production Bug | Bug found in production |
| 11 | Documentation | Documentation task |
| 12 | Investigation | Research or spike |
| 13 | Operation | Operational or infrastructure task |
| 14 | Feedback | General feedback or improvement idea |

### Requirement & Spec Documents

Folder structure follows **QC-01 — Quy chuẩn Cấu trúc Thư mục Spec trên GitHub**. Each folder has an `_index.md` listing its documents; `_templates/` holds the blank templates — copy, do not edit in place.

| Folder | Contains | Template | Index |
|---|---|---|---|
| [`requirements/`](requirements/) | **WHAT** — requirement documents, `REQ-{Story number}-{slug}.md` | `BM-2-901-63` | [`requirements/_index.md`](requirements/_index.md) |
| [`specs/`](specs/) | **HOW** — Screen Specification · Function Specifications · Technical Design in `specs/{screen-or-feature}/`; Database Design · API Design in `specs/system-design/`; shared docs in `specs/_common/` | `BM-2-901-50` … `BM-2-901-54` | [`specs/_index.md`](specs/_index.md) |

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `issue-triage-labels.yml` | Issue opened | Auto-assign team, severity, test-type labels based on template fields |
| `project-bootstrap.yml` | Manual (workflow_dispatch) | Copy template project board, link to repo, create labels |
| `pr-auto-label.yml` | PR opened/edited | Auto-label PRs based on checklist (db-migration, breaking-change, etc.) |
| `pr-validation.yml` | PR opened/edited | Validate PR description has required sections |
| `release-checklist-gate.yml` | PR to main, tag push | Enforce release readiness checklist before merge to main |
| `dsx-quality-gate.yml` | PR to main/develop | Validate YAML syntax of all workflow and template files |

### Project Status Automation (n8n Webhook)

The `webhook/` folder contains n8n Code Node scripts that automatically update GitHub Project v2 **Status** and **Quality Gate** custom fields in real-time based on GitHub App events.

Status transitions are defined in `docs/status-transition-spec/tracker-status.csv`.

See [`webhook/README.md`](webhook/README.md) for full setup details.

---

## Project Structure

```
.github/
  ISSUE_TEMPLATE/         ← 14 issue templates
  workflows/              ← 6 GitHub Actions workflows
  pull_request_template.md
requirements/
  _index.md               ← Requirement document index
  _templates/             ← BM-2-901-63 requirement document template
specs/
  _index.md               ← Spec index (SPEC · FUNC · TECH)
  _common/                ← Docs shared by two or more features
  _templates/             ← BM-2-901-50 … BM-2-901-54 spec templates
  system-design/
    database-design/      ← Database Design (+ _index.md)
    api-design/           ← API Design (+ _index.md)
docs/
  status-transition-spec/
    tracker-status.csv    ← Status transition rules
    github_action_spec.md ← Technical spec for automation
scripts/
  setup-labels.sh         ← Create all labels in a repo (CLI)
  bootstrap-project.sh    ← Bootstrap a new project board (CLI)
webhook/
  step-2-validate-signature.js
  step-3-route-event.js
  step-4-fetch-issue-context.js
  step-5-apply-spec.js
  step-6-execute-mutation.js
  README.md               ← n8n webhook setup guide
```

---

## Setting Up a New Project

### Step 1 — Create repository from template

Go to this repository on GitHub and click **"Use this template"** to create a new repository.

Do not clone and copy manually — use the template button to preserve the correct repository structure and settings.

### Step 2 — Bootstrap the project board

Run the **Project Bootstrap** workflow from GitHub Actions UI:

```
Actions → Project Bootstrap → Run workflow
  - repo_name: <new-repo-name>
  - project_board_name: <display name for the board>
```

Or use the CLI:

```bash
export GH_TOKEN=<PROJECT_TOKEN>
./scripts/bootstrap-project.sh \
  --org sun-asterisk \
  --repo <repo-name> \
  --project-name "<Board Name>" \
  --template-project-number <TEMPLATE_PROJECT_NUMBER>
```

Bootstrap will:
1. Copy the template GitHub Project board (all views and custom fields)
2. Link the new board to the repository
3. Create all required labels (~30 labels)

### Step 3 — Enable webhook automation (optional)

To enable real-time project status transitions, configure the n8n webhook integration for the new repository.
See [`webhook/README.md`](webhook/README.md) for instructions.

---

## Status Transitions

Project Status and Quality Gate fields are updated automatically based on pull request and issue events.

| Tracker | Event | Transition |
|---|---|---|
| Dev Task | PR opened | In Progress → In Review |
| Dev Task | PR merged | In Review → Closed + Quality Gate: Technical Review Passed |
| Dev Task | PR rejected | In Review → In Progress + Quality Gate: Technical Review Failed |
| QA / UAT / Production Bug | PR merged | → QA Testing + Quality Gate: Technical Review Passed |
| Any tracker | PR merged to main | → Closed |
| Story / Change Request | All Dev Tasks closed | In Progress → QA Testing |
| Story / Change Request | All subtasks closed | QA Testing → UAT In Progress + Quality Gate: QA Testing Passed |
| Story / Change Request | QA Bug opened | QA Testing → In Progress + Quality Gate: QA Testing Failed |
| Epic | Story is In Progress | New → In Progress |
| Epic | All Stories closed | In Progress → Closed |
| Any tracker | Issue closed as completed | → Closed (guarded) |
| Any tracker | Issue closed as not planned | → Cancelled (guarded) |

Full spec: [`docs/status-transition-spec/tracker-status.csv`](docs/status-transition-spec/tracker-status.csv)

---

## Label System

Labels are created automatically by the bootstrap workflow and maintained by `scripts/setup-labels.sh`.

| Group | Labels |
|---|---|
| Type | `type:epic`, `type:story`, `type:changerequest`, `type:devtask`, `type:qabug`, `type:uatbug`, `type:productionbug`, `type:uidesign`, `type:testdesign`, `type:testexecution`, `type:documentation`, `type:investigation`, `type:operation`, `type:feedback` |
| Team | `team:frontend`, `team:backend`, `team:native-ios`, `team:native-android`, `team:native-multiPF`, `team:ai`, `team:infrastructure` |
| Severity | `severity:low`, `severity:medium`, `severity:high`, `severity:critical` |
| Test Type | `testtype:functionaltest`, `testtype:layouttest`, `testtype:performancetest`, `testtype:stresstest`, `testtype:accesscontrol&securitytest` |
---

## One-time Org Setup

The following must be configured once at the organization level by Infra before any project can use this template.

**Mark this repo as a Template Repository:**
Repository Settings → check "Template repository"

**Organization Secret: `PROJECT_TOKEN`**
Fine-grained PAT with permissions:
- Repository: Issues (Write), Pull requests (Read), Variables (Write)
- Organization: Projects (Read and Write)

Set at: Org Settings → Secrets → Actions → New organization secret → Access: All repositories

**Organization Variable: `TEMPLATE_PROJECT_NUMBER`**
The number of the master GitHub Project to copy from (visible in the URL: `github.com/orgs/sun-asterisk/projects/NUMBER`).

Set at: Org Settings → Variables → Actions → New organization variable

---

## Support and Contact

For questions, issues, or improvement proposals related to this template:

- **Slack:** [#con_pec-github-project-support](https://sun-asterisk.slack.com/channels/con_pec-github-project-support)
- **GitHub Issues:** Open an issue in this repository with a description of the problem or request

This template is owned and maintained by the **PEC (Process Elevation Consultant)** team at Sun Asterisk. Contributions from project teams are welcome via pull request.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
