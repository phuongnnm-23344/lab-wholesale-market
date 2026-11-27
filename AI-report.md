# Báo cáo cách dùng AI trong LAB-5

Trong LAB-5, AI làm gần hết phần việc: chia backlog (510 item trên GitHub Project), chấm điểm, quy ra giờ, chạy một sprint giả lập và viết các file nộp. Người làm bài giữ ba việc: giao việc, chốt điểm của các issue mẫu, và ra quyết định ở mỗi vòng duyệt.

Cách tổ chức giống LAB-4 ([`lab-4/AI-report.md`](lab-4/AI-report.md)). Có ba vai AI tách riêng: **Project Leader (PL)** làm ra sản phẩm, **Expert** duyệt, **khách giả lập** đọc từ phía chợ và góp ý. Phiên chat chính chỉ chuyển việc giữa các vai, không tự làm thay vai nào.

Bằng chứng (các bản duyệt của Expert, góp ý của khách giả lập, sổ theo dõi góp ý, lời giao việc) nằm ở [`AI-report-evidence/lab-5/`](AI-report-evidence/lab-5/README.md).

Hai từ dùng nhiều trong báo cáo:

- **SWP** (Standard Work Point): điểm khối lượng của một task, chấm theo hai trục là phạm vi và độ phức tạp. Giờ được suy ra từ điểm này.
- **Gate**: một vòng Expert duyệt. Expert kết luận cho qua (RELEASE), cho qua nếu sửa một số điểm (RELEASE CÓ ĐIỀU KIỆN) hoặc chưa cho qua.

## 1. Dùng skill gì, giao việc cho AI thế nào

Mỗi việc lớn có một lời giao việc viết sẵn, kèm một script kiểm lại kết quả bằng máy. Không có số nào chép tay: điểm và giờ trên Project đều sinh từ cùng một nguồn.

**Chia backlog.** Ba agent PL chạy song song, mỗi agent lo một nhóm epic. Trước khi chạy, tôi viết một [lời giao việc chung](AI-report-evidence/lab-5/briefs/p1-shared-brief.md). Nó nói rõ:

- agent nào lo epic nào, đánh mã issue thế nào để không trùng nhau;
- mỗi dòng backlog phải có gì: spec gốc, vai, tiêu chí hoàn thành, phụ thuộc, nhãn, giờ ước sơ bộ;
- 7 luật của đề phải giữ; không chép RFP;
- chỗ chưa có spec thì không tự viết spec thay. Thay vào đó tạo một **issue thô** (giữ chỗ cho cả một màn hay một nhóm API, chưa chia nhỏ) và một issue hỏi lại khách.

Mỗi agent chỉ ghi file của mình. PL gộp lại rồi chạy script kiểm: task quá lớn, nhãn 許可 / 承認, phụ thuộc vòng tròn, đủ 15 bộ số test 完納奨励金, spec nào cũng có issue. Khung chia task theo skill `tkm:pm-create-tasks` và `tkm:ba-analyze-requirement`.

**Đẩy lên GitHub Project.** Agent PL viết script gọi API GitHub. Lời giao việc đòi bốn điều:

- chạy lại bao nhiêu lần cũng không tạo trùng issue;
- tạo issue theo thứ tự phụ thuộc, để thân issue ghi được ngay số của issue nó phụ thuộc;
- chạy thử với 1 epic và vài issue trước khi chạy hết;
- giãn nhịp 7,5–15 giây mỗi lần gọi, để không chạm giới hạn của GitHub.

**Chấm SWP.** Dùng skill `tkm:sun-estimate` ở phiên chính và 5 agent phụ chạy song song. Mỗi agent phụ chấm một lô khoảng 80 issue. Trước khi đưa cho agent phụ, tôi che trong thân issue: giờ ước sơ bộ, người phụ trách, mã RFP và danh sách phụ thuộc. Mục đích là để điểm phản ánh bản thân công việc, không bị kéo theo con số giờ có sẵn.

