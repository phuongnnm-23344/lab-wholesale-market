# Architecture — 索引

**1 文書**（+ 10 件の ADR は [`adr/_index.md`](adr/_index.md)）

文書グループは **新規で、QC-01 には含まれない**（規格は 2026-09-10 に `architecture-overview` を QC-01 から削除した）。LAB-4 の要件に従って作成：システム構成、主要なデータフロー、連携ポイント。アーキテクチャの決定は [`adr/_index.md`](adr/_index.md) に別途記録する。

規格から引き継ぐ約束事：frontmatter `id/title/type/version/updated_by/updated/related`、History of change の表（SemVer）、適用しない項目は「N/A + 理由」と記載、画像は同じフォルダの `assets/` に置く（図は現在ファイル内の Mermaid で記述し、画像はまだない）。行の追加・修正・削除は、ファイルを作成するのと**同じ作業の中で**行い、版を上げるか、ファイルを削除する。

| ID | 資料名 | Feature | Version | Updated by | Updated | Link |
|---|---|---|---|---|---|---|
| ARCH-001 | Product A To-be アーキテクチャ（第1期） | システム全体 | 0.2.3 | phuongnnm-23344 | 2026-11-25 | [ARCHITECTURE.md](ARCHITECTURE.md) |
