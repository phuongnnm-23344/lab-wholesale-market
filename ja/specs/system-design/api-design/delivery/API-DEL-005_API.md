---
id: SPEC-DEL_API-005
title: 配送部門責任者の確認待ち紛争一覧
type: system
subtype: api-design
api_id: API-DEL-005
endpoint: /api/v1/delivery-exceptions/disputes
method: GET
media_type: application/json
feature: delivery
screen_id: [SC-06-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-06-05-001, SPEC-DEL_EXCEPTION_DISPUTE-001]
---

# API-DEL-005 — GET /api/v1/delivery-exceptions/disputes

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 元の`field`で項目をロック | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

SC-06-05向けに`is_dispute = true`かつ`status = OPEN`の例外を返します。確認票の詳細、記録者、SLA、閲覧者が確認可能かのフラグを含みます（自己確認は禁止 — PRM-111）。

**認証:** Session cookie `sid`（読み取り — CSRF不要）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Query Parameters | `scope` | string | `confirmable` | `confirmable`（既定 — 閲覧者本人の記録行を除外）· `all` | [optional] |

> 共通規約（Param Type、Data Type、`[optional]`、エラー時のbody `{ "error": {…} }`、MFA、楽観ロック、冪等性）：[`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`：[`_common/error-codes.md`](../../../_common/error-codes.md)

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 成功 | <pre>{<br>&nbsp;&nbsp;"items": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"exceptionId": "x-31…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"receivedAt": "2027-08-02T07:20:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeNo": "相対-0005",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description": "鮮度不良の申し出",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"recordedBy": "桜 次郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"inputMode": "PAPER_LATE",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"paper": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"formNo": "D-000123",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"signedAt": "2027-08-02T07:05:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"signerName": "桜 十郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"enteredAt": "2027-08-02T09:12:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"attachmentId": "att-1…"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qty": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"confirmed": 30.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"delivered": 12.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"exception": 2.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unit": "KG"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"slaDueAt": "2027-08-05T07:20:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"slaOverdue": false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"canConfirm": true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isSigner": false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"businessDateLocked": false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unitPriceJpy": 2700<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> | `canConfirm = false` は閲覧者が記録者の場合、またはDEL_HEAD権限がない場合。`isSigner`: 閲覧者が紙の署名者か（false → 画面で理由入力＋スキャン表示を要求） |
| 2 | 422 | bodyまたはqueryの型誤り・項目欠落（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "scope" } }</pre> | `E-CMN-007` |
| 3 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 4 | 403 | 役割・決裁権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 5 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 参照できる役割: DEL-HEAD（操作）、SETTLE / STL-HEAD / OPS-HEAD（参照のみ — `canConfirm = false`）。
- `slaDueAt`の昇順で並べる（SLA超過の行を先頭）。
- **未決事項 / TBD:** なし