Skill chọn 5 issue mẫu (thấp nhất, giữa, cao nhất, lệch nhất, kém chắc nhất). Người làm bài chốt từng mẫu qua 2 vòng (mức, rồi điểm); skill chỉnh các issue cùng loại theo mẫu và xuất báo cáo HTML vào [`reports/`](reports/). Tổng cả LAB-5 có 3 đợt chốt mẫu (5, 5 và 2 issue), cộng 1 issue chấm đối chiếu.

**Quy ra giờ.** Một quy tắc duy nhất: giờ = SWP × 2,0, cùng một hệ số cho mọi issue. Muốn đổi giờ của issue nào thì phải đổi điểm của nó, và đổi điểm phải có người chốt. Hệ số 2,0 lấy từ hai trung vị giờ trên điểm: 1,75 ở các issue mẫu và 2,07 ở 304 task đã có spec. Kết quả: 1.739 SWP, tức 3.478 giờ.

**Ghi điểm và giờ lên Project.** Việc này do chính agent PL chạy script, không phải một agent riêng như kế hoạch ban đầu. Script chỉ đọc một nguồn là dữ liệu điểm nằm sẵn trong báo cáo HTML của skill. Nó ghi vào hai trường Point và Hours trên Project, rồi đọc lại toàn bộ để so: 510 / 510 khớp. Expert cũng tự đếm lại riêng và không thấy lệch.

**Báo cáo tiến độ.** Agent PL viết trước một nhật ký giả lập theo từng ngày của sprint. Script kiểm nhật ký: chỉ ghi vào ngày làm việc, trạng thái chuyển hợp lệ, không có task xong trước task nó phụ thuộc. Từ nhật ký đó mới vẽ biểu đồ burndown (lượng việc còn lại theo ngày) và đặt trạng thái lên Project. Bản tiếng Nhật gửi khách do PL viết trực tiếp; khách giả lập đọc bản đó như khách thật.

**Chỗ chạy khác cách skill quy định.** Kết quả không sai, nhưng cần nói rõ:

- Theo skill, agent phụ không được dùng công cụ, chỉ nhận dữ liệu dán thẳng vào lời giao việc. Ở đây agent phụ được tự đọc file và ghi file. Lời dặn "chỉ đọc 3 file" không chặn được việc nó mở file backlog có giờ sơ bộ. Không thấy dấu hiệu điểm bị kéo theo giờ (so với giờ sơ bộ, task test cao hơn 45%, issue thô thấp hơn 72% — xem [`estimate.md`](estimate.md) §2.2), nhưng đó là nhờ may, không phải nhờ kiểm soát.
- Che cả danh sách phụ thuộc và mã RFP thì task nối nhiều phần có thể bị chấm thấp; chốt mẫu chỉ bù được một phần.
- Ba lần chấm lại nhỏ chấm ngay ở phiên chính, không qua agent phụ.
- Skill chỉ tự chỉnh điểm trong cùng một lần chấm. Việc mang quy tắc của lần trước sang lần sau là người làm bài tự quyết (ghi ở [`estimate.md`](estimate.md) §1.3).

## 2. Duyệt output của AI

Mỗi giai đoạn qua một vòng Expert duyệt, hai chỗ có thêm khách giả lập đọc. Người làm bài chỉ chốt chỗ cần người quyết.

### 2.1 Các vòng duyệt

