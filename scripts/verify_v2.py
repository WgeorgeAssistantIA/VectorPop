"""Vérification automatique de la V2 desktop (cf. PLAN_VERIFICATION_V2.md).

Pilote la vraie MainWindow en Qt offscreen (aucune fenêtre, aucune capture
d'écran), dans un profil isolé : %APPDATA% et QSettings redirigés vers un
dossier temporaire. Les envois analytics sont interceptés, sauf V-NET.

Usage : .venv\\Scripts\\python.exe scripts\\verify_v2.py [--no-net]
Code retour 0 = tout est vert.
"""

from __future__ import annotations

import hashlib
import os
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

# ── Profil isolé (AVANT tout import de vectorpop) ────────────────────────────
REAL_USAGE = Path(os.environ.get("APPDATA", Path.home())) / "VectorPop" / "usage.json"


def _digest(p: Path) -> str | None:
    try:
        return hashlib.sha256(p.read_bytes()).hexdigest()
    except OSError:
        return None


REAL_USAGE_BEFORE = _digest(REAL_USAGE)
TMP = Path(tempfile.mkdtemp(prefix="vectorpop_verify_"))
os.environ["APPDATA"] = str(TMP / "appdata")
os.environ["XDG_DATA_HOME"] = str(TMP / "appdata")
os.environ["QT_QPA_PLATFORM"] = "offscreen"
os.environ.pop("VECTORPOP_ANALYTICS", None)

from PIL import Image, ImageDraw  # noqa: E402
from PySide6.QtCore import QSettings  # noqa: E402
from PySide6.QtGui import QImage  # noqa: E402
from PySide6.QtWidgets import QApplication, QMessageBox  # noqa: E402

from vectorpop import analytics  # noqa: E402
from vectorpop.ui import dialogs, main_window  # noqa: E402

RESULTS: list[tuple[str, bool, str]] = []
sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def check(cid: str, ok: bool, detail: str = "") -> None:
    RESULTS.append((cid, bool(ok), detail))
    print(f"{'PASS' if ok else 'FAIL'}  {cid}  {detail}")


# ── A1 : désactivé depuis les sources ─────────────────────────────────────────
check("A1", analytics._ENABLED is False, f"_ENABLED={analytics._ENABLED}")

# ── A2 : détection du canal ──────────────────────────────────────────────────
def _channel_with(frozen, exe, platform, env):
    saved = (getattr(sys, "frozen", None), sys.executable, sys.platform, dict(os.environ))
    try:
        if frozen:
            sys.frozen = True
        elif hasattr(sys, "frozen"):
            del sys.frozen
        sys.executable = exe
        sys.platform = platform
        for k in ("SNAP", "APPIMAGE"):
            os.environ.pop(k, None)
        os.environ.update(env)
        return analytics.channel()
    finally:
        if saved[0] is None and hasattr(sys, "frozen"):
            del sys.frozen
        sys.executable, sys.platform = saved[1], saved[2]
        os.environ.clear()
        os.environ.update(saved[3])


cases = [
    ((False, sys.executable, "win32", {}), "source"),
    ((True, r"C:\Program Files\VectorPop\VectorPop.exe", "win32", {}), "exe"),
    ((True, r"C:\Program Files\WindowsApps\LaFabrik.VectorPop_1.0_x64\VectorPop.exe", "win32", {}), "msix"),
    ((True, r"C:\Users\x\Downloads\VectorPop\VectorPop.exe", "win32", {}), "portable"),
    ((True, "/snap/vectorpop/1/VectorPop", "linux", {"SNAP": "/snap/vectorpop/1"}), "snap"),
    ((True, "/tmp/.mount_x/VectorPop", "linux", {"APPIMAGE": "/home/x/VectorPop.AppImage"}), "appimage"),
    ((True, "/opt/VectorPop/VectorPop", "linux", {}), "tar"),
]
bad = [(exp, got) for args, exp in cases if (got := _channel_with(*args)) != exp]
check("A2", not bad, f"écarts={bad}" if bad else f"{len(cases)} canaux OK")

# ── A4 : hors ligne ──────────────────────────────────────────────────────────
analytics._ENABLED = True
real_post = analytics._post
saved_host = analytics._POSTHOG_HOST
analytics._POSTHOG_HOST = "http://10.255.255.1"  # non routable -> timeout
t0 = time.monotonic()
try:
    analytics.capture_sync("offline_test", timeout=1.0)
    err = None
except Exception as e:  # noqa: BLE001
    err = e
dt = time.monotonic() - t0
analytics._POSTHOG_HOST = saved_host
check("A4", err is None and dt < 2.5, f"exception={err!r}, durée={dt:.2f}s")

# ── Interception des envois pour la suite ─────────────────────────────────────
SENT: list[tuple[str, dict]] = []
ORDER: list[str] = []  # séquence events + ouverture navigateur (A12)


def fake_post(url, payload, timeout):
    SENT.append((url, payload))
    ORDER.append(payload.get("event", "?"))


class SyncThread:
    """Exécute la cible immédiatement : rend l'ordre des events déterministe."""

    def __init__(self, target=None, args=(), kwargs=None, daemon=None):
        self._t, self._a, self._k = target, args, kwargs or {}

    def start(self):
        self._t(*self._a, **self._k)


analytics._post = fake_post
analytics.threading.Thread = SyncThread


def ph_events() -> list[dict]:
    return [p for u, p in SENT if "posthog" in u]


def names() -> list[str]:
    return [p["event"] for p in ph_events()]


def last(name: str) -> dict | None:
    for p in reversed(ph_events()):
        if p["event"] == name:
            return p["properties"]
    return None


def mark() -> int:
    return len(ph_events())


def since(m: int) -> list[str]:
    return names()[m:]


# ── QSettings isolés + boîtes de dialogue automatisées ───────────────────────
INI = str(TMP / "settings.ini")
main_window.QSettings = lambda *a, **k: QSettings(INI, QSettings.Format.IniFormat)

CHOICE = {"upsell": "later"}
DIALOGS: list[str] = []


class FakeBox(QMessageBox):
    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        self._added = []
        self._clicked = None

    def addButton(self, *a, **k):
        b = super().addButton(*a, **k)
        self._added.append(b)
        return b

    def exec(self):
        DIALOGS.append("upsell")
        idx = {"buy": 0, "have": 1, "without": 1, "later": 2}[CHOICE["upsell"]]
        self._clicked = self._added[idx] if len(self._added) > idx else None
        return 0

    def clickedButton(self):
        return self._clicked

    @staticmethod
    def critical(*a, **k):
        DIALOGS.append(f"critical:{a[2] if len(a) > 2 else ''}")
        return QMessageBox.StandardButton.Ok

    @staticmethod
    def information(*a, **k):
        DIALOGS.append("information")
        return QMessageBox.StandardButton.Ok

    @staticmethod
    def warning(*a, **k):
        DIALOGS.append("warning")
        return QMessageBox.StandardButton.Ok

    @staticmethod
    def question(*a, **k):
        DIALOGS.append("question")
        return QMessageBox.StandardButton.No


main_window.QMessageBox = FakeBox
dialogs.QMessageBox = FakeBox


LAST_PRODIALOG: list = [None]


class FakeProDialog(dialogs.ProDialog):
    """Construit le vrai ProDialog (widgets réels, offscreen) mais saute exec() :
    appelle directement le handler du bouton choisi par CHOICE["upsell"]."""

    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        LAST_PRODIALOG[0] = self

    def exec(self):
        DIALOGS.append("prodialog")
        choice = CHOICE["upsell"]
        if choice == "buy":
            self._on_buy()
        elif choice == "have":
            self._on_have_key()
        elif choice == "without":
            self._on_without_pro()
        else:
            self.reject()
        return self.result()


main_window.ProDialog = FakeProDialog

LAST_ONBOARDING: list = [None]
ONBOARDING_DRIVER: list = [None]  # callable(dlg), défini par chaque test O* avant coup


