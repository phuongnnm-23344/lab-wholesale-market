---
id: DOC-PREMISE-001
title: Tiền đề thiết kế LAB-4 (PREMISE)
type: premise
version: "0.6.3"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [DEC-002, DEC-004, DEC-005, DEC-008, DEC-028, DEC-029, DEC-031, DEC-032, DEC-033, DEC-046, DEC-047, DEC-048, DEC-049, DEC-050, DEC-051, DEC-056, DEC-058, PRM-042, PRM-046, PRM-110, PRM-126, PRM-127]
---

# Tiền đề thiết kế LAB-4 (PREMISE)

Tài liệu này ghi những quyết định đặt thêm sau LAB-1 (estimate + proposal) và LAB-2 (prototype chạy thật) để làm nền cho bộ thiết kế LAB-4. Mọi tài liệu trong `architecture/`, `wireframes/`, `specs/` phải khớp với tiền đề ở đây; chỗ nào lệch thì sửa tài liệu đó hoặc nâng version file này, không để hai nơi nói khác nhau.

## 0. Cách đọc

| Ký hiệu | Nghĩa |
|---|---|
| `FR-` `NFR-` `BR-` `SCOPE-` `ACC-` `GOV-` `CAP-` `TBL-` … | ID trong RFP của khách (bản `v1.0-rc7`). Tài liệu này chỉ dẫn ID và diễn đạt lại ý, không chép nguyên văn RFP |
| `DEC-xxx` | Quyết định đã duyệt trong nhật ký quyết định của dự án (LAB-1, LAB-2) |
| `PRM-xxx` | Tiền đề estimate LAB-1 (前提条件, có trong 付録A của 概算見積書 gửi khách) |
| `E-xx` | Câu hỏi gửi khách (確認事項一覧) chưa có câu trả lời thật |
| `SC-xx-yy` / `FT-xx-yy` | ID màn hình / chức năng của 画面一覧 và 機能詳細一覧 LAB-1 |
| `M01`–`M24` | Phần prototype LAB-2 làm giả hoặc giản lược (danh sách mock bản 1.2) |
| `L4-Axx` | Giả định mới đặt ở LAB-4 (mục 3) |
| `L4-Dxx` | Quyết định đã chốt ở LAB-4 (mục 5; cột "Người quyết" ghi người dùng hay PL) |
| **[Giả lập]** | Tiền đề dựa trên câu trả lời của khách hàng giả lập (agent đóng vai khách) — là giả định có căn cứ, **không phải** khách thật đã xác nhận. Khách thật chỉ có RFP |
| Độ chắc | `RFP` = RFP đã quy định · `KH-GL` = khách giả lập **[Giả lập]** · `PL` = Sun* tự đặt, chưa ai xác nhận |

Thuật ngữ nghiệp vụ: 相対取引 (thỏa thuận mua bán trực tiếp — luồng chính, ~90% giá trị), せり (đấu giá — luồng phụ, ~10%), 仲卸 (người bán buôn trung gian, cần **許可** — giấy phép có xét duyệt), 売買参加者 (người tham gia mua bán, cần **承認** — chấp thuận, thủ tục nhẹ hơn), 完納奨励金 (tiền thưởng thanh toán đủ, đúng hạn), 日次締め (khóa ngày nghiệp vụ), 修正申請 (yêu cầu điều chỉnh sau khi chốt), 目利き (đánh giá chất lượng / độ tươi bằng mắt).

---

## 1. Hướng đi đã chốt cho LAB-4 (một hướng duy nhất)

### 1.1 LAB-1 đã có những hướng nào

| Chỗ LAB-1 có nhiều hướng | Các hướng | Trạng thái cuối LAB-1 |
|---|---|---|
| Pattern phạm vi | A (tối thiểu ~70 MM) · B (đủ P0+P1 ~80 MM) · C (B + option) | Chỉ còn **một plan "Baseline đủ P0+P1"**; option thành dòng giá riêng (DEC-006 → DEC-008) |
| Giá ký so với trần 60M JPY | Trần 62,5M + mục tiêu sau gate G1 với buffer 10% (DEC-019, DEC-021, DEC-022) · gói cắt R1 / R2 / R3 | **R1**: giá ký cố định 59.821.965 JPY 税抜, buffer 15%, bỏ hẳn cơ chế G1 10% (DEC-031, DEC-032) |
| Phần đơn giản hóa ở 第1期 | 17 mục 「第2期以降にご提案」 (vd. trang cho người tham gia bên ngoài, màn tham số vận hành) | Nằm ngoài 第1期, có cách làm thay thế ở 第1期 (概算見積書 §7.1) |
| Option | 15 dòng (giao dịch từ xa + portal người mua, phân tích/dự báo, AI suggestion-only, tem/quét mã lô, …) | Tách giá, ngoài trần (luật 6, PRM-024) |
| Nền tảng production | AWS Tokyo managed (chính) · Vercel + Supabase (dự phòng) | Proposal và TCO theo **AWS Tokyo** (DEC-002, DEC-018); prototype LAB-2 chạy Vercel + Supabase |

### 1.2 Chốt

**LAB-4 thiết kế đúng phạm vi 第1期 theo hợp đồng LAB-1 bản cuối (gói R1):**

| Mục | Giá trị chốt | Nguồn |
|---|---|---|
| Phạm vi chức năng | P0 + P1, SCOPE-01..06 · **99 chức năng (FT) / 70 màn hình + 10 batch** | DEC-008, DEC-031 |
| Effort / giá (để đối chiếu, LAB-4 không estimate lại) | 74,313 MM trước buffer · 59.821.965 JPY 税抜 / 65.804.162 税込 · buffer 15% cố định | DEC-031, DEC-032 |
| Đơn giản hóa 第1期 đã cam kết | K1 tham số vận hành → file cấu hình, không có SC-10-06 (PRM-126) · K2 取引取消 là nút riêng trên SC-04-05 (PRM-127) · K3 sửa thuộc tính lô trên SC-03-04 (PRM-128) · K4 代行者 là tab trong SC-02-03 (PRM-129) · K7 thông báo trên SC-00-03 (PRM-130) | DEC-031 |
| Option + 17 mục 第2期 | **Không thiết kế chi tiết.** Kiến trúc chỉ chừa điểm mở rộng có tên (vd. ranh giới cho trang người ngoài, ranh giới AI suggestion-only luôn qua người chốt) | Luật 6; SCOPE-OUT-03/04/06; CAP-HUMAN-01 |
| Nền tảng to-be | **AWS Tokyo managed** theo DEC-002; Vercel + Supabase là phương án đã bỏ (ghi ở ADR), prototype LAB-2 chỉ là bản thử | DEC-002; L4-D01 (mục 5) |

