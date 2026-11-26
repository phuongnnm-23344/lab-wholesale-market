# Task breakdown — Product A (桜水産市場) LAB-5

Backlog break từ bộ thiết kế LAB-4 (tag `lab-4`, commit `0c19b61`, nộp 2026-11-26). Nguồn chuẩn của backlog: [`backlog/backlog.yaml`](backlog/backlog.yaml) — gộp từ 3 luồng break song song ([`backlog/p1-streams/`](backlog/p1-streams/), giữ làm đầu vào thô) bằng [`backlog/scripts/merge-stream-backlogs.py`](backlog/scripts/merge-stream-backlogs.py) theo các quyết định ở [`backlog/scripts/p1-merge-decisions.yaml`](backlog/scripts/p1-merge-decisions.yaml); kiểm bằng [`backlog/scripts/check-backlog.py`](backlog/scripts/check-backlog.py). Bảng ở mục 2, 4 và bảng đếm ở mục 1 sinh bằng [`backlog/scripts/render-task-breakdown-tables.py`](backlog/scripts/render-task-breakdown-tables.py).

**Số issue:** cột "Issue" dùng ID backlog (`A-FG04-07`, `B-FG09-03.2`…). Số `#` trên GitHub Project điền ở bước đẩy Project (P2) bằng bảng `backlog/issue-map.csv`. Tiền đề, giả định, hướng đã chốt: [`PREMISE.md`](PREMISE.md) (dòng `L5-S`, `L5-A`, `L5-D`).

## 1. Nguyên tắc chia task

### 1.1 Độ hạt — chia tới đâu thì dừng

| Quy tắc | Nội dung |
|---|---|
| Đơn vị issue | Một đầu ra kiểm được riêng: 1 khối xử lý có DoD trong Technical Design (vd. K3 của engine 完納奨励金), 1–2 API cùng tài nguyên, 1 màn FE (hoặc 1 nhóm trạng thái của màn lớn), 1 bộ test theo nhóm test vector, 1 migration nhóm bảng, 1 câu hỏi cần khách / nội bộ trả lời |
| Cỡ lá | **Mọi issue lá ≤ 16 giờ**, kể cả issue thô. dev / test: 4–16 giờ; thô (`kind: rough`): 2–16 giờ; làm rõ (`kind: clarify`): 1–4 giờ. Dưới 2 giờ thì gộp vào issue gần nhất |
| Khi nào tách sub-issue | Issue cấp 1 là "một chức năng" cần ≥ 2 vai hoặc > 16 giờ → issue cấp 1 làm cha, sub-issue là phần việc. **Tối đa 2 cấp dưới epic** (epic → issue → sub-issue). Giờ của cha = tổng giờ con; chỉ lá được chấm SWP, cha = tổng SWP con |
| Issue thô (phần chưa có spec, L4-D08) | Không tự thiết kế màn / API thay spec. Tách theo **đơn vị tự nhiên** đọc được từ 画面一覧: 1 màn, 1 nhóm API, 1 batch, 1 báo cáo, 1 script. Đơn vị còn > 16 giờ thì tách theo **khuôn tầng cố định** — FE: *hiển thị* · *thao tác* · *trạng thái + quyền*; BE: *dữ liệu* · *xử lý + API* · *quyền + audit*. Giờ = ước LAB-1 của màn / chức năng đó (人日 × 8), chia đều cho các phần. Mỗi issue thô đi cùng một issue làm rõ (viết spec / hỏi khách); khi có spec thì tách lại theo spec (PREMISE L5-D08) |
| Issue làm rõ | Một câu hỏi / một điểm mở (DEP-xx, OPEN-L4-xx, E-xx, Q-…, §6 Điểm mở của ADR). Câu hỏi trùng giữa các luồng gộp thành một issue (L5-D09). Ưu tiên = ưu tiên cao nhất của issue nó chặn |
| Test | Mỗi epic chức năng có ≥ 1 issue `kind: test`; test vector có sẵn trong spec (TV-…, RV-…, DoD Kx) phải được ghi tên trong issue test |

Vì sao dừng ở ≤ 16 giờ: một người làm xong trong 2 ngày, đủ nhỏ để một sprint 2 tuần thấy được tiến độ theo ngày (burndown), đủ lớn để không sinh issue vụn. Hệ quả: backlog có **481 issue (244 cấp 1 + 237 sub-issue) + 18 epic**; trong đó 171 lá là issue thô (≈ 2.100 giờ) — phần lớn số sub-issue sinh ra từ việc tách phần chưa có spec. Phương án giữ issue thô to (40–136 giờ) đã bị loại vì trái mục tiêu "không để task quá lớn / mơ hồ" (PREMISE L5-D08).

### 1.2 Định nghĩa xong (DoD chung — mỗi issue chỉ ghi thêm DoD riêng)

1. Code + unit test qua trên CI; không giảm độ phủ của module.
2. Đúng API Design (status, body, mã lỗi theo `specs/_common/error-codes.md`); issue iam chưa có API Design thì viết API Design trước khi merge (PREMISE L5-D05).
3. Ghi 監査ログ theo `specs/_common/log-convention.md`; phân quyền theo vai đúng §4.4 / §6.2 của Screen Specification.
4. PR được review; QA chạy các case liên quan và ghi kết quả.
5. Luật của dự án được kiểm theo nhãn `rule:*`: 相対 là luồng chính · 許可 (仲卸) ≠ 承認 (売買参加者) · người quyết cuối (目利き, chốt せり, 決裁 sửa nhạy cảm, giao có tranh chấp) · không ghi đè lịch sử (REVERSE / DELTA, ngày đã khóa không sửa, thưởng điều chỉnh = delta kỳ sau) · quy chế có version + ngày hiệu lực + maker-checker + rollback, ≤ 4 lần / năm.
6. Issue thô: xong khi có Screen Specification / API Design và đã tách lại thành issue dev. Issue làm rõ: xong khi câu trả lời được ghi vào spec / PREMISE và issue bị chặn được mở khóa.

### 1.3 Epic → issue → sub-issue trên GitHub Project

| Cấp | Trên GitHub | Trường / nhãn |
|---|---|---|
| Epic | Issue nhãn `epic`, tiêu đề `[FG-xx] {thuật ngữ JP} — {tiếng Việt}`; 18 epic = nhóm chức năng FG-01..FG-15 của LAB-1 + `EP-PLAT` (基盤) + `EP-TEST` (総合テスト・UAT) + `EP-CLAR` (要確認) | Priority, Sprint dự kiến ghi trong thân epic |
| Issue | Sub-issue của epic (tính năng sub-issue của GitHub) | Status, Iteration, Assignee (giả định — text theo vai: `BE-1`, `FE-2`, `QA-1`, `BrSE-1`…), Point (SWP đã review), Hours, Priority |
| Sub-issue | Sub-issue của issue | Như issue; issue cha cộng Point / Hours của con |
| Nhãn | `fg:FG-xx`, `feature:*`, `kind:{dev,test,rough,clarify}`, `role:*`, `needs-spec` (issue thô), `constraint:完納奨励金` (FG-09 và câu hỏi liên quan), `rule:{aitai-main, permit-vs-approval, human-decision, no-overwrite, versioned-rule}` | — |

