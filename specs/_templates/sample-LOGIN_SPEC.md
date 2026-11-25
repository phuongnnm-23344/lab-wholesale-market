---
id: SPEC-LOGIN-002
title: Màn hình đăng nhập
type: ui
screen_id: LOGIN
feature: authentication
feature_id: AUTH
status: draft
version: "0.1.0"
owner: ***REMOVED***
updated: 2026-09-21
superseded_by:
related: [SPEC-AUTH_LOGIN-001, REQ-2609-01]
---

# LOGIN — Màn hình đăng nhập

> **BẢN MẪU** của [`BM-2-901-51-screen-specification-template.md`](../01-templates/BM-2-901-51-screen-specification-template.md) — điền sẵn dữ liệu thật để biết mức chi tiết cần đạt. Không phải spec của dự án nào; không copy file này, copy khuôn rỗng rồi đối chiếu sang đây.
>
> Thuộc bộ demo feature `authentication` — xem [`README.md`](./README.md) của thư mục này.

> Biểu mẫu: **BM-2-901-51 v2.1** — Screen Specification · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa |
|---|---|---|---|---|---|
| 1 | 0.1.0 | Add New | Khởi tạo từ `REQ-2609-01` FR-AUTH-001 | 2026-09-21 | ***REMOVED*** |

---

## 2. Layout