**Lý do chọn hướng này:**

1. Đây là phạm vi đã ký với khách trong kịch bản LAB-1; thiết kế khác phạm vi đó thì LAB-5 break ra task không khớp hợp đồng.
2. Các hướng khác của LAB-1 đều đã đóng bằng quyết định có ghi vết (DEC-008, DEC-031); mở lại là làm lại LAB-1.
3. Option và 第2期 để ngoài giúp giữ luật 6 (option luôn tách riêng phạm vi, giả định, chi phí, rủi ro) và tránh thiết kế thứ không ai trả tiền.
4. Prototype LAB-2 là bằng chứng chạy thật cho phần lõi, không phải phạm vi: chỗ nào prototype khác LAB-1 thì **LAB-1 thắng**, trừ khi có quyết định mới ghi ở mục 4.

---

## 2. Tính năng thêm / bỏ so với LAB-1

**Phạm vi chức năng không đổi: không thêm, không bỏ FT nào so với LAB-1 bản cuối.** LAB-4 chỉ đổi mức chi tiết thiết kế và sửa những chỗ prototype đã làm lệch LAB-1.

| # | Hạng mục | LAB-1 bản cuối | LAB-4 | Lý do | ID |
|---|---|---|---|---|---|
| 1 | Danh sách chức năng | 99 FT / 70 màn + 10 batch | Giữ nguyên; 画面一覧 LAB-4 liệt kê đủ 70 màn | Phạm vi hợp đồng | DEC-031 |
| 2 | Mức chi tiết thiết kế | — (LAB-1 chỉ có list) | **10 màn cốt lõi** có đủ Screen Specification + Function / Technical / API Design (thêm SC-06-04, SC-06-05 → 12 Screen Specification — L4-D07); wireframe to-be cho **10 màn cốt lõi + 4 màn bổ sung** (dòng 3) + SC-03-02 仮受付 ở P3 (L4-D05); **22 màn còn lại của prototype và mọi màn khác của 70 màn chỉ ở mức 画面一覧** (`wireframes/SCREEN-LIST.md`) | Đề LAB-4 không quy định số màn; phân bổ theo plan đã duyệt. Danh sách 10 màn: L4-D02 mục 5 | Plan LAB-4 §0; L4-D02 |
| 3 | 4 màn bổ sung wireframe (không có trong prototype) | Có trong 70 màn | SC-04-05 当日訂正（+取消）, SC-06-04 引渡し例外登録, SC-06-05 争いのある引渡し完了確認, SC-03-07 オフライン同期・照合 | Đây là chỗ prototype thay bằng mock (M04, M16, M17); thiết kế to-be phải lấp | FR-AITAI-03, CAP-HUMAN-01, NFR-AVL-02, DEC-004 |
| 4 | 参加上限 (hạn mức tham gia của 売買参加者) | Cảnh báo theo **kỳ hiện tại**, mặc định = 保証金額, bắt lý do, không chặn cứng | Theo LAB-1 (sửa lệch của prototype — M19) | Prototype tính theo 業務日 là giản lược | PRM-046, FT-01-09 |
| 5 | Ngưỡng duyệt 2 cấp của 修正申請 | Giá trị tạm 100.000 JPY, chờ E-08 | Là tham số **trong quy chế có version** (GOV-RULE-01), không phải hằng số, không phải màn SC-10-06 | Giá trị liên quan tiền phải có version + maker-checker (PRM-126); prototype để hằng số (M13) | E-08, PRM-126, GOV-RULE-01 |
| 6 | Tham số vận hành / thông báo | Không có màn SC-10-06; file cấu hình do IT khách sửa, có nhật ký thay đổi | Theo LAB-1 | Prototype mock M09/M13 còn ghi "cấu hình SC-10-06" — đã cũ so với R1 | PRM-126, DEC-031 |
| 7 | Option (15 dòng) + 17 mục 第2期 | Ngoài 第1期 | Ngoài thiết kế chi tiết; chỉ là điểm mở rộng trong kiến trúc | Luật 6 | PRM-024, 概算見積書 §7.1, §9 |
| 8 | Cơ chế G1 buffer 10% | Đã bỏ | Không ảnh hưởng thiết kế | — | DEC-031 |

---

## 3. Giả định mới đặt ở LAB-4

Tiền đề LAB-1 (PRM-001..131) vẫn hiệu lực; dưới đây chỉ là giả định **thêm** cho việc thiết kế.