Ưu tiên (P1–P4) theo thứ tự khách đưa ([Customer giả lập, 2026-11-26]): P1 FG-01, FG-04 (+ nền tảng); P2 FG-07, FG-03, FG-09, audit, test tổng, đổi người bằng PIN, lịch / 業務日 / bộ giá trị quy chế ban đầu; P3 FG-06, FG-08, FG-02, báo cáo, vận hành, migrate; P4 FG-05, màn đổi version quy chế, thông báo (PREMISE L5-D11).

**Iteration 1** = S1 của WBS LAB-1, 2027-02-01 → 02-12: issue dev / test của FG-01 + FG-02, cộng phần cần cho 4 điều kiện dùng thử của khách (AC-S1-1..4, ghi ở trường `acceptance` của issue) — trừ 保証金 / 参加上限 và cảnh báo hết hạn (khách cho để sau). Tập ứng viên 50 issue / 426 giờ lá, lớn hơn năng lực S1 (đội mới vào, ~50% — WBS LAB-1 §5); số cam kết chốt ở P4 theo năng lực, phần còn lại ghi là trượt (PREMISE L5-D10).

| Điều kiện dùng thử S1 | Issue |
|---|---|
| AC-S1-1 Demo bằng danh sách người tham gia đã che của chợ (actors.csv đợt 1) | A-FG01-14, C-CLR-14 |
| AC-S1-2 照合事務局 đăng ký 1 仲卸 có 許可, 1 売買参加者 có 承認 (有効日 / 失効日 riêng), đặt 一時停止 theo 決裁 | A-FG01-07.1, 07.2, 08.1, 08.3, 09.2, 09.3, A-FG01-10, 11 |
| AC-S1-3 取引担当 gõ mã người mua bằng bàn phím → thấy hiệu lực, căn cứ 許可 / 承認, ngày hết hạn | A-FG01-04, A-FG01-12.3 + 12.6 (SC-01-06), A-CLR-07 |
| AC-S1-4 Hai người đổi nhau bằng PIN trên PC dùng chung trong vài giây; nhật ký đúng người | C-FG02-03, C-FG02-04, C-FG13-02, C-FG02-13.3 + 13.4 (SC-00-02), C-CLR-16, C-FG02-16 |

### 1.4 Số lượng theo epic

<!-- BEGIN GEN epic-counts -->
| Epic | Tên | Ưu tiên | Sprint (WBS LAB-1) | Issue cấp 1 | Sub-issue | Lá | Giờ sơ bộ (lá) |
|---|---|---|---|---|---|---|---|
| EP-FG01 | [FG-01] 参加者・資格管理 — người tham gia, 許可 / 承認 | P1 | S1 | 14 | 20 | 29 | 283 |
| EP-FG03 | [FG-03] ロット受付・評価記録 — tiếp nhận lô, 目利き (gồm offline / sync SC-03-07) | P2 | S2 | 17 | 19 | 29 | 315 |
| EP-FG04 | [FG-04] 相対取引 — giao dịch thỏa thuận (luồng chính) | P1 | S3 | 14 | 21 | 29 | 297 |
| EP-FG05 | [FG-05] せり結果記録 — ghi kết quả せり (luồng phụ) | P4 | S4 | 7 | 8 | 12 | 116 |
| EP-FG06 | [FG-06] 引渡し管理 — giao hàng, ngoại lệ, tranh chấp | P3 | S4–S5 | 13 | 15 | 21 | 205 |
| EP-FG07 | [FG-07] 照合・日次締め — đối soát, khóa ngày, tranh chấp / SLA | P2 | S5 | 8 | 14 | 19 | 252 |
| EP-FG08 | [FG-08] 修正申請・決裁 — điều chỉnh sau chốt (REVERSE / DELTA) | P3 | S6 | 8 | 8 | 14 | 162 |
| EP-FG09 | [FG-09] 完納奨励金 — tiền thưởng thanh toán đúng hạn | P2 | S4 (試算表) · S6–S7 | 21 | 16 | 33 | 372 |
| EP-FG10 | [FG-10] 規則版・交付率・マスタ・カレンダー — quy chế có version, master, lịch | P4 | S2 | 14 | 26 | 35 | 400 |
| EP-FG02 | [FG-02] アカウント・認証・権限 — tài khoản, MFA, 代行, PIN | P3 | S1 | 17 | 15 | 28 | 312 |
| EP-FG11 | [FG-11] 帳票・データ出力 — 12 báo cáo, CSV kế toán | P3 | S8 | 8 | 41 | 44 | 498 |
| EP-FG12 | [FG-12] 通知 — thông báo in-app + email | P4 | S7 | 6 | 5 | 9 | 94 |
| EP-FG13 | [FG-13] 監査・セキュリティ — 監査ログ, bảo mật, lưu 7 năm | P2 | S1 (ghi audit) · S8 | 9 | 9 | 15 | 186 |
| EP-FG14 | [FG-14] 運用監視・可用性 — giám sát, backup RTO/RPO | P3 | S8 | 7 | 0 | 7 | 74 |
| EP-FG15 | [FG-15] データ移行 — chuyển đổi dữ liệu | P3 | S8 + W5 | 5 | 12 | 13 | 160 |
| EP-PLAT | [PLAT] 基盤 — nền tảng AWS, CI/CD, khung app, quy ước chung | P1 | S0 | 11 | 4 | 14 | 142 |
| EP-TEST | [TEST] 総合テスト・UAT・リリース | P2 | sau S8 | 9 | 4 | 11 | 140 |
| EP-CLAR | [CLAR] 要確認 — các điểm cần làm rõ với khách / nội bộ | P2 | trước G1 (2027-01-15) | 56 | 0 | 56 | 104 |
| **Tổng** | 18 epic | | | **244** | **237** | **418** | **4112** |
<!-- END GEN epic-counts -->

## 2. Spec → issue

Mỗi tài liệu LAB-4 có ít nhất một issue hoặc một dòng ở cột cuối (script `check-backlog.py` kiểm: 12 Screen Specification, 7 Function Specifications, 15 Technical Design, 42 API Design, 10 Database Design). Dòng `SCREEN-LIST …` / `DEP-…` là phần chưa có spec (L4-D08): issue thô + issue làm rõ.

