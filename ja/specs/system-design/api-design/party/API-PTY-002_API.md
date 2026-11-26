---
id: SPEC-PTY_API-002
title: 参加者の基本情報の保存
type: system
subtype: api-design
api_id: API-PTY-002
endpoint: /api/v1/participants/{participantId}
method: PUT
media_type: application/json
feature: party
screen_id: [SC-01-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-01-02-001, SPEC-PARTY_FUNC-001]
---

# API-PTY-002 — PUT /api/v1/participants/{participantId}

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 項目のロックを元の `field` に設定 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

SC-01-02 [4]–[7] の基本情報ブロックを保存します: 名称、買受人番号、メールアドレス（最大2件）。種別、状態、保証金、資格は変更できません。メールを変更する場合は、古い行を閉じて新しい行を追加します（履歴）。

**認証:** Session cookie `sid` + CSRF（ヘッダー `X-CSRF-Token`）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `participantId` | string | `6f1d…` | UUID |  |
| 2 | Body Parameters | `name` | string | `サンプル仲卸1` | 1–100 文字、前後の空白を除去 |  |
| 3 | Body Parameters | `buyerNo` | string | `N01` | `^[A-Z0-9]{1,10}$`；仲卸 / 売買参加者では必須、それ以外の種別では無視 | [optional] 卸売業者 / 買出人の場合 |
| 4 | Body Parameters | `emails` | string[] | `["n01@…"]` | 0–2 件、各 ≤ 254 文字、重複不可 |  |
| 5 | Body Parameters | `requestRef` | string | `REQ-2027-0012` | メール変更の依頼書番号（≤ 30） | [optional] |
| 6 | Body Parameters | `version` | Integer | `7` | 読み込み時の `participant.version` の値 — 楽観的ロック |  |

リクエストの例:

```json
{
  "name": "サンプル仲卸1",
  "buyerNo": "N01",
  "emails": [
    "n01@sakura-sample.example"
  ],
  "version": 7
}
```

> 共通ルール（Param Type、Data Type、`[optional]`、エラー本文 `{ "error": {…} }`、MFA、楽観的ロック、冪等性）: [`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`: [`_common/error-codes.md`](../../../_common/error-codes.md).

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 保存済み | <pre>{<br>&nbsp;&nbsp;"participant": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "6f1d…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name": "サンプル仲卸1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;"version": 8<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"contacts": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"slotNo": 1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email": "n01@sakura-sample.example"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> | 新しい内容を返します。クライアントは API-PTY-001 を再読込して、すべてのブロックを取得 |
| 2 | 422 | ボディ / クエリの型が不正、または項目が不足（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "name" } }</pre> | `E-CMN-007` |
| 3 | 422 | 名称が不正 | <pre>{ "error": { "code": "E-PTY-001", "message": "名称は1〜100文字で入力してください", "detail": { "name": "length" } } }</pre> | `E-PTY-001` |
| 4 | 422 | 買受人番号の形式が不正 | <pre>{ "error": { "code": "E-PTY-002", "message": "買受人番号は英大文字・数字1〜10文字で入力してください", "detail": { "buyerNo": "pattern" } } }</pre> | `E-PTY-002` |
| 5 | 422 | メールの形式が不正 | <pre>{ "error": { "code": "E-PTY-004", "message": "メールアドレスの形式が正しくありません", "detail": { "emails[1]": "format" } } }</pre> | `E-PTY-004` |
| 6 | 422 | メールアドレスが重複 | <pre>{ "error": { "code": "E-PTY-021", "message": "同じメールアドレスは2件登録できません" } }</pre> | `E-PTY-021` |
| 7 | 401 | ログインしていない / セッション切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 8 | 403 | ロール / 決裁・確認権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 9 | 404 | 参加者が見つからない（または RLS で非表示） | <pre>{ "error": { "code": "E-PTY-018", "message": "参加者が見つかりません" } }</pre> | `E-PTY-018` |
| 10 | 409 | 買受人番号が重複 | <pre>{ "error": { "code": "E-PTY-003", "message": "この買受人番号は既に使われています", "detail": { "buyerNo": "N01" } } }</pre> | `E-PTY-003` |
| 11 | 409 | 他の人が更新済み（`version` の不一致） | <pre>{ "error": { "code": "E-CMN-008", "message": "他の利用者が更新しました。最新の内容を読み込み直してください", "detail": { "currentVersion": "8" } } }</pre> | `E-CMN-008` |
| 12 | 409 | 参加者は退会済み | <pre>{ "error": { "code": "E-PTY-010", "message": "この参加者は退会済みのため変更できません" } }</pre> | `E-PTY-010` |
| 13 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- ロール: SETTLE, STL-HEAD。MFA は不要（PREMISE §3.2 に記載なし）。
- 監査ログは変更前 / 変更後を記録（FR-AUDIT-01）。メールは個人データのため、ログには完全なメールアドレスを書きません（log-convention）。
- `kind` など未知の項目を送った場合は、スキーマで除去（strip）され、エラーにはなりません。
- **未決事項 / TBD:** なし
