---
id: SPEC-LOT_FUNC-001
title: Module lot — Function Specifications
type: system
subtype: function-specifications
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: lot
related: [SPEC-SC-03-01-001, SPEC-SC-03-05-001, SPEC-LOT_REGISTER-001, SPEC-LOT_INSPECTION_RECORD-001, API-LOT-001, API-LOT-002, API-LOT-003, API-LOT-004, API-LOT-005, API-LOT-006, SPEC-LOT_DB-001]
---

# Module lot — Function Specifications

| | |
|---|---|
| Module / file | Route handler: `src/app/api/v1/lots/**/route.ts`, `src/app/api/v1/master/shippers/route.ts` · service: `src/modules/lot/*.ts` · DB 関数: `db/functions/lot/*.sql` (schema `app`) — **PL の提案パス**、to-be リポジトリ構築時に確定（ARCHITECTURE §12 は prototype の Next.js 構成を維持） |
| 言語 / フレームワーク | TypeScript 5 / Next.js App Router の route handler + zod · PL/pgSQL (PostgreSQL 16), `security definer` の関数が `assert_caller` を呼ぶ (MKT_DB §4.0 "Ghi") |

このファイル内のすべての関数に共通する規約:
- Route handler: セッションと役割を確認（`requireRole`）→ body を zod で検証（エラー → 422、コードは §3）→ transaction を開き、`set_config('app.user_id'|'app.device_id', …, true)` → DB 関数を **一つ** 呼ぶ → `P0001 'E-LOT-xxx: detail'` のエラーを §3 に従い HTTP に変換 (ARCHITECTURE §4.3)。
- DB 関数: ロットのテーブルへ書き込む **唯一の** 方法（アプリの DB ロールは EXECUTE 権限のみ）。エラーは `raise exception using errcode = 'P0001', message = 'E-LOT-xxx: {detail}'` の形で投げる。
- 他モジュール（trade）は 2.9, 2.10 の「public」関数のみ呼ぶ; テーブル `lots` を直接読まず、view `v_lot_available_qty` 経由で読む (ARCHITECTURE §2)。

---

## 1. 変更履歴

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | 全体 (2.1–2.10) | 初期作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
| 2 | Ver 0.1.1 | Update | — | 顧客（模擬）Q-LOT-01: 正式番号はサーバー登録時に採番、仮番号で一日中検索可能、番号は再利用しない、仮受付の取消ロットは CANCELLED で番号を保持、印刷伝票は正式番号を使用; Q-LOT-03 を終了 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 関数仕様

### 2.1. `listPendingProvisionalLots`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<PendingProvisionalLotsResponse \| ApiError>>` | `listPendingProvisionalLots` (`GET /api/v1/lots/provisional` — API-LOT-001) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | クエリなし; 業務日は `OPEN` の `business_days` から取得 |

**関数の説明**

> - 開いている業務日の `PROVISIONAL` ロットの一覧を返す（INTAKE の RLS で `lots` を読む）。`created_at` 順、受付者の名前付き。
> - `unsyncedCount` を返す = `result IN ('PENDING','HELD')` の `offline_sync_records` の件数（種別 `PROVISIONAL_LOT`）（SC-03-01 [12] で使用）。
> - データは書き込まない。INTAKE 以外の役割 → 403。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` (ISO date) | `businessDate` | 問い合わせを開いている日に限定（index `idx_lots_business_date_status`） |
| `number` | `unsyncedCount` | リンク [12] の表示 / 非表示 |

### 2.2. `registerLot`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ lotId: string; lotNo: string; status: "RECEIVED" } \| ApiError>>` | `registerLot` (`POST /api/v1/lots` — API-LOT-002) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | JSON body `RegisterLotBody`（API-LOT-002 §3） |

**関数の説明**

