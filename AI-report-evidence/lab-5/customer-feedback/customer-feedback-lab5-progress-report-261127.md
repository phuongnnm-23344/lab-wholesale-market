# Phản hồi của khách hàng: báo cáo tiến độ Iteration 1 (LAB-5)

- Người trả lời: 株式会社 桜水産市場 (agent `customer-end-user`), tổng hợp ý kiến 照合部門長 / 取引担当 / IT. Ngày: 2026-11-27.
- Đọc: `lab-wholesale-market/ja/progress-report.md` (bản gửi khách). Không sửa file báo cáo.
- Đối chiếu: `customer-feedback-lab5-priority-261126.md` (câu trả lời của chúng tôi về ưu tiên / S1 / rủi ro), `qa-for-customer-ja.md` (E-14), RFP.
- Quy ước nguồn: ID RFP = có trong RFP / quy chế. `[Giả lập]` = RFP để mở, trả lời theo vai.

---

## 1. Đọc có hiểu ngay S1 xong gì / chưa xong gì / sang S2 không?

**照合部門長:** Hiểu được. Đoạn 要約 (dòng 13) và bảng 1.1 là đủ. Bảng 1.1 đem đúng 4 điều kiện "dùng thử được" mà chúng tôi đưa ra hôm 11-26 ra chấm: 2 điều kiện đạt (tra tư cách bằng bàn phím, đổi người bằng PIN), 2 điều kiện đạt một phần (danh sách thật, đăng ký 許可/承認 + 一時停止). Đây là phần chúng tôi đọc kỹ nhất.

Chỗ còn vướng:
- Bảng mục 1 (Done / In Review / Blocked / Todo, SWP, Hours) là ngôn ngữ của Sun*. Ban lãnh đạo chợ không đọc được "SWP", "In Review", "API", "IAM テーブル", "MFA トークン", "テスト用の鍵で署名". Đề nghị: trang đầu chỉ để 要約 + bảng 1.1 + 1.2 + danh sách việc phía chợ phải làm; bảng課題, burndown, bảng 担当別 chuyển xuống phụ lục.
- Bảng 担当別 (BE-6 vượt 40 giờ, FE-4 "入力部品を自作", QA-1 chờ) là chuyện quản lý nội bộ của Sun*. Chúng tôi không cần biết từng người làm bao nhiêu giờ; đưa vào bản gửi khách thì ban lãnh đạo sẽ hỏi "đội có đủ người không". Nếu muốn nói về năng lực đội thì nói một câu ở mức đội.
- 1.2 (việc S2 theo kế hoạch, không phải trễ) viết rõ, chúng tôi chấp nhận. MFA thật ở S2 đúng như chúng tôi đã đồng ý (danh sách thao tác hỏi MFA giữ nguyên, L4-A07).

## 2. Có thấy rõ cam kết S3 相対 không bị dời không?

**取引担当 / 市場経営陣:** Thấy, câu in đậm ở 要約 và R-01 là đúng điều chúng tôi yêu cầu (cắt せり / báo cáo phụ / Muốn có, không dời 相対). Nhưng chưa đủ yên tâm ở 3 chỗ:

1. **R-01 nói "新規分を 64 時間減らします" nhưng không nói giảm cái gì.** 11-26 chúng tôi đã xin "nói trước phần nào bị đẩy đi đâu". Cần ghi tên các việc S2 bị đẩy và đẩy sang sprint nào (vd. có phải một phần màn 受付 tablet hay 規則版 không).
2. **R-07 rút BrSE-1 + 1 BE + 1 FE sang làm thiết kế từ 02-15**, trong khi S2 đã gánh thêm 64 giờ. Đọc hai rủi ro cạnh nhau, chúng tôi lo S2 không đủ người, rồi phần dư lại tràn vào S3. Cần một câu: sau khi rút người, S2 còn bao nhiêu năng lực và vẫn đủ cho 6 課題 mang sang + phần S2 đã giữ lại.
3. **Điều gì của FG-01 thật sự phải xong trước 03-01 để 相対 chạy.** Theo chúng tôi, 相対 cần kiểm tra 有効 / 一時停止 / 失効 (BR-PERM-01) — tức là phải có 一時停止 (#425). Còn 却下 申請 承認 (#264) nếu câu hỏi #24 trả lời trễ thì có chặn S3 không? Xin ghi rõ: "#24 trễ → không ảnh hưởng ngày bắt đầu S3" hay ngược lại.

R-12 (#432 tách trước 02-26, trước S3) thì tốt.

## 3. Các việc và hạn giao cho phía chợ có làm được không?

| Rủi ro | Hạn trong báo cáo | Ý kiến của chợ |
|---|---|---|
| R-02 (#24 弁明) | Sun* gửi 02-15, chợ trả lời 02-17 | **Không thực tế như đang viết.** (a) #264 bị chặn từ 02-10, sao đợi tới 02-15 mới gửi lại? Gửi ngay ở buổi demo S1 02-12. (b) `[Giả lập]` 照合部門長 trả lời được cách làm hiện tại trong 2 ngày. Nhưng nếu câu hỏi chạm vào giải thích 業務規程 (có bắt buộc cho người nộp đơn giải trình trước khi từ chối không) thì phải lên 経営陣, cần khoảng 1 tuần → thực tế là **02-19**. (c) "現在の前提で書面確定" nhưng báo cáo không nói tiền đề hiện tại là gì (có 弁明 hay không). Phải ghi tiền đề ra thì chúng tôi mới chọn "theo tiền đề" được. |
| R-03 (actors.csv đợt 2, 02-19) | IT gửi trước 02-19 (ご提案) | **Làm được một phần.** `[Giả lập]` Dòng có mã khác định dạng: IT sửa được trong tuần (bảng đối chiếu mã, C.4). Dòng **không có 失効日**: nhiều khi sổ gốc của chợ cũng không ghi, IT không tự điền được; 照合事務局 phải tra hồ sơ giấy, cần tới **02-26**. Xin Sun* đề xuất cách xử lý dòng không có 失効日 (vd. nhập ở trạng thái "要確認", không cho giao dịch tới khi điền) để chúng tôi quyết. Cũng xin ghi rõ 02-19 chỉ là phần sửa actors.csv, hay gồm cả 6 file còn lại của đợt 2 — nếu là cả 6 file thì không kịp. |
| R-08 (E-14, 02-15) | 経営陣 quyết trước 02-15 | **Sát quá.** E-14 vốn hạn 01-15 ở workshop (`qa-for-customer-ja.md`). Báo cáo không nói vì sao giờ thành 02-15, ban lãnh đạo đọc sẽ tưởng là việc mới. Xin ghi: "01-15 workshop で未決のため". `[Giả lập]` 02-15 là thứ Hai, ngày S2 bắt đầu; 経営会議 của chợ họp chiều thứ Ba → quyết được ngày **02-16**. Trong lúc chờ, Sun* giữ cả hai nhánh N1/N2 1–2 ngày đầu S2 như đã làm. Ý kiến làm việc của chúng tôi vẫn như 11-26 (rollback vẫn đếm, vẫn báo, không bị chặn; bản thứ 5 thì chặn). |
| R-09 (経理部, 03-05) | Gửi danh sách thứ Hai hằng tuần, chợ trả lời trước 03-05 | **Làm được.** Đây là điều chính chúng tôi đã nhận (một đầu mối = 照合部門長, buổi riêng với 経理部). 03-05 trước quyết toán tháng 4–5 nên hợp lý. Chỉ sửa cách viết (xem mục 4). |
| R-10 (thiết bị bến, 02-26) | Mượn 1–2 tablet cho demo S2, chốt model cuối tháng 2 | **Làm được** với điều kiện: `[Giả lập]` cần biết trước **02-19** cấu hình tối thiểu (hệ điều hành, kích thước màn) để IT xem máy hiện có có chạy được không; danh sách máy hiện có vẫn phải hỏi lại IT. Cột phụ trách gộp hai việc: mượn máy (IT, trước buổi demo) và chốt model (IT + 運用部門, 02-26). Xin tách. |
| R-11 (Golden Week, 03-31) | Giữ lịch 経理部 S6–S7, demo S7 ngày 05-07 | **Làm được, đồng ý 05-07.** Nhưng phụ trách nên là **照合部門長 + 経理部** (người thật sự giữ lịch), 経営陣 chỉ duyệt. Lưu ý `[Giả lập]`: chợ vẫn mở phần lớn ngày Golden Week, ngày 05-06/05-07 hàng về nhiều sau nghỉ; demo 05-07 phải ở khung 13:00–14:30 như đã thống nhất. |
| R-07 (review 02-22 tuần, 03-01 tuần) | Chợ review thiết kế 1 lần/tuần | **Làm được**, khung 13:00–14:30, tối đa 90 phút. Lưu ý 02-23 (thứ Ba) là 天皇誕生日. Gửi tài liệu trước ít nhất 2 ngày làm việc. |

## 4. Câu nào đọc như chợ đã trả lời / đã đồng ý mà thực tế chưa?

1. **"ご確認済みの設計"** (mục 2 ý 2(a), R-07). Đọc như chợ đã xác nhận thiết kế phiên đăng nhập máy dùng chung rồi lại đòi xem lại, và R-07 nói "ご確認済みの設計にも後から確認が入ることがある" như lỗi của chợ. Nếu chưa có biên bản xác nhận thì bỏ "ご確認済み"; nếu có thì dẫn số biên bản. Chúng tôi không muốn ban lãnh đạo đọc thấy chợ bị coi là nguyên nhân trễ mà không có căn cứ.
2. **"失効日のない行は第2弾で受領する前提で除外"** (bảng 1.1). Chợ chưa hứa gửi các dòng này ở đợt 2 (xem R-03). Sửa thành "第2弾での受領をご相談中".
3. **R-09 "期限を過ぎた項目は暫定前提で書面確定とします".** Đọc như Sun* tự quyết. Chính chúng tôi đã đề nghị chọn "暫定前提どおり" bằng văn bản, nhưng **người ký phải là chợ** (照合部門長; phần thuế thì 経理部 xác nhận). Sửa thành "貴社に書面でご選択・ご確認いただき確定".
4. **R-02 "現在の前提で書面確定をご提案"**: ổn về chữ (là đề xuất), nhưng thiếu nội dung tiền đề — xem mục 3.
5. **R-08 "02-15 までに 1 案をご決定ください"**: không sai, nhưng phải nói đây là hạn đã lùi từ 01-15, nếu không sẽ giống chợ đã nhận một hạn mới.
6. **R-10 "既存のタブレット 1〜2 台をお借りして"**: đây là đề xuất của chúng tôi `[Giả lập]` nhưng chưa xác nhận máy cụ thể. Nên viết "お借りできる前提で、機種は貴社 IT にご確認中".
7. Bảng 1.1 ghi "（弊社案）" là đúng mực — các điều kiện đó chúng tôi nêu ở dạng ý kiến làm việc, chưa phải tiêu chí nghiệm thu đã ký (ACC-GATE-01). Giữ nguyên.
8. Ghi chú ở dòng 11 (mọi tiến độ là mô phỏng, sự kiện phía chợ trong nhật ký là giả định) là cần thiết, giữ nguyên.

## 5. Thuật ngữ và văn phong

**照合部門長:**
- **許可 / 承認 dùng đúng**: 許可 cho 仲卸, 承認 cho 売買参加者, ghi là hai bản ghi riêng (dòng 9). Tốt (BR-PERM-01, TBL-ACTOR-01).
- **"承認の確認・却下" (#264, #307, dòng 35) dễ đọc nhầm.** "承認の却下" có thể hiểu là bác một quyết định duyệt nội bộ. Đề nghị viết **"承認申請の確認・却下"** để rõ là đơn xin 承認 của 売買参加者.
- **Không nhất quán 決裁 / 確認**: 許可 thì "登録・決裁", 承認 thì "登録・確認". Nếu hai luồng duyệt nội bộ khác nhau thật (vd. 承認 chỉ cần 確認 của 照合部門長, 許可 cần 決裁) thì ghi một câu giải thích; nếu giống nhau thì dùng cùng một chữ. `[Giả lập]` Theo cách làm của chợ: đăng ký 許可 và 承認 đều qua 決裁 của 照合部門長; "確認" chỉ dùng cho bước người thứ hai kiểm tra nội dung nhập.
- **"買受人のコード" (dòng 36)**: RFP dùng 買出人 / 売買参加者 / 仲卸, không có 買受人. Ở bàn 相対 người mua là 仲卸 hoặc 売買参加者 → viết **"買い手（仲卸・売買参加者）のコード"**.
- **"照合事務局"** đúng (ACT-06). Đầu mối thì ghi "照合部門長" — đúng như chúng tôi chỉ định.
- **Văn phong**: lịch sự, không đổ lỗi trừ chỗ "ご確認済みの設計" (mục 4.1). Nhưng quá nhiều chữ kỹ thuật và tiếng Anh cho ban quản lý chợ: SWP, Hours, In Review, Blocked, Todo, API, IAM, MFA トークン, needs-split, FE-1/BE-6, link GitHub, tên script Python. Gửi 経営陣 thì cần trang đầu bằng ngôn ngữ nghiệp vụ; phần kỹ thuật để phụ lục cho IT của chợ.
- Đoạn "数値の出所" (dòng 15) với tên script: IT của chợ đọc được, ban lãnh đạo thì không cần — chuyển xuống phụ lục.

---

## Bảng góp ý

| # | Vai | Output / vị trí | Ý kiến | Mức cần | Nguồn |
|---|---|---|---|---|---|
| 1 | 取引担当 / 市場経営陣 | R-01 | Ghi tên các việc bị đẩy khỏi S2 (64 giờ) và sprint nhận | Bắt buộc | FR-AITAI-01 (相対 chính); yêu cầu 11-26 `[Giả lập]` |
| 2 | 取引担当 | R-01 / R-07 | Nói rõ năng lực S2 sau khi rút 3 người sang thiết kế; điều gì của FG-01 phải xong trước 03-01; #24 trễ có chặn S3 không | Bắt buộc | BR-PERM-01 |
| 3 | 照合部門長 | R-02 | Gửi lại #24 ngay 02-12, không đợi 02-15; ghi rõ tiền đề hiện tại; hạn thực tế 02-19 nếu phải lên 経営陣 | Bắt buộc | `[Giả lập]` |
| 4 | IT / 照合事務局 | R-03, bảng 1.1 | Dòng không có 失効日 cần 照合事務局 tra giấy → 02-26; Sun* đề xuất cách nhập "要確認"; làm rõ 02-19 chỉ là actors.csv; bỏ "受領する前提" | Bắt buộc | C.4, BR-PERM-01; hạn `[Giả lập]` |
| 5 | 市場経営陣 | R-08 | Ghi E-14 đã lùi từ 01-15; hạn khả thi 02-16 (経営会議), giữ N1/N2 tới đó | Muốn có | GOV-RULE-01, E-14; ngày họp `[Giả lập]` |
| 6 | 照合部門長 / 経理部 | R-09 | Đổi "書面確定とします" → chợ chọn và ký bằng văn bản | Bắt buộc | ACC-GATE-01, E-06 |
| 7 | IT | R-10 | Tách mượn máy / chốt model; Sun* gửi cấu hình tối thiểu trước 02-19 | Muốn có | E-05; `[Giả lập]` |
| 8 | 照合部門長 | R-11 | Phụ trách = 照合部門長 + 経理部; 05-07 demo ở khung 13:00–14:30 | Muốn có | `[Giả lập]` |
| 9 | 照合部門長 | Mục 2 (a), R-07 | Bỏ "ご確認済みの設計" nếu không có biên bản; không ngụ ý chợ gây trễ | Bắt buộc | `[Giả lập]` |
| 10 | 照合部門長 | Dòng 24–25, 35 | "承認の確認・却下" → "承認申請の確認・却下"; thống nhất 決裁 / 確認 giữa 許可 và 承認 | Bắt buộc | BR-PERM-01, TBL-ACTOR-01 |
| 11 | 取引担当 | Dòng 36 | "買受人" → "買い手（仲卸・売買参加者）" | Bắt buộc | Thuật ngữ RFP (買出人 / 売買参加者 / 仲卸) |
| 12 | 市場経営陣 | Toàn bài | Trang đầu bằng ngôn ngữ nghiệp vụ; bảng課題 / burndown / 担当別 / script xuống phụ lục; bỏ bảng giờ từng người khỏi bản gửi khách | Muốn có | — |

---

## Điều chúng tôi lo nhất nếu đi tiếp như hiện tại

1. **(取引担当) S2 quá tải ngầm rồi tràn sang S3.** S2 nhận 64 giờ mang sang, đồng thời rút 3 người làm thiết kế, mà báo cáo không nói cắt gì. Lời hứa "không dời 相対" chỉ có giá trị khi thấy được phần bị cắt.
2. **(照合部門長) Hạn giao cho chợ quá sát và một vài câu ngụ ý chợ đã đồng ý.** 2 ngày cho câu hỏi về quy chế, hạn quyết E-14 trùng ngày bắt đầu S2, dòng thiếu 失効日 "giả định nhận ở đợt 2". Nếu không sửa, ban lãnh đạo sẽ thấy chợ bị gán trễ hạn mà mình chưa nhận.
3. **(IT) Dữ liệu người tham gia không có 失効日.** Không có cách xử lý rõ thì tới lúc chuyển dữ liệu thật sẽ có người mua "không rõ còn hiệu lực" ở bàn 相対.

**Status:** DONE
