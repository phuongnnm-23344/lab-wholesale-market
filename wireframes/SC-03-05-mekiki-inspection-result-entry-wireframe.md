---
id: WF-SC-03-05
title: Wireframe SC-03-05 目利き・下見結果入力
status: draft
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [FT-03-02, FR-LOT-02, CAP-HUMAN-01, SCOPE-OUT-01, SCOPE-OUT-02, ADR-010]
---

# SC-03-05 目利き・下見結果入力 — wireframe

| Mục | Nội dung |
|---|---|
| Vai trò màn | **Nhập kết quả do người đánh giá quyết** (CAP-HUMAN-01). Hệ thống **không** chấm, không gợi ý hạng, không OCR / AI (SCOPE-OUT-01/02, ADR-010) |
| Vai ghi | JUDGE (◎). Đọc: SETTLE, STL-HEAD, OPS-HEAD (P14) |
| Thiết bị | PC/TAB (hai bố cục; tablet: nút hạng to) |

## 1. Prototype (as-is)

![SC-03-05 prototype](assets/SC-03-05_prototype.png)

`/lots/inspection`, judge@. Có: chọn nhiều lô, 等級 + 所見, câu 「システムは判定しません」.

## 2. Wireframe to-be

```
[1] 等級・鮮度は担当者が判断して入力します（システムは判定しません）
[2] 絞込: 品目 [全て▼] 出荷者/船 [全て▼] 状態 [未下見▼]           [3] 選択中 3件
┌─ [4] ─────────────────────────────────────────────────────────────────┐
│ ☑ ロット番号      出荷者      品目   数量    状態     前回の記録            │
│ ☑ L20270802-3   第一丸      真鯛   118kg  受付済   —                     │
│ ☑ L20270802-4   第一丸      真鯛    95kg  受付済   —                     │
│ ☐ L20270802-7   第二丸      鰤     60kg  下見済   B / 桜 二郎 03:10       │
└──────────────────────────────────────────────────────────────────────┘
┌─ [5] 結果入力（選択した 3件に同じ内容を記録）──────────────────────────────┐
│ [6] 等級   ( A ) ( B ) ( C ) ( 規格外 )   ← 大きなボタン                  │
│ [7] 所見   [ 色つや良好、身締まりやや弱い                 ]               │
│ [8] 確認者  [ 社員番号 ____ ]（任意。二人で確認した場合）                    │
│ [9] 取引済ロットの再記録理由 [                ]（取引後のみ必須）            │
│ [10] [ 記録する（3件） ]                                              │
└──────────────────────────────────────────────────────────────────────┘
 記録後: C-12 「目利き記録：3件（A）記録者 桜 二郎 03:25」。前回の記録は消えず履歴に残る
```

## 3. Item

| No | Item | Loại | Bắt buộc | Quy tắc | Nguồn |
|---|---|---|---|---|---|
| 1 | Câu nguyên tắc | Nhãn | — | Luôn hiện | CAP-HUMAN-01 |
| 2 | Bộ lọc | Chọn | — | 品目, 出荷者 / tàu, trạng thái | FT-03-02 |
| 3 | Số đã chọn | Nhãn | — | | — |
| 4 | Bảng lô | Bảng chọn nhiều | — | Lô của 業務日 đang mở; cột 前回の記録 = bản ghi gần nhất | FR-LOT-02 |
| 5 | Khối nhập | Vùng | — | Áp một kết quả cho các lô đã chọn, **lưu từng lô một dòng** | FT-03-02 |
| 6 | 等級 | Nút chọn | ✓ | Danh mục hạng theo quy chế của chợ (chờ fixture, L4-A02); **không có giá trị mặc định** | CAP-HUMAN-01 |
| 7 | 所見 | Văn bản | — | ≤ 200 ký tự | — |
| 8 | 確認者 | Mã nhân viên | — | Người thứ hai (nếu có) | FT-03-02 |
| 9 | Lý do ghi lại | Văn bản | Khi lô đã có GD | Ghi lại không xóa bản cũ (append-only) | luật 4 |
| 10 | 記録する | Nút | — | Ghi người ghi + thời điểm; lô → 下見済 | — |

## 4. Trạng thái

| Trạng thái | Hiển thị |
|---|---|
| Không có lô | C-21 「下見対象のロットはありません」 |
| Chưa chọn lô / chưa chọn hạng | [10] mờ + lý do ngay cạnh nút |
| Lô đã có GD | Dòng có nhãn 「取引あり」; [9] bắt buộc |
| Ngày đã khóa | C-24 |
| Mất mạng | C-28: tablet giữ dữ liệu đang nhập, không lưu được (màn này không thuộc danh sách offline L4-A05) — **câu hỏi Q-SC0305-01** |

## 5. Khác biệt theo vai

JUDGE: toàn màn. SETTLE / STL-HEAD / OPS-HEAD: xem kết quả ở SC-03-04 (lịch sử 目利き). INTAKE, TRADE: thấy [前回の記録] qua SC-03-03 / SC-04-01 [2], không vào màn này.

## 6. To-be khác prototype

| # | Prototype | To-be | Nguồn |
|---|---|---|---|
| 1 | 等級 mặc định 「A」 trong ô chọn | **Không mặc định** — tránh ghi nhầm hạng thay người đánh giá | CAP-HUMAN-01 |
| 2 | Không có [2], [8], [9] | Có | FT-03-02, luật 4 |
| 3 | Ô chọn nhỏ | Nút to cho tablet | PRM-086 |

## 7. Câu hỏi

- Q-SC0305-01: 目利き có cần ghi offline ở bến không? Giả định: không (chỉ 仮受付, giao, 紙伝票後入力 — L4-A05). Sai → thêm vào hàng đợi offline, +effort nhỏ ở ADR-008.

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
