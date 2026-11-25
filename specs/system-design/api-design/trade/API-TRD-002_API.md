---
id: SPEC-TRD_API-002
title: Chốt GD 相対 (luồng chính)
type: system
subtype: api-design
api_id: API-TRD-002
endpoint: /api/v1/trades/aitai
method: POST
media_type: application/json
feature: trade
screen_id: [SC-04-01]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-04-01-001, SPEC-TRADE_FUNC-001, SPEC-TRADE_AITAI_CONFIRM-001, SPEC-TRADE_QUALIFICATION_CHECK-001]
---

# API-TRD-002 — POST /api/v1/trades/aitai

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Chốt một GD 相対 (luồng chính) trong một transaction: khóa lô + kiểm SL, kiểm 許可 (仲卸) / 承認 + 参加上限 theo kỳ (売買参加者) tại thời điểm chốt, ghi GD `CONFIRMED` + 3 sự kiện FIG-012, trừ SL lô. Người chốt = người đang đăng nhập (không nhận từ client). Xử lý: [TRADE_AITAI_CONFIRM_TECH](../../../trade/technical-design/TRADE_AITAI_CONFIRM_TECH.md).

**Xác thực:** Session cookie. Vai: TRADE. Không MFA (PREMISE §3.2). Bắt buộc online.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Body Parameters | `lotId` | string | `6f1c2a4e-0000-4000-8000-000000000005` | UUID lô (từ API-LOT-003 `onSale=true`) | |
| 2 | Body Parameters | `buyerId` | string | `a1b2c3d4-0000-4000-8000-0000000000n1` | UUID người mua (từ API-TRD-001) | |
| 3 | Body Parameters | `qty` | number | `2.0` | > 0; số lẻ theo đơn vị lô (kg 1 chữ số, 箱 / 尾 nguyên) — kiểm ở server | |
| 4 | Body Parameters | `unitPriceJpy` | Integer | `1200` | Đơn giá 税抜, 1–99,999,999 | |
| 5 | Body Parameters | `overLimitReasonCode` | string | `PRIOR_CONSENT` | `PRIOR_CONSENT` · `DEPOSIT_TOPUP` · `OTHER` — chỉ dùng khi 売買参加者 vượt 参加上限 | `[optional]` |
| 6 | Body Parameters | `overLimitNote` | string | `電話で了承済` | ≤ 200; bắt buộc khi `OTHER` | `[optional]` |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | Đã 確定 | <pre>{<br>  "tradeId": "d4e5f6a7-0000-4000-8000-000000000005",<br>  "tradeNo": "A20270802-0005",<br>  "displayNo": "相対-0005",<br>  "amountJpy": 2400,<br>  "availableQtyAfter": 64.0,<br>  "overLimit": false,<br>  "confirmedAt": "2027-08-02T04:31:12+09:00"<br>}</pre> | `availableQtyAfter` cập nhật [2]; `displayNo` dùng cho toast C-12 và phiếu |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Không có vai TRADE | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | Lô không tồn tại | <pre>{ "error": { "code": "E-LOT-014", "message": "対象のロットが見つかりません" } }</pre> | |
| 5 | 409 | Lô không bán / SL thiếu | <pre>{ "error": { "code": "E-TRD-002", "message": "残数量が 1.0kg に変わりました（不足しています）", "field": "qty", "detail": { "availableQty": 1.0, "unit": "KG" } } }</pre> | Hoặc `E-TRD-001` (`detail.status`) |
| 6 | 409 | Trước giờ chốt | <pre>{ "error": { "code": "E-TRD-012", "message": "取引の確定は 02:00 以降にできます" } }</pre> | |
| 7 | 409 | Deadlock | <pre>{ "error": { "code": "E-CMN-006", "message": "同時に操作が行われました。もう一度お試しください" } }</pre> | Client kiểm API-TRD-003 trước khi bấm lại |
| 8 | 422 | Tư cách không hợp lệ (許可) | <pre>{ "error": { "code": "E-TRD-005", "message": "仲卸の許可が有効ではないため確定できません（失効・有効期限 2027/07/31）", "field": "buyerId" } }</pre> | 承認 → `E-TRD-006` 「売買参加者の承認が…」 — **hai mã, hai câu** (luật 2); `E-TRD-003`, `004` cùng `field` |
| 9 | 422 | Vượt 参加上限 chưa có lý do | <pre>{ "error": { "code": "E-TRD-007", "message": "今期の参加上限を超えます。超過理由を選択してください（上限 ¥5,000,000 / 今期確定済 ¥4,990,000 / 今回 ¥24,000）", "detail": { "limitJpy": 5000000, "usedJpy": 4990000, "amountJpy": 24000 } } }</pre> | Client mở hộp [13] |
| 10 | 422 | Dữ liệu sai khác | <pre>{ "error": { "code": "E-TRD-010", "message": "kg は小数第1位まで、箱・尾は整数で入力してください", "field": "qty" } }</pre> | Mã có thể: `E-TRD-008`, `009`, `010`, `011`, `E-CMN-007` |
| 11 | 423 | 業務日 đã khóa | <pre>{ "error": { "code": "E-CMN-003", "message": "2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。" } }</pre> | |
| 12 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- Không idempotent — client khóa nút khi đang gửi; timeout không tự gửi lại (SC-04-01 §5).
- Lý do vượt gửi kèm khi **không** vượt (hoặc người mua là 仲卸) bị bỏ qua, không lưu.
- **Câu hỏi mở / TBD:** Q-TRD-01 (định dạng `displayNo`), Q-TRD-02.
