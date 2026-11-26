---
id: SPEC-INC_API-001
title: API — 期ロック画面（期の参照、入金の配分、警告）
type: system
subtype: api-design
api_id: API-INC-001
endpoint: /api/v1/periods/{periodId}/lock-view
method: GET
media_type: application/json
feature: incentive
screen_id: [SC-09-04]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-09-04-001, SPEC-INC_ENGINE-001, SPEC-INC_FUNC-001, SPEC-BILLING_DB-001, SPEC-CLOSE_DB-001, ADR-007, OPEN-L4-02]
---

# API-INC-001 — GET /api/v1/periods/{periodId}/lock-view

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-m01: Note `traceId`；G2-M03: 422 は`field`を使用；顧客 Q-INC-01/02: レスポンスに`lateEntries[]`、`paymentCsv`を追加 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

SC-09-04の①ブロックのデータを返します: 期の情報（支払期日、版）、買受人別の入金配分表（どの入金をどの期に充てるか — OPEN-L4-02）、完納の暫定状態（`OK` / `NG` / `SUSPECT`）、⚠警告、「前期以前の調整」行、ロック条件と現在の`inputHash`。参照のみで、監査ログは書き込みません。画面を開いたとき、および期ロック / 409エラーの後に呼び出します。内部処理: INC_ENGINE_TECH K1、K3、K9。

**認証:** Session cookie（`HttpOnly`、`SameSite=Strict` — ADR-002）。役割: `SETTLE`、権限 `STL_HEAD`、`OPS_HEAD`。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `periodId` | string | `6f1c2b7e-3a51-4c1e-9f6a-0d2a6b1c9e10` | `payment_periods`のuuid |  |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 成功 | <pre>{<br>  "period": {<br>    "id": "6f1c2b7e-3a51-4c1e-9f6a-0d2a6b1c9e10",<br>    "code": "2027-08",<br>    "startDate": "2027-08-01",<br>    "endDate": "2027-08-31",<br>    "dueDate": "2027-09-10",<br>    "dueDateShifted": false,<br>    "status": "OPEN",<br>    "fiscalYear": 2027<br>  },<br>  "ruleVersion": { "id": "a1b2c3d4-0000-4000-8000-000000000003", "versionNo": 3, "label": "第3版", "isBaseline": false },<br>  "fifoMode": "FIFO",<br>  "allocations": [<br>    {<br>      "participantId": "c0ffee00-0000-4000-8000-0000000000b7",<br>      "buyerNo": "B07",<br>      "participantClass": "BAIBAI",<br>      "payableInclJpy": 54000,<br>      "paidInWindowJpy": 66000,<br>      "paidOnTimeJpy": 54000,<br>      "breakdown": [<br>        { "periodCode": "2027-07", "amountJpy": 12000, "method": "FIFO", "isOnTime": true },<br>        { "periodCode": "2027-08", "amountJpy": 54000, "method": "FIFO", "isOnTime": true }<br>      ],<br>      "kannoStatus": "OK",<br>      "shortfallJpy": 0,<br>      "warnings": ["OLD_PERIOD_ALLOCATION"]<br>    }<br>  ],<br>  "warnings": [ { "code": "OLD_PERIOD_ALLOCATION", "participantId": "c0ffee00-0000-4000-8000-0000000000b7" } ],<br>  "warningCount": 1,<br>  "priorPeriodAdjustments": [ { "buyerNo": "N04", "periodCode": "2027-07", "amountInclJpy": -41040 } ],<br>  "lateEntries": [ { "buyerNo": "B12", "tradeDate": "2027-07-30", "amountExclJpy": 200000 } ],<br>  "paymentCsv": { "latestPaidOn": "2027-09-10", "lastImportedAt": "2027-09-13T08:40:00+09:00" },<br>  "lockConditions": {<br>    "previousPeriodLocked": true,<br>    "allBusinessDaysLocked": true,<br>    "afterDueDate": true,<br>    "suspectCount": 1<br>  },<br>  "inputHash": "3f9a0c…(16進64文字)",<br>  "lastPreview": { "at": "2027-09-14T14:05:00+09:00", "inputHash": "3f9a0c…", "totalIncentiveJpy": 412300 },<br>  "permissions": { "canPreview": true, "canJudge": true, "canLock": true }<br>}</pre> | `paidInWindowJpy` = Σ 入金のうち、`paid_on ≤ due_date` かつ期への配分が1件以上あるもの（[4]の期日内入金列）。`paidOnTimeJpy` = OT、**今期**へ配分された分のうち期日内のもの（完納判定に使用）。`kannoStatus`: `OK` / `NG` / `SUSPECT`（K3）。`warnings[].code`: `OLD_PERIOD_ALLOCATION`、`OVERPAYMENT`、`UNMAPPED_PAYMENT`（K9-2）。`dueDateShifted` = 10日が銀行休業日のため支払期日が後ろにずれたもの。`priorPeriodAdjustments`: 締め済みの期の調整。`payableInclJpy`には加算しない。`lateEntries`: 締め済みの期の後入力取引で、この期に移ったもの（`incentive_period_id` = この期 — Q-INC-02）。`payableInclJpy`に**既に**含まれる。`paymentCsv`: 最も新しい入金日 + 最新のバッチ取込時刻。チェック[17]の横に表示（Q-INC-01）。未取込の場合はNULL。`lastPreview`は試算が未実施の場合NULL。`permissions`は呼び出し者の役割に基づく（画面のボタン表示用。サーバーでも再検証する）。`LOCKED`の期も200を返す（`status: "LOCKED"`、`lockConditions` NULL） |
| 2 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | 共通コード（iam） |
| 3 | 403 | 閲覧権限のない役割 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | 共通コード；画面C-25に表示 |
| 4 | 404 | 期が存在しない | <pre>{ "error": { "code": "E-INC-001", "message": "指定された期が見つかりません。", "detail": { "periodId": "6f1c2b7e-3a51-4c1e-9f6a-0d2a6b1c9e10" } } }</pre> |  |
| 5 | 422 | `periodId`がuuidでない | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "periodId" } }</pre> | 共通コード |
| 6 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "01JD…" } }</pre> | 画面C-26に表示 + `traceId` |

---

## 5. その他の注記

- 目標応答時間 ≤ 2秒（約170買受人、NFR-PERF-01）。一つのsnapshot（`REPEATABLE READ`）で読み取り、`inputHash`が返す数値と一致させる。
- `inputHash`はデータを漏らさない（入力集合のSHA-256）。画面が古い試算を判別するために使う（SC-09-04 §6.1）。
- **未決事項 / TBD:** E-02（入金ファイルに請求番号があるか — `fifoMode`を変える）；OPEN-DB-08（「前期以前の調整」の回収方法）。
