---
id: SPEC-DEL_API-005
title: Danh sách tranh chấp chờ 配送部門責任者 xác nhận
type: system
subtype: api-design
api_id: API-DEL-005
endpoint: /api/v1/delivery-exceptions/disputes
method: GET
media_type: application/json
feature: delivery
screen_id: [SC-06-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-06-05-001, SPEC-DEL_EXCEPTION_DISPUTE-001]
---

# API-DEL-005 — GET /api/v1/delivery-exceptions/disputes

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Trả các ngoại lệ `is_dispute = true`, `status = OPEN` cho SC-06-05, kèm chi tiết phiếu giấy, người ghi, SLA và cờ người xem có được xác nhận không (cấm tự xác nhận — PRM-111).

**Xác thực:** Session cookie `sid` (đọc — không cần CSRF)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Query Parameters | `scope` | string | `confirmable` | `confirmable` (mặc định — loại dòng người xem ghi) · `all` | [optional] |

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Thành công | <pre>{<br>&nbsp;&nbsp;"items": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"exceptionId": "x-31…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"receivedAt": "2027-08-02T07:20:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeNo": "相対-0005",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description": "鮮度不良の申し出",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"recordedBy": "桜 次郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"inputMode": "PAPER_LATE",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"paper": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"formNo": "D-000123",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"signedAt": "2027-08-02T07:05:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"signerName": "桜 十郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"enteredAt": "2027-08-02T09:12:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"attachmentId": "att-1…"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qty": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"confirmed": 30.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"delivered": 12.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"exception": 2.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unit": "KG"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"slaDueAt": "2027-08-05T07:20:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"slaOverdue": false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"canConfirm": true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isSigner": false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"businessDateLocked": false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unitPriceJpy": 2700<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> | `canConfirm = false` khi người xem là người ghi / không có quyền DEL_HEAD. `isSigner`: người xem là người ký giấy (false → màn yêu cầu lý do + mở scan) |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "field": "message" } } }</pre> | `E-CMN-007` |
| 3 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 4 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 5 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Vai đọc: DEL-HEAD (thao tác), SETTLE / STL-HEAD / OPS-HEAD (chỉ đọc — `canConfirm = false`).
- Sắp xếp `slaDueAt` tăng dần (dòng quá SLA lên đầu).
- **Câu hỏi mở / TBD:** không có
