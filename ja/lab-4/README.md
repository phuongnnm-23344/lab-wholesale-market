 > **LAB-2 プロトタイプ（Product A — 桜水産市場、模擬データ）:** 参照 [`prototype/README.md`](../../prototype/README.md).
> アプリ: https://lab-wholesale-market-fup2.vercel.app/ · デモ用アカウントとデモシナリオは上記READMEにあります（パスワードは別途連絡）。
> LAB-4 提出時の README です（全文はタグ `lab-4`）。LAB-5 の公開版では、下部にあった Sun* プロジェクト管理テンプレートの README（自作ではない部分）を削除しています。

# Product A — 桜水産市場: LAB-4 設計ドキュメント（ブランチ `ver/lab-4`）

本リポジトリには、Product A演習プロジェクト（水産卸売市場の運営支援システム、株式会社 桜水産市場向け — 顧客、数値、データはすべてフィクション）の次の2点を格納しています:

- **LAB-2プロトタイプ** が `prototype/` で実際に動作しています（LAB-4では変更しません）。
- **LAB-4設計一式**（要件、仕様、アーキテクチャ、ADR、ワイヤーフレーム）。社内標準 `spec-standards`（社内リポジトリ、非公開） — QC-01 *GitHub上のSpecフォルダ構成基準* (`0.32.1`) に従います。

読む順番は **`PREMISE.md` → `architecture/` → `wireframes/` → `specs/`** です。フォルダ構成のうち社内標準を継承した部分と新規作成した部分は **4節** を、AIの使い方は **`AI-report.md`** を参照してください。本設計一式はLAB-5でタスクに分解する際の入力になります。

## 1. ナビゲーション表

| グループ / ファイル | 内容 | Template | 継承 / 新規 | 作成者 | 索引表 |
|---|---|---|---|---|---|
| [`PREMISE.md`](PREMISE.md) | LAB-4の前提条件: LAB-1からの追加・削除、新しい前提、確定した方向性、プロトタイプと異なる箇所の扱い | 標準規約どおりのFrontmatter + History | **新規**（課題要件） | PL | — |
| [`requirements/`](../../requirements) | **WHAT** — 要件文書 `REQ-{ストーリー番号}-{slug}.md` | `BM-2-901-63` | 継承 | BrSE / PL | [`requirements/_index.md`](../requirements/_index.md) |
| [`specs/`](../../specs) | **HOW** — Screen Specification · Function Specifications · Technical Design を `specs/{feature}/` に、Database Design · API Design を `specs/system-design/` に、共通文書を `specs/_common/` に配置 | `BM-2-901-50` … `BM-2-901-54` | 継承 | PL (BrSE, Tech Lead, Dev) | [`specs/_index.md`](../specs/_index.md) |
| [`architecture/`](../../architecture) | to-beアーキテクチャ: システム構成要素、主要なデータフロー、連携ポイント | 標準には含まれない | **新規**（課題要件） | PL (Tech Lead) | [`architecture/_index.md`](../architecture/_index.md) |
| [`architecture/adr/`](../../architecture/adr) | ADR: 背景 · 決定 · 不採用案 · 影響 | 標準には含まれない | **新規**（課題要件） | PL (Tech Lead) | [`architecture/adr/_index.md`](../architecture/adr/_index.md) |
| [`wireframes/`](../../wireframes) | 画面一覧 / 画面遷移（第1期70画面）、中核10画面 + 補足5画面のto-beワイヤーフレーム。Screen Specificationは **12画面** に完全版（代表10画面 + デリバリーの連結2画面 — PREMISE L4-D07） | 標準には含まれない | **新規**（課題要件） | PL | [`wireframes/_index.md`](../wireframes/_index.md) |
| [`AI-report.md`](AI-report.md) | LAB-4におけるAIの使い方: スキル、プロンプト、レビュー方法、AIの誤りと修正方法、自己評価 | 標準規約どおりのFrontmatter + History | **新規**（課題要件） | PL | — |
| [`prototype/`](../../prototype) | LAB-2プロトタイプのコード (Next.js + Supabase)、デモ用README | — | LAB-2から存在 | PL | [`prototype/README.md`](../../prototype/README.md) |

