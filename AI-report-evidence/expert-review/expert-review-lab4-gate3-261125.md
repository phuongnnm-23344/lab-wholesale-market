# Expert review — LAB-4 Gate 3 (toàn bộ bộ nộp) — 2026-11-25

Phạm vi review (theo chỉ định của người dùng): toàn bộ bộ nộp LAB-4 ở repo `lab-wholesale-market`, nhánh `ver/lab-4`, HEAD `d1dbf12` (working tree sạch, chỉ có `prototype/plans/` untracked). Đối chiếu nguyên văn `plans/lab/Lab 4/Requirement.txt` và `Output.txt`. Gate cuối trước khi dịch JA và đóng gói nộp.

Tiêu chí:
1. Đủ và đúng từng mục Output.txt; README §4 bảng kế thừa / mới đúng với `spec-standards/03-specs`; PREMISE chốt 1 hướng, truy vết được.
2. Mục tiêu học tập của Requirement.txt (wireframe chi tiết, architecture nhất quán ràng buộc, screen spec đủ field / validation / trạng thái / phân quyền, phân nhánh đặc thù Nhật, input trực tiếp cho LAB-5 — 完納奨励金 tách task được, ADR có ghi vết, DB diagram đối chiếu prototype + chỉ chỗ lệch).
3. AI-report trung thực, số liệu truy được về file, không nói quá, đủ 3 ý của Output.txt.
4. 7 luật CLAUDE.md; không chép nguyên văn RFP; không dữ liệu thật / secret (repo public ở LAB-5).
5. Nhất quán toàn bộ (index ↔ file, version, link).

