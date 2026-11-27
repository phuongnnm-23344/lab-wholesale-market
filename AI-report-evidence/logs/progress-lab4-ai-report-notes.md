# Ghi chú cho AI-report — trích nhật ký tiến độ LAB-4

Trích từ `plans/lab/Lab 4/progress-lab4.md`: mục "Ghi chú cho AI-report (P4)" (ghi chú (1)–(3)) và các dòng "Ghi chú AI-report" rải ở các mục sau (ghi chú (4)–(18)), giữ nguyên văn kèm tên mục chứa nó.

## Ghi chú cho AI-report (P4)

1. **Danh sách mock LAB-2 mô tả sai code (D03):** M07 ghi 入金 "phân bổ FIFO", code thật gán 入金 theo cửa sổ tháng ngay sau kỳ, không có bảng phân bổ. Chỉ lộ ra khi đọc lại SQL ở P1 — tài liệu do AI viết ở LAB-2 không được đối chiếu với code ở điểm này.
2. **Blind parity check (`tkm:audit-doc-parity`) ở P2-B** bắt được trôi lệch giữa cột "Prototype" của Database Design và code: D13, D19, N11. Bài học: kiểm bằng cách mô tả lại code độc lập rồi so, không để người viết tài liệu tự xác nhận.
3. **P1 / P2 không chạy pipeline tự động** của `tkm:rebuild-spec`, `tkm:brainstorm`, các skill IA (`tkm:uiux-design-information-architecture`) — dùng khung / checklist của skill làm thủ công. Lý do: (a) pipeline `rebuild-spec` ghi và promote vào `docs/` ở gốc repo nộp bài, sinh nhóm thư mục ngoài QC-01; (b) chuỗi hơn 10 subagent cho codebase 134 file là quá mức với nguyên liệu thô; (c) đầu ra phải theo khuôn BM-2-901-5x và cấu trúc QC-01, không theo layout `docs/` của skill. Hệ quả: tiết kiệm token nhưng mất các cổng kiểm tự động (validator, reviewer wave) → bù bằng parity check độc lập và Expert Gate 1.


### Từ mục: Gate 1 — sửa theo Expert + khách (2026-11-25)

- Ghi chú AI-report (P4): (4) brief quyết định dùng chung trước khi fan-out tránh 5 nơi lệch nhau như C-01/C-02 (lỗi gốc của bản 0.1 là kiến trúc và DB viết ở hai phiên khác nhau không có nguồn chung); (5) fork tham chiếu số mục ADR cũ (§2-4, §2.4) sau khi ADR đổi cấu trúc → phải grep tham chiếu chéo sau mỗi lần đánh số lại.

### Từ mục: Gate 1 recheck (2026-11-25)

- Ghi chú AI-report (P4): (6) text trích PDF vỡ cột làm nhãn INC-EDGE bị đọc lệch một nấc — gắn ID test vector phải đối chiếu digest / bản đọc ảnh; (7) "làm rõ khác biệt" (M-07) đã vô tình đổi tiền đề khách đã chốt (PRM-121) — trước khi đổi thủ tục phải grep PRM liên quan.

### Từ mục: P3 — spec 10 màn + gộp (2026-11-25)

- Ghi chú AI-report (P4): (8) chạy song song 3 luồng không có quy ước API chung trước → lệch URL, mã lỗi, body lỗi, HTTP 400/422, snake/camel, ID tài liệu, cơ chế MFA; gộp bằng script máy móc + kiểm parse JSON. Bài học: viết `_common/api-conventions.md` **trước** khi fan-out.

### Từ mục: Gate 2 — sửa theo Expert + câu trả lời khách P3 (2026-11-25)

- Ghi chú AI-report (P4): (9) chạy 3 fork song song theo quyền sở hữu file (incentive · settle+delivery · party+trade+lot), file chung (PREMISE, `_index`, `_common`, MKT_DB, TRADE_DB cho Q-INC-02) PL áp sau từ đoạn văn fork gửi về — không xung đột ghi; (10) lần gộp P3 bỏ sót `error_extra` vì chỉ quét khóa JSON, không quét văn xuôi TECH / SPEC → script mới quét toàn `specs/`; (11) commit đầu lỡ kèm một file xóa đã stage từ trước → reset mềm về `f14418c` và commit lại theo nhóm (chưa push).

### Từ mục: FB-EXP-236 + Concern 4 Gate 2 (2026-11-25, PL)

- Ghi chú AI-report (P4): (12) font: mermaid-cli lấy font Nhật làm chính thì chữ Việt có dấu chồng bị tách — phải đọc ảnh mới thấy, không lỗi khi chạy; (13) `render-annotated-screens.py` cần Pillow — Python toàn cục không có, chạy bằng venv.

### Từ mục: Wireframe HTML — bước 1 nền tảng + pilot SC-04-01 (2026-11-25 20:40, PL)

- Ghi chú AI-report: (14) Chrome 148/154 trong cache puppeteer treo khi `--print-to-pdf` (Win), Chrome 131 và Edge chạy ~4 s → script thử lần lượt Edge → Chrome → cache, quá 60 s bỏ sang trình kế; không cần cài gói.

### Từ mục: Wireframe HTML — gộp 3 luồng: XONG phần làm, CHỜ commit (2026-11-25, PL)

- Ghi chú AI-report: (15) Chrome 148/154 trong cache puppeteer treo khi in PDF → dùng Edge; (16) chạy render Edge song song (3 luồng cùng lúc) bị timeout → render lại tuần tự một lần cuối; (17) 3 luồng fan-out không được sửa `_shared` nên viết CSS tạm — khối tablet trùng y hệt ở 5 file, `.empty`/`.cb` trùng ở 2 file, và `.empty` chung đè trạng thái `.t-in.empty` khi gộp → phải đặt bộ CSS dùng chung trước khi fan-out (cùng bài học (8) API conventions).

### Từ mục: Sửa Minor đóng Gate 2 + P4 (2026-11-25, PL)

- Ghi chú AI-report: (18) script đổi ví dụ mở file ghi trước khi đọc → `SC-09-04.html` (chưa commit) rỗng; dựng lại từ transcript phiên (Write + sed + bỏ `<style>`), render so pixel trùng khít PNG cũ.
