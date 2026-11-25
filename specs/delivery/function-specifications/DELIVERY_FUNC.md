---
id: SPEC-DELIVERY_FUNC-001
title: Function Specifications — module delivery (引渡し, ngoại lệ, tranh chấp)
type: system
subtype: function-specifications
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: delivery
related: [SPEC-SC-06-02-001, SPEC-SC-06-04-001, SPEC-SC-06-05-001, SPEC-DEL_RECORD-001, SPEC-DEL_EXCEPTION_DISPUTE-001, API-DEL-001, API-DEL-002, API-DEL-003, API-DEL-004, API-DEL-005, API-DEL-006, SPEC-TRADE_DB-001]
---

# delivery — Function Specifications

| | |
|---|---|
| Module / file | `src/modules/delivery/delivery-service.ts` · `delivery-exception-service.ts` · PWA `src/modules/delivery/offline/delivery-queue.ts` · hàm DB `app.fn_delivery_*`, `app.fn_dispute_confirm` |
| Ngôn ngữ / framework | TypeScript 5 / Next.js App Router + PWA (service worker, IndexedDB) + PostgreSQL 16 (PL/pgSQL) — ARCHITECTURE §4.3, ADR-008 |

Kiểu dùng chung `SessionContext`, `Result<T>`, `AppError`: xem [PARTY_FUNC](../../party/function-specifications/PARTY_FUNC.md) (sẽ chuyển về `_common`).

---

## 1. Lịch sử sửa đổi

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | Toàn module | Khởi tạo 7 function + mã lỗi `E-DEL` | 2026-11-25 | phuongnnm-23344 | |

---

## 2. Đặc tả function

### 2.1. `listPendingDeliveries`

| Return type | Function name |
|---|---|
| `Promise<Result<{ buyer: BuyerSummary; trades: PendingTrade[] }>>` | `listPendingDeliveries` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | Vai DELIVERY / DEL-HEAD |
| `{ buyerNo?: string; tradeId?: string }` | `query` | Đúng một trong hai |

**Function description**

> - Đọc `v_delivery_status` + `v_trade_effective`: GD `CONFIRMED` còn 残 > 0 của người mua (gồm ngày trước — 前日残), hoặc một GD theo `tradeId` (cho SC-06-04). Trả `businessDateLocked` để màn ngoại lệ chọn đường tiền.
> - Lỗi: `E-DEL-001`, `E-DEL-002`, `E-DEL-027`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `isCarryOver` | Đánh nhãn 「前日残」 khi `trades.business_date` < 業務日 hiện tại |

### 2.2. `getOfflineSnapshot`

| Return type | Function name |
|---|---|
| `Promise<Result<OfflineSnapshot>>` | `getOfflineSnapshot` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | Kèm `deviceId` — chỉ máy đã đăng ký |

**Function description**

> - Trả GD còn 残 trong tối đa 7 業務日 + người mua (số, tên) + `snapshotAt`, `businessDate`; không có giá / tiền. PWA ghi đè snapshot cũ trong IndexedDB.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `snapshotAt` | Hiện ở SC-06-02 [16] khi offline |

### 2.3. `recordDeliveries`

| Return type | Function name |
|---|---|
| `Promise<Result<{ results: DeliveryResult[] }>>` | `recordDeliveries` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | |
| `{ items: DeliveryItem[]; receiver: Receiver; deviceRecordedAt: string }` | `input` | `DeliveryItem = { tradeId; qty?; isRemainingAll; clientRecordId }` |

**Function description**

> - Một transaction gọi `fn_delivery_record` cho từng item (DEL_RECORD §4.2–4.5); idempotent theo `clientRecordId`.
> - Lỗi: `E-DEL-003..010`, `E-DEL-027`, `E-CMN-003`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `allReplayed` | Mọi item đã ghi trước đó → trả 200 thay vì 201 |

### 2.4. `enqueueOfflineDelivery` (PWA)

