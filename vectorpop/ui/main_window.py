from __future__ import annotations

import importlib.util
import os
import tempfile
import time
from pathlib import Path

from PySide6.QtCore import Qt, QTimer, QSize, QSettings, QUrl
from PySide6.QtGui import (
    QDesktopServices,
    QIcon,
    QKeySequence,
    QPainter,
    QPixmap,
    QShortcut,
)
from PySide6.QtSvg import QSvgRenderer
from PySide6.QtWidgets import (
    QApplication,
    QCheckBox,
    QComboBox,
    QDialog,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QMenu,
    QMessageBox,
    QProgressBar,
    QProgressDialog,
    QPushButton,
    QSizePolicy,
    QSlider,
    QSplitter,
    QVBoxLayout,
    QWidget,
    QFileDialog,
)
from PIL import Image

from .. import ai_module, ai_upscale
from .. import analytics, onboarding, updater
from ..analytics import track_event
from ..export import add_svg_background, resize_svg, svg_to_pdf, svg_to_png
from ..optimize import optimize_svg
from ..license import (
    FEAT_AI_UPSCALE,
    FEAT_AUTOTUNE,
    FEAT_BATCH,
    FEAT_BG_AI,
    FEAT_DELETE_SHAPE,
    FEAT_EXPORT_PDF,
    FEAT_EXPORT_PNG,
    FREE_DAILY_MAX,
    PRO_PRICE_EUR,
    LicenseManager,
    UsageTracker,
)
from ..i18n import PRESET_LABELS, STRINGS, detect_system_lang
from ..theme import (
    ICON_COMPARE,
    ICON_CROP,
    ICON_EXPAND,
    ICON_HELP,
    ICON_LAYERS,
    ICON_MOON,
    ICON_RESET,
    ICON_SUN,
    ICON_TRASH,
    ICON_UNDO,
    build_qss,
    checker_brush,
    window_bg,
    icon,
)
from ..vectorizer import PRESETS, VectorParams
from ..app_utils import app_icon, sample_asset, ACCEPTED

