---
id: SPEC-API_CONV-001
title: Quy ước chung của API (Common Conventions · Status code · Appendix)
type: system
subtype: api-conventions
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
design_id: API_CONV
feature: _common
related: ["BM-2-901-52", "SPEC-ERROR_CODES-001", "SPEC-API_LIST-001", "ADR-002", "ADR-005", "ADR-008"]
---

# Quy ước chung của API

> Nội dung tương ứng các sheet `Common Conventions`, `Status code`, `Appendix` của biểu mẫu ISO **BM-2-901-52**. Khuôn [BM-2-901-52](../_templates/BM-2-901-52-api-design-template.md) trỏ về file này (ISS-36: ba file `_common/` của API Design chưa có ở repo chuẩn — dự án viết bản của mình). Áp cho **mọi** file trong [`system-design/api-design/`](../system-design/api-design/_index.md).
>
> Danh mục API: [`api-list.md`](api-list.md) · mã lỗi: [`error-codes.md`](error-codes.md).

---

## 1. Lịch sử sửa đổi

| No. | Version | Action | Thay đổi | Ngày | Người sửa | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu khi gộp P3: chốt URL `/api/v1`, body lỗi `{ "error": {…} }` theo prototype, 422 cho mọi lỗi nhập, MFA step-up + token dùng một lần, khóa lạc quan, idempotency, 423 ngày đã khóa | 2026-11-25 | phuongnnm-23344 | LAB-4 P3 gộp 3 luồng |

---

## 2. Quy ước chung (Common Conventions)

Số thứ tự giữ đúng cách khuôn BM-2-901-52 gọi ("quy ước chung số 0, 1, 3").

| No. | Quy ước | Nội dung |
|---|---|---|
| 0 | Một request — một ca response | Mỗi request trả **đúng một** dòng ở mục 4 của file API. Lỗi đầu tiên gặp theo thứ tự kiểm ở mục 5 của file API thì dừng. |
| 1 | Param bắt buộc mặc định | Mọi param bắt buộc; param không bắt buộc ghi `[optional]` ở cột `Note`. |
| 2 | URL và version | `/api/v1/{tài nguyên}` — tài nguyên danh từ số nhiều, kebab-case (`/api/v1/delivery-exceptions`); path param camelCase trong ngoặc nhọn (`{participantId}`). Hành động không phải CRUD là danh từ con (`/close`, `/confirm`, `/transitions`). Route handler Next.js ở `src/app/api/v1/**/route.ts`. Đổi hợp đồng không tương thích → mở `/api/v2/…` song song, giữ `v1` tới khi client cuối cùng chuyển. Prototype LAB-2 dùng `/api/...` không version — chỉ còn trong bảng lệch `MKT_DB.md` (as-is). |
| 3 | Body lỗi | `{ "error": { "code", "message", "field"?, "detail"?, "traceId"? } }` — chi tiết ở mục 3.2. **Khác** ví dụ `errors[]` trong khuôn: dự án giữ format của prototype (`prototype/src/lib/http/api-error-response.ts`) để code LAB-2 dùng lại được; mỗi response chỉ có một lỗi (quy ước 0). |
| 4 | Tên khóa JSON | camelCase cho mọi khóa request / response (`expectedInputHash`, `buyerNo`). Cột DB snake_case — route handler ánh xạ. Giá trị enum viết HOA theo DB (`APPROVED`, `NAKAOROSHI`). |
| 5 | Kiểu giá trị | Tiền: `Integer` yên, chưa thuế trừ khi tên trường có `Incl`. Ngày 業務日: `YYYY-MM-DD`. Thời điểm: ISO-8601 có múi giờ `+09:00`. ID: UUID v4 dạng chuỗi. Số lượng kg: `number` 1 chữ số thập phân; 箱 / 尾: `Integer`. |
| 6 | Xác thực | Cookie phiên server-side `sid` (HttpOnly, Secure, SameSite=Lax — ADR-002). Mọi request ghi (POST / PUT / PATCH / DELETE) kèm header `X-CSRF-Token`. Thiết bị dùng chung gửi `X-Device-Id` khi API cần biết máy (sync, offline). |
| 7 | MFA | Mục 4. |
| 8 | Khóa lạc quan / đồng thời | Mục 5. |
| 9 | Idempotency | Mục 6. |
| 10 | Ngày / kỳ đã khóa | Mục 7 — trả 423, không có API mở lại. |
| 11 | Ngôn ngữ thông điệp | `message` tiếng Nhật, hiện thẳng cho người dùng; không chứa SQL, stack trace, tên bảng. `detail` chỉ chứa dữ liệu nghiệp vụ an toàn (số lô, SL còn, hạn mức). |
| 12 | Log | Theo [`log-convention.md`](log-convention.md). Không ghi log: mật khẩu, PIN, mã MFA, `X-MFA-Token`, cookie. |

---

## 3. Status code và body lỗi

### 3.1 Status code dùng trong dự án

