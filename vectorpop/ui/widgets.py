from pathlib import Path
from PySide6.QtCore import Qt, QRect, QSize, Signal
from PySide6.QtGui import QPainter, QPen, QPixmap, QIcon
from PySide6.QtWidgets import (
    QLabel,
    QFrame,
    QSizePolicy,
    QRubberBand,
    QFileDialog,
    QGraphicsView,
    QGraphicsScene,
    QHBoxLayout,
    QVBoxLayout,
    QToolButton,
)
from PySide6.QtSvgWidgets import QGraphicsSvgItem
from PySide6.QtSvg import QSvgRenderer
from PySide6.QtWidgets import QWidget, QPushButton

from ..theme import checker_brush
from ..app_utils import ACCEPTED, sample_asset
from ..core.demo_models import DEMO_MODELS


class DropImage(QLabel):
    """Zone gauche : image par drag & drop / clic, + sélection pour rogner.

    Une fois une image chargée, l'utilisateur peut tracer un rectangle dessus
    (glisser-déposer souris) : la sélection est convertie en coordonnées pixel
    de l'image d'origine par `selection_in_image_px()`.
    """

    def __init__(self, on_file, on_demo=None, tr=None, on_files=None):
        super().__init__()
        self._on_files = on_files  # depot multiple / dossier -> traitement par lot
        self._tr = tr or (lambda k, **kw: k)
        self.setText(self._tr("drop_placeholder"))
        self._on_file = on_file
        self._src_pix: QPixmap | None = None  # pixmap original (non redimensionne)
        self._draw_rect = QRect()  # ou le pixmap est dessine (coords widget)
        self._origin = None  # debut de la selection
        self._rubber: QRubberBand | None = None
        self.setAlignment(Qt.AlignCenter)
        self.setAcceptDrops(True)
        self.setMinimumSize(360, 360)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.setFrameShape(QFrame.StyledPanel)
        self.setObjectName(
            "dropImage"
        )  # style pris en charge par la QSS globale (theme.py)

        # Etat vide plus engageant : 4 modeles cliquables, un essai en un clic sans
        # avoir a chercher un fichier (remplace l'unique logo genere de la 1.2.x).
        self._demo_panel: QWidget | None = None
        self._demo_intro: QLabel | None = None
        self._demo_tiles: list[QToolButton] = []
        if on_demo is not None:
            self._demo_panel = QWidget(self)
            outer = QVBoxLayout(self._demo_panel)
            outer.setContentsMargins(0, 0, 0, 0)
            outer.setSpacing(6)
            self._demo_intro = QLabel(self._tr("demo_intro"))
            self._demo_intro.setAlignment(Qt.AlignCenter)
            self._demo_intro.setStyleSheet(
                "color: palette(mid); font-size: 11px; background: transparent;"
            )
            outer.addWidget(self._demo_intro)
            row = QHBoxLayout()
            row.setSpacing(10)
            for model in DEMO_MODELS:
                btn = QToolButton(self._demo_panel)
                btn.setText(self._tr(model.title_key))
                btn.setToolTip(self._tr(model.tooltip_key))
                btn.setToolButtonStyle(Qt.ToolButtonTextUnderIcon)
                btn.setIconSize(QSize(40, 40))
                btn.setIcon(self._demo_icon(model.filename))
                btn.setCursor(Qt.PointingHandCursor)
                btn.setAutoRaise(True)
                btn.clicked.connect(lambda _=False, mid=model.id: on_demo(mid))
                row.addWidget(btn)
                self._demo_tiles.append(btn)
            outer.addLayout(row)
            self._position_demo_btn()

    @staticmethod
    def _demo_icon(filename: str) -> QIcon:
        """Miniature carrée (recadrage centre) d'un echantillon demo, pour la
        tuile -- les images source sont deja carrees mais on ne le suppose pas."""
        pix = QPixmap(sample_asset(filename))
        if pix.isNull():
            return QIcon()
        side = min(pix.width(), pix.height())
        x, y = (pix.width() - side) // 2, (pix.height() - side) // 2
        return QIcon(
            pix.copy(x, y, side, side).scaled(
                80, 80, Qt.KeepAspectRatio, Qt.SmoothTransformation
            )
        )

    def retranslate(self):
        """Reapplique les textes dans la langue courante (bascule FR/EN)."""
        if self._src_pix is None:
            self.setText(self._tr("drop_placeholder"))
        else:
            self.setToolTip(self._tr("drop_tooltip"))
        if self._demo_panel is not None:
            self._demo_intro.setText(self._tr("demo_intro"))
            for btn, model in zip(self._demo_tiles, DEMO_MODELS):
                btn.setText(self._tr(model.title_key))
                btn.setToolTip(self._tr(model.tooltip_key))
            self._position_demo_btn()

    def _position_demo_btn(self):
        if self._demo_panel is None:
            return
        self._demo_panel.adjustSize()
        # En bas de la zone (pas au centre) : le centre doit rester cliquable pour
        # ouvrir directement le selecteur de fichier, sans que ce panneau l'intercepte.
        x = (self.width() - self._demo_panel.width()) // 2
        y = self.height() - self._demo_panel.height() - 16
        self._demo_panel.move(max(0, x), max(0, y))

    def dragEnterEvent(self, e):
        if e.mimeData().hasUrls():
            e.acceptProposedAction()

    def dropEvent(self, e):
        self.handle_dropped_paths(
            [Path(u.toLocalFile()) for u in e.mimeData().urls() if u.isLocalFile()]
        )

    def handle_dropped_paths(self, paths: list[Path]):
        """Une seule image : on l'ouvre. Plusieurs images, ou un dossier : lot
        (si le callback existe), sinon la 1re image acceptee."""
        images = [p for p in paths if p.is_file() and p.suffix.lower() in ACCEPTED]
        has_dir = any(p.is_dir() for p in paths)
        if self._on_files is not None and (has_dir or len(images) > 1):
            self._on_files(paths)
        elif images:
            self._on_file(images[0])

    # --- affichage ---
    def show_image(self, path: Path):
        self._src_pix = QPixmap(str(path))
        self.clear_selection()
        self._render()
        self.setToolTip(self._tr("drop_tooltip"))
        if self._demo_panel is not None:
            self._demo_panel.hide()  # une vraie image est chargee : plus besoin des exemples

    def _render(self):
        if self._src_pix is None:
            return
        scaled = self._src_pix.scaled(
            self.size(), Qt.KeepAspectRatio, Qt.SmoothTransformation
        )
        x = (self.width() - scaled.width()) // 2
        y = (self.height() - scaled.height()) // 2
        self._draw_rect = QRect(x, y, scaled.width(), scaled.height())
        self.setPixmap(scaled)

    def resizeEvent(self, e):
        super().resizeEvent(e)
        self.clear_selection()  # la selection n'est plus valable apres redimensionnement
        self._render()
        self._position_demo_btn()

    # --- selection / rognage ---
    def mousePressEvent(self, e):
        pos = e.position().toPoint()
        if self._src_pix is None:
            self._open_dialog()
            return
        # Debut d'une selection potentielle (validee au relachement si deplacement).
        self._origin = pos
        if self._rubber is None:
            self._rubber = QRubberBand(QRubberBand.Rectangle, self)
        self._rubber.setGeometry(QRect(self._origin, QSize()))
        self._rubber.show()

    def mouseMoveEvent(self, e):
        if self._origin is None or self._rubber is None:
            return
        rect = QRect(self._origin, e.position().toPoint()).normalized()
        self._rubber.setGeometry(rect.intersected(self._draw_rect))

    def mouseReleaseEvent(self, e):
        if self._origin is None:
            return
        moved = (e.position().toPoint() - self._origin).manhattanLength()
        self._origin = None
        if moved < 8:
            # Simple clic (pas de rectangle trace) : on change d'image.
            self.clear_selection()
            self._open_dialog()

    def _open_dialog(self):
        f, _ = QFileDialog.getOpenFileName(
            self, self._tr("open_dialog_title"), "", self._tr("img_filter")
        )
        if f:
            self._on_file(Path(f))

    def clear_selection(self):
        self._origin = None
        if self._rubber is not None:
            self._rubber.hide()

    def selection_in_image_px(self):
        """Rectangle sélectionné en pixels de l'image d'origine, ou None."""
        if (
            self._rubber is None
            or not self._rubber.isVisible()
            or self._src_pix is None
            or self._draw_rect.isEmpty()
        ):
            return None
        sel = self._rubber.geometry().intersected(self._draw_rect)
        if sel.width() < 3 or sel.height() < 3:
            return None
        sx = self._src_pix.width() / self._draw_rect.width()
        sy = self._src_pix.height() / self._draw_rect.height()
        left = round((sel.left() - self._draw_rect.left()) * sx)
        top = round((sel.top() - self._draw_rect.top()) * sy)
        right = round((sel.right() - self._draw_rect.left()) * sx)
        bottom = round((sel.bottom() - self._draw_rect.top()) * sy)
        left, top = max(0, left), max(0, top)
        right = min(self._src_pix.width(), right)
        bottom = min(self._src_pix.height(), bottom)
        if right - left < 2 or bottom - top < 2:
            return None
        return (left, top, right, bottom)