リポジトリ直下のその他のフォルダ（`.github/`）はSun*のプロジェクト管理テンプレートの一部です（LAB-5 公開版では `scripts/` 内の `*.sh` 3本、`webhook/`、`wiki-template/`、`images/`、`.bot-test/`、`CHANGELOG.md` とテンプレートの README 部分を削除済み。LAB-4 提出時の全体はタグ `lab-4` を参照）。LAB-4設計一式のスクリプトは5節にあります。

## 2. QC-01に対するプロジェクトの取り決め

| QC-01 でプロジェクトが選ぶ点 | プロジェクトの選択 |
|---|---|
| バージョン・ブランチ名の形式（§2） | 講座の **マイルストーン / フェーズ** に従う: `ver/lab-4`、`ver/lab-5`、… — 製品版の形式とは混在させない |
| `specs/{screen-or-feature}/` の分け方（§2 注記） | **feature**（業務のまとまり、英語のkebab-case）単位。`architecture/ARCHITECTURE.md` §2 のモジュール名と一致させる。featureの一覧と、Screen Specificationを持つ12画面（代表10画面 + SC-06-04、SC-06-05 — PREMISE L4-D07）のfeatureは [`specs/_index.md`](../specs/_index.md) で確定済み（Gate 1 m-03） |
| Screen ID | LAB-1の画面ID（`SC-xx-yy`）を維持し、LAB-1の画面一覧とLAB-2プロトタイプまで追跡できるようにする。ファイル名は `SC-xx-yy_SPEC.md`。*§4の規則（`{接頭辞}_{名称}` を大文字）から逸脱 — §3参照* |
| `_templates/` の出典 | `spec-standards` の `main` ブランチ、コミット `72c1dda`（2026-11-05）。`_templates/` の2フォルダは同時にコピー（LAB-5 公開版では2フォルダとも削除済み。タグ `lab-4` を参照） |

## 3. QC-01からの意図的な例外

