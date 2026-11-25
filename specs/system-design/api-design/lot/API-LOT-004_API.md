---
id: SPEC-LOT_API-004
title: Ghi kết quả 目利き・下見
type: system
subtype: api-design
api_id: API-LOT-004
endpoint: /api/v1/lots/inspections
method: POST
media_type: application/json
feature: lot
screen_id: [SC-03-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-03-05-001, SPEC-LOT_FUNC-001, SPEC-LOT_INSPECTION_RECORD-001]
---

# API-LOT-004 — POST /api/v1/lots/inspections

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Ghi một kết quả 目利き (hạng, 所見) **do người đánh giá quyết** cho 1–50 lô; mỗi lô một dòng, cùng `batchNo`. Tất cả hoặc không. Không có đầu vào nào để hệ thống chấm / gợi ý hạng (CAP-HUMAN-01, ADR-010). Xử lý: [LOT_INSPECTION_RECORD_TECH](../../../lot/technical-design/LOT_INSPECTION_RECORD_TECH.md).

**Xác thực:** Session cookie. Vai: JUDGE. Không MFA.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Body Parameters | `lotIds` | string[] | `["6f1c…0003","6f1c…0004"]` | 1–50 UUID, không trùng | |
| 2 | Body Parameters | `grade` | string | `A` | Mã hạng thuộc `grades[]` của API-LOT-006 | |
| 3 | Body Parameters | `note` | string | `色つや良好` | 所見, ≤ 200 ký tự | `[optional]` |
| 4 | Body Parameters | `secondCheckerEmployeeNo` | string | `10234` | Mã NV người xác nhận thứ hai, ≤ 10, ≠ người ghi | `[optional]` |
| 5 | Body Parameters | `rerecordReason` | string | `取引後に再確認` | ≤ 200; bắt buộc khi có lô đã có GD | `[optional]` |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | Đã ghi | <pre>{<br>  "count": 3,<br>  "batchNo": "c2f0a9b1-0000-4000-8000-0000000000aa",<br>  "recordedAt": "2027-08-02T03:25:00+09:00",<br>  "recordedByName": "桜 二郎"<br>}</pre> | Dùng cho toast C-12 |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Không có vai JUDGE | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | Có id lô không tồn tại | <pre>{ "error": { "code": "E-LOT-014", "message": "対象のロットが見つかりません" } }</pre> | |
| 5 | 409 | Lô không ghi được | <pre>{ "error": { "code": "E-LOT-013", "message": "ロット L20270802-9 は下見を記録できない状態です（仮受付）", "detail": { "lotNo": "L20270802-9" } } }</pre> | Không lô nào được ghi |
| 6 | 409 | Deadlock | <pre>{ "error": { "code": "E-CMN-006", "message": "同時に操作が行われました。もう一度お試しください" } }</pre> | |
| 7 | 422 | Dữ liệu sai | <pre>{ "error": { "code": "E-LOT-011", "message": "取引のあるロットを再記録する場合は理由を入力してください", "field": "rerecordReason" } }</pre> | Mã có thể: `E-LOT-008`, `009`, `010`, `011`, `012`, `017` |
| 8 | 423 | 業務日 đã khóa | <pre>{ "error": { "code": "E-CMN-003", "message": "2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。" } }</pre> | |
| 9 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- `secondCheckerEmployeeNo` → `lot_inspections.second_checker_id` (tra theo 社員番号), `rerecordReason` → `rerecord_reason` — LOT_DB 0.2.1 §4.27.
- **Câu hỏi mở / TBD:** Q-LOT-03 (danh mục hạng thật), Q-LOT-04 (báo người chốt khi ghi lại lô có GD).
