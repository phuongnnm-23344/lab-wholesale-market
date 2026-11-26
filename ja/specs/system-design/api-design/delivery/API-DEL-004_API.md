---
id: SPEC-DEL_API-004
title: 引渡し例外・紛争の記録（紙の確認票の後入力を含む）
type: system
subtype: api-design
api_id: API-DEL-004
endpoint: /api/v1/delivery-exceptions
method: POST
media_type: application/json
feature: delivery
screen_id: [SC-06-04]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-06-04-001, SPEC-DEL_EXCEPTION_DISPUTE-001, SPEC-TRADE_DB-001, SPEC-ADJUST_DB-001]
---

# API-DEL-004 — POST /api/v1/delivery-exceptions

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 元の`field`；顧客 Q-DEL-01（オフラインでは記録しない）、Q-DEL-04（実際の引渡し数量のみ、単価・金額の項目なし） | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

引渡し時の例外（不足 / 過剰 / 返品 / 一部取消 / 争いあり）を記録します。金額が変わる例外: 取引日が未締めなら REVERSE / DELTA（`SAME_DAY`）を記録し、照合の要確認に入れます。取引日が締め済みなら調整は記録せず、`correctionRequired = true` を返して画面を修正申請へ誘導します。`PAPER_LATE`モードは、通信断時に手書きで署名済みの、争いのある引渡し確認票を後から入力するためのものです。

**認証:** Session cookie `sid` + CSRF（ヘッダ `X-CSRF-Token`）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Body Parameters | `tradeId` | string | `t-0005…` | 取引のUUID（`CONFIRMED`） |  |
| 2 | Body Parameters | `deliveryId` | string | `d-88…` | 関連する引渡し | [optional] |
| 3 | Body Parameters | `inputMode` | string | `ON_SITE` | `ON_SITE` 現場 · `PAPER_LATE` 紙→後入力 |  |
| 4 | Body Parameters | `exceptionCode` | string | `SHORTAGE` | `code_values.DELIVERY_EXCEPTION`: `SHORTAGE` 不足 · `EXCESS` 過剰 · `RETURN` 返品 · `PARTIAL_CANCEL` 一部取消 · `DISPUTE` 争いあり |  |
| 5 | Body Parameters | `qty` | string | `2.0` | 0より大きい小数、取引の単位に従う | `DISPUTE`以外は必須 |
| 6 | Body Parameters | `reasonCode` | string | `FRESHNESS` | 種類ごとの`code_values`理由 |  |
| 7 | Body Parameters | `description` | string | `鮮度不良の申し出` | 0〜500文字；`DISPUTE`のときは1〜500文字 | [optional]（`DISPUTE`を除く） |
| 8 | Body Parameters | `receiver` | object | `{"type":"SELF"}` | API-DEL-003と同じ | [optional] |
| 9 | Body Parameters | `paper.formNo` | string | `D-000123` | 1〜20文字、一意 | `PAPER_LATE`のとき必須 |
| 10 | Body Parameters | `paper.signedAt` | string | `2027-08-02T07:05:00+09:00` | 業務日内、現在時刻以前 | `PAPER_LATE`のとき必須 |
| 11 | Body Parameters | `paper.signerEmployeeNo` | string | `E1203` | 社員番号。DEL_HEAD、記録者と別人 | `PAPER_LATE` + `DISPUTE`のとき必須 |
| 12 | Body Parameters | `attachmentIds` | string[] | `["att-1…"]` | 共通APIでアップロード済み、`doc_class = DISPUTE_EVIDENCE` | `PAPER_LATE`のとき1件以上必須 |

例 body:

```json
{
  "tradeId": "t-0005…",
  "inputMode": "ON_SITE",
  "exceptionCode": "SHORTAGE",
  "qty": "2.0",
  "reasonCode": "SHORT_LOAD",
  "receiver": {
    "type": "SELF"
  }
}
```