| # | QC-01 の規定 | プロジェクトの対応 | 理由 |
|---|---|---|---|
| 1 | §1: specは独立したManagement Repositoryに置き、**コードリポジトリには置かない** | Specを `prototype/` と同じリポジトリに置く | 演習上の理由: レビュアーがプロトタイプと設計を並べて見て、LAB-2の実データ表と照合できるように1リポジトリにまとめる。実プロジェクトでは2つのリポジトリに分け、READMEで相互参照する |
| 2 | §2: 標準のグループは `requirements/`、`specs/` のみ | `architecture/`、`wireframes/`、`ja/` と、ルートに `PREMISE.md`、`AI-report.md` を追加 | §1 では、READMEに行があれば同階層のグループを追加できる。LAB-4の課題がこれらのグループを要求している。`ja/` は正本のベトナム語版から生成した日本語版 — 規則は4.1節末尾の注記を参照 |
| 3 | §2: `main` から分岐した `ver/{名称}` で作業し、リリース時に `main` へマージ | `ver/lab-4` を `main`（LAB-2の `0a99d10`）から分岐し、LAB-4提出時に `main` へマージ | ブランチ規則どおり。ここでの「リリース」は提出時点を指す。**一点だけ異なる:** QC-01では `ver/{名称}` が `feature/spec-{slug}` / `cr/{slug}` からの変更を **PR経由** でのみ受け入れる。演習は一人で行うため、`ver/lab-4` へ直接コミットし、`feature/spec-*` とPRは作成しない。実プロジェクトではQC-01に従う |
| 4 | §4: Screen IDは `{接頭辞}_{名称}` 形式 | `SC-xx-yy` を維持 | LAB-1 → LAB-2 → LAB-4 → LAB-5のタスクまで1つのIDで追跡する |
| 5 | §2: 見本名 `sample-AUTH_DB.md`、`sample-AUTH_FUNC.md`、`sample-AUTH_LOGIN_TECH.md` | `spec-standards/03-specs/02-samples/` の実名を維持（`sample-AUTH_DATABASE.md`、`sample-AUTH_FUNCTIONS.md`、`sample-AUTH_LOGIN_DETAIL.md`） | 制約5: ひな形・見本はその場で修正しない。QC-01 §2 の構成と、標準リポジトリの実際の見本セットが食い違っている |
| 6 | 種類ごとにひな形は1つだけ | Screen Specificationは `sample-LOGIN_SPEC.md`（`BM-2-901-51` の見本）を使用。`BM-01-spec-template.md` と `sample-AD_LOGIN_SPEC.md` はコピーしない | プロジェクトはISOのひな形 `BM-2-901-51` を使う。BM-01は同じ用途の2つ目のひな形で、標準側でどちらを残すか未確定 |
| 7 | §4、§5 制約1: Database Design `{DB_ID}_DB.md` — **1ファイル1テーブル群** | Database Designは9ファイルに業務群ごとに分割（`IAM_AUDIT_DB.md`、`PARTY_DB.md`、`RULE_DB.md`、`CLOSE_DB.md`、`LOT_DB.md`、`TRADE_DB.md`、`ADJUST_DB.md`、`BILLING_DB.md`、`INCENTIVE_DB.md`）— 規定どおり。さらに **総括ファイル `MKT_DB.md` を追加**。テーブル群ではない: 共通原則、共通の規約とenum、全体ERD、公開ビュー、to-be ↔ プロトタイプの差異表、パリティ結果、未決事項。各群のテーブルは複数featureが使うため、すべて `database-design/` 直下に置く（制約3） | 共通の規約とenumは60テーブル全体に共通 — 9ファイルへ複写するとDRYに反し、ずれやすい。差異表 / パリティはスキーマ全体に対するLAB-4の要求で、特定の群に属さない。ファイル分割は受講者が確定（PREMISE L4-D04） |
| 8 | BM-2-901-50 §4: IndexとForeign Keyを表形式で記述 | Database DesignではIndex / Foreign Keyを **1行形式**（標準）または **ひな形どおりの表形式** で書く。両者は同じ情報（インデックス名、列、unique、partial条件、FK、`ON DELETE`）を含み、書き方の違いは **意味を持たない**。表形式の記述と1行形式の対応は `MKT_DB.md` §4.0 に記載 | 60テーブルのうち大半はPK + 1〜3件のFKのみ — 行数の多い表はファイルを長くするだけで情報を増やさない。規約より前に書かれたテーブルは表形式のまま残し、変換はしない（Gate 1 recheck n-07, D-03） |
| 9 | BM-2-901-51 §4.1: `ID` 列はアルファベットの節（`A`、`B`…）と項目 `1.0` 形式、参照は `A-2` 形式 | `ID` / `No` 列 = **to-beワイヤーフレームの項目番号**（`[1]`、`[2]`…）。`A/B/C` の文字は表示上のグループにすぎない。共通枠は `wireframes/_common-layout.md` の `C-xx` を使用 | ワイヤーフレームの単一の番号からSpecification → 注釈付き画像 → LAB-5のissueまで追跡する（Gate 1で顧客が番号単位で指摘済み）。ひな形どおりに番号を振り直すと、feedbackやADR内のすべての `[n]` 参照が壊れる |
| 10 | BM-2-901-51: 役割別の権限の項目がなく、§6 は一般的な注記のみ | **§4.4 役割別の権限** を追加（役割 × 項目の表: 表示 / 非表示 / 閲覧のみ / 操作）と §6.x の項目（状態、オフライン、未決事項）を追加。**12ファイルでの位置:** 役割別の権限は **§4.4**（SC-03-01、SC-03-05、SC-04-01、SC-05-02、SC-09-04、SC-10-04）または **§6.2**（SC-01-02、SC-06-02、SC-06-04、SC-06-05、SC-07-02、SC-08-03）。画面の状態は12ファイルすべて **§6.1**（集約表。枝ごとの詳細は §5 Event + `C-xx`）。権限の位置が2つあるのは、3つの流れが並行して書いたため。内容は同じ役割 × 項目の表で、LAB-5で §4.4 に統一できる | LAB-4の課題は「役割別の表示権限」と、画面ごとの状態（空、エラー、423、決裁待ち、オフライン）を必須としている。ひな形の項目はそのまま残し、項目だけ追加する |
| 11 | BM-2-901-51 §3: `_layout.png` はFigma / Draw.io / XDから出力 | Figmaは使わない。画像 `{SCREEN_ID}_annotated.png` は `wireframes/html/{SCREEN_ID}.html` の **バリアントA**（主画面）を `scripts/render-wireframes.py --spec` で描画（5節）。他のバリアント（ダイアログ、エラー、別の役割）は `wireframes/pdf/wireframes-all.pdf` / `wireframes/png/{SCREEN_ID}.png` にあり、Aの画像に出ないバッジはSPEC内の画像の下に列挙する。現状（as-is）の画像は `wireframes/assets/` に置く | 設計ファイルはまだない。ワイヤーフレームのHTMLが to-be の画像の唯一の出典 — HTMLから作るため、従来の方式（Markdownワイヤーフレーム + ブロック描画スクリプト）に代わる。1つのコマンドで再生成できるため、画像の番号は常に §4.1 の `No` / ID 列と一致する |
| 12 | BM-2-901-53 §2: シーケンス図は Draw.io / Figma / PlantUML で作成し、元ファイルへのリンクを付ける | **TECH ファイル内の Mermaid** で作成 — Mermaid ブロックが編集用の原本。画像 `assets/{DESIGN_ID}_sequence.png` は同じブロックから `scripts/export-mermaid-png.py` で出力（5節） | Draw.io / Figma のファイルはない。Mermaid は git で差分を確認でき、画像は同じブロックから生成するため、画像と §4 がずれない。ひな形も Mermaid を任意の併用形式として認めている |

