# Phản hồi của khách hàng: thứ tự ưu tiên và phạm vi sprint 1 (LAB-5 P1)

- Người trả lời: 株式会社 桜水産市場 (agent `customer-end-user`), tổng hợp ý kiến các bộ phận. Ngày: 2026-11-26.
- Trả lời cho: `plans/lab/Lab 5/p1-customer-brief-priority-and-sprint1.md` (6 câu).
- Đối chiếu với các câu đã trả lời: `customer-feedback-qa-answers-261117.md`, `customer-feedback-lab4-premise-261125.md`, `customer-feedback-lab4-p3-questions-261125.md`, bảng E-xx ở `project/02_requirements/qa-for-customer-ja.md`.
- Quy ước nguồn: dẫn ID RFP thì là điều đã có trong RFP / quy chế. `[Giả lập]` là RFP để mở, đây là câu trả lời theo vai. "Phải hỏi lại X" là chưa có số, không bịa.
- Chúng tôi chỉ nói ưu tiên nghiệp vụ và điều kiện chấp nhận. Xếp việc vào sprint nào, ai làm, làm bằng gì là việc của Sun*.

---

## Câu 1. Thứ tự ưu tiên FG-01..FG-10

Đây là thứ tự **quan trọng với vận hành chợ**, không phải thứ tự làm. Sun* cần làm FG-02 trước để có cửa vào thì cứ làm, chúng tôi không phản đối.

| Hạng | Nhóm | Vì sao (người bị ảnh hưởng) |
|---|---|---|
| 1 | **FG-04 相対取引** | ~90% giá trị giao dịch (luồng chính, không phải せり). 取引担当 chốt từ 02:15, người mua đứng chờ. Hệ thống không chạy được 相対 thì không thay được giấy. |
| 1 (đồng hạng) | **FG-01 参加者・許可/承認** | Căn cứ pháp lý để được mua. Chốt giao dịch với người đã 失効 / 一時停止 là vi phạm quy chế (BR-PERM-01), kiểm toán bắt ngay. 許可 (仲卸) và 承認 (売買参加者) là hai thứ riêng. FG-04 mà không có FG-01 thì không dùng được. |
| 2 | FG-07 照合・日次締め | 照合部門長 khóa sổ trước 10:00–10:30 mỗi ngày (QA-016). Sổ ngày không khớp thì toàn bộ số liệu kế toán, thưởng đều sai theo. |
| 3 | FG-03 ロット受付・目利き | Không có lô thì không có gì để bán. 受付 ở bến đeo găng, mạng chập chờn. 目利き do người quyết (CAP-HUMAN-01). Xếp sau 照合 vì tạm thời bến vẫn có thẻ treo + phiếu giấy chống đỡ được vài ngày. |
| 4 | FG-09 完納奨励金 | Tiền trả cho người mua, sai 1 yên là khiếu nại (BR-INC-01). Chỉ chạy mỗi tháng một lần nên đứng sau các việc hằng ngày, nhưng **phải kiểm tra số sớm** (xem câu 4). |
| 5 | FG-06 引渡し | 配送 đang bị gọi điện liên tục sau 08:00 vì không ai biết đã giao tới đâu. Tiền không đổi theo tiến độ giao (QA-010), nên xếp sau phần tiền. |
| 6 | FG-08 修正申請・決裁 | Bắt buộc phải có trước go-live (không sửa đè sổ đã khóa, BR-CLOSE-01), nhưng số lần dùng mỗi ngày ít. |
| 7 | FG-02 アカウント・権限 | Cần cho mọi thứ, nhưng tự nó không làm chợ nhanh hơn. Riêng **đổi người trên máy dùng chung bằng PIN** thì quan trọng với bến và bàn giao dịch, không được làm chậm. |
| 8 | FG-05 せり結果 | ~10% giá trị. Kết quả せり do người xác nhận (FORM-SERI-01). Trễ thì chợ vẫn ghi giấy rồi nhập sau được. |
| 9 | FG-10 規則版・カレンダー | Màn quản lý version dùng tối đa 4 lần/năm (GOV-RULE-01). Lưu ý: phần **lịch chợ / 業務日 / 休市日** và **bộ giá trị quy chế ban đầu** thì các nhóm khác cần ngay từ đầu. Hạng 9 chỉ nói về màn đổi version, maker-checker, rollback. Phần này vẫn phải xong trước UAT. |

