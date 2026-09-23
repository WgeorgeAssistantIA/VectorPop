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

## Lot 6 — Moments après export (§1.5)

| ID | Vérification | Attendu | Auto |
|---|---|---|---|
| X1 | 1er export d'une vraie image | Célébration affichée une seule fois (pas aux exports suivants), sur le bon fichier | ✅ |
| X2 | Export d'une image d'exemple avant la vraie | Jamais de célébration sur la démo ; elle arrive au 1er export de la vraie image (drapeau dédié, pas `total == 1`) | ✅ |
| X3 | Boutons de la célébration | « Ouvrir le fichier/dossier » ouvrent le bon chemin (intercepté) et enregistrent le signal « fichier ouvert » ; « Découvrir Pro » ouvre l'écran Pro (source=celebration) | ✅ |
| X4 | Demande d'avis | Seulement après fichier ouvert + ≥ 3 exports ; « Plus tard » la repousse (redemandée), 👍 ouvre l'écran de notation du Microsoft Store et ne redemande plus | ✅ |
| X5 | 👎 | Ouvre un mail de retour, ne redemande plus | ✅ |
| X6 | Dernier export gratuit (fichier et copie) | Bandeau dans la barre d'état, aucune fenêtre bloquante | ✅ |

Tout ce qui ouvrirait un fichier, un dossier, le Store ou un mail sur le PC est intercepté par le script (`FakeDesktop`).

## Lot 7 — Traitement par lot 2.0 (§2.6 A) + fond blanc et « Ouvrir le dossier » (§2.6 D)

| ID | Vérification | Attendu | Auto |
|---|---|---|---|
| A16 | Lot simple lancé depuis le bouton (Pro) | 3 SVG nommés `<nom>_vector.svg`, toutes les lignes « OK » | ✅ |
| B1 | SVG + PNG + PDF en une passe, un sous-dossier par format, PNG 512 px | 3 fichiers par format dans `svg/`, `png/`, `pdf/` ; côté long du PNG = 512 | ✅ |
| B2 | Sous-dossiers inclus, même dossier ajouté deux fois, deux images homonymes | Aucun doublon dans la liste ; aucun écrasement (`logo_vector.svg` + `logo_vector_2.svg`) ; fichiers non-images ignorés | ✅ |
| B3 | Une image illisible dans le lot, puis « Relancer les échecs » après correction | Seule cette ligne est en erreur, les autres passent ; la relance ne retraite que l'échec | ✅ |
| B4 | Fond blanc vs transparent | Coin du PNG blanc opaque vs transparent ; rectangle blanc dans le SVG seulement en blanc | ✅ |
| B5 | « Optimiser chaque image » | Le lot passe par l'optimisation automatique et aboutit | ✅ |
| B6 | Annulation en cours de lot | Arrêt propre, aucune ligne bloquée « en cours », le reste peut être relancé | ✅ |
| B7 | « Ouvrir le dossier de sortie » | Ouvre le bon dossier (intercepté) | ✅ |
| B8 | Dépôt de plusieurs images / d'un dossier sur la zone d'image | Pro : écran de lot pré-rempli ; gratuit : écran Pro, puis la 1re image est chargée quand même ; une seule image : ouverture normale | ✅ |
| B9 | Export simple avec « Fond blanc à l'export » + bouton « Ouvrir le dossier » | Fond blanc dans le SVG et le PNG ; le bouton ouvre le dossier du dernier export (intercepté) | ✅ |
| M4 | Lot de 100+ vraies photos sur le build packagé | Interface fluide (vignettes réduites au décodage), pas de gel | Manuel |

## Lot 8 — Avant la release (§2.1 à §2.5, §2.7)

| ID | Vérification | Attendu | Auto |
|---|---|---|---|
| L1 | Case « Envoyer des statistiques d'usage anonymes » (Aide > Confidentialité) décochée, puis redémarrage, puis recochée | Plus aucun event envoyé, même pas `app_opened` au redémarrage ; choix mémorisé ; en recochant, un seul `analytics_enabled` | ✅ |
| L2 | Photo 5000 × 3000 vectorisée | Résolution de travail plafonnée à 2048 px (SVG 2048 × 1229), comme sur Android | ✅ |
| L3 | Dégradés + affinage avec une source plus grande que le SVG (plafond, finition IA ×4) | Plus d'avertissement « dégradés ignorés » (bug latent corrigé) | ✅ |
| L4 | Panneau Original : molette, clic droit + glisser, clic molette, rognage | Zoom sous le curseur (le point visé ne bouge pas), déplacement, retour à l'image entière ; aperçu décodé en 4096 px max mais rognage calculé en pixels réels (5000 px) | ✅ |
| L5 | Panneau SVG : zoom maximal | ~×9 400 (41 crans), cache bitmap coupé au-delà de ×12 (pas d'image géante en mémoire), indicateur « Zoom ×… » dans la barre d'état, rendu rapide | ✅ |
| L6 | Détection de mise à jour | Comparaison de versions correcte ; vérification seulement pour exe/portable/Linux (pas MSIX/Snap/sources) ; bouton « Mise à jour X disponible » seulement si la version en ligne est plus récente, qui ouvre la page de téléchargement (interceptée) | ✅ |
| L7 | Bouton « Passer Pro » | En gratuit : vraie pastille, distincte des autres boutons (tous en dégradé dans ce thème) : forme de pilule, dégradé diagonal, bord cyan, « ★ Passer Pro ». Une fois Pro : bouton neutre, sans étoile | ✅ |
| L9 | Fondu en bas du panneau de réglages | Petite fenêtre : réglages dans une zone défilante plafonnée à 40 % de la hauteur, fondu visible tant qu'il reste des réglages en dessous, caché une fois en bas ; grande fenêtre : rien ne défile, pas de fondu (même rendu qu'avant) ; couleur du fondu = fond du thème clair/sombre ; l'aperçu reste plus grand que les réglages | ✅ |
| L8 | Lien « Aussi sur Android » (aide + écran Pro) | Ouvre la fiche Google Play (interceptée), event avec la source | ✅ |
| M5 | Mise à jour réelle | Publier `site/public/version.json` en 2.0.0 le jour de la release, lancer une 2.0.0 de test avec une version locale plus ancienne : le bouton apparaît | Manuel, à la release |

