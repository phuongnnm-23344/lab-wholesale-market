# API Design — 参照表

**42件のドキュメント**（party 7 · lot 6 · trade 8 · delivery 6 · settle 5 · incentive 4 · rule 6）— API ID と呼び出し画面別の一覧: [`_common/api-list.md`](../../_common/api-list.md)；共通ルール: [`_common/api-conventions.md`](../../_common/api-conventions.md)

ファイル名は `{API_ID}_API.md` とし、`{screen-or-feature}/` に置きます。2つ以上の feature で使う場合は、このフォルダ直下に置きます。テンプレート `specs/_templates/BM-2-901-52-api-design-template.md`（社内標準 spec-standards に準拠、非公開） に従って書きます。ファイルを作成するのと同じ作業の中で、行を追加・修正・削除し、version を上げ、またはファイルを削除してください。

| ID | 資料名 | Feature | Version | Updated by | Updated | Link |
|---|---|---|---|---|---|---|
| SPEC-PTY_API-001 | API-PTY-001 — 参加者詳細＋許可または承認ブロックの取得 | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-001_API.md](party/API-PTY-001_API.md) |
| SPEC-PTY_API-002 | API-PTY-002 — 参加者の基本情報の保存 | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-002_API.md](party/API-PTY-002_API.md) |
| SPEC-PTY_API-003 | API-PTY-003 — 保証金額の変更（履歴行を追加） | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-003_API.md](party/API-PTY-003_API.md) |
| SPEC-PTY_API-004 | API-PTY-004 — 許可（仲卸）の変更申請の作成 | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-004_API.md](party/API-PTY-004_API.md) |
| SPEC-PTY_API-005 | API-PTY-005 — 許可申請の起票 / 決裁・確認 / 却下 | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-005_API.md](party/API-PTY-005_API.md) |
| SPEC-PTY_API-006 | API-PTY-006 — 承認（売買参加者）の変更申請 / 参加上限の作成 | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-006_API.md](party/API-PTY-006_API.md) |
| SPEC-PTY_API-007 | API-PTY-007 — 承認申請の確認・決裁 / 却下 | `party` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/API-PTY-007_API.md](party/API-PTY-007_API.md) |
| SPEC-LOT_API-001 | API-LOT-001 — 本登録待ちの仮受付一覧 | `lot` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [lot/API-LOT-001_API.md](lot/API-LOT-001_API.md) |
| SPEC-LOT_API-002 | API-LOT-002 — ロットの本登録 | `lot` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [lot/API-LOT-002_API.md](lot/API-LOT-002_API.md) |
| SPEC-LOT_API-003 | API-LOT-003 — ロットの検索 / 一覧 | `lot` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [lot/API-LOT-003_API.md](lot/API-LOT-003_API.md) |
| SPEC-LOT_API-004 | API-LOT-004 — 目利き・下見結果の記録 | `lot` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [lot/API-LOT-004_API.md](lot/API-LOT-004_API.md) |
| SPEC-LOT_API-005 | API-LOT-005 — マスタから出荷者を検索 | `lot` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [lot/API-LOT-005_API.md](lot/API-LOT-005_API.md) |
| SPEC-LOT_API-006 | API-LOT-006 — ロットフォームの選択値（業務日, 受付開始時刻, 品目, 単位, 等級） | `lot` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [lot/API-LOT-006_API.md](lot/API-LOT-006_API.md) |
| SPEC-TRD_API-001 | API-TRD-001 — 許可 / 承認と参加上限を含む買受人の検索 | `trade` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-001_API.md](trade/API-TRD-001_API.md) |
| SPEC-TRD_API-002 | API-TRD-002 — 相対取引の確定（主要フロー） | `trade` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-002_API.md](trade/API-TRD-002_API.md) |
| SPEC-TRD_API-003 | API-TRD-003 — 取引一覧 | `trade` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-003_API.md](trade/API-TRD-003_API.md) |
| SPEC-TRD_API-004 | API-TRD-004 — 取引確認票の印刷（直接印刷 / 再印刷） | `trade` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-004_API.md](trade/API-TRD-004_API.md) |
| SPEC-TRD_API-005 | API-TRD-005 — 確認用のせり場の取得（各行の事前評価付き） | `trade` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-005_API.md](trade/API-TRD-005_API.md) |
| SPEC-TRD_API-006 | API-TRD-006 — せり場の結果の確認 | `trade` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-006_API.md](trade/API-TRD-006_API.md) |
| SPEC-TRD_API-007 | API-TRD-007 — せり結果の行を入力者へ差し戻し | `trade` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-007_API.md](trade/API-TRD-007_API.md) |
| SPEC-TRD_API-008 | API-TRD-008 — 当日の訂正 / 取引の取消（未締め日） | `trade` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [trade/API-TRD-008_API.md](trade/API-TRD-008_API.md) |
| SPEC-DEL_API-001 | API-DEL-001 — 買受人の引渡待ち取引一覧（または1件の取引） | `delivery` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/API-DEL-001_API.md](delivery/API-DEL-001_API.md) |
| SPEC-DEL_API-002 | API-DEL-002 — オフラインモード用の引渡データのスナップショット | `delivery` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/API-DEL-002_API.md](delivery/API-DEL-002_API.md) |
| SPEC-DEL_API-003 | API-DEL-003 — 引渡の記録（1件以上、冪等） | `delivery` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/API-DEL-003_API.md](delivery/API-DEL-003_API.md) |
| SPEC-DEL_API-004 | API-DEL-004 — 引渡の例外 / 紛争の記録（紙伝票の後入力を含む） | `delivery` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/API-DEL-004_API.md](delivery/API-DEL-004_API.md) |
| SPEC-DEL_API-005 | API-DEL-005 — 配送部門責任者の確認待ち紛争一覧 | `delivery` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/API-DEL-005_API.md](delivery/API-DEL-005_API.md) |
| SPEC-DEL_API-006 | API-DEL-006 — 配送部門責任者による紛争の確認 / 結論（MFA） | `delivery` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/API-DEL-006_API.md](delivery/API-DEL-006_API.md) |
| SPEC-STL_API-001 | API-STL-001 — 日次締めチェックリスト（ADR-005 §2.5 の標準12項目） | `settle` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [settle/API-STL-001_API.md](settle/API-STL-001_API.md) |
| SPEC-STL_API-002 | API-STL-002 — 業務日の締め（日次締め）— 再オープンの API はなし | `settle` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [settle/API-STL-002_API.md](settle/API-STL-002_API.md) |
| SPEC-STL_API-003 | API-STL-003 — 端末に「端末回収不能」の印を付ける | `settle` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [settle/API-STL-003_API.md](settle/API-STL-003_API.md) |
| SPEC-STL_API-004 | API-STL-004 — 修正申請の詳細 + 生成される記録のプレビュー | `settle` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [settle/API-STL-004_API.md](settle/API-STL-004_API.md) |
| SPEC-STL_API-005 | API-STL-005 — 修正申請の決裁 / 却下（第1級 / 第2級）— REVERSE / DELTA を反映 | `settle` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [settle/API-STL-005_API.md](settle/API-STL-005_API.md) |
| SPEC-INC_API-001 | API-INC-001 — 期ロック画面（期の読み込み、入金の配分、警告） | `incentive` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [incentive/API-INC-001_API.md](incentive/API-INC-001_API.md) |
| SPEC-INC_API-002 | API-INC-002 — 完納奨励金の試算（結果は書き込まず、監査ログに記録） | `incentive` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [incentive/API-INC-002_API.md](incentive/API-INC-002_API.md) |
| SPEC-INC_API-003 | API-INC-003 — 期ロック（正式計算 + 1トランザクションでの凍結） | `incentive` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [incentive/API-INC-003_API.md](incentive/API-INC-003_API.md) |
| SPEC-INC_API-004 | API-INC-004 — 締め済みの期の完納奨励金の正式結果 | `incentive` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [incentive/API-INC-004_API.md](incentive/API-INC-004_API.md) |
| SPEC-RULE_API-001 | API-RULE-001 — 規則版確認画面のデータ（版, 比較, quota, 例, E-14 ポリシー） | `rule` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [rule/API-RULE-001_API.md](rule/API-RULE-001_API.md) |
| SPEC-RULE_API-002 | API-RULE-002 — 規則版の確認者による確認（→ 発効待ち、または N2 分岐では決裁待ち） | `rule` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [rule/API-RULE-002_API.md](rule/API-RULE-002_API.md) |
| SPEC-RULE_API-003 | API-RULE-003 — 4回に達した後の運用部門長による決裁ロールバック（E-14 の N2 分岐のみ） | `rule` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [rule/API-RULE-003_API.md](rule/API-RULE-003_API.md) |
| SPEC-RULE_API-004 | API-RULE-004 — 確認者による規則版の差し戻し（→ 下書き） | `rule` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [rule/API-RULE-004_API.md](rule/API-RULE-004_API.md) |
| SPEC-RULE_API-005 | API-RULE-005 — 発効日前の規則版の取消（quota に算入しない） | `rule` | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [rule/API-RULE-005_API.md](rule/API-RULE-005_API.md) |
| SPEC-RULE_API-006 | API-RULE-006 — 作成者による発効待ち版の取消申請（マーカー・チェッカー取消の第1段階） | `rule` | 0.1.0 | phuongnnm-23344 | 2026-11-25 | [rule/API-RULE-006_API.md](rule/API-RULE-006_API.md) |
