---
id: SPEC-INC_API-004
title: API — ロック済みの期の完納奨励金の正式結果
type: system
subtype: api-design
api_id: API-INC-004
endpoint: /api/v1/periods/{periodId}/incentive-results
method: GET
media_type: application/json
feature: incentive
screen_id: [SC-09-04, SC-09-05]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-09-04-001, SPEC-INC_ENGINE-001, SPEC-INCENTIVE_DB-001, ADR-007, FR-INC-01, FR-AUDIT-03]
---

# API-INC-004 — GET /api/v1/periods/{periodId}/incentive-results

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-m01: Note camelCase（`payoutJpy`、`carryExpiredUnpaid`、`buyerNo`、`unpaidJpy`） | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

期ロックで記録された**正式結果**を返します: `period_id` = この期の`incentive_results`の全行（MAIN、この期に記録された旧期のDELTA、CARRYの受け入れ、CARRY_EXPIRED）、人ごとの支払額、端数調整、ロックした人 / 時刻、`inputHash`。参照のみです。SC-09-04（ロック済みの状態）とSC-09-05 奨励金明細で使用します。RPT-07も同じクエリを使用します（INC_ENGINE_TECH K9-5）。

**認証:** Session cookie。役割: `SETTLE`、権限 `STL_HEAD`、`OPS_HEAD`。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `periodId` | string | `6f1c2b7e-3a51-4c1e-9f6a-0d2a6b1c9e10` | 期のuuid |  |
| 2 | Query Parameters | `participantId` | string | `c0ffee00-0000-4000-8000-0000000000b7` | 買受人1名で絞り込み（SC-09-05） | `[optional]` |
| 3 | Query Parameters | `class` | string | `NAKAOROSHI` | `NAKAOROSHI` / `BAIBAI` — タブ[8]で絞り込み | `[optional]` |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 成功 | <pre>{<br>  "periodCode": "2027-09",<br>  "lockedAt": "2027-10-13T10:05:00+09:00",<br>  "lockedBy": { "name": "桜 七子", "delegationId": null },<br>  "runId": "9d9d9d9d-0000-4000-8000-000000000901",<br>  "inputHash": "a07c55…",<br>  "results": [<br>    { "buyerNo": "B02", "participantClass": "BAIBAI", "kind": "DELTA", "refPeriodCode": "2027-08", "kanno": true, "kannoBasis": "AUTO", "judgementNote": null, "payableInclJpy": 1296000, "paidOnTimeJpy": 1080000, "eligibleExclJpy": 1200000, "tierNo": 3, "rateBp": 90, "incentiveJpy": 1980, "ruleVersionLabel": "第3版", "correctionId": null }<br>  ],<br>  "payouts": [ { "buyerNo": "B02", "sumJpy": 1980, "payoutJpy": 1980 } ],<br>  "roundingAdjustments": [ { "taxRatePercent": 8, "amountJpy": 2 } ],<br>  "carryExpiredUnpaid": []<br>}</pre> | 例はTV-02（INCENTIVE_DB §5）のDELTA行のみ表示: 2027-08期を08期の版で再計算し、09期に記録（B02の09期のMAINはTVにないため数値は記載しない）。`payouts[].payoutJpy` = max(0, `sumJpy`)。`carryExpiredUnpaid[]`（3月期のみ）: `{buyerNo, unpaidJpy}` = 未回収のマイナス分の絶対値（RPT-07） |
| 2 | 401 | 未ログイン | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> |  |
| 3 | 403 | 閲覧権限のない役割 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> |  |
| 4 | 404 | 期が存在しない | <pre>{ "error": { "code": "E-INC-001", "message": "指定された期が見つかりません。" } }</pre> |  |
| 5 | 404 | 期が未ロック | <pre>{ "error": { "code": "E-INC-012", "message": "この期の確定結果はまだありません（期ロック前）。", "detail": { "status": "OPEN" } } }</pre> | 画面はAPI-INC-002を代わりに使用 |
| 6 | 422 | queryが不正 | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "detail": { "class": "NAKAOROSHI または BAIBAI を指定してください" } } }</pre> |  |
| 7 | 500 | システムエラー（全体をロールバック、途中書き込みなし） | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | 画面C-26に表示（`traceId`付き） |

---

## 5. その他の注記

- データはappend-onlyのため、(`periodId`, `runId`)単位でキャッシュ可能。ロック済みの期は自身の結果が変わらない（後から生じるDELTA行は**別の期**に記録される）。
- **未決事項 / TBD:** Q-ARCH-08（`CARRY_EXPIRED`分の回収方法）。
