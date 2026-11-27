# Expert review — LAB-5 Gate B (SWP + quy ra giờ + so LAB-1) — 2026-11-27

Phạm vi review (theo chỉ định của người dùng qua điều phối): repo `lab-wholesale-market`, nhánh `ver/lab-5`, commit `8f44f43` (diff so `9aa112a`): `estimate.md`, `reports/sun-estimate-lab5-project1-20261127-0216.html`, `backlog/estimate-swp-hours.csv`, `task-breakdown.md` §1.4, `backlog/scripts/{build-estimate-swp-hours,write-point-hours-to-project,render-estimate-tables}.py` (+ `estimate-lab1-comparison.yaml`); GitHub Project 1 (chỉ đọc bằng `gh project item-list`, không mutation); trung gian `plans/lab/Lab 5/p3-sun-estimate/`.

Tiêu chí: mục tiêu học LAB-5 + `Requirement.txt` / `Output.txt` + RFP + 7 luật CLAUDE.md; 7 điểm soi kỹ do người dùng giao (estimate.md 5 phần; k = 2,0 và lệch theo loại; so LAB-1 và −71%; Project ≥ 10 item; quy trình chấm SWP; 22 lá > 16 giờ; dữ liệu nhạy cảm trong HTML).

Bối cảnh đã chốt (không chấm lại): người dùng chốt 5 issue mẫu 2026-11-27; thân issue che giờ trước khi chấm; một hệ số k (plan §0 dòng 12, §4).

**Verdict: RELEASE CÓ ĐIỀU KIỆN** — 0 Critical · 2 Major · 7 Minor.

## Kiểm bằng số (tự chạy, không dựa vào số PL báo)

| Kiểm | Kết quả |
|---|---|
| Payload nhúng HTML = `payload-final.json` | 401 / 401 lá khớp `finalSWP`; 98 cha |
| CSV ↔ payload | 0 lệch (SWP, Hours = SWP × 2) |
| Lá đổi điểm | đúng 5: #97 3→4, #116 12→20, #201 / #331 / #379 8→12; tổng lá 1.701 |
| Cha / epic = tổng con (CSV) | 98 / 98 đúng cả SWP và giờ |
| Project ↔ CSV (đọc cả 499 item) | 0 lệch Point / Hours. Mẫu 18 item: epic #1 82/164, #5 141/282, #12 184/368, #20 101/202, #21 55/110; cha #2 33/66; lá #4 10/20, #24 1/2, #69 4/8, #97 4/8, #116 20/40, #201 / #331 / #379 12/24, #486 15/30, #223 10/20, #315 6/12, #189 4/8 |
| Bảng §2.2 theo loại | khớp (dev 167/770/1.653 · test 42/315/430 · thiết kế 54/213/653 · làm rõ 41/55/60 · thô 97/348/1.955) |
| Iteration 1 | 26 lá / 112 SWP / 224 giờ; không lá nào > 16 giờ |
| Lá không thô > 16 giờ | 22 (đúng danh sách §3): #4, 116, 119, 190, 201, **223 (thiết kế)**, 253, 257, 281, 282, 294, 328, 331, 355, 377, 379, 381, 422, 432, 486, 489, 494 |
| Số LAB-1 (đối chiếu `概算見積書_v2.1` §4.2) | 15 dòng FG, RQ 30, BD 132,1, CC 55, BJ 15, IN 30, QT 110, MG 43, AC 7, SV 94, MN 231,6 → 1.486,3 人日 = 11.890,4 giờ — đúng hết |
| Cộng cột LAB-5 §4 | 2.500 (FG) + 426 + 164 + 202 + 110 = 3.402 — đúng |
| HTML: token / email / đường dẫn máy | 0 mẫu khóa (`ghp_`, `github_pat_`, `sk-`, `eyJ`), 0 email, 0 `C:\Users` / `AppData` / `Desktop`; thân issue = `null` trong payload. Chỉ có tên tài khoản GitHub trong ref issue (chủ repo sẽ public — chấp nhận được) |

## Quyết định của Expert về k (điểm soi 2)

**Giữ một hệ số k = 2,0. Không thêm k thiết kế = 3,0.** Lý do:

