"""Coeur de vectorisation : enrobe vtracer + un pre-traitement Pillow.

Tout passe par `vectorize()`. Le pre-traitement (reduction de couleurs,
seuillage N&B) est ce qui fera la difference avec un convertisseur en ligne.
"""

from __future__ import annotations

import os
import tempfile
from dataclasses import dataclass, asdict
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import vtracer


@dataclass
class VectorParams:
    """Reglages exposes a l'utilisateur (sliders + preset)."""

    colormode: str = "color"          # "color" | "binary"
    filter_speckle: int = 4           # supprime les petits parasites (0-20)
    color_precision: int = 6          # nombre de couleurs (1-8)
    layer_difference: int = 16        # ecart entre couches de couleur
    corner_threshold: int = 60        # angle min pour un coin (0-180)
    length_threshold: float = 4.0     # longueur min de segment
    splice_threshold: int = 45        # lissage des courbes
    path_precision: int = 8           # decimales des coordonnees
    mode: str = "spline"             # "spline" | "polygon" | "none"
    alpha_threshold: int = 128        # seuil alpha : pixels moins opaques -> transparents
    keep_transparency: bool = True    # garder le fond transparent (vs aplatir sur blanc)
    remove_background: bool = False   # detecter et effacer le fond uni (coins)
    bg_tolerance: int = 32            # tolerance couleur pour le fond (0-120)
    remove_background_ai: bool = False  # detourage IA (rembg) pour fond complexe
    merge_colors: bool = True         # fusionne les teintes proches (aplats plus francs)
    merge_threshold: int = 24         # distance RGB max pour fusionner (0-100)
    contrast: int = 0                 # renforce/adoucit le contraste avant trace (-50..50)
    sharpen: int = 0                  # nettete (unsharp mask) avant trace (0..100)


# Presets pretournes par l'UI selon le type de logo.
# Cles = identifiants stables (langue-independants) ; les libelles affiches
# viennent de i18n.PRESET_LABELS pour rester traduisibles sans casser les
# reglages sauvegardes (QSettings) ni les recettes de app.py (RECIPES).
PRESETS: dict[str, VectorParams] = {
    "flat": VectorParams(
        colormode="color", filter_speckle=4, color_precision=6,
        corner_threshold=60, mode="spline",
    ),
    "detailed": VectorParams(
        colormode="color", filter_speckle=2, color_precision=8,
        layer_difference=8, corner_threshold=40, mode="spline",
    ),
    "bw": VectorParams(
        colormode="binary", filter_speckle=4, corner_threshold=60,
        mode="spline",
    ),
}


def _remove_background(img: Image.Image, tolerance: int) -> Image.Image:
    """Rend transparent le fond uni, estime depuis les 4 coins de l'image.

    Marche sur un fond plein (blanc, couleur unie). Pour un fond complexe
    (photo, degrade), prefere un detourage manuel en amont.
    """
    arr = np.asarray(img.convert("RGBA")).copy()
    h, w = arr.shape[:2]
    corners = np.array([
        arr[0, 0, :3], arr[0, w - 1, :3],
        arr[h - 1, 0, :3], arr[h - 1, w - 1, :3],
    ], dtype=np.int16)
    bg = np.median(corners, axis=0)                       # couleur de fond probable
    dist = np.sqrt(((arr[:, :, :3].astype(np.int16) - bg) ** 2).sum(axis=2))
    arr[dist <= tolerance, 3] = 0                         # proche du fond -> transparent
    return Image.fromarray(arr, "RGBA")


def _remove_background_ai(img: Image.Image) -> Image.Image:
    """Detourage par IA (rembg). Gere les fonds complexes (photo, degrade).

    rembg est une grosse dependance optionnelle (onnxruntime + modele).
    Import paresseux : on ne paie le cout que si l'option est activee.
    """
    try:
        from rembg import remove  # noqa: PLC0415 - import paresseux volontaire
    except ImportError as e:
        raise RuntimeError(
            "Le detourage IA necessite 'rembg'.\n"
            "Installe-le :  pip install rembg onnxruntime"
        ) from e
    return remove(img.convert("RGBA"))


