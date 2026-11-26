---
id: SPEC-INC_FUNC-001
title: 機能仕様書 — モジュール incentive（期、入金の配分、完納奨励金、期ロック）
type: system
subtype: function-specifications
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: incentive
related: [SPEC-INC_ENGINE-001, SPEC-SC-09-04-001, SPEC-INC_API-001, SPEC-INC_API-002, SPEC-INC_API-003, SPEC-INC_API-004, SPEC-INCENTIVE_DB-001, SPEC-BILLING_DB-001, ADR-007]
---

# incentive — 機能仕様書

| | |
|---|---|
| モジュール / ファイル | DB: `db/functions/incentive/*.sql` (schema `app`, `SECURITY DEFINER`, `search_path = app, pg_temp`) · App: `src/modules/incentive/**` (route handler + service) |
| 言語 / フレームワーク | PL/pgSQL (PostgreSQL 16) · TypeScript / Next.js 16 route handler, zod |

規約: 書き込み関数は `EXECUTE` を持つアプリ role でのみ実行; すべての書き込み関数は最初に `app.assert_caller(...)` を呼ぶ（ADR-002 §2.1）。複合型（`composite type`）は関数と同じ migration ファイルで宣言する。K1–K9 ブロック = [INC_ENGINE_TECH](../technical-design/INC_ENGINE_TECH.md) の 4 章; 本ファイルは **関数シグネチャ、パラメータ、意味のある変数のみ** を記す（BM-2-901-53 / 54 の境界）。

---

## 1. 変更履歴

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | 2.1–2.13 | 初版: DB 関数 12 件 + engine 完納奨励金の route handler 1 件 + 画面 SC-09-04 + エラーコード `E-INC-001..013` | 2026-11-25 | phuongnnm-23344 | |
| 2 | Ver 0.1.1 | Update | — | 顧客 Q-INC-02: 2.1 を奨励金計算期で絞り込み（締め済みの期の GD 後入力は開いている期へ移す）; Q-INC-01: 2.3 の paid_on = 入金日（CSV）、2.12 / 2.13 は `paymentCsvImportConfirmed` をチェック、エラーコード E-INC-014 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 関数仕様

### 2.1. `app.incentive_collect_inputs`

| Return type | Function name |
|---|---|
| `SETOF app.incentive_input_row` (`source`, `ref_id`, `period_id`, `participant_id`, `tax_rate_id`, `amount_jpy`, `is_on_time`, `created_at`) | `incentive_collect_inputs` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | 収集する期 P |
| `boolean` | `p_include_candidates` | `true` → 締め後に変更があった締め済みの期 Q の入力も追加する（K1-4） |

**Function description**

> - 有効な取引（`v_trade_effective`）のうち、奨励金計算期 = P のもの（`incentive_period_id = P`、または NULL かつ `trade_date` ∈ P — 締め済みの期の GD 後入力は開いている期へ移る、TECH §3.4 / Q-INC-02）、`trade_adjustments.period_id = P`、`payment_allocations.period_id = P`、決裁済みの修正申請 KANNO / INCENTIVE を読む; `STABLE`、書き込みなし。
> - エラー: P が存在しない → `E-INC-001`; P が `LOCKED` → `E-INC-002`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `app.payment_periods` | `v_period` | `trade_date` を絞り込むための `start_date` / `end_date` の境界 |
| `uuid[]` | `v_candidate_ids` | 作成日時 `created_at > Q.locked_at` の入力を持つ締め済みの Q の一覧（調整、配分、修正申請 KANNO / INCENTIVE — GD 後入力は**含まない**） |

### 2.2. `app.incentive_input_hash`

| Return type | Function name |
|---|---|
| `char(64)` | `incentive_input_hash` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | 期 P |

**Function description**

> - 2.1 の入力の `jsonb_agg`（`source`, `ref_id` で並べ替え）+ P と各 Q の `rule_version_id` の SHA-256（hex）を返す。同じ入力 → 同じコード（DoD K1）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `text` | `v_canonical` | `digest(..., 'sha256')` に渡す正規化済みの JSON 文字列 |

### 2.3. `app.allocate_payment_fifo`

