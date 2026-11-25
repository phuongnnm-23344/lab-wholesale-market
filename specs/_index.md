# Specs — bảng tra

**38 tài liệu** trong `{screen-or-feature}/` và `_common/` (4 `_common` · 12 Screen Specification · 7 Function Specifications · 15 Technical Design)

Bảng này liệt kê Screen Specification (`SPEC`), Function Specifications (`FUNC`) và Technical Design (`TECH`) trong các thư mục `{screen-or-feature}/` và `_common/`. Database Design và API Design **không nhân bản xuống đây** — tra ở bảng tra riêng của từng loại. Thêm, sửa hoặc xoá dòng **trong cùng lượt** tạo file, tăng version hay xoá file. Không liệt kê file trong `_templates/`.

| Loại | Bảng tra | Số tài liệu |
|---|---|---|
| Database Design | [system-design/database-design/_index.md](system-design/database-design/_index.md) | 10 (9 file theo cụm + file tổng `MKT_DB.md` — README §3 ngoại lệ #7) |
| API Design | [system-design/api-design/_index.md](system-design/api-design/_index.md) | 42 (danh mục: [_common/api-list.md](_common/api-list.md)) |

## Danh sách feature (thư mục `specs/{feature}/`)

Feature = module ở [`architecture/ARCHITECTURE.md`](../architecture/ARCHITECTURE.md) §2, tên kebab-case tiếng Anh. Thư mục chỉ tạo khi có tài liệu đầu tiên (P3). Chốt ở Gate 1 (m-03) để P3 và LAB-5 break task theo cùng một danh sách.

| Feature (thư mục) | Module / miền | Màn cốt lõi có spec đầy đủ (L4-D02) | Database Design liên quan |
|---|---|---|---|
| `iam` | Tài khoản, vai, quyền duyệt, 代行, PIN, MFA, thiết bị | — | `IAM_AUDIT_DB.md` |
| `party` | Người tham gia, **許可 (仲卸)** / **承認 (売買参加者)** | SC-01-02 | `PARTY_DB.md` |
| `lot` | 仮受付 → 本登録 → 目利き → 公開, sổ SL lô | SC-03-01, SC-03-05 | `LOT_DB.md` |
| `trade` | **相対 (luồng chính)**, せり (phụ), 当日訂正 / 取消, in phiếu | SC-04-01, SC-05-02 | `TRADE_DB.md`, `ADJUST_DB.md` |
| `delivery` | 引渡し nhiều lần, ngoại lệ, tranh chấp | SC-06-02, SC-06-04, SC-06-05 | `TRADE_DB.md` |
| `settle` | 日次精算, 日次締め, 修正申請 + 決裁, IF-ACC-01 | SC-07-02, SC-08-03 | `ADJUST_DB.md`, `BILLING_DB.md`, `CLOSE_DB.md` |
| `incentive` | Kỳ, 入金, phân bổ, 完納奨励金, 期ロック | SC-09-04 | `INCENTIVE_DB.md`, `BILLING_DB.md`, `CLOSE_DB.md` |
| `rule` | Quy chế có version, maker-checker, rollback, quota | SC-10-04 | `RULE_DB.md` |
| `calendar` | Lịch chợ – ngân hàng, mở 業務日 | — | `CLOSE_DB.md` |
| `notify` | In-app + email, danh sách in | — | `IAM_AUDIT_DB.md` |
| `report` | 12 báo cáo cố định, CSV, PDF phiếu | — | (đọc view công bố) |
| `audit` | 監査ログ | — | `IAM_AUDIT_DB.md` |
| `sync` | Hàng đợi offline, đối chiếu SC-03-07 | — | `IAM_AUDIT_DB.md` |

## Tài liệu

**ID tài liệu** (frontmatter `id`, theo bản mẫu trong `_templates/`): Screen Specification `SPEC-{Screen ID}-{nnn}` (mẫu `SPEC-LOGIN-002`) · Function Specifications `SPEC-{MODULE}_FUNC-{nnn}` (mẫu `SPEC-AUTH_FUNC-001`) · Technical Design `SPEC-{design_id}-{nnn}` · API Design `SPEC-{tiền tố}_API-{nnn}` (mẫu `SPEC-AUTH_API-001`) · Database Design `SPEC-{cụm}_DB-{nnn}` · tài liệu `_common` `SPEC-{TÊN}-{nnn}`. `{nnn}` = số thứ tự tài liệu cùng gốc, bắt đầu `001`.

| ID | Tên tài liệu | Loại | Feature | Version | Updated by | Updated | Link |
|---|---|---|---|---|---|---|---|
| SPEC-API_CONV-001 | Quy ước chung của API (Common Conventions · Status code · Appendix) | — (`_common`) | _common | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [_common/api-conventions.md](_common/api-conventions.md) |
| SPEC-API_LIST-001 | Danh mục API (API List) | — (`_common`) | _common | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [_common/api-list.md](_common/api-list.md) |
| SPEC-ERROR_CODES-001 | Danh mục mã lỗi (mã chung E-CMN + bảng tổng theo feature) | — (`_common`) | _common | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [_common/error-codes.md](_common/error-codes.md) |
| SPEC-LOG-001 | Quy ước ghi log | — (`_common`) | _common | 0.2.0 | phuongnnm-23344 | 2026-11-25 | [_common/log-convention.md](_common/log-convention.md) |
| SPEC-SC-01-02-001 | SC-01-02 参加者詳細・編集 — 許可 (仲卸) / 承認 (売買参加者) hai khối | SPEC | party | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [party/screen-specification/SC-01-02_SPEC.md](party/screen-specification/SC-01-02_SPEC.md) |
| SPEC-PARTY_FUNC-001 | Function Specifications — module party (người tham gia, 許可 / 承認) | FUNC | party | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/function-specifications/PARTY_FUNC.md](party/function-specifications/PARTY_FUNC.md) |
| SPEC-PTY_APPROVAL_LIFECYCLE-001 | 承認 (売買参加者) — cấp mới / gia hạn / đổi 参加上限 có lịch sử / đình chỉ / 失効 tự động | TECH | party | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [party/technical-design/PTY_APPROVAL_LIFECYCLE_TECH.md](party/technical-design/PTY_APPROVAL_LIFECYCLE_TECH.md) |
| SPEC-PTY_PERMIT_LIFECYCLE-001 | 許可 (仲卸) — cấp mới / gia hạn / đình chỉ / 再審査 / 失効 tự động | TECH | party | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [party/technical-design/PTY_PERMIT_LIFECYCLE_TECH.md](party/technical-design/PTY_PERMIT_LIFECYCLE_TECH.md) |
| SPEC-SC-03-01-001 | SC-03-01 ロット本登録（受付台・PC） | SPEC | lot | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [lot/screen-specification/SC-03-01_SPEC.md](lot/screen-specification/SC-03-01_SPEC.md) |
| SPEC-SC-03-05-001 | SC-03-05 目利き・下見結果入力 | SPEC | lot | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [lot/screen-specification/SC-03-05_SPEC.md](lot/screen-specification/SC-03-05_SPEC.md) |
| SPEC-LOT_FUNC-001 | Module lot — Function Specifications | FUNC | lot | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [lot/function-specifications/LOT_FUNC.md](lot/function-specifications/LOT_FUNC.md) |
| SPEC-LOT_INSPECTION_RECORD-001 | LOT_INSPECTION_RECORD — Ghi kết quả 目利き・下見 do người quyết | TECH | lot | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [lot/technical-design/LOT_INSPECTION_RECORD_TECH.md](lot/technical-design/LOT_INSPECTION_RECORD_TECH.md) |
| SPEC-LOT_REGISTER-001 | LOT_REGISTER — 本登録 lô + dòng sổ số lượng 受入 | TECH | lot | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [lot/technical-design/LOT_REGISTER_TECH.md](lot/technical-design/LOT_REGISTER_TECH.md) |
| SPEC-SC-04-01-001 | SC-04-01 相対取引入力・確定 | SPEC | trade | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [trade/screen-specification/SC-04-01_SPEC.md](trade/screen-specification/SC-04-01_SPEC.md) |
| SPEC-SC-05-02-001 | SC-05-02 せり結果確認 | SPEC | trade | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [trade/screen-specification/SC-05-02_SPEC.md](trade/screen-specification/SC-05-02_SPEC.md) |
| SPEC-TRADE_FUNC-001 | Module trade — Function Specifications | FUNC | trade | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/function-specifications/TRADE_FUNC.md](trade/function-specifications/TRADE_FUNC.md) |
| SPEC-TRADE_AITAI_CONFIRM-001 | TRADE_AITAI_CONFIRM — Chốt GD 相対 (luồng chính) + trạng thái FIG-012 + trừ SL lô | TECH | trade | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [trade/technical-design/TRADE_AITAI_CONFIRM_TECH.md](trade/technical-design/TRADE_AITAI_CONFIRM_TECH.md) |
| SPEC-TRADE_QUALIFICATION_CHECK-001 | TRADE_QUALIFICATION_CHECK — Kiểm 許可 / 承認 và 参加上限 tại thời điểm chốt | TECH | trade | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [trade/technical-design/TRADE_QUALIFICATION_CHECK_TECH.md](trade/technical-design/TRADE_QUALIFICATION_CHECK_TECH.md) |
| SPEC-TRADE_SAME_DAY_FIX-001 | TRADE_SAME_DAY_FIX — 当日訂正 / 取消 bằng REVERSE / DELTA (ngày chưa khóa) | TECH | trade | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/technical-design/TRADE_SAME_DAY_FIX_TECH.md](trade/technical-design/TRADE_SAME_DAY_FIX_TECH.md) |
| SPEC-TRADE_SERI_CONFIRM-001 | TRADE_SERI_CONFIRM — Xác nhận kết quả phiên せり (người chốt) + 差し戻し | TECH | trade | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [trade/technical-design/TRADE_SERI_CONFIRM_TECH.md](trade/technical-design/TRADE_SERI_CONFIRM_TECH.md) |
| SPEC-SC-06-02-001 | SC-06-02 引渡し記録（タブレット） | SPEC | delivery | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [delivery/screen-specification/SC-06-02_SPEC.md](delivery/screen-specification/SC-06-02_SPEC.md) |
| SPEC-SC-06-04-001 | SC-06-04 引渡し例外登録 | SPEC | delivery | 0.1.3 | phuongnnm-23344 | 2026-11-25 | [delivery/screen-specification/SC-06-04_SPEC.md](delivery/screen-specification/SC-06-04_SPEC.md) |
| SPEC-SC-06-05-001 | SC-06-05 争いのある引渡し完了確認 | SPEC | delivery | 0.1.3 | phuongnnm-23344 | 2026-11-25 | [delivery/screen-specification/SC-06-05_SPEC.md](delivery/screen-specification/SC-06-05_SPEC.md) |
| SPEC-DELIVERY_FUNC-001 | Function Specifications — module delivery (引渡し, ngoại lệ, tranh chấp) | FUNC | delivery | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/function-specifications/DELIVERY_FUNC.md](delivery/function-specifications/DELIVERY_FUNC.md) |
| SPEC-DEL_EXCEPTION_DISPUTE-001 | Ngoại lệ giao (gồm nhập bù phiếu giấy) + 配送部門責任者 xác nhận tranh chấp | TECH | delivery | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [delivery/technical-design/DEL_EXCEPTION_DISPUTE_TECH.md](delivery/technical-design/DEL_EXCEPTION_DISPUTE_TECH.md) |
| SPEC-DEL_RECORD-001 | Ghi giao nhiều lần + đồng bộ offline idempotent | TECH | delivery | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [delivery/technical-design/DEL_RECORD_TECH.md](delivery/technical-design/DEL_RECORD_TECH.md) |
| SPEC-SC-07-02-001 | SC-07-02 日次締め | SPEC | settle | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [settle/screen-specification/SC-07-02_SPEC.md](settle/screen-specification/SC-07-02_SPEC.md) |
| SPEC-SC-08-03-001 | SC-08-03 修正申請決裁・却下 | SPEC | settle | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [settle/screen-specification/SC-08-03_SPEC.md](settle/screen-specification/SC-08-03_SPEC.md) |
| SPEC-SETTLE_FUNC-001 | Function Specifications — module settle (日次締め, 端末回収不能, 修正申請 決裁) | FUNC | settle | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [settle/function-specifications/SETTLE_FUNC.md](settle/function-specifications/SETTLE_FUNC.md) |
| SPEC-STL_CORRECTION_DECIDE-001 | 修正申請 — 決裁 / 却下 (1–2 cấp) và sinh REVERSE / DELTA | TECH | settle | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [settle/technical-design/STL_CORRECTION_DECIDE_TECH.md](settle/technical-design/STL_CORRECTION_DECIDE_TECH.md) |
| SPEC-STL_DAY_CLOSE-001 | 日次締め — checklist 12 mục, khóa 業務日, mở ngày kế tiếp | TECH | settle | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [settle/technical-design/STL_DAY_CLOSE_TECH.md](settle/technical-design/STL_DAY_CLOSE_TECH.md) |
| SPEC-STL_DEVICE_LOST-001 | 端末回収不能 — loại thiết bị hỏng / mất khỏi checklist 日次締め | TECH | settle | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [settle/technical-design/STL_DEVICE_LOST_TECH.md](settle/technical-design/STL_DEVICE_LOST_TECH.md) |
| SPEC-SC-09-04-001 | 奨励金計算・期ロック (tính 完納奨励金 và khóa kỳ) | SPEC | incentive | 0.1.3 | phuongnnm-23344 | 2026-11-25 | [incentive/screen-specification/SC-09-04_SPEC.md](incentive/screen-specification/SC-09-04_SPEC.md) |
| SPEC-INC_FUNC-001 | Function Specifications — module incentive (kỳ, phân bổ 入金, 完納奨励金, 期ロック) | FUNC | incentive | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [incentive/function-specifications/INC_FUNC.md](incentive/function-specifications/INC_FUNC.md) |
| SPEC-INC_ENGINE-001 | Technical Design — Engine 完納奨励金 (試算 / 期ロック, DELTA, CARRY) | TECH | incentive | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [incentive/technical-design/INC_ENGINE_TECH.md](incentive/technical-design/INC_ENGINE_TECH.md) |
| SPEC-SC-10-04-001 | 規則版確認・ロールバック (checker duyệt / trả về / hủy version quy chế, gồm rollback) | SPEC | rule | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [rule/screen-specification/SC-10-04_SPEC.md](rule/screen-specification/SC-10-04_SPEC.md) |
| SPEC-RULE_FUNC-001 | Function Specifications — module rule (version quy chế, checker, quota, rollback) | FUNC | rule | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [rule/function-specifications/RULE_FUNC.md](rule/function-specifications/RULE_FUNC.md) |
| SPEC-RULE_VERSION-001 | Technical Design — Quy chế có version (maker-checker, ngày hiệu lực, quota 4 lần / năm TC, rollback, nhánh E-14) | TECH | rule | 0.1.3 | phuongnnm-23344 | 2026-11-25 | [rule/technical-design/RULE_VERSION_TECH.md](rule/technical-design/RULE_VERSION_TECH.md) |

