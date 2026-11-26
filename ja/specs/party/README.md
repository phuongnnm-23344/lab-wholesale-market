# party — 参加者、許可 (仲卸) ≠ 承認 (売買参加者)

モジュール `party` (ARCHITECTURE §2): 参加者の記録、履歴付きの保証金、そして**二つ**の法的資格を明確に分離して扱います。許可（審査を伴う許可、仲卸向け）と承認（簡易な手続きによる承認、売買参加者向け、参加上限あり）です。二つの資格は根拠・手続き・テーブル・エンドポイントがすべて異なります（ルール2、ADR-003）。

## この機能の文書

| ID | 名称 | 種別 | 様式 | Version | File |
|---|---|---|---|---|---|
| SPEC-SC-01-02-001 | SC-01-02 参加者詳細・編集 | Screen Specification | BM-2-901-51 | 0.1.0 | [screen-specification/SC-01-02_SPEC.md](screen-specification/SC-01-02_SPEC.md) |
| SPEC-PARTY_FUNC-001 | 機能仕様 — モジュール party | Function Specifications | BM-2-901-54 | 0.1.0 | [function-specifications/PARTY_FUNC.md](function-specifications/PARTY_FUNC.md) |
| SPEC-PTY_PERMIT_LIFECYCLE-001 | 許可 — 新規 / 更新 / 一時停止 / 失効 | Technical Design | BM-2-901-53 | 0.1.0 | [technical-design/PTY_PERMIT_LIFECYCLE_TECH.md](technical-design/PTY_PERMIT_LIFECYCLE_TECH.md) |
| SPEC-PTY_APPROVAL_LIFECYCLE-001 | 承認 + 参加上限（履歴あり） | Technical Design | BM-2-901-53 | 0.1.0 | [technical-design/PTY_APPROVAL_LIFECYCLE_TECH.md](technical-design/PTY_APPROVAL_LIFECYCLE_TECH.md) |

## システム設計へのリンク

- API設計: [`../system-design/api-design/party/`](../../../specs/system-design/api-design/party) — API-PTY-001..007
- データベース設計: [`PARTY_DB.md`](../system-design/database-design/PARTY_DB.md) (4.9–4.15)
- 元のワイヤーフレーム: [`SC-01-02`](../../wireframes/SC-01-02-participant-detail-kyoka-shonin-wireframe.md) 0.2.2

## 関連画面（完全な仕様はまだなし。SCREEN-LIST のリストレベル）

SC-01-01, SC-01-03, SC-01-04, SC-01-05, SC-01-06 — API-PTY-004..007 を呼び出します。業務挙動は SPEC-PTY_PERMIT_LIFECYCLE-001 / 004 で仕様化済みです。
