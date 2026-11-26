---
id: SPEC-DELIVERY_FUNC-001
title: 機能仕様 — モジュール delivery（引渡し、例外、争い）
type: system
subtype: function-specifications
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: delivery
related: [SPEC-SC-06-02-001, SPEC-SC-06-04-001, SPEC-SC-06-05-001, SPEC-DEL_RECORD-001, SPEC-DEL_EXCEPTION_DISPUTE-001, API-DEL-001, API-DEL-002, API-DEL-003, API-DEL-004, API-DEL-005, API-DEL-006, SPEC-TRADE_DB-001]
---

# delivery — 機能仕様

| | |
|---|---|
| Module / file | `src/modules/delivery/delivery-service.ts` · `delivery-exception-service.ts` · PWA `src/modules/delivery/offline/delivery-queue.ts` · DB関数 `app.fn_delivery_*`, `app.fn_dispute_confirm` |
| 言語 / フレームワーク | TypeScript 5 / Next.js App Router + PWA（service worker、IndexedDB）+ PostgreSQL 16（PL/pgSQL）— ARCHITECTURE §4.3、ADR-008 |

共通の型 `SessionContext`、`Result<T>`、`AppError`: [PARTY_FUNC](../../party/function-specifications/PARTY_FUNC.md) を参照（`_common` へ移行予定）。

---

## 1. 改訂履歴

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | モジュール全体 | 7 関数とエラーコード `E-DEL` を初期化 | 2026-11-25 | phuongnnm-23344 | |
| 2 | Ver 0.1.1 | Update | — | Gate 2 G2-M02: §4 完了条件（LAB-5）; 顧客（模擬）Q-DEL-03: E-DEL-007 は代理人の氏名が 50 文字を超えた場合のみ | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 関数仕様

### 2.1. `listPendingDeliveries`

| Return type | Function name |
|---|---|
| `Promise<Result<{ buyer: BuyerSummary; trades: PendingTrade[] }>>` | `listPendingDeliveries` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | 役割 DELIVERY / DEL-HEAD |
| `{ buyerNo?: string; tradeId?: string }` | `query` | 正確に一方のみ |

**Function description**

> - `v_delivery_status` + `v_trade_effective` を読む: 買受人の残 > 0 の `CONFIRMED` 取引（前日残を含む）、または `tradeId` による一件（SC-06-04 向け）。`businessDateLocked` を返し、例外画面で金額の処理経路を選べるようにする。
> - エラー: `E-DEL-001`, `E-DEL-002`, `E-DEL-027`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `isCarryOver` | `trades.business_date` < 現在の業務日のとき 「前日残」 のラベルを付ける |

### 2.2. `getOfflineSnapshot`

| Return type | Function name |
|---|---|
| `Promise<Result<OfflineSnapshot>>` | `getOfflineSnapshot` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | `deviceId` を含む — 登録済みの端末のみ |

**Function description**

> - 残のある取引を最大 7 業務日分 + 買受人（番号、名称）+ `snapshotAt`、`businessDate` を返す; 価格／金額は含まない。PWA は IndexedDB の古い snapshot を上書きする。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `snapshotAt` | オフライン時に SC-06-02 [16] に表示 |

### 2.3. `recordDeliveries`

| Return type | Function name |
|---|---|
| `Promise<Result<{ results: DeliveryResult[] }>>` | `recordDeliveries` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | |
| `{ items: DeliveryItem[]; receiver: Receiver; deviceRecordedAt: string }` | `input` | `DeliveryItem = { tradeId; qty?; isRemainingAll; clientRecordId }` |

**Function description**

> - 一つのトランザクションで各 item に `fn_delivery_record` を呼び出す（DEL_RECORD §4.2–4.5）; `clientRecordId` で冪等。
> - エラー: `E-DEL-003..010`, `E-DEL-027`, `E-CMN-003`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `allReplayed` | 全 item が既に記録済み → 201 の代わりに 200 を返す |

### 2.4. `enqueueOfflineDelivery` (PWA)

| Return type | Function name |
|---|---|
| `Promise<{ clientRecordId: string; pendingCount: number }>` | `enqueueOfflineDelivery` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `DeliveryItem & { receiver: Receiver }` | `record` | 取引一件の記録 |
| `{ deviceId: string; capturedBy: string; capturedAt: string }` | `meta` | `capturedBy` = 現在の利用者（オフライン PIN — ADR-008 §2.3） |

**Function description**

> - ローカルの残（snapshot − キュー）で検証し、IndexedDB に保存、C-28 の件数を増やす。ネットワーク呼び出しはしない。送信はモジュール `sync` が担当（同じ `clientRecordId`）。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `number` | `localRemaining` | 端末上で残を超えることを阻止（`E-DEL-005`） |

### 2.5. `registerException`

