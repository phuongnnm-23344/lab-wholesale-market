---
id: SPEC-INC_API-002
title: API — 完納奨励金の試算（結果は記録しない、監査ログは記録）
type: system
subtype: api-design
api_id: API-INC-002
endpoint: /api/v1/periods/{periodId}/incentive-previews
method: POST
media_type: application/json
feature: incentive
screen_id: [SC-09-04]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-09-04-001, SPEC-INC_ENGINE-001, SPEC-INC_FUNC-001, ADR-007, BR-INC-01, FR-INC-01]
---

# API-INC-002 — POST /api/v1/periods/{periodId}/incentive-previews

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

`OPEN`の期の**試算**を実行します。純粋関数（INC_ENGINE_TECH K1–K7）を下書きの判定で呼び出し、締め済みの期のMAIN + DELTA、CARRY / CARRY_EXPIRED、見込みの端数調整、前回試算との差を返します。**業務テーブルには書き込まず**、`audit_logs`に1行だけ記録します（`INCENTIVE_PREVIEW`: 時刻、`inputHash`、合計、買受人→奨励金のマップ）— 顧客 #6 【顧客（模擬）、2026-11-25】。何回呼び出してもよく、監査の観点では冪等ではない（呼び出しごとに1行）ため POST を使います。

**認証:** Session cookie + ヘッダ `X-CSRF-Token`（ADR-002）。役割: `SETTLE` または権限 `STL_HEAD`。MFA不要。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `periodId` | string | `6f1c2b7e-3a51-4c1e-9f6a-0d2a6b1c9e10` | 期のuuid、`OPEN`であること |  |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` | セッションのCSRF防止トークン |  |
| 3 | Body Parameters | `judgements` | object | `{ "c0ffee00-0000-4000-8000-0000000000b8": { "decision": "NOT_KANNO", "reason": "振込手数料の差引と判断" } }` | `participantId` → `{decision: KANNO \| NOT_KANNO, reason: string 1..500}` のマップ（`SUSPECT`の行向け）。行が不足した場合、その行は要確認のまま | `[optional]`、既定は `{}`；`STL_HEAD`のみ空以外を送信可（SETTLEが送信 → 無視し、エラーにはしない） |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 試算済み | <pre>{<br>  "periodCode": "2027-08",<br>  "ranAt": "2027-09-14T14:05:00+09:00",<br>  "inputHash": "3f9a0c…(16進64文字)",<br>  "results": [<br>    { "buyerNo": "N01", "participantClass": "NAKAOROSHI", "kind": "MAIN", "refPeriodCode": null, "kanno": true, "kannoBasis": "AUTO", "eligibleExclJpy": 1000000, "tierNo": 3, "rateBp": 90, "incentiveJpy": 9900, "ruleVersionLabel": "第3版", "correctionId": null },<br>    { "buyerNo": "N04", "participantClass": "NAKAOROSHI", "kind": "DELTA", "refPeriodCode": "2027-07", "kanno": true, "kannoBasis": "AUTO", "eligibleExclJpy": 0, "tierNo": 1, "rateBp": 0, "incentiveJpy": -1320, "ruleVersionLabel": "稼働時の版（移行期）", "correctionId": null },<br>    { "buyerNo": "B11", "participantClass": "BAIBAI", "kind": "MAIN", "refPeriodCode": null, "kanno": null, "kannoBasis": "PENDING_JUDGEMENT", "eligibleExclJpy": 0, "tierNo": 1, "rateBp": 0, "incentiveJpy": 0, "ruleVersionLabel": "第3版", "correctionId": null }<br>  ],<br>  "suspects": [ { "buyerNo": "B11", "shortfallJpy": 440, "suggested": "NOT_KANNO" } ],<br>  "roundingAdjustments": [ { "taxRatePercent": 8, "amountJpy": 2 } ],<br>  "carry": [ { "buyerNo": "N04", "kind": "CARRY", "amountJpy": -1320, "toPeriodCode": "2027-09", "expiresAtPeriodCode": "2028-03" } ],<br>  "totals": { "mainJpy": 412300, "deltaJpy": -1320, "payoutJpy": 412300, "rowCount": 58 },<br>  "diffFromPrevious": { "previousRanAt": "2027-09-14T13:40:00+09:00", "totalDiffJpy": -1320, "byBuyer": [ { "buyerNo": "N04", "diffJpy": -1320 } ] }<br>}</pre> | `kind`: `MAIN` / `DELTA` / `CARRY` / `CARRY_EXPIRED`。`kannoBasis`: `AUTO` / `JUDGED` / `CORRECTION`、または `PENDING_JUDGEMENT`（試算のみ、要確認の行で未判定 — 奨励金は仮に0）。`refPeriodCode` は `DELTA` のとき。`ruleVersionLabel` = **計算対象の期**の版（DELTAは旧期の版を使用）。`carry[]`: 締め時に生成される行（次の期へCARRY、または3月期ならCARRY_EXPIRED）。`totals.payoutJpy` = Σ max(0, 人ごとの合計)。`diffFromPrevious` は初回の場合 NULL |
| 2 | 422 | bodyが不正 | <pre>{ "error": { "code": "E-INC-007", "message": "判断の理由を入力してください（500文字以内）。", "detail": { "participantId": "c0ffee00-0000-4000-8000-0000000000b8" } } }</pre> | `E-INC-011`（要確認でない行への判定）、`E-CMN-007`（形式）も発生しうる |
| 3 | 401 | 未ログイン | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | 共通コード |
| 4 | 403 | 試算権限のない役割 / CSRF不正 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | 共通コード |
| 5 | 404 | 期が存在しない | <pre>{ "error": { "code": "E-INC-001", "message": "指定された期が見つかりません。" } }</pre> |  |
| 6 | 423 | 期がロック済み | <pre>{ "error": { "code": "E-INC-002", "message": "この期は期ロック済みです。訂正は修正申請で行い、差額は次の期ロックで計上されます。", "detail": { "lockedAt": "2027-09-14T10:20:00+09:00" } } }</pre> | 画面C-24に表示 |
| 7 | 500 | 規則データ / 移行後の期のデータ不備 | <pre>{ "error": { "code": "E-INC-010", "message": "適用規則版の交付率表に不備があります。システム管理者に連絡してください。", "traceId": "01JD…" } }</pre> | ERRORログに版と表の種類を記録 |

---

## 5. その他の注記

- DBロックは保持しない。2人が同時に試算しても互いにブロックしない。入力が変われば、結果は締め時と異なる可能性がある — `API-INC-003`が`inputHash`を比較する。
- 監査ペイロードは 買受人→合計 のマップに限定する（~170件以内）。`results`全体は保存しない。
- **未決事項 / TBD:** `KANNO_FEE_SUSPECT_MAX_JPY` — 設定ファイルの初期値は経理部の回答待ち（顧客 #7）；Q-ARCH-12（IF-ACC-01 出力時の奨励金の税区分）。
