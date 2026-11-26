---
id: SPEC-PTY_API-003
title: 保証金額の変更（履歴行を追加）
type: system
subtype: api-design
api_id: API-PTY-003
endpoint: /api/v1/participants/{participantId}/deposits
method: POST
media_type: application/json
feature: party
screen_id: [SC-01-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-01-02-001, SPEC-PTY_APPROVAL_LIFECYCLE-001, SPEC-PARTY_DB-001]
---

# API-PTY-003 — POST /api/v1/participants/{participantId}/deposits

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 元の `field`；顧客 Q-PTY-06: 照合部門長のみ、MFA step-up（403 E-CMN-005）；Q-PTY-02 を終了 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

SC-01-02 のダイアログ [9] から `participant_deposit_history` に1行を追加します — 古い値は上書きしません（ルール 4、PRM-046）。保証金に連動する参加上限を持つ売買参加者の場合、限度額は `effectiveFrom` から変わります。レスポンスで変更後の限度額を返し、画面に表示します（顧客 #20）。

**認証:** Session cookie `sid` + CSRF（ヘッダー `X-CSRF-Token`）+ MFA step-up（有効なセッション内、[api-conventions §4](../../../_common/api-conventions.md#4-mfa-step-up)）。**照合部門長のみ（STL-HEAD または代行）** — Q-PTY-06 【顧客（模擬）、2026-11-25】。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `participantId` | string | `6f1d…` | UUID |  |
| 2 | Body Parameters | `depositJpy` | Integer | `6000000` | 0 – 99,999,999,999、現行の値と異なること |  |
| 3 | Body Parameters | `effectiveFrom` | string | `2027-09-01` | `YYYY-MM-DD`、現在の業務日以上 (Q-PTY-02) |  |
| 4 | Body Parameters | `reason` | string | `保証金の追加差入れ` | 1–200 文字 |  |

> 共通ルール（Param Type、Data Type、`[optional]`、エラー本文 `{ "error": {…} }`、MFA、楽観的ロック、冪等性）: [`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | 追加済み | <pre>{<br>&nbsp;&nbsp;"deposit": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"depositJpy": 6000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"effectiveFrom": "2027-09-01"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"limitMode": "DEPOSIT",<br>&nbsp;&nbsp;"limitAfter": 6000000<br>}</pre> | `limitAfter`: `effectiveFrom` から有効な限度額（売買参加者でない場合は `null`）。`limitMode = INDIVIDUAL` → `limitAfter` は個別に設定した限度額で、変わらない |
| 2 | 422 | ボディ / クエリの型が不正、または項目が不足（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "depositJpy" } }</pre> | `E-CMN-007` |
| 3 | 422 | 保証金額が不正 | <pre>{ "error": { "code": "E-PTY-005", "message": "保証金額は0以上の整数で入力してください" } }</pre> | `E-PTY-005` |
| 4 | 422 | 現行の値と同じ | <pre>{ "error": { "code": "E-PTY-022", "message": "現在の保証金額と同じです" } }</pre> | `E-PTY-022` |
| 5 | 422 | 発効日が過去 | <pre>{ "error": { "code": "E-PTY-006", "message": "発効日は本日（業務日）以降の日付を入力してください" } }</pre> | `E-PTY-006` |
| 6 | 422 | 理由が未入力 | <pre>{ "error": { "code": "E-PTY-007", "message": "理由を入力してください" } }</pre> | `E-PTY-007` |
| 7 | 401 | ログインしていない / セッション切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 8 | 403 | ロール / 決裁・確認権限が不足（照合事務局 SETTLE を含む — Q-PTY-06） | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 8b | 403 | Step-up MFA の有効期限切れ | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | クライアントは C-30 を開いて再送 |
| 9 | 404 | 参加者が見つからない（または RLS で非表示） | <pre>{ "error": { "code": "E-PTY-018", "message": "参加者が見つかりません" } }</pre> | `E-PTY-018` |
| 10 | 409 | 発効日が重複 | <pre>{ "error": { "code": "E-PTY-008", "message": "同じ発効日の保証金変更が既にあります", "detail": { "effectiveFrom": "2027-09-01" } } }</pre> | `E-PTY-008` |
| 11 | 409 | 参加者は退会済み | <pre>{ "error": { "code": "E-PTY-010", "message": "この参加者は退会済みのため変更できません" } }</pre> | `E-PTY-010` |
| 12 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- ロール: **STL-HEAD のみ**（照合部門長、または有効な代行）。照合事務局（SETTLE）は自分で保証金を変更できません — Q-PTY-06 【顧客（模擬）、2026-11-25】。一段階で、確認者は**なし**、新しい決裁フローもありません。MFA step-up あり（`DEPOSIT` の場合は保証金が参加上限を決めるため、参加上限の変更と同じレベル — Q-PTY-07）。`audit_logs` に変更前 / 変更後を記録（操作者、代行、MFA の時刻）— FR-AUDIT-01。
- `LIMIT_CHANGED` は生成しない（`DEPOSIT` の限度額は導出値 — SPEC-PTY_APPROVAL_LIFECYCLE-001 §5）。
- インデックス `uq_deposit_participant_from` で、DB レベルでも日付の重複を防ぎます。
- Q-PTY-02 回答済み: 遡及しない。発効日 = 入力時点以降の業務日；経理が実際に入金を受けた日は `reason` に記録。**未決事項 / TBD:** 経理部に確認 — システム上の保証金は毎期の経理の元帳と一致する必要があるか（一致する → 照合項目を追加、別途見積もり）。
