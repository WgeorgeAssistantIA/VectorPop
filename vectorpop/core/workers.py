import os
import tempfile
from pathlib import Path

from PySide6.QtCore import QThread, Signal

from .. import ai_module, ai_upscale
from ..export import add_svg_background, resize_svg, svg_to_pdf, svg_to_png
from ..gradients import remove_shape_at
from ..license import LicenseManager
from ..optimize import optimize_svg
from ..vectorizer import VectorParams, auto_refine, vectorize
from .recipes import _postprocess_svg


class VectorizeWorker(QThread):
    """Vectorise hors du thread UI : l'interface reste fluide pendant le calcul.

    Ne touche AUCUN widget Qt (interdit hors thread principal) : le worker se
    contente de produire le fichier SVG et signale le resultat par un signal.
    """

    done = Signal(str)  # chemin du SVG produit
    warning = Signal(str)  # post-traitement (dégradés/affinage) échoué, SVG brut gardé
    failed = Signal(str)  # message d'erreur

    def __init__(
        self,
        src: Path,
        out: Path,
        params: VectorParams,
        gradients: bool = False,
        refine: bool = False,
    ):
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


class AutoTuneWorker(QThread):
    """Cherche les meilleurs reglages par comparaison a l'image source (plus lent :
    plusieurs passes de vectorisation), au lieu de laisser l'utilisateur tatonner.
    """

    progress = Signal(int, int)  # (candidat en cours, total)
    done = Signal(str, float)  # (chemin SVG produit, ecart pixel restant 0-255)
    failed = Signal(str)

    def __init__(self, src: Path, out: Path, params: VectorParams):
        super().__init__()
        self._src, self._out, self._params = src, out, params

    def run(self):
        try:
            _, score = auto_refine(
                self._src,
                self._out,
                self._params,
                progress=lambda i, total, _s: self.progress.emit(i, total),
            )
            self.done.emit(str(self._out), score)
        except Exception as e:  # noqa: BLE001 - remonte tout au thread UI
            self.failed.emit(str(e))


class BatchWorker(QThread):
    """Traitement par lot 2.0 (cahier des charges V2 §2.6 A) : liste de fichiers
    quelconque (plus seulement un dossier), plusieurs formats en une passe,
    optimisation par image (auto_refine), fond uni optionnel, nommage avec
    suffixe et sous-dossier par format. Statut remonte image par image pour
    l'affichage et le « Relancer les echecs »."""

    item_started = Signal(int)  # index dans la liste du dialogue
    item_done = Signal(int, str, str)  # index, "ok" | "warning" | "error", message
    finished_all = Signal(int, int, int, bool)  # ok, erreurs, avertissements, annule

    def __init__(
        self,
        items: list[tuple[int, Path]],
        out_dir: Path,
        formats: tuple[str, ...],
        params: VectorParams,
        gradients: bool = False,
        refine: bool = False,
        png_size: int = 2048,
        svg_size: int = 0,
        autotune: bool = False,
        background: str | None = None,
        suffix: str = "",
        subdir_per_format: bool = False,
    ):
        super().__init__()
        self._items = items
        self._out_dir = Path(out_dir)
        self._formats = tuple(formats)
        self._params = params
        self._gradients, self._refine = gradients, refine
        self._png_size = png_size
        self._svg_size = svg_size  # 0 = taille d'origine (cf. export.resize_svg)
        self._autotune = autotune
        self._background = background
        self._suffix = suffix
        self._subdir = subdir_per_format
        self._used: set[Path] = set()
        self._cancel = False

    def cancel(self):
        self._cancel = True

    def run(self):
        ok = errors = warns = 0
        for idx, f in self._items:
            if self._cancel:
                break
            self.item_started.emit(idx)
            try:
                if self._process_one(f):
                    warns += 1
                    self.item_done.emit(idx, "warning", "")
                else:
                    self.item_done.emit(idx, "ok", "")
                ok += 1
            except Exception as e:  # noqa: BLE001 - on continue le lot malgre un raté
                errors += 1
                self.item_done.emit(idx, "error", str(e)[:200])
        self.finished_all.emit(ok, errors, warns, self._cancel)

    def out_path(self, src: Path, fmt: str) -> Path:
        """Chemin de sortie, sans jamais ecraser un autre fichier du MEME lot
        (deux images homonymes venant de sous-dossiers differents)."""
        folder = self._out_dir / fmt if self._subdir else self._out_dir
        folder.mkdir(parents=True, exist_ok=True)
        base = f"{src.stem}{self._suffix}"
        out = folder / f"{base}.{fmt}"
        n = 2
        while out in self._used:
            out = folder / f"{base}_{n}.{fmt}"
            n += 1
        self._used.add(out)
        return out

    def _process_one(self, f: Path) -> bool:
        """Traite une image. Renvoie True si un post-traitement a échoué (SVG brut gardé)."""
        fd, tmp = tempfile.mkstemp(suffix=".svg")
        os.close(fd)
        tmp = Path(tmp)
        try:
            if self._autotune:
                auto_refine(f, tmp, self._params)
            else:
                vectorize(f, tmp, self._params)
            warn = _postprocess_svg(tmp, f, self._gradients, self._refine)
            txt = optimize_svg(tmp.read_text(encoding="utf-8"))
            tmp.write_text(txt, encoding="utf-8")
            for fmt in self._formats:
                out = self.out_path(f, fmt)
                if fmt == "svg":
                    svg = txt
                    if self._background:
                        svg = add_svg_background(svg, self._background)
                    if self._svg_size:
                        svg = resize_svg(svg, self._svg_size)
                    out.write_text(svg, encoding="utf-8")
                elif fmt == "png":
                    svg_to_png(
                        tmp, out, max_px=self._png_size, background=self._background
                    )
                else:
                    svg_to_pdf(tmp, out, background=self._background)
            return warn is not None
        finally:
            tmp.unlink(missing_ok=True)


