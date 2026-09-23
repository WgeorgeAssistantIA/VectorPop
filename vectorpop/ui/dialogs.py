import webbrowser
from pathlib import Path

from PySide6.QtCore import Qt, QUrl
from PySide6.QtGui import QDesktopServices, QFontMetrics
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
    PLAY_STORE_URL,
    buy_url,
    review_url,
)
from ..core.recipes import RECIPES, TIPS


def open_android_listing(source: str):
    """Pont desktop -> Android (§2.4) : Android renvoie deja vers le PC."""
    analytics.capture("android_link_opened", {"source": source})
    webbrowser.open(PLAY_STORE_URL)


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

        # Confidentialite : ce qui part (ou pas) de l'ordinateur, et le choix.
        pb = QGroupBox(t("privacy_title"))
        pl = QVBoxLayout(pb)
        privacy = QLabel(t("privacy_body"))
        privacy.setWordWrap(True)
        pl.addWidget(privacy)
        self.chk_analytics = QCheckBox(t("chk_analytics"))
        self.chk_analytics.setChecked(analytics.user_enabled())
        self.chk_analytics.toggled.connect(win.set_analytics_enabled)
        pl.addWidget(self.chk_analytics)
        vb.addWidget(pb)
        vb.addStretch(1)

        scroll.setWidget(content)
        outer.addWidget(scroll, 1)
        bottom = QHBoxLayout()
        self.btn_android = QPushButton(t("android_link"))
        self.btn_android.setObjectName("dlgLink")
        self.btn_android.setToolTip(t("android_link_tooltip"))
        self.btn_android.clicked.connect(lambda: open_android_listing("help"))
        bottom.addWidget(self.btn_android)
        bottom.addStretch(1)
        buttons = QDialogButtonBox(QDialogButtonBox.Close)
        buttons.rejected.connect(self.reject)
        bottom.addWidget(buttons)
        outer.addLayout(bottom)


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
        self.btn_android = QPushButton(win._t("android_link"))
        self.btn_android.setObjectName("dlgLink")
        self.btn_android.setToolTip(win._t("android_link_tooltip"))
        self.btn_android.clicked.connect(
            lambda: open_android_listing(f"pro_dialog_{self._category}")
        )
        lay.addWidget(self.btn_android, alignment=Qt.AlignmentFlag.AlignLeft)

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


class ExportCelebrationDialog(QDialog):
    """1er export reussi (gratuit, image reelle) : ouvrir/utiliser le resultat
    AVANT toute sollicitation Pro (meme hierarchie que l'ExportDoneDialog de
    VoxCut PC), puis les 2 atouts, puis un lien discret vers Pro."""

    def __init__(self, win: "MainWindow", out_path: Path):
        super().__init__(win)
        self._win = win
        self._out = Path(out_path)
        self.setWindowTitle(win._t("celebration_title"))
        self.setMinimumWidth(440)

        lay = QVBoxLayout(self)
        lay.setSpacing(12)
        title = QLabel(win._t("celebration_title"))
        title.setStyleSheet("font-size: 16px; font-weight: 700;")
        title.setWordWrap(True)
        lay.addWidget(title)
        name = QLabel(self._out.name)
        name.setStyleSheet("color: palette(mid); font-size: 11px;")
        lay.addWidget(name)
        subtitle = QLabel(win._t("celebration_subtitle"))
        subtitle.setWordWrap(True)
        lay.addWidget(subtitle)

        actions = QHBoxLayout()
        self.btn_open_file = QPushButton(win._t("celebration_open_file"))
        self.btn_open_file.setDefault(True)
        self.btn_open_file.clicked.connect(self._open_file)
        self.btn_open_folder = QPushButton(win._t("celebration_open_folder"))
        self.btn_open_folder.setObjectName("dlgSecondary")
        self.btn_open_folder.clicked.connect(self._open_folder)
        actions.addWidget(self.btn_open_file)
        actions.addWidget(self.btn_open_folder)
        lay.addLayout(actions)

        for title_key, desc_key in (
            ("celebration_pillar_local", "celebration_pillar_local_desc"),
            ("celebration_pillar_vector", "celebration_pillar_vector_desc"),
        ):
            row = QLabel(f"<b>{win._t(title_key)}</b> — {win._t(desc_key)}")
            row.setWordWrap(True)
            lay.addWidget(row)

        bottom = QHBoxLayout()
        self.btn_pro = QPushButton(win._t("celebration_discover_pro"))
        self.btn_pro.setObjectName("dlgLink")
        self.btn_pro.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_pro.clicked.connect(self._discover_pro)
        bottom.addWidget(self.btn_pro)
        bottom.addStretch(1)
        close_btn = QPushButton(win._t("pro_dialog_close"))
        close_btn.setObjectName("dlgSecondary")
        close_btn.clicked.connect(self.accept)
        bottom.addWidget(close_btn)
        lay.addLayout(bottom)

    def _open_file(self):
        self._win.usage.mark_opened_result()
        analytics.capture("celebration_open_file_clicked")
        QDesktopServices.openUrl(QUrl.fromLocalFile(str(self._out)))

    def _open_folder(self):
        self._win.usage.mark_opened_result()
        analytics.capture("celebration_open_folder_clicked")
        QDesktopServices.openUrl(QUrl.fromLocalFile(str(self._out.parent)))

    def _discover_pro(self):
        analytics.capture("celebration_pro_clicked")
        self.accept()
        self._win._show_upsell(
            self._win._t("upsell_title"),
            self._win._t("celebration_pro_body", price=PRO_PRICE_EUR),
            category="celebration",
        )


