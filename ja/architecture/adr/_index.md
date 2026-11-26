# ADR（Architecture Decision Record）— 索引

**10 文書**

文書グループは **新規で、QC-01 には含まれない**。ファイル名は `ADR-{3桁の番号}-{slug}.md`、番号は一度だけ採番し、再利用しない。各 ADR は、背景（RFP の ID / DEC- / PRM- / M- を併記）・決定・検討して捨てた選択肢と理由・結果・トレーサビリティを含む。確定した ADR は決定の内容を書き換えない。決定を変える場合は新しい ADR を書き、両方のファイルに「ADR-xxx を置き換える」と記載する。

状態：**Accepted** = 受講者が決定済み · **Proposed** = PL が提案、未確定。2026-11-26 に、受講者は Expert Gate 1（再確認後に RELEASE）、Gate 2（完了時に RELEASE）、Gate 3（差分の確認後に RELEASE）を通過した ADR を **Accepted** に変更した（PREMISE L4-D09 / DEC-059）。顧客の回答待ちの点は、各 ADR の **§6 顧客待ちの点** に残してある。回答は表の値や分岐だけを変え、方向性を変える場合は新しい ADR を書く。**ADR-006 は Proposed のまま**：§2.5 と案 F / G は、顧客の経営陣とのワークショップ E-14 に依存する。ADR-006 の残りの部分は LAB-5 向けの現行の設計。連携ポイント（会計 CSV、入金 CSV、メール、プリンター）は LAB-1 で確定済み（PRM / DEC）のため個別の ADR はない — [ARCHITECTURE.md §9](../ARCHITECTURE.md) を参照。

| ID | 資料名 | Feature | 状態 | Version | Updated by | Updated | Link |
|---|---|---|---|---|---|---|---|
| ADR-001 | To-be基盤 — AWS東京マネージド上のモジュラーモノリス | 基盤 | Accepted | 1.0.0 | phuongnnm-23344 | 2026-11-25 | [ADR-001-aws-tokyo-modular-monolith-platform.md](ADR-001-aws-tokyo-modular-monolith-platform.md) |
| ADR-002 | Supabase Auth に代わる認証 — サーバー側セッション、MFA step-up、共用端末の PIN | iam | Accepted | 1.0.0 | phuongnnm-23344 | 2026-11-26 | [ADR-002-authentication-mfa-step-up-shared-device-pin.md](ADR-002-authentication-mfa-step-up-shared-device-pin.md) |
| ADR-003 | 3層の権限、DB で検査 — 許可と承認は表もライフサイクルも分離 | iam, party | Accepted | 1.0.0 | phuongnnm-23344 | 2026-11-26 | [ADR-003-authorization-roles-authorities-kyoka-shonin-split.md](ADR-003-authorization-roles-authorities-kyoka-shonin-split.md) |
| ADR-004 | 追記のみの台帳、REVERSE / DELTA で修正 — 当日訂正 / 取消と修正申請で同じ仕組み | trade, settle | Accepted | 1.0.0 | phuongnnm-23344 | 2026-11-26 | [ADR-004-append-only-ledger-reverse-delta-corrections.md](ADR-004-append-only-ledger-reverse-delta-corrections.md) |
| ADR-005 | 業務日の時計、日次締め、期ロック — DB レベルでロックし、再開しない | calendar, settle | Accepted | 1.0.0 | phuongnnm-23344 | 2026-11-26 | [ADR-005-business-day-clock-day-close-period-lock.md](ADR-005-business-day-clock-day-close-period-lock.md) |
| ADR-006 | 発効日付きのバージョン管理された規則、メーカー・チェッカー、会計年度ごと4回の上限、E-14 の二つのブランチによるロールバック | rule | Proposed（§2.5、案 F / G は E-14 のワークショップ待ち） | 0.3.1 | phuongnnm-23344 | 2026-11-26 | [ADR-006-versioned-market-rules-maker-checker-e14-branches.md](ADR-006-versioned-market-rules-maker-checker-e14-branches.md) |
| ADR-007 | 完納奨励金のエンジン — 期ごとに決定的に計算、期ロックで凍結、後の期に DELTA | incentive | Accepted | 1.0.0 | phuongnnm-23344 | 2026-11-26 | [ADR-007-kanno-incentive-engine-period-batch-delta.md](ADR-007-kanno-incentive-engine-period-batch-delta.md) |
| ADR-008 | 岸壁での限定的なオフライン — PWA + 3操作のキュー、オフラインの PIN は端末に紐づく、紙の経路 | sync, delivery, lot | Accepted | 1.0.0 | phuongnnm-23344 | 2026-11-26 | [ADR-008-dock-offline-queue-pin-paper-fallback.md](ADR-008-dock-offline-queue-pin-paper-fallback.md) |
| ADR-009 | バックアップ / DR と7年保存 — PITR + Multi-AZ、大阪の複製、監査テーブルを会計年度ごとに分割 | 基盤, 監査 | Accepted | 1.0.0 | phuongnnm-23344 | 2026-11-26 | [ADR-009-backup-dr-seven-year-retention.md](ADR-009-backup-dr-seven-year-retention.md) |
| ADR-010 | スコープの境界 — Option は分離、最終決定は人、AI / OCR は使わない | 全システム | Accepted | 1.0.0 | phuongnnm-23344 | 2026-11-26 | [ADR-010-scope-boundary-options-human-in-the-loop-no-ai.md](ADR-010-scope-boundary-options-human-in-the-loop-no-ai.md) |
