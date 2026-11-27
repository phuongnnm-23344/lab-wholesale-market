---
id: SPEC-LOG-001
title: Quy ước ghi log
type: system
subtype: log-convention
version: "0.3.0"
updated_by: phuongnnm-23344
updated: 2026-11-27
design_id: LOG
feature: _common
related: ["BM-2-901-53"]
---

# Quy ước ghi log

> Quy ước log dùng chung cho cả dự án, nên đặt ở `_common/` thay vì trong từng Technical Design. Khung mục theo chuẩn nội bộ spec-standards (không công khai); nội dung dưới đây là bản tóm tắt dự án tự viết, chỉ giữ phần Product A thực sự dùng.
>
> Còn một số điểm chưa chốt — xem [mục 3](#3-điểm-còn-mở); cách dự án xử lý tạm ở mục 4.

---

## 1. Định dạng

| Trường | Dự án dùng |
|---|---|
| Thời điểm | ISO 8601, lưu UTC, hiển thị JST |
| Mức log | Một trong 6 mức ở mục 2 |
| Category | Tên module nghiệp vụ (vd. `trade`, `lot`, `settlement`) |
| Nội dung | Câu ngắn + `traceId` của request |

- Mỗi bản ghi là một dòng JSON để gom và lọc được giữa các service.

---

## 2. Mức log

| Mức | Dùng khi |
|---|---|
| `TRACE` | Truy vết rất chi tiết, chỉ bật khi điều tra sâu |
| `DEBUG` | Thông tin giúp gỡ lỗi khi phát triển |
| `INFO` | Mốc chính của một xử lý (bắt đầu, kết thúc, kết quả) |
| `WARN` | Có dấu hiệu bất thường nhưng xử lý vẫn đúng |
| `ERROR` | Một xử lý lỗi, hệ thống vẫn chạy tiếp (vd. trả `E-CMN-004` kèm `traceId`) |
| `FATAL` | Lỗi buộc tiến trình phải dừng |

---

## 3. Điểm còn mở

| # | Điểm | Vì sao cần chốt | Trả lời |
|---|---|---|---|
| 1 | Bảng mô tả mức log của biểu mẫu chuẩn có chỗ sai — dự án tự dùng bảng mục 2 có ổn không? | Mỗi dự án tự sửa thì cách hiểu mức log không thống nhất | |
| 2 | Định dạng một dòng và timezone | Log nhiều service phải gom và so theo thời gian được | |
| 3 | Category lấy từ đâu | Không có quy tắc thì lọc log theo nghiệp vụ không được | |
| 4 | Dữ liệu cấm ghi vào log | Tránh lộ bí mật và dữ liệu cá nhân | |
| 5 | Nơi lưu, thời gian lưu, ai xem | Cần để vận hành và kiểm chứng | |
| 6 | Quy ước log thuộc bộ spec hay coding convention | Quyết định nơi đặt file này | |

---

## 4. Áp dụng cho Product A (LAB-4)

> Mục 1–3 là bản tóm tắt dự án tự viết (từ 0.3.0); mục này ghi cách dự án xử lý từng điểm còn mở.

| # | Câu hỏi ở mục 3 | Cách xử lý trong dự án | Nơi chốt |
|---|---|---|---|
| 1 | Mô tả `TRACE` / `INFO` sai | Dự án dùng bảng mức log ở mục 2, không dùng mô tả của biểu mẫu | ADR về quan sát hệ thống (P2-A) |
| 2 | Dấu phân tách, timezone | Chưa chốt. Giả định PL: lưu UTC, hiển thị JST; định dạng JSON một dòng | ADR (P2-A) |
| 3 | `Category Name` | Chưa chốt. Giả định PL: tên module nghiệp vụ (vd. `trade`, `lot`, `settlement`) | ADR (P2-A) |
| 4 | Cấm ghi gì | Không ghi mật khẩu, PIN, token, nội dung CSV 入金, dữ liệu cá nhân của người tham gia (APPI, 09-06) | ADR (P2-A) |
| 5 | Nơi ghi, thời gian lưu | Log ứng dụng tách khỏi **監査ログ** (FR-AUDIT-01, lưu 7 năm, append-only); thời gian lưu log ứng dụng chưa chốt | ADR (P2-A) |
| 6 | Thuộc spec hay coding convention | Giữ ở `specs/_common/` trong LAB-4 | — |

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Tách quy ước log khỏi khuôn Technical Design thành file dùng chung (bản của chuẩn nội bộ) | 2026-09-10 | (chuẩn nội bộ) | |
| 2 | 0.2.0 | Update | Copy về dự án Product A (spec-standards `72c1dda`); sửa link khuôn BM-2-901-53 về `../_templates/`; thêm mục 4 cách áp dụng cho dự án | 2026-11-25 | phuongnnm-23344 | |
| 3 | 0.3.0 | Update | Bản public: viết lại mục 1–3 thành bản tóm tắt của dự án, chỉ giữ quy ước Product A dùng, không chép nguyên văn chuẩn nội bộ; mục 4 sửa câu dẫn | 2026-11-27 | phuongnnm-23344 | |
