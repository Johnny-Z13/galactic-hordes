from __future__ import annotations

import math
from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "src" / "assets"
ALIEN_PATH = ASSET_DIR / "planet-alien-catalog-alpha.png"
BOSS_PATH = ASSET_DIR / "planet-boss-catalog-alpha.png"

ALIEN_CELL = 192
ALIEN_FRAMES = 4
ALIEN_ROWS = 8
BOSS_CELL = 256
BOSS_FRAMES = 4
BOSS_ROWS = 8
LEGACY_ROWS = 5


def color_with_alpha(hex_color: str, alpha: int) -> tuple[int, int, int, int]:
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def neon_line(draw: ImageDraw.ImageDraw, points, color: str, width: int = 3) -> None:
    for glow_width, alpha in ((width + 12, 28), (width + 7, 52), (width + 3, 88)):
        draw.line(points, fill=color_with_alpha(color, alpha), width=glow_width, joint="curve")
    draw.line(points, fill=color_with_alpha(color, 245), width=width, joint="curve")


def neon_ellipse(draw: ImageDraw.ImageDraw, bbox, color: str, width: int = 3, fill_alpha: int = 0) -> None:
    if fill_alpha:
        draw.ellipse(bbox, fill=color_with_alpha(color, fill_alpha))
    for glow_width, alpha in ((width + 12, 22), (width + 7, 48), (width + 3, 76)):
        draw.ellipse(bbox, outline=color_with_alpha(color, alpha), width=glow_width)
    draw.ellipse(bbox, outline=color_with_alpha(color, 238), width=width)


def neon_polygon(draw: ImageDraw.ImageDraw, points, color: str, width: int = 3, fill_alpha: int = 0) -> None:
    if fill_alpha:
        draw.polygon(points, fill=color_with_alpha(color, fill_alpha))
    closed = points + [points[0]]
    neon_line(draw, closed, color, width)


def draw_spore_choir(draw: ImageDraw.ImageDraw, ox: int, oy: int, frame: int) -> None:
    sway = [-5, -1, 4, 1][frame]
    color = "#ff9f4a"
    accent = "#8fff7d"
    for i, x in enumerate((61, 96, 131)):
        y = 78 + (i % 2) * 8 + [-2, 3, -1, 2][(frame + i) % 4]
        neon_line(draw, [(ox + x + sway * 0.35, oy + 116), (ox + x + sway, oy + y + 24)], accent, 2)
        neon_ellipse(draw, (ox + x - 17 + sway, oy + y - 10, ox + x + 17 + sway, oy + y + 18), color, 3, 26)
        neon_ellipse(draw, (ox + x - 8 + sway, oy + y + 3, ox + x - 3 + sway, oy + y + 8), "#d7fff7", 1)
        neon_ellipse(draw, (ox + x + 5 + sway, oy + y + 1, ox + x + 10 + sway, oy + y + 6), "#d7fff7", 1)
    for i in range(7):
        px = ox + 54 + i * 14 + (frame % 2) * 4
        py = oy + 52 - (i % 3) * 7
        neon_ellipse(draw, (px - 2, py - 2, px + 2, py + 2), accent, 1)


def draw_mirror_drifter(draw: ImageDraw.ImageDraw, ox: int, oy: int, frame: int) -> None:
    color = "#a879ff"
    accent = "#57fff3"
    tilt = [-6, -2, 5, 2][frame]
    cx, cy = ox + 96 + tilt, oy + 92
    neon_polygon(draw, [(cx, cy - 48), (cx + 30, cy - 5), (cx, cy + 50), (cx - 30, cy - 5)], color, 3, 20)
    neon_line(draw, [(cx - 18, cy - 4), (cx + 18, cy - 22), (cx + 9, cy + 24)], accent, 2)
    for i, angle in enumerate((0.4, 2.1, 3.7)):
        px = cx + int(49 * math.cos(angle + frame * 0.28))
        py = cy + int(30 * math.sin(angle + frame * 0.28))
        neon_polygon(draw, [(px, py - 8), (px + 7, py), (px, py + 8), (px - 7, py)], accent if i % 2 else color, 2, 16)
    neon_ellipse(draw, (cx - 46, cy - 58, cx + 46, cy + 58), accent, 1)


def draw_singing_engine(draw: ImageDraw.ImageDraw, ox: int, oy: int, frame: int) -> None:
    color = "#7dffb0"
    accent = "#fff27a"
    pulse = [0, 5, 2, -3][frame]
    cx, cy = ox + 96, oy + 101 + pulse
    neon_ellipse(draw, (cx - 27, cy - 40, cx + 27, cy + 34), color, 3, 20)
    neon_polygon(draw, [(cx - 37, cy + 19), (cx + 37, cy + 19), (cx + 19, cy + 52), (cx - 19, cy + 52)], color, 3, 14)
    neon_line(draw, [(cx - 16, cy - 14), (cx + 16, cy - 14)], accent, 2)
    for i in range(3):
        y = cy - 58 - i * 10
        neon_line(draw, [(cx - 24 - i * 8, y), (cx - 11 - i * 4, y - 7), (cx + 11 + i * 4, y + 7), (cx + 24 + i * 8, y)], accent, 1)
    neon_line(draw, [(cx - 24, cy + 34), (cx - 37, cy + 62)], color, 2)
    neon_line(draw, [(cx + 24, cy + 34), (cx + 37, cy + 62)], color, 2)


