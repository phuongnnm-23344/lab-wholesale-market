"""P4: burndown Iteration 1 từ nhật ký giả lập progress/iteration-1-daily.csv.

Còn lại cuối ngày = Hours (trên Project, = SWP × 2,0) của các lá cam kết chưa Done. Đường kế hoạch: giảm đều từ tổng cam kết
về 0 qua 10 ngày làm. Ghi:
  progress/iteration-1-burndown.csv   (bảng: ngày · kế hoạch · còn lại giờ / SWP · Done trong ngày · lệch)
  progress/iteration-1-burndown.png   (nhãn tiếng Việt) và progress/iteration-1-burndown.ja.png (nhãn tiếng Nhật)

    python -X utf8 backlog/scripts/render-iteration-burndown.py
"""
import csv
import importlib.util
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib import font_manager  # noqa: E402

spec = importlib.util.spec_from_file_location("daily_log", os.path.join(os.path.dirname(__file__), "iteration-daily-log.py"))
L = importlib.util.module_from_spec(spec)
spec.loader.exec_module(L)

OUT = os.path.join(L.ROOT, "progress")
ACTUAL, PLAN, INK, INK2, GRID = "#257de0", "#666666", "#191919", "#666666", "#e5e5e5"  # dataviz palette (light surface)
TEXT = {
    "vi": dict(font=["Segoe UI", "Arial"], title="Burndown Iteration 1 (giả lập) — 2027-02-01 → 02-12",
               y="Giờ còn lại (Hours trên Project)", plan="Kế hoạch (giảm đều)", actual="Thực tế (giả lập)",
               note="Đơn vị: giờ = SWP × 2,0 của lá chưa Done. Dữ liệu là giả lập."),
    "ja": dict(font=["Yu Gothic", "Meiryo", "MS Gothic"], title="バーンダウン Iteration 1（模擬）2027-02-01〜02-12",
               y="残工数（時間、Project の Hours）", plan="計画（均等消化）", actual="実績（模擬）",
               note="単位：未完了の課題の時間（SWP × 2.0）。データは模擬です。"),
}


def series():
    rows = L.load_estimate()
    leaves = L.committed(rows)
    days = L.workdays()
    st = L.daily_status(L.load_log(), leaves)
    total_h = sum(float(r["hours"]) for r in leaves.values())
    total_s = sum(float(r["swp_final"]) for r in leaves.values())
    out, prev = [], set()
    for k, d in enumerate(days, 1):
        done = {x for x, s in st[d].items() if s == "Done"}
        rem_h = total_h - sum(float(leaves[x]["hours"]) for x in done)
        rem_s = total_s - sum(float(leaves[x]["swp_final"]) for x in done)
        plan = round(total_h * (1 - k / len(days)), 1)
        new = sorted(done - prev, key=lambda x: int(leaves[x]["number"]))
        out.append(dict(day=k, date=d, plan_hours=plan, remaining_hours=rem_h, remaining_swp=rem_s, gap_hours=round(rem_h - plan, 1),
                        done_today=" ".join(f"#{leaves[x]['number']}" for x in new)))
        prev = done
    return total_h, out


def pick_font(names):
    have = {f.name for f in font_manager.fontManager.ttflist}
    return next((n for n in names if n in have), "DejaVu Sans")


def draw(total_h, rows, lang, path):
    t = TEXT[lang]
    plt.rcParams["font.family"] = pick_font(t["font"])
    fig, ax = plt.subplots(figsize=(9, 4.8), dpi=150)
    x = [0] + [r["day"] for r in rows]
    ax.plot(x, [total_h] + [r["plan_hours"] for r in rows], color=PLAN, lw=1.5, ls=(0, (4, 3)), label=t["plan"])
    ax.plot(x, [total_h] + [r["remaining_hours"] for r in rows], color=ACTUAL, lw=2, marker="o", ms=4.5,
            markeredgecolor="white", markeredgewidth=1, label=t["actual"])
    end = rows[-1]
    ax.annotate(f"{end['remaining_hours']:g}", (end["day"], end["remaining_hours"]), xytext=(6, 4), textcoords="offset points",
                color=INK, fontsize=9)
    ax.set_xticks(x)
    ax.set_xticklabels(["0"] + [f"{r['day']}\n{r['date'][5:]}" for r in rows], fontsize=8, color=INK2)
    ax.set_ylim(0, total_h * 1.05)
    ax.set_xlim(0, len(rows) + 0.6)
    ax.set_ylabel(t["y"], color=INK2, fontsize=9)
    ax.set_title(t["title"], color=INK, fontsize=11, loc="left")
    ax.grid(axis="y", color=GRID, lw=0.8)
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    for s in ("left", "bottom"):
        ax.spines[s].set_color(GRID)
    ax.tick_params(colors=INK2, labelsize=8)
    ax.legend(frameon=False, fontsize=9, loc="upper right", labelcolor=INK)
    fig.text(0.01, 0.01, t["note"], fontsize=7.5, color=INK2)
    fig.tight_layout(rect=(0, 0.03, 1, 1))
    fig.savefig(path, facecolor="white")
    plt.close(fig)


def main():
    total_h, rows = series()
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "iteration-1-burndown.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    draw(total_h, rows, "vi", os.path.join(OUT, "iteration-1-burndown.png"))
    draw(total_h, rows, "ja", os.path.join(OUT, "iteration-1-burndown.ja.png"))
    for r in rows:
        print(r)


if __name__ == "__main__":
    main()