class SvgView(QGraphicsView):
    """Aperçu SVG zoomable : molette = zoom, glisser = déplacer, double-clic = ajuster.

    Mode « suppression » : un clic émet `pathClicked(x, y)` en coordonnées SVG au
    lieu de déplacer, pour retirer l'aplat cliqué.
    """

    pathClicked = Signal(float, float)

    def __init__(self, tr=None):
        super().__init__()
        self._tr = tr or (lambda k, **kw: k)
        self._scene = QGraphicsScene(self)
        self.setScene(self._scene)
        self._item: QGraphicsSvgItem | None = None
        self._delete_mode = False
        self._zoom = 0  # 0 = ajuste a la fenetre ; borne pour eviter les extremes
        self.setDragMode(QGraphicsView.ScrollHandDrag)  # glisser pour deplacer
        self.setTransformationAnchor(
            QGraphicsView.AnchorUnderMouse
        )  # zoom sous le curseur
        self.setRenderHints(QPainter.Antialiasing | QPainter.SmoothPixmapTransform)
        self.setBackgroundBrush(checker_brush())
        self.setMinimumSize(360, 360)
        self.setObjectName(
            "svgView"
        )  # style pris en charge par la QSS globale (theme.py)
        self.setToolTip(self._tr("svg_view_tooltip"))

    def retranslate(self):
        self.setToolTip(self._tr("svg_view_tooltip"))

    def load(self, path: str):
        """Charge un SVG et l'ajuste a la vue (API compatible avec l'ancien QSvgWidget)."""
        self._scene.clear()
        self._item = QGraphicsSvgItem(str(path))
        self._scene.addItem(self._item)
        self._scene.setSceneRect(self._item.boundingRect())
        self._zoom = 0
        self._fit()

    def show_pixmap(self, pix: QPixmap):
        """Affiche une image raster (pour le plein écran de l'original)."""
        self._scene.clear()
        self._item = self._scene.addPixmap(pix)
        self._item.setTransformationMode(Qt.SmoothTransformation)
        self._scene.setSceneRect(self._item.boundingRect())
        self._zoom = 0
        self._fit()

    def _fit(self):
        if self._item is not None:
            self.fitInView(self._item, Qt.KeepAspectRatio)

    def wheelEvent(self, e):
        if self._item is None:
            return
        up = e.angleDelta().y() > 0
        if not up and self._zoom <= -8:  # ne pas dezoomer a l'infini
            return
        if up and self._zoom >= 20:  # ni zoomer a l'infini
            return
        self._zoom += 1 if up else -1
        self.scale(1.25 if up else 0.8, 1.25 if up else 0.8)

    def resizeEvent(self, e):
        super().resizeEvent(e)
        if self._zoom == 0:  # tant que l'utilisateur n'a pas zoome, on reste ajuste
            self._fit()

    def mouseDoubleClickEvent(self, e):
        self._zoom = 0
        self._fit()

    def set_delete_mode(self, on: bool):
        self._delete_mode = on
        self.setDragMode(QGraphicsView.NoDrag if on else QGraphicsView.ScrollHandDrag)
        self.viewport().setCursor(Qt.PointingHandCursor if on else Qt.ArrowCursor)

    def mousePressEvent(self, e):
        if self._delete_mode and self._item is not None:
            sp = self.mapToScene(e.position().toPoint())  # coords SVG (= px image)
            self.pathClicked.emit(sp.x(), sp.y())
            return
        super().mousePressEvent(e)