---

## Câu 2. Sprint 1: giữ FG-01 + FG-02 hay đổi sang lát cắt 相対?

**市場経営陣 / 取引担当 / 照合部門長:** **Giữ FG-01 + FG-02 như WBS.** Không đổi sang lát cắt 相対 tối thiểu ở S1.

Lý do:
- Một luồng 相対 "đăng nhập → lô → chốt → phiếu" mà chưa có kiểm tra 許可/承認 thật thì sẽ demo đúng cái sai: người mua 失効 vẫn chốt được. Chúng tôi không muốn nghiệm thu, dù chỉ là xem thử, một màn 相対 bỏ qua BR-PERM-01.
- Luồng 相対 chúng tôi đã xem trên prototype (LAB-2) rồi. Cái chúng tôi chưa thấy là **dữ liệu người tham gia thật của chợ** chạy trên hệ thống thật.
- Đội S1 mới vào, chạy khoảng 50%. Ôm thêm 相対 vào S1 thì dễ thành demo nửa vời ở cả hai phần.

Điều kiện:
- **S3 (相対) không được trễ.** Nếu lịch trượt, xin cắt hoặc dời FG-05 せり, báo cáo phụ, hay các mục "Muốn có", **không dời 相対**. Sun* nói trước với chúng tôi: S1 không xong thì cái gì bị đẩy đi đâu.
- `[Giả lập]` Điều kiện để 照合事務局 / 取引担当 coi buổi demo cuối S1 là "dùng thử được":
  1. Dùng **danh sách người tham gia của chợ đã che thông tin** (actors.csv, IT gửi, xem câu 6), không dùng dữ liệu bịa.
  2. 照合事務局 tự tay đăng ký được 1 仲卸 có **許可** và 1 売買参加者 có **承認**, mỗi cái có 有効日 / 失効日 riêng, rồi tự đặt 一時停止 cho một người (theo 決裁, lưu giờ phút, Q-PTY-05).
  3. Người ngồi vị trí 取引担当 **gõ mã người mua bằng bàn phím là thấy ngay** còn hiệu lực không, theo căn cứ nào (許可 hay 承認), hết hạn ngày nào. Không phải dùng chuột (NFR-USE-01).
  4. Trên một PC dùng chung, hai người đổi nhau bằng PIN trong vài giây, và nhật ký ghi đúng ai làm gì.

---

## Câu 3. Demo cuối S1: không được thiếu / có thể để sau

**Không được thiếu (3):**

| # | Thứ | Người cần | Nguồn |
|---|---|---|---|
| 1 | 許可 và 承認 là **hai bản ghi riêng**, mỗi cái có hạn và trạng thái (有効 / 一時停止 / 失効) riêng. Đổi trạng thái giữ lịch sử, không ghi đè. | 照合事務局, kiểm toán | TBL-ACTOR-01, BR-PERM-01, QA-017 |
| 2 | Tra tư cách người mua theo mã, chỉ bằng bàn phím, có kết quả ngay | 取引担当 (dùng lại ở S3) | BR-PERM-01, NFR-USE-01 |
| 3 | Phân quyền theo vai: 受付 không thấy tiền, không thấy thông tin cá nhân người tham gia. Đổi người bằng PIN trên máy dùng chung. Nhật ký ai làm gì. | 照合部門長, IT | TBL-ROLE-01, L4-A06, L4-A07, FR-AUDIT-01 |

**Có thể để sau (3):**

| # | Thứ | Để tới khi nào |
|---|---|---|
| 1 | Email báo trước 30 ngày khi sắp 失効 và danh sách in ở quầy cho người không có email (L4-A08) | Sprint nào cũng được, miễn trước UAT |
| 2 | 保証金 / 参加上限 và cảnh báo vượt hạn mức (chỉ 照合部門長 đổi, Q-PTY-06) | Cùng với 相対 ở S3, vì cảnh báo chỉ có ý nghĩa ở bàn giao dịch |
| 3 | Nạp toàn bộ danh sách người tham gia cũ (migration đầy đủ, xử lý mã lệch giữa hai nguồn theo C.4) | Đợt chuẩn bị chuyển đổi. S1 chỉ cần một phần danh sách để demo |

