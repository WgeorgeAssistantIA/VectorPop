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
    clean_edges: bool = True          # supprime les liseres d'anti-aliasing (mode aplats)
    ai_upscale: bool = False          # finition IA : upscale x4 (Real-ESRGAN) avant trace
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


def _suppress_aa_fringes(rgb: Image.Image, opaque: np.ndarray,
                         mix_tol: int = 40, dup_tol: int = 48,
                         max_frac: float = 0.10, max_pass: int = 3) -> Image.Image:
    """Nettoie les couches « ruban » creees par l'anti-aliasing de la source.

    Apres quantification, les pixels de bord (mi-forme, mi-fond) deviennent de
    fines couches a part entiere que vtracer trace en liseres disgracieux,
    tres visibles au zoom. On les pele passe par passe (un bord AA fait
    souvent plusieurs bandes superposees).
    """
    for _ in range(max_pass):
        out = _suppress_aa_fringes_once(rgb, opaque, mix_tol, dup_tol, max_frac)
        if out is rgb:
            break
        rgb = out
    return rgb


def _suppress_aa_fringes_once(rgb: Image.Image, opaque: np.ndarray,
                              mix_tol: int, dup_tol: int,
                              max_frac: float) -> Image.Image:
    """Une passe de nettoyage. Renvoie `rgb` inchange (meme objet) si rien a faire.

    Cible : les couches SANS corps (videes par une double erosion = rubans de
    1 a 4 px de large). Deux cas, jamais confondus :
    - Lisere AA : sa couleur est un melange STRICTEMENT intermediaire des deux
      couleurs qu'il separe (projection t dans [0.15, 0.85] sur le segment RGB
      [voisin A, voisin B], a moins de `mix_tol`). Supprime, puis reabsorbe
      symetriquement par ses deux cotes : le vrai bord tombe au milieu du ruban.
    - Bande de nuance : quasi-doublon d'UN voisin (distance <= `dup_tol`),
      typiquement du bruit de quantification accroche aux bords d'une forme.
      Recoloree dans ce voisin SANS toucher a la geometrie (preserve lettres
      et traits fins).
    Un trait fin de couleur franche (etoile, contour voulu) ne remplit aucun
    des deux criteres et reste intact.
    """
    arr = np.asarray(rgb, dtype=np.uint8)
    h, w = arr.shape[:2]
    colors, inverse = np.unique(arr.reshape(-1, 3), axis=0, return_inverse=True)
    labels = inverse.reshape(h, w).astype(np.int32)
    labels[~opaque] = -1
    n_opaque = int(opaque.sum())
    if n_opaque == 0 or len(colors) < 3:
        return rgb
    areas = np.bincount(labels[labels >= 0].ravel(), minlength=len(colors))

    def _shift(m: np.ndarray, dy: int, dx: int, fill=False):
        out = np.full_like(m, fill)
        hs, ws = m.shape
        ys, xs = slice(max(dy, 0), hs + min(dy, 0)), slice(max(dx, 0), ws + min(dx, 0))
        yd, xd = slice(max(-dy, 0), hs + min(-dy, 0)), slice(max(-dx, 0), ws + min(-dx, 0))
        out[yd, xd] = m[ys, xs]
        return out

    def _erode(m):
        return (m & _shift(m, 1, 0) & _shift(m, -1, 0)
                  & _shift(m, 0, 1) & _shift(m, 0, -1))

    fringe = np.zeros((h, w), bool)
    recolor: dict[int, int] = {}          # label ruban -> label voisin adoptif
    for ci in range(len(colors)):
        area = int(areas[ci])
        if area == 0 or area > max_frac * n_opaque:
            continue
        mask = labels == ci
        ys, xs = np.nonzero(mask)
        y0, y1 = max(0, int(ys.min()) - 3), min(h, int(ys.max()) + 4)
        x0, x1 = max(0, int(xs.min()) - 3), min(w, int(xs.max()) + 4)
        sub = mask[y0:y1, x0:x1]
        core = _erode(_erode(sub))
        if core.sum() > max(2, 0.02 * area):
            continue                      # la couche a un corps : pas un ruban
        ring = (_shift(sub, 1, 0) | _shift(sub, -1, 0)
                | _shift(sub, 0, 1) | _shift(sub, 0, -1)) & ~sub
        neigh = labels[y0:y1, x0:x1][ring]
        neigh = neigh[(neigh >= 0) & (neigh != ci)]
        if neigh.size == 0:
            continue
        counts = np.bincount(neigh, minlength=len(colors))
        order = np.argsort(-counts)
        la = int(order[0])
        lb = int(order[1]) if len(order) > 1 and counts[order[1]] > 0 else la
        ca, cb = colors[la].astype(np.float64), colors[lb].astype(np.float64)
        c = colors[ci].astype(np.float64)
        ab = cb - ca
        denom = float((ab * ab).sum())
        t = 0.0 if denom == 0 else float(np.clip(((c - ca) * ab).sum() / denom, 0.0, 1.0))
        dist = float(np.sqrt(((c - (ca + t * ab)) ** 2).sum()))
        d_a = float(np.sqrt(((c - ca) ** 2).sum()))
        d_b = float(np.sqrt(((c - cb) ** 2).sum()))
        if la != lb and 0.15 <= t <= 0.85 and dist <= mix_tol:
            fringe[y0:y1, x0:x1] |= sub          # vrai lisere AA
        elif min(d_a, d_b) <= dup_tol:
            recolor[ci] = la if d_a <= d_b else lb  # bande de nuance

    if not fringe.any() and not recolor:
        return rgb

    out_labels = labels.copy()
    for ci, target in recolor.items():
        out_labels[labels == ci] = target

    if fringe.any():
        out_labels[fringe] = -2                  # a remplir depuis les 2 cotes
        dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        row_idx = np.arange(h)[:, None]
        col_idx = np.arange(w)[None, :]
        for _ in range(8):
            todo = out_labels == -2
            if not todo.any():
                break
            # Vote majoritaire symetrique sur les 4 voisins deja resolus.
            cand = np.stack([_shift(out_labels, dy, dx, fill=-1) for dy, dx in dirs])
            valid = cand >= 0
            score = np.zeros(cand.shape, np.int8)
            for i in range(4):
                for j in range(4):
                    score[i] += (valid[i] & valid[j] & (cand[i] == cand[j]))
            score[~valid] = 0
            best = np.argmax(score, axis=0)
            got = todo & valid[best, row_idx, col_idx]
            pick = cand[best, row_idx, col_idx]
            out_labels[got] = pick[got]

    out = arr.reshape(-1, 3).copy()
    changed = (out_labels != labels) & (out_labels >= 0)
    out[changed.ravel()] = colors[out_labels[changed]]
    return Image.fromarray(out.reshape(h, w, 3), "RGB")


