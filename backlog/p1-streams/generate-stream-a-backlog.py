# -*- coding: utf-8 -*-
"""Sinh backlog/a-backlog.yaml (luồng A, LAB-5 P1) từ dữ liệu khai báo gọn."""
import sys, yaml

OUT = sys.argv[1]
FEAT = {"FG01": "party", "FG03": "lot", "FG04": "trade", "FG05": "trade", "FG06": "delivery"}
EPIC = {k: "EP-" + k for k in FEAT}
FGTXT = {k: "FG-" + k[2:] for k in FEAT}
RULE = {"aitai": "rule:aitai-main", "permit": "rule:permit-vs-approval", "human": "rule:human-decision",
        "nover": "rule:no-overwrite", "ver": "rule:versioned-rule"}

issues = []

def I(id, kind, title, role, who, spec, rfp, desc, dod, hours=None, parent=None, deps=(), dspec=(), rules=(), fg=None):
    fgk = id.split("-")[1]
    epic = "EP-CLAR" if fgk == "CLR" else EPIC[fgk]
    ffg = fg if fg else fgk
    labels = ["fg:" + FGTXT[ffg], "feature:" + FEAT[ffg], "kind:" + kind, "role:" + role]
    if kind == "rough":
        labels.append("needs-spec")
    labels += [RULE[r] for r in rules]
    issues.append(dict(id=id, epic=epic, parent=parent, kind=kind, title=title, role=role, assignee=who,
                       labels=labels, spec_refs=list(spec), rfp_refs=list(rfp), depends_on=list(deps),
                       depends_on_spec=list(dspec), hours_hint=hours, description=desc, dod=list(dod)))

def C(n, fg, title, spec, rfp, desc, unlock, rules=(), hours=2):
    I("A-CLR-%02d" % n, "clarify", title, "BrSE", "BrSE-1", spec, rfp, desc,
      ["Có câu trả lời ghi vào spec / PREMISE LAB-5; issue phụ thuộc được mở khóa: " + ", ".join(unlock)],
      hours=hours, rules=rules, fg=fg)

T = "specs/party/technical-design/"
# ---------------------------------------------------------------- FG-01
I("A-FG01-01", "dev", "[FG-01] 参加者マスタ — migration participants / contacts / 保証金履歴", "BE", "BE-1",
  ["PARTY_DB 4.9, 4.10, 4.11", "MKT_DB §4.0"], ["FR-PARTY-01", "SCOPE-01"],
  "Tạo bảng participants, participant_contacts (≤ 2 email có hiệu lực), participant_deposit_history (chỉ thêm, uq_deposit_participant_from).\nKhông gồm bảng 許可 / 承認 (A-FG01-02, -03).",
  ["Migration chạy lên / xuống sạch trên DB trống", "participant_deposit_history không có quyền UPDATE / DELETE cho vai ứng dụng"],
  hours=8, rules=["nover"])
I("A-FG01-02", "dev", "[FG-01] 許可（仲卸）— migration permits / events / requests", "BE", "BE-1",
  ["PARTY_DB 4.12, 4.13, 4.59", "ADR-003 §2"], ["FR-PARTY-02", "BR-PERM-01"],
  "Bảng nakaoroshi_permits, nakaoroshi_permit_events, nakaoroshi_permit_requests + trigger kiểm loại 仲卸, CHECK maker ≠ người 決裁, unique partial uq_permit_requests_open.\nTách hẳn khỏi bảng 承認 (luật 2).",
  ["CHECK DB chặn người nhập tự 決裁 khi gọi thẳng hàm (PTY_PERMIT DoD (c))", "Không có cột / bảng dùng chung với 承認"],
  hours=8, deps=["A-FG01-01"], rules=["permit", "nover"])
I("A-FG01-03", "dev", "[FG-01] 承認（売買参加者）— migration approvals / events / requests", "BE", "BE-1",
  ["PARTY_DB 4.14, 4.15, 4.60"], ["FR-PARTY-03", "BR-PERM-01"],
  "Bảng baibai_approvals (参加上限, limit_mode), baibai_approval_events (gồm LIMIT_CHANGED old / new / effective_on, mfa_verified_at), baibai_approval_requests.\nTách khỏi bảng 許可 (luật 2).",
  ["Event có decided_by thì bắt buộc mfa_verified_at (CHECK)", "Không có cột / bảng dùng chung với 許可"],
  hours=8, deps=["A-FG01-01"], rules=["permit", "nover"])
I("A-FG01-04", "dev", "[FG-01] v_qualification_current — view tư cách hiện hành (許可 / 承認)", "BE", "BE-1",
  ["MKT_DB §4.0a (v_qualification_current)", T + "PTY_APPROVAL_LIFECYCLE_TECH.md §5"], ["BR-PERM-01"],
  "View UNION ALL hai bảng nakaoroshi_permits (KYOKA) / baibai_approvals (SHONIN), một dòng / người × căn cứ; participation_limit_jpy NULL với KYOKA.\nModule trade chỉ đọc qua view này.",
  ["Một 仲卸 chỉ ra dòng KYOKA, một 売買参加者 chỉ ra dòng SHONIN", "limit_mode = DEPOSIT trả hạn mức theo 保証金 hiệu lực tại ngày"],
  hours=6, deps=["A-FG01-02", "A-FG01-03"], rules=["permit"])
I("A-FG01-05", "dev", "[FG-01] 参加者詳細 API — API-PTY-001 lấy chi tiết + API-PTY-002 lưu cơ bản", "BE", "BE-1",
  ["specs/party/function-specifications/PARTY_FUNC.md 2.1, 2.2", "API-PTY-001", "API-PTY-002"], ["FR-PARTY-01"],
  "getParticipantDetail trả khối permit (仲卸) hoặc approval (売買参加者), không khối chung; updateParticipantBasic có khóa lạc quan.",
  ["PARTY_FUNC 3.1 dòng 2.1–2.2 (a), (b): sửa từ hai máy → máy sau 409 E-CMN-008"],
  hours=10, deps=["A-FG01-04"], rules=["permit"])
I("A-FG01-06", "dev", "[FG-01] 保証金変更 — API-PTY-003 đổi 保証金 (照合部門長, MFA, thêm dòng)", "BE", "BE-1",
  ["PARTY_FUNC 2.3", "API-PTY-003", T + "PTY_APPROVAL_LIFECYCLE_TECH.md §5"], ["FR-PARTY-03", "PRM-046"],
  "changeDeposit: chỉ STL-HEAD + step-up MFA, INSERT participant_deposit_history + audit; trả limitAfter.\nKhông sinh LIMIT_CHANGED khi limitMode = DEPOSIT.",
  ["PARTY_FUNC 3.1 dòng 2.3 (a)–(d)", "PTY_APPROVAL DoD (h)"],
  hours=8, deps=["A-FG01-01"], dspec=["DEP-01 API MFA verify (iam)", "IAM_AUDIT_DB audit_logs"], rules=["nover"])
# 許可 lifecycle
P = T + "PTY_PERMIT_LIFECYCLE_TECH.md"
I("A-FG01-07", "dev", "[FG-01] 許可ライフサイクル — vòng đời 許可 仲卸 (cấp mới / gia hạn / đình chỉ)", "BE", "BE-1",
  [P], ["FR-PARTY-02", "BR-PERM-01", "PRM-121"],
  "Issue cha: toàn bộ PTY_PERMIT_LIFECYCLE_TECH §4. Lá ở sub-issue.", ["Mọi sub-issue xong; PTY_PERMIT DoD (a)–(i) đạt ở A-FG01-10"],
  hours=30, deps=["A-FG01-02"], rules=["permit", "nover"])
I("A-FG01-07.1", "dev", "[FG-01] 許可申請作成 — fn_permit_request_create + API-PTY-004", "BE", "BE-1",
  [P + " §4.1, §4.2", "API-PTY-004"], ["FR-PARTY-02"],
  "Tạo yêu cầu NEW / RENEW / SUSPEND / 再審査 cho 許可; một yêu cầu mở / tư cách; RENEW khi đã 失効 → hướng 再審査.",
  ["PTY_PERMIT DoD (d), (e), (h)"], hours=10, parent="A-FG01-07", rules=["permit"])
I("A-FG01-07.2", "dev", "[FG-01] 許可 起案・決裁・却下 — fn_permit_request_propose / decide / reject + API-PTY-005", "BE", "BE-1",
  [P + " §4.3, §4.4, §4.5", "API-PTY-005"], ["FR-PARTY-02", "CAP-HUMAN-01"],
  "STL-HEAD 審査 + 起案, OPS-HEAD 決裁 có MFA (cấp mới, giả định OPEN-DB-09); 却下; hai event REVIEWED + REGISTERED cùng transaction; hiệu lực ngay lúc 決裁.",
  ["PTY_PERMIT DoD (b), (c), (f)"], hours=14, parent="A-FG01-07", deps=["A-FG01-07.1"],
  dspec=["DEP-01 API MFA verify (iam)"], rules=["permit", "human"])
I("A-FG01-07.3", "dev", "[FG-01] 許可 失効ジョブ — fn_permit_expire_due khi mở 業務日", "BE", "BE-1",
  [P + " §4.6", "SCREEN-LIST §4 SC-01-B1"], ["FR-PARTY-02", "PRM-045"],
  "Job ở lần mở 業務日: valid_to < 業務日 → EXPIRED + event (decided_by NULL) + 1 dòng audit tổng; lỗi DB không chặn mở ngày (alarm).\nKhông gồm cảnh báo sắp hết hạn (A-FG01-12.4).",
  ["PTY_PERMIT DoD (g): chạy lại cùng ngày không sinh thêm dòng"], hours=6, parent="A-FG01-07",
  dspec=["DEP-12 hàm mở 業務日 (calendar)"], rules=["permit", "nover"])
# 承認 lifecycle
P = T + "PTY_APPROVAL_LIFECYCLE_TECH.md"
I("A-FG01-08", "dev", "[FG-01] 承認ライフサイクル — vòng đời 承認 売買参加者 + 参加上限", "BE", "BE-2",
  [P], ["FR-PARTY-03", "BR-PERM-01", "PRM-046"],
  "Issue cha: toàn bộ PTY_APPROVAL_LIFECYCLE_TECH §4 (hàm, bảng, endpoint tách khỏi 許可).", ["Mọi sub-issue xong; PTY_APPROVAL DoD (a)–(i) đạt ở A-FG01-11"],
  hours=34, deps=["A-FG01-03"], rules=["permit", "nover"])
I("A-FG01-08.1", "dev", "[FG-01] 承認申請作成 — fn_approval_request_create + API-PTY-006 (NEW/RENEW/SUSPEND)", "BE", "BE-2",
  [P + " §4.1, §4.2", "API-PTY-006"], ["FR-PARTY-03"],
  "Tạo yêu cầu 承認; một yêu cầu mở / tư cách (E-PTY-011); RENEW khi 失効 → E-PTY-013 + nextAction; newValidTo không hợp lệ → E-PTY-014.",
  ["PTY_APPROVAL DoD (e), (f)"], hours=10, parent="A-FG01-08", rules=["permit"])
I("A-FG01-08.2", "dev", "[FG-01] 参加上限変更 — fn_approval_limit_change một bước (照合部門長 + MFA)", "BE", "BE-2",
  [P + " §4.2b", "API-PTY-006 kind LIMIT_CHANGE"], ["FR-PARTY-03", "PRM-046"],
  "STL-HEAD đổi 参加上限 trực tiếp, không checker; đúng 1 event LIMIT_CHANGED (old / new / effective_on), cập nhật baibai_approvals cùng transaction.",
  ["PTY_APPROVAL DoD (c), (d)", "PARTY_FUNC 3.1 dòng 2.6"], hours=8, parent="A-FG01-08",
  dspec=["DEP-01 API MFA verify (iam)"], rules=["permit", "nover"])
I("A-FG01-08.3", "dev", "[FG-01] 承認 確認・却下 — fn_approval_request_decide / reject + API-PTY-007", "BE", "BE-2",
  [P + " §4.3, §4.4", "API-PTY-007"], ["FR-PARTY-03", "CAP-HUMAN-01"],
  "STL-HEAD (khác người nhập) 確認 + MFA → VALID + REGISTERED; 却下 có lý do; SUSPEND hiệu lực ngay lúc 決裁.",
  ["PTY_APPROVAL DoD (b), (i)"], hours=10, parent="A-FG01-08", deps=["A-FG01-08.1"],
  dspec=["DEP-01 API MFA verify (iam)"], rules=["permit", "human"])
I("A-FG01-08.4", "dev", "[FG-01] 承認 失効ジョブ — fn_approval_expire_due khi mở 業務日", "BE", "BE-2",
  [P + " §4.5", "PARTY_FUNC 2.8"], ["FR-PARTY-03", "PRM-045"],
  "Như 許可: EXPIRED + event, idempotent trong ngày; yêu cầu mở giữ nguyên.",
  ["PTY_APPROVAL DoD (g)", "PARTY_FUNC 3.1 dòng 2.8"], hours=6, parent="A-FG01-08",
  dspec=["DEP-12 hàm mở 業務日 (calendar)"], rules=["permit", "nover"])
