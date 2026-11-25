---
id: SPEC-LOT_API-001
title: Danh sách 仮受付 chờ 本登録
type: system
subtype: api-design
api_id: API-LOT-001
endpoint: /api/v1/lots/provisional
method: GET
media_type: application/json
feature: lot
screen_id: [SC-03-01]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-03-01-001, SPEC-LOT_FUNC-001]
---

# API-LOT-001 — GET /api/v1/lots/provisional

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Trả các lô 仮受付 (`PROVISIONAL`) của 業務日 đang mở để 受付担当 chọn và 本登録 ở SC-03-01 [1], kèm số bản ghi 仮受付 offline chưa đồng bộ / cần đối chiếu cho liên kết [12]. Không ghi dữ liệu. Function: [LOT_FUNC 2.1](../../../lot/function-specifications/LOT_FUNC.md#21-listpendingprovisionallots).

**Xác thực:** Session cookie (máy dùng chung — người hiện hành theo PIN, ADR-002). Vai: INTAKE.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | N/A | | | | Không có param; 業務日 do server xác định | |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "businessDate": "2027-08-02",<br>  "items": [<br>    {<br>      "lotId": "6f1c2a4e-0000-4000-8000-000000000012",<br>      "provisionalNo": "K1-012",<br>      "receivedAt": "2027-08-02T01:42:00+09:00",<br>      "itemCode": "MADAI",<br>      "itemName": "真鯛",<br>      "unit": "KG",<br>      "qtyProvisional": 120.0,<br>      "shipperCode": null,<br>      "receivedByName": "桜 一郎"<br>    }<br>  ],<br>  "unsyncedCount": 2<br>}</pre> | `items` sắp theo `receivedAt` tăng; rỗng → `[]`. `shipperCode` có khi bến đã chọn 出荷者. `unsyncedCount` = `offline_sync_records` loại `PROVISIONAL_LOT`, `result` ∈ `PENDING`, `HELD` |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Không có vai INTAKE | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- Định dạng lỗi `{ "error": { code, message, field?, detail?, traceId? } }` giữ theo prototype (`api-error-response.ts`) — quy ước chung ở [`_common/api-conventions.md`](../../../_common/api-conventions.md).
- Tối đa ~150 dòng / ngày, không phân trang. p95 ≤ 500 ms.
- **Câu hỏi mở / TBD:** định dạng 仮番号 (`K{端末番号}-{連番}`) — Q-SC0302-01 ở wireframe SC-03-02.
