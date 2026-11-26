---
id: SPEC-INC_API-003
title: API — 期ロック（正式計算 + 1 transaction内での確定）
type: system
subtype: api-design
api_id: API-INC-003
endpoint: /api/v1/periods/{periodId}/lock
method: POST
media_type: application/json
feature: incentive
screen_id: [SC-09-04]
version: "0.1.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SPEC-SC-09-04-001, SPEC-INC_ENGINE-001, SPEC-INC_FUNC-001, ADR-007, ADR-002, ADR-005, BR-INC-01, FR-INC-01, FR-INC-03, PRM-043, CAP-HUMAN-01]
---

# API-INC-003 — POST /api/v1/periods/{periodId}/lock

> 様式: **BM-2-901-52 v01** — API Design · SUN ASTERISK VIETNAM CO., LTD · ISO/IEC 27001:2013 & ISO 9001:2015

---

## 1. 変更履歴

| No | Version | Action | 変更内容 | 更新日 | 更新者 | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | 初版作成 | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.1.1 | Update | Gate 2 G2-m01: Note `detail.openDays`；顧客 Q-INC-01: body `paymentCsvImportConfirmed`、422 E-INC-014、検証順序 | 2026-11-25 | phuongnnm-23344 |  |

---

## 2. 内容 / Description

`OPEN`の期を**期ロック**します。**1つのtransaction**内で次を行います: 要確認の判定を確定；入力が変わった締め済みの全期について、MAIN + DELTAとCARRY / CARRY_EXPIREDを正式計算；結果をappend-onlyで記録（版 + `inputHash`を付与）；`period_billings`にLOCKを記録；IF-ACC-01用の端数調整行を記録；期を`LOCKED`に変更；次の期が存在することを保証；結果メールをキューに入れ；監査ログを記録します（INC_ENGINE_TECH K8）。取り消せず、期ごとに1回のみロックします。呼び出し側は事前に試算を済ませ、その時の`inputHash`を送信している必要があります。

