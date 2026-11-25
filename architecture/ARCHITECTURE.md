---
id: ARCH-001
title: Kiến trúc to-be Product A (第1期)
type: architecture
status: draft
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [DOC-PREMISE-001, ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-006, ADR-007, ADR-008, ADR-009, ADR-010, DEC-002, DEC-004, DEC-005, DEC-009, DEC-012, L4-D01]
---

# Kiến trúc to-be Product A (第1期)

Tài liệu mô tả hệ thống **sẽ xây** cho 第1期 (giai đoạn 1, phạm vi hợp đồng gói R1 — PREMISE §1.2): thành phần trên AWS Tokyo, luồng dữ liệu chính, điểm tích hợp, cách các ràng buộc nghiệp vụ của chợ được đặt vào kiến trúc. Lý do của từng lựa chọn nằm ở ADR ([adr/_index.md](adr/_index.md)); tài liệu này chỉ dẫn số ADR, không lặp lại phần cân nhắc.

Không phải phạm vi của tài liệu: bảng / cột chi tiết (Database Design, `specs/system-design/database-design/`), hợp đồng API (API Design), hành vi từng màn (Screen Specification). Option và 17 mục 第2期 chỉ có **điểm mở rộng có tên** (§10), không thiết kế chi tiết (luật 6).

## 0. Thuật ngữ dùng trong tài liệu

| Thuật ngữ | Nghĩa |
|---|---|
| 相対取引 (aitai) | Mua bán thỏa thuận trực tiếp giữa 卸売業者 và người mua — **luồng chính, ~90% giá trị GD** |
| せり (seri) | Đấu giá tại chỗ — **luồng phụ, ~10%**; hệ thống chỉ ghi kết quả do せり人 (người điều khiển đấu giá) quyết |
| 仲卸 / 許可 | Người bán buôn trung gian / **giấy phép** có xét duyệt — căn cứ tham gia của 仲卸 |
| 売買参加者 / 承認 | Người tham gia mua bán / **chấp thuận**, thủ tục nhẹ hơn, kèm 参加上限 (hạn mức tham gia) |
| 買出人 | Người mua lẻ đăng ký tại chợ, không có tài khoản ở 第1期 |
| 受付 / 仮受付 / 本登録 | Tiếp nhận lô / tiếp nhận tạm ở bến / đăng ký chính thức ở quầy |
| 目利き・下見 | Đánh giá chất lượng, độ tươi bằng mắt — chỉ người làm, hệ thống ghi lại |
| 引渡し | Giao hàng cho người mua (nhiều lần / GD) |
| 業務日 / 日次締め | Ngày nghiệp vụ (bắt đầu 02:00 JST) / khóa ngày nghiệp vụ |
| 期 / 期ロック | Kỳ thanh toán (tháng dương lịch theo 業務日) / khóa kỳ |
| 修正申請 / 当日訂正 / 取消 | Yêu cầu điều chỉnh sau khi khóa ngày (có duyệt) / sửa trong ngày chưa khóa / hủy GD trong ngày chưa khóa |
| 完納奨励金 | Tiền thưởng cho người trả đủ, đúng hạn tiền của kỳ |
| 入金 / 消込 | Tiền người mua trả vào / đối chiếu tiền vào với khoản phải thu |
| 照合部門長 / 運用部門長 / 配送部門責任者 | Trưởng phòng đối soát / trưởng phòng vận hành / người phụ trách giao hàng — ba **quyền duyệt** gắn vào tài khoản |
| REVERSE / DELTA | Bản ghi đảo ngược dòng cũ / bản ghi chênh lệch dòng mới — cách sửa không ghi đè |

Ký hiệu ID theo PREMISE §0. `Q-ARCH-xx` là câu hỏi mới phát sinh ở tài liệu này (§12).

## 1. Bối cảnh và ràng buộc chính

| Ràng buộc | Giá trị | ID |
|---|---|---|
| Giờ dịch vụ có SLA | 02:00–10:00 JST, 週6日 (trừ 休市日); 10:00–18:00 vẫn chạy nhưng ngoài SLA; bảo trì 20:00–24:00 hoặc 休市日, cấm 01:00–02:00 | NFR-AVL-01, PRM-081 |
| Khả dụng | 99,5% / tháng trong giờ dịch vụ | NFR-AVL-01 |
| DR | RTO ≤ 4h, RPO ≤ 15 phút | NFR-AVL-03, PRM-082 |
| Tải | 180 TK, 60 đồng thời (thiết kế cho ~230 TK, ~77 đồng thời × burst 2 × dư 1,5); 350–600 lô, 700–1.200 GD / ngày | FIG-LOAD-01, PRM-083 |
| Hiệu năng | Tìm kiếm thường p95 ≤ 2s; báo cáo / batch xuất xong trước 11:00 | NFR-PERF-01, PRM-084 |
| Lưu trữ | Dữ liệu nghiệp vụ online 7 năm; ảnh / chứng từ online 3 năm rồi lưu lạnh | DR-RET-01 |
| Mạng hiện trường | Mất mạng ngắn 3–5 lần / tuần mùa cao điểm; chốt GD bắt buộc online | NFR-AVL-02, DEC-004, PRM-085 |
| Bảo mật | MFA cho quản trị và người có quyền duyệt; khóa tạm khi sai nhiều lần; TLS; secret tách khỏi source; APPI | NFR-SEC-01, NFR-SEC-03, NFR-SEC-04, 09-06 |
| Nền tảng | AWS Tokyo managed, tài khoản đứng tên khách, IaC, dev / stg / prod | DEC-002, PRM-080, L4-D01 |

