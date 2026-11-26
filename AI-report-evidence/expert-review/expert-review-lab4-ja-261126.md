# Expert review — LAB-4 bản tiếng Nhật `ja/` + 2 commit hậu kỳ — 2026-11-26

Phạm vi review: repo `lab-wholesale-market`, nhánh `ver/lab-4`, commit `9367490` (sửa nguồn VI) và `05c8cf8` (135 file `ja/`, README §4.1, AI-report 0.2.2, `scripts/check-markdown-links.py`). Diff đối chiếu `f910c8b..05c8cf8`.

Tiêu chí (người dùng giao): mục tiêu học LAB-4 + RFP + 7 luật CLAUDE.md + spec-standards; riêng JA: (1) luật 2 / L4-D03 với 承認 và 許可; (2) glossary bắt buộc `plans/lab/Lab 4/ja-translation-brief-and-glossary.md`; (3) trung thành với bản VI (mẫu ≥ 8 file, số liệu / công thức / ID / version); (4) 0 link hỏng; (5) sửa nguồn VI ở `9367490` đúng L4-D03, có History, tăng version; (6) README §4.1 và AI-report trung thực.

Không tính là lỗi (đã chốt với người dùng): mật khẩu demo ở `prototype/README.md` (G3-M03, đầu LAB-5); ADR-006 Proposed; E-14 mở; 12 màn có Screen Specification đầy đủ.

**Verdict: CHƯA RELEASE** — 1 Critical · 1 Major · 8 Minor. Lỗi Critical là một lỗi dịch thuật ngữ lặp ở 8 file, sửa bằng script được (khoảng 30 dòng), không phải làm lại cả bản dịch.

## Cách kiểm

- Chạy `python -I scripts/check-markdown-links.py` → `files=290 broken=0`; `... ja` → `files=135 broken=0`.
- Tôi tự viết script so cặp VI↔JA trên cả 135 file. Kết quả: số dòng bằng nhau 135/135; khối code giống hệt từng byte (0 khác biệt); số ký tự `|` mỗi dòng bằng nhau, chỉ lệch 1 dòng (m-06); tập ID (SC/FR/NFR/BR/PRM/DEC/L4/ADR/E/API/TV/FB/Q/SPEC/OPEN/FIG…) trùng khớp, chỉ lệch 1 dòng (M-01); version x.y.z không đổi — 29 dòng khác chỉ do đổi dấu phân cách số từ kiểu VI sang kiểu Nhật (1.000.000 → 1,000,000), không dòng nào làm sai ID hay version.
- Grep `承認` (60 file) và `許可` trong `ja/`, xem ngữ cảnh từng cụm.
- Đọc cặp VI↔JA theo mẫu: README (§4.1, §4.2), PREMISE (L4-D02/D03, §3.2, dòng 20/40/60/77), ADR-007, SC-09-04_SPEC, INC_FUNC, INC_ENGINE_TECH (công thức K-steps, TV), INCENTIVE_DB, MKT_DB (bảng lệch D01–N04), API-LOT-002, API-DEL-001, wireframe SC-01-02 / SC-08-03 / SC-10-04, DEL_RECORD_TECH frontmatter.

## Bảng lỗi

