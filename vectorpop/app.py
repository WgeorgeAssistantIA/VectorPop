"""VectorPop - vectorisation PNG/JPEG -> SVG propre.

UI minimale PySide6 : drag & drop, apercu avant/apres, presets + sliders,
export SVG. Lancer avec `python -m vectorpop.app`.
"""

from __future__ import annotations

import importlib.util
import os
import sys
import tempfile
from pathlib import Path

from PySide6.QtCore import Qt, QTimer, QThread, Signal, QRect, QSize, QSettings
from PySide6.QtGui import QIcon, QKeySequence, QPainter, QPen, QPixmap, QShortcut
from PySide6.QtSvg import QSvgRenderer
from PySide6.QtSvgWidgets import QGraphicsSvgItem
from PySide6.QtWidgets import (
    QApplication, QCheckBox, QComboBox, QDialog, QDialogButtonBox, QFileDialog,
    QFrame, QGraphicsScene, QGraphicsView, QGroupBox, QHBoxLayout, QInputDialog,
    QLabel, QMainWindow, QMessageBox, QProgressBar, QProgressDialog, QPushButton,
    QRubberBand, QScrollArea, QSizePolicy, QSlider, QSpinBox, QSplitter, QVBoxLayout,
    QWidget,
)
from PIL import Image, ImageDraw

from .export import resize_svg, svg_to_pdf, svg_to_png
from .gradients import gradientize_svg, refine_colors, remove_shape_at
from .optimize import optimize_svg
from .i18n import PRESET_LABELS, STRINGS, detect_system_lang
from .theme import (
    ICON_COMPARE, ICON_CROP, ICON_EXPAND, ICON_HELP, ICON_LAYERS, ICON_MOON,
    ICON_RESET, ICON_SUN, ICON_TRASH, ICON_UNDO, build_qss, checker_brush, icon,
)
from .vectorizer import PRESETS, VectorParams, vectorize


def _postprocess_svg(svg_path: Path, src_path: Path,
                     gradients: bool, refine: bool) -> str | None:
    """Post-traitements optionnels du SVG à partir de l'image source (best-effort).

    Dégradés d'abord (zones lisses), puis affinage des couleurs (aplats restants).
    En cas d'échec le SVG brut (vtracer) est conservé ; on renvoie le message
    d'erreur pour que l'appelant puisse prévenir l'utilisateur au lieu de rester muet.
    """
    if not (gradients or refine):
        return None
    try:
        src = Image.open(src_path).convert("RGB")
        svg = svg_path.read_text(encoding="utf-8")
        if gradients:
            svg = gradientize_svg(svg, src)
        if refine:
            svg = refine_colors(svg, src)
        svg_path.write_text(svg, encoding="utf-8")
        return None
    except Exception as e:  # noqa: BLE001
        return str(e)

ACCEPTED = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}


# Recettes de réglages par situation : (cle titre, cle conseil, config applicable).
# Les clés de config correspondent aux réglages ; seules celles présentes sont posées.
# "preset" reference un identifiant stable de vectorizer.PRESETS (pas un libelle affiche).
RECIPES = [
    ("recipe_flat_title", "recipe_flat_desc",
     dict(preset="flat", colors=6, merge_on=True, merge=24,
          grad=False, refine=True, bg=False, contrast=0, sharpen=0)),
    ("recipe_glossy_title", "recipe_glossy_desc",
     dict(preset="detailed", colors=8, merge_on=False, corner=30,
          grad=True, refine=True, bg=False)),
    ("recipe_bw_title", "recipe_bw_desc",
     dict(preset="bw", grad=False, refine=False, bg=False)),
    ("recipe_photo_title", "recipe_photo_desc",
     dict(preset="detailed", colors=8, merge_on=False,
          grad=True, refine=True)),
    ("recipe_bg_title", "recipe_bg_desc",
     dict(preset="flat", bg=True, tol=32, refine=True)),
]

# Dépannage : (cle symptôme, cle remède).
TIPS = [
    ("tip_bands_prob", "tip_bands_sol"),
    ("tip_heavy_prob", "tip_heavy_sol"),
    ("tip_jagged_prob", "tip_jagged_sol"),
    ("tip_noise_prob", "tip_noise_sol"),
    ("tip_colors_prob", "tip_colors_sol"),
    ("tip_bg_prob", "tip_bg_sol"),
    ("tip_blur_prob", "tip_blur_sol"),
]


def _asset(name: str) -> str:
    """Chemin d'une ressource, en dev comme dans l'exe PyInstaller (sys._MEIPASS)."""
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.dirname(__file__)))
    return os.path.join(base, "assets", name)


def app_icon() -> QIcon:
    """Icône VectorPop (la plume). .ico multi-résolutions, fallback .png."""
    ico = _asset("icon.ico")
    return QIcon(ico if os.path.exists(ico) else _asset("icon.png"))


class VectorizeWorker(QThread):
    """Vectorise hors du thread UI : l'interface reste fluide pendant le calcul.

    Ne touche AUCUN widget Qt (interdit hors thread principal) : le worker se
    contente de produire le fichier SVG et signale le resultat par un signal.
    """

    done = Signal(str)      # chemin du SVG produit
    warning = Signal(str)   # post-traitement (dégradés/affinage) échoué, SVG brut gardé
    failed = Signal(str)    # message d'erreur

    def __init__(self, src: Path, out: Path, params: VectorParams,
                 gradients: bool = False, refine: bool = False):
        super().__init__()
        self._src, self._out, self._params = src, out, params
        self._gradients, self._refine = gradients, refine

    def run(self):
        try:
            vectorize(self._src, self._out, self._params)
            warn = _postprocess_svg(self._out, self._src, self._gradients, self._refine)
            if warn:
                self.warning.emit(warn)
            self.done.emit(str(self._out))
        except Exception as e:  # noqa: BLE001 - remonte tout au thread UI
            self.failed.emit(str(e))


class BatchWorker(QThread):
    """Vectorise tout un dossier d'images en tache de fond, format au choix."""

    progress = Signal(int, str)   # numero (1-based), nom du fichier en cours
    done = Signal(int, int, int)  # nb traites, nb echecs, nb avertissements post-traitement

    def __init__(self, files: list[Path], out_dir: Path, fmt: str,
                 params: VectorParams, gradients: bool = False, refine: bool = False,
                 png_size: int = 2048, svg_size: int = 0):
        super().__init__()
        self._files, self._out_dir, self._fmt, self._params = files, out_dir, fmt, params
        self._gradients, self._refine = gradients, refine
        self._png_size = png_size
        self._svg_size = svg_size   # 0 = taille d'origine (cf. export.resize_svg)
        self._cancel = False

    def cancel(self):
        self._cancel = True

    def run(self):
        done_n = errors = warns = 0
        for i, f in enumerate(self._files, 1):
            if self._cancel:
                break
            self.progress.emit(i, f.name)
            try:
                if self._process_one(f):
                    warns += 1
                done_n += 1
            except Exception:  # noqa: BLE001 - on continue le lot malgre un raté
                errors += 1
        self.done.emit(done_n, errors, warns)

    def _process_one(self, f: Path) -> bool:
        """Traite une image. Renvoie True si un post-traitement a échoué (SVG brut gardé)."""
        fd, tmp = tempfile.mkstemp(suffix=".svg")
        os.close(fd)
        tmp = Path(tmp)
        try:
            vectorize(f, tmp, self._params)
            warn = _postprocess_svg(tmp, f, self._gradients, self._refine)
            txt = optimize_svg(tmp.read_text(encoding="utf-8"))
            tmp.write_text(txt, encoding="utf-8")
            out = self._out_dir / f"{f.stem}.{self._fmt}"
            if self._fmt == "svg":
                if self._svg_size:
                    txt = resize_svg(txt, self._svg_size)
                out.write_text(txt, encoding="utf-8")
            elif self._fmt == "png":
                svg_to_png(tmp, out, max_px=self._png_size)
            else:
                svg_to_pdf(tmp, out)
            return warn is not None
        finally:
            tmp.unlink(missing_ok=True)


