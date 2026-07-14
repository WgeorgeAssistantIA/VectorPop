"""Genere assets/icon.ico — motif 'noeud vectoriel + courbe' sur degrade.

Lancer : python make_icon.py
"""

from pathlib import Path
from PIL import Image, ImageDraw

S = 256
ASSETS = Path(__file__).parent / "assets"
ASSETS.mkdir(exist_ok=True)


def rounded_gradient(size: int, c1, c2, radius: int) -> Image.Image:
    """Carre arrondi avec degrade vertical c1 -> c2."""
    grad = Image.new("RGB", (1, size))
    for y in range(size):
        t = y / (size - 1)
        grad.putpixel((0, y), tuple(int(a + (b - a) * t) for a, b in zip(c1, c2)))
    grad = grad.resize((size, size))

    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius, fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    return out


def node(d: ImageDraw.ImageDraw, x, y, r=14, fill="white", outline=(99, 91, 255)):
    d.rectangle((x - r, y - r, x + r, y + r), fill=fill, outline=outline, width=4)


img = rounded_gradient(S, (124, 92, 255), (56, 130, 246), radius=56)  # violet -> bleu
d = ImageDraw.Draw(img)

# Courbe vectorielle blanche (evoque un chemin SVG entre deux noeuds).
d.line([(64, 188), (110, 96), (146, 160), (192, 68)], fill="white", width=12, joint="curve")

# Noeuds d'ancrage aux extremites.
node(d, 64, 188)
node(d, 192, 68)

sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
img.save(ASSETS / "icon.ico", sizes=sizes)
img.save(ASSETS / "icon.png")
print("Icone generee :", ASSETS / "icon.ico")
