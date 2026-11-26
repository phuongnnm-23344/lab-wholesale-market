---
id: SPEC-PTY_API-007
title: 承認申請の確認・決裁 / 却下
type: system
subtype: api-design
api_id: API-PTY-007
endpoint: /api/v1/approval-requests/{requestId}/transitions
method: POST
media_type: application/json
feature: party
screen_id: [SC-01-04, SC-01-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-PTY_APPROVAL_LIFECYCLE-001, SPEC-PARTY_FUNC-001]
---

# API-PTY-007 — POST /api/v1/approval-requests/{requestId}/transitions

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 元の `field`；顧客 Q-PTY-06: LIMIT_CHANGE を確認の流れから除外 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

承認申請を決定します: `DECIDE`（`NEW` / `RENEW` は照合部門長が確認、起案の種別は運用部門長が決裁）または `REJECT`。`DECIDE` は `baibai_approvals` と `baibai_approval_events` を1つのトランザクションで記録します。参加上限の変更は、この API では**行いません** — API-PTY-006 の `LIMIT_CHANGE` で一段階で行います（Q-PTY-06）。

**認証:** Session cookie `sid` + CSRF（ヘッダー `X-CSRF-Token`）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `requestId` | string | `q-55…` | 申請の UUID |  |
| 2 | Body Parameters | `action` | string | `DECIDE` | `DECIDE` · `REJECT` |  |
| 3 | Body Parameters | `comment` | string | `保証金・資力に問題なし` | ≤ 500 | `REJECT` は必須；`DECIDE` は [optional] |

リクエストの例:

```json
{
  "action": "DECIDE"
}
```

> 共通ルール（Param Type、Data Type、`[optional]`、エラー本文 `{ "error": {…} }`、MFA、楽観的ロック、冪等性）: [`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 決定済み | <pre>{<br>&nbsp;&nbsp;"request": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "q-55…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "DECIDED"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"approval": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "a9…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "VALID",<br>&nbsp;&nbsp;&nbsp;&nbsp;"validTo": "2031-10-23"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"event": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"event": "RENEWED",<br>&nbsp;&nbsp;&nbsp;&nbsp;"oldValidTo": "2028-10-23",<br>&nbsp;&nbsp;&nbsp;&nbsp;"newValidTo": "2031-10-23",<br>&nbsp;&nbsp;&nbsp;&nbsp;"decidedBy": "桜 七子",<br>&nbsp;&nbsp;&nbsp;&nbsp;"mfaVerifiedAt": "2027-09-20T10:05:00+09:00"<br>&nbsp;&nbsp;}<br>}</pre> | `REJECT` → `approval` / `event` はなし |
| 2 | 422 | ボディ / クエリの型が不正、または項目が不足（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "action" } }</pre> | `E-CMN-007` |
| 3 | 422 | `REJECT` で却下理由が未入力 | <pre>{ "error": { "code": "E-PTY-023", "message": "却下理由を入力してください" } }</pre> | `E-PTY-023` |
| 4 | 401 | ログインしていない / セッション切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 5 | 403 | ロール / 決裁・確認権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 6 | 403 | 有効な MFA step-up がない（ADR-002 §2.2） | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005` |
| 7 | 403 | 呼び出し元が申請の起票者（入力 / 起案）本人 | <pre>{ "error": { "code": "E-PTY-012", "message": "申請者・起案者本人は決裁（確認）できません" } }</pre> | `E-PTY-012` |
| 8 | 404 | 申請が見つからない | <pre>{ "error": { "code": "E-PTY-024", "message": "申請が見つかりません" } }</pre> | `E-PTY-024` |
| 9 | 409 | 申請が終了済み、またはこの段階にない | <pre>{ "error": { "code": "E-PTY-017", "message": "この申請は既に処理済み、または処理できる段階ではありません", "detail": { "status": "DECIDED" } } }</pre> | `E-PTY-017` |
| 10 | 409 | 状態遷移が不正（FIG-010） | <pre>{ "error": { "code": "E-PTY-013", "message": "この状態からは指定の操作はできません", "detail": { "currentStatus": "SUSPENDED", "kind": "RESUME" } } }</pre> | `E-PTY-013` |
| 11 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- MFA: `DECIDE` には必須（セッション単位の step-up — PREMISE §3.2）。
- 確認者 ≠ 起票者；代行は対応する権限として扱う。
- **未決事項 / TBD:** OPEN-DB-09.