| # | Mức | File:vị trí | ID RFP | Vấn đề | Cách sửa đề xuất |
|---|---|---|---|---|---|
| C-01 | **Critical** | `ja/architecture/adr/ADR-006-…md` (8 chỗ: dòng 23, 30, 85, 90, 91, 104, 129…), `ja/architecture/adr/ADR-007-…md:21, 23, 39`, `ja/architecture/ARCHITECTURE.md:243, 258, 320, 342`, `ja/specs/system-design/database-design/INCENTIVE_DB.md:35, 126, 139`, `ja/wireframes/SC-09-04-…md:70, 101`, `ja/wireframes/SC-10-04-…md:67, 98`, `ja/wireframes/SCREEN-LIST.md:121, 129`, `ja/architecture/adr/ADR-002-…md:59` | BR-INC-01, FR-INC-01, GOV-RULE-01; luật 5 | Bản VI ghi "bảng tỷ lệ" (bảng 交付率 của 完納奨励金). Bản JA dịch thành **「税率表」 (bảng thuế suất)** ở 31 chỗ (28 dòng) / 8 file, trong khi file khác lại dùng 交付率表 (16 chỗ) và 料率表 (8 chỗ). Ở ADR-007:39 công thức lõi đọc thành 「参加者の種類の**税率表**で適格金額税抜を引く」, và ngay câu sau là 「商品の税率（8%）」 — người đọc tiếng Nhật sẽ hiểu bậc thưởng tra theo bảng thuế, và quy chế có version (luật 5) là version thuế suất. Đây là sai nghiệp vụ lõi của 完納奨励金 và quản lý quy chế, trên đúng phần mà khách / 経理部 sẽ đọc kỹ nhất. Nguồn VI không có chữ 税率表 nào | Thêm vào glossary: "bảng tỷ lệ (thưởng)" → **交付率表**. Thay 税率表 → 交付率表 ở 8 file trên; thống nhất 料率表 / 率表 → 交付率表 (trừ chỗ thực sự nói về thuế: `tax_rates`, 軽減税率 8%). Sau đó grep `税率表` trong `ja/` = 0 và đọc lại ADR-007 §2.5, ADR-006 §2.1, INCENTIVE_DB 4.52 |
| M-01 | Major | `ja/architecture/adr/ADR-007-…md:130` (Q-ARCH-12) | BR-INC-01, 13-06, IF-ACC-01 | Bản JA **thêm ý** so với VI: thêm "/ 13-06", 「税区分は仕訳マッピングのとおり**暫定（E-01, E-06 待ち）**」, 「計算式は変えない」, cột người trả lời 「経理部（E-01, E-06）」. VI chỉ ghi: 110/100 cố định theo BR-INC-01; 税区分 theo ánh xạ 仕訳; chỉ đổi `journal_mappings`; 経理部. Câu hỏi khách (E-01) bị gán vào ADR mà VI không có → bản JA (bản sinh) nói khác bản chuẩn — trái README §4.1 | Dịch lại đúng ý VI. Nếu PL thấy E-01 / E-06 đúng là phải có thì sửa ở bản VI (tăng version ADR-007 + dòng History) rồi sinh lại JA |
| m-01 | Minor | `ja/…/INCENTIVE_DB.md:126`, `ja/…/ADR-007-…md:141` | PRM-043, n-01 | VI: 「CARRY_EXPIRED là dòng **dương** đóng số dư (âm)」. JA: 「**正の残高**を閉じる行」 / 「正の残高消込」 — thành ra đóng số dư dương, ngược dấu. Dòng 148 cùng file dịch đúng (「正の値 = 負の残高を閉じる」) | Sửa thành 「残った負の残高を閉じる**正の値の**行」 |
| m-02 | Minor | `ja/specs/incentive/screen-specification/SC-09-04_SPEC.md:142`, `ja/specs/rule/screen-specification/SC-10-04_SPEC.md:127`, `ja/architecture/adr/ADR-003-…md:83`, `ja/specs/system-design/database-design/TRADE_DB.md:312`, `ja/AI-report.md:95` | Luật 2 | Dùng 「許可」 với nghĩa chung "cho phép" (「役割が許可」, 「複数ロールを許可」, 「次のものだけ許可」, 「ローカルコミットは許可」). Không gộp với 承認, nhưng trái tiêu chí "許可 chỉ cho 仲卸" và dễ lẫn khi grep kiểm luật 2 | Thay bằng 「権限あり」/「可」/「認める」/「許容」 |
| m-03 | Minor | `ja/**` (17 chỗ 仮定, vd. `LOT_INSPECTION_RECORD_TECH.md:132`, `PTY_PERMIT_LIFECYCLE_TECH.md:267`, wireframe SC-01-02:129/150, SC-03-02:112); `ja/architecture/ARCHITECTURE.md:316` (乖離表); `ja/AI-report.md:41` (`[Giả lập]`); `ja/…/ADR-007-…md:39` (区分 cho "bậc") | Glossary | Lệch glossary: "giả định" phải là **前提** (dùng 仮定 ở 17 chỗ); "bảng lệch" phải là **差異表** (ARCHITECTURE:316 ghi 乖離表); AI-report:41 nói nhãn câu trả lời ngoài RFP là `[Giả lập]`, trong khi bản JA dùng 【模擬】; "bậc" lúc 区分, lúc 等級 / 段階 | Thay theo glossary; với AI-report:41, ghi 「`[Giả lập]`（日本語版では【模擬】）」. Thêm "bậc → 等級" vào glossary |
| m-04 | Minor | `ja/specs/incentive/technical-design/INC_ENGINE_TECH.md:401` | FR-INC-01 | Mất tên khóa `last_preview.input_hash` (VI: 「Trả cả `last_preview.input_hash`…」); JA chỉ còn 「最後の試算のハッシュも返し」. Đây là khóa trong hợp đồng API, LAB-5 cần giữ nguyên | Giữ inline code `last_preview.input_hash` như ở nguồn (luật khung 2 của brief) |
| m-05 | Minor | `ja/architecture/ARCHITECTURE.md:316`; `ja/specs/incentive/screen-specification/SC-09-04_SPEC.md:48` | — | Lệch nghĩa nhẹ: "trigger … / ngày mở / …" thành 「日のロック」; "入金 chưa ánh xạ" thành 「未対応の入金」 (đúng ra là chưa ánh xạ mã người nộp, 「振込人未マッピングの入金」 như INCENTIVE_DB TV-07) | Dịch lại 2 ô cho sát nguồn |
| m-06 | Minor | `specs/lot/technical-design/LOT_REGISTER_TECH.md:181` và bản `ja/` | — | Bước 3 có `PROVISIONAL\|NULL` không escape trong bảng → GFM tách thành ô thừa ở **cả hai bản** (pipe trong code span vẫn tách ô). Bản JA còn đưa `\|` ra ngoài inline code | Sửa nguồn VI thành `PROVISIONAL \| NULL` có escape (hoặc dùng "/"), tăng version + History, sinh lại JA |
| m-07 | Minor | `ja/specs/party/screen-specification/SC-01-02_SPEC.md:47` | Luật 2 | 「仲卸／**中間卸**向け」 — 中間卸 không phải thuật ngữ của RFP / quy chế (dịch máy từ "bán buôn trung gian"). Ngay đúng đoạn giải thích 許可 ≠ 承認 | Bỏ 「／中間卸」 |
| m-08 | Minor | `README.md:100` (+ `ja/README.md:94–95, 100`); README §5 | — | Ghi chú §4.1 chỉ nói Mermaid / ASCII / PNG còn nhãn VI, nhưng mọi **khối code** đều giữ nguyên VI theo luật khung — vd. cây thư mục §4.1 của `ja/README.md` còn dòng 「ja/ bản tiếng Nhật: …」 bằng tiếng Việt. §5 "Script của bộ thiết kế" chưa có mục cho `check-markdown-links.py` (chỉ có trong ghi chú) | Thêm 「khối code (cây thư mục, SQL, JSON mẫu) giữ nguyên」 vào ghi chú; thêm một mục ngắn ở §5 cho `check-markdown-links.py` |

