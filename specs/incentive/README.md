# incentive — Kỳ, phân bổ 入金, 完納奨励金, 期ロック

Feature `incentive` (module ở `architecture/ARCHITECTURE.md` §2): kỳ thanh toán theo 業務日 của GD gốc, phân bổ 入金 (tiền về) vào kỳ, tính **完納奨励金** (thưởng cho người mua trả đủ, đúng hạn) và **期ロック** (khóa kỳ = tính chính thức + đóng băng trong một transaction). Màn có spec đầy đủ ở LAB-4 (L4-D02): **SC-09-04**.

## Tài liệu của feature

| Loại | ID | Tài liệu | Version |
|---|---|---|---|
| Screen Specification (BM-2-901-51) | SPEC-SC-09-04-001 | [screen-specification/SC-09-04_SPEC.md](screen-specification/SC-09-04_SPEC.md) + [ảnh đánh số](screen-specification/assets/SC-09-04_annotated.png) | 0.1.0 |
| Function Specifications (BM-2-901-54) | SPEC-INC_FUNC-001 | [function-specifications/INC_FUNC.md](function-specifications/INC_FUNC.md) — chữ ký 13 hàm + bảng mã lỗi `E-INC-001..014` | 0.1.0 |
| Technical Design (BM-2-901-53) | SPEC-INC_ENGINE-001 | [technical-design/INC_ENGINE_TECH.md](technical-design/INC_ENGINE_TECH.md) — **Technical Design 完納奨励金 riêng**: biến số, công thức, thứ tự tính, 9 khối K1–K9 có điều kiện hoàn thành | 0.1.0 |

## Liên kết sang system-design

| Loại | Tài liệu |
|---|---|
| API Design | [API-INC-001](../system-design/api-design/incentive/API-INC-001_API.md) `GET /api/v1/periods/{periodId}/lock-view` · [API-INC-002](../system-design/api-design/incentive/API-INC-002_API.md) `POST …/incentive-previews` (試算) · [API-INC-003](../system-design/api-design/incentive/API-INC-003_API.md) `POST …/lock` (期ロック) · [API-INC-004](../system-design/api-design/incentive/API-INC-004_API.md) `GET …/incentive-results` |
| Database Design | [INCENTIVE_DB.md](../system-design/database-design/INCENTIVE_DB.md) (kết quả + **test vector TV-01..15 — nguồn duy nhất**), [BILLING_DB.md](../system-design/database-design/BILLING_DB.md) 4.47–4.50, [CLOSE_DB.md](../system-design/database-design/CLOSE_DB.md) 4.43, [ADJUST_DB.md](../system-design/database-design/ADJUST_DB.md) 4.37–4.39, [RULE_DB.md](../system-design/database-design/RULE_DB.md) 4.21–4.23 |
| Kiến trúc | [ADR-007](../../architecture/adr/ADR-007-kanno-incentive-engine-period-batch-delta.md) (engine), ADR-002 (MFA), ADR-005 (業務日 / khóa), ADR-006 (version quy chế) |
| Wireframe | [SC-09-04](../../wireframes/SC-09-04-incentive-calc-period-lock-wireframe.md), [_common-layout](../../wireframes/_common-layout.md) |

## Gợi ý tách task cho LAB-5

Mỗi khối của INC_ENGINE_TECH §4 là một task có DoD riêng: K1 thu thập + hash · K2 FIFO (song song được) · K3 期のお支払額 + 完納 / 要確認 · K4 tra bậc theo version kỳ · K5 công thức · K6 DELTA (phụ thuộc K1–K5) · K7 CARRY / CARRY_EXPIRED · K8 期ロック transaction + 試算 · K9 read model + so 試算. Thêm: API-INC-001..004 (route + zod + ánh xạ lỗi), màn SC-09-04, fixture CI từ INCENTIVE_DB §5.
