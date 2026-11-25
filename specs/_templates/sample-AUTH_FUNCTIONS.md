---
id: SPEC-AUTH_FUNC-001
title: Function Specifications — Auth Service
type: system
subtype: function-specifications
status: draft
version: "0.1.0"
owner: ***REMOVED***
updated: 2026-09-21
language: vi
form_source: "BM-2-901-54 v01 — Sun* Function Specifications (07/07/2021)"
feature: authentication
superseded_by:
related: [SPEC-AUTH_DTL-001]
---

# AuthService — Function Specifications

> **BẢN MẪU** của [`BM-2-901-54-function-specifications-template.md`](../01-templates/BM-2-901-54-function-specifications-template.md) — điền sẵn dữ liệu thật để biết mức chi tiết cần đạt. Không phải tài liệu của dự án nào; không copy file này, copy khuôn rỗng rồi đối chiếu sang đây.
>
> ⚠️ **Dự án CHƯA chốt có dùng biểu mẫu này hay không — xem `ISS-38`.** Bản mẫu dựng ra để có dữ liệu thật mà cân nhắc, không phải để khuyến khích dùng. Nhận xét sau khi điền nằm ở cuối file.
>
> Thuộc bộ demo feature `authentication` — xem [`README.md`](./README.md) của thư mục này.

| | |
|---|---|
| Module / file | `src/services/auth.service.ts` |
| Ngôn ngữ / framework | TypeScript / NestJS |

---

## 1. Lịch sử sửa đổi

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor |
|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | login | Add login specification | 2026-09-21 | ***REMOVED*** |
| 2 | Ver 0.1 | Add New | incrementFailCount | Add fail counter specification | 2026-09-21 | ***REMOVED*** |

---

## 2. Đặc tả function

### 2.1. `login`

| Return type | Function name |
|---|---|
| `Promise<LoginResult>` | `login` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `string` | `email` | Email do người dùng nhập; hàm tự chuẩn hoá bên trong, không tin bản đã chuẩn hoá của client |
| `string` | `password` | Mật khẩu dạng nguyên văn; chỉ tồn tại trong bộ nhớ, không ghi log, không lưu |
| `string` | `ipAddress` | Địa chỉ IP của request, dùng để ghi nhật ký truy cập |

**Function description**

> - Chuẩn hoá `email` rồi tra bảng `users`.
> - Trả về `LoginResult` gồm `redirectTo` và thông tin người dùng khi xác thực thành công.
> - Ba ca thất bại (không tìm thấy · đang bị khoá · sai mật khẩu) đều **ném cùng một exception** `AuthFailedException` — quy tắc A3.
> - Mọi nhánh đều ghi một dòng `audit_logs` trước khi trả về hoặc ném lỗi.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `normalizedEmail` | Bản `email` đã `trim` + chữ thường; dùng để tra CSDL **và** để dựng key Valkey — hai chỗ phải dùng cùng một giá trị, nếu không quy tắc A1 bị vô hiệu |
| `User \| null` | `user` | Bản ghi tài khoản; `null` nghĩa là email không tồn tại, khi đó phải chạy băm giả để giữ thời gian phản hồi đồng đều |
| `boolean` | `isMatch` | Kết quả so khớp bcrypt; quyết định đi nhánh phát hành phiên hay nhánh tăng bộ đếm |

### 2.2. `incrementFailCount`

| Return type | Function name |
|---|---|
| `Promise<void>` | `incrementFailCount` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `string` | `normalizedEmail` | Đã chuẩn hoá sẵn bởi hàm gọi; hàm này **không** tự chuẩn hoá lại |

**Function description**

> - Tăng bộ đếm số lần đăng nhập sai trên Valkey, đặt TTL 15 phút ở lần đầu.
> - Đủ 5 lần thì chuyển `users.status` sang `'locked'` và phát sự kiện cảnh báo.
> - **Nuốt lỗi Valkey có chủ ý:** Valkey hỏng thì ghi log mức ERROR và trả về bình thường, không ném lỗi ngược lên — để sự cố hạ tầng không làm hỏng luồng đăng nhập.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `number` | `currentCount` | Giá trị đếm sau khi tăng; so với ngưỡng 5 để quyết định có khoá tài khoản hay không |

---

<!--
  NHẬN XÉT SAU KHI ĐIỀN THỬ — dữ liệu cho `ISS-38`, xoá khối này khi đã chốt.

  Điền xong hai hàm thì thấy rõ ba điều:

  1. TRÙNG LẶP VỚI BM-2-901-53. Toàn bộ nội dung nghiệp vụ ở file này đã có trong
     `sample-AUTH_LOGIN_DETAIL.md` mục 4, mô tả theo BƯỚC thay vì theo HÀM, và đầy đủ
     hơn (có bảng Error với status code, có thứ tự xử lý). File này chỉ thêm được tên
     hàm và tên biến.

  2. BIỂU MẪU KHÔNG CÓ Ô CHO THỨ QUAN TRỌNG NHẤT. Ba điểm đáng ghi nhất khi điền lại
     phải nhét vào `Function description` dạng văn xuôi vì không có cột riêng:
     - exception mà hàm ném ra (`AuthFailedException`)
     - tác dụng phụ (ghi `audit_logs`, ghi Valkey, phát sự kiện)
     - việc `incrementFailCount` CỐ Ý nuốt lỗi Valkey
     Đây đều là thứ người đọc code không suy ra ngay được — tức là phần đáng tài liệu
     hoá nhất, lại là phần biểu mẫu không hỏi.

  3. SẼ LỆCH CODE NGAY LẦN ĐỔI TÊN BIẾN ĐẦU TIÊN. Cột `Variable` đặc tả biến cục bộ.
     Đổi `isMatch` thành `passwordMatches` là tài liệu sai, mà không có gì bắt ai sửa.

  → Đề xuất cho `ISS-38`: KHÔNG dùng biểu mẫu này. `BM-2-901-53` đã phủ phần nghiệp vụ;
    phần chữ ký hàm để code và docstring tự mang. Nếu vẫn dùng thì tối thiểu phải bổ sung
    ba cột: Exception · Tác dụng phụ · Hàm gọi tới.
-->
