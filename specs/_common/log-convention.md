---
id: SPEC-LOG-001
title: Quy ước ghi log
type: system
subtype: log-convention
version: "0.2.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
design_id: LOG
feature: _common
related: ["BM-2-901-53"]
---

# Quy ước ghi log

> **Nội dung giữ nguyên từ sheet `Logs` của biểu mẫu ISO BM-2-901-53 v01.** Tách ra thành file dùng chung vì quy ước log áp cho **cả dự án**, không thuộc riêng một function — template [BM-2-901-53](../_templates/BM-2-901-53-technical-design-template.md) vì thế không còn mục `Log`.
>
> **Chưa dùng làm chuẩn được.** File đang chờ confirm với chuyên gia — xem [mục 3](#3-cần-confirm-với-chuyên-gia). Biểu mẫu gốc có ít nhất một lỗi nội dung đã kiểm chứng được (mục 2).

---

## 1. Format

| Date time | Log type | Category Name | Message |
|---|---|---|---|
| `[yyyy-mm-ddTHH:MM:SS.000]` | `[INFO]` | `[default]` | ***REMOVED*** |

- Mỗi trường bọc trong dấu ngoặc vuông `[...]`, trừ `Message`.
- Biểu mẫu gốc **không quy định** dấu phân tách giữa các trường, timezone, hay nguồn giá trị của `Category Name` (ví dụ dùng `default`).

---

## 2. Log type

Nguyên văn biểu mẫu gốc, **giữ nguyên cả chỗ sai** để đối chiếu khi confirm:

| Log type | Mô tả (nguyên văn biểu mẫu) | Ghi chú |
|---|---|---|
| TRACE | ***REMOVED*** | **Sai** — đây là mô tả của `INFO` theo log4j; `TRACE` phải là *"***REMOVED***"* |
| DEBUG | ***REMOVED*** | Đúng |
| INFO | ***REMOVED*** | **Sai** — trùng nguyên văn với `ERROR` |
| WARN | ***REMOVED*** | Đúng |
| ERROR | ***REMOVED*** | Đúng |
| FATAL | ***REMOVED*** | Đúng |

Cách dùng đề xuất (theo log4j, **chưa được duyệt**):

| Log type | Dùng khi |
|---|---|
| `TRACE` | Sự kiện chi tiết hơn cả `DEBUG` — chỉ bật khi truy vết sâu |
| `DEBUG` | Sự kiện chi tiết hữu ích khi debug |
| `INFO` | Mốc tiến triển của ứng dụng ở mức thô (vào/ra một xử lý) |
| `WARN` | Tình huống có nguy cơ, chưa lỗi |
| `ERROR` | Lỗi đã xảy ra nhưng ứng dụng còn chạy tiếp được |
| `FATAL` | Lỗi rất nặng, ứng dụng sẽ phải dừng |

---

## 3. Cần confirm với chuyên gia

| # | Câu hỏi | Vì sao phải hỏi | Trả lời |
|---|---|---|---|
| 1 | Mô tả `TRACE` và `INFO` trong biểu mẫu ISO gốc sai — có sửa biểu mẫu không, hay dự án tự ghi đè? | Sửa biểu mẫu đóng dấu ISO phải qua bộ phận quản lý tài liệu; để nguyên thì mỗi dự án tự hiểu một kiểu | |
| 2 | Dấu phân tách giữa các trường, timezone dùng gì (UTC hay giờ địa phương)? | Không thống nhất thì log của các service không gộp/so được theo thời gian | |
| 3 | `Category Name` lấy từ đâu — tên module, tên class, hay danh mục cố định? | Ví dụ duy nhất trong biểu mẫu là `default`, không suy ra được quy tắc | |
| 4 | Những gì **cấm** ghi vào log (mật khẩu, token/JWT nguyên bản, số thẻ, PII)? | Biểu mẫu không nói; đây là rủi ro lộ dữ liệu, cần một câu cấm rõ ràng | |
| 5 | Nơi ghi log, thời gian lưu, ai xem? | Không có thì không kiểm chứng được lúc vận hành | |
| 6 | Quy ước log thuộc **bộ spec** hay thuộc **coding convention** của dự án? | Quyết định file này ở lại `03-specs/_common/` hay chuyển sang tài liệu kỹ thuật — xem `ISS-35` | |

---

## 4. Áp dụng cho Product A (LAB-4)

> Bản copy từ `sun-asterisk-internal/spec-standards` nhánh `main` (commit `72c1dda`, 2026-11-05). Mục 1–3 giữ nguyên văn bản chuẩn; mục này ghi cách dự án áp dụng.

| # | Câu hỏi ở mục 3 | Cách xử lý trong dự án | Nơi chốt |
|---|---|---|---|
| 1 | Mô tả `TRACE` / `INFO` sai | Dự án dùng bảng "Cách dùng đề xuất" ở mục 2, không dùng nguyên văn biểu mẫu | ADR về quan sát hệ thống (P2-A) |
| 2 | Dấu phân tách, timezone | Chưa chốt. Giả định PL: lưu UTC, hiển thị JST; định dạng JSON một dòng | ADR (P2-A) |
| 3 | `Category Name` | Chưa chốt. Giả định PL: tên module nghiệp vụ (vd. `trade`, `lot`, `settlement`) | ADR (P2-A) |
| 4 | Cấm ghi gì | Không ghi mật khẩu, PIN, token, nội dung CSV 入金, dữ liệu cá nhân của người tham gia (APPI, 09-06) | ADR (P2-A) |
| 5 | Nơi ghi, thời gian lưu | Log ứng dụng tách khỏi **監査ログ** (FR-AUDIT-01, lưu 7 năm, append-only); thời gian lưu log ứng dụng chưa chốt | ADR (P2-A) |
| 6 | Thuộc spec hay coding convention | Giữ ở `specs/_common/` trong LAB-4 | — |

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Tách nội dung sheet `Logs` của BM-2-901-53 ra file dùng chung; ghi các điểm cần confirm với chuyên gia | 2026-09-10 | ***REMOVED*** | |
| 2 | 0.2.0 | Update | Copy về dự án Product A (spec-standards `72c1dda`); sửa link khuôn BM-2-901-53 về `../_templates/`; thêm mục 4 cách áp dụng cho dự án | 2026-11-25 | phuongnnm-23344 | |