# SC-01-02 FE
S = "specs/party/screen-specification/SC-01-02_SPEC.md"
I("A-FG01-09", "dev", "[FG-01] SC-01-02 参加者詳細・編集 — màn hai khối 許可 / 承認", "FE", "FE-1",
  [S, "wireframes/SC-01-02-participant-detail-kyoka-shonin-wireframe.md"], ["FR-PARTY-01", "FR-PARTY-02", "FR-PARTY-03"],
  "Issue cha của màn SC-01-02 (L4-D02). Lá ở sub-issue.", ["Mọi sub-issue xong; trạng thái §6.1, quyền §6.2 đúng"],
  hours=36, deps=["A-FG01-05"], rules=["permit"])
I("A-FG01-09.1", "dev", "[FG-01] SC-01-02 基本情報・保証金 — thông tin cơ bản + lịch sử 保証金", "FE", "FE-1",
  [S + " §4.1, §4.2, §5", "API-PTY-001", "API-PTY-002", "API-PTY-003"], ["FR-PARTY-01"],
  "Khối thông tin cơ bản, liên lạc (≤ 2 email), đổi 保証金 (chỉ STL-HEAD, MFA C-30), lịch sử 保証金; trạng thái 退会 / offline / đang tải.",
  ["§6.1 các trạng thái Đang tải, 退会, Offline, Lỗi nhập", "§6.2 SETTLE không thấy nút đổi 保証金"], hours=12, parent="A-FG01-09",
  dspec=["DEP-01 API MFA verify (iam)"])
I("A-FG01-09.2", "dev", "[FG-01] SC-01-02 許可ブロック — khối 許可 (chỉ 仲卸) + lịch sử + nút thủ tục", "FE", "FE-1",
  [S + " §4.1, §6.1, §6.4"], ["FR-PARTY-02", "PRM-045"],
  "Khối 【許可】: trạng thái chữ + màu, nhãn 失効まで n日, yêu cầu đang chờ (C-27), nút sang SC-01-03 / SC-01-05; không hiện với 売買参加者.",
  ["§6.1 trạng thái 仲卸 chưa có 許可, sắp hết hạn, 一時停止 / 失効, đang chờ 決裁"], hours=10, parent="A-FG01-09",
  rules=["permit"])
I("A-FG01-09.3", "dev", "[FG-01] SC-01-02 承認ブロック — khối 承認 + 参加上限 + đổi hạn mức", "FE", "FE-1",
  [S + " §4.1, §6.1, §6.4", "API-PTY-006 LIMIT_CHANGE"], ["FR-PARTY-03", "PRM-046"],
  "Khối 【承認】: trạng thái, 参加上限 (税込 / 税抜), lịch sử LIMIT_CHANGED, hộp đổi 参加上限 (STL-HEAD, MFA); chữ duyệt nội bộ dùng 確認 / 決裁.",
  ["§6.1 trạng thái 売買参加者 chưa có 承認, đang chờ 確認", "Không có chữ 「承認」 cho bước duyệt nội bộ (L4-D03)"],
  hours=14, parent="A-FG01-09", deps=["A-FG01-08.2"], rules=["permit"])
I("A-FG01-10", "test", "[FG-01] テスト 許可 — kịch bản + dữ liệu test vòng đời 許可", "QA", "QA-1",
  [T + "PTY_PERMIT_LIFECYCLE_TECH.md §5 Điều kiện hoàn thành"], ["FR-PARTY-02", "BR-PERM-01"],
  "Test tích hợp gọi API / hàm DB cho PTY_PERMIT DoD (a)–(i), gồm ca 10:04 / 10:06 quanh giờ 決裁 SUSPEND.",
  ["Mỗi DoD (a)–(i) có ít nhất 1 ca; mỗi mã E-PTY do 許可 trả có 1 ca đúng HTTP status"],
  hours=8, deps=["A-FG01-07"], rules=["permit", "nover"])
I("A-FG01-11", "test", "[FG-01] テスト 承認・保証金 — kịch bản test 承認, 参加上限, 保証金", "QA", "QA-1",
  [T + "PTY_APPROVAL_LIFECYCLE_TECH.md §5 Điều kiện hoàn thành", "PARTY_FUNC 3.1"], ["FR-PARTY-03", "PRM-046"],
  "Test PTY_APPROVAL DoD (a)–(i) + PARTY_FUNC 3.1 (2.1–2.3, 2.6, 2.8) + UI SC-01-02 hai khối.",
  ["Mỗi DoD có ít nhất 1 ca", "Lỗi tư cách 承認 ra E-TRD-006, 許可 ra E-TRD-005 — không mã chung (DoD (a))"],
  hours=10, deps=["A-FG01-08", "A-FG01-06", "A-FG01-09"], rules=["permit", "nover"])
I("A-FG01-12", "rough", "[FG-01][概算] 参加者 画面群 — SC-01-01, SC-01-05, SC-01-06 + cảnh báo hết hạn", "FE", "FE-1",
  ["SCREEN-LIST C2 #5, #9, #10", "SCREEN-LIST §4 SC-01-B1"], ["FR-PARTY-01", "PRM-045", "PRM-121"],
  "Màn mức List, chưa có Screen Specification / API Design (L4-D08). Giờ = FE 人日 LAB-1 (費用表 画面別内訳) × 8; BE chưa tách.",
  ["Có Screen Specification / API Design rồi tách lại"], hours=63, deps=[], rules=["permit"])
I("A-FG01-12.1", "rough", "[FG-01][概算] SC-01-01 参加者一覧・検索 (chưa spec)", "FE", "FE-1",
  ["SCREEN-LIST C2 #5"], ["FR-PARTY-01"], "Lọc loại, trạng thái, sắp hết hạn. LAB-1 FE 2,0 人日.",
  ["Có Screen Specification / API Design rồi tách lại"], hours=16, parent="A-FG01-12")
I("A-FG01-12.2", "rough", "[FG-01][概算] SC-01-05 資格状態変更 — 一時停止 / 再審査 / 期限前更新 (chưa spec)", "FE", "FE-1",
  ["SCREEN-LIST C2 #9", "API-PTY-004..007"], ["FR-PARTY-02", "FR-PARTY-03", "PRM-121"],
  "Màn 起案 → 決裁 / 確認 (MFA) dùng API đã có; thiếu Screen Spec. LAB-1 FE 2,5 人日.",
  ["Có Screen Specification rồi tách lại"], hours=20, parent="A-FG01-12", rules=["permit", "human"])
I("A-FG01-12.3", "rough", "[FG-01][概算] SC-01-06 資格照会 — tra tư cách nhanh (chưa spec)", "FE", "FE-2",
  ["SCREEN-LIST C2 #10"], ["BR-PERM-01"], "Màu + chữ, ghi đúng 許可 / 承認. LAB-1 FE 2,6 人日.",
  ["Có Screen Specification / API Design rồi tách lại"], hours=21, parent="A-FG01-12", rules=["permit"])
I("A-FG01-12.4", "rough", "[FG-01][概算] 失効予告 — job cảnh báo 許可 / 承認 sắp hết hạn (chưa spec)", "BE", "BE-1",
  ["SCREEN-LIST §4 SC-01-B1", "TRADE_QUALIFICATION_CHECK_TECH §5"], ["PRM-045"],
  "Phần sinh cảnh báo ≤ 30 ngày chưa có Technical Design (xem A-GAP-03). Giờ [PL].",
  ["Có Technical Design rồi tách lại"], hours=6, parent="A-FG01-12", dspec=["DEP-13 worker outbox notify"], rules=["permit"])
I("A-FG01-13", "rough", "[FG-01][概算] 許可・承認 登録画面 — SC-01-03, SC-01-04 (DEP-15)", "FE", "FE-1",
  ["specs/_index.md DEP-15", "SCREEN-LIST C2 #7, #8", "API-PTY-004..007"], ["FR-PARTY-02", "FR-PARTY-03"],
  "API đã có, thiếu Screen Specification 2 màn. Giờ = FE 人日 LAB-1 × 8.", ["Có Screen Specification rồi tách lại"],
  hours=48, rules=["permit"])
I("A-FG01-13.1", "rough", "[FG-01][概算] SC-01-03 許可登録・更新（仲卸）(chưa spec)", "FE", "FE-1",
  ["DEP-15", "SCREEN-LIST C2 #7"], ["FR-PARTY-02"], "Chỉ cho 仲卸. LAB-1 FE 3,0 人日.",
  ["Có Screen Specification rồi tách lại"], hours=24, parent="A-FG01-13", deps=["A-FG01-07.1"], rules=["permit"])
I("A-FG01-13.2", "rough", "[FG-01][概算] SC-01-04 承認登録・更新（売買参加者）(chưa spec)", "FE", "FE-2",
  ["DEP-15", "SCREEN-LIST C2 #8"], ["FR-PARTY-03"], "Chỉ cho 売買参加者, gồm 参加上限. LAB-1 FE 3,0 人日.",
  ["Có Screen Specification rồi tách lại"], hours=24, parent="A-FG01-13", deps=["A-FG01-08.1"], rules=["permit"])

# ---------------------------------------------------------------- FG-03
L = "specs/lot/"
I("A-FG03-01", "dev", "[FG-03] ロット — migration lots / lot_status_history", "BE", "BE-2",
  ["LOT_DB 4.25, 4.26", "MKT_DB §4.0 lot_status"], ["FR-LOT-01", "FR-LOT-03"],
  "Bảng lots (lot_no NOT NULL, provisional_no, voucher_no VARCHAR(20), registered_at), lot_status_history (is_sale_end, carried_to_date); enum lot_status 7 giá trị.\nCANCELLED chỉ từ PROVISIONAL, không DELETE.",
  ["Migration lên / xuống sạch", "Không có quyền DELETE lots cho vai ứng dụng"], hours=8,
  dspec=["CLOSE_DB 4.57 day_counters", "CLOSE_DB 4.20 業務日"], rules=["nover"])
I("A-FG03-02", "dev", "[FG-03] 数量台帳・目利き — migration lot_inspections / ledger + view SL", "BE", "BE-2",
  ["LOT_DB 4.27, 4.28", "MKT_DB §4.0a v_lot_available_qty"], ["FR-LOT-02", "FR-LOT-04", "BR-LOT-02"],
  "lot_inspections (batch_no, second_checker_id, rerecord_reason), lot_quantity_ledger chỉ thêm (RECEIVE / SALE / SALE_REVERSE / ATTR_FIX), view v_lot_available_qty.",
  ["Sổ SL chỉ INSERT; SL khả dụng = Σ qty_delta ≥ 0 (BR-LOT-02)"], hours=8, deps=["A-FG03-01"], rules=["nover", "human"])
I("A-FG03-03", "dev", "[FG-03] フォーム選択肢 — API-LOT-005 tra 出荷者 + API-LOT-006 giá trị form", "BE", "BE-2",
  [L + "function-specifications/LOT_FUNC.md 2.7, 2.8", "API-LOT-005", "API-LOT-006"], ["FR-LOT-01", "FORM-LOT-01"],
  "searchShippers (mã 出荷者 thay text tự do — D15), getLotFormOptions (業務日 đang mở, giờ nhận lô, 品目, đơn vị, 等級 từ master).",
  ["LOT_FUNC 2.7–2.8 trả đúng theo API Design; 等級 đọc từ master INSPECTION_GRADE, không hard-code"], hours=8,
  dspec=["RULE_DB 4.18 master (shippers, item_codes, INSPECTION_GRADE)", "DEP-12 業務日 OPEN"])
I("A-FG03-04", "dev", "[FG-03] ロット検索 — API-LOT-001 仮受付 chờ 本登録 + API-LOT-003 tìm lô", "BE", "BE-2",
  ["LOT_FUNC 2.1, 2.4", "API-LOT-001", "API-LOT-003"], ["FR-LOT-01", "FR-LOT-03"],
  "listPendingProvisionalLots; searchLots luôn có điều kiện ngày + limit, q tìm cả 仮番号 tới hết 業務日, onSale = PUBLISHED và SL > 0 (gồm 持ち越し).",
  ["LOT_REGISTER DoD (g): gõ 仮番号 K1-012 ra đúng lô cả sau 本登録"], hours=10, deps=["A-FG03-02"])
P = L + "technical-design/LOT_REGISTER_TECH.md"
I("A-FG03-05", "dev", "[FG-03] ロット本登録 — 本登録 lô + dòng sổ 受入 (LOT_REGISTER)", "BE", "BE-2",
  [P, "API-LOT-002"], ["FR-LOT-01", "BR-LOT-02"], "Issue cha: LOT_REGISTER_TECH §4. Lá ở sub-issue.",
  ["LOT_REGISTER DoD (a)–(h) đạt ở A-FG03-10"], hours=26, deps=["A-FG03-02"], rules=["nover"])
I("A-FG03-05.1", "dev", "[FG-03] 本登録 検証 — kiểm request, 業務日 theo giờ nhận lô, master", "BE", "BE-2",
  [P + " §4.1, §4.2"], ["FR-LOT-01", "E-16"],
  "Kiểm người gọi, 業務日 gắn lô từ giờ nhận lô (01:00), số lẻ theo đơn vị, master 出荷者 / 品目; ngày khóa → 423.",
  ["LOT_REGISTER DoD (e), (f)"], hours=8, parent="A-FG03-05", dspec=["DEP-12 業務日 OPEN", "RULE_DB 4.18 master"])
