---
id: SPEC-TRD_API-006
title: せり場の結果の確認
type: system
subtype: api-design
api_id: API-TRD-006
endpoint: /api/v1/seri-sessions/{sessionId}/confirm
method: POST
media_type: application/json
feature: trade
screen_id: [SC-05-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-05-02-001, SPEC-TRADE_FUNC-001, SPEC-TRADE_SERI_CONFIRM-001, SPEC-TRADE_QUALIFICATION_CHECK-001]
---

# API-TRD-006 — POST /api/v1/seri-sessions/{sessionId}/confirm

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | 顧客 Q-TRD-05: `cancelTradeIds`（行の取消、ロットは販売公開中に戻る）、E-TRD-015 / E-TRD-018 の `NOW_CONFIRMABLE`；Q-TRD-02 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

確認者（最終判断を行う人 — CAP-HUMAN-01）が、せり場の選択済みの行を確認します。全件成功するか、全件失敗します: 選択された各行は、呼び出し時点で許可 / 承認 ＋ 数量 ＋ 参加上限（売買参加者のみ、積み上げ）を再チェックします。✖確定不可の行は **自動で取り消しません**: 確認者が「取消（資格なし・不成立）」（`cancelTradeIds` で送信）または「差し戻し（番号誤り）」（API-TRD-007、この API を呼ぶ前）を選びます — Q-TRD-05。残っている `PENDING` の行が未処理の場合は `E-TRD-015` のエラーです。処理: [TRADE_SERI_CONFIRM_TECH](../../../trade/technical-design/TRADE_SERI_CONFIRM_TECH.md).

**認証:** Session cookie。ロール: TRADE。MFA なし。オンライン必須。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `sessionId` | string | `e7f8a9b0-0000-4000-8000-000000000003` | せりの回の UUID | |
| 2 | Body Parameters | `confirmTradeIds` | string[] | `["f000…0301","f000…0302"]` | 回の `PENDING` 行の id を1件以上 | |
| 2b | Body Parameters | `cancelTradeIds` | string[] | `["f000…0303"]` | ✖確定不可の行のうち、確認者が「取消（資格なし・不成立）」を選んだもの。`confirmTradeIds` と重複不可；各行は呼び出し時点で**まだ確認できない**こと | `[optional]`、既定値 `[]` |
| 3 | Body Parameters | `overLimitReasons` | object | `{ "f000…0302": { "code": "PRIOR_CONSENT", "note": null } }` | キー = `tradeId`；`code` は `PRIOR_CONSENT` · `DEPOSIT_TOPUP` · `OTHER` のいずれか；`note` ≤ 200、`OTHER` の場合は必須 | `[optional]` |
| 4 | Body Parameters | `samePersonReason` | string | `確認者不在のため` | ≤ 200。呼び出し元が入力者の場合は必須 | `[optional]` |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 確認済み | <pre>{<br>  "confirmedCount": 11,<br>  "cancelledTradeNos": ["せり-0303"],<br>  "sessionStatus": "CONFIRMED",<br>  "confirmedAt": "2027-08-02T03:52:00+09:00"<br>}</pre> | 差し戻し中の行が残っている場合は `sessionStatus = ENTERING` |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | TRADE ロールがありません | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | 回が存在しません | <pre>{ "error": { "code": "E-TRD-024", "message": "対象のせりの回が見つかりません" } }</pre> | |
| 5 | 409 | 回が確認待ちでない | <pre>{ "error": { "code": "E-TRD-013", "message": "この回は確認待ちではありません（確定済）" } }</pre> | |
| 6 | 409 | 行の状態が変わった（`cancelTradeIds` の行が今は確認可能 — `reason: NOW_CONFIRMABLE`を含む） | <pre>{ "error": { "code": "E-TRD-018", "message": "確認中に状態が変わった行があります。一覧を更新してください（せり-0305）", "detail": { "rows": [ { "displayNo": "せり-0305", "reason": "INSUFFICIENT_QTY" } ] } } }</pre> | 行は1件も記録されない |
| 7 | 409 | 確定時刻前 / デッドロック | <pre>{ "error": { "code": "E-TRD-012", "message": "取引の確定は 02:00 以降にできます" } }</pre> | または `E-CMN-006` |
| 8 | 422 | 参加上限超過の理由が不足 | <pre>{ "error": { "code": "E-TRD-007", "message": "今期の参加上限を超えます。超過理由を選択してください（上限 ¥3,000,000 / 今期確定済 ¥2,989,440（税込） / 今回 ¥32,130（税込））", "detail": { "tradeNos": ["せり-0302"] } } }</pre> | または `E-TRD-008` |
| 9 | 422 | その他の条件エラー | <pre>{ "error": { "code": "E-TRD-014", "message": "入力者と同じ人が確認する場合は理由を入力してください", "field": "samePersonReason" } }</pre> | 考えられるコード: `E-TRD-014`, `015`, `016`, `E-CMN-007` |
| 10 | 423 | 業務日は締め済み | <pre>{ "error": { "code": "E-CMN-003", "message": "2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。" } }</pre> | |
| 11 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- 仲卸の行、または超過していない行の超過理由は無視されます。
- 取消の行: `CANCEL`、理由は「資格なし・不成立（{原因}）」、取消者は確認者、数量は減らさず、ロットは販売公開中に戻る / 残る。買受人を変更するパラメータはありません — せりの結果はせり場が決めるもので、2番目に高い値を付けた人を繰り上げることはしません（Q-TRD-05、ルール 3）。
- **未決事項 / TBD:** Q-TRD-04。
