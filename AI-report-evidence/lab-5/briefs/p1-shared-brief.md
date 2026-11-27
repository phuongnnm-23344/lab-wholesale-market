# LAB-5 P1 — Brief chung cho 3 luồng break backlog (A / B / C)

Ngày: 2026-11-26 · Người viết: PL · Plan: `plan-lab5.md` (§0 quyết định, §2 phase P1, §3 epic).
Repo: `<user-home>\Desktop\Project lab\lab-wholesale-market`, nhánh **`ver/lab-5`** (bộ thiết kế LAB-4 không đổi; README / PREMISE / AI-report LAB-4 nay ở `lab-4/`).

## 0. Việc của mỗi luồng

Đọc thiết kế LAB-4 trong phạm vi luồng (§8) → viết **đúng một file** `backlog/{a|b|c}-backlog.yaml` theo §2. Không viết Markdown nộp bài (task-breakdown / PREMISE do PL gộp), không tạo issue GitHub, không sửa spec, không commit.
Trả về cho điều phối: đường dẫn file, số epic / issue / sub-issue, tổng giờ sơ bộ, danh sách chỗ hở nặng nhất (≤ 5 dòng), Status.

Luật phải giữ (CLAUDE.md): 相対 là luồng chính; 許可 (仲卸) ≠ 承認 (売買参加者); người quyết cuối ở 目利き / chốt せり / duyệt sửa nhạy cảm / giao có tranh chấp, không OCR/AI; không ghi đè lịch sử (REVERSE/DELTA, ngày khóa không sửa, thưởng điều chỉnh = delta kỳ sau); quy chế có version + ngày hiệu lực + maker-checker + rollback, ≤ 4 lần/năm; option tách riêng (không đưa option vào backlog 第1期); chưa chốt → câu hỏi / giả định.
**Không mở rộng spec (L4-D08):** chỗ chưa có Screen Specification / API Design thì tạo issue thô `kind: rough` + issue làm rõ, không tự thiết kế thay.
Không chép nguyên văn RFP vào tiêu đề / mô tả: viết bằng lời mình, dẫn ID (FR-, BR-, NFR-, SCOPE-, ACC-…).

## 1. Epic và ID — không đụng nhau giữa 3 luồng

| Epic ID | Tên (tiêu đề epic) | Luồng sở hữu |
|---|---|---|
| `EP-FG01` | [FG-01] 参加者・資格管理 — người tham gia, 許可 / 承認 | A |
| `EP-FG03` | [FG-03] ロット受付・評価記録 — tiếp nhận lô, 目利き (gồm offline / sync SC-03-07) | A |
| `EP-FG04` | [FG-04] 相対取引 — giao dịch thỏa thuận (luồng chính) | A |
| `EP-FG05` | [FG-05] せり結果記録 — ghi kết quả せり (luồng phụ) | A |
| `EP-FG06` | [FG-06] 引渡し管理 — giao hàng, ngoại lệ, tranh chấp | A |
| `EP-FG07` | [FG-07] 照合・日次締め — đối soát, khóa ngày, tranh chấp / SLA | B |
| `EP-FG08` | [FG-08] 修正申請・決裁 — điều chỉnh sau chốt (REVERSE / DELTA) | B |
| `EP-FG09` | [FG-09] 完納奨励金 — tiền thưởng thanh toán đúng hạn | B |
| `EP-FG10` | [FG-10] 規則版・交付率・マスタ・カレンダー — quy chế có version, master, lịch | B |
| `EP-FG02` | [FG-02] アカウント・認証・権限 — tài khoản, MFA, 代行, PIN | C |
| `EP-FG11` | [FG-11] 帳票・データ出力 — 12 báo cáo, CSV kế toán | C |
| `EP-FG12` | [FG-12] 通知 — thông báo in-app + email | C |
| `EP-FG13` | [FG-13] 監査・セキュリティ — 監査ログ, bảo mật, lưu 7 năm | C |
| `EP-FG14` | [FG-14] 運用監視・可用性 — giám sát, backup RTO/RPO | C |
| `EP-FG15` | [FG-15] データ移行 — chuyển đổi dữ liệu | C |
| `EP-PLAT` | [PLAT] 基盤 — nền tảng AWS, CI/CD, khung app, quy ước chung | C |
| `EP-TEST` | [TEST] 総合テスト・UAT・リリース | C |
| `EP-CLAR` | [CLAR] 要確認 — các điểm cần làm rõ với khách / nội bộ | C (khung epic); A, B thêm issue con của mình |

