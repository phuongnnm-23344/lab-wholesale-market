---
id: ADR-005
title: Đồng hồ 業務日, 日次締め và 期ロック khóa ở mức DB, không mở lại
type: adr
status: proposed
version: "0.2.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [ARCH-001, ADR-004, ADR-006, ADR-007, ADR-008, PRM-110, PRM-116, PRM-119, PRM-120, BR-CLOSE-01, BR-INC-01, L4-A04, L4-A09, E-12, E-16]
---

# ADR-005 — Đồng hồ 業務日, 日次締め và 期ロック khóa ở mức DB, không mở lại

| Trạng thái | Ngày | Người quyết | Thay thế |
|---|---|---|---|
| **Proposed** — chờ Gate 1 recheck | 2026-11-25 | PL đề xuất | — |

## 1. Bối cảnh

- 業務日 (ngày nghiệp vụ) không trùng ngày dương lịch: lô bắt đầu nhận từ 01:00 (giờ nhận lô — tham số quy chế, E-16) và thuộc 業務日 sáng đó; chốt GD từ 02:00 (PRM-116). Bản 0.1.0 có **hai định nghĩa** (GD theo 02:00 → 01:59, lô từ 01:00) và job mở ngày lúc 02:00 → lô 01:00–02:00 không có 業務日 OPEN để ghi (Gate 1 M-01).
- 期 (kỳ thanh toán) = tháng dương lịch theo **業務日 của GD gốc** (L4-A04 (2)).
- BR-CLOSE-01: ngày đã khóa không sửa trực tiếp. Sửa sau khóa → 修正申請 vào ngày chưa khóa sớm nhất (PRM-120). Sửa sau 期ロック → 差分 kỳ sau (BR-INC-01, ADR-007).
- Bản ghi đến muộn cho ngày đã khóa (紙伝票後入力, bản ghi offline đồng bộ trễ) và checklist có thể bị kẹt vì một thiết bị hỏng / mất (Gate 1 M-05; [Customer giả lập, 2026-11-25 — #1]).
- Prototype: `current_business_date()` = ngày OPEN lớn nhất, không có job, không gắn lô trước 02:00 (D22, M10); trigger chặn ghi ngày LOCKED đã chạy tốt.

## 2. Quyết định

1. **Lịch là nguồn sự thật:** bảng lịch chợ – ngân hàng (SC-10-05) xác định ngày chợ mở / 休市日 / 臨時休市 / 臨時開市 và ngày ngân hàng mở. Đổi 臨時休市 / 臨時開市 trong ngày, không cần nhà thầu, không tính quota quy chế (FB-CUS-239).
2. **Một định nghĩa 業務日:** 業務日 D = khoảng **[D 01:00, D+1 01:00) JST**, trong đó 01:00 là `LOT_INTAKE_START_TIME` của version quy chế hiệu lực. Chốt GD chỉ được từ `TRADE_START_TIME` (02:00, PRM-116). Không có ca "GD chốt 01:30 thuộc ngày trước" — GD không chốt được trước 02:00.
3. **Gán 業務日 ở server**, không theo đồng hồ máy khách: hàm `business_date_for(t)` = ngày của (t − `LOT_INTAKE_START_TIME`), cùng một hàm cho lô, GD, giao hàng, kỳ, quota năm TC. Bản ghi offline mang thời điểm thiết bị + thời điểm server nhận; 業務日 do server xác định khi đồng bộ (ADR-008).
4. **Mở 業務日:** hàm 日次締め ngày D **mở luôn 業務日 chợ kế tiếp** theo lịch (OPEN, `intake_opens_at` = ngày đó 01:00) → luôn có "ngày chưa khóa sớm nhất" cho 修正申請 / 後入力 duyệt buổi chiều. **Job lúc `LOT_INTAKE_START_TIME` (01:00 JST, EventBridge Scheduler múi Asia/Tokyo)** là lưới an toàn: mở ngày nếu chưa có (idempotent). Job lỗi → alarm; người có quyền mở tay bằng cùng hàm (có audit).
5. **日次締め:** 照合部門長 (hoặc 代行) + MFA (luôn hỏi lại mã — ADR-002 §2.2) sau khi checklist PRM-119 hiển thị đủ. Khóa = đổi trạng thái ngày + trigger `DAY_LOCKED` chặn mọi ghi vào ngày đó ở mọi bảng nghiệp vụ. Lô còn SL → 持ち越し sang ngày sau cùng mã lô (PRM-110; quy tắc tạm xếp như quy chế chờ E-12). **Checklist chuẩn** (SC-07-02 hiện đúng danh sách này):

| # | Mục | Mức | Nguồn |
|---|---|---|---|
| 1 | GD 下書き / 確認待ち còn treo | ✖ chặn | PRM-119 |
| 2 | Phiên せり chưa có người xác nhận | ✖ chặn | PRM-115 |
| 3 | Thiết bị còn bản ghi chưa đồng bộ — **trừ máy đã đánh dấu 「端末回収不能」** (§2-6) | ✖ chặn | NFR-AVL-02, L4-A05 |
| 4 | Bản ghi SC-03-07 của ngày này còn 要確認 | ✖ chặn | ADR-008 §2.2 |
| 5 | 当日訂正 / 取消 có tiền thay đổi của một người mua ≥ ngưỡng 2 cấp, hoặc đổi 買受人, chưa được 照合事務局 bấm 「確認済」 | ✖ chặn | PRM-127, E-08; [Customer giả lập, 2026-11-25 — Q-SC0405-01, #25] |
| 6 | Ngoại lệ giao làm đổi tiền (不足 / 返品 / 一部取消) chưa 「確認済」 | ✖ chặn | FR-SETTLE-01, OBJ-05; [Customer giả lập, 2026-11-25 — #4] |
| 7 | Lô còn SL → 持ち越し | ⚠ xác nhận | PRM-110, E-12 |
| 8 | Giao còn dư — phải tick xác nhận | ⚠ xác nhận | PRM-036 |
| 9 | 当日訂正 dưới ngưỡng (soát) | ⚠ | PRM-127 |
| 10 | Tranh chấp giao chưa xác nhận → đi tiếp sang ngày sau | ⚠ | PRM-111, ADR-008 §2.4 |
| 11 | Phiên せり do chính người nhập xác nhận (có lý do) — soát | ⚠ | PRM-115 |

6. **Lối thoát cho checklist kẹt — 「端末回収不能」:** thiết bị hỏng / mất / hết pin không đồng bộ được → 照合部門長 (hoặc 代行) đánh dấu máy 「端末回収不能」 + lý do + MFA + audit. Máy ra khỏi mục 3 của checklist, phiên và PIN offline của máy bị thu hồi; bản ghi của máy đó nếu về sau → SC-03-07 (要確認) → đường 後入力 ở mục 8. Phần mất hẳn nhập bù từ giấy cũng theo mục 8.
7. **Không có chức năng mở lại ngày đã khóa** (Q-ARCH-02 — Expert Gate 1 đồng ý giữ). Khóa nhầm / thiếu → 修正申請 hoặc 後入力 (mục 8) vào ngày mở sớm nhất.
8. **Bản ghi đến muộn cho ngày đã khóa (後入力):** GD / lô / lần giao **mới** của một ngày đã khóa không ghi vào ngày đó. Đi **修正申請 phạm vi `LATE_ENTRY`**: nội dung bản ghi mới + ngày gốc + chứng cứ (scan 紙伝票); 照合部門長 決裁 (2 cấp nếu ≥ ngưỡng). Duyệt xong ghi vào 業務日 đang mở (`business_date` = ngày ghi sổ) với **ngày GD thật** riêng (`trades.trade_date`, `deliveries` / `lots.original_business_date` = ngày gốc); kỳ theo ngày gốc và quy tắc kỳ OPEN / LOCKED của ADR-007 §2.3. ADR-008 và SC-03-07 dùng chung đường này.
9. **期ロック:** sau 支払期日 + thời gian 照合; 照合部門長 + MFA; trong cùng transaction tính chính thức 完納奨励金 và đóng băng kết quả (ADR-007). Sau khóa, mọi thay đổi gán vào kỳ đó → DELTA ở kỳ sau; không hồi tố 完納 (ngoại lệ có duyệt: 修正申請 KANNO — ADR-007 §2.5).
10. **Xuất IF-ACC-01** tạo sau 日次締め, nội dung đóng băng lúc tạo (PRM-123).

## 3. Phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **A. Lịch + mở ngày khi khóa ngày trước (job 01:00 dự phòng) + khóa DB vĩnh viễn + 後入力 qua 修正申請 (chọn)** | Đúng BR-CLOSE-01 ở mức dữ liệu; 業務日 xác định bằng một hàm duy nhất; ngày biên (lô 01:30 đầu tháng, 3/31→4/1) test được; bản ghi muộn có đường duyệt rõ | Không mở lại được → sai sót lúc khóa phải đi đường sửa | **Chọn** |
| B. Mở lại ngày đã khóa có duyệt | Linh hoạt khi khóa nhầm | Báo cáo / CSV kế toán đã xuất có thể lệch; khách chưa yêu cầu; thêm luồng duyệt | Bỏ ở 第1期, hỏi Q-ARCH-02 |
| C. Khóa chỉ ở app (ẩn nút sửa) | Đơn giản | Đường ghi khác (job, script, lỗi) vẫn sửa được → trái BR-CLOSE-01 | Bỏ |
| D. 業務日 = ngày dương lịch, lô trước 02:00 tính ngày trước | Đơn giản | Sai thực tế: lô nhận 01:00 bán sáng đó; kỳ thưởng lệch ở ngày biên | Bỏ |
| F. Job mở ngày 02:00, lô 01:00–02:00 vào hàng đợi rồi gắn ngày khi mở | Giữ mốc 02:00 quen thuộc | Thêm hàng đợi phía server cho lô; lô nhận 01:30 chưa có mã lô / 業務日 tới 02:00 → 受付 phải chờ | Bỏ |
| G. 後入力 cho ngày đã khóa ghi thẳng vào ngày mở, không duyệt (bản 0.1.0) | Nhanh | GD mang 業務日 sai → sang kỳ khác, phiếu và 取引日 lệch nhau; lách BR-CLOSE-01 mà không có người quyết | Bỏ (M-05) |
| E. Tự động khóa ngày theo giờ | Không quên khóa | Khóa khi còn giao / せり chưa xác nhận; trái CAP-HUMAN-01 (người quyết) | Bỏ; chỉ nhắc (cảnh báo trước giờ khóa trong file cấu hình) |

## 4. Hệ quả

**Tích cực**
- Một hàm 業務日 dùng cho lô, GD, kỳ, quota năm TC → ngày biên có test vector chung (ADR-007 §2.7 TV-09).
- Checklist không bị một thiết bị hỏng giữ chân; bản ghi muộn có người 決裁 và giữ ngày GD thật.
- Không ai, kể cả quản trị, sửa được số của ngày đã khóa.

**Tiêu cực / rủi ro**
- Ngày kế tiếp do hàm 日次締め mở; nếu ngày trước chưa khóa thì job 01:00 mở — job lỗi + ngày trước chưa khóa = không nhận lô được → alarm ngay + hàm mở tay; không deploy 01:00–10:00.
- 「端末回収不能」 là đường tắt qua checklist → chỉ 照合部門長 / 代行, bắt lý do + MFA, hiện trong báo cáo khóa ngày.
- Khóa nhầm không quay lại được → checklist + MFA làm bước dừng.

**Việc kéo theo**
- Database Design: lịch, trạng thái ngày / kỳ, lịch sử khóa (`CLOSE_DB.md`); `trades.trade_date`, `*.original_business_date`, `devices.lost_*`, `trade_fixes.reviewed_*`, `delivery_exceptions.settle_reviewed_*`, `correction_scope = LATE_ENTRY`.
- Spec SC-07-02 (日次締め), SC-09-04 (期ロック); wireframe SC-10-05.

## 5. Truy vết

BR-CLOSE-01, BR-INC-01, FR-SETTLE-01, FR-SETTLE-02, FR-CORR-01..03, FIG-002, FIG-013, NFR-AVL-02, OBJ-05; PRM-036, PRM-110, PRM-111, PRM-115, PRM-116, PRM-119, PRM-120, PRM-123, PRM-127; E-08, E-12, E-16; L4-A04 (2), L4-A05, L4-A09; as-built D05, D12, D22; M10; FB-CUS-224, FB-CUS-239; Gate 1 M-01, M-05; khách #1, #4, #25.

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.2.0 | Update | Sửa theo Expert Gate 1 + khách wireframe: một định nghĩa 業務日 [D 01:00, D+1 01:00), mở ngày kế tiếp khi 日次締め + job 01:00 dự phòng (M-01); checklist chuẩn 11 mục (6 ✖ / 5 ⚠) khớp SC-07-02, 「端末回収不能」, 後入力 cho ngày đã khóa qua 修正申請 LATE_ENTRY với ngày GD thật (M-05, khách #1, #4, #25); phương án F, G | 2026-11-25 | phuongnnm-23344 | |
| 3 | 0.2.1 | Update | Gate 1 recheck n-04: tham chiếu "(mục 6)" → "§2-6" | 2026-11-25 | phuongnnm-23344 | |
