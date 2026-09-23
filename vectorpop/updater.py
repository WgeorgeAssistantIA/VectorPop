"""Detection de mise a jour (cahier des charges V2 §2.3, porte de VoxCut PC).

Sans elle, les utilisateurs de l'installeur, du portable et de Linux ne
sauraient jamais qu'une version corrective existe : seuls le MSIX (Store) et
le Snap se mettent a jour tout seuls. Simple lecture d'un fichier public du
site (aucune donnee envoyee), en tache de fond, echec toujours silencieux.
"""

from __future__ import annotations

import json
import re

from PySide6.QtCore import QThread, Signal

from . import __version__
from .license import WEBSITE_URL

try:
    import urllib.request as _urllib

    _NET_OK = True
except Exception:  # noqa: BLE001
    _NET_OK = False

VERSION_URL = f"{WEBSITE_URL}/version.json"
DOWNLOAD_URL = f"{WEBSITE_URL}/"
# Ces canaux ont deja leur propre mise a jour (et "source" = developpement).
_SELF_UPDATING = {"msix", "snap", "source"}


def parse_version(v: str) -> tuple[int, ...]:
    """ "2.0.10" -> (2, 0, 10). Ignore un suffixe ("2.1.0-beta" -> (2, 1, 0))."""
    nums = []
    for part in str(v).strip().split("."):
        m = re.match(r"\d+", part)
        if not m:
            break
        nums.append(int(m.group(0)))
    return tuple(nums)


def is_newer(remote: str, local: str = __version__) -> bool:
    r, l = parse_version(remote), parse_version(local)
    if not r:
        return False
    n = max(len(r), len(l))
    return r + (0,) * (n - len(r)) > l + (0,) * (n - len(l))


def should_check(channel: str) -> bool:
    return channel not in _SELF_UPDATING


def fetch_latest(timeout: float = 5.0) -> dict | None:
    if not _NET_OK:
        return None
    try:
        req = _urllib.Request(VERSION_URL, headers={"Accept": "application/json"})
        with _urllib.urlopen(req, timeout=timeout) as r:
            data = json.loads(r.read().decode("utf-8"))
        return data if isinstance(data, dict) and data.get("version") else None
    except Exception:  # noqa: BLE001 - hors ligne, site indisponible...
        return None


class UpdateCheckWorker(QThread):
    found = Signal(dict)  # {"version", "url", ...} seulement si plus recente

    def run(self):
        data = fetch_latest()
        if data and is_newer(data["version"]):
            self.found.emit(data)
