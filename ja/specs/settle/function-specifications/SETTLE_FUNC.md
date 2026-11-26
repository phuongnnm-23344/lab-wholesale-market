---
id: SPEC-SETTLE_FUNC-001
title: 機能仕様書 — モジュール settle (日次締め, 端末回収不能, 修正申請 決裁)
type: system
subtype: function-specifications
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
feature: settle
related: [SPEC-SC-07-02-001, SPEC-SC-08-03-001, SPEC-STL_DAY_CLOSE-001, SPEC-STL_DEVICE_LOST-001, SPEC-STL_CORRECTION_DECIDE-001, API-STL-001, API-STL-002, API-STL-003, API-STL-004, API-STL-005, SPEC-CLOSE_DB-001, SPEC-ADJUST_DB-001]
---

# settle — 機能仕様書

| | |
|---|---|
| モジュール / ファイル | `src/modules/settle/day-close-service.ts` · `correction-service.ts` · DB 関数 `app.fn_day_close_checklist`, `app.fn_day_close`, `app.fn_device_mark_lost`, `app.fn_correction_preview`, `app.fn_correction_decide` |
| 言語 / フレームワーク | TypeScript 5 / Next.js App Router + PostgreSQL 16 (PL/pgSQL) — ARCHITECTURE §4.3 |

共通の型 `SessionContext`、`Result<T>`、`AppError` は [PARTY_FUNC](../../party/function-specifications/PARTY_FUNC.md) を参照。`MfaToken` = コード検証後に `iam` が `purpose` 付きで発行するワンタイムトークン（★ 元に戻せない操作 — ADR-002 §2.2-6a）。

---

## 1. 変更履歴

| No | Ver | アクション / Action | 対象シート / Sheet | 変更内容 / Description of changes | 更新日 / Change Date | 更新者 / Editor | 承認 / Approve |
|---|---|---|---|---|---|---|---|
| 1 | Ver 0.1 | Add New | モジュール全体 | 初版: 関数 5 件 + エラーコード `E-STL` | 2026-11-25 | phuongnnm-23344 | |
| 2 | Ver 0.1.1 | Update | — | Gate 2 G2-M02: §4 完了条件（LAB-5）; G2-M03: エラーコード E-STL-029; 顧客 Q-STL-02: input `paperSlipsAllEnteredAcknowledged`、エラーコード E-STL-013; Q-STL-04: 段階 1 の権限 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 関数仕様

### 2.1. `getCloseChecklist`

| Return type | Function name |
|---|---|
| `Promise<Result<CloseChecklist>>` | `getCloseChecklist` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | STL-HEAD / 代行 / SETTLE（閲覧） |
| `string (YYYY-MM-DD)` | `businessDate` | クライアントが送る既定値は最も早い `OPEN` の業務日 |

**Function description**

> - `fn_day_close_checklist`（STL_DAY_CLOSE §4.2）を呼ぶ: 12 項目（ADR の番号、#12 はチェックのみで集計しない、画面項目 SC-07-02、レベル BLOCK / WARN、件数、詳細）、相対 / せり の合計金額、端末の一覧、`checklistVersion`; 締め済みの日 → 締めた時点のスナップショット + `lockedInfo`。
> - エラー: `E-STL-012`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `checklistVersion` | 内容のハッシュ — 古い画面による締めをブロックするため |

### 2.2. `closeBusinessDay`

| Return type | Function name |
|---|---|
| `Promise<Result<{ lockedAt: string; lockedBy: string; delegatedFor?: string; nextBusinessDate: string }>>` | `closeBusinessDay` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | 権限 STL_HEAD または代行 |
| `string` | `businessDate` | 締める日 |
| `{ confirmDate: string; deliveryRemainderAcknowledged: boolean; paperSlipsAllEnteredAcknowledged: boolean; checklistVersion: string }` | `input` | |
| `MfaToken` | `mfaToken` | `purpose = DAY_CLOSE`、ワンタイム |

**Function description**

> - `mfaToken` を消費 → `fn_day_close`（STL_DAY_CLOSE §4.3–4.4）: トランザクション内でチェックリストを再検査、締め、スナップショット、持ち越し、翌市場日を開く; COMMIT 後に IF-ACC-01 のジョブを予約し、`expireDueQualifications`（party）を呼ぶ。
> - エラー: `E-STL-001..005`, `-008`, `-010`, `-012`, `-013`, `E-CMN-005`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `nextBusinessDate` | 開かれたばかりの `OPEN` の日 — 画面とヘッダー C-2 に返す |

