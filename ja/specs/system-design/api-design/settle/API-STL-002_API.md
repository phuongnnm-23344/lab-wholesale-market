---
id: SPEC-STL_API-002
title: 業務日の締め（日次締め）— 再オープンAPIはなし
type: system
subtype: api-design
api_id: API-STL-002
endpoint: /api/v1/business-days/{businessDate}/close
method: POST
media_type: application/json
feature: settle
screen_id: [SC-07-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-07-02-001, SPEC-STL_DAY_CLOSE-001, SPEC-CLOSE_DB-001, ADR-005, ADR-002]
---

# API-STL-002 — POST /api/v1/business-days/{businessDate}/close

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: `detail.blocking` は `{adrNo, label, count}` の配列、元の`field`；顧客 Q-STL-02: `paperSlipsAllEnteredAcknowledged` + 422 E-STL-013；Q-STL-01 を締結 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

同一transaction内でチェックリストを再検証したうえで業務日を締めます。チェックリストのスナップショットと持ち越しロットを記録し、**次の市場開催日の業務日を開き**、バッチ作成ジョブIF-ACC-01を登録します。取り消せない操作のため、ワンタイムMFA（★）を必須とします。システムに日付を再オープンするエンドポイントは**ありません**（PRM-031、ADR-005 §2.7）。

**認証:** Session cookie `sid` + CSRF（ヘッダ `X-CSRF-Token`）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `businessDate` | string | `2027-08-02` | 締める日 |  |
| 2 | Header Parameters | `X-MFA-Token` | string | `mfa_…` | ワンタイムトークン、`purpose = DAY_CLOSE`、有効期限120秒（iam） |  |
| 3 | Body Parameters | `confirmDate` | string | `2027/08/02` | 利用者が再入力；`/` または `-` を受け付ける |  |
| 4 | Body Parameters | `deliveryRemainderAcknowledged` | boolean | `true` | `true`必須（[13]にチェック） |  |
| 5 | Body Parameters | `paperSlipsAllEnteredAcknowledged` | boolean | `true` | `true`必須（[22]「未入力の引渡し確認票なし（紙台帳で確認）」にチェック、ADR-005 §2.5 #12 — Q-STL-02） |  |
| 6 | Body Parameters | `checklistVersion` | string | `sha256:4f1c…` | API-STL-001で表示時に取得した値 |  |

例 body:

```json
{
  "confirmDate": "2027/08/02",
  "deliveryRemainderAcknowledged": true,
  "paperSlipsAllEnteredAcknowledged": true,
  "checklistVersion": "sha256:4f1c…"
}
```

> 共通規約（Param Type、Data Type、`[optional]`、エラー時のbody `{ "error": {…} }`、MFA、楽観ロック、冪等性）：[`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`：[`_common/error-codes.md`](../../../_common/error-codes.md)

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 締め済み | <pre>{<br>&nbsp;&nbsp;"businessDate": "2027-08-02",<br>&nbsp;&nbsp;"status": "LOCKED",<br>&nbsp;&nbsp;"lockedAt": "2027-08-02T10:04:00+09:00",<br>&nbsp;&nbsp;"lockedBy": "桜 七子",<br>&nbsp;&nbsp;"delegatedFor": null,<br>&nbsp;&nbsp;"nextBusinessDate": "2027-08-03",<br>&nbsp;&nbsp;"accountingExport": "QUEUED"<br>}</pre> | `nextBusinessDate`: 次の市場開催日の業務日が`OPEN`済み。`accountingExport`: `QUEUED`（ジョブIF-ACC-01、期限11:00）または `ENQUEUE_FAILED`（アラート済み、締めは成功） |
| 2 | 422 | bodyまたはqueryの型誤り・項目欠落（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "confirmDate" } }</pre> | `E-CMN-007` |
| 3 | 422 | 再入力の日付が不一致 | <pre>{ "error": { "code": "E-STL-001", "message": "確認のため業務日を正しく入力してください" } }</pre> | `E-STL-001` |
| 4 | 422 | 引渡し残のチェック未済 | <pre>{ "error": { "code": "E-STL-003", "message": "引渡し残の確認（確認済み）にチェックしてください", "field": "deliveryRemainderAcknowledged" } }</pre> | `E-STL-003` |
| 4b | 422 | 未入力の引渡し確認票なしのチェック未済 | <pre>{ "error": { "code": "E-STL-013", "message": "未入力の引渡し確認票がないこと（紙台帳で確認）にチェックしてください", "field": "paperSlipsAllEnteredAcknowledged" } }</pre> | `E-STL-013` |
| 5 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 6 | 403 | 役割・決裁権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 7 | 403 | `X-MFA-Token`の未送信 / 期限切れ / 使用済み / 目的不一致（★ 毎回コードを再入力） | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です", "detail": { "purpose": "DAY_CLOSE" } } }</pre> | `E-CMN-005` |
| 8 | 404 | 業務日が存在しない | <pre>{ "error": { "code": "E-STL-012", "message": "指定の業務日が存在しません" } }</pre> | `E-STL-012` |
| 9 | 409 | ✖項目が残っている | <pre>{ "error": { "code": "E-STL-002", "message": "締め不可（✖）の項目が残っています", "detail": { "blocking": [ { "adrNo": 2, "label": "未確定の取引", "count": 1 }, { "adrNo": 3, "label": "未同期の端末", "count": 1 } ] } } }</pre> | `E-STL-002` |
| 10 | 409 | 締め済みの日 | <pre>{ "error": { "code": "E-STL-004", "message": "この業務日は既に締め済みです", "detail": { "lockedBy": "桜 七子", "lockedAt": "2027-08-02T10:04:00+09:00" } } }</pre> | `E-STL-004` |
| 11 | 409 | 前日が未締め | <pre>{ "error": { "code": "E-STL-005", "message": "前の業務日 2027-07-31 が未締めです。先に締めてください", "detail": { "openDate": "2027-07-31" } } }</pre> | `E-STL-005` |
| 12 | 409 | カレンダーに次の市場開催日が未登録 | <pre>{ "error": { "code": "E-STL-008", "message": "次の市場開催日がカレンダーに登録されていません" } }</pre> | `E-STL-008` |
| 13 | 409 | 表示後にチェックリストが変更された | <pre>{ "error": { "code": "E-STL-010", "message": "チェックリストが更新されました。最新の内容を確認してください", "detail": { "currentVersion": "sha256:9a0b…" } } }</pre> | `E-STL-010` |
| 14 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 権限: `STL_HEAD` または有効な代行 STL_HEAD（S8）。監査ログには「…の代わりに」と記録する。
- ワンタイムMFAトークンは`iam`のMFA認証APIから取得する（未仕様化 — `POST /api/v1/auth/mfa/verify` {code, purpose} を提案）。
- 締め後は、その日へのすべての書き込みが423 `E-CMN-003`を返す（トリガー `enforce_open_business_day`）。
- クライアント側で自動リトライしない。通信エラー時はAPI-STL-001を呼び出して実際の状態を確認する。
- Q-STL-01 は回答済み 【顧客（模擬）、2026-11-25】: 日付順での締めを必須とする（`E-STL-005`）。
- **未決事項 / TBD:** なし
