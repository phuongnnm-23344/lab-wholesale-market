---
id: DOC-AI-REPORT-001
title: Báo cáo cách dùng AI trong LAB-4
type: report
version: "0.2.3"
updated_by: phuongnnm-23344
updated: 2026-11-26
related: [PREMISE.md, README.md, AI-report-evidence/README.md]
---
<!-- Bản sao AI-report.md 0.2.3 (commit 020bcce) trước khi rút gọn ở 0.3.0; chỉ sửa đường dẫn link cho đúng vị trí mới. -->

# Báo cáo cách dùng AI trong LAB-4

Bộ thiết kế trong repo này (PREMISE, kiến trúc, 10 ADR, 10 Database Design, 15 wireframe, 12 Screen Specification, 7 Function Specifications, 15 Technical Design, 42 API Design) do AI viết gần như toàn bộ, người làm bài điều phối, ra quyết định và duyệt. Báo cáo này ghi lại AI được dùng thế nào, review ra sao, sai ở đâu và còn yếu chỗ nào.

Mọi con số dưới đây lấy từ ghi chép làm việc; bản sao nằm trong [`AI-report-evidence/`](../README.md) (README của thư mục ghi nguồn gốc từng file). Các file này có câu trả lời của **khách giả lập** (agent AI đóng vai khách), đã gắn nhãn `[Customer giả lập, ngày]` / `[Giả lập]`.

- Báo cáo review của Expert: [`expert-review/`](../expert-review/) — Gate 1, Gate 1 recheck, Gate 2, Gate 2 đóng + wireframe HTML, Gate 3.
- Góp ý / trả lời của Customer (giả lập): [`customer-feedback/`](../customer-feedback/) — PREMISE, wireframe, câu hỏi P3.
- Sổ theo dõi feedback (trích dòng LAB-4): [`logs/feedback-list-lab4-excerpt.md`](../logs/feedback-list-lab4-excerpt.md); nhật ký quyết định (trích): [`logs/decision-lab4-excerpt.md`](../logs/decision-lab4-excerpt.md).
- Ghi chú tiến độ cho báo cáo này (1)–(18): [`logs/progress-lab4-ai-report-notes.md`](../logs/progress-lab4-ai-report-notes.md); brief chung và ghi chú gộp khi chạy song song: [`briefs/`](../briefs/).

## 1. History of change

| No | Version | Action | Mục | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | — | Bản đầu (LAB-4 P4) | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.2.0 | Update | Đầu bài, 3.1, 3.2 | Expert Gate 3: nguồn số liệu trỏ vào `AI-report-evidence/` trong gói nộp (G3-M02); §3.2 tách điểm người dùng quyết / PL quyết cho khớp PREMISE §5 và nhật ký quyết định, thêm L4-D08 (G3-M01); §3.1 thêm dòng Gate 3 | 2026-11-25 | phuongnnm-23344 | |
| 3 | 0.2.1 | Update | 3.1, 3.2 | Expert Gate 3 kiểm diff: §3.1 thêm dòng "Gate 3 kiểm diff → RELEASE (2026-11-26)" (D3-n05); §3.2 PL quyết thêm DEC-048 (giữ giá R1, phần thêm trong buffer — D3-n04), DEC-055, DEC-057; người dùng quyết thêm L4-D09 (trạng thái ADR) và giữ `AI-report-evidence/` trong gói | 2026-11-26 | phuongnnm-23344 | |
| 4 | 0.2.2 | Update | 4.2 | Thêm bản tiếng Nhật `ja/` (sinh từ bản tiếng Việt, commit `9367490`); sửa dòng "Bản tiếng Nhật chưa làm" | 2026-11-26 | phuongnnm-23344 |  |
| 5 | 0.2.3 | Update | 3.4, 4.1 | Thêm §3.4 thời gian AI chạy (≈ 15,8 giờ wall-clock, ≈ 41,1 agent-giờ / 50 subagent) và thời gian người review (3 giờ, người làm lab báo); §4.1 thêm một ý | 2026-11-26 | phuongnnm-23344 |  |