1. Người dùng đã chốt một hệ số (Q3). Đổi sang hai hệ số là quyết định của người dùng, không phải của Expert hay PL.
2. Bảng §2.2 so SWP × 2 với **giờ sơ bộ do PL tự ước ở P1**, không phải giờ thật. Lệch theo loại cho thấy hai cách ước khác nhau, chưa chứng minh SWP sai. Nếu sửa thiết kế (+213 giờ) theo logic này thì phải sửa luôn test (≈ −200 giờ) và làm rõ (−50 giờ) theo chiều ngược lại — cộng lại gần như bằng 0, mà lại bỏ mất điểm mạnh của SWP là so được giữa các loại việc. Chỉ sửa chiều làm tăng giờ là chọn lọc.
3. Bằng chứng nghiêng về thiết kế có thật (#69 người dùng giữ 4 SWP, cách tính LAB-1 ra 12 giờ → 3,0), nhưng chỉ có một mẫu. Chỗ hợp lý để xem lại là **hiệu chỉnh sau Iteration 1** mà §2.2 đã nêu (lệch > 20% thì đề xuất k mới qua người dùng) — xem riêng loại thiết kế ở lần đó.
4. Rủi ro thật của thiết kế là tải 設計第4波. Rủi ro này đã đưa sang P4 (FB-EXP-344) và phải dùng **giờ sơ bộ 311 giờ** để đo tải, không dùng SWP × 2.

Thô −64% cũng **không** cần k riêng (đồng ý với PL): giờ trên Project dùng cho lập kế hoạch sprint, và lá thô sẽ được tách, chấm lại trước sprint dùng nó. Nhưng tổng 3.402 giờ không dùng được cho dự báo cả đợt — xem m-02.

Cách suy k: hợp lý, có nguồn, đủ nhất quán (k = 2,0 nằm giữa trung vị mẫu 1,8 và tỷ lệ giờ sơ bộ / SWP của 304 lá không thô 2,07; dev lệch −7%). Lỗi nhỏ về nguồn — m-01.

## Bảng phát hiện

| # | Mức | File:vị trí | ID RFP / ref | Vấn đề | Cách sửa đề xuất |
|---|---|---|---|---|---|
| M-01 | Major | `estimate.md` §2.2 gạch đầu dòng "22 lá…", §3 cột Ghi chú; `task-breakdown.md` §1.1 dòng "Cỡ lá" và câu cuối "Việc làm được ngay (dev / test / thiết kế / làm rõ) đều ≤ 16 giờ"; Project (Hours) | L5-D08 (người dùng xác nhận 2026-11-26); mục tiêu học "không để task quá lớn"; 完納奨励金 #381, #486, #489, #494 | Sau P3 có 22 lá **đã có spec** (dev / test / 1 thiết kế #223) mang Hours 18–40 giờ trên Project. Quy tắc độ hạt §1.1 (dev / test / thiết kế 4–16 giờ) bị phá, và câu "đều ≤ 16 giờ" ở task-breakdown giờ sai so với số trên Project. Cách xử lý "tách trước sprint planning" là ngoại lệ của **issue thô** (thiếu spec), PL đem áp cho lá đã có spec mà chưa hỏi người dùng. Hiện chỉ ghi ở estimate.md: không nhãn trên Project, không dòng PREMISE. Không chặn P4 vì không lá nào thuộc Iteration 1 | Chọn một trong hai, **người dùng quyết**: (A) tách ngay thành lá ≤ 16 giờ (thêm sub-issue anh em dưới cùng cha; vẫn tối đa 2 cấp), chấm SWP lá mới bằng skill (lô nhỏ thì chấm inline), chạy lại build → ghi field → render; hoặc (B) sửa L5-D08 thành ngoại lệ có tên: "lá đã có spec, SWP × k > 16 giờ, không thuộc Iteration hiện tại → nhãn `needs-split`, tách và chấm lại trước buổi lập kế hoạch sprint dự kiến", thêm dòng PREMISE, gắn nhãn cho 22 issue, sửa câu cuối §1.1 và DoD 6. Expert khuyên dùng (B) chung, riêng 4 lá FG-09 (#381, #486 30 giờ, #489, #494) nên tách luôn theo (A): spec INC_ENGINE_TECH đã đủ, và đây là hạng mục đề bài soi về độ hạt |
| M-02 | Major | `estimate.md` §4 dòng "共通基盤 + インフラ + バッチ定義", "総合テスト・UAT", §4.1 "Rủi ro thiếu việc"; backlog EP-PLAT / EP-TEST | LAB-1 CC (FE 22, デザイン 8 人日), QT (FE 19,3 + BE 41,8 = 61,1 人日 sửa lỗi), cột デザイン trong dòng FG-01..15 (40,9 人日) | §4.1 tự nhận backlog thiếu việc nhưng chỉ xếp vào "rủi ro". Đã đối chiếu Project: EP-PLAT chỉ có khung màn PC / tablet (#113, #194) và trạng thái dùng chung (#195) = 24 giờ, **không có design system / bộ component FE dùng chung** (LAB-1 30 人日 ≈ 240 giờ). Thiếu cái này thì màn FE ngay ở S1 (SC-00-01, SC-01-03..06) phải tự dựng component. EP-TEST **không có chỗ giữ giờ sửa lỗi** sau 総合テスト (≈ 489 giờ FE / BE); #201 chỉ gồm phân loại lỗi và test lại. Ngoài ra §4 không nhắc cột デザイン nằm trong 15 dòng FG của LAB-1 (≈ 327 giờ). Đây là việc sản phẩm mà sprint sẽ đốt, nên chỉ ghi rủi ro là chưa đủ: burndown và năng lực ở P4 sẽ thiếu đúng những phần này | Thêm 2 issue thô theo đúng cơ chế rolling-wave: (a) EP-PLAT `[PLAT][DesignSystem][FE]` design system + component dùng chung (chờ khuôn màn / wireframe chung; phần nào cần trước S1 thì tách lá ≤ 16 giờ ngay); (b) EP-TEST `[TEST][DefectFix][FE/BE]` giữ chỗ sửa lỗi 総合テスト / UAT. Chấm SWP bằng skill (inline), lan hiệu chỉnh theo quy tắc đã có, render lại HTML, chạy lại 3 script, sửa §3 / §4. (c) QA chạy case theo DoD 4: chỉ cần ghi rủi ro **kèm quy tắc giữ năng lực** (vd. trừ X% năng lực QA mỗi sprint ở task-breakdown §1.3 và progress-report). (d) Thêm デザイン vào cột "Vì sao" / bảng cầu nối (m-03). Nếu người dùng không muốn thêm issue thì phải ghi thành "Hướng đã chốt" trong PREMISE kèm lý do — không để PL tự quyết bằng một dòng rủi ro |
| m-01 | Minor | `estimate.md` §2.1 hàng "Issue mẫu…" | — | Tỷ lệ giờ / SWP của 4 mẫu lấy từ hai nguồn khác nhau: #24, #69, #97 dùng giờ sơ bộ; #486 dùng LAB-1 FT-09-07 24 giờ trong khi giờ sơ bộ của nó là 16 (→ 1,07). Trung vị theo một nguồn (giờ sơ bộ) là 1,75 → k vẫn 2,0, kết luận không đổi | Ghi rõ dùng một nguồn cho cả 4 mẫu, hoặc nêu vì sao riêng #486 lấy LAB-1 |
| m-02 | Minor | `estimate.md` §3 dòng Tổng, §4.1 | L5-A01, L5-D08 | Lá thô có Hours = SWP × 2 (tổng 696) thay cho giờ giữ chỗ LAB-1 (1.955). Chấm "không nâng trục khi thiếu spec" (worker-instructions) khiến điểm lá thô lệch thấp có hệ thống. Tổng 3.402 giờ vì vậy không dùng được để dự báo tải S2–S8 | Thêm một dòng "giờ dự báo cả đợt" = SWP × 2 của lá không thô (2.706) + giờ giữ chỗ của lá thô (1.955) = **4.661 giờ**; ghi rằng rủi ro mốc ở progress-report dùng số này, Hours trên Project dùng cho sprint đang lập kế hoạch |
| m-03 | Minor | `estimate.md` §4.1 | 概算見積書 LAB-1 §4.2 | −71% đúng hướng nhưng chưa có cầu nối bằng số. Expert cộng các khoản PL nêu: ngoài sản phẩm 2.661 + thiết kế đã làm ở LAB-4 451 + thô quy đổi 1.259 + QA trong FG (1.514 − 428 ≈ 1.086) + CC/IN/BJ 636 + QT 678 + RQ 130 ≈ 6.900 / 8.488 giờ; còn ≈ 1.590 giờ chưa giải thích (FE × 1,3, デザイン trong dòng FG, giờ dev ước thấp hơn LAB-1). Dòng "Thiết kế đã làm ở LAB-4 ≈ 451" là số còn lại (132,1 × 8 − 606), không phải số đo độc lập | Thêm bảng cầu nối (khoản · giờ · nguồn) ở §4.1, có dòng "chưa giải thích"; ghi 451 là phần còn lại theo phép trừ |
| m-04 | Minor | `plans/lab/Lab 5/plan-lab5.md` §0 dòng 5, §2 P3 (b); AI-report (P5) | Output.txt (AI-report ①: "cách dùng Agent ghi SWP lên Project") | Hai chỗ chạy khác plan nhưng plan chưa sửa: (1) HTML ở `reports/` thay vì `estimate-report/` (progress đã ghi, plan chưa sửa); (2) Point / Hours do PL chạy `write-point-hours-to-project.py`, không phải "agent riêng" như plan §0 dòng 5. Về chất thì không sao: nguồn là payload trong HTML, đọc lại 499/499 khớp | Sửa plan theo thực tế; AI-report P5 tả đúng: agent nào chạy script ghi, đọc từ đâu, kiểm lại ra sao |
| m-05 | Minor | `plans/lab/Lab 5/p3-sun-estimate/worker-instructions.md`, `build-worker-batches.py`; HTML mục Caveats | `sun-estimate` worker-contract ("no tools, filesystem…", nhận bằng chứng inline) | Chỗ chạy khác skill: (1) worker được đọc file (rubric + lô) và ghi file kết quả. Lệnh "chỉ đọc 3 file" chỉ là lời dặn, không có gì chặn worker đọc `backlog.yaml` có giờ sơ bộ. Không thấy dấu hiệu neo giờ: test +47%, thô −64% đều lệch xa giờ sơ bộ. (2) Che cả **mục phụ thuộc và danh sách ID RFP**, không chỉ giờ / người phụ trách. Thông tin này là bằng chứng phạm vi (tích hợp nhiều module), nên có thể kéo Scope / Complexity xuống ở việc nối nhiều module. Hiệu chỉnh 5 mẫu chỉ bù một phần | Ghi hai chỗ lệch này và ảnh hưởng vào AI-report ③ (chỗ cần cải thiện). Lần sau: truyền lô inline theo contract; chỉ che giờ / người phụ trách, giữ phụ thuộc |
| m-06 | Minor | Thân 499 issue trên Project (dòng "Giờ sơ bộ N") | — | Người xem Project public thấy hai số giờ khác nhau trên cùng issue: #116 thân "Giờ sơ bộ 16" nhưng Hours 40; #315 thân 42, Hours 12 | Không cần sửa 499 thân issue. Thêm một câu chú giải ở README (P5) và estimate.md §2: "Giờ sơ bộ trong thân issue = ước ở P1 / chỗ giữ LAB-1; số dùng là trường Hours" |
| m-07 | Minor | `backlog/scripts/build-estimate-swp-hours.py` dòng `K = 2.0` (chú thích "estimate.md §3"); `estimate-lab1-comparison.yaml` dòng 1 ("estimate.md §5"); `task-breakdown.md` §1.3 "27 issue (26 lá) / 254 giờ" | — | Chú thích trỏ sai mục (đúng là §2.1 và §4). task-breakdown §1.3 vẫn ghi cam kết Iteration 1 theo giờ sơ bộ 254, trong khi Project ghi 224 | Sửa số mục; ở §1.3 ghi cả hai số và nói P4 burndown dùng số nào (Hours trên Project hoặc SWP) |

## Kết quả theo 7 điểm soi

1. **estimate.md**: đủ 5 phần, đúng thứ tự (đường dẫn HTML → issue mẫu → quy giờ → tổng epic → so LAB-1), đủ cột tối thiểu, có thêm cột (được phép). Link HTML đúng file. Bảng issue mẫu ghi đúng chốt của người dùng (giữ #24 / #69 / #486 kèm lý do giữ; #116 → 20 lan sang 3 issue; #97 → 4 chỉ riêng issue này), khớp HTML mục Calibration và payload. Đạt.
2. **k**: giữ k = 2,0, bác k thiết kế (lý do ở trên). Lỗi nguồn nhỏ: m-01.
3. **So LAB-1**: bảng đúng cột, số LAB-1 đúng bản 概算見積書 v2.1, cột Vì sao trỏ dòng PREMISE có thật (L5-A01, A10, A12, A14–A17, D02, D05–D08 — đã kiểm từng ID). −71% đúng hướng nhưng còn ≈ 1.590 giờ chưa giải thích (m-03), và một phần là backlog thiếu việc → cần issue bổ sung (M-02), không chỉ ghi rủi ro. **FB-EXP-344 / N-04: xử lý đúng** — tách 2 dòng thiết kế, không cộng vào FG, trừ ~6 giờ wireframe, tải 第4波 chuyển sang P4. Giữ trạng thái "Fixed phần estimate — chờ P4" như PL ghi.
4. **Project**: 499/499 item khớp CSV; mẫu 18 item (5 epic, 1 cha, 12 lá) khớp; cha = tổng con. Đạt.
5. **Quy trình chấm SWP**: đúng tinh thần đề. Chọn mẫu bằng bộ chọn tất định của skill (`core.representatives.select_representatives`), không chọn tay. Người dùng chốt từng issue, 2 vòng, có lý do (ghi trong HTML và estimate.md). Hiệu chỉnh lan theo đúng tầng `cal-001`. Point ghi từ payload, đọc lại 100%. Chỗ lệch khỏi skill / plan: m-04, m-05 — không làm sai số đã ghi, chỉ cần ghi lại cho minh bạch.
6. **22 lá > 16 giờ**: phá quy tắc §1.1 (L5-D08). "Tách trước sprint planning" chưa đủ nếu không có quyết định của người dùng, nhãn và câu chữ sửa theo → M-01.
7. **Dữ liệu nhạy cảm trong HTML**: sạch (xem bảng kiểm). Đạt.

Luật CLAUDE.md: không thấy vi phạm. Epic ghi 相対 là "main flow", せり là "secondary flow"; 許可 = permit tách khỏi 承認 = approval; không có chỗ nào tự động hóa phần người quyết; estimate không đụng option. §4.1 có câu "Hours không thay số hợp đồng, không dùng để đề xuất giảm giá" — đúng, giữ nguyên.

## Điều kiện để release

1. **Trước khi bắt đầu P4**: M-02 (a), (b) xong (có issue + SWP qua skill + HTML / CSV / Project / estimate.md cập nhật), hoặc có quyết định của người dùng ghi ở PREMISE; (c) quy tắc giữ năng lực QA ghi ở task-breakdown §1.3.
2. **Trước khi bắt đầu P4**: M-01 theo phương án người dùng chọn (A hoặc B). Tối thiểu: dòng PREMISE + nhãn trên Project + sửa câu §1.1.
3. **Trước Gate C**: m-01..m-07.
4. Chạy lại chuỗi build → write → render sau khi sửa. Lần kiểm diff, Expert sẽ đếm lại payload ↔ CSV ↔ Project (0 lệch) và tổng cha.

## Điểm làm tốt

- Một nguồn số duy nhất (payload trong HTML → CSV → Project / bảng md), sinh bằng script, có kiểm cha = tổng lá và đọc lại 499 item. Expert tự đếm lại không thấy lệch nào.
- Bảng §2.2 tự phơi chỗ yếu của một hệ số k theo từng loại việc, thay vì giấu sau một tổng.
- So LAB-1 có kỷ luật: số LAB-1 trích đúng 人日 × 8, tách thiết kế theo N-04, tách khoản ngoài sản phẩm (PM / BrSE / SV), và nói thẳng "Hours không thay số hợp đồng".
- Che giờ sơ bộ khỏi thân issue trước khi chấm, để điểm không neo vào giờ PL tự ước.

---

## Kiểm diff `8f44f43..488ee8c` (4 commit: 03b7f27, 93f8d68, d698959, 488ee8c) — 2026-11-27

Quyết định người dùng 2026-11-27 (qua điều phối): M-01 = ngoại lệ có tên + tách ngay 4 lá 完納 (#486 tách thêm lần hai thành #486 / #510); M-02 = thêm issue thô #500, #501; QA theo DoD 4 = rủi ro + giữ 30% năng lực QA. Chấm lại bằng `tkm:sun-estimate` hai lần, người dùng chốt issue mẫu.

**Verdict cuối Gate B: RELEASE** — điều kiện 1, 2, 4 đạt; điều kiện 3 (m-01..m-07) đạt hoặc đã xếp lịch P5 đúng hạn (trước Gate C). Mới: 0 Critical · 0 Major · 2 Minor (mang sang Gate C).

### Tự đếm (chỉ đọc; Project bằng `gh project item-list`)

| Kiểm | Kết quả |
|---|---|
| 3 payload theo thứ tự P3 → gate-b → 486-split (lần sau thay lần trước) | cả 3 `calibrated`; payload trong 2 HTML mới = `payload-final.json` ở `rescore-gate-b/`, `rescore-486/` |
| Lá CSV ↔ điểm cuối của 3 payload | 409 lá, 0 lệch; Hours = SWP × 2 ở mọi lá. #381, #489, #494 có điểm ở P3 nhưng nay là cha — script bỏ đúng |
| Tổng | 1.737 SWP · 3.474 giờ · giờ dự báo 2.732 + 2.660 = **5.392** — khớp estimate.md |
| Cha / epic = tổng con | 101 / 101 đúng cả SWP và giờ (vd. #466 = 37 SWP / 74 giờ, gồm #486 4, #504 8, #506 8, #510 8 và các lá anh em) |
| Project ↔ CSV | 510 / 510 item, 0 lệch Point / Hours, không thiếu item |
| `needs-split` ↔ lá không thô có Hours > 16 | **18 = 18, trùng từng số** (#4, 116, 119, 190, 201, 223, 253, 257, 281, 282, 294, 328, 331, 355, 377, 379, 422, 432); không gắn nhầm lên cha |
| Lá FG-09 > 16 giờ | **0**. Lá tách ra: #502 10 · #503 8 · #504 16 · #505 12 · #506 16 · #507 8 · #508 10 · #509 10 · #486 8 · #510 16 |
| Lá thô > 16 giờ | #295, #296, #500, #501 — đúng luật issue thô (không trần), không cần nhãn |
| Iteration 1 | vẫn 26 lá / 112 SWP / 224 giờ — không lá nào bị đụng |
| 2 HTML mới: token / email / đường dẫn máy | 0 / 0 / 0 |

### Theo từng finding

| Finding | Kết quả | Bằng chứng |
|---|---|---|
| M-01 / FB-EXP-348 | **Đạt** | PREMISE L5-D08 có "Ngoại lệ có tên" kèm ngày người dùng xác nhận; task-breakdown §1.1 dòng "Cỡ lá", DoD 6, nhãn §1.3 đã sửa; 18 nhãn trên Project khớp; 4 lá FG-09 tách xong, #486 tách lần hai thành #486 (4) / #510 (8 = 16 giờ, đúng trần) |
| M-02 / FB-EXP-349 | **Đạt** | PREMISE L5-D12; #500 `C-PLAT-12` giữ 216 giờ (240 − 24 giờ khung màn đã có), #501 `C-TEST-10` giữ 489 giờ (61,1 人日), cả hai được skill chấm và người dùng chốt; giữ 30% QA ở task-breakdown §1.3 (Iteration 1: 18 + 12 ≤ 40) |
| m-01 / 350 | Đạt | §2.1 dùng một nguồn (giờ sơ bộ), trung vị 1,75; LAB-1 24 giờ của #486 để riêng làm đối chiếu |
| m-02 / 351 | Đạt | dòng "Giờ dự báo cả đợt" 5.392 giờ ở §2.2, nói rõ dùng cho rủi ro mốc |
| m-03 / 352 | Đạt | bảng cầu nối §4.1 cộng đúng 8.416,4 (Expert cộng lại khớp); có dòng "chưa giải thích" 1.049,4 giờ; 451 ghi rõ là số còn lại theo phép trừ. Cột デザイン 41,6 人日 là đúng — Expert ghi 40,9 ở vòng trước là đọc nhầm dòng, PL sửa đúng |
| m-04 / 353 | Đạt phần plan; AI-report chờ P5 (đúng hạn) | plan §0 dòng 5 ghi `reports/`; progress-lab5 "Ghi cho P5" |
| m-05 / 354 | Chờ P5 (đúng hạn) | progress-lab5 "Ghi cho P5" mục AI-report ③ |
| m-06 / 355 | Đạt phần estimate; README chờ P5 | estimate.md §2 dòng "Giờ trong thân issue" |
| m-07 / 356 | Đạt | chú thích script → §2.1, yaml → §4; task-breakdown §1.3 ghi cả 254 giờ sơ bộ và 224 giờ Project, burndown P4 dùng Hours |

**Điểm soi 4 — 2 issue thô và ≈ 1.050 giờ chưa giải thích:** chấp nhận được.
- #500 / #501 có căn cứ số từ LAB-1 và đúng cơ chế rolling-wave.
- #501 chờ kế hoạch test thay vì chờ thiết kế: đây là ngoại lệ hợp lý, đã ghi trong L5-D12.
- Phần chưa giải thích 1.049,4 giờ (12% tổng chênh) được ghi thẳng là "chưa giải thích bằng số", kèm hai nguyên nhân có thể (FE × 1,3, giờ dev / test ước thấp hơn LAB-1). Có giờ dự báo 5.392 và câu "Hours không thay số hợp đồng" đi kèm, nên phần dư này không làm sai cách dùng estimate. Kiểm lại bằng giờ thật sau Iteration 1.

**Điểm soi 5 — estimate.md:**
- 3 link HTML đúng tên file, đều có trong `reports/`.
- Bảng §1.1 / §1.2 đúng mẫu skill chọn (#503 nhỏ nhất, #504 trung vị, #501 lớn nhất, #500 lệch xa, #486 độ tin cậy thấp nhất; lần 2 lấy cả hai issue). Đúng S × C → SWP, đúng chốt và lý do của người dùng, khớp phần `corrections` trong payload.
- Cộng 1.701 → 1.734 → 1.737 đúng.

### Phát hiện mới

| # | Mức | File:vị trí | ID / ref | Vấn đề | Cách sửa đề xuất |
|---|---|---|---|---|---|
| R-01 | Minor (trước Gate C) | payload 3 lần chấm; `estimate.md` §1.1 | `cal-001` P3; `cal-001`, `cal-002` gate-b | Hiệu chỉnh chỉ lan trong từng lần chấm, không lan sang lá cùng tầng ở lần khác. Ba chỗ lệch: (1) **#507** (QA · test-execution · cross-layer + qa-matrix · stateful) cùng tầng với quy tắc #116 mà người dùng đã chốt "áp cho cả nhóm test QA cùng loại", nhưng vẫn 4 SWP, chưa +1 bậc độ rộng. (2) Quy tắc #503 (+1 bậc độ khó, đánh dấu không riêng issue) trùng tầng với 15 lá P3 (#228, 229, 250, 266, 272, 274, 284, 317, 321, 367, 371, 407, 408, 467, 474) mà các lá này không đổi. Nhưng lý do người dùng nêu (gán nguồn + năm TC) là đặc thù K6, nên rất có thể phải đánh dấu riêng issue. (3) Quy tắc #504 trùng tầng với #226, #249 (6 SWP). Không lá nào thuộc Iteration 1; ảnh hưởng ≈ +20 SWP (~1%) | Hỏi người dùng 3 câu: #503 riêng issue? quy tắc #504 chỉ cho phần ghi K8 hay cả tầng? #507 có theo quy tắc #116 không? Theo câu trả lời: sửa cờ `issueSpecific` / chấm lại các lá bị ảnh hưởng bằng skill, hoặc ghi ở §1.1 rằng hiệu chỉnh tính theo từng lần chấm và người dùng chấp nhận. Chạy lại build → write → render |
| R-02 | Minor (trước Gate C) | `estimate.md` §2 dòng "Áp dụng nhất quán"; `task-breakdown.md` §1.1 đoạn "Hệ quả"; `estimate.md` §1 dòng #486 | — | Số cũ còn sót: §2 ghi "gộp hai payload… đủ 509 dòng… đọc lại cả 499 item" (đúng là ba payload, 510 dòng, đọc lại 510). task-breakdown §1.1 ghi "491 issue (264 + 227), 408 lá" trong khi §1.4 ghi 264 + 228, 409 lá. Bảng §1 dòng #486 "Giữ 15" không có chú thích rằng đã bị §1.1 / §1.2 thay | Sửa ba chỗ; thêm "(phạm vi #486 đã đổi — xem §1.1, §1.2)" ở bảng §1 |

### Điều kiện còn lại (không chặn P4)

Trước Gate C: R-01, R-02; FB-EXP-353 / 354 / 355 phần AI-report / README ở P5.

### Điểm làm tốt (vòng này)

- Script build đọc 3 payload theo thứ tự khai trong `gate-b-decisions.yaml`. Script dừng nếu `reports/` lệch danh sách, nếu còn `rescore_pending`, hoặc nếu cha không bị chấm lại mà lệch SWP P3.
- #486 tách tiếp tới đúng trần 16 giờ thay vì để một lá 18 giờ, và người dùng quyết trước khi chấm.
- Bảng cầu nối có dòng phần chưa giải thích, ghi thẳng là chưa giải thích bằng số.
