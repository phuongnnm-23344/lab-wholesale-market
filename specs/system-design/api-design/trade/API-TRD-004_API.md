---
id: SPEC-TRD_API-004
title: In 取引確認票 (in thẳng / in lại)
type: system
subtype: api-design
api_id: API-TRD-004
endpoint: /api/v1/trades/{tradeId}/slip-prints
method: POST
media_type: application/json
feature: trade
screen_id: [SC-04-01, SC-04-02, SC-04-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-04-01-001, SPEC-TRADE_FUNC-001]
---

# API-TRD-004 — POST /api/v1/trades/{tradeId}/slip-prints

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Sinh PDF 取引確認票 của một GD theo mẫu FORM và ghi `print_logs` (`TRADE_SLIP`). Gọi ngay sau khi chốt (SC-04-01 — PC in thẳng, không xem trước, M05), khi in lại (SC-04-02, phiếu có 「再発行」) và sau 当日訂正 (phiếu có 「訂正」 / 「取消」). Lần in thứ hai trở đi server tự đánh `is_reissue = true`. Function: [TRADE_FUNC 2.6](../../../trade/function-specifications/TRADE_FUNC.md#26-printtradeslip).

**Xác thực:** Session cookie. Vai: TRADE. Không MFA (PREMISE §3.2 "In / in lại 取引確認票").

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `tradeId` | string | `d4e5f6a7-0000-4000-8000-000000000005` | UUID GD | |
| 2 | Body Parameters | `isReissue` | boolean | `false` | Client nghĩ là in lại hay không — chỉ để đối chiếu; server quyết theo `print_logs` | `[optional]` |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | PDF phiếu | <pre>(binary application/pdf)</pre> | Header `Content-Type: application/pdf`, `Content-Disposition: inline; filename="torihiki-A20270802-0005.pdf"`, `X-Print-Log-Id`, `X-Reissue: false` |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Không có vai TRADE | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | GD không tồn tại | <pre>{ "error": { "code": "E-TRD-023", "message": "対象の取引が見つかりません" } }</pre> | |
| 5 | 409 | GD đã hủy (không phải lần in phiếu hủy ngay sau 取消) | <pre>{ "error": { "code": "E-TRD-025", "message": "取消済みの取引の取引確認票は出力できません" } }</pre> | |
| 6 | 500 | Lỗi sinh PDF | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | Client hiện SC-04-01 [12]; GD vẫn 確定 |

---

## 5. Other Notes

- POST vì có ghi `print_logs`. Không ghi log nếu sinh PDF lỗi.
- Nội dung phiếu (mẫu FORM, trường bắt buộc) thuộc module `report` — chưa có Technical Design.
- **Câu hỏi mở / TBD:** Q-TRD-03 (cách in thẳng ở PC hiện trường).
