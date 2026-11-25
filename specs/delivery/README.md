# delivery — 引渡し nhiều lần, ngoại lệ, tranh chấp

Module `delivery` (ARCHITECTURE §2): ghi giao hàng trên tablet ở bến (được dùng khi mất mạng — ADR-008), ngoại lệ giao (不足 / 過剰 / 返品 / 一部取消 / 争いあり, gồm nhập bù phiếu giấy), và **配送部門責任者 xác nhận giao có tranh chấp** — điểm người quyết cuối của CAP-HUMAN-01 (luật 3).

## Tài liệu của feature

| ID | Tên | Loại | Biểu mẫu | Version | File |
|---|---|---|---|---|---|
| SPEC-SC-06-02-001 | SC-06-02 引渡し記録（タブレット） | Screen Specification | BM-2-901-51 | 0.1.0 | [screen-specification/SC-06-02_SPEC.md](screen-specification/SC-06-02_SPEC.md) |
| SPEC-SC-06-04-001 | SC-06-04 引渡し例外登録 | Screen Specification | BM-2-901-51 | 0.1.0 | [screen-specification/SC-06-04_SPEC.md](screen-specification/SC-06-04_SPEC.md) |
| SPEC-SC-06-05-001 | SC-06-05 争いのある引渡し完了確認 | Screen Specification | BM-2-901-51 | 0.1.0 | [screen-specification/SC-06-05_SPEC.md](screen-specification/SC-06-05_SPEC.md) |
| SPEC-DELIVERY_FUNC-001 | Function Specifications — module delivery | Function Specifications | BM-2-901-54 | 0.1.0 | [function-specifications/DELIVERY_FUNC.md](function-specifications/DELIVERY_FUNC.md) |
| SPEC-DEL_RECORD-001 | Ghi giao nhiều lần + offline idempotent | Technical Design | BM-2-901-53 | 0.1.0 | [technical-design/DEL_RECORD_TECH.md](technical-design/DEL_RECORD_TECH.md) |
| SPEC-DEL_EXCEPTION_DISPUTE-001 | Ngoại lệ + xác nhận tranh chấp | Technical Design | BM-2-901-53 | 0.1.0 | [technical-design/DEL_EXCEPTION_DISPUTE_TECH.md](technical-design/DEL_EXCEPTION_DISPUTE_TECH.md) |

## Liên kết system-design

- API Design: [`../system-design/api-design/delivery/`](../system-design/api-design/delivery/) — API-DEL-001..006
- Database Design: [`TRADE_DB.md`](../system-design/database-design/TRADE_DB.md) 4.34–4.36; [`ADJUST_DB.md`](../system-design/database-design/ADJUST_DB.md) 4.32, 4.39; [`IAM_AUDIT_DB.md`](../system-design/database-design/IAM_AUDIT_DB.md) 4.6, 4.54, 4.55
- Wireframe nguồn: SC-06-02 0.2.0, SC-06-04 0.2.0, SC-06-05 0.2.0 trong [`wireframes/`](../../wireframes/)

## Phụ thuộc module khác (chưa có spec ở P3)

- `sync`: API đồng bộ hàng đợi offline — gọi lại `fn_delivery_record` (DEL_RECORD §5).
- Đính kèm chung (`attachments`): upload / tải scan phiếu giấy.
- `iam`: tra tài khoản theo 社員番号 (SC-06-04 [5]).
