# Phản hồi của khách hàng (giả lập): PREMISE LAB-4, giả định L4-A01..A09

- Người trả lời: 株式会社 桜水産市場 (agent `customer-end-user`), tổng hợp ý kiến các bộ phận. Ngày: 2026-11-25.
- Tài liệu đọc: `lab-wholesale-market/PREMISE.md` v0.1.0 (mục 3 L4-A01..A09, mục 4 M01–M24); đối chiếu các câu trả lời trước của chúng tôi: `customer-feedback-qa-answers-261117.md`, `customer-feedback-premise-review-261118.md`, `customer-feedback-gate1-steps3-6-261118.md`, `customer-feedback-price-reduction-package-b-261123.md`.
- Quy ước nguồn: dẫn ID RFP là điều đã có trong quy chế/RFP, trả lời chắc. `[Giả lập]` là RFP để mở, đây là câu trả lời theo vai, không phải dữ kiện RFP. "Phải hỏi lại X" là chưa có số liệu, không bịa.
- Đây là ý kiến làm việc. Nghiệm thu cuối do một người phụ trách nghiệp vụ ký (ACC-GATE-01).

---

## 1. Trả lời từng giả định

| ID | Kết luận | Tóm tắt |
|---|---|---|
| L4-A01 | **Đồng ý** | AWS Tokyo, tài khoản đứng tên công ty, như QA-003 |
| L4-A02 | **Đồng ý** | Dữ liệu ví dụ giả; khi có fixture thì đối chiếu lại |
| L4-A03 | **Đồng ý có điều chỉnh** | Phải nói rõ tham số nào nằm trong quy chế (tính vào 4 lần/năm), tham số nào ở file cấu hình; E-14 không phải tham số để tự bật/tắt |
| L4-A04 | **Đồng ý có điều chỉnh** | (1) せり vượt 参加上限: đồng ý, thêm điều kiện · (2) cách tính kỳ: đồng ý, thêm điều kiện · (3) **chặn cả rollback ở lần thứ 5: Không đồng ý** |
| L4-A05 | **Đồng ý** | Đúng như đã thống nhất ở LAB-1 |
| L4-A06 | **Đồng ý** | Bắt buộc theo TBL-ROLE-01 |
| L4-A07 | **Đồng ý có điều chỉnh** | Đúng hướng chúng tôi đề nghị, nhưng phải có danh sách hành động cụ thể, khoảng hiệu lực ngắn, admin vẫn MFA khi đăng nhập |
| L4-A08 | **Đồng ý có điều chỉnh** | Chấp nhận cho 第1期, nhưng phải ghi rõ ở bảng tuân thủ là đáp ứng một phần, và quy định nội dung email, gửi lại, email lỗi |
| L4-A09 | **Đồng ý** | Chỉ là ví dụ; nhờ chọn ví dụ trúng các ngày biên của chợ |

---

### L4-A01: Nền tảng AWS Tokyo: **Đồng ý**

**市場経営陣 / ルール管理者・IT:** Chúng tôi không có ý kiến về kỹ thuật. Điều kiện vẫn như QA-003: tài khoản cloud đứng tên công ty chúng tôi, dữ liệu nằm trong Nhật, đạt 99,5% trong giờ 02:00–10:00, mất dữ liệu tối đa 15 phút, khôi phục trong 4 giờ (NFR-AVL-01, NFR-AVL-03), lưu 7 năm (DR-RET-01). Chi phí định kỳ không vượt con số TCO đã đưa trong đề xuất. Chuyện ai trực hệ thống lúc 2 giờ sáng sau hypercare vẫn chưa xong, nhưng đó là việc của hợp đồng vận hành, không phải của bản thiết kế này.

### L4-A02: Fixture chưa có: **Đồng ý**

**ルール管理者・IT:** Đúng là chúng tôi chưa gửi. IT nhắm gửi **2026-12-01** `[Giả lập]` (như QA-019). Spec cứ dùng dữ liệu giả, nhưng:
- Dữ liệu ví dụ phải trông rõ là giả (mã hư cấu), đừng để người đọc tưởng là số thật của chợ.
- Khi có fixture, ít nhất các **ví dụ tính 完納奨励金** trong Technical Design phải được tính lại bằng dữ liệu thật trong incentive-rate-table.csv. Chúng tôi lo nhất là tiền lệch 1 yên.

