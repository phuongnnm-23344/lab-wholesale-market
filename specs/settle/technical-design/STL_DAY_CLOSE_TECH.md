---
id: SPEC-STL_DAY_CLOSE-001
title: 日次締め — checklist 11 mục, khóa 業務日, mở ngày kế tiếp
type: system
subtype: detail-design
design_id: STL_DAY_CLOSE
function: getCloseChecklist · closeBusinessDay
endpoint: GET /api/v1/business-days/{businessDate}/close-checklist · POST /api/v1/business-days/{businessDate}/close
component: DayCloseService
feature: settle
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-07-02-001, SPEC-SETTLE_FUNC-001, SPEC-STL_DEVICE_LOST-001, API-STL-001, API-STL-002, SPEC-CLOSE_DB-001, ADR-005, ADR-002, ADR-008, BR-CLOSE-01, PRM-031, PRM-119]
---

# STL_DAY_CLOSE — 日次締め

> Biểu mẫu: **BM-2-901-53 v01** — Detail Design (Chart + Description) · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Mục / Bước | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | — | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. Sequence diagram

Ảnh PNG: N/A — Mermaid là nguồn duy nhất (Gate 1 m-08).

```mermaid
sequenceDiagram
    autonumber
    actor H as 照合部門長 / 代行
    participant API as Route handler /api/v1
    participant DayCloseService
    participant IAM as iam (MFA purpose token)
    participant DB as PostgreSQL (app.fn_day_close_*)
    participant JOB as Job queue (IF-ACC-01)

    H->>API: GET /business-days/{d}/close-checklist
    API->>DayCloseService: getCloseChecklist(ctx, d)
    DayCloseService->>DB: fn_day_close_checklist(d)
    DB-->>API: 11 mục + checklistVersion
    H->>IAM: xác thực mã MFA (purpose DAY_CLOSE)
    IAM-->>H: mfaToken (1 lần, 120 giây)
    H->>API: POST /business-days/{d}/close + X-MFA-Token
    API->>IAM: tiêu thụ mfaToken (purpose, user, device)
    API->>DayCloseService: closeBusinessDay(ctx, d, input)
    DayCloseService->>DB: fn_day_close(d, ...)
    DB->>DB: FOR UPDATE business_days(d) · tính lại checklist · so checklistVersion
    alt còn ✖ / version lệch / ngày trước chưa khóa
        DB-->>API: 409
    else đạt
        DB->>DB: UPDATE business_days LOCKED + close_checklist snapshot
        DB->>DB: 持ち越し lô (fn của lot) · mở 業務日 kế tiếp (market_calendar)
        DB->>DB: audit_logs · notifications
        DB-->>API: lockedAt, nextBusinessDate
        API-)JOB: enqueue IF-ACC-01 batch(d)
    end
```

---

## 3. Description

Khóa một 業務日 sau khi người có quyền xem đủ checklist chuẩn (ADR-005 §2.5). Khóa bằng trạng thái DB + trigger `enforce_open_business_day` → mọi ghi vào ngày đó ở mọi bảng nghiệp vụ trả `DAY_LOCKED` (HTTP 423) — khóa ở mức dữ liệu, không chỉ ẩn nút (ADR-005 §3 phương án C bị bỏ). **Không có function mở lại** (ADR-005 §2.7).

Checklist (một hàm `fn_day_close_checklist(d)` dùng cho cả màn và cho kiểm lúc khóa — cùng một nguồn):

| ADR # | Mức | Điều kiện đếm (ngày `d`) | Item SC-07-02 |
|---|---|---|---|
| 1 | ✖ | `trades.business_date = d` và `status IN ('DRAFT','PENDING')` | [6] |
| 2 | ✖ | `seri_sessions` của `d` có `status = 'ENTERING'` (chưa xác nhận) | [4] |
| 3 | ✖ | `devices` `is_active` và `lost_reported_at IS NULL` có `pending_sync_count > 0`, **hoặc** có `offline_sync_records.result = 'PENDING'` với `business_date_for(captured_at) = d` | [8] |
| 4 | ✖ | `offline_sync_records.result = 'HELD'` có `business_date_for(captured_at) = d` + dòng 紙伝票後入力 nghi trùng chờ người quyết (`trades.source = 'PAPER_LATE'` chưa xác nhận) | [7] |
| 5 | ✖ | `trade_fixes.business_date = d`, `reviewed_at IS NULL` và (`max_buyer_diff_incl_jpy ≥ CORR_TWO_LEVEL_THRESHOLD_JPY` của version ngày `d` **hoặc** `buyer_changed`) — **trừ** fix sinh từ ngoại lệ giao (Q-DEL-09) | [9] |
| 6 | ✖ | `delivery_exceptions.affects_amount = true`, `settle_reviewed_at IS NULL`, GD có `business_date = d` | [20] |
| 7 | ⚠ | Lô `business_date ≤ d` còn SL khả dụng > 0 và chưa `CLOSED` → sẽ 持ち越し | [10] |
| 8 | ⚠ (tick) | GD `CONFIRMED` có `business_date ≤ d` còn 残 giao > 0 | [12] + [13] |
| 9 | ⚠ | Như #5 nhưng dưới ngưỡng và không đổi 買受人 | [21] |
| 10 | ⚠ | `delivery_exceptions.is_dispute` `status = 'OPEN'` có `business_date ≤ d` | [11] |
| 11 | ⚠ | Phiên せり của `d` có 確認者 = 入力者 (có lý do) | [5] |

