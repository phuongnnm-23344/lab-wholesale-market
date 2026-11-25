---
id: SPEC-STL_API-004
title: Chi tiết 修正申請 + xem trước bản ghi sẽ sinh
type: system
subtype: api-design
api_id: API-STL-004
endpoint: /api/v1/corrections/{correctionId}
method: GET
media_type: application/json
feature: settle
screen_id: [SC-08-03]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-08-03-001, SPEC-STL_CORRECTION_DECIDE-001, SPEC-ADJUST_DB-001]
---

# API-STL-004 — GET /api/v1/corrections/{correctionId}

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Trả nội dung một 修正申請 cho SC-08-03: số cấp cần (ảnh chụp ngưỡng + version lúc nộp), đích (GD / kỳ / ngày), before / after, biến động theo người mua 税込, **bản ghi REVERSE / DELTA sẽ sinh** với 計上業務日 (業務日 mở sớm nhất — tạm tính) và 対象期 (kỳ GD gốc) + ảnh hưởng 期のお支払額 / 奨励金, lịch sử 決裁 và nút người xem được bấm.

**Xác thực:** Session cookie `sid` (đọc — không cần CSRF)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `correctionId` | string | `cr-12…` | UUID |  |

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Thành công | <pre>{<br>&nbsp;&nbsp;"correction": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "cr-12…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"no": "修正-2027-0091",<br>&nbsp;&nbsp;&nbsp;&nbsp;"scope": "TRADE",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "SUBMITTED",<br>&nbsp;&nbsp;&nbsp;&nbsp;"statusLabel": "決裁待ち（1次）",<br>&nbsp;&nbsp;&nbsp;&nbsp;"reason": "買受人の取り違え",<br>&nbsp;&nbsp;&nbsp;&nbsp;"requiredLevels": 2,<br>&nbsp;&nbsp;&nbsp;&nbsp;"requiredReason": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerChanged": true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"maxBuyerDiffInclJpy": 447120,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"thresholdJpy": 100000,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"ruleVersionNo": 3<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"target": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeId": "t-0005…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeNo": "相対-0005",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"businessDate": "2027-08-02",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"dayLocked": true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"periodId": "2027-08"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "桜 三郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2027-09-15T08:40:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;"elapsedBusinessDays": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;"attachments": [<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"id": "att-7…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "伝票スキャン.pdf"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;]<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"change": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"before": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N04",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qty": 60,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unitPriceJpy": 1900,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"amountJpy": 114000<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"after": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qty": 60,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unitPriceJpy": 6900,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"amountJpy": 414000<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"buyerDiffsInclJpy": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N04",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"diffJpy": -123120<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"diffJpy": 447120<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"preview": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"appliedBusinessDate": "2027-09-15",<br>&nbsp;&nbsp;&nbsp;&nbsp;"targetPeriod": "2027-08",<br>&nbsp;&nbsp;&nbsp;&nbsp;"periodLocked": true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"records": [<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"kind": "REVERSE",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N04",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qtyDelta": -60,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"amountDeltaJpy": -114000<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"kind": "DELTA",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qtyDelta": 60,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"amountDeltaJpy": 414000<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;],<br>&nbsp;&nbsp;&nbsp;&nbsp;"effect": "PERIOD_LOCKED_DELTA_NEXT_LOCK"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"approvals": [],<br>&nbsp;&nbsp;"allowedActions": [<br>&nbsp;&nbsp;&nbsp;&nbsp;"DECIDE_L1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"REJECT"<br>&nbsp;&nbsp;]<br>}</pre> | `statusLabel` không bao giờ chứa 「承認」. `preview.appliedBusinessDate` là tạm tính — ngày thật chốt lúc duyệt cuối. `effect`: `PERIOD_OPEN_BILLING` · `PERIOD_LOCKED_DELTA_NEXT_LOCK` · `KANNO_CHANGE` · `INCENTIVE_DELTA`. `allowedActions`: `DECIDE_L1` · `DECIDE_L2` · `REJECT` |
| 2 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 3 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 4 | 404 | Không thấy 修正申請 | <pre>{ "error": { "code": "E-STL-021", "message": "修正申請が見つかりません" } }</pre> | `E-STL-021` |
| 5 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Vai đọc: STL-HEAD, OPS-HEAD, người lập (yêu cầu của mình), SETTLE (theo 閲) — RLS.
- `scope = LATE_ENTRY`: `target = {businessDate, kind, paperSlipNo}`, `preview.records` mô tả bản ghi mới; `KANNO` / `INCENTIVE`: `target = {participant, periodId}`, `preview.records = []`.
- **Câu hỏi mở / TBD:** không có