I("A-FG03-05.2", "dev", "[FG-03] 本登録 排他・重複 — khóa lô 仮受付 + kiểm nghi trùng", "BE", "BE-2",
  [P + " §4.3"], ["FR-LOT-01"],
  "Khóa dòng 仮受付 (hai máy cùng bấm → một 409 E-LOT-006); nghi trùng → 409 E-LOT-007, gửi lại confirmDuplicate.",
  ["LOT_REGISTER DoD (c), (d)"], hours=8, parent="A-FG03-05", deps=["A-FG03-05.1"])
I("A-FG03-05.3", "dev", "[FG-03] 本登録 記録 — ghi lô, lịch sử, sổ RECEIVE + API-LOT-002", "BE", "BE-2",
  [P + " §4.4, §4.5", "API-LOT-002"], ["FR-LOT-01", "BR-LOT-02"],
  "Ghi lots RECEIVED (hoặc 新規 cấp lot_no theo ngày), lot_status_history, 1 dòng RECEIVE = SL xác nhận; commit + response.",
  ["LOT_REGISTER DoD (a), (b), (h)"], hours=10, parent="A-FG03-05", deps=["A-FG03-05.2"],
  dspec=["CLOSE_DB 4.57 day_counters"], rules=["nover"])
P = L + "technical-design/LOT_INSPECTION_RECORD_TECH.md"
I("A-FG03-06", "dev", "[FG-03] 目利き記録 — ghi kết quả 目利き・下見 do người quyết", "BE", "BE-3",
  [P, "API-LOT-004"], ["FR-LOT-02", "CAP-HUMAN-01", "SCOPE-OUT-06"], "Issue cha: LOT_INSPECTION_RECORD_TECH §4. Không AI / OCR, không hạng gợi ý.",
  ["LOT_INSPECTION DoD (a)–(e) đạt ở A-FG03-11"], hours=18, deps=["A-FG03-02"], rules=["human", "nover"])
I("A-FG03-06.1", "dev", "[FG-03] 目利き 検証 — kiểm request, hạng, người xác nhận thứ hai", "BE", "BE-3",
  [P + " §4.1, §4.2"], ["FR-LOT-02", "CAP-HUMAN-01"],
  "Hạng phải thuộc master; người thứ hai trùng người ghi → 422 E-LOT-012; lô có GD phải có lý do ghi lại.",
  ["LOT_INSPECTION DoD (c), (e)"], hours=8, parent="A-FG03-06",
  dspec=["DEP-02 GET /api/v1/staff/lookup (iam)", "RULE_DB 4.18 INSPECTION_GRADE"], rules=["human"])
I("A-FG03-06.2", "dev", "[FG-03] 目利き 記録 — ghi từng lô theo batch + API-LOT-004", "BE", "BE-3",
  [P + " §4.3, §4.4", "API-LOT-004"], ["FR-LOT-02"],
  "Ghi lot_inspections cùng batch_no, lô → INSPECTED; một lô PROVISIONAL / DELIVERED trong lượt → rollback cả lượt.",
  ["LOT_INSPECTION DoD (a), (b), (d)"], hours=10, parent="A-FG03-06", deps=["A-FG03-06.1"], rules=["human", "nover"])
I("A-FG03-07", "dev", "[FG-03] ロット引当 — fn_lot_lock_for_sale + fn_lot_book_quantity (public cho trade)", "BE", "BE-3",
  [L + "function-specifications/LOT_FUNC.md 2.9, 2.10"], ["BR-LOT-02", "PRM-110"],
  "Khóa lô FOR UPDATE, kiểm PUBLISHED + ngày / 持ち越し, SL khả dụng; ghi dòng sổ; SL = 0 → CLOSED; SALE_REVERSE làm lô có lại SL → PUBLISHED (giả định Q-LOT-05).",
  ["Sổ SL không âm khi hai GD song song", "CLOSED / mở lại có dòng lot_status_history"], hours=10, deps=["A-FG03-02"], rules=["nover"])
S = L + "screen-specification/SC-03-01_SPEC.md"
I("A-FG03-08", "dev", "[FG-03] SC-03-01 ロット本登録 — màn 本登録 ở bàn tiếp nhận PC", "FE", "FE-2",
  [S, "wireframes/SC-03-01-lot-main-registration-wireframe.md"], ["FR-LOT-01", "FORM-LOT-01"],
  "Issue cha của màn SC-03-01. Lá ở sub-issue.", ["Mọi sub-issue xong; trạng thái §6.1 đúng"], hours=26,
  deps=["A-FG03-04", "A-FG03-05"])
I("A-FG03-08.1", "dev", "[FG-03] SC-03-01 仮受付一覧 — danh sách chờ 本登録 + tìm 仮番号", "FE", "FE-2",
  [S + " §4.1, §6.1", "API-LOT-001", "API-LOT-003"], ["FR-LOT-01"],
  "Bảng [1] ~150 dòng không phân trang, chọn dòng điền form; tìm theo 仮番号.", ["§6.1 trạng thái danh sách rỗng / đang tải / offline"],
  hours=12, parent="A-FG03-08")
I("A-FG03-08.2", "dev", "[FG-03] SC-03-01 登録フォーム — form 本登録, nghi trùng, mã lô", "FE", "FE-2",
  [S + " §4.1, §4.2, §5", "API-LOT-002", "API-LOT-005", "API-LOT-006"], ["FR-LOT-01", "E-16"],
  "Form + validate số lẻ theo đơn vị, hộp xác nhận nghi trùng, toast [9] mã lô; 423 ngày khóa → C-24 sang 修正申請.",
  ["§4.2 validation đủ; §5 event 409 E-LOT-007 → hộp xác nhận"], hours=14, parent="A-FG03-08",
  dspec=["DEP-09 SC-08-01 修正申請作成 (đích nút C-24)"])
S = L + "screen-specification/SC-03-05_SPEC.md"
I("A-FG03-09", "dev", "[FG-03] SC-03-05 目利き・下見結果入力 — màn người đánh giá ghi hạng", "FE", "FE-2",
  [S, "wireframes/SC-03-05-mekiki-inspection-result-entry-wireframe.md"], ["FR-LOT-02", "CAP-HUMAN-01"],
  "Issue cha của màn SC-03-05. Không có hạng mặc định, không gợi ý.", ["Mọi sub-issue xong"], hours=22,
  deps=["A-FG03-06"], rules=["human"])
I("A-FG03-09.1", "dev", "[FG-03] SC-03-05 一括記録 — chọn lô + bấm hạng + ghi cả lượt", "FE", "FE-2",
  [S + " §4.1, §4.2, §5"], ["FR-LOT-02"], "Chọn nhiều lô, bấm hạng (không mặc định 「A」), ghi theo batch; lỗi một lô báo cả lượt.",
  ["Không có ô / API trả hạng gợi ý (LOT_INSPECTION DoD (d))"], hours=12, parent="A-FG03-09", rules=["human"])
I("A-FG03-09.2", "dev", "[FG-03] SC-03-05 再記録・確認者 — ghi lại lô đã GD + người thứ hai + mất mạng", "FE", "FE-2",
  [S + " §4.1, §5, §6.1"], ["FR-LOT-02", "CAP-HUMAN-01"],
  "Lô có GD bắt lý do; ô 社員番号 người thứ hai; mất mạng giữ lựa chọn, [10] mờ (C-28), không hàng đợi offline.",
  ["§5 dòng mất mạng (Q-SC0305-01)"], hours=10, parent="A-FG03-09", deps=["A-FG03-09.1"],
  dspec=["DEP-02 GET /api/v1/staff/lookup (iam)"], rules=["human", "nover"])
I("A-FG03-10", "test", "[FG-03] テスト ロット本登録 — test LOT_REGISTER DoD (a)–(h)", "QA", "QA-1",
  [L + "technical-design/LOT_REGISTER_TECH.md §5"], ["FR-LOT-01", "BR-LOT-02"],
  "Test tích hợp + UI SC-03-01; gồm ca hai máy cùng 仮受付, ngày khóa, số lẻ sai, hủy 仮受付 giữ số (h — cần A-FG03-12.2).",
  ["Mỗi DoD (a)–(h) có ít nhất 1 ca; mỗi mã E-LOT do 本登録 trả có 1 ca"], hours=8, deps=["A-FG03-05", "A-FG03-08"], rules=["nover"])
I("A-FG03-11", "test", "[FG-03] テスト 目利き・引当 — test LOT_INSPECTION DoD + sổ SL", "QA", "QA-1",
  [L + "technical-design/LOT_INSPECTION_RECORD_TECH.md §5", "LOT_FUNC 2.9, 2.10"], ["FR-LOT-02", "BR-LOT-02", "CAP-HUMAN-01"],
  "Test LOT_INSPECTION DoD (a)–(e) + fn_lot_book_quantity (CLOSED / mở lại) + UI SC-03-05.",
  ["Mỗi DoD có ít nhất 1 ca", "Không tồn tại đường nào ghi hạng không qua người (luật 3)"], hours=8,
  deps=["A-FG03-06", "A-FG03-07", "A-FG03-09"], rules=["human", "nover"])
I("A-FG03-12", "rough", "[FG-03][概算] ロット仮受付 — SC-03-02 + API ghi / hủy 仮受付 (DEP-07)", "FE", "FE-2",
  ["specs/_index.md DEP-07", "wireframes/SC-03-02-lot-provisional-intake-dock-tablet-wireframe.md"], ["FR-LOT-01", "FR-LOT-03"],
  "Có wireframe (L4-D05), thiếu API + Screen Spec.", ["Có Screen Specification / API Design rồi tách lại"], hours=39)
I("A-FG03-12.1", "rough", "[FG-03][概算] SC-03-02 仮受付（埠頭タブレット）— FE (chưa spec)", "FE", "FE-2",
  ["DEP-07", "SCREEN-LIST C3 #14"], ["FR-LOT-01", "NFR-AVL-02"],
  "Tablet, 品目 nút to, bàn số, 仮番号 sinh trên máy, 未同期 n件. LAB-1 FE 3,4 人日.",
  ["Có Screen Specification rồi tách lại"], hours=27, parent="A-FG03-12")
I("A-FG03-12.2", "rough", "[FG-03][概算] 仮受付 API — ghi 仮受付 online + hủy → CANCELLED (chưa spec)", "BE", "BE-2",
  ["DEP-07", "LOT_REGISTER_TECH §5 mã lô", "LOT_DB 4.25"], ["FR-LOT-01"],
  "Cấp lot_no khi lên server, hủy giữ số (Q-LOT-01). Giờ [PL].", ["Có API Design rồi tách lại"],
  hours=12, parent="A-FG03-12", rules=["nover"])
I("A-FG03-13", "rough", "[FG-03][概算] オフライン同期 — API hàng đợi sync + SC-03-07 đối chiếu (DEP-04)", "BE", "BE-1",
  ["specs/_index.md DEP-04", "ADR-008", "wireframes/SC-03-07-offline-sync-reconciliation-wireframe.md"], ["NFR-AVL-02", "FR-LOT-01", "FR-DEL-01"],
  "Module sync chưa có API Design / Technical Design; SC-03-07 mới có wireframe.", ["Có Technical Design + API Design + Screen Spec rồi tách lại"],
  hours=58, rules=["human", "nover"])
I("A-FG03-13.1", "rough", "[FG-03][概算] 同期API — nhận hàng đợi offline, idempotent, HELD (chưa spec)", "BE", "BE-1",
  ["DEP-04", "api-conventions §6", "IAM_AUDIT_DB offline_sync_records", "DEL_RECORD_TECH §5"], ["NFR-AVL-02"],
  "clientRecordId idempotent; ngày khóa → HELD; gọi fn_delivery_record cờ offline. Giờ [PL].",
  ["Có Technical Design + API Design rồi tách lại"], hours=16, parent="A-FG03-13", rules=["nover"])
I("A-FG03-13.2", "rough", "[FG-03][概算] SC-03-07 オフライン同期・照合 — FE (chưa spec)", "FE", "FE-1",
  ["DEP-04", "SCREEN-LIST C3 #18"], ["NFR-AVL-02", "CAP-HUMAN-01"],
  "Xung đột → người chọn giữ / bỏ / 修正申請 LATE_ENTRY, không tự gộp. LAB-1 FE 5,2 人日.",
  ["Có Screen Specification rồi tách lại"], hours=42, parent="A-FG03-13", deps=["A-FG03-13.1"], rules=["human"])
I("A-FG03-14", "rough", "[FG-03][概算] ロット一覧・詳細 — SC-03-03, SC-03-04 + 販売公開 / 販売終了", "FE", "FE-2",
  ["SCREEN-LIST C3 #15, #16", "MKT_DB §4.0 lot_status", "LOT_FUNC 2.9"], ["FR-LOT-03", "FR-LOT-04", "PRM-110", "PRM-128"],
  "Màn List chưa spec; thao tác 販売公開 (INSPECTED → PUBLISHED) và 販売終了 chưa có API / Function Spec (A-GAP-01).",
  ["Có Screen Specification / API Design rồi tách lại"], hours=38, rules=["nover"])
I("A-FG03-14.1", "rough", "[FG-03][概算] SC-03-03 ロット一覧 + 一括販売公開 / 販売終了 (chưa spec)", "FE", "FE-2",
  ["SCREEN-LIST C3 #15", "API-LOT-003"], ["FR-LOT-03", "PRM-110"], "LAB-1 FE 2,0 人日.",
  ["Có Screen Specification rồi tách lại"], hours=16, parent="A-FG03-14")
