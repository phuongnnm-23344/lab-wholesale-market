# Expert review — LAB-4 Gate 1 recheck — 2026-11-25

Phạm vi review (theo chỉ định của người dùng): repo `lab-wholesale-market`, nhánh `ver/lab-4`, các commit sửa `fb1b794`, `0d4f44a`, `42171a7` so với base `eb41c1c` (`git diff eb41c1c..HEAD`, 42 file). Phạm vi giống Gate 1: `PREMISE.md` · `README.md` · `architecture/` (ARCHITECTURE + ADR-001..010) · `specs/system-design/database-design/` (nay 10 file + `_index.md`) · `wireframes/` · các `_index.md`. Đối chiếu trạng thái ở `project/07_feedbacks/feedback-list.md` (FB-EXP-217..239, FB-CUS-260..296).

Tiêu chí: như Gate 1 — (1) mục tiêu học tập LAB-4 + dùng được làm input break task LAB-5 (完納奨励金 là task riêng); (2) RFP, truy vết ID; (3) 7 luật `CLAUDE.md`; (4) spec-standards `03-specs/` (QC-01, BM-2-901-50).

Cách kiểm:
- Đọc toàn bộ ADR-005, ADR-007, INCENTIVE_DB, ADJUST_DB, CLOSE_DB 4.24 / 4.43, BILLING_DB 4.44–4.50, PARTY_DB 4.12–4.15, IAM_AUDIT_DB 4.54, MKT_DB, wireframe SC-07-02, SC-08-03, SC-09-04, SC-01-02 (phần đổi), diff ARCHITECTURE / SCREEN-LIST / ADR-003 / 004 / 006 / 008 / 009.
- **Tự tính lại cả 11 test vector** (số học + thứ trong tuần của mọi ngày nêu trong TV) bằng script.
- Script kiểm **mọi link + anchor Markdown** trong repo (theo cách GitHub sinh slug) và mọi tham chiếu dạng `X_DB 4.xx` từ ADR / wireframe / PREMISE.
- Script kiểm cú pháp **toàn bộ khối `erDiagram`** của 10 file DB (thực thể, thuộc tính, quan hệ); đọc bằng mắt các flowchart đã đổi ở ARCHITECTURE, SCREEN-LIST.
- Đếm bảng theo từng file cụm so với MKT_DB §2; đếm lại bảng lệch §5.
- Đối chiếu RFP C.3 (extracted text dòng 2352–2358, bảng bị vỡ cột) với `rfp-digest-vi.md:82` và `project/02_requirements/requirement-constraint-extraction.md:227` (bản đọc từ ảnh trang 72).

**Verdict: RELEASE CÓ ĐIỀU KIỆN** — 23 finding cũ: **22 Closed · 1 Partially · 0 Open**. Finding mới: **0 Critical · 3 Major · 8 Minor**.

Hai lỗi Critical về 完納奨励金 đã sửa đúng gốc và đồng bộ ở mọi nơi tôi kiểm. Ba lỗi Major mới đều nhỏ, sửa được trong vài giờ, nhưng hai trong số đó nằm đúng ở bộ test vector mà LAB-5 sẽ dùng làm task, nên phải sửa trước khi break task.

---

## A. Trạng thái 23 finding cũ

