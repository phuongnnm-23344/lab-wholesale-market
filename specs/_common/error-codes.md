---
id: SPEC-ERROR_CODES-001
title: Danh mục mã lỗi (mã chung E-CMN + bảng tổng theo feature)
type: system
subtype: error-codes
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
design_id: ERROR_CODES
feature: _common
related: ["SPEC-API_CONV-001", "BM-2-901-52", "BM-2-901-54"]
---

# Danh mục mã lỗi

> Nơi duy nhất định nghĩa **mã chung `E-CMN-*`** (thông điệp JP một bản). Mã của từng feature (`E-LOT`, `E-TRD`, …) định nghĩa ở §3 của Function Specifications feature đó — file này chỉ liệt kê tiền tố, dải số và link, **không chép lại thông điệp** (DRY). HTTP status và format body: [`api-conventions.md`](api-conventions.md) §3.

---

## 1. Lịch sử sửa đổi

| No. | Version | Action | Thay đổi | Ngày | Người sửa | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu khi gộp P3: hợp nhất mã chung của 3 luồng (luồng 3 `AUTH_REQUIRED` / `MFA_*` / `FORBIDDEN` / `VALIDATION` / `INTERNAL` → `E-CMN`), bảng tổng 7 tiền tố feature | 2026-11-25 | phuongnnm-23344 | LAB-4 P3 |
| 2 | 0.1.1 | Update | Gate 2: E-STL 001–029 (21 mã; thêm 013 Q-STL-02, 029 G2-M03), E-INC 001–014 (thêm 014 Q-INC-01); tổng 8 + 147; "12 màn" (G2-m05) | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. Quy tắc đặt mã

- Dạng `E-{TIỀN TỐ}-{nnn}`: tiền tố theo feature (bảng §4), `nnn` tăng dần, **không tái dùng** số đã bỏ — số bỏ ghi "dự trữ".
- Mã mới thêm vào §3 FUNC của feature **trong cùng lượt** viết spec dùng nó; mã dùng từ hai feature trở lên → chuyển thành `E-CMN` ở §3 file này.
- Một mã = một nguyên nhân = một thông điệp. Hai căn cứ pháp lý khác nhau thì hai mã: `E-TRD-005` (**許可** 仲卸) ≠ `E-TRD-006` (**承認** 売買参加者) — luật 2.
- Thông điệp: tiếng Nhật, nói nguyên nhân + việc người dùng làm tiếp; tham số trong `{…}`. Không dùng 「承認」 cho duyệt nội bộ (L4-D03) — dùng 確認 / 決裁.
- HTTP: 422 mọi lỗi nhập, 409 xung đột trạng thái, 403 quyền / maker tự duyệt / MFA, 404 không thấy, 423 ngày / kỳ đã khóa, 500 lỗi hệ thống (api-conventions §3.1). Không dùng 400.

---

## 3. Mã chung `E-CMN`

| Mã | HTTP | Thông điệp (JP) | Nghĩa (VI) | Client | Phát sinh |
|---|---|---|---|---|---|
| E-CMN-001 | 401 | ログインが必要です | Chưa đăng nhập / phiên hết hạn / đã đổi người | Về SC-00-01 (PC) / SC-00-02 (tablet), giữ nội dung | Middleware phiên — mọi API |
| E-CMN-002 | 403 | この操作の権限がありません | Vai / quyền duyệt không đủ, 代行 hết hạn, CSRF sai | C-25 | `requireRole`, `assert_caller`, RLS `42501` |
| E-CMN-003 | 423 | {業務日} は締め済みのため直接修正できません。訂正は修正申請で行います。 | 業務日 đã 日次締め (`DAY_LOCKED`) | C-24, giữ nội dung, nút sang SC-08-01 | Trigger `enforce_open_business_day` (ADR-005) |
| E-CMN-004 | 500 | 処理中にエラーが発生しました。時間をおいて再度お試しください | Lỗi không lường trước; đã rollback | C-26 kèm `traceId` (「エラー番号」) | Mọi API |
| E-CMN-005 | 403 | この操作の前に本人確認（MFA）が必要です | Thiếu MFA step-up còn hiệu lực, hoặc `X-MFA-Token` thiếu / hết hạn / đã dùng / sai `purpose` / khác người, thiết bị | C-30 rồi gửi lại | API duyệt (PREMISE §3.2, api-conventions §4) |
| E-CMN-006 | 409 | 同時に操作が行われました。もう一度お試しください | Deadlock / serialization (`40P01`, `40001`) | C-23, cho bấm lại (không tự gửi lại) | Mọi API ghi |
| E-CMN-007 | 422 | 入力の形式が正しくありません | Request sai schema (zod): thiếu trường, sai kiểu, enum lạ; PG `22P02` / `22008` | C-22 dưới ô theo `field`, hoặc C-23 | Mọi API |
| E-CMN-008 | 409 | 他の利用者が更新しました。最新の内容を読み込み直してください | Khóa lạc quan: `version` lệch (`detail.currentVersion`) | C-23 + 「再読み込み」, giữ nội dung đang gõ | API sửa tại chỗ (vd API-PTY-002) |