> - 役割 INTAKE。zod で検証: `shipperId` は uuid, `itemCode` 1–10, `unit` ∈ `KG|CASE|PIECE`, `qty` > 0 かつ `unit` に応じた小数桁（`E-LOT-003/004`）, `voucherNo` ≤ 20 文字 `[A-Za-z0-9-]`（`E-LOT-005`）, `provisionalLotId` は uuid または null, `confirmDuplicate` は boolean（既定 `false`）。
> - `app.fn_register_lot`（2.3）を一つの transaction 内で呼ぶ; 201 を返す。
> - マップ: `E-LOT-007` → 409 と `detail.duplicateLotNo`（クライアントが再確認する。ハードエラーではない）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `RegisterLotBody` | `body` | zod を通過したデータ、そのまま DB 関数へ渡す |
| `PoolClient` | `tx` | `app.user_id`, `app.device_id` を付けた transaction。DB 関数が記録者を判別するため |

### 2.3. `app.fn_register_lot`

| Return type | Function name |
|---|---|
| `jsonb` (`{lot_id, lot_no, status}`) | `app.fn_register_lot` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_provisional_lot_id` | 完了させる仮受付ロット; `NULL` = 新規ロット |
| `uuid` | `p_shipper_id` | 出荷者（使用中の `shippers` であること） |
| `varchar(10)` | `p_item_code` | 品目 |
| `app.unit_code` | `p_unit` | 単位 |
| `numeric(12,1)` | `p_qty` | 確定数量（> 0, 単位に応じた小数桁） |
| `varchar(20)` | `p_voucher_no` | 紙伝票番号（NULL 可） |
| `boolean` | `p_confirm_duplicate` | `true` = 重複の疑いの警告を無視 |

**関数の説明**

> - `assert_caller(INTAKE)`; 開いている業務日を取得; マスタを検査; 仮受付ロットの行を `FOR UPDATE` でロック（status は `PROVISIONAL` でなければならない, `E-LOT-006`）; 10 分以内の重複を検査（`p_confirm_duplicate = false` の時 `E-LOT-007`）。
> - `lots` を更新 / 追加 → `RECEIVED`; `lot_status_history` を追加; `lot_quantity_ledger` に `RECEIVE` = `p_qty` を追加; 監査は trigger で行う。手順の詳細: [LOT_REGISTER_TECH](../technical-design/LOT_REGISTER_TECH.md)。
> - クライアントのトースト表示用にロット番号を返す。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `v_caller` | 記録者（`registered_by`, `created_by`） |
| `date` | `v_day` | 開いている業務日 — `RECEIVE` の行の台帳記録日 |
| `app.lots%rowtype` | `v_lot` | ロック済みの仮受付の行。状態の検査と `qty_provisional` の取得用 |
| `text` | `v_dup_lot_no` | クライアントへ返す重複の疑いのロット番号 |

### 2.4. `searchLots`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ lots: LotListItem[]; total: number } \| ApiError>>` | `searchLots` (`GET /api/v1/lots` — API-LOT-003) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Query: `date`, `status` (csv), `itemCode`, `shipperId`, `q`（ロット番号の末尾の数字、ロット番号の全体 **または 仮番号** — Q-LOT-01）, `onSale`, `registeredBy=me`, `include`（csv `latestInspection,hasTrades`）, `sort`, `limit`（≤ 100）, `offset` |

**関数の説明**

> - すべての役割がロットを読む権限を持つ（INTAKE, JUDGE, TRADE, SETTLE, STL-HEAD, OPS-HEAD — role-list P13–P16）。RLS `role_read_matrix` による。
> - `date` の既定 = 開いている業務日; 日付の条件と `limit` は常に付与（M23）。`onSale=true` = `status = PUBLISHED` **かつ** 利用可能数量 > 0（view `v_lot_available_qty`）、この日へ持ち越されたロットを含む。
> - `include=latestInspection` は最新の `lot_inspections` の行を結合; `hasTrades` = そのロットの `trades` が存在する（view `v_trade_effective` 経由で読む）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `LotSearchQuery` | `query` | zod を通過した query; 想定外の値 → 422 `E-CMN-007` |
| `string[]` | `statuses` | FIG-011 の状態で絞り込み |

### 2.5. `recordInspections`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ count: number; batchNo: string; recordedAt: string } \| ApiError>>` | `recordInspections` (`POST /api/v1/lots/inspections` — API-LOT-004) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Body `RecordInspectionsBody`: `lotIds[]`（1–50, 重複なし）, `grade`, `note`, `secondCheckerEmployeeNo`, `rerecordReason` |

