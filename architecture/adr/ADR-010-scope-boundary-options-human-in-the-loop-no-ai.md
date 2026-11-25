---
id: ADR-010
title: Ranh giới phạm vi — Option tách riêng, người quyết cuối, không AI / OCR cho ký hiệu tay và chất lượng
type: adr
status: proposed
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [ARCH-001, ADR-003, CAP-HUMAN-01, SCOPE-OUT-01, SCOPE-OUT-02, SCOPE-OUT-03, SCOPE-OUT-04, SCOPE-OUT-06, PRM-024, DEC-008, L4-A08]
---

# ADR-010 — Ranh giới phạm vi: Option tách riêng, người quyết cuối, không AI / OCR cho ký hiệu tay và chất lượng

| Trạng thái | Ngày | Người quyết | Thay thế |
|---|---|---|---|
| **Proposed** — chờ Gate 1 | 2026-11-25 | PL đề xuất | — |

## 1. Bối cảnh

- Luật 3 / CAP-HUMAN-01: người quyết cuối ở 目利き (đánh giá chất lượng / độ tươi), chốt kết quả せり, duyệt sửa nhạy cảm, xác nhận giao có tranh chấp. SCOPE-OUT-01/02: không tự đánh giá chất lượng / loài, không chuyển ký hiệu tay (手やり) hay 符丁 (mã giá riêng của chợ) thành dữ liệu bằng OCR / AI. SCOPE-OUT-06: AI nếu có chỉ ở dạng gợi ý.
- Luật 6: Option (giao dịch từ xa, portal người mua, phân tích / dự báo, AI suggestion-only) luôn tách phạm vi, giả định, chi phí, rủi ro (PRM-024, DEC-008). 17 mục 第2期 nằm ngoài 第1期.
- PREMISE §1.2: kiến trúc chỉ chừa **điểm mở rộng có tên**, không thiết kế chi tiết Option.
- Rủi ro thực tế khi xây: "tiện tay" thêm OCR phiếu せり hay gợi ý giá vào màn chính → vi phạm luật 3 / 6 mà không ai quyết.

## 2. Quyết định

1. **第1期 không có thành phần AI / OCR / nhận dạng nào.** Kết quả 目利き, せり, xác nhận giao là dữ liệu người nhập, mỗi bản ghi có người + thời điểm (ARCHITECTURE §6).
2. Các điểm người quyết được **ép ở DB**, không chỉ ở UI: xác nhận せり bởi người khác người nhập (trùng thì lý do + cờ 要確認); 修正申請 và giao tranh chấp cấm tự duyệt; 日次締め / 期ロック không có job tự chạy (ADR-003, ADR-005).
3. **Điểm mở rộng có tên** (chi tiết ARCHITECTURE §10) — chỉ là ranh giới, không có code ở 第1期:
   - *Cổng người ngoài* (SCOPE-OUT-03/04, SEC-IAM-02 第2期): nhóm route và realm xác thực riêng, chỉ gọi service công khai của module.
   - *Phân tích / dự báo* (08-06): đọc từ dữ liệu xuất cấu trúc (FR-RPT-03) ở S3, không truy vấn trực tiếp DB nghiệp vụ.
   - *AI suggestion-only* (SCOPE-OUT-06): gợi ý ghi vào **bảng riêng**; thành phần AI **không có quyền EXECUTE** hàm ghi nghiệp vụ; người dùng chấp nhận gợi ý = người đó tự nhập / xác nhận, ghi tên người.
   - *Tem / quét mã lô* (cải tiến 04-07): mã lô duy nhất in được dạng mã vạch.
4. Thêm bất kỳ thành phần nào trong mục 3 = **CR / đơn giá riêng**, có ADR mới ghi rõ phạm vi, giả định, chi phí, rủi ro.

## 3. Phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **A. Không AI / OCR ở 第1期; điểm mở rộng có tên; người quyết ép ở DB (chọn)** | Đúng luật 3, 6; không thiết kế thứ không ai trả tiền; Option sau này không phải sửa lõi | Không có "tính năng thông minh" để trình diễn | **Chọn** |
| B. OCR phiếu せり / 手やり để giảm nhập lại | Giảm nhập | Trái SCOPE-OUT-02; sai nhận dạng vào thẳng tiền | Bỏ |
| C. Gợi ý AI giá / chất lượng ngay trong màn chính, người bấm chấp nhận | Hữu ích | Là Option SCOPE-OUT-06 có giá riêng; nhét vào baseline trái luật 6 | Bỏ khỏi 第1期 (Option) |
| D. Thiết kế chi tiết portal / giao dịch từ xa "để sẵn" | Đỡ việc 第2期 | Thiết kế không ai trả tiền, dễ lệch khi khách quyết khác | Bỏ (YAGNI) |
| E. Không chừa ranh giới gì | Đơn giản nhất | 第2期 phải sửa lõi (xác thực, quyền gọi hàm) | Bỏ |

## 4. Hệ quả

**Tích cực**
- Proposal / compliance và kiến trúc nói cùng một điều: hệ thống ghi quyết định của người, không thay người.
- Ranh giới quyền (AI không có EXECUTE hàm ghi) làm luật 3 vẫn đúng cả khi thêm Option.

**Tiêu cực / rủi ro**
- 02-05, BR-NOTIFY-01 (phần người ngoài), SEC-IAM-02 chỉ "đáp ứng một phần" ở 第1期 (L4-A08) — đã ghi trong compliance LAB-1 (DEC-023).

**Việc kéo theo**
- Review code LAB-5: checklist "không có thư viện OCR / AI, không gọi API AI".
- Option nào được mua → ADR mới thay phần tương ứng của mục 3.

## 5. Truy vết

Luật 3, luật 6; CAP-HUMAN-01; SCOPE-OUT-01..04, SCOPE-OUT-06; 04-07, 08-06, 02-05, BR-NOTIFY-01, SEC-IAM-02, FR-RPT-03, FR-SERI-01; PRM-024, PRM-115; DEC-008, DEC-023; L4-A08; PREMISE §1.2.

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
