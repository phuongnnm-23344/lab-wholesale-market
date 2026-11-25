---
id: REQ-2609-01
title: Quản lý tài khoản và đăng nhập hệ thống quản trị
type: requirement
project: Hệ thống quản trị nội bộ
project_code: ADM
source: "bien-ban-hop-260901.pdf"
received_date: 2026-09-01
status: in-review
version: "0.2.0"
owner: ***REMOVED***
updated: 2026-09-21
superseded_by:
related: [SPEC-LOGIN-001, SPEC-AUTH_LOGIN-001]
---

# REQ-2609-01 — Quản lý tài khoản và đăng nhập hệ thống quản trị

> **BẢN MẪU** của [`requirement-document-template.md`](../01-templates/requirement-document-template.md) — điền sẵn dữ liệu thật để biết mức chi tiết cần đạt. Không phải tài liệu của dự án nào; không copy file này, copy khuôn rỗng rồi đối chiếu sang đây.
>
> Thuộc bộ demo feature `authentication` — xem [`README.md`](./README.md) của thư mục này.

> Requirement Document · **chưa cấp mã biểu mẫu ISO** — xem `ISS-42`

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa |
|---|---|---|---|---|---|
| 1 | 0.1.0 | Add New | Khởi tạo từ biên bản họp 2026-09-01 | 2026-09-01 | ***REMOVED*** |
| 2 | 0.2.0 | Updated | Bổ sung FR-AUTH-004 (nhật ký truy cập) sau buổi rà soát bảo mật 2026-09-18; làm rõ ngưỡng khoá tài khoản ở FR-AUTH-002 theo trả lời Q1 | 2026-09-21 | ***REMOVED*** |

---

## 2. Tổng quan

### 2.1 Nguồn tài liệu

| Tài liệu gốc | Bên cung cấp | Ngày nhận | Link / vị trí lưu |
|---|---|---|---|
| `bien-ban-hop-260901.pdf` | Phòng CNTT khách hàng | 01/09/2026 | Đính kèm ở Issue #42 |
| Rà soát bảo mật nội bộ (miệng, buổi họp 18/09) | Đội bảo mật phía mình | 18/09/2026 | Ghi chú trong Issue #42, comment ngày 18/09 |

> Phần **FR-AUTH-004** và toàn bộ mục 5 là **do dự án tự đề xuất**, không có trong tài liệu gốc của khách hàng. Đã trình bày ở buổi họp 18/09 và được chấp thuận bằng miệng; đang chờ xác nhận bằng văn bản (xem mục 8, Q2).

### 2.2 Bối cảnh & Mục đích

* Hệ thống quản trị nội bộ hiện dùng chung một tài khoản cho cả phòng, không truy được ai đã thao tác gì. Kiểm toán nội bộ tháng 8 đã nêu đây là phát hiện mức cao.
* Cần mỗi nhân viên một tài khoản riêng, có nhật ký truy cập, và có cơ chế chặn dò mật khẩu.
* Quy mô: khoảng 200 người dùng nội bộ, không mở ra ngoài internet công cộng ở giai đoạn này.

### 2.3 Phạm vi

**Trong phạm vi (In-Scope)**

* Đăng nhập bằng email và mật khẩu.
* Chặn dò mật khẩu: khoá tài khoản khi sai nhiều lần, giới hạn tần suất theo IP.
* Admin đặt lại mật khẩu cho người dùng.
* Ghi nhật ký truy cập phục vụ kiểm toán.

**Ngoài phạm vi (Out-of-Scope)**

* **Đăng ký tài khoản tự phục vụ** — tài khoản do admin tạo, vì đây là hệ thống nội bộ và danh sách nhân sự lấy từ phòng nhân sự. Không làm ở phase nào.
* **Người dùng tự khôi phục mật khẩu qua email** — hoãn sang phase 2. Khách hàng chấp nhận vì phase 1 đã có đường admin đặt lại. *Lưu ý: quyết định này tạo ràng buộc cho FR-AUTH-002, xem mục 8 Q1.*
* **Xác thực hai lớp (2FA)** — hoãn sang phase 2, khách hàng đánh giá chưa cần với hệ thống không mở ra internet.
* **Phân quyền theo vai trò** — thuộc yêu cầu riêng `REQ-2610-xx`, chưa viết.
* **Đăng nhập một lần (SSO) với hệ thống nhân sự** — khách hàng đã bỏ tại buổi họp 01/09 vì hệ thống nhân sự không có sẵn đầu nối.

---

## 3. Đối tượng sử dụng & vai trò

| Vai trò | Mô tả đối tượng | Quyền hạn / Mục tiêu chính |
|---|---|---|
| Nhân viên | Người dùng hệ thống quản trị hằng ngày, khoảng 195 người | Đăng nhập để làm việc; tự đổi mật khẩu của mình |
| Admin | Nhân sự phòng CNTT, khoảng 5 người | Tạo tài khoản, đặt lại mật khẩu, giải khoá tài khoản, xem nhật ký truy cập |
| Kiểm toán viên | Kiểm toán nội bộ, truy cập theo đợt | Chỉ đọc nhật ký truy cập, không thao tác dữ liệu |

