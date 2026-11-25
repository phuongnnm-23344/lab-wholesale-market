---
id: SPEC-API_LIST-001
title: Danh mục API (API List)
type: system
subtype: api-list
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
design_id: API_LIST
feature: _common
related: ["SPEC-API_CONV-001", "SPEC-ERROR_CODES-001", "BM-2-901-52"]
---

# Danh mục API

> Tương ứng sheet `API List` của biểu mẫu **BM-2-901-52**. Cấp `API ID` **ở đây trước** rồi mới mở file API Design (khuôn BM-2-901-52, bước 2). Quy ước URL, body lỗi, MFA: [`api-conventions.md`](api-conventions.md). Bảng tra version từng file: [`system-design/api-design/_index.md`](../system-design/api-design/_index.md).

---

## 1. Lịch sử sửa đổi

| No. | Version | Action | Thay đổi | Ngày | Người sửa | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu khi gộp P3: 42 API của 10 màn cốt lõi (7 feature), thống nhất `/api/v1`; API đã đề xuất nhưng chưa đặc tả ở mục 4 | 2026-11-25 | phuongnnm-23344 | LAB-4 P3 |
| 2 | 0.1.1 | Update | Gate 2 G2-M04: §4 thêm API đề xuất cho nguồn dữ liệu đầu vào (DEP-07..14), "ngoài 12 màn"; Q-STL-02: API-STL-001 checklist 12 mục | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. Quy tắc cấp ID

- `API-{TIỀN TỐ}-{nnn}` — tiền tố trùng tiền tố mã lỗi của feature ([`error-codes.md`](error-codes.md) §4): `PTY`, `LOT`, `TRD`, `DEL`, `STL`, `INC`, `RULE`. Số tăng dần, không tái dùng.
- File: `specs/system-design/api-design/{feature}/{API ID}_API.md`; ID tài liệu trong frontmatter `SPEC-{TIỀN TỐ}_API-{nnn}` (theo bản mẫu `sample-AUTH_LOGIN_API.md`: `SPEC-AUTH_API-001`).
- API dùng từ hai feature trở lên vẫn giữ ở feature sở hữu dữ liệu; liệt kê đủ màn gọi ở cột "Màn gọi". Ví dụ `API-LOT-005` (tra 出荷者 — master thuộc `rule` / RULE_DB) đặt ở `lot` vì hiện chỉ màn lô gọi; feature khác cần thì chuyển lên `api-design/` gốc, giữ ID.

---

## 3. Danh sách (42 API)

| Feature | Số API |
|---|---|
| `party` | 7 |
| `lot` | 6 |
| `trade` | 8 |
| `delivery` | 6 |
| `settle` | 5 |
| `incentive` | 4 |
| `rule` | 6 |

