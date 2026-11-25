---
id: SPEC-PTY_API-003
title: Đổi 保証金額 (thêm dòng lịch sử)
type: system
subtype: api-design
api_id: API-PTY-003
endpoint: /api/v1/participants/{participantId}/deposits
method: POST
media_type: application/json
feature: party
screen_id: [SC-01-02]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-01-02-001, SPEC-PTY_APPROVAL_LIFECYCLE-001, SPEC-PARTY_DB-001]
---

# API-PTY-003 — POST /api/v1/participants/{participantId}/deposits

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Thêm một dòng `participant_deposit_history` từ hộp thoại [9] của SC-01-02 — không sửa đè giá trị cũ (luật 4, PRM-046). Với 売買参加者 có 参加上限 theo 保証金, hạn mức đổi theo từ `effectiveFrom`; response trả hạn mức sau đổi để màn báo (khách #20).

**Xác thực:** Session cookie `sid` + CSRF (header `X-CSRF-Token`)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `participantId` | string | `6f1d…` | UUID |  |
| 2 | Body Parameters | `depositJpy` | Integer | `6000000` | 0 – 99.999.999.999, ≠ giá trị hiện hành |  |
| 3 | Body Parameters | `effectiveFrom` | string | `2027-09-01` | `YYYY-MM-DD`, ≥ 業務日 hiện tại (Q-PTY-02) |  |
| 4 | Body Parameters | `reason` | string | `保証金の追加差入れ` | 1–200 ký tự |  |

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | Đã thêm | <pre>{<br>&nbsp;&nbsp;"deposit": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"depositJpy": 6000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"effectiveFrom": "2027-09-01"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"limitMode": "DEPOSIT",<br>&nbsp;&nbsp;"limitAfter": 6000000<br>}</pre> | `limitAfter`: hạn mức hiệu lực từ `effectiveFrom` (`null` nếu không phải 売買参加者). `limitMode = INDIVIDUAL` → `limitAfter` = hạn mức đặt riêng, không đổi |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "field": "message" } } }</pre> | `E-CMN-007` |
| 3 | 422 | 保証金 sai | <pre>{ "error": { "code": "E-PTY-005", "message": "保証金額は0以上の整数で入力してください" } }</pre> | `E-PTY-005` |
| 4 | 422 | Bằng giá trị hiện hành | <pre>{ "error": { "code": "E-PTY-022", "message": "現在の保証金額と同じです" } }</pre> | `E-PTY-022` |
| 5 | 422 | Ngày hiệu lực quá khứ | <pre>{ "error": { "code": "E-PTY-006", "message": "発効日は本日（業務日）以降の日付を入力してください" } }</pre> | `E-PTY-006` |
| 6 | 422 | Thiếu lý do | <pre>{ "error": { "code": "E-PTY-007", "message": "理由を入力してください" } }</pre> | `E-PTY-007` |
| 7 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 8 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 9 | 404 | Không tìm thấy người tham gia (hoặc RLS ẩn) | <pre>{ "error": { "code": "E-PTY-018", "message": "参加者が見つかりません" } }</pre> | `E-PTY-018` |
| 10 | 409 | Trùng ngày hiệu lực | <pre>{ "error": { "code": "E-PTY-008", "message": "同じ発効日の保証金変更が既にあります", "detail": { "effectiveFrom": "2027-09-01" } } }</pre> | `E-PTY-008` |
| 11 | 409 | Người tham gia đã 退会 | <pre>{ "error": { "code": "E-PTY-010", "message": "この参加者は退会済みのため変更できません" } }</pre> | `E-PTY-010` |
| 12 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Vai: SETTLE, STL-HEAD. Không checker, không MFA — giả định [PL] Q-PTY-06 (PRM-046: trường số có lịch sử).
- Không sinh `LIMIT_CHANGED` (hạn mức `DEPOSIT` là giá trị suy ra — SPEC-PTY_APPROVAL_LIFECYCLE-001 §5).
- Index `uq_deposit_participant_from` chặn trùng ngày ở mức DB.
- **Câu hỏi mở / TBD:** Q-PTY-02 (cho hồi tố?), Q-PTY-06 (cần checker?)
