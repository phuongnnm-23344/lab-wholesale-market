# LAB-4 — Brief chung: dựng wireframe HTML theo mẫu PDF (14 màn)

Đọc file này trước. Màn của bạn nằm trong prompt giao việc.

## Bối cảnh
- Repo: `C:\Users\<user>\Desktop\Project lab\lab-wholesale-market`, nhánh `ver/lab-4` (HEAD `fabc771`). Không sửa `prototype/**`.
- Mẫu phong cách (chỉ lấy phong cách, KHÔNG chép nội dung — đó là đề Product B): `C:\Users\<user>\Downloads\wireframes-all.pdf`. Ảnh 60dpi sẵn: `C:\Users\<user>\AppData\Local\Temp\claude\3d667017223783cd\e68582b0-b1c8-4635-91e5-f148f97c6c9a\scratchpad\wfpdf\p01..p35.png` (p01 PC danh sách+form+dialog; p13 PC nhiều tab; p17 smartphone nhiều biến thể).
- **Pilot đã duyệt — làm theo y hệt:** `wireframes/html/SC-04-01.html` (6 biến thể A–F), CSS/JS chung `wireframes/html/_shared/` (catalogue class ở comment đầu `wireframe.css`).
- Render: `C:\Users\<user>\.claude\skills\.venv\Scripts\python.exe -I scripts/render-wireframes.py SC-xx-yy` → `wireframes/png/SC-xx-yy.png` (+ PDF). Dùng Edge (Chrome 148/154 trong cache puppeteer bị treo). Read ảnh PNG để tự soát.

## Nguồn nội dung mỗi màn
- `wireframes/SC-xx-yy-*-wireframe.md` (bố cục to-be, số item, trạng thái, khác biệt theo vai) và, nếu có, `specs/{feature}/screen-specification/SC-xx-yy_SPEC.md` (cột ID/No, field, validation, Event). Spec là nguồn đúng nhất khi hai bên lệch; ghi lại chỗ lệch trong báo cáo.
- Mục dùng chung C-x: `wireframes/_common-layout.md`.

## Quy tắc
- **Badge giữ đúng số item hiện có** (WF MD + cột ID SPEC). Không đánh số lại, không bỏ số. Item màn: `<b class="n">3</b>`; mục chung: `<b class="n c">C-24</b>`.
- **Biến thể A = màn chính, chứa nhiều badge nhất** (ảnh spec BM-51 sẽ chỉ lấy biến thể A). Các biến thể sau: dialog, lỗi/423, trạng thái theo vai, offline… như WF/spec mô tả.
- Nhãn UI tiếng Nhật; dữ liệu giả (サンプル…, tên hư cấu); không chữ 「承認」 cho duyệt nội bộ (dùng 確認/決裁) — 承認 chỉ là tư cách 売買参加者; 許可 (仲卸) và 承認 (売買参加者) luôn tách riêng.
- Số tiền khớp spec (thuế 8% cho thủy sản; 参加上限 so 税込; công thức 完納奨励金 theo INC_ENGINE_TECH).
- Menu trái khai bằng `data-menu` trong HTML của màn (không sửa file chung).
- **CHỈ** tạo/sửa `wireframes/html/SC-*.html` của màn mình và file PNG/PDF do script sinh. KHÔNG sửa `wireframes/html/_shared/**`, `scripts/**`, `specs/**`, wireframe MD, index, progress, `project/**`. Cần class/CSS mới → viết CSS tạm trong `<style>` của HTML màn đó và liệt kê trong báo cáo để PL gộp vào `_shared`.
- Không commit (điều phối commit chung).
- PDF tổng: script chỉ đưa vào PDF các màn được truyền — đừng lo về PDF tổng, điều phối render lại toàn bộ cuối cùng.

## Báo cáo cuối
1. Màn đã làm + số biến thể mỗi màn + badge đã đặt (liệt kê số) + badge nào không xuất hiện ở biến thể A.
2. Chỗ WF MD ↔ SPEC lệch (và bạn theo bên nào).
3. CSS tạm cần gộp vào `_shared` (selector + mục đích).
4. Chi tiết tự suy ra, không có nguyên văn trong WF/SPEC.
5. `**Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT` · Summary · Concerns.
