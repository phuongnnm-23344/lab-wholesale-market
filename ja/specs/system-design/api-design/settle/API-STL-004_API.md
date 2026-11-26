---
id: SPEC-STL_API-004
title: 修正申請の詳細 + 生成される記録のプレビュー
type: system
subtype: api-design
api_id: API-STL-004
endpoint: /api/v1/corrections/{correctionId}
method: GET
media_type: application/json
feature: settle
screen_id: [SC-08-03]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-08-03-001, SPEC-STL_CORRECTION_DECIDE-001, SPEC-ADJUST_DB-001]
---

# API-STL-004 — GET /api/v1/corrections/{correctionId}

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

SC-08-03向けに修正申請1件の内容を返します: 必要な決裁段階数（提出時の閾値スナップショット + 版）、対象（取引 / 期 / 日）、変更前 / 変更後、買受人別の増減（税込）、**生成されるREVERSE / DELTA記録**（計上業務日 = 最も早い未締めの業務日 — 暫定、および対象期 = 元取引の期）+ 期のお支払額 / 奨励金への影響、決裁履歴、閲覧者が押せるボタン。

**認証:** Session cookie `sid`（読み取り — CSRF不要）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `correctionId` | string | `cr-12…` | UUID |  |

> 共通規約（Param Type、Data Type、`[optional]`、エラー時のbody `{ "error": {…} }`、MFA、楽観ロック、冪等性）：[`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`：[`_common/error-codes.md`](../../../_common/error-codes.md)

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 成功 | <pre>{<br>&nbsp;&nbsp;"correction": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "cr-12…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"no": "修正-2027-0091",<br>&nbsp;&nbsp;&nbsp;&nbsp;"scope": "TRADE",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "SUBMITTED",<br>&nbsp;&nbsp;&nbsp;&nbsp;"statusLabel": "決裁待ち（1次）",<br>&nbsp;&nbsp;&nbsp;&nbsp;"reason": "買受人の取り違え",<br>&nbsp;&nbsp;&nbsp;&nbsp;"requiredLevels": 2,<br>&nbsp;&nbsp;&nbsp;&nbsp;"requiredReason": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerChanged": true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"maxBuyerDiffInclJpy": 447120,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"thresholdJpy": 100000,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"ruleVersionNo": 3<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"target": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeId": "t-0005…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeNo": "相対-0005",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"businessDate": "2027-08-02",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"dayLocked": true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"periodId": "2027-08"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "桜 三郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2027-09-15T08:40:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;"elapsedBusinessDays": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;"attachments": [<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"id": "att-7…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "伝票スキャン.pdf"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;]<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"change": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"before": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N04",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qty": 60,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unitPriceJpy": 1900,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"amountJpy": 114000<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"after": {<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qty": 60,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unitPriceJpy": 6900,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"amountJpy": 414000<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"buyerDiffsInclJpy": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N04",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"diffJpy": -123120<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"diffJpy": 447120<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"preview": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"appliedBusinessDate": "2027-09-15",<br>&nbsp;&nbsp;&nbsp;&nbsp;"targetPeriod": "2027-08",<br>&nbsp;&nbsp;&nbsp;&nbsp;"periodLocked": true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"records": [<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"kind": "REVERSE",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N04",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qtyDelta": -60,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"amountDeltaJpy": -114000<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"kind": "DELTA",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"qtyDelta": 60,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"amountDeltaJpy": 414000<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;],<br>&nbsp;&nbsp;&nbsp;&nbsp;"effect": "PERIOD_LOCKED_DELTA_NEXT_LOCK"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"approvals": [],<br>&nbsp;&nbsp;"allowedActions": [<br>&nbsp;&nbsp;&nbsp;&nbsp;"DECIDE_L1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"REJECT"<br>&nbsp;&nbsp;]<br>}</pre> | `statusLabel` には決して「承認」を含めない。`preview.appliedBusinessDate` は暫定 — 実際の日付は最終決裁時に確定する。`effect`: `PERIOD_OPEN_BILLING` · `PERIOD_LOCKED_DELTA_NEXT_LOCK` · `KANNO_CHANGE` · `INCENTIVE_DELTA`。`allowedActions`: `DECIDE_L1` · `DECIDE_L2` · `REJECT` |
| 2 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 3 | 403 | 役割・決裁権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 4 | 404 | 修正申請が見つからない | <pre>{ "error": { "code": "E-STL-021", "message": "修正申請が見つかりません" } }</pre> | `E-STL-021` |
| 5 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 参照できる役割: STL-HEAD、OPS-HEAD、起票者（自分の申請）、SETTLE（閲覧範囲に応じて）— RLS。
- `scope = LATE_ENTRY`: `target = {businessDate, kind, paperSlipNo}`、`preview.records` は新規記録を示す。`KANNO` / `INCENTIVE`: `target = {participant, periodId}`、`preview.records = []`。
- **未決事項 / TBD:** なし