## 2. Kiểu kiến trúc

**Modular monolith** một codebase Next.js + TypeScript, một PostgreSQL. Ranh giới module theo miền dữ liệu của RFP (08-01). Mọi ghi nghiệp vụ đi qua **hàm trong DB** kiểm quyền + quy tắc trong cùng transaction — giữ nguyên nguyên tắc đã chạy được ở prototype (as-built §1), chỉ thay lớp gắn với Supabase. Lý do: ADR-001.

| Module | Miền | Trách nhiệm chính | Ràng buộc đặt ở module |
|---|---|---|---|
| `iam` | — | Tài khoản, vai, quyền duyệt, 代行者 (người làm thay), PIN, MFA, phiên, thiết bị | ADR-002, ADR-003 |
| `party` | D-PARTY | Hồ sơ 4 loại người tham gia; **許可 (仲卸)** và **承認 (売買参加者)** hai bảng, hai vòng đời; 保証金, 参加上限 | ADR-003; luật 2 |
| `lot` | D-LOT | 仮受付 → 本登録 → 目利き → 公開 → 確定 / 持ち越し; sổ số lượng lô | BR-LOT-02, CAP-HUMAN-01 |
| `trade` | D-TRADE | **相対 (luồng chính)**, せり (phụ), 当日訂正 / 取消 | BR-PERM-01, luật 1 |
| `delivery` | D-DELIVERY | 引渡し nhiều lần, ngoại lệ, tranh chấp | BR-DEL-03, CAP-HUMAN-01 |
| `settle` | D-SETTLE | 日次精算, 日次締め, 修正申請 + duyệt, xuất IF-ACC-01 | BR-CLOSE-01, ADR-004, ADR-005 |
| `incentive` | D-INCENTIVE | Kỳ, 入金, phân bổ tiền vào kỳ, 完納奨励金, 期ロック | BR-INC-01, ADR-007 |
| `rule` | — | Quy chế có version, maker-checker, rollback, quota 4 lần / năm TC | GOV-RULE-01, ADR-006 |
| `calendar` | — | Lịch chợ – ngân hàng, mở 業務日 | ADR-005 |
| `notify` | — | In-app + email (outbox, gửi lại ≤ 3), danh sách in | BR-NOTIFY-01, L4-A08 |
| `report` | — | 12 báo cáo cố định, CSV, PDF phiếu | FR-RPT-01..03 |
| `audit` | D-AUDIT | 監査ログ chỉ thêm, tra cứu | FR-AUDIT-01..03 |
| `sync` | — | Nhận hàng đợi offline, đối chiếu (SC-03-07) | ADR-008 |

Quy tắc phụ thuộc: module chỉ gọi module khác qua service công khai của module đó; không đọc bảng của module khác trừ qua view được công bố. Tách được thành service riêng sau này mà không đổi mô hình dữ liệu (DEC-002 "kiến trúc dễ chuyển").

## 3. Thành phần trên AWS Tokyo

```mermaid
flowchart LR
  subgraph SITE["Hiện trường chợ"]
    PC["PC bàn GD / quầy 受付 / phòng 照合<br/>Chrome / Edge, bàn phím số"]
    TAB["Tablet bến / khu giao hàng<br/>PWA + hàng đợi offline"]
    PRN["Máy in hiện trường"]
  end
  subgraph TOKYO["AWS ap-northeast-1 Tokyo · tài khoản đứng tên khách"]
    EDGE["CloudFront + WAF"]
    ALB["ALB"]
    APP["ECS Fargate<br/>Next.js modular monolith<br/>≥ 2 task, 2 AZ"]
    JOB["ECS task theo lịch<br/>job / batch / worker outbox"]
    SCH["EventBridge Scheduler<br/>Asia/Tokyo"]
    DB[("RDS for PostgreSQL<br/>Multi-AZ, PITR")]
    S3[("S3<br/>chứng từ, CSV, PDF, archive")]
    SES["Amazon SES"]
    SEC["Secrets Manager + KMS"]
    MON["CloudWatch + giám sát SaaS"]
  end
  subgraph OSAKA["AWS ap-northeast-3 Osaka"]
    BK[("Bản sao backup<br/>+ log PITR")]
  end
  ACC["Phần mềm kế toán hiện có"]
  EXT["Người tham gia bên ngoài<br/>(chỉ nhận email)"]

  PC --> EDGE
  TAB --> EDGE
  EDGE --> ALB --> APP
  APP --> DB
  APP --> S3
  SCH --> JOB
  JOB --> DB
  JOB --> S3
  JOB --> SES --> EXT
  APP -. "PDF phiếu" .-> PC --> PRN
  PC -. "tải CSV IF-ACC-01 ra / 入金 CSV vào" .-> ACC
  DB -. "sao chép backup" .-> BK
  S3 -. "sao chép" .-> BK
  APP --- SEC
  APP --- MON
```

