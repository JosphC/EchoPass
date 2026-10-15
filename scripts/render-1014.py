"""Replica 1:1 a 1014.mp4 (1280x720, 30 fps, 168 cadre = 5.6 s).

Design masurat din referinta: autobuz cu arcada, gradient diagonal
albastru (TL) -> turcoaz (BR), parbriz alb, linie alba + unda ECG
(miez gradient + camasa alba), bara cu % alb inauntru + % inchis dedesubt,
stare „pale + 100%”, mesaj de bun venit, shine diagonal dreapta->stanga.

Timeline (secunde): load1 [0,1.9] | complet [1.9,2.3] | welcome1 [2.1,3.35]
| load2 [3.4,4.5] (acelasi profil, comprimat) | complet [4.45,4.7]
| welcome2 [4.6,5.62] (shine+redesenare [4.9,5.45], tine pulsul pana la capat).

Audio: se copiaza stream-ul original din 1014.mp4 (fundal constant).
Iesire: dist/loading-1014-1to1.mp4
Rulare:  python scripts/render-1014.py
"""

from __future__ import annotations

import os
import subprocess
import sys

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
FPS = 30
N_FRAMES = 168  # 5.6 s, ca referinta

WHITE = (255, 255, 255)
TRACK = (231, 231, 231)
PALE = (184, 205, 218)
INK = (74, 78, 82)
INK_PCT = (96, 100, 102)
FILL_L = (51, 109, 187)
FILL_R = (50, 154, 160)

DIV_Y = 392
BAR = (420, 636, 860, 654)
LOAD_Y = 609
BELOW_Y = 668
WELCOME_Y = 654

FONTS = {
    "round": r"C:\Windows\Fonts\ARLRDBD.TTF",
    "round_fb": r"C:\Windows\Fonts\arialbd.ttf",
    "pct": r"C:\Windows\Fonts\arialbd.ttf",
}

# Unda din incarcare = oscilatie compusa: spike jos (se stinge) + unda sus
# (scade la ~0.25 s, revine la ~0.8 s). Chei masurate din referinta.
DOWN_KEYS = [
    (466, 0), (500, 0), (560, 0), (588, 0), (600, 25), (610, 47),
    (618, 58), (626, 47), (636, 25), (645, 0), (700, 0), (810, 0),
]
UP_KEYS = [
    (466, 0), (500, 0), (522, -20), (538, -10), (545, -80), (552, -10),
    (568, 0), (590, 4), (612, -10), (630, -20), (640, -112), (650, -20),
    (668, -8), (690, 4), (705, -8), (712, -52), (719, -8), (730, 0),
    (745, 0), (810, 0),
]


def body_color(xs: np.ndarray, ys: np.ndarray) -> np.ndarray:
    """Gradientul diagonal masurat: R=43, G/B functie de (x+y)."""
    s = xs + ys - 720.0
    out = np.empty(xs.shape + (3,), np.uint8)
    out[..., 0] = 43
    out[..., 1] = np.clip(88 + 0.138 * s, 0, 255).astype(np.uint8)
    out[..., 2] = np.clip(206 - 0.087 * s, 0, 255).astype(np.uint8)
    return out


def smooth(a: float, b: float, x: float) -> float:
    if x <= a:
        return 0.0
    if x >= b:
        return 1.0
    t = (x - a) / (b - a)
    return t * t * (3 - 2 * t)


def load_fill(tau: float) -> float:
    """Fractia de umplere pe faza de incarcare (chei masurate)."""
    keys = ((0.0, 0.0), (0.2, 0.11), (0.8, 0.39), (1.9, 0.557))
    if tau <= 0:
        return 0.0
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if tau <= t1:
            return v0 + (v1 - v0) * (tau - t0) / (t1 - t0)
    return keys[-1][1]


def _interp(keys: list[tuple[float, float]], x: float) -> float:
    ku = [k[0] for k in keys]
    kv = [k[1] for k in keys]
    return float(np.interp(x, ku, kv))


def wave_center(x: float, up_amp: float, down_amp: float) -> float:
    return float(DIV_Y + up_amp * _interp(UP_KEYS, x) + down_amp * _interp(DOWN_KEYS, x))


def down_amp_at(tau: float) -> float:
    return 1.0 - smooth(0.1, 0.6, tau)


