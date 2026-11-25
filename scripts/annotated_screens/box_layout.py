"""Shared box-style renderer for the party / delivery / settle annotated screens.

Each element: (badge, x, y, w, h, text, style). style: 'box' | 'btn' | 'area' | 'banner' | 'dialog' | ...
Badges must equal the No column of the matching Screen Specification (1-1).
"""
from PIL import Image, ImageDraw

from .common import font

STYLE = {
    "box": ("#ffffff", "#555555", 2),
    "btn": ("#e8eef8", "#1f4e9a", 3),
    "area": (None, "#999999", 2),
    "banner": ("#fff4cc", "#c99a00", 2),
    "red": ("#fde2e2", "#c0392b", 2),
    "dialog": ("#f7f7f7", "#333333", 3),
    "blue": (None, "#0b3d91", 5),
    "orange": (None, "#e67e22", 5),
}


def render(path, size, title, elements, note=None):
    w, h = size
    img = Image.new("RGB", (w, h), "#fafafa")
    d = ImageDraw.Draw(img)
    f = font(15)
    fb = font(15, True)
    ft = font(18, True)
    d.rectangle([0, 0, w, 34], fill="#263238")
    d.text((12, 6), title, font=ft, fill="#ffffff")
    # draw areas first so boxes sit on top
    order = sorted(elements, key=lambda e: 0 if e[6] in ("area", "blue", "orange") else 1)
    for badge, x, y, bw, bh, text, style in order:
        fill, line, lw = STYLE[style]
        d.rectangle([x, y, x + bw, y + bh], fill=fill, outline=line, width=lw)
        ty = y + 6 if style in ("area", "blue", "orange") else y + max(4, (bh - 20 * len(text.split("\n"))) // 2)
        for i, line_text in enumerate(text.split("\n")):
            d.text((x + 22, ty + i * 20), line_text, font=fb if style == "btn" else f, fill="#111111")
    for badge, x, y, bw, bh, text, style in elements:
        if not badge:
            continue
        label = str(badge)
        r = 13 if len(label) <= 2 else 17
        cx, cy = x + 2, y + 2
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill="#d0021b", outline="#ffffff", width=2)
        tw = d.textlength(label, font=fb)
        d.text((cx - tw / 2, cy - 10), label, font=fb, fill="#ffffff")
    if note:
        d.text((12, h - 26), note, font=f, fill="#555555")
    img.save(path)