| ID | Giả định | Độ chắc | Căn cứ | Nếu sai thì sao |
|---|---|---|---|---|
| L4-A01 | Nền tảng to-be (đã chốt ở L4-D01): AWS Tokyo managed (Next.js + TypeScript, PostgreSQL managed Multi-AZ, lưu file object storage), modular monolith. Mô hình dữ liệu và quy tắc ghi qua hàm trong DB của prototype được giữ vì chạy được trên PostgreSQL thường; phần gắn với Supabase (Auth, RLS theo JWT Supabase, Storage) có lớp thay thế | Người dùng chốt (L4-D01); khách đồng ý **[Giả lập]** (tài khoản cloud đứng tên khách, dữ liệu ở Nhật, chi phí định kỳ không vượt TCO đề xuất) | DEC-002, NFR-AVL-01 (99,5% trong 02:00–10:00 JST), NFR-AVL-03 (RTO ≤ 4h, RPO ≤ 15 phút), DR-RET-01 (lưu 7 năm) | Chọn Vercel + Supabase → ADR nền tảng, kiến trúc vật lý, backup/DR đổi; thiết kế màn và nghiệp vụ không đổi |
| L4-A02 | Fixture dữ liệu mẫu của khách (Appendix C) vẫn chưa có → kiểu, độ dài cột theo bảng dữ liệu trong RFP (TBL-*) + bảng thật của prototype. Dữ liệu ví dụ trong spec là giả và **trông rõ là giả** (mã hư cấu). Khi có fixture (khách nhắm gửi 2026-12-01 **[Giả lập]**), tính lại các ví dụ 完納奨励金 trong Technical Design bằng bảng tỷ lệ thật | PL; khách đồng ý **[Giả lập]** | E-03, DEC-028; FB-CUS-238 | Fixture về khác kiểu / độ dài → sửa Database Design (tăng MINOR), không đổi luồng |
| L4-A03 | Câu hỏi E-01..E-21 chưa có câu trả lời thật. Giá trị phụ thuộc câu trả lời được tách khỏi code, **xếp chỗ theo bảng §3.1**: thứ đụng tới tiền, 支払期日, khóa sổ, 業務日, 完納 nằm trong **quy chế có version** (GOV-RULE-01); thứ thuần vận hành nằm ở **file cấu hình có nhật ký** (PRM-126). Đổi một tham số trong quy chế **tính là một lần** trong 4 lần/năm; bộ giá trị cài lúc go-live là version đầu, **không tính**. **E-14 không phải tham số** — là quy tắc quản trị, ban lãnh đạo quyết một lần ở workshop rồi cố định trong thiết kế (xem §6) | PL; khách đồng ý có điều chỉnh **[Giả lập]** | Luật 5, luật 7; GOV-RULE-01, NFR-OPS-02, RACI-01; FB-CUS-218..220 | Câu trả lời ngoài các nhánh đã dự liệu → CR theo CR-01..12 của LAB-1 |
| L4-A04 | Ba điểm khách chưa trả lời chính thức: **(1) せり vượt 参加上限**: cảnh báo và lý do đặt ở bước xác nhận kết quả (SC-05-02), không chặn cứng; **chỉ áp cho 売買参加者**, không cho 仲卸; hạn mức là **một số chung cho 相対 + せり trong cùng kỳ**; lý do chọn nhanh từ danh sách có sẵn + ghi chú; cho áp cùng một lý do cho các dòng của một người mua trong phiên nhưng vẫn lưu từng dòng (Muốn có); danh sách người gần / vượt hạn mức trước phiên là để sau. **(2) Gán tiền vào kỳ**: kỳ = tháng dương lịch theo **業務日** của GD gốc (業務日 D = [D 01:00, D+1 01:00) JST, 01:00 = giờ nhận lô — ADR-005 §2.2), không theo giờ đồng hồ lúc chốt và **không theo ngày áp của điều chỉnh**: REVERSE / DELTA mang ngày áp (ghi sổ) và kỳ của GD gốc; kỳ gốc còn OPEN → vào 期のお支払額 kỳ đó, kỳ gốc đã khóa → chỉ đi DELTA; sửa sau 期ロック → tính lại kỳ cũ theo version kỳ cũ, chênh lệch thành delta ở kỳ đang khóa — **mọi kỳ đã khóa, kể cả năm TC trước**; giới hạn năm TC chỉ cho việc trừ dần delta âm; không hồi tố 完納 trừ 修正申請 KANNO duyệt 2 cấp (PRM-055); 入金 sau 支払期日 vẫn gán kỳ cũ nhưng kỳ đó không 完納; FIFO khi chưa có 請求番号, màn 期ロック hiện rõ tiền đã gán vào kỳ nào. **(3) Đếm 4 lần/năm** theo năm TC (4月→3月) của ngày hiệu lực, không tính bản nháp hủy trước hiệu lực và bộ giá trị go-live; **version mới thứ 5 bị chặn**; **rollback khi đã đủ 4 lần: chưa chốt, chờ workshop E-14** — thiết kế vẽ cả hai nhánh (§6) | PL + KH-GL **[Giả lập]**; phần thêm ở 0.5.0 trong (2) — hai trục thời gian, tính lại qua năm TC, KANNO — là **[PL 0.5.0, theo Gate 1 C-01 / C-02]**, khách chưa thấy | PRM-042, PRM-043, PRM-046, BR-INC-01, GOV-RULE-01, CAP-HUMAN-01, FORM-SERI-01, ACT-03; E-02, E-14; FB-CUS-221..227 | (1)(2) khách nói khác → sửa Technical Design 相対 / せり / 完納奨励金; (3) xem §6 |
| L4-A05 | Offline: lưu cục bộ + hàng đợi đồng bộ + màn đối chiếu chỉ cho 仮受付, 引渡し, 紙伝票後入力; **chốt giao dịch (相対, xác nhận せり) bắt buộc online** để kiểm 許可 / 承認 và SL tại thời điểm chốt. Màn hình báo rõ đang mất mạng và số bản ghi chưa đồng bộ; đồng bộ lại không làm SL lô âm (BR-LOT-02); màn khóa ngày đếm máy còn bản ghi chưa đồng bộ | RFP + PL | DEC-004, NFR-AVL-02, BR-PERM-01, BR-LOT-02 | — (đã duyệt ở LAB-1) |
| L4-A06 | Quyền **đọc** theo đủ ma trận vai × màn (cột 閲 của role-list), không giản lược như prototype | RFP | TBL-ROLE-01, M18 | — |
| L4-A07 | MFA hỏi ngay trước các hành động **liệt kê ở §3.2** (step-up); làm việc thường ở hiện trường bằng PIN 4 số trên máy dùng chung. Sau một lần MFA có hiệu lực **10–15 phút cho cùng người, cùng máy**; đổi người trên máy dùng chung là hết hiệu lực. **Tài khoản quản trị (システム管理者) MFA ngay khi đăng nhập.** ADR xác thực phải có phương án nhận mã cho người không dùng điện thoại riêng (công ty không cấp điện thoại). Mất mạng không duyệt được → xác nhận giao có tranh chấp đi đường giấy có chữ ký 配送部門責任者, nhập bù và duyệt có MFA sau | KH-GL **[Giả lập]** | PRM-088, PRM-112, PRM-113 (diễn giải NFR-SEC-01, chờ E-15), NFR-SEC-03, CAP-HUMAN-01; FB-CUS-228..232 | E-15 yêu cầu MFA mọi lần đăng nhập → đổi luồng đăng nhập, ±0,1–0,2 MM theo LAB-1; khách muốn được hỏi lại trước khi đổi |
| L4-A08 | Người tham gia bên ngoài ở 第1期 không có tài khoản, chỉ nhận email (tối đa 2 địa chỉ) và danh sách in tại quầy. **Bảng tuân thủ ghi "đáp ứng một phần"** cho 02-05, BR-NOTIFY-01 (phần người ngoài), SEC-IAM-02, kèm cách thay ở 第1期 và việc để 第2期; chính sách SEC-IAM-02: 第1期 không có đăng nhập người ngoài, 第2期 OTP email mỗi lần đăng nhập. Email tối thiểu: kỳ, số tiền phải trả, 支払期日, tài khoản nhận tiền, câu về phí chuyển khoản, đổi trạng thái tư cách (一時停止 / 失効 / phục hồi), báo trước 30 ngày trước 失効日, kết quả 完納奨励金 từng kỳ; 買出人 chỉ nhận báo sắp hết hạn. **Gửi lại tối đa 3 lần**; lỗi hẳn → tự vào danh sách in ở quầy hôm sau và danh sách "chưa gửi được" cho 照合. Đổi email chỉ do nhân viên chợ làm theo giấy yêu cầu, có lịch sử | KH-GL **[Giả lập]** | DEC-019, PRM-050, PRM-122, 02-05, BR-NOTIFY-01, SEC-IAM-02, FR-NOTIFY-01, FR-AUDIT-01; FB-CUS-233..236 | Tỷ lệ 買出人 không có email chưa có số (khách đoán ~1/3 **[Giả lập]**) → ảnh hưởng độ dài danh sách in, không đổi thiết kế |
| L4-A09 | Mốc ví dụ trong spec: ký 2026-12-01, go-live 2027-08-01 (Chủ nhật, 休市日; rehearsal không đạt thì dời đầu tháng 9 — không viết như ngày chắc chắn). Ví dụ trong spec chọn trúng **ngày biên**: lô nhận 01:30 ngày đầu tháng (thuộc 業務日 ngày 1 → kỳ mới; GD chỉ chốt từ 02:00 nên không có "GD 01:30 thuộc kỳ trước"); chuyển năm TC 3/31 → 4/1 (bộ đếm 4 lần reset; GD tháng 3 sửa sau khi sang năm TC mới vẫn sinh delta; delta âm mang sang tới hết năm TC của kỳ ghi nhận); 支払期日 rơi ngày ngân hàng nghỉ (lùi về ngày ngân hàng mở trước — vd. 2028-06-10 thứ Bảy → 2028-06-09); 臨時休市 và tuần 年末; kỳ thưởng đầu sau go-live và 2 kỳ migrate | KH-GL **[Giả lập]**; ca biên viết lại ở 0.5.0 (lô 01:30, lùi theo ngày ngân hàng) là **[PL 0.5.0, theo Gate 1 M-01 / M-03]** | PRM-124, PRM-125, E-20, BR-INC-01; FB-CUS-237 | Chỉ đổi ví dụ |

