---
id: SPEC-STL_API-003
title: Đánh dấu thiết bị 「端末回収不能」
type: system
subtype: api-design
api_id: API-STL-003
endpoint: /api/v1/devices/{deviceId}/lost
method: POST
media_type: application/json
feature: settle
screen_id: [SC-07-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-07-02-001, SPEC-STL_DEVICE_LOST-001, SPEC-IAM_AUDIT_DB-001, ADR-005, ADR-008]
---

# API-STL-003 — POST /api/v1/devices/{deviceId}/lost

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: khóa trường ở `field` gốc | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

Đánh dấu một thiết bị hỏng / mất / hết pin không đồng bộ được: máy ra khỏi mục ✖ #3 của checklist 日次締め, `is_active = false`, phiên của máy bị thu hồi; bản ghi máy gửi lên về sau vào SC-03-07 (要確認). Không thay thế được các mục ✖ khác. ★ MFA dùng một lần.

**Xác thực:** Session cookie `sid` + CSRF (header `X-CSRF-Token`)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `deviceId` | string | `dv-3…` | UUID thiết bị |  |
| 2 | Header Parameters | `X-MFA-Token` | string | `mfa_…` | `purpose = DEVICE_LOST` |  |
| 3 | Body Parameters | `reason` | string | `水没して起動しない` | 1–200 ký tự |  |

Ví dụ body:

```json
{
  "reason": "水没して起動しない"
}
```

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã đánh dấu | <pre>{<br>&nbsp;&nbsp;"device": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "dv-3…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"code": "TAB-03",<br>&nbsp;&nbsp;&nbsp;&nbsp;"lostReportedAt": "2027-08-02T09:40:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;"lostReportedBy": "桜 七子",<br>&nbsp;&nbsp;&nbsp;&nbsp;"pendingSyncCountAtReport": 5,<br>&nbsp;&nbsp;&nbsp;&nbsp;"isActive": false<br>&nbsp;&nbsp;}<br>}</pre> | Client gọi lại API-STL-001 để thấy máy rời mục #3 |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "reason" } }</pre> | `E-CMN-007` |
| 3 | 422 | Thiếu lý do | <pre>{ "error": { "code": "E-STL-006", "message": "理由を入力してください（200文字以内）" } }</pre> | `E-STL-006` |
| 4 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 5 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 6 | 403 | `X-MFA-Token` thiếu / hết hạn / đã dùng / sai mục đích (★ luôn hỏi lại mã) | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です", "detail": { "purpose": "DAY_CLOSE" } } }</pre> | `E-CMN-005` |
| 7 | 404 | Không thấy máy | <pre>{ "error": { "code": "E-STL-009", "message": "端末が見つかりません" } }</pre> | `E-STL-009` |
| 8 | 409 | Máy đã đánh dấu | <pre>{ "error": { "code": "E-STL-007", "message": "この端末は既に端末回収不能として登録されています", "detail": { "lostReportedAt": "2027-08-02T09:40:00+09:00" } } }</pre> | `E-STL-007` |
| 9 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Quyền: `STL_HEAD` / 代行; ★ luôn hỏi lại mã (PREMISE §3.2).
- Không có API bỏ đánh dấu ở 第1期 — đăng ký lại máy do SYSADM (mã mới).
- **Câu hỏi mở / TBD:** không có