class FakeOnboardingDialog(main_window.OnboardingDialog):
    """Construit le vrai OnboardingDialog (widgets réels) mais saute exec() :
    joue le "parcours" fourni par ONBOARDING_DRIVER (par défaut : jusqu'au bout,
    sans changer de profil) au lieu d'attendre un vrai clic."""

    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        LAST_ONBOARDING[0] = self

    def exec(self):
        DIALOGS.append("onboarding")
        driver = ONBOARDING_DRIVER[0] or (lambda d: [d._next() for _ in range(4)])
        driver(self)
        return self.result()


main_window.OnboardingDialog = FakeOnboardingDialog

# Lot 6 : jamais de vrai fichier/dossier/Store/mail ouvert sur le PC de William.
OPENED: list[str] = []


class FakeDesktop:
    @staticmethod
    def openUrl(url):
        OPENED.append(url.toString())
        return True


dialogs.QDesktopServices = FakeDesktop

CHOICE["celebration"] = "close"  # close | open_file | open_folder | pro
CHOICE["review"] = "later"  # later | positive | negative
SHOWN: list[str] = []  # "celebration" / "review", dans l'ordre d'apparition
LAST_CELEBRATION: list = [None]


class FakeCelebration(dialogs.ExportCelebrationDialog):
    def exec(self):
        SHOWN.append("celebration")
        LAST_CELEBRATION[0] = self
        c = CHOICE["celebration"]
        if c == "open_file":
            self._open_file()
        elif c == "open_folder":
            self._open_folder()
        elif c == "pro":
            self._discover_pro()
            return self.result()
        self.accept()
        return self.result()


class FakeReview(dialogs.ReviewPromptDialog):
    def exec(self):
        SHOWN.append("review")
        c = CHOICE["review"]
        if c == "positive":
            self._positive()
        elif c == "negative":
            self._negative()
        else:
            self.reject()
        return self.result()


main_window.ExportCelebrationDialog = FakeCelebration
main_window.ReviewPromptDialog = FakeReview

# Lot 7 : ouverture de dossier (lot, export simple) interceptée aussi.
from vectorpop.ui import batch_dialog  # noqa: E402

batch_dialog.QDesktopServices = FakeDesktop
main_window.QDesktopServices = FakeDesktop

LAST_BATCH: list = [None]
BATCH_DRIVER: list = [None]  # callable(dlg) : remplit/lance le lot comme un utilisateur


class FakeBatchDialog(batch_dialog.BatchDialog):
    """Vrai BatchDialog (widgets, worker, statuts) ; exec() joue BATCH_DRIVER
    puis attend la fin du lot au lieu d'une boucle modale."""

    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        LAST_BATCH[0] = self

    def exec(self):
        DIALOGS.append("batch")
        if BATCH_DRIVER[0] is not None:
            BATCH_DRIVER[0](self)
        return 0


main_window.BatchDialog = FakeBatchDialog
from vectorpop import onboarding  # noqa: E402

onboarding.mark_seen()  # l'onboarding auto-déclenché (singleShot) ne doit pas
# gêner le reste du parcours ; le Lot 5 réinitialise et teste ça explicitement.

BROWSER: list[str] = []
dialogs.webbrowser.open = lambda url, *a, **k: (BROWSER.append(url), ORDER.append("BROWSER"))

app = QApplication.instance() or QApplication(sys.argv)


def wait_idle(win, timeout=60.0):
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        app.processEvents()
        busy = (
            win._worker is not None
            or win._live.isActive()
            or getattr(win, "_autotune_worker", None) is not None
            or getattr(win, "_batch", None) is not None
            or getattr(win, "_del_worker", None) is not None
        )
        if not busy:
            for _ in range(5):
                app.processEvents()
            return True
        time.sleep(0.02)
    return False


