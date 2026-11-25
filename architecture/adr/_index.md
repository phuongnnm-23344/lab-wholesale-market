# ADR (Architecture Decision Record) — bảng tra

**10 tài liệu**

Nhóm tài liệu **mới, không có trong QC-01**. Tên file `ADR-{số 3 chữ số}-{slug}.md`, số cấp một lần, không tái sử dụng. Mỗi ADR gồm: bối cảnh (kèm ID RFP / DEC- / PRM- / M-) · quyết định · phương án đã bỏ và lý do · hệ quả · truy vết. ADR đã chốt không sửa nội dung quyết định; đổi quyết định thì viết ADR mới và ghi "thay thế ADR-xxx" ở cả hai file.

Trạng thái: **Accepted** = người dùng đã quyết · **Proposed** = PL đề xuất, chờ Gate 1. Điểm tích hợp (CSV kế toán, 入金 CSV, email, máy in) đã chốt ở LAB-1 (PRM / DEC) nên không có ADR riêng — xem [ARCHITECTURE.md §9](../ARCHITECTURE.md).

| ID | Tên tài liệu | Feature | Trạng thái | Version | Updated by | Updated | Link |
|---|---|---|---|---|---|---|---|
| ADR-001 | Nền tảng to-be — modular monolith trên AWS Tokyo managed | Hạ tầng | Accepted | 1.0.0 | phuongnnm-23344 | 2026-11-25 | [ADR-001-aws-tokyo-modular-monolith-platform.md](ADR-001-aws-tokyo-modular-monolith-platform.md) |
| ADR-002 | Xác thực thay Supabase Auth — phiên server-side, MFA step-up, PIN trên máy dùng chung | iam | Proposed | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [ADR-002-authentication-mfa-step-up-shared-device-pin.md](ADR-002-authentication-mfa-step-up-shared-device-pin.md) |
| ADR-003 | Phân quyền 3 lớp, kiểm trong DB — 許可 và 承認 tách bảng, tách vòng đời | iam, party | Proposed | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [ADR-003-authorization-roles-authorities-kyoka-shonin-split.md](ADR-003-authorization-roles-authorities-kyoka-shonin-split.md) |
| ADR-004 | Sổ append-only, sửa bằng REVERSE / DELTA — một cơ chế cho 当日訂正 / 取消 và 修正申請 | trade, settle | Proposed | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [ADR-004-append-only-ledger-reverse-delta-corrections.md](ADR-004-append-only-ledger-reverse-delta-corrections.md) |
| ADR-005 | Đồng hồ 業務日, 日次締め và 期ロック khóa ở mức DB, không mở lại | calendar, settle | Proposed | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [ADR-005-business-day-clock-day-close-period-lock.md](ADR-005-business-day-clock-day-close-period-lock.md) |
| ADR-006 | Quy chế có version theo ngày hiệu lực, maker-checker, quota 4 lần / năm TC, rollback hai nhánh E-14 | rule | Proposed (mục 2.5 chờ E-14) | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [ADR-006-versioned-market-rules-maker-checker-e14-branches.md](ADR-006-versioned-market-rules-maker-checker-e14-branches.md) |
| ADR-007 | Engine 完納奨励金 — tính xác định theo kỳ, đóng băng ở 期ロック, DELTA kỳ sau | incentive | Proposed | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [ADR-007-kanno-incentive-engine-period-batch-delta.md](ADR-007-kanno-incentive-engine-period-batch-delta.md) |
| ADR-008 | Offline có giới hạn tại bến — PWA + hàng đợi 3 thao tác, PIN offline gắn thiết bị, đường giấy | sync, delivery, lot | Proposed | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [ADR-008-dock-offline-queue-pin-paper-fallback.md](ADR-008-dock-offline-queue-pin-paper-fallback.md) |
| ADR-009 | Backup / DR và lưu 7 năm — PITR + Multi-AZ, bản sao Osaka, chia bảng audit theo năm TC | Hạ tầng, audit | Proposed | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [ADR-009-backup-dr-seven-year-retention.md](ADR-009-backup-dr-seven-year-retention.md) |
| ADR-010 | Ranh giới phạm vi — Option tách riêng, người quyết cuối, không AI / OCR | Toàn hệ thống | Proposed | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [ADR-010-scope-boundary-options-human-in-the-loop-no-ai.md](ADR-010-scope-boundary-options-human-in-the-loop-no-ai.md) |
