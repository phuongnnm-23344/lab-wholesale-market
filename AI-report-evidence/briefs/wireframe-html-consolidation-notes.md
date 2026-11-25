# Wireframe HTML — ghi chú gộp từ 3 luồng (điều phối ghi)

Quyết định điều phối: badge không có ở biến thể A là CHẤP NHẬN (theo quyết định người dùng: ảnh spec chỉ lấy A). Khi thay ảnh spec, mỗi SPEC thêm 1 dòng dưới ảnh: "Badge không có trên ảnh này: … → xem biến thể X trong wireframes/pdf/wireframes-all.pdf / wireframes/png/{ID}.png".

## Luồng 3 — SC-01-02, 07-02, 09-04, 10-04 (DONE_WITH_CONCERNS)
- Biến thể: SC-01-02 6 (A–F), SC-07-02 6, SC-09-04 6, SC-10-04 7 (A–G). Tổng 25.
- Không có ở A: SC-01-02 → 9.1–9.6, C-11, C-21, C-22, C-27, C-30 (A đặt 許可+承認 cạnh nhau, ghi chú màn thật chỉ hiện 1 khối); SC-07-02 → 19.1–19.5, C-11, C-12, C-30, C-31; SC-09-04 → C-12, C-24, C-30, C-31 (số 12 cố ý bỏ); SC-10-04 → 13, 14, C-30, C-31.
- Lệch WF MD ↔ SPEC (đã theo SPEC, cần sửa WF MD ở nguồn): SC-07-02 liên kết [6] (WF —, SPEC SC-04-02), [11] (WF SC-06-04/05, SPEC SC-06-05/07-03), [12] (WF 一覧を確認, SPEC SC-06-01); SPEC SC-07-02 §1 ghi WF 0.2.0 (nay 0.2.2). SC-01-02 [19] WF vẽ nút đổi trạng thái cùng lúc yêu cầu chờ — SPEC §6.2 ẩn nút; SPEC có thêm 「再開を起案」. WF SC-01-02 ghi 698日 (tính theo 2026-11-25) — nên theo 業務日 2027.
- CSS tạm cần gộp `_shared`: `.qual`, `.qual-head(.basis)`, `.qual .body`, `.qual.kyoka` (viền đôi, đầu đen), `.qual.shonin` (đầu gạch chéo), `.grid-even`, `.proc`; `.cb/.cb.on` (SC-07-02 + SC-09-04 trùng); `.tbl td.imp(.warn)`; `.rb/.rb.on`, `.steps .st(.on)`, `.tabs .tab(.on)`, `.judge`; `.quota-max`; `.tbl td.chg` thừa → bỏ.
- Mã tiêu đề theo tên file WF (vd SC10_04_RULE_VERSION_APPROVE_ROLLBACK).

## Luồng 1 — SC-03-01, 03-05, 04-05, 05-02, 08-03 (DONE_WITH_CONCERNS)
- Biến thể: SC-03-01 8 (A–H), SC-03-05 7 (A–G, có D tablet), SC-04-05 8 (A–H), SC-05-02 7 (A–G), SC-08-03 9 (A–I).
- Không có ở A: SC-03-01 → 13 (dialog, C); SC-03-05 → 11 (dialog, B); SC-04-05 → 14 chỉ nhắc ở hint, hiện thật ở B; SC-05-02 → 7 (B, trùng người), 12 (dialog, C); SC-08-03 → 16 chỉ ở hint, hiện thật ở E. Badge chung C-x đa số ngoài A.
- Lệch WF MD ↔ SPEC (đã theo SPEC → sửa WF MD): SC-05-02 cột 上限 「⚠超過」 vs SPEC 「▲超過」; ví dụ số liệu đổi thành 10件 ¥404,350; SC-08-03 nhãn [4] → 「数量・単価・買受人の訂正」; SC-03-05 lô đang chọn thống nhất -3, -4, -7 (-7 取引あり).
- CSS tạm cần gộp: `.tbl tr.cur td:first-child::before` (▶); `.empty` (trùng SC-03-01/03-05); `.grade`, `.grade.on::after 「選択中」`, `.tablet .grade` (≥64px), `.tablet .tbl`; `.btn.danger` (viền đôi dày); `.tbl tr.sub td`, `.tbl tr.ng td`.
- Concern: render đầu Edge timeout khi 3 luồng chạy cùng → render lại toàn bộ bằng Edge cuối cùng; SC-05-02/03-05 nút chính ở A bị mờ (để hiện badge điều kiện) — chấp nhận, ghi chú dưới ảnh spec; SC-04-05 biến thể H trống nhiều do `.app-body` min-height 300px → chỉnh `_shared`.

## Luồng 2 — SC-03-02, 03-07, 06-02, 06-04, 06-05 (DONE_WITH_CONCERNS)
- Biến thể: SC-06-02 5, SC-03-02 5, SC-03-07 4, SC-06-04 5, SC-06-05 6. Tổng 25.
- Không có ở A: SC-06-02 → 11.1, 17.1–17.4, C-12, C-21, C-22, C-29; SC-03-02 → 12, C-12, C-22; SC-03-07 → 8, C-24, C-28; SC-06-04 → 13, C-12, C-22, C-24, C-28; SC-06-05 → 8.1, C-12, C-28, C-30, C-31 (C-30/31 chỉ ghi chú cạnh [9]).
- Lệch cần sửa nguồn: SPEC SC-06-04 §4.1 10.1 ghi bắt buộc khi 代理 vs §4.2 / Q-DEL-03 / SC-06-02 tùy chọn → sửa SPEC §4.1 thành tùy chọn. SC-06-05: WF thiếu 8.1, 11.1 (SPEC có) → thêm vào WF; dòng tự ghi (桜 十郎) trái bộ lọc mặc định → WF sửa. SC-03-07: WF 「未同期 5件」 nhưng 4 dòng; mã K-020 không theo dạng K{端末}-; bản ghi 仮受付 của INTAKE nằm trên máy 配送 TAB-03 (giữ như WF, xem lại hợp lý).
- CSS tạm (giống hệt ở 5 file, gộp rồi xóa <style>): `.tablet` (740px, viền 12px, bo 30px), `.tablet::before`, `.tablet.half` (600px); `.t-head(.right)`; `.t-off`, `.t-off .n.c`, `.t-on`, `.tablet .main`; `.t-btn(.on/.xl/.wide/.off)`; `.t-in(.focus/.empty/.err)` + `.focus.empty::after`; `.t-pad`; `.t-tbl`, `tr.sel`; `.t-card(-title)`, `.t-lbl`, `.t-row`, `.t-note`; `.t-side`, `.notes`; `.t-preview`; `.t-toast`; `.t-err`. Lưu ý luồng 1 có `.tablet .grade`, `.tablet .tbl` ở SC-03-05 — thống nhất với khối tablet này.
- SC-06-02 A: [14] hiện dạng giữ chỗ để có badge (SPEC ẩn tới khi có số) — chấp nhận, ghi chú.