def _merge_near_colors(rgb: Image.Image, threshold: int) -> Image.Image:
    """Fusionne les couleurs perceptuellement proches en une seule teinte.

    Apres quantification il reste souvent des nuances quasi-identiques (degrades
    residuels, bruit JPEG) qui deviennent autant de calques chez vtracer. On
    garde les couleurs les plus FREQUENTES comme representantes et on absorbe
    dedans toute teinte a distance RGB <= threshold. Resultat : aplats francs,
    moins de paths.
    """
    if threshold <= 0:
        return rgb

    arr = np.asarray(rgb, dtype=np.uint8).reshape(-1, 3)
    colors, counts = np.unique(arr, axis=0, return_counts=True)
    # Couleurs dominantes d'abord : elles servent de representantes.
    order = np.argsort(-counts)
    colors = colors[order]

    reps: list[np.ndarray] = []          # representantes retenues (float, anti-overflow)
    remap = np.empty((len(colors), 3), dtype=np.uint8)
    thr_sq = float(threshold) ** 2       # on compare des distances au carre
    for i, c in enumerate(colors):
        ci = c.astype(np.float64)
        merged = False
        for r in reps:
            if ((ci - r) ** 2).sum() <= thr_sq:
                remap[i] = r.astype(np.uint8)
                merged = True
                break
        if not merged:
            reps.append(ci)
            remap[i] = c

    # Remappe chaque couleur source vers sa representante (palette <= 256 -> rapide).
    out = arr.copy()
    for i, c in enumerate(colors):
        if not np.array_equal(c, remap[i]):
            out[np.all(arr == c, axis=1)] = remap[i]

    return Image.fromarray(out.reshape(np.asarray(rgb).shape), "RGB")


def _preprocess(src: Path, params: VectorParams, reduce_colors: bool) -> Path:
    """Nettoie l'image avant vectorisation. Renvoie un PNG temporaire.

    Cle du rendu propre : on NE remplit PAS le fond transparent. On nettoie
    plutot le canal alpha (seuillage net) pour supprimer l'ombre portee et le
    halo d'anti-aliasing, qui sinon se transforment en milliers de paths gris.
    """
    img = Image.open(src).convert("RGBA")

    if params.remove_background_ai:
        # Detourage IA : prioritaire, gere les fonds non unis.
        img = _remove_background_ai(img)
    elif params.remove_background:
        # Efface le fond uni : utile quand l'image n'a pas de transparence.
        img = _remove_background(img, params.bg_tolerance)

    r, g, b, a = img.split()

    if params.keep_transparency:
        # Seuillage de l'alpha : pixel franchement opaque -> garde, sinon -> vide.
        # Supprime ombres semi-transparentes et bavures de bord = SVG net.
        a = a.point(lambda p: 255 if p >= params.alpha_threshold else 0)
    else:
        # Aplatit sur blanc (cas d'une image deja sans transparence utile).
        a = Image.new("L", img.size, 255)

    rgb = Image.merge("RGB", (r, g, b))

    # Retouches AU SERVICE de la vectorisation : mieux separer les aplats avant vtracer.
    if params.contrast:
        rgb = ImageEnhance.Contrast(rgb).enhance(1 + params.contrast / 100)
    if params.sharpen:
        # Unsharp mask : accentue les bords -> tracés plus francs sur images molles.
        rgb = rgb.filter(ImageFilter.UnsharpMask(
            radius=2, percent=params.sharpen * 2, threshold=2))

    if params.colormode == "binary":
        # Niveaux de gris -> seuillage net : ideal pour un trait propre.
        rgb = rgb.convert("L").point(lambda p: 255 if p > 128 else 0).convert("RGB")
    elif reduce_colors:
        # Quantification : reduit le bruit de couleur avant vtracer = moins de paths.
        n = max(2, min(256, 2 ** params.color_precision))
        rgb = rgb.quantize(colors=n, method=Image.MEDIANCUT).convert("RGB")
        if params.merge_colors:
            # Fusion des teintes proches : aplats plus francs, moins de calques.
            rgb = _merge_near_colors(rgb, params.merge_threshold)

    # On recompose en RGBA : vtracer ignore les zones totalement transparentes.
    out = Image.merge("RGBA", (*rgb.split(), a))

    fd, tmp = tempfile.mkstemp(suffix=".png")
    os.close(fd)  # sinon Windows garde un verrou sur le fichier
    out.save(tmp)
    return Path(tmp)


def vectorize(src: str | Path, dst: str | Path,
              params: VectorParams, reduce_colors: bool = True) -> Path:
    """Vectorise `src` vers le fichier SVG `dst`. Renvoie le chemin SVG."""
    src, dst = Path(src), Path(dst)
    prepped = _preprocess(src, params, reduce_colors)
    try:
        vtracer.convert_image_to_svg_py(
            str(prepped), str(dst),
            colormode=params.colormode,
            hierarchical="stacked",
            mode=params.mode,
            filter_speckle=params.filter_speckle,
            color_precision=params.color_precision,
            layer_difference=params.layer_difference,
            corner_threshold=params.corner_threshold,
            length_threshold=params.length_threshold,
            splice_threshold=params.splice_threshold,
            path_precision=params.path_precision,
        )
    finally:
        prepped.unlink(missing_ok=True)
    return dst
