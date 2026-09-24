#!/usr/bin/env python3
"""
Agent autonome de stress-test pour VectorPop (PNG/JPEG -> SVG).
Attaque directement vectorpop/vectorizer.py::vectorize() sans passer par
l'interface Qt, avec des images générées via Pillow/numpy.

IMPORTANT : ce script doit être lancé avec le venv du projet (vtracer/PySide6
n'y sont installés que là) :
    .venv/Scripts/python.exe stress_test_agent.py        (Windows)
    .venv/bin/python stress_test_agent.py                (Linux/WSL)

Usage:
    .venv/Scripts/python.exe stress_test_agent.py --os windows|linux|android
    .venv/Scripts/python.exe stress_test_agent.py --keep-temp
    .venv/Scripts/python.exe stress_test_agent.py --only image_corrompue,image_unie

Couvre (sections 1, 3, 4, 5 du plan) :
    - Images corrompues, minuscules, énormes, mauvaise extension
    - Transparence (alpha plein/partiel), niveaux de gris, palette indexée
    - Image unie / bruit aléatoire pur (cas limites pour vtracer)
    - Formats variés (PNG, JPEG, BMP, GIF)
    - Curseurs de fidélité aux extrêmes (filter_speckle, color_precision, etc.)
    - remove_background (détourage simple par tolérance de couleur)
    - Export SVG volumineux / motif complexe (beaucoup de petites formes)
    - Sortie vers chemin invalide

Hors scope (à tester manuellement, cf. PLAN_STRESS_TEST.md) :
    - Détourage IA (rembg) : dépend du téléchargement du modèle, testé à part
      si --with-ai est passé et rembg est disponible
    - Licence/activation réseau, interface Qt (redimensionnement, thème)
    - Version Android (portage Flutter distinct)
"""

from __future__ import annotations

import argparse
import json
import os
import platform
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import traceback
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

HOST_OS = "windows" if os.name == "nt" else ("linux" if platform.system() == "Linux" else platform.system().lower())


@dataclass
class CaseResult:
    name: str
    category: str
    status: str = "PASS"
    detail: str = ""
    duration_s: float = 0.0
    traceback: str = ""


@dataclass
class Report:
    started_at: str
    cases: list = field(default_factory=list)

    def add(self, r: CaseResult):
        self.cases.append(r)
        print(f"[{r.status:7}] {r.category:22} {r.name:38} "
              f"({r.duration_s:5.1f}s) {r.detail}")

    def summary(self):
        counts = {}
        for c in self.cases:
            counts[c.status] = counts.get(c.status, 0) + 1
        return counts


def with_timeout(fn, timeout_s):
    result, error = {}, {}

    def target():
        try:
            result["value"] = fn()
        except BaseException as e:
            error["tb"] = traceback.format_exc()
            error["type"] = type(e).__name__

    t = threading.Thread(target=target, daemon=True)
    t.start()
    t.join(timeout_s)
    if t.is_alive():
        raise TimeoutError(f"dépassement de {timeout_s}s (thread encore actif)")
    if "tb" in error:
        raise RuntimeError(f"[{error['type']}] {error['tb']}")
    return result.get("value")


# ────────────────────────────────────────────────────────────────────────────
# Génération d'images de test
# ────────────────────────────────────────────────────────────────────────────

def make_flat_logo(path: Path, size=(300, 300)):
    from PIL import Image, ImageDraw
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([40, 40, 260, 260], fill=(37, 99, 235, 255))
    d.rectangle([100, 100, 200, 200], fill=(255, 255, 255, 255))
    img.save(path)


def make_solid_color(path: Path, size=(200, 200), color=(120, 120, 120, 255)):
    from PIL import Image
    Image.new("RGBA", size, color).save(path)


def make_random_noise(path: Path, size=(200, 200)):
    from PIL import Image
    import numpy as np
    arr = np.random.randint(0, 256, (size[1], size[0], 3), dtype=np.uint8)
    Image.fromarray(arr, "RGB").save(path)


