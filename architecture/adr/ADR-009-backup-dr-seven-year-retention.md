---
id: ADR-009
title: Backup / DR và lưu 7 năm — PITR + Multi-AZ, bản sao sang Osaka, chia bảng audit theo năm TC
type: adr
status: accepted
version: "1.0.0"
updated_by: phuongnnm-23344
updated: 2026-11-26
related: [ARCH-001, ADR-001, ADR-004, NFR-AVL-01, NFR-AVL-03, NFR-PERF-01, NFR-SEC-04, DR-RET-01, TBL-ATTACH-01, PRM-081, PRM-082, PRM-084]
---

# ADR-009 — Backup / DR và lưu 7 năm: PITR + Multi-AZ, bản sao sang Osaka, chia bảng audit theo năm TC

| Trạng thái | Ngày | Người quyết | Thay thế |
|---|---|---|---|
| **Accepted** (trừ các điểm chờ khách ở §6) | 2026-11-26 | Người dùng (L4-D09), PL đề xuất | — |

## 1. Bối cảnh

- NFR-AVL-03: RTO ≤ 4h, RPO ≤ 15 phút; diễn tập khôi phục ít nhất 1 lần trước go-live, có biên bản (PRM-082). NFR-AVL-01: 99,5% trong 02:00–10:00.
- DR-RET-01 / B.7: dữ liệu GD tra cứu được online 7 năm; xóa vật lý sau hạn lưu **phải có duyệt** (「保存期間満了後の物理削除は承認を要する」); khôi phục từ lưu lạnh ghi hai cách ("最大2営業日" / "2日以内").
- **TBL-ATTACH-01 (08-04) chia theo loại chứng từ:** 受入票・取引票・照合表 → **online 7 năm**, sau đó theo chính sách lưu của khách; ảnh / chứng cứ tranh chấp, giao hàng và hồ sơ rehearsal / nghiệm thu migration → **online 3 năm → cold archive, khôi phục ≤ 2 営業日**. B.7 viết gọn 「添付書類は3年間」 — dự án theo TBL-ATTACH-01 vì bảng này cụ thể hơn (giả định [PL], hỏi lại ở Q-ARCH-07). Bản 0.1.0 đẩy mọi chứng từ sang lưu lạnh sau 3 năm và cho tự xóa sau 7 năm — sai cả hai điểm (Gate 1 M-08).
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
9. **Chứng từ / ảnh ở S3 theo loại** (`attachments.doc_class`, gắn tag object cùng giá trị):
   - `RECEIPT_SLIP` 受入票 · `TRADE_SLIP` 取引票 (gồm scan 紙伝票) · `RECONCILIATION_SHEET` 照合表 · `CORRECTION_EVIDENCE` chứng cứ 修正申請 (giả định [PL]: xếp cùng mức vì gắn với GD đã chốt) → S3 Standard / Standard-IA **7 năm online**.
   - `DISPUTE_EVIDENCE` ảnh / chứng cứ tranh chấp, giao hàng · `MIGRATION_RECORD` hồ sơ rehearsal / nghiệm thu migration → Standard 3 năm → lifecycle sang **Glacier Flexible Retrieval** (khôi phục chuẩn vài giờ — đáp ứng cả hai cách đọc DR-RET-01).
   - **Không có lifecycle tự xóa.** Hai mốc tách nhau: `archive_after` (ngày sang lưu lạnh, chỉ loại 3 năm) và `retention_until` (hạn lưu, tính từ cuối năm TC của `business_date` bản ghi chủ, không từ ngày tải lên — giả định [PL]). Job tháng lập danh sách 「保存期間満了」 (đến `retention_until`) → **運用部門長 決裁 + MFA + lý do** → hàm xóa object và ghi `disposal_approved_by`, `disposal_approved_at`, `disposed_at` (dòng siêu dữ liệu giữ lại để truy được). Chưa duyệt thì giữ nguyên. Sau 7 năm các loại 7 năm theo chính sách lưu của khách (Q-ARCH-07).
10. Test tải trên stg với dữ liệu giả lập đủ 7 năm trước go-live (PRM-083).

