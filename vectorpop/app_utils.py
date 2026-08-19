import os
import sys
from PySide6.QtGui import QIcon

ACCEPTED = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}

def _asset(name: str) -> str:
    """Chemin d'une ressource, en dev comme dans l'exe PyInstaller (sys._MEIPASS)."""
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.dirname(__file__)))
    return os.path.join(base, "assets", name)

def app_icon() -> QIcon:
    """Icône VectorPop (la plume). .ico multi-résolutions, fallback .png."""
    ico = _asset("icon.ico")
    return QIcon(ico if os.path.exists(ico) else _asset("icon.png"))