見本ファイル内の相対リンク（`../01-templates/…`）は標準リポジトリの構成を指しているため、本リポジトリでは開けません — 制約5に従いそのまま残します。

## 4. 設計一式の構成、継承部分と新規作成部分

**標準の出典:** リポジトリ `spec-standards`（社内リポジトリ、非公開）、ブランチ `main`、コミット **`72c1dda`**（2026-11-05）— QC-01 `0.32.1`、ひな形は `03-specs/01-templates/`、見本は `03-specs/02-samples/`。再照合済み: `03-specs/` フォルダは `72c1dda` から `ae45211` まで **変更なし**。そのため、本リポジトリのひな形は提出時点でも最新版です。**LAB-5 公開版では `_templates/` の2フォルダを削除しました。** 4.1・4.2 の `_templates/` に関する行は LAB-4 提出版（タグ `lab-4`）の説明です。

### 4.1 提出用フォルダツリー（LAB-4の部分）

```
README.md                         bảng điều hướng (QC-01 §1) — file này
PREMISE.md                        tiền đề LAB-4: thêm / bỏ so với LAB-1, giả định, hướng đi đã chốt (L4-D01..D09)
AI-report.md                      cách dùng AI trong LAB-4
AI-report-evidence/               bằng chứng của AI-report: báo cáo Expert / Customer LAB-4, trích sổ feedback, trích nhật ký quyết định, brief, ghi chú gộp (README riêng)
requirements/
  _index.md                       bảng tra (0 tài liệu — REQ theo Story viết ở LAB-5)
  _templates/                     BM-2-901-63 + sample-REQ-2609-01
architecture/
  _index.md                       bảng tra (1 tài liệu)
  ARCHITECTURE.md                 kiến trúc to-be: module, luồng dữ liệu, điểm tích hợp, NFR
  adr/_index.md + ADR-001..010    10 quyết định kiến trúc (9 Accepted: ADR-001..005, 007..010 — điểm chờ khách ghi ở §6 Điểm mở từng ADR; ADR-006 Proposed — chờ workshop E-14; PREMISE L4-D09, lý do ở `adr/_index.md`)
wireframes/
  _index.md                       bảng tra (17 tài liệu)
  SCREEN-LIST.md                  画面一覧 / 画面遷移 — 70 màn 第1期
  _common-layout.md               khung màn + mục dùng chung C-1..C-31
  SC-xx-yy-*-wireframe.md (15)    mô tả + bảng Item có số (= cột ID của Screen Specification)
  html/SC-xx-yy.html (15)         nguồn hình duy nhất của mỗi màn (biến thể A, B, C…)
  html/_shared/                   CSS / JS chung (khung PC, khung tablet, 1 trang PDF / màn)
  png/SC-xx-yy.png (15)           ảnh mọi biến thể (sinh từ HTML)
  pdf/wireframes-all.pdf          15 trang, một trang / màn (sinh từ HTML)
  assets/                         14 ảnh as-is chụp prototype LAB-2
specs/
  _index.md                       bảng tra SPEC / FUNC / TECH + phụ thuộc chưa đặc tả DEP-01..17
  _templates/                     BM-2-901-50..54 + 5 bản mẫu (kế thừa nguyên)
  _common/                        log-convention · api-conventions · api-list · error-codes
  {feature}/README.md (7)         party · lot · trade · delivery · settle · incentive · rule
  {feature}/screen-specification/ SC-xx-yy_SPEC.md (12) + assets/{ID}_annotated.png
  {feature}/function-specifications/  {MODULE}_FUNC.md (7)
  {feature}/technical-design/     {DESIGN_ID}_TECH.md (15) + assets/{DESIGN_ID}_sequence.png
  system-design/database-design/  _index + MKT_DB (file tổng) + 9 file theo cụm — 60 bảng
  system-design/api-design/       _index + {feature}/API-xxx-nnn_API.md (42)
scripts/                          render-wireframes.py · export-mermaid-png.py · check-api-spec-consistency.py · check-markdown-links.py
ja/                               bản tiếng Nhật: cùng cây thư mục, sinh từ bản tiếng Việt (ghi chú dưới cây)
```