<!-- BEGIN GEN spec-issue -->
| Spec (mã / file LAB-4) | Epic | Issue / sub-issue | Phần spec chưa thành issue và vì sao |
|---|---|---|---|
| `specs/delivery/function-specifications/DELIVERY_FUNC.md` | EP-FG06 | A-FG06-03, A-FG06-04 (2 sub), A-FG06-05, A-FG06-06 (2 sub), A-FG06-07 (2 sub) | — |
| `specs/delivery/screen-specification/SC-06-02_SPEC.md` | EP-FG06 | A-FG06-08 (2 sub) | — |
| `specs/delivery/screen-specification/SC-06-04_SPEC.md` | EP-FG06 | A-FG06-09 (2 sub) | — |
| `specs/delivery/screen-specification/SC-06-05_SPEC.md` | EP-FG06 | A-FG06-10 (2 sub) | — |
| `specs/delivery/technical-design/DEL_EXCEPTION_DISPUTE_TECH.md` | EP-FG06 | A-FG06-06 (2 sub), A-FG06-07 (2 sub), A-FG06-12 | — |
| `specs/delivery/technical-design/DEL_RECORD_TECH.md` | EP-FG03, EP-FG04, EP-FG06 | A-FG03-13.1, A-FG03-16, A-FG04-14.3, A-FG06-04 (2 sub), A-FG06-11 | — |
| `specs/incentive/function-specifications/INC_FUNC.md` | EP-FG09 | B-FG09-03, B-FG09-04, B-FG09-05, B-FG09-06, B-FG09-07, B-FG09-08, B-FG09-09, B-FG09-10 (3 sub) | — |
| `specs/incentive/screen-specification/SC-09-04_SPEC.md` | EP-FG09 | B-FG09-12, B-FG09-13 (3 sub), B-FG09-18 | — |
| `specs/incentive/technical-design/INC_ENGINE_TECH.md` | EP-CLAR, EP-FG09, EP-FG10 | B-FG09-01, B-FG09-03, B-FG09-04, B-FG09-05, B-FG09-06, B-FG09-07, B-FG09-08, B-FG09-09, B-FG09-10 (3 sub), B-FG09-11, B-FG09-12, B-FG09-14, B-FG09-15, B-FG09-16, B-FG09-17, B-FG09-18, B-FG09-20 (2 sub), B-FG10-12 (7 sub), B-CLR-03, B-CLR-06, B-CLR-07, B-CLR-08, B-CLR-10, B-CLR-11, B-CLR-12, B-CLR-13, B-FG09-21 | — |
| `specs/lot/function-specifications/LOT_FUNC.md` | EP-CLAR, EP-FG03 | A-FG03-03, A-FG03-04, A-FG03-07, A-FG03-11, A-FG03-14 (3 sub), A-CLR-13, A-CLR-14, A-CLR-15 | — |
| `specs/lot/screen-specification/SC-03-01_SPEC.md` | EP-FG03 | A-FG03-08 (2 sub) | — |
| `specs/lot/screen-specification/SC-03-05_SPEC.md` | EP-CLAR, EP-FG03 | A-FG03-09 (2 sub), A-CLR-12 | — |
| `specs/lot/technical-design/LOT_INSPECTION_RECORD_TECH.md` | EP-FG03 | A-FG03-06 (2 sub), A-FG03-11, A-FG03-16 | — |
| `specs/lot/technical-design/LOT_REGISTER_TECH.md` | EP-FG03 | A-FG03-05 (3 sub), A-FG03-10, A-FG03-12.2 | — |
| `specs/party/function-specifications/PARTY_FUNC.md` | EP-FG01 | A-FG01-05, A-FG01-06, A-FG01-08.4, A-FG01-11 | — |
| `specs/party/screen-specification/SC-01-02_SPEC.md` | EP-CLAR, EP-FG01 | A-FG01-09 (3 sub), A-CLR-19, A-CLR-20 | — |
| `specs/party/technical-design/PTY_APPROVAL_LIFECYCLE_TECH.md` | EP-CLAR, EP-FG01 | A-FG01-04, A-FG01-06, A-FG01-08 (4 sub), A-FG01-11, A-CLR-21 | — |
| `specs/party/technical-design/PTY_PERMIT_LIFECYCLE_TECH.md` | EP-FG01 | A-FG01-07 (3 sub), A-FG01-10 | — |
| `specs/rule/function-specifications/RULE_FUNC.md` | EP-FG10 | B-FG10-02, B-FG10-03, B-FG10-04, B-FG10-05, B-FG10-06, B-FG10-07, B-FG10-08 | — |
| `specs/rule/screen-specification/SC-10-04_SPEC.md` | EP-FG10 | B-FG10-08, B-FG10-09 (2 sub), B-FG10-10 | — |
| `specs/rule/technical-design/RULE_VERSION_TECH.md` | EP-CLAR, EP-FG10 | B-FG10-02, B-FG10-03, B-FG10-04, B-FG10-05, B-FG10-06, B-FG10-07, B-FG10-08, B-FG10-10, B-CLR-01 | — |
| `specs/settle/function-specifications/SETTLE_FUNC.md` | EP-FG07, EP-FG08 | B-FG07-02, B-FG07-03, B-FG07-04, B-FG08-02, B-FG08-03 | — |
| `specs/settle/screen-specification/SC-07-02_SPEC.md` | EP-FG07 | B-FG07-05 (2 sub), B-FG07-06 | — |
| `specs/settle/screen-specification/SC-08-03_SPEC.md` | EP-FG08 | B-FG08-06 (2 sub), B-FG08-07 | — |
| `specs/settle/technical-design/STL_CORRECTION_DECIDE_TECH.md` | EP-FG08 | B-FG08-02, B-FG08-03, B-FG08-04, B-FG08-05, B-FG08-07 | — |
| `specs/settle/technical-design/STL_DAY_CLOSE_TECH.md` | EP-FG07 | B-FG07-02, B-FG07-03, B-FG07-06 | — |
| `specs/settle/technical-design/STL_DEVICE_LOST_TECH.md` | EP-FG07 | B-FG07-04, B-FG07-06 | — |
| `specs/trade/function-specifications/TRADE_FUNC.md` | EP-CLAR, EP-FG04, EP-FG05 | A-FG04-03 (2 sub), A-FG04-04, A-FG04-05 (3 sub), A-FG04-06, A-FG04-07, A-FG04-08 (2 sub), A-FG05-02, A-FG05-03 (3 sub), A-FG05-04, A-CLR-16, A-CLR-18, C-CLR-11 | — |
| `specs/trade/screen-specification/SC-04-01_SPEC.md` | EP-FG04 | A-FG04-09 (3 sub) | — |
| `specs/trade/screen-specification/SC-05-02_SPEC.md` | EP-FG05 | A-FG05-05 (2 sub) | — |
| `specs/trade/technical-design/TRADE_AITAI_CONFIRM_TECH.md` | EP-FG04 | A-FG04-05 (3 sub), A-FG04-10, A-FG04-13.5, A-FG04-13.7, A-FG04-13.8 | — |
| `specs/trade/technical-design/TRADE_QUALIFICATION_CHECK_TECH.md` | EP-FG01, EP-FG04 | A-FG01-12.4, A-FG04-02, A-FG04-03 (2 sub), A-FG04-11 | — |
| `specs/trade/technical-design/TRADE_SAME_DAY_FIX_TECH.md` | EP-FG04 | A-FG04-08 (2 sub), A-FG04-12 | — |
| `specs/trade/technical-design/TRADE_SERI_CONFIRM_TECH.md` | EP-FG05 | A-FG05-03 (3 sub), A-FG05-04, A-FG05-06 | — |
| API Design `delivery/` (API-DEL-001..006, 6 file) | EP-FG06 | A-FG06-03, A-FG06-04 (2 sub), A-FG06-06 (2 sub), A-FG06-07 (2 sub), A-FG06-13.1, A-FG06-13.3 | — |
| API Design `incentive/` (API-INC-001..004, 4 file) | EP-FG09 | B-FG09-10.1, B-FG09-10.3, B-FG09-11, B-FG09-13.1, B-FG09-13.2 | — |
| API Design `lot/` (API-LOT-001..006, 6 file) | EP-FG03, EP-FG04 | A-FG03-03, A-FG03-04, A-FG03-05 (3 sub), A-FG03-06 (2 sub), A-FG03-08.1, A-FG03-08.2, A-FG03-14.1, A-FG04-09.1 | — |
| API Design `party/` (API-PTY-001..007, 7 file) | EP-FG01 | A-FG01-05, A-FG01-06, A-FG01-07.1, A-FG01-07.2, A-FG01-08.1, A-FG01-08.2, A-FG01-08.3, A-FG01-09.1, A-FG01-09.3, A-FG01-12.2, A-FG01-12.5, A-FG01-13 (4 sub) | — |
| API Design `rule/` (API-RULE-001..006, 6 file) | EP-FG10 | B-FG10-02, B-FG10-05, B-FG10-07, B-FG10-08, B-FG10-09.1 | — |
| API Design `settle/` (API-STL-001..005, 5 file) | EP-FG07, EP-FG08 | B-FG07-02, B-FG07-03, B-FG07-04, B-FG07-05.1, B-FG08-02, B-FG08-03, B-FG08-06.1 | — |
| API Design `trade/` (API-TRD-001..008, 8 file) | EP-FG04, EP-FG05 | A-FG04-04, A-FG04-05 (3 sub), A-FG04-06, A-FG04-07, A-FG04-08 (2 sub), A-FG04-09.1, A-FG04-09.3, A-FG04-13.1, A-FG04-13.2, A-FG04-13.4, A-FG04-13.6, A-FG05-02, A-FG05-03 (3 sub), A-FG05-04 | — |
| Database Design `ADJUST_DB.md` | EP-CLAR, EP-FG08 | B-FG08-01, B-FG08-08 (6 sub), B-CLR-15 | — |
| Database Design `BILLING_DB.md` | EP-CLAR, EP-FG09, EP-FG11 | B-FG09-02, B-FG09-04, B-FG09-10.2, B-FG09-19 (8 sub), B-CLR-03, C-FG11-08 | ADR-007 §6 Q-ARCH-12 (税区分 của 完納奨励金 ở IF-ACC-01), BILLING_DB 4.40–4.42, RPT-07, mẫu email FORM-INC-01 — Thuộc FG-11 / FG-12 của luồng C; B chỉ ghi dòng (端数調整, CARRY_EXPIRED, outbox) — PL nối khi gộp →  |
| Database Design `CLOSE_DB.md` | EP-CLAR, EP-FG07, EP-FG10 | B-FG07-01, B-FG10-12 (7 sub), B-CLR-06 | — |
| Database Design `IAM_AUDIT_DB.md` | EP-CLAR, EP-FG02, EP-FG03, EP-FG12, EP-FG13 | A-FG03-13.1, C-FG02-01, C-FG02-02, C-FG02-03, C-FG02-04, C-FG02-06.1, C-FG02-07, C-FG02-08, C-FG02-09, C-FG02-10, C-FG02-11, C-FG02-15 (3 sub), C-FG02-17, C-FG13-01, C-FG13-02, C-FG13-03, C-FG13-09, C-FG12-01, C-CLR-05, A-FG03-17 | — |
| Database Design `INCENTIVE_DB.md` | EP-CLAR, EP-FG09 | B-FG09-01, B-FG09-12, B-FG09-14, B-FG09-15, B-FG09-16, B-FG09-17, B-CLR-02, B-CLR-13, B-CLR-14, C-CLR-14, B-FG09-21 | — |
| Database Design `LOT_DB.md` | EP-FG03 | A-FG03-01, A-FG03-02, A-FG03-12.2, A-FG03-14.2, A-FG03-15 | — |
| Database Design `MKT_DB.md` | EP-CLAR, EP-FG01, EP-FG03, EP-FG04, EP-FG06, EP-FG07, EP-FG11, EP-PLAT | A-FG01-01, A-FG01-04, A-FG03-01, A-FG03-02, A-FG03-14 (3 sub), A-FG03-16, A-FG04-02, A-FG06-01, A-CLR-11, B-FG07-01, B-CLR-03, C-PLAT-05, C-FG11-02 (10 sub), C-CLR-05 | — |
| Database Design `PARTY_DB.md` | EP-FG01 | A-FG01-01, A-FG01-02, A-FG01-03, A-FG01-14 | — |
| Database Design `RULE_DB.md` | EP-CLAR, EP-FG09, EP-FG10 | B-FG09-06, B-FG10-01, B-FG10-13 (6 sub), C-CLR-14 | — |
| Database Design `TRADE_DB.md` | EP-FG04, EP-FG05, EP-FG06 | A-FG04-01, A-FG04-14 (3 sub), A-FG05-01, A-FG05-07.2, A-FG06-01, A-FG06-02 | — |
| `ARCHITECTURE` | EP-CLAR, EP-FG02, EP-FG03, EP-FG11, EP-FG12, EP-FG13, EP-FG14, EP-FG15, EP-PLAT, EP-TEST | B-CLR-03, C-PLAT-01 (4 sub), C-PLAT-02, C-PLAT-03, C-PLAT-04, C-FG02-05, C-FG02-12, C-FG13-04, C-FG12-01, C-FG12-02, C-FG12-03, C-FG12-06, C-FG11-04 (10 sub), C-FG11-05 (3 sub), C-FG11-06, C-FG11-07, C-FG14-01, C-FG14-05, C-FG14-07, C-FG15-01 (4 sub), C-TEST-02, C-TEST-04 (2 sub), C-TEST-05, C-CLR-03, C-CLR-04, C-CLR-08, C-CLR-10, C-CLR-11, C-CLR-14, A-FG03-17 | — |
| `ADR-001` | EP-PLAT | C-PLAT-01 (4 sub), C-PLAT-02, C-PLAT-03, C-PLAT-04 | — |
| `ADR-002` | EP-CLAR, EP-FG02, EP-FG09, EP-FG13, EP-PLAT, EP-TEST | B-FG09-10.3, C-PLAT-04, C-FG02-02, C-FG02-03, C-FG02-04, C-FG02-05, C-FG02-06 (3 sub), C-FG02-07, C-FG02-12, C-FG02-16, C-FG13-04, C-TEST-05, C-CLR-01, C-CLR-02, C-CLR-03, C-CLR-11 | — |
| `ADR-003` | EP-CLAR, EP-FG01, EP-FG02, EP-TEST | A-FG01-02, A-CLR-11, C-FG02-08, C-FG02-09, C-FG02-15 (3 sub), C-FG02-17, C-TEST-03 (2 sub), C-TEST-05, C-CLR-05 | — |
| `ADR-004` | EP-FG08 | B-FG08-04 | — |
| `ADR-005` | EP-CLAR, EP-FG03, EP-FG04, EP-FG07, EP-FG08, EP-FG10 | A-FG03-15, A-FG04-14 (3 sub), A-CLR-02, A-CLR-03, B-FG07-02, B-FG08-05, B-FG10-12 (7 sub), B-CLR-15, B-CLR-18, B-CLR-22 | — |
| `ADR-006` | EP-CLAR, EP-FG10 | A-CLR-12, B-FG10-04, B-FG10-06, B-FG10-11 (9 sub), B-CLR-01 | — |
| `ADR-007` | EP-CLAR, EP-FG08, EP-FG09 | B-FG08-05, B-FG09-04, B-FG09-05, B-FG09-08, B-CLR-02, B-CLR-10, B-CLR-11, B-CLR-12, B-CLR-13, B-CLR-14 | — |
| `ADR-008` | EP-CLAR, EP-FG02, EP-FG03, EP-FG04, EP-FG06 | A-FG03-13 (4 sub), A-FG04-13.5, A-FG04-13.7, A-FG04-13.8, A-FG06-05, A-CLR-01, C-FG02-05, C-CLR-04, C-CLR-11, A-FG03-17 | — |
| `ADR-009` | EP-CLAR, EP-FG11, EP-FG13, EP-FG14, EP-PLAT, EP-TEST | C-PLAT-01 (4 sub), C-FG13-01, C-FG13-03, C-FG13-05 (2 sub), C-FG13-09, C-FG11-01 (5 sub), C-FG14-03, C-FG14-04, C-FG14-05, C-TEST-04 (2 sub), C-TEST-06, C-CLR-08, C-CLR-09 | — |
| `ADR-010` | — | — | Không có việc làm riêng: ADR-010 là ranh giới phạm vi (option tách riêng, người quyết cuối, không OCR / AI) — giữ bằng nhãn rule:human-decision, DoD chung mục 1.2 và việc không đưa option vào backlog 第1期 |
| SCREEN-LIST C2: SC-01-01, SC-01-05, SC-01-06; batch SC-01-B1 (phần cảnh báo) | EP-CLAR, EP-FG01 | A-FG01-12 (6 sub), A-CLR-07 | chưa có Screen Specification / API Design (L4-D08) (luồng A) |
| SCREEN-LIST C2: SC-01-03, SC-01-04 (DEP-15) | EP-CLAR, EP-FG01 | A-FG01-13 (4 sub), A-CLR-06 | API đã có, chưa có Screen Specification (luồng A) |
| SCREEN-LIST C3: SC-03-02 (DEP-07) | EP-CLAR, EP-FG03 | A-FG03-12 (3 sub), A-CLR-04 | chỉ có wireframe (L4-D05), chưa có API Design / Screen Spec (luồng A) |
| SCREEN-LIST C3: SC-03-07 + module sync (DEP-04) | EP-CLAR, EP-FG03 | A-FG03-13 (4 sub), A-CLR-01 | chưa có Technical Design / API Design sync, màn chỉ có wireframe (luồng A) |
| SCREEN-LIST C3: SC-03-03, SC-03-04 (gộp SC-03-06); thao tác 販売公開 / 販売終了 | EP-CLAR, EP-FG03 | A-FG03-14 (3 sub), A-CLR-08 | màn mức List; thao tác đổi trạng thái chưa có spec (A-GAP-01) (luồng A) |
| DEP-05 fn_lot_carry_over | EP-CLAR, EP-FG03 | A-FG03-15, A-CLR-02 | chưa có Function Spec (luồng A) |
| SCREEN-LIST C4: SC-04-02, SC-04-03, SC-04-04, SC-04-05 (gộp SC-04-06), SC-04-07 | EP-CLAR, EP-FG04 | A-FG04-13 (8 sub), A-CLR-09 | chưa có Screen Specification (SC-04-05 có wireframe; SC-04-07 thiếu cả API Design) (luồng A) |
| DEP-06 fn_trade_late_entry, fn_lot_late_entry, fn_delivery_record cờ late | EP-CLAR, EP-FG04 | A-FG04-14 (3 sub), A-CLR-03 | chưa có Function Spec (luồng A) |
| SCREEN-LIST C4: SC-05-01 (DEP-10) | EP-CLAR, EP-FG05 | A-FG05-07 (3 sub), A-CLR-05 | chưa có API Design / Screen Spec (luồng A) |
| SCREEN-LIST C5: SC-06-01, SC-06-06 | EP-CLAR, EP-FG06 | A-FG06-13 (3 sub), A-CLR-10 | màn mức List, chưa có Screen Specification / API in (luồng A) |
| Q-LOT-02 ngưỡng tô vàng chênh SL 仮受付 / 本登録 | — | — | khách để sau (FB-CUS-287); không làm ở 第1期 trừ khi khách mở lại (luồng A) |
| SC-01-07, SC-04-08, SC-06-03, SC-05-03 (SCREEN-LIST §3) | — | — | không tính ở 第1期: 第2期 / bỏ / gộp SC-04-04 (luật 6 với SC-01-07) (luồng A) |
| ADR-008 §6 E-18 (PIN offline), E-21 (scan 受入証憑) | — | — | điểm mở thuộc iam / đính kèm chung — luồng C tạo issue làm rõ (luồng A) |
| SCREEN-LIST C7: SC-09-01, SC-09-02, SC-09-03 (DEP-11) | EP-CLAR, EP-FG09 | B-FG09-19 (8 sub), B-CLR-04, B-CLR-03 | Chưa có Screen Specification / API Design (L4-D08); K2 phân bổ FIFO đã spec nên tách thành issue lá B-FG09-04, phần màn + import để thô (luồng B) |
| SCREEN-LIST C7: SC-09-05, batch SC-09-B1 | EP-CLAR, EP-FG09 | B-FG09-20 (2 sub), B-CLR-05 | Chưa có Screen Specification (L4-D08) (luồng B) |
| SCREEN-LIST C6: SC-07-01, SC-07-03, SC-07-04, batch SC-07-B2 | EP-CLAR, EP-FG07 | B-FG07-07 (7 sub), B-FG07-08 (5 sub), B-CLR-21 | Chưa có Screen Specification / Technical Design 精算 (L4-D08) (luồng B) |
| SCREEN-LIST C6: SC-08-01, SC-08-02 (DEP-09) | EP-CLAR, EP-FG08 | B-FG08-08 (6 sub), B-CLR-16 | Chưa có Screen Specification / API Design POST /corrections (L4-D08) (luồng B) |
| SCREEN-LIST C8: SC-10-01, SC-10-02, SC-10-03 (DEP-08) | EP-CLAR, EP-FG10 | B-FG10-11 (9 sub), B-CLR-17 | Chưa có Screen Specification / API Design phía maker (L4-D08) (luồng B) |
| SCREEN-LIST C8: SC-10-05 + batch SC-07-B1 (DEP-12) | EP-CLAR, EP-FG10 | B-FG10-12 (7 sub), B-CLR-18 | Chưa có Function / Technical Design calendar, Screen Specification SC-10-05 (luồng B) |
| SCREEN-LIST C8: SC-10-07 | EP-CLAR, EP-FG10 | B-FG10-13 (6 sub), B-CLR-19 | Chưa có Screen Specification (L4-D08) (luồng B) |
| DEP-16 file cấu hình có nhật ký (SC-10-06 bị giản lược ⑥) | EP-CLAR, EP-FG10 | B-FG10-14 (2 sub), B-CLR-20 | Chưa có Technical Design cơ chế (luồng B) |
| ADR-006 §3 phương án F / G | EP-CLAR | B-CLR-01 | L4-D06: chỉ là tư liệu workshop E-14, effort ~0,3–0,5 MM ngoài DEC-048 — không đưa vào backlog 第1期 (luồng B) |
| ADR-007 §6 Q-ARCH-12 (税区分 của 完納奨励金 ở IF-ACC-01), BILLING_DB 4.40–4.42, RPT-07, mẫu email FORM-INC-01 | — | — | Thuộc FG-11 / FG-12 của luồng C; B chỉ ghi dòng (端数調整, CARRY_EXPIRED, outbox) — PL nối khi gộp (luồng B) |
| SCREEN-LIST C1: SC-00-01, SC-00-02, SC-00-03 (gồm SC-00-04 gộp vào khung thông báo) | EP-CLAR, EP-FG02 | C-FG02-13 (6 sub), C-FG02-02, C-FG02-04, C-CLR-01 | chưa có Screen Specification (L4-D08); phần BE đã có quy tắc ở ADR-002 nên thành issue dev riêng (luồng C) |
| SCREEN-LIST C1: SC-00-05 エラー・ロック済み案内 | EP-PLAT | C-PLAT-11 | không có Screen Specification riêng; mẫu trạng thái C-24 trong _common-layout.md đủ để làm dev (luồng C) |
| SCREEN-LIST C2 (phần SC-02): SC-02-02, SC-02-03 + tab 代行者 (SC-02-05 gộp); API quản trị tài khoản / vai | EP-CLAR, EP-FG02 | C-FG02-14 (3 sub), C-FG02-15 (3 sub), C-FG02-10, C-CLR-06 | chưa có Screen Specification / API Design (L4-D08); API 代行 là DEP-14 nên làm dev (luồng C) |
| SCREEN-LIST C9: SC-11-01..SC-11-16 (12 báo cáo, IF-ACC-01, 仕訳, データ出力) + batch SC-11-B1; DEP-17 | EP-CLAR, EP-FG11 | C-FG11-01 (5 sub), C-FG11-02 (10 sub), C-FG11-03 (13 sub), C-FG11-04 (10 sub), C-FG11-05 (3 sub), B-CLR-03 | chưa có Screen Specification / spec báo cáo; định dạng IF-ACC-01 chờ E-01 (luồng C) |
| SCREEN-LIST C9: SC-12-02 + batch SC-12-B1; mẫu câu thông báo (DEP-13) | EP-CLAR, EP-FG12 | C-FG12-04 (3 sub), C-FG12-05 (2 sub), C-CLR-13 | chưa có Screen Specification / Technical Design worker + mẫu câu (luồng C) |
| SCREEN-LIST C9: SC-13-01, SC-13-02, SC-13-03; FT-13-03 適用規則版の表示; xóa vật lý chứng từ (B.7) | EP-CLAR, EP-FG13 | C-FG13-05 (2 sub), C-FG13-06 (4 sub), C-FG13-07 (3 sub), C-FG13-08, C-CLR-08 | chưa có Screen Specification / API Design; quy trình xóa sau hạn chờ Q-ARCH-07 (luồng C) |
| SCREEN-LIST C9: SC-14-01 + batch SC-14-B1 (thay FT-14-02), SC-14-B2 | EP-FG14 | C-FG14-06, C-FG14-02, C-FG14-03 | SC-14-01 chưa có Screen Specification; hai batch đã đủ rõ ở ADR-009 / ARCHITECTURE nên làm dev (luồng C) |
| SCREEN-LIST C9: SC-15-02 + batch SC-15-B1; SC-15-01, SC-15-03 (đổi thành script + file, C-07) | EP-CLAR, EP-FG15 | C-FG15-01 (4 sub), C-FG15-02 (4 sub), C-FG15-03 (2 sub), C-FG15-04 (2 sub), C-CLR-14 | chưa có spec migrate nào; nguồn dữ liệu chưa có (E-03) (luồng C) |
| FT-12-03 通知設定 / SC-10-06 運用パラメータ | — | — | không có màn ở 第1期 (PRM-126): file cấu hình có nhật ký — issue thuộc DEP-16 (luồng B theo brief §8), luồng C chỉ trỏ depends_on_spec (luồng C) |
| FT-12-04 アプリ内通知一覧 (SC-00-04) | EP-FG02, EP-FG12 | C-FG12-01, C-FG02-13 (6 sub) | gộp vào khung thông báo trên SC-00-03 (PRM-130) (luồng C) |
| FT-02-03 / SC-02-01 外部参加者ログイン（メールOTP）, SC-01-07 マイページ, ARCHITECTURE §10 (portal, giao dịch từ xa, AI, phân tích) | — | — | 第2期 / Option — tách riêng theo luật 6 (L4-A08, ADR-010); không vào backlog 第1期 (luồng C) |
<!-- END GEN spec-issue -->