| Return type | Function name |
|---|---|
| `SETOF app.payment_allocations` | `allocate_payment_fifo` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_payment_id` | 今入力された入金の行（`participant_id` あり） |

**Function description**

> - K2: 請求番号（E-02 が有効なとき）で配分、または未払いの最も古い期から FIFO で配分; 余剰金 → 最も古い `OPEN` の期; `is_on_time = paid_on ≤ due_date` を記録 — `paid_on` は銀行 CSV の入金日であり、取込日ではない（Q-INC-01）。CSV 取込関数（SC-09-01）および、支払者コードの対応付けを修正した時（SC-09-02）から呼ばれる。追記のみ。
> - `participant_id` が NULL → 空を返す（エラーなし）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `bigint` | `v_remaining` | 入金のうち未配分の残額 |
| `record` | `r_period` | 検討中の未払いの期（FIFO の周回） |
| `bigint` | `v_outstanding` | BILLING_DB 4.48 の定義による `r_period` の未払い残高 |

### 2.4. `app.period_payable`

| Return type | Function name |
|---|---|
| `app.payable_row` (`participant_id`, `amount_excl_jpy`, `tax_jpy`, `amount_incl_jpy`, `tax_lines jsonb`) | `period_payable` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | 期 X |
| `uuid` | `p_participant_id` | 購入者（NULL = 全員） |
| `boolean` | `p_after_lock` | `true` → `locked_at` より後に書き込まれた入力も含める（K6 で使用） |

**Function description**

> - K3-1: B = Σ 税率ごと（S_excl + ROUND(S_excl × 税率)）、期の版の `TAX_ROUNDING` を使用。義務の通知（SC-09-B1）とエンジンで共通利用。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `text` | `v_rounding` | 期の版の `TAX_ROUNDING` の値（デフォルト `FLOOR`） |

### 2.5. `app.kanno_status`

| Return type | Function name |
|---|---|
| `app.kanno_row` (`status` `OK`/`NG`/`SUSPECT`, `kanno boolean`, `basis app.kanno_basis`, `shortfall_jpy bigint`, `note text`) | `kanno_status` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `bigint` | `p_payable_incl` | B |
| `bigint` | `p_paid_on_time` | OT |
| `bigint` | `p_fee_suspect_max` | 設定ファイルから読む FEE_MAX（引数で渡す、関数内ではファイルを読まない） |
| `jsonb` | `p_judgement` | `{decision, reason}` または NULL |

**Function description**

> - K3-3..5; `IMMUTABLE`。判断は `status = SUSPECT` のときのみ有効（それ以外は `E-INC-011`）; 理由が無い → `E-INC-007`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `bigint` | `v_shortfall` | s = B − OT、`SUSPECT` の分岐を決める |

### 2.6. `app.rate_tier_for`

| Return type | Function name |
|---|---|
| `TABLE(tier_no smallint, rate_bp int)` | `rate_tier_for` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_rule_version_id` | **期の**版（V_X）、現在適用中の版ではない |
| `app.participant_kind` | `p_class` | `NAKAOROSHI` / `BAIBAI` |
| `bigint` | `p_eligible_excl` | E (≥ 0) |

**Function description**

> - K4: 下限は以上、上限は未満; ちょうど 1 行に一致しない → `E-INC-010`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `int` | `v_found` | 一致した行数 — 1 以外は規程データの破損 |

### 2.7. `app.incentive_amount`

| Return type | Function name |
|---|---|
| `bigint` | `incentive_amount` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `bigint` | `p_eligible_excl` | E |
| `int` | `p_rate_bp` | ρ |

**Function description**

> - K5: `div(p_eligible_excl * p_rate_bp * 110, 1000000)`; `IMMUTABLE`, `STRICT`。ローカル変数なし。

| Variable type | Variable name | Role of variables |
|---|---|---|
| — | — | （なし） |

### 2.8. `app.compute_delta_rows`

| Return type | Function name |
|---|---|
| `SETOF app.incentive_result_draft` (`incentive_results` の列と同じ、ただし `id`, `run_id`, `created_at` を除く) | `compute_delta_rows` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | 計上する期 P |
| `uuid[]` | `p_candidate_ids` | 2.1 の Q |

**Function description**

> - K6: 各 Q を V_Q で全件再計算し、完納（KANNO を除く）を保持、固定の C_INC を加算、R と比較、修正申請「新規」ごとに行を分ける。`STABLE`、書き込みなし。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `v_kanno_q` | K' — Q の再計算に使う完納 |
| `bigint` | `v_recorded` | R(i, Q) |
| `bigint` | `v_recomputed` | I'(i, Q)、C_INC を含む |
| `bigint` | `v_residual` | 修正申請が紐づかない D の部分 → `correction_id` の無い行 |

### 2.9. `app.compute_carry_rows`

| Return type | Function name |
|---|---|
| `SETOF app.incentive_result_draft` | `compute_carry_rows` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | 期 P |
| `app.incentive_result_draft[]` | `p_rows` | P の MAIN + DELTA を計算したもの |

**Function description**

> - K7: テーブルに既にある P に CARRY を加算し、`CARRY`（期 P+1）または `CARRY_EXPIRED`（P が 3 月）の行を返す。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `bigint` | `v_sum` | 期 P にいる人の合計 Σ |
| `uuid` | `v_chain_origin` | マイナスの連鎖の起点となる `ref_period_id` |

### 2.10. `app.compute_period_incentives`

| Return type | Function name |
|---|---|
| `app.incentive_computation` (`input_hash`, `rows incentive_result_draft[]`, `suspects jsonb`, `warnings jsonb`, `totals jsonb`) | `compute_period_incentives` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | 期 P |
| `jsonb` | `p_judgements` | マップ `participant_id → {decision, reason}` |
| `text` | `p_mode` | `PREVIEW` / `LOCK`（LOCK では判断が全件揃っていること必須） |

**Function description**

> - TECH の §3.3 の順序に従い K1 → K3 → K4 → K5 → K6 → K7 を調整する純粋な関数。テーブルへの書き込みなし。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `bigint` | `v_fee_max` | `app.config_value('KANNO_FEE_SUSPECT_MAX_JPY')` から一度だけ読む FEE_MAX |

### 2.11. `app.preview_incentives`

| Return type | Function name |
|---|---|
| `jsonb` (2.10 の結果 + `diff_from_previous`) | `preview_incentives` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | 期 P（`OPEN`） |
| `jsonb` | `p_judgements` | 下書きの判断（空でもよい） |

**Function description**

> - K8-10: `assert_caller('SETTLE' または STL_HEAD)`; 2.10 を `PREVIEW` モードで呼ぶ; `audit_logs` に `INCENTIVE_PREVIEW` を**1 行**記録; 直前の試算行との差分を計算（K9-4）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `jsonb` | `v_prev` | 期 P の直前の `INCENTIVE_PREVIEW` 行のペイロード |

### 2.12. `app.lock_period`

