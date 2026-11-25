# Góp ý của khách hàng (giả lập): bộ wireframe to-be LAB-4

- Người góp ý: 株式会社 桜水産市場 (agent `customer-end-user`), tổng hợp ý kiến 受付担当, 目利き担当, 取引担当 (người chốt 相対 / người xác nhận せり), 配送部門 + 配送部門責任者, 照合部門長, ルール管理者. Ngày: 2026-11-25.
- Đã đọc (repo `lab-wholesale-market`): `wireframes/SCREEN-LIST.md` v0.1.0, `wireframes/_common-layout.md` v0.1.0, 14 wireframe `wireframes/SC-*-wireframe.md`, ảnh as-is `SC-06-02_prototype-tablet.png`; `PREMISE.md` §3.1, §3.2; góp ý cũ của chúng tôi: `customer-feedback-lab2-ui-261123.md`, `customer-feedback-lab4-premise-261125.md`.
- Quy ước nguồn: dẫn ID RFP là điều có trong RFP/quy chế. `[Giả lập]` là RFP để mở, đây là câu trả lời theo vai. "Phải hỏi lại X" là chưa có số liệu.
- Đây là ý kiến làm việc. Nghiệm thu cuối do một người phụ trách nghiệp vụ ký (ACC-GATE-01).

## Nhận xét chung

**Đã đúng ý, xin giữ nguyên:**
- 相対取引 là luồng chính ở mọi chỗ: phím tắt đầu ở ホーム, đứng đầu menu 取引. せり chỉ còn "ghi kết quả" và "xác nhận kết quả", không có màn đấu giá. Đúng chợ chúng tôi.
- Hầu hết góp ý LAB-2 đã vào wireframe: gõ số lô / số người mua, ở lại form sau khi chốt, toast to có nội dung đọc lại cho người mua, bảng 5 GD gần nhất, ngày YYYY/MM/DD, bỏ 「様」.
- 許可 / 承認 ghi đúng chữ ở SC-04-01, SC-05-02, SC-04-05 và tách hai khối ở SC-01-02. Bước nội bộ dùng chữ 「決裁」「確認」, không dùng 「承認」. Đúng điều chúng tôi lo.
- Người quyết cuối rõ ở 目利き (không có hạng mặc định), せり確認, giao có tranh chấp, 修正申請, 日次締め, 期ロック, duyệt quy chế. Không có chỗ nào máy tự chấm.
- Không có nút mở lại ngày đã khóa. Ngày đã khóa có banner vàng nói rõ lý do và dẫn sang 修正申請 (C-24).
- SC-10-04 vẽ đủ hai nhánh N1 / N2 cho rollback sau 4 lần, ghi đúng N2 là ý kiến hiện tại của khách, và không làm thành công tắc cấu hình.
- Danh sách MFA khớp PREMISE §3.2: せり確認, nhập GD, ghi giao thường, in phiếu không hỏi MFA.

---

## 1. Trả lời câu hỏi của PL

### Q-WF-01: Tách SC-06-01 khỏi SC-06-02, ở bến có cần danh sách riêng không?

**配送部門 / 配送部門責任者:** **Đồng ý tách như giả định của PL.** Ở bến, người giao không xem danh sách chung. Người mua đứng trước mặt đọc số, người giao gõ số đó rồi giao. Tablet vào thẳng SC-06-02 có ô tìm là đúng.

SC-06-01 cần cho **PC văn phòng**. Sau 08:00 người mua gọi hỏi "hàng tôi giao chưa", văn phòng phải trả lời ngay mà không gọi xuống bến. Đây chính là KPI-05 (số cuộc gọi xác nhận giao hàng sau 08:00). Không tách thì đổi cách đếm 70 màn, không đáng.

Thêm một điều `[Giả lập]`, mức Muốn có: 配送部門責任者 cầm tablet đi một vòng lúc 09:30 muốn xem nhanh "người mua nào còn hàng chưa lấy". Không cần màn riêng: SC-06-01 mở được trên tablet ở chế độ chỉ đọc (danh sách đã ghi PC/TAB) là đủ.

### Q-WF-02: Tablet: ホーム thành nút lớn thay menu trái

