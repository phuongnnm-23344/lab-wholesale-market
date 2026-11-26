# Feature `trade` — 設計ドキュメント

モジュール `trade`（ARCHITECTURE §2、領域 D-TRADE）: **相対取引（直接取引）— 主要フロー、価値の約90%**; せり（競り）は補助フローで、システムは **結果を記録・確認するだけ**（直接の競り画面はない — ルール 1）; 当日訂正 / 取消 は日の締め前に行う; 取引確認票 を印刷。確定時点で 許可（仲卸）と 承認 + 参加上限（売買参加者）を検査 — **別物**（ルール 2, BR-PERM-01）。詳細仕様が揃っている主要画面: SC-04-01, SC-05-02 (L4-D02); SC-04-05 はワイヤーフレームのみだが、ロジックは本 feature の Function / Technical Design にある。

## 1. 機能内のドキュメント

| ID | 種別 | 資料 | Version | Link |
|---|---|---|---|---|
| SPEC-SC-04-01-001 | Screen Spec (BM-2-901-51) | SC-04-01 相対取引入力・確定 | 0.1.0 | [screen-specification/SC-04-01_SPEC.md](screen-specification/SC-04-01_SPEC.md) |
| SPEC-SC-05-02-001 | Screen Spec (BM-2-901-51) | SC-05-02 せり結果確認 | 0.1.0 | [screen-specification/SC-05-02_SPEC.md](screen-specification/SC-05-02_SPEC.md) |
| SPEC-TRADE_FUNC-001 | Function Spec (BM-2-901-54) | Module trade — 機能 | 0.1.0 | [function-specifications/TRADE_FUNC.md](function-specifications/TRADE_FUNC.md) |
| SPEC-TRADE_QUALIFICATION_CHECK-001 | Technical Design (BM-2-901-53) | 確定時点の 許可 / 承認 + 参加上限 の検査 | 0.1.0 | [technical-design/TRADE_QUALIFICATION_CHECK_TECH.md](technical-design/TRADE_QUALIFICATION_CHECK_TECH.md) |
| SPEC-TRADE_AITAI_CONFIRM-001 | Technical Design (BM-2-901-53) | 相対の確定 + FIG-012 の状態 + 数量の減算 | 0.1.0 | [technical-design/TRADE_AITAI_CONFIRM_TECH.md](technical-design/TRADE_AITAI_CONFIRM_TECH.md) |
| SPEC-TRADE_SERI_CONFIRM-001 | Technical Design (BM-2-901-53) | せり セッションの確認 + 差し戻し | 0.1.0 | [technical-design/TRADE_SERI_CONFIRM_TECH.md](technical-design/TRADE_SERI_CONFIRM_TECH.md) |
| SPEC-TRADE_SAME_DAY_FIX-001 | Technical Design (BM-2-901-53) | 当日訂正 / 取消 (REVERSE / DELTA) | 0.1.0 | [technical-design/TRADE_SAME_DAY_FIX_TECH.md](technical-design/TRADE_SAME_DAY_FIX_TECH.md) |

## 2. system-design への参照

| 種別 | 資料 |
|---|---|
| Database Design | [TRADE_DB.md](../system-design/database-design/TRADE_DB.md) (4.29–4.31, 4.33) · [ADJUST_DB.md](../system-design/database-design/ADJUST_DB.md) (4.32 `trade_fixes`, 4.39 `trade_adjustments`) · [PARTY_DB.md](../system-design/database-design/PARTY_DB.md) (4.12–4.15, view `v_qualification_current`, `v_buyer_period_usage`) · [LOT_DB.md](../system-design/database-design/LOT_DB.md)（数量台帳は lot の public 関数経由） |
| API Design | [api-design/trade/](../../../specs/system-design/api-design/trade): API-TRD-001 … API-TRD-008; 追加で API-LOT-003（lot）を呼ぶ |
| ワイヤーフレーム | [SC-04-01](../../wireframes/SC-04-01-aitai-trade-entry-confirm-wireframe.md) · [SC-05-02](../../wireframes/SC-05-02-seri-result-session-confirm-wireframe.md) · [SC-04-05](../../wireframes/SC-04-05-same-day-correction-cancel-wireframe.md) · [_common-layout](../../wireframes/_common-layout.md) |
| アーキテクチャ / ADR | ARCHITECTURE §4.1, §4.3, §5, §6 · ADR-003 (許可 ≠ 承認), ADR-004 (REVERSE / DELTA), ADR-005 (業務日・締め), ADR-008 (オンライン必須, 紙) |

## 3. 機能の API

| API ID | Method + URL | 呼出元画面 |
|---|---|---|
| API-TRD-001 | `GET /api/v1/trades/buyers` | SC-04-01 [3][4][13], SC-04-05 [4] |
| API-TRD-002 | `POST /api/v1/trades/aitai` | SC-04-01 [8][13][14] |
| API-TRD-003 | `GET /api/v1/trades` | SC-04-01 [10], SC-04-03 |
| API-TRD-004 | `POST /api/v1/trades/{tradeId}/slip-prints` | SC-04-01（確定後に印刷）, SC-04-02 |
| API-TRD-005 | `GET /api/v1/seri-sessions/{sessionId}` | SC-05-02（画面を開く） |
| API-TRD-006 | `POST /api/v1/seri-sessions/{sessionId}/confirm` | SC-05-02 [9] |
| API-TRD-007 | `POST /api/v1/seri-sessions/{sessionId}/send-back` | SC-05-02 [10] |
| API-TRD-008 | `POST /api/v1/trades/{tradeId}/fixes` | SC-04-05 [11][12] |

## 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初期作成（LAB-4 P3） | 2026-11-25 | phuongnnm-23344 | |
