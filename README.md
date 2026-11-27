# Product A — 桜水産市場: backlog, estimate và sprint giả lập (LAB-5)

| Mục | Nội dung |
|---|---|
| Tên dự án | Hệ thống hỗ trợ vận hành chợ bán buôn thủy sản 株式会社 桜水産市場 (Product A) |
| Mã học viên | phuongnnm-23344 |
| Đề | **Product A** |

Khách hàng, số liệu và dữ liệu trong repo đều hư cấu (bài luyện tập). Mọi câu trả lời "của khách" do một agent AI đóng vai, gắn nhãn `[Customer giả lập]` / `[Giả lập]`.

## 1. Tổng quan

| Mục | Nội dung |
|---|---|
| Break từ bản LAB-4 nào | Bộ thiết kế LAB-4 nộp **2026-11-26**: tag `lab-4` = commit `58b084f` (nhánh `ver/lab-4`; hash sau khi làm sạch lịch sử — xem [bảng mốc](AI-report-evidence/lab-5/logs/git-history-rewrite-hash-map.md)). README / PREMISE / AI-report của LAB-4 chuyển vào [`lab-4/`](lab-4/README.md) (bản tiếng Nhật ở `ja/lab-4/`) |
| PREMISE.md có thay đổi không | **Có.** [`PREMISE.md`](PREMISE.md): 4 chỗ sửa spec LAB-4 (L5-S01..S04, đã áp vào spec, mỗi file tăng version + dòng History), 18 giả định bổ sung (L5-A01..A18), 12 hướng đã chốt (L5-D01..D12) |
| Số epic | **18** — 15 nhóm chức năng FG-01..FG-15 (theo function list LAB-1) + `PLAT` (nền tảng) + `TEST` (総合テスト / UAT) + `CLAR` (điểm cần làm rõ) |
| Quy mô backlog | 510 item trên Project = 18 epic + 492 issue (264 issue cấp 1 + 228 sub-issue); 409 lá được chấm |
| Estimate | **1.739 SWP / 3.478 giờ** (giờ = SWP × 2,0); giờ dự báo cả đợt 5.396 (lá thô giữ giờ LAB-1) — xem [`estimate.md`](estimate.md) |
| Sprint giả lập đã chạy | **Iteration 1** = S1 trong WBS LAB-1, **2027-02-01 → 2027-02-12** (10 ngày làm). Xong 20 / 26 lá, 80 / 112 SWP (71%) — xem [`progress-report.md`](progress-report.md) |

**Đọc số giờ trên Project:** dòng "Giờ sơ bộ N" trong thân issue là giờ ước lúc break (P1) hoặc giờ giữ chỗ lấy từ LAB-1; số dùng để lập kế hoạch là trường **Hours** (= Point × 2,0). Hai số khác nhau trên cùng issue là bình thường.

## 2. Link