## 3. Phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **A. Multi-AZ + PITR + bản sao Osaka (lạnh) + chia bảng audit (chọn)** | Đạt RTO / RPO bằng dịch vụ managed; phí thêm nhỏ; đơn giản | Mất region: RTO phụ thuộc dựng IaC — phải diễn tập để chắc ≤ 4h | **Chọn** |
| B. Chỉ snapshot hằng ngày | Rẻ nhất | RPO 24h — trượt NFR-AVL-03 | Bỏ |
| C. Read replica / chờ nóng ở Osaka | RTO mất region ~phút | Gấp đôi phí DB, ngoài TCO đã gửi; vượt yêu cầu 4h | Bỏ (xem lại nếu khách đòi) |
| D. Chia mọi bảng nghiệp vụ theo năm TC | Truy vấn theo năm nhanh | Khối lượng nhỏ, lợi ích ít; khóa ngoại / unique xuyên partition phức tạp; REVERSE / DELTA có thể khác năm với GD gốc | Bỏ |
| E. Chuyển dữ liệu > 2 năm sang kho lưu trữ riêng | DB nhẹ | Trái "online 7 năm"; phải làm thêm màn tra kho cũ | Bỏ |
| G. Mọi chứng từ 3 năm → lưu lạnh, lifecycle tự xóa sau 7 năm (bản 0.1.0) | Một quy tắc | Đẩy 取引票 / 照合表 khỏi online sớm trái TBL-ATTACH-01; tự xóa trái B.7 (xóa vật lý cần duyệt) | Bỏ (M-08) |
| F. Xuất 監査ログ sang S3 Object Lock (WORM) định kỳ | Chống sửa tuyệt đối | Chưa có yêu cầu kiểm toán cụ thể; append-only + quyền DB đã đủ cho FR-AUDIT-01 | Để sau, đề xuất cải tiến nếu kiểm toán yêu cầu |

## 4. Hệ quả

**Tích cực**
- RPO thực tế ~5 phút trong region, có đường khôi phục khi mất region.
- Truy vấn ổn định suốt 7 năm nhờ khoảng ngày bắt buộc, không cần kiến trúc lưu trữ riêng.

**Tiêu cực / rủi ro**
- RTO khi mất region chưa đo được tới khi diễn tập → rủi ro tiến độ nếu IaC chưa xong sớm.
- Khoảng ngày bắt buộc làm một số màn tìm kiếm phải có bộ lọc ngày mặc định (thiết kế màn chú ý).

**Việc kéo theo**
- Database Design: partition `audit_logs`, index `business_date`; `attachments.doc_class`, `retention_until` theo loại, `disposal_*` (`IAM_AUDIT_DB.md`).
- LAB-5: task IaC Osaka, runbook khôi phục, diễn tập, test tải 7 năm.

## 5. Truy vết

NFR-AVL-01, NFR-AVL-03, NFR-PERF-01, NFR-PERF-02, NFR-SEC-04, DR-RET-01, TBL-ATTACH-01 (08-04), B.7, FR-AUDIT-01; PRM-081..084; as-built D24; M11, M14, M23; Gate 1 M-08.

## 6. Điểm mở (chờ khách)

Quyết định ở §2 đã **Accepted** (L4-D09). Các điểm dưới đây còn chờ khách thật trả lời; câu trả lời chỉ đổi giá trị / nhánh ghi trong bảng, không đổi hướng của ADR — nếu đổi hướng thì viết ADR mới thay thế. Câu gắn `[Customer giả lập]` trong ADR là giả định có căn cứ, khách thật xác nhận cùng `project/02_requirements/qa.md`.

| ID | Điểm chờ khách | Thiết kế đang theo (giả định) | Nếu khách trả lời khác | Ai trả lời |
|---|---|---|---|---|
| Q-ARCH-01 | RTO 4h / RPO 15 phút có áp cho sự cố cả region Tokyo không | Có — bản sao backup + log PITR sang Osaka, dựng lại bằng IaC | Không → bỏ bản sao Osaka; cần chờ nóng → phí cloud vượt TCO | IT khách |
| Q-ARCH-07 | Hạn lưu chứng từ (TBL-ATTACH-01 vs B.7), xử lý sau hạn, thời gian khôi phục lưu lạnh | Theo TBL-ATTACH-01; không tự xóa — 運用部門長 決裁 + MFA; khôi phục ≤ 1 ngày làm việc | Chỉ đổi lifecycle theo tag / phí lưu | 照合部門, kiểm toán |

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.2.0 | Update | Sửa theo Expert Gate 1 M-08: lưu chứng từ theo loại TBL-ATTACH-01 (受入票・取引票・照合表 online 7 năm; tranh chấp / migration 3 năm → lạnh), bỏ lifecycle tự xóa, thêm danh sách đến hạn → 決裁 + MFA → xóa (B.7); phương án G | 2026-11-25 | phuongnnm-23344 | |
| 3 | 0.2.1 | Update | Gate 1 recheck n-06: tách `archive_after` / `retention_until`, hạn lưu tính từ cuối năm TC của bản ghi chủ | 2026-11-25 | phuongnnm-23344 | |
| 4 | 1.0.0 | Update | Người dùng chốt **Accepted** sau Gate 1–3 (L4-D09 / DEC-059); thêm §6 Điểm mở (chờ khách) — không đổi nội dung quyết định | 2026-11-26 | phuongnnm-23344 | Người dùng (L4-D09) |
