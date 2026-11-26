---
id: SPEC-RULE_API-001
title: API — 規則版確認画面のデータ（版、比較、quota、例、E-14ポリシー）
type: system
subtype: api-design
api_id: API-RULE-001
endpoint: /api/v1/rule-versions/{versionId}/review
method: GET
media_type: application/json
feature: rule
screen_id: [SC-10-04]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-10-04-001, SPEC-RULE_VERSION-001, SPEC-RULE_FUNC-001, SPEC-RULE_DB-001, ADR-006]
---

# API-RULE-001 — GET /api/v1/rule-versions/{versionId}/review

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-m01: Note `cancelRequest` camelCase（`requestedBy`、`requestedAt`） | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

SC-10-04向けに、ある版のすべてのデータを返します: 状態、種類（通常改定 / ロールバック）、発効日、起票者、**発効日の年度（TC年度）**の発効回数カウンタ、適用中の版との比較表（交付率2表 + 規則のすべてのパラメータ）、奨励金の例、影響、設定中のE-14ポリシー分岐、呼び出し者の操作権限。参照のみです（関数 `rule_version_review` — RULE_FUNC 2.5）。

**認証:** Session cookie。権限: `STL_HEAD`、`OPS_HEAD`、役割 `RULE`。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `versionId` | string | `a1b2c3d4-0000-4000-8000-000000000004` | `rule_versions`のuuid |  |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 成功 | <pre>{<br>  "version": {<br>    "id": "a1b2c3d4-0000-4000-8000-000000000004",<br>    "versionNo": 4,<br>    "status": "PENDING",<br>    "awaitingSecondApproval": false,<br>    "changeKind": "CHANGE",<br>    "rollbackOf": null,<br>    "effectiveFrom": "2027-10-01",<br>    "fiscalYear": 2027,<br>    "maker": { "staffId": "5a5a5a5a-0000-4000-8000-000000000009", "name": "桜 九子" },<br>    "checker": null,<br>    "note": "仲卸の段階3の交付率を見直し",<br>    "cancelRequest": null<br>  },<br>  "baseVersion": { "id": "a1b2c3d4-0000-4000-8000-000000000003", "versionNo": 3, "status": "ACTIVE" },<br>  "quota": { "fiscalYear": 2027, "used": 2, "limit": 4 },<br>  "diff": [<br>    { "section": "RATE_NAKAOROSHI", "item": "段階3 ¥1,000,000〜", "current": "0.9%", "proposed": "1.0%", "change": "UP" },<br>    { "section": "RATE_BAIBAI", "item": null, "current": null, "proposed": null, "change": "NONE" },<br>    { "section": "PARAM", "item": "CORR_TWO_LEVEL_THRESHOLD_JPY", "current": "100000", "proposed": "150000", "change": "UP" }<br>  ],<br>  "examples": [<br>    { "participantClass": "NAKAOROSHI", "eligibleExclJpy": 1000000, "currentJpy": 9900, "proposedJpy": 11000 }<br>  ],<br>  "impact": { "firstPeriodCode": "2027-10", "lockedPeriodsUnchanged": true },<br>  "policy": { "branch": "N1", "blockedReason": null, "needsSecondApproval": false },<br>  "permissions": { "canConfirm": true, "canReturn": true, "canCancel": true, "canRequestCancel": false, "canSecondApprove": false, "isMaker": false }<br>}</pre> | `status`: `DRAFT` / `PENDING` / `APPROVED` / `ACTIVE` / `SUPERSEDED` / `CANCELLED`；`awaitingSecondApproval` = `PENDING` かつ確認者あり（N2）。`quota.used` は RULE_FUNC 2.2 により `fiscalYear` = FY(`effectiveFrom`) で算出。`diff[].section`: `RATE_NAKAOROSHI` / `RATE_BAIBAI` / `PARAM`；`change`: `UP` / `DOWN` / `CHANGED` / `NONE`。`examples[]` は `incentive_amount` で計算（INC_FUNC 2.7）。`policy.blockedReason`: `null` / `QUOTA`（CHANGEで used ≥ 4）/ `ROLLBACK_N1` / `NEEDS_SECOND`（N2）。`cancelRequest`: 取消の申請がある場合 `{requestedBy, requestedAt, reason}` |
| 2 | 401 | 未ログイン | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> |  |
| 3 | 403 | 閲覧権限のない役割 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> |  |
| 4 | 404 | 版が存在しない | <pre>{ "error": { "code": "E-RULE-001", "message": "指定された規則版が見つかりません。" } }</pre> |  |
| 5 | 422 | `versionId`の形式が不正 | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "versionId": "uuid形式で指定してください" } } }</pre> |  |
| 6 | 500 | システムエラー（全体をロールバック、途中書き込みなし） | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | 画面C-26に表示（`traceId`付き） |

---

## 5. その他の注記

- `policy`は画面のバナー表示用のみ。最終判断はAPI-RULE-002 / 003がTC年度をロックしたtransaction内で行う（閲覧時とボタン押下時の間にquotaが変わる可能性あり — RV-13）。
- **未決事項 / TBD:** E-14（N1 / N2分岐 — OPEN-L4-01）、Q-RULE-01（既定の分岐）、Q-RULE-02（取消申請の保存先）。
