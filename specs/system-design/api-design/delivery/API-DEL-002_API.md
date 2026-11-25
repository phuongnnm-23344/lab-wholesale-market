---
id: SPEC-DEL_API-002
title: Snapshot dữ liệu giao cho chế độ offline
type: system
subtype: api-design
api_id: API-DEL-002
endpoint: /api/v1/deliveries/offline-snapshot
method: GET
media_type: application/json
feature: delivery
screen_id: [SC-06-02]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-06-02-001, SPEC-DEL_RECORD-001, ADR-008]
---

# API-DEL-002 — GET /api/v1/deliveries/offline-snapshot

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

Trả toàn bộ GD còn 残 (tối đa 7 業務日 gần nhất) và danh sách người mua để PWA lưu IndexedDB — dùng tìm kiếm khi mất mạng (ADR-008 §2.2-7a). Gọi đầu ca và sau mỗi lần đồng bộ xong.

**Xác thực:** Session cookie `sid` (đọc — không cần CSRF)

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Header Parameters | `X-Device-Id` | string | `TAB-03` | Mã thiết bị đã đăng ký (cũng có trong phiên; header để đối chiếu) |  |

> Quy ước chung (Param Type, Data Type, `[optional]`, body lỗi `{ "error": {…} }`, MFA, khóa lạc quan, idempotency): [`_common/api-conventions.md`](../../../_common/api-conventions.md) · mã lỗi chung `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Thành công | <pre>{<br>&nbsp;&nbsp;"snapshotAt": "2027-08-02T06:58:00+09:00",<br>&nbsp;&nbsp;"businessDate": "2027-08-02",<br>&nbsp;&nbsp;"buyers": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "サンプル仲卸1"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"trades": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeId": "t-0005…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeNo": "相対-0005",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemName": "鰹",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unit": "KG",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"confirmedQty": 30.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deliveredQty": 12.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"remainingQty": 18.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isCarryOver": false<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> | Không có giá / tiền (giảm dữ liệu nhạy cảm trên máy). `snapshotAt` hiện ở SC-06-02 [16]. Header `Cache-Control: no-store` |
| 2 | 401 | Chưa đăng nhập / phiên hết hạn | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 3 | 403 | Vai / quyền duyệt không đủ | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 4 | 403 | Thiết bị chưa đăng ký / đã 「端末回収不能」 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません", "detail": { "deviceId": "TAB-03" } } }</pre> | `E-CMN-002` |
| 5 | 500 | Lỗi hệ thống | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. Other Notes

- Vai: DELIVERY, DEL-HEAD; chỉ thiết bị `DELIVERY_TABLET` / `DOCK_TABLET` `is_active`.
- Kích thước dự kiến < 300 KB (≈ 1.200 GD / ngày × phần còn 残).
- **Câu hỏi mở / TBD:** Q-DEL-02 (số ngày 前日残 trong snapshot)
