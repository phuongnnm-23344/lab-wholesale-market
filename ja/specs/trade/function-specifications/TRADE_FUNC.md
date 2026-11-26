---
id: SPEC-TRADE_FUNC-001
title: Module trade — Function Specifications
type: system
subtype: function-specifications
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: trade
related: [SPEC-SC-04-01-001, SPEC-SC-05-02-001, SPEC-TRADE_QUALIFICATION_CHECK-001, SPEC-TRADE_AITAI_CONFIRM-001, SPEC-TRADE_SERI_CONFIRM-001, SPEC-TRADE_SAME_DAY_FIX-001, API-TRD-001, API-TRD-002, API-TRD-003, API-TRD-004, API-TRD-005, API-TRD-006, API-TRD-007, API-TRD-008, SPEC-TRADE_DB-001, SPEC-ADJUST_DB-001]
---

# Module trade — Function Specifications

| | |
|---|---|
| Module / file | Route handler: `src/app/api/v1/trades/**/route.ts`, `src/app/api/v1/seri-sessions/**/route.ts` · service: `src/modules/trade/*.ts` · DB 関数: `db/functions/trade/*.sql` (schema `app`) — **PL の提案パス** |
| 言語 / フレームワーク | TypeScript 5 / Next.js App Router の route handler + zod · PL/pgSQL (PostgreSQL 16), `security definer` の関数が `assert_caller` を呼ぶ |

共通規約: [LOT_FUNC](../../lot/function-specifications/LOT_FUNC.md) と同じ（route handler → transaction 内で DB 関数を1つ → エラー `P0001 'E-TRD-xxx: detail'` を変換）。trade モジュールは購入者の資格 / 上限を **公開 view のみ** で読む（party の `v_qualification_current`, `v_buyer_period_usage`）。ロットの数量は lot の **public 関数のみ** で変更する（`fn_lot_lock_for_sale`, `fn_lot_book_quantity` — LOT_FUNC 2.9, 2.10）。

---

## 1. 変更履歴

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | 全体 (2.1–2.12) | 初期作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
| 2 | Ver 0.1.1 | Update | — | 顧客（模擬）Q-TRD-02: 2.4 で 参加上限 を 税込 で比較、E-TRD-007; Q-TRD-05: 2.9 に差し戻し / 取消 の2経路、E-TRD-015 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 関数仕様

### 2.1. `searchBuyers`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ buyers: BuyerStatus[]; overLimitReasonOptions: CodeOption[] } \| ApiError>>` | `searchBuyers` (`GET /api/v1/trades/buyers` — API-TRD-001) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Query `q`（購入者コードの先頭、1–10）, `limit`（≤ 10） |

**関数の説明**

> - 役割 TRADE。買受人 `NAKAOROSHI` / `BAIBAI` のうち `buyer_no` の先頭が一致するものを返し、各人に現在の資格を **該当する根拠ごとに** 付ける（`basis = KYOKA` は 仲卸、`SHONIN` は 売買参加者 — 「汎用の権限」欄はない）、失効日までの日数、そして 売買参加者 には 参加上限、今期の使用済み額、残額を付ける。
> - 表示 [4] と [13] を先に開くためだけに使う; 最終判断は確定時の 2.4。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `periodKey` | 期 = 開いている業務日の月（`YYYY-MM`） — 使用済みの上限を計算 |
| `CodeOption[]` | `overLimitReasonOptions` | ダイアログ [13] 用の `code_values` `OVER_LIMIT_REASON` |

### 2.2. `confirmAitaiTrade`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<AitaiConfirmResult \| ApiError>>` | `confirmAitaiTrade` (`POST /api/v1/trades/aitai` — API-TRD-002) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Body `{ lotId, buyerId, qty, unitPriceJpy, overLimitReasonCode?, overLimitNote? }` |

**関数の説明**

> - 役割 TRADE。zod: `qty` > 0 (`E-TRD-009`)、単位に応じた小数桁は **DB で検査**（クライアントは単位を送らないため）(`E-TRD-010`)、`unitPriceJpy` は整数 ≥ 1 (`E-TRD-011`)、`overLimitNote` ≤ 200。
> - `app.fn_confirm_aitai_trade`（2.3）を呼ぶ; 201 を返す。詳細: [TRADE_AITAI_CONFIRM_TECH](../technical-design/TRADE_AITAI_CONFIRM_TECH.md)。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `AitaiConfirmBody` | `body` | 検証済みのデータ |

### 2.3. `app.fn_confirm_aitai_trade`

| Return type | Function name |
|---|---|
| `jsonb` (`{trade_id, trade_no, display_no, amount_jpy, available_qty_after, over_limit}`) | `app.fn_confirm_aitai_trade` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_lot_id` | ロット |
| `uuid` | `p_buyer_id` | 購入者 |
| `numeric(12,1)` | `p_qty` | 数量 |
| `bigint` | `p_unit_price_jpy` | 単価（税抜） |
| `varchar(20)` | `p_over_limit_reason_code` | 参加上限超過の理由コード（NULL 可） |
| `varchar(200)` | `p_over_limit_note` | 備考（`OTHER` の時は必須） |

**関数の説明**

> - 1 transaction: `assert_caller(TRADE)` → 確定時刻の検査 (`E-TRD-012`) → `fn_lot_lock_for_sale` → ロットの単位に応じた小数桁 → `fn_check_buyer_qualification`（2.4）→ `INSERT trades`（`status CONFIRMED`, `channel AITAI`, `source ONLINE`, `trade_date = business_date`）→ 2.12 経由で `trade_status_history` に3行（`SUBMIT`, `APPROVE`, `CONFIRM`）→ `fn_lot_book_quantity(SALE)`。
> - 確定者のパラメータはない: `app.user_id` から取得（クライアントからは偽装できない）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `v_caller` | 入力者 = 確定者（`created_by`, `confirmed_by`） |
| `date` | `v_day` | 開いている業務日 |
| `numeric` | `v_available` | ロック時点の利用可能数量 |
| `bigint` | `v_amount` | `floor(p_qty × p_unit_price_jpy)` |
| `jsonb` | `v_qual` | 2.4 の結果（`kind`, `over_limit`, `limit`, `used`） |

### 2.4. `app.fn_check_buyer_qualification`（相対 / せり / 紙伝票後入力 / 当日訂正 で共通）

| Return type | Function name |
|---|---|
| `jsonb` (`{kind, basis, over_limit, limit_jpy, used_excl_jpy, used_incl_jpy, total_incl_jpy}`) | `app.fn_check_buyer_qualification` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_buyer_id` | 購入者 |
| `timestamptz` | `p_at` | 有効性を判定する時刻（確定時; `PAPER_LATE` の場合は伝票上の時刻 — ADR-008 §2.4-11） |
| `date` | `p_trade_date` | 取引日 — 参加上限の期を決める |
| `bigint` | `p_amount_jpy` | この取引の金額（税抜） |
| `bigint` | `p_extra_used_jpy` | 同じ回で既に加算された額（同じ購入者のそれ以前のせりの行）; 相対では 0 |
| `uuid` | `p_exclude_trade_id` | 「使用済み」から除外する取引（当日訂正の元の取引）; NULL 可 |
| `varchar(20)` | `p_reason_code` | 超過の理由（NULL 可） |
| `varchar(200)` | `p_note` | 理由の備考 |

**関数の説明**

> - 仲卸 → **許可**（`nakaoroshi_permits`）が `VALID` かつ `valid_from ≤ p_at::date ≤ valid_to` を検査、誤りなら `E-TRD-005`; 上限はない。売買参加者 → **承認**（`baibai_approvals`）を同様に検査、誤りなら `E-TRD-006`; 次に `used + extra + amount` の **税込**（= floor(Σ税抜 × (100 + 税率) / 100); 税率は `tax_rates` から、コードはパラメータ `PARTICIPATION_LIMIT_TAX_CODE` — Q-TRD-02）を、その期の参加上限と比較; 超過かつ理由なし → `E-TRD-007`; `OTHER` で備考なし → `E-TRD-008`。その他の区分 → `E-TRD-004`; 存在しない → `E-TRD-003`。
> - 書き込みはしない。詳細: [TRADE_QUALIFICATION_CHECK_TECH](../technical-design/TRADE_QUALIFICATION_CHECK_TECH.md)。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `app.participant_kind` | `v_kind` | 許可 か 承認 の分岐を選ぶ — 分岐は2つ、テーブルも2つ、エラーコードも2つ（ルール 2） |
| `bigint` | `v_limit` | 現行の参加上限（NULL → 現行の保証金） |
| `bigint` | `v_used` | `p_trade_date` の期の 相対 + せり の確定額の有効値の合計 |

### 2.5. `listTrades`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ trades: TradeListItem[]; total: number } \| ApiError>>` | `listTrades` (`GET /api/v1/trades` — API-TRD-003) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Query `dateFrom`, `dateTo`（既定は開いている日、≤ 31 日）, `channel`, `status`, `buyerNo`, `lotNo`, `mine`, `sort`, `limit`（≤ 100）, `offset` |

**関数の説明**

> - 役割 TRADE, SETTLE, STL-HEAD, OPS-HEAD。`v_trade_effective` を読む（有効値、修正を含む）— 日付範囲とページングは常に付与（M23）。SC-04-03 から呼ぶ時は既定で `channel=AITAI`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `TradeListQuery` | `query` | 検証済みの query |

### 2.6. `printTradeSlip`

| Return type | Function name |
|---|---|
| `Promise<Response>` (`application/pdf`) | `printTradeSlip` (`POST /api/v1/trades/{tradeId}/slip-prints` — API-TRD-004) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Body `{ isReissue: boolean }` |
| `{ params: { tradeId: string } }` | `ctx` | 印刷する取引 |

**関数の説明**

> - 役割 TRADE。取引は `CONFIRMED` であるか、調整があること（`CANCELLED` で取消伝票を印刷しない場合は `E-TRD-025`）。取引確認票の PDF を FORM テンプレート（module `report`）で生成し、`print_logs`（`TRADE_SLIP`）に記録; `is_reissue` は以前にログがあるかどうか — サーバーが判定し、クライアントの値は信用しない。再発行の伝票には 「再発行」 の文字; 当日訂正の後には 「訂正」 の文字。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `reissue` | `print_logs` から計算 — クライアントの `isReissue` は照合用にのみ送る |

### 2.7. `getSeriSessionForConfirm`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<SeriSessionConfirmView \| ApiError>>` | `getSeriSessionForConfirm` (`GET /api/v1/seri-sessions/{sessionId}` — API-TRD-005) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `{ params: { sessionId: string } }` | `ctx` | セッション |

**関数の説明**

> - 役割 TRADE（閲覧 + 書き込み）、SETTLE / STL-HEAD / OPS-HEAD（閲覧のみ）。セッションと行を返す; `PENDING` の行は、`No` の順に 2.4 の **preview** を実行（同じ購入者の行は `p_extra_used_jpy` を累積）、`fn_lot_lock_for_sale` はロックしないモードで実行（`v_lot_available_qty` を読む）し、`confirmable`, `notConfirmableReason`, `overLimit` を埋める。書き込みはしない。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `Map<string, number>` | `extraUsedByBuyer` | セッション内で同じ購入者の前の行の金額を累積 |

### 2.8. `confirmSeriSession`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ confirmedCount: number; cancelledTradeNos: string[]; sessionStatus: "ENTERING" \| "CONFIRMED" } \| ApiError>>` | `confirmSeriSession` (`POST /api/v1/seri-sessions/{sessionId}/confirm` — API-TRD-006) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Body `{ confirmTradeIds[], overLimitReasons, samePersonReason? }` |
| `{ params: { sessionId: string } }` | `ctx` | セッション |

**関数の説明**

> - 役割 TRADE。zod（`samePersonReason` ≤ 200、各 `note` ≤ 200）; `app.fn_confirm_seri_session`（2.9）を呼ぶ。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `SeriConfirmBody` | `body` | 検証済みのデータ |

### 2.9. `app.fn_confirm_seri_session`

| Return type | Function name |
|---|---|
| `jsonb` (`{confirmed_count, cancelled_trade_nos, session_status}`) | `app.fn_confirm_seri_session` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_session_id` | セッション |
| `uuid[]` | `p_confirm_trade_ids` | 確認者が確認する行 |
| `uuid[]` | `p_cancel_trade_ids` | 確認者が 「取消（資格なし・不成立）」 を選んだ ✖確定不可 の行 (Q-TRD-05) |
| `jsonb` | `p_over_limit_reasons` | `{tradeId: {code, note}}` |
| `varchar(200)` | `p_same_person_reason` | 確認者 = 入力者 の時の理由 |

**関数の説明**

> - セッションをロック → セッションの全ロットを `lot_id` でロック（デッドロック回避、prototype 0027）→ `PENDING` の各行を `No` の順に: 選ばれた行は 2.4 と数量を通過する必要がある、誤りなら `E-TRD-018`（1回の操作全体を rollback）; `p_cancel_trade_ids` にあり、かつ **まだ確認できない** 行 → `CANCELLED` + `CANCEL`（理由 資格なし・不成立、取消者 = 確認者）; 今は確認できる → `E-TRD-018`; どのリストにもない `PENDING` の行（✖確定不可 で処理方法を未選択のものを含む）→ `E-TRD-015`。自動で取消さない、購入者も変更しない（Q-TRD-05, ルール 3）。確認する行: `APPROVE` + `CONFIRM`、`fn_lot_book_quantity(SALE)`。詳細: [TRADE_SERI_CONFIRM_TECH](../technical-design/TRADE_SERI_CONFIRM_TECH.md)。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `app.seri_sessions%rowtype` | `v_session` | ロック済みのセッション — `ENTERING` と 入力者 を検査 |
| `jsonb` | `v_used_in_batch` | 1回の操作の中で購入者ごとに累積した金額 |
| `text[]` | `v_cancelled` | トーストに返す取消された取引番号 |

### 2.10. `app.fn_send_back_seri_results`

| Return type | Function name |
|---|---|
| `integer`（差し戻された行数） | `app.fn_send_back_seri_results` (`POST /api/v1/seri-sessions/{sessionId}/send-back` — API-TRD-007) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_session_id` | セッション |
| `uuid[]` | `p_trade_ids` | 入力者に戻す行 |
| `varchar(200)` | `p_reason` | 理由（必須 — `REJECT`） |

**関数の説明**

> - `assert_caller(TRADE)`; セッションは `ENTERING` であること（`E-TRD-013`）; 行はそのセッションの `PENDING` であること; `PENDING → DRAFT` + イベント `REJECT`（理由）; 入力者へアプリ内通知を送る（module `notify`, outbox）。数量は減算しない。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `integer` | `v_count` | 移動した行数 |

### 2.11. `app.fn_fix_trade`（当日訂正 / 取消 — SC-04-05, API-TRD-008）

| Return type | Function name |
|---|---|
| `jsonb` (`{fix_id, adjustments[], needs_settle_review, display_no}`) | `app.fn_fix_trade` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_trade_id` | 元の取引 |
| `app.fix_kind` | `p_kind` | `FIX` / `CANCEL` |
| `uuid` | `p_new_buyer_id` | 修正後の購入者（NULL = 変更なし; `CANCEL` の時は無視） |
| `numeric(12,1)` | `p_new_qty` | 修正後の数量 |
| `bigint` | `p_new_unit_price_jpy` | 修正後の単価 |
| `varchar(20)` | `p_reason_code` | `FIX_REASON` |
| `varchar(200)` | `p_reason_note` | `OTHER` の時は必須 |
| `varchar(20)` | `p_over_limit_reason_code` | 新しい購入者 / 新しい数量が参加上限を超える場合 |
| `varchar(200)` | `p_over_limit_note` | |

**関数の説明**

> - 元の取引の日付は `OPEN` であること（そうでなければ `E-CMN-003`、クライアントは内容を SC-08-01 に持ち越す）。取引は `CONFIRMED` であること、未処理の 修正申請 がないこと。`trade_fixes` と `trade_adjustments` を作成（REVERSE = 現在の有効値、DELTA = 新しい値; `CANCEL` には DELTA がない）し、数量台帳に `SALE_REVERSE` / `SALE` を記録。**元の取引の数値は UPDATE しない**（ルール 4）。詳細: [TRADE_SAME_DAY_FIX_TECH](../technical-design/TRADE_SAME_DAY_FIX_TECH.md)。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `record` | `v_effective` | `v_trade_effective` の現在の有効値（前回の修正を含む） |
| `bigint` | `v_max_buyer_diff_incl` | 1人の購入者の最大の変動額（税込）— しきい値 `CORR_TWO_LEVEL_THRESHOLD_JPY` と比較 |
| `boolean` | `v_buyer_changed` | 購入者の変更 → 常に 照合 確認済 が必要 |

### 2.12. `app.fn_record_trade_event`（内部）

| Return type | Function name |
|---|---|
| `void` | `app.fn_record_trade_event` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_trade_id` | 取引 |
| `app.trade_event` | `p_event` | `SUBMIT` · `APPROVE` · `REJECT` · `CONFIRM` · `FIX` · `CANCEL` · `CORRECTION_APPLIED` |
| `app.trade_status` | `p_from`, `p_to` | 変更前 / 変更後の状態 |
| `varchar(200)` | `p_reason` | `REJECT`, `CANCEL` の時は必須 |

**関数の説明**

> - `trade_status_history` に1行追加（人 = `app.user_id`, 端末 = `app.device_id`）; このテーブルへ書き込む唯一の場所。UI 上の `APPROVE` イベントの表示ラベルは 「確認」 とし、「承認」 は使わない (L4-D03)。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `v_device` | `app.device_id` の端末（PRM-114 (a)） |

---

## 3. モジュールのエラーコード、質問、前提

> この節は **様式 BM-2-901-54 にはない** — LAB-4 P3 のブリーフに従い追加; 一覧は [`_common/error-codes.md`](../../_common/error-codes.md)。共通コード `E-CMN-*` はそのファイルを参照。`E-LOT-014` は [LOT_FUNC §3](../../lot/function-specifications/LOT_FUNC.md#3-モジュールのエラーコード質問前提) を参照。

### 3.1 エラーコード `E-TRD-*`

| コード | HTTP | メッセージ（JP） | 意味 | 画面 / API |
|---|---|---|---|---|
| E-TRD-001 | 409 | ロット {lotNo} は販売公開中ではありません（{状態}） | ロットが販売中の状態でない | SC-04-01 [1], SC-05-02 / API-TRD-002, 006, 008 |
| E-TRD-002 | 409 | 残数量が {n}{unit} に変わりました（不足しています） | ロットの数量が不足（C-23） | SC-04-01 [5], SC-04-05 [5] / API-TRD-002, 008 |
| E-TRD-003 | 422 | 買受人番号が見つかりません（{buyerNo}） | 購入者が存在しない | SC-04-01 [3] / API-TRD-002, 008 |
| E-TRD-004 | 422 | 買受人は仲卸または売買参加者のみ指定できます | 購入者の区分が購入できない | SC-04-01 [3] / API-TRD-002, 008 |
| E-TRD-005 | 422 | 仲卸の許可が有効ではないため確定できません（{状態}・有効期限 {date}） | **許可**（仲卸）が有効でない | SC-04-01 [3], SC-05-02 [5] / API-TRD-002, 006, 008 |
| E-TRD-006 | 422 | 売買参加者の承認が有効ではないため確定できません（{状態}・有効期限 {date}） | **承認**（売買参加者）が有効でない | SC-04-01 [3], SC-05-02 [5] / API-TRD-002, 006, 008 |
| E-TRD-007 | 422 | 今期の参加上限を超えます。超過理由を選択してください（上限 ¥{limit} / 今期確定済 ¥{used}（税込） / 今回 ¥{amount}（税込）） | 参加上限超過で理由がない | SC-04-01 [13], SC-05-02 [4] / API-TRD-002, 006, 008 |
| E-TRD-008 | 422 | 「その他」を選んだ場合は備考を入力してください（200文字以内） | 理由の備考が未入力 | SC-04-01 [14], SC-05-02 [4], SC-04-05 [9] |
| E-TRD-009 | 422 | 数量は0より大きい値を入力してください | 数量 ≤ 0 | SC-04-01 [5], SC-04-05 [5] |
| E-TRD-010 | 422 | kg は小数第1位まで、箱・尾は整数で入力してください | ロットの単位に対して小数桁が不正 | SC-04-01 [5], SC-04-05 [5] |
| E-TRD-011 | 422 | 単価は1円以上の整数で入力してください | 単価が不正 | SC-04-01 [6], SC-04-05 [6] |
| E-TRD-012 | 409 | 取引の確定は {HH:MM} 以降にできます | 取引確定の開始時刻（規程）より前 | SC-04-01 [8], SC-05-02 [9] |
| E-TRD-013 | 409 | この回は確認待ちではありません（{状態}） | セッションは確認済み / 確認待ちではない | SC-05-02 / API-TRD-006, 007 |
| E-TRD-014 | 422 | 入力者と同じ人が確認する場合は理由を入力してください | 同一人物の確認で理由が未入力 | SC-05-02 [7] / API-TRD-006 |
| E-TRD-015 | 422 | 未処理の行があります。差し戻すか取消を選んでください（{n}件） | チェックを外して差し戻していない行、または ✖確定不可 で 差し戻し / 取消 を選んでいない行 (Q-TRD-05) | SC-05-02 [9] / API-TRD-006 |
| E-TRD-016 | 422 | 確定する行がありません | 確定する行がない | SC-05-02 [9] / API-TRD-006 |
| E-TRD-017 | 422 | 差し戻しの理由を入力してください | 差し戻しの理由が未入力 | SC-05-02 [12] / API-TRD-007 |
| E-TRD-018 | 409 | 確認中に状態が変わった行があります。一覧を更新してください（{tradeNos}） | 閲覧時と押下時の間に資格 / 数量が変わった | SC-05-02 / API-TRD-006 |
| E-TRD-019 | 409 | 確定済みの取引のみ訂正・取消できます（{状態}） | 取引が `CONFIRMED` でない | SC-04-05 / API-TRD-008 |
| E-TRD-020 | 422 | 訂正・取消の理由を選択してください | 理由が未選択 | SC-04-05 [8] / API-TRD-008 |
| E-TRD-021 | 422 | 訂正内容が変わっていません | 訂正の内容が変わっていない | SC-04-05 [11] / API-TRD-008 |
| E-TRD-022 | 409 | 引渡済数量（{n}{unit}）より少なくできません | 新しい数量 < 引渡済の数量 | SC-04-05 [5] / API-TRD-008 |
| E-TRD-023 | 404 | 対象の取引が見つかりません | 取引が存在しない | API-TRD-004, 008 |
| E-TRD-024 | 404 | 対象のせりの回が見つかりません | セッションが存在しない | API-TRD-005, 006, 007 |
| E-TRD-025 | 409 | 取消済みの取引の取引確認票は出力できません | 取消済みの取引の伝票を印刷しようとした | API-TRD-004 |
| E-TRD-026 | 409 | 引渡済のため取り消せません。差異は例外登録で処理してください | 一部引渡済のため取消不可 → SC-06-04 | SC-04-05 [12] / API-TRD-008 |
| E-TRD-027 | 409 | 修正申請の決裁待ちがあるため訂正できません | 修正申請が未決のため訂正不可 (C-27) | SC-04-05 / API-TRD-008 |

### 3.2 新しい質問 / 前提

| ID | 質問 | 暫定前提（PL） | 前提が誤っていた場合の影響 | トレース |
|---|---|---|---|---|
| Q-TRD-01 | 購入者に読み上げる取引番号の形式 | 保存は `A{YYYYMMDD}-{nnnn}` / `S{…}`; 表示は 「相対-0005」「せり-0302」（日内の連番） | 番号生成の関数と伝票テンプレートのみ変更、約0.2日 | WF SC-04-01 §6 #7, FB LAB-2 #7 |
| Q-TRD-02 | 参加上限は税抜か税込のどちらで比較するか? | **回答済み — 税込** 【顧客（模擬）、2026-11-25】: 期内の税抜合計 × 税率係数（税率は `tax_rates`、コードはパラメータ `PARTICIPATION_LIMIT_TAX_CODE`）、切り捨て; 110/100 は使わない; 画面には 税込 / 税抜 の両方を表示。まだ経理部に確認: 生鮮水産物の買受代金に適用される税率（軽減税率 8%?）、期内に税率が2つあるか | 作業見積 +0.3日（2.4 + view）。期内に税率が2つある → 税率ごとにグループ化、+0.2日 | PRM-046 |
| Q-TRD-03 | 現場プリンター: PDF を直接印刷するのはブラウザの kiosk 印刷モードか、ローカルの印刷エージェントか? | 取引台の PC でブラウザの kiosk-printing モード（エージェントは導入しない） | 印刷エージェントの場合 → 端末へのインストール部品が増える、約2日 | M05, ARCHITECTURE §9 |
| Q-TRD-04 | せりセッションに差し戻しがある場合、同じセッションを複数回に分けて確認できるか? | 可; 待ちの行がなくなった時に `CONFIRMED` | 1回で確認が必要なら → 差し戻しでセッション全体を開き直す、2.9 / 2.10 を変更 | FR-SERI-02, `seri_status` |
| Q-TRD-05 | せりの行の購入者が失効していた場合: 行を取り消す（ロットを再販売）か、入力者に購入者の修正を戻すか? | **回答済み — 両方、確認者が選ぶ** 【顧客（模擬）、2026-11-25】: 「差し戻し（番号誤り）」（`REJECT` → 入力者が勝者の番号を正しく修正）/ 「取消（資格なし・不成立）」（`CANCEL`, ロットは販売公開中に戻る）; 購入者を変えるボタンはなく、2番目の入札者を繰り上げない | テーブルは変更なし; 2.9 に `p_cancel_trade_ids` を追加 + UI のボタン2つ | 顧客 #9, BR-PERM-01, ルール 3 |
| A-TRD-01 | 相対 は一度のクリックで `SUBMIT` / `APPROVE` / `CONFIRM` を同じ人・同じ時刻で記録する | TRADE_DB 4.30 による (PRM-114 (a)) | — | FIG-012, D10 |
| A-TRD-02 | イベント `APPROVE`（FIG-012 の 「承認」）の UI / レポート上の表示は 「確認」 | L4-D03 による | 顧客が FIG-012 の語を残したい場合 → 承認（売買参加者）と区別する注記を付ける | L4-D03, ルール 2 |
