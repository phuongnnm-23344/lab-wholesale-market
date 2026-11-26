---
id: SPEC-TRD_API-002
title: 相対取引の確定（主要フロー）
type: system
subtype: api-design
api_id: API-TRD-002
endpoint: /api/v1/trades/aitai
method: POST
media_type: application/json
feature: trade
screen_id: [SC-04-01]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-04-01-001, SPEC-TRADE_FUNC-001, SPEC-TRADE_AITAI_CONFIRM-001, SPEC-TRADE_QUALIFICATION_CHECK-001]
---

# API-TRD-002 — POST /api/v1/trades/aitai

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | 顧客 Q-TRD-02: E-TRD-007 で税込により参加上限を比較、`detail` に税込 / 税抜を含める | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

相対取引（主要フロー）を1つのトランザクションで確定します: ロットをロックして数量を確認し、確定時点で許可（仲卸）/ 承認 ＋ 期ごとの参加上限（売買参加者）を確認し、取引を `CONFIRMED` で記録し、FIG-012 のイベントを3件記録し、ロットの数量を減らします。確定者はログイン中の人です（クライアントからは受け取りません）。処理: [TRADE_AITAI_CONFIRM_TECH](../../../trade/technical-design/TRADE_AITAI_CONFIRM_TECH.md).

**認証:** Session cookie。ロール: TRADE。MFA なし（PREMISE §3.2）。オンライン必須。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Body Parameters | `lotId` | string | `6f1c2a4e-0000-4000-8000-000000000005` | ロットの UUID（API-LOT-003 の `onSale=true` から取得） | |
| 2 | Body Parameters | `buyerId` | string | `a1b2c3d4-0000-4000-8000-0000000000n1` | 買受人の UUID（API-TRD-001 から取得） | |
| 3 | Body Parameters | `qty` | number | `2.0` | > 0。ロットの単位に合わせた小数（kg は小数第1位まで、箱 / 尾は整数）— サーバーで確認 | |
| 4 | Body Parameters | `unitPriceJpy` | Integer | `1200` | 単価（税抜）、1–99,999,999 | |
| 5 | Body Parameters | `overLimitReasonCode` | string | `PRIOR_CONSENT` | `PRIOR_CONSENT` · `DEPOSIT_TOPUP` · `OTHER` — 売買参加者が参加上限を超えた場合のみ使用 | `[optional]` |
| 6 | Body Parameters | `overLimitNote` | string | `電話で了承済` | ≤ 200。`OTHER` の場合は必須 | `[optional]` |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | 確定済み | <pre>{<br>  "tradeId": "d4e5f6a7-0000-4000-8000-000000000005",<br>  "tradeNo": "A20270802-0005",<br>  "displayNo": "相対-0005",<br>  "amountJpy": 2400,<br>  "availableQtyAfter": 64.0,<br>  "overLimit": false,<br>  "confirmedAt": "2027-08-02T04:31:12+09:00"<br>}</pre> | `availableQtyAfter` で [2] を更新。`displayNo` はトースト C-12 と伝票に使用 |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | TRADE ロールがありません | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | ロットが存在しません | <pre>{ "error": { "code": "E-LOT-014", "message": "対象のロットが見つかりません" } }</pre> | |
| 5 | 409 | ロットが販売中でない / 数量不足 | <pre>{ "error": { "code": "E-TRD-002", "message": "残数量が 1.0kg に変わりました（不足しています）", "field": "qty", "detail": { "availableQty": 1.0, "unit": "KG" } } }</pre> | または `E-TRD-001`（`detail.status`） |
| 6 | 409 | 確定時刻前 | <pre>{ "error": { "code": "E-TRD-012", "message": "取引の確定は 02:00 以降にできます" } }</pre> | |
| 7 | 409 | デッドロック | <pre>{ "error": { "code": "E-CMN-006", "message": "同時に操作が行われました。もう一度お試しください" } }</pre> | クライアントは再度押す前に API-TRD-003 で確認 |
| 8 | 422 | 資格が無効（許可） | <pre>{ "error": { "code": "E-TRD-005", "message": "仲卸の許可が有効ではないため確定できません（失効・有効期限 2027/07/31）", "field": "buyerId" } }</pre> | 承認の場合は `E-TRD-006`「売買参加者の承認が…」 — **2つのコード、2つの文言**（ルール 2）；`E-TRD-003`, `004` も同じ `field` |
| 9 | 422 | 参加上限超過で理由が未入力 | <pre>{ "error": { "code": "E-TRD-007", "message": "今期の参加上限を超えます。超過理由を選択してください（上限 ¥5,000,000 / 今期確定済 ¥4,989,600（税込） / 今回 ¥25,920（税込））", "detail": { "limitJpy": 5000000, "usedInclJpy": 4989600, "amountInclJpy": 25920, "usedExclJpy": 4620000, "amountExclJpy": 24000 } } }</pre> | クライアントはボックス [13] を開く |
| 10 | 422 | その他のデータ不正 | <pre>{ "error": { "code": "E-TRD-010", "message": "kg は小数第1位まで、箱・尾は整数で入力してください", "field": "qty" } }</pre> | 考えられるコード: `E-TRD-008`, `009`, `010`, `011`, `E-CMN-007` |
| 11 | 423 | 業務日は締め済み | <pre>{ "error": { "code": "E-CMN-003", "message": "2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。" } }</pre> | |
| 12 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- 冪等ではありません — クライアントは送信中にボタンを無効化します。タイムアウト時に自動で再送しません（SC-04-01 §5）。
- 超過理由は、超過していない場合（または買受人が仲卸の場合）でも送られた場合は無視し、保存しません。
- **未決事項 / TBD:** Q-TRD-01（`displayNo` の形式）。Q-TRD-02 回答済み: 税込で比較、`amountInclJpy` = 税込(使用済み + 今回) − 税込(使用済み)（TRADE_QUALIFICATION_CHECK §4.4）。
