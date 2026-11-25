---
id: SPEC-TRD_API-005
title: Lấy phiên せり để xác nhận (kèm đánh giá trước từng dòng)
type: system
subtype: api-design
api_id: API-TRD-005
endpoint: /api/v1/seri-sessions/{sessionId}
method: GET
media_type: application/json
feature: trade
screen_id: [SC-05-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-05-02-001, SPEC-TRADE_FUNC-001, SPEC-TRADE_SERI_CONFIRM-001]
---

# API-TRD-005 — GET /api/v1/seri-sessions/{sessionId}

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Khách Q-TRD-02 (税込 / 税抜), Q-TRD-05 (dòng 確定不可 chờ chọn 差し戻し / 取消) | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

Trả phiên せり và các dòng kết quả cho SC-05-02. Với dòng `PENDING`, server **đánh giá trước** (không ghi, không khóa) theo thứ tự `no`: tư cách 許可 / 承認 hiện hành, SL lô, 参加上限 cộng dồn theo người mua (chỉ 売買参加者) — để màn chọn sẵn và hiện [4], [5]. Kết quả cuối do API-TRD-006. Function: [TRADE_FUNC 2.7](../../../trade/function-specifications/TRADE_FUNC.md#27-getserisessionforconfirm).

**Xác thực:** Session cookie. Vai: TRADE; SETTLE, STL-HEAD, OPS-HEAD (chỉ đọc).

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `sessionId` | string | `e7f8a9b0-0000-4000-8000-000000000003` | UUID phiên | |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "session": {<br>    "sessionId": "e7f8a9b0-0000-4000-8000-000000000003",<br>    "sessionNo": 3,<br>    "businessDate": "2027-08-02",<br>    "status": "ENTERING",<br>    "enteredByName": "桜 三郎",<br>    "submittedAt": "2027-08-02T03:40:00+09:00",<br>    "confirmedByName": null,<br>    "confirmedAt": null,<br>    "samePersonReason": null<br>  },<br>  "viewerIsEntrant": false,<br>  "canConfirm": true,<br>  "rows": [<br>    {<br>      "tradeId": "f0000000-0000-4000-8000-000000000302",<br>      "no": 2,<br>      "displayNo": "せり-0302",<br>      "status": "PENDING",<br>      "lotNo": "L20270802-22",<br>      "itemName": "鰤",<br>      "qty": 35.0,<br>      "unit": "KG",<br>      "unitPriceJpy": 850,<br>      "amountJpy": 29750,<br>      "buyer": { "buyerNo": "B07", "name": "サンプル売買参加者7", "kind": "BAIBAI" },<br>      "qualification": { "basis": "SHONIN", "status": "VALID", "validTo": "2028-03-31" },<br>      "confirmable": true,<br>      "notConfirmableReason": null,<br>      "overLimit": { "limitJpy": 3000000, "usedBeforeInclJpy": 2989440, "cumulativeInclJpy": 3021570, "cumulativeExclJpy": 2797750, "isOver": true }<br>    }<br>  ],<br>  "overLimitReasonOptions": [<br>    { "code": "PRIOR_CONSENT", "label": "事前了承済", "key": "1" },<br>    { "code": "DEPOSIT_TOPUP", "label": "保証金追加予定", "key": "2" },<br>    { "code": "OTHER", "label": "その他", "key": "3", "noteRequired": true }<br>  ]<br>}</pre> | `notConfirmableReason`: `QUALIFICATION_INVALID` · `INSUFFICIENT_QTY` · `LOT_NOT_ON_SALE` · `null`. `overLimit` = `null` với 仲卸; số tiền so hạn mức là **税込** (Q-TRD-02): `usedBeforeInclJpy` = 税込 đã 確定 trong kỳ trước phiên, `cumulativeInclJpy` = 税込 cộng dồn tới dòng này theo `No`, `cumulativeExclJpy` = cùng số 税抜. `canConfirm` = vai TRADE và phiên `ENTERING`. `rows` gồm cả dòng `DRAFT` (đang 差し戻し), `CONFIRMED`, `CANCELLED` để đọc |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Vai không được đọc | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | Phiên không tồn tại | <pre>{ "error": { "code": "E-TRD-024", "message": "対象のせりの回が見つかりません" } }</pre> | |
| 5 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- Đánh giá trước không khóa lô → có thể lệch với lúc bấm; API-TRD-006 trả 409 `E-TRD-018` khi lệch.
- Q-TRD-05 đã trả lời: dòng `confirmable = false` hiện hai nút 差し戻し（番号誤り） / 取消（資格なし・不成立） ở SC-05-02, không tự hủy. **Câu hỏi mở / TBD:** Q-TRD-04.
