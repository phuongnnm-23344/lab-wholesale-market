---
id: WF-COMMON-001
title: Khung màn và trạng thái dùng chung cho wireframe
status: draft
version: "0.2.1"
updated_by: phuongnnm-23344
updated: 2026-11-25
related: [SCREEN-LIST.md, ADR-002, ADR-005, ADR-008, PREMISE §3.2, L4-A05, L4-A07]
---

# Khung màn và trạng thái dùng chung

Mọi wireframe trong thư mục này dùng chung khung và các khối trạng thái dưới đây. Mỗi wireframe chỉ đánh số item **riêng của màn** (1, 2, 3…); item dùng chung mang tiền tố `C-` và không đánh lại ở từng màn. P3 dùng cả hai bộ số làm cột No của Screen Specification BM-2-901-51: số `C-` chỉ ghi một lần ở `specs/_common/`, số của màn giữ nguyên thứ tự ở đây.

**Quy tắc giữ số ổn định:** thêm item mới → lấy số kế tiếp ở cuối, không chèn giữa; bỏ item → giữ số, ghi "(bỏ)" ở bảng item. Không đánh lại số giữa các version.

## 1. Khung PC (1366 × 900, テンキー)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│[C-1] 水産物卸売市場 業務支援システム   [C-2]業務日 2027/08/02(月)  [C-3]●オンライン      │
│                                      [C-4]取引担当 桜 太郎  [C-5]利用者切替  [C-6]ログアウト │
├────────────┬─────────────────────────────────────────────────────────────────┤
│[C-7] メニュー│ [C-8] ホーム › 取引 › 相対取引入力・確定                                 │
│ 取引        │ [C-9] 画面タイトル                                 [C-10] 画面の右上ボタン │
│  相対取引入力 │ ─────────────────────────────────────────────────────────────── │
│  取引一覧    │ [C-11] バナー領域（オフライン / ロック済み / 決裁待ち / 通知）               │
│ ロット       │                                                                 │
│ …          │   (nội dung riêng của màn: item 1, 2, 3 …)                       │
│            │                                                                 │
│            │ [C-12] トースト（上中央、5〜7秒、保存内容を表示）                          │
└────────────┴─────────────────────────────────────────────────────────────────┘
```

## 2. Khung tablet (1024 × 1366 dọc, đeo găng)

```
┌──────────────────────────────────────────────┐
│[C-13]ホーム [C-2]業務日 2027/08/02  [C-3]●オンライン  │
│        [C-4]配送担当 桜 次郎   [C-5]利用者切替     │
├──────────────────────────────────────────────┤
│[C-11] バナー: オフライン・未同期 3件（常時表示）     │
│                                              │
│  (nội dung riêng; nút ≥ 64px, chữ ≥ 20px,     │
│   viền đậm, tương phản cao — FB LAB-2 #13)     │
└──────────────────────────────────────────────┘
```

### 2.1 ホーム trên tablet (C-14) — Q-WF-02 đã trả lời [Customer giả lập, 2026-11-25]

```
┌──────────────────────────────────────────────┐
│ [C-4]配送部門責任者 桜 十郎   [C-5]利用者切替       │
│ ┌────────────────┐ ┌────────────────┐         │
│ │ 引渡し記録        │ │ 引渡し状況（閲覧） │         │
│ └────────────────┘ └────────────────┘         │
│ ┌────────────────┐ ┌────────────────┐         │
│ │ 争いの確認待ち  1 │ │ 照合が必要  2     │         │
│ └────────────────┘ └────────────────┘         │
└──────────────────────────────────────────────┘
```

## 3. Bảng item dùng chung

| No | Item | Loại | Nội dung / quy tắc | Vai thấy | Nguồn |
|---|---|---|---|---|---|
| C-1 | Tên hệ thống | Nhãn | Không có chữ 「試作」「サンプル」 ở bản thật. Môi trường thử: băng màu 「検証環境」 trên cùng | Mọi vai | M01 |
| C-2 | 業務日 | Nhãn | `YYYY/MM/DD(曜)`; ngày đã khóa thêm nhãn 「締め済」 | Mọi vai | FR-SETTLE-02, PRM-116 |
| C-3 | Trạng thái mạng | Nhãn | ●オンライン (xanh) / ●オフライン (đỏ) + chữ, không chỉ màu (09-05) | Vai hiện trường; PC văn phòng ẩn khi online | ADR-008, L4-A05 |
| C-4 | Người đang dùng | Nhãn | Vai + tên (không 「様」), chữ to, **luôn thấy** — máy dùng chung | Mọi vai | FT-02-04, FB LAB-2 #15 |
| C-5 | 利用者切替 | Nút | → SC-00-02; đổi người = hết hiệu lực MFA (C-30). Trên tablet: mã nhân viên + PIN nhập bằng **bàn số to** (phím ≥ 64px như SC-06-02), không bật bàn phím ảo của máy (khách #24) | INTAKE, JUDGE, TRADE, DELIVERY (+ quyền trưởng) | ADR-002, PERSONA-DOCK-01 |
| C-6 | ログアウト | Nút | Xác nhận nếu còn dữ liệu chưa đồng bộ | Mọi vai | — |
| C-7 | Menu nhóm | Điều hướng | Chỉ hiện nhóm có quyền (đọc hoặc ghi); 相対取引 đứng đầu nhóm 取引; số chờ duyệt cạnh 修正申請 | Theo role-list | TBL-ROLE-01, FB LAB-2 #14 |
| C-8 | Breadcrumb | Điều hướng | | Mọi vai | — |
| C-9 | Tiêu đề màn | Nhãn | Tên đúng 画面名 ở SCREEN-LIST | Mọi vai | — |
| C-10 | Nút góc phải | Nút | Theo màn (vd. 「一覧へ」) | Theo màn | — |
| C-11 | Vùng banner | Vùng | Chứa các banner §4, tối đa 2 cùng lúc, ưu tiên: オフライン > ロック済み > 決裁待ち > 通知 | Theo banner | — |
| C-12 | Toast | Thông báo | Lớn, trên giữa, 5–7 giây, ghi nội dung vừa lưu (vd. 「確定：N01 …」) | Mọi vai | FB LAB-2 #9 |
| C-13 | Nút ホーム tablet | Nút | Ẩn menu trái trên tablet. Nút ghi **chữ 「ホーム」** (không dùng ký hiệu 「≡」 — người lớn tuổi không hiểu), to, **luôn ở cùng một chỗ** (góc trái trên) → C-14 | Vai hiện trường | FB LAB-2 #13, khách #32 |
| C-14 | ホーム tablet (lưới nút theo vai) | Màn | Mỗi vai **4–6 nút**, **thứ tự cố định** (không tự đổi chỗ theo tần suất dùng); nút có **số đếm việc chờ** (vd. 「仮受付待ち 3」, 「照合が必要 2」, 配送部門責任者: 「争いの確認待ち 1」). Tên người đang dùng + 利用者切替 luôn thấy. Q-WF-02 đã trả lời | Vai hiện trường | khách Q-WF-02, #32 |

## 4. Trạng thái dùng chung

| No | Trạng thái | Khi nào | Hiển thị | Thao tác | Nguồn |
|---|---|---|---|---|---|
| C-20 | Đang tải | Gọi API > 300 ms | Khung xương (skeleton) trong vùng nội dung, nút chính mờ | — | NFR-PERF-01 |
| C-21 | Rỗng | Không có dữ liệu | Khung nét đứt + câu nói rõ vì sao rỗng và việc kế tiếp (vd. 「本日の販売公開ロットはありません。ロット一覧で公開してください →」) | Liên kết sang màn liên quan | — |
| C-22 | Lỗi nhập | Validate phía client / 422 (`E-CMN-007` hoặc mã feature — DEC-052, `specs/_common/api-conventions.md`) | Chữ đỏ **ngay dưới ô sai** + viền đỏ; con trỏ về ô sai đầu tiên. Không chỉ dùng toast | Sửa ô | FB LAB-2 #4 |
| C-23 | Lỗi nghiệp vụ | 409 (`CONFLICT:` SL đổi, chốt trùng, quota) | Hộp lỗi trên form, nói nguyên nhân + số thật (vd. 「残数量が 12kg に変わりました」) | Nạp lại số, thử lại | ADR-004 |
| C-24 | **Ngày đã khóa (423)** = SC-00-05 | API trả 423 `DAY_LOCKED` / kỳ đã 期ロック | Banner vàng: 「2027/08/02 は締め済みのため直接修正できません。訂正は修正申請で行います。」 + nút 「修正申請を作成 →」 (SC-08-01, mang theo mã GD). Form khóa chỉ đọc. **Nếu 423 xảy ra khi đang nhập** (ngày bị khóa giữa chừng): không xóa nội dung đã gõ; nút mang sẵn nội dung đó sang SC-08-01 (vd. SC-04-05 — khách #5) | → SC-08-01 | BR-CLOSE-01, FT-08-04, ADR-005 |
| C-25 | Không có quyền | 403 hoặc vai không có ô ghi | Trường hiện chỉ đọc; nút ghi ẩn (không hiện nút mờ gây hiểu lầm); vào thẳng URL → trang 「この画面を表示する権限がありません」 | — | TBL-ROLE-01, L4-A06 |
| C-26 | Lỗi hệ thống | 5xx / timeout | Banner đỏ + mã lỗi để báo IT; dữ liệu đang nhập giữ nguyên | Thử lại | NFR-OPS-01 |
| C-27 | **Chờ duyệt** | Bản ghi có 修正申請 / version / đổi tư cách đang chờ | Nhãn 「決裁待ち（1次）」/「決裁待ち（2次）」/「確認待ち」 cạnh bản ghi; nút sửa khác ẩn; liên kết tới yêu cầu. **Không dùng chữ 「承認待ち」** cho bước nội bộ — chữ 承認 chỉ dành cho 承認（売買参加者）(luật 2, PRM-121, L4-D03; khách #19) | → SC-08-03 / SC-10-04 / SC-01-05 | FR-CORR-02, GOV-RULE-01 |
| C-28 | **Mất mạng** | Mất kết nối | Thanh đỏ cố định dưới header: 「オフライン — 未同期 3件（最終同期 04:12）」. Màn được phép offline (仮受付, 引渡し, 紙伝票後入力) vẫn lưu cục bộ; màn chốt (相対, せり確認) và **mọi hành động duyệt bị chặn** với câu 「通信が回復するまで確定できません。紙伝票で継続してください」 | Có mạng lại → nút 「同期・照合へ」 (SC-03-07) nếu có xung đột | ADR-008, L4-A05, DEC-004 |
| C-29 | Có mạng lại | Sau C-28 | Banner xanh 5 giây: 「オンラインに復帰しました。未同期 3件を送信中…」; thao tác vừa bấm hiện 確定済 / 未確定 | — | ADR-008 |
| C-30 | **MFA step-up** | Trước hành động ở PREMISE §3.2 khi chưa có MFA hợp lệ | Hộp thoại: 「この操作の前に本人確認を行います」 + ô mã 6 số + 「確認」/「キャンセル」; dòng nhỏ 「確認後 10 分間、同じ利用者・同じ端末では再入力不要です（3 分操作がないと無効）」. **Hành động không quay lại được** (日次締め, 期ロック, rollback quy chế, duyệt xóa vật lý) **luôn hỏi lại mã**. Trên tablet: **bàn số to** như SC-06-02, không bật bàn phím ảo nhỏ (khách #23). Sai 5 lần → khóa tạm. Offline → không mở, hiện C-28 | Nhập mã (app hoặc token phần cứng — ADR-002) | ADR-002, PREMISE §3.2, L4-A07 |
| C-31 | Xác nhận hành động không quay lại được | Khóa ngày, 期ロック, chốt せり, duyệt | Hộp thoại nêu **hệ quả** bằng câu (vd. 「締めた後は解除できません」) + số liệu chính; nút chính ghi đúng hành động | — | ADR-005 |

Thứ tự khi bấm hành động duyệt: kiểm điều kiện (client) → C-31 xác nhận → C-30 MFA (nếu cần) → gọi API → C-12 toast hoặc C-23 / C-24.

## History of change

| No | Version | Action | Nội dung thay đổi | Ngày | Người sửa | Approve |
|---|---|---|---|---|---|---|
| 1 | 0.1.0 | Add new | Bản đầu: khung PC / tablet, item C-1..C-13, trạng thái C-20..C-31 (gồm 423, mất mạng, MFA 10 phút theo ADR-002) | 2026-11-25 | phuongnnm-23344 | |
| 2 | 0.2.0 | Update | Gate 1: 承認待ち → 決裁待ち / 確認待ち ở C-11, C-27 (M-06, khách #19); C-13 chữ 「ホーム」 thay 「≡」 + C-14 ホーム tablet 4–6 nút cố định có số đếm (Q-WF-02, #32); C-5, C-30 bàn số to trên tablet (#23, #24); C-30 hết hiệu lực khi idle 3 phút, hành động không quay lại được luôn hỏi lại mã (m-06, ADR-002); C-24 giữ nội dung khi 423 giữa chừng (#5) | 2026-11-25 | phuongnnm-23344 | |
| 3 | 0.2.1 | Update | Expert Gate 3 G3-m06: C-22 đổi mã lỗi 400 → 422 (`E-CMN-007` / mã feature) theo DEC-052 | 2026-11-25 | phuongnnm-23344 | |