**関数の説明**

> - 役割 JUDGE。zod で長さを検査（`E-LOT-008/009/010/017`）; `app.fn_record_inspections`（2.6）を呼ぶ; 201 を返す。
> - システムが等級を自動で提案するパラメータは **ない**（ADR-010）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `RecordInspectionsBody` | `body` | 検証済みのデータ |

### 2.6. `app.fn_record_inspections`

| Return type | Function name |
|---|---|
| `jsonb` (`{count, batch_no, recorded_at}`) | `app.fn_record_inspections` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid[]` | `p_lot_ids` | 目利き担当者が選んだロット |
| `varchar(10)` | `p_grade` | 目利き担当者が押した等級（`code_values` `INSPECTION_GRADE` に含まれること） |
| `varchar(200)` | `p_note` | 所見 |
| `varchar(10)` | `p_second_checker_employee_no` | 2人目の確認者（NULL 可） |
| `varchar(200)` | `p_rerecord_reason` | 取引のあるロットの場合の理由 |

**関数の説明**

> - `assert_caller(JUDGE)`; ロットを `id` の順にロック（デッドロック回避 — prototype 0027 W12）; 状態（`E-LOT-013`）、理由（`E-LOT-011`）、2人目の確認者（`E-LOT-012`）を検査。
> - `lot_inspections` に **ロットごとに** 1行追加、同じ `batch_no`; ロット `RECEIVED` → `INSPECTED` + `lot_status_history`。1ロットでもエラーなら全件を rollback。詳細: [LOT_INSPECTION_RECORD_TECH](../technical-design/LOT_INSPECTION_RECORD_TECH.md)。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `v_batch_no` | 同じ1回の操作で記録する行をまとめる |
| `uuid` | `v_second_checker` | 社員番号の照会後の2人目のアカウント id |
| `boolean` | `v_has_trades` | 取引のあるロット → `p_rerecord_reason` が必須 |

### 2.7. `searchShippers`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<{ shippers: { id: string; code: string; name: string }[] } \| ApiError>>` | `searchShippers` (`GET /api/v1/master/shippers` — API-LOT-005) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | Query `q`（1–20 文字、コードの先頭または名前の一部に一致）, `limit`（既定 10, ≤ 20） |

**関数の説明**

> - 使用中のマスタ `shippers`（RULE_DB）を読む。並び順: コードの完全一致 → コードの先頭一致 → 名前の一致。役割 INTAKE, JUDGE（およびロット閲覧の役割）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `q` | 正規化済みの検索文字列（全角 → 半角、空白を除去） |

### 2.8. `getLotFormOptions`

| Return type | Function name |
|---|---|
| `Promise<NextResponse<LotFormOptions \| ApiError>>` | `getLotFormOptions` (`GET /api/v1/lots/form-options` — API-LOT-006) |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `Request` | `request` | パラメータなし |

**関数の説明**

> - `businessDate`（開いている業務日）, `intakeStartTime`（その業務日に紐づく規程バージョンの `rule_parameters.LOT_INTAKE_START_TIME`）, `items[]`（品目 + 既定単位）, `units[]`, `grades[]`（`code_values` `INSPECTION_GRADE`、`sort_order` 順）を返す。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `uuid` | `ruleVersionId` | 業務日の規程バージョン — SC-03-01 [3] の時刻をハードコードしないため（顧客 #27） |

### 2.9. `app.fn_lot_lock_for_sale`（public — module trade が呼ぶ）