from ..core.workers import (
    VectorizeWorker,
    AutoTuneWorker,
    BatchWorker,
    DeleteWorker,
    LicenseRefreshWorker,
    AIDownloadWorker,
    WeightsDownloadWorker,
)
from ..core.recipes import RECIPES
from ..core.demo_models import DEMO_MODELS, DEMO_MODELS_BY_ID
from .widgets import CompareView, DropImage, FadingScrollArea, SvgView
from .dialogs import (
    ExportCelebrationDialog,
    LicenseDialog,
    ProDialog,
    ReviewPromptDialog,
    SettingsHelpDialog,
    SizeDialog,
)
from .onboarding_dialog import OnboardingDialog
from .batch_dialog import BatchDialog, collect_images


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        # Langue + theme charges en tout premier : necessaires des la construction
        # des premiers widgets (placeholders, libelles de preset, etc.).
        self._settings = QSettings("VectorPop", "VectorPop")
        # Choix « statistiques anonymes » (aide > Confidentialite), applique
        # AVANT le premier event (app_opened, fin de __init__).
        analytics.set_user_enabled(
            self._settings.value("analytics_enabled", True)
            not in (False, "false", "False", 0, "0")
        )
        self._btn_update: QPushButton | None = None
        self._update_worker = None
        self.lang = self._settings.value("lang") or detect_system_lang()
        if self.lang not in STRINGS:
            self.lang = "fr"
        dark_setting = self._settings.value("dark_mode")
        self._dark = (
            dark_setting in (True, "true", "True", 1, "1")
            if dark_setting is not None
            else False
        )
        ai_module.ensure_on_path()  # rend rembg importable si deja telecharge
        self._rembg_missing = importlib.util.find_spec("rembg") is None
        self._retranslators: list = []  # callables a rejouer au changement de langue
        self._cur_display_name: str | None = (
            None  # pour reconstruire le titre de fenetre
        )

        # Licence : is_pro() est purement local (aucun reseau), donc appelable
        # a chaque clic sans geler l'UI. La revalidation en ligne part dans un
        # thread a la fin de __init__.
        self.lic = LicenseManager()
        self.usage = UsageTracker()
        self._lic_worker: LicenseRefreshWorker | None = None

        self.setWindowTitle(self._t("app_name"))
        self.setWindowIcon(app_icon())
        self.resize(1120, 680)

        self.src_path: Path | None = None  # image courante (peut etre un rognage)
        self.orig_src: Path | None = None  # image d'origine (pour « revenir »)
        self.svg_path: Path | None = None
        self._crop_tmp: Path | None = None  # PNG temporaire du dernier rognage
        self._paste_tmp: Path | None = (
            None  # PNG temporaire de la derniere image collee
        )
        self._worker: VectorizeWorker | None = None
        self._cur_out: Path | None = None  # SVG temp du worker en cours
        self._autotune_worker: AutoTuneWorker | None = None
        self._autotune_out: Path | None = None  # SVG temp de la recherche auto
        self._silent = True  # erreurs muettes (apercu live)
        self._pending = False  # une relance est demandee
        self._pending_silent = True
        self._batch: BatchWorker | None = None
        self._ai_worker: AIDownloadWorker | None = None
        self._ai_progress: QProgressDialog | None = None
        self._up_worker: WeightsDownloadWorker | None = None
        self._up_progress: QProgressDialog | None = None
        self._pending_upscale = False  # re-enclenche la finition apres le module IA
        self._last_dir = ""  # dernier dossier d'export (memorise)
        self._last_png_size = 2048  # derniere resolution PNG choisie (memorisee)
        self._last_svg_size = 0  # derniere taille SVG choisie (0 = origine)
        self._last_warn: str | None = None  # avertissement post-traitement en attente

        # Debounce de l'apercu live : on attend que l'utilisateur arrete de bouger.
        self._live = QTimer(self)
        self._live.setSingleShot(True)
        self._live.setInterval(450)
        self._live.timeout.connect(self._live_run)

        # --- Apercus ---
        self.original = DropImage(
            self.load_image,
            on_demo=self.load_demo_model,
            tr=self._t,
            on_files=self.drop_many,
        )
        self.preview = SvgView(tr=self._t)
        self.preview.zoomChanged.connect(self._on_svg_zoom)
        self._retranslators.append(self.original.retranslate)
        self._retranslators.append(self.preview.retranslate)

        # Panneaux dans un QSplitter : 50/50 au départ, divise ajustable à la souris.
        self.previews = QSplitter(Qt.Horizontal)
        self.previews.addWidget(
            self._labeled(
                "panel_original",
                self.original,
                on_expand=lambda: self.open_fullscreen("original"),
            )
        )
        self.previews.addWidget(
            self._labeled(
                "panel_svg", self.preview, on_expand=lambda: self.open_fullscreen("svg")
            )
        )
        self.previews.setSizes([500, 500])

        # --- Pretraitement : rognage ---
        icon_sz = QSize(16, 16)
        self.btn_crop = self._tr_widget(QPushButton(), "btn_crop", "btn_crop_tooltip")
        self.btn_crop.setIcon(icon(ICON_CROP))
        self.btn_crop.setIconSize(icon_sz)
        self.btn_crop.clicked.connect(self.crop_to_selection)
        self.btn_crop.setEnabled(False)
        self.btn_reset_img = self._tr_widget(
            QPushButton(), "btn_reset_img", "btn_reset_img_tooltip"
        )
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
        # Freemium 2.0.0 : fonctions Pro utilisees dans le rendu affiche
        # (essai libre dans l'apercu, verrou seulement a l'export).
        self._pro_used: set[str] = set()
        self._vec_pro: set[str] = set()
        self._after_vec = None  # action rejouee apres un recalcul sans Pro
        self._is_demo = False  # image d'exemple : exports hors quota
        self._del_worker: DeleteWorker | None = None
        self._del_pending_txt: str | None = None

        self.btn_help = self._tr_widget(QPushButton(), "btn_help", "btn_help_tooltip")
        self.btn_help.setIcon(icon(ICON_HELP))
        self.btn_help.setIconSize(icon_sz)
        self.btn_help.clicked.connect(self.open_help)

        # Reprendre un modele demo depuis le menu (une fois une vraie image
        # chargee, les tuiles de l'ecran vide ne sont plus visibles).
        self.btn_examples = self._tr_widget(
            QPushButton(), "btn_examples", "btn_examples_tooltip"
        )
        self._examples_menu = QMenu(self.btn_examples)
        self.btn_examples.setMenu(self._examples_menu)
        self._repopulate_examples_menu()

        self.btn_theme = self._tr_widget(QPushButton(), tooltip_key="btn_theme_tooltip")
        self.btn_theme.setCheckable(True)
        self.btn_theme.setIconSize(icon_sz)
        self.btn_theme.setFixedWidth(38)
        self.btn_theme.toggled.connect(self.toggle_theme)

        self.btn_lang = self._tr_widget(QPushButton(), tooltip_key="btn_lang_tooltip")
        self.btn_lang.setMinimumWidth(
            50
        )  # "FR"/"EN" + le padding des boutons (theme.py)
        self.btn_lang.clicked.connect(self.toggle_lang)

        # Libelle pose par refresh_pro_ui() (depend de l'etat de la licence),
        # d'ou l'absence de cle de traduction ici. Sans icone volontairement :
        # ICON_LAYERS est deja celle du bouton « Lot », la reprendre ici
        # laisserait croire a deux boutons de la meme famille.
        self.btn_pro = QPushButton()
        self.btn_pro.clicked.connect(self.open_license)
        self._retranslators.append(self.refresh_pro_ui)

        self.lbl_preprocess = self._tr_widget(QLabel(), "label_preprocess")
        prep = QHBoxLayout()
        prep.addWidget(self.lbl_preprocess)
        prep.addWidget(self.btn_crop)
        prep.addWidget(self.btn_reset_img)
        prep.addWidget(self.btn_del)
        prep.addWidget(self.btn_undo)
        prep.addStretch(1)
        prep.addWidget(self.btn_pro)
        prep.addWidget(self.btn_examples)
        prep.addWidget(self.btn_help)
        prep.addWidget(self.btn_theme)
        prep.addWidget(self.btn_lang)

        # --- Controles ---
        self.preset = QComboBox()
        self._repopulate_preset_combo()
        self.preset.currentIndexChanged.connect(
            lambda i: self.apply_preset(self.preset.itemData(i))
        )

        self.s_speckle = self._slider(0, 20, 4)
        self.s_colors = self._slider(1, 8, 6)
        self.s_corner = self._slider(0, 180, 60)
        self.s_tol = self._slider(0, 120, 32)
        self.s_merge = self._slider(0, 100, 24)
        self.s_contrast = self._slider(-50, 50, 0)  # retouche : contraste avant trace
        self.s_sharpen = self._slider(0, 100, 0)  # retouche : nettete avant trace

        self.chk_bg = self._tr_widget(QCheckBox(), "chk_bg", "chk_bg_tooltip")
        self.chk_bg_ai = self._tr_widget(QCheckBox(), "chk_bg_ai", "chk_bg_ai_tooltip")
        self.chk_upscale = self._tr_widget(
            QCheckBox(), "chk_upscale", "chk_upscale_tooltip"
        )
        self.chk_merge = self._tr_widget(QCheckBox(), "chk_merge", "chk_merge_tooltip")
        self.chk_merge.setChecked(True)
        self.chk_edges = self._tr_widget(QCheckBox(), "chk_edges", "chk_edges_tooltip")
        self.chk_edges.setChecked(True)
        self.chk_grad = self._tr_widget(QCheckBox(), "chk_grad", "chk_grad_tooltip")
        self.chk_refine = self._tr_widget(
            QCheckBox(), "chk_refine", "chk_refine_tooltip"
        )
        # Fond blanc a l'export (SVG/PNG/PDF, et copie) : sans effet sur l'apercu.
        self.chk_white_bg = self._tr_widget(
            QCheckBox(), "chk_white_bg", "chk_white_bg_tooltip"
        )

        bg_box = QVBoxLayout()
        bg_box.addWidget(self.chk_bg)
        bg_box.addWidget(self.chk_merge)
        bg_box.addWidget(self.chk_edges)
        bg_box.addWidget(self.chk_grad)
        bg_box.addWidget(self.chk_refine)
        bg_box.addWidget(self.chk_white_bg)
        bg_w = QWidget()
        bg_w.setLayout(bg_box)

        # Finitions IA : a part, car exclues de l'apercu live (trop lentes) --
        # contrairement aux autres cases ci-dessus, les cocher ne met rien a
        # jour tant qu'on ne lance pas "Vectoriser" soi-meme. Regroupees avec
        # un intitule explicite pour ne pas laisser croire a un bug.
        self.lbl_ai_finishes = self._tr_widget(QLabel(), "label_ai_finishes")
        ai_box = QVBoxLayout()
        ai_box.addWidget(self.lbl_ai_finishes)
        ai_box.addWidget(self.chk_bg_ai)
        ai_box.addWidget(self.chk_upscale)
        ai_w = QWidget()
        ai_w.setLayout(ai_box)

        self.lbl_preset = self._tr_widget(QLabel(), "label_preset")
        controls = QHBoxLayout()
        controls.addWidget(self.lbl_preset)
        controls.addWidget(self.preset)
        controls.addWidget(bg_w)
        controls.addWidget(ai_w)
        controls.addWidget(
            self._labeled("lbl_bgtol", self.s_tol, small=True, show_value=True)
        )
        controls.addWidget(
            self._labeled("lbl_speckle", self.s_speckle, small=True, show_value=True)
        )
        controls.addWidget(
            self._labeled(
                "lbl_colors",
                self.s_colors,
                small=True,
                show_value=True,
                value_fmt=lambda v: 2**v,
            )
        )
        controls.addWidget(
            self._labeled("lbl_corner", self.s_corner, small=True, show_value=True)
        )
        controls.addWidget(
            self._labeled("lbl_merge", self.s_merge, small=True, show_value=True)
        )

        # Retouches d'image (au service de la vectorisation), sur une 2e ligne.
        self.lbl_image_retouch = self._tr_widget(QLabel(), "label_image_retouch")
        controls2 = QHBoxLayout()
        controls2.addWidget(self.lbl_image_retouch)
        controls2.addWidget(
            self._labeled("lbl_contrast", self.s_contrast, small=True, show_value=True)
        )
        controls2.addWidget(
            self._labeled("lbl_sharpen", self.s_sharpen, small=True, show_value=True)
        )
        controls2.addStretch(1)

        # Apercu live : tout changement de reglage relance (en differe) la vectorisation.
        sliders = (
            self.s_speckle,
            self.s_colors,
            self.s_corner,
            self.s_tol,
            self.s_merge,
            self.s_contrast,
            self.s_sharpen,
        )
        for s in sliders:
            s.valueChanged.connect(self._schedule_live)
        self.chk_bg.toggled.connect(self._schedule_live)
        self.chk_bg_ai.toggled.connect(self._schedule_live)
        self.chk_upscale.toggled.connect(self._schedule_live)
        self.chk_merge.toggled.connect(self._schedule_live)
        self.chk_edges.toggled.connect(self._schedule_live)
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
        self.btn_batch = self._tr_widget(
            QPushButton(), "btn_batch", "btn_batch_tooltip"
        )
        self.btn_batch.setIcon(icon(ICON_LAYERS))
        self.btn_batch.setIconSize(QSize(18, 18))
        self.btn_batch.clicked.connect(lambda: self.run_batch())
        self.btn_open_dir = self._tr_widget(
            QPushButton(), "btn_open_dir", "btn_open_dir_tooltip"
        )
        self.btn_open_dir.clicked.connect(self.open_export_dir)
        self.btn_open_dir.setEnabled(False)  # actif apres un 1er export
        self._last_export: Path | None = None
        self.btn_compare = self._tr_widget(
            QPushButton(), "btn_compare", "btn_compare_tooltip"
        )
        self.btn_compare.setIcon(icon(ICON_COMPARE))
        self.btn_compare.setIconSize(QSize(18, 18))
        self.btn_compare.clicked.connect(self.open_compare)
        self.btn_compare.setEnabled(False)
        self.btn_autotune = self._tr_widget(
            QPushButton(), "btn_autotune", "btn_autotune_tooltip"
        )
        self.btn_autotune.clicked.connect(self.run_autotune)
        self.btn_autotune.setEnabled(False)
        for b in (
            self.btn_vec,
            self.btn_exp,
            self.btn_copy,
            self.btn_batch,
            self.btn_compare,
            self.btn_autotune,
        ):
            b.setMinimumHeight(40)

        actions = QHBoxLayout()
        actions.addWidget(self.btn_vec)
        actions.addWidget(self.btn_autotune)
        actions.addWidget(self.btn_exp)
        actions.addWidget(self.btn_copy)
        actions.addWidget(self.btn_open_dir)
        actions.addWidget(self.btn_compare)
        actions.addWidget(self.btn_batch)

        # Reglages dans une zone defilante plafonnee (~40 % de la hauteur, cf.
        # resizeEvent) : sur un petit ecran l'apercu garde sa place, et un fondu
        # en bas indique les reglages caches en dessous.
        settings_w = QWidget()
        settings_lay = QVBoxLayout(settings_w)
        settings_lay.setContentsMargins(0, 0, 0, 0)
        settings_lay.addLayout(controls)
        settings_lay.addLayout(controls2)
        self.settings_scroll = FadingScrollArea()
        self.settings_scroll.setWidget(settings_w)
        self.settings_scroll.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Preferred)
        self.settings_scroll.setMinimumHeight(90)

        root = QVBoxLayout()
        root.addWidget(self.previews, 1)
        root.addLayout(prep)
        root.addWidget(self.settings_scroll)
        root.addLayout(actions)
        central = QWidget()
        central.setLayout(root)
        self.setCentralWidget(central)

        # Indicateur d'activite (barre indeterminee) a droite de la barre d'etat.
        self.busy = QProgressBar()
        self.busy.setRange(0, 0)  # 0..0 = animation "en cours"
        self.busy.setMaximumWidth(150)
        self.busy.setTextVisible(False)
        self.busy.setVisible(False)
        self.statusBar().addPermanentWidget(self.busy)

        # Etat de la licence, en permanence dans la barre d'etat : en gratuit
        # l'utilisateur doit voir fondre son quota AVANT de tomber dessus.
        self.lbl_plan = QLabel()
        self.statusBar().addPermanentWidget(self.lbl_plan)

        # Lien permanent pour signaler un resultat IA incorrect/inapproprie
        # (detourage / finition IA) - exige par les politiques des stores (ex.
        # Microsoft Store 11.16 "Live Generative AI Content").
        self.btn_report_issue = self._tr_widget(
            QPushButton(), "btn_report_issue", "btn_report_issue_tooltip"
        )
        self.btn_report_issue.setFlat(True)
        self.btn_report_issue.setCursor(Qt.PointingHandCursor)
        self.btn_report_issue.clicked.connect(self.report_issue)
        self.statusBar().addPermanentWidget(self.btn_report_issue)

        # Voile « en cours » PAR-DESSUS l'apercu SVG : impossible a rater.
        # (texte generique fixe ; le message specifique va dans la barre de statut).
        self.busy_overlay = self._tr_widget(
            QLabel(self.preview), "busy_overlay_generic"
        )
        self.busy_overlay.setAlignment(Qt.AlignCenter)
        self.busy_overlay.setObjectName("busyOverlay")  # style : QSS globale (theme.py)
        self.busy_overlay.hide()

        # Restaure les reglages memorises (preset, sliders, cases, geometrie).
        # Langue + theme sont deja charges (tout en haut de __init__).
        self._load_settings()
        self.apply_theme(self._dark)
        self.retranslate_ui()  # applique la langue chargee (bouton, tooltip rembg, etc.)

        # Detourage IA (rembg) pas toujours installe : la case reste cliquable
        # (un utilisateur Pro doit pouvoir declencher le telechargement), mais
        # on ne la restaure pas cochee tant que le module n'est pas la (sinon
        # echec silencieux a chaque apercu).
        if self._rembg_missing:
            self.chk_bg_ai.setChecked(False)
        # Meme logique pour la finition IA : cliquable, mais pas restauree
        # cochee tant que le moteur (module IA) ou les poids manquent.
        if not ai_upscale.is_available():
            self.chk_upscale.setChecked(False)

        # Verrou Pro sur le detourage IA. Branche APRES _load_settings pour que
        # la restauration des reglages ne declenche pas l'upsell au demarrage.
        self.chk_bg_ai.toggled.connect(self._guard_bg_ai)
        self.chk_upscale.toggled.connect(self._guard_upscale)
        if not self.lic.is_pro():
            self.chk_bg_ai.setChecked(False)
            self.chk_upscale.setChecked(False)

        # Revalidation de la licence en ligne, en tache de fond (jamais bloquante).
        if self.lic.has_key():
            self._lic_worker = LicenseRefreshWorker(self.lic)
            self._lic_worker.done.connect(self.refresh_pro_ui)
            self._lic_worker.start()

        # Coller une image depuis le presse-papiers (ex. capture d'ecran) : evite
        # de devoir d'abord la sauver dans un fichier pour la charger.
        self._paste_shortcut = QShortcut(QKeySequence.Paste, self)
        self._paste_shortcut.activated.connect(self.paste_image)

        analytics.set_context(lang=self.lang, is_pro=self.lic.is_pro)
        analytics.capture("app_opened")

        # Onboarding : affiche apres que la fenetre principale soit visible
        # (singleShot(0) -> prochain passage de la boucle d'evenements, donc
        # apres le .show() fait par app.main()), pas pendant la construction.
        if onboarding.should_show():
            QTimer.singleShot(0, self._maybe_show_onboarding)
        self._start_update_check()

    # --- confidentialite / mises a jour / zoom ---

    def set_analytics_enabled(self, on: bool):
        """Case « Envoyer des statistiques d'usage anonymes » (aide). Rien n'est
        envoye pour signaler la desactivation elle-meme."""
        if on:
            analytics.set_user_enabled(True)
            analytics.capture("analytics_enabled")
        else:
            analytics.set_user_enabled(False)
        self._settings.setValue("analytics_enabled", bool(on))

    def _start_update_check(self):
        if not updater.should_check(analytics.channel()):
            return  # MSIX / Snap : le store met a jour ; sources : developpement
        self._update_worker = updater.UpdateCheckWorker()
        self._update_worker.found.connect(self._on_update_found)
        self._update_worker.start()

    def _on_update_found(self, data: dict):
        version = str(data.get("version", ""))
        url = str(data.get("url") or updater.DOWNLOAD_URL)
        if self._btn_update is None:
            self._btn_update = QPushButton()
            self._btn_update.setObjectName("btnProCta")
            self._btn_update.setCursor(Qt.PointingHandCursor)
            self.statusBar().insertPermanentWidget(0, self._btn_update)
        self._btn_update.setText(self._t("update_available", v=version))
        self._btn_update.setToolTip(self._t("update_tooltip"))
        try:
            self._btn_update.clicked.disconnect()
        except (RuntimeError, TypeError):
            pass
        self._btn_update.clicked.connect(lambda: self._open_update(version, url))
        self._btn_update.show()
        analytics.capture("update_banner_shown", {"version": version})

    def _open_update(self, version: str, url: str):
        analytics.capture("update_clicked", {"version": version})
        QDesktopServices.openUrl(QUrl(url))

    def _on_svg_zoom(self, factor: float):
        z = f"{factor:.1f}" if factor < 10 else f"{factor:,.0f}".replace(",", " ")
        self.statusBar().showMessage(self._t("status_zoom", z=z), 1500)
        if factor >= 100 and not getattr(self, "_deep_zoom_tracked", False):
            self._deep_zoom_tracked = True  # une fois par session suffit
            analytics.capture("preview_deep_zoom", {"factor": round(factor)})

    def _maybe_show_onboarding(self):
        if onboarding.should_show():
            OnboardingDialog(self).exec()

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
        self.load_image(
            self._paste_tmp,
            is_crop=False,
            display_name=self._t("display_name_pasted"),
            source="paste",
        )

    def load_demo_model(self, model_id: str):
        """Charge l'un des 4 modeles demo (assets/samples/) et force son preset
        (§1.3 du cahier des charges V2 : contourne le piege QSettings, qui sinon
        recharge par-dessus les reglages persistes de l'utilisateur)."""
        model = DEMO_MODELS_BY_ID.get(model_id)
        if model is None:
            return
        path = Path(sample_asset(model.filename))
        if not path.exists():
            return
        self.statusBar().showMessage(self._t(model.tooltip_key), 5000)
        self.load_image(
            path,
            is_crop=False,
            display_name=self._t(model.title_key),
            source="demo",
            model_id=model.id,
            auto_vectorize=False,  # apply_recipe() vectorise avec les BONS reglages
        )
        self.apply_recipe(model.cfg)

    def _repopulate_examples_menu(self):
        """(Re)peuple le menu « Exemples » dans la langue courante."""
        self._examples_menu.clear()
        for model in DEMO_MODELS:
            act = self._examples_menu.addAction(self._t(model.title_key))
            act.triggered.connect(
                lambda _=False, mid=model.id: self.load_demo_model(mid)
            )

    # --- helpers UI ---
    def _labeled(
        self,
        text_key,
        widget,
        small=False,
        show_value=False,
        on_expand=None,
        value_fmt=None,
    ):
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
            self._retranslators.append(
                lambda _l=lbl, _k=text_key: _l.setText(self._t(_k))
            )
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
                lambda _b=btn: _b.setToolTip(self._t("fullscreen_tooltip"))
            )
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
        p.clean_edges = self.chk_edges.isChecked()
        p.ai_upscale = self.chk_upscale.isChecked()
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

    def report_issue(self):
        """Ouvre le client mail par defaut pour signaler un resultat IA problematique."""
        from . import __version__ as app_version

        subject = f"VectorPop {app_version} - Signalement resultat IA"
        body = (
            "Decris ici le probleme rencontre avec le detourage / la finition IA "
            "(joins si possible l'image d'origine et le SVG produit) :\n\n"
        )
        url = QUrl("mailto:george.william@hotmail.fr")
        query = (
            f"subject={QUrl.toPercentEncoding(subject).data().decode()}"
            f"&body={QUrl.toPercentEncoding(body).data().decode()}"
        )
        url.setQuery(query)
        QDesktopServices.openUrl(url)

    # --- suppression d'aplats (clic sur le SVG) ---
    def _toggle_delete_mode(self, on: bool):
        if on:
            self._track_pro_tried(FEAT_DELETE_SHAPE)
        self.preview.set_delete_mode(on)
        if on:
            self.statusBar().showMessage(self._t("status_delete_mode"), 5000)

    def delete_shape_at(self, x: float, y: float):
        if (
            not self.svg_path
            or not self.btn_del.isChecked()
            or self._del_worker is not None
        ):
            return  # rien a faire, ou une suppression tourne deja
        self._del_pending_txt = self.svg_path.read_text(encoding="utf-8")
        self._set_busy(True, self._t("busy_delete"))
        self._del_worker = DeleteWorker(self._del_pending_txt, x, y)
        self._del_worker.done.connect(self._on_delete_done)
        self._del_worker.failed.connect(self._on_delete_failed)
        self._del_worker.start()

    def _on_delete_done(self, new_svg: str, removed: int):
        pending = (
            self._del_pending_txt
        )  # capture avant _finish_delete() qui la remet a None
        self._finish_delete()
        if removed <= 0:
            self.statusBar().showMessage(self._t("status_delete_nothing"), 3000)
            return
        self._del_history.append(pending)  # pour annuler
        self.svg_path.write_text(new_svg, encoding="utf-8")
        self.preview.load(str(self.svg_path))
        self._show_stats(self.svg_path)
        self.btn_undo.setEnabled(True)
        done_msg = self._t("status_delete_done", n=removed)
        self.statusBar().showMessage(done_msg, 4000)
        self._set_pro_used(self._pro_used | {FEAT_DELETE_SHAPE}, prefix=done_msg)

    def _on_delete_failed(self, msg: str):
        self._finish_delete()
        self.statusBar().showMessage(
            self._t("status_delete_failed", msg=msg[:80]), 4000
        )

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
        if not self._del_history:
            self._pro_used.discard(FEAT_DELETE_SHAPE)
        self.statusBar().showMessage(self._t("status_undo_done"), 3000)

    # --- aide aux reglages ---
    def open_help(self):
        SettingsHelpDialog(self).exec()

    def apply_recipe(self, cfg: dict):
        """Applique une recette de réglages (depuis l'aide) puis relance l'aperçu."""
        if "preset" in cfg:
            idx = self.preset.findData(cfg["preset"])  # repositionne des sliders
            if idx >= 0:
                self.preset.setCurrentIndex(idx)
        sliders = {
            "colors": self.s_colors,
            "speckle": self.s_speckle,
            "corner": self.s_corner,
            "tol": self.s_tol,
            "merge": self.s_merge,
            "contrast": self.s_contrast,
            "sharpen": self.s_sharpen,
        }
        for key, widget in sliders.items():
            if key in cfg:
                widget.setValue(cfg[key])
        checks = {
            "merge_on": self.chk_merge,
            "edges": self.chk_edges,
            "bg": self.chk_bg,
            "bg_ai": self.chk_bg_ai,
            "grad": self.chk_grad,
            "refine": self.chk_refine,
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
        # Detourage IA et finition IA trop lents pour l'auto-apercu : exclus.
        if self.chk_bg_ai.isChecked() or self.chk_upscale.isChecked():
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
            QMessageBox.critical(
                self, self._t("title_error"), self._t("err_crop_failed", e=e)
            )
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
    def load_image(
        self,
        path: Path,
        is_crop: bool = False,
        display_name: str | None = None,
        source: str = "file",
        model_id: str | None = None,
        auto_vectorize: bool = True,
    ):
        if not is_crop:
            self._track_image_picked(path, source, model_id)
            self._is_demo = source == "demo"
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
        self.btn_autotune.setEnabled(True)
        self.btn_crop.setEnabled(True)
        self.btn_exp.setEnabled(False)
        self.btn_copy.setEnabled(False)
        self.btn_compare.setEnabled(False)
        if self.btn_del.isChecked():
            self.btn_del.setChecked(False)  # sort du mode suppression
        self.btn_del.setEnabled(False)
        self.btn_undo.setEnabled(False)
        self._del_history.clear()
        if auto_vectorize:
            self.run_vectorize(
                silent=True, trigger=None if is_crop else "load"
            )  # premier apercu immediat

    @staticmethod
    def _track_image_picked(path: Path, source: str, model_id: str | None = None):
        props = {"source": source}
        try:
            props["size_kb"] = round(path.stat().st_size / 1024)
            with Image.open(path) as im:  # lazy : ne lit que l'en-tete
                props.update(
                    width=im.width,
                    height=im.height,
                    has_alpha="A" in im.getbands() or "transparency" in im.info,
                    format=im.format,
                )
        except Exception:  # noqa: BLE001
            pass
        if source == "demo":
            analytics.capture("sample_model_selected", {"model_id": model_id})
        analytics.capture("image_picked", props)

    def run_vectorize(self, silent: bool = False, trigger: str | None = None):
        if not self.src_path:
            return
        if self._worker is not None:
            # Un calcul tourne deja : on memorise une relance a la fin.
            self._pending = True
            self._pending_silent = silent
            return
        # "live" (apercu auto a chaque reglage) n'est pas envoye a PostHog :
        # trop bavard. Seuls le 1er rendu d'une image et le bouton comptent.
        self._vec_trigger = trigger or ("live" if silent else "button")
        self._vec_t0 = time.monotonic()
        self._vec_pro = self._active_ai_features()
        fd, out = tempfile.mkstemp(suffix=".svg")
        os.close(fd)
        self._cur_out = Path(out)
        self._silent = silent
        self._last_warn = None
        self.btn_vec.setText(self._t("btn_vec_running"))
        self.btn_vec.setEnabled(False)
        self._set_busy(True, self._busy_message())
        self._worker = VectorizeWorker(
            self.src_path,
            self._cur_out,
            self.current_params(),
            self.chk_grad.isChecked(),
            self.chk_refine.isChecked(),
        )
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
        if self.chk_upscale.isChecked():
            return self._t("busy_ai_up")
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
        self._optimize_in_place(out)  # allege le SVG (rendu inchange)
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
        self._set_pro_used(set(self._vec_pro))
        if getattr(self, "_vec_trigger", "live") != "live":
            try:
                svg_kb = round(out.stat().st_size / 1024)
            except OSError:
                svg_kb = None
            analytics.capture(
                "vectorize_completed",
                {
                    **self._vec_props(),
                    "trigger": self._vec_trigger,
                    "duration_ms": round((time.monotonic() - self._vec_t0) * 1000),
                    "svg_size_kb": svg_kb,
                },
            )
        self._finish_vec()
        if self._after_vec is not None and self._worker is None:
            action, self._after_vec = self._after_vec, None
            QTimer.singleShot(0, action)

    def _active_ai_features(self) -> set[str]:
        feats = set()
        if self.chk_bg_ai.isChecked():
            feats.add(FEAT_BG_AI)
        if self.chk_upscale.isChecked():
            feats.add(FEAT_AI_UPSCALE)
        return feats

    def _set_pro_used(self, feats: set[str], prefix: str = ""):
        """Fonctions Pro presentes dans le rendu affiche. En gratuit, le
        signale dans la barre d'etat (l'export de ce rendu demandera Pro)."""
        self._pro_used = feats
        if feats and not self.lic.is_pro() and not self._is_demo:
            msg = self._t("status_pro_preview", feats=self._pro_feats_label(feats))
            self.statusBar().showMessage(
                f"{prefix}  |  {msg}" if prefix else msg, 10000
            )

    def _pro_feats_label(self, feats) -> str:
        order = (FEAT_BG_AI, FEAT_AI_UPSCALE, FEAT_AUTOTUNE, FEAT_DELETE_SHAPE)
        return ", ".join(self._t(f"pro_feat_{f}") for f in order if f in feats)

    def _track_pro_tried(self, feature: str):
        if not self.lic.is_pro():
            analytics.capture("pro_feature_tried", {"feature": feature})

    def _pro_features_gate(self, action) -> bool:
        """Avant un export/copie en gratuit : si le rendu utilise des fonctions
        Pro (essayees dans l'apercu), propose Pro OU un export sans elles.
        `action` est rejouee apres le recalcul sans Pro. True = on peut exporter."""
        if self.lic.is_pro() or self._is_demo or not self._pro_used:
            return True
        dlg = ProDialog(
            self,
            self._t("teaser_title"),
            self._t("teaser_body", feats=self._pro_feats_label(self._pro_used)),
            category="pro_features",
            secondary="without",
            highlight=self._pro_used,
        )
        if dlg.exec() == ProDialog.WithoutPro:
            self._rerender_without_pro(action)
        return False

    def _rerender_without_pro(self, action):
        """Recalcule l'apercu avec les reglages courants, sans IA ni resultat
        d'Optimiser ni suppressions d'aplats, puis rejoue `action` (l'export)."""
        for chk in (self.chk_bg_ai, self.chk_upscale):
            chk.blockSignals(True)
            chk.setChecked(False)
            chk.blockSignals(False)
        self._pro_used = set()
        self._after_vec = action
        self.statusBar().showMessage(self._t("status_without_pro"))
        self.run_vectorize(silent=False, trigger="without_pro")

    def _vec_props(self) -> dict:
        return {
            "preset": self.preset.currentData(),
            "ai_detourage": self.chk_bg_ai.isChecked(),
            "ai_upscale": self.chk_upscale.isChecked(),
            "gradients": self.chk_grad.isChecked(),
        }

    @staticmethod
    def _optimize_in_place(svg: Path):
        try:
            svg.write_text(
                optimize_svg(svg.read_text(encoding="utf-8")), encoding="utf-8"
            )
        except OSError:
            pass

    def _on_vec_failed(self, msg: str):
        analytics.capture(
            "vectorize_failed",
            {
                **self._vec_props(),
                "trigger": getattr(self, "_vec_trigger", None),
                "error": msg[:200],
            },
        )
        if not self._silent:
            QMessageBox.critical(
                self, self._t("title_error"), self._t("err_vectorize_failed", msg=msg)
            )
        if self._cur_out:
            self._cur_out.unlink(missing_ok=True)  # temp cree mais non retenu
        self._after_vec = None  # pas d'export sur un rendu en echec
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
            self.run_vectorize(
                silent=self._pending_silent
            )  # relance : garde l'indicateur
        else:
            self._set_busy(False)  # vraiment terminé

    def run_autotune(self):
        """Teste plusieurs reglages et garde celui le plus proche de l'original.

        Plus lent que "Vectoriser" (~12 passes) : bouton dedie, pas d'apercu live.
        """
        if not self.src_path or self._autotune_worker is not None:
            return
        self._track_pro_tried(FEAT_AUTOTUNE)
        analytics.capture("autotune_used", self._vec_props())
        self._autotune_pro = self._active_ai_features() | {FEAT_AUTOTUNE}
        fd, out = tempfile.mkstemp(suffix=".svg")
        os.close(fd)
        self._autotune_out = Path(out)
        self.btn_vec.setEnabled(False)
        self.btn_autotune.setText(self._t("btn_autotune_running"))
        self.btn_autotune.setEnabled(False)
        self._set_busy(True, self._t("busy_autotune", i=0, total=0))
        self._autotune_worker = AutoTuneWorker(
            self.src_path, self._autotune_out, self.current_params()
        )
        self._autotune_worker.progress.connect(self._on_autotune_progress)
        self._autotune_worker.done.connect(self._on_autotune_done)
        self._autotune_worker.failed.connect(self._on_autotune_failed)
        self._autotune_worker.start()

    def _on_autotune_progress(self, i: int, total: int):
        self.statusBar().showMessage(self._t("busy_autotune", i=i, total=total))

    def _on_autotune_done(self, out_str: str, score: float):
        out = Path(out_str)
        self._optimize_in_place(out)
        if self.svg_path and self.svg_path != out:
            self.svg_path.unlink(missing_ok=True)
        self.svg_path = out
        self.preview.load(str(out))
        self.btn_exp.setEnabled(True)
        self.btn_copy.setEnabled(True)
        self.btn_compare.setEnabled(True)
        self.btn_del.setEnabled(True)
        self._del_history.clear()
        self.btn_undo.setEnabled(False)
        self.statusBar().showMessage(
            self._t("status_autotune_done", score=round(score, 1)), 6000
        )
        self._set_pro_used(set(self._autotune_pro))
        self._finish_autotune()

    def _on_autotune_failed(self, msg: str):
        QMessageBox.critical(
            self, self._t("title_error"), self._t("err_vectorize_failed", msg=msg)
        )
        if self._autotune_out:
            self._autotune_out.unlink(missing_ok=True)
        self._finish_autotune()

    def _finish_autotune(self):
        if self._autotune_worker is not None:
            self._autotune_worker.deleteLater()
            self._autotune_worker = None
        self._autotune_out = None
        self.btn_autotune.setText(self._t("btn_autotune"))
        self.btn_autotune.setEnabled(True)
        self.btn_vec.setEnabled(True)
        self._set_busy(False)

    def resizeEvent(self, e):
        super().resizeEvent(e)
        if hasattr(self, "settings_scroll"):
            self.settings_scroll.setMaximumHeight(max(120, int(self.height() * 0.4)))

    def closeEvent(self, e):
        # Memorise les reglages pour la prochaine session.
        self._save_settings()
        # Laisse les calculs en cours se terminer proprement, puis nettoie les temp.
        if self._batch is not None:
            self._batch.cancel()
            self._batch.wait(3000)
        if self._worker is not None:
            self._worker.wait(3000)
        if self._autotune_worker is not None:
            self._autotune_worker.wait(3000)
        if self._del_worker is not None:
            self._del_worker.wait(3000)
        if self._lic_worker is not None:
            self._lic_worker.wait(3000)  # sinon Qt rale : thread detruit en marche
        if self.svg_path:
            self.svg_path.unlink(missing_ok=True)
        if self._cur_out:
            self._cur_out.unlink(missing_ok=True)
        if self._autotune_out:
            self._autotune_out.unlink(missing_ok=True)
        self._cleanup_crop_tmp()
        if self._paste_tmp:
            self._paste_tmp.unlink(missing_ok=True)
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
                        "stats_weight",
                        src=f"{src_kb:.0f}",
                        out=f"{size_kb:.1f}",
                        pct=f"{pct:+.0f}%",
                    )
            if self._last_warn:
                msg += self._t("stats_warn", msg=self._last_warn[:50])
                self._last_warn = None
            self.statusBar().showMessage(msg)
        except OSError:
            pass

    def copy_svg(self):
        """Copie le code SVG (optimisé) dans le presse-papiers.

        Compte dans le quota du jour au meme titre qu'un export : sans ca, la
        limite du mode gratuit se contournerait par un simple Ctrl+C.
        """
        if not self.svg_path:
            return
        if not self._can_export_now():
            return
        if not self._pro_features_gate(self.copy_svg):
            return
        try:
            txt = self._svg_text_for_export()
        except OSError:
            return
        QApplication.clipboard().setText(txt)
        self._record_export()
        analytics.capture("copy_clipboard")
        self.statusBar().showMessage(self._t("status_svg_copied"), 3000)
        # Apres le message de copie, sinon il ecrase aussitot le bandeau.
        self._maybe_last_free_export_banner()

    # --- theme ---
    def toggle_theme(self, dark: bool):
        self.apply_theme(dark)

    def apply_theme(self, dark: bool):
        """Applique le theme clair/sombre (QSS globale + damier de transparence)."""
        self._dark = dark
        QApplication.instance().setStyleSheet(build_qss(dark))
        self.preview.setBackgroundBrush(checker_brush(dark))
        self.settings_scroll.set_fade_color(window_bg(dark))
        self.btn_theme.setIcon(icon(ICON_SUN if dark else ICON_MOON))
        if self.btn_theme.isChecked() != dark:
            self.btn_theme.blockSignals(True)
            self.btn_theme.setChecked(dark)
            self.btn_theme.blockSignals(False)

    # --- langue ---
    def toggle_lang(self):
        self.lang = "en" if self.lang == "fr" else "fr"
        analytics.set_context(lang=self.lang)
        self.retranslate_ui()

    def _update_lang_button(self):
        # Le bouton affiche la langue VERS laquelle on bascule (convention InOneShot).
        self.btn_lang.setText("EN" if self.lang == "fr" else "FR")

    def retranslate_ui(self):
        """Reapplique tous les textes dans la langue courante (bascule FR/EN)."""
        for fn in self._retranslators:
            fn()
        self._repopulate_preset_combo()
        self._repopulate_examples_menu()
        self._update_lang_button()
        if self._rembg_missing:
            self.chk_bg_ai.setToolTip(self._t("chk_bg_ai_download_tooltip"))
        if self._cur_display_name:
            self.setWindowTitle(f"{self._t('app_name')} — {self._cur_display_name}")
        else:
            self.setWindowTitle(self._t("app_name"))

    # --- licence / mode gratuit ---

    def refresh_pro_ui(self):
        """Realigne l'UI sur l'etat courant de la licence (appelee au demarrage,
        apres activation/desactivation, et au retour de la revalidation en ligne)."""
        pro = self.lic.is_pro()
        # Etoile : la pastille doit se distinguer des autres boutons (tous en
        # degrade dans ce theme), comme la pastille d'Android.
        self.btn_pro.setText(
            self._t("btn_pro_active") if pro else "★ " + self._t("btn_pro").strip()
        )
        # Gratuit : pastille « Passer Pro » (appel a l'action) ; Pro : bouton
        # neutre de gestion de licence, plus rien a vendre.
        self.btn_pro.setObjectName("dlgSecondary" if pro else "btnProCta")
        self.btn_pro.style().unpolish(self.btn_pro)
        self.btn_pro.style().polish(self.btn_pro)
        self.btn_pro.setToolTip(
            self._t("btn_pro_active_tooltip")
            if pro
            else self._t("btn_pro_tooltip", price=PRO_PRICE_EUR)
        )
        self._update_plan_label()
        # Grace offline bientot epuisee : prevenir plutot que couper sans preavis.
        days = self.lic.grace_days_left()
        if pro and 0 < days <= 3:
            self.statusBar().showMessage(self._t("lic_grace_warning", n=days), 10000)

    def _update_plan_label(self):
        if self.lic.is_pro():
            self.lbl_plan.setText(self._t("status_pro"))
            return
        left = self.usage.remaining()
        if self.usage.is_trial:
            self.lbl_plan.setText(
                self._t("status_free_trial", n=left, max=self.usage.max_quota)
                if left
                else self._t("status_free_trial_none")
            )
            return
        self.lbl_plan.setText(
            self._t("status_free", n=left) if left else self._t("status_free_none")
        )

    def open_license(self):
        if not self.lic.is_pro():
            LicenseDialog(self).exec()
            return
        box = QMessageBox(self)
        box.setWindowTitle(self._t("lic_active_title"))
        box.setText(self._t("lic_active_as", email=self.lic.email() or "—"))
        deact = box.addButton(
            self._t("lic_deactivate"), QMessageBox.ButtonRole.DestructiveRole
        )
        box.addButton(self._t("lic_close"), QMessageBox.ButtonRole.RejectRole)
        box.exec()
        if box.clickedButton() is not deact:
            return
        confirm = QMessageBox.question(
            self, self._t("lic_active_title"), self._t("lic_deactivate_confirm")
        )
        if confirm == QMessageBox.StandardButton.Yes:
            self.lic.deactivate()
            self.refresh_pro_ui()
            QMessageBox.information(
                self, self._t("lic_active_title"), self._t("lic_deactivated")
            )

    def _show_upsell(
        self, title: str, body: str, category: str = "other", highlight=None
    ):
        """Ouvre le ProDialog et gère le suivi (« J'ai une clé »). Les autres
        codes (Acheter, Plus tard) sont déjà entièrement gérés par le dialogue."""
        dlg = ProDialog(
            self, title, body, category=category, secondary="have", highlight=highlight
        )
        if dlg.exec() == ProDialog.HaveKey:
            self.open_license()

    def _require_pro(self, feature: str) -> bool:
        """True si Pro. Sinon affiche l'upsell nomme et retourne False."""
        if self.lic.is_pro():
            return True
        self._show_upsell(
            self._t("upsell_title"),
            self._t(
                "upsell_body",
                feat=self._t(f"feat_{feature}"),
                n=FREE_DAILY_MAX,
                price=PRO_PRICE_EUR,
            ),
            category=feature,
            highlight={feature},
        )
        return False

    def _can_export_now(self) -> bool:
        """Quota gratuit (essai au total, ou par jour pour les anciens
        utilisateurs). Les images d'exemple sont hors quota."""
        if self.lic.is_pro() or self._is_demo or self.usage.can_export():
            return True
        analytics.capture(
            "quota_reached",
            {"total_exports": self.usage.total_exports(), "plan": self.usage.plan},
        )
        if self.usage.is_trial:
            title, body = "upsell_trial_title", "upsell_trial_body"
        else:
            title, body = "upsell_quota_title", "upsell_quota_body"
        self._show_upsell(
            self._t(title),
            self._t(body, n=self.usage.max_quota, price=PRO_PRICE_EUR),
            category="quota",
        )
        return False

    def _record_export(self):
        """Decompte un export du quota (gratuit) et incremente le compteur
        cumule total (Free + Pro), utilise comme preuve de valeur."""
        if not self.lic.is_pro() and not self._is_demo:
            self.usage.record_export()
            self._update_plan_label()
        else:
            self.usage.record_total_only()

    def _guard_bg_ai(self, on: bool):
        if not on:
            return
        self._track_pro_tried(FEAT_BG_AI)
        if self._rembg_missing:
            self.chk_bg_ai.setChecked(
                False
            )  # decoche : attend le succes du telechargement
            self._start_ai_download()

    def _start_ai_download(self):
        if self._ai_worker is not None:
            return  # deja en cours
        confirm = QMessageBox.question(
            self, self._t("ai_dl_confirm_title"), self._t("ai_dl_confirm_body")
        )
        if confirm != QMessageBox.StandardButton.Yes:
            return
        self._ai_progress = QProgressDialog(
            self._t("ai_dl_progress_label_indeterminate"),
            self._t("ai_dl_cancel"),
            0,
            0,
            self,
        )
        self._ai_progress.setWindowTitle(self._t("ai_dl_progress_title"))
        self._ai_progress.setWindowModality(Qt.WindowModal)
        self._ai_progress.setMinimumDuration(0)
        self._ai_worker = AIDownloadWorker()
        self._ai_worker.progress.connect(self._on_ai_download_progress)
        self._ai_worker.done.connect(self._on_ai_download_done)
        self._ai_worker.failed.connect(self._on_ai_download_failed)
        self._ai_progress.canceled.connect(self._ai_worker.cancel)
        self._ai_progress.show()
        self._ai_worker.start()

    def _on_ai_download_progress(self, done: int, total: int):
        if self._ai_progress is None:
            return
        if total > 0:
            self._ai_progress.setRange(0, total)
            self._ai_progress.setValue(done)
            self._ai_progress.setLabelText(
                self._t("ai_dl_progress_label", pct=int(done * 100 / total))
            )
        else:
            self._ai_progress.setLabelText(
                self._t("ai_dl_progress_label_indeterminate")
            )

    def _on_ai_download_done(self):
        self._finish_ai_download()
        self._rembg_missing = False
        self.chk_bg_ai.setToolTip(self._t("chk_bg_ai_tooltip"))
        if self._pending_upscale:
            # Le module etait telecharge pour la finition IA : enchaine sur
            # les poids sans recocher le detourage.
            self._pending_upscale = False
            self._start_weights_download()
        else:
            self.chk_bg_ai.setChecked(
                True
            )  # redeclenche _guard_bg_ai, sans effet (plus manquant)
        self.statusBar().showMessage(self._t("ai_dl_done"), 5000)

    def _on_ai_download_failed(self, msg: str):
        self._finish_ai_download()
        if msg == "cancelled":
            self.statusBar().showMessage(self._t("ai_dl_cancelled"), 4000)
            return
        QMessageBox.warning(
            self,
            self._t("ai_dl_failed_title"),
            self._t("ai_dl_failed_body", msg=msg[:200]),
        )

    def _finish_ai_download(self):
        if self._ai_progress is not None:
            self._ai_progress.close()
            self._ai_progress = None
        if self._ai_worker is not None:
            self._ai_worker.deleteLater()
            self._ai_worker = None

    # --- finition IA (upscale x4 avant trace) ---
    def _guard_upscale(self, on: bool):
        if not on:
            return
        self._track_pro_tried(FEAT_AI_UPSCALE)
        if ai_upscale.is_available():
            return
        self.chk_upscale.setChecked(
            False
        )  # decoche : attend le succes des telechargements
        if self._rembg_missing:
            # onnxruntime vit dans le module IA : on le telecharge d'abord,
            # puis _on_ai_download_done enchaine sur les poids.
            self._pending_upscale = True
            self._start_ai_download()
        else:
            self._start_weights_download()

    def _start_weights_download(self):
        if self._up_worker is not None:
            return  # deja en cours
        confirm = QMessageBox.question(
            self, self._t("up_dl_confirm_title"), self._t("up_dl_confirm_body")
        )
        if confirm != QMessageBox.StandardButton.Yes:
            return
        self._up_progress = QProgressDialog(
            self._t("ai_dl_progress_label_indeterminate"),
            self._t("ai_dl_cancel"),
            0,
            0,
            self,
        )
        self._up_progress.setWindowTitle(self._t("up_dl_progress_title"))
        self._up_progress.setWindowModality(Qt.WindowModal)
        self._up_progress.setMinimumDuration(0)
        self._up_worker = WeightsDownloadWorker()
        self._up_worker.progress.connect(self._on_weights_progress)
        self._up_worker.done.connect(self._on_weights_done)
        self._up_worker.failed.connect(self._on_weights_failed)
        self._up_progress.canceled.connect(self._up_worker.cancel)
        self._up_progress.show()
        self._up_worker.start()

    def _on_weights_progress(self, done: int, total: int):
        if self._up_progress is None:
            return
        if total > 0:
            self._up_progress.setRange(0, total)
            self._up_progress.setValue(done)
            self._up_progress.setLabelText(
                self._t("ai_dl_progress_label", pct=int(done * 100 / total))
            )

    def _on_weights_done(self):
        self._finish_weights_download()
        self.chk_upscale.setChecked(
            True
        )  # redeclenche _guard_upscale, sans effet (dispo)
        self.statusBar().showMessage(self._t("up_dl_done"), 5000)

    def _on_weights_failed(self, msg: str):
        self._finish_weights_download()
        if msg == "cancelled":
            self.statusBar().showMessage(self._t("ai_dl_cancelled"), 4000)
            return
        QMessageBox.warning(
            self,
            self._t("ai_dl_failed_title"),
            self._t("ai_dl_failed_body", msg=msg[:200]),
        )

    def _finish_weights_download(self):
        if self._up_progress is not None:
            self._up_progress.close()
            self._up_progress = None
        if self._up_worker is not None:
            self._up_worker.deleteLater()
            self._up_worker = None

    def _ask_png_size(self) -> int | None:
        """Demande la resolution PNG (cote long) : presets + valeur libre.
        Renvoie None si annule."""
        dlg = SizeDialog(
            self,
            self._t("png_size_title"),
            self._t("png_size_label"),
            self._last_png_size,
            recommended_tip=self._t("png_size_recommended"),
        )
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
            self,
            self._t("svg_size_title"),
            self._t("svg_size_label"),
            self._last_svg_size,
            offer_original=True,
            recommended_tip=self._t("png_size_recommended"),
        )
        if dlg.exec() != QDialog.DialogCode.Accepted:
            return None
        size = dlg.value()
        self._last_svg_size = size
        return size

    def export_any(self):
        if not self.svg_path:
            return
        if not self._pro_features_gate(self.export_any):
            return
        stem = self.src_path.stem if self.src_path else "logo"
        start = os.path.join(self._last_dir, stem) if self._last_dir else stem
        f, flt = QFileDialog.getSaveFileName(
            self, self._t("export_dialog_title"), start, self._t("export_filter")
        )
        if not f:
            return
        out = Path(f)
        # Le format choisi determine le verrou : PNG et PDF sont Pro, le SVG
        # passe par le quota du jour. Verifie AVANT tout travail d'export.
        is_png = "png" in flt or out.suffix.lower() == ".png"
        is_pdf = "pdf" in flt or out.suffix.lower() == ".pdf"
        if is_png and not self._require_pro(FEAT_EXPORT_PNG):
            return
        if is_pdf and not self._require_pro(FEAT_EXPORT_PDF):
            return
        if not (is_png or is_pdf) and not self._can_export_now():
            return
        try:
            bg = self._export_background()
            if is_png:
                out = out.with_suffix(".png")
                size = self._ask_png_size()
                if size is None:
                    return
                svg_to_png(self.svg_path, out, max_px=size, background=bg)
            elif is_pdf:
                out = out.with_suffix(".pdf")
                svg_to_pdf(self.svg_path, out, background=bg)
            else:
                out = out.with_suffix(".svg")
                target = self._ask_svg_size()
                if target is None:
                    return
                txt = self._svg_text_for_export()
                if target:
                    txt = resize_svg(txt, target)
                out.write_text(txt, encoding="utf-8")
            self._last_dir = str(out.parent)
            self._last_export = out
            self.btn_open_dir.setEnabled(True)
            self._record_export()
            bg_prop = {"background": "white" if bg else "transparent"}
            if is_png:
                analytics.capture("export_png", {"resolution_px": size, **bg_prop})
            elif is_pdf:
                analytics.capture("export_pdf", bg_prop)
            else:
                analytics.capture(
                    "export_svg", {"target_px": target or None, **bg_prop}
                )
        except Exception as e:  # noqa: BLE001
            analytics.capture("export_failed", {"error": str(e)[:200]})
            QMessageBox.critical(
                self, self._t("title_error"), self._t("err_export_failed", e=e)
            )
            return
        self._handle_post_export_file(out)

    def _handle_post_export_file(self, out: Path):
        """Moments du funnel apres un export FICHIER reussi (§1.5), un seul par
        export, par priorite : celebration du 1er export > demande d'avis >
        bandeau du dernier export gratuit. Jamais en Pro ni sur une image
        d'exemple (le 1er export « compte » quand c'est la vraie image de
        l'utilisateur, pas la demo -- d'ou un drapeau dedie, pas total == 1)."""
        if self.lic.is_pro() or self._is_demo:
            return
        if not self.usage.has_celebrated_first_export():
            self.usage.mark_celebrated()
            analytics.capture("first_export_celebrated")
            ExportCelebrationDialog(self, out).exec()
            return
        if self.usage.should_ask_review():
            analytics.capture("review_requested")
            ReviewPromptDialog(self).exec()
            return
        self._maybe_last_free_export_banner()

    def _maybe_last_free_export_banner(self):
        """Bandeau non bloquant (barre d'etat) quand le quota vient de tomber a 0.
        Le bouton « Passer Pro » reste en permanence dans la barre d'outils."""
        if self.lic.is_pro() or self._is_demo or self.usage.remaining() != 0:
            return
        analytics.capture("last_free_export_banner_shown", {"plan": self.usage.plan})
        self.statusBar().showMessage(
            self._t("last_free_export_banner", n=self.usage.max_quota), 10000
        )

    # --- traitement par lot ---
    def run_batch(self, paths=None, source: str = "button"):
        """Ouvre l'ecran de traitement par lot (Pro), eventuellement pre-rempli
        par un depot de fichiers/dossiers sur la fenetre."""
        if self._batch is not None:
            return  # un lot tourne deja
        if not self._require_pro(FEAT_BATCH):
            return
        BatchDialog(self, paths, source=source).exec()

    def drop_many(self, paths):
        """Plusieurs fichiers, ou un dossier, deposes sur la zone d'image. En Pro :
        traitement par lot pre-rempli. En gratuit : ecran Pro (lot) ; si
        l'utilisateur n'est toujours pas Pro ensuite, la 1re image est chargee
        quand meme (le depot n'est jamais perdu)."""
        paths = [Path(p) for p in paths]
        if self.lic.is_pro():
            self.run_batch(paths, source="drop")
            return
        self._require_pro(FEAT_BATCH)
        if self.lic.is_pro():  # cle activee depuis l'ecran Pro
            self.run_batch(paths, source="drop")
            return
        files = collect_images(paths)
        if files:
            self.load_image(files[0])

    def _export_background(self) -> str | None:
        return "#FFFFFF" if self.chk_white_bg.isChecked() else None

    def _svg_text_for_export(self) -> str:
        txt = self.svg_path.read_text(encoding="utf-8")
        bg = self._export_background()
        return add_svg_background(txt, bg) if bg else txt

    def open_export_dir(self):
        if self._last_export is None:
            return
        analytics.capture("open_export_dir_clicked")
        QDesktopServices.openUrl(QUrl.fromLocalFile(str(self._last_export.parent)))

    # --- reglages persistants (QSettings) ---
    def _slider_map(self):
        return {
            "s_speckle": self.s_speckle,
            "s_colors": self.s_colors,
            "s_corner": self.s_corner,
            "s_tol": self.s_tol,
            "s_merge": self.s_merge,
            "s_contrast": self.s_contrast,
            "s_sharpen": self.s_sharpen,
        }

    def _chk_map(self):
        return {
            "chk_bg": self.chk_bg,
            "chk_bg_ai": self.chk_bg_ai,
            "chk_upscale": self.chk_upscale,
            "chk_merge": self.chk_merge,
            "chk_edges": self.chk_edges,
            "chk_grad": self.chk_grad,
            "chk_refine": self.chk_refine,
            "chk_white_bg": self.chk_white_bg,
        }

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
