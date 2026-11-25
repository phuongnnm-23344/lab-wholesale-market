# Wireframes — bảng tra

**17 tài liệu** (1 画面一覧・画面遷移 · 1 khung dùng chung · 10 wireframe màn cốt lõi · 5 wireframe màn bổ sung) + 14 ảnh prototype trong `assets/`

Nhóm tài liệu **mới, không có trong QC-01** (chuẩn đã bỏ `screen-map`). Chứa 画面一覧 (danh sách màn hình), 画面遷移 (sơ đồ chuyển màn) và wireframe to-be dạng Markdown / ASCII có đánh số item.

- 10 màn cốt lõi (L4-D02): wireframe to-be ở đây; số item ở đây là cột No của Screen Specification BM-2-901-51 làm ở P3 (`specs/{feature}/screen-specification/`). Ảnh đánh số (`*_annotated.png`) do P3 tạo trong `specs/…/assets/`, không chép sang đây.
- 5 màn bổ sung (SC-04-05, SC-06-04, SC-06-05, SC-03-07; SC-03-02 thêm ở P3 theo L4-D05): wireframe ở đây; **SC-06-04, SC-06-05** được nâng lên Screen Specification đầy đủ ở P3 (PREMISE L4-D07, Gate 2 G2-m05) — tổng 12 Screen Specification, 3 màn còn ở mức wireframe.
- Các màn còn lại của 第1期: chỉ có dòng trong `SCREEN-LIST.md`.
- Số item `C-` (khung, trạng thái dùng chung) định nghĩa một lần ở `_common-layout.md`.
- Ảnh `assets/{SCREEN_ID}_prototype*.png`: chụp prototype LAB-2 bản deploy ngày 2026-11-25, chỉ xem, dữ liệu giả 「サンプル」. Ảnh là **as-is**, không vẽ lại khi wireframe to-be đổi (bản 0.2.0 sau Gate 1): chỗ ảnh khác mô tả thì theo mô tả.
- Bản 0.2.0 (2026-11-25): sửa theo Expert Gate 1 (`expert-review-lab4-gate1-261125.md`) và góp ý khách về wireframe (`customer-feedback-lab4-wireframes-261125.md`); chi tiết ở History từng file.

| ID | Tên tài liệu | Feature | Version | Updated by | Updated | Link |
|---|---|---|---|---|---|---|
| WF-SCREEN-LIST-001 | 画面一覧・画面遷移 — 第1期 (70 màn) | Toàn hệ thống | 0.2.2 | phuongnnm-23344 | 2026-11-25 | [SCREEN-LIST.md](SCREEN-LIST.md) |
| WF-COMMON-001 | Khung màn và trạng thái dùng chung | Toàn hệ thống | 0.2.0 | phuongnnm-23344 | 2026-11-25 | [_common-layout.md](_common-layout.md) |
| WF-SC-03-01 | ロット本登録（受付台・PC） | Lô | 0.2.0 | phuongnnm-23344 | 2026-11-25 | [link](SC-03-01-lot-main-registration-wireframe.md) |
| WF-SC-03-05 | 目利き・下見結果入力 | Lô | 0.2.0 | phuongnnm-23344 | 2026-11-25 | [link](SC-03-05-mekiki-inspection-result-entry-wireframe.md) |
| WF-SC-04-01 | 相対取引入力・確定 | 相対取引 | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [link](SC-04-01-aitai-trade-entry-confirm-wireframe.md) |
| WF-SC-05-02 | せり結果確認 | せり | 0.2.2 | phuongnnm-23344 | 2026-11-25 | [link](SC-05-02-seri-result-session-confirm-wireframe.md) |
| WF-SC-06-02 | 引渡し記録（タブレット） | 引渡し | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [link](SC-06-02-delivery-record-tablet-wireframe.md) |
| WF-SC-07-02 | 日次締め | 照合・締め | 0.2.2 | phuongnnm-23344 | 2026-11-25 | [link](SC-07-02-daily-close-business-day-lock-wireframe.md) |
| WF-SC-08-03 | 修正申請決裁・却下 | 修正申請 | 0.2.2 | phuongnnm-23344 | 2026-11-25 | [link](SC-08-03-correction-request-approve-reject-wireframe.md) |
| WF-SC-01-02 | 参加者詳細・編集（許可 / 承認） | 参加者 | 0.2.4 | phuongnnm-23344 | 2026-11-25 | [link](SC-01-02-participant-detail-kyoka-shonin-wireframe.md) |
| WF-SC-10-04 | 規則版確認・ロールバック | 規則版 | 0.2.2 | phuongnnm-23344 | 2026-11-25 | [link](SC-10-04-rule-version-approve-rollback-wireframe.md) |
| WF-SC-09-04 | 奨励金計算・期ロック | 完納奨励金 | 0.2.2 | phuongnnm-23344 | 2026-11-25 | [link](SC-09-04-incentive-calc-period-lock-wireframe.md) |
| WF-SC-04-05 | 当日訂正（＋取消）— bổ sung | 相対取引 | 0.2.0 | phuongnnm-23344 | 2026-11-25 | [link](SC-04-05-same-day-correction-cancel-wireframe.md) |
| WF-SC-06-04 | 引渡し例外登録 — bổ sung | 引渡し | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [link](SC-06-04-delivery-exception-registration-wireframe.md) |
| WF-SC-06-05 | 争いのある引渡し完了確認 — bổ sung | 引渡し | 0.2.0 | phuongnnm-23344 | 2026-11-25 | [link](SC-06-05-disputed-delivery-completion-confirm-wireframe.md) |
| WF-SC-03-07 | オフライン同期・照合 — bổ sung | Lô / 引渡し | 0.2.0 | phuongnnm-23344 | 2026-11-25 | [link](SC-03-07-offline-sync-reconciliation-wireframe.md) |
| WF-SC-03-02 | ロット仮受付（埠頭・タブレット）— bổ sung P3 (L4-D05) | Lô | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [link](SC-03-02-lot-provisional-intake-dock-tablet-wireframe.md) |

## Ảnh prototype (`assets/`)

| File | Màn | Ghi chú |
|---|---|---|
| SC-01-02_prototype-nakaoroshi.png, SC-01-02_prototype-baibai.png | SC-01-02 | 仲卸 / 売買参加者 |
| SC-01-03_prototype-nakaoroshi-permits.png, SC-01-04_prototype-baibai-approvals.png | SC-01-03, SC-01-04 | Màn 許可 / 承認 |
| SC-03-01_prototype.png, SC-03-05_prototype.png | SC-03-01, SC-03-05 | |
| SC-04-01_prototype.png | SC-04-01 | |
| SC-04-04_prototype-ref-for-SC-04-05.png | SC-04-04 | Nơi vào SC-04-05 (màn này chưa có ở prototype) |
| SC-05-02_prototype-seri-list-ref.png | SC-05 list | Không có phiên せり trong ngày demo; tạo phiên = ghi dữ liệu nên không chụp màn xác nhận |
| SC-06-02_prototype-tablet.png | SC-06-02 | Khung tablet 1024 × 1366 |
| SC-07-02_prototype.png, SC-08-03_prototype.png, SC-09-04_prototype.png, SC-10-04_prototype.png | 4 màn duyệt | |