### 2.3. `markDeviceLost`

| Return type | Function name |
|---|---|
| `Promise<Result<{ device: LostDevice }>>` | `markDeviceLost` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | STL_HEAD / 代行 |
| `string` | `deviceId` | |
| `string` | `reason` | 1–200 |
| `MfaToken` | `mfaToken` | `purpose = DEVICE_LOST` |

**Function description**

> - `fn_device_mark_lost`（STL_DEVICE_LOST §4.2）: `lost_*` を記録、`is_active = false`、端末のセッションを取り消し、監査。
> - エラー: `E-STL-006`, `-007`, `-009`, `E-CMN-005`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `number` | `pendingSyncCountAtReport` | 監査に記録 — 報告時点で失われたとみなす記録の数 |

### 2.4. `getCorrectionDetail`

| Return type | Function name |
|---|---|
| `Promise<Result<CorrectionDetail>>` | `getCorrectionDetail` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | |
| `string` | `correctionId` | |

**Function description**

> - `fn_correction_preview`（STL_CORRECTION_DECIDE §4.1）: 申請内容、変更前 / 変更後、購入者ごとの税込の増減、生成される記録、計上業務日（仮）、対象期 + ロック済みかどうか、影響の文、決裁の履歴、`allowedActions`、`elapsedBusinessDays`。
> - エラー: `E-STL-021`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `AllowedAction[]` | `allowedActions` | `DECIDE_L1` · `DECIDE_L2` · `REJECT` — ボタンの表示 / 非表示のためだけに使う |

### 2.5. `decideCorrection`

| Return type | Function name |
|---|---|
| `Promise<Result<{ correction: CorrectionSummary; approval: CorrectionApproval; records: AdjustmentRecord[]; nextPendingId?: string }>>` | `decideCorrection` |

| Argument type | Argument name | Role of the argument |
|---|---|---|
| `SessionContext` | `ctx` | 有効な MFA step-up（10 分） |
| `string` | `correctionId` | |
| `{ level: 1 \| 2; decision: 'APPROVE' \| 'REJECT'; comment?: string }` | `input` | `level` は、二つの段階で二人が同時に押すのを防ぐ |

**Function description**

> - `fn_correction_decide`（STL_CORRECTION_DECIDE §4.2–4.5）: `correction_approvals` を記録; 全段階が完了 → REVERSE / DELTA を生成（`TRADE`）、新しい記録（`LATE_ENTRY`）、または `APPROVED` のみ（`KANNO`、`INCENTIVE`）を、最も早い `OPEN` の業務日に。期 = 元取引の期。
> - エラー: `E-STL-021..029`, `E-CMN-002`, `E-CMN-005`。

| Variable type | Variable name | Role of variables |
|---|---|---|
| `string` | `appliedBusinessDate` | 最終決裁時に確定した計上業務日 |
| `string` | `targetPeriodId` | 元取引の期 — 適用日から推定しない |

---

## 3. 機能のエラーコード表 `E-STL`

