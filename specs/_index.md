# Specs — bảng tra

**1 tài liệu** trong `{screen-or-feature}/` và `_common/`

Bảng này liệt kê Screen Specification (`SPEC`), Function Specifications (`FUNC`) và Technical Design (`TECH`) trong các thư mục `{screen-or-feature}/` và `_common/`. Database Design và API Design **không nhân bản xuống đây** — tra ở bảng tra riêng của từng loại. Thêm, sửa hoặc xoá dòng **trong cùng lượt** tạo file, tăng version hay xoá file. Không liệt kê file trong `_templates/`.

| Loại | Bảng tra | Số tài liệu |
|---|---|---|
| Database Design | [system-design/database-design/_index.md](system-design/database-design/_index.md) | 10 (9 file theo cụm + file tổng `MKT_DB.md` — README §3 ngoại lệ #7) |
| API Design | [system-design/api-design/_index.md](system-design/api-design/_index.md) | 0 |

## Danh sách feature (thư mục `specs/{feature}/`)

Feature = module ở [`architecture/ARCHITECTURE.md`](../architecture/ARCHITECTURE.md) §2, tên kebab-case tiếng Anh. Thư mục chỉ tạo khi có tài liệu đầu tiên (P3). Chốt ở Gate 1 (m-03) để P3 và LAB-5 break task theo cùng một danh sách.

| Feature (thư mục) | Module / miền | Màn cốt lõi có spec đầy đủ (L4-D02) | Database Design liên quan |
|---|---|---|---|
| `iam` | Tài khoản, vai, quyền duyệt, 代行, PIN, MFA, thiết bị | — | `IAM_AUDIT_DB.md` |
| `party` | Người tham gia, **許可 (仲卸)** / **承認 (売買参加者)** | SC-01-02 | `PARTY_DB.md` |
| `lot` | 仮受付 → 本登録 → 目利き → 公開, sổ SL lô | SC-03-01, SC-03-05 | `LOT_DB.md` |
| `trade` | **相対 (luồng chính)**, せり (phụ), 当日訂正 / 取消, in phiếu | SC-04-01, SC-05-02 | `TRADE_DB.md`, `ADJUST_DB.md` |
| `delivery` | 引渡し nhiều lần, ngoại lệ, tranh chấp | SC-06-02 (nối SC-06-04, SC-06-05) | `TRADE_DB.md` |
| `settle` | 日次精算, 日次締め, 修正申請 + 決裁, IF-ACC-01 | SC-07-02, SC-08-03 | `ADJUST_DB.md`, `BILLING_DB.md`, `CLOSE_DB.md` |
| `incentive` | Kỳ, 入金, phân bổ, 完納奨励金, 期ロック | SC-09-04 | `INCENTIVE_DB.md`, `BILLING_DB.md`, `CLOSE_DB.md` |
| `rule` | Quy chế có version, maker-checker, rollback, quota | SC-10-04 | `RULE_DB.md` |
| `calendar` | Lịch chợ – ngân hàng, mở 業務日 | — | `CLOSE_DB.md` |
| `notify` | In-app + email, danh sách in | — | `IAM_AUDIT_DB.md` |
| `report` | 12 báo cáo cố định, CSV, PDF phiếu | — | (đọc view công bố) |
| `audit` | 監査ログ | — | `IAM_AUDIT_DB.md` |
| `sync` | Hàng đợi offline, đối chiếu SC-03-07 | — | `IAM_AUDIT_DB.md` |

## Tài liệu

| ID | Tên tài liệu | Loại | Feature | Version | Updated by | Updated | Link |
|---|---|---|---|---|---|---|---|
| SPEC-LOG-001 | Quy ước ghi log | — (`_common`) | _common | 0.2.0 | phuongnnm-23344 | 2026-11-25 | [_common/log-convention.md](_common/log-convention.md) |
