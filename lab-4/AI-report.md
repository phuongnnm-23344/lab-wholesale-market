---
id: DOC-AI-REPORT-001
title: Báo cáo cách dùng AI trong LAB-4
type: report
version: "0.3.0"
updated_by: phuongnnm-23344
updated: 2026-11-26
related: [PREMISE.md, README.md, AI-report-evidence/README.md]
---

# Báo cáo cách dùng AI trong LAB-4

Bộ thiết kế trong repo này (PREMISE, kiến trúc, 10 ADR, 10 Database Design, 15 wireframe, 12 Screen Specification, 7 Function Specifications, 15 Technical Design, 42 API Design, bản tiếng Nhật `ja/`) do AI viết gần như toàn bộ. Người làm bài điều phối, ra quyết định và duyệt.

Số liệu trong báo cáo lấy từ ghi chép làm việc, bản sao ở [`AI-report-evidence/`](../AI-report-evidence/README.md): báo cáo review của Expert ([`expert-review/`](../AI-report-evidence/expert-review/)), góp ý của khách giả lập ([`customer-feedback/`](../AI-report-evidence/customer-feedback/)), sổ feedback và nhật ký quyết định ([`logs/`](../AI-report-evidence/logs/)), brief giao việc ([`briefs/`](../AI-report-evidence/briefs/)). Bản 0.2.3 đầy đủ hơn (14 lỗi, chi tiết công cụ) ở [`logs/ai-report-0.2.3-full-before-condense.md`](../AI-report-evidence/logs/ai-report-0.2.3-full-before-condense.md).

## 1. History of change

| No | Version | Action | Mục | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | — | Bản đầu (LAB-4 P4) | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.2.0 | Update | Đầu bài, 3.1, 3.2 | Expert Gate 3: nguồn số liệu trỏ vào `AI-report-evidence/` trong gói nộp (G3-M02); §3.2 tách điểm người dùng quyết / PL quyết cho khớp PREMISE §5 và nhật ký quyết định, thêm L4-D08 (G3-M01); §3.1 thêm dòng Gate 3 | 2026-11-25 | phuongnnm-23344 | |
| 3 | 0.2.1 | Update | 3.1, 3.2 | Expert Gate 3 kiểm diff: §3.1 thêm dòng "Gate 3 kiểm diff → RELEASE (2026-11-26)" (D3-n05); §3.2 PL quyết thêm DEC-048 (giữ giá R1, phần thêm trong buffer — D3-n04), DEC-055, DEC-057; người dùng quyết thêm L4-D09 (trạng thái ADR) và giữ `AI-report-evidence/` trong gói | 2026-11-26 | phuongnnm-23344 | |
| 4 | 0.2.2 | Update | 4.2 | Thêm bản tiếng Nhật `ja/` (sinh từ bản tiếng Việt, commit `f0a2948`); sửa dòng "Bản tiếng Nhật chưa làm" | 2026-11-26 | phuongnnm-23344 |  |
| 5 | 0.2.3 | Update | 3.4, 4.1 | Thêm §3.4 thời gian AI chạy (≈ 15,8 giờ wall-clock, ≈ 41,1 agent-giờ / 50 subagent) và thời gian người review (3 giờ, người làm lab báo); §4.1 thêm một ý | 2026-11-26 | phuongnnm-23344 |  |
| 6 | 0.3.0 | Update | Toàn bộ | Viết lại gọn cho người chấm: giữ 3 vai, gate, quyết định của người, 7 lỗi chính, số đo thời gian, tự đánh giá; bỏ chuỗi ID, tên script / môi trường; thêm review bản `ja/`; bản 0.2.3 đầy đủ chép vào `AI-report-evidence/logs/` | 2026-11-26 | phuongnnm-23344 |  |

## 2. Cách dùng AI

### 2.1 Ba vai tách nhau, một người điều phối

| Vai | Làm gì | Không được làm |
|---|---|---|
| **Project Leader (PL)** | Viết mọi output, sửa theo feedback, ghi sổ feedback / quyết định / câu hỏi cho khách | Tự chấm bài mình, tự trả lời thay khách |
| **Expert** | Chấm theo tiêu chí người dùng giao ở từng gate, ra kết luận: RELEASE / RELEASE CÓ ĐIỀU KIỆN / CHƯA RELEASE | Sửa bài của PL |
| **Customer (giả lập)** | Đóng vai chợ 桜水産市場 và người dùng cuối: trả lời câu hỏi, góp ý tiền đề và wireframe | Trả lời ngoài RFP mà không gắn nhãn `[Giả lập]` |

