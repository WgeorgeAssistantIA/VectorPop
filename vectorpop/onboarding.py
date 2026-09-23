"""Versionnage de l'onboarding (cahier des charges V2 §1.4).

Separe de license.py : ne depend d'aucune donnee de licence/quota, juste du
dossier de donnees utilisateur partage (`_get_data_dir()`).
"""

from __future__ import annotations

import json

from .license import _get_data_dir

# Incrementer force TOUS les utilisateurs existants a revoir l'onboarding au
# prochain lancement (ex. nouvel ecran ajoute, changement de freemium majeur).
ONBOARDING_VERSION = 1


def _path():
    return _get_data_dir() / "onboarding.json"


def seen_version() -> int:
    """Derniere version de l'onboarding vue par cet utilisateur (0 = jamais)."""
    try:
        with open(_path(), encoding="utf-8") as f:
            data = json.load(f)
        return int(data.get("seen_version", 0))
    except Exception:  # noqa: BLE001
        return 0


def mark_seen(version: int = ONBOARDING_VERSION) -> None:
    try:
        with open(_path(), "w", encoding="utf-8") as f:
            json.dump({"seen_version": version}, f)
    except OSError:
        pass


def should_show() -> bool:
    return seen_version() < ONBOARDING_VERSION
