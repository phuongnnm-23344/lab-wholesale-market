# 水産物卸売市場 業務支援システム（試作・サンプルデータ）— LAB-2 prototype

Prototype chạy thật cho Product A (chợ bán buôn thủy sản 桜水産市場 — khách hư cấu). Stack: **Next.js 16 (App Router, TypeScript) + Supabase (Auth + Postgres + RLS) + Vercel**.

> **Toàn bộ dữ liệu là dữ liệu giả 「サンプル」** (tên bắt đầu bằng 「サンプル」, cột `is_sample = true`). Không có dữ liệu nghiệp vụ thật.

## Link

| | |
|---|---|
| App (Vercel) | https://lab-wholesale-market-fup2.vercel.app/ — mở ra là trang đăng nhập |
| Supabase project | https://supabase.com/dashboard/project/lgipmzzszzoddvzhrllh (project `Project-lab-NNMP`) — **chỉ thành viên được mời mới mở được**; giảng viên cần xem thì chủ project mời vào org (quyền Read-only). Không có quyền vẫn xem được toàn bộ schema / RLS / RPC trong `supabase/migrations/` |
| Danh sách màn hình / tính năng bản chốt + phần mock | `project/04_screen/lab2-prototype-screen-feature-list.md` (nộp kèm, ngoài repo này) |

## Tài khoản demo (dùng được tới hết LAB-6)

Mật khẩu chung cho cả 10 tài khoản: **`***REMOVED***`** — chỉ dùng cho tài khoản demo trên dữ liệu giả, không dùng lại ở hệ thống khác (DEC-030).
PIN đổi người trên máy chung (màn 利用者切替, chỉ vai hiện trường): `***REMOVED***`.

| Email | Vai | Quyền thêm | Màn nên thử |
|---|---|---|---|
| intake@sakura-demo.example | 受付担当 | — | ロット仮受付・本登録 |
| judge@sakura-demo.example | 目利き記録担当 | — | 目利き・下見結果入力 |
| trade@sakura-demo.example | 取引担当（せり入力者） | — | **相対取引入力・確定**（luồng chính）, せり結果入力 |
| trade2@sakura-demo.example | 取引担当（せり確認者） | — | せり結果確認 |
| delivery@sakura-demo.example | 配送担当 | — | 引渡し記録（tablet） |
| settle@sakura-demo.example | 照合事務局 | — | 参加者（許可・承認）, 日次照合表, 入金CSV取込 |
| stlhead@sakura-demo.example | 照合事務局 | 照合部門長 | 日次締め, 修正申請 1次承認, 規則版承認, 奨励金計算・期ロック |
| opshead@sakura-demo.example | 照合事務局 | 運用部門長 | 修正申請 2次承認 |
| rule@sakura-demo.example | ルール管理者 | — | 規則版・交付率の起票 |
| sysadm@sakura-demo.example | システム管理者 | — | アカウント・ロール管理, 監査ログ |

Tài khoản demo được bảo vệ: trong app không đổi được vai / quyền / trạng thái / PIN. Supabase Auth **không chặn được** việc người đăng nhập tự đổi mật khẩu của mình → nếu tài khoản demo không vào được: báo người phụ trách chạy `npm run demo:reset`.

Giới hạn đã biết của bản thử (chấp nhận, ghi trong danh sách mock): PIN 4 số khóa 15 phút sau 5 lần sai **theo người được chuyển tới** — người đang đăng nhập trên máy chung có thể cố ý nhập sai để khóa PIN của người khác trong 15 phút (bản thật cần giới hạn thêm theo người nhập và thiết bị). Quyền **đọc** dữ liệu nghiệp vụ là toàn bộ nhân viên nội bộ đang hoạt động (giản lược); quyền **ghi / duyệt** được kiểm trong DB theo vai.

## Kịch bản demo nên thử (~10 phút)

