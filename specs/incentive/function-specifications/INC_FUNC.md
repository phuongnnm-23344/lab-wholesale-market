---
id: SPEC-INC_FUNC-001
title: Function Specifications — module incentive (kỳ, phân bổ 入金, 完納奨励金, 期ロック)
type: system
subtype: function-specifications
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: incentive
related: [SPEC-INC_ENGINE-001, SPEC-SC-09-04-001, SPEC-INC_API-001, SPEC-INC_API-002, SPEC-INC_API-003, SPEC-INC_API-004, SPEC-INCENTIVE_DB-001, SPEC-BILLING_DB-001, ADR-007]
---

# incentive — Function Specifications

| | |
|---|---|
| Module / file | DB: `db/functions/incentive/*.sql` (schema `app`, `SECURITY DEFINER`, `search_path = app, pg_temp`) · App: `src/modules/incentive/**` (route handler + service) |
| Ngôn ngữ / framework | PL/pgSQL (PostgreSQL 16) · TypeScript / Next.js 16 route handler, zod |

Quy ước: hàm ghi chỉ chạy qua role ứng dụng có `EXECUTE`; mọi hàm ghi gọi `app.assert_caller(...)` trước tiên (ADR-002 §2.1). Kiểu ghép (`composite type`) khai trong cùng file migration của hàm. Khối K1–K9 = mục 4 của [INC_ENGINE_TECH](../technical-design/INC_ENGINE_TECH.md); file này chỉ ghi **chữ ký hàm, tham số, biến có ý nghĩa** (ranh giới BM-2-901-53 / 54).

---

## 1. Lịch sử sửa đổi

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | 2.1–2.13 | Khởi tạo: 12 hàm DB + 1 route handler của engine 完納奨励金 + màn SC-09-04 + mã lỗi `E-INC-001..013` | 2026-11-25 | phuongnnm-23344 | |
| 2 | Ver 0.1.1 | Update | — | Khách Q-INC-02: 2.1 lọc theo kỳ tính thưởng (GD 後入力 kỳ đã khóa sang kỳ đang mở); Q-INC-01: 2.3 paid_on = 入金日 CSV, 2.12/2.13 tick `paymentCsvImportConfirmed`, mã E-INC-014 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. Đặc tả function

### 2.1. `app.incentive_collect_inputs`

| Return type | Function name |
|---|---|
| `SETOF app.incentive_input_row` (`source`, `ref_id`, `period_id`, `participant_id`, `tax_rate_id`, `amount_jpy`, `is_on_time`, `created_at`) | `incentive_collect_inputs` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | Kỳ P cần thu thập |
| `boolean` | `p_include_candidates` | `true` → thêm đầu vào của các kỳ Q đã khóa có thay đổi sau khóa (K1-4) |

**Function description**

> - Đọc GD hiệu lực (`v_trade_effective`) có kỳ tính thưởng = P (`incentive_period_id = P`, hoặc NULL và `trade_date` ∈ P — GD 後入力 của kỳ đã khóa chuyển sang kỳ đang mở, TECH §3.4 / Q-INC-02), `trade_adjustments.period_id = P`, `payment_allocations.period_id = P`, 修正申請 KANNO / INCENTIVE đã duyệt; `STABLE`, không ghi.
> - Lỗi: P không tồn tại → `E-INC-001`; P `LOCKED` → `E-INC-002`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `app.payment_periods` | `v_period` | Ranh giới ngày `start_date` / `end_date` để lọc `trade_date` |
| `uuid[]` | `v_candidate_ids` | Danh sách Q đã khóa có đầu vào `created_at > Q.locked_at` (điều chỉnh, phân bổ, 修正申請 KANNO / INCENTIVE — **không** gồm GD 後入力) |

### 2.2. `app.incentive_input_hash`

| Return type | Function name |
|---|---|
| `char(64)` | `incentive_input_hash` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | Kỳ P |

**Function description**

> - Trả SHA-256 (hex) của `jsonb_agg` đầu vào 2.1 (sắp theo `source`, `ref_id`) + `rule_version_id` của P và của từng Q. Cùng đầu vào → cùng mã (DoD K1).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `text` | `v_canonical` | Chuỗi JSON chuẩn hóa đưa vào `digest(..., 'sha256')` |

### 2.3. `app.allocate_payment_fifo`

