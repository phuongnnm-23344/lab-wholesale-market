---
id: SPEC-DEL_API-002
title: オフラインモード用の引渡しデータスナップショット
type: system
subtype: api-design
api_id: API-DEL-002
endpoint: /api/v1/deliveries/offline-snapshot
method: GET
media_type: application/json
feature: delivery
screen_id: [SC-06-02]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-06-02-001, SPEC-DEL_RECORD-001, ADR-008]
---

# API-DEL-002 — GET /api/v1/deliveries/offline-snapshot

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | 顧客: Q-DEL-02を締結（スナップショット 7業務日） | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

残が残っている取引すべて（直近7業務日まで）と買受人一覧を返し、PWAがIndexedDBに保存します。通信断時の検索に使います（ADR-008 §2.2-7a）。始業時と同期完了ごとに呼び出します。

**認証:** Session cookie `sid`（読み取り — CSRF不要）

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Header Parameters | `X-Device-Id` | string | `TAB-03` | 登録済み端末コード（セッションにもあり。ヘッダは照合用） |  |

> 共通規約（Param Type、Data Type、`[optional]`、エラー時のbody `{ "error": {…} }`、MFA、楽観ロック、冪等性）：[`_common/api-conventions.md`](../../../_common/api-conventions.md) · 共通エラーコード `E-CMN-*`：[`_common/error-codes.md`](../../../_common/error-codes.md)

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 成功 | <pre>{<br>&nbsp;&nbsp;"snapshotAt": "2027-08-02T06:58:00+09:00",<br>&nbsp;&nbsp;"businessDate": "2027-08-02",<br>&nbsp;&nbsp;"buyers": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "サンプル仲卸1"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;],<br>&nbsp;&nbsp;"trades": [<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeId": "t-0005…",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"tradeNo": "相対-0005",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"buyerNo": "N01",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"itemName": "鰹",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"unit": "KG",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"confirmedQty": 30.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deliveredQty": 12.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"remainingQty": 18.0,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isCarryOver": false<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> | 単価・金額は含まない（端末上の機密データを減らすため）。`snapshotAt` はSC-06-02 [16]に表示。ヘッダ `Cache-Control: no-store` |
| 2 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | `E-CMN-001` |
| 3 | 403 | 役割・決裁権限が不足 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | `E-CMN-002` |
| 4 | 403 | 端末が未登録 / 「端末回収不能」済み | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません", "detail": { "deviceId": "TAB-03" } } }</pre> | `E-CMN-002` |
| 5 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "9f2c…" } }</pre> | `E-CMN-004` |

---

## 5. その他の注記

- 役割: DELIVERY, DEL-HEAD。`is_active` の `DELIVERY_TABLET` / `DOCK_TABLET` 端末のみ。
- 想定サイズ 300 KB 未満（約1,200取引/日 × 残数量分）。
- Q-DEL-02 は回答済み 【顧客（模擬）、2026-11-25】: 7業務日。
- **未決事項 / TBD:** なし