---

## 4. Yêu cầu chức năng (FR)

> Mã yêu cầu: `FR-{MÔ_ĐUN}-{số thứ tự}` — viết HOA, số thứ tự 3 chữ số.

### 4.1 Mô-đun Authentication

#### FR-AUTH-001: Đăng nhập bằng email và mật khẩu

| | |
|---|---|
| **Mô tả** | Người dùng đã có tài khoản đăng nhập vào hệ thống bằng email và mật khẩu. |
| **Tiêu chí chấp nhận** | 1. Nhập đúng email và mật khẩu → đăng nhập thành công, chuyển về Trang chủ.<br>2. Nhập sai → hiện thông báo lỗi **không cho biết sai email hay sai mật khẩu**.<br>3. Email không phân biệt hoa thường: `A@x.com` và `a@x.com` là cùng một tài khoản.<br>4. Phiên đăng nhập hết hạn sau 8 giờ, không tự gia hạn. |
| **Độ ưu tiên** | High |
| **Vai trò liên quan** | Nhân viên, Admin, Kiểm toán viên |
| **Spec liên quan** | [`sample-LOGIN_SPEC.md`](./sample-LOGIN_SPEC.md) |

#### FR-AUTH-002: Khoá tài khoản khi đăng nhập sai nhiều lần

| | |
|---|---|
| **Mô tả** | Hệ thống tạm khoá tài khoản khi số lần đăng nhập sai liên tiếp vượt ngưỡng, nhằm chặn dò mật khẩu. |
| **Tiêu chí chấp nhận** | 1. Sai **5 lần** trong vòng **15 phút** → tài khoản chuyển trạng thái bị khoá.<br>2. Đang bị khoá thì nhập đúng mật khẩu cũng bị từ chối.<br>3. Sau **30 phút** hệ thống tự giải khoá, người dùng đăng nhập lại được.<br>4. Đăng nhập thành công làm bộ đếm về 0.<br>5. Thông báo khi bị khoá **giống hệt** thông báo sai mật khẩu (theo FR-AUTH-001 tiêu chí 2). |
| **Độ ưu tiên** | High |
| **Vai trò liên quan** | Nhân viên, Admin |
| **Spec liên quan** | [`sample-AD_LOGIN_SPEC.md`](./sample-AD_LOGIN_SPEC.md) mục Page-level Assumptions (A1) |

#### FR-AUTH-003: Admin đặt lại mật khẩu

| | |
|---|---|
| **Mô tả** | Admin đặt lại mật khẩu cho một người dùng; thao tác này đồng thời giải khoá tài khoản nếu đang bị khoá. |
| **Tiêu chí chấp nhận** | 1. Admin chọn một tài khoản và đặt mật khẩu mới.<br>2. Tài khoản đang bị khoá → chuyển về trạng thái hoạt động ngay.<br>3. Bộ đếm số lần sai về 0.<br>4. Người dùng bắt buộc đổi mật khẩu ở lần đăng nhập kế tiếp.<br>5. Thao tác được ghi vào nhật ký truy cập kèm tên admin thực hiện. |
| **Độ ưu tiên** | High |
| **Vai trò liên quan** | Admin |
| **Spec liên quan** | *chưa viết spec — xem mục 7* |

#### FR-AUTH-004: Ghi nhật ký truy cập

| | |
|---|---|
| **Mô tả** | Hệ thống ghi lại mọi lần đăng nhập và thao tác quản trị tài khoản, phục vụ kiểm toán nội bộ. |
| **Tiêu chí chấp nhận** | 1. Ghi đủ: thời điểm, email, địa chỉ IP, kết quả (thành công / sai mật khẩu / bị khoá).<br>2. **Không** ghi mật khẩu và **không** ghi token dưới bất kỳ dạng nào.<br>3. Nhật ký giữ tối thiểu **90 ngày**.<br>4. Kiểm toán viên xem và lọc được theo người dùng và theo khoảng thời gian.<br>5. Nhật ký chỉ đọc — không vai trò nào sửa hoặc xoá được qua giao diện. |
| **Độ ưu tiên** | Medium |
| **Vai trò liên quan** | Kiểm toán viên, Admin |
| **Spec liên quan** | *chưa có — nội dung bảo mật & phân quyền thuộc tài liệu System Design, đã xoá 2026-09-28 (`ISS-89`)* |

---

## 5. Yêu cầu phi chức năng (NFR)

