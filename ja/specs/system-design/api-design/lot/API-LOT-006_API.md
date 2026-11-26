---
id: SPEC-LOT_API-006
title: ロットフォームの選択値（業務日, 受付開始時刻, 品目, 単位, 等級）
type: system
subtype: api-design
api_id: API-LOT-006
endpoint: /api/v1/lots/form-options
method: GET
media_type: application/json
feature: lot
screen_id: [SC-03-01, SC-03-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-LOT_FUNC-001, SPEC-SC-03-01-001, SPEC-SC-03-05-001]
---

# API-LOT-006 — GET /api/v1/lots/form-options

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

ロットフォームに必要な値を一度に返します: 現在開いている業務日、その日に対応する規則版の受付開始時刻（SC-03-01 [3] — 値を固定せず、顧客 #27、E-16）、品目の一覧と既定の単位、単位、等級の一覧（SC-03-05 [6]）。Function: [LOT_FUNC 2.8](../../../lot/function-specifications/LOT_FUNC.md#28-getlotformoptions).

**認証:** Session cookie。ロール: INTAKE, JUDGE。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | N/A | | | | パラメータなし | |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | OK | <pre>{<br>  "businessDate": "2027-08-02",<br>  "intakeStartTime": "01:00",<br>  "ruleVersionNo": "2027-04",<br>  "items": [ { "code": "MADAI", "name": "真鯛", "defaultUnit": "KG" } ],<br>  "units": [ { "code": "KG", "label": "kg" }, { "code": "CASE", "label": "箱" }, { "code": "PIECE", "label": "尾" } ],<br>  "grades": [ { "code": "A", "label": "A" }, { "code": "B", "label": "B" }, { "code": "C", "label": "C" }, { "code": "OFF", "label": "規格外" } ]<br>}</pre> | `intakeStartTime` = `rule_parameters.LOT_INTAKE_START_TIME`。`grades` は `code_values` の `INSPECTION_GRADE` の `sort_order` 順（前提 — L4-A02 のフィクスチャ待ち） |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | INTAKE / JUDGE 以外のロール | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 423 | 受付中の業務日がない | <pre>{ "error": { "code": "E-CMN-003", "message": "受付中の業務日がありません。管理者に連絡してください" } }</pre> | まれ（01:00 のジョブは安全網 — ADR-005） |
| 5 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- 画面のセッション中はクライアント側でキャッシュしてよいです（業務日が変わったときに更新）。
- **未決事項 / TBD:** Q-LOT-03（実際の等級一覧）。