## 2. Cách tổ chức AI và viết prompt

### 2.1 Ba vai tách nhau, một người điều phối

Tôi không dùng một phiên AI làm hết. Dự án có 3 agent với vai cố định (định nghĩa ở `.claude/agents/` của workspace):

| Vai | Làm gì | Không được làm |
|---|---|---|
| **Project Leader (PL)** | Viết mọi output: PREMISE, kiến trúc, ADR, DB, wireframe, spec, script; sửa theo feedback; ghi sổ feedback / quyết định / câu hỏi khách | Tự chấm output của mình, tự trả lời thay khách |
| **Expert reviewer** | Chấm theo tiêu chí người dùng giao ở từng gate, ra verdict RELEASE / RELEASE CÓ ĐIỀU KIỆN / CHƯA RELEASE | Sửa output của PL |
| **Customer (giả lập)** | Đóng vai 桜水産市場 và người dùng cuối: trả lời câu hỏi, góp ý wireframe / tiền đề | Câu trả lời ngoài RFP phải gắn `[Giả lập]` |

Phiên chat chính chỉ **điều phối**: chuyển việc đúng vai, chuyển kết quả giữa các vai, báo lại người dùng. Lý do: AI tự review bài mình viết thường chỉ xác nhận lại điều nó đã tin; tách người viết và người chấm thì lỗi lộ ra nhiều hơn (Gate 1 bắt được 2 lỗi Critical mà PL đã tự kiểm không thấy — mục 3).

Mỗi lượt PL bắt đầu bằng việc đọc `CLAUDE.md` (7 luật bất di bất dịch của đề), tóm tắt RFP, ghi chú làm việc `pl-memory.md` và sổ feedback; kết thúc bằng cập nhật ghi chú + danh sách file + câu hỏi cho khách. Nhờ vậy làm việc qua nhiều phiên mà không mất mạch, dù mỗi phiên AI bắt đầu từ đầu.

### 2.2 Cách viết prompt giao việc

- **Phạm vi + tiêu chí rõ, kết quả có định dạng cố định.** Prompt cho PL luôn có: việc gì, file nào được sửa, file nào chỉ đọc, tiêu chí xong, và báo cáo cuối theo khuôn (file đã đổi · dòng cần thêm vào index · mã lỗi mới · câu hỏi mới · mâu thuẫn phát hiện · `Status`). Prompt cho Expert do người dùng chỉ định phạm vi và tiêu chí ở từng gate (mục tiêu học tập LAB-4 + RFP + 7 luật + spec-standards).
- **Brief chung trước khi chạy song song.** P3 (spec) và wireframe HTML chia cho 3 luồng AI chạy cùng lúc. Mỗi lần có một file brief chung (`p3-shared-brief.md`, `wireframe-html-shared-brief.md`): bối cảnh, chuẩn tài liệu, nội dung bắt buộc, ngôn ngữ, **quyền sở hữu file** (luồng nào sửa file nào, file chung chỉ PL gộp), cấm commit. Prompt từng luồng chỉ thêm phạm vi màn của luồng đó.
- **Quyết định dùng chung viết trước khi sửa.** Sửa Gate 1 có một brief quyết định D1–D13 (định nghĩa 業務日, cách tính lại kỳ đã khóa, checklist 日次締め…) làm nguồn duy nhất cho 5 nơi phải đồng bộ (PREMISE, ADR, DB, wireframe, test vector) — ghi chú (4) trong `AI-report-evidence/logs/progress-lab4-ai-report-notes.md`.
- **Không để AI đoán chỗ chưa chốt.** Điều khách chưa trả lời thì ghi thành câu hỏi + tiền đề tạm + ảnh hưởng nếu sai (luật 7) vào `qa.md`; Customer giả lập trả lời thì dùng làm giả định có nhãn nguồn, không viết như đã chốt.

### 2.3 Skill và công cụ đã dùng

