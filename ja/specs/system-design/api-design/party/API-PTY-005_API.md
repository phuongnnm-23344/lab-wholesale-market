---
id: SPEC-PTY_API-005
title: 許可申請の起案 / 決裁・確認 / 却下
type: system
subtype: api-design
api_id: API-PTY-005
endpoint: /api/v1/permit-requests/{requestId}/transitions
method: POST
media_type: application/json
feature: party
screen_id: [SC-01-03, SC-01-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-PTY_PERMIT_LIFECYCLE-001, SPEC-PARTY_FUNC-001]
---

# API-PTY-005 — POST /api/v1/permit-requests/{requestId}/transitions

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 項目のロックを元の `field` に設定 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

許可申請を次の段階へ進めます: `PROPOSE`（照合部門長が審査結果を記録 ＋ 起案 — 新規のみ）、`DECIDE`（運用部門長が新規 / 一時停止 / 再審査を決裁；照合部門長が更新を確認 — PRM-121）、`REJECT`（却下）。`DECIDE` は `nakaoroshi_permits` と `nakaoroshi_permit_events` を1つのトランザクションで記録します。

**認証:** Session cookie `sid` + CSRF（ヘッダー `X-CSRF-Token`）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `requestId` | string | `r-71…` | 申請の UUID |  |
| 2 | Body Parameters | `action` | string | `DECIDE` | `PROPOSE` · `DECIDE` · `REJECT` |  |
| 3 | Body Parameters | `reviewResult` | string | `適（条件付き）` | 1–500 | `PROPOSE` は必須 |
| 4 | Body Parameters | `reviewedOn` | string | `2027-09-18` | 今日以前 | `PROPOSE` は必須 |
| 5 | Body Parameters | `permitConditions` | string | `取扱品目: 鮮魚` | ≤ 500 | [optional] `PROPOSE` |
| 6 | Body Parameters | `comment` | string | `条件確認済み` | ≤ 500 | `REJECT` は必須；その他は [optional] |

リクエストの例:

```json
{
  "action": "DECIDE",
  "comment": "審査結果・条件を確認"
}
```

> 共通ルール（Param Type、Data Type、`[optional]`、エラー本文 `{ "error": {…} }`、MFA、楽観的ロック、冪等性）: [`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 段階を進めた | <pre>{<br>&nbsp;&nbsp;"request": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "r-71…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "DECIDED"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"permit": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "p-12…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "VALID",<br>&nbsp;&nbsp;&nbsp;&nbsp;"validTo": "2031-10-23"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"events": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"event": "RENEWED",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"oldValidTo": "2028-10-23",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"newValidTo": "2031-10-23",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"decidedBy": "桜 七子",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"mfaVerifiedAt": "2027-09-20T10:01:00+09:00"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> | `PROPOSE` → `request.status = PROPOSED` のみ。`REJECT` → `request.status = REJECTED`、`permit` / `events` はなし。`DECIDE` で新規 → `events` に `REVIEWED` ＋ `REGISTERED` を含む |
| 2 | 422 | ボディ / クエリの型が不正、または項目が不足（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "action" } }</pre> | `E-CMN-007` |
| 3 | 422 | `PROPOSE` で審査結果が未入力 | <pre>{ "error": { "code": "E-PTY-015", "message": "審査結果を入力してください" } }</pre> | `E-PTY-015` |
| 4 | 422 | `REJECT` で却下理由が未入力 | <pre>{ "error": { "code": "E-PTY-023", "message": "却下理由を入力してください" } }</pre> | `E-PTY-023` |
| 5 | 401 | ログインしていない / セッション切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 6 | 403 | ロール / 決裁・確認権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 7 | 403 | 有効な MFA step-up がない（ADR-002 §2.2） | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005` |
| 8 | 403 | 呼び出し元が申請の起票者（入力 / 起案）本人 | <pre>{ "error": { "code": "E-PTY-012", "message": "申請者・起案者本人は決裁（確認）できません" } }</pre> | `E-PTY-012` |
| 9 | 404 | 申請が見つからない | <pre>{ "error": { "code": "E-PTY-024", "message": "申請が見つかりません" } }</pre> | `E-PTY-024` |
| 10 | 409 | 申請が終了済み、またはこの段階にない | <pre>{ "error": { "code": "E-PTY-017", "message": "この申請は既に処理済み、または処理できる段階ではありません", "detail": { "status": "DECIDED" } } }</pre> | `E-PTY-017` |
| 11 | 409 | 状態遷移が不正（FIG-010） | <pre>{ "error": { "code": "E-PTY-013", "message": "この状態からは指定の操作はできません", "detail": { "currentStatus": "SUSPENDED", "kind": "RESUME" } } }</pre> | `E-PTY-013` |
| 12 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 権限: `PROPOSE` = STL_HEAD；`DECIDE` = `RENEW` は STL_HEAD、それ以外は OPS_HEAD；`REJECT` = 現在の段階の確認者。有効な代行は対応する権限として扱い、監査には「…の代理として」と記録します。
- `DECIDE` には有効な MFA step-up が必要。クライアントは `E-CMN-005` を受けたら C-30 を開き、同じボディで再送します。
- 確認者 ≠ 起票者（CHECK DB `decided_by <> proposed_by`）。
- 現在の業務日から即時に有効（Q-PTY-05）。
- **未決事項 / TBD:** OPEN-DB-09（新規は運用部門長の決裁が必要か？）、Q-PTY-05
