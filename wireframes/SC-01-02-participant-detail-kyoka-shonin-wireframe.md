---
id: WF-SC-01-02
title: Wireframe SC-01-02 参加者詳細・編集 (許可 / 承認 hai khối)
status: draft
version: "0.2.4"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [FT-01-01, FT-01-02, FT-01-03, FT-01-04, FR-PARTY-01, TBL-ACTOR-01, 02-08, B.2, BR-PERM-01, PRM-044, PRM-046, PRM-121, FIG-010, L4-D02, ADR-003, OPEN-DB-09]
---

# SC-01-02 参加者詳細・編集 — wireframe

| Mục | Nội dung |
|---|---|
| Vai trò màn | **Quản lý** (manage) hồ sơ một người tham gia + nhìn tư cách pháp lý |
| Vai ghi | SETTLE, STL-HEAD (P01–P03). Đọc: OPS-HEAD (閲). Vai khác: C-25 |
| Thiết bị | PC |
| Điểm cốt lõi | **許可 (仲卸 — giấy phép có xét duyệt) và 承認 (売買参加者 — chấp thuận, thủ tục nhẹ) là hai khối riêng**: trường, trạng thái, **thủ tục** (許可: 審査 + 運用部門長 決裁; 承認: 届出 + 照合部門長 確認), căn cứ khác nhau (L4-D02, luật 2, S5). Không có khối chung "取引資格" |

## 1. Prototype (as-is)

| 仲卸 | 売買参加者 — màn 承認 |
|---|---|
| ![SC-01-02 仲卸](assets/SC-01-02_prototype-nakaoroshi.png) | ![SC-01-04 売買参加者](assets/SC-01-04_prototype-baibai-approvals.png) |

Ảnh phụ: `assets/SC-01-02_prototype-baibai.png`, `assets/SC-01-03_prototype-nakaoroshi-permits.png`. Prototype: form hồ sơ + một bảng tư cách theo loại, bảng 許可 vẫn có cột 「参加上限」 để trống (—); 保証金 sửa đè; 状態 là ô chọn sửa trực tiếp.

## 2. Wireframe to-be

Hai khối không bao giờ hiện cùng lúc; tiêu đề khối chữ to, khung màu khác nhau (許可: khung xanh đậm; 承認: khung cam) để phân biệt bằng mắt — khách #18. Trạng thái tư cách nằm **trong từng khối**, đúng enum của Database Design (有効 VALID · 一時停止 SUSPENDED · 失効 EXPIRED · 再審査中 UNDER_REVIEW); mức doanh nghiệp chỉ có 取引中 / 退会.

```
[C-9] 参加者詳細：サンプル仲卸1                                     [C-10] 一覧へ戻る
┌─ [1] 基本情報 ─────────────────────────────────────────────────────────────────┐
│ [2] 種別      仲卸（登録後変更不可）           [3] 事業者の状態  取引中（取引中 / 退会）  │
│ [4] 名称      [ サンプル仲卸1          ]        [5] 買受人番号  [ N01 ]                 │
│ [6] 通知メール1 [ …@sakura-sample.example ]   [7] 通知メール2 [            ]（最大2件） │
│ [8] 保証金額   ¥3,000,000   [9] 保証金の変更（履歴に追加）  [10] 履歴を見る ▼           │
│ [11] [ 保存する ]                                                                │
└─────────────────────────────────────────────────────────────────────────────┘

── 種別 = 仲卸 のときだけ表示 ───────────────────────────────────────────────
┏━ [12] 【許可】仲卸 ─ 根拠: 市場業務規程（許可・審査あり） ━━━━━━━━━━━━━━━━━━━━━━━┓
┃ [13] 許可番号  有効期間                 許可条件            状態   失効まで            ┃
┃      サンプル許可-N01 2025/10/19〜2028/10/23  （審査結果の条件）  有効   698日          ┃
┃      （履歴: 更新前の許可は「更新済」で残る）                                        ┃
┃ [14] [ 許可の申請受付・審査・更新 → SC-01-03 ]  新規: 審査→起案→運用部門長決裁／更新: 照合部門長確認（MFA） ┃
┃ [17] 許可の状態  有効   [ 一時停止を起案 ] [ 再審査を起案 ] [ 期限前更新を入力 ]  → SC-01-05 ┃
┃      （一時停止・再審査: 運用部門長 決裁, MFA／期限前更新: 照合事務局 入力 → 照合部門長 確認, MFA） ┃
┃ [19] 進行中: 「一時停止 起案中（決裁待ち）」(C-27)                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

── 種別 = 売買参加者 のときだけ表示 ─────────────────────────────────────────
┏━ [15] 【承認】売買参加者 ─ 根拠: 市場業務規程（承認・届出） ━━━━━━━━━━━━━━━━━━━━━━━┓
┃ [16] 承認番号  有効期間                 参加上限      今期使用額 / 残     状態        ┃
┃      サンプル承認-B01 2025/10/19〜2028/10/23 ¥5,000,000  ¥1,188,000（税込）/ ¥3,812,000 有効 ┃
┃      （今期使用額 税抜 ¥1,100,000）                                                    ┃
┃      （参加上限: 保証金額に連動 / 個別設定。変更は照合部門長のみ・理由必須・履歴あり → [22]）┃
┃ [18] [ 承認の届出入力・更新 → SC-01-04 ]  手続: 届出 → 照合事務局 入力 → 照合部門長 確認（MFA） ┃
┃ [21] 承認の状態  有効   [ 一時停止を起案 ] [ 期限前更新を入力 ] [ 参加上限の変更 ] → SC-01-05 / 04 ┃
┃ [22] 参加上限の変更履歴 ▼（変更前 / 変更後 / 理由 / 変更者 / 変更日時）                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

── [9] 保証金の変更ダイアログ（売買参加者の場合）
│ 新しい保証金額 [ ¥6,000,000 ]  発効日 [ 2027/09/01 ]  理由 [            ]          │
│ 「参加上限は保証金額に連動しているため ¥6,000,000 に変わります」                      │
│  （個別設定の場合:「参加上限は ¥5,000,000 のまま変わりません」）                       │

[20] 変更履歴（監査）→ SC-13-01 で絞込み表示
```

