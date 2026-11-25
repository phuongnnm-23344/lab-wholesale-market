---
id: ADR-001
title: Nền tảng to-be — modular monolith trên AWS Tokyo managed
type: adr
status: accepted
version: "1.0.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [ARCH-001, DEC-001, DEC-002, L4-D01, L4-A01, PRM-080, PRM-081, PRM-082, PRM-083, NFR-AVL-01, NFR-AVL-03, DR-RET-01]
---

# ADR-001 — Nền tảng to-be: modular monolith trên AWS Tokyo managed

| Trạng thái | Ngày | Người quyết | Thay thế |
|---|---|---|---|
| **Accepted** | 2026-11-25 | Người dùng (L4-D01), dựa trên DEC-002 | — |

## 1. Bối cảnh

- Proposal và TCO LAB-1 đã viết theo AWS Tokyo managed, tài khoản đứng tên khách, IaC, dev / stg / prod (DEC-002, PRM-080). Phí cloud khách trả thẳng, tham chiếu ~235.000 JPY / tháng.
- Prototype LAB-2 chạy Vercel Hobby + Supabase free: chạy được logic lõi nhưng không backup / PITR / giám sát (M14), region mặc định, gắn chặt vào Supabase Auth và PostgREST (as-built D21).
- Ràng buộc cứng: 99,5% trong 02:00–10:00 JST (NFR-AVL-01), RTO 4h / RPO 15' (NFR-AVL-03), dữ liệu online 7 năm (DR-RET-01), APPI và dữ liệu ở Nhật (09-06), IT khách phải nhận vận hành được sau hypercare (PRM-093).
- Tải nhỏ: ~77 người đồng thời ở năm 5 × burst 2, ~1.200 GD / ngày (PRM-083). Không có nhu cầu scale từng phần riêng.
- Đội phát triển một nhóm, 9 tháng (DEC-003).

## 2. Quyết định

1. **Kiểu kiến trúc:** modular monolith — một codebase Next.js + TypeScript (trang + route handler API), một PostgreSQL; module theo miền RFP (ARCHITECTURE §2). Mọi ghi nghiệp vụ đi qua hàm trong DB như prototype.
2. **Nền tảng:** AWS `ap-northeast-1` Tokyo, tài khoản đứng tên khách:
   - App: ECS Fargate sau ALB + CloudFront / WAF, ≥ 2 task trên 2 AZ.
   - Job / batch: cùng image, chạy ECS task theo EventBridge Scheduler (múi giờ Asia/Tokyo).
   - DB: **RDS for PostgreSQL Multi-AZ DB instance**, PITR bật.
   - File: S3; email: SES; secret: Secrets Manager + KMS; giám sát: CloudWatch + SaaS.
   - IaC: AWS CDK (TypeScript) — PL đề xuất, cùng ngôn ngữ với app.
3. **Giữ từ prototype:** code Next.js, validate zod, mô hình dữ liệu, hàm nghiệp vụ PL/pgSQL, trigger. **Thay:** lớp xác thực (ADR-002), lớp gọi DB (client SQL có kiểu gọi hàm bằng DB role chỉ có EXECUTE, thay `supabase.rpc` qua PostgREST), hạ tầng.
4. Không deploy, không bảo trì trong 01:00–10:00; cửa sổ bảo trì 20:00–24:00 hoặc 休市日 (PRM-081).

## 3. Phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **A. AWS Tokyo managed, modular monolith (chọn)** | Khớp proposal / TCO đã gửi; Multi-AZ, PITR, sao chép backup sang Osaka có sẵn; tài khoản khách → khách giữ dữ liệu; IT khách quen mô hình | Phải tự thay Auth / PostgREST của Supabase (~ phần việc đã có trong estimate LAB-1); nhiều thành phần hạ tầng hơn | **Chọn** |
| B. Vercel + Supabase gói trả phí (giữ như prototype) | Ít việc chuyển nhất; prototype đã chạy | Hợp đồng dịch vụ đứng tên nhà cung cấp SaaS, khó đặt đúng tài khoản khách; RTO / RPO và vị trí dữ liệu phụ thuộc gói và region của bên thứ ba, khó chứng minh với kiểm toán; Vercel không có region "chỉ Nhật" cho mọi thành phần; trái TCO và PRM-080 đã gửi khách | Bỏ (L4-D01) |
| C. Kiến trúc logic trung lập, chưa chọn hạ tầng | Linh hoạt | Không thiết kế được backup / DR, giám sát, chi phí; LAB-5 không break task hạ tầng được | Bỏ (L4-D01) |
| D. Microservices (mỗi miền một service) | Scale / deploy độc lập | Tải nhỏ, một đội; transaction xuyên miền (chốt GD trừ SL lô + kiểm tư cách + audit) phải thành saga — rủi ro đúng ở chỗ luật 4 cấm sai; chi phí vận hành tăng | Bỏ |
| E. Serverless (Lambda + API Gateway) | Không quản server | Cold start ở giờ cao điểm 02:15–05:00; kết nối DB nhiều cần RDS Proxy; Next.js trên Lambda thêm lớp phức tạp | Bỏ |
| F. Aurora PostgreSQL thay RDS | Failover nhanh hơn, storage tự giãn | Phí cao hơn so với tải nhỏ; RDS Multi-AZ đã đủ 99,5% trong 8 giờ / ngày | Bỏ (xem lại nếu Q-ARCH-01 yêu cầu chờ nóng ở Osaka) |

## 4. Hệ quả

**Tích cực**
- Đáp ứng NFR-AVL-01/03, DR-RET-01 bằng dịch vụ managed, đo được, diễn tập được.
- Logic nghiệp vụ trong DB không phụ thuộc nền tảng → bằng chứng chạy thật của prototype dùng lại được.

**Tiêu cực / rủi ro**
- Phải viết lại xác thực (ADR-002) và lớp gọi DB; RLS đổi nguồn định danh từ JWT Supabase sang biến phiên `app.user_id`.
- Monolith: một lỗi bộ nhớ có thể kéo cả app → giảm bằng ≥ 2 task + health check + rolling deploy.
- Chi phí cloud do khách trả, tính bằng USD → biến động tỷ giá (đã ghi ở estimate-basis §5.3).

**Việc kéo theo**
- Database Design (P2-B) ghi bảng tài khoản thay `auth.users`, bỏ cột demo.
- LAB-5: task IaC dev / stg / prod, pipeline CI/CD, diễn tập khôi phục (PRM-082).

## 5. Truy vết

DEC-001, DEC-002, DEC-003, L4-D01, L4-A01, PRM-080..083, PRM-093, NFR-AVL-01, NFR-AVL-03, DR-RET-01, 09-06; as-built §1, D21; mock M14.

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 1.0.0 | Add new | Ghi lại quyết định L4-D01 dạng ADR | 2026-11-25 | phuongnnm-23344 | Người dùng (L4-D01) |
