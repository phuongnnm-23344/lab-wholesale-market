---
id: SPEC-STL_API-001
title: Checklist 日次締め (11 mục chuẩn ADR-005 §2.5)
type: system
subtype: api-design
api_id: API-STL-001
endpoint: /api/v1/business-days/{businessDate}/close-checklist
method: GET
media_type: application/json
feature: settle
screen_id: [SC-07-02]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-07-02-001, SPEC-STL_DAY_CLOSE-001, SPEC-CLOSE_DB-001, ADR-005]
---

# API-STL-001 — GET /api/v1/business-days/{businessDate}/close-checklist

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Trả trạng thái 業務日, tổng tiền (相対 / せり), 11 mục checklist (6 ✖ chặn, 5 ⚠) đúng danh sách ADR-005 §2.5 / CLOSE_DB 4.24, danh sách máy chưa đồng bộ và `checklistVersion`. Ngày đã khóa → trả ảnh chụp lúc khóa. Gọi khi mở SC-07-02 và mỗi lần quay lại màn.

**Xác thực:** Session cookie `sid` (đọc — không cần CSRF)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `businessDate` | string | `2027-08-02` | `YYYY-MM-DD` |  |

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Thành công (ngày chưa khóa) | <pre>{<br>&nbsp;&nbsp;"businessDate": "2027-08-02",<br>&nbsp;&nbsp;"status": "OPEN",<br>&nbsp;&nbsp;"totals": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"aitaiJpy": 11140000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"seriJpy": 1241000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"allJpy": 12381000<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"items": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 6,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "確定待ちの取引（下書き・確認待ち）",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "BLOCK",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-04-02"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 2,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 4,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "未確認のせり結果",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "BLOCK",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-05-02"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 3,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 8,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "未同期の端末",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "BLOCK",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-03-07"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 4,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 7,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "オフライン同期・後入力の要確認",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "BLOCK",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-03-07"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 5,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 9,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "閾値以上・買受人変更の当日訂正（未確認）",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "BLOCK",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-07-01"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 6,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 20,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "金額が変わる引渡し例外",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "BLOCK",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-07-01"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 7,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 10,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "販売残のあるロット（持ち越し）",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "WARN",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 4,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-03-03"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 8,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 12,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "引渡し残",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "WARN",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 12,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-06-01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"requiresAck": true<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 9,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 21,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "閾値未満の当日訂正・取消",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "WARN",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 2,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-07-01"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 10,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 11,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "未確認の争いのある引渡し",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "WARN",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-06-05"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 11,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 5,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "入力者本人が確認したせり",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "WARN",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-07-01"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"devices": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deviceId": "dv-3…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"code": "TAB-03",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"location": "第2バース",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"lastSyncedAt": "2027-08-02T07:12:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"pendingCount": 5<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"checklistVersion": "sha256:4f1c…",<br>&nbsp;&nbsp;"canClose": false,<br>&nbsp;&nbsp;"delegatedFor": null,<br>&nbsp;&nbsp;"lockedInfo": null<br>}</pre> | `level`: `BLOCK` ✖ · `WARN` ⚠. `itemNo` = số item SC-07-02; `adrNo` = số ADR-005 §2.5. `requiresAck` (mục #8) → phải tick [13]. `canClose` = không còn `BLOCK` > 0 (client vẫn phải tick / gõ ngày). `delegatedFor`: tên 照合部門長 khi người xem là 代行. Ngày `LOCKED` → `status = LOCKED`, `items` = ảnh chụp, `lockedInfo = {lockedBy, lockedAt, delegatedFor, excludedDevices[]}` |
| 2 | 422 | Body / query sai kiểu hoặc thiếu trường (zod) | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "field": "message" } } }</pre> | `E-CMN-007` |
| 3 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 4 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 5 | 404 | Không có 業務日 | <pre>{ "error": { "code": "E-STL-012", "message": "指定の業務日が存在しません" } }</pre> | `E-STL-012` |
| 6 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Vai đọc: STL-HEAD, 代行 STL_HEAD, SETTLE.
- Một hàm `fn_day_close_checklist` dùng chung cho API này và cho kiểm lúc khóa (API-STL-002) — không có hai cách đếm.
- p95 ≤ 1 giây.
- **Câu hỏi mở / TBD:** không có
