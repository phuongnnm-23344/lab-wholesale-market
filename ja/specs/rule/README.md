# rule — 版管理された規程（メーカー・チェッカー、発効日、回数上限、ロールバック）

Feature `rule`（モジュール。`architecture/ARCHITECTURE.md` §2 参照）: 規程の版 = 交付率表 2 件（仲卸 / 売買参加者）+ 規程パラメータ。発効日は翌月 1 日。メーカー（ルール管理者）≠ チェッカー（照合部門長、MFA）。年間 TC あたり **最大 4 回**（go-live 一式、取消版、市場カレンダー・銀行休業日は除く）。ロールバック = 旧内容を複写した新しい版。4 回に達している場合のロールバックは **E-14** を待つ — N1 / N2 の二つの分岐を設計済み（ADR-006）。詳細仕様が揃っている画面は LAB-4（L4-D02）の **SC-10-04**。

## 機能の文書

| 種別 | ID | 資料 | Version |
|---|---|---|---|
| 画面仕様書 (BM-2-901-51) | SPEC-SC-10-04-001 | [screen-specification/SC-10-04_SPEC.md](screen-specification/SC-10-04_SPEC.md) + [番号付き画像](../../../specs/rule/screen-specification/assets/SC-10-04_annotated.png) | 0.1.0 |
| 機能仕様書 (BM-2-901-54) | SPEC-RULE_FUNC-001 | [function-specifications/RULE_FUNC.md](function-specifications/RULE_FUNC.md) — 関数シグネチャ 12 件 + エラーコード表 `E-RULE-001..014` | 0.1.0 |
| 技術設計 (BM-2-901-53) | SPEC-RULE_VERSION-001 | [technical-design/RULE_VERSION_TECH.md](technical-design/RULE_VERSION_TECH.md) — ブロック R1–R7、E-14 のポリシー関数、テストベクター RV-01..18 | 0.1.0 |

## system-design への参照

| 種別 | 資料 |
|---|---|
| API設計 | [API-RULE-001](../system-design/api-design/rule/API-RULE-001_API.md) `GET /api/v1/rule-versions/{versionId}/review` · [API-RULE-002](../system-design/api-design/rule/API-RULE-002_API.md) `POST …/confirm` · [API-RULE-003](../system-design/api-design/rule/API-RULE-003_API.md) `POST …/second-approval` (N2) · [API-RULE-004](../system-design/api-design/rule/API-RULE-004_API.md) `POST …/return` · [API-RULE-005](../system-design/api-design/rule/API-RULE-005_API.md) `POST …/cancel` · [API-RULE-006](../system-design/api-design/rule/API-RULE-006_API.md) `POST …/cancel-request` |
| DB設計 | [RULE_DB.md](../system-design/database-design/RULE_DB.md) 4.21–4.23, [CLOSE_DB.md](../system-design/database-design/CLOSE_DB.md) 4.24 / 4.43 (期の版) |
| アーキテクチャ | [ADR-006](../../architecture/adr/ADR-006-versioned-market-rules-maker-checker-e14-branches.md), ADR-002 (MFA), ADR-007 (インセンティブ計算時の期単位の版) |
| ワイヤーフレーム | [SC-10-04](../../wireframes/SC-10-04-rule-version-approve-rollback-wireframe.md), [_common-layout](../../wireframes/_common-layout.md) |

## LAB-5 向けタスク分割の提案

R1 認証 + 行ロック · R2 状態 / 発効日 / 内容のチェック · R3 回数上限 + advisory lock · R4 ポリシー関数（N1 / N2 の二つの本体、境界ケース 24 件） · R5 書き込み + 監査 + outbox · R6 日付による有効化 + `rule_at`（settle の業務日を開く関数に接続） · R7 差戻し / 取消依頼 / 取消。追加: API-RULE-001..006、画面 SC-10-04、フィクスチャ RV-01..18。方式 F / G（ADR-006 §3）は**対象外** — 別の issue で明確化する（L4-D06）。
