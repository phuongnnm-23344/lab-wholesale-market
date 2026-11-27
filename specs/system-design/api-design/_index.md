# API Design — bảng tra

**42 tài liệu** (party 7 · lot 6 · trade 8 · delivery 6 · settle 5 · incentive 4 · rule 6) — danh mục theo API ID và màn gọi: [`_common/api-list.md`](../../_common/api-list.md); quy ước chung: [`_common/api-conventions.md`](../../_common/api-conventions.md)

Tên file `{API_ID}_API.md`, đặt trong `{screen-or-feature}/`; dùng từ hai feature trở lên thì đặt thẳng ở thư mục này. Viết theo khuôn `specs/_templates/BM-2-901-52-api-design-template.md` (theo chuẩn nội bộ spec-standards, không công khai). Thêm, sửa hoặc xoá dòng **trong cùng lượt** tạo file, tăng version hay xoá file.

| ID | Tên tài liệu | Feature | Version | Updated by | Updated | Link |
|---|---|---|---|---|---|---|
| SPEC-PTY_API-001 | API-PTY-001 — Lấy chi tiết người tham gia + khối 許可 hoặc 承認 | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-001_API.md](party/API-PTY-001_API.md) |
| SPEC-PTY_API-002 | API-PTY-002 — Lưu thông tin cơ bản người tham gia | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-002_API.md](party/API-PTY-002_API.md) |
| SPEC-PTY_API-003 | API-PTY-003 — Đổi 保証金額 (thêm dòng lịch sử) | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-003_API.md](party/API-PTY-003_API.md) |
| SPEC-PTY_API-004 | API-PTY-004 — Tạo yêu cầu thay đổi 許可 (仲卸) | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-004_API.md](party/API-PTY-004_API.md) |
| SPEC-PTY_API-005 | API-PTY-005 — 起案 / 決裁・確認 / 却下 yêu cầu 許可 | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-005_API.md](party/API-PTY-005_API.md) |
| SPEC-PTY_API-006 | API-PTY-006 — Tạo yêu cầu thay đổi 承認 (売買参加者) / 参加上限 | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-006_API.md](party/API-PTY-006_API.md) |
| SPEC-PTY_API-007 | API-PTY-007 — 確認・決裁 / 却下 yêu cầu 承認 | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-007_API.md](party/API-PTY-007_API.md) |
| SPEC-LOT_API-001 | API-LOT-001 — Danh sách 仮受付 chờ 本登録 | `lot` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [lot/API-LOT-001_API.md](lot/API-LOT-001_API.md) |
| SPEC-LOT_API-002 | API-LOT-002 — 本登録 lô | `lot` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [lot/API-LOT-002_API.md](lot/API-LOT-002_API.md) |
| SPEC-LOT_API-003 | API-LOT-003 — Tìm / liệt kê lô | `lot` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [lot/API-LOT-003_API.md](lot/API-LOT-003_API.md) |
| SPEC-LOT_API-004 | API-LOT-004 — Ghi kết quả 目利き・下見 | `lot` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [lot/API-LOT-004_API.md](lot/API-LOT-004_API.md) |
| SPEC-LOT_API-005 | API-LOT-005 — Tìm 出荷者 trong master | `lot` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [lot/API-LOT-005_API.md](lot/API-LOT-005_API.md) |
| SPEC-LOT_API-006 | API-LOT-006 — Giá trị chọn cho form lô (業務日, giờ nhận lô, 品目, đơn vị, 等級) | `lot` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [lot/API-LOT-006_API.md](lot/API-LOT-006_API.md) |
| SPEC-TRD_API-001 | API-TRD-001 — Tìm người mua kèm tư cách 許可 / 承認 và 参加上限 | `trade` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-001_API.md](trade/API-TRD-001_API.md) |
| SPEC-TRD_API-002 | API-TRD-002 — Chốt GD 相対 (luồng chính) | `trade` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-002_API.md](trade/API-TRD-002_API.md) |
| SPEC-TRD_API-003 | API-TRD-003 — Danh sách GD | `trade` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-003_API.md](trade/API-TRD-003_API.md) |
| SPEC-TRD_API-004 | API-TRD-004 — In 取引確認票 (in thẳng / in lại) | `trade` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-004_API.md](trade/API-TRD-004_API.md) |
| SPEC-TRD_API-005 | API-TRD-005 — Lấy phiên せり để xác nhận (kèm đánh giá trước từng dòng) | `trade` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-005_API.md](trade/API-TRD-005_API.md) |
| SPEC-TRD_API-006 | API-TRD-006 — Xác nhận kết quả phiên せり | `trade` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-006_API.md](trade/API-TRD-006_API.md) |
| SPEC-TRD_API-007 | API-TRD-007 — 差し戻し dòng kết quả せり về 入力者 | `trade` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-007_API.md](trade/API-TRD-007_API.md) |
| SPEC-TRD_API-008 | API-TRD-008 — 当日訂正 / 取消 GD (ngày chưa khóa) | `trade` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-008_API.md](trade/API-TRD-008_API.md) |
| SPEC-DEL_API-001 | API-DEL-001 — Danh sách GD chờ giao của một người mua (hoặc một GD) | `delivery` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/API-DEL-001_API.md](delivery/API-DEL-001_API.md) |
| SPEC-DEL_API-002 | API-DEL-002 — Snapshot dữ liệu giao cho chế độ offline | `delivery` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/API-DEL-002_API.md](delivery/API-DEL-002_API.md) |
| SPEC-DEL_API-003 | API-DEL-003 — Ghi một hoặc nhiều lần giao (idempotent) | `delivery` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/API-DEL-003_API.md](delivery/API-DEL-003_API.md) |
| SPEC-DEL_API-004 | API-DEL-004 — Ghi ngoại lệ giao / tranh chấp (gồm nhập bù phiếu giấy) | `delivery` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/API-DEL-004_API.md](delivery/API-DEL-004_API.md) |
| SPEC-DEL_API-005 | API-DEL-005 — Danh sách tranh chấp chờ 配送部門責任者 xác nhận | `delivery` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/API-DEL-005_API.md](delivery/API-DEL-005_API.md) |
| SPEC-DEL_API-006 | API-DEL-006 — 配送部門責任者 xác nhận / kết luận tranh chấp (MFA) | `delivery` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/API-DEL-006_API.md](delivery/API-DEL-006_API.md) |
| SPEC-STL_API-001 | API-STL-001 — Checklist 日次締め (12 mục chuẩn ADR-005 §2.5) | `settle` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [settle/API-STL-001_API.md](settle/API-STL-001_API.md) |
| SPEC-STL_API-002 | API-STL-002 — Khóa 業務日 (日次締め) — không có API mở lại | `settle` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [settle/API-STL-002_API.md](settle/API-STL-002_API.md) |
| SPEC-STL_API-003 | API-STL-003 — Đánh dấu thiết bị 「端末回収不能」 | `settle` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [settle/API-STL-003_API.md](settle/API-STL-003_API.md) |
| SPEC-STL_API-004 | API-STL-004 — Chi tiết 修正申請 + xem trước bản ghi sẽ sinh | `settle` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [settle/API-STL-004_API.md](settle/API-STL-004_API.md) |
| SPEC-STL_API-005 | API-STL-005 — 決裁 / 却下 修正申請 (cấp 1 / cấp 2) — phản ánh REVERSE / DELTA | `settle` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [settle/API-STL-005_API.md](settle/API-STL-005_API.md) |
| SPEC-INC_API-001 | API-INC-001 — màn 期ロック (đọc kỳ, phân bổ 入金, cảnh báo) | `incentive` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [incentive/API-INC-001_API.md](incentive/API-INC-001_API.md) |
| SPEC-INC_API-002 | API-INC-002 — 試算 完納奨励金 (không ghi kết quả, ghi 監査ログ) | `incentive` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [incentive/API-INC-002_API.md](incentive/API-INC-002_API.md) |
| SPEC-INC_API-003 | API-INC-003 — 期ロック (tính chính thức + đóng băng trong một transaction) | `incentive` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [incentive/API-INC-003_API.md](incentive/API-INC-003_API.md) |
| SPEC-INC_API-004 | API-INC-004 — kết quả 完納奨励金 chính thức của một kỳ đã khóa | `incentive` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [incentive/API-INC-004_API.md](incentive/API-INC-004_API.md) |
| SPEC-RULE_API-001 | API-RULE-001 — dữ liệu màn 規則版確認 (version, so sánh, quota, ví dụ, chính sách E-14) | `rule` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [rule/API-RULE-001_API.md](rule/API-RULE-001_API.md) |
| SPEC-RULE_API-002 | API-RULE-002 — checker 確認 version quy chế (→ 発効待ち, hoặc 決裁待ち ở nhánh N2) | `rule` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [rule/API-RULE-002_API.md](rule/API-RULE-002_API.md) |
| SPEC-RULE_API-003 | API-RULE-003 — 運用部門長 決裁 rollback khi đã đủ 4 lần (chỉ nhánh N2 của E-14) | `rule` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [rule/API-RULE-003_API.md](rule/API-RULE-003_API.md) |
| SPEC-RULE_API-004 | API-RULE-004 — checker 差し戻す version quy chế (→ 下書き) | `rule` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [rule/API-RULE-004_API.md](rule/API-RULE-004_API.md) |
| SPEC-RULE_API-005 | API-RULE-005 — 取り消す version quy chế trước ngày hiệu lực (không tính quota) | `rule` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [rule/API-RULE-005_API.md](rule/API-RULE-005_API.md) |
| SPEC-RULE_API-006 | API-RULE-006 — maker đề nghị hủy version 発効待ち (bước 1 của hủy có maker-checker) | `rule` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [rule/API-RULE-006_API.md](rule/API-RULE-006_API.md) |
