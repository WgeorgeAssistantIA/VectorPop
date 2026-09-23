# VectorPop Desktop V2 (2.0.0) — Cahier des charges

Rédigé le 23/09/2026. Objectif : reprendre sur la version desktop (Windows/Linux, PySide6) les améliorations de conversion faites sur Android entre le 16/09 et la 1.0.5+7, sans changer le prix desktop (39 €, achat unique, licence Lemon Squeezy).

## 0. Constat de départ

| | Desktop actuel | Android actuel |
|---|---|---|
| Version | Code en **1.2.0** (`vectorpop/__init__.py`), installeur en **1.2.1** (`installer.iss`, build du 18/08) | 1.0.5+7 |
| Onboarding | Aucun | 5 écrans : promesse, bitmap vs vectoriel, choix de l'usage (4 profils → preset), 100 % local, « 3 exports offerts ». Bouton « Passer » + tracking de l'étape d'abandon |
| Modèles démo | 1 logo généré à la volée (`load_demo_image`, cercles violet/magenta/cyan) | 4 vrais modèles cliquables sur l'écran vide (`assets/samples/`) : logo/badge (plat), mascotte (détaillé), croquis/signature (N&B), pictogramme (plat) |
| Paywall | `QMessageBox` générique (Acheter / J'ai une clé / Plus tard) + total cumulé + réassurance | Écran dédié : badge « accès à vie », bannière « vous avez déjà vectorisé N images », 4 avantages, CTA dégradé, restaurer, lien vers la version PC |
| Après le 1er export | Rien | Fiche de célébration (« 100 % local », « netteté infinie ») + découverte douce de Pro |
| Dernier export gratuit | Rien | Message discret + bouton Pro |
| Quota gratuit | 3 exports SVG **par jour** | 3 exports **au total** (nouveaux utilisateurs) |
| Analytics | 2 events (`paywall_shown`, `paywall_buy_click`) → `vectorpop.fr/api/track` (GA4) | PostHog, ~25 events, `app: "vectorpop_android"` |
| Mises à jour | Aucune détection | `in_app_update` (Play) |
| Demande d'avis | Aucune | Après un partage réussi, à partir du 2e export |
| Zoom aperçu | SVG : 20 crans max. Original : **ni zoom ni déplacement** (bug connu) | Jusqu'à ×10 000 (« vecteurs au microscope ») |
| Badge « Passer Pro » | Libellé de plan texte | Pastille dégradé violet → magenta → cyan |

### Points d'attention avant de commencer
1. **Rien de la refonte Android n'est commité.** `onboarding_screen.dart`, `paywall_sheet.dart`, `demo_models.dart`, `export_celebration_sheet.dart`, `services/` (analytics, review, update), `assets/samples/` et 4 fichiers de test sont encore non suivis dans git. Le dernier commit Android date du 31/08 (1.0.1+3). Il faut les commiter **avant** d'en faire la source de référence du desktop.
2. **Le desktop contient ~1 000 lignes modifiées non commitées.** Ce n'est que du reformatage `black` (vérifié avec `git diff -w`). Il faut le commiter à part pour garder un diff V2 lisible.
3. **Le push GitHub est bloqué** par des vidéos de plus de 100 Mo dans l'historique (`Marketing/0803.mp4`, commits du refactor du 19/08). Il faut régler ça, sinon aucune release 2.0.0 ne pourra partir (voir §6).
4. La 1.2.1 a été buildée **avant** le découpage `app.py` → `core/` + `ui/` du 19/08. Comme pour InOneShot, la V2 sera le premier build de la nouvelle structure : il faudra tester le parcours complet sur le build packagé.

## 1. Périmètre V2 — P1 (conversion, indispensable)

### 1.1 Analytics PostHog (à faire en premier pour mesurer)
- Utiliser le **même projet PostHog EU** que les apps Android (`eu.i.posthog.com`, clé `phc_yfH9…` déjà dans `analytics_service.dart`), avec **`app: "vectorpop_desktop"` sur tous les events** sans exception (cf. le piège VoxCut qui ne tague pas `app`).
- Conserver l'UUID anonyme actuel de `analytics.py` (`_client_id()`) comme `distinct_id`. Envoi en arrière-plan, échecs silencieux. **Exception** : `pro_buy_clicked` en envoi synchrone (1,5 s max), car le thread daemon est tué quand l'app se ferme juste après l'ouverture du navigateur. Bug déjà vu sur VoxCut PC, qui comptait 0 clic pour 36 vues.
- Garder les mêmes noms d'events qu'Android pour pouvoir comparer les deux funnels : `app_opened`, `onboarding_started`, `onboarding_step_viewed`, `onboarding_usecase_selected`, `onboarding_completed`, `onboarding_skipped`, `sample_model_selected`, `image_picked` (largeur, hauteur, taille, alpha, source : fichier / glisser / coller), `vectorize_started` (preset, précision, fond, IA), `vectorize_completed` (durée, poids SVG), `vectorize_failed`, `export_svg`, `export_png` (résolution), `export_pdf`, `copy_clipboard`, `batch_started` / `batch_completed` (nombre), `autotune_used`, `quota_reached`, `paywall_viewed` (source), `pro_buy_clicked`, `license_activated`, `first_export_celebrated`, `update_banner_shown`.
- Propriétés communes : `app_version`, `os` (windows/linux), `channel` (exe / msix / portable / appimage / snap), `lang`, `is_pro`.
- Garder l'endpoint GA4 `vectorpop.fr/api/track` en parallèle pendant une version, puis le retirer une fois PostHog validé.
- Respecter la case « statistiques anonymes » si elle existe. Sinon, l'ajouter dans les réglages (le Store et le RGPD s'y attendent).

