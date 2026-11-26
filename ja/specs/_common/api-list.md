---
id: SPEC-API_LIST-001
title: API 一覧（API List）
type: system
subtype: api-list
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
design_id: API_LIST
feature: _common
related: ["SPEC-API_CONV-001", "SPEC-ERROR_CODES-001", "BM-2-901-52"]
---

# API 一覧

> 様式 **BM-2-901-52** の sheet `API List` に対応する。`API ID` は **先にここで** 採番してから API Design のファイルを開く（ひな形 BM-2-901-52、手順2）。URL、エラー body、MFA の規約: [`api-conventions.md`](api-conventions.md)。各ファイルの version の一覧: [`system-design/api-design/_index.md`](../system-design/api-design/_index.md).

---

## 1. 改訂履歴

| No. | Version | Action | 変更 | 更新日 | 更新者 | 備考 |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | P3 統合時の初版: 中核10画面の 42 API（7 feature）、`/api/v1` に統一; 提案済みだがまだ仕様化されていない API は 4節 | 2026-11-25 | phuongnnm-23344 | LAB-4 P3 |
| 2 | 0.1.1 | Update | Gate 2 G2-M04: 4節に入力データの供給元の API を提案として追加（DEP-07..14）、「12画面の外」; Q-STL-02: API-STL-001 はチェックリスト12項目 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. ID の採番ルール

- `API-{接頭辞}-{nnn}` — 接頭辞は feature のエラーコードの接頭辞と同じ（[`error-codes.md`](error-codes.md) の §4）: `PTY`、`LOT`、`TRD`、`DEL`、`STL`、`INC`、`RULE`。番号は昇順、再利用しない。
- ファイル: `specs/system-design/api-design/{feature}/{API ID}_API.md`; frontmatter の文書ID は `SPEC-{接頭辞}_API-{nnn}`（見本 `sample-AUTH_LOGIN_API.md` に従う: `SPEC-AUTH_API-001`）。
- 二つ以上の feature が使う API も、データを所有する feature に置く; 呼び出す画面は「呼出元画面」列にすべて列挙する。例: `API-LOT-005`（出荷者の検索 — マスターは `rule` / RULE_DB に属する）は、現時点でロットの画面のみが呼ぶため `lot` に置く; 他の feature が必要になった場合は `api-design/` 直下に移し、ID は変えない。

---

## 3. 一覧（42 API）

| Feature | API 数 |
|---|---|
| `party` | 7 |
| `lot` | 6 |
| `trade` | 8 |
| `delivery` | 6 |
| `settle` | 5 |
| `incentive` | 4 |
| `rule` | 6 |

