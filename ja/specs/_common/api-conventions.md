---
id: SPEC-API_CONV-001
title: API 共通規約（Common Conventions · Status code · Appendix）
type: system
subtype: api-conventions
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
design_id: API_CONV
feature: _common
related: ["BM-2-901-52", "SPEC-ERROR_CODES-001", "SPEC-API_LIST-001", "ADR-002", "ADR-005", "ADR-008"]
---

# API 共通規約

> 内容は ISO 様式 **BM-2-901-52** の sheet `Common Conventions`、`Status code`、`Appendix` に対応する。ひな形 BM-2-901-52（社内標準 spec-standards に準拠、非公開） はこのファイルを参照している（ISS-36: API Design の `_common/` の3ファイルは標準リポジトリにまだないため、プロジェクトが独自に書いた）。[`system-design/api-design/`](../system-design/api-design/_index.md) の **すべての** ファイルに適用する。
>
> API 一覧: [`api-list.md`](api-list.md) · エラーコード: [`error-codes.md`](error-codes.md).

---

## 1. 改訂履歴

| No. | Version | Action | 変更 | 更新日 | 更新者 | 備考 |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | P3 統合時の初版: URL `/api/v1` を確定、エラー body は `{ "error": {…} }`（プロトタイプどおり）、入力エラーはすべて 422、MFA step-up + 一回限りのトークン、楽観的ロック、冪等性、締め済みの日は 423 | 2026-11-25 | phuongnnm-23344 | LAB-4 P3 で3流れを統合 |
| 2 | 0.1.1 | Update | Gate 2: §4 を PREMISE §3.2 の ★ に合わせて並べ直した — 規則の確認者（確認）による版 `CHANGE` の確認と、決裁済みの版 `APPROVED` の取消は一回限りのトークンへ移行、`purpose` `RULE_CHANGE_CONFIRM`、`RULE_CANCEL_DECIDE` を追加（G2-M01）; ヘッダー `X-MFA-Token` の宣言ルール（G2-m08）; プロトタイプの 400 `BAD_JSON` / body `{code, message}` の根拠の文とずれの行（G2-m02） | 2026-11-25 | phuongnnm-23344 | Gate 2 |

---

## 2. 共通規約（Common Conventions）

番号は、ひな形 BM-2-901-52 の呼び方（「共通規約の番号 0、1、3」）に合わせている。

| No. | 規約 | 内容 |
|---|---|---|
| 0 | 1リクエスト — 1つのレスポンスケース | 各リクエストは API ファイルの4節の行を **ちょうど1つ** 返す。API ファイルの5節の検査順で最初に見つかったエラーで止める。 |
| 1 | 必須パラメータが既定 | すべてのパラメータは必須; 任意のパラメータは `Note` 列に `[optional]` と書く。 |
| 2 | URL と version | `/api/v1/{リソース}` — リソースは複数形の名詞、kebab-case（`/api/v1/delivery-exceptions`）; パスパラメータは波括弧で囲んだ camelCase（`{participantId}`）。CRUD でない操作は子の名詞にする（`/close`、`/confirm`、`/transitions`）。Next.js のルートハンドラは `src/app/api/v1/**/route.ts`。互換性のない契約変更 → `/api/v2/…` を並行して開き、最後のクライアントが移行するまで `v1` を維持。LAB-2 プロトタイプは version なしの `/api/...` を使っており、これは `MKT_DB.md` の差異表（as-is）にのみ残る。 |
| 3 | エラー body | `{ "error": { "code", "message", "field"?, "detail"?, "traceId"? } }` — 詳細は 3.2 節。プロトタイプの形式を **拡張**: プロトタイプは `{ code, message }` のみ（`prototype/src/lib/http/api-error-response.ts:5`）; `field`、`detail`、`traceId` は to-be で追加した部分。ひな形の `errors[]` の例とは **異なる** — ひな形はエラー形式を共通規約の3に委ねているため、これはひな形からの逸脱ではない; プロジェクトは LAB-2 のコードを再利用できるようプロトタイプの形を維持; 各レスポンスにはエラーが1つだけ（規約0）。 |
| 4 | JSON のキー名 | リクエスト / レスポンスのキーはすべて camelCase（`expectedInputHash`、`buyerNo`）。DB の列は snake_case — ルートハンドラがマッピングする。enum の値は DB に合わせて大文字（`APPROVED`、`NAKAOROSHI`）。 |
| 5 | 値の型 | 金額: `Integer`（円、税抜。フィールド名に `Incl` がある場合を除く）。日付 業務日: `YYYY-MM-DD`。時刻: タイムゾーン `+09:00` 付きの ISO-8601。ID: 文字列の UUID v4。数量 kg: 小数点1桁の `number`; 箱 / 尾: `Integer`。 |
| 6 | 認証 | サーバー側のセッション Cookie `sid`（HttpOnly、Secure、SameSite=Lax — ADR-002）。書き込み系のリクエスト（POST / PUT / PATCH / DELETE）はすべてヘッダー `X-CSRF-Token` を付ける。共用端末は、API が端末を識別する必要がある場合（同期、オフライン）に `X-Device-Id` を送る。 |
| 7 | MFA | 4節。 |
| 8 | 楽観的ロック / 同時実行 | 5節。 |
| 9 | 冪等性 | 6節。 |
| 10 | 締め済みの日 / 期 | 7節 — 423 を返す。再オープンする API はない。 |
| 11 | メッセージの言語 | `message` は日本語で、利用者にそのまま表示する; SQL、スタックトレース、テーブル名は含めない。`detail` に含めるのは安全な業務データのみ（ロット番号、残りの SL、上限額）。 |
| 12 | ログ | [`log-convention.md`](log-convention.md) に従う。ログに書かないもの: パスワード、PIN、MFA のコード、`X-MFA-Token`、Cookie。 |