**Design:** [LOGIN — Desktop 1440](https://figma.com/file/xxxxx?node-id=12%3A340)

**Ảnh bố cục:** `./assets/LOGIN_layout.png`

**Ảnh đánh số item:** `./assets/LOGIN_annotated.png`

*Bản mẫu chưa có ảnh thật nên ghi đường dẫn thay vì nhúng. Spec thật dùng cú pháp nhúng `![...](...)`.*

> - Ảnh thiết kế tạo bằng Figma / Draw.io / Adobe XD. **Không** vẽ màn hình bằng Excel hay Spreadsheet.
> - Ảnh lưu trong `{feature}/assets/`, tên có tiền tố Screen ID, nhúng bằng đường dẫn tương đối.
> - Modal / pop-up / dialog của màn hình này mô tả **ngay trong file này**, không tách file riêng.
>
> *Trong bản mẫu này chưa có ảnh thật — file `assets/` của bộ demo để trống. Spec thật bắt buộc có ảnh annotated khi màn hình từ 3 item trở lên, và số trên ảnh phải khớp ID ở mục 4.1.*

---

## 3. Description

Màn hình đầu tiên của hệ thống quản trị nội bộ. Người dùng đã có tài khoản (do admin tạo) nhập email và mật khẩu để vào hệ thống.

Đăng nhập thành công → chuyển sang **Trang chủ** (`HOME`). Tài khoản bị đánh dấu phải đổi mật khẩu (sau khi admin đặt lại) → chuyển sang **Đổi mật khẩu bắt buộc** (`PWD_CHANGE`) thay vì Trang chủ.

Màn hình này là điểm vào công khai, không yêu cầu đăng nhập trước.

---

## 4. View

**Đánh ID:** section là chữ (`A`, `B`, `C`…), item trong section là số (`1.0`, `2.0`…). Ba bảng dưới đây và mục 5 trỏ tới item bằng `{{section}}-{{số}}` — ví dụ `A-2`.

### 4.1 Danh sách item

| ID | Item Name | Item Type | Required | Note |
|---|---|---|---|---|
| **A** | **Khối thương hiệu** | | | |
| 1.0 | Logo công ty | Image | - | Trang trí, không thao tác |
| 2.0 | Tiêu đề "Hệ thống quản trị nội bộ" | Label | - | |
| **B** | **Khối nhập liệu** | | | |
| 1.0 | Nhãn "Email" | Label | - | |
| 2.0 | Ô nhập email | Text box | Có | Placeholder "Nhập email"; `input type=text` |
| 3.0 | Nhãn "Mật khẩu" | Label | - | |
| 4.0 | Ô nhập mật khẩu | Text box | Có | `input type=password`; có nút hiện/ẩn |
| 5.0 | Nút hiện/ẩn mật khẩu | Button | - | Icon con mắt, nằm trong ô B-4 |
| 6.0 | Vùng hiển thị lỗi chung | Label | - | Ẩn khi không có lỗi; hiện phía trên nút B-7 |
| 7.0 | Nút "Đăng nhập" | Button | - | Disabled khi B-2 hoặc B-4 rỗng |
| **C** | **Khối chân trang** | | | |
| 1.0 | Dòng "Quên mật khẩu? Liên hệ quản trị viên." | Label | - | **Chữ tĩnh, không phải liên kết** — phase 1 chưa có chức năng tự khôi phục |

> - `Item Type`: `Label` · `Image` · `Text box` · `Button`.
> - `Required`: `Có` · `Không` · `-` (item không nhận nhập liệu).

### 4.2 Validation

| ID | Type | Min | Max | Default | Ghi chú |
|---|---|---|---|---|---|
| B-2 | String | 1 | 255 | *(trống)* | Chỉ kiểm tra **rỗng hay không**. Chuẩn hoá `trim` + chữ thường trước khi gửi. Lỗi → `M_01` |
| B-4 | String | 1 | 72 | *(trống)* | Chỉ kiểm tra **rỗng hay không**. Lỗi → `M_01`. `Max 72` là giới hạn cứng của `bcrypt`, **không** sinh thông báo lỗi |

> **Cố ý KHÔNG validate ở màn hình này** (chốt với QA 2026-09-19):
> - **Không** kiểm định dạng email (không dùng `type=email`, không dùng biểu thức chính quy). Lý do bảo mật: kiểm ở client cho biết email nào "hợp lệ", hỗ trợ việc dò tài khoản. Chỉ tra ở máy chủ khi gửi.
> - **Không** kiểm độ dài tối thiểu mật khẩu. Lý do: quy tắc độ mạnh mật khẩu thuộc màn hình đổi mật khẩu; ở đây kiểm thêm chỉ cho kẻ tấn công biết quy tắc.
>
> *Ghi chú cách làm: biểu mẫu BM-2-901-51 quy ước "item không có dòng ở mục 4.2 nghĩa là không validate" — tức thiếu sót và cố ý bỏ trông giống hệt nhau. Bản mẫu này viết hẳn khối trên để phân biệt. Xem `ISS-86`.*

### 4.3 Data Mapping

| ID | Data Source | API ID | API URL | Key / Param | Ghi chú |
|---|---|---|---|---|---|
| B-2 | API | `API-AUTH-001` | `POST /api/v1/auth/login` | `email` | Gửi bản đã `trim` + chữ thường |
| B-4 | API | `API-AUTH-001` | `POST /api/v1/auth/login` | `password` | Gửi nguyên văn, không chuẩn hoá |

> - `Data Source`: `API` · `Cookie` · `Shared Prefs` · `Local DB`.
> - `API ID` / `API URL` tra ở `_common/api-list.md` — **không tự khai API mới trong file spec**. Hợp đồng chi tiết: [`sample-AUTH_LOGIN_API.md`](./sample-AUTH_LOGIN_API.md).

---

## 5. Event

| ID | Given (Pre-condition) | When (Trigger/Action) | Then (Result) | Note |
|---|---|---|---|---|
| **Initializing Process（初期処理）** | | | | |
| - | Người dùng chưa có phiên hợp lệ | Mở màn hình | 1. Hiển thị form trống<br>2. Con trỏ đặt sẵn ở B-2<br>3. B-7 ở trạng thái disabled | |
| - | Người dùng **đã có** phiên hợp lệ | Mở màn hình | Chuyển thẳng sang `HOME`, không hiển thị màn đăng nhập | Điều kiện vào màn hình |
| **Standard Process（通常処理）** | | | | |
| B-2, B-4 | - | Nhập hoặc xoá ký tự | Nếu cả hai khác rỗng → B-7 enabled; ngược lại disabled | |
| B-5 | - | Bấm nút hiện/ẩn | Đổi `type` của B-4 giữa `password` và `text`; đổi icon | Không gửi dữ liệu đi đâu |
| B-7 | Cả B-2 và B-4 khác rỗng | Bấm "Đăng nhập" | 1. Disable B-7 và hiện trạng thái đang xử lý<br>2. Gọi `API-AUTH-001`<br>3. Thành công và **không** phải đổi mật khẩu → sang `HOME`<br>4. Thành công và **phải** đổi mật khẩu → sang `PWD_CHANGE`<br>5. Thất bại → hiện thông báo ở B-6, enable lại B-7 | Chống bấm nhiều lần: B-7 disabled suốt thời gian chờ phản hồi |
| **Error Handling（エラー制御）** | | | | |
| B-6 | Đang gọi API | Máy chủ trả lỗi xác thực (`401`) | Hiện `M_01` tại B-6: "Email hoặc mật khẩu không đúng" | **Dùng chung một thông báo** cho cả ba ca: email không tồn tại · sai mật khẩu · tài khoản đang bị khoá |
| B-6 | Đang gọi API | Máy chủ trả `429` | Hiện `M_18` tại B-6: "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau." | Do giới hạn tần suất theo IP ở cổng, không phải do tài khoản |
| B-6 | Đang gọi API | Mất kết nối hoặc quá thời gian chờ | Hiện `M_21` tại B-6; enable lại B-7 | |
| - | Đang gọi API | Máy chủ trả `5xx` | Chuyển sang trang lỗi chung, kèm mã tham chiếu | |

> - Mã message (`M_01`…) tra ở `_common/error-codes.md` — **không tự chế mã mới trong file spec**. *Ghi chú: file đó hiện chưa tồn tại (`ISS-36`); mã dùng ở đây lấy từ bản chuyển biểu mẫu gốc.*
> - Event áp dụng cho **mọi màn hình** thì viết một lần ở `_common/common-spec.md`, không lặp lại ở đây.

---

## 6. Other Notes

**Tiền đề**

- Tài khoản do admin tạo sẵn; màn hình này không có đường đăng ký.
- Màn hình chỉ truy cập được từ mạng nội bộ hoặc VPN (ràng buộc C1 của [`sample-REQ-2609-01.md`](./sample-REQ-2609-01.md)).

**Quy tắc nghiệp vụ liên quan — không mô tả lại ở đây**

Bốn quy tắc dưới đây chi phối hành vi màn hình nhưng **do máy chủ sở hữu hoàn toàn**. Nơi ở chính thức là [`sample-AD_LOGIN_SPEC.md`](./sample-AD_LOGIN_SPEC.md) mục Page-level Assumptions — ở đây chỉ nêu tên để người đọc biết mà tra:

| Mã | Tên | Ảnh hưởng tới màn hình |
|---|---|---|
| A1 | Khoá tài khoản sau 5 lần sai | Màn hình **không** đếm, **không** biết tài khoản bị khoá — chỉ hiện `M_01` như ca sai mật khẩu |
| A2 | Giới hạn tần suất theo IP | Sinh ca `429` → `M_18` |
| A3 | Không tiết lộ tài khoản nào tồn tại | Là lý do ba ca lỗi dùng chung `M_01` |
| A5 | Phiên đăng nhập 8 giờ | Token đặt ở cookie `HttpOnly`; màn hình **không** đọc và **không** lưu token ở `localStorage` |

**Ranh giới**

- Màn hình **không** tự phán đoán nguyên nhân lỗi — chỉ hiển thị theo mã máy chủ trả về.
- Thông báo lỗi ở B-6 **không** được phân biệt email sai với mật khẩu sai, kể cả khi máy chủ trả chi tiết hơn trong tương lai.

**Câu hỏi mở / TBD**

| # | Câu hỏi | Ảnh hưởng tới | Người trả lời | Hạn | Trạng thái |
|---|---|---|---|---|---|
| Q1 | Dòng C-1 hiện là chữ tĩnh. Khi phase 2 có chức năng tự khôi phục mật khẩu thì đổi thành liên kết — cần spec mới hay chỉ tăng MINOR ở spec này? | C-1 | BrSE | 30/09/2026 | open |
| Q2 | Có cần nhớ email đã nhập lần trước (ô "ghi nhớ đăng nhập") không? Tài liệu yêu cầu không nhắc. | B-2 | PO | 30/09/2026 | open |

> *Biểu mẫu BM-2-901-51 **không có** mục "Câu hỏi mở / TBD" — bản mẫu này tự thêm vào mục 6, vì luật của dự án là "không còn dòng `open` mới được chuyển `approved`". Xem `ISS-85`.*
