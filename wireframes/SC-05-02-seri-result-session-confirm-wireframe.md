---
id: WF-SC-05-02
title: Wireframe SC-05-02 せり結果確認
status: draft
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [FT-05-02, FT-01-05, FR-SERI-02, FORM-SERI-01, BR-PERM-01, CAP-HUMAN-01, PRM-115, ACT-03, L4-A04, M20, ADR-003]
---

# SC-05-02 せり結果確認 — wireframe

| Mục | Nội dung |
|---|---|
| Vai trò màn | **Quyết định** — 確認者 xác nhận cả phiên せり một lần. Kết quả せり do せり人 quyết trên sàn; hệ thống chỉ **ghi kết quả**, không có màn đấu giá trực tiếp (FR-SERI-01, luật 1) |
| Vai ghi | TRADE (確認者 ◎, ≠ 入力者 — S2). Đọc: SETTLE, STL-HEAD, OPS-HEAD (P20) |
| Thiết bị | PC |

## 1. Prototype (as-is)

![せり list — rỗng](assets/SC-05-02_prototype-seri-list-ref.png)

Không chụp được màn xác nhận: 業務日 demo chưa có phiên せり nào, và tạo phiên sẽ **ghi dữ liệu** (ngoài phạm vi chỉ xem). Mô tả as-is theo mã `src/app/(app)/seri/[id]/confirm/page.tsx`: bảng kết quả; một ô lý do vượt hạn mức **cho mọi dòng** (gõ tự do); ô 「入力者本人が確定する理由」 khi trùng người; nút 「この回の結果を確定する」 + hộp xác nhận. Ảnh trên là trạng thái rỗng của danh sách phiên (C-21).

## 2. Wireframe to-be

```
[C-9] せり結果確認：第3回（2027/08/02）                       [C-10] 回の一覧へ
[1] 入力者 桜 三郎（03:40 入力終了） ／ 確認者 桜 四郎（あなた）
[2] せり場で決まった最終結果を確認します。誤りがある行はチェックを外し、入力者に差し戻してください。
┌─ [3] 結果一覧（12件・選択 11件）─────────────────────────────────────────────────┐
│ ☑ No ロット   品目 数量  単価    金額     買受人  種別      資格             上限      │
│ ☑ 1  L…-21  鰤  40kg ¥900  ¥36,000  N03  仲卸      許可 有効          —         │
│ ☑ 2  L…-22  鰤  35kg ¥850  ¥29,750  B07  売買参加者 承認 有効          ⚠超過 [4]  │
│ ☐ 3  L…-23  鯖  20kg ¥300  ¥6,000   B11  売買参加者 承認 失効 ✖確定不可 [5]       │
│ …                                                                         │
└────────────────────────────────────────────────────────────────────────────┘
┌─ [4] 参加上限超過の理由（売買参加者のみ）───────────────────────────────────────┐
│ B07 サンプル売買参加者7: 今期上限 ¥3,000,000 / 確定済 ¥2,990,000 / 本回 ¥29,750       │
│ 理由 (1)事前了承済 (2)保証金追加予定 (3)その他 [備考        ]                         │
│ [6] ☐ この買受人の本回の超過行すべてに同じ理由を適用（各行に記録）                       │
└────────────────────────────────────────────────────────────────────────────┘
[7] 入力者本人が確認する理由 [            ]  ← 入力者=確認者 のときだけ表示・必須、要確認に表示
[8] 合計 11件 ¥412,350（相対とは別に集計）
[9] [ この回の結果を確定する（11件） ]  [10] 差し戻し（チェックを外した行）  [11] キャンセル
```

## 3. Item

| No | Item | Loại | Bắt buộc | Quy tắc | Nguồn |
|---|---|---|---|---|---|
| 1 | 入力者 / 確認者 | Nhãn | — | Hiện hai tên; trùng người → nhãn vàng | S2, PRM-115 |
| 2 | Hướng dẫn | Nhãn | — | | FR-SERI-02 |
| 3 | Bảng kết quả | Bảng chọn | — | Bố cục FORM-SERI-01; cột 資格 ghi đúng **許可 (仲卸) / 承認 (売買参加者)**; kiểm lại tư cách + SL **tại lúc xác nhận** | BR-PERM-01, FT-01-05 |
| 4 | Khối lý do vượt 参加上限 | Vùng | Khi có dòng vượt | **Chỉ 売買参加者** (仲卸 không có hạn mức); hạn mức theo kỳ, chung 相対 + せり; chọn lý do nhanh + 備考; không chặn cứng | L4-A04 (1), ACT-03, M20 |
| 5 | Dòng không chốt được | Nhãn đỏ | — | Tư cách 失効 / 一時停止 / SL không đủ → bỏ chọn tự động, lý do cạnh dòng | BR-PERM-01, BR-LOT-02 |
| 6 | Áp cùng lý do | Checkbox | — | Một người mua trong phiên; vẫn lưu từng dòng (Muốn có) | L4-A04 (1) |
| 7 | Lý do tự xác nhận | Văn bản | Khi 入力者 = 確認者 | Hiện ở tab 要確認 của SC-07-01 và checklist SC-07-02 | S2, PRM-115 |
| 8 | Tổng | Nhãn | — | | — |
| 9 | 確定する | Nút | — | C-31 → ghi 確認者 + thời điểm, trừ sổ SL; **không MFA** (không ở danh sách PREMISE §3.2); **bắt buộc online** | CAP-HUMAN-01, L4-A05 |
| 10 | 差し戻し | Nút | — | Dòng bỏ chọn quay về 入力者 sửa ở SC-05-01 | FR-SERI-02 |
| 11 | キャンセル | Nút | — | | — |

## 4. Trạng thái

| Trạng thái | Hiển thị |
|---|---|
| Phiên đã xác nhận | Chỉ đọc + 「確定済（桜 四郎 03:52）」; sửa sau đó → SC-04-05 (chưa khóa) / SC-08-01 (đã khóa) |
| Không có dòng | C-21 + liên kết về SC-05-01 |
| Thiếu lý do vượt hạn mức | [9] mờ, dòng thiếu tô viền đỏ (C-22) |
| SL đổi do 相対 chốt trước | C-23, dòng chuyển [5] |
| Ngày đã khóa | C-24 |
| Mất mạng | C-28: không xác nhận được |

## 5. Khác biệt theo vai

| Vai | Thấy |
|---|---|
| TRADE ≠ 入力者 | Toàn màn |
| TRADE = 入力者 | Toàn màn + [7] bắt buộc |
| SETTLE / STL-HEAD / OPS-HEAD | Chỉ đọc (không [4], [6], [7], [9], [10]) |

## 6. To-be khác prototype

| # | Prototype | To-be | Nguồn |
|---|---|---|---|
| 1 | Ô lý do cho mọi dòng, kể cả 仲卸, gõ tự do | Chỉ dòng 売買参加者 vượt hạn mức; chọn nhanh + áp cùng lý do | M20, L4-A04 (1) |
| 2 | Hạn mức theo 業務日 | Theo kỳ, chung 相対 + せり | M19, D08 |
| 3 | Xác nhận tất cả dòng | Bỏ chọn dòng sai + 差し戻し | FT-05-02 |
| 4 | Cột 資格 chưa có | Có, ghi đúng 許可 / 承認 | luật 2 |

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
