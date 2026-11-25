---
id: SPEC-SETTLE_FUNC-001
title: Function Specifications — module settle (日次締め, 端末回収不能, 修正申請 決裁)
type: system
subtype: function-specifications
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: settle
related: [SPEC-SC-07-02-001, SPEC-SC-08-03-001, SPEC-STL_DAY_CLOSE-001, SPEC-STL_DEVICE_LOST-001, SPEC-STL_CORRECTION_DECIDE-001, API-STL-001, API-STL-002, API-STL-003, API-STL-004, API-STL-005, SPEC-CLOSE_DB-001, SPEC-ADJUST_DB-001]
---

# settle — Function Specifications

| | |
|---|---|
| Module / file | `src/modules/settle/day-close-service.ts` · `correction-service.ts` · hàm DB `app.fn_day_close_checklist`, `app.fn_day_close`, `app.fn_device_mark_lost`, `app.fn_correction_preview`, `app.fn_correction_decide` |
| Ngôn ngữ / framework | TypeScript 5 / Next.js App Router + PostgreSQL 16 (PL/pgSQL) — ARCHITECTURE §4.3 |

Kiểu dùng chung `SessionContext`, `Result<T>`, `AppError`: xem [PARTY_FUNC](../../party/function-specifications/PARTY_FUNC.md). `MfaToken` = token dùng một lần do `iam` cấp sau khi xác thực mã với `purpose` (★ hành động không quay lại được — ADR-002 §2.2-6a).

---

## 1. Lịch sử sửa đổi

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | Toàn module | Khởi tạo 5 function + mã lỗi `E-STL` | 2026-11-25 | phuongnnm-23344 | |
| 2 | Ver 0.1.1 | Update | — | Gate 2 G2-M02: §4 Điều kiện hoàn thành (LAB-5); G2-M03: mã E-STL-029; khách Q-STL-02: input `paperSlipsAllEnteredAcknowledged`, mã E-STL-013; Q-STL-04: quyền cấp 1 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. Đặc tả function

### 2.1. `getCloseChecklist`

| Return type | Function name |
|---|---|
| `Promise<Result<CloseChecklist>>` | `getCloseChecklist` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | STL-HEAD / 代行 / SETTLE (đọc) |
| `string (YYYY-MM-DD)` | `businessDate` | Mặc định client gửi 業務日 `OPEN` sớm nhất |

**Function description**

