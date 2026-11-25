---
id: SPEC-INC_API-003
title: API — 期ロック (tính chính thức + đóng băng trong một transaction)
type: system
subtype: api-design
api_id: API-INC-003
endpoint: /api/v1/periods/{periodId}/lock
method: POST
media_type: application/json
feature: incentive
screen_id: [SC-09-04]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-09-04-001, SPEC-INC_ENGINE-001, SPEC-INC_FUNC-001, ADR-007, ADR-002, ADR-005, BR-INC-01, FR-INC-01, FR-INC-03, PRM-043, CAP-HUMAN-01]
---

# API-INC-003 — POST /api/v1/periods/{periodId}/lock

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-m01: Note `detail.openDays`; khách Q-INC-01: body `paymentCsvImportConfirmed`, 422 E-INC-014, thứ tự kiểm | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

**期ロック** một kỳ `OPEN`: trong **một transaction** chốt judgement 要確認, tính chính thức MAIN + DELTA mọi kỳ đã khóa có đầu vào đổi + CARRY / CARRY_EXPIRED, ghi kết quả append-only (gắn version + `inputHash`), ghi `period_billings` LOCK, dòng 端数調整 cho IF-ACC-01, đổi kỳ sang `LOCKED`, bảo đảm kỳ kế tồn tại, xếp email kết quả, ghi 監査ログ (INC_ENGINE_TECH K8). Không quay lại được; mỗi kỳ khóa một lần. Người gọi phải đã 試算 và gửi `inputHash` của lần đó.

