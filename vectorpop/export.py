"""Export du SVG vectorise vers d'autres formats, via Qt (aucune dep externe).

- PNG : rendu raster haute-def, fond transparent.
- PDF : rendu **vectoriel** (QPdfWriter peint les chemins, pas un PNG colle).
- SVG : redimensionnement du "canvas" (width/height) sans perte (cf. resize_svg).
"""

from __future__ import annotations

import re
from pathlib import Path

from PySide6.QtCore import Qt, QMarginsF, QSizeF
from PySide6.QtGui import QImage, QPageLayout, QPageSize, QPainter, QPdfWriter
from PySide6.QtSvg import QSvgRenderer

_SVG_TAG = re.compile(r"<svg\b[^>]*>", re.S)
_WH = re.compile(r'\b(width|height)="([0-9.]+)"')
_VIEWBOX = re.compile(r"\bviewBox=")


def _renderer(svg_path: str | Path) -> tuple[QSvgRenderer, float, float]:
    r = QSvgRenderer(str(svg_path))
    size = r.defaultSize()
    w = float(size.width()) or 256.0
    h = float(size.height()) or 256.0
    return r, w, h


def svg_to_png(svg_path: str | Path, out: str | Path, max_px: int = 2048) -> Path:
    """Rastérise le SVG : cote le plus long = `max_px`, fond transparent."""
    r, w, h = _renderer(svg_path)
    scale = max_px / max(w, h)
    img = QImage(round(w * scale), round(h * scale), QImage.Format_ARGB32)
    img.fill(Qt.transparent)
    p = QPainter(img)
    r.render(p)
    p.end()
    img.save(str(out), "PNG")
    return Path(out)


def resize_svg(svg_text: str, target_px: int) -> str:
    """Redimensionne le "canvas" du SVG (cote long = target_px), sans toucher
    aux tracés : un vrai SVG est deja infiniment redimensionnable (le rendu
    reste identique quelle que soit la taille) -- il ne s'agit donc que de
    changer les dimensions intrinseques declarees dans le fichier, pas de
    re-vectoriser. La sortie de vtracer n'a pas de viewBox (width/height =
    coordonnees directes des tracés) : on fige donc ces dimensions d'origine
    dans un viewBox avant de changer width/height, pour que le rendu soit mis
    a l'echelle au lieu d'etre rogné.
    """
    m = _SVG_TAG.search(svg_text)
    if not m:
        return svg_text
    tag = m.group(0)
    dims = dict(_WH.findall(tag))
    try:
        w, h = float(dims["width"]), float(dims["height"])
    except (KeyError, ValueError):
        return svg_text
    if w <= 0 or h <= 0:
        return svg_text

    scale = target_px / max(w, h)
    new_w, new_h = round(w * scale, 2), round(h * scale, 2)

    new_tag = tag
    if not _VIEWBOX.search(new_tag):
        new_tag = new_tag.replace("<svg", f'<svg viewBox="0 0 {w:g} {h:g}"', 1)

    def _repl(mm: re.Match) -> str:
        val = new_w if mm.group(1) == "width" else new_h
        return f'{mm.group(1)}="{val:g}"'

    new_tag = _WH.sub(_repl, new_tag)
    return svg_text[: m.start()] + new_tag + svg_text[m.end() :]


def svg_to_pdf(svg_path: str | Path, out: str | Path) -> Path:
    """Ecrit un PDF vectoriel a la taille intrinseque du SVG (en points)."""
    r, w, h = _renderer(svg_path)
    writer = QPdfWriter(str(out))
    writer.setResolution(72)  # 1 point = 1/72"
    writer.setPageSize(QPageSize(QSizeF(w, h), QPageSize.Point))
    writer.setPageMargins(QMarginsF(0, 0, 0, 0), QPageLayout.Point)
    p = QPainter(writer)
    r.render(p)
    p.end()
    return Path(out)