## Kết quả theo tiêu chí

1. **Luật 2 / L4-D03 (承認):** Đạt. Mọi chỗ 承認 trong `ja/` đều là tư cách 売買参加者, hoặc là trích dẫn có chủ đích (chữ bị cấm 「承認待ち」 / 「承認」 ở SC-01-02:84, SC-08-03:62, SC-09-04:195, SC-10-04:49, RULE_VERSION_TECH:21, API-STL-004; RFP B.7 ở ADR-009:21; tên LAB-1 ở PREMISE L4-D03, wireframe SC-08-03/SC-10-04:18, SCREEN-LIST 112/131), dòng History đổi nhãn, hoặc tiêu đề cột 「承認 / Approve」. Không thấy 承認 dùng cho duyệt nội bộ; duyệt nội bộ là 決裁 / 確認. 許可 không bị gộp với 承認 (xem m-02, m-07 cho phần lệch nhẹ).
2. **Glossary:** Đạt phần lớn — 前提 (161), 未決事項 (74), 【模擬】 (29), 顧客（模擬） (137), 日次締め, 期ロック (219), 差異表 (22), 継承 / 新規作成, 後入力 (151), 完了条件, 主要フロー, メーカー・チェッカー đều đúng. Còn lệch: C-01 (thiếu mục "bảng tỷ lệ" nên dịch sai), m-03.
3. **Trung thành với bản VI:** Khung (số dòng, khối code, số cột, ID, version) đạt gần tuyệt đối. Công thức `floor(E × ρ × 110/1_000_000)`, `× 110/100`, 8%, TV-01..14, 適格金額 / 1,000,000 / 999,999 giữ đúng. Ô bảng dịch bằng bảng ánh xạ ở MKT_DB nhất quán: 欠落 17 / 誤り 7 / 意図的な簡略化 13 (+1 mock M13) / プロトタイプの動作を維持 2, khớp 1-1 với Thiếu / Sai / Giản lược có chủ đích / Giữ hành vi prototype; mức TB → 中. Frontmatter `function:` của DEL_RECORD_TECH chỉ dịch phần ghi chú trong ngoặc, giữ tên hàm; `title` API-LOT-002 「ロット本登録」 đúng. Lỗi nội dung: C-01, M-01, m-01, m-04, m-05.
4. **Link:** 0 link hỏng (290 file toàn repo, 135 file `ja/`).
5. **Sửa nguồn VI ở `9367490`:** Đạt. SC-04-01 0.1.5 và TRADE_AITAI_CONFIRM 0.1.3 (FIG-012 提出 / 確認 / 確定), STL_CORRECTION_DECIDE 0.1.3 (dòng `correction_approvals`), SC-01-02 0.1.3 (發效日 → 発効日), PREMISE 0.6.5 (L4-D02 dùng tên L4-D03, ghi tên LAB-1 ở L4-D03): mỗi file có dòng History, tăng version, đổi `updated`; `specs/_index.md` đồng bộ 4 dòng. Không lệch ý; enum `APPROVE` hiển thị 確認 vẫn khớp A-TRD-02.
6. **README §4.1 / AI-report:** Đạt. README nói rõ VI là bản chuẩn, JA là bản sinh từ `9367490`, không sửa tay; Mermaid / ASCII / PNG giữ nhãn VI; link tài nguyên trỏ về file gốc. AI-report 0.2.2 (§4.2, History có dòng) ghi trung thực: dịch bằng AI (10 luồng), hậu kỳ bằng script, **chưa có người đọc tiếng Nhật rà nội dung nghiệp vụ** — C-01 cho thấy đúng rủi ro này. Còn m-08.

## Điều kiện để release

1. Sửa C-01 (thay 税率表 → 交付率表, thống nhất 料率表 / 率表; grep 税率表 = 0 ngoài chỗ thật sự nói về thuế) và bổ sung glossary.
2. Sửa M-01 (JA khớp VI, hoặc sửa VI trước rồi sinh lại).
3. Chạy lại `check-markdown-links.py ja` = 0 và kiểm khung (số dòng, số `|`, khối code).
4. Minor m-01..m-08 nên sửa cùng lượt (đều nhỏ). m-01, m-04, m-07 nằm ở phần 完納奨励金 / luật 2 nên ưu tiên.

Sửa xong C-01 + M-01 thì tôi chỉ cần kiểm diff, không phải review lại cả bản.

## Điểm làm tốt

- Kỷ luật khung rất chặt: 135/135 file cùng số dòng, khối code giống hệt từng byte, ID và version không lệch. Nhờ vậy kiểm máy đối chiếu được từng dòng.
- Rà 承認 kỹ, và sửa ngược về bản VI (`9367490`) thay vì vá riêng bản JA — đúng nguyên tắc VI là bản chuẩn, có History và version cho từng file.
- Ô bảng phân loại (MKT_DB, README §4.2) dịch bằng bảng ánh xạ nên nhất quán 100%.
- Có thêm `scripts/check-markdown-links.py` tính anchor theo slug kiểu GitHub cho tiêu đề tiếng Nhật, chạy lại được.
- AI-report nói thẳng giới hạn "chưa có người đọc tiếng Nhật rà", không tô vẽ.

---

## Kiểm diff `f1d0aec` (sửa FB-EXP-314..323) — 2026-11-26

Phạm vi: `git diff 05c8cf8..f1d0aec` (37 file: 35 file `ja/` + `README.md`, `specs/_index.md`, `specs/lot/technical-design/LOT_REGISTER_TECH.md`). Tiêu chí: như trên, và soi riêng đợt đổi "bậc" → 等級 theo yêu cầu của PL.

