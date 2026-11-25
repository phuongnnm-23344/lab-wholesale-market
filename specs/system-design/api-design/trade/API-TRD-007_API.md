---
id: SPEC-TRD_API-007
title: 差し戻し dòng kết quả せり về 入力者
type: system
subtype: api-design
api_id: API-TRD-007
endpoint: /api/v1/seri-sessions/{sessionId}/send-back
method: POST
media_type: application/json
feature: trade
screen_id: [SC-05-02]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-05-02-001, SPEC-TRADE_FUNC-001, SPEC-TRADE_SERI_CONFIRM-001]
---

# API-TRD-007 — POST /api/v1/seri-sessions/{sessionId}/send-back

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Trả các dòng kết quả せり nhập sai về 入力者 sửa ở SC-05-01: dòng `PENDING` → `DRAFT`, sự kiện `REJECT` có lý do, thông báo in-app cho 入力者. Không trừ SL, phiên giữ `ENTERING`. Function: [TRADE_FUNC 2.10](../../../trade/function-specifications/TRADE_FUNC.md#210-appfn_send_back_seri_results); bước: [TRADE_SERI_CONFIRM_TECH §4.5](../../../trade/technical-design/TRADE_SERI_CONFIRM_TECH.md#45-差し戻し-fn_send_back_seri_results-api-trd-007).

**Xác thực:** Session cookie. Vai: TRADE.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `sessionId` | string | `e7f8a9b0-0000-4000-8000-000000000003` | UUID phiên | |
| 2 | Body Parameters | `tradeIds` | string[] | `["f000…0304"]` | ≥ 1 id dòng `PENDING` của phiên | |
| 3 | Body Parameters | `reason` | string | `単価の入力誤り` | 1–200 ký tự | |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã 差し戻し | <pre>{ "sentBackCount": 1 }</pre> | |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Không có vai TRADE | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | Phiên không tồn tại | <pre>{ "error": { "code": "E-TRD-024", "message": "対象のせりの回が見つかりません" } }</pre> | |
| 5 | 409 | Phiên không `ENTERING` / dòng không `PENDING` | <pre>{ "error": { "code": "E-TRD-018", "message": "確認中に状態が変わった行があります。一覧を更新してください（せり-0304）" } }</pre> | Hoặc `E-TRD-013` |
| 6 | 422 | Thiếu lý do | <pre>{ "error": { "code": "E-TRD-017", "message": "差し戻しの理由を入力してください", "field": "reason" } }</pre> | |
| 7 | 423 | 業務日 đã khóa | <pre>{ "error": { "code": "E-CMN-003", "message": "2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。" } }</pre> | |
| 8 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- Thông báo in-app ghi qua outbox của module notify; lỗi gửi không làm hỏng 差し戻し.
- **Câu hỏi mở / TBD:** Q-TRD-04.
