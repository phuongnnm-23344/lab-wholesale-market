# Feature `lot` — tài liệu thiết kế

Module `lot` (ARCHITECTURE §2, miền D-LOT): 仮受付 (tiếp nhận tạm ở bến) → 本登録 (đăng ký chính thức) → 目利き・下見 (thẩm định do **người** quyết) → 公開 → 確定 / 持ち越し; sổ số lượng lô `lot_quantity_ledger`. Màn cốt lõi có spec đầy đủ: SC-03-01, SC-03-05 (L4-D02). SC-03-02 仮受付 chỉ có wireframe ([wireframes/SC-03-02](../../wireframes/SC-03-02-lot-provisional-intake-dock-tablet-wireframe.md), L4-D05).

## 1. Tài liệu trong feature

| ID | Loại | Tài liệu | Version | Link |
|---|---|---|---|---|
| SPEC-SC-03-01-001 | Screen Spec (BM-2-901-51) | SC-03-01 ロット本登録（受付台・PC） | 0.1.0 | [screen-specification/SC-03-01_SPEC.md](screen-specification/SC-03-01_SPEC.md) |
| SPEC-SC-03-05-001 | Screen Spec (BM-2-901-51) | SC-03-05 目利き・下見結果入力 | 0.1.0 | [screen-specification/SC-03-05_SPEC.md](screen-specification/SC-03-05_SPEC.md) |
| SPEC-LOT_FUNC-001 | Function Spec (BM-2-901-54) | Module lot — function | 0.1.0 | [function-specifications/LOT_FUNC.md](function-specifications/LOT_FUNC.md) |
| SPEC-LOT_REGISTER-001 | Technical Design (BM-2-901-53) | 本登録 + sổ SL 受入 | 0.1.0 | [technical-design/LOT_REGISTER_TECH.md](technical-design/LOT_REGISTER_TECH.md) |
| SPEC-LOT_INSPECTION_RECORD-001 | Technical Design (BM-2-901-53) | Ghi kết quả 目利き・下見 | 0.1.0 | [technical-design/LOT_INSPECTION_RECORD_TECH.md](technical-design/LOT_INSPECTION_RECORD_TECH.md) |

## 2. Liên kết sang system-design

| Loại | Tài liệu |
|---|---|
| Database Design | [LOT_DB.md](../system-design/database-design/LOT_DB.md) (4.25–4.28) · enum ở [MKT_DB.md §4.0](../system-design/database-design/MKT_DB.md#40-quy-ước-chung) · master `shippers`, `item_codes`, `code_values` ở [RULE_DB.md](../system-design/database-design/RULE_DB.md) · `offline_sync_records` ở [IAM_AUDIT_DB.md](../system-design/database-design/IAM_AUDIT_DB.md) |
| API Design | [api-design/lot/](../system-design/api-design/lot/): API-LOT-001 … API-LOT-006 |
| Wireframe | [SC-03-01](../../wireframes/SC-03-01-lot-main-registration-wireframe.md) · [SC-03-05](../../wireframes/SC-03-05-mekiki-inspection-result-entry-wireframe.md) · [SC-03-02](../../wireframes/SC-03-02-lot-provisional-intake-dock-tablet-wireframe.md) · khung chung [_common-layout](../../wireframes/_common-layout.md) |
| Kiến trúc / ADR | ARCHITECTURE §2, §4.1, §6 · ADR-004 (append-only), ADR-005 (業務日), ADR-008 (offline 仮受付), ADR-010 (không AI/OCR) |

## 3. API của feature

| API ID | Method + URL | Màn gọi |
|---|---|---|
| API-LOT-001 | `GET /api/v1/lots/provisional` | SC-03-01 [1], [12] |
| API-LOT-002 | `POST /api/v1/lots` | SC-03-01 [9], [13] |
| API-LOT-003 | `GET /api/v1/lots` | SC-03-01 [11], SC-03-05 [2][4], SC-04-01 [1] |
| API-LOT-004 | `POST /api/v1/lots/inspections` | SC-03-05 [10], [11] |
| API-LOT-005 | `GET /api/v1/master/shippers` | SC-03-01 [4], SC-03-05 [2] |
| API-LOT-006 | `GET /api/v1/lots/form-options` | SC-03-01 [3][5][6], SC-03-05 [2][6] |

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |
