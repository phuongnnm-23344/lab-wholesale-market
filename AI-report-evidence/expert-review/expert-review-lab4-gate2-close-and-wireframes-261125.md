# Expert review — LAB-4 đóng Gate 2 + wireframe HTML — 2026-11-25

Phạm vi review (theo chỉ định của người dùng): repo `lab-wholesale-market`, nhánh `ver/lab-4`.
- **Phần 1 — Đóng Gate 2:** `git diff 20bea92..HEAD`, gồm các commit 378c713, fc24f55, b1b9113, f83c791, ab9569a, 21b707c, 671c17e (fabc771 là pilot HTML, xét ở Phần 2). Đối chiếu với báo cáo gốc `expert-review-lab4-gate2-261125.md` và 31 câu trả lời khách ở `customer-feedback-lab4-p3-questions-261125.md`.
- **Phần 2 — Wireframe HTML:** phần **chưa commit** trong working tree (HEAD fabc771): `wireframes/html/*.html` (15 màn), `_shared/`, `wireframes/pdf/wireframes-all.pdf`, `wireframes/png/`, 12 `specs/*/screen-specification/assets/*_annotated.png`, `scripts/render-wireframes.py`, WF MD và SPEC đã đồng bộ; ghi chú gộp `plans/lab/Lab 4/wireframe-html-consolidation-notes.md`. Mẫu phong cách: `Downloads/wireframes-all.pdf` (đề khác, chỉ so phong cách).

Tiêu chí: mục tiêu học tập LAB-4, RFP, 7 luật CLAUDE.md, spec-standards 03-specs (BM-2-901-51..54).

Kiểm bằng máy (script tạm trong scratchpad, không ghi vào repo): grep lại từng finding cũ; tính lại TV-13 / TV-15 và các số thuế 8%; tính lại số ngày 失効まで; quét badge ở **cả 15 HTML** so với cột ID §4.1 của 12 SPEC, dòng "Badge không có trên ảnh này" và bảng Item của WF MD; chạy `scripts/render-wireframes.py --list` và `scripts/check-api-spec-consistency.py` (42 API, 0 finding); render trang PDF mẫu và PDF của PL bằng PyMuPDF để so phong cách.

| Phần | Verdict |
|---|---|
| Phần 1 — Đóng Gate 2 | **RELEASE** |
| Phần 2 — Wireframe HTML | **RELEASE CÓ ĐIỀU KIỆN** |

---

## Phần 1 — Đóng Gate 2

### 1.1 Finding cũ

| # | Mức cũ | Trạng thái | Bằng chứng | Ghi chú |
|---|---|---|---|---|
| G2-M01 | Major | **Closed** | `specs/_common/api-conventions.md:103,105,107` (token một lần cho checker `CHANGE`/`ROLLBACK` và hủy `APPROVED`; thêm `purpose` `RULE_CHANGE_CONFIRM`, `RULE_CANCEL_DECIDE`); `API-RULE-002_API.md:37,48`; `API-RULE-005_API.md:39,50` (MFA theo trạng thái bản bị hủy); `RULE_VERSION_TECH.md:293`, test RV-18 `:324`; `decision.md` DEC-053 có dòng cập nhật; PREMISE 0.6.2 ghi "giữ ★, sửa spec theo PREMISE" | Đúng hướng đề xuất: sửa spec cho khớp PREMISE, không nới PREMISE. RV-18 có cả ca âm (e): token sai `purpose` → 403. |
| G2-M02 | Major | **Closed** | DoD LAB-5 có ở 7/7 TECH luồng 2: `PTY_PERMIT_LIFECYCLE_TECH.md:270`, `PTY_APPROVAL_LIFECYCLE_TECH.md:255`, `DEL_RECORD_TECH.md:207`, `DEL_EXCEPTION_DISPUTE_TECH.md:227`, `STL_DAY_CLOSE_TECH.md:210`, `STL_CORRECTION_DECIDE_TECH.md:224`, `STL_DEVICE_LOST_TECH.md:122`; và 3 FUNC (`PARTY_FUNC.md:233`, `DELIVERY_FUNC.md:213`, `SETTLE_FUNC.md:173`) | Đủ các ca Expert đã nêu (12 mục checklist, 423, idempotent `clientRecordId`, cấm tự xác nhận, 許可/承認 hai mã, `LIMIT_CHANGED` cũ/mới, `EXPIRED` chạy lại không sinh thêm). |
| G2-M03 | Major | **Closed** | `grep error_extra specs` (trừ `_templates`) = 0; RENEW-đã-失効 thống nhất 409 `E-PTY-013` + `detail.nextAction` (`PARTY_FUNC.md:220`, `PTY_PERMIT_LIFECYCLE_TECH.md:145`, `PTY_APPROVAL_LIFECYCLE_TECH.md:137`), `E-PTY-014` chỉ còn 422; `detail.blocking` là mảng `{adrNo,label,count}` ở `API-STL-002_API.md:80`, `STL_DAY_CLOSE_TECH.md:165,217`, `SC-07-02_SPEC.md:135`; `API-DEL-003` dùng `field` dạng `items[i].…` | — |
| G2-M04 | Major | **Closed** | `specs/_index.md:81` (A. Gọi trực tiếp DEP-01..06), `:92` (B. Nguồn dữ liệu đầu vào DEP-07..17) | Phủ đủ 6 nhóm đã nêu (rule maker DEP-08, 修正申請 4 phạm vi DEP-09, せり入力 DEP-10, 入金CSV + FIFO DEP-11 gắn nhãn hạng mục 完納奨励金 / K2, calendar + tạo kỳ DEP-12, outbox DEP-13), thêm DEP-14..17 từ câu trả lời khách. Mỗi dòng có giả định seed cho test. |
| G2-m01 | Minor | **Closed** | grep `trace_id`, `open_days`, `payout_jpy`, `carry_expired_unpaid`, `requested_by` ở API-INC / API-RULE-001 = 0; `scripts/check-api-spec-consistency.py` chạy lại: 42 file, 0 finding | Đã thêm bộ kiểm vào repo như đề xuất. |
| G2-m02 | Minor | **Closed** | `api-conventions.md:71` (400 `BAD_JSON`, dẫn `parse-json-body.ts:14`), `:75` (dòng lệch) | — |
| G2-m03 | Minor | **Closed** | `TRADE_AITAI_CONFIRM_TECH.md:237` (prototype đã dùng `next_day_counter`), `TRADE_SERI_CONFIRM_TECH.md:234` (server chỉ bắt lý do với 売買参加者, UI hiện cho mọi dòng) | — |
| G2-m04 | Minor | **Closed** | `RULE_VERSION_TECH.md:58` dùng `·`; PNG `specs/rule/technical-design/assets/RULE_VERSION_sequence.png` render đúng (đã mở xem, đủ 18 bước) | — |
| G2-m05 | Minor | **Closed** | PREMISE `L4-D07` (`PREMISE.md:180`), DEC-056; `SCREEN-LIST.md:25,98` ghi `Spec` (L4-D07) | Cụm "10 màn cốt lõi" giữ nghĩa *màn đại diện*, đã ghi rõ trong L4-D07. |
| G2-m06 | Minor | **Closed** (có ghi chú mới) | `README.md:50-52` ngoại lệ #9..#11 | Ngoại lệ #11 nay **lỗi thời** sau khi chuyển sang HTML — xem W-m05 ở Phần 2. |
| G2-m07 | Minor | **Closed** | `SC-04-01_SPEC.md:151`, `SC-03-01_SPEC.md:149`, `API-DEL-001_API.md:71` có nhãn "[PL] mục tiêu nội bộ" | — |
| G2-m08 | Minor | **Closed** | `API-RULE-004_API.md` không còn `X-MFA-Token`; quy tắc khai báo ở `api-conventions.md:107`; API-RULE-005 khai header có điều kiện | — |
| G2-m09 | Minor | **Closed** | `.gitignore:50` `__pycache__/`; `scripts/annotated_screens/` đã tách theo feature ở ab9569a, rồi bị thay hẳn bằng `render-wireframes.py` (152 dòng) trong working tree | — |
| FB-EXP-236 | Điều kiện | **Closed** | 15/15 TECH nhúng `./assets/{DESIGN_ID}_sequence.png` ở §2 (671c17e), Mermaid giữ làm nguồn; `scripts/export-mermaid-png.py`; feedback-list dòng 788 = Fixed | — |

### 1.2 Câu trả lời khách P3 — kiểm áp dụng

| Câu | Khách nói | Áp ở đâu | Kết luận |
|---|---|---|---|
| Q-INC-02 | Không cài "không thưởng" cứng; GD nhập muộn vào kỳ sau, xét 完納 theo 支払期日 kỳ sau; **một quy tắc** cho người có / không có GD ở kỳ đã khóa | `trades.incentive_period_id` (`TRADE_DB.md:36`); `BILLING_DB.md:373`; `INC_ENGINE_TECH.md:144,307` bỏ giả định K' = false; DoD K1/K6 (`:188,314`); `STL_CORRECTION_DECIDE_TECH.md:241`; `INCENTIVE_DB.md` TV-13 viết lại + TV-15 mới; ADR-007 `:84` | **Đúng.** Câu khách yêu cầu PL nói rõ cách xử lý người *có* GD ở kỳ đã khóa — TV-13 trả lời; TV-15 chứng minh hai nhóm cùng quy tắc. Cách ghi 請求 cho khoản này vẫn để câu hỏi 経理部 (`INC_ENGINE_TECH.md:154`) — đúng luật 7. |
| — TV-15 tính lại | — | `INCENTIVE_DB.md:178` | 600.000 税抜 → bậc 2 (500.000–<1.000.000, 50 bp) → floor(600.000 × 0,5% × 1,1) = **3.300** ✓; 期のお支払額 600.000 × 1,08 = **648.000** ✓; 2027-10-10 là Chủ nhật → 支払期日 lùi về **2027-10-08 (thứ Sáu)** ✓; trả 2027-10-05 (thứ Ba) ≤ hạn → 完納 ✓; biến thể 2027-10-12 → 非完納 → 0 ✓; kỳ 09 khóa 2027-10-13 > hạn ✓. TV-13 cũng đúng: (600.000 + 200.000) × 1,08 = 864.000; 800.000 → bậc 2 → 4.400; biến thể trả 648.000 < 864.000 → 0. |
| Q-STL-04 | Cấp 1 = 照合部門長 hoặc 代行 chỉ định trước; 運用部門長 chỉ cấp 2; không có 代行 thì chờ | `STL_CORRECTION_DECIDE_TECH.md:85-90` (bảng quyền), `:235` (OPS_HEAD gửi `level = 1` → 403), `API-STL-005_API.md:88`, `SC-08-03_SPEC.md:150,164`; DEP-14 `delegations` | **Đúng.** Grep toàn repo không còn câu nào cho 運用部門長 duyệt cấp 1. Nhân sự 代行 chuyển thành câu hỏi 経営陣. |
| Q-TRD-02 | 参加上限 so **税込** | `SC-04-01_SPEC.md:65,76,126,149`; `SC-05-02_SPEC.md:70`; `SC-01-02_SPEC.md:86`; tham số `PARTICIPATION_LIMIT_TAX_CODE` (DEC-057 (3), DEP-16) | **Đúng.** Tách khỏi 110/100 của BR-INC-01, làm tròn xuống, hiện cả 税込 / 税抜. Suất thuế là file cấu hình, không tính vào 4 lần/năm — hợp lý. |
| Q-TRD-05 | Hai nút 差し戻し / 取消, người xác nhận chọn | `SC-05-02_SPEC.md:25,67` (5.1 / 5.2, không tự hủy); `TRADE_SERI_CONFIRM_TECH.md:235` DoD (b)–(b5) | **Đúng.** Có cả ca "không có nút đổi người mua ngay trên SC-05-02" (b5) — giữ BR-PERM-01. |
| Q-STL-02 | Checklist có mục tick 「未入力の引渡し確認票なし（紙台帳で確認）」 | ADR-005 `:47` mục 12; `CLOSE_DB.md:152`; `SC-07-02_SPEC.md:68`; `API-STL-002` input `paperSlipsAllEnteredAcknowledged` + 422 `E-STL-013` | **Đúng**, 12 mục thống nhất ở ADR / DB / SPEC / API. |

### 1.3 Finding mới (Phần 1)

| # | Mức | File:vị trí | ID RFP | Vấn đề | Cách sửa đề xuất |
|---|---|---|---|---|---|
| G2C-n01 | Minor | `specs/rule/technical-design/assets/RULE_VERSION_sequence.png` bước 13 (khối Mermaid `RULE_VERSION_TECH.md` §2) | NFR-SEC-01; ADR-002 §2.2-6a | Bước 2 ghi `+ X-MFA-Token`, nhưng bước 13 `POST /rule-versions/{id}/second-approval` không ghi, trong khi API-RULE-003 bắt buộc token `RULE_SECOND_APPROVAL`. Đọc sơ đồ dễ hiểu là N2 chỉ cần step-up. | Thêm `+ X-MFA-Token` ở thông điệp bước 13, xuất lại PNG. |

Không thấy lỗi mới nào do lượt sửa gây ra ở các phần đã kiểm (mã lỗi, MFA, DoD, DEP, TV).

**Verdict Phần 1: RELEASE.** 4/4 Major và 9/9 Minor của Gate 2 đã Closed, điều kiện FB-EXP-236 đã đóng. G2C-n01 sửa trong lượt tới, không chặn.

---

## Phần 2 — Wireframe HTML

### 2.1 Kết quả theo mục kiểm

| Mục | Kết luận |
|---|---|
| (a) Phong cách sát mẫu | **Đạt.** So trang mẫu SCR-02 / SCR-17 với SC-01-02 / SC-06-02: cùng dòng tiêu đề `ID + tên + MÃ_HOA`, dải xám 「1 ワイヤーフレーム（主画面）」 + câu mô tả, nhãn thiết bị đen (`PC` / `タブレット`), khung trình duyệt `○○○ /url`, menu trái có mục đang chọn tô đen, badge số tròn đen, đơn sắc, viền dày cho nút chính, nét đứt cho vùng giữ chỗ. Khung tablet bo góc dày như khung điện thoại của mẫu. Khác nhỏ: mẫu có nền xám sau khung thiết bị, bản này nền trắng — không cần sửa. PDF 15 trang (một trang / màn, cao theo nội dung), 4,75 MB (mẫu 14,6 MB). |
| (b) Badge HTML ↔ SPEC ↔ WF MD | **HTML ↔ SPEC khớp ở 12/12 màn có SPEC** (quét máy cả 15 file): mọi ID trong §4.1 của SPEC đều có badge, mọi badge số đều có dòng §4.1; badge `C-x` ngoài §4.1 đều được nhắc trong SPEC ở mục khác. Lệch nhỏ: W-m06. **WF MD thiếu ID con** ở 5 màn — W-m01. Soát tay 6 màn: SC-01-02, SC-05-02, SC-06-02 (tablet), SC-07-02, SC-09-04, SC-10-04. |
| (c) Badge vắng ở biến thể A | **Đúng 12/12.** Tập "có ở các biến thể – có ở A" do máy tính ra trùng khít với dòng "Badge không có trên ảnh này" của từng SPEC (vd SC-06-02: 11.1, 17.1–17.4, C-12, C-21, C-22, C-29; SC-09-04: C-12, C-24, C-30, C-31 + giải thích số 12 cố ý không vẽ). Ảnh `_annotated.png` chỉ chứa biến thể A (đã mở SC-05-02); thời gian ghi file đầu ra mới hơn HTML / CSS. |
| (d) Nội dung theo thiết kế đã duyệt | **Đạt.** SC-07-02: đủ **12 dòng** (6 ✖ + 6 ⚠, dòng [22] là tick sổ giấy), "残り 5 項目" khớp 5 dòng ✖ có số > 0, MFA "毎回コード入力". SC-01-02: hai khối 【許可】仲卸 / 【承認】売買参加者 tách riêng, căn cứ khác nhau, 「参加上限の変更：照合部門長のみ・MFA」 đúng Q-PTY-06. Chữ 承認 chỉ xuất hiện cho tư cách 売買参加者 (grep 15 HTML); duyệt nội bộ dùng 決裁 / 確認. SC-05-02: hai nút 5.1 / 5.2, không tự hủy, không đôn người trả giá thứ hai. SC-08-03: 1次 = 照合部門長 / 代行, 運用部門長 không có nút 1次 (Q-STL-04). SC-09-04: N01 1.000.000 bậc 3 → **¥9,900**; 「手数料差引の疑い」 do 照合部門長 chọn, mặc định 非完納 (luật 3); 入金CSV tick [17]. SC-10-04: E = phương án N1, F = phương án N2 「お客様の現時点の意見・仮」, ghi "実装はどちらか一方、設定スイッチなし"; xác nhận / hủy bản đã duyệt "毎回コード入力" (khớp G2-M01). |
| (e) Số liệu thuế 8% | **Đúng hết các chỗ đã tính lại:** SC-01-02 B 4.620.000 × 1,08 = 4.989.600, 残 10.400; SC-01-02 A 1.100.000 → 1.188.000, 残 3.812.000; SC-04-01 B 24.000 → 25.920 > 残 10.400; SC-05-02 B07 2.768.000 → 2.989.440, 29.750 → 32.130, tổng vượt 3.000.000; SC-04-05 −5.400 → −5.832, 81.000 → 87.480; SC-08-03 114.000 → 123.120, 414.000 → 447.120; SC-09-04 50.000 → 54.000, 300.000 → 324.000 (thiếu 440); SC-10-04 bảng ví dụ 2.750 / 9.900 / 11.000 / 39.600 / 165.000; SC-07-02 11.140.000 + 1.241.000 = 12.381.000. Số ngày 失効まで (業務日 2027/08/02): 448 / 607 / 18 — đúng. |
| (f) Các điểm PL nêu | SC-01-02 A đặt hai khối cạnh nhau **chỉ để đánh số**: chấp nhận — nhãn biến thể A và ghi chú dưới ảnh SPEC (`SC-01-02_SPEC.md:38`) nói rõ màn thật chỉ hiện một khối, biến thể B / E / F đúng một khối. Không vi phạm luật 2. SC-05-02 nút [9] mờ ở A: chấp nhận, có ghi chú (`SC-05-02_SPEC.md:38`) và dòng gợi ý trên chính ảnh. SC-06-02 [14] giữ chỗ: chấp nhận, có ghi chú SPEC và nhãn 「数量を入力すると表示」 trên ảnh. PDF 4,75 MB: chấp nhận. |

### 2.2 Finding

| # | Mức | File:vị trí | ID RFP | Vấn đề | Cách sửa đề xuất |
|---|---|---|---|---|---|
| W-m01 | Minor | Bảng Item (§3) của WF MD: `SC-01-02-…-wireframe.md` (thiếu 9.1–9.6), `SC-05-02-…` (5.1, 5.2), `SC-06-02-…` (11.1, 17.1–17.4), `SC-06-04-…` (10.1), `SC-07-02-…` (19.1–19.5) | — (truy vết wireframe → spec) | HTML và SPEC có các ID con này, WF MD (đang nhúng `png/{ID}.png` có các badge đó) thì không có dòng nào. Trong khi ghi chú dưới mọi ảnh SPEC khẳng định "Số trên ảnh = cột ID mục 4 = cột `No` của wireframe". Không ảnh hưởng dev (SPEC đủ), nhưng tiêu chí (b) chưa đạt ở 5/15 màn. | Thêm dòng ID con vào bảng Item của 5 WF MD (một dòng / ID, cột Ghi chú trỏ sang SPEC), hoặc thêm một dòng gộp kiểu "9.1–9.6 hộp thoại 保証金の変更 — xem SPEC §4.1". Thêm vào script quét một luật: badge số trong HTML phải có trong WF MD. |
| W-m02 | Minor | `wireframes/html/SC-06-02.html` biến thể C (bảng sau khi ghi) so với biến thể A | FR-DEL-01, FR-DEL-02 | A: 相対-0011 引渡済 0 / 残 4 / 待機中. C (ngay sau **một** lần ghi 鰹 6.0kg, 未同期 3 → 4): 相対-0011 thành 引渡済 4 / 残 0 / 完了, trong khi tiêu đề vẫn 「引渡し待ち 3件」. Một lần ghi mà hai GD đổi số, dễ làm người đọc hiểu nhầm là hệ thống tự hoàn thành dòng khác. | Ở C giữ 相対-0011 = 0 / 4 / 待機中 (chỉ 相対-0005 đổi 12.0 → 18.0, 残 12.0). Render lại PNG / PDF. |
| W-m03 | Minor | `wireframes/html/SC-09-04.html:42` (và WF MD `:44`) [18] 「前期分の後入力：B12 取引日 07/30 ¥200,000」 | BR-INC-01; Q-INC-02; L4-A09 | Kỳ đang xét là 2027-08 = kỳ đầu sau go-live (2027-08-01). GD ngày 07/30 là **trước go-live**, nên ví dụ này thực chất là ca chuyển đổi dữ liệu (kỳ migrate), không phải ca 後入力 thông thường mà TV-13 / TV-15 mô tả. Spec `LATE_ENTRY` cần 業務日 gốc có trong lịch hệ thống ở trạng thái LOCKED; chưa thấy chỗ nào nói ngày trước go-live có trong lịch. | Đổi ví dụ sang ngày trong hệ thống (vd màn kỳ 2027-09 với GD 08/31, đúng TV-13), **hoặc** giữ ví dụ và thêm một câu ở SC-09-04 §6 / DEP-12: ngày trước go-live được nạp vào lịch dạng LOCKED khi migrate, 紙伝票 trước go-live đi qua `LATE_ENTRY` như thường. |
| W-m04 | Minor | `wireframes/html/SC-08-03.html` `data-user` 「照合部門長 桜 七郎」 vs SC-01-02 / SC-07-02 / SC-09-04 / SC-10-04 「照合部門長 桜 七子」 | — | Một vai, hai tên mẫu. Khách đọc theo câu chuyện xuyên màn (代行 「桜 八郎（桜 七郎 の代行）」 ở B) dễ tưởng là hai người. | Thống nhất 「桜 七子」 ở SC-08-03 (cả dòng 代行 ở B, E). |
| W-m05 | Minor | `README.md:52` ngoại lệ #11 | QC-01; BM-2-901-51 §3 | Vẫn ghi ảnh `_annotated.png` "vẽ bằng script Pillow từ dữ liệu bố cục của wireframe to-be", "wireframe Markdown là nguồn to-be". Nay nguồn là HTML, ảnh do `render-wireframes.py --spec` chụp biến thể A (README:70 đã ghi đúng). | Sửa #11: "ảnh = biến thể A của `wireframes/html/{ID}.html`, render bằng `scripts/render-wireframes.py --spec`; các biến thể khác ở PDF / PNG". |
| W-m06 | Minor | `SC-06-04_SPEC.md:62`, `SC-06-05_SPEC.md:58` (dòng `C-11 バナー`); `SC-09-04_SPEC.md` §4.1 (không có `C-9`) | — | Hai SPEC có dòng `C-11` nhưng HTML không vẽ badge `C-11` (banner hiện bằng `C-24` / `C-28`); HTML SC-09-04 có badge `C-9` (tiêu đề màn) nhưng §4.1 không có dòng `C-9`. | Bỏ dòng `C-11` (hoặc ghi "khung chứa C-24 / C-28, không có badge riêng"); thêm dòng `C-9` vào SC-09-04 §4.1 như các SPEC khác. |
| W-m07 | Minor | 14/15 WF MD vẫn giữ khối ASCII (vd `SC-07-02-…-wireframe.md` 20 dòng khung, `SC-09-04-…:43-51`) | — | Có quy tắc ưu tiên rõ ("khi lệch, HTML + SPEC là bản đúng"), nhưng hai nguồn bố cục song song là chỗ dễ lệch tiếp (W-m03 nằm ở cả hai). | Không cần sửa ngay. Từ LAB-5: không sửa ASCII nữa, ghi rõ "ASCII đóng băng ở 0.2.x"; hoặc bỏ ASCII khi chuyển sang Figma. |

