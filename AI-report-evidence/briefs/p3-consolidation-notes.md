# LAB-4 P3 — ghi chú gộp từ 3 luồng (điều phối ghi lại để không mất khi tóm tắt)

## Luồng 3 — incentive + rule (DONE_WITH_CONCERNS, 2026-11-25)
- D-02..D-05 Fixed: MKT_DB 0.3.1 (§4.0 quy ước Index/FK + OPEN-DB-09), INCENTIVE_DB 0.3.1, ADR-007 0.3.1, qa.md OPEN-DB-09.
- File mới: specs/incentive/{README, screen-specification/SC-09-04_SPEC.md + assets, function-specifications/INC_FUNC.md, technical-design/INC_ENGINE_TECH.md (K1–K9)}; specs/rule/{README, SC-10-04_SPEC.md + assets, RULE_FUNC.md, RULE_VERSION_TECH.md (R1–R7, RV-01..17)}; api-design/incentive/API-INC-001..004, api-design/rule/API-RULE-001..006.
- Script vẽ ảnh annotated (scratchpad, chưa vào repo): render_annotated_wireframes.py.
- Dòng index: specs/_index.md thêm 6 dòng SPEC/FUNC/TECH (SPEC-SC-09-04-001, SPEC-INC_FUNC-001, SPEC-INC_ENGINE-001, SPEC-SC-10-04-001, SPEC-RULE_FUNC-001, SPEC-RULE_VERSION-001), API Design +10; api-design/_index.md thêm API-INC-001..004, API-RULE-001..006 (link `incentive/API-INC-00x_API.md`, `rule/API-RULE-00x_API.md`).
- Mã lỗi: E-INC-001..013, E-RULE-001..014 (thông điệp JP ở INC_FUNC §3, RULE_FUNC §3). Mã chung: AUTH_REQUIRED, MFA_REQUIRED, MFA_INVALID (401), FORBIDDEN (403), VALIDATION (400), INTERNAL (500).
- Câu hỏi mới: Q-INC-01..03, Q-RULE-01..03 → qa.md.
- Mâu thuẫn cần xử lý khi gộp:
  1. CLOSE_DB 4.43 "kỳ sau tạo khi khóa kỳ trước" vs trade_adjustments.period_id NOT NULL (修正申請 09-05 cho GD 09-02 khi kỳ 08 chưa khóa) → đề xuất tạo kỳ ở lần mở 業務日 đầu tháng (Q-INC-03).
  2. ADJUST_DB 4.37 index one-pending có cột scope (cho phép KANNO + INCENTIVE cùng chờ) vs ADR-007 §2.5-12 "tối đa một" → thống nhất.
  3. RULE_DB 4.21 thiếu cột đề nghị hủy (Q-RULE-02); ghi rõ 決裁待ち N2 = PENDING + checker_id.
  4. Wireframe SC-10-04 [6] 「段階2 ¥1,000,000〜」 → bậc 3.
  5. README.md:47 ngoại lệ #8 phải khớp câu mới MKT_DB §4.0.
- pl-memory: "P3 luồng 3 xong; D-02..D-05 Fixed; MKT_DB/INCENTIVE_DB/ADR-007 0.3.1; Q-INC-01..03, Q-RULE-01..03 mới."

## Luồng 1 — lot + trade + WF SC-03-02 (DONE_WITH_CONCERNS, 2026-11-25)
- File mới: specs/lot/{README, SC-03-01_SPEC, SC-03-05_SPEC + assets annotated, LOT_FUNC, LOT_REGISTER_TECH, LOT_INSPECTION_RECORD_TECH}; specs/trade/{README, SC-04-01_SPEC, SC-05-02_SPEC + assets, TRADE_FUNC, TRADE_QUALIFICATION_CHECK_TECH, TRADE_AITAI_CONFIRM_TECH, TRADE_SERI_CONFIRM_TECH, TRADE_SAME_DAY_FIX_TECH}; api-design/lot/API-LOT-001..006, api-design/trade/API-TRD-001..008; wireframes/SC-03-02-lot-provisional-intake-dock-tablet-wireframe.md (+ dòng SCREEN-LIST, _index).
- Script ảnh (scratchpad\annot\render_annotated.py) — nên chuyển vào scripts/. Ảnh SC-05-02 bản mới + SC-03-05 chưa xem lại.
- Index: specs/_index.md +12 dòng (SPEC-SC-03-01-001, SPEC-SC-03-05-001, SPEC-LOT_FUNC-001, SPEC-LOT_REGISTER-001, SPEC-LOT_INSPECTION_RECORD-001, SPEC-SC-04-01-001, SPEC-SC-05-02-001, SPEC-TRADE_FUNC-001, SPEC-TRADE_QUALIFICATION_CHECK-001, SPEC-TRADE_AITAI_CONFIRM-001, SPEC-TRADE_SERI_CONFIRM-001, SPEC-TRADE_SAME_DAY_FIX-001); API +14 (API-LOT-001..006, API-TRD-001..008, link lot/…, trade/…).
- Mã lỗi: E-LOT-001..017 (LOT_FUNC §3.1), E-TRD-001..027 (TRADE_FUNC §3.1; E-TRD-005 許可 / E-TRD-006 承認 tách riêng). Mã chung đề xuất E-CMN-001/002/003/004/006/007 (401, 403, 423 DAY_LOCKED, 500, deadlock, định dạng) — KHÁC tên luồng 3 (AUTH_REQUIRED, MFA_*, FORBIDDEN, VALIDATION, INTERNAL) → phải thống nhất. Body lỗi {error:{code,message,field?,detail?,traceId?}} theo prototype; _common/api-conventions.md chưa có (ISS-36).
- Câu hỏi: Q-LOT-01..05, A-LOT-01, Q-TRD-01..05, A-TRD-01..02, Q-SC0302-01..03. Ưu tiên hỏi khách: Q-TRD-02, Q-TRD-05, Q-LOT-01, Q-SC0302-02.
- Mâu thuẫn DB/thiết kế:
  1. lots.lot_no NOT NULL vs WF SC-03-01 [9] (Q-LOT-01).
  2. Chú thích enum ATTR_FIX ở MKT_DB §4.0 ngược thiết kế sổ SL.
  3. lots.voucher_no VARCHAR(30) vs WF ≤20.
  4. lot_inspections thiếu second_checker_id, rerecord_reason.
  5. code_values thiếu INSPECTION_GRADE (RULE_DB).
  6. Cột view v_qualification_current, v_buyer_period_usage chưa định nghĩa.
  7. trade_event.APPROVE ghi chú 「承認」 ở MKT_DB (L4-D03).
  8. seri_status chỉ 2 giá trị; SC-05-02 thêm item [12] lý do 差し戻し → cập nhật WF-SC-05-02.
  9. lots thiếu registered_at.
  10. Thiếu _common/api-conventions.md, api-list.md, error-codes.md; API-LOT-005 (shippers master) đặt tạm ở lot.
  11. Sequence PNG chưa xuất (BM-53 đòi PNG) — chờ mmdc.
  12. Số "16 tài liệu" ở wireframes/_index.md và cột đếm WF cụm C3 ở SCREEN-LIST cần cập nhật.
  13. Thiếu API tra mã nhân viên (iam, GET /api/staff/lookup) cho SC-03-05 [8].