## 3. Hạng mục chịu ràng buộc đặc thù của đề — 完納奨励金 (tiền thưởng thanh toán đúng hạn)

Một con số thưởng phụ thuộc ~10 biến độc lập: kỳ tính thưởng của giao dịch, 入金日 trên CSV ngân hàng, 支払期日 theo lịch ngân hàng, thuế theo suất × kỳ, bậc + version quy chế **của kỳ**, judgement 要確認, DELTA cho mọi kỳ đã khóa, CARRY / CARRY_EXPIRED theo năm tài chính, giao dịch 後入力 chuyển kỳ, 修正申請 KANNO / INCENTIVE. Gộp thành một task thì một lỗi ở phân bổ FIFO hay DELTA bị che bởi số tổng đúng tình cờ, và không ai review được từng biến. Vì vậy FG-09 là epic riêng, không gộp vào 照合 (FG-07), 修正申請 (FG-08) hay quy chế (FG-10); mọi issue mang nhãn `constraint:完納奨励金`.

| Ràng buộc (biến / quy tắc) | Issue | Vì sao tách riêng |
|---|---|---|
| Bảng thưởng, kết quả, lần chạy chỉ thêm (append-only) | B-FG09-01 (INCENTIVE_DB), B-FG09-02 (BILLING_DB 4.44–4.50) | Migration riêng có quyền EXECUTE; bảng IF-ACC-01 (4.40–4.42) thuộc FG-11 (C-FG11-08, PREMISE L5-A14) |
| K1 thu thập đầu vào + `input_hash` (kỳ của giao dịch, 後入力 chuyển kỳ) | B-FG09-03 | Sai tập đầu vào → mọi khối sau sai; DoD K1 (a)–(d), gồm TV-13 / TV-15. Sửa DB Design theo L5-S02 |
| K2 phân bổ 入金 FIFO theo 入金日 (chạy ngoài engine) | B-FG09-04; nhánh 請求番号 B-FG09-12 (chặn bởi E-02) | Chạy lúc nhập CSV / hủy / gán tay, song song K1 / K3; nhánh 請求番号 tách để không code trước câu trả lời E-02 (L5-D03) |
| K3 期のお支払額 + 完納 / 要確認 (phí chuyển khoản) | B-FG09-05 | Quy tắc thuế (E-06) và ngưỡng nghi phí (file cấu hình DEP-16) đổi độc lập với các khối khác |
| K4 tra bậc theo version quy chế của kỳ | B-FG09-06 | Phụ thuộc quy chế có version (luật 5); kiểm biên 以上 / 未満 riêng |
| K5 tiền thưởng số nguyên, làm tròn xuống ×110/100 | B-FG09-07 | Lệch 1 yên là khiếu nại (BR-INC-01); hàm thuần, test biên riêng |
| K6 DELTA cho mọi kỳ đã khóa, tách dòng theo nguồn | B-FG09-08 | Luật 4: điều chỉnh thưởng = delta kỳ sau, không sửa kỳ đã khóa |
| K7 CARRY / CARRY_EXPIRED theo năm tài chính | B-FG09-09 | Phần âm mang sang có vòng đời riêng (Q-ARCH-08) |
| K8 試算 / 期ロック một transaction (MFA, người quyết, 端数調整) | B-FG09-10 (.1 試算 · .2 期ロック · .3 API) | Điểm người quyết, khóa kỳ không làm lại được; sửa thứ tự tạo kỳ P+1 theo L5-S03; dòng 端数調整 theo L5-A02, L5-A03 |
| K9 đọc kết quả, cảnh báo (過入金, 前期以前の調整) | B-FG09-11 | Hiển thị cho 照合 / người mua, không tính lại |
| Màn SC-09-04 奨励金計算・期ロック | B-FG09-13 (.1–.3) | Màn có spec đầy đủ; tách theo nhóm item để FE song song với engine |
| Test vector TV-01..15 | B-FG09-14 (TV-01, 05, 06, 10) · B-FG09-15 (TV-11, 12) · B-FG09-16 (TV-02, 03, 04, 07, 13, 14, 15) · B-FG09-17 (TV-08, 09) · B-FG09-18 (kết hợp K8 + E2E) | Mỗi nhóm biến một bộ test; `check-backlog.py` kiểm đủ 15 TV có trong issue test |
| Điểm kiểm tra số cuối S4 (khách yêu cầu bắt buộc) | B-FG09-21 | Kiểm quy tắc bằng bảng tính trước khi code engine (S6–S7); 照合部門長 ký [Customer giả lập, 2026-11-26] |
| Màn chưa spec: 入金CSV取込 · コード対応 · 期別入金状況 · 奨励金明細 · 通知 | B-FG09-19 (8 sub), B-FG09-20 (2 sub) | Thô theo màn (L4-D08), đi cùng B-CLR-04, B-CLR-05 |
| Câu hỏi chặn số thưởng | B-CLR-02 (E-02), B-CLR-03 (E-01), B-CLR-06 (Q-INC-03), B-CLR-07 (Q-INC-01), B-CLR-08 (Q-INC-02), B-CLR-10 (E-06), B-CLR-11 (Q-ARCH-08), B-CLR-12 (OPEN-DB-08), B-CLR-13 (phí chuyển khoản), B-CLR-14 (Q-ARCH-11), C-CLR-14 (E-03 bảng 交付率 thật) | Mỗi câu đổi một biến; tách để thấy câu nào chặn khối nào |

