# VectorPop Desktop V2 — Plan de vérification

Accompagne [CAHIER_DES_CHARGES_V2_DESKTOP.md](CAHIER_DES_CHARGES_V2_DESKTOP.md). Chaque lot de la V2 ajoute ses cas ici **avant** d'être considéré comme fini.

## Règles
- **Profil isolé** : les tests automatiques redirigent `%APPDATA%\VectorPop` (quota, licence, `client_id`) et les `QSettings` (registre) vers un dossier temporaire. Le profil réel de William ne doit jamais être modifié. Le script le vérifie en comparant l'empreinte de `usage.json` avant et après.
- **Pas de capture d'écran** pendant que William utilise le PC (incident du 23/09 sur InOneShot). L'UI est pilotée en `QT_QPA_PLATFORM=offscreen`, et on vérifie l'état des widgets, pas des pixels.
- **Réseau** : les tests UI interceptent les envois (aucun event de test dans PostHog). Un seul test réseau réel (V-NET) envoie un event `verification_ping` avec `test: true`, facile à exclure dans PostHog.
- Script : `scripts/verify_v2.py` (lancer avec `.venv\Scripts\python.exe scripts\verify_v2.py`). Code retour 0 = tout est vert.

## Lot 1 — Analytics PostHog (§1.1)

| ID | Vérification | Attendu | Auto |
|---|---|---|---|
| A1 | Lancement depuis les sources sans `VECTORPOP_ANALYTICS` | Aucun envoi (`_ENABLED = False`) | ✅ |
| A2 | Détection du canal | `source`, `exe` (Program Files), `msix` (WindowsApps), `portable`, `snap`, `appimage`, `tar` | ✅ |
| A3 | Propriétés communes sur **chaque** event | `app = vectorpop_desktop`, `app_version`, `os`, `channel`, `lang`, `is_pro`, même `distinct_id` | ✅ |
| A4 | Hors ligne / erreur réseau | Aucune exception remontée, `capture_sync` rend la main en ≤ `timeout` | ✅ |
| A5 | Ouverture de l'app | `app_opened` | ✅ |
| A6 | Image ouverte depuis un fichier | `image_picked` (source=file, width, height, size_kb, has_alpha) puis `vectorize_completed` (trigger=load, duration_ms, svg_size_kb) | ✅ |
| A7 | Aperçu live après un changement de slider | Vectorisation relancée, **aucun** `vectorize_completed` envoyé | ✅ |
| A8 | Bouton « Vectoriser » | `vectorize_completed` trigger=button | ✅ |
| A9 | Collage / exemple | `image_picked` source=paste ; source=demo + `sample_model_selected` | ✅ |
| A10 | Export SVG gratuit ×3 | 3 × `export_svg`, quota à 0 | ✅ |
| A11 | 4e export gratuit | `quota_reached` + `paywall_viewed` (source=quota), fichier **non** écrit | ✅ |
| A12 | Clic « Acheter » dans le paywall | `pro_buy_clicked` envoyé **de façon synchrone avant** l'ouverture du navigateur | ✅ |
| A13 | « J'ai une clé » | `paywall_have_key_clicked` | ✅ |
| A14 | Export PNG en gratuit | `paywall_viewed` source=export_png, pas de fichier | ✅ |
| A15 | Copie presse-papiers (quota restant) | `copy_clipboard` | ✅ |
| A16 | Pro : export PNG, PDF, lot sur un dossier | `export_png` (resolution_px), `export_pdf`, `batch_started` (count, format) + `batch_completed` (done, errors), fichiers bien écrits | ✅ |
| A17 | Activation de licence échouée | `license_activation_failed` | ✅ |
| A18 | Changement de langue | Les events suivants portent `lang = en` | ✅ |
| A19 | Profil réel intact | Empreinte de `%APPDATA%\VectorPop\usage.json` inchangée | ✅ |
| R1 | Écrans touchés par les imports perdus du refactor (plein écran ×2, comparaison, tailles PNG/SVG, aide, licence) | Se construisent sans erreur | ✅ |
| V-NET | Envoi réel vers `eu.i.posthog.com/capture/` | HTTP 200 | ✅ (1 event) |
| M1 | Build packagé (exe, MSIX, AppImage) | Events visibles dans PostHog filtrés sur `app = vectorpop_desktop`, `channel` correct | Manuel, au moment de la release |

## Lots suivants (à compléter au fil de la V2)
- Lot 2 — Freemium (§1.6) : 5 exports à vie pour une nouvelle installation, anciens utilisateurs à 3 par jour, exports démo non comptés, fonctions Pro utilisables dans l'aperçu et verrouillées à l'export, export « sans les fonctions Pro » possible.
- Lot 3 — ProDialog (§1.2)
- Lot 4 — Modèles démo (§1.3), dont le piège `QSettings`
- Lot 5 — Onboarding (§1.4)
- Lot 6 — Moments après export (§1.5)
- Final — Non-régression complète sur le build packagé (voir §5 du cahier des charges).

## Journal d'exécution
| Date | Lot | Résultat |
|---|---|---|
| 23/09/2026 | Lot 1 (PostHog) | 1er passage : **échec**, 8 imports perdus lors du refactor du 19/08 (`optimize_svg`, `QDialog`, `QSvgRenderer`, `QPainter`, `QFontMetrics`) cassaient la vectorisation, les exports, le plein écran et la comparaison. Corrigé (jamais livré : la 1.2.1 a été buildée avant le refactor), puis 20/20 PASS + R1, V-NET HTTP 200. |
