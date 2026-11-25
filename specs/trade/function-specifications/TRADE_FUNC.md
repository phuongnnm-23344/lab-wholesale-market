---
id: SPEC-TRADE_FUNC-001
title: Module trade — Function Specifications
type: system
subtype: function-specifications
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: trade
related: [SPEC-SC-04-01-001, SPEC-SC-05-02-001, SPEC-TRADE_QUALIFICATION_CHECK-001, SPEC-TRADE_AITAI_CONFIRM-001, SPEC-TRADE_SERI_CONFIRM-001, SPEC-TRADE_SAME_DAY_FIX-001, API-TRD-001, API-TRD-002, API-TRD-003, API-TRD-004, API-TRD-005, API-TRD-006, API-TRD-007, API-TRD-008, SPEC-TRADE_DB-001, SPEC-ADJUST_DB-001]
---

# Module trade — Function Specifications

| | |
|---|---|
| Module / file | Route handler: `src/app/api/v1/trades/**/route.ts`, `src/app/api/v1/seri-sessions/**/route.ts` · service: `src/modules/trade/*.ts` · hàm DB: `db/functions/trade/*.sql` (schema `app`) — **đường dẫn đề xuất của PL** |
| Ngôn ngữ / framework | TypeScript 5 / Next.js App Router route handler + zod · PL/pgSQL (PostgreSQL 16), hàm `security definer` gọi `assert_caller` |

Quy ước chung: như [LOT_FUNC](../../lot/function-specifications/LOT_FUNC.md) (route handler → một hàm DB trong một transaction → map lỗi `P0001 'E-TRD-xxx: detail'`). Module trade đọc tư cách / hạn mức người mua **chỉ qua view công bố** của party (`v_qualification_current`, `v_buyer_period_usage`) và đổi SL lô **chỉ qua hàm public** của lot (`fn_lot_lock_for_sale`, `fn_lot_book_quantity` — LOT_FUNC 2.9, 2.10).

---

## 1. Lịch sử sửa đổi

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | Toàn bộ (2.1–2.12) | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. Đặc tả function

### 2.1. `searchBuyers`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ buyers: BuyerStatus[]; overLimitReasonOptions: CodeOption[] } \| ApiError>>` | `searchBuyers` (`GET /api/v1/trades/buyers` — API-TRD-001) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Query `q` (đầu mã 買受人, 1–10), `limit` (≤ 10) |

**Function description**

> - Vai TRADE. Trả người mua `NAKAOROSHI` / `BAIBAI` khớp đầu `buyer_no`, mỗi người kèm tư cách hiện hành **theo đúng căn cứ** (`basis = KYOKA` cho 仲卸, `SHONIN` cho 売買参加者 — không có trường "quyền chung"), số ngày tới 失効日, và với 売買参加者: 参加上限, đã dùng trong kỳ hiện tại, còn lại.
> - Chỉ để hiển thị [4] / mở trước [13]; quyết định cuối ở 2.4 lúc chốt.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `periodKey` | Kỳ = tháng của 業務日 đang mở (`YYYY-MM`) — tính hạn mức đã dùng |
| `CodeOption[]` | `overLimitReasonOptions` | `code_values` `OVER_LIMIT_REASON` cho hộp [13] |

### 2.2. `confirmAitaiTrade`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<AitaiConfirmResult \| ApiError>>` | `confirmAitaiTrade` (`POST /api/v1/trades/aitai` — API-TRD-002) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Body `{ lotId, buyerId, qty, unitPriceJpy, overLimitReasonCode?, overLimitNote? }` |

**Function description**

> - Vai TRADE. zod: `qty` > 0 (`E-TRD-009`), số lẻ theo đơn vị **kiểm ở DB** vì client không gửi đơn vị (`E-TRD-010`), `unitPriceJpy` nguyên ≥ 1 (`E-TRD-011`), `overLimitNote` ≤ 200.
> - Gọi `app.fn_confirm_aitai_trade` (2.3); trả 201. Xem [TRADE_AITAI_CONFIRM_TECH](../technical-design/TRADE_AITAI_CONFIRM_TECH.md).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `AitaiConfirmBody` | `body` | Dữ liệu đã validate |

### 2.3. `app.fn_confirm_aitai_trade`

