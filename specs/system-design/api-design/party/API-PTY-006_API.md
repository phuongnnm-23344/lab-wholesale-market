---
id: SPEC-PTY_API-006
title: Tạo yêu cầu thay đổi 承認 (売買参加者) / 参加上限
type: system
subtype: api-design
api_id: API-PTY-006
endpoint: /api/v1/participants/{participantId}/approval-requests
method: POST
media_type: application/json
feature: party
screen_id: [SC-01-04, SC-01-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-PTY_APPROVAL_LIFECYCLE-001, SPEC-PARTY_FUNC-001]
---

# API-PTY-006 — POST /api/v1/participants/{participantId}/approval-requests

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Tạo yêu cầu cho **承認 của 売買参加者**: cấp mới theo 届出 (`NEW`), gia hạn (`RENEW`), đổi 参加上限 (`LIMIT_CHANGE`), và loại 起案 (`SUSPEND`, `RESUME`, `REVIEW_START`, `REINSTATE`). Endpoint riêng, không dùng cho 許可 (ADR-003).

**Xác thực:** Session cookie `sid` + CSRF (header `X-CSRF-Token`)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `participantId` | string | `6f1d…` | UUID, `kind = BAIBAI` |  |
| 2 | Body Parameters | `kind` | string | `LIMIT_CHANGE` | `NEW` · `RENEW` · `LIMIT_CHANGE` (maker SETTLE) · `SUSPEND` · `RESUME` · `REVIEW_START` · `REINSTATE` (maker STL-HEAD) |  |
| 3 | Body Parameters | `payload.approvalNo` | string | `サンプル承認-B01` | ≤ 20, duy nhất | chỉ `NEW` |
| 4 | Body Parameters | `payload.validFrom / validTo` | string | `2025-10-19 / 2028-10-23` | `YYYY-MM-DD` | chỉ `NEW` |
| 5 | Body Parameters | `payload.screeningNote` | string | `保証金・資力 確認済` | Ghi xét nhẹ 保証金 / 資力, ≤ 500 | `NEW` bắt buộc |
| 6 | Body Parameters | `payload.newValidTo` | string | `2031-10-23` | > `valid_to` hiện tại | `RENEW` bắt buộc |
| 7 | Body Parameters | `payload.limitMode` | string | `INDIVIDUAL` | `DEPOSIT` · `INDIVIDUAL` | `NEW`, `LIMIT_CHANGE` bắt buộc |
| 8 | Body Parameters | `payload.participationLimitJpy` | Integer | `8000000` | ≥ 1 | bắt buộc khi `INDIVIDUAL` |
| 9 | Body Parameters | `payload.effectiveOn` | string | `2027-10-01` | ≥ 業務日 hiện tại; áp từ kỳ chứa ngày này | `LIMIT_CHANGE` bắt buộc |
| 10 | Body Parameters | `reason` | string | `取引拡大の申出` | 1–500 |  |

Ví dụ body:

```json
{
  "kind": "LIMIT_CHANGE",
  "payload": {
    "limitMode": "INDIVIDUAL",
    "participationLimitJpy": 8000000,
    "effectiveOn": "2027-10-01"
  },
  "reason": "取引拡大の申出（保証金は据え置き）"
}
```

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | Đã tạo | <pre>{<br>&nbsp;&nbsp;"request": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "q-55…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"kind": "LIMIT_CHANGE",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "ENTERED",<br>&nbsp;&nbsp;&nbsp;&nbsp;"label": "確認待ち",<br>&nbsp;&nbsp;&nbsp;&nbsp;"nextActor": "STL_HEAD",<br>&nbsp;&nbsp;&nbsp;&nbsp;"payload": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"oldLimitJpy": null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"oldLimitDisplayJpy": 5000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"participationLimitJpy": 8000000<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>}</pre> | `oldLimitJpy = null` nghĩa là trước đó theo 保証金; `oldLimitDisplayJpy` là số đang áp để checker so sánh |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "field": "message" } } }</pre> | `E-CMN-007` |
| 3 | 422 | Hạn mức không hợp lệ / không đổi | <pre>{ "error": { "code": "E-PTY-016", "message": "参加上限は1円以上で入力するか、「保証金額に連動」を選んでください" } }</pre> | `E-PTY-016` |
| 4 | 422 | Ngày hiệu lực quá khứ | <pre>{ "error": { "code": "E-PTY-006", "message": "発効日は本日（業務日）以降の日付を入力してください" } }</pre> | `E-PTY-006` |
| 5 | 422 | Gia hạn không hợp lệ | <pre>{ "error": { "code": "E-PTY-014", "message": "新しい失効日は現在の失効日より後の日付にしてください" } }</pre> | `E-PTY-014` |
| 6 | 422 | Thiếu lý do | <pre>{ "error": { "code": "E-PTY-007", "message": "理由を入力してください" } }</pre> | `E-PTY-007` |
| 7 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 8 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 9 | 404 | Không tìm thấy người tham gia (hoặc RLS ẩn) | <pre>{ "error": { "code": "E-PTY-018", "message": "参加者が見つかりません" } }</pre> | `E-PTY-018` |
| 10 | 409 | Người tham gia không phải 売買参加者 | <pre>{ "error": { "code": "E-PTY-009", "message": "この種別では承認を登録できません", "detail": { "kind": "NAKAOROSHI" } } }</pre> | `E-PTY-009` |
| 11 | 409 | Người tham gia đã 退会 | <pre>{ "error": { "code": "E-PTY-010", "message": "この参加者は退会済みのため変更できません" } }</pre> | `E-PTY-010` |
| 12 | 409 | Chuyển trạng thái không hợp lệ (FIG-010) | <pre>{ "error": { "code": "E-PTY-013", "message": "この状態からは指定の操作はできません", "detail": { "currentStatus": "SUSPENDED", "kind": "RESUME" } } }</pre> | `E-PTY-013` |
| 13 | 409 | Đã có yêu cầu mở cho tư cách này | <pre>{ "error": { "code": "E-PTY-011", "message": "処理中の申請があります。完了または却下の後に操作してください", "detail": { "openRequestId": "c1e0…" } } }</pre> | `E-PTY-011` |
| 14 | 409 | Số 承認 trùng | <pre>{ "error": { "code": "E-PTY-019", "message": "承認番号が既に使われています" } }</pre> | `E-PTY-019` |
| 15 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Không có bước `PROPOSE` / 審査 riêng (承認 xét nhẹ — PARTY_DB 4.15 CHECK ≠ `REVIEWED`).
- Bảng `baibai_approval_requests`: PARTY_DB 0.3.1 §4.60.
- **Câu hỏi mở / TBD:** OPEN-DB-09, Q-PTY-01, Q-PTY-07