class DeleteWorker(QThread):
    """Retire un aplat (et son groupe contigu) hors du thread UI.

    Sur un gros SVG (beaucoup de tracés) le rendu de la carte de labels dans
    `remove_shape_at` peut prendre plusieurs secondes : sans thread, la fenêtre
    figeait pendant tout ce temps.
    """

    done = Signal(str, int)   # nouveau SVG, nb de tracés supprimés
    failed = Signal(str)

    def __init__(self, svg_text: str, x: float, y: float):
        super().__init__()
        self._svg_text, self._x, self._y = svg_text, x, y

    def run(self):
        try:
            new_svg, removed = remove_shape_at(
                self._svg_text, self._x, self._y, group=True, color_merge=18)
            self.done.emit(new_svg, removed)
        except Exception as e:  # noqa: BLE001
            self.failed.emit(str(e))


class DropImage(QLabel):
    """Zone gauche : image par drag & drop / clic, + sélection pour rogner.

    Une fois une image chargée, l'utilisateur peut tracer un rectangle dessus
    (glisser-déposer souris) : la sélection est convertie en coordonnées pixel
    de l'image d'origine par `selection_in_image_px()`.
    """

    def __init__(self, on_file, on_demo=None, tr=None):
        super().__init__()
        self._tr = tr or (lambda k, **kw: k)
        self.setText(self._tr("drop_placeholder"))
        self._on_file = on_file
        self._src_pix: QPixmap | None = None      # pixmap original (non redimensionne)
        self._draw_rect = QRect()                 # ou le pixmap est dessine (coords widget)
        self._origin = None                       # debut de la selection
        self._rubber: QRubberBand | None = None
        self.setAlignment(Qt.AlignCenter)
        self.setAcceptDrops(True)
        self.setMinimumSize(360, 360)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.setFrameShape(QFrame.StyledPanel)
        self.setObjectName("dropImage")   # style pris en charge par la QSS globale (theme.py)

        # Etat vide plus engageant : un essai en un clic, sans avoir a chercher un fichier.
        self._demo_btn: QPushButton | None = None
        if on_demo is not None:
            self._demo_btn = QPushButton(self._tr("demo_btn"), self)
            self._demo_btn.setCursor(Qt.PointingHandCursor)
            self._demo_btn.clicked.connect(on_demo)
            self._position_demo_btn()

    def retranslate(self):
        """Reapplique les textes dans la langue courante (bascule FR/EN)."""
        if self._src_pix is None:
            self.setText(self._tr("drop_placeholder"))
        else:
            self.setToolTip(self._tr("drop_tooltip"))
        if self._demo_btn is not None:
            self._demo_btn.setText(self._tr("demo_btn"))
            self._position_demo_btn()

    def _position_demo_btn(self):
        if self._demo_btn is None:
            return
        self._demo_btn.adjustSize()
        x = (self.width() - self._demo_btn.width()) // 2
        y = (self.height() - self._demo_btn.height()) // 2 + 44  # sous le texte du placeholder
        self._demo_btn.move(x, y)

    def dragEnterEvent(self, e):
        if e.mimeData().hasUrls():
            e.acceptProposedAction()

    def dropEvent(self, e):
        for url in e.mimeData().urls():
            p = Path(url.toLocalFile())
            if p.suffix.lower() in ACCEPTED:
                self._on_file(p)
                return

    # --- affichage ---
    def show_image(self, path: Path):
        self._src_pix = QPixmap(str(path))
        self.clear_selection()
        self._render()
        self.setToolTip(self._tr("drop_tooltip"))
        if self._demo_btn is not None:
            self._demo_btn.hide()   # une vraie image est chargee : plus besoin de l'exemple

    def _render(self):
        if self._src_pix is None:
            return
        scaled = self._src_pix.scaled(
            self.size(), Qt.KeepAspectRatio, Qt.SmoothTransformation)
        x = (self.width() - scaled.width()) // 2
        y = (self.height() - scaled.height()) // 2
        self._draw_rect = QRect(x, y, scaled.width(), scaled.height())
        self.setPixmap(scaled)

    def resizeEvent(self, e):
        super().resizeEvent(e)
        self.clear_selection()   # la selection n'est plus valable apres redimensionnement
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
            self, self._tr("open_dialog_title"), "", self._tr("img_filter"))
        if f:
            self._on_file(Path(f))

    def clear_selection(self):
        self._origin = None
        if self._rubber is not None:
            self._rubber.hide()

    def selection_in_image_px(self):
        """Rectangle sélectionné en pixels de l'image d'origine, ou None."""
        if (self._rubber is None or not self._rubber.isVisible()
                or self._src_pix is None or self._draw_rect.isEmpty()):
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
        self.setDragMode(QGraphicsView.ScrollHandDrag)          # glisser pour deplacer
        self.setTransformationAnchor(QGraphicsView.AnchorUnderMouse)  # zoom sous le curseur
        self.setRenderHints(QPainter.Antialiasing | QPainter.SmoothPixmapTransform)
        self.setBackgroundBrush(checker_brush())
        self.setMinimumSize(360, 360)
        self.setObjectName("svgView")   # style pris en charge par la QSS globale (theme.py)
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
        if not up and self._zoom <= -8:   # ne pas dezoomer a l'infini
            return
        if up and self._zoom >= 20:        # ni zoomer a l'infini
            return
        self._zoom += 1 if up else -1
        self.scale(1.25 if up else 0.8, 1.25 if up else 0.8)

    def resizeEvent(self, e):
        super().resizeEvent(e)
        if self._zoom == 0:   # tant que l'utilisateur n'a pas zoome, on reste ajuste
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
            sp = self.mapToScene(e.position().toPoint())   # coords SVG (= px image)
            self.pathClicked.emit(sp.x(), sp.y())
            return
        super().mousePressEvent(e)


class SettingsHelpDialog(QDialog):
    """Aide aux réglages : recettes par situation (appliquables) + dépannage."""

    def __init__(self, win: "MainWindow"):
        super().__init__(win)
        t = win._t
        self.setWindowTitle(t("help_dialog_title"))
        self.resize(560, 620)
        outer = QVBoxLayout(self)
        intro = QLabel(t("help_dialog_intro"))
        intro.setWordWrap(True)
        outer.addWidget(intro)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        content = QWidget()
        vb = QVBoxLayout(content)

        for title_key, desc_key, cfg in RECIPES:
            gb = QGroupBox(t(title_key))
            gl = QVBoxLayout(gb)
            lbl = QLabel(t(desc_key))
            lbl.setWordWrap(True)
            gl.addWidget(lbl)
            btn = QPushButton(t("recipe_apply_btn"))
            btn.clicked.connect(lambda _=False, c=cfg: (win.apply_recipe(c), self.accept()))
            gl.addWidget(btn)
            vb.addWidget(gb)

        tb = QGroupBox(t("troubleshoot_title"))
        tl = QVBoxLayout(tb)
        for prob_key, sol_key in TIPS:
            row = QLabel(f"<b>{t(prob_key)}</b> — {t(sol_key)}")
            row.setWordWrap(True)
            tl.addWidget(row)
        vb.addWidget(tb)
        vb.addStretch(1)

        scroll.setWidget(content)
        outer.addWidget(scroll, 1)
        buttons = QDialogButtonBox(QDialogButtonBox.Close)
        buttons.rejected.connect(self.reject)
        outer.addWidget(buttons)


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
        self._pos = 0.5   # 0..1, position du curseur
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
        scale = min(self.width() / self._before.width(),
                    self.height() / self._before.height())
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
        p.setClipRect(QRect(split_x, target.top(), target.right() - split_x + 1, target.height()))
        p.drawPixmap(target, self._after, self._after.rect())
        p.setClipping(False)
        p.setPen(QPen(Qt.white, 2))
        p.drawLine(split_x, target.top(), split_x, target.bottom())