## Phụ thuộc chưa đặc tả (ngoài 12 màn)

Màn / API / job **chưa có spec** mà 12 màn có spec cần tới. LAB-5 tạo issue riêng cho từng dòng và xếp thứ tự task theo cột "Cần cho": thiếu dòng loại **B** thì màn cốt lõi không có dữ liệu thật để chạy và test — trong lúc chờ dùng seed fixture ghi ở cột cuối (không nhập tay vào DB). Mọi dòng là **phần còn thiếu**, không phải spec mới: thiết kế nền đã có ở cột "Thiết kế đã có". Gate 2 G2-M04.

**A. Gọi trực tiếp** — màn cốt lõi gọi API / hàm này lúc chạy.

| # | Phụ thuộc | Feature | Cần cho (màn cốt lõi) | Thiết kế đã có | Còn thiếu | Giả định tạm trong spec / test |
|---|---|---|---|---|---|---|
| DEP-01 | API xác thực MFA (`POST /api/v1/auth/mfa/verify`) — step-up + token một lần theo `purpose` | `iam` | C-30 ở SC-01-02, SC-06-05, SC-07-02, SC-08-03, SC-09-04, SC-10-04 | ADR-002 §2.2; [_common/api-conventions.md](_common/api-conventions.md) §4 (danh sách `purpose`); IAM_AUDIT_DB; SC-02-02 (List) | API Design, Function Spec iam; màn SC-02-02 | Mã đặt trước `E-IAM`; test dùng token giả ký bằng khóa test |
| DEP-02 | Tra tài khoản theo 社員番号 (`GET /api/v1/staff/lookup`) | `iam` | SC-03-05 [8], SC-06-04 [5] | IAM_AUDIT_DB `staff` | API Design | Chỉ tài khoản `ACTIVE`; không có → lỗi của feature gọi (`E-LOT-012`…) |
| DEP-03 | Đính kèm chung (upload / tải chứng từ) | đính kèm chung | SC-06-04 [11], SC-08-03 [6] | ADR-009; IAM_AUDIT_DB `attachments` | API Design, giới hạn loại / cỡ | Trả `attachmentId`; sai loại / cỡ tạm `E-DEL-029` |
| DEP-04 | API hàng đợi đồng bộ offline + đối chiếu SC-03-07 | `sync` | SC-03-02 (nguồn lô — DEP-07), SC-06-02 | ADR-008; wireframe SC-03-07; IAM_AUDIT_DB `offline_sync_records` | API Design, Technical Design sync | `clientRecordId` idempotent (api-conventions §6); ngày đã khóa → `HELD` |
| DEP-05 | Hàm `fn_lot_carry_over` (持ち越し lô khi 日次締め) | `lot` / `settle` | SC-07-02 (STL_DAY_CLOSE_TECH), SC-03-05 (ghi lại 目利き ở ngày mở) | LOT_DB 4.25 / 4.26 (`carried_to_date`); ADR-005 §2.4 | Function Spec của hàm | Gọi trong transaction 日次締め; lô giữ trạng thái, đổi 業務日 |
| DEP-06 | Hàm ghi bản ghi `LATE_ENTRY` của từng module (`fn_trade_late_entry`, `fn_lot_late_entry`, `fn_delivery_record` cờ late) | `trade` / `lot` / `delivery` | SC-08-03 (STL_CORRECTION_DECIDE_TECH §4.4), SC-09-04 (GD 後入力 — `trades.incentive_period_id`) | ADR-005 §2.8; ADR-007 §2.3-7a; TRADE_DB 4.30 cột 3a / 3b | Function Spec của 3 hàm | Gọi trong transaction 決裁; module đích từ chối → 409 `E-STL-029` |

