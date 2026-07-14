"""Allègement du SVG produit par vtracer, sans dépendance externe.

Optimisations volontairement SÛRES (aucune ne change le rendu visible) :
- arrondi des coordonnées (le gros du gain : vtracer sort 8 décimales inutiles) ;
- suppression des commentaires, blocs <metadata> et espaces entre balises.

On ne touche PAS à l'ordre ni au contenu géométrique des chemins : le rendu
reste identique, seul le poids baisse.
"""

from __future__ import annotations

import re

# Nombre décimal (avec ou sans partie entière) : "12.3456", "-0.5", ".75"
_DECIMAL = re.compile(r"-?\d*\.\d+")
_XML_DECL = re.compile(r"^\s*<\?xml[^>]*\?>\s*")   # prologue optionnel (contient "1.0")
_COMMENT = re.compile(r"<!--.*?-->", re.S)
_METADATA = re.compile(r"<metadata>.*?</metadata>", re.S)
_BETWEEN_TAGS = re.compile(r">\s+<")


def _round_number(m: re.Match, precision: int) -> str:
    val = round(float(m.group(0)), precision)
    if val == int(val):
        return str(int(val))                       # 12.0 -> "12"
    return f"{val:.{precision}f}".rstrip("0").rstrip(".")


def optimize_svg(svg: str, precision: int = 2) -> str:
    """Renvoie une version allégée du SVG (rendu inchangé)."""
    # Retire d'abord le prologue XML (optionnel) : son "1.0" ne doit pas etre arrondi.
    svg = _XML_DECL.sub("", svg)
    svg = _COMMENT.sub("", svg)
    svg = _METADATA.sub("", svg)
    svg = _DECIMAL.sub(lambda m: _round_number(m, precision), svg)
    svg = _BETWEEN_TAGS.sub("><", svg)
    return svg.strip()
