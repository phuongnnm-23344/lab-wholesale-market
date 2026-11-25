---
id: SPEC-INC_API-004
title: API — kết quả 完納奨励金 chính thức của một kỳ đã khóa
type: system
subtype: api-design
api_id: API-INC-004
endpoint: /api/v1/periods/{periodId}/incentive-results
method: GET
media_type: application/json
feature: incentive
screen_id: [SC-09-04, SC-09-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-09-04-001, SPEC-INC_ENGINE-001, SPEC-INCENTIVE_DB-001, ADR-007, FR-INC-01, FR-AUDIT-03]
---

# API-INC-004 — GET /api/v1/periods/{periodId}/incentive-results

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Trả **kết quả chính thức** đã ghi ở 期ロック của một kỳ: mọi dòng `incentive_results` có `period_id` = kỳ (MAIN, DELTA của kỳ cũ ghi ở kỳ này, CARRY đi vào, CARRY_EXPIRED), payout theo người, 端数調整, người / giờ khóa, `inputHash`. Chỉ đọc. Dùng ở SC-09-04 (trạng thái đã khóa) và SC-09-05 奨励金明細; RPT-07 dùng cùng truy vấn (INC_ENGINE_TECH K9-5).

**Xác thực:** Session cookie. Vai: `SETTLE`, quyền `STL_HEAD`, `OPS_HEAD`.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `periodId` | string | `6f1c2b7e-3a51-4c1e-9f6a-0d2a6b1c9e10` | uuid kỳ | |
| 2 | Query Parameters | `participantId` | string | `c0ffee00-0000-4000-8000-0000000000b7` | Lọc một người mua (SC-09-05) | `[optional]` |
| 3 | Query Parameters | `class` | string | `NAKAOROSHI` | `NAKAOROSHI` / `BAIBAI` — lọc theo tab [8] | `[optional]` |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "periodCode": "2027-09",<br>  "lockedAt": "2027-10-13T10:05:00+09:00",<br>  "lockedBy": { "name": "桜 七子", "delegationId": null },<br>  "runId": "9d9d9d9d-0000-4000-8000-000000000901",<br>  "inputHash": "a07c55…",<br>  "results": [<br>    { "buyerNo": "B02", "participantClass": "BAIBAI", "kind": "DELTA", "refPeriodCode": "2027-08", "kanno": true, "kannoBasis": "AUTO", "judgementNote": null, "payableInclJpy": 1296000, "paidOnTimeJpy": 1080000, "eligibleExclJpy": 1200000, "tierNo": 3, "rateBp": 90, "incentiveJpy": 1980, "ruleVersionLabel": "第3版", "correctionId": null }<br>  ],<br>  "payouts": [ { "buyerNo": "B02", "sumJpy": 1980, "payoutJpy": 1980 } ],<br>  "roundingAdjustments": [ { "taxRatePercent": 8, "amountJpy": 2 } ],<br>  "carryExpiredUnpaid": []<br>}</pre> | Ví dụ chỉ hiện dòng DELTA của TV-02 (INCENTIVE_DB §5): tính lại kỳ 2027-08 bằng version kỳ 08, ghi ở kỳ 09 (MAIN kỳ 09 của B02 không có trong TV nên không ghi số). `payouts[].payout_jpy` = max(0, `sumJpy`). `carry_expired_unpaid[]` (chỉ kỳ tháng 03): `{buyer_no, unpaid_jpy}` = trị tuyệt đối phần âm chưa thu (RPT-07) |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Vai không được xem | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | Kỳ không tồn tại | <pre>{ "error": { "code": "E-INC-001", "message": "指定された期が見つかりません。" } }</pre> | |
| 5 | 404 | Kỳ chưa khóa | <pre>{ "error": { "code": "E-INC-012", "message": "この期の確定結果はまだありません（期ロック前）。", "detail": { "status": "OPEN" } } }</pre> | Màn dùng API-INC-002 thay |
| 6 | 422 | Query sai | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "class": "NAKAOROSHI または BAIBAI を指定してください" } } }</pre> | |
| 7 | 500 | Lỗi hệ thống (rollback toàn bộ, không ghi dở) | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | Màn hiện C-26 kèm `traceId` |

---

## 5. Other Notes

- Dữ liệu append-only → có thể cache theo (`periodId`, `runId`); kỳ đã khóa không đổi kết quả của chính nó (dòng DELTA sau này ghi ở **kỳ khác**).
- **Câu hỏi mở / TBD:** Q-ARCH-08 (cách thu phần `CARRY_EXPIRED`).
