# Báo cáo cách dùng AI trong LAB-5

Backlog (510 item trên GitHub Project), điểm SWP, giờ, sprint giả lập và các file nộp ở gốc repo đều do AI làm. Người làm bài điều phối, chốt điểm mẫu và ra quyết định ở các gate. Cách tổ chức giữ như LAB-4 ([`lab-4/AI-report.md`](lab-4/AI-report.md)): ba vai AI tách nhau — **Project Leader (PL)** làm, **Expert** chấm, **Customer giả lập** góp ý từ phía chợ — phiên chat chính chỉ chuyển việc giữa các vai.

Bằng chứng ở [`AI-report-evidence/lab-5/`](AI-report-evidence/lab-5/README.md): review của Expert Gate A / B, góp ý của khách giả lập, sổ feedback LAB-5, brief giao việc.

## 1. Skill và cách viết prompt cho từng việc

| Việc | Skill / công cụ | Cách giao việc cho AI |
|---|---|---|
| **Break task** | Agent PL × 3 luồng song song; khung chia việc và DoD theo `tkm:pm-create-tasks`, tìm chỗ hở theo `tkm:ba-analyze-requirement` | Một **brief chung** viết trước khi chia ([`briefs/p1-shared-brief.md`](AI-report-evidence/lab-5/briefs/p1-shared-brief.md)): 18 epic và luồng nào sở hữu epic nào, quy tắc ID không đụng nhau, định dạng một dòng backlog (spec ref, vai, DoD, phụ thuộc, nhãn, giờ sơ bộ), 7 luật của đề, "không tự viết spec thay — chỗ chưa có spec thì tạo issue thô + issue làm rõ", không chép RFP. Mỗi luồng chỉ ghi **một file yaml** của mình, trả về số đếm + 5 chỗ hở nặng nhất. PL gộp, rồi một script kiểm cả backlog (độ hạt, nhãn 許可 / 承認, phụ thuộc vòng, đủ 15 test vector 完納, mọi spec có issue hoặc lý do) |
| **Đẩy lên Project** | Agent PL + `gh api graphql` | Prompt đòi script **chạy lại được, không tạo trùng** (đọc bảng id → số issue), tạo theo thứ tự phụ thuộc để thân issue ghi được `#số` ngay, chạy thử 1 epic + 2 issue + 1 sub-issue trước khi chạy hết, giãn nhịp 7,5–15 giây. Tắt workflow gắn nhãn của repo trong lúc đẩy |
| **Chấm SWP** | `tkm:sun-estimate` (phiên chính) + 5 worker `sun-estimate-worker` | Lấy 499 issue từ Project (chỉ đọc), chia 5 lô ~80 issue, **che trong thân issue** giờ sơ bộ, người phụ trách, ID RFP, mục phụ thuộc để worker chấm Scope × Complexity theo cấu trúc việc, không neo vào giờ. Skill chọn 5 issue mẫu (thấp nhất, trung vị, cao nhất, lệch xa, kém tin cậy nhất); **người dùng chốt từng issue, 2 vòng** (mức → điểm); hiệu chỉnh lan sang lá cùng tầng trong lần chấm đó; skill xuất HTML vào `reports/` |
| **Quy giờ** | Agent PL | Giao một quy tắc duy nhất: `Hours = SWP × k`, một k cho mọi issue, muốn đổi giờ thì phải đổi SWP qua người chốt. PL chọn k = 2,0 từ trung vị giờ / SWP của issue mẫu (1,75) và của 304 lá có spec (2,07); Expert Gate B giữ một k |
| **Ghi SWP / giờ lên Project** | Agent PL chạy script (không phải agent riêng như plan ban đầu) | Nguồn duy nhất là **payload nhúng trong HTML của skill**: script đọc payload → bảng SWP / giờ → ghi trường Point / Hours bằng GraphQL, giãn 2 giây → **đọc lại toàn bộ** item so với bảng (510 / 510 khớp; Expert tự đếm lại, 0 lệch) |
| **Báo cáo tiến độ** | Agent PL; ảnh theo `dataviz`; khung báo cáo / rủi ro theo `tkm:pm-report-project`, `tkm:pm-track-risks-issues` (tự dựng, không gọi skill) | Prompt bắt viết **nhật ký giả lập theo ngày** (CSV) trước, script kiểm nhật ký (ngày làm, chuyển trạng thái hợp lệ, không Done trước phụ thuộc), rồi mới sinh burndown và đặt Status lên Project từ cùng nhật ký. Bản tiếng Nhật gửi khách PL viết trực tiếp; Customer giả lập đọc bản đó như khách thật |

