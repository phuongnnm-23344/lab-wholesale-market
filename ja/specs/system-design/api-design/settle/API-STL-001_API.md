---
id: SPEC-STL_API-001
title: 日次締めチェックリスト（ADR-005 §2.5 の標準12項目）
type: system
subtype: api-design
api_id: API-STL-001
endpoint: /api/v1/business-days/{businessDate}/close-checklist
method: GET
media_type: application/json
feature: settle
screen_id: [SC-07-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-07-02-001, SPEC-STL_DAY_CLOSE-001, SPEC-CLOSE_DB-001, ADR-005]
---

# API-STL-001 — GET /api/v1/business-days/{businessDate}/close-checklist

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | 顧客 Q-STL-02: チェックリスト12項目（`adrNo` 12）；G2-M03: 元の`field`；G2-m07: [PL]性能目標のラベル | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

業務日の状態、金額合計（相対 / せり）、12項目のチェックリスト（✖ 6件が締めを阻止、⚠ 6件。#8 と #12 はチェック必須）を返します。内容は ADR-005 §2.5 / CLOSE_DB 4.24 の一覧どおりです。未同期の端末一覧と`checklistVersion`も含みます。締め済みの日は締め時点のスナップショットを返します。SC-07-02を開くとき、および画面に戻るたびに呼び出します。

**認証:** Session cookie `sid`（読み取り — CSRF不要）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `businessDate` | string | `2027-08-02` | `YYYY-MM-DD` |  |

> 共通規約（Param Type、Data Type、`[optional]`、エラー時のbody `{ "error": {…} }`、MFA、楽観ロック、冪等性）：[`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`：[`_common/error-codes.md`](../../../_common/error-codes.md)

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 成功（未締めの日） | <pre>{<br>&nbsp;&nbsp;"businessDate": "2027-08-02",<br>&nbsp;&nbsp;"status": "OPEN",<br>&nbsp;&nbsp;"totals": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"aitaiJpy": 11140000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"seriJpy": 1241000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"allJpy": 12381000<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"items": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 6,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "確定待ちの取引（下書き・確認待ち）",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "BLOCK",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-04-02"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 2,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 4,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "未確認のせり結果",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "BLOCK",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-05-02"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 3,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 8,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "未同期の端末",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "BLOCK",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-03-07"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 4,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 7,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "オフライン同期・後入力の要確認",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "BLOCK",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-03-07"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 5,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 9,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "閾値以上・買受人変更の当日訂正（未確認）",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "BLOCK",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-07-01"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 6,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 20,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "金額が変わる引渡し例外",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "BLOCK",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-07-01"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 7,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 10,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "販売残のあるロット（持ち越し）",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "WARN",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 4,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-03-03"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 8,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 12,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "引渡し残",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "WARN",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 12,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-06-01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"requiresAck": true<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 9,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 21,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "閾値未満の当日訂正・取消",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "WARN",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 2,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-07-01"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 10,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 11,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "未確認の争いのある引渡し",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "WARN",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-06-05"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 11,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 5,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "入力者本人が確認したせり",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "WARN",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": "SC-07-01"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"adrNo": 12,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemNo": 22,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label": "未入力の引渡し確認票なし（紙台帳で確認）",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"level": "WARN",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"count": null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"link": null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"requiresAck": true<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"devices": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deviceId": "dv-3…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"code": "TAB-03",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"location": "第2バース",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"lastSyncedAt": "2027-08-02T07:12:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"pendingCount": 5<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"checklistVersion": "sha256:4f1c…",<br>&nbsp;&nbsp;"canClose": false,<br>&nbsp;&nbsp;"delegatedFor": null,<br>&nbsp;&nbsp;"lockedInfo": null<br>}</pre> | `level`: `BLOCK` ✖ · `WARN` ⚠。`itemNo` = 項目番号（SC-07-02）；`adrNo` = ADR-005 §2.5 の番号。`requiresAck`: 項目#8 → [13]のチェック必須；項目#12（`count: null`、システムは件数を数えない — Q-STL-02）→ [22]のチェック必須。`canClose` = `BLOCK` が0件であること（クライアントは引き続きチェックと日付の再入力が必要）。`delegatedFor`: 閲覧者が代行の場合の照合部門長の氏名。締め済みの日は `status = LOCKED`、`items` はスナップショット、`lockedInfo = {lockedBy, lockedAt, delegatedFor, excludedDevices[]}` |
| 2 | 422 | bodyまたはqueryの型誤り・項目欠落（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "businessDate" } }</pre> | `E-CMN-007` |
| 3 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 4 | 403 | 役割・決裁権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 5 | 404 | 業務日が存在しない | <pre>{ "error": { "code": "E-STL-012", "message": "指定の業務日が存在しません" } }</pre> | `E-STL-012` |
| 6 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 参照できる役割: STL-HEAD、代行 STL_HEAD、SETTLE。
- 関数`fn_day_close_checklist`を本APIと締め時の検証（API-STL-002）で共用する。件数の数え方は1通りのみ。
- p95 ≤ 1秒 — [PL] 社内目標。NFR-PERF-01（検索 p95 ≤ 2秒）より厳しい。
- **未決事項 / TBD:** なし