def make_tiny_image(path: Path):
    from PIL import Image
    Image.new("RGBA", (1, 1), (255, 0, 0, 255)).save(path)


def make_huge_image(path: Path, size=(4000, 4000)):
    from PIL import Image, ImageDraw
    img = Image.new("RGB", size, (255, 255, 255))
    d = ImageDraw.Draw(img)
    for i in range(0, size[0], 200):
        d.rectangle([i, 0, i + 100, size[1]], fill=(i % 255, 50, 200))
    img.save(path)


def make_grayscale(path: Path, size=(200, 200)):
    from PIL import Image
    import numpy as np
    arr = np.linspace(0, 255, size[0], dtype=np.uint8)
    arr = np.tile(arr, (size[1], 1))
    Image.fromarray(arr, "L").save(path)


def make_indexed_palette(path: Path, size=(200, 200)):
    from PIL import Image
    img = Image.new("P", size)
    palette = []
    for i in range(256):
        palette += [i, (i * 3) % 256, (i * 7) % 256]
    img.putpalette(palette)
    import numpy as np
    arr = np.random.randint(0, 16, size, dtype=np.uint8)
    img = Image.fromarray(arr.astype("uint8"), "P")
    img.putpalette(palette)
    img.save(path)


def make_partial_alpha(path: Path, size=(200, 200)):
    from PIL import Image
    import numpy as np
    rgb = np.full((size[1], size[0], 3), 100, dtype=np.uint8)
    alpha = np.linspace(0, 255, size[0], dtype=np.uint8)
    alpha = np.tile(alpha, (size[1], 1))
    arr = np.dstack([rgb, alpha])
    Image.fromarray(arr, "RGBA").save(path)


def make_complex_photo_like(path: Path, size=(400, 400)):
    """Beaucoup de petites formes / dégradés : pire cas pour vtracer."""
    from PIL import Image, ImageDraw
    import random
    img = Image.new("RGB", size, (255, 255, 255))
    d = ImageDraw.Draw(img)
    random.seed(42)
    for _ in range(2000):
        x, y = random.randint(0, size[0]), random.randint(0, size[1])
        r = random.randint(1, 4)
        color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
        d.ellipse([x - r, y - r, x + r, y + r], fill=color)
    img.save(path)


