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
        if not params.merge_colors:
            # Sans fusion (degrade/glossy a preserver) : un filtre de mode absorbe
            # les pixels isoles d'anti-aliasing dans leur voisinage dominant AVANT
            # quantification, sans aplatir les vraies bandes de degrade voulues.
            # Sinon chaque pixel de bruit devient sa propre fine couche vtracer
            # (effet "contour en dents de scie" sur les bords ronds).
            rgb = rgb.filter(ImageFilter.ModeFilter(size=3))
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


def _rasterize_svg(svg_path: Path, w: int, h: int) -> np.ndarray:
    """Rend un SVG en tableau RGBA (h, w, 4), pour le comparer pixel a pixel a
    l'image source. Meme approche que gradients._render_label_map (QSvgRenderer
    hors-ecran), mais avec anti-aliasing garde : c'est un rendu visuel, pas un
    plan de labels.
    """
    from PySide6.QtCore import Qt as _Qt  # noqa: PLC0415 - import paresseux (evite Qt en tests headless)
    from PySide6.QtGui import QImage, QPainter
    from PySide6.QtSvg import QSvgRenderer

    img = QImage(w, h, QImage.Format_ARGB32)
    img.fill(_Qt.transparent)
    painter = QPainter(img)
    QSvgRenderer(str(svg_path)).render(painter)
    painter.end()
    ptr = img.constBits()
    arr = np.frombuffer(ptr, np.uint8).reshape(h, w, 4).copy()  # BGRA (little-endian)
    b, g, r, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    return np.dstack([r, g, b, a])


def _diff_score(reference: np.ndarray, candidate: np.ndarray) -> float:
    """Erreur couleur moyenne (0-255) entre 2 images RGBA de meme taille.

    Ponderee par la zone visible (alpha > 0 sur l'une OU l'autre) : une zone
    ratee (presente sur une image, vide sur l'autre) compte comme une pleine
    erreur de couleur plutot que d'etre ignorée.
    """
    visible = (reference[..., 3] > 0) | (candidate[..., 3] > 0)
    if not visible.any():
        return 0.0
    diff = np.abs(reference[..., :3].astype(np.int16) - candidate[..., :3].astype(np.int16))
    return float(diff[visible].mean())


def auto_refine(src: str | Path, dst: str | Path, base_params: VectorParams,
                 progress=None) -> tuple[VectorParams, float]:
    """Recherche automatique de reglages par comparaison a l'image source.

    Teste plusieurs combinaisons (precision couleur / fusion / seuil de coin),
    rend chaque candidat et mesure son ecart pixel a l'original ; garde le
    meilleur. Plus lent qu'une vectorisation simple (~N passes) : reserve a un
    bouton dedie plutot qu'a l'apercu live. `progress(i, total, score)` est
    appele apres chaque candidat si fourni.
    """
    src, dst = Path(src), Path(dst)
    ref_png = _preprocess(src, base_params, reduce_colors=False)  # verite terrain : pas de quantif.
    try:
        ref_img = Image.open(ref_png).convert("RGBA")
        w, h = ref_img.size
        reference = np.asarray(ref_img)
    finally:
        ref_png.unlink(missing_ok=True)

    candidates: list[VectorParams] = []
    for colors in (6, 8):
        for merge_thr in (0, 20, 36):
            for corner in (35, 50):
                p = VectorParams(**asdict(base_params))
                p.color_precision = colors
                p.merge_colors = merge_thr > 0
                p.merge_threshold = merge_thr
                p.corner_threshold = corner
                candidates.append(p)

    fd, tmp_svg = tempfile.mkstemp(suffix=".svg")
    os.close(fd)
    best_params, best_score = base_params, float("inf")
    try:
        for i, p in enumerate(candidates, 1):
            vectorize(src, tmp_svg, p)
            rendered = _rasterize_svg(Path(tmp_svg), w, h)
            score = _diff_score(reference, rendered)
            if progress:
                progress(i, len(candidates), score)
            if score < best_score:
                best_score, best_params = score, p
        vectorize(src, dst, best_params)
    finally:
        Path(tmp_svg).unlink(missing_ok=True)
    return best_params, best_score
