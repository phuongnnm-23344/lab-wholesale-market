---
id: ADR-002
title: Xác thực thay Supabase Auth — phiên server-side, MFA step-up, PIN trên máy dùng chung
type: adr
status: proposed
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [ARCH-001, ADR-001, ADR-003, ADR-008, L4-A07, PRM-088, PRM-089, PRM-112, PRM-113, NFR-SEC-01, NFR-SEC-03, SEC-IAM-02, FB-CUS-228, FB-CUS-229, FB-CUS-230, FB-CUS-231]
---

# ADR-002 — Xác thực thay Supabase Auth: phiên server-side, MFA step-up, PIN trên máy dùng chung

| Trạng thái | Ngày | Người quyết | Thay thế |
|---|---|---|---|
| **Proposed** — chờ Gate 1 | 2026-11-25 | PL đề xuất | — |

## 1. Bối cảnh

- Prototype dùng Supabase Auth (email + mật khẩu), `auth.uid()`, `banned_until`; không MFA; đổi người bằng PIN chỉ khi online (as-built D17, D21; M02, M03). Chuyển sang AWS (ADR-001) thì lớp này phải thay.
- NFR-SEC-01: MFA bắt buộc cho quản trị và người có quyền duyệt. Cách hiểu đã đề xuất ở LAB-1 (PRM-113, chờ E-15): người có quyền duyệt làm việc thường bằng mã nhân viên + PIN, MFA **ngay trước** hành động duyệt / xuất dữ liệu nhạy cảm (step-up). Danh sách hành động: PREMISE §3.2.
- Hiện trường: máy dùng chung theo ca, đeo găng, mỗi người một tài khoản, cấm dùng chung login (PRM-089); đổi người trong vài giây bằng PIN 4 số; timeout PC bàn GD ~30', tablet bến ~5' (PRM-112).
- Khách giả lập (FB-CUS-229, 230, 231): MFA hiệu lực 10–15 phút cùng người cùng máy, đổi người là hết; SYS-ADMIN MFA ngay khi đăng nhập; **công ty không cấp điện thoại**, phải có cách nhận mã cho người không muốn dùng điện thoại riêng, để người duyệt khỏi mượn máy người khác.
- Số người cần MFA: ~12–13 (照合部門長, 運用部門長, 配送部門責任者, 代行者, quản trị) (PRM-088, E-15).

## 2. Quyết định

### 2.1 Định danh và phiên

1. Module `iam` tự quản tài khoản trong PostgreSQL (bảng tài khoản thay `auth.users`). Mật khẩu băm argon2id. Không có đăng ký tự do.
2. **Phiên server-side** lưu trong DB (cookie `HttpOnly`, `Secure`, `SameSite=Strict`, id ngẫu nhiên); thu hồi được ngay (dừng tài khoản → xóa phiên). Thay `banned_until` bằng trạng thái tài khoản + lịch sử (FR-IAM-02).
3. **Hai tầng trên máy dùng chung:**
   - *Thiết bị*: máy được đăng ký (device id do SYS-ADMIN cấp), đăng nhập thiết bị một lần đầu ca bằng tài khoản có quyền.
   - *Người dùng*: đổi người bằng mã nhân viên + PIN 4 số; tên người đang dùng hiện trên mọi màn. Timeout theo loại máy (file cấu hình — PRM-126) đưa về màn đổi người, giữ dữ liệu đang nhập.
4. Mỗi transaction ghi DB nhận `app.user_id`, `app.device_id`, `app.mfa_verified_at` qua `set_config(..., true)` — hàm `assert_caller` và RLS đọc từ đây (thay `auth.uid()`).

### 2.2 MFA

5. **Step-up** trước các hành động ở PREMISE §3.2 (duyệt 修正申請, 日次締め, 期ロック, xác nhận giao có tranh chấp, checker / rollback quy chế, đổi tư cách người tham gia, xuất CSV kế toán / dữ liệu cá nhân / 監査ログ, mở khóa PIN người khác).
6. **Hiệu lực: 10 phút**, gắn với bộ (người, thiết bị, phiên). Đổi người bằng PIN, timeout, hay đăng xuất → hết hiệu lực ngay. Chọn mức thấp của khoảng 10–15 phút vì máy dùng chung ở khu đông người. Giá trị nằm trong file cấu hình.
7. Tài khoản SYS-ADMIN: MFA ngay khi đăng nhập, và step-up lại sau 10 phút như trên.
8. **Phương thức (theo thứ tự ưu tiên của người dùng, mỗi người đăng ký ít nhất một):**

| # | Phương thức | Dành cho | Ghi chú |
|---|---|---|---|
| a | App TOTP trên điện thoại riêng | Người **tự nguyện** dùng điện thoại riêng | Không bắt buộc; công ty không cấp điện thoại |
| b | **Token phần cứng TOTP (OATH, dạng móc khóa có màn hình số)** cấp riêng từng người | **Người không dùng điện thoại riêng** (FB-CUS-231) | Khách mua (PRM-088); gắn với đúng một tài khoản lúc cấp; người giữ token như giữ con dấu; dùng được ở cả tablet bến lẫn PC vì chỉ cần gõ 6 số — không cần cổng USB / NFC |
| c | Email OTP tới hộp thư công ty | Dự phòng khi quên token | Chỉ dùng được ở PC văn phòng có mở được hộp thư; không dùng ở bến |