| Vòng | Duyệt gì | Kết luận | Lỗi tìm thấy | Xử lý |
|---|---|---|---|---|
| Khách — thứ tự ưu tiên | Epic nào làm trước, sprint đầu làm gì | — | 7 góp ý | Đưa vào thứ tự ưu tiên và phạm vi sprint đầu |
| **Gate A** (chia xong, chưa đẩy lên Project) | Backlog, bảng chia task, các giả định | RELEASE CÓ ĐIỀU KIỆN → duyệt lại: RELEASE CÓ ĐIỀU KIỆN → **RELEASE** | 0 nghiêm trọng · 7 lớn · 7 nhỏ; vòng 2 thêm 1 lớn; vòng 3 thêm 3 nhỏ | Sửa hết trong file backlog **trước** khi đẩy, vì sửa sau khi đã có 500 issue tốn gấp đôi; sửa luôn 4 chỗ trong spec LAB-4 |
| **Gate B** (chấm điểm và quy giờ xong) | Bảng estimate, báo cáo HTML, điểm và giờ trên Project, so với LAB-1 | RELEASE CÓ ĐIỀU KIỆN → duyệt lại: **RELEASE** | 0 nghiêm trọng · 2 lớn · 7 nhỏ; vòng 2 thêm 2 nhỏ | Chia nhỏ 4 task 完納奨励金, thêm 2 issue thô, chấm lại 3 lần |
| Khách — báo cáo tiến độ | Bản tiếng Nhật | Cần sửa nhỏ | 12 góp ý | Sửa hết, kể cả phần "muốn có" |
| **Gate C** (cả gói nộp, trước khi public) | 6 file ở gốc repo, bản tiếng Nhật, báo cáo HTML, Project, lịch sử git | RELEASE CÓ ĐIỀU KIỆN → duyệt lại: nội dung **RELEASE** | 0 nghiêm trọng · 5 lớn · 7 nhỏ; vòng duyệt lại thêm 1 lớn · 1 nhỏ | Xem các ý ngay dưới bảng |

Sau Gate C: người làm bài tạo 3 view trên Project (Backlog, Iteration 1, 完納奨励金); tài liệu ghi đúng việc 21 issue đã xong bị workflow tự đóng của GitHub đóng trong lúc chạy giả lập; bản LAB-5 lên nhánh chính rồi mới public. Lịch sử git được làm sạch bằng `git filter-repo` (gỡ nội dung nội bộ và mật khẩu / PIN demo cũ), nên mọi mã commit đều đổi, kể cả bản LAB-2, LAB-4 đã nộp. Còn một việc người làm bài tự làm: gửi GitHub Support yêu cầu xóa bản lưu tạm (cache) của commit cũ; repo đã public, không chờ kết quả.

Expert còn tự đếm lại bằng máy: số item, tổng điểm và giờ theo epic, điểm trong HTML so với Project, và quét khóa bí mật, email, đường dẫn máy.

### 2.2 Người làm bài quyết những gì

Danh sách đầy đủ ở kế hoạch LAB-5 và trong [`PREMISE.md`](PREMISE.md). Các quyết định chính:

- **Đầu LAB-5:** dùng chung repo với LAB-4; chạy một sprint giả lập theo lịch kế hoạch của LAB-1; quy giờ bằng một hệ số duy nhất; chia epic theo nhóm chức năng của LAB-1; repo và Project để public.
- **Gate A:** việc đã có spec thì mỗi task không quá 16 giờ, task nào lớn hơn thì chia nhỏ. Việc chưa có spec thì giữ cả cụm (một màn, một nhóm API) và chỉ chia ngay trước sprint làm nó — cách lập kế hoạch dần dần này gọi là rolling-wave. Spec đăng nhập và phân quyền viết xong trước sprint đầu.
- **Giữa lúc đẩy Project:** đổi tiêu đề issue sang tiếng Anh theo một mẫu thống nhất. 285 issue đã tạo phải đổi tên lại.
- **Chốt điểm:** 3 đợt chốt issue mẫu, cộng 1 issue chấm đối chiếu.
- **Gate B:** cho phép một số task vượt 16 giờ nhưng phải có tên và nhãn "cần chia" riêng; chia nhỏ 4 task 完納奨励金; áp quy tắc chấm của lần trước sang lần chấm sau.
- **Sprint:** ghi rủi ro nghỉ Tết (Tết 2027 rơi giữa sprint, lịch gốc chưa trừ) nhưng giữ nguyên số giả lập.
- **Gate C:** giữ 21 issue đã bị đóng; làm sạch lịch sử git, không công bố mã commit cũ; chấp nhận tên repo nội bộ còn trong lịch sử cũ.

### 2.3 Lỗi đáng học của AI