- Epic chỉ khai báo trong file của luồng sở hữu. Luồng khác **không** khai báo lại epic, chỉ trỏ `epic:` tới ID.
- ID issue: `{A|B|C}-{FG01..FG15|PLAT|TEST|CLR}-{nn}` (vd. `A-FG04-07`, `B-CLR-03`). Sub-issue: thêm `.{n}` (vd. `B-FG09-04.2`). Số 2 chữ số, liên tục trong luồng, không tái dùng.
- ID dòng chỗ hở / PREMISE: `{A|B|C}-GAP-nn`, `{A|B|C}-PS-nn` (spec thêm/bỏ/sửa), `{A|B|C}-PA-nn` (giả định), `{A|B|C}-PD-nn` (hướng chốt). PL đánh số lại khi gộp (L5-…).
- Phụ thuộc sang luồng khác: không đoán ID của luồng kia — ghi `depends_on_spec:` bằng mã spec / mục (vd. `RULE_VERSION_TECH §4.3`, `STL_DAY_CLOSE_TECH`), PL nối khi gộp.

## 2. Định dạng `backlog/{a|b|c}-backlog.yaml`

```yaml
stream: B
epics:                       # chỉ epic luồng này sở hữu
  - id: EP-FG09
    title: "[FG-09] 完納奨励金 — tiền thưởng thanh toán đúng hạn"
    labels: [epic, "fg:FG-09", "feature:incentive", "constraint:完納奨励金"]
    rfp_refs: [FR-INC-01, FR-INC-03, SCOPE-05]
    summary: "1–3 câu: phạm vi epic, spec LAB-4 nguồn"
issues:
  - id: B-FG09-03
    epic: EP-FG09
    parent: null             # null = issue cấp 1 dưới epic; hoặc ID issue cha (khi là sub-issue)
    kind: dev                # dev | test | rough | clarify
    title: "[FG-09] 完納判定 — K3 期のお支払額 và xét 完納 / 要確認"
    role: BE                 # BE | FE | QA | INFRA | BrSE
    assignee: BE-4           # người phụ trách giả định, lấy trong pool của luồng (§3)
    labels: ["fg:FG-09", "feature:incentive", "kind:dev", "role:BE", "constraint:完納奨励金", "rule:no-overwrite"]
    spec_refs: ["specs/incentive/technical-design/INC_ENGINE_TECH.md §4.3", "INCENTIVE_DB §5 TV-02..04"]
    rfp_refs: [FR-INC-01, BR-INC-…]
    depends_on: [B-FG09-01]          # ID trong cùng luồng
    depends_on_spec: []              # phụ thuộc sang luồng khác (mã spec / mục)
    hours_hint: 12           # giờ sơ bộ, CHỈ để kiểm độ hạt (§4); không phải estimate — SWP/giờ chốt ở P3
    description: |
      2–6 dòng: làm gì, đầu vào / đầu ra, phạm vi không gồm gì.
    dod:
      - "Điều kiện kiểm được, lấy từ DoD / test vector của spec (vd. DoD K3 (a)…(c))"
gaps:                        # chỗ hở / mâu thuẫn spec LAB-4 phát hiện khi break → task-breakdown ④
  - id: B-GAP-01
    spec: "INC_ENGINE_TECH §3.4"
    problem: "mô tả ngắn chỗ hở / mâu thuẫn"
    handling: clarify        # fix-design | assumption | clarify | open
    ref: B-CLR-02            # fix-design → B-PS-nn; assumption → B-PA-nn; clarify → ID issue làm rõ; open → để trống
    open_reason: ""          # bắt buộc khi handling = open
not_issued:                  # "Phần spec chưa thành issue và vì sao" → task-breakdown ②
  - spec: "SCREEN-LIST C7: SC-09-01, SC-09-02, SC-09-03"
    reason: "chưa có Screen Specification (L4-D08)"
    covered_by: [B-FG09-12, B-CLR-04]   # issue thô + issue làm rõ
premise:                     # dòng PREMISE.md LAB-5 luồng này đề xuất (PL gộp)
  spec_changes:              # PREMISE ① — chỉ khi THỰC SỰ phải sửa thiết kế để break được
    - {id: B-PS-01, spec: "…", change: Sửa, before_after: "… → …", why: "nguồn cụ thể: chỗ hở khi break / review LAB-4 / ràng buộc RFP", issues: [B-FG09-03]}
  assumptions:               # PREMISE ② — chỉ lấp chỗ spec/RFP để ngỏ, không ghi đè RFP
    - {id: B-PA-01, assumption: "…", open_point: "spec/RFP để ngỏ ở đâu", impact: "issue / giờ bị ảnh hưởng"}
  decisions:                 # PREMISE ③ — chỗ LAB-4 còn nhiều phương án / đổi phương án
    - {id: B-PD-01, problem: "…", options_lab4: "…", chosen: "…", why: "…"}
```