I("A-FG03-14.2", "rough", "[FG-03][概算] 販売公開 API — đổi PUBLISHED / 販売終了 + lịch sử (chưa spec)", "BE", "BE-2",
  ["MKT_DB §4.0 lot_status", "LOT_DB 4.26 is_sale_end"], ["FR-LOT-03", "PRM-110", "E-13"],
  "Chặn đường chính 相対 (API-TRD-002 cần lô PUBLISHED). Giờ [PL].", ["Có API Design / Function Spec rồi tách lại"],
  hours=8, parent="A-FG03-14", rules=["nover"])
I("A-FG03-14.3", "rough", "[FG-03][概算] SC-03-04 ロット詳細 + sửa thuộc tính ATTR_FIX (chưa spec)", "FE", "FE-2",
  ["SCREEN-LIST C3 #16", "PRM-128"], ["FR-LOT-04"], "Gộp SC-03-06; lý do, before / after. LAB-1 FE 1,75 人日.",
  ["Có Screen Specification / API Design rồi tách lại"], hours=14, parent="A-FG03-14", rules=["nover"])
I("A-FG03-15", "rough", "[FG-03][概算] 持ち越し — hàm fn_lot_carry_over khi 日次締め (DEP-05)", "BE", "BE-2",
  ["specs/_index.md DEP-05", "LOT_DB 4.25, 4.26 carried_to_date", "ADR-005 §2.4"], ["FR-LOT-03", "E-12"],
  "Thiếu Function Spec; gọi trong transaction 日次締め. Giờ [PL].", ["Có Function Spec rồi tách lại"], hours=6,
  dspec=["STL_DAY_CLOSE_TECH"], rules=["nover"])
I("A-FG03-16", "dev", "[FG-03] 引渡し完了 — chuyển lô CLOSED → DELIVERED theo v_delivery_status", "BE", "BE-2",
  ["DEL_RECORD_TECH §5 (Không làm)", "LOT_INSPECTION_RECORD_TECH §4.3", "MKT_DB §4.0 lot_status"], ["FR-DEL-02", "FR-LOT-03"],
  "Theo đề xuất A-PS-01: hàm public của module lot, gọi trong transaction ghi giao / ngoại lệ; ghi lot_status_history.\nChờ Gate A chốt A-PS-01.",
  ["Lô CLOSED có mọi GD 引渡し完了 → DELIVERED + 1 dòng lịch sử", "Ngoại lệ làm GD chưa xong → lô không DELIVERED"],
  hours=6, deps=["A-FG03-07", "A-FG06-04"], rules=["nover"])

# ---------------------------------------------------------------- FG-04 (相対 — luồng chính)
TT = "specs/trade/technical-design/"
I("A-FG04-01", "dev", "[FG-04] 取引 — migration trades / trade_status_history / print_logs", "BE", "BE-3",
  ["TRADE_DB 4.30, 4.31, 4.33"], ["FR-AITAI-01", "FIG-012"],
  "trades (source AITAI / SERI / PAPER_LATE, over_limit_*, incentive_period_id), trade_status_history (FIG-012), print_logs.\nGD đóng băng sau 確定, chặn xóa (trigger).",
  ["UPDATE nội dung GD CONFIRMED bị chặn ở DB", "Không DELETE trades"], hours=10, deps=["A-FG03-01"],
  dspec=["CLOSE_DB 4.57 day_counters"], rules=["aitai", "nover"])
I("A-FG04-02", "dev", "[FG-04] 公開ビュー — v_buyer_period_usage + v_trade_effective", "BE", "BE-3",
  ["MKT_DB §4.0a", TT + "TRADE_QUALIFICATION_CHECK_TECH.md §4.4, §5"], ["PRM-046", "FR-AITAI-02"],
  "v_buyer_period_usage (税抜 / 税込 theo kỳ, gồm 相対 + せり đã 確定, giá trị hiệu lực); v_trade_effective (gốc + Σ điều chỉnh, ngày áp + period_id kỳ gốc).",
  ["TRADE_QUALIFICATION DoD (d2), (d3), (f) đúng số ở tầng view"], hours=10, deps=["A-FG04-01"],
  dspec=["ADJUST_DB 4.39 trade_adjustments", "RULE_DB 4.19 tax_rates", "DEP-16 PARTICIPATION_LIMIT_TAX_CODE"], rules=["nover"])
P = TT + "TRADE_QUALIFICATION_CHECK_TECH.md"
I("A-FG04-03", "dev", "[FG-04] 資格確認 — fn_check_buyer_qualification tại thời điểm chốt", "BE", "BE-3",
  [P, "TRADE_FUNC 2.4"], ["BR-PERM-01", "PRM-046"], "Issue cha: dùng chung 相対 / せり / 紙伝票 / 当日訂正.",
  ["TRADE_QUALIFICATION DoD (a)–(f) đạt ở A-FG04-11"], hours=20, deps=["A-FG01-04", "A-FG04-02"], rules=["permit"])
I("A-FG04-03.1", "dev", "[FG-04] 資格確認 許可/承認 — nhánh 仲卸 E-TRD-005 / 売買参加者 E-TRD-006", "BE", "BE-3",
  [P + " §4.1, §4.2, §4.3"], ["BR-PERM-01"],
  "Xác định loại người mua; kiểm 許可 hoặc 承認 qua v_qualification_current tại p_at (online = now, 紙伝票 = giờ phiếu); hai mã lỗi riêng.",
  ["DoD (a), (b): chữ 「仲卸の許可」 / 「売買参加者の承認」 đúng mã"], hours=10, parent="A-FG04-03", rules=["permit"])
I("A-FG04-03.2", "dev", "[FG-04] 参加上限 — kiểm hạn mức theo kỳ (税込), lý do vượt", "BE", "BE-3",
  [P + " §4.4"], ["PRM-046"],
  "Chỉ 売買参加者; so 税込 floor(Σ税抜 × (100+suất)/100); cộng dồn p_extra_used_jpy cho せり nhiều dòng; không chặn cứng — có lý do → over_limit.",
  ["DoD (c), (d), (d2), (d3), (e), (f)"], hours=10, parent="A-FG04-03", deps=["A-FG04-03.1"],
  dspec=["RULE_DB 4.19 tax_rates", "DEP-16 PARTICIPATION_LIMIT_TAX_CODE"], rules=["permit"])
I("A-FG04-04", "dev", "[FG-04] 買受人検索 — API-TRD-001 tìm người mua + tư cách + 参加上限", "BE", "BE-3",
  ["TRADE_FUNC 2.1", "API-TRD-001"], ["FR-AITAI-01", "BR-PERM-01"],
  "searchBuyers theo số / tên: trả căn cứ 許可 hoặc 承認, trạng thái, sắp hết hạn, hạn mức đã dùng (税込 / 税抜).",
  ["Trả đúng theo API Design; 仲卸 không có trường hạn mức"], hours=8, deps=["A-FG04-02"], rules=["permit"])
P = TT + "TRADE_AITAI_CONFIRM_TECH.md"
I("A-FG04-05", "dev", "[FG-04] 相対取引確定 — chốt GD 相対 (luồng chính) + FIG-012 + trừ SL", "BE", "BE-3",
  [P, "API-TRD-002", "TRADE_FUNC 2.2, 2.3, 2.12"], ["FR-AITAI-01", "FR-AITAI-02", "BR-LOT-02", "FIG-012"],
  "Issue cha: TRADE_AITAI_CONFIRM_TECH §4. Bắt buộc online.", ["TRADE_AITAI DoD (a)–(f) đạt ở A-FG04-10"],
  hours=26, deps=["A-FG04-03", "A-FG03-07"], rules=["aitai", "nover"])
I("A-FG04-05.1", "dev", "[FG-04] 相対確定 検証 — kiểm request, giờ chốt, khóa lô, SL / số lẻ", "BE", "BE-3",
  [P + " §4.1, §4.2"], ["FR-AITAI-01", "BR-LOT-02"],
  "01:59 → E-TRD-012; lô không PUBLISHED → E-TRD-001; vượt SL → E-TRD-002 (gọi fn_lot_lock_for_sale).",
  ["DoD (b), (e)"], hours=8, parent="A-FG04-05", rules=["aitai"])
I("A-FG04-05.2", "dev", "[FG-04] 相対確定 記録 — ghi trades + 3 sự kiện FIG-012 (fn_record_trade_event)", "BE", "BE-3",
  [P + " §4.3, §4.4", "TRADE_FUNC 2.12"], ["FR-AITAI-02", "FIG-012", "PRM-114"],
  "Gọi kiểm tư cách; ghi trades CONFIRMED + SUBMIT / APPROVE / CONFIRM cùng người, cùng giờ (A-TRD-01); nhãn UI 「確認」 (A-TRD-02).",
  ["DoD (a), (c), (d)"], hours=10, parent="A-FG04-05", deps=["A-FG04-05.1"], rules=["aitai", "permit", "nover"])
I("A-FG04-05.3", "dev", "[FG-04] 相対確定 数量 — trừ SL lô + API-TRD-002 response / in", "BE", "BE-3",
  [P + " §4.5, §4.6", "API-TRD-002"], ["FR-AITAI-01", "BR-LOT-02"],
  "fn_lot_book_quantity SALE; lô về 0 → CLOSED; commit, response kèm tradeNo và cờ in.",
  ["DoD (a), (f)"], hours=8, parent="A-FG04-05", deps=["A-FG04-05.2"], rules=["aitai", "nover"])
I("A-FG04-06", "dev", "[FG-04] 取引一覧 API — API-TRD-003 danh sách GD (mặc định 相対)", "BE", "BE-3",
  ["TRADE_FUNC 2.5", "API-TRD-003"], ["FR-AITAI-01"],
  "listTrades: luôn có điều kiện ngày + limit; mới nhất lên đầu; giá trị hiệu lực từ v_trade_effective.",
  ["Trả đúng theo API Design"], hours=6, deps=["A-FG04-02"], rules=["aitai"])
I("A-FG04-07", "dev", "[FG-04] 取引確認票 — API-TRD-004 in thẳng / 再発行 PDF + print_logs", "BE", "BE-1",
  ["TRADE_FUNC 2.6", "API-TRD-004"], ["FR-AITAI-01"],
  "Sinh PDF phiếu, in lại có chữ 「再発行」, ghi print_logs; in bằng trình duyệt chế độ kiosk (giả định Q-TRD-03, A-PD-01).",
  ["Lần in thứ hai có chữ 再発行 + dòng print_logs mới", "Phiếu in lot_no / tradeNo chính thức, không in 仮番号"],
  hours=12, deps=["A-FG04-05"], rules=["aitai"])
P = TT + "TRADE_SAME_DAY_FIX_TECH.md"
I("A-FG04-08", "dev", "[FG-04] 当日訂正・取消 — sửa / hủy GD ngày chưa khóa bằng REVERSE / DELTA", "BE", "BE-1",
  [P, "API-TRD-008", "TRADE_FUNC 2.11"], ["FR-AITAI-03", "PRM-127"], "Issue cha: TRADE_SAME_DAY_FIX_TECH §4. GD gốc giữ nguyên.",
  ["TRADE_SAME_DAY_FIX DoD (a)–(g) đạt ở A-FG04-12"], hours=22, deps=["A-FG04-05"],
  dspec=["ADJUST_DB 4.32 trade_fixes, 4.39 trade_adjustments"], rules=["nover"])
I("A-FG04-08.1", "dev", "[FG-04] 当日訂正 検証 — kiểm GD gốc, nội dung mới, tư cách người mua mới", "BE", "BE-1",
  [P + " §4.1, §4.2"], ["FR-AITAI-03", "BR-PERM-01"],
  "Ngày khóa → 423; 取消 GD đã giao → E-TRD-026; đổi 買受人 → kiểm lại tư cách, đánh dấu needsSettleReview.",
  ["DoD (c), (d), (e), (f)"], hours=10, parent="A-FG04-08", rules=["permit", "nover"])
I("A-FG04-08.2", "dev", "[FG-04] 当日訂正 記録 — trade_fixes + REVERSE / DELTA + sổ lô + trạng thái", "BE", "BE-1",
  [P + " §4.3, §4.4"], ["FR-AITAI-03", "BR-LOT-02"],
  "REVERSE giá trị hiện hành (sau lần sửa trước), DELTA giá trị mới; sổ lô SALE_REVERSE / SALE; 取消 → CANCELLED, không DELTA.",
  ["DoD (a), (b), (g)"], hours=12, parent="A-FG04-08", deps=["A-FG04-08.1"], rules=["nover"])
S = "specs/trade/screen-specification/SC-04-01_SPEC.md"
I("A-FG04-09", "dev", "[FG-04] SC-04-01 相対取引入力・確定 — màn chính (dùng nhiều nhất)", "FE", "FE-1",
  [S, "wireframes/SC-04-01-aitai-trade-entry-confirm-wireframe.md"], ["FR-AITAI-01", "FR-AITAI-02", "NFR-USE-01"],
  "Issue cha của màn SC-04-01: ロット→買受人→数量→単価→確定, テンキー, 1 phím chốt.", ["Mọi sub-issue xong; §6.1 trạng thái đúng"],
  hours=38, deps=["A-FG04-04", "A-FG04-05"], rules=["aitai"])