| API ID | Method | Endpoint | 名称 | Feature | 呼出元画面 | API Design |
|---|---|---|---|---|---|---|
| API-PTY-001 | `GET` | `/api/v1/participants/{participantId}` | 参加者の詳細 + 許可 または 承認 のブロックを取得 | `party` | SC-01-02 | [API-PTY-001_API.md](../system-design/api-design/party/API-PTY-001_API.md) |
| API-PTY-002 | `PUT` | `/api/v1/participants/{participantId}` | 参加者の基本情報を保存 | `party` | SC-01-02 | [API-PTY-002_API.md](../system-design/api-design/party/API-PTY-002_API.md) |
| API-PTY-003 | `POST` | `/api/v1/participants/{participantId}/deposits` | 保証金額を変更（履歴の行を追加） | `party` | SC-01-02 | [API-PTY-003_API.md](../system-design/api-design/party/API-PTY-003_API.md) |
| API-PTY-004 | `POST` | `/api/v1/participants/{participantId}/permit-requests` | 許可（仲卸）の変更申請を作成 | `party` | SC-01-03, SC-01-05 | [API-PTY-004_API.md](../system-design/api-design/party/API-PTY-004_API.md) |
| API-PTY-005 | `POST` | `/api/v1/permit-requests/{requestId}/transitions` | 許可の申請の起案 / 決裁・確認 / 却下 | `party` | SC-01-03, SC-01-05 | [API-PTY-005_API.md](../system-design/api-design/party/API-PTY-005_API.md) |
| API-PTY-006 | `POST` | `/api/v1/participants/{participantId}/approval-requests` | 承認（売買参加者） / 参加上限の変更申請を作成 | `party` | SC-01-04, SC-01-05 | [API-PTY-006_API.md](../system-design/api-design/party/API-PTY-006_API.md) |
| API-PTY-007 | `POST` | `/api/v1/approval-requests/{requestId}/transitions` | 承認の申請の確認・決裁 / 却下 | `party` | SC-01-04, SC-01-05 | [API-PTY-007_API.md](../system-design/api-design/party/API-PTY-007_API.md) |
| API-LOT-001 | `GET` | `/api/v1/lots/provisional` | 本登録待ちの仮受付一覧 | `lot` | SC-03-01 | [API-LOT-001_API.md](../system-design/api-design/lot/API-LOT-001_API.md) |
| API-LOT-002 | `POST` | `/api/v1/lots` | ロットの本登録 | `lot` | SC-03-01 | [API-LOT-002_API.md](../system-design/api-design/lot/API-LOT-002_API.md) |
| API-LOT-003 | `GET` | `/api/v1/lots` | ロットの検索 / 一覧 | `lot` | SC-03-01, SC-03-05, SC-04-01, SC-03-03 | [API-LOT-003_API.md](../system-design/api-design/lot/API-LOT-003_API.md) |
| API-LOT-004 | `POST` | `/api/v1/lots/inspections` | 目利き・下見結果を記録 | `lot` | SC-03-05 | [API-LOT-004_API.md](../system-design/api-design/lot/API-LOT-004_API.md) |
| API-LOT-005 | `GET` | `/api/v1/master/shippers` | マスターから出荷者を検索 | `lot` | SC-03-01, SC-03-05 | [API-LOT-005_API.md](../system-design/api-design/lot/API-LOT-005_API.md) |
| API-LOT-006 | `GET` | `/api/v1/lots/form-options` | ロットのフォームの選択肢（業務日、受付時刻、品目、単位、等級） | `lot` | SC-03-01, SC-03-05 | [API-LOT-006_API.md](../system-design/api-design/lot/API-LOT-006_API.md) |
| API-TRD-001 | `GET` | `/api/v1/trades/buyers` | 買受人の検索（許可 / 承認 の資格と参加上限を含む） | `trade` | SC-04-01, SC-04-05 | [API-TRD-001_API.md](../system-design/api-design/trade/API-TRD-001_API.md) |
| API-TRD-002 | `POST` | `/api/v1/trades/aitai` | 相対取引の確定（主要フロー） | `trade` | SC-04-01 | [API-TRD-002_API.md](../system-design/api-design/trade/API-TRD-002_API.md) |
| API-TRD-003 | `GET` | `/api/v1/trades` | 取引の一覧 | `trade` | SC-04-01, SC-04-03 | [API-TRD-003_API.md](../system-design/api-design/trade/API-TRD-003_API.md) |
| API-TRD-004 | `POST` | `/api/v1/trades/{tradeId}/slip-prints` | 取引確認票を印刷（初回 / 再印刷） | `trade` | SC-04-01, SC-04-02, SC-04-05 | [API-TRD-004_API.md](../system-design/api-design/trade/API-TRD-004_API.md) |
| API-TRD-005 | `GET` | `/api/v1/seri-sessions/{sessionId}` | 確認用のせりセッションを取得（各行の事前評価を含む） | `trade` | SC-05-02 | [API-TRD-005_API.md](../system-design/api-design/trade/API-TRD-005_API.md) |
| API-TRD-006 | `POST` | `/api/v1/seri-sessions/{sessionId}/confirm` | せりセッションの結果を確認 | `trade` | SC-05-02 | [API-TRD-006_API.md](../system-design/api-design/trade/API-TRD-006_API.md) |
| API-TRD-007 | `POST` | `/api/v1/seri-sessions/{sessionId}/send-back` | せりの結果の行を入力者へ差し戻し | `trade` | SC-05-02 | [API-TRD-007_API.md](../system-design/api-design/trade/API-TRD-007_API.md) |
| API-TRD-008 | `POST` | `/api/v1/trades/{tradeId}/fixes` | 取引の当日訂正 / 取消（未締めの日） | `trade` | SC-04-05 | [API-TRD-008_API.md](../system-design/api-design/trade/API-TRD-008_API.md) |
| API-DEL-001 | `GET` | `/api/v1/deliveries/pending` | 買受人ごとの引渡し待ち取引の一覧（または1件） | `delivery` | SC-06-02, SC-06-04 | [API-DEL-001_API.md](../system-design/api-design/delivery/API-DEL-001_API.md) |
| API-DEL-002 | `GET` | `/api/v1/deliveries/offline-snapshot` | オフラインモード用の引渡しデータのスナップショット | `delivery` | SC-06-02 | [API-DEL-002_API.md](../system-design/api-design/delivery/API-DEL-002_API.md) |
| API-DEL-003 | `POST` | `/api/v1/deliveries` | 引渡しを1回以上記録（冪等） | `delivery` | SC-06-02 | [API-DEL-003_API.md](../system-design/api-design/delivery/API-DEL-003_API.md) |
| API-DEL-004 | `POST` | `/api/v1/delivery-exceptions` | 引渡しの例外 / 争いを記録（紙の伝票の後入力を含む） | `delivery` | SC-06-04 | [API-DEL-004_API.md](../system-design/api-design/delivery/API-DEL-004_API.md) |
| API-DEL-005 | `GET` | `/api/v1/delivery-exceptions/disputes` | 配送部門責任者の確認待ちの争い一覧 | `delivery` | SC-06-05 | [API-DEL-005_API.md](../system-design/api-design/delivery/API-DEL-005_API.md) |
| API-DEL-006 | `POST` | `/api/v1/delivery-exceptions/{exceptionId}/confirmation` | 配送部門責任者による争いの確認 / 結論（MFA） | `delivery` | SC-06-05 | [API-DEL-006_API.md](../system-design/api-design/delivery/API-DEL-006_API.md) |
| API-STL-001 | `GET` | `/api/v1/business-days/{businessDate}/close-checklist` | 日次締めのチェックリスト（ADR-005 §2.5 の標準12項目） | `settle` | SC-07-02 | [API-STL-001_API.md](../system-design/api-design/settle/API-STL-001_API.md) |
| API-STL-002 | `POST` | `/api/v1/business-days/{businessDate}/close` | 業務日を締める（日次締め）— 再オープンする API はない | `settle` | SC-07-02 | [API-STL-002_API.md](../system-design/api-design/settle/API-STL-002_API.md) |
| API-STL-003 | `POST` | `/api/v1/devices/{deviceId}/lost` | 端末に「端末回収不能」の印を付ける | `settle` | SC-07-02 | [API-STL-003_API.md](../system-design/api-design/settle/API-STL-003_API.md) |
| API-STL-004 | `GET` | `/api/v1/corrections/{correctionId}` | 修正申請の詳細 + 生成されるレコードのプレビュー | `settle` | SC-08-03 | [API-STL-004_API.md](../system-design/api-design/settle/API-STL-004_API.md) |
| API-STL-005 | `POST` | `/api/v1/corrections/{correctionId}/decisions` | 修正申請の決裁 / 却下（1次 / 2次）— REVERSE / DELTA に反映 | `settle` | SC-08-03 | [API-STL-005_API.md](../system-design/api-design/settle/API-STL-005_API.md) |
| API-INC-001 | `GET` | `/api/v1/periods/{periodId}/lock-view` | 期ロック画面（期の読み取り、入金の割当、警告） | `incentive` | SC-09-04 | [API-INC-001_API.md](../system-design/api-design/incentive/API-INC-001_API.md) |
| API-INC-002 | `POST` | `/api/v1/periods/{periodId}/incentive-previews` | 完納奨励金の試算（結果は書かない、監査ログに記録） | `incentive` | SC-09-04 | [API-INC-002_API.md](../system-design/api-design/incentive/API-INC-002_API.md) |
| API-INC-003 | `POST` | `/api/v1/periods/{periodId}/lock` | 期ロック（正式な計算 + 凍結を一つの transaction で） | `incentive` | SC-09-04 | [API-INC-003_API.md](../system-design/api-design/incentive/API-INC-003_API.md) |
| API-INC-004 | `GET` | `/api/v1/periods/{periodId}/incentive-results` | ロック済みの期の完納奨励金の正式な結果 | `incentive` | SC-09-04, SC-09-05 | [API-INC-004_API.md](../system-design/api-design/incentive/API-INC-004_API.md) |
| API-RULE-001 | `GET` | `/api/v1/rule-versions/{versionId}/review` | 規則版確認画面のデータ（版、比較、クォータ、例、E-14 の方針） | `rule` | SC-10-04 | [API-RULE-001_API.md](../system-design/api-design/rule/API-RULE-001_API.md) |
| API-RULE-002 | `POST` | `/api/v1/rule-versions/{versionId}/confirm` | 規則の版を確認者が確認（→ 発効待ち、または N2 の分岐では 決裁待ち） | `rule` | SC-10-04 | [API-RULE-002_API.md](../system-design/api-design/rule/API-RULE-002_API.md) |
| API-RULE-003 | `POST` | `/api/v1/rule-versions/{versionId}/second-approval` | 4回に達した後のロールバックを運用部門長が決裁（E-14 の N2 の分岐のみ） | `rule` | SC-10-04 | [API-RULE-003_API.md](../system-design/api-design/rule/API-RULE-003_API.md) |
| API-RULE-004 | `POST` | `/api/v1/rule-versions/{versionId}/return` | 規則の版を確認者が差し戻す（→ 下書き） | `rule` | SC-10-04 | [API-RULE-004_API.md](../system-design/api-design/rule/API-RULE-004_API.md) |
| API-RULE-005 | `POST` | `/api/v1/rule-versions/{versionId}/cancel` | 適用日の前に規則の版を取り消す（クォータに数えない） | `rule` | SC-10-04 | [API-RULE-005_API.md](../system-design/api-design/rule/API-RULE-005_API.md) |
| API-RULE-006 | `POST` | `/api/v1/rule-versions/{versionId}/cancel-request` | 起票者が 発効待ち の版の取消を申請（起票者・確認者による取消の手順1） | `rule` | SC-10-04, SC-10-01 | [API-RULE-006_API.md](../system-design/api-design/rule/API-RULE-006_API.md) |

