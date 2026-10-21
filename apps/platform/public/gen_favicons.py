"""
Mikhlafi Labs — Favicon generator
Generates favicon.ico (16,32,48), apple-touch-icon.png (180), pwa-192.png, pwa-512.png
from pure Pillow drawing matching the ML logo: black rounded-square, gold border, silver M, gold L.
"""
from PIL import Image, ImageDraw
import math, os

OUT = os.path.dirname(os.path.abspath(__file__))

# ─── colour palette ──────────────────────────────────────────────────────────
BG          = (10, 10, 10)
GOLD_LIGHT  = (240, 192, 80)
GOLD_MID    = (200, 146, 10)
GOLD_DARK   = (130, 90,   0)
SILVER_HI   = (240, 240, 240)
SILVER_MID  = (180, 180, 180)
SILVER_DARK = (100, 100, 100)

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i]-c1[i])*t) for i in range(3))

def rounded_rect_mask(size, radius_ratio=0.215):
    w, h = size
    r = int(min(w, h) * radius_ratio)
    mask = Image.new('L', size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, w-1, h-1], radius=r, fill=255)
    return mask

def draw_logo(size):
    """Draw the ML icon at the given square pixel size."""
    w = size
    img = Image.new('RGB', (w, w), BG)
    d   = ImageDraw.Draw(img)

    s = w / 512          # scale factor relative to 512px design grid

    # ── gold border ──────────────────────────────────────────────────────────
    bw = max(1, int(9 * s))          # border thickness
    r  = int(104 * s)                # corner radius
    d.rounded_rectangle([bw//2, bw//2, w-bw//2-1, w-bw//2-1],
                        radius=r, outline=GOLD_MID, width=bw)
    # secondary inner highlight line
    bw2 = max(1, int(3 * s))
    d.rounded_rectangle([bw+bw2, bw+bw2, w-bw-bw2-1, w-bw-bw2-1],
                        radius=max(1,r-bw), outline=GOLD_LIGHT, width=bw2)

    # ── helper: filled polygon ────────────────────────────────────────────────
    def poly(pts, fill):
        d.polygon([(x*s, y*s) for x,y in pts], fill=fill)

    # ── M letter (silver) ────────────────────────────────────────────────────
    # Left pillar
    poly([(100,165),(130,165),(130,350),(100,350)], SILVER_HI)
    # Left pillar 3D right face
    poly([(130,165),(148,148),(148,333),(130,350)], SILVER_DARK)
    # Left slope down to valley
    poly([(130,165),(175,245),(175,268),(148,248),(148,148)], SILVER_MID)
    # Center valley (dark crease)
    poly([(175,245),(205,200),(235,245),(235,268),(205,223),(175,268)], SILVER_DARK)
    # Right slope up from valley
    poly([(235,245),(280,165),(310,165),(265,265),(235,268)], SILVER_MID)
    # Right pillar
    poly([(280,165),(310,165),(310,350),(280,350)], SILVER_HI)
    # Right pillar 3D right face (top only — L takes over)
    poly([(310,165),(328,148),(328,185),(310,200)], SILVER_DARK)

    # ── L letter (gold) ──────────────────────────────────────────────────────
    # Vertical bar front
    poly([(310,165),(368,165),(368,310),(310,310)], GOLD_LIGHT)
    # Vertical bar right face
    poly([(368,165),(400,148),(400,293),(368,310)], GOLD_DARK)
    # Horizontal foot front
    poly([(310,310),(410,310),(410,350),(310,350)], GOLD_MID)
    # Foot top face
    poly([(368,310),(400,293),(440,293),(410,310)], GOLD_DARK)
    # Foot right 3D corner
    poly([(410,310),(440,293),(440,333),(410,350)], GOLD_DARK)

    # ── apply rounded mask ────────────────────────────────────────────────────
    mask = rounded_rect_mask((w, w), radius_ratio=0.215)
    bg   = Image.new('RGB', (w, w), (0, 0, 0))
    result = Image.composite(img, bg, mask)
    return result

# ── generate sizes ────────────────────────────────────────────────────────────
print("Generating favicons...")

# favicon.ico — multi-size (16, 32, 48)
ico_sizes = [16, 32, 48]
ico_imgs  = [draw_logo(s) for s in ico_sizes]
ico_imgs[0].save(
    os.path.join(OUT, "favicon.ico"),
    format="ICO",
    sizes=[(s, s) for s in ico_sizes],
    append_images=ico_imgs[1:]
)
print("  favicon.ico  (16×16, 32×32, 48×48)")

# favicon-32x32.png
draw_logo(32).save(os.path.join(OUT, "favicon-32x32.png"), "PNG")
print("  favicon-32x32.png")

# favicon-16x16.png
draw_logo(16).save(os.path.join(OUT, "favicon-16x16.png"), "PNG")
print("  favicon-16x16.png")

# apple-touch-icon.png — 180×180
draw_logo(180).save(os.path.join(OUT, "apple-touch-icon.png"), "PNG")
print("  apple-touch-icon.png  (180×180)")

# PWA icons
draw_logo(192).save(os.path.join(OUT, "pwa-192.png"), "PNG")
print("  pwa-192.png")

draw_logo(512).save(os.path.join(OUT, "pwa-512.png"), "PNG")
print("  pwa-512.png")

print("\nDone! All favicon assets written to", OUT)
