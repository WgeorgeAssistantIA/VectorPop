"""Onboarding au premier lancement (cahier des charges V2 §1.4).

4 écrans modaux (comme VectorPop Android, cf. onboarding_screen.dart) :
promesse, bitmap vs vectoriel, choix d'usage (ouvre le modèle démo assorti),
100% local + quota gratuit. Versionné via vectorpop.onboarding (revu si
`ONBOARDING_VERSION` est incrémentée). Bouton « Passer » gardé (suivi par
étape) : sur VoxCut Android, la plupart des sorties à l'étape 1 étaient des
passages volontaires, pas des abandons.
"""

from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtGui import QPainter, QPixmap
from PySide6.QtSvg import QSvgRenderer
from PySide6.QtWidgets import (
    QButtonGroup,
    QDialog,
    QFrame,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QSizePolicy,
    QStackedWidget,
    QVBoxLayout,
    QWidget,
)

from .. import analytics, onboarding
from ..app_utils import sample_asset
from ..core.demo_models import ONBOARDING_PROFILES
from ..license import FREE_TRIAL_MAX


class OnboardingDialog(QDialog):
    _STEP_NAMES = ("welcome", "how_it_works", "profile", "privacy_quota")

    def __init__(self, win: "MainWindow"):
        super().__init__(win)
        self._win = win
        self._t = win._t
        self._current = 0
        self._profile = "logo"
        self._dots: list[QLabel] = []

        self.setWindowTitle(self._t("onboarding_app_name"))
        self.setModal(True)
        self.setMinimumSize(520, 600)

        analytics.capture("onboarding_started")
        analytics.capture(
            "onboarding_step_viewed",
            {"step_index": 0, "step_title": self._STEP_NAMES[0]},
        )

        outer = QVBoxLayout(self)
        outer.setSpacing(14)

        header = QHBoxLayout()
        app_lbl = QLabel(self._t("onboarding_app_name"))
        app_lbl.setStyleSheet("font-size: 15px; font-weight: 800;")
        header.addWidget(app_lbl)
        header.addStretch(1)
        self._skip_btn = QPushButton(self._t("onboarding_skip"))
        self._skip_btn.setObjectName("dlgLink")
        self._skip_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self._skip_btn.clicked.connect(self._skip)
        header.addWidget(self._skip_btn)
        outer.addLayout(header)

        self._stack = QStackedWidget()
        self._stack.addWidget(self._build_welcome_page())
        self._stack.addWidget(self._build_how_page())
        self._stack.addWidget(self._build_profile_page())
        self._stack.addWidget(self._build_privacy_quota_page())
        outer.addWidget(self._stack, 1)

        dots_row = QHBoxLayout()
        dots_row.addStretch(1)
        for _ in self._STEP_NAMES:
            dot = QLabel()
            dot.setObjectName("obDot")
            dot.setFixedHeight(7)
            dot.setFixedWidth(7)
            dots_row.addWidget(dot)
            self._dots.append(dot)
        dots_row.addStretch(1)
        outer.addLayout(dots_row)

        self._next_btn = QPushButton()
        self._next_btn.setDefault(True)
        self._next_btn.clicked.connect(self._next)
        outer.addWidget(self._next_btn)

        self._update_nav()

    # --- navigation ---

    @staticmethod
    def _redraw(widget):
        widget.style().unpolish(widget)
        widget.style().polish(widget)

    def _update_nav(self):
        last = self._current == len(self._STEP_NAMES) - 1
        self._skip_btn.setVisible(not last)
        self._next_btn.setText(
            self._t("onboarding_get_started" if last else "onboarding_next")
        )
        for i, dot in enumerate(self._dots):
            dot.setFixedWidth(26 if i == self._current else 7)
            dot.setProperty("active", "true" if i == self._current else "false")
            self._redraw(dot)

    def _next(self):
        if self._current < len(self._STEP_NAMES) - 1:
            self._current += 1
            self._stack.setCurrentIndex(self._current)
            analytics.capture(
                "onboarding_step_viewed",
                {
                    "step_index": self._current,
                    "step_title": self._STEP_NAMES[self._current],
                },
            )
            self._update_nav()
        else:
            self._complete()

    def _skip(self):
        analytics.capture("onboarding_skipped", {"at_step": self._current})
        self._complete()

    def _complete(self):
        analytics.capture(
            "onboarding_completed", {"lang": self._win.lang, "usecase": self._profile}
        )
        onboarding.mark_seen()
        self._win.load_demo_model(self._profile)
        self.accept()

    def _select_profile(self, profile_id: str):
        self._profile = profile_id
        analytics.capture("onboarding_usecase_selected", {"usecase_id": profile_id})

    # --- écran 1 : promesse ---

    def _build_welcome_page(self) -> QWidget:
        page = QWidget()
        lay = QVBoxLayout(page)
        lay.addStretch(1)
        icon_lbl = QLabel()
        icon_lbl.setPixmap(self._win.windowIcon().pixmap(64, 64))
        icon_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lay.addWidget(icon_lbl)
        title = QLabel(self._t("onboarding_welcome_title"))
        title.setWordWrap(True)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet("font-size: 20px; font-weight: 800;")
        lay.addWidget(title)
        desc = QLabel(self._t("onboarding_welcome_desc"))
        desc.setWordWrap(True)
        desc.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lay.addWidget(desc)
        badges = QHBoxLayout()
        badges.addStretch(1)
        for key in (
            "onboarding_badge_svg",
            "onboarding_badge_zoom",
            "onboarding_badge_ai",
        ):
            b = QLabel(self._t(key))
            b.setObjectName("obBadge")
            badges.addWidget(b)
        badges.addStretch(1)
        lay.addLayout(badges)
        lay.addStretch(2)
        return page

    # --- écran 2 : bitmap vs vectoriel ---

    def _compare_tile(
        self, pixmap: QPixmap, kind: str, format_label: str, desc_key: str
    ) -> QFrame:
        frame = QFrame()
        frame.setObjectName("obCompareFrame")
        frame.setProperty("kind", kind)
        fl = QVBoxLayout(frame)
        img = QLabel()
        img.setPixmap(pixmap)
        img.setAlignment(Qt.AlignmentFlag.AlignCenter)
        img.setFixedSize(150, 150)
        fl.addWidget(img, alignment=Qt.AlignmentFlag.AlignCenter)
        fmt = QLabel(format_label)
        fmt.setAlignment(Qt.AlignmentFlag.AlignCenter)
        fmt.setStyleSheet("font-weight: 700;")
        fl.addWidget(fmt)
        desc = QLabel(self._t(desc_key))
        desc.setObjectName("obCompareLabel")
        desc.setProperty("kind", kind)
        desc.setWordWrap(True)
        desc.setAlignment(Qt.AlignmentFlag.AlignCenter)
        fl.addWidget(desc)
        return frame

    def _build_how_page(self) -> QWidget:
        page = QWidget()
        lay = QVBoxLayout(page)
        title = QLabel(self._t("onboarding_how_title"))
        title.setWordWrap(True)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet("font-size: 19px; font-weight: 800;")
        lay.addWidget(title)
        desc = QLabel(self._t("onboarding_how_desc"))
        desc.setWordWrap(True)
        desc.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lay.addWidget(desc)
        lay.addSpacing(10)

        # Bitmap : le PNG source, volontairement pixellisé (zoom brut, sans lissage).
        bitmap_pix = QPixmap(sample_asset("sample_logo.png"))
        if not bitmap_pix.isNull():
            small = bitmap_pix.scaled(
                24,
                24,
                Qt.AspectRatioMode.KeepAspectRatio,
                Qt.TransformationMode.FastTransformation,
            )
            bitmap_pix = small.scaled(
                150,
                150,
                Qt.AspectRatioMode.KeepAspectRatio,
                Qt.TransformationMode.FastTransformation,
            )
        # Vectoriel : le vrai SVG tracé par vtracer (assets/samples/sample_logo.svg),
        # rendu en QPixmap -- pas une approximation, le resultat reel.
        vec_pix = QPixmap(150, 150)
        vec_pix.fill(Qt.GlobalColor.transparent)
        renderer = QSvgRenderer(sample_asset("sample_logo.svg"))
        if renderer.isValid():
            painter = QPainter(vec_pix)
            renderer.render(painter)
            painter.end()

        row = QHBoxLayout()
        row.addWidget(
            self._compare_tile(
                bitmap_pix, "bitmap", "PNG / JPEG", "onboarding_bitmap_label"
            )
        )
        row.addWidget(
            self._compare_tile(vec_pix, "vector", "SVG", "onboarding_vector_label")
        )
        lay.addLayout(row)
        lay.addStretch(1)
        return page

    # --- écran 3 : usage principal ---

    def _build_profile_page(self) -> QWidget:
        page = QWidget()
        lay = QVBoxLayout(page)
        title = QLabel(self._t("onboarding_profile_title"))
        title.setWordWrap(True)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet("font-size: 19px; font-weight: 800;")
        lay.addWidget(title)
        desc = QLabel(self._t("onboarding_profile_desc"))
        desc.setWordWrap(True)
        desc.setAlignment(Qt.AlignmentFlag.AlignCenter)
        lay.addWidget(desc)
        lay.addSpacing(10)

        self._profile_group = QButtonGroup(page)
        self._profile_group.setExclusive(True)
        for profile_id, title_key, desc_key in ONBOARDING_PROFILES:
            card = QPushButton()
            card.setObjectName("obProfileCard")
            card.setCheckable(True)
            card.setText(f"{self._t(title_key)}\n{self._t(desc_key)}")
            card.setCursor(Qt.CursorShape.PointingHandCursor)
            card.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
            card.setChecked(profile_id == self._profile)
            card.clicked.connect(
                lambda _=False, pid=profile_id: self._select_profile(pid)
            )
            self._profile_group.addButton(card)
            lay.addWidget(card)
        lay.addStretch(1)
        return page

    # --- écran 4 : local + quota ---

    def _build_privacy_quota_page(self) -> QWidget:
        page = QWidget()
        lay = QVBoxLayout(page)
        lay.addStretch(1)
        for title_key, desc_key, fmt in (
            ("onboarding_privacy_title", "onboarding_privacy_desc", None),
            ("onboarding_quota_title", "onboarding_quota_desc", FREE_TRIAL_MAX),
        ):
            title = QLabel(
                self._t(title_key, n=fmt) if fmt is not None else self._t(title_key)
            )
            title.setWordWrap(True)
            title.setAlignment(Qt.AlignmentFlag.AlignCenter)
            title.setStyleSheet("font-size: 17px; font-weight: 800;")
            lay.addWidget(title)
            desc = QLabel(self._t(desc_key))
            desc.setWordWrap(True)
            desc.setAlignment(Qt.AlignmentFlag.AlignCenter)
            lay.addWidget(desc)
            lay.addSpacing(18)
        lay.addStretch(2)
        return page
