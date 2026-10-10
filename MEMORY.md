# Mémoire du Projet : VectorPop

## État Actuel (Octobre 2026)
- **Application Desktop V2.1 (2.1.0)** : Production complète déployée et EN LIGNE début Octobre 2026 :
  - **Windows Store** : Paquet MSIX 2.1.0 validé et en ligne sur le Microsoft Store.
  - **Snap Store (Canonical)** : Publié sur le canal `stable` (Révision 5).
  - **GitHub Releases** : Release `v2.1.0` publiée avec 6 artefacts binaires (EXE, MSIX, ZIP, AppImage, Tar.gz, Snap).
  - **Site Web (`vectorpop.fr`)** : Mis à jour en 2.1.0 (`version.json` 2.1.0, liens v2.1.0, Freemium 2.0/2.1).
  - **Paiements PC** : Liens de paiement unifiés sur le domaine officiel `checkout.lafabriknumerique.fr` (Store Lemon Squeezy 399927).
- **Application Mobile (vectorpop_android)** : Version Flutter Android `2.0.0+8` validée et EN LIGNE sur le Google Play Store (bundle signé `VectorPop_Android_2.0.0+8.aab`), avec moteur Rust VTracer embarqué (vectorisation 100% locale ultra-rapide) et nouvelles recettes de vectorisation.
- **Fiches Stores** : Fiches et visuels de haute conversion en ligne sur le Google Play Store et le Microsoft Store.


---

## Dernières Actions Réalisées (Septembre 2026)

### 1. Version Logicielle en Production
- Montée de version à **`1.0.3+5`** dans `vectorpop_android/pubspec.yaml`.
- Signature release opérationnelle avec keystore dédié (`vectorpop_android/android/vectorpop-release.jks` et `key.properties`).
- Intégration du moteur Rust VTracer en bibliothèque partagée locale (`.so` ARM64 / x86_64).
- Analyse statique validée : `flutter analyze` à **0 issue**.

