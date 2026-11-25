# Database Design — bảng tra

**10 tài liệu**

Tên file `{DB_ID}_DB.md`, đặt trong `{screen-or-feature}/`; dùng từ hai feature trở lên thì đặt thẳng ở thư mục này. Viết theo khuôn [`specs/_templates/BM-2-901-50-database-design-template.md`](../../_templates/BM-2-901-50-database-design-template.md). Thêm, sửa hoặc xoá dòng **trong cùng lượt** tạo file, tăng version hay xoá file. Bộ Database Design tách theo cụm ER (Gate 1 M-09): mọi file dùng chung nên đặt ở gốc thư mục; `MKT_DB.md` là file tổng (ngoại lệ #7, README §3).

| ID | Tên tài liệu | Feature | Version | Updated by | Updated | Link |
|---|---|---|---|---|---|---|
| SPEC-MKT_DB-001 | File tổng — nguyên tắc, danh sách 60 bảng, ERD tổng quan, quy ước + enum + view, bảng lệch ↔ prototype LAB-2 (40 dòng), parity, điểm mở | — (dùng chung, gốc thư mục) | 0.3.2 | phuongnnm-23344 | 2026-11-25 | [MKT_DB.md](MKT_DB.md) |
| SPEC-IAM_AUDIT_DB-001 | Tài khoản, vai, quyền duyệt, thiết bị + thông báo, đính kèm, đồng bộ offline, 監査ログ (13 bảng) | — (dùng chung, gốc thư mục) | 0.3.0 | phuongnnm-23344 | 2026-11-25 | [IAM_AUDIT_DB.md](IAM_AUDIT_DB.md) |
| SPEC-PARTY_DB-001 | Người tham gia, 許可 (仲卸) ≠ 承認 (売買参加者), yêu cầu chờ (9 bảng) | — (dùng chung, gốc thư mục) | 0.3.1 | phuongnnm-23344 | 2026-11-25 | [PARTY_DB.md](PARTY_DB.md) |
| SPEC-RULE_DB-001 | Quy chế có version + master mã / thuế (7 bảng) | — (dùng chung, gốc thư mục) | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [RULE_DB.md](RULE_DB.md) |
| SPEC-CLOSE_DB-001 | Lịch chợ – ngân hàng, khóa 業務日 / 期ロック, bộ đếm (4 bảng) | — (dùng chung, gốc thư mục) | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [CLOSE_DB.md](CLOSE_DB.md) |
| SPEC-LOT_DB-001 | Lô / 受付 / 目利き / sổ số lượng (4 bảng) | — (dùng chung, gốc thư mục) | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [LOT_DB.md](LOT_DB.md) |
| SPEC-TRADE_DB-001 | 相対 / せり / in phiếu / giao hàng (7 bảng) | — (dùng chung, gốc thư mục) | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [TRADE_DB.md](TRADE_DB.md) |
| SPEC-ADJUST_DB-001 | 当日訂正, 修正申請, REVERSE / DELTA (4 bảng) | — (dùng chung, gốc thư mục) | 0.3.1 | phuongnnm-23344 | 2026-11-25 | [ADJUST_DB.md](ADJUST_DB.md) |
| SPEC-BILLING_DB-001 | 期のお支払額 / 入金 / phân bổ / batch kế toán (10 bảng) | — (dùng chung, gốc thư mục) | 0.3.0 | phuongnnm-23344 | 2026-11-25 | [BILLING_DB.md](BILLING_DB.md) |
| SPEC-INCENTIVE_DB-001 | 完納奨励金 + test vector (2 bảng) | — (dùng chung, gốc thư mục) | 0.3.1 | phuongnnm-23344 | 2026-11-25 | [INCENTIVE_DB.md](INCENTIVE_DB.md) |
