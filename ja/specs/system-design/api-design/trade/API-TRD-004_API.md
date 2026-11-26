---
id: SPEC-TRD_API-004
title: 取引確認票の印刷（直接印刷 / 再印刷）
type: system
subtype: api-design
api_id: API-TRD-004
endpoint: /api/v1/trades/{tradeId}/slip-prints
method: POST
media_type: application/json
feature: trade
screen_id: [SC-04-01, SC-04-02, SC-04-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-04-01-001, SPEC-TRADE_FUNC-001]
---

# API-TRD-004 — POST /api/v1/trades/{tradeId}/slip-prints

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

FORM の様式に従って、取引の取引確認票 PDF を生成し、`print_logs`（`TRADE_SLIP`）に記録します。確定直後（SC-04-01 — PC から直接印刷、プレビューなし、M05）、再印刷（SC-04-02、伝票に「再発行」）、当日訂正の後（伝票に「訂正」/「取消」）に呼び出します。2回目以降の印刷では、サーバーが `is_reissue = true` を自動で付けます。Function: [TRADE_FUNC 2.6](../../../trade/function-specifications/TRADE_FUNC.md#26-printtradeslip).

**認証:** Session cookie。ロール: TRADE。MFA なし（PREMISE §3.2「取引確認票の印刷 / 再印刷」）。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `tradeId` | string | `d4e5f6a7-0000-4000-8000-000000000005` | 取引の UUID | |
| 2 | Body Parameters | `isReissue` | boolean | `false` | クライアントが再印刷かどうか判断した値 — 照合用のみ。サーバーは `print_logs` で判定 | `[optional]` |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | 伝票の PDF | <pre>(binary application/pdf)</pre> | ヘッダー `Content-Type: application/pdf`、`Content-Disposition: inline; filename="torihiki-A20270802-0005.pdf"`、`X-Print-Log-Id`、`X-Reissue: false` |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | TRADE ロールがありません | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | 取引が存在しません | <pre>{ "error": { "code": "E-TRD-023", "message": "対象の取引が見つかりません" } }</pre> | |
| 5 | 409 | 取引が取消済み（取消直後の取消票の印刷を除く） | <pre>{ "error": { "code": "E-TRD-025", "message": "取消済みの取引の取引確認票は出力できません" } }</pre> | |
| 6 | 500 | PDF 生成エラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | クライアントは SC-04-01 [12] を表示；取引は確定のまま |

---

## 5. その他の注記

- `print_logs` を記録するため POST です。PDF 生成に失敗した場合はログを記録しません。
- 伝票の内容（FORM の様式、必須項目）は `report` モジュールに属します — まだ Technical Design がありません。
- **未決事項 / TBD:** Q-TRD-03（現場 PC からの直接印刷の方法）。