文書数: `specs/_index.md` の38件（4 `_common` + 12 Screen Specification + 7 Function Specifications + 15 Technical Design）· 10 Database Design · 42 API Design · アーキテクチャ1件 + ADR 10件 · ワイヤーフレーム / 画面一覧 17件 · PREMISE · AI-report.

**日本語版 `ja/`：** 初回は commit `9367490` 時点のベトナム語版から生成（パス・各ファイルの行数は同一）。**正本はベトナム語版：** ベトナム語版を修正したら、同じ commit で `ja/` の対応する行も修正する。翻訳にだけある誤りは `ja/` を直接修正し、ベトナム語版の版は変えない。すべてのコードブロック（Mermaid、ワイヤーフレームの ASCII、フォルダツリー、SQL、JSON の例）と PNG 画像（sequence、annotated）はベトナム語のまま。画像・HTML・PDF・`_templates/`・`AI-report-evidence/`・`prototype/` へのリンクは `ja/` 外の元ファイルを指す。リンク検査: `python scripts/check-markdown-links.py ja`。

### 4.2 spec-standardsからの継承と新規作成

| ファイル / フォルダ / テンプレート | 場所 | 分類 | 備考 |
|---|---|---|---|
| `BM-2-901-50-database-design-template.md` + `sample-AUTH_DATABASE.md` | `specs/_templates/` | **そのまま継承**（`72c1dda`） | その場で修正しない（制約5） |
| `BM-2-901-51-screen-specification-template.md` + `sample-LOGIN_SPEC.md` | `specs/_templates/` | **そのまま継承** | BM-01 と `sample-AD_LOGIN_SPEC.md` はコピーしない（例外 #6） |
| `BM-2-901-52-api-design-template.md` + `sample-AUTH_LOGIN_API.md` | `specs/_templates/` | **そのまま継承** | |
| `BM-2-901-53-technical-design-template.md` + `sample-AUTH_LOGIN_DETAIL.md` | `specs/_templates/` | **そのまま継承** | テンプレートリポジトリにある旧版 `BM-2-901-53-detail-design-template.md` を置き換え |
| `BM-2-901-54-function-specifications-template.md` + `sample-AUTH_FUNCTIONS.md` | `specs/_templates/` | **そのまま継承** | |
| `BM-2-901-63-requirement-document-template.md` + `sample-REQ-2609-01.md` | `requirements/_templates/` | **そのまま継承** | LAB-4では未使用（`requirements/_index.md` 参照） |
| QC-01 の構成: `requirements/`, `specs/{feature}/{screen-specification,function-specifications,technical-design}/`, `specs/system-design/{database-design,api-design}/`, 各フォルダの `_index.md`、資料の隣の `assets/`、frontmatter + History（SemVer）、"N/A + 理由" | リポジトリ全体 | **そのまま継承** | QC-01のうちプロジェクトが選ぶ点: §2 |
| `log-convention.md` | `specs/_common/` | **継承、追加あり** | 4節「プロジェクトへの適用」を追加 |
| 各 `_index.md` | 各フォルダ | **QC-01 §3の規定を継承**、内容は新規 | `architecture/`、`adr/`、`wireframes/` は新しいグループにも同じ形式の索引表を使用 |
| 7 `specs/{feature}/README.md` | `specs/{feature}/` | **QC-01 §3の規定を継承**、内容は新規 | featureのナビゲーションページ（設計文書ではないため `specs/_index.md` に行はない — QC-01どおり） |
| Screen Specification 12 file | `specs/{feature}/screen-specification/` | **ひな形に沿って作成、一部調整** | 例外 #9（ID列 = ワイヤーフレームの項目番号、`C-xx`）、#10（§4.4 または §6.2 に役割別の権限、§6.1 に画面の状態、§6.x にオフライン / 未決事項を追加 — ファイルごとの一覧は #10）、#11（画像 = ワイヤーフレームHTMLのバリアントA、Figmaではない） |
| Function Specifications 7 file, Technical Design 15 file | `specs/{feature}/` | **ひな形に沿って作成** | Technical Design: Mermaidを原本として残し、そこから PNG `{DESIGN_ID}_sequence.png` を生成（ひな形 §2 が画像を要求）— 例外 #12 |
| Database Design 10 file | `specs/system-design/database-design/` | **ひな形に沿って作成、一部調整** | 例外 #7（総括ファイル `MKT_DB.md` を追加）、#8（Index / FK は1行形式） |
| API Design 42 file | `specs/system-design/api-design/{feature}/` | **ひな形に沿って作成** | エラーbodyはプロトタイプに合わせ、ひな形の `errors[]` の例とは異なる — 理由は `api-conventions.md` の取り決め3 |
| Screen ID `SC-xx-yy`、Spec をコードのリポジトリに置く、ルートに追加したフォルダ群、実際のテンプレート名 | — | **QC-01の例外** #1–#5 | 各点の理由は3節 |
| `api-conventions.md`, `api-list.md`, `error-codes.md` | `specs/_common/` | **新規作成** | ひな形 BM-2-901-52 はこの3ファイルを参照しているが標準リポジトリにはまだない（ISS-36）。`E-CMN` 8件 + feature別147件 |
| `PREMISE.md` | ルート | **課題に沿って新規作成** | 標準規約どおりのFrontmatter + History |
| `architecture/ARCHITECTURE.md`, `architecture/adr/ADR-001..010` | `architecture/` | **課題に沿って新規作成** | 標準はQC-01から `architecture-overview` を削除済み（2026-09-10）; ADRは 背景 · 決定 · 不採用案 · 影響 · 追跡 の形式 |
| `wireframes/`（画面一覧、`_common-layout.md`、ワイヤーフレームMD 15件、`html/` + `_shared/`、`png/`、`pdf/wireframes-all.pdf`、`assets/`） | `wireframes/` | **課題に沿って新規作成** | 標準は `screen-map` を削除済み; HTMLのスタイルは受講者が提示したPDFの見本に倣う（別の課題のもの。スタイルのみ採用） |
| `render-wireframes.py`, `export-mermaid-png.py`, `check-api-spec-consistency.py` | `scripts/` | **新規作成** | 5節。同じフォルダの `*.sh` スクリプトはプロジェクト管理テンプレートのもの（LAB-5 公開版では削除済み） |
| `AI-report.md` | ルート | **課題に沿って新規作成** | |
| `AI-report-evidence/` | ルート | **新規作成** | AI-reportの数値の証跡の写し（有識者（Expert） G3-M02）; 各ファイルの出典は `AI-report-evidence/README.md`。このフォルダをLAB-4の提出物に含めるかは受講者が決定。LAB-5でリポジトリを公開する際に残すかどうかはLAB-5で決定 |

