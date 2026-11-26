---
id: SPEC-RULE_API-005
title: API — 発効日前の規則版を取り消す（quotaに計上しない）
type: system
subtype: api-design
api_id: API-RULE-005
endpoint: /api/v1/rule-versions/{versionId}/cancel
method: POST
media_type: application/json
feature: rule
screen_id: [SC-10-04]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-10-04-001, SPEC-RULE_VERSION-001, SPEC-RULE_FUNC-001, SPEC-RULE_API-006, ADR-006]
---

# API-RULE-005 — POST /api/v1/rule-versions/{versionId}/cancel

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M01: `APPROVED`の版の取消は**毎回コード再入力**（`X-MFA-Token`必須、`purpose = RULE_CANCEL_DECIDE`）、PREMISE §3.2 ★に従う；`DRAFT` / `PENDING`の取消はstep-upを維持し、tokenは受け付けない（G2-m08） | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

発効日前の版を取り消す → `CANCELLED`、quotaには**計上しない**（取り消された`APPROVED`の版は1回分を返却）。2つのケース（RULE_VERSION_TECH R7-2、R7-4；ADR-006 §2.3-7a）:
- `DRAFT` / `PENDING`: 起票者または確認者が理由を添えて取り消す。
- `APPROVED`（発効待ち）: 起票者・確認者の分離を維持する。起票者の**取消依頼**（API-RULE-006）が開いていることが必要。依頼者とは別の確認者（照合部門長）が取消を決裁する。**毎回MFAコードを再入力**。

**認証:** Session cookie + `X-CSRF-Token` + 取り消す版の状態に応じたMFA（[api-conventions §4](../../../_common/api-conventions.md#4-mfa-step-up)）: `DRAFT` / `PENDING` → 有効なセッション内のstep-up（10分、idle 3分以内）；`APPROVED` → **毎回コード再入力**（PREMISE §3.2 ★「決裁済みの版の取消」、ADR-002 §2.2-6a）、ヘッダ `X-MFA-Token` 必須、`purpose = RULE_CANCEL_DECIDE`。権限 `STL_HEAD` または役割 `RULE`（自分が起票した `DRAFT` / `PENDING` の版のみ）。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `versionId` | string | `a1b2c3d4-0000-4000-8000-000000000004` | 取り消す版 |  |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` |  |  |
| 3 | Body Parameters | `reason` | string | `交付率の誤りが見つかったため発効前に取消` | 1〜500文字 |  |
| 4 | Header Parameters | `X-MFA-Token` | string | `mfa_01JD…` | ワンタイムMFAトークン、120秒以内、`purpose = RULE_CANCEL_DECIDE` | `APPROVED`の版のときのみ送信（必須）；`DRAFT` / `PENDING`の版では送信しない — サーバーは無視する |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 取消済み | <pre>{<br>  "versionNo": 4,<br>  "status": "CANCELLED",<br>  "fiscalYear": 2027,<br>  "quotaUsedAfter": 2<br>}</pre> | 取り消された版が一度`APPROVED`だった場合、`quotaUsedAfter`は1減る |
| 2 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | クライアントはSC-00-01へ戻し、URLを保持する |
| 3 | 422 | 理由が未入力 | <pre>{ "error": { "code": "E-RULE-007", "message": "理由を入力してください（500文字以内）。" } }</pre> |  |
| 4 | 403 | `APPROVED`: MFAトークンの未送信 / 期限切れ / 使用済み / `purpose`不一致；`DRAFT` / `PENDING`: step-upの期限切れ（未ログインの場合は 401 `E-CMN-001`） | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> |  |
| 5 | 403 | 権限なし / 依頼者本人による決裁済み版の取消 | <pre>{ "error": { "code": "E-RULE-002", "message": "起票者本人は確認・取消できません。" } }</pre> | `E-CMN-002`：役割 RULE が自分のものでない版、または `APPROVED`の版を取り消そうとした場合 |
| 6 | 404 | 版が存在しない | <pre>{ "error": { "code": "E-RULE-001", "message": "指定された規則版が見つかりません。" } }</pre> |  |
| 7 | 409 | 発効済み / 状態が不正 | <pre>{ "error": { "code": "E-RULE-008", "message": "この版は取り消せません（発効日以降、または取り消せない状態です）。", "detail": { "status": "ACTIVE" } } }</pre> |  |
| 8 | 409 | `APPROVED`で取消依頼がない | <pre>{ "error": { "code": "E-RULE-012", "message": "起票者からの取消依頼がないため、発効待ちの版は取り消せません。" } }</pre> |  |
| 9 | 500 | システムエラー（全体をロールバック、途中書き込みなし） | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | 画面C-26に表示（`traceId`付き） |

---

## 5. その他の注記

- 検証順序: セッション → CSRF → 権限 → 版の行ロック（なければ 404 `E-RULE-001`）→ 状態に応じたMFA（tokenの`RULE_CANCEL_DECIDE`またはstep-up）→ `E-RULE-002` → `E-RULE-007` → `E-RULE-008` → `E-RULE-012`。
- 発効日**前**に率の誤りを見つけた場合の主要な処理経路（ADR-006 §2.5-10）。回数は消費しない。
- **未決事項 / TBD:** Q-RULE-02（取消依頼を保存する列 — RULE_DB 4.21）。
