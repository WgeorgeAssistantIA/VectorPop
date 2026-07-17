"""VectorPop - licence Pro et quota du mode gratuit.

Meme mecanique que VoxCut (cle HMAC derivee de l'email + activation Lemon
Squeezy + grace offline), avec une difference importante : ici `is_pro()` est
appele a chaque export, a chaque bascule de bouton et a chaque rafraichissement
d'UI. Une validation reseau a chaque appel gelerait l'interface.

Donc :
  - `is_pro()` ne fait JAMAIS de reseau : il tranche sur l'etat local
    (cle + instance + grace offline) et retourne immediatement ;
  - `refresh_online()` fait le seul aller-retour Lemon Squeezy, une fois au
    demarrage, appele depuis un thread par l'UI (cf. app.LicenseRefreshWorker).

Zero dependance Qt : ce module est testable seul.
"""

from __future__ import annotations

import base64
import datetime
import hashlib
import hmac
import json
import os
import sys
import time
from pathlib import Path

try:
    import urllib.request as _urllib
    import urllib.error as _urlerr
    _NET_OK = True
except Exception:  # noqa: BLE001
    _NET_OK = False


# ── Configuration ─────────────────────────────────────────────────────────────

APP_NAME       = "VectorPop"
FREE_DAILY_MAX = 3          # exports/jour en gratuit (SVG uniquement)
PRO_PRICE_EUR  = 39

# Site. Le nom de domaine n'est pas encore depose : le site part d'abord sur
# une URL Vercel. Mettre a jour ces 3 constantes le jour du domaine.
WEBSITE_URL  = "https://vectorpop.fr"
UPGRADE_URL  = f"{WEBSITE_URL}/#pricing"
# Checkout Lemon Squeezy — a remplir apres creation du produit (cf. LS_STORE_ID).
# Tant qu'il est vide, les boutons d'achat renvoient vers UPGRADE_URL.
CHECKOUT_URL = ""


def buy_url() -> str:
    """Ou envoyer l'utilisateur qui veut acheter (checkout direct si connu)."""
    return CHECKOUT_URL or UPGRADE_URL

# Secret de signature des cles HMAC (mode dev / hors Lemon Squeezy).
_LICENSE_SECRET = b"VectorPop-2026-Kv3mRt-Secret"

# Lemon Squeezy — a remplir apres creation du produit VectorPop sur
# lemonsqueezy.com. Tant que LS_STORE_ID est vide, l'app est en mode dev :
# les cles HMAC generees par generate_license_key.py sont acceptees hors ligne.
LS_STORE_ID   = ""
LS_PRODUCT_ID = ""

_LS_API        = "https://api.lemonsqueezy.com/v1/licenses"
_GRACE_SECONDS = 14 * 86400   # grace offline : 14 jours depuis la derniere
                              # validation en ligne reussie


# ── Fonctionnalites reservees au Pro ──────────────────────────────────────────
# Cles stables, utilisees par l'UI pour savoir quoi verrouiller et quoi
# afficher dans le message d'upsell. Le gratuit garde : vectorisation
# illimitee, les 3 presets, les sliders, la suppression de fond par couleur,
# l'apercu live, et 3 exports SVG par jour.

FEAT_EXPORT_PDF   = "export_pdf"     # export PDF vectoriel
FEAT_EXPORT_PNG   = "export_png"     # export PNG haute definition
FEAT_BG_AI        = "bg_ai"          # detourage IA (rembg)
FEAT_AUTOTUNE     = "autotune"       # bouton "Optimiser" (recherche auto)
FEAT_DELETE_SHAPE = "delete_shape"   # suppression d'aplats au clic
FEAT_BATCH        = "batch"          # traitement par lot


def _get_data_dir() -> Path:
    """Dossier de donnees utilisateur, par plateforme (l'app vise Windows + Linux)."""
    if sys.platform == "win32":
        base = Path(os.environ.get("APPDATA", Path.home()))
    elif sys.platform == "darwin":
        base = Path.home() / "Library" / "Application Support"
    else:
        base = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share"))
    d = base / APP_NAME
    d.mkdir(parents=True, exist_ok=True)
    return d


