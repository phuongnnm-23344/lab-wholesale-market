---
id: SPEC-LOT_FUNC-001
title: Module lot — Function Specifications
type: system
subtype: function-specifications
version: "0.1.2"
updated_by: phuongnnm-23344
updated: 2026-11-26
feature: lot
related: [SPEC-SC-03-01-001, SPEC-SC-03-05-001, SPEC-LOT_REGISTER-001, SPEC-LOT_INSPECTION_RECORD-001, API-LOT-001, API-LOT-002, API-LOT-003, API-LOT-004, API-LOT-005, API-LOT-006, SPEC-LOT_DB-001]
---

# Module lot — Function Specifications

| | |
|---|---|
| Module / file | Route handler: `src/app/api/v1/lots/**/route.ts`, `src/app/api/v1/master/shippers/route.ts` · service: `src/modules/lot/*.ts` · hàm DB: `db/functions/lot/*.sql` (schema `app`) — **đường dẫn đề xuất của PL**, chốt khi dựng repo to-be (ARCHITECTURE §12 giữ cấu trúc Next.js của prototype) |
| Ngôn ngữ / framework | TypeScript 5 / Next.js App Router route handler + zod · PL/pgSQL (PostgreSQL 16), hàm `security definer` gọi `assert_caller` (MKT_DB §4.0 "Ghi") |

Quy ước chung của mọi function trong file:
- Route handler: kiểm phiên + vai (`requireRole`) → validate body bằng zod (lỗi → 422 mã ở §3) → mở transaction, `set_config('app.user_id'|'app.device_id', …, true)` → gọi **một** hàm DB → map lỗi `P0001 'E-LOT-xxx: detail'` sang HTTP theo §3 (ARCHITECTURE §4.3).
- Hàm DB: **chỉ** cách ghi duy nhất vào bảng lô (DB role của app chỉ có EXECUTE). Ném lỗi dạng `raise exception using errcode = 'P0001', message = 'E-LOT-xxx: {detail}'`.
- Module khác chỉ gọi hàm "public" ở 2.9, 2.10 (trade) và 2.11 (delivery); không đọc bảng `lots` trực tiếp mà qua view `v_lot_available_qty` (ARCHITECTURE §2).

---

## 1. Lịch sử sửa đổi

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | Toàn bộ (2.1–2.10) | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |
| 2 | Ver 0.1.1 | Update | — | Khách Q-LOT-01: mã chính thức khi lên server, tìm theo 仮番号 cả ngày, không dùng lại số, lô 仮受付 hủy → CANCELLED giữ số, phiếu in dùng mã chính thức; đóng Q-LOT-03 | 2026-11-25 | phuongnnm-23344 |  |
| 3 | Ver 0.1.2 | Update | 2.11 | LAB-5 PREMISE L5-S01 (chỗ hở L5-G02): thêm hàm public `app.fn_lot_refresh_delivery_status` đổi lô `CLOSED` → `DELIVERED` khi mọi GD đã 引渡し完了 | 2026-11-26 | phuongnnm-23344 |  |

---

## 2. Đặc tả function

### 2.1. `listPendingProvisionalLots`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<PendingProvisionalLotsResponse \| ApiError>>` | `listPendingProvisionalLots` (`GET /api/v1/lots/provisional` — API-LOT-001) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Không có query; 業務日 lấy từ `business_days` đang `OPEN` |

**Function description**

> - Trả danh sách lô `PROVISIONAL` của 業務日 đang mở (đọc `lots` qua RLS của vai INTAKE), sắp theo `created_at`, kèm tên 受付者.
> - Trả `unsyncedCount` = số `offline_sync_records` loại `PROVISIONAL_LOT` có `result IN ('PENDING','HELD')` (dùng cho SC-03-01 [12]).
> - Không ghi dữ liệu. Vai khác INTAKE → 403.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` (ISO date) | `businessDate` | Giới hạn truy vấn đúng ngày mở (index `idx_lots_business_date_status`) |
| `number` | `unsyncedCount` | Bật / tắt liên kết [12] |

### 2.2. `registerLot`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ lotId: string; lotNo: string; status: "RECEIVED" } \| ApiError>>` | `registerLot` (`POST /api/v1/lots` — API-LOT-002) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Body JSON `RegisterLotBody` (API-LOT-002 §3) |

**Function description**

