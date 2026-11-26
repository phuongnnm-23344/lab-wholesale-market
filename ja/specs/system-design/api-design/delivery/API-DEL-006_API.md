---
id: SPEC-DEL_API-006
title: 配送部門責任者による確認 / 紛争の結論（MFA）
type: system
subtype: api-design
api_id: API-DEL-006
endpoint: /api/v1/delivery-exceptions/{exceptionId}/confirmation
method: POST
media_type: application/json
feature: delivery
screen_id: [SC-06-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-06-05-001, SPEC-DEL_EXCEPTION_DISPUTE-001, SPEC-TRADE_DB-001, CAP-HUMAN-01]
---

# API-DEL-006 — POST /api/v1/delivery-exceptions/{exceptionId}/confirmation

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 元の`field`；顧客 Q-DEL-07 / Q-DEL-08 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

最終決裁者（CAP-HUMAN-01）が、争いのある引渡し1件について結論を記録します: `COMPLETED`、`PARTIAL_RETURN`（金額変更あり）、`CONTINUE_DISPUTE`（紛争へ移行）。MFAを必須とし、自己確認は禁止です。紙の確認票で確認者≠署名者の場合は、理由の入力と、スキャンの表示を必須とします。

**認証:** Session cookie `sid` + CSRF（ヘッダ `X-CSRF-Token`）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `exceptionId` | string | `x-31…` | 例外のUUID |  |
| 2 | Body Parameters | `conclusion` | string | `PARTIAL_RETURN` | `COMPLETED` · `PARTIAL_RETURN` · `CONTINUE_DISPUTE` |  |
| 3 | Body Parameters | `returnQty` | string | `2.0` | 0より大きい小数、引渡済以下 | `PARTIAL_RETURN`で例外に数量がない場合は必須 |
| 4 | Body Parameters | `comment` | string | `買受人と合意` | 0〜500文字；`CONTINUE_DISPUTE`のときは1〜500文字 | [optional] |
| 5 | Body Parameters | `signerAbsentReason` | string | `署名者が非番` | 1〜200文字 | 呼び出し者≠紙の署名者の場合は必須 |
| 6 | Body Parameters | `scanViewedAt` | string | `2027-08-02T09:18:40+09:00` | スキャンを開いた時刻 | `signerAbsentReason`と同時に必須 |

例 body:

```json
{
  "conclusion": "PARTIAL_RETURN",
  "returnQty": "2.0",
  "comment": "鮮度不良分 2kg を返品として合意"
}
```

> 共通規約（Param Type、Data Type、`[optional]`、エラー時のbody `{ "error": {…} }`、MFA、楽観ロック、冪等性）：[`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`：[`_common/error-codes.md`](../../../_common/error-codes.md)

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 確認済み | <pre>{<br>&nbsp;&nbsp;"confirmation": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "dc-9…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"conclusion": "PARTIAL_RETURN",<br>&nbsp;&nbsp;&nbsp;&nbsp;"confirmedBy": "桜 十郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;"mfaVerifiedAt": "2027-08-02T09:20:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;"paperConfirmedAt": "2027-08-02T07:05:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;"enteredAt": "2027-08-02T09:12:00+09:00"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"exceptionStatus": "RESOLVED",<br>&nbsp;&nbsp;"adjustmentCreated": true,<br>&nbsp;&nbsp;"correctionRequired": false,<br>&nbsp;&nbsp;"amountDeltaJpy": -5400<br>}</pre> | `CONTINUE_DISPUTE` → `exceptionStatus = OPEN`。画面に表示する3つの時刻（紙で確認 / 入力 / システム確認） |
| 2 | 422 | bodyまたはqueryの型誤り・項目欠落（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "conclusion" } }</pre> | `E-CMN-007` |
| 3 | 422 | 結論が未入力 | <pre>{ "error": { "code": "E-DEL-020", "message": "結論を選んでください" } }</pre> | `E-DEL-020` |
| 4 | 422 | 継続協議でコメント未入力 | <pre>{ "error": { "code": "E-DEL-021", "message": "継続協議の場合はコメントを入力してください" } }</pre> | `E-DEL-021` |
| 5 | 422 | 代理確認の理由が未入力 | <pre>{ "error": { "code": "E-DEL-022", "message": "署名者に代わって確認する場合は理由を入力してください" } }</pre> | `E-DEL-022` |
| 6 | 422 | スキャン未表示 | <pre>{ "error": { "code": "E-DEL-023", "message": "スキャンを表示して確認してから確定してください" } }</pre> | `E-DEL-023` |
| 7 | 422 | 返品数量が未入力 | <pre>{ "error": { "code": "E-DEL-026", "message": "返品数量を入力してください" } }</pre> | `E-DEL-026` |
| 8 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 9 | 403 | 役割・決裁権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 10 | 403 | 有効なMFA step-upが不足（ADR-002 §2.2） | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005` |
| 11 | 403 | 自己確認（PRM-111） | <pre>{ "error": { "code": "E-DEL-019", "message": "自分の記録のため確認できません" } }</pre> | `E-DEL-019` |
| 12 | 404 | 例外が見つからない | <pre>{ "error": { "code": "E-DEL-025", "message": "例外が見つかりません" } }</pre> | `E-DEL-025` |
| 13 | 409 | 確認済み | <pre>{ "error": { "code": "E-DEL-024", "message": "この争いは既に確認済みです" } }</pre> | `E-DEL-024` |
| 14 | 409 | 数量が許容範囲を超過 | <pre>{ "error": { "code": "E-DEL-028", "message": "数量が対象の範囲を超えています（上限 18kg）", "detail": { "max": "18" } } }</pre> | `E-DEL-028` |
| 15 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 権限: `DEL_HEAD` または有効な代行。MFA step-up（PREMISE §3.2）。
- オフラインでは実行しない（オフラインではMFAを行わない — ADR-008 §2.3-10）。
- 結論は`dispute_confirmations.conclusion`に保存する。継続協議は複数回記録できる（unique partial）— TRADE_DB 0.2.1 §4.36（Q-DEL-07）。
- `PARTIAL_RETURN`で取引日が締め済みの場合 → `correctionRequired = true`、画面はSC-08-01へ誘導。
- Q-DEL-08 は回答済み 【顧客（模擬）、2026-11-25】（MFAあり）。Q-DEL-07: 報告RPT-04で継続協議を絞り込み、各回の協議履歴を出力する要望（`report`に依存）。
- **未決事項 / TBD:** なし