# ── Cles HMAC (mode dev, hors Lemon Squeezy) ──────────────────────────────────

def generate_key(email: str) -> str:
    """Cle deterministe derivee de l'email. Meme algo que VoxCut."""
    digest = hmac.new(_LICENSE_SECRET, email.strip().lower().encode(),
                      hashlib.sha256).digest()
    b32 = base64.b32encode(digest[:15]).decode().rstrip("=")
    return "-".join(b32[i:i + 6] for i in range(0, 24, 6))


def _hmac_validate(email: str, key: str) -> bool:
    expected = generate_key(email).replace("-", "")
    provided = key.strip().upper().replace("-", "").replace(" ", "")
    return hmac.compare_digest(provided, expected)


# ── API Lemon Squeezy ─────────────────────────────────────────────────────────

def _ls_post(endpoint: str, payload: dict, timeout: int) -> dict | None:
    """POST JSON vers /licenses/<endpoint>.

    Retourne le corps decode, y compris sur 400/404 : Lemon Squeezy y met le
    vrai message d'erreur ({"activated": false, "error": "..."}), et urlopen
    leve une exception avant qu'on ait pu le lire. Retourne None si le reseau
    est injoignable (etat AMBIGU, a ne pas confondre avec un refus).
    """
    data = json.dumps(payload).encode()
    req = _urllib.Request(f"{_LS_API}/{endpoint}", data=data,
                          headers={"Content-Type": "application/json",
                                   "Accept": "application/json"})
    try:
        with _urllib.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except _urlerr.HTTPError as http_err:
        try:
            return json.loads(http_err.read())
        except Exception:  # noqa: BLE001
            return {"error": f"HTTP {http_err.code} — reponse Lemon Squeezy illisible"}
    except (TimeoutError, _urlerr.URLError):
        return None
    except Exception:  # noqa: BLE001
        return None


def _instance_name() -> str:
    return os.environ.get("COMPUTERNAME") or os.environ.get("HOSTNAME") or "PC"


def _ls_activate(license_key: str) -> tuple[str, str]:
    """Active une cle. Retourne (instance_id, "") ou ("", message_erreur).

    Timeout genereux (20 s) : une activation lente aboutit QUAND MEME cote
    Lemon Squeezy. Si on abandonne trop tot, le client croit avoir echoue,
    reessaie, et brule un siege a chaque tentative -> cle morte au bout de 3.
    """
    result = _ls_post("activate", {
        "license_key":   license_key.strip().upper(),
        "instance_name": _instance_name(),
    }, timeout=20)
    if result is None:
        return "", "timeout"
    if result.get("activated"):
        return result["instance"]["id"], ""
    return "", result.get("error", "Invalid license key.")


def _ls_validate_instance(license_key: str, instance_id: str) -> bool | None:
    """Valide cle + instance. Tri-etat :
       True  = Lemon Squeezy confirme ;
       False = refus explicite (cle revoquee, remboursee, instance supprimee) ;
       None  = injoignable -> l'appelant applique la grace offline plutot que
               de retirer le Pro pour un simple coup de reseau.
    """
    result = _ls_post("validate", {
        "license_key": license_key.strip().upper(),
        "instance_id": instance_id,
    }, timeout=10)
    if result is None:
        return None
    return bool(result.get("valid", False))


def _ls_deactivate(license_key: str, instance_id: str) -> None:
    """Libere un siege d'activation (best-effort, l'echec est sans consequence)."""
    _ls_post("deactivate", {
        "license_key": license_key.strip().upper(),
        "instance_id": instance_id,
    }, timeout=5)


# ── Licence ───────────────────────────────────────────────────────────────────