| コード | HTTP | メッセージ（JP） | 意味 | 使用箇所 |
|---|---|---|---|---|
| E-STL-001 | 422 | 確認のため業務日を正しく入力してください | 業務日を入力し直す（不一致） | SC-07-02 [16]; API-STL-002 |
| E-STL-002 | 409 | 締め不可（✖）の項目が残っています | ✖ の項目が残っている | [17]; API-STL-002 |
| E-STL-003 | 422 | 引渡し残の確認（確認済み）にチェックしてください | [13] がチェックされていない | [13]; API-STL-002 |
| E-STL-004 | 409 | この業務日は既に締め済みです | 締め済みの日 | API-STL-002 |
| E-STL-005 | 409 | 前の業務日 {date} が未締めです。先に締めてください | 前の日が未締め | API-STL-002 |
| E-STL-006 | 422 | 理由を入力してください（200文字以内） | 端末回収不能の理由の欠落 | 19.2; API-STL-003 |
| E-STL-007 | 409 | この端末は既に端末回収不能として登録されています | 端末が登録済み | API-STL-003 |
| E-STL-008 | 409 | 次の市場開催日がカレンダーに登録されていません | カレンダーに次の市場開催日が無い | API-STL-002 |
| E-STL-009 | 404 | 端末が見つかりません | 端末が見つからない | API-STL-003 |
| E-STL-010 | 409 | チェックリストが更新されました。最新の内容を確認してください | 表示時からチェックリストが変わった | API-STL-002 |
| E-STL-012 | 404 | 指定の業務日が存在しません | 業務日が存在しない | API-STL-001, -002 |
| E-STL-013 | 422 | 未入力の引渡し確認票がないこと（紙台帳で確認）にチェックしてください | [22] がチェックされていない（ADR #12、Q-STL-02） | [22]; API-STL-002 |
| E-STL-021 | 404 | 修正申請が見つかりません | 修正申請が見つからない | API-STL-004, -005 |
| E-STL-022 | 409 | この修正申請は決裁待ちではありません | 決裁待ちではない | API-STL-005 |
| E-STL-023 | 403 | 申請者本人は決裁できません | 申請者の自己決裁 | SC-08-03; API-STL-005 |
| E-STL-024 | 403 | 1次と2次を同じ人は決裁できません | 同一人物による二段階の決裁 | SC-08-03; API-STL-005 |
| E-STL-025 | 422 | 却下理由を入力してください（200文字以内） | 却下理由の欠落 | [12]; API-STL-005 |
| E-STL-026 | 409 | この修正申請は既に処理されました（決裁段階が変わりました） | 送信された段階 ≠ 現在の段階 | API-STL-005 |
| E-STL-027 | 409 | ロットの残数量が不足しているため反映できません（残 {n}{単位}） | 数量増加時にロットの在庫が不足 | API-STL-005 |
| E-STL-028 | 409 | 計上できる未締めの業務日がありません | 計上できる開いている日が無い | API-STL-005 |
| E-STL-029 | 409 | 反映先の処理でエラーになりました：{sourceMessage} | `LATE_ENTRY`: 反映先モジュールの関数が拒否（例: 伝票上の時刻に参加資格が無効）; `detail.sourceCode` = 元のコード | SC-08-03 [13]; API-STL-005 |

共通エラーコード `E-CMN-001..008`（JP メッセージ 1 種、HTTP、クライアントの扱い）: [`_common/error-codes.md`](../../_common/error-codes.md)。エラー body、MFA、楽観ロック: [`_common/api-conventions.md`](../../_common/api-conventions.md)。`E-STL-011`、`E-STL-013..020` は空き — 予約のみで未使用。

---

## 4. 完了条件（LAB-5）

関数ごとに定める。詳細な検査ケースは対応する Technical Design の「完了条件（LAB-5）」の節を参照。各関数は、次の場合に完了とする: §3 のエラーコードのうち関数が返すものすべてに、正しい HTTP ステータスで少なくとも一つのテストが当たっており、かつ下記の条件を満たすこと。

| Function | 完了条件 | TECH |
|---|---|---|
| `getCloseChecklist` | 12 項目が ADR-005 §2.5 の順序どおり（#12 はチェック、`count = null`）; `LOCKED` の日はスナップショットを返し、再計算しない; SETTLE は閲覧できる、他の役割は 403 | [STL_DAY_CLOSE](../technical-design/STL_DAY_CLOSE_TECH.md) |
| `closeBusinessDay` | ✖ が残る → 409 `E-STL-002`（`detail.blocking[]`）; #8 / #12 のチェックが無い → 422 `E-STL-003` / `E-STL-013`; `purpose` が違うトークン → 403; 締めた後にその日へ書き込む → 423; 次の業務日を開く; IF-ACC-01 を予約 | [STL_DAY_CLOSE](../technical-design/STL_DAY_CLOSE_TECH.md) |
| `markDeviceLost` | 端末が #3 の項目から外れる、セッションを取り消す、二回目 → 409 `E-STL-007`; トークン `DEVICE_LOST` | [STL_DEVICE_LOST](../technical-design/STL_DEVICE_LOST_TECH.md) |
| `getCorrectionDetail` | 運用部門長には `allowedActions` に `DECIDE_L1` が無い（Q-STL-04）; 有効な代行 STL_HEAD には有る | [STL_CORRECTION_DECIDE](../technical-design/STL_CORRECTION_DECIDE_TECH.md) |
| `decideCorrection` | 閾値を超える → 二段階; 申請者本人 → 403 `E-STL-023`; 同一人物が二段階 → 403 `E-STL-024`; 運用部門長が段階 1 → 403; REVERSE + DELTA を最も早い `OPEN` の日に、元取引はそのまま; `LATE_ENTRY` が拒否される → 409 `E-STL-029` + ロールバック | [STL_CORRECTION_DECIDE](../technical-design/STL_CORRECTION_DECIDE_TECH.md) |