## 3. Item

| No | Item | Loại | Bắt buộc | Quy tắc | Vai thấy / sửa | Nguồn |
|---|---|---|---|---|---|---|
| 1 | Khối 基本情報 | Vùng | — | | Đọc: SETTLE, STL-HEAD, OPS-HEAD | FT-01-01 |
| 2 | 種別 | Nhãn | — | 4 loại (卸売業者 / 仲卸 / 売買参加者 / 買出人); khóa sau đăng ký | — | TBL-ACTOR-01 |
| 3 | 事業者の状態 | Nhãn | — | Chỉ 取引中 (ACTIVE) / 退会 (WITHDRAWN) — enum `participant_status`. **Không** hiện 一時停止 / 失効 ở mức người tham gia: các trạng thái đó thuộc 許可 / 承認 ([17], [21]) | — | FIG-010, D13 |
| 4 | 名称 | Văn bản | ✓ | 1–100 ký tự | Sửa: SETTLE, STL-HEAD | — |
| 5 | 買受人番号 | Văn bản | ✓ với 仲卸 / 売買参加者 | `^[A-Z0-9]{1,10}$`, duy nhất | như trên | TBL-ACTOR-01 |
| 6–7 | 通知メール 1, 2 | Email | — | Tối đa 2; đổi theo giấy yêu cầu, có lịch sử | như trên | L4-A08 |
| 8 | 保証金額 | Nhãn | — | Giá trị hiện hành | — | PRM-046 |
| 9 | Đổi 保証金 | Nút → hộp thoại | — | Số mới + ngày hiệu lực + lý do; **thêm dòng lịch sử, không sửa đè**. Với 売買参加者: hộp thoại nói rõ 参加上限 có đổi theo không (theo 保証金 → đổi; đặt riêng → không đổi) — khách #20. **Chỉ 照合部門長**, MFA, không checker (Q-PTY-06 [Customer giả lập, 2026-11-25]) | Sửa: STL-HEAD | luật 4, D14, PRM-046 |
| 10 | Lịch sử 保証金 | Bảng gập | — | | Đọc | D14 |
| 11 | 保存する | Nút | — | Ghi audit before/after | SETTLE, STL-HEAD | FR-AUDIT-01 |
| 12 | **Khối 許可** | Vùng | — | **Chỉ hiện khi 種別 = 仲卸.** Tiêu đề to 「【許可】仲卸」, khung riêng. Không có cột 参加上限 | Đọc: SETTLE, STL-HEAD, OPS-HEAD | 02-08, S5, khách #18 |
| 13 | Bảng 許可 | Bảng | — | Số, hiệu lực, **điều kiện 許可 (kết quả 審査)**, trạng thái, số ngày tới 失効; bản cũ giữ nhãn 「更新済」 | — | FT-01-02, ADR-003 |
| 14 | 許可の申請受付・審査・更新 | Nút | — | → SC-01-03. **Cấp mới 許可 (có xét duyệt):** 照合事務局 nhập hồ sơ → 照合部門長 ghi kết quả 審査 + điều kiện và 起案 → **運用部門長 決裁 (MFA)** (giả định [PL], OPEN-DB-09). **Gia hạn bình thường (PRM-121):** 照合事務局 nhập 失効日 mới → **照合部門長 確認 (MFA)**, ghi xem lại điều kiện; không 審査 lại | SETTLE, STL-HEAD, OPS-HEAD | FT-01-02, PRM-121, ADR-003 §2.2 |
| 15 | **Khối 承認** | Vùng | — | **Chỉ hiện khi 種別 = 売買参加者.** Tiêu đề to 「【承認】売買参加者」, khung màu khác [12] | Đọc như [12] | 02-08, S5, khách #18 |
| 16 | Bảng 承認 + 参加上限 | Bảng | — | 参加上限 mặc định = 保証金額; **今期使用額 / 残** tính theo kỳ, chung 相対 + せり; so **税込** (tổng 税抜 × hệ số thuế, làm tròn xuống), hiện cả 税込 / 税抜 (Q-TRD-02 [Customer giả lập, 2026-11-25]) | — | PRM-046, L4-A04 |
| 17 | Trạng thái 許可 | Nhãn + nút | — | 有効 / 一時停止 / 失効 / 再審査中. 一時停止 / 再審査 / phục hồi = 照合部門長 起案 → 運用部門長 決裁 (MFA). Quá 失効日 → 失効 tự động (giả định PL — FIG-010 không vẽ 有効 → 失効 trực tiếp). Ai 決裁 đình chỉ / thu hồi 許可 và có 弁明の機会 không: chờ 運用部門 (OPEN-DB-09) | Nút theo vai | FT-01-04, PRM-121, FIG-010 |
| 18 | 承認の届出入力・更新 | Nút | — | → SC-01-04. **Thủ tục 承認 (nhẹ hơn):** 届出 → 照合事務局 nhập → **照合部門長 確認 (MFA)** kèm xét nhẹ điều kiện 保証金 / 資力 → 有効; không có bước 審査 riêng như 許可 | SETTLE, STL-HEAD | P03, PRM-121 |
| 19 | Yêu cầu đang chờ | Nhãn | — | C-27 dùng nhãn 「決裁待ち」/「確認待ち」 — **không bao giờ** 「承認待ち」 (tránh lẫn với khối 承認 bên cạnh) — khách #19 | Đọc | luật 2, S6 |
| 20 | Lịch sử audit | Liên kết | — | → SC-13-01 lọc theo người tham gia | SETTLE, STL-HEAD | FR-AUDIT-01 |
| 21 | Trạng thái 承認 | Nhãn + nút | — | 有効 / 一時停止 / 失効 / 再審査中. 一時停止 / 再審査 / phục hồi = 照合部門長 起案 → 運用部門長 決裁 (MFA). 期限前更新 = SETTLE nhập + STL-HEAD 確認 **(MFA)**, không qua 再審査. MFA cho 期限前更新 cần thêm vào danh sách PREMISE §3.2 (khách #21) | Nút theo vai | FT-01-04, PRM-121, NFR-SEC-01 |
| 22 | Lịch sử 参加上限 | Bảng gập | — | 参加上限 **không sửa đè**: mỗi lần đổi là một sự kiện `LIMIT_CHANGED` (cũ / mới / lý do / người) trong lịch sử 承認. Đổi = 照合部門長 một bước, MFA (Q-PTY-06) | Đọc; đổi qua SC-01-04 (STL-HEAD) | luật 4, PRM-046, ADR-003 |

## 4. Trạng thái

| Trạng thái | Hiển thị |
|---|---|
| 仲卸 chưa có 許可 | [13] C-21: 「許可が登録されていません。取引の確定はできません」 + [14] |
| 売買参加者 chưa có 承認 | [16] C-21 tương tự + [18] |
| 卸売業者 / 買出人 | Không có [12], [15]; câu 「この種別は許可・承認の対象外です」 |
| 失効まで ≤ 30 ngày | Nhãn vàng ở [13] / [16] (cùng ngưỡng với SC-04-01) |
| 許可 / 承認 一時停止 / 失効 | Trạng thái trong khối ([17] / [21]) đỏ + chữ; [14] / [18] vẫn dùng được để gia hạn theo đúng thủ tục |
| Đang chờ 決裁 / 確認 | [19] C-27; nút đổi trạng thái ẩn tới khi xong |
| 退会 | [3] xám; mọi nút ghi ẩn |
| Lỗi 買受人番号 trùng | C-22 dưới [5] |

## 5. Khác biệt theo vai

| Vai | [4]–[11] | [12]–[16], [22] | [17] / [21] |
|---|---|---|---|
| SETTLE | Sửa | Đọc + nút [14] / [18] (nhập hồ sơ cấp mới 許可 / 届出 承認; nhập 失効日 mới khi gia hạn cả hai) | 「期限前更新を入力」 (許可 / 承認 — PRM-121) |
| STL-HEAD | Sửa | Đọc + nút; cấp mới 許可: ghi kết quả 審査 + 起案; cấp mới 承認: 確認 (MFA); gia hạn 許可 / 承認: 確認 (MFA, PRM-121) | 「一時停止を起案」, 「再審査を起案」, 「期限前更新を確認」 (許可 / 承認, MFA) |
| OPS-HEAD | Đọc | Đọc; 「決裁」 **cấp mới** 許可 (MFA — giả định [PL], OPEN-DB-09). **Không** 決裁 gia hạn (PRM-121) | 「決裁」 再審査 / 一時停止 / phục hồi (MFA) khi có yêu cầu chờ |
| Khác | C-25 | | |

## 6. To-be khác prototype

| # | Prototype | To-be | Nguồn |
|---|---|---|---|
| 1 | Bảng 許可 có cột 参加上限 (trống) | Bỏ cột ở khối 許可; 参加上限 chỉ ở khối 承認 | luật 2, S5 |
| 2 | 状態 là ô chọn sửa thẳng, ở mức người tham gia | Trạng thái trong từng khối; chỉ đổi qua 起案 → 決裁 + MFA; mức người tham gia chỉ 取引中 / 退会 | FT-01-04, D13, FIG-010 |
| 3 | 保証金 sửa đè | Lịch sử thêm dòng | D14 |
| 4 | Một email | Tối đa 2 email | L4-A08 |
| 5 | Không có 今期使用額 / 残 | Có, theo kỳ | M19 |
| 6 | 許可 và 承認 cùng một thao tác đăng ký | Cấp mới 許可: 審査 + 起案 → 運用部門長 決裁; 承認: 届出 → 照合部門長 確認; gia hạn của cả hai: 照合部門長 確認 (PRM-121) | luật 2, ADR-003, PRM-121 |
| 7 | 参加上限 sửa đè | Sự kiện `LIMIT_CHANGED` có lịch sử | PRM-046 |

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.2.0 | Update | Gate 1 M-07: trạng thái tư cách đưa vào từng khối đúng enum (mức người tham gia chỉ 取引中 / 退会); thể hiện thủ tục khác nhau (許可 có 審査 + 運用部門長 決裁, 承認 届出 + 照合部門長 確認); 参加上限 có lịch sử LIMIT_CHANGED [22]; giả định 失効 tự động. Khách #18 (khối tách bằng mắt), #19 (C-27 không dùng 承認待ち), #20 (hộp thoại 保証金 báo 参加上限), #21 (MFA 期限前更新). Ảnh prototype giữ nguyên | 2026-11-25 | phuongnnm-23344 | |
| 3 | 0.2.1 | Update | Gate 1 recheck N-03: cấp mới 許可 = 審査 + 運用部門長 決裁 (giả định PL); gia hạn bình thường theo PRM-121 (照合部門長 確認); 承認 xét nhẹ | 2026-11-25 | phuongnnm-23344 | |
| 4 | 0.2.2 | Update | Gate 1 recheck D-01 (kiểm diff 5b0ef16): bảng §5 theo N-03 / PRM-121 — gia hạn 許可 và 承認 đều 照合事務局 nhập + 照合部門長 確認 (MFA); 運用部門長 chỉ 決裁 cấp mới 許可 (giả định [PL]) và 再審査 / 一時停止 / phục hồi | 2026-11-25 | phuongnnm-23344 | |
| 5 | 0.2.3 | Update | P3 gộp (D-01 còn lệch nhỏ): hình vẽ [17] thêm nút 「期限前更新を入力」 cho khối 許可 và chú thích thủ tục, khớp bảng §5 và SC-01-02_SPEC | 2026-11-25 | phuongnnm-23344 | |
| 6 | 0.2.4 | Update | Khách Q-PTY-06 (chỉ 照合部門長 đổi 保証金 / 参加上限), Q-TRD-02 (税込 / 税抜) | 2026-11-25 | phuongnnm-23344 |  |