MFA step-up trước khi 一時停止 / 失効 / phục hồi: S1 có thì tốt, sang S2 cũng chấp nhận, nhưng danh sách hành động phải hỏi MFA vẫn như chúng tôi đã đưa (L4-A07).

---

## Câu 4. 完納奨励金 có cần kiểm tra sớm hơn S6–S7 không?

**照合部門長:** **Có. Cần kiểm tra số sớm, không cần màn hình sớm.**

- Engine thưởng xếp S6–S7, sau đó chỉ còn S8 và UAT. Nếu tới lúc đó mới thấy lệch 1 yên hay hiểu sai quy tắc thì sửa rất muộn. Đây là điều chúng tôi lo từ đầu (QA-001 mục "Tiền sai 1 yên": test vector ngay từ thiết kế).
- `[Giả lập]` Đề nghị một **điểm kiểm tra số ở cuối S4**: Sun* đưa bảng tính thử (dạng bảng là đủ, không cần giao diện) với dữ liệu mẫu, gồm:
  - 3 ca của C.3: INC-EDGE-01 (đúng ngưỡng dưới của bậc), INC-EDGE-02 (sửa sau 期ロック → delta kỳ sau), INC-EDGE-03 (làm tròn xuống JPY sau ×110/100);
  - các ngày biên đã nêu (L4-A09): GD 01:30 ngày đầu tháng, 支払期日 rơi 休市日, chuyển năm tài chính 3/31 → 4/1;
  - ca FIFO "còn nợ kỳ cũ, trả đủ kỳ mới trước hạn" (OPEN-L4-02);
  - ca giao dịch nhập muộn sau khi khóa kỳ (Q-INC-02, chúng tôi đã không đồng ý "không thưởng cố định").
- Cách kiểm: 照合事務局 tính tay cùng bộ dữ liệu bằng spreadsheet hiện tại, so từng dòng với bảng của Sun*. Lệch dòng nào thì chốt lý do trước khi Sun* code engine.

**Ai duyệt kết quả test số:**
- **照合部門長** duyệt và ký. Đây cũng là người ký nghiệm thu nghiệp vụ (ACC-GATE-01, E-19). Vắng thì người 代行 đã chỉ định trước, không phải 運用部門長 (Q-STL-04).
- **経理部** xác nhận phần thuế và làm tròn: số "期のお支払額" có khớp hóa đơn của phần mềm kế toán không (E-06).
- **ルール管理者** xác nhận bảng tỷ lệ dùng trong test đúng version.

Điều kiện để kiểm sớm được: fixture (E-03, có incentive-rate-table.csv) và câu trả lời của 経理部 cho E-02, E-06, Q-INC-01, Q-INC-02 phải có trước. Phần này là trách nhiệm của chợ, xem câu 6.

---

## Câu 5. Ai tham dự demo cuối sprint, bao lâu, khung giờ nào

**市場経営陣:** Cam kết như QA-004 (1–2 SME × 2 giờ / sprint). Cụ thể `[Giả lập]`:

| Sprint | Người tham dự cố định | Người theo chủ đề |
|---|---|---|
| Mọi sprint | 照合部門長 (hoặc người 代行), 1 người IT của chợ | — |
| S1 | | 照合事務局 (đăng ký người tham gia) |
| S2 | | 受付担当 1 người, 目利き主任, ルール管理者 |
| S3 | **ban lãnh đạo 30 phút** | 取引担当 1–2 người |
| S4 | | 取引担当 / せり確認者, 配送部門責任者 |
| S5 | | 照合事務局 |
| S6–S7 | **ban lãnh đạo 30 phút ở S7** | 経理部 1 người |
| S8 | | 経理部, IT |

Khung giờ:
- **Không demo trong 02:00–10:00.** 10:00–12:00 cũng không được vì 照合 đang khóa sổ, xuất báo cáo.
- Demo chính: **13:00–14:30**, ngày thường hoặc 休市日 (như QA-004). Mỗi lần **tối đa 90 phút**.
- Người làm ca đêm ở bến và bàn giao dịch (受付, 取引, 配送) hết ca khoảng 10:00 rồi về ngủ, gọi lại lúc 13:00 thì rất khó. Với họ: **buổi thử tay 30–45 phút ngay sau ca, khoảng 10:30–11:15**, cùng ngày demo. Họ cầm máy thử, không ngồi nghe trình bày.
- Từ S2 trở đi, phần bến nên thử **trên tablet ở hiện trường, đeo găng**, không chỉ chiếu trên PC phòng họp.