Mã ngoài bảng này không được dùng trong file API (khuôn BM-2-901-52 §4).

| Status | Dùng khi | Mã lỗi điển hình | Client (khung chung `wireframes/_common-layout.md`) |
|---|---|---|---|
| 200 | Đọc / cập nhật thành công | — | — |
| 201 | Tạo bản ghi mới (lô, GD, yêu cầu, ngoại lệ) | — | C-12 toast |
| 401 | Chưa đăng nhập / phiên hết hạn / đổi người | `E-CMN-001` | Về SC-00-01 (PC) hoặc SC-00-02 (tablet), giữ nội dung đang nhập |
| 403 | Vai / quyền duyệt không đủ; maker tự duyệt; thiếu MFA | `E-CMN-002`, `E-CMN-005`, mã feature (vd `E-PTY-012`, `E-RULE-002`) | C-25 (quyền) · C-30 (MFA) |
| 404 | Không có bản ghi hoặc RLS ẩn (không phân biệt hai ca) | mã feature `…-0xx` | C-23 |
| 409 | Xung đột trạng thái nghiệp vụ, trùng, vượt SL, quota, đồng thời, khóa lạc quan | mã feature, `E-CMN-006`, `E-CMN-008` | C-23 |
| 422 | **Mọi** lỗi nhập: sai schema (zod) **và** vi phạm quy tắc trường (độ dài, phạm vi, bắt buộc theo điều kiện) | `E-CMN-007`, mã feature | C-22 dưới ô (`field`) hoặc C-23 |
| 423 | Ngày 業務日 đã 日次締め / kỳ đã 期ロック | `E-CMN-003`, `E-INC-002` | C-24 (= SC-00-05), giữ nội dung, nút sang 修正申請 |
| 500 | Lỗi không lường trước; transaction đã rollback | `E-CMN-004` | C-26 kèm `traceId` |

**Không dùng 400.** Prototype trả 422 cho mọi lỗi nhập (`rpc-error-mapper.ts`); dự án giữ một mã để client chỉ có một nhánh xử lý lỗi nhập.

### 3.2 Body lỗi

```json
{ "error": { "code": "E-LOT-004", "message": "kg は小数第1位まで、箱・尾は整数で入力してください", "field": "qty" } }
```

| Khóa | Kiểu | Bắt buộc | Nội dung |
|---|---|---|---|
| `code` | string | Có | Mã ở [`error-codes.md`](error-codes.md) — `E-CMN-xxx` hoặc mã feature |
| `message` | string | Có | Thông điệp JP đã điền tham số (`{lotNo}` → số thật) |
| `field` | string | Không | Khóa request gây lỗi (camelCase, dạng đường dẫn `items[2].qty`) — client tô ô |
| `detail` | object | Không | Dữ liệu nghiệp vụ cho client hiện (vd `{ "limit": 3000000, "used": 2950000 }`) |
| `traceId` | string | Không (bắt buộc với 500) | Mã truy vết khớp log server |

Hàm DB ném `P0001` với message `'E-XXX-nnn: detail'`; route handler tách mã → tra bảng HTTP + thông điệp (cách của prototype, ARCHITECTURE §4.3).

---

## 4. MFA step-up

Theo ADR-002 §2.2. Hai mức, **một** mã lỗi `E-CMN-005` (403) cho mọi ca thiếu MFA.

| Mức | Dùng cho | Server kiểm | Client |
|---|---|---|---|
| Step-up theo phiên | Hành động duyệt ở PREMISE §3.2 **có thể đảo** (確認 version `CHANGE`, 差し戻す, 決裁 許可 / 承認, 修正申請 決裁…) | `app.mfa_verified_at` của (người, thiết bị, phiên) còn ≤ 10 phút **và** không idle > 3 phút | Thiếu → nhận 403 `E-CMN-005` → mở C-30 → gọi API xác thực của iam → gửi lại request |
| Token dùng một lần | Hành động **không quay lại được** — luôn hỏi lại mã (ADR-002 §2.2-6a): 日次締め, 端末回収不能, 期ロック, 確認 version `ROLLBACK`, 決裁 N2 của 運用部門長 | Header `X-MFA-Token`: chưa dùng, ≤ 120 giây, cùng người + thiết bị, đúng `purpose` | C-31 xác nhận → C-30 nhập mã → nhận token → gửi kèm header |

`purpose` đã dùng: `DAY_CLOSE`, `DEVICE_LOST` (settle), `PERIOD_LOCK` (incentive), `RULE_ROLLBACK_CONFIRM`, `RULE_SECOND_APPROVAL` (rule). Thêm `purpose` mới → thêm vào đây.

Mã 6 số sai, khóa tạm sau 5 lần sai: do **API xác thực MFA của module iam** trả — API này chưa có đặc tả (ngoài 10 màn, xem [`specs/_index.md`](../_index.md) mục phụ thuộc). Đề xuất: `POST /api/v1/auth/mfa/verify` `{ code, purpose? }` → làm mới step-up của phiên và, khi có `purpose`, trả `{ mfaToken, expiresAt }`. API nghiệp vụ không nhận mã 6 số trong body.