| Thành phần | Vai trò | Cấu hình định hướng | NFR / ID |
|---|---|---|---|
| CloudFront + WAF | TLS, chặn tấn công phổ biến, giới hạn tần suất đăng nhập / PIN | Rule set managed + rate-based rule; có thể giới hạn IP chợ cho màn quản trị (Q-ARCH-06) | NFR-SEC-03, NFR-SEC-04 |
| ALB + ECS Fargate (app) | Chạy Next.js (trang + route handler API) | ≥ 2 task trên 2 AZ, auto scaling theo CPU; deploy rolling, không deploy trong 01:00–10:00 | NFR-AVL-01, PRM-081 |
| ECS task theo lịch (job) | Mở 業務日 02:00, worker outbox email, xuất batch, báo cáo, nhắc hạn | Cùng image với app, entrypoint khác; EventBridge Scheduler cron múi giờ Asia/Tokyo | M10, NFR-OPS-01 |
| RDS for PostgreSQL Multi-AZ | Dữ liệu nghiệp vụ, hàm nghiệp vụ, trigger, RLS | Multi-AZ DB instance, PITR 35 ngày, mã hóa KMS, maintenance window 20:00–24:00 | NFR-AVL-01, NFR-AVL-03, ADR-009 |
| S3 | Đính kèm, CSV xuất / nhập (bản gốc), PDF, archive | Versioning, mã hóa, chặn public; lifecycle chứng từ 3 năm → lưu lạnh | DR-RET-01, TBL-ATTACH-01 |
| Amazon SES | Email cho người tham gia bên ngoài và nội bộ | Domain đã xác thực (SPF / DKIM / DMARC); bounce / complaint về app | BR-NOTIFY-01, PRM-073 |
| Secrets Manager + KMS | Mật khẩu DB, khóa ký phiên, khóa SES | Xoay vòng định kỳ; không có secret trong repo / image | NFR-SEC-04 |
| CloudWatch + giám sát SaaS | Health, lỗi batch / xuất, lỗi gửi email, sự kiện bảo mật | Alarm → on-call; NOTIFY-02 Critical ≤ 5 phút | NFR-OPS-01, FR-NOTIFY-02 |
| Osaka (bản sao backup) | Khôi phục khi cả region Tokyo hỏng | Sao chép tự động backup RDS + log PITR, sao chép S3 | NFR-AVL-03, ADR-009 (Q-ARCH-01) |
| IaC | Dựng dev / stg / prod giống nhau, dựng lại được ở Osaka | AWS CDK (TypeScript) — đề xuất PL, cùng ngôn ngữ với app | PRM-080 |

Chi phí cloud tham chiếu: ~235.000 JPY / tháng sau go-live, khách trả thẳng cho AWS (estimate-basis §5.3). Cấu hình trên nằm trong khung đó; dòng Osaka là chi phí lưu trữ backup, không chạy máy chờ.

## 4. Luồng dữ liệu nghiệp vụ chính

### 4.1 Một ngày chợ: 受付 → 取引 → 引渡し → 日次締め

```mermaid
flowchart LR
  A["仮受付<br/>tablet bến · offline được"] --> B["本登録<br/>quầy PC · cấp mã lô"]
  B --> C["目利き・下見<br/>NGƯỜI đánh giá, hệ thống ghi"]
  C --> D["公開<br/>chỉ lô 下見済"]
  D ==> E["相対取引 · LUỒNG CHÍNH ~90%<br/>kiểm 許可 / 承認 + SL + 参加上限<br/>lúc chốt · bắt buộc online"]
  D --> F["せり · luồng phụ ~10%<br/>nhập kết quả → NGƯỜI KHÁC xác nhận"]
  E ==> G["引渡し nhiều lần<br/>offline được"]
  F --> G
  G --> H{"Tranh chấp?"}
  H -- "Không" --> I["日次締め<br/>checklist + MFA"]
  H -- "Có" --> J["配送部門責任者 xác nhận<br/>MFA · không tự xác nhận"]
  J --> I
  E -. "trong ngày chưa khóa" .-> K["当日訂正 / 取消<br/>lý do, REVERSE / DELTA"]
  I --> L["Xuất IF-ACC-01 CSV<br/>đóng băng lúc tạo"]
  I -. "sau khi khóa" .-> M["修正申請 → duyệt 1–2 cấp<br/>REVERSE / DELTA vào ngày mở sớm nhất"]
```

Mũi tên đậm là luồng chính. せり đi chung các bước sau 確定 với 相対 nhưng có thêm bước xác nhận bởi người thứ hai (PRM-115). Lô còn số lượng khi khóa ngày → 持ち越し sang 業務日 sau cùng mã lô (PRM-110, E-12).

### 4.2 Một kỳ: 請求 / 入金 → 完納奨励金 → 期ロック

