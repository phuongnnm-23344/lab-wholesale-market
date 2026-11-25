---
id: WF-SC-03-07
title: Wireframe SC-03-07 オフライン同期・照合
status: draft
version: "0.2.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [FT-03-06, FT-06-07, NFR-AVL-02, DEC-004, BR-LOT-02, BR-CLOSE-01, L4-A05, M04, ADR-005, ADR-008]
---

# SC-03-07 オフライン同期・照合 — wireframe (màn mới, mức wireframe)

| Mục | Nội dung |
|---|---|
| Vai trò màn | **Quyết định / phục hồi** — sau mất mạng, bản ghi lưu cục bộ (仮受付, 引渡し, 紙伝票後入力) được gửi lên; bản nào xung đột thì **người quyết** giữ / bỏ / sửa, hệ thống **không tự gộp** |
| Vai ghi | INTAKE (仮受付), DELIVERY (引渡し), TRADE (紙伝票後入力 — xem ở SC-04-07). Đọc: SETTLE, STL-HEAD |
| Thiết bị | PC/TAB |

## 1. Prototype (as-is)

Không có (M04: prototype chỉ online). Không ảnh.

## 2. Wireframe to-be

```
[1] 端末 TAB-03（配送）  最終同期 07:12  未同期 5件 → 送信済 3件 ／ 要判断 2件
┌─ [2] 同期結果 ───────────────────────────────────────────────────────────────┐
│ 記録時刻 種類    対象          内容            記録者   結果                       │
│ 06:58   引渡し  相対-0005 N01  6kg             桜 次郎  ✔ 反映済                  │
│ 07:03   引渡し  相対-0011 N01  2箱             桜 次郎  ✔ 反映済                  │
│ 07:05   引渡し  相対-0005 N01  残り全部(18kg)    桜 次郎  ⚠ 要判断: 残を超える [3]    │
│ 07:08   仮受付  K-020 鯖 50kg                  桜 一郎  ⚠ 要判断: 重複の疑い K-019  │
└──────────────────────────────────────────────────────────────────────────┘
┌─ [3] 要判断: 相対-0005 引渡し ─────────────────────────────────────────────────┐
│ 端末の記録: 残り全部 18kg（07:05）  ／ サーバーの現在: 残 12kg（別端末で 6kg 記録 06:58）│
│ [4] 判断 (12kg に修正して反映) (反映しない) (例外登録へ → SC-06-04)                │
│ [5] 理由 [                    ]                                               │
│ [6] [ 判断を確定 ]                                                            │
└──────────────────────────────────────────────────────────────────────────┘
[7] すべて判断済になるまで、この端末は「未同期あり」として日次締めのチェックに表示されます
```

## 3. Item

| No | Item | Loại | Quy tắc | Nguồn |
|---|---|---|---|---|
| 1 | Tóm tắt máy | Nhãn | Mã máy, giờ đồng bộ cuối, số chưa / đã gửi / cần quyết | ADR-008 |
| 2 | Danh sách | Bảng | Giữ giờ ghi thật trên máy + người ghi (PIN) | NFR-AVL-02 |
| 3 | Chi tiết xung đột | Vùng | So bản ghi máy với dữ liệu server hiện tại | — |
| 4 | Quyết định | Nút chọn | Sửa rồi phản ánh / không phản ánh / sang ngoại lệ; **đồng bộ không bao giờ làm SL lô âm** | BR-LOT-02, L4-A05 |
| 5 | Lý do | Văn bản | Bắt buộc với "không phản ánh" và "sửa" | luật 4 |
| 6 | 判断を確定 | Nút | Audit ghi người quyết + bản ghi máy gốc (không xóa) | FR-AUDIT-01 |
| 7 | Liên hệ khóa ngày | Nhãn | Máy còn bản ghi chưa đồng bộ = dòng ✖ SC-07-02 [8]; bản ghi của ngày đó còn 要判断 = dòng ✖ SC-07-02 [7] | ADR-005 |
| 8 | Bản ghi của ngày đã khóa | Nút chọn | Hai lối: 「修正申請（後入力）を作成」 → mở SC-08-01 loại `LATE_ENTRY` điền sẵn từ bản ghi máy (GD / lô / lần giao mới, tham chiếu **ngày gốc**); 照合部門長 決裁 (2 cấp nếu ≥ ngưỡng); duyệt xong ghi sổ vào 業務日 đang mở, **ngày GD thật = ngày gốc**, kỳ theo ngày gốc. Hoặc 「反映しない」 + lý do. Cùng một đường với 紙伝票後入力 cho ngày đã khóa (ADR-008 §2.2-6) | BR-CLOSE-01, ADR-005, ADR-008 |

## 4. Trạng thái

| Trạng thái | Hiển thị |
|---|---|
| Không xung đột | Tất cả ✔; C-29 rồi đóng |
| Vẫn mất mạng | C-28; danh sách chờ gửi, không quyết được |
| Bản ghi thuộc ngày đã khóa | ⚠ 「締め済の業務日です」 → [8]: 「修正申請（後入力）を作成」 hoặc 「反映しない」 (C-24). Không ghi thẳng vào ngày đã khóa, không đổi sang ngày khác mà không có duyệt |
| Bản ghi từ máy đã 「端末回収不能」 | Luôn vào 要判断 với nhãn 「回収不能登録後に届いた記録」; xử lý như trên (đối chiếu với bản nhập lại từ giấy để tránh trùng) |
| PIN offline hết hạn trên máy | Bản ghi giữ, cần người ghi đăng nhập online để gửi (M03, E-18) |

## 5. Khác biệt theo vai

INTAKE thấy bản ghi 仮受付; DELIVERY thấy 引渡し; người dùng chỉ quyết bản ghi thuộc vai mình. SETTLE / STL-HEAD: chỉ đọc mọi máy (để kiểm trước khi khóa ngày).

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.2.0 | Update | Gate 1 M-05: bản ghi của ngày đã khóa đi 修正申請 loại LATE_ENTRY (ngày GD thật = ngày gốc, có duyệt) hoặc 反映しない — cùng đường với ADR-008; bản ghi từ máy 端末回収不能 (khách #1) | 2026-11-25 | phuongnnm-23344 | |