def wave_samples(x0: float, x1: float, up_amp: float, down_amp: float,
                 n: int = 120) -> list[tuple[float, float]]:
    xs = np.linspace(x0, x1, n)
    return [(float(x), wave_center(float(x), up_amp, down_amp)) for x in xs]


_CMAP: dict[str, set[int]] = {}


def _cmap(path: str) -> set[int]:
    if path not in _CMAP:
        from fontTools.ttLib import TTFont

        _CMAP[path] = set(TTFont(path)["cmap"].getBestCmap())
    return _CMAP[path]


def draw_mixed(draw: ImageDraw.ImageDraw, cx: int, y: int, text: str,
               size: int, fill: tuple[int, int, int]) -> None:
    main_p = FONTS["round"] if os.path.exists(FONTS["round"]) else FONTS["round_fb"]
    main = ImageFont.truetype(main_p, size)
    fb = ImageFont.truetype(FONTS["round_fb"], size)
    cmap = _cmap(main_p)
    fonts = [main if ord(ch) in cmap else fb for ch in text]
    widths = [draw.textlength(ch, font=f) for ch, f in zip(text, fonts)]
    x = cx - sum(widths) / 2.0
    for ch, f, wch in zip(text, fonts, widths):
        draw.text((x, y), ch, font=f, fill=fill + (255,), anchor="lm")
        x += wch


