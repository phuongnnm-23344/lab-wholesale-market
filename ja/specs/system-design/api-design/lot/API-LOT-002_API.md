---
id: SPEC-LOT_API-002
title: ロット本登録
type: system
subtype: api-design
api_id: API-LOT-002
endpoint: /api/v1/lots
method: POST
media_type: application/json
feature: lot
screen_id: [SC-03-01]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-03-01-001, SPEC-LOT_FUNC-001, SPEC-LOT_REGISTER-001]
---

# API-LOT-002 — POST /api/v1/lots

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | 顧客 Q-LOT-01: 正式な番号はサーバーに登録された時点で発番され、再利用しない | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

本登録: 受付窓口（SC-03-01 [9]）で仮受付のロットを完了させるか、新規ロットを作成します。ロットは `RECEIVED` になり、在庫数量の履歴に `RECEIVE` の行が追加されます。重複の疑い（同じ出荷者・品目・数量が10分以内）の場合は 409 を返し、クライアントが再確認できるようにします。`confirmDuplicate=true` を付けて再送すると登録されます。段階ごとの処理: [LOT_REGISTER_TECH](../../../lot/technical-design/LOT_REGISTER_TECH.md).

**認証:** Session cookie。ロール: INTAKE。MFA なし（PREMISE §3.2「ロットの受付」）。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Body Parameters | `provisionalLotId` | string | `6f1c2a4e-0000-4000-8000-000000000012` | 仮受付ロットの UUID。`null` = 新規ロット | `[optional]` |
| 2 | Body Parameters | `shipperId` | string | `0b6d…-0021` | マスタ上の出荷者の UUID（API-LOT-005 から取得） | |
| 3 | Body Parameters | `itemCode` | string | `MADAI` | 品目コード、1–10 文字 | |
| 4 | Body Parameters | `unit` | string | `KG` | `KG` · `CASE` · `PIECE` | |
| 5 | Body Parameters | `qty` | number | `118.5` | > 0、≤ 99,999,999.9。`KG` は小数第1位まで、`CASE` / `PIECE` は整数 | |
| 6 | Body Parameters | `voucherNo` | string | `S-20270802-031` | 紙伝票番号、≤ 20 文字、`[A-Za-z0-9-]` | `[optional]` |
| 7 | Body Parameters | `confirmDuplicate` | boolean | `false` | 利用者がボックス [13] で確認済みの場合に `true` | `[optional]` 既定値 `false` |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | 本登録済み | <pre>{<br>  "lotId": "6f1c2a4e-0000-4000-8000-000000000012",<br>  "lotNo": "L20270802-15",<br>  "status": "RECEIVED"<br>}</pre> | `lotNo` は トースト C-12 に使用 |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | INTAKE ロールがありません | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | `provisionalLotId` が存在しません | <pre>{ "error": { "code": "E-LOT-014", "message": "対象のロットが見つかりません" } }</pre> | |
| 5 | 409 | 仮受付は本登録済み | <pre>{ "error": { "code": "E-LOT-006", "message": "この仮受付はすでに本登録済みです（L20270802-15）" } }</pre> | クライアントは [1] を再読込 |
| 6 | 409 | 重複の疑い | <pre>{ "error": { "code": "E-LOT-007", "message": "同じ出荷者・品目・数量のロットが10分以内に登録されています（L20270802-14）。登録しますか？", "detail": { "duplicateLotNo": "L20270802-14" } } }</pre> | 強いエラーではない: `confirmDuplicate=true` を付けて再送 |
| 7 | 409 | 排他ロックの競合（デッドロック） | <pre>{ "error": { "code": "E-CMN-006", "message": "同時に操作が行われました。もう一度お試しください" } }</pre> | |
| 8 | 422 | データ不正 | <pre>{ "error": { "code": "E-LOT-004", "message": "kg は小数第1位まで、箱・尾は整数で入力してください", "field": "qty" } }</pre> | 考えられるコード: `E-LOT-001`, `002`, `003`, `004`, `005`, `015`, `016`, `E-CMN-007`; `field` = 項目3 の key |
| 9 | 423 | 業務日は締め済み | <pre>{ "error": { "code": "E-CMN-003", "message": "2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。" } }</pre> | クライアントは C-24 を表示し、内容を保持 |
| 10 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- 冪等ではありません: クライアントは送信中に [9] のボタンを無効化します。新規ロットでボタンを素早く2回押すと、2回目は 409 `E-LOT-007`（重複の疑い）になります — 意図した動作です。
- Q-LOT-01 回答済み: `lotNo` はロットがサーバーに登録された時点で発番され、再利用しません（LOT_REGISTER_TECH §5）。**未決事項 / TBD:** [LOT_FUNC §3](../../../lot/function-specifications/LOT_FUNC.md#3-モジュールのエラーコード質問前提) を参照。