### L4-A03: Điểm rẽ nhánh thành tham số có version: **Đồng ý có điều chỉnh**

**照合部門長 / ルール管理者:**
1. Thiết kế để đổi giá trị mà không phải sửa hệ thống là đúng ý chúng tôi. Nhưng "tham số có version" phải nói rõ **nằm ở đâu**, theo điều kiện chúng tôi đã đặt cho K1 (261123):
   - Thứ gì đụng tới tiền, 支払期日, khóa sổ, 業務日, 完納 thì nằm trong **quy chế có version** (GOV-RULE-01): ngưỡng duyệt 2 cấp (E-08), lô nhận trước 02:00 gắn vào 業務日 nào (E-16), giao khớp quy tắc 精算 (E-17).
   - Thứ thuần vận hành thì nằm ở file cấu hình, có nhật ký.
   - E-12 (持ち越し lô) và E-13 (bán trước 下見済) có làm đổi tiền hay không thì **phải hỏi lại 運用部門** trước khi xếp chỗ.
2. Đổi một tham số trong quy chế là **một lần thay đổi trong 4 lần/năm**. Ban lãnh đạo cần biết điều này khi chọn giá trị ban đầu, để không phí lượt sửa. Bộ giá trị cài lúc go-live là version đầu tiên, **không tính** vào 4 lần `[Giả lập]`.
3. **E-14 (rollback lần thứ 5) không được làm thành tham số mà ルール管理者 tự bật/tắt.** Đây là quy tắc quản trị chính quy chế, do ban lãnh đạo quyết một lần ở workshop rồi cố định trong thiết kế. Để thành tham số thì người làm quy chế tự nới giới hạn của chính mình, kiểm toán sẽ hỏi ngay. Chi tiết xem L4-A04 (3).

### L4-A04: Giữ cách làm của prototype ở 3 điểm: **Đồng ý có điều chỉnh** (điểm 3 Không đồng ý)

#### (1) せり vượt 参加上限: bắt lý do từng dòng (M20): **Đồng ý**, thêm điều kiện

**取引担当 / せり確認者:**
- Trong せり, người điều khiển không dừng được phiên để kiểm hạn mức. Ở chợ, búa gõ là xong giá. Vì vậy cảnh báo và lý do **đặt ở bước xác nhận kết quả** (FORM-SERI-01, người xác nhận theo CAP-HUMAN-01) là đúng chỗ, **không chặn cứng**. Người quyết là con người.
- 参加上限 chỉ áp cho **売買参加者** (ACT-03). 仲卸 đi theo 許可, không bị cảnh báo hạn mức. Đừng để cảnh báo này hiện cho 仲卸 rồi người ta quen tay bỏ qua.
- Hạn mức là **một con số chung cho cả 相対 và せり trong cùng kỳ** `[Giả lập]`. Tiền せり phải cộng chung với tiền 相対 đã chốt trong kỳ, không tính riêng hai túi.
- Lý do: **chọn nhanh từ vài lý do có sẵn** (事務局了承済 / 保証金追加予定 / その他 + ghi chú), như góp ý #9 ở 261118. Gõ chữ tự do thì chậm.
- Một người mua thắng nhiều lô trong cùng phiên mà đều vượt: cho **áp cùng một lý do cho các dòng của người đó trong phiên**, nhưng bản ghi vẫn lưu lý do ở từng dòng. Mục này là Muốn có.
- Muốn có, để sau cũng được: trước khi mở phiên せり, có danh sách 売買参加者 đã gần hoặc đã vượt hạn mức để người xác nhận biết trước.

#### (2) Tiền của kỳ theo ngày GD gốc, 入金 tháng sau trừ vào kỳ đó (M21): **Đồng ý**, thêm điều kiện

