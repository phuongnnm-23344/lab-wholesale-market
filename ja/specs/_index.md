# Specs — 索引

**38件の文書** を `{screen-or-feature}/` と `_common/` に格納（4 `_common` · 12 Screen Specification · 7 Function Specifications · 15 Technical Design）

本表は `{screen-or-feature}/` と `_common/` 内の Screen Specification（`SPEC`）、Function Specifications（`FUNC`）、Technical Design（`TECH`）を一覧にしたもの。Database Design と API Design は **ここに重複させない** — それぞれの索引で確認すること。行の追加・修正・削除は、ファイルの作成、版の更新、ファイルの削除と **同じ作業** で行う。`_templates/` 内のファイルは一覧に含めない。

| 種別 | 索引表 | 資料数 |
|---|---|---|
| Database Design | [system-design/database-design/_index.md](system-design/database-design/_index.md) | 10（9ファイル（業務群ごと）+ 総括ファイル `MKT_DB.md` — README §3 例外 #7） |
| API Design | [system-design/api-design/_index.md](system-design/api-design/_index.md) | 42（一覧: [_common/api-list.md](_common/api-list.md)） |

## feature の一覧（フォルダ `specs/{feature}/`）

Feature = [`architecture/ARCHITECTURE.md`](../architecture/ARCHITECTURE.md) の §2 のモジュール、名前は英語の kebab-case。フォルダは最初の文書ができたとき（P3）に作成する。Gate 1（m-03）で確定し、P3 と LAB-5 が同じ一覧でタスクに分けられるようにする。

| Feature（フォルダ） | モジュール / ドメイン | spec 完全版のある中核画面（L4-D02） | 関連する Database Design |
|---|---|---|---|
| `iam` | アカウント、役割、決裁権限、代行、PIN、MFA、端末 | — | `IAM_AUDIT_DB.md` |
| `party` | 参加者、**許可（仲卸）** / **承認（売買参加者）** | SC-01-02 | `PARTY_DB.md` |
| `lot` | 仮受付 → 本登録 → 目利き → 公開、ロットの SL 台帳 | SC-03-01, SC-03-05 | `LOT_DB.md` |
| `trade` | **相対（主要フロー）**、せり（副次）、当日訂正 / 取消、伝票の印刷 | SC-04-01, SC-05-02 | `TRADE_DB.md`, `ADJUST_DB.md` |
| `delivery` | 引渡しの複数回、例外、争い | SC-06-02, SC-06-04, SC-06-05 | `TRADE_DB.md` |
| `settle` | 日次精算、日次締め、修正申請 + 決裁、IF-ACC-01 | SC-07-02, SC-08-03 | `ADJUST_DB.md`, `BILLING_DB.md`, `CLOSE_DB.md` |
| `incentive` | 期、入金、割当、完納奨励金、期ロック | SC-09-04 | `INCENTIVE_DB.md`, `BILLING_DB.md`, `CLOSE_DB.md` |
| `rule` | 版管理された規則、メーカー・チェッカー、ロールバック、クォータ | SC-10-04 | `RULE_DB.md` |
| `calendar` | 市場・銀行カレンダー、業務日の開始 | — | `CLOSE_DB.md` |
| `notify` | アプリ内 + メール、印刷一覧 | — | `IAM_AUDIT_DB.md` |
| `report` | 固定の12レポート、CSV、伝票のPDF | — | (公開ビューを参照) |
| `audit` | 監査ログ | — | `IAM_AUDIT_DB.md` |
| `sync` | オフラインのキュー、SC-03-07 の照合 | — | `IAM_AUDIT_DB.md` |

## 文書

**文書ID**（frontmatter の `id`、`_templates/` の見本に従う）: Screen Specification `SPEC-{Screen ID}-{nnn}`（見本 `SPEC-LOGIN-002`）· Function Specifications `SPEC-{MODULE}_FUNC-{nnn}`（見本 `SPEC-AUTH_FUNC-001`）· Technical Design `SPEC-{design_id}-{nnn}` · API Design `SPEC-{接頭辞}_API-{nnn}`（見本 `SPEC-AUTH_API-001`）· Database Design `SPEC-{群}_DB-{nnn}` · `_common` の文書 `SPEC-{名称}-{nnn}`。`{nnn}` = 同じ元の文書の通し番号、`001` から始まる。