---

## 3. ステータスコードとエラー body

### 3.1 プロジェクトで使うステータスコード

この表の外のコードは API ファイルで使ってはならない（ひな形 BM-2-901-52 §4）。

| Status | 使用する場面 | 代表的なエラーコード | Client (khung chung `wireframes/_common-layout.md`) |
|---|---|---|---|
| 200 | 読み取り / 更新が成功 | — | — |
| 201 | 新規レコードの作成（ロット、取引、申請、例外） | — | C-12 トースト |
| 401 | 未ログイン / セッション切れ / 利用者の交代 | `E-CMN-001` | SC-00-01（PC）または SC-00-02（タブレット）に戻る。入力中の内容は保持 |
| 403 | 役割 / 決裁権限が不足; メーカーが自分で決裁; MFA 不足 | `E-CMN-002`、`E-CMN-005`、feature のコード（例 `E-PTY-012`、`E-RULE-002`） | C-25（権限）· C-30（MFA） |
| 404 | レコードがない、または RLS で非表示（二つのケースを区別しない） | feature のコード `…-0xx` | C-23 |
| 409 | 業務状態の衝突、重複、SL 超過、クォータ、同時実行、楽観的ロック | feature のコード、`E-CMN-006`、`E-CMN-008` | C-23 |
| 422 | **すべての** 入力エラー: スキーマ違反（zod）**と** 項目のルール違反（長さ、範囲、条件付きの必須） | `E-CMN-007`、feature のコード | C-22（`field` の欄の下）または C-23 |
| 423 | 業務日が日次締め済み / 期が期ロック済み | `E-CMN-003`、`E-INC-002` | C-24（= SC-00-05）、内容は保持、修正申請へのボタン |
| 500 | 予期しないエラー; transaction はロールバック済み | `E-CMN-004` | C-26 と `traceId` |

**400 は使わない。** プロトタイプはスキーマ / ルール違反に 422 を返し（`rpc-error-mapper.ts`）、body が解析できない場合は **400 `BAD_JSON`** を返す（`prototype/src/lib/http/parse-json-body.ts:14`）。to-be では JSON の破損を 422 `E-CMN-007` にまとめ、クライアントの入力エラー処理の分岐を一つにする。

| as-is → to-be の差異 | Prototype | To-be |
|---|---|---|
| JSON の破損 | 400 `BAD_JSON` | 422 `E-CMN-007` |
| エラー body | `{ code, message }` | `{ code, message, field?, detail?, traceId? }` |

### 3.2 エラー body

```json
{ "error": { "code": "E-LOT-004", "message": "kg は小数第1位まで、箱・尾は整数で入力してください", "field": "qty" } }
```

