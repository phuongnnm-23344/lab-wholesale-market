---
id: SPEC-TRD_API-008
title: 当日訂正 / 取消 GD (ngày chưa khóa)
type: system
subtype: api-design
api_id: API-TRD-008
endpoint: /api/v1/trades/{tradeId}/fixes
method: POST
media_type: application/json
feature: trade
screen_id: [SC-04-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [WF-SC-04-05, SPEC-TRADE_FUNC-001, SPEC-TRADE_SAME_DAY_FIX-001]
---

# API-TRD-008 — POST /api/v1/trades/{tradeId}/fixes

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Sửa (`FIX`) hoặc hủy (`CANCEL`) một GD đã 確定 của 業務日 **chưa khóa** từ SC-04-05: có lý do, không duyệt 2 cấp; GD gốc không bị ghi đè — sinh `trade_fixes` + REVERSE / DELTA + dòng sổ SL. Ngày đã khóa → 423, client mang nội dung sang SC-08-01. Xử lý: [TRADE_SAME_DAY_FIX_TECH](../../../trade/technical-design/TRADE_SAME_DAY_FIX_TECH.md).

**Xác thực:** Session cookie. Vai: TRADE. Không MFA. Bắt buộc online.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `tradeId` | string | `d4e5f6a7-0000-4000-8000-000000000005` | UUID GD gốc | |
| 2 | Body Parameters | `kind` | string | `FIX` | `FIX` · `CANCEL` | |
| 3 | Body Parameters | `buyerId` | string | `a1b2…00n5` | Người mua sau sửa; không gửi = giữ | `[optional]` bỏ qua khi `CANCEL` |
| 4 | Body Parameters | `qty` | number | `28.0` | SL sau sửa; > 0, ≥ SL đã giao, số lẻ theo đơn vị | `[optional]` |
| 5 | Body Parameters | `unitPriceJpy` | Integer | `2700` | Đơn giá sau sửa ≥ 1 | `[optional]` |
| 6 | Body Parameters | `reasonCode` | string | `WEIGHING_ERROR` | `FIX_REASON`: `WEIGHING_ERROR` 計量の誤り · `BUYER_MISTAKE` 買受人の取り違え · `PRICE_ERROR` 単価の誤り · `OTHER` その他 | |
| 7 | Body Parameters | `reasonNote` | string | `再計量` | ≤ 200; bắt buộc khi `OTHER` | `[optional]` |
| 8 | Body Parameters | `overLimitReasonCode` | string | `PRIOR_CONSENT` | Khi người mua mới / tiền mới vượt 参加上限 (売買参加者) | `[optional]` |
| 9 | Body Parameters | `overLimitNote` | string | | ≤ 200 | `[optional]` |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | Đã ghi | <pre>{<br>  "fixId": "c0ffee00-0000-4000-8000-000000000001",<br>  "kind": "FIX",<br>  "displayNo": "相対-0005",<br>  "adjustments": [<br>    { "kind": "REVERSE", "buyerNo": "N05", "qtyDelta": -30.0, "amountDeltaJpy": -81000 },<br>    { "kind": "DELTA", "buyerNo": "N05", "qtyDelta": 28.0, "amountDeltaJpy": 75600 }<br>  ],<br>  "maxBuyerDiffInclJpy": 5832,<br>  "buyerChanged": false,<br>  "needsSettleReview": false<br>}</pre> | `needsSettleReview = true` → màn hiện 「この訂正は締め前に照合部門が確認します」 |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Không có vai TRADE | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | GD không tồn tại | <pre>{ "error": { "code": "E-TRD-023", "message": "対象の取引が見つかりません" } }</pre> | |
| 5 | 409 | Không sửa được theo trạng thái | <pre>{ "error": { "code": "E-TRD-026", "message": "引渡済のため取り消せません。差異は例外登録で処理してください" } }</pre> | Mã có thể: `E-TRD-002`, `019`, `022`, `026`, `027`, `E-CMN-006` |
| 6 | 422 | Dữ liệu / tư cách sai | <pre>{ "error": { "code": "E-TRD-006", "message": "売買参加者の承認が有効ではないため確定できません（一時停止・有効期限 2028/03/31）", "field": "buyerId" } }</pre> | Mã có thể: `E-TRD-003`..`011`, `020`, `021`, `E-CMN-007` |
| 7 | 423 | 業務日 của GD đã khóa | <pre>{ "error": { "code": "E-CMN-003", "message": "2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。" } }</pre> | Client **giữ nội dung**, nút 「修正申請として提出 →」 điền sẵn SC-08-01 (khách #5) |
| 8 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- SC-04-05 chỉ có wireframe (L4-D02); API thiết kế ở đây vì logic thuộc feature trade.
- Sau 201 client gọi API-TRD-004 in lại phiếu có 「訂正」 / 「取消」.
- **Câu hỏi mở / TBD:** Q-LOT-05 (lô `CLOSED` mở bán lại khi có SL trả về).