```mermaid
flowchart LR
  T["GD 確定 + REVERSE / DELTA<br/>gán kỳ theo 業務日 của GD gốc"] --> P["期のお支払額<br/>thuế theo suất, 1 lần / người × kỳ × suất"]
  R["入金 CSV từ kế toán<br/>chặn file trùng SHA-256"] --> Q["Phân bổ tiền vào kỳ<br/>FIFO · 請求番号 khi có E-02"]
  P --> X{"完納?<br/>đủ tiền trước 支払期日<br/>không ân hạn"}
  Q --> X
  X --> V["Xem trước kết quả<br/>hiện tiền đã gán vào kỳ nào"]
  V --> W["期ロック · 照合部門長 + MFA<br/>tính chính thức + đóng băng<br/>theo version quy chế của kỳ"]
  W --> Y["Kết quả 奨励金 + dòng 端数調整<br/>→ batch IF-ACC-01"]
  W --> Z["Email kết quả cho người tham gia"]
  W -. "kỳ đã khóa bị sửa sau đó" .-> D2["DELTA ở kỳ sau<br/>không hồi tố 完納"]
```

Chi tiết tính: ADR-007 và Technical Design 完納奨励金 (P3).

### 4.3 Đường đi của một thao tác ghi

```mermaid
sequenceDiagram
  autonumber
  participant U as Trình duyệt
  participant A as App (route handler)
  participant D as PostgreSQL
  U->>A: POST /api/... (cookie phiên)
  A->>A: Kiểm phiên, thiết bị, MFA step-up nếu hành động cần (ADR-002)
  A->>A: Validate input (zod)
  A->>D: BEGIN · set_config app.user_id / app.device_id / app.mfa_at (local)
  A->>D: SELECT fn_nghiep_vu(...)
  D->>D: assert_caller(vai, quyền duyệt, 代行) · kiểm quy tắc · quy chế theo ngày (ADR-003, ADR-006)
  D->>D: INSERT (append-only) · trigger: ngày mở, đóng băng, audit (ADR-004, ADR-005)
  D->>D: Ghi outbox nếu cần email
  A->>D: COMMIT
  A-->>U: JSON hoặc mã lỗi chuẩn (HTTP 4xx có mã nghiệp vụ)
```

App server không có quyền INSERT / UPDATE / DELETE trực tiếp lên bảng; DB role của app chỉ có EXECUTE trên hàm nghiệp vụ và SELECT qua RLS. Mất app layer vẫn không ghi tắt được quy tắc.

## 5. Phân quyền: vai nội bộ, quyền duyệt, 許可 ≠ 承認

Ba lớp tách nhau, kiểm trong DB (ADR-003):

| Lớp | Áp cho | Gồm | Kiểm lúc |
|---|---|---|---|
| Vai nội bộ | Nhân viên chợ (có tài khoản) | ROLE-INTAKE, JUDGE, TRADE, DELIVERY, SETTLEMENT, RULE-ADMIN, SYS-ADMIN (TBL-ROLE-01) | Mỗi lần gọi hàm; quyền đọc theo đủ ma trận vai × màn (L4-A06) |
| Quyền duyệt | Người được giao | 照合部門長, 運用部門長, 配送部門責任者 + 代行者 có ngày bắt đầu / kết thúc (PRM-129) | Hành động duyệt; cấm tự duyệt thứ mình lập / ghi |
| Tư cách tham gia | Người tham gia (không đăng nhập ở 第1期) | **許可** cho 仲卸 · **承認** cho 売買参加者 (+ 参加上限) · đăng ký chợ cho 卸売業者 · đăng ký tại điểm cho 買出人 | **Lúc chốt GD** (BR-PERM-01), không phải lúc nhập |

許可 và 承認 là **hai bảng, hai vòng đời, hai căn cứ** (luật 2): trường, trạng thái (有効 / 一時停止 / 失効 / 再審査 — FIG-010), người 決裁 khác nhau; không có bảng "giấy phép chung" có cột loại. Duyệt nội bộ trên màn và tài liệu dùng chữ 決裁 / 確認, không dùng 承認, để khỏi lẫn với 承認 của 売買参加者 (PRM-121).

## 6. Người quyết định cuối (human-in-the-loop)

Hệ thống **chỉ ghi** quyết định của người; không OCR ký hiệu tay, không nhận dạng 符丁, không AI chấm chất lượng (CAP-HUMAN-01, SCOPE-OUT-01/02/06; ADR-010).

