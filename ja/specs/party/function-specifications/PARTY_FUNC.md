---
id: SPEC-PARTY_FUNC-001
title: 機能仕様 — モジュール party（参加者、許可 / 承認）
type: system
subtype: function-specifications
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: party
related: [SPEC-SC-01-02-001, SPEC-PTY_PERMIT_LIFECYCLE-001, SPEC-PTY_APPROVAL_LIFECYCLE-001, API-PTY-001, API-PTY-002, API-PTY-003, API-PTY-004, API-PTY-005, API-PTY-006, API-PTY-007, SPEC-PARTY_DB-001]
---

# party — 機能仕様

| | |
|---|---|
| Module / file | `src/modules/party/participant-service.ts` · `permit-service.ts` (許可) · `approval-service.ts` (承認) · DB関数 `app.fn_participant_*`, `app.fn_permit_*`, `app.fn_approval_*` |
| 言語 / フレームワーク | TypeScript 5 / Next.js App Router（route handler）+ PostgreSQL 16（PL/pgSQL、`security definer`）— ARCHITECTURE §4.3 |

共通の型: `SessionContext` = `{ userId, deviceId, roles: AppRole[], authorities: Authority[], delegationId?: string, mfaVerifiedAt?: Date }`（ADR-002）; `Result<T>` = `{ ok: true, data: T } | { ok: false, error: AppError }`; `AppError` = `{ code: string, httpStatus: number, extra?: Record<string,string> }`。Service は**テーブルへ直接書き込まず**、一つのトランザクション内で正確に一つの DB 関数を呼び出します（DB ロール app は EXECUTE のみ）。

---

## 1. 改訂履歴

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | モジュール全体 | 8 関数とエラーコード一覧 `E-PTY` を初期化 | 2026-11-25 | phuongnnm-23344 | |
| 2 | Ver 0.1.1 | Update | — | Gate 2 G2-M02: §3.1 完了条件（LAB-5）; G2-M03: E-PTY-013 は失効済みの場合の RENEW を含む（`detail.nextAction`）、E-PTY-014 は 422 のみ; 顧客（模擬）Q-PTY-06: 保証金 / 参加上限の変更は照合部門長のみ | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 関数仕様

### 2.1. `getParticipantDetail`

| Return type | Function name |
|---|---|
| `Promise<Result<ParticipantDetail>>` | `getParticipantDetail` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | 役割を特定し、RLS でフィルタし `allowedActions` を返すため |
| `string (uuid)` | `participantId` | 閲覧対象の参加者 |

**Function description**

> - `security_invoker` の view から読み取る（`role_read_matrix` による RLS）: 参加者、有効なメール、現行の保証金＋履歴、**いずれか一方**の `permit`（kind `NAKAOROSHI`）または `approval`（kind `BAIBAI`）ブロック（イベント付き）、開いている申請、今期使用額（`v_buyer_period_usage`）。
> - 役割と状態に基づき `daysToExpiry`、`limitMode`（`DEPOSIT` / `INDIVIDUAL`）、`allowedActions[]` を計算（SC-01-02 §6.2）。
> - エラー: `E-PTY-018`（見つからない / RLS で非表示）、`E-CMN-002`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `QualificationBlock \| null` | `permit` / `approval` | いずれか一方のみ値を持つ — 二つのブロックが同時に返ることはない（ルール2） |
| `AllowedAction[]` | `allowedActions` | クライアントがボタンの表示／非表示を決めるため。サーバー側の権限チェックの代わりにはしない |

### 2.2. `updateParticipantBasic`

| Return type | Function name |
|---|---|
| `Promise<Result<ParticipantDetail>>` | `updateParticipantBasic` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | SETTLE / STL-HEAD の役割を確認 |
| `string` | `participantId` | |
| `{ name: string; buyerNo?: string; emails: string[]; requestRef?: string; version: number }` | `input` | `version` = 楽観的ロック |

**Function description**