| # | Trạng thái | Bằng chứng (file:dòng) | Ghi chú |
|---|---|---|---|
| C-01 | **Closed** | `ADR-007…md:48-50` (§2.4: mọi kỳ đã khóa, không giới hạn năm TC; năm TC chỉ cho CARRY; ví dụ qua năm TC), `:92` (phương án G bị bỏ); `INCENTIVE_DB.md:119` (4.52 Overview), `:159-160` (TV-03, TV-04); `CLOSE_DB.md:170`; `MKT_DB.md:290` (N15); `PREMISE.md:93` (L4-A04 (2)), `:145` (M08); `ARCHITECTURE.md` §4.2, §7.2, §12:322 | Câu dùng chung về CARRY / `CARRY_EXPIRED` có mặt ở cả 3 nơi. Danh sách "đầu vào đổi sau khóa" còn sót GD mới nhập qua `LATE_ENTRY` → tách thành **N-02** |
| C-02 | **Closed** | `ADJUST_DB.md:220` (4.39 Overview), `:238-239` (cột 13 / 13a); `BILLING_DB.md:371` (4.49 cột 5); `ADR-007…md:41-44` (§2.3); `TRADE_DB.md:193` (`trade_date`); `MKT_DB.md:38` (P7), `:235` (view trả cả hai trục); `SC-08-03…md:28-45` (ví dụ đã sửa: 計上業務日 2027/09/15 ↔ 対象期 2027-08); `SC-09-04…md:38, 70` ([15] 前期以前の調整) | Quy tắc "kỳ gốc OPEN → vào billing kỳ gốc; LOCKED → chỉ DELTA" có ở cả 5 nơi; TV-01 (kỳ chưa khóa) và TV-02 (kỳ đã khóa, không đếm hai lần) tính đúng. Cách thu tiền chênh của kỳ đã khóa để mở ở OPEN-DB-08 — xem **n-03** |
| M-01 | **Closed** | `ADR-005…md:29-31` (§2.2–2.4); `CLOSE_DB.md:53`, `:136`; `MKT_DB.md:26`; `PREMISE.md:98` (L4-A09), `:147` (M10); TV-09 | Một định nghĩa [D 01:00, D+1 01:00); 日次締め mở ngày kế tiếp, job 01:00 là lưới an toàn; ca biên mới xảy ra được |
| M-02 | **Closed** | `SC-09-04…md:15, 49, 62, 67, 97`; `INCENTIVE_DB.md:97` | Còn 2 nút 試算 / 期ロック; [7] luôn là 試算; 試算 ghi audit (khách #6) |
| M-03 | **Closed** (chờ Q-ARCH-11) | `ADR-007…md:38`; `RULE_DB.md` (`PAYMENT_DUE_RULE`); `CLOSE_DB.md:170`; `SC-09-04…md:30, 56`; `SC-10-04…md:37, 62`; `PREMISE.md:98`; TV-05, TV-08 | Grep không còn "休市日は前営業日" / "前営業日" trong phạm vi. Ngày trong tuần của TV-05 (2027-10-10 CN → 10-08 thứ Sáu) và TV-08 (2028-06-10 thứ Bảy → 06-09) đúng |
| M-04 | **Closed** | `ADR-006…md:41-43` (§2.3-7a), `:46-47` (§2.4-8a), `:51-55` (rủi ro N1 viết lại), `:90-91` (phương án F, G); `ADR-007…md:55`; `ARCHITECTURE.md` §7.3 | Đường sửa tiền = 修正申請 `INCENTIVE`; workshop E-14 có đủ phương án |
| M-05 | **Closed** | `ADR-005…md:32-50` (checklist 11 mục, 「端末回収不能」, `LATE_ENTRY`), `:63` (phương án G); `ADR-008…md:38`; `ADJUST_DB.md:155, 166-167`; `TRADE_DB.md:193, 199, 285`; `LOT_DB.md:118`; `IAM_AUDIT_DB.md:370, 561`; `SC-07-02…md:36, 52-61, 86`; `SC-03-07…md:54, 62` | Một đường dùng chung ADR-005 / ADR-008 / SC-03-07. Phần kỳ của GD `LATE_ENTRY` khi kỳ đã khóa chưa khép → **N-02** |
| M-06 | **Closed** | `SCREEN-LIST.md` §0 + sơ đồ C1–C8; `SC-08-03…md:18, 31, 48`; `SC-10-04…md:44, 98`; `_common-layout.md` C-11, C-27; `PREMISE.md:175` (L4-D03) | Grep: chữ 承認 chỉ còn cho 承認（売買参加者）, câu trích RFP B.7 và dòng lịch sử |
| M-07 | **Closed** (phát sinh N-03) | `PARTY_DB.md:58-63` (bảng so sánh), `:276-283`, `:315`, `:343-350` (`REVIEWED`, `LIMIT_CHANGED`); `ADR-003…md:36-42`; `ARCHITECTURE.md:209, 225`; `SC-01-02…md:30, 47-58, 86-94`; `MKT_DB.md:344` (OPEN-DB-09) | Khác biệt thủ tục và trường đặc thù đã thể hiện; 参加上限 không còn sửa đè; trạng thái nằm trong từng khối; giả định 失効 tự động có ghi. Nhưng thủ tục **gia hạn 許可** mới lệch PRM-121 đã chốt với khách → **N-03** |
| M-08 | **Closed** (chờ Q-ARCH-07) | `IAM_AUDIT_DB.md:531, 541, 545-549`; `MKT_DB.md:187, 229`; `ADR-009…md:21-22, 42-45, 57`; `ARCHITECTURE.md:49, 127, 304, 340` | `doc_class` theo TBL-ATTACH-01, không tự xóa, xóa vật lý sau 決裁 + MFA. Còn một chỗ mơ hồ ở `retention_until` → **n-06** |
| M-09 | **Closed** | 10 file ở `database-design/`; `README.md:47` (ngoại lệ #7); `database-design/_index.md`; `PREMISE.md:176` (L4-D04); `MKT_DB.md:120-131` | Đếm bảng từng file: 13 + 7 + 7 + 4 + 4 + 7 + 4 + 10 + 2 = 58, khớp §2. Link + anchor: **0 link gãy** trong phạm vi (script). Mọi tham chiếu `X_DB 4.xx` từ ADR / wireframe trỏ đúng file chứa bảng |
| M-10 | **Closed** | `ADR-007…md:54` (§2.5-11); `INCENTIVE_DB.md:131, 135-136`; `ADJUST_DB.md:155, 164-168`; `ADR-004…md:33`; TV-07 | KANNO là ngoại lệ có duyệt 2 cấp, sinh DELTA gắn `correction_id`, `kanno_basis = CORRECTION` |
| m-01 | **Closed** | `wireframes/_index.md:3` | 16 tài liệu, khớp bảng |
| m-02 | **Closed** | frontmatter 10 file DB không còn `status`; §2 dùng cột `Note` | |
| m-03 | **Closed** | `specs/_index.md` (13 feature theo module ARCH §2 + màn cốt lõi + file DB) | |
| m-04 | **Closed** | `MKT_DB.md` §5 | Tôi đếm lại: Cao 16 / TB 19 / Thấp 5; Thiếu 17 / Giản lược 14 / Sai 7 / Giữ hành vi prototype 2 = 40 dòng |
| m-05 | **Closed** | `ADR-007…md:49`; `INCENTIVE_DB.md:119`; `PREMISE.md:145`; `SC-09-04…md:65` | Cách ghi `CARRY_EXPIRED` còn chưa rõ dấu / vị trí → **n-01** |
| m-06 | **Closed** (E-15 chờ) | ADR-002 §2.2–2.3; `_common-layout.md` C-30; `IAM_AUDIT_DB.md:46` (`BACKUP_CODE`) | |
| m-07 | **Closed** | `ADR-007…md:37, 39`; `SC-09-04…md:27`; `SC-08-03…md:39` | Ví dụ 8% đúng số (1.050.000 → 1.134.000; 114.000 → 123.120; 414.000 → 447.120) |
| m-08 | **Partially** | `IAM_AUDIT_DB.md:67, 134` (`||--o|`); `ARCHITECTURE.md` §3 (tách link); `SCREEN-LIST.md` (dòng `class X human`, `classDef` có trong mỗi khối) | Script cú pháp: mọi khối `erDiagram` ở 10 file DB **đạt**. Flowchart đọc bằng mắt không thấy lỗi. Vẫn **chưa render thật** — giữ điều kiện "render trước Gate 2" |
| m-09 | **Closed** | `ADR-006…md:41-43`; `RULE_DB.md` 4.21; `SC-10-04…md:68` | Tham chiếu ở SC-10-04 trỏ sai mục → **n-04** |
| m-10 | **Closed** (chờ OPEN-DB-10) | `IAM_AUDIT_DB.md` 4.58; `MKT_DB.md:116, 345` | |
| m-11 | **Closed** | `SC-04-01…md:64` (+ SC-04-05, SC-03-01, SC-06-02) | |

Góp ý khách (FB-CUS-260..296): tôi đối chiếu 8 mục Phải có (#1–#8) — đều có trên wireframe / ADR / DB đúng chỗ PL ghi (vd. `SC-07-02…md:52-61` #1, `SC-06-02…md:34, 78` #2, `SC-08-03…md:58` #3, `SC-07-02…md:39, 87` #4, `SC-04-05…md:68` #5, `SC-09-04…md:66` #6, `:69` #7, `SC-06-02…md:48, 70` #8). #22 chờ người dùng, #28 / #31 để sau có lý do — chấp nhận.

---

## B. Finding mới

| # | Mức | File:vị trí | ID RFP | Vấn đề | Cách sửa đề xuất |
|---|---|---|---|---|---|
| N-01 | **Major** | `ADR-007…md:70` (TV-02 "INC-EDGE-01"), `:79` (TV-11 "INC-EDGE-02"); `INCENTIVE_DB.md:158` (TV-02 "INC-EDGE-01"), `:161` (TV-05 "INC-EDGE-03"), `:167` (TV-11 "INC-EDGE-02"); `MKT_DB.md:290` (N15 "INC-EDGE-01") | C.3 DS-INC-EDGE-01; luật 7 | **Gắn sai nghĩa ID test vector của RFP.** Theo C.3 (digest `rfp-digest-vi.md:82`, bản đọc ảnh `requirement-constraint-extraction.md:227`, và chính user story US-20 / FT-09-08 của LAB-1): **INC-EDGE-01 = 適格金額 đúng ngưỡng bậc → áp đúng version**, **-02 = điều chỉnh sau khóa → 差分 kỳ sau**, **-03 = số lẻ sau nhân hệ số → floor**. Bộ TV mới gắn lệch một nấc (điều chỉnh sau khóa = 01, làm tròn = 02, quá hạn = 03). Hệ quả kép: (a) truy vết RFP sai đúng ở bộ test CI mà LAB-5 sẽ tách task; (b) **ca INC-EDGE-01 (đúng ngưỡng 以上 + version của kỳ) không có TV nào** — ca bắt buộc của RFP bị bỏ sót, trong khi đây là chỗ dễ sai nhất (`>=` vs `>`, chọn version theo kỳ). Text trích PDF ở dòng 2355–2358 bị vỡ cột nên dễ đọc lệch | Sửa nhãn: TV-02, TV-03, TV-07 → INC-EDGE-02; TV-11 → INC-EDGE-03; bỏ nhãn INC-EDGE ở TV-05 (ca quá hạn thuộc B.5 「超過時は0」); N15 → INC-EDGE-02. Thêm **TV-12 INC-EDGE-01**: 適格金額 = 1.000.000 đúng cận dưới bậc 3 → 90 bp → 9.900; 999.999 → bậc 2 → floor(999.999 × 0,5% × 1,1) = 5.499; kèm biến thể "kỳ có version v3 hiệu lực từ ngày 1, kỳ trước dùng v2" để kiểm chọn version theo kỳ |
| N-02 | **Major** | `INCENTIVE_DB.md:119` (4.52: danh sách đầu vào đổi sau khóa chỉ có `trade_adjustments`, `payment_allocations`, 修正申請 KANNO / INCENTIVE); `ADR-007…md:48` (§2.4-8, cùng danh sách); `BILLING_DB.md:371` (4.49 cột 5: "Σ GD có `trade_date` trong kỳ" — không có điều kiện "ghi trước khi kỳ khóa"); `ADR-005…md:50` (§2.8: "kỳ theo ngày gốc và quy tắc kỳ OPEN / LOCKED của ADR-007 §2.3") | BR-INC-01, FR-INC-03, BR-CLOSE-01; luật 4 | **GD mới nhập qua `LATE_ENTRY` cho một kỳ đã 期ロック bị lọt khỏi DELTA** — cùng loại lỗi với C-01, chỉ ở đường khác. Ví dụ: 紙伝票 của 2027-08-31 phát hiện ngày 2027-09-20 (kỳ 08 đã khóa 09-14) → 修正申請 `LATE_ENTRY` → `trades` mới có `trade_date` 08-31, `business_date` 09-20. ADR-005 §2.8 nói "theo quy tắc kỳ LOCKED → DELTA", nhưng engine chỉ quét điều chỉnh / phân bổ / 修正申請 KANNO-INCENTIVE, không quét `trades` có `trade_date` thuộc kỳ đã khóa và `created_at` > `locked_at` → **không có DELTA**, tiền lệch không ai thấy. Đồng thời 4.49 cột 5 đọc theo chữ thì GD này lại thuộc Σ của kỳ 08 (đã đóng băng) — hai tài liệu không nói cùng một điều | Thêm vào danh sách đầu vào ở 4.52 và ADR-007 §2.4-8: "`trades` có `trade_date` thuộc kỳ đó và `created_at` > `locked_at` (GD `LATE_ENTRY`)". Sửa 4.49 cột 5 thành "Σ GD có `trade_date` trong kỳ **ghi trước khi kỳ khóa** + …". Thêm index `trades (trade_date, created_at)` hoặc dùng lại `idx_trades_buyer_trade_date`. Thêm TV-13 "`LATE_ENTRY` cho ngày thuộc kỳ đã khóa → không vào billing kỳ mới, DELTA ở 期ロック kế tiếp" |
| N-03 | **Major** | `PARTY_DB.md:59` (gia hạn 許可 = 審査 + 起案 → 運用部門長 決裁), `:237`, `:268`; `ADR-003…md:36, 42`; `ARCHITECTURE.md:209, 225`; `SC-01-02…md:47, 86, 115`; `PREMISE.md:126` (§3.2 dẫn nguồn "FB-CUS-280") | Luật 2; PRM-121 (KH-GL [GL3]); FIG-010; 02-08 | Bảng khác biệt 許可 / 承認 (sửa M-07) **đổi thủ tục gia hạn 許可** so với PRM-121 đã chốt với khách ở LAB-1: "gia hạn bình thường = 照合事務局 nhập + 照合部門長 xác nhận, không qua 再審査" (áp cho tư cách nói chung). Bản mới bắt gia hạn 許可 qua 審査 + **運用部門長 決裁 + MFA** mà không ghi đây là thay đổi tiền đề, không có dòng quyết định ở PREMISE §5, và OPEN-DB-09 không hỏi điểm này (chỉ hỏi đình chỉ / thu hồi và 承認). PREMISE §3.2 dẫn FB-CUS-280 làm nguồn cho "決裁 đăng ký / gia hạn 許可", nhưng FB-CUS-280 chỉ nói về **MFA cho 期限前更新** — dẫn nguồn quá tay. Thêm nữa, câu "承認 … một người, **không 審査**" khẳng định mạnh hơn mức có căn cứ: thực tế 売買参加者 承認 vẫn có xét 資力 / 保証金, chỉ nhẹ hơn 許可. Hướng tách thủ tục là đúng và nên giữ — vấn đề là ghi giả định thành sự thật, và ngược với tiền đề khách đã đồng ý (đổi effort SC-01-03 / SC-01-05 so với LAB-1) | Chọn một trong hai: (a) giữ PRM-121 — gia hạn 許可 = 照合部門長 確認 có ghi kết quả xem xét điều kiện, 審査 + 運用部門長 決裁 chỉ cho cấp mới / 再審査; hoặc (b) giữ thiết kế mới nhưng ghi thành quyết định L4-Dxx "lệch PRM-121, lý do …", thêm câu hỏi vào OPEN-DB-09 ("gia hạn 許可 có cần 審査 + 運用部門長 決裁 không"), ghi ảnh hưởng effort. Sửa PREMISE §3.2 bỏ dẫn FB-CUS-280 cho phần 決裁 (để [PL]). Đổi "không 審査" thành "xét nhẹ (届出 + 確認 điều kiện 保証金 / 資力) — chờ OPEN-DB-09" |
| n-01 | Minor | `INCENTIVE_DB.md:119` (Note: "tổng âm → CARRY ở kỳ N+1 cùng năm TC"), `:160` (TV-04: `CARRY_EXPIRED −2.200` ghi ở kỳ 2029-03); `:141` | PRM-043 (c) | Dấu và vị trí của `CARRY_EXPIRED` chưa định nghĩa. TV-04 ghi dòng −2.200 ở kỳ 2029-03, trong khi kỳ đó đã có dòng `CARRY −2.200` mang từ 2029-02 → Σ kỳ 2029-03 = −4.400 (đếm âm hai lần nếu RPT-07 / kế toán cộng theo kỳ). Quy tắc "tiền chi = max(0, Σ)" vẫn ra 0 nên không sai tiền chi, nhưng báo cáo dễ sai | Định nghĩa rõ: `CARRY_EXPIRED` là dòng **đóng số dư** (+2.200, đưa Σ kỳ về 0) kèm `ref_period_id`, RPT-07 hiện trị tuyệt đối; hoặc loại `CARRY_EXPIRED` khỏi Σ. Ghi vào cột 14 và TV-04 |
| n-02 | Minor | `ADR-007…md:55` (§2.5-12 INCENTIVE); `INCENTIVE_DB.md:145` (Index); `ADJUST_DB.md:180` (`uq_correction_requests_one_pending` chỉ theo `target_trade_id`) | FR-CORR-02; luật 4 | (a) Không có TV cho 修正申請 `INCENTIVE`, nhất là ca **tính lại lần sau** của kỳ đó (vì điều kiện "đổi sau `locked_at`" đúng mãi, engine sẽ quét lại kỳ đó mỗi tháng): nếu hàm thuần không coi số tiền INCENTIVE là đầu vào cộng thêm thì lần quét sau sinh DELTA đảo ngược khoản sửa. ADR-007 §2.1-1 có liệt kê 修正申請 INCENTIVE là đầu vào — đúng — nhưng chưa có TV chứng minh. (b) `KANNO` / `INCENTIVE` / `LATE_ENTRY` có `target_trade_id` NULL → không có ràng buộc "một yêu cầu đang chờ" theo (người × kỳ) | (a) Thêm TV: INCENTIVE +2.000 cho kỳ X → DELTA ở 期ロック kế tiếp; tháng sau có thay đổi khác của kỳ X → DELTA chỉ phản ánh thay đổi mới, không đảo +2.000. (b) Thêm unique partial `(scope, target_period_id, target_participant_id)` cho `KANNO`, `INCENTIVE` khi đang chờ |
| n-03 | Minor | `MKT_DB.md:343` (OPEN-DB-08 giả định "入金 FIFO trả nợ kỳ cũ trước"); `BILLING_DB.md:331, 339` (FIFO "kỳ cũ nhất còn nợ"); `INCENTIVE_DB.md:158` (TV-02) | BR-INC-01; OPEN-L4-02 | Với kỳ đã khóa, "còn nợ" chưa được định nghĩa: `period_billings` LOCK không gồm điều chỉnh sau khóa, nên FIFO hoặc không thấy khoản +216.000 của TV-02, hoặc (nếu tính) đem tiền kỳ 09 trả nó trước → người mua **mất 完納 kỳ 09 vì một sửa sai phía chợ duyệt sau khi khóa kỳ 08**. Đây là hệ quả tiền thật, cần nêu ra trong câu hỏi cho 照合部門 / 経理部 | Định nghĩa "nợ của kỳ đã khóa" (LOCK + Σ điều chỉnh sau khóa − phân bổ), ghi rõ hệ quả trên vào OPEN-DB-08 + một biến thể của TV-02 (trả đúng 1.080.000 cho kỳ 09 → FIFO gán vào đâu, kỳ 09 có 完納 không) |
| n-04 | Minor | `INCENTIVE_DB.md:162` (TV-06 dẫn "ADR-007 §2.4" — FIFO nay ở §2.7-14); `SC-10-04…md:68` (dẫn "ADR-006 §2.5-10" — hủy version đã duyệt ở §2.3-7a); `ADR-005…md:38` ("(mục 6)" trong dòng checklist #3 — ý là §2 mục 6, dễ đọc nhầm thành checklist #6) | Luật 7 | Tham chiếu mục trỏ sai / mơ hồ sau khi đánh số lại | Sửa 3 tham chiếu; ở ADR-005 ghi "§2-6" |
| n-05 | Minor | `SC-08-03…md:28` (修正申請 nộp 09/14 08:40 "lúc đó kỳ 2027-08 đã 期ロック") ↔ `SC-09-04…md:80` (kỳ khóa "09/14 10:20"); `SC-09-04…md:43` (N01 仲卸 1.000.000 "段階 2 · 0.9%") ↔ `INCENTIVE_DB.md:153` (bảng giả chỉ có cho 売買参加者, 1.000.000 = bậc 3); `SC-09-04…md:35, 38, 44` + `ADJUST_DB.md:239` (kỳ 2027-07 với 第2版 — trước go-live 2027-08-01 theo L4-A09, tức kỳ migrate, ADR-007 §2.7-15 nói kỳ migrate dùng version go-live) | L4-A09 | Ví dụ giữa các tài liệu không khớp nhau; người đọc LAB-5 sẽ hỏi lại | Đặt giờ khóa kỳ 08 thống nhất (vd. nộp 修正申請 09/15); ghi bảng giả cho 仲卸 (hoặc đổi N01 sang 段階 3); dùng kỳ 2027-08 / 09 cho ví dụ hoặc ghi "2027-07 là kỳ migrate, version go-live" |
| n-06 | Minor | `IAM_AUDIT_DB.md:545` (cột 8 `retention_until`: "tính từ ngày tải lên … 3 năm online rồi cold archive tới hạn lưu do khách quyết"); `ADR-009…md:44-45` | DR-RET-01; TBL-ATTACH-01; B.7 | (a) Hạn lưu chứng từ GD tính từ **ngày tải lên** — scan 紙伝票 tải muộn sẽ giữ lâu hơn bản ghi GD, còn hạn lưu sổ sách thường tính từ ngày / năm TC của nghiệp vụ. (b) Với loại 3 năm, một cột vừa là "ngày chuyển lạnh" vừa là "hạn lưu" → job 「保存期限到来」 có thể đưa chứng cứ tranh chấp vào danh sách xóa ở năm thứ 3 | Tách `archive_after` (ngày sang lạnh) và `retention_until` (hạn xóa); tính từ `business_date` của bản ghi chủ (hoặc cuối năm TC) — ghi giả định [PL] vào Q-ARCH-07 |
| n-07 | Minor | 10 file DB: Index / Khoá ngoại viết dạng câu `**Index** — …` ở 53 bảng, dạng bảng ở số còn lại (vd. `ADJUST_DB.md:143-145`, `INCENTIVE_DB.md:109, 145-147` vs `CLOSE_DB.md` 4.24 bảng FK) | BM-2-901-50 §4 (bảng Index, bảng Khoá ngoại) | Lệch khuôn BM-2-901-50 và không đồng nhất giữa các bảng. Có từ bản `eb41c1c`, Gate 1 tôi bỏ sót; nêu ở đây vì người dùng yêu cầu kiểm QC-01 / BM cho 10 file | Hoặc chuyển về bảng như khuôn, hoặc ghi một quy ước ở `MKT_DB.md` §4.0 ("Index / FK đơn giản viết một dòng; FK có tên riêng / ON DELETE viết bảng") + một dòng ngoại lệ README §3 |
| n-08 | Minor | `PREMISE.md:93` (L4-A04, cột nguồn "PL + KH-GL [Giả lập]"), `:98` (L4-A09 "KH-GL [Giả lập]") | Luật 7 | Nội dung PL thêm ở 0.5.0 (hai trục thời gian, tính lại qua năm TC, lùi theo ngày ngân hàng) đang mang nhãn khách giả lập đã đồng ý, trong khi khách chưa thấy các điểm này | Đánh dấu phần thêm ở 0.5.0 là [PL] (vd. "(2) … [PL 0.5.0, theo Gate 1 C-01/C-02]"), hoặc đưa vào lượt hỏi khách kế tiếp |

---

## C. Trả lời 4 điểm PL nhờ soi kỹ

| Điểm | Kết luận |
|---|---|
| (1) ADR-007 §2.3–2.5 + TV so với INCENTIVE_DB §5 | Quy tắc ở ADR-007 §2.3–2.5 và 4.39 / 4.49 / 4.52 khớp nhau. **Tự tính lại cả 11 TV — mọi con số đúng**: TV-01 10.395 / 1.134.000; TV-02 11.880 → +1.980, 216.000; TV-03 19.800 → 4.400 → −15.400; TV-04 3.300 − 15.400 = −12.100, 9.900 − 12.100 = −2.200; TV-06 2.750; TV-07 +9.900; TV-10 thiếu 440, 9.900; TV-11 12.222,21 → 12.222. Thứ trong tuần của 21 ngày nêu trong TV đều đúng. Năm TC của TV-03 / TV-04 đúng (2028-03 thuộc năm TC 2027). ADR-007 §2.7 và INCENTIVE_DB §5 cùng 11 TV, cùng nghĩa. Lỗi nằm ở **nhãn ID RFP** và thiếu ca INC-EDGE-01 (**N-01**), thiếu đầu vào `LATE_ENTRY` (**N-02**), cách ghi `CARRY_EXPIRED` (**n-01**), chưa có TV cho INCENTIVE (**n-02**) |
| (2) Checklist 11 mục ở 3 nơi | **Khớp.** ADR-005 §2.5 (`ADR-005…md:34-46`) = CLOSE_DB 4.24 cột 9 (`CLOSE_DB.md:150`) = SC-07-02 (`SC-07-02…md:34-44`): 6 ✖ (GD treo · せり chưa xác nhận · máy chưa đồng bộ trừ 端末回収不能 · SC-03-07 要確認 · 当日訂正 ≥ ngưỡng / đổi 買受人 chưa 確認済 · ngoại lệ giao đổi tiền chưa 確認済) và 5 ⚠ (持ち越し · giao còn dư có tick · 当日訂正 dưới ngưỡng · tranh chấp sang ngày sau · せり tự xác nhận). Khác nhỏ không cần sửa: SC-07-02 [7] gom thêm 紙伝票後入力 nghi trùng (SC-04-07) vào dòng SC-03-07; thứ tự dòng trên màn khác thứ tự ADR (màn có số item riêng) |
| (3) DB + wireframe do fork viết — nhất quán chéo | Tốt hơn tôi lo. Link + anchor: 0 gãy trong phạm vi; tham chiếu `X_DB 4.xx` đúng file; số bảng khớp 58; cú pháp `erDiagram` ở cả 10 file đạt; tên cột mới (`period_id`, `trade_date`, `original_business_date`, `correction_id`, `kanno_basis`, `doc_class`, `lost_*`, `reviewed_*`, `settle_reviewed_*`) dùng cùng tên ở ADR, DB, wireframe. Chỗ lệch tìm được: **N-02** (4.49 ↔ ADR-005 §2.8), **n-04** (tham chiếu mục), **n-05** (ví dụ giữa SC-08-03 / SC-09-04 / INCENTIVE_DB) |
| (4) Giả định PL | **運用部門長 決裁 xóa vật lý:** chấp nhận được làm giả định — B.7 chỉ nói 「承認を要する」, không nói ai; đã ghi ở Q-ARCH-07 (b) để khách sửa. Gợi ý thêm (không bắt buộc): với 受入票・取引票・照合表 (chứng từ sổ sách), hỏi luôn có cần 経理部 / 照合部門 cùng xác nhận không. **Thủ tục 許可 / 承認:** hướng tách đúng, nhưng phần gia hạn 許可 ngược PRM-121 và câu "承認 không 審査" quá mạnh → **N-03** |

---

## Điều kiện để release

Bắt buộc trước khi dùng bộ thiết kế làm input break task LAB-5 / trước Gate 2 (PL sửa, Expert kiểm nhanh bằng diff, không cần recheck đầy đủ):

1. **N-01** — sửa nhãn INC-EDGE ở ADR-007 §2.7, INCENTIVE_DB §5, MKT_DB N15; thêm TV-12 cho INC-EDGE-01 (đúng ngưỡng + version theo kỳ).
2. **N-02** — thêm GD `LATE_ENTRY` vào danh sách đầu vào DELTA (4.52, ADR-007 §2.4-8), sửa 4.49 cột 5, thêm TV-13.
3. **N-03** — chọn (a) hoặc (b); nếu (b) thì ghi quyết định + câu hỏi OPEN-DB-09 + ảnh hưởng effort; sửa nguồn ở PREMISE §3.2.
4. **m-08** — render thử toàn bộ Mermaid (GitHub preview hoặc mermaid-cli) trước Gate 2, như PL đã ghi.

Minor n-01..n-08: nên sửa cùng lượt (đều rẻ); n-01, n-02, n-03 nên làm cùng N-01 / N-02 vì cùng bộ TV.

## Điểm làm tốt

- **Sửa đúng gốc, không vá ngọn.** C-01 / C-02 được sửa thành hai quy tắc rõ ràng ("năm TC chỉ cho CARRY", "hai trục thời gian, kỳ khóa chỉ đi DELTA") rồi đẩy xuống đủ 5 tầng; bảng lệch có thêm N15 / N16 ghi thẳng "to-be 0.1 từng làm kém prototype" — trung thực, đúng tinh thần đối chiếu LAB-2.
- **Test vector dùng được ngay cho LAB-5:** mỗi TV có đầu vào, kỳ gán, DELTA, 完納, số tiền cuối và ID nguồn; số đúng 100% khi tôi tính lại; chọn đúng các ca biên (qua năm TC, thứ Bảy ngân hàng nghỉ, lô 01:30, FIFO làm mất 完納, thiếu phí chuyển khoản).
- **Luật 3 được giữ cả ở chỗ mới:** 「手数料差引の疑い」 thành 要確認 + người quyết có lý do (`kanno_basis = JUDGED`), không để máy tự kết luận; 「端末回収不能」 là lối thoát có người chịu trách nhiệm + MFA, không phải nút "khóa bỏ qua checklist".
- **Phương án bỏ được ghi lại thành ADR** (ADR-005 F/G, ADR-007 G/H, ADR-009 G, ADR-006 F/G cho workshop) — người đọc sau hiểu vì sao bản 0.1 sai.
- **Tách DB sạch:** giữ số mục 4.xx theo số bảng toàn schema để mọi tham chiếu cũ vẫn tra được, file tổng ghi ngoại lệ #7 có lý do, 0 link gãy.

---

## Kiểm diff 5b0ef16 — 2026-11-25

Phạm vi (theo chỉ định của người dùng): `git diff 42171a7..5b0ef16` ở repo `lab-wholesale-market`, nhánh `ver/lab-4` (23 file, +125 / −93). Chỉ kiểm điều kiện release N-01..N-03, n-01..n-08 và lỗi mới do diff gây ra; không recheck đầy đủ. Quyết định người dùng: L4-D05, L4-D06. m-08 (render Mermaid) chờ người dùng cấp quyền tool — không tính vào verdict lần này.

Cách kiểm: đọc word-diff cả 23 file; tự tính lại TV-12, TV-13, TV-14 và thứ trong tuần của các ngày mới bằng script; grep chữ còn sót ("không 審査", "đăng ký / gia hạn", nhãn INC-EDGE); kiểm link mới thêm (diff chỉ đổi ô version trong các `_index.md`, không thêm link, không đổi anchor); đối chiếu quy ước n-07 với chính 10 file DB.

**Verdict: RELEASE (Gate 1 — cho phép sang P3).** 3 Major: **3 Closed**. 8 Minor: **7 Closed · 1 Partially (n-07)**. Lỗi mới / sót do diff: **0 Critical · 0 Major · 5 Minor** (D-01..D-05, sửa trong P3, trước Gate 2).

### Trạng thái điều kiện

| # | Trạng thái | Bằng chứng | Ghi chú |
|---|---|---|---|
| N-01 | **Closed** | `ADR-007…md:70-80`; `INCENTIVE_DB.md:159-169`; `MKT_DB.md:293` | Nhãn khớp C.3: INC-EDGE-02 ở TV-02 / 03 / 07 / N15, INC-EDGE-03 ở TV-11, TV-05 dẫn B.5 「超過時は0」. Grep: không còn nhãn lệch. **TV-12 tự tính:** 1.000.000 × 0,9% × 1,1 = 9.900; 999.999 × 0,5% × 1,1 = 5.499,9945 → 5.499; v2 80 bp → 8.800 — **đúng**. Có cả cận 「以上」 lẫn chọn version theo kỳ; v2 = 80 bp ghi rõ là giả định chỉ dùng cho TV-12 (`INCENTIVE_DB.md:152`) |
| N-02 | **Closed** | `ADR-007…md:48`; `INCENTIVE_DB.md:120`; `BILLING_DB.md:372`; TV-13 ở `INCENTIVE_DB.md:170`, `ADR-007…md:81` | Danh sách đầu vào DELTA có `trades` với `trade_date` thuộc kỳ và `created_at` > `locked_at`; 4.49 cột 5 thêm "ghi trước khi kỳ khóa" và câu GD `LATE_ENTRY` đi DELTA — hai tài liệu nay nói cùng một điều. **TV-13 tự tính:** 1.200.000 × 0,9% × 1,1 = 11.880 → DELTA +1.980; 200.000 × 1,08 = 216.000 — **đúng**. Lệch ngày giữa hai bản TV-13 → **D-04** |
| N-03 | **Closed** (sót 2 chỗ → D-01, D-02) | `PARTY_DB.md:59-61, :65, :239, :270`; `ADR-003…md:36-37`; `ARCHITECTURE.md:209, 225`; `SC-01-02…md:47, 86`; `PREMISE.md:126` | Chọn phương án (a): gia hạn bình thường của cả hai = PRM-121 (照合事務局 nhập + 照合部門長 確認, MFA), đúng câu chữ `project/02_requirements/premise-list.md:104`; 審査 + 運用部門長 決裁 chỉ cho cấp mới, gắn [PL]; 承認 "xét nhẹ 保証金 / 資力" thay "không 審査"; PREMISE §3.2 bỏ dẫn FB-CUS-280 cho phần 決裁, chỉ giữ cho 期限前更新. Luật 2 vẫn giữ: hai bảng, hai vòng đời, `REVIEWED` chỉ có ở 許可 |
| n-01 | **Closed** | `ADR-007…md:49`; `INCENTIVE_DB.md:120, :141, :160` | `CARRY_EXPIRED` = dòng dương đóng số dư, Σ kỳ cuối năm = 0, RPT-07 hiện trị tuyệt đối. TV-04: −2.200 + 2.200 = 0, không đếm âm hai lần |
| n-02 | **Closed** | `ADR-007…md:48, :55, :82`; `ADJUST_DB.md:181` (`uq_correction_requests_one_pending_period`); TV-14 `INCENTIVE_DB.md:171` | **TV-14 tự tính:** 1.100.000 × 0,9% × 1,1 = 10.890; 10.890 + 2.000 − (9.900 + 2.000) = +990 — **đúng**, không sinh −2.000. Ngày điều chỉnh tháng 12 chưa ghim → **D-05** |
| n-03 | **Closed** | `BILLING_DB.md:332`; `MKT_DB.md:346` (OPEN-DB-08) | "Còn nợ" của kỳ đã khóa có định nghĩa; hệ quả mất 完納 nêu bằng ví dụ TV-02 kèm hai phương án cho khách quyết. Biến thể TV-02 viết trong OPEN-DB-08 thay vì thành dòng TV riêng — chấp nhận tới khi khách trả lời |
| n-04 | **Closed** | `INCENTIVE_DB.md:164` (§2.7-14 — có thật ở `ADR-007…md:61-63`); `SC-10-04…md:65` (§2.3-7a); `ADR-005…md:35` (§2-6) | |
| n-05 | **Closed** | `SC-08-03…md:25-46` (nộp 09/15, sau khóa 09/14 10:20); `SC-09-04…md:43-44` (N01 bậc 3 · 0,9% · ¥9.900, khớp bảng 仲卸 giả); `ADJUST_DB.md:240` (ví dụ kỳ 2027-08 = TV-01) | SC-09-04 giữ 2027-07 nhưng ghi 「移行期」「稼働時の版」, đúng ADR-007 §2.7-15 |
| n-06 | **Closed** | `IAM_AUDIT_DB.md:545-547`; `ADR-009…md:45` | Tách `archive_after` / `retention_until`; mốc = cuối năm TC của `business_date` bản ghi chủ; loại 3 năm không vào danh sách xóa ở năm thứ 3; giả định [PL] ghi rõ |
| n-07 | **Partially** | `README.md:47` (#8); `MKT_DB.md:191` (§4.0) | Cách xử lý bằng quy ước + ngoại lệ README **chấp nhận được**: nội dung index / FK đủ, chỉ khác hình thức. Nhưng câu quy ước không khớp chính các file → **D-03** |
| n-08 | **Closed** | `PREMISE.md:93, :98` | Phần PL thêm ở 0.5.0 gắn [PL 0.5.0, theo Gate 1 …] |
| L4-D05 / L4-D06 | Ghi đúng | `PREMISE.md:71, :177-178`; `SCREEN-LIST.md:73`; `ADR-006…md:87-88` | L4-D06: F / G hạ thành "tư liệu cho workshop", có ước effort ~0,3–0,5 MM và ghi rõ **chưa có trong DEC-048** — đúng luật 6 / 7 |
| m-08 | Chờ | — | Giữ điều kiện: render toàn bộ Mermaid trước Gate 2 |

### Lỗi mới / sót do diff

| # | Mức | File:vị trí | ID RFP | Vấn đề | Cách sửa đề xuất |
|---|---|---|---|---|---|
| D-01 | Minor | `SC-01-02…md:115` (hàng OPS-HEAD: 「決裁」 **đăng ký / gia hạn** 許可 (MFA)); `:112` (hàng SETTLE: 「期限前更新を入力」 chỉ ghi (承認)) | Luật 2; PRM-121 | Bảng quyền của màn còn theo thủ tục cũ, ngược với [14] `:86` và PARTY_DB trong cùng commit: theo PRM-121, 運用部門長 không 決裁 gia hạn; 照合事務局 nhập gia hạn cho **cả** 許可 lẫn 承認. Người viết Screen Spec SC-01-02 ở P3 sẽ đọc bảng quyền trước | OPS-HEAD: 「決裁」 cấp mới 許可 / 再審査 / 一時停止 (MFA); SETTLE: 「期限前更新を入力」 (許可 / 承認) |
| D-02 | Minor | `MKT_DB.md:347` (OPEN-DB-09); `project/02_requirements/qa.md:189` | Luật 7 | PARTY_DB / ADR-003 / SC-01-02 nay ghi "cấp mới 許可 = 運用部門長 決裁 — giả định [PL], chờ OPEN-DB-09", nhưng OPEN-DB-09 **không hỏi** điểm này và vẫn ghi "承認 … (không 審査)" — câu hỏi gửi khách lệch với giả định nó đang đỡ | Viết lại OPEN-DB-09 ở cả hai nơi: (1) cấp mới 許可 có cần 運用部門長 決裁 không (giả định [PL]: có); (2) cấp mới 承認 xét nhẹ 保証金 / 資力, 照合部門長 確認 — đúng không; (3) đình chỉ / thu hồi + 弁明の機会; ghi gia hạn bình thường theo PRM-121 là đã chốt |
| D-03 | Minor | `MKT_DB.md:191` (§4.0); vd. `ADJUST_DB.md:144, :181`, `BILLING_DB.md:171, :248`, `CLOSE_DB.md:152`, `IAM_AUDIT_DB.md:355, :420, :520, :553, :583` | BM-2-901-50 §4 | Quy ước nói "index partial / unique nhiều cột → viết bảng", nhưng ít nhất 10 bảng trên có index partial / unique viết một dòng — quy ước không mô tả đúng file (n-07 còn dở) | Sửa câu quy ước cho khớp thực tế, vd. "Index / FK viết một dòng, ghi đủ tên, cột, unique, partial; dạng bảng chỉ khi FK có `ON DELETE` / tên riêng"; sửa câu tương ứng ở `README.md:47` |
| D-04 | Minor | `ADR-007…md:81` (TV-13: `business_date` 09-20) ↔ `INCENTIVE_DB.md:170` (phát hiện 09-20, duyệt 09-21 → `business_date` 09-21) | — | Hai bản TV-13 lệch ngày ghi sổ; không đổi kết quả tiền nhưng LAB-5 dùng TV làm fixture CI | ADR-007 TV-13 ghi "duyệt 09-21, `business_date` 09-21" như bản DB |
| D-05 | Minor | `INCENTIVE_DB.md:171`, `ADR-007…md:82` (TV-14 "Tháng 12 có thêm 修正申請 TRADE…") | FR-INC-03 | Không ghim ngày duyệt và ngày khóa kỳ 11. Nếu điều chỉnh duyệt trước khi kỳ 11 khóa (khoảng 12-14) thì theo §2.4-8 nó vào cùng lượt 期ロック kỳ 11 → một DELTA +2.990, không phải +2.000 rồi +990 như TV ghi. Thêm: TV-14 cho thấy khoản INCENTIVE là số cố định, không co giãn khi 適格金額 đổi — đúng thiết kế nhưng nên nói thẳng để 照合部門 biết phải lập INCENTIVE mới nếu cần | Ghi "kỳ 11 khóa 2027-12-14; 修正申請 TRADE duyệt 2027-12-20 → DELTA ở 期ロック kỳ 12"; thêm một câu ở ADR-007 §2.5-12: "số tiền INCENTIVE cố định, không tính lại theo 適格金額 mới" |

### Điều kiện còn lại (không chặn P3, phải xong trước Gate 2)

1. **m-08** — render thử toàn bộ Mermaid khi người dùng cấp quyền tool.
2. **D-01..D-05** — sửa trong lượt P3 đầu tiên; D-01 phải xong trước khi viết Screen Specification SC-01-02; D-02 trước khi gửi bộ OPEN-DB cho khách; D-04 / D-05 trước khi LAB-5 lấy TV làm fixture.

### Điểm làm tốt

- Sửa gọn và truy được: 23 file, mỗi file có dòng lịch sử nêu đúng mã finding; không có link / anchor mới bị gãy.
- Ba TV mới đều là ca bắt được lỗi thật (`>=` / `>`, version theo kỳ, GD nhập muộn, sửa thưởng không bị đảo) và số đúng 100% khi tính lại.
- N-03 chọn đường quay về tiền đề khách đã chốt (PRM-121), phần PL tự thêm gắn [PL] — đúng tinh thần luật 7.
- L4-D06 ghi effort F / G "chưa có trong DEC-048" thay vì lặng lẽ cộng vào baseline.
