"""Télémétrie minimale et anonyme du paywall (vu / cliqué), fire-and-forget.

Porté du système éprouvé de VoxCut/InOneShot. Aucune donnée personnelle : un
seul UUID aléatoire persisté localement, jamais lié à l'email ou à la clé de
licence. Échoue toujours en silence (hors ligne, pare-feu...) pour ne jamais
impacter l'UI.
"""
import json
import threading
import uuid

from .license import _get_data_dir

try:
    import urllib.request as _urllib
    _NET_OK = True
except Exception:
    _NET_OK = False

_TRACK_URL = "https://vectorpop.fr/api/track"


def _client_id() -> str:
    path = _get_data_dir() / "client_id.txt"
    try:
        cid = path.read_text(encoding="utf-8").strip()
        if cid:
            return cid
    except Exception:
        pass
    cid = str(uuid.uuid4())
    try:
        path.write_text(cid, encoding="utf-8")
    except Exception:
        pass
    return cid


def track_event(event: str, category: str = "other") -> None:
    """Envoie un événement paywall en arrière-plan. Ne bloque jamais l'UI et
    n'échoue jamais visiblement (réseau coupé, site down, etc.)."""
    if not _NET_OK:
        return

    def worker():
        try:
            data = json.dumps({
                "event":     event,
                "category":  category,
                "client_id": _client_id(),
            }).encode()
            req = _urllib.Request(_TRACK_URL, data=data,
                                  headers={"Content-Type": "application/json",
                                           "Accept": "application/json"})
            _urllib.urlopen(req, timeout=5).close()
        except Exception:
            pass  # best-effort uniquement

    threading.Thread(target=worker, daemon=True).start()
