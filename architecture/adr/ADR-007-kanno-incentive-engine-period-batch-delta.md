---
id: ADR-007
title: Engine 完納奨励金 — tính xác định theo kỳ, đóng băng ở 期ロック, sửa sau khóa thành DELTA kỳ sau
type: adr
status: accepted
version: "1.0.0"
updated_by: phuongnnm-23344
updated: 2026-11-26
related: [ARCH-001, ADR-004, ADR-005, ADR-006, BR-INC-01, FR-INC-01, FR-INC-03, PRM-040, PRM-043, PRM-053, PRM-055, DEC-011, DEC-012, L4-A04, OPEN-L4-02, E-02, E-06]
---

# ADR-007 — Engine 完納奨励金: tính xác định theo kỳ, đóng băng ở 期ロック, sửa sau khóa thành DELTA kỳ sau

| Trạng thái | Ngày | Người quyết | Thay thế |
|---|---|---|---|
| **Accepted** (trừ các điểm chờ khách ở §6) | 2026-11-26 | Người dùng (L4-D09), PL đề xuất | — |

## 1. Bối cảnh

- 完納奨励金 (thưởng thanh toán đủ, đúng hạn) theo BR-INC-01 / B.5: hệ số thuế **110/100**, làm tròn xuống JPY, không ân hạn, theo JST / 業務日; quá hạn = 0; điều chỉnh sau khóa sổ → **差分 ở kỳ sau**. Test vector INC-EDGE-01..03 (C.3). BR-INC-01 **không giới hạn** điều chỉnh theo năm TC.
- LAB-1 đã chốt cách tính (DEC-011, DEC-012, PRM-040..043, PRM-053): **2 bảng tỷ lệ** theo loại người tham gia; bậc tra theo **適格金額 税抜**; số chuẩn xét 完納 = 期のお支払額 hệ thống tính (thuế 1 lần / người × kỳ × suất); dòng 端数調整 thuế vào batch kế toán khi 期ロック; delta tính lại kỳ cũ theo **version của kỳ cũ**, không hồi tố 完納; delta âm mang sang tới hết năm TC (PRM-043 (c)); 消込 trễ có thể xét lại 完納 qua duyệt 2 cấp (PRM-055).
- Gán tiền vào kỳ (L4-A04 (2)): kỳ = tháng của **業務日 của GD gốc** (`trades.trade_date` — ADR-005 §2.8); 入金 sau 支払期日 vẫn gán kỳ cũ nhưng kỳ đó không 完納; FIFO khi chưa có 請求番号 (E-02); màn 期ロック hiện tiền đã gán vào kỳ nào (OPEN-L4-02).
- Prototype lệch ở phần tiền (mức Cao): 1 bảng tỷ lệ (D01), tra bậc trên số 税込 (D02), gán 入金 theo cửa sổ ngày (D03), 1 thuế suất, không 端数調整 (D04), 支払期日 cố định ngày 10 (D05), delta âm không mang sang (D23). Hai điểm prototype **làm đúng** và to-be phải giữ: tính lại **mọi kỳ đã khóa** trước kỳ đang khóa (0023 `compute_incentive_rows`), gán kỳ theo **ngày của GD gốc** (0022 `period_buyer_amounts`) — bảng lệch N15, N16.
- Khối lượng nhỏ: ~100–170 người tham gia × 1 kỳ / tháng.

## 2. Quyết định

### 2.1 Hàm thuần, hai bước