### 4.3 Screen Specificationの範囲: 70画面ではなく12画面

- **Screen Specificationを完全に持つ12画面**（項目、バリデーション、状態、役割別の権限、Event、API）: 10の業務群それぞれの代表10画面（PREMISE **L4-D02**: SC-01-02, 03-01, 03-05, 04-01, 05-02, 06-02, 07-02, 08-03, 09-04, 10-04）+ **SC-06-04、SC-06-05**。争いのある引渡しの確認は最終決定者が判断する事項（ルール3）であり、かつ2画面はdeliveryのFUNC / TECHを共有するため（**L4-D07**、DEC-056）。
- **なぜ画面一覧の70画面すべてを作らないのか:** LAB-4の課題は「中核となる画面」を求めており、画面数は規定していない。受講者は LAB-4 冒頭で10画面を確定し（plan §0、L4-D02）、2026-11-25 のGate 2後に **これ以上拡張しないことを決定**（PREMISE **L4-D08**、DEC-058。L4-D07 での12画面への拡張はPLが有識者 G2-m05 に従って決定）。SC-03-02、SC-03-07、SC-04-05 はワイヤーフレームがあるが、Screen Specificationはまだない。
- **残りの画面** は [`wireframes/SCREEN-LIST.md`](../wireframes/SCREEN-LIST.md) の1行のみ。12画面が呼び出すがまだ仕様化されていないものは [`specs/_index.md`](../specs/_index.md) の **DEP-01..17** に列挙（A. 直接呼び出し、B. 入力データの供給元。各行にテスト用のseed想定あり） — LAB-5でissueに分割するための入力。