| Mã | Nhóm | Yêu cầu | Ngưỡng số | Cách đo | Chủ sở hữu |
|---|---|---|---|---|---|
| NFR-PERF-01 | Hiệu năng | Thời gian phản hồi của thao tác đăng nhập | p95 ≤ 500 ms với 50 request/giây | k6 trên staging, chạy trước mỗi lần phát hành | Tech Lead |
| NFR-SEC-01 | Bảo mật | Mật khẩu lưu dưới dạng băm, không lưu dạng đọc được | `bcrypt` cost ≥ 12 | Rà soát khi review PR + quét mã nguồn tự động | Tech Lead |
| NFR-SEC-02 | Bảo mật | Không suy ra được email nào đã đăng ký qua thông báo lỗi hoặc thời gian phản hồi | Chênh lệch thời gian phản hồi p50 giữa hai ca ≤ 50 ms | Bộ kiểm thử bảo mật riêng | BE |
| NFR-AVAIL-01 | Khả dụng | Hệ thống hoạt động trong giờ làm việc | 99,5% trong khung 07:00–19:00 các ngày làm việc | Giám sát tự động, báo cáo hàng tháng | DevOps |
| NFR-COMP-01 | Tuân thủ | Nhật ký truy cập đáp ứng yêu cầu kiểm toán nội bộ | Giữ 90 ngày, chỉ đọc, xuất được ra tệp | Đợt kiểm toán nội bộ quý | Trưởng dự án |

---

## 6. Ràng buộc & Giả định

### 6.1 Ràng buộc (Constraints)

| # | Ràng buộc | Nguồn |
|---|---|---|
| C1 | Hệ thống chỉ truy cập được từ mạng nội bộ và VPN của công ty, không mở ra internet công cộng | Khách hàng |
| C2 | Dùng hạ tầng sẵn có: PostgreSQL và Valkey; không bổ sung thành phần hạ tầng mới ở phase 1 | Khách hàng — phòng CNTT |
| C3 | Không dùng dịch vụ xác thực của bên thứ ba (dữ liệu nhân sự không được ra ngoài) | Khách hàng — phòng pháp chế |
| C4 | Giao diện tiếng Việt, không cần đa ngôn ngữ ở phase 1 | Khách hàng |

### 6.2 Giả định (Assumptions)

| # | Giả định | Ai xác nhận | Rủi ro nếu sai |
|---|---|---|---|
| A1 | Danh sách nhân sự và email do phòng nhân sự cung cấp, đã chuẩn hoá và không trùng | Phòng nhân sự khách hàng | Không tạo được tài khoản ban đầu; phải thêm bước làm sạch dữ liệu, trễ mốc bàn giao |
| A2 | Mail Gateway nội bộ hoạt động ổn định để gửi thư cảnh báo | Phòng CNTT khách hàng | Người dùng không nhận được cảnh báo khi tài khoản bị khoá; **không** ảnh hưởng chức năng đăng nhập (thiết kế đã tách khỏi luồng đồng bộ) |
| A3 | Người dùng truy cập từ dải IP nội bộ, nên giới hạn tần suất theo IP không chặn nhầm người dùng thật | Phòng CNTT khách hàng | Nhiều người sau cùng một NAT sẽ bị chặn nhầm — phải nâng ngưỡng hoặc bỏ giới hạn theo IP |
| A4 | 200 người dùng là con số ổn định trong 12 tháng tới | Khách hàng | Ngưỡng hiệu năng NFR-PERF-01 tính sai; phải đo lại |

---

## 7. Đối chiếu yêu cầu → spec

| Mã FR | Trạng thái | Spec đã viết | Ghi chú |
|---|---|---|---|
| FR-AUTH-001 | đã có spec | [`sample-LOGIN_SPEC.md`](./sample-LOGIN_SPEC.md) | |
| FR-AUTH-002 | đã có spec | [`sample-AD_LOGIN_SPEC.md`](./sample-AD_LOGIN_SPEC.md) mục Page-level Assumptions (A1) | |
| FR-AUTH-003 | **đang viết** | — | Màn hình quản trị người dùng chưa có spec. **Đây là đường phục hồi duy nhất của FR-AUTH-002**, xem Q1 |
| FR-AUTH-004 | **planned** | — | Chờ xác nhận bằng văn bản của khách hàng (Q2) trước khi viết spec |

---

## 8. Q&A

| # | Câu hỏi | Câu trả lời | Ai trả lời | Hạn | Trạng thái |
|---|---|---|---|---|---|
| Q1 | Phase 1 không có chức năng người dùng tự khôi phục mật khẩu. Vậy người bị khoá tài khoản ngoài giờ hành chính (không gọi được admin) phải chờ hết 30 phút — khách hàng chấp nhận chứ? | Chấp nhận. Khoá 30 phút tự giải là đủ; không đưa khôi phục mật khẩu vào phase 1. | Trưởng phòng CNTT khách hàng | 15/09/2026 | closed |
| Q2 | FR-AUTH-004 và mục 5 là do dự án tự đề xuất, mới được chấp thuận bằng miệng ở buổi họp 18/09. Cần xác nhận bằng văn bản trước khi tính vào phạm vi hợp đồng. | | Trưởng phòng CNTT khách hàng | 30/09/2026 | open |
| Q3 | Giả định A3 (người dùng đi từ dải IP nội bộ) chưa được phòng CNTT xác nhận. Nếu cả toà nhà đi chung một IP thì ngưỡng 20 request/15 phút sẽ chặn nhầm. | | Phòng CNTT khách hàng | 30/09/2026 | open |

> Không còn dòng `open` thì tài liệu mới được chuyển `in-review` → `approved`. Bản mẫu này cố ý giữ 2 dòng `open` để minh hoạ trạng thái `in-review` thật.