| Return type | Function name |
|---|---|
| `Promise<{ clientRecordId: string; pendingCount: number }>` | `enqueueOfflineDelivery` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `DeliveryItem & { receiver: Receiver }` | `record` | Bản ghi một GD |
| `{ deviceId: string; capturedBy: string; capturedAt: string }` | `meta` | `capturedBy` = người đang dùng (PIN offline — ADR-008 §2.3) |

**Function description**

> - Validate với 残 cục bộ (snapshot − hàng đợi), lưu IndexedDB, tăng số C-28. Không gọi mạng. Gửi lên do module `sync` đảm nhận (cùng `clientRecordId`).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `number` | `localRemaining` | Chặn vượt 残 ngay trên máy (`E-DEL-005`) |

### 2.5. `registerException`

| Return type | Function name |
|---|---|
| `Promise<Result<{ exception: DeliveryException; adjustmentCreated: boolean; correctionRequired: boolean; amountDeltaJpy: number }>>` | `registerException` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | |
| `ExceptionInput` | `input` | `tradeId`, `inputMode`, `exceptionCode`, `qty?`, `reasonCode`, `description?`, `receiver?`, `paper?`, `attachmentIds[]` |

**Function description**

> - Gọi `fn_delivery_exception_register` (DEL_EXCEPTION_DISPUTE §4.2–4.3). Ngày GD mở → ghi điều chỉnh `SAME_DAY`; đã khóa → `correctionRequired`.
> - Lỗi: `E-DEL-003`, `-004`, `-008`, `-011..018`, `-027`, `-028`, `E-CMN-003`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `dayLocked` | Chọn đường REVERSE / DELTA hay 修正申請 |

### 2.6. `listDisputes`

| Return type | Function name |
|---|---|
| `Promise<Result<DisputeRow[]>>` | `listDisputes` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | DEL-HEAD (thao tác) hoặc SETTLE / STL-HEAD / OPS-HEAD (đọc) |
| `{ scope: 'confirmable' \| 'all' }` | `query` | `confirmable` loại dòng do người xem ghi |

**Function description**

> - Đọc `delivery_exceptions` `is_dispute = true`, `status = OPEN` + phiếu giấy + `canConfirm`, `isSigner`, `amountPreview`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `canConfirm` | false khi người xem là người ghi (PRM-111) hoặc không có quyền DEL_HEAD |

### 2.7. `confirmDispute`

| Return type | Function name |
|---|---|
| `Promise<Result<{ confirmation: DisputeConfirmation; exceptionStatus: 'OPEN' \| 'RESOLVED'; adjustmentCreated: boolean; correctionRequired: boolean }>>` | `confirmDispute` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | MFA còn hiệu lực |
| `string` | `exceptionId` | |
| `{ conclusion: 'COMPLETED' \| 'PARTIAL_RETURN' \| 'CONTINUE_DISPUTE'; returnQty?: number; comment?: string; signerAbsentReason?: string; scanViewedAt?: string }` | `input` | |

**Function description**

> - Kiểm MFA rồi gọi `fn_dispute_confirm` (DEL_EXCEPTION_DISPUTE §4.4–4.5).
> - Lỗi: `E-DEL-019..026`, `E-DEL-028`, `E-CMN-005`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `actingForSigner` | Ghi audit "xác nhận thay người ký giấy" |

---

## 3. Danh mục mã lỗi `E-DEL`

