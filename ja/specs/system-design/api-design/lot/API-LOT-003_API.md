---
id: SPEC-LOT_API-003
title: ロットの検索 / 一覧
type: system
subtype: api-design
api_id: API-LOT-003
endpoint: /api/v1/lots
method: GET
media_type: application/json
feature: lot
screen_id: [SC-03-01, SC-03-05, SC-04-01, SC-03-03]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-LOT_FUNC-001, SPEC-SC-03-01-001, SPEC-SC-03-05-001, SPEC-SC-04-01-001]
---

# API-LOT-003 — GET /api/v1/lots

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-m07: [PL]ラベル; 顧客 Q-LOT-01: `q` は業務日の終わりまで仮番号にも一致 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

業務日のロットを、利用可能数量（ビュー `v_lot_available_qty`）とともに検索します。利用箇所: SC-03-01 [11]（登録直後の10件のロット）、SC-03-05 [4]（目利きが必要なロット。直近の結果と取引ありのフラグを含む）、SC-04-01 [1]（末尾番号による販売中ロットの候補）、SC-03-03（ロット一覧 — List 画面）。Function: [LOT_FUNC 2.4](../../../lot/function-specifications/LOT_FUNC.md#24-searchlots).

**認証:** Session cookie。閲覧できるロール: INTAKE, JUDGE, TRADE, SETTLE, STL-HEAD, OPS-HEAD（RLS `role_read_matrix`、L4-A06）。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Query Parameters | `date` | string | `2027-08-02` | 業務日 `YYYY-MM-DD`。既定値は現在開いている日 | `[optional]` |
| 2 | Query Parameters | `status` | string | `RECEIVED,INSPECTED` | `lot_status` の値を CSV で指定 | `[optional]` |
| 3 | Query Parameters | `onSale` | boolean | `true` | 利用可能数量 > 0 の `PUBLISHED` ロットのみ（この日へ持越しのロットを含む） | `[optional]` |
| 4 | Query Parameters | `q` | string | `5` | ロット番号の末尾（1–6 桁）、完全なロット番号、または **仮番号**（`K1-012`、`date` の業務日の中で完全一致）— Q-LOT-01 | `[optional]` |
| 5 | Query Parameters | `itemCode` | string | `MADAI` | 品目で絞り込み | `[optional]` |
| 6 | Query Parameters | `shipperId` | string | `0b6d…-0021` | 出荷者で絞り込み | `[optional]` |
| 7 | Query Parameters | `registeredBy` | string | `me` | `me` のみ | `[optional]` |
| 8 | Query Parameters | `include` | string | `latestInspection,hasTrades` | 追加で返す項目 | `[optional]` |
| 9 | Query Parameters | `sort` | string | `-registeredAt` | `lotNo`（既定）· `-registeredAt` | `[optional]` |
| 10 | Query Parameters | `limit` | Integer | `10` | 1–100、既定値 50 | `[optional]` |
| 11 | Query Parameters | `offset` | Integer | `0` | ≥ 0 | `[optional]` |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "date": "2027-08-02",<br>  "total": 1,<br>  "lots": [<br>    {<br>      "lotId": "6f1c2a4e-0000-4000-8000-000000000005",<br>      "lotNo": "L20270802-5",<br>      "status": "PUBLISHED",<br>      "itemCode": "KATSUO",<br>      "itemName": "サンプル鰹",<br>      "shipperCode": "0021",<br>      "shipperName": "サンプル第一丸",<br>      "unit": "KG",<br>      "qtyReceived": 80.0,<br>      "availableQty": 66.0,<br>      "registeredAt": "2027-08-02T03:58:00+09:00",<br>      "latestInspection": { "grade": "A", "inspectedByName": "桜 二郎", "inspectedAt": "2027-08-02T03:10:00+09:00" },<br>      "hasTrades": true<br>    }<br>  ]<br>}</pre> | `latestInspection` / `hasTrades` は `include` で指定された場合のみ返します。未記録の場合 `latestInspection` は `null` |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | ロットを閲覧できないロール | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 422 | クエリ不正 | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "date" } }</pre> | |
| 5 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- 常に日付条件と `limit` を付けます（M23）。600 ロット / 日 で p95 ≤ 500 ms — [PL]の社内目標で、NFR-PERF-01（検索 p95 ≤ 2s）より厳格。
- SC-04-01 は入力のたびに `onSale=true&q={数字}&limit=10` を呼び出します（デバウンス 150 ms）。
- `q` は仮番号（Q-LOT-01）に一致します: 受付 / 目利き / 相対の各画面で、箱に掛けた札の番号を入力すると、業務日の終わりまでロットが表示されます。結果には常に正式な `lotNo` を表示します。`CANCELLED`（仮受付の取消）のロットは、`status=CANCELLED` で絞り込まない限り返しません（監査用の照会）。
- **未決事項 / TBD:** 持越しロットの判定方法（`lot_status_history.carried_to_date` による）は E-12 / OPEN-L4-03 に依存します。
