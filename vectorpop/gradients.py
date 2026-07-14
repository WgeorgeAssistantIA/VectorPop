"""Reconstruction de dégradés dans un SVG vtracer (fidèle, sans IA générative).

Principe : vtracer trace de bonnes FORMES mais les remplit en aplats, ce qui
transforme un dégradé en une pile de bandes de couleur. Ici on ne touche pas à
la géométrie : on regroupe les bandes contiguës et proches en couleur (= un même
dégradé), on estime un <linearGradient> à partir des pixels D'ORIGINE, puis on
remplit toutes les bandes du groupe avec ce dégradé partagé (userSpaceOnUse).
Les coutures entre bandes disparaissent -> rendu lisse, aucun détail inventé.

Dépend seulement de numpy + Qt (déjà présents). Pas de dépendance lourde.
"""

from __future__ import annotations

import re

import numpy as np
from PIL import Image
from PySide6.QtCore import Qt
from PySide6.QtGui import QImage, QPainter
from PySide6.QtSvg import QSvgRenderer

# <path ... d="..." ... fill="#rrggbb" ... /> — attributs dans un ordre quelconque.
_PATH = re.compile(r"<path\b[^>]*?/>", re.S)
_FILL = re.compile(r'fill="(#[0-9a-fA-F]{6})"')
_SVG_OPEN = re.compile(r"<svg\b[^>]*>", re.S)
_WH = re.compile(r'\b(width|height)="([0-9.]+)')
_FILL_ANY = re.compile(r'fill="([^"]+)"')       # n'importe quel remplissage (hex ou url)
_D = re.compile(r'\bd="([^"]*)"')
_TRANSLATE = re.compile(r'transform="translate\(\s*(-?[\d.]+)[ ,]+(-?[\d.]+)\s*\)"')
_TRANSLATE_ATTR = re.compile(r'\s*transform="translate\([^)]*\)"')
_DTOKEN = re.compile(r"[A-Za-z]|-?\d*\.?\d+")


def _offset_d(d: str, tx: float, ty: float) -> str:
    """Ajoute (tx, ty) à toutes les coordonnées d'un `d` en commandes absolues.

    vtracer n'émet que M/L/C/Z (paires x,y) : on décale x sur les indices pairs,
    y sur les impairs, en réinitialisant à chaque lettre de commande.
    """
    out, parity = [], 0
    for tok in _DTOKEN.findall(d):
        if tok.isalpha():
            out.append(tok)
            parity = 0
            continue
        v = float(tok) + (tx if parity % 2 == 0 else ty)
        out.append(f"{v:.3f}".rstrip("0").rstrip("."))
        parity += 1
    return " ".join(out)


def _flatten_translate(path: str) -> str:
    """Intègre un éventuel translate() dans le `d` et retire l'attribut transform.

    Nécessaire car nos dégradés sont en coordonnées globales (userSpaceOnUse) :
    un transform par path les décalerait de façon incohérente entre bandes.
    """
    tm = _TRANSLATE.search(path)
    if not tm:
        return path
    tx, ty = float(tm.group(1)), float(tm.group(2))
    dm = _D.search(path)
    if dm:
        path = path[:dm.start(1)] + _offset_d(dm.group(1), tx, ty) + path[dm.end(1):]
    return _TRANSLATE_ATTR.sub("", path)


def _hex_to_rgb(h: str) -> tuple[int, int, int]:
    return int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)


def _rgb_to_hex(r, g, b) -> str:
    return f"#{int(round(r)):02x}{int(round(g)):02x}{int(round(b)):02x}"


class _UnionFind:
    def __init__(self, n):
        self.p = list(range(n))

    def find(self, a):
        while self.p[a] != a:
            self.p[a] = self.p[self.p[a]]
            a = self.p[a]
        return a

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[rb] = ra