class DeleteWorker(QThread):
    """Retire un aplat (et son groupe contigu) hors du thread UI.

    Sur un gros SVG (beaucoup de tracés) le rendu de la carte de labels dans
    `remove_shape_at` peut prendre plusieurs secondes : sans thread, la fenêtre
    figeait pendant tout ce temps.
    """

    done = Signal(str, int)  # nouveau SVG, nb de tracés supprimés
    failed = Signal(str)

    def __init__(self, svg_text: str, x: float, y: float):
        super().__init__()
        self._svg_text, self._x, self._y = svg_text, x, y

    def run(self):
        try:
            new_svg, removed = remove_shape_at(
                self._svg_text, self._x, self._y, group=True, color_merge=18
            )
            self.done.emit(new_svg, removed)
        except Exception as e:  # noqa: BLE001
            self.failed.emit(str(e))


class LicenseRefreshWorker(QThread):
    """Revalide la licence aupres de Lemon Squeezy, hors du thread UI.

    Lance une fois au demarrage. Ne touche aucun widget : le seul effet est
    d'ecrire license.json (repousser la grace, ou effacer une licence revoquee).
    L'UI se remet a jour sur le signal `done`.
    """

    done = Signal()

    def __init__(self, lic: LicenseManager):
        super().__init__()
        self._lic = lic

    def run(self):
        try:
            self._lic.refresh_online()
        except Exception:  # noqa: BLE001
            pass  # une revalidation ratee ne doit jamais casser l'app
        self.done.emit()


class AIDownloadWorker(QThread):
    """Telecharge le module IA (rembg+onnxruntime) hors du thread UI.

    Le module pese ~120 Mo : sans thread, la fenetre gelerait pendant
    plusieurs dizaines de secondes voire minutes selon la connexion.
    """

    progress = Signal(int, int)  # (octets recus, total ; total vaut 0 si inconnu)
    done = Signal()
    failed = Signal(str)  # "cancelled" si annule par l'utilisateur

    def __init__(self):
        super().__init__()
        self._cancel = False

    def cancel(self):
        self._cancel = True

    def run(self):
        try:
            ai_module.download(
                progress=lambda d, t: self.progress.emit(d, t),
                should_cancel=lambda: self._cancel,
            )
            self.done.emit()
        except ai_module.DownloadCancelled:
            self.failed.emit("cancelled")
        except Exception as e:  # noqa: BLE001
            self.failed.emit(str(e))


class WeightsDownloadWorker(QThread):
    """Telecharge les poids de la finition IA (~5 Mo) hors du thread UI."""

    progress = Signal(int, int)  # (octets recus, total ; total vaut 0 si inconnu)
    done = Signal()
    failed = Signal(str)  # "cancelled" si annule par l'utilisateur

    def __init__(self):
        super().__init__()
        self._cancel = False

    def cancel(self):
        self._cancel = True

    def run(self):
        try:
            ai_upscale.download_weights(
                progress=lambda d, t: self.progress.emit(d, t),
                should_cancel=lambda: self._cancel,
            )
            self.done.emit()
        except ai_module.DownloadCancelled:
            self.failed.emit("cancelled")
        except Exception as e:  # noqa: BLE001
            self.failed.emit(str(e))
