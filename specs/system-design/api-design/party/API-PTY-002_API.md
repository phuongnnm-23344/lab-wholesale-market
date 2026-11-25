---
id: SPEC-PTY_API-002
title: Lưu thông tin cơ bản người tham gia
type: system
subtype: api-design
api_id: API-PTY-002
endpoint: /api/v1/participants/{participantId}
method: PUT
media_type: application/json
feature: party
screen_id: [SC-01-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-01-02-001, SPEC-PARTY_FUNC-001]
---

# API-PTY-002 — PUT /api/v1/participants/{participantId}

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: khóa trường ở `field` gốc | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

Lưu khối 基本情報 của SC-01-02 [4]–[7]: tên, 買受人番号, tối đa 2 email. Không đổi được 種別, trạng thái, 保証金 hay tư cách. Email đổi = đóng dòng cũ + thêm dòng mới (lịch sử).

**Xác thực:** Session cookie `sid` + CSRF (header `X-CSRF-Token`)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `participantId` | string | `6f1d…` | UUID |  |
| 2 | Body Parameters | `name` | string | `サンプル仲卸1` | 1–100 ký tự, trim |  |
| 3 | Body Parameters | `buyerNo` | string | `N01` | `^[A-Z0-9]{1,10}$`; bắt buộc với 仲卸 / 売買参加者, bỏ qua với loại khác | [optional] với 卸売業者 / 買出人 |
| 4 | Body Parameters | `emails` | string[] | `["n01@…"]` | 0–2 phần tử, ≤ 254 ký tự, không trùng nhau |  |
| 5 | Body Parameters | `requestRef` | string | `REQ-2027-0012` | Số giấy yêu cầu đổi email (≤ 30) | [optional] |
| 6 | Body Parameters | `version` | Integer | `7` | Giá trị `participant.version` lúc tải — khóa lạc quan |  |

Ví dụ body:

```json
{
  "name": "サンプル仲卸1",
  "buyerNo": "N01",
  "emails": [
    "n01@sakura-sample.example"
  ],
  "version": 7
}
```

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã lưu | <pre>{<br>&nbsp;&nbsp;"participant": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "6f1d…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name": "サンプル仲卸1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;"version": 8<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"contacts": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"slotNo": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email": "n01@sakura-sample.example"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> | Trả bản mới; client nạp lại API-PTY-001 để có đủ khối |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "name" } }</pre> | `E-CMN-007` |
| 3 | 422 | Tên sai | <pre>{ "error": { "code": "E-PTY-001", "message": "名称は1〜100文字で入力してください", "detail": { "name": "length" } } }</pre> | `E-PTY-001` |
| 4 | 422 | 買受人番号 sai dạng | <pre>{ "error": { "code": "E-PTY-002", "message": "買受人番号は英大文字・数字1〜10文字で入力してください", "detail": { "buyerNo": "pattern" } } }</pre> | `E-PTY-002` |
| 5 | 422 | Email sai dạng | <pre>{ "error": { "code": "E-PTY-004", "message": "メールアドレスの形式が正しくありません", "detail": { "emails[1]": "format" } } }</pre> | `E-PTY-004` |
| 6 | 422 | Hai email trùng | <pre>{ "error": { "code": "E-PTY-021", "message": "同じメールアドレスは2件登録できません" } }</pre> | `E-PTY-021` |
| 7 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 8 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 9 | 404 | Không tìm thấy người tham gia (hoặc RLS ẩn) | <pre>{ "error": { "code": "E-PTY-018", "message": "参加者が見つかりません" } }</pre> | `E-PTY-018` |
| 10 | 409 | 買受人番号 trùng | <pre>{ "error": { "code": "E-PTY-003", "message": "この買受人番号は既に使われています", "detail": { "buyerNo": "N01" } } }</pre> | `E-PTY-003` |
| 11 | 409 | Người khác đã sửa (`version` lệch) | <pre>{ "error": { "code": "E-CMN-008", "message": "他の利用者が更新しました。最新の内容を読み込み直してください", "detail": { "currentVersion": "8" } } }</pre> | `E-CMN-008` |
| 12 | 409 | Người tham gia đã 退会 | <pre>{ "error": { "code": "E-PTY-010", "message": "この参加者は退会済みのため変更できません" } }</pre> | `E-PTY-010` |
| 13 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Vai: SETTLE, STL-HEAD. Không cần MFA (PREMISE §3.2 không liệt kê).
- Audit before / after (FR-AUDIT-01); email là dữ liệu cá nhân — log không ghi email đầy đủ (log-convention).
- Gửi `kind` hoặc trường lạ → bị bỏ qua bởi schema (strip), không lỗi.
- **Câu hỏi mở / TBD:** không có