Yêu cầu file: YAML hợp lệ (UTF-8, chuỗi có `:` / `#` / `[` thì đặt trong ngoặc kép); mọi `epic`, `parent`, `depends_on`, `ref`, `covered_by` trỏ tới ID có thật; mỗi luồng tự kiểm bằng `python -c "import yaml,sys; yaml.safe_load(open(sys.argv[1],encoding='utf-8'))" backlog/x-backlog.yaml` (python: `<user-home>\.claude\skills\.venv\Scripts\python.exe`).

## 3. Người phụ trách giả định (pool theo luồng)

| Luồng | BE | FE | QA | Khác |
|---|---|---|---|---|
| A | BE-1, BE-2, BE-3 | FE-1, FE-2 | QA-1 | — |
| B | BE-4, BE-5 | FE-3 | QA-2 | — |
| C | BE-6 | FE-4 | QA-3 | INFRA-1, BrSE-1 (issue `clarify` của cả 3 luồng gán BrSE-1) |

Không gán tài khoản GitHub thật. Cân tải theo sprint làm ở P4, không cần cân ở P1.

## 4. Độ hạt và định nghĩa xong (DoD)

| Quy tắc | Nội dung |
|---|---|
| Đơn vị issue | Một đầu ra kiểm được riêng: 1 khối xử lý trong Technical Design (bước / khối có DoD), 1–2 API cùng tài nguyên, 1 màn FE (hoặc 1 nhóm trạng thái của màn lớn), 1 bộ test theo nhóm test vector, 1 migration nhóm bảng |
| Cỡ | `hours_hint` **4–16 giờ** cho issue lá. > 16 giờ → tách sub-issue (BE / FE / test, hoặc theo bước). < 2 giờ → gộp vào issue gần nhất |
| Khi nào dùng sub-issue | Issue cấp 1 là "một chức năng" (vd. một màn hoàn chỉnh) mà cần ≥ 2 người / vai cùng làm → issue cấp 1 làm cha, sub-issue là phần việc. Chỉ **lá** được chấm SWP; cha = tổng con. Tối đa 2 cấp dưới epic |
| `rough` | Một issue / nhóm màn hoặc chức năng chưa spec trong cùng FG (Q5), `hours_hint` theo số màn × mức LAB-1, nhãn `needs-spec`; DoD = "có Screen Specification / API Design rồi tách lại" |
| `clarify` | Một câu hỏi / một điểm mở (DEP-xx, OPEN-L4-01, Q-…, §6 Điểm mở ADR). Epic `EP-CLAR`, tiêu đề tiền tố `[要確認]`, gán BrSE-1, `hours_hint` 1–4, DoD = "có câu trả lời ghi vào spec / PREMISE; issue phụ thuộc được mở khóa" |
| Test | Mỗi FG có ít nhất 1 issue `kind: test` (kịch bản + dữ liệu test theo spec); test vector có sẵn trong spec (TV-…, ví dụ số) phải được dẫn tên |
| DoD chung (ghi một lần ở task-breakdown ①, issue chỉ ghi DoD riêng) | Code + unit test qua; đúng API Design (status, mã lỗi `error-codes.md`); ghi 監査ログ theo `log-convention.md`; phân quyền theo vai đúng §4.4/§6.2 của SPEC; review PR; QA chạy case liên quan; luật CLAUDE.md liên quan được kiểm (nhãn `rule:*`) |

