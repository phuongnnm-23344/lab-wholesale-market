---
id: SPEC-RULE_FUNC-001
title: 機能仕様書 — モジュール rule（規程の版、確認者、回数上限、ロールバック）
type: system
subtype: function-specifications
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: rule
related: [SPEC-RULE_VERSION-001, SPEC-SC-10-04-001, SPEC-RULE_API-001, SPEC-RULE_API-002, SPEC-RULE_API-003, SPEC-RULE_API-004, SPEC-RULE_API-005, SPEC-RULE_API-006, SPEC-RULE_DB-001, ADR-006]
---

# rule — 機能仕様書

| | |
|---|---|
| モジュール / ファイル | DB: `db/functions/rule/*.sql` (schema `app`, `SECURITY DEFINER`, `search_path = app, pg_temp`) · App: `src/modules/rule/**` |
| 言語 / フレームワーク | PL/pgSQL (PostgreSQL 16) · TypeScript / Next.js 16 route handler, zod |

ブロック R1–R7 = [RULE_VERSION_TECH](../technical-design/RULE_VERSION_TECH.md) の 4 章。maker 側の関数（`create_rule_version`, `save_rate_rows`, `save_rule_parameters`, `submit_rule_version`）は SC-10-02 / SC-10-03 の仕様に属する（LAB-4 では一覧レベル）ため、ここでは仕様化しない。

---

## 1. 変更履歴

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | 2.1–2.12 | 初版: DB 関数 11 件 + checker / 発効側の route handler 1 件 + エラーコード `E-RULE-001..014` | 2026-11-25 | phuongnnm-23344 | |
| 2 | Ver 0.1.1 | Update | 2.10, 2.12 | Gate 2 G2-M01: `forceReentry` を全 `confirm`（`CHANGE` / `ROLLBACK`）、`second-approval`、`APPROVED` 版の `cancel` に適用（PREMISE §3.2 ★）; `purpose` の表を操作ごとに整理 | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 関数仕様

### 2.1. `app.fiscal_year_of`

| Return type | Function name |
|---|---|
| `int` | `fiscal_year_of` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `date` | `p_day` | TC 年度に換算する日付 |

**Function description**

> - `IMMUTABLE`: 月 ≥ 4 → その日の年、それ以外 → 年 − 1。列 GENERATED `rule_versions.fiscal_year` および `payment_periods.fiscal_year` と同じ式。

| Variable type | Variable name | Role of variables |
|---|---|---|
| — | — | （なし） |

### 2.2. `app.rule_quota_used`

| Return type | Function name |
|---|---|
| `int` | `rule_quota_used` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `int` | `p_fiscal_year` | 数える TC 年度 |

**Function description**

> - R3-2: TC 年度の `APPROVED` / `ACTIVE` / `SUPERSEDED` にある `CHANGE` + `ROLLBACK` を数える; `BASELINE`、`CANCELLED`、`DRAFT`、`PENDING` は数えない。`STABLE`。判定に使う場合は advisory lock を取得した後に呼ぶ。

| Variable type | Variable name | Role of variables |
|---|---|---|
| — | — | （`SELECT count(*)` の一文） |

### 2.3. `app.can_approve_rule_version`

| Return type | Function name |
|---|---|
| `app.rule_approval_policy` (`allowed boolean`, `needs_second boolean`, `error_code text`) | `can_approve_rule_version` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `app.rule_change_kind` | `p_kind` | `CHANGE` / `ROLLBACK`（`BASELINE` はこの関数を通らない） |
| `int` | `p_used` | 確認前の used(y) |
| `text` | `p_stage` | `CHECKER` / `SECOND` |

**Function description**

> - R4、TECH の §3.2 の境界値表。リポジトリ内に **関数本体が二つ**: `can_approve_rule_version.n1.sql` と `.n2.sql`; migration では一つだけ導入する（デフォルトは N1 — Q-RULE-01）。`IMMUTABLE`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `int` | `c_quota` | 定数 4（GOV-RULE-01）— 設定からは読まない |

### 2.4. `app.rule_at`

| Return type | Function name |
|---|---|
| `uuid` | `rule_at` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `date` | `p_day` | 業務日 / 照会する期の初日 |

**Function description**

> - R6-2: `APPROVED` / `ACTIVE` / `SUPERSEDED` のうち、`effective_from` が `p_day` 以下で最大の version。`STABLE`。見つからない → システムエラー（必ず `BASELINE` がある）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| — | — | （`SELECT … ORDER BY effective_from DESC LIMIT 1` の一文） |

### 2.5. `app.rule_version_review`

