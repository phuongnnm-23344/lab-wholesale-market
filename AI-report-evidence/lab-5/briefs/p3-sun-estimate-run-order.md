# P3 — chấm SWP bằng `tkm:sun-estimate` (file trung gian, nội bộ)

Thứ tự chạy (phiên chính, 2026-11-26 → 27; mọi lệnh chỉ đọc GitHub):

| Bước | File | Ra |
|---|---|---|
| 1 | `fetch-project-candidates.py` | `candidates.json` — 499 item của Project 1 (GraphQL, chỉ đọc) |
| 2 | `selection.py` của skill | `selection-in.json` → `selection-out.json` — 401 lá + 98 cha |
| 3 | `build-worker-batches.py` | `batches/` — 5 lô; thân issue đã che giờ sơ bộ, người phụ trách, ID RFP, mục phụ thuộc; `worker-instructions.md` |
| 4 | 5 worker `sun-estimate-worker` | `batches/out-00N.json` |
| 5 | `merge-and-select-representatives.py` | `payload-initial.json` (1.680 SWP), `representatives.md` (5 issue mẫu) |
| 6 | Người dùng chốt 5 issue mẫu (2026-11-27) → `calibrate-and-render-report.py` | `payload-final.json` (1.701 SWP) + báo cáo HTML `lab-wholesale-market/reports/sun-estimate-lab5-project1-20261127-0216.html` |

Sau P3 (trong repo `lab-wholesale-market`, chạy từ gốc repo, `-X utf8`):

1. `backlog/scripts/build-estimate-swp-hours.py` — đọc payload **nhúng trong báo cáo HTML** (không đọc file ở đây), k = 2,0 → `backlog/estimate-swp-hours.csv`.
2. `backlog/scripts/write-point-hours-to-project.py --gap 2` — ghi Point / Hours, đọc lại 499 item.
3. `backlog/scripts/render-estimate-tables.py` → bảng của `estimate.md`; `render-task-breakdown-tables.py` → 2 cột SWP / giờ ở task-breakdown §1.4.

`payload-final.json` ở đây và payload trong HTML phải giống nhau (đã so: SWP lá, 401 / 401 khớp).