1. **Hàm thuần, xác định trong DB:** cùng đầu vào (GD hiệu lực gán vào kỳ, bảng phân bổ 入金, version quy chế của kỳ, lịch, 修正申請 KANNO / INCENTIVE đã duyệt) → cùng kết quả. Không đọc đồng hồ. Chạy đồng bộ trong một transaction (vài giây ở khối lượng này) — không cần hạ tầng batch riêng.
2. **Hai bước, không có trạng thái trung gian:**
   - *試算* (không ghi bảng nghiệp vụ, chạy bao nhiêu lần cũng được): hiện 期のお支払額, tiền đã gán vào kỳ, 完納 / không / **要確認**, bậc, thưởng, delta kỳ trước, và **tiền nào đã gán vào kỳ nào**. Mỗi lần 試算 ghi một dòng 監査ログ (giờ, mã băm đầu vào, tổng thưởng) để so với lần trước khi 入金 CSV đến muộn [Customer giả lập, 2026-11-25 — #6].
   - *期ロック* (照合部門長 + MFA, luôn hỏi lại mã — ADR-002 §2.2): trong **cùng transaction** chốt các dòng 要確認 (§2.6), tính chính thức, ghi kết quả (append-only, gắn version quy chế + mã băm đầu vào), đóng kỳ, sinh dòng 端数調整 cho batch IF-ACC-01, xếp email kết quả vào outbox. Một kỳ chỉ khóa một lần. Bỏ bước "計算して記録" của prototype (N13).

### 2.2 Công thức (chi tiết ở Technical Design 完納奨励金)

3. 期のお支払額 = Σ tiền 税抜 gán vào kỳ (GD có `trade_date` trong kỳ + REVERSE / DELTA có `period_id` = kỳ, ghi **trước** khi kỳ khóa) theo suất + thuế tính **một lần trên tổng theo người × kỳ × suất** (thủy sản tươi là thực phẩm → 軽減税率 8%; làm tròn theo tham số quy chế `TAX_ROUNDING`, mặc định DEC-011).
4. 完納 = tiền đã phân bổ vào kỳ có ngày nhận ≤ 支払期日 ≥ 期のお支払額. 支払期日 = ngày 10 tháng sau; rơi **ngày ngân hàng nghỉ** → lùi về **ngày ngân hàng mở trước** (`PAYMENT_DUE_RULE` = `PREV_BANK_DAY`, lịch `is_bank_open`) — giả định [PL]: hạn chuyển khoản theo ngày ngân hàng, chờ 経理部 xác nhận (Q-ARCH-11).
5. Bậc = tra **適格金額 税抜** trên bảng tỷ lệ của **loại người tham gia** (仲卸 / 売買参加者) thuộc version của kỳ. **Thưởng = floor(適格金額 × 交付率 × 110/100).** Hệ số 110/100 là **税係数 cố định của RFP** (BR-INC-01, B.5, 13-06), áp như nhau bất kể thuế suất của hàng (8%) — giả định ghi rõ, không đọc từ `tax_rates`. Ví dụ: 適格金額 1.000.000 × 0,9% × 110/100 = 9.900 (期のお支払額 tương ứng 1.080.000 với thuế 8%). 税区分 của 完納奨励金 khi xuất IF-ACC-01 chưa rõ → Q-ARCH-12 (nối E-01, E-06).

### 2.3 Gán kỳ cho điều chỉnh — hai trục thời gian (C-02)

6. Mỗi dòng REVERSE / DELTA có **hai ngày**: `business_date` = 業務日 **áp / ghi sổ** (ngày chưa khóa sớm nhất — dùng cho sổ ngày, 日次精算, IF-ACC-01) và `period_id` = **kỳ của GD gốc** (hàm ghi điền từ `trades.trade_date`, người dùng không chọn).
7. Kỳ gốc còn **OPEN** → dòng tính vào 期のお支払額 kỳ gốc và vào thưởng khi khóa kỳ gốc. Kỳ gốc đã **LOCKED** → dòng **không** vào 期のお支払額 kỳ đang mở; chỉ đi DELTA (§2.4). Một đồng chênh chỉ được đếm ở một nơi. Số người mua phải trả / được trả thêm của kỳ đã khóa hiện thành dòng 「前期以前の調整」 trên thông báo kỳ kế tiếp, không cộng vào số xét 完納 kỳ mới (cách thu: OPEN-DB-08).
7a. **GD 後入力 (`LATE_ENTRY`) ghi khi kỳ của `trade_date` đã LOCKED — không đi DELTA** (Q-INC-02, khách không đồng ý giả định "không có GD lúc khóa → không 完納" [Customer giả lập, 2026-11-25]): hàm ghi đọc kỳ gốc `FOR SHARE` (tuần tự với 期ロック) và ghi `trades.incentive_period_id` = kỳ chứa 業務日 ghi sổ (luôn `OPEN`). GD đó vào 期のお支払額, 完納 (theo **支払期日 của kỳ đó**) và thưởng của kỳ đó như GD thường; kỳ gốc giữ nguyên kết quả. **Một quy tắc** cho người có và không có GD ở kỳ gốc (TV-13, TV-15). `trade_date` / `business_date` cho sổ ngày, IF-ACC-01 không đổi. Cách ghi trên 請求: chờ 経理部 + 照合部門長 (giả định dòng 「前期分の後入力」). Effort +0,5 MD. Chỉ áp cho GD **mới** nhập muộn; sửa GD đã có (修正申請 TRADE) vẫn theo §2.3-7 / §2.4.

### 2.4 DELTA — phạm vi tính lại (C-01)

8. Khi khóa kỳ N, engine tính lại **mọi kỳ đã khóa, không giới hạn năm TC**, có đầu vào đổi sau thời điểm khóa của kỳ đó: điều chỉnh có `period_id` = kỳ đó ghi sau `locked_at`, phân bổ / đảo phân bổ 入金 vào kỳ đó sau khi khóa, 修正申請 KANNO / INCENTIVE đã duyệt cho kỳ đó. Số tiền của 修正申請 INCENTIVE là **đầu vào cộng thêm** của hàm thuần, nên lần tính lại sau không đảo nó (TV-14). Tính lại theo **version của kỳ cũ**, so với tổng đã ghi nhận của kỳ cũ (MAIN + các DELTA trước), sinh dòng `DELTA` (gắn `ref_period`) vào kỳ N. 完納 của kỳ cũ giữ nguyên (không hồi tố) — trừ §2.5.
9. **Giới hạn năm TC chỉ áp cho việc trừ dần delta âm, không áp cho phạm vi tính lại.** Delta âm trừ dần (CARRY) vào thưởng các kỳ sau tới hết năm TC của kỳ ghi nhận; phần âm còn lại cuối năm ghi dòng `CARRY_EXPIRED` và hiện ở RPT-07 để 照合部門 xử lý (cách thu: Q-ARCH-08). `CARRY_EXPIRED` là dòng **dương đóng số dư** ở kỳ cuối năm TC (đưa Σ của người đó về 0), `ref_period_id` = kỳ phát sinh delta; RPT-07 hiện trị tuyệt đối là phần chưa thu.
10. **Delta qua năm TC:** GD kỳ 2028-03 (năm TC 2027) được sửa sau khi kỳ 2028-03 khóa → DELTA tính bằng version của kỳ 2028-03 nhưng **ghi ở kỳ đang khóa** (vd. 2028-05, năm TC 2028), thuộc năm TC 2028 cho CARRY và báo cáo. Không có kỳ đã khóa nào bị bỏ qua chỉ vì đã sang năm TC mới.

### 2.5 修正申請 KANNO và INCENTIVE — ngoại lệ có duyệt 2 cấp

11. **KANNO** (PRM-055, FR-CORR-02): tiền về **trước** 支払期日 nhưng 消込 trễ / gán sai (có sao kê làm chứng cứ) làm kỳ bị xét "không 完納". 修正申請 phạm vi KANNO, **luôn 2 cấp** (照合部門長 → 運用部門長, MFA). Kỳ đích đã khóa → ở 期ロック kế tiếp engine tính lại kỳ đích với 完納 theo kết quả duyệt, version của kỳ đích, sinh dòng `DELTA` gắn `correction_id` + lý do. Đây là **ngoại lệ có duyệt** của nguyên tắc "không hồi tố 完納" — chỉ đường này được đổi 完納 của kỳ đã khóa. Kỳ đích chưa khóa → không cần KANNO, xử lý ở bước 要確認 trước khóa (§2.6).
12. **INCENTIVE** (luôn 2 cấp; tối đa một yêu cầu KANNO / INCENTIVE đang chờ cho mỗi người × kỳ): sửa tiền thưởng của kỳ đã khóa bị tính theo **tỷ lệ áp sai** (version sai đã được duyệt — R-L4-01, ADR-006 §2.5). Engine không tự phát hiện được (với engine, version đã duyệt là "đúng"), nên phải có yêu cầu từng người × kỳ: số tiền điều chỉnh + lý do + version tham chiếu → dòng `DELTA` gắn `correction_id` ở 期ロック kế tiếp. **Số tiền INCENTIVE cố định, không tính lại theo 適格金額 mới**: nếu sau đó 適格金額 của kỳ đó đổi (TRADE / LATE_ENTRY) mà khoản sửa tỷ lệ cũng phải đổi theo, 照合部門 lập thêm một 修正申請 INCENTIVE mới (TV-14).

### 2.6 要確認 trước khóa — 「手数料差引の疑い」

13. Engine **không tự kết luận** mất 完納 khi nghi người mua tự trừ phí chuyển khoản: thiếu tiền ≤ `KANNO_FEE_SUSPECT_MAX_JPY` (file cấu hình — chỉ để đánh dấu, không đổi tiền) và có 入金 trong hạn → dòng **要確認**. 照合部門長 chọn 完納 / 非完納 + lý do trong hộp thoại 期ロック → `kanno_basis = JUDGED`. Gợi ý mặc định là 非完納 vì phí chuyển khoản do người mua chịu (FQ-02, PRM-040); quy tắc chờ 経理部 xác nhận [Customer giả lập, 2026-11-25 — #7].

### 2.7 Phân bổ 入金, kỳ migrate, test vector

14. **Phân bổ 入金 → kỳ là bảng riêng (append-only)**: mặc định FIFO theo kỳ cũ nhất còn nợ; khi E-02 trả lời có 請求番号 thì phân bổ theo số đó. Hủy batch 入金 → dòng phân bổ đảo. **Đúng hạn theo 入金日 trên CSV ngân hàng** (`payments.paid_on`), không theo ngày import; 期ロック chỉ khi 業務日 > 支払期日 **và** 照合 tick 「支払期日分までの入金CSV取込済」 (lưu ở `incentive_runs`); 入金日 sau hạn không tính (không ân hạn), 入金日 ≤ hạn mà nhập sau khóa chỉ đổi 完納 qua 修正申請 KANNO (§2.5-11) — Q-INC-01 [Customer giả lập, 2026-11-25]; giờ CSV ngân hàng về: hỏi 経理部. 
15. **Kỳ đầu sau go-live và 2 kỳ migrate** (DEC-005): kết quả 2 kỳ migrate nạp như kỳ đã khóa, có version go-live → delta của chúng tính được như kỳ thường.
16. **Bộ test chuẩn chạy trong CI** — số liệu đủ ở `specs/system-design/database-design/INCENTIVE_DB.md` mục Test vector; tính lại bằng bảng tỷ lệ thật khi có fixture (L4-A02):

| # | Tình huống | Kết quả phải ra | ID |
|---|---|---|---|
| TV-01 | GD 2027-08-31, 修正申請 duyệt 2027-09-03 khi kỳ 2027-08 còn OPEN (期日 09-10) | `business_date` 2027-09-03, `period_id` 2027-08 → vào 期のお支払額 kỳ 08; không DELTA | C-02, L4-A04 (2) |
| TV-02 | GD 2027-08-20, duyệt 2027-09-20 sau khi kỳ 2027-08 khóa (09-14) | Không vào 期のお支払額 kỳ 09; khóa kỳ 09 → DELTA ref 2027-08 theo version kỳ 08; 完納 kỳ 08 giữ | C-02, INC-EDGE-02 |
| TV-03 | GD kỳ 2028-03 (năm TC 2027) sửa tháng 5/2028 | DELTA ghi ở kỳ 2028-05 (năm TC 2028), version kỳ 2028-03; âm thì CARRY tới 2029-03 | C-01, BR-INC-01, INC-EDGE-02 |
| TV-04 | Delta âm lớn hơn thưởng các kỳ còn lại của năm TC | CARRY từng kỳ; cuối năm dòng `CARRY_EXPIRED` **dương** đóng số dư về 0 (không đếm âm hai lần), RPT-07 hiện trị tuyệt đối là phần chưa thu | PRM-043 (c), m-05 |
| TV-05 | Kỳ 2027-09: ngày 10 = 2027-10-10 (CN) → 支払期日 2027-10-08; 入金 về 10-12 | Gán kỳ 09, `is_on_time = false`, không 完納, thưởng 0 | BR-INC-01, B.5 「超過時は0」, L4-A04 (2) |
| TV-06 | Nợ kỳ cũ + FIFO làm kỳ mới mất 完納 | Kỳ mới 非完納; màn 試算 hiện tiền gán vào kỳ cũ | OPEN-L4-02 |
| TV-07 | 修正申請 KANNO cho kỳ đã khóa, duyệt 2 cấp | DELTA gắn `correction_id`, 完納 mới, version kỳ đích | PRM-055, §2.5, INC-EDGE-02 |
| TV-08 | Kỳ 2028-05: ngày 10 = 2028-06-10 thứ Bảy (chợ mở, ngân hàng nghỉ) | 支払期日 = 2028-06-09 | PRM-054, M-03 |
| TV-09 | Lô nhận 01:30 ngày 2027-09-01; GD chốt 01:45 / 02:05 | Lô thuộc 業務日 2027-09-01 → kỳ 2027-09; GD 01:45 bị từ chối (trước 02:00); GD 02:05 thuộc 2027-09-01 | ADR-005 §2.2–2.3, L4-A09 |
| TV-10 | Thiếu tiền nhỏ, nghi trừ phí chuyển khoản | 要確認; 照合部門長 quyết + lý do; `kanno_basis = JUDGED` | §2.6 |
| TV-11 | 適格金額 1.234.567, 交付率 0,9% | floor(12.222,21) = 12.222 | INC-EDGE-03 |
| TV-12 | 適格金額 **đúng ngưỡng** 1.000.000 (cận dưới bậc 3, "以上") và 999.999; kỳ 2027-10 dùng version v3 (hiệu lực 2027-10-01), kỳ 2027-09 dùng v2 | 1.000.000 → bậc 3 (90 bp) → 9.900; 999.999 → bậc 2 (50 bp) → floor(5.499,99) = 5.499; kỳ 09 tra bảng v2, kỳ 10 tra bảng v3 — chọn version theo kỳ, không theo ngày khóa | INC-EDGE-01 |
| TV-13 | 紙伝票 của 2027-08-31 phát hiện 2027-09-20 (kỳ 08 đã khóa 09-14) → 修正申請 `LATE_ENTRY` duyệt 2027-09-21 → GD mới `trade_date` 08-31, `business_date` 09-21; người mua **có** GD kỳ 08 | `incentive_period_id` = kỳ 09: GD vào 期のお支払額 + 完納 + thưởng kỳ 09 (hạn kỳ 09); kỳ 08 **không** tính lại, không DELTA (bản 0.3.1: DELTA +1.980 — bỏ) | Q-INC-02, N-02, ADR-005 §2-8, §2.3-7a |
| TV-14 | 修正申請 `INCENTIVE` +2.000 cho kỳ 2027-10 (tỷ lệ áp sai) duyệt 2027-11-20; kỳ 11 khóa **2027-12-14**; 修正申請 `TRADE` cho GD kỳ 10 (+100.000 税抜) duyệt **2027-12-20** (sau khi kỳ 11 khóa) | 期ロック kỳ 11: DELTA +2.000 gắn `correction_id`; 期ロック kỳ 12: DELTA +990 — lần tính lại sau chỉ phản ánh thay đổi mới, **không đảo** +2.000 (số tiền INCENTIVE là đầu vào cộng thêm cố định). Nếu TRADE duyệt trước khi kỳ 11 khóa thì cả hai vào cùng lượt kỳ 11 → tổng DELTA +2.990, ghi 2 dòng: +2.000 gắn `correction_id` INCENTIVE + +990 không gắn | n-02, D-05, §2.5-12 |
| TV-15 | Như TV-13 nhưng người mua **không** có GD nào ở kỳ 08 (không có MAIN kỳ 08) | Cùng quy tắc: GD vào kỳ 09, 完納 theo hạn kỳ 09 → có thưởng nếu trả đúng hạn (bản 0.3.1: K' = false → 0) | Q-INC-02, §2.3-7a |
| — | Chuyển năm TC 3/31 → 4/1 (quota quy chế), kỳ đầu sau go-live | Như ADR-006 và Technical Design | C.3 |

## 3. Phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **A. Hàm xác định trong DB, 試算 tự do, tính chính thức gắn 期ロック, DELTA kỳ sau cho mọi kỳ đã khóa (chọn)** | Một transaction: không có khe giữa tính và khóa; tái lập được để kiểm toán; khối lượng nhỏ nên không cần batch | Logic tiền trong PL/pgSQL → test DB bắt buộc, review kỹ | **Chọn** |
| B. Tính realtime bằng view (luôn hiện số mới) | Không cần bước tính | Số của kỳ đã chốt thay đổi khi có điều chỉnh → trái BR-INC-01 và luật 4 | Bỏ |
| C. Tính lại kỳ cũ và ghi đè kết quả | Số "đúng" ở kỳ gốc | Trái luật 4, trái BR-INC-01 (差分 ở kỳ sau); kế toán đã ghi sổ kỳ cũ | Bỏ |
| D. Engine ở app (TypeScript) đọc dữ liệu ra tính | Dễ unit test | Hai lần đọc khác thời điểm → phải tự khóa nhất quán; tách khỏi trigger / RLS | Bỏ; giữ unit test bằng vector SQL |
| E. Batch đêm theo lịch | Chạy tự động | Khóa kỳ là quyết định của người sau khi 照合 kiểm (CAP-HUMAN-01) | Bỏ |
| F. Gán 入金 theo cửa sổ ngày (như prototype) | Đơn giản | Sai khi trả trễ / trả trước / trả gộp; không hiện được tiền gán kỳ nào | Bỏ (D03) |
| G. Chỉ tính lại kỳ đã khóa **cùng năm TC** (bản 0.1.0) | Ít kỳ phải quét | Sửa GD tháng 3 sau khi sang năm TC mới thì delta không bao giờ sinh → tiền lệch không ai thấy; BR-INC-01 không giới hạn theo năm; làm kém prototype | Bỏ (C-01) |
| H. Gán điều chỉnh vào kỳ theo ngày áp | Một trục thời gian | Kỳ đang mở gồm chênh của kỳ cũ → xét 完納 sai; kỳ cũ đã khóa bị đếm hai lần (billing mới + DELTA) | Bỏ (C-02) |

## 4. Hệ quả

**Tích cực**
- Sửa toàn bộ lệch mức Cao về tiền của prototype (D01–D05, D23) và giữ hai hành vi đúng của prototype (N15, N16) trong một mô hình.
- Kiểm toán tái lập được bất kỳ kỳ nào từ đầu vào + version; mọi lần đổi 完納 kỳ đã khóa đều có 修正申請 2 cấp đứng sau.

**Tiêu cực / rủi ro**
- FIFO có thể làm người trả đủ mất 完納 (OPEN-L4-02) tới khi E-02 trả lời → giảm bằng màn 試算 + test vector.
- Nếu 請求書 của kế toán tính thuế khác hệ thống → cách B (nhập 請求額), +0,5–0,8 MM (DEC-011, E-06).
- Tỷ lệ sai đã duyệt (nhánh N1 của E-14) chỉ sửa được bằng 修正申請 INCENTIVE từng người × kỳ → tốn công 照合 (R-L4-01).

**Việc kéo theo**
- Database Design (`INCENTIVE_DB.md`, `BILLING_DB.md`, `ADJUST_DB.md`): `trade_adjustments.period_id`, bảng phân bổ 入金, kết quả MAIN / DELTA / CARRY / CARRY_EXPIRED có `ref_period` + `correction_id` + `kanno_basis`, mã băm đầu vào, dòng 端数調整.
- **Technical Design 完納奨励金 riêng** (P3) với các test vector §2.7; spec SC-09-04.

## 5. Truy vết

BR-INC-01, B.5, 13-06, FR-INC-01, FR-INC-03, FR-CORR-02, FR-AUDIT-03, INC-EDGE-01..03, FIG-013; PRM-040..043, PRM-053..055; DEC-005, DEC-011, DEC-012; E-02, E-06; L4-A02, L4-A04 (2), L4-A09; OPEN-L4-02, OPEN-DB-08; Q-ARCH-08, Q-ARCH-11, Q-ARCH-12; as-built D01–D05, D23, N13, N15, N16; M07, M08, M21; FB-CUS-224, FB-CUS-225; Gate 1 C-01, C-02, M-02, M-03, M-10, m-05, m-07.

## 6. Điểm mở (chờ khách)

Quyết định ở §2 đã **Accepted** (L4-D09). Các điểm dưới đây còn chờ khách thật trả lời; câu trả lời chỉ đổi giá trị / nhánh ghi trong bảng, không đổi hướng của ADR — nếu đổi hướng thì viết ADR mới thay thế. Câu gắn `[Customer giả lập]` trong ADR là giả định có căn cứ, khách thật xác nhận cùng `project/02_requirements/qa.md`.

| ID | Điểm chờ khách | Thiết kế đang theo (giả định) | Nếu khách trả lời khác | Ai trả lời |
|---|---|---|---|---|
| E-02 (OPEN-L4-02) | 入金 có 請求番号 không; FIFO có thể làm người trả đủ mất 完納 | FIFO theo kỳ cũ nhất còn nợ (§2.7-14); màn 期ロック hiện tiền gán vào kỳ nào | Có 請求番号 → phân bổ theo số, đổi hàm phân bổ | 経理部 |
| OPEN-DB-08 | Chênh lệch tiền của kỳ đã khóa người mua trả thế nào | Dòng riêng 「前期以前の調整」 trên thông báo kỳ kế, không vào 期のお支払額 kỳ mới | (b) hạn riêng, FIFO bỏ qua tới hạn đó → đổi hàm phân bổ | 照合部門, 経理部 |
| E-06 | 請求書 của kế toán có tính thuế khác hệ thống không | Cách A — hệ thống tự tính | Cách B (nhập 請求額), +0,5–0,8 MM (DEC-011) | 経理部 |
| Q-ARCH-08 | Phần delta âm còn lại cuối năm TC thu bằng cách nào | Dòng `CARRY_EXPIRED` hiện ở RPT-07, 照合部門 xử lý ngoài và ghi lại | Trừ vào khoản khác → thêm bút toán IF-ACC-01 | 照合部門, 財務 |
| Q-ARCH-11 | 支払期日 rơi ngày ngân hàng nghỉ lùi theo ngày nào | Ngày ngân hàng mở trước (`PREV_BANK_DAY`) | Đổi giá trị `PAYMENT_DUE_RULE`, không đổi bảng | 経理部 |
| Q-ARCH-12 | 税区分 của 完納奨励金 ở IF-ACC-01; hệ số 110/100 cố định | 110/100 cố định theo BR-INC-01; 税区分 theo ánh xạ 仕訳 | Chỉ đổi `journal_mappings` | 経理部 |
| E-14 | Nhánh N1 của ADR-006 | Tỷ lệ sai đã duyệt chỉ sửa bằng 修正申請 INCENTIVE | Theo ADR-006 §6 | Ban lãnh đạo (workshop) |

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.2.0 | Update | Sửa theo Expert Gate 1: tính lại **mọi kỳ đã khóa**, giới hạn năm TC chỉ cho CARRY, delta qua năm TC (C-01); hai trục thời gian `business_date` / `period_id`, kỳ khóa chỉ đi DELTA (C-02); 2 bước 試算 / 期ロック, 試算 ghi audit (M-02, khách #6); 支払期日 theo ngày ngân hàng (M-03); 修正申請 KANNO / INCENTIVE (M-10, M-04); 要確認 「手数料差引の疑い」 (khách #7); câu CARRY_EXPIRED dùng chung (m-05); 110/100 cố định + ví dụ 8% (m-07); bảng test vector §2.7; phương án G, H | 2026-11-25 | phuongnnm-23344 | |
| 3 | 0.3.0 | Update | Gate 1 recheck: nhãn INC-EDGE đúng C.3 + TV-12 (INC-EDGE-01) (N-01); GD LATE_ENTRY vào danh sách đầu vào DELTA + TV-13 (N-02); CARRY_EXPIRED dương đóng số dư (n-01); INCENTIVE là đầu vào cộng thêm + TV-14, một yêu cầu đang chờ / người × kỳ (n-02) | 2026-11-25 | phuongnnm-23344 | |
| 4 | 0.3.1 | Update | Kiểm diff 5b0ef16: TV-13 duyệt / `business_date` 2027-09-21 khớp INCENTIVE_DB (D-04); TV-14 ghim ngày khóa kỳ 11 (2027-12-14) và ngày duyệt TRADE (2027-12-20), nêu ca duyệt trước khóa → +2.990; §2.5-12 nói rõ số tiền INCENTIVE cố định, không tính lại theo 適格金額 mới (D-05). Technical Design: `specs/incentive/technical-design/INC_ENGINE_TECH.md`; TV-14 biến thể duyệt trước khóa ghi thành 2 dòng DELTA (+2.000 gắn `correction_id`, +990 không gắn) theo quy tắc tách dòng của Technical Design | 2026-11-25 | phuongnnm-23344 | |
| 5 | 0.3.2 | Update | Khách Q-INC-02: §2.3-7a GD 後入力 của kỳ đã khóa chuyển sang kỳ đang mở, xét 完納 theo 支払期日 kỳ đó, §2.4-8 bỏ LATE_ENTRY khỏi đầu vào DELTA; Q-INC-01: §2.7-14 完納 theo 入金日 CSV + tick trước 期ロック; TV-13 sửa, thêm TV-15 | 2026-11-25 | phuongnnm-23344 |  |
| 6 | 1.0.0 | Update | Người dùng chốt **Accepted** sau Gate 1–3 (L4-D09 / DEC-059); thêm §6 Điểm mở (chờ khách) — không đổi nội dung quyết định | 2026-11-26 | phuongnnm-23344 | Người dùng (L4-D09) |