---

### 3.1 Xếp chỗ tham số phụ thuộc câu trả lời của khách (L4-A03)

| Tham số | Nơi giữ | Tính vào 4 lần/năm khi đổi | Ghi chú | ID |
|---|---|---|---|---|
| Ngưỡng duyệt 2 cấp 修正申請 | Quy chế có version | Có | Giá trị tạm 100.000 JPY; so với **tiền thay đổi lớn nhất của một người mua** (税込), đổi 買受人 luôn 2 cấp **[Giả lập]**; cùng ngưỡng dùng cho dòng ✖ 当日訂正 ở checklist 日次締め | E-08, PRM-120; FB-CUS-262, FB-CUS-284 |
| Giờ bắt đầu nhận lô gắn vào 業務日 sáng đó (mặc định 01:00) — cũng là ranh giới 業務日 | Quy chế có version | Có | Đụng 業務日; giờ bắt đầu chốt GD (02:00) cũng nằm trong quy chế | E-16, PRM-116 |
| Quy tắc giao "khớp 精算" (「残り全部」) | Quy chế có version | Có | Đụng tiền | E-17, PRM-118 |
| 持ち越し lô khi khóa ngày | **Chưa xếp** — hỏi lại 運用部門 có làm đổi tiền không | — | Tạm thiết kế như quy chế (an toàn hơn) | E-12, PRM-110 |
| Cho bán trước 下見済 | **Chưa xếp** — như trên | — | Tạm bám FIG-011 (chỉ lô 下見済) | E-13, PRM-117 |
| Bảng tỷ lệ thưởng, công thức 支払期日 (ngày 10, rơi ngày ngân hàng nghỉ → ngày ngân hàng mở trước — Q-ARCH-11), giờ khóa | Quy chế có version | Có (trừ bộ go-live) | Bảng tỷ lệ chỉ hiệu lực từ ngày 1 của tháng (phương án hồi tố về đầu kỳ chưa khóa đưa ra workshop E-14 — ADR-006 §3 F, G) | GOV-RULE-01, PRM-039, PRM-042 |
| Lịch chợ–ngân hàng năm (1 bảng, 2 cờ; ルール管理者 nhập lịch năm sau một lần vào tháng 12, 照合部門長 duyệt) | Lịch (SC-10-05) — **dữ liệu master**, không phải version quy chế | **Không** | Công thức tính 期日 dùng lịch này vẫn nằm trong quy chế | PRM-054, PRM-042 |
| 臨時休市 / 臨時開市 | Lịch (SC-10-05), có duyệt gọn | **Không** **[Giả lập]** | Đổi trong ngày, không cần nhà thầu | 00-02, PRM-054, FB-CUS-239 |
| Nơi nhận / giờ gửi / mẫu câu thông báo, hạn SLA tranh chấp, cảnh báo sắp hết hạn, timeout máy, thời gian idle hết step-up, mức thiếu tiền để đánh dấu 「手数料差引の疑い」 (chỉ đánh dấu 要確認, không đổi tiền) | File cấu hình có nhật ký | Không | Đổi tài khoản nhận tiền trong mẫu câu phải có 照合部門長 hoặc 財務部門 xác nhận | PRM-126; ADR-002 §2.2, ADR-007 §2.6 |
| Mã thuế suất dùng để quy 参加上限 về 税込 (`PARTICIPATION_LIMIT_TAX_CODE`, mặc định 軽減税率 8%; suất lấy từ `tax_rates` có ngày hiệu lực) | File cấu hình (có nhật ký) | **Không** — thuế suất không phải quy chế chợ | So 参加上限 với 税込 = floor(Σ 税抜 × (100 + suất) / 100); không dùng 110/100 của BR-INC-01 (Q-TRD-02 [Customer giả lập, 2026-11-25]); hỏi 経理部 suất và có hai suất trong kỳ không | PRM-046, Q-TRD-02 |
| Rollback khi đã đủ 4 lần | **Không phải tham số** — cố định trong thiết kế sau workshop | — | Xem §6 | E-14 |

