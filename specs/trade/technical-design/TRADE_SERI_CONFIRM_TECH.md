---
id: SPEC-TRADE_SERI_CONFIRM-001
title: TRADE_SERI_CONFIRM — Xác nhận kết quả phiên せり (người chốt) + 差し戻し
type: system
subtype: detail-design
design_id: TRADE_SERI_CONFIRM
function: app.fn_confirm_seri_session, app.fn_send_back_seri_results
endpoint: POST /api/v1/seri-sessions/{sessionId}/confirm
component: SeriConfirmService
feature: trade
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-05-02-001, SPEC-TRADE_FUNC-001, SPEC-TRADE_QUALIFICATION_CHECK-001, API-TRD-005, API-TRD-006, API-TRD-007, SPEC-TRADE_DB-001]
---

# TRADE_SERI_CONFIRM — Xác nhận kết quả phiên せり (người chốt) + 差し戻し

> Biểu mẫu: **BM-2-901-53 v01** — Detail Design (Chart + Description) · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Mục / Bước | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | — | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. Sequence diagram

Ảnh `./assets/TRADE_SERI_CONFIRM_sequence.png`: **N/A — chưa xuất** (chưa có `mmdc`); nguồn duy nhất là khối Mermaid.

**File nguồn của sơ đồ:** khối Mermaid trong file này.

```mermaid
sequenceDiagram
    autonumber
    actor U as 確認者 (TRADE)
    participant FE as SC-05-02
    participant API as RouteHandler POST /api/v1/seri-sessions/{id}/confirm
    participant SVC as SeriConfirmService
    participant DB as PostgreSQL app.fn_confirm_seri_session
    participant LOT as lot: fn_lot_lock_for_sale / fn_lot_book_quantity
    participant Q as BuyerQualificationCheck

    U->>FE: Bỏ chọn dòng sai → 差し戻し (API-TRD-007, riêng)
    U->>FE: [9] → C-31 確定する
    FE->>API: POST (confirmTradeIds[], overLimitReasons, samePersonReason?)
    API->>API: Phiên + vai TRADE, zod
    API->>SVC: confirm(sessionId, body)
    SVC->>DB: BEGIN · SELECT fn_confirm_seri_session(...)
    DB->>DB: assert_caller(TRADE) · khóa phiên FOR UPDATE
    alt phiên không ENTERING / không tồn tại
        DB-->>SVC: E-TRD-013 / E-TRD-024
    end
    alt 確認者 = 入力者 và không lý do
        DB-->>SVC: E-TRD-014
    end
    DB->>DB: Khóa mọi lô của phiên theo lot_id
    loop mỗi dòng PENDING theo No
        DB->>LOT: Kiểm lô + SL (khóa)
        DB->>Q: fn_check_buyer_qualification(…, extra_used = cộng dồn người mua)
        alt dòng được chọn mà không qua
            DB-->>SVC: E-TRD-018 / E-TRD-007 / E-TRD-008 (rollback cả lượt)
        else dòng không chọn, không xác nhận được
            DB->>DB: CANCELLED + CANCEL (lý do hệ thống)
        else dòng không chọn mà xác nhận được
            DB-->>SVC: E-TRD-015
        else dòng được chọn, qua kiểm
            DB->>DB: CONFIRMED · APPROVE + CONFIRM · lý do vượt (nếu có)
            DB->>LOT: fn_lot_book_quantity(SALE)
        end
    end
    alt không dòng nào được xác nhận
        DB-->>SVC: E-TRD-016
    end
    DB->>DB: Phiên CONFIRMED nếu hết DRAFT/PENDING · lưu confirmed_by, same_person_reason
    SVC->>DB: COMMIT
    API-->>FE: 200 {confirmedCount, cancelledTradeNos, sessionStatus}
```

---

## 3. Description

- 確認者 xác nhận **kết quả cuối đã được せり人 quyết trên sàn** cho cả phiên — người quyết cuối của CAP-HUMAN-01. Hệ thống chỉ ghi; không có giá đặt, không lượt trả giá (luật 1, FR-SERI-01).
- Tại lúc xác nhận, từng dòng được kiểm lại 許可 / 承認 + SL (BR-PERM-01, BR-LOT-02); 参加上限 chỉ cho 売買参加者, cộng dồn các dòng của cùng người mua trong phiên với 相対 + せり đã 確定 trong kỳ (L4-A04 (1)).
- 確認者 ≠ 入力者 mặc định; trùng → lý do bắt buộc, lưu `seri_sessions.same_person_reason`, hiện ở 要確認 SC-07-01 (S2, PRM-115).
- Dòng không xác nhận được (失効 / SL thiếu) bị **hủy có lịch sử**, không trừ SL, lô bán lại được (khách #9). Dòng sai do nhập → **差し戻し** (`fn_send_back_seri_results`) về 入力者, trước khi xác nhận.
- Tất cả hoặc không: một dòng được chọn mà không qua kiểm → không dòng nào được ghi, client nạp lại.

---

## 4. Detail function

### 4.1. Kiểm request, phiên, người xác nhận

| Trường | Giá trị |
|---|---|
| Input | `sessionId`, body `SeriConfirmBody` |
| Output | `v_session` đã khóa, `v_caller` → 4.2 |

**Error**

| Điều kiện lỗi | Xử lý | Status code |
|---|---|---|
| Chưa đăng nhập / không có vai TRADE | `E-CMN-001` / `E-CMN-002` | 401 / 403 |
| Phiên không tồn tại | `E-TRD-024` | 404 |
| `seri_sessions.status ≠ ENTERING` | `E-TRD-013: {状態}` | 409 |
| `v_caller = entered_by` và `p_same_person_reason` trống | `E-TRD-014` | 422 |
| Không có 業務日 `OPEN` / phiên thuộc ngày đã khóa | `E-CMN-003` | 423 |
| Trước giờ chốt GD | `E-TRD-012` | 409 |

**Detail**

| No | Nội dung xử lý |
|---|---|
| 1 | `requireRole(["TRADE"])`; zod |
| 2 | `v_caller := assert_caller(['TRADE'], [])`; `SELECT … FROM seri_sessions WHERE id = … FOR UPDATE` (kiểm vai **trước** khi đọc phiên — prototype 0027 S7) |
| 3 | Kiểm trùng người, ngày mở, giờ chốt |

### 4.2. Khóa lô và duyệt từng dòng

| Trường | Giá trị |
|---|---|
| Input | Dòng `trades` của phiên có `status = PENDING`, `p_confirm_trade_ids`, `p_over_limit_reasons` |
| Output | Danh sách dòng xác nhận / hủy → 4.3 |

**Error**

| Điều kiện lỗi | Xử lý | Status code |
|---|---|---|
| Id trong `p_confirm_trade_ids` không thuộc phiên / không `PENDING` | `E-TRD-018: {trade_no}`, rollback | 409 |
| Dòng được chọn: lô không bán / SL thiếu / 許可 · 承認 không hợp lệ | `E-TRD-018: {trade_nos}` (kèm `detail.rows[].reason`), rollback cả lượt | 409 |
| Dòng được chọn vượt 参加上限 không lý do / `OTHER` thiếu note | `E-TRD-007` / `E-TRD-008` kèm `detail.tradeNos`, rollback | 422 |
| Dòng **không** chọn nhưng xác nhận được | `E-TRD-015: {n}`, rollback | 422 |

**Detail**

| No | Nội dung xử lý |
|---|---|
| 1 | Khóa mọi lô của phiên `ORDER BY lot_id FOR UPDATE` (chống deadlock — prototype 0027 W12) |
| 2 | Duyệt dòng theo `No`; `v_used_in_batch[buyer]` cộng dồn tiền các dòng **được xác nhận** trước đó cùng người mua |
| 3 | Mỗi dòng: kiểm lô + SL (`fn_lot_lock_for_sale`, trừ dần SL các dòng trước cùng lô); gọi `fn_check_buyer_qualification(buyer, now(), trade_date, amount, v_used_in_batch[buyer], NULL, reason, note)` bắt lỗi thành kết quả "không qua" |
| 4 | Dòng không chọn + không qua → đánh dấu hủy (lý do hệ thống `資格失効` / `残数量不足` / `販売公開外`) |

### 4.3. Ghi kết quả dòng

| Trường | Giá trị |
|---|---|
| Input | Danh sách 4.2 |
| Output | `confirmed_count`, `cancelled_trade_nos` → 4.4 |

**Error**

| Điều kiện lỗi | Xử lý | Status code |
|---|---|---|
| Không dòng nào được xác nhận | `E-TRD-016`, rollback | 422 |
| Trigger `DAY_LOCKED` / `TRADE_FROZEN` | `E-CMN-003` / `E-CMN-004`, rollback | 423 / 500 |

**Detail**

| No | Nội dung xử lý |
|---|---|
| 1 | Dòng xác nhận: `UPDATE trades SET status = 'CONFIRMED', confirmed_by = v_caller, confirmed_at = now(), over_limit_reason_code / note` (chỉ khi vượt) — UPDATE cuối cùng được phép trước khi đóng băng |
| 2 | `fn_record_trade_event`: `APPROVE` (`PENDING` → `PENDING`), `CONFIRM` (`PENDING` → `CONFIRMED`) |
| 3 | `fn_lot_book_quantity(lot, 'SALE', -qty, trade_id, NULL, v_day)` — lô SL 0 → `CLOSED` |
| 4 | Dòng hủy: `UPDATE trades SET status = 'CANCELLED'` + `CANCEL` (`PENDING` → `CANCELLED`, lý do hệ thống); **không** ghi sổ SL |

### 4.4. Cập nhật phiên, commit

| Trường | Giá trị |
|---|---|
| Input | `v_session`, kết quả 4.3 |
| Output | 200 `{confirmedCount, cancelledTradeNos, sessionStatus}` |

**Error**

| Điều kiện lỗi | Xử lý | Status code |
|---|---|---|
| `40P01` / `40001` | Rollback, `E-CMN-006` | 409 |
| Lỗi khác | Log `ERROR`, `E-CMN-004` | 500 |

**Detail**

| No | Nội dung xử lý |
|---|---|
| 1 | Còn dòng `DRAFT` / `PENDING` (đã 差し戻し, chờ 入力者) → phiên giữ `ENTERING`; hết → `CONFIRMED`, `confirmed_by`, `confirmed_at` |
| 2 | `same_person_reason` lưu khi `v_caller = entered_by` (CHECK bảng 4.29) |
| 3 | `COMMIT`; log `INFO trade.seri.confirmed session={…} confirmed={n} cancelled={m} samePerson={bool}` |

### 4.5. 差し戻し (`fn_send_back_seri_results`, API-TRD-007)

| Trường | Giá trị |
|---|---|
| Input | `sessionId`, `tradeIds[]`, `reason` |
| Output | 200 `{sentBackCount}` |

**Error**

| Điều kiện lỗi | Xử lý | Status code |
|---|---|---|
| `reason` trống / > 200 | `E-TRD-017` | 422 |
| Phiên không `ENTERING` | `E-TRD-013` | 409 |
| Id không thuộc phiên / không `PENDING` | `E-TRD-018` | 409 |

**Detail**

| No | Nội dung xử lý |
|---|---|
| 1 | `assert_caller(TRADE)`; khóa phiên |
| 2 | Mỗi dòng: `UPDATE trades SET status = 'DRAFT'` + `REJECT` (`PENDING` → `DRAFT`, lý do) — không trừ SL |
| 3 | Ghi outbox thông báo in-app cho `entered_by` 「第{n}回 {k}件が差し戻されました：{理由}」 (module notify) |

---

## 5. Other Notes

- **Bắt buộc online, không MFA** (ADR-008, PREMISE §3.2). Hộp C-31 ở client trước khi gọi.
- **Function này KHÔNG:** nhập / sửa kết quả せり (SC-05-01, `SUBMIT` `DRAFT` → `PENDING` do 入力者); sửa sau xác nhận (→ 当日訂正 / 修正申請).
- **Lệch prototype:** prototype 0017 / 0027 bắt lý do vượt hạn mức cho **mọi** người mua kể cả 仲卸 và theo 業務日 (M20, D08); không có hủy dòng / 差し戻し; dòng lỗi làm hỏng cả phiên mà không có đường ra.
- **Điều kiện hoàn thành (LAB-5):** (a) 入力者 tự xác nhận không lý do → 422 `E-TRD-014`; có lý do → lưu và hiện ở 要確認; (b) 12 dòng, 1 dòng 承認 失効 bỏ chọn → 11 `CONFIRMED`, 1 `CANCELLED`, SL chỉ trừ 11 dòng; (c) 2 dòng cùng 売買参加者, dòng 2 vượt nhờ cộng dồn → chỉ dòng 2 cần lý do; (d) 仲卸 không bao giờ cần lý do; (e) bỏ chọn dòng xác nhận được rồi bấm [9] → 422 `E-TRD-015`; 差し戻し trước → dòng `DRAFT`, phiên `ENTERING`; (f) 相対 vừa chốt hết SL lô của một dòng được chọn → 409 `E-TRD-018`, không dòng nào ghi.