**Verdict: RELEASE CÓ ĐIỀU KIỆN** — 0 Critical · 0 Major. Đóng đủ 10/10 lỗi cũ; có 3 Minor mới.

### Kiểm lại

- `check-markdown-links.py`: toàn repo `files=290 broken=0`; `ja` `files=135 broken=0`.
- Script so cặp VI↔JA: 0 lệch số dòng, 0 lệch khối code, 0 lệch số `|` (đã hết lỗi LOT_REGISTER:181), **0 lệch ID** (đã hết lỗi ADR-007:130). 29 dòng khác version chỉ do định dạng số (như lần trước).
- Grep trong `ja/`: 税率表 0 · 料率表 0 · 仮定 0 · 乖離表 0 · 中間卸 0. Còn 4 chỗ `Giả lập`, đều có chủ đích: AI-report:41 (đã thêm 「日本語版では【模擬】」), khối Mermaid ở ARCHITECTURE và ASCII ở wireframe SC-10-04.
- 承認: diff không thêm chữ 承認 mới nào; các dòng có chữ này bị đổi chỉ vì sửa chữ khác (仮定→前提, bỏ 中間卸). Đạt.
- 許可: 10 chỗ dùng nghĩa chung đã đổi thành 可 / 認める / 権限あり / 許容. Grep lại các mẫu 「役割が許可 / ロールを許可 / だけ許可 / 許可する / 許可され」 = 0. Các chữ 許可 còn lại đều là tư cách 仲卸. Đạt.

### Đối chiếu từng lỗi cũ

| Lỗi | Kết quả | Bằng chứng |
|---|---|---|
| C-01 税率表 | **Closed** | 0 chỗ 税率表 / 料率表; ADR-007:39 đọc 「…の交付率表で、適格金額 税抜を引く」; RULE_DB title, 4.21, 4.22; ADR-006; ARCHITECTURE:243/320/342; wireframe SC-09-04, SC-10-04 đều là 交付率表. Câu nói về thuế thật (`tax_rates`, 「商品の税率（8%）」, 「税率ごとの税額」) giữ nguyên |
| M-01 ADR-007:130 | **Closed** | JA chỉ còn: 税区分 / 110/100 cố định theo BR-INC-01 / theo 仕訳マッピング / 「`journal_mappings` のみ変更」 / 経理部 — khớp VI, đã bỏ 13-06, E-01, 暫定, 計算式は変えない |
| m-01 CARRY_EXPIRED | Closed | INCENTIVE_DB:126 「残高を閉じる**正の値の行**（+ 残った負の部分）」; ADR-007:141 「残高を閉じる正の値の行」 |
| m-02 許可 nghĩa chung | Closed | xem trên |
| m-03 glossary | Closed | 仮定 0, 乖離表 0; "bậc" → 等級 (xem mục dưới) |
| m-04 `last_preview.input_hash` | Closed | INC_ENGINE_TECH:401 có lại inline code |
| m-05 lệch nghĩa | Closed | ARCHITECTURE:316 「開いている日」; SC-09-04:48 「振込人未マッピングの入金」 |
| m-06 pipe | Closed ở dòng 181 — **nhưng sinh lỗi mới n-02** | VI 0.1.3, History, `specs/_index.md` đồng bộ |
| m-07 中間卸 | Closed | SC-01-02:47 「仲卸向け」; PL bỏ thêm ở ARCHITECTURE:24 |
| m-08 README | Closed — **nhưng sinh lỗi mới n-03** | §4.1 nêu khối code; §5 thêm mục 「Script kiểm link Markdown」 (VI + JA) |

### Soi riêng đổi 段階 / 区分 → 等級

Tôi đã đọc ADR-007 §2.5 (dòng 21, 39, 81), RULE_DB 4.22 (dòng 49, 251–267), INC_ENGINE_TECH K4 (§4.4, dòng 108, 130, 150, 246–267), INCENTIVE_DB §5 và wireframe SC-10-04:112. Tất cả chỗ đổi đều là **bậc thưởng** của bảng 交付率 (`tier_no` 1..5, `rate_tier_for`, 「等級3の下限」, 「5等級」). **Không có cấp duyệt nào bị đổi thành 等級**: grep 等級 đi cùng 決裁 / 閾値 / 確認 / MFA / 申請 không ra trường hợp nào là cấp duyệt; 「2 段階の閾値」 ở wireframe SC-10-04:67, 「2段階で決裁」 ở INCENTIVE_DB TV-07/TV-14, 「一段階」 ở PARTY vẫn là 段階. 「区分」 còn lại đúng nghĩa loại người tham gia (「参加者区分」, 「交付率表の区分」 = `NAKAOROSHI` / `BAIBAI`). Nghĩa đúng.

