# Plan de stress-test / robustesse — VectorPop (PNG/JPEG → SVG)

Objectif : trouver ce qui casse la vectorisation avant qu'un client s'en aperçoive.

## 1. Fichiers image d'entrée
- Image corrompue / tronquée, mauvaise extension (fichier renommé)
- Image très haute résolution (8K, 20+ Mpx) — temps de traitement, mémoire
- Image minuscule (1x1, 16x16 favicon)
- Image avec transparence (PNG alpha), avec canal alpha partiel/dégradé
- Image en niveaux de gris, en CMJN, palette indexée (GIF converti en PNG)
- Image 100% unie (une seule couleur) ou bruit aléatoire pur (pas de formes détectables)
- Photo réaliste haute complexité (des milliers de couleurs/dégradés) — cas le plus défavorable pour vtracer
- Format non supporté explicitement testé (BMP, TIFF, WEBP, HEIC, AVIF)
- EXIF avec rotation (image pivotée automatiquement par le métadonnée) — le SVG respecte-t-il l'orientation ?
- Fichier avec métadonnées malveillantes/corrompues (test de sécurité basique de la lib de décodage)

## 2. Détourage IA / gomme IA (rembg et fonctions liées)
- Sujet sans contour net (fumée, cheveux fins, transparence, verre)
- Image sans sujet évident (paysage, texture) — comportement du détourage
- Modèle IA pas encore téléchargé / téléchargement interrompu (lazy install) — reprise, message d'erreur
- Pas de connexion internet au premier lancement de la fonctionnalité IA
- GPU absent / CPU seul très lent — timeout ou juste lenteur ?

## 3. Vectorisation (vtracer) et paramètres
- Curseurs de fidélité/simplification aux extrêmes (0% et 100%)
- Image avec des milliers de petites formes séparées (texte fin, motif complexe) — nombre de chemins SVG généré, poids du fichier
- Comparaison avant/après sur le panneau "Original" sans zoom/pan (bug UX déjà noté) — vérifier que ça ne désynchronise pas l'affichage à l'extrême (zoom fort côté SVG)
- Retouche par zone / pinceau magique (VectoFix) sur une zone minuscule (1 pixel) ou une zone qui couvre toute l'image

## 4. Export et sortie
- Export SVG très volumineux (des Mo) — l'app reste-t-elle réactive ?
- Nom de fichier avec caractères spéciaux/accents
- Export vers un chemin réseau débranché en cours d'écriture, ou disque plein
- Ouverture du SVG généré dans un autre logiciel (Illustrator, Inkscape, navigateur) pour valider qu'il n'est pas corrompu

## 5. Batch / usage intensif
- Traiter des dizaines d'images à la suite sans redémarrer l'app (fuite mémoire ?)
- Import multiple en une fois si la fonctionnalité existe
- Annuler un traitement en cours (bouton stop/fermeture fenêtre) — l'app revient-elle dans un état propre ?

## 6. Licence / activation
- Coupure internet pendant validation, essai expiré + changement d'horloge système
- Réinstallation après désinstall

## 7. Interface et environnement
- Redimensionnement rapide de la fenêtre, changement DPI/multi-écran
- Thème clair/sombre système changé en cours d'utilisation
- Linux (AppImage) : droits d'exécution, dépendances manquantes
- Android : import photo depuis galerie avec permissions refusées, mémoire limitée sur appareil bas de gamme

## Méthode
1. Prioriser les cas courants d'un utilisateur logo/icône (PNG petit, formes simples) avant les cas extrêmes (photos 8K).
2. Toujours vérifier le SVG produit dans un viewer externe, pas seulement dans l'app.
3. Noter tout ralentissement significatif même sans plantage — la fluidité est un argument de vente.
