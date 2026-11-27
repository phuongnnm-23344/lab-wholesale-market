# Hash commit sau khi làm sạch lịch sử git (2026-11-27)

Ngày 2026-11-27 (sau Gate C LAB-5), lịch sử repo được viết lại bằng `git filter-repo --replace-text` trên mọi nhánh và tag, để gỡ khỏi toàn bộ lịch sử một số chuỗi không được public (nội dung nội bộ và thông tin đăng nhập của tài khoản demo cũ); mỗi chỗ được thay bằng `***REMOVED***`. Cây thư mục bản LAB-5 không đổi.

Vì vậy **mọi hash commit đều đổi**. Hash cũ **không được công bố**: chúng trỏ tới nội dung đã gỡ. Mọi hash nhắc trong tài liệu của repo đã được thay bằng hash mới tương ứng. Bảng dưới là các commit hiện có, mốc đã nộp in đậm.

| Hash | Ngày | Commit | Mốc |
|---|---|---|---|
| `6566796` | 2026-11-23 | Initial commit |  |
| `e4ca0dc` | 2026-11-23 | feat(prototype): add LAB-2 wholesale market prototype |  |
| `87843a7` | 2026-11-23 | fix(prototype): address independent code review findings |  |
| `892c0bb` | 2026-11-23 | test(prototype): align verify data with stricter amount and delivery rules |  |
| `21ca7fb` | 2026-11-23 | docs(prototype): add Vercel production URL to README |  |
| `63c4289` | 2026-11-23 | chore(prototype): add production bundle secret scan |  |
| `549a71a` | 2026-11-23 | chore(prototype): trigger Vercel deploy with account-linked author email |  |
| `5da4a87` | 2026-11-23 | feat(prototype): seed an approved correction and clarify demo docs |  |
| `e2f3ceb` | 2026-11-23 | feat(prototype): redesign UI as a Japanese business web app |  |
| `d82a2d5` | 2026-11-23 | feat(prototype): refine UI from expert recheck and customer feedback | **LAB-2 nộp** (`main` lúc nộp LAB-2) |
| `24c0833` | 2026-11-25 | docs(lab-4): scaffold spec structure and add PREMISE |  |
| `8fb4e9f` | 2026-11-25 | docs(lab-4): apply customer feedback to PREMISE (v0.3.0) |  |
| `e50bf05` | 2026-11-25 | docs(lab-4): add architecture, ADRs, database design and wireframes |  |
| `e622363` | 2026-11-25 | docs(lab-4): split database design into cluster files and fix Gate 1 findings |  |
| `570a4d8` | 2026-11-25 | docs(lab-4): align PREMISE, architecture and ADRs with Gate 1 review |  |
| `41a4fdb` | 2026-11-25 | docs(lab-4): apply Gate 1 and customer feedback to wireframes |  |
| `470cf2e` | 2026-11-25 | docs(lab-4): fix Gate 1 recheck findings on test vectors and procedures |  |
| `02e7c61` | 2026-11-25 | docs(lab-4): align database design, ADRs and PREMISE with P3 specs |  |
| `22f89be` | 2026-11-25 | docs(lab-4): update wireframes and add annotated screen render script |  |
| `b0b32ae` | 2026-11-25 | docs(lab-4): add shared API conventions, API list and error codes |  |
| `d04b922` | 2026-11-25 | docs(lab-4): add lot and trade specifications |  |
| `caa7556` | 2026-11-25 | docs(lab-4): add party, delivery and settle specifications |  |
| `f14418c` | 2026-11-25 | docs(lab-4): add incentive and rule specifications |  |
| `fa13064` | 2026-11-25 | docs(lab-4): require one-time MFA token for rule checker and cancel |  |
| `0bb4da7` | 2026-11-25 | docs(lab-4): apply customer answers to party, lot and trade specs |  |
| `f15274e` | 2026-11-25 | docs(lab-4): add done criteria and customer answers to delivery and settle |  |
| `759c33f` | 2026-11-25 | docs(lab-4): settle late entries of locked periods in the open period |  |
| `8e960ce` | 2026-11-25 | chore(lab-4): split annotated screen renderer and add API spec checker |  |
| `49a1ff9` | 2026-11-25 | docs(lab-4): list input-data dependencies and record 12-screen decision |  |
| `6166a54` | 2026-11-25 | docs(lab-4): export Technical Design sequence diagrams to PNG |  |
| `de74a63` | 2026-11-25 | docs(lab-4): add HTML wireframe pipeline and SC-04-01 pilot |  |
| `bbd8cea` | 2026-11-25 | docs(lab-4): add HTML wireframes for the remaining 14 screens |  |
| `c28d904` | 2026-11-25 | docs(lab-4): fix wireframe and Technical Design minor review findings |  |
| `d1dbf12` | 2026-11-25 | docs(lab-4): add AI report, folder structure and inheritance table |  |
| `68bc277` | 2026-11-25 | docs(lab-4): fix Gate 3 review findings and add AI-report evidence |  |
| `4e1fe59` | 2026-11-26 | docs(lab-4): close Gate 3 diff notes and accept reviewed ADRs |  |
| `e6369cf` | 2026-11-26 | docs(lab-4): move Gate 3 diff-check history rows into History tables |  |
| `f0a2948` | 2026-11-26 | fix(specs): drop 承認 for internal approval steps and fix typo found during ja review |  |
| `9b76f4d` | 2026-11-26 | docs(ja): add Japanese mirror of the LAB-4 design package |  |
| `22fbf4b` | 2026-11-26 | docs(ja): fix Expert JA review findings FB-EXP-314..323 |  |
| `7d777d2` | 2026-11-26 | docs(ja): fix Expert diff-check findings FB-EXP-324..326 |  |
| `2bfddc0` | 2026-11-26 | docs(readme): list ja/ and Mermaid sequence diagrams as spec-standards exceptions |  |
| `b20dfdf` | 2026-11-26 | docs(ai-report): add AI run time and human review time (0.2.3) |  |
| `58b084f` | 2026-11-26 | docs(ai-report): rewrite concisely for the reviewer (0.3.0) | **LAB-4 nộp** — `main`, `ver/lab-4`, tag `lab-4` |
| `ab80d5c` | 2026-11-26 | chore(lab-5): move LAB-4 README/PREMISE/AI-report to lab-4/ and drop demo credentials |  |
| `af68e90` | 2026-11-26 | docs(lab-5): merge P1 backlog streams, add task-breakdown and PREMISE |  |
| `5dd580f` | 2026-11-26 | docs(lab-5): rework backlog after Gate A (rolling-wave, design issues, S1 capacity) |  |
| `15a1be9` | 2026-11-26 | docs(lab-5): S1 screens for AC-S1-2 and apply PREMISE spec changes |  |
| `24ca569` | 2026-11-26 | docs(lab-5): delivery calls lot refresh function; S1 demo notes (Gate A Q-01..Q-03) |  |
| `38a137a` | 2026-11-26 | chore(lab-5): P2 scripts and partial push state (issues #1-#287, English titles) |  |
| `602a68e` | 2026-11-26 | chore(lab-5): finish P2 push — 499 items in GitHub Project, English titles |  |
| `2a4e446` | 2026-11-27 | docs(lab-5): P3 estimate — SWP report, hours = SWP x 2.0, Point/Hours on Project |  |
| `785bf0a` | 2026-11-27 | docs(lab-5): Gate B fixes — split 4 incentive leaves, needs-split label, design-system and defect-fix placeholders |  |
| `9780f85` | 2026-11-27 | docs(lab-5): Gate B rescore — 11 leaves scored, Point/Hours for 509 items |  |
| `775de13` | 2026-11-27 | docs(lab-5): split #486 further — lock frame vs ordered checks (#510), pending rescore |  |
| `6963b08` | 2026-11-27 | docs(lab-5): score split #486 / #510 and write Point/Hours (510 items) |  |
| `379bb39` | 2026-11-27 | docs(lab-5): simulated Iteration 1 sprint, burndown and progress report |  |
| `bee9ca1` | 2026-11-27 | docs(lab-5): cross-run calibration (#507 4 -> 6), gate-b report r2, stale counts (Gate B R-01, R-02) |  |
| `3b242e6` | 2026-11-27 | docs(lab-5): revise Iteration 1 progress report per customer review |  |
| `73613ce` | 2026-11-27 | docs(lab-5): package submission - README, AI-report, evidence; remove template files |  |
| `4ee9639` | 2026-11-27 | docs(lab-5): rewrite log-convention summary, remove template shell scripts | HEAD `ver/lab-5` lúc Gate C review |
| `fc50d03` | 2026-11-27 | docs(lab-5): address Gate C review - closed-issue note, R-13 as of report date, minor fixes | Sửa theo Gate C |
| `6f1a59e` | 2026-11-27 | docs(lab-5): record commit hash map after history cleanup | Ghi bảng mốc sau khi làm sạch lịch sử |