| Return type | Function name |
|---|---|
| `jsonb` (`{trade_id, trade_no, display_no, amount_jpy, available_qty_after, over_limit}`) | `app.fn_confirm_aitai_trade` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_lot_id` | Lô |
| `uuid` | `p_buyer_id` | Người mua |
| `numeric(12,1)` | `p_qty` | SL |
| `bigint` | `p_unit_price_jpy` | Đơn giá 税抜 |
| `varchar(20)` | `p_over_limit_reason_code` | Mã lý do vượt 参加上限 (NULL được) |
| `varchar(200)` | `p_over_limit_note` | Ghi chú (bắt buộc khi `OTHER`) |

**Function description**

> - Một transaction: `assert_caller(TRADE)` → kiểm giờ chốt (`E-TRD-012`) → `fn_lot_lock_for_sale` → số lẻ theo đơn vị lô → `fn_check_buyer_qualification` (2.4) → `INSERT trades` (`status CONFIRMED`, `channel AITAI`, `source ONLINE`, `trade_date = business_date`) → 3 dòng `trade_status_history` (`SUBMIT`, `APPROVE`, `CONFIRM`) qua 2.12 → `fn_lot_book_quantity(SALE)`.
> - Không có tham số người chốt: lấy từ `app.user_id` (không giả mạo được từ client).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `v_caller` | Người nhập = người chốt (`created_by`, `confirmed_by`) |
| `date` | `v_day` | 業務日 đang mở |
| `numeric` | `v_available` | SL khả dụng lúc khóa |
| `bigint` | `v_amount` | `floor(p_qty × p_unit_price_jpy)` |
| `jsonb` | `v_qual` | Kết quả 2.4 (`kind`, `over_limit`, `limit`, `used`) |

### 2.4. `app.fn_check_buyer_qualification` (dùng chung 相対 / せり / 紙伝票後入力 / 当日訂正)

| Return type | Function name |
|---|---|
| `jsonb` (`{kind, basis, over_limit, limit_jpy, used_jpy}`) | `app.fn_check_buyer_qualification` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_buyer_id` | Người mua |
| `timestamptz` | `p_at` | Thời điểm xét hiệu lực (lúc chốt; giờ trên phiếu với `PAPER_LATE` — ADR-008 §2.4-11) |
| `date` | `p_trade_date` | 取引日 — quyết định kỳ của 参加上限 |
| `bigint` | `p_amount_jpy` | Tiền GD này (税抜) |
| `bigint` | `p_extra_used_jpy` | Tiền đã cộng trước đó trong cùng lượt (các dòng せり trước của cùng người mua); 0 với 相対 |
| `uuid` | `p_exclude_trade_id` | GD loại khỏi "đã dùng" (GD gốc khi 当日訂正); NULL được |
| `varchar(20)` | `p_reason_code` | Lý do vượt (NULL được) |
| `varchar(200)` | `p_note` | Ghi chú lý do |

**Function description**

> - 仲卸 → kiểm **許可** (`nakaoroshi_permits`) `VALID` và `valid_from ≤ p_at::date ≤ valid_to`, sai → `E-TRD-005`; không có hạn mức. 売買参加者 → kiểm **承認** (`baibai_approvals`) tương tự, sai → `E-TRD-006`; rồi so `used + extra + amount` với 参加上限 của kỳ; vượt mà không lý do → `E-TRD-007`; `OTHER` thiếu note → `E-TRD-008`. Loại khác → `E-TRD-004`; không tồn tại → `E-TRD-003`.
> - Không ghi. Chi tiết: [TRADE_QUALIFICATION_CHECK_TECH](../technical-design/TRADE_QUALIFICATION_CHECK_TECH.md).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `app.participant_kind` | `v_kind` | Chọn nhánh 許可 hay 承認 — hai nhánh, hai bảng, hai mã lỗi (luật 2) |
| `bigint` | `v_limit` | 参加上限 hiện hành (NULL → 保証金 hiện hành) |
| `bigint` | `v_used` | Σ tiền hiệu lực 相対 + せり 確定 trong kỳ của `p_trade_date` |

### 2.5. `listTrades`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ trades: TradeListItem[]; total: number } \| ApiError>>` | `listTrades` (`GET /api/v1/trades` — API-TRD-003) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Query `dateFrom`, `dateTo` (mặc định ngày mở, ≤ 31 ngày), `channel`, `status`, `buyerNo`, `lotNo`, `mine`, `sort`, `limit` (≤ 100), `offset` |

