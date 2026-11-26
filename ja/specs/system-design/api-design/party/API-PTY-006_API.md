---
id: SPEC-PTY_API-006
title: 承認（売買参加者）の変更申請 / 参加上限の作成
type: system
subtype: api-design
api_id: API-PTY-006
endpoint: /api/v1/participants/{participantId}/approval-requests
method: POST
media_type: application/json
feature: party
screen_id: [SC-01-04, SC-01-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-PTY_APPROVAL_LIFECYCLE-001, SPEC-PARTY_FUNC-001]
---

# API-PTY-006 — POST /api/v1/participants/{participantId}/approval-requests

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 元の `field`；顧客 Q-PTY-06: LIMIT_CHANGE は照合部門長による一段階（行 1b, 7b） | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

売買参加者の**承認**について申請を作成します: 届出による新規（`NEW`）、更新（`RENEW`）、および起案の種別（`SUSPEND`, `RESUME`, `REVIEW_START`, `REINSTATE`）。専用のエンドポイントで、許可には使いません（ADR-003）。

**例外 `LIMIT_CHANGE`（参加上限の変更）— 一段階:** 照合部門長（STL-HEAD / 代行）のみが呼び出し、MFA step-up を行い、同じトランザクション内で**即時に適用**します（UPDATE `baibai_approvals.participation_limit_jpy` ＋ INSERT `baibai_approval_events.LIMIT_CHANGED` の変更前 / 変更後）。**保留中の申請は作らず、確認者もいません** — Q-PTY-06 【顧客（模擬）、2026-11-25】（顧客は照合事務局が自分で変更することを望まず、確認者を増やす必要もないとのこと）。API を増やさないためこのエンドポイントに置きます；レスポンスは他の種別と異なります（4 の行 1b を参照）。

**認証:** Session cookie `sid` + CSRF（ヘッダー `X-CSRF-Token`）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `participantId` | string | `6f1d…` | UUID、`kind = BAIBAI` |  |
| 2 | Body Parameters | `kind` | string | `LIMIT_CHANGE` | `NEW` · `RENEW`（起票者 SETTLE） · `SUSPEND` · `RESUME` · `REVIEW_START` · `REINSTATE`（起票者 STL-HEAD、起案） · `LIMIT_CHANGE`（**STL-HEAD、一段階、MFA**） |  |
| 3 | Body Parameters | `payload.approvalNo` | string | `サンプル承認-B01` | ≤ 20、一意 | `NEW` のみ |
| 4 | Body Parameters | `payload.validFrom / validTo` | string | `2025-10-19 / 2028-10-23` | `YYYY-MM-DD` | `NEW` のみ |
| 5 | Body Parameters | `payload.screeningNote` | string | `保証金・資力 確認済` | 保証金・資力の簡易確認を記録、≤ 500 | `NEW` は必須 |
| 6 | Body Parameters | `payload.newValidTo` | string | `2031-10-23` | 現在の `valid_to` より後 | `RENEW` は必須 |
| 7 | Body Parameters | `payload.limitMode` | string | `INDIVIDUAL` | `DEPOSIT` · `INDIVIDUAL` | `NEW`, `LIMIT_CHANGE` は必須 |
| 8 | Body Parameters | `payload.participationLimitJpy` | Integer | `8000000` | ≥ 1 | `INDIVIDUAL` の場合は必須 |
| 9 | Body Parameters | `payload.effectiveOn` | string | `2027-10-01` | 現在の業務日以上；この日を含む期から適用 | `LIMIT_CHANGE` は必須 |
| 10 | Body Parameters | `reason` | string | `取引拡大の申出` | 1–500 |  |

リクエストの例:

```json
{
  "kind": "LIMIT_CHANGE",
  "payload": {
    "limitMode": "INDIVIDUAL",
    "participationLimitJpy": 8000000,
    "effectiveOn": "2027-10-01"
  },
  "reason": "取引拡大の申出（保証金は据え置き）"
}
```

