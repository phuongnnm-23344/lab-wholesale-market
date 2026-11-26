# delivery — 複数回の引渡し、例外、争い

モジュール `delivery`（ARCHITECTURE §2）: 埠頭でタブレットによる引渡しの記録（通信断でも使用可 — ADR-008）、引渡しの例外（不足 / 過剰 / 返品 / 一部取消 / 争いあり、紙の確認票の後入力を含む）、そして**配送部門責任者による争いのある引渡しの確認** — CAP-HUMAN-01 の最終決裁点（ルール3）。

## この機能の文書

| ID | 名称 | 種別 | 様式 | Version | File |
|---|---|---|---|---|---|
| SPEC-SC-06-02-001 | SC-06-02 引渡し記録（タブレット） | Screen Specification | BM-2-901-51 | 0.1.0 | [screen-specification/SC-06-02_SPEC.md](screen-specification/SC-06-02_SPEC.md) |
| SPEC-SC-06-04-001 | SC-06-04 引渡し例外登録 | Screen Specification | BM-2-901-51 | 0.1.0 | [screen-specification/SC-06-04_SPEC.md](screen-specification/SC-06-04_SPEC.md) |
| SPEC-SC-06-05-001 | SC-06-05 争いのある引渡し完了確認 | Screen Specification | BM-2-901-51 | 0.1.0 | [screen-specification/SC-06-05_SPEC.md](screen-specification/SC-06-05_SPEC.md) |
| SPEC-DELIVERY_FUNC-001 | 機能仕様 — モジュール delivery | Function Specifications | BM-2-901-54 | 0.1.0 | [function-specifications/DELIVERY_FUNC.md](function-specifications/DELIVERY_FUNC.md) |
| SPEC-DEL_RECORD-001 | 複数回の引渡し記録 + オフライン冪等同期 | Technical Design | BM-2-901-53 | 0.1.0 | [technical-design/DEL_RECORD_TECH.md](technical-design/DEL_RECORD_TECH.md) |
| SPEC-DEL_EXCEPTION_DISPUTE-001 | 例外 + 争いの確認 | Technical Design | BM-2-901-53 | 0.1.0 | [technical-design/DEL_EXCEPTION_DISPUTE_TECH.md](technical-design/DEL_EXCEPTION_DISPUTE_TECH.md) |

## システム設計へのリンク

- API設計: [`../system-design/api-design/delivery/`](../../../specs/system-design/api-design/delivery) — API-DEL-001..006
- データベース設計: [`TRADE_DB.md`](../system-design/database-design/TRADE_DB.md) 4.34–4.36; [`ADJUST_DB.md`](../system-design/database-design/ADJUST_DB.md) 4.32, 4.39; [`IAM_AUDIT_DB.md`](../system-design/database-design/IAM_AUDIT_DB.md) 4.6, 4.54, 4.55
- 元のワイヤーフレーム: SC-06-02 0.2.0, SC-06-04 0.2.0, SC-06-05 0.2.0 — [`wireframes/`](../../../wireframes)

## 他モジュールへの依存（P3 ではまだ仕様なし）

- `sync`: オフラインキューの同期 API — `fn_delivery_record` を再度呼び出す（DEL_RECORD §5）。
- 共通添付（`attachments`）: 紙の確認票のスキャンをアップロード／ダウンロード。
- `iam`: 社員番号でアカウントを照会（SC-06-04 [5]）。