| Skill / công cụ | Dùng thế nào | Ghi chú |
|---|---|---|
| `tkm:audit-doc-parity` | **Chạy thật** ở P2-B: mô tả lại code prototype một cách độc lập (không đọc tài liệu), rồi so từng trường với cột "Prototype" của Database Design | Bắt được 3 chỗ tài liệu trôi khỏi code: D13, D19, N11 — ghi chú (2) |
| `tkm:rebuild-spec` | **Không chạy pipeline**; chỉ dùng khung artifact của skill để tự trích as-built prototype ở P1 (24 chỗ lệch D01–D24) | Lý do ở dưới |
| `tkm:brainstorm --role cto`, `tkm:uiux-design-information-architecture` | Dùng **khung / checklist** của skill khi viết kiến trúc, ADR, 画面一覧; không chạy luồng tự động | Cùng lý do |
| `tkm:ba-analyze-requirement`, `tkm:generate-ui-specs` | Ghi trong brief P3 là skill gợi ý cho từng luồng | Không có log chứng minh luồng nào chạy thật; ảnh đánh số cuối cùng làm bằng script riêng, không qua `generate-ui-specs` |
| Script tự viết (trong `scripts/`) | `render-wireframes.py` (HTML → PDF / PNG / ảnh spec), `export-mermaid-png.py` (Mermaid → PNG), `check-api-spec-consistency.py` (kiểm 42 API Design) | Viết khi kiểm tay bắt đầu tốn hơn viết script |
| Công cụ ngoài | `@mermaid-js/mermaid-cli@11.4.2`, Microsoft Edge headless, PyMuPDF, Pillow | |

**Vì sao không chạy pipeline của `tkm:rebuild-spec` và các skill IA** (ghi chú (3)): (a) pipeline ghi và đẩy kết quả vào `docs/` ở gốc repo nộp, sinh nhóm thư mục ngoài QC-01; (b) chuỗi hơn 10 subagent cho prototype 134 file là quá tay so với thứ chỉ cần làm nguyên liệu thô; (c) đầu ra phải theo khuôn BM-2-901-5x, không theo bố cục `docs/` của skill. Được: tiết kiệm token, output đúng khuôn ngay. Mất: các cổng kiểm tự động (validator, vòng reviewer) — bù bằng parity check độc lập và các gate Expert.

## 3. Review output của AI

### 3.1 Các gate và kết quả

| Gate | Phạm vi | Verdict | Số finding | Xử lý |
|---|---|---|---|---|
| Gate 1 | PREMISE, kiến trúc, 10 ADR, Database Design, 画面一覧 + wireframe | **CHƯA RELEASE** | 2 Critical · 10 Major · 11 Minor | Sửa hết + 32 góp ý wireframe của khách (FB-EXP-217..239, FB-CUS-260..296) |
| Gate 1 recheck | Như trên, sau sửa | RELEASE CÓ ĐIỀU KIỆN | 23 finding cũ: 22 Closed · 1 Partially; mới 0 C · 3 M · 8 m | Sửa N-01..N-03, n-01..n-08 |
| Gate 1 kiểm diff | Chỉ phần diff vừa sửa | **RELEASE** (cho sang P3) | 5 Minor mới (D-01..D-05) | Sửa trong P3 |
| Gate 2 | 12 Screen Spec, 7 FUNC, 15 TECH, 42 API, `_common/` | RELEASE CÓ ĐIỀU KIỆN | 0 Critical · 4 Major · 9 Minor | Sửa hết + áp 31 câu trả lời của khách (FB-EXP-275..287, FB-CUS-297..309) |
| Gate 2 đóng + wireframe HTML | Diff sửa Gate 2; 15 wireframe HTML, PDF, ảnh spec | Phần 1 **RELEASE**; Phần 2 RELEASE CÓ ĐIỀU KIỆN | 1 + 7 Minor | Sửa 7, để 1 cho LAB-5 (FB-EXP-288..295) |
| Gate 3 | Toàn bộ bộ nộp: README §4, PREMISE, AI-report, toàn bộ thiết kế (kiểm bằng máy: khuôn so byte với chuẩn, version index ↔ file, link, chuỗi chép nguyên văn RFP) | RELEASE CÓ ĐIỀU KIỆN | 0 Critical · 3 Major · 10 Minor | Sửa 2 Major (dòng quyết định phạm vi, bằng chứng vào gói) + 9 Minor; G3-m07 (trạng thái ADR) chờ người dùng; G3-M03 (mật khẩu demo của prototype) phải xong trước khi public repo ở LAB-5 (FB-EXP-296..308) |
| Gate 3 kiểm diff | Diff sửa Gate 3 (`f8042f2..6594832`): §6.1 Trạng thái màn ở 4 SPEC so với §5 Event + mã lỗi, §3.2 báo cáo này so với PREMISE §5 / nhật ký quyết định, `AI-report-evidence/` (so byte, quét bí mật), link | **RELEASE** (2026-11-26, cho dịch JA) | 0 Critical · 0 Major · 0 Minor · 5 ghi chú | Sửa cả 5 ghi chú D3-n01..n05 trước khi dịch (FB-EXP-309..313); G3-m07 người dùng quyết (L4-D09) |

