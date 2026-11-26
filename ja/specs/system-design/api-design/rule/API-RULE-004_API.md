---
id: SPEC-RULE_API-004
title: API — 確認者が規則版を差し戻す（→ 下書き）
type: system
subtype: api-design
api_id: API-RULE-004
endpoint: /api/v1/rule-versions/{versionId}/return
method: POST
media_type: application/json
feature: rule
screen_id: [SC-10-04]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-10-04-001, SPEC-RULE_VERSION-001, SPEC-RULE_FUNC-001, ADR-006]
---

# API-RULE-004 — POST /api/v1/rule-versions/{versionId}/return

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-m08: ヘッダ `X-MFA-Token` を削除（セッション内のstep-upによるAPI、ワンタイムtokenは使わない） | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

確認者が`PENDING`の版を起票者に差し戻します: `PENDING` → `DRAFT`（N2で決裁待ちの版も含む — 最初からやり直し）、`checker_id`を削除、理由を添えて起票者に通知します（RULE_VERSION_TECH R7-1）。quotaには影響しません。

**認証:** Session cookie + `X-CSRF-Token` + 有効なMFA step-up（10分）。権限 `STL_HEAD`、起票者とは別人であること。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `versionId` | string | `a1b2c3d4-0000-4000-8000-000000000004` | 版（`PENDING`） |  |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` |  |  |
| 3 | Body Parameters | `reason` | string | `段階4の上限額の入力誤り` | 1〜500文字 |  |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 差し戻し済み | <pre>{<br>  "versionNo": 4,<br>  "status": "DRAFT"<br>}</pre> |  |
| 2 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | クライアントはSC-00-01へ戻し、URLを保持する |
| 3 | 422 | 理由が未入力 | <pre>{ "error": { "code": "E-RULE-007", "message": "理由を入力してください（500文字以内）。" } }</pre> |  |
| 4 | 403 | Step-up MFAの期限切れ（10分超、またはidle 3分超）（未ログインの場合は 401 `E-CMN-001`） | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> |  |
| 5 | 403 | 権限なし / 起票者本人 | <pre>{ "error": { "code": "E-RULE-002", "message": "起票者本人は確認・取消できません。" } }</pre> | `STL_HEAD`権限がない場合は `E-CMN-002` |
| 6 | 404 | 版が存在しない | <pre>{ "error": { "code": "E-RULE-001", "message": "指定された規則版が見つかりません。" } }</pre> |  |
| 7 | 409 | `PENDING`でない | <pre>{ "error": { "code": "E-RULE-003", "message": "この版は確認待ちではありません（現在: APPROVED）。", "detail": { "status": "APPROVED" } } }</pre> |  |
| 8 | 500 | システムエラー（全体をロールバック、途中書き込みなし） | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | 画面C-26に表示（`traceId`付き） |

---

## 5. その他の注記

- 監査 `RULE_VERSION_RETURN`（実施者、理由）。起票者はSC-10-02で修正して再提出する。2回分の履歴は`audit_logs`に保持する。
- **未決事項 / TBD:** なし。
