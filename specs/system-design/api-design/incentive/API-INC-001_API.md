---
id: SPEC-INC_API-001
title: API — màn 期ロック (đọc kỳ, phân bổ 入金, cảnh báo)
type: system
subtype: api-design
api_id: API-INC-001
endpoint: /api/v1/periods/{periodId}/lock-view
method: GET
media_type: application/json
feature: incentive
screen_id: [SC-09-04]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-09-04-001, SPEC-INC_ENGINE-001, SPEC-INC_FUNC-001, SPEC-BILLING_DB-001, SPEC-CLOSE_DB-001, ADR-007, OPEN-L4-02]
---

# API-INC-001 — GET /api/v1/periods/{periodId}/lock-view

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Trả dữ liệu khối ① của SC-09-04: thông tin kỳ (支払期日, version), bảng phân bổ 入金 theo người mua (tiền nào gán vào kỳ nào — OPEN-L4-02), trạng thái 完納 sơ bộ (`OK` / `NG` / `SUSPECT`), cảnh báo ⚠, dòng 「前期以前の調整」, điều kiện khóa và `inputHash` hiện tại. Chỉ đọc, không ghi 監査ログ. Gọi khi mở màn và sau mỗi lần 期ロック / lỗi 409. Xử lý bên trong: INC_ENGINE_TECH K1, K3, K9.

**Xác thực:** Session cookie (`HttpOnly`, `SameSite=Strict` — ADR-002). Vai: `SETTLE`, quyền `STL_HEAD`, `OPS_HEAD`.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `periodId` | string | `6f1c2b7e-3a51-4c1e-9f6a-0d2a6b1c9e10` | uuid của `payment_periods` | |

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "period": {<br>    "id": "6f1c2b7e-3a51-4c1e-9f6a-0d2a6b1c9e10",<br>    "code": "2027-08",<br>    "startDate": "2027-08-01",<br>    "endDate": "2027-08-31",<br>    "dueDate": "2027-09-10",<br>    "dueDateShifted": false,<br>    "status": "OPEN",<br>    "fiscalYear": 2027<br>  },<br>  "ruleVersion": { "id": "a1b2c3d4-0000-4000-8000-000000000003", "versionNo": 3, "label": "第3版", "isBaseline": false },<br>  "fifoMode": "FIFO",<br>  "allocations": [<br>    {<br>      "participantId": "c0ffee00-0000-4000-8000-0000000000b7",<br>      "buyerNo": "B07",<br>      "participantClass": "BAIBAI",<br>      "payableInclJpy": 54000,<br>      "paidInWindowJpy": 66000,<br>      "paidOnTimeJpy": 54000,<br>      "breakdown": [<br>        { "periodCode": "2027-07", "amountJpy": 12000, "method": "FIFO", "isOnTime": true },<br>        { "periodCode": "2027-08", "amountJpy": 54000, "method": "FIFO", "isOnTime": true }<br>      ],<br>      "kannoStatus": "OK",<br>      "shortfallJpy": 0,<br>      "warnings": ["OLD_PERIOD_ALLOCATION"]<br>    }<br>  ],<br>  "warnings": [ { "code": "OLD_PERIOD_ALLOCATION", "participantId": "c0ffee00-0000-4000-8000-0000000000b7" } ],<br>  "warningCount": 1,<br>  "priorPeriodAdjustments": [ { "buyerNo": "N04", "periodCode": "2027-07", "amountInclJpy": -41040 } ],<br>  "lockConditions": {<br>    "previousPeriodLocked": true,<br>    "allBusinessDaysLocked": true,<br>    "afterDueDate": true,<br>    "suspectCount": 1<br>  },<br>  "inputHash": "3f9a0c…(64 ký tự hex)",<br>  "lastPreview": { "at": "2027-09-14T14:05:00+09:00", "inputHash": "3f9a0c…", "totalIncentiveJpy": 412300 },<br>  "permissions": { "canPreview": true, "canJudge": true, "canLock": true }<br>}</pre> | `paidInWindowJpy` = Σ 入金 của người đó có `paid_on ≤ due_date` và có ít nhất một phân bổ vào kỳ (cột 期日内入金 của [4]); `paidOnTimeJpy` = OT, phần đã phân bổ vào **kỳ này** đúng hạn (dùng xét 完納). `kannoStatus`: `OK` / `NG` / `SUSPECT` (K3). `warnings[].code`: `OLD_PERIOD_ALLOCATION`, `OVERPAYMENT`, `UNMAPPED_PAYMENT` (K9-2). `dueDateShifted` = 支払期日 bị lùi vì ngày 10 là ngày ngân hàng nghỉ. `priorPeriodAdjustments`: điều chỉnh của kỳ đã khóa, không cộng vào `payableInclJpy`. `lastPreview` NULL khi chưa 試算. `permissions` theo vai người gọi (màn dùng để ẩn nút, server vẫn kiểm lại). Kỳ `LOCKED` vẫn trả 200 (`status: "LOCKED"`, `lockConditions` NULL) |
| 2 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | Mã chung (iam) |
| 3 | 403 | Vai không được xem | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | Mã chung; màn hiện C-25 |
| 4 | 404 | Kỳ không tồn tại | <pre>{ "error": { "code": "E-INC-001", "message": "指定された期が見つかりません。", "detail": { "periodId": "6f1c2b7e-3a51-4c1e-9f6a-0d2a6b1c9e10" } } }</pre> | |
| 5 | 422 | `periodId` không phải uuid | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "periodId": "uuid形式で指定してください" } } }</pre> | Mã chung |
| 6 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | Màn hiện C-26 + `trace_id` |

---

## 5. Other Notes

- Thời gian đáp ứng mục tiêu ≤ 2 giây với ~170 người mua (NFR-PERF-01); đọc trong một snapshot (`REPEATABLE READ`) để `inputHash` khớp với số trả về.
- `inputHash` không lộ dữ liệu (SHA-256 của tập đầu vào); dùng để màn biết 試算 cũ (SC-09-04 §6.1).
- **Câu hỏi mở / TBD:** E-02 (có 請求番号 trong file 入金 không — đổi `fifoMode`); OPEN-DB-08 (cách thu khoản 「前期以前の調整」).