1. **Chia nhỏ màn hình chưa có spec cho trông chi tiết.** AI lấy giờ của LAB-1 rồi chia đều thành "phần 1/2, phần 2/2". Expert ở Gate A chỉ ra đây là chi tiết giả, vì chưa có spec thì không ai biết chia ở đâu. Sửa: giữ nguyên cụm việc, viết spec thành một issue thiết kế có giờ thật. Bài học: chưa có spec thì đừng chia cho đẹp.
2. **Ưu tiên ngược với phụ thuộc.** 24 cặp có issue ưu tiên cao phải chờ issue ưu tiên thấp nhất. Expert ở Gate A bắt được. Sửa: nâng ưu tiên theo chuỗi phụ thuộc (58 issue), script kiểm còn 0 cặp ngược. Bài học: ưu tiên phải đi theo phụ thuộc.
3. **Sprint đầu nhận quá sức, không ghi năng lực bằng số** (có người bị giao 158 giờ trong 2 tuần). Expert ở Gate A bắt được. Sửa: năng lực đội 360 giờ, chỉ nhận 254 giờ, mỗi người không quá 40 giờ một tuần. Bài học: kế hoạch sprint phải có con số năng lực.
4. **Tự đặt giả định đụng tới tiền của người mua.** Giả định đó quyết định người mua có được thưởng 完納 (thưởng thanh toán đúng hạn) hay không, nhưng AI không hỏi ai. Expert ở Gate A bắt được. Sửa: chuyển thành câu hỏi cho khách, tạm giữ giả định và ghi rõ ảnh hưởng nếu nó sai. Bài học: giả định nào chạm tới tiền thì phải hỏi, không tự chốt.
5. **Vi phạm chính giới hạn 16 giờ mình đặt.** Sau khi quy giờ có 22 task vượt 16 giờ; backlog còn thiếu việc làm bộ giao diện dùng chung và sửa lỗi sau nghiệm thu (AI chỉ ghi vào rủi ro). Expert ở Gate B bắt được. Sửa: chia nhỏ 4 task 完納, 18 task còn lại là ngoại lệ có nhãn "cần chia" (người làm bài cho phép), thêm 2 issue thô #500, #501. Bài học: có số tổng rồi phải kiểm lại quy tắc đặt từ đầu.
6. **Bản tiếng Nhật gửi khách viết như thể khách đã đồng ý.** Có câu ngụ ý chợ đã duyệt thiết kế, và một cụm từ dễ hiểu nhầm giữa 許可 (giấy phép) với 承認 (chấp thuận) — sát luật bắt buộc của đề. Khách giả lập bắt được, Expert thì không. Sửa: viết lại thành đề xuất, chú thích rõ hai loại thủ tục. Bài học: bản gửi khách cần một người đọc từ phía khách.
7. **Tài liệu khác trạng thái thật trên Project.** Tài liệu ghi "không đóng issue", nhưng workflow tự đóng của GitHub còn bật nên 21 issue đã bị đóng. Expert ở Gate C bắt được khi đọc Project qua API. Sửa: ghi đúng sự thật, tắt workflow. Bài học: chạy script xong phải đọc lại trạng thái thật.

### 2.4 Thời gian AI chạy và thời gian người

Đo giống LAB-4: lấy mốc thời gian trong log của phiên chính và các agent phụ, bỏ mọi khoảng nghỉ dài hơn 15 phút không có hoạt động. Thời gian người do người làm bài tự báo.

| Hạng mục | Số đo | Ghi chú |
|---|---|---|
| Khoảng thời gian | 2026-11-26 16:22 → 2026-11-27 17:45 (giờ Nhật) | Đo tới lúc viết bản đầu của báo cáo này; chưa gồm Gate C và phần sửa sau đó |
| AI chạy thực | khoảng 8,8 giờ | Chưa tính phần lớn thời gian chờ script ghi lên GitHub chạy nền, vì log không ghi hoạt động trong lúc chờ |
| Tổng giờ chạy của các agent | khoảng 22,1 giờ, 18 agent phụ | Lớn hơn giờ thực vì chạy song song: 3 agent chia backlog, 5 agent chấm điểm, 2 PL cùng lúc ở giai đoạn chấm điểm và sprint |
| Người duyệt và quyết | khoảng 2 giờ | Chốt điểm mẫu, quyết định ở Gate A, Gate B và sprint |

