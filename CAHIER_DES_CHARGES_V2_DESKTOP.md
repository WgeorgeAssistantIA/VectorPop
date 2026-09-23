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
1. ✅ Refonte Android 1.0.2 → 1.0.5 commitée le 23/09 (`fff1a7b`, `ce0564d`).
2. ✅ Reformatage `black` du desktop commité à part le 23/09 (`3918820`). Vérifié : `black` appliqué à la version HEAD donne exactement la copie de travail. Le seul vrai changement, un garde-fou sur le dossier d'export dans `vectorizer.py`, est isolé dans `6aa6451`.
3. ~~Push GitHub bloqué par les vidéos >100 Mo~~ : **déjà réglé** (nettoyage fait, branche `backup-before-video-cleanup` conservée). Push vérifié le 23/09.
4. La 1.2.1 a été buildée **avant** le découpage `app.py` → `core/` + `ui/` du 19/08. Comme pour InOneShot, la V2 sera le premier build de la nouvelle structure : il faudra tester le parcours complet sur le build packagé.

## 1. Périmètre V2 — P1 (conversion, indispensable)

### 1.1 Analytics PostHog (à faire en premier pour mesurer)
- Utiliser le **même projet PostHog EU** que les apps Android (`eu.i.posthog.com`, clé `phc_yfH9…` déjà dans `analytics_service.dart`), avec **`app: "vectorpop_desktop"` sur tous les events** sans exception (cf. le piège VoxCut qui ne tague pas `app`).
- Conserver l'UUID anonyme actuel de `analytics.py` (`_client_id()`) comme `distinct_id`. Envoi en arrière-plan, échecs silencieux. **Exception** : `pro_buy_clicked` en envoi synchrone (1,5 s max), car le thread daemon est tué quand l'app se ferme juste après l'ouverture du navigateur. Bug déjà vu sur VoxCut PC, qui comptait 0 clic pour 36 vues.
- Garder les mêmes noms d'events qu'Android pour pouvoir comparer les deux funnels : `app_opened`, `onboarding_started`, `onboarding_step_viewed`, `onboarding_usecase_selected`, `onboarding_completed`, `onboarding_skipped`, `sample_model_selected`, `image_picked` (largeur, hauteur, taille, alpha, source : fichier / glisser / coller), `vectorize_started` (preset, précision, fond, IA), `vectorize_completed` (durée, poids SVG), `vectorize_failed`, `export_svg`, `export_png` (résolution), `export_pdf`, `copy_clipboard`, `batch_started` / `batch_completed` (nombre), `autotune_used`, `quota_reached`, `paywall_viewed` (source), `pro_buy_clicked`, `license_activated`, `first_export_celebrated`, `update_banner_shown`.
- Propriétés communes : `app_version`, `os` (windows/linux), `channel` (exe / msix / portable / appimage / snap), `lang`, `is_pro`.
- Garder l'endpoint GA4 `vectorpop.fr/api/track` en parallèle pendant une version, puis le retirer une fois PostHog validé.
- Respecter la case « statistiques anonymes » si elle existe. Sinon, l'ajouter dans les réglages (le Store et le RGPD s'y attendent).

