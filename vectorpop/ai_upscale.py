"""Finition IA : upscale x4 de la source (Real-ESRGAN ONNX) avant le trace.

Principe : le modele de restauration a appris a quoi ressemble une
illustration propre. Passe sur l'image AVANT vectorisation, il redessine des
bords francs sans bruit ni flou ; vtracer, trace sur cette version agrandie
x4, sort des courbes nettement plus lisses. Particulierement efficace sur les
sources petites ou compressees (JPEG).

Meme logique de distribution que le detourage IA (cf. ai_module.py) :
- l'inference s'appuie sur onnxruntime, fourni par le module IA telechargeable
  (ai_module.download) -- import paresseux, message clair si absent ;
- les poids (.onnx) sont telecharges a la demande depuis une release GitHub
  du depot VectorPop, dans data_dir()/ai_upscale/.

Zero dependance Qt : testable seul.
"""

from __future__ import annotations

import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

from .license import data_dir

# Poids : conversions ONNX communautaires des modeles officiels Real-ESRGAN
# (licence BSD-3, depot xinntao/Real-ESRGAN). SHA256 verifies au telechargement.
# "fast" = realesr-general-x4v3 : 5 Mo, quelques secondes sur CPU, tres bon
# sur logos/illustrations. Seul modele expose pour l'instant ; le slot
# "quality" (RealESRGAN_x4plus.fp16, 34 Mo, ~10x plus lent) reste possible
# plus tard si des retours le demandent.
WEIGHTS_VERSION = "1"
WEIGHTS = {
    "fast": {
        "file": "realesr-general-x4v3.onnx",
        "sha256": "09b757accd747d7e423c1d352b3e8f23e77cc5742d04bae958d4eb8082b76fa4",
        "url": ("https://github.com/WgeorgeAssistantIA/VectorPop/releases/download/"
                f"ai-upscale-v{WEIGHTS_VERSION}/realesr-general-x4v3.onnx"),
    },
}

_CHUNK = 262_144


class WeightsMissing(RuntimeError):
    """Poids absents et telechargement refuse/impossible."""


def _weights_dir() -> Path:
    return data_dir() / "ai_upscale"


def weights_path(model: str = "fast") -> Path:
    return _weights_dir() / WEIGHTS[model]["file"]


def is_available(model: str = "fast") -> bool:
    """True si les poids sont presents ET onnxruntime importable."""
    if not weights_path(model).exists():
        return False
    try:
        import onnxruntime  # noqa: F401, PLC0415 - test de presence volontaire
    except ImportError:
        return False
    return True


def _sha256(path: Path) -> str:
    import hashlib  # noqa: PLC0415
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(_CHUNK), b""):
            h.update(chunk)
    return h.hexdigest()


def download_weights(model: str = "fast", progress=None, should_cancel=None) -> None:
    """Telecharge les poids. Bloquant : a appeler hors du thread UI.

    Signature de rappel identique a ai_module.download. Verifie le SHA256
    avant d'installer (un fichier corrompu/altere est rejete).
    """
    from .ai_module import DownloadCancelled  # noqa: PLC0415 - evite un import cycle
    spec = WEIGHTS[model]
    dest = weights_path(model)
    tmp = dest.with_suffix(".tmp")
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        req = urllib.request.Request(spec["url"], headers={"User-Agent": "VectorPop"})
        with urllib.request.urlopen(req, timeout=30) as r, open(tmp, "wb") as f:
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
        got = _sha256(tmp)
        if got != spec["sha256"]:
            raise WeightsMissing(
                f"Empreinte inattendue pour {spec['file']} : {got[:16]}…")
        tmp.replace(dest)
    except BaseException:
        tmp.unlink(missing_ok=True)
        raise


# Au-dela, le trace deviendrait enorme (temps + poids SVG) pour zero gain
# visuel : la finition IA vise les PETITES sources (logo recupere en 200-800 px,
# JPEG compresse). Une grande image propre n'en a pas besoin -- et le modele
# y ajoute meme du halo. On refuse plutot que de degrader l'experience.
MAX_SIDE_OUT = 4800


def upscale_x4(img: Image.Image, model: str = "fast",
               tile: int = 256, overlap: int = 12,
               progress=None, should_cancel=None) -> Image.Image:
    """Upscale x4 d'une image RGBA/RGB. Renvoie une image du meme mode.

    Decoupe en tuiles avec recouvrement : memoire bornee quel que soit le
    format d'entree, sans raccord visible (le recouvrement est rogne).
    L'alpha est agrandi separement (LANCZOS) : le seuillage du pipeline le
    re-binarise ensuite de toute facon. `progress(fait, total)` compte les
    tuiles ; `should_cancel()` est consulte entre chaque tuile.
    """
    if max(img.size) * 4 > MAX_SIDE_OUT:
        raise WeightsMissing(
            f"Image trop grande pour la finition IA (max {MAX_SIDE_OUT // 4} px de cote).")
    if not is_available(model):
        raise WeightsMissing(
            "La finition IA necessite le module IA et ses poids.\n"
            "Active-la depuis l'application pour les telecharger.")
    import onnxruntime as ort  # noqa: PLC0415 - import paresseux volontaire
    from .ai_module import DownloadCancelled  # noqa: PLC0415

    sess = ort.InferenceSession(str(weights_path(model)),
                                providers=["CPUExecutionProvider"])
    iname = sess.get_inputs()[0].name

    has_alpha = img.mode == "RGBA"
    alpha = img.getchannel("A") if has_alpha else None
    rgb = np.asarray(img.convert("RGB"), np.float32) / 255.0
    h, w = rgb.shape[:2]
    out = np.zeros((h * 4, w * 4, 3), np.float32)

    xs = list(range(0, w, tile))
    ys = list(range(0, h, tile))
    total = len(xs) * len(ys)
    done = 0
    for y0 in ys:
        for x0 in xs:
            if should_cancel is not None and should_cancel():
                raise DownloadCancelled()
            y1, x1 = min(h, y0 + tile), min(w, x0 + tile)
            py0, px0 = max(0, y0 - overlap), max(0, x0 - overlap)
            py1, px1 = min(h, y1 + overlap), min(w, x1 + overlap)
            x = rgb[py0:py1, px0:px1].transpose(2, 0, 1)[None]
            y = sess.run(None, {iname: x})[0][0].transpose(1, 2, 0)
            cy0, cx0 = (y0 - py0) * 4, (x0 - px0) * 4
            out[y0 * 4:y1 * 4, x0 * 4:x1 * 4] = \
                y[cy0:cy0 + (y1 - y0) * 4, cx0:cx0 + (x1 - x0) * 4]
            done += 1
            if progress:
                progress(done, total)

    out8 = np.clip(out * 255.0 + 0.5, 0, 255).astype(np.uint8)
    res = Image.fromarray(out8, "RGB")
    if has_alpha:
        big_a = alpha.resize((w * 4, h * 4), Image.LANCZOS)
        res = Image.merge("RGBA", (*res.split(), big_a))
    return res