| Return type | Function name |
|---|---|
| `SETOF app.payment_allocations` | `allocate_payment_fifo` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_payment_id` | Dòng 入金 vừa nhập (đã có `participant_id`) |

**Function description**

> - K2: phân bổ theo 請求番号 (khi E-02 bật) hoặc FIFO theo kỳ cũ nhất còn nợ; tiền thừa → kỳ `OPEN` cũ nhất; ghi `is_on_time = paid_on ≤ due_date` — `paid_on` = 入金日 trên CSV ngân hàng, không phải ngày import (Q-INC-01). Gọi từ hàm nhập CSV (SC-09-01) và khi ánh xạ mã người nộp được sửa (SC-09-02). Chỉ thêm.
> - `participant_id` NULL → trả rỗng (không lỗi).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `bigint` | `v_remaining` | Tiền còn chưa phân bổ của 入金 |
| `record` | `r_period` | Kỳ còn nợ đang xét (vòng FIFO) |
| `bigint` | `v_outstanding` | Còn nợ của `r_period` theo định nghĩa BILLING_DB 4.48 |

### 2.4. `app.period_payable`

| Return type | Function name |
|---|---|
| `app.payable_row` (`participant_id`, `amount_excl_jpy`, `tax_jpy`, `amount_incl_jpy`, `tax_lines jsonb`) | `period_payable` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | Kỳ X |
| `uuid` | `p_participant_id` | Người mua (NULL = mọi người) |
| `boolean` | `p_after_lock` | `true` → gồm cả đầu vào ghi sau `locked_at` (dùng cho K6) |

**Function description**

> - K3-1: B = Σ theo suất (S_excl + ROUND(S_excl × suất)) với `TAX_ROUNDING` của version kỳ. Dùng chung cho thông báo nghĩa vụ (SC-09-B1) và engine.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `text` | `v_rounding` | Giá trị `TAX_ROUNDING` của version kỳ (`FLOOR` mặc định) |

### 2.5. `app.kanno_status`

| Return type | Function name |
|---|---|
| `app.kanno_row` (`status` `OK`/`NG`/`SUSPECT`, `kanno boolean`, `basis app.kanno_basis`, `shortfall_jpy bigint`, `note text`) | `kanno_status` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `bigint` | `p_payable_incl` | B |
| `bigint` | `p_paid_on_time` | OT |
| `bigint` | `p_fee_suspect_max` | FEE_MAX đọc từ file cấu hình (truyền vào, hàm không đọc file) |
| `jsonb` | `p_judgement` | `{decision, reason}` hoặc NULL |

**Function description**

> - K3-3..5; `IMMUTABLE`. Judgement chỉ hợp lệ khi `status = SUSPECT` (ngược lại `E-INC-011`); thiếu lý do → `E-INC-007`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `bigint` | `v_shortfall` | s = B − OT, quyết định nhánh `SUSPECT` |

### 2.6. `app.rate_tier_for`

| Return type | Function name |
|---|---|
| `TABLE(tier_no smallint, rate_bp int)` | `rate_tier_for` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_rule_version_id` | Version **của kỳ** (V_X), không phải version hiện hành |
| `app.participant_kind` | `p_class` | `NAKAOROSHI` / `BAIBAI` |
| `bigint` | `p_eligible_excl` | E (≥ 0) |

**Function description**

> - K4: cận dưới 以上, cận trên 未満; không tìm thấy đúng một dòng → `E-INC-010`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `int` | `v_found` | Số dòng khớp — khác 1 là dữ liệu quy chế hỏng |

### 2.7. `app.incentive_amount`

| Return type | Function name |
|---|---|
| `bigint` | `incentive_amount` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `bigint` | `p_eligible_excl` | E |
| `int` | `p_rate_bp` | ρ |

**Function description**

> - K5: `div(p_eligible_excl * p_rate_bp * 110, 1000000)`; `IMMUTABLE`, `STRICT`. Không có biến cục bộ.

| Variable type | Variable name | Role of variables |
|---|---|---|
| — | — | (không có) |

### 2.8. `app.compute_delta_rows`

| Return type | Function name |
|---|---|
| `SETOF app.incentive_result_draft` (cùng cột `incentive_results` trừ `id`, `run_id`, `created_at`) | `compute_delta_rows` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | Kỳ ghi nhận P |
| `uuid[]` | `p_candidate_ids` | Q từ 2.1 |

