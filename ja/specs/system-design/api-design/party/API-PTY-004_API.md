---
id: SPEC-PTY_API-004
title: 許可（仲卸）の変更申請の作成
type: system
subtype: api-design
api_id: API-PTY-004
endpoint: /api/v1/participants/{participantId}/permit-requests
method: POST
media_type: application/json
feature: party
screen_id: [SC-01-03, SC-01-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-PTY_PERMIT_LIFECYCLE-001, SPEC-PARTY_FUNC-001]
---

# API-PTY-004 — POST /api/v1/participants/{participantId}/permit-requests

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 元の `field`；許可が失効している状態での RENEW → 409 E-PTY-013 + `detail.nextAction`、古いエラーキーを削除（`detail` / `field` に置換） | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

仲卸の**許可**について申請を作成します: 新規（`NEW`）、更新（`RENEW`）、一時停止（`SUSPEND`）、再開（`RESUME`）、再審査開始（`REVIEW_START`）、再審査→有効（`REINSTATE`）。資格はすぐには変わりません — API-PTY-005 で確認者の確認を待ちます。許可専用のエンドポイントで、承認には使いません（ADR-003）。

**認証:** Session cookie `sid` + CSRF（ヘッダー `X-CSRF-Token`）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `participantId` | string | `6f1d…` | UUID、`kind = NAKAOROSHI` |  |
| 2 | Body Parameters | `kind` | string | `RENEW` | `NEW` · `RENEW`（起票者 SETTLE） · `SUSPEND` · `RESUME` · `REVIEW_START` · `REINSTATE`（起票者 STL-HEAD = 起案） |  |
| 3 | Body Parameters | `payload.permitNo` | string | `サンプル許可-N01` | ≤ 20、一意 | `NEW` のみ |
| 4 | Body Parameters | `payload.validFrom / validTo` | string | `2025-10-19 / 2028-10-23` | `YYYY-MM-DD`、`validTo ≥ validFrom` | `NEW` のみ |
| 5 | Body Parameters | `payload.permitConditions` | string | `（条件なし）` | ≤ 500 | [optional] `NEW`, `REINSTATE` |
| 6 | Body Parameters | `payload.newValidTo` | string | `2031-10-23` | 現在の `valid_to` より後 | `RENEW` は必須；`REINSTATE` は [optional] |
| 7 | Body Parameters | `payload.reviewResult / reviewedOn` | string | `適 / 2027-09-01` | 審査結果、≤ 500 | `REINSTATE` は必須 |
| 8 | Body Parameters | `reason` | string | `期限到来による更新` | 1–500 |  |

リクエストの例:

```json
{
  "kind": "RENEW",
  "payload": {
    "newValidTo": "2031-10-23"
  },
  "reason": "期限到来による更新（許可条件の見直し: 変更なし）"
}
```

> 共通ルール（Param Type、Data Type、`[optional]`、エラー本文 `{ "error": {…} }`、MFA、楽観的ロック、冪等性）: [`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | 申請を作成済み | <pre>{<br>&nbsp;&nbsp;"request": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "r-71…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"kind": "RENEW",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "ENTERED",<br>&nbsp;&nbsp;&nbsp;&nbsp;"label": "確認待ち",<br>&nbsp;&nbsp;&nbsp;&nbsp;"nextActor": "STL_HEAD",<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2027-09-20T09:12:00+09:00"<br>&nbsp;&nbsp;}<br>}</pre> | `status`: `ENTERED`（`NEW`, `RENEW`）· `PROPOSED`（種別 STL-HEAD の起案）。`label`: 「確認待ち」/「審査待ち」/「決裁待ち」。`nextActor`: `STL_HEAD` \| `OPS_HEAD` |
| 2 | 422 | ボディ / クエリの型が不正、または項目が不足（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "kind" } }</pre> | `E-CMN-007` |
| 3 | 422 | 理由が未入力 | <pre>{ "error": { "code": "E-PTY-007", "message": "理由を入力してください" } }</pre> | `E-PTY-007` |
| 4 | 422 | 更新の期限が不正 | <pre>{ "error": { "code": "E-PTY-014", "message": "新しい失効日は現在の失効日より後の日付にしてください", "detail": { "currentValidTo": "2028-10-23" } } }</pre> | `E-PTY-014` |
| 5 | 422 | 有効期間が不正 | <pre>{ "error": { "code": "E-PTY-020", "message": "有効期間の終了日は開始日以降にしてください" } }</pre> | `E-PTY-020` |
| 6 | 401 | ログインしていない / セッション切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 7 | 403 | ロール / 決裁・確認権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 8 | 404 | 参加者が見つからない（または RLS で非表示） | <pre>{ "error": { "code": "E-PTY-018", "message": "参加者が見つかりません" } }</pre> | `E-PTY-018` |
| 9 | 409 | 参加者が仲卸ではない | <pre>{ "error": { "code": "E-PTY-009", "message": "この種別では許可を登録できません", "detail": { "kind": "BAIBAI" } } }</pre> | `E-PTY-009` |
| 10 | 409 | 参加者は退会済み | <pre>{ "error": { "code": "E-PTY-010", "message": "この参加者は退会済みのため変更できません" } }</pre> | `E-PTY-010` |
| 11 | 409 | 状態遷移が不正（FIG-010） | <pre>{ "error": { "code": "E-PTY-013", "message": "この状態からは指定の操作はできません", "detail": { "currentStatus": "SUSPENDED", "kind": "RESUME" } } }</pre> | `E-PTY-013` |
| 12 | 409 | この資格に未処理の申請がある | <pre>{ "error": { "code": "E-PTY-011", "message": "処理中の申請があります。完了または却下の後に操作してください", "detail": { "openRequestId": "c1e0…" } } }</pre> | `E-PTY-011` |
| 13 | 409 | 許可番号が重複 | <pre>{ "error": { "code": "E-PTY-019", "message": "許可番号が既に使われています" } }</pre> | `E-PTY-019` |
| 14 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 作成 / 起案の段階では MFA 不要（MFA は決裁 / 確認の段階 — PARTY_DB 4.13 の列 10）。
- 許可が失効している状態での `RENEW` → 409 `E-PTY-013`、`detail` = `{ "currentStatus": "EXPIRED", "kind": "RENEW", "nextAction": "REVIEW_START" }`（Q-PTY-04 — 猶予期間なし、再審査へ進む）。`E-PTY-014`（422）は資格がまだ有効で `newValidTo ≤ valid_to` の場合のみ使用。
- 確認者向けに `notifications` を記録；監査 `PERMIT_REQUEST_CREATE`。
- テーブル `nakaoroshi_permit_requests`: PARTY_DB 0.3.1 §4.59.
- **未決事項 / TBD:** OPEN-DB-09, Q-PTY-01, Q-PTY-04