def draw_halo_grazer(draw: ImageDraw.ImageDraw, ox: int, oy: int, frame: int) -> None:
    color = "#ff9f4a"
    accent = "#fff27a"
    cx, cy = ox + 128, oy + 130
    wobble = [0, 5, 1, -4][frame]
    neon_ellipse(draw, (cx - 70 + wobble, cy - 47, cx + 70 + wobble, cy + 47), color, 5, 18)
    neon_ellipse(draw, (cx - 36 + wobble, cy - 22, cx + 36 + wobble, cy + 22), "#000000", 2)
    neon_polygon(draw, [(cx - 38, cy - 51), (cx - 83, cy - 88), (cx - 63, cy - 29)], accent, 4, 12)
    neon_polygon(draw, [(cx + 38, cy - 51), (cx + 83, cy - 88), (cx + 63, cy - 29)], accent, 4, 12)
    for i in range(6):
        x = cx - 48 + i * 19 + wobble
        neon_line(draw, [(x, cy + 25), (x + 8, cy + 57)], accent, 2)


def draw_phase_skipper(draw: ImageDraw.ImageDraw, ox: int, oy: int, frame: int) -> None:
    color = "#a879ff"
    accent = "#57fff3"
    cx, cy = ox + 128, oy + 126
    offset = [-14, -5, 12, 4][frame]
    for ghost, alpha_shift in ((-22, 0), (18, 1)):
        ghost_color = color if alpha_shift else accent
        neon_ellipse(draw, (cx - 42 + ghost, cy - 55, cx + 42 + ghost, cy + 55), ghost_color, 2)
    neon_polygon(draw, [(cx + offset, cy - 76), (cx + 48 + offset, cy - 13), (cx + 22 + offset, cy + 70), (cx - 40 + offset, cy + 48), (cx - 52 + offset, cy - 16)], color, 5, 18)
    neon_line(draw, [(cx - 28 + offset, cy - 28), (cx + 25 + offset, cy - 4), (cx - 8 + offset, cy + 37)], accent, 3)
    for y in (-54, 70):
        neon_line(draw, [(cx - 64, cy + y), (cx - 91, cy + y + 18)], color, 3)
        neon_line(draw, [(cx + 64, cy + y), (cx + 91, cy + y - 18)], color, 3)


def draw_brood_prism(draw: ImageDraw.ImageDraw, ox: int, oy: int, frame: int) -> None:
    color = "#7dffb0"
    accent = "#ff61d8"
    cx, cy = ox + 128, oy + 128
    pulse = [0, 6, 2, -4][frame]
    neon_polygon(draw, [(cx, cy - 84 - pulse), (cx + 56, cy - 18), (cx + 36, cy + 68 + pulse), (cx - 42, cy + 64 + pulse), (cx - 58, cy - 18)], color, 5, 18)
    neon_line(draw, [(cx, cy - 84 - pulse), (cx, cy + 76 + pulse)], accent, 3)
    neon_line(draw, [(cx - 48, cy - 18), (cx + 48, cy - 18), (cx - 30, cy + 44), (cx + 30, cy + 44)], accent, 2)
    for i, x in enumerate((-75, -48, 48, 75)):
        y = cy + 18 + (i % 2) * 29 + pulse
        neon_ellipse(draw, (cx + x - 15, y - 13, cx + x + 15, y + 13), accent, 3, 16)
        neon_line(draw, [(cx + x * 0.62, cy + 32), (cx + x, y)], color, 2)


def extend_catalog(
    path: Path,
    cell: int,
    frames: int,
    rows: int,
    painters: list[Callable[[ImageDraw.ImageDraw, int, int, int], None]],
) -> None:
    current = Image.open(path).convert("RGBA")
    expanded = Image.new("RGBA", (cell * frames, cell * rows), (0, 0, 0, 0))
    copy_rows = min(LEGACY_ROWS, current.height // cell, rows)
    expanded.alpha_composite(current.crop((0, 0, cell * frames, copy_rows * cell)), (0, 0))
    draw = ImageDraw.Draw(expanded, "RGBA")
    for row_offset, painter in enumerate(painters, start=LEGACY_ROWS):
        for frame in range(frames):
            painter(draw, frame * cell, row_offset * cell, frame)
    expanded.save(path)


def main() -> None:
    extend_catalog(ALIEN_PATH, ALIEN_CELL, ALIEN_FRAMES, ALIEN_ROWS, [draw_spore_choir, draw_mirror_drifter, draw_singing_engine])
    extend_catalog(BOSS_PATH, BOSS_CELL, BOSS_FRAMES, BOSS_ROWS, [draw_halo_grazer, draw_phase_skipper, draw_brood_prism])
    print(f"Wrote {ALIEN_PATH.relative_to(ROOT)} as {ALIEN_FRAMES}x{ALIEN_ROWS}")
    print(f"Wrote {BOSS_PATH.relative_to(ROOT)} as {BOSS_FRAMES}x{BOSS_ROWS}")


if __name__ == "__main__":
    main()