**Function description**

> - K6: tính lại toàn bộ từng Q bằng V_Q, giữ 完納 (trừ KANNO), cộng C_INC cố định, so R, tách dòng theo 修正申請 "mới". `STABLE`, không ghi.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `v_kanno_q` | K' — 完納 dùng để tính lại Q |
| `bigint` | `v_recorded` | R(i, Q) |
| `bigint` | `v_recomputed` | I'(i, Q) gồm C_INC |
| `bigint` | `v_residual` | Phần D chưa gắn 修正申請 → dòng không `correction_id` |

### 2.9. `app.compute_carry_rows`

| Return type | Function name |
|---|---|
| `SETOF app.incentive_result_draft` | `compute_carry_rows` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | Kỳ P |
| `app.incentive_result_draft[]` | `p_rows` | MAIN + DELTA vừa tính của P |

**Function description**

> - K7: cộng thêm CARRY vào P đã có trong bảng, trả dòng `CARRY` (kỳ P+1) hoặc `CARRY_EXPIRED` (P là tháng 03).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `bigint` | `v_sum` | Σ của người ở P |
| `uuid` | `v_chain_origin` | `ref_period_id` gốc của chuỗi âm |

### 2.10. `app.compute_period_incentives`

| Return type | Function name |
|---|---|
| `app.incentive_computation` (`input_hash`, `rows incentive_result_draft[]`, `suspects jsonb`, `warnings jsonb`, `totals jsonb`) | `compute_period_incentives` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | Kỳ P |
| `jsonb` | `p_judgements` | Map `participant_id → {decision, reason}` |
| `text` | `p_mode` | `PREVIEW` / `LOCK` (LOCK bắt buộc đủ judgement) |

**Function description**

> - Hàm thuần điều phối K1 → K3 → K4 → K5 → K6 → K7 theo thứ tự §3.3 của TECH. Không ghi bảng.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `bigint` | `v_fee_max` | FEE_MAX đọc một lần từ `app.config_value('KANNO_FEE_SUSPECT_MAX_JPY')` |

### 2.11. `app.preview_incentives`

| Return type | Function name |
|---|---|
| `jsonb` (kết quả 2.10 + `diff_from_previous`) | `preview_incentives` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | Kỳ P (`OPEN`) |
| `jsonb` | `p_judgements` | Judgement nháp (có thể rỗng) |

**Function description**

> - K8-10: `assert_caller('SETTLE' hoặc STL_HEAD)`; gọi 2.10 chế độ `PREVIEW`; ghi **một** dòng `audit_logs` `INCENTIVE_PREVIEW`; tính chênh với dòng 試算 liền trước (K9-4).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `jsonb` | `v_prev` | Payload dòng `INCENTIVE_PREVIEW` trước của P |

### 2.12. `app.lock_period`

| Return type | Function name |
|---|---|
| `jsonb` (`run_id`, `locked_at`, `totals`, `next_period_id`) | `lock_period` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | Kỳ P |
| `char(64)` | `p_expected_input_hash` | Mã băm lần 試算 người dùng đã xem — khác hiện tại → `E-INC-008` |
| `jsonb` | `p_judgements` | Judgement cuối cho mọi dòng `SUSPECT` |
| `int` | `p_ack_warning_count` | Số cảnh báo ⚠ người dùng đã xác nhận — khác → `E-INC-013` |
| `boolean` | `p_payment_csv_confirmed` | Tick 「支払期日分までの入金CSV取込済」 — khác `true` → `E-INC-014` (Q-INC-01) |

**Function description**

> - K8-2..9 trong transaction của caller: khóa dòng P, kiểm điều kiện (`E-INC-002/003/004/005/009/014`), gọi 2.10 `LOCK`, ghi `period_billings` LOCK, `incentive_runs` (kèm `payment_csv_confirmed_at`, `payment_csv_latest_paid_on`), `incentive_results`, 端数調整, `LOCKED`, kỳ kế, `notifications`, `audit_logs`. MFA đã được route handler xác minh và ghi vào `app.mfa_verified_at`; hàm kiểm mốc này ≤ 60 giây (hỏi lại mã).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `app.payment_periods` | `v_period` | Dòng P đã khóa `FOR UPDATE NOWAIT` |
| `app.incentive_computation` | `v_calc` | Kết quả hàm thuần để ghi |
| `uuid` | `v_run_id` | `incentive_runs.id` gắn cho mọi dòng kết quả |