def make_png(path: Path, color=(122, 82, 245, 255), size=240):
    img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((20, 20, size - 20, size - 20), fill=color)
    d.rectangle((size // 3, size // 3, size // 2, size // 2), fill=(63, 215, 251, 255))
    img.save(path)
    return path


# ── Parcours UI ──────────────────────────────────────────────────────────────
win = main_window.MainWindow()
win.lang = "fr"
analytics.set_context(lang="fr")

# A5
check("A5", "app_opened" in names(), f"events={names()}")

# A3 (vérifié à la fin sur tous les events)

# A6
src = make_png(TMP / "logo.png")
m = mark()
win.load_image(src)
wait_idle(win)
ev = since(m)
ip, vc = last("image_picked"), last("vectorize_completed")
ok6 = (
    ev[:1] == ["image_picked"]
    and "vectorize_completed" in ev
    and ip and ip.get("source") == "file" and ip.get("width") == 240 and ip.get("has_alpha") is True
    and vc and vc.get("trigger") == "load" and isinstance(vc.get("duration_ms"), int)
    and vc.get("svg_size_kb") is not None
    and win.svg_path is not None
)
check("A6", ok6, f"events={ev} image_picked={ip} vectorize={vc}")

# A7
m = mark()
before_svg = win.svg_path
win.s_speckle.setValue(win.s_speckle.value() + 3)
wait_idle(win)
check("A7", "vectorize_completed" not in since(m) and win.svg_path != before_svg,
      f"events={since(m)} nouveau_svg={win.svg_path != before_svg}")

# A8
m = mark()
win.btn_vec.click()
wait_idle(win)
vc = last("vectorize_completed")
check("A8", "vectorize_completed" in since(m) and vc.get("trigger") == "button", f"{vc}")

# A9 collage + exemple
m = mark()
qimg = QImage(str(make_png(TMP / "clip.png", (201, 43, 192, 255))))
QApplication.clipboard().setImage(qimg)
win.paste_image()
wait_idle(win)
ip_paste = last("image_picked")
win.load_demo_model("logo")
wait_idle(win)
ip_demo = last("image_picked")
ev = since(m)
check("A9", ip_paste and ip_paste.get("source") == "paste" and ip_demo.get("source") == "demo"
      and "sample_model_selected" in ev, f"events={ev}")

# ── Lot 4 : modèles démo ─────────────────────────────────────────────────────
from vectorpop.core.demo_models import DEMO_MODELS  # noqa: E402
from vectorpop.app_utils import sample_asset  # noqa: E402

# D1 : les 4 échantillons packagés existent bien là où sample_asset() les cherche
missing = [m.id for m in DEMO_MODELS if not Path(sample_asset(m.filename)).exists()]
check("D1", not missing and len(DEMO_MODELS) == 4, f"manquants={missing}")

# D5 : les 4 tuiles existent avec une icône réelle sur l'écran vide, et le
# panneau se cache une fois une vraie image chargée (déjà le cas ici via A6-A9).
tiles = win.original._demo_tiles
null_icons = [i for i, b in enumerate(tiles) if b.icon().isNull()]
check(
    "D5",
    len(tiles) == 4 and not null_icons and win.original._demo_panel.isHidden(),
    f"tuiles={len(tiles)} icônes_nulles={null_icons} panneau_caché={win.original._demo_panel.isHidden()}",
)

# D2 : piège QSettings -- des réglages "sauvegardés" volontairement faux sont
# bien ÉCRASÉS par le preset du modèle démo (pas juste rechargés par-dessus).
win.s_colors.setValue(2)
win.s_corner.setValue(150)
win.s_speckle.setValue(10)
win.s_merge.setValue(5)
win.chk_merge.setChecked(False)
win.chk_edges.setChecked(False)
m = mark()
win.load_demo_model("logo")
wait_idle(win)
logo_cfg = next(mo.cfg for mo in DEMO_MODELS if mo.id == "logo")
check(
    "D2",
    win.preset.currentData() == "flat"
    and win.s_colors.value() == logo_cfg["colors"] == 4
    and win.s_corner.value() == logo_cfg["corner"] == 20
    and win.s_speckle.value() == logo_cfg["speckle"] == 0
    and win.s_merge.value() == logo_cfg["merge"] == 24
    and win.chk_merge.isChecked() is True
    and win.chk_edges.isChecked() is True
    and win.svg_path is not None
    and (last("sample_model_selected") or {}).get("model_id") == "logo",
    f"preset={win.preset.currentData()} colors={win.s_colors.value()} "
    f"corner={win.s_corner.value()} speckle={win.s_speckle.value()} "
    f"merge={win.s_merge.value()} merge_on={win.chk_merge.isChecked()} edges={win.chk_edges.isChecked()}",
)

# D3 : les 4 modèles se chargent, chacun applique bien SON preset et se trace
d3_bad = []
for mo in DEMO_MODELS:
    win.load_demo_model(mo.id)
    wait_idle(win)
    picked = last("sample_model_selected")
    if not (
        win.preset.currentData() == mo.cfg["preset"]
        and win.svg_path is not None
        and picked
        and picked.get("model_id") == mo.id
    ):
        d3_bad.append(mo.id)
check("D3", not d3_bad, f"échecs={d3_bad}" if d3_bad else f"{len(DEMO_MODELS)} modèles OK")

# D4 : menu « Exemples » -- 4 entrées, dans la langue courante, chacune
# reproduit le même chargement qu'un clic sur la tuile.
win.toggle_lang()  # -> en, pour vérifier la retraduction du menu au passage
actions = win._examples_menu.actions()
expected_titles = [win._t(mo.title_key) for mo in DEMO_MODELS]
ok_titles = [a.text() for a in actions] == expected_titles
win.load_demo_model("icon")  # remet une image connue avant le test du menu
wait_idle(win)
mascot_action = next(a for a, mo in zip(actions, DEMO_MODELS) if mo.id == "mascot")
mascot_action.trigger()
wait_idle(win)
check(
    "D4",
    len(actions) == 4
    and ok_titles
    and win.preset.currentData() == "detailed"
    and last("sample_model_selected").get("model_id") == "mascot",
    f"titres={[a.text() for a in actions]} attendus={expected_titles} preset={win.preset.currentData()}",
)
win.toggle_lang()  # retour fr pour la suite du script

# Exports gratuits : 2 SVG + 1 copie = quota de 3/jour épuisé
win._ask_svg_size = lambda: 0
win._ask_png_size = lambda: 1024
out_dir = TMP / "out"
out_dir.mkdir()


def export_to(name: str, flt: str):
    main_window.QFileDialog.getSaveFileName = staticmethod(
        lambda *a, **k: (str(out_dir / name), flt)
    )
    win.export_any()


# F1 : nouvelle installation -> essai de 5 exports au total, libellé explicite
check("F1", win.usage.plan == "trial" and win.usage.max_quota == 5
      and win.usage.remaining() == 5 and "5/5" in win.lbl_plan.text(),
      f"plan={win.usage.plan} max={win.usage.max_quota} label={win.lbl_plan.text()!r}")

# L'image courante est l'exemple (A9) : on recharge une vraie image.
SHOWN.clear()
win.load_image(src)
wait_idle(win)
m = mark()
for n in "abcd":
    export_to(f"{n}.svg", "SVG vectoriel (*.svg)")
a10_events = since(m)
check("A10", a10_events.count("export_svg") == 4 and (out_dir / "a.svg").exists()
      and win.usage.remaining() == 1 and "1/5" in win.lbl_plan.text(),
      f"events={since(m)} restant={win.usage.remaining()} label={win.lbl_plan.text()!r}")

# X1 : 1er export d'une vraie image -> célébration, une seule fois (pas aux 3 suivants)
check(
    "X1",
    SHOWN.count("celebration") == 1
    and a10_events.count("first_export_celebrated") == 1
    and LAST_CELEBRATION[0] is not None
    and LAST_CELEBRATION[0]._out.name == "a.svg",
    f"shown={SHOWN} events={a10_events}",
)

m = mark()
win.copy_svg()
check("A15", "copy_clipboard" in since(m) and win.usage.remaining() == 0
      and QApplication.clipboard().text().lstrip().startswith("<"), f"events={since(m)}")

# A11 : 4e export -> quota
m = mark()
CHOICE["upsell"] = "later"
export_to("q1.svg", "SVG vectoriel (*.svg)")
pv = last("paywall_viewed")
check("A11", since(m) == ["quota_reached", "paywall_viewed"] and pv.get("source") == "quota"
      and not (out_dir / "q1.svg").exists(), f"events={since(m)} paywall={pv}")

# A12 : clic Acheter -> event synchrone AVANT le navigateur
ORDER.clear()
CHOICE["upsell"] = "buy"
export_to("q2.svg", "SVG vectoriel (*.svg)")
i_buy = ORDER.index("pro_buy_clicked") if "pro_buy_clicked" in ORDER else -1
i_br = ORDER.index("BROWSER") if "BROWSER" in ORDER else -1
check("A12", 0 <= i_buy < i_br and BROWSER and "lemonsqueezy" in BROWSER[-1],
      f"ordre={ORDER}")

# A13 : J'ai une clé (le LicenseDialog est remplacé pour ne pas bloquer)
opened = []
main_window.LicenseDialog = lambda w: type("D", (), {"exec": lambda s: opened.append(1)})()
m = mark()
CHOICE["upsell"] = "have"
export_to("q3.svg", "SVG vectoriel (*.svg)")
check("A13", "paywall_have_key_clicked" in since(m) and opened, f"events={since(m)}")

# A14 : PNG en gratuit -> paywall
m = mark()
CHOICE["upsell"] = "later"
export_to("f.png", "PNG haute-def (*.png)")
pv = last("paywall_viewed")
check("A14", "paywall_viewed" in since(m) and pv.get("source") == "export_png"
      and not (out_dir / "f.png").exists(), f"events={since(m)} source={pv.get('source')}")

# ── Lot 2 : freemium ─────────────────────────────────────────────────────────
from vectorpop import license as lic_mod  # noqa: E402

# F2 : utilisateur d'avant la 2.0.0 (usage.json existant) -> 3/jour conservés
legacy_dir = TMP / "legacy_appdata"
(legacy_dir / "VectorPop").mkdir(parents=True)
(legacy_dir / "VectorPop" / "usage.json").write_text(
    '{"date": "2000-01-01", "count": 2, "total": 7}', encoding="utf-8"
)
saved_appdata = os.environ["APPDATA"]
os.environ["APPDATA"] = str(legacy_dir)
try:
    legacy = lic_mod.UsageTracker()
    ok_f2 = (legacy.plan == "daily" and legacy.max_quota == 3 and legacy.remaining() == 3
             and legacy.total_exports() == 7)
    legacy.record_export()
    legacy._data["date"] = "2000-01-02"  # lendemain
    ok_f2 = ok_f2 and legacy.remaining() == 3 and legacy.plan == "daily" and legacy.total_exports() == 8
    reloaded = lic_mod.UsageTracker()  # le plan survit au rechargement
    ok_f2 = ok_f2 and reloaded.plan == "daily"
finally:
    os.environ["APPDATA"] = saved_appdata
check("F2", ok_f2, f"plan={legacy.plan} restant={legacy.remaining()} total={legacy.total_exports()}")

# F3 : l'essai ne repart PAS le lendemain
win.usage._data["date"] = "2000-01-01"
check("F3", not win.usage.can_export() and win.usage.remaining() == 0
      and "exports d'essai utilisés" in (win._update_plan_label() or win.lbl_plan.text()),
      f"restant={win.usage.remaining()} label={win.lbl_plan.text()!r}")

# F4 : exports d'une image d'exemple hors quota (même quota épuisé)
win.load_demo_model("logo")
wait_idle(win)
total_before = win.usage.total_exports()
m = mark()
export_to("demo.svg", "SVG vectoriel (*.svg)")
check("F4", (out_dir / "demo.svg").exists() and "quota_reached" not in since(m)
      and win.usage.remaining() == 0 and win.usage.total_exports() == total_before + 1,
      f"events={since(m)} total={total_before}->{win.usage.total_exports()}")

# Pour la suite : un peu de quota et une vraie image
win.usage._data["trial_used"] = 2
win.load_image(src)
wait_idle(win)

# P1 : contenu du ProDialog (le vrai widget, pas juste la plomberie) pour
# une fonction verrouillée d'emblée (lot, ici via _require_pro).
from PySide6.QtWidgets import QLabel  # noqa: E402

CHOICE["upsell"] = "later"
win.run_batch()
dlg = LAST_PRODIALOG[0]
badges = dlg.findChildren(QLabel, "dlgBadge") if dlg else []
feats = dlg.findChildren(QLabel, "dlgFeature") if dlg else []
used_feats = [f for f in feats if f.property("used") == "true"]
check(
    "P1",
    dlg is not None
    and badges and badges[0].text() == win._t("pro_dialog_badge")
    and len(feats) == 6
    and [f.text() for f in used_feats] == [f"✓ {win._t('pro_dialog_feat_batch')}"]
    and dlg.findChildren(QLabel, "dlgRoiBanner"),  # total_exports > 0 à ce stade
    f"badges={[b.text() for b in badges]} highlighted={[f.text() for f in used_feats]}",
)

# F5 : suppression d'aplats utilisable en gratuit, verrou à l'export
m = mark()
n_dialogs = DIALOGS.count("upsell")
win.btn_del.setChecked(True)
ok_mode = win.btn_del.isChecked() and DIALOGS.count("upsell") == n_dialogs
for pt in [(40, 120), (120, 40), (200, 120), (120, 120)]:
    win.delete_shape_at(*pt)
    wait_idle(win)
    if "delete_shape" in win._pro_used:
        break
win.btn_del.setChecked(False)
tried = last("pro_feature_tried")
ok_used = "delete_shape" in win._pro_used and "Aperçu Pro" in win.statusBar().currentMessage()
check("F5a", ok_mode and ok_used and tried and tried.get("feature") == "delete_shape",
      f"mode={ok_mode} pro_used={win._pro_used} msg={win.statusBar().currentMessage()!r}")

m = mark()
used_before = win.usage.used()
CHOICE["upsell"] = "later"
export_to("t1.svg", "SVG vectoriel (*.svg)")
pv = last("paywall_viewed")
check("F5b", not (out_dir / "t1.svg").exists() and pv.get("source") == "pro_features"
      and pv.get("features") == ["delete_shape"] and win.usage.used() == used_before,
      f"events={since(m)} paywall={pv and pv.get('source')}")

m = mark()
CHOICE["upsell"] = "without"
export_to("t2.svg", "SVG vectoriel (*.svg)")
wait_idle(win)
check("F5c", (out_dir / "t2.svg").exists() and "export_without_pro_chosen" in since(m)
      and "export_svg" in since(m) and not win._pro_used and win.usage.used() == used_before + 1,
      f"events={since(m)} pro_used={win._pro_used}")

# F6 : Optimiser utilisable en gratuit, copie bloquée tant que le rendu l'utilise
m = mark()
n_dialogs = DIALOGS.count("upsell")
clip_before = QApplication.clipboard().text()
QApplication.clipboard().setText("CLIP-SENTINEL")
win.run_autotune()
wait_idle(win, 180)
ok_run = DIALOGS.count("upsell") == n_dialogs and win._pro_used == {"autotune"}
CHOICE["upsell"] = "later"
win.copy_svg()
pv = last("paywall_viewed")
check("F6", ok_run and QApplication.clipboard().text() == "CLIP-SENTINEL"
      and pv.get("features") == ["autotune"] and "autotune_used" in since(m),
      f"events={since(m)} pro_used={win._pro_used}")

# F7 : case IA en gratuit -> pas de paywall (seulement la confirmation de téléchargement)
m = mark()
n_dialogs = DIALOGS.count("upsell")
win.chk_bg_ai.setChecked(True)
tried = last("pro_feature_tried")
check("F7", DIALOGS.count("upsell") == n_dialogs and tried.get("feature") == "bg_ai",
      f"events={since(m)} rembg_absent={win._rembg_missing} coché={win.chk_bg_ai.isChecked()}")
win.chk_bg_ai.blockSignals(True)
win.chk_bg_ai.setChecked(False)
win.chk_bg_ai.blockSignals(False)

# F8 : lot, PNG, PDF restent verrouillés d'emblée en gratuit (rendu sans fonction Pro)
win.btn_vec.click()
wait_idle(win)
m = mark()
CHOICE["upsell"] = "later"
win.run_batch()
export_to("lock.pdf", "PDF vectoriel (*.pdf)")
srcs = [p["properties"].get("source") for p in ph_events()[m:] if p["event"] == "paywall_viewed"]
check("F8", "batch" in srcs and "export_pdf" in srcs and not (out_dir / "lock.pdf").exists(),
      f"sources={srcs}")

# ── Lot 6 : moments après export ─────────────────────────────────────────────
from vectorpop.license import review_url  # noqa: E402

win.load_image(src)
wait_idle(win)
win.usage._data.update(trial_used=0, celebrated=False, opened_result=False, review_asked=False)

# X2 : une image d'exemple ne déclenche jamais la célébration ; la vraie image, si.
SHOWN.clear()
win.load_demo_model("logo")
wait_idle(win)
m = mark()
export_to("x2_demo.svg", "SVG vectoriel (*.svg)")
demo_ev = since(m)
win.load_image(src)
wait_idle(win)
m = mark()
CHOICE["celebration"] = "open_file"
export_to("x2_real.svg", "SVG vectoriel (*.svg)")
real_ev = since(m)
check(
    "X2",
    "first_export_celebrated" not in demo_ev
    and "first_export_celebrated" in real_ev
    and SHOWN == ["celebration"]
    and win.usage.has_celebrated_first_export(),
    f"demo={demo_ev} réel={real_ev} shown={SHOWN}",
)

# X3 : boutons de la célébration -- fichier puis dossier ouverts (interceptés),
# signal "fichier ouvert" enregistré, lien Pro -> ProDialog source=celebration.
dlg = LAST_CELEBRATION[0]
opened_file = OPENED[-1] if OPENED else ""
dlg._open_folder()
opened_folder = OPENED[-1] if OPENED else ""
m = mark()
CHOICE["upsell"] = "later"
dlg._discover_pro()
pv = last("paywall_viewed")
check(
    "X3",
    opened_file.endswith("x2_real.svg")
    and opened_folder.rstrip("/").endswith("out")
    and win.usage.has_opened_result()
    and "celebration_pro_clicked" in since(m)
    and pv and pv.get("source") == "celebration",
    f"fichier={opened_file} dossier={opened_folder} events={since(m)}",
)

# X4 : demande d'avis -- seulement après fichier ouvert + >= 3 exports ;
# « Plus tard » la repousse (redemandée), « 👍 » ouvre le Store et ne redemande plus.
CHOICE["celebration"] = "close"
SHOWN.clear()
win.usage._data["total"] = max(win.usage.total_exports(), 3)
CHOICE["review"] = "later"
export_to("x4_a.svg", "SVG vectoriel (*.svg)")
CHOICE["review"] = "positive"
m = mark()
export_to("x4_b.svg", "SVG vectoriel (*.svg)")
pos_ev = since(m)
opened_review = OPENED[-1] if OPENED else ""
export_to("x4_c.svg", "SVG vectoriel (*.svg)")
check(
    "X4",
    SHOWN == ["review", "review"]  # 2 fois (Plus tard, puis 👍), pas une 3e
    and "review_positive_clicked" in pos_ev
    and opened_review == review_url()
    and win.usage._data.get("review_asked") is True,
    f"shown={SHOWN} ouvert={opened_review}",
)

# X5 : « 👎 » -> mail de retour (intercepté), plus redemandé ensuite
win.usage._data["review_asked"] = False
SHOWN.clear()
CHOICE["review"] = "negative"
m = mark()
export_to("x5.svg", "SVG vectoriel (*.svg)")
check(
    "X5",
    SHOWN == ["review"]
    and "review_negative_clicked" in since(m)
    and OPENED and OPENED[-1].startswith("mailto:")
    and win.usage._data.get("review_asked") is True,
    f"shown={SHOWN} ouvert={OPENED[-1] if OPENED else None}",
)

# X6 : dernier export gratuit -> bandeau non bloquant (export fichier ET copie)
SHOWN.clear()
win.usage._data["trial_used"] = win.usage.max_quota - 1
m = mark()
export_to("x6.svg", "SVG vectoriel (*.svg)")
msg_file = win.statusBar().currentMessage()
ev_file = since(m)
win.usage._data["trial_used"] = win.usage.max_quota - 1
m = mark()
win.copy_svg()
msg_copy = win.statusBar().currentMessage()
check(
    "X6",
    "last_free_export_banner_shown" in ev_file
    and "last_free_export_banner_shown" in since(m)
    and "Dernier export gratuit" in msg_file
    and "Dernier export gratuit" in msg_copy
    and not SHOWN,  # aucune fenêtre bloquante
    f"fichier={msg_file!r} copie={msg_copy!r} shown={SHOWN}",
)

# A17 : activation échouée
dlg = dialogs.LicenseDialog(win)
dlg.ed_email.setText("test@example.com")
dlg.ed_key.setText("BAD-KEY")
win.lic.activate = lambda e, k: (False, "invalid")
m = mark()
dlg._activate()
check("A17", "license_activation_failed" in since(m), f"events={since(m)}")

# A16 : mode Pro -> PNG, PDF, lot
win.lic.is_pro = lambda: True
analytics.set_context(is_pro=lambda: True)
m = mark()
export_to("g.png", "PNG haute-def (*.png)")
export_to("h.pdf", "PDF vectoriel (*.pdf)")
batch_in = TMP / "batch_in"
batch_in.mkdir()
for i, c in enumerate([(122, 82, 245, 255), (201, 43, 192, 255), (63, 215, 251, 255)]):
    make_png(batch_in / f"img{i}.png", c, 160)
batch_out = TMP / "batch_out"


def run_lot(paths, out, **opts):
    """Ouvre l'écran de lot via le vrai bouton, le remplit et le lance."""

    def driver(d):
        d.add_paths(paths, via="test")
        d.set_output(out)
        for name, value in opts.items():
            w = getattr(d, name)
            if hasattr(w, "setChecked"):
                w.setChecked(value)
            elif hasattr(w, "setValue"):
                w.setValue(value)
            elif hasattr(w, "setCurrentIndex"):
                w.setCurrentIndex(value)
            else:
                w.setText(value)
        d.start()
        wait_idle(win, 300)

    BATCH_DRIVER[0] = driver
    win.btn_batch.click()
    return LAST_BATCH[0]


dlg = run_lot([batch_in], batch_out)
bs, bc = last("batch_started"), last("batch_completed")
png_ev = last("export_png")
ok16 = (
    (out_dir / "g.png").exists() and (out_dir / "h.pdf").exists()
    and png_ev and png_ev.get("resolution_px") == 1024 and "export_pdf" in since(m)
    and bs and bs.get("count") == 3 and bs.get("formats") == ["svg"]
    and bc and bc.get("done") == 3 and bc.get("errors") == 0
    and sorted(x.name for x in batch_out.glob("*.svg"))
    == ["img0_vector.svg", "img1_vector.svg", "img2_vector.svg"]
    and all(it["status"] == "ok" for it in dlg._items)
    and last("export_pdf").get("is_pro") is True
)
check("A16", ok16, f"batch={bs}/{bc} sortie={sorted(x.name for x in batch_out.glob('*'))}")

# ── Lot 7 : traitement par lot 2.0 ───────────────────────────────────────────
from PySide6.QtGui import QImage as _QImage  # noqa: E402

# B1 : plusieurs formats en une passe + un sous-dossier par format + taille PNG
out_b1 = TMP / "b1"
dlg = run_lot([batch_in], out_b1, chk_png=True, chk_pdf=True, chk_subdir=True, spin_png=512)
pngs = sorted((out_b1 / "png").glob("*.png"))
png_w = max(_QImage(str(pngs[0])).width(), _QImage(str(pngs[0])).height()) if pngs else 0
check(
    "B1",
    len(list((out_b1 / "svg").glob("*.svg"))) == 3
    and len(pngs) == 3
    and len(list((out_b1 / "pdf").glob("*.pdf"))) == 3
    and png_w == 512
    and last("batch_started").get("formats") == ["svg", "png", "pdf"],
    f"svg/png/pdf={[len(list((out_b1 / f).glob('*'))) for f in ('svg', 'png', 'pdf')]} png={png_w}px",
)

# B2 : sous-dossiers + doublons + homonymes (jamais d'écrasement dans un même lot)
tree = TMP / "tree"
(tree / "sub").mkdir(parents=True)
make_png(tree / "logo.png", (122, 82, 245, 255), 120)
make_png(tree / "sub" / "logo.png", (201, 43, 192, 255), 120)
(tree / "notes.txt").write_text("pas une image", encoding="utf-8")
out_b2 = TMP / "b2"


def _b2(d):
    d.chk_recursive.setChecked(True)
    d.add_paths([tree], via="test")
    d.add_paths([tree], via="test")  # même dossier deux fois : aucun doublon
    d.add_paths([tree / "logo.png"], via="test")
    d.set_output(out_b2)
    d.start()
    wait_idle(win, 120)


BATCH_DRIVER[0] = _b2
win.btn_batch.click()
dlg = LAST_BATCH[0]
check(
    "B2",
    len(dlg._items) == 2
    and sorted(x.name for x in out_b2.glob("*.svg")) == ["logo_vector.svg", "logo_vector_2.svg"],
    f"items={[str(it['path'].relative_to(tree)) for it in dlg._items]} sortie={sorted(x.name for x in out_b2.glob('*'))}",
)

# B3 : fichier illisible -> erreur isolée (le reste passe), puis « Relancer les échecs »
bad_dir = TMP / "bad"
bad_dir.mkdir()
make_png(bad_dir / "a.png", (122, 82, 245, 255), 120)
(bad_dir / "b.png").write_bytes(b"ceci n'est pas un PNG")
out_b3 = TMP / "b3"
dlg = run_lot([bad_dir], out_b3)
statuses = [it["status"] for it in dlg._items]
retry_visible = not dlg.btn_retry.isHidden()
make_png(bad_dir / "b.png", (63, 215, 251, 255), 120)  # on "répare" le fichier
m = mark()
dlg.retry_failed()
wait_idle(win, 120)
retried = last("batch_started")
check(
    "B3",
    statuses == ["ok", "error"]
    and retry_visible
    and "batch_retry_failed" in since(m)
    and retried.get("count") == 1
    and [it["status"] for it in dlg._items] == ["ok", "ok"]
    and dlg.btn_retry.isHidden()
    and len(list(out_b3.glob("*.svg"))) == 2,
    f"avant={statuses} après={[it['status'] for it in dlg._items]}",
)

# B4 : fond blanc (coin du PNG opaque blanc, rect dans le SVG) vs transparent
out_b4w, out_b4t = TMP / "b4w", TMP / "b4t"
run_lot([batch_in / "img0.png"], out_b4w, chk_png=True, cmb_bg=1)
run_lot([batch_in / "img0.png"], out_b4t, chk_png=True, cmb_bg=0)
cw = _QImage(str(out_b4w / "img0_vector.png")).pixelColor(0, 0)
ct = _QImage(str(out_b4t / "img0_vector.png")).pixelColor(0, 0)
svg_w = (out_b4w / "img0_vector.svg").read_text(encoding="utf-8")
check(
    "B4",
    (cw.red(), cw.green(), cw.blue(), cw.alpha()) == (255, 255, 255, 255)
    and ct.alpha() == 0
    and 'fill="#FFFFFF"' in svg_w
    and 'fill="#FFFFFF"' not in (out_b4t / "img0_vector.svg").read_text(encoding="utf-8"),
    f"coin blanc={cw.getRgb()} coin transparent={ct.getRgb()}",
)

# B5 : optimisation par image (auto_refine) -- une image pour rester rapide
out_b5 = TMP / "b5"
dlg = run_lot([batch_in / "img1.png"], out_b5, chk_autotune=True)
check(
    "B5",
    (out_b5 / "img1_vector.svg").exists()
    and last("batch_started").get("autotune") is True
    and dlg._items[0]["status"] == "ok",
    f"statut={dlg._items[0]['status']}",
)

# B6 : annulation en cours de lot -> arrêt propre, rien n'est laissé "en cours"
many = TMP / "many"
many.mkdir()
for i in range(25):
    make_png(many / f"m{i:02d}.png", (122, 82, 245, 255), 200)


def _b6(d):
    d.add_paths([many], via="test")
    d.set_output(TMP / "b6")
    d.chk_autotune.setChecked(True)  # lent : laisse le temps d'annuler
    d.start()
    for _ in range(50):
        app.processEvents()
        if any(it["status"] in ("ok", "warning") for it in d._items):
            break
        time.sleep(0.05)
    d.cancel()
    wait_idle(win, 300)


BATCH_DRIVER[0] = _b6
win.btn_batch.click()
dlg = LAST_BATCH[0]
bc = last("batch_completed")
check(
    "B6",
    bc.get("cancelled") is True
    and 0 < bc.get("done") < 25
    and not any(it["status"] == "running" for it in dlg._items)
    and win._batch is None
    and dlg.btn_start.isEnabled(),  # le reste peut être relancé
    f"done={bc.get('done')} statuts={sorted(set(it['status'] for it in dlg._items))}",
)

# B7 : « Ouvrir le dossier de sortie » (intercepté)
n_opened = len(OPENED)
dlg.open_output()
check(
    "B7",
    len(OPENED) == n_opened + 1 and OPENED[-1].rstrip("/").endswith("b6"),
    f"ouvert={OPENED[-1] if OPENED else None}",
)

# B8 : dépôt de plusieurs fichiers / d'un dossier sur la zone d'image
BATCH_DRIVER[0] = None
LAST_BATCH[0] = None
win.original.handle_dropped_paths([batch_in / "img0.png", batch_in / "img1.png"])
pro_drop = LAST_BATCH[0]
win.lic.is_pro = lambda: False
CHOICE["upsell"] = "later"
LAST_BATCH[0] = None
m = mark()
win.original.handle_dropped_paths([batch_in])
wait_idle(win)
free_ev = since(m)
free_src = (last("paywall_viewed") or {}).get("source")
win.lic.is_pro = lambda: True
LAST_BATCH[0] = None
win.original.handle_dropped_paths([batch_in / "img2.png"])  # une seule image
wait_idle(win)
check(
    "B8",
    pro_drop is not None
    and len(pro_drop._items) == 2
    and last("batch_files_added").get("via") == "drop"
    and free_src == "batch"
    and "image_picked" in free_ev  # gratuit : la 1re image est chargée quand même
    and LAST_BATCH[0] is None  # une seule image : pas de lot
    and win.src_path.name == "img2.png",
    f"pro={pro_drop and len(pro_drop._items)} gratuit={free_ev} src={win.src_path}",
)

# B9 : export simple -- fond blanc + bouton « Ouvrir le dossier »
win.chk_white_bg.setChecked(True)
export_to("white.svg", "SVG vectoriel (*.svg)")
export_to("white.png", "PNG haute-def (*.png)")
win.chk_white_bg.setChecked(False)
cw = _QImage(str(out_dir / "white.png")).pixelColor(0, 0)
n_opened = len(OPENED)
win.btn_open_dir.click()
check(
    "B9",
    'fill="#FFFFFF"' in (out_dir / "white.svg").read_text(encoding="utf-8")
    and cw.alpha() == 255 and cw.red() == 255
    and win.btn_open_dir.isEnabled()
    and len(OPENED) == n_opened + 1
    and OPENED[-1].rstrip("/").endswith("out")
    and last("export_png").get("background") == "white",
    f"coin={cw.getRgb()} ouvert={OPENED[-1] if OPENED else None}",
)
BATCH_DRIVER[0] = None

# ── Lot 8 : avant la release ─────────────────────────────────────────────────
from PySide6.QtCore import QPoint, QPointF, QEvent, Qt as _Qt  # noqa: E402
from PySide6.QtGui import QMouseEvent, QWheelEvent  # noqa: E402
from PySide6.QtWidgets import QGraphicsItem  # noqa: E402
from vectorpop import updater, vectorizer  # noqa: E402
from vectorpop.core.recipes import _postprocess_svg  # noqa: E402
from vectorpop.license import PLAY_STORE_URL  # noqa: E402

win.show()  # offscreen : rien ne s'affiche, mais les widgets deviennent "visibles"
app.processEvents()


def wheel(widget, pos, up=True):
    widget.wheelEvent(
        QWheelEvent(QPointF(pos), QPointF(pos), QPoint(0, 0), QPoint(0, 120 if up else -120),
                    _Qt.NoButton, _Qt.NoModifier, _Qt.ScrollUpdate, False)
    )


def mouse(widget, kind, pos, button):
    ev = QMouseEvent(kind, QPointF(pos), QPointF(pos), button,
                     button if kind != QEvent.MouseButtonRelease else _Qt.NoButton, _Qt.NoModifier)
    {QEvent.MouseButtonPress: widget.mousePressEvent,
     QEvent.MouseMove: widget.mouseMoveEvent,
     QEvent.MouseButtonRelease: widget.mouseReleaseEvent}[kind](ev)


# L1 : statistiques désactivables (aide > Confidentialité), mémorisées au redémarrage
help_dlg = dialogs.SettingsHelpDialog(win)
was_checked = help_dlg.chk_analytics.isChecked()
m = mark()
help_dlg.chk_analytics.setChecked(False)
analytics.capture("probe_should_not_be_sent")
off_events = since(m)
stored_off = win._settings.value("analytics_enabled")
win_off = main_window.MainWindow()  # redémarrage avec le choix mémorisé
wait_idle(win_off)
restart_events = since(m)
startup_disabled = not analytics.user_enabled()
win_off._save_settings = lambda: None
win_off.close()
help_dlg2 = dialogs.SettingsHelpDialog(win)
unchecked_on_restart = not help_dlg2.chk_analytics.isChecked()
m = mark()
help_dlg2.chk_analytics.setChecked(True)
on_events = since(m)
check(
    "L1",
    was_checked
    and off_events == []
    and restart_events == []  # pas même "app_opened" au redémarrage
    and str(stored_off).lower() == "false"
    and startup_disabled
    and unchecked_on_restart
    and on_events == ["analytics_enabled"]
    and analytics.user_enabled(),
    f"off={off_events} redémarrage={restart_events} réactivé={on_events}",
)

# L2 : plafond de la résolution de travail (photo 5000 x 3000)
big = TMP / "big.png"
Image.new("RGB", (5000, 3000), (122, 82, 245)).save(big)
bimg = Image.open(big).convert("RGB")
ImageDraw.Draw(bimg).ellipse((800, 400, 4200, 2600), fill=(63, 215, 251))
bimg.save(big)
big_svg = TMP / "big.svg"
t0 = time.monotonic()
vectorizer.vectorize(big, big_svg, vectorizer.PRESETS["flat"])
dt_big = time.monotonic() - t0
head = big_svg.read_text(encoding="utf-8")[:400]
check(
    "L2",
    'width="2048"' in head and ('height="1229"' in head or 'height="1228"' in head),
    f"en-tête={head[head.find('<svg'):head.find('<svg') + 80]!r} durée={dt_big:.1f}s",
)

# L3 : dégradés/affinage quand la source est plus grande que le SVG (plafond,
# finition IA x4) -- avant le correctif, dégradés ignorés avec un avertissement.
warn = _postprocess_svg(big_svg, big, gradients=True, refine=True)
check("L3", warn is None, f"avertissement={warn!r}")

# L4 : panneau Original -- zoom molette sous le curseur, déplacement clic droit,
# retour clic molette, rognage toujours en pixels RÉELS (aperçu décodé réduit).
win.load_image(big)
wait_idle(win)
orig = win.original
disp_w = orig._src_pix.width()
full_sel = None
orig._rubber = None
r0 = orig._draw_rect
mouse(orig, QEvent.MouseButtonPress, r0.topLeft() + QPoint(1, 1), _Qt.LeftButton)
mouse(orig, QEvent.MouseMove, r0.bottomRight(), _Qt.LeftButton)
full_sel = orig.selection_in_image_px()
orig.clear_selection()
c = orig.rect().center()
target = QPointF(c.x() + 40, c.y() + 20)
before = ((target.x() - orig._draw_rect.x()) / orig._draw_rect.width(),
          (target.y() - orig._draw_rect.y()) / orig._draw_rect.height())
for _ in range(3):
    wheel(orig, target)
after = ((target.x() - orig._draw_rect.x()) / orig._draw_rect.width(),
         (target.y() - orig._draw_rect.y()) / orig._draw_rect.height())
zoomed = orig.zoom_level()
pan_before = QPointF(orig._pan)
mouse(orig, QEvent.MouseButtonPress, QPoint(c.x(), c.y()), _Qt.RightButton)
mouse(orig, QEvent.MouseMove, QPoint(c.x() + 30, c.y() + 10), _Qt.RightButton)
mouse(orig, QEvent.MouseButtonRelease, QPoint(c.x() + 30, c.y() + 10), _Qt.RightButton)
panned = orig._pan - pan_before
cr = orig.contentsRect()
mouse(orig, QEvent.MouseButtonPress, cr.topLeft() + QPoint(2, 2), _Qt.LeftButton)
mouse(orig, QEvent.MouseMove, cr.bottomRight() - QPoint(2, 2), _Qt.LeftButton)
zoom_sel = orig.selection_in_image_px()
vis = orig._draw_rect.intersected(cr.adjusted(2, 2, -2, -2))
expected_w = 5000 * vis.width() / orig._draw_rect.width()
orig.clear_selection()
grab_ok = not orig.grab().isNull()
mouse(orig, QEvent.MouseButtonPress, QPoint(c.x(), c.y()), _Qt.MiddleButton)
check(
    "L4",
    disp_w == 4096  # aperçu décodé réduit…
    and full_sel is not None and full_sel[2] >= 4990 and full_sel[3] >= 2990  # …rognage en px réels
    and abs(zoomed - 1.25 ** 3) < 1e-6
    and abs(before[0] - after[0]) < 0.01 and abs(before[1] - after[1]) < 0.01
    and (round(panned.x()), round(panned.y())) == (30, 10)
    and zoom_sel is not None and abs((zoom_sel[2] - zoom_sel[0]) - expected_w) < 60  # px réels de la zone visible
    and expected_w < 5000
    and grab_ok
    and orig.zoom_level() == 1.0,
    f"aperçu={disp_w}px sélection={full_sel} zoomée={zoom_sel} zoom={zoomed:.3f} "
    f"point={before}->{after} pan={panned.x():.0f},{panned.y():.0f}",
)

# L5 : panneau SVG -- jusqu'à ~x12 000 en 28 crans (1.4/cran, relevé de 1.25 après
# retour utilisateur : à 1.25/cran, la portée n'était pas perceptible en scrollant),
# sans cache bitmap géant, pastille de zoom persistante + indicateur barre d'état
win.load_image(batch_in / "img0.png")
wait_idle(win)
pv = win.preview
m = mark()
badge_mid_visible = None
for i in range(60):
    pv.wheelEvent(QWheelEvent(QPointF(pv.viewport().rect().center()), QPointF(0, 0), QPoint(0, 0),
                              QPoint(0, 120), _Qt.NoButton, _Qt.NoModifier, _Qt.ScrollUpdate, False))
    if i == 4:
        badge_mid_visible = pv._badge.isVisible() and "×" in pv._badge.text()
steps = pv._zoom
factor = pv.zoom_factor()
cache_deep = pv._svg_item.cacheMode()
msg = win.statusBar().currentMessage()
badge_text = pv._badge.text()
t0 = time.monotonic()
grab_ok = not pv.grab().isNull()
dt_grab = time.monotonic() - t0
pv.mouseDoubleClickEvent(None)
badge_hidden_after_fit = not pv._badge.isVisible()
check(
    "L5",
    steps == pv.MAX_ZOOM_STEPS == 28
    and factor > 10000
    and cache_deep == QGraphicsItem.NoCache
    and pv._svg_item.cacheMode() == QGraphicsItem.DeviceCoordinateCache
    and msg.startswith("Zoom ×") and "1" in msg  # "×12 xxx"
    and badge_mid_visible  # visible dès les premiers crans, pas seulement au max
    and "×" in badge_text
    and badge_hidden_after_fit  # revient à "ajusté" -> pastille cachée
    and since(m).count("preview_deep_zoom") == 1
    and grab_ok and dt_grab < 10,
    f"crans={steps} facteur={factor:.0f} message={msg!r} pastille={badge_text!r} rendu={dt_grab:.2f}s",
)

# L6 : détection de mise à jour
cmp_ok = (
    updater.is_newer("2.0.1", "2.0.0") and updater.is_newer("2.1", "2.0.9")
    and not updater.is_newer("2.0", "2.0.0") and not updater.is_newer("1.9.9", "2.0.0")
    and not updater.is_newer("", "2.0.0") and updater.parse_version("2.1.0-beta") == (2, 1, 0)
)
chan_ok = (
    updater.should_check("exe") and updater.should_check("portable")
    and updater.should_check("appimage") and updater.should_check("tar")
    and not updater.should_check("msix") and not updater.should_check("snap")
    and not updater.should_check("source")
)
got = []
real_fetch = updater.fetch_latest
updater.fetch_latest = lambda timeout=5.0: {"version": "99.0.0", "url": "https://vectorpop.fr/"}
w = updater.UpdateCheckWorker()
w.found.connect(got.append)
w.run()
updater.fetch_latest = lambda timeout=5.0: {"version": updater.__version__}
w.run()
updater.fetch_latest = lambda timeout=5.0: None
w.run()
updater.fetch_latest = real_fetch
m = mark()
win._on_update_found({"version": "99.0.0", "url": "https://vectorpop.fr/"})
btn = win._btn_update
n_opened = len(OPENED)
btn.click()
check(
    "L6",
    cmp_ok and chan_ok
    and len(got) == 1  # seulement quand la version distante est plus récente
    and btn.isVisible() and "99.0.0" in btn.text()
    and len(OPENED) == n_opened + 1 and OPENED[-1].startswith("https://vectorpop.fr")
    and since(m) == ["update_banner_shown", "update_clicked"],
    f"comparaisons={cmp_ok} canaux={chan_ok} trouvé={got} bouton={btn.text()!r}",
)
btn.hide()

# L7 : pastille « Passer Pro » en gratuit, bouton neutre une fois Pro
win.lic.is_pro = lambda: False
win.refresh_pro_ui()
free_name = win.btn_pro.objectName()
free_text = win.btn_pro.text()
win.lic.is_pro = lambda: True
win.refresh_pro_ui()
check(
    "L7",
    free_name == "btnProCta"
    and free_text.startswith("★")
    and win.btn_pro.objectName() == "dlgSecondary"
    and not win.btn_pro.text().startswith("★")
    and "QPushButton#btnProCta" in app.styleSheet()
    and "border-radius: 15px" in app.styleSheet(),
    f"gratuit={free_name} {free_text!r} pro={win.btn_pro.objectName()} {win.btn_pro.text()!r}",
)

# L8 : lien « Aussi sur Android » (aide + écran Pro)
m = mark()
n_browser = len(BROWSER)
help_dlg2.btn_android.click()
win.lic.is_pro = lambda: False
CHOICE["upsell"] = "later"
win._require_pro("batch")
LAST_PRODIALOG[0].btn_android.click()
win.lic.is_pro = lambda: True
sources = [p["properties"].get("source") for p in ph_events()[m:] if p["event"] == "android_link_opened"]
check(
    "L8",
    BROWSER[n_browser:] == [PLAY_STORE_URL, PLAY_STORE_URL]
    and sources == ["help", "pro_dialog_batch"],
    f"ouverts={BROWSER[n_browser:]} sources={sources}",
)
# L9 : fondu en bas du panneau de réglages -- visible seulement quand des
# réglages sont cachés en dessous ; grand écran = aucun changement.
from vectorpop.theme import window_bg  # noqa: E402

sc = win.settings_scroll
win.resize(1100, 420)  # petit écran : le panneau est plafonné à 40 % de la hauteur
for _ in range(10):
    app.processEvents()
bar = sc.verticalScrollBar()
small_overflow = bar.maximum() > 0
fade_top = sc.fade_visible()
fade_geom_ok = sc.fade.geometry().bottom() == sc.viewport().geometry().bottom()
bar.setValue(bar.maximum())
app.processEvents()
fade_bottom = sc.fade_visible()
bar.setValue(0)
win.resize(1400, 1100)  # grand écran : tout tient
for _ in range(10):
    app.processEvents()
big_overflow = sc.verticalScrollBar().maximum() > 0
fade_big = sc.fade_visible()
light = sc.fade._color.name().lower()
win.apply_theme(True)
dark = sc.fade._color.name().lower()
win.apply_theme(False)
check(
    "L9",
    small_overflow and fade_top and fade_geom_ok
    and not fade_bottom
    and not big_overflow and not fade_big
    and light == window_bg(False).lower() and dark == window_bg(True).lower()
    and win.previews.height() > sc.height(),
    f"petit: débord={small_overflow} fondu={fade_top}/{fade_bottom} ; grand: débord={big_overflow} "
    f"fondu={fade_big} ; couleurs={light}/{dark} ; aperçu={win.previews.height()}px réglages={sc.height()}px",
)

win.hide()

# F9 : en Pro, un rendu Optimiser s'exporte sans aucun verrou
win.run_autotune()
wait_idle(win, 180)
m = mark()
n_dialogs = DIALOGS.count("upsell")
export_to("pro_autotune.svg", "SVG vectoriel (*.svg)")
check("F9", (out_dir / "pro_autotune.svg").exists() and DIALOGS.count("upsell") == n_dialogs,
      f"events={since(m)}")

# ── Lot 5 : onboarding ────────────────────────────────────────────────────────
win.lang = "fr"
win.retranslate_ui()

# O1 : affichage manuel (should_show True après reset), 4 pages, events de départ
onboarding.mark_seen(0)
check("O1a", onboarding.should_show(), "should_show() devrait être True après mark_seen(0)")
m = mark()
ONBOARDING_DRIVER[0] = lambda d: None  # ne rien faire : juste vérifier la construction
win._maybe_show_onboarding()
dlg = LAST_ONBOARDING[0]
ev = since(m)
check(
    "O1b",
    dlg is not None
    and dlg._stack.count() == 4
    and ev[:2] == ["onboarding_started", "onboarding_step_viewed"]
    and last("onboarding_step_viewed").get("step_title") == "welcome",
    f"pages={dlg and dlg._stack.count()} events={ev}",
)

# O2 : « Passer » à l'étape 2 -> onboarding_skipped(at_step=1), marqué vu. Passer
# appelle quand même _complete() (comme Android) : le profil par défaut ("logo")
# est chargé pour donner un premier résultat, même sans avoir choisi de profil.
onboarding.mark_seen(0)
m = mark()
ONBOARDING_DRIVER[0] = lambda d: (d._next(), d._skip())  # avance une fois, puis passe
win._maybe_show_onboarding()
wait_idle(win)
ev = since(m)
check(
    "O2",
    ev[:2] == ["onboarding_started", "onboarding_step_viewed"]  # construction du dialogue
    and "onboarding_skipped" in ev
    and "onboarding_completed" in ev
    and last("onboarding_skipped").get("at_step") == 1
    and not onboarding.should_show()
    and win.svg_path is not None,
    f"events={ev} svg_path={win.svg_path}",
)

# O3 : parcours complet, profil "sketch" choisi à l'étape 3 -> preset bw appliqué
# et le modèle démo correspondant chargé automatiquement à la fin.
onboarding.mark_seen(0)
m = mark()


def _o3_driver(d):
    d._next()  # -> how_it_works
    d._next()  # -> profile
    d._select_profile("sketch")
    d._next()  # -> privacy_quota
    d._next()  # -> complete


ONBOARDING_DRIVER[0] = _o3_driver
win._maybe_show_onboarding()
wait_idle(win)
ev = since(m)
completed = last("onboarding_completed")
check(
    "O3",
    "onboarding_usecase_selected" in ev
    and completed
    and completed.get("usecase") == "sketch"
    and win.preset.currentData() == "bw"
    and (last("sample_model_selected") or {}).get("model_id") == "sketch",
    f"events={ev} completed={completed} preset={win.preset.currentData()}",
)

# O4 : déclenchement automatique (singleShot dans __init__, pas d'appel manuel)
# sur une fenêtre neuve -- prouve le vrai câblage, pas seulement _maybe_show_onboarding().
onboarding.mark_seen(0)
ONBOARDING_DRIVER[0] = lambda d: d._skip()
LAST_ONBOARDING[0] = None
win2 = main_window.MainWindow()
wait_idle(win2)
check("O4", LAST_ONBOARDING[0] is not None, "aucun OnboardingDialog auto-déclenché sur une fenêtre neuve")
win2._save_settings = lambda: None
win2.close()

onboarding.mark_seen()  # remis "vu" pour ne pas perturber la suite du script
ONBOARDING_DRIVER[0] = None

# A18 : langue
m = mark()
win.toggle_lang()
win.btn_vec.click()
wait_idle(win)
vc = last("vectorize_completed")
check("A18", vc and vc.get("lang") == "en", f"lang={vc and vc.get('lang')}")

# A3 : propriétés communes sur tous les events
required = {"app", "app_version", "os", "channel", "lang", "is_pro"}
evs = ph_events()
ids = {p["distinct_id"] for p in evs}
bad3 = [p["event"] for p in evs
        if p["properties"].get("app") != "vectorpop_desktop" or not required <= p["properties"].keys()
        or p.get("api_key", "").startswith("phc_") is False]
check("A3", evs and not bad3 and len(ids) == 1, f"{len(evs)} events, écarts={bad3}, distinct_ids={len(ids)}")

# R1 : écrans touchés par les imports perdus au refactor du 19/08 (QDialog,
# QSvgRenderer, QPainter, QFontMetrics, optimize_svg). Les exec() modaux sont
# neutralisés : on vérifie que chaque écran se construit sans NameError.
from PySide6.QtWidgets import QDialog  # noqa: E402

QDialog.exec = lambda self: 0
errs = []
for label, fn in [
    ("fullscreen_svg", lambda: win.open_fullscreen("svg")),
    ("fullscreen_original", lambda: win.open_fullscreen("original")),
    ("compare", win.open_compare),
    ("ask_png_size", lambda: main_window.MainWindow._ask_png_size(win)),
    ("ask_svg_size", lambda: main_window.MainWindow._ask_svg_size(win)),
    ("help", win.open_help),
    ("license_dialog", lambda: dialogs.LicenseDialog(win)),
]:
    try:
        fn()
        app.processEvents()
    except Exception as e:  # noqa: BLE001
        errs.append(f"{label}: {e!r}")
check("R1", not errs, "; ".join(errs) or "7 écrans OK")

win._save_settings = lambda: None
win.close()
app.processEvents()

# A19 : profil réel intact
check("A19", _digest(REAL_USAGE) == REAL_USAGE_BEFORE, f"usage.json réel inchangé ({REAL_USAGE})")

# V-NET : un seul envoi réel
if "--no-net" not in sys.argv:
    import json
    import urllib.request

    payload = analytics._posthog_payload("verification_ping", {"test": True})
    try:
        req = urllib.request.Request(
            f"{analytics._POSTHOG_HOST}/capture/",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            status, body = r.status, r.read()[:100]
        check("V-NET", status == 200, f"HTTP {status} {body!r}")
    except Exception as e:  # noqa: BLE001
        check("V-NET", False, repr(e))

failed = [c for c, ok, _ in RESULTS if not ok]
print(f"\n{len(RESULTS) - len(failed)}/{len(RESULTS)} PASS" + (f" — échecs : {failed}" if failed else ""))
sys.exit(1 if failed else 0)