| Mã | HTTP | Thông điệp (JP) | Nghĩa (VI) | Dùng ở |
|---|---|---|---|---|
| E-DEL-001 | 422 | 買受人番号を入力してください | Thiếu 買受人番号 | SC-06-02 [1]; API-DEL-001 |
| E-DEL-002 | 404 | 該当する買受人が見つかりません | Không thấy người mua | [1]; API-DEL-001 |
| E-DEL-003 | 422 | 数量を入力してください（0より大きい値） | Thiếu / sai SL | [8]; SC-06-04 [7]; API-DEL-003, -004 |
| E-DEL-004 | 422 | kg は小数点以下1桁まで、箱・尾は整数で入力してください | Số lẻ sai đơn vị | [8]; API-DEL-003, -004, -006 |
| E-DEL-005 | 409 | 残数量（{残}{単位}）を超えています | Vượt 残 | [8]; API-DEL-003 |
| E-DEL-006 | 422 | 受取人（本人／代理）を選んでください | Chưa chọn người nhận | [11]; API-DEL-003 |
| E-DEL-007 | 422 | 代理の場合は受取人の氏名を入力してください（50文字以内） | Thiếu tên người nhận thay | 11.1; API-DEL-003, -004 |
| E-DEL-008 | 409 | この取引は確定していないため引渡しできません | GD chưa 確定 / đã 取消 | API-DEL-003, -004 |
| E-DEL-009 | 409 | この取引は引渡しが完了しています | GD đã giao hết | API-DEL-003 |
| E-DEL-010 | 409 | 同じ記録IDで異なる内容が送信されました | Trùng `clientRecordId` khác nội dung | API-DEL-003 |
| E-DEL-011 | 422 | 例外の種類を選んでください | Thiếu loại ngoại lệ | SC-06-04 [6]; API-DEL-004 |
| E-DEL-012 | 422 | 理由を選んでください | Thiếu lý do | [8]; API-DEL-004 |
| E-DEL-013 | 422 | 争いありの場合は内容を入力してください（500文字以内） | Thiếu nội dung tranh chấp | [9]; API-DEL-004 |
| E-DEL-014 | 409 | この確認票番号は既に登録されています | Số phiếu giấy đã dùng | [3]; API-DEL-004 |
| E-DEL-015 | 422 | 紙で確認した時刻は業務日内・現在時刻以前で入力してください | Giờ trên phiếu sai | [4]; API-DEL-004 |
| E-DEL-016 | 422 | 記録者本人は確認できません | Người ký giấy = người ghi | [5]; API-DEL-004 |
| E-DEL-017 | 422 | 後入力の場合は確認票のスキャンを添付してください | Thiếu scan khi 後入力 | [11]; API-DEL-004 |
| E-DEL-018 | 422 | 署名した配送部門責任者の社員番号が正しくありません | Người ký không phải DEL_HEAD | [5]; API-DEL-004 |
| E-DEL-019 | 403 | 自分の記録のため確認できません | Tự xác nhận (PRM-111) | SC-06-05 [9]; API-DEL-006 |
| E-DEL-020 | 422 | 結論を選んでください | Thiếu kết luận | [7]; API-DEL-006 |
| E-DEL-021 | 422 | 継続協議の場合はコメントを入力してください | Thiếu bình luận 継続協議 | [8]; API-DEL-006 |
| E-DEL-022 | 422 | 署名者に代わって確認する場合は理由を入力してください | Thiếu lý do xác nhận thay | 8.1; API-DEL-006 |
| E-DEL-023 | 422 | スキャンを表示して確認してから確定してください | Chưa mở scan | [6]; API-DEL-006 |
| E-DEL-024 | 409 | この争いは既に確認済みです | Đã được xác nhận | API-DEL-006 |
| E-DEL-025 | 404 | 例外が見つかりません | Không thấy ngoại lệ | API-DEL-006 |
| E-DEL-026 | 422 | 返品数量を入力してください | Thiếu SL trả | 11.1; API-DEL-006 |
| E-DEL-027 | 404 | 取引が見つかりません | Không thấy GD | API-DEL-001, -003, -004 |
| E-DEL-028 | 409 | 数量が対象の範囲を超えています（上限 {n}{単位}） | SL ngoại lệ / trả vượt phạm vi | SC-06-04 [7]; 11.1; API-DEL-004, -006 |
| E-DEL-029 | 422 | PDF・JPEG・PNG（10MB以下）を添付してください | File đính kèm sai loại / cỡ | SC-06-04 [11] (API attachments chung) |
| E-DEL-030 | 422 | 確認票番号を入力してください | Thiếu số phiếu giấy | [3]; API-DEL-004 |

Mã chung `E-CMN-001..008` (thông điệp JP một bản, HTTP, cách client xử lý): [`_common/error-codes.md`](../../_common/error-codes.md). Body lỗi, MFA, khóa lạc quan: [`_common/api-conventions.md`](../../_common/api-conventions.md).
