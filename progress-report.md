# Báo cáo tiến độ — Iteration 1 (giả lập)

| Mục | Nội dung |
|---|---|
| Iteration trên Project | **Iteration 1** — trường Iteration của [GitHub Project 1](https://github.com/users/phuongnnm-23344/projects/1) (= S1 trong WBS LAB-1) |
| Khoảng thời gian giả lập | **2027-02-01 (thứ Hai) → 2027-02-12 (thứ Sáu)**, 10 ngày làm; số chốt cuối ngày 2027-02-12 |
| Phạm vi S1 | Quản lý tư cách người tham gia (許可 của 仲卸 và 承認 của 売買参加者 là hai bản ghi riêng), đăng nhập và đổi người trên PC dùng chung, nhật ký thao tác. 相対取引 là luồng chính, làm ở S3; S1 dựng phần kiểm tư cách mà 相対 sẽ dùng (BR-PERM-01) |
| Bản tiếng Nhật gửi khách | [`ja/progress-report.md`](ja/progress-report.md) — cùng nội dung; bản JA bỏ phần "Ghi chú nội bộ" |

> **Toàn bộ tiến độ trong báo cáo này là giả lập** (bài luyện tập LAB-5): dự án chưa chạy thật, không dùng dữ liệu thật của khách. Mọi sự kiện phía chợ (câu hỏi, nội dung file, thời điểm trả lời) là kịch bản giả lập, không phải điều chợ đã xác nhận; trong nhật ký gắn nhãn `[Giả lập]`. Số issue và khối lượng là số thật trên GitHub Project.

**Tóm tắt**

- Xong **71%** khối lượng S1 (20 / 26 issue). 6 issue còn lại làm đầu S2.
- Đã xong **đổi người bằng PIN trên PC dùng chung** và **màn tra tư cách người mua (仲卸・売買参加者) chỉ bằng bàn phím**.
- Chưa xong: nhánh 却下 đơn xin 承認 và màn 一時停止. Lý do chính: một câu hỏi về thủ tục nghiệp vụ (#24) đang chờ trả lời, và chưa có bộ component dùng chung nên mỗi màn tự dựng ô nhập.
- **Ngày bắt đầu S3 (相対取引) 03-01 giữ nguyên.** S2 làm phần mang sang trước, đổi lại đề xuất dời một số chức năng của S2 sang S4–S5 (mục 3, R-01).

**Việc đề nghị phía chợ cân nhắc (tất cả là đề xuất của Sun*)**

| Việc | Hạn đề xuất | Phụ trách (giả định) |
|---|---|---|
| Trả lời câu hỏi #24 (có cho 弁明 trước khi 却下 đơn xin 承認 không) | 02-17 nếu 照合部門長 quyết; 02-19 nếu cần 経営陣 | 照合部門長 |
| Sửa mã người tham gia khác định dạng trong actors.csv | 02-19 (chỉ actors.csv; 6 file còn lại theo lịch cũ) | IT của chợ |
| Cách xử lý dòng không có 失効日 (đề xuất nhập ở trạng thái 「要確認」) và tra 失効日 | 02-26 | 照合事務局, 照合部門長 |
| Quyết định rollback quy chế khi đã đủ 4 lần / năm (E-14) | 02-16 (経営会議) | 経営陣 |
| 4 câu hỏi cho 経理部 | 03-05 | 照合部門長, 経理部 |
| Chốt model tablet dùng ở bến | 02-26 | IT, 運用部門 |

## 1. Trạng thái cuối sprint

### 1.1 Điều kiện dùng thử S1 (đề xuất của Sun*)

| Điều kiện | Kết quả | Issue |
|---|---|---|
| AC-S1-1 Thao tác bằng danh sách người tham gia đã che của chợ (actors.csv đợt 1), không dùng dữ liệu bịa | **Một phần** — nạp các dòng hợp lệ; dòng thiếu 失効日 tạm loại, việc gửi ở đợt 2 **đang trao đổi** | #300, câu hỏi #63 |
| AC-S1-2 照合事務局 đăng ký trên màn 許可 cho 仲卸 và 承認 cho 売買参加者 (有効日 / 失効日 riêng), đặt 一時停止 | **Một phần** — 許可: đăng ký + 決裁 xong; 承認: đăng ký đơn + 確認 chạy được, 却下 chờ #24; màn 一時停止 chưa xong | Done #225, #263, #227, #306 · còn #264, #307, #425, #427, #428 |
| AC-S1-3 取引担当 gõ mã người mua (仲卸・売買参加者) chỉ bằng bàn phím → thấy hiệu lực, căn cứ 許可 / 承認, ngày hết hạn | **Đạt** | #151, #357, #358 |
| AC-S1-4 Hai người đổi nhau bằng PIN trên PC dùng chung trong vài giây; nhật ký ghi đúng người | **Đạt** | #333, #384, #289, #423, #471, #484 |

Chú thích: 許可 và 承認 dùng hai chữ khác nhau vì thủ tục thiết kế khác nhau. 許可 (仲卸): 照合部門長 審査 + 起案, 運用部門長 **決裁**. 承認 (売買参加者): 照合事務局 nhập 届出, 照合部門長 **確認**, một bước. Đây là giả định tạm của Sun* (liên quan câu hỏi #24); khác cách làm của chợ thì xin chợ chỉ ra.

### 1.2 Phần đã định làm ở S2 (không phải trễ)

- Xác thực bổ sung (MFA) cho thao tác 決裁 / 確認: S1 chạy bằng cơ chế thử, cơ chế thật làm ở S2 (#114, #387). Danh sách thao tác cần xác thực bổ sung không đổi.
- Khối 許可 / 承認 trên màn chi tiết người tham gia SC-01-02 (#304, #305) và lỗi / khóa tài khoản / hết phiên của màn đăng nhập (#424) làm ở S2. S1 vào màn đăng ký 許可 / 承認 từ menu + mã người tham gia.
- 保証金 / 参加上限 làm cùng 相対 ở S3; email báo trước 30 ngày khi sắp 失効 làm trước UAT.

### 1.3 Trạng thái issue (đếm từ Project)

Đơn vị đếm là **lá** (issue không có sub-issue). Khối lượng tính bằng SWP (1 SWP ≈ 2 giờ). Issue cha #302 (con #357, #358) không đếm thêm để không cộng hai lần.

| Trạng thái | Số issue | Tổng SWP | Ghi chú |
|---|---|---|---|
| Xong (Done) | 20 | 80 | #22, #88, #89, #151, #224, #225, #227, #255, #256, #263, #286, #289, #306, #333, #357, #358, #384, #423, #471, #484 |
| Đang review nội bộ (In Review) | 2 | 6 | #300 nạp danh sách người tham gia đợt 1 — dòng hợp lệ đã lên môi trường kiểm thử, danh sách dòng bị loại đang trao đổi với IT của chợ · #307 màn đăng ký 承認 — 確認 chạy được, 却下 chờ #264 |
| Chờ trả lời (Blocked) | 1 | 5 | #264 確認 / 却下 đơn xin 承認 — 確認 xong; 却下 chờ câu hỏi #24, Sun* không tự chọn thay chợ |
| Đang làm (In Progress) | 2 | 13 | #425 màn 一時停止 — còn bước gửi 決裁 và lưu giờ phút · #427 test chuỗi thủ tục 許可 — đăng ký / 決裁 đã chạy, 一時停止 chờ #425 |
| Chưa bắt đầu (Todo) | 1 | 8 | #428 test chuỗi thủ tục 承認 — case đã viết, chờ #264, #307, #425 |
| **Tổng** | **26** | **112** | |

## 2. Burndown

![Burndown Iteration 1 (giả lập)](progress/iteration-1-burndown.png)

Còn lại = khối lượng (giờ = SWP × 2) của issue chưa Done cuối ngày.

| Ngày | Kế hoạch (giờ) | Còn lại (giờ) | Còn lại (SWP) | Lệch (giờ) | Done trong ngày |
|---|---|---|---|---|---|
| 1 · 02-01 | 201,6 | 224 | 112 | +22,4 | — |
| 2 · 02-02 | 179,2 | 212 | 106 | +32,8 | #22, #423 |
| 3 · 02-03 | 156,8 | 190 | 95 | +33,2 | #255, #256 |
| 4 · 02-04 | 134,4 | 180 | 90 | +45,6 | #88 |
| 5 · 02-05 | 112,0 | 148 | 74 | +36,0 | #89, #225, #358, #471 |
| 6 · 02-08 | 89,6 | 132 | 66 | +42,4 | #151, #286 |
| 7 · 02-09 | 67,2 | 116 | 58 | +48,8 | #227, #357 |
| 8 · 02-10 | 44,8 | 82 | 41 | +37,2 | #224, #263, #289, #333 |
| 9 · 02-11 | 22,4 | 66 | 33 | +43,6 | #306, #384 |
| 10 · 02-12 | 0 | 64 | 32 | +64,0 | #484 |

**Lệch kế hoạch ở đâu:**

1. **Đầu sprint chậm do việc phải chờ nhau, không do ước lượng.** Phần đăng nhập là 4 issue nối tiếp (bảng người dùng #255 → đăng nhập #286 → đăng ký thiết bị #333 → đổi người bằng PIN #384), cộng 40 giờ = cả sprint của một người. Phần người tham gia cũng vậy: #22 → #88 / #89 → #151 → #224. Issue chỉ tính Done sau review nội bộ, nên hai ngày đầu gần như phẳng.
2. **Ba điểm phải hỏi lại (giả lập):** (a) cần xác nhận thời hạn phiên đăng nhập của thiết bị dùng chung trong thiết kế → #333 dừng 02-05 → 02-08, thiết kế không đổi; (b) actors.csv đợt 1 có dòng 承認 thiếu 失効日 và mã khác định dạng → #300 dừng 02-04 → 02-10; (c) câu hỏi #24 về 弁明 → #264 dừng từ 02-10 (02-11 là ngày lễ ở Nhật).
3. **Chưa có component dùng chung.** Bộ component (#500) còn là issue thô. Mỗi màn tự dựng ô ngày / ô giờ phút: #306 vượt 2 giờ, #425 chưa xong. Đội dùng năng lực dư làm trước 10 giờ component dùng chung (ngoài cam kết).
4. **Test dồn cuối.** #427 / #428 cần cả chức năng lẫn màn xong trước, nên từ S2 tách test theo màn để chạy sớm. Phân việc trong đội bị lệch, S2 chia lại (R-06).
5. **Ước lượng.** 20 issue Done: ước 160 giờ, làm 169 giờ (+5,6%, giả lập) → giữ hệ số quy đổi.

## 3. Rủi ro trễ

Mốc: S2 = 2027-02-15 → 02-26 · S3 (相対取引) = 03-01 → 03-12 · điểm kiểm số 完納奨励金 cuối S4 = 03-26 · S7 = 04-26 → 05-07. "Ai làm" là vai giả định; mọi hạn của phía chợ là **đề xuất** của Sun*.

| # | Rủi ro | Issue | Ảnh hưởng tới mốc nào | Hành động | Ai làm, khi nào |
|---|---|---|---|---|---|
| R-01 | 6 issue chưa xong (64 giờ) dồn sang S2 | #264, #300, #307, #425, #427, #428 | Demo S2 (02-26). 相対 dùng kiểm tư cách nên 一時停止 (#425) và job 失効 tự động phải xong trước S3 | Làm 6 issue này đầu S2, dời ra sau cùng khối lượng (~66 giờ): gia hạn / kiểm đủ trường 許可・承認 (#362, #363), 再審査・早期更新・復帰 (#426), thời hạn phiên theo loại thiết bị (#446), màn quản lý tài khoản / 代行 (#469), đính kèm dùng chung (#290) → S4; báo trước 30 ngày khi sắp 失効 (#155), nhật ký thao tác bất thường (#338) → S5 (trước UAT). Giữ các chức năng chính của S2 (tiếp nhận lô, 目利き, version quy chế, lịch, nền offline); **không dời 相対** | PL + BrSE-1, chốt ở buổi lập kế hoạch S2 02-15 |
| R-02 | Câu hỏi có cho 弁明 trước khi 却下 đơn xin 承認 (#24) chưa có trả lời | #24 → #264, #307, #428 | **Không ảnh hưởng ngày bắt đầu S3** (相対 dùng trạng thái 有効 / 一時停止 / 失効; đơn bị 却下 không thành 有効). Trả lời trễ tới giữa S3 thì nghiệm thu FG-01 trễ | Trình bày lại ở demo 02-12 và xin trả lời. Giả định hiện tại (tạm): 却下 do 照合部門長 確認, ghi lý do, báo người nộp đơn; không có bước 弁明 trước khi 却下. Cần 弁明 thì thêm một bước | BrSE-1 02-12; 照合部門長 02-17 (02-19 nếu cần 経営陣) |
| R-03 | actors.csv đợt 1 có dòng thiếu 失効日 / mã khác định dạng; S1 chỉ dùng dòng hợp lệ | #300, #63 | Demo S2; chuẩn bị chuyển đổi dữ liệu | (1) Mã khác định dạng sửa theo bảng đối chiếu (chỉ actors.csv, 02-19; 6 file còn lại theo lịch cũ). (2) Dòng thiếu 失効日: 照合事務局 tra sổ giấy (02-26). (3) Đề xuất nhập các dòng này ở trạng thái 「要確認」, không dùng cho giao dịch tới khi điền 失効日 — chợ quyết. Giữ báo cáo dòng bị loại trong công cụ nạp, dùng lại khi chuyển dữ liệu thật | IT của chợ 02-19; 照合事務局 02-26; BE-6 nạp lại trong 1 ngày sau khi nhận |
| R-04 | Xác thực bổ sung (MFA) thật trễ thì chưa nghiệm thu được 決裁 / 確認 | #114, #387, #263, #264 | Demo S2 | Nói rõ ở demo S1 là cơ chế thử (danh sách thao tác cần xác thực không đổi); cơ chế thật là việc đầu S2 | PL demo 02-12; BE 02-15 → 02-19 |
| R-05 | Chưa có component dùng chung → mỗi màn dựng lại | #500, #306, #425 | Demo S2 (màn tablet ở bến); màn 相対 ở S3 | Buổi lập kế hoạch S2 tách từ #500 các lá component cơ bản (gồm phần đã làm trước ở S1), làm trước các màn | FE-1 + PL, 02-15 |
| R-06 | Phân việc trong đội lệch, test dồn cuối | Iteration 2 | S2, S3 | Từ S2 chia việc theo khối lượng issue (Hours trên Project); test tách theo màn; giữ 30% năng lực QA cho kiểm hoàn thành từng issue; xem lại hệ số sau S2 bằng giờ thật | PL, 02-15 |
| R-07 | Thiết kế 第4波 dồn 23 issue (311 giờ sơ bộ) trong 02-19 → 03-05, song song S2; rút người làm thiết kế thì S2 giảm năng lực | 23 issue mốc 設計第4波 | G2 (03-05) → spec cho S4 trở đi; S2 | Từ 02-15 dành riêng BrSE-1 + 1 BE + 1 FE cho thiết kế. Năng lực dev / QA S2 còn khoảng 500 giờ (WBS: S2 ≈ 70% sprint thường, thêm ~4 người; trừ 2 người làm thiết kế); 64 giờ mang sang làm trước, dời ~66 giờ theo R-01 để giữ chức năng chính S2. Review với chợ tuần 02-22 và 03-01, mỗi lần 13:00–14:30 (≤ 90 phút, tránh 02-23 ngày lễ, gửi tài liệu trước 2 ngày làm) | PL, từ 02-15 |
| R-08 | Rollback quy chế khi đã đủ 4 lần / năm (E-14): hạn gốc 01-15 (workshop) chưa chốt (giả lập), phải dời hạn | #36 | S2 (version quy chế) | Đề xuất quyết ở 経営会議 02-16; tới lúc đó 1–2 ngày đầu S2 làm theo cách dùng được cho cả hai nhánh đã thiết kế | 経営陣, 02-16 |
| R-09 | Câu trả lời của 経理部 (E-02 cột 請求番号 / 対象年月 trong CSV 入金, E-06 thuế, Q-INC-01, Q-INC-02) chậm; tháng 4–5 là mùa quyết toán | #37, #43, #41, #42 | Điểm kiểm số 完納奨励金 (#121, 03-26); S6–S7 | Sun* gửi danh sách câu còn chờ mỗi thứ Hai. Câu quá hạn: **chợ chọn và xác nhận bằng văn bản** có theo giả định tạm hay không (照合部門長; phần thuế 経理部 xác nhận) | BrSE-1 mỗi thứ Hai; 照合部門長 + 経理部 03-05 |
| R-10 | Thiết bị ở bến (E-05) chưa chọn, S2 làm màn tiếp nhận trên tablet | #61 | Demo S2 tại hiện trường | (1) Sun* gửi cấu hình tối thiểu (hệ điều hành, kích thước màn) trước 02-19. (2) Với giả định mượn được 1–2 tablet chợ đang có, IT của chợ xem máy nào dùng được (trước demo S2). (3) Chốt model là việc riêng, 02-26 | Sun* 02-19; IT của chợ trước demo S2; IT + 運用部門 02-26 |
| R-11 | S7 (完納奨励金) trùng Golden Week; 経理部 bận quyết toán | EP-FG09 #12 | Demo S7, UAT | Giữ lịch 経理部 cho S6–S7 ngay từ bây giờ; đề xuất demo S7 ngày 05-07, 13:00–14:30 | 照合部門長 + 経理部 (báo 経営陣), trước 03-31 |
| R-12 | 18 lá đã có spec nhưng > 16 giờ; gần nhất là #432 thuộc 相対 | #432 và 17 lá nhãn `needs-split` | S3 (相対) | Tách và chấm lại #432 trong S2; các lá khác tách trước buổi lập kế hoạch của sprint chứa chúng | PL, #432 trước 02-26 |
| R-13 | Nghỉ Tết Nguyên đán của đội offshore (mùng 1 Tết 2027 = 02-06) nằm trong S1; WBS LAB-1 chưa trừ ngày nghỉ này nên năng lực S1 thật thấp hơn số giả lập trong báo cáo | Iteration 1, 2 | Demo S1, S2, S3 | Chốt lịch nghỉ trước buổi lập kế hoạch S1; chọn (a) dời lịch S1–S2 theo số ngày nghỉ, hoặc (b) thêm người trước / sau Tết; ưu tiên phương án giữ ngày bắt đầu S3. Số giả lập trong báo cáo giữ nguyên | PL, trước buổi lập kế hoạch S1 (01-29) |

## Phụ lục: nguồn số

- Trạng thái và SWP: đọc Status / Point trên Project 1 bằng [`backlog/scripts/set-iteration-status-on-project.py`](backlog/scripts/set-iteration-status-on-project.py) (đọc lại 27 / 27 item Iteration 1 khớp).
- Burndown: sinh từ nhật ký giả lập [`progress/iteration-1-daily.csv`](progress/iteration-1-daily.csv) bằng [`backlog/scripts/render-iteration-burndown.py`](backlog/scripts/render-iteration-burndown.py); bảng [`progress/iteration-1-burndown.csv`](progress/iteration-1-burndown.csv). Nhật ký được kiểm (ngày làm, chuyển trạng thái, Done sau phụ thuộc) bằng [`backlog/scripts/iteration-daily-log.py`](backlog/scripts/iteration-daily-log.py).

## Ghi chú nội bộ (không có trong bản gửi khách)

- Truy vết: phạm vi / năng lực S1 — PREMISE L5-D10; S0 / 第1波 / actors.csv — L5-A18; giữ 30% QA — L5-D12; thứ tự cắt — L5-D11; `needs-split` — L5-D08. Hai điểm phải nói với khách (MFA khóa test, phần dời S2) theo Expert Gate A Q-02 / Q-03; tải 第4波 theo Gate A N-04 (FB-EXP-344). Rủi ro phía chợ lấy từ `customer-feedback-lab5-priority-261126.md` câu 6 và `customer-feedback-lab5-progress-report-261127.md` [Customer giả lập, 2026-11-26 / 27]. R-13 (Tết) theo quyết định người dùng 2026-11-27.
- Theo người (Hours trên Project / giờ làm giả lập): BE-1 32 / 34,5 · BE-2 36 / 38,5 · BE-3 34 / 34,5 · BE-6 44 / 45 · FE-1 16 / 27 (10 giờ component) · FE-4 28 / 29,5 · QA-1 34 / 26 + 12 giữ chỗ. Nguyên nhân lệch: P1 chia người theo giờ sơ bộ (254), Project dùng Hours (224). Bỏ khỏi bản gửi khách theo góp ý khách #12.
- Năng lực S2 "~500 giờ": giả định đội S1 (BE 4, FE 2, QA 1) + 4 người theo WBS §5 = 11 người × 80 giờ × 70% ≈ 616 giờ, trừ 2 người làm thiết kế (112 giờ). Danh sách dời ở R-01 là đề xuất, Iteration 2 trên Project chưa gán.
- Đề xuất trạng thái 「要確認」 (R-03) chưa có trong spec PARTY_DB; nếu chợ chọn thì phải sửa spec + thêm issue (ước nhỏ, BE + FE).
- 決裁 / 確認: chú thích 1.1 theo PTY_PERMIT / PTY_APPROVAL_LIFECYCLE_TECH. Customer giả lập nói cả hai đều qua 決裁 của 照合部門長 → khác thiết kế, gộp vào câu hỏi #24 (OPEN-DB-09), chưa sửa spec.
- Issue Done **không đóng** trên GitHub (sprint là năm 2027, đóng bây giờ thì ngày đóng là 2026). Việc ngoài cam kết (10 giờ component) chưa tạo issue — đề xuất tách lá từ #500 ở S2 (R-05).
