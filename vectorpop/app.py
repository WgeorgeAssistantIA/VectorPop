"""VectorPop - vectorisation PNG/JPEG -> SVG propre.

UI minimale PySide6 : drag & drop, apercu avant/apres, presets + sliders,
export SVG. Lancer avec `python -m vectorpop.app`.
"""

import sys
from PySide6.QtWidgets import QApplication

from .app_utils import app_icon
from .ui.main_window import MainWindow

def main():
    app = QApplication(sys.argv)
    app.setWindowIcon(app_icon())
    win = MainWindow()
    win.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
