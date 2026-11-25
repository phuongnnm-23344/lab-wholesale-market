# Bằng chứng cho AI-report (LAB-4)

Thư mục này chứa bản sao các ghi chép mà [`../AI-report.md`](../AI-report.md) lấy số liệu: báo cáo review của Expert, góp ý / trả lời của Customer, sổ feedback, nhật ký quyết định, ghi chú tiến độ, brief giao việc khi chạy song song. Bản gốc nằm trong workspace làm bài (ngoài repo); ở đây là bản sao ngày 2026-11-25, sau Expert Gate 3, để người chấm kiểm được số liệu mà không cần workspace.

**Lưu ý khi đọc**

- **Customer là giả lập.** Mọi góp ý / câu trả lời của "khách" do một agent AI đóng vai 桜水産市場 viết, gắn nhãn `[Customer giả lập, ngày]` hoặc `[Giả lập]`. Đó là giả định có căn cứ, không phải khách thật xác nhận.
- Đây là ghi chép làm việc nội bộ, viết bằng tiếng Việt, giữ nguyên văn. File trích chỉ bỏ phần của LAB-1, LAB-2, LAB-3, không sửa câu chữ.
- ID trong file (`FB-EXP-`, `FB-CUS-`, `DEC-`, `G1-`, `G2-`, `G3-`…) là ID của sổ theo dõi; ID của RFP (`FR-`, `NFR-`, `BR-`…) xem ở `PREMISE.md`.
- Đường dẫn trong file (`project/…`, `plans/…`, `lab-wholesale-market/…`) tính từ gốc workspace làm bài, không phải từ repo này. Đường dẫn máy cá nhân đã che thành `<user>`.
- Trước khi chép đã quét `password|pass|key|secret|token|@sun-asterisk|@gmail` và địa chỉ email: không có mật khẩu, khóa, email hay dữ liệu thật; chữ "token" trong file là tên cơ chế thiết kế (`X-MFA-Token`), `<DEMO_ACCOUNT_PASSWORD>` ở DEC-030 là chỗ giữ chỗ.
- Có giữ thư mục này khi public repo ở LAB-5 hay không: quyết ở LAB-5.

## Nguồn gốc từng file

| File trong thư mục này | Nguồn trong workspace | Cách lấy |
|---|---|---|
| [`expert-review/expert-review-lab4-gate1-261125.md`](expert-review/expert-review-lab4-gate1-261125.md) | `project/07_feedbacks/expert-review-lab4-gate1-261125.md` | Bản sao nguyên văn |
| [`expert-review/expert-review-lab4-gate1-recheck-261125.md`](expert-review/expert-review-lab4-gate1-recheck-261125.md) | `project/07_feedbacks/expert-review-lab4-gate1-recheck-261125.md` | Bản sao nguyên văn (gồm mục kiểm diff D-01..D-05) |
| [`expert-review/expert-review-lab4-gate2-261125.md`](expert-review/expert-review-lab4-gate2-261125.md) | `project/07_feedbacks/expert-review-lab4-gate2-261125.md` | Bản sao nguyên văn |
| [`expert-review/expert-review-lab4-gate2-close-and-wireframes-261125.md`](expert-review/expert-review-lab4-gate2-close-and-wireframes-261125.md) | `project/07_feedbacks/expert-review-lab4-gate2-close-and-wireframes-261125.md` | Bản sao nguyên văn |
| [`expert-review/expert-review-lab4-gate3-261125.md`](expert-review/expert-review-lab4-gate3-261125.md) | `project/07_feedbacks/expert-review-lab4-gate3-261125.md` | Bản sao nguyên văn (gate cuối; số dòng trong báo cáo là của HEAD `f8042f2`, trước khi sửa) |
| [`customer-feedback/customer-feedback-lab4-premise-261125.md`](customer-feedback/customer-feedback-lab4-premise-261125.md) | `project/07_feedbacks/customer-feedback-lab4-premise-261125.md` | Bản sao nguyên văn — **giả lập** |
| [`customer-feedback/customer-feedback-lab4-wireframes-261125.md`](customer-feedback/customer-feedback-lab4-wireframes-261125.md) | `project/07_feedbacks/customer-feedback-lab4-wireframes-261125.md` | Bản sao nguyên văn — **giả lập** |
| [`customer-feedback/customer-feedback-lab4-p3-questions-261125.md`](customer-feedback/customer-feedback-lab4-p3-questions-261125.md) | `project/07_feedbacks/customer-feedback-lab4-p3-questions-261125.md` | Bản sao nguyên văn — **giả lập** |
| [`logs/feedback-list-lab4-excerpt.md`](logs/feedback-list-lab4-excerpt.md) | `project/07_feedbacks/feedback-list.md` | Trích dòng LAB-4: FB-EXP-217..239, 253..268, 275..308; FB-CUS-218..239, 260..309 (bỏ FB-EXP-240..252, 269..274 của LAB-3) |
| [`logs/decision-lab4-excerpt.md`](logs/decision-lab4-excerpt.md) | `project/01_management/decision.md` | Trích DEC-028..033 (nền LAB-2 mà PREMISE dẫn tới) và DEC-046..058 (LAB-4); bỏ DEC-034..045 (LAB-3) |
| [`logs/progress-lab4-ai-report-notes.md`](logs/progress-lab4-ai-report-notes.md) | `plans/lab/Lab 4/progress-lab4.md` | Trích mục "Ghi chú cho AI-report" và các dòng ghi chú (4)–(18) rải ở các mục sau |
| [`briefs/p3-shared-brief.md`](briefs/p3-shared-brief.md) | `plans/lab/Lab 4/p3-shared-brief.md` | Bản sao — brief chung cho 3 luồng viết spec P3 |
| [`briefs/p3-consolidation-notes.md`](briefs/p3-consolidation-notes.md) | `plans/lab/Lab 4/p3-consolidation-notes.md` | Bản sao — ghi chú PL khi gộp 3 luồng P3 |
| [`briefs/wireframe-html-shared-brief.md`](briefs/wireframe-html-shared-brief.md) | `plans/lab/Lab 4/wireframe-html-shared-brief.md` | Bản sao — brief chung cho 3 luồng wireframe HTML |
| [`briefs/wireframe-html-consolidation-notes.md`](briefs/wireframe-html-consolidation-notes.md) | `plans/lab/Lab 4/wireframe-html-consolidation-notes.md` | Bản sao — ghi chú PL khi gộp wireframe HTML |

Không chép: `project/02_requirements/qa.md` (sổ câu hỏi khách của cả dự án LAB-1..LAB-4; các câu LAB-4 đã nằm trong file Customer và ghi chú gộp ở trên).