| API ID | Method | Endpoint | Tên | Feature | Màn gọi | API Design |
|---|---|---|---|---|---|---|
| API-PTY-001 | `GET` | `/api/v1/participants/{participantId}` | Lấy chi tiết người tham gia + khối 許可 hoặc 承認 | `party` | SC-01-02 | [API-PTY-001_API.md](../system-design/api-design/party/API-PTY-001_API.md) |
| API-PTY-002 | `PUT` | `/api/v1/participants/{participantId}` | Lưu thông tin cơ bản người tham gia | `party` | SC-01-02 | [API-PTY-002_API.md](../system-design/api-design/party/API-PTY-002_API.md) |
| API-PTY-003 | `POST` | `/api/v1/participants/{participantId}/deposits` | Đổi 保証金額 (thêm dòng lịch sử) | `party` | SC-01-02 | [API-PTY-003_API.md](../system-design/api-design/party/API-PTY-003_API.md) |
| API-PTY-004 | `POST` | `/api/v1/participants/{participantId}/permit-requests` | Tạo yêu cầu thay đổi 許可 (仲卸) | `party` | SC-01-03, SC-01-05 | [API-PTY-004_API.md](../system-design/api-design/party/API-PTY-004_API.md) |
| API-PTY-005 | `POST` | `/api/v1/permit-requests/{requestId}/transitions` | 起案 / 決裁・確認 / 却下 yêu cầu 許可 | `party` | SC-01-03, SC-01-05 | [API-PTY-005_API.md](../system-design/api-design/party/API-PTY-005_API.md) |
| API-PTY-006 | `POST` | `/api/v1/participants/{participantId}/approval-requests` | Tạo yêu cầu thay đổi 承認 (売買参加者) / 参加上限 | `party` | SC-01-04, SC-01-05 | [API-PTY-006_API.md](../system-design/api-design/party/API-PTY-006_API.md) |
| API-PTY-007 | `POST` | `/api/v1/approval-requests/{requestId}/transitions` | 確認・決裁 / 却下 yêu cầu 承認 | `party` | SC-01-04, SC-01-05 | [API-PTY-007_API.md](../system-design/api-design/party/API-PTY-007_API.md) |
| API-LOT-001 | `GET` | `/api/v1/lots/provisional` | Danh sách 仮受付 chờ 本登録 | `lot` | SC-03-01 | [API-LOT-001_API.md](../system-design/api-design/lot/API-LOT-001_API.md) |
| API-LOT-002 | `POST` | `/api/v1/lots` | 本登録 lô | `lot` | SC-03-01 | [API-LOT-002_API.md](../system-design/api-design/lot/API-LOT-002_API.md) |
| API-LOT-003 | `GET` | `/api/v1/lots` | Tìm / liệt kê lô | `lot` | SC-03-01, SC-03-05, SC-04-01, SC-03-03 | [API-LOT-003_API.md](../system-design/api-design/lot/API-LOT-003_API.md) |
| API-LOT-004 | `POST` | `/api/v1/lots/inspections` | Ghi kết quả 目利き・下見 | `lot` | SC-03-05 | [API-LOT-004_API.md](../system-design/api-design/lot/API-LOT-004_API.md) |
| API-LOT-005 | `GET` | `/api/v1/master/shippers` | Tìm 出荷者 trong master | `lot` | SC-03-01, SC-03-05 | [API-LOT-005_API.md](../system-design/api-design/lot/API-LOT-005_API.md) |
| API-LOT-006 | `GET` | `/api/v1/lots/form-options` | Giá trị chọn cho form lô (業務日, giờ nhận lô, 品目, đơn vị, 等級) | `lot` | SC-03-01, SC-03-05 | [API-LOT-006_API.md](../system-design/api-design/lot/API-LOT-006_API.md) |
| API-TRD-001 | `GET` | `/api/v1/trades/buyers` | Tìm người mua kèm tư cách 許可 / 承認 và 参加上限 | `trade` | SC-04-01, SC-04-05 | [API-TRD-001_API.md](../system-design/api-design/trade/API-TRD-001_API.md) |
| API-TRD-002 | `POST` | `/api/v1/trades/aitai` | Chốt GD 相対 (luồng chính) | `trade` | SC-04-01 | [API-TRD-002_API.md](../system-design/api-design/trade/API-TRD-002_API.md) |
| API-TRD-003 | `GET` | `/api/v1/trades` | Danh sách GD | `trade` | SC-04-01, SC-04-03 | [API-TRD-003_API.md](../system-design/api-design/trade/API-TRD-003_API.md) |
| API-TRD-004 | `POST` | `/api/v1/trades/{tradeId}/slip-prints` | In 取引確認票 (in thẳng / in lại) | `trade` | SC-04-01, SC-04-02, SC-04-05 | [API-TRD-004_API.md](../system-design/api-design/trade/API-TRD-004_API.md) |
| API-TRD-005 | `GET` | `/api/v1/seri-sessions/{sessionId}` | Lấy phiên せり để xác nhận (kèm đánh giá trước từng dòng) | `trade` | SC-05-02 | [API-TRD-005_API.md](../system-design/api-design/trade/API-TRD-005_API.md) |
| API-TRD-006 | `POST` | `/api/v1/seri-sessions/{sessionId}/confirm` | Xác nhận kết quả phiên せり | `trade` | SC-05-02 | [API-TRD-006_API.md](../system-design/api-design/trade/API-TRD-006_API.md) |
| API-TRD-007 | `POST` | `/api/v1/seri-sessions/{sessionId}/send-back` | 差し戻し dòng kết quả せり về 入力者 | `trade` | SC-05-02 | [API-TRD-007_API.md](../system-design/api-design/trade/API-TRD-007_API.md) |
| API-TRD-008 | `POST` | `/api/v1/trades/{tradeId}/fixes` | 当日訂正 / 取消 GD (ngày chưa khóa) | `trade` | SC-04-05 | [API-TRD-008_API.md](../system-design/api-design/trade/API-TRD-008_API.md) |
| API-DEL-001 | `GET` | `/api/v1/deliveries/pending` | Danh sách GD chờ giao của một người mua (hoặc một GD) | `delivery` | SC-06-02, SC-06-04 | [API-DEL-001_API.md](../system-design/api-design/delivery/API-DEL-001_API.md) |
| API-DEL-002 | `GET` | `/api/v1/deliveries/offline-snapshot` | Snapshot dữ liệu giao cho chế độ offline | `delivery` | SC-06-02 | [API-DEL-002_API.md](../system-design/api-design/delivery/API-DEL-002_API.md) |
| API-DEL-003 | `POST` | `/api/v1/deliveries` | Ghi một hoặc nhiều lần giao (idempotent) | `delivery` | SC-06-02 | [API-DEL-003_API.md](../system-design/api-design/delivery/API-DEL-003_API.md) |
| API-DEL-004 | `POST` | `/api/v1/delivery-exceptions` | Ghi ngoại lệ giao / tranh chấp (gồm nhập bù phiếu giấy) | `delivery` | SC-06-04 | [API-DEL-004_API.md](../system-design/api-design/delivery/API-DEL-004_API.md) |
| API-DEL-005 | `GET` | `/api/v1/delivery-exceptions/disputes` | Danh sách tranh chấp chờ 配送部門責任者 xác nhận | `delivery` | SC-06-05 | [API-DEL-005_API.md](../system-design/api-design/delivery/API-DEL-005_API.md) |
| API-DEL-006 | `POST` | `/api/v1/delivery-exceptions/{exceptionId}/confirmation` | 配送部門責任者 xác nhận / kết luận tranh chấp (MFA) | `delivery` | SC-06-05 | [API-DEL-006_API.md](../system-design/api-design/delivery/API-DEL-006_API.md) |
| API-STL-001 | `GET` | `/api/v1/business-days/{businessDate}/close-checklist` | Checklist 日次締め (12 mục chuẩn ADR-005 §2.5) | `settle` | SC-07-02 | [API-STL-001_API.md](../system-design/api-design/settle/API-STL-001_API.md) |
| API-STL-002 | `POST` | `/api/v1/business-days/{businessDate}/close` | Khóa 業務日 (日次締め) — không có API mở lại | `settle` | SC-07-02 | [API-STL-002_API.md](../system-design/api-design/settle/API-STL-002_API.md) |
| API-STL-003 | `POST` | `/api/v1/devices/{deviceId}/lost` | Đánh dấu thiết bị 「端末回収不能」 | `settle` | SC-07-02 | [API-STL-003_API.md](../system-design/api-design/settle/API-STL-003_API.md) |
| API-STL-004 | `GET` | `/api/v1/corrections/{correctionId}` | Chi tiết 修正申請 + xem trước bản ghi sẽ sinh | `settle` | SC-08-03 | [API-STL-004_API.md](../system-design/api-design/settle/API-STL-004_API.md) |
| API-STL-005 | `POST` | `/api/v1/corrections/{correctionId}/decisions` | 決裁 / 却下 修正申請 (cấp 1 / cấp 2) — phản ánh REVERSE / DELTA | `settle` | SC-08-03 | [API-STL-005_API.md](../system-design/api-design/settle/API-STL-005_API.md) |
| API-INC-001 | `GET` | `/api/v1/periods/{periodId}/lock-view` | màn 期ロック (đọc kỳ, phân bổ 入金, cảnh báo) | `incentive` | SC-09-04 | [API-INC-001_API.md](../system-design/api-design/incentive/API-INC-001_API.md) |
| API-INC-002 | `POST` | `/api/v1/periods/{periodId}/incentive-previews` | 試算 完納奨励金 (không ghi kết quả, ghi 監査ログ) | `incentive` | SC-09-04 | [API-INC-002_API.md](../system-design/api-design/incentive/API-INC-002_API.md) |
| API-INC-003 | `POST` | `/api/v1/periods/{periodId}/lock` | 期ロック (tính chính thức + đóng băng trong một transaction) | `incentive` | SC-09-04 | [API-INC-003_API.md](../system-design/api-design/incentive/API-INC-003_API.md) |
| API-INC-004 | `GET` | `/api/v1/periods/{periodId}/incentive-results` | kết quả 完納奨励金 chính thức của một kỳ đã khóa | `incentive` | SC-09-04, SC-09-05 | [API-INC-004_API.md](../system-design/api-design/incentive/API-INC-004_API.md) |
| API-RULE-001 | `GET` | `/api/v1/rule-versions/{versionId}/review` | dữ liệu màn 規則版確認 (version, so sánh, quota, ví dụ, chính sách E-14) | `rule` | SC-10-04 | [API-RULE-001_API.md](../system-design/api-design/rule/API-RULE-001_API.md) |
| API-RULE-002 | `POST` | `/api/v1/rule-versions/{versionId}/confirm` | checker 確認 version quy chế (→ 発効待ち, hoặc 決裁待ち ở nhánh N2) | `rule` | SC-10-04 | [API-RULE-002_API.md](../system-design/api-design/rule/API-RULE-002_API.md) |
| API-RULE-003 | `POST` | `/api/v1/rule-versions/{versionId}/second-approval` | 運用部門長 決裁 rollback khi đã đủ 4 lần (chỉ nhánh N2 của E-14) | `rule` | SC-10-04 | [API-RULE-003_API.md](../system-design/api-design/rule/API-RULE-003_API.md) |
| API-RULE-004 | `POST` | `/api/v1/rule-versions/{versionId}/return` | checker 差し戻す version quy chế (→ 下書き) | `rule` | SC-10-04 | [API-RULE-004_API.md](../system-design/api-design/rule/API-RULE-004_API.md) |
| API-RULE-005 | `POST` | `/api/v1/rule-versions/{versionId}/cancel` | 取り消す version quy chế trước ngày hiệu lực (không tính quota) | `rule` | SC-10-04 | [API-RULE-005_API.md](../system-design/api-design/rule/API-RULE-005_API.md) |
| API-RULE-006 | `POST` | `/api/v1/rule-versions/{versionId}/cancel-request` | maker đề nghị hủy version 発効待ち (bước 1 của hủy có maker-checker) | `rule` | SC-10-04, SC-10-01 | [API-RULE-006_API.md](../system-design/api-design/rule/API-RULE-006_API.md) |

