---
id: SPEC-RULE_FUNC-001
title: Function Specifications — module rule (version quy chế, checker, quota, rollback)
type: system
subtype: function-specifications
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: rule
related: [SPEC-RULE_VERSION-001, SPEC-SC-10-04-001, SPEC-RULE_API-001, SPEC-RULE_API-002, SPEC-RULE_API-003, SPEC-RULE_API-004, SPEC-RULE_API-005, SPEC-RULE_API-006, SPEC-RULE_DB-001, ADR-006]
---

# rule — Function Specifications

| | |
|---|---|
| Module / file | DB: `db/functions/rule/*.sql` (schema `app`, `SECURITY DEFINER`, `search_path = app, pg_temp`) · App: `src/modules/rule/**` |
| Ngôn ngữ / framework | PL/pgSQL (PostgreSQL 16) · TypeScript / Next.js 16 route handler, zod |

Khối R1–R7 = mục 4 của [RULE_VERSION_TECH](../technical-design/RULE_VERSION_TECH.md). Hàm phía maker (`create_rule_version`, `save_rate_rows`, `save_rule_parameters`, `submit_rule_version`) thuộc spec SC-10-02 / SC-10-03 (List ở LAB-4), không đặc tả ở đây.

---

## 1. Lịch sử sửa đổi

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | 2.1–2.12 | Khởi tạo: 11 hàm DB + 1 route handler phía checker / hiệu lực + mã lỗi `E-RULE-001..014` | 2026-11-25 | phuongnnm-23344 | |
| 2 | Ver 0.1.1 | Update | 2.10, 2.12 | Gate 2 G2-M01: `forceReentry` cho mọi `confirm` (`CHANGE` / `ROLLBACK`), `second-approval`, `cancel` bản `APPROVED` (PREMISE §3.2 ★); bảng `purpose` theo hành động | 2026-11-25 | phuongnnm-23344 | |

---

## 2. Đặc tả function

### 2.1. `app.fiscal_year_of`

| Return type | Function name |
|---|---|
| `int` | `fiscal_year_of` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `date` | `p_day` | Ngày cần quy ra năm TC |

**Function description**

> - `IMMUTABLE`: tháng ≥ 4 → năm của ngày, ngược lại năm − 1. Cùng công thức với cột GENERATED `rule_versions.fiscal_year` và `payment_periods.fiscal_year`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| — | — | (không có) |

### 2.2. `app.rule_quota_used`

| Return type | Function name |
|---|---|
| `int` | `rule_quota_used` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `int` | `p_fiscal_year` | Năm TC cần đếm |

**Function description**

> - R3-2: đếm `CHANGE` + `ROLLBACK` ở `APPROVED` / `ACTIVE` / `SUPERSEDED` của năm TC; không đếm `BASELINE`, `CANCELLED`, `DRAFT`, `PENDING`. `STABLE`. Gọi sau khi giữ advisory lock khi dùng để quyết định.

| Variable type | Variable name | Role of variables |
|---|---|---|
| — | — | (một câu `SELECT count(*)`) |

### 2.3. `app.can_approve_rule_version`

| Return type | Function name |
|---|---|
| `app.rule_approval_policy` (`allowed boolean`, `needs_second boolean`, `error_code text`) | `can_approve_rule_version` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `app.rule_change_kind` | `p_kind` | `CHANGE` / `ROLLBACK` (`BASELINE` không đi qua hàm này) |
| `int` | `p_used` | used(y) trước khi duyệt |
| `text` | `p_stage` | `CHECKER` / `SECOND` |

**Function description**

> - R4, bảng chân trị §3.2 của TECH. **Hai thân hàm** trong repo: `can_approve_rule_version.n1.sql` và `.n2.sql`; migration chỉ cài một (mặc định N1 — Q-RULE-01). `IMMUTABLE`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `int` | `c_quota` | Hằng 4 (GOV-RULE-01) — không đọc từ cấu hình |

### 2.4. `app.rule_at`

| Return type | Function name |
|---|---|
| `uuid` | `rule_at` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `date` | `p_day` | 業務日 / ngày đầu kỳ cần tra |

**Function description**

> - R6-2: version có `effective_from` lớn nhất ≤ `p_day` trong `APPROVED` / `ACTIVE` / `SUPERSEDED`. `STABLE`. Không có → lỗi hệ thống (luôn có `BASELINE`).

| Variable type | Variable name | Role of variables |
|---|---|---|
| — | — | (một câu `SELECT … ORDER BY effective_from DESC LIMIT 1`) |

### 2.5. `app.rule_version_review`

