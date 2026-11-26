---
id: SPEC-LOT_API-001
title: 本登録待ちの仮受付一覧
type: system
subtype: api-design
api_id: API-LOT-001
endpoint: /api/v1/lots/provisional
method: GET
media_type: application/json
feature: lot
screen_id: [SC-03-01]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-03-01-001, SPEC-LOT_FUNC-001]
---

# API-LOT-001 — GET /api/v1/lots/provisional

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-m07: [PL]ラベルの性能目標（NFR-PERF-01より厳格） | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

業務日中の未処理の仮受付（`PROVISIONAL`）ロットを返し、受付担当が SC-03-01 [1] で選択して本登録できるようにします。リンク [12] 用に、未同期・照合待ちのオフライン仮受付の件数も併せて返します。データは書き込みません。Function: [LOT_FUNC 2.1](../../../lot/function-specifications/LOT_FUNC.md#21-listpendingprovisionallots).

**認証:** Session cookie（共用端末 — 現在の利用者はPINで判別、ADR-002）。ロール: INTAKE。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | N/A | | | | パラメータなし。業務日はサーバーが決定 | |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "businessDate": "2027-08-02",<br>  "items": [<br>    {<br>      "lotId": "6f1c2a4e-0000-4000-8000-000000000012",<br>      "provisionalNo": "K1-012",<br>      "receivedAt": "2027-08-02T01:42:00+09:00",<br>      "itemCode": "MADAI",<br>      "itemName": "真鯛",<br>      "unit": "KG",<br>      "qtyProvisional": 120.0,<br>      "shipperCode": null,<br>      "receivedByName": "桜 一郎"<br>    }<br>  ],<br>  "unsyncedCount": 2<br>}</pre> | `items` は `receivedAt` の昇順に並べます。空なら `[]`。`shipperCode` は岸壁で出荷者が選択済みの場合に入ります。`unsyncedCount` は `offline_sync_records` のうち `PROVISIONAL_LOT` で、`result` が `PENDING`・`HELD` のものの件数です |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | INTAKE ロールがありません | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- エラー形式 `{ "error": { code, message, field?, detail?, traceId? } }` はプロトタイプ（`api-error-response.ts`）のとおり維持します。共通ルールは [`_common/api-conventions.md`](../../../_common/api-conventions.md) を参照。
- 1日最大約150行、ページングなし。p95 ≤ 500 ms — [PL]の社内目標で、NFR-PERF-01（検索 p95 ≤ 2s）より厳格。
- **未決事項 / TBD:** 仮番号の形式（`K{端末番号}-{連番}`）— ワイヤーフレーム SC-03-02 の Q-SC0302-01。