def make_corrupt_png(path: Path):
    make_flat_logo(path)
    data = path.read_bytes()
    path.write_bytes(data[: len(data) // 2])


def make_fake_extension(path: Path):
    path.write_text("ceci n'est pas une image, juste du texte", encoding="utf-8")


# ────────────────────────────────────────────────────────────────────────────
# Cas de test
# ────────────────────────────────────────────────────────────────────────────

class Cases:
    def __init__(self, out: Path):
        self.out = out
        from vectorpop.vectorizer import vectorize, VectorParams, PRESETS
        self.vectorize = vectorize
        self.VectorParams = VectorParams
        self.PRESETS = PRESETS

    def _run(self, src, params=None, reduce_colors=True, timeout=60, out_name="out.svg"):
        params = params or self.VectorParams()
        dst = self.out / out_name
        ok = with_timeout(lambda: self.vectorize(src, dst, params, reduce_colors), timeout)
        return dst

    # -- 1. Fichiers d'entrée -----------------------------------------------

    def case_image_corrompue(self):
        f = self.out / "corrompue.png"
        make_corrupt_png(f)
        try:
            dst = self._run(f, out_name="corrompue_out.svg", timeout=30)
        except TimeoutError as e:
            return "TIMEOUT", str(e)
        except Exception as e:
            return "PASS", f"image corrompue rejetée proprement ({type(e).__name__}: {str(e)[:120]})"
        if dst.exists():
            return "PASS", "image tronquée quand même vectorisée (PIL tolérant), pas de crash"
        return "FAIL", "aucune exception, mais aucun SVG produit non plus (échec silencieux)"

    def case_fichier_texte_renomme_png(self):
        f = self.out / "faux.png"
        make_fake_extension(f)
        try:
            self._run(f, out_name="faux_out.svg", timeout=15)
        except TimeoutError as e:
            return "TIMEOUT", str(e)
        except Exception as e:
            return "PASS", f"fichier texte renommé .png rejeté proprement ({type(e).__name__})"
        return "FAIL", "aucune exception levée sur un fichier texte renommé .png"

    def case_image_1x1(self):
        f = self.out / "tiny.png"
        make_tiny_image(f)
        try:
            dst = self._run(f, out_name="tiny_out.svg", timeout=20)
        except TimeoutError as e:
            return "TIMEOUT", str(e)
        except Exception as e:
            return "CRASH", f"exception non gérée sur image 1x1: {e}"
        return "PASS", f"image 1x1 vectorisée sans crash (svg existe: {dst.exists()})"

    def case_image_enorme_4000px(self):
        f = self.out / "enorme.png"
        t0 = time.time()
        make_huge_image(f, (4000, 4000))
        try:
            dst = self._run(f, out_name="enorme_out.svg", timeout=180)
        except TimeoutError as e:
            return "TIMEOUT", f"vectorisation d'une image 4000x4000 trop lente: {e}"
        except Exception as e:
            return "CRASH", f"exception non gérée sur image 4000x4000: {e}"
        elapsed = time.time() - t0
        size_kb = dst.stat().st_size / 1024 if dst.exists() else 0
        return "PASS", f"4000x4000 traité en {elapsed:.1f}s, SVG de {size_kb:.0f} Ko"

    # -- Formats / couleurs ---------------------------------------------------

    def case_image_transparence_partielle(self):
        f = self.out / "alpha_partiel.png"
        make_partial_alpha(f)
        try:
            dst = self._run(f, out_name="alpha_out.svg", timeout=30)
        except TimeoutError as e:
            return "TIMEOUT", str(e)
        except Exception as e:
            return "CRASH", f"exception non gérée sur alpha dégradé: {e}"
        return "PASS", f"transparence partielle/dégradée gérée sans crash (svg={dst.exists()})"

    def case_image_niveaux_de_gris(self):
        f = self.out / "gris.png"
        make_grayscale(f)
        try:
            dst = self._run(f, out_name="gris_out.svg", timeout=30)
        except TimeoutError as e:
            return "TIMEOUT", str(e)
        except Exception as e:
            return "CRASH", f"exception non gérée sur image niveaux de gris: {e}"
        return "PASS", f"niveaux de gris géré sans crash (svg={dst.exists()})"

    def case_image_palette_indexee(self):
        f = self.out / "palette.png"
        make_indexed_palette(f)
        try:
            dst = self._run(f, out_name="palette_out.svg", timeout=30)
        except TimeoutError as e:
            return "TIMEOUT", str(e)
        except Exception as e:
            return "CRASH", f"exception non gérée sur palette indexée: {e}"
        return "PASS", f"palette indexée (mode P) gérée sans crash (svg={dst.exists()})"

    def case_image_unie(self):
        f = self.out / "unie.png"
        make_solid_color(f)
        try:
            dst = self._run(f, out_name="unie_out.svg", timeout=30)
        except TimeoutError as e:
            return "TIMEOUT", str(e)
        except Exception as e:
            return "CRASH", f"exception non gérée sur image unie: {e}"
        if not dst.exists() or dst.stat().st_size == 0:
            return "FAIL", "aucun SVG produit pour une image unie (cas simple)"
        return "PASS", f"image 100% unie vectorisée sans crash ({dst.stat().st_size} octets)"

    def case_bruit_aleatoire(self):
        f = self.out / "bruit.png"
        make_random_noise(f)
        try:
            dst = self._run(f, out_name="bruit_out.svg", timeout=60)
        except TimeoutError as e:
            return "TIMEOUT", f"bruit aléatoire pur fait exploser le temps de traitement: {e}"
        except Exception as e:
            return "CRASH", f"exception non gérée sur bruit aléatoire: {e}"
        size_kb = dst.stat().st_size / 1024 if dst.exists() else 0
        if size_kb > 5000:
            return "FAIL", f"bruit aléatoire produit un SVG énorme ({size_kb:.0f} Ko) — risque de plantage app réelle"
        return "PASS", f"bruit aléatoire (pire cas, pas de formes) géré, SVG {size_kb:.0f} Ko"

    def case_formats_varies_jpeg_bmp_gif(self):
        from PIL import Image
        failures = []
        base = self.out / "base_pour_formats.png"
        make_flat_logo(base)
        img = Image.open(base).convert("RGB")
        for ext, fmt in [(".jpg", "JPEG"), (".bmp", "BMP"), (".gif", "GIF")]:
            p = self.out / f"format_test{ext}"
            img.save(p, fmt)
            try:
                self._run(p, out_name=f"format_test_out{ext}.svg", timeout=30)
            except TimeoutError as e:
                failures.append(f"{ext}: timeout ({e})")
            except Exception as e:
                failures.append(f"{ext}: exception non gérée ({e})")
        if failures:
            return "FAIL", "; ".join(failures)
        return "PASS", "JPEG/BMP/GIF traités sans problème"

    # -- Paramètres aux extrêmes -----------------------------------------------

    def case_parametres_extremes_speckle_0(self):
        f = self.out / "logo_speckle.png"
        make_complex_photo_like(f, (200, 200))
        params = self.VectorParams(filter_speckle=0, color_precision=8)
        try:
            dst = self._run(f, params, out_name="speckle0_out.svg", timeout=60)
        except TimeoutError as e:
            return "TIMEOUT", f"filter_speckle=0 sur image complexe trop lent: {e}"
        except Exception as e:
            return "CRASH", f"exception non gérée avec filter_speckle=0: {e}"
        size_kb = dst.stat().st_size / 1024 if dst.exists() else 0
        return "PASS", f"filter_speckle=0 (aucun filtrage) géré, SVG {size_kb:.0f} Ko"

    def case_parametres_extremes_speckle_max(self):
        f = self.out / "logo_speckle_max.png"
        make_flat_logo(f)
        params = self.VectorParams(filter_speckle=20, color_precision=1)
        try:
            dst = self._run(f, params, out_name="speckle_max_out.svg", timeout=30)
        except TimeoutError as e:
            return "TIMEOUT", str(e)
        except Exception as e:
            return "CRASH", f"exception non gérée avec filter_speckle=20/color_precision=1: {e}"
        return "PASS", f"filtrage maximal + 1 seule couleur géré sans crash (svg={dst.exists()})"

    def case_mode_binary_bw(self):
        f = self.out / "logo_bw.png"
        make_flat_logo(f)
        try:
            dst = self._run(f, self.PRESETS["bw"], out_name="bw_out.svg", timeout=30)
        except TimeoutError as e:
            return "TIMEOUT", str(e)
        except Exception as e:
            return "CRASH", f"exception non gérée en mode binary (preset bw): {e}"
        return "PASS", f"preset noir&blanc géré sans crash (svg={dst.exists()})"

    # -- Détourage / fond -------------------------------------------------------

    def case_remove_background_tolerance_extremes(self):
        f = self.out / "logo_fond.png"
        from PIL import Image, ImageDraw
        img = Image.new("RGBA", (200, 200), (255, 255, 255, 255))
        d = ImageDraw.Draw(img)
        d.ellipse([50, 50, 150, 150], fill=(10, 10, 200, 255))
        img.save(f)
        failures = []
        for tol in (0, 120):
            params = self.VectorParams(remove_background=True, bg_tolerance=tol)
            try:
                self._run(f, params, out_name=f"fond_tol{tol}_out.svg", timeout=30)
            except TimeoutError as e:
                failures.append(f"tol={tol}: timeout ({e})")
            except Exception as e:
                failures.append(f"tol={tol}: exception non gérée ({e})")
        if failures:
            return "FAIL", "; ".join(failures)
        return "PASS", "remove_background aux tolérances extrêmes (0 et 120) sans crash"

    # -- Export / sortie ----------------------------------------------------------

    def case_sortie_dossier_invalide(self):
        f = self.out / "logo_sortie_invalide.png"
        make_flat_logo(f)
        bogus_dst = self.out / "dossier_qui_n_existe_pas" / "sortie.svg"
        try:
            self.vectorize(f, bogus_dst, self.VectorParams())
        except Exception as e:
            return "PASS", f"échec propre remonté en exception Python normale ({type(e).__name__})"
        except BaseException as e:
            return "FAIL", (
                f"vtracer lève un {type(e).__name__} (panic Rust via pyo3), qui "
                f"N'HÉRITE PAS de Exception — donc invisible à tout 'except Exception' "
                f"du code de l'app. Vérifié: vectorpop/core/workers.py utilise "
                f"'except Exception' autour de tous ses appels à vectorize() "
                f"(lignes 39, 62, 105, 143, 164) — ce panic les traverserait sans être "
                f"catché, tuant silencieusement le thread worker (barre de progression "
                f"bloquée indéfiniment côté UI) au lieu d'afficher une erreur propre. "
                f"Cas réel : dossier de sortie sur un lecteur réseau débranché en cours "
                f"d'export, ou dossier supprimé entre la sélection et l'export.")
        return "FAIL", "aucune exception levée alors que le dossier de sortie n'existe pas"

    def case_nom_fichier_caracteres_speciaux(self):
        f = self.out / "logo éàü 中文 🎨 (2).png"
        make_flat_logo(f)
        if not f.exists():
            return "FAIL", "PIL n'a pas pu écrire ce nom de fichier"
        try:
            dst = self._run(f, out_name="sortie_speciale.svg", timeout=30)
        except TimeoutError as e:
            return "TIMEOUT", str(e)
        except Exception as e:
            return "CRASH", f"exception non gérée sur nom de fichier spécial: {e}"
        return "PASS", f"nom de fichier avec accents/emoji géré sans crash (svg={dst.exists()})"

    def case_batch_10_images_memoire(self):
        """Traite 10 images à la suite avec la même instance pour repérer une
        éventuelle dégradation de temps (fuite mémoire naïve)."""
        f = self.out / "batch_source.png"
        make_flat_logo(f)
        durations = []
        for i in range(10):
            t0 = time.time()
            try:
                self._run(f, out_name=f"batch_{i}.svg", timeout=30)
            except Exception as e:
                return "CRASH", f"exception à l'itération {i}: {e}"
            durations.append(time.time() - t0)
        first_half = sum(durations[:5]) / 5
        second_half = sum(durations[5:]) / 5
        if second_half > first_half * 3 and second_half > 1:
            return "FAIL", (f"ralentissement suspect sur 10 traitements successifs "
                             f"({first_half:.2f}s -> {second_half:.2f}s en moyenne)")
        return "PASS", f"10 traitements successifs stables ({first_half:.2f}s -> {second_half:.2f}s)"


ALL_CASES = [
    ("Fichiers d'entrée", "image_corrompue"),
    ("Fichiers d'entrée", "fichier_texte_renomme_png"),
    ("Fichiers d'entrée", "image_1x1"),
    ("Fichiers d'entrée", "image_enorme_4000px"),
    ("Formats / couleurs", "image_transparence_partielle"),
    ("Formats / couleurs", "image_niveaux_de_gris"),
    ("Formats / couleurs", "image_palette_indexee"),
    ("Formats / couleurs", "image_unie"),
    ("Formats / couleurs", "bruit_aleatoire"),
    ("Formats / couleurs", "formats_varies_jpeg_bmp_gif"),
    ("Paramètres extrêmes", "parametres_extremes_speckle_0"),
    ("Paramètres extrêmes", "parametres_extremes_speckle_max"),
    ("Paramètres extrêmes", "mode_binary_bw"),
    ("Détourage / fond", "remove_background_tolerance_extremes"),
    ("Export / sortie", "sortie_dossier_invalide"),
    ("Export / sortie", "nom_fichier_caracteres_speciaux"),
    ("Batch", "batch_10_images_memoire"),
]


def resolve_target_os(requested: str):
    if requested == "android":
        print("[INFO] Cible Android choisie.")
        print("       VectorPop Android est un portage Flutter distinct (vtracer via FFI) — "
              "cet agent teste le moteur Python desktop, pas le code Android.")
        adb = shutil.which("adb")
        if adb:
            try:
                r = subprocess.run(["adb", "devices"], capture_output=True, text=True, timeout=10)
                lines = [l for l in r.stdout.splitlines()[1:] if l.strip()]
                print(f"       adb: {len(lines)} appareil(s) détecté(s)" if lines else "       Aucun appareil adb connecté.")
            except Exception as e:
                print(f"       (adb présent mais injoignable: {e})")
        else:
            print("       adb non trouvé — installe Android Platform-Tools pour suivre les logs.")
        print("       → Checklist manuelle Android : voir PLAN_STRESS_TEST.md.")
        return None
    if requested not in ("windows", "linux"):
        print(f"[FATAL] OS cible inconnu: {requested!r}")
        sys.exit(2)
    if requested != HOST_OS:
        print(f"[ATTENTION] Cible={requested}, hôte={HOST_OS}. Le moteur Python (vtracer/Pillow) "
              f"est portable, ce test reste donc valide pour la logique, mais ne remplace pas "
              f"un vrai test sur {requested} (AppImage, dépendances système).")
    return requested


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                      formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--os", dest="target_os", default="windows",
                         choices=["windows", "linux", "android"])
    parser.add_argument("--keep-temp", action="store_true")
    parser.add_argument("--only", type=str, default=None)
    parser.add_argument("--report", type=str, default=None)
    args = parser.parse_args()

    effective_os = resolve_target_os(args.target_os)
    if effective_os is None:
        sys.exit(0)

    report_path = Path(args.report) if args.report else HERE / f"stress_test_report_{effective_os}.json"

    try:
        import vtracer, PIL, numpy  # noqa
    except Exception as e:
        print(f"[FATAL] dépendance manquante ({e}).")
        print("        Relance avec l'interpréteur du venv du projet, ex:")
        print("        .venv\\Scripts\\python.exe stress_test_agent.py")
        sys.exit(1)

    tmp_root = Path(tempfile.mkdtemp(prefix=f"vectorpop_stress_{effective_os}_"))
    print(f"Dossier temporaire : {tmp_root}")
    print(f"Lancement du stress-test VectorPop — {datetime.now().isoformat(timespec='seconds')}\n")

    cases = Cases(tmp_root)
    only = set(x.strip() for x in args.only.split(",")) if args.only else None
    report = Report(started_at=datetime.now().isoformat())

    for category, case_name in ALL_CASES:
        if only and case_name not in only:
            continue
        method = getattr(cases, f"case_{case_name}", None)
        if method is None:
            report.add(CaseResult(case_name, category, "SKIP", "cas non implémenté"))
            continue
        t0 = time.time()
        try:
            status, detail = method()
        except TimeoutError as e:
            status, detail = "TIMEOUT", str(e)
        except Exception:
            status, detail = "CRASH", "voir traceback dans le rapport JSON"
            tb = traceback.format_exc()
            report.add(CaseResult(case_name, category, status, detail, time.time() - t0, tb))
            continue
        report.add(CaseResult(case_name, category, status, detail, time.time() - t0))

    counts = report.summary()
    print("\n" + "=" * 70)
    print("Résumé :", ", ".join(f"{k}={v}" for k, v in counts.items()))
    print("=" * 70)

    report_path.write_text(json.dumps({
        "started_at": report.started_at,
        "target_os": effective_os,
        "host_os": HOST_OS,
        "summary": counts,
        "cases": [vars(c) for c in report.cases],
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Rapport détaillé : {report_path}")

    if not args.keep_temp:
        shutil.rmtree(tmp_root, ignore_errors=True)
    else:
        print(f"Fichiers de test conservés dans : {tmp_root}")

    failing = counts.get("FAIL", 0) + counts.get("CRASH", 0) + counts.get("TIMEOUT", 0)
    sys.exit(1 if failing else 0)


if __name__ == "__main__":
    main()