| Return type | Function name |
|---|---|
| `Promise<Result<{ exception: DeliveryException; adjustmentCreated: boolean; correctionRequired: boolean; amountDeltaJpy: number }>>` | `registerException` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | |
| `ExceptionInput` | `input` | `tradeId`, `inputMode`, `exceptionCode`, `qty?`, `reasonCode`, `description?`, `receiver?`, `paper?`, `attachmentIds[]` |

**Function description**

> - `fn_delivery_exception_register` を呼び出す（DEL_EXCEPTION_DISPUTE §4.2–4.3）。取引の業務日が開いている → 調整 `SAME_DAY` を記録; ロック済み → `correctionRequired`。
> - エラー: `E-DEL-003`, `-004`, `-008`, `-011..018`, `-027`, `-028`, `E-CMN-003`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `dayLocked` | REVERSE / DELTA か 修正申請 かを選ぶ |

### 2.6. `listDisputes`

| Return type | Function name |
|---|---|
| `Promise<Result<DisputeRow[]>>` | `listDisputes` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | DEL-HEAD（操作）または SETTLE / STL-HEAD / OPS-HEAD（閲覧） |
| `{ scope: 'confirmable' \| 'all' }` | `query` | `confirmable` は閲覧者本人が記録した行を除外 |

**Function description**

> - `delivery_exceptions` を `is_dispute = true`、`status = OPEN` で読む + 紙の確認票 + `canConfirm`, `isSigner`, `amountPreview`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `canConfirm` | 閲覧者が記録者（PRM-111）または DEL_HEAD 権限なしの場合 false |

### 2.7. `confirmDispute`

| Return type | Function name |
|---|---|
| `Promise<Result<{ confirmation: DisputeConfirmation; exceptionStatus: 'OPEN' \| 'RESOLVED'; adjustmentCreated: boolean; correctionRequired: boolean }>>` | `confirmDispute` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | 有効な MFA |
| `string` | `exceptionId` | |
| `{ conclusion: 'COMPLETED' \| 'PARTIAL_RETURN' \| 'CONTINUE_DISPUTE'; returnQty?: number; comment?: string; signerAbsentReason?: string; scanViewedAt?: string }` | `input` | |

**Function description**

> - MFA を確認してから `fn_dispute_confirm` を呼び出す（DEL_EXCEPTION_DISPUTE §4.4–4.5）。
> - エラー: `E-DEL-019..026`, `E-DEL-028`, `E-CMN-005`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `boolean` | `actingForSigner` | 監査に「紙の署名者の代わりに確認」を記録 |

---

## 3. エラーコード一覧 `E-DEL`

| コード | HTTP | メッセージ（JP） | 意味 | 使用箇所 |
|---|---|---|---|---|
| E-DEL-001 | 422 | 買受人番号を入力してください | 買受人番号の未入力 | SC-06-02 [1]; API-DEL-001 |
| E-DEL-002 | 404 | 該当する買受人が見つかりません | 買受人が見つからない | [1]; API-DEL-001 |
| E-DEL-003 | 422 | 数量を入力してください（0より大きい値） | 数量の未入力／不正 | [8]; SC-06-04 [7]; API-DEL-003, -004 |
| E-DEL-004 | 422 | kg は小数点以下1桁まで、箱・尾は整数で入力してください | 小数の単位が不正 | [8]; API-DEL-003, -004, -006 |
| E-DEL-005 | 409 | 残数量（{残}{単位}）を超えています | 残を超過 | [8]; API-DEL-003 |
| E-DEL-006 | 422 | 受取人（本人／代理）を選んでください | 受取人の未選択 | [11]; API-DEL-003 |
| E-DEL-007 | 422 | 代理人の氏名は50文字以内で入力してください | 代理人の氏名が 50 文字超（氏名は任意 — Q-DEL-03） | 11.1; API-DEL-003, -004 |
| E-DEL-008 | 409 | この取引は確定していないため引渡しできません | 取引が未確定／取消済み | API-DEL-003, -004 |
| E-DEL-009 | 409 | この取引は引渡しが完了しています | 取引は引渡し済み | API-DEL-003 |
| E-DEL-010 | 409 | 同じ記録IDで異なる内容が送信されました | `clientRecordId` の重複で内容が異なる | API-DEL-003 |
| E-DEL-011 | 422 | 例外の種類を選んでください | 例外の種類の未選択 | SC-06-04 [6]; API-DEL-004 |
| E-DEL-012 | 422 | 理由を選んでください | 理由の未選択 | [8]; API-DEL-004 |
| E-DEL-013 | 422 | 争いありの場合は内容を入力してください（500文字以内） | 争いの内容の未入力 | [9]; API-DEL-004 |
| E-DEL-014 | 409 | この確認票番号は既に登録されています | 確認票番号が使用済み | [3]; API-DEL-004 |
| E-DEL-015 | 422 | 紙で確認した時刻は業務日内・現在時刻以前で入力してください | 確認票の時刻が不正 | [4]; API-DEL-004 |
| E-DEL-016 | 422 | 記録者本人は確認できません | 署名者 = 記録者 | [5]; API-DEL-004 |
| E-DEL-017 | 422 | 後入力の場合は確認票のスキャンを添付してください | 後入力時のスキャン未添付 | [11]; API-DEL-004 |
| E-DEL-018 | 422 | 署名した配送部門責任者の社員番号が正しくありません | 署名者が DEL_HEAD でない | [5]; API-DEL-004 |
| E-DEL-019 | 403 | 自分の記録のため確認できません | 自己確認（PRM-111） | SC-06-05 [9]; API-DEL-006 |
| E-DEL-020 | 422 | 結論を選んでください | 結論の未選択 | [7]; API-DEL-006 |
| E-DEL-021 | 422 | 継続協議の場合はコメントを入力してください | 継続協議のコメント未入力 | [8]; API-DEL-006 |
| E-DEL-022 | 422 | 署名者に代わって確認する場合は理由を入力してください | 代理確認の理由未入力 | 8.1; API-DEL-006 |
| E-DEL-023 | 422 | スキャンを表示して確認してから確定してください | スキャン未表示 | [6]; API-DEL-006 |
| E-DEL-024 | 409 | この争いは既に確認済みです | 既に確認済み | API-DEL-006 |
| E-DEL-025 | 404 | 例外が見つかりません | 例外が見つからない | API-DEL-006 |
| E-DEL-026 | 422 | 返品数量を入力してください | 返品数量の未入力 | 11.1; API-DEL-006 |
| E-DEL-027 | 404 | 取引が見つかりません | 取引が見つからない | API-DEL-001, -003, -004 |
| E-DEL-028 | 409 | 数量が対象の範囲を超えています（上限 {n}{単位}） | 数量が範囲超過 | SC-06-04 [7]; 11.1; API-DEL-004, -006 |
| E-DEL-029 | 422 | PDF・JPEG・PNG（10MB以下）を添付してください | 添付ファイルの種類／サイズが不正 | SC-06-04 [11] (API attachments chung) |
| E-DEL-030 | 422 | 確認票番号を入力してください | 確認票番号の未入力 | [3]; API-DEL-004 |

