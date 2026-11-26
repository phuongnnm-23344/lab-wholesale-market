---
id: SPEC-DEL_API-003
title: 引渡しの記録（1件または複数件・冪等）
type: system
subtype: api-design
api_id: API-DEL-003
endpoint: /api/v1/deliveries
method: POST
media_type: application/json
feature: delivery
screen_id: [SC-06-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-06-02-001, SPEC-DEL_RECORD-001, SPEC-TRADE_DB-001]
---

# API-DEL-003 — POST /api/v1/deliveries

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 項目エラーの`field`を`items[i].…`形式に変更し、旧エラーキーを削除（`detail` / `field`に置換）；顧客 Q-DEL-03: `receiver.name` は任意 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

1件の取引、または同一買受人の複数取引（ボタン「残りをすべて引渡し」）の引渡しを**1つのtransaction**で記録します。項目ごとの`clientRecordId`で冪等に処理します。同じ内容の再送は既存の結果を返し（200）、二重記録はしません。`sync`モジュールのオフライン同期経路も同じDB関数`fn_delivery_record`を使います。

**認証:** Session cookie `sid` + CSRF（ヘッダ `X-CSRF-Token`）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Header Parameters | `X-Device-Id` | string | `TAB-03` | 端末コード |  |
| 2 | Body Parameters | `items[].tradeId` | string | `t-0005…` | 取引のUUID；1〜20項目 |  |
| 3 | Body Parameters | `items[].qty` | string | `6.0` | 0より大きい小数；`KG`は小数点以下1桁まで、`CASE` / `PIECE`は整数 | `isRemainingAll = false`のとき必須 |
| 4 | Body Parameters | `items[].isRemainingAll` | boolean | `false` | `true` = 残りすべてを引渡し（サーバーが残を自動取得） |  |
| 5 | Body Parameters | `items[].clientRecordId` | string | `0b9c6f3e-…` | 端末側で生成するUUID v4 — 冪等キー |  |
| 6 | Body Parameters | `receiver.type` | string | `SELF` | `SELF` 本人 · `PROXY` 代理 |  |
| 7 | Body Parameters | `receiver.name` | string | `代理 太郎` | 0〜50文字；`PROXY`で空の場合は「代理」を保存（Q-DEL-03） | [optional] |
| 8 | Body Parameters | `deviceRecordedAt` | string | `2027-08-02T07:15:22+09:00` | ボタン押下時の端末側時刻 |  |

例 body:

```json
{
  "items": [
    {
      "tradeId": "t-0005…",
      "qty": "6.0",
      "isRemainingAll": false,
      "clientRecordId": "0b9c6f3e-2a51-4f0e-9d3c-1f2b7c8e9a10"
    }
  ],
  "receiver": {
    "type": "SELF"
  },
  "deviceRecordedAt": "2027-08-02T07:15:22+09:00"
}
```

> 共通規約（Param Type、Data Type、`[optional]`、エラー時のbody `{ "error": {…} }`、MFA、楽観ロック、冪等性）：[`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`：[`_common/error-codes.md`](../../../_common/error-codes.md)

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | 記録済み（全項目が再送の場合は200） | <pre>{<br>&nbsp;&nbsp;"results": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"clientRecordId": "0b9c6f3e-…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deliveryId": "d-88…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeId": "t-0005…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qtyDelivered": 6.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deliveredTotal": 18.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"remaining": 12.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"status": "IN_PROGRESS",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"replayed": false<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> | `status` はAPI-DEL-001と同じ；`remaining = 0` → `COMPLETED`。`replayed = true` は項目が以前に記録済みの場合 |
| 2 | 422 | bodyまたはqueryの型誤り・項目欠落（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "items[0].tradeId" } }</pre> | `E-CMN-007` |
| 3 | 422 | 数量の未入力・誤り | <pre>{ "error": { "code": "E-DEL-003", "message": "数量を入力してください（0より大きい値）", "field": "items[0].qty" } }</pre> | `E-DEL-003` |
| 4 | 422 | 小数の単位誤り | <pre>{ "error": { "code": "E-DEL-004", "message": "kg は小数点以下1桁まで、箱・尾は整数で入力してください", "detail": { "unit": "CASE" } } }</pre> | `E-DEL-004` |
| 5 | 422 | 受取人の未選択 | <pre>{ "error": { "code": "E-DEL-006", "message": "受取人（本人／代理）を選んでください" } }</pre> | `E-DEL-006` |
| 6 | 422 | 代理人の氏名が50文字超 | <pre>{ "error": { "code": "E-DEL-007", "message": "代理人の氏名は50文字以内で入力してください", "field": "receiver.name" } }</pre> | `E-DEL-007` |
| 7 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 8 | 403 | 役割・決裁権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 9 | 404 | 取引が見つからない | <pre>{ "error": { "code": "E-DEL-027", "message": "取引が見つかりません" } }</pre> | `E-DEL-027` |
| 10 | 409 | 残を超過（別の端末が直前に引渡した可能性あり） | <pre>{ "error": { "code": "E-DEL-005", "message": "残数量（12kg）を超えています", "field": "items[0].qty", "detail": { "tradeId": "t-0005…", "remaining": "12.0" } } }</pre> | `E-DEL-005` |
| 11 | 409 | 取引が未確定 / 取消済み | <pre>{ "error": { "code": "E-DEL-008", "message": "この取引は確定していないため引渡しできません", "detail": { "tradeNo": "相対-0005" } } }</pre> | `E-DEL-008` |
| 12 | 409 | 取引は引渡し済み（残なし） | <pre>{ "error": { "code": "E-DEL-009", "message": "この取引は引渡しが完了しています" } }</pre> | `E-DEL-009` |
| 13 | 409 | 同じ`clientRecordId`で内容が異なる | <pre>{ "error": { "code": "E-DEL-010", "message": "同じ記録IDで異なる内容が送信されました", "detail": { "clientRecordId": "0b9c6f3e-…" } } }</pre> | `E-DEL-010` |
| 14 | 423 | 記録先の業務日がロック済み（`DAY_LOCKED`）— 画面C-24に表示 | <pre>{ "error": { "code": "E-CMN-003", "message": "{ date } は締め済みのため直接修正できません。訂正は修正申請で行います", "detail": { "businessDate": "2027-08-02" } } }</pre> | `E-CMN-003` |
| 15 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 役割: DELIVERY, DEL-HEAD。MFAなし（PREMISE §3.2 — 通常の引渡し記録では確認しない）。
- 複数項目: 1項目でもエラーなら全項目を記録しない。`field` はパス形式で誤りの項目を示し（`items[2].qty`、`items[0].tradeId`）、`detail` はその項目のデータを持つ（例 `{ "tradeId": …, "remaining": "12.0" }`）— api-conventions §3.2。
- クライアント側でタイムアウトした場合は**同じ**`clientRecordId`で再送する（またはオフラインキューに積む）— 冪等性により安全。
- `business_date` はサーバーが決定する（ADR-005 §2.3）。前日の取引は当日の業務日に記録する。
- **未決事項 / TBD:** なし
