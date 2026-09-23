import webbrowser
from PySide6.QtCore import Qt
from PySide6.QtGui import QFontMetrics
from PySide6.QtWidgets import (
    QDialog,
    QVBoxLayout,
    QLabel,
    QScrollArea,
    QWidget,
    QGroupBox,
    QPushButton,
    QDialogButtonBox,
    QSpinBox,
    QCheckBox,
    QHBoxLayout,
    QLineEdit,
    QMessageBox,
)

from .. import analytics
from ..analytics import track_event
from ..license import (
    FEAT_AI_UPSCALE,
    FEAT_AUTOTUNE,
    FEAT_BATCH,
    FEAT_BG_AI,
    FEAT_DELETE_SHAPE,
    FEAT_EXPORT_PDF,
    FEAT_EXPORT_PNG,
    PRO_PRICE_EUR,
    buy_url,
)
from ..core.recipes import RECIPES, TIPS


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
            btn.clicked.connect(
                lambda _=False, c=cfg: (win.apply_recipe(c), self.accept())
            )
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


class SizeDialog(QDialog):
    """Choix d'une taille (px) : presets rapides (icônes classiques -> haute
    def) + valeur libre, pour l'export PNG/SVG.

    `value()` renvoie la taille choisie, ou 0 si "Taille d'origine" est cochée
    (uniquement proposé quand `offer_original=True`, cas du SVG).
    """

    PRESETS = (16, 32, 48, 64, 128, 256, 512, 1024, 2048, 4096)
    RECOMMENDED = 2048

    def __init__(
        self,
        parent,
        title: str,
        label: str,
        default: int,
        offer_original: bool = False,
        recommended_tip: str = "",
    ):
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
        widest = max(self.PRESETS, key=lambda p: len(str(p)))
        for p in self.PRESETS:
            btn = QPushButton(str(p))
            metrics = QFontMetrics(btn.font())
            btn.setMinimumWidth(metrics.horizontalAdvance(str(widest)) + 28)
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


class ProDialog(QDialog):
    """Écran Pro unique (remplace les QMessageBox d'upsell) : badge « à vie »,
    preuve de valeur, liste des avantages (les fonctions déjà essayées dans
    l'aperçu sont mises en avant), CTA d'achat, et un second bouton adapté au
    contexte (« J'ai une clé » ou « Exporter sans les fonctions Pro »).

    Retourne un code via exec() : Buy / HaveKey / WithoutPro / Later (rejeté).
    Les actions (tracking, ouverture du navigateur) sont faites ICI, pas par
    l'appelant -- comme l'ancien _show_upsell/_pro_features_gate.
    """

    Later = QDialog.DialogCode.Rejected  # 0
    Buy = 1
    HaveKey = 2
    WithoutPro = 3

    # Liste fixe affichée dans le dialogue : (clé i18n, clé FEAT associée ou None).
    _FEATURES = (
        ("pro_dialog_feat_unlimited", ()),
        ("pro_dialog_feat_hd", (FEAT_EXPORT_PDF, FEAT_EXPORT_PNG)),
        ("pro_dialog_feat_batch", (FEAT_BATCH,)),
        ("pro_dialog_feat_ai", (FEAT_BG_AI, FEAT_AI_UPSCALE)),
        ("pro_dialog_feat_autotune", (FEAT_AUTOTUNE,)),
        ("pro_dialog_feat_delete", (FEAT_DELETE_SHAPE,)),
    )

    def __init__(
        self,
        win: "MainWindow",
        title: str,
        body: str,
        category: str,
        secondary: str | None = "have",  # "have" | "without" | None
        highlight: set | None = None,
    ):
        super().__init__(win)
        self._win = win
        self._category = category
        self._highlight = highlight or set()
        self.setWindowTitle(title)
        self.setMinimumWidth(460)

        track_event("paywall_shown", category)
        analytics.capture(
            "paywall_viewed",
            {
                "source": category,
                "features": sorted(self._highlight) or None,
                "total_exports": win.usage.total_exports(),
            },
        )

        lay = QVBoxLayout(self)
        lay.setSpacing(12)

        header = QHBoxLayout()
        badge = QLabel(win._t("pro_dialog_badge"))
        badge.setObjectName("dlgBadge")
        header.addWidget(badge)
        header.addStretch(1)
        close_btn = QPushButton("✕")
        close_btn.setObjectName("dlgLink")
        close_btn.setFixedWidth(28)
        close_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        close_btn.clicked.connect(self.reject)
        header.addWidget(close_btn)
        lay.addLayout(header)

        total = win.usage.total_exports()
        if total > 0:
            roi = QLabel(win._t("upsell_total", n=total))
            roi.setObjectName("dlgRoiBanner")
            roi.setWordWrap(True)
            lay.addWidget(roi)

        title_lbl = QLabel(title)
        title_lbl.setStyleSheet("font-size: 16px; font-weight: 700;")
        title_lbl.setWordWrap(True)
        lay.addWidget(title_lbl)

        body_lbl = QLabel(body)
        body_lbl.setWordWrap(True)
        lay.addWidget(body_lbl)

        feat_box = QVBoxLayout()
        feat_box.setSpacing(4)
        for key, feats in self._FEATURES:
            used = any(f in self._highlight for f in feats)
            lbl = QLabel(f"✓ {win._t(key)}")
            lbl.setObjectName("dlgFeature")
            lbl.setProperty("used", "true" if used else "false")
            feat_box.addWidget(lbl)
        lay.addLayout(feat_box)

        buy_btn = QPushButton(win._t("upsell_buy", price=PRO_PRICE_EUR))
        buy_btn.setDefault(True)
        buy_btn.clicked.connect(self._on_buy)
        lay.addWidget(buy_btn)

        btns = QHBoxLayout()
        if secondary == "have":
            have_btn = QPushButton(win._t("upsell_have_key"))
            have_btn.setObjectName("dlgSecondary")
            have_btn.clicked.connect(self._on_have_key)
            btns.addWidget(have_btn)
        elif secondary == "without":
            without_btn = QPushButton(win._t("teaser_without"))
            without_btn.setObjectName("dlgSecondary")
            without_btn.clicked.connect(self._on_without_pro)
            btns.addWidget(without_btn)
        btns.addStretch(1)
        later_btn = QPushButton(win._t("upsell_later"))
        later_btn.setObjectName("dlgLink")
        later_btn.clicked.connect(self.reject)
        btns.addWidget(later_btn)
        lay.addLayout(btns)

        reassurance = QLabel(win._t("upsell_reassurance"))
        reassurance.setWordWrap(True)
        reassurance.setStyleSheet("color: palette(mid); font-size: 11px;")
        lay.addWidget(reassurance)

    def _on_buy(self):
        track_event("paywall_buy_click", self._category)
        analytics.capture_sync("pro_buy_clicked", {"source": self._category})
        webbrowser.open(buy_url())
        self.done(self.Buy)

    def _on_have_key(self):
        analytics.capture("paywall_have_key_clicked", {"source": self._category})
        self.done(self.HaveKey)

    def _on_without_pro(self):
        analytics.capture(
            "export_without_pro_chosen", {"features": sorted(self._highlight)}
        )
        self.done(self.WithoutPro)


