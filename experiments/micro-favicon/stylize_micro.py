"""Prototype : proposition MICRO stylisee (pas fidele) d'un logo, a 16 et 32px.

Principe : pas de downscale+lissage. On classe chaque pixel en
background / silhouette (encre) / accent (couleur vive = feature
identitaire, ex. les yeux), puis on "pool" en blocs directement a la
taille cible et on durcit (seuil) chaque bloc -> formes plates, epaisses,
lisibles. Un accent n'est garde QUE s'il survit comme bloc plein a la
taille cible (sinon il serait de toute facon illisible -> on le supprime
plutot que de le laisser baver).
"""
from __future__ import annotations
import numpy as np
from PIL import Image
from pathlib import Path
from colorsys import rgb_to_hsv

SRC = r"C:\Users\William\Downloads\Copilot_20260716_072241.png"
OUT_DIR = Path(r"C:\Users\William\AppData\Local\Temp\claude\C--Users-William-Documents-Entreprenariat\f6243753-b159-4e23-9823-8c693bbcb16a\scratchpad")

SILHOUETTE_COLOR = (10, 25, 45)      # navy fonce, quasi-noir
ACCENT_COLOR = (240, 145, 30)        # orange (couleur des yeux dans le logo source)


def load():
    img = Image.open(SRC).convert("RGB")
    return np.array(img).astype(float)


def bg_color(arr):
    corners = np.concatenate([
        arr[:8, :8].reshape(-1, 3), arr[:8, -8:].reshape(-1, 3),
        arr[-8:, :8].reshape(-1, 3), arr[-8:, -8:].reshape(-1, 3),
    ])
    return corners.mean(axis=0)


def hsv_arr(arr):
    """HSV vectorise (evite une boucle python pixel par pixel)."""
    r, g, b = arr[..., 0] / 255, arr[..., 1] / 255, arr[..., 2] / 255
    maxc = np.max(arr, axis=-1) / 255
    minc = np.min(arr, axis=-1) / 255
    v = maxc
    delta = maxc - minc
    s = np.where(maxc == 0, 0, delta / np.where(maxc == 0, 1, maxc))
    rc = np.where(delta == 0, 0, (maxc - r) / np.where(delta == 0, 1, delta))
    gc = np.where(delta == 0, 0, (maxc - g) / np.where(delta == 0, 1, delta))
    bc = np.where(delta == 0, 0, (maxc - b) / np.where(delta == 0, 1, delta))
    h = np.zeros_like(maxc)
    h = np.where(maxc == r, (bc - gc), h)
    h = np.where(maxc == g, 2.0 + rc - bc, h)
    h = np.where(maxc == b, 4.0 + gc - rc, h)
    h = (h / 6.0) % 1.0
    h = np.where(delta == 0, 0, h)
    return h, s, v


def pool_bool_to_grid(mask: np.ndarray, grid: int, keep_frac: float) -> np.ndarray:
    """Reduit un masque bool HxW a grid x grid : chaque cellule = True si
    la fraction de pixels True dans le bloc source depasse keep_frac."""
    H, W = mask.shape
    ys = (np.linspace(0, H, grid + 1)).astype(int)
    xs = (np.linspace(0, W, grid + 1)).astype(int)
    out = np.zeros((grid, grid), dtype=bool)
    for i in range(grid):
        for j in range(grid):
            block = mask[ys[i]:ys[i + 1], xs[j]:xs[j + 1]]
            if block.size == 0:
                continue
            out[i, j] = block.mean() >= keep_frac
    return out


def make_variant(arr, grid: int, silhouette_frac: float, accent_frac: float):
    bg = bg_color(arr)
    dist_bg = np.linalg.norm(arr - bg, axis=-1)
    ink_mask = dist_bg > 22  # pas fond -> fait partie du logo

    h, s, v = hsv_arr(arr)
    accent_mask = ink_mask & (h > 0.03) & (h < 0.14) & (s > 0.35) & (v > 0.25)

    silhouette_grid = pool_bool_to_grid(ink_mask, grid, silhouette_frac)
    accent_grid = pool_bool_to_grid(accent_mask, grid, accent_frac)
    # l'accent ne peut exister que la ou il y a deja de la silhouette
    accent_grid &= silhouette_grid

    out = np.zeros((grid, grid, 4), dtype=np.uint8)
    out[silhouette_grid] = (*SILHOUETTE_COLOR, 255)
    out[accent_grid] = (*ACCENT_COLOR, 255)
    return Image.fromarray(out, mode="RGBA")


def upscale_nn(img: Image.Image, factor: int) -> Image.Image:
    return img.resize((img.width * factor, img.height * factor), Image.NEAREST)


def contact_sheet(cells: list[tuple[str, Image.Image]], cell_px: int = 220) -> Image.Image:
    pad = 14
    cols = len(cells)
    sheet = Image.new("RGB", (cols * (cell_px + pad) + pad, cell_px + pad * 2 + 30), (235, 235, 232))
    from PIL import ImageDraw
    d = ImageDraw.Draw(sheet)
    for i, (label, im) in enumerate(cells):
        thumb = im.resize((cell_px, cell_px), Image.NEAREST)
        x = pad + i * (cell_px + pad)
        sheet.paste(thumb, (x, pad + 20))
        d.text((x, 2), label, fill=(20, 20, 20))
    return sheet


def main():
    arr = load()
    variants_cfg = [
        ("agressif 0.30/0.15", 0.30, 0.15),
        ("moyen 0.42/0.25", 0.42, 0.25),
        ("prudent 0.55/0.35", 0.55, 0.35),
    ]
    for grid in (32, 16):
        cells = []
        for label, sfrac, afrac in variants_cfg:
            im = make_variant(arr, grid, sfrac, afrac)
            im.save(OUT_DIR / f"micro_{grid}px_{label.split()[0]}.png")
            cells.append((f"{grid}px {label}", im))
        sheet = contact_sheet(cells)
        sheet.save(OUT_DIR / f"contact_sheet_{grid}px.png")
        print(f"grid={grid} done")


if __name__ == "__main__":
    main()
