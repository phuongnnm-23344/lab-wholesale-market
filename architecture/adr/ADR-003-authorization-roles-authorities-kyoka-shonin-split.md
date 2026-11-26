---
id: ADR-003
title: Phân quyền 3 lớp, kiểm trong DB — 許可 và 承認 tách bảng, tách vòng đời
type: adr
status: accepted
version: "1.0.0"
updated_by: phuongnnm-23344
updated: 2026-11-26
related: [ARCH-001, ADR-002, L4-A06, L4-D02, PRM-046, PRM-121, PRM-129, BR-PERM-01, FR-PARTY-01, FR-PARTY-02, TBL-ROLE-01, TBL-ACTOR-01]
---

# ADR-003 — Phân quyền 3 lớp, kiểm trong DB: 許可 và 承認 tách bảng, tách vòng đời

| Trạng thái | Ngày | Người quyết | Thay thế |
|---|---|---|---|
| **Accepted** (trừ các điểm chờ khách ở §6) | 2026-11-26 | Người dùng (L4-D09), PL đề xuất | — |

## 1. Bối cảnh

- Luật 2: 許可 (giấy phép có xét duyệt, cho 仲卸 — người bán buôn trung gian) và 承認 (chấp thuận, thủ tục nhẹ hơn, cho 売買参加者 — người tham gia mua bán) là hai căn cứ pháp lý khác nhau. Gộp thành một quyền → bị loại (02-08, 12-06).
- BR-PERM-01: kiểm hiệu lực tư cách **tại thời điểm chốt GD**. 売買参加者 còn có 参加上限 (hạn mức theo kỳ, mặc định = 保証金, cảnh báo không chặn — PRM-046, L4-A04 (1)).
- TBL-ROLE-01: 7 vai nội bộ + ma trận đọc / ghi theo màn. Prototype giản lược quyền đọc (mọi nội bộ đọc hết — D18, M18).
- Duyệt nội bộ do người có **quyền duyệt** (照合部門長 / 運用部門長 / 配送部門責任者) và 代行者 có thời hạn (PRM-129); cấm tự duyệt thứ mình lập (PRM-120, PRM-129).
- Prototype đã có mô hình đúng hướng: hai bảng `nakaoroshi_permits` / `baibai_approvals` + trigger kiểm loại; `assert_caller(roles, authorities)` trong mọi RPC (as-built §2.3, §2.5).

## 2. Quyết định

1. **Ba lớp tách nhau** (ARCHITECTURE §5):
   - *Vai nội bộ* — 7 vai của TBL-ROLE-01, gắn tài khoản. **Một người có thể giữ nhiều vai** (chợ vừa có người kiêm 受付 + 目利き, 照合 + ルール管理) — mỗi người một tài khoản (PRM-089), vai cấp / thu có lịch sử; SoD vẫn kiểm theo **người** (mục 4) nên kiêm nhiệm không mở đường tự duyệt. Giả định [PL], chờ OPEN-DB-10.
   - *Quyền duyệt* — 3 loại, gắn tài khoản, có lịch sử cấp / thu; **代行** là bản ghi có ngày bắt đầu / kết thúc, tự hết hạn.
   - *Tư cách tham gia* — thuộc người tham gia (không phải tài khoản): 許可, 承認, đăng ký chợ của 卸売業者, đăng ký tại điểm của 買出人.
2. **許可 và 承認: hai bảng, hai vòng đời, hai thủ tục.** Trạng thái theo FIG-010 (有効 / 一時停止 / 失効 / 再審査) ghi thành lịch sử chỉ thêm; gia hạn ≠ 再審査 (PRM-121). Trigger chặn gắn sai loại người tham gia. **Không** có bảng hay enum "giấy phép chung". Màn SC-01-02 hiện hai khối riêng, trạng thái tư cách hiện **trong từng khối** (L4-D02). Chỗ khác nhau thật (đề LAB-4: "loại cần điều kiện xét duyệt" vs "loại chỉ cần thủ tục chấp thuận nhẹ hơn"):

