# party — Người tham gia, 許可 (仲卸) ≠ 承認 (売買参加者)

Module `party` (ARCHITECTURE §2): hồ sơ người tham gia, 保証金 có lịch sử, và **hai** tư cách pháp lý tách hẳn — 許可 (giấy phép có 審査, cho 仲卸) và 承認 (chấp thuận, thủ tục nhẹ, cho 売買参加者, có 参加上限). Hai tư cách khác căn cứ, khác thủ tục, khác bảng, khác endpoint (luật 2, ADR-003).

## Tài liệu của feature

| ID | Tên | Loại | Biểu mẫu | Version | File |
|---|---|---|---|---|---|
| SPEC-SC-01-02-001 | SC-01-02 参加者詳細・編集 | Screen Specification | BM-2-901-51 | 0.1.0 | [screen-specification/SC-01-02_SPEC.md](screen-specification/SC-01-02_SPEC.md) |
| SPEC-PARTY_FUNC-001 | Function Specifications — module party | Function Specifications | BM-2-901-54 | 0.1.0 | [function-specifications/PARTY_FUNC.md](function-specifications/PARTY_FUNC.md) |
| SPEC-PTY_PERMIT_LIFECYCLE-001 | 許可 — cấp mới / gia hạn / đình chỉ / 失効 | Technical Design | BM-2-901-53 | 0.1.0 | [technical-design/PTY_PERMIT_LIFECYCLE_TECH.md](technical-design/PTY_PERMIT_LIFECYCLE_TECH.md) |
| SPEC-PTY_APPROVAL_LIFECYCLE-001 | 承認 + 参加上限 có lịch sử | Technical Design | BM-2-901-53 | 0.1.0 | [technical-design/PTY_APPROVAL_LIFECYCLE_TECH.md](technical-design/PTY_APPROVAL_LIFECYCLE_TECH.md) |

## Liên kết system-design

- API Design: [`../system-design/api-design/party/`](../system-design/api-design/party/) — API-PTY-001..007
- Database Design: [`PARTY_DB.md`](../system-design/database-design/PARTY_DB.md) (4.9–4.15)
- Wireframe nguồn: [`SC-01-02`](../../wireframes/SC-01-02-participant-detail-kyoka-shonin-wireframe.md) 0.2.2

## Màn liên quan chưa có spec đầy đủ (mức List ở SCREEN-LIST)

SC-01-01, SC-01-03, SC-01-04, SC-01-05, SC-01-06 — gọi API-PTY-004..007; hành vi nghiệp vụ đã đặc tả ở SPEC-PTY_PERMIT_LIFECYCLE-001 / 004.
