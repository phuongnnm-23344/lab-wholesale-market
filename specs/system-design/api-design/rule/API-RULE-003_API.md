---
id: SPEC-RULE_API-003
title: API — 運用部門長 決裁 rollback khi đã đủ 4 lần (chỉ nhánh N2 của E-14)
type: system
subtype: api-design
api_id: API-RULE-003
endpoint: /api/v1/rule-versions/{versionId}/second-approval
method: POST
media_type: application/json
feature: rule
screen_id: [SC-10-04]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-10-04-001, SPEC-RULE_VERSION-001, SPEC-RULE_FUNC-001, ADR-006, E-14, OPEN-L4-01, R-L4-01]
---

# API-RULE-003 — POST /api/v1/rule-versions/{versionId}/second-approval

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

**Chỉ có ở nhánh N2** (ý kiến khách [Giả lập], chờ workshop E-14): 運用部門長 **決裁** một version `ROLLBACK` đã được checker 確認 khi năm TC đã đủ 4 lượt. Kiểm lại 発効日, nội dung, quota (khóa năm TC), rồi `APPROVED`; lượt này **vẫn đếm** (lượt thứ 5+), thông báo 経営層, hiện ở RPT-12 (RULE_VERSION_TECH R5-3). Ở nhánh N1 endpoint vẫn tồn tại nhưng luôn trả `E-RULE-010` (không có trạng thái chờ 決裁) — giữ hợp đồng API không đổi khi đổi nhánh.

**Xác thực:** Session cookie + `X-CSRF-Token` + MFA **luôn hỏi lại mã** (header `X-MFA-Token`, `purpose = RULE_SECOND_APPROVAL` — [api-conventions §4](../../../_common/api-conventions.md#4-mfa-step-up)). Quyền `OPS_HEAD`; người gọi ≠ maker, ≠ checker.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `versionId` | string | `a1b2c3d4-0000-4000-8000-000000000006` | Version `PENDING` đã có checker | |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` | | |
| 3 | Body Parameters | `reason` | string | `誤った交付率による影響を最小にするため決裁` | Lý do 決裁, 1..500 ký tự | |
| 4 | Header Parameters | `X-MFA-Token` | string | `mfa_01JD…` | Token MFA dùng một lần (`purpose = RULE_SECOND_APPROVAL`) | |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã 決裁 | <pre>{<br>  "versionNo": 6,<br>  "status": "APPROVED",<br>  "effectiveFrom": "2028-02-01",<br>  "fiscalYear": 2027,<br>  "quotaUsedAfter": 5,<br>  "managementNotified": true<br>}</pre> | `quotaUsedAfter` > 4 là bình thường ở N2 (lượt ngoại lệ) |
| 2 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | Client về SC-00-01, giữ URL |
| 3 | 422 | Thiếu lý do | <pre>{ "error": { "code": "E-RULE-007", "message": "理由を入力してください（500文字以内）。" } }</pre> | |
| 4 | 403 | Token MFA thiếu / hết hạn / đã dùng (chưa đăng nhập → 401 `E-CMN-001`) | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | |
| 5 | 403 | Không phải 運用部門長 / trùng maker, checker | <pre>{ "error": { "code": "E-RULE-011", "message": "起票者・確認者は決裁できません。別の運用部門長が決裁してください。" } }</pre> | `E-CMN-002` khi thiếu quyền `OPS_HEAD` |
| 6 | 404 | Version không tồn tại | <pre>{ "error": { "code": "E-RULE-001", "message": "指定された規則版が見つかりません。" } }</pre> | |
| 7 | 409 | Không ở trạng thái chờ 決裁 (kể cả nhánh N1) | <pre>{ "error": { "code": "E-RULE-010", "message": "この版は運用部門長の決裁待ちではありません。", "detail": { "status": "PENDING", "branch": "N1" } } }</pre> | |
| 8 | 409 | 発効日 đã qua / trùng / nội dung lỗi | <pre>{ "error": { "code": "E-RULE-004", "message": "発効日（2028/02/01）が現在の業務日以前のため確認できません。取り消して発効日を見直してください。" } }</pre> | Một trong `E-RULE-004`, `E-RULE-005`, `E-RULE-013` |
| 9 | 500 | Lỗi hệ thống (rollback toàn bộ, không ghi dở) | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | Màn hiện C-26 kèm `traceId` |

---

## 5. Other Notes

- Danh sách nhận thông báo 「経営層」 ở file cấu hình (Q-RULE-03).
- **Câu hỏi mở / TBD:** toàn bộ endpoint phụ thuộc E-14 (OPEN-L4-01); nếu workshop chọn N1, endpoint giữ nguyên hợp đồng và luôn trả `E-RULE-010`.