---

## 5. Khóa lạc quan và thao tác đồng thời

- Bản ghi **sửa được tại chỗ** (master người tham gia, form chưa chốt) mang `version` (Integer). Client gửi lại `version` đã tải; lệch → 409 `E-CMN-008`, `detail.currentVersion`. Client hiện C-23 + nút 「再読み込み」, giữ nội dung đang gõ.
- Bản ghi **append-only** (GD, sổ SL, 引渡し, kết quả thưởng) không dùng `version`: hàm DB khóa dòng cha (`SELECT … FOR UPDATE`) rồi kiểm lại điều kiện; điều kiện đổi → mã 409 của feature nói rõ nguyên nhân (vd `E-TRD-002` SL còn không đủ).
- Deadlock / serialization (`40P01`, `40001`) → rollback, 409 `E-CMN-006`; client cho bấm lại, **không** tự gửi lại.

---

## 6. Idempotency

| Loại API | Cách | Ví dụ |
|---|---|---|
| Ghi từ máy có thể offline / hàng đợi đồng bộ (ADR-008) | Mỗi bản ghi mang `clientRecordId` (UUID v4 sinh trên máy). Server gặp lại cùng `clientRecordId` → trả kết quả lần đầu (200), không ghi thêm | API-DEL-003 |
| Ghi online thông thường | **Không** idempotent: client khóa nút khi đang gửi, timeout không tự gửi lại; trùng được chặn bằng quy tắc nghiệp vụ (409) | API-LOT-002, API-TRD-002 |
| Chuyển trạng thái (duyệt, khóa) | Tự nhiên idempotent theo trạng thái: lần hai gặp trạng thái đích → 409 mã "đã xử lý" của feature | API-PTY-005, API-STL-002, API-INC-003 |

Không dùng header `Idempotency-Key` chung (YAGNI — chỉ luồng offline cần, và nó đã có khóa riêng theo bản ghi).

---

## 7. Ngày đã khóa (423)

- Khóa nằm ở DB: trigger `enforce_open_business_day` chặn ghi vào 業務日 không `OPEN` (ADR-005). API chỉ ánh xạ lỗi `DAY_LOCKED` → 423 `E-CMN-003`. Kỳ đã 期ロック → 423 `E-INC-002` (ADR-007).
- **Không có API mở lại** ngày hay kỳ. Sửa sau khóa = 修正申請 → 決裁 → bản ghi REVERSE / DELTA ở ngày đang mở (luật 4).
- Client hiện C-24, giữ nguyên nội dung đã nhập, nút 「修正申請を作成 →」 mang nội dung sang SC-08-01.
- Hàng đợi offline gặp ngày đã khóa: bản ghi chuyển `HELD`, không trả 423 cho từng bản ghi (ADR-008 §2.2-7).

---

## 8. Appendix

### 8.1 Param Type

| Param Type | Dùng cho |
|---|---|
| `Header Parameters` | `X-CSRF-Token`, `X-MFA-Token`, `X-Device-Id` |
| `Path Parameters` | ID trong URL |
| `Query Parameters` | Lọc, phân trang (`limit`, `offset`) |
| `Form Parameters` | Upload file (multipart) — chỉ API đính kèm chung |
| `Body Parameters` | JSON body. **Không có trong biểu mẫu gốc** — thêm vì API JSON (ghi chú trong khuôn BM-2-901-52) |

### 8.2 Data Type

| Data Type | Nghĩa |
|---|---|
| `Integer` | Số nguyên (tiền yên, SL 箱 / 尾, version) |
| `number` | Số thập phân (SL kg) — **thêm** so với biểu mẫu gốc |
| `string` | Chuỗi (UUID, ngày, enum) |
| `text` | Chuỗi dài (ghi chú, lý do) |
| `boolean` | true / false |
| `object` | Đối tượng JSON lồng — **thêm** |
| `string[]`, `object[]` | Mảng — **thêm**; trường con ghi dạng `items[].qty` |
| `file` | File upload |

### 8.3 Action (cột Action của History)

`Add new` · `Update` · `Delete` — như biểu mẫu gốc.

---

## 9. Điểm mở

| ID | Nội dung | Giả định tạm | Ảnh hưởng nếu sai |
|---|---|---|---|
| Q-API-01 | API xác thực MFA và tra 社員番号 thuộc module `iam` chưa có đặc tả | Theo mục 4; viết ở LAB-5 cùng SC-00-01 / SC-00-02 | Đổi tên header / thời hạn token → sửa 5 API dùng token, không đổi luồng màn |
| Q-API-02 | `traceId` có hiện cho người dùng không | Hiện ở C-26 「エラー番号」 để báo IT | Không — chỉ đổi UI |
