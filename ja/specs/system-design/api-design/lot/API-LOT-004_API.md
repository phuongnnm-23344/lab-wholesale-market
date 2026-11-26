---
id: SPEC-LOT_API-004
title: 目利き・下見結果の記録
type: system
subtype: api-design
api_id: API-LOT-004
endpoint: /api/v1/lots/inspections
method: POST
media_type: application/json
feature: lot
screen_id: [SC-03-05]
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-03-05-001, SPEC-LOT_FUNC-001, SPEC-LOT_INSPECTION_RECORD-001]
---

# API-LOT-004 — POST /api/v1/lots/inspections

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |

---

## 2. 内容 / Description

1–50 件のロットに、目利きの結果（等級、所見）を1件記録します。結果は **評価者本人が決めたもの** です。ロット1件につき1行を作成し、すべて同じ `batchNo` を付けます。全件成功するか、全件失敗します。システムが等級を採点・提案する入力はありません（CAP-HUMAN-01、ADR-010）。処理: [LOT_INSPECTION_RECORD_TECH](../../../lot/technical-design/LOT_INSPECTION_RECORD_TECH.md).

**認証:** Session cookie。ロール: JUDGE。MFA なし。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Body Parameters | `lotIds` | string[] | `["6f1c…0003","6f1c…0004"]` | 1–50 件の UUID、重複なし | |
| 2 | Body Parameters | `grade` | string | `A` | API-LOT-006 の `grades[]` に含まれる等級コード | |
| 3 | Body Parameters | `note` | string | `色つや良好` | 所見、≤ 200 文字 | `[optional]` |
| 4 | Body Parameters | `secondCheckerEmployeeNo` | string | `10234` | 2人目の確認者の社員番号、≤ 10 文字、記録者と別人であること | `[optional]` |
| 5 | Body Parameters | `rerecordReason` | string | `取引後に再確認` | ≤ 200 文字。取引のあるロットが含まれる場合は必須 | `[optional]` |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 201 | 記録済み | <pre>{<br>  "count": 3,<br>  "batchNo": "c2f0a9b1-0000-4000-8000-0000000000aa",<br>  "recordedAt": "2027-08-02T03:25:00+09:00",<br>  "recordedByName": "桜 二郎"<br>}</pre> | トースト C-12 に使用 |
| 2 | 401 | ログインしていません | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | |
| 3 | 403 | JUDGE ロールがありません | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> | |
| 4 | 404 | 存在しないロット ID が含まれる | <pre>{ "error": { "code": "E-LOT-014", "message": "対象のロットが見つかりません" } }</pre> | |
| 5 | 409 | ロットに記録できない | <pre>{ "error": { "code": "E-LOT-013", "message": "ロット L20270802-9 は下見を記録できない状態です（仮受付）", "detail": { "lotNo": "L20270802-9" } } }</pre> | どのロットも記録されない |
| 6 | 409 | デッドロック | <pre>{ "error": { "code": "E-CMN-006", "message": "同時に操作が行われました。もう一度お試しください" } }</pre> | |
| 7 | 422 | データ不正 | <pre>{ "error": { "code": "E-LOT-011", "message": "取引のあるロットを再記録する場合は理由を入力してください", "field": "rerecordReason" } }</pre> | 考えられるコード: `E-LOT-008`, `009`, `010`, `011`, `012`, `017` |
| 8 | 423 | 業務日は締め済み | <pre>{ "error": { "code": "E-CMN-003", "message": "2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。" } }</pre> | |
| 9 | 500 | システムエラー | <pre>{ "error": { "code": "E-CMN-004", "message": "処理中にエラーが発生しました。時間をおいて再度お試しください", "traceId": "b7e1c0d2" } }</pre> | |

---

## 5. その他の注記

- `secondCheckerEmployeeNo` → `lot_inspections.second_checker_id`（社員番号で照合）、`rerecordReason` → `rerecord_reason` — LOT_DB 0.2.1 §4.27.
- **未決事項 / TBD:** Q-LOT-03（実際の等級一覧）、Q-LOT-04（取引のあるロットを記録し直した場合に、確定した人へ通知するか）。
