---
id: SPEC-LOT_API-003
title: Tìm / liệt kê lô
type: system
subtype: api-design
api_id: API-LOT-003
endpoint: /api/v1/lots
method: GET
media_type: application/json
feature: lot
screen_id: [SC-03-01, SC-03-05, SC-04-01, SC-03-03]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-LOT_FUNC-001, SPEC-SC-03-01-001, SPEC-SC-03-05-001, SPEC-SC-04-01-001]
---

# API-LOT-003 — GET /api/v1/lots

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Tìm lô của một 業務日 kèm SL khả dụng (view `v_lot_available_qty`). Dùng ở: SC-03-01 [11] (10 lô vừa đăng ký), SC-03-05 [4] (lô cần 目利き, kèm kết quả gần nhất + cờ có GD), SC-04-01 [1] (gợi ý lô đang bán theo số đuôi), SC-03-03 (danh sách lô — màn List). Function: [LOT_FUNC 2.4](../../../lot/function-specifications/LOT_FUNC.md#24-searchlots).

**Xác thực:** Session cookie. Vai đọc lô: INTAKE, JUDGE, TRADE, SETTLE, STL-HEAD, OPS-HEAD (RLS `role_read_matrix`, L4-A06).

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Query Parameters | `date` | string | `2027-08-02` | 業務日 `YYYY-MM-DD`; mặc định ngày đang mở | `[optional]` |
| 2 | Query Parameters | `status` | string | `RECEIVED,INSPECTED` | CSV giá trị `lot_status` | `[optional]` |
| 3 | Query Parameters | `onSale` | boolean | `true` | Chỉ lô `PUBLISHED` có SL khả dụng > 0 (gồm lô 持ち越し sang ngày này) | `[optional]` |
| 4 | Query Parameters | `q` | string | `5` | Số đuôi mã lô (1–6 chữ số) hoặc mã lô đầy đủ | `[optional]` |
| 5 | Query Parameters | `itemCode` | string | `MADAI` | Lọc 品目 | `[optional]` |
| 6 | Query Parameters | `shipperId` | string | `0b6d…-0021` | Lọc 出荷者 | `[optional]` |
| 7 | Query Parameters | `registeredBy` | string | `me` | Chỉ `me` | `[optional]` |
| 8 | Query Parameters | `include` | string | `latestInspection,hasTrades` | Trường bổ sung | `[optional]` |
| 9 | Query Parameters | `sort` | string | `-registeredAt` | `lotNo` (mặc định) · `-registeredAt` | `[optional]` |
| 10 | Query Parameters | `limit` | Integer | `10` | 1–100, mặc định 50 | `[optional]` |
| 11 | Query Parameters | `offset` | Integer | `0` | ≥ 0 | `[optional]` |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "date": "2027-08-02",<br>  "total": 1,<br>  "lots": [<br>    {<br>      "lotId": "6f1c2a4e-0000-4000-8000-000000000005",<br>      "lotNo": "L20270802-5",<br>      "status": "PUBLISHED",<br>      "itemCode": "KATSUO",<br>      "itemName": "サンプル鰹",<br>      "shipperCode": "0021",<br>      "shipperName": "サンプル第一丸",<br>      "unit": "KG",<br>      "qtyReceived": 80.0,<br>      "availableQty": 66.0,<br>      "registeredAt": "2027-08-02T03:58:00+09:00",<br>      "latestInspection": { "grade": "A", "inspectedByName": "桜 二郎", "inspectedAt": "2027-08-02T03:10:00+09:00" },<br>      "hasTrades": true<br>    }<br>  ]<br>}</pre> | `latestInspection` / `hasTrades` chỉ có khi `include` yêu cầu; `latestInspection` = `null` khi chưa ghi |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Vai không được đọc lô | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 422 | Query sai | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "date" } }</pre> | |
| 5 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- Luôn có điều kiện ngày + `limit` (M23). p95 ≤ 500 ms với 600 lô / ngày.
- SC-04-01 gọi `onSale=true&q={số}&limit=10` mỗi lần gõ (debounce 150 ms).
- **Câu hỏi mở / TBD:** cách nhận diện lô 持ち越し (theo `lot_status_history.carried_to_date`) phụ thuộc E-12 / OPEN-L4-03.