> - Gọi `fn_day_close_checklist` (STL_DAY_CLOSE §4.2): 12 mục (ADR #, #12 là tick không đếm, item SC-07-02, mức BLOCK / WARN, số, chi tiết), tổng tiền 相対 / せり, danh sách máy, `checklistVersion`; ngày đã khóa → ảnh chụp lúc khóa + `lockedInfo`.
> - Lỗi: `E-STL-012`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `checklistVersion` | Hash nội dung để chặn khóa theo màn cũ |

### 2.2. `closeBusinessDay`

| Return type | Function name |
|---|---|
| `Promise<Result<{ lockedAt: string; lockedBy: string; delegatedFor?: string; nextBusinessDate: string }>>` | `closeBusinessDay` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | Quyền STL_HEAD hoặc 代行 |
| `string` | `businessDate` | Ngày khóa |
| `{ confirmDate: string; deliveryRemainderAcknowledged: boolean; paperSlipsAllEnteredAcknowledged: boolean; checklistVersion: string }` | `input` | |
| `MfaToken` | `mfaToken` | `purpose = DAY_CLOSE`, dùng một lần |

**Function description**

> - Tiêu thụ `mfaToken` → `fn_day_close` (STL_DAY_CLOSE §4.3–4.4): kiểm lại checklist trong transaction, khóa, ảnh chụp, 持ち越し, mở ngày chợ kế tiếp; sau COMMIT xếp job IF-ACC-01 và gọi `expireDueQualifications` (party).
> - Lỗi: `E-STL-001..005`, `-008`, `-010`, `-012`, `-013`, `E-CMN-005`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `nextBusinessDate` | Ngày `OPEN` vừa mở — trả cho màn và header C-2 |

### 2.3. `markDeviceLost`

| Return type | Function name |
|---|---|
| `Promise<Result<{ device: LostDevice }>>` | `markDeviceLost` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | STL_HEAD / 代行 |
| `string` | `deviceId` | |
| `string` | `reason` | 1–200 |
| `MfaToken` | `mfaToken` | `purpose = DEVICE_LOST` |

**Function description**

> - `fn_device_mark_lost` (STL_DEVICE_LOST §4.2): ghi `lost_*`, `is_active = false`, thu hồi phiên máy, audit.
> - Lỗi: `E-STL-006`, `-007`, `-009`, `E-CMN-005`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `number` | `pendingSyncCountAtReport` | Ghi audit — số bản ghi coi như mất lúc báo |

### 2.4. `getCorrectionDetail`

| Return type | Function name |
|---|---|
| `Promise<Result<CorrectionDetail>>` | `getCorrectionDetail` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | |
| `string` | `correctionId` | |

**Function description**

> - `fn_correction_preview` (STL_CORRECTION_DECIDE §4.1): yêu cầu, before / after, biến động theo người mua 税込, bản ghi sẽ sinh, 計上業務日 (tạm tính), 対象期 + đã khóa chưa, câu ảnh hưởng, lịch sử duyệt, `allowedActions`, `elapsedBusinessDays`.
> - Lỗi: `E-STL-021`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `AllowedAction[]` | `allowedActions` | `DECIDE_L1` · `DECIDE_L2` · `REJECT` — chỉ để ẩn / hiện nút |

### 2.5. `decideCorrection`

| Return type | Function name |
|---|---|
| `Promise<Result<{ correction: CorrectionSummary; approval: CorrectionApproval; records: AdjustmentRecord[]; nextPendingId?: string }>>` | `decideCorrection` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | MFA step-up còn hiệu lực (10 phút) |
| `string` | `correctionId` | |
| `{ level: 1 \| 2; decision: 'APPROVE' \| 'REJECT'; comment?: string }` | `input` | `level` để chặn hai người bấm cùng lúc ở hai cấp |

**Function description**

> - `fn_correction_decide` (STL_CORRECTION_DECIDE §4.2–4.5): ghi `correction_approvals`; đủ cấp → sinh REVERSE / DELTA (`TRADE`), bản ghi mới (`LATE_ENTRY`) hoặc chỉ `APPROVED` (`KANNO`, `INCENTIVE`) ở 業務日 `OPEN` sớm nhất, kỳ = kỳ GD gốc.
> - Lỗi: `E-STL-021..029`, `E-CMN-002`, `E-CMN-005`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `appliedBusinessDate` | 計上業務日 chốt lúc duyệt cuối |
| `string` | `targetPeriodId` | Kỳ của GD gốc — không suy từ ngày áp |

---

## 3. Danh mục mã lỗi `E-STL`

| Mã | HTTP | Thông điệp (JP) | Nghĩa (VI) | Dùng ở |
|---|---|---|---|---|
| E-STL-001 | 422 | 確認のため業務日を正しく入力してください | Gõ lại 業務日 không khớp | SC-07-02 [16]; API-STL-002 |
| E-STL-002 | 409 | 締め不可（✖）の項目が残っています | Còn mục ✖ | [17]; API-STL-002 |
| E-STL-003 | 422 | 引渡し残の確認（確認済み）にチェックしてください | Chưa tick [13] | [13]; API-STL-002 |
| E-STL-004 | 409 | この業務日は既に締め済みです | Ngày đã khóa | API-STL-002 |
| E-STL-005 | 409 | 前の業務日 {date} が未締めです。先に締めてください | Ngày trước chưa khóa | API-STL-002 |
| E-STL-006 | 422 | 理由を入力してください（200文字以内） | Thiếu lý do 端末回収不能 | 19.2; API-STL-003 |
| E-STL-007 | 409 | この端末は既に端末回収不能として登録されています | Máy đã đánh dấu | API-STL-003 |
| E-STL-008 | 409 | 次の市場開催日がカレンダーに登録されていません | Lịch thiếu ngày chợ kế tiếp | API-STL-002 |
| E-STL-009 | 404 | 端末が見つかりません | Không thấy máy | API-STL-003 |
| E-STL-010 | 409 | チェックリストが更新されました。最新の内容を確認してください | Checklist đổi từ lúc hiển thị | API-STL-002 |
| E-STL-012 | 404 | 指定の業務日が存在しません | Không có 業務日 | API-STL-001, -002 |
| E-STL-013 | 422 | 未入力の引渡し確認票がないこと（紙台帳で確認）にチェックしてください | Chưa tick [22] (ADR #12, Q-STL-02) | [22]; API-STL-002 |
| E-STL-021 | 404 | 修正申請が見つかりません | Không thấy 修正申請 | API-STL-004, -005 |
| E-STL-022 | 409 | この修正申請は決裁待ちではありません | Không còn chờ duyệt | API-STL-005 |
| E-STL-023 | 403 | 申請者本人は決裁できません | Người lập tự duyệt | SC-08-03; API-STL-005 |
| E-STL-024 | 403 | 1次と2次を同じ人は決裁できません | Một người duyệt 2 cấp | SC-08-03; API-STL-005 |
| E-STL-025 | 422 | 却下理由を入力してください（200文字以内） | Thiếu lý do từ chối | [12]; API-STL-005 |
| E-STL-026 | 409 | この修正申請は既に処理されました（決裁段階が変わりました） | Cấp gửi lên ≠ cấp hiện tại | API-STL-005 |
| E-STL-027 | 409 | ロットの残数量が不足しているため反映できません（残 {n}{単位}） | Lô không đủ SL khi tăng SL | API-STL-005 |
| E-STL-028 | 409 | 計上できる未締めの業務日がありません | Không có ngày mở để ghi | API-STL-005 |
| E-STL-029 | 409 | 反映先の処理でエラーになりました：{sourceMessage} | `LATE_ENTRY`: hàm module đích từ chối (vd tư cách không hiệu lực tại giờ trên phiếu); `detail.sourceCode` = mã gốc | SC-08-03 [13]; API-STL-005 |

Mã chung `E-CMN-001..008` (thông điệp JP một bản, HTTP, cách client xử lý): [`_common/error-codes.md`](../../_common/error-codes.md). Body lỗi, MFA, khóa lạc quan: [`_common/api-conventions.md`](../../_common/api-conventions.md). `E-STL-011`, `E-STL-013..020` để trống — dự trữ, không dùng.

---

## 4. Điều kiện hoàn thành (LAB-5)

Theo function; ca kiểm chi tiết ở mục "Điều kiện hoàn thành (LAB-5)" của Technical Design tương ứng. Mỗi function xong khi: mọi mã lỗi ở §3 mà function trả đều có ít nhất một test chạm tới với đúng HTTP status, và các điều kiện dưới đây đạt.

| Function | Điều kiện hoàn thành | TECH |
|---|---|---|
| `getCloseChecklist` | 12 mục đúng thứ tự ADR-005 §2.5 (#12 tick, `count = null`); ngày `LOCKED` trả ảnh chụp, không tính lại; SETTLE đọc được, vai khác 403 | [STL_DAY_CLOSE](../technical-design/STL_DAY_CLOSE_TECH.md) |
| `closeBusinessDay` | Còn ✖ → 409 `E-STL-002` (`detail.blocking[]`); thiếu tick #8 / #12 → 422 `E-STL-003` / `E-STL-013`; token sai `purpose` → 403; khóa xong ghi vào ngày đó → 423; mở 業務日 kế tiếp; xếp IF-ACC-01 | [STL_DAY_CLOSE](../technical-design/STL_DAY_CLOSE_TECH.md) |
| `markDeviceLost` | Máy ra khỏi mục #3, phiên thu hồi, lần hai → 409 `E-STL-007`; token `DEVICE_LOST` | [STL_DEVICE_LOST](../technical-design/STL_DEVICE_LOST_TECH.md) |
| `getCorrectionDetail` | `allowedActions` không có `DECIDE_L1` cho 運用部門長 (Q-STL-04); có cho 代行 STL_HEAD đang hiệu lực | [STL_CORRECTION_DECIDE](../technical-design/STL_CORRECTION_DECIDE_TECH.md) |
| `decideCorrection` | Vượt ngưỡng → 2 cấp; người lập → 403 `E-STL-023`; một người 2 cấp → 403 `E-STL-024`; 運用部門長 cấp 1 → 403; REVERSE + DELTA ở ngày `OPEN` sớm nhất, GD gốc giữ nguyên; `LATE_ENTRY` bị từ chối → 409 `E-STL-029` + rollback | [STL_CORRECTION_DECIDE](../technical-design/STL_CORRECTION_DECIDE_TECH.md) |
