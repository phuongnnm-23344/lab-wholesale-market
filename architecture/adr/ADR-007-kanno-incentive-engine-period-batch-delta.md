---
id: ADR-007
title: Engine 完納奨励金 — tính xác định theo kỳ, đóng băng ở 期ロック, sửa sau khóa thành DELTA kỳ sau
type: adr
status: proposed
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [ARCH-001, ADR-004, ADR-005, ADR-006, BR-INC-01, FR-INC-01, FR-INC-03, PRM-040, PRM-043, PRM-053, DEC-011, DEC-012, L4-A04, OPEN-L4-02, E-02, E-06]
---

# ADR-007 — Engine 完納奨励金: tính xác định theo kỳ, đóng băng ở 期ロック, sửa sau khóa thành DELTA kỳ sau

| Trạng thái | Ngày | Người quyết | Thay thế |
|---|---|---|---|
| **Proposed** — chờ Gate 1 | 2026-11-25 | PL đề xuất | — |

## 1. Bối cảnh

- 完納奨励金 (thưởng thanh toán đủ, đúng hạn) theo BR-INC-01: hệ số 110/100, làm tròn xuống JPY, không ân hạn, theo JST / 業務日; quá hạn = 0; điều chỉnh sau khóa sổ → delta ở kỳ sau. Test vector INC-EDGE-01..03 (C.3).
- LAB-1 đã chốt cách tính (DEC-011, DEC-012, PRM-040..043, PRM-053): **2 bảng tỷ lệ** theo loại người tham gia; bậc tra theo **適格金額 税抜**; số chuẩn xét 完納 = 期のお支払額 hệ thống tính (thuế 1 lần / người × kỳ × suất); dòng 端数調整 thuế vào batch kế toán khi 期ロック; delta tính lại kỳ cũ theo **version của kỳ cũ**, không hồi tố 完納; delta âm mang sang tới hết năm TC.
- Gán tiền vào kỳ: theo 業務日 của GD gốc; 入金 sau 支払期日 vẫn gán kỳ cũ nhưng kỳ đó không 完納; FIFO khi chưa có 請求番号 (E-02); màn 期ロック hiện tiền đã gán vào kỳ nào (L4-A04 (2), OPEN-L4-02).
- Prototype lệch ở phần tiền (mức Cao): 1 bảng tỷ lệ (D01), tra bậc trên số 税込 (D02), gán 入金 theo cửa sổ ngày, không có bảng phân bổ (D03), 1 thuế suất, không 端数調整 (D04), 支払期日 cố định ngày 10 (D05), delta âm không mang sang (D23).
- Khối lượng nhỏ: ~100–170 người tham gia × 1 kỳ / tháng.

## 2. Quyết định

1. **Hàm thuần, xác định trong DB:** cùng đầu vào (GD hiệu lực của kỳ, bảng phân bổ 入金, version quy chế của kỳ, lịch) → cùng kết quả. Không đọc đồng hồ, không đọc trạng thái ngoài các đầu vào đó. Chạy đồng bộ trong một transaction (vài giây ở khối lượng này) — không cần hạ tầng batch riêng.
2. **Ba bước:**
   - *Xem trước* (không ghi, chạy bao nhiêu lần cũng được): hiện 期のお支払額, tiền đã gán vào kỳ, 完納 / không, bậc, thưởng, delta kỳ trước, và **tiền nào đã gán vào kỳ nào** để 照合 kiểm trước khi khóa.
   - *期ロック* (照合部門長 + MFA): trong **cùng transaction** tính chính thức, ghi kết quả (append-only, gắn version quy chế + mã băm đầu vào), đóng kỳ, sinh dòng 端数調整 cho batch IF-ACC-01, xếp email kết quả vào outbox. Một kỳ chỉ khóa một lần.
   - Không có bước "chạy chính thức" tách khỏi khóa — bỏ trạng thái trung gian "đã tính, chưa khóa" của prototype.
3. **Công thức (chi tiết ở Technical Design 完納奨励金):**
   - 期のお支払額 = Σ tiền 税抜 theo suất + thuế tính **một lần trên tổng theo người × kỳ × suất** (làm tròn theo tham số quy chế, mặc định DEC-011).
   - 完納 = tiền đã phân bổ vào kỳ, có ngày nhận ≤ 支払期日 (theo quy chế + lịch, rơi 休市日 lùi về 営業日 trước), ≥ 期のお支払額.
   - Bậc = tra **適格金額 税抜** trên bảng tỷ lệ của **loại người tham gia** (仲卸 / 売買参加者) thuộc version của kỳ. Thưởng = floor(適格金額 × 交付率 × 110/100).