> - Vai INTAKE. Validate zod: `shipperId` uuid, `itemCode` 1–10, `unit` ∈ `KG|CASE|PIECE`, `qty` > 0 và đúng số lẻ theo `unit` (`E-LOT-003/004`), `voucherNo` ≤ 20 `[A-Za-z0-9-]` (`E-LOT-005`), `provisionalLotId` uuid hoặc null, `confirmDuplicate` boolean (mặc định `false`).
> - Gọi `app.fn_register_lot` (2.3) trong một transaction; trả 201.
> - Map: `E-LOT-007` → 409 kèm `detail.duplicateLotNo` (client hỏi lại, không phải lỗi cứng).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `RegisterLotBody` | `body` | Dữ liệu đã qua zod, truyền nguyên vào hàm DB |
| `PoolClient` | `tx` | Transaction gắn `app.user_id`, `app.device_id` để hàm DB biết người ghi |

### 2.3. `app.fn_register_lot`

| Return type | Function name |
|---|---|
| `jsonb` (`{lot_id, lot_no, status}`) | `app.fn_register_lot` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_provisional_lot_id` | Lô 仮受付 cần hoàn tất; `NULL` = lô 新規 |
| `uuid` | `p_shipper_id` | 出荷者 (phải `shippers` đang dùng) |
| `varchar(10)` | `p_item_code` | 品目 |
| `app.unit_code` | `p_unit` | Đơn vị |
| `numeric(12,1)` | `p_qty` | SL xác nhận (> 0, số lẻ theo đơn vị) |
| `varchar(20)` | `p_voucher_no` | Số 紙伝票 (NULL được) |
| `boolean` | `p_confirm_duplicate` | `true` = bỏ qua cảnh báo nghi trùng |

**Function description**

> - `assert_caller(INTAKE)`; lấy 業務日 đang mở; kiểm master; khóa dòng lô 仮受付 `FOR UPDATE` (status phải `PROVISIONAL`, `E-LOT-006`); kiểm nghi trùng 10 phút (`E-LOT-007` khi `p_confirm_duplicate = false`).
> - Cập nhật / thêm `lots` → `RECEIVED`; thêm `lot_status_history`; thêm `lot_quantity_ledger` `RECEIVE` = `p_qty`; audit qua trigger. Chi tiết từng bước: [LOT_REGISTER_TECH](../technical-design/LOT_REGISTER_TECH.md).
> - Trả mã lô để client hiện toast.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `v_caller` | Người ghi (`registered_by`, `created_by`) |
| `date` | `v_day` | 業務日 đang mở — ngày ghi sổ của dòng `RECEIVE` |
| `app.lots%rowtype` | `v_lot` | Dòng 仮受付 đã khóa, để kiểm trạng thái và lấy `qty_provisional` |
| `text` | `v_dup_lot_no` | Mã lô nghi trùng trả về cho client |

### 2.4. `searchLots`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ lots: LotListItem[]; total: number } \| ApiError>>` | `searchLots` (`GET /api/v1/lots` — API-LOT-003) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Query: `date`, `status` (csv), `itemCode`, `shipperId`, `q` (số đuôi mã lô, mã lô đầy đủ **hoặc 仮番号** — Q-LOT-01), `onSale`, `registeredBy=me`, `include` (csv `latestInspection,hasTrades`), `sort`, `limit` (≤ 100), `offset` |

**Function description**

> - Mọi vai có quyền đọc lô (INTAKE, JUDGE, TRADE, SETTLE, STL-HEAD, OPS-HEAD — role-list P13–P16) qua RLS `role_read_matrix`.
> - `date` mặc định = 業務日 đang mở; luôn có điều kiện ngày + `limit` (M23). `onSale=true` = `status = PUBLISHED` **và** SL khả dụng > 0 (view `v_lot_available_qty`), gồm lô 持ち越し sang ngày này.
> - `include=latestInspection` nối dòng `lot_inspections` mới nhất; `hasTrades` = tồn tại `trades` của lô (đọc qua view `v_trade_effective`).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `LotSearchQuery` | `query` | Query đã qua zod; giá trị lạ → 422 `E-CMN-007` |
| `string[]` | `statuses` | Lọc trạng thái FIG-011 |

### 2.5. `recordInspections`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ count: number; batchNo: string; recordedAt: string } \| ApiError>>` | `recordInspections` (`POST /api/v1/lots/inspections` — API-LOT-004) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Body `RecordInspectionsBody`: `lotIds[]` (1–50, không trùng), `grade`, `note`, `secondCheckerEmployeeNo`, `rerecordReason` |

