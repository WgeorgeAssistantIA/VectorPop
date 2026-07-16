"""Prototype v2 : NE PAS simplifier l'image -> la RECONSTRUIRE avec des
primitives vectorielles (cercle / rect arrondi / ellipse) a partir de la
palette dominante. Sortie = vrai SVG, net a n'importe quelle taille.
"""
from __future__ import annotations
import numpy as np
from PIL import Image, ImageDraw
from pathlib import Path
from scipy.cluster.vq import kmeans2
from scipy.ndimage import label, find_objects

SRC = r"C:\Users\William\Downloads\Copilot_20260716_072241.png"
OUT_DIR = Path(r"C:\Users\William\AppData\Local\Temp\claude\C--Users-William-Documents-Entreprenariat\f6243753-b159-4e23-9823-8c693bbcb16a\scratchpad")


def load():
    img = Image.open(SRC).convert("RGB")
    return np.array(img).astype(float)


def bg_color(arr):
    corners = np.concatenate([
        arr[:8, :8].reshape(-1, 3), arr[:8, -8:].reshape(-1, 3),
        arr[-8:, :8].reshape(-1, 3), arr[-8:, -8:].reshape(-1, 3),
    ])
    return corners.mean(axis=0)


def extract_shapes(arr, n_colors: int, n_shapes: int, min_area_frac: float = 0.008):
    H, W, _ = arr.shape
    bg = bg_color(arr)
    dist_bg = np.linalg.norm(arr - bg, axis=-1)
    ink_mask = dist_bg > 22
    ink_pixels = arr[ink_mask]

    # --- 1. palette dominante (k-means sur les pixels "encre") ---
    rng = np.random.default_rng(0)
    sample = ink_pixels[rng.choice(len(ink_pixels), size=min(20000, len(ink_pixels)), replace=False)]
    centers, _ = kmeans2(sample, n_colors, seed=0, minit="++")

    # --- 2. assigner chaque pixel encre a la couleur palette la plus proche ---
    d = np.linalg.norm(arr[..., None, :] - centers[None, None, :, :], axis=-1)  # H,W,n_colors
    assign = np.argmin(d, axis=-1)
    assign[~ink_mask] = -1

    total_ink = ink_mask.sum()
    min_area = total_ink * min_area_frac

    blobs = []
    for ci in range(n_colors):
        mask = assign == ci
        if mask.sum() < min_area:
            continue
        lab, n = label(mask)
        objs = find_objects(lab)
        for i, sl in enumerate(objs, start=1):
            if sl is None:
                continue
            comp_mask = lab[sl] == i
            area = comp_mask.sum()
            if area < min_area:
                continue
            ys, xs = np.nonzero(lab == i)
            cy, cx = ys.mean(), xs.mean()
            y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
            bbox_area = (y1 - y0 + 1) * (x1 - x0 + 1)
            extent = area / bbox_area
            r_max = np.sqrt(((ys - cy) ** 2 + (xs - cx) ** 2).max()) if len(ys) else 1
            roundness = area / (np.pi * r_max ** 2 + 1e-6)
            blobs.append(dict(
                color=tuple(int(c) for c in centers[ci]),
                area=int(area), cx=cx, cy=cy,
                x0=x0, x1=x1, y0=y0, y1=y1,
                extent=extent, roundness=roundness,
            ))

    blobs.sort(key=lambda b: b["area"], reverse=True)
    kept = blobs[:n_shapes]
    # z-order : la plus grande forme (fond du dessin) en premier
    kept.sort(key=lambda b: b["area"], reverse=True)
    return kept, (H, W)


def classify_primitive(b):
    if b["roundness"] > 0.62:
        return "circle"
    if b["extent"] > 0.68:
        return "rect"
    return "ellipse"