def _render_label_map(svg_text: str, paths: list[str], w: int, h: int) -> np.ndarray:
    """Rend un SVG où chaque path porte une couleur = son index -> carte de labels.

    Retourne un tableau (h, w) int32 : index du path visible par pixel, -1 = vide.
    Antialiasing désactivé pour garder des frontières nettes (couleurs exactes).
    """
    # SVG "indexé" : on remplace le fill de chaque path par une couleur = son index.
    indexed = svg_text
    for i, p in enumerate(paths):
        color = f"#{i:06x}"
        # Force la couleur = index, quel que soit le remplissage d'origine (hex OU url).
        if _FILL_ANY.search(p):
            new_p = _FILL_ANY.sub(f'fill="{color}"', p, count=1)
        else:
            new_p = p.replace("/>", ' fill="' + color + '"/>', 1)
        new_p = new_p.replace("/>", ' stroke="none"/>', 1)
        indexed = indexed.replace(p, new_p, 1)

    img = QImage(w, h, QImage.Format_ARGB32)
    img.fill(Qt.transparent)
    painter = QPainter(img)
    painter.setRenderHint(QPainter.Antialiasing, False)
    painter.setRenderHint(QPainter.SmoothPixmapTransform, False)
    QSvgRenderer(indexed.encode("utf-8")).render(painter)
    painter.end()

    ptr = img.constBits()
    arr = np.frombuffer(ptr, np.uint8).reshape(h, w, 4)  # BGRA (little-endian)
    b, g, r, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    labels = (r.astype(np.int32) << 16) | (g.astype(np.int32) << 8) | b.astype(np.int32)
    labels[a < 128] = -1
    labels[labels >= len(paths)] = -1
    return labels


def _fit_linear_gradient(xs, ys, cols, stops):
    """Estime axe + arrêts d'un dégradé linéaire depuis des pixels échantillonnés.

    Retourne (p1, p2, [(offset, (r,g,b))...]) ou None si la zone est trop plate.
    """
    n = len(xs)
    if n < 20:
        return None
    A = np.column_stack([xs, ys, np.ones(n)])
    # Régression couleur = a*x + b*y + c par canal -> vecteur de dégradé (a, b).
    vecs = []
    for ch in range(3):
        coef, *_ = np.linalg.lstsq(A, cols[:, ch], rcond=None)
        vecs.append(coef[:2])
    vecs = np.array(vecs)                       # (3, 2)
    norms = np.linalg.norm(vecs, axis=1)
    direction = (vecs * norms[:, None]).sum(axis=0)   # somme pondérée par l'amplitude
    dn = np.linalg.norm(direction)
    if dn < 1e-6:
        return None
    d = direction / dn

    pos = np.column_stack([xs, ys]).astype(np.float64)
    t = pos @ d
    tmin, tmax = t.min(), t.max()
    if tmax - tmin < 3:                          # variation spatiale négligeable
        return None
    mean_pos = pos.mean(axis=0)
    tmean = t.mean()
    p1 = mean_pos + d * (tmin - tmean)
    p2 = mean_pos + d * (tmax - tmean)

    # Arrêts répartis sur TOUTE la plage (0..1) pour atteindre les couleurs
    # extrêmes : couleur médiane des pixels proches de chaque position d'arrêt.
    stop_list = []
    span = tmax - tmin
    win = span / (2 * (stops - 1))
    for q in np.linspace(0.0, 1.0, stops):
        tq = tmin + q * span
        sel = np.abs(t - tq) <= max(win, 1.0)
        if sel.sum() < 3:                        # tranche vide : plus proches voisins
            near = np.argsort(np.abs(t - tq))[:20]
            med = np.median(cols[near], axis=0)
        else:
            med = np.median(cols[sel], axis=0)
        stop_list.append((float(q), tuple(med)))
    if len(stop_list) < 2:
        return None

    # Écart couleur global : si presque plat, ne pas transformer en dégradé.
    first, last = np.array(stop_list[0][1]), np.array(stop_list[-1][1])
    if np.linalg.norm(first - last) < 12:
        return None
    return p1, p2, stop_list