| ID | 資料名 | 種別 | Feature | Version | Updated by | Updated | Link |
|---|---|---|---|---|---|---|---|
| SPEC-API_CONV-001 | API 共通規約（Common Conventions · Status code · Appendix） | — (`_common`) | _common | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [_common/api-conventions.md](_common/api-conventions.md) |
| SPEC-API_LIST-001 | API 一覧（API List） | — (`_common`) | _common | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [_common/api-list.md](_common/api-list.md) |
| SPEC-ERROR_CODES-001 | エラーコード一覧（共通コード E-CMN + feature別の一覧） | — (`_common`) | _common | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [_common/error-codes.md](_common/error-codes.md) |
| SPEC-LOG-001 | ログの規約 | — (`_common`) | _common | 0.3.0 | phuongnnm-23344 | 2026-11-27 | [_common/log-convention.md](_common/log-convention.md) |
| SPEC-SC-01-02-001 | SC-01-02 参加者詳細・編集 — 許可（仲卸）/ 承認（売買参加者）の二つのブロック | SPEC | party | 0.1.3 | phuongnnm-23344 | 2026-11-26 | [party/screen-specification/SC-01-02_SPEC.md](party/screen-specification/SC-01-02_SPEC.md) |
| SPEC-PARTY_FUNC-001 | Function Specifications — モジュール party（参加者、許可 / 承認） | FUNC | party | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [party/function-specifications/PARTY_FUNC.md](party/function-specifications/PARTY_FUNC.md) |
| SPEC-PTY_APPROVAL_LIFECYCLE-001 | 承認（売買参加者） — 新規 / 延長 / 参加上限の変更（履歴あり） / 一時停止 / 自動失効 | TECH | party | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [party/technical-design/PTY_APPROVAL_LIFECYCLE_TECH.md](party/technical-design/PTY_APPROVAL_LIFECYCLE_TECH.md) |
| SPEC-PTY_PERMIT_LIFECYCLE-001 | 許可（仲卸） — 新規 / 延長 / 一時停止 / 再審査 / 自動失効 | TECH | party | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [party/technical-design/PTY_PERMIT_LIFECYCLE_TECH.md](party/technical-design/PTY_PERMIT_LIFECYCLE_TECH.md) |
| SPEC-SC-03-01-001 | SC-03-01 ロット本登録（受付台・PC） | SPEC | lot | 0.1.3 | phuongnnm-23344 | 2026-11-25 | [lot/screen-specification/SC-03-01_SPEC.md](lot/screen-specification/SC-03-01_SPEC.md) |
| SPEC-SC-03-05-001 | SC-03-05 目利き・下見結果入力 | SPEC | lot | 0.1.3 | phuongnnm-23344 | 2026-11-26 | [lot/screen-specification/SC-03-05_SPEC.md](lot/screen-specification/SC-03-05_SPEC.md) |
| SPEC-LOT_FUNC-001 | モジュール lot — Function Specifications | FUNC | lot | 0.1.2 | phuongnnm-23344 | 2026-11-26 | [lot/function-specifications/LOT_FUNC.md](lot/function-specifications/LOT_FUNC.md) |
| SPEC-LOT_INSPECTION_RECORD-001 | LOT_INSPECTION_RECORD — 目利き・下見結果の記録（最終決定者による） | TECH | lot | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [lot/technical-design/LOT_INSPECTION_RECORD_TECH.md](lot/technical-design/LOT_INSPECTION_RECORD_TECH.md) |
| SPEC-LOT_REGISTER-001 | LOT_REGISTER — ロットの本登録 + 受入の数量台帳の行 | TECH | lot | 0.1.3 | phuongnnm-23344 | 2026-11-26 | [lot/technical-design/LOT_REGISTER_TECH.md](lot/technical-design/LOT_REGISTER_TECH.md) |
| SPEC-SC-04-01-001 | SC-04-01 相対取引入力・確定 | SPEC | trade | 0.1.5 | phuongnnm-23344 | 2026-11-26 | [trade/screen-specification/SC-04-01_SPEC.md](trade/screen-specification/SC-04-01_SPEC.md) |
| SPEC-SC-05-02-001 | SC-05-02 せり結果確認 | SPEC | trade | 0.1.4 | phuongnnm-23344 | 2026-11-26 | [trade/screen-specification/SC-05-02_SPEC.md](trade/screen-specification/SC-05-02_SPEC.md) |
| SPEC-TRADE_FUNC-001 | モジュール trade — Function Specifications | FUNC | trade | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/function-specifications/TRADE_FUNC.md](trade/function-specifications/TRADE_FUNC.md) |
| SPEC-TRADE_AITAI_CONFIRM-001 | TRADE_AITAI_CONFIRM — 相対取引の確定（主要フロー）+ 状態 FIG-012 + ロットの SL の差引 | TECH | trade | 0.1.3 | phuongnnm-23344 | 2026-11-26 | [trade/technical-design/TRADE_AITAI_CONFIRM_TECH.md](trade/technical-design/TRADE_AITAI_CONFIRM_TECH.md) |
| SPEC-TRADE_QUALIFICATION_CHECK-001 | TRADE_QUALIFICATION_CHECK — 確定時点での 許可 / 承認 と参加上限の検査 | TECH | trade | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [trade/technical-design/TRADE_QUALIFICATION_CHECK_TECH.md](trade/technical-design/TRADE_QUALIFICATION_CHECK_TECH.md) |
| SPEC-TRADE_SAME_DAY_FIX-001 | TRADE_SAME_DAY_FIX — REVERSE / DELTA による当日訂正 / 取消（未締めの日） | TECH | trade | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [trade/technical-design/TRADE_SAME_DAY_FIX_TECH.md](trade/technical-design/TRADE_SAME_DAY_FIX_TECH.md) |
| SPEC-TRADE_SERI_CONFIRM-001 | TRADE_SERI_CONFIRM — せりセッションの結果確認（確定者）+ 差し戻し | TECH | trade | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [trade/technical-design/TRADE_SERI_CONFIRM_TECH.md](trade/technical-design/TRADE_SERI_CONFIRM_TECH.md) |
| SPEC-SC-06-02-001 | SC-06-02 引渡し記録（タブレット） | SPEC | delivery | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [delivery/screen-specification/SC-06-02_SPEC.md](delivery/screen-specification/SC-06-02_SPEC.md) |
| SPEC-SC-06-04-001 | SC-06-04 引渡し例外登録 | SPEC | delivery | 0.1.3 | phuongnnm-23344 | 2026-11-25 | [delivery/screen-specification/SC-06-04_SPEC.md](delivery/screen-specification/SC-06-04_SPEC.md) |
| SPEC-SC-06-05-001 | SC-06-05 争いのある引渡し完了確認 | SPEC | delivery | 0.1.3 | phuongnnm-23344 | 2026-11-25 | [delivery/screen-specification/SC-06-05_SPEC.md](delivery/screen-specification/SC-06-05_SPEC.md) |
| SPEC-DELIVERY_FUNC-001 | Function Specifications — モジュール delivery（引渡し、例外、争い） | FUNC | delivery | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [delivery/function-specifications/DELIVERY_FUNC.md](delivery/function-specifications/DELIVERY_FUNC.md) |
| SPEC-DEL_EXCEPTION_DISPUTE-001 | 引渡しの例外（紙の伝票の後入力を含む）+ 配送部門責任者による争いの確認 | TECH | delivery | 0.1.3 | phuongnnm-23344 | 2026-11-26 | [delivery/technical-design/DEL_EXCEPTION_DISPUTE_TECH.md](delivery/technical-design/DEL_EXCEPTION_DISPUTE_TECH.md) |
| SPEC-DEL_RECORD-001 | 引渡しの複数回の記録 + オフラインの冪等な同期 | TECH | delivery | 0.1.3 | phuongnnm-23344 | 2026-11-26 | [delivery/technical-design/DEL_RECORD_TECH.md](delivery/technical-design/DEL_RECORD_TECH.md) |
| SPEC-SC-07-02-001 | SC-07-02 日次締め | SPEC | settle | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [settle/screen-specification/SC-07-02_SPEC.md](settle/screen-specification/SC-07-02_SPEC.md) |
| SPEC-SC-08-03-001 | SC-08-03 修正申請決裁・却下 | SPEC | settle | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [settle/screen-specification/SC-08-03_SPEC.md](settle/screen-specification/SC-08-03_SPEC.md) |
| SPEC-SETTLE_FUNC-001 | Function Specifications — モジュール settle（日次締め、端末回収不能、修正申請の決裁） | FUNC | settle | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [settle/function-specifications/SETTLE_FUNC.md](settle/function-specifications/SETTLE_FUNC.md) |
| SPEC-STL_CORRECTION_DECIDE-001 | 修正申請 — 決裁 / 却下（1〜2段階）と REVERSE / DELTA の生成 | TECH | settle | 0.1.3 | phuongnnm-23344 | 2026-11-26 | [settle/technical-design/STL_CORRECTION_DECIDE_TECH.md](settle/technical-design/STL_CORRECTION_DECIDE_TECH.md) |
| SPEC-STL_DAY_CLOSE-001 | 日次締め — チェックリスト12項目、業務日のロック、次の日の開始 | TECH | settle | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [settle/technical-design/STL_DAY_CLOSE_TECH.md](settle/technical-design/STL_DAY_CLOSE_TECH.md) |
| SPEC-STL_DEVICE_LOST-001 | 端末回収不能 — 故障 / 紛失した端末を日次締めのチェックリストから除外 | TECH | settle | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [settle/technical-design/STL_DEVICE_LOST_TECH.md](settle/technical-design/STL_DEVICE_LOST_TECH.md) |
| SPEC-SC-09-04-001 | 奨励金計算・期ロック | SPEC | incentive | 0.1.3 | phuongnnm-23344 | 2026-11-25 | [incentive/screen-specification/SC-09-04_SPEC.md](incentive/screen-specification/SC-09-04_SPEC.md) |
| SPEC-INC_FUNC-001 | Function Specifications — モジュール incentive（期、入金の割当、完納奨励金、期ロック） | FUNC | incentive | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [incentive/function-specifications/INC_FUNC.md](incentive/function-specifications/INC_FUNC.md) |
| SPEC-INC_ENGINE-001 | Technical Design — 完納奨励金エンジン（試算 / 期ロック、DELTA、CARRY） | TECH | incentive | 0.1.3 | phuongnnm-23344 | 2026-11-26 | [incentive/technical-design/INC_ENGINE_TECH.md](incentive/technical-design/INC_ENGINE_TECH.md) |
| SPEC-SC-10-04-001 | 規則版確認・ロールバック（確認者の確認 / 差し戻し / 規則版の取消、ロールバックを含む） | SPEC | rule | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [rule/screen-specification/SC-10-04_SPEC.md](rule/screen-specification/SC-10-04_SPEC.md) |
| SPEC-RULE_FUNC-001 | Function Specifications — モジュール rule（規則の版、確認者、クォータ、ロールバック） | FUNC | rule | 0.1.1 | phuongnnm-23344 | 2026-11-25 | [rule/function-specifications/RULE_FUNC.md](rule/function-specifications/RULE_FUNC.md) |
| SPEC-RULE_VERSION-001 | Technical Design — 版管理された規則（メーカー・チェッカー、適用日、年TC 4回のクォータ、ロールバック、E-14 の分岐） | TECH | rule | 0.1.3 | phuongnnm-23344 | 2026-11-25 | [rule/technical-design/RULE_VERSION_TECH.md](rule/technical-design/RULE_VERSION_TECH.md) |