I("A-FG04-09.1", "dev", "[FG-04] SC-04-01 入力 — chọn lô, người mua (tư cách, hạn mức) bằng số", "FE", "FE-1",
  [S + " §4.1, §4.3, §6.1", "API-LOT-003", "API-TRD-001"], ["FR-AITAI-01", "BR-PERM-01"],
  "Gõ mã lô / 仮番号, số người mua; hiện 許可 hoặc 承認 + nhãn 失効まで n日 + hạn mức 税込 / 税抜.",
  ["§6.1 trạng thái người mua 失効 / 一時停止 hiện chữ, không chỉ màu"], hours=14, parent="A-FG04-09", rules=["aitai", "permit"])
I("A-FG04-09.2", "dev", "[FG-04] SC-04-01 確定 — SL, đơn giá, 読み合わせ, chốt 1 phím, lỗi E-TRD", "FE", "FE-1",
  [S + " §4.2, §5"], ["FR-AITAI-02", "PRM-032"],
  "Validate; chốt 1 phím; 409 E-TRD-002 hiện SL thật; 422 E-TRD-007 mở ô lý do vượt hạn mức rồi gửi lại.",
  ["§5 event cho E-TRD-001/002/005/006/007/012"], hours=14, parent="A-FG04-09", deps=["A-FG04-09.1"], rules=["aitai"])
I("A-FG04-09.3", "dev", "[FG-04] SC-04-01 印刷・一覧 — in thẳng phiếu + GD vừa chốt + 423 sang 修正申請", "FE", "FE-1",
  [S + " §5, §6.1", "API-TRD-003", "API-TRD-004"], ["FR-AITAI-01"],
  "In thẳng 取引確認票 sau chốt; danh sách GD vừa chốt; gặp 423 giữa chừng → C-24 mang nội dung sang SC-08-01 (khách #5).",
  ["§6.1 trạng thái ngày khóa (423)"], hours=10, parent="A-FG04-09", deps=["A-FG04-09.2", "A-FG04-07"],
  dspec=["DEP-09 SC-08-01 修正申請作成"], rules=["aitai"])
I("A-FG04-10", "test", "[FG-04] テスト 相対確定 — test TRADE_AITAI DoD (a)–(f) + song song", "QA", "QA-1",
  [TT + "TRADE_AITAI_CONFIRM_TECH.md §5"], ["FR-AITAI-01", "FR-AITAI-02", "BR-LOT-02"],
  "Test tích hợp + UI SC-04-01; gồm hai request song song cùng lô, 01:59, lô về 0.",
  ["Mỗi DoD (a)–(f) có ít nhất 1 ca; sổ SL không âm dưới tải song song"], hours=10, deps=["A-FG04-05", "A-FG04-09"], rules=["aitai", "nover"])
I("A-FG04-11", "test", "[FG-04] テスト 資格・参加上限 — test TRADE_QUALIFICATION DoD (a)–(f)", "QA", "QA-1",
  [TT + "TRADE_QUALIFICATION_CHECK_TECH.md §5"], ["BR-PERM-01", "PRM-046"],
  "Dữ liệu số của DoD (d2): 上限 5.000.000, đã dùng 4.620.000, GD 9.000 / 24.000; (d3) đổi suất thuế bằng dòng tax_rates mới.",
  ["Mỗi DoD (a)–(f), (d2), (d3) có ít nhất 1 ca"], hours=8, deps=["A-FG04-03"], rules=["permit"])
I("A-FG04-12", "test", "[FG-04] テスト 当日訂正 — test TRADE_SAME_DAY_FIX DoD (a)–(g)", "QA", "QA-1",
  [TT + "TRADE_SAME_DAY_FIX_TECH.md §5"], ["FR-AITAI-03"],
  "訂正 30 → 28 kg, 取消 chưa giao / đã giao 12 kg, đổi 買受人, ngày khóa, sửa lần 2.",
  ["Mỗi DoD có ít nhất 1 ca; GD gốc không đổi sau mọi ca"], hours=8, deps=["A-FG04-08"], rules=["nover"])
I("A-FG04-13", "rough", "[FG-04][概算] 取引 画面群 — SC-04-02, 04-03, 04-04, 04-05, 04-07", "FE", "FE-1",
  ["SCREEN-LIST C4 #20–24", "wireframes/SC-04-05-same-day-correction-cancel-wireframe.md"], ["FR-AITAI-01", "FR-AITAI-03"],
  "Màn chưa Screen Spec (SC-04-05 có wireframe + TECH + API-TRD-008). Giờ = FE 人日 LAB-1 × 8.",
  ["Có Screen Specification / API Design rồi tách lại"], hours=101, rules=["aitai"])
I("A-FG04-13.1", "rough", "[FG-04][概算] SC-04-02 取引確認票 再発行 (chưa spec)", "FE", "FE-2", ["SCREEN-LIST C4 #20", "API-TRD-004"],
  ["FR-AITAI-01"], "LAB-1 FE 1,0 人日.", ["Có Screen Specification rồi tách lại"], hours=8, parent="A-FG04-13", deps=["A-FG04-07"])
I("A-FG04-13.2", "rough", "[FG-04][概算] SC-04-03 取引一覧・検索 (chưa spec)", "FE", "FE-2", ["SCREEN-LIST C4 #21", "API-TRD-003"],
  ["FR-AITAI-01"], "Mặc định lọc 相対. LAB-1 FE 2,0 人日.", ["Có Screen Specification rồi tách lại"], hours=16, parent="A-FG04-13",
  deps=["A-FG04-06"], rules=["aitai"])
I("A-FG04-13.3", "rough", "[FG-04][概算] SC-04-04 取引詳細・訂正履歴 (chưa spec)", "FE", "FE-2", ["SCREEN-LIST C4 #22"],
  ["FR-AITAI-03"], "Một nút đúng trạng thái ngày (当日訂正 / 修正申請) + câu lý do (Q-WF-03). LAB-1 FE 1,3 人日.",
  ["Có Screen Specification / API Design rồi tách lại"], hours=11, parent="A-FG04-13", rules=["nover"])
I("A-FG04-13.4", "rough", "[FG-04][概算] SC-04-05 当日訂正・取消 — FE (WF có, chưa spec)", "FE", "FE-1",
  ["SCREEN-LIST C4 #23", "wireframes/SC-04-05-same-day-correction-cancel-wireframe.md", "API-TRD-008"], ["FR-AITAI-03", "PRM-127"],
  "Gộp SC-04-06 (nút 取消). LAB-1 FE 3,25 人日.", ["Có Screen Specification rồi tách lại"], hours=26, parent="A-FG04-13",
  deps=["A-FG04-08"], rules=["nover"])
I("A-FG04-13.5", "rough", "[FG-04][概算] SC-04-07 紙伝票後入力 — lưới nhập + PAPER_LATE (chưa spec)", "FE", "FE-1",
  ["SCREEN-LIST C4 #24", "TRADE_AITAI_CONFIRM_TECH §5 (PAPER_LATE)", "ADR-008 §2.4"], ["FR-AITAI-01", "BR-PERM-01"],
  "Kiểm tư cách theo giờ trên phiếu; dòng nghi trùng chờ người quyết. LAB-1 FE 5,0 人日; thiếu API Design.",
  ["Có Screen Specification / API Design rồi tách lại"], hours=40, parent="A-FG04-13", rules=["permit", "human"])
I("A-FG04-14", "rough", "[FG-04][概算] 後入力関数 — fn_*_late_entry cho trade / lot / delivery (DEP-06)", "BE", "BE-3",
  ["specs/_index.md DEP-06", "ADR-005 §2.8", "TRADE_DB 4.30 cột 3a / 3b"], ["FR-AITAI-01", "FR-LOT-01", "FR-DEL-01"],
  "Ghi bản ghi LATE_ENTRY khi 修正申請 được 決裁; thiếu Function Spec 3 hàm.", ["Có Function Spec rồi tách lại"],
  hours=18, dspec=["STL_CORRECTION_DECIDE_TECH §4.4"], rules=["nover"])
I("A-FG04-14.1", "rough", "[FG-04][概算] fn_trade_late_entry (chưa spec)", "BE", "BE-3", ["DEP-06"], ["FR-AITAI-01"],
  "Giờ [PL].", ["Có Function Spec rồi tách lại"], hours=6, parent="A-FG04-14", deps=["A-FG04-05"], rules=["nover"])
I("A-FG04-14.2", "rough", "[FG-04][概算] fn_lot_late_entry (chưa spec)", "BE", "BE-2", ["DEP-06"], ["FR-LOT-01"],
  "Giờ [PL].", ["Có Function Spec rồi tách lại"], hours=6, parent="A-FG04-14", deps=["A-FG03-05"], rules=["nover"])
I("A-FG04-14.3", "rough", "[FG-04][概算] fn_delivery_record cờ late (chưa spec)", "BE", "BE-1", ["DEP-06", "DEL_RECORD_TECH"],
  ["FR-DEL-01"], "Giờ [PL].", ["Có Function Spec rồi tách lại"], hours=6, parent="A-FG04-14", deps=["A-FG06-04"], rules=["nover"])

# ---------------------------------------------------------------- FG-05 (せり — luồng phụ)
P = TT + "TRADE_SERI_CONFIRM_TECH.md"
I("A-FG05-01", "dev", "[FG-05] せり回 — migration seri_sessions + enum seri_status", "BE", "BE-2",
  ["TRADE_DB 4.29"], ["FR-SERI-01"], "Bảng phiên せり (ENTERING / CONFIRMED); dòng kết quả nằm ở trades (source SERI).",
  ["Migration lên / xuống sạch"], hours=4, deps=["A-FG04-01"])
I("A-FG05-02", "dev", "[FG-05] せり結果取得 — API-TRD-005 phiên + đánh giá trước từng dòng", "BE", "BE-2",
  ["TRADE_FUNC 2.7", "API-TRD-005"], ["FR-SERI-02", "BR-PERM-01"],
  "Trả dòng PENDING kèm đánh giá trước: tư cách, vượt hạn mức (chỉ 売買参加者), SL lô còn.",
  ["仲卸 không bao giờ có cờ vượt hạn mức (DoD (d))"], hours=8, deps=["A-FG05-01", "A-FG04-03"], rules=["permit"])
I("A-FG05-03", "dev", "[FG-05] せり結果確定 — 確認者 xác nhận phiên (người quyết)", "BE", "BE-2",
  [P, "API-TRD-006", "TRADE_FUNC 2.8, 2.9"], ["FR-SERI-02", "CAP-HUMAN-01", "PRM-115"],
  "Issue cha: TRADE_SERI_CONFIRM_TECH §4.1–4.4. Bắt buộc online, không MFA.", ["TRADE_SERI DoD đạt ở A-FG05-06"],
  hours=22, deps=["A-FG05-02", "A-FG03-07"], rules=["human", "nover"])
I("A-FG05-03.1", "dev", "[FG-05] せり確定 検証 — kiểm phiên, 確認者 ≠ 入力者 (hoặc lý do)", "BE", "BE-2",
  [P + " §4.1"], ["FR-SERI-02", "PRM-115"], "入力者 tự xác nhận không lý do → 422 E-TRD-014; có lý do → lưu, hiện ở 要確認.",
  ["DoD (a)"], hours=6, parent="A-FG05-03", rules=["human"])
I("A-FG05-03.2", "dev", "[FG-05] せり確定 明細 — khóa lô, duyệt từng dòng, cancelTradeIds, ghi kết quả", "BE", "BE-2",
  [P + " §4.2, §4.3"], ["FR-SERI-02", "BR-PERM-01", "BR-LOT-02"],
  "Dòng 失効 phải chọn 差し戻し hoặc 取消 (資格なし・不成立); hủy không trừ SL; 相対 vừa chốt hết SL → 409 E-TRD-018 cả lượt.",
  ["DoD (b), (b2), (b4), (c), (d), (f)"], hours=10, parent="A-FG05-03", deps=["A-FG05-03.1"], rules=["human", "permit", "nover"])
I("A-FG05-03.3", "dev", "[FG-05] せり確定 回 — cập nhật phiên + commit + API-TRD-006", "BE", "BE-2",
  [P + " §4.4", "API-TRD-006"], ["FR-SERI-02"], "Phiên CONFIRMED khi hết dòng chờ; còn dòng 差し戻し → ENTERING (giả định Q-TRD-04).",
  ["DoD (e)"], hours=6, parent="A-FG05-03", deps=["A-FG05-03.2"])
I("A-FG05-04", "dev", "[FG-05] せり差し戻し — fn_send_back_seri_results + API-TRD-007", "BE", "BE-2",
  [P + " §4.5", "API-TRD-007", "TRADE_FUNC 2.10"], ["FR-SERI-02", "CAP-HUMAN-01"],
  "Trả dòng về DRAFT cho 入力者 sửa số người mua; lịch sử giữ số cũ / mới; không có API đổi người mua trên SC-05-02.",
  ["DoD (b3), (b5), (e)"], hours=8, deps=["A-FG05-01"], rules=["human", "nover"])
S = "specs/trade/screen-specification/SC-05-02_SPEC.md"
I("A-FG05-05", "dev", "[FG-05] SC-05-02 せり結果確認 — màn 確認者 xác nhận theo phiên", "FE", "FE-1",
  [S, "wireframes/SC-05-02-seri-result-session-confirm-wireframe.md"], ["FR-SERI-02", "CAP-HUMAN-01"],
  "Issue cha của màn SC-05-02.", ["Mọi sub-issue xong; §6.1 trạng thái đúng"], hours=22,
  deps=["A-FG05-03", "A-FG05-04"], rules=["human"])
