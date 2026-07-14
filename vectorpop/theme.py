"""Identite visuelle VectorPop : QSS (clair/sombre) + icones vectorielles.

Palette reprise du degrade de l'icone (la "plume") : violet -> magenta -> cyan.
Zero fichier externe : les icones sont de petits SVG monochromes generes en
memoire (coherent avec un outil qui... produit des SVG).
"""

from __future__ import annotations

from PySide6.QtCore import QByteArray, Qt
from PySide6.QtGui import QBrush, QIcon, QPainter, QPixmap
from PySide6.QtSvg import QSvgRenderer

ACCENT1 = "#7A52F5"   # violet
ACCENT2 = "#C92BC0"   # magenta
ACCENT3 = "#3FD7FB"   # cyan

_ACCENT_GRAD = (
    f"qlineargradient(x1:0, y1:0, x2:1, y2:0, "
    f"stop:0 {ACCENT1}, stop:0.55 {ACCENT2}, stop:1 {ACCENT3})"
)
_ACCENT_GRAD_HOVER = (
    f"qlineargradient(x1:0, y1:0, x2:1, y2:0, "
    f"stop:0 #8E6BFF, stop:0.55 #DB4CD4, stop:1 #5FE1FC)"
)
_ACCENT_GRAD_PRESSED = (
    f"qlineargradient(x1:0, y1:0, x2:1, y2:0, "
    f"stop:0 #6740D6, stop:0.55 #A81FA1, stop:1 #23B7D8)"
)


def build_qss(dark: bool) -> str:
    """Feuille de style globale de l'appli, theme clair ou sombre."""
    if dark:
        win_bg, panel_bg = "#1b1c25", "#242631"
        text, subtle = "#eceefb", "#9a9dbd"
        border, input_bg = "#3a3c4d", "#2c2e3c"
        drop_bg, drop_border = "#20222c", "#4b4e63"
        overlay_bg = "rgba(28,29,38,222)"
    else:
        win_bg, panel_bg = "#f4f5fa", "#ffffff"
        text, subtle = "#22232e", "#6b6f80"
        border, input_bg = "#d8dae3", "#ffffff"
        drop_bg, drop_border = "#fafafa", "#b9bccf"
        overlay_bg = "rgba(255,255,255,215)"

    return f"""
    QMainWindow, QWidget {{
        background: {win_bg}; color: {text}; font-size: 13px;
    }}
    QDialog {{ background: {win_bg}; color: {text}; }}
    QLabel {{ color: {text}; background: transparent; }}
    QToolTip {{
        background: {panel_bg}; color: {text}; border: 1px solid {border};
        padding: 4px 6px; border-radius: 4px;
    }}

    QGroupBox {{
        border: 1px solid {border}; border-radius: 10px; margin-top: 14px;
        padding-top: 12px; font-weight: 600; background: {panel_bg};
    }}
    QGroupBox::title {{
        subcontrol-origin: margin; left: 12px; padding: 0 4px; color: {ACCENT1};
    }}

    QPushButton {{
        background: {_ACCENT_GRAD}; color: white; border: none;
        border-radius: 8px; padding: 7px 14px; font-weight: 600;
    }}
    QPushButton:hover {{ background: {_ACCENT_GRAD_HOVER}; }}
    QPushButton:pressed {{ background: {_ACCENT_GRAD_PRESSED}; }}
    QPushButton:disabled {{ background: {border}; color: {subtle}; }}
    QPushButton:checked {{
        background: {_ACCENT_GRAD_PRESSED}; border: 2px solid {ACCENT3};
    }}

    QComboBox {{
        background: {input_bg}; color: {text}; border: 1px solid {border};
        border-radius: 6px; padding: 4px 8px;
    }}
    QComboBox QAbstractItemView {{
        background: {input_bg}; color: {text};
        selection-background-color: {ACCENT1}; selection-color: white;
    }}

    QCheckBox {{ color: {text}; spacing: 6px; }}
    QCheckBox::indicator {{
        width: 15px; height: 15px; border-radius: 4px;
        border: 1px solid {border}; background: {input_bg};
    }}
    QCheckBox::indicator:checked {{ background: {ACCENT1}; border-color: {ACCENT1}; }}
    QCheckBox:disabled {{ color: {subtle}; }}

    QSlider::groove:horizontal {{ height: 5px; background: {border}; border-radius: 2px; }}
    QSlider::sub-page:horizontal {{
        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
            stop:0 {ACCENT1}, stop:1 {ACCENT3});
        border-radius: 2px;
    }}
    QSlider::handle:horizontal {{
        width: 15px; margin: -6px 0; border-radius: 8px;
        background: white; border: 2px solid {ACCENT1};
    }}
    QSlider::handle:horizontal:disabled {{ border-color: {border}; }}

    QSplitter::handle {{ background: {border}; }}
    QSplitter::handle:horizontal {{ width: 4px; }}

    QScrollArea {{ border: none; background: transparent; }}

    QStatusBar {{ background: {panel_bg}; color: {subtle}; border-top: 1px solid {border}; }}

    QProgressBar {{ border: none; border-radius: 4px; background: {border}; max-height: 8px; }}
    QProgressBar::chunk {{
        border-radius: 4px;
        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
            stop:0 {ACCENT1}, stop:1 {ACCENT3});
    }}

    QLabel#dropImage {{
        border: 2px dashed {drop_border}; border-radius: 14px;
        background: {drop_bg}; color: {subtle}; font-size: 15px;
    }}
    QGraphicsView#svgView {{
        border: 1px solid {border}; border-radius: 14px; background: {panel_bg};
    }}
    QLabel#busyOverlay {{
        background: {overlay_bg}; color: {ACCENT1};
        font-size: 20px; font-weight: bold; border-radius: 14px;
    }}
    """


