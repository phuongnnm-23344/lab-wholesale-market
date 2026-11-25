---
id: SPEC-LOT_API-002
title: 本登録 lô
type: system
subtype: api-design
api_id: API-LOT-002
endpoint: /api/v1/lots
method: POST
media_type: application/json
feature: lot
screen_id: [SC-03-01]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-03-01-001, SPEC-LOT_FUNC-001, SPEC-LOT_REGISTER-001]
---

# API-LOT-002 — POST /api/v1/lots

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

本登録: hoàn tất một lô 仮受付 hoặc tạo lô 新規 ở quầy 受付 (SC-03-01 [9]). Lô → `RECEIVED`, sổ SL thêm dòng `RECEIVE`. Nghi trùng (cùng 出荷者 · 品目 · SL trong 10 phút) trả 409 để client hỏi lại; gửi lại với `confirmDuplicate=true` thì ghi. Xử lý từng bước: [LOT_REGISTER_TECH](../../../lot/technical-design/LOT_REGISTER_TECH.md).

**Xác thực:** Session cookie. Vai: INTAKE. Không MFA (PREMISE §3.2 "tiếp nhận lô").

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Body Parameters | `provisionalLotId` | string | `6f1c2a4e-0000-4000-8000-000000000012` | UUID lô 仮受付; `null` = lô 新規 | `[optional]` |
| 2 | Body Parameters | `shipperId` | string | `0b6d…-0021` | UUID 出荷者 trong master (lấy từ API-LOT-005) | |
| 3 | Body Parameters | `itemCode` | string | `MADAI` | Mã 品目, 1–10 ký tự | |
| 4 | Body Parameters | `unit` | string | `KG` | `KG` · `CASE` · `PIECE` | |
| 5 | Body Parameters | `qty` | number | `118.5` | > 0, ≤ 99,999,999.9; `KG` tối đa 1 chữ số lẻ, `CASE` / `PIECE` số nguyên | |
| 6 | Body Parameters | `voucherNo` | string | `S-20270802-031` | Số 紙伝票, ≤ 20, `[A-Za-z0-9-]` | `[optional]` |
| 7 | Body Parameters | `confirmDuplicate` | boolean | `false` | `true` khi người dùng đã xác nhận ở hộp [13] | `[optional]` mặc định `false` |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | Đã 本登録 | <pre>{<br>  "lotId": "6f1c2a4e-0000-4000-8000-000000000012",<br>  "lotNo": "L20270802-15",<br>  "status": "RECEIVED"<br>}</pre> | `lotNo` dùng cho toast C-12 |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Không có vai INTAKE | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | `provisionalLotId` không tồn tại | <pre>{ "error": { "code": "E-LOT-014", "message": "対象のロットが見つかりません" } }</pre> | |
| 5 | 409 | 仮受付 đã được 本登録 | <pre>{ "error": { "code": "E-LOT-006", "message": "この仮受付はすでに本登録済みです（L20270802-15）" } }</pre> | Client nạp lại [1] |
| 6 | 409 | Nghi trùng | <pre>{ "error": { "code": "E-LOT-007", "message": "同じ出荷者・品目・数量のロットが10分以内に登録されています（L20270802-14）。登録しますか？", "detail": { "duplicateLotNo": "L20270802-14" } } }</pre> | Không phải lỗi cứng: gửi lại `confirmDuplicate=true` |
| 7 | 409 | Tranh chấp khóa (deadlock) | <pre>{ "error": { "code": "E-CMN-006", "message": "同時に操作が行われました。もう一度お試しください" } }</pre> | |
| 8 | 422 | Dữ liệu sai | <pre>{ "error": { "code": "E-LOT-004", "message": "kg は小数第1位まで、箱・尾は整数で入力してください", "field": "qty" } }</pre> | Mã có thể: `E-LOT-001`, `002`, `003`, `004`, `005`, `015`, `016`, `E-CMN-007`; `field` = key ở mục 3 |
| 9 | 423 | 業務日 đã khóa | <pre>{ "error": { "code": "E-CMN-003", "message": "2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。" } }</pre> | Client hiện C-24, giữ nội dung |
| 10 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- Không idempotent: client khóa nút [9] khi đang gửi. Lô 新規 bấm hai lần nhanh → lần hai bị 409 `E-LOT-007` (nghi trùng) — chủ ý.
- **Câu hỏi mở / TBD:** Q-LOT-01 (thời điểm cấp `lotNo`) — [LOT_FUNC §3](../../../lot/function-specifications/LOT_FUNC.md#3-mã-lỗi-câu-hỏi-giả-định-của-module).
