---
id: SPEC-DEL_API-003
title: Ghi một hoặc nhiều lần giao (idempotent)
type: system
subtype: api-design
api_id: API-DEL-003
endpoint: /api/v1/deliveries
method: POST
media_type: application/json
feature: delivery
screen_id: [SC-06-02]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-06-02-001, SPEC-DEL_RECORD-001, SPEC-TRADE_DB-001]
---

# API-DEL-003 — POST /api/v1/deliveries

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Ghi lần giao cho một GD, hoặc nhiều GD cùng người mua (nút 「残りをすべて引渡し」) trong **một transaction**. Idempotent theo `clientRecordId` từng item: gửi lại cùng nội dung → trả kết quả cũ (200), không ghi đôi. Đường đồng bộ offline của module `sync` dùng cùng hàm DB `fn_delivery_record`.

**Xác thực:** Session cookie `sid` + CSRF (header `X-CSRF-Token`)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Header Parameters | `X-Device-Id` | string | `TAB-03` | Mã thiết bị |  |
| 2 | Body Parameters | `items[].tradeId` | string | `t-0005…` | UUID GD; 1–20 item |  |
| 3 | Body Parameters | `items[].qty` | string | `6.0` | Decimal > 0; `KG` ≤ 1 chữ số lẻ, `CASE` / `PIECE` nguyên | bắt buộc khi `isRemainingAll = false` |
| 4 | Body Parameters | `items[].isRemainingAll` | boolean | `false` | `true` = giao hết phần còn lại (server tự lấy 残) |  |
| 5 | Body Parameters | `items[].clientRecordId` | string | `0b9c6f3e-…` | UUID v4 sinh trên máy — khóa idempotent |  |
| 6 | Body Parameters | `receiver.type` | string | `SELF` | `SELF` 本人 · `PROXY` 代理 |  |
| 7 | Body Parameters | `receiver.name` | string | `代理 太郎` | 1–50 | bắt buộc khi `PROXY` |
| 8 | Body Parameters | `deviceRecordedAt` | string | `2027-08-02T07:15:22+09:00` | Giờ trên máy lúc bấm |  |

Ví dụ body:

```json
{
  "items": [
    {
      "tradeId": "t-0005…",
      "qty": "6.0",
      "isRemainingAll": false,
      "clientRecordId": "0b9c6f3e-2a51-4f0e-9d3c-1f2b7c8e9a10"
    }
  ],
  "receiver": {
    "type": "SELF"
  },
  "deviceRecordedAt": "2027-08-02T07:15:22+09:00"
}
```

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | Đã ghi (200 nếu mọi item là gửi lại) | <pre>{<br>&nbsp;&nbsp;"results": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"clientRecordId": "0b9c6f3e-…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deliveryId": "d-88…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeId": "t-0005…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qtyDelivered": 6.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deliveredTotal": 18.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"remaining": 12.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"status": "IN_PROGRESS",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"replayed": false<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> | `status` như API-DEL-001; `remaining = 0` → `COMPLETED`. `replayed = true` khi item đã ghi trước đó |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "field": "message" } } }</pre> | `E-CMN-007` |
| 3 | 422 | Thiếu / sai SL | <pre>{ "error": { "code": "E-DEL-003", "message": "数量を入力してください（0より大きい値）", "detail": { "items[0].qty": "required" } } }</pre> | `E-DEL-003` |
| 4 | 422 | Số lẻ sai đơn vị | <pre>{ "error": { "code": "E-DEL-004", "message": "kg は小数点以下1桁まで、箱・尾は整数で入力してください", "detail": { "unit": "CASE" } } }</pre> | `E-DEL-004` |
| 5 | 422 | Thiếu người nhận | <pre>{ "error": { "code": "E-DEL-006", "message": "受取人（本人／代理）を選んでください" } }</pre> | `E-DEL-006` |
| 6 | 422 | Thiếu tên 代理 | <pre>{ "error": { "code": "E-DEL-007", "message": "代理の場合は受取人の氏名を入力してください（50文字以内）" } }</pre> | `E-DEL-007` |
| 7 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 8 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 9 | 404 | Không tìm thấy GD | <pre>{ "error": { "code": "E-DEL-027", "message": "取引が見つかりません" } }</pre> | `E-DEL-027` |
| 10 | 409 | Vượt 残 (có thể vì tablet khác vừa giao) | <pre>{ "error": { "code": "E-DEL-005", "message": "残数量（12kg）を超えています", "detail": { "tradeId": "t-0005…", "remaining": "12.0" } } }</pre> | `E-DEL-005` |
| 11 | 409 | GD chưa 確定 / đã 取消 | <pre>{ "error": { "code": "E-DEL-008", "message": "この取引は確定していないため引渡しできません", "detail": { "tradeNo": "相対-0005" } } }</pre> | `E-DEL-008` |
| 12 | 409 | GD đã giao hết | <pre>{ "error": { "code": "E-DEL-009", "message": "この取引は引渡しが完了しています" } }</pre> | `E-DEL-009` |
| 13 | 409 | Cùng `clientRecordId` khác nội dung | <pre>{ "error": { "code": "E-DEL-010", "message": "同じ記録IDで異なる内容が送信されました", "detail": { "clientRecordId": "0b9c6f3e-…" } } }</pre> | `E-DEL-010` |
| 14 | 423 | 業務日 đích đã khóa (`DAY_LOCKED`) — màn hiện C-24 | <pre>{ "error": { "code": "E-CMN-003", "message": "{ date } は締め済みのため直接修正できません。訂正は修正申請で行います", "detail": { "businessDate": "2027-08-02" } } }</pre> | `E-CMN-003` |
| 15 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Vai: DELIVERY, DEL-HEAD. Không MFA (PREMISE §3.2 — ghi giao thường không hỏi).
- Nhiều item: lỗi một item → không ghi item nào; `error_extra` chỉ ra item lỗi.
- Timeout phía client → gửi lại **cùng** `clientRecordId` (hoặc xếp hàng đợi offline) — an toàn nhờ idempotent.
- `business_date` do server xác định (ADR-005 §2.3); GD ngày trước ghi vào ngày hiện tại.
- **Câu hỏi mở / TBD:** không có
