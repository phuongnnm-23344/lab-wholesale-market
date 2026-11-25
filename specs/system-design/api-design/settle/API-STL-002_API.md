---
id: SPEC-STL_API-002
title: Khóa 業務日 (日次締め) — không có API mở lại
type: system
subtype: api-design
api_id: API-STL-002
endpoint: /api/v1/business-days/{businessDate}/close
method: POST
media_type: application/json
feature: settle
screen_id: [SC-07-02]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-07-02-001, SPEC-STL_DAY_CLOSE-001, SPEC-CLOSE_DB-001, ADR-005, ADR-002]
---

# API-STL-002 — POST /api/v1/business-days/{businessDate}/close

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Khóa 業務日 sau khi kiểm lại checklist trong cùng transaction; ghi ảnh chụp checklist, 持ち越し lô, **mở 業務日 chợ kế tiếp**, rồi xếp job tạo batch IF-ACC-01. Hành động không quay lại được: bắt MFA dùng một lần (★). Hệ thống **không có** endpoint mở lại ngày (PRM-031, ADR-005 §2.7).

**Xác thực:** Session cookie `sid` + CSRF (header `X-CSRF-Token`)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `businessDate` | string | `2027-08-02` | Ngày khóa |  |
| 2 | Header Parameters | `X-MFA-Token` | string | `mfa_…` | Token một lần, `purpose = DAY_CLOSE`, hạn 120 giây (iam) |  |
| 3 | Body Parameters | `confirmDate` | string | `2027/08/02` | Người dùng gõ lại; chấp nhận `/` hoặc `-` |  |
| 4 | Body Parameters | `deliveryRemainderAcknowledged` | boolean | `true` | Phải `true` (tick [13]) |  |
| 5 | Body Parameters | `checklistVersion` | string | `sha256:4f1c…` | Giá trị từ API-STL-001 lúc hiển thị |  |

Ví dụ body:

```json
{
  "confirmDate": "2027/08/02",
  "deliveryRemainderAcknowledged": true,
  "checklistVersion": "sha256:4f1c…"
}
```

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã khóa | <pre>{<br>&nbsp;&nbsp;"businessDate": "2027-08-02",<br>&nbsp;&nbsp;"status": "LOCKED",<br>&nbsp;&nbsp;"lockedAt": "2027-08-02T10:04:00+09:00",<br>&nbsp;&nbsp;"lockedBy": "桜 七子",<br>&nbsp;&nbsp;"delegatedFor": null,<br>&nbsp;&nbsp;"nextBusinessDate": "2027-08-03",<br>&nbsp;&nbsp;"accountingExport": "QUEUED"<br>}</pre> | `nextBusinessDate`: 業務日 chợ kế tiếp đã `OPEN`. `accountingExport`: `QUEUED` (job IF-ACC-01, hạn 11:00) hoặc `ENQUEUE_FAILED` (đã alarm, khóa vẫn thành công) |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "field": "message" } } }</pre> | `E-CMN-007` |
| 3 | 422 | Ngày gõ lại không khớp | <pre>{ "error": { "code": "E-STL-001", "message": "確認のため業務日を正しく入力してください" } }</pre> | `E-STL-001` |
| 4 | 422 | Chưa tick 引渡し残 | <pre>{ "error": { "code": "E-STL-003", "message": "引渡し残の確認（確認済み）にチェックしてください" } }</pre> | `E-STL-003` |
| 5 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 6 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 7 | 403 | `X-MFA-Token` thiếu / hết hạn / đã dùng / sai mục đích (★ luôn hỏi lại mã) | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です", "detail": { "purpose": "DAY_CLOSE" } } }</pre> | `E-CMN-005` |
| 8 | 404 | Không có 業務日 | <pre>{ "error": { "code": "E-STL-012", "message": "指定の業務日が存在しません" } }</pre> | `E-STL-012` |
| 9 | 409 | Còn mục ✖ | <pre>{ "error": { "code": "E-STL-002", "message": "締め不可（✖）の項目が残っています", "detail": { "blocking": "adrNo 2: 1件, adrNo 3: 1台" } } }</pre> | `E-STL-002` |
| 10 | 409 | Ngày đã khóa | <pre>{ "error": { "code": "E-STL-004", "message": "この業務日は既に締め済みです", "detail": { "lockedBy": "桜 七子", "lockedAt": "2027-08-02T10:04:00+09:00" } } }</pre> | `E-STL-004` |
| 11 | 409 | Ngày trước chưa khóa | <pre>{ "error": { "code": "E-STL-005", "message": "前の業務日 2027-07-31 が未締めです。先に締めてください", "detail": { "openDate": "2027-07-31" } } }</pre> | `E-STL-005` |
| 12 | 409 | Lịch thiếu ngày chợ kế tiếp | <pre>{ "error": { "code": "E-STL-008", "message": "次の市場開催日がカレンダーに登録されていません" } }</pre> | `E-STL-008` |
| 13 | 409 | Checklist đã đổi từ lúc hiển thị | <pre>{ "error": { "code": "E-STL-010", "message": "チェックリストが更新されました。最新の内容を確認してください", "detail": { "currentVersion": "sha256:9a0b…" } } }</pre> | `E-STL-010` |
| 14 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Quyền: `STL_HEAD` hoặc 代行 STL_HEAD đang hiệu lực (S8); audit ghi "thay cho …".
- MFA token dùng một lần lấy từ API xác thực MFA của `iam` (chưa có spec — đề xuất `POST /api/v1/auth/mfa/verify` {code, purpose}).
- Khóa xong mọi ghi vào ngày đó trả 423 `E-CMN-003` (trigger `enforce_open_business_day`).
- Không retry tự động phía client: lỗi mạng → gọi lại API-STL-001 xem trạng thái thật.
- **Câu hỏi mở / TBD:** Q-STL-01 (khóa theo thứ tự ngày)
