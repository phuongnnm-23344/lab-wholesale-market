---
id: SPEC-PARTY_FUNC-001
title: Function Specifications — module party (người tham gia, 許可 / 承認)
type: system
subtype: function-specifications
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: party
related: [SPEC-SC-01-02-001, SPEC-PTY_PERMIT_LIFECYCLE-001, SPEC-PTY_APPROVAL_LIFECYCLE-001, API-PTY-001, API-PTY-002, API-PTY-003, API-PTY-004, API-PTY-005, API-PTY-006, API-PTY-007, SPEC-PARTY_DB-001]
---

# party — Function Specifications

| | |
|---|---|
| Module / file | `src/modules/party/participant-service.ts` · `permit-service.ts` (許可) · `approval-service.ts` (承認) · hàm DB `app.fn_participant_*`, `app.fn_permit_*`, `app.fn_approval_*` |
| Ngôn ngữ / framework | TypeScript 5 / Next.js App Router (route handler) + PostgreSQL 16 (PL/pgSQL, `security definer`) — ARCHITECTURE §4.3 |

Kiểu dùng chung: `SessionContext` = `{ userId, deviceId, roles: AppRole[], authorities: Authority[], delegationId?: string, mfaVerifiedAt?: Date }` (ADR-002); `Result<T>` = `{ ok: true, data: T } | { ok: false, error: AppError }`; `AppError` = `{ code: string, httpStatus: number, extra?: Record<string,string> }`. Service **không** ghi bảng trực tiếp — gọi đúng một hàm DB trong một transaction (DB role app chỉ có EXECUTE).

---

## 1. Lịch sử sửa đổi

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | Toàn module | Khởi tạo 8 function + danh mục mã lỗi `E-PTY` | 2026-11-25 | phuongnnm-23344 | |

---

## 2. Đặc tả function

### 2.1. `getParticipantDetail`

| Return type | Function name |
|---|---|
| `Promise<Result<ParticipantDetail>>` | `getParticipantDetail` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | Xác định vai để RLS lọc và để trả `allowedActions` |
| `string (uuid)` | `participantId` | Người tham gia cần xem |

**Function description**

> - Đọc qua view `security_invoker` (RLS theo `role_read_matrix`): người tham gia, email đang hiệu lực, 保証金 hiện hành + lịch sử, **một trong hai** khối `permit` (kind `NAKAOROSHI`) hoặc `approval` (kind `BAIBAI`) kèm event, yêu cầu mở, 今期使用額 (`v_buyer_period_usage`).
> - Tính `daysToExpiry`, `limitMode` (`DEPOSIT` / `INDIVIDUAL`), `allowedActions[]` theo vai + trạng thái (SC-01-02 §6.2).
> - Lỗi: `E-PTY-018` (không thấy / RLS ẩn), `E-CMN-002`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `QualificationBlock \| null` | `permit` / `approval` | Chỉ một biến có giá trị — hai khối không bao giờ cùng trả (luật 2) |
| `AllowedAction[]` | `allowedActions` | Cho client ẩn / hiện nút, không thay kiểm quyền ở server |

### 2.2. `updateParticipantBasic`

| Return type | Function name |
|---|---|
| `Promise<Result<ParticipantDetail>>` | `updateParticipantBasic` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | Kiểm vai SETTLE / STL-HEAD |
| `string` | `participantId` | |
| `{ name: string; buyerNo?: string; emails: string[]; requestRef?: string; version: number }` | `input` | `version` = khóa lạc quan |

**Function description**

