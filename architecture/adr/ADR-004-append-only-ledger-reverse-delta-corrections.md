---
id: ADR-004
title: Sổ append-only, sửa bằng REVERSE / DELTA — một cơ chế cho 当日訂正 / 取消 và 修正申請
type: adr
status: proposed
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [ARCH-001, ADR-003, ADR-005, PRM-120, PRM-127, BR-CLOSE-01, BR-LOT-02, FR-CORR-01, FR-CORR-02, FR-CORR-03, FR-AITAI-03, FR-AUDIT-01]
---

# ADR-004 — Sổ append-only, sửa bằng REVERSE / DELTA: một cơ chế cho 当日訂正 / 取消 và 修正申請

| Trạng thái | Ngày | Người quyết | Thay thế |
|---|---|---|---|
| **Proposed** — chờ Gate 1 | 2026-11-25 | PL đề xuất | — |

## 1. Bối cảnh

- Luật 4: không ghi đè lịch sử. Sửa GD đã chốt = yêu cầu có lý do + duyệt + bản ghi reverse / delta; bản gốc giữ nguyên (FR-CORR-01/02). Ngày đã khóa không sửa trực tiếp (BR-CLOSE-01, FR-CORR-03).
- Trước khi khóa ngày, GD cần được 訂正 / 取消 nhanh tại bàn GD, có lý do, giữ lịch sử, **không** qua duyệt 2 cấp (FR-AITAI-03, PRM-127, M17). Prototype chưa có — mọi điều chỉnh đi 修正申請 (D11).
- Prototype đã chạy đúng hướng: GD CONFIRMED bị trigger đóng băng; `trade_adjustments` REVERSE (người mua cũ) + DELTA (người mua mới); sổ số lượng lô `lot_quantity_ledger`; 10 bảng chỉ thêm (as-built §2.3).
- Lỗ hổng prototype ở production: audit tắt được bằng `app.seeding`, có hàm reset xóa audit (D19, M24); trạng thái GD chỉ 2 giá trị, chưa theo FIG-012 (D10).
- 1.200 GD / ngày, 7 năm → khối lượng nhỏ (~2,5 triệu dòng GD), không phải lý do để chọn mô hình phức tạp.

## 2. Quyết định

1. **Bản ghi gốc bất biến sau 確定.** GD, kết quả せり, giao hàng, sổ SL lô, 入金, kết quả thưởng, 監査ログ: chỉ INSERT; trigger chặn UPDATE / DELETE; DB role của app không có quyền ghi bảng (ADR-001).
2. **Mọi thay đổi sau 確定 = cặp REVERSE + DELTA** gắn `adjustment_source`:
   - `SAME_DAY` — 当日訂正 / 取消 trên SC-04-05, chỉ khi 業務日 của GD **chưa khóa**; người có vai TRADE; bắt lý do; không duyệt. 取消 = REVERSE không có DELTA; SL trả về lô qua sổ SL (BR-LOT-02).
   - `CORRECTION` — 修正申請 khi ngày đã khóa (hoặc khi chọn đi đường duyệt): lý do + chứng cứ, duyệt cấp 1 (照合部門長), cấp 2 (運用部門長) khi |chênh tiền| ≥ ngưỡng **trong quy chế có version** (ADR-006, tạm 100.000 JPY — E-08). Cặp REVERSE / DELTA ghi vào **業務日 chưa khóa sớm nhất** (PRM-120).
   Hai nguồn dùng chung bảng, view tính giá trị hiệu lực, cách vào 精算 và kỳ thưởng; chỉ khác đường duyệt.
3. **Giá trị hiệu lực** của GD = gốc + Σ điều chỉnh, tính bằng view; báo cáo, 精算, 奨励金 chỉ đọc giá trị hiệu lực. Điều chỉnh mang **người mua của từng dòng** để tiền đi đúng người khi đổi người mua.
4. **Vòng đời GD theo FIG-012**; mỗi lần đổi trạng thái là một dòng lịch sử (người, thời điểm — PRM-114). Thiết kế bảng cụ thể do Database Design quyết.
5. **Audit:** trigger ghi before / after cho mọi bảng nghiệp vụ; **không có** cờ bỏ qua, **không có** hàm reset ở production. Migration ban đầu ghi audit với người thực hiện là tài khoản migration.

## 3. Phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **A. Append-only + REVERSE / DELTA, một cơ chế cho hai nguồn (chọn)** | Đúng luật 4 ở mức dữ liệu; prototype đã chạy; đối soát / kế toán quen bút toán đảo; một cách tính giá trị hiệu lực | Truy vấn qua view gộp → cần index theo 業務日, khoảng ngày bắt buộc (ADR-009) | **Chọn** |
| B. Sửa tại chỗ (UPDATE) + bảng audit before / after | Đơn giản khi đọc | Trái luật 4; báo cáo ngày đã khóa có thể đổi số; audit tắt được là mất dấu | Bỏ |
| C. 当日訂正 sửa tại chỗ, chỉ 修正申請 mới REVERSE / DELTA | Ít dòng hơn | Hai cách sửa → hai cách tính; GD bị sửa trong ngày mất lịch sử với người mua (取引確認票 đã in) | Bỏ |
| D. Event sourcing đầy đủ (CQRS, dựng lại state từ event) | Lịch sử hoàn chỉnh | Quá nặng cho tải và đội; đọc báo cáo phải qua projection; tăng rủi ro tiến độ | Bỏ |
| E. Bảng bitemporal (valid time + system time) | Truy được "lúc đó thấy gì" | Phức tạp truy vấn; PostgreSQL không hỗ trợ sẵn; nhu cầu đã đủ bằng A + audit | Bỏ |

## 4. Hệ quả

**Tích cực**
- Báo cáo của ngày / kỳ đã khóa không bao giờ đổi số; chênh lệch hiện ở ngày / kỳ áp.
- 当日訂正 nhanh ở bàn GD mà vẫn giữ lịch sử.

**Tiêu cực / rủi ro**
- Số dòng tăng theo số lần sửa (không đáng kể ở tải này).
- Người dùng phải hiểu "ngày áp" ≠ "ngày GD gốc" → màn chi tiết GD hiện cả hai.

**Việc kéo theo**
- Database Design: cột `adjustment_source`, lịch sử trạng thái GD, bỏ cờ seeding / hàm reset.
- Technical Design 訂正 (SC-04-05) và 修正申請 (SC-08-03).

## 5. Truy vết

Luật 4; BR-CLOSE-01, BR-LOT-02; FR-CORR-01..03, FR-AITAI-03, FR-AUDIT-01, 07-03; FIG-012; PRM-114, PRM-120, PRM-127; E-08; as-built §2.3, D07, D10, D11, D19, D20; M17, M24.

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
