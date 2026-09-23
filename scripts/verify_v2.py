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
BROWSER: list[str] = []
main_window.webbrowser.open = lambda url, *a, **k: (BROWSER.append(url), ORDER.append("BROWSER"))

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
win.load_demo_image()
wait_idle(win)
ip_demo = last("image_picked")
ev = since(m)
check("A9", ip_paste and ip_paste.get("source") == "paste" and ip_demo.get("source") == "demo"
      and "sample_model_selected" in ev, f"events={ev}")

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
win.load_image(src)
wait_idle(win)
m = mark()
for n in "abcd":
    export_to(f"{n}.svg", "SVG vectoriel (*.svg)")
check("A10", since(m).count("export_svg") == 4 and (out_dir / "a.svg").exists()
      and win.usage.remaining() == 1 and "1/5" in win.lbl_plan.text(),
      f"events={since(m)} restant={win.usage.remaining()} label={win.lbl_plan.text()!r}")

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
win.load_demo_image()
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
batch_out.mkdir()
dirs = iter([str(batch_in), str(batch_out)])
main_window.QFileDialog.getExistingDirectory = staticmethod(lambda *a, **k: next(dirs))
main_window.QInputDialog.getItem = staticmethod(lambda *a, **k: ("SVG", True))
win.run_batch()
wait_idle(win, 120)
bs, bc = last("batch_started"), last("batch_completed")
png_ev = last("export_png")
ok16 = (
    (out_dir / "g.png").exists() and (out_dir / "h.pdf").exists()
    and png_ev and png_ev.get("resolution_px") == 1024 and "export_pdf" in since(m)
    and bs and bs.get("count") == 3 and bs.get("format") == "svg"
    and bc and bc.get("done") == 3 and bc.get("errors") == 0
    and len(list(batch_out.glob("*.svg"))) == 3
    and last("export_pdf").get("is_pro") is True
)
check("A16", ok16, f"events={since(m)} batch={bs}/{bc} svg_out={len(list(batch_out.glob('*.svg')))}")

# F9 : en Pro, un rendu Optimiser s'exporte sans aucun verrou
win.run_autotune()
wait_idle(win, 180)
m = mark()
n_dialogs = DIALOGS.count("upsell")
export_to("pro_autotune.svg", "SVG vectoriel (*.svg)")
check("F9", (out_dir / "pro_autotune.svg").exists() and DIALOGS.count("upsell") == n_dialogs,
      f"events={since(m)}")

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