| Return type | Function name |
|---|---|
| `numeric(12,1)`（販売前の利用可能数量） | `app.fn_lot_lock_for_sale` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_lot_id` | 販売するロット |
| `numeric(12,1)` | `p_qty` | 販売予定の数量 |
| `date` | `p_day` | 開いている業務日 |

**関数の説明**

> - `lots` の行を `FOR UPDATE` でロック; ロットは `PUBLISHED` で、かつ `p_day` に属するか持ち越されていること（そうでなければ `E-TRD-001`）; 利用可能数量 = Σ `qty_delta` ≥ `p_qty`（そうでなければ実際の数量を付けて `E-TRD-002`）。何も書き込まない。取引確定の関数と同じ transaction 内で呼ぶ（BR-LOT-02）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `numeric` | `v_available` | ロック時点の利用可能数量 — 2.10 がロットの状態変更を判断するため返す |

### 2.10. `app.fn_lot_book_quantity`（public — module trade が呼ぶ）

| Return type | Function name |
|---|---|
| `void` | `app.fn_lot_book_quantity` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `uuid` | `p_lot_id` | ロット |
| `app.ledger_entry_kind` | `p_kind` | `SALE`（取引確定）または `SALE_REVERSE`（当日訂正 / 取消 / 修正申請） |
| `numeric(12,1)` | `p_qty_delta` | `SALE` の時は負、`SALE_REVERSE` の時は正 |
| `uuid` | `p_ref_trade_id` | 取引（`SALE` では必須） |
| `uuid` | `p_ref_adjustment_id` | 調整の行（`SALE_REVERSE` では必須） |
| `date` | `p_day` | 台帳記録の業務日（開いている日） |

**関数の説明**

> - `lot_quantity_ledger` に1行追加; 新しい数量 = 0 → ロット `CLOSED`（確定, PRM-110）+ `lot_status_history`; `SALE_REVERSE` で `CLOSED` のロットの数量が 0 を超えて戻る → `PUBLISHED` に戻し + 履歴（PL の前提, Q-LOT-05）。書き込み後に数量が負でないことを再検査（BR-LOT-02）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `numeric` | `v_after` | 新しい行の後の利用可能数量 — ロットの状態変更を決める |

---

## 3. モジュールのエラーコード、質問、前提

> この節は **様式 BM-2-901-54 にはない** — LAB-4 P3 のブリーフに従い追加（「FUNC にエラーコードを列挙」; すべての接頭辞の一覧は [`_common/error-codes.md`](../../_common/error-codes.md)）。

### 3.1 エラーコード `E-LOT-*`

| コード | HTTP | メッセージ（JP） | 意味 | 画面 / API |
|---|---|---|---|---|
| E-LOT-001 | 422 | 出荷者コードがマスタにありません（{code}） | マスタにない出荷者コード | SC-03-01 [4] / API-LOT-002 |
| E-LOT-002 | 422 | 品目がマスタにありません | マスタにない品目 | SC-03-01 [5] / API-LOT-002 |
| E-LOT-003 | 422 | 数量は0より大きい値を入力してください | 数量は 0 より大きいこと | SC-03-01 [7] / API-LOT-002 |
| E-LOT-004 | 422 | kg は小数第1位まで、箱・尾は整数で入力してください | 単位に対して小数桁が不正 | SC-03-01 [7] / API-LOT-002 |
| E-LOT-005 | 422 | 紙伝票番号は20文字以内（英数字と「-」）で入力してください | 伝票番号が長すぎる / 使用不可の文字 | SC-03-01 [8] / API-LOT-002 |
| E-LOT-006 | 409 | この仮受付はすでに本登録済みです（{lotNo}） | 仮受付が別の端末で既に本登録済み | SC-03-01 [9] / API-LOT-002 |
| E-LOT-007 | 409 | 同じ出荷者・品目・数量のロットが10分以内に登録されています（{lotNo}）。登録しますか？ | 重複の疑い — 再確認、ブロックしない | SC-03-01 [13] / API-LOT-002 |
| E-LOT-008 | 422 | 等級を選択してください | 等級が未選択 | SC-03-05 [6] / API-LOT-004 |
| E-LOT-009 | 422 | 所見は200文字以内で入力してください | 所見が長すぎる | SC-03-05 [7] / API-LOT-004 |
| E-LOT-010 | 422 | ロットを1件以上選択してください（最大50件） | ロット未選択 / 50件超 | SC-03-05 [4] / API-LOT-004 |
| E-LOT-011 | 422 | 取引のあるロットを再記録する場合は理由を入力してください | 取引のあるロットは再記録の理由が必要 | SC-03-05 [9] / API-LOT-004 |
| E-LOT-012 | 422 | 確認者の社員番号が見つからないか、記録者本人です | 2人目の確認者が無効 | SC-03-05 [8] / API-LOT-004 |
| E-LOT-013 | 409 | ロット {lotNo} は下見を記録できない状態です（{status}） | 仮受付 / 引渡し完了のロット、または当日に存在しない | SC-03-05 [4] / API-LOT-004 |
| E-LOT-014 | 404 | 対象のロットが見つかりません | ロットが存在しない | API-LOT-002, API-LOT-004 |
| E-LOT-015 | 422 | 出荷者コードを入力してください | 出荷者コードが不足 | SC-03-01 [4] / API-LOT-002 |
| E-LOT-016 | 422 | 品目・単位を選択してください | 品目・単位が不足 / 不正 | SC-03-01 [5][6] / API-LOT-002 |
| E-LOT-017 | 422 | 再記録理由は200文字以内で入力してください | 再記録の理由が長すぎる | SC-03-05 [9] / API-LOT-004 |

共通コード `E-CMN-001..008`（日本語メッセージは一本化、HTTP、クライアントの処理方法）: [`_common/error-codes.md`](../../_common/error-codes.md)。エラー body、MFA、楽観的ロック: [`_common/api-conventions.md`](../../_common/api-conventions.md)。

### 3.2 新しい質問 / 前提

| ID | 質問 | 暫定前提（PL） | 前提が誤っていた場合の影響 | トレース |
|---|---|---|---|---|
| Q-LOT-01 | 正式なロット番号はいつ採番されるか: 仮受付のサーバー登録時か、本登録時か? | **回答済み — 条件付きで同意** 【顧客（模擬）、2026-11-25】: 仮受付レコードのサーバー登録時に採番; (1) 仮番号で全画面（本登録, 目利き, 相対）から業務日の終わりまでロットを検索できる — API-LOT-003 `q`; (2) 正式番号は **再利用しない**（`day_counters` は増えるだけ）; (3) 仮受付の取消（入力ミス・重複）は番号を保持し状態 `CANCELLED` 取消、削除せず、監査時に検索可能; (4) オフラインで未同期のロットは正式番号がない → まだ販売できない; (5) 買受人 / 出荷者向けの伝票は正式番号を使用 | 追加コストなし; 仮受付取消の関数 / API は未仕様化（依存） | WF SC-03-01 [9], LOT_DB 4.25 |
| Q-LOT-02 | 仮受付 / 本登録 の差に対する黄色表示のしきい値（顧客は「例: 5%」と発言） | 未実装（FB-CUS-287 は後回し） | 設定ファイルのパラメータを追加 + UI 1行、約0.1日 | 顧客 #28 |
| Q-LOT-03 | 市場の実際の等級一覧 | 顧客が同意した方式（一覧は master にあり、変更にベンダー作業は不要）; A / B / C / 規格外 は UAT 用の暫定; **実際の一覧は運用部門（目利き主任）に確認**。等級は独立した項目 — サイズ / 入数 とはまとめない 【顧客（模擬）、2026-11-25】 | マスタデータの変更のみ | L4-A02, CAP-HUMAN-01 |
| Q-LOT-04 | 取引のあるロットの目利きを記録し直す際、確定者 / 照合へ通知が必要か | 通知しない; SC-03-04 の履歴に表示 | in-app 通知を追加、約0.3日 | ルール 4 |
| Q-LOT-05 | `CLOSED`（売り切れ）のロットに当日訂正 / 取消で数量が戻った場合、自動で再び販売可能にするか? | はい: `PUBLISHED` に戻し + 履歴 | 人が再開する必要があれば → SC-03-03 に操作を追加 | PRM-110, FIG-011 |
| A-LOT-01 | 仮受付は台帳に数量を書かない; 本登録は `RECEIVE` = 確定数量を書く | prototype 0014 どおり | MKT_DB の enum `ATTR_FIX`（「本登録時の数量修正」）の注釈は「本登録後の数量修正（SC-03-04）」に直す必要がある | MKT_DB §4.0, PRM-128 |