**照合部門長:** Đúng cách chợ đang làm. 期 là tháng dương lịch, 支払期日 là một ngày cố định của tháng sau, 入金 tháng sau trả cho kỳ trước (QA-007, QA-015, `[Giả lập]`). Thêm mấy điều sau:
- "Ngày GD gốc" phải là **業務日** của GD (02:00 → 01:59 hôm sau, QA-016), **không phải giờ đồng hồ** lúc bấm chốt. GD chốt lúc 01:30 ngày 1 vẫn thuộc 業務日 cuối tháng trước, tức thuộc kỳ trước. Spec phải có đúng ví dụ này.
- GD gốc bị sửa sau 期ロック qua 修正申請: tính lại kỳ cũ theo version của kỳ cũ, phần chênh ra **delta ở kỳ sau** (BR-INC-01). **Không hồi tố làm mất hay làm được 完納** (PRM-043 như đã thống nhất).
- 入金 tới sau 支払期日 vẫn gán vào kỳ cũ để xóa nợ, nhưng kỳ đó **không 完納**. Không có ân hạn (BR-INC-01).
- FIFO khi chưa có 請求番号: tạm chấp nhận. Nhưng có một tình huống phải đưa vào test vector: người mua còn nợ kỳ cũ, trả tiền đủ cho kỳ mới trước hạn, FIFO lại đem tiền trả nợ cũ, thế là kỳ mới mất 完納. Chợ có muốn như vậy không thì **phải hỏi lại 経理部** (gắn với E-02). Trong lúc chờ, hệ thống phải cho 照合 **thấy rõ tiền đã gán vào kỳ nào** trước khi khóa kỳ.

#### (3) 4 lần/năm theo năm TC của ngày hiệu lực; lần 5 chặn cả rollback (M15): **Không đồng ý ở phần rollback**

**ルール管理者 / 照合部門長 / 市場経営陣:**
- Đếm theo **năm tài chính (4月→3月) của ngày hiệu lực**: đồng ý `[Giả lập]`. Bản nháp hủy trước ngày hiệu lực thì không tính. Bộ giá trị ban đầu lúc go-live cũng không tính. Bảng tỷ lệ thưởng chỉ được hiệu lực từ ngày 1 của tháng (261118).
- Chặn **version mới thứ 5**: đồng ý. RFP ghi rõ 「規則／料率 の変更は年間最大四回」 (GOV-RULE-01, 11-04).
- **Chặn rollback ở lần thứ 5: không đồng ý.** Cũng GOV-RULE-01 ghi 「各変更には 発効日 と ロールバック 能力が必要」. Rollback là khả năng gắn với từng lần thay đổi. Nếu version thứ 4 trong năm bị sai tỷ lệ mà hệ thống không cho rollback, chợ phải **chạy tỷ lệ sai tới hết năm tài chính**, mỗi kỳ trả thưởng sai rồi phải đi delta. Như vậy là trái mục đích của quy chế, và kiểm toán sẽ bắt đúng chỗ tiền sai, chứ không bắt chỗ đếm lượt.
- Đề nghị `[Giả lập]`: rollback một version đã hiệu lực **vẫn đếm và vẫn hiện trong báo cáo cho ban lãnh đạo**, nhưng **không bị bộ đếm chặn**. Bù lại, rollback vượt 4 lần phải chặt hơn: lý do bắt buộc, 照合部門長 làm checker, cộng thêm **運用部門長 duyệt** (có MFA), tự thông báo cho ban lãnh đạo. Rollback cũng có ngày hiệu lực và **không sửa kỳ đã khóa**: kỳ đã khóa đi delta như thường.
- Ý kiến này giống góp ý #41 của chúng tôi ngày 2026-11-18. PREMISE đang ghi ngược lại, theo pl-memory là "không nới khi chưa có E-14". Chúng tôi hiểu PL thận trọng, nhưng **điểm này phải để ban lãnh đạo quyết ở workshop (E-14)**. Từ giờ tới lúc đó, Technical Design quy chế nên vẽ đủ cả hai nhánh, ghi nhánh "rollback không bị chặn" là **ý kiến hiện tại của khách**, và mở rủi ro "tỷ lệ sai cả năm" nếu chọn nhánh chặn.

