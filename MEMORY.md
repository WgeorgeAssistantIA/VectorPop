# Mémoire du Projet : VectorPop

## État Actuel (Septembre 2026)
- **Application Desktop** : VectorPop Windows (MSIX / Store) et Linux (AppImage / Snap) en production.
- **Application Mobile (vectorpop_android)** : Version Flutter Android `1.0.3+5` passée en production sur le Play Store, avec moteur Rust VTracer embarqué (vectorisation 100% locale ultra-rapide).
- **Fiche Google Play Store** : Visuels haute conversion (smartphone, tablette 7" et 10", feature graphic) et métadonnées bilingues (FR/EN) prêts pour la mise à jour de la fiche Play Store.
- **Site Web** : `vectorpop.fr` actif.

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

---

## Prochaines Étapes / Backlog
- Mettre à jour la fiche Google Play Console avec les nouveaux textes et les visuels `capture d'écran/playstore/`.
- Suivre la validation de la mise à jour par les équipes de Google Play.
- Implémenter l'invite d'avis in-app (`in_app_review`) après une première vectorisation ou un export réussi.
- Suivre les retours utilisateurs sur le moteur Rust Android.