I("A-FG05-05.1", "dev", "[FG-05] SC-05-02 明細 — bảng dòng + đánh giá trước + chọn 差し戻し / 取消", "FE", "FE-1",
  [S + " §4.1, §6.2"], ["FR-SERI-02", "BR-PERM-01"], "Dòng 失効 hiện hai nút 5.1 / 5.2; không nút đổi người mua, không đôn người trả giá thứ 2.",
  ["Không có điều khiển đổi người mua trên màn (DoD (b5))"], hours=12, parent="A-FG05-05", rules=["human", "permit"])
I("A-FG05-05.2", "dev", "[FG-05] SC-05-02 確定 — hộp C-31, lý do vượt hạn mức chỉ 売買参加者, lỗi", "FE", "FE-1",
  [S + " §4.2, §5"], ["FR-SERI-02", "PRM-046"], "Ô lý do chỉ hiện ở dòng 売買参加者 vượt hạn mức (khác prototype); xử lý E-TRD-014/015/018.",
  ["§5 event đủ; 仲卸 không có ô lý do"], hours=10, parent="A-FG05-05", deps=["A-FG05-05.1"], rules=["human"])
I("A-FG05-06", "test", "[FG-05] テスト せり確定 — test TRADE_SERI DoD (a)–(f)", "QA", "QA-1",
  [TT + "TRADE_SERI_CONFIRM_TECH.md §5"], ["FR-SERI-02", "CAP-HUMAN-01"],
  "Phiên 12 dòng có 1 dòng 失効; 差し戻し → sửa → nộp lại; cộng dồn hạn mức hai dòng cùng người mua.",
  ["Mỗi DoD (a)–(f) gồm (b2)–(b5) có ít nhất 1 ca"], hours=10, deps=["A-FG05-03", "A-FG05-04", "A-FG05-05"], rules=["human", "nover"])
I("A-FG05-07", "rough", "[FG-05][概算] せり結果入力 — SC-05-01 + API ghi / sửa dòng (DEP-10)", "FE", "FE-2",
  ["specs/_index.md DEP-10", "SCREEN-LIST C4 #25"], ["FR-SERI-01", "FORM-SERI-01"],
  "Chỉ ghi kết quả cuối, không đấu giá trực tuyến; thiếu API + Screen Spec.", ["Có Screen Specification / API Design rồi tách lại"], hours=42)
I("A-FG05-07.1", "rough", "[FG-05][概算] SC-05-01 せり結果入力 — FE (chưa spec)", "FE", "FE-2", ["DEP-10", "SCREEN-LIST C4 #25"],
  ["FR-SERI-01"], "LAB-1 FE 4,0 人日.", ["Có Screen Specification rồi tách lại"], hours=32, parent="A-FG05-07")
I("A-FG05-07.2", "rough", "[FG-05][概算] せり入力API — ghi dòng PENDING / sửa sau 差し戻し (chưa spec)", "BE", "BE-2",
  ["DEP-10", "TRADE_DB 4.29–4.31"], ["FR-SERI-01"], "Lịch sử giữ số cũ / mới (Q-TRD-05). Giờ [PL].",
  ["Có API Design rồi tách lại"], hours=10, parent="A-FG05-07", deps=["A-FG05-01"], rules=["nover"])

# ---------------------------------------------------------------- FG-06
D = "specs/delivery/"
I("A-FG06-01", "dev", "[FG-06] 引渡し — migration deliveries + view v_delivery_status", "BE", "BE-1",
  ["TRADE_DB 4.34", "MKT_DB §4.0a v_delivery_status"], ["FR-DEL-01", "FR-DEL-02"],
  "deliveries (client_record_id unique, receiver_type / name, offline captured_*), index idx_deliveries_trade; view trạng thái giao theo GD.",
  ["Không UPDATE / DELETE deliveries"], hours=6, deps=["A-FG04-01"], rules=["nover"])
I("A-FG06-02", "dev", "[FG-06] 引渡し例外 — migration delivery_exceptions / dispute_confirmations", "BE", "BE-1",
  ["TRADE_DB 4.35, 4.36"], ["FR-DEL-03", "FR-DEL-04"],
  "delivery_exceptions (fix_id FK trade_fixes, affects_amount), dispute_confirmations (conclusion, unique partial conclusion <> CONTINUE_DISPUTE).",
  ["Cho nhiều dòng CONTINUE_DISPUTE, chỉ một kết luận cuối"], hours=6, deps=["A-FG06-01"],
  dspec=["ADJUST_DB 4.32 trade_fixes"], rules=["nover", "human"])
I("A-FG06-03", "dev", "[FG-06] 引渡し対象 — API-DEL-001 GD chờ giao + API-DEL-002 snapshot offline", "BE", "BE-1",
  [D + "function-specifications/DELIVERY_FUNC.md 2.1, 2.2", "API-DEL-001", "API-DEL-002"], ["FR-DEL-01", "NFR-AVL-02"],
  "Chỉ GD CONFIRMED còn 残 > 0; snapshot tối đa 7 業務日, không chứa giá / tiền.",
  ["DELIVERY_FUNC §4 dòng listPendingDeliveries, getOfflineSnapshot"], hours=10, deps=["A-FG06-01"])
P = D + "technical-design/DEL_RECORD_TECH.md"
I("A-FG06-04", "dev", "[FG-06] 引渡し記録 — ghi giao nhiều lần, idempotent (API-DEL-003)", "BE", "BE-1",
  [P, "API-DEL-003", "DELIVERY_FUNC 2.3"], ["FR-DEL-01", "FR-DEL-02", "FR-DEL-05", "BR-DEL-03"],
  "Issue cha: DEL_RECORD_TECH §4.", ["DEL_RECORD DoD #1–#11 đạt ở A-FG06-11"], hours=18, deps=["A-FG06-01"], rules=["nover"])
I("A-FG06-04.1", "dev", "[FG-06] 引渡し 検証・冪等 — validate + idempotent theo clientRecordId", "BE", "BE-1",
  [P + " §4.1, §4.2"], ["FR-DEL-01"], "Cùng clientRecordId cùng nội dung → 200 replayed; khác nội dung → 409 E-DEL-010 + log WARN; số lẻ sai → E-DEL-004.",
  ["DoD #2, #3, #8, #9"], hours=8, parent="A-FG06-04")
I("A-FG06-04.2", "dev", "[FG-06] 引渡し 記録 — kiểm GD / 残 / ngày mở, ghi lần giao, trạng thái", "BE", "BE-1",
  [P + " §4.3, §4.4, §4.5"], ["FR-DEL-02", "BR-DEL-03", "PRM-118"],
  "残り全部 lấy 残 hiện tại; nhiều GD một transaction; khóa trades theo id (không deadlock); ngày khóa → 423 (online).",
  ["DoD #1, #4, #5, #6, #7, #10, #11"], hours=10, parent="A-FG06-04", deps=["A-FG06-04.1"], rules=["nover"])
I("A-FG06-05", "dev", "[FG-06] オフライン引渡し — PWA hàng đợi IndexedDB + 残 cục bộ", "FE", "FE-2",
  ["DELIVERY_FUNC 2.4", "ADR-008 §2.2, §2.3"], ["NFR-AVL-02", "FR-DEL-01"],
  "enqueueOfflineDelivery: kiểm 残 cục bộ (snapshot − hàng đợi), lưu IndexedDB, đếm C-28; không gửi mạng (gửi lên do sync).",
  ["DELIVERY_FUNC §4 dòng enqueueOfflineDelivery", "Ngoại lệ không vào hàng đợi (Q-DEL-01)"], hours=12,
  deps=["A-FG06-03", "A-FG03-13"])
P = D + "technical-design/DEL_EXCEPTION_DISPUTE_TECH.md"
I("A-FG06-06", "dev", "[FG-06] 引渡し例外 — ghi ngoại lệ / nhập bù phiếu giấy (API-DEL-004)", "BE", "BE-1",
  [P + " §4.1–§4.3", "API-DEL-004", "DELIVERY_FUNC 2.5"], ["FR-DEL-03", "FR-SETTLE-01", "BR-CLOSE-01"],
  "Issue cha: ngoại lệ 不足 / 過剰 / 返品 / 一部取消 / 争いあり / PAPER_LATE.", ["DEL_EXCEPTION DoD #1–#6, #10, #11 đạt ở A-FG06-12"],
  hours=20, deps=["A-FG06-02", "A-FG04-08"], rules=["nover"])
I("A-FG06-06.1", "dev", "[FG-06] 例外 検証 — loại, SL so 残 / 引渡済, phiếu giấy (số, scan, người ký)", "BE", "BE-1",
  [P + " §4.1, §4.2"], ["FR-DEL-03", "TBL-ATTACH-01"], "E-DEL-028 / 013 / 014 / 016 / 017; body không có trường giá / tiền.",
  ["DoD #4, #5, #6"], hours=10, parent="A-FG06-06", dspec=["DEP-03 đính kèm chung", "DEP-02 staff lookup"])
I("A-FG06-06.2", "dev", "[FG-06] 例外 記録 — ghi ngoại lệ + trade_fixes REVERSE / DELTA khi ngày mở", "BE", "BE-1",
  [P + " §4.3"], ["FR-DEL-03", "FR-SETTLE-01"],
  "Ngày OPEN + đổi tiền → trade_fixes theo đơn giá đã chốt (chỉ hướng giảm), gắn fix_id; ngày khóa → correctionRequired; 過剰 không đổi tiền.",
  ["DoD #1, #2, #3, #10"], hours=10, parent="A-FG06-06", deps=["A-FG06-06.1"],
  dspec=["ADJUST_DB 4.32, 4.39", "STL_DAY_CLOSE_TECH checklist #6"], rules=["nover"])
I("A-FG06-07", "dev", "[FG-06] 争い確認 — 配送部門責任者 xác nhận tranh chấp (API-DEL-005/006)", "BE", "BE-1",
  [P + " §4.4, §4.5", "API-DEL-005", "API-DEL-006", "DELIVERY_FUNC 2.6, 2.7"], ["FR-DEL-04", "CAP-HUMAN-01", "PRM-111"],
  "Issue cha: danh sách + xác nhận / 継続協議.", ["DEL_EXCEPTION DoD #7, #8, #9, #11, #12 đạt ở A-FG06-12"],
  hours=18, deps=["A-FG06-02"], rules=["human", "nover"])
I("A-FG06-07.1", "dev", "[FG-06] 争い一覧 — API-DEL-005 danh sách chờ xác nhận", "BE", "BE-1",
  ["API-DEL-005", "DELIVERY_FUNC 2.6"], ["FR-DEL-04"], "Mặc định loại dòng người xem tự ghi; scope = all gồm vụ 継続協議 còn OPEN.",
  ["DELIVERY_FUNC §4 dòng listDisputes"], hours=6, parent="A-FG06-07", rules=["human"])
I("A-FG06-07.2", "dev", "[FG-06] 争い確認 記録 — fn_dispute_confirm (cấm tự xác nhận, MFA, 継続協議)", "BE", "BE-1",
  [P + " §4.4, §4.5", "API-DEL-006"], ["FR-DEL-04", "CAP-HUMAN-01", "PRM-111"],
  "Tự xác nhận → 403 E-DEL-019 kiểm ở DB; CONTINUE_DISPUTE nhiều lượt có ghi chú; kết luận lần hai → E-DEL-024; thiếu step-up → E-CMN-005.",
  ["DoD #7, #8, #9, #11, #12"], hours=12, parent="A-FG06-07", deps=["A-FG06-07.1"],
  dspec=["DEP-01 API MFA verify (iam)"], rules=["human", "nover"])
S = D + "screen-specification/"
I("A-FG06-08", "dev", "[FG-06] SC-06-02 引渡し記録（タブレット）— màn giao ở bến", "FE", "FE-2",
  [S + "SC-06-02_SPEC.md", "wireframes/SC-06-02-delivery-record-tablet-wireframe.md"], ["FR-DEL-01", "FR-DEL-02", "NFR-AVL-02"],
  "Issue cha của màn SC-06-02.", ["Mọi sub-issue xong; §6.1 trạng thái đúng"], hours=24, deps=["A-FG06-03", "A-FG06-04"])
I("A-FG06-08.1", "dev", "[FG-06] SC-06-02 記録 — tìm người mua, danh sách GD, テンキー, 残り全部", "FE", "FE-2",
  [S + "SC-06-02_SPEC.md §4.1, §4.2, §5"], ["FR-DEL-01", "FR-DEL-05"], "Giao nhiều lần, lũy kế / còn lại; nút 「例外」 → SC-06-04.",
  ["§5 event E-DEL-004 / 005 / 008 / 009"], hours=14, parent="A-FG06-08")
I("A-FG06-08.2", "dev", "[FG-06] SC-06-02 オフライン — banner 未同期 n件, 本人 / 代理, giờ dữ liệu", "FE", "FE-2",
  [S + "SC-06-02_SPEC.md §6.1, §6.6"], ["NFR-AVL-02", "FR-DEL-01"], "Chế độ offline dùng hàng đợi A-FG06-05; người nhận 本人 mặc định, 代理 tên tùy chọn (Q-DEL-03).",
  ["§6.1 trạng thái offline / đồng bộ"], hours=10, parent="A-FG06-08", deps=["A-FG06-08.1", "A-FG06-05"])