def _project_on_source_palette(rgb: Image.Image, source: Image.Image,
                               params: VectorParams) -> Image.Image:
    """Projette `rgb` (image agrandie par IA) sur la palette de `source`.

    Le modele de super-resolution fournit la GEOMETRIE (bords lisses) mais
    invente des rampes de couleur le long des bords (overshoot GAN) qui
    polluent la quantification. La verite couleur, c'est la source : on
    quantifie SA palette, puis chaque pixel agrandi est rabattu sur la couleur
    source la plus proche. Toute teinte hallucinee disparait par construction.
    """
    n = max(2, min(256, 2 ** params.color_precision))
    pal_img = source.convert("RGB").quantize(colors=n, method=Image.MEDIANCUT).convert("RGB")
    pal_img = _merge_near_colors(pal_img, params.merge_threshold)
    palette = np.unique(np.asarray(pal_img, np.uint8).reshape(-1, 3), axis=0).astype(np.float32)

    # Projection directe pixel -> couleur la plus proche, par blocs pour rester
    # sobre en memoire (PAS de quantize() intermediaire : son tramage
    # Floyd-Steinberg pulverise les rampes du modele en damier de bruit).
    arr = np.asarray(rgb, np.uint8)
    h, w = arr.shape[:2]
    flat = arr.reshape(-1, 3)
    out = np.empty_like(flat)
    step = 500_000
    for i in range(0, len(flat), step):
        block = flat[i:i + step].astype(np.float32)
        d = ((block[:, None, :] - palette[None, :, :]) ** 2).sum(axis=2)
        out[i:i + step] = palette[np.argmin(d, axis=1)].astype(np.uint8)
    return Image.fromarray(out.reshape(h, w, 3), "RGB")


def _preprocess(src: Path, params: VectorParams, reduce_colors: bool) -> Path:
    """Nettoie l'image avant vectorisation. Renvoie un PNG temporaire.

    Cle du rendu propre : on NE remplit PAS le fond transparent. On nettoie
    plutot le canal alpha (seuillage net) pour supprimer l'ombre portee et le
    halo d'anti-aliasing, qui sinon se transforment en milliers de paths gris.
    """
    img = Image.open(src).convert("RGBA")

    source_ref: Image.Image | None = None
    if params.ai_upscale:
        # Finition IA : la source est redessinee x4 par Real-ESRGAN avant tout
        # traitement -> bords francs et sans bruit, courbes lisses au trace.
        # On garde la source comme reference couleur (cf. projection palette).
        from .ai_upscale import upscale_x4  # noqa: PLC0415 - import paresseux volontaire
        source_ref = img
        img = upscale_x4(img)

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
        if source_ref is not None and params.merge_colors:
            # Image agrandie par IA : les couleurs de verite sont celles de la
            # source, pas celles (hallucinees sur les bords) du modele.
            rgb = _project_on_source_palette(rgb, source_ref, params)
        else:
            # Quantification : reduit le bruit de couleur avant vtracer = moins de paths.
            n = max(2, min(256, 2 ** params.color_precision))
            rgb = rgb.quantize(colors=n, method=Image.MEDIANCUT).convert("RGB")
            if params.merge_colors:
                # Fusion des teintes proches : aplats plus francs, moins de calques.
                rgb = _merge_near_colors(rgb, params.merge_threshold)
        if params.merge_colors and params.clean_edges:
            # Contours nets : supprime les liseres d'anti-aliasing restants.
            # Reserve au mode aplats : en mode degrades, les fines bandes
            # SONT le degrade voulu.
            rgb = _suppress_aa_fringes(rgb, np.asarray(a) > 0)

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