> - Gọi `fn_participant_update_basic`: UPDATE `participants` (`name`, `buyer_no`), đổi email = đóng dòng `participant_contacts` cũ (`valid_to`) + thêm dòng mới; audit before / after.
> - Lỗi: `E-PTY-001..004`, `E-PTY-021`, `E-PTY-010`, `E-CMN-008` (version lệch).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string[]` | `closedContactIds` | Dòng email bị đóng để ghi audit |

### 2.3. `changeDeposit`

| Return type | Function name |
|---|---|
| `Promise<Result<{ deposit: DepositRow; limitAfter: number \| null; limitMode: LimitMode }>>` | `changeDeposit` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | |
| `string` | `participantId` | |
| `{ depositJpy: number; effectiveFrom: string (YYYY-MM-DD); reason: string }` | `input` | |

**Function description**

> - Gọi `fn_participant_deposit_change`: INSERT `participant_deposit_history` (chỉ thêm). Với 売買参加者 `DEPOSIT` → trả `limitAfter = depositJpy`; `INDIVIDUAL` → trả hạn mức giữ nguyên.
> - Lỗi: `E-PTY-005..008`, `E-PTY-022`, `E-PTY-010`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `LimitMode` | `limitMode` | Quyết câu báo 参加上限 trong hộp thoại (khách #20) |

### 2.4. `createPermitRequest` (許可)

| Return type | Function name |
|---|---|
| `Promise<Result<PermitRequest>>` | `createPermitRequest` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | Maker: SETTLE (`NEW`, `RENEW`) hoặc STL-HEAD (`SUSPEND`, `RESUME`, `REVIEW_START`, `REINSTATE`) |
| `string` | `participantId` | Phải là 仲卸 |
| `{ kind: PermitRequestKind; payload: PermitRequestPayload; reason: string }` | `input` | |

**Function description**

> - Gọi `fn_permit_request_create` (SPEC-PTY_PERMIT_LIFECYCLE-001 §4.2). Trả yêu cầu `ENTERED` / `PROPOSED`.
> - Lỗi: `E-PTY-007`, `-009`, `-010`, `-011`, `-013`, `-014`, `-018`, `-019`, `-020`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `PermitRequestKind` | `kind` | Chọn schema zod cho `payload` |

### 2.5. `transitionPermitRequest` (許可)

| Return type | Function name |
|---|---|
| `Promise<Result<{ request: PermitRequest; permit?: Permit; events?: PermitEvent[] }>>` | `transitionPermitRequest` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | `DECIDE` cần MFA còn hiệu lực |
| `string` | `requestId` | |
| `{ action: 'PROPOSE' \| 'DECIDE' \| 'REJECT'; reviewResult?: string; reviewedOn?: string; permitConditions?: string; comment?: string }` | `input` | `PROPOSE` chỉ cho `NEW` (審査 + 起案) |

**Function description**

> - `PROPOSE` → `fn_permit_request_propose`; `DECIDE` → kiểm MFA rồi `fn_permit_request_decide`; `REJECT` → `fn_permit_request_reject` (SPEC-PTY_PERMIT_LIFECYCLE-001 §4.3–4.5).
> - Lỗi: `E-PTY-012`, `-013`, `-015`, `-017`, `-023`, `E-CMN-005`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `mfaFresh` | Kết quả kiểm step-up (10 phút, idle 3 phút) trước khi mở transaction |

### 2.6. `createApprovalRequest` (承認)

| Return type | Function name |
|---|---|
| `Promise<Result<ApprovalRequest>>` | `createApprovalRequest` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | Maker: SETTLE (`NEW`, `RENEW`, `LIMIT_CHANGE`) hoặc STL-HEAD (loại 起案) |
| `string` | `participantId` | Phải là 売買参加者 |
| `{ kind: ApprovalRequestKind; payload: ApprovalRequestPayload; reason: string }` | `input` | |

**Function description**

> - Gọi `fn_approval_request_create` (SPEC-PTY_APPROVAL_LIFECYCLE-001 §4.2). Hàm riêng, không dùng chung code path với 2.4 (ADR-003).
> - Lỗi: `E-PTY-006`, `-007`, `-009`, `-010`, `-011`, `-013`, `-014`, `-016`, `-018`, `-019`, `-020`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `number \| null` | `oldLimitJpy` | Lưu vào payload để người 確認 thấy trước / sau |

### 2.7. `transitionApprovalRequest` (承認)

| Return type | Function name |
|---|---|
| `Promise<Result<{ request: ApprovalRequest; approval?: Approval; event?: ApprovalEvent }>>` | `transitionApprovalRequest` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | |
| `string` | `requestId` | |
| `{ action: 'DECIDE' \| 'REJECT'; comment?: string }` | `input` | Không có `PROPOSE` (承認 không 審査 riêng) |

**Function description**

> - `DECIDE` → MFA → `fn_approval_request_decide`; `REJECT` → `fn_approval_request_reject` (SPEC-PTY_APPROVAL_LIFECYCLE-001 §4.3–4.4).
> - Lỗi: `E-PTY-012`, `-013`, `-017`, `-023`, `E-CMN-005`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| | | |

### 2.8. `expireDueQualifications` (job)

| Return type | Function name |
|---|---|
| `Promise<{ permitsExpired: number; approvalsExpired: number }>` | `expireDueQualifications` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `string (YYYY-MM-DD)` | `businessDate` | 業務日 vừa mở (gọi từ hàm mở ngày, ADR-005 §2.4) |

**Function description**

> - Gọi lần lượt `fn_permit_expire_due` rồi `fn_approval_expire_due` (hai transaction riêng — lỗi một bên không chặn bên kia). Lỗi → log `ERROR` + alarm, không ném ra ngoài (không chặn mở ngày).

| Variable type | Variable name | Role of variables |
|---|---|---|
| `number` | `permitsExpired` | Ghi vào log `INFO` và audit tổng |

---

## 3. Danh mục mã lỗi `E-PTY`

| Mã | HTTP | Thông điệp (JP) | Nghĩa (VI) | Dùng ở |
|---|---|---|---|---|
| E-PTY-001 | 422 | 名称は1〜100文字で入力してください | Tên rỗng / quá dài | SC-01-02 [4]; API-PTY-002 |
| E-PTY-002 | 422 | 買受人番号は英大文字・数字1〜10文字で入力してください | Sai định dạng 買受人番号 | [5]; API-PTY-002 |
| E-PTY-003 | 409 | この買受人番号は既に使われています | 買受人番号 trùng | [5]; API-PTY-002 |
| E-PTY-004 | 422 | メールアドレスの形式が正しくありません | Email sai dạng | [6] [7]; API-PTY-002 |
| E-PTY-005 | 422 | 保証金額は0以上の整数で入力してください | 保証金 không hợp lệ | 9.1; API-PTY-003 |
| E-PTY-006 | 422 | 発効日は本日（業務日）以降の日付を入力してください | Ngày hiệu lực trong quá khứ | 9.2; API-PTY-003, -006 |
| E-PTY-007 | 422 | 理由を入力してください | Thiếu lý do | 9.3; API-PTY-003, -004, -006 |
| E-PTY-008 | 409 | 同じ発効日の保証金変更が既にあります | Trùng ngày hiệu lực 保証金 | API-PTY-003 |
| E-PTY-009 | 409 | この種別では許可（承認）を登録できません | Sai loại người tham gia cho 許可 / 承認 | API-PTY-002, -004, -006 |
| E-PTY-010 | 409 | この参加者は退会済みのため変更できません | Người tham gia đã 退会 | API-PTY-002..007 |
| E-PTY-011 | 409 | 処理中の申請があります。完了または却下の後に操作してください | Đã có yêu cầu mở | API-PTY-004, -006 |
| E-PTY-012 | 403 | 申請者・起案者本人は決裁（確認）できません | Maker tự duyệt | API-PTY-005, -007 |
| E-PTY-013 | 409 | この状態からは指定の操作はできません | Chuyển trạng thái không hợp lệ (FIG-010) | API-PTY-004..007 |
| E-PTY-014 | 422 | 新しい失効日は現在の失効日より後の日付にしてください | Gia hạn không lùi / không hợp lệ | API-PTY-004, -006 |
| E-PTY-015 | 422 | 審査結果を入力してください | Thiếu kết quả 審査 (許可) | API-PTY-005 |
| E-PTY-016 | 422 | 参加上限は1円以上で入力するか、「保証金額に連動」を選んでください | 参加上限 không hợp lệ / không đổi | API-PTY-006 |
| E-PTY-017 | 409 | この申請は既に処理済み、または処理できる段階ではありません | Yêu cầu đã đóng / sai bước | API-PTY-005, -007 |
| E-PTY-018 | 404 | 参加者が見つかりません | Không tìm thấy | API-PTY-001..006 |
| E-PTY-019 | 409 | 許可番号（承認番号）が既に使われています | Số 許可 / 承認 trùng | API-PTY-004, -006 |
| E-PTY-020 | 422 | 有効期間の終了日は開始日以降にしてください | Khoảng hiệu lực sai | API-PTY-004, -006 |
| E-PTY-021 | 422 | 同じメールアドレスは2件登録できません | Hai email trùng nhau | [7]; API-PTY-002 |
| E-PTY-022 | 422 | 現在の保証金額と同じです | 保証金 không đổi | 9.1; API-PTY-003 |
| E-PTY-023 | 422 | 却下理由を入力してください | Thiếu lý do từ chối | API-PTY-005, -007 |
| E-PTY-024 | 404 | 申請が見つかりません | Không tìm thấy yêu cầu 許可 / 承認 | API-PTY-005, -007 |

Mã chung `E-CMN-001..008` (thông điệp JP một bản, HTTP, cách client xử lý): [`_common/error-codes.md`](../../_common/error-codes.md). Body lỗi, MFA, khóa lạc quan: [`_common/api-conventions.md`](../../_common/api-conventions.md).
