---
id: SPEC-TRD_API-008
title: 当日訂正 / 取消 GD（未締めの日）
type: system
subtype: api-design
api_id: API-TRD-008
endpoint: /api/v1/trades/{tradeId}/fixes
method: POST
media_type: application/json
feature: trade
screen_id: [SC-04-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [WF-SC-04-05, SPEC-TRADE_FUNC-001, SPEC-TRADE_SAME_DAY_FIX-001]
---

# API-TRD-008 — POST /api/v1/trades/{tradeId}/fixes

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

SC-04-05 から、**未締め**の業務日に確定した取引を修正（`FIX`）または取消（`CANCEL`）します: 理由が必要で、2段階の決裁は不要です。元の取引は上書きしません — `trade_fixes` ＋ REVERSE / DELTA ＋ 数量の履歴行を作成します。締め済みの日は 423 を返し、クライアントは内容を SC-08-01 へ引き継ぎます。処理: [TRADE_SAME_DAY_FIX_TECH](../../../trade/technical-design/TRADE_SAME_DAY_FIX_TECH.md).

**認証:** Session cookie。ロール: TRADE。MFA なし。オンライン必須。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `tradeId` | string | `d4e5f6a7-0000-4000-8000-000000000005` | 元の取引の UUID | |
| 2 | Body Parameters | `kind` | string | `FIX` | `FIX` · `CANCEL` | |
| 3 | Body Parameters | `buyerId` | string | `a1b2…00n5` | 修正後の買受人。送らない場合は据え置き | `[optional]` `CANCEL` の場合は無視 |
| 4 | Body Parameters | `qty` | number | `28.0` | 修正後の数量；> 0、引渡済みの数量以上、単位に合う小数 | `[optional]` |
| 5 | Body Parameters | `unitPriceJpy` | Integer | `2700` | 修正後の単価 ≥ 1 | `[optional]` |
| 6 | Body Parameters | `reasonCode` | string | `WEIGHING_ERROR` | `FIX_REASON`: `WEIGHING_ERROR` 計量の誤り · `BUYER_MISTAKE` 買受人の取り違え · `PRICE_ERROR` 単価の誤り · `OTHER` その他 | |
| 7 | Body Parameters | `reasonNote` | string | `再計量` | ≤ 200。`OTHER` の場合は必須 | `[optional]` |
| 8 | Body Parameters | `overLimitReasonCode` | string | `PRIOR_CONSENT` | 新しい買受人・新しい金額が参加上限を超える場合（売買参加者） | `[optional]` |
| 9 | Body Parameters | `overLimitNote` | string | | ≤ 200 | `[optional]` |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | 記録済み | <pre>{<br>  "fixId": "c0ffee00-0000-4000-8000-000000000001",<br>  "kind": "FIX",<br>  "displayNo": "相対-0005",<br>  "adjustments": [<br>    { "kind": "REVERSE", "buyerNo": "N05", "qtyDelta": -30.0, "amountDeltaJpy": -81000 },<br>    { "kind": "DELTA", "buyerNo": "N05", "qtyDelta": 28.0, "amountDeltaJpy": 75600 }<br>  ],<br>  "maxBuyerDiffInclJpy": 5832,<br>  "buyerChanged": false,<br>  "needsSettleReview": false<br>}</pre> | `needsSettleReview = true` → 画面に「この訂正は締め前に照合部門が確認します」と表示 |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | TRADE ロールがありません | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | 取引が存在しません | <pre>{ "error": { "code": "E-TRD-023", "message": "対象の取引が見つかりません" } }</pre> | |
| 5 | 409 | 状態により修正できない | <pre>{ "error": { "code": "E-TRD-026", "message": "引渡済のため取り消せません。差異は例外登録で処理してください" } }</pre> | 考えられるコード: `E-TRD-002`, `019`, `022`, `026`, `027`, `E-CMN-006` |
| 6 | 422 | データ / 資格が不正 | <pre>{ "error": { "code": "E-TRD-006", "message": "売買参加者の承認が有効ではないため確定できません（一時停止・有効期限 2028/03/31）", "field": "buyerId" } }</pre> | 考えられるコード: `E-TRD-003`..`011`, `020`, `021`, `E-CMN-007` |
| 7 | 423 | 取引の業務日は締め済み | <pre>{ "error": { "code": "E-CMN-003", "message": "2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。" } }</pre> | クライアントは **内容を保持** し、「修正申請として提出 →」ボタンで SC-08-01 に内容を入れておく（顧客 #5） |
| 8 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- SC-04-05 はワイヤーフレームのみ（L4-D02）。ロジックは trade feature に属するため、API はここで設計しています。
- 201 の後、クライアントは API-TRD-004 を呼び、「訂正」/「取消」の入った伝票を再印刷します。
- **未決事項 / TBD:** Q-LOT-05（販売済みの数量が戻ったとき、`CLOSED` のロットを再び販売するか）。
