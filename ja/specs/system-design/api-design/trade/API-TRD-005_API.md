---
id: SPEC-TRD_API-005
title: 確認用のせり場の取得（各行の事前評価付き）
type: system
subtype: api-design
api_id: API-TRD-005
endpoint: /api/v1/seri-sessions/{sessionId}
method: GET
media_type: application/json
feature: trade
screen_id: [SC-05-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-05-02-001, SPEC-TRADE_FUNC-001, SPEC-TRADE_SERI_CONFIRM-001]
---

# API-TRD-005 — GET /api/v1/seri-sessions/{sessionId}

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | 顧客 Q-TRD-02（税込 / 税抜）、Q-TRD-05（確定不可の行が差し戻し / 取消の選択を待つ） | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

SC-05-02 のためにせり場と結果の行を返します。`PENDING` の行については、サーバーが番号 `no` の順に **事前評価** します（書き込みせず、ロックもしません）: 現在有効な許可 / 承認、ロットの数量、買受人ごとに積み上げた参加上限（売買参加者のみ）— 選択済みの状態を表示し、[4]、[5] を表示するため。最終結果は API-TRD-006 で決まります。Function: [TRADE_FUNC 2.7](../../../trade/function-specifications/TRADE_FUNC.md#27-getserisessionforconfirm).

**認証:** Session cookie。ロール: TRADE；SETTLE, STL-HEAD, OPS-HEAD（閲覧のみ）。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `sessionId` | string | `e7f8a9b0-0000-4000-8000-000000000003` | せりの回の UUID | |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "session": {<br>    "sessionId": "e7f8a9b0-0000-4000-8000-000000000003",<br>    "sessionNo": 3,<br>    "businessDate": "2027-08-02",<br>    "status": "ENTERING",<br>    "enteredByName": "桜 三郎",<br>    "submittedAt": "2027-08-02T03:40:00+09:00",<br>    "confirmedByName": null,<br>    "confirmedAt": null,<br>    "samePersonReason": null<br>  },<br>  "viewerIsEntrant": false,<br>  "canConfirm": true,<br>  "rows": [<br>    {<br>      "tradeId": "f0000000-0000-4000-8000-000000000302",<br>      "no": 2,<br>      "displayNo": "せり-0302",<br>      "status": "PENDING",<br>      "lotNo": "L20270802-22",<br>      "itemName": "鰤",<br>      "qty": 35.0,<br>      "unit": "KG",<br>      "unitPriceJpy": 850,<br>      "amountJpy": 29750,<br>      "buyer": { "buyerNo": "B07", "name": "サンプル売買参加者7", "kind": "BAIBAI" },<br>      "qualification": { "basis": "SHONIN", "status": "VALID", "validTo": "2028-03-31" },<br>      "confirmable": true,<br>      "notConfirmableReason": null,<br>      "overLimit": { "limitJpy": 3000000, "usedBeforeInclJpy": 2989440, "cumulativeInclJpy": 3021570, "cumulativeExclJpy": 2797750, "isOver": true }<br>    }<br>  ],<br>  "overLimitReasonOptions": [<br>    { "code": "PRIOR_CONSENT", "label": "事前了承済", "key": "1" },<br>    { "code": "DEPOSIT_TOPUP", "label": "保証金追加予定", "key": "2" },<br>    { "code": "OTHER", "label": "その他", "key": "3", "noteRequired": true }<br>  ]<br>}</pre> | `notConfirmableReason`: `QUALIFICATION_INVALID` · `INSUFFICIENT_QTY` · `LOT_NOT_ON_SALE` · `null`。`overLimit` は仲卸の場合 `null`；上限との比較額は **税込**（Q-TRD-02）: `usedBeforeInclJpy` = この回より前に期内で確定した税込額、`cumulativeInclJpy` = `No` 順にこの行までの税込累計、`cumulativeExclJpy` = 同じ額の税抜。`canConfirm` = ロールが TRADE かつ回が `ENTERING`。`rows` には閲覧用に `DRAFT`（差し戻し中）、`CONFIRMED`、`CANCELLED` の行も含む |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | 閲覧できないロール | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | 回が存在しません | <pre>{ "error": { "code": "E-TRD-024", "message": "対象のせりの回が見つかりません" } }</pre> | |
| 5 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- 事前評価ではロットをロックしないため、操作した時点とずれることがあります。ずれた場合は API-TRD-006 が 409 `E-TRD-018` を返します。
- Q-TRD-05 回答済み: `confirmable = false` の行には SC-05-02 に「差し戻し（番号誤り）」「取消（資格なし・不成立）」の2つのボタンを表示し、自動では取り消しません。**未決事項 / TBD:** Q-TRD-04。