## 5. Tiêu đề và nhãn

- Tiêu đề: `[FG-xx] {thuật ngữ JP} — {mô tả tiếng Việt}`, ≤ 80 ký tự, động từ / danh từ rõ việc. Ví dụ: `[FG-04] 相対取引確定 — API chốt giao dịch + trừ số lượng lô`; `[要確認] E-14 — rollback quy chế hồi tố về đầu kỳ chưa khóa?`; `[FG-09][概算] 入金CSV取込 — SC-09-01..03 (chưa spec)`.
- Thuật ngữ JP đúng glossary `plans/lab/Lab 4/ja-translation-brief-and-glossary.md`: duyệt nội bộ = 決裁 / 確認, **承認 chỉ cho 売買参加者**, 許可 chỉ cho 仲卸.
- Nhãn: `fg:FG-xx`, `feature:{party|lot|trade|delivery|settle|incentive|rule|iam|report|notify|audit|ops|migrate|platform|test}`, `kind:{dev|test|rough|clarify}`, `role:{BE|FE|QA|INFRA|BrSE}`, `needs-spec` (rough), ràng buộc: `constraint:完納奨励金` (chỉ FG-09), `rule:aitai-main` (luật 1), `rule:permit-vs-approval` (luật 2), `rule:human-decision` (luật 3), `rule:no-overwrite` (luật 4), `rule:versioned-rule` (luật 5). Không tạo nhãn khác.

## 6. Ghi chỗ hở của spec LAB-4 và dòng PREMISE

1. Gặp chỗ hở / mâu thuẫn khi break → một dòng `gaps` với `handling` đúng 1 trong 4: `fix-design` (phải sửa thiết kế mới break được → kèm dòng `premise.spec_changes`), `assumption` (lấp chỗ để ngỏ → `premise.assumptions`, không ghi đè RFP), `clarify` (→ issue `clarify`), `open` (ghi `open_reason`).
2. **Không sửa file spec** — chỉ đề xuất trong yaml; PL quyết sau Gate A.
3. "Vì sao" phải nêu nguồn cụ thể (file + mục, review LAB-4 G?-…, ID RFP). Lý do chung chung không được tính.
4. Điểm đã có trong `specs/_index.md` DEP-01..17, ADR §6 Điểm mở, SPEC §6.x câu hỏi mở: không lặp thành gap mới — tạo issue `clarify` hoặc `rough` trỏ tới mã đó.
5. Câu trả lời của Customer giả lập (nhãn [Giả lập] trong spec) là giả định có căn cứ, không phải đã chốt.

## 7. Ràng buộc đặc thù — 完納奨励金 (chỉ luồng B, bắt buộc)

