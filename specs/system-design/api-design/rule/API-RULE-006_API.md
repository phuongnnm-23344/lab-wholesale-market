---
id: SPEC-RULE_API-006
title: API — maker đề nghị hủy version 発効待ち (bước 1 của hủy có maker-checker)
type: system
subtype: api-design
api_id: API-RULE-006
endpoint: /api/v1/rule-versions/{versionId}/cancel-request
method: POST
media_type: application/json
feature: rule
screen_id: [SC-10-04, SC-10-01]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-10-04-001, SPEC-RULE_VERSION-001, SPEC-RULE_FUNC-001, SPEC-RULE_API-005, ADR-006]
---

# API-RULE-006 — POST /api/v1/rule-versions/{versionId}/cancel-request

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

ルール管理者 (vai `RULE`) đề nghị hủy một version `APPROVED` chưa tới 発効日; ghi đề nghị (người, giờ, lý do) và thông báo 照合部門長. Không đổi trạng thái version; hủy thật do checker làm ở API-RULE-005 (RULE_VERSION_TECH R7-3).

**Xác thực:** Session cookie + `X-CSRF-Token`. Vai `RULE`. Không cần MFA (chưa thay đổi gì có hiệu lực).

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `versionId` | string | `a1b2c3d4-0000-4000-8000-000000000004` | Version `APPROVED` | |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` | | |
| 3 | Body Parameters | `reason` | string | `仲卸段階3の率を誤入力` | 1..500 ký tự | |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã ghi đề nghị | <pre>{<br>  "versionNo": 4,<br>  "status": "APPROVED",<br>  "cancelRequest": { "requestedAt": "2027-09-20T15:10:00+09:00", "requestedBy": "桜 九子" }<br>}</pre> | |
| 2 | 422 | Thiếu lý do | <pre>{ "error": { "code": "E-RULE-007", "message": "理由を入力してください（500文字以内）。" } }</pre> | |
| 3 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 4 | 403 | Không có vai `RULE` | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 5 | 404 | Version không tồn tại | <pre>{ "error": { "code": "E-RULE-001", "message": "指定された規則版が見つかりません。" } }</pre> | |
| 6 | 409 | Không phải `APPROVED` / đã tới 発効日 / đã có đề nghị | <pre>{ "error": { "code": "E-RULE-014", "message": "この版は取消依頼できません（発効待ちでない、またはすでに依頼済みです）。", "detail": { "status": "ACTIVE" } } }</pre> | |
| 7 | 500 | Lỗi hệ thống (rollback toàn bộ, không ghi dở) | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | Màn hiện C-26 kèm `traceId` |

---

## 5. Other Notes

- Nơi lưu: `rule_versions.cancel_requested_by`, `cancel_requested_at`, `cancel_request_reason` (RULE_DB 0.2.1 §4.21, Q-RULE-02) + `audit_logs` `RULE_VERSION_CANCEL_REQUEST`.
- **Câu hỏi mở / TBD:** Q-RULE-02.
