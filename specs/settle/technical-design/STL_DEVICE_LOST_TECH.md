---
id: SPEC-STL_DEVICE_LOST-001
title: 端末回収不能 — loại thiết bị hỏng / mất khỏi checklist 日次締め
type: system
subtype: detail-design
design_id: STL_DEVICE_LOST
function: markDeviceLost
endpoint: POST /api/v1/devices/{deviceId}/lost
component: DayCloseService
feature: settle
version: "0.1.2"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-07-02-001, SPEC-STL_DAY_CLOSE-001, API-STL-003, SPEC-IAM_AUDIT_DB-001, ADR-005, ADR-008, ADR-002, NFR-AVL-02]
---

# STL_DEVICE_LOST — 端末回収不能

> Biểu mẫu: **BM-2-901-53 v01** — Detail Design (Chart + Description) · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Mục / Bước | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | — | Khởi tạo | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | — | Gate 2 G2-M02: Điều kiện hoàn thành (LAB-5) | 2026-11-25 | phuongnnm-23344 |  |
| 3 | 0.1.2 | Update | §2 | FB-EXP-236: nhúng ảnh PNG `./assets/STL_DEVICE_LOST_sequence.png` xuất từ khối Mermaid (`scripts/export-mermaid-png.py`); Mermaid vẫn là nguồn | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. Sequence diagram

![STL_DEVICE_LOST sequence](./assets/STL_DEVICE_LOST_sequence.png)

Nguồn: khối Mermaid dưới (bản để sửa); ảnh sinh từ chính khối đó bằng `python scripts/export-mermaid-png.py STL_DEVICE_LOST` — sửa Mermaid thì chạy lại để hai bản không lệch.

```mermaid
sequenceDiagram
    autonumber
    actor H as 照合部門長 / 代行
    participant API as Route handler /api/v1
    participant DayCloseService
    participant IAM as iam (MFA purpose token)
    participant DB as PostgreSQL (app.fn_device_mark_lost)

    H->>IAM: xác thực mã MFA (purpose DEVICE_LOST)
    IAM-->>H: mfaToken
    H->>API: POST /devices/{id}/lost {reason} + X-MFA-Token
    API->>IAM: tiêu thụ mfaToken
    API->>DayCloseService: markDeviceLost(ctx, id, reason)
    DayCloseService->>DB: fn_device_mark_lost(...)
    DB->>DB: FOR UPDATE devices · ghi lost_* · is_active=false · thu hồi staff_sessions của máy
    DB->>DB: audit_logs (lý do, 代行, MFA, số bản ghi chờ lúc báo)
    DB-->>API: device
```

---

## 3. Description