I("A-FG06-09", "dev", "[FG-06] SC-06-04 引渡し例外登録 — màn ghi ngoại lệ giao", "FE", "FE-2",
  [S + "SC-06-04_SPEC.md", "wireframes/SC-06-04-delivery-exception-registration-wireframe.md"], ["FR-DEL-03"],
  "Issue cha của màn SC-06-04 (L4-D07).", ["Mọi sub-issue xong; mất mạng khóa form (C-28) — DoD #13"], hours=22, deps=["A-FG06-06"])
I("A-FG06-09.1", "dev", "[FG-06] SC-06-04 例外入力 — loại, SL thực giao, lý do, ảnh (PC)", "FE", "FE-2",
  [S + "SC-06-04_SPEC.md §4.1, §4.2, §5"], ["FR-DEL-03"], "Không có ô giá / tiền; hiện tiền ảnh hưởng do server tính.",
  ["§4.2 validation đủ"], hours=12, parent="A-FG06-09", dspec=["DEP-03 đính kèm chung"])
I("A-FG06-09.2", "dev", "[FG-06] SC-06-04 紙伝票後入力 — nhập bù phiếu giấy (số phiếu, scan, người ký)", "FE", "FE-2",
  [S + "SC-06-04_SPEC.md §4.1, §5, §6.5"], ["FR-DEL-03", "TBL-ATTACH-01"], "Nhập lại trong ngày trước 日次締め (Q-DEL-01).",
  ["§5 event E-DEL-014 / 016 / 017"], hours=10, parent="A-FG06-09", deps=["A-FG06-09.1"], dspec=["DEP-02 staff lookup"])
I("A-FG06-10", "dev", "[FG-06] SC-06-05 争いのある引渡し完了確認 — màn người quyết (MFA)", "FE", "FE-1",
  [S + "SC-06-05_SPEC.md", "wireframes/SC-06-05-disputed-delivery-completion-confirm-wireframe.md"], ["FR-DEL-04", "CAP-HUMAN-01"],
  "Issue cha của màn SC-06-05 (L4-D07).", ["Mọi sub-issue xong"], hours=16, deps=["A-FG06-07"], rules=["human"])
I("A-FG06-10.1", "dev", "[FG-06] SC-06-05 一覧・詳細 — danh sách tranh chấp + chi tiết + lịch sử họp", "FE", "FE-1",
  [S + "SC-06-05_SPEC.md §4.1, §6.1"], ["FR-DEL-04"], "Ẩn vụ người xem tự ghi; xem các lượt 継続協議.",
  ["§6.2 quyền hiển thị theo vai"], hours=8, parent="A-FG06-10", rules=["human"])
I("A-FG06-10.2", "dev", "[FG-06] SC-06-05 確認 — kết luận / 継続協議 + MFA C-30, phiếu giấy có lý do", "FE", "FE-1",
  [S + "SC-06-05_SPEC.md §4.2, §5"], ["FR-DEL-04", "CAP-HUMAN-01"], "MFA cả khi 継続協議 (Q-DEL-08); xử lý E-DEL-019 / 021 / 022 / 023 / 024.",
  ["§5 event đủ"], hours=8, parent="A-FG06-10", deps=["A-FG06-10.1"], dspec=["DEP-01 API MFA verify (iam)"], rules=["human"])
I("A-FG06-11", "test", "[FG-06] テスト 引渡し記録 — test DEL_RECORD DoD #1–#11 + offline", "QA", "QA-1",
  [D + "technical-design/DEL_RECORD_TECH.md §5 Điều kiện hoàn thành"], ["FR-DEL-01", "FR-DEL-02", "NFR-AVL-02"],
  "Gồm gửi lại cùng clientRecordId, hai tablet cùng người mua, ngày khóa online / offline (HELD cần A-FG03-13).",
  ["Mỗi dòng #1–#11 có 1 ca; DELIVERY_FUNC §4 mọi mã E-DEL ghi giao có 1 ca"], hours=10,
  deps=["A-FG06-04", "A-FG06-05", "A-FG06-08"], rules=["nover"])
I("A-FG06-12", "test", "[FG-06] テスト 例外・争い — test DEL_EXCEPTION_DISPUTE DoD #1–#13", "QA", "QA-1",
  [D + "technical-design/DEL_EXCEPTION_DISPUTE_TECH.md §5 Điều kiện hoàn thành"], ["FR-DEL-03", "FR-DEL-04", "CAP-HUMAN-01"],
  "Gồm 不足 2 kg × 1.500 → −3.000, đếm checklist một lần, cấm tự xác nhận, 2 lượt 継続協議 rồi COMPLETED.",
  ["Mỗi dòng #1–#13 có 1 ca"], hours=12, deps=["A-FG06-06", "A-FG06-07", "A-FG06-09", "A-FG06-10"], rules=["human", "nover"])
I("A-FG06-13", "rough", "[FG-06][概算] 引渡し 画面群 — SC-06-01 対象一覧, SC-06-06 引渡票", "FE", "FE-2",
  ["SCREEN-LIST C5 #27, #31"], ["FR-DEL-01", "FR-DEL-05"], "Màn List chưa spec. Giờ = FE 人日 LAB-1 × 8.",
  ["Có Screen Specification / API Design rồi tách lại"], hours=31)
I("A-FG06-13.1", "rough", "[FG-06][概算] SC-06-01 引渡し対象一覧 (PC + tablet chỉ đọc) (chưa spec)", "FE", "FE-2",
  ["SCREEN-LIST C5 #27", "API-DEL-001"], ["FR-DEL-01"], "Q-WF-01 đã trả lời: tách khỏi SC-06-02. LAB-1 FE 2,6 人日.",
  ["Có Screen Specification rồi tách lại"], hours=21, parent="A-FG06-13", deps=["A-FG06-03"])
I("A-FG06-13.2", "rough", "[FG-06][概算] SC-06-06 引渡票 印刷・再発行 (chưa spec)", "FE", "FE-2", ["SCREEN-LIST C5 #31"],
  ["FR-DEL-01"], "LAB-1 FE 1,3 人日; thiếu API in.", ["Có Screen Specification / API Design rồi tách lại"], hours=10, parent="A-FG06-13")

# ---------------------------------------------------------------- EP-CLAR (issue làm rõ của luồng A)
C(1, "FG03", "[要確認] DEP-04 — API / Technical Design module sync + spec SC-03-07", ["specs/_index.md DEP-04", "ADR-008"],
  ["NFR-AVL-02"], "Cần API Design + Technical Design sync và Screen Spec SC-03-07 (đang chỉ wireframe).", ["A-FG03-13", "A-FG06-05"],
  rules=["human"], hours=3)
C(2, "FG03", "[要確認] DEP-05 — Function Spec fn_lot_carry_over (持ち越し khi 日次締め)", ["DEP-05", "ADR-005 §2.4"],
  ["FR-LOT-03", "E-12"], "Cần Function Spec; liên quan E-12 ở OPEN-L4-03.", ["A-FG03-15"])
C(3, "FG04", "[要確認] DEP-06 — Function Spec 3 hàm ghi LATE_ENTRY (trade / lot / delivery)", ["DEP-06", "ADR-005 §2.8"],
  ["FR-AITAI-01"], "Cần Function Spec fn_trade_late_entry, fn_lot_late_entry, fn_delivery_record cờ late.", ["A-FG04-14"],
  rules=["nover"], hours=3)
C(4, "FG03", "[要確認] DEP-07 — API 仮受付 online / hủy + Screen Spec SC-03-02", ["DEP-07", "Q-SC0302-02"],
  ["FR-LOT-01"], "Cần API Design ghi / hủy 仮受付 và Screen Spec SC-03-02 (wireframe đã có — L4-D05).", ["A-FG03-12"])
C(5, "FG05", "[要確認] DEP-10 — API ghi / sửa dòng せり + Screen Spec SC-05-01", ["DEP-10", "Q-TRD-05"],
  ["FR-SERI-01"], "Cần API Design + Screen Spec SC-05-01 (入力者, sửa sau 差し戻し).", ["A-FG05-07"])
C(6, "FG01", "[要確認] DEP-15 — Screen Spec SC-01-03 許可 / SC-01-04 承認", ["DEP-15"],
  ["FR-PARTY-02", "FR-PARTY-03"], "API-PTY-004..007 đã có; thiếu Screen Spec 2 màn.", ["A-FG01-13"], rules=["permit"])
C(7, "FG01", "[要確認] FG-01 màn chưa spec — SC-01-01 / 01-05 / 01-06 + job 失効予告", ["SCREEN-LIST C2", "A-GAP-03"],
  ["FR-PARTY-01", "PRM-045"], "Xin Screen Spec / API Design; chốt ai sinh cảnh báo 30 ngày (party job hay notify).", ["A-FG01-12"],
  rules=["permit"], hours=3)
C(8, "FG03", "[要確認] 販売公開 / 販売終了 — thiếu spec, đề nghị thêm DEP-18 + spec SC-03-03/04", ["A-GAP-01", "SCREEN-LIST C3"],
  ["FR-LOT-03", "PRM-110"], "API-TRD-002 cần lô PUBLISHED nhưng không có API / Function Spec đổi sang PUBLISHED; không có trong DEP-01..17.",
  ["A-FG03-14"], hours=3)
C(9, "FG04", "[要確認] FG-04 màn chưa spec — SC-04-02 / 03 / 04 / 05 / 07", ["SCREEN-LIST C4"],
  ["FR-AITAI-01", "FR-AITAI-03"], "Xin Screen Spec (SC-04-05 có wireframe) và API Design cho SC-04-07 紙伝票後入力.", ["A-FG04-13"],
  rules=["aitai"], hours=3)
C(10, "FG06", "[要確認] FG-06 màn chưa spec — SC-06-01 対象一覧, SC-06-06 引渡票", ["SCREEN-LIST C5"],
  ["FR-DEL-01"], "Xin Screen Spec + API in 引渡票.", ["A-FG06-13"])
C(11, "FG01", "[要確認] OPEN-DB-09 — thủ tục cấp mới / đình chỉ / thu hồi 許可 vs 承認", ["ADR-003 §6 OPEN-DB-09", "MKT_DB §7"],
  ["FR-PARTY-02", "FR-PARTY-03"], "Hỏi 運用部門: cấp mới 許可 có 運用部門長 決裁? 承認 xét nhẹ + 照合部門長 確認? ai 決裁 đình chỉ / thu hồi, có 弁明の機会?",
  ["A-FG01-07.2", "A-FG01-08.3"], rules=["permit", "human"])
C(12, "FG03", "[要確認] OPEN-L4-03 / E-13 — bán lô trước 下見済 (Q-SC0305-02)", ["lab-4/PREMISE.md §6 OPEN-L4-03", "SC-03-05_SPEC §6.2"],
  ["FR-LOT-02", "E-13"], "Hỏi 運用部門: được 公開 lô chưa 目利き không, có làm đổi tiền / tính quota quy chế không.",
  ["A-FG03-14.2", "A-FG03-06"], rules=["human", "ver"])
C(13, "FG03", "[要確認] Q-LOT-03 — danh mục 等級 thật của chợ", ["LOT_FUNC 3.2 Q-LOT-03", "L4-A02"],
  ["FR-LOT-02"], "Hỏi 目利き主任; A / B / C / 規格外 dùng tạm cho UAT.", ["A-FG03-03", "A-FG03-11"], rules=["human"], hours=1)
C(14, "FG03", "[要確認] Q-LOT-04 — ghi lại 目利き lô đã GD có cần báo người chốt / 照合", ["LOT_FUNC 3.2 Q-LOT-04"],
  ["FR-LOT-02"], "Giả định không báo; nếu cần → thông báo in-app ~0,3 ngày.", ["A-FG03-06.2"], rules=["human"], hours=1)
C(15, "FG03", "[要確認] Q-LOT-05 — lô CLOSED được trả SL có tự mở bán lại không", ["LOT_FUNC 3.2 Q-LOT-05"],
  ["PRM-110"], "Giả định tự về PUBLISHED + lịch sử; nếu phải người mở → thao tác ở SC-03-03.", ["A-FG03-07"], rules=["human"], hours=1)
C(16, "FG04", "[要確認] Q-TRD-01 — định dạng số GD đọc cho người mua", ["TRADE_FUNC 3.2 Q-TRD-01"],
  ["FR-AITAI-01"], "Đề xuất 「相対-0005」 / 「せり-0302」; lưu A{YYYYMMDD}-{nnnn}.", ["A-FG04-05.2", "A-FG04-07"], hours=1)
C(17, "FG04", "[要確認] Q-TRD-03 / E-05 — máy in hiện trường: kiosk-printing hay agent", ["TRADE_FUNC 3.2 Q-TRD-03", "ADR-008 §6 E-05"],
  ["FR-AITAI-01"], "Giả định kiosk-printing (A-PD-01); agent in → CR ~2 ngày.", ["A-FG04-07"])
C(18, "FG05", "[要確認] Q-TRD-04 — một phiên せり xác nhận nhiều lượt khi có 差し戻し", ["TRADE_FUNC 3.2 Q-TRD-04"],
  ["FR-SERI-02"], "Giả định được; phiên CONFIRMED khi hết dòng chờ.", ["A-FG05-03.3"], rules=["human"], hours=1)