**Function description**

> - Vai TRADE, SETTLE, STL-HEAD, OPS-HEAD. Đọc `v_trade_effective` (giá trị hiệu lực, gồm điều chỉnh) — luôn có khoảng ngày + phân trang (M23). Mặc định `channel=AITAI` khi gọi từ SC-04-03.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `TradeListQuery` | `query` | Query đã validate |

### 2.6. `printTradeSlip`

| Return type | Function name |
|---|---|
| `Promise<Response>` (`application/pdf`) | `printTradeSlip` (`POST /api/v1/trades/{tradeId}/slip-prints` — API-TRD-004) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Body `{ isReissue: boolean }` |
| `{ params: { tradeId: string } }` | `ctx` | GD cần in |

**Function description**

> - Vai TRADE. GD phải `CONFIRMED` hoặc có điều chỉnh (`E-TRD-025` nếu `CANCELLED` mà không in phiếu hủy). Sinh PDF 取引確認票 theo mẫu FORM (module `report`), ghi `print_logs` (`TRADE_SLIP`, `is_reissue` = đã có log trước đó hay chưa — server quyết, không tin client). Phiếu in lại có chữ 「再発行」; sau 当日訂正 có chữ 「訂正」.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `reissue` | Tính từ `print_logs` — client gửi `isReissue` chỉ để đối chiếu |

### 2.7. `getSeriSessionForConfirm`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<SeriSessionConfirmView \| ApiError>>` | `getSeriSessionForConfirm` (`GET /api/v1/seri-sessions/{sessionId}` — API-TRD-005) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `{ params: { sessionId: string } }` | `ctx` | Phiên |

**Function description**

> - Vai TRADE (đọc + ghi), SETTLE / STL-HEAD / OPS-HEAD (đọc). Trả phiên + dòng; với dòng `PENDING`, chạy **preview** 2.4 theo thứ tự `No` (cộng dồn `p_extra_used_jpy` theo người mua) và `fn_lot_lock_for_sale` ở chế độ không khóa (đọc `v_lot_available_qty`), để điền `confirmable`, `notConfirmableReason`, `overLimit`. Không ghi.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `Map<string, number>` | `extraUsedByBuyer` | Cộng dồn tiền các dòng trước của cùng người mua trong phiên |

### 2.8. `confirmSeriSession`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ confirmedCount: number; cancelledTradeNos: string[]; sessionStatus: "ENTERING" \| "CONFIRMED" } \| ApiError>>` | `confirmSeriSession` (`POST /api/v1/seri-sessions/{sessionId}/confirm` — API-TRD-006) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Body `{ confirmTradeIds[], overLimitReasons, samePersonReason? }` |
| `{ params: { sessionId: string } }` | `ctx` | Phiên |

**Function description**

> - Vai TRADE. zod (`samePersonReason` ≤ 200, mỗi `note` ≤ 200); gọi `app.fn_confirm_seri_session` (2.9).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `SeriConfirmBody` | `body` | Dữ liệu đã validate |

### 2.9. `app.fn_confirm_seri_session`

| Return type | Function name |
|---|---|
| `jsonb` (`{confirmed_count, cancelled_trade_nos, session_status}`) | `app.fn_confirm_seri_session` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_session_id` | Phiên |
| `uuid[]` | `p_confirm_trade_ids` | Dòng 確認者 chọn xác nhận |
| `jsonb` | `p_over_limit_reasons` | `{tradeId: {code, note}}` |
| `varchar(200)` | `p_same_person_reason` | Lý do khi 確認者 = 入力者 |

**Function description**

> - Khóa phiên → khóa mọi lô của phiên theo `lot_id` (chống deadlock, prototype 0027) → với mỗi dòng `PENDING` theo `No`: dòng được chọn phải qua 2.4 + SL, lỗi → `E-TRD-018` (rollback cả lượt); dòng không chọn: hệ thống đánh giá **không xác nhận được** → `CANCELLED` + `CANCEL`; **xác nhận được mà không chọn** → `E-TRD-015`. Dòng xác nhận: `APPROVE` + `CONFIRM`, `fn_lot_book_quantity(SALE)`. Chi tiết: [TRADE_SERI_CONFIRM_TECH](../technical-design/TRADE_SERI_CONFIRM_TECH.md).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `app.seri_sessions%rowtype` | `v_session` | Phiên đã khóa — kiểm `ENTERING`, 入力者 |
| `jsonb` | `v_used_in_batch` | Cộng dồn tiền theo người mua trong lượt |
| `text[]` | `v_cancelled` | Số GD bị hủy để trả về toast |

### 2.10. `app.fn_send_back_seri_results`

| Return type | Function name |
|---|---|
| `integer` (số dòng đã 差し戻し) | `app.fn_send_back_seri_results` (`POST /api/v1/seri-sessions/{sessionId}/send-back` — API-TRD-007) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_session_id` | Phiên |
| `uuid[]` | `p_trade_ids` | Dòng trả về 入力者 |
| `varchar(200)` | `p_reason` | Lý do (bắt buộc — `REJECT`) |

