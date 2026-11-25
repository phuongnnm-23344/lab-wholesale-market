---
id: SPEC-RULE_API-004
title: API — checker 差し戻す version quy chế (→ 下書き)
type: system
subtype: api-design
api_id: API-RULE-004
endpoint: /api/v1/rule-versions/{versionId}/return
method: POST
media_type: application/json
feature: rule
screen_id: [SC-10-04]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-10-04-001, SPEC-RULE_VERSION-001, SPEC-RULE_FUNC-001, ADR-006]
---

# API-RULE-004 — POST /api/v1/rule-versions/{versionId}/return

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Checker trả version `PENDING` về maker: `PENDING` → `DRAFT` (kể cả version đang chờ 決裁 N2 — bắt đầu lại từ đầu), xóa `checker_id`, thông báo maker kèm lý do (RULE_VERSION_TECH R7-1). Không đụng quota.

**Xác thực:** Session cookie + `X-CSRF-Token` + MFA step-up còn hiệu lực (10 phút). Quyền `STL_HEAD`, ≠ maker.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `versionId` | string | `a1b2c3d4-0000-4000-8000-000000000004` | Version `PENDING` | |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` | | |
| 3 | Body Parameters | `reason` | string | `段階4の上限額の入力誤り` | 1..500 ký tự | |
| 4 | Header Parameters | `X-MFA-Token` | string | `mfa_01JD…` | Token MFA do iam cấp sau C-30 | `[optional]` khi step-up còn hiệu lực |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã trả về | <pre>{<br>  "versionNo": 4,<br>  "status": "DRAFT"<br>}</pre> | |
| 2 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | Client về SC-00-01, giữ URL |
| 3 | 422 | Thiếu lý do | <pre>{ "error": { "code": "E-RULE-007", "message": "理由を入力してください（500文字以内）。" } }</pre> | |
| 4 | 403 | Token MFA thiếu / hết hạn / đã dùng (chưa đăng nhập → 401 `E-CMN-001`) | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | |
| 5 | 403 | Không có quyền / maker | <pre>{ "error": { "code": "E-RULE-002", "message": "起票者本人は確認・取消できません。" } }</pre> | `E-CMN-002` khi thiếu quyền |
| 6 | 404 | Version không tồn tại | <pre>{ "error": { "code": "E-RULE-001", "message": "指定された規則版が見つかりません。" } }</pre> | |
| 7 | 409 | Không ở `PENDING` | <pre>{ "error": { "code": "E-RULE-003", "message": "この版は確認待ちではありません（現在: APPROVED）。", "detail": { "status": "APPROVED" } } }</pre> | |
| 8 | 500 | Lỗi hệ thống (rollback toàn bộ, không ghi dở) | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | Màn hiện C-26 kèm `traceId` |

---

## 5. Other Notes

- Audit `RULE_VERSION_RETURN` (người, lý do). Maker sửa ở SC-10-02 rồi nộp lại; lịch sử hai lượt giữ trong `audit_logs`.
- **Câu hỏi mở / TBD:** không có.