| | 許可 (仲卸) — xét duyệt có điều kiện | 承認 (売買参加者) — thủ tục nhẹ hơn |
|---|---|---|
| Cấp mới | 照合事務局 nhập hồ sơ → **審査** (kết quả + điều kiện 許可, sự kiện `REVIEWED`) → 照合部門長 起案 → **運用部門長 決裁 + MFA** (giả định [PL]) | 届出: 照合事務局 nhập → **照合部門長 確認 + MFA**, xét nhẹ điều kiện 保証金 / 資力 (một người) |
| Gia hạn bình thường | **PRM-121:** 照合事務局 nhập → **照合部門長 確認 + MFA**, ghi xem lại điều kiện 許可; không 審査 lại | Như bên trái (PRM-121) |
| Trường riêng | Số 許可, **điều kiện 許可**, kết quả / ngày 審査 | **参加上限** (mặc định = 保証金), đổi chỉ bằng sự kiện `LIMIT_CHANGED` (cũ / mới / lý do) — **không sửa đè** |
| Kiểm lúc chốt GD | 許可 有効 | 承認 有効 + cảnh báo 参加上限 theo kỳ (相対 + せり) |
| 一時停止 / 失効 / phục hồi | 照合部門長 起案 → 運用部門長 決裁 + MFA (PRM-121); có 弁明の機会 không → OPEN-DB-09 | Như bên trái (PRM-121) |
| Quá 失効日 | `EXPIRED` tự động — giả định [PL]: FIG-010 không vẽ 有効 → 失効 trực tiếp | Như bên trái |

   Người quyết từng bước là giả định [PL] dựa trên PRM-121; 運用部門 xác nhận ở OPEN-DB-09.
3. **Kiểm ở DB, không chỉ ở app:** mọi hàm ghi gọi `assert_caller(vai, quyền duyệt)` đọc `app.user_id` (ADR-002) + bảng vai / quyền / 代行 có hiệu lực tại `now()`. Hàm chốt GD gọi kiểm tư cách người mua **trong cùng transaction** với trừ số lượng lô: 仲卸 → 許可 有効; 売買参加者 → 承認 有効 + tính 参加上限 theo kỳ (cộng 相対 + せり); khác → từ chối có lý do (FR-AITAI-02).
4. **Tách nhiệm (SoD) bằng ràng buộc dữ liệu:** người duyệt ≠ người lập; cấp 1 ≠ cấp 2 cùng một 修正申請; người xác nhận giao tranh chấp ≠ người ghi lần giao; maker ≠ checker quy chế; người hủy batch 入金 ≠ người import. Kiểm trong hàm, có mã lỗi chuẩn.
5. **Quyền đọc:** RLS theo đủ ma trận vai × màn (L4-A06). Ma trận viết **một lần** dưới dạng bảng dữ liệu (tên bảng do Database Design đặt), policy RLS và menu UI cùng đọc từ đó — không chép tay hai nơi.
6. Từ ngữ: duyệt nội bộ trên màn / tài liệu dùng 決裁 / 確認, không dùng 承認 (PRM-121).

## 3. Phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **A. 3 lớp, 許可 / 承認 hai bảng, kiểm trong DB (chọn)** | Đúng luật 2 về mặt dữ liệu, không chỉ ở giao diện; kiểm tư cách và trừ SL trong cùng transaction → không có khe giữa hai lần kiểm; prototype đã chứng minh chạy được | Hai bảng gần giống nhau → lặp code CRUD; ma trận đọc cần bảng dữ liệu riêng | **Chọn** |
| B. Một bảng `qualifications` có cột loại | Ít bảng | Dễ trôi thành "một quyền chung"; trường đặc thù (参加上限) thành cột null-able; reviewer nhìn schema thấy gộp → rủi ro bị đánh trượt luật 2 | Bỏ |
| C. Kiểm quyền chỉ ở app (middleware) | Quen thuộc | Gọi DB trực tiếp (script, job, lỗi code) bỏ qua được; BR-PERM-01 phải kiểm trong transaction chốt | Bỏ |
| D. Engine chính sách ngoài (OPA / Cedar) | Chính sách khai báo | Thêm thành phần vận hành; quy tắc ở đây gắn chặt dữ liệu nghiệp vụ (hiệu lực, hạn mức theo kỳ) → vẫn phải truy DB | Bỏ |