## 5. 設計一式のスクリプト

### ワイヤーフレームHTMLの描画スクリプト（ワイヤーフレーム + Screen Specificationの注釈付き画像）

各画面には画像の **唯一の出典** `wireframes/html/{SCREEN_ID}.html` があります（バリアントA、B、C…。バリアントA = 主画面、バッジが最も多い）。共通のCSS / JSは `wireframes/html/_shared/` にあります（`wireframe.css` + `wireframe-tablet.css`: クラス一覧はファイル先頭のコメント; `build-app-frame.js`: PC枠 C-1..C-8; `fit-print-page-to-content.js`: PDFは1画面1ページ）。バッジ `<b class="n">3</b>` は Screen Specification の §4.1 のID / No 列と同じで、番号を振り直すことはしない。

| 作業 | コマンド（リポジトリのルートで実行） |
|---|---|
| 15画面をすべて描画 → `wireframes/pdf/wireframes-all.pdf`（1画面1ページ、画面コード順）+ `wireframes/png/{SCREEN_ID}.png` | `python scripts/render-wireframes.py` |
| 上記 + BM-51 の画像 `specs/{feature}/screen-specification/assets/{SCREEN_ID}_annotated.png` = **バリアントAのみ**（SPECがある12画面） | `python scripts/render-wireframes.py --spec` |
| 一部の画面（そのときPDFはこれらの画面のみを含む — コミット前に必ず全体を再実行すること） | `python scripts/render-wireframes.py SC-05-02 SC-03-05` |
| 画面一覧と対応するSPECを表示 | `python scripts/render-wireframes.py --list` |

