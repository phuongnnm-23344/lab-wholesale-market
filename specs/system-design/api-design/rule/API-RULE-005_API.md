---
id: SPEC-RULE_API-005
title: API — 取り消す version quy chế trước ngày hiệu lực (không tính quota)
type: system
subtype: api-design
api_id: API-RULE-005
endpoint: /api/v1/rule-versions/{versionId}/cancel
method: POST
media_type: application/json
feature: rule
screen_id: [SC-10-04]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-10-04-001, SPEC-RULE_VERSION-001, SPEC-RULE_FUNC-001, SPEC-RULE_API-006, ADR-006]
---

# API-RULE-005 — POST /api/v1/rule-versions/{versionId}/cancel

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M01: hủy bản `APPROVED` **luôn hỏi lại mã** (`X-MFA-Token` bắt buộc, `purpose = RULE_CANCEL_DECIDE`) theo PREMISE §3.2 ★; hủy `DRAFT` / `PENDING` giữ step-up, không nhận token (G2-m08) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Hủy version trước 発効日 → `CANCELLED`, **không tính** quota (bản `APPROVED` bị hủy thì trả lại một lượt). Hai trường hợp (RULE_VERSION_TECH R7-2, R7-4; ADR-006 §2.3-7a):
- `DRAFT` / `PENDING`: maker hoặc checker hủy, có lý do.
- `APPROVED` (発効待ち): giữ maker-checker — cần **đề nghị hủy của maker** (API-RULE-006) đang mở; checker 照合部門長 khác người đề nghị 決裁 hủy, **luôn hỏi lại mã MFA**.

**Xác thực:** Session cookie + `X-CSRF-Token` + MFA theo trạng thái bản bị hủy ([api-conventions §4](../../../_common/api-conventions.md#4-mfa-step-up)): `DRAFT` / `PENDING` → step-up theo phiên còn hiệu lực (10 phút, idle ≤ 3 phút); `APPROVED` → **luôn hỏi lại mã** (PREMISE §3.2 ★ "hủy version đã duyệt", ADR-002 §2.2-6a), header `X-MFA-Token` bắt buộc, `purpose = RULE_CANCEL_DECIDE`. Quyền `STL_HEAD` hoặc vai `RULE` (chỉ bản `DRAFT` / `PENDING` do chính mình lập).

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `versionId` | string | `a1b2c3d4-0000-4000-8000-000000000004` | Version cần hủy | |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` | | |
| 3 | Body Parameters | `reason` | string | `交付率の誤りが見つかったため発効前に取消` | 1..500 ký tự | |
| 4 | Header Parameters | `X-MFA-Token` | string | `mfa_01JD…` | Token MFA dùng một lần, ≤ 120 giây, `purpose = RULE_CANCEL_DECIDE` | Chỉ gửi khi bản đang `APPROVED` (bắt buộc); bản `DRAFT` / `PENDING` không gửi — server bỏ qua |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã hủy | <pre>{<br>  "versionNo": 4,<br>  "status": "CANCELLED",<br>  "fiscalYear": 2027,<br>  "quotaUsedAfter": 2<br>}</pre> | `quotaUsedAfter` giảm 1 nếu bản bị hủy từng ở `APPROVED` |
| 2 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | Client về SC-00-01, giữ URL |
| 3 | 422 | Thiếu lý do | <pre>{ "error": { "code": "E-RULE-007", "message": "理由を入力してください（500文字以内）。" } }</pre> | |
| 4 | 403 | `APPROVED`: token MFA thiếu / hết hạn / đã dùng / sai `purpose`; `DRAFT` / `PENDING`: step-up hết hiệu lực (chưa đăng nhập → 401 `E-CMN-001`) | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | |
| 5 | 403 | Không có quyền / người đề nghị tự hủy bản đã duyệt | <pre>{ "error": { "code": "E-RULE-002", "message": "起票者本人は確認・取消できません。" } }</pre> | `E-CMN-002`: vai RULE hủy bản không phải của mình / bản `APPROVED` |
| 6 | 404 | Version không tồn tại | <pre>{ "error": { "code": "E-RULE-001", "message": "指定された規則版が見つかりません。" } }</pre> | |
| 7 | 409 | Đã hiệu lực / sai trạng thái | <pre>{ "error": { "code": "E-RULE-008", "message": "この版は取り消せません（発効日以降、または取り消せない状態です）。", "detail": { "status": "ACTIVE" } } }</pre> | |
| 8 | 409 | `APPROVED` chưa có đề nghị hủy | <pre>{ "error": { "code": "E-RULE-012", "message": "起票者からの取消依頼がないため、発効待ちの版は取り消せません。" } }</pre> | |
| 9 | 500 | Lỗi hệ thống (rollback toàn bộ, không ghi dở) | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | Màn hiện C-26 kèm `traceId` |

---

## 5. Other Notes

- Thứ tự kiểm: phiên → CSRF → quyền → khóa dòng version (không có → 404 `E-RULE-001`) → MFA theo trạng thái (token `RULE_CANCEL_DECIDE` hoặc step-up) → `E-RULE-002` → `E-RULE-007` → `E-RULE-008` → `E-RULE-012`.
- Đây là đường xử lý chính khi phát hiện tỷ lệ sai **trước** 発効日 (ADR-006 §2.5-10) — không tốn lượt.
- **Câu hỏi mở / TBD:** Q-RULE-02 (cột lưu đề nghị hủy ở RULE_DB 4.21).
