# Bảng hash commit trước / sau khi làm sạch lịch sử git (2026-11-27)

Ngày 2026-11-27 (sau Gate C LAB-5), lịch sử repo được viết lại bằng `git filter-repo --replace-text` trên mọi nhánh và tag, để gỡ khỏi **toàn bộ lịch sử** 4 nhóm chuỗi (người làm bài quyết, theo Expert Gate C M-05): handle công ty của tác giả chuẩn nội bộ, nguyên văn sheet `Logs` của biểu mẫu nội bộ, URL cổng nội bộ trong README template, mật khẩu + PIN của tài khoản demo cũ. Mỗi chỗ được thay bằng `***REMOVED***`; nội dung khác giữ nguyên, cây thư mục bản LAB-5 không đổi (tree giống hệt trước khi lọc).

Vì vậy **mọi hash commit đều đổi**. Hash cũ còn xuất hiện trong tài liệu (README, AI-report, `lab-4/`, các báo cáo review) là hash trước khi lọc — tra bảng dưới để mở commit tương ứng. Các mốc đã nộp được in đậm.

| Hash cũ | Hash mới | Commit | Ghi chú |
|---|---|---|---|
| `e9e9b4e` | `6566796` | Initial commit | commit đầu (README template, đã thay URL nội bộ) |
| `657aa37` | `e4ca0dc` | feat(prototype): add LAB-2 wholesale market prototype | commit có mật khẩu + PIN demo cũ (đã thay) |
| `eb1184d` | `87843a7` | fix(prototype): address independent code review findings |  |
| `fd69ae2` | `892c0bb` | test(prototype): align verify data with stricter amount and delivery rules |  |
| `b06cffa` | `21ca7fb` | docs(prototype): add Vercel production URL to README |  |
| `218f2b1` | `63c4289` | chore(prototype): add production bundle secret scan |  |
| `6175735` | `549a71a` | chore(prototype): trigger Vercel deploy with account-linked author email |  |
| `d5010a4` | `5da4a87` | feat(prototype): seed an approved correction and clarify demo docs |  |
| `7342796` | `e2f3ceb` | feat(prototype): redesign UI as a Japanese business web app |  |
| `0a99d10` | `d82a2d5` | feat(prototype): refine UI from expert recheck and customer feedback | **LAB-2 nộp** (`main` lúc nộp LAB-2) |
| `f980ea3` | `24c0833` | docs(lab-4): scaffold spec structure and add PREMISE |  |
| `e19a94c` | `8fb4e9f` | docs(lab-4): apply customer feedback to PREMISE (v0.3.0) |  |
| `eb41c1c` | `e50bf05` | docs(lab-4): add architecture, ADRs, database design and wireframes |  |
| `fb1b794` | `e622363` | docs(lab-4): split database design into cluster files and fix Gate 1 findings |  |
| `0d4f44a` | `570a4d8` | docs(lab-4): align PREMISE, architecture and ADRs with Gate 1 review |  |
| `42171a7` | `41a4fdb` | docs(lab-4): apply Gate 1 and customer feedback to wireframes |  |
| `5b0ef16` | `470cf2e` | docs(lab-4): fix Gate 1 recheck findings on test vectors and procedures |  |
| `6bb1bdb` | `02e7c61` | docs(lab-4): align database design, ADRs and PREMISE with P3 specs |  |
| `71352c9` | `22f89be` | docs(lab-4): update wireframes and add annotated screen render script |  |
| `aa1a4c2` | `b0b32ae` | docs(lab-4): add shared API conventions, API list and error codes |  |
| `c6f376a` | `d04b922` | docs(lab-4): add lot and trade specifications |  |
| `5f56f45` | `caa7556` | docs(lab-4): add party, delivery and settle specifications |  |
| `20bea92` | `f14418c` | docs(lab-4): add incentive and rule specifications |  |
| `378c713` | `fa13064` | docs(lab-4): require one-time MFA token for rule checker and cancel |  |
| `b1b9113` | `f15274e` | docs(lab-4): add done criteria and customer answers to delivery and settle |  |
| `fc24f55` | `0bb4da7` | docs(lab-4): apply customer answers to party, lot and trade specs |  |
| `ab9569a` | `8e960ce` | chore(lab-4): split annotated screen renderer and add API spec checker |  |
| `f83c791` | `759c33f` | docs(lab-4): settle late entries of locked periods in the open period |  |
| `21b707c` | `49a1ff9` | docs(lab-4): list input-data dependencies and record 12-screen decision |  |
| `671c17e` | `6166a54` | docs(lab-4): export Technical Design sequence diagrams to PNG |  |
| `fabc771` | `de74a63` | docs(lab-4): add HTML wireframe pipeline and SC-04-01 pilot |  |
| `9d5d031` | `bbd8cea` | docs(lab-4): add HTML wireframes for the remaining 14 screens |  |
| `e8288ea` | `c28d904` | docs(lab-4): fix wireframe and Technical Design minor review findings |  |
| `f8042f2` | `d1dbf12` | docs(lab-4): add AI report, folder structure and inheritance table |  |
| `6594832` | `68bc277` | docs(lab-4): fix Gate 3 review findings and add AI-report evidence |  |
| `7c080a9` | `4e1fe59` | docs(lab-4): close Gate 3 diff notes and accept reviewed ADRs |  |
| `f910c8b` | `e6369cf` | docs(lab-4): move Gate 3 diff-check history rows into History tables |  |
| `9367490` | `f0a2948` | fix(specs): drop 承認 for internal approval steps and fix typo found during ja review |  |
| `05c8cf8` | `9b76f4d` | docs(ja): add Japanese mirror of the LAB-4 design package |  |
| `f1d0aec` | `22fbf4b` | docs(ja): fix Expert JA review findings FB-EXP-314..323 |  |
| `a896bd3` | `7d777d2` | docs(ja): fix Expert diff-check findings FB-EXP-324..326 |  |
| `caae42b` | `2bfddc0` | docs(readme): list ja/ and Mermaid sequence diagrams as spec-standards exceptions |  |
| `020bcce` | `b20dfdf` | docs(ai-report): add AI run time and human review time (0.2.3) |  |
| `0c19b61` | `58b084f` | docs(ai-report): rewrite concisely for the reviewer (0.3.0) | **LAB-4 nộp** — `main`, `ver/lab-4`, tag `lab-4` |
| `9eec65a` | `ab80d5c` | chore(lab-5): move LAB-4 README/PREMISE/AI-report to lab-4/ and drop demo credentials |  |
| `2168feb` | `af68e90` | docs(lab-5): merge P1 backlog streams, add task-breakdown and PREMISE |  |
| `a586464` | `5dd580f` | docs(lab-5): rework backlog after Gate A (rolling-wave, design issues, S1 capacity) |  |
| `390011d` | `15a1be9` | docs(lab-5): S1 screens for AC-S1-2 and apply PREMISE spec changes |  |
| `d122354` | `24ca569` | docs(lab-5): delivery calls lot refresh function; S1 demo notes (Gate A Q-01..Q-03) |  |
| `2716f2b` | `38a137a` | chore(lab-5): P2 scripts and partial push state (issues #1-#287, English titles) |  |
| `9aa112a` | `602a68e` | chore(lab-5): finish P2 push — 499 items in GitHub Project, English titles |  |
| `8f44f43` | `2a4e446` | docs(lab-5): P3 estimate — SWP report, hours = SWP x 2.0, Point/Hours on Project |  |
| `03b7f27` | `785bf0a` | docs(lab-5): Gate B fixes — split 4 incentive leaves, needs-split label, design-system and defect-fix placeholders |  |
| `93f8d68` | `9780f85` | docs(lab-5): Gate B rescore — 11 leaves scored, Point/Hours for 509 items |  |
| `d698959` | `775de13` | docs(lab-5): split #486 further — lock frame vs ordered checks (#510), pending rescore |  |
| `488ee8c` | `6963b08` | docs(lab-5): score split #486 / #510 and write Point/Hours (510 items) |  |
| `72ce494` | `379bb39` | docs(lab-5): simulated Iteration 1 sprint, burndown and progress report |  |
| `2b220d6` | `bee9ca1` | docs(lab-5): cross-run calibration (#507 4 -> 6), gate-b report r2, stale counts (Gate B R-01, R-02) |  |
| `4b2ffc5` | `3b242e6` | docs(lab-5): revise Iteration 1 progress report per customer review |  |
| `bd569c6` | `73613ce` | docs(lab-5): package submission - README, AI-report, evidence; remove template files |  |
| `94a1448` | `4ee9639` | docs(lab-5): rewrite log-convention summary, remove template shell scripts | HEAD `ver/lab-5` lúc Gate C review |
| `d349ed6` | `fc50d03` | docs(lab-5): address Gate C review - closed-issue note, R-13 as of report date, minor fixes |  |