9. **Không mượn máy người khác:** mã chỉ có giá trị cho tài khoản sở hữu phương thức; không có "mã chung" hay mã cho nhóm. Mất token → SYS-ADMIN thu hồi ngay (MFA của người quản trị, có audit), cấp token dự phòng trong tủ khóa của phòng IT; trong lúc chờ, việc duyệt chuyển cho **代行者** (PRM-129) chứ không nới MFA.
10. Lần đăng ký phương thức MFA đầu tiên và lần đổi phương thức: làm tại PC văn phòng, có SYS-ADMIN xác nhận, ghi audit.

### 2.3 Khóa và log

11. Sai PIN 5 lần → khóa 15 phút, đếm **cả theo người lẫn theo thiết bị** (sửa M22); sai mật khẩu / mã MFA nhiều lần → khóa tạm + sự kiện bảo mật gửi giám sát (NFR-SEC-03).
12. Mở khóa / đặt lại PIN ban đêm: 運用部門長 hoặc 配送部門責任者, có MFA (PRM-111, PRM-112).

### 2.4 Người tham gia bên ngoài

13. 第1期 **không có** tài khoản người ngoài (L4-A08). Chính sách SEC-IAM-02 cho 第2期: OTP email mỗi lần đăng nhập, realm riêng (ARCHITECTURE §10). Compliance ghi "đáp ứng một phần".

## 3. Phương án đã cân nhắc

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **A. Module `iam` tự quản trong app + DB (chọn)** | Step-up theo từng hành động, PIN đổi người, gắn thiết bị, token phần cứng — đều là luồng tự viết dù dùng IdP nào; một chỗ audit; định danh vào DB bằng `set_config` đơn giản | Tự chịu trách nhiệm an toàn mật khẩu / phiên → dùng thư viện đã kiểm chứng (argon2, TOTP RFC 6238), review bảo mật, test xâm nhập trước go-live | **Chọn** |
| B. Amazon Cognito | Managed, có TOTP phần mềm | Không có PIN đổi người trên máy dùng chung; step-up theo hành động phải tự làm bằng custom auth flow; token phần cứng TOTP không hỗ trợ sẵn; thêm một nơi giữ định danh phải đồng bộ với bảng vai / quyền duyệt trong DB | Bỏ |
| C. IdP doanh nghiệp của khách (Entra ID…) qua OIDC | SSO cho PC văn phòng | Chưa biết khách có hay không (Q-ARCH-10); không giải quyết máy dùng chung ở bến; phụ thuộc hệ thống ngoài phạm vi | Bỏ ở 第1期; để thành cải tiến tách giá nếu khách có |
| D. SMS OTP | Quen thuộc | Cần điện thoại — đúng chỗ khách không có; BR-NOTIFY-01 đã loại SMS | Bỏ |
| E. Khóa bảo mật FIDO2 / passkey | Chống phishing tốt nhất | Tablet hiện trường chưa chọn (E-05), hỗ trợ USB / NFC trên trình duyệt tablet không chắc; găng tay ướt | Bỏ ở 第1期; xem lại khi chốt thiết bị |
| F. MFA mọi lần đăng nhập cho mọi người duyệt | Đơn giản | Người duyệt cũng làm việc hiện trường, đổi người nhiều lần mỗi ca → chậm bàn GD; khách đã nói hỏi step-up (PREMISE §3.2) | Bỏ, trừ khi E-15 yêu cầu (±0,1–0,2 MM, L4-A07) |

## 4. Hệ quả

**Tích cực**
- Đáp ứng NFR-SEC-01 theo cách hiểu PRM-113 mà không làm chậm bàn GD.
- Người không có điện thoại riêng có phương thức riêng (token) — đóng FB-CUS-231.

**Tiêu cực / rủi ro**
- Khách mua và quản lý token (~12–13 cái + dự phòng); cần thủ tục cấp / thu hồi (Q-ARCH-03).
- Tự viết xác thực → bắt buộc test bảo mật (đã có trong phạm vi SCOPE-06).
- Nếu E-15 trả lời "MFA mọi lần đăng nhập" → đổi luồng đăng nhập, ±0,1–0,2 MM.

**Việc kéo theo**
- Database Design: bảng tài khoản, phiên, thiết bị, phương thức MFA (secret mã hóa), lịch sử khóa.
- Spec SC-00-01 / SC-00-02 (wireframe), các màn duyệt ghi rõ điểm step-up.
- Runbook IT: cấp / thu hồi token, đặt lại MFA.

## 5. Truy vết

NFR-SEC-01, NFR-SEC-03, SEC-IAM-02, FR-IAM-01/02, PRM-088, PRM-089, PRM-111..113, PRM-126, PRM-129, E-15, L4-A07, L4-A08, PREMISE §3.2; as-built D17, D21; M02, M03, M22; FB-CUS-228..231.

---

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu; chốt hiệu lực MFA 10 phút; phương thức token phần cứng cho người không dùng điện thoại riêng (FB-CUS-231) | 2026-11-25 | phuongnnm-23344 | |