Có một điểm vướng (n-01): 等級 vốn đã được dùng cho **hạng chất lượng 目利き** (VI "hạng"): LOT_INSPECTION_RECORD_TECH §4.2 「等級と2人目の確認者の検査」, LOT_FUNC:289, SC-03-05, wireframe SC-03-05:68. Bản VI tách hai từ ("bậc" ≠ "hạng"), còn bản JA giờ dùng chung một chữ 等級. Hai thứ này đi theo hai luật khác nhau — hạng chất lượng do người quyết (luật 3), bậc thưởng do máy tra bảng. Gợi ý "bậc → 等級" ở m-03 của tôi đã không lường trước chỗ trùng này.

### Lỗi mới

| # | Mức | File:vị trí | ID RFP | Vấn đề | Cách sửa đề xuất |
|---|---|---|---|---|---|
| n-01 | Minor | `ja/` ADR-006/007, ARCHITECTURE, RULE_DB, INC_ENGINE_TECH, INCENTIVE_DB, MKT_DB, PREMISE, wireframe SC-09-04 / SC-10-04 (bậc thưởng) và LOT_INSPECTION_RECORD_TECH, LOT_FUNC, SC-03-05 (hạng 目利き) | BR-INC-01; luật 3 | Cùng chữ 等級 cho hai khái niệm VI tách riêng: bậc 交付率 (máy tra) và hạng chất lượng 目利き (người quyết) | Đổi bậc thưởng thành 「交付率の等級」 ở lần đầu mỗi file + ghi chú trong glossary, hoặc dùng 「ランク」 cho bậc thưởng. Giữ 等級 cho 目利き. Đặt quy tắc vào glossary để lần sinh sau không lặp |
| n-02 | Minor | `specs/lot/technical-design/LOT_REGISTER_TECH.md:30` và `ja/…:30` (dòng History 0.1.3) | — | Chính dòng History ghi việc sửa m-06 lại có dấu gạch đứng trong inline code mà không escape → hàng có 9 ô trong khi bảng có 8 cột; GFM cắt ô thừa, mô tả bị tách sang cột ngày, ngày và người sửa lệch cột. Cùng loại lỗi vừa sửa | Viết 「escape dấu gạch đứng」 thay cho ký tự, hoặc escape bằng `\|`; sửa cả JA |
| n-03 | Minor | `README.md:100` và `ja/README.md:100` | — | Ghi chú tự mâu thuẫn: câu mới 「mỗi lần sửa bản tiếng Việt sau đó thì sửa đúng các dòng tương ứng ở `ja/` trong cùng commit」 nhưng câu sau vẫn 「sửa ở bản tiếng Việt rồi sinh lại, không sửa tay `ja/`」. Thực tế `f1d0aec` sửa tay `ja/` ở những dòng VI không đổi (C-01, M-01…) | Chọn một quy tắc và viết đúng như đang làm, vd: 「VI là bản chuẩn; sửa VI thì sửa dòng tương ứng ở `ja/` trong cùng commit; lỗi chỉ có ở bản dịch thì sửa `ja/` trực tiếp, không đổi version VI」 |

### Điều kiện để release

Sửa n-02 và n-03 (vài phút). n-01 nên sửa cùng lượt; nếu chưa kịp thì ghi vào glossary và vào AI-report §4.2 như một giới hạn đã biết. Không cần review lại; tôi chỉ cần kiểm diff nếu người dùng muốn.

### Điểm làm tốt

- Đổi 等級 bằng script nhưng chỉ trên dòng mà bản VI có "bậc", nên không đụng tới 2段階 của cấp duyệt — đúng chỗ dễ sai nhất.
- C-01 sửa triệt để (51 chỗ), giữ nguyên các câu nói về thuế thật.
- m-06 sửa ở VI trước rồi mới tới JA, có version, History và `_index`.
