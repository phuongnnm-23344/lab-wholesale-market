---
id: SPEC-TRD_API-001
title: Tìm người mua kèm tư cách 許可 / 承認 và 参加上限
type: system
subtype: api-design
api_id: API-TRD-001
endpoint: /api/v1/trades/buyers
method: GET
media_type: application/json
feature: trade
screen_id: [SC-04-01, SC-04-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-04-01-001, SPEC-TRADE_FUNC-001, SPEC-TRADE_QUALIFICATION_CHECK-001]
---

# API-TRD-001 — GET /api/v1/trades/buyers

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Khách Q-TRD-02: trả hạn mức đã dùng cả 税込 / 税抜 (`usedInclJpy`, `usedExclJpy`, `taxRatePercent`) | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

Gợi ý người mua theo đầu 買受人番号 cho ô [3] SC-04-01 / [4] SC-04-05, kèm tư cách hiện hành **theo đúng căn cứ**: 仲卸 → `basis: "KYOKA"` (許可); 売買参加者 → `basis: "SHONIN"` (承認) + 参加上限 kỳ hiện tại (luật 2). Chỉ để hiển thị và mở trước hộp lý do; kiểm cuối ở lúc chốt (API-TRD-002). Function: [TRADE_FUNC 2.1](../../../trade/function-specifications/TRADE_FUNC.md#21-searchbuyers).

**Xác thực:** Session cookie. Vai: TRADE.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Query Parameters | `q` | string | `N01` | Đầu 買受人番号, 1–10, `^[A-Za-z0-9]+$` (server đổi hoa) | |
| 2 | Query Parameters | `limit` | Integer | `10` | 1–10, mặc định 10 | `[optional]` |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "periodKey": "2027-08",<br>  "buyers": [<br>    {<br>      "buyerId": "a1b2c3d4-0000-4000-8000-0000000000b3",<br>      "buyerNo": "B03",<br>      "name": "サンプル売買参加者3",<br>      "kind": "BAIBAI",<br>      "qualification": { "basis": "SHONIN", "status": "VALID", "validTo": "2028-03-31", "daysToExpiry": 242 },<br>      "participationLimit": { "limitJpy": 5000000, "usedInclJpy": 4989600, "usedExclJpy": 4620000, "remainingJpy": 10400, "taxRatePercent": 8 }<br>    },<br>    {<br>      "buyerId": "a1b2c3d4-0000-4000-8000-0000000000n1",<br>      "buyerNo": "N01",<br>      "name": "サンプル仲卸1",<br>      "kind": "NAKAOROSHI",<br>      "qualification": { "basis": "KYOKA", "status": "VALID", "validTo": "2028-10-23", "daysToExpiry": 448 },<br>      "participationLimit": null<br>    }<br>  ],<br>  "overLimitReasonOptions": [<br>    { "code": "PRIOR_CONSENT", "label": "事前に了承済", "key": "1" },<br>    { "code": "DEPOSIT_TOPUP", "label": "保証金追加予定", "key": "2" },<br>    { "code": "OTHER", "label": "その他", "key": "3", "noteRequired": true }<br>  ]<br>}</pre> | `qualification.status`: `VALID` 有効 · `SUSPENDED` 一時停止 · `EXPIRED` 失効 · `UNDER_REVIEW` 再審査 · `NONE` (không có bản ghi). `participationLimit` chỉ có với `BAIBAI`, `null` với `NAKAOROSHI`. `usedExclJpy` = 相対 + せり 確定 trong kỳ `periodKey` (税抜, giá trị hiệu lực); `usedInclJpy` = floor(`usedExclJpy` × (100 + `taxRatePercent`) / 100) — suất từ `tax_rates` theo mã ở tham số `PARTICIPATION_LIMIT_TAX_CODE` (Q-TRD-02, [Customer giả lập, 2026-11-25]); `remainingJpy` = `limitJpy` − `usedInclJpy` (có thể âm). Màn hiện cả hai số 「使用額 ¥…（税込）／ 税抜 ¥…」. Người tham gia loại khác vẫn trả với `kind` thật để client báo `E-TRD-004` |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Không có vai TRADE | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 422 | `q` sai | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "q" } }</pre> | |
| 5 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- Nguồn: view `v_qualification_current`, `v_buyer_period_usage`, `v_participant_current_deposit` (party) — cột view định nghĩa ở [MKT_DB §4.0a](../../database-design/MKT_DB.md#40a-view-công-bố).
- Không trả email / địa chỉ người tham gia (dữ liệu cá nhân không cần ở bàn GD).
- Q-TRD-02 đã trả lời (税込). **Câu hỏi mở / TBD:** 経理部 xác nhận suất (軽減税率 8%?) và có hai suất trong một kỳ không.
