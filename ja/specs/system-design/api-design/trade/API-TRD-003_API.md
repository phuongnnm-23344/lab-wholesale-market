---
id: SPEC-TRD_API-003
title: 取引一覧
type: system
subtype: api-design
api_id: API-TRD-003
endpoint: /api/v1/trades
method: GET
media_type: application/json
feature: trade
screen_id: [SC-04-01, SC-04-03]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-04-01-001, SPEC-TRADE_FUNC-001]
---

# API-TRD-003 — GET /api/v1/trades

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-m07: [PL]ラベル: 性能目標（NFR-PERF-01より厳格） | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

業務日の範囲で取引を一覧にし、**有効な**値（原値 + 調整、ビュー `v_trade_effective`）を返します。SC-04-01 の [10] は `mine=true&limit=5` を使用します。SC-04-01 は、タイムアウト後や通信が回復した後に「取引が記録されたかどうか」を確認するためにも使います。SC-04-03（一覧画面）は全フィルタを使います。Function: [TRADE_FUNC 2.5](../../../trade/function-specifications/TRADE_FUNC.md#25-listtrades).

**認証:** Session cookie。ロール: TRADE, SETTLE, STL-HEAD, OPS-HEAD（RLS）。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Query Parameters | `dateFrom` | string | `2027-08-02` | 業務日の開始日。既定値は開いている日 | `[optional]` |
| 2 | Query Parameters | `dateTo` | string | `2027-08-02` | 業務日の終了日。範囲は 31 日以内 | `[optional]` |
| 3 | Query Parameters | `channel` | string | `AITAI` | `AITAI` · `SERI` | `[optional]` |
| 4 | Query Parameters | `status` | string | `CONFIRMED` | `trade_status` を CSV で指定 | `[optional]` |
| 5 | Query Parameters | `mine` | boolean | `true` | 呼び出し元が確定した取引のみ | `[optional]` |
| 6 | Query Parameters | `buyerNo` | string | `N01` | | `[optional]` |
| 7 | Query Parameters | `lotNo` | string | `L20270802-5` | | `[optional]` |
| 8 | Query Parameters | `sort` | string | `-confirmedAt` | `-confirmedAt`（既定）· `tradeNo` | `[optional]` |
| 9 | Query Parameters | `limit` | Integer | `5` | 1–100、既定値 50 | `[optional]` |
| 10 | Query Parameters | `offset` | Integer | `0` | | `[optional]` |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "total": 1,<br>  "trades": [<br>    {<br>      "tradeId": "d4e5f6a7-0000-4000-8000-000000000005",<br>      "displayNo": "相対-0005",<br>      "channel": "AITAI",<br>      "status": "CONFIRMED",<br>      "businessDate": "2027-08-02",<br>      "lotNo": "L20270802-5",<br>      "itemName": "サンプル鰹",<br>      "buyerNo": "N01",<br>      "buyerName": "サンプル仲卸1",<br>      "qty": 2.0,<br>      "unit": "KG",<br>      "unitPriceJpy": 1200,<br>      "amountJpy": 2400,<br>      "hasAdjustments": false,<br>      "confirmedAt": "2027-08-02T04:31:12+09:00",<br>      "confirmedByName": "桜 太郎"<br>    }<br>  ]<br>}</pre> | `qty`, `unitPriceJpy`, `amountJpy`, `buyer*` は有効値。`hasAdjustments` = 当日訂正 / 修正申請がある場合 |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | 取引を閲覧できないロール | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 422 | クエリ不正 / 範囲が 31 日超 | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "dateTo" } }</pre> | |
| 5 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- 常に日付範囲とページングを付けます（M23）。1,200 取引 / 日 で p95 ≤ 500 ms — [PL]の社内目標で、NFR-PERF-01（検索 p95 ≤ 2s）より厳格。
- **未決事項 / TBD:** なし。
