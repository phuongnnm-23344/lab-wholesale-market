---
id: SPEC-PTY_API-001
title: 参加者詳細の取得 + 許可または承認ブロック
type: system
subtype: api-design
api_id: API-PTY-001
endpoint: /api/v1/participants/{participantId}
method: GET
media_type: application/json
feature: party
screen_id: [SC-01-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-01-02-001, SPEC-PARTY_FUNC-001, SPEC-PARTY_DB-001]
---

# API-PTY-001 — GET /api/v1/participants/{participantId}

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | 顧客 Q-TRD-02: `periodUsageInclJpy` / `periodUsageExclJpy`；Q-PTY-06: LIMIT_CHANGED 行の `createdBy` = `decidedBy` | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

SC-01-02 のために参加者1名の詳細を返します: 基本情報、有効なメールアドレス、現行の保証金と履歴、そして種別に応じた資格ブロックを **1つだけ** — `permit`（許可、仲卸のみ）または `approval`（承認 ＋ 参加上限、売買参加者のみ）。もう一方のブロックは常に `null` です（ルール 2）。未処理の申請とイベント履歴も含みます。画面を開いたとき、および保存するたびに呼び出します。

**認証:** Session cookie `sid`（読み取り — CSRF 不要）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `participantId` | string | `6f1d2c3a-…` | 参加者の UUID | |

> 共通ルール（Param Type、Data Type、`[optional]`、エラー本文 `{ "error": {…} }`、MFA、楽観的ロック、冪等性）: [`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 成功（例: 売買参加者） | <pre>{<br>&nbsp;&nbsp;"participant": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "6f1d…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"kind": "BAIBAI",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name": "サンプル参加者1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "B01",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "ACTIVE",<br>&nbsp;&nbsp;&nbsp;&nbsp;"version": 7<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"contacts": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"slotNo": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email": "b01@sakura-sample.example"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"deposit": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"depositJpy": 5000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"effectiveFrom": "2027-04-01"<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"depositHistory": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"depositJpy": 5000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"effectiveFrom": "2027-04-01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"reason": "初回登録",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "桜 七子",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt": "2027-03-28T09:10:00+09:00"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"permit": null,<br>&nbsp;&nbsp;"approval": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "a9…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"approvalNo": "サンプル承認-B01",<br>&nbsp;&nbsp;&nbsp;&nbsp;"validFrom": "2025-10-19",<br>&nbsp;&nbsp;&nbsp;&nbsp;"validTo": "2028-10-23",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "VALID",<br>&nbsp;&nbsp;&nbsp;&nbsp;"daysToExpiry": 698,<br>&nbsp;&nbsp;&nbsp;&nbsp;"limitMode": "DEPOSIT",<br>&nbsp;&nbsp;&nbsp;&nbsp;"participationLimitJpy": 5000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"periodUsageInclJpy": 1188000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"periodUsageExclJpy": 1100000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"periodRemainingJpy": 3812000,<br>&nbsp;&nbsp;&nbsp;&nbsp;"events": [<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"event": "LIMIT_CHANGED",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"oldLimitJpy": 4000000,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"newLimitJpy": null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"effectiveOn": "2027-04-01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"reason": "保証金連動に戻す",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdBy": "桜 一郎",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"decidedBy": "桜 七子"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;]<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"openRequest": null,<br>&nbsp;&nbsp;"allowedActions": [<br>&nbsp;&nbsp;&nbsp;&nbsp;"EDIT_BASIC",<br>&nbsp;&nbsp;&nbsp;&nbsp;"CHANGE_DEPOSIT",<br>&nbsp;&nbsp;&nbsp;&nbsp;"ENTER_RENEW",<br>&nbsp;&nbsp;&nbsp;&nbsp;"ENTER_LIMIT_CHANGE"<br>&nbsp;&nbsp;]<br>}</pre> | `permit` / `approval`: 一方のみ `null` 以外。`limitMode`: `DEPOSIT`（保証金に連動）· `INDIVIDUAL`（個別）。`periodUsageExclJpy` = 当期の買受代金（税抜）の合計（相対 + せり、`v_buyer_period_usage`）；`periodUsageInclJpy` = floor(税抜 × (100 + 税率) / 100) — 参加上限と同じ式（Q-TRD-02、TRADE_QUALIFICATION_CHECK §4.4）；`periodRemainingJpy` = 限度額 − 税込。`LIMIT_CHANGED`: `createdBy` = `decidedBy` = 照合部門長（一段階 — Q-PTY-06）。`openRequest`: `{id, kind, status: ENTERED\|PROPOSED, label}`、`label` は「確認待ち」/「決裁待ち」 — 「承認待ち」は使わない。`allowedActions` はボタンの表示・非表示のみに使用。`version` は API-PTY-002 で使用 |
| 2 | 401 | ログインしていない / セッション切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 3 | 403 | ロール / 決裁・確認権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 4 | 404 | 参加者が見つからない（または RLS で非表示） | <pre>{ "error": { "code": "E-PTY-018", "message": "参加者が見つかりません" } }</pre> | `E-PTY-018` |
| 5 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- ビュー `security_invoker` と RLS `role_read_matrix` で読み取ります（ロール SETTLE, STL-HEAD, OPS-HEAD）。
- 許可ブロック: `permit` は `permitNo`, `permitConditions`, `validFrom`, `validTo`, `status`, `daysToExpiry`, `events[]`（`reviewResult` を含む `REVIEWED` を含む）を持ち、限度額のフィールドはありません。
- クライアントではキャッシュしません（資格データは他の人の決裁で変わるため）。
- トレース: FR-PARTY-01, PRM-045, PRM-046, ADR-003, PARTY_DB 4.9–4.15.
- **未決事項 / TBD:** なし
