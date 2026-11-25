---
id: WF-SC-07-02
title: Wireframe SC-07-02 日次締め
status: draft
version: "0.2.2"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [FT-07-04, FR-SETTLE-01, E-08, PRM-036, PRM-127, FR-SETTLE-02, BR-CLOSE-01, PRM-031, PRM-110, PRM-119, E-12, RACI-01, ADR-005, ADR-002, ADR-008]
---

# SC-07-02 日次締め — wireframe

| Mục | Nội dung |
|---|---|
| Vai trò màn | **Quyết định** — khóa 業務日; sau khóa không ai sửa trực tiếp, chỉ qua 修正申請 (BR-CLOSE-01) |
| Vai ghi | STL-HEAD hoặc 代行 đã chỉ định (◎, MFA — P25, S8). Đọc: SETTLE |
| Thiết bị | PC. Mục tiêu khóa 10:00, muộn nhất 10:30 (PRM-030) |
| Ràng buộc | **Không có nút mở lại ngày đã khóa** ở bất kỳ màn nào (PRM-031, ADR-005) |

## 1. Prototype (as-is)

![SC-07-02 prototype](assets/SC-07-02_prototype.png)

`/settlement/close`, stlhead@. Có: 業務日 + 合計, checklist 4 dòng, câu cảnh báo, ô gõ lại ngày, nút khóa mờ khi còn せり chưa xác nhận.

## 2. Wireframe to-be