---

## Câu 6. Rủi ro trễ chợ lo nhất ở giai đoạn đầu, chợ làm gì để giảm

| # | Rủi ro | Chợ làm gì | Người phụ trách phía chợ |
|---|---|---|---|
| 1 | **Câu trả lời E-xx trễ**, nhất là phần của 経理部: E-01, E-02, E-06, cộng Q-TRD-02, Q-INC-01, Q-INC-02, Q-PTY-06. 11 câu ★ hạn 2027-01-15 trước cửa G1 (01-22) | `[Giả lập]` Chỉ định **一つの窓口 = 照合部門長** để đi đòi câu trả lời, mỗi tuần gửi Sun* danh sách đã xong / chưa xong. Đặt **một buổi riêng với 経理部 vào tuần đầu tháng 1** (sau 年末年始). Câu nào tới 01-15 chưa có thì chúng tôi **chọn "暫定前提どおり" bằng văn bản**, không để "未定". | 照合部門長, 経理部 |
| 2 | **Fixture / dữ liệu mẫu chưa có** (E-03, mục tiêu 2026-12-01, hạn 2027-01-15) | `[Giả lập]` IT gửi **làm hai đợt**: đợt 1 là actors.csv + incentive-rate-table.csv (cần cho demo S1 và cho test số ở câu 4); đợt 2 là các file còn lại. Không đợi che xong cả 7 file mới gửi. | IT (ルール管理者・IT) |
| 3 | **Thiết bị ở bến chưa chọn** (E-05, khảo sát hiện trường 2027-01-29), trong khi S2 làm 受付 ở bến | `[Giả lập]` Cho mượn 1–2 tablet đang có để demo S2. Chốt model và đặt mua trước cuối tháng 2. Router 4G dự phòng chợ trả phí (QA-005). Danh sách thiết bị hiện có: phải hỏi lại IT. | IT, 運用部門 |
| 4 | **Người của chợ không rảnh đúng lúc**: S7 (完納奨励金) rơi vào Golden Week (cuối 4 – đầu 5). 経理部 bận quyết toán năm tài chính (năm TC kết thúc 3月) trong tháng 4–5 | `[Giả lập]` Đặt lịch 経理部 cho S6–S7 và điểm kiểm tra số cuối S4 **ngay từ bây giờ**. Xin Sun* dời buổi demo S7 ra khỏi tuần Golden Week. | 経営陣, 経理部 |
| 5 | **Quyết định của ban lãnh đạo chưa có**: E-14 (rollback khi đã đủ 4 lần), E-08 (ngưỡng duyệt 2 cấp), người 代行 (Q-STL-04, E-19), danh sách người duyệt quy chế (Q-RULE-03) | Đưa cả bốn vào **workshop trước 2027-01-15**. E-14 phải chốt trước S2 vì S2 làm quy chế. | 経営陣 |
| 6 | Ký hợp đồng trễ (E-20, giả định 2026-12-01) | Phải hỏi lại 経営企画 về lịch quyết của ban lãnh đạo. | 経営企画 |

**Tình trạng các câu còn chờ (tới 2026-11-26):**
- **E-14: vẫn chưa chốt.** Ý kiến của chúng tôi không đổi so với 261125: rollback vẫn đếm, vẫn báo ban lãnh đạo, có thêm 運用部門長 duyệt + MFA, nhưng **không bị bộ đếm chặn**; version mới thứ 5 thì chặn. Đây vẫn là ý kiến làm việc, ban lãnh đạo quyết ở workshop (hạn 2027-01-15). Từ giờ tới đó Sun* vẫn giữ hai nhánh N1 / N2.
- **E-02: vẫn chưa chốt.** 経理部 chưa trả lời 入金 CSV có cột 請求番号 / 対象年月 hay không. Trong lúc chờ: chấp nhận FIFO tạm, với điều kiện màn 期ロック hiện tiền đã gán vào kỳ nào, và có test vector cho ca FIFO làm mất 完納.
- E-06, Q-INC-01 (giờ CSV ngân hàng về), Q-INC-02, Q-TRD-02 (hệ số thuế): vẫn chờ 経理部.
- E-08, Q-RULE-03, người 代行: vẫn chờ 経営陣.
- E-12, E-13, Q-LOT-03 (danh mục 等級): vẫn chờ 運用部門.

