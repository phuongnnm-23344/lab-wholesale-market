---
id: ADR-005
title: Đồng hồ 業務日, 日次締め và 期ロック khóa ở mức DB, không mở lại
type: adr
status: proposed
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [ARCH-001, ADR-004, ADR-006, ADR-007, ADR-008, PRM-110, PRM-116, PRM-119, PRM-120, BR-CLOSE-01, BR-INC-01, L4-A04, L4-A09, E-12, E-16]
---

# ADR-005 — Đồng hồ 業務日, 日次締め và 期ロック khóa ở mức DB, không mở lại

| Trạng thái | Ngày | Người quyết | Thay thế |
|---|---|---|---|
| **Proposed** — chờ Gate 1 | 2026-11-25 | PL đề xuất | — |

## 1. Bối cảnh

- 業務日 (ngày nghiệp vụ) bắt đầu 02:00 JST, không trùng ngày dương lịch. Lô nhận từ 01:00 (tham số, E-16) thuộc 業務日 sáng đó; chốt GD từ 02:00 (PRM-116).
- 期 (kỳ thanh toán) = tháng dương lịch theo **業務日 của GD gốc**: GD chốt 01:30 ngày 1 thuộc kỳ trước (L4-A04 (2), L4-A09).
- BR-CLOSE-01: ngày đã khóa không sửa trực tiếp. Sửa sau khóa → 修正申請 vào ngày chưa khóa sớm nhất (PRM-120). Sửa sau 期ロック → delta kỳ sau (BR-INC-01).
- Checklist trước khóa ngày: nháp / chờ xác nhận, せり chưa có người xác nhận, dòng 後入力 đang treo, **thiết bị còn bản ghi chưa đồng bộ**, 訂正 chưa xác nhận, lô còn SL (PRM-119, FB-CUS khách về offline).
- Prototype: `current_business_date()` = ngày OPEN lớn nhất, không có job, không gắn lô trước 02:00 (D22, M10); trigger chặn ghi ngày LOCKED đã chạy tốt.

## 2. Quyết định

1. **Lịch là nguồn sự thật:** bảng lịch chợ – ngân hàng (SC-10-05) xác định ngày chợ mở / 休市日 / 臨時休市 / 臨時開市. Đổi 臨時休市 / 臨時開市 trong ngày, không cần nhà thầu, không tính quota quy chế (FB-CUS-239).
2. **Job mở 業務日** chạy 02:00 JST (EventBridge Scheduler, múi giờ Asia/Tokyo): mở ngày chợ kế tiếp theo lịch. Job chạy lại được (idempotent). Job lỗi → alarm; người có quyền mở tay bằng cùng hàm (có audit).
3. **Gán 業務日 ở server**, không theo đồng hồ máy khách: hàm `business_date_for(thời điểm)` dùng giờ bắt đầu nhận lô trong quy chế có version + lịch. Bản ghi offline mang thời điểm thiết bị + thời điểm server nhận; 業務日 do server xác định khi đồng bộ (ADR-008).
4. **日次締め:** 照合部門長 (hoặc 代行) + MFA, sau khi checklist PRM-119 hiển thị đủ; mục bắt buộc xác nhận chỉ là giao còn dư (PRM-036). Khóa = đổi trạng thái ngày + trigger `DAY_LOCKED` chặn mọi ghi vào ngày đó ở mọi bảng nghiệp vụ. Lô còn SL → 持ち越し sang ngày sau cùng mã lô (PRM-110; quy tắc tạm xếp như quy chế chờ E-12).
5. **Không có chức năng mở lại ngày đã khóa** (Q-ARCH-02). Khóa nhầm / thiếu → 修正申請 hoặc 後入力 vào ngày mở sớm nhất.
6. **期ロック:** sau 支払期日 + thời gian 照合; 照合部門長 + MFA; trong cùng transaction tính chính thức 完納奨励金 và đóng băng kết quả (ADR-007). Sau khóa, mọi thay đổi ảnh hưởng kỳ đó → DELTA ở kỳ sau; không hồi tố 完納.
7. **Xuất IF-ACC-01** tạo sau 日次締め, nội dung đóng băng lúc tạo (PRM-123).

## 3. Phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **A. Lịch + job 02:00 + khóa DB vĩnh viễn (chọn)** | Đúng BR-CLOSE-01 ở mức dữ liệu; 業務日 xác định bằng một hàm duy nhất; ngày biên (01:30 đầu tháng, 3/31→4/1) test được | Không mở lại được → sai sót lúc khóa phải đi đường sửa | **Chọn** |
| B. Mở lại ngày đã khóa có duyệt | Linh hoạt khi khóa nhầm | Báo cáo / CSV kế toán đã xuất có thể lệch; khách chưa yêu cầu; thêm luồng duyệt | Bỏ ở 第1期, hỏi Q-ARCH-02 |
| C. Khóa chỉ ở app (ẩn nút sửa) | Đơn giản | Đường ghi khác (job, script, lỗi) vẫn sửa được → trái BR-CLOSE-01 | Bỏ |
| D. 業務日 = ngày dương lịch, lô trước 02:00 tính ngày trước | Đơn giản | Sai thực tế: lô nhận 01:00 bán sáng đó; kỳ thưởng lệch ở ngày biên | Bỏ |
| E. Tự động khóa ngày theo giờ | Không quên khóa | Khóa khi còn giao / せり chưa xác nhận; trái CAP-HUMAN-01 (người quyết) | Bỏ; chỉ nhắc (cảnh báo trước giờ khóa trong file cấu hình) |

## 4. Hệ quả

**Tích cực**
- Một hàm 業務日 dùng cho lô, GD, kỳ, quota năm TC → ngày biên có test vector chung.
- Không ai, kể cả quản trị, sửa được số của ngày đã khóa.

**Tiêu cực / rủi ro**
- Job 02:00 là điểm đơn: lỗi job = không ai chốt GD được → alarm ngay + hàm mở tay; không deploy 01:00–10:00.
- Khóa nhầm không quay lại được → checklist + MFA làm bước dừng.

**Việc kéo theo**
- Database Design: lịch, trạng thái ngày / kỳ, lịch sử khóa, trạng thái thiết bị cho checklist.
- Spec SC-07-02 (日次締め), SC-09-04 (期ロック); wireframe SC-10-05.

## 5. Truy vết

BR-CLOSE-01, BR-INC-01, FR-SETTLE-02, FR-CORR-03, FIG-002, FIG-013; PRM-036, PRM-110, PRM-116, PRM-119, PRM-120, PRM-123; E-12, E-16; L4-A04 (2), L4-A09; as-built D05, D12, D22; M10; FB-CUS-224, FB-CUS-239.

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
