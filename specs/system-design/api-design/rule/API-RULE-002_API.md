---
id: SPEC-RULE_API-002
title: API — checker 確認 version quy chế (→ 発効待ち, hoặc 決裁待ち ở nhánh N2)
type: system
subtype: api-design
api_id: API-RULE-002
endpoint: /api/v1/rule-versions/{versionId}/confirm
method: POST
media_type: application/json
feature: rule
screen_id: [SC-10-04]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-10-04-001, SPEC-RULE_VERSION-001, SPEC-RULE_FUNC-001, ADR-006, ADR-002, GOV-RULE-01, E-14]
---

# API-RULE-002 — POST /api/v1/rule-versions/{versionId}/confirm

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Checker 照合部門長 **確認** một version `PENDING`: kiểm maker ≠ checker, 発効日 còn ở tương lai, không trùng 発効日, nội dung hợp lệ, quota năm TC (khóa advisory), chính sách E-14 → `APPROVED` (発効待ち); ở nhánh N2 với ROLLBACK khi đã đủ 4 lần → giữ `PENDING` chờ 運用部門長 決裁 (RULE_VERSION_TECH R1–R5).

**Xác thực:** Session cookie + `X-CSRF-Token` + MFA: `CHANGE` dùng step-up còn hiệu lực (10 phút); `ROLLBACK` **luôn hỏi lại mã** (header `X-MFA-Token` bắt buộc, `purpose = RULE_ROLLBACK_CONFIRM` — ADR-002 §2-6a; [api-conventions §4](../../../_common/api-conventions.md#4-mfa-step-up)). Quyền `STL_HEAD` (hoặc 代行).

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `versionId` | string | `a1b2c3d4-0000-4000-8000-000000000004` | Version `PENDING` | |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` | | |
| 3 | Body Parameters | `reason` | string | `第2版の率に戻すため` | Lý do checker, 1..500 ký tự; bắt buộc khi `ROLLBACK` | `[optional]` khi `CHANGE` |
| 4 | Header Parameters | `X-MFA-Token` | string | `mfa_01JD…` | Token MFA dùng một lần (`purpose = RULE_ROLLBACK_CONFIRM`) | `[optional]` khi `CHANGE` và step-up còn hiệu lực; bắt buộc khi `ROLLBACK` |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã 確認 | <pre>{<br>  "versionNo": 4,<br>  "status": "APPROVED",<br>  "awaitingSecondApproval": false,<br>  "effectiveFrom": "2027-10-01",<br>  "fiscalYear": 2027,<br>  "quotaUsedAfter": 3<br>}</pre> | N2 + ROLLBACK khi used ≥ 4: `status: "PENDING"`, `awaiting_second_approval: true`, `quotaUsedAfter` = used hiện tại (chưa đếm) |
| 2 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | Client về SC-00-01, giữ URL |
| 3 | 422 | Thiếu lý do / body sai | <pre>{ "error": { "code": "E-RULE-007", "message": "理由を入力してください（500文字以内）。" } }</pre> | `E-CMN-007` cho lỗi định dạng |
| 4 | 403 | Token MFA thiếu / hết hạn / đã dùng (chưa đăng nhập → 401 `E-CMN-001`) | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005`; chưa đăng nhập → 401 `E-CMN-001` |
| 5 | 403 | Không có quyền / maker tự duyệt | <pre>{ "error": { "code": "E-RULE-002", "message": "起票者本人は確認・取消できません。" } }</pre> | `E-CMN-002` khi không có quyền `STL_HEAD` |
| 6 | 404 | Version không tồn tại | <pre>{ "error": { "code": "E-RULE-001", "message": "指定された規則版が見つかりません。" } }</pre> | |
| 7 | 409 | Vượt quota | <pre>{ "error": { "code": "E-RULE-006", "message": "今年度の発効回数が上限（4回）に達しています。この版は確認できません。", "detail": { "fiscalYear": 2027, "used": 4 } } }</pre> | |
| 8 | 409 | N1: rollback khi đủ 4 | <pre>{ "error": { "code": "E-RULE-009", "message": "4回到達後のロールバックは確認できません。誤った率で計算された期は修正申請「奨励金」で訂正してください。", "detail": { "fiscalYear": 2027, "used": 4 } } }</pre> | Chỉ khi cài nhánh N1 |
| 9 | 409 | Sai trạng thái / 発効日 / trùng / nội dung | <pre>{ "error": { "code": "E-RULE-004", "message": "発効日（2027/10/01）が現在の業務日以前のため確認できません。取り消して発効日を見直してください。", "detail": { "effectiveFrom": "2027-10-01", "businessDate": "2027-10-01" } } }</pre> | Một trong `E-RULE-003`, `E-RULE-004`, `E-RULE-005`, `E-RULE-013` |
| 10 | 500 | Lỗi hệ thống (rollback toàn bộ, không ghi dở) | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | Màn hiện C-26 kèm `traceId` |

---

## 5. Other Notes

- Thứ tự kiểm: phiên → CSRF → quyền → MFA → khóa dòng version → `E-RULE-001` → `E-RULE-002` → `E-RULE-003` → `E-RULE-007` → `E-RULE-004` → `E-RULE-005` → `E-RULE-013` → khóa năm TC → `E-RULE-006` / `E-RULE-009`.
- Gửi lại sau 200 → 409 `E-RULE-003` (không còn `PENDING`).
- **Câu hỏi mở / TBD:** E-14 (OPEN-L4-01), Q-RULE-01.