class ReviewPromptDialog(QDialog):
    """Demande d'avis (§1.5) : seulement apres un usage reel (fichier ouvert +
    >= 3 exports). 👍 -> ecran de notation du Store (site hors Windows),
    👎 -> mail de retour. « Plus tard » ne marque rien : redemande plus tard."""

    def __init__(self, win: "MainWindow"):
        super().__init__(win)
        self._win = win
        self.setWindowTitle(win._t("review_title"))
        self.setMinimumWidth(380)

        lay = QVBoxLayout(self)
        lay.setSpacing(12)
        title = QLabel(win._t("review_title"))
        title.setStyleSheet("font-size: 15px; font-weight: 700;")
        lay.addWidget(title)
        subtitle = QLabel(win._t("review_subtitle"))
        subtitle.setWordWrap(True)
        lay.addWidget(subtitle)

        row = QHBoxLayout()
        self.btn_positive = QPushButton(win._t("review_positive"))
        self.btn_positive.clicked.connect(self._positive)
        self.btn_negative = QPushButton(win._t("review_negative"))
        self.btn_negative.setObjectName("dlgSecondary")
        self.btn_negative.clicked.connect(self._negative)
        row.addWidget(self.btn_positive)
        row.addWidget(self.btn_negative)
        lay.addLayout(row)

        later = QPushButton(win._t("review_later"))
        later.setObjectName("dlgLink")
        later.clicked.connect(self.reject)
        lay.addWidget(later, alignment=Qt.AlignmentFlag.AlignCenter)

    def _positive(self):
        analytics.capture("review_positive_clicked")
        self._win.usage.mark_review_asked()
        QDesktopServices.openUrl(QUrl(review_url()))
        self._win.statusBar().showMessage(self._win._t("review_thanks_positive"), 5000)
        self.accept()

    def _negative(self):
        analytics.capture("review_negative_clicked")
        self._win.usage.mark_review_asked()
        url = QUrl("mailto:george.william@hotmail.fr")
        subject = self._win._t("review_negative_subject")
        body = self._win._t("review_negative_body")
        url.setQuery(
            f"subject={QUrl.toPercentEncoding(subject).data().decode()}"
            f"&body={QUrl.toPercentEncoding(body).data().decode()}"
        )
        QDesktopServices.openUrl(url)
        self._win.statusBar().showMessage(self._win._t("review_thanks_negative"), 5000)
        self.accept()