Báo cáo kết quả thưởng theo kỳ (RPT-07, C-FG11-03.1–.3) thuộc FG-11 và chỉ đọc kết quả engine — không mang nhãn ràng buộc.

## 4. Chỗ hở hoặc mâu thuẫn của spec LAB-4 phát hiện khi break

Cột "Xử lý" ghi một trong bốn: sửa thiết kế (trỏ PREMISE) · giả định (trỏ PREMISE) · tạo issue làm rõ (ID) · để mở và vì sao. Sửa thiết kế chỉ là **đề xuất** tới khi Expert Gate A RELEASE; sau đó mới sửa file spec LAB-4 (ghi History).

<!-- BEGIN GEN gaps -->
| # | Spec | Chỗ hở / mâu thuẫn | Xử lý | Nguồn |
|---|---|---|---|---|
| L5-G01 | LOT_FUNC 2.4, 2.9; TRADE_AITAI_CONFIRM_TECH §4.2; specs/_index.md DEP-01..17 | Đổi lô INSPECTED → PUBLISHED (販売公開) và 販売終了 (PRM-110) không có API / Function Spec, cũng không có dòng DEP; API-TRD-002 và fn_lot_lock_for_sale lại bắt lô PUBLISHED → luồng chính 相対 không chạy được với dữ liệu thật | tạo issue làm rõ A-CLR-08 | A-GAP-01 |
| L5-G02 | DEL_RECORD_TECH §5; LOT_INSPECTION_RECORD_TECH §4.3; MKT_DB §4.0 lot_status | Trạng thái lô DELIVERED có trong enum và được kiểm ở 目利き, nhưng không hàm nào ghi: delivery nói 「module lot đọc v_delivery_status」, LOT_FUNC không có hàm tương ứng | sửa thiết kế — PREMISE.md L5-S01 (đề xuất; áp vào spec sau Gate A) | A-GAP-02 |
| L5-G03 | SCREEN-LIST §4 SC-01-B1; PTY_*_LIFECYCLE_TECH §4.5/§4.6; TRADE_QUALIFICATION_CHECK_TECH §5 | Batch SC-01-B1 gồm cảnh báo sắp hết hạn (PRM-045) nhưng TECH party chỉ đặc tả job 失効; TRADE_QUALIFICATION đẩy sang 「module notify」 còn DEP-13 chỉ là worker gửi — không ai sinh cảnh báo | tạo issue làm rõ A-CLR-07 | A-GAP-03 |
| L5-G04 | ADJUST_DB 4.32, 4.39; CLOSE_DB 4.57; TRADE_SAME_DAY_FIX_TECH §4.3; DEL_EXCEPTION_DISPUTE_TECH §4.3 | Hàm của luồng A (当日訂正, ngoại lệ giao, cấp lot_no / trade_no) ghi bảng thuộc cụm settle / close (trade_fixes, trade_adjustments, day_counters); không tài liệu nào nói ai tạo migration | giả định — PREMISE.md L5-A12 | A-GAP-04 |
| L5-G05 | INCENTIVE_DB §4.52 Overview (0.3.2) vs INC_ENGINE_TECH §3.4, K1-4, K6-1 (0.1.1) | INCENTIVE_DB 4.52 còn ghi GD LATE_ENTRY (trades có trade_date thuộc kỳ khóa, created_at > locked_at) là đầu vào DELTA (recheck N-02); TECH 0.1.1 và ADR-007 0.3.2 đã bỏ theo Q-INC-02 (GD 後入力 chuyển sang kỳ đang mở, không DELTA). Dev đọc DB Design sẽ cài sai K1-4. | sửa thiết kế — PREMISE.md L5-S02 (đề xuất; áp vào spec sau Gate A) | B-GAP-01 |
| L5-G06 | INC_ENGINE_TECH §4.8 No 5 vs No 7; K7 Error | K8 ghi dòng CARRY sang P+1 ở No 5 nhưng tới No 7 mới bảo đảm P+1 tồn tại; K7 lại nói 'P+1 do K8 bảo đảm tồn tại trước khi ghi' → thứ tự mâu thuẫn, FK period_id có thể vỡ khi P+1 chưa được tạo (Q-INC-03 chưa chốt). | sửa thiết kế — PREMISE.md L5-S03 (đề xuất; áp vào spec sau Gate A) | B-GAP-02 |
| L5-G07 | INC_ENGINE_TECH §4.8 No 6 (端数調整), FT-09-10 | 'Σ thuế đã xuất theo ngày trong IF-ACC-01 của P' không nói theo trục nào: nếu theo business_date thì điều chỉnh của kỳ đã khóa (period_id = Q, business_date trong P) và GD 後入力 bị tính lệch → dòng 端数調整 sai cỡ cả khoản thuế, không còn là chênh làm tròn. | giả định — PREMISE.md L5-A02 | B-GAP-03 |
| L5-G08 | INC_ENGINE_TECH §4.8 No 6; BILLING_DB 4.41 (batch tạo sau 日次締め, đóng băng) | Dòng 端数調整 'gắn batch của 業務日 đang mở' nhưng batch IF-ACC-01 của ngày đó chỉ được tạo lúc 日次締め và đóng băng khi tạo → lúc 期ロック chưa có batch để gắn. | giả định — PREMISE.md L5-A03 | B-GAP-04 |
| L5-G09 | MKT_DB §4.0 (Ngày mở, enforce_open_business_day); CLOSE_DB 4.24 | Trigger ngày mở phải gắn vào bảng nghiệp vụ của mọi module (lô, GD, giao — luồng A; điều chỉnh, 入金 — luồng B) nhưng spec không nói ai tạo hàm trigger, ai gắn vào bảng nào khi chia 3 luồng. | giả định — PREMISE.md L5-A13 | B-GAP-05 |
| L5-G10 | BILLING_DB §4.40–§4.42 (IF-ACC-01) trong nguồn đọc luồng B; function-list FG-11 FT-11-07 | BILLING_DB thuộc nguồn đọc của B nhưng 3 bảng journal_mappings / accounting_export_* là IF-ACC-01 (FG-11, luồng C). Không rõ ai tạo migration. | giả định — PREMISE.md L5-A14 | B-GAP-06 |
| L5-G11 | ADJUST_DB §4.32 trade_fixes; TRADE_SAME_DAY_FIX_TECH (luồng A); STL_DAY_CLOSE checklist #5, #9 | trade_fixes nằm trong ADJUST_DB (nguồn B) nhưng logic ghi là 当日訂正 của luồng A; checklist 日次締め (B) đọc nó. Chủ sở hữu migration không rõ. | giả định — PREMISE.md L5-A12 | B-GAP-07 |
| L5-G12 | INC_ENGINE_TECH §4.2 (K2 chạy lúc nhập CSV / hủy batch / gán tay); BILLING_DB 4.48 | Phân bổ FIFO vào kỳ OPEN chốt theo B tại lúc nhập; sau đó 修正申請 / 当日訂正 làm B của kỳ đó giảm thì phân bổ thừa không được dời sang kỳ đang thiếu → người mua có thể mất 完納 ở kỳ khác. Spec không có quy tắc phân bổ lại (chỉ có cảnh báo OVERPAYMENT ở K9). | giả định — PREMISE.md L5-A04 | B-GAP-08 |
| L5-G13 | SC-09-04_SPEC §6.2 câu ví dụ; API-INC-001 ví dụ response | Câu ví dụ nút mờ ghi 「支払期日（2027/09/10）」 trong khi [1] ví dụ kỳ 2027-09 hạn 2027/10/08; ví dụ API-INC-001 có lateEntries tradeDate 2027-07-30, trước go-live 2027-08-01 (L4-A09). | để mở — Chỉ là số minh họa, không đổi logic hay issue nào; PL sửa cùng lượt rà bản ja/ sau Gate A. | B-GAP-09 |
| L5-G14 | log-convention §4 (cột 'Nơi chốt') | Ba dòng trỏ tới 'ADR về quan sát hệ thống (P2-A)' nhưng ADR-001..010 không có ADR này; định dạng / timezone / thời gian lưu log ứng dụng chưa chốt | tạo issue làm rõ C-CLR-15 | C-GAP-01 |
| L5-G15 | specs/_index.md (bảng DEP) ↔ STL_DAY_CLOSE_TECH §4 bước 5 | SC-07-02 (màn cốt lõi) xếp hàng job tạo batch IF-ACC-01 nhưng bảng DEP-01..17 không có dòng nào cho batch này; BILLING_DB 4.40–4.42 có bảng, thiếu Technical Design (đóng băng, xuất lại, 端数調整) và định dạng (E-01) | tạo issue làm rõ B-CLR-03 | C-GAP-02 |
| L5-G16 | function-list FG-12 (FT-12-02) / ARCHITECTURE §3 | Thông báo Critical ≤ 5 phút (FR-NOTIFY-02) không có danh sách sự kiện nào trong bộ LAB-4 — chỉ có ví dụ ở function-list | tạo issue làm rõ C-CLR-13 | C-GAP-03 |
| L5-G17 | ADR-002 §2.1-3, IAM_AUDIT_DB 4.6 | 'Đăng nhập thiết bị một lần đầu ca bằng tài khoản có quyền' — không nói vai nào được đăng nhập thiết bị, phiên thiết bị kéo dài bao lâu | giả định — PREMISE.md L5-A06 | C-GAP-04 |
| L5-G18 | ADR-009 §2.2-7 | Tách / bỏ partition audit_logs cũ hơn 7 năm 'theo quy trình có duyệt' nhưng không nêu người duyệt, có MFA không, có purpose MFA không (api-conventions §4 chưa có) | tạo issue làm rõ C-CLR-08 | C-GAP-05 |
| L5-G19 | ADR-003 §2-5, IAM_AUDIT_DB 4.8; SCREEN-LIST §0 cột Vai | Ma trận đọc ở DB theo 'vai × nhóm dữ liệu', còn SCREEN-LIST nói quyền đọc 'ghi ở spec từng màn' — 58 màn chưa spec thì không có quyền đọc mức item | giả định — PREMISE.md L5-A07 | C-GAP-06 |
| L5-G20 | ADR-002 §2.2-8..10 / specs/_index.md DEP-01 | DEP-01 chỉ nêu API xác thực mã; đăng ký / thu hồi phương thức MFA và mã dự phòng (điều kiện để MFA chạy được) không có trong bảng DEP, không có API Design | giả định — PREMISE.md L5-A08 | C-GAP-07 |
| L5-G21 | IAM_AUDIT_DB 4.55 offline_sync_records ↔ specs/_index.md DEP-04 (sync) | Bảng hàng đợi offline nằm trong file DB của luồng C nhưng API / Technical Design sync thuộc DEP-04 của luồng A — dễ hai luồng cùng tạo migration | giả định — PREMISE.md L5-A16 | C-GAP-08 |
| L5-G22 | SCREEN-LIST C1 SC-00-02; C2 SC-01-06 ↔ điều kiện dùng thử S1 (customer-feedback-lab5-priority-261126 câu 2) | Hai điều kiện dùng thử S1 (tra tư cách bằng bàn phím, đổi người bằng PIN) cần màn SC-01-06 và SC-00-02, cả hai chưa có Screen Specification (L4-D08); SC-00-01..03 không có issue làm rõ nào | tạo issue làm rõ C-CLR-16 | PL-GAP-01 |
| L5-G23 | specs/_index.md DEP-01..17; ADR-008 | Khung PWA / offline dùng chung (service worker, hàng đợi IndexedDB) không có chủ: luồng C cho là của sync (luồng A), luồng A chỉ có hàng đợi riêng cho 引渡し | giả định — PREMISE.md L5-A17 | PL-GAP-02 |
<!-- END GEN gaps -->