Mã đổi tên khi gộp (chỉ để tra lịch sử, **không dùng**): `AUTH_REQUIRED` → `E-CMN-001` · `FORBIDDEN` → `E-CMN-002` · `INTERNAL` → `E-CMN-004` · `MFA_REQUIRED` → `E-CMN-005` · `VALIDATION` → `E-CMN-007` · `MFA_INVALID` → bỏ (sai mã 6 số là lỗi của API xác thực MFA của iam, xem §5).

---

## 4. Bảng tổng mã theo feature

| Tiền tố | Feature | Dải đang dùng | Số mã | Định nghĩa (thông điệp JP, HTTP, màn / API) | Ghi chú |
|---|---|---|---|---|---|
| `E-LOT` | `lot` | 001–017 | 17 | [LOT_FUNC §3.1](../lot/function-specifications/LOT_FUNC.md#31-mã-lỗi-e-lot-) | |
| `E-TRD` | `trade` | 001–027 | 27 | [TRADE_FUNC §3.1](../trade/function-specifications/TRADE_FUNC.md#31-mã-lỗi-e-trd-) | 005 許可 / 006 承認 tách riêng |
| `E-PTY` | `party` | 001–024 | 24 | [PARTY_FUNC §3](../party/function-specifications/PARTY_FUNC.md#3-danh-mục-mã-lỗi-e-pty) | |
| `E-DEL` | `delivery` | 001–030 | 30 | [DELIVERY_FUNC §3](../delivery/function-specifications/DELIVERY_FUNC.md#3-danh-mục-mã-lỗi-e-del) | 029 dùng ở API đính kèm chung (chưa đặc tả) |
| `E-STL` | `settle` | 001–029 | 21 | [SETTLE_FUNC §3](../settle/function-specifications/SETTLE_FUNC.md#3-danh-mục-mã-lỗi-e-stl) | 011, 014–020 dự trữ; 013 = tick 「未入力の引渡し確認票なし」 (Q-STL-02), 029 = `LATE_ENTRY` bị module đích từ chối (G2-M03) |
| `E-INC` | `incentive` | 001–014 | 14 | [INC_FUNC §3](../incentive/function-specifications/INC_FUNC.md#3-bảng-mã-lỗi-của-feature) | 002 dùng 423 (kỳ đã 期ロック) |
| `E-RULE` | `rule` | 001–014 | 14 | [RULE_FUNC §3](../rule/function-specifications/RULE_FUNC.md#3-bảng-mã-lỗi-của-feature) | |

Tổng: 8 mã chung + 147 mã feature.

---

## 5. Tiền tố đặt trước (feature chưa có đặc tả)

Feature dưới đây chưa có spec trong 12 màn có Screen Specification; giữ tiền tố để LAB-5 không đặt trùng. Danh sách phụ thuộc đầy đủ: [`specs/_index.md`](../_index.md) mục "Phụ thuộc chưa đặc tả".

| Tiền tố | Feature | Dự kiến |
|---|---|---|
| `E-IAM` | `iam` | Sai mã MFA (còn N lần), khóa tạm sau 5 lần sai, 社員番号 không có / không `ACTIVE` |
| `E-ATT` | đính kèm chung | Sai loại / cỡ file (hiện tạm ở `E-DEL-029`), không tìm thấy file |
| `E-SYNC` | `sync` | Bản ghi offline `HELD` / xung đột khi đồng bộ |
| `E-CAL`, `E-NTF`, `E-RPT`, `E-AUD` | `calendar`, `notify`, `report`, `audit` | Chưa dùng |
