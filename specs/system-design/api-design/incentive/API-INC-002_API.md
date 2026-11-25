---
id: SPEC-INC_API-002
title: API — 試算 完納奨励金 (không ghi kết quả, ghi 監査ログ)
type: system
subtype: api-design
api_id: API-INC-002
endpoint: /api/v1/periods/{periodId}/incentive-previews
method: POST
media_type: application/json
feature: incentive
screen_id: [SC-09-04]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-09-04-001, SPEC-INC_ENGINE-001, SPEC-INC_FUNC-001, ADR-007, BR-INC-01, FR-INC-01]
---

# API-INC-002 — POST /api/v1/periods/{periodId}/incentive-previews

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Chạy **試算** 完納奨励金 của một kỳ `OPEN`: gọi hàm thuần (INC_ENGINE_TECH K1–K7) với judgement nháp, trả MAIN + DELTA của các kỳ đã khóa + CARRY / CARRY_EXPIRED + 端数調整 dự kiến + chênh so với lần 試算 trước. **Không ghi bảng nghiệp vụ**; ghi đúng một dòng `audit_logs` (`INCENTIVE_PREVIEW`: giờ, `inputHash`, tổng, map người → thưởng) — khách #6 [Customer giả lập, 2026-11-25]. Gọi bao nhiêu lần cũng được; không idempotent theo nghĩa audit (mỗi lần một dòng) nên dùng POST.

**Xác thực:** Session cookie + header `X-CSRF-Token` (ADR-002). Vai: `SETTLE` hoặc quyền `STL_HEAD`. Không cần MFA.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `periodId` | string | `6f1c2b7e-3a51-4c1e-9f6a-0d2a6b1c9e10` | uuid kỳ, phải `OPEN` | |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` | Token chống CSRF của phiên | |
| 3 | Body Parameters | `judgements` | object | `{ "c0ffee00-0000-4000-8000-0000000000b8": { "decision": "NOT_KANNO", "reason": "振込手数料の差引と判断" } }` | Map `participantId` → `{decision: KANNO \| NOT_KANNO, reason: string 1..500}` cho dòng `SUSPECT`; thiếu dòng nào thì dòng đó giữ 要確認 | `[optional]` mặc định `{}`; chỉ STL_HEAD được gửi khác rỗng (SETTLE gửi → bỏ qua, không lỗi) |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã 試算 | <pre>{<br>  "periodCode": "2027-08",<br>  "ranAt": "2027-09-14T14:05:00+09:00",<br>  "inputHash": "3f9a0c…(64 ký tự hex)",<br>  "results": [<br>    { "buyerNo": "N01", "participantClass": "NAKAOROSHI", "kind": "MAIN", "refPeriodCode": null, "kanno": true, "kannoBasis": "AUTO", "eligibleExclJpy": 1000000, "tierNo": 3, "rateBp": 90, "incentiveJpy": 9900, "ruleVersionLabel": "第3版", "correctionId": null },<br>    { "buyerNo": "N04", "participantClass": "NAKAOROSHI", "kind": "DELTA", "refPeriodCode": "2027-07", "kanno": true, "kannoBasis": "AUTO", "eligibleExclJpy": 0, "tierNo": 1, "rateBp": 0, "incentiveJpy": -1320, "ruleVersionLabel": "稼働時の版（移行期）", "correctionId": null },<br>    { "buyerNo": "B11", "participantClass": "BAIBAI", "kind": "MAIN", "refPeriodCode": null, "kanno": null, "kannoBasis": "PENDING_JUDGEMENT", "eligibleExclJpy": 0, "tierNo": 1, "rateBp": 0, "incentiveJpy": 0, "ruleVersionLabel": "第3版", "correctionId": null }<br>  ],<br>  "suspects": [ { "buyerNo": "B11", "shortfallJpy": 440, "suggested": "NOT_KANNO" } ],<br>  "roundingAdjustments": [ { "taxRatePercent": 8, "amountJpy": 2 } ],<br>  "carry": [ { "buyerNo": "N04", "kind": "CARRY", "amountJpy": -1320, "toPeriodCode": "2027-09", "expiresAtPeriodCode": "2028-03" } ],<br>  "totals": { "mainJpy": 412300, "deltaJpy": -1320, "payoutJpy": 412300, "rowCount": 58 },<br>  "diffFromPrevious": { "previousRanAt": "2027-09-14T13:40:00+09:00", "totalDiffJpy": -1320, "byBuyer": [ { "buyerNo": "N04", "diffJpy": -1320 } ] }<br>}</pre> | `kind`: `MAIN` / `DELTA` / `CARRY` / `CARRY_EXPIRED`. `kannoBasis`: `AUTO` / `JUDGED` / `CORRECTION`, hoặc `PENDING_JUDGEMENT` (chỉ có ở 試算, dòng 要確認 chưa quyết — thưởng tạm 0). `refPeriodCode` khi `DELTA`. `ruleVersionLabel` = version **của kỳ tính** (DELTA dùng version kỳ cũ). `carry[]`: dòng sẽ sinh khi khóa (CARRY sang kỳ kế, hoặc CARRY_EXPIRED nếu là kỳ tháng 03). `totals.payoutJpy` = Σ max(0, Σ người). `diffFromPrevious` NULL khi đây là lần đầu |
| 2 | 422 | Body sai | <pre>{ "error": { "code": "E-INC-007", "message": "判断の理由を入力してください（500文字以内）。", "detail": { "participantId": "c0ffee00-0000-4000-8000-0000000000b8" } } }</pre> | Cũng có `E-INC-011` (judgement cho dòng không 要確認), `E-CMN-007` (định dạng) |
| 3 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | Mã chung |
| 4 | 403 | Vai không được 試算 / CSRF sai | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | Mã chung |
| 5 | 404 | Kỳ không tồn tại | <pre>{ "error": { "code": "E-INC-001", "message": "指定された期が見つかりません。" } }</pre> | |
| 6 | 423 | Kỳ đã khóa | <pre>{ "error": { "code": "E-INC-002", "message": "この期は期ロック済みです。訂正は修正申請で行い、差額は次の期ロックで計上されます。", "detail": { "lockedAt": "2027-09-14T10:20:00+09:00" } } }</pre> | Màn hiện C-24 |
| 7 | 500 | Dữ liệu quy chế / kỳ migrate hỏng | <pre>{ "error": { "code": "E-INC-010", "message": "適用規則版の交付率表に不備があります。システム管理者に連絡してください。", "traceId": "01JD…" } }</pre> | Log ERROR kèm version + loại bảng |

---

## 5. Other Notes

- Không giữ khóa DB; hai người 試算 cùng lúc không chặn nhau. Kết quả có thể khác lần khóa nếu đầu vào đổi — `API-INC-003` so `inputHash`.
- Payload audit giới hạn map người → tổng (≤ ~170 mục), không lưu toàn bộ `results`.
- **Câu hỏi mở / TBD:** `KANNO_FEE_SUSPECT_MAX_JPY` — giá trị ban đầu trong file cấu hình chờ 経理部 (khách #7); Q-ARCH-12 (税区分 của thưởng khi xuất IF-ACC-01).
