---
id: SPEC-STL_API-005
title: 決裁 / 却下 修正申請 (cấp 1 / cấp 2) — phản ánh REVERSE / DELTA
type: system
subtype: api-design
api_id: API-STL-005
endpoint: /api/v1/corrections/{correctionId}/decisions
method: POST
media_type: application/json
feature: settle
screen_id: [SC-08-03]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-08-03-001, SPEC-STL_CORRECTION_DECIDE-001, SPEC-ADJUST_DB-001, ADR-004, ADR-007]
---

# API-STL-005 — POST /api/v1/corrections/{correctionId}/decisions

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Ghi quyết định của một cấp. Đủ số cấp và `APPROVE` → phản ánh trong cùng transaction: `TRADE` sinh REVERSE + DELTA ở 業務日 mở sớm nhất với `period_id` = kỳ GD gốc; `LATE_ENTRY` ghi bản ghi mới mang ngày gốc; `KANNO` / `INCENTIVE` chỉ `APPROVED` (DELTA ở 期ロック kế tiếp). GD gốc không bao giờ bị sửa.

**Xác thực:** Session cookie `sid` + CSRF (header `X-CSRF-Token`)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `correctionId` | string | `cr-12…` | UUID |  |
| 2 | Body Parameters | `level` | Integer | `1` | Cấp người duyệt nghĩ mình đang duyệt (1 \| 2) — lệch cấp hiện tại → 409 |  |
| 3 | Body Parameters | `decision` | string | `APPROVE` | `APPROVE` (決裁) · `REJECT` (却下) |  |
| 4 | Body Parameters | `comment` | string | `伝票で確認` | ≤ 200; bắt buộc khi `REJECT` | [optional] khi `APPROVE` |

Ví dụ body:

```json
{
  "level": 2,
  "decision": "APPROVE",
  "comment": "伝票スキャンで確認"
}
```

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã ghi quyết định | <pre>{<br>&nbsp;&nbsp;"correction": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "cr-12…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "APPROVED",<br>&nbsp;&nbsp;&nbsp;&nbsp;"statusLabel": "決裁・反映済",<br>&nbsp;&nbsp;&nbsp;&nbsp;"appliedBusinessDate": "2027-09-15"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"approval": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"level": 2,<br>&nbsp;&nbsp;&nbsp;&nbsp;"decision": "APPROVE",<br>&nbsp;&nbsp;&nbsp;&nbsp;"approver": "桜 九郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;"delegatedFor": null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"mfaVerifiedAt": "2027-09-15T11:02:00+09:00"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"records": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"id": "adj-1…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"kind": "REVERSE",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N04",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qtyDelta": -60,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"amountDeltaJpy": -114000,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"businessDate": "2027-09-15",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"periodId": "2027-08"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"id": "adj-2…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"kind": "DELTA",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qtyDelta": 60,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"amountDeltaJpy": 414000,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"businessDate": "2027-09-15",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"periodId": "2027-08"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"nextPendingId": "cr-15…"<br>}</pre> | Cấp 1 của yêu cầu 2 cấp → `status = FIRST_APPROVED`, `records = []`. `REJECT` → `REJECTED`. `nextPendingId` cho nút 「次の決裁待ちへ」 (null nếu hết) |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "field": "message" } } }</pre> | `E-CMN-007` |
| 3 | 422 | 却下 thiếu lý do | <pre>{ "error": { "code": "E-STL-025", "message": "却下理由を入力してください（200文字以内）" } }</pre> | `E-STL-025` |
| 4 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 5 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 6 | 403 | Thiếu MFA step-up còn hiệu lực (ADR-002 §2.2) | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005` |
| 7 | 403 | Người lập tự duyệt | <pre>{ "error": { "code": "E-STL-023", "message": "申請者本人は決裁できません" } }</pre> | `E-STL-023` |
| 8 | 403 | Một người duyệt cả 2 cấp | <pre>{ "error": { "code": "E-STL-024", "message": "1次と2次を同じ人は決裁できません" } }</pre> | `E-STL-024` |
| 9 | 404 | Không thấy 修正申請 | <pre>{ "error": { "code": "E-STL-021", "message": "修正申請が見つかりません" } }</pre> | `E-STL-021` |
| 10 | 409 | Không còn chờ duyệt | <pre>{ "error": { "code": "E-STL-022", "message": "この修正申請は決裁待ちではありません", "detail": { "status": "REJECTED" } } }</pre> | `E-STL-022` |
| 11 | 409 | `level` lệch cấp hiện tại (người khác vừa duyệt) | <pre>{ "error": { "code": "E-STL-026", "message": "この修正申請は既に処理されました（決裁段階が変わりました）", "detail": { "currentLevel": "2" } } }</pre> | `E-STL-026` |
| 12 | 409 | Lô không đủ SL khi tăng SL | <pre>{ "error": { "code": "E-STL-027", "message": "ロットの残数量が不足しているため反映できません（残 12kg）", "detail": { "available": "12" } } }</pre> | `E-STL-027` |
| 13 | 409 | Không có 業務日 mở để ghi | <pre>{ "error": { "code": "E-STL-028", "message": "計上できる未締めの業務日がありません" } }</pre> | `E-STL-028` |
| 14 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Quyền: cấp 1 = `STL_HEAD` hoặc `OPS_HEAD` (thay — Q-STL-04) hoặc 代行; cấp 2 = `OPS_HEAD` hoặc 代行; người lập không duyệt; một người không duyệt 2 cấp (unique DB).
- MFA step-up 10 phút (không ★) — duyệt liên tiếp qua `nextPendingId` không hỏi lại mã trong cửa sổ.
- `LATE_ENTRY` bị module đích từ chối → 409 với mã lỗi của module đó trong `error_extra`.
- Ghi bản ghi luôn vào 業務日 `OPEN`; trigger `enforce_open_business_day` là chốt chặn cuối.
- **Câu hỏi mở / TBD:** Q-STL-04, Q-STL-05
