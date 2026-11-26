---
id: SPEC-RULE_API-002
title: API — 確認者による規則版の確認（→ 発効待ち、またはN2では決裁待ち）
type: system
subtype: api-design
api_id: API-RULE-002
endpoint: /api/v1/rule-versions/{versionId}/confirm
method: POST
media_type: application/json
feature: rule
screen_id: [SC-10-04]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-10-04-001, SPEC-RULE_VERSION-001, SPEC-RULE_FUNC-001, ADR-006, ADR-002, GOV-RULE-01, E-14]
---

# API-RULE-002 — POST /api/v1/rule-versions/{versionId}/confirm

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M01: 確認 `CHANGE` も**毎回コードを再入力**（`X-MFA-Token`必須、`purpose = RULE_CHANGE_CONFIRM`）、PREMISE §3.2 ★ / ADR-002 §2.2-6a に従う；G2-m01: Note camelCase | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

確認者（照合部門長）が `PENDING` の版を**確認**します: 起票者 ≠ 確認者、発効日が未来であること、発効日が他と重複しないこと、内容の妥当性、TC年度のquota（advisory lock）、E-14ポリシー → `APPROVED`（発効待ち）。N2分岐でROLLBACKかつ4回到達済みの場合は `PENDING` のまま保持し、運用部門長の決裁を待ちます（RULE_VERSION_TECH R1–R5）。

**認証:** Session cookie + `X-CSRF-Token` + MFA を両方の種類で**毎回コード再入力**（PREMISE §3.2 ★「規則の確認者」、ADR-002 §2.2-6a）: ヘッダ `X-MFA-Token` 必須。版が `CHANGE` のとき `purpose = RULE_CHANGE_CONFIRM`、`ROLLBACK` のとき `RULE_ROLLBACK_CONFIRM`。有効なセッション内のstep-upではtokenの代わりにはなりません（ [api-conventions §4](../../../_common/api-conventions.md#4-mfa-step-up)）。権限 `STL_HEAD`（または代行）。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `versionId` | string | `a1b2c3d4-0000-4000-8000-000000000004` | 版（`PENDING`） |  |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` |  |  |
| 3 | Body Parameters | `reason` | string | `第2版の率に戻すため` | 確認者の理由、1〜500文字；`ROLLBACK`のとき必須 | `[optional]`（`CHANGE`のとき） |
| 4 | Header Parameters | `X-MFA-Token` | string | `mfa_01JD…` | ワンタイムMFAトークン、120秒以内: `purpose = RULE_CHANGE_CONFIRM`（版 `CHANGE`）または `RULE_ROLLBACK_CONFIRM`（版 `ROLLBACK`） | すべての版で必須；`purpose`が不一致 → 403 `E-CMN-005` |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 確認済み | <pre>{<br>  "versionNo": 4,<br>  "status": "APPROVED",<br>  "awaitingSecondApproval": false,<br>  "effectiveFrom": "2027-10-01",<br>  "fiscalYear": 2027,<br>  "quotaUsedAfter": 3<br>}</pre> | N2かつROLLBACKでused ≥ 4の場合: `status: "PENDING"`、`awaitingSecondApproval: true`、`quotaUsedAfter` = 現在のused（未計上） |
| 2 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | クライアントはSC-00-01へ戻し、URLを保持する |
| 3 | 422 | 理由の未入力 / body不正 | <pre>{ "error": { "code": "E-RULE-007", "message": "理由を入力してください（500文字以内）。" } }</pre> | 形式エラーは `E-CMN-007` |
| 4 | 403 | MFAトークンの未送信 / 期限切れ / 使用済み（未ログインの場合は 401 `E-CMN-001`） | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005`；未ログインの場合は 401 `E-CMN-001` |
| 5 | 403 | 権限なし / 起票者による確認 | <pre>{ "error": { "code": "E-RULE-002", "message": "起票者本人は確認・取消できません。" } }</pre> | `STL_HEAD`権限がない場合は `E-CMN-002` |
| 6 | 404 | 版が存在しない | <pre>{ "error": { "code": "E-RULE-001", "message": "指定された規則版が見つかりません。" } }</pre> |  |
| 7 | 409 | quota超過 | <pre>{ "error": { "code": "E-RULE-006", "message": "今年度の発効回数が上限（4回）に達しています。この版は確認できません。", "detail": { "fiscalYear": 2027, "used": 4 } } }</pre> |  |
| 8 | 409 | N1: 4回到達後のロールバック | <pre>{ "error": { "code": "E-RULE-009", "message": "4回到達後のロールバックは確認できません。誤った率で計算された期は修正申請「奨励金」で訂正してください。", "detail": { "fiscalYear": 2027, "used": 4 } } }</pre> | N1分岐の場合のみ |
| 9 | 409 | 状態 / 発効日の誤り / 重複 / 内容の誤り | <pre>{ "error": { "code": "E-RULE-004", "message": "発効日（2027/10/01）が現在の業務日以前のため確認できません。取り消して発効日を見直してください。", "detail": { "effectiveFrom": "2027-10-01", "businessDate": "2027-10-01" } } }</pre> | いずれか: `E-RULE-003`、`E-RULE-004`、`E-RULE-005`、`E-RULE-013` |
| 10 | 500 | システムエラー（全体をロールバック、途中書き込みなし） | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | 画面C-26に表示（`traceId`付き） |

---

## 5. その他の注記

- 検証順序: セッション → CSRF → 権限 → MFA（版の`changeKind`を読み、一致させる`purpose`を選ぶ）→ 版の行ロック → `E-RULE-001` → `E-RULE-002` → `E-RULE-003` → `E-RULE-007` → `E-RULE-004` → `E-RULE-005` → `E-RULE-013` → TC年度のロック → `E-RULE-006` / `E-RULE-009`。
- 200の後に再送 → 409 `E-RULE-003`（もう `PENDING` ではない）。
- **未決事項 / TBD:** E-14（OPEN-L4-01）、Q-RULE-01。
