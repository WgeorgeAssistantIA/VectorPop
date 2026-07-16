"""Prototype v3 : meme reconstruction par primitives (v2), mais selection
des formes par SAILLANCE (contraste local + compacite + proximite du
centre) au lieu de l'aire brute -- pour eviter que 2 grosses barres ternes
eliminent les 2 petits yeux qui sont l'element le plus identifiant.
"""
from __future__ import annotations
import numpy as np
from PIL import Image, ImageDraw
from pathlib import Path
from scipy.cluster.vq import kmeans2
from scipy.ndimage import label, find_objects, binary_dilation

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


def extract_shapes(arr, n_colors: int, n_shapes: int, min_area_frac: float = 0.0015):
    H, W, _ = arr.shape
    bg = bg_color(arr)
    dist_bg = np.linalg.norm(arr - bg, axis=-1)
    ink_mask = dist_bg > 22
    ink_pixels = arr[ink_mask]

    rng = np.random.default_rng(0)
    sample = ink_pixels[rng.choice(len(ink_pixels), size=min(20000, len(ink_pixels)), replace=False)]
    centers, _ = kmeans2(sample, n_colors, seed=0, minit="++")

    d = np.linalg.norm(arr[..., None, :] - centers[None, None, :, :], axis=-1)
    assign = np.argmin(d, axis=-1)
    assign[~ink_mask] = -1

    total_ink = ink_mask.sum()
    min_area = total_ink * min_area_frac
    cx_img, cy_img = W / 2, H / 2
    diag = np.hypot(H, W)
    dilate_px = max(2, int(round(min(H, W) * 0.015)))
    struct = np.ones((3, 3), dtype=bool)

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
            comp_mask = lab == i
            area = comp_mask.sum()
            if area < min_area:
                continue
            ys, xs = np.nonzero(comp_mask)
            cy, cx = ys.mean(), xs.mean()
            y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
            bbox_area = (y1 - y0 + 1) * (x1 - x0 + 1)
            extent = area / bbox_area
            r_max = np.sqrt(((ys - cy) ** 2 + (xs - cx) ** 2).max()) if len(ys) else 1
            roundness = area / (np.pi * r_max ** 2 + 1e-6)

            # --- contraste local : anneau juste autour du blob ---
            dil = comp_mask
            for _ in range(dilate_px):
                dil = binary_dilation(dil, structure=struct)
            ring = dil & ~comp_mask
            if ring.sum() > 0:
                ring_color = arr[ring].mean(axis=0)
            else:
                ring_color = bg
            blob_color = arr[comp_mask].mean(axis=0)
            contrast = np.linalg.norm(blob_color - ring_color)

            dist_center = np.hypot(cx - cx_img, cy - cy_img) / (diag / 2)
            centrality = 1 - min(dist_center, 1.0)

            blobs.append(dict(
                color=tuple(int(c) for c in blob_color),
                area=int(area), cx=cx, cy=cy,
                x0=x0, x1=x1, y0=y0, y1=y1,
                extent=extent, roundness=roundness,
                contrast=contrast, centrality=centrality,
            ))

    if not blobs:
        return [], (H, W)

    areas = np.array([b["area"] for b in blobs], dtype=float)
    contrasts = np.array([b["contrast"] for b in blobs], dtype=float)
    roundnesses = np.array([b["roundness"] for b in blobs], dtype=float)
    centralities = np.array([b["centrality"] for b in blobs], dtype=float)

    def norm(x):
        rng_ = x.max() - x.min()
        return (x - x.min()) / rng_ if rng_ > 1e-9 else np.zeros_like(x)

    area_n = norm(np.log(areas + 1))       # log pour atténuer l'effet "grosse zone"
    contrast_n = norm(contrasts)
    round_n = norm(roundnesses)
    central_n = norm(centralities)

    salience = 0.20 * area_n + 0.45 * contrast_n + 0.15 * round_n + 0.20 * central_n
    for b, s in zip(blobs, salience):
        b["salience"] = float(s)

    blobs.sort(key=lambda b: b["salience"], reverse=True)

    # toujours garder la plus grande forme comme "socle" (silhouette) + les
    # plus saillantes ensuite, avec suppression des doublons trop proches
    base = max(blobs, key=lambda b: b["area"])
    kept = [base]
    min_dist = min(H, W) * 0.12
    for b in blobs:
        if len(kept) >= n_shapes:
            break
        if b is base:
            continue
        if any(np.hypot(b["cx"] - k["cx"], b["cy"] - k["cy"]) < min_dist for k in kept):
            continue
        kept.append(b)
    kept.sort(key=lambda b: b["area"], reverse=True)  # z-order : grand d'abord
    return kept, (H, W)


def classify_primitive(b):
    if b["roundness"] > 0.62:
        return "circle"
    if b["extent"] > 0.68:
        return "rect"
    return "ellipse"


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
        (5, 3, "5 couleurs / 3 formes"),
        (6, 4, "6 couleurs / 4 formes"),
        (6, 5, "6 couleurs / 5 formes"),
    ]
    for size in (32, 16):
        cells = []
        for n_colors, n_shapes, label_ in configs:
            blobs, canvas = extract_shapes(arr, n_colors, n_shapes)
            png = render_png_supersampled(blobs, canvas, size_px=size)
            png.save(OUT_DIR / f"shapegen2_{size}px_{n_shapes}formes.png")
            cells.append((f"{size}px {label_}", png))
        contact_sheet(cells).save(OUT_DIR / f"shapegen2_contact_{size}px.png")
        print("done", size)


if __name__ == "__main__":
    main()
