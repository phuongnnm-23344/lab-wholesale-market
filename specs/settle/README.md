# settle — 日次締め, 修正申請 + 決裁

Module `settle` (ARCHITECTURE §2): khóa 業務日 sau checklist chuẩn 11 mục (ADR-005 §2.5), lối thoát 「端末回収不能」, và 決裁 / 却下 修正申請 sinh REVERSE / DELTA (ADR-004). Không có chức năng mở lại ngày đã khóa. Duyệt nội bộ dùng chữ 決裁, không dùng 承認 (L4-D03).

Phần 日次精算 / IF-ACC-01 / SC-07-01 của module chưa thuộc phạm vi P3 (màn mức List).

## Tài liệu của feature

| ID | Tên | Loại | Biểu mẫu | Version | File |
|---|---|---|---|---|---|
| SPEC-SC-07-02-001 | SC-07-02 日次締め | Screen Specification | BM-2-901-51 | 0.1.0 | [screen-specification/SC-07-02_SPEC.md](screen-specification/SC-07-02_SPEC.md) |
| SPEC-SC-08-03-001 | SC-08-03 修正申請決裁・却下 | Screen Specification | BM-2-901-51 | 0.1.0 | [screen-specification/SC-08-03_SPEC.md](screen-specification/SC-08-03_SPEC.md) |
| SPEC-SETTLE_FUNC-001 | Function Specifications — module settle | Function Specifications | BM-2-901-54 | 0.1.0 | [function-specifications/SETTLE_FUNC.md](function-specifications/SETTLE_FUNC.md) |
| SPEC-STL_DAY_CLOSE-001 | 日次締め — checklist, khóa, mở ngày kế tiếp | Technical Design | BM-2-901-53 | 0.1.0 | [technical-design/STL_DAY_CLOSE_TECH.md](technical-design/STL_DAY_CLOSE_TECH.md) |
| SPEC-STL_DEVICE_LOST-001 | 端末回収不能 | Technical Design | BM-2-901-53 | 0.1.0 | [technical-design/STL_DEVICE_LOST_TECH.md](technical-design/STL_DEVICE_LOST_TECH.md) |
| SPEC-STL_CORRECTION_DECIDE-001 | 修正申請 決裁 + sinh REVERSE / DELTA | Technical Design | BM-2-901-53 | 0.1.0 | [technical-design/STL_CORRECTION_DECIDE_TECH.md](technical-design/STL_CORRECTION_DECIDE_TECH.md) |

## Liên kết system-design

- API Design: [`../system-design/api-design/settle/`](../system-design/api-design/settle/) — API-STL-001..005
- Database Design: [`CLOSE_DB.md`](../system-design/database-design/CLOSE_DB.md) 4.20, 4.24; [`ADJUST_DB.md`](../system-design/database-design/ADJUST_DB.md) 4.32, 4.37–4.39; [`IAM_AUDIT_DB.md`](../system-design/database-design/IAM_AUDIT_DB.md) 4.6, 4.55
- Wireframe nguồn: SC-07-02 0.2.0, SC-08-03 0.2.1 trong [`wireframes/`](../../wireframes/)

## Phụ thuộc module khác

- `iam`: token MFA dùng một lần theo `purpose` (★ 日次締め, 端末回収不能) — đề xuất `POST /api/v1/auth/mfa/verify`.
- `lot`: `fn_lot_carry_over` (持ち越し khi khóa); `trade` / `lot` / `delivery`: hàm ghi bản ghi `LATE_ENTRY`.
- `incentive`: engine 期ロック đọc 修正申請 `KANNO` / `INCENTIVE` đã `APPROVED`.
- `party`: `expireDueQualifications` khi mở ngày.
