---
id: SPEC-LOT_API-006
title: Giá trị chọn cho form lô (業務日, giờ nhận lô, 品目, đơn vị, 等級)
type: system
subtype: api-design
api_id: API-LOT-006
endpoint: /api/v1/lots/form-options
method: GET
media_type: application/json
feature: lot
screen_id: [SC-03-01, SC-03-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-LOT_FUNC-001, SPEC-SC-03-01-001, SPEC-SC-03-05-001]
---

# API-LOT-006 — GET /api/v1/lots/form-options

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Trả một lần các giá trị form lô cần: 業務日 đang mở, giờ bắt đầu nhận lô của version quy chế gắn với ngày đó (SC-03-01 [3] — không viết cứng, khách #27, E-16), danh mục 品目 + đơn vị mặc định, đơn vị, danh mục 等級 (SC-03-05 [6]). Function: [LOT_FUNC 2.8](../../../lot/function-specifications/LOT_FUNC.md#28-getlotformoptions).

**Xác thực:** Session cookie. Vai: INTAKE, JUDGE.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | N/A | | | | Không có param | |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "businessDate": "2027-08-02",<br>  "intakeStartTime": "01:00",<br>  "ruleVersionNo": "2027-04",<br>  "items": [ { "code": "MADAI", "name": "真鯛", "defaultUnit": "KG" } ],<br>  "units": [ { "code": "KG", "label": "kg" }, { "code": "CASE", "label": "箱" }, { "code": "PIECE", "label": "尾" } ],<br>  "grades": [ { "code": "A", "label": "A" }, { "code": "B", "label": "B" }, { "code": "C", "label": "C" }, { "code": "OFF", "label": "規格外" } ]<br>}</pre> | `intakeStartTime` = `rule_parameters.LOT_INTAKE_START_TIME`; `grades` theo `sort_order` của `code_values` `INSPECTION_GRADE` (giả định — chờ fixture L4-A02) |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Vai không phải INTAKE / JUDGE | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 423 | Không có 業務日 đang mở | <pre>{ "error": { "code": "E-CMN-003", "message": "受付中の業務日がありません。管理者に連絡してください" } }</pre> | Hiếm (job 01:00 là lưới an toàn — ADR-005) |
| 5 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- Có thể cache phía client trong phiên màn (đổi khi 業務日 đổi).
- **Câu hỏi mở / TBD:** Q-LOT-03 (danh mục 等級 thật).