Cách kiểm (bằng máy, ngoài đọc tay):
- So byte 12 file khuôn + bản mẫu trong `specs/_templates/`, `requirements/_templates/` với `spec-standards@72c1dda` qua `gh api`: **12/12 giống hệt**. `03-specs/` không có commit nào sau `72c1dda` (HEAD chuẩn `ae45211`) — câu README:58 đúng. `log-convention.md` chỉ khác ở frontmatter, link `../_templates/` và mục 4 thêm mới — đúng như README:109 ghi.
- Kiểm lại các nhận định về chuẩn ở README: `BM-2-901-52` dòng 32 ghi ba file `_common/` "CHƯA TỒN TẠI — xem ISS-36" (đúng README:116); commit `8a0325a` (2026-09-10) "QC-01 0.8.0 — bỏ 00-overview cùng architecture-overview, screen-map, glossary" (đúng README:118–119); QC-01 §1 cho thêm nhóm cùng cấp nếu có dòng README (đúng ngoại lệ #2).
- Script quét mọi `_index.md`: 118 dòng có version → **0 lệch** với frontmatter; 0 dòng trỏ file không tồn tại; mọi tài liệu thiết kế đều có dòng trong index (trừ 7 `specs/{feature}/README.md` — đúng QC-01, README feature là trang điều hướng).
- Quét link tương đối trong toàn bộ `.md` của bộ thiết kế: **1 link gãy**, nằm ở phần README của template Sun* (`docs/status-transition-spec/tracker-status.csv`), không thuộc phần LAB-4.
- `scripts/check-api-spec-consistency.py` ở HEAD: 42 file, 0 finding.
- Quét chuỗi tiếng Nhật ≥ 16 ký tự trong mọi `.md` / `.html` (trừ `_templates/`, `prototype/`) so với text trích RFP: **0 chuỗi trùng nguyên văn**.
- PDF tổng: `/Count 15`, 15 trang. Prototype có 25 bảng (`supabase/migrations`), khớp "22 giữ tên + 3 đổi tên" ở MKT_DB History 0.1.0.
- Tính lại thứ trong tuần cho ví dụ mới của SC-09-04: 2027-10-10 Chủ nhật → 支払期日 2027-10-08 thứ Sáu; 10/13 thứ Tư, 10/14 thứ Năm — đúng như HTML.
- Đối chiếu số liệu AI-report với `expert-review-lab4-*.md`, `customer-feedback-lab4-*.md`, `feedback-list.md`, `decision.md`, `progress-lab4.md`: số finding của từng gate, 22 / 32 + 5 / 31 câu, 375 khối JSON, 4/4 mẫu âm, 134 file, 11 TV — **đều có nguồn**.

**Verdict: RELEASE CÓ ĐIỀU KIỆN** — Critical 0 · Major 3 · Minor 10.

Phần thiết kế (PREMISE, kiến trúc, 10 ADR, 10 Database Design, 15 wireframe, 12 SPEC, 7 FUNC, 15 TECH, 42 API) đã đạt mục tiêu học tập và không còn lỗi chặn. Ba lỗi Major đều nằm ở **khả năng truy vết của tài liệu nộp kèm** (một quyết định phạm vi chưa có dòng ghi, nguồn số liệu AI-report nằm ngoài gói nộp) và **secret trước khi public repo**; sửa trong khoảng 1 giờ, không phải chạy lại Expert đầy đủ — chỉ kiểm diff.

---

## 1. Bảng đối chiếu Output.txt

| # | Yêu cầu của Output.txt | Ở đâu | Đánh giá | Ghi chú |
|---|---|---|---|---|
| O-1 | README.md mô tả chi tiết cấu trúc folder | `README.md` §1 (bảng điều hướng), §4.1 (cây thư mục nộp + số tài liệu), §5 (script) | **Đạt** | Cây §4.1 khớp `git ls-files`; số tài liệu khớp index |
| O-2 | README: file / template nào kế thừa spec-standard | `README.md` §2, §4.2 dòng 102–110 | **Đạt** | 12/12 khuôn, bản mẫu giống byte với `72c1dda`; ghi rõ commit nguồn và việc không copy `BM-01` / `sample-AD_LOGIN_SPEC` (đúng QC-01 "một loại một khuôn") |
| O-3 | README: file / template nào tạo mới theo đề | `README.md` §3 (11 ngoại lệ có lý do), §4.2 dòng 111–121 | **Đạt, còn lỗi nhỏ** | Phân 4 mức: kế thừa nguyên / kế thừa có thêm / viết theo khuôn có điều chỉnh / tạo mới — rõ hơn yêu cầu. Lỗi: G3-m01, m02, m03, m05, m09 |
| O-4 | PREMISE.md: quyết định thêm sau LAB-1 (thêm / bỏ tính năng, giả định mới, chốt 1 hướng) | `PREMISE.md` §1 (các hướng LAB-1 → chốt gói R1, AWS Tokyo), §2 (thêm / bỏ: không đổi FT, chỉ đổi mức chi tiết), §3 (L4-A01..A09 có độ chắc + "nếu sai thì sao"), §4 (M01–M24), §5 (L4-D01..D07), §6 (điểm mở) | **Đạt, thiếu 1 dòng** | Chốt đúng **một** hướng, có lý do và phương án bỏ. Thiếu dòng ghi quyết định "không mở rộng SPEC tới 70 màn" mà README §4.3 viện dẫn — G3-M01 |
| O-5 | Folder specs chi tiết: wireframe | `wireframes/` — 画面一覧 70 màn, 15 wireframe (HTML nguồn + PNG + PDF 15 trang + MD có bảng Item) | **Đạt** | Ở mức "chi tiết, không còn mock nhanh": nhiều biến thể / màn, badge số = cột ID SPEC |
| O-6 | Architecture | `architecture/ARCHITECTURE.md` 0.2.3 — §3 thành phần, §4 luồng dữ liệu chính, §9 điểm tích hợp, §11 NFR, §12 prototype → to-be | **Đạt** | |
| O-7 | ADR | `architecture/adr/ADR-001..010` — đều đủ 5 mục bối cảnh · quyết định · phương án đã cân nhắc · hệ quả · truy vết | **Đạt** | 9/10 còn `Proposed` — G3-m07 |
| O-8 | Detail design theo format chuẩn spec-standard | `specs/` — 12 SPEC (BM-51), 7 FUNC (BM-54), 15 TECH (BM-53, có PNG sequence), 42 API (BM-52), 10 DB (BM-50) | **Đạt** | Ngoại lệ so với khuôn đều ghi ở README §3 |
| O-9 | AI-report: skill, cách viết prompt | `AI-report.md` §2.1–2.3 | **Đạt** | Trung thực: ghi rõ skill nào chạy thật, skill nào chỉ dùng khung, skill nào không có log |
| O-10 | AI-report: review thế nào, người tham gia ở giai đoạn nào, lỗi phát hiện + cách giải quyết | `AI-report.md` §3.1 (5 vòng gate), §3.2 (điểm người quyết), §3.3 (14 lỗi) | **Đạt, 2 chỗ cần sửa** | Gán L4-D07 cho người dùng trong khi PREMISE / DEC-056 ghi PL — G3-M01; nguồn số liệu ngoài gói nộp — G3-M02 |
| O-11 | AI-report: điểm đặc biệt, tự đánh giá (tự tin / chưa tốt) | `AI-report.md` §4.1, §4.2 | **Đạt** | Tự đánh giá có số và chỗ yếu thật (quy ước chung đến muộn, Expert không đọc hết spec, Customer là AI, mất file do script) — không nói quá |

## 2. Bảng đối chiếu mục tiêu học tập (Requirement.txt)

| Mục tiêu | Bằng chứng | Đánh giá |
|---|---|---|
| Prototype → wireframe chi tiết + architecture nhất quán ràng buộc | 15 wireframe to-be có ảnh as-is prototype cạnh bên (`wireframes/assets/`); ARCHITECTURE §12 + PREMISE §4 nối từng mock M01–M24 sang thiết kế to-be | Đạt |
| Screen spec đủ field / validation / trạng thái / phân quyền để dev không hỏi lại | 12 SPEC có §4.1 item, §4.2 validation, §4.3 data mapping, §5 Event (gồm nhánh 409 / 423 / 403 / offline), bảng vai × item; trạng thái dùng chung `C-20..C-31` | Đạt. Cấu trúc chưa đồng đều giữa 3 luồng viết (G3-m05) |
| Phân nhánh đặc thù Nhật, không tuyến tính | 許可 ≠ 承認 hai khối / hai bảng / hai vòng đời (SC-01-02, ADR-003, PARTY_DB); 業務日 01:00–01:00 và 日次締め (ADR-005); quy chế version + quota 4 lần + hai nhánh N1/N2 của E-14 (ADR-006, RULE_VERSION_TECH); 支払期日 lùi theo ngày ngân hàng nghỉ; 参加上限 theo 税込 có tham số thuế; offline + đường giấy (ADR-008) | Đạt — điểm mạnh nhất của bộ nộp |
| Input trực tiếp cho LAB-5, 完納奨励金 tách task được | INC_ENGINE_TECH §4 chia 9 khối K1–K9, mỗi khối có **DoD** kiểm được và trỏ test vector TV-01..15 (INCENTIVE_DB §5); DEP-01..17 ở `specs/_index.md` cho phần chưa đặc tả | Đạt |
| ADR có ghi vết | 10 ADR đủ 5 mục, phương án bỏ có lý do, truy vết về RFP / DEC / PRM | Đạt |
| DB diagram đối chiếu bảng thật LAB-2, chỉ chỗ lệch | MKT_DB §3 ERD tổng + ERD theo cụm (10 khối `erDiagram`), §5 bảng lệch 40 dòng (D01–D24, N01–N16), §6 kết quả parity độc lập; 25 bảng prototype khớp số đếm | Đạt |

## 3. Kiểm 7 luật

| Luật | Kết quả |
|---|---|
| 1. Không auction-only | Đạt — không có câu nào mô tả hệ thống là sàn đấu giá; 相対 là luồng chính ở PREMISE, ARCH, `specs/_index.md` |
| 2. 許可 ≠ 承認 | Đạt — mọi chữ 承認 trong 15 HTML đều thuộc 売買参加者; duyệt nội bộ dùng 決裁 / 確認 (L4-D03). **Rủi ro khi dịch JA** — xem mục 6 |
| 3. Người quyết cuối, không OCR / AI | Đạt — ADR-010, ARCH §6; 目利き, chốt せり, 修正申請 2 cấp, giao có tranh chấp (SC-06-05) đều có người chốt + MFA |
| 4. Không ghi đè lịch sử | Đạt — ADR-004 REVERSE / DELTA, ADR-005 khóa ở mức DB, DELTA kỳ sau ở ADR-007 / TV |
| 5. Quy chế version + hiệu lực + maker-checker + rollback, ≤ 4 lần/năm | Đạt — ADR-006, SC-10-04, RULE_VERSION_TECH; E-14 để mở có hai nhánh, không làm công tắc cấu hình |
| 6. Option tách riêng | Đạt — PREMISE §1.2 / §2 dòng 7, ARCH §10 chỉ chừa điểm mở rộng |
| 7. Chưa chốt → câu hỏi / giả định / ảnh hưởng, truy ID | Đạt ở thiết kế; một quyết định phạm vi chưa có dòng ghi — G3-M01 |
| Không chép nguyên văn RFP | Đạt (0 chuỗi trùng ≥ 16 ký tự) |
| Không dữ liệu thật / secret | Thiết kế: đạt (mã hư cấu, `.env.local.example` rỗng). Ngoài phần LAB-4: mật khẩu demo nằm trong `prototype/README.md` — G3-M03 |

## 4. Finding

| # | Mức | File:vị trí | ID RFP / tham chiếu | Vấn đề | Cách sửa đề xuất |
|---|---|---|---|---|---|
| G3-M01 | Major | `README.md:126` ("người dùng … quyết không mở rộng thêm ngày 2026-11-25 sau Gate 2"); `AI-report.md:85` ("Sau Gate 2: Screen Specification 12 màn (L4-D07 / DEC-056) và không mở rộng thêm tới 70 màn" — xếp dưới mục "Người tham gia ở đâu"); `PREMISE.md:180` (L4-D07 "Người quyết: **PL**"); `project/01_management/decision.md` DEC-056 ("PL (giao việc sửa Gate 2)") | Luật 7; Output.txt (PREMISE, AI-report ý 2) | Trả lời điểm (b) của PL: **cần thêm**. (1) Quyết định "không mở rộng Screen Specification ra 70 màn" là quyết định phạm vi của người dùng nhưng không có dòng nào ở PREMISE §5 hay `decision.md` — README là nơi duy nhất nói, không truy được. (2) AI-report liệt kê L4-D07 là điểm người dùng quyết, trong khi PREMISE và DEC-056 ghi PL quyết (theo Expert G2-m05). Người chấm đối chiếu ba file sẽ thấy mâu thuẫn ngay ở mục "người tham gia" — đúng chỗ đề hỏi | Thêm **L4-D08** vào PREMISE §5 (ngày 2026-11-25; quyết định: SPEC dừng ở 12 màn, 58 màn còn lại ở mức 画面一覧 + DEP-01..17, LAB-5 tách issue; phương án bỏ: mở rộng tới cả cụm / 70 màn; người quyết: người dùng; lý do: đề chỉ yêu cầu "màn cốt lõi", giới hạn thời gian) + **DEC-058**; PREMISE 0.6.3, History. README:126 trỏ L4-D08, README:64 đổi `L4-D01..D08`. AI-report:85 viết lại đúng vai: "L4-D07 do PL đề xuất theo Expert G2-m05 [người dùng duyệt / không — ghi đúng sự thật]; người dùng quyết không mở rộng tới 70 màn (L4-D08)" |
| G3-M02 | Major | `AI-report.md:15-20` | Tiêu chí 3 | Báo cáo tự nói mọi con số lấy từ file **không nằm trong gói nộp** (`project/07_feedbacks/…`, `decision.md`, `qa.md`, `progress-lab4.md`, brief). Tôi đã kiểm: số liệu đều đúng và có nguồn — nhưng người chấm chỉ nhận folder nộp thì không kiểm được, và §4.1 dòng cuối khẳng định "con số trong báo cáo này truy được về file". Với một bài mà đề hỏi thẳng "đã review thế nào, phát hiện vấn đề gì", bằng chứng review là phần có giá trị nhất; để ngoài gói là phí | Đưa bằng chứng vào **gói nộp** (không cần vào repo public): thư mục `AI-report-evidence/` gồm 4 báo cáo Expert LAB-4 + báo cáo Gate 3 này, 3 file Customer LAB-4, trích `feedback-list.md` (FB-EXP-217..295, FB-CUS-218..309), trích `decision.md` (DEC-046..058), `progress-lab4.md` mục "Ghi chú cho AI-report", 2 brief + 2 ghi chú gộp. Sửa AI-report:15-20 sang đường dẫn tương đối trong gói; thêm một câu "các file này chứa câu trả lời của khách giả lập, gắn nhãn [Giả lập]". Nếu không muốn kèm: sửa §4.1 thành "truy được trong ghi chép nội bộ, gửi khi cần" — kém hơn |
| G3-M03 | Major (chặn **public repo** ở LAB-5, không chặn nộp LAB-4) | `prototype/README.md:17` (mật khẩu chung của 10 tài khoản demo); `README.md:2` trỏ tới đó | Tiêu chí 4; DEC-030 | Mật khẩu của app đang chạy ở URL công khai (README:2). Dữ liệu giả, nhưng nhiều thao tác trên app **không quay lại được** (prototype README:50) — repo public thì ai cũng vào phá được bộ demo, phải `demo:reset`, và mất cả 監査ログ demo. DEC-030 quyết lúc repo còn private | Trước khi public: bỏ mật khẩu khỏi `prototype/README.md` (thay bằng "xem ghi chú nộp bài / hỏi người phụ trách"), đưa vào ghi chú nộp hoặc Drive; đổi mật khẩu demo sau khi public (lịch sử git vẫn còn mật khẩu cũ). Ghi DEC mới thay DEC-030. Gói nộp LAB-4 không kèm prototype nên không bị ảnh hưởng |
| G3-m01 | Minor | `README.md:49` ("cho cả **58** bảng") | — | Lệch với README:47, :91, MKT_DB §2 (60 bảng từ 0.3.2, DEC-055) | Đổi thành 60 |
| G3-m02 | Minor | `README.md:47-49` | — | Bảng ngoại lệ §3 xếp #8 trước #6, #7 — người đọc tra "#7" (được viện dẫn ở L4-D04, `specs/_index.md`, MKT_DB) phải dò | Xếp lại thứ tự 1→11 (không đổi số) |
| G3-m03 | Minor | `README.md:52` ngoại lệ #11, cột Lý do: "(thay wireframe Markdown + script vẽ khối từ LAB-4 bản HTML)" | — | Câu vỡ ngữ pháp, khó hiểu, sẽ dịch sai sang JA | Viết lại: "Từ bản HTML, wireframe HTML thay cho cách cũ (wireframe Markdown + script vẽ khối)" |
| G3-m04 | Minor | `README.md:27` ("`docs/` … là phần của template"); `README.md:236`, `:259-262`, `:337` | — | Repo không có `docs/` (`git ls-files` không có), link `docs/status-transition-spec/tracker-status.csv` gãy — link gãy duy nhất của repo. Thuộc phần README template Sun* kế thừa | Ghi một câu ở README:27 "template gốc có `docs/`, `bootstrap-project.sh`; bản copy này không kèm — các link tới đó không mở được"; hoặc bỏ phần template khỏi README của gói nộp (mục 6) |
| G3-m05 | Minor | 12 SPEC: phân quyền theo vai ở **§4.4** (SC-03-01, 03-05, 04-01, 05-02, 09-04, 10-04) nhưng ở **§6.2** (SC-01-02, 06-02, 06-04, 06-05, 07-02, 08-03); 4 SPEC luồng 1 (SC-03-01, 03-05, 04-01, 05-02) không có mục "Trạng thái màn", trạng thái nằm rải ở §5 Event + `C-xx`; `README.md:51` (ngoại lệ #10 nói "thêm §4.4 … và các mục §6.x") | BM-2-901-51 | Nội dung đủ (tôi kiểm SC-03-01 §5: rỗng C-21, lỗi nhập C-22, 409 C-23, 423 C-24, 403 C-25, offline), nhưng ba luồng viết ba kiểu. LAB-5 tách task theo mục sẽ phải dò từng file; README mô tả sai vị trí cho 6/12 file | Nhẹ nhất: sửa README #10 thành "phân quyền theo vai ở §4.4 hoặc §6.2; trạng thái ở §6.1 hoặc §5 Event + `C-xx`" kèm danh sách. Tốt hơn (có thể để LAB-5): thống nhất về §4.4 + §6.1 |
| G3-m06 | Minor | `wireframes/_common-layout.md:88` (C-22 "Validate phía client / **400**") | DEC-052; `specs/_common/api-conventions.md:71` ("Không dùng 400") | Khung chung còn mã 400 cũ; API trả 422 cho mọi lỗi nhập. Dev đọc `_common-layout` sẽ bắt sai mã | Đổi thành "422 (`E-CMN-007` / mã feature)"; `_common-layout` 0.2.1 + History; cập nhật dòng ở `wireframes/_index.md` |
| G3-m07 | Minor | `architecture/adr/_index.md:12-20` (ADR-002..010 `Proposed`) | Mục tiêu "quyết định kiến trúc có ghi vết" | Index giải thích rõ vì sao còn Proposed, nên không sai. Nhưng bộ nộp gate cuối mà 9/10 ADR "chưa ai chốt" thì người chấm có thể hiểu là quyết định chưa có chủ | Người dùng chốt một lần: chuyển ADR-002..010 sang `Accepted` (ghi ngày, "người dùng duyệt sau Gate 3", tăng MINOR + History), giữ ghi chú riêng cho phần F / G của ADR-006. Không chốt thì để nguyên — đã đủ trung thực |
| G3-m08 | Minor | `README.md:44` ngoại lệ #3 ("Đúng quy tắc") | QC-01 §2 bảng nhánh dòng 63, §4 dòng 264 | QC-01: nhánh `ver/{tên}` chỉ nhận từ `feature/spec-{slug}` / `cr/{slug}` **qua PR**. Repo commit thẳng lên `ver/lab-4` | Thêm vào #3: "một người làm, commit thẳng lên `ver/lab-4`, không mở `feature/spec-*` + PR — dự án thật làm theo QC-01" |
| G3-m09 | Minor | `README.md:100-121` (bảng §4.2) | QC-01 §3 dòng 217 | Thiếu dòng phân loại 7 `specs/{feature}/README.md` (kế thừa quy định QC-01, nội dung mới) | Thêm một dòng vào §4.2 |
| G3-m10 | Minor | `PREMISE.md:8` (`related`) | — | Frontmatter chỉ liệt kê DEC tới DEC-033, trong khi thân bài dẫn DEC-046..057 qua L4-D03..D07 | Bổ sung DEC-046..051, DEC-056 (và DEC-058 nếu thêm theo G3-M01) |

Không còn finding cũ nào mở ngoài W-m07 (để LAB-5, đã ghi ở `wireframes/_index.md` và AI-report §4.2). G2C-n01, W-m01..W-m06 đã kiểm lại ở HEAD: đều Closed (không còn 「桜 七郎」, C-11 / C-9 khớp badge, ID con có trong WF MD, SC-06-02 biến thể C chỉ đổi 相対-0005, `X-MFA-Token` ở bước 13 RULE_VERSION).

## 5. Trả lời ba điểm PL nêu

**(a) W-m03 làm đổi kỳ cả màn SC-09-04 sang 2027-09.** Chấp nhận. Đã kiểm: HTML (4 biến thể), WF MD (ASCII + bảng trạng thái), SPEC §4.1 [1], ảnh annotated đều cùng kỳ 2027-09, 支払期日 2027/10/08 (10/10 Chủ nhật lùi về thứ Sáu), 業務日 10/13 → khóa 10/14; B12 後入力 08/31 ¥200,000 đúng nghĩa TV-13 (GD sau go-live, kỳ 08 đã khóa → vào kỳ 09); nhãn 移行期 đã bỏ đúng chỗ, chỉ giữ ở quy tắc chung SC-09-04 §4.1 [2] cho kỳ migrate. Ví dụ JSON ở `API-INC-002_API.md:54` vẫn dùng kỳ 2027-08 — ví dụ API độc lập với ví dụ màn, không cần đổi. Ngày khóa kỳ 09 ở TV-13 (10-13) khác ảnh (10/14) — hai bộ dữ liệu ví dụ khác nhau, không sai, không cần sửa.

**(b) README §4.3 "người dùng quyết không mở rộng" chưa có DEC / dòng PREMISE.** Cần thêm — xem G3-M01 (kèm sửa gán vai L4-D07 ở AI-report).

**(c) Commit `bbd8cea` không chứa PDF tổng.** Không phải lỗi: commit message của `bbd8cea` đã nói rõ "The combined PDF is re-rendered in the follow-up commit", và `c28d904` có PDF đủ 15 trang. QC-01 không đòi từng commit trung gian đầy đủ; bản release là HEAD. Không cần sửa lịch sử.

## 6. Khuyến nghị cho bản JA và gói nộp

**Gói nộp** (README, PREMISE, AI-report, `specs/`, `architecture/`, `wireframes/`, `ja/`, không kèm prototype):

1. **Thêm `requirements/` và `scripts/` (3 script LAB-4) vào gói.** README §1, §4.1, §4.2, §5 đều trỏ tới hai thư mục này; thiếu thì người chấm gặp link chết ngay ở bảng điều hướng, và mất bằng chứng "một nguồn → nhiều đầu ra". Giữ `wireframes/html/_shared/` — HTML không mở đúng nếu thiếu.
2. **README trong gói chỉ giữ phần LAB-4 (dòng 1–165).** Phần "GitHub Project Management Template" trỏ tới `.github/`, `webhook/`, `docs/` không có trong gói. Ba link `prototype/…` ở README:1, :25 đổi thành URL repo GitHub + nhánh `ver/lab-4` (đường dẫn `prototype/README.md` trên GitHub), **không** kèm mật khẩu (G3-M03). Ngoại lệ #1 (README:42) nói "một repo để reviewer xem prototype và thiết kế cạnh nhau" — thêm câu "gói nộp tách riêng; prototype xem ở repo".
3. Thêm `AI-report-evidence/` theo G3-M02.
4. Không kèm `prototype/plans/` (untracked) và `.bot-test/`.
5. Sau khi dịch: cập nhật README §4.1 (thêm `ja/`, `AI-report-evidence/`), AI-report §4.2 dòng 128 ("Bản tiếng Nhật chưa làm") và §3.1 (thêm dòng Gate 3 + cách review bản dịch).

**Bản JA (`tkm:translate-file`):**

6. **Bảng thuật ngữ bắt buộc cho người dịch — rủi ro luật 2.** Tiếng Việt dùng "duyệt" cho mọi việc phê duyệt nội bộ; máy dịch rất dễ ra 承認. Phải ép: duyệt nội bộ → 決裁 (修正申請, 1次 / 2次) hoặc 確認 (checker quy chế, gia hạn), theo L4-D03; 承認 **chỉ** cho 売買参加者; 許可 chỉ cho 仲卸. Sau khi dịch, grep 承認 trong `ja/` và soát từng chỗ như tôi đã làm với 15 HTML.
7. Giữ nguyên: mọi ID (FR-/BR-/PRM-/DEC-/L4-/SC-/TV-/E-CMN-…), tên file, tên bảng / cột / hàm, khóa JSON, khối Mermaid (chỉ dịch nhãn trong ngoặc nếu cần), nhãn `[Giả lập]` → dịch thành một nhãn cố định (vd 「[模擬顧客回答]」) chứ không bỏ — bản nộp cho người chấm phải giữ tính trung thực.
8. Không dịch `_templates/` (chuẩn công ty, giữ nguyên bản gốc) — `ja/` không chứa thư mục này hoặc chỉ trỏ về bản gốc.
9. Ảnh: `ja/` dựng cùng cây thư mục nhưng link ảnh trỏ ngược về `../…/assets/` (không nhân bản PNG). Ảnh wireframe / annotated đã là tiếng Nhật, dùng chung được. **15 PNG sequence của Technical Design đang có nhãn tiếng Việt** — nếu muốn bản JA trọn vẹn thì xuất lại từ khối Mermaid đã dịch (script hiện chỉ quét `specs/`, cần tham số đường dẫn); không thì ghi một câu ở README JA "sơ đồ PNG giữ nhãn tiếng Việt, khối Mermaid trong file là bản dịch".
10. Dịch xong chạy lại script kiểm link trên `ja/` (link anchor tiếng Việt `#3-mã-lỗi-…` sẽ đổi theo tiêu đề dịch — dễ gãy hàng loạt).

## Điều kiện để release

1. Sửa **G3-M01** (L4-D08 + DEC-058, README:126, AI-report:85) và **G3-M02** (bằng chứng vào gói, sửa AI-report:15-20) trước khi dịch JA — dịch sau khi sửa để không phải dịch hai lần.
2. Sửa G3-m01, m02, m03, m06, m10 cùng lượt (sửa chữ, 15 phút). G3-m04, m05, m08, m09 nên sửa cùng lượt; G3-m07 chờ người dùng quyết.
3. **G3-M03** phải xong trước khi public repo ở LAB-5 (không chặn nộp LAB-4).
4. Đóng gói theo mục 6 (1–5); bản JA theo mục 6 (6–10), bắt buộc mục 6 điểm 6.
5. Expert chỉ cần kiểm diff của các file nêu trên + grep 承認 trên `ja/`; không cần review lại toàn bộ.

## Điểm làm tốt (ngắn, cụ thể)

- README §4.2 phân loại 4 mức (kế thừa nguyên / kế thừa có thêm / theo khuôn có điều chỉnh / tạo mới) và mọi nhận định về chuẩn đều kiểm được: 12/12 khuôn giống byte với `72c1dda`, ISS-36, commit bỏ `00-overview` — không có câu nào bịa.
- 118 dòng index khớp version 100%, 0 link gãy trong phần thiết kế, 0 chuỗi chép nguyên văn RFP — nhất quán ở mức hiếm thấy cho một bộ ~150 tài liệu viết bởi ba luồng song song.
- 完納奨励金 thực sự tách task được: 9 khối K1–K9, mỗi khối một DoD trỏ test vector cụ thể có số đã được tính lại độc lập.
- AI-report trung thực đúng chỗ khó: ghi rõ skill nào **không** chạy thật, Expert không đọc hết spec, Customer là AI, và vụ mất file do script — không tô vẽ.
- PREMISE tách độ chắc `RFP` / `KH-GL [Giả lập]` / `PL` cho từng giả định và có cột "nếu sai thì sao" — đúng tinh thần luật 7.

**Tổng:** Critical 0 · Major 3 · Minor 10.

---

## Kiểm diff 68bc277 (2026-11-26)

Phạm vi (theo chỉ định của người dùng): `git diff d1dbf12..68bc277` ở `lab-wholesale-market`, nhánh `ver/lab-4` (27 file, +1.576 / −40). Kiểm điều kiện release ở trên: G3-M01, G3-M02, G3-m01..m06, m08..m10. G3-M03 và G3-m07 người dùng quyết — không tính vào verdict.

Soi kỹ theo yêu cầu: (1) §6.1 "Trạng thái màn" mới ở SC-03-01, 03-05, 04-01, 05-02 so từng dòng với §5 Event + bảng mã lỗi §3 của LOT_FUNC / TRADE_FUNC; (2) AI-report §3.2 so với cột "Người quyết" của PREMISE §5 và `decision.md`; (3) `AI-report-evidence/` — bí mật, dữ liệu thật, trích đúng phần LAB-4; (4) link gãy mới.

**Verdict: RELEASE Gate 3 — cho phép dịch JA.** Critical 0 · Major 0 · Minor mới 0 · ghi chú nhỏ 5 (D3-n01..n05, không chặn).

### Cách kiểm (bằng máy)

- **Bằng chứng = nguyên văn:** `cmp` 5 báo cáo Expert + 3 file Customer với bản gốc ở `project/07_feedbacks/`: **8/8 giống byte**. 4 brief / ghi chú gộp: 2 giống byte, 2 khác **đúng 4 dòng** — chỉ thay tên user Windows (cả dạng 8.3) bằng `<user>`, không đổi chữ nào khác.
- **Trích log đúng phần LAB-4:** 19/19 dòng DEC trong `decision-lab4-excerpt.md` và 145/145 dòng FB trong `feedback-list-lab4-excerpt.md` có **nguyên văn** trong file gốc. Dải ID khớp README nguồn gốc: FB-EXP 217..239, 253..268, 275..308; FB-CUS 218..239, 260..309. Đã mở các dòng bị bỏ: FB-EXP-240..252, 269..274 (deck / báo cáo upsale), FB-CUS-240..259 (QA-L3, scoring) — đúng là LAB-3. `progress-lab4-ai-report-notes.md`: 12/22 dòng nội dung có nguyên văn trong `progress-lab4.md`; 10 dòng còn lại là tiêu đề / dòng dẫn PL thêm ("Từ mục: …") — đúng như file tự ghi. Ghi chú (1)–(18) đủ.
- **Bí mật / dữ liệu thật:** quét mật khẩu, khóa API, chuỗi dạng JWT / `sk-`, `supabase.co`, `service_role`, email, `vercel.app`, `drive.google`, `github.com`, tệp biến môi trường và đường dẫn `C:\Users\…` trên cả 16 file: **0** đường dẫn cá nhân, **0** URL, **0** email, **0** khóa. Chỗ nhắc mật khẩu duy nhất: DEC-030 dùng `<DEMO_ACCOUNT_PASSWORD>` (có sẵn trong bản gốc, không phải PL che) và báo cáo Gate 3 chỉ nói "mật khẩu nằm ở `prototype/README.md:17`", không chép giá trị.
- **Link:** quét link tương đối trong 11 file sửa + 16 file bằng chứng: **0 link gãy**. Link `docs/status-transition-spec/…` của template (G3-m04) đã thành chữ thường, không còn là link.
- **§6.1 có ở cả 12 SPEC** (grep `### 6.1`): đúng câu README ngoại lệ #10 mới viết.
- Version: 4 SPEC + `_common-layout` tăng PATCH, History có dòng, `specs/_index.md` / `wireframes/_index.md` khớp.

### Kết quả từng điều kiện

| # | Điều kiện | Kết quả | Bằng chứng |
|---|---|---|---|
| G3-M01 | L4-D08 + DEC-058; README :64, §4.3; AI-report §3.2 đúng vai | **Closed** | PREMISE 0.6.3 :181 (người quyết: Người dùng; phương án bỏ; lý do), §0 sửa định nghĩa `L4-Dxx`; DEC-058 người quyết "Người dùng"; README :64 `L4-D01..D08`, §4.3 trỏ L4-D08 / DEC-058 và ghi L4-D07 là PL. AI-report §3.2 tách "Người dùng quyết" / "PL quyết" — đối chiếu 13 DEC-046..058: mọi DEC được nêu đều đúng cột người quyết (046, 047, 049, 050, 058 = người dùng; 051, 052, 053, 054, 056 = PL) |
| G3-M02 | Bằng chứng vào gói, AI-report trỏ vào | **Closed** | `AI-report-evidence/` 16 file + README nguồn gốc từng file + lưu ý `[Giả lập]`; AI-report :15-20 trỏ link tương đối, §4.1 dòng cuối trỏ đúng thư mục; README §4.1, §4.2 có dòng |
| G3-m01 | 58 → 60 bảng | Closed | `grep "58 bảng" README.md` = 0 |
| G3-m02 | Thứ tự ngoại lệ 1→11 | Closed | README §3 |
| G3-m03 | Câu ngoại lệ #11 | Closed | Viết lại đúng đề xuất |
| G3-m04 | `docs/` không kèm | Closed | README :27 + link template thành chữ thường |
| G3-m05 | Vị trí phân quyền / trạng thái | Closed (cách nhẹ + thêm §6.1) | README #10 liệt kê 6 + 6 file; §6.1 ở 4 SPEC luồng 1 — xem soát chi tiết dưới |
| G3-m06 | C-22 400 → 422 | Closed | `_common-layout` 0.2.1, index 0.2.1 |
| G3-m08 | Ngoại lệ #3 commit thẳng | Closed | README §3 #3 |
| G3-m09 | Dòng 7 `specs/{feature}/README.md` | Closed | README §4.2 |
| G3-m10 | `related` PREMISE | Closed | Thêm DEC-046..051, 056, 058 |
| G3-M03, G3-m07 | — | Người dùng quyết (FB-EXP-298, 305 "Hỏi lại") | Không tính vào verdict. G3-M03 vẫn **chặn public repo ở LAB-5** |

### Soát §6.1 "Trạng thái màn" với §5 Event + mã lỗi

| SPEC | Kết quả | Ghi chú |
|---|---|---|
| SC-03-01 | Khớp 12/12 dòng | `E-LOT-006` 409, `E-LOT-007` 409, `E-CMN-003` 423 đúng bảng LOT_FUNC §3; offline đúng L4-A05 (PC không lưu offline) |
| SC-03-05 | Khớp 10/10 dòng | `E-LOT-013` 409 / `E-LOT-011` 422 xếp chung "Xung đột" đúng như §5. Xem D3-n01 |
| SC-04-01 | Khớp 13/13 dòng | `E-TRD-001/002/012` 409, `003..006`, `008` 422 đúng TRADE_FUNC §3. Xem D3-n02 |
| SC-05-02 | Khớp, 1 dòng gộp hơi rộng | Xem D3-n03 |

### Ghi chú nhỏ (không chặn release; nên sửa trước khi dịch nếu tiện — sửa sau thì phải sửa cả `ja/`)

| # | File:vị trí | Vấn đề | Cách sửa |
|---|---|---|---|
| D3-n01 | `SC-03-05_SPEC.md` §6.1 dòng "Ngày đã khóa" | Chỉ ghi "C-24, chỉ đọc, giữ nội dung". C-24 chung (`_common-layout`) có nút 「修正申請を作成 →」, nhưng §5 nói 目利き ở ngày khóa **không có đường 修正申請**. Dev đọc §6.1 + C-24 dễ hiện nút | Thêm "không hiện nút 修正申請 (目利き không đổi tiền — §5)" |
| D3-n02 | `SC-04-01_SPEC.md` §6.1 dòng "Vượt 参加上限", "Lỗi nhập" | Dòng vượt hạn mức không ghi mã server `422 E-TRD-007` (§5 có); dòng lỗi nhập không nhắc lỗi client `E-TRD-009..011` ở §4.2 (SC-03-01 §6.1 có ghi "mã lỗi ở §4.2") | Thêm "(server: 422 `E-TRD-007` → mở [13] với số server trả)"; thêm "lỗi client ở §4.2" |
| D3-n03 | `SC-05-02_SPEC.md` §6.1 dòng "Xung đột" | Gộp 409 `E-TRD-013/018` và 422 `E-TRD-015/016` thành "C-23 + nạp lại". Theo §5: `E-TRD-015` **tô các dòng chưa xử lý** (không nói nạp lại — nạp lại thì mất chỗ tô); `E-TRD-013` → chỉ đọc; `E-TRD-018` → dòng chuyển [5] | Tách 2 dòng: 409 (`013` → nạp lại, chỉ đọc; `018` → nạp lại, dòng sang [5]) và 422 (`015` → tô dòng chưa xử lý; `016` → C-23) |
| D3-n04 | `AI-report.md` §3.2 "PL quyết" | Không nêu DEC-048 (phần thêm do sửa Gate 1 nằm trong buffer, **không đổi giá** — PL quyết), DEC-055, DEC-057. Không sai (câu dẫn nói "phần còn lại PL tự quyết"), nhưng DEC-048 là quyết định về giá — người chấm sẽ hỏi ai chốt | Thêm "giữ giá R1, phần thêm nằm trong buffer (DEC-048)" vào danh sách PL quyết |
| D3-n05 | `AI-report-evidence/expert-review/expert-review-lab4-gate3-261125.md` | Bản sao chụp trước mục "Kiểm diff 68bc277" này, nên gói nộp không có bằng chứng Gate 3 đã đóng — trong khi AI-report §3.1 dòng Gate 3 ghi "Sửa 2 Major + 9 Minor" | Chép lại file này vào `AI-report-evidence/` sau khi có mục này; thêm vào AI-report §3.1 dòng "Gate 3 kiểm diff → RELEASE" khi cập nhật sau dịch (cùng lượt với điểm 5 mục 6) |

Ngoài phạm vi diff (có từ trước, không tính): SC-05-02 §5 không có dòng `409 E-TRD-012` (trước giờ chốt) dù TRADE_FUNC §3 gán mã này cho SC-05-02 [9] — để LAB-5 khi tách task.

### Điều kiện còn lại

1. Dịch JA theo mục 6 điểm 6–10 (bắt buộc điểm 6: bảng thuật ngữ 決裁 / 確認 / 承認 / 許可; dịch xong grep 承認 trong `ja/`). Expert kiểm `ja/` ở lượt sau: grep 承認 + link.
2. Đóng gói theo mục 6 điểm 1–5; điểm 5 gồm cả D3-n05.
3. G3-M03 xong trước khi public repo ở LAB-5; G3-m07 người dùng quyết.

### Điểm làm tốt trong lượt sửa

- Bằng chứng đúng là bản sao: 8/8 giống byte, 164/164 dòng trích log có nguyên văn, chỉ che tên user Windows — không "làm đẹp" câu chữ của Expert / Customer.
- AI-report §3.2 giờ nói rõ cả chỗ PL tự quyết (L4-D07 theo Expert), không đẩy hết công sang người dùng — trung thực hơn bản trước.
- §6.1 ở 4 SPEC là bảng tổng hợp đúng nghĩa: mỗi dòng truy về một hàng §5, mã lỗi và HTTP status khớp bảng §3 của FUNC.

**Tổng kiểm diff:** Critical 0 · Major 0 · Minor 0 · ghi chú 5. Verdict: **RELEASE Gate 3 (cho phép dịch JA)**.