class SizeDialog(QDialog):
    """Choix d'une taille (px) : presets rapides (icônes classiques -> haute
    def) + valeur libre, pour l'export PNG/SVG.

    `value()` renvoie la taille choisie, ou 0 si "Taille d'origine" est cochée
    (uniquement proposé quand `offer_original=True`, cas du SVG).
    """

    PRESETS = (16, 32, 48, 64, 128, 256, 512, 1024, 2048, 4096)
    RECOMMENDED = 2048

    def __init__(self, parent, title: str, label: str, default: int,
                 offer_original: bool = False, recommended_tip: str = ""):
        super().__init__(parent)
        self.setWindowTitle(title)
        lay = QVBoxLayout(self)

        lbl = QLabel(label)
        lbl.setWordWrap(True)
        lay.addWidget(lbl)

        self.spin = QSpinBox()
        self.spin.setRange(8, 8192)
        self.spin.setSuffix(" px")
        self.spin.setSingleStep(8)
        self.spin.setValue(default if default else self.RECOMMENDED)

        self.chk_original: QCheckBox | None = None
        if offer_original:
            self.chk_original = QCheckBox(parent._t("size_original"))
            self.chk_original.setChecked(default == 0)
            self.chk_original.toggled.connect(self.spin.setDisabled)
            self.spin.setDisabled(self.chk_original.isChecked())
            lay.addWidget(self.chk_original)

        presets_box = QHBoxLayout()
        for p in self.PRESETS:
            btn = QPushButton(str(p))
            btn.setFixedWidth(44)
            if p == self.RECOMMENDED and recommended_tip:
                btn.setToolTip(recommended_tip)
            btn.clicked.connect(lambda _=False, v=p: self._pick_preset(v))
            presets_box.addWidget(btn)
        lay.addLayout(presets_box)
        lay.addWidget(self.spin)

        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        lay.addWidget(buttons)

    def _pick_preset(self, v: int):
        self.spin.setValue(v)
        if self.chk_original is not None:
            self.chk_original.setChecked(False)

    def value(self) -> int:
        if self.chk_original is not None and self.chk_original.isChecked():
            return 0
        return self.spin.value()


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        # Langue + theme charges en tout premier : necessaires des la construction
        # des premiers widgets (placeholders, libelles de preset, etc.).
        self._settings = QSettings("VectorPop", "VectorPop")
        self.lang = self._settings.value("lang") or detect_system_lang()
        if self.lang not in STRINGS:
            self.lang = "fr"
        dark_setting = self._settings.value("dark_mode")
        self._dark = (dark_setting in (True, "true", "True", 1, "1")
                      if dark_setting is not None else False)
        self._rembg_missing = importlib.util.find_spec("rembg") is None
        self._retranslators: list = []            # callables a rejouer au changement de langue
        self._cur_display_name: str | None = None  # pour reconstruire le titre de fenetre

        self.setWindowTitle(self._t("app_name"))
        self.setWindowIcon(app_icon())
        self.resize(1120, 680)

        self.src_path: Path | None = None       # image courante (peut etre un rognage)
        self.orig_src: Path | None = None        # image d'origine (pour « revenir »)
        self.svg_path: Path | None = None
        self._crop_tmp: Path | None = None       # PNG temporaire du dernier rognage
        self._paste_tmp: Path | None = None      # PNG temporaire de la derniere image collee
        self._demo_tmp: Path | None = None       # PNG temporaire de l'image d'exemple
        self._worker: VectorizeWorker | None = None
        self._cur_out: Path | None = None        # SVG temp du worker en cours
        self._silent = True                      # erreurs muettes (apercu live)
        self._pending = False                    # une relance est demandee
        self._pending_silent = True
        self._batch: BatchWorker | None = None
        self._progress: QProgressDialog | None = None
        self._last_dir = ""                      # dernier dossier d'export (memorise)
        self._last_png_size = 2048               # derniere resolution PNG choisie (memorisee)
        self._last_svg_size = 0                  # derniere taille SVG choisie (0 = origine)
        self._last_warn: str | None = None       # avertissement post-traitement en attente

        # Debounce de l'apercu live : on attend que l'utilisateur arrete de bouger.
        self._live = QTimer(self)
        self._live.setSingleShot(True)
        self._live.setInterval(450)
        self._live.timeout.connect(self._live_run)

        # --- Apercus ---
        self.original = DropImage(self.load_image, on_demo=self.load_demo_image, tr=self._t)
        self.preview = SvgView(tr=self._t)
        self._retranslators.append(self.original.retranslate)
        self._retranslators.append(self.preview.retranslate)

        # Panneaux dans un QSplitter : 50/50 au départ, divise ajustable à la souris.
        self.previews = QSplitter(Qt.Horizontal)
        self.previews.addWidget(self._labeled(
            "panel_original", self.original, on_expand=lambda: self.open_fullscreen("original")))
        self.previews.addWidget(self._labeled(
            "panel_svg", self.preview, on_expand=lambda: self.open_fullscreen("svg")))
        self.previews.setSizes([500, 500])

        # --- Pretraitement : rognage ---
        icon_sz = QSize(16, 16)
        self.btn_crop = self._tr_widget(QPushButton(), "btn_crop", "btn_crop_tooltip")
        self.btn_crop.setIcon(icon(ICON_CROP))
        self.btn_crop.setIconSize(icon_sz)
        self.btn_crop.clicked.connect(self.crop_to_selection)
        self.btn_crop.setEnabled(False)
        self.btn_reset_img = self._tr_widget(
            QPushButton(), "btn_reset_img", "btn_reset_img_tooltip")
        self.btn_reset_img.setIcon(icon(ICON_RESET))
        self.btn_reset_img.setIconSize(icon_sz)
        self.btn_reset_img.clicked.connect(self.reset_image)
        self.btn_reset_img.setEnabled(False)

        self.btn_del = self._tr_widget(QPushButton(), "btn_del", "btn_del_tooltip")
        self.btn_del.setIcon(icon(ICON_TRASH))
        self.btn_del.setIconSize(icon_sz)
        self.btn_del.setCheckable(True)
        self.btn_del.toggled.connect(self._toggle_delete_mode)
        self.btn_del.setEnabled(False)
        self.btn_undo = self._tr_widget(QPushButton(), tooltip_key="btn_undo_tooltip")
        self.btn_undo.setIcon(icon(ICON_UNDO))
        self.btn_undo.setIconSize(icon_sz)
        self.btn_undo.setFixedWidth(38)
        self.btn_undo.clicked.connect(self.undo_delete)
        self.btn_undo.setEnabled(False)
        self.preview.pathClicked.connect(self.delete_shape_at)
        self._del_history: list[str] = []
        self._del_worker: DeleteWorker | None = None
        self._del_pending_txt: str | None = None

        self.btn_help = self._tr_widget(QPushButton(), "btn_help", "btn_help_tooltip")
        self.btn_help.setIcon(icon(ICON_HELP))
        self.btn_help.setIconSize(icon_sz)
        self.btn_help.clicked.connect(self.open_help)

        self.btn_theme = self._tr_widget(QPushButton(), tooltip_key="btn_theme_tooltip")
        self.btn_theme.setCheckable(True)
        self.btn_theme.setIconSize(icon_sz)
        self.btn_theme.setFixedWidth(38)
        self.btn_theme.toggled.connect(self.toggle_theme)

        self.btn_lang = self._tr_widget(QPushButton(), tooltip_key="btn_lang_tooltip")
        self.btn_lang.setMinimumWidth(50)   # "FR"/"EN" + le padding des boutons (theme.py)
        self.btn_lang.clicked.connect(self.toggle_lang)

        self.lbl_preprocess = self._tr_widget(QLabel(), "label_preprocess")
        prep = QHBoxLayout()
        prep.addWidget(self.lbl_preprocess)
        prep.addWidget(self.btn_crop)
        prep.addWidget(self.btn_reset_img)
        prep.addWidget(self.btn_del)
        prep.addWidget(self.btn_undo)
        prep.addStretch(1)
        prep.addWidget(self.btn_help)
        prep.addWidget(self.btn_theme)
        prep.addWidget(self.btn_lang)

        # --- Controles ---
        self.preset = QComboBox()
        self._repopulate_preset_combo()
        self.preset.currentIndexChanged.connect(
            lambda i: self.apply_preset(self.preset.itemData(i)))

        self.s_speckle = self._slider(0, 20, 4)
        self.s_colors = self._slider(1, 8, 6)
        self.s_corner = self._slider(0, 180, 60)
        self.s_tol = self._slider(0, 120, 32)
        self.s_merge = self._slider(0, 100, 24)
        self.s_contrast = self._slider(-50, 50, 0)   # retouche : contraste avant trace
        self.s_sharpen = self._slider(0, 100, 0)     # retouche : nettete avant trace

        self.chk_bg = self._tr_widget(QCheckBox(), "chk_bg", "chk_bg_tooltip")
        self.chk_bg_ai = self._tr_widget(QCheckBox(), "chk_bg_ai", "chk_bg_ai_tooltip")
        self.chk_merge = self._tr_widget(QCheckBox(), "chk_merge", "chk_merge_tooltip")
        self.chk_merge.setChecked(True)
        self.chk_grad = self._tr_widget(QCheckBox(), "chk_grad", "chk_grad_tooltip")
        self.chk_refine = self._tr_widget(QCheckBox(), "chk_refine", "chk_refine_tooltip")

        bg_box = QVBoxLayout()
        bg_box.addWidget(self.chk_bg)
        bg_box.addWidget(self.chk_bg_ai)
        bg_box.addWidget(self.chk_merge)
        bg_box.addWidget(self.chk_grad)
        bg_box.addWidget(self.chk_refine)
        bg_w = QWidget()
        bg_w.setLayout(bg_box)

        self.lbl_preset = self._tr_widget(QLabel(), "label_preset")
        controls = QHBoxLayout()
        controls.addWidget(self.lbl_preset)
        controls.addWidget(self.preset)
        controls.addWidget(bg_w)
        controls.addWidget(self._labeled("lbl_bgtol", self.s_tol, small=True, show_value=True))
        controls.addWidget(self._labeled("lbl_speckle", self.s_speckle, small=True, show_value=True))
        controls.addWidget(self._labeled(
            "lbl_colors", self.s_colors, small=True, show_value=True,
            value_fmt=lambda v: 2 ** v))
        controls.addWidget(self._labeled("lbl_corner", self.s_corner, small=True, show_value=True))
        controls.addWidget(self._labeled("lbl_merge", self.s_merge, small=True, show_value=True))

        # Retouches d'image (au service de la vectorisation), sur une 2e ligne.
        self.lbl_image_retouch = self._tr_widget(QLabel(), "label_image_retouch")
        controls2 = QHBoxLayout()
        controls2.addWidget(self.lbl_image_retouch)
        controls2.addWidget(self._labeled("lbl_contrast", self.s_contrast, small=True, show_value=True))
        controls2.addWidget(self._labeled("lbl_sharpen", self.s_sharpen, small=True, show_value=True))
        controls2.addStretch(1)

        # Apercu live : tout changement de reglage relance (en differe) la vectorisation.
        sliders = (self.s_speckle, self.s_colors, self.s_corner, self.s_tol,
                   self.s_merge, self.s_contrast, self.s_sharpen)
        for s in sliders:
            s.valueChanged.connect(self._schedule_live)
        self.chk_bg.toggled.connect(self._schedule_live)
        self.chk_bg_ai.toggled.connect(self._schedule_live)
        self.chk_merge.toggled.connect(self._schedule_live)
        self.chk_grad.toggled.connect(self._schedule_live)
        self.chk_refine.toggled.connect(self._schedule_live)
        self.preset.currentIndexChanged.connect(self._schedule_live)

        self.btn_vec = self._tr_widget(QPushButton(), "btn_vec")
        self.btn_vec.clicked.connect(self.run_vectorize)
        self.btn_vec.setEnabled(False)
        self.btn_exp = self._tr_widget(QPushButton(), "btn_exp")
        self.btn_exp.clicked.connect(self.export_any)
        self.btn_exp.setEnabled(False)
        self.btn_copy = self._tr_widget(QPushButton(), "btn_copy", "btn_copy_tooltip")
        self.btn_copy.clicked.connect(self.copy_svg)
        self.btn_copy.setEnabled(False)
        self.btn_batch = self._tr_widget(QPushButton(), "btn_batch", "btn_batch_tooltip")
        self.btn_batch.setIcon(icon(ICON_LAYERS))
        self.btn_batch.setIconSize(QSize(18, 18))
        self.btn_batch.clicked.connect(self.run_batch)
        self.btn_compare = self._tr_widget(QPushButton(), "btn_compare", "btn_compare_tooltip")
        self.btn_compare.setIcon(icon(ICON_COMPARE))
        self.btn_compare.setIconSize(QSize(18, 18))
        self.btn_compare.clicked.connect(self.open_compare)
        self.btn_compare.setEnabled(False)
        for b in (self.btn_vec, self.btn_exp, self.btn_copy, self.btn_batch, self.btn_compare):
            b.setMinimumHeight(40)

        actions = QHBoxLayout()
        actions.addWidget(self.btn_vec)
        actions.addWidget(self.btn_exp)
        actions.addWidget(self.btn_copy)
        actions.addWidget(self.btn_compare)
        actions.addWidget(self.btn_batch)

        root = QVBoxLayout()
        root.addWidget(self.previews, 1)
        root.addLayout(prep)
        root.addLayout(controls)
        root.addLayout(controls2)
        root.addLayout(actions)
        central = QWidget()
        central.setLayout(root)
        self.setCentralWidget(central)

        # Indicateur d'activite (barre indeterminee) a droite de la barre d'etat.
        self.busy = QProgressBar()
        self.busy.setRange(0, 0)                  # 0..0 = animation "en cours"
        self.busy.setMaximumWidth(150)
        self.busy.setTextVisible(False)
        self.busy.setVisible(False)
        self.statusBar().addPermanentWidget(self.busy)

        # Voile « en cours » PAR-DESSUS l'apercu SVG : impossible a rater.
        # (texte generique fixe ; le message specifique va dans la barre de statut).
        self.busy_overlay = self._tr_widget(QLabel(self.preview), "busy_overlay_generic")
        self.busy_overlay.setAlignment(Qt.AlignCenter)
        self.busy_overlay.setObjectName("busyOverlay")   # style : QSS globale (theme.py)
        self.busy_overlay.hide()

        # Restaure les reglages memorises (preset, sliders, cases, geometrie).
        # Langue + theme sont deja charges (tout en haut de __init__).
        self._load_settings()
        self.apply_theme(self._dark)
        self.retranslate_ui()   # applique la langue chargee (bouton, tooltip rembg, etc.)

        # Detourage IA (rembg) pas toujours installe : refleter la realite dans l'UI
        # (sinon une case cochee + rembg absent = echec silencieux a chaque apercu).
        if self._rembg_missing:
            self.chk_bg_ai.setChecked(False)
            self.chk_bg_ai.setEnabled(False)

        # Coller une image depuis le presse-papiers (ex. capture d'ecran) : evite
        # de devoir d'abord la sauver dans un fichier pour la charger.
        self._paste_shortcut = QShortcut(QKeySequence.Paste, self)
        self._paste_shortcut.activated.connect(self.paste_image)

    def paste_image(self):
        img = QApplication.clipboard().image()
        if img.isNull():
            self.statusBar().showMessage(self._t("status_no_clip_image"), 3000)
            return
        if self._paste_tmp:
            self._paste_tmp.unlink(missing_ok=True)
        fd, tmp = tempfile.mkstemp(suffix=".png")
        os.close(fd)
        img.save(tmp, "PNG")
        self._paste_tmp = Path(tmp)
        self.statusBar().showMessage(self._t("status_pasted"), 3000)
        self.load_image(self._paste_tmp, is_crop=False,
                        display_name=self._t("display_name_pasted"))

    def load_demo_image(self):
        """Genere un logo d'exemple (aucun asset a livrer) pour un premier essai sans fichier."""
        if self._demo_tmp:
            self._demo_tmp.unlink(missing_ok=True)
        img = Image.new("RGBA", (480, 480), (255, 255, 255, 0))
        d = ImageDraw.Draw(img)
        d.ellipse((40, 40, 440, 440), fill=(122, 82, 245, 255))            # violet
        d.pieslice((40, 40, 440, 440), 210, 330, fill=(201, 43, 192, 255))  # quartier magenta
        d.ellipse((175, 175, 305, 305), fill=(63, 215, 251, 255))          # centre cyan
        d.polygon([(240, 95), (263, 190), (325, 150)], fill=(255, 255, 255, 255))  # eclat
        fd, tmp = tempfile.mkstemp(suffix=".png")
        os.close(fd)
        img.save(tmp)
        self._demo_tmp = Path(tmp)
        self.statusBar().showMessage(self._t("status_demo_loaded"), 5000)
        self.load_image(self._demo_tmp, is_crop=False,
                        display_name=self._t("display_name_demo"))

    # --- helpers UI ---
    def _labeled(self, text_key, widget, small=False, show_value=False, on_expand=None,
                value_fmt=None):
        """`text_key` est une cle i18n (STRINGS) : le libelle se retraduit tout seul
        (cf. `_retranslators`) quand la langue change."""
        box = QVBoxLayout()
        lbl = QLabel()
        lbl.setAlignment(Qt.AlignCenter)
        # Pour un slider : on affiche sa valeur en direct dans le titre.
        # value_fmt permet d'afficher une valeur dérivée plutôt que le cran brut
        # (ex. "Couleurs" : le slider va de 1 à 8 mais la vraie quantité est 2**v).
        if show_value and isinstance(widget, QSlider):
            def _upd(*_a, _k=text_key, _l=lbl, _fmt=value_fmt, _w=widget):
                shown = _fmt(_w.value()) if _fmt else _w.value()
                _l.setText(f"{self._t(_k)} : {shown}")
            _upd()
            widget.valueChanged.connect(_upd)
            self._retranslators.append(_upd)
        else:
            lbl.setText(self._t(text_key))
            self._retranslators.append(lambda _l=lbl, _k=text_key: _l.setText(self._t(_k)))
        if on_expand is not None:
            # Titre + bouton plein écran à droite.
            head = QHBoxLayout()
            head.addStretch(1)
            head.addWidget(lbl)
            head.addStretch(1)
            btn = QPushButton()
            btn.setIcon(icon(ICON_EXPAND))
            btn.setIconSize(QSize(14, 14))
            btn.setFixedSize(28, 22)
            btn.setToolTip(self._t("fullscreen_tooltip"))
            btn.clicked.connect(on_expand)
            head.addWidget(btn)
            self._retranslators.append(
                lambda _b=btn: _b.setToolTip(self._t("fullscreen_tooltip")))
            box.addLayout(head)
        else:
            box.addWidget(lbl)
        box.addWidget(widget)
        w = QWidget()
        w.setLayout(box)
        if small:
            w.setMaximumWidth(140)
        return w

    def _slider(self, lo, hi, val):
        s = QSlider(Qt.Horizontal)
        s.setRange(lo, hi)
        s.setValue(val)
        return s

    # --- i18n (FR/EN) ---
    def _t(self, key: str, **kwargs) -> str:
        """Traduit `key` dans la langue courante (repli sur le français puis la clé)."""
        text = STRINGS.get(self.lang, STRINGS["fr"]).get(key, key)
        return text.format(**kwargs) if kwargs else text

    def _tr_widget(self, widget, text_key=None, tooltip_key=None):
        """Applique la traduction initiale et enregistre `widget` pour la bascule de langue."""
        def _upd():
            if text_key:
                widget.setText(self._t(text_key))
            if tooltip_key:
                widget.setToolTip(self._t(tooltip_key))
        _upd()
        self._retranslators.append(_upd)
        return widget

    def current_params(self) -> VectorParams:
        base = PRESETS[self.preset.currentData()]
        p = VectorParams(**vars(base))
        p.filter_speckle = self.s_speckle.value()
        p.color_precision = self.s_colors.value()
        p.corner_threshold = self.s_corner.value()
        p.bg_tolerance = self.s_tol.value()
        p.remove_background = self.chk_bg.isChecked()
        p.remove_background_ai = self.chk_bg_ai.isChecked()
        p.merge_colors = self.chk_merge.isChecked()
        p.merge_threshold = self.s_merge.value()
        p.contrast = self.s_contrast.value()
        p.sharpen = self.s_sharpen.value()
        return p

    def apply_preset(self, key):
        p = PRESETS[key]
        self.s_speckle.setValue(p.filter_speckle)
        self.s_colors.setValue(p.color_precision)
        self.s_corner.setValue(p.corner_threshold)
        self.s_merge.setValue(p.merge_threshold)

    def _repopulate_preset_combo(self):
        """(Re)peuple le preset avec les libelles de la langue courante.

        `addItem(label, key)` : `currentText()` = libelle affiché (traduit),
        `currentData()` = identifiant stable de vectorizer.PRESETS (insensible
        a la langue, donc utilisable pour QSettings et RECIPES sans casser
        quand on bascule FR/EN).
        """
        current_key = self.preset.currentData()
        self.preset.blockSignals(True)
        self.preset.clear()
        labels = PRESET_LABELS[self.lang]
        for key in PRESETS:
            self.preset.addItem(labels[key], key)
        if current_key is not None:
            idx = self.preset.findData(current_key)
            if idx >= 0:
                self.preset.setCurrentIndex(idx)
        self.preset.blockSignals(False)

    # --- plein ecran ---
    def open_fullscreen(self, which: str):
        """Ouvre l'aperçu (original ou svg) en grand, zoomable/déplaçable."""
        view = SvgView(tr=self._t)
        view.setBackgroundBrush(checker_brush(self._dark))
        if which == "svg" and self.svg_path:
            view.load(str(self.svg_path))
            title = self._t("title_fullscreen_svg")
        elif which == "original" and self.original._src_pix is not None:
            view.show_pixmap(self.original._src_pix)
            title = self._t("title_fullscreen_original")
        else:
            self.statusBar().showMessage(self._t("status_nothing_fullscreen"), 3000)
            return
        dlg = QDialog(self)
        dlg.setWindowTitle(title + self._t("fullscreen_suffix"))
        lay = QVBoxLayout(dlg)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.addWidget(view)
        dlg.resize(1100, 800)
        dlg.showMaximized()
        dlg.exec()

    # --- comparaison a glissiere ---
    def open_compare(self):
        """Rideau avant/apres : original a gauche du curseur, SVG vectorise a droite."""
        if not self.svg_path or self.original._src_pix is None:
            self.statusBar().showMessage(self._t("status_compare_need_vector"), 3000)
            return
        before = self.original._src_pix
        renderer = QSvgRenderer(str(self.svg_path))
        after = QPixmap(before.size())
        after.fill(Qt.transparent)
        p = QPainter(after)
        renderer.render(p)
        p.end()

        dlg = QDialog(self)
        dlg.setWindowTitle(self._t("title_compare"))
        lay = QVBoxLayout(dlg)
        view = CompareView()
        view.set_images(before, after)
        slider = QSlider(Qt.Horizontal)
        slider.setRange(0, 100)
        slider.setValue(50)
        slider.valueChanged.connect(lambda v: view.set_position(v / 100))
        lay.addWidget(view, 1)
        lay.addWidget(slider)
        dlg.resize(1100, 800)
        dlg.showMaximized()
        dlg.exec()

    # --- suppression d'aplats (clic sur le SVG) ---
    def _toggle_delete_mode(self, on: bool):
        self.preview.set_delete_mode(on)
        if on:
            self.statusBar().showMessage(self._t("status_delete_mode"), 5000)

    def delete_shape_at(self, x: float, y: float):
        if not self.svg_path or not self.btn_del.isChecked() or self._del_worker is not None:
            return  # rien a faire, ou une suppression tourne deja
        self._del_pending_txt = self.svg_path.read_text(encoding="utf-8")
        self._set_busy(True, self._t("busy_delete"))
        self._del_worker = DeleteWorker(self._del_pending_txt, x, y)
        self._del_worker.done.connect(self._on_delete_done)
        self._del_worker.failed.connect(self._on_delete_failed)
        self._del_worker.start()

    def _on_delete_done(self, new_svg: str, removed: int):
        pending = self._del_pending_txt   # capture avant _finish_delete() qui la remet a None
        self._finish_delete()
        if removed <= 0:
            self.statusBar().showMessage(self._t("status_delete_nothing"), 3000)
            return
        self._del_history.append(pending)   # pour annuler
        self.svg_path.write_text(new_svg, encoding="utf-8")
        self.preview.load(str(self.svg_path))
        self._show_stats(self.svg_path)
        self.btn_undo.setEnabled(True)
        self.statusBar().showMessage(self._t("status_delete_done", n=removed), 4000)

    def _on_delete_failed(self, msg: str):
        self._finish_delete()
        self.statusBar().showMessage(self._t("status_delete_failed", msg=msg[:80]), 4000)

    def _finish_delete(self):
        if self._del_worker is not None:
            self._del_worker.deleteLater()
            self._del_worker = None
        self._del_pending_txt = None
        self._set_busy(False)

    def undo_delete(self):
        if not self._del_history or not self.svg_path:
            return
        self.svg_path.write_text(self._del_history.pop(), encoding="utf-8")
        self.preview.load(str(self.svg_path))
        self._show_stats(self.svg_path)
        self.btn_undo.setEnabled(bool(self._del_history))
        self.statusBar().showMessage(self._t("status_undo_done"), 3000)

    # --- aide aux reglages ---
    def open_help(self):
        SettingsHelpDialog(self).exec()

    def apply_recipe(self, cfg: dict):
        """Applique une recette de réglages (depuis l'aide) puis relance l'aperçu."""
        if "preset" in cfg:
            idx = self.preset.findData(cfg["preset"])   # repositionne des sliders
            if idx >= 0:
                self.preset.setCurrentIndex(idx)
        sliders = {
            "colors": self.s_colors, "speckle": self.s_speckle,
            "corner": self.s_corner, "tol": self.s_tol, "merge": self.s_merge,
            "contrast": self.s_contrast, "sharpen": self.s_sharpen,
        }
        for key, widget in sliders.items():
            if key in cfg:
                widget.setValue(cfg[key])
        checks = {
            "merge_on": self.chk_merge, "bg": self.chk_bg, "bg_ai": self.chk_bg_ai,
            "grad": self.chk_grad, "refine": self.chk_refine,
        }
        for key, widget in checks.items():
            if key in cfg:
                widget.setChecked(cfg[key])
        self.statusBar().showMessage(self._t("status_recipe_applied"), 3000)
        self.run_vectorize(silent=True)

    # --- apercu live ---
    def _schedule_live(self, *_):
        # Relance differee, seulement si une image est chargee.
        if self.src_path:
            self._live.start()

    def _live_run(self):
        # Le detourage IA est trop lent pour l'auto-apercu : on l'exclut.
        if self.chk_bg_ai.isChecked():
            return
        self.run_vectorize(silent=True)

    # --- rognage ---
    def crop_to_selection(self):
        box = self.original.selection_in_image_px()
        if not box or not self.src_path:
            self.statusBar().showMessage(self._t("status_crop_need_selection"), 4000)
            return
        try:
            cropped = Image.open(self.src_path).crop(box)
            fd, tmp = tempfile.mkstemp(suffix=".png")
            os.close(fd)
            cropped.save(tmp)
        except Exception as e:  # noqa: BLE001
            QMessageBox.critical(self, self._t("title_error"), self._t("err_crop_failed", e=e))
            return
        prev = self._crop_tmp
        self._crop_tmp = Path(tmp)
        # is_crop=True : conserve l'image d'origine pour le bouton « revenir ».
        self.load_image(self._crop_tmp, is_crop=True)
        self.btn_reset_img.setEnabled(True)
        if prev and prev != self._crop_tmp:
            prev.unlink(missing_ok=True)

    def reset_image(self):
        if self.orig_src:
            self.load_image(self.orig_src, is_crop=False)

    def _cleanup_crop_tmp(self):
        if self._crop_tmp:
            self._crop_tmp.unlink(missing_ok=True)
            self._crop_tmp = None

    # --- actions ---
    def load_image(self, path: Path, is_crop: bool = False, display_name: str | None = None):
        if not is_crop:
            # Nouvelle image source : on oublie tout rognage precedent.
            self._cleanup_crop_tmp()
            self.orig_src = path
            self.btn_reset_img.setEnabled(False)
        self.src_path = path
        # Titre de fenetre : nom "propre" (les fichiers temp de collage/rognage/demo
        # ont un nom illisible, on prefere le nom d'origine ou un libelle explicite).
        # Memorise pour pouvoir reconstruire le titre si la langue change ensuite.
        if display_name:
            name = display_name
        elif is_crop and self.orig_src:
            name = f"{self.orig_src.name}{self._t('crop_suffix')}"
        else:
            name = path.name
        self._cur_display_name = name
        self.setWindowTitle(f"{self._t('app_name')} — {name}")
        self.original.show_image(path)
        self.btn_vec.setEnabled(True)
        self.btn_crop.setEnabled(True)
        self.btn_exp.setEnabled(False)
        self.btn_copy.setEnabled(False)
        self.btn_compare.setEnabled(False)
        if self.btn_del.isChecked():
            self.btn_del.setChecked(False)   # sort du mode suppression
        self.btn_del.setEnabled(False)
        self.btn_undo.setEnabled(False)
        self._del_history.clear()
        self.run_vectorize(silent=True)  # premier apercu immediat

    def run_vectorize(self, silent: bool = False):
        if not self.src_path:
            return
        if self._worker is not None:
            # Un calcul tourne deja : on memorise une relance a la fin.
            self._pending = True
            self._pending_silent = silent
            return
        fd, out = tempfile.mkstemp(suffix=".svg")
        os.close(fd)
        self._cur_out = Path(out)
        self._silent = silent
        self._last_warn = None
        self.btn_vec.setText(self._t("btn_vec_running"))
        self.btn_vec.setEnabled(False)
        self._set_busy(True, self._busy_message())
        self._worker = VectorizeWorker(
            self.src_path, self._cur_out, self.current_params(),
            self.chk_grad.isChecked(), self.chk_refine.isChecked())
        self._worker.done.connect(self._on_vec_done)
        self._worker.warning.connect(self._on_vec_warning)
        self._worker.failed.connect(self._on_vec_failed)
        self._worker.start()

    def _on_vec_warning(self, msg: str):
        # Dégradés/Affinage a échoué : le SVG brut (vtracer) est gardé. `done` suit
        # immédiatement et écrase la barre d'état avec les stats -> on mémorise le
        # message pour que `_show_stats` l'y intègre au lieu de le faire disparaître.
        self._last_warn = msg

    def _busy_message(self) -> str:
        """Message d'activité adapté aux options actives (l'IA est la plus lente)."""
        if self.chk_bg_ai.isChecked():
            return self._t("busy_ai_bg")
        extra = self._t("busy_extra_grad") if self.chk_grad.isChecked() else ""
        return self._t("busy_vec", extra=extra)

    def _set_busy(self, on: bool, msg: str = ""):
        self.busy.setVisible(on)
        if on:
            self.busy_overlay.setGeometry(self.preview.rect())
            self.busy_overlay.show()
            self.busy_overlay.raise_()
            if msg:
                self.statusBar().showMessage(msg)
        else:
            self.busy_overlay.hide()

    def _on_vec_done(self, out_str: str):
        out = Path(out_str)
        self._optimize_in_place(out)   # allege le SVG (rendu inchange)
        # Nettoie le SVG temporaire precedent (evite les orphelins en apercu live).
        if self.svg_path and self.svg_path != out:
            self.svg_path.unlink(missing_ok=True)
        self.svg_path = out
        self.preview.load(str(out))
        self.btn_exp.setEnabled(True)
        self.btn_copy.setEnabled(True)
        self.btn_compare.setEnabled(True)
        self.btn_del.setEnabled(True)
        # Nouveau SVG : l'historique de suppressions ne s'applique plus.
        self._del_history.clear()
        self.btn_undo.setEnabled(False)
        self._show_stats(out)
        self._finish_vec()

    @staticmethod
    def _optimize_in_place(svg: Path):
        try:
            svg.write_text(optimize_svg(svg.read_text(encoding="utf-8")), encoding="utf-8")
        except OSError:
            pass

    def _on_vec_failed(self, msg: str):
        if not self._silent:
            QMessageBox.critical(
                self, self._t("title_error"), self._t("err_vectorize_failed", msg=msg))
        if self._cur_out:
            self._cur_out.unlink(missing_ok=True)  # temp cree mais non retenu
        self._finish_vec()

    def _finish_vec(self):
        if self._worker is not None:
            self._worker.deleteLater()
            self._worker = None
        self._cur_out = None
        self.btn_vec.setText(self._t("btn_vec"))
        self.btn_vec.setEnabled(True)
        if self._pending:
            self._pending = False
            self.run_vectorize(silent=self._pending_silent)  # relance : garde l'indicateur
        else:
            self._set_busy(False)                            # vraiment terminé

    def closeEvent(self, e):
        # Memorise les reglages pour la prochaine session.
        self._save_settings()
        # Laisse les calculs en cours se terminer proprement, puis nettoie les temp.
        if self._batch is not None:
            self._batch.cancel()
            self._batch.wait(3000)
        if self._worker is not None:
            self._worker.wait(3000)
        if self._del_worker is not None:
            self._del_worker.wait(3000)
        if self.svg_path:
            self.svg_path.unlink(missing_ok=True)
        if self._cur_out:
            self._cur_out.unlink(missing_ok=True)
        self._cleanup_crop_tmp()
        if self._paste_tmp:
            self._paste_tmp.unlink(missing_ok=True)
        if self._demo_tmp:
            self._demo_tmp.unlink(missing_ok=True)
        super().closeEvent(e)

    def _show_stats(self, svg: Path):
        """Affiche le poids et le nombre de traces du SVG dans la barre d'etat.

        Ajoute la comparaison de poids avec l'image source (argument central de
        l'outil : "450 Ko -> 12 Ko") et, s'il y en a un, l'avertissement du dernier
        post-traitement raté (cf. `_on_vec_warning` : sans ça il serait écrasé ici).
        """
        try:
            size_kb = svg.stat().st_size / 1024
            n_paths = svg.read_text(encoding="utf-8", errors="ignore").count("<path")
            msg = self._t("stats_svg", n=n_paths, kb=f"{size_kb:.1f}")
            if self.src_path and self.src_path.exists():
                src_kb = self.src_path.stat().st_size / 1024
                if src_kb > 0:
                    pct = ((size_kb - src_kb) / src_kb) * 100
                    msg += self._t(
                        "stats_weight", src=f"{src_kb:.0f}", out=f"{size_kb:.1f}",
                        pct=f"{pct:+.0f}%")
            if self._last_warn:
                msg += self._t("stats_warn", msg=self._last_warn[:50])
                self._last_warn = None
            self.statusBar().showMessage(msg)
        except OSError:
            pass

    def copy_svg(self):
        """Copie le code SVG (optimisé) dans le presse-papiers."""
        if not self.svg_path:
            return
        try:
            txt = self.svg_path.read_text(encoding="utf-8")
        except OSError:
            return
        QApplication.clipboard().setText(txt)
        self.statusBar().showMessage(self._t("status_svg_copied"), 3000)

    # --- theme ---
    def toggle_theme(self, dark: bool):
        self.apply_theme(dark)

    def apply_theme(self, dark: bool):
        """Applique le theme clair/sombre (QSS globale + damier de transparence)."""
        self._dark = dark
        QApplication.instance().setStyleSheet(build_qss(dark))
        self.preview.setBackgroundBrush(checker_brush(dark))
        self.btn_theme.setIcon(icon(ICON_SUN if dark else ICON_MOON))
        if self.btn_theme.isChecked() != dark:
            self.btn_theme.blockSignals(True)
            self.btn_theme.setChecked(dark)
            self.btn_theme.blockSignals(False)

    # --- langue ---
    def toggle_lang(self):
        self.lang = "en" if self.lang == "fr" else "fr"
        self.retranslate_ui()

    def _update_lang_button(self):
        # Le bouton affiche la langue VERS laquelle on bascule (convention InOneShot).
        self.btn_lang.setText("EN" if self.lang == "fr" else "FR")

    def retranslate_ui(self):
        """Reapplique tous les textes dans la langue courante (bascule FR/EN)."""
        for fn in self._retranslators:
            fn()
        self._repopulate_preset_combo()
        self._update_lang_button()
        if self._rembg_missing:
            self.chk_bg_ai.setToolTip(self._t("chk_bg_ai_unavailable_tooltip"))
        if self._cur_display_name:
            self.setWindowTitle(f"{self._t('app_name')} — {self._cur_display_name}")
        else:
            self.setWindowTitle(self._t("app_name"))

    def _ask_png_size(self) -> int | None:
        """Demande la resolution PNG (cote long) : presets + valeur libre.
        Renvoie None si annule."""
        dlg = SizeDialog(
            self, self._t("png_size_title"), self._t("png_size_label"),
            self._last_png_size, recommended_tip=self._t("png_size_recommended"))
        if dlg.exec() != QDialog.DialogCode.Accepted:
            return None
        size = dlg.value()
        self._last_png_size = size
        return size

    def _ask_svg_size(self) -> int | None:
        """Demande la taille "native" du SVG (cote long) : presets + valeur libre,
        ou "Taille d'origine". Le rendu vectoriel est identique quelle que soit
        la taille choisie -- ca ne change que les dimensions declarees dans le
        fichier (cf. export.resize_svg), pas la precision du tracé. Renvoie 0
        pour garder la taille d'origine, ou None si l'utilisateur annule.
        """
        dlg = SizeDialog(
            self, self._t("svg_size_title"), self._t("svg_size_label"),
            self._last_svg_size, offer_original=True,
            recommended_tip=self._t("png_size_recommended"))
        if dlg.exec() != QDialog.DialogCode.Accepted:
            return None
        size = dlg.value()
        self._last_svg_size = size
        return size

    def export_any(self):
        if not self.svg_path:
            return
        stem = self.src_path.stem if self.src_path else "logo"
        start = os.path.join(self._last_dir, stem) if self._last_dir else stem
        f, flt = QFileDialog.getSaveFileName(
            self, self._t("export_dialog_title"), start, self._t("export_filter"))
        if not f:
            return
        out = Path(f)
        try:
            if "png" in flt or out.suffix.lower() == ".png":
                out = out.with_suffix(".png")
                size = self._ask_png_size()
                if size is None:
                    return
                svg_to_png(self.svg_path, out, max_px=size)
            elif "pdf" in flt or out.suffix.lower() == ".pdf":
                out = out.with_suffix(".pdf")
                svg_to_pdf(self.svg_path, out)
            else:
                out = out.with_suffix(".svg")
                target = self._ask_svg_size()
                if target is None:
                    return
                txt = self.svg_path.read_text(encoding="utf-8")
                if target:
                    txt = resize_svg(txt, target)
                out.write_text(txt, encoding="utf-8")
            self._last_dir = str(out.parent)
        except Exception as e:  # noqa: BLE001
            QMessageBox.critical(self, self._t("title_error"), self._t("err_export_failed", e=e))

    # --- traitement par lot ---
    def run_batch(self):
        if self._batch is not None:
            return  # un lot tourne deja
        in_dir = QFileDialog.getExistingDirectory(
            self, self._t("batch_dialog_title"), self._last_dir)
        if not in_dir:
            return
        files = sorted(p for p in Path(in_dir).iterdir()
                       if p.suffix.lower() in ACCEPTED)
        if not files:
            QMessageBox.information(
                self, self._t("title_batch"), self._t("warn_batch_empty"))
            return
        fmt, ok = QInputDialog.getItem(
            self, self._t("batch_format_title"), self._t("batch_format_label"),
            ["SVG", "PNG", "PDF"], 0, False)
        if not ok:
            return
        png_size = 2048
        svg_size = 0
        if fmt == "PNG":
            size = self._ask_png_size()
            if size is None:
                return
            png_size = size
        elif fmt == "SVG":
            size = self._ask_svg_size()
            if size is None:
                return
            svg_size = size
        out_dir = QFileDialog.getExistingDirectory(
            self, self._t("batch_out_dialog_title"), in_dir)
        if not out_dir:
            return
        self._last_dir = out_dir
        self._start_batch(files, Path(out_dir), fmt.lower(), png_size, svg_size)

    def _start_batch(self, files, out_dir, fmt, png_size=2048, svg_size=0):
        self._progress = QProgressDialog(
            self._t("batch_preparing"), self._t("batch_cancel"), 0, len(files), self)
        self._progress.setWindowTitle(self._t("title_batch"))
        self._progress.setWindowModality(Qt.WindowModal)
        self._progress.setMinimumDuration(0)
        self._batch = BatchWorker(files, out_dir, fmt, self.current_params(),
                                  self.chk_grad.isChecked(), self.chk_refine.isChecked(),
                                  png_size, svg_size)
        self._batch.progress.connect(self._on_batch_progress)
        self._batch.done.connect(self._on_batch_done)
        self._progress.canceled.connect(self._batch.cancel)
        self._progress.show()
        self._batch.start()

    def _on_batch_progress(self, i, name):
        if self._progress is not None:
            self._progress.setValue(i - 1)
            self._progress.setLabelText(f"({i}) {name}")

    def _on_batch_done(self, done_n, errors, warnings):
        if self._progress is not None:
            self._progress.setValue(self._progress.maximum())
            self._progress = None
        if self._batch is not None:
            self._batch.deleteLater()
            self._batch = None
        msg = self._t("batch_done_msg", n=done_n)
        if warnings:
            msg += "\n" + self._t("batch_warn_msg", n=warnings)
        if errors:
            msg += "\n" + self._t("batch_err_msg", n=errors)
        QMessageBox.information(self, self._t("title_batch_done"), msg)

    # --- reglages persistants (QSettings) ---
    def _slider_map(self):
        return {"s_speckle": self.s_speckle, "s_colors": self.s_colors,
                "s_corner": self.s_corner, "s_tol": self.s_tol,
                "s_merge": self.s_merge, "s_contrast": self.s_contrast,
                "s_sharpen": self.s_sharpen}

    def _chk_map(self):
        return {"chk_bg": self.chk_bg, "chk_bg_ai": self.chk_bg_ai,
                "chk_merge": self.chk_merge, "chk_grad": self.chk_grad,
                "chk_refine": self.chk_refine}

    def _load_settings(self):
        # Langue + theme sont deja charges tout en haut de __init__ (necessaires
        # avant la construction des premiers widgets) ; on ne relit ici que le
        # reste (preset/sliders/cases/geometrie), qui dependent des widgets existants.
        s = self._settings
        geo = s.value("geometry")
        if geo is not None:
            self.restoreGeometry(geo)
        preset_key = s.value("preset")
        if preset_key in PRESETS:
            # D'abord le preset (il repositionne des sliders)…
            idx = self.preset.findData(preset_key)
            if idx >= 0:
                self.preset.setCurrentIndex(idx)
        # …puis les valeurs memorisees, qui priment sur celles du preset.
        for name, sl in self._slider_map().items():
            v = s.value(name)
            if v is not None:
                sl.setValue(int(v))
        for name, chk in self._chk_map().items():
            v = s.value(name)
            if v is not None:
                chk.setChecked(v in (True, "true", "True", 1, "1"))
        self._last_dir = s.value("last_dir", "") or ""
        png_size = s.value("png_size")
        if png_size is not None and 8 <= int(png_size) <= 8192:
            self._last_png_size = int(png_size)
        svg_size = s.value("svg_size")
        if svg_size is not None and (int(svg_size) == 0 or 8 <= int(svg_size) <= 8192):
            self._last_svg_size = int(svg_size)

    def _save_settings(self):
        s = self._settings
        s.setValue("geometry", self.saveGeometry())
        s.setValue("preset", self.preset.currentData())
        for name, sl in self._slider_map().items():
            s.setValue(name, sl.value())
        for name, chk in self._chk_map().items():
            s.setValue(name, chk.isChecked())
        s.setValue("last_dir", self._last_dir)
        s.setValue("dark_mode", self._dark)
        s.setValue("lang", self.lang)
        s.setValue("png_size", self._last_png_size)
        s.setValue("svg_size", self._last_svg_size)


def main():
    app = QApplication(sys.argv)
    app.setWindowIcon(app_icon())
    win = MainWindow()
    win.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