- Final — Non-régression complète sur le build packagé (voir §5 du cahier des charges).

## Journal d'exécution
| Date | Lot | Résultat |
|---|---|---|
| 23/09/2026 | Lot 1 (PostHog) | 1er passage : **échec**, 8 imports perdus lors du refactor du 19/08 (`optimize_svg`, `QDialog`, `QSvgRenderer`, `QPainter`, `QFontMetrics`) cassaient la vectorisation, les exports, le plein écran et la comparaison. Corrigé (jamais livré : la 1.2.1 a été buildée avant le refactor), puis 20/20 PASS + R1, V-NET HTTP 200. |
| 23/09/2026 | Lot 2 (Freemium) | 32/32 PASS (lot 1 adapté à l'essai de 5 + F1 à F9 + R1 + V-NET). Corrigé en cours de route : le message « N tracé(s) supprimé(s) » écrasait l'avertissement « Aperçu Pro » (les deux sont maintenant affichés). |
| 23/09/2026 | Lot 3 (ProDialog) | 33/33 PASS. Les 3 boîtes QMessageBox d'upsell (fonction verrouillée, quota, teaser) remplacées par un seul `ProDialog` réel (badge, preuve de valeur, 6 avantages avec la fonction concernée mise en avant, CTA dégradé). Vérifié via le vrai widget (P1), pas seulement les events. |
| 23/09/2026 | Lot 4 (Modèles démo) | 38/38 PASS. Les 4 échantillons Android copiés dans `assets/samples/`, ajoutés aux 3 `.spec` PyInstaller (l'installeur/MSIX/Snap/AppImage en héritent automatiquement, pas de changement séparé nécessaire). Écran vide : 4 tuiles cliquables (icône + titre) remplacent l'unique logo généré ; menu « Exemples » ajouté pour y revenir. `apply_recipe()` (déjà existant, déjà testé pour le bouton d'aide) réutilisé pour forcer preset+réglages, ce qui règle le piège QSettings gratuitement. |
| 23/09/2026 | Lot 5 (Onboarding) | 43/43 PASS. 4 écrans (aligné sur Android, qui combine en réalité vie privée+quota sur un même écran, pas 5 séparés comme décrit trop vite dans le §1.4 initial) : promesse, bitmap vs vectoriel (vrai SVG vtracer rendu, pas une approximation), usage principal (ouvre le modèle démo assorti), local+quota. Bouton « Passer » gardé, complète quand même (charge un 1er résultat par défaut). Versionné (`onboarding.py`, `ONBOARDING_VERSION=1`). |
| 23/09/2026 | Lot 6 (Moments après export) | 49/49 PASS. Corrigé en cours de route : après une copie, le message « Code SVG copié » écrasait le bandeau « Dernier export gratuit » (invisible). Choix : la célébration ne se déclenche jamais sur une image d'exemple (drapeau `celebrated` dédié, sinon un essai de démo avant la vraie image l'aurait fait sauter). 👍 → Store (et non un mail comme sur VoxCut PC), pour faire monter les notes Store de VectorPop. |
| 24/09/2026 | Lot 7 (Traitement par lot 2.0) | 57/57 PASS (hors V-NET, déjà validé). Nouvel écran de lot (fichiers + dossiers, glisser-déposer, statut par image, plusieurs formats, optimisation par image, fond, suffixe, sous-dossiers, relance des échecs, ouverture du dossier). Choix : deux images homonymes d'un même lot ne s'écrasent jamais (`_2`) ; un dépôt multiple en gratuit n'est jamais perdu (la 1re image est chargée après l'écran Pro). |
| 24/09/2026 | Lot 8 (avant release) | 66/66 PASS, V-NET compris. En cours de route : un bug latent corrigé (`gradientize_svg` ne redimensionnait pas la source à la taille du SVG, alors que `refine_colors` le faisait : dégradés ignorés avec la finition IA ×4, et avec le nouveau plafond de résolution). Un seuil trop naïf dans le test L4 corrigé (dépendait des proportions du panneau). |
| 24/09/2026 | Lot 8 (suite : fondu + pastille) | 66/66 PASS. Défaut trouvé par L9 : Qt donnait à la zone de réglages une hauteur plus petite que son contenu, donc elle défilait même sur grand écran. Corrigé (hauteur réelle du contenu, plafonnée). Le fondu n'apparaît que sur une fenêtre de moins d'environ 550 px de haut. |
