"""Télémétrie anonyme : PostHog (funnel produit) + GA4 (paywall, historique).

Porté du système éprouvé de VoxCut/InOneShot. Aucune donnée personnelle : un
seul UUID aléatoire persisté localement, jamais lié à l'email ou à la clé de
licence. Échoue toujours en silence (hors ligne, pare-feu...) pour ne jamais
impacter l'UI.

PostHog : même projet EU que les apps Android du studio. Chaque event porte
`app: "vectorpop_desktop"` -- sans ce tag, les events se mélangent avec ceux
de VoxCut/InOneShot/VectorPop Android dans le projet partagé.

Désactivé quand l'app tourne depuis les sources (dev), sauf si
VECTORPOP_ANALYTICS=1, pour ne pas polluer les chiffres de prod.
"""

import json
import os
import platform
import sys
import threading
import uuid

from . import __version__
from .license import _get_data_dir

try:
    import urllib.request as _urllib

    _NET_OK = True
except Exception:
    _NET_OK = False

_TRACK_URL = "https://vectorpop.fr/api/track"
# Clé d'ingestion PostHog (phc_) : publique par conception, embarquée dans les
# clients, pas un secret. Appel HTTP direct (pas le SDK pip "posthog") pour
# eviter une dependance de plus dans le build PyInstaller.
_POSTHOG_HOST = "https://eu.i.posthog.com"
_POSTHOG_KEY = "phc_yfH9dmW8EbueysuiXcL8yAam7yATkfFCfguT3e63bEcq"
_APP_TAG = "vectorpop_desktop"

_ENABLED = getattr(sys, "frozen", False) or os.environ.get("VECTORPOP_ANALYTICS") == "1"

# Contexte commun (langue, statut Pro), renseigné par la fenêtre principale.
_ctx: dict = {"lang": None, "is_pro": None}


def set_context(lang: str | None = None, is_pro=None) -> None:
    """`is_pro` : booléen ou callable (évalué à chaque event)."""
    if lang is not None:
        _ctx["lang"] = lang
    if is_pro is not None:
        _ctx["is_pro"] = is_pro


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


def channel() -> str:
    """Canal de distribution, déduit de l'emplacement de l'exécutable."""
    if not getattr(sys, "frozen", False):
        return "source"
    if sys.platform.startswith("linux"):
        if os.environ.get("SNAP"):
            return "snap"
        if os.environ.get("APPIMAGE"):
            return "appimage"
        return "tar"
    exe = sys.executable.replace("/", "\\").lower()
    if "\\windowsapps\\" in exe:
        return "msix"
    if "\\program files" in exe:
        return "exe"  # installeur Inno Setup ({autopf})
    return "portable"


def _os_name() -> str:
    if sys.platform.startswith("win"):
        return "windows"
    if sys.platform.startswith("linux"):
        return "linux"
    return sys.platform


def _base_props() -> dict:
    is_pro = _ctx["is_pro"]
    if callable(is_pro):
        try:
            is_pro = bool(is_pro())
        except Exception:
            is_pro = None
    return {
        "app": _APP_TAG,
        "app_version": __version__,
        "os": _os_name(),
        "os_release": platform.release(),
        "channel": channel(),
        "lang": _ctx["lang"],
        "is_pro": is_pro,
    }


def _post(url: str, payload: dict, timeout: float) -> None:
    try:
        req = _urllib.Request(
            url,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json", "Accept": "application/json"},
        )
        _urllib.urlopen(req, timeout=timeout).close()
    except Exception:
        pass  # best-effort uniquement


def _posthog_payload(event: str, props: dict | None) -> dict:
    # Les propriétés de base sont calculées dans le thread appelant (UI) : le
    # statut Pro et la langue sont ceux du moment de l'action.
    return {
        "api_key": _POSTHOG_KEY,
        "event": event,
        "distinct_id": _client_id(),
        "properties": {**_base_props(), **(props or {})},
    }


def capture(event: str, props: dict | None = None) -> None:
    """Event PostHog en arrière-plan. Ne bloque jamais l'UI."""
    if not (_ENABLED and _NET_OK):
        return
    payload = _posthog_payload(event, props)
    threading.Thread(
        target=_post, args=(f"{_POSTHOG_HOST}/capture/", payload, 5), daemon=True
    ).start()


def capture_sync(event: str, props: dict | None = None, timeout: float = 1.5) -> None:
    """Variante bloquante (max `timeout` s) pour les events critiques émis juste
    avant que l'utilisateur quitte l'app (ex. clic « Acheter » qui ouvre le
    navigateur) : un thread daemon serait tué à la fermeture et l'event perdu
    (bug constaté sur VoxCut PC : 0 clic enregistré pour 36 paywalls vus)."""
    if not (_ENABLED and _NET_OK):
        return
    _post(f"{_POSTHOG_HOST}/capture/", _posthog_payload(event, props), timeout)


def track_event(event: str, category: str = "other") -> None:
    """Event paywall historique vers GA4 (vectorpop.fr/api/track), gardé en
    parallèle de PostHog le temps de valider ce dernier."""
    if not (_ENABLED and _NET_OK):
        return
    payload = {"event": event, "category": category, "client_id": _client_id()}
    threading.Thread(target=_post, args=(_TRACK_URL, payload, 5), daemon=True).start()