**Xác thực:** Session cookie + `X-CSRF-Token` + **MFA hỏi lại mã** — header `X-MFA-Token` dùng một lần, `purpose = PERIOD_LOCK` (hành động không quay lại được, ADR-002 §2-6a; [api-conventions §4](../../../_common/api-conventions.md#4-mfa-step-up)). Quyền: `STL_HEAD` (hoặc 代行 hiệu lực).

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `periodId` | string | `6f1c2b7e-3a51-4c1e-9f6a-0d2a6b1c9e10` | uuid kỳ `OPEN` | |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` | | |
| 3 | Body Parameters | `expectedInputHash` | string | `3f9a0c…` | `inputHash` của lần 試算 người dùng đã xem (64 hex) | |
| 4 | Body Parameters | `judgements` | object | `{ "c0ffee00-0000-4000-8000-0000000000b8": { "decision": "NOT_KANNO", "reason": "振込手数料の差引と判断" } }` | Bắt buộc **đủ** cho mọi dòng `SUSPECT`, không thừa; `reason` 1..500 ký tự | `{}` khi không có dòng 要確認 |
| 5 | Body Parameters | `ackWarningCount` | Integer | `1` | Số cảnh báo ⚠ người dùng đã xác nhận ở C-31 (≥ 0) | |
| 6a | Body Parameters | `paymentCsvImportConfirmed` | Boolean | `true` | Tick 「支払期日分までの入金CSV取込済」 ở SC-09-04 [17]: 照合 xác nhận đã nhập đủ 入金 CSV có 入金日 tới 支払期日 (Q-INC-01) | Phải `true`; khác → 422 `E-INC-014` |
| 6 | Header Parameters | `X-MFA-Token` | string | `mfa_01JD…` | Token MFA dùng một lần do iam cấp sau khi nhập mã ở C-30 (`purpose = PERIOD_LOCK`, hạn 120 giây); không ghi log | |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đã khóa | <pre>{<br>  "periodCode": "2027-08",<br>  "status": "LOCKED",<br>  "lockedAt": "2027-09-14T10:20:00+09:00",<br>  "lockedBy": { "staffId": "5a5a5a5a-0000-4000-8000-000000000007", "name": "桜 七子", "delegationId": null },<br>  "runId": "9d9d9d9d-0000-4000-8000-000000000801",<br>  "inputHash": "3f9a0c…",<br>  "totals": { "mainCount": 56, "mainJpy": 412300, "deltaCount": 2, "deltaJpy": -1320, "carryCount": 1, "carryExpiredCount": 0, "payoutJpy": 412300 },<br>  "nextPeriod": { "code": "2027-09", "dueDate": "2027-10-08" },<br>  "notificationsQueued": 57<br>}</pre> | `payoutJpy` = Σ max(0, Σ người) ở kỳ này. `nextPeriod.dueDate` theo `PAYMENT_DUE_RULE` + lịch ngân hàng (vd. 2027-10-10 CN → 10-08, TV-05). Email gửi sau commit (outbox) |
| 2 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | Client về SC-00-01, giữ URL |
| 3 | 422 | Judgement thiếu / sai / body sai | <pre>{ "error": { "code": "E-INC-006", "message": "要確認の判断が入力されていない買受人が 1 件あります。", "detail": { "participantIds": ["c0ffee00-0000-4000-8000-0000000000b8"] } } }</pre> | Cũng có `E-INC-007`, `E-INC-011`, `E-CMN-007` |
| 3b | 422 | Chưa tick xác nhận 入金 CSV | <pre>{ "error": { "code": "E-INC-014", "message": "支払期日分までの入金CSVの取込を確認し、チェックを入れてください。", "field": "paymentCsvImportConfirmed", "detail": { "latestPaidOn": "2027-09-09", "dueDate": "2027-09-10" } } }</pre> | `detail.latestPaidOn` = 入金日 lớn nhất đã nhập (gợi ý, server không tự quyết) |
| 4 | 403 | Token MFA thiếu / hết hạn / đã dùng (chưa đăng nhập → 401 `E-CMN-001`) | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005`; chưa đăng nhập → 401 `E-CMN-001`. Sai mã 6 số do API xác thực MFA của iam trả, không phải API này |
| 5 | 403 | Không có quyền `STL_HEAD` / 代行 hết hạn / CSRF sai | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 6 | 404 | Kỳ không tồn tại | <pre>{ "error": { "code": "E-INC-001", "message": "指定された期が見つかりません。" } }</pre> | |
| 7 | 409 | Chưa đủ điều kiện khóa | <pre>{ "error": { "code": "E-INC-004", "message": "支払期日（2027/09/10）を過ぎていないため期ロックできません。", "detail": { "dueDate": "2027-09-10" } } }</pre> | Một trong: `E-INC-003` (kỳ trước chưa khóa, `detail.periodCode`), `E-INC-004`, `E-INC-005` (`detail.openDays`) |
| 8 | 409 | Đầu vào đổi sau 試算 | <pre>{ "error": { "code": "E-INC-008", "message": "試算後に入金・訂正などの入力が変わりました。もう一度試算してから期ロックしてください。", "detail": { "currentInputHash": "77b1e2…" } } }</pre> | Transaction rollback; không ghi gì |
| 9 | 409 | Số cảnh báo ⚠ đổi | <pre>{ "error": { "code": "E-INC-013", "message": "確認が必要な注意事項が 2 件あります。内容を確認してから期ロックしてください。", "detail": { "warningCount": 2 } } }</pre> | |
| 10 | 409 | Phiên khác đang khóa kỳ | <pre>{ "error": { "code": "E-INC-009", "message": "他の利用者がこの期を処理中です。しばらくしてから再度お試しください。" } }</pre> | `FOR UPDATE NOWAIT` thất bại |
| 11 | 423 | Kỳ đã khóa | <pre>{ "error": { "code": "E-INC-002", "message": "この期は期ロック済みです。訂正は修正申請で行い、差額は次の期ロックで計上されます。", "detail": { "lockedAt": "2027-09-14T10:20:00+09:00" } } }</pre> | Màn hiện C-24 |
| 12 | 500 | Dữ liệu quy chế / kỳ migrate hỏng, lỗi hệ thống | <pre>{ "error": { "code": "E-INC-010", "message": "適用規則版の交付率表に不備があります。システム管理者に連絡してください。", "traceId": "01JD…" } }</pre> | Rollback toàn bộ; `E-CMN-004` cho lỗi khác |

---

## 5. Other Notes

- Thứ tự kiểm (trả lỗi đầu tiên gặp): phiên → CSRF → quyền → MFA → khóa dòng kỳ (`E-INC-009`) → `E-INC-002` → `E-INC-003` → `E-INC-004` → `E-INC-005` → `E-INC-014` → `E-INC-013` → `E-INC-008` → judgement (`E-INC-006/007/011`).
- Không idempotent: gửi lại sau 200 → 423 `E-INC-002`. Màn chặn bấm hai lần (nút khóa sau lần bấm đầu).
- Timeout ứng dụng 30 giây; transaction mục tiêu ≤ 5 giây ở ~170 người mua (ADR-007 §1).
- Audit: `PERIOD_LOCK` gồm judgement + lý do, `inputHash`, tổng, người, 代行, thiết bị, thời điểm MFA (FR-AUDIT-01, FR-AUDIT-03).
- Điều kiện khóa (Q-INC-01, đã trả lời [Customer giả lập, 2026-11-25]): 業務日 > 支払期日 **và** `paymentCsvImportConfirmed = true`; 完納 xét theo 入金日 trên CSV, không theo ngày import. Tick lưu ở `incentive_runs.payment_csv_confirmed_at` (INCENTIVE_DB 4.51).
- **Câu hỏi mở / TBD:** 経理部 — giờ CSV ngân hàng về (Q-INC-01), Q-INC-03 (thời điểm tạo kỳ kế), E-01 / OPEN-DB-01 (định dạng dòng 端数調整 IF-ACC-01).