C(19, "FG01", "[要確認] Q-PTY-02 — 保証金 có ghi hồi tố được không", ["SC-01-02_SPEC §6.6 Q-PTY-02"],
  ["PRM-046"], "Giả định không (発効日 ≥ 業務日); cho hồi tố → tính lại cảnh báo vượt hạn mức +0,2 MM.", ["A-FG01-06"], rules=["nover"], hours=1)
C(20, "FG01", "[要確認] Q-PTY-03 — 通知メール bắt buộc với 仲卸 / 売買参加者?", ["SC-01-02_SPEC §6.6 Q-PTY-03", "L4-A08"],
  ["FR-PARTY-01"], "Giả định không bắt buộc; bắt buộc → validate + migration đủ email.", ["A-FG01-09.1"], hours=1)
C(21, "FG01", "[要確認] 保証金 — có phải khớp sổ 経理部 hằng kỳ không", ["PTY_APPROVAL_LIFECYCLE_TECH §5"],
  ["PRM-046"], "Khớp sổ → mục so sánh (báo giá riêng, tách option).", ["A-FG01-06"], hours=1)

gaps = [
    dict(id="A-GAP-01", spec="LOT_FUNC 2.4, 2.9; TRADE_AITAI_CONFIRM_TECH §4.2; specs/_index.md DEP-01..17",
         problem="Đổi lô INSPECTED → PUBLISHED (販売公開) và 販売終了 (PRM-110) không có API / Function Spec, cũng không có dòng DEP; API-TRD-002 và fn_lot_lock_for_sale lại bắt lô PUBLISHED → luồng chính 相対 không chạy được với dữ liệu thật",
         handling="clarify", ref="A-CLR-08", open_reason=""),
    dict(id="A-GAP-02", spec="DEL_RECORD_TECH §5; LOT_INSPECTION_RECORD_TECH §4.3; MKT_DB §4.0 lot_status",
         problem="Trạng thái lô DELIVERED có trong enum và được kiểm ở 目利き, nhưng không hàm nào ghi: delivery nói 「module lot đọc v_delivery_status」, LOT_FUNC không có hàm tương ứng",
         handling="fix-design", ref="A-PS-01", open_reason=""),
    dict(id="A-GAP-03", spec="SCREEN-LIST §4 SC-01-B1; PTY_*_LIFECYCLE_TECH §4.5/§4.6; TRADE_QUALIFICATION_CHECK_TECH §5",
         problem="Batch SC-01-B1 gồm cảnh báo sắp hết hạn (PRM-045) nhưng TECH party chỉ đặc tả job 失効; TRADE_QUALIFICATION đẩy sang 「module notify」 còn DEP-13 chỉ là worker gửi — không ai sinh cảnh báo",
         handling="clarify", ref="A-CLR-07", open_reason=""),
    dict(id="A-GAP-04", spec="ADJUST_DB 4.32, 4.39; CLOSE_DB 4.57; TRADE_SAME_DAY_FIX_TECH §4.3; DEL_EXCEPTION_DISPUTE_TECH §4.3",
         problem="Hàm của luồng A (当日訂正, ngoại lệ giao, cấp lot_no / trade_no) ghi bảng thuộc cụm settle / close (trade_fixes, trade_adjustments, day_counters); không tài liệu nào nói ai tạo migration",
         handling="assumption", ref="A-PA-01", open_reason=""),
]

not_issued = [
    dict(spec="SCREEN-LIST C2: SC-01-01, SC-01-05, SC-01-06; batch SC-01-B1 (phần cảnh báo)", reason="chưa có Screen Specification / API Design (L4-D08)", covered_by=["A-FG01-12", "A-CLR-07"]),
    dict(spec="SCREEN-LIST C2: SC-01-03, SC-01-04 (DEP-15)", reason="API đã có, chưa có Screen Specification", covered_by=["A-FG01-13", "A-CLR-06"]),
    dict(spec="SCREEN-LIST C3: SC-03-02 (DEP-07)", reason="chỉ có wireframe (L4-D05), chưa có API Design / Screen Spec", covered_by=["A-FG03-12", "A-CLR-04"]),
    dict(spec="SCREEN-LIST C3: SC-03-07 + module sync (DEP-04)", reason="chưa có Technical Design / API Design sync, màn chỉ có wireframe", covered_by=["A-FG03-13", "A-CLR-01"]),
    dict(spec="SCREEN-LIST C3: SC-03-03, SC-03-04 (gộp SC-03-06); thao tác 販売公開 / 販売終了", reason="màn mức List; thao tác đổi trạng thái chưa có spec (A-GAP-01)", covered_by=["A-FG03-14", "A-CLR-08"]),
    dict(spec="DEP-05 fn_lot_carry_over", reason="chưa có Function Spec", covered_by=["A-FG03-15", "A-CLR-02"]),
    dict(spec="SCREEN-LIST C4: SC-04-02, SC-04-03, SC-04-04, SC-04-05 (gộp SC-04-06), SC-04-07", reason="chưa có Screen Specification (SC-04-05 có wireframe; SC-04-07 thiếu cả API Design)", covered_by=["A-FG04-13", "A-CLR-09"]),
    dict(spec="DEP-06 fn_trade_late_entry, fn_lot_late_entry, fn_delivery_record cờ late", reason="chưa có Function Spec", covered_by=["A-FG04-14", "A-CLR-03"]),
    dict(spec="SCREEN-LIST C4: SC-05-01 (DEP-10)", reason="chưa có API Design / Screen Spec", covered_by=["A-FG05-07", "A-CLR-05"]),
    dict(spec="SCREEN-LIST C5: SC-06-01, SC-06-06", reason="màn mức List, chưa có Screen Specification / API in", covered_by=["A-FG06-13", "A-CLR-10"]),
    dict(spec="Q-LOT-02 ngưỡng tô vàng chênh SL 仮受付 / 本登録", reason="khách để sau (FB-CUS-287); không làm ở 第1期 trừ khi khách mở lại", covered_by=[]),
    dict(spec="SC-01-07, SC-04-08, SC-06-03, SC-05-03 (SCREEN-LIST §3)", reason="không tính ở 第1期: 第2期 / bỏ / gộp SC-04-04 (luật 6 với SC-01-07)", covered_by=[]),
    dict(spec="ADR-008 §6 E-18 (PIN offline), E-21 (scan 受入証憑)", reason="điểm mở thuộc iam / đính kèm chung — luồng C tạo issue làm rõ", covered_by=[]),
]

premise = dict(
    spec_changes=[dict(id="A-PS-01", spec="specs/lot/function-specifications/LOT_FUNC.md §2 (thêm 2.11)", change="Thêm",
        before_after="Không hàm nào ghi lô DELIVERED → thêm hàm public của module lot (vd. app.fn_lot_refresh_delivery_status) đặt lô CLOSED sang DELIVERED + lot_status_history khi v_delivery_status báo mọi GD của lô đã 引渡し完了; delivery gọi trong cùng transaction ghi giao / ngoại lệ",
        why="A-GAP-02: DEL_RECORD_TECH §5 đẩy việc này sang module lot nhưng LOT_FUNC không có; LOT_INSPECTION_RECORD_TECH §4.3 đã kiểm trạng thái DELIVERED; enum lot_status MKT_DB §4.0",
        issues=["A-FG03-16"])],
    assumptions=[
        dict(id="A-PA-01", assumption="Migration ADJUST_DB 4.32 trade_fixes, 4.39 trade_adjustments và CLOSE_DB 4.57 day_counters do luồng B (cụm settle / close) làm; issue luồng A chỉ ghi depends_on_spec",
             open_point="A-GAP-04: không tài liệu LAB-4 nào giao chủ migration của bảng dùng chung giữa module", impact="A-FG03-01, A-FG04-01, A-FG04-02, A-FG04-08, A-FG06-02, A-FG06-06 chờ migration bên B"),
        dict(id="A-PA-02", assumption="Giờ hours_hint của issue rough = FE 人日 trong 費用表 LAB-1 (画面別内訳) × 8; phần BE chưa spec ghi [PL]",
             open_point="Brief P1 §4 nói 「số màn × mức LAB-1」 nhưng LAB-1 không tách BE theo màn", impact="Issue rough lá có thể > 16 giờ (SC-04-07 40 giờ, SC-03-07 42 giờ) — tách lại khi có spec; không dùng cho SWP"),
    ],
    decisions=[dict(id="A-PD-01", problem="In thẳng 取引確認票 tại bàn GD (M05) — cách in",
        options_lab4="Trình duyệt chế độ kiosk-printing, không cài agent (giả định Q-TRD-03) · agent in cục bộ (~2 ngày, CR-10 — ADR-008 §6 E-05)",
        chosen="Break theo kiosk-printing: API-TRD-004 sinh PDF, in từ PC bàn GD; agent in là CR nếu khách chọn",
        why="ADR-008 §6 E-05 đang giả định in từ PC; TRADE_FUNC Q-TRD-03 chưa có trả lời; giữ đường không cài phần mềm để không tăng phạm vi")],
)

epics = [
    dict(id="EP-FG01", title="[FG-01] 参加者・資格管理 — người tham gia, 許可 / 承認",
         labels=["epic", "fg:FG-01", "feature:party", "rule:permit-vs-approval"],
         rfp_refs=["FR-PARTY-01", "FR-PARTY-02", "FR-PARTY-03", "BR-PERM-01", "SCOPE-01"],
         summary="Hồ sơ người tham gia, 保証金; vòng đời 許可 (仲卸) và 承認 (売買参加者) tách hai bảng / hai hàm / hai endpoint, 参加上限 có lịch sử. Nguồn: SC-01-02, PARTY_FUNC, PTY_PERMIT_LIFECYCLE_TECH, PTY_APPROVAL_LIFECYCLE_TECH, PARTY_DB."),
    dict(id="EP-FG03", title="[FG-03] ロット受付・評価記録 — tiếp nhận lô, 目利き (gồm offline / sync SC-03-07)",
         labels=["epic", "fg:FG-03", "feature:lot", "rule:human-decision"],
         rfp_refs=["FR-LOT-01", "FR-LOT-02", "FR-LOT-03", "FR-LOT-04", "BR-LOT-02", "SCOPE-02", "CAP-HUMAN-01"],
         summary="仮受付 → 本登録 → 目利き (người ghi, không AI / OCR) → 公開, sổ SL chỉ thêm; offline / sync SC-03-07. Nguồn: SC-03-01, SC-03-05, LOT_FUNC, LOT_REGISTER_TECH, LOT_INSPECTION_RECORD_TECH, LOT_DB."),
    dict(id="EP-FG04", title="[FG-04] 相対取引 — giao dịch thỏa thuận (luồng chính)",
         labels=["epic", "fg:FG-04", "feature:trade", "rule:aitai-main"],
         rfp_refs=["FR-AITAI-01", "FR-AITAI-02", "FR-AITAI-03", "BR-PERM-01", "SCOPE-03"],
         summary="Luồng chính (~90% giá trị): nhập + chốt 1 phím, kiểm 許可 / 承認 + 参加上限 tại lúc chốt, in phiếu, 当日訂正 / 取消 bằng REVERSE / DELTA. Nguồn: SC-04-01, TRADE_FUNC, TRADE_AITAI_CONFIRM_TECH, TRADE_QUALIFICATION_CHECK_TECH, TRADE_SAME_DAY_FIX_TECH, TRADE_DB."),
    dict(id="EP-FG05", title="[FG-05] せり結果記録 — ghi kết quả せり (luồng phụ)",
         labels=["epic", "fg:FG-05", "feature:trade", "rule:human-decision"],
         rfp_refs=["FR-SERI-01", "FR-SERI-02", "FR-SERI-03", "CAP-HUMAN-01", "SCOPE-03"],
         summary="Chỉ ghi kết quả cuối và 確認者 xác nhận theo phiên (người quyết), 差し戻し / 取消 dòng 失効; không đấu giá trực tuyến. Nguồn: SC-05-02, TRADE_SERI_CONFIRM_TECH, TRADE_DB 4.29."),
    dict(id="EP-FG06", title="[FG-06] 引渡し管理 — giao hàng, ngoại lệ, tranh chấp",
         labels=["epic", "fg:FG-06", "feature:delivery", "rule:human-decision"],
         rfp_refs=["FR-DEL-01", "FR-DEL-02", "FR-DEL-03", "FR-DEL-04", "FR-DEL-05", "BR-DEL-03", "SCOPE-04", "CAP-HUMAN-01"],
         summary="Giao nhiều lần idempotent (offline ở tablet), ngoại lệ (gồm nhập bù phiếu giấy) sinh REVERSE / DELTA khi ngày mở, 配送部門責任者 xác nhận tranh chấp (MFA, cấm tự xác nhận). Nguồn: SC-06-02/04/05, DELIVERY_FUNC, DEL_RECORD_TECH, DEL_EXCEPTION_DISPUTE_TECH."),
]

doc = dict(stream="A", epics=epics, issues=issues, gaps=gaps, not_issued=not_issued, premise=premise)
with open(OUT, "w", encoding="utf-8") as f:
    f.write("# LAB-5 P1 — backlog luồng A (FG-01, FG-03, FG-04, FG-05, FG-06) · 2026-11-26 · nguồn: thiết kế LAB-4 nhánh ver/lab-5\n")
    f.write("# hours_hint chỉ để kiểm độ hạt (brief §4); issue rough tính theo A-PA-02\n")
    yaml.safe_dump(doc, f, allow_unicode=True, sort_keys=False, width=200)
print("issues", len(issues))
