---
id: SPEC-STL_API-003
title: 端末に「端末回収不能」を付与
type: system
subtype: api-design
api_id: API-STL-003
endpoint: /api/v1/devices/{deviceId}/lost
method: POST
media_type: application/json
feature: settle
screen_id: [SC-07-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-07-02-001, SPEC-STL_DEVICE_LOST-001, SPEC-IAM_AUDIT_DB-001, ADR-005, ADR-008]
---

# API-STL-003 — POST /api/v1/devices/{deviceId}/lost

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-M03: 元の`field`で項目をロック | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

同期できない端末（故障 / 紛失 / バッテリー切れ）に印を付けます。端末は日次締めチェックリストの✖ #3から外れ、`is_active = false`となり、端末のセッションは失効します。端末が後から送信した記録はSC-03-07（要確認）に入ります。他の✖項目は解消できません。★ ワンタイムMFAを必須とします。

**認証:** Session cookie `sid` + CSRF（ヘッダ `X-CSRF-Token`）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `deviceId` | string | `dv-3…` | 端末のUUID |  |
| 2 | Header Parameters | `X-MFA-Token` | string | `mfa_…` | `purpose = DEVICE_LOST` |  |
| 3 | Body Parameters | `reason` | string | `水没して起動しない` | 1〜200文字 |  |

例 body:

```json
{
  "reason": "水没して起動しない"
}
```

> 共通規約（Param Type、Data Type、`[optional]`、エラー時のbody `{ "error": {…} }`、MFA、楽観ロック、冪等性）：[`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`：[`_common/error-codes.md`](../../../_common/error-codes.md)

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 登録済み | <pre>{<br>&nbsp;&nbsp;"device": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "dv-3…",<br>&nbsp;&nbsp;&nbsp;&nbsp;"code": "TAB-03",<br>&nbsp;&nbsp;&nbsp;&nbsp;"lostReportedAt": "2027-08-02T09:40:00+09:00",<br>&nbsp;&nbsp;&nbsp;&nbsp;"lostReportedBy": "桜 七子",<br>&nbsp;&nbsp;&nbsp;&nbsp;"pendingSyncCountAtReport": 5,<br>&nbsp;&nbsp;&nbsp;&nbsp;"isActive": false<br>&nbsp;&nbsp;}<br>}</pre> | クライアントはAPI-STL-001を再度呼び出し、端末が#3から外れたことを確認する |
| 2 | 422 | bodyまたはqueryの型誤り・項目欠落（zod） | <pre>{ "error": { "code": "E-CMN-007", "message": "入力の形式が正しくありません", "field": "reason" } }</pre> | `E-CMN-007` |
| 3 | 422 | 理由が未入力 | <pre>{ "error": { "code": "E-STL-006", "message": "理由を入力してください（200文字以内）" } }</pre> | `E-STL-006` |
| 4 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 5 | 403 | 役割・決裁権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 6 | 403 | `X-MFA-Token`の未送信 / 期限切れ / 使用済み / 目的不一致（★ 毎回コードを再入力） | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です", "detail": { "purpose": "DAY_CLOSE" } } }</pre> | `E-CMN-005` |
| 7 | 404 | 端末が見つからない | <pre>{ "error": { "code": "E-STL-009", "message": "端末が見つかりません" } }</pre> | `E-STL-009` |
| 8 | 409 | 端末が登録済み | <pre>{ "error": { "code": "E-STL-007", "message": "この端末は既に端末回収不能として登録されています", "detail": { "lostReportedAt": "2027-08-02T09:40:00+09:00" } } }</pre> | `E-STL-007` |
| 9 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 権限: `STL_HEAD` / 代行。★ 毎回コードを再入力（PREMISE §3.2）。
- 第1期には登録を取り消すAPIはない。端末の再登録はSYSADMが行う（新しいコード）。
- **未決事項 / TBD:** なし
