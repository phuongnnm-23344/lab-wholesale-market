# Expert review — LAB-5 Gate A (backlog đã break, trước khi đẩy GitHub Project) — 2026-11-26

Phạm vi review (người dùng chỉ định): repo `lab-wholesale-market`, nhánh `ver/lab-5`, commit `2168feb` — `task-breakdown.md`, `PREMISE.md`, `backlog/backlog.yaml`, `backlog/scripts/check-backlog.py`. Đối chiếu: `plans/lab/Lab 5/plan-lab5.md`, `p1-shared-brief.md`, `Requirement.txt`, `Output.txt`; `project/07_feedbacks/customer-feedback-lab5-priority-261126.md`; bộ LAB-4 trong repo (`specs/`, `architecture/`, `lab-4/PREMISE.md`); WBS LAB-1 `project/06_estimate/wbs-schedule-ja.md`.

Tiêu chí: mục tiêu học LAB-5 + đề (task-breakdown 4 phần, PREMISE 3 phần, đúng thứ tự, đủ cột tối thiểu) + RFP + 7 luật CLAUDE.md; soi 7 điểm người dùng nêu (độ hạt / L5-D08, tách 完納奨励金, spec → issue, bảng chỗ hở, PREMISE / L5-D05 / L5-D10, 7 luật, ưu tiên khớp khách).

**Verdict: RELEASE CÓ ĐIỀU KIỆN** — 0 Critical · 7 Major · 7 Minor. Không vi phạm luật loại thầu; khung và phần 完納奨励金 làm tốt. Nhưng 7 Major phải sửa trong yaml **trước P2**: chúng đổi cấu trúc item, trường Iteration, Priority — đẩy lên Project rồi mới sửa thì tốn gấp đôi.

Kiểm chạy lại: `check-backlog.py --counts` → 0 lỗi, 1 cảnh báo (A-FG01-09.3, xem tay: đúng ngữ cảnh — câu nói "không dùng 承認 cho duyệt nội bộ"). 18 epic, 244 + 237 = 481 issue, 418 lá, 4.112 giờ; Iteration 1 = 50 issue / 44 lá / 426 giờ. Phân tích thêm bằng script riêng (không sửa repo): 108 lá thô sinh từ khuôn tầng (1.357 giờ, từ 51 đơn vị tự nhiên); 24 cặp phụ thuộc ngược ưu tiên; 14 phụ thuộc của Iteration 1 nằm ngoài Iteration 1.

## Kết luận nhanh theo 7 điểm người dùng hỏi

1. **Độ hạt / L5-D08:** ≤ 16 giờ hợp lý cho dev / test. Áp cho issue thô bằng khuôn tầng ("1/2 hiển thị · 2/2 thao tác") thì không: 108 lá giả chính xác trên màn chưa có spec, DoD lại là "có spec rồi tách lại" — tức 2.100 giờ lá thô không đốt được theo DoD của chính nó. Chi phí: +57 item so với chỉ tách theo đơn vị tự nhiên; mỗi item tốn tạo issue, gắn sub-issue, ~5 trường, 1 lần chấm SWP; issue thô bị thay khi có spec → làm lại trên board. L5-D08 còn đổi quyết định Q5 người dùng đã chốt (plan §0 dòng 14) mà chưa có xác nhận. → M-01.
2. **完納奨励金:** đạt. K1–K9 mỗi khối một issue (K8 tách 3), TV-01..15 có đủ trong 5 issue test (script kiểm), SC-09-04 riêng, checkpoint S4 có issue B-FG09-21, bảng §3 có cột "Vì sao tách riêng" cụ thể từng dòng. Thiếu ở B-FG09-21 (M-05) và chưa có dòng cho hàm tạo kỳ / 支払期日 ở FG-10 (m-05).
3. **Spec → issue:** 86 tài liệu spec LAB-4 đều có trong spec_refs hoặc not_issued (script kiểm). Nhưng có 2 điểm mở không thành issue, lý do lại sai (M-06).
4. **Bảng chỗ hở:** 23 dòng, "Xử lý" đúng 1 trong 4 giá trị và có trỏ. Đã kiểm 3 gap nặng trong spec, cả 3 có thật: L5-G01 (A-GAP-01) — `LOT_FUNC` §2.1–2.10 không có hàm nào chuyển `INSPECTED → PUBLISHED`, DEP-01..17 không có dòng nào, còn `LOT_FUNC` 2.9 và `TRADE_AITAI_CONFIRM_TECH:139` bắt lô `PUBLISHED`; L5-G05 (B-PS-01) — `INCENTIVE_DB:126` (4.52 Overview) vẫn đưa GD `LATE_ENTRY` vào tập ứng viên DELTA, trái `INC_ENGINE_TECH:88, 184, 306` và TV-13 trong chính INCENTIVE_DB; L5-G06 (B-PS-02) — `INC_ENGINE_TECH:370` (No 5) ghi CARRY sang P+1, tới `:372` (No 7) mới bảo đảm P+1 tồn tại, trong khi `:325` (K7) nói "P+1 do K8 bảo đảm tồn tại trước khi ghi". Lệch nhỏ: L5-G01 ↔ L5-S04 (m-01).
5. **PREMISE:** đủ 3 phần, đúng cột, "Vì sao" có nguồn cụ thể (L5-Gxx, file:mục, câu khách). Không thấy giả định nào ghi đè RFP; nhưng L5-A04 đụng tiền của người mua mà không kèm câu hỏi (M-07). **L5-D05 không trái chữ của L4-D08** (L4-D08 chỉ chặn mở rộng Screen Specification trong bài LAB-4). Nó trái plan §0 dòng 6 và trái WBS LAB-1: thiết kế 認証・利用者切替・権限・参加者 thuộc 設計第1波, khách duyệt 2027-01-22, **trước** S1 (wbs-schedule-ja.md:46). Viết API Design trong PR của sprint là bỏ qua bước khách duyệt thiết kế (M-02). **L5-D10:** 426 giờ, không ghi năng lực bằng số; riêng BE-6 gánh 158 giờ trong 10 ngày làm việc (M-03).
6. **7 luật:** không vi phạm. 相対 là luồng chính (FG-04 P1, tiêu đề "(luồng chính)", せり "(luồng phụ)"). 許可 / 承認 tách bảng / hàm / API / test, không dùng 承認 cho duyệt nội bộ (A-FG01-02 / -03, B-FG08, B-FG10-05 ghi rõ 決裁 / 確認). Người quyết: 目利き, 期ロック có MFA, せり xác nhận, không có OCR / AI. Không ghi đè: nhãn `rule:no-overwrite`, DoD 1.2-5. Quy chế: quota 4 lần (B-FG10-03, B-FG10-10 RV-01..18), maker-checker, N1 / N2. Option: không lọt vào backlog (dòng not_issued cuối, ADR-010). Truy vết: 480/481 issue có rfp_refs (thiếu C-PLAT-08, m-03).
7. **Ưu tiên / sprint:** thang P1–P4 khớp câu 1 của khách; Iteration 1 giữ FG-01 + FG-02 như câu 2. Nhưng 相対 (P1) phụ thuộc issue P3 / P4, trong khi luật cắt là "cắt P4 trước" → mâu thuẫn trực tiếp với điều kiện bắt buộc "S3 không trễ" (M-04).