def render_svg(blobs, canvas_hw, size_px: int) -> str:
    H, W = canvas_hw
    scale = size_px / max(H, W)
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{size_px}" height="{size_px}" viewBox="0 0 {size_px} {size_px}">']
    for b in blobs:
        kind = classify_primitive(b)
        col = "#%02x%02x%02x" % b["color"]
        cx, cy = b["cx"] * scale, b["cy"] * scale
        if kind == "circle":
            r = np.sqrt(b["area"] / np.pi) * scale
            parts.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{col}"/>')
        elif kind == "rect":
            w = (b["x1"] - b["x0"] + 1) * scale
            h = (b["y1"] - b["y0"] + 1) * scale
            x = b["x0"] * scale
            y = b["y0"] * scale
            rx = min(w, h) * 0.22
            parts.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" rx="{rx:.2f}" fill="{col}"/>')
        else:
            w = (b["x1"] - b["x0"] + 1) * scale / 2
            h = (b["y1"] - b["y0"] + 1) * scale / 2
            parts.append(f'<ellipse cx="{cx:.2f}" cy="{cy:.2f}" rx="{w:.2f}" ry="{h:.2f}" fill="{b["color"] and "#%02x%02x%02x" % b["color"]}"/>')
    parts.append("</svg>")
    return "\n".join(parts)


def render_png_supersampled(blobs, canvas_hw, size_px: int, supersample: int = 8) -> Image.Image:
    H, W = canvas_hw
    big = size_px * supersample
    scale = big / max(H, W)
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for b in blobs:
        kind = classify_primitive(b)
        col = b["color"]
        cx, cy = b["cx"] * scale, b["cy"] * scale
        if kind == "circle":
            r = np.sqrt(b["area"] / np.pi) * scale
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
        elif kind == "rect":
            w = (b["x1"] - b["x0"] + 1) * scale
            h = (b["y1"] - b["y0"] + 1) * scale
            x, y = b["x0"] * scale, b["y0"] * scale
            rx = int(min(w, h) * 0.22)
            d.rounded_rectangle([x, y, x + w, y + h], radius=rx, fill=col)
        else:
            w = (b["x1"] - b["x0"] + 1) * scale / 2
            h = (b["y1"] - b["y0"] + 1) * scale / 2
            d.ellipse([cx - w, cy - h, cx + w, cy + h], fill=col)
    return img.resize((size_px, size_px), Image.LANCZOS)


def contact_sheet(cells, cell_px: int = 220):
    pad = 14
    sheet = Image.new("RGB", (len(cells) * (cell_px + pad) + pad, cell_px + pad * 2 + 30), (235, 235, 232))
    from PIL import ImageDraw as _D
    d = _D.Draw(sheet)
    for i, (label_, im) in enumerate(cells):
        bgpaste = Image.new("RGB", (cell_px, cell_px), (245, 245, 240))
        thumb = im.resize((cell_px, cell_px), Image.NEAREST)
        bgpaste.paste(thumb, (0, 0), thumb)
        x = pad + i * (cell_px + pad)
        sheet.paste(bgpaste, (x, pad + 20))
        d.text((x, 2), label_, fill=(20, 20, 20))
    return sheet


def main():
    arr = load()
    configs = [
        (4, 3, "4 couleurs / 3 formes"),
        (5, 4, "5 couleurs / 4 formes"),
        (6, 5, "6 couleurs / 5 formes"),
    ]
    for size in (32, 16):
        cells = []
        for n_colors, n_shapes, label_ in configs:
            blobs, canvas = extract_shapes(arr, n_colors, n_shapes)
            svg = render_svg(blobs, canvas, size_px=512)
            (OUT_DIR / f"shapegen_{size}px_{n_shapes}formes.svg").write_text(svg, encoding="utf-8")
            png = render_png_supersampled(blobs, canvas, size_px=size)
            png.save(OUT_DIR / f"shapegen_{size}px_{n_shapes}formes.png")
            cells.append((f"{size}px {label_}", png))
        contact_sheet(cells).save(OUT_DIR / f"shapegen_contact_{size}px.png")
        print("done", size)


if __name__ == "__main__":
    main()
