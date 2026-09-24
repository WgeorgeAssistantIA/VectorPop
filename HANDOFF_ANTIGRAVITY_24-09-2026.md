# VectorPop Desktop — Topo pour Antigravity (24/09/2026)

Toute la V2 (2.0.0) a été codée par une session Claude Code entre le 23 et le 24/09. Ce document résume ce qui est fait, testé, poussé — et ce qui reste avant de publier.

Références : [CAHIER_DES_CHARGES_V2_DESKTOP.md](CAHIER_DES_CHARGES_V2_DESKTOP.md) (le détail complet, item par item, avec ce qui est ✅ FAIT et ce qui ne l'est pas) et [PLAN_VERIFICATION_V2.md](PLAN_VERIFICATION_V2.md) (les tests, lot par lot, avec le journal des exécutions). Ce topo n'est qu'un résumé — les deux fichiers ci-dessus sont la source de vérité.

## Où c'est

Tout est sur `origin/main` (dépôt `WgeorgeAssistantIA/VectorPop`), 20 commits entre `fff1a7b` et `27ba80f`. Rien en attente localement à part une modif pré-existante et non liée sur `VectorPop-Dashboard/dashboard.html` (pas de cette session, à ignorer ou traiter à part).

Code encore en **1.2.0** (`vectorpop/__init__.py`) et `installer.iss` en **1.2.1** : **la version n'a pas été bumpée**. C'est la première chose à faire avant un build.

## Ce qui a été fait

**Prérequis (avant tout)**
- Refonte Android 1.0.2→1.0.5 (onboarding, écran Pro, modèles démo, PostHog, correctifs Play Billing) : n'était jamais commitée, c'est fait.
- Reformatage `black` du code desktop, séparé d'un vrai correctif trouvé dedans (garde-fou sur un dossier d'export manquant, qui faisait planter le thread de vectorisation côté Rust/vtracer sans lever une exception Python normale).
- 8 imports perdus lors du découpage `app.py` → `core/`+`ui/` du 19/08 (jamais livrés, la 1.2.1 datant d'avant) : `optimize_svg`, `QDialog`, `QSvgRenderer`, `QPainter`, `QFontMetrics`. Sans ça, toute vectorisation, export, plein écran et comparaison plantait.

**Funnel de conversion (P1 du cahier des charges)**
- **PostHog** : ~25 events, `app: "vectorpop_desktop"`, canal de distribution détecté automatiquement (exe/msix/portable/snap/appimage/source).
- **Freemium 2.0** : 5 exports gratuits **à vie** pour les nouvelles installations (au lieu de 3/jour) ; les utilisateurs déjà installés avant la 2.0.0 gardent 3/jour (détecté via la présence d'un `usage.json` avant migration). Détourage IA, finition IA, Optimiser et suppression d'aplats sont désormais utilisables **librement dans l'aperçu** ; le verrou ne tombe qu'à l'export d'un rendu qui les utilise (écran : Pro, ou exporter sans ces fonctions).
- **`ProDialog`** : remplace les 3 `QMessageBox` d'upsell (fonction verrouillée / quota / aperçu utilisant une fonction Pro) par un seul écran (badge, preuve de valeur, 6 avantages avec celui concerné mis en avant, CTA, bouton contextuel).
- **4 modèles démo** cliquables sur l'écran vide (mêmes PNG qu'Android), qui règlent le bon preset même si des réglages différents étaient sauvegardés.
- **Onboarding** au premier lancement (4 écrans, versionné — Android en a en fait 4 aussi, pas 5 comme décrit dans une première version du cahier des charges).
- **Après export** : célébration du 1er export d'une vraie image (jamais sur une démo), demande d'avis (👍 → écran de notation Microsoft Store, 👎 → mail), bandeau non bloquant au dernier export gratuit.

**Traitement par lot 2.0**
- Nouvel écran (`ui/batch_dialog.py`) : fichiers et dossiers (glisser-déposer compris, sous-dossiers optionnels), vignette + statut par image, plusieurs formats en une passe (SVG/PNG/PDF), optimisation par image, fond transparent ou blanc, suffixe, sous-dossier par format, relance des échecs seuls, ouverture du dossier de sortie, annulation propre. Deux images homonymes d'un même lot ne s'écrasent jamais.
- Glisser plusieurs fichiers/un dossier sur la fenêtre principale ouvre ce nouvel écran (en gratuit : l'écran Pro s'affiche d'abord, puis la 1re image se charge quand même si l'utilisateur reste gratuit).

**Avant-release (P2 du cahier des charges)**
- Case **« Statistiques anonymes »** désactivable (aide), mémorisée, appliquée avant le tout premier event.
- **Résolution de travail plafonnée à 2048 px** (comme Android) : une photo de téléphone ne fige plus l'app, surtout en lot.
- **Correctif trouvé en route** : les dégradés étaient silencieusement ignorés quand la source était plus grande que le SVG produit (typiquement avec la finition IA ×4, et maintenant avec le plafond ci-dessus).
- **Zoom** : panneau Original enfin zoomable/déplaçable (molette, clic droit, clic molette) — c'était un bug connu, sans zoom ni déplacement. Panneau SVG : jusqu'à ~×12 000 (pas ×10 000, voir note ci-dessous), pastille de zoom qui reste affichée tant qu'on n'est pas revenu à l'image ajustée.
- **Détection de mise à jour** (`vectorpop/updater.py`), lit `site/public/version.json` — inactive pour MSIX/Snap (déjà gérés par leur store).
- **Fond blanc à l'export** + bouton **« Ouvrir le dossier »** après un export.
- **Fondu en bas du panneau de réglages** (petite fenêtre seulement) + **pastille « ★ Passer Pro »** vraiment distincte des autres boutons (tous en dégradé dans ce thème).
- **Lien « Aussi sur Android »** dans l'aide et l'écran Pro.

**Note sur le zoom ×10 000** : le calcul initial (×1,25/cran) donnait bien ×9400, mais William a trouvé que ça ne se sentait pas en zoomant à la molette — 41 crans, c'est long, et une courbe vectorielle ne pixellise jamais donc zoomer encore ne montre rien de nouveau passé un moment. Corrigé : ×1,4/cran, 28 crans, ~×12 000, avec la pastille persistante pour donner un vrai retour visuel pendant qu'on scrolle.

## Vérification

Tout est couvert par [scripts/verify_v2.py](scripts/verify_v2.py) : **66 tests automatiques, tous verts** (dernière exécution le 24/09), pilotage headless de la vraie fenêtre (Qt offscreen), profil isolé (n'a jamais touché aux vrais réglages/licence de William), tous les envois externes interceptés (fichiers, dossiers, Store, mails). Lancer avec :

```powershell
.venv\Scripts\python.exe scripts\verify_v2.py
```

`--no-net` pour sauter le seul test qui fait un vrai appel réseau (PostHog).

William a aussi testé en direct sur sa machine le 24/09 : pastille Pro et traitement par lot confirmés OK. Un dossier de test avec 8 images variées existe déjà : `VectorPop/Test/lot_test/`.

## Bilan de Publication V2.0.0 (Effectué le 24/09/2026)

1. ✅ **Bumper la version à 2.0.0 partout** : `vectorpop/__init__.py`, `installer.iss`, manifeste MSIX `AppxManifest.xml`, `snapcraft.yaml`, `build_linux.sh`.
2. ✅ **Builds packagés complets** : Rassemblés dans `releases/v2.0.0/` (Inno Setup EXE, MSIX Store, ZIP portable Windows, AppImage Linux, Tar.gz Linux, Snap Linux).
3. ✅ **Vérification automatique** : 66/66 tests PASS (`scripts/verify_v2.py --no-net`).
4. ✅ **Snap Store (Canonical)** : Téléversé et publié directement sur le canal `stable` (Révision 4) sans trousseau bloquant.
5. ✅ **Windows Store (Microsoft Partner Center)** : Paquet MSIX 2.0.0 soumis avec `MinVersion="10.0.17763.0"` et UTF-8 strict.
6. ✅ **GitHub Releases** : Release officielle `v2.0.0` publiée avec notes et 6 binaires attachés.
7. ✅ **Site web (`vectorpop.fr`)** :
   - `site/public/version.json` passé à `"2.0.0"`.
   - Liens de téléchargement mis à jour vers `v2.0.0`.
   - Copie freemium 2.0 (5 exports inclus pour démarrer, aperçu gratuit des fonctions Pro) réalignée dans `index.tsx` et `blog-posts.ts`.
   - Build Vite validé et déploiement Vercel automatique via push `origin/main`.
8. ✅ **Release notes & historique** : `release_notes/v2.0.0.md`, `release_notes/history.md`, `CHANGELOG.md` à jour.
9. ⚠️ **Rappel restant (Android Play Console)** : Côté Play Console Android, William doit ajuster le formulaire Data Safety pour déclarer la télémétrie anonyme PostHog.


## Hors périmètre de cette V2 (proposé pour la 2.1, pas commencé)

Voir §2.6 du cahier des charges pour le détail : exports pour la découpe/gravure (DXF, EPS, séparation par couleur), palette de couleurs éditable, petits plus (copier pour le web, pack logo + favicon, clic droit Explorateur, ligne de commande). Décision : attendre les chiffres PostHog une fois la 2.0.0 en ligne (notamment `onboarding_usecase_selected` pour voir combien de monde choisit le profil gravure/découpe) avant de prioriser.

## Pièges à connaître si vous reprenez ce code

- **`apply_recipe()`** (déjà existant, réutilisé par les modèles démo) force le preset ET les sliders — c'est ce qui règle le piège `QSettings` documenté (les réglages sauvegardés se rechargent sinon par-dessus le preset). Si vous ajoutez un nouveau point d'entrée qui doit appliquer un preset précis, passez par cette méthode plutôt que de juste changer le combo.
- **`FakeProDialog` / `FakeOnboardingDialog` / `FakeBatchDialog`** dans `verify_v2.py` : ce sont de vrais sous-classes des vraies fenêtres (pas des mocks), avec `exec()` piloté par un driver au lieu d'attendre un clic. Si vous ajoutez un nouveau `QDialog`, suivez ce même schéma pour rester testable sans faire de vraie boîte modale bloquante.
- **`analytics.py`** : `_ENABLED` (canal source vs frozen) et `_user_enabled` (case dans l'aide) sont deux gardes séparées, les deux doivent être vraies pour qu'un event parte (`_can_send()`).
