---
id: SPEC-PTY_API-001
title: Lấy chi tiết người tham gia + khối 許可 hoặc 承認
type: system
subtype: api-design
api_id: API-PTY-001
endpoint: /api/v1/participants/{participantId}
method: GET
media_type: application/json
feature: party
screen_id: [SC-01-02]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-01-02-001, SPEC-PARTY_FUNC-001, SPEC-PARTY_DB-001]
---

# API-PTY-001 — GET /api/v1/participants/{participantId}

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Trả hồ sơ một người tham gia cho SC-01-02: thông tin cơ bản, email đang hiệu lực, 保証金 hiện hành + lịch sử, và **đúng một** khối tư cách theo loại — `permit` (許可, chỉ 仲卸) hoặc `approval` (承認 + 参加上限, chỉ 売買参加者); khối kia luôn `null` (luật 2). Kèm yêu cầu đang chờ và lịch sử sự kiện. Gọi khi mở màn và sau mỗi lần lưu.

**Xác thực:** Session cookie `sid` (đọc — không cần CSRF)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `participantId` | string | `6f1d2c3a-…` | UUID người tham gia |  |

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Thành công (ví dụ 売買参加者) | <pre>{<br>&nbsp;&nbsp;"participant": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "6f1d…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"kind": "BAIBAI",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name": "サンプル参加者1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "B01",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "ACTIVE",<br>&nbsp;&nbsp;&nbsp;&nbsp;"version": 7<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"contacts": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"slotNo": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email": "b01@sakura-sample.example"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"deposit": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"depositJpy": 5000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"effectiveFrom": "2027-04-01"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"depositHistory": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"depositJpy": 5000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"effectiveFrom": "2027-04-01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"reason": "初回登録",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "桜 一郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2027-03-28T09:10:00+09:00"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"permit": null,<br>&nbsp;&nbsp;"approval": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "a9…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"approvalNo": "サンプル承認-B01",<br>&nbsp;&nbsp;&nbsp;&nbsp;"validFrom": "2025-10-19",<br>&nbsp;&nbsp;&nbsp;&nbsp;"validTo": "2028-10-23",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "VALID",<br>&nbsp;&nbsp;&nbsp;&nbsp;"daysToExpiry": 698,<br>&nbsp;&nbsp;&nbsp;&nbsp;"limitMode": "DEPOSIT",<br>&nbsp;&nbsp;&nbsp;&nbsp;"participationLimitJpy": 5000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"periodUsageJpy": 1200000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"periodRemainingJpy": 3800000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"events": [<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"event": "LIMIT_CHANGED",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"oldLimitJpy": 4000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"newLimitJpy": null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"effectiveOn": "2027-04-01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"reason": "保証金連動に戻す",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "桜 一郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"decidedBy": "桜 七子"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;]<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"openRequest": null,<br>&nbsp;&nbsp;"allowedActions": [<br>&nbsp;&nbsp;&nbsp;&nbsp;"EDIT_BASIC",<br>&nbsp;&nbsp;&nbsp;&nbsp;"CHANGE_DEPOSIT",<br>&nbsp;&nbsp;&nbsp;&nbsp;"ENTER_RENEW",<br>&nbsp;&nbsp;&nbsp;&nbsp;"ENTER_LIMIT_CHANGE"<br>&nbsp;&nbsp;]<br>}</pre> | `permit` / `approval`: chỉ một khác `null`. `limitMode`: `DEPOSIT` (theo 保証金) · `INDIVIDUAL`. `periodUsageJpy` = Σ 買受代金 kỳ hiện tại (相対 + せり, `v_buyer_period_usage`). `openRequest`: `{id, kind, status: ENTERED\|PROPOSED, label}` với `label` 「確認待ち」/「決裁待ち」 — không bao giờ 「承認待ち」. `allowedActions` chỉ để ẩn / hiện nút. `version` dùng cho API-PTY-002 |
| 2 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 3 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 4 | 404 | Không tìm thấy người tham gia (hoặc RLS ẩn) | <pre>{ "error": { "code": "E-PTY-018", "message": "参加者が見つかりません" } }</pre> | `E-PTY-018` |
| 5 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Đọc qua view `security_invoker` + RLS `role_read_matrix` (vai SETTLE, STL-HEAD, OPS-HEAD).
- Khối 許可: `permit` có `permitNo`, `permitConditions`, `validFrom`, `validTo`, `status`, `daysToExpiry`, `events[]` (gồm `REVIEWED` với `reviewResult`) — không có trường hạn mức.
- Không cache ở client quá 0 giây (dữ liệu tư cách thay đổi do người khác 決裁).
- Truy vết: FR-PARTY-01, PRM-045, PRM-046, ADR-003, PARTY_DB 4.9–4.15.
- **Câu hỏi mở / TBD:** không có
