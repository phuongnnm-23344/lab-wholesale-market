---
id: SPEC-ERROR_CODES-001
title: エラーコード一覧（共通コード E-CMN + feature別の一覧）
type: system
subtype: error-codes
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
design_id: ERROR_CODES
feature: _common
related: ["SPEC-API_CONV-001", "BM-2-901-52", "BM-2-901-54"]
---

# エラーコード一覧

> **共通コード `E-CMN-*`** を定義する唯一の場所（メッセージは日本語を一つだけ持つ）。各 feature のコード（`E-LOT`、`E-TRD`、…）はその feature の Function Specifications の §3 で定義する — 本ファイルは接頭辞、番号の範囲、リンクのみを列挙し、**メッセージは複写しない**（DRY）。HTTP ステータスと body の形式: [`api-conventions.md`](api-conventions.md) §3。

---

## 1. 改訂履歴

| No. | Version | Action | 変更 | 更新日 | 更新者 | 備考 |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | P3 統合時の初版: 3流れの共通コードを統合（流れ3の `AUTH_REQUIRED` / `MFA_*` / `FORBIDDEN` / `VALIDATION` / `INTERNAL` → `E-CMN`）、feature の接頭辞 7件の集計表 | 2026-11-25 | phuongnnm-23344 | LAB-4 P3 |
| 2 | 0.1.1 | Update | Gate 2: E-STL 001–029（21件; 013 を追加 Q-STL-02、029 を追加 G2-M03）、E-INC 001–014（014 を追加 Q-INC-01）; 合計 8 + 147; "12 画面"（G2-m05） | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. コードの採番ルール

- 形式 `E-{接頭辞}-{nnn}`: 接頭辞は feature ごと（§4 の表）、`nnn` は昇順、削除した番号は **再利用しない** — 欠番は「予約」と記載する。
- 新しいコードは、それを使う spec を書くのと **同じ作業** で feature の FUNC の §3 に追加する; 二つ以上の feature で使うコードは、本ファイルの §3 で `E-CMN` に変える。
- 一つのコード = 一つの原因 = 一つのメッセージ。根拠となる法的な区分が異なる場合は二つのコードにする: `E-TRD-005`（**許可** 仲卸）≠ `E-TRD-006`（**承認** 売買参加者）— ルール2。
- メッセージ: 日本語で、原因と利用者が次に行うことを書く; パラメータは `{…}` で囲む。社内の決裁には 「承認」 を使わない（L4-D03） — 確認 / 決裁 を使う。
- HTTP: 422 はすべての入力エラー、409 は状態の衝突、403 は権限 / 起票者の自己決裁 / MFA、404 は見つからない、423 は日 / 期のロック、500 はシステムエラー（api-conventions §3.1）。400 は使わない。

---

## 3. 共通コード `E-CMN`

| コード | HTTP | メッセージ（JP） | 意味 | Client | 発生箇所 |
|---|---|---|---|---|---|
| E-CMN-001 | 401 | ログインが必要です | 未ログイン / セッション切れ / 利用者の交代 | SC-00-01（PC）/ SC-00-02（タブレット）に戻る、内容は保持 | セッションのミドルウェア — すべての API |
| E-CMN-002 | 403 | この操作の権限がありません | 役割 / 決裁権限が不足、代行の期限切れ、CSRF の誤り | C-25 | `requireRole`, `assert_caller`, RLS `42501` |
| E-CMN-003 | 423 | {業務日} は締め済みのため直接修正できません。訂正は修正申請で行います。 | 業務日が日次締め済み（`DAY_LOCKED`） | C-24、内容は保持、SC-08-01 へのボタン | Trigger `enforce_open_business_day` (ADR-005) |
| E-CMN-004 | 500 | 処理中にエラーが発生しました。時間をおいて再度お試しください | 予期しないエラー; ロールバック済み | C-26 と `traceId`（「エラー番号」） | すべての API |
| E-CMN-005 | 403 | この操作の前に本人確認（MFA）が必要です | 有効な MFA step-up がない、または `X-MFA-Token` が不足 / 期限切れ / 使用済み / `purpose` が違う / 人・端末が異なる | C-30 を経て再送 | 決裁の API（PREMISE §3.2、api-conventions §4） |
| E-CMN-006 | 409 | 同時に操作が行われました。もう一度お試しください | デッドロック / シリアライゼイション（`40P01`、`40001`） | C-23、再度押せるようにする（自動では再送しない） | すべての書き込み API |
| E-CMN-007 | 422 | 入力の形式が正しくありません | リクエストがスキーマに合わない（zod）: 項目の欠落、型の誤り、未知の enum; PG `22P02` / `22008` | `field` に応じて欄の下に C-22、または C-23 | すべての API |
| E-CMN-008 | 409 | 他の利用者が更新しました。最新の内容を読み込み直してください | 楽観的ロック: `version` が不一致（`detail.currentVersion`） | C-23 + 「再読み込み」、入力中の内容は保持 | その場で修正する API（例 API-PTY-002） |