> - `fn_participant_update_basic` を呼び出す: `participants` を UPDATE（`name`, `buyer_no`）、メール変更 = 既存の `participant_contacts` 行を閉じ（`valid_to`）＋新しい行を追加; 変更前／変更後を監査。
> - エラー: `E-PTY-001..004`、`E-PTY-021`、`E-PTY-010`、`E-CMN-008`（version 不一致）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string[]` | `closedContactIds` | 監査記録のために閉じたメール行 |

### 2.3. `changeDeposit`

| Return type | Function name |
|---|---|
| `Promise<Result<{ deposit: DepositRow; limitAfter: number \| null; limitMode: LimitMode }>>` | `changeDeposit` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | STL-HEAD のみ（または代行）、step-up MFA が有効であること — Q-PTY-06 |
| `string` | `participantId` | |
| `{ depositJpy: number; effectiveFrom: string (YYYY-MM-DD); reason: string }` | `input` | |

**Function description**

> - STL-HEAD の役割と MFA step-up を確認（Q-PTY-06 【顧客（模擬）、2026-11-25】: 照合事務局は自分では変更できない。一段階、確認者なし、監査あり）。`fn_participant_deposit_change` を呼び出す: `participant_deposit_history` に INSERT（追記のみ）＋ `audit_logs` の変更前／変更後。売買参加者で `DEPOSIT` の場合は `limitAfter = depositJpy` を返す。`INDIVIDUAL` の場合は上限を据え置いて返す。
> - エラー: `E-PTY-005..008`、`E-PTY-022`、`E-PTY-010`、`E-CMN-002`、`E-CMN-005`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `LimitMode` | `limitMode` | ダイアログ内の参加上限の説明文を決める（顧客 #20） |

### 2.4. `createPermitRequest` (許可)

| Return type | Function name |
|---|---|
| `Promise<Result<PermitRequest>>` | `createPermitRequest` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | 起票者: SETTLE（`NEW`, `RENEW`）または STL-HEAD（`SUSPEND`, `RESUME`, `REVIEW_START`, `REINSTATE`） |
| `string` | `participantId` | 仲卸であること |
| `{ kind: PermitRequestKind; payload: PermitRequestPayload; reason: string }` | `input` | |

**Function description**

> - `fn_permit_request_create` を呼び出す（SPEC-PTY_PERMIT_LIFECYCLE-001 §4.2）。申請を `ENTERED` / `PROPOSED` として返す。
> - エラー: `E-PTY-007`, `-009`, `-010`, `-011`, `-013`, `-014`, `-018`, `-019`, `-020`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `PermitRequestKind` | `kind` | `payload` 用の zod スキーマを選ぶ |

### 2.5. `transitionPermitRequest` (許可)

| Return type | Function name |
|---|---|
| `Promise<Result<{ request: PermitRequest; permit?: Permit; events?: PermitEvent[] }>>` | `transitionPermitRequest` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | `DECIDE` には有効な MFA が必要 |
| `string` | `requestId` | |
| `{ action: 'PROPOSE' \| 'DECIDE' \| 'REJECT'; reviewResult?: string; reviewedOn?: string; permitConditions?: string; comment?: string }` | `input` | `PROPOSE` は `NEW` のみ（審査 + 起案） |

**Function description**

> - `PROPOSE` → `fn_permit_request_propose`; `DECIDE` → MFA を確認してから `fn_permit_request_decide`; `REJECT` → `fn_permit_request_reject`（SPEC-PTY_PERMIT_LIFECYCLE-001 §4.3–4.5）。
> - エラー: `E-PTY-012`, `-013`, `-015`, `-017`, `-023`, `E-CMN-005`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `mfaFresh` | トランザクションを開く前の step-up 確認結果（10 分、無操作 3 分） |

### 2.6. `createApprovalRequest` (承認)

| Return type | Function name |
|---|---|
| `Promise<Result<ApprovalRequest>>` | `createApprovalRequest` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | 起票者: SETTLE（`NEW`, `RENEW`）または STL-HEAD（起案の種別）。`LIMIT_CHANGE`: STL-HEAD のみ＋step-up MFA、一段階（Q-PTY-06） |
| `string` | `participantId` | 売買参加者であること |
| `{ kind: ApprovalRequestKind; payload: ApprovalRequestPayload; reason: string }` | `input` | |

**Function description**

> - `fn_approval_request_create` を呼び出す（SPEC-PTY_APPROVAL_LIFECYCLE-001 §4.2）。2.4 とは別の関数で、コードパスを共有しない（ADR-003）。
> - `kind = LIMIT_CHANGE` → `fn_approval_limit_change` を呼び出す（§4.2b）: 即時適用し、`ApprovalRequest` の代わりに `{ limitChange }` を返す。待機中の申請は作らない。
> - エラー: `E-PTY-006`, `-007`, `-009`, `-010`, `-011`, `-013`, `-014`, `-016`, `-018`, `-019`, `-020`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `number \| null` | `oldLimitJpy` | `LIMIT_CHANGE`: `LIMIT_CHANGED.old_limit_jpy` に記録（NULL = 保証金に連動） |

### 2.7. `transitionApprovalRequest` (承認)

| Return type | Function name |
|---|---|
| `Promise<Result<{ request: ApprovalRequest; approval?: Approval; event?: ApprovalEvent }>>` | `transitionApprovalRequest` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | |
| `string` | `requestId` | |
| `{ action: 'DECIDE' \| 'REJECT'; comment?: string }` | `input` | `PROPOSE` はない（承認には独自の審査がない） |

**Function description**

> - `DECIDE` → MFA → `fn_approval_request_decide`; `REJECT` → `fn_approval_request_reject`（SPEC-PTY_APPROVAL_LIFECYCLE-001 §4.3–4.4）。
> - エラー: `E-PTY-012`, `-013`, `-017`, `-023`, `E-CMN-005`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| | | |

### 2.8. `expireDueQualifications` (job)

| Return type | Function name |
|---|---|
| `Promise<{ permitsExpired: number; approvalsExpired: number }>` | `expireDueQualifications` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `string (YYYY-MM-DD)` | `businessDate` | 業務日を開いた直後（業務日を開く関数から呼び出し、ADR-005 §2.4） |

**Function description**

> - `fn_permit_expire_due` → `fn_approval_expire_due` の順に呼び出す（トランザクションは別々 — 一方のエラーが他方を止めない）。エラー → `ERROR` ログ＋アラーム、外へ投げない（業務日を開くのを止めない）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `number` | `permitsExpired` | `INFO` ログと監査の合計に記録 |

---

## 3. エラーコード一覧 `E-PTY`

| コード | HTTP | メッセージ（JP） | 意味 | 使用箇所 |
|---|---|---|---|---|
| E-PTY-001 | 422 | 名称は1〜100文字で入力してください | 名称が空／長すぎ | SC-01-02 [4]; API-PTY-002 |
| E-PTY-002 | 422 | 買受人番号は英大文字・数字1〜10文字で入力してください | 買受人番号の形式不正 | [5]; API-PTY-002 |
| E-PTY-003 | 409 | この買受人番号は既に使われています | 買受人番号が重複 | [5]; API-PTY-002 |
| E-PTY-004 | 422 | メールアドレスの形式が正しくありません | メールの形式不正 | [6] [7]; API-PTY-002 |
| E-PTY-005 | 422 | 保証金額は0以上の整数で入力してください | 保証金が不正 | 9.1; API-PTY-003 |
| E-PTY-006 | 422 | 発効日は本日（業務日）以降の日付を入力してください | 発効日が過去 | 9.2; API-PTY-003, -006 |
| E-PTY-007 | 422 | 理由を入力してください | 理由なし | 9.3; API-PTY-003, -004, -006 |
| E-PTY-008 | 409 | 同じ発効日の保証金変更が既にあります | 保証金の発効日が重複 | API-PTY-003 |
| E-PTY-009 | 409 | この種別では許可（承認）を登録できません | 許可／承認の対象外の参加者種別 | API-PTY-002, -004, -006 |
| E-PTY-010 | 409 | この参加者は退会済みのため変更できません | 参加者が退会済み | API-PTY-002..007 |
| E-PTY-011 | 409 | 処理中の申請があります。完了または却下の後に操作してください | 申請が既に開いている | API-PTY-004, -006 |
| E-PTY-012 | 403 | 申請者・起案者本人は決裁（確認）できません | 起票者による自己決裁 | API-PTY-005, -007 |
| E-PTY-013 | 409 | この状態からは指定の操作はできません | 状態遷移が不正（FIG-010）、**失効済みの許可／承認に対する `RENEW` も含む**（`detail.nextAction = "REVIEW_START"` — Q-PTY-04、猶予なし） | API-PTY-004..007 |
| E-PTY-014 | 422 | 新しい失効日は現在の失効日より後の日付にしてください | 有効中の資格で `newValidTo ≤ valid_to` の更新（失効済みは `E-PTY-013`） | API-PTY-004, -006 |
| E-PTY-015 | 422 | 審査結果を入力してください | 審査結果なし（許可） | API-PTY-005 |
| E-PTY-016 | 422 | 参加上限は1円以上で入力するか、「保証金額に連動」を選んでください | 参加上限が不正／変更なし | API-PTY-006 |
| E-PTY-017 | 409 | この申請は既に処理済み、または処理できる段階ではありません | 申請が終了済み／段階不適合 | API-PTY-005, -007 |
| E-PTY-018 | 404 | 参加者が見つかりません | 見つからない | API-PTY-001..006 |
| E-PTY-019 | 409 | 許可番号（承認番号）が既に使われています | 許可／承認番号が重複 | API-PTY-004, -006 |
| E-PTY-020 | 422 | 有効期間の終了日は開始日以降にしてください | 有効期間が不正 | API-PTY-004, -006 |
| E-PTY-021 | 422 | 同じメールアドレスは2件登録できません | メールが2件重複 | [7]; API-PTY-002 |
| E-PTY-022 | 422 | 現在の保証金額と同じです | 保証金が変更なし | 9.1; API-PTY-003 |
| E-PTY-023 | 422 | 却下理由を入力してください | 却下理由なし | API-PTY-005, -007 |
| E-PTY-024 | 404 | 申請が見つかりません | 許可／承認の申請が見つからない | API-PTY-005, -007 |

### 3.1 完了条件（LAB-5）

- **2.1–2.2:** (a) 仲卸は `permit` ブロック、売買参加者は `approval` ブロックを返し、共通ブロックはない。(b) 二台の端末から同時に編集 → 後の端末は 409 `E-CMN-008`。
- **2.3 `changeDeposit`:** (a) SETTLE が呼ぶ → 403 `E-CMN-002`; STL-HEAD で step-up が切れている → 403 `E-CMN-005`; (b) 有効な STL-HEAD → `participant_deposit_history` に 1 行、`audit_logs` に 1 行を追加、既存行は残す; (c) `DEPOSIT` → `limitAfter = depositJpy`; `INDIVIDUAL` → 上限は据え置き; (d) `effectiveFrom` < 業務日 → 422 `E-PTY-006`。
- **2.4–2.5 (許可) と 2.6–2.7 (承認):** 二つの関数、二つの申請テーブル、`trade` 側の資格エラー二種（`E-TRD-005` 許可 / `E-TRD-006` 承認）。詳細条件は [PTY_PERMIT_LIFECYCLE §5](../technical-design/PTY_PERMIT_LIFECYCLE_TECH.md#5-その他の注記) と [PTY_APPROVAL_LIFECYCLE §5](../technical-design/PTY_APPROVAL_LIFECYCLE_TECH.md#5-その他の注記)。
- **2.6 `LIMIT_CHANGE`:** STL-HEAD + MFA → 201 `limitChange`、`old_limit_jpy` / `new_limit_jpy` / `effective_on` を持つ `LIMIT_CHANGED` が正確に 1 行、`baibai_approval_requests` には行なし; SETTLE が送信 → 403。
- **2.8 job:** 同じ日に二回実行 → 二回目は `EXPIRED` を追加で生成しない。

共通コード `E-CMN-001..008`（日本語メッセージは一本化、HTTP、クライアントの扱い）: [`_common/error-codes.md`](../../_common/error-codes.md)。エラーボディ、MFA、楽観的ロック: [`_common/api-conventions.md`](../../_common/api-conventions.md)。
