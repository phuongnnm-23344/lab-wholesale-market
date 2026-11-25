---
id: SPEC-PTY_API-007
title: 確認・決裁 / 却下 yêu cầu 承認
type: system
subtype: api-design
api_id: API-PTY-007
endpoint: /api/v1/approval-requests/{requestId}/transitions
method: POST
media_type: application/json
feature: party
screen_id: [SC-01-04, SC-01-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-PTY_APPROVAL_LIFECYCLE-001, SPEC-PARTY_FUNC-001]
---

# API-PTY-007 — POST /api/v1/approval-requests/{requestId}/transitions

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: `field` gốc; khách Q-PTY-06: bỏ LIMIT_CHANGE khỏi luồng 確認 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

Quyết yêu cầu 承認: `DECIDE` (照合部門長 確認 cho `NEW` / `RENEW`; 運用部門長 決裁 cho loại 起案) hoặc `REJECT`. `DECIDE` ghi `baibai_approvals` + `baibai_approval_events` trong một transaction. Đổi 参加上限 **không** qua API này — một bước ở API-PTY-006 `LIMIT_CHANGE` (Q-PTY-06).

**Xác thực:** Session cookie `sid` + CSRF (header `X-CSRF-Token`)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `requestId` | string | `q-55…` | UUID yêu cầu |  |
| 2 | Body Parameters | `action` | string | `DECIDE` | `DECIDE` · `REJECT` |  |
| 3 | Body Parameters | `comment` | string | `保証金・資力に問題なし` | ≤ 500 | `REJECT` bắt buộc; `DECIDE` [optional] |

Ví dụ body:

```json
{
  "action": "DECIDE"
}
```

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã quyết | <pre>{<br>&nbsp;&nbsp;"request": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "q-55…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "DECIDED"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"approval": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "a9…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "VALID",<br>&nbsp;&nbsp;&nbsp;&nbsp;"validTo": "2031-10-23"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"event": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"event": "RENEWED",<br>&nbsp;&nbsp;&nbsp;&nbsp;"oldValidTo": "2028-10-23",<br>&nbsp;&nbsp;&nbsp;&nbsp;"newValidTo": "2031-10-23",<br>&nbsp;&nbsp;&nbsp;&nbsp;"decidedBy": "桜 七子",<br>&nbsp;&nbsp;&nbsp;&nbsp;"mfaVerifiedAt": "2027-09-20T10:05:00+09:00"<br>&nbsp;&nbsp;}<br>}</pre> | `REJECT` → không có `approval` / `event` |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "action" } }</pre> | `E-CMN-007` |
| 3 | 422 | `REJECT` thiếu lý do | <pre>{ "error": { "code": "E-PTY-023", "message": "却下理由を入力してください" } }</pre> | `E-PTY-023` |
| 4 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 5 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 6 | 403 | Thiếu MFA step-up còn hiệu lực (ADR-002 §2.2) | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005` |
| 7 | 403 | Người gọi là maker (nhập / 起案) của chính yêu cầu | <pre>{ "error": { "code": "E-PTY-012", "message": "申請者・起案者本人は決裁（確認）できません" } }</pre> | `E-PTY-012` |
| 8 | 404 | Không tìm thấy yêu cầu | <pre>{ "error": { "code": "E-PTY-024", "message": "申請が見つかりません" } }</pre> | `E-PTY-024` |
| 9 | 409 | Yêu cầu đã đóng hoặc không ở bước này | <pre>{ "error": { "code": "E-PTY-017", "message": "この申請は既に処理済み、または処理できる段階ではありません", "detail": { "status": "DECIDED" } } }</pre> | `E-PTY-017` |
| 10 | 409 | Chuyển trạng thái không hợp lệ (FIG-010) | <pre>{ "error": { "code": "E-PTY-013", "message": "この状態からは指定の操作はできません", "detail": { "currentStatus": "SUSPENDED", "kind": "RESUME" } } }</pre> | `E-PTY-013` |
| 11 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- MFA: bắt buộc với `DECIDE` (step-up theo phiên — PREMISE §3.2).
- Checker ≠ maker; 代行 tính như quyền tương ứng.
- **Câu hỏi mở / TBD:** OPEN-DB-09.