---

## Bảng góp ý

| # | Vai | Output / vị trí | Ý kiến | Mức cần | Nguồn |
|---|---|---|---|---|---|
| 1 | 市場経営陣 / 取引担当 | WBS, thứ tự sprint | 相対 (S3) không được trễ; lịch trượt thì cắt せり / báo cáo phụ / Muốn có, không dời 相対. Sun* nói trước phần nào bị đẩy nếu S1 không xong | Bắt buộc | FR-AITAI-01, 01-02 (相対 chính); cách cắt `[Giả lập]` |
| 2 | 照合事務局 / 取引担当 | Demo S1 | Giữ FG-01 + FG-02; không demo 相対 bỏ qua kiểm tra 許可/承認 | Bắt buộc | BR-PERM-01 |
| 3 | 照合事務局 | Demo S1 | Dùng danh sách người tham gia đã che của chợ, không dùng dữ liệu bịa | Muốn có | C.1; `[Giả lập]` |
| 4 | 取引担当 | Demo S1, FG-01 | Tra tư cách người mua theo mã chỉ bằng bàn phím, thấy căn cứ (許可/承認) và hạn | Bắt buộc | BR-PERM-01, NFR-USE-01 |
| 5 | 照合部門長 | FG-09, lịch | Điểm kiểm tra số 完納奨励金 cuối S4: bảng tính thử với C.3 + ngày biên + FIFO + nhập muộn; 照合 tính tay đối chiếu | Bắt buộc | BR-INC-01, C.3; mốc S4 `[Giả lập]` |
| 6 | 照合部門長 / 経理部 | Duyệt test số | 照合部門長 ký (vắng thì 代行 chỉ định trước), 経理部 xác nhận thuế / làm tròn, ルール管理者 xác nhận version bảng tỷ lệ | Bắt buộc | ACC-GATE-01, E-06, E-19 |
| 7 | 受付 / 取引 / 配送 | Lịch demo | Người ca đêm thử tay 10:30–11:15 ngay sau ca; demo chính 13:00–14:30, tối đa 90 phút | Muốn có | QA-004; giờ `[Giả lập]` |
| 8 | 受付担当 | Demo từ S2 | Thử trên tablet ở hiện trường, đeo găng | Muốn có | PERSONA-DOCK-01, D.3 |
| 9 | 経営陣 / 経理部 | Lịch S6–S7 | Tránh Golden Week cho demo S7; đặt lịch 経理部 sớm vì mùa quyết toán | Muốn có | `[Giả lập]` |
| 10 | ルール管理者 | FG-10 | Hạng 9 chỉ là màn đổi version; lịch chợ / 業務日 / bộ giá trị ban đầu cần sớm. E-14 chốt trước S2 | Bắt buộc | GOV-RULE-01, E-14, E-16 |

---

## Điều chúng tôi lo nhất nếu đi tiếp như hiện tại

1. **(照合部門長) Engine thưởng xong muộn, lỗi tiền lộ ra lúc UAT.** S6–S7 rồi chỉ còn S8. Nếu không có điểm kiểm tra số ở S4 thì một quy tắc hiểu sai (FIFO, nhập muộn, ngày biên) sẽ thành lỗi tiền ngay trước go-live.
2. **(市場経営陣) Chợ trả lời chậm, nhất là 経理部.** Phần lớn câu chặn engine thưởng nằm ở 経理部, mà tháng 1 vừa qua 年末, tháng 4–5 lại là mùa quyết toán. Đây là rủi ro do chính chúng tôi gây ra, nên chúng tôi nhận phần đi đòi câu trả lời.
3. **(取引担当) 相対 bị đẩy lùi khi lịch trượt.** S1 chạy 50% năng lực; nếu trễ dồn sang S3 thì luồng chiếm 90% giá trị của chợ là thứ bị ép. Cắt せり / phần phụ trước, đừng cắt 相対.

**Status:** DONE