| Return type | Function name |
|---|---|
| `jsonb` | `rule_version_review` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_version_id` | Version đang xem |

**Function description**

> - Đọc cho API-RULE-001: thông tin version, bản so sánh với version `ACTIVE` hiện tại (bảng tỷ lệ 2 loại + mọi `param_key`), ví dụ tính ([15]) bằng `app.incentive_amount` (INC_FUNC 2.7) ở các mức 500.000 / 1.000.000 / 3.000.000 / 10.000.000, used(y) của năm TC theo 発効日, cờ quyền theo người gọi, trạng thái chính sách (R4 với used hiện tại, không khóa). Chỉ đọc.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `v_base_id` | Version so sánh = `rule_at(d_bd)` |
| `jsonb` | `v_diff` | Danh sách dòng khác nhau (区分, 項目, 現在, この版) |

### 2.6. `app.confirm_rule_version`

| Return type | Function name |
|---|---|
| `jsonb` (`status`, `awaiting_second_approval`, `quota_used_after`, `fiscal_year`) | `confirm_rule_version` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_version_id` | Version `PENDING` |
| `text` | `p_reason` | Lý do checker — bắt buộc khi `ROLLBACK` (1..500), tùy chọn khi `CHANGE` |

**Function description**

> - R1-2..3, R2, R3, R4 (`CHECKER`), R5-1/2. Lỗi: `E-RULE-001/002/003/004/005/006/007/009/013`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `app.rule_versions` | `v_row` | Dòng đã `FOR UPDATE` |
| `int` | `v_used` | used(y) sau khi giữ advisory lock |
| `app.rule_approval_policy` | `v_policy` | Kết quả R4 |

### 2.7. `app.second_approve_rule_version`

| Return type | Function name |
|---|---|
| `jsonb` (`status`, `quota_used_after`) | `second_approve_rule_version` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_version_id` | Version `PENDING` đã có `checker_id` |
| `text` | `p_reason` | Lý do 決裁 (1..500) |

**Function description**

> - Chỉ có tác dụng ở nhánh N2 (N1: luôn `E-RULE-010` vì không có trạng thái chờ 決裁). R2, R3, R4 (`SECOND`), R5-3. Lỗi: `E-RULE-001/004/005/007/010/011/013`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `int` | `v_used` | used(y) — kiểm lại ở thời điểm 決裁 |

### 2.8. `app.return_rule_version`

| Return type | Function name |
|---|---|
| `jsonb` (`status`) | `return_rule_version` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_version_id` | Version `PENDING` |
| `text` | `p_reason` | Lý do trả về (1..500) |

**Function description**

> - R7-1: `PENDING` → `DRAFT`, xóa `checker_id`; thông báo maker. Lỗi: `E-RULE-001/002/003/007`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| — | — | (không có biến đáng kể) |

### 2.9. `app.request_rule_version_cancel`

| Return type | Function name |
|---|---|
| `jsonb` (`requested_at`) | `request_rule_version_cancel` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_version_id` | Version `APPROVED`, chưa tới 発効日 |
| `text` | `p_reason` | Lý do (1..500) |

**Function description**

> - R7-3 (vai `RULE`): ghi đề nghị hủy + thông báo 照合部門長. Lỗi: `E-RULE-001/007/014`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `v_open_request` | Đã có đề nghị đang mở chưa |

### 2.10. `app.cancel_rule_version`

| Return type | Function name |
|---|---|
| `jsonb` (`status`, `quota_used_after`) | `cancel_rule_version` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_version_id` | Version cần hủy |
| `text` | `p_reason` | Lý do (1..500) |

**Function description**

> - R7-2 (`DRAFT` / `PENDING`: maker hoặc checker) và R7-4 (`APPROVED`: checker ≠ người đề nghị, cần đề nghị mở, MFA luôn hỏi lại mã — route handler bắt token `RULE_CANCEL_DECIDE`). Lỗi: `E-RULE-001/002/007/008/012`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `v_requester` | Người đề nghị hủy (khi `APPROVED`) — phải ≠ người gọi |

### 2.11. `app.activate_due_rule_versions`

| Return type | Function name |
|---|---|
| `int` (số version vừa `ACTIVE`) | `activate_due_rule_versions` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `date` | `p_business_date` | 業務日 vừa mở |

**Function description**

> - R6-1: gọi từ hàm mở 業務日 (feature settle / calendar) trong cùng transaction; không gọi từ client. Không có lỗi nghiệp vụ.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `record` | `r_due` | Version `APPROVED` tới hạn, duyệt theo `effective_from` tăng dần |

### 2.12. `POST` route handler (TypeScript) — `src/app/api/v1/rule-versions/[versionId]/{confirm|second-approval|return|cancel-request|cancel}/route.ts`

