---
id: SPEC-PTY_API-004
title: Tạo yêu cầu thay đổi 許可 (仲卸)
type: system
subtype: api-design
api_id: API-PTY-004
endpoint: /api/v1/participants/{participantId}/permit-requests
method: POST
media_type: application/json
feature: party
screen_id: [SC-01-03, SC-01-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-PTY_PERMIT_LIFECYCLE-001, SPEC-PARTY_FUNC-001]
---

# API-PTY-004 — POST /api/v1/participants/{participantId}/permit-requests

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: `field` gốc; RENEW khi 許可 đã 失効 → 409 E-PTY-013 + `detail.nextAction`, bỏ khóa lỗi cũ (thay bằng `detail` / `field`) | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

Tạo yêu cầu cho **許可 của 仲卸**: cấp mới (`NEW`), gia hạn (`RENEW`), 一時停止 (`SUSPEND`), 再開 (`RESUME`), 再審査開始 (`REVIEW_START`), 再審査→有効 (`REINSTATE`). Không đổi tư cách ngay — chờ checker ở API-PTY-005. Endpoint riêng cho 許可, không dùng cho 承認 (ADR-003).

**Xác thực:** Session cookie `sid` + CSRF (header `X-CSRF-Token`)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `participantId` | string | `6f1d…` | UUID, `kind = NAKAOROSHI` |  |
| 2 | Body Parameters | `kind` | string | `RENEW` | `NEW` · `RENEW` (maker SETTLE) · `SUSPEND` · `RESUME` · `REVIEW_START` · `REINSTATE` (maker STL-HEAD = 起案) |  |
| 3 | Body Parameters | `payload.permitNo` | string | `サンプル許可-N01` | ≤ 20, duy nhất | chỉ `NEW` |
| 4 | Body Parameters | `payload.validFrom / validTo` | string | `2025-10-19 / 2028-10-23` | `YYYY-MM-DD`, `validTo ≥ validFrom` | chỉ `NEW` |
| 5 | Body Parameters | `payload.permitConditions` | string | `（条件なし）` | ≤ 500 | [optional] `NEW`, `REINSTATE` |
| 6 | Body Parameters | `payload.newValidTo` | string | `2031-10-23` | > `valid_to` hiện tại | `RENEW` bắt buộc; `REINSTATE` [optional] |
| 7 | Body Parameters | `payload.reviewResult / reviewedOn` | string | `適 / 2027-09-01` | Kết quả 審査, ≤ 500 | `REINSTATE` bắt buộc |
| 8 | Body Parameters | `reason` | string | `期限到来による更新` | 1–500 |  |

Ví dụ body:

```json
{
  "kind": "RENEW",
  "payload": {
    "newValidTo": "2031-10-23"
  },
  "reason": "期限到来による更新（許可条件の見直し: 変更なし）"
}
```

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | Đã tạo yêu cầu | <pre>{<br>&nbsp;&nbsp;"request": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "r-71…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"kind": "RENEW",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "ENTERED",<br>&nbsp;&nbsp;&nbsp;&nbsp;"label": "確認待ち",<br>&nbsp;&nbsp;&nbsp;&nbsp;"nextActor": "STL_HEAD",<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2027-09-20T09:12:00+09:00"<br>&nbsp;&nbsp;}<br>}</pre> | `status`: `ENTERED` (`NEW`, `RENEW`) · `PROPOSED` (loại STL-HEAD 起案). `label`: 「確認待ち」/「審査待ち」/「決裁待ち」. `nextActor`: `STL_HEAD` \| `OPS_HEAD` |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "kind" } }</pre> | `E-CMN-007` |
| 3 | 422 | Thiếu lý do | <pre>{ "error": { "code": "E-PTY-007", "message": "理由を入力してください" } }</pre> | `E-PTY-007` |
| 4 | 422 | Gia hạn không hợp lệ | <pre>{ "error": { "code": "E-PTY-014", "message": "新しい失効日は現在の失効日より後の日付にしてください", "detail": { "currentValidTo": "2028-10-23" } } }</pre> | `E-PTY-014` |
| 5 | 422 | Khoảng hiệu lực sai | <pre>{ "error": { "code": "E-PTY-020", "message": "有効期間の終了日は開始日以降にしてください" } }</pre> | `E-PTY-020` |
| 6 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 7 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 8 | 404 | Không tìm thấy người tham gia (hoặc RLS ẩn) | <pre>{ "error": { "code": "E-PTY-018", "message": "参加者が見つかりません" } }</pre> | `E-PTY-018` |
| 9 | 409 | Người tham gia không phải 仲卸 | <pre>{ "error": { "code": "E-PTY-009", "message": "この種別では許可を登録できません", "detail": { "kind": "BAIBAI" } } }</pre> | `E-PTY-009` |
| 10 | 409 | Người tham gia đã 退会 | <pre>{ "error": { "code": "E-PTY-010", "message": "この参加者は退会済みのため変更できません" } }</pre> | `E-PTY-010` |
| 11 | 409 | Chuyển trạng thái không hợp lệ (FIG-010) | <pre>{ "error": { "code": "E-PTY-013", "message": "この状態からは指定の操作はできません", "detail": { "currentStatus": "SUSPENDED", "kind": "RESUME" } } }</pre> | `E-PTY-013` |
| 12 | 409 | Đã có yêu cầu mở cho tư cách này | <pre>{ "error": { "code": "E-PTY-011", "message": "処理中の申請があります。完了または却下の後に操作してください", "detail": { "openRequestId": "c1e0…" } } }</pre> | `E-PTY-011` |
| 13 | 409 | Số 許可 trùng | <pre>{ "error": { "code": "E-PTY-019", "message": "許可番号が既に使われています" } }</pre> | `E-PTY-019` |
| 14 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Không cần MFA ở bước tạo / 起案 (MFA ở bước 決裁 / 確認 — PARTY_DB 4.13 cột 10).
- `RENEW` khi 許可 đã 失効 → 409 `E-PTY-013`, `detail` = `{ "currentStatus": "EXPIRED", "kind": "RENEW", "nextAction": "REVIEW_START" }` (Q-PTY-04 — không ân hạn, đi 再審査). `E-PTY-014` (422) chỉ dùng khi tư cách còn hiệu lực mà `newValidTo ≤ valid_to`.
- Ghi `notifications` cho checker; audit `PERMIT_REQUEST_CREATE`.
- Bảng `nakaoroshi_permit_requests`: PARTY_DB 0.3.1 §4.59.
- **Câu hỏi mở / TBD:** OPEN-DB-09, Q-PTY-01, Q-PTY-04