class Renderer:
    def __init__(self) -> None:
        self.bg = Image.new("RGBA", (W, H), WHITE + (255,))
        self.bus = self._build_bus()
        self.body_mask = self._build_body_mask()
        self.font_load = 36
        self.font_welcome = 30
        yy, xx = np.mgrid[150:560, 460:820].astype(np.float32)
        self.sh_diag = (xx, yy)

    def _build_body_mask(self) -> Image.Image:
        m = Image.new("L", (W, H), 0)
        d = ImageDraw.Draw(m)
        d.ellipse((482, 156, 798, 274), fill=255)          # arcada
        d.rectangle((482, 215, 798, 497), fill=255)         # laterale
        d.rounded_rectangle((482, 460, 798, 523), radius=26, fill=255)
        d.rounded_rectangle((514, 523, 565, 556), radius=6, fill=255)
        d.rounded_rectangle((714, 523, 765, 556), radius=6, fill=255)
        return m

    def _build_bus(self) -> Image.Image:
        bus = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        col = body_color(xx, yy)
        solid = Image.fromarray(col, "RGB").convert("RGBA")
        bus.paste(solid, (0, 0), self._build_body_mask())
        d = ImageDraw.Draw(bus)
        # parbriz: colturi mari sus, aproape drepte jos
        d.rounded_rectangle((516, 238, 764, 340), radius=28, fill=WHITE + (255,))
        d.rectangle((516, 300, 764, 368), fill=WHITE + (255,))
        d.rounded_rectangle((516, 340, 764, 368), radius=6, fill=WHITE + (255,))
        d.rounded_rectangle((575, 189, 705, 207), radius=9, fill=WHITE + (255,))
        for cx in (560, 720):
            d.ellipse((cx - 20, 450, cx + 20, 490), fill=WHITE + (255,))
        d.rectangle((466, 388, 814, 396), fill=WHITE + (255,))  # linia plata
        return bus

    @staticmethod
    def _fade(layer: Image.Image, a: float) -> Image.Image:
        if a >= 1.0:
            return layer
        if a <= 0.0:
            return Image.new("RGBA", layer.size, (0, 0, 0, 0))
        r, g, b, al = layer.split()
        return Image.merge("RGBA", (r, g, b, al.point(lambda v: int(v * a))))

    def wave_layer(self, x0: float, x1: float, up_amp: float, down_amp: float,
                   glow: tuple[float, float, float] | None) -> Image.Image:
        """Unda: miez gradient lat + camasa alba; glow optional (x, y, alfa)."""
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        if x1 - x0 < 2:
            return layer
        pts = wave_samples(max(x0, 466), min(x1, 814), up_amp, down_amp)
        # camasa alba lata dedesubt + miez gradient ingust deasupra
        ImageDraw.Draw(layer).line(pts, fill=WHITE + (255,), width=26, joint="curve")
        grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gd = ImageDraw.Draw(grad)
        gd.line(pts, fill=WHITE + (255,), width=13, joint="curve")
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        col = body_color(xx, yy)
        core = Image.fromarray(col, "RGB").convert("RGBA")
        core.putalpha(Image.fromarray((np.array(grad.split()[3]) > 0).astype(np.uint8) * 255))
        layer.alpha_composite(core)
        if glow is not None and glow[2] > 0.0:
            gx, gy, ga = glow
            d = ImageDraw.Draw(layer)
            d.ellipse((gx - 15, gy - 15, gx + 15, gy + 15), fill=(255, 255, 255, int(120 * ga)))
            d.ellipse((gx - 6, gy - 6, gx + 6, gy + 6), fill=(255, 255, 255, int(255 * ga)))
        return layer

    def _wave_masked(self, x0: float, x1: float, up_amp: float, down_amp: float) -> Image.Image:
        return self.wave_layer(x0, x1, up_amp, down_amp, None)

    def _glow_at(self, xq: float, par: float) -> tuple[float, float, float] | None:
        g = smooth(0.0, 0.08, par) * (1.0 - smooth(0.92, 1.0, par))
        if g <= 0.0:
            return None
        return (xq, wave_center(xq, 1.0, 0.0), g)

    def shine_layer(self, e: float) -> Image.Image:
        c = 850 - e * 480  # dreapta -> stanga
        xx, yy = self.sh_diag
        b = (xx - c) + 0.5 * (yy - 350)
        a = 65 * np.exp(-((b / 85) ** 2)) + 34 * np.exp(-(((b - 30) / 24) ** 2))
        tile = np.zeros((410, 360, 4), np.uint8)
        tile[..., 0:3] = 255
        tile[..., 3] = np.clip(a, 0, 150).astype(np.uint8)
        region = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        region.paste(Image.fromarray(tile), (460, 150))
        return Image.composite(region, Image.new("RGBA", (W, H), (0, 0, 0, 0)), self.body_mask)

    def bar_layer(self, f: float, inside: int, below: int) -> Image.Image:
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        d.rounded_rectangle(BAR, radius=9, fill=TRACK + (255,))
        fw = f * (BAR[2] - BAR[0])
        if fw >= 1.0:
            wpx = int(fw)
            t = np.linspace(0.0, 1.0, wpx, dtype=np.float32)[None, :, None]
            top = np.array(FILL_L, np.float32).reshape(1, 1, 3)
            bot = np.array(FILL_R, np.float32).reshape(1, 1, 3)
            grad = (top * (1 - t) + bot * t).astype(np.uint8)
            fill = Image.fromarray(np.repeat(grad, BAR[3] - BAR[1], axis=0), "RGB").convert("RGBA")
            m = Image.new("L", (wpx, BAR[3] - BAR[1]), 0)
            ImageDraw.Draw(m).rounded_rectangle((0, 0, wpx, BAR[3] - BAR[1]), radius=9, fill=255)
            layer.paste(fill, (BAR[0], BAR[1]), m)
            fx = BAR[0] + fw
            fnt = ImageFont.truetype(FONTS["pct"], 21)
            d.text((fx - 8, 645), f"{inside}%", font=fnt, fill=WHITE + (255,), anchor="rm")
            fnt2 = ImageFont.truetype(FONTS["pct"], 22)
            d.text((fx, BELOW_Y), f"{below}%", font=fnt2, fill=INK_PCT + (255,), anchor="ma")
        return layer

    def pale_layer(self) -> Image.Image:
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        d.rounded_rectangle(BAR, radius=9, fill=PALE + (255,))
        fnt = ImageFont.truetype(FONTS["pct"], 26)
        d.text((BAR[2] + 14, 645), "100%", font=fnt, fill=(150, 154, 158, 255), anchor="lm")
        return layer

    def text_layer(self, text: str, size: int, y: int) -> Image.Image:
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        draw_mixed(ImageDraw.Draw(layer), 640, y, text, size, INK)
        return layer

    def frame(self, t: float) -> Image.Image:
        img = self.bg.copy()
        img.alpha_composite(self.bus)

        bar_a = load_a = wel_a = pale_a = 0.0
        f = inside = below = 0
        wave = None
        shine_e = -1.0

        if t < 1.88:  # load1
            f = load_fill(t)
            inside, below = round(f * 100), min(106, round(f * 190))
            bar_a = load_a = 1.0
            wave = ("load", t)
        elif t < 1.98:
            k = (t - 1.88) / 0.10
            bar_a = load_a = 1.0 - k
            f, inside, below = 0.557, 56, 106
            pale_a = k
        elif t < 2.3:
            pale_a = 1.0 - smooth(2.08, 2.18, t)
            wel_a = smooth(2.15, 2.35, t)
        elif t < 3.4:  # welcome1
            wel_a = 1.0 - smooth(3.0, 3.25, t)
            if 2.4 <= t < 3.0:
                shine_e = smooth(0.0, 1.0, (t - 2.4) / 0.6)
            if 2.5 <= t < 3.0:
                wave = ("reveal", smooth(0.0, 1.0, (t - 2.5) / 0.5))
            elif 3.0 <= t < 3.25:
                wave = ("fullfade", 1.0 - (t - 3.0) / 0.25)
        elif t < 4.4:  # load2 (bara comprimata; unda pe ceas propriu, offset 3.1)
            u = (t - 3.4) / 1.0 * 1.9
            f = load_fill(u)
            inside, below = round(f * 100), min(106, round(f * 190))
            bar_a = load_a = smooth(3.4, 3.5, t)
            wave = ("load", t - 3.1)
        elif t < 4.75:
            k = (t - 4.4) / 0.10
            bar_a = load_a = 1.0 - k
            f, inside, below = 0.557, 56, 106
            pale_a = k if t < 4.5 else 1.0 - smooth(4.6, 4.75, t)
        else:  # welcome2 (tine starea pana la capat)
            wel_a = smooth(4.65, 4.85, t)
            if 4.9 <= t < 5.45:
                shine_e = smooth(0.0, 1.0, (t - 4.9) / 0.55)
            if 4.9 <= t < 5.45:
                wave = ("reveal", smooth(0.0, 1.0, (t - 4.9) / 0.55))
            elif t >= 5.45:
                wave = ("full", 0.0)

        if wave is not None:
            kind, par = wave
            if kind == "load":
                da = down_amp_at(par)
                xf = 470 + smooth(0.45, 1.35, par) * 350
                img.alpha_composite(self._wave_masked(xf, 814, 1.0, da))
                if 470 < xf < 814:  # banda de fade in urma frontierei
                    img.alpha_composite(self._fade(self._wave_masked(xf - 14, xf, 1.0, da), 0.4))
            elif kind == "reveal":
                xq = 470 + par * 350
                img.alpha_composite(self._wave_masked(466, xq, 1.0, 0.0))
                glow = self._glow_at(xq, par)
                if glow is not None:
                    img.alpha_composite(self.wave_layer(466, xq, 1.0, 0.0, glow))
            elif kind == "fullfade":
                img.alpha_composite(self._fade(self._wave_masked(466, 814, 1.0, 0.0), par))
            elif kind == "full":
                img.alpha_composite(self._wave_masked(466, 814, 1.0, 0.0))
        if shine_e >= 0.0:
            img.alpha_composite(self.shine_layer(shine_e))
        if bar_a > 0.0:
            img.alpha_composite(self._fade(self.bar_layer(f, inside, below), bar_a))
        if pale_a > 0.0:
            img.alpha_composite(self._fade(self.pale_layer(), pale_a))
        if load_a > 0.0:
            img.alpha_composite(self._fade(self.text_layer("Aplicația se încarcă...", 36, LOAD_Y), load_a))
        if wel_a > 0.0:
            img.alpha_composite(self._fade(self.text_layer("Welcome, sunteți conectați!", 30, WELCOME_Y), wel_a))
        return img.convert("RGB")


def main() -> None:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(root, "dist", "loading-1014-1to1.mp4")
    os.makedirs(os.path.join(root, "dist"), exist_ok=True)
    ref = os.path.join(root, "1014.mp4")

    r = Renderer()
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    silent = os.path.join(root, "dist", ".rep-silent.mp4")
    cmd = [ff, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
           "-framerate", str(FPS), "-i", "pipe:0",
           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", silent]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    assert proc.stdin is not None
    for i in range(N_FRAMES):
        proc.stdin.write(r.frame(i / FPS).tobytes())
    proc.stdin.close()
    proc.wait()
    # audio 1:1 din original (5.62 s), video replica
    cmd2 = [ff, "-y", "-i", silent, "-i", ref,
            "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-movflags", "+faststart", "-shortest", out]
    subprocess.run(cmd2, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    os.remove(silent)
    print("OK:", out, os.path.getsize(out), "bytes")


if __name__ == "__main__":
    sys.exit(main())