Expert không chỉ đọc: Gate 2 đóng có kiểm bằng máy (quét badge của cả 15 HTML so với cột ID của 12 SPEC, chạy lại bộ kiểm API, tính lại số thuế 8% và số ngày 失効まで). Gate 1 recheck tính lại cả 11 test vector 完納奨励金.

### 3.2 Người tham gia ở đâu

Người làm bài không review từng dòng. Tôi giữ quyền quyết ở những điểm đổi phạm vi, đổi cấu trúc hoặc chọn hướng; phần còn lại PL (AI) tự quyết và ghi lại để Expert soát. Cột "Người quyết" ở PREMISE §5 và nhật ký quyết định ghi đúng ai quyết điểm nào.

**Người dùng quyết:**

- **Đầu LAB-4** (plan §0): ngôn ngữ (bản gốc tiếng Việt), số màn (10 màn spec đầy đủ, vì đề chỉ yêu cầu "màn hình cốt lõi"), chuẩn tài liệu duy nhất (`spec-standards/03-specs`), nơi nộp, tiêu chí cho Expert.
- **Tiền đề:** L4-D01 kiến trúc to-be trên AWS Tokyo, prototype chỉ là bản thử; L4-D02 danh sách 10 màn, SC-01-02 tách khối 許可 / 承認.
- **Sau Gate 1:** tách Database Design thành 9 file theo cụm + file tổng (M-09, L4-D04 / DEC-046); nhãn duyệt nội bộ không dùng chữ 承認 (L4-D03 / DEC-047 — người dùng giao việc sửa M-06); thêm wireframe SC-03-02 theo góp ý khách #22 (L4-D05 / DEC-049); để mở E-14 tới workshop, thiết kế vẽ hai nhánh (L4-D06 / DEC-050).
- **Sau Gate 2:** **không mở rộng** Screen Specification tới 70 màn / 99 chức năng — phần còn lại để LAB-5 xử lý qua DEP-01..17 (L4-D08 / DEC-058).
- **Sau Gate 3:** ADR đã qua Gate 1–3 chuyển **Accepted**, điểm còn chờ khách ghi ở mục "Điểm mở" trong từng ADR; ADR-006 giữ Proposed vì phụ thuộc workshop E-14 (L4-D09 / DEC-059). Giữ `AI-report-evidence/` trong gói nộp LAB-4; có giữ khi public repo hay không quyết ở LAB-5.
- **Wireframe:** đưa mẫu PDF phong cách, duyệt pilot SC-04-01 trước khi cho làm 14 màn còn lại, quyết ảnh spec chỉ lấy biến thể A.
- **Commit / push / bản dịch:** cho commit local trên `ver/lab-4`, push và merge `main` phải hỏi riêng; bản tiếng Nhật làm đầy đủ, đặt trong `ja/`.