**認証:** Session cookie + `X-CSRF-Token` + **毎回コードを再入力するMFA** — ヘッダ `X-MFA-Token` はワンタイム、`purpose = PERIOD_LOCK`（取り消せない操作のため、ADR-002 §2-6a；[api-conventions §4](../../../_common/api-conventions.md#4-mfa-step-up)）。権限: `STL_HEAD`（または有効な代行）。

---

## 3. リクエストパラメータ

| No. | Param Type | Key | Data Type | Values | Description | Note |
|---|---|---|---|---|---|---|
| 1 | Path Parameters | `periodId` | string | `6f1c2b7e-3a51-4c1e-9f6a-0d2a6b1c9e10` | 期のuuid、`OPEN` |  |
| 2 | Header Parameters | `X-CSRF-Token` | string | `<csrf-token>` |  |  |
| 3 | Body Parameters | `expectedInputHash` | string | `3f9a0c…` | 利用者が確認した試算の`inputHash`（64桁の16進数） |  |
| 4 | Body Parameters | `judgements` | object | `{ "c0ffee00-0000-4000-8000-0000000000b8": { "decision": "NOT_KANNO", "reason": "振込手数料の差引と判断" } }` | `SUSPECT`の全行に**必ず**指定し、余分は不可；`reason` 1〜500文字 | 要確認の行がなければ `{}` |
| 5 | Body Parameters | `ackWarningCount` | Integer | `1` | 利用者がC-31で確認した⚠警告の件数（0以上） |  |
| 6a | Body Parameters | `paymentCsvImportConfirmed` | Boolean | `true` | SC-09-04 [17]の「支払期日分までの入金CSV取込済」のチェック: 照合が、入金日が支払期日までの入金CSVを取り込み済みと確認（Q-INC-01） | `true`必須；それ以外 → 422 `E-INC-014` |
| 6 | Header Parameters | `X-MFA-Token` | string | `mfa_01JD…` | C-30でコードを入力後に iam が発行するワンタイムMFAトークン（`purpose = PERIOD_LOCK`、有効期限120秒）；ログに記録しない |  |

---

## 4. レスポンス

| No. | Status Code | Description | Example response | Note |
|---|---|---|---|---|
| 1 | 200 | ロック済み | <pre>{<br>  "periodCode": "2027-08",<br>  "status": "LOCKED",<br>  "lockedAt": "2027-09-14T10:20:00+09:00",<br>  "lockedBy": { "staffId": "5a5a5a5a-0000-4000-8000-000000000007", "name": "桜 七子", "delegationId": null },<br>  "runId": "9d9d9d9d-0000-4000-8000-000000000801",<br>  "inputHash": "3f9a0c…",<br>  "totals": { "mainCount": 56, "mainJpy": 412300, "deltaCount": 2, "deltaJpy": -1320, "carryCount": 1, "carryExpiredCount": 0, "payoutJpy": 412300 },<br>  "nextPeriod": { "code": "2027-09", "dueDate": "2027-10-08" },<br>  "notificationsQueued": 57<br>}</pre> | `payoutJpy` = この期の Σ max(0, 人ごとの合計)。`nextPeriod.dueDate` は `PAYMENT_DUE_RULE` と銀行営業日カレンダーによる（例: 2027-10-10 は日曜 → 10-08、TV-05）。メールはcommit後に送信（outbox） |
| 2 | 401 | 未ログイン / セッション期限切れ | <pre>{ "error": { "code": "E-CMN-001", "message": "ログインが必要です" } }</pre> | クライアントはSC-00-01へ戻し、URLを保持する |
| 3 | 422 | 判定の未入力・誤り / body不正 | <pre>{ "error": { "code": "E-INC-006", "message": "要確認の判断が入力されていない買受人が 1 件あります。", "detail": { "participantIds": ["c0ffee00-0000-4000-8000-0000000000b8"] } } }</pre> | `E-INC-007`、`E-INC-011`、`E-CMN-007`も発生しうる |
| 3b | 422 | 入金CSV取込の確認チェック未済 | <pre>{ "error": { "code": "E-INC-014", "message": "支払期日分までの入金CSVの取込を確認し、チェックを入れてください。", "field": "paymentCsvImportConfirmed", "detail": { "latestPaidOn": "2027-09-09", "dueDate": "2027-09-10" } } }</pre> | `detail.latestPaidOn` = 取り込み済みの最も新しい入金日（参考値。サーバーは自動判断しない） |
| 4 | 403 | MFAトークンの未送信 / 期限切れ / 使用済み（未ログインの場合は 401 `E-CMN-001`） | <pre>{ "error": { "code": "E-CMN-005", "message": "この操作の前に本人確認（MFA）が必要です" } }</pre> | `E-CMN-005`；未ログインの場合は 401 `E-CMN-001`。6桁コードの誤りは iam のMFA認証APIが返すもので、本APIではない |
| 5 | 403 | `STL_HEAD`権限なし / 代行の期限切れ / CSRF不正 | <pre>{ "error": { "code": "E-CMN-002", "message": "この操作の権限がありません" } }</pre> |  |
| 6 | 404 | 期が存在しない | <pre>{ "error": { "code": "E-INC-001", "message": "指定された期が見つかりません。" } }</pre> |  |
| 7 | 409 | ロックの条件を満たしていない | <pre>{ "error": { "code": "E-INC-004", "message": "支払期日（2027/09/10）を過ぎていないため期ロックできません。", "detail": { "dueDate": "2027-09-10" } } }</pre> | いずれか: `E-INC-003`（前の期が未ロック、`detail.periodCode`）、`E-INC-004`、`E-INC-005`（`detail.openDays`） |
| 8 | 409 | 試算後に入力が変わった | <pre>{ "error": { "code": "E-INC-008", "message": "試算後に入金・訂正などの入力が変わりました。もう一度試算してから期ロックしてください。", "detail": { "currentInputHash": "77b1e2…" } } }</pre> | transactionをロールバック；何も記録しない |
| 9 | 409 | ⚠警告の件数が変わった | <pre>{ "error": { "code": "E-INC-013", "message": "確認が必要な注意事項が 2 件あります。内容を確認してから期ロックしてください。", "detail": { "warningCount": 2 } } }</pre> |  |
| 10 | 409 | 別のセッションが期を処理中 | <pre>{ "error": { "code": "E-INC-009", "message": "他の利用者がこの期を処理中です。しばらくしてから再度お試しください。" } }</pre> | `FOR UPDATE NOWAIT` が失敗 |
| 11 | 423 | 期がロック済み | <pre>{ "error": { "code": "E-INC-002", "message": "この期は期ロック済みです。訂正は修正申請で行い、差額は次の期ロックで計上されます。", "detail": { "lockedAt": "2027-09-14T10:20:00+09:00" } } }</pre> | 画面C-24に表示 |
| 12 | 500 | 規則データ / 移行後の期のデータ不備、システムエラー | <pre>{ "error": { "code": "E-INC-010", "message": "適用規則版の交付率表に不備があります。システム管理者に連絡してください。", "traceId": "01JD…" } }</pre> | 全体をロールバック；その他のエラーは `E-CMN-004` |

---

## 5. その他の注記

- 検証順序（最初に見つかったエラーを返す）: セッション → CSRF → 権限 → MFA → 期の行ロック（`E-INC-009`）→ `E-INC-002` → `E-INC-003` → `E-INC-004` → `E-INC-005` → `E-INC-014` → `E-INC-013` → `E-INC-008` → 判定（`E-INC-006/007/011`）。
- 冪等ではない: 200の後に再送 → 423 `E-INC-002`。画面は二重クリックを防ぐ（最初のクリック後はロックボタンを無効化）。
- アプリのタイムアウトは30秒。~170買受人でのtransaction目標は5秒以内（ADR-007 §1）。
- 監査: `PERIOD_LOCK`には判定 + 理由、`inputHash`、合計、実施者、代行、端末、MFA実施時刻を含む（FR-AUDIT-01、FR-AUDIT-03）。
- ロック条件（Q-INC-01、回答済み 【顧客（模擬）、2026-11-25】）: 業務日 > 支払期日 **かつ** `paymentCsvImportConfirmed = true`。完納はCSVの入金日で判定し、取込日では判定しない。チェックは`incentive_runs.payment_csv_confirmed_at`に保存（INCENTIVE_DB 4.51）。
- **未決事項 / TBD:** 経理部 — 銀行CSVの到着時刻（Q-INC-01）、Q-INC-03（次の期の作成タイミング）、E-01 / OPEN-DB-01（IF-ACC-01 の端数調整行の形式）。
