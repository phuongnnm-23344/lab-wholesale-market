---
id: SPEC-RULE_API-003
title: API — 運用部門長による決裁：4回到達後のロールバック（E-14のN2分岐のみ）
type: system
subtype: api-design
api_id: API-RULE-003
endpoint: /api/v1/rule-versions/{versionId}/second-approval
method: POST
media_type: application/json
feature: rule
screen_id: [SC-10-04]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-10-04-001, SPEC-RULE_VERSION-001, SPEC-RULE_FUNC-001, ADR-006, E-14, OPEN-L4-01, R-L4-01]
---

# API-RULE-003 — POST /api/v1/rule-versions/{versionId}/second-approval

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

**N2分岐でのみ有効**（顧客の意見【模擬】、E-14のワークショップ待ち）: 年度TCの4回到達後、確認者が**確認**済みの`ROLLBACK`版を運用部門長が**決裁**します。発効日、内容、quota（TC年度をロック）を再検証し、`APPROVED`にします。この回は**計上します**（5回目以降）。経営層へ通知し、RPT-12に表示します（RULE_VERSION_TECH R5-3）。N1分岐ではエンドポイントは存在するが、常に`E-RULE-010`を返します（決裁待ちの状態がないため）。分岐を変えてもAPI契約は変えないためです。

**認証:** Session cookie + `X-CSRF-Token` + MFA **毎回コード再入力**（ヘッダ `X-MFA-Token`、`purpose = RULE_SECOND_APPROVAL` — [api-conventions §4](../../../_common/api-conventions.md#4-mfa-step-up)）。権限 `OPS_HEAD`。呼び出し者 ≠ 起票者、≠ 確認者。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `versionId` | string | `a1b2c3d4-0000-4000-8000-000000000006` | 確認者がいる版（`PENDING`） |  |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` |  |  |
| 3 | Body Parameters | `reason` | string | `誤った交付率による影響を最小にするため決裁` | 決裁理由、1〜500文字 |  |
| 4 | Header Parameters | `X-MFA-Token` | string | `mfa_01JD…` | ワンタイムMFAトークン（`purpose = RULE_SECOND_APPROVAL`） |  |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 決裁済み | <pre>{<br>  "versionNo": 6,<br>  "status": "APPROVED",<br>  "effectiveFrom": "2028-02-01",<br>  "fiscalYear": 2027,<br>  "quotaUsedAfter": 5,<br>  "managementNotified": true<br>}</pre> | N2では `quotaUsedAfter` > 4 は正常（例外の回） |
| 2 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | クライアントはSC-00-01へ戻し、URLを保持する |
| 3 | 422 | 理由が未入力 | <pre>{ "error": { "code": "E-RULE-007", "message": "理由を入力してください（500文字以内）。" } }</pre> |  |
| 4 | 403 | MFAトークンの未送信 / 期限切れ / 使用済み（未ログインの場合は 401 `E-CMN-001`） | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> |  |
| 5 | 403 | 運用部門長でない / 起票者・確認者と同一人物 | <pre>{ "error": { "code": "E-RULE-011", "message": "起票者・確認者は決裁できません。別の運用部門長が決裁してください。" } }</pre> | `OPS_HEAD`権限がない場合は `E-CMN-002` |
| 6 | 404 | 版が存在しない | <pre>{ "error": { "code": "E-RULE-001", "message": "指定された規則版が見つかりません。" } }</pre> |  |
| 7 | 409 | 決裁待ちの状態でない（N1分岐を含む） | <pre>{ "error": { "code": "E-RULE-010", "message": "この版は運用部門長の決裁待ちではありません。", "detail": { "status": "PENDING", "branch": "N1" } } }</pre> |  |
| 8 | 409 | 発効日が過去 / 重複 / 内容の誤り | <pre>{ "error": { "code": "E-RULE-004", "message": "発効日（2028/02/01）が現在の業務日以前のため確認できません。取り消して発効日を見直してください。" } }</pre> | いずれか: `E-RULE-004`、`E-RULE-005`、`E-RULE-013` |
| 9 | 500 | システムエラー（全体をロールバック、途中書き込みなし） | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | 画面C-26に表示（`traceId`付き） |

---

## 5. その他の注記

- 経営層の通知先リストは設定ファイルに置く（Q-RULE-03）。
- **未決事項 / TBD:** エンドポイント全体がE-14（OPEN-L4-01）に依存。ワークショップがN1を選んだ場合、エンドポイントの契約は変えず、常に `E-RULE-010` を返す。