## Luồng 2 — party + delivery + settle (DONE_WITH_CONCERNS, 2026-11-25)
- D-01 Fixed: wireframes/SC-01-02-…-wireframe.md 0.2.2 (hình vẽ item [17] chưa có nút 「期限前更新を入力」 cho 許可 — lệch nhỏ, cần sửa).
- File mới: specs/party/{README, SC-01-02_SPEC + png, PARTY_FUNC, PTY_PERMIT_LIFECYCLE_TECH, PTY_APPROVAL_LIFECYCLE_TECH}; specs/delivery/{README, SC-06-02/04/05_SPEC + 3 png, DELIVERY_FUNC, DEL_RECORD_TECH, DEL_EXCEPTION_DISPUTE_TECH}; specs/settle/{README, SC-07-02/08-03_SPEC + 2 png, SETTLE_FUNC, STL_DAY_CLOSE_TECH, STL_DEVICE_LOST_TECH, STL_CORRECTION_DECIDE_TECH}; api-design/party/API-PTY-001..007, delivery/API-DEL-001..006, settle/API-STL-001..005.
- Index: specs/_index.md +16 dòng (SPEC-PTY-001..004, SPEC-DEL-001..006, SPEC-STL-001..006) — ID style khác luồng 1/3 (SPEC-SC-xx-yy-001 / SPEC-XXX_FUNC-001) → thống nhất; cột màn cốt lõi delivery thêm SC-06-04, SC-06-05. API +18.
- URL: luồng 2 & 3 dùng /api/v1/..., luồng 1 dùng /api/... → thống nhất (đề xuất /api/v1).
- Mã lỗi: E-CMN đã căn theo luồng 1 (001=401, 002=403, 003=423 DAY_LOCKED, 004=500, 006=409 đồng thời, 007=422 định dạng) + đề xuất 005=403 MFA step-up, 008=409 khóa lạc quan; thông điệp JP 001/002/004 khác chữ luồng 1. E-PTY-001..024, E-DEL-001..030, E-STL-001..028 (011, 013–020 dự trữ).
- Câu hỏi: Q-PTY-01..07, Q-DEL-01..09, Q-STL-01..05.
- Chỗ hở DB/thiết kế:
  1. PARTY_DB thiếu bảng yêu cầu chờ → đề xuất nakaoroshi_permit_requests, baibai_approval_requests (cột ở PTY_PERMIT_LIFECYCLE_TECH §5); cấp mới 許可 ghi REVIEWED + REGISTERED lúc 決裁.
  2. Ngoại lệ giao đổi tiền đi qua trade_fixes → vai DELIVERY tạo trade_fixes (ADR-004 §2.2 chỉ nói TRADE) + cần delivery_exceptions.fix_id để checklist không đếm 2 lần (Q-DEL-04, Q-DEL-09).
  3. dispute_confirmations thiếu cột conclusion, unique exception_id chặn 継続協議 (Q-DEL-07).
  4. WF SC-06-04 nói ngoại lệ ghi được offline vs ADR-008 §2.1 không → spec theo ADR-008 (Q-DEL-01).
  5. ADR-005 checklist #10 đếm phiếu giấy đã phát nhưng không có dữ liệu phát phiếu (Q-STL-02).
  6. PREMISE §3.2 vs PARTY_DB 4.15 lệch MFA cho LIMIT_CHANGED (Q-PTY-07).
  7. Phụ thuộc chưa có spec: iam (POST /api/v1/auth/mfa/verify token một lần, tra theo 社員番号), đính kèm chung, API sync, fn_lot_carry_over, hàm LATE_ENTRY.
