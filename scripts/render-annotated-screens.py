"""Render the numbered (annotated) to-be images of the 10 core screens + linked screens (LAB-4 P3).

Images are drawn from the to-be wireframes (wireframes/SC-*-wireframe.md), not from prototype
screenshots. Red badge numbers must equal the ID / No column of the matching Screen Specification
(BM-2-901-51, section 4.1) one-to-one; when a wireframe item changes, edit the layout data in
scripts/annotated_screens/*.py and re-run.

Usage (from anywhere; paths are resolved from this file's location):
    python scripts/render-annotated-screens.py             # all screens
    python scripts/render-annotated-screens.py SC-05-02    # only the listed screens
    python scripts/render-annotated-screens.py --list      # show screen IDs and output paths

Requires: Python 3.10+, Pillow, a Japanese font (Meiryo / Yu Gothic on Windows, Hiragino on
macOS, Noto Sans CJK on Linux) — or set ANNOT_FONT_REGULAR / ANNOT_FONT_BOLD to font paths.
Output: specs/{feature}/screen-specification/assets/{SCREEN_ID}_annotated.png
"""
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

from annotated_screens import incentive_rule, lot_trade, party_delivery_settle  # noqa: E402

# screen id -> (feature folder, render function taking the output path)
SCREENS = {
    "SC-01-02": ("party", party_delivery_settle.sc_01_02),
    "SC-03-01": ("lot", lambda out: lot_trade.render("SC-03-01", out)),
    "SC-03-05": ("lot", lambda out: lot_trade.render("SC-03-05", out)),
    "SC-04-01": ("trade", lambda out: lot_trade.render("SC-04-01", out)),
    "SC-05-02": ("trade", lambda out: lot_trade.render("SC-05-02", out)),
    "SC-06-02": ("delivery", party_delivery_settle.sc_06_02),
    "SC-06-04": ("delivery", party_delivery_settle.sc_06_04),
    "SC-06-05": ("delivery", party_delivery_settle.sc_06_05),
    "SC-07-02": ("settle", party_delivery_settle.sc_07_02),
    "SC-08-03": ("settle", party_delivery_settle.sc_08_03),
    "SC-09-04": ("incentive", incentive_rule.sc_09_04),
    "SC-10-04": ("rule", incentive_rule.sc_10_04),
}


def output_path(sid):
    feature = SCREENS[sid][0]
    return REPO / "specs" / feature / "screen-specification" / "assets" / f"{sid}_annotated.png"


def main(args):
    if args[:1] == ["--list"]:
        for sid in SCREENS:
            print(sid, output_path(sid).relative_to(REPO).as_posix())
        return 0
    unknown = [a for a in args if a not in SCREENS]
    if unknown:
        print("Unknown screen id:", ", ".join(unknown), "— use --list", file=sys.stderr)
        return 2
    for sid in args or SCREENS:
        out = output_path(sid)
        out.parent.mkdir(parents=True, exist_ok=True)
        SCREENS[sid][1](out)
        print("wrote", out.relative_to(REPO).as_posix())
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
