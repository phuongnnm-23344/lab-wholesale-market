# Database Design — 索引表

**10 文書**

ファイル名は `{DB_ID}_DB.md`、`{screen-or-feature}/` の下に置く。2つ以上の feature で使う場合は、このフォルダー直下に置く。ひな型 [`specs/_templates/BM-2-901-50-database-design-template.md`](../../../../specs/_templates/BM-2-901-50-database-design-template.md) に従って書く。行の追加・修正・削除は、ファイルを作成する**同じ作業の中で**行い、version を上げるか、ファイルを削除する。Database Design 一式は ER クラスタ単位で分割している（Gate 1 M-09）: 共有するファイルはすべてフォルダー直下に置く; `MKT_DB.md` は総括ファイル（例外 #7、README §3）。

| ID | 資料名 | Feature | Version | Updated by | Updated | Link |
|---|---|---|---|---|---|---|
| SPEC-MKT_DB-001 | 総括ファイル — 原則、60テーブル一覧、全体 ERD、規約 + enum + ビュー、プロトタイプ LAB-2 との差異表（40行）、parity、未決事項 | — （共用、フォルダー直下） | 0.3.3 | phuongnnm-23344 | 2026-11-25 | [MKT_DB.md](MKT_DB.md) |
| SPEC-IAM_AUDIT_DB-001 | アカウント、ロール、決裁権限、端末 + 通知、添付、オフライン同期、監査ログ（13テーブル） | — （共用、フォルダー直下） | 0.3.0 | phuongnnm-23344 | 2026-11-25 | [IAM_AUDIT_DB.md](IAM_AUDIT_DB.md) |
| SPEC-PARTY_DB-001 | 参加者、許可（仲卸）≠ 承認（売買参加者）、待ち申請（9テーブル） | — （共用、フォルダー直下） | 0.3.2 | phuongnnm-23344 | 2026-11-25 | [PARTY_DB.md](PARTY_DB.md) |
| SPEC-RULE_DB-001 | バージョン付き規程 + コード / 税マスタ（7テーブル） | — （共用、フォルダー直下） | 0.2.2 | phuongnnm-23344 | 2026-11-25 | [RULE_DB.md](RULE_DB.md) |
| SPEC-CLOSE_DB-001 | 市場・銀行カレンダー、業務日ロック / 期ロック、カウンター（4テーブル） | — （共用、フォルダー直下） | 0.2.2 | phuongnnm-23344 | 2026-11-25 | [CLOSE_DB.md](CLOSE_DB.md) |
| SPEC-LOT_DB-001 | ロット / 受付 / 目利き / 数量台帳（4テーブル） | — （共用、フォルダー直下） | 0.2.2 | phuongnnm-23344 | 2026-11-25 | [LOT_DB.md](LOT_DB.md) |
| SPEC-TRADE_DB-001 | 相対 / せり / 伝票印刷 / 配送（7テーブル） | — （共用、フォルダー直下） | 0.2.2 | phuongnnm-23344 | 2026-11-25 | [TRADE_DB.md](TRADE_DB.md) |
| SPEC-ADJUST_DB-001 | 当日訂正、修正申請、REVERSE / DELTA（4テーブル） | — （共用、フォルダー直下） | 0.3.2 | phuongnnm-23344 | 2026-11-25 | [ADJUST_DB.md](ADJUST_DB.md) |
| SPEC-BILLING_DB-001 | 期のお支払額 / 入金 / 配分 / 会計連携バッチ（10テーブル） | — （共用、フォルダー直下） | 0.3.1 | phuongnnm-23344 | 2026-11-25 | [BILLING_DB.md](BILLING_DB.md) |
| SPEC-INCENTIVE_DB-001 | 完納奨励金 + テストベクター（2テーブル） | — （共用、フォルダー直下） | 0.3.3 | phuongnnm-23344 | 2026-11-26 | [INCENTIVE_DB.md](INCENTIVE_DB.md) |
