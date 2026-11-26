# Wireframe — 索引

**17 文書**（1 画面一覧・画面遷移 · 1 共通枠 · 10 中核画面の wireframe · 5 補足画面の wireframe）+ 14 枚のプロトタイプ画像（`assets/`）

新しいグループの文書で、QC-01 には含まれません（規格で `screen-map` は削除済み）。画面一覧、画面遷移、項目番号付きの to-be wireframe を収録します。説明と項目表は Markdown ファイル、**図は `html/{SCREEN_ID}.html`**（`png/`、`pdf/` に出力）にあります。

- 中核 10 画面（L4-D02）：to-be wireframe はここ。項目番号は P3 で作成する Screen Specification BM-2-901-51 の No 列です（`specs/{feature}/screen-specification/`）。`assets/` 内の番号付き画像（`*_annotated.png`）は HTML のバリアント A であり、ここにはコピーしません。
- 補足 5 画面（SC-04-05, SC-06-04, SC-06-05, SC-03-07；SC-03-02 は L4-D05 により P3 で追加）：wireframe はここ。**SC-06-04, SC-06-05** は P3 で完全な Screen Specification に格上げ（PREMISE L4-D07, Gate 2 G2-m05）— 合計 12 の Screen Specification、3 画面は wireframe のままです。
- 第1期のその他の画面：`SCREEN-LIST.md` の行のみ。
- 項目番号 `C-`（枠、共通の状態）は `_common-layout.md` で 1 回だけ定義します。
- 画像 `assets/{SCREEN_ID}_prototype*.png`：LAB-2 の 2026-11-25 公開版のプロトタイプを撮影したもので、閲覧のみ、ダミーデータ「サンプル」。画像は **as-is** で、to-be wireframe が変わっても描き直しません（Gate 1 後の 0.2.0）。画像と説明が異なる場合は説明に従います。
- **HTML wireframe（LAB-4, 2026-11-25）：** 各画面に図のソース `html/{SCREEN_ID}.html`（共通の CSS/JS は `html/_shared/`）があり、`scripts/render-wireframes.py` により `png/{SCREEN_ID}.png`（全バリアント）と `pdf/wireframes-all.pdf`（15 ページ、画面コード順）を生成します。SPEC のある 12 画面は `--spec` で BM-51 画像 `specs/{feature}/screen-specification/assets/{SCREEN_ID}_annotated.png` を生成 = **バリアント A**。各 wireframe の MD は PNG を埋め込みます。ASCII ブロックは **0.2.x で凍結** — 素早い閲覧のみ用で、これ以上修正しません。食い違う場合は HTML + SPEC が正です（Expert W-m07、整理は LAB-5）。実行方法：README §5。
- 0.2.0 版（2026-11-25）：Expert Gate 1（`expert-review-lab4-gate1-261125.md`）と顧客の wireframe へのフィードバック（`customer-feedback-lab4-wireframes-261125.md`）に基づき修正。詳細は各ファイルの History を参照。