Cả ba đều là agent AI. Phiên chat chính chỉ chuyển việc giữa các vai và báo lại người dùng. Lý do tách: AI tự chấm bài mình thường chỉ xác nhận điều nó đã tin. Ở Gate 1, Expert bắt được 2 lỗi Critical mà PL đã tự kiểm không thấy.

### 2.2 Cách giao việc

- Mỗi lần giao việc đều nói rõ: làm gì, file nào được sửa, file nào chỉ đọc, thế nào là xong, và báo cáo cuối theo khuôn cố định.
- Khi chia cho 3 luồng AI chạy song song (spec P3, wireframe HTML), có một brief chung: chuẩn tài liệu, nội dung bắt buộc, luồng nào được sửa file nào. File dùng chung chỉ PL gộp.
- Quyết định dùng chung được viết thành một tài liệu trước khi sửa nhiều nơi. Ví dụ sau Gate 1, một bản quyết định D1–D13 làm nguồn cho 5 tài liệu phải sửa cùng lúc.
- Điểm khách chưa trả lời không để AI tự đoán: ghi thành câu hỏi + tiền đề tạm + ảnh hưởng nếu sai.
- Mỗi phiên, PL đọc lại luật của đề, ghi chú làm việc và sổ feedback trước khi làm.

### 2.3 Công cụ

Skill chủ yếu dùng làm khung và checklist, vì đầu ra phải theo khuôn tài liệu của công ty. Skill có ích nhất là kiểm tương đương (parity check): AI mô tả lại code prototype mà không đọc tài liệu, rồi so với tài liệu. Ngoài ra có 4 script nhỏ: xuất wireframe và sơ đồ ra ảnh, kiểm API Design, kiểm link.

## 3. Review output của AI

### 3.1 Các gate và kết quả

| Gate | Phạm vi | Kết luận | Lỗi tìm thấy | Xử lý |
|---|---|---|---|---|
| Gate 1 | Tiền đề, kiến trúc, ADR, Database Design, 画面一覧 + wireframe | **CHƯA RELEASE** | 2 Critical · 10 Major · 11 Minor | Sửa hết, kèm 32 góp ý wireframe của khách |
| Gate 1 kiểm lại | Như trên, sau khi sửa | RELEASE CÓ ĐIỀU KIỆN → kiểm diff: **RELEASE** | 22/23 lỗi cũ đóng; mới 3 Major · 8 Minor, rồi 5 Minor | Sửa hết, cho sang viết spec |
| Gate 2 | 12 Screen Specification, 7 Function, 15 Technical, 42 API Design | RELEASE CÓ ĐIỀU KIỆN | 0 Critical · 4 Major · 9 Minor | Sửa hết, áp 31 câu trả lời của khách |
| Gate 2 đóng + wireframe HTML | Phần sửa Gate 2; 15 wireframe HTML, PDF, ảnh spec | **RELEASE** / RELEASE CÓ ĐIỀU KIỆN | 1 + 7 Minor | Sửa 7, để 1 cho LAB-5 |
| Gate 3 | Toàn bộ gói nộp | RELEASE CÓ ĐIỀU KIỆN → kiểm diff: **RELEASE** | 0 Critical · 3 Major · 10 Minor, rồi 5 ghi chú | Sửa 2 Major + 9 Minor + 5 ghi chú; mật khẩu demo của prototype phải xử lý trước khi public repo ở LAB-5 |
| Bản tiếng Nhật `ja/` | 135 file dịch | **CHƯA RELEASE** → kiểm diff: RELEASE CÓ ĐIỀU KIỆN | 1 Critical · 1 Major · 8 Minor, rồi 3 Minor | Sửa hết ([review](../AI-report-evidence/expert-review/expert-review-lab4-ja-261126.md)) |