## 未仕様化の依存（12画面の外）

12画面が必要とする、**まだ spec のない** 画面 / API / ジョブ。LAB-5 は行ごとに issue を作成し、「必要とする画面」列の順にタスクを並べる: 種類 **B** の行がないと、中核画面は実際のデータがなく動作もテストできない — 待つ間は最後の列に記載した seed fixture を使う（DB に手入力はしない）。すべての行は **不足している部分** であり、新しい spec ではない: 基礎となる設計は「既存の設計」列にすでにある。Gate 2 G2-M04。

**A. 直接呼び出し** — 中核画面が実行時にこの API / 関数を呼ぶ。

| # | 依存 | Feature | 必要とする画面（中核画面） | 既存の設計 | 不足分 | spec / テストの暫定前提 |
|---|---|---|---|---|---|---|
| DEP-01 | MFA 認証API（`POST /api/v1/auth/mfa/verify`）— step-up + `purpose` ごとの一回限りのトークン | `iam` | C-30（SC-01-02、SC-06-05、SC-07-02、SC-08-03、SC-09-04、SC-10-04） | ADR-002 §2.2; [_common/api-conventions.md](_common/api-conventions.md) §4（`purpose` の一覧）; IAM_AUDIT_DB; SC-02-02（List） | API Design、Function Spec iam; 画面 SC-02-02 | 予約済みの `E-IAM`; テストは テスト用の鍵で署名した偽トークンを使用 |
| DEP-02 | 社員番号によるアカウント検索（`GET /api/v1/staff/lookup`） | `iam` | SC-03-05 [8]、SC-06-04 [5] | IAM_AUDIT_DB `staff` | API Design | `ACTIVE` のアカウントのみ; なければ呼び出し元の feature のエラー（`E-LOT-012`…） |
| DEP-03 | 添付の共通機能（証憑のアップロード / ダウンロード） | 添付の共通機能 | SC-06-04 [11]、SC-08-03 [6] | ADR-009; IAM_AUDIT_DB `attachments` | API Design、種類 / サイズの上限 | `attachmentId` を返す; 種類 / サイズ違いは仮に `E-DEL-029` |
| DEP-04 | オフライン同期キューの API + SC-03-07 の照合 | `sync` | SC-03-02（ロットの供給元 — DEP-07）、SC-06-02 | ADR-008; ワイヤーフレーム SC-03-07; IAM_AUDIT_DB `offline_sync_records` | API Design、Technical Design sync | `clientRecordId` は冪等（api-conventions §6）; 締め済みの日 → `HELD` |
| DEP-05 | 関数 `fn_lot_carry_over`（日次締め時のロットの持ち越し） | `lot` / `settle` | SC-07-02（STL_DAY_CLOSE_TECH）、SC-03-05（開いた日に目利きを記録し直す） | LOT_DB 4.25 / 4.26（`carried_to_date`）; ADR-005 §2.4 | 関数の Function Spec | 日次締めのトランザクション内で呼ぶ; ロットは状態を保ち、業務日が変わる |
| DEP-06 | 各モジュールの `LATE_ENTRY` レコードを書く関数（`fn_trade_late_entry`、`fn_lot_late_entry`、`fn_delivery_record` の late フラグ） | `trade` / `lot` / `delivery` | SC-08-03（STL_CORRECTION_DECIDE_TECH §4.4）、SC-09-04（取引の後入力 — `trades.incentive_period_id`） | ADR-005 §2.8; ADR-007 §2.3-7a; TRADE_DB 4.30 列 3a / 3b | 3関数の Function Spec | 決裁のトランザクション内で呼ぶ; 移動先モジュールが拒否 → 409 `E-STL-029` |