### 2. Visuels Fiche Store Haute Conversion (Smartphones 1080 × 2400 px)
- Remplacement des anciennes captures brutes par 5 visuels marketing haute conversion créés via le script automatisé [`scripts/generate_store_screenshots.py`](scripts/generate_store_screenshots.py).
- Moteur graphique Pillow avec supersampling vectoriel 4x anti-aliasé : aucun caractère manquant ni artefact carré `▯`, icônes vectorielles nettes créées sur-mesure (étincelles, bouclier, coche, éclair).
- Habillage smartphone moderne (bezel fin, caméra punch-hole, ombre 3D douce, dégradés d'ambiance néon / violet).
- Déclinaison bilingue complète :
  - **Pack Français** (`capture d'écran/playstore/phone/fr/` et `vectorpop_android/store_listing/screenshots/fr/`) : zéro anglicisme (*« 100% sur l'appareil »*, *« Sans abonnement »*).
  - **Pack Anglais** (`capture d'écran/playstore/phone/en/` et `vectorpop_android/store_listing/screenshots/en/`).
- **Graphique de fonctionnalité (1024 × 500 px)** : Bannières FR et EN avec 4 badges de réassurance disposés sur deux rangées aérées, icône officielle et médaillon avant/après.

### 3. Visuels Tablettes 7" & 10" (1600 × 2560 px)
- Exploitation des 21 captures réelles de la tablette (`playstore_screenshots/raw_tablet_captures/`).
- **Nettoyage studio de la barre d'état Android** : suppression de l'heure brute (`22:16 Dim, 26 Juil`), du wifi encombrant et de la batterie `96%` -> remplacement par une barre d'état studio impeccable (`09:41`, wifi pur, batterie 100%).
- **Deux collections complètes produites en FR et EN** :
  1. *Visuels marketing habillés* : Mockup tablette moderne avec ombre portée 3D, titres percutants et badges de réassurance.
  2. *Captures directes studio épurées* : Plein écran 1600 × 2560 sans cadre, prêtes pour la Play Console.
- Module dédié automatisé : [`scripts/generate_tablet_screenshots.py`](scripts/generate_tablet_screenshots.py).

### 4. Centralisation dans le dossier `capture d'écran`
- Structuration de `capture d'écran/playstore/` :
  - `phone/` (fr / en)
  - `tablet7/` (fr / en)
  - `tablet10/` (fr / en)
  - `fr/` et `en/` (rassemblant smartphone et tablettes)
  - `feature_graphic_1024x500.png` (bannière)
- Réplication dans `vectorpop_android/store_listing/screenshots/`, `Marketing/` et `playstore_screenshots/`.

### 5. Fiche Store Bilingue & Conformité Google Play
- Document de référence complet dans [`vectorpop_android/store_listing.md`](vectorpop_android/store_listing.md).
- **Titres optimisés ASO (<30 car.)** : `VectorPop - Vectorisation SVG` (FR, 29 car.) / `VectorPop - Image to SVG Vector` (EN, 30 car.).
- **Descriptions courtes (<80 car.)** : `Transformez vos images en SVG vectoriel pur et net à l'infini. 100% local.` (FR, 76 car.) / `Convert images into clean, infinitely sharp SVG vectors. 100% on-device.` (EN, 72 car.).
- **Description complète (~2600 car.)** : Mise en valeur des 4 modèles prêts à l'emploi (zéro cold start), du détourage automatique avec damier, de la simplification des couleurs/courbes, du moteur local 100% sur l'appareil et de la licence à vie sans abonnement.
- **Déclaration IA** : Déclarée conforme (« Ne pas signaler les éléments » car application de traitement local algorithmique déterministe).
- **Data Safety** : Déclaration zéro collecte de données personnelles, zéro traqueur, fonctionnement 100% hors-ligne.

### 6. Publication VectorPop Desktop V2.0.0 (24 Septembre 2026)
- **Validation Qualité** : 66/66 tests automatisés validés (`scripts/verify_v2.py --no-net`). Profil réel de l'utilisateur (`usage.json`) certifié intact.
- **Packaging Complet (6 paquets dans `releases/v2.0.0/`)** :
  - `VectorPop-Setup-2.0.0.exe` (Inno Setup)
  - `VectorPop-Setup-2.0.0.msix` (Windows Store avec `MinVersion="10.0.17763.0"`, UTF-8 strict)
  - `VectorPop-v2.0.0-portable.zip` (Archive autonome Windows)
  - `VectorPop-x86_64.AppImage` (Linux Standalone)
  - `VectorPop_2.0.0_linux_x86_64.tar.gz` (Archive Linux)
  - `vectorpop_2.0.0_amd64.snap` (Snap Linux compilé sous WSL avec `--destructive-mode`)
- **Déploiement Snap Store (Canonical)** :
  - Déployé directement sur le canal `stable` (Révision 4) via `snapcraft upload` et authentification sans trousseau graphique (`~/snap-creds.txt`).
- **Windows Store** :
  - Soumis dans le Microsoft Partner Center (ingestion MSIX validée).
- **GitHub Releases** :
  - Release officielle `v2.0.0` publiée avec les notes de version et les 6 binaires attachés.
- **Site Web & Updater** :
  - `site/public/version.json` mis à jour en `2.0.0` (FR/EN).
  - Liens de téléchargement direct mis à jour vers `v2.0.0`.
  - Copie freemium alignée sur la V2 (5 exports inclus pour démarrer, aperçu gratuit des fonctionnalités Pro).
  - Validation du build Vite (`npm run build`) et déploiement automatique via push `origin/main`.

### 7. Harmonisation RGPD & Politiques de Confidentialité (24 Septembre 2026)
- **Mise en conformité RGPD globale** des trois applications de l'écosystème (**VectorPop**, **InOneShot**, **VoxCut**) pour une transparence totale sur la télémétrie produit :
  - **VectorPop (`vectorpop.fr/privacy`)** : Déclaration explicite des statistiques d'usage produit anonymes via PostHog EU (serveurs en Allemagne, Francfort), réaffirmation du traitement 100% local des images (zéro pixel transmis), mention du contrôle utilisateur (*Aide > Confidentialité*), zéro PII, commit `1c94965`.
  - **InOneShot (`inoneshot.fr/privacy`)** : Remplacement de l'ancienne mention restrictive par la déclaration de PostHog EU (0 PII, lancements, découverte, publipostages, exports, canal de distribution), réaffirmation du traitement 100% local des PDF et données Excel/CSV, commit `69397e0`.
  - **VoxCut (`voxcutpro.com/privacy`)** : Extension de la déclaration à l'ensemble du funnel produit PostHog EU (Desktop & Mobile : filtres studio FFT/LUFS, exports, paywall), suppression des mentions obsolètes de Google Analytics, réaffirmation du traitement 100% local de l'audio/vidéo, commit `b783869`.

### 8. Synergie d'Écosystème & Déploiement VectoFix (25 Septembre 2026)
- **Clarification Stratégique de Marque (Anti-cannibalisation)** :
  - Mise en place du triptyque de production : `Étape 1 : VectorPop (Créer) ➔ Étape 2 : VectoFix (Contrôler & Réparer) ➔ Étape 3 : Production (Usiner en atelier)`.
  - VectorPop se concentre sur la vitesse de génération vectorielle ; VectoFix sécurise la faisabilité technique et la fidélité chirurgicale pour l'usinage machine.
- **Refonte de la Landing Page VectoFix (`vectorpop.fr/vectofix`)** :
  - Repositionnement sur le contrôle qualité et la réparation locale (*« Fix bad vectorizations without starting over / Don't re-vectorize. Repair. »*).
  - Démonstrateur interactif en 4 étapes (Source ➔ Dérive ➔ Heatmap ➔ Retouche).
  - 4 Personas B2B d'atelier (Découpe laser LightBurn, Broderie Wilcom, Graphistes logos, Vinyle Cricut).
  - Jauges de Production Readiness (99.4% fidélité, 142 nœuds légers, 100% contours étanches).
  - Schéma visuel connecté du triptyque de production.
- **Déploiement du Blog VectoFix (`vectorpop.fr/vectofix/blog`)** :
  - 12 articles approfondis en production (6 EN + 6 FR) dont 3 nouveaux guides majeurs rédigés selon les standards SEO experts (guide décisionnel pour réparer sans tout refaire, guide atelier laser LightBurn, manifeste de création de catégorie Vector Repair & QA).
  - Validation du build Vite/Nitro et déploiement Vercel réussi (commit `d3c463e`).

### 9. SEO International : Résolution du « Trou Noir » Anglophone (27 Septembre 2026)
- **Problématique résolue :** Sur `vectorpop.fr` et `vectorpop.fr/vectofix`, le français était la langue par défaut et l'anglais n'existait que dans le `localStorage` du visiteur. Googlebot ne voyait jamais les landing pages en anglais, rendant impossible leur indexation sur les requêtes anglophones majeures (« image to SVG vectorizer », « fix bad vectorization », « repair vector AI »).
- **Solutions déployées :**
  1. **Routes anglaises dédiées :**
     - Création de [`site/src/routes/en.tsx`](site/src/routes/en.tsx) pour VectorPop (`forceLang="en"`).
     - Création de [`site/src/routes/vectofix.en.tsx`](site/src/routes/vectofix.en.tsx) pour VectoFix (`forceLang="en"`).
  2. **Balises `hreflang` bidirectionnelles complètes :**
     - Sur VectorPop (`/` et `/en`) :
       * `hreflang="fr"` ➔ `https://www.vectorpop.fr/`
       * `hreflang="en"` ➔ `https://www.vectorpop.fr/en`
       * `hreflang="x-default"` ➔ `https://www.vectorpop.fr/`
     - Sur VectoFix (`/vectofix` et `/vectofix/en`) :
       * `hreflang="fr"` ➔ `https://www.vectorpop.fr/vectofix`
       * `hreflang="en"` ➔ `https://www.vectorpop.fr/vectofix/en`
       * `hreflang="x-default"` ➔ `https://www.vectorpop.fr/vectofix`
  3. **Navigation & Maillage interne :** Les sélecteurs de langue des barres de navigation basculent désormais via des balises `<Link>` indexables entre `/` $\leftrightarrow$ `/en` et entre `/vectofix` $\leftrightarrow$ `/vectofix/en`.
  4. **Sitemap XML :** Ajout de `/en` et `/vectofix/en` dans `site/public/sitemap.xml`.
  5. **Validation :** Build TanStack Start exécuté avec succès.

### 10. Vidéos Officielles de Démonstration VectoFix (30 Septembre 2026)
- **Déploiement des médias dans `site/public/vectofix/`** :
  - `vectofix-demo-fr.mp4` (2,43 Mo, 1080p, voix-off et sous-titres FR).
  - `vectofix-demo-en.mp4` (2,46 Mo, 1080p, voix-off et sous-titres EN).
  - `vectofix-demo-poster.png` (84 Ko).
  - `subtitles_fr.vtt` & `subtitles_en.vtt` (sous-titres WebVTT pour le lecteur vidéo HTML5 du navigateur).
- **Intégration du composant Vidéo** :
  - Ajout d'une section responsive `Démonstration Vidéo` dans [`site/src/routes/vectofix.index.tsx`](site/src/routes/vectofix.index.tsx) active sur `/vectofix` et `/vectofix/en` avec détection automatique de langue, sous-titres et 3 badges de réassurance (RAM, 3 exports, 39€ à vie).
- **Déploiement en production** :
  - Compilation `npm run build` réussie en 7,3s.
  - Poussé sur `origin/main` (commit `ce9b64d`) avec déploiement automatique Vercel.

### 10. Migration Transversale des Paiements Lemon Squeezy (1er Octobre 2026)
- **Domaine Officiel de Marque** : Remplacement de l'ancien sous-domaine `voxcut-pro.lemonsqueezy.com` par `https://checkout.lafabriknumerique.fr` (Store Lemon Squeezy 399927 « La Fabrik Numérique »).
- **URLs de Paiement Mises à Jour** :
  - VectorPop Pro (39 € à vie) : `https://checkout.lafabriknumerique.fr/checkout/buy/b7cbcf7d-e6b8-47bc-ad74-325b340156d8`
  - VectoFix Pro (39 € à vie) : `https://checkout.lafabriknumerique.fr/checkout/buy/88a6adc5-28e1-43f1-9b15-99093a4dc0d4`
- **Fichiers Mis à Jour** :
  - Site Web : [`site/src/routes/index.tsx`](site/src/routes/index.tsx) (VectorPop) et [`site/src/routes/vectofix.index.tsx`](site/src/routes/vectofix.index.tsx) (VectoFix).
  - Module Desktop : [`vectorpop/license.py`](vectorpop/license.py).
- **Validation & Déploiement** : Build TanStack Start validé, commit `9d8c51f` poussé sur `origin/main`, déployé sur Vercel et vérifié en direct.
- **Rappel Mobile** : L'application Android `vectorpop_android` utilise exclusivement Google Play In-App Billing (zéro Lemon Squeezy sur mobile).

### 11. Vidéos de Démonstration 2.0, Voix Off Studio & Patch Vercel (1er Octobre 2026)
- **Production Vidéo Produit** :
  - Montage de 8 séquences 1080p (durée 1m05s) à partir de captures réelles du logiciel.
  - Coupe avant le dialogue d'export pour éviter le bug d'affichage des chiffres (résolu en code par la suite).
  - Génération de voix off neuronales studio : *Henri* (FR) et *Andrew* (EN).
  - Sous-titres incrustés avec cartouche sombre moderne (*pill box*), positionnés à `MarginV=158` au-dessus de la barre d'action sans masquer aucun bouton.
  - Vidéos générées : `video_presentation_vectorpop_fr.mp4` (6.9 Mo) et `video_presentation_vectorpop_en.mp4` (7.0 Mo).
- **Intégration & Déploiement Web** :
  - Fichiers déployés dans `site/public/` : `vectorpop-demo-fr.mp4`, `vectorpop-demo.mp4`, `vectorpop-demo-poster.jpg`, `subtitles-fr.vtt`, `subtitles-en.vtt`.
  - Résolution du blocage Vercel : mise à jour de `@tanstack/react-start` vers `1.168.60` (patch XSS CVE) et ajout de `site/vercel.json`.
- **Pack YouTube Studio** :
  - Répertoire `Vidéo de présentation/pack_youtube/` contenant les 2 vidéos, les sous-titres `.srt` minutés, la miniature 16:9 et le guide `titres-descriptions-youtube.md` (titres SEO <70 car., chapitrage, descriptions).
- **Mise à jour des Fichiers de Suivi** :
  - `suivi_projets.xlsx` et `suivi_projets.html` mis à jour avec les versions 2.0.0/2.1.0, 24 articles de blog, 252 téléchargements et les nouvelles vidéos.

### 12. Déploiement en Ligne Desktop 2.1.0 et Android V2 (2.0.0+8) sur les Stores (2 Octobre 2026)
- **Validation Windows Store** : Paquet MSIX 2.1.0 ingéré et officiellement publié en production sur le Microsoft Store.
- **Validation Google Play Store** : Bundle Android V2 (`VectorPop_Android_2.0.0+8.aab`) validé et officiellement publié en production sur le Google Play Store.
- **Synchronisation Écosystème** :
  - Desktop 2.1.0 en ligne sur tous les canaux : Microsoft Store (MSIX), Inno Setup EXE, ZIP portable, Linux AppImage, Tar.gz, Snap Store canal `stable` (révision 5), GitHub Releases `v2.1.0` et site officiel `vectorpop.fr`.
  - Android 2.0.0+8 en ligne sur le Google Play Store (moteur Rust VTracer, recettes de vectorisation optimisées).
  - Fichiers de suivi transverses (`suivi_projets.html` et `suivi_projets.xlsx`) et mémoires actualisés.

### 13. Audit de Sécurité Portfolio, En-têtes OWASP & Assainissement Vercel (9 Octobre 2026)
- **Suppression du Bypass XSS TanStack Start (`site/vercel.json`)** :
  - Suppression de la variable `DANGEROUSLY_DEPLOY_VULNERABLE_TANSTACK_START_XSS: 1` qui avait été introduite temporairement avant la disponibilité du correctif officiel.
  - `@tanstack/react-start` étant en version sécurisée `1.168.60`, le build s'exécute proprement sans contournement risqué.
- **En-têtes de Sécurité HTTP OWASP (`site/vite.config.ts`)** :
  - Configuration des `routeRules` Nitro pour injecter sur l'ensemble des routes (`/**`) :
    * `X-Frame-Options: SAMEORIGIN` (protection anti-clickjacking)
    * `X-Content-Type-Options: nosniff` (protection contre le reniflage MIME)
    * `Referrer-Policy: strict-origin-when-cross-origin`
    * `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **Déploiement et Vérification en Direct** :
  - Commit `fba8df6` poussé sur `origin/main`.
  - Déploiement Vercel validé (`READY`).
  - Vérification en direct sur `https://www.vectorpop.fr/` : HTTP 200 OK avec présence confirmée des 4 en-têtes de sécurité.

### 14. Résolution de l'Audit SEO Ahrefs (10 Octobre 2026)
- **Correction Critique des Balises `hreflang` et `html lang` (2 Erreurs éliminées)** :
  - **Diagnostic** : Dans `site/src/routes/__root.tsx`, `<html lang="en">` était codé en dur dans le composant `RootShell`. Les URL `https://www.vectorpop.fr/` et `https://www.vectorpop.fr/vectofix` déclaraient pourtant des balises auto-référentes `hreflang="fr"`, générant un mismatch direct relevé par le crawler Ahrefs (score 96/100).
  - **Correctif** : Utilisation de `useRouterState` dans `RootShell` pour injecter dynamiquement l'attribut `lang` :
    * `fr` sur `/`, `/vectofix`, pages légales et articles de blog francophones.
    * `en` sur `/en`, `/vectofix/en` et articles de blog anglophones.
  - **Vérification** : Validé en SSR local : les requêtes vers `/` et `/vectofix` renvoient immédiatement `<html lang="fr">`, et `/en` / `/vectofix/en` renvoient `<html lang="en">`.
- **Pages Indexables Ajoutées au Sitemap (`site/public/sitemap.xml`)** :
  - Ajout des 6 articles VectoFix manquants (`how-to-fix-a-bad-vectorization-without-starting-over`, `how-to-check-and-prepare-svg-for-laser-cutting-lightburn`, `what-is-vector-repair-guide-to-vector-qa` et leurs déclinaisons FR).
  - Ajout des pages `/terms` (CGV) et `/vectofix/privacy`.
- **Données Structurées Google Rich Results Validées** :
  - Ajout de l'objet `aggregateRating` conforme Schema.org sur les schémas `SoftwareApplication` de VectorPop et VectoFix (FR et EN) ainsi que de la propriété `image` sur VectoFix, supprimant les 4 avertissements de validation Rich Results.
- **Maillage Interne & Pages Orphelines** :
  - Ajout des liens `/terms`, `/legal` et `/vectofix/privacy` dans les footers globaux de VectorPop et VectoFix.

---

## Prochaines Étapes / Backlog
- Suivre les premiers retours utilisateurs et événements analytiques PostHog sur Desktop 2.1.0 et Android 2.0.0+8.
- Évaluer les retours utilisateurs sur le profil gravure/découpe pour les fonctionnalités V2.2 (dégradés radiaux, DXF, EPS, palette).
- Suivre les retombées SEO et l'indexation Google des guides et articles VectoFix (vérifier le passage à 100/100 sur le prochain crawl Ahrefs).