Expert không chỉ đọc mà còn kiểm bằng máy: tính lại 11 ví dụ tính 完納奨励金 (thưởng thanh toán đúng hạn), so số trên ảnh wireframe với bảng spec, so khuôn tài liệu từng byte với chuẩn công ty, ghép từng dòng bản Việt với bản Nhật.

### 3.2 Người làm bài quyết gì

Tôi không đọc từng dòng, chỉ quyết ở những điểm đổi phạm vi, cấu trúc hoặc hướng đi; phần còn lại PL tự quyết và ghi lại để Expert soát. Ai quyết điểm nào ghi ở PREMISE §5 và [nhật ký quyết định](../AI-report-evidence/logs/decision-lab4-excerpt.md).

- **Đầu LAB-4:** bản gốc tiếng Việt; 10 màn có spec đầy đủ (đề chỉ đòi "màn hình cốt lõi"); một chuẩn tài liệu duy nhất; tiêu chí chấm cho Expert.
- **Tiền đề:** kiến trúc to-be trên AWS Tokyo, prototype chỉ là bản thử; màn SC-01-02 tách hai khối 許可 (giấy phép của 仲卸) và 承認 (tư cách của 売買参加者).
- **Sau Gate 1:** chia Database Design thành 9 file + 1 file tổng; không dùng chữ 承認 cho duyệt nội bộ; thêm một wireframe theo góp ý khách; câu hỏi E-14 để mở tới workshop, thiết kế vẽ cả hai nhánh.
- **Sau Gate 2:** không mở rộng Screen Specification tới 70 màn; phần còn lại để LAB-5.
- **Sau Gate 3:** ADR đã qua 3 gate chuyển Accepted, trừ ADR-006 còn chờ E-14.
- **Wireframe:** đưa mẫu phong cách, duyệt màn thử trước khi cho làm 14 màn còn lại.
- **Repo và bản dịch:** cho commit local, push và merge phải hỏi riêng; bản tiếng Nhật đầy đủ trong `ja/`.

PL tự quyết những điểm không đổi phạm vi, ví dụ: thêm 2 màn giao hàng có tranh chấp vào spec (12 màn) vì đó là điểm người quyết cuối theo luật của đề; giữ giá vì việc thêm (~0,5 MM) nằm trong buffer 15%; chốt quy ước API chung khi gộp 3 luồng.

Khách giả lập trả lời 3 lượt (22 điểm tiền đề, 32 góp ý + 5 câu trả lời về wireframe, 31 câu hỏi spec); câu trả lời chỉ dùng làm giả định có nhãn nguồn.

### 3.3 Lỗi chính của AI và cách bắt

| # | Lỗi | Ai bắt | Sửa và bài học |
|---|---|---|---|
| 1 | Thiết kế to-be **làm lùi so với prototype** ở cách tính 完納奨励金: tính lại kỳ đã khóa thiếu, có chỗ đếm hai lần | Expert, Gate 1 (Critical) | Kiến trúc và Database Design viết ở hai phiên không có nguồn quyết định chung. Viết một bản quyết định chung, sửa 5 tài liệu cùng lúc, thêm ví dụ tính để kiểm |
| 2 | **Tài liệu AI viết ở LAB-2 mô tả sai code** (ghi phân bổ tiền theo FIFO, code thật gán theo tháng) | PL đọc lại SQL; kiểm tương đương bắt thêm 3 chỗ | Ghi vào bảng lệch. Tài liệu AI viết phải đối chiếu với code, không tin lại |
| 3 | **Gắn sai nghĩa mã test của RFP** vì text trích từ PDF bị vỡ cột | Expert, Gate 1 kiểm lại | Đối chiếu với bản đọc đúng của RFP trước khi gắn mã |
| 4 | Khi "làm rõ" 許可 / 承認, AI **đổi luôn một tiền đề khách đã chốt** | Expert, Gate 1 kiểm lại | Trả về tiền đề cũ. Trước khi sửa thủ tục, tìm mọi tiền đề liên quan |
| 5 | **Ba luồng song song tự đặt quy ước riêng** (dạng URL, body lỗi, mã HTTP, CSS); script sửa sau đó còn sót | PL khi gộp; Expert Gate 2 bắt phần sót | Chốt quy ước chung, viết script kiểm toàn bộ. Bài học: quy ước chung phải có **trước** khi chia việc |
| 6 | **Tài liệu mâu thuẫn nhau**: checklist 日次締め (khóa ngày) 11 mục ở chỗ này, 12 mục ở chỗ khác; spec không đòi MFA ở chỗ tiền đề đòi | Expert, Gate 2 | Sửa spec theo tiền đề, thống nhất 12 mục ở cả 3 tài liệu |
| 7 | Bản tiếng Nhật dịch "bảng tỷ lệ thưởng" thành **税率表 (bảng thuế suất)** ở 31 chỗ / 8 file | Expert, review `ja/` (Critical) | Script kiểm khung (số dòng, bảng, code) không bắt được nghĩa. Thêm thuật ngữ vào bảng bắt buộc, kiểm bằng cách ghép từng dòng Việt ↔ Nhật |