## 4. Hệ quả

**Tích cực**
- Luật 2 hiện ở schema, ở hàm chốt GD và ở màn hình; ba chỗ khớp nhau.
- 代行 + SoD chặn tự duyệt ở mức DB, kể cả khi app lỗi.

**Tiêu cực / rủi ro**
- Logic nghiệp vụ trong PL/pgSQL → cần chuẩn test DB (đã có 11 suite verify ở prototype làm nền).
- Ma trận đọc đủ vai × màn làm RLS phức tạp hơn prototype; cần test âm (vai không được đọc).

**Việc kéo theo**
- Database Design: bảng vai (`staff_roles`, nhiều vai / người), quyền duyệt, 代行, ma trận đọc (`IAM_AUDIT_DB.md`); lịch sử trạng thái 許可 (`REVIEWED`) / 承認 (`LIMIT_CHANGED`), lịch sử 保証金 (D14) (`PARTY_DB.md`).
- Spec SC-01-02 hai khối; SC-02-03 tab 代行者 (PRM-129).

## 5. Truy vết

Luật 2; 02-08; BR-PERM-01; FR-PARTY-01/02, FR-AITAI-02, FR-IAM-02; TBL-ROLE-01, TBL-ACTOR-01; FIG-010; PRM-046, PRM-089, PRM-120, PRM-121, PRM-129; L4-A04 (1), L4-A06, L4-D02; OPEN-DB-09, OPEN-DB-10; as-built D08, D13, D14, D18; M18, M19; Gate 1 M-07, m-10.

## 6. Điểm mở (chờ khách)

Quyết định ở §2 đã **Accepted** (L4-D09). Các điểm dưới đây còn chờ khách thật trả lời; câu trả lời chỉ đổi giá trị / nhánh ghi trong bảng, không đổi hướng của ADR — nếu đổi hướng thì viết ADR mới thay thế. Câu gắn `[Customer giả lập]` trong ADR là giả định có căn cứ, khách thật xác nhận cùng `project/02_requirements/qa.md`.

| ID | Điểm chờ khách | Thiết kế đang theo (giả định) | Nếu khách trả lời khác | Ai trả lời |
|---|---|---|---|---|
| OPEN-DB-09 | Thủ tục cấp mới / đình chỉ 許可 và 承認; có 弁明の機会 không (gia hạn đã chốt theo PRM-121) | [PL] 許可: 審査 + 運用部門長 決裁; 承認: 届出 + xét nhẹ + 照合部門長 確認; đình chỉ cả hai: 運用部門長 決裁 | Đổi người quyết từng bước trong hàm vòng đời; không đổi việc tách bảng / tách vòng đời | 運用部門 |
| OPEN-DB-10 | Một người có giữ nhiều vai trên một tài khoản không | Cho nhiều vai / tài khoản; SoD kiểm theo người | Ràng buộc một vai / tài khoản ở `staff_roles`; SoD không đổi | IT khách, 運用部門 |

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.2.0 | Update | Sửa theo Expert Gate 1: bảng khác biệt thủ tục 許可 (審査 + 運用部門長 決裁) vs 承認 (届出 + 照合部門長 確認), 参加上限 không sửa đè (LIMIT_CHANGED), trạng thái trong từng khối, giả định EXPIRED tự động (M-07); nhiều vai / tài khoản (m-10) | 2026-11-25 | phuongnnm-23344 | |
| 3 | 0.3.0 | Update | Gate 1 recheck N-03: gia hạn bình thường của 許可 về PRM-121 (照合部門長 確認), 審査 + 運用部門長 決裁 chỉ cho cấp mới (giả định PL); 承認 "xét nhẹ" thay "không 審査" | 2026-11-25 | phuongnnm-23344 | |
| 4 | 1.0.0 | Update | Người dùng chốt **Accepted** sau Gate 1–3 (L4-D09 / DEC-059); thêm §6 Điểm mở (chờ khách) — không đổi nội dung quyết định | 2026-11-26 | phuongnnm-23344 | Người dùng (L4-D09) |
