---
id: SPEC-STL_API-005
title: 決裁 / 却下 修正申請（1次 / 2次）— REVERSE / DELTA の反映
type: system
subtype: api-design
api_id: API-STL-005
endpoint: /api/v1/corrections/{correctionId}/decisions
method: POST
media_type: application/json
feature: settle
screen_id: [SC-08-03]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-08-03-001, SPEC-STL_CORRECTION_DECIDE-001, SPEC-ADJUST_DB-001, ADR-004, ADR-007]
---

# API-STL-005 — POST /api/v1/corrections/{correctionId}/decisions

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 409 E-STL-029（LATE_ENTRYが反映先モジュールに拒否された）、元の`field`；顧客 Q-STL-04: 1次の権限；Q-STL-04/05 を締結 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

1段階の決裁結果を記録します。必要な段階数が揃い`APPROVE`となった場合は、同一transactionで反映します: `TRADE`は最も早い未締めの業務日にREVERSE + DELTAを生成（`period_id` = 元取引の期）。`LATE_ENTRY`は元の日付を持つ新しい記録を書き込みます。`KANNO` / `INCENTIVE`はステータス`APPROVED`にするのみ（次の期ロックでDELTA）。元の取引は決して書き換えません。

**認証:** Session cookie `sid` + CSRF（ヘッダ `X-CSRF-Token`）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `correctionId` | string | `cr-12…` | UUID |  |
| 2 | Body Parameters | `level` | Integer | `1` | 自分が決裁している段階（1 \| 2）。現在の段階と不一致 → 409 |  |
| 3 | Body Parameters | `decision` | string | `APPROVE` | `APPROVE` (決裁) · `REJECT` (却下) |  |
| 4 | Body Parameters | `comment` | string | `伝票で確認` | 200文字以内；`REJECT`のとき必須 | [optional]（`APPROVE`のとき） |

例 body:

```json
{
  "level": 2,
  "decision": "APPROVE",
  "comment": "伝票スキャンで確認"
}
```

> 共通規約（Param Type、Data Type、`[optional]`、エラー時のbody `{ "error": {…} }`、MFA、楽観ロック、冪等性）：[`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`：[`_common/error-codes.md`](../../../_common/error-codes.md)

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 決裁を記録済み | <pre>{<br>&nbsp;&nbsp;"correction": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "cr-12…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "APPROVED",<br>&nbsp;&nbsp;&nbsp;&nbsp;"statusLabel": "決裁・反映済",<br>&nbsp;&nbsp;&nbsp;&nbsp;"appliedBusinessDate": "2027-09-15"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"approval": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"level": 2,<br>&nbsp;&nbsp;&nbsp;&nbsp;"decision": "APPROVE",<br>&nbsp;&nbsp;&nbsp;&nbsp;"approver": "桜 九郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;"delegatedFor": null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"mfaVerifiedAt": "2027-09-15T11:02:00+09:00"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"records": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"id": "adj-1…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"kind": "REVERSE",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N04",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qtyDelta": -60,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"amountDeltaJpy": -114000,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"businessDate": "2027-09-15",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"periodId": "2027-08"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"id": "adj-2…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"kind": "DELTA",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qtyDelta": 60,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"amountDeltaJpy": 414000,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"businessDate": "2027-09-15",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"periodId": "2027-08"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"nextPendingId": "cr-15…"<br>}</pre> | 2段階申請の1次 → `status = FIRST_APPROVED`、`records = []`。`REJECT` → `REJECTED`。`nextPendingId` は「次の決裁待ちへ」ボタン用（なければ null） |
| 2 | 422 | bodyまたはqueryの型誤り・項目欠落（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "decision" } }</pre> | `E-CMN-007` |
| 3 | 422 | 却下理由が未入力 | <pre>{ "error": { "code": "E-STL-025", "message": "却下理由を入力してください（200文字以内）" } }</pre> | `E-STL-025` |
| 4 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 5 | 403 | 役割・決裁権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 6 | 403 | 有効なMFA step-upが不足（ADR-002 §2.2） | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005` |
| 7 | 403 | 起票者本人による決裁 | <pre>{ "error": { "code": "E-STL-023", "message": "申請者本人は決裁できません" } }</pre> | `E-STL-023` |
| 8 | 403 | 同一人物が1次・2次を決裁 | <pre>{ "error": { "code": "E-STL-024", "message": "1次と2次を同じ人は決裁できません" } }</pre> | `E-STL-024` |
| 9 | 404 | 修正申請が見つからない | <pre>{ "error": { "code": "E-STL-021", "message": "修正申請が見つかりません" } }</pre> | `E-STL-021` |
| 10 | 409 | 決裁待ちでない | <pre>{ "error": { "code": "E-STL-022", "message": "この修正申請は決裁待ちではありません", "detail": { "status": "REJECTED" } } }</pre> | `E-STL-022` |
| 11 | 409 | `level`が現在の段階と不一致（別の人が直前に処理） | <pre>{ "error": { "code": "E-STL-026", "message": "この修正申請は既に処理されました（決裁段階が変わりました）", "detail": { "currentLevel": "2" } } }</pre> | `E-STL-026` |
| 12 | 409 | 数量増加時にロットの数量が不足 | <pre>{ "error": { "code": "E-STL-027", "message": "ロットの残数量が不足しているため反映できません（残 12kg）", "detail": { "available": "12" } } }</pre> | `E-STL-027` |
| 13 | 409 | 記録できる未締めの業務日がない | <pre>{ "error": { "code": "E-STL-028", "message": "計上できる未締めの業務日がありません" } }</pre> | `E-STL-028` |
| 13b | 409 | `LATE_ENTRY`が反映先モジュールに拒否された | <pre>{ "error": { "code": "E-STL-029", "message": "反映先の処理でエラーになりました：仲卸の許可が有効ではないため確定できません（失効・有効期限 2027/08/31）", "detail": { "sourceCode": "E-TRD-005", "sourceMessage": "仲卸の許可が有効ではないため確定できません（失効・有効期限 2027/08/31）" } } }</pre> | `E-STL-029`；全体をロールバック |
| 14 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 権限: 1次 = `STL_HEAD` または事前指定の代行 STL_HEAD（`OPS_HEAD`が`level = 1`で送信 → 403 `E-CMN-002` — Q-STL-04、PRM-033）。2次 = `OPS_HEAD` または代行 OPS_HEAD。起票者は決裁不可。同一人物は1次・2次を兼ねられない（unique DB）。
- MFA step-up 10分（★なし）。`nextPendingId`で連続して決裁する場合、期間内はコードを再入力させない。
- `LATE_ENTRY`が反映先モジュールに拒否された → 409 `E-STL-029`。そのモジュールの元のコードは`detail.sourceCode`に入る（コードごとにHTTPステータスを1つとする規則を維持）。
- 記録は必ず`OPEN`の業務日に書き込む。トリガー `enforce_open_business_day` が最後の防御線。
- Q-STL-04、Q-STL-05 は回答済み 【顧客（模擬）、2026-11-25】。
- **未決事項 / TBD:** 事前指定の代行 STL_HEAD の人選（UAT前。経営陣に確認 — Q-STL-04）