統合時に改名したコード（履歴の照会のみに使い、**使用しない**）: `AUTH_REQUIRED` → `E-CMN-001` · `FORBIDDEN` → `E-CMN-002` · `INTERNAL` → `E-CMN-004` · `MFA_REQUIRED` → `E-CMN-005` · `VALIDATION` → `E-CMN-007` · `MFA_INVALID` → 削除（6桁のコードの誤りは iam の MFA 認証 API のエラーである。§5 を参照）。

---

## 4. feature別のコード一覧

| 接頭辞 | Feature | 使用中の範囲 | コード数 | 定義（JP メッセージ、HTTP、画面 / API） | 備考 |
|---|---|---|---|---|---|
| `E-LOT` | `lot` | 001–017 | 17 | [LOT_FUNC §3.1](../lot/function-specifications/LOT_FUNC.md#31-エラーコード-e-lot-) | |
| `E-TRD` | `trade` | 001–027 | 27 | [TRADE_FUNC §3.1](../trade/function-specifications/TRADE_FUNC.md#31-エラーコード-e-trd-) | 005 許可 / 006 承認 は分けて定義 |
| `E-PTY` | `party` | 001–024 | 24 | [PARTY_FUNC §3](../party/function-specifications/PARTY_FUNC.md#3-エラーコード一覧-e-pty) | |
| `E-DEL` | `delivery` | 001–030 | 30 | [DELIVERY_FUNC §3](../delivery/function-specifications/DELIVERY_FUNC.md#3-エラーコード一覧-e-del) | 029 は添付の共通 API で使用（未仕様化） |
| `E-STL` | `settle` | 001–029 | 21 | [SETTLE_FUNC §3](../settle/function-specifications/SETTLE_FUNC.md#3-機能のエラーコード表-e-stl) | 011、014–020 は予約; 013 = チェック 「未入力の引渡し確認票なし」（Q-STL-02）、029 = `LATE_ENTRY` が移動先モジュールに拒否された（G2-M03） |
| `E-INC` | `incentive` | 001–014 | 14 | [INC_FUNC §3](../incentive/function-specifications/INC_FUNC.md#3-機能のエラーコード表) | 002 は 423 を使用（期が期ロック済み） |
| `E-RULE` | `rule` | 001–014 | 14 | [RULE_FUNC §3](../rule/function-specifications/RULE_FUNC.md#3-機能のエラーコード表) | |

合計: 共通コード 8件 + feature のコード 147件。

---

## 5. 予約済みの接頭辞（未仕様化の feature）

以下の feature は Screen Specification を持つ12画面にまだ spec がない; LAB-5 で接頭辞が重ならないよう、接頭辞を確保しておく。依存の完全な一覧: [`specs/_index.md`](../_index.md) の「未仕様化の依存」の項。

| 接頭辞 | Feature | 予定 |
|---|---|---|
| `E-IAM` | `iam` | MFA コードの誤り（残りN回）、5回誤りで一時ロック、社員番号がない / `ACTIVE` でない |
| `E-ATT` | 添付の共通機能 | ファイルの種類 / サイズの誤り（現在は仮に `E-DEL-029`）、ファイルが見つからない |
| `E-SYNC` | `sync` | オフラインのレコードが `HELD` / 同期時の衝突 |
| `E-CAL`, `E-NTF`, `E-RPT`, `E-AUD` | `calendar`, `notify`, `report`, `audit` | 未使用 |