> 共通ルール（Param Type、Data Type、`[optional]`、エラー本文 `{ "error": {…} }`、MFA、楽観的ロック、冪等性）: [`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | 申請を作成済み（`NEW` / `RENEW` / 起案の種別） | <pre>{<br>&nbsp;&nbsp;"request": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "q-55…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"kind": "RENEW",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "ENTERED",<br>&nbsp;&nbsp;&nbsp;&nbsp;"label": "確認待ち",<br>&nbsp;&nbsp;&nbsp;&nbsp;"nextActor": "STL_HEAD",<br>&nbsp;&nbsp;&nbsp;&nbsp;"payload": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"newValidTo": "2031-10-23"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>}</pre> | `LIMIT_CHANGE` はこの行を返さない — 1b を参照 |
| 1b | 201 | `LIMIT_CHANGE` を適用済み（保留中の申請はなし） | <pre>{<br>&nbsp;&nbsp;"limitChange": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"event": "LIMIT_CHANGED",<br>&nbsp;&nbsp;&nbsp;&nbsp;"limitMode": "INDIVIDUAL",<br>&nbsp;&nbsp;&nbsp;&nbsp;"oldLimitJpy": null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"oldLimitDisplayJpy": 5000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"newLimitJpy": 8000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"effectiveOn": "2027-10-01",<br>&nbsp;&nbsp;&nbsp;&nbsp;"decidedBy": "桜 七子",<br>&nbsp;&nbsp;&nbsp;&nbsp;"mfaVerifiedAt": "2027-09-20T10:05:00+09:00"<br>&nbsp;&nbsp;}<br>}</pre> | `LIMIT_CHANGED` の行を1件（`decided_by` = 呼び出し元 = `created_by`）。`oldLimitJpy = null` = それまでは保証金に連動 |
| 2 | 422 | ボディ / クエリの型が不正、または項目が不足（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "kind" } }</pre> | `E-CMN-007` |
| 3 | 422 | 限度額が不正 / 変更なし | <pre>{ "error": { "code": "E-PTY-016", "message": "参加上限は1円以上で入力するか、「保証金額に連動」を選んでください" } }</pre> | `E-PTY-016` |
| 4 | 422 | 発効日が過去 | <pre>{ "error": { "code": "E-PTY-006", "message": "発効日は本日（業務日）以降の日付を入力してください" } }</pre> | `E-PTY-006` |
| 5 | 422 | 更新の期限が不正 | <pre>{ "error": { "code": "E-PTY-014", "message": "新しい失効日は現在の失効日より後の日付にしてください" } }</pre> | `E-PTY-014` |
| 6 | 422 | 理由が未入力 | <pre>{ "error": { "code": "E-PTY-007", "message": "理由を入力してください" } }</pre> | `E-PTY-007` |
| 7 | 401 | ログインしていない / セッション切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 7b | 403 | `LIMIT_CHANGE` で step-up MFA がない | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005`；クライアントは C-30 を開いて再送 |
| 8 | 403 | ロール / 決裁・確認権限が不足（例: SETTLE が `LIMIT_CHANGE` を送信） | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 9 | 404 | 参加者が見つからない（または RLS で非表示） | <pre>{ "error": { "code": "E-PTY-018", "message": "参加者が見つかりません" } }</pre> | `E-PTY-018` |
| 10 | 409 | 参加者が売買参加者ではない | <pre>{ "error": { "code": "E-PTY-009", "message": "この種別では承認を登録できません", "detail": { "kind": "NAKAOROSHI" } } }</pre> | `E-PTY-009` |
| 11 | 409 | 参加者は退会済み | <pre>{ "error": { "code": "E-PTY-010", "message": "この参加者は退会済みのため変更できません" } }</pre> | `E-PTY-010` |
| 12 | 409 | 状態遷移が不正（FIG-010） | <pre>{ "error": { "code": "E-PTY-013", "message": "この状態からは指定の操作はできません", "detail": { "currentStatus": "SUSPENDED", "kind": "RESUME" } } }</pre> | `E-PTY-013` |
| 13 | 409 | この資格に未処理の申請がある | <pre>{ "error": { "code": "E-PTY-011", "message": "処理中の申請があります。完了または却下の後に操作してください", "detail": { "openRequestId": "c1e0…" } } }</pre> | `E-PTY-011` |
| 14 | 409 | 承認番号が重複 | <pre>{ "error": { "code": "E-PTY-019", "message": "承認番号が既に使われています" } }</pre> | `E-PTY-019` |
| 15 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 専用の `PROPOSE` / 審査の段階はありません（承認は簡易確認 — PARTY_DB 4.15 CHECK ≠ `REVIEWED`）。
- テーブル `baibai_approval_requests`: PARTY_DB 0.3.1 §4.60.
- `LIMIT_CHANGE` は `E-PTY-011` の対象外（申請を作らないため）。ただし承認は `VALID` / `SUSPENDED` でなければならない（`EXPIRED` は不可）→ それ以外は `E-PTY-013`。
- Q-PTY-01（資格ごとに未処理の申請は1件）、Q-PTY-06, Q-PTY-07 回答済み 【顧客（模擬）、2026-11-25】。**未決事項 / TBD:** OPEN-DB-09。