### 1.2 Vrai écran Pro (remplace le `QMessageBox`)
- Nouveau `ProDialog` (`ui/dialogs.py`) inspiré de `paywall_sheet.dart` :
  - badge « Accès à vie — sans abonnement » ;
  - bannière de preuve de valeur : « Vous avez déjà vectorisé N images » (`UsageTracker.total_exports()` existe déjà) ;
  - titre selon le contexte : fonction verrouillée (« Débloquez *Traitement par lot* ») ou quota atteint (« Continuez avec VectorPop Pro ») ;
  - avantages **qui correspondent au code desktop** : exports illimités, PDF vectoriel + PNG HD, traitement par lot, détourage IA + finition IA ×4 en local, bouton Optimiser, suppression d'aplats ;
  - CTA dégradé « Débloquer VectorPop Pro — 39 € » (+ `LANCEMENT30` s'il est toujours actif), « J'ai déjà une clé », « Plus tard » ;
  - réassurance : paiement unique via Lemon Squeezy, 3 activations, 30 jours satisfait ou remboursé (à aligner sur le variant A/B gagnant du site, cf. `abtest-reassurance-report.ps1`).
- ⚠️ Ne pas reprendre « licence commerciale à vie » ni « zéro filigrane » d'Android sans vérifier que les CGV (`/terms`) le disent bien. On a déjà retiré un argument non tenu sur InOneShot.
- Remplacer tous les appels à `_show_upsell` (`_require_pro`, `_can_export_now`) par ce dialogue, avec la source passée pour `paywall_viewed`.

### 1.3 Modèles démo
- Remplacer le logo généré de `load_demo_image` par les **4 modèles d'Android** (copier `vectorpop_android/assets/samples/*.png` dans `vectorpop/assets/samples/`, et les ajouter au `.spec` PyInstaller, à l'installeur, au payload MSIX et à l'AppImage).
- Sur l'écran vide (`DropImage`) : 4 vignettes cliquables avec titre FR/EN, à la place du simple lien « essayer un exemple ». Chaque modèle applique son preset (`flat` / `detailed` / `bw` → presets desktop équivalents dans `core/recipes.py`).
- Ajouter aussi une entrée de menu « Ouvrir un exemple » pour y revenir plus tard.
- ⚠️ Piège `QSettings` : les sliders persistés sont rechargés **par-dessus** les presets. Charger un modèle démo doit forcer les valeurs du preset, sinon le rendu démo dépend des derniers réglages de l'utilisateur.

### 1.4 Onboarding au premier lancement
- Fenêtre modale reprenant les 5 écrans Android, FR/EN, textes déjà écrits dans `i18n.dart` (`onboarding*`, `profile*`) :
  1. Promesse : « Transformez vos images en tracés parfaits »
  2. Bitmap vs vectoriel (visuel avant/après : zoom flou vs net)
  3. « Quel est votre usage principal ? » : logos / mascottes / signatures-gravure N&B / flocage-sérigraphie. Le choix **règle le preset par défaut et ouvre le modèle démo correspondant**.
  4. 100 % local : « vos images ne quittent jamais votre ordinateur, aucun compte »
  5. Quota gratuit + Pro (texte adapté à la décision §1.6)
- Versionnement : `onboarding_version` dans `data_dir()` + constante `ONBOARDING_VERSION`. Les utilisateurs existants le revoient quand on l'incrémente.
- **Bouton « Passer » : à trancher.** Android l'a (avec tracking), InOneShot desktop non. Sur VoxCut Android, 110 skips sur 150 à l'étape 1 étaient des passages volontaires, pas des abandons. Recommandation : le garder et suivre `onboarding_skipped` par étape.

### 1.5 Moments du funnel après export
- **1er export réussi** (gratuit) : petite fenêtre de célébration (`export_celebration_sheet.dart`) avec « Ouvrir le fichier » / « Ouvrir le dossier » en action principale, les 2 atouts (local, netteté infinie), puis un lien discret « Découvrir Pro ». Même hiérarchie que l'`ExportDoneDialog` de VoxCut PC.
- **Dernier export gratuit** : message dans la barre d'état ou petit bandeau « Dernier export gratuit utilisé » + bouton Pro. Pas de popup bloquante.
- **Demande d'avis** : pas d'API d'avis native sur desktop (sauf Store). Reprendre le principe VoxCut PC : 👍 / 👎 après 3 exports **et** au moins un fichier ouvert, demandé une seule fois. 👍 mène à la fiche Microsoft Store (ou au site pour les autres canaux), 👎 ouvre un mailto de retour.

### 1.6 Décision à prendre : quota gratuit
Android est passé à **3 exports au total** pour les nouveaux utilisateurs. Le desktop reste à **3 par jour**.
- **Recommandation : garder 3 par jour en 2.0.0** et décider en 2.1 avec les données PostHog (combien d'utilisateurs touchent le quota, et à quel export ils partent). Le desktop n'a aujourd'hui que 2 events : changer le quota sans données, c'est agir à l'aveugle. Si on bascule plus tard, garder les utilisateurs existants sur l'ancien quota, comme Android avec `isEarlyUser`.
- Le prix reste de **39 €** (Android : 12,99 €). L'écart se justifie par le lot, le PDF et l'usage pro sur PC. Pas de bundle en V2.

## 2. Périmètre V2 — P2 (important, pas bloquant)

### 2.1 Aperçu et zoom
- **Corriger le panneau « Original »** : zoom à la molette et déplacement par glisser, comme le panneau SVG (bug noté en septembre, jamais corrigé).
- Relever la limite de zoom SVG (`_zoom >= 20` dans `ui/widgets.py`) pour afficher les tracés « au microscope », comme le ×10 000 d'Android. Vérifier que le rendu `QSvgRenderer` reste fluide à fort zoom, et ajouter un indicateur de niveau (×100, ×1000…).
- Optionnel : zooms synchronisés entre l'original et le SVG (argument de précision fort pour les captures du Store).

### 2.2 Identité visuelle Pro
- Pastille « Passer Pro » en dégradé violet #7A52F5 → magenta #C92BC0 → cyan #3FD7FB (QSS), à la place du libellé texte. Elle disparaît une fois Pro activé.
- Fondu en bas du panneau de réglages s'il défile (équivalent du `ShaderMask` Android).

### 2.3 Détection de mise à jour
- Reprendre `updater.py` de VoxCut PC : `vectorpop.fr/api/version.json`, bandeau dans l'app, events PostHog. Désactivé pour le canal MSIX et Snap (le Store et snapd gèrent les mises à jour).
- ⚠️ Passer la catégorie en **chaîne** dans les appels de tracking, pas un dict (bug déjà corrigé sur VoxCut).
- Plus tard, un écran « Nouveautés » à la première ouverture d'une nouvelle version (`whats_new_viewed` existe sur Android).

### 2.4 Pont Android ↔ desktop
- Dans la fenêtre Pro et le menu Aide : « Aussi sur Android » avec lien Play Store. Android renvoie déjà vers le PC (`paywallDesktopHint`, `desktop_link_opened`).

### 2.5 Robustesse
- Plafonner la résolution de travail sur les très grosses images (Android le fait déjà contre les gels et les manques de mémoire sur les photos de 12 à 48 Mpx). Vérifier le comportement desktop avec une photo de 48 Mpx.
- Relancer `stress_test_agent.py` sur le **build packagé** (le rapport `stress_test_report_windows.json` date d'avant le refactor).

## 3. Hors périmètre V2
- Changement de prix, bundle Android + desktop, licence partagée entre plateformes.
- Idées PerfectVector (mode « App Icon iOS », superposition des tracés avant export) : à évaluer en 2.1 avec `vectorpop-feature-ideas`.
- Génération de logos par IA (déjà écartée : l'IA générative produit du raster, pas du vrai SVG).
- Réécriture UI (glassmorphism, etc.) : on harmonise avec Android sans refaire le thème.

## 4. Release
- Version **2.0.0** partout : `vectorpop/__init__.py`, `installer.iss`, manifeste MSIX, `snapcraft.yaml`, `build_linux.sh`.
- Canaux : installeur Inno Setup, MSIX Store, zip portable, AppImage + tar.gz Linux, Snap, via `/release VectorPop 2.0.0`.
- Mettre à jour les **liens de téléchargement du site** (codés en dur par version, piège déjà rencontré), `CHANGELOG.md`, `release_notes/history.md` (il ne contient pour l'instant que la 1.0.2 Android et s'arrête là), les notes Store, et les captures du Store avec l'onboarding et les modèles démo.
- Ajouter `version.json` sur le site si le §2.3 est fait.

## 5. Critères d'acceptation
- [ ] Premier lancement : l'onboarding s'affiche en FR sur un OS français, en EN sinon, ne revient pas au lancement suivant, et revient si `ONBOARDING_VERSION` est incrémentée.
- [ ] Le choix d'un usage ouvre le bon modèle démo avec le bon preset, **même si des réglages personnalisés sont déjà sauvegardés** (`QSettings`).
- [ ] Les 4 modèles démo s'ouvrent et se vectorisent dans le build packagé (assets bien embarqués : exe, MSIX, AppImage, Snap).
- [ ] Chaque fonction Pro verrouillée et le quota atteint ouvrent le nouveau `ProDialog` avec la bonne source ; « Acheter » ouvre le checkout Lemon Squeezy ; « J'ai une clé » ouvre l'activation.
- [ ] Le 1er export gratuit affiche la célébration une seule fois ; le dernier export gratuit affiche le bandeau.
- [ ] Tous les events du §1.1 arrivent dans PostHog avec `app = vectorpop_desktop` (vérifié avec un filtre sur `app`), et `pro_buy_clicked` arrive même si on ferme l'app tout de suite après.
- [ ] L'app fonctionne entièrement hors ligne : analytics silencieuses, aucune erreur visible, grâce de licence de 14 jours intacte.
- [ ] Le panneau Original se zoome et se déplace.
- [ ] Non-régression sur le build packagé : glisser, coller, rognage, les 3 presets, suppression de fond (couleur + IA), dégradés, Optimiser, suppression d'aplat, exports SVG/PNG/PDF, lot sur un dossier, activation et désactivation de licence.

## 6. Ordre de réalisation proposé
1. Commiter le travail Android en attente (1.0.2 → 1.0.5), puis le reformatage `black` du desktop, en **2 commits séparés**.
2. Débloquer le push GitHub (sortir les vidéos de plus de 100 Mo de l'historique ou passer par Git LFS). À valider avec William : cela réécrit l'historique.
3. Analytics PostHog (1.1).
4. `ProDialog` (1.2).
5. Modèles démo (1.3), puis l'onboarding (1.4), qui s'appuie dessus.
6. Moments post-export (1.5).
7. P2 (2.1 → 2.5), puis tests sur le build packagé et release 2.0.0.
