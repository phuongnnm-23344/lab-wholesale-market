# Estimate LAB-5 — SWP và giờ của backlog Product A

**Báo cáo HTML của skill chấm SWP (`tkm:sun-estimate`):** [`reports/sun-estimate-lab5-project1-20261127-0216.html`](reports/sun-estimate-lab5-project1-20261127-0216.html)

Phạm vi: GitHub Project 1 — lần chấm P3: 499 item (18 epic + 481 issue), 401 lá được chấm, 98 cha / epic lấy tổng con; sau Gate B thêm 10 issue (#500–#509, tách lá > 16 giờ + 2 issue thô, PREMISE L5-D08, L5-D12). Point = SWP đã chốt, Hours = SWP × 2,0 (§2). Số trong các bảng §2.2, §3, §4 sinh bằng script từ payload nhúng trong báo cáo HTML, không gõ tay (`backlog/scripts/build-estimate-swp-hours.py` → `backlog/estimate-swp-hours.csv` → `render-estimate-tables.py`).

<!-- BEGIN GEN pending -->
> **Đang chờ chấm SWP (11 lá, sau Gate B):** B-FG09-08.1, B-FG09-08.2, B-FG09-10.2, B-FG09-10.4, B-FG09-10.5, B-FG09-16.1, B-FG09-16.2, B-FG09-18.1, B-FG09-18.2, C-PLAT-12, C-TEST-10. Các bảng dưới là số của lần chấm P3: lá mới chưa có trong bảng, lá đổi phạm vi còn SWP cũ; người dùng chốt điểm rồi chạy lại build → ghi field → render.
<!-- END GEN pending -->

## 1. Issue mẫu skill chọn để kiểm

Skill chọn 5 lá theo vị trí trong phân bố (nhỏ nhất, trung vị, lớn nhất, lệch xa, độ tin cậy thấp nhất). **Người chốt: người dùng (học viên), 2026-11-27**, mỗi issue 2 vòng (mức khó → điểm cụ thể). Thang: rất dễ 1–2 · dễ 3–5 · vừa 6–12 · khó 13–25 · rất khó 26+. SWP = ô của ma trận Scope × Complexity (`swp-matrix-v2`).

Lưu ý khi đọc: thân issue đã che giờ sơ bộ, người phụ trách, danh sách ID RFP và mục phụ thuộc trước khi chấm — điểm phản ánh cấu trúc việc, không neo vào giờ. Project này là bài lab, không nối KPI Insight nên không có giờ thật lịch sử để đối chiếu.

| Issue | Skill chấm (Scope × Complexity → SWP) | Bạn chốt | Lý do |
|---|---|---|---|
| #24 `[CLAR][OPEN-DB-09]` Hỏi khách thủ tục cấp mới / đình chỉ / thu hồi 許可 (仲卸) và 承認 (売買参加者) | 1 × 1 → **1** (rất dễ; lý do chọn: nhỏ nhất) | **Giữ 1** | Một bộ câu hỏi gửi khách (ai 決裁, có cơ hội 弁明 không); không phải phân tích — đúng mức thấp nhất |
| #69 `[FG-03][DEP-04]` Thiết kế sync (Technical / API Design DEP-04) + Screen Spec SC-03-07 | 3 × 1 → **4** (dễ; trung vị) | **Giữ 4** | Một tài liệu thiết kế sync + một màn; độ rộng suy được từ DEP-04, không có điểm khó riêng |
| #486 `[FG-09][K8]` 期ロック — `lock_period` trong một transaction | 5 × 5 → **15** (khó; lớn nhất) | **Giữ 15** | Ghi nhiều bảng + outbox + audit trong một transaction, khóa NOWAIT / advisory, 8 bước kiểm, rollback toàn bộ — thao tác tiền nhạy cảm của 完納奨励金 |
| #116 `[TEST][BusinessScenario]` Kịch bản nghiệp vụ một ngày chợ + một kỳ, 相対 trước | 8 × 2 → **12** (vừa; lệch xa trung vị) | **20** (13 × 2, khó) | E2E phải đi trọn một ngày chợ (tiếp nhận → 相対 / せり → giao → 日次締め → sửa) và một kỳ thưởng tới 期ロック — rộng hơn skill đánh giá. **Áp cho cả nhóm test QA cùng loại** (quy tắc `cal-001`: QA · test-execution · cross-layer + qa-matrix · stateful) |
| ↳ #201 `[TEST][UatSupport]` Hỗ trợ UAT | 5 × 2 → 8 | **12** (8 × 2) — lan truyền từ #116 | Cùng loại với #116 (người dùng chốt áp cho nhóm) |
| ↳ #331 `[FG-08][CorrectionDecide]` Test 決裁 sửa sau chốt | 5 × 2 → 8 | **12** (8 × 2) — lan truyền từ #116 | Cùng loại với #116 |
| ↳ #379 `[FG-07][DayClose]` Test 日次締め | 5 × 2 → 8 | **12** (8 × 2) — lan truyền từ #116 | Cùng loại với #116 |
| #97 `[FG-03][LotCarryOver]` Chuyển lô sang ngày sau `fn_lot_carry_over` (DEP-05, issue thô) | 2 × 2 → **3** (dễ; độ tin cậy thấp nhất) | **4** (2 × 3) — **chỉ riêng issue này** | Hàm chạy bên trong transaction 日次締め nên lỗi kéo hỏng cả lần khóa ngày; người dùng nâng độ khó nhưng không lan sang issue khác vì đặc điểm này chỉ issue này có |

Kết quả: 393 lá giữ nguyên, 4 lá mẫu (#24, #69, #486, #116) và 1 lá riêng (#97) theo chốt của người dùng, 3 lá lan truyền. **Tổng SWP lá: 1.680 → 1.701** (+21 = #116 +8, #201 / #331 / #379 +4 × 3, #97 +1).

## 2. Cách quy ra giờ

| Mục | Nội dung |
|---|---|
| Cách đã chọn | **Quy ước đổi SWP → giờ**, không ước giờ trực tiếp từ từng issue |
| Vì sao | `tkm:sun-estimate` không sinh giờ; ước trực tiếp 401 lá thì không kiểm được giờ có đi cùng SWP hay không. Một hệ số chung giữ đúng thứ tự lớn / nhỏ mà người dùng đã chốt ở §1; muốn đổi giờ của một issue phải đổi SWP qua người chốt (plan §4, người dùng đồng ý một hệ số — Q3) |
| Quy tắc | **Hours = SWP × k, k = 2,0 giờ / SWP**, làm tròn 0,5 giờ (với k = 2,0 luôn ra số nguyên). Lá: Point = SWP, Hours = SWP × 2,0. Cha / epic: Point = SWP cộng dồn của lá con cháu, Hours = tổng Hours con. Không sửa tay Point / Hours trên Project |
| Giờ trong thân issue | Dòng "Giờ sơ bộ N" trong thân issue là giờ ước khi break (P1) hoặc chỗ giữ giờ LAB-1 của issue thô — chỉ để đối chiếu. **Số dùng để lập kế hoạch là trường Hours** (vd. #116 thân 16, Hours 40) |
| Áp dụng nhất quán | Một nguồn: payload nhúng trong báo cáo HTML → `build-estimate-swp-hours.py` (kiểm SWP cha = tổng lá, đủ 499 dòng) → `backlog/estimate-swp-hours.csv` → `write-point-hours-to-project.py` (chỉ ghi ô khác, giãn 2 giây / lần ghi, đọc lại cả 499 item so từng dòng). Đổi SWP → chạy lại ba bước |

### 2.1 Chốt k = 2,0 thế nào

Đối chiếu ba nguồn:

| Nguồn | Giờ / SWP | Ghi chú |
|---|---|---|
| Issue mẫu người dùng chốt, so giờ của chức năng tương ứng | Một nguồn cho cả 4 mẫu: giờ sơ bộ P1 của chính issue (`hours_hint`). #24: 2 giờ / 1 = **2,0** · #69: 12 giờ / 4 = **3,0** (giờ sơ bộ của issue thiết kế tính theo 基本設計 LAB-1: 8 giờ / màn + 15% công BE phần sync) · #486: 16 giờ / 15 = **1,07** · #97: 6 giờ (giữ chỗ theo LAB-1) / 4 = **1,5** · #116: 16 giờ / 20 = 0,8 — bỏ, vì giờ sơ bộ bị chặn ở trần 16 giờ / lá trong khi người dùng nói việc lớn hơn. Đối chiếu thêm (không tính vào trung vị): #486 so với LAB-1 FT-09-07 期ロック BE 3 人日 = 24 giờ / 15 = 1,6 | Trung vị 4 mẫu: **1,75** |
| Giờ sơ bộ P1 (ước theo issue, `hours_hint`) của 304 lá không phải thô | Bình quân gia quyền **2,07**; dev (167 lá) trung vị **2,0**; nhóm SWP 3–5 (190 lá) 2,0–3,0 | Lá SWP ≥ 8 chỉ còn 0,8–1,8 vì giờ sơ bộ bị chặn 16 giờ |
| Estimate LAB-1 theo nhóm chức năng (FG-01..15, 738,6 人日 = 5.909 giờ) / SWP các lá không phải thiết kế của FG-01..15 (1.250) | 4,7 | Chỉ dùng để kiểm trần: dòng FG của LAB-1 gồm QA 30–50% công FE + BE, FE × 1,3 cho 2 bố cục, thiết kế màn — không phải giờ của một issue. Lấy 4,7 thì gần hết lá dev > 16 giờ, trái nguyên tắc độ hạt §1.1 của task-breakdown |

**Chốt k = 2,0**: nằm giữa trung vị issue mẫu (1,75) và giờ sơ bộ theo issue (2,07), là số tròn dễ áp. Hệ quả kiểm được: việc "dễ" 3–5 SWP = 6–10 giờ, đúng cỡ lá 4–16 giờ; Iteration 1 (26 lá, 112 SWP) = **224 giờ** so với 254 giờ sơ bộ, không lá nào > 16 giờ, vẫn trong năng lực 360 giờ (task-breakdown §1.3).

### 2.2 Chỗ một k chung lệch theo loại việc (Expert Gate B: giữ một k = 2,0)

<!-- BEGIN GEN kind-check -->
| Loại lá | Số lá | SWP | Giờ sơ bộ (P1) | Giờ sơ bộ / SWP | Giờ = SWP × 2 | Chênh so với giờ sơ bộ |
|---|---|---|---|---|---|---|
| dev | 167 | 770 | 1.653 | 2,15 | 1.540 | −113 (−7%) |
| test | 42 | 315 | 430 | 1,37 | 630 | +200 (+47%) |
| thiết kế | 54 | 213 | 653 | 3,07 | 426 | −227 (−35%) |
| làm rõ | 41 | 55 | 60 | 1,09 | 110 | +50 (+83%) |
| thô (giữ chỗ) | 97 | 348 | 1.955 | 5,62 | 696 | −1.259 (−64%) |
| **Tổng** | **401** | **1.701** | **4.751** | **2,79** | **3.402** | **−1.349 (−28%)** |
| **Giờ dự báo cả đợt** (đo tải mốc S2–S8) | | | | | **4.661** | = lá không thô SWP × 2 (2.706) + lá thô theo giờ giữ chỗ (1.955) |
<!-- END GEN kind-check -->

- **Thô (giữ chỗ) −64%**: 97 lá thô giữ giờ LAB-1 (PREMISE L5-A01) nhưng skill chấm theo đơn vị tự nhiên thiếu spec (độ tin cậy thấp — caveat trong báo cáo HTML). Đây là lệch lớn nhất. Không đổi: giờ giữ chỗ LAB-1 vẫn ghi trong thân issue và ở cột Ghi chú §3; khi issue thiết kế xong, issue thô tách thành lá dev / test ≤ 16 giờ và **lá mới được chấm lại** — lúc đó giờ theo spec thay cho cả hai con số.
- **Thiết kế −35%**: SWP chấm viết tài liệu thấp hơn cách tính 8 giờ / màn của LAB-1 (giờ sơ bộ / SWP = 3,1). Ảnh hưởng mốc 設計第1–4波 — xem §4 dòng thiết kế.
- **Test +47%, làm rõ +83%**: SWP chấm test nặng hơn giờ sơ bộ (sau hiệu chỉnh `cal-001`); làm rõ lệch nhiều về tỷ lệ nhưng chỉ 50 giờ.
- **Không thêm k thứ hai** (Expert Gate B quyết giữ một k): người dùng chốt một hệ số (plan §0 dòng 12); bảng trên so với giờ sơ bộ PL tự ước, chưa phải giờ thật — sửa riêng thiết kế (+213 giờ) mà không sửa test / làm rõ theo chiều ngược lại là chọn lọc. Thiết kế xem lại riêng ở lần hiệu chỉnh sau Iteration 1; tải 設計第4波 đo bằng **giờ sơ bộ 311 giờ**, không bằng SWP × 2.
- **Giờ dự báo cả đợt** (dòng cuối bảng): Hours của lá thô = SWP × 2 thấp hơn giờ giữ chỗ có hệ thống (chấm không nâng điểm khi thiếu spec), nên tổng Hours không dùng để dự báo tải S2–S8. Rủi ro mốc ở progress-report dùng **giờ dự báo cả đợt**; Hours trên Project dùng cho sprint đang lập kế hoạch.
- **22 lá đã có spec có Hours > 16 giờ** (SWP ≥ 9), không lá nào trong Iteration 1 — xử lý theo **ngoại lệ có tên ở PREMISE L5-D08, người dùng xác nhận 2026-11-27**: 4 lá 完納奨励金 tách ngay (#381 → #502, #503; #486 thu hẹp + #504, #506 cùng cha #466; #489 → #505, #507; #494 → #508, #509), chờ chấm SWP; 18 lá còn lại mang nhãn `needs-split` trên Project, tách và chấm lại trước buổi lập kế hoạch sprint dự kiến (danh sách theo epic ở §3).
- **Hiệu chỉnh k sau Iteration 1**: k = 2,0 là giả định trước khi có giờ thật. Hết sprint giả lập, so giờ đốt với SWP đã xong; lệch > 20% thì đề xuất k mới qua người dùng, chạy lại build + ghi field.

## 3. Tổng theo epic

Số issue = lá / tất cả issue trong epic (gồm cha). SWP và giờ cộng theo lá; cha / epic trên Project mang đúng tổng này.

<!-- BEGIN GEN epic-totals -->
| Epic | Số issue (lá / tất cả) | Tổng SWP | Tổng giờ | Ghi chú |
|---|---|---|---|---|
| #5 EP-FG01 — [FG-01][EPIC] Participants and qualifications: permit (wholesaler) / approval (trading participant) | 35 / 43 | 141 | 282 | 2 lá thô: giữ chỗ 22 giờ LAB-1 → 12 giờ |
| #6 EP-FG03 — [FG-03][EPIC] Lot intake and inspection records — intake, quality inspection, offline / sync | 31 / 39 | 123 | 246 | 8 lá thô: giữ chỗ 141 giờ LAB-1 → 66 giờ |
| #7 EP-FG04 — [FG-04][EPIC] Negotiated (aitai) trades — main flow | 30 / 37 | 118 | 236 | 8 lá thô: giữ chỗ 119 giờ LAB-1 → 50 giờ; needs-split (> 16 giờ, tách trước sprint planning): #432 |
| #8 EP-FG05 — [FG-05][EPIC] Auction result recording — secondary flow | 12 / 15 | 40 | 80 | 2 lá thô: giữ chỗ 42 giờ LAB-1 → 16 giờ |
| #9 EP-FG06 — [FG-06][EPIC] Delivery management — deliveries, exceptions, disputes | 22 / 30 | 94 | 188 | 2 lá thô: giữ chỗ 31 giờ LAB-1 → 14 giờ; needs-split (> 16 giờ, tách trước sprint planning): #377 |
| #10 EP-FG07 — [FG-07][EPIC] Reconciliation and daily close — reconciliation, day lock, disputes / SLA | 16 / 20 | 81 | 162 | 6 lá thô: giữ chỗ 176 giờ LAB-1 → 42 giờ; needs-split (> 16 giờ, tách trước sprint planning): #328, #379 |
| #11 EP-FG08 — [FG-08][EPIC] Correction requests and sign-off — post-confirmation adjustments (REVERSE / DELTA) | 13 / 16 | 72 | 144 | 3 lá thô: giữ chỗ 80 giờ LAB-1 → 18 giờ; needs-split (> 16 giờ, tách trước sprint planning): #281, #282, #331 |
| #12 EP-FG09 — [FG-09][EPIC] On-time full-payment incentive | 36 / 42 | 184 | 368 | 7 lá thô: giữ chỗ 136 giờ LAB-1 → 50 giờ |
| #13 EP-FG10 — [FG-10][EPIC] Rule versions, incentive rates, masters, calendar | 30 / 36 | 125 | 250 | 13 lá thô: giữ chỗ 292 giờ LAB-1 → 88 giờ |
| #14 EP-FG02 — [FG-02][EPIC] Accounts, authentication, authorization — accounts, MFA, proxy, PIN | 32 / 40 | 130 | 260 | 5 lá thô: giữ chỗ 96 giờ LAB-1 → 34 giờ |
| #15 EP-FG11 — [FG-11][EPIC] Reports and data export — 12 reports, accounting CSV | 35 / 41 | 138 | 276 | 21 lá thô: giữ chỗ 468 giờ LAB-1 → 140 giờ |
| #16 EP-FG12 — [FG-12][EPIC] Notifications — in-app + email | 9 / 11 | 37 | 74 | 4 lá thô: giữ chỗ 56 giờ LAB-1 → 20 giờ |
| #17 EP-FG13 — [FG-13][EPIC] Audit and security — audit log, security, 7-year retention | 16 / 20 | 66 | 132 | 8 lá thô: giữ chỗ 132 giờ LAB-1 → 54 giờ |
| #18 EP-FG14 — [FG-14][EPIC] Operations monitoring and availability — monitoring, backup, RTO / RPO | 8 / 8 | 48 | 96 | 1 lá thô: giữ chỗ 16 giờ LAB-1 → 6 giờ; needs-split (> 16 giờ, tách trước sprint planning): #257, #294 |
| #19 EP-FG15 — [FG-15][EPIC] Data migration | 10 / 14 | 66 | 132 | 7 lá thô: giữ chỗ 148 giờ LAB-1 → 86 giờ; needs-split (> 16 giờ, tách trước sprint planning): #223 |
| #1 EP-PLAT — [PLAT][EPIC] Platform — AWS foundation, CI/CD, app skeleton, shared conventions | 14 / 15 | 82 | 164 | needs-split (> 16 giờ, tách trước sprint planning): #4, #190, #253 |
| #20 EP-TEST — [TEST][EPIC] System testing, UAT and release | 11 / 13 | 101 | 202 | needs-split (> 16 giờ, tách trước sprint planning): #116, #119, #201, #355, #422 |
| #21 EP-CLAR — [CLAR][EPIC] To clarify — open points with the customer / internal | 41 / 41 | 55 | 110 | — |
| **Tổng** (18 epic) | **401 / 481** | **1.701** | **3.402** | giờ sơ bộ 4.751; cha / epic = tổng con |
<!-- END GEN epic-totals -->

## 4. So với estimate LAB-1

LAB-1 = 概算見積書 第1期 §4.2 (bảng 機能グループ別・工程別, bản nộp LAB-1), 人日 × 8 giờ (PRM-001). LAB-5 cột "giờ sơ bộ" = giờ ước theo issue ở P1; cột "SWP × 2" = giờ ghi lên Project. Dòng FG-01..15 không gồm issue thiết kế — thiết kế so riêng với 基本設計 (FB-EXP-344 / N-04).

<!-- BEGIN GEN lab1-compare -->
| Phần | LAB-1 (giờ) | LAB-5 giờ sơ bộ (P1) | LAB-5 (giờ = SWP × 2) | Chênh LAB-5 − LAB-1 | Vì sao |
|---|---|---|---|---|---|
| FG-01 参加者・資格管理 | 534,4 | 283 | 256 | −278,4 (−52%) | Spec LAB-4 đủ (PARTY), dev tách sát spec; QA LAB-1 tính 30–50% công FE + BE (124 giờ), LAB-5 chỉ có 3 issue test (38 giờ) — chạy case theo DoD 4 của từng issue không có giờ riêng |
| FG-02 アカウント・認証・権限 | 425,6 | 316 | 220 | −205,6 (−48%) | Thiết kế API iam + màn SC-00-01..03 chuyển sang dòng thiết kế (PREMISE L5-D05); 5 lá thô giữ 96 giờ LAB-1 nhưng SWP chỉ quy ra 34 giờ (L5-A01) |
| FG-03 ロット受付・評価記録 | 465,6 | 315 | 214 | −251,6 (−54%) | Thêm khung PWA / offline dùng chung A-FG03-17 (+16 giờ sơ bộ, PREMISE L5-A17); 8 lá thô 141 → 66 giờ (L5-A01) |
| FG-04 相対取引 | 512 | 297 | 208 | −304 (−59%) | Luồng chính có spec LAB-4 (3 TECH), dev / test sát spec; 8 lá thô 119 → 50 giờ (L5-A01); QA LAB-1 50% (giao dịch tiền) không có dòng tương ứng |
| FG-05 せり結果記録 | 141,6 | 116 | 72 | −69,6 (−49%) | Luồng phụ, phạm vi nhỏ; 2 lá thô 42 → 16 giờ (L5-A01) |
| FG-06 引渡し管理 | 463,2 | 205 | 176 | −287,2 (−62%) | Dev / test theo 2 TECH LAB-4; LAB-1 nhân FE × 1,3 cho màn có 2 bố cục PC / tablet, LAB-5 không có hệ số này; 2 lá thô 31 → 14 giờ |
| FG-07 照合・日次締め | 432 | 252 | 138 | −294 (−68%) | 6 lá thô giữ 176 giờ LAB-1 → 42 giờ — lệch lớn nhất trong FG (L5-A01); migration CLOSE_DB đặt ở đây nhưng không đổi giờ (L5-A12) |
| FG-08 修正申請・決裁 | 313,6 | 162 | 132 | −181,6 (−58%) | Migration ADJUST_DB / trade_fixes đặt ở đây (L5-A12, không đổi giờ); 3 lá thô 80 → 18 giờ (L5-A01) |
| FG-09 完納奨励金 | 654,4 | 398 | 342 | −312,4 (−48%) | Tách theo khối K1–K9 + TV-01..15, test nặng nhất (108 giờ); BILLING_DB / IF-ACC-01 chuyển sang FG-11 (PREMISE L5-A14); 7 lá thô 136 → 50 giờ |
| FG-10 規則版・交付率・マスタ・カレンダー | 496 | 400 | 204 | −292 (−59%) | 13 lá thô giữ 292 giờ → 88 giờ (L5-A01); thêm file cấu hình có nhật ký B-FG10-14 (L5-A15); nhánh rollback E-14 chờ khách (L5-D02) |
| FG-11 帳票・データ出力 | 608 | 498 | 178 | −430 (−71%) | 15 chức năng / 16 màn chưa spec — 21 lá thô theo nhóm báo cáo (L5-D06) giữ 468 giờ → 140 giờ; nhận thêm BILLING_DB C-FG11-08 (+6 giờ sơ bộ, L5-A14) |
| FG-12 通知 | 244,8 | 94 | 64 | −180,8 (−74%) | 4 lá thô 56 → 20 giờ (L5-A01) |
| FG-13 監査・セキュリティ | 313,6 | 186 | 102 | −211,6 (−67%) | 4 bảng xuyên suốt IAM_AUDIT_DB làm một lần ở C-FG13-01 (L5-D07, L5-A16); 8 lá thô 132 → 54 giờ |
| FG-14 運用監視・可用性 | 112,8 | 74 | 92 | −20,8 (−18%) | Gần LAB-1 nhất — giám sát / sao lưu đã rõ ở ADR LAB-4, dev tách cụ thể; thay kiểm tra tự động 01:45 bằng cảnh báo (L5-A10) |
| FG-15 データ移行 + MG 移行作業 | 535,2 (FG-15 23,9 + MG 43,0 人日) | 160 | 102 | −433,2 (−81%) | LAB-5 gộp chuyển đổi / làm sạch / diễn tập vào FG-15; 7 lá thô 148 → 86 giờ; phần BrSE của MG (9 人日, làm việc với khách về dữ liệu) không thành issue |
| Thiết kế (基本設計, phần còn lại sau LAB-4) | 606,1 (BD 132,1 人日 (1.057 giờ) − phần LAB-4 đã làm ≈ 451 giờ = 606 giờ; trừ thêm ~6 giờ デザイン của 3 màn đã có wireframe (SC-03-02, SC-03-07, SC-04-05) → ≈ 600 giờ) | 653 | 426 | −180,1 (−30%) | FB-EXP-344 / N-04: so riêng, không cộng vào FG. Phần còn lại theo cách tính LAB-1: 58 màn × 8 giờ = 464 giờ + thiết kế logic 15% công BE của FG chưa có FUNC / TECH (FG-02, 11–15: 118,4 人日) = 142 giờ. Giờ sơ bộ 653 giờ (+8%: thêm API Design iam, sync DEP-04 — L5-D05) nhưng SWP × 2 chỉ 426 giờ: SWP chấm tài liệu thấp hơn cách tính 8 giờ / màn (giờ sơ bộ / SWP = 3,1). Tải 設計第4波 311 giờ sơ bộ (02-19 → 03-05) song song S2–S3 → rủi ro trễ ở progress-report |
| Thiết kế đã làm ở LAB-4 (phần 基本設計 không còn trong backlog) | 450,7 (BD 132,1 − 75,76 人日) | — | — | −450,7 | Bộ thiết kế LAB-4 (nộp 2026-11-26) — 12 Screen Specification, kiến trúc + ADR, 10 Database Design, 42 API, 7 FUNC, 15 TECH; không có issue LAB-5 (FB-EXP-344: không thiết kế lại phần đã có) |
| 共通基盤 + インフラ + バッチ定義 (CC + IN + BJ) | 800 (CC 55,0 + IN 30,0 + BJ 15,0 人日) | 142 | 164 | −636 (−80%) | LAB-5 chỉ có 14 lá nền tảng (IaC, runtime, khung app, khung màn); LAB-1 còn design system 8 人日, component FE dùng chung 22 人日, định nghĩa 10 batch (batch nằm trong lá dev của FG). Design system / component dùng chung thêm thành issue thô |
| 総合テスト・UAT (QT) | 880 | 140 | 202 | −678 (−77%) | LAB-5 có kế hoạch test, kịch bản nghiệp vụ, 462 tổ hợp quyền, tải, bảo mật, diễn tập khôi phục, hỗ trợ UAT, cutover, bàn giao (11 lá); LAB-1 QT gồm cả sửa lỗi FE / BE 61 人日 — thêm issue thô giữ chỗ sửa lỗi |
| 要件定義 (RQ) ↔ làm rõ | 240 | 60 | 110 | −130 (−54%) | RQ của LAB-1 là workshop + 要件定義書 + 受入基準 (W1); LAB-5 chỉ còn 41 câu hỏi khách / nội bộ (1–4 giờ / câu), phần workshop coi như đã làm trước sprint |
| Không có trong backlog — dịch vụ SV-01..09, 会計ソフト連携試験, quản lý PM / BrSE | 2.660,8 (SV 94,0 + AC 7,0 + MN 231,6 人日) | — | — | −2.660,8 | Không phải issue sản phẩm — PM, BrSE cầu nối, đào tạo, hỗ trợ vận hành; sprint không đốt các giờ này (một phần SV như hỗ trợ UAT, cutover, bàn giao đã nằm ở EP-TEST) |
| **Tổng (trước buffer 15%)** | **11.890,4** | **4.751** | **3.402** | **−8.488,4 (−71%)** | LAB-1 1.486,3 人日; buffer 15% (11,15 人月 ≈ 1.784 giờ) không so |
<!-- END GEN lab1-compare -->

### 4.1 Vì sao LAB-5 thấp hơn LAB-1 nhiều — và hệ quả

Cầu nối bằng số (Gate B m-03) — cộng các khoản ra đúng tổng chênh §4:

<!-- BEGIN GEN lab1-bridge -->
| Khoản | Giờ (LAB-1 − LAB-5) | Nguồn |
|---|---|---|
| FG-01..15: issue thô quy đổi (giờ giữ chỗ LAB-1 → SWP × 2) | 1.259 | §2.2; PREMISE L5-A01 |
| FG-01..15: QA nằm trong dòng FG LAB-1, LAB-5 không có lá (chạy case theo DoD 4) | 1.085,6 | QA 189,2 人日 − lá test FG; giữ 30% năng lực QA (L5-D12) |
| FG-01..15: cột デザイン trong dòng FG LAB-1 (hình màn, ngoài 基本設計) | 332,8 | 41,6 人日 |
| FG-01..15: **chưa giải thích bằng số** (FE × 1,3 cho 2 bố cục, giờ dev / test LAB-5 ước thấp hơn LAB-1) | 1.075,4 | phần còn lại của chênh 15 dòng FG |
| Thiết kế (基本設計, phần còn lại sau LAB-4) | 180,1 | dòng cùng tên ở §4 |
| Thiết kế đã làm ở LAB-4 (phần 基本設計 không còn trong backlog) | 450,7 | BD 132,1 − 75,76 人日 — **số còn lại theo phép trừ**, không đo độc lập |
| 共通基盤 + インフラ + バッチ定義 (CC + IN + BJ) | 636 | dòng cùng tên ở §4 |
| 総合テスト・UAT (QT) | 678 | dòng cùng tên ở §4 |
| 要件定義 (RQ) ↔ làm rõ | 130 | dòng cùng tên ở §4 |
| Không có trong backlog — dịch vụ SV-01..09, 会計ソフト連携試験, quản lý PM / BrSE | 2.660,8 | SV 94,0 + AC 7,0 + MN 231,6 人日 |
| **Tổng = chênh dòng Tổng §4** | **8.488,4** | |
<!-- END GEN lab1-bridge -->

Ba nguyên nhân chung cho mọi dòng FG, theo thứ tự độ lớn:

1. **Issue thô quy đổi thấp** (−1.259 giờ so với giờ giữ chỗ): xem §2.2. Phần này sẽ đổi khi có spec, không phải "tiết kiệm".
2. **QA trong từng issue không có giờ riêng**: LAB-1 cộng QA = 30–50% công FE + BE vào mỗi chức năng (189,2 人日 ≈ 1.514 giờ ở FG-01..15); LAB-5 chỉ có lá test tách riêng (428 giờ ở FG-01..15), còn "QA chạy case liên quan" nằm trong DoD 4 của issue dev mà không có giờ.
3. **Việc không phải issue sản phẩm**: PM / BrSE, dịch vụ SV, buffer 15% — sprint không đốt.

Hệ quả cho người đọc estimate này:

- **Giờ trên Project dùng để lập kế hoạch sprint, không thay số hợp đồng.** Estimate LAB-1 (74,31 人月 trước buffer) vẫn là căn cứ giá; tổng Hours của LAB-5 không được dùng để đề xuất giảm giá.
- **Việc thiếu trong backlog — đã xử lý sau Gate B (PREMISE L5-D12, người dùng chốt 2026-11-27)**: (a) thêm issue thô #500 design system / component FE dùng chung (giữ 216 giờ theo LAB-1 CC); (b) thêm issue thô #501 sửa lỗi sau 総合テスト / UAT (giữ 489 giờ theo LAB-1 QT); hai issue chờ chấm SWP. (c) QA chạy case theo DoD 4: không tạo issue — giữ 30% năng lực QA mỗi sprint (task-breakdown §1.3), ghi vào rủi ro trễ của progress-report P4.
- **Thiết kế (N-04)**: giờ sơ bộ 653 giờ khớp phần còn lại của 基本設計 LAB-1 (≈ 606 giờ, +8%; ≈ 600 giờ nếu trừ 6 giờ デザイン của 3 màn đã có wireframe); không làm lại phần LAB-4 đã có (≈ 451 giờ theo cách tính LAB-1: 12 màn × 8 giờ, kiến trúc / Database Design / IF 8 人日, thiết kế logic của 9 nhóm chức năng FG-01, 03–10 có FUNC / TECH). **Tải 設計第4波 = 311 giờ sơ bộ trong 2027-02-19 → 03-05, chạy song song S2–S3** — đưa vào rủi ro trễ của progress-report (P4).
