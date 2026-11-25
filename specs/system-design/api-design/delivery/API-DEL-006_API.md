---
id: SPEC-DEL_API-006
title: 配送部門責任者 xác nhận / kết luận tranh chấp (MFA)
type: system
subtype: api-design
api_id: API-DEL-006
endpoint: /api/v1/delivery-exceptions/{exceptionId}/confirmation
method: POST
media_type: application/json
feature: delivery
screen_id: [SC-06-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-06-05-001, SPEC-DEL_EXCEPTION_DISPUTE-001, SPEC-TRADE_DB-001, CAP-HUMAN-01]
---

# API-DEL-006 — POST /api/v1/delivery-exceptions/{exceptionId}/confirmation

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: `field` gốc; khách Q-DEL-07 / Q-DEL-08 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

Người quyết cuối (CAP-HUMAN-01) ghi kết luận cho một lần giao có tranh chấp: `COMPLETED`, `PARTIAL_RETURN` (có đổi tiền), `CONTINUE_DISPUTE` (chuyển 紛争). Bắt MFA; cấm tự xác nhận; phiếu giấy mà người xác nhận ≠ người ký → bắt lý do + đã mở scan.

**Xác thực:** Session cookie `sid` + CSRF (header `X-CSRF-Token`)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `exceptionId` | string | `x-31…` | UUID ngoại lệ |  |
| 2 | Body Parameters | `conclusion` | string | `PARTIAL_RETURN` | `COMPLETED` · `PARTIAL_RETURN` · `CONTINUE_DISPUTE` |  |
| 3 | Body Parameters | `returnQty` | string | `2.0` | Decimal > 0, ≤ 引渡済 | bắt buộc khi `PARTIAL_RETURN` mà ngoại lệ chưa có SL |
| 4 | Body Parameters | `comment` | string | `買受人と合意` | 0–500; 1–500 khi `CONTINUE_DISPUTE` | [optional] |
| 5 | Body Parameters | `signerAbsentReason` | string | `署名者が非番` | 1–200 | bắt buộc khi người gọi ≠ người ký giấy |
| 6 | Body Parameters | `scanViewedAt` | string | `2027-08-02T09:18:40+09:00` | Lúc mở scan | bắt buộc cùng `signerAbsentReason` |

Ví dụ body:

```json
{
  "conclusion": "PARTIAL_RETURN",
  "returnQty": "2.0",
  "comment": "鮮度不良分 2kg を返品として合意"
}
```

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã xác nhận | <pre>{<br>&nbsp;&nbsp;"confirmation": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "dc-9…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"conclusion": "PARTIAL_RETURN",<br>&nbsp;&nbsp;&nbsp;&nbsp;"confirmedBy": "桜 十郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;"mfaVerifiedAt": "2027-08-02T09:20:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;"paperConfirmedAt": "2027-08-02T07:05:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;"enteredAt": "2027-08-02T09:12:00+09:00"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"exceptionStatus": "RESOLVED",<br>&nbsp;&nbsp;"adjustmentCreated": true,<br>&nbsp;&nbsp;"correctionRequired": false,<br>&nbsp;&nbsp;"amountDeltaJpy": -5400<br>}</pre> | `CONTINUE_DISPUTE` → `exceptionStatus = OPEN`. Ba mốc giờ (紙で確認 / 入力 / システム確認) để màn hiện |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "conclusion" } }</pre> | `E-CMN-007` |
| 3 | 422 | Thiếu kết luận | <pre>{ "error": { "code": "E-DEL-020", "message": "結論を選んでください" } }</pre> | `E-DEL-020` |
| 4 | 422 | 継続協議 thiếu bình luận | <pre>{ "error": { "code": "E-DEL-021", "message": "継続協議の場合はコメントを入力してください" } }</pre> | `E-DEL-021` |
| 5 | 422 | Thiếu lý do xác nhận thay | <pre>{ "error": { "code": "E-DEL-022", "message": "署名者に代わって確認する場合は理由を入力してください" } }</pre> | `E-DEL-022` |
| 6 | 422 | Chưa mở scan | <pre>{ "error": { "code": "E-DEL-023", "message": "スキャンを表示して確認してから確定してください" } }</pre> | `E-DEL-023` |
| 7 | 422 | Thiếu SL trả | <pre>{ "error": { "code": "E-DEL-026", "message": "返品数量を入力してください" } }</pre> | `E-DEL-026` |
| 8 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 9 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 10 | 403 | Thiếu MFA step-up còn hiệu lực (ADR-002 §2.2) | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005` |
| 11 | 403 | Tự xác nhận (PRM-111) | <pre>{ "error": { "code": "E-DEL-019", "message": "自分の記録のため確認できません" } }</pre> | `E-DEL-019` |
| 12 | 404 | Không thấy ngoại lệ | <pre>{ "error": { "code": "E-DEL-025", "message": "例外が見つかりません" } }</pre> | `E-DEL-025` |
| 13 | 409 | Đã được xác nhận | <pre>{ "error": { "code": "E-DEL-024", "message": "この争いは既に確認済みです" } }</pre> | `E-DEL-024` |
| 14 | 409 | SL vượt phạm vi cho phép | <pre>{ "error": { "code": "E-DEL-028", "message": "数量が対象の範囲を超えています（上限 18kg）", "detail": { "max": "18" } } }</pre> | `E-DEL-028` |
| 15 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Quyền: `DEL_HEAD` hoặc 代行 đang hiệu lực; MFA step-up (PREMISE §3.2).
- Không chạy offline (không MFA offline — ADR-008 §2.3-10).
- Kết luận lưu ở `dispute_confirmations.conclusion`; 継続協議 ghi được nhiều lượt (unique partial) — TRADE_DB 0.2.1 §4.36 (Q-DEL-07).
- `PARTIAL_RETURN` ngày GD đã khóa → `correctionRequired = true`, màn dẫn sang SC-08-01.
- Q-DEL-08 đã trả lời [Customer giả lập, 2026-11-25] (có MFA). Q-DEL-07: nhu cầu báo cáo RPT-04 lọc 継続協議 + lịch sử từng lần họp (phụ thuộc `report`).
- **Câu hỏi mở / TBD:** không có
