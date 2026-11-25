# Customer feedback — Trả lời điểm mở LAB-4 P3 (spec 10 màn) — 2026-11-25

Người trả lời: 株式会社 桜水産市場 (vai ghi ở từng câu). Nguồn câu hỏi: `project/02_requirements/qa.md` mục "Điểm mở LAB-4 P3".
Câu trả lời ngoài RFP gắn `[Giả lập]`. Câu cần bộ phận khác xác nhận ghi rõ "hỏi …".

---

## 1. Bốn câu ưu tiên trước Gate 2

### Q-TRD-02 — 参加上限 so với tiền 税抜 hay 税込?

**照合部門長:** `[Giả lập]` **税込. Không đồng ý giả định 税抜.**

- 参加上限 đặt bằng 保証金 (FQ-10, PRM-046). 保証金 giữ để phòng người mua không trả tiền. Thứ họ phải trả là tiền 請求, tức **tiền có thuế**. So với 税抜 thì người mua đã nợ quá 保証金 thêm cả phần thuế mà máy vẫn chưa cảnh báo.
- Đây chỉ là **cảnh báo**, không chặn (L4-A04(1), góp ý #10 261125). Không cần chính xác tới 1 yên như 完納奨励金. Cách đơn giản là đủ: **tổng 税抜 trong kỳ × hệ số thuế**, làm tròn xuống. Không cần tính thuế lại theo từng dòng giống hóa đơn.
- Hệ số thuế để thành tham số (có lịch sử), **không cài cứng**. Đừng dùng lại hệ số 110/100 của BR-INC-01: hệ số đó chỉ để tính 完納奨励金, RFP đã chốt cố định.
- Màn hình hiện cả hai số: 「使用額 ¥…（税込）／ 税抜 ¥…」. 照合 soát sổ theo 税抜, nói chuyện với người mua theo 税込.
- **Hỏi 経理部:** hệ số thuế áp cho 買受代金 hải sản tươi (bình thường là 軽減税率 8%, nhưng 経理 phải xác nhận) và có trường hợp nào trong kỳ có hai mức thuế không.
- Ảnh hưởng: PL ước tính +0,3 ngày (công thức 2.4 + view). Chấp nhận được.

### Q-TRD-05 — Dòng せり có người mua bị 失効: hủy dòng hay trả 入力者 sửa?

**取引担当 / せり確認者:** **Điều chỉnh. Cần cả hai đường, người xác nhận chọn.**

Ngoài bàn せり, khi gặp 失効 thì có hai trường hợp:

1. **入力者 gõ sai số người mua** (nhiều nhất: gõ nhầm một chữ số, người được gọi thật thì vẫn còn hạn). Hủy dòng ở trường hợp này là bỏ mất một lô đã bán đúng, phải せり lại, người mua thật thì phàn nàn. → **差し戻し (REJECT)** để 入力者 đối chiếu với せり原票 / phiếu giấy rồi sửa số.
2. **Số đúng, người đó thật sự 失効 / 一時停止.** Theo BR-PERM-01 thì không được chốt. → **取消 (CANCEL) dòng**, lô quay lại 販売公開中 để せり lại hoặc chuyển 相対 (giữ đúng góp ý #9 ở 261125).

Điều kiện:
- Màn xác nhận hiện 2 nút rõ ràng: 「差し戻し（番号誤り）」 / 「取消（資格なし・不成立）」. Không có nút 「別の買受人に変更」 ngay trên màn xác nhận.
- Ở 差し戻し, số người mua mới **phải là người thật sự thắng せり** (đối chiếu phiếu). Không được đôn người trả giá cao thứ hai lên, vì như thế là quyết kết quả せり mới, phải せり lại (luật 3: người quyết kết quả せり).
- Sửa xong, BR-PERM-01 vẫn kiểm lại lúc chốt. Lịch sử giữ số cũ, số mới và người sửa.
- Ảnh hưởng: theo PL, `REJECT` đã có (Q-TRD-04), không đổi bảng, chỉ thêm lựa chọn trên UI. Không đòi tính năng mới.

### Q-LOT-01 — Mã lô chính thức cấp lúc nào?

**受付担当 / 運用部門:** `[Giả lập]` **Đồng ý: cấp khi bản ghi 仮受付 lên tới server**, kèm điều kiện:

- Ở bến, 受付 chỉ nhìn **仮番号** trên thẻ treo thùng. Mã chính thức cấp khi nào không quan trọng với họ, miễn **gõ 仮番号 vẫn tìm ra lô** ở mọi màn (本登録, 目利き, 相対) cho tới cuối ngày.
- **Số chính thức không dùng lại.** Lô 仮受付 bị hủy (nhập trùng, nhập nhầm) vẫn giữ số với trạng thái 取消, không xóa. Số bị nhảy cũng được, nhưng kiểm toán hỏi "số này đâu" thì phải tra ra.
- Khi mất mạng, lô nhập offline tới lúc đồng bộ mới có số chính thức. Trong lúc đó không được bán lô chưa có số chính thức (lô cũng chưa 本登録 thì đằng nào cũng chưa bán được).
- Phiếu in cho người mua / 出荷者 dùng mã chính thức, không dùng 仮番号.
- Ảnh hưởng: giữ thiết kế hiện tại, không tốn thêm 0,5 ngày công.

### Q-SC0302-02 — 出荷者 có bắt buộc nhập ở bến lúc 仮受付?

**受付担当:** **Đồng ý không bắt buộc** (khớp góp ý #15 ở 261118: tablet ở bến chỉ 3–4 ô).

- Thực tế mỗi lúc chỉ dỡ một tàu ở một bến, nên hai tàu cùng 品目 ít khi lẫn ngay tại chỗ. Chỗ dễ lẫn là **04:00 ở bàn 本登録**, khi hai tàu đều có サバ.
- `[Giả lập]` Muốn có (không bắt buộc): ở đầu màn có ô chọn 「いま荷揚げ中の船」, chạm một lần cho mỗi tàu, các lô sau tự mang theo cho tới khi đổi tàu. **Một chạm mỗi tàu, không phải mỗi lô.** Bỏ trống vẫn lưu được.
- PL tính ~0,3 ngày. Còn buffer thì làm, hết buffer thì để sau. Tạm thời 受付 ghi dải 仮番号 của từng tàu lên 荷受伝票 giấy (đang làm vậy).
- Bắt buộc 出荷者 ở 本登録: giữ nguyên, phải có để truy vết (A.1).

---

## 2. Bảng xác nhận các giả định còn lại

| ID | Trả lời | Đồng ý giả định PL? | Ghi chú / ảnh hưởng |
|---|---|---|---|
| Q-TRD-02 | 税込 (tổng 税抜 × hệ số thuế tham số, làm tròn xuống); hiện cả 2 số | **Không đồng ý** | `[Giả lập]`; hỏi 経理部 hệ số thuế. +0,3 ngày (PL) |
| Q-TRD-05 | Hai nút: 差し戻し (gõ nhầm số) / 取消 (thật sự 失効 → lô về 販売公開中) | **Điều chỉnh** | BR-PERM-01; không được đôn người trả giá thứ hai. Không đổi bảng |
| Q-LOT-01 | Cấp khi lên server; 仮番号 tra được cả ngày; số không dùng lại; lô hủy giữ trạng thái 取消 | Đồng ý (có điều kiện) | `[Giả lập]`; không tốn thêm |
| Q-SC0302-02 | Không bắt buộc; muốn có chọn 「荷揚げ中の船」 một chạm mỗi tàu | Đồng ý | Phần "muốn có" ~0,3 ngày, còn buffer mới làm |
| Q-LOT-03 | Cách làm đồng ý (danh mục ở master, đổi không cần nhà thầu). **Danh mục thật phải hỏi 運用部門 (目利き主任)**. A/B/C/規格外 tạm dùng cho UAT được. Lưu ý: 等級 tách khỏi サイズ / 入数, đừng gộp thành một trường | Đồng ý | Chỉ là dữ liệu master. 等級 do người quyết (CAP-HUMAN-01) |
| Q-INC-01 | Tính 完納 theo **ngày tiền về trong 入金 CSV (入金日)**, không theo ngày import. Điều kiện khóa: 業務日 > 支払期日 **và** 照合 đã tick 「支払期日分までの入金CSV取込済」. 入金 về sau khi đã khóa → DELTA kỳ sau | **Điều chỉnh** | BR-INC-01 (không ân hạn, 締め後 → 次期差分). Lấy 入金日 của ngân hàng không phải là ân hạn. `[Giả lập]` **Hỏi 経理部**: CSV ngân hàng về lúc nào (thường sáng 営業日 sau?) |
| Q-INC-02 | Không đồng ý K' = false cố định. Nhập muộn là lỗi phía chợ, người mua không được mất thưởng vì lỗi đó. Đề nghị: tiền giao dịch nhập muộn đưa vào kỳ sau theo BR-INC-01, **xét 完納 theo 支払期日 của kỳ sau** như tiền bình thường. **Một quy tắc chung** cho người có và không có giao dịch ở kỳ đã khóa | **Không đồng ý** | `[Giả lập]`; +0,5 MD (PL) chấp nhận được. **Hỏi 経理部 + 照合部門長** chốt cách ghi 請求 cho khoản nhập muộn. PL nói rõ người *có* giao dịch ở kỳ đã khóa thì đang làm thế nào; hai nhóm phải giống nhau |
| Q-INC-03 | Không phải câu của khách (thiết kế nội bộ: lúc nào tạo bản ghi kỳ). Yêu cầu nghiệp vụ duy nhất: giao dịch đầu tháng mới vẫn nhập được khi kỳ trước chưa khóa | — | PL tự quyết |
| Q-PTY-01 | Đúng, mỗi tư cách chỉ 1 yêu cầu mở. Có 一時停止 thì xử lý trước, yêu cầu 更新 rút lại rồi lập sau | Đồng ý | `[Giả lập]` hiếm gặp |
| Q-PTY-02 | Không ghi hồi tố. 発効日 = 業務日 lúc nhập; ngày 経理 nhận tiền thật ghi vào ô ghi chú | Đồng ý | `[Giả lập]` |
| Q-PTY-03 | Không bắt buộc email; ai không có email thì vào danh sách in giấy (L4-A08) | Đồng ý | Khớp góp ý #2 (261118). Dữ liệu chuyển đổi sẽ thiếu email, bắt buộc thì kẹt go-live |
| Q-PTY-04 | Không có ân hạn. 失効 rồi thì đi 再審査 (照合部門長 đề xuất, 運用部門長 quyết) | Đồng ý | Khớp #42 (261118). Gia hạn bình thường phải làm **trước** 失効日 |
| Q-PTY-05 | Hiệu lực ngay lúc 決裁, áp cho mọi giao dịch **chốt sau thời điểm đó**. Giao dịch chốt trước đó trong ngày vẫn giữ. Lưu **giờ phút** 決裁, không chỉ 業務日. Chưa cần chọn ngày tương lai, để sau | Đồng ý | BR-PERM-01 (kiểm lúc chốt). Dòng せり đang chờ xác nhận sẽ rơi vào Q-TRD-05 |
| Q-PTY-06 | Không muốn 事務局 (SETTLE) tự đổi 保証金. **Chỉ 照合部門長 (STL-HEAD) được đổi** 保証金 / 参加上限; có audit, không cần thêm người kiểm. Không cần thêm luồng duyệt mới | **Điều chỉnh** | `[Giả lập]`. **Hỏi 経理部**: số 保証金 trong hệ thống có phải khớp với sổ 経理 hằng kỳ không. Khớp thì cần thêm mục so sánh (báo giá riêng) |
| Q-PTY-07 | Có MFA khi 確認 đổi 参加上限 (thông số tiền, tháng 1–2 lần, không vướng cao điểm) | Đồng ý | NFR-SEC-01 |
| Q-DEL-01 | Không ghi ngoại lệ offline. Lúc mất mạng: ghi lên 引渡し確認票 giấy có số thứ tự, các ô giống màn hình; **nhập lại trong ngày, trước 日次締め**. Giao bình thường (không ngoại lệ) vẫn phải chạy offline | Đồng ý (có điều kiện) | `[Giả lập]`; tiết kiệm 0,3 MM. Nối Q-STL-02 |
| Q-DEL-02 | 7 業務日 là đủ. 引渡し残 thường xong trong 1–3 ngày; quá 7 ngày thì văn phòng xử lý | Đồng ý | `[Giả lập]` |
| Q-DEL-03 | Mặc định nút 「本人」. Có thêm nút 「代理」 + ô gõ tên ngắn (tùy chọn) cho tài xế / nhân viên của người mua | Đồng ý | `[Giả lập]`; không bắt gõ tên thật cho mọi lần giao |
| Q-DEL-04 | Cho phép, với điều kiện: 配送 **chỉ nhập số lượng thực giao** (不足 / 返品). Tiền tự tính lại theo **đơn giá đã chốt**, 配送 không nhập hay sửa giá / tiền. Mọi bút toán phải được 照合 確認済 thì mới 締め. Chỉ đi theo hướng giảm, giao thừa xem Q-DEL-06 | **Điều chỉnh** | Luật 4 (reverse/delta). Bản ADR-004 chỉ ghi vai TRADE là việc sửa tài liệu nội bộ |
| Q-DEL-05 | Không tự trả số lượng về lô. Hàng trả về phải có người xem lại chất lượng (đá tan, cá dập) rồi mới quyết bán lại hay hủy, qua 返品・廃棄 | Đồng ý | Luật 3: chất lượng do người quyết |
| Q-DEL-06 | 過剰 chỉ ghi nhận. Bình thường thì thu hàng về; người mua nhận thêm thì 取引 làm 当日訂正 / 修正申請 | Đồng ý | |
| Q-DEL-07 | Lưu ở bảng nào là việc nội bộ, không phải câu của khách. Nhu cầu: báo cáo tranh chấp (RPT-04) **lọc được các vụ 継続協議** và xem được lịch sử từng lần họp | — | Nếu chỉ còn trong `audit_logs` mà báo cáo không lọc được → không đạt |
| Q-DEL-08 | Có MFA, làm giống bước xác nhận tranh chấp. Do trưởng bộ phận làm ở bàn, ít lần | Đồng ý | Luật 3 |
| Q-DEL-09 | Đếm một lần ở mục ngoại lệ, có đường bấm sang bút toán tiền. Người khóa không được thấy một việc nằm ở hai mục | Đồng ý | |
| Q-STL-01 | Bắt buộc khóa theo thứ tự ngày, chặn khi ngày trước còn mở | Đồng ý | BR-CLOSE-01 |
| Q-STL-02 | Đồng ý không làm sổ phát phiếu trên hệ thống. Nhưng checklist phải có **một mục tick riêng**: 「未入力の引渡し確認票なし（紙台帳で確認）」, người khóa tick mới khóa được. Sổ giấy đánh số do 配送 giữ | **Điều chỉnh** | `[Giả lập]`; gần như không tốn thêm (một dòng checklist) |
| Q-STL-03 | Có, 0 件 vẫn phải tick. Tick nghĩa là "tôi đã xem", không phải "có việc" | Đồng ý | |
| Q-STL-04 | **Không cho 運用部門長 duyệt cấp 1 thay bất cứ lúc nào.** Cấp 1 = 照合部門長, vắng thì **người 代行 đã chỉ định trước** (`delegations`). 運用部門長 là cấp 2. Không có 代行 thì chờ. Chợ chỉ có một 運用部門長, nên điều kiện "cấp 2 là OPS-HEAD khác" sẽ làm kẹt yêu cầu | **Không đồng ý** | Khớp #33 (261118) và PRM-033. Nhân sự 代行: **hỏi 経営陣** chỉ định trước UAT |
| Q-STL-05 | Chặn. Lô không đủ hàng mà vẫn tăng số lượng nghĩa là sổ đang sai ở đâu đó, phải tra trước (có khi phải sửa số lượng lô trước) | Đồng ý | |
| Q-RULE-02 | Không phải câu của khách (lưu ở đâu là thiết kế). Nhu cầu: đề nghị hủy version tra được (ai, khi nào, lý do) trong báo cáo cho ban lãnh đạo | — | |
| Q-RULE-03 | Tạm đồng ý: 代表取締役 + 運用部門長 + 照合部門長. Danh sách nằm ở cấu hình, IT của chợ tự đổi được | Đồng ý (tạm) | `[Giả lập]`. **Hỏi 経営陣**, chốt cùng workshop E-14 |

### Tổng hợp

| Kết quả | Số câu | ID |
|---|---|---|
| Đồng ý (kể cả có điều kiện) | 20 | Q-LOT-01, Q-SC0302-02, Q-LOT-03, Q-PTY-01..05, Q-PTY-07, Q-DEL-01, 02, 03, 05, 06, 08, 09, Q-STL-01, 03, 05, Q-RULE-03 |
| Điều chỉnh | 5 | Q-TRD-05, Q-INC-01, Q-PTY-06, Q-DEL-04, Q-STL-02 |
| Không đồng ý | 3 | Q-TRD-02, Q-INC-02, Q-STL-04 |
| Không phải câu của khách | 3 | Q-INC-03, Q-RULE-02, Q-DEL-07 (chỉ nêu nhu cầu báo cáo) |

Cần bộ phận khác xác nhận:
- **経理部:** Q-TRD-02 (hệ số thuế), Q-INC-01 (giờ về của CSV ngân hàng), Q-INC-02 (ghi 請求 cho khoản nhập muộn), Q-PTY-06 (保証金 có phải khớp sổ 経理 không).
- **運用部門 (目利き主任):** Q-LOT-03.
- **経営陣:** Q-RULE-03, người 代行 cho Q-STL-04.

Không được hỏi lần này (để PL hỏi tiếp nếu cần): Q-LOT-02, 04, 05, A-LOT-01, Q-SC0302-01, 03, Q-TRD-01, 03, 04, A-TRD-01, 02, Q-RULE-01, Q-API-01, 02.

---

## 3. Điều tôi lo nhất nếu đi tiếp như hiện tại

1. **(照合部門長) Quy tắc 完納 cho giao dịch nhập muộn (Q-INC-02).** Cài "không thưởng" cứng thì người mua bị phạt vì lỗi nhập của chợ. Lần đầu bị khiếu nại, chúng tôi phải sửa tay ngoài hệ thống, đúng thứ BR-INC-01 muốn tránh. Phải chốt cùng 経理部 trước khi code engine thưởng.
2. **(照合部門長 / 運用部門長) Người duyệt và người 代行 (Q-STL-04).** Spec đang cho 運用部門長 thay cấp 1 lúc nào cũng được, mà chợ chỉ có một 運用部門長. Vừa sai quy tắc đã thống nhất (#33, PRM-033), vừa kẹt yêu cầu sửa. Danh sách người 代行 phải có trước UAT.
3. **(取引担当) Màn xác nhận せり (Q-TRD-05).** Chỉ có nút "hủy" thì một lần gõ nhầm số là mất một lô đã bán, cá phải せり lại giữa giờ cao điểm. Cần hai nút như mục 1.

**Status:** DONE
