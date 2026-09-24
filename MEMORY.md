# Mémoire du Projet : VectorPop

## État Actuel (Septembre 2026)
- **Application Desktop V2 (2.0.0)** : Production complète déployée le 24 Septembre 2026 :
  - **Snap Store (Canonical)** : Publié sur le canal `stable` (Révision 4).
  - **Windows Store** : Paquet MSIX 2.0.0 soumis sur Partner Center.
  - **GitHub Releases** : Release `v2.0.0` publiée avec 6 artefacts binaires (EXE, MSIX, ZIP, AppImage, Tar.gz, Snap).
  - **Site Web (`vectorpop.fr`)** : Mis à jour en 2.0.0 (`version.json` 2.0.0, liens v2.0.0, Freemium 2.0).
- **Application Mobile (vectorpop_android)** : Version Flutter Android `1.0.3+5` passée en production sur le Play Store, avec moteur Rust VTracer embarqué (vectorisation 100% locale ultra-rapide).
- **Fiche Google Play Store** : Visuels haute conversion (smartphone, tablette 7" et 10", feature graphic) et métadonnées bilingues (FR/EN) prêts pour la mise à jour de la fiche Play Store.


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

---

## Prochaines Étapes / Backlog
- Suivre la validation de la soumission MSIX 2.0.0 sur le Microsoft Partner Center.
- Suivre les premiers événements analytiques PostHog de la V2 desktop (`app: "vectorpop_desktop"`).
- Côté Android : Mettre à jour la fiche Google Play Console avec les nouveaux textes et les visuels `capture d'écran/playstore/`, et ajuster le formulaire Data Safety (déclarer PostHog anonyme).
- Évaluer les retours utilisateurs sur le profil gravure/découpe pour les fonctionnalités V2.1 (DXF, EPS, palette).