**受付担当 / 配送部門 / 目利き担当:** **Đồng ý** (đúng góp ý LAB-2 #13). Điều kiện `[Giả lập]`:
- Mỗi vai **tối đa 4–6 nút**, thứ tự cố định, không tự đổi chỗ theo tần suất dùng. Người ở bến bấm theo vị trí quen tay.
- Nút có **số đếm** khi có việc chờ: 「仮受付待ち 3」, 「照合が必要 2」, với 配送部門責任者 là 「争いの確認待ち 1」.
- Nút 「ホーム」 to, luôn ở cùng một chỗ. Ký hiệu 「≡」 (C-13) nhỏ và người lớn tuổi không hiểu: ghi chữ 「メニュー」 hoặc 「ホーム」.
- 利用者切替 và tên người đang dùng phải thấy trên mọi màn tablet (đã có C-4, C-5, giữ).

### Q-WF-03: SC-04-04 chỉ hiện 当日訂正 hoặc 修正申請 tùy ngày đã khóa, người chốt có hiểu không?

**取引担当:** **Hiểu được**, vì người chốt đã quen "sổ đã chốt thì phải xin sửa". Hiện đúng một nút theo trạng thái là tốt hơn hiện cả hai rồi để người ta bấm nhầm. Xin thêm:
1. Cạnh nút có **một câu nói lý do**: 「この業務日は締め済のため、修正申請（承認が必要）になります」 / 「未締めのため、その場で訂正できます（照合が確認します）」. Không chỉ đổi chữ trên nút.
2. **Phải có:** người chốt đang nhập dở ở SC-04-05 mà 照合部門長 khóa ngày đúng lúc đó (10:00), bấm 「訂正する」 sẽ nhận lỗi 423. Lúc đó **không được mất nội dung đã gõ**: hiện C-24 và mang sẵn nội dung 訂正後 + lý do sang SC-08-01. Ca này xảy ra thật vào giờ khóa.
3. Hiện 業務日 của GD và nhãn 「締め済」 ngay ở dòng đầu SC-04-04 (C-2 đã có cho header, cần thêm cho chính GD đang xem vì GD có thể thuộc ngày khác với ngày đang mở).

### Q-SC0305-01: 目利き có cần ghi offline không?

**目利き担当 / 受付担当 `[Giả lập]`:** **Không cần ở 第1期.** Đồng ý giả định của PL.
- Lúc mất mạng thì 相対 cũng không chốt được (phải online, L4-A05), cả chợ chuyển sang giấy. 目利き lúc đó ghi giấy như hiện nay (phiếu 下見, ghi trên thùng) là đủ.
- Điều kiện: (a) màn **giữ nguyên** lô đã chọn và hạng đã bấm khi mất mạng, có mạng lại bấm lưu được ngay; (b) để nhập bù nhanh từ giấy, Muốn có ô **「下見時刻」** (giờ ghi trên giấy) khác giờ nhập, giống cách SC-06-05 ghi 「紙で確認 / 入力」.
- Lưu ý cho PL: nếu E-13 chốt "chỉ lô 下見済 mới được bán" thì mất mạng lúc 03:00–04:00 làm chậm cả việc mở bán. Phải hỏi lại 運用部門 cùng lúc với E-13: khi mất mạng, lô chưa ghi 目利き trên hệ thống có được bán bằng giấy không.

### Q-SC0405-01: 当日訂正 chênh tiền lớn có cần người thứ 2 xác nhận không?

**照合部門長 / 取引担当 `[Giả lập]`:** **Không bắt người thứ hai ngay lúc sửa.** Lúc 04:00–06:00 người chốt không có ai bên cạnh để ký, bắt xác nhận thì họ lại ghi giấy. Đồng ý giả định PL (PRM-127), nhưng thêm điều kiện để kiểm toán không bắt:
1. **Nên có:** 当日訂正 / 取消 có chênh lệch **từ ngưỡng 2 cấp trở lên** (dùng lại đúng ngưỡng E-08 trong quy chế, không tạo tham số mới), hoặc **đổi 買受人**, thì ở checklist 日次締め (SC-07-02 [9]) là dòng **✖ chặn**, mỗi dòng phải được 照合事務局 bấm 「確認済」. Dưới ngưỡng thì giữ ⚠ như hiện tại. Như vậy vẫn có người thứ hai, chỉ là trước 10:00 ở văn phòng thay vì ở bàn chốt lúc cao điểm.
2. SC-04-05 hiện câu nhỏ khi vượt ngưỡng: 「この訂正は締め前に照合部門が確認します」, để người chốt biết.
3. Ghi rõ người sửa khác người chốt gốc thì hiện cả hai tên ở SC-04-04 và ở 要確認.

Nếu PL tính cách 1 tốn hơn ~0,2 MM thì báo lại; chúng tôi chấp nhận để mức ⚠ cho 第1期 miễn là có cột "đã soát" ở 要確認.

---

## 2. Bảng góp ý

| # | Màn | Góp ý | Mức ưu tiên | Lý do |
|---|---|---|---|---|
| 1 | SC-07-02 [8] | Máy chưa đồng bộ là dòng ✖. Nếu tablet hỏng, hết pin, rơi xuống nước thì **ngày không bao giờ khóa được**. Cần đường xử lý: 照合部門長 đánh dấu 「端末回収不能」 + lý do + MFA, các bản ghi của máy đó coi như mất và nhập bù từ giấy | Phải có | NFR-AVL-02, BR-CLOSE-01; mục tiêu khóa 10:00 (PRM-030). Ở bến ẩm ướt, máy hỏng là chuyện thật `[Giả lập]` |
| 2 | SC-06-02 [4], offline | Offline tìm trong dữ liệu tải về đầu ngày. GD chốt sau lần tải cuối sẽ không có, người giao tưởng người mua không có hàng. Phải hiện 「取引データ 06:58 時点」 cạnh ô tìm và câu 「この時刻以降の取引は表示されません」 | Phải có | NFR-AVL-02, FR-DEL-01; tránh giao thiếu, gọi điện lại (KPI-05) |
| 3 | SC-08-03 [2] | Ngưỡng 2 cấp đang so với **差額 net** (¥300,000). Đổi 買受人 cùng giá thì net = 0 nhưng tiền dời từ người này sang người khác. Ngưỡng phải tính trên **tiền thay đổi lớn nhất của một người mua** (hoặc tổng trị tuyệt đối), và đổi 買受人 luôn là 2 cấp | Phải có | FR-CORR-02, E-08; cách tính `[Giả lập]` — đây là chỗ kiểm toán sẽ hỏi |
| 4 | SC-06-04 [12] | Ngoại lệ 不足 / 返品 / 一部取消 làm đổi tiền ở ngày **chưa khóa** đang tự sinh REVERSE / DELTA "qua luồng giao", không ai ở 照合 thấy. Phải hiện ở tab 要確認 SC-07-01 và checklist SC-07-02, như 当日訂正 | Phải có | FR-SETTLE-01, OBJ-05 (chênh lệch đối soát ≤ 0,3%) |
| 5 | SC-04-05 / SC-04-04 | Đang nhập 当日訂正 thì ngày bị khóa → lỗi 423 không được mất nội dung; mang sang SC-08-01 (xem Q-WF-03 ý 2) | Phải có | BR-CLOSE-01, OBJ-01 (bớt nhập lại) |
| 6 | SC-09-04 [12] | 「計算して記録（1期1回）」: nếu sau khi ghi mà 入金 CSV có dòng đến muộn hoặc gán sai, trước 期ロック phải **chạy lại được** (bản trước lưu lịch sử). Chỉ 期ロック mới là chốt cuối. Không thì lỗi nhỏ trước khóa cũng phải đi delta kỳ sau | Phải có | BR-INC-01, FR-INC-03; tránh lệch 1 yên |
| 7 | SC-09-04 [4] dòng B11 | 「手数料差引の疑い」 đang tự đánh ✖ 完納. Trong khi 経理 chưa trả lời về phí chuyển khoản, dòng này phải là 「要確認」, 照合部門長 quyết và ghi lý do, không để máy tự kết luận mất thưởng | Phải có | BR-INC-01, CAP-HUMAN-01; phí chuyển khoản **phải hỏi lại 経理部** |
| 8 | SC-06-02 [8] | Ô 今回の数量 trong hình có sẵn 「6」. Phải **để trống**, con trỏ ở đó. Số điền sẵn mà người giao vội bấm 記録 là ghi sai | Phải có | BR-LOT-02, FR-DEL-01 |
| 9 | SC-05-02 [5] | Dòng せり 失効 「確定不可」: búa đã gõ, cá vẫn nằm đó. Cần câu hướng dẫn 「この行は確定できません。ロットは販売可能に戻ります（再せり・相対）」 và lô quay lại 販売公開中 | Nên có | BR-PERM-01, FR-SERI-02 |
| 10 | SC-04-01 [13] | Vượt 参加上限 có lý do: người chốt tự quyết lúc cao điểm là được (không chặn cứng), nhưng dòng đó phải hiện ở 要確認 SC-07-01 để 照合 soát | Nên có | PRM-046, L4-A04 (1) |
| 11 | SC-04-01 [5], SC-04-05 [5] | 数量 cho phép 2 số lẻ. Lô theo 箱 / 尾 phải là số nguyên, chặn ngay ở ô | Nên có | FB LAB-2 #5; đơn vị lô `[Giả lập]` |
| 12 | SC-06-02 | Đa số người mua lấy hết hàng một lần `[Giả lập]`. Thêm nút 「この買受人の残りをすべて引渡し」 → hộp xác nhận liệt kê từng GD → 記録. Từ 5 lần bấm × số GD xuống còn 3 lần bấm | Nên có | FR-DEL-02, PERSONA-DOCK-01 |
| 13 | SC-06-02 [11], SC-06-04 [10] | 受取人 là ô thả xuống ▼, khó bấm khi đeo găng. Đổi thành 2 nút to 「本人」/「代理」, chọn 代理 mới hiện ô tên | Nên có | PERSONA-DOCK-01, PRM-086 |
| 14 | SC-03-05 [4] trên tablet | Ô ☑ chọn lô nhỏ. Trên tablet, chạm cả dòng là chọn / bỏ chọn | Nên có | PRM-086 |
| 15 | SC-03-05 [5] | Áp một hạng cho nhiều lô: trước khi 記録, hiện lại danh sách lô sẽ ghi (「L…-3, L…-4, L…-5 に A を記録します」). Bấm nhầm một ô là ghi hạng cho lô chưa xem | Nên có | CAP-HUMAN-01 |
| 16 | SC-06-05 [9] | Phiếu giấy: chỉ người đã ký mới xác nhận được. Người ký nghỉ ca / nghỉ phép thì kẹt quá SLA. Cho 配送部門責任者 khác xác nhận với lý do bắt buộc + đối chiếu scan, audit ghi rõ | Nên có | FR-DEL-04, S1; `[Giả lập]` |
| 17 | SC-06-05 [7] | Kết luận 「一部返品として完了」 có đổi tiền: hiện ngay ảnh hưởng tiền và đường đi (ngày chưa khóa → 要確認; đã khóa → 修正申請) như SC-06-04 [12] | Nên có | BR-CLOSE-01, FR-DEL-03 |
| 18 | SC-01-02 [12] / [15] | Hai khối tách đúng. Để phân biệt bằng mắt nhanh: tiêu đề khối chữ to 「許可（仲卸）」/「承認（売買参加者）」, khung màu khác nhau, và **không bao giờ hiện cả hai khối cùng lúc** (đã đúng, giữ) | Nên có | BR-PERM-01, luật 2 |
| 19 | SC-01-02 [19], C-27 | Màn này cấm chữ 「承認待ち」 cho bước nội bộ (dùng 「決裁待ち」, đã đúng ở [19]). Nhưng C-27 dùng chung ghi 「承認待ち」: đảm bảo SC-01-02 / SC-01-05 không dùng mẫu C-27 mặc định, kẻo lẫn với khối 承認 ngay bên trên | Nên có | luật 2, S6 |
| 20 | SC-01-02 [9] / [16] | Đổi 保証金 thì 参加上限 (mặc định = 保証金) có tự đổi theo không? Nói rõ trong hộp thoại đổi 保証金: 「参加上限も ¥… に変わります」 hoặc 「参加上限は変わりません」 | Nên có | PRM-046, D14 |
| 21 | SC-01-02 [17] | 「期限前更新を確認」 ghi MFA nhưng không có trong danh sách PREMISE §3.2. Hoặc thêm vào danh sách, hoặc bỏ MFA ở đây. Chúng tôi nghiêng về **thêm vào danh sách** (đụng tư cách người mua) | Nên có | NFR-SEC-01, PREMISE §3.2 `[Giả lập]` |
| 22 | SCREEN-LIST, SC-03-02 | Màn 仮受付 ở bến (tablet, 01:00–04:00, đeo găng, mạng chập chờn) là màn tablet dùng nhiều nhất của 受付 nhưng chỉ ở mức List, chưa có wireframe. Xin ít nhất một hình phác như SC-06-02 trước khi chốt thiết kế | Nên có | PERSONA-DOCK-01, NFR-USE-01 |
| 23 | _common-layout C-30 | Mã MFA 6 số trên tablet (配送部門責任者 ở bến): dùng bàn số to như SC-06-02, không bật bàn phím ảo nhỏ của máy | Nên có | PRM-086, NFR-SEC-01 |
| 24 | SC-00-02 (C-5) | PIN đổi người trên tablet cũng dùng bàn số to. Đổi người là việc làm nhiều lần mỗi ca | Nên có | PERSONA-DOCK-01 |
| 25 | SC-07-02 [9] | Theo trả lời Q-SC0405-01: 当日訂正 ≥ ngưỡng hoặc đổi 買受人 thành dòng ✖ đến khi 照合 bấm 確認済 | Nên có | FR-SETTLE-02, E-08 `[Giả lập]` |
| 26 | SC-04-04 | Một câu giải thích cạnh nút 当日訂正 / 修正申請 và nhãn 業務日 + 締め済 của chính GD (Q-WF-03) | Nên có | BR-CLOSE-01 |
| 27 | SC-03-01 [3] | Câu 「01:00以降の受付は当日扱い」 phải lấy giờ từ quy chế đang hiệu lực, không viết cứng, vì đây là tham số có version (E-16) | Nên có | PREMISE §3.1, E-16 |
| 28 | SC-03-01 [7] | Chênh lệch lớn giữa 仮受付 và 本登録 (vd. trên 5%) thì tô vàng để 受付 nhìn lại; không chặn | Muốn có | BR-LOT-02; ngưỡng `[Giả lập]` |
| 29 | SC-08-03 | Sau khi duyệt / từ chối một yêu cầu, có nút 「次の承認待ちへ」. 照合部門長 duyệt 10–20 dòng liên tiếp trong khoảng MFA 10 phút | Muốn có | FR-CORR-02, L4-A07 |
| 30 | SC-06-01 | Mở được trên tablet chế độ chỉ đọc cho 配送部門責任者 (Q-WF-01) | Muốn có | FR-DEL-05 `[Giả lập]` |
| 31 | SC-03-05 | Ô 「下見時刻」 khi nhập bù từ giấy (Q-SC0305-01) | Muốn có | `[Giả lập]` |
| 32 | ホーム tablet | Nút theo vai có số đếm việc chờ; chữ 「メニュー」 thay ký hiệu 「≡」 (Q-WF-02) | Nên có | FB LAB-2 #13, #14 |

Tổng 32: Phải có 8 (#1–#8) · Nên có 20 (#9–#27, #32) · Muốn có 4 (#28–#31). Không đòi thêm màn mới; mọi góp ý nằm trong các màn đã có trong 70 màn.

---

## 3. Điều chúng tôi lo nhất nếu đi tiếp như hiện tại

1. **Ngày không khóa được vì một tablet.** Dòng "máy chưa đồng bộ" chặn khóa ngày là đúng, nhưng không có đường cho máy hỏng / mất. Ở bến nước và đá, chuyện này sẽ xảy ra trong tháng đầu, lúc đó 10:00 không khóa được, file kế toán 11:00 trễ (#1).
2. **Tiền đổi mà 照合 không thấy.** Ngưỡng 2 cấp tính theo chênh lệch net bỏ lọt ca đổi người mua; ngoại lệ giao ở ngày chưa khóa tự sinh bản ghi tiền mà không vào 要確認; bảng thưởng tự đánh mất 完納 vì phí chuyển khoản. Ba chỗ này là chỗ kiểm toán và người mua sẽ khiếu nại (#3, #4, #7).
3. **Ở bến vẫn có chỗ chậm và dễ sai khi đeo găng**: số lượng điền sẵn, ô thả xuống, dữ liệu offline cũ mà không báo giờ, và màn 仮受付 ở bến chưa có hình để chúng tôi xem. Nếu một trong các chỗ này làm sai số lượng giao, người mua sẽ lại gọi điện sau 08:00 (#2, #8, #13, #22).

---

**Status:** DONE

**Summary:** Trả lời 5 câu hỏi (Q-WF-01 đồng ý tách, SC-06-01 cho PC văn phòng · Q-WF-02 đồng ý có điều kiện · Q-WF-03 hiểu được, thêm câu giải thích và giữ nội dung khi gặp 423 · Q-SC0305-01 không cần offline · Q-SC0405-01 không bắt người thứ hai lúc sửa, đưa ca lớn vào checklist khóa ngày). 32 góp ý: Phải có 8 · Nên có 20 · Muốn có 4.