| Return type | Function name |
|---|---|
| `jsonb` | `rule_version_review` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_version_id` | 閲覧中の version |

**Function description**

> - API-RULE-001 用の読み取り: version の情報、現在の `ACTIVE` version との比較（率表 2 種 + すべての `param_key`）、計算例（[15]）を `app.incentive_amount`（INC_FUNC 2.7）で 500,000 / 1,000,000 / 3,000,000 / 10,000,000 の各段階について算出、発効日に基づく TC 年度の used(y)、呼び出し者ごとの権限フラグ、ポリシー状態（現在の used による R4、ロックはしない）。読み取りのみ。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `v_base_id` | 比較対象の version = `rule_at(d_bd)` |
| `jsonb` | `v_diff` | 差分の行一覧（区分, 項目, 現在, この版） |

### 2.6. `app.confirm_rule_version`

| Return type | Function name |
|---|---|
| `jsonb` (`status`, `awaiting_second_approval`, `quota_used_after`, `fiscal_year`) | `confirm_rule_version` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_version_id` | 版 `PENDING` |
| `text` | `p_reason` | 確認者の理由 — `ROLLBACK` では必須（1..500）、`CHANGE` では任意 |

**Function description**

> - R1-2..3, R2, R3, R4 (`CHECKER`), R5-1/2. エラー: `E-RULE-001/002/003/004/005/006/007/009/013`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `app.rule_versions` | `v_row` | `FOR UPDATE` 済みの行 |
| `int` | `v_used` | advisory lock 取得後の used(y) |
| `app.rule_approval_policy` | `v_policy` | R4 の結果 |

### 2.7. `app.second_approve_rule_version`

| Return type | Function name |
|---|---|
| `jsonb` (`status`, `quota_used_after`) | `second_approve_rule_version` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_version_id` | `checker_id` を持つ版 `PENDING` |
| `text` | `p_reason` | 決裁の理由 (1..500) |

**Function description**

> - N2 の分岐でのみ有効（N1 では決裁待ちの状態が無いため常に `E-RULE-010`）。R2, R3, R4 (`SECOND`), R5-3. エラー: `E-RULE-001/004/005/007/010/011/013`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `int` | `v_used` | used(y) — 決裁時点で再検査 |

### 2.8. `app.return_rule_version`

| Return type | Function name |
|---|---|
| `jsonb` (`status`) | `return_rule_version` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_version_id` | 版 `PENDING` |
| `text` | `p_reason` | 差戻しの理由 (1..500) |

**Function description**

> - R7-1: `PENDING` → `DRAFT`、`checker_id` を削除; maker へ通知。エラー: `E-RULE-001/002/003/007`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| — | — | （主要な変数なし） |

### 2.9. `app.request_rule_version_cancel`

| Return type | Function name |
|---|---|
| `jsonb` (`requested_at`) | `request_rule_version_cancel` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_version_id` | version `APPROVED`、発効日より前 |
| `text` | `p_reason` | 理由 (1..500) |

**Function description**

> - R7-3（役割 `RULE`）: 取消依頼を記録 + 照合部門長へ通知。エラー: `E-RULE-001/007/014`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `v_open_request` | 未処理の依頼がすでにあるか |

### 2.10. `app.cancel_rule_version`

| Return type | Function name |
|---|---|
| `jsonb` (`status`, `quota_used_after`) | `cancel_rule_version` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_version_id` | 取消対象の version |
| `text` | `p_reason` | 理由 (1..500) |

**Function description**

> - R7-2（`DRAFT` / `PENDING`: maker または checker）と R7-4（`APPROVED`: checker ≠ 依頼者、未処理の依頼が必要、MFA は常に再確認 — route handler が token `RULE_CANCEL_DECIDE` を検査）。エラー: `E-RULE-001/002/007/008/012`.

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `v_requester` | 取消を依頼した者（`APPROVED` のとき）— 呼び出し者と別人でなければならない |

### 2.11. `app.activate_due_rule_versions`

| Return type | Function name |
|---|---|
| `int` (数え上げ: 今回 `ACTIVE` になった version 数) | `activate_due_rule_versions` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `date` | `p_business_date` | 開かれたばかりの業務日 |

**Function description**

> - R6-1: 業務日を開く関数（feature settle / calendar）から同一トランザクション内で呼ぶ; クライアントからは呼ばない。業務エラーは無し。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `record` | `r_due` | 期限が来た version `APPROVED`、`effective_from` の昇順で処理 |

### 2.12. `POST` route handler (TypeScript) — `src/app/api/v1/rule-versions/[versionId]/{confirm|second-approval|return|cancel-request|cancel}/route.ts`

