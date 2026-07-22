"""Module IA telechargeable a la demande (detourage IA / rembg).

Le build PyInstaller de VectorPop est en mode ONEDIR (cf. VectorPop.spec) et
n'embarque pas `pip` : impossible d'installer rembg/onnxruntime apres coup
avec un `pip install` classique dans l'exe distribue. A la place, ce module
telecharge une archive pre-construite (memes wheels que celles utilisees en
dev, cf. requirements-ai.txt) et l'ajoute dynamiquement a `sys.path` -- ni
plus ni moins qu'un plugin charge a la demande.

Decision produit (William, 2026-07-18) : ne pas alourdir l'installeur de
base avec ~120 Mo de dependances IA (rembg + onnxruntime + pymatting/numba,
necessaires meme sans alpha matting car importes en dur par rembg.bg) que
la majorite des utilisateurs gratuits ne toucheront jamais. Le telechargement
se declenche uniquement quand un utilisateur Pro active le detourage IA.

Zero dependance Qt : ce module est testable seul (cf. license.py).
"""

from __future__ import annotations

import shutil
import sys
import urllib.error
import urllib.request
import zipfile
from pathlib import Path

from .license import data_dir

# A incrementer si le contenu de l'archive change (nouvelle version de rembg,
# nouvelle plateforme...) : force un retelechargement au prochain demarrage.
AI_MODULE_VERSION = "1"

AI_MODULE_URL = (
    "https://github.com/WgeorgeAssistantIA/VectorPop/releases/download/"
    f"ai-module-v{AI_MODULE_VERSION}/vectorpop-ai-module-win_amd64-py312.zip"
)

_MARKER_NAME = ".version"
_CHUNK = 262_144  # 256 Ko


class DownloadCancelled(Exception):
    """Leve quand `should_cancel()` renvoie True pendant le telechargement."""


def _module_dir() -> Path:
    return data_dir() / "ai_module"


def is_installed() -> bool:
    """True si le module IA est deja telecharge et a jour.

    Egalement vrai si rembg est deja importable dans l'interpreteur courant
    (cas du venv de dev `.venv-ai`, qui l'installe directement via pip) :
    inutile de retelecharger une archive dediee au build PyInstaller dans
    ce cas.
    """
    marker = _module_dir() / _MARKER_NAME
    try:
        if marker.read_text(encoding="utf-8").strip() == AI_MODULE_VERSION:
            return True
    except OSError:
        pass
    try:
        import rembg  # noqa: F401, PLC0415 - test de presence volontaire
    except ImportError:
        return False
    return True


def ensure_on_path() -> None:
    """A appeler au demarrage : si le module est deja installe, le rendre importable.

    Sans effet si absent (l'appelant reste alors avec rembg indisponible,
    et pourra declencher `download()` plus tard).
    """
    if not is_installed():
        return
    d = str(_module_dir())
    if d not in sys.path:
        sys.path.insert(0, d)


def download(progress=None, should_cancel=None) -> None:
    """Telecharge et installe le module IA. Bloquant : a appeler hors du thread UI.

    `progress(done_bytes, total_bytes)` est appele periodiquement (`total_bytes`
    vaut 0 si le serveur n'annonce pas Content-Length). `should_cancel()` est
    consulte entre chaque bloc telecharge ; s'il renvoie True, leve
    `DownloadCancelled` sans rien laisser d'installe.
    """
    dest_dir = _module_dir()
    tmp_zip = dest_dir.parent / "ai_module.zip.tmp"
    dest_dir.parent.mkdir(parents=True, exist_ok=True)
    try:
        req = urllib.request.Request(AI_MODULE_URL, headers={"User-Agent": "VectorPop"})
        with urllib.request.urlopen(req, timeout=30) as r, open(tmp_zip, "wb") as f:
            total = int(r.headers.get("Content-Length", 0) or 0)
            done = 0
            while True:
                if should_cancel is not None and should_cancel():
                    raise DownloadCancelled()
                chunk = r.read(_CHUNK)
                if not chunk:
                    break
                f.write(chunk)
                done += len(chunk)
                if progress:
                    progress(done, total)

        if dest_dir.exists():
            shutil.rmtree(dest_dir)
        dest_dir.mkdir(parents=True)
        with zipfile.ZipFile(tmp_zip) as z:
            z.extractall(dest_dir)
        (dest_dir / _MARKER_NAME).write_text(AI_MODULE_VERSION, encoding="utf-8")
    except BaseException:
        # Echec ou annulation en cours d'extraction : purge les fichiers
        # partiels plutot que de les laisser trainer (le marqueur n'est
        # ecrit qu'a la toute fin, donc is_installed() les ignore de toute
        # facon, mais autant ne pas polluer le disque).
        shutil.rmtree(dest_dir, ignore_errors=True)
        raise
    finally:
        tmp_zip.unlink(missing_ok=True)