**B. 入力データの供給元** — 中核画面が読む、または決裁するデータを生成する画面 / ジョブ。

| # | 画面 / 機能 | Feature | 必要とする画面（中核画面） | 既存の設計 | 不足分 | LAB-5 テスト時の seed / 前提 |
|---|---|---|---|---|---|---|
| DEP-07 | SC-03-02 仮受付（バース用タブレット）: ロット `PROVISIONAL` を記録し、サーバーに上がったら正式な番号を発行; **仮受付の取消 → `CANCELLED`**、番号は保持（Q-LOT-01） | `lot` | SC-03-01（本登録待ちの仮受付一覧 — API-LOT-001; 仮番号で検索） | ワイヤーフレーム SC-03-02（L4-D05）; LOT_DB 4.25（`lot_status` `CANCELLED` — MKT_DB §4.0）; ADR-008 | 仮受付をオンラインで記録する API、仮受付の取消 API、Screen Spec SC-03-02 | 仮番号付きの `PROVISIONAL` ロットの seed; 出荷者は空欄（Q-SC0302-02）。欄 「いま荷揚げ中の船」 は **あると望ましい**（約0,3日、バッファが残る場合のみ） |
| DEP-08 | SC-10-01..03 規則版一覧 / 作成・編集 / 交付率テーブル編集（起票者が作成、編集、版 `PENDING` を送信） | `rule` | SC-10-04（`PENDING` の版がなければ 確認 する対象がない） | ADR-006 §2.1–2.3; RULE_DB 4.21–4.23; RULE_FUNC 2.2（クォータ）、2.5（差分）; SCREEN-LIST #44–46（List） | 版の作成 / 編集 / 送信 API（`DRAFT` → `PENDING`）、Screen Spec 3画面 | seed: v1 `BASELINE` + `CHANGE` / `ROLLBACK` の `PENDING` 版1件（RULE_VERSION_TECH §5.1） |
| DEP-09 | SC-08-01 修正申請の作成、**すべての** 範囲 `TRADE` / `KANNO` / `INCENTIVE` / `LATE_ENTRY`（FORM-CORR-01; 金額のプレビュー + 決裁の段階数を表示） | `settle` | SC-08-03（`PENDING` の申請が必要）; SC-09-04（`KANNO` / `INCENTIVE` からの DELTA）; SC-03-01、SC-04-01（C-24 の 「修正申請を作成 →」 ボタン） | ADR-005 §2.8; ADR-007 §2.4–2.5; ADJUST_DB 4.37–4.39; STL_CORRECTION_DECIDE_TECH（決裁側） | 修正申請を作成する API + 段階数の計算、Screen Spec SC-08-01、SC-08-02（一覧） | 4つの範囲すべての `PENDING` 申請の seed、2段階のしきい値の下と上に1件ずつ |
| DEP-10 | SC-05-01 せり結果入力（入力者が結果の行を `PENDING` で記録; **差し戻し後に買受人の数を修正**、履歴は旧 / 新の数を保持 — Q-TRD-05） | `trade` | SC-05-02（修正するには `PENDING` の行と差し戻された行が必要） | TRADE_DB 4.29 `seri_sessions`、4.30、4.31（`REJECT`）; TRADE_SERI_CONFIRM_TECH; prototype `0016` | 結果の行を記録 / 修正する API、Screen Spec SC-05-01 | 仲卸 / 売買参加者の行を持つセッションの seed、失効した買受人の行を1件 |
| DEP-11 | SC-09-01..03 入金CSVの取込（銀行の **入金日** を保存 — Q-INC-01）、取引先コード対応表、期別お支払額・入金状況（FIFO の割当） | `incentive` | SC-09-04（完納奨励金エンジンの **K2** ブロック: 入金 + 割当がなければ 完納 を判定できない; 欄 [17]「入金CSV取込済」 は最新の入金日を表示） | ADR-007 §2.7; BILLING_DB 4.45–4.48; INC_FUNC 2.3 `allocate_payment_fifo`; INC_ENGINE_TECH K2; SCREEN-LIST #39–41（List） | CSV 取込 API（形式は E-01 / E-02 待ち）、コード対応付けの API、Screen Spec 3画面 | **完納奨励金の項目に属する** — LAB-5 は K1–K9 と同じグループで別タスクに分ける。`payments` の seed は TV-01..15 の `paid_on` を持つ（INCENTIVE_DB §5） |
| DEP-12 | 市場・銀行カレンダー SC-10-05 + 業務日の開始（日を開く関数、予備の 01:00 ジョブ） + **月初の業務日を開くときに期を作成**（Q-INC-03, DEC-055） | `calendar` | 書き込みを行うすべての画面（業務日 `OPEN` が必要）; SC-07-02（次の日を開く、`E-STL-008`）; SC-09-04（期、銀行営業日による支払期日） | ADR-005 §2.2–2.4; CLOSE_DB 4.20、4.24、4.43; INC_ENGINE_TECH K8; SCREEN-LIST #48（List） | Function / Technical Design の calendar、API + Screen Spec SC-10-05 | 年間カレンダー + 業務日 `OPEN` + 当月の期の seed |
| DEP-13 | `notify` のワーカー outbox（メール + 通知枠 + 印刷一覧、再送は3回以内） | `notify` | SC-10-04（起票者への通知、経営層 N2 の分岐）、SC-08-03、SC-09-04（期の通知）、SC-01-02（期限切れ間近） | ARCHITECTURE（ワーカー outbox、メールの連携ポイント）; IAM_AUDIT_DB 4.53; L4-A08, PRM-126 | Technical Design のワーカー、文面の見本 | 中核の spec は transaction 内で outbox に書くだけ; テストは outbox の行を確認し、実際のメールは送らない |
| DEP-14 | SC-02-03 タブ 代行者指定（`delegations`） | `iam` | SC-08-03（照合部門長が不在の場合の1次決裁 → 事前指定の代行 — Q-STL-04）、SC-07-02（代わりに締める）、SC-09-04 | IAM_AUDIT_DB 4.3; PRM-129; SCREEN-LIST #12（SC-02-05 を統合） | API + Screen Spec | 有効な代行 STL_HEAD を1件 seed。実際の代行の人員: UAT の前に 経営陣 に確認 |
| DEP-15 | SC-01-03 / SC-01-04（許可、承認の登録 / 更新; 操作「参加上限の変更」は API-PTY-006 `LIMIT_CHANGE` を呼ぶ） | `party` | SC-01-02（二つのブロックから開く）; SC-04-01、SC-05-02（上限） | PTY_PERMIT_LIFECYCLE_TECH、PTY_APPROVAL_LIFECYCLE_TECH; API-PTY-004..007; PARTY_DB 4.14、4.15 | Screen Spec 2画面（API はあり） | 許可 / 承認 `VALID` + 失効間近の版を1件 seed |
| DEP-16 | 変更ログ付きの設定ファイル（PRM-126） — キー `PARTICIPATION_LIMIT_TAX_CODE`（Q-TRD-02）と、規則に属さない PREMISE §3.1 のパラメータ | 共通基盤 | SC-04-01、SC-05-02、SC-01-02（税込の上限）; SC-07-02、SC-09-04（MFA の無操作時間、SLA） | PREMISE §3.1; RULE_DB 4.19 `tax_rates` | 設定ファイルの読み書きと変更ログの仕組み（Technical Design） | 既定は軽減税率 8% — 経理部に確認 |
| DEP-17 | RPT-04 滞留引渡し・例外（SC-11-05）: **継続協議 で絞り込める**こと、各回の協議履歴を見られること（Q-DEL-07） | `report` | SC-06-05 のデータ | TRADE_DB 4.36 `dispute_confirmations.conclusion`（`CONTINUE_DISPUTE` が複数回） | レポートの Spec | `audit_logs` にしかない = 顧客の要求を **満たさない** |
| DEP-18 | 販売公開 / 販売終了: ロットを `INSPECTED` → `PUBLISHED` に変更し、販売を終了する（PRM-110）、画面 SC-03-03 / SC-03-04 — LAB-5 で追加（PREMISE L5-S04） | `lot` | SC-04-01（API-TRD-002、`fn_lot_lock_for_sale` は `PUBLISHED` のロットのみ受け付ける） | LOT_DB `lot_status`; LOT_FUNC 2.9 | Function Spec + API Design + Screen Spec SC-03-03 / 04（LAB-5 の設計 issue A-FG03-20） | SC-04-01 のテストではロットを `PUBLISHED` でシードする |