def checker_brush(dark: bool = False) -> QBrush:
    """Damier (convention transparence) pour l'apercu SVG, adouci selon le theme."""
    size = 10
    light, mid = ("#2a2c38", "#20222c") if dark else ("#ffffff", "#d9dbe3")
    tile = QPixmap(size * 2, size * 2)
    tile.fill(Qt.GlobalColor.transparent)
    p = QPainter(tile)
    p.fillRect(0, 0, size * 2, size * 2, light)
    p.fillRect(0, 0, size, size, mid)
    p.fillRect(size, size, size, size, mid)
    p.end()
    return QBrush(tile)


# --- Icones (SVG monochromes, blanc, pour boutons a fond degrade) -------------

_ICON_CROP = """<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M6 2v14a2 2 0 0 0 2 2h14" fill="none" stroke="{c}" stroke-width="2.2"
 stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 22V8a2 2 0 0 0-2-2H2" fill="none" stroke="{c}" stroke-width="2.2"
 stroke-linecap="round" stroke-linejoin="round"/></svg>"""

_ICON_RESET = """<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M21 12a9 9 0 1 1-3.2-6.85" fill="none" stroke="{c}" stroke-width="2.2"
 stroke-linecap="round"/>
<path d="M21 3.5v6h-6" fill="none" stroke="{c}" stroke-width="2.2"
 stroke-linecap="round" stroke-linejoin="round"/></svg>"""

_ICON_TRASH = """<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M3.5 6h17" stroke="{c}" stroke-width="2.2" stroke-linecap="round"/>
<path d="M8.5 6V4.2A1.7 1.7 0 0 1 10.2 2.5h3.6a1.7 1.7 0 0 1 1.7 1.7V6"
 fill="none" stroke="{c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19 6l-1.05 14.15A2 2 0 0 1 15.96 22H8.04a2 2 0 0 1-1.99-1.85L5 6"
 fill="none" stroke="{c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 10.5v7M14 10.5v7" stroke="{c}" stroke-width="2.2" stroke-linecap="round"/>
</svg>"""

_ICON_UNDO = """<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M3 10h10.5a5.5 5.5 0 0 1 0 11H8" fill="none" stroke="{c}" stroke-width="2.2"
 stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.5 5 3 10l4.5 5" fill="none" stroke="{c}" stroke-width="2.2"
 stroke-linecap="round" stroke-linejoin="round"/></svg>"""

_ICON_LAYERS = """<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2 2 7.2l10 5.1 10-5.1L12 2Z" fill="none" stroke="{c}" stroke-width="2.1"
 stroke-linejoin="round"/>
<path d="M2 12.1l10 5.1 10-5.1" fill="none" stroke="{c}" stroke-width="2.1"
 stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2 17l10 5.1L22 17" fill="none" stroke="{c}" stroke-width="2.1"
 stroke-linecap="round" stroke-linejoin="round"/></svg>"""

_ICON_HELP = """<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="9.3" fill="none" stroke="{c}" stroke-width="2.1"/>
<path d="M9.2 9.2a2.9 2.9 0 0 1 5.6.95c0 1.85-2.6 2.05-2.6 3.75" fill="none"
 stroke="{c}" stroke-width="2.1" stroke-linecap="round"/>
<circle cx="12" cy="17.3" r="1.05" fill="{c}"/></svg>"""

_ICON_EXPAND = """<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M8 3H5.5A2.5 2.5 0 0 0 3 5.5V8M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8
M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16M3 16v2.5A2.5 2.5 0 0 0 5.5 21H8"
 fill="none" stroke="{c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>"""

_ICON_MOON = """<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M20.2 14.9A8.7 8.7 0 1 1 9.1 3.8a7.2 7.2 0 0 0 11.1 11.1Z" fill="{c}"/>
</svg>"""

_ICON_SUN = """<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="4.6" fill="{c}"/>
<path d="M12 1.5v3M12 19.5v3M22.5 12h-3M4.5 12h-3M19.1 4.9l-2.1 2.1M7 17l-2.1 2.1
M19.1 19.1 17 17M7 7 4.9 4.9" stroke="{c}" stroke-width="2" stroke-linecap="round"/>
</svg>"""

_ICON_COMPARE = """<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2v20" stroke="{c}" stroke-width="2.1" stroke-linecap="round"/>
<path d="M8 8 3.7 12 8 16M16 8l4.3 4-4.3 4" fill="none" stroke="{c}" stroke-width="2.1"
 stroke-linecap="round" stroke-linejoin="round"/></svg>"""

ICON_CROP, ICON_RESET, ICON_TRASH, ICON_UNDO = (
    _ICON_CROP, _ICON_RESET, _ICON_TRASH, _ICON_UNDO)
ICON_LAYERS, ICON_HELP, ICON_EXPAND = _ICON_LAYERS, _ICON_HELP, _ICON_EXPAND
ICON_MOON, ICON_SUN, ICON_COMPARE = _ICON_MOON, _ICON_SUN, _ICON_COMPARE


def icon(svg_template: str, color: str = "#ffffff", size: int = 18) -> QIcon:
    """Rend un des gabarits SVG ci-dessus en QIcon (pixmap transparent, une couleur)."""
    svg = svg_template.format(c=color)
    renderer = QSvgRenderer(QByteArray(svg.encode("utf-8")))
    pix = QPixmap(size, size)
    pix.fill(Qt.GlobalColor.transparent)
    painter = QPainter(pix)
    renderer.render(painter)
    painter.end()
    return QIcon(pix)
