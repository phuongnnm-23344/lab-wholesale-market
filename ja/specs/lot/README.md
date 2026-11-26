# Feature `lot` — 設計ドキュメント

モジュール `lot`（ARCHITECTURE §2、領域 D-LOT）: 仮受付（岸壁での仮の受付）→ 本登録（正式な登録）→ 目利き・下見（人が判断する査定）→ 公開 → 確定 / 持ち越し; ロット数量台帳 `lot_quantity_ledger`。詳細仕様が揃っている主要画面: SC-03-01, SC-03-05 (L4-D02)。SC-03-02 仮受付はワイヤーフレームのみ（[wireframes/SC-03-02](../../wireframes/SC-03-02-lot-provisional-intake-dock-tablet-wireframe.md), L4-D05）。

## 1. 機能内のドキュメント

| ID | 種別 | 資料 | Version | Link |
|---|---|---|---|---|
| SPEC-SC-03-01-001 | Screen Spec (BM-2-901-51) | SC-03-01 ロット本登録（受付台・PC） | 0.1.0 | [screen-specification/SC-03-01_SPEC.md](screen-specification/SC-03-01_SPEC.md) |
| SPEC-SC-03-05-001 | Screen Spec (BM-2-901-51) | SC-03-05 目利き・下見結果入力 | 0.1.0 | [screen-specification/SC-03-05_SPEC.md](screen-specification/SC-03-05_SPEC.md) |
| SPEC-LOT_FUNC-001 | Function Spec (BM-2-901-54) | Module lot — 機能 | 0.1.0 | [function-specifications/LOT_FUNC.md](function-specifications/LOT_FUNC.md) |
| SPEC-LOT_REGISTER-001 | Technical Design (BM-2-901-53) | 本登録 + 数量台帳の受入 | 0.1.0 | [technical-design/LOT_REGISTER_TECH.md](technical-design/LOT_REGISTER_TECH.md) |
| SPEC-LOT_INSPECTION_RECORD-001 | Technical Design (BM-2-901-53) | 目利き・下見結果の記録 | 0.1.0 | [technical-design/LOT_INSPECTION_RECORD_TECH.md](technical-design/LOT_INSPECTION_RECORD_TECH.md) |

## 2. system-design への参照

| 種別 | 資料 |
|---|---|
| Database Design | [LOT_DB.md](../system-design/database-design/LOT_DB.md) (4.25–4.28) · enum は [MKT_DB.md §4.0](../system-design/database-design/MKT_DB.md#40-共通規約) · マスタ `shippers`, `item_codes`, `code_values` は [RULE_DB.md](../system-design/database-design/RULE_DB.md) · `offline_sync_records` は [IAM_AUDIT_DB.md](../system-design/database-design/IAM_AUDIT_DB.md) |
| API Design | [api-design/lot/](../../../specs/system-design/api-design/lot): API-LOT-001 … API-LOT-006 |
| Wireframe | [SC-03-01](../../wireframes/SC-03-01-lot-main-registration-wireframe.md) · [SC-03-05](../../wireframes/SC-03-05-mekiki-inspection-result-entry-wireframe.md) · [SC-03-02](../../wireframes/SC-03-02-lot-provisional-intake-dock-tablet-wireframe.md) · 共通レイアウト [_common-layout](../../wireframes/_common-layout.md) |
| アーキテクチャ / ADR | ARCHITECTURE §2, §4.1, §6 · ADR-004 (append-only), ADR-005 (業務日), ADR-008 (offline 仮受付), ADR-010 (AI/OCR 不使用) |

## 3. 機能の API

| API ID | Method + URL | 呼出元画面 |
|---|---|---|
| API-LOT-001 | `GET /api/v1/lots/provisional` | SC-03-01 [1], [12] |
| API-LOT-002 | `POST /api/v1/lots` | SC-03-01 [9], [13] |
| API-LOT-003 | `GET /api/v1/lots` | SC-03-01 [11], SC-03-05 [2][4], SC-04-01 [1] |
| API-LOT-004 | `POST /api/v1/lots/inspections` | SC-03-05 [10], [11] |
| API-LOT-005 | `GET /api/v1/master/shippers` | SC-03-01 [4], SC-03-05 [2] |
| API-LOT-006 | `GET /api/v1/lots/form-options` | SC-03-01 [3][5][6], SC-03-05 [2][6] |

## 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初期作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
