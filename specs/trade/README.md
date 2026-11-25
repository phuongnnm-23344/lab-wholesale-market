# Feature `trade` — tài liệu thiết kế

Module `trade` (ARCHITECTURE §2, miền D-TRADE): **相対取引 (thỏa thuận trực tiếp) — luồng chính, ~90% giá trị**; せり (đấu giá) là luồng phụ, hệ thống chỉ **ghi và xác nhận kết quả** (không có màn đấu giá trực tiếp — luật 1); 当日訂正 / 取消 trước khóa ngày; in 取引確認票. Kiểm 許可 (仲卸) **khác** 承認 + 参加上限 (売買参加者) tại thời điểm chốt (luật 2, BR-PERM-01). Màn cốt lõi có spec đầy đủ: SC-04-01, SC-05-02 (L4-D02); SC-04-05 chỉ có wireframe nhưng logic nằm ở Function / Technical Design của feature này.

## 1. Tài liệu trong feature

| ID | Loại | Tài liệu | Version | Link |
|---|---|---|---|---|
| SPEC-SC-04-01-001 | Screen Spec (BM-2-901-51) | SC-04-01 相対取引入力・確定 | 0.1.0 | [screen-specification/SC-04-01_SPEC.md](screen-specification/SC-04-01_SPEC.md) |
| SPEC-SC-05-02-001 | Screen Spec (BM-2-901-51) | SC-05-02 せり結果確認 | 0.1.0 | [screen-specification/SC-05-02_SPEC.md](screen-specification/SC-05-02_SPEC.md) |
| SPEC-TRADE_FUNC-001 | Function Spec (BM-2-901-54) | Module trade — function | 0.1.0 | [function-specifications/TRADE_FUNC.md](function-specifications/TRADE_FUNC.md) |
| SPEC-TRADE_QUALIFICATION_CHECK-001 | Technical Design (BM-2-901-53) | Kiểm 許可 / 承認 + 参加上限 lúc chốt | 0.1.0 | [technical-design/TRADE_QUALIFICATION_CHECK_TECH.md](technical-design/TRADE_QUALIFICATION_CHECK_TECH.md) |
| SPEC-TRADE_AITAI_CONFIRM-001 | Technical Design (BM-2-901-53) | Chốt 相対 + trạng thái FIG-012 + trừ SL | 0.1.0 | [technical-design/TRADE_AITAI_CONFIRM_TECH.md](technical-design/TRADE_AITAI_CONFIRM_TECH.md) |
| SPEC-TRADE_SERI_CONFIRM-001 | Technical Design (BM-2-901-53) | Xác nhận phiên せり + 差し戻し | 0.1.0 | [technical-design/TRADE_SERI_CONFIRM_TECH.md](technical-design/TRADE_SERI_CONFIRM_TECH.md) |
| SPEC-TRADE_SAME_DAY_FIX-001 | Technical Design (BM-2-901-53) | 当日訂正 / 取消 (REVERSE / DELTA) | 0.1.0 | [technical-design/TRADE_SAME_DAY_FIX_TECH.md](technical-design/TRADE_SAME_DAY_FIX_TECH.md) |

## 2. Liên kết sang system-design

| Loại | Tài liệu |
|---|---|
| Database Design | [TRADE_DB.md](../system-design/database-design/TRADE_DB.md) (4.29–4.31, 4.33) · [ADJUST_DB.md](../system-design/database-design/ADJUST_DB.md) (4.32 `trade_fixes`, 4.39 `trade_adjustments`) · [PARTY_DB.md](../system-design/database-design/PARTY_DB.md) (4.12–4.15, view `v_qualification_current`, `v_buyer_period_usage`) · [LOT_DB.md](../system-design/database-design/LOT_DB.md) (sổ SL qua hàm public của lot) |
| API Design | [api-design/trade/](../system-design/api-design/trade/): API-TRD-001 … API-TRD-008; gọi thêm API-LOT-003 (lot) |
| Wireframe | [SC-04-01](../../wireframes/SC-04-01-aitai-trade-entry-confirm-wireframe.md) · [SC-05-02](../../wireframes/SC-05-02-seri-result-session-confirm-wireframe.md) · [SC-04-05](../../wireframes/SC-04-05-same-day-correction-cancel-wireframe.md) · [_common-layout](../../wireframes/_common-layout.md) |
| Kiến trúc / ADR | ARCHITECTURE §4.1, §4.3, §5, §6 · ADR-003 (許可 ≠ 承認), ADR-004 (REVERSE / DELTA), ADR-005 (業務日, khóa), ADR-008 (bắt buộc online, giấy) |

## 3. API của feature

| API ID | Method + URL | Màn gọi |
|---|---|---|
| API-TRD-001 | `GET /api/v1/trades/buyers` | SC-04-01 [3][4][13], SC-04-05 [4] |
| API-TRD-002 | `POST /api/v1/trades/aitai` | SC-04-01 [8][13][14] |
| API-TRD-003 | `GET /api/v1/trades` | SC-04-01 [10], SC-04-03 |
| API-TRD-004 | `POST /api/v1/trades/{tradeId}/slip-prints` | SC-04-01 (in sau 確定), SC-04-02 |
| API-TRD-005 | `GET /api/v1/seri-sessions/{sessionId}` | SC-05-02 (mở màn) |
| API-TRD-006 | `POST /api/v1/seri-sessions/{sessionId}/confirm` | SC-05-02 [9] |
| API-TRD-007 | `POST /api/v1/seri-sessions/{sessionId}/send-back` | SC-05-02 [10] |
| API-TRD-008 | `POST /api/v1/trades/{tradeId}/fixes` | SC-04-05 [11][12] |

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo (LAB-4 P3) | 2026-11-25 | phuongnnm-23344 | |