def gradientize_svg(svg_text: str, source: Image.Image,
                    color_merge: int = 40, stops: int = 5,
                    max_samples: int = 5000) -> str:
    """Remplace les groupes de bandes par de vrais dégradés linéaires.

    `source` = image d'origine (RGB) alignée sur les coordonnées du SVG vtracer
    (vtracer sort width/height = pixels image, coords en pixels : alignement direct).
    """
    # Aplatit les translate() de vtracer -> paths en coordonnées globales.
    orig_paths = _PATH.findall(svg_text)
    for op in orig_paths:
        fp = _flatten_translate(op)
        if fp != op:
            svg_text = svg_text.replace(op, fp, 1)

    paths = _PATH.findall(svg_text)
    if len(paths) < 2:
        return svg_text

    m = _SVG_OPEN.search(svg_text)
    if not m:
        return svg_text
    dims = dict((k, float(v)) for k, v in _WH.findall(m.group(0)))
    w = int(round(dims.get("width", source.width)))
    h = int(round(dims.get("height", source.height)))
    if w <= 0 or h <= 0:
        return svg_text

    fills = []
    for p in paths:
        fm = _FILL.search(p)
        fills.append(_hex_to_rgb(fm.group(1)) if fm else None)

    labels = _render_label_map(svg_text, paths, w, h)

    # Adjacence entre bandes voisines (horizontale + verticale).
    uf = _UnionFind(len(paths))
    for a, bmap in (("h", labels[:, :-1]), ("v", labels[:-1, :])):
        other = labels[:, 1:] if a == "h" else labels[1:, :]
        mask = (bmap != other) & (bmap >= 0) & (other >= 0)
        pairs = np.unique(np.stack([bmap[mask], other[mask]], axis=1), axis=0)
        for i, j in pairs:
            fi, fj = fills[i], fills[j]
            if fi and fj and np.linalg.norm(np.subtract(fi, fj)) <= color_merge:
                uf.union(int(i), int(j))

    # Regroupe les indices de path par racine union-find.
    groups: dict[int, list[int]] = {}
    for i in range(len(paths)):
        groups.setdefault(uf.find(i), []).append(i)

    src = np.asarray(source.convert("RGB"))
    ys_all, xs_all = np.mgrid[0:h, 0:w]
    defs = []
    fill_override: dict[int, str] = {}
    gid = 0

    for members in groups.values():
        if len(members) < 2:
            continue                              # une bande seule : pas un dégradé
        member_set = set(members)
        mask = np.isin(labels, list(member_set))
        cnt = int(mask.sum())
        if cnt < 50:
            continue
        ys = ys_all[mask]
        xs = xs_all[mask]
        # Sous-échantillonnage pour la vitesse.
        if cnt > max_samples:
            idx = np.random.default_rng(0).choice(cnt, max_samples, replace=False)
            xs, ys = xs[idx], ys[idx]
        cols = src[ys, xs].astype(np.float64)
        fit = _fit_linear_gradient(xs.astype(np.float64), ys.astype(np.float64), cols, stops)
        if fit is None:
            continue
        p1, p2, stop_list = fit
        gid += 1
        gname = f"vpg{gid}"
        stops_svg = "".join(
            f'<stop offset="{off:.3f}" stop-color="{_rgb_to_hex(*c)}"/>'
            for off, c in stop_list
        )
        defs.append(
            f'<linearGradient id="{gname}" gradientUnits="userSpaceOnUse" '
            f'x1="{p1[0]:.1f}" y1="{p1[1]:.1f}" x2="{p2[0]:.1f}" y2="{p2[1]:.1f}">'
            f"{stops_svg}</linearGradient>"
        )
        for i in member_set:
            fill_override[i] = gname

    if not defs:
        return svg_text

    # Réécrit les fills des paths concernés.
    out = svg_text
    for i, gname in fill_override.items():
        p = paths[i]
        new_p = _FILL.sub(f'fill="url(#{gname})"', p, count=1)
        out = out.replace(p, new_p, 1)

    # Insère les <defs> juste après la balise <svg ...>.
    defs_block = "<defs>" + "".join(defs) + "</defs>"
    out = _SVG_OPEN.sub(lambda mm: mm.group(0) + defs_block, out, count=1)
    return out


def _fill_of(path: str):
    m = _FILL_ANY.search(path)
    return m.group(1) if m else None


