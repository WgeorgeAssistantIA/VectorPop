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
## Lot 2 — Freemium (§1.6)

| ID | Vérification | Attendu | Auto |
|---|---|---|---|
| F1 | Nouvelle installation (aucun `usage.json`) | Plan `trial`, 5 exports au total, libellé « 5/5 exports gratuits restants » | ✅ |
| F2 | Utilisateur d'avant la 2.0.0 (`usage.json` existant) | Plan `daily`, 3 par jour, total conservé, plan conservé le lendemain et au rechargement | ✅ |
| F3 | Essai épuisé, lendemain | Toujours 0 restant (l'essai ne repart pas), libellé « exports d'essai utilisés » | ✅ |
| F4 | Export d'une image d'exemple, quota épuisé | Export OK, quota inchangé, total +1 | ✅ |
| F5a | Suppression d'aplats en gratuit | Mode activable sans paywall, `pro_feature_tried`, barre d'état « Aperçu Pro » | ✅ |
| F5b | Export de ce rendu, « Plus tard » | Aucun fichier, `paywall_viewed` source=pro_features, quota intact | ✅ |
| F5c | Export, « Exporter sans les fonctions Pro » | Aperçu recalculé, puis export relancé automatiquement, fichier écrit, 1 export décompté | ✅ |
| F6 | Optimiser en gratuit puis copie | Optimiser tourne sans paywall ; la copie est bloquée (presse-papiers inchangé) | ✅ |
| F7 | Case Détourage IA en gratuit | Pas de paywall (seulement la confirmation de téléchargement), `pro_feature_tried` | ✅ |
| F8 | Lot, PDF (et PNG, A14) en gratuit | Verrouillés d'emblée | ✅ |
| F9 | Pro : rendu Optimiser exporté | Aucun verrou | ✅ |
| M2 | Détourage IA / finition IA réellement calculés en gratuit (modèles téléchargés) puis export | Avertissement Pro avec la bonne fonction ; « sans » décoche l'IA et exporte | Manuel (téléchargement ~120 Mo) |

## Lot 3 — ProDialog (§1.2)

| ID | Vérification | Attendu | Auto |
|---|---|---|---|
| P1 | Contenu réel du ProDialog (fonction verrouillée d'emblée, ex. lot) | Badge « accès à vie », les 6 avantages listés, la fonction concernée mise en avant, bannière de preuve de valeur si total>0 | ✅ |
| (couvre aussi) | Tous les chemins A11-A14, F5b/F5c, F6, F8 passent maintenant par le vrai `ProDialog` (plus de `QMessageBox`) | Mêmes comportements qu'avant (achat synchrone, « J'ai une clé », « sans les fonctions Pro », quota) | ✅ |

## Lot 4 — Modèles démo (§1.3)

| ID | Vérification | Attendu | Auto |
|---|---|---|---|
| D1 | Les 4 échantillons packagés existent (`sample_asset()`) | 4 fichiers trouvés | ✅ |
| D2 | Piège `QSettings` : sliders/cases mis à des valeurs volontairement fausses avant de charger le modèle « logo » | Le preset ET tous les réglages du modèle écrasent les anciennes valeurs (pas juste rechargés par-dessus) | ✅ |
| D3 | Les 4 modèles se chargent chacun | Bon preset appliqué, SVG produit, `sample_model_selected` avec le bon `model_id` | ✅ |
| D4 | Menu « Exemples » (retraduit en EN au passage) | 4 entrées, titres traduits, déclencher une entrée reproduit le même chargement qu'un clic sur la tuile | ✅ |
| D5 | Tuiles de l'écran vide | 4 tuiles avec icône réelle (non nulle) ; le panneau se cache une fois une vraie image chargée | ✅ |
| M3 | Packaging (exe, MSIX, AppImage, Snap) | Les 4 images sont bien dans `assets/samples/` du build packagé (vérifié via `VectorPop.spec`/`VectorPop_onefile.spec`/`build_linux.spec`, pas encore testé sur un vrai build) | Manuel, au moment de la release |

## Lot 5 — Onboarding (§1.4)

| ID | Vérification | Attendu | Auto |
|---|---|---|---|
| O1a/b | `should_show()` après `mark_seen(0)`, puis affichage manuel | True ; le dialogue construit ses 4 pages et émet `onboarding_started` + `onboarding_step_viewed`(0, welcome) | ✅ |
| O2 | « Passer » à l'étape 2 | `onboarding_skipped`(at_step=1), puis `onboarding_completed` (Passer complète quand même, comme Android — charge le profil par défaut pour un 1er résultat immédiat), marqué vu | ✅ |
| O3 | Parcours complet, profil « Signatures & gravure N&B » choisi | `onboarding_usecase_selected`, `onboarding_completed`(usecase=sketch), le preset `bw` appliqué et le modèle démo assorti chargé automatiquement | ✅ |
| O4 | Déclenchement automatique (le vrai câblage `QTimer.singleShot` dans `__init__`, pas un appel manuel) sur une fenêtre neuve | Le dialogue s'ouvre tout seul | ✅ |

- Lot 6 — Moments après export (§1.5)
- Final — Non-régression complète sur le build packagé (voir §5 du cahier des charges).

## Journal d'exécution
| Date | Lot | Résultat |
|---|---|---|
| 23/09/2026 | Lot 1 (PostHog) | 1er passage : **échec**, 8 imports perdus lors du refactor du 19/08 (`optimize_svg`, `QDialog`, `QSvgRenderer`, `QPainter`, `QFontMetrics`) cassaient la vectorisation, les exports, le plein écran et la comparaison. Corrigé (jamais livré : la 1.2.1 a été buildée avant le refactor), puis 20/20 PASS + R1, V-NET HTTP 200. |
| 23/09/2026 | Lot 2 (Freemium) | 32/32 PASS (lot 1 adapté à l'essai de 5 + F1 à F9 + R1 + V-NET). Corrigé en cours de route : le message « N tracé(s) supprimé(s) » écrasait l'avertissement « Aperçu Pro » (les deux sont maintenant affichés). |
| 23/09/2026 | Lot 3 (ProDialog) | 33/33 PASS. Les 3 boîtes QMessageBox d'upsell (fonction verrouillée, quota, teaser) remplacées par un seul `ProDialog` réel (badge, preuve de valeur, 6 avantages avec la fonction concernée mise en avant, CTA dégradé). Vérifié via le vrai widget (P1), pas seulement les events. |
| 23/09/2026 | Lot 4 (Modèles démo) | 38/38 PASS. Les 4 échantillons Android copiés dans `assets/samples/`, ajoutés aux 3 `.spec` PyInstaller (l'installeur/MSIX/Snap/AppImage en héritent automatiquement, pas de changement séparé nécessaire). Écran vide : 4 tuiles cliquables (icône + titre) remplacent l'unique logo généré ; menu « Exemples » ajouté pour y revenir. `apply_recipe()` (déjà existant, déjà testé pour le bouton d'aide) réutilisé pour forcer preset+réglages, ce qui règle le piège QSettings gratuitement. |
| 23/09/2026 | Lot 5 (Onboarding) | 43/43 PASS. 4 écrans (aligné sur Android, qui combine en réalité vie privée+quota sur un même écran, pas 5 séparés comme décrit trop vite dans le §1.4 initial) : promesse, bitmap vs vectoriel (vrai SVG vtracer rendu, pas une approximation), usage principal (ouvre le modèle démo assorti), local+quota. Bouton « Passer » gardé, complète quand même (charge un 1er résultat par défaut). Versionné (`onboarding.py`, `ONBOARDING_VERSION=1`). |