> 共通規約（Param Type、Data Type、`[optional]`、エラー時のbody `{ "error": {…} }`、MFA、楽観ロック、冪等性）：[`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`：[`_common/error-codes.md`](../../../_common/error-codes.md)

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | 記録済み | <pre>{<br>&nbsp;&nbsp;"exception": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "x-31…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "OPEN",<br>&nbsp;&nbsp;&nbsp;&nbsp;"isDispute": false,<br>&nbsp;&nbsp;&nbsp;&nbsp;"affectsAmount": true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"slaDueAt": null<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"adjustmentCreated": true,<br>&nbsp;&nbsp;"correctionRequired": false,<br>&nbsp;&nbsp;"amountDeltaJpy": -5400<br>}</pre> | `adjustmentCreated`: REVERSE / DELTA を記録済み（取引日が未締め）。`correctionRequired`: 金額変更だが取引日が締め済み → 画面にボタンを表示 → SC-08-01。紛争: `isDispute = true`、`slaDueAt` はSLA（PRM-048）に従う |
| 2 | 422 | bodyまたはqueryの型誤り・項目欠落（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "tradeId" } }</pre> | `E-CMN-007` |
| 3 | 422 | 種類・理由が未入力 | <pre>{ "error": { "code": "E-DEL-011", "message": "例外の種類を選んでください" } }</pre> | `E-DEL-011` |
| 4 | 422 | 数量が未入力 | <pre>{ "error": { "code": "E-DEL-003", "message": "数量を入力してください（0より大きい値）" } }</pre> | `E-DEL-003` |
| 5 | 422 | 小数の単位誤り | <pre>{ "error": { "code": "E-DEL-004", "message": "kg は小数点以下1桁まで、箱・尾は整数で入力してください", "detail": { "unit": "CASE" } } }</pre> | `E-DEL-004` |
| 6 | 422 | 紛争の内容が未入力 | <pre>{ "error": { "code": "E-DEL-013", "message": "争いありの場合は内容を入力してください（500文字以内）" } }</pre> | `E-DEL-013` |
| 7 | 422 | 確認票の時刻誤り | <pre>{ "error": { "code": "E-DEL-015", "message": "紙で確認した時刻は業務日内・現在時刻以前で入力してください" } }</pre> | `E-DEL-015` |
| 8 | 422 | 署名者＝記録者 | <pre>{ "error": { "code": "E-DEL-016", "message": "記録者本人は確認できません" } }</pre> | `E-DEL-016` |
| 9 | 422 | 後入力時にスキャン未添付 | <pre>{ "error": { "code": "E-DEL-017", "message": "後入力の場合は確認票のスキャンを添付してください" } }</pre> | `E-DEL-017` |
| 10 | 422 | 署名者が配送部門責任者でない | <pre>{ "error": { "code": "E-DEL-018", "message": "署名した配送部門責任者の社員番号が正しくありません", "detail": { "signerEmployeeNo": "E9999" } } }</pre> | `E-DEL-018` |
| 11 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 12 | 403 | 役割・決裁権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 13 | 404 | 取引が見つからない | <pre>{ "error": { "code": "E-DEL-027", "message": "取引が見つかりません" } }</pre> | `E-DEL-027` |
| 14 | 409 | 取引が未確定 / 取消済み | <pre>{ "error": { "code": "E-DEL-008", "message": "この取引は確定していないため引渡しできません", "detail": { "tradeNo": "相対-0005" } } }</pre> | `E-DEL-008` |
| 15 | 409 | 確認票番号が使用済み | <pre>{ "error": { "code": "E-DEL-014", "message": "この確認票番号は既に登録されています", "detail": { "formNo": "D-000123" } } }</pre> | `E-DEL-014` |
| 16 | 409 | 数量が許容範囲を超過 | <pre>{ "error": { "code": "E-DEL-028", "message": "数量が対象の範囲を超えています（上限 18kg）", "detail": { "max": "18" } } }</pre> | `E-DEL-028` |
| 17 | 423 | 記録先の業務日がロック済み（`DAY_LOCKED`）— 画面C-24に表示 | <pre>{ "error": { "code": "E-CMN-003", "message": "{ date } は締め済みのため直接修正できません。訂正は修正申請で行います", "detail": { "businessDate": "2027-08-02" } } }</pre> | `E-CMN-003` |
| 18 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 役割: DELIVERY, DEL-HEAD。記録時はMFAなし。
- オフラインでは実行しない（Q-DEL-01 【顧客（模擬）、2026-11-25】; ADR-008 §2.1）: 通信断時は連番付きの紙の引渡し確認票を使い、同日・日次締め前にこのAPIで後入力する（`inputMode = PAPER_LATE`）。
- 金額・単価のパラメータはない: 調整額 = −floor(`qty` × 確定単価)、減額方向のみ（Q-DEL-04）。
- 役割DELIVERYから`trade_fixes`に記録: 顧客は条件付きで同意（Q-DEL-04 【顧客（模擬）、2026-11-25】）。例外と`trade_fixes`は`delivery_exceptions.fix_id`で紐付ける（TRADE_DB 0.2.1 §4.35、Q-DEL-09）。ADR-004 0.2.1 §2.2。
- ファイルのアップロードは共通の添付APIを使用（未仕様化 — [`specs/_index.md`](../../../_index.md) の DEP-03。提案は [`_common/api-list.md`](../../../_common/api-list.md) §4）。
- Q-DEL-01、Q-DEL-04、Q-DEL-05、Q-DEL-06、Q-DEL-09 は回答済み 【顧客（模擬）、2026-11-25】。
- **未決事項 / TBD:** なし
