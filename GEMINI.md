# VectorPop — Mémoire & Contexte du Projet

Ce fichier documente les décisions clés, les conventions, l'état de publication et les outils marketing de VectorPop. Il est chargé automatiquement par l'agent IA à chaque session.

---

## 🚀 État de Publication & Version Logicielle

* **Statut de production** : Version logicielle mobile (`vectorpop_android`) passée en production (Septembre 2026).
* **Fiche Play Store prête** : Métadonnées et visuels complets prêts pour mise à jour sur Google Play Console.
* **Version Android** : `1.0.3+5` (définie dans `vectorpop_android/pubspec.yaml`).
* **Application ID / Namespace** : `com.lafabriknumerique.vectorpop`.
* **Signature Release** : Keystore de production configuré (`android/vectorpop-release.jks` et `android/key.properties`).
* **Moteur natif** : Moteur Rust VTracer compilé en local pour Android (vectorisation 100% hors-ligne et instantanée).
* **Politique de confidentialité** : `https://www.vectorpop.fr/privacy` (zéro donnée collectée, zéro serveur distant).
* **Déclaration IA Google Play** : Déclarée sans contenu généré par IA (« Ne pas signaler les éléments » car outil déterministe en local).

---

## 🎨 Visuels Marketing & Captures d'Écran Store

* **Standards visuels** : Rendu anti-aliasé 4x supersampling pour tous les pictogrammes (zéro glyphe manquant `▯`), pas de bandeau `DEBUG`, barre d'état studio épurée (`09:41`, wifi net, batterie 100%).
* **Formats produits** :
  * **Smartphone** : `1080 × 2400 px` (20:9 FHD+ portrait, mockup smartphone moderne, badges glassmorphism).
  * **Tablettes 7" et 10"** : `1600 × 2560 px` (16:10 portrait, captures réelles nettoyées, versions habillées avec mockup tablette + captures directes studio épurées).
  * **Bannière (Feature Graphic)** : `1024 × 500 px` (obligatoire Play Store, fond sombre néon, médaillon avant/après, 4 badges équilibrés).
* **Scripts de génération automatisée** :
  * Commande complète : `python scripts/generate_store_screenshots.py` (génère smartphone, tablettes, bannières et synchronise tous les dossiers).
  * Module tablette : `python scripts/generate_tablet_screenshots.py`.
* **Organisation du dossier `capture d'écran`** :
  ```
  capture d'écran/
  ├── feature_graphic_1024x500.png
  └── playstore/
      ├── feature_graphic_1024x500.png
      ├── feature_graphic_fr_1024x500.png
      ├── feature_graphic_en_1024x500.png
      ├── fr/             (10 fichiers : 5 smartphone 1080x2400 + 5 tablette 1600x2560)
      ├── en/             (10 fichiers : 5 smartphone 1080x2400 + 5 tablette 1600x2560)
      ├── phone/
      │   ├── fr/         (5 visuels marketing 1080x2400)
      │   └── en/         (5 visuels marketing 1080x2400)
      ├── tablet7/
      │   ├── fr/         (5 visuels habillés + 5 captures directes épurées 1600x2560)
      │   └── en/         (5 visuels habillés + 5 captures directes épurées 1600x2560)
      └── tablet10/
          ├── fr/         (5 visuels habillés + 5 captures directes épurées 1600x2560)
          └── en/         (5 visuels habillés + 5 captures directes épurées 1600x2560)
  ```
* **Répertoires répliqués** :
  * `vectorpop_android/store_listing/screenshots/`
  * `playstore_screenshots/`
  * `Marketing/play_screenshots_tablet_7/` et `tablet_10/`

---

## 📝 Textes de Référence du Store (Play Console)

* Fichier de référence complet à copier-coller : [`vectorpop_android/store_listing.md`](vectorpop_android/store_listing.md).
* **Titres (<30 car.)** :
  * FR : `VectorPop - Vectorisation SVG` (29 car.)
  * EN : `VectorPop - Image to SVG Vector` (30 car.)
* **Descriptions courtes (<80 car.)** :
  * FR : `Transformez vos images en SVG vectoriel pur et net à l'infini. 100% local.` (76 car.)
  * EN : `Convert images into clean, infinitely sharp SVG vectors. 100% on-device.` (72 car.)
* **Piliers marketing clés** :
  1. **Netteté infinie sans pixellisation** : Conversion bitmap vers SVG pur (logos, dessins, photos).
  2. **Zéro Cold Start (4 modèles intégrés)** : Logo plat, graphisme couleur, dessin au trait N&B, badge/mascotte prêts à tester dès l'ouverture sans image sous la main.
  3. **Détourage & Transparence** : Suppression de fond automatique, damier en direct, prêt pour flocage, stickers, sérigraphie et gravure laser (Cricut, laser CO2).
  4. **100% sur l'appareil (Local & Confidentiel)** : Les images ne quittent jamais le smartphone/tablette, aucun upload cloud, respect strict du RGPD et de la propriété intellectuelle.
  5. **Modèle économique honnête** : 3 exports gratuits par jour avec tous les réglages, déverrouillage Pro en licence à vie (aucun abonnement récurrent).

---

## 🛠️ Règles de Développement Flutter / Dart

* Lors de modifications sur le code Dart / Flutter (`vectorpop_android/lib/`) :
  - Proactivement se connecter à l'app via le tool `dtd`.
  - Déclencher un `hot_reload`.
  - Si l'app ne tourne pas, informer l'utilisateur sans bloquer les modifications de code.
  - Maintenir `flutter analyze` à 0 erreur / 0 avertissement.
