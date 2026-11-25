---
id: SPEC-LOT_API-005
title: Tìm 出荷者 trong master
type: system
subtype: api-design
api_id: API-LOT-005
endpoint: /api/v1/master/shippers
method: GET
media_type: application/json
feature: lot
screen_id: [SC-03-01, SC-03-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-LOT_FUNC-001, SPEC-RULE_DB-001]
---

# API-LOT-005 — GET /api/v1/master/shippers

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Gợi ý 出荷者 (người / tàu gửi hàng) theo mã hoặc tên cho ô [4] SC-03-01 và bộ lọc [2] SC-03-05 (mã từ master SC-10-07 thay text tự do — D15). Chỉ đọc master `shippers` đang dùng. Function: [LOT_FUNC 2.7](../../../lot/function-specifications/LOT_FUNC.md#27-searchshippers).

**Xác thực:** Session cookie. Vai: INTAKE, JUDGE, TRADE, SETTLE, STL-HEAD, OPS-HEAD.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Query Parameters | `q` | string | `002` | 1–20 ký tự; khớp đầu mã hoặc một phần tên; 全角 được chuẩn hóa | |
| 2 | Query Parameters | `limit` | Integer | `10` | 1–20, mặc định 10 | `[optional]` |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "shippers": [<br>    { "id": "0b6d0000-0000-4000-8000-000000000021", "code": "0021", "name": "サンプル第一丸" }<br>  ]<br>}</pre> | Sắp: khớp mã chính xác → đầu mã → tên. Không có → `[]` |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Vai không được đọc | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 422 | `q` rỗng / quá dài | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "q" } }</pre> | |
| 5 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- Master `shippers` thuộc module `rule` (RULE_DB). Đặt API ở feature `lot` vì hiện chỉ lot dùng; feature khác cần → chuyển lên `api-design/` gốc, giữ ID ([`_common/api-list.md`](../../../_common/api-list.md) §2).
- **Câu hỏi mở / TBD:** không có.
