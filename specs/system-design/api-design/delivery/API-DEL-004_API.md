---
id: SPEC-DEL_API-004
title: Ghi ngoại lệ giao / tranh chấp (gồm nhập bù phiếu giấy)
type: system
subtype: api-design
api_id: API-DEL-004
endpoint: /api/v1/delivery-exceptions
method: POST
media_type: application/json
feature: delivery
screen_id: [SC-06-04]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-06-04-001, SPEC-DEL_EXCEPTION_DISPUTE-001, SPEC-TRADE_DB-001, SPEC-ADJUST_DB-001]
---

# API-DEL-004 — POST /api/v1/delivery-exceptions

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: `field` gốc; khách Q-DEL-01 (không ghi offline), Q-DEL-04 (chỉ SL thực giao, không trường giá / tiền) | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

Ghi ngoại lệ khi giao (不足 / 過剰 / 返品 / 一部取消 / 争いあり). Ngoại lệ đổi tiền: ngày GD chưa khóa → ghi REVERSE / DELTA (`SAME_DAY`) và đưa vào 要確認 của 照合; ngày GD đã khóa → không ghi điều chỉnh, trả `correctionRequired = true` để màn dẫn sang 修正申請. Chế độ `PAPER_LATE` nhập bù phiếu 争いのある引渡し確認票 đã ký tay khi mất mạng.

**Xác thực:** Session cookie `sid` + CSRF (header `X-CSRF-Token`)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Body Parameters | `tradeId` | string | `t-0005…` | UUID GD `CONFIRMED` |  |
| 2 | Body Parameters | `deliveryId` | string | `d-88…` | Lần giao liên quan | [optional] |
| 3 | Body Parameters | `inputMode` | string | `ON_SITE` | `ON_SITE` 現場 · `PAPER_LATE` 紙→後入力 |  |
| 4 | Body Parameters | `exceptionCode` | string | `SHORTAGE` | `code_values.DELIVERY_EXCEPTION`: `SHORTAGE` 不足 · `EXCESS` 過剰 · `RETURN` 返品 · `PARTIAL_CANCEL` 一部取消 · `DISPUTE` 争いあり |  |
| 5 | Body Parameters | `qty` | string | `2.0` | Decimal > 0, theo đơn vị GD | bắt buộc trừ `DISPUTE` |
| 6 | Body Parameters | `reasonCode` | string | `FRESHNESS` | `code_values` lý do theo loại |  |
| 7 | Body Parameters | `description` | string | `鮮度不良の申し出` | 0–500; 1–500 khi `DISPUTE` | [optional] trừ `DISPUTE` |
| 8 | Body Parameters | `receiver` | object | `{"type":"SELF"}` | Như API-DEL-003 | [optional] |
| 9 | Body Parameters | `paper.formNo` | string | `D-000123` | 1–20, duy nhất | bắt buộc khi `PAPER_LATE` |
| 10 | Body Parameters | `paper.signedAt` | string | `2027-08-02T07:05:00+09:00` | Trong 業務日, ≤ now | bắt buộc khi `PAPER_LATE` |
| 11 | Body Parameters | `paper.signerEmployeeNo` | string | `E1203` | 社員番号 DEL_HEAD ≠ người ghi | bắt buộc khi `PAPER_LATE` + `DISPUTE` |
| 12 | Body Parameters | `attachmentIds` | string[] | `["att-1…"]` | Đã upload qua API chung, `doc_class = DISPUTE_EVIDENCE` | bắt buộc ≥ 1 khi `PAPER_LATE` |

Ví dụ body:

```json
{
  "tradeId": "t-0005…",
  "inputMode": "ON_SITE",
  "exceptionCode": "SHORTAGE",
  "qty": "2.0",
  "reasonCode": "SHORT_LOAD",
  "receiver": {
    "type": "SELF"
  }
}
```

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | Đã ghi | <pre>{<br>&nbsp;&nbsp;"exception": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "x-31…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "OPEN",<br>&nbsp;&nbsp;&nbsp;&nbsp;"isDispute": false,<br>&nbsp;&nbsp;&nbsp;&nbsp;"affectsAmount": true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"slaDueAt": null<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"adjustmentCreated": true,<br>&nbsp;&nbsp;"correctionRequired": false,<br>&nbsp;&nbsp;"amountDeltaJpy": -5400<br>}</pre> | `adjustmentCreated`: đã ghi REVERSE / DELTA (ngày GD mở). `correctionRequired`: đổi tiền nhưng ngày GD đã khóa → màn hiện nút → SC-08-01. Tranh chấp: `isDispute = true`, `slaDueAt` theo SLA (PRM-048) |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "tradeId" } }</pre> | `E-CMN-007` |
| 3 | 422 | Thiếu loại / lý do | <pre>{ "error": { "code": "E-DEL-011", "message": "例外の種類を選んでください" } }</pre> | `E-DEL-011` |
| 4 | 422 | Thiếu SL | <pre>{ "error": { "code": "E-DEL-003", "message": "数量を入力してください（0より大きい値）" } }</pre> | `E-DEL-003` |
| 5 | 422 | Số lẻ sai đơn vị | <pre>{ "error": { "code": "E-DEL-004", "message": "kg は小数点以下1桁まで、箱・尾は整数で入力してください", "detail": { "unit": "CASE" } } }</pre> | `E-DEL-004` |
| 6 | 422 | Tranh chấp thiếu nội dung | <pre>{ "error": { "code": "E-DEL-013", "message": "争いありの場合は内容を入力してください（500文字以内）" } }</pre> | `E-DEL-013` |
| 7 | 422 | Giờ trên phiếu sai | <pre>{ "error": { "code": "E-DEL-015", "message": "紙で確認した時刻は業務日内・現在時刻以前で入力してください" } }</pre> | `E-DEL-015` |
| 8 | 422 | Người ký = người ghi | <pre>{ "error": { "code": "E-DEL-016", "message": "記録者本人は確認できません" } }</pre> | `E-DEL-016` |
| 9 | 422 | Thiếu scan khi 後入力 | <pre>{ "error": { "code": "E-DEL-017", "message": "後入力の場合は確認票のスキャンを添付してください" } }</pre> | `E-DEL-017` |
| 10 | 422 | Người ký không phải 配送部門責任者 | <pre>{ "error": { "code": "E-DEL-018", "message": "署名した配送部門責任者の社員番号が正しくありません", "detail": { "signerEmployeeNo": "E9999" } } }</pre> | `E-DEL-018` |
| 11 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 12 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 13 | 404 | Không tìm thấy GD | <pre>{ "error": { "code": "E-DEL-027", "message": "取引が見つかりません" } }</pre> | `E-DEL-027` |
| 14 | 409 | GD chưa 確定 / đã 取消 | <pre>{ "error": { "code": "E-DEL-008", "message": "この取引は確定していないため引渡しできません", "detail": { "tradeNo": "相対-0005" } } }</pre> | `E-DEL-008` |
| 15 | 409 | Số phiếu giấy đã dùng | <pre>{ "error": { "code": "E-DEL-014", "message": "この確認票番号は既に登録されています", "detail": { "formNo": "D-000123" } } }</pre> | `E-DEL-014` |
| 16 | 409 | SL vượt phạm vi cho phép | <pre>{ "error": { "code": "E-DEL-028", "message": "数量が対象の範囲を超えています（上限 18kg）", "detail": { "max": "18" } } }</pre> | `E-DEL-028` |
| 17 | 423 | 業務日 đích đã khóa (`DAY_LOCKED`) — màn hiện C-24 | <pre>{ "error": { "code": "E-CMN-003", "message": "{ date } は締め済みのため直接修正できません。訂正は修正申請で行います", "detail": { "businessDate": "2027-08-02" } } }</pre> | `E-CMN-003` |
| 18 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Vai: DELIVERY, DEL-HEAD. Không MFA ở bước ghi.
- Không chạy offline (Q-DEL-01 [Customer giả lập, 2026-11-25]; ADR-008 §2.1): mất mạng → 引渡し確認票 giấy có số thứ tự, nhập bù bằng API này (`inputMode = PAPER_LATE`) trong ngày, trước 日次締め.
- Không có tham số giá / tiền: tiền điều chỉnh = −floor(`qty` × đơn giá đã chốt), chỉ hướng giảm (Q-DEL-04).
- Ghi `trade_fixes` từ vai DELIVERY: khách đồng ý có điều kiện (Q-DEL-04 [Customer giả lập, 2026-11-25]); nối ngoại lệ ↔ `trade_fixes` bằng `delivery_exceptions.fix_id` (TRADE_DB 0.2.1 §4.35, Q-DEL-09); ADR-004 0.2.1 §2.2.
- Upload file dùng API đính kèm chung (chưa đặc tả — DEP-03 ở [`specs/_index.md`](../../../_index.md); đề xuất ở [`_common/api-list.md`](../../../_common/api-list.md) §4).
- Q-DEL-01, Q-DEL-04, Q-DEL-05, Q-DEL-06, Q-DEL-09 đã trả lời [Customer giả lập, 2026-11-25].
- **Câu hỏi mở / TBD:** không có
