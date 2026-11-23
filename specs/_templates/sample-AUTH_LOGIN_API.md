---
id: SPEC-AUTH_API-001
title: API đăng nhập
type: system
subtype: api-design
api_id: API-AUTH-001
endpoint: /api/v1/auth/login
method: POST
media_type: application/json
feature: authentication
screen_id: [LOGIN]
status: draft
version: "0.1.0"
owner: ***REMOVED***
updated: 2026-09-21
superseded_by:
related: [SPEC-AUTH_LOGIN-001, SPEC-LOGIN-002]
---

# API-AUTH-001 — POST /api/v1/auth/login

> **BẢN MẪU** của [`BM-2-901-52-api-design-template.md`](./BM-2-901-52-api-design-template.md) — điền sẵn dữ liệu thật để biết mức chi tiết cần đạt. Không phải tài liệu của dự án nào; không copy file này, copy khuôn rỗng rồi đối chiếu sang đây.
>
> Thuộc bộ demo feature `authentication` — tài liệu yêu cầu cùng bộ: [`sample-REQ-2609-01.md`](../../requirements/_templates/sample-REQ-2609-01.md).

> Biểu mẫu: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa |
|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Khởi tạo từ `REQ-2609-01` FR-AUTH-001 | 2026-09-21 | ***REMOVED*** |

---

## 2. 内容 / Description

Xác thực nhân viên bằng email và mật khẩu, phát hành phiên đăng nhập. Được gọi từ màn hình `LOGIN` khi người dùng bấm nút Đăng nhập. Thành công thì đặt cookie phiên và trả về đích điều hướng; thất bại thì trả một mã lỗi duy nhất cho mọi nguyên nhân xác thực.

Đây là điểm vào công khai duy nhất của hệ thống — mọi endpoint khác đều yêu cầu phiên do endpoint này phát hành.

**Xác thực:** Public — endpoint này **không** yêu cầu token hay cookie ở request vào.

---

## 3. Request Params

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Body Parameters | `email` | string | `nhanvien@congty.vn` | Email đăng nhập. Client **phải** gửi bản đã `trim` + chữ thường (quy tắc A4). Máy chủ chuẩn hoá lại lần nữa, không tin client. Tối đa 255 ký tự | |
| 2 | Body Parameters | `password` | string | `MatKhau@2026` | Mật khẩu dạng nguyên văn, **không** băm ở client. Tối đa 72 byte (giới hạn cứng của bcrypt); dài hơn thì máy chủ cắt và vẫn xử lý bình thường | |

> - `Param Type`: `Header Parameters` · `Path Parameters` · `Query Parameters` · `Form Parameters` · `Body Parameters` — tra ở `_common/api-conventions.md`.
> - `Values` chứa **một giá trị ví dụ**, không phải tập giá trị cho phép.
> - **Mọi param mặc định là bắt buộc.** Param không bắt buộc phải ghi `[optional]` ở cột `Note`.
> - **Không dán mật khẩu hay token thật vào cột `Values`**, kể cả giá trị đã hết hạn.

---

## 4. Responses

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | Đăng nhập thành công | <pre>{<br>  "redirect_to": "/home",<br>  "user": {<br>    "id": 12,<br>    "full_name": "Nguyễn Văn A"<br>  }<br>}</pre> | Đặt header `Set-Cookie: sid=<...>; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`. `redirect_to` = `/home`, hoặc `/password/change` khi `must_change_password = true`. **Không** trả token trong thân phản hồi |
| 2 | 400 | Thiếu tham số hoặc sai kiểu | <pre>{<br>  "errors": [<br>    {<br>      "error_code": "M_02",<br>      "error_description": "Trường bắt buộc",<br>      "error_extra": { "email": "Không được để trống" }<br>    }<br>  ]<br>}</pre> | Chỉ dành cho lỗi hình thức của request. **Không** dùng cho sai thông tin đăng nhập |
| 3 | 401 | Xác thực thất bại | <pre>{<br>  "errors": [<br>    {<br>      "error_code": "M_01",<br>      "error_description": "Email hoặc mật khẩu không đúng"<br>    }<br>  ]<br>}</pre> | **Dùng chung cho cả ba ca**: email không tồn tại · sai mật khẩu · tài khoản đang bị khoá. Xem ghi chú ở mục 5 |
| 4 | 429 | Vượt giới hạn tần suất | <pre>{<br>  "errors": [<br>    {<br>      "error_code": "M_18",<br>      "error_description": "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau."<br>    }<br>  ]<br>}</pre> | Do API Gateway trả, **không** phải ứng dụng. Kèm header `Retry-After` (giây) |
| 5 | 500 | Lỗi máy chủ | <pre>{<br>  "errors": [<br>    {<br>      "error_code": "M_99",<br>      "error_description": "Lỗi hệ thống"<br>    }<br>  ]<br>}</pre> | Kèm mã tham chiếu trong log để truy |

> - **Không có dòng `403`** — endpoint này không kiểm quyền, mọi người đều được gọi. Đây là "đã cân nhắc, không áp dụng", không phải thiếu.
> - Mã lỗi tra ở `_common/error-codes.md` — **không tự khai mã mới ở đây**. *Ghi chú: file đó hiện chưa tồn tại (`ISS-36`).*
> - Mã trạng thái lấy trong bảng ở `_common/api-conventions.md`.

---

## 5. Other Notes

- **Vì sao một mã lỗi cho ba ca khác nhau (`401` / `M_01`):** để không suy ra được email nào đã đăng ký. Đây là quy tắc A3 ở `sample-AD_LOGIN_SPEC.md` mục Page-level Assumptions, **không phải** mô tả sơ sài. Đề nghị tách thành `M_01a` / `M_01b` để tiện gỡ lỗi sẽ phá quy tắc này.

- **Thời gian phản hồi phải đồng đều giữa các ca lỗi.** Khi email không tồn tại, máy chủ vẫn chạy một phép băm giả trước khi trả `401`. Nếu bỏ bước này, thời gian phản hồi sẽ tiết lộ email nào có thật. Ngưỡng: chênh lệch p50 ≤ 50 ms (`NFR-SEC-02`).

- **Endpoint này không tự giới hạn tần suất.** Việc đó ở API Gateway (quy tắc A2). Request bị Gateway chặn **không** đi tới ứng dụng và **không** làm tăng bộ đếm khoá tài khoản.

- **Tác dụng phụ khi gọi:** ghi một dòng vào `audit_logs` cho **mọi** lần gọi, kể cả thất bại. Xem [`sample-AUTH_DATABASE.md`](./sample-AUTH_DATABASE.md) mục 4.2.

- **Câu hỏi mở / TBD:**

| # | Câu hỏi | Ai trả lời | Hạn | Trạng thái |
|---|---|---|---|---|
| Q1 | Header `Retry-After` ở ca `429` do Gateway sinh — giá trị cụ thể bao nhiêu chưa chốt với DevOps | DevOps | 30/09/2026 | open |
| Q2 | Có cần endpoint `POST /api/v1/auth/logout` trong cùng phase không? Tài liệu yêu cầu không nhắc nhưng `audit_logs.action` đã dành sẵn giá trị `logout` | BrSE | 30/09/2026 | open |