class LicenseDialog(QDialog):
    """Saisie email + cle de licence, ou gestion de la licence deja active."""

    def __init__(self, win: "MainWindow"):
        super().__init__(win)
        self._win = win
        self.setWindowTitle(win._t("lic_title"))
        self.setMinimumWidth(430)

        lay = QVBoxLayout(self)
        hint = QLabel(win._t("lic_hint"))
        hint.setWordWrap(True)
        lay.addWidget(hint)

        self.ed_email = QLineEdit(win.lic.email())
        self.ed_email.setPlaceholderText(win._t("lic_email"))
        self.ed_key = QLineEdit()
        self.ed_key.setPlaceholderText(win._t("lic_key"))
        for label_key, field in (
            ("lic_email", self.ed_email),
            ("lic_key", self.ed_key),
        ):
            row = QHBoxLayout()
            lbl = QLabel(win._t(label_key))
            lbl.setMinimumWidth(110)
            row.addWidget(lbl)
            row.addWidget(field, 1)
            lay.addLayout(row)

        btns = QHBoxLayout()
        btn_buy = QPushButton(win._t("lic_buy"))
        btn_buy.clicked.connect(lambda: webbrowser.open(buy_url()))
        btn_activate = QPushButton(win._t("lic_activate"))
        btn_activate.clicked.connect(self._activate)
        btn_activate.setDefault(True)
        btns.addWidget(btn_buy)
        btns.addStretch(1)
        btns.addWidget(btn_activate)
        lay.addLayout(btns)

    def _activate(self):
        email = self.ed_email.text().strip()
        key = self.ed_key.text().strip()
        if not email or not key:
            QMessageBox.warning(
                self, self._win._t("lic_title"), self._win._t("lic_empty")
            )
            return
        ok, err = self._win.lic.activate(email, key)
        analytics.capture("license_activated" if ok else "license_activation_failed")
        if ok:
            QMessageBox.information(
                self, self._win._t("lic_ok_title"), self._win._t("lic_ok")
            )
            self._win.refresh_pro_ui()
            self.accept()
            return
        # Messages traduits pour les cas connus ; sinon on remonte le texte brut
        # de Lemon Squeezy, qui est deja explicite ("license key has reached
        # its activation limit", "license key has been disabled"...).
        msg = {
            "invalid": self._win._t("lic_invalid"),
            "nonet": self._win._t("lic_nonet"),
            "timeout": self._win._t("lic_timeout"),
        }.get(err, err)
        QMessageBox.warning(self, self._win._t("lic_title"), msg)
