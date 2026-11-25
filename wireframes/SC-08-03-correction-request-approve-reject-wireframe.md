---
id: WF-SC-08-03
title: Wireframe SC-08-03 修正申請承認・却下
status: draft
version: "0.1.0"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [FT-08-02, FT-08-03, FR-CORR-02, FR-CORR-03, 07-03, D.4, CAP-HUMAN-01, PRM-120, E-08, GOV-RULE-01, M13, D07, ADR-004, ADR-006, ADR-002]
---

# SC-08-03 修正申請承認・却下 — wireframe

| Mục | Nội dung |
|---|---|
| Vai trò màn | **Quyết định** — duyệt / từ chối điều chỉnh sau khi chốt. Duyệt **không sửa GD gốc**: sinh bản ghi REVERSE + DELTA ở 業務日 chưa khóa sớm nhất (luật 4) |
| Vai ghi | Cấp 1: STL-HEAD (hoặc OPS-HEAD thay); cấp 2: OPS-HEAD (◎, MFA — P27, P28). Người lập không duyệt; một người không duyệt cả 2 cấp (S3) |
| Thiết bị | PC |

## 1. Prototype (as-is)

![SC-08-03 prototype](assets/SC-08-03_prototype.png)

`/corrections/[id]`, stlhead@, yêu cầu mẫu đã duyệt 2 cấp (dữ liệu 「サンプル」). Có: trạng thái, GD đích, lý do, 3 người, bảng 訂正前 / 訂正後, bảng 取消・差額 đã sinh.

## 2. Wireframe to-be (yêu cầu đang chờ cấp 1)

```
[1] 状態 承認待ち（1次）  [2] 必要な承認 2段階（差額 ¥300,000 ≥ 閾値 ¥100,000 — 規則版 第3版）
[3] 対象取引 相対-0005（2027/08/02・締め済）→ 取引詳細
[4] 種類 単価・買受人の訂正   [5] 理由 「買受人の取り違え…」   [6] 証憑 伝票スキャン.pdf（1件）
[7] 申請者 桜 三郎 08/03 08:40 ／ 1次 — ／ 2次 —        [8] 経過 1営業日（2営業日超で警告）
┌─ [9] 訂正内容 ────────────────────────────────────────────────────┐
│        買受人             数量   単価     金額                       │
│ 訂正前  N04 サンプル仲卸4   60   ¥1,900   ¥114,000                   │
│ 訂正後  N01 サンプル仲卸1   60   ¥6,900   ¥414,000                   │
└─────────────────────────────────────────────────────────────────┘
┌─ [10] 承認すると作成される記録（元の取引は変更しません）──────────────────────┐
│ 計上業務日 2027/08/04（未締めの最も早い業務日）                               │
│ 取消  N04  −60  −¥114,000 ／ 差額  N01  +60  +¥414,000                    │
│ [11] 影響: 2027-07期 期ロック済 → 奨励金差分は次期（2027-08期）に計上            │
└─────────────────────────────────────────────────────────────────┘
[12] 却下理由 [                       ]（却下時必須）
[13] [ 1次承認する ]   [14] [ 却下する ]   → C-31 → C-30 MFA
[15] 承認履歴: 申請 08:40 桜 三郎 …（監査ログへ）
```

## 3. Item

| No | Item | Loại | Quy tắc | Nguồn |
|---|---|---|---|---|
| 1 | Trạng thái | Nhãn | 承認待ち（1次）/（2次）/ 承認・反映済 / 却下 | FR-CORR-02 |
| 2 | Số cấp cần duyệt | Nhãn | Ngưỡng lấy từ **quy chế có version đang hiệu lực** (tạm 100.000 JPY, E-08), ghi số version | M13, D07, PREMISE §3.1 |
| 3 | GD đích | Liên kết | → SC-04-04 | — |
| 4 | Loại | Nhãn | SL / đơn giá / người mua / thiếu-trả / đổi 完納 | FT-08-01 |
| 5 | Lý do | Nhãn | | FORM-CORR-01 |
| 6 | Chứng từ | Liên kết | Xem file | M11 |
| 7 | Người lập / cấp 1 / cấp 2 | Nhãn | Kèm "代行: thay cho …" nếu có | S3, S8 |
| 8 | Thời gian chờ | Nhãn | > 2 営業日 → vàng | FR-NOTIFY-03 |
| 9 | Bảng 訂正前 / 訂正後 | Bảng | | — |
| 10 | Bản ghi sẽ sinh | Bảng | REVERSE (người mua cũ) + DELTA (người mua mới), 業務日 đích | ADR-004, PRM-120 |
| 11 | Ảnh hưởng 奨励金 | Nhãn | Kỳ đã 期ロック → delta kỳ sau; không hồi tố 完納 | PRM-043, ADR-007 |
| 12 | Lý do từ chối | Văn bản | Bắt buộc khi từ chối, ≤ 200 | — |
| 13 | Duyệt | Nút | Nhãn đổi theo cấp: 「1次承認する」 / 「2次承認する（反映）」; ẩn nếu người xem là người lập hoặc đã duyệt cấp 1 | S3 |
| 14 | Từ chối | Nút | | — |
| 15 | Lịch sử | Bảng | Liên kết SC-13-01 | FR-AUDIT-01 |

## 4. Trạng thái

| Trạng thái | Hiển thị |
|---|---|
| Người xem là người lập | Nút [13] [14] ẩn; câu 「申請者本人は承認できません」 |
| Đã duyệt cấp 1 bởi người xem | Câu 「1次と2次を同じ人は承認できません」 |
| Chờ cấp 2 | [1] 「承認待ち（2次）」, [7] có tên cấp 1 |
| Đã phản ánh | Chỉ đọc; [10] hiện bản ghi thật (như prototype) |
| Bị từ chối | Chỉ đọc + lý do |
| GD đích có yêu cầu khác đang chờ | Không xảy ra (tối đa 1 yêu cầu chờ / GD) |
| Mất mạng | C-28 |

## 5. Khác biệt theo vai

| Vai | Thấy |
|---|---|
| STL-HEAD | Nút cấp 1 (khi không phải người lập) |
| OPS-HEAD | Nút cấp 2; nút cấp 1 khi thay STL-HEAD |
| TRADE / DELIVERY / SETTLE (người lập) | Chỉ đọc yêu cầu của mình + các yêu cầu khác theo 閲 |

## 6. To-be khác prototype

| # | Prototype | To-be | Nguồn |
|---|---|---|---|
| 1 | Ngưỡng 2 cấp hằng số 300.000 | Tham số quy chế có version, tạm 100.000; hiện ở [2] | M13, D07 |
| 2 | Không MFA | C-30 | M02, ADR-002 |
| 3 | Không xem trước bản ghi sẽ sinh trước khi duyệt | [10], [11] | FR-CORR-02 |
| 4 | Không chứng từ, không đếm thời gian chờ | [6], [8] | M11, FR-NOTIFY-03 |

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu | 2026-11-25 | phuongnnm-23344 | |