| キー | 型 | 必須 | 内容 |
|---|---|---|---|
| `code` | string | はい | [`error-codes.md`](error-codes.md) のコード — `E-CMN-xxx` または feature のコード |
| `message` | string | はい | パラメータを埋め込んだ日本語メッセージ（`{lotNo}` → 実際の番号） |
| `field` | string | いいえ | エラーの原因となったリクエストのキー（camelCase、パス形式 `items[2].qty`）— クライアントが欄を強調表示 |
| `detail` | object | いいえ | クライアントが表示する業務データ（例 `{ "limit": 3000000, "used": 2950000 }`） |
| `traceId` | string | いいえ（500 では必須） | サーバーのログと一致する追跡コード |

DB の関数は message `'E-XXX-nnn: detail'` を付けて `P0001` を送出する; ルートハンドラがコードを分離 → HTTP の表 + メッセージを引く（プロトタイプの方式、ARCHITECTURE §4.3）。

---

## 4. MFA step-up

ADR-002 §2.2 に従う。2つのレベルがあり、MFA が不足するケースはすべて **一つの** エラーコード `E-CMN-005`（403）。

| レベル | 用途 | サーバー検証 | Client |
|---|---|---|---|
| セッション単位の step-up | PREMISE §3.2 で ★ **の付かない** 操作: 規則の版の差し戻し、`DRAFT` / `PENDING` の版の取消、決裁 許可 / 確認 承認、修正申請の決裁 1次・2次、争いのある引渡しの確認… | `app.mfa_verified_at` が（人、端末、セッション）について ≤ 10 分 **かつ** 3分を超える無操作がない | 不足 → 403 `E-CMN-005` を受け取る → C-30 を開く → iam の認証 API を呼ぶ → リクエストを再送 |
| 一回限りのトークン | PREMISE §3.2 で ★ の付いた操作 — step-up が有効でもコードを常に再度問う（ADR-002 §2.2-6a）: 日次締め、端末回収不能、期ロック、**規則の版の確認者による確認（`CHANGE` と `ROLLBACK`）**、運用部門長による決裁 N2 の **規則のロールバック**（E-14）、**版 `APPROVED` の取消**、証憑の物理削除の決裁 | ヘッダー `X-MFA-Token`: 未使用、120秒以内、同じ人 + 端末、正しい `purpose` | C-31 で確認 → C-30 でコードを入力 → トークンを受け取る → ヘッダーに付けて送信 |

使用中の `purpose`: `DAY_CLOSE`、`DEVICE_LOST`（settle）、`PERIOD_LOCK`（incentive）、`RULE_CHANGE_CONFIRM`、`RULE_ROLLBACK_CONFIRM`、`RULE_SECOND_APPROVAL`、`RULE_CANCEL_DECIDE`（rule）。証憑の物理削除（B.7）は、この spec 一式にはまだ API がない — 仕様化するときに `purpose` を追加する。新しい `purpose` を追加する → ここに追記する。

**ヘッダーの宣言（G2-m08）:** 一回限りのトークンを使う API は、`X-MFA-Token` を Request Params に必須として宣言し、`purpose` を明記する。セッション単位の step-up のみを使う API は `X-MFA-Token` を宣言 **しない**（サーバーはこのヘッダーを読まない）; step-up が不足 → 403 `E-CMN-005`。MFA のレベルがデータに依存する API（例: API-RULE-005 は版の状態による）は、ヘッダーを条件付きで宣言し、条件を `Note` 列に書く。

6桁のコードが誤り、5回誤ると一時ロック: これは **iam モジュールの MFA 認証 API** が返す — この API はまだ仕様化されていない（12画面の外 — DEP-01、[`specs/_index.md`](../_index.md) の依存の項を参照）。提案: `POST /api/v1/auth/mfa/verify` `{ code, purpose? }` → セッションの step-up を更新し、`purpose` があれば `{ mfaToken, expiresAt }` を返す。業務 API は body で6桁のコードを受け取らない。

---

## 5. 楽観的ロックと同時操作