`checklistVersion` = hash SHA-256 của (11 số đếm + danh sách id máy ở #3). Client gửi lại khi khóa — lệch → bắt xem lại (tránh khóa theo màn đã cũ).

Chạy xong: `business_days(d).status = LOCKED`, có `locked_by`, `lock_delegation_id`, `locked_at`, `close_checklist` (ảnh chụp 11 mục + máy đã loại vì 「端末回収不能」); 業務日 chợ kế tiếp `OPEN`; batch IF-ACC-01 được xếp hàng.

---

## 4. Detail function

### 4.1. Xác thực, quyền, MFA dùng một lần

| Trường | Giá trị |
|---|---|
| Input | Cookie `sid`; header `X-MFA-Token` (chỉ POST); path `businessDate` |
| Output | `SessionContext` + `mfaVerifiedAt` → 4.2 / 4.3 |

**Error**

| Điều kiện lỗi | Xử lý | Status code |
|---|---|---|
| Không phiên | Dừng; `E-CMN-001` | 401 |
| GET: vai không phải STL-HEAD / 代行 / SETTLE. POST: không có quyền `STL_HEAD` và không có 代行 STL_HEAD đang hiệu lực | Dừng; `E-CMN-002` | 403 |
| POST: `X-MFA-Token` thiếu / hết hạn (120 giây) / đã dùng / khác `purpose = DAY_CLOSE` / khác người hoặc thiết bị | Dừng; `E-CMN-005` | 403 |
| `businessDate` sai định dạng | Dừng; `E-CMN-007` | 422 |

**Detail**

| No | Nội dung xử lý |
|---|---|
| 1 | Nạp phiên, quyền duyệt, 代行 (S8, RACI-01) |
| 2 | POST: gọi `iam` tiêu thụ `mfaToken` (đánh dấu đã dùng) — ★ luôn hỏi lại mã, không dùng cửa sổ 10 phút (ADR-002 §2.2-6a) |
| 3 | `set_config` `app.user_id`, `app.device_id`, `app.mfa_verified_at`, `app.delegation_id` |

### 4.2. Tính checklist (`fn_day_close_checklist`)

| Trường | Giá trị |
|---|---|
| Input | `d` |
| Output | `{ businessDate, status, totals: { aitai, seri, all }, items: [{ adrNo, itemNo, level: BLOCK \| WARN, count, details[] }], devices[], checklistVersion, lockedInfo? }` → response API-STL-001, hoặc dùng ở 4.3 |

**Error**

| Điều kiện lỗi | Xử lý | Status code |
|---|---|---|
| `d` không có ở `business_days` | Dừng; `E-STL-012` 「指定の業務日が存在しません」 | 404 |

**Detail**

| No | Nội dung xử lý |
|---|---|
| 1 | Chạy 11 truy vấn đếm ở §3 (index: `idx_trades_business_date`, `idx_trade_fixes_unreviewed`, `idx_delivery_exceptions_open`, `idx_offline_sync_held`) — mục tiêu ≤ 1 giây |
| 2 | Ngưỡng #5 / #9 đọc từ `rule_parameters` của `business_days(d).rule_version_id` |
| 3 | Tổng tiền: Σ hiệu lực 税抜 của GD `business_date = d` (gồm điều chỉnh có `business_date = d`), tách 相対 / せり (`v_daily_settlement`) |
| 4 | Ngày đã `LOCKED` → trả ảnh chụp `close_checklist` + `lockedInfo` thay vì tính lại |

### 4.3. Kiểm lại và khóa (`fn_day_close`)

| Trường | Giá trị |
|---|---|
| Input | `d`, `confirmDate`, `deliveryRemainderAcknowledged`, `checklistVersion` |
| Output | Ngày `d` `LOCKED` → 4.4 |

**Error**

| Điều kiện lỗi | Xử lý | Status code |
|---|---|---|
| `confirmDate` (sau chuẩn hóa `/` → `-`) ≠ `d` | Dừng; `E-STL-001` | 422 |
| `deliveryRemainderAcknowledged ≠ true` | Dừng; `E-STL-003` | 422 |
| `d` đã `LOCKED` | Dừng; `E-STL-004` (kèm người / giờ khóa) | 409 |
| Có 業務日 `OPEN` < `d` | Dừng; `E-STL-005` (Q-STL-01) | 409 |
| `checklistVersion` ≠ giá trị tính lại | Dừng; `E-STL-010` | 409 |
| Còn mục ✖ có `count > 0` | Dừng; `E-STL-002` + `error_extra.blocking[]` | 409 |
| Mất mạng / timeout giữa chừng | Transaction rollback; client nhận lỗi mạng → gọi lại GET để xem trạng thái thật | — |

**Detail**

| No | Nội dung xử lý |
|---|---|
| 1 | `SELECT … FROM business_days WHERE business_date = d FOR UPDATE` — chặn hai người khóa cùng lúc và chặn ghi mới trong lúc kiểm (ghi nghiệp vụ đọc trạng thái ngày qua trigger cùng dòng) |
| 2 | Gọi `fn_day_close_checklist(d)` trong cùng transaction; so `checklistVersion`, kiểm ✖ |
| 3 | UPDATE `business_days` `status = LOCKED`, `locked_by`, `lock_delegation_id`, `locked_at = now()`, `close_checklist` = JSON 11 mục + danh sách máy `lost_reported_at` không null đã loại khỏi #3 |

### 4.4. Hệ quả sau khóa (cùng transaction)

| Trường | Giá trị |
|---|---|
| Input | `d` vừa khóa |
| Output | `{ lockedAt, lockedBy, delegatedFor?, nextBusinessDate }` → 200 |

**Error**

| Điều kiện lỗi | Xử lý | Status code |
|---|---|---|
| Không tìm được ngày chợ mở kế tiếp trong `market_calendar` (14 ngày tới) | Rollback toàn bộ (không khóa); `E-STL-008` | 409 |
| Lỗi hàm 持ち越し của `lot` | Rollback; `E-CMN-004`; alarm | 500 |

**Detail**

| No | Nội dung xử lý |
|---|---|
| 1 | Gọi `fn_lot_carry_over(d)` (module `lot`): lô còn SL → dòng `CARRY_OVER` sang ngày sau cùng mã lô (PRM-110, E-12 — quy tắc tạm) |
| 2 | Tìm ngày chợ mở kế tiếp `n` (`market_calendar.is_market_open`); nếu `business_days(n)` chưa có → INSERT `OPEN`, `intake_opens_at = n 01:00`, `rule_version_id` = version hiệu lực ngày `n` (idempotent với job 01:00 — ADR-005 §2.4) |
| 3 | Gọi `expireDueQualifications(n)` của `party` sau COMMIT (lỗi không ảnh hưởng khóa — SPEC-PARTY_FUNC-001 §2.8) |
| 4 | `audit_logs` (`DAY_CLOSE`, 代行 "thay cho …", MFA, ảnh chụp checklist); `notifications` → SETTLE 「{d} を締めました」 |
| 5 | Sau COMMIT: xếp hàng job tạo batch IF-ACC-01 cho `d` (BILLING_DB 4.41, PRM-123; hạn 11:00). Lỗi xếp hàng → log `ERROR` + alarm, không rollback khóa |

---

## 5. Other Notes

- **Không làm:** không có `reopen`; không tự khóa theo giờ (ADR-005 §3 E — trái CAP-HUMAN-01); không sửa dữ liệu ngày `d`.
- **Thứ tự khóa:** chặn khóa lệch thứ tự (Q-STL-01) để "業務日 chưa khóa sớm nhất" luôn là ngày sau ngày khóa gần nhất.
- **Cảnh báo trước giờ khóa:** do job nhắc (file cấu hình, ADR-005 §3 E), không thuộc function này.
- **MFA token dùng một lần** là chi tiết của `iam` (chưa có spec P3) — đề xuất: `POST /api/v1/auth/mfa/verify` {code, purpose} → `mfaToken` — chốt ở [api-conventions §4](../../_common/api-conventions.md#4-mfa-step-up); API iam chưa đặc tả (DEP-01, `specs/_index.md`).
- Truy vết: luật 3, luật 4; BR-CLOSE-01, FR-SETTLE-02, PRM-030, PRM-031, PRM-036, PRM-110, PRM-119, PRM-123, PRM-127, NFR-AVL-02, S8, RACI-01; ADR-002, ADR-005 §2.4–2.7, ADR-008; CLOSE_DB 4.20, 4.24; Gate 1 M-01, M-05; khách #1, #4, #25.
