import webbrowser
from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QLabel, QScrollArea, QWidget, QGroupBox,
    QPushButton, QDialogButtonBox, QSpinBox, QCheckBox, QHBoxLayout,
    QLineEdit, QMessageBox
)

from ..license import buy_url
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
        for label_key, field in (("lic_email", self.ed_email), ("lic_key", self.ed_key)):
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
            QMessageBox.warning(self, self._win._t("lic_title"), self._win._t("lic_empty"))
            return
        ok, err = self._win.lic.activate(email, key)
        if ok:
            QMessageBox.information(self, self._win._t("lic_ok_title"), self._win._t("lic_ok"))
            self._win.refresh_pro_ui()
            self.accept()
            return
        # Messages traduits pour les cas connus ; sinon on remonte le texte brut
        # de Lemon Squeezy, qui est deja explicite ("license key has reached
        # its activation limit", "license key has been disabled"...).
        msg = {"invalid": self._win._t("lic_invalid"),
               "nonet":   self._win._t("lic_nonet"),
               "timeout": self._win._t("lic_timeout")}.get(err, err)
        QMessageBox.warning(self, self._win._t("lic_title"), msg)

