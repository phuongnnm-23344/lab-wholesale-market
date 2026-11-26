---
id: SPEC-TRD_API-001
title: 許可 / 承認と参加上限を含む買受人の検索
type: system
subtype: api-design
api_id: API-TRD-001
endpoint: /api/v1/trades/buyers
method: GET
media_type: application/json
feature: trade
screen_id: [SC-04-01, SC-04-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-04-01-001, SPEC-TRADE_FUNC-001, SPEC-TRADE_QUALIFICATION_CHECK-001]
---

# API-TRD-001 — GET /api/v1/trades/buyers

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | 顧客 Q-TRD-02: 使用済み限度額を税込 / 税抜の両方で返す（`usedInclJpy`, `usedExclJpy`, `taxRatePercent`） | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

買受人番号の先頭文字から買受人の候補を返し、SC-04-01 の項目 [3] / SC-04-05 の項目 [4] に表示します。現在の資格は **必ず正しい根拠に基づいて** 返します: 仲卸 → `basis: "KYOKA"`（許可）；売買参加者 → `basis: "SHONIN"`（承認）＋ 当期の参加上限（ルール 2）。表示と、理由入力ボックスを先に開くためだけに使います。最終チェックは確定時（API-TRD-002）に行います。Function: [TRADE_FUNC 2.1](../../../trade/function-specifications/TRADE_FUNC.md#21-searchbuyers).

**認証:** Session cookie。ロール: TRADE。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Query Parameters | `q` | string | `N01` | 買受人番号の先頭、1–10 文字、`^[A-Za-z0-9]+$`（サーバーが大文字に変換） | |
| 2 | Query Parameters | `limit` | Integer | `10` | 1–10、既定値 10 | `[optional]` |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "periodKey": "2027-08",<br>  "buyers": [<br>    {<br>      "buyerId": "a1b2c3d4-0000-4000-8000-0000000000b3",<br>      "buyerNo": "B03",<br>      "name": "サンプル売買参加者3",<br>      "kind": "BAIBAI",<br>      "qualification": { "basis": "SHONIN", "status": "VALID", "validTo": "2028-03-31", "daysToExpiry": 242 },<br>      "participationLimit": { "limitJpy": 5000000, "usedInclJpy": 4989600, "usedExclJpy": 4620000, "remainingJpy": 10400, "taxRatePercent": 8 }<br>    },<br>    {<br>      "buyerId": "a1b2c3d4-0000-4000-8000-0000000000n1",<br>      "buyerNo": "N01",<br>      "name": "サンプル仲卸1",<br>      "kind": "NAKAOROSHI",<br>      "qualification": { "basis": "KYOKA", "status": "VALID", "validTo": "2028-10-23", "daysToExpiry": 448 },<br>      "participationLimit": null<br>    }<br>  ],<br>  "overLimitReasonOptions": [<br>    { "code": "PRIOR_CONSENT", "label": "事前に了承済", "key": "1" },<br>    { "code": "DEPOSIT_TOPUP", "label": "保証金追加予定", "key": "2" },<br>    { "code": "OTHER", "label": "その他", "key": "3", "noteRequired": true }<br>  ]<br>}</pre> | `qualification.status`: `VALID` 有効 · `SUSPENDED` 一時停止 · `EXPIRED` 失効 · `UNDER_REVIEW` 再審査 · `NONE`（レコードなし）。`participationLimit` は `BAIBAI` のみ、`NAKAOROSHI` は `null`。`usedExclJpy` = 期 `periodKey` 内の相対＋せりの確定額（税抜、有効値）；`usedInclJpy` = floor(`usedExclJpy` × (100 + `taxRatePercent`) / 100) — 税率は `tax_rates` から、パラメータ `PARTICIPATION_LIMIT_TAX_CODE` のコードで取得（Q-TRD-02、【模擬】顧客、2026-11-25）；`remainingJpy` = `limitJpy` − `usedInclJpy`（負になりうる）。画面には両方の額を「使用額 ¥…（税込）／ 税抜 ¥…」と表示。それ以外の種別の参加者も実際の `kind` を付けて返し、クライアントは `E-TRD-004` を表示 |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | TRADE ロールがありません | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 422 | `q` が不正 | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "q" } }</pre> | |
| 5 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- 取得元: ビュー `v_qualification_current`、`v_buyer_period_usage`、`v_participant_current_deposit`（party）— ビューの列定義は [MKT_DB §4.0a](../../database-design/MKT_DB.md#40a-公開ビュー) を参照。
- 参加者のメールアドレス・住所は返しません（せり場の取引では個人データは不要）。
- Q-TRD-02 回答済み（税込）。**未決事項 / TBD:** 経理部が税率（軽減税率 8%?）を確認すること、また1つの期に2つの税率があるかどうか。