- Tách issue riêng, **không** gộp vào settle / rule: mỗi khối **K1–K9** của `INC_ENGINE_TECH.md` §4 là ≥ 1 issue riêng (K2 phân bổ 入金 chạy ngoài engine, song song K1/K3; K6 DELTA phụ thuộc K1–K5; K8 期ロック phụ thuộc tất cả; K9 báo cáo / so 試算). DoD lấy nguyên DoD từng khối.
- Test: TV-01..15 (`INCENTIVE_DB.md` §5) thành 2–4 issue `kind: test` theo nhóm (vd. 完納 / phân bổ · bậc + làm tròn · DELTA / CARRY / 後入力), dẫn rõ TV nào ở issue nào; mọi TV phải có chỗ.
- Màn **SC-09-04** 奨励金計算・期ロック: FE (sub-issue theo trạng thái nếu > 16 giờ) + API-INC-001..004.
- DB / migration nhóm bảng `INCENTIVE_DB` riêng; phần đọc 交付率表 phụ thuộc rule (`depends_on_spec: RULE_VERSION_TECH`), khóa kỳ phụ thuộc 日次締め (`STL_DAY_CLOSE_TECH`).
- Màn chưa spec SC-09-01..03, SC-09-05 → `rough` + `clarify` (DEP-11).
- Mọi issue FG-09 (kể cả test, rough, sub-issue) mang nhãn `constraint:完納奨励金`; issue `clarify` về 完納奨励金 nằm ở `EP-CLAR` nhưng vẫn mang nhãn này. Thêm `rule:no-overwrite` khi chạm DELTA / CARRY / 期ロック, `rule:versioned-rule` khi chạm version quy chế, `rule:human-decision` khi chạm 要確認 judgement.
- Ghi vào yaml một khối `constraint_note:` (3–6 dòng): vì sao tách riêng (nhiều biến: kỳ, 入金日, 支払期日, bậc, version, DELTA, CARRY, 後入力) — PL dùng cho task-breakdown ③.

## 8. Nguồn đọc theo luồng (đường dẫn trong repo)

Chung cho cả 3: `specs/_index.md` (feature, tài liệu, DEP-01..17) · `specs/_common/{api-conventions,api-list,error-codes,log-convention}.md` · `wireframes/SCREEN-LIST.md` (70 màn, cụm C1–C9, §4 batch) · `specs/system-design/database-design/MKT_DB.md` · `lab-4/PREMISE.md` (L4-D01..D09, §6 điểm mở) · ngoài repo: `project/02_requirements/function-list.md` (FG, số chức năng / FG), `project/06_estimate/wbs-schedule-ja.md` §3 (thứ tự sprint).

| Luồng | Đọc thêm |
|---|---|
| **A** | `specs/party/**`, `specs/lot/**`, `specs/trade/**`, `specs/delivery/**` (SPEC SC-01-02, SC-03-01, SC-03-05, SC-04-01, SC-05-02, SC-06-02/04/05; FUNC + TECH); `api-design/{party,lot,trade,delivery}/`; DB `PARTY_DB`, `LOT_DB`, `TRADE_DB`; ADR-003, ADR-004, ADR-007 nếu được dẫn; wireframe tương ứng; SCREEN-LIST C2 (phần SC-01), C3, C4, C5. DEP: 04, 05, 06, 07, 10, 15 |
| **B** | `specs/settle/**`, `specs/incentive/**` (**INC_ENGINE_TECH §3–§4**, INC_FUNC, SC-09-04), `specs/rule/**`; `api-design/{settle,incentive,rule}/`; DB `CLOSE_DB`, `ADJUST_DB`, `BILLING_DB`, `INCENTIVE_DB` (§5 TV-01..15), `RULE_DB`; ADR-005, ADR-006 (Proposed, nhánh E-14 → clarify); SCREEN-LIST C6, C7, C8. DEP: 08, 09, 11, 12, 16; OPEN-L4-01 |
| **C** | `architecture/ARCHITECTURE.md`, `architecture/adr/ADR-001..010` (§6 Điểm mở); DB `IAM_AUDIT_DB`; SCREEN-LIST C1, C2 (phần SC-02), C9 + §4 batch; `project/02_requirements/function-list.md` FG-02, FG-11..15; NFR / ACC- / MIG- lấy từ RFP digest `project/00_input/rfp-digest-vi.md` và `architecture/ARCHITECTURE.md` (mục NFR). DEP: 01, 02, 03, 13, 14, 17. Khung `EP-PLAT` theo S0 của `wbs-schedule-ja.md`; `EP-TEST` theo ACC- / kế hoạch UAT |

## 9. Ước lượng số lượng (để tự kiểm, không phải chỉ tiêu)

A ≈ 45–60 issue · B ≈ 40–55 (FG-09 ≥ 13) · C ≈ 35–50 (gồm khung EP-CLAR) — tổng ~120–150 issue + ~70–100 sub-issue. Lệch xa → ghi lý do trong báo cáo trả về.