class LicenseManager:
    """Etat Pro de l'installation, persiste dans <data_dir>/license.json."""

    def __init__(self):
        self._path = _get_data_dir() / "license.json"
        self._data = self._load()

    def _load(self) -> dict:
        try:
            with open(self._path, encoding="utf-8") as f:
                return json.load(f)
        except Exception:  # noqa: BLE001
            return {}

    def _save(self) -> None:
        try:
            with open(self._path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2)
        except OSError:
            pass

    # -- lecture (jamais de reseau : appele a chaque clic) --

    def is_pro(self) -> bool:
        key = self._data.get("key", "")
        if not key:
            return False
        if not LS_STORE_ID:
            # Mode dev : la cle HMAC se verifie hors ligne.
            return _hmac_validate(self._data.get("email", ""), key)
        if not self._data.get("instance_id"):
            return False
        # Production : le Pro tient tant que la derniere validation en ligne
        # reussie a moins de 14 jours. refresh_online() repousse cette date ou
        # revoque la licence.
        return (time.time() - self._data.get("last_online", 0)) < _GRACE_SECONDS

    def email(self) -> str:
        return self._data.get("email", "")

    def has_key(self) -> bool:
        return bool(self._data.get("key"))

    def grace_days_left(self) -> int:
        """Jours de grace offline restants (pour prevenir avant l'expiration)."""
        if not LS_STORE_ID or not self._data.get("key"):
            return 0
        elapsed = time.time() - self._data.get("last_online", 0)
        return max(0, int((_GRACE_SECONDS - elapsed) // 86400))

    # -- ecriture (reseau autorise : appele depuis un thread ou un dialog) --

    def refresh_online(self) -> None:
        """Revalide la licence aupres de Lemon Squeezy. A appeler hors du thread UI.

        Silencieux par construction : en cas de reseau injoignable on ne touche
        a rien, la grace offline fait le travail.
        """
        if not LS_STORE_ID or not _NET_OK:
            return
        key         = self._data.get("key", "")
        instance_id = self._data.get("instance_id", "")
        if not key or not instance_id:
            return
        valid = _ls_validate_instance(key, instance_id)
        if valid is True:
            self._data["last_online"] = time.time()
            self._save()
        elif valid is False:
            # Refus explicite (remboursement, revocation) : on efface.
            self._data = {}
            self._save()

    def activate(self, email: str, key: str) -> tuple[bool, str]:
        """Active la licence. Retourne (succes, erreur) ; erreur == "" si succes."""
        if not LS_STORE_ID:
            if _hmac_validate(email, key):
                self._data = {"email": email.strip(), "key": key.strip().upper()}
                self._save()
                return True, ""
            return False, "invalid"
        if not _NET_OK:
            return False, "nonet"
        instance_id, error = _ls_activate(key)
        if instance_id:
            self._data = {
                "email":       email.strip(),
                "key":         key.strip().upper(),
                "instance_id": instance_id,
                "last_online": time.time(),
            }
            self._save()
            return True, ""
        return False, error

    def deactivate(self) -> None:
        """Rend le siege d'activation et repasse en gratuit."""
        key         = self._data.get("key", "")
        instance_id = self._data.get("instance_id", "")
        if LS_STORE_ID and key and instance_id:
            _ls_deactivate(key, instance_id)
        self._data = {}
        self._save()


# ── Quota du mode gratuit ─────────────────────────────────────────────────────

class UsageTracker:
    """Compteur d'exports du jour, persiste dans <data_dir>/usage.json.

    Un export = un fichier ecrit OU une copie du SVG dans le presse-papier
    (sans quoi la limite se contournerait par Ctrl+C).
    """

    def __init__(self):
        self._path = _get_data_dir() / "usage.json"
        self._data = self._load()
        self._reset_if_new_day()

    def _load(self) -> dict:
        try:
            with open(self._path, encoding="utf-8") as f:
                return json.load(f)
        except Exception:  # noqa: BLE001
            return {}

    def _save(self) -> None:
        try:
            with open(self._path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2)
        except OSError:
            pass

    @staticmethod
    def _today() -> str:
        return datetime.date.today().isoformat()

    def _reset_if_new_day(self) -> None:
        if self._data.get("date") != self._today():
            self._data = {"date": self._today(), "count": 0}
            self._save()

    def exports_today(self) -> int:
        self._reset_if_new_day()
        return self._data.get("count", 0)

    def remaining(self) -> int:
        return max(0, FREE_DAILY_MAX - self.exports_today())

    def can_export(self) -> bool:
        return self.exports_today() < FREE_DAILY_MAX

    def record_export(self) -> None:
        self._reset_if_new_day()
        self._data["count"] = self._data.get("count", 0) + 1
        self._save()
