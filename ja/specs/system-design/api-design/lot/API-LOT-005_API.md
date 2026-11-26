---
id: SPEC-LOT_API-005
title: マスタから出荷者を検索
type: system
subtype: api-design
api_id: API-LOT-005
endpoint: /api/v1/master/shippers
method: GET
media_type: application/json
feature: lot
screen_id: [SC-03-01, SC-03-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-LOT_FUNC-001, SPEC-RULE_DB-001]
---

# API-LOT-005 — GET /api/v1/master/shippers

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

コードまたは名称で出荷者（荷主・船の名義）の候補を返します。対象は SC-03-01 の項目 [4] と SC-03-05 の絞り込み [2] です（自由入力の代わりに、マスタ SC-10-07 のコードを使用 — D15）。使用中のマスタ `shippers` を読み取るだけです。Function: [LOT_FUNC 2.7](../../../lot/function-specifications/LOT_FUNC.md#27-searchshippers).

**認証:** Session cookie。ロール: INTAKE, JUDGE, TRADE, SETTLE, STL-HEAD, OPS-HEAD。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Query Parameters | `q` | string | `002` | 1–20 文字。コードの先頭または名称の一部に一致。全角は半角に正規化 | |
| 2 | Query Parameters | `limit` | Integer | `10` | 1–20、既定値 10 | `[optional]` |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "shippers": [<br>    { "id": "0b6d0000-0000-4000-8000-000000000021", "code": "0021", "name": "サンプル第一丸" }<br>  ]<br>}</pre> | 並び順: コードが完全一致 → コードの先頭が一致 → 名称。該当なしは `[]` |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | 閲覧できないロール | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 422 | `q` が空 / 長すぎる | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "q" } }</pre> | |
| 5 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- マスタ `shippers` はモジュール `rule`（RULE_DB）に属します。現在は lot だけが使うため feature `lot` に置きます。他の feature で必要になった場合は、ID を維持したまま `api-design/` 直下へ移します（[`_common/api-list.md`](../../../_common/api-list.md) §2）。
- **未決事項 / TBD:** なし。
