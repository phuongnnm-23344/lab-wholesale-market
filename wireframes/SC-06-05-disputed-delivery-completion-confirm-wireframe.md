---
id: WF-SC-06-05
title: Wireframe SC-06-05 争いのある引渡し完了確認
status: draft
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [FT-06-05, CAP-HUMAN-01, PRM-111, FR-DEL-04, M16, ADR-008, ADR-002]
---

# SC-06-05 争いのある引渡し完了確認 — wireframe (màn mới, mức wireframe)

| Mục | Nội dung |
|---|---|
| Vai trò màn | **Quyết định** — 配送部門責任者 kết luận lần giao có tranh chấp (CAP-HUMAN-01) |
| Vai ghi | DEL-HEAD (◎, MFA — P22). **Cấm tự xác nhận** lần giao do chính mình ghi (S1, PRM-111). Đọc: SETTLE, STL-HEAD, OPS-HEAD |
| Thiết bị | PC/TAB — làm ở bến hoặc PC văn phòng; **không làm khi mất mạng** (đi đường giấy) |

## 1. Prototype (as-is)

Không có (M16): enum DEL_HEAD có nhưng không tài khoản demo, không màn. Không ảnh.

## 2. Wireframe to-be

```
[1] 確認待ち（3件）  絞込: (自分が確認できるもの) (すべて)
┌──────────────────────────────────────────────────────────────────────────┐
│ 受付時刻 取引        買受人  内容           記録者   入力方法          SLA残   │
│ ▶07:20  相対-0005   N01   鮮度不良の申し出 桜 次郎  紙→後入力 D-000123  3h10m │
│  08:02  せり-0302   B07   数量の相違      桜 十郎  現場             —(自分) │
└──────────────────────────────────────────────────────────────────────────┘
┌─ [2] 相対-0005 の詳細 ────────────────────────────────────────────────────┐
│ [3] 確定 30kg / 引渡済 12kg / 例外 2kg   [4] 申し出内容「…」                    │
│ [5] 紙の確認票 D-000123: 紙で確認 07:05（署名: 桜 十郎）／ 入力 09:12（桜 次郎）    │
│     [6] スキャンを表示（確認票スキャン.pdf）                                     │
│ [7] 結論 (引渡し完了とする) (一部返品として完了) (継続協議 → 紛争へ)               │
│ [8] コメント [                                          ]                   │
│ [9] [ 確認する ]  → C-31 → C-30 MFA     [10] 紛争詳細 → SC-07-04              │
└──────────────────────────────────────────────────────────────────────────┘
 完了後の記録表示: 「紙で確認 07:05 ／ 入力 09:12 ／ システム確認 09:20（桜 十郎、MFA済）」
```

## 3. Item

| No | Item | Loại | Quy tắc | Nguồn |
|---|---|---|---|---|
| 1 | Danh sách chờ | Bảng chọn | Mặc định 「自分が確認できるもの」 (loại dòng do chính mình ghi); cột SLA còn lại | FR-DEL-04, S1 |
| 2 | Khối chi tiết | Vùng | | — |
| 3 | SL | Nhãn | | — |
| 4 | Nội dung tranh chấp | Nhãn | | FT-06-04 |
| 5 | **Phiếu giấy** | Nhãn | Chỉ khi nhập bù: số phiếu, **「紙で確認 hh:mm」 và 「入力 hh:mm」** + người ký | ADR-008 §2.4 |
| 6 | Bản scan | Liên kết | Để đối chiếu chữ ký | E-21 |
| 7 | Kết luận | Nút chọn | Bắt buộc | CAP-HUMAN-01 |
| 8 | Bình luận | Văn bản | Bắt buộc khi 継続協議 | — |
| 9 | 確認する | Nút | Ẩn nếu người xem là người ghi lần giao; với phiếu giấy chỉ **đúng người đã ký** [5] mới thấy nút; C-31 → C-30 MFA | S1, ADR-008 §2.4, ADR-002 |
| 10 | Tranh chấp | Liên kết | → SC-07-04 | FT-07-05 |

## 4. Trạng thái

| Trạng thái | Hiển thị |
|---|---|
| Không có mục chờ | C-21 |
| Dòng do chính mình ghi | Nhãn 「自分の記録のため確認できません」, [9] ẩn |
| Phiếu giấy, người xem ≠ người ký | 「紙で署名した 桜 十郎 が確認します」, [9] ẩn |
| Quá SLA | Dòng đỏ; vẫn xác nhận được |
| Mất mạng | C-28: 「通信断中は確認できません。紙の確認票に署名してください」 |
| Đã xác nhận | Chỉ đọc với 3 mốc giờ |

## 5. Khác biệt theo vai

DEL-HEAD (không phải người ghi): toàn màn. DEL-HEAD = người ghi: chỉ đọc dòng đó. DELIVERY: xem trạng thái ở SC-06-01. SETTLE / STL-HEAD / OPS-HEAD: chỉ đọc + SC-07-03.

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu, nhãn 「紙で確認 / 入力」 theo ADR-008 §2.4 | 2026-11-25 | phuongnnm-23344 | |
