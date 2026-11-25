---
id: SPEC-PTY_API-005
title: 起案 / 決裁・確認 / 却下 yêu cầu 許可
type: system
subtype: api-design
api_id: API-PTY-005
endpoint: /api/v1/permit-requests/{requestId}/transitions
method: POST
media_type: application/json
feature: party
screen_id: [SC-01-03, SC-01-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-PTY_PERMIT_LIFECYCLE-001, SPEC-PARTY_FUNC-001]
---

# API-PTY-005 — POST /api/v1/permit-requests/{requestId}/transitions

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: khóa trường ở `field` gốc | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

Đẩy yêu cầu 許可 sang bước kế: `PROPOSE` (照合部門長 ghi kết quả 審査 + 起案 — chỉ cấp mới), `DECIDE` (運用部門長 決裁 cấp mới / đình chỉ / 再審査; 照合部門長 確認 gia hạn — PRM-121), `REJECT` (却下). `DECIDE` ghi `nakaoroshi_permits` + `nakaoroshi_permit_events` trong một transaction.

**Xác thực:** Session cookie `sid` + CSRF (header `X-CSRF-Token`)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `requestId` | string | `r-71…` | UUID yêu cầu |  |
| 2 | Body Parameters | `action` | string | `DECIDE` | `PROPOSE` · `DECIDE` · `REJECT` |  |
| 3 | Body Parameters | `reviewResult` | string | `適（条件付き）` | 1–500 | `PROPOSE` bắt buộc |
| 4 | Body Parameters | `reviewedOn` | string | `2027-09-18` | ≤ hôm nay | `PROPOSE` bắt buộc |
| 5 | Body Parameters | `permitConditions` | string | `取扱品目: 鮮魚` | ≤ 500 | [optional] `PROPOSE` |
| 6 | Body Parameters | `comment` | string | `条件確認済み` | ≤ 500 | `REJECT` bắt buộc; khác [optional] |

Ví dụ body:

```json
{
  "action": "DECIDE",
  "comment": "審査結果・条件を確認"
}
```

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã chuyển bước | <pre>{<br>&nbsp;&nbsp;"request": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "r-71…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "DECIDED"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"permit": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "p-12…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "VALID",<br>&nbsp;&nbsp;&nbsp;&nbsp;"validTo": "2031-10-23"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"events": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"event": "RENEWED",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"oldValidTo": "2028-10-23",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"newValidTo": "2031-10-23",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"decidedBy": "桜 七子",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"mfaVerifiedAt": "2027-09-20T10:01:00+09:00"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> | `PROPOSE` → chỉ `request.status = PROPOSED`. `REJECT` → `request.status = REJECTED`, không có `permit` / `events`. `DECIDE` cấp mới → `events` gồm `REVIEWED` + `REGISTERED` |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "action" } }</pre> | `E-CMN-007` |
| 3 | 422 | `PROPOSE` thiếu kết quả 審査 | <pre>{ "error": { "code": "E-PTY-015", "message": "審査結果を入力してください" } }</pre> | `E-PTY-015` |
| 4 | 422 | `REJECT` thiếu lý do | <pre>{ "error": { "code": "E-PTY-023", "message": "却下理由を入力してください" } }</pre> | `E-PTY-023` |
| 5 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 6 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 7 | 403 | Thiếu MFA step-up còn hiệu lực (ADR-002 §2.2) | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005` |
| 8 | 403 | Người gọi là maker (nhập / 起案) của chính yêu cầu | <pre>{ "error": { "code": "E-PTY-012", "message": "申請者・起案者本人は決裁（確認）できません" } }</pre> | `E-PTY-012` |
| 9 | 404 | Không tìm thấy yêu cầu | <pre>{ "error": { "code": "E-PTY-024", "message": "申請が見つかりません" } }</pre> | `E-PTY-024` |
| 10 | 409 | Yêu cầu đã đóng hoặc không ở bước này | <pre>{ "error": { "code": "E-PTY-017", "message": "この申請は既に処理済み、または処理できる段階ではありません", "detail": { "status": "DECIDED" } } }</pre> | `E-PTY-017` |
| 11 | 409 | Chuyển trạng thái không hợp lệ (FIG-010) | <pre>{ "error": { "code": "E-PTY-013", "message": "この状態からは指定の操作はできません", "detail": { "currentStatus": "SUSPENDED", "kind": "RESUME" } } }</pre> | `E-PTY-013` |
| 12 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Quyền: `PROPOSE` = STL_HEAD; `DECIDE` = STL_HEAD cho `RENEW`, OPS_HEAD cho loại khác; `REJECT` = checker của bước hiện tại. 代行 hợp lệ được tính như quyền tương ứng; audit ghi "thay cho …".
- `DECIDE` cần MFA step-up còn hiệu lực; client mở C-30 khi nhận `E-CMN-005` rồi gửi lại cùng body.
- Checker ≠ maker (CHECK DB `decided_by <> proposed_by`).
- Hiệu lực ngay ở 業務日 hiện tại (Q-PTY-05).
- **Câu hỏi mở / TBD:** OPEN-DB-09 (cấp mới cần 運用部門長 決裁?), Q-PTY-05