- **その場で修正できる**レコード（参加者のマスター、未確定のフォーム）は `version`（Integer）を持つ。クライアントは取得した `version` を送り返す; 不一致 → 409 `E-CMN-008`、`detail.currentVersion`。クライアントは C-23 と 「再読み込み」 ボタンを表示し、入力中の内容は保持する。
- **追記のみ**のレコード（取引、SL 台帳、引渡し、奨励金の結果）は `version` を使わない: DB 関数が親の行をロック（`SELECT … FOR UPDATE`）し、条件を再確認する; 条件が変わった場合 → feature の 409 コードで原因を明示（例 `E-TRD-002` 残りの SL が不足）。
- デッドロック / シリアライゼイション（`40P01`、`40001`）→ ロールバック、409 `E-CMN-006`; クライアントは再度押せるようにし、**自動では再送しない**。

---

## 6. 冪等性

| API 種別 | 方法 | 例 |
|---|---|---|
| オフラインになりうる端末 / 同期キューからの書き込み（ADR-008） | 各レコードは `clientRecordId`（端末で生成した UUID v4）を持つ。サーバーが同じ `clientRecordId` を再び受け取った → 初回の結果（200）を返し、追加の書き込みはしない | API-DEL-003 |
| 通常のオンライン書き込み | 冪等 **ではない**: クライアントは送信中ボタンをロックし、タイムアウトしても自動では再送しない; 重複は業務ルール（409）で防ぐ | API-LOT-002, API-TRD-002 |
| 状態遷移（決裁、締め） | 状態に基づき自然に冪等: 2回目で遷移先の状態に当たる → feature の「処理済み」コードで 409 | API-PTY-005, API-STL-002, API-INC-003 |

共通のヘッダー `Idempotency-Key` は使わない（YAGNI — オフラインの流れだけが必要とし、それにはレコードごとの鍵がすでにある）。

---

## 7. 締め済みの日（423）

- ロックは DB にある: トリガー `enforce_open_business_day` は `OPEN` でない業務日への書き込みを阻止する（ADR-005）。API は `DAY_LOCKED` エラーを 423 `E-CMN-003` に対応付けるだけ。期ロック済みの期 → 423 `E-INC-002`（ADR-007）。
- 日や期を **再オープンする API はない**。ロック後の修正 = 修正申請 → 決裁 → 開いている日に REVERSE / DELTA のレコード（ルール4）。
- クライアントは C-24 を表示し、入力済みの内容は保持する。「修正申請を作成 →」 ボタンは内容を SC-08-01 に引き継ぐ。
- オフラインの同期キューで締め済みの日に当たった場合: レコードは `HELD` に移り、レコードごとに 423 を返すことはしない（ADR-008 §2.2-7）。

---

## 8. Appendix

### 8.1 Param Type

| Param Type | 用途 |
|---|---|
| `Header Parameters` | `X-CSRF-Token`, `X-MFA-Token`, `X-Device-Id` |
| `Path Parameters` | URL 内の ID |
| `Query Parameters` | 絞り込み、ページング（`limit`、`offset`） |
| `Form Parameters` | ファイルのアップロード（multipart）— 添付の共通 API のみ |
| `Body Parameters` | JSON body。**元の様式にはない** — JSON の API のために追加（ひな形 BM-2-901-52 の注記） |

### 8.2 Data Type

| Data Type | 意味 |
|---|---|
| `Integer` | 整数（円、箱 / 尾の SL、version） |
| `number` | 小数（SL kg）— 元の様式に **追加** |
| `string` | 文字列（UUID、日付、enum） |
| `text` | 長い文字列（備考、理由） |
| `boolean` | true / false |
| `object` | ネストした JSON オブジェクト — **追加** |
| `string[]`、`object[]` | 配列 — **追加**; 子のフィールドは `items[].qty` の形式で書く |
| `file` | アップロードするファイル |

### 8.3 Action（履歴の Action 列）

`Add new` · `Update` · `Delete` — 元の様式どおり。

---

## 9. 未決事項

| ID | 内容 | 暫定前提 | 前提が誤っていた場合の影響 |
|---|---|---|---|
| Q-API-01 | MFA 認証 API と社員番号の検索は、モジュール `iam` に属し、まだ仕様化されていない | 4節に従う; LAB-5 で SC-00-01 / SC-00-02 と一緒に書く | ヘッダー名 / トークンの有効期限を変更 → トークンを使う 5 件の API を修正、画面の流れは変わらない |
| Q-API-02 | `traceId` を利用者に表示するか | C-26 の 「エラー番号」 に表示し、IT に連絡できるようにする | 無 — UI のみの変更 |
