---
id: SPEC-RULE_API-001
title: API — dữ liệu màn 規則版確認 (version, so sánh, quota, ví dụ, chính sách E-14)
type: system
subtype: api-design
api_id: API-RULE-001
endpoint: /api/v1/rule-versions/{versionId}/review
method: GET
media_type: application/json
feature: rule
screen_id: [SC-10-04]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-10-04-001, SPEC-RULE_VERSION-001, SPEC-RULE_FUNC-001, SPEC-RULE_DB-001, ADR-006]
---

# API-RULE-001 — GET /api/v1/rule-versions/{versionId}/review

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Trả mọi dữ liệu của SC-10-04 cho một version: trạng thái, loại (通常改定 / ロールバック), 発効日, maker, bộ đếm quota của **năm TC theo 発効日**, bảng so sánh với version đang áp (2 bảng 交付率 + mọi tham số quy chế), ví dụ tiền thưởng, tác động, nhánh chính sách E-14 đang cài và quyền thao tác của người gọi. Chỉ đọc (hàm `rule_version_review` — RULE_FUNC 2.5).

**Xác thực:** Session cookie. Vai: quyền `STL_HEAD`, `OPS_HEAD`, vai `RULE`.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `versionId` | string | `a1b2c3d4-0000-4000-8000-000000000004` | uuid `rule_versions` | |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "version": {<br>    "id": "a1b2c3d4-0000-4000-8000-000000000004",<br>    "versionNo": 4,<br>    "status": "PENDING",<br>    "awaitingSecondApproval": false,<br>    "changeKind": "CHANGE",<br>    "rollbackOf": null,<br>    "effectiveFrom": "2027-10-01",<br>    "fiscalYear": 2027,<br>    "maker": { "staffId": "5a5a5a5a-0000-4000-8000-000000000009", "name": "桜 九子" },<br>    "checker": null,<br>    "note": "仲卸の段階3の交付率を見直し",<br>    "cancelRequest": null<br>  },<br>  "baseVersion": { "id": "a1b2c3d4-0000-4000-8000-000000000003", "versionNo": 3, "status": "ACTIVE" },<br>  "quota": { "fiscalYear": 2027, "used": 2, "limit": 4 },<br>  "diff": [<br>    { "section": "RATE_NAKAOROSHI", "item": "段階3 ¥1,000,000〜", "current": "0.9%", "proposed": "1.0%", "change": "UP" },<br>    { "section": "RATE_BAIBAI", "item": null, "current": null, "proposed": null, "change": "NONE" },<br>    { "section": "PARAM", "item": "CORR_TWO_LEVEL_THRESHOLD_JPY", "current": "100000", "proposed": "150000", "change": "UP" }<br>  ],<br>  "examples": [<br>    { "participantClass": "NAKAOROSHI", "eligibleExclJpy": 1000000, "currentJpy": 9900, "proposedJpy": 11000 }<br>  ],<br>  "impact": { "firstPeriodCode": "2027-10", "lockedPeriodsUnchanged": true },<br>  "policy": { "branch": "N1", "blockedReason": null, "needsSecondApproval": false },<br>  "permissions": { "canConfirm": true, "canReturn": true, "canCancel": true, "canRequestCancel": false, "canSecondApprove": false, "isMaker": false }<br>}</pre> | `status`: `DRAFT` / `PENDING` / `APPROVED` / `ACTIVE` / `SUPERSEDED` / `CANCELLED`; `awaitingSecondApproval` = `PENDING` có checker (N2). `quota.used` theo RULE_FUNC 2.2 cho `fiscalYear` = FY(`effectiveFrom`). `diff[].section`: `RATE_NAKAOROSHI` / `RATE_BAIBAI` / `PARAM`; `change`: `UP` / `DOWN` / `CHANGED` / `NONE`. `examples[]` tính bằng `incentive_amount` (INC_FUNC 2.7). `policy.blockedReason`: `null` / `QUOTA` (CHANGE khi used ≥ 4) / `ROLLBACK_N1` / `NEEDS_SECOND` (N2). `cancelRequest`: `{requested_by, requested_at, reason}` khi có đề nghị hủy |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Vai không được xem | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | Version không tồn tại | <pre>{ "error": { "code": "E-RULE-001", "message": "指定された規則版が見つかりません。" } }</pre> | |
| 5 | 422 | `versionId` sai định dạng | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "versionId": "uuid形式で指定してください" } } }</pre> | |
| 6 | 500 | Lỗi hệ thống (rollback toàn bộ, không ghi dở) | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | Màn hiện C-26 kèm `traceId` |

---

## 5. Other Notes

- `policy` chỉ để màn hiện banner; quyết định cuối ở API-RULE-002 / 003 trong transaction có khóa năm TC (quota có thể đổi giữa lúc xem và lúc bấm — RV-13).
- **Câu hỏi mở / TBD:** E-14 (nhánh N1 / N2 — OPEN-L4-01), Q-RULE-01 (nhánh mặc định), Q-RULE-02 (nơi lưu đề nghị hủy).