### 1.2 Vrai écran Pro (remplace le `QMessageBox`) ✅ FAIT le 23/09
- Nouveau `ProDialog` (`ui/dialogs.py`) inspiré de `paywall_sheet.dart` :
  - badge « Accès à vie — sans abonnement » ;
  - bannière de preuve de valeur : « Vous avez déjà vectorisé N images » (`UsageTracker.total_exports()` existe déjà) ;
  - titre selon le contexte : fonction verrouillée (« Débloquez *Traitement par lot* ») ou quota atteint (« Continuez avec VectorPop Pro ») ;
  - avantages **qui correspondent au code desktop** : exports illimités, PDF vectoriel + PNG HD, traitement par lot, détourage IA + finition IA ×4 en local, bouton Optimiser, suppression d'aplats ;
  - CTA dégradé « Débloquer VectorPop Pro — 39 € » (+ `LANCEMENT30` s'il est toujours actif), « J'ai déjà une clé », « Plus tard » ;
  - réassurance : paiement unique via Lemon Squeezy, 3 activations, 30 jours satisfait ou remboursé (à aligner sur le variant A/B gagnant du site, cf. `abtest-reassurance-report.ps1`).
- ⚠️ Ne pas reprendre « licence commerciale à vie » ni « zéro filigrane » d'Android sans vérifier que les CGV (`/terms`) le disent bien. On a déjà retiré un argument non tenu sur InOneShot.
- Remplacer tous les appels à `_show_upsell` (`_require_pro`, `_can_export_now`) par ce dialogue, avec la source passée pour `paywall_viewed`.

### 1.3 Modèles démo ✅ FAIT le 23/09
- Remplacer le logo généré de `load_demo_image` par les **4 modèles d'Android** (copier `vectorpop_android/assets/samples/*.png` dans `vectorpop/assets/samples/`, et les ajouter au `.spec` PyInstaller, à l'installeur, au payload MSIX et à l'AppImage).
- Sur l'écran vide (`DropImage`) : 4 vignettes cliquables avec titre FR/EN, à la place du simple lien « essayer un exemple ». Chaque modèle applique son preset (`flat` / `detailed` / `bw` → presets desktop équivalents dans `core/recipes.py`).
- Ajouter aussi une entrée de menu « Ouvrir un exemple » pour y revenir plus tard.
- ⚠️ Piège `QSettings` : les sliders persistés sont rechargés **par-dessus** les presets. Charger un modèle démo doit forcer les valeurs du preset, sinon le rendu démo dépend des derniers réglages de l'utilisateur.

### 1.4 Onboarding au premier lancement ✅ FAIT le 23/09 (4 écrans, pas 5 : voir note)
- Fenêtre modale reprenant les 5 écrans Android, FR/EN, textes déjà écrits dans `i18n.dart` (`onboarding*`, `profile*`) :
  1. Promesse : « Transformez vos images en tracés parfaits »
  2. Bitmap vs vectoriel (visuel avant/après : zoom flou vs net)
  3. « Quel est votre usage principal ? » : logos / mascottes / signatures-gravure N&B / flocage-sérigraphie. Le choix **règle le preset par défaut et ouvre le modèle démo correspondant**.
  4. 100 % local : « vos images ne quittent jamais votre ordinateur, aucun compte »
  5. Quota gratuit + Pro (texte adapté à la décision §1.6)
- Versionnement : `onboarding_version` dans `data_dir()` + constante `ONBOARDING_VERSION`. Les utilisateurs existants le revoient quand on l'incrémente.
- ⚠️ **Correction en cours de route** : Android combine en réalité les écrans « 100 % local » et « quota + Pro » sur un seul écran (4 pages au total, pas 5 comme décrit ci-dessus au départ) -- le desktop suit fidèlement Android : 4 pages.
- **Bouton « Passer » : à trancher.** Android l'a (avec tracking), InOneShot desktop non. Sur VoxCut Android, 110 skips sur 150 à l'étape 1 étaient des passages volontaires, pas des abandons. Recommandation : le garder et suivre `onboarding_skipped` par étape.

### 1.5 Moments du funnel après export ✅ FAIT le 23/09
- **1er export réussi** (gratuit) : petite fenêtre de célébration (`export_celebration_sheet.dart`) avec « Ouvrir le fichier » / « Ouvrir le dossier » en action principale, les 2 atouts (local, netteté infinie), puis un lien discret « Découvrir Pro ». Même hiérarchie que l'`ExportDoneDialog` de VoxCut PC.
- **Dernier export gratuit** : message dans la barre d'état ou petit bandeau « Dernier export gratuit utilisé » + bouton Pro. Pas de popup bloquante.
- **Demande d'avis** : pas d'API d'avis native sur desktop (sauf Store). Reprendre le principe VoxCut PC : 👍 / 👎 après 3 exports **et** au moins un fichier ouvert, demandé une seule fois. 👍 mène à la fiche Microsoft Store (ou au site pour les autres canaux), 👎 ouvre un mailto de retour.

### 1.6 Refonte du freemium (demandée par William le 23/09)

**Modèle actuel (depuis le 17/07)**
- Gratuit : vectorisation illimitée, 3 presets, tous les réglages, suppression de fond par couleur, **3 exports SVG par jour** (la copie presse-papiers compte aussi).
- Pro (39 €) : exports illimités, PDF et PNG HD, détourage IA, finition IA ×4, Optimiser, suppression d'aplats, traitement par lot.

**Le problème**
VectorPop sert de façon ponctuelle : on vectorise 1 à 3 logos, puis on revient des semaines plus tard. Avec 3 exports par jour, la plupart des utilisateurs gratuits **ne touchent jamais le mur**. Le gratuit couvre donc tout le besoin, et c'est cohérent avec les chiffres : 185 téléchargements tous canaux au 23/09, aucune vente desktop connue en dehors de l'achat test du 19/07 (à confirmer dans Lemon Squeezy). Android a fait le même constat et est passé à 3 exports au total.
Autre problème : les fonctions Pro ne sont pas visibles avant l'achat. Le détourage IA, Optimiser et la suppression d'aplats sont bloqués dès le clic, donc l'utilisateur ne voit jamais ce qu'il paierait.

**✅ Validé par William le 23/09 (5 exports + Pro visible dans l'aperçu), implémenté le 23/09** (lot 2 du plan de vérification).

**Proposition (recommandée)**
1. **Quota à vie pour les nouvelles installations : 5 exports gratuits au total** (SVG ou copie presse-papiers).
   - Pourquoi 5 et pas 3 comme Android : sur PC, on teste souvent 2 ou 3 réglages sur la même image avant de garder le bon.
   - Les exports lancés depuis un modèle démo ne comptent pas.
2. **Utilisateurs existants conservés sur 3 par jour** (équivalent de `isEarlyUser`). Pour les détecter : `UsageTracker` a déjà un fichier avec un historique d'exports, ou `total_exports() > 0` au premier lancement de la 2.0.0. Pas de mauvaise surprise pour eux.
3. **Pro visible avant l'achat (principe testé sur VoxCut PC)** : le détourage IA, Optimiser, la suppression d'aplats et la finition IA sont **utilisables dans l'aperçu** en gratuit. Le verrou n'intervient qu'à l'export : « Ce rendu utilise *Détourage IA* (Pro) ». Il reste possible d'exporter la version sans les fonctions Pro. Le traitement par lot, le PDF et le PNG HD restent verrouillés d'emblée, car ils n'ont pas d'aperçu à montrer.
   - Attention au coût : la finition IA prend plusieurs secondes à quelques minutes en CPU. En gratuit, le premier usage déclenche aussi le téléchargement du modèle (~120 Mo pour rembg). C'est acceptable, mais il faut l'annoncer clairement.
4. Compteur toujours visible dans la barre : « 3/5 exports gratuits restants », et « 2 restants aujourd'hui » pour les utilisateurs existants.
5. Le prix reste à **39 €** (Android : 12,99 €). L'écart se justifie par le lot, le PDF, l'IA sur PC et la licence sur 3 postes. Pas de bundle en V2. Le code `LANCEMENT30` est à vérifier : s'il est épuisé, le retirer du lien de checkout.

**Alternatives écartées**
- Filigrane sur l'export gratuit : un SVG avec filigrane est inutilisable et facile à retirer à la main. C'est contraire au positionnement « propre et éditable ».
- Export gratuit en qualité réduite (moins de couleurs, lissage) : l'utilisateur jugerait le produit sur un résultat volontairement dégradé.
- Passage à l'abonnement : contraire à l'argument n°1 contre Canva, Vectorizer.AI et Adobe.

**Mesure (grâce au §1.1)**
Suivre `quota_reached`, `paywall_viewed` par source, `pro_buy_clicked` et l'export auquel les utilisateurs partent. Il faut aussi comparer les nouveaux utilisateurs (quota à vie) aux anciens (quota par jour). Point de décision à 30 jours après la release, avec 100 nouveaux utilisateurs minimum.

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

### 2.6 Nouvelles évolutions proposées (23/09, à valider par William)
Le but est de renforcer ce que Pro apporte sur PC, là où le mobile ne peut pas suivre (volume, fichiers de production).

**A. Traitement par lot 2.0** (existe déjà en Pro, mais en version minimale : choix d'un dossier, un format, les réglages courants, un bilan en `QMessageBox`)
- Glisser-déposer **plusieurs fichiers ou un dossier** sur la fenêtre, en plus du sélecteur de dossier. Option « inclure les sous-dossiers ».
- Liste des fichiers avec vignette et statut (en attente / OK / avertissement / erreur), « Relancer les échecs », « Ouvrir le dossier de sortie » à la fin.
- **Plusieurs formats en une passe** (SVG + PNG + PDF cochables) et modèle de nom (`{nom}_vector`, sous-dossier par format).
- Option « Optimiser chaque image » (autotune par fichier). C'est lent, avec une estimation affichée, mais c'est le vrai avantage face aux outils en ligne qui facturent à l'image.
- Effort : moyen (1 à 2 jours). Valeur : forte, c'est l'argument n°1 de la version PC (`paywallDesktopHint` sur Android).

**B. Exports « production » pour la découpe et la gravure** (le profil « Signatures & gravure / découpe laser, vinyle » de l'onboarding)
- **DXF** (découpeuses laser, CNC, logiciels Silhouette et LightBurn), avec `ezdxf` et les tracés SVG convertis en polylignes.
- **EPS** (imprimeurs, sérigraphie).
- **Un fichier par couleur** (séparation de teintes pour la sérigraphie et le flocage) : un SVG ou PDF par aplat de couleur.
- Effort : moyen. Valeur : ouvre un public prêt à payer (makers, ateliers de flocage), peu servi par Canva ou Vectorizer.AI.

**C. Palette de couleurs éditable**
- Liste des couleurs du SVG, avec la surface occupée. Un clic permet de recolorer, fusionner deux couleurs ou supprimer une couleur (généralise la « suppression d'aplat au clic »).
- « Limiter à N couleurs » après coup, sans refaire la vectorisation.
- Effort : moyen à élevé. Valeur : forte pour les logos, réduit les allers-retours vers Inkscape.

**D. Petits gains rapides**
- « Copier pour le web » : SVG inline, data URI, composant React.
- **Pack logo** : SVG + PNG 16 à 1024 px + `favicon.ico` en un clic. C'est un export à partir du vecteur, à ne pas confondre avec l'impasse « miniaturisation de logo par IA ».
- Choix du fond à l'export (transparent / blanc).
- Menu clic droit de l'Explorateur « Vectoriser avec VectorPop » (installeur Inno Setup uniquement, pas MSIX).
- Mode ligne de commande (`VectorPop.exe --batch in/ out/ --format svg`) pour les utilisateurs avancés.

**Recommandation** : ne pas alourdir la 2.0.0, qui est déjà chargée (freemium, onboarding, démo, écran Pro). Y ajouter seulement **A (lot 2.0)**, car il valorise directement le Pro que le nouveau freemium met en avant, plus « Ouvrir le dossier » et le choix du fond (D), qui coûtent peu. Prévoir **B puis C en 2.1**, et arbitrer avec les données PostHog (`batch_started`, formats d'export utilisés, `onboarding_usecase_selected` = gravure/flocage ?).

### 2.7 ⚠️ Conformité : les statistiques PostHog contredisent certains messages « aucun suivi »
- Android envoie des events PostHog depuis la refonte de septembre (`posthog_flutter`). Or le formulaire **Sécurité des données** de la Play Console avait été rempli le 26/07 en « aucune donnée collectée », à une époque où l'app n'avait aucun SDK d'analytics. Les visuels du Store (`scripts/generate_store_screenshots.py`) affichent aussi « zéro traqueur ». **Il faut mettre à jour le formulaire Play Console** (données d'utilisation et identifiants d'appareil, anonymes, non partagés) et retirer « zéro traqueur » des visuels.
- Desktop V2 : même point pour la politique de confidentialité du site et la fiche Microsoft Store. Formulation honnête : « vos images ne quittent jamais votre ordinateur ; statistiques d'usage anonymes, sans compte ni donnée personnelle ». La case « statistiques anonymes » du §1.1 devient nécessaire avant la release.

## 3. Hors périmètre V2
- Changement de prix, bundle Android + desktop, licence partagée entre plateformes.
- Idées PerfectVector (mode « App Icon iOS », superposition des tracés avant export) : à évaluer en 2.1 avec `vectorpop-feature-ideas`.
- Génération de logos par IA (déjà écartée : l'IA générative produit du raster, pas du vrai SVG).
- Réécriture UI (glassmorphism, etc.) : on harmonise avec Android sans refaire le thème.

## 4. Release
- Version **2.0.0** partout : `vectorpop/__init__.py`, `installer.iss`, manifeste MSIX, `snapcraft.yaml`, `build_linux.sh`.
- Canaux : installeur Inno Setup, MSIX Store, zip portable, AppImage + tar.gz Linux, Snap, via `/release VectorPop 2.0.0`.
- ⚠️ **Site à aligner sur le nouveau freemium le jour de la release, pas avant** (la 1.2.1 en ligne est encore à 3 par jour) : `site/src/routes/index.tsx` (« 3 SVG exports per day » l.157, « 3 exports SVG par jour » l.362, et la FAQ « ce n'est pas une version d'essai » l.247/452, qui devient fausse), `site/src/lib/blog-posts.ts` (l.117, 219, 412), la fiche Microsoft Store et les pages annuaires.
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
1. ✅ Fait le 23/09 : Android commité (`fff1a7b`, `ce0564d`), black desktop (`3918820`), correctif vectorizer (`6aa6451`), poussé.
2. ✅ Push OK, rien à réécrire.
3. Analytics PostHog (1.1).
4. `ProDialog` (1.2).
5. Modèles démo (1.3), puis l'onboarding (1.4), qui s'appuie dessus.
6. Moments post-export (1.5).
7. P2 (2.1 → 2.5), puis tests sur le build packagé et release 2.0.0.
