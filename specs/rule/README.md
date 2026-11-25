# rule — Quy chế có version (maker-checker, ngày hiệu lực, quota, rollback)

Feature `rule` (module ở `architecture/ARCHITECTURE.md` §2): version quy chế = 2 bảng 交付率 (仲卸 / 売買参加者) + tham số quy chế, hiệu lực ngày 1 của tháng tương lai, maker (ルール管理者) ≠ checker (照合部門長, MFA), tối đa **4 lần / năm TC** (không tính bộ go-live, bản hủy, lịch chợ – ngân hàng), rollback = version mới chép nội dung cũ; rollback khi đã đủ 4 lần chờ **E-14** — thiết kế đủ hai nhánh N1 / N2 (ADR-006). Màn có spec đầy đủ ở LAB-4 (L4-D02): **SC-10-04**.

## Tài liệu của feature

| Loại | ID | Tài liệu | Version |
|---|---|---|---|
| Screen Specification (BM-2-901-51) | SPEC-SC-10-04-001 | [screen-specification/SC-10-04_SPEC.md](screen-specification/SC-10-04_SPEC.md) + [ảnh đánh số](screen-specification/assets/SC-10-04_annotated.png) | 0.1.0 |
| Function Specifications (BM-2-901-54) | SPEC-RULE_FUNC-001 | [function-specifications/RULE_FUNC.md](function-specifications/RULE_FUNC.md) — chữ ký 12 hàm + bảng mã lỗi `E-RULE-001..014` | 0.1.0 |
| Technical Design (BM-2-901-53) | SPEC-RULE_VERSION-001 | [technical-design/RULE_VERSION_TECH.md](technical-design/RULE_VERSION_TECH.md) — khối R1–R7, hàm chính sách E-14, test vector RV-01..18 | 0.1.0 |

## Liên kết sang system-design

| Loại | Tài liệu |
|---|---|
| API Design | [API-RULE-001](../system-design/api-design/rule/API-RULE-001_API.md) `GET /api/v1/rule-versions/{versionId}/review` · [API-RULE-002](../system-design/api-design/rule/API-RULE-002_API.md) `POST …/confirm` · [API-RULE-003](../system-design/api-design/rule/API-RULE-003_API.md) `POST …/second-approval` (N2) · [API-RULE-004](../system-design/api-design/rule/API-RULE-004_API.md) `POST …/return` · [API-RULE-005](../system-design/api-design/rule/API-RULE-005_API.md) `POST …/cancel` · [API-RULE-006](../system-design/api-design/rule/API-RULE-006_API.md) `POST …/cancel-request` |
| Database Design | [RULE_DB.md](../system-design/database-design/RULE_DB.md) 4.21–4.23, [CLOSE_DB.md](../system-design/database-design/CLOSE_DB.md) 4.24 / 4.43 (version của kỳ) |
| Kiến trúc | [ADR-006](../../architecture/adr/ADR-006-versioned-market-rules-maker-checker-e14-branches.md), ADR-002 (MFA), ADR-007 (version theo kỳ khi tính thưởng) |
| Wireframe | [SC-10-04](../../wireframes/SC-10-04-rule-version-approve-rollback-wireframe.md), [_common-layout](../../wireframes/_common-layout.md) |

## Gợi ý tách task cho LAB-5

R1 xác thực + khóa dòng · R2 kiểm trạng thái / 発効日 / nội dung · R3 quota + advisory lock · R4 hàm chính sách (hai thân N1 / N2, 24 ca chân trị) · R5 ghi + audit + outbox · R6 kích hoạt theo ngày + `rule_at` (nối hàm mở 業務日 của settle) · R7 trả về / đề nghị hủy / hủy. Thêm: API-RULE-001..006, màn SC-10-04, fixture RV-01..18. Phương án F / G (ADR-006 §3) **không** thuộc phạm vi — tách issue làm rõ riêng (L4-D06).