**Function description**

> - `assert_caller(TRADE)`; phiên `ENTERING` (`E-TRD-013`); dòng phải `PENDING` thuộc phiên; `PENDING → DRAFT` + sự kiện `REJECT` (lý do); gửi thông báo in-app cho 入力者 (module `notify`, outbox). Không trừ SL.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `integer` | `v_count` | Số dòng đã chuyển |

### 2.11. `app.fn_fix_trade` (当日訂正 / 取消 — SC-04-05, API-TRD-008)

| Return type | Function name |
|---|---|
| `jsonb` (`{fix_id, adjustments[], needs_settle_review, display_no}`) | `app.fn_fix_trade` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_trade_id` | GD gốc |
| `app.fix_kind` | `p_kind` | `FIX` / `CANCEL` |
| `uuid` | `p_new_buyer_id` | Người mua sau sửa (NULL = giữ; bỏ qua khi `CANCEL`) |
| `numeric(12,1)` | `p_new_qty` | SL sau sửa |
| `bigint` | `p_new_unit_price_jpy` | Đơn giá sau sửa |
| `varchar(20)` | `p_reason_code` | `FIX_REASON` |
| `varchar(200)` | `p_reason_note` | Bắt buộc khi `OTHER` |
| `varchar(20)` | `p_over_limit_reason_code` | Khi người mua mới / SL mới vượt 参加上限 |
| `varchar(200)` | `p_over_limit_note` | |

**Function description**

> - Ngày của GD gốc phải `OPEN` (không → `E-CMN-003`, client mang nội dung sang SC-08-01). GD phải `CONFIRMED`, không có 修正申請 chờ. Sinh `trade_fixes` + `trade_adjustments` REVERSE (giá trị hiệu lực hiện tại) + DELTA (giá trị mới; `CANCEL` không có DELTA), sổ SL `SALE_REVERSE` / `SALE`. **GD gốc không bị UPDATE số liệu** (luật 4). Chi tiết: [TRADE_SAME_DAY_FIX_TECH](../technical-design/TRADE_SAME_DAY_FIX_TECH.md).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `record` | `v_effective` | Giá trị hiệu lực hiện tại từ `v_trade_effective` (đã gồm lần sửa trước) |
| `bigint` | `v_max_buyer_diff_incl` | Tiền thay đổi lớn nhất của một người mua (税込) — so ngưỡng `CORR_TWO_LEVEL_THRESHOLD_JPY` |
| `boolean` | `v_buyer_changed` | Đổi 買受人 → luôn cần 照合 確認済 |

### 2.12. `app.fn_record_trade_event` (nội bộ)

| Return type | Function name |
|---|---|
| `void` | `app.fn_record_trade_event` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_trade_id` | GD |
| `app.trade_event` | `p_event` | `SUBMIT` · `APPROVE` · `REJECT` · `CONFIRM` · `FIX` · `CANCEL` · `CORRECTION_APPLIED` |
| `app.trade_status` | `p_from`, `p_to` | Trạng thái trước / sau |
| `varchar(200)` | `p_reason` | Bắt buộc khi `REJECT`, `CANCEL` |

**Function description**