1. `trade@` → 相対取引入力・確定 trên lô hôm nay (luồng chính), rồi 取引一覧 xem giao dịch vừa chốt.
2. `stlhead@` → 修正申請一覧: đã có sẵn **1 修正申請 đã duyệt 2 cấp** (GD `T{hôm qua}-3-2`, đổi người mua sang 仲卸 + đơn giá) — GD gốc không bị sửa, sinh 2 dòng REVERSE / DELTA ghi vào ngày hôm nay. Muốn tự làm lại: `trade@` lập 修正申請 trên GD của ngày đã khóa → `stlhead@` duyệt cấp 1 → (nếu chênh ≥ 300.000 円) `opshead@` duyệt cấp 2.
3. `settle@` → 日次照合表 hôm nay: thấy dòng điều chỉnh của 修正申請; ngày đã khóa không sửa trực tiếp được.
4. `sysadm@` → 監査ログ: lọc `correction_requests` / `trade_adjustments` để thấy ai lập, ai duyệt, trước / sau.

## Nếu app báo lỗi kết nối DB

Supabase free tier **tự tạm dừng (pause) project sau 7 ngày không dùng** → vào Supabase Dashboard → chọn project → **Resume project**, đợi 1–2 phút rồi tải lại trang. Mỗi tuần nên mở app một lần và chạy `npm run demo:verify`.

## Thao tác chỉ dùng được 1 lần (demo)

Đúng luật nghiệp vụ "không ghi đè lịch sử", các thao tác sau không quay lại được; muốn demo lại → `npm run demo:reset` (khôi phục toàn bộ dữ liệu giả + mật khẩu/PIN/vai của tài khoản demo). Lưu ý: `demo:reset` là công cụ của người phụ trách (chạy local bằng secret key), **xóa cả 監査ログ của dữ liệu giả** rồi seed lại; trong app không có đường nào xóa / sửa 監査ログ (bảng append-only, chỉ có policy SELECT):
- 日次締め (khóa ngày) và 期ロック (khóa kỳ) — không có chức năng mở khóa; sửa sau khóa đi qua 修正申請.
- 奨励金計算: mỗi kỳ chỉ chạy 1 lần.
- 規則版承認: năm tài chính 2026 (tới 2027-03-31) đã dùng 2/4 lần; sang năm tài chính mới quota về 0/4.

## Chạy local

```bash
npm install
cp .env.local.example .env.local   # rồi tự điền giá trị (không commit, không gửi qua chat)
npm run dev                        # http://localhost:3000 → trang đăng nhập
```

Kiểm tra: `npm run typecheck`, `npm run lint`, `npm run build`. Kiểm tổng trên DB thật (cần `npm run dev` đang chạy): `APP_BASE_URL=http://localhost:3000 npm run verify:all` (11 bộ: 9 bộ phase 02–10 + kiểm theo code review R01–R15 + 10 tài khoản demo). Quét secret trong bundle bản deploy: `APP_BASE_URL=<url> npm run check:bundle-secrets`.

## Dựng Supabase lần đầu (đã làm — giữ lại để tái lập)

1. Tạo project; **Authentication → Sign In / Providers → tắt "Allow new users to sign up"**.
2. `.env.local` từ `.env.local.example` (URL, publishable key, secret key, mật khẩu demo / PIN demo / mật khẩu tài khoản test).
3. `npx supabase link --project-ref <ref>` rồi `npx supabase db push --remote` (30 migration trong `supabase/migrations/`).
4. `npm run demo:accounts` → `npm run demo:reset` → `npm run demo:verify` (phải ra 10/10).

## Bảo mật (tóm tắt)

- Mọi trang và `/api/*` yêu cầu đăng nhập (proxy + kiểm lại ở route + RLS ở DB); tự đăng ký đã tắt.
- Bảng chỉ có policy SELECT; mọi thao tác ghi đi qua hàm RPC `security definer` kiểm vai/quyền trong DB; `anon` không có quyền gì.
- Secret key chỉ dùng phía server (`src/lib/supabase/admin-client.ts`, có `server-only`) và trong script local. `.env*` không commit (trừ file mẫu rỗng).
