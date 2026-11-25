---
id: SPEC-TRD_API-006
title: Xác nhận kết quả phiên せり
type: system
subtype: api-design
api_id: API-TRD-006
endpoint: /api/v1/seri-sessions/{sessionId}/confirm
method: POST
media_type: application/json
feature: trade
screen_id: [SC-05-02]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-05-02-001, SPEC-TRADE_FUNC-001, SPEC-TRADE_SERI_CONFIRM-001, SPEC-TRADE_QUALIFICATION_CHECK-001]
---

# API-TRD-006 — POST /api/v1/seri-sessions/{sessionId}/confirm

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

確認者 (người quyết cuối — CAP-HUMAN-01) xác nhận các dòng đã chọn của phiên せり. Tất cả hoặc không: mỗi dòng được chọn được kiểm lại 許可 / 承認 + SL + 参加上限 (chỉ 売買参加者, cộng dồn) tại lúc gọi; dòng không chọn mà hệ thống xác định **không xác nhận được** bị hủy có lịch sử; dòng không chọn mà xác nhận được → lỗi (phải 差し戻し trước). Xử lý: [TRADE_SERI_CONFIRM_TECH](../../../trade/technical-design/TRADE_SERI_CONFIRM_TECH.md).

**Xác thực:** Session cookie. Vai: TRADE. Không MFA. Bắt buộc online.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `sessionId` | string | `e7f8a9b0-0000-4000-8000-000000000003` | UUID phiên | |
| 2 | Body Parameters | `confirmTradeIds` | string[] | `["f000…0301","f000…0302"]` | ≥ 1 id dòng `PENDING` của phiên | |
| 3 | Body Parameters | `overLimitReasons` | object | `{ "f000…0302": { "code": "PRIOR_CONSENT", "note": null } }` | Khóa = `tradeId`; `code` ∈ `PRIOR_CONSENT` · `DEPOSIT_TOPUP` · `OTHER`; `note` ≤ 200, bắt buộc khi `OTHER` | `[optional]` |
| 4 | Body Parameters | `samePersonReason` | string | `確認者不在のため` | ≤ 200; bắt buộc khi người gọi là 入力者 | `[optional]` |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã xác nhận | <pre>{<br>  "confirmedCount": 11,<br>  "cancelledTradeNos": ["せり-0303"],<br>  "sessionStatus": "CONFIRMED",<br>  "confirmedAt": "2027-08-02T03:52:00+09:00"<br>}</pre> | `sessionStatus = ENTERING` khi còn dòng đang 差し戻し |
| 2 | 401 | Chưa đăng nhập | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | Không có vai TRADE | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | Phiên không tồn tại | <pre>{ "error": { "code": "E-TRD-024", "message": "対象のせりの回が見つかりません" } }</pre> | |
| 5 | 409 | Phiên không chờ xác nhận | <pre>{ "error": { "code": "E-TRD-013", "message": "この回は確認待ちではありません（確定済）" } }</pre> | |
| 6 | 409 | Dòng đổi trạng thái | <pre>{ "error": { "code": "E-TRD-018", "message": "確認中に状態が変わった行があります。一覧を更新してください（せり-0305）", "detail": { "rows": [ { "displayNo": "せり-0305", "reason": "INSUFFICIENT_QTY" } ] } } }</pre> | Không dòng nào được ghi |
| 7 | 409 | Trước giờ chốt / deadlock | <pre>{ "error": { "code": "E-TRD-012", "message": "取引の確定は 02:00 以降にできます" } }</pre> | Hoặc `E-CMN-006` |
| 8 | 422 | Thiếu lý do vượt hạn mức | <pre>{ "error": { "code": "E-TRD-007", "message": "今期の参加上限を超えます。超過理由を選択してください（上限 ¥3,000,000 / 今期確定済 ¥2,990,000 / 今回 ¥29,750）", "detail": { "tradeNos": ["せり-0302"] } } }</pre> | Hoặc `E-TRD-008` |
| 9 | 422 | Lỗi điều kiện khác | <pre>{ "error": { "code": "E-TRD-014", "message": "入力者と同じ人が確認する場合は理由を入力してください", "field": "samePersonReason" } }</pre> | Mã có thể: `E-TRD-014`, `015`, `016`, `E-CMN-007` |
| 10 | 423 | 業務日 đã khóa | <pre>{ "error": { "code": "E-CMN-003", "message": "2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。" } }</pre> | |
| 11 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. Other Notes

- Lý do vượt gửi cho dòng 仲卸 / dòng không vượt bị bỏ qua.
- **Câu hỏi mở / TBD:** Q-TRD-04, Q-TRD-05.