### 3.2 Hành động hỏi MFA và không hỏi (L4-A07) **[Giả lập]**

| Hỏi MFA (step-up, hiệu lực 10 phút cùng người cùng máy, hết khi không thao tác quá 3 phút; hành động có dấu ★ luôn hỏi lại mã) | Không hỏi MFA |
|---|---|
| Duyệt / từ chối 修正申請 (cấp 1 và cấp 2) | In danh sách sắp hết hạn ở quầy 受付 |
| ★ 日次締め, kể cả người khóa thay (代行); đánh dấu thiết bị 「端末回収不能」 | In / in lại 取引確認票 |
| ★ 期ロック 完納奨励金 (gồm chốt dòng 要確認) | Xem báo cáo thường |
| Xác nhận giao có tranh chấp (SC-06-05) | Đổi người bằng PIN trên máy dùng chung |
| ★ Checker quy chế, rollback quy chế, hủy version đã duyệt | Nhập GD, tiếp nhận lô, ghi giao hàng thường |
| 一時停止 / 失効 / phục hồi tư cách người tham gia; 決裁 cấp mới 許可, 確認 cấp mới 承認 [PL — ADR-003 §2.2]; 確認 期限前更新 (gia hạn) 許可 / 承認 **[Giả lập]** (FB-CUS-280); đổi 保証金 / 参加上限 — **chỉ 照合部門長**, một bước, không checker, có audit (Q-PTY-06, Q-PTY-07 [Customer giả lập, 2026-11-25]) | |
| Xuất CSV kế toán, xuất danh sách có dữ liệu cá nhân, xuất 監査ログ | |
| Mở khóa / đặt lại PIN cho người khác | |
| ★ 決裁 xóa vật lý chứng từ hết hạn lưu (B.7) | |
| *Tài khoản システム管理者: MFA ngay khi đăng nhập* | |

## 4. Prototype LAB-2 làm khác / giản lược → xử lý ở thiết kế to-be

Nguồn: danh sách mock M01–M24 của prototype (bản 1.2). "Nơi thiết kế" là tài liệu LAB-4 sẽ chứa phần xử lý; bảng lệch giữa bảng dữ liệu thật của prototype và Database Design to-be ghi riêng ở `specs/system-design/database-design/` (P2-B).

| Mock | Prototype đang làm | To-be | Nơi thiết kế | ID |
|---|---|---|---|---|
| M01 | Seed giả, cột `is_sample` | Không có cột `is_sample`; dữ liệu đầu vào từ migration (master + khoản còn mở + chi tiết 2 năm TC + 2 kỳ thưởng) | Database Design; kiến trúc (luồng migration) | DEC-005, E-03 |
| M02 | Không MFA | MFA step-up theo danh sách §3.2, hiệu lực 10–15 phút; quản trị MFA khi đăng nhập | ADR xác thực; spec SC-07-02, SC-08-03, SC-10-04, SC-09-04 | PRM-113, NFR-SEC-01 |
| M03 | PIN chỉ online | PIN offline gắn thiết bị, có hạn N giờ, offline không cho duyệt; phương án giấy | ADR offline; Technical Design đổi người | PRM-112, E-18 |
| M04 | Chỉ online | Hàng đợi cục bộ + đồng bộ + SC-03-07 đối chiếu; chốt GD bắt buộc online | ADR offline; wireframe SC-03-07 | DEC-004, NFR-AVL-02 |
| M05 | Chỉ hiện nội dung phiếu | In 取引確認票 qua máy in hiện trường là **điểm tích hợp** trong kiến trúc; mẫu in theo FORM | Kiến trúc (điểm tích hợp) | D.3, E-05, PRM-114 |
| M06 | Không có CSV kế toán | Batch IF-ACC-01 đóng băng lúc tạo, có dòng 端数調整, ánh xạ 仕訳 có lịch sử; định dạng chờ E-01 | Kiến trúc; Technical Design batch | PRM-123, PRM-053, DEC-012 |
| M07 | 入金 CSV định dạng giả, FIFO | Import có ánh xạ mã đối tác, gắn 請求番号 khi E-02 trả lời; FIFO là mặc định | Technical Design 入金 | FIG-013, E-02 |
| M08 | Thưởng giản lược, 1 thuế suất | Đủ BR-INC-01: 2 bảng tỷ lệ 5 bậc, thuế theo suất, 端数調整, 再審査 khi 消込 trễ (修正申請 KANNO, 2 cấp → DELTA có `correction_id`); tính lại **mọi kỳ đã khóa** có đầu vào đổi, không giới hạn năm TC. Delta âm trừ dần (CARRY) vào thưởng các kỳ sau tới hết năm TC của kỳ ghi nhận; phần âm còn lại cuối năm ghi dòng `CARRY_EXPIRED` và hiện ở RPT-07 để 照合部門 xử lý. **Technical Design 完納奨励金 riêng** | Technical Design 完納奨励金 | BR-INC-01, FR-INC-01..03, PRM-040..043, PRM-053, PRM-055 |
| M09 | Không thông báo | Email (nội dung tối thiểu, gửi lại ≤ 3 lần, lỗi → danh sách in + danh sách chưa gửi được — L4-A08) + khung thông báo ở SC-00-03; nơi nhận, giờ gửi, mẫu câu trong file cấu hình | Kiến trúc; spec SC-00-03 (wireframe) | PRM-126, PRM-130, FR-NOTIFY-01, BR-NOTIFY-01 |
| M10 | 業務日 do seed | SC-10-05 lịch chợ–ngân hàng; 業務日 D = [D 01:00, D+1 01:00) JST; hàm 日次締め mở ngày chợ kế tiếp, job 01:00 JST là lưới an toàn; lô nhận từ 01:00 gắn vào 業務日 sáng đó, chốt GD từ 02:00; 臨時休市 / 臨時開市 đổi được trong ngày, không cần nhà thầu, **không tính** vào 4 lần/năm **[Giả lập]** | Kiến trúc (job); wireframe SC-10-05 | PRM-116, E-16; FB-CUS-239 |
| M11 | Không đính kèm | Lưu file ở object storage, giới hạn dung lượng; **theo loại chứng từ TBL-ATTACH-01**: 受入票・取引票・照合表 online 7 năm, ảnh / chứng cứ tranh chấp và hồ sơ migration 3 năm → lưu lạnh; xóa vật lý sau hạn có 決裁 (B.7), không tự xóa; 第1期 chỉ scan/đính kèm ở PC, không chụp ảnh lúc tiếp nhận | Kiến trúc; ADR-009; Database Design | TBL-ATTACH-01, DR-RET-01, B.7, E-21 |
| M12 | Không báo cáo / PDF | 12 báo cáo cố định ở mức 画面一覧; kiến trúc có thành phần sinh báo cáo | 画面一覧; kiến trúc | FR-RPT-01..03 |
| M13 | Ngưỡng 2 cấp là hằng số | Tham số trong quy chế có version (mục 2 dòng 5) | Technical Design quy chế | E-08, GOV-RULE-01 |
| M14 | Supabase free | Theo L4-A01: backup PITR, Multi-AZ, giám sát, lưu 7 năm | Kiến trúc; ADR nền tảng | NFR-AVL-01, NFR-AVL-03, DR-RET-01 |
| M15 | 4 lần/năm theo PRM-042, lần 5 chặn cả rollback | Version mới thứ 5 chặn; rollback khi đủ 4 lần **chờ E-14**, Technical Design vẽ hai nhánh (§6) | Technical Design quy chế | PRM-042, GOV-RULE-01, E-14 |
| M16 | Chưa có ngoại lệ / tranh chấp giao | SC-06-04 ghi ngoại lệ; SC-06-05 配送部門責任者 xác nhận (MFA), cấm tự xác nhận lần giao do mình ghi | Spec / wireframe SC-06-04, SC-06-05 | CAP-HUMAN-01, PRM-111, FR-DEL-01..05 |
| M17 | Mọi điều chỉnh đi qua 修正申請 | GD chưa khóa ngày: 当日訂正 / 取消 trên SC-04-05, có lý do, giữ lịch sử, không cần duyệt 2 cấp; sau khóa ngày mới đi 修正申請 | Wireframe SC-04-05; Technical Design 訂正 | FR-AITAI-03, PRM-127 |
| M18 | Quyền đọc giản lược | Đủ ma trận đọc (L4-A06); spec ghi quyền hiển thị theo vai từng item | Spec màn; Database Design (policy) | TBL-ROLE-01 |
| M19 | 参加上限 theo 業務日 | Theo kỳ, mặc định = 保証金額 (mục 2 dòng 4) | Technical Design 相対 | PRM-046 |
| M20 | せり vượt hạn mức: lý do từng dòng | Giữ, thêm điều kiện L4-A04 (1): chỉ 売買参加者, hạn mức chung 相対 + せり, lý do chọn nhanh | Spec SC-05-02 | CAP-HUMAN-01, ACT-03 |
| M21 | Gán tiền theo ngày GD gốc | Giữ: theo 業務日 của GD gốc (cả với REVERSE / DELTA — ngày áp chỉ dùng cho sổ ngày); kỳ gốc đã khóa → DELTA; test vector FIFO và ngày biên (L4-A04 (2), §6, ADR-007 §2.7) | Technical Design 完納奨励金 | PRM-043, BR-INC-01, E-02 |
| M22 | Khóa PIN theo người đích | Thêm giới hạn theo thiết bị / người nhập, đếm sai hết hạn theo thời gian | Technical Design đổi người | NFR-SEC-03 |
| M23 | View quét toàn lịch sử | Truy vấn luôn có khoảng ngày, phân trang, index theo 業務日; xem xét chia bảng theo năm TC (đề xuất PL, chốt ở ADR) | Database Design; ADR | NFR-PERF-01, DR-RET-01 |
| M24 | Script reset xóa cả 監査ログ giả | Bản thật không có reset; 監査ログ chỉ thêm, không có đường sửa / xóa | Database Design; kiến trúc | FR-AUDIT-01, 07-03 |