| Link | Địa chỉ |
|---|---|
| Repo | https://github.com/phuongnnm-23344/lab-wholesale-market (nhánh nộp: `ver/lab-5`) |
| GitHub Project | https://github.com/users/phuongnnm-23344/projects/1 — epic / issue / sub-issue, Status, Priority, Iteration, Người phụ trách (giả định), **Point** (SWP đã review), **Hours** (giờ ước lượng). Mở view **Backlog** (bảng đủ các trường trên) hoặc **Iteration 1** (board sprint giả lập theo Status) |
| Báo cáo HTML của skill chấm SWP (`tkm:sun-estimate`) | [`reports/sun-estimate-lab5-project1-20261127-0216.html`](reports/sun-estimate-lab5-project1-20261127-0216.html) (lần chấm chính, 401 lá) · [`reports/sun-estimate-lab5-gate-b-rescore-20261127-r2.html`](reports/sun-estimate-lab5-gate-b-rescore-20261127-r2.html) (chấm lại 11 lá sau Gate B) · [`reports/sun-estimate-lab5-486-split-rescore-20261127.html`](reports/sun-estimate-lab5-486-split-rescore-20261127.html) (#486 tách tiếp, 2 lá) · [`reports/sun-estimate-lab5-507-cross-run-20261127.html`](reports/sun-estimate-lab5-507-cross-run-20261127.html) (chấm chéo #507). **Cách mở:** GitHub hiện file `.html` dưới dạng mã nguồn — mở file, bấm *Download raw file* rồi mở file đã tải bằng trình duyệt (không cần đăng nhập) |
| Burndown | [`progress/iteration-1-burndown.png`](progress/iteration-1-burndown.png) |

**Mở thử không đăng nhập:** `<chờ xác nhận — người làm bài mở repo, Project và báo cáo HTML bằng cửa sổ ẩn danh sau khi chuyển public, ghi ngày ở đây>`

## 3. Cấu trúc repo

| File / thư mục | Nội dung |
|---|---|
| `README.md` | File này |
| [`PREMISE.md`](PREMISE.md) | Tiền đề LAB-5: spec thêm / bỏ / sửa so với LAB-4, giả định bổ sung, hướng đã chốt |
| [`task-breakdown.md`](task-breakdown.md) | Nguyên tắc chia task, Spec → issue, hạng mục 完納奨励金, chỗ hở / mâu thuẫn của spec LAB-4 |
| [`estimate.md`](estimate.md) | Issue mẫu và cách chốt SWP, quy ước giờ, tổng theo epic, so với estimate LAB-1 |
| [`progress-report.md`](progress-report.md) | Báo cáo Iteration 1 (giả lập): trạng thái, burndown, rủi ro trễ. Bản gửi khách tiếng Nhật: [`ja/progress-report.md`](ja/progress-report.md) |
| [`AI-report.md`](AI-report.md) | Cách dùng AI ở LAB-5: skill, prompt, review, tự đánh giá |
| [`reports/`](reports/) | Báo cáo HTML của skill chấm SWP (4 lần chấm). Payload nhúng trong HTML là nguồn ghi Point / Hours |
| [`backlog/`](backlog/) | Nguồn của backlog: `backlog.yaml` (mọi issue: epic, spec ref, DoD, phụ thuộc, nhãn), `issue-map.csv` (id → số issue), `estimate-swp-hours.csv` (SWP / giờ từng issue), `p1-streams/` (bản thô của 3 luồng break song song, giữ để truy vết), `scripts/` (dựng, kiểm, đẩy backlog lên Project, ghi Point / Hours, nhật ký sprint, burndown) |
| [`progress/`](progress/) | Nhật ký giả lập theo ngày của Iteration 1 (CSV), số burndown (CSV) và ảnh burndown (VI + JA) |
| [`AI-report-evidence/`](AI-report-evidence/README.md) | Bằng chứng cho AI-report: LAB-4 (thư mục gốc) và LAB-5 ([`lab-5/`](AI-report-evidence/lab-5/README.md) — review Expert Gate A / B, góp ý khách giả lập, sổ feedback, brief giao việc) |
| [`lab-4/`](lab-4/README.md) | README, PREMISE, AI-report nộp ở LAB-4 (giữ để spec LAB-4 trỏ về các dòng `L4-…`) |
| [`specs/`](specs/_index.md) | Bộ spec LAB-4: 12 Screen Specification, 7 Function Specifications, 15 Technical Design, 42 API Design, 10 Database Design, quy ước chung `_common/`. Viết theo chuẩn nội bộ spec-standards của công ty (không công khai); bản public đã gỡ thư mục file khuôn `_templates/` |
| [`architecture/`](architecture/_index.md) | Kiến trúc to-be và 10 ADR (LAB-4) |
| [`wireframes/`](wireframes/_index.md) | 画面一覧 (70 màn) + 15 wireframe (Markdown, HTML, PDF, PNG) (LAB-4) |
| [`requirements/`](requirements/_index.md) | Chỗ cho tài liệu yêu cầu theo chuẩn công ty; LAB-4 / LAB-5 chưa dùng (bản public đã gỡ file khuôn) |
| [`ja/`](ja/progress-report.md) | Bản tiếng Nhật: bộ thiết kế LAB-4 (cùng cây thư mục với bản tiếng Việt), README / PREMISE / AI-report LAB-4 (`ja/lab-4/`), progress-report LAB-5 |
| [`prototype/`](prototype/README.md) | Prototype chạy thật LAB-2 (Next.js + Supabase, dữ liệu giả); không sửa ở LAB-5 ngoài việc gỡ mật khẩu demo khỏi README |
| [`scripts/`](scripts/) | Script của bộ thiết kế LAB-4: kiểm link Markdown, kiểm API Design, render wireframe, xuất ảnh Mermaid |
| `.github/` | Issue form, PR template và 2 workflow của template quản lý dự án Sun* mà repo được dựng từ đó (workflow gắn nhãn được tắt khi đẩy backlog hàng loạt, đã bật lại) |
| `.gitignore` | Bỏ qua `node_modules`, `.env*`, file build, `__pycache__` |

Bản public đã gỡ khỏi cây thư mục các phần không phải nội dung tự viết: `wiki-template/`, `images/`, `webhook/`, `.bot-test/`, `CHANGELOG.md`, 3 script `*.sh` trong `scripts/` (của template quản lý dự án), `specs/_templates/`, `requirements/_templates/` (file khuôn của chuẩn nội bộ), và phần README của template trong `lab-4/README.md`. Quy ước log `specs/_common/log-convention.md` mục 1–3 được viết lại thành bản tóm tắt của dự án, không chép nguyên văn chuẩn nội bộ.

**Lịch sử git đã làm sạch** (2026-11-27, `git filter-repo --replace-text`): handle tác giả chuẩn nội bộ, nguyên văn biểu mẫu log nội bộ, URL cổng nội bộ và mật khẩu / PIN demo cũ được thay bằng `***REMOVED***` trong mọi commit; vì vậy mọi hash commit đổi. Hash cũ không được công bố vì chúng trỏ tới nội dung đã gỡ; mọi hash nhắc trong tài liệu đã đổi sang hash mới — bảng mốc ở [`AI-report-evidence/lab-5/logs/git-history-rewrite-hash-map.md`](AI-report-evidence/lab-5/logs/git-history-rewrite-hash-map.md). Repo nội bộ của chuẩn spec chỉ còn được nhắc tên trong lịch sử cũ (người làm bài chấp nhận).

## 4. Spec → epic

Số `#` là số issue của epic trên Project. Chi tiết từng file spec → issue ở [`task-breakdown.md`](task-breakdown.md) §2.

| Spec (mã / file LAB-4, hoặc dòng PREMISE) | Epic trên Project (#số — tên) | Ghi chú |
|---|---|---|
| SC-01-02, `PARTY_FUNC`, `PTY_PERMIT_LIFECYCLE_TECH`, `PTY_APPROVAL_LIFECYCLE_TECH`, API-PTY-001..007, `PARTY_DB`; 画面一覧 SC-01-01, 03..06 | #5 — [FG-01] Participants and qualifications: permit (wholesaler) / approval (trading participant) | 許可 (仲卸) và 承認 (売買参加者) là hai bản ghi, hai vòng đời riêng — nhãn `rule:許可≠承認`; epic của Iteration 1 |
| `IAM_AUDIT_DB` (phần tài khoản / phiên), ADR-002, ADR-003; 画面一覧 SC-00-01..03, SC-02-02 / 03 | #14 — [FG-02] Accounts, authentication, authorization — accounts, MFA, proxy, PIN | Chưa có Screen Specification → issue thiết kế 設計第1波 trước S1 (PREMISE L5-D05); MFA thật ở S2 (L5-D10) |
| SC-03-01, SC-03-05, `LOT_FUNC`, `LOT_REGISTER_TECH`, `LOT_INSPECTION_RECORD_TECH`, API-LOT-001..006, `LOT_DB`; DEP-04 / 05 / 07; PREMISE L5-S01, L5-S04 (DEP-18) | #6 — [FG-03] Lot intake and inspection records — intake, quality inspection, offline / sync | 目利き do người quyết, không AI / OCR. L5-S04: thiếu thao tác đổi lô sang `PUBLISHED` (chặn luồng 相対) → issue thiết kế #70 |
| SC-04-01, `TRADE_FUNC`, `TRADE_AITAI_CONFIRM_TECH`, `TRADE_QUALIFICATION_CHECK_TECH`, `TRADE_SAME_DAY_FIX_TECH`, API-TRD (相対), `TRADE_DB`; DEP-06 | #7 — [FG-04] Negotiated (aitai) trades — main flow | **Luồng chính** (~90% giá trị); S3 không được trễ (khách giả lập) |
| SC-05-02, `TRADE_SERI_CONFIRM_TECH`, API-TRD (せり); DEP-10 | #8 — [FG-05] Auction result recording — secondary flow | Luồng phụ; người chốt kết quả せり |
| SC-06-02, SC-06-04, SC-06-05, `DELIVERY_FUNC`, `DEL_RECORD_TECH`, `DEL_EXCEPTION_DISPUTE_TECH`, API-DEL-001..006 | #9 — [FG-06] Delivery management — deliveries, exceptions, disputes | Giao có tranh chấp: người xác nhận cuối; phía gọi của L5-S01 |
| SC-07-02, `SETTLE_FUNC` (khóa ngày), `STL_DAY_CLOSE_TECH`, `STL_DEVICE_LOST_TECH`, API-STL (日次締め), `CLOSE_DB` | #10 — [FG-07] Reconciliation and daily close — reconciliation, day lock, disputes / SLA | Ngày đã khóa không sửa trực tiếp |
| SC-08-03, `STL_CORRECTION_DECIDE_TECH`, API-STL (修正申請), `ADJUST_DB`, ADR-004; DEP-09 | #11 — [FG-08] Correction requests and sign-off — post-confirmation adjustments (REVERSE / DELTA) | Không ghi đè lịch sử: yêu cầu điều chỉnh + 決裁 + bản ghi REVERSE / DELTA |
| **SC-09-04, `INC_FUNC`, `INC_ENGINE_TECH` (K1–K9, TV-01..15), API-INC-001..004, `INCENTIVE_DB`, `BILLING_DB` §4.44–4.50, ADR-007; PREMISE L5-S02, L5-S03, L5-A02..A04; DEP-11** | **#12 — [FG-09] On-time full-payment incentive** | **Ràng buộc đặc thù 完納奨励金:** nhãn `constraint:完納奨励金` trên 51 issue của epic (42 lá, 199 SWP) và 14 issue làm rõ ở #21 — mỗi khối K1..K9 một issue, 5 issue test theo nhóm TV, màn SC-09-04, điểm kiểm số với khách cuối S4 (#121); điều chỉnh thưởng = DELTA kỳ sau. Lý do tách: [`task-breakdown.md`](task-breakdown.md) §3 |
| SC-10-04, `RULE_FUNC`, `RULE_VERSION_TECH`, API-RULE-001..006, `RULE_DB`, ADR-006; DEP-08 / 12 / 16 | #13 — [FG-10] Rule versions, incentive rates, masters, calendar | Quy chế có version + ngày hiệu lực + maker-checker + rollback, ≤ 4 lần / năm; nhánh E-14 để mở (#36) |
| 画面一覧 SC-11-01..16 (12 báo cáo, CSV kế toán); `BILLING_DB` §4.40–4.42; DEP-17 | #15 — [FG-11] Reports and data export — 12 reports, accounting CSV | Chưa có spec → issue thô + issue thiết kế (rolling-wave, L5-D08) |
| 画面一覧 SC-12-02; DEP-13 | #16 — [FG-12] Notifications — in-app + email | Chưa có spec → issue thô |
| `IAM_AUDIT_DB` (監査ログ), ADR-009; 画面一覧 SC-13-01..03 | #17 — [FG-13] Audit and security — audit log, security, 7-year retention | Lưu online 7 năm |
| ADR-009, `ARCHITECTURE` (vận hành); 画面一覧 SC-14-01 | #18 — [FG-14] Operations monitoring and availability — monitoring, backup, RTO / RPO | RTO 4 giờ / RPO 15 phút, giờ dịch vụ 02:00–10:00 |
| 画面一覧 SC-15-01..03 | #19 — [FG-15] Data migration | Chưa có spec migrate; nguồn là fixture CSV của khách |
| `ARCHITECTURE`, ADR-001, `specs/_common/`; PREMISE L5-D12 (design system #500) | #1 — [PLAT] Platform — AWS foundation, CI/CD, app skeleton, shared conventions | S0 coi như xong trước S1 (giả định theo WBS LAB-1) |
| Test vector, NFR / ACC; PREMISE L5-D12 (sửa lỗi sau 総合テスト / UAT #501) | #20 — [TEST] System testing, UAT and release | — |
| DEP-01..18 (phần còn phải hỏi), điểm mở ở ADR §6, câu hỏi Q-* / E-* | #21 — [CLAR] To clarify — open points with the customer / internal | 41 issue làm rõ, mỗi issue ghi giả định tạm + ảnh hưởng nếu sai |
| ADR-010 (ranh giới phạm vi, option) | — | Không có epic: option (giao dịch từ xa, portal người mua, phân tích, AI) tách riêng, không vào backlog 第1期 |