**PL quyết** (theo finding của Expert, không đổi phạm vi đã chốt): Screen Specification 12 màn = 10 màn đại diện + SC-06-04, SC-06-05 vì xác nhận giao có tranh chấp là điểm người quyết cuối (L4-D07 / DEC-056, theo Expert G2-m05); giữ giá R1 — phần việc thêm do sửa Gate 1 (~0,5 MM) nằm trong buffer 15%, không đổi giá (DEC-048); gia hạn 許可 giữ thủ tục LAB-1 (DEC-051); hợp đồng API chung, mã lỗi chung, kiểu ID tài liệu khi gộp P3 (DEC-052..054); áp câu trả lời khách P3 (giả lập) vào thiết kế (DEC-055, DEC-057).

**Customer là giả lập.** 3 lượt góp ý / trả lời (22 điểm về PREMISE, 32 góp ý + 5 câu trả lời về wireframe, 31 câu hỏi P3: đồng ý 20 · điều chỉnh 5 · không đồng ý 3 · không phải câu của khách 3) đều do một agent AI đóng vai khách. Câu trả lời của nó được ghi nhãn `[Customer giả lập, ngày]` và chỉ dùng làm giả định có căn cứ; những câu cần 経理部 / 経営陣 thật vẫn để mở trong `qa.md`.

### 3.3 Lỗi phát hiện trong output AI và cách xử lý

| # | Lỗi | Ai / cái gì bắt được | Xử lý |
|---|---|---|---|
| 1 | **Tài liệu mock của LAB-2 mô tả sai code**: ghi 入金 "phân bổ FIFO", code thật gán theo cửa sổ tháng, không có bảng phân bổ (D03) | PL đọc lại SQL khi trích as-built ở P1 | Ghi vào bảng lệch; bài học: tài liệu AI viết ở LAB-2 chưa từng được đối chiếu với code ở điểm này |
| 2 | **To-be làm lùi so với prototype** ở 完納奨励金: chỉ tính lại kỳ đã khóa trong cùng năm TC (C-01); gán REVERSE / DELTA theo ngày áp thay vì 業務日 của GD gốc, đếm hai lần (C-02) | Expert Gate 1 (Critical) | Gốc lỗi: kiến trúc và DB viết ở hai phiên khác nhau, không có nguồn quyết định chung → viết brief D1–D13, sửa 5 nơi cùng lúc, thêm test vector TV-01..11 |
| 3 | **Nhãn test vector lệch RFP**: INC-EDGE-01/02/03 gắn sai nghĩa vì text trích từ PDF bị vỡ cột (N-01) | Expert Gate 1 recheck | Đối chiếu bản tóm tắt và bản đọc ảnh, thêm TV-12; bài học: gắn ID của RFP phải kiểm với bản đọc đúng, không với text trích máy |
| 4 | "Làm rõ khác biệt 許可 / 承認" vô tình **đổi một tiền đề khách đã chốt** (gia hạn 許可, PRM-121) | Expert Gate 1 recheck (N-03) | Trả về PRM-121 (DEC-051); trước khi đổi thủ tục phải grep PRM liên quan |
| 5 | **Ba luồng song song tự đặt quy ước API riêng**: URL có / không `v1`, body lỗi, HTTP 400 / 422, snake / camelCase, ID tài liệu, cơ chế MFA | PL khi gộp P3 | Chốt `_common/api-conventions.md` (DEC-052..054), sửa bằng script + kiểm parse 375 khối JSON ví dụ. Bài học: viết quy ước chung **trước** khi chia việc |
| 6 | **Script đổi body lỗi sót** `error_extra` trong văn xuôi TECH / SPEC (chỉ quét khóa JSON) | Expert Gate 2 (G2-M03) | Viết `check-api-spec-consistency.py` quét toàn `specs/`; thử bằng mẫu âm: bắt 4/4 lỗi cấy vào |
| 7 | **Mâu thuẫn chéo giữa các luồng**: checklist 日次締め 11 / 12 mục ở ADR / DB / SPEC, MFA cho checker quy chế theo PREMISE nhưng spec không đòi token (G2-M01) | Expert Gate 2 | Sửa spec theo PREMISE (không nới PREMISE); 12 mục thống nhất ở ADR-005 §2.5 = CLOSE_DB 4.24 = SC-07-02 |
| 8 | Fork tham chiếu **số mục ADR cũ** sau khi ADR đánh số lại | PL khi gộp sau Gate 1 | Grep tham chiếu chéo sau mỗi lần đánh số lại |
| 9 | **CSS tạm trùng lặp** khi 3 luồng làm wireframe HTML không được sửa file chung: khối tablet chép y hệt ở 5 file, một class chung đè trạng thái ô nhập khi gộp | PL khi gộp | Gộp vào `_shared/`, sửa selector; bài học giống (5): bộ thành phần chung phải có trước khi chia việc |
| 10 | Sơ đồ / wireframe lệch nhỏ với API: thiếu `X-MFA-Token` ở bước 13 RULE_VERSION; WF MD thiếu ID con có trên ảnh; ví dụ 後入力 rơi vào ngày trước go-live; một vai hai tên mẫu | Expert Gate 2 đóng (G2C-n01, W-m01..W-m06) | Sửa hết; thêm quét máy "mọi badge số của HTML có dòng trong WF MD" (0 thiếu) |
| 11 | **Môi trường**: Chrome 148 / 154 trong cache puppeteer treo khi in PDF; Edge chạy song song 3 luồng thì timeout; mermaid-cli lấy font Nhật làm chính làm chữ Việt có dấu chồng bị tách (chạy không báo lỗi, chỉ thấy khi mở ảnh) | PL khi render | Script dùng Edge trước, bỏ trình duyệt treo sau 60 s; render tuần tự một lần cuối; đặt Segoe UI trước Yu Gothic |
| 12 | **Trùng ID feedback** với phiên LAB-3 chạy song song trên cùng sổ (`FB-EXP-217..239` bị LAB-4 dùng trước) | PL phiên LAB-3 | Luôn đọc ID lớn nhất ngay trước khi ghi; LAB-3 đánh tiếp từ 240 |
| 13 | Commit nhóm lỡ **kèm file xóa đã stage từ trước** | PL tự kiểm | Reset mềm, commit lại theo nhóm; trước mỗi commit xem `git diff --cached --stat` |
| 14 | Lượt P4: script đổi ví dụ SC-09-04 **mở file để ghi trước khi đọc** → file HTML (chưa commit) bị rỗng | PL thấy ngay khi kiểm | Dựng lại từ lịch sử thao tác của phiên (lần ghi file + các lệnh sửa sau đó), render lại và so ảnh từng pixel với PNG cũ: trùng khít, rồi mới áp sửa. Bài học: file chưa commit không có lưới an toàn — sửa bằng script thì đọc vào biến trước, hoặc commit trước khi sửa hàng loạt |