Checklist khớp danh sách chuẩn ở ADR-005 §2.5: 12 mục — 6 mục ✖ chặn khóa, 6 mục ⚠ được đi tiếp (gồm dòng ⚠ せり tự xác nhận để soát; #8 [13] và #12 [22] phải tick — Q-STL-02).

```
[1] 業務日 2027/08/02(月)  未締め      [2] 合計（税抜）¥12,381,000（相対 ¥11,140,000 / せり ¥1,241,000）
┌─ [3] 締める前の確認 ────────────────────────────────────────────────────────────────┐
│ 区分                                            件数   締めへの影響   対応                          │
│ [6] 確定待ちの取引（下書き・確認待ち）               0件   ✖ 締め不可    —                              │
│ [4] 未確認のせり結果                               1件   ✖ 締め不可    確認する → SC-05-02            │
│ [8] 未同期の端末（最終同期時刻）                    1台   ✖ 締め不可    TAB-03 07:12 → SC-03-07  [19] 端末回収不能 │
│ [7] オフライン同期・後入力の要確認                   2件   ✖ 締め不可    判断する → SC-03-07 / SC-04-07  │
│ [9] 閾値以上・買受人変更の当日訂正（未確認）         1件   ✖ 締め不可    確認済にする → SC-07-01 要確認  │
│ [20] 金額が変わる引渡し例外（不足・返品・一部取消）    1件   ✖ 締め不可    確認済にする → SC-07-01 要確認  │
│ [5] 入力者本人が確認したせり                       1件   ⚠ 要確認      理由を見る → SC-07-01 要確認     │
│ [21] 閾値未満の当日訂正・取消                      2件   ⚠ 要確認      一覧 → SC-07-01                │
│ [10] 販売残のあるロット（持ち越し）                  4件   ⚠ 持ち越し    一覧 → SC-03-03                 │
│ [11] 未確認の争いのある引渡し                       1件   ⚠ 翌日へ      → SC-06-04 / SC-06-05           │
│ [12] 引渡し残（翌日以降も記録可）                   12件   ⚠ 要確認      一覧を確認 ☐ [13] 確認済み        │
│ [22] 未入力の引渡し確認票なし（紙台帳で確認）          —     ⚠ 要確認      配送部門の紙台帳（連番）と照合 ☐   │
└──────────────────────────────────────────────────────────────────────────────────┘
[14] 締めた後は、この業務日のデータを直接修正できません（締めの解除もできません）。訂正は修正申請で行います。
[15] 代行で締める場合: 「照合部門長 桜 七子 の代行として締めます」（代行指定がある場合のみ表示）
[16] 確認のため業務日を入力 [ 2027/08/02 ]（/ と - のどちらも可）
[17] [ この業務日を締める ]  → C-31 確認 → C-30 MFA → 完了     [18] キャンセル
 完了後: 「2027/08/02 を締めました（桜 七子 10:04）。次の業務日 2027/08/03 を開きました」、会計CSV作成を開始（SC-11-14、11:00まで）

── [19] 端末回収不能（端末が故障・紛失・水没で同期できない場合）
┌──────────────────────────────────────────────────────┐
│ 端末 TAB-03（第2バース）最終同期 07:12 未同期 5件            │
│ 理由（必須）[ 水没して起動しない                    ]        │
│ この端末を締めの確認から外します。未同期の記録は失われたものとして │
│ 扱い、紙から後入力してください。後で届いた記録は「オフライン同期・ │
│ 照合」で要確認になります。この端末のログインとオフラインPINは無効 │
│ になります。                                              │
│ [ 端末回収不能として登録 ] → C-30 MFA      [ キャンセル ]       │
└──────────────────────────────────────────────────────┘
```

## 3. Item

| No | Item | Loại | Quy tắc | Nguồn |
|---|---|---|---|---|
| 1 | 業務日 + trạng thái | Nhãn | 未締め / 締め済 | FR-SETTLE-02 |
| 2 | Tổng | Nhãn | Tách 相対 / せり | FB LAB-2 #12 |
| 3 | Checklist | Bảng | Mỗi dòng: số, ảnh hưởng (✖ chặn / ⚠ xác nhận được), **liên kết tới đúng màn xử lý**. Danh sách khớp ADR-005 §2.5 | PRM-119, FB LAB-2 #11, ADR-005 |
| 4 | せり chưa xác nhận | Dòng ✖ | | FR-SERI-02 |
| 5 | せり tự xác nhận | Dòng ⚠ | Chỉ để soát, không chặn | S2, PRM-115 |
| 6 | GD 下書き / 確認待ち | Dòng ✖ | Trạng thái FIG-012 (D10) | PRM-114 |
| 7 | Bản ghi SC-03-07 / 後入力 của ngày này còn 要確認 | Dòng ✖ | Gồm phiếu 紙伝票後入力 nghi trùng đang chờ người quyết | FT-04-07, ADR-008 |
| 8 | Máy chưa đồng bộ | Dòng ✖ | Tên máy + giờ đồng bộ cuối + số bản ghi chờ. **Trừ máy đã đánh dấu 「端末回収不能」** | L4-A05, ADR-008 |
| 9 | 当日訂正 / 取消 có tiền thay đổi ≥ ngưỡng 2 cấp **hoặc đổi 買受人** | Dòng ✖ | Ngưỡng = đúng ngưỡng 2 cấp của 修正申請 trong quy chế (E-08), đo theo tiền thay đổi lớn nhất của một người mua (税込). Mỗi dòng phải được 照合事務局 bấm 「確認済」 ở tab 要確認 SC-07-01; hiện cả tên người chốt gốc và người sửa. Đã trả lời Q-SC0405-01 [Customer giả lập, 2026-11-25] — khách #25 | PRM-127, E-08, FR-SETTLE-02 |
| 10 | Lô còn SL (持ち越し) | Dòng ⚠ | Cách xử lý 持ち越し tạm theo quy chế (E-12) | PRM-110, E-12 |
| 11 | Tranh chấp giao chưa xác nhận | Dòng ⚠ | Chỉ đếm tranh chấp `OPEN` đã nhập; phiếu giấy chưa nhập soát ở [22]; không chặn, đi tiếp sang ngày sau | ADR-008 §2.4 |
| 12 | 引渡し残 | Dòng ⚠ | Chuyện hằng ngày; phải tick [13] | FR-DEL-05, PRM-036 |
| 13 | Ô 「確認済み」 | Checkbox | Bắt buộc tick (không chặn bởi số lượng) | PRM-119, PRM-036 |
| 22 | 「未入力の引渡し確認票なし（紙台帳で確認）」 | Checkbox | ADR-005 §2.5 #12. Không có số đếm; người khóa đối chiếu sổ giấy đánh số do 配送 giữ; bắt buộc tick (kể cả không phát phiếu nào). [Customer giả lập, 2026-11-25 — Q-STL-02] | PRM-111, ADR-008 §2.4 |
| 14 | Câu cảnh báo | Nhãn | Luôn hiện | BR-CLOSE-01 |
| 15 | Dòng 代行 | Nhãn | Audit ghi "thay cho ai" | S8, RACI-01 |
| 16 | Gõ lại ngày | Văn bản | Khớp 業務日; chấp nhận `/` và `-` | FB LAB-2 #8 |
| 17 | 締める | Nút | Mờ khi còn dòng ✖ hoặc [13] / [22] chưa tick hoặc [16] sai; C-31 → **C-30 MFA (luôn hỏi lại mã — hành động không quay lại được, ADR-002)**. Khóa xong mở luôn 業務日 chợ kế tiếp theo lịch để 修正申請 / 後入力 có ngày ghi sổ (ADR-005) | P25, ADR-002, ADR-005 |
| 18 | キャンセル | Nút | | — |
| 19 | 端末回収不能 | Nút + hộp | Chỉ STL-HEAD / 代行; lý do bắt buộc; C-30 MFA; ghi 監査ログ. Máy ra khỏi dòng [8]; phiên và PIN offline của máy bị thu hồi; bản ghi của máy đó đến sau → SC-03-07 (要確認) → 修正申請 後入力. Khách #1 | NFR-AVL-02, BR-CLOSE-01, ADR-005, ADR-008 |
| 20 | Ngoại lệ giao làm đổi tiền chưa 確認済 | Dòng ✖ | 不足 / 返品 / 一部取消 ở ngày chưa khóa (SC-06-04 [12]); 照合事務局 bấm 「確認済」 ở SC-07-01. Khách #4 | FR-SETTLE-01, OBJ-05 |
| 21 | 当日訂正 dưới ngưỡng | Dòng ⚠ | Soát ở SC-07-01, không chặn | PRM-127 |

## 4. Trạng thái

| Trạng thái | Hiển thị |
|---|---|
| Đã khóa | Toàn màn chỉ đọc: 「締め済（桜 七子 10:04、MFA済）」; **không có nút mở lại**; liên kết 「訂正は修正申請へ」 |
| Còn dòng ✖ | [17] mờ, câu 「✖ の項目を解消すると締められます」 |
| Máy hỏng / mất, không đồng bộ được | [19] 端末回収不能 → dòng [8] bỏ máy đó; không có đường "khóa bỏ qua checklist" |
| Mất mạng | C-28: không khóa được |
| Người không có quyền / chưa có 代行 | C-25 (SETTLE xem checklist chỉ đọc) |
| MFA sai / hủy | Ở lại màn, không khóa |

## 5. Khác biệt theo vai

| Vai | Thấy |
|---|---|
| STL-HEAD / 代行 | Toàn màn |
| SETTLE | Checklist + liên kết, không [13], [22], [16], [17], [19]; bấm 「確認済」 cho [9], [20] ở SC-07-01 |
| OPS-HEAD | Xem trạng thái ngày ở SC-07-01 |

## 6. To-be khác prototype

| # | Prototype | To-be | Nguồn |
|---|---|---|---|
| 1 | 4 dòng checklist, không liên kết | 12 dòng (6 ✖, 6 ⚠ — #8, #12 phải tick) có mức ảnh hưởng + liên kết | PRM-119, FB LAB-2 #11, ADR-005 §2.5 |
| 2 | Không MFA (hộp xác nhận ghi 「試作では省略」) | C-30 MFA step-up | M02, ADR-002 |
| 3 | Không 代行 | [15] | S8 |
| 4 | Không có dòng máy chưa đồng bộ, phiếu giấy | [8], [11] + lối thoát [19] 端末回収不能 | M04, ADR-008, khách #1 |
| 5 | Không có dòng 当日訂正 lớn / ngoại lệ giao đổi tiền | [9], [20] chặn tới khi 照合 確認済 | khách #4, #25 |

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.2.0 | Update | Gate 1: checklist khớp danh sách chuẩn ADR-005 §2.5 (6 ✖ / 4 ⚠ + せり tự xác nhận) (M-05); thêm thao tác [19] 端末回収不能 (khách #1); [9] 当日訂正 ≥ ngưỡng / đổi 買受人 thành ✖ tới khi 確認済 (khách #25, Q-SC0405-01); [20] ngoại lệ giao đổi tiền (khách #4); khóa xong mở 業務日 kế tiếp (M-01). Ảnh prototype giữ nguyên | 2026-11-25 | phuongnnm-23344 | |
| 3 | 0.2.1 | Update | P3 gộp: [11] chỉ đếm tranh chấp `OPEN` đã nhập, phiếu giấy chưa nhập bù soát bằng sổ giấy — khớp ADR-005 0.2.2 #10 (Q-STL-02) | 2026-11-25 | phuongnnm-23344 | |
| 4 | 0.2.2 | Update | Khách Q-STL-02: thêm [22], checklist 12 mục (6 ✖ / 6 ⚠) | 2026-11-25 | phuongnnm-23344 |  |