**B. Nguồn dữ liệu đầu vào** — màn / job tạo ra dữ liệu mà màn cốt lõi đọc hoặc duyệt.

| # | Màn / chức năng | Feature | Cần cho (màn cốt lõi) | Thiết kế đã có | Còn thiếu | Seed / giả định khi test LAB-5 |
|---|---|---|---|---|---|---|
| DEP-07 | SC-03-02 仮受付 (tablet bến): ghi lô `PROVISIONAL`, cấp mã chính thức khi lên server; **hủy lô 仮受付 → `CANCELLED`** giữ số (Q-LOT-01) | `lot` | SC-03-01 (danh sách 仮受付 chờ 本登録 — API-LOT-001; tìm theo 仮番号) | Wireframe SC-03-02 (L4-D05); LOT_DB 4.25 (`lot_status` `CANCELLED` — MKT_DB §4.0); ADR-008 | API ghi 仮受付 online, API hủy 仮受付, Screen Spec SC-03-02 | Seed lô `PROVISIONAL` có 仮番号; 出荷者 trống (Q-SC0302-02). Ô 「いま荷揚げ中の船」 là **Muốn có** (~0,3 ngày, chỉ khi còn buffer) |
| DEP-08 | SC-10-01..03 規則版一覧 / 作成・編集 / 交付率テーブル編集 (maker tạo, sửa, gửi version `PENDING`) | `rule` | SC-10-04 (không có bản `PENDING` thì không có gì để 確認) | ADR-006 §2.1–2.3; RULE_DB 4.21–4.23; RULE_FUNC 2.2 (quota), 2.5 (diff); SCREEN-LIST #44–46 (List) | API tạo / sửa / gửi version (`DRAFT` → `PENDING`), Screen Spec 3 màn | Seed v1 `BASELINE` + một bản `PENDING` `CHANGE` / `ROLLBACK` (RULE_VERSION_TECH §5.1) |
| DEP-09 | SC-08-01 修正申請作成 cho **mọi** phạm vi `TRADE` / `KANNO` / `INCENTIVE` / `LATE_ENTRY` (FORM-CORR-01; xem trước tiền + số cấp duyệt) | `settle` | SC-08-03 (cần yêu cầu `PENDING`); SC-09-04 (DELTA từ `KANNO` / `INCENTIVE`); SC-03-01, SC-04-01 (nút 「修正申請を作成 →」 ở C-24) | ADR-005 §2.8; ADR-007 §2.4–2.5; ADJUST_DB 4.37–4.39; STL_CORRECTION_DECIDE_TECH (phía duyệt) | API tạo 修正申請 + tính số cấp, Screen Spec SC-08-01, SC-08-02 (danh sách) | Seed yêu cầu `PENDING` đủ 4 phạm vi, một dưới / một trên ngưỡng 2 cấp |
| DEP-10 | SC-05-01 せり結果入力 (入力者 ghi dòng kết quả `PENDING`; **sửa số người mua sau 差し戻し**, lịch sử giữ số cũ / mới — Q-TRD-05) | `trade` | SC-05-02 (cần dòng `PENDING` và dòng bị 差し戻し để sửa) | TRADE_DB 4.29 `seri_sessions`, 4.30, 4.31 (`REJECT`); TRADE_SERI_CONFIRM_TECH; prototype `0016` | API ghi / sửa dòng kết quả, Screen Spec SC-05-01 | Seed phiên có dòng 仲卸 / 売買参加者, một dòng người mua 失効 |
| DEP-11 | SC-09-01..03 入金CSV取込 (lưu **入金日** của ngân hàng — Q-INC-01), 取引先コード対応表, 期別お支払額・入金状況 (phân bổ FIFO) | `incentive` | SC-09-04 (khối **K2** của engine 完納奨励金: không có 入金 + phân bổ thì không xét được 完納; ô [17] 「入金CSV取込済」 hiện 入金日 mới nhất) | ADR-007 §2.7; BILLING_DB 4.45–4.48; INC_FUNC 2.3 `allocate_payment_fifo`; INC_ENGINE_TECH K2; SCREEN-LIST #39–41 (List) | API import CSV (định dạng chờ E-01 / E-02), API ánh xạ mã, Screen Spec 3 màn | **Thuộc hạng mục 完納奨励金** — LAB-5 tách task riêng cùng nhóm K1–K9. Seed `payments` có `paid_on` theo TV-01..15 (INCENTIVE_DB §5) |
| DEP-12 | Lịch chợ–ngân hàng SC-10-05 + mở 業務日 (hàm mở ngày, job 01:00 dự phòng) + **tạo kỳ ở lần mở 業務日 đầu tháng** (Q-INC-03, DEC-055) | `calendar` | Mọi màn ghi (cần 業務日 `OPEN`); SC-07-02 (mở ngày kế tiếp, `E-STL-008`); SC-09-04 (kỳ, 支払期日 theo ngày ngân hàng) | ADR-005 §2.2–2.4; CLOSE_DB 4.20, 4.24, 4.43; INC_ENGINE_TECH K8; SCREEN-LIST #48 (List) | Function / Technical Design calendar, API + Screen Spec SC-10-05 | Seed lịch năm + 業務日 `OPEN` + kỳ tháng hiện tại |
| DEP-13 | Worker outbox của `notify` (email + khung thông báo + danh sách in, gửi lại ≤ 3) | `notify` | SC-10-04 (báo maker / 経営層 nhánh N2), SC-08-03, SC-09-04 (thông báo kỳ), SC-01-02 (sắp hết hạn) | ARCHITECTURE (worker outbox, điểm tích hợp Email); IAM_AUDIT_DB 4.53; L4-A08, PRM-126 | Technical Design worker, mẫu câu | Spec cốt lõi chỉ ghi outbox trong transaction; test kiểm dòng outbox, không gửi mail thật |
| DEP-14 | SC-02-03 tab 代行者指定 (`delegations`) | `iam` | SC-08-03 (cấp 1 khi 照合部門長 vắng → 代行 chỉ định trước — Q-STL-04), SC-07-02 (khóa thay), SC-09-04 | IAM_AUDIT_DB 4.3; PRM-129; SCREEN-LIST #12 (SC-02-05 gộp vào) | API + Screen Spec | Seed một 代行 STL_HEAD có hiệu lực. Nhân sự 代行 thật: hỏi 経営陣 trước UAT |
| DEP-15 | SC-01-03 / SC-01-04 (đăng ký / cập nhật 許可, 承認; thao tác 「参加上限の変更」 gọi API-PTY-006 `LIMIT_CHANGE`) | `party` | SC-01-02 (mở từ hai khối); SC-04-01, SC-05-02 (hạn mức) | PTY_PERMIT_LIFECYCLE_TECH, PTY_APPROVAL_LIFECYCLE_TECH; API-PTY-004..007; PARTY_DB 4.14, 4.15 | Screen Spec 2 màn (API đã có) | Seed 許可 / 承認 `VALID` + một bản sắp 失効 |
| DEP-16 | File cấu hình có nhật ký (PRM-126) — khóa `PARTICIPATION_LIMIT_TAX_CODE` (Q-TRD-02) và các tham số §3.1 PREMISE không thuộc quy chế | hạ tầng chung | SC-04-01, SC-05-02, SC-01-02 (hạn mức 税込); SC-07-02, SC-09-04 (thời gian idle MFA, SLA) | PREMISE §3.1; RULE_DB 4.19 `tax_rates` | Cơ chế đọc / ghi nhật ký file cấu hình (Technical Design) | Mặc định 軽減税率 8% — hỏi 経理部 |
| DEP-17 | RPT-04 滞留引渡し・例外 (SC-11-05): **lọc được 継続協議** và xem lịch sử từng lần họp (Q-DEL-07) | `report` | Dữ liệu từ SC-06-05 | TRADE_DB 4.36 `dispute_confirmations.conclusion` (nhiều lượt `CONTINUE_DISPUTE`) | Spec báo cáo | Chỉ có ở `audit_logs` = **không đạt** yêu cầu khách |