def remove_shape_at(svg_text: str, x: float, y: float,
                    group: bool = True, color_merge: int = 40):
    """Supprime le tracé situé sous (x, y). Si group=True, retire tout le groupe
    contigu de même remplissage (ex. un disque de fond entier en un clic).

    Renvoie (nouveau_svg, nb_tracés_supprimés).
    """
    paths = _PATH.findall(svg_text)
    if not paths:
        return svg_text, 0
    m = _SVG_OPEN.search(svg_text)
    if not m:
        return svg_text, 0
    dims = dict((k, float(v)) for k, v in _WH.findall(m.group(0)))
    w = int(round(dims.get("width", 0)))
    h = int(round(dims.get("height", 0)))
    xi, yi = int(round(x)), int(round(y))
    if w <= 0 or h <= 0 or not (0 <= xi < w and 0 <= yi < h):
        return svg_text, 0

    labels = _render_label_map(svg_text, paths, w, h)
    lab = int(labels[yi, xi])
    if lab < 0 or lab >= len(paths):
        return svg_text, 0

    targets = {lab}
    if group:
        fills = [_fill_of(p) for p in paths]
        uf = _UnionFind(len(paths))
        for base, other in ((labels[:, :-1], labels[:, 1:]),
                            (labels[:-1, :], labels[1:, :])):
            mask = (base != other) & (base >= 0) & (other >= 0)
            pairs = np.unique(np.stack([base[mask], other[mask]], axis=1), axis=0)
            for i, j in pairs:
                i, j = int(i), int(j)
                fi, fj = fills[i], fills[j]
                if fi is None or fj is None:
                    continue
                same = fi == fj
                if not same and fi.startswith("#") and fj.startswith("#"):
                    same = np.linalg.norm(
                        np.subtract(_hex_to_rgb(fi), _hex_to_rgb(fj))) <= color_merge
                if same:
                    uf.union(i, j)
        root = uf.find(lab)
        targets = {i for i in range(len(paths)) if uf.find(i) == root}

    out = svg_text
    for i in targets:
        out = out.replace(paths[i], "", 1)
    return out, len(targets)


def refine_colors(svg_text: str, source: Image.Image, min_pixels: int = 30) -> str:
    """Recale chaque aplat sur la couleur MOYENNE réelle des pixels d'origine.

    « Compare les deux images et corrige » : la quantification décale souvent
    légèrement les couleurs ; on remplace le fill de chaque tracé plat par la
    moyenne des pixels d'origine sous sa zone visible. Reste 100 % fidèle, léger.
    Les tracés déjà en dégradé (fill="url(#..)") sont laissés tels quels.
    """
    paths = _PATH.findall(svg_text)
    if not paths:
        return svg_text
    m = _SVG_OPEN.search(svg_text)
    if not m:
        return svg_text
    dims = dict((k, float(v)) for k, v in _WH.findall(m.group(0)))
    w = int(round(dims.get("width", source.width)))
    h = int(round(dims.get("height", source.height)))
    if w <= 0 or h <= 0:
        return svg_text

    labels = _render_label_map(svg_text, paths, w, h)
    if source.size != (w, h):
        source = source.resize((w, h))
    src = np.asarray(source.convert("RGB")).reshape(-1, 3).astype(np.float64)

    # Moyenne par label en un seul passage (bincount) : rapide même à 1000 paths.
    lab = labels.ravel()
    valid = lab >= 0
    lab_v = lab[valid]
    cols_v = src[valid]
    n = len(paths)
    counts = np.bincount(lab_v, minlength=n)
    sums = np.stack([np.bincount(lab_v, weights=cols_v[:, c], minlength=n)
                     for c in range(3)], axis=1)
    means = sums / np.maximum(counts, 1)[:, None]

    out = svg_text
    for i, p in enumerate(paths):
        if counts[i] < min_pixels or not _FILL.search(p):
            continue                              # trop petit, ou déjà un dégradé
        new_hex = _rgb_to_hex(*means[i])
        new_p = _FILL.sub(f'fill="{new_hex}"', p, count=1)
        out = out.replace(p, new_p, 1)
    return out
