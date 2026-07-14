"""Export du SVG vectorise vers d'autres formats, via Qt (aucune dep externe).

- PNG : rendu raster haute-def, fond transparent.
- PDF : rendu **vectoriel** (QPdfWriter peint les chemins, pas un PNG colle).
"""

from __future__ import annotations

from pathlib import Path

from PySide6.QtCore import Qt, QMarginsF, QSizeF
from PySide6.QtGui import QImage, QPageLayout, QPageSize, QPainter, QPdfWriter
from PySide6.QtSvg import QSvgRenderer


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