**Function description**

> - Vai JUDGE. zod kiểm độ dài (`E-LOT-008/009/010/017`); gọi `app.fn_record_inspections` (2.6); trả 201.
> - **Không** có tham số nào để hệ thống tự đề xuất hạng (ADR-010).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `RecordInspectionsBody` | `body` | Dữ liệu đã validate |

### 2.6. `app.fn_record_inspections`

| Return type | Function name |
|---|---|
| `jsonb` (`{count, batch_no, recorded_at}`) | `app.fn_record_inspections` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid[]` | `p_lot_ids` | Lô được người đánh giá chọn |
| `varchar(10)` | `p_grade` | Hạng người đánh giá bấm (phải thuộc `code_values` `INSPECTION_GRADE`) |
| `varchar(200)` | `p_note` | 所見 |
| `varchar(10)` | `p_second_checker_employee_no` | Người xác nhận thứ hai (NULL được) |
| `varchar(200)` | `p_rerecord_reason` | Lý do khi có lô đã có GD |

**Function description**

> - `assert_caller(JUDGE)`; khóa các lô theo thứ tự `id` (tránh deadlock — prototype 0027 W12); kiểm trạng thái (`E-LOT-013`), lý do (`E-LOT-011`), người thứ hai (`E-LOT-012`).
> - Thêm một dòng `lot_inspections` **mỗi lô**, cùng `batch_no`; lô `RECEIVED` → `INSPECTED` + `lot_status_history`. Lỗi một lô → rollback cả lượt. Chi tiết: [LOT_INSPECTION_RECORD_TECH](../technical-design/LOT_INSPECTION_RECORD_TECH.md).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `v_batch_no` | Nhóm các dòng ghi trong cùng một lần bấm |
| `uuid` | `v_second_checker` | id tài khoản người thứ hai sau khi tra mã NV |
| `boolean` | `v_has_trades` | Lô có GD → bắt buộc `p_rerecord_reason` |

### 2.7. `searchShippers`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ shippers: { id: string; code: string; name: string }[] } \| ApiError>>` | `searchShippers` (`GET /api/v1/master/shippers` — API-LOT-005) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Query `q` (1–20 ký tự, khớp đầu mã hoặc một phần tên), `limit` (mặc định 10, ≤ 20) |

**Function description**

> - Đọc master `shippers` đang dùng (RULE_DB), sắp: khớp mã chính xác → khớp đầu mã → khớp tên. Vai INTAKE, JUDGE (và vai đọc lô).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `q` | Chuỗi tìm đã chuẩn hóa (全角 → 半角, bỏ khoảng trắng) |

### 2.8. `getLotFormOptions`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<LotFormOptions \| ApiError>>` | `getLotFormOptions` (`GET /api/v1/lots/form-options` — API-LOT-006) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Không có tham số |

**Function description**

