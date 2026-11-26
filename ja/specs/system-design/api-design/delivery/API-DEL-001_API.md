---
id: SPEC-DEL_API-001
title: 買受人ごとの引渡し待ち取引一覧（または取引1件）
type: system
subtype: api-design
api_id: API-DEL-001
endpoint: /api/v1/deliveries/pending
method: GET
media_type: application/json
feature: delivery
screen_id: [SC-06-02, SC-06-04]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-06-02-001, SPEC-SC-06-04-001, SPEC-DELIVERY_FUNC-001]
---

# API-DEL-001 — GET /api/v1/deliveries/pending

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 元の`field`で項目をロック；G2-m07: [PL]性能目標のラベル | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

買受人ごとに、残が0より大きい`CONFIRMED`の取引を返します（前日残を含む）。オンライン時はSC-06-02向け、SC-06-04向けには`tradeId`で取引1件を返します（取引の日次締め状態も含み、精算経路の選択に使います）。残は訂正後の有効数量から計算します。

**認証:** Session cookie `sid`（読み取り — CSRF不要）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Query Parameters | `buyerNo` | string | `N01` | `^[NB][0-9]{1,10}$`; `tradeId`がない場合は必須 | [optional] |
| 2 | Query Parameters | `tradeId` | string | `t-0005…` | 取引のUUID | [optional]; いずれか一方が必須 |

> 共通規約（Param Type、Data Type、`[optional]`、エラー時のbody `{ "error": {…} }`、MFA、楽観ロック、冪等性）：[`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`：[`_common/error-codes.md`](../../../_common/error-codes.md)

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 成功 | <pre>{<br>&nbsp;&nbsp;"buyer": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name": "サンプル仲卸1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"pendingCount": 3,<br>&nbsp;&nbsp;&nbsp;&nbsp;"carryOverCount": 1<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"trades": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeId": "t-0005…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeNo": "相対-0005",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"channel": "AITAI",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemName": "鰹",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unit": "KG",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"confirmedQty": 30.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deliveredQty": 12.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"remainingQty": 18.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"status": "IN_PROGRESS",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isCarryOver": false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"businessDate": "2027-08-02",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"businessDateLocked": false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unitPriceJpy": 2700,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"hasOpenException": false<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> | `status`: `WAITING` 待機中 · `IN_PROGRESS` 引渡し中 · `COMPLETED` 完了 · `EXCEPTION` 例外。並び順: 当日分を先に（`tradeNo`順）、次に前日残。`unitPriceJpy`、`businessDateLocked` はSC-06-04 [12]用。一覧が空の場合は `trades: []`（画面C-21に表示） |
| 2 | 422 | 買受人番号と取引IDがどちらも未入力 | <pre>{ "error": { "code": "E-DEL-001", "message": "買受人番号を入力してください" } }</pre> | `E-DEL-001` |
| 3 | 422 | bodyまたはqueryの型誤り・項目欠落（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "buyerNo" } }</pre> | `E-CMN-007` |
| 4 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 5 | 403 | 役割・決裁権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 6 | 404 | 買受人が見つからない | <pre>{ "error": { "code": "E-DEL-002", "message": "該当する買受人が見つかりません", "detail": { "buyerNo": "N99" } } }</pre> | `E-DEL-002` |
| 7 | 404 | 取引が見つからない | <pre>{ "error": { "code": "E-DEL-027", "message": "取引が見つかりません" } }</pre> | `E-DEL-027` |
| 8 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 役割: DELIVERY, DEL-HEAD。
- `v_delivery_status` と `v_trade_effective`（`security_invoker`）を参照。
- p95 ≤ 1秒 — [PL] 社内目標。NFR-PERF-01（検索 p95 ≤ 2秒）より厳しい。
- **未決事項 / TBD:** なし