**Chỗ chạy lệch khỏi skill `tkm:sun-estimate`** (Expert Gate B ghi nhận, không làm sai số nhưng cần nói rõ):

- Theo hợp đồng của skill, worker **không có công cụ, nhận bằng chứng inline**. Ở đây worker được **đọc file** (rubric + lô của mình) và **ghi file** kết quả. Lời dặn "chỉ đọc 3 file" không chặn được việc worker mở `backlog.yaml` có giờ sơ bộ; không thấy dấu hiệu neo giờ (test +47%, issue thô −64% so với giờ sơ bộ), nhưng đó là may, không phải kiểm soát.
- **Che cả mục phụ thuộc và ID RFP** để tránh neo; đổi lại việc nối nhiều module có thể bị chấm thấp, hiệu chỉnh 5 mẫu chỉ bù một phần.
- **Ba lần chấm lại nhỏ** (11 lá sau Gate B, 2 lá khi tách #486, 1 lá chấm chéo #507) chấm inline ở phiên chính, không qua worker.
- Hiệu chỉnh của skill chỉ lan **trong một lần chấm**. Áp quy tắc của lần trước sang lần sau (#507 theo quy tắc #116) là **quyết định của người dùng**, ghi ở [`estimate.md`](estimate.md) §1.3.

## 2. Review output của AI

### 2.1 Các gate

| Gate | Phạm vi | Kết luận | Lỗi tìm thấy | Xử lý |
|---|---|---|---|---|
| Customer — ưu tiên | Thứ tự epic, phạm vi sprint đầu | — | 7 góp ý | Đưa vào ưu tiên P1–P4 và phạm vi Iteration 1 |
| **Gate A** (sau break, trước khi đẩy Project) | backlog yaml, task-breakdown, PREMISE | RELEASE CÓ ĐIỀU KIỆN → kiểm diff: RELEASE CÓ ĐIỀU KIỆN → **RELEASE** | 0 Critical · 7 Major · 7 Minor; vòng 2 thêm 1 Major; vòng 3 thêm 3 Minor | Sửa hết trong yaml **trước** khi đẩy (sửa sau khi đã có 500 issue tốn gấp đôi); áp 4 chỗ sửa spec LAB-4 |
| **Gate B** (sau SWP + giờ) | estimate, HTML, Point / Hours trên Project, so LAB-1 | RELEASE CÓ ĐIỀU KIỆN → kiểm diff: **RELEASE** | 0 Critical · 2 Major · 7 Minor; vòng 2 thêm 2 Minor | Tách 4 lá 完納, thêm 2 issue thô, chấm lại 3 lần; các ghi chú cho AI-report / README làm ở đây |
| Customer — báo cáo tiến độ | Bản tiếng Nhật của progress-report | Cần sửa nhỏ | 12 góp ý | Sửa hết, kể cả phần "muốn có" |
| Gate C (toàn bộ, mở link không đăng nhập) | Gói nộp | `<chưa chạy>` | | |

Expert không chỉ đọc mà tự đếm lại bằng máy: số item trên Project qua API, tổng SWP / giờ theo epic, payload HTML so với trường Point / Hours, quét token / email / đường dẫn máy trong HTML.

### 2.2 Người làm bài quyết ở đâu

Danh sách đầy đủ ở plan (§0, 20 dòng) và các dòng `L5-D…` của [`PREMISE.md`](PREMISE.md). Những điểm chính:

- **Đầu LAB-5:** chung repo với LAB-4, tag `lab-4`; một sprint giả lập theo lịch WBS LAB-1; giờ = SWP × k một hệ số; epic theo nhóm chức năng LAB-1; repo + Project public, trước đó gỡ mật khẩu demo và các phần không tự viết.
- **Gate A:** độ hạt theo **rolling-wave** — việc có spec ≤ 16 giờ, phần chưa có spec giữ ở đơn vị tự nhiên (một màn, một nhóm API) và tách trước sprint của nó; thiết kế iam làm trước sprint (設計第1波); đổi phạm vi FE của S1 để điều kiện dùng thử demo được.
- **Giữa lúc đẩy Project:** đổi quy ước tiêu đề issue sang tiếng Anh dạng `[PREFIX][màn / function][vai] English title` (285 issue đã tạo phải đổi tên).
- **Chốt SWP:** 3 lượt chốt mẫu — 5 issue (lần chấm chính), 5 issue (chấm lại sau Gate B), 2 issue (#486 tách tiếp) — cộng 1 issue chấm chéo (#507).
- **Gate B:** ngoại lệ có tên cho lá > 16 giờ, tách 4 lá 完納奨励金; tách tiếp #486; áp quy tắc hiệu chỉnh sang lần chấm khác.
- **Sprint:** ghi rủi ro nghỉ Tết (mùng 1 Tết 2027 rơi giữa Iteration 1, WBS LAB-1 chưa trừ) nhưng giữ số giả lập.

### 2.3 Lỗi đáng học của AI và cách xử lý

| # | Lỗi | Ai bắt | Xử lý và bài học |
|---|---|---|---|
| 1 | Màn chưa có spec bị **chia đều giờ LAB-1 theo khuôn tầng** (FE 1/2, 2/2…) — trông chi tiết nhưng là độ chính xác giả | Expert Gate A | Người dùng chọn rolling-wave: giữ issue thô ở đơn vị tự nhiên, viết spec là issue thiết kế có giờ thật. Bài học: chưa có spec thì đừng tách cho đẹp |
| 2 | **Ưu tiên ngược phụ thuộc** ở 24 cặp: issue P1 chờ issue P4 | Expert Gate A | Lan ưu tiên theo phụ thuộc (58 issue được nâng), script kiểm 0 cặp ngược |
| 3 | Sprint đầu **vượt năng lực mà không ghi năng lực bằng số**; chia theo người có người 158 giờ / 2 tuần | Expert Gate A | Ghi năng lực 360 giờ (vai × giờ), cam kết 254 giờ, mỗi người ≤ 40 giờ |
| 4 | AI **tự đặt giả định đụng tới tiền của người mua** (không tự phân bổ lại tiền đã trả khi số phải trả giảm — quyết định người đó có được thưởng 完納 hay không) | Expert Gate A | Chuyển thành câu hỏi cho khách, giữ giả định tạm có ghi ảnh hưởng nếu sai. Bài học: giả định chạm tiền phải hỏi, không tự chốt |
| 5 | Sau khi quy giờ, **22 lá vượt chính trần 16 giờ AI đã đặt**; backlog thiếu hẳn việc design system và sửa lỗi sau UAT nhưng chỉ ghi vào "rủi ro" | Expert Gate B | Tách 4 lá 完納, 18 lá còn lại gắn nhãn `needs-split` (ngoại lệ có tên, người dùng xác nhận); thêm 2 issue thô #500, #501 có giờ lấy từ LAB-1 |
| 6 | **Hiệu chỉnh điểm không lan giữa các lần chấm**: #507 cùng tầng với #116 nhưng vẫn mang điểm cũ | Expert Gate B | Người dùng quyết chấm chéo #507 (4 → 6). Bài học: mỗi lần chấm lại phải đối chiếu với quy tắc đã chốt ở lần trước |
| 7 | Bản tiếng Nhật gửi khách **viết như khách đã xác nhận / đã hứa** (ご確認済みの設計, 受領する前提) và có cụm 「承認の確認・却下」 dễ đọc thành bác một quyết định duyệt nội bộ — sát ranh luật 許可 ≠ 承認 | Customer giả lập | Đổi thành đề xuất / đang bàn với chợ; viết 「承認申請の確認・却下」, chú thích 決裁 (許可) và 確認 (承認). Bài học: bản gửi khách cần một lượt đọc từ phía khách, không chỉ Expert |

### 2.4 Thời gian AI chạy và thời gian người review

Đo như LAB-4: dấu thời gian trong transcript phiên chính và các subagent, bỏ mọi khoảng trống > 15 phút không có hoạt động (điều phối đo). Thời gian người review do người làm bài tự báo.

| Hạng mục | Số đo | Ghi chú |
|---|---|---|
| Khoảng thời gian LAB-5 | 2026-11-26 16:22 → 2026-11-27 17:45 JST | |
| Thời gian AI chạy thực (wall-clock) | khoảng 8,8 giờ | Chưa tính phần lớn thời gian chờ script ghi GitHub chạy nền (giãn 7,5–15 giây / lần, có lúc kéo vài giờ): log không có hoạt động trong lúc đó nên bị loại |
| Tổng thời gian chạy của agent | khoảng 22,1 agent-giờ, 18 subagent | Lớn hơn wall-clock vì chạy song song: 3 luồng break, 5 worker chấm SWP, 2 PL cùng lúc ở P3 / P4 |
| Thời gian người review | `<giờ review của người dùng>` | Chốt điểm mẫu, quyết định ở Gate A / B và P4 |

## 3. Tự đánh giá

### 3.1 Chỗ tin là hiệu quả

- **Một nguồn, nhiều đầu ra, đều kiểm bằng máy.** `backlog.yaml` sinh issue, bảng trong task-breakdown / estimate và Project; payload trong HTML sinh Point / Hours; nhật ký CSV sinh burndown và Status. Số trong file nộp và trên Project không lệch nhau (đọc lại 510 / 510).
- **Expert chặn trước khi đẩy.** 7 Major của Gate A đều đổi cấu trúc item; sửa trong yaml rẻ hơn nhiều so với sửa 500 issue trên GitHub.
- **Người chỉ chốt chỗ cần người:** điểm mẫu SWP, độ hạt, phạm vi sprint, ngoại lệ. Phần đọc và đếm lại do Expert làm.
- **Script chạy lại được** nên chịu được máy tắt giữa chừng và giới hạn tốc độ của GitHub (đẩy 499 issue qua hai ngày, không trùng issue nào).
- **Che giờ khi chấm** làm SWP độc lập với giờ sơ bộ, nên so SWP × k với giờ sơ bộ / LAB-1 mới có nghĩa.

### 3.2 Chỗ chưa tốt và cách làm khi làm thật

- **Worker chấm SWP chưa đúng hợp đồng của skill** (đọc file thay vì nhận inline). Làm thật: truyền lô inline, chỉ che giờ và người phụ trách, giữ mục phụ thuộc.
- **Một k chung lệch theo loại việc** (issue thô −64%, thiết kế −35%, test +47% so với giờ sơ bộ); tổng giờ thấp hơn LAB-1 71%, còn khoảng 1.050 giờ chưa giải thích bằng số. Làm thật: hiệu chỉnh k bằng giờ thật sau 1–2 sprint, không dùng Hours thay số hợp đồng.
- **Đổi quy ước giữa chừng tốn kém:** đổi tiêu đề sang tiếng Anh khi đã tạo 285 issue, thêm một lượt đổi tên. Làm thật: chốt quy ước tiêu đề, nhãn, trường trên 1 epic mẫu trước khi tạo hàng loạt.
- **Expert đọc mẫu, không đọc hết 510 issue**; máy kiểm được cấu trúc, chưa kiểm được nội dung DoD từng issue có đúng nghiệp vụ không.
- **Khách vẫn là AI đóng vai**; sprint là giả lập nên burndown chỉ kiểm được cách lập kế hoạch, không kiểm được tốc độ thật.
- **Chưa có ý tưởng tốt** cho việc kiểm k khi chưa có giờ thật của đội: hiện chỉ đối chiếu chéo với giờ sơ bộ và LAB-1, hai nguồn đều là ước lượng.
