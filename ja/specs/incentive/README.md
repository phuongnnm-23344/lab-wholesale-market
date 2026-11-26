# incentive — 期、入金の配分、完納奨励金、期ロック

Feature `incentive`（モジュール。`architecture/ARCHITECTURE.md` §2 参照）: 元取引の業務日に基づく支払期、期への入金（着金）の配分、**完納奨励金**（期限内に全額を支払った購入者への奨励金）の計算、および**期ロック**（期の確定 = 正式計上 + 同一トランザクション内での凍結）。詳細仕様が揃っている画面は LAB-4（L4-D02）の **SC-09-04**。

## 機能の文書

| 種別 | ID | 資料 | Version |
|---|---|---|---|
| 画面仕様書 (BM-2-901-51) | SPEC-SC-09-04-001 | [screen-specification/SC-09-04_SPEC.md](screen-specification/SC-09-04_SPEC.md) + [番号付き画像](../../../specs/incentive/screen-specification/assets/SC-09-04_annotated.png) | 0.1.0 |
| 機能仕様書 (BM-2-901-54) | SPEC-INC_FUNC-001 | [function-specifications/INC_FUNC.md](function-specifications/INC_FUNC.md) — 関数シグネチャ 13 件 + エラーコード表 `E-INC-001..014` | 0.1.0 |
| 技術設計 (BM-2-901-53) | SPEC-INC_ENGINE-001 | [technical-design/INC_ENGINE_TECH.md](technical-design/INC_ENGINE_TECH.md) — **完納奨励金の独立した技術設計**: 変数、計算式、計算順序、完了条件付きの 9 ブロック K1–K9 | 0.1.0 |

## system-design への参照

| 種別 | 資料 |
|---|---|
| API設計 | [API-INC-001](../system-design/api-design/incentive/API-INC-001_API.md) `GET /api/v1/periods/{periodId}/lock-view` · [API-INC-002](../system-design/api-design/incentive/API-INC-002_API.md) `POST …/incentive-previews` (試算) · [API-INC-003](../system-design/api-design/incentive/API-INC-003_API.md) `POST …/lock` (期ロック) · [API-INC-004](../system-design/api-design/incentive/API-INC-004_API.md) `GET …/incentive-results` |
| DB設計 | [INCENTIVE_DB.md](../system-design/database-design/INCENTIVE_DB.md) (結果 + **テストベクター TV-01..15 — 唯一の出典**), [BILLING_DB.md](../system-design/database-design/BILLING_DB.md) 4.47–4.50, [CLOSE_DB.md](../system-design/database-design/CLOSE_DB.md) 4.43, [ADJUST_DB.md](../system-design/database-design/ADJUST_DB.md) 4.37–4.39, [RULE_DB.md](../system-design/database-design/RULE_DB.md) 4.21–4.23 |
| アーキテクチャ | [ADR-007](../../architecture/adr/ADR-007-kanno-incentive-engine-period-batch-delta.md) (エンジン), ADR-002 (MFA), ADR-005 (業務日 / ロック), ADR-006 (規程の版) |
| ワイヤーフレーム | [SC-09-04](../../wireframes/SC-09-04-incentive-calc-period-lock-wireframe.md), [_common-layout](../../wireframes/_common-layout.md) |

## LAB-5 向けタスク分割の提案

INC_ENGINE_TECH §4 の各ブロックが、それぞれ独立した DoD（完了条件）を持つタスクになる: K1 収集 + ハッシュ · K2 FIFO（並行実施可） · K3 期のお支払額 + 完納 / 要確認 · K4 期の版に基づくランクの照会 · K5 計算式 · K6 DELTA（K1–K5 に依存） · K7 CARRY / CARRY_EXPIRED · K8 期ロックのトランザクション + 試算 · K9 読み取りモデル + 試算との照合。追加: API-INC-001..004（ルート + zod + エラーマッピング）、画面 SC-09-04、INCENTIVE_DB §5 由来の CI 用フィクスチャ。