### 2.3 Điều kiện để release (Phần 2)

1. **Commit phần đang ở working tree** (15 HTML, `_shared/`, PDF, 15 PNG, 12 ảnh annotated, WF MD, SPEC, xóa `scripts/annotated_screens/` + `render-annotated-screens.py`, README, `_index.md`). Output chưa commit thì chưa coi là bản release. Không commit kèm `prototype/plans/` (đang untracked, không thuộc phạm vi).
2. Nên sửa W-m01, W-m02, W-m05 trong cùng commit (sửa chữ / số mẫu, render lại một lệnh). W-m03, W-m04, W-m06 sửa được trong lượt tới; W-m07 để LAB-5.

Sau khi PL sửa, Expert chỉ cần kiểm lại diff của các file nêu trên.

### 2.4 Câu hỏi mở cho khách (không chặn)

- SC-03-07 biến thể A: bản ghi 仮受付 (K3-020, người ghi 桜 一郎 — 受付担当) nằm trên máy **TAB-03 của 配送**. Hiện màn ghi "自分の役割の記録だけ判断できます（仮受付は受付担当）", tức 配送 thấy nhưng không xử lý được. Cần khách xác nhận: ở bến có dùng chung tablet giữa 受付 và 配送 không? Nếu không dùng chung thì đổi ví dụ sang máy TAB-01 của bến; nếu có thì giữ và thêm ca "người đang cầm máy không đủ vai → báo 受付担当" vào SC-03-07.

---

## Kiểm 7 luật (cả hai phần)

- Luật 1: đạt — SC-04-01 / SC-05-02 ghi せり 「相対とは別に集計」, 相対 là luồng chính.
- Luật 2: đạt — 許可 / 承認 hai khối, hai căn cứ, hai mã lỗi; 承認 không dùng cho duyệt nội bộ (grep 15 HTML).
- Luật 3: đạt — 取消 / 差し戻し せり, 手数料差引の疑い, 端末回収不能, giao tranh chấp, 同期 要判断 đều do người chọn và có lý do; HTML ghi "自動でまとめない／上書きしない".
- Luật 4: đạt — SC-08-03 sinh 取消 + 差額 ở 業務日 mở sớm nhất, 対象期 giữ kỳ gốc; SC-07-02 / SC-09-04 "締めの解除もできません", chênh lệch thưởng → kỳ sau.
- Luật 5: đạt — SC-10-04 có version, 発効日, maker-checker, quota 4 lần, rollback, N1 / N2 chờ E-14.
- Luật 6: đạt — không có option nào lẫn vào 15 màn.
- Luật 7: đạt — câu hỏi 経理部 / 経営陣 / 目利き主任 đều ghi kèm ảnh hưởng.

## Điểm làm tốt (ngắn, cụ thể)

- Một nguồn HTML → PDF + PNG + ảnh SPEC bằng một lệnh; dòng "Badge không có trên ảnh này" ở 12 SPEC khớp 100% với kết quả quét máy — tiết kiệm hẳn công soát tay khi đổi wireframe.
- Ví dụ số liệu xuyên màn ăn khớp: B03 ở SC-01-02 / SC-04-01 cùng 4.620.000 税抜 → 4.989.600 税込, 残 10.400; TAB-03 07:12 / 未同期 5件 giống nhau ở SC-03-07 và SC-07-02.
- Q-INC-02 được áp đủ chuỗi DB → ADR → TECH (DoD K1 / K6) → TV-13 / TV-15 → SC-09-04 [18], có ghi lại phiên bản cũ cho 0 đồng ở đâu và vì sao bỏ.
- Gate 2 đóng gọn: mỗi finding có dòng History trỏ đúng ID (G2-Mxx / G2-mxx / Q-xxx), kiểm lại nhanh bằng grep.

**Tổng:** Phần 1 — Critical 0 · Major 0 · Minor 1 (mới). Phần 2 — Critical 0 · Major 0 · Minor 7.