| ID | 資料名 | Feature | Version | Updated by | Updated | Link |
|---|---|---|---|---|---|---|
| WF-SCREEN-LIST-001 | 画面一覧・画面遷移 — 第1期 (70 画面) | システム全体 | 0.2.2 | phuongnnm-23344 | 2026-11-25 | [SCREEN-LIST.md](SCREEN-LIST.md) |
| WF-COMMON-001 | 画面の共通枠と状態 | システム全体 | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [_common-layout.md](_common-layout.md) |
| WF-SC-03-01 | ロット本登録（受付台・PC） | ロット | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [link](SC-03-01-lot-main-registration-wireframe.md) |
| WF-SC-03-05 | 目利き・下見結果入力 | ロット | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [link](SC-03-05-mekiki-inspection-result-entry-wireframe.md) |
| WF-SC-04-01 | 相対取引入力・確定 | 相対取引 | 0.2.2 | phuongnnm-23344 | 2026-11-25 | [link](SC-04-01-aitai-trade-entry-confirm-wireframe.md) |
| WF-SC-05-02 | せり結果確認 | せり | 0.2.4 | phuongnnm-23344 | 2026-11-25 | [link](SC-05-02-seri-result-session-confirm-wireframe.md) |
| WF-SC-06-02 | 引渡し記録（タブレット） | 引渡し | 0.2.3 | phuongnnm-23344 | 2026-11-25 | [link](SC-06-02-delivery-record-tablet-wireframe.md) |
| WF-SC-07-02 | 日次締め | 照合・締め | 0.2.4 | phuongnnm-23344 | 2026-11-25 | [link](SC-07-02-daily-close-business-day-lock-wireframe.md) |
| WF-SC-08-03 | 修正申請決裁・却下 | 修正申請 | 0.2.3 | phuongnnm-23344 | 2026-11-25 | [link](SC-08-03-correction-request-approve-reject-wireframe.md) |
| WF-SC-01-02 | 参加者詳細・編集（許可 / 承認） | 参加者 | 0.2.6 | phuongnnm-23344 | 2026-11-25 | [link](SC-01-02-participant-detail-kyoka-shonin-wireframe.md) |
| WF-SC-10-04 | 規則版確認・ロールバック | 規則版 | 0.2.3 | phuongnnm-23344 | 2026-11-25 | [link](SC-10-04-rule-version-approve-rollback-wireframe.md) |
| WF-SC-09-04 | 奨励金計算・期ロック | 完納奨励金 | 0.2.4 | phuongnnm-23344 | 2026-11-25 | [link](SC-09-04-incentive-calc-period-lock-wireframe.md) |
| WF-SC-04-05 | 当日訂正（＋取消）— 補足 | 相対取引 | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [link](SC-04-05-same-day-correction-cancel-wireframe.md) |
| WF-SC-06-04 | 引渡し例外登録 — 補足 | 引渡し | 0.2.3 | phuongnnm-23344 | 2026-11-25 | [link](SC-06-04-delivery-exception-registration-wireframe.md) |
| WF-SC-06-05 | 争いのある引渡し完了確認 — 補足 | 引渡し | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [link](SC-06-05-disputed-delivery-completion-confirm-wireframe.md) |
| WF-SC-03-07 | オフライン同期・照合 — 補足 | ロット / 引渡し | 0.2.1 | phuongnnm-23344 | 2026-11-25 | [link](SC-03-07-offline-sync-reconciliation-wireframe.md) |
| WF-SC-03-02 | ロット仮受付（埠頭・タブレット）— P3 で補足 (L4-D05) | ロット | 0.1.2 | phuongnnm-23344 | 2026-11-25 | [link](SC-03-02-lot-provisional-intake-dock-tablet-wireframe.md) |

## プロトタイプ画像（`assets/`）

| File | 画面 | 備考 |
|---|---|---|
| SC-01-02_prototype-nakaoroshi.png, SC-01-02_prototype-baibai.png | SC-01-02 | 仲卸 / 売買参加者 |
| SC-01-03_prototype-nakaoroshi-permits.png, SC-01-04_prototype-baibai-approvals.png | SC-01-03, SC-01-04 | 許可 / 承認 の画面 |
| SC-03-01_prototype.png, SC-03-05_prototype.png | SC-03-01, SC-03-05 | |
| SC-04-01_prototype.png | SC-04-01 | |
| SC-04-04_prototype-ref-for-SC-04-05.png | SC-04-04 | SC-04-05 への入口（この画面はプロトタイプにまだない） |
| SC-05-02_prototype-seri-list-ref.png | SC-05 list | デモ日にはせりセッションがない；セッション作成は書き込みを伴うため、確認画面は撮影していない |
| SC-06-02_prototype-tablet.png | SC-06-02 | タブレット枠 1024 × 1366 |
| SC-07-02_prototype.png, SC-08-03_prototype.png, SC-09-04_prototype.png, SC-10-04_prototype.png | 決裁系 4 画面 | |
