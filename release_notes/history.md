# Historique des Releases (Release Notes)

Ce fichier consolide l'historique de toutes les versions de VectorPop.

## Version 2.0.0 (Desktop)
**Date** : 24 Septembre 2026
**Plateformes** : Windows (EXE, MSIX, portable), Linux (AppImage, tar.gz, Snap)
- **Funnel de conversion 2.0** :
  - Télémétrie PostHog intégrée (~25 événements analytiques) avec détection automatique du canal de distribution.
  - Nouveau modèle Freemium 2.0 : 5 exports gratuits à vie pour les nouveaux utilisateurs (maintien des 3/jour pour les anciens via détection `usage.json`).
  - Utilisation libre de toutes les fonctions dans l'aperçu (détourage IA, finition IA x4, optimisation SVG, aplats) ; verrou uniquement au moment de l'export.
  - Nouvel écran `ProDialog` unifié avec mise en avant de la valeur, avantages contextuels et déclencheurs intelligents.
  - 4 modèles démo intégrés sur l'écran d'accueil pour tester sans image.
  - Onboarding interactif en 4 étapes et célébration du premier export avec incitation douce aux avis.
- **Traitement par lot 2.0** :
  - Interface dédiée (`BatchDialog`) avec vignettes en temps réel, statut par image, glisser-déposer de fichiers et dossiers.
  - Export multi-formats simultané (SVG, PNG haute résolution, PDF), sous-dossiers par format, gestion anti-écrasement des homonymes.
  - Relance ciblée des échecs seuls, annulation propre et ouverture automatique du dossier de sortie.
- **Performances & Ergonomie** :
  - Plafond de résolution de tracé à 2048 px : vectorisation 4x plus rapide, plus aucun gel mémoire sur les grosses photos.
  - Panneau Original zoomable/déplaçable (molette, clic droit).
  - Panneau SVG : zoom ultra-profond jusqu'à ~×12 000 avec pastille de zoom persistante.
  - Fondu visuel en bas du panneau de réglages et pastille « ★ Passer Pro » distinctive.
  - Détection automatique des mises à jour (`updater.py`) via `site/public/version.json`.
- **Validation** : 66 tests automatiques headless (`scripts/verify_v2.py`), 100% PASS.

## Version 1.0.4 (Android build 6)
**Date** : 16 Septembre 2026
**Plateforme** : Android (AAB, APK)
- **Décodage Robuste & Zéro Freeze** : Détection et correction d'un `RangeError` silencieux dans le décodeur Dart. Ajout d'un fallback matériel natif Skia (C++) pour décoder 100% des captures d'écran et photos sans plantage, avec sécurisation absolue par bloc `finally`.
- **Performance de Tracé x4** : Plafonnement de la résolution de tracé à 2048 px sur les photos de smartphone : traitement réduit de 37 s à 4-14 s, avec des SVG légers (200-400 Ko).
- **Export Ultra-HD 8K (8192px)** : Intégration officielle du choix 8K dans le dialogue d'export PNG et activation de `android:largeHeap="true"` pour un rendu mémoire stable.
- **Clarté du Quota** : Suppression définitive des mentions "par jour" / "restants aujourd'hui" pour aligner l'application sur le modèle strict de 3 exports d'essai gratuits au total.
- **Ergonomie** : Ajout du bouton "Nouvelle image" directement accessible pour enchaîner les vectorisations.
- **Build de Production** : Génération du bundle signé `VectorPop_Android_1.0.4+6.aab` et de l'APK `VectorPop_Android_1.0.4+6.apk` dans `releases/1.0.4+6/`.

## Version 1.0.2 (Android build 4)
**Date** : 16 Septembre 2026
**Plateforme** : Android (AAB)
- **Correction Critique Google Play Billing** : Ajout de la permission `<uses-permission android:name="com.android.vending.BILLING" />` dans `AndroidManifest.xml` débloquant l'ouverture du tunnel de paiement Google Play Store lors du tap sur le bouton Pro.
- **Build de Production** : Génération du bundle signé `VectorPop-1.0.2-release.aab` et notes de release en 15 langues.

## Version 1.2.1
**Date** : 18 Août 2026
**Plateformes** : Windows (EXE, MSIX), Linux (AppImage, tar.gz)
- **Nouveauté** : Ajout du funnel Pro (intégration Lemon Squeezy pour l'achat in-app).
- **Télémétrie** : Intégration de GA4 (Google Analytics 4) pour le suivi d'usage.
- **Linux** : Le build Snap a été ignoré/échoué en raison d'incompatibilités avec WSL et l'extension GNOME (mesa-2404) via LXD. L'AppImage reste le format recommandé.

## Version 1.2.0
- **Windows** : Version stable précédente.
- **Linux** : Version précédente, alignée sur la version Windows.
- Liens de téléchargements mis en place sur le site web (VectorPop.fr).

## Version 1.1.0
- **Linux** : Amélioration de l'empaquetage AppImage et scripts d'automatisation.
- **Windows** : Début des tests pour l'intégration Microsoft Store.

## Version 1.0.0 (build 2)
- **Android** : Version initiale Flutter/Android.

---
*Note : Les versions antérieures à la 1.1.0 n'ont pas fait l'objet de release notes détaillées.*