> - Thêm một dòng `trade_status_history` (người = `app.user_id`, thiết bị = `app.device_id`); là nơi duy nhất ghi bảng này. Nhãn hiển thị sự kiện `APPROVE` trên UI là 「確認」, không dùng 「承認」 (L4-D03).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `v_device` | Thiết bị từ `app.device_id` (PRM-114 (a)) |

---

## 3. Mã lỗi, câu hỏi, giả định của module

> Mục này **không có trong biểu mẫu BM-2-901-54** — thêm theo brief LAB-4 P3; bảng tổng ở [`_common/error-codes.md`](../../_common/error-codes.md). Mã chung `E-CMN-*` xem file đó; `E-LOT-014` xem [LOT_FUNC §3](../../lot/function-specifications/LOT_FUNC.md#3-mã-lỗi-câu-hỏi-giả-định-của-module).

### 3.1 Mã lỗi `E-TRD-*`

| Mã | HTTP | Thông điệp (JP) | Nghĩa (VI) | Màn / API |
|---|---|---|---|---|
| E-TRD-001 | 409 | ロット {lotNo} は販売公開中ではありません（{状態}） | Lô không ở trạng thái bán | SC-04-01 [1], SC-05-02 / API-TRD-002, 006, 008 |
| E-TRD-002 | 409 | 残数量が {n}{unit} に変わりました（不足しています） | SL lô không đủ (C-23) | SC-04-01 [5], SC-04-05 [5] / API-TRD-002, 008 |
| E-TRD-003 | 422 | 買受人番号が見つかりません（{buyerNo}） | Không có người mua | SC-04-01 [3] / API-TRD-002, 008 |
| E-TRD-004 | 422 | 買受人は仲卸または売買参加者のみ指定できます | Loại người tham gia không được mua | SC-04-01 [3] / API-TRD-002, 008 |
| E-TRD-005 | 422 | 仲卸の許可が有効ではないため確定できません（{状態}・有効期限 {date}） | **許可** (仲卸) không hiệu lực | SC-04-01 [3], SC-05-02 [5] / API-TRD-002, 006, 008 |
| E-TRD-006 | 422 | 売買参加者の承認が有効ではないため確定できません（{状態}・有効期限 {date}） | **承認** (売買参加者) không hiệu lực | SC-04-01 [3], SC-05-02 [5] / API-TRD-002, 006, 008 |
| E-TRD-007 | 422 | 今期の参加上限を超えます。超過理由を選択してください（上限 ¥{limit} / 今期確定済 ¥{used} / 今回 ¥{amount}） | Vượt 参加上限 chưa có lý do | SC-04-01 [13], SC-05-02 [4] / API-TRD-002, 006, 008 |
| E-TRD-008 | 422 | 「その他」を選んだ場合は備考を入力してください（200文字以内） | Thiếu ghi chú lý do | SC-04-01 [14], SC-05-02 [4], SC-04-05 [9] |
| E-TRD-009 | 422 | 数量は0より大きい値を入力してください | SL ≤ 0 | SC-04-01 [5], SC-04-05 [5] |
| E-TRD-010 | 422 | kg は小数第1位まで、箱・尾は整数で入力してください | Số lẻ sai theo đơn vị lô | SC-04-01 [5], SC-04-05 [5] |
| E-TRD-011 | 422 | 単価は1円以上の整数で入力してください | Đơn giá sai | SC-04-01 [6], SC-04-05 [6] |
| E-TRD-012 | 409 | 取引の確定は {HH:MM} 以降にできます | Trước giờ bắt đầu chốt GD (quy chế) | SC-04-01 [8], SC-05-02 [9] |
| E-TRD-013 | 409 | この回は確認待ちではありません（{状態}） | Phiên đã xác nhận / không chờ | SC-05-02 / API-TRD-006, 007 |
| E-TRD-014 | 422 | 入力者と同じ人が確認する場合は理由を入力してください | Tự xác nhận thiếu lý do | SC-05-02 [7] / API-TRD-006 |
| E-TRD-015 | 422 | チェックを外した行を先に差し戻してください（{n}件） | Còn dòng bỏ chọn chưa 差し戻し | SC-05-02 [9] / API-TRD-006 |
| E-TRD-016 | 422 | 確定する行がありません | Không có dòng để xác nhận | SC-05-02 [9] / API-TRD-006 |
| E-TRD-017 | 422 | 差し戻しの理由を入力してください | Thiếu lý do 差し戻し | SC-05-02 [12] / API-TRD-007 |
| E-TRD-018 | 409 | 確認中に状態が変わった行があります。一覧を更新してください（{tradeNos}） | Tư cách / SL đổi giữa lúc xem và lúc bấm | SC-05-02 / API-TRD-006 |
| E-TRD-019 | 409 | 確定済みの取引のみ訂正・取消できます（{状態}） | GD không ở `CONFIRMED` | SC-04-05 / API-TRD-008 |
| E-TRD-020 | 422 | 訂正・取消の理由を選択してください | Thiếu lý do | SC-04-05 [8] / API-TRD-008 |
| E-TRD-021 | 422 | 訂正内容が変わっていません | 訂正 không đổi gì | SC-04-05 [11] / API-TRD-008 |
| E-TRD-022 | 409 | 引渡済数量（{n}{unit}）より少なくできません | SL mới < SL đã giao | SC-04-05 [5] / API-TRD-008 |
| E-TRD-023 | 404 | 対象の取引が見つかりません | GD không tồn tại | API-TRD-004, 008 |
| E-TRD-024 | 404 | 対象のせりの回が見つかりません | Phiên không tồn tại | API-TRD-005, 006, 007 |
| E-TRD-025 | 409 | 取消済みの取引の取引確認票は出力できません | In phiếu GD đã hủy | API-TRD-004 |
| E-TRD-026 | 409 | 引渡済のため取り消せません。差異は例外登録で処理してください | 取消 GD đã giao một phần → SC-06-04 | SC-04-05 [12] / API-TRD-008 |
| E-TRD-027 | 409 | 修正申請の決裁待ちがあるため訂正できません | GD có 修正申請 đang chờ (C-27) | SC-04-05 / API-TRD-008 |

### 3.2 Câu hỏi / giả định mới

| ID | Câu hỏi | Giả định tạm (PL) | Ảnh hưởng nếu sai | Truy vết |
|---|---|---|---|---|
| Q-TRD-01 | Định dạng số GD đọc cho người mua | Lưu `A{YYYYMMDD}-{nnnn}` / `S{…}`; hiển thị 「相対-0005」「せり-0302」 (số trong ngày) | Chỉ đổi hàm sinh số + mẫu phiếu, ~0,2 ngày | WF SC-04-01 §6 #7, FB LAB-2 #7 |
| Q-TRD-02 | 参加上限 so với tiền 税抜 hay 税込? | 税抜 (như cột `amount_jpy`, 保証金 là số tiền tuyệt đối) | Đổi công thức 2.4 + view `v_buyer_period_usage`, ~0,3 ngày | PRM-046 |
| Q-TRD-03 | Máy in hiện trường: in thẳng PDF bằng chế độ kiosk của trình duyệt hay agent in cục bộ? | Trình duyệt chế độ kiosk-printing trên PC bàn GD (không cài agent) | Agent in → thêm thành phần cài máy, ~2 ngày | M05, ARCHITECTURE §9 |
| Q-TRD-04 | Phiên せり có 差し戻し: xác nhận nhiều lượt cho cùng phiên được không? | Được; phiên `CONFIRMED` khi hết dòng chờ | Nếu phải xác nhận một lần → 差し戻し mở lại cả phiên, đổi 2.9 / 2.10 | FR-SERI-02, `seri_status` |
| Q-TRD-05 | Dòng せり người mua 失効: hủy dòng (lô bán lại) hay trả 入力者 sửa người mua? | Hủy dòng (khách #9: "lô quay lại 販売公開中") | Trả 入力者 → `REJECT` thay `CANCEL`, không đổi bảng | khách #9, BR-PERM-01 |
| A-TRD-01 | 相対 một lần bấm ghi `SUBMIT` / `APPROVE` / `CONFIRM` cùng người, cùng thời điểm | Theo TRADE_DB 4.30 (PRM-114 (a)) | — | FIG-012, D10 |
| A-TRD-02 | Nhãn sự kiện `APPROVE` (FIG-012 「承認」) trên UI / báo cáo hiển thị là 「確認」 | Theo L4-D03 | Nếu khách muốn giữ chữ FIG-012 → ghi chú phân biệt với 承認 (売買参加者) | L4-D03, luật 2 |