Lối thoát duy nhất khi checklist 日次締め bị một thiết bị hỏng / mất / hết pin giữ lại (ADR-005 §2.6, khách #1). Không phải "khóa bỏ qua checklist": chỉ loại **đúng máy đó** khỏi mục #3; mọi mục ✖ khác vẫn chặn. Bản ghi chưa đồng bộ coi như mất → nhập bù từ giấy (後入力); nếu máy về sau đồng bộ được, bản ghi vào `offline_sync_records` `HELD` → SC-03-07 → 修正申請 `LATE_ENTRY` hoặc 「反映しない」 (ADR-008 §2.2-6). Không có thao tác "bỏ đánh dấu" ở 第1期 — đăng ký lại máy là việc của SYSADM (cấp `device_code` mới).

---

## 4. Detail function

### 4.1. Xác thực, quyền, MFA dùng một lần

| Trường | Giá trị |
|---|---|
| Input | Cookie `sid`; header `X-MFA-Token`; path `deviceId`; body `{ reason }` |
| Output | `SessionContext` → 4.2 |

**Error**

| Điều kiện lỗi | Xử lý | Status code |
|---|---|---|
| Không phiên | Dừng; `E-CMN-001` | 401 |
| Không có quyền `STL_HEAD` / 代行 | Dừng; `E-CMN-002` | 403 |
| MFA token thiếu / sai mục đích / đã dùng | Dừng; `E-CMN-005` | 403 |
| `reason` rỗng / > 200 | Dừng; `E-STL-006` | 422 |

**Detail**

| No | Nội dung xử lý |
|---|---|
| 1 | Như STL_DAY_CLOSE §4.1 với `purpose = DEVICE_LOST` (★ luôn hỏi lại mã — PREMISE §3.2) |

### 4.2. Đánh dấu máy

| Trường | Giá trị |
|---|---|
| Input | `deviceId`, `reason` |
| Output | `{ device: { id, code, lostReportedAt, lostReportedBy, pendingSyncCountAtReport } }` → 200 |

**Error**

| Điều kiện lỗi | Xử lý | Status code |
|---|---|---|
| Không có máy | Dừng; `E-STL-009` | 404 |
| Đã đánh dấu trước đó | Dừng; `E-STL-007` (kèm người / giờ) | 409 |

**Detail**

| No | Nội dung xử lý |
|---|---|
| 1 | `SELECT … FROM devices WHERE id = :id FOR UPDATE` |
| 2 | UPDATE `lost_reported_at = now()`, `lost_reported_by`, `lost_reason`, `is_active = false` (IAM_AUDIT_DB 4.6) |
| 3 | DELETE / vô hiệu `staff_sessions` của `device_id` (phiên server-side — ADR-002 §2.1-2); từ giờ API từ máy này trả 401; đổi người bằng PIN trên máy bị từ chối khi online; bản băm PIN offline trên máy không xóa từ xa được → mọi bản ghi máy gửi lên sau đều `HELD` (kiểm `lost_reported_at` trong hàm đồng bộ) |
| 4 | `audit_logs` (`DEVICE_LOST`, lý do, 代行, MFA, `pending_sync_count` lúc báo); `notifications` → SYSADM, SETTLE |

---

## 5. Other Notes

- **Không làm:** không xóa bản ghi offline đã nhận; không tự tạo 修正申請 cho bản ghi đến muộn.
- Báo cáo khóa ngày (`close_checklist`) ghi danh sách máy đã loại để kiểm toán thấy đường tắt đã dùng (ADR-005 §4).
- Truy vết: NFR-AVL-02, BR-CLOSE-01, NFR-SEC-03; ADR-002, ADR-005 §2.6, ADR-008 §2.2-7; IAM_AUDIT_DB 4.6, 4.7, 4.55; PREMISE §3.2; khách #1.

### Điều kiện hoàn thành (LAB-5)

Mỗi dòng là một ca kiểm được (test tích hợp gọi API / hàm DB); issue LAB-5 xong khi mọi dòng đạt. Cùng khuôn với luồng 1 (vd `trade/technical-design/TRADE_AITAI_CONFIRM_TECH.md` §5).

| # | Cho / Khi | Kết quả mong đợi |
|---|---|---|
| 1 | Máy TAB-03 còn 5 bản ghi chưa đồng bộ; STL-HEAD gửi lý do + token `purpose = DEVICE_LOST` | 200; `devices.lost_reported_at`, `lost_reason`, `is_active = false`; phiên của máy bị thu hồi; API-STL-001 không còn TAB-03 ở mục #3; `close_checklist` lúc khóa ghi TAB-03 trong danh sách máy đã loại |
| 2 | Sau khi đánh dấu, máy gửi bản ghi đồng bộ (online) | 401 với phiên cũ; bản ghi nếu tới qua đường đồng bộ → `HELD` → SC-03-07 |
| 3 | Lý do rỗng / > 200 ký tự | 422 `E-STL-006`, `field = reason` |
| 4 | Đánh dấu lần hai cùng máy | 409 `E-STL-007` kèm người / giờ lần đầu |
| 5 | `deviceId` không tồn tại | 404 `E-STL-009` |
| 6 | Token `purpose = DAY_CLOSE` / thiếu token dù step-up còn hiệu lực | 403 `E-CMN-005` |
| 7 | Vai SETTLE gọi | 403 `E-CMN-002` |
| 8 | Mọi ca thành công | Một dòng `audit_logs` `DEVICE_LOST` có `pending_sync_count`, 代行, thời điểm MFA; `notifications` → SYSADM, SETTLE |