| Điểm quyết | Người quyết | Hệ thống làm gì | MFA | ID |
|---|---|---|---|---|
| 目利き・下見 | ROLE-JUDGE | Ghi grade / ghi chú + người + thời điểm; chỉ lô 下見済 mới 公開 | — | FR-LOT-02, PRM-117 |
| Kết quả せり | せり人 quyết tại sàn; người xác nhận khác người nhập | Ghi kết quả; trùng người → bắt lý do, gắn cờ 要確認 | — | FR-SERI-01/02, PRM-115 |
| Vượt 参加上限 (売買参加者) | Người chốt GD | Cảnh báo + bắt lý do, không chặn cứng | — | PRM-046, L4-A04 (1) |
| 修正申請 cấp 1 / cấp 2 | 照合部門長 / 運用部門長 (ngưỡng tiền trong quy chế) | Sinh REVERSE / DELTA, bản gốc giữ nguyên | Có | FR-CORR-02, PRM-120 |
| Giao có tranh chấp | 配送部門責任者, không phải người đã ghi lần giao đó | Ghi xác nhận; mất mạng → đường giấy (ADR-008) | Có | CAP-HUMAN-01, PRM-111 |
| 日次締め / 期ロック | 照合部門長 (hoặc 代行) | Checklist trước khóa; khóa không mở lại | Có | BR-CLOSE-01, PRM-119 |
| Duyệt quy chế / rollback | Checker 照合部門長 (+ 運用部門長 ở nhánh N2) | maker ≠ checker | Có | GOV-RULE-01, ADR-006 |
| 一時停止 / 失効 / phục hồi tư cách | 運用部門長 決裁 | Đổi trạng thái có lịch sử, gửi email | Có | PRM-121, PREMISE §3.2 |

## 7. Không ghi đè lịch sử, khóa ngày / kỳ, quy chế có version

### 7.1 Append-only + REVERSE / DELTA (ADR-004)

- GD đã 確定 bị đóng băng; mọi thay đổi sinh **REVERSE** (đảo dòng cũ, gắn người mua cũ) + **DELTA** (dòng mới, gắn người mua mới). Một cơ chế cho cả 当日訂正 / 取消 (trước khóa ngày, chỉ cần lý do) và 修正申請 (sau khóa ngày, duyệt 1–2 cấp).
- Sổ số lượng lô, giao hàng, điều chỉnh, 入金, kết quả thưởng, 監査ログ: chỉ INSERT, trigger chặn UPDATE / DELETE. Không có cờ tắt audit, không có hàm reset ở production (sửa D19, M24).

### 7.2 Khóa ngày, khóa kỳ (ADR-005)

- 業務日 mở bằng job 02:00 JST theo lịch chợ; lô nhận từ 01:00 (tham số quy chế) gắn vào 業務日 sáng đó; chốt GD từ 02:00 (PRM-116, sửa D22).
- 日次締め khóa vĩnh viễn ngày đó ở mức DB (trigger `DAY_LOCKED`); không có chức năng mở khóa (Q-ARCH-02). Sửa sau khóa đi 修正申請, chênh lệch ghi vào **ngày chưa khóa sớm nhất** (PRM-120).
- 期 = tháng dương lịch theo 業務日 của GD gốc (GD 01:30 ngày 1 thuộc kỳ trước — L4-A04 (2)). 期ロック đóng băng kết quả kỳ; sửa sau đó → DELTA ở kỳ sau.

### 7.3 Quy chế có version, maker-checker, rollback — hai nhánh E-14 (ADR-006)

Quy chế gồm **bảng tỷ lệ (2 bảng: 仲卸 / 売買参加者, 5 bậc)** và **tham số đụng tiền** (PREMISE §3.1). Mỗi bản ghi tiền lưu version đã áp (FR-AUDIT-03). Tham số thuần vận hành nằm ở file cấu hình có nhật ký (PRM-126), không tính quota.

```mermaid
flowchart TD
  S["Yêu cầu đổi quy chế"] --> K{"Loại"}
  K -- "Version mới" --> Q1{"Năm TC này đã dùng<br/>4 lượt chưa?<br/>(không tính bộ go-live,<br/>bản nháp hủy)"}
  Q1 -- "Chưa" --> OK["maker RULE-ADMIN → checker 照合部門長 + MFA<br/>hiệu lực ngày 1 tháng tương lai · đếm 1 lượt"]
  Q1 -- "Đủ 4" --> NO["CHẶN — cả N1 và N2"]
  K -- "Rollback về version cũ" --> Q2{"Đã dùng 4 lượt?"}
  Q2 -- "Chưa" --> OK
  Q2 -- "Đủ 4" --> WS{"Workshop E-14<br/>ban lãnh đạo quyết"}
  WS -- "N1 · chặn" --> N1["Chặn rollback<br/>version sai chạy tới hết tháng 3<br/>mỗi kỳ xử lý bằng DELTA<br/>R-L4-01"]
  WS -- "N2 · không chặn<br/>(ý kiến khách [Giả lập])" --> N2["Lý do bắt buộc · checker 照合部門長<br/>+ 運用部門長 決裁 MFA<br/>tự báo ban lãnh đạo · vẫn đếm, hiện ở báo cáo<br/>hiệu lực ngày 1 tháng tương lai"]
```

Kỳ đã khóa không bị version mới hay rollback chạm vào (FB-CUS-227). Hai nhánh **không** làm thành công tắc cấu hình — workshop chọn một, code cài một (PREMISE §6 OPEN-L4-01).

## 8. Hiện trường: PIN, offline, máy in

