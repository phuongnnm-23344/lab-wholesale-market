# LAB-4 P3 — Brief chung cho 3 luồng viết spec (2026-11-25)

Đọc file này trước. Luồng của bạn (phạm vi màn + file được sửa) nằm trong prompt giao việc.

## Bối cảnh
- Repo: `C:\Users\<user>\Desktop\Project lab\lab-wholesale-market`, nhánh `ver/lab-4` (HEAD `470cf2e`, Gate 1 đã RELEASE).
- Plan: `plans/lab/Lab 4/plan-lab4-draft.md`. Đề: `plans/lab/Lab 4/Requirement.txt`, `Output.txt`. 7 luật: `CLAUDE.md` gốc workspace.
- Nguồn thiết kế đã duyệt (Gate 1): `PREMISE.md`, `architecture/ARCHITECTURE.md`, `architecture/adr/ADR-001..010`, `specs/system-design/database-design/*.md` (MKT_DB tổng + 9 cụm), `wireframes/SCREEN-LIST.md`, `wireframes/_common-layout.md`, `wireframes/SC-*-wireframe.md`.
- Review đã có: `project/07_feedbacks/expert-review-lab4-gate1-261125.md`, `...-gate1-recheck-261125.md` (có mục Kiểm diff 470cf2e, D-01..D-05), `customer-feedback-lab4-wireframes-261125.md`.
- Danh sách feature (thư mục `specs/{feature}/`): bảng ở `specs/_index.md`.
- Code prototype (chỉ ĐỌC, để biết as-is và nhánh lỗi RPC): `prototype/src/**`, `prototype/supabase/migrations/**`. Báo cáo as-built: `plans/reports/pl-261125-lab4-p1-prototype-as-built-extraction.md`.

## Chuẩn tài liệu (spec-standards 03-specs, QC-01)
- Template ở `specs/_templates/` (đã đồng bộ bản mới): Screen Spec **BM-2-901-51**, Function Spec **BM-2-901-54**, Technical Design **BM-2-901-53**, API Design **BM-2-901-52**. Xem bản mẫu `sample-*` cùng thư mục.
- Vị trí (QC-01 §2):
  - `specs/{feature}/README.md` — bảng tài liệu của feature + link sang system-design.
  - `specs/{feature}/screen-specification/{SCREEN_ID}_SPEC.md` + `assets/{SCREEN_ID}_annotated.png`
  - `specs/{feature}/function-specifications/{MODULE_ID}_FUNC.md`
  - `specs/{feature}/technical-design/{FUNC_ID}_TECH.md`
  - `specs/system-design/api-design/{feature}/{API_ID}_API.md`
- Screen ID giữ dạng `SC-xx-yy` (ngoại lệ đã ghi ở README §3).
- Mục không áp dụng: ghi "N/A — lý do", không xóa tiêu đề. Frontmatter + Lịch sử phiên bản theo template. Không file `-v2`/`-final`.
- Cột `No` ở bảng item của BM-51 = số item trong wireframe to-be (không đánh số lại). Ảnh annotated: dựng từ ảnh prototype trong `wireframes/assets/` nếu bố cục giống; nếu to-be khác nhiều, dựng ảnh đánh số từ wireframe (tool tùy chọn, ví dụ script vẽ khung) hoặc ghi rõ lý do theo quy tắc của template. Số trên ảnh phải khớp 1-1 với cột No.

## Nội dung bắt buộc (mục tiêu học tập LAB-4)
- Mỗi màn: field (kiểu, độ dài, bắt buộc, mặc định, định dạng), validation (điều kiện + thông điệp lỗi tiếng Nhật + mã lỗi), trạng thái (rỗng, lỗi, đang xử lý, khóa ngày 423, chờ duyệt, offline nếu có), **phân quyền hiển thị theo vai** (bảng vai × item: hiện/ẩn/chỉ đọc/thao tác), luồng chuyển màn, API gọi.
- Đủ để dev làm không hỏi lại và để LAB-5 break thành issue: mỗi chức năng/API có điều kiện hoàn thành kiểm được.
- Truy vết ID: RFP (FR-, NFR-, BR-, …), PRM-, DEC-, L4-, ADR-, D-/N- (bảng lệch), FB-.
- 7 luật: 相対 là luồng chính; 許可 ≠ 承認; người quyết định cuối; không ghi đè lịch sử (REVERSE/DELTA, ngày khóa không sửa); quy chế version + maker-checker + rollback; Option tách riêng; điểm chưa chốt thành câu hỏi/giả định.
- Không dùng chữ 「承認」 cho duyệt nội bộ (L4-D03 / M-06).
- Mã lỗi: dùng tiền tố theo feature (vd `E-TRD-xxx`), liệt kê trong FUNC; điều phối gom về `specs/_common/error-codes.md` sau.

## Ngôn ngữ
Tiếng Việt; thuật ngữ kỹ thuật/dự án EN; nhãn UI và thông điệp lỗi tiếng Nhật (hệ thống dùng tiếng Nhật); nghiệp vụ JP kèm nghĩa ở lần đầu mỗi file. Không chép nguyên văn RFP. Không dữ liệu thật.

## Skill gợi ý
`tkm:ba-analyze-requirement` (rule/validation/trạng thái — tự chọn phương án khuyến nghị, điểm cần khách quyết ghi thành câu hỏi, không hỏi người dùng giữa chừng), `tkm:generate-ui-specs` (image mode từ ảnh màn → bảng component + bbox/annotated, nếu hợp), `tkm:generate-testcases` (tùy chọn, làm acceptance criteria).

## Quy tắc chạy song song
- CHỈ sửa file trong phạm vi luồng của bạn (ghi trong prompt). KHÔNG sửa: `specs/_index.md`, `specs/system-design/api-design/_index.md`, `specs/_common/**`, `README.md`, `PREMISE.md`, `project/**`, `plans/lab/Lab 4/progress-lab4.md` — báo nội dung cần thêm trong báo cáo cuối, điều phối gom.
- KHÔNG git commit (điều phối commit chung). Không sửa `prototype/**`.
- Thiếu thông tin hoặc mâu thuẫn với thiết kế Gate 1: không tự đổi file ngoài phạm vi; ghi vào báo cáo.

## Báo cáo cuối (bắt buộc)
1. Danh sách file đã tạo/sửa.
2. Dòng cần thêm vào `specs/_index.md` và `api-design/_index.md` (đúng định dạng bảng).
3. Mã lỗi mới (mã · thông điệp JP · nghĩa VI · màn/API).
4. Câu hỏi / giả định mới (ID đề xuất, truy vết).
5. Mâu thuẫn với thiết kế Gate 1 phát hiện được.
6. `**Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT` · Summary · Concerns.
