---
id: SPEC-DEL_API-001
title: Danh sách GD chờ giao của một người mua (hoặc một GD)
type: system
subtype: api-design
api_id: API-DEL-001
endpoint: /api/v1/deliveries/pending
method: GET
media_type: application/json
feature: delivery
screen_id: [SC-06-02, SC-06-04]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-06-02-001, SPEC-SC-06-04-001, SPEC-DELIVERY_FUNC-001]
---

# API-DEL-001 — GET /api/v1/deliveries/pending

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Trả các GD `CONFIRMED` còn 残 > 0 của một người mua — gồm GD của ngày trước (前日残) — cho SC-06-02 khi online; hoặc một GD theo `tradeId` cho SC-06-04 (kèm trạng thái khóa ngày của GD để chọn đường tiền). 残 tính từ SL hiệu lực sau điều chỉnh.

**Xác thực:** Session cookie `sid` (đọc — không cần CSRF)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Query Parameters | `buyerNo` | string | `N01` | `^[NB][0-9]{1,10}$`; bắt buộc nếu không có `tradeId` | [optional] |
| 2 | Query Parameters | `tradeId` | string | `t-0005…` | UUID GD | [optional]; một trong hai bắt buộc |

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Thành công | <pre>{<br>&nbsp;&nbsp;"buyer": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name": "サンプル仲卸1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"pendingCount": 3,<br>&nbsp;&nbsp;&nbsp;&nbsp;"carryOverCount": 1<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"trades": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeId": "t-0005…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeNo": "相対-0005",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"channel": "AITAI",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemName": "鰹",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unit": "KG",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"confirmedQty": 30.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deliveredQty": 12.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"remainingQty": 18.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"status": "IN_PROGRESS",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isCarryOver": false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"businessDate": "2027-08-02",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"businessDateLocked": false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unitPriceJpy": 2700,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"hasOpenException": false<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> | `status`: `WAITING` 待機中 · `IN_PROGRESS` 引渡し中 · `COMPLETED` 完了 · `EXCEPTION` 例外. Sắp xếp: ngày hiện tại trước (theo `tradeNo`), rồi 前日残. `unitPriceJpy`, `businessDateLocked` dùng cho SC-06-04 [12]. Danh sách rỗng → `trades: []` (màn hiện C-21) |
| 2 | 422 | Thiếu cả `buyerNo` và `tradeId` | <pre>{ "error": { "code": "E-DEL-001", "message": "買受人番号を入力してください" } }</pre> | `E-DEL-001` |
| 3 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "field": "message" } } }</pre> | `E-CMN-007` |
| 4 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 5 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 6 | 404 | Không thấy người mua | <pre>{ "error": { "code": "E-DEL-002", "message": "該当する買受人が見つかりません", "detail": { "buyerNo": "N99" } } }</pre> | `E-DEL-002` |
| 7 | 404 | Không tìm thấy GD | <pre>{ "error": { "code": "E-DEL-027", "message": "取引が見つかりません" } }</pre> | `E-DEL-027` |
| 8 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Vai: DELIVERY, DEL-HEAD.
- Đọc `v_delivery_status` + `v_trade_effective` (`security_invoker`).
- p95 ≤ 1 giây (NFR-PERF-01).
- **Câu hỏi mở / TBD:** không có
