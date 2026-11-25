---
id: WF-SC-09-04
title: Wireframe SC-09-04 奨励金計算・期ロック
status: draft
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [FT-09-06, FT-09-07, FT-09-08, FT-09-10, BR-INC-01, FR-INC-01, FR-INC-03, PRM-042, PRM-043, PRM-053, E-02, OPEN-L4-02, L4-A04, D01, D02, D03, D04, ADR-007, ADR-002]
---

# SC-09-04 奨励金計算・期ロック — wireframe

| Mục | Nội dung |
|---|---|
| Vai trò màn | **Quyết định** — 3 bước: xác nhận 入金 đã gán đủ → chạy tính → kiểm tra & 期ロック. Sau khóa, mọi chênh lệch đi delta kỳ sau (luật 4) |
| Vai ghi | STL-HEAD (◎, MFA — P30). Đọc: SETTLE, OPS-HEAD |
| Thiết bị | PC |

## 1. Prototype (as-is)

![SC-09-04 prototype](assets/SC-09-04_prototype.png)

`/periods/[id]/incentives`, stlhead@, kỳ 2026-11 chưa tính. Có: version áp dụng, 試算 / 計算して記録 / 期ロック, câu 「試算ロジックは簡略化しています」.

## 2. Wireframe to-be

```
[1] 対象期 2027-08（2027/08/01〜08/31、業務日基準）  支払期日 2027/09/10(金)  [2] 適用規則版 第3版
[3] ステップ  ①入金の割当確認 ✔  ②計算 ●  ③期ロック ○
┌─ [4] ① 入金の割当（どの期に充当したか）────────────────────────────────────┐
│ 買受人  期のお支払額  期日内入金  充当先の内訳                    完納  注意           │
│ N01    ¥1,210,000   ¥1,210,000  2027-08: ¥1,210,000           ○                   │
│ B07    ¥   88,000   ¥  100,000  2027-07: ¥12,000（FIFO）/ 08: ¥88,000 ○  [5]⚠旧期充当 │
│ B11    ¥  330,000   ¥  329,560  2027-08: ¥329,560              ✖  手数料差引の疑い   │
│ [6] 請求番号なし → FIFO で充当（E-02 回答後に変更）                                 │
└────────────────────────────────────────────────────────────────────────────┘
┌─ [7] ② 計算結果（試算 / 記録）─────────────────────────────────────────────────┐
│ [8] タブ: (仲卸 交付率表) (売買参加者 交付率表)                                     │
│ 買受人 種別  適格金額(税抜) 段階  交付率  奨励金(税込)  区分   参照期   版           │
│ N01   仲卸   ¥1,100,000   2    0.9%   ¥10,890     本計算  —      第3版         │
│ N04   仲卸   —            —    —      −¥1,320     差額   2027-06 第2版（旧期の版）│
│ [9] 端数調整行: +¥2（税率別合計との差）                                           │
│ [10] 負の差額の繰越: N04 −¥1,320 → 2027-09期へ（年度末まで）                       │
└────────────────────────────────────────────────────────────────────────────┘
[11] [ 試算（記録しない） ]  [12] [ 計算して記録（1期1回） ]  [13] [ 期ロック ]（C-31 → C-30 MFA）
```

## 3. Item

| No | Item | Loại | Quy tắc | Nguồn |
|---|---|---|---|---|
| 1 | Kỳ + 支払期日 | Nhãn | Kỳ = tháng theo **業務日** của GD gốc; 支払期日 theo quy chế + lịch ngân hàng (lùi về 営業日 trước) | L4-A04 (2), D05 |
| 2 | Version áp dụng | Nhãn | Version hiệu lực ngày 1 của kỳ | PRM-042 |
| 3 | Thanh 3 bước | Điều hướng | Bước sau chỉ mở khi bước trước xong | FT-09-07 |
| 4 | Bảng gán 入金 | Bảng | **Hiện tiền đã gán vào kỳ nào** để 照合 kiểm trước khi khóa | OPEN-L4-02, D03 |
| 5 | Cảnh báo gán kỳ cũ | Nhãn ⚠ | FIFO đem tiền kỳ mới trả nợ kỳ cũ → kỳ mới có thể mất 完納 | OPEN-L4-02, FB-CUS-225 |
| 6 | Ghi chú FIFO | Nhãn | Đổi khi E-02 trả lời | E-02 |
| 7 | Khối kết quả | Vùng | | — |
| 8 | Tab 2 bảng tỷ lệ | Tab | 仲卸 / 売買参加者, mỗi bảng 5 bậc | D01, BR-INC-01 |
| 9 | 端数調整 | Dòng | | PRM-053, D04 |
| 10 | Mang sang delta âm | Nhãn | Tới hết năm TC | M08, D23 |
| 11 | 試算 | Nút | Không ghi | — |
| 12 | 計算して記録 | Nút | 1 lần / kỳ; MAIN + DELTA kỳ cũ theo **version kỳ cũ**, không hồi tố 完納 | PRM-043, ADR-007 |
| 13 | 期ロック | Nút | C-31 (「ロック後は直接修正できません。差額は次期に計上されます」) → C-30 MFA | P30, ADR-002 |

## 4. Trạng thái

| Trạng thái | Hiển thị |
|---|---|
| Chưa có 入金 / kỳ chưa kết thúc | [4] C-21; [12] [13] mờ |
| Có dòng ⚠ ở [4] | Không chặn; [13] hỏi 「⚠ 2件を確認しましたか」 |
| Đã tính | [12] ẩn, [7] là bản ghi thật |
| Đã khóa | Chỉ đọc + 「期ロック済（桜 七子 09/12 10:20）」; sửa → 修正申請 → delta kỳ sau (C-24) |
| Mất mạng | C-28 |

## 5. Khác biệt theo vai

STL-HEAD: toàn màn. SETTLE: xem [4], [7], nút [11]; không [12], [13]. OPS-HEAD: chỉ đọc. Vai khác: C-25.

## 6. To-be khác prototype

| # | Prototype | To-be | Nguồn |
|---|---|---|---|
| 1 | Một bảng tỷ lệ | Hai bảng 仲卸 / 売買参加者 | D01 |
| 2 | Bậc tra trên tiền 税込 | 適格金額 税抜; thưởng × 110/100 | D02 |
| 3 | 入金 gán theo cửa sổ ngày, không hiện gán vào đâu | Bảng phân bổ FIFO + [4], [5] | D03, OPEN-L4-02 |
| 4 | 1 thuế suất, không 端数調整, không mang delta âm | [9], [10] | D04, M08 |
| 5 | 支払期日 cố định ngày 10 | Theo quy chế + lịch | D05 |
| 6 | Không MFA | C-30 | M02 |

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
