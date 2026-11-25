"""Shared helpers for the annotated screen renderers: Japanese font lookup."""
import os
from functools import lru_cache
from pathlib import Path

from PIL import ImageFont

# Override with ANNOT_FONT_REGULAR / ANNOT_FONT_BOLD (path to a .ttf/.ttc with Japanese glyphs).
_CANDIDATES = {
    False: ["C:/Windows/Fonts/meiryo.ttc", "C:/Windows/Fonts/YuGothR.ttc",
            "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc",
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"],
    True: ["C:/Windows/Fonts/meiryob.ttc", "C:/Windows/Fonts/YuGothB.ttc",
           "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc",
           "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"],
}


def _font_path(bold):
    env = os.environ.get("ANNOT_FONT_BOLD" if bold else "ANNOT_FONT_REGULAR")
    for p in ([env] if env else []) + _CANDIDATES[bold]:
        if p and Path(p).exists():
            return p
    raise SystemExit("No Japanese font found — set ANNOT_FONT_REGULAR / ANNOT_FONT_BOLD")


@lru_cache(maxsize=None)
def font(size, bold=False):
    return ImageFont.truetype(_font_path(bold), size)