| Return type | Function name |
|---|---|
| `jsonb` (`run_id`, `locked_at`, `totals`, `next_period_id`) | `lock_period` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_period_id` | 期 P |
| `char(64)` | `p_expected_input_hash` | 利用者が確認した試算のハッシュ — 現在と異なる → `E-INC-008` |
| `jsonb` | `p_judgements` | `SUSPECT` の全行に対する最終判断 |
| `int` | `p_ack_warning_count` | 利用者が確認した ⚠ 警告の件数 — 異なる → `E-INC-013` |
| `boolean` | `p_payment_csv_confirmed` | 「支払期日分までの入金CSV取込済」のチェック — `true` でなければ → `E-INC-014`（Q-INC-01） |

**Function description**

> - K8-2..9 を呼び出し元のトランザクション内で: P の行をロック、条件を検査（`E-INC-002/003/004/005/009/014`）、2.10 の `LOCK` を呼ぶ、`period_billings`（LOCK）、`incentive_runs`（`payment_csv_confirmed_at`、`payment_csv_latest_paid_on` を含む）、`incentive_results`、端数調整、`LOCKED`、次の期、`notifications`、`audit_logs` を書く。MFA は route handler が検証し `app.mfa_verified_at` に記録済み; 本関数はその時刻が 60 秒以内であることを検査（超えていればコードの再入力を求める）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `app.payment_periods` | `v_period` | `FOR UPDATE NOWAIT` でロックした P の行 |
| `app.incentive_computation` | `v_calc` | 書き込み用の純粋関数の結果 |
| `uuid` | `v_run_id` | 全結果行に付ける `incentive_runs.id` |

### 2.13. `lockPeriodRoute` (TypeScript)

| Return type | Function name |
|---|---|
| `Promise<NextResponse>` | `POST` (file `src/app/api/v1/periods/[periodId]/lock/route.ts`) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `NextRequest` | `request` | API-INC-003 に従う body |
| `{ params: Promise<{ periodId: string }> }` | `context` | `periodId` (uuid) |

**Function description**

> - zod で body を検査; セッションを取得（`requireSession`）、ヘッダー `X-MFA-Token` を `iam.consumeMfaToken(session, token, "PERIOD_LOCK")` で消費（ワンタイムトークン — api-conventions §4）; トランザクションを開き、`set_config` でコンテキストを設定、`app.lock_period` を呼ぶ; RPC エラー `E-INC-*` → HTTP を API-INC-003 に従って対応付け; `mfa_code` はログに出さない。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `LockPeriodBody` | `body` | 検査済みの body（`expectedInputHash`, `judgements`, `ackWarningCount`, `paymentCsvImportConfirmed`; ヘッダー `X-MFA-Token`） |
| `SessionContext` | `session` | 人、端末、役割 — `set_config` に渡す |

---

## 3. 機能のエラーコード表

| コード | HTTP | メッセージ（JP、画面に表示） | 意味 | 発生箇所 |
|---|---|---|---|---|
| E-INC-001 | 404 | 指定された期が見つかりません。 | 期が存在しない | 2.1; API-INC-001..004 |
| E-INC-002 | 423 | この期は期ロック済みです。訂正は修正申請で行い、差額は次の期ロックで計上されます。 | 期がロック済み | 2.1, 2.12; API-INC-002, 003 |
| E-INC-003 | 409 | 前の期（{period}）がまだ期ロックされていません。古い期から順にロックしてください。 | ロックの順序が不正 | 2.12; API-INC-003 |
| E-INC-004 | 409 | 支払期日（{due_date}）を過ぎていないため期ロックできません。 | 支払期日を過ぎていない | 2.12; API-INC-003 |
| E-INC-005 | 409 | 締めが済んでいない業務日が {count} 日あります。日次締めを先に行ってください。 | 未締めの日がある | 2.12; API-INC-003 |
| E-INC-006 | 422 | 要確認の判断が入力されていない買受人が {count} 件あります。 | 判断が不足 | 2.10; API-INC-003 |
| E-INC-007 | 422 | 判断の理由を入力してください（500文字以内）。 | 理由の欠落 / 長すぎる | 2.5; API-INC-002, 003 |
| E-INC-008 | 409 | 試算後に入金・訂正などの入力が変わりました。もう一度試算してから期ロックしてください。 | 試算の後に入力が変わった | 2.12; API-INC-003 |
| E-INC-009 | 409 | 他の利用者がこの期を処理中です。しばらくしてから再度お試しください。 | 別のロック処理が進行中 | 2.12; API-INC-003 |
| E-INC-010 | 500 | 適用規則版の交付率表に不備があります。システム管理者に連絡してください。 | 規程データ / 移行済みの期のデータが破損 | 2.6, 2.8; API-INC-002, 003 |
| E-INC-011 | 422 | 要確認ではない買受人に判断が指定されています。 | 判断の対象が不正 | 2.5; API-INC-002, 003 |
| E-INC-012 | 404 | この期の確定結果はまだありません（期ロック前）。 | 確定結果がまだ無い | API-INC-004 |
| E-INC-013 | 409 | 確認が必要な注意事項が {count} 件あります。内容を確認してから期ロックしてください。 | ⚠ 警告件数が変わった | 2.12; API-INC-003 |
| E-INC-014 | 422 | 支払期日分までの入金CSVの取込を確認し、チェックを入れてください。 | 「支払期日分までの入金CSV取込済」が未チェック (Q-INC-01) | 2.12; SC-09-04 [17]; API-INC-003 |

共通エラーコード `E-CMN-001..008`（JP メッセージ 1 種、HTTP、クライアントの扱い）: [`_common/error-codes.md`](../../_common/error-codes.md)。エラー body、MFA、楽観ロック: [`_common/api-conventions.md`](../../_common/api-conventions.md)。
