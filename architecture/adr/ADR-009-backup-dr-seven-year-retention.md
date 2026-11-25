---
id: ADR-009
title: Backup / DR và lưu 7 năm — PITR + Multi-AZ, bản sao sang Osaka, chia bảng audit theo năm TC
type: adr
status: proposed
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [ARCH-001, ADR-001, ADR-004, NFR-AVL-01, NFR-AVL-03, NFR-PERF-01, NFR-SEC-04, DR-RET-01, TBL-ATTACH-01, PRM-081, PRM-082, PRM-084]
---

# ADR-009 — Backup / DR và lưu 7 năm: PITR + Multi-AZ, bản sao sang Osaka, chia bảng audit theo năm TC

| Trạng thái | Ngày | Người quyết | Thay thế |
|---|---|---|---|
| **Proposed** — chờ Gate 1 | 2026-11-25 | PL đề xuất | — |

## 1. Bối cảnh

- NFR-AVL-03: RTO ≤ 4h, RPO ≤ 15 phút; diễn tập khôi phục ít nhất 1 lần trước go-live, có biên bản (PRM-082). NFR-AVL-01: 99,5% trong 02:00–10:00.
- DR-RET-01: dữ liệu nghiệp vụ online 7 năm; ảnh / chứng từ online 3 năm rồi lưu lạnh; thời gian khôi phục từ lưu lạnh ghi hai cách ("最大2営業日" / "2日以内").
- NFR-PERF-01: tìm kiếm p95 ≤ 2s. Prototype: view quét toàn lịch sử (D24, M23), không backup (M14).
- Ước lượng khối lượng 7 năm: ~1.200 GD / ngày × ~290 ngày chợ × 7 ≈ **2,5 triệu GD**, cộng điều chỉnh / giao / sổ SL cùng bậc; 監査ログ lớn nhất (nhiều dòng / GD, ước vài chục triệu dòng). PostgreSQL xử lý được mà không cần hệ phân tán.
- RFP không nói RTO / RPO có áp cho sự cố cả region hay không (Q-ARCH-01).

## 2. Quyết định

### 2.1 Backup và khôi phục

1. **RDS Multi-AZ** cho sự cố một AZ (failover tự động ~1–2 phút).
2. **PITR** bật, giữ 35 ngày; log giao dịch được đẩy lên mỗi ~5 phút → RPO trong region ≤ 15 phút. Snapshot hằng ngày (giờ ngoài dịch vụ) qua AWS Backup, giữ theo chính sách (tạm 35 ngày hằng ngày + 12 tháng cuối tháng).
3. **Bản sao sang Osaka** (ap-northeast-3): sao chép tự động backup RDS **kèm log PITR** và sao chép S3 (chứng từ, CSV gốc). Khi mất cả region Tokyo: dựng stack bằng IaC ở Osaka + khôi phục DB tới thời điểm gần nhất → mục tiêu ≤ 4h. Không chạy máy chờ nóng (giữ trong TCO). Áp dụng nếu Q-ARCH-01 trả lời "có".
4. **Runbook khôi phục** cho 3 tình huống: xóa / hỏng dữ liệu (PITR về trước sự cố, đối chiếu với 監査ログ), mất AZ (tự động), mất region (Osaka). Diễn tập ở stg trước go-live, đo thời gian thật, lưu biên bản (PRM-082).
5. Backup mã hóa KMS; khóa và mật khẩu ở Secrets Manager, không ở repo (NFR-SEC-04).

### 2.2 Lưu 7 năm và hiệu năng

6. **Dữ liệu nghiệp vụ ở lại DB online 7 năm**, không chuyển kho riêng.
7. **Chỉ chia bảng (partition theo năm TC) cho `audit_logs`** — bảng lớn nhất và chỉ thêm; partition cũ hơn 7 năm được tách ra, xuất S3 rồi bỏ theo quy trình có duyệt. Bảng nghiệp vụ **không** chia (vài triệu dòng — index đủ).
8. **Mọi truy vấn danh sách / báo cáo bắt buộc có khoảng 業務日 + phân trang**; index theo `(business_date, ...)` ở các bảng lớn; view giá trị hiệu lực nhận tham số khoảng ngày (sửa D24).
9. Chứng từ / ảnh ở S3: Standard 3 năm → lifecycle sang lưu lạnh (Glacier Flexible Retrieval, khôi phục chuẩn vài giờ — đáp ứng cả hai cách đọc DR-RET-01) → xóa sau 7 năm (Q-ARCH-07).
10. Test tải trên stg với dữ liệu giả lập đủ 7 năm trước go-live (PRM-083).

## 3. Phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **A. Multi-AZ + PITR + bản sao Osaka (lạnh) + chia bảng audit (chọn)** | Đạt RTO / RPO bằng dịch vụ managed; phí thêm nhỏ; đơn giản | Mất region: RTO phụ thuộc dựng IaC — phải diễn tập để chắc ≤ 4h | **Chọn** |
| B. Chỉ snapshot hằng ngày | Rẻ nhất | RPO 24h — trượt NFR-AVL-03 | Bỏ |
| C. Read replica / chờ nóng ở Osaka | RTO mất region ~phút | Gấp đôi phí DB, ngoài TCO đã gửi; vượt yêu cầu 4h | Bỏ (xem lại nếu khách đòi) |
| D. Chia mọi bảng nghiệp vụ theo năm TC | Truy vấn theo năm nhanh | Khối lượng nhỏ, lợi ích ít; khóa ngoại / unique xuyên partition phức tạp; REVERSE / DELTA có thể khác năm với GD gốc | Bỏ |
| E. Chuyển dữ liệu > 2 năm sang kho lưu trữ riêng | DB nhẹ | Trái "online 7 năm"; phải làm thêm màn tra kho cũ | Bỏ |
| F. Xuất 監査ログ sang S3 Object Lock (WORM) định kỳ | Chống sửa tuyệt đối | Chưa có yêu cầu kiểm toán cụ thể; append-only + quyền DB đã đủ cho FR-AUDIT-01 | Để sau, đề xuất cải tiến nếu kiểm toán yêu cầu |

## 4. Hệ quả

**Tích cực**
- RPO thực tế ~5 phút trong region, có đường khôi phục khi mất region.
- Truy vấn ổn định suốt 7 năm nhờ khoảng ngày bắt buộc, không cần kiến trúc lưu trữ riêng.

**Tiêu cực / rủi ro**
- RTO khi mất region chưa đo được tới khi diễn tập → rủi ro tiến độ nếu IaC chưa xong sớm.
- Khoảng ngày bắt buộc làm một số màn tìm kiếm phải có bộ lọc ngày mặc định (thiết kế màn chú ý).

**Việc kéo theo**
- Database Design: partition `audit_logs`, index `business_date`.
- LAB-5: task IaC Osaka, runbook khôi phục, diễn tập, test tải 7 năm.

## 5. Truy vết

NFR-AVL-01, NFR-AVL-03, NFR-PERF-01, NFR-PERF-02, NFR-SEC-04, DR-RET-01, TBL-ATTACH-01, FR-AUDIT-01; PRM-081..084; as-built D24; M14, M23.

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