### 2.13. `lockPeriodRoute` (TypeScript)

| Return type | Function name |
|---|---|
| `Promise<NextResponse>` | `POST` (file `src/app/api/v1/periods/[periodId]/lock/route.ts`) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `NextRequest` | `request` | Body theo API-INC-003 |
| `{ params: Promise<{ periodId: string }> }` | `context` | `periodId` (uuid) |

**Function description**

> - Kiểm body bằng zod; lấy phiên (`requireSession`), tiêu thụ header `X-MFA-Token` qua `iam.consumeMfaToken(session, token, "PERIOD_LOCK")` (token dùng một lần — api-conventions §4); mở transaction, `set_config` ngữ cảnh, gọi `app.lock_period`; ánh xạ lỗi RPC `E-INC-*` → HTTP theo API-INC-003; không log `mfa_code`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `LockPeriodBody` | `body` | Body đã kiểm (`expectedInputHash`, `judgements`, `ackWarningCount`, `paymentCsvImportConfirmed`; header `X-MFA-Token`) |
| `SessionContext` | `session` | Người, thiết bị, vai — đưa vào `set_config` |

---

## 3. Bảng mã lỗi của feature

| Mã | HTTP | Thông điệp (JP, hiện trên màn) | Nghĩa | Nơi phát sinh |
|---|---|---|---|---|
| E-INC-001 | 404 | 指定された期が見つかりません。 | Kỳ không tồn tại | 2.1; API-INC-001..004 |
| E-INC-002 | 423 | この期は期ロック済みです。訂正は修正申請で行い、差額は次の期ロックで計上されます。 | Kỳ đã khóa | 2.1, 2.12; API-INC-002, 003 |
| E-INC-003 | 409 | 前の期（{period}）がまだ期ロックされていません。古い期から順にロックしてください。 | Khóa sai thứ tự | 2.12; API-INC-003 |
| E-INC-004 | 409 | 支払期日（{due_date}）を過ぎていないため期ロックできません。 | Chưa qua hạn trả | 2.12; API-INC-003 |
| E-INC-005 | 409 | 締めが済んでいない業務日が {count} 日あります。日次締めを先に行ってください。 | Còn ngày chưa khóa | 2.12; API-INC-003 |
| E-INC-006 | 422 | 要確認の判断が入力されていない買受人が {count} 件あります。 | Thiếu judgement | 2.10; API-INC-003 |
| E-INC-007 | 422 | 判断の理由を入力してください（500文字以内）。 | Thiếu / quá dài lý do | 2.5; API-INC-002, 003 |
| E-INC-008 | 409 | 試算後に入金・訂正などの入力が変わりました。もう一度試算してから期ロックしてください。 | Đầu vào đổi sau 試算 | 2.12; API-INC-003 |
| E-INC-009 | 409 | 他の利用者がこの期を処理中です。しばらくしてから再度お試しください。 | Đang có phiên khóa khác | 2.12; API-INC-003 |
| E-INC-010 | 500 | 適用規則版の交付率表に不備があります。システム管理者に連絡してください。 | Dữ liệu quy chế / kỳ migrate hỏng | 2.6, 2.8; API-INC-002, 003 |
| E-INC-011 | 422 | 要確認ではない買受人に判断が指定されています。 | Judgement sai đối tượng | 2.5; API-INC-002, 003 |
| E-INC-012 | 404 | この期の確定結果はまだありません（期ロック前）。 | Chưa có kết quả chính thức | API-INC-004 |
| E-INC-013 | 409 | 確認が必要な注意事項が {count} 件あります。内容を確認してから期ロックしてください。 | Số cảnh báo ⚠ đổi | 2.12; API-INC-003 |
| E-INC-014 | 422 | 支払期日分までの入金CSVの取込を確認し、チェックを入れてください。 | Chưa tick 「支払期日分までの入金CSV取込済」 (Q-INC-01) | 2.12; SC-09-04 [17]; API-INC-003 |

Mã chung `E-CMN-001..008` (thông điệp JP một bản, HTTP, cách client xử lý): [`_common/error-codes.md`](../../_common/error-codes.md). Body lỗi, MFA, khóa lạc quan: [`_common/api-conventions.md`](../../_common/api-conventions.md).