class CompareView(QWidget):
    """Comparaison avant/apres a glissiere : original a gauche du curseur, SVG a droite.

    Les deux pixmaps sont dessinés à la même taille (ajustée au widget, aspect
    conservé) ; on ne dessine que la portion du SVG à droite du curseur, ce qui
    donne l'effet de rideau classique.
    """

    def __init__(self):
        super().__init__()
        self._before: QPixmap | None = None
        self._after: QPixmap | None = None
        self._pos = 0.5  # 0..1, position du curseur
        self.setMinimumSize(300, 300)

    def set_images(self, before: QPixmap, after: QPixmap):
        self._before, self._after = before, after
        self.update()

    def set_position(self, frac: float):
        self._pos = max(0.0, min(1.0, frac))
        self.update()

    def _fit_rect(self) -> QRect:
        if self._before is None or self._before.width() == 0:
            return self.rect()
        scale = min(
            self.width() / self._before.width(), self.height() / self._before.height()
        )
        w, h = round(self._before.width() * scale), round(self._before.height() * scale)
        return QRect((self.width() - w) // 2, (self.height() - h) // 2, w, h)

    def paintEvent(self, e):
        if self._before is None or self._after is None:
            return
        target = self._fit_rect()
        p = QPainter(self)
        p.setRenderHint(QPainter.SmoothPixmapTransform)
        p.drawPixmap(target, self._before, self._before.rect())
        split_x = target.left() + round(target.width() * self._pos)
        p.setClipRect(
            QRect(split_x, target.top(), target.right() - split_x + 1, target.height())
        )
        p.drawPixmap(target, self._after, self._after.rect())
        p.setClipping(False)
        p.setPen(QPen(Qt.white, 2))
        p.drawLine(split_x, target.top(), split_x, target.bottom())