共通コード `E-CMN-001..008`（日本語メッセージは一本化、HTTP、クライアントの扱い）: [`_common/error-codes.md`](../../_common/error-codes.md)。エラーボディ、MFA、楽観的ロック: [`_common/api-conventions.md`](../../_common/api-conventions.md)。

---

## 4. 完了条件（LAB-5）

関数ごと; 詳細なテストケースは対応する Technical Design の「完了条件（LAB-5）」節。各関数は、§3 のうちその関数が返すすべてのエラーコードに、正しい HTTP ステータスで到達する少なくとも一つのテストがあり、かつ以下の条件を満たしたときに完了。

| Function | 完了条件 | TECH |
|---|---|---|
| `listPendingDeliveries` | `CONFIRMED` かつ残 > 0 の取引のみ; `buyerNo` と `tradeId` が両方ない → 422 | [DEL_RECORD](../technical-design/DEL_RECORD_TECH.md) |
| `getOfflineSnapshot` | 最大 7 業務日（Q-DEL-02）、価格／金額を含まない | [DEL_RECORD](../technical-design/DEL_RECORD_TECH.md) |
| `recordDeliveries` | 同じ `clientRecordId` を 2 回送信 → 1 件; 超過引渡し → 409 `E-DEL-005`; 複数 item のうち一つでもエラー → どの item も記録しない; 業務日がロック済み → 423（オンライン）／ `HELD`（オフライン）; 氏名のない代理 → 「代理」 | [DEL_RECORD](../technical-design/DEL_RECORD_TECH.md) |
| `enqueueOfflineDelivery` (PWA) | 通信断でも通常の引渡しはキューに記録できる; 再同期で重複レコードを作らない; 例外はキューに入らない（Q-DEL-01） | [DEL_RECORD](../technical-design/DEL_RECORD_TECH.md) |
| `registerException` | 業務日が開いている → `trade_fixes` + REVERSE / DELTA を確定単価で計算、過剰は金額を変えない; 業務日がロック → `correctionRequired`; `fix_id` はチェックリストで二重に数えない | [DEL_EXCEPTION_DISPUTE](../technical-design/DEL_EXCEPTION_DISPUTE_TECH.md) |
| `listDisputes` | 既定では閲覧者が確認できない行（自分で記録した行）を除外; `scope = all` は継続協議中の例外（まだ `OPEN`）も返す | [DEL_EXCEPTION_DISPUTE](../technical-design/DEL_EXCEPTION_DISPUTE_TECH.md) |
| `confirmDispute` | 自己確認を禁止 → 403 `E-DEL-019`; `CONTINUE_DISPUTE` は複数回記録可能; MFA 必須 | [DEL_EXCEPTION_DISPUTE](../technical-design/DEL_EXCEPTION_DISPUTE_TECH.md) |