---

## 4. 提案済みで未仕様化の API（12画面の外）

中核画面がすでに呼んでいる（DEP-01..06）、または入力データの供給元として必要（DEP-07..17）が、API Design はまだない — **ID はまだ採番していない**。LAB-5 で issue を作成する（[`specs/_index.md`](../_index.md) の「未仕様化の依存」の項を参照）。

| 提案 | Feature | 必要とする画面 / spec | 備考 |
|---|---|---|---|
| `POST /api/v1/auth/mfa/verify` | `iam` | SC-01-02、SC-06-05、SC-07-02、SC-08-03、SC-09-04、SC-10-04 の C-30 | 6桁のコードを認証 → step-up を更新; `purpose` があれば一回限りのトークンを返す（api-conventions §4） |
| `GET /api/v1/staff/lookup?employeeNo=` | `iam` | SC-03-05 [8], SC-06-04 [5] | 社員番号で氏名を検索、`ACTIVE` のアカウントのみ |
| `POST /api/v1/attachments`, `GET /api/v1/attachments/{attachmentId}` | 添付の共通機能 | SC-06-04 [11], SC-08-03 [6] | 証憑のアップロード / ダウンロード; 仮のエラーは `E-DEL-029` |
| オフライン同期キューの API | `sync` | SC-03-02, SC-06-02 (ADR-008) | SC-03-07 の照合; API-DEL-003 は delivery の書き込み口 |
| `POST /api/v1/lots/provisional`, `POST /api/v1/lots/{lotId}/cancel-provisional` | `lot` | SC-03-02 → SC-03-01 (DEP-07) | 仮受付をオンラインで記録し、サーバーに上がったら正式な番号を発行; 取消 → `CANCELLED`、番号は保持（Q-LOT-01） |
| `POST /api/v1/rule-versions`, `PUT /api/v1/rule-versions/{versionId}`, `POST …/{versionId}/submit` | `rule` | SC-10-01..03 → SC-10-04 (DEP-08) | 起票者が `DRAFT` を作成 / 編集し、`PENDING` を送信; 差し戻し後は修正して再送 |
| `POST /api/v1/corrections` | `settle` | SC-08-01 → SC-08-03 (DEP-09) | すべての範囲 `TRADE` / `KANNO` / `INCENTIVE` / `LATE_ENTRY`; しきい値に応じた決裁の段階数を返す |
| `POST /api/v1/seri-sessions/{sessionId}/results`, `PUT …/results/{tradeId}` | `trade` | SC-05-01 → SC-05-02 (DEP-10) | 結果の行を記録; 差し戻し後に買受人の数を修正（旧 / 新の数の履歴 — Q-TRD-05） |
| `POST /api/v1/payment-imports`, `GET/PUT /api/v1/partner-code-mappings` | `incentive` | SC-09-01..03 → SC-09-04 (DEP-11) | 入金CSVの取込。銀行の入金日を保存（Q-INC-01）; 取引先コードの対応付け; FIFO の割当（INC_FUNC 2.3） |
| `GET/PUT /api/v1/market-calendar`, `POST /api/v1/business-days/{businessDate}/open` (job) | `calendar` | SC-10-05; すべての書き込み画面 (DEP-12) | 業務日を開く、月初に期を作成（Q-INC-03、DEC-055） |
| `GET/POST /api/v1/delegations` | `iam` | SC-02-03 タブ 代行者 → SC-08-03、SC-07-02 (DEP-14) | 事前指定の代行（Q-STL-04） |