- **Máy dùng chung:** đăng nhập một lần cho thiết bị, đổi người bằng mã nhân viên + PIN 4 số; MFA step-up trước hành động ở PREMISE §3.2, hiệu lực **10 phút** cùng người cùng thiết bị; tài khoản SYS-ADMIN MFA ngay khi đăng nhập (ADR-002). Người không dùng điện thoại riêng nhận mã bằng **token phần cứng TOTP** cá nhân (FB-CUS-231).
- **Offline (ADR-008):** chỉ 仮受付, ghi 引渡し, 紙伝票後入力 có hàng đợi cục bộ; chốt 相対 / xác nhận せり / mọi duyệt bắt buộc online. Màn hình báo đang mất mạng + số bản ghi chưa đồng bộ; đồng bộ lỗi vào SC-03-07, không ghi đè; khóa ngày đếm thiết bị còn bản ghi chưa đồng bộ.
- **Đường giấy:** 相対 lúc mất mạng → 紙伝票 rồi 後入力; giao có tranh chấp lúc mất mạng → phiếu giấy có chữ ký 配送部門責任者, nhập bù + đính kèm bản scan, xác nhận lại trong hệ thống có MFA (FB-CUS-232).
- **Máy in:** server sinh PDF theo mẫu FORM, PC bàn GD in thẳng không xem trước (§9).

## 9. Điểm tích hợp

Các lựa chọn dưới đây đã chốt ở LAB-1 (PRM / DEC), không phải quyết định kiến trúc mới nên không viết ADR riêng.

| Điểm | Hướng | Cách làm | Lỗi / an toàn | ID |
|---|---|---|---|---|
| Kế toán IF-ACC-01 | Ra | Batch CSV tạo sau 日次締め; **đóng băng nội dung lúc tạo** (kể cả ánh xạ 勘定科目 / 税区分), xuất lại cùng ngày trả đúng file cũ; dòng 端数調整 ở 期ロック; người dùng tải về và import tay vào phần mềm kế toán. Định dạng chờ E-01 | Ánh xạ 仕訳 có lịch sử, đổi chỉ áp cho batch sau; batch đã import sai → kế toán làm bút toán sửa (08-05) | DEC-009, DEC-012, PRM-123, M06 |
| 入金 CSV | Vào | Tải lên file xuất từ phần mềm kế toán; lưu bản gốc ở S3; chặn file trùng bằng SHA-256; ánh xạ mã đối tác → người tham gia; hủy batch do người khác người import, kỳ chưa khóa | Dòng không khớp vào danh sách chờ 照合, không tự đoán | DEC-009, M07, E-02 |
| Email | Ra | Ghi outbox trong cùng transaction nghiệp vụ → worker gửi qua SES; gửi lại tối đa 3 lần; lỗi hẳn → danh sách in ở quầy hôm sau + danh sách "chưa gửi được" cho 照合 | Không SMS / FAX / LINE; đổi địa chỉ email chỉ do nhân viên chợ theo giấy yêu cầu, có lịch sử | BR-NOTIFY-01, PRM-073, L4-A08, M09 |
| Máy in hiện trường | Ra | PDF sinh ở server theo mẫu FORM (取引確認票, 引渡し票, danh sách sắp hết hạn, danh sách email lỗi); PC bàn GD dùng chính sách in thẳng của Chrome / Edge (kiosk printing) | Model máy in, loại giấy chờ khảo sát hiện trường (PRM-095, E-05) — Q-ARCH-05 | PRM-114, PRM-118, M05 |
| Lịch chợ – ngân hàng | Nội bộ | SC-10-05; 支払期日 rơi 休市日 lùi về 営業日 trước; 臨時休市 / 臨時開市 đổi trong ngày, không tính quota | — | M10, FB-CUS-239 |
| Migration (một lần) | Vào | ECS task một lần: nạp master + khoản còn mở + chi tiết 2 năm TC + 2 kỳ thưởng từ file khách → bảng tạm → kiểm → nạp; báo cáo đối chiếu 100% để ký lúc cutover | Không có cột `is_sample`; dữ liệu cũ hơn để ở file khách, chỉ đọc | DEC-005, PRM-125, M01 |
| Ngân hàng | — | **N/A** — chuyển khoản ngân hàng ngoài phạm vi | — | SCOPE-OUT-05 |

## 10. Điểm mở rộng cho Option / 第2期 (không thiết kế chi tiết)

| Điểm mở rộng | Option / 第2期 | Ranh giới chừa sẵn ở 第1期 | Không làm ở 第1期 |
|---|---|---|---|
| Cổng người ngoài | Portal người mua, giao dịch từ xa (SCOPE-OUT-03/04); đăng nhập OTP email (SEC-IAM-02) | Nhóm route riêng `/portal`, realm xác thực riêng, chỉ gọi service công khai của module; bảng người tham gia đã có email | Không có tài khoản người ngoài, không màn hình người ngoài |
| Phân tích / dự báo | 08-06 | Xuất dữ liệu cấu trúc (FR-RPT-03) ra S3; read replica thêm sau nếu cần | Không kho dữ liệu, không mô hình dự báo |
| AI suggestion-only | SCOPE-OUT-06 | Gợi ý (nếu có) nằm ở bảng riêng, không có quyền gọi hàm ghi nghiệp vụ; người xác nhận luôn là người (ADR-010) | Không AI / OCR nào trong 第1期 |
| Tem / quét mã lô | Cải tiến 04-07 | Mã lô duy nhất, in được dạng mã vạch | Không quét mã |
| Màn tham số vận hành | 第2期 (SC-10-06 bị bỏ — PRM-126) | File cấu hình có nhật ký | Không màn hình |