### 3.4 Thời gian AI chạy và thời gian người review

Đo từ dấu thời gian trong transcript phiên chính và transcript của các subagent (điều phối đo); thời gian người review do người làm lab tự báo.

| Hạng mục | Số đo | Cách tính / ghi chú |
|---|---|---|
| Khoảng thời gian LAB-4 | 2026-11-25 12:05 → 2026-11-26 16:05 JST | 2 ngày làm việc |
| Thời gian AI chạy thực (wall-clock) | khoảng 15,8 giờ | Các khoảng có ít nhất một agent đang chạy; bỏ mọi khoảng trống > 15 phút không có hoạt động |
| Tổng thời gian chạy của agent | khoảng 41,1 agent-giờ, 50 subagent | Lớn hơn wall-clock vì chạy song song: P3 3 luồng, wireframe HTML 3 luồng, dịch JA 10 luồng |
| Thời gian người review | 3 giờ | Người làm lab tự báo: đọc output, quyết định ở các gate, duyệt |

## 4. Tự đánh giá

### 4.1 Chỗ làm được

- **Tách người viết và người chấm làm lỗi lộ sớm.** Gate 1 có 23 lỗi, Gate 2 còn 13, Gate 2 đóng còn 8 Minor; Gate 3 không còn Critical, 3 Major đều ở tài liệu nộp kèm và bảo mật repo, không ở nội dung thiết kế.
- **Brief chung và chia quyền sửa file**: các luồng song song không ghi đè nhau.
- **Một nguồn sinh nhiều đầu ra bằng một lệnh** (wireframe HTML → PDF, PNG, ảnh spec): số trên ảnh luôn khớp bảng spec.
- **Điểm chưa chốt thành câu hỏi có ghi ảnh hưởng**; câu trả lời giả lập có nhãn nguồn.
- **Người chỉ bỏ khoảng 3 giờ cho khoảng 15,8 giờ AI chạy** (41,1 agent-giờ): phần đọc và chấm do vai Expert và Customer làm, người tập trung vào quyết định ở gate.

### 4.2 Chỗ chưa tốt và cách làm khi làm thật

- **Quy ước chung đến muộn** nên tốn một vòng gộp và sinh lỗi sót (lỗi 5). Làm thật: viết quy ước, khung và bộ kiểm trước khi chia việc.
- **Kiểm bằng máy chỉ bắt được đúng cú pháp, không bắt được đúng nghĩa** (lỗi 7). Đúng nghiệp vụ chỉ Expert đọc mẫu; spec 12 màn dài, Expert không đọc hết. Bản tiếng Nhật chưa có người đọc tiếng Nhật rà nội dung nghiệp vụ.
- **Customer là AI đóng vai**: hợp lý nhưng không thay được phòng kế toán, ban lãnh đạo thật; vài câu vẫn mở. Thiết kế đúng tới mức giả định đúng.
- **Còn hai nguồn hình cho wireframe** (khối ASCII và HTML), mới có quy tắc "lệch thì theo HTML", chưa dọn. Làm thật: chỉ giữ một nguồn.
- **Phạm vi còn hở**: 12 / 70 màn có spec; các phần phụ thuộc chưa đặc tả mới ở mức danh sách.
- **Sửa hàng loạt bằng script trên file chưa commit** từng làm mất một file, dựng lại được nhờ lịch sử phiên. Làm thật: commit nhỏ, thường xuyên; script đọc trước rồi mới ghi.