Ngoài danh sách mock, prototype còn hai chỗ khác LAB-1 bản cuối (vì code trước gói R1): SC-02-05 代行者 chưa có (to-be là tab của SC-02-03 — PRM-129) và chưa có khung thông báo ở SC-00-03 (PRM-130). Hai chỗ này theo LAB-1.

Bảy luật của dự án được giữ ở mọi nơi thiết kế: 相対取引 là luồng chính (không mô tả hệ thống là chỉ-đấu-giá) · 許可 (仲卸) và 承認 (売買参加者) là hai bảng, hai luồng, hai căn cứ khác nhau · người quyết định cuối ở 目利き, chốt せり, duyệt sửa nhạy cảm, xác nhận giao có tranh chấp — không OCR / AI · không ghi đè lịch sử (訂正 / 修正申請 sinh bản ghi REVERSE / DELTA, ngày đã khóa không sửa) · quy chế có version + ngày hiệu lực + maker-checker + rollback, tối đa 4 lần/năm · option tách riêng · điểm chưa chốt ghi thành câu hỏi / giả định có ID.

---

## 5. Quyết định đã chốt cho LAB-4

| ID | Ngày | Quyết định | Phương án đã bỏ | Người quyết | Nguồn |
|---|---|---|---|---|---|
| L4-D01 | 2026-11-25 | Kiến trúc to-be chạy trên **AWS Tokyo managed** theo DEC-002 (Next.js + TypeScript, PostgreSQL managed Multi-AZ, object storage). Prototype LAB-2 (Vercel + Supabase) chỉ là bản thử, dùng làm bằng chứng logic nghiệp vụ và mô hình dữ liệu | Vercel + Supabase gói trả phí (ghi vào ADR là phương án đã bỏ); kiến trúc logic trung lập chưa chọn hạ tầng | Người dùng | DEC-002; NFR-AVL-01, NFR-AVL-03, DR-RET-01 |
| L4-D02 | 2026-11-25 | **Đúng 10 màn** có Screen Specification đầy đủ, mỗi cụm một màn đại diện: SC-03-01 ロット本登録 · SC-04-01 相対取引入力・確定 · SC-05-02 せり結果確認 · SC-03-05 目利き・下見結果入力 · SC-08-03 修正申請承認・却下 · SC-07-02 日次締め · SC-01-02 参加者詳細 · SC-10-04 規則版承認・ロールバック · SC-09-04 奨励金計算・期ロック · SC-06-02 引渡し記録 (nối sang SC-06-04 / SC-06-05). **SC-01-02 thể hiện 許可 (仲卸) và 承認 (売買参加者) bằng hai khối tách riêng** (trường, trạng thái, thao tác, căn cứ khác nhau). Màn khác cùng cụm chỉ ở mức 画面一覧; logic của chúng nằm trong Function / Technical Design của màn đại diện | Đủ cả cụm (~17 màn); 11 màn tách SC-01-03 / SC-01-04 | Người dùng | Plan LAB-4 §0; luật 2 (許可 ≠ 承認) |
| L4-D03 | 2026-11-25 | **Nhãn duyệt nội bộ không dùng chữ 承認** ở mọi màn / wireframe: SC-08-03 đổi tên 「修正申請決裁・却下」 (LAB-1: 修正申請承認・却下), SC-10-04 「規則版確認・ロールバック」 (LAB-1: 規則版承認・ロールバック), 「1次決裁」, 「決裁待ち」; **ID màn giữ nguyên**. Chữ 承認 chỉ còn cho 承認（売買参加者） | Giữ tên LAB-1 rồi ghi ngoại lệ | Người dùng (giao việc sửa Gate 1 M-06) | Luật 2; PRM-121; ADR-003 §2.6 |
| L4-D04 | 2026-11-25 | **Tách Database Design theo cụm**: 9 file `{CỤM}_DB.md` (IAM_AUDIT, PARTY, RULE, CLOSE, LOT, TRADE, ADJUST, BILLING, INCENTIVE) + `MKT_DB.md` làm file tổng (nguyên tắc, enum, ERD tổng quan, bảng lệch, parity, điểm mở) — ngoại lệ #7 README §3 | Giữ một file và ghi ngoại lệ | Người dùng (Gate 1 M-09) | QC-01 §4, §5 ràng buộc 1 |
| L4-D05 | 2026-11-25 | **Bổ sung L4-D02: wireframe 10 + 5 màn** — thêm wireframe **SC-03-02 仮受付** (tablet bến; chỉ wireframe, không Screen Specification đầy đủ), làm ở P3 [Customer giả lập, 2026-11-25 — #22] | Không thêm (giữ 10 + 4) | Người dùng | FB-CUS-281; PERSONA-DOCK-01, NFR-USE-01 |
| L4-D06 | 2026-11-25 | **E-14 để mở tới workshop**: Technical Design vẽ hai nhánh N1 / N2; phương án F (rollback hồi tố về đầu kỳ chưa khóa) và G (tách gói) **chỉ là tư liệu** trong ADR-006 §3 kèm ghi chú ảnh hưởng effort — không thiết kế chi tiết; LAB-5 tách issue làm rõ riêng | Chọn trước F hoặc G | Người dùng | OPEN-L4-01, ADR-006, DEC-048 |
| L4-D07 | 2026-11-25 | **Mở rộng L4-D02: Screen Specification đầy đủ cho 12 màn** = 10 màn đại diện + **SC-06-04 引渡し例外登録, SC-06-05 争いのある引渡し完了確認** (ngoài 10 màn). Lý do: luật 3 — xác nhận giao **có tranh chấp** là một điểm người quyết cuối (CAP-HUMAN-01, PRM-111), và hai màn dùng chung Function / Technical Design của delivery (DELIVERY_FUNC, DEL_EXCEPTION_DISPUTE_TECH) nên tách ra không bớt được việc. Các câu "10 màn cốt lõi" giữ nghĩa *màn đại diện*; số Screen Specification thực tế là 12. Không đổi giá (nằm trong buffer DEC-048) | Giữ đúng 10 màn, SC-06-04 / 05 chỉ ở mức wireframe | PL (giao việc sửa Gate 2 G2-m05) | Expert Gate 2 G2-m05; luật 3; CAP-HUMAN-01, PRM-111, FR-DEL-01..05 |
| L4-D08 | 2026-11-25 | **Không mở rộng Screen Specification tới 70 màn / 99 chức năng.** Screen Specification dừng ở 12 màn (L4-D02 + L4-D07); 58 màn còn lại chỉ ở mức dòng trong 画面一覧 (`wireframes/SCREEN-LIST.md`); phần 12 màn gọi tới mà chưa đặc tả ghi thành DEP-01..17 ở `specs/_index.md`. LAB-5 xử lý phần này qua cột "Phần spec chưa thành issue" khi tách issue | Mở rộng Screen Specification tới cả cụm hoặc đủ 70 màn | Người dùng | Đề LAB-4 chỉ yêu cầu "các màn hình cốt lõi"; giới hạn thời gian; DEC-058 |

Giả định L4-A01..A09 đã được khách giả lập phản hồi ngày 2026-11-25 (đồng ý 5, đồng ý có điều chỉnh 4, trong đó một điểm con không đồng ý ở L4-A04 (3)); góp ý đã áp ở bản 0.3.0 — xem §3, §3.1, §3.2, §6 **[Giả lập]**.

## 6. Điểm mở và rủi ro mang sang thiết kế

| ID | Điểm | Cách thiết kế trong lúc chờ | Ai trả lời | Rủi ro nếu sai | Nguồn |
|---|---|---|---|---|---|
| OPEN-L4-01 | Rollback quy chế khi đã đủ 4 lần trong năm TC (E-14) | Technical Design quy chế vẽ **hai nhánh**: **(N1) chặn** — bám cách đếm 4 lần, nhưng nếu version thứ 4 sai tỷ lệ thì chạy sai tới hết năm TC; engine coi version đã duyệt là đúng nên **không tự sinh delta** — tiền thưởng các kỳ đã khóa chỉ sửa được bằng **修正申請 INCENTIVE từng người × kỳ, duyệt 2 cấp**; **(N2) không chặn — ý kiến hiện tại của khách [Giả lập]**: rollback vẫn đếm và hiện trong báo cáo cho ban lãnh đạo, bắt buộc lý do, checker 照合部門長 + **運用部門長 duyệt có MFA**, tự thông báo ban lãnh đạo; rollback có ngày hiệu lực, không sửa kỳ đã khóa (kỳ khóa đi delta). Version mới thứ 5 bị chặn ở cả hai nhánh. **Không làm thành công tắc cấu hình** | Ban lãnh đạo khách, workshop E-14 (trình kèm phương án F — rollback hồi tố về đầu kỳ chưa khóa, chỉ bảng tỷ lệ — và G — tách gói tỷ lệ theo kỳ / tham số theo ngày, ADR-006 §3) | **R-L4-01 "tỷ lệ sai cả năm"** nếu chọn N1: trả thưởng sai từ kỳ lỗi tới tháng 3; mỗi kỳ đã khóa phải sửa bằng 修正申請 INCENTIVE (tới ~170 người × 11 kỳ), bỏ sót là trả sai mà không có dòng nào báo; kiểm toán bắt chỗ tiền sai | GOV-RULE-01, BR-INC-01, BR-CLOSE-01, E-14; FB-CUS-226, FB-CUS-227 |
| OPEN-L4-02 | FIFO khi chưa có 請求番号 có thể đem tiền trả kỳ mới đi xóa nợ kỳ cũ làm kỳ mới mất 完納 | FIFO mặc định; test vector bắt buộc cho ca này; màn 期ロック hiện tiền đã gán vào kỳ nào để 照合 kiểm trước khi khóa | 経理部 (E-02) | Người mua trả đủ, đúng hạn vẫn mất thưởng → khiếu nại | BR-INC-01, E-02; FB-CUS-225 |
| OPEN-L4-03 | E-12, E-13 có làm đổi tiền không | Tạm xếp như tham số quy chế (§3.1) | 運用部門 | Xếp nhầm → tốn một lượt trong 4 lần/năm khi đổi, hoặc thiếu maker-checker | E-12, E-13; FB-CUS-218 |

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu: hướng đi chốt (第1期 gói R1), thêm/bỏ so với LAB-1, giả định L4-A01..A09, xử lý M01–M24, 2 điểm chờ người dùng quyết | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.2.0 | Update | Mục 5 chuyển Q1, Q2 thành quyết định đã chốt L4-D01 (AWS Tokyo, Vercel + Supabase là phương án bỏ) và L4-D02 (10 màn đại diện, SC-01-02 hai khối 許可 / 承認); cập nhật mục 1.2, 2, 3 theo | 2026-11-25 | phuongnnm-23344 | |
| 3 | 0.3.0 | Update | Áp phản hồi khách giả lập 2026-11-25 (FB-CUS-218..239): L4-A01/A02/A05 ghi điều kiện; viết lại L4-A03 (bảng §3.1 quy chế vs file cấu hình, E-14 không là tham số), L4-A04 (せり chỉ 売買参加者 + hạn mức chung, kỳ theo 業務日, rollback khi đủ 4 lần chờ E-14), L4-A07 (bảng §3.2 MFA, hiệu lực 10–15 phút, quản trị MFA khi đăng nhập), L4-A08 (đáp ứng một phần, email tối thiểu, gửi lại ≤ 3), L4-A09 (ngày biên); M02/M09/M10/M15/M20/M21; thêm §6 OPEN-L4-01..03 và rủi ro R-L4-01 | 2026-11-25 | phuongnnm-23344 | |
| 4 | 0.4.0 | Update | Gộp sau P2: §2 dòng 2 và L4-D02 sửa mức chi tiết theo plan (wireframe chỉ cho 10 màn cốt lõi + 4 màn bổ sung; 22 màn còn lại của prototype chỉ ở mức 画面一覧); §3.1 tách lịch chợ–ngân hàng năm khỏi quy chế, không tính vào 4 lần/năm theo PRM-054 (đóng OPEN-DB-02) | 2026-11-25 | phuongnnm-23344 | |
| 5 | 0.5.0 | Update | Sửa theo Expert Gate 1 + góp ý khách về wireframe: L4-A04 (2) bỏ định nghĩa 02:00 → 01:59, thêm hai trục thời gian và phạm vi tính lại mọi kỳ đã khóa (C-01, C-02, M-01); L4-A09 ngày biên đúng (lô 01:30, 支払期日 theo ngày ngân hàng — M-03); §3.1 ngưỡng theo người mua, tham số file cấu hình mới; §3.2 thêm MFA cho 期限前更新, 端末回収不能, xóa vật lý, dấu ★ hỏi lại mã (m-06, khách #21); M08 câu CARRY dùng chung (m-05), M10, M11 (M-08), M21; §5 thêm L4-D03 nhãn 決裁 (M-06), L4-D04 tách DB (M-09); §6 OPEN-L4-01 / R-L4-01 viết lại theo đường 修正申請 INCENTIVE (M-04) | 2026-11-25 | phuongnnm-23344 | |
| 6 | 0.6.0 | Update | Sửa theo Expert Gate 1 recheck: nguồn MFA cấp mới / gia hạn ở §3.2 (N-03); nhãn [PL 0.5.0] cho phần PL thêm ở L4-A04 (2), L4-A09 (n-08); thêm L4-D05 (wireframe SC-03-02 ở P3), L4-D06 (E-14 để mở, F / G là tư liệu) theo quyết định người dùng | 2026-11-25 | phuongnnm-23344 | |
| 7 | 0.6.1 | Update | Gộp P3: §3.2 thêm 確認 đổi 参加上限 (`LIMIT_CHANGE`) vào danh sách hỏi MFA — khớp PARTY_DB 4.15 (`mfa_verified_at` bắt buộc khi có `decided_by`) và spec PTY_APPROVAL_LIFECYCLE; chọn theo DB vì chặt hơn và 参加上限 là thông số tiền. Q-PTY-07 giữ để khách xác nhận | 2026-11-25 | phuongnnm-23344 | |
| 8 | 0.6.2 | Update | Gate 2 + khách P3: §3.2 dòng 参加上限 theo Q-PTY-06 / Q-PTY-07 (chỉ 照合部門長, một bước, MFA); §3.1 thêm tham số `PARTICIPATION_LIMIT_TAX_CODE` (Q-TRD-02); thêm L4-D07 (Screen Specification 12 màn = 10 đại diện + SC-06-04, SC-06-05 — G2-m05); §3.2 giữ nguyên ★ cho checker quy chế / hủy version đã duyệt (G2-M01 sửa spec theo PREMISE, không đổi PREMISE) | 2026-11-25 | phuongnnm-23344 | |
| 9 | 0.6.3 | Update | Expert Gate 3 G3-M01, G3-m10: thêm L4-D08 (không mở rộng Screen Specification tới 70 màn — người dùng quyết, DEC-058); §0 ghi L4-D gồm cả quyết định của PL (L4-D07); frontmatter `related` thêm DEC-046..051, DEC-056, DEC-058 | 2026-11-25 | phuongnnm-23344 | |