## 11. NFR → cách đáp ứng

| NFR | Cách đáp ứng | Nơi chi tiết |
|---|---|---|
| NFR-AVL-01 99,5% trong 02:00–10:00 | ECS ≥ 2 task / 2 AZ; RDS Multi-AZ (failover ~1–2 phút); không deploy / bảo trì trong 01:00–10:00; alarm health | ADR-001, ADR-009 |
| NFR-AVL-02 mất mạng ngắn | PWA + hàng đợi cục bộ cho 3 thao tác; đường giấy | ADR-008 |
| NFR-AVL-03 RTO 4h / RPO 15' | PITR (log 5 phút); Multi-AZ; bản sao backup sang Osaka + IaC dựng lại; diễn tập khôi phục trước go-live | ADR-009 |
| NFR-PERF-01/02 | Truy vấn luôn có khoảng 業務日 + phân trang + index; thiết kế cho ~77 đồng thời × 2 × 1,5; test tải trước go-live | ADR-009 (M23) |
| NFR-SEC-01 MFA | Step-up trước hành động §3.2; SYS-ADMIN MFA khi đăng nhập; token phần cứng cho người không dùng điện thoại riêng | ADR-002 |
| NFR-SEC-03 | Timeout theo loại máy (PC ~30', tablet ~5'); khóa PIN theo người + theo thiết bị; log bất thường | ADR-002, ADR-008 |
| NFR-SEC-04 | TLS ở CloudFront / ALB / RDS; Secrets Manager; backup mã hóa | ADR-009 |
| NFR-OPS-01 | CloudWatch + SaaS: health, batch, lỗi email, sự kiện bảo mật | §3 |
| NFR-OPS-02 | Đổi quy chế bằng version mới, không sửa lịch sử | ADR-006 |
| DR-RET-01 7 năm | DB online 7 năm, `audit_logs` chia theo năm TC; S3 lifecycle chứng từ 3 năm → lưu lạnh | ADR-009 |
| 09-06 APPI | Mã hóa at-rest / in-transit; quyền đọc theo ma trận; xuất dữ liệu cá nhân có MFA + audit | ADR-002, ADR-003 |

## 12. Prototype LAB-2 → to-be

| Prototype (as-built) | To-be | Giữ / thay | Lệch (as-built §5) | ADR |
|---|---|---|---|---|
| Vercel Hobby + Supabase free | ECS Fargate + RDS PostgreSQL Multi-AZ trên AWS Tokyo | Thay | M14 | ADR-001 |
| Next.js 16 App Router, route handler, zod, `require-role` | Giữ nguyên code app; chạy trong container | Giữ | — | ADR-001 |
| Supabase Auth email + mật khẩu, `auth.users`, `auth.uid()`, `banned_until` | Module `iam` tự quản: bảng tài khoản trong DB, phiên server-side, MFA TOTP, PIN; định danh đưa vào DB bằng `set_config` theo transaction | Thay | D17, D21 | ADR-002 |
| `supabase.rpc()` qua PostgREST | Client SQL có kiểu gọi thẳng hàm DB bằng DB role chỉ có EXECUTE | Thay lớp gọi, giữ hàm | D21 | ADR-001, ADR-003 |
| RLS theo JWT Supabase, mọi nội bộ đọc hết | RLS theo `app.user_id`, ma trận đọc TBL-ROLE-01 | Thay điều kiện | D18, M18 | ADR-003 |
| ~70 hàm `security definer`, `assert_caller`, trigger append-only / ngày mở / đóng băng / audit | Giữ mô hình; sửa nội dung theo bảng lệch | Giữ | D19 (bỏ cờ seeding) | ADR-004 |
| `trade_status` PROVISIONAL / CONFIRMED, chốt thẳng | Trạng thái theo FIG-012, ghi người + thời điểm từng bước | Sửa | D10 | ADR-004 |
| Mọi điều chỉnh qua `correction_requests` | Thêm 当日訂正 / 取消 cùng cơ chế REVERSE / DELTA | Sửa | D11, M17 | ADR-004 |
| `current_business_date()` = ngày OPEN lớn nhất, không job | Job 02:00 + lịch chợ; lô từ 01:00 gắn 業務日 sáng đó | Thay | D22, M10 | ADR-005 |
| Quy chế chỉ có 1 bảng tỷ lệ; quota đếm cả go-live; ngưỡng 300.000 hằng số | 2 bảng tỷ lệ + tham số; quota bỏ go-live; ngưỡng là tham số (tạm 100.000) | Sửa | D01, D06, D07, D09, M13, M15 | ADR-006 |
| Thưởng tính trên số 税込, 1 thuế suất, 期日 ngày 10 cố định, gán tiền theo cửa sổ ngày | Bậc theo 適格金額 税抜, thuế theo suất + 端数調整, 期日 theo quy chế + lịch, bảng phân bổ FIFO, delta âm mang sang tới hết năm TC | Sửa | D02–D05, D23, M08, M21 | ADR-007 |
| PIN online, khóa theo người đích; không offline | PIN offline gắn thiết bị; khóa theo người + thiết bị; hàng đợi 3 thao tác + SC-03-07 | Thay | D17, M03, M04, M22 | ADR-008 |
| Không backup / PITR / giám sát; view quét toàn lịch sử | PITR, Multi-AZ, Osaka, giám sát; truy vấn có khoảng ngày | Thay | D24, M14, M23 | ADR-009 |
| `is_sample`, `seed_demo_*`, `reset_demo_business_data` | Không có ở production; migration thật | Bỏ | D19, D20, M01, M24 | ADR-004 |
| Không có thông báo, CSV kế toán, máy in, đính kèm | Outbox + SES, batch IF-ACC-01, PDF, S3 | Thêm | D16, M05, M06, M09, M11 | §9 |