| Return type | Function name |
|---|---|
| `Promise<NextResponse>` | `POST` (5 ファイル、共通の `runRuleVersionAction` を使用) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `NextRequest` | `request` | Body `{ reason? }`, header `X-MFA-Token?` |
| `{ params: Promise<{ versionId: string }> }` | `context` | `versionId` (uuid) |

**Function description**

> - zod で body を検査; `requireSession`; PREMISE §3.2 ★ に従う MFA: `forceReentry: true`（`X-MFA-Token` が `purpose` と一致している必要がある。step-up では代替不可）を `confirm` `CHANGE` → `RULE_CHANGE_CONFIRM`、`confirm` `ROLLBACK` → `RULE_ROLLBACK_CONFIRM`、`second-approval` → `RULE_SECOND_APPROVAL`、`APPROVED` 版の `cancel` → `RULE_CANCEL_DECIDE` に適用; `return`、`DRAFT` / `PENDING` 版の `cancel` は有効な step-up を許容; `cancel-request` は MFA なし; DB 関数 2.6–2.10 を呼ぶ; `E-RULE-*` → HTTP の対応は API-RULE-002..006 に従う。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `RuleVersionActionBody` | `body` | 検査済みの body |
| `boolean` | `forceReentry` | MFA コードの再入力を求めるか（操作 + `change_kind` / 版の状態による） |
| `string \| null` | `mfaPurpose` | `forceReentry` のとき一致しなければならない `purpose` トークン |

---

## 3. 機能のエラーコード表

| コード | HTTP | メッセージ（JP） | 意味 | 発生箇所 |
|---|---|---|---|---|
| E-RULE-001 | 404 | 指定された規則版が見つかりません。 | version が存在しない | 2.5–2.10; API-RULE-001..006 |
| E-RULE-002 | 403 | 起票者本人は確認・取消できません。 | maker が自分で確認 / 自分の版を取消（S4） | 2.6, 2.8, 2.10; API-RULE-002, 004, 005 |
| E-RULE-003 | 409 | この版は確認待ちではありません（現在: {status}）。 | 確認 / 差戻しに対して状態が不正 | 2.6, 2.8; API-RULE-002, 004 |
| E-RULE-004 | 409 | 発効日（{date}）が現在の業務日以前のため確認できません。取り消して発効日を見直してください。 | 発効日がもはや将来でない | 2.6, 2.7; API-RULE-002, 003 |
| E-RULE-005 | 409 | 同じ発効日（{date}）の版がすでに発効待ち・適用中です。 | 発効日の重複 | 2.6, 2.7; API-RULE-002, 003 |
| E-RULE-006 | 409 | 今年度の発効回数が上限（4回）に達しています。この版は確認できません。 | TC 年度あたり 4 回の上限超過 | 2.6; API-RULE-002 |
| E-RULE-007 | 422 | 理由を入力してください（500文字以内）。 | 理由の欠落 / 長すぎる | 2.6–2.10; API-RULE-002..006 |
| E-RULE-008 | 409 | この版は取り消せません（発効日以降、または取り消せない状態です）。 | 取消の状態不正 / 期限超過 | 2.10; API-RULE-005 |
| E-RULE-009 | 409 | 4回到達後のロールバックは確認できません。誤った率で計算された期は修正申請「奨励金」で訂正してください。 | N1: 4 回到達時のロールバックを阻止 | 2.6; API-RULE-002 |
| E-RULE-010 | 409 | この版は運用部門長の決裁待ちではありません。 | 決裁の呼び出しが状態不正 / N1 分岐 | 2.7; API-RULE-003 |
| E-RULE-011 | 403 | 起票者・確認者は決裁できません。別の運用部門長が決裁してください。 | N2: 決裁者が maker / checker と重複 | 2.7; API-RULE-003 |
| E-RULE-012 | 409 | 起票者からの取消依頼がないため、発効待ちの版は取り消せません。 | 依頼が無いまま `APPROVED` 版を取消 | 2.10; API-RULE-005 |
| E-RULE-013 | 409 | 交付率表またはパラメータに不備があります（{detail}）。差し戻してください。 | version の内容が無効 | 2.6, 2.7; API-RULE-002, 003 |
| E-RULE-014 | 409 | この版は取消依頼できません（発効待ちでない、またはすでに依頼済みです）。 | 取消依頼の状態不正 / 重複 | 2.9; API-RULE-006 |

共通エラーコード `E-CMN-001..008`（JP メッセージ 1 種、HTTP、クライアントの扱い）: [`_common/error-codes.md`](../../_common/error-codes.md)。エラー body、MFA、楽観ロック: [`_common/api-conventions.md`](../../_common/api-conventions.md)。
