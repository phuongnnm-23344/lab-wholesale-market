---
id: SPEC-TRD_API-007
title: せり結果の行を入力者へ差し戻し
type: system
subtype: api-design
api_id: API-TRD-007
endpoint: /api/v1/seri-sessions/{sessionId}/send-back
method: POST
media_type: application/json
feature: trade
screen_id: [SC-05-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-05-02-001, SPEC-TRADE_FUNC-001, SPEC-TRADE_SERI_CONFIRM-001]
---

# API-TRD-007 — POST /api/v1/seri-sessions/{sessionId}/send-back

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | 顧客 Q-TRD-05: 差し戻し（番号誤り）、2番目に高い値を付けた人の繰り上げはしない | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

誤って入力されたせり結果の行を、SC-05-01 で入力者が修正できるよう差し戻します: `PENDING` の行は `DRAFT` になり、理由付きの `REJECT` イベントを記録し、入力者にアプリ内通知を送ります。数量は減らさず、回は `ENTERING` のまま残ります。確認者が買受人番号の入力誤りを疑う ✖確定不可の行にも使います — ボタン「差し戻し（番号誤り）」（Q-TRD-05）: 入力者はせりの原票と照合し、**実際に落札した人** の番号に修正します。BR-PERM-01 は次の確認時に再チェックします。Function: [TRADE_FUNC 2.10](../../../trade/function-specifications/TRADE_FUNC.md#210-appfn_send_back_seri_results); 手順: [TRADE_SERI_CONFIRM_TECH §4.5](../../../trade/technical-design/TRADE_SERI_CONFIRM_TECH.md#45-差し戻し-fn_send_back_seri_results-api-trd-007).

**認証:** Session cookie。ロール: TRADE。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `sessionId` | string | `e7f8a9b0-0000-4000-8000-000000000003` | せりの回の UUID | |
| 2 | Body Parameters | `tradeIds` | string[] | `["f000…0304"]` | 回の `PENDING` 行の id を1件以上 | |
| 3 | Body Parameters | `reason` | string | `単価の入力誤り` | 1–200 文字 | |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 差し戻し済み | <pre>{ "sentBackCount": 1 }</pre> | |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | TRADE ロールがありません | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | 回が存在しません | <pre>{ "error": { "code": "E-TRD-024", "message": "対象のせりの回が見つかりません" } }</pre> | |
| 5 | 409 | 回が `ENTERING` でない / 行が `PENDING` でない | <pre>{ "error": { "code": "E-TRD-018", "message": "確認中に状態が変わった行があります。一覧を更新してください（せり-0304）" } }</pre> | または `E-TRD-013` |
| 6 | 422 | 理由が未入力 | <pre>{ "error": { "code": "E-TRD-017", "message": "差し戻しの理由を入力してください", "field": "reason" } }</pre> | |
| 7 | 423 | 業務日は締め済み | <pre>{ "error": { "code": "E-CMN-003", "message": "2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。" } }</pre> | |
| 8 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- アプリ内通知は通知モジュールの outbox 経由で記録します。通知の送信に失敗しても差し戻しは失敗しません。
- この API には買受人を変更するフィールドはありません（入力者に戻すだけ）— 2番目に高い値を付けた人の繰り上げはしません（ルール 3）。
- **未決事項 / TBD:** Q-TRD-04。