### 3.4 Thời gian AI chạy và thời gian người review

Đo từ dấu thời gian trong transcript phiên chính và transcript của các subagent (điều phối đo); thời gian người review do người làm lab tự báo.

| Hạng mục | Số đo | Cách tính / ghi chú |
|---|---|---|
| Khoảng thời gian LAB-4 | 2026-11-25 12:05 → 2026-11-26 16:05 JST | 2 ngày làm việc |
| Thời gian AI chạy thực (wall-clock) | khoảng 15,8 giờ | Các khoảng có ít nhất một agent đang chạy; bỏ mọi khoảng trống > 15 phút không có hoạt động |
| Tổng thời gian chạy của agent | khoảng 41,1 agent-giờ, 50 subagent | Lớn hơn wall-clock vì chạy song song: P3 3 luồng, wireframe HTML 3 luồng, dịch JA 10 luồng |
| Thời gian người review | 3 giờ | Người làm lab tự báo: đọc output, quyết định ở các gate, duyệt |

## 4. Điểm đặc biệt và tự đánh giá

### 4.1 Chỗ tôi tin là làm hiệu quả

- **Tách người viết / người chấm / người dùng.** Ba vai riêng làm lỗi lộ sớm: 2 Critical ở Gate 1 là lỗi PL đã tự kiểm mà không thấy. Gate 1 có 23 finding, Gate 2 còn 13, Gate 2 đóng còn 8 Minor; Gate 3 (cả gói nộp) 0 Critical, 3 Major đều nằm ở tài liệu nộp kèm và bảo mật repo, không ở nội dung thiết kế.
- **Brief chung + chia quyền sở hữu file khi chạy song song.** Từ sửa Gate 1 trở đi không còn xung đột ghi giữa các luồng; mâu thuẫn còn lại đều do *thiếu quy ước*, không phải do ghi đè nhau.
- **Kiểm bằng cách mô tả lại độc lập** (parity check) thay vì để người viết tự xác nhận — bắt được trôi lệch mà đọc lại không thấy.
- **Một nguồn → nhiều đầu ra bằng một lệnh**: wireframe HTML sinh PDF + PNG + ảnh spec; Mermaid sinh PNG. Đổi wireframe không phải vẽ lại ảnh tay, số trên ảnh luôn khớp cột ID.
- **Mọi điểm chưa chốt thành câu hỏi có ảnh hưởng estimate** (luật 7), mọi câu trả lời giả lập có nhãn nguồn — người đọc biết chỗ nào là quyết định, chỗ nào là giả định.
- **Sổ feedback + nhật ký tiến độ** giữ mạch qua nhiều phiên; con số trong báo cáo này truy được về file trong `AI-report-evidence/`.
- **Người chỉ bỏ khoảng 3 giờ cho khoảng 15,8 giờ AI chạy (41,1 agent-giờ)** — phần lớn công đọc / chấm do vai Expert và Customer làm; người tập trung vào quyết định ở gate (§3.4).