---

## 4. API đã đề xuất, chưa đặc tả (ngoài 12 màn)

Màn cốt lõi đã gọi tới (DEP-01..06) hoặc cần làm nguồn dữ liệu đầu vào (DEP-07..17) nhưng chưa có API Design — **chưa cấp ID**, LAB-5 tạo issue (xem [`specs/_index.md`](../_index.md) mục "Phụ thuộc chưa đặc tả").

| Đề xuất | Feature | Màn / spec cần | Ghi chú |
|---|---|---|---|
| `POST /api/v1/auth/mfa/verify` | `iam` | C-30 ở SC-01-02, SC-06-05, SC-07-02, SC-08-03, SC-09-04, SC-10-04 | Xác thực mã 6 số → làm mới step-up; có `purpose` thì trả token dùng một lần (api-conventions §4) |
| `GET /api/v1/staff/lookup?employeeNo=` | `iam` | SC-03-05 [8], SC-06-04 [5] | Tra tên theo 社員番号, chỉ tài khoản `ACTIVE` |
| `POST /api/v1/attachments`, `GET /api/v1/attachments/{attachmentId}` | đính kèm chung | SC-06-04 [11], SC-08-03 [6] | Upload / tải chứng từ; lỗi tạm dùng `E-DEL-029` |
| API hàng đợi đồng bộ offline | `sync` | SC-03-02, SC-06-02 (ADR-008) | Đối chiếu SC-03-07; API-DEL-003 là đầu ghi của delivery |
| `POST /api/v1/lots/provisional`, `POST /api/v1/lots/{lotId}/cancel-provisional` | `lot` | SC-03-02 → SC-03-01 (DEP-07) | Ghi 仮受付 online, cấp mã chính thức khi lên server; hủy → `CANCELLED`, giữ số (Q-LOT-01) |
| `POST /api/v1/rule-versions`, `PUT /api/v1/rule-versions/{versionId}`, `POST …/{versionId}/submit` | `rule` | SC-10-01..03 → SC-10-04 (DEP-08) | Maker tạo / sửa `DRAFT`, gửi `PENDING`; sau 差し戻し sửa và gửi lại |
| `POST /api/v1/corrections` | `settle` | SC-08-01 → SC-08-03 (DEP-09) | Mọi phạm vi `TRADE` / `KANNO` / `INCENTIVE` / `LATE_ENTRY`; trả số cấp duyệt theo ngưỡng |
| `POST /api/v1/seri-sessions/{sessionId}/results`, `PUT …/results/{tradeId}` | `trade` | SC-05-01 → SC-05-02 (DEP-10) | Ghi dòng kết quả; sửa số người mua sau 差し戻し (lịch sử số cũ / mới — Q-TRD-05) |
| `POST /api/v1/payment-imports`, `GET/PUT /api/v1/partner-code-mappings` | `incentive` | SC-09-01..03 → SC-09-04 (DEP-11) | Import CSV lưu 入金日 ngân hàng (Q-INC-01); ánh xạ 取引先コード; phân bổ FIFO (INC_FUNC 2.3) |
| `GET/PUT /api/v1/market-calendar`, `POST /api/v1/business-days/{businessDate}/open` (job) | `calendar` | SC-10-05; mọi màn ghi (DEP-12) | Mở 業務日, tạo kỳ ở lần mở đầu tháng (Q-INC-03, DEC-055) |
| `GET/POST /api/v1/delegations` | `iam` | SC-02-03 tab 代行者 → SC-08-03, SC-07-02 (DEP-14) | 代行 chỉ định trước (Q-STL-04) |