### L4-A05: Offline chỉ cho 仮受付 / 引渡し / 紙伝票後入力; chốt GD phải online: **Đồng ý**

**受付担当 / 取引担当 / 配送部門:** Đúng như đã chốt (DEC-004). Nhắc lại các điều kiện đã nói: màn hình phải báo rõ **đang mất mạng** và **còn bao nhiêu bản ghi chưa đồng bộ**. Đồng bộ lại không được làm số lượng lô âm (BR-LOT-02). Khi mất mạng mà người mua đang đứng chờ chốt 相対 thì ghi phiếu giấy rồi nhập bù (後入力). Trước khi khóa ngày, màn khóa ngày phải đếm được máy nào còn bản ghi chưa đồng bộ (góp ý #31, 261118).

### L4-A06: Quyền đọc theo đủ ma trận: **Đồng ý**

**照合部門長:** Bắt buộc, theo TBL-ROLE-01. Prototype cho xem rộng hơn thì được để demo, bản thật thì không. Điều chúng tôi để ý nhất là thông tin tiền và thông tin cá nhân người tham gia: chỉ vai nào được xem mới thấy.

### L4-A07: MFA chỉ hỏi ngay trước hành động duyệt (step-up), làm việc thường bằng PIN: **Đồng ý có điều chỉnh**

**配送部門責任者 / 照合部門長:** Đây chính là cách chúng tôi đề nghị (góp ý #22, 261118). 配送部門責任者 làm giao hàng trên máy dùng chung ở bến, hỏi MFA mỗi lần đổi người thì không làm nổi. NFR-SEC-01 vẫn đạt vì **mọi lần duyệt đều qua MFA**. Điều chỉnh:

1. **Danh sách hành động phải hỏi MFA phải viết cụ thể trong spec**, không để chung chung chữ "nhạy cảm". Tối thiểu `[Giả lập]`:
   - duyệt / từ chối 修正申請 (cả cấp 1 và cấp 2);
   - 日次締め, kể cả người khóa thay (代行);
   - 期ロック 完納奨励金;
   - xác nhận giao hàng có tranh chấp (SC-06-05);
   - checker quy chế, rollback quy chế;
   - 一時停止 / 失効 / phục hồi tư cách người tham gia;
   - xuất CSV kế toán, xuất danh sách có thông tin cá nhân, xuất 監査ログ;
   - mở khóa / đặt lại PIN cho người khác.
2. **Những việc KHÔNG được bắt MFA**: in danh sách sắp hết hạn ở quầy 受付, in phiếu 取引確認票, xem báo cáo thường. 受付 làm việc này lúc 3 giờ sáng, bắt OTP là họ bỏ không in.
3. **Khoảng hiệu lực ngắn sau một lần MFA** `[Giả lập]`: 照合部門長 duyệt 20 dòng 修正申請 liền nhau trên PC văn phòng thì không thể nhập OTP 20 lần. Đề nghị MFA có hiệu lực khoảng **10–15 phút cho cùng người, cùng máy**. Trên máy dùng chung ở bến, **đổi người là hết hiệu lực ngay**.
4. **Tài khoản quản trị (システム管理者, IT)**: MFA **ngay khi đăng nhập**, không chỉ trước hành động. NFR-SEC-01 ghi "tài khoản quản trị" riêng; người này làm trên PC văn phòng, không vướng máy dùng chung.
5. Cách nhận mã: công ty không cấp điện thoại (PRM-088, 261118). Phải có **phương án cho người không muốn dùng điện thoại riêng**. Trong ADR xác thực, ghi phương án đó cụ thể, để người duyệt khỏi mượn máy người khác.
6. Mất mạng thì không duyệt được (M03). Phải có **đường đi bằng giấy** cho xác nhận giao hàng có tranh chấp lúc mất mạng: ghi tay, có chữ ký 配送部門責任者, sau đó nhập bù và duyệt có MFA.
7. Nếu E-15 trả lời là "MFA mọi lần đăng nhập" cho cả vai duyệt, chúng tôi muốn được nghe lại trước khi đổi. Áp cho máy dùng chung ở bến thì vận hành không chạy nổi.

### L4-A08: Người tham gia bên ngoài ở 第1期 chỉ nhận email (tối đa 2 địa chỉ) + danh sách in tại quầy, không có tài khoản: **Đồng ý có điều chỉnh**

**市場経営陣:** Lúc đầu chúng tôi muốn 仲卸 / 売買参加者 có màn chỉ xem (QA-009). Để vừa 60M, chúng tôi chấp nhận dời sang 第2期 (gói R1). Không mở lại chuyện này.

**照合部門長 / 仲卸・売買参加者 / 受付担当:** Điều kiện để chấp nhận:
1. **Bảng tuân thủ phải ghi rõ "đáp ứng một phần"** cho 02-05 (người ngoài xem tư cách, nghĩa vụ thanh toán), BR-NOTIFY-01 (in-app cho người ngoài) và SEC-IAM-02 (chính sách MFA người ngoài). Ghi kèm cách làm thay ở 第1期 và việc để 第2期. Đừng để thành "đáp ứng" rồi khi nghiệm thu mới cãi nhau.
2. Với SEC-IAM-02: ghi chính sách là "**第1期 người ngoài không có tài khoản nên không có đăng nhập; 第2期 dùng OTP email mỗi lần đăng nhập**" (như PRM-050, 261118). Như vậy mục này có câu trả lời, không bỏ trống.
3. **Nội dung email tối thiểu** (góp ý #2, 261118): kỳ, số tiền phải trả, 支払期日, tài khoản nhận tiền, câu về phí chuyển khoản (chờ 経理 trả lời), đổi trạng thái tư cách (一時停止 / 失効 / phục hồi), báo trước **30 ngày** trước 失効日, kết quả 完納奨励金 mỗi kỳ. 買出人 chỉ nhận báo sắp hết hạn đăng ký (FQ-16).
4. **Gửi lại tối đa 3 lần** khi lỗi (BR-NOTIFY-01). Email bị trả về hoặc gửi lỗi hẳn thì người đó **tự vào danh sách in ở quầy** ngày hôm sau, và 照合 thấy danh sách "chưa gửi được". Không có bước này thì người mua bảo "không nhận được" rồi lại gọi điện.
5. **Đổi địa chỉ email** chỉ do nhân viên chợ làm, dựa trên giấy yêu cầu của người tham gia, có lưu lịch sử. Email có số tiền mà gửi nhầm người là chuyện lớn.
6. Danh sách in ở quầy: tỷ lệ 買出人 không có email **phải hỏi lại quầy 受付**, chúng tôi đoán khoảng 1/3 (FQ-16).

### L4-A09: Ký 2026-12-01, go-live 2027-08-01 (chỉ dùng cho ví dụ): **Đồng ý**

**市場経営陣 / 照合部門長:** Dùng làm ví dụ thì được. Ngày 2027-08-01 là Chủ nhật, hợp với cutover vào 休市日 đầu tháng 8, trước お盆 (QA-012). Nhờ PL chọn ví dụ trong spec trúng các **ngày biên** của chợ, vì lỗi tiền hay nằm ở đó:
- GD chốt lúc 01:30 ngày đầu tháng (thuộc 業務日 / kỳ tháng trước);
- chuyển năm tài chính 3/31 → 4/1 (bộ đếm 4 lần reset, delta âm mang sang tối đa tới hết năm tài chính);
- 支払期日 rơi vào 休市日 (lùi về 営業日 trước, QA-007);
- 臨時休市 do bão / 時化, và tuần 年末;
- kỳ thưởng đầu tiên sau go-live (tháng 8/2027), và 2 kỳ thưởng migrate từ hệ thống cũ.

Nếu rehearsal không đạt thì dời sang đầu tháng 9 (QA-012). Ví dụ không cần đổi, chỉ cần không viết như thể ngày 08-01 là chắc chắn.

---

## 2. Bảng góp ý

| # | Vai | Output / vị trí | Ý kiến | Mức cần | Nguồn |
|---|---|---|---|---|---|
| 1 | 照合部門長 / ルール管理者 | PREMISE §3 L4-A03 | Xếp từng tham số E-08/12/13/16/17 vào "quy chế có version" hoặc "file cấu hình"; thứ gì đụng tiền / 業務日 / khóa sổ vào quy chế | Bắt buộc | GOV-RULE-01, NFR-OPS-02; phân loại `[Giả lập]` |
| 2 | 市場経営陣 | L4-A03, E-14 | E-14 là quyết định quản trị, cố định trong thiết kế sau workshop; không làm tham số ルール管理者 tự đổi | Bắt buộc | GOV-RULE-01, RACI-01; `[Giả lập]` |
| 3 | ルール管理者 | L4-A03, L4-A04(3) | Bộ giá trị go-live và bản nháp hủy trước hiệu lực không tính vào 4 lần/năm | Bắt buộc | GOV-RULE-01; `[Giả lập]` |
| 4 | 取引担当 / せり確認者 | L4-A04(1), M20 | Cảnh báo 参加上限 chỉ cho 売買参加者; hạn mức chung cho 相対 + せり trong kỳ; lý do chọn nhanh; không chặn cứng | Bắt buộc | ACT-03, CAP-HUMAN-01, FORM-SERI-01; hạn mức chung `[Giả lập]` |
| 5 | せり確認者 | L4-A04(1), M20 | Áp cùng lý do cho các dòng của một người mua trong phiên, vẫn lưu từng dòng | Muốn có | `[Giả lập]` |
| 6 | せり確認者 | L4-A04(1) | Danh sách 売買参加者 gần/vượt hạn mức trước khi mở phiên せり | Để sau | `[Giả lập]` |
| 7 | 照合部門長 | L4-A04(2), M21 | Kỳ theo **業務日** của GD, không theo giờ đồng hồ; có ví dụ GD 01:30 ngày đầu tháng | Bắt buộc | BR-INC-01, QA-016; `[Giả lập]` |
| 8 | 照合部門長 | L4-A04(2), M07 | Test vector cho ca "còn nợ kỳ cũ + FIFO làm kỳ mới mất 完納"; hiện tiền gán vào kỳ nào trước 期ロック; quy tắc cuối phải hỏi lại 経理部 | Bắt buộc | BR-INC-01, E-02; `[Giả lập]` |
| 9 | ルール管理者 / 市場経営陣 | L4-A04(3), M15 | **Không chặn rollback** khi đã đủ 4 lần: vẫn đếm, báo ban lãnh đạo, duyệt thêm 運用部門長 + MFA; chặn version mới thứ 5. Ghi là ý kiến khách, chờ workshop E-14 | Bắt buộc (cần ban lãnh đạo quyết) | GOV-RULE-01 (11-04: ロールバック 能力), E-14; cách làm `[Giả lập]` |
| 10 | 照合部門長 | L4-A04(3) | Rollback có ngày hiệu lực, không sửa kỳ đã khóa; kỳ đã khóa đi delta | Bắt buộc | BR-INC-01, BR-CLOSE-01 |
| 11 | 配送部門責任者 / 照合部門長 | L4-A07, M02 | Liệt kê cụ thể các hành động hỏi MFA (mục L4-A07.1) và các việc **không** hỏi (in danh sách ở quầy, in phiếu, xem báo cáo) | Bắt buộc | NFR-SEC-01; danh sách `[Giả lập]` |
| 12 | 照合部門長 | L4-A07 | MFA có hiệu lực 10–15 phút cho cùng người, cùng máy; đổi người trên máy chung là hết | Bắt buộc | NFR-SEC-01, NFR-SEC-03; `[Giả lập]` |
| 13 | ルール管理者・IT | L4-A07 | Tài khoản quản trị MFA ngay khi đăng nhập | Bắt buộc | NFR-SEC-01 |
| 14 | ルール管理者・IT | L4-A07, ADR xác thực | Phương án nhận mã cho người không dùng điện thoại riêng | Bắt buộc | NFR-SEC-01; PRM-088 `[Giả lập]` |
| 15 | 配送部門責任者 | L4-A07, M03, SC-06-05 | Đường giấy cho xác nhận giao có tranh chấp khi mất mạng, nhập bù + duyệt MFA sau | Bắt buộc | CAP-HUMAN-01, NFR-AVL-02; `[Giả lập]` |
| 16 | 市場経営陣 | L4-A08, bảng tuân thủ | Ghi "đáp ứng một phần" cho 02-05, BR-NOTIFY-01 (người ngoài), SEC-IAM-02, kèm cách thay ở 第1期 và việc để 第2期 | Bắt buộc | 02-05, BR-NOTIFY-01, SEC-IAM-02 |
| 17 | 仲卸・売買参加者 | L4-A08, M09 | Nội dung email tối thiểu như mục L4-A08.3; gửi lại tối đa 3 lần | Bắt buộc | BR-NOTIFY-01, FR-NOTIFY-01; nội dung `[Giả lập]` |
| 18 | 受付担当 / 照合部門長 | L4-A08 | Email lỗi hẳn thì tự vào danh sách in ở quầy và danh sách "chưa gửi được" cho 照合 | Bắt buộc | BR-NOTIFY-01; `[Giả lập]` |
| 19 | 照合部門長 | L4-A08 | Đổi email chỉ do nhân viên chợ làm theo giấy yêu cầu, có lịch sử | Bắt buộc | FR-AUDIT-01; `[Giả lập]` |
| 20 | 照合部門長 | L4-A09, spec ví dụ | Ví dụ trúng ngày biên: 01:30 đầu tháng, 3/31→4/1, 支払期日 rơi 休市日, 臨時休市, kỳ đầu sau go-live | Muốn có | BR-INC-01, QA-007, QA-012; `[Giả lập]` |
| 21 | 照合部門長 | L4-A02 | Khi có fixture (mục tiêu 12-01), tính lại ví dụ 完納奨励金 bằng dữ liệu thật | Bắt buộc | C.3, BR-INC-01; ngày gửi `[Giả lập]` |
| 22 | 照合部門長 | M10, SC-10-05 | 臨時休市 / 臨時開市 đổi được trong ngày, không cần nhà thầu, không tính vào 4 lần/năm | Bắt buộc | 00-02; `[Giả lập]` (261118) |

Các mục M khác (M01, M05, M06, M08, M11, M16, M17, M22, M24): chúng tôi không có ý kiến thêm, khớp với những gì đã thống nhất trước đây.

---

## 3. Điều chúng tôi lo nhất nếu đi tiếp như hiện tại

1. **Kẹt với tỷ lệ sai cả năm.** PREMISE đang chặn cả rollback ở lần thứ 5, ngược với ý kiến chúng tôi đã nói ngày 18/11. Nếu bản thiết kế chốt theo hướng chặn mà ban lãnh đạo chưa được hỏi, thì một lần duyệt sai bảng tỷ lệ là trả thưởng sai mỗi tháng cho tới tháng 3. Xin đưa E-14 vào workshop như một quyết định của ban lãnh đạo.
2. **Tiền rơi nhầm kỳ ở ranh giới.** GD sau nửa đêm, FIFO trả nợ cũ, sửa sau 期ロック: đây đều là chỗ lệch 1 yên. Spec phải có ví dụ cụ thể cho từng ca, và khi có fixture thì tính lại.
3. **MFA đặt sai chỗ làm tắc bến hoặc làm hở kiểm toán.** Hỏi MFA cả khi in danh sách ở quầy thì 受付 bỏ không in. Không hỏi khi xuất CSV kế toán hay mở khóa PIN thì kiểm toán bắt lỗi. Danh sách hành động phải viết rõ trong spec, không để lập trình viên tự đoán.

---

**Status:** DONE

**Summary:** Đồng ý 5 (L4-A01, A02, A05, A06, A09) · Đồng ý có điều chỉnh 4 (L4-A03, A04, A07, A08) · Không đồng ý toàn phần 0. Riêng L4-A04 có một điểm con không đồng ý: **chặn rollback ở lần thứ 5**. Ý kiến của khách là rollback vẫn đếm nhưng không bị chặn, chờ ban lãnh đạo quyết ở workshop (E-14).