### 4.2 Chỗ chưa tốt, khi làm thật phải cải thiện

- **Quy ước chung đến muộn.** API conventions và bộ CSS chung đều có *sau* khi đã chia việc, nên tốn một vòng gộp và sinh lỗi sót (lỗi 5, 6, 9). Làm thật: viết quy ước, khung và bộ kiểm tự động trước khi fan-out.
- **Hai nguồn bố cục song song** (khối ASCII trong WF MD + HTML) vẫn còn ở 14 / 15 wireframe; đã ghi quy tắc "lệch thì theo HTML + SPEC" và đóng băng ASCII, nhưng chưa dọn (Expert W-m07, để LAB-5). Làm thật: chỉ giữ một nguồn hình (Figma hoặc HTML).
- **Phần do luồng song song viết chủ yếu chỉ được PL kiểm bằng grep / script** (mã lỗi, khóa JSON, badge, link). Đúng cú pháp và nhất quán chéo thì kiểm được; đúng nghiệp vụ thì chỉ Expert đọc mẫu. Spec 12 màn dài, Expert không đọc hết từng dòng.
- **Customer là AI đóng vai.** Câu trả lời hợp lý nhưng không thay được 経理部 / 経営陣 thật; vài câu (cách ghi 請求 cho GD nhập muộn, nhân sự 代行, E-14) vẫn mở. Bộ thiết kế đúng tới mức giả định đúng.
- **Không chạy pipeline skill tự động** nên mất các cổng kiểm có sẵn; bù bằng gate Expert nhưng gate là thủ công và tốn token.
- **Giới hạn thời gian / token**: chỉ 12 / 70 màn có Screen Specification; ba màn có wireframe nhưng chưa có spec; phụ thuộc DEP-01..17 mới ở mức danh sách. Bản tiếng Nhật `ja/` do AI dịch (10 luồng song song) rồi hậu kỳ bằng script (số dòng, số `|`, khối code, nhãn, số, link) — chưa có người đọc tiếng Nhật rà nội dung nghiệp vụ.
- **Thao tác file hàng loạt bằng script trên file chưa commit** từng làm mất một file (lỗi 14). Dựng lại được nhờ lịch sử phiên, nhưng đó là may. Làm thật: commit nhỏ, thường xuyên, script sửa luôn đọc trước ghi sau.