| Return type | Function name |
|---|---|
| `Promise<NextResponse>` | `POST` (5 file, dùng chung `runRuleVersionAction`) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `NextRequest` | `request` | Body `{ reason? }`, header `X-MFA-Token?` |
| `{ params: Promise<{ versionId: string }> }` | `context` | `versionId` (uuid) |

**Function description**

> - zod kiểm body; `requireSession`; MFA theo PREMISE §3.2 ★: `forceReentry: true` (bắt `X-MFA-Token` đúng `purpose`, step-up không thay được) cho `confirm` `CHANGE` → `RULE_CHANGE_CONFIRM`, `confirm` `ROLLBACK` → `RULE_ROLLBACK_CONFIRM`, `second-approval` → `RULE_SECOND_APPROVAL`, `cancel` bản `APPROVED` → `RULE_CANCEL_DECIDE`; `return`, `cancel` bản `DRAFT` / `PENDING` chấp nhận step-up còn hiệu lực; `cancel-request` không MFA; gọi hàm DB 2.6–2.10; ánh xạ `E-RULE-*` → HTTP theo API-RULE-002..006.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `RuleVersionActionBody` | `body` | Body đã kiểm |
| `boolean` | `forceReentry` | Có bắt nhập lại mã MFA không (theo hành động + `change_kind` / trạng thái version) |
| `string \| null` | `mfaPurpose` | `purpose` token phải khớp khi `forceReentry` |

---

## 3. Bảng mã lỗi của feature

| Mã | HTTP | Thông điệp (JP) | Nghĩa | Nơi phát sinh |
|---|---|---|---|---|
| E-RULE-001 | 404 | 指定された規則版が見つかりません。 | Version không tồn tại | 2.5–2.10; API-RULE-001..006 |
| E-RULE-002 | 403 | 起票者本人は確認・取消できません。 | Maker tự duyệt / tự hủy bản đã duyệt (S4) | 2.6, 2.8, 2.10; API-RULE-002, 004, 005 |
| E-RULE-003 | 409 | この版は確認待ちではありません（現在: {status}）。 | Sai trạng thái để duyệt / trả về | 2.6, 2.8; API-RULE-002, 004 |
| E-RULE-004 | 409 | 発効日（{date}）が現在の業務日以前のため確認できません。取り消して発効日を見直してください。 | 発効日 không còn ở tương lai | 2.6, 2.7; API-RULE-002, 003 |
| E-RULE-005 | 409 | 同じ発効日（{date}）の版がすでに発効待ち・適用中です。 | Trùng 発効日 | 2.6, 2.7; API-RULE-002, 003 |
| E-RULE-006 | 409 | 今年度の発効回数が上限（4回）に達しています。この版は確認できません。 | Vượt quota 4 lần / năm TC | 2.6; API-RULE-002 |
| E-RULE-007 | 422 | 理由を入力してください（500文字以内）。 | Thiếu / quá dài lý do | 2.6–2.10; API-RULE-002..006 |
| E-RULE-008 | 409 | この版は取り消せません（発効日以降、または取り消せない状態です）。 | Hủy sai trạng thái / quá hạn | 2.10; API-RULE-005 |
| E-RULE-009 | 409 | 4回到達後のロールバックは確認できません。誤った率で計算された期は修正申請「奨励金」で訂正してください。 | N1: chặn rollback khi đủ 4 | 2.6; API-RULE-002 |
| E-RULE-010 | 409 | この版は運用部門長の決裁待ちではありません。 | Gọi 決裁 sai trạng thái / ở nhánh N1 | 2.7; API-RULE-003 |
| E-RULE-011 | 403 | 起票者・確認者は決裁できません。別の運用部門長が決裁してください。 | N2: người 決裁 trùng maker / checker | 2.7; API-RULE-003 |
| E-RULE-012 | 409 | 起票者からの取消依頼がないため、発効待ちの版は取り消せません。 | Hủy bản đã duyệt khi chưa có đề nghị | 2.10; API-RULE-005 |
| E-RULE-013 | 409 | 交付率表またはパラメータに不備があります（{detail}）。差し戻してください。 | Nội dung version không hợp lệ | 2.6, 2.7; API-RULE-002, 003 |
| E-RULE-014 | 409 | この版は取消依頼できません（発効待ちでない、またはすでに依頼済みです）。 | Đề nghị hủy sai trạng thái / trùng | 2.9; API-RULE-006 |

Mã chung `E-CMN-001..008` (thông điệp JP một bản, HTTP, cách client xử lý): [`_common/error-codes.md`](../../_common/error-codes.md). Body lỗi, MFA, khóa lạc quan: [`_common/api-conventions.md`](../../_common/api-conventions.md).