- 依存: Python 3.10+、PyMuPDF（`pymupdf`）、Chromium系のブラウザ。プロジェクトのマシンでは PyMuPDF入りの既存venvを使用: `~/.claude/skills/.venv/Scripts/python.exe -I scripts/render-wireframes.py …`（グローバルに `pip install` はしない）。
- **ブラウザ: Microsoft Edgeを使用**（スクリプトはまずEdgeを探す。`CHROME_PATH` を設定可能）。Windowsでは puppeteer のキャッシュにある Chrome 148 / 154 が `--print-to-pdf` 時にハングする（スクリプトは60秒後にハングしたブラウザを無視する）。
- **描画コマンドは順番に実行し、並列では実行しない**: Edge headlessを同時に動かすとタイムアウトする。15画面 + 12枚のspec画像の全体で約2分かかる。
- spec画像用のバリアントA: スクリプトは `?variant=A` 付きでページを印刷し直す（JSはタイトルと最初の `.variant` 要素のみ残す）。そのため、spec画像とPDFは必ず同じHTMLから生成される。バリアントAにないバッジは各SPECの画像の下に記載する。
- クラスを新規追加する場合: `_shared/*.css` に書き、ファイル先頭のコメントの一覧も更新する。画面のHTMLに個別の `<style>` を置かない。

### Mermaid図の画像出力スクリプト（Technical Design）

ひな形 BM-2-901-53 §2 は画像 `./assets/{DESIGN_ID}_sequence.png` を要求している。`specs/{feature}/technical-design/{DESIGN_ID}_TECH.md` のMermaidブロックが編集用の原本で、PNG画像はそのブロックから生成するため二つがずれることはない。Mermaidを修正したらスクリプトを再実行する。

| 作業 | コマンド（リポジトリのルートで実行） |
|---|---|
| 15件のTECHをすべて出力 | `python scripts/export-mermaid-png.py` |
| 一部のTECHを出力 | `python scripts/export-mermaid-png.py TRADE_AITAI_CONFIRM RULE_VERSION` |
| Design IDと画像パスを表示 | `python scripts/export-mermaid-png.py --list` |

- 依存: Python 3.10+、Node.js（`npx`）。スクリプトは `@mermaid-js/mermaid-cli@11.4.2` を呼び出す（バージョン固定）、背景は白、スケール2。
- フォント: ラテン文字・ベトナム語はSegoe UI / Arial、その後に日本語用の Yu Gothic / Meiryo（Windows）、Hiragino（macOS）、Noto Sans CJK（Linux）。日本語フォントを先頭にすると、ベトナム語の結合分音記号付きの文字（ố、ữ…）が文字と記号に分かれてしまう。
- 命名: 1つ目のブロックは `{DESIGN_ID}_sequence.png`、n ≥ 2 番目のブロックは `{DESIGN_ID}_sequence-{n}.png`。構文エラーのブロックがあればスクリプトは `FAILED …` と出力して終了コード1で終わるが、他のブロックは出力される。

### API Designの検査スクリプト

`python scripts/check-api-spec-consistency.py`（ルートで実行。標準ライブラリのみ使用） — `specs/system-design/api-design/**` の42ファイルを走査: `<pre>` 内のJSON例が解析できること; `Note` 列のバッククォート内のトークンに、Database Design または FUNC / TECH にあるテーブル / 列 / 関数名以外の snake_case 名が残っていないこと; 旧キー `error_extra` が残っていないこと; `"detail": { "field": … }` 形式のエラー（フィールドのキーは元の `field` にあること）。エラーがあれば終了コード1。

### Markdown リンクの検査スクリプト

`python scripts/check-markdown-links.py [フォルダ / ファイル …]`（ルートで実行。標準ライブラリのみ使用）— `.md` ファイル内の相対リンクとアンカー `#…`（GitHub 方式のスラッグ。日本語の見出しにも対応）を検査する。引数なしの場合は `prototype/`・`wiki-template/`・`webhook/`・`_templates/` を除くリポジトリ全体を走査。コードブロックとインラインコード内のリンクは対象外。例: `python scripts/check-markdown-links.py ja`。リンク切れがあれば終了コード 1。

_Sun* プロジェクト管理テンプレートの README 部分（自作ではない）は LAB-5 公開版で削除しました。全文はタグ `lab-4` にあります。_