4. **Phân bổ 入金 → kỳ là bảng riêng (append-only)**: mặc định FIFO theo kỳ cũ nhất còn nợ; khi E-02 trả lời có 請求番号 thì phân bổ theo số đó. Hủy batch 入金 → dòng phân bổ đảo. **Test vector bắt buộc** cho ca "nợ kỳ cũ + FIFO làm kỳ mới mất 完納" (OPEN-L4-02).
5. **DELTA:** khi khóa kỳ N, engine tính lại mọi kỳ đã khóa **trong cùng năm TC** có thay đổi đầu vào sau khi khóa (REVERSE / DELTA ghi vào kỳ đó, 入金 bị hủy…) theo **version của kỳ cũ**, so với tổng đã ghi nhận, sinh dòng DELTA (gắn `ref_period`) vào kỳ N. 完納 của kỳ cũ giữ nguyên (không hồi tố). Delta âm trừ dần vào thưởng các kỳ sau tới hết năm TC; phần còn lại cuối năm ra danh sách cho 照合部門 (Q-ARCH-08).
6. **Kỳ đầu sau go-live và 2 kỳ migrate** (DEC-005): kết quả 2 kỳ migrate nạp như kỳ đã khóa, có version go-live → delta của chúng tính được như kỳ thường.
7. Bộ test chuẩn chạy trong CI: INC-EDGE-01..03, FIFO OPEN-L4-02, ngày biên L4-A09 (01:30 ngày 1, 3/31 → 4/1, 支払期日 rơi 休市日, kỳ đầu sau go-live). Tính lại bằng bảng tỷ lệ thật khi có fixture (L4-A02).

## 3. Phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **A. Hàm xác định trong DB, xem trước tự do, tính chính thức gắn 期ロック, DELTA kỳ sau (chọn)** | Một transaction: không có khe giữa tính và khóa; tái lập được để kiểm toán; khối lượng nhỏ nên không cần batch | Logic tiền trong PL/pgSQL → test DB bắt buộc, review kỹ | **Chọn** |
| B. Tính realtime bằng view (luôn hiện số mới) | Không cần bước tính | Số của kỳ đã chốt thay đổi khi có điều chỉnh → trái BR-INC-01 và luật 4 | Bỏ |
| C. Tính lại kỳ cũ và ghi đè kết quả | Số "đúng" ở kỳ gốc | Trái luật 4, trái BR-INC-01 (delta ở kỳ sau); kế toán đã ghi sổ kỳ cũ | Bỏ |
| D. Engine ở app (TypeScript) đọc dữ liệu ra tính | Dễ unit test | Hai lần đọc khác thời điểm → phải tự khóa nhất quán; tách khỏi trigger / RLS | Bỏ; giữ unit test bằng vector SQL |
| E. Batch đêm theo lịch | Chạy tự động | Khóa kỳ là quyết định của người sau khi 照合 kiểm (CAP-HUMAN-01) | Bỏ |
| F. Gán 入金 theo cửa sổ ngày (như prototype) | Đơn giản | Sai khi trả trễ / trả trước / trả gộp; không hiện được tiền gán kỳ nào | Bỏ (D03) |

## 4. Hệ quả

**Tích cực**
- Sửa toàn bộ lệch mức Cao về tiền của prototype (D01–D05, D23) trong một mô hình.
- Kiểm toán tái lập được bất kỳ kỳ nào từ đầu vào + version.

**Tiêu cực / rủi ro**
- FIFO có thể làm người trả đủ mất 完納 (OPEN-L4-02) tới khi E-02 trả lời → giảm bằng màn xem trước + test vector.
- Nếu 請求書 của kế toán tính thuế khác hệ thống → cách B (nhập 請求額), +0,5–0,8 MM (DEC-011, E-06).

**Việc kéo theo**
- Database Design: bảng phân bổ 入金, kết quả MAIN / DELTA có `ref_period`, mã băm đầu vào, dòng 端数調整.
- **Technical Design 完納奨励金 riêng** (P3) với ví dụ ngày biên; spec SC-09-04.

## 5. Truy vết

BR-INC-01, FR-INC-01, FR-INC-03, FR-AUDIT-03, INC-EDGE-01..03, FIG-013; PRM-040..043, PRM-053, PRM-055; DEC-005, DEC-011, DEC-012; E-02, E-06; L4-A02, L4-A04 (2), L4-A09; OPEN-L4-02; as-built D01–D05, D23; M07, M08, M21; FB-CUS-224, FB-CUS-225.

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