## 3. Tự đánh giá

Điểm mạnh nhất là mọi con số sinh từ một nguồn và được kiểm bằng máy, nên người chỉ phải quyết những chỗ thật sự cần người. Điểm yếu nhất là hệ số quy giờ chưa có giờ thật để đối chiếu.

### 3.1 Chỗ làm được

- **Một nguồn, kiểm bằng máy.** File backlog sinh ra issue, các bảng trong tài liệu và Project. Báo cáo HTML sinh ra điểm và giờ. Nhật ký sprint sinh ra burndown và trạng thái. Số trong file nộp và trên Project khớp nhau (đọc lại 510 / 510).
- **Expert chặn trước khi đẩy.** Cả 7 lỗi lớn của Gate A đều đổi cấu trúc backlog. Sửa trong file rẻ hơn nhiều so với sửa 500 issue trên GitHub.
- **Người chỉ quyết chỗ cần người:** điểm mẫu, độ lớn task, phạm vi sprint, ngoại lệ. Khoảng 2 giờ của người cho khoảng 8,8 giờ AI chạy; phần đọc và đếm lại do Expert làm.
- **Script chạy lại được.** Máy tắt giữa chừng hay bị GitHub giới hạn tốc độ cũng không sao: 499 issue đẩy trong hai ngày, không trùng issue nào.
- **Che giờ khi chấm**, nên điểm không phụ thuộc giờ ước sơ bộ. Nhờ vậy so điểm × hệ số với giờ sơ bộ và với LAB-1 mới có nghĩa.

### 3.2 Chỗ chưa tốt, và nếu làm dự án thật

- **Agent phụ chấm điểm chưa đúng cách skill quy định** (tự đọc file thay vì nhận dữ liệu dán sẵn). Làm thật: dán dữ liệu vào lời giao việc, chỉ che giờ và người phụ trách, giữ lại danh sách phụ thuộc.
- **Một hệ số chung lệch theo loại việc:** so với giờ sơ bộ, issue thô thấp hơn 72%, thiết kế thấp hơn 35%, test cao hơn 45%. Tổng giờ thấp hơn LAB-1 71%, còn khoảng 1.050 giờ chưa giải thích được bằng số. Làm thật: chỉnh hệ số bằng giờ thật sau 1–2 sprint, và không dùng giờ trên Project thay cho số trong hợp đồng.
- **Đổi quy ước giữa chừng thì tốn:** đổi tiêu đề sang tiếng Anh khi đã tạo 285 issue. Làm thật: chốt quy ước tiêu đề, nhãn, trường trên một epic mẫu rồi mới tạo hàng loạt.
- **Expert chỉ đọc mẫu, không đọc hết 510 issue.** Máy kiểm được cấu trúc, nhưng chưa kiểm được tiêu chí hoàn thành của từng issue có đúng nghiệp vụ không.
- **Khách vẫn là AI đóng vai, sprint là giả lập**, nên burndown chỉ cho thấy cách lập kế hoạch, không cho thấy tốc độ thật của đội.
- **Chưa có cách tốt để kiểm hệ số quy giờ khi chưa có giờ thật.** Hiện chỉ so chéo với giờ sơ bộ và LAB-1, mà cả hai đều là ước lượng.
- **Làm sạch lịch sử git ở cuối thì tốn:** mã commit của các bản đã nộp đều đổi, phải gửi thêm yêu cầu cho GitHub. Làm thật: rà nội dung nội bộ và mật khẩu trước lần commit đầu tiên.

## Lịch sử thay đổi

| Phiên bản | Ngày | Nội dung |
|---|---|---|
| 0.1.0 | 2026-11-27 | Bản đầu khi đóng gói bài nộp; bổ sung kết quả Gate C |
| 0.2.0 | 2026-11-27 | Viết lại bằng lời thường theo yêu cầu người làm bài: bỏ mã nội bộ, giải thích thuật ngữ, kể lỗi của AI theo trình tự sai → bắt → sửa → bài học; số liệu và kết luận không đổi |
