---
id: SPEC-TRD_API-003
title: Danh sách GD
type: system
subtype: api-design
api_id: API-TRD-003
endpoint: /api/v1/trades
method: GET
media_type: application/json
feature: trade
screen_id: [SC-04-01, SC-04-03]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-04-01-001, SPEC-TRADE_FUNC-001]
---

# API-TRD-003 — GET /api/v1/trades

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Liệt kê GD theo khoảng 業務日 với giá trị **hiệu lực** (gốc + điều chỉnh, view `v_trade_effective`). SC-04-01 [10] dùng `mine=true&limit=5`; SC-04-01 cũng dùng để kiểm "GD đã ghi chưa" sau timeout / có mạng lại; SC-04-03 (List) dùng đầy đủ bộ lọc. Function: [TRADE_FUNC 2.5](../../../trade/function-specifications/TRADE_FUNC.md#25-listtrades).

**Xác thực:** Session cookie. Vai: TRADE, SETTLE, STL-HEAD, OPS-HEAD (RLS).

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Query Parameters | `dateFrom` | string | `2027-08-02` | 業務日 từ; mặc định ngày mở | `[optional]` |
| 2 | Query Parameters | `dateTo` | string | `2027-08-02` | 業務日 đến; khoảng ≤ 31 ngày | `[optional]` |
| 3 | Query Parameters | `channel` | string | `AITAI` | `AITAI` · `SERI` | `[optional]` |
| 4 | Query Parameters | `status` | string | `CONFIRMED` | CSV `trade_status` | `[optional]` |
| 5 | Query Parameters | `mine` | boolean | `true` | Chỉ GD do người gọi chốt | `[optional]` |
| 6 | Query Parameters | `buyerNo` | string | `N01` | | `[optional]` |
| 7 | Query Parameters | `lotNo` | string | `L20270802-5` | | `[optional]` |
| 8 | Query Parameters | `sort` | string | `-confirmedAt` | `-confirmedAt` (mặc định) · `tradeNo` | `[optional]` |
| 9 | Query Parameters | `limit` | Integer | `5` | 1–100, mặc định 50 | `[optional]` |
| 10 | Query Parameters | `offset` | Integer | `0` | | `[optional]` |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "total": 1,<br>  "trades": [<br>    {<br>      "tradeId": "d4e5f6a7-0000-4000-8000-000000000005",<br>      "displayNo": "相対-0005",<br>      "channel": "AITAI",<br>      "status": "CONFIRMED",<br>      "businessDate": "2027-08-02",<br>      "lotNo": "L20270802-5",<br>      "itemName": "サンプル鰹",<br>      "buyerNo": "N01",<br>      "buyerName": "サンプル仲卸1",<br>      "qty": 2.0,<br>      "unit": "KG",<br>      "unitPriceJpy": 1200,<br>      "amountJpy": 2400,<br>      "hasAdjustments": false,<br>      "confirmedAt": "2027-08-02T04:31:12+09:00",<br>      "confirmedByName": "桜 太郎"<br>    }<br>  ]<br>}</pre> | `qty`, `unitPriceJpy`, `amountJpy`, `buyer*` = giá trị hiệu lực; `hasAdjustments` = có 当日訂正 / 修正申請 |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Vai không được đọc GD | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 422 | Query sai / khoảng > 31 ngày | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "dateTo" } }</pre> | |
| 5 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- Luôn có khoảng ngày + phân trang (M23). p95 ≤ 500 ms với 1.200 GD / ngày.
- **Câu hỏi mở / TBD:** không có.
