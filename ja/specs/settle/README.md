# settle — 日次締め、修正申請 + 決裁

モジュール `settle`（ARCHITECTURE §2）: 標準チェックリスト 12 項目（ADR-005 §2.5）の後に業務日をロックする。例外の出口として「端末回収不能」があり、また 決裁 / 却下 による修正申請は REVERSE / DELTA を生成する（ADR-004）。ロック済みの日を再度開く機能はない。内部の決裁は「決裁」と記し、売買参加者の承認とは区別する（L4-D03）。

モジュールの 日次精算 / IF-ACC-01 / SC-07-01 の部分は P3 の対象外（一覧レベルの画面）。

## 機能の文書

| ID | 名称 | 種別 | 様式 | Version | File |
|---|---|---|---|---|---|
| SPEC-SC-07-02-001 | SC-07-02 日次締め | 画面仕様書 | BM-2-901-51 | 0.1.0 | [screen-specification/SC-07-02_SPEC.md](screen-specification/SC-07-02_SPEC.md) |
| SPEC-SC-08-03-001 | SC-08-03 修正申請決裁・却下 | 画面仕様書 | BM-2-901-51 | 0.1.0 | [screen-specification/SC-08-03_SPEC.md](screen-specification/SC-08-03_SPEC.md) |
| SPEC-SETTLE_FUNC-001 | モジュール settle の機能仕様書 | 機能仕様書 | BM-2-901-54 | 0.1.0 | [function-specifications/SETTLE_FUNC.md](function-specifications/SETTLE_FUNC.md) |
| SPEC-STL_DAY_CLOSE-001 | 日次締め — チェックリスト、ロック、翌日の開始 | 技術設計 | BM-2-901-53 | 0.1.0 | [technical-design/STL_DAY_CLOSE_TECH.md](technical-design/STL_DAY_CLOSE_TECH.md) |
| SPEC-STL_DEVICE_LOST-001 | 端末回収不能 | 技術設計 | BM-2-901-53 | 0.1.0 | [technical-design/STL_DEVICE_LOST_TECH.md](technical-design/STL_DEVICE_LOST_TECH.md) |
| SPEC-STL_CORRECTION_DECIDE-001 | 修正申請 決裁 + REVERSE / DELTA の生成 | 技術設計 | BM-2-901-53 | 0.1.0 | [technical-design/STL_CORRECTION_DECIDE_TECH.md](technical-design/STL_CORRECTION_DECIDE_TECH.md) |

## system-design への参照

- API設計: [`../system-design/api-design/settle/`](../../../specs/system-design/api-design/settle) — API-STL-001..005
- DB設計: [`CLOSE_DB.md`](../system-design/database-design/CLOSE_DB.md) 4.20, 4.24; [`ADJUST_DB.md`](../system-design/database-design/ADJUST_DB.md) 4.32, 4.37–4.39; [`IAM_AUDIT_DB.md`](../system-design/database-design/IAM_AUDIT_DB.md) 4.6, 4.55
- ワイヤーフレーム元: SC-07-02 0.2.0, SC-08-03 0.2.1 の [`wireframes/`](../../../wireframes)

## 他モジュールへの依存

- `iam`: 目的（`purpose`）ごとに一回限り有効な MFA トークン（★ 日次締め、端末回収不能） — 提案 `POST /api/v1/auth/mfa/verify`。
- `lot`: `fn_lot_carry_over`（ロック時の持ち越し）; `trade` / `lot` / `delivery`: `LATE_ENTRY` 記録を書き込む関数。
- `incentive`: 期ロックのエンジンは、決裁済み（`APPROVED`）の修正申請 `KANNO` / `INCENTIVE` を読み取る。
- `party`: 日を開く際の `expireDueQualifications`。