## Bảng phát hiện

| # | Mức | File:vị trí | ID RFP / nguồn | Vấn đề | Cách sửa đề xuất |
|---|---|---|---|---|---|
| M-01 | Major | `task-breakdown.md:14,16,20,29`; `PREMISE.md:49` (L5-D08); yaml: 108 lá thô có "(n/m …)" trong tiêu đề, vd. `A-FG01-12.3`/`12.6`, `B-FG09-19.1`/`19.2` | Mục tiêu học "không quá lớn / mơ hồ"; plan §0 dòng 14 (Q5) | (a) Tách issue thô theo khuôn tầng tạo độ chính xác giả: "SC-09-01 (1/2 hiển thị) 12h / (2/2 thao tác) 12h" chia đều giờ LAB-1, màn chưa có spec — vẫn mơ hồ y như trước, chỉ nhỏ hơn. (b) DoD của lá thô (`task-breakdown.md:29`, yaml `dod: Có Screen Specification / API Design rồi tách lại`) không khớp với giờ gắn trên lá (giờ dev LAB-1): lá đóng khi có spec, không phải khi làm xong 12 giờ việc → Point / Hours / burndown của 171 lá (≈ 2.100 giờ, 51% backlog) không đo được gì. (c) Chi phí: +57 item so với chỉ tách theo đơn vị tự nhiên, mỗi item gồm tạo issue + addSubIssue + ~5 trường + 1 lần chấm SWP ở P3 (chấm SWP cho "nửa hiển thị của màn chưa spec" là nhiễu); khi có spec thì đóng hết và tạo lại. (d) L5-D08 đổi Q5 người dùng đã chốt ("1 issue thô / nhóm chức năng") mà chưa có xác nhận | Theo kiểu rolling-wave: **dev / test luôn ≤ 16 giờ; issue thô dừng ở đơn vị tự nhiên** (1 màn / 1 nhóm API / 1 batch / 1 báo cáo / 1 script), bỏ khuôn tầng; quy tắc "issue thô phải tách ≤ 16 giờ **trước buổi lên kế hoạch của sprint dự kiến** (khi đã có spec)". Định nghĩa lại vai của issue thô: là chỗ giữ effort (giờ LAB-1), đóng bằng "tách lại" khi có spec; việc viết spec tách thành issue thiết kế riêng có giờ thật (xem M-02). Ghi lại L5-D08 (phương án, cái giá, số item trước / sau) và **xin người dùng xác nhận** vì đổi Q5 |
| M-02 | Major | `PREMISE.md:46` (L5-D05), `:51` (L5-D10); `task-breakdown.md:25,48-49`; yaml `A-FG01-12.3`, `A-FG01-12.6`, `C-FG02-13.3`, `C-FG02-13.4` (rough, Iteration 1, gắn AC-S1-3 / AC-S1-4); `C-CLR-16` (yaml:15826, 3 giờ cho 3 Screen Spec) | WBS LAB-1 `wbs-schedule-ja.md:46` (設計第1波 duyệt 1/22 → S1); FB-CUS-313; NFR-USE-01, BR-PERM-01 | Hai điều kiện dùng thử AC-S1-3 (tra tư cách bằng bàn phím) và AC-S1-4 (đổi người bằng PIN) dựa vào issue thô mà DoD là "có spec rồi tách lại" → cuối S1 theo DoD chỉ có spec, không có màn để demo; FB-CUS-313 ghi Fixed là chưa đúng. Viết Screen Spec 3 màn trong 3 giờ (C-CLR-16, clarify 1–4 giờ) không thực tế. L5-D05 viết API Design iam trong PR của sprint, review nội bộ — WBS LAB-1 đặt thiết kế này ở 設計第1波, khách duyệt 2027-01-22 trước S1 | Thêm issue **thiết kế trước sprint** (không phải clarify), hạn 2027-01-22 theo 設計第1波: API Design iam (DEP-01/02/14 + phiên, PIN, kiểm quyền), Screen Spec SC-00-01..03, SC-01-06; giờ lấy theo phần thiết kế của LAB-1. Issue Iteration 1 của SC-01-06 / SC-00-02 đổi thành dev, phụ thuộc issue thiết kế. Sửa L5-D05: "API Design viết ở W2 第1波, khách duyệt 1/22", bỏ "viết trước khi merge". Không trái L4-D08 vì đây là việc thiết kế của dự án, không phải mở rộng spec trong bài LAB-4 |
| M-03 | Major | `task-breakdown.md:42`; `PREMISE.md:51` (L5-D10); yaml `iteration1`, `A-FG01-11` (:992), `A-FG01-09.3` (:929), `C-FG02-12` (:10879), `C-FG02-05` | WBS LAB-1 §5 (`wbs-schedule-ja.md:119`: S1 ~50%); câu 3 khách (保証金 / 参加上限 để sau) | (a) "Lớn hơn năng lực S1" mà không ghi năng lực bằng số (người × giờ × 50%). (b) Theo assignee: BE-6 158 giờ, BE-1 76, FE-4 58 trong 10 ngày làm (tối đa 80 giờ / người khi chạy đủ 100%) → board sẽ hiện đúng chỗ phân việc sai. (c) Issue trong Iteration 1 phụ thuộc issue ngoài Iteration 1: A-FG01-09.3 → A-FG01-08.2 (参加上限, khách cho để sau); A-FG01-11 (test 承認・**保証金**, nằm trong AC-S1-2) → A-FG01-06 (保証金); C-FG02-12 → B-FG10-14 (thô, P4); C-FG02-05 オフラインPIN → A-FG03-17 (khung PWA, S2) — không cần cho AC-S1-4 (PC dùng chung, có mạng). (d) Đẩy cả 50 issue với Iteration = 1 lên Project rồi "trượt" ở P4 thì báo cáo tiến độ cho khách thấy trượt do lập kế hoạch sai, không phải do rủi ro | Trước P2: ghi năng lực S1 bằng số (từ WBS §5), chốt **tập cam kết** ≤ năng lực, ưu tiên issue có AC; phần còn lại để Iteration trống hoặc nhãn / trường "stretch". Cân lại assignee (BE-6 ≤ ~40 giờ ở mức 50%). Bỏ khỏi Iteration 1: C-FG02-05; tách phần 保証金 / 参加上限 khỏi A-FG01-09.3 / A-FG01-11 (hoặc đổi AC-S1-2 chỉ trỏ phần 許可 / 承認 / 一時停止). Thêm luật vào `check-backlog.py`: issue Iteration N không phụ thuộc issue chưa có Iteration ≤ N, trừ EP-PLAT nếu có giả định S0 (m-06) |
| M-04 | Major | `PREMISE.md:52` (L5-D11), `:34` (L5-A15); `task-breakdown.md:40`; yaml `B-FG10-14` (:9145, P4), `B-FG08-01` (:6060, P3); 24 cặp phụ thuộc ngược ưu tiên, vd. A-FG04-02 (P1) → B-FG10-14 (P4) / B-FG08-01 (P3); A-FG04-03.2 (P1) → B-FG10-14 (P4); A-FG04-14.3 (P1) → A-FG06-04 (P3); B-FG09-10.2 (P2) → C-FG11-08 (P3) | FB-CUS-310 (bắt buộc: "S3 相対 không trễ, cắt せり / báo cáo phụ trước"); FR-AITAI-01; luật 1 | Luật cắt của L5-D11 là "lịch trượt thì cắt P4 trước", nhưng 相対 (P1) cần cơ chế file cấu hình DEP-16 (B-FG10-14, P4, chứa `PARTICIPATION_LIMIT_TAX_CODE` cho hạn mức ở SC-04-01) và migration `trade_fixes` (B-FG08-01, P3). Cắt theo đúng luật thì làm trễ 相対 — trái điều kiện bắt buộc của khách. Câu "Câu hỏi = ưu tiên cao nhất của issue nó chặn" mới áp cho clarify, chưa áp cho dev | Áp cùng một quy tắc cho mọi issue: **ưu tiên = max(ưu tiên riêng, ưu tiên cao nhất của issue phụ thuộc vào nó)**, tính bằng script, không sửa tay; thêm kiểm vào `check-backlog.py` (0 cặp ngược). Sau khi tính lại, ghi vào L5-D11 các issue P1 / P2 thuộc FG xếp hạng thấp và lý do (vd. B-FG10-14 lên P1 vì 相対 cần) |
| M-05 | Major | yaml `B-FG09-21` (:15759); `task-breakdown.md:200` | Câu 4 khách (FB-CUS-314); BR-INC-01; ACC-GATE-01; Q-INC-01, Q-INC-02, E-06 | Checkpoint bắt buộc cuối S4: (a) `depends_on` = C-CLR-14, B-CLR-02, B-CLR-10 — thiếu B-CLR-07 (Q-INC-01) và B-CLR-08 (Q-INC-02), là hai điều kiện khách nêu đích danh ("câu trả lời của 経理部 cho E-02, E-06, Q-INC-01, Q-INC-02 phải có trước"); (b) một lá QA 16 giờ cho việc cần ≥ 2 vai (BrSE / BE dựng bảng tính theo K1–K8 + QA đối chiếu + buổi với 照合事務局, 経理部, ルール管理者 + biên bản ký) — trái chính quy tắc "≥ 2 vai → cha + sub-issue" ở `task-breakdown.md:15`; 16 giờ cho ~15 TV + 3 ca C.3 + ngày biên + FIFO + 後入力 là thấp; (c) không có trường sprint / Iteration S4, mốc chỉ nằm trong tiêu đề → board không nhắc được mốc | Thêm phụ thuộc B-CLR-07, B-CLR-08. Đổi thành issue cha + sub-issue: dựng bảng tính (BrSE / BE) · đối chiếu + biên bản (QA) · buổi kiểm với khách (BrSE); ước lại giờ. Ghi mốc S4 ở trường có lọc được (Iteration dự kiến / Milestone), và đặt lịch 経理部 sớm như khách yêu cầu (câu 6 #4) vào rủi ro |
| M-06 | Major | `task-breakdown.md:126` (ô cuối dòng `BILLING_DB` hiện "…PL nối khi gộp → " — mảnh not_issued bị render vào ô của dòng spec, mũi tên trỏ vào khoảng trống), `:158`, `:168`; yaml `not_issued` (:16115, :16174–16177, `covered_by: []`) | Luật 7 (truy vết); `p1-shared-brief.md` mục 4 (ADR §6 Điểm mở → issue clarify) | Cột "Phần spec chưa thành issue và vì sao" có lý do sai: (a) **Q-ARCH-12** (税区分 của 完納奨励金 khi xuất IF-ACC-01, ADR-007 §6, chủ 経理部) không có issue nào; lý do ghi "PL nối khi gộp" nhưng lúc gộp không nối. (b) **E-21** (scan 受入証憑, ADR-008 §6) — ghi "luồng C tạo issue làm rõ" nhưng chỉ có C-CLR-04 cho E-18, không có issue cho E-21. (c) Ghi chú nội bộ "(luồng A/B/C)", "PL nối khi gộp" lọt vào file nộp public | Tạo issue clarify cho Q-ARCH-12 (gắn nhãn `constraint:完納奨励金`, chặn C-FG11-08 / C-FG11-04.x) và E-21 (chặn A-FG06-xx ngoại lệ giao có scan); sửa `not_issued` cho đúng (`covered_by` trỏ issue mới, C-FG11-08, C-FG11-03.x, B-FG09-20); sửa render để ô không còn mảnh "→"; bỏ hậu tố "(luồng …)" ở bảng sinh ra; thêm kiểm vào `check-backlog.py`: `not_issued` có `covered_by` rỗng thì reason không được là việc chưa làm |
| M-07 | Major | `PREMISE.md:23` (L5-A04) | BR-INC-01; câu 4 + câu 6 khách (FIFO tạm chấp nhận có điều kiện); luật 7 | Giả định "không tự phân bổ lại 入金 khi 期のお支払額 của kỳ OPEN giảm; 照合 dời tay trước 期ロック" quyết định một người mua có mất 完納 hay không (tiền trả cho khách hàng của chợ). L5-A04 có ảnh hưởng (+1–2 MD) nhưng **không có câu hỏi** gửi khách và không có test vector cho ca này — luật 7 đòi giả định + câu hỏi + ảnh hưởng | Thêm câu hỏi (issue clarify mới, hoặc gộp vào B-CLR-02 nếu cùng buổi với 経理部) và ghi ID vào L5-A04; thêm ca này vào B-FG09-21 (bảng tính cuối S4) và một ca test ở B-FG09-14 (cảnh báo 過入金 hiện ra, 照合 dời tay, 完納 đúng sau khi dời) |
| m-01 | Minor | `task-breakdown.md:213` (L5-G01 → "tạo issue làm rõ A-CLR-08"); `PREMISE.md:14` (L5-S04 "Thêm DEP-18"); yaml `A-CLR-08` (:4988) | — | Cùng một chỗ hở: bảng chỗ hở ghi là clarify, PREMISE ghi là sửa thiết kế, hai bên không trỏ nhau. DoD của A-CLR-08 chỉ mở khóa A-FG03-14, nhưng A-FG04-05 cũng phụ thuộc nó | Chọn một: hoặc "sửa thiết kế — PREMISE L5-S04" (A-CLR-08 là việc xác nhận với khách), hoặc giữ clarify và để L5-S04 ghi "đề xuất, chờ A-CLR-08". DoD A-CLR-08 thêm A-FG04-05 |
| m-02 | Minor | `backlog/scripts/check-backlog.py:164` (print) | — | Chạy đúng cách ghi trong lời gọi (`python -I backlog/scripts/check-backlog.py`) trên console Windows bị `UnicodeEncodeError` (cp1252) ở dòng WARN đầu tiên; phải thêm `-X utf8` | Thêm `sys.stdout.reconfigure(encoding="utf-8")` đầu script, hoặc ghi rõ `-X utf8` trong docstring |
| m-03 | Minor | yaml `C-PLAT-08` (:10248) | Luật 7 | Issue duy nhất không có `rfp_refs` | Gắn ID (vd. fixture Appendix C, NFR liên quan dữ liệu test) và để `check-backlog.py` bắt `rfp_refs` rỗng |
| m-04 | Minor | `PREMISE.md:52` (L5-D11); `task-breakdown.md:40` | GOV-RULE-01; luật 5; SCOPE (せり là baseline) | P4 gồm cả màn đổi version quy chế (luật 5, bắt buộc trước UAT — khách câu 1 hạng 9) và FG-05 (baseline). "Cắt" dễ bị đọc là bỏ phạm vi | Ghi rõ: "cắt" = dời sprint trong 第1期, không bỏ baseline; FG-10 version / maker-checker / rollback và FG-05 vẫn xong trước UAT; chỉ mục "Muốn có" mới được bỏ |
| m-05 | Minor | `task-breakdown.md:186-202` (bảng §3) | BR-INC-01 | 支払期日 theo lịch ngân hàng và việc tạo kỳ P+1 là biến của 完納 (chính §3 dòng 184 liệt kê), nhưng hàm nằm ở B-FG10-12 (FG-10, L5-D04) và không có dòng nào trong bảng §3 | Thêm một dòng "支払期日 / tạo kỳ (Q-INC-03)" → B-FG10-12 (phần 期作成) + B-FG09-17 (TV-08, TV-09), cột "Vì sao tách" ghi lý do để ở FG-10 |
| m-06 | Minor | `task-breakdown.md:42`; PREMISE §2 | plan §0 dòng 13 (S0 基盤 coi như xong) | Iteration 1 phụ thuộc 8 issue EP-PLAT (C-PLAT-04/05/06/08/09/10/11) không thuộc Iteration nào; giả định "S0 xong trước 2027-02-01" chỉ có trong plan, không có trong file nộp | Thêm dòng giả định vào PREMISE §2 (S0 xong trước S1, theo WBS LAB-1) và một câu ở task-breakdown §1.3 |
| m-07 | Minor | `task-breakdown.md:42` | — | "Tập ứng viên 50 issue / 426 giờ lá": 50 gồm 6 issue cha, số lá là 44 (script in "Iteration 1 leaves 44 hours 426") | Viết "50 issue (44 lá) / 426 giờ" |

## Điều kiện để release (làm trước P2, Expert kiểm lại phần diff)

1. Sửa M-01 (quy tắc độ hạt cho issue thô + vai của issue thô) và M-02 (issue thiết kế trước sprint, Iteration 1 không còn issue thô gắn AC) — **người dùng xác nhận** L5-D08 (đổi Q5) và L5-D05 đã sửa.
2. M-03: năng lực S1 bằng số, tập cam kết ≤ năng lực, assignee cân lại, 0 phụ thuộc ra ngoài Iteration 1 (trừ EP-PLAT theo giả định m-06).
3. M-04: ưu tiên lan theo phụ thuộc, 0 cặp ngược; L5-D11 cập nhật.
4. M-05, M-06, M-07 sửa trong yaml + sinh lại bảng.
5. `check-backlog.py` thêm 4 kiểm: phụ thuộc ngược ưu tiên, phụ thuộc ra ngoài Iteration, `rfp_refs` rỗng, `not_issued` có `covered_by` rỗng; chạy 0 lỗi. Minor sửa cùng lượt.

## Điểm làm tốt

- Phần 完納奨励金 có chất lượng: tách theo khối K1–K9 có DoD của TECH, TV-01..15 phân nhóm theo biến, cột "Vì sao tách" nêu đúng cơ chế lỗi ("lỗi FIFO / DELTA bị che bởi số tổng đúng tình cờ"); nhánh 請求番号 tách riêng chờ E-02 thay vì code rồi tắt bằng cờ (L5-D03).
- Ba chỗ hở nặng tìm được khi break đều có thật và đều có hệ quả rõ: L5-G01 chặn luồng chính 相対 với dữ liệu thật; L5-G05 làm dev cài sai K1; L5-G06 làm vỡ FK. Không phải hở trên giấy.
- `check-backlog.py` biến luật thành kiểm máy (承認 nội bộ, nhãn ràng buộc, đủ K / TV, độ phủ 86 spec, chu trình phụ thuộc) — Gate sau chỉ cần chạy lại.
- Giữ kỷ luật thuật ngữ: không chỗ nào dùng 承認 cho duyệt nội bộ; 許可 / 承認 tách đến tận migration, API, test.
- Điều kiện dùng thử của khách thành trường `acceptance` truy được tới issue (AC-S1-1..4).
- PREMISE ghi trung thực trạng thái: L5-S01..S04 là đề xuất, chưa sửa spec trước Gate A.

**Status:** DONE

---

## Kiểm diff `2168feb..a586464` — PL sửa FB-EXP-327..340 (2026-11-26)

Phạm vi: `git diff 2168feb..a586464` (PREMISE, task-breakdown, backlog.yaml, 6 script). Người dùng đã xác nhận ngày 2026-11-26: L5-D08 theo rolling-wave; L5-D05 làm thiết kế trước sprint ở 設計第1波 (khách duyệt 2027-01-22).

Chạy lại từ gốc repo với `-X utf8`: `check-backlog.py --counts` cho 0 lỗi, 1 cảnh báo (vẫn là cảnh báo cũ ở A-FG01-09.3, đúng ngữ cảnh). Số liệu: 477 issue (261 + 216), 398 lá; theo loại lá: dev 161, test 42, rough 100, clarify 41, design 54. Tổng 4.751 giờ. Iteration 1 có 26 lá / 253 giờ. `render-task-breakdown-tables.py` chạy lại không đổi byte nào trong `task-breakdown.md`, tức bảng khớp yaml. Tôi lỡ chạy script này một lần, nhưng `git status` sạch nên repo không bị sửa.

**Verdict sau diff: RELEASE CÓ ĐIỀU KIỆN.** 5 điều kiện cũ và 7 Minor cũ đều đạt. Có 1 Major mới (N-01): điều kiện dùng thử AC-S1-2 không làm được bằng màn hình trong S1. P2 được đẩy issue, nhãn, Priority, Milestone, Hours lên Project. **Chưa gán Iteration 1** cho tới khi N-01 có quyết định.

### Đối chiếu 5 điều kiện

| # | Điều kiện | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | M-01 (rolling-wave) + M-02 (thiết kế trước sprint), người dùng xác nhận | **Đạt** | Không còn lá thô tách theo khuôn tầng; script bắt tiêu đề "(n/m ". 100 lá thô dừng ở đơn vị tự nhiên, lá lớn nhất 48 giờ; mỗi lá thô chờ một issue `design` (script kiểm). DoD 1.2-6 viết lại: issue thô xong khi đã tách. AC-S1-3/4 giờ là issue dev (A-FG01-19.x, C-FG02-21.x, C-FG02-22.1), chờ thiết kế 第1波 A-FG01-15 / C-FG02-19 / C-FG02-18. L5-D05, L5-D08 ghi rõ "người dùng xác nhận 2026-11-26" |
| 2 | M-03 năng lực / tập cam kết / assignee | **Đạt**, nhưng xem N-01 | `iteration1`: 9 người × 40 giờ = 360; cam kết 253 giờ, người nhiều nhất 40 giờ (BE-2, BE-3, BE-6). 保証金 / 参加上限 tách ra A-FG01-09.4 / A-FG01-18; C-FG02-05, C-FG02-12 đã ra khỏi S1 |
| 3 | M-04 ưu tiên lan theo phụ thuộc | **Đạt** | Script cho 0 cặp ngược. So với ưu tiên gốc của epic có 68 issue khác (tính cả câu hỏi; con số 58 của PL tính theo cách khác). Xem điểm 3 bên dưới |
| 4 | M-05, M-06, M-07 | **Đạt** | B-FG09-21 thành cha 42 giờ với 4 sub (BE 16 + 8, QA 12, BrSE 6), milestone S4 (2027-03-15 → 03-26), phụ thuộc thêm B-CLR-07/08/24. C-CLR-17 (Q-ARCH-12, nhãn `constraint:完納奨励金`, chặn C-FG11-04.1/.2, C-FG11-09) và A-CLR-22 (E-21, chặn A-FG06-09) đã có; `not_issued` sửa đúng, không còn ô "→". B-CLR-24 đã ghi vào L5-A04, có ca trong B-FG09-21.2 và trong DoD của B-FG09-14 |
| 5 | Kiểm thêm trong `check-backlog.py`, chạy 0 lỗi | **Đạt** | Có thêm: thô tách theo khuôn tầng, `[設計]`, `rfp_refs` rỗng, phụ thuộc ngược ưu tiên, thô không chờ thiết kế, phụ thuộc ra ngoài Iteration 1, vượt 40 giờ / người, ngoài roster, `not_issued` rỗng mà lý do là việc chưa làm, chữ nội bộ "luồng / PL nối". Có thêm `stdout.reconfigure` |
| Minor | m-01..m-07 | **Đạt cả 7** | A-CLR-08 → issue thiết kế A-FG03-20, dòng L5-G01 trỏ L5-S04; C-PLAT-08 `rfp_refs: C.1`; L5-D11 ghi "cắt = dời sprint trong 第1期"; §3 có dòng 支払期日 / tạo kỳ → B-FG10-12.3 + B-FG10-16 + B-FG09-17; L5-A18 (S0 + 第1波); "28 issue (26 lá)" |

### Ba điểm người dùng hỏi kỹ

**1. Giờ thiết kế 653 giờ: hợp lý, không làm lại phần LAB-4 đã có.**
- Quy tắc khớp đúng bảng giá LAB-1 (`project/06_estimate/estimate-basis-ja.md:110`): 画面設計書 FE 0,5 + デザイン 0,25 人日 / màn; 業務ロジック設計 = 15% công BE; 日本語レビュー 0,25 人日 / tài liệu. 8 giờ / màn đúng bằng tổng ba khoản đó.
- 653 giờ ≈ 82 人日, khoảng 62% dòng BD của LAB-1 (132,1 人日, `estimate-basis-ja.md:160`). LAB-4 đã làm xong 12 / 70 màn, kiến trúc, toàn bộ Database Design và 42 API, nên phần còn lại cỡ này là khớp.
- Tôi rà tiêu đề và spec_refs của cả 69 issue design: tất cả nhắm vào màn ở mức 画面一覧 hoặc DEP-xx. Không issue nào thiết kế lại màn hay TECH đã có spec ở LAB-4. Ví dụ A-FG01-17 chỉ viết Screen Spec SC-01-03/04, không viết lại API-PTY-004..007 đã có.
- Trùng nhỏ: SC-03-02, SC-03-07, SC-04-05 đã có wireframe ở LAB-4, nên khoản デザイン 0,25 人日 có thể trừ, tổng khoảng 6 giờ. Không đáng sửa ngay; ghi ở N-04 để xử lý ở Gate B.

**2. Phụ thuộc của tập cam kết S1 và 3 loại ngoại lệ: hợp lý, cần siết một chỗ.**
- Có 14 phụ thuộc ra ngoài S1, gồm: 6 tới EP-PLAT (S0, theo L5-A18 đúng lịch WBS 01-18 → 01-29), 7 tới thiết kế 第1波, 1 tới C-CLR-14. Cả ba loại đều có căn cứ trong WBS hoặc trong cam kết của khách (câu 6 #2: actors.csv đợt 1).
- Hai chỗ chưa ổn:
  - Script cho phép **mọi** issue clarify làm ngoại lệ, rộng hơn mức "chỉ C-CLR-14" mà PL mô tả.
  - AC-S1-1 dựa hoàn toàn vào C-CLR-14, là việc phía khách phải làm, mà khách đã nói không dùng dữ liệu bịa. Cần có phương án dự phòng trong rủi ro (N-02).
- Vấn đề lớn hơn không nằm ở phụ thuộc mà ở **đường đi trên màn hình** của AC-S1-2 (N-01).

**3. Ưu tiên lan: không có chỗ nào phá thứ tự của khách một cách vô lý.**
- Các nhóm FG vẫn đúng thứ tự khách đưa: FG-01, FG-04 ở P1; FG-07, FG-09, phần lớn FG-03 ở P2; FG-06, FG-08, FG-11 phần lớn P3; FG-05, FG-12, phần lớn FG-10 ở P4.
- Mỗi issue được nâng đều có lý do qua phụ thuộc thật:
  - B-FG10-14 / B-FG10-18 (DEP-16) và B-FG10-01 lên P1, vì 相対 cần hạn mức 税込 và bảng quy chế.
  - B-FG08-01 lên P1, vì 当日訂正 của 相対 ghi vào `trade_fixes`.
  - A-FG03-20 (DEP-18) lên P1, vì đây là gap chặn 相対.
  - C-FG15-01/03/04 lên P2, vì kỳ thưởng cần dữ liệu đã migrate.
- Hai chỗ đáng biết, nhưng không phải lỗi:
  - Lõi ghi giao hàng A-FG06-01/04 lên P1 chỉ vì A-FG04-14.3 (後入力 có cờ late của giao hàng). Đây là đường phụ của 相対; nếu muốn giữ FG-06 ở P3 thì phải dời A-FG04-14.3 sang FG-06, không cần làm ngay.
  - Màn đăng nhập SC-00-01 (C-FG02-21) để P3 dù nằm trong cam kết S1, vì màn FE của FG-01 không khai phụ thuộc vào màn đăng nhập. Vô hại, vì Iteration quyết định thứ tự làm.

### Phát hiện mới

| # | Mức | File:vị trí | ID RFP / nguồn | Vấn đề | Cách sửa đề xuất |
|---|---|---|---|---|---|
| N-01 | Major | `task-breakdown.md` bảng AC (dòng AC-S1-2); yaml `iteration1.acceptance` AC-S1-2 và `unmet_acceptance: []`; `A-FG01-13` (thô 48 giờ, SC-01-03/04, Iteration trống); SC-01-05 nằm trong A-FG01-12 (thô) / A-FG01-16.1 (thiết kế 第1波); `specs/party/screen-specification/SC-01-02_SPEC.md:49, 82, 88, 145-146` | Câu 2 khách điều kiện 2; BR-PERM-01; FR-PARTY-02/03; FB-CUS-311 | AC-S1-2 yêu cầu 照合事務局 **tự tay** đăng ký 許可 / 承認 và đặt 一時停止. Theo SC-01-02_SPEC:49, mọi thay đổi tư cách đi qua SC-01-03 / SC-01-04 / SC-01-05; SC-01-02 chỉ hiện trạng thái, nút [14] / [18] dẫn sang SC-01-03 / 04. Ba màn này đều không nằm trong S1. Tập cam kết chỉ có API + khối hiển thị trên SC-01-02, nên ở buổi demo không thao tác được bằng màn hình. `unmet_acceptance: []` đúng theo danh sách issue nhưng sai theo điều khách cần. Thiết kế của chúng (A-FG01-17, A-FG01-16.1) thuộc 第1波, duyệt 1/22, nên theo đúng rolling-wave phải tách A-FG01-13 / phần SC-01-05 thành lá dev trước khi lập kế hoạch S1. FE S1 đã dùng 77 / 80 giờ | Tách A-FG01-13 + phần SC-01-05 ngay (thiết kế 第1波 xong trước S1); đưa bản tối thiểu (nhập 許可 / 承認 có 有効日 / 失効日, 一時停止 có lý do + giờ phút) vào S1. Cần một quyết định: thêm năng lực FE (WBS §5: tháng 2 có ~5 người mới vào, roster mới có 2 FE) **hoặc** đổi phạm vi với khách (vd. bỏ C-FG02-21.2, hoặc AC-S1-2 chỉ làm 許可 trên màn) và báo khách trước, đúng như câu 2 khách yêu cầu ("nói trước cái gì bị đẩy"). Script: AC phải liệt kê cả màn FE trên đường thao tác, không chỉ API |
| N-02 | Minor | `backlog/scripts/check-backlog.py` (`outside_ok`); L5-A18 | E-03; câu 2 khách (không dùng dữ liệu bịa) | Ngoại lệ "câu hỏi khách" trong script nhận mọi issue clarify, rộng hơn mô tả "C-CLR-14". AC-S1-1 phụ thuộc hoàn toàn vào việc khách gửi actors.csv đợt 1, nhưng chưa có phương án nếu file tới muộn | Siết ngoại lệ: chỉ clarify có hạn ≤ G1 (2027-01-15), hoặc danh sách ID cụ thể. Thêm vào rủi ro / L5-A18: hạn nhận actors.csv đợt 1, và nếu trễ thì demo AC-S1-1 dời sang S2 (không dùng dữ liệu bịa), báo khách trước |
| N-03 | Minor | yaml `B-FG09-21.1`..`.4` | — | 4 sub của checkpoint S4 không khai phụ thuộc thứ tự (.1 / .2 → .3 → .4), nên trên board có thể bắt đầu buổi kiểm với khách trước khi có bảng tính | Thêm `depends_on`: .3 chờ .1, .2; .4 chờ .3 |
| N-04 | Minor (cho Gate B) | `task-breakdown.md` §1.1 dòng "Issue thiết kế"; sắp tới `estimate.md` §5 | — | Ở `estimate.md`, 653 giờ thiết kế phải so với dòng BD của LAB-1 (132,1 人日) sau khi trừ phần LAB-4 đã làm, không cộng vào phần dev theo FG. Ba màn đã có wireframe (SC-03-02, SC-03-07, SC-04-05) đang tính lại デザイン 0,25 人日. 第4波 dồn 311 giờ trong khoảng 02-19 → 03-05, chạy song song S2–S3 | Ở Gate B: tách dòng "thiết kế" khi so với LAB-1; trừ khoảng 6 giờ wireframe nếu muốn chính xác; đưa tải 第4波 vào rủi ro trễ của progress-report |

### Điều kiện còn lại

1. N-01: tách SC-01-03/04/05, đưa bản tối thiểu vào S1, và có quyết định của người dùng về năng lực FE hoặc phạm vi AC-S1-2 (báo khách nếu đổi phạm vi). Xong thì mới gán Iteration 1 trên Project.
2. N-02, N-03 sửa cùng lượt. N-04 để Gate B.

Expert chỉ cần kiểm lại phần diff của N-01.

**Status:** DONE

---

## Kiểm diff `a586464..390011d` — sửa N-01..N-03, áp L5-S01..S04 vào spec LAB-4 (2026-11-26) — verdict cuối Gate A

Chạy lại từ gốc repo với `-X utf8`:
- `check-backlog.py --counts`: 0 lỗi, 1 cảnh báo cũ (A-FG01-09.3, đúng ngữ cảnh). Số liệu: 481 issue (262 + 219), 401 lá. Iteration 1 có 26 lá / 254 giờ; FE dùng 78 / 80 giờ; người nhiều nhất 40 giờ.
- `render-task-breakdown-tables.py`: sinh lại không đổi byte nào, `git status` sạch.
- `scripts/check-markdown-links.py`: 294 file, **0 link gãy**.

### Đối chiếu N-01..N-03

| # | Kết quả | Bằng chứng |
|---|---|---|
| N-01 | **Đạt** | A-FG01-13.1 (SC-01-03 nhập 許可), A-FG01-13.2 (SC-01-04 nhập 承認), A-FG01-20.1 (SC-01-05 一時停止, 起案 → 決裁, lý do + giờ phút) vào S1, mỗi issue 10 giờ, FE-4. Dời sang S2: A-FG01-09.2 / 09.3 (19 giờ), C-FG02-21.2 (10 giờ). AC-S1-2 có `screen: true`; script kiểm AC loại này phải có issue FE dev trong S1. L5-D10 ghi lý do và "người dùng quyết". 13.1 / 13.2 chờ thiết kế 第1波 A-FG01-17 qua issue cha |
| N-02 | **Đạt** | Ngoại lệ chỉ còn `outside_ok_clarify: [C-CLR-14]`. L5-A18 có rủi ro actors.csv: hạn 2027-01-15; trễ thì dời AC-S1-1 sang S2, không dùng dữ liệu bịa, báo khách trước buổi lập kế hoạch S1 |
| N-03 | **Đạt** | B-FG09-21.3 chờ .1, .2; B-FG09-21.4 chờ .3 |

### 1. AC-S1-2 có demo được không; việc dời ra S2 có chấp nhận được không

- **Demo được.** 照合事務局 thao tác được cả ba bước trên màn:
  - nhập 許可 có 有効日 / 失効日 trên SC-01-03, rồi 起案 / 決裁 qua API-PTY-004 / 005;
  - nhập 承認 trên SC-01-04 qua API-PTY-006 / 007;
  - đặt 一時停止 có lý do + giờ phút qua 起案 → 決裁 trên SC-01-05.
  
  Kết quả xem ở SC-01-06 (AC-S1-3): tư cách, căn cứ 許可 / 承認, hạn.
- **Dời ra S2 chấp nhận được, không làm vỡ điều kiện nào trong 4 điều kiện dùng thử.**
  - Khối 許可 / 承認 trên SC-01-02 chỉ để **xem** trạng thái và lịch sử (SC-01-02_SPEC:49). Mục "Không được thiếu" #1 của khách (hai bản ghi riêng, hạn và trạng thái riêng, đổi trạng thái giữ lịch sử) vẫn đạt: dữ liệu tách hai bảng, mỗi lần đổi chỉ thêm event mới. Chỉ phần **xem lịch sử trên màn** sang S2.
  - Phần lỗi / khóa / hết phiên của SC-00-01 không thuộc AC-S1-4 (đổi người bằng PIN dùng SC-00-02, vẫn ở S1).
  - Còn hai việc phải nói rõ: Q-02 (MFA ở S1) và Q-03 (cửa vào các màn + báo khách).

### 2. Bốn chỗ sửa spec

| Spec | Nội dung | Version / History | ja/ | Đánh giá |
|---|---|---|---|---|
| `LOT_FUNC` §2.11 | Thêm `app.fn_lot_refresh_delivery_status`: lô `CLOSED` + mọi GD đã 引渡し完了 → `DELIVERED` + `lot_status_history`; khóa `FOR UPDATE`; không đổi ngược | 0.1.1 → 0.1.2, History dòng 3; `_index` cập nhật | Cùng số dòng, cùng hunk; 311 / 311 dòng | Đúng hướng L5-S01. **Phía delivery chưa sửa theo**: `DEL_RECORD_TECH.md:202` vẫn ghi "không đổi trạng thái lô sang `DELIVERED` (module `lot` đọc `v_delivery_status`)", trái với 2.11 ("delivery gọi trong cùng transaction"). Backlog cũng chưa nhắc hàm này ở A-FG06-04 / A-FG03-16 → Q-01 |
| `INCENTIVE_DB` §4.52 Overview | Bỏ GD `LATE_ENTRY` khỏi tập ứng viên DELTA; thêm câu GD 後入力 mang `incentive_period_id` = kỳ đang mở (Q-INC-02, TECH §3.4, TV-13 / TV-15) | 0.3.2 → 0.3.3, History dòng 6; `_index` DB cập nhật | Khớp dòng; dùng 交付率表, ランク; không thêm 承認 / 等級 / 税率表 | **Đúng.** Khớp `INC_ENGINE_TECH:88, 184, 306`, TV-13 / TV-15 (cột DELTA = "Không") và ADR-007 §2.4-8. Trong file còn chữ `LATE_ENTRY` ở History 0.3.0 (lịch sử, đúng là phải giữ) |
| `INC_ENGINE_TECH` §4.8 | No 4 (chỉ chế độ LOCK) gọi hàm tạo kỳ dùng chung để bảo đảm P+1 **trước khi ghi bất kỳ dòng nào**; chế độ 試算 không tạo kỳ; No 7 chỉ còn `UPDATE … LOCKED` | 0.1.2 → 0.1.3, History dòng 4; `_index` cập nhật | Khớp dòng | **Đúng.** Giờ khớp câu Error của K7 (`:325` "P+1 do K8 bảo đảm tồn tại trước khi ghi") và L5-D04 (hàm tạo kỳ ở FG-10, K8 chỉ bảo đảm). Tạo kỳ trong cùng transaction nên lỗi ở No 2–9 sẽ rollback luôn kỳ vừa tạo, không để lại kỳ mồ côi |
| `specs/_index.md` DEP-18 | Thêm dòng 販売公開 / 販売終了, đủ 7 cột, trỏ A-FG03-20 | File không có bảng History (như trước); 2 dòng version của LOT_FUNC / INC_ENGINE trong bảng cũng cập nhật | Khớp dòng, 107 / 107 | **Đúng** |

Glossary trong phần JA mới: không dùng 承認 cho duyệt nội bộ; 交付率表 và ランク đúng; "TC 年" là chữ có sẵn từ trước, không phải mới thêm.

### 3. Script
`check-backlog.py` 0 lỗi; link 0 gãy; bảng sinh lại khớp yaml.

### Phát hiện mới

| # | Mức | File:vị trí | ID RFP / nguồn | Vấn đề | Cách sửa đề xuất |
|---|---|---|---|---|---|
| Q-01 | Minor (sửa trước Gate C) | `specs/delivery/technical-design/DEL_RECORD_TECH.md:202` (+ `ja/`); yaml A-FG06-04, A-FG03-16 | L5-S01, L5-G02 | Mới sửa một nửa L5-S01: LOT_FUNC 2.11 nói delivery gọi hàm, nhưng DEL_RECORD_TECH §5 vẫn ghi "không đổi trạng thái lô sang DELIVERED (module lot đọc `v_delivery_status`)". Dev làm A-FG06-04 theo TECH sẽ không gọi hàm, và lô vẫn không bao giờ thành `DELIVERED` | Sửa câu ở DEL_RECORD_TECH §5 (và đường ngoại lệ ở DEL_EXCEPTION_DISPUTE_TECH nếu đóng GD): "gọi `app.fn_lot_refresh_delivery_status` trong cùng transaction"; tăng version, thêm History, sửa `ja/` cùng commit; thêm vào PREMISE L5-S01 cột Spec. Thêm DoD vào A-FG06-04 (gọi hàm) và A-FG03-16 (cài hàm 2.11) |
| Q-02 | Minor | yaml A-FG01-07.2, A-FG01-08.3 (`depends_on_spec: DEP-01 API MFA verify`); L5-D10 "MFA (S2)" | Câu 3 khách (MFA S1 có thì tốt, S2 chấp nhận); DEP-01 | 決裁 (07.2) và 確認 (08.3) ở S1 cần token MFA theo spec, nhưng MFA dời sang S2. Chưa ghi demo S1 chạy bằng gì | Ghi vào L5-D10 / DoD: S1 dùng token MFA ký bằng khóa test theo cột seed của DEP-01, middleware kiểm thật ở S2; nói rõ với khách trong buổi demo / progress-report rằng danh sách hành động cần MFA không đổi |
| Q-03 | Minor | yaml A-FG01-13.1, 13.2, 20.1 | DEP-15; SC-01-02_SPEC:145-146 | SC-01-01 và nút trên SC-01-02 đều không có ở S1, vậy vào SC-01-03 / 04 / 05 từ đâu (menu + nhập mã người tham gia?) chưa ghi. DoD của 13.1 / 13.2 cũng chưa trỏ tới Screen Spec A-FG01-17 như 20.1 đã trỏ A-FG01-16.1 | Ghi cửa vào trong DoD (menu SC-00-03 + ô mã người tham gia) và "đúng Screen Spec SC-01-03 / 04 (A-FG01-17)". Ở progress-report S1, ghi phần dời sang S2 (khối xem trên SC-01-02, lỗi / khóa của SC-00-01) theo yêu cầu "nói trước cái gì bị đẩy" của khách |

### Verdict cuối Gate A: **RELEASE**

- Mọi điều kiện của Gate A và kiểm diff đã đạt: M-01..M-07, m-01..m-07, N-01..N-03. N-04 chuyển sang Gate B như đã thống nhất.
- Không còn Critical / Major. Còn 3 Minor mới:
  - Q-02, Q-03 sửa trong yaml / PREMISE, không chặn P2.
  - **Q-01 phải sửa trước Gate C**, vì đó là mâu thuẫn trong spec LAB-4 vừa sửa.
- P2 được đẩy toàn bộ backlog lên Project, kể cả trường Iteration 1.

**Status:** DONE