## 13. Câu hỏi mở phát sinh ở kiến trúc

Các câu đã có (E-01..E-21, OPEN-L4-01..03) không lặp lại; dưới đây là câu mới. Điều phối đưa vào `qa.md` / 確認事項一覧.

| ID | Câu hỏi | Giả định tạm trong thiết kế | Nếu giả định sai | Ai trả lời |
|---|---|---|---|---|
| Q-ARCH-01 | RTO 4h / RPO 15' có áp cho sự cố **cả region Tokyo** không, hay chỉ sự cố trong region? | Có — sao chép backup + log PITR sang Osaka, dựng lại bằng IaC | Không cần → bỏ dòng Osaka, giảm chút phí lưu trữ; cần chạy chờ nóng ở Osaka → tăng phí cloud đáng kể, ngoài TCO hiện tại | IT khách |
| Q-ARCH-02 | Có cần mở lại ngày đã khóa trong trường hợp khóa nhầm không? | Không có chức năng mở khóa; sửa bằng 修正申請 | Cần → thêm luồng mở khóa có 運用部門長 決裁 + MFA + audit, ~0,2–0,3 MM | 運用部門, 照合部門 |
| Q-ARCH-03 | Số người cần token phần cứng (không dùng điện thoại riêng)? Khách mua token? | ~nửa trong 12–13 người có quyền duyệt; khách mua (PRM-088) | Nhiều hơn → chỉ tăng chi phí mua token của khách; không đổi thiết kế | IT khách (E-15) |
| Q-ARCH-04 | Thời gian PIN offline còn hiệu lực trên thiết bị (N giờ) | 12 giờ, trong file cấu hình | Ngắn hơn → người ca đêm phải đăng nhập online lại giữa ca | IT khách (E-18) |
| Q-ARCH-05 | Model máy in, cách nối (USB / mạng) ở bàn GD và bến | In từ PC bàn GD; tablet bến in qua máy in mạng gần nhất | Máy in chỉ nối được với tablet / cần in nhiệt → thêm agent in cục bộ, CR theo CR-10 | 運用部門 (E-05, PRM-095) |
| Q-ARCH-06 | Màn quản trị (SYS-ADMIN, RULE-ADMIN) có giới hạn theo IP mạng chợ được không? | Có, qua WAF | Không → chỉ dựa vào MFA | IT khách |
| Q-ARCH-07 | Chứng từ sau 7 năm xóa hay giữ? Khôi phục lưu lạnh "最大2営業日" hay "2日以内"? | Xóa sau 7 năm theo lifecycle; mục tiêu khôi phục ≤ 1 ngày làm việc (đáp ứng cả hai cách đọc) | Phải giữ lâu hơn → chỉ đổi lifecycle | 照合部門, kiểm toán (DR-RET-01) |
| Q-ARCH-08 | Delta âm còn lại cuối năm TC xử lý thế nào? | Không mang sang năm mới; ra danh sách cho 照合部門 xử lý tay | Khách muốn mang tiếp → đổi Technical Design 完納奨励金 | 照合部門, 財務 |
| Q-ARCH-09 | Mọi nội dung quy chế (kể cả tham số không phải bảng tỷ lệ) đều hiệu lực từ ngày 1 tháng? | Có — một version, một ngày hiệu lực, trùng ranh giới kỳ | Cần đổi tham số giữa tháng → ngày hiệu lực theo từng tham số, phức tạp hơn | 運用部門 |
| Q-ARCH-10 | Khách có IdP doanh nghiệp (vd. Microsoft Entra ID) muốn dùng cho PC văn phòng không? | Không — tài khoản do hệ thống quản lý | Có → SSO cho PC văn phòng là cải tiến tách giá; máy dùng chung vẫn PIN | IT khách |

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu: module, thành phần AWS Tokyo, luồng ngày / kỳ, đường ghi, phân quyền 3 lớp, human-in-the-loop, append-only, khóa ngày / kỳ, quy chế 2 nhánh E-14, hiện trường, tích hợp, điểm mở rộng, NFR, mapping prototype → to-be, Q-ARCH-01..10 | 2026-11-25 | phuongnnm-23344 | |