> - Trả `businessDate` (業務日 đang mở), `intakeStartTime` (`rule_parameters.LOT_INTAKE_START_TIME` của version quy chế gắn với 業務日 đó), `items[]` (品目 + đơn vị mặc định), `units[]`, `grades[]` (`code_values` `INSPECTION_GRADE`, theo `sort_order`).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `ruleVersionId` | Version quy chế của 業務日 — để giờ trong SC-03-01 [3] không viết cứng (khách #27) |

### 2.9. `app.fn_lot_lock_for_sale` (public — module trade gọi)

| Return type | Function name |
|---|---|
| `numeric(12,1)` (SL khả dụng trước khi bán) | `app.fn_lot_lock_for_sale` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_lot_id` | Lô cần bán |
| `numeric(12,1)` | `p_qty` | SL định bán |
| `date` | `p_day` | 業務日 đang mở |

**Function description**

> - Khóa dòng `lots` `FOR UPDATE`; lô phải `PUBLISHED` và thuộc / được 持ち越し sang `p_day` (không → `E-TRD-001`); SL khả dụng = Σ `qty_delta` ≥ `p_qty` (không → `E-TRD-002` kèm SL thật). Không ghi gì. Gọi trong cùng transaction với hàm chốt GD (BR-LOT-02).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `numeric` | `v_available` | SL khả dụng tại lúc khóa — trả về để 2.10 quyết đổi trạng thái lô |

### 2.10. `app.fn_lot_book_quantity` (public — module trade gọi)

| Return type | Function name |
|---|---|
| `void` | `app.fn_lot_book_quantity` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_lot_id` | Lô |
| `app.ledger_entry_kind` | `p_kind` | `SALE` (chốt GD) hoặc `SALE_REVERSE` (当日訂正 / 取消 / 修正申請) |
| `numeric(12,1)` | `p_qty_delta` | Âm khi `SALE`, dương khi `SALE_REVERSE` |
| `uuid` | `p_ref_trade_id` | GD (bắt buộc với `SALE`) |
| `uuid` | `p_ref_adjustment_id` | Dòng điều chỉnh (bắt buộc với `SALE_REVERSE`) |
| `date` | `p_day` | 業務日 ghi sổ (ngày mở) |

**Function description**

> - Thêm một dòng `lot_quantity_ledger`; SL mới = 0 → lô `CLOSED` (確定, PRM-110) + `lot_status_history`; `SALE_REVERSE` làm lô `CLOSED` có lại SL > 0 → về `PUBLISHED` + lịch sử (giả định PL, Q-LOT-05). Kiểm lại SL không âm sau khi ghi (BR-LOT-02).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `numeric` | `v_after` | SL khả dụng sau dòng mới — quyết định đổi trạng thái lô |

### 2.11. `app.fn_lot_refresh_delivery_status` (public — module delivery gọi)

| Return type | Function name |
|---|---|
| `boolean` | `app.fn_lot_refresh_delivery_status` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_lot_id` | Lô của GD vừa ghi giao / ngoại lệ |

**Function description**

> - Gọi trong cùng transaction với hàm ghi giao / ngoại lệ của module delivery (DEL_RECORD_TECH §5, DEL_EXCEPTION_DISPUTE_TECH). Khóa lô bằng `SELECT … FOR UPDATE` như 2.9. Lô đang `CLOSED` và `v_delivery_status` báo mọi GD của lô đã 引渡し完了 → đổi sang `DELIVERED` + một dòng `lot_status_history`, trả `true`; lô chưa `CLOSED` hoặc còn GD chưa giao xong → không đổi, trả `false`. Không đổi ngược `DELIVERED` → `CLOSED` (sửa sau chốt đi qua 修正申請, không ghi đè lịch sử).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `integer` | `v_open` | Số GD của lô chưa 引渡し完了 |

---

## 3. Mã lỗi, câu hỏi, giả định của module

> Mục này **không có trong biểu mẫu BM-2-901-54** — thêm theo brief LAB-4 P3 ("mã lỗi liệt kê trong FUNC"; bảng tổng mọi tiền tố ở [`_common/error-codes.md`](../../_common/error-codes.md)).

### 3.1 Mã lỗi `E-LOT-*`

| Mã | HTTP | Thông điệp (JP) | Nghĩa (VI) | Màn / API |
|---|---|---|---|---|
| E-LOT-001 | 422 | 出荷者コードがマスタにありません（{code}） | Mã người gửi không có trong master | SC-03-01 [4] / API-LOT-002 |
| E-LOT-002 | 422 | 品目がマスタにありません | 品目 không có trong master | SC-03-01 [5] / API-LOT-002 |
| E-LOT-003 | 422 | 数量は0より大きい値を入力してください | SL phải > 0 | SC-03-01 [7] / API-LOT-002 |
| E-LOT-004 | 422 | kg は小数第1位まで、箱・尾は整数で入力してください | Số lẻ sai theo đơn vị | SC-03-01 [7] / API-LOT-002 |
| E-LOT-005 | 422 | 紙伝票番号は20文字以内（英数字と「-」）で入力してください | Số phiếu quá dài / ký tự lạ | SC-03-01 [8] / API-LOT-002 |
| E-LOT-006 | 409 | この仮受付はすでに本登録済みです（{lotNo}） | 仮受付 đã được 本登録 (máy khác) | SC-03-01 [9] / API-LOT-002 |
| E-LOT-007 | 409 | 同じ出荷者・品目・数量のロットが10分以内に登録されています（{lotNo}）。登録しますか？ | Nghi trùng — hỏi lại, không chặn | SC-03-01 [13] / API-LOT-002 |
| E-LOT-008 | 422 | 等級を選択してください | Chưa chọn hạng | SC-03-05 [6] / API-LOT-004 |
| E-LOT-009 | 422 | 所見は200文字以内で入力してください | 所見 quá dài | SC-03-05 [7] / API-LOT-004 |
| E-LOT-010 | 422 | ロットを1件以上選択してください（最大50件） | Không chọn lô / quá 50 | SC-03-05 [4] / API-LOT-004 |
| E-LOT-011 | 422 | 取引のあるロットを再記録する場合は理由を入力してください | Lô có GD cần lý do ghi lại | SC-03-05 [9] / API-LOT-004 |
| E-LOT-012 | 422 | 確認者の社員番号が見つからないか、記録者本人です | Người thứ hai không hợp lệ | SC-03-05 [8] / API-LOT-004 |
| E-LOT-013 | 409 | ロット {lotNo} は下見を記録できない状態です（{status}） | Lô 仮受付 / 引渡し完了 / không tồn tại trong ngày | SC-03-05 [4] / API-LOT-004 |
| E-LOT-014 | 404 | 対象のロットが見つかりません | Lô không tồn tại | API-LOT-002, API-LOT-004 |
| E-LOT-015 | 422 | 出荷者コードを入力してください | Thiếu mã người gửi | SC-03-01 [4] / API-LOT-002 |
| E-LOT-016 | 422 | 品目・単位を選択してください | Thiếu / sai 品目, đơn vị | SC-03-01 [5][6] / API-LOT-002 |
| E-LOT-017 | 422 | 再記録理由は200文字以内で入力してください | Lý do ghi lại quá dài | SC-03-05 [9] / API-LOT-004 |

Mã chung `E-CMN-001..008` (thông điệp JP một bản, HTTP, cách client xử lý): [`_common/error-codes.md`](../../_common/error-codes.md). Body lỗi, MFA, khóa lạc quan: [`_common/api-conventions.md`](../../_common/api-conventions.md).

### 3.2 Câu hỏi / giả định mới

| ID | Câu hỏi | Giả định tạm (PL) | Ảnh hưởng nếu sai | Truy vết |
|---|---|---|---|---|
| Q-LOT-01 | Mã lô chính thức cấp lúc nào: khi 仮受付 lên server hay khi 本登録? | **Đã trả lời — đồng ý có điều kiện** [Customer giả lập, 2026-11-25]: cấp khi bản ghi 仮受付 lên server; (1) gõ 仮番号 tìm ra lô ở mọi màn (本登録, 目利き, 相対) tới hết 業務日 — API-LOT-003 `q`; (2) số chính thức **không dùng lại** (`day_counters` chỉ tăng); (3) lô 仮受付 hủy (nhập trùng / nhầm) giữ số với trạng thái `CANCELLED` 取消, không xóa, tra được khi kiểm toán; (4) lô offline chưa đồng bộ chưa có số chính thức → chưa bán được; (5) phiếu in cho người mua / 出荷者 dùng mã chính thức | Không tốn thêm; hàm / API hủy lô 仮受付 chưa đặc tả (phụ thuộc) | WF SC-03-01 [9], LOT_DB 4.25 |
| Q-LOT-02 | Ngưỡng tô vàng chênh 仮受付 / 本登録 (khách nói "vd. 5%") | Chưa làm (FB-CUS-287 để sau) | Thêm tham số file cấu hình + 1 dòng UI, ~0,1 ngày | khách #28 |
| Q-LOT-03 | Danh mục 等級 thật của chợ | Cách làm khách đồng ý (danh mục ở master, đổi không cần nhà thầu); A / B / C / 規格外 dùng tạm cho UAT; **danh mục thật hỏi 運用部門 (目利き主任)**. 等級 là trường riêng — không gộp với サイズ / 入数 [Customer giả lập, 2026-11-25] | Chỉ đổi dữ liệu master | L4-A02, CAP-HUMAN-01 |
| Q-LOT-04 | Ghi lại 目利き cho lô đã có GD có cần báo người chốt / 照合 không | Không báo; hiện ở lịch sử SC-03-04 | Thêm thông báo in-app, ~0,3 ngày | luật 4 |
| Q-LOT-05 | Lô `CLOSED` (bán hết) được trả SL do 当日訂正 / 取消 → mở bán lại tự động? | Có: về `PUBLISHED` + lịch sử | Nếu phải người mở lại → thêm thao tác ở SC-03-03 | PRM-110, FIG-011 |
| A-LOT-01 | 仮受付 không ghi sổ SL; 本登録 ghi `RECEIVE` = SL xác nhận | Theo prototype 0014 | Chú thích enum `ATTR_FIX` ("sửa SL lúc 本登録") ở MKT_DB phải sửa thành "sửa SL sau 本登録 ở SC-03-04" | MKT_DB §4.0, PRM-128 |
