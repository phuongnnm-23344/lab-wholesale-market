---
id: SPEC-RULE_API-006
title: API — 起票者が発効待ちの版の取消を依頼（起票者・確認者による取消の第1段階）
type: system
subtype: api-design
api_id: API-RULE-006
endpoint: /api/v1/rule-versions/{versionId}/cancel-request
method: POST
media_type: application/json
feature: rule
screen_id: [SC-10-04, SC-10-01]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-10-04-001, SPEC-RULE_VERSION-001, SPEC-RULE_FUNC-001, SPEC-RULE_API-005, ADR-006]
---

# API-RULE-006 — POST /api/v1/rule-versions/{versionId}/cancel-request

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

ルール管理者（役割 `RULE`）が、発効日前の`APPROVED`の版の取消を依頼します。依頼内容（依頼者、時刻、理由）を記録し、照合部門長に通知します。版の状態は変えません。実際の取消は確認者がAPI-RULE-005で行います（RULE_VERSION_TECH R7-3）。

**認証:** Session cookie + `X-CSRF-Token`。役割 `RULE`。MFA不要（まだ効力のある変更は行わないため）。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `versionId` | string | `a1b2c3d4-0000-4000-8000-000000000004` | 版（`APPROVED`） |  |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` |  |  |
| 3 | Body Parameters | `reason` | string | `仲卸段階3の率を誤入力` | 1〜500文字 |  |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 依頼を記録済み | <pre>{<br>  "versionNo": 4,<br>  "status": "APPROVED",<br>  "cancelRequest": { "requestedAt": "2027-09-20T15:10:00+09:00", "requestedBy": "桜 九子" }<br>}</pre> |  |
| 2 | 422 | 理由が未入力 | <pre>{ "error": { "code": "E-RULE-007", "message": "理由を入力してください（500文字以内）。" } }</pre> |  |
| 3 | 401 | 未ログイン | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> |  |
| 4 | 403 | 役割 `RULE` がない | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> |  |
| 5 | 404 | 版が存在しない | <pre>{ "error": { "code": "E-RULE-001", "message": "指定された規則版が見つかりません。" } }</pre> |  |
| 6 | 409 | `APPROVED`でない / 発効日到達済み / 依頼済み | <pre>{ "error": { "code": "E-RULE-014", "message": "この版は取消依頼できません（発効待ちでない、またはすでに依頼済みです）。", "detail": { "status": "ACTIVE" } } }</pre> |  |
| 7 | 500 | システムエラー（全体をロールバック、途中書き込みなし） | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | 画面C-26に表示（`traceId`付き） |

---

## 5. その他の注記

- 保存先: `rule_versions.cancel_requested_by`、`cancel_requested_at`、`cancel_request_reason`（RULE_DB 0.2.1 §4.21、Q-RULE-02）+ `audit_logs` の `RULE_VERSION_CANCEL_REQUEST`。
- **未決事項 / TBD:** Q-RULE-02。
