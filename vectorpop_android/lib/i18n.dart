/// Minimal FR/EN string table, mirroring the desktop app's i18n.py subset
/// used by this mobile screen.
enum AppLang { fr, en }

class L10n {
  final AppLang lang;
  const L10n(this.lang);

  String _t(String fr, String en) => lang == AppLang.fr ? fr : en;

  String get appTitle => 'VectorPop';
  String get pickImage => _t('Choisir une image', 'Choose an image');
  String get exportSvg => _t('Exporter le SVG', 'Export SVG');
  String get noImage => _t('Aucune image sélectionnée', 'No image selected');
  String get before => _t('Avant', 'Before');
  String get after => _t('Après', 'After');
  String get preset => _t('Préréglage', 'Preset');
  String get settings => _t('Réglages', 'Settings');
  String get backgroundAndTransparency => _t('Fond & transparence', 'Background & transparency');
  String get touchUp => _t('Retouche', 'Touch-up');

  String get colorPrecision => _t('Précision couleur', 'Color precision');
  String get colorPrecisionHelp => _t(
      'Nombre de couleurs gardées dans l\'image (1 = très réduit, 8 = riche). '
      'Plus bas = aplats plus francs et fichier plus léger.',
      'Number of colors kept in the image (1 = very reduced, 8 = rich). '
      'Lower = bolder flats and a lighter file.');

  String get filterSpeckle => _t('Filtre parasites', 'Speckle filter');
  String get filterSpeckleHelp => _t(
      'Supprime les petites taches isolées (bruit, pixels perdus). '
      'Plus haut = nettoie davantage mais peut avaler de petits détails.',
      'Removes small isolated specks (noise, stray pixels). '
      'Higher = cleans more but may eat small details.');

  String get layerDifference => _t('Écart de couches', 'Layer difference');
  String get layerDifferenceHelp => _t(
      'Différence de couleur minimale entre deux calques superposés (dégradés). '
      'Plus haut = moins de calques, formes plus simples.',
      'Minimum color difference between two stacked layers (gradients). '
      'Higher = fewer layers, simpler shapes.');

  String get cornerThreshold => _t('Seuil des angles', 'Corner threshold');
  String get cornerThresholdHelp => _t(
      'Angle minimal (en degrés) pour qu\'un coin soit tracé comme un coin net. '
      'Plus bas = plus de coins pointus détectés, plus haut = courbes plus arrondies.',
      'Minimum angle (degrees) for a corner to be traced as a sharp corner. '
      'Lower = more sharp corners detected, higher = rounder curves.');

  String get removeBackground => _t('Supprimer le fond uni', 'Remove flat background');
  String get removeBackgroundHelp => _t(
      'Détecte la couleur des 4 coins et la rend transparente. Marche sur un fond '
      'uni (blanc, couleur pleine) ; pour un fond complexe (photo, dégradé), prévoir '
      'un détourage manuel en amont.',
      'Detects the color from the 4 corners and makes it transparent. Works on a '
      'flat background (white, solid color); for a complex background (photo, '
      'gradient), plan a manual cutout beforehand.');

  String get bgTolerance => _t('Tolérance fond', 'Background tolerance');
  String get bgToleranceHelp => _t(
      'Distance de couleur acceptée pour considérer un pixel comme faisant partie '
      'du fond. Plus haut = supprime davantage (risque de manger le sujet).',
      'Color distance accepted to treat a pixel as background. Higher = removes '
      'more (risks eating into the subject).');

  String get keepTransparency => _t('Garder la transparence', 'Keep transparency');
  String get keepTransparencyHelp => _t(
      'Coupe net l\'alpha (opaque ou transparent, pas d\'entre-deux) au lieu '
      'd\'aplatir sur fond blanc. Supprime les ombres et bavures de bord.',
      'Hard-cuts alpha (opaque or transparent, no in-between) instead of '
      'flattening onto white. Removes shadows and edge bleed.');

  String get contrast => _t('Contraste', 'Contrast');
  String get contrastHelp => _t(
      'Renforce (+) ou adoucit (-) le contraste avant le calcul, pour mieux '
      'séparer les aplats de couleur.',
      'Boosts (+) or softens (-) contrast before processing, to better separate '
      'color flats.');

  String get sharpen => _t('Netteté', 'Sharpen');
  String get sharpenHelp => _t(
      'Accentue les bords (masque flou) avant le calcul, pour des tracés plus '
      'francs sur une image un peu molle. À 0, aucun effet.',
      'Enhances edges (unsharp mask) before processing, for crisper traces on a '
      'slightly soft image. At 0, no effect.');

  String get colors => _t('Couleurs', 'Colors');
  String get mergeColors => _t('Fusionner les teintes proches', 'Merge close shades');
  String get mergeColorsHelp => _t(
      'Fusionne les nuances quasi-identiques (bruit de quantification) en une '
      'seule teinte dominante. Aplats plus francs, moins de calques vtracer.',
      'Merges near-identical shades (quantization noise) into one dominant '
      'hue. Bolder flats, fewer vtracer layers.');
  String get mergeThreshold => _t('Seuil de fusion', 'Merge threshold');
  String get mergeThresholdHelp => _t(
      'Distance de couleur (RVB) en dessous de laquelle deux teintes sont '
      'fusionnées. Plus haut = fusionne davantage.',
      'Color distance (RGB) below which two shades are merged. Higher = '
      'merges more aggressively.');
  String get cleanEdges => _t('Contours nets', 'Clean edges');
  String get cleanEdgesHelp => _t(
      'Supprime les fins liserés d\'anti-aliasing laissés par la source '
      'après quantification (nécessite la fusion des teintes activée).',
      'Removes thin anti-aliasing fringes left by the source after '
      'quantization (requires merging shades to be enabled).');

  String get presetFlatTitle => _t('Logo plat (couleur)', 'Flat logo (color)');
  String get presetFlatDesc => _t(
      'Aplats nets, peu de couleurs (le cas idéal : SVG propre et léger).',
      'Clean flats, few colors (the ideal case: a clean, light SVG).');
  String get presetDetailedTitle => _t('Logo couleur détaillé', 'Detailed color logo');
  String get presetDetailedDesc => _t(
      'Plus de couleurs et de finesse dans les courbes, pour les logos riches en détails.',
      'More colors and finer curves, for logos rich in detail.');
  String get presetBwTitle => _t('Noir & blanc / trait', 'Black & white / line art');
  String get presetBwDesc => _t(
      'Dessin au trait, tampon, signature : seuillage net en 2 couleurs.',
      'Line drawing, stamp, signature: clean 2-color thresholding.');

  String get lightMode => _t('Mode clair', 'Light mode');
  String get darkMode => _t('Mode sombre', 'Dark mode');

  String get exportTitle => _t('Exporter', 'Export');
  String get exportFormat => _t('Format', 'Format');
  String get exportSize => _t('Résolution', 'Resolution');
  String get exportCancel => _t('Annuler', 'Cancel');
  String get exportConfirm => _t('Exporter', 'Export');
  String get exportCustomSize => _t('Personnalisée', 'Custom');
  String get exportCustomSizeLabel => _t('Taille personnalisée (px)', 'Custom size (px)');

  String get pro => _t('Pro', 'Pro');
  String get goPro => _t('Passer Pro', 'Go Pro');
  String get proActive => _t('VectorPop Pro actif', 'VectorPop Pro active');
  String get proBenefitsTitle => _t('Passez à VectorPop Pro', 'Upgrade to VectorPop Pro');
  String get proBenefitPng => _t('Export PNG haute définition', 'High-resolution PNG export');
  String get proBenefitUnlimited => _t('Exports SVG illimités', 'Unlimited SVG exports');
  String get proBenefitBoth =>
      _t('Achat unique, sans abonnement.', 'One-time purchase, no subscription.');
  String buyProForPrice(String price) => _t('Acheter Pro — $price', 'Buy Pro — $price');
  String get buyProUnavailable =>
      _t('Achat indisponible pour l\'instant', 'Purchase unavailable right now');
  String get restorePurchases => _t('Restaurer mes achats', 'Restore purchases');
  String get purchasePending =>
      _t('Achat en cours de validation…', 'Purchase being validated…');
  String get quotaReachedTitle => _t('Quota gratuit atteint', 'Free quota reached');
  String quotaReachedBody(int max) => _t(
      'Vous avez utilisé vos $max exports SVG gratuits aujourd\'hui. '
      'Passez Pro pour des exports illimités.',
      'You\'ve used your $max free SVG exports for today. '
      'Go Pro for unlimited exports.');
  String get pngProOnlyTitle => _t('Export PNG réservé au Pro', 'PNG export is Pro-only');
  String get pngProOnlyBody => _t(
      'L\'export PNG haute définition fait partie de VectorPop Pro.',
      'High-resolution PNG export is part of VectorPop Pro.');
  String remainingToday(int n, int max) =>
      _t('$n/$max exports gratuits restants aujourd\'hui', '$n/$max free exports left today');

  String get helpDialogTitle => _t('Aide aux réglages', 'Settings help');
  String get helpDialogIntro => _t(
      'Choisis la situation la plus proche de ton image et clique « Appliquer ». '
      'Tu peux ensuite affiner avec les sliders.',
      'Pick the situation closest to your image and tap "Apply". You can '
      'then fine-tune with the sliders.');
  String get recipeApplyBtn => _t('Appliquer ces réglages', 'Apply these settings');
  String get troubleshootTitle => _t('Dépannage rapide', 'Quick troubleshooting');

  String get recipeFlatTitle => presetFlatTitle;
  String get recipeFlatDesc => _t(
      'Aplats nets, peu de couleurs (le cas idéal : SVG propre et léger).',
      'Clean flats, few colors (the ideal case: a clean, light SVG).');
  String get recipeGlossyTitle =>
      _t('Icône glossy / 3D (dégradés, reflets)', 'Glossy / 3D icon (gradients, highlights)');
  String get recipeGlossyDesc => _t(
      'Beaucoup de dégradés et de reflets. Monte Couleurs et décoche Fusion '
      'pour laisser des bandes fines à reconstruire.',
      'Lots of gradients and highlights. Raise Colors and uncheck Merge to '
      'leave fine bands to reconstruct.');
  String get recipeBwTitle => presetBwTitle;
  String get recipeBwDesc => presetBwDesc;
  String get recipePhotoTitle => _t('Photo / image complexe', 'Photo / complex image');
  String get recipePhotoDesc => _t(
      'Le cas le plus difficile. Beaucoup de couleurs, fusion désactivée. Pour '
      'retirer un fond de photo, active « Supprimer le fond uni ».',
      'The hardest case. Lots of colors, merge disabled. To remove a photo '
      'background, enable "Remove flat background".');
  String get recipeBgTitle => _t('Logo sur fond uni à retirer', 'Logo on a flat background to remove');
  String get recipeBgDesc => _t(
      'Fond blanc/uni à rendre transparent. Ajuste « Tolérance fond » si des '
      'bords restent visibles.',
      'White/flat background to make transparent. Adjust "Background '
      'tolerance" if edges remain visible.');

  String get tipBandsProb => _t('Des bandes dans les dégradés', 'Banding in gradients');
  String get tipBandsSol => _t(
      'Monte « Précision couleur » (7-8).', 'Raise "Color precision" (7-8).');
  String get tipHeavyProb => _t('Fichier SVG trop lourd', 'SVG file too heavy');
  String get tipHeavySol => _t(
      'Baisse « Précision couleur », coche « Fusionner les teintes proches », '
      'monte « Seuil de fusion ».',
      'Lower "Color precision", check "Merge close shades", raise "Merge '
      'threshold".');
  String get tipJaggedProb => _t('Bords en escalier / anguleux', 'Jagged / angular edges');
  String get tipJaggedSol => _t(
      'Baisse « Seuil des angles » (vers 20-40) pour des courbes plus douces.',
      'Lower "Corner threshold" (toward 20-40) for softer curves.');
  String get tipNoiseProb => _t('Petits points / bruit parasites', 'Small dots / stray noise');
  String get tipNoiseSol => _t('Augmente « Filtre parasites ».', 'Increase "Speckle filter".');

  String get aiSection => _t('Finitions IA', 'AI finishing');
  String get aiUpscale => _t('Finition IA (×4)', 'AI finishing (×4)');
  String get aiUpscaleHelp => _t(
      'Ré-agrandit et nettoie l\'image avant le tracé (Real-ESRGAN). Utile sur '
      'une petite source ou un JPEG compressé ; sans effet sur une image déjà '
      'grande et propre.',
      'Upscales and cleans the image before tracing (Real-ESRGAN). Useful on '
      'a small source or a compressed JPEG; no effect on an already large, '
      'clean image.');
  String get aiDetourage => _t('Détourage IA', 'AI cutout');
  String get aiDetourageHelp => _t(
      'Supprime un fond complexe (photo, dégradé) par segmentation IA, au lieu '
      'de la simple détection de couleur unie.',
      'Removes a complex background (photo, gradient) via AI segmentation, '
      'instead of plain flat-color detection.');
  String get aiComingSoon =>
      _t('Bientôt disponible', 'Coming soon');
  String get aiDownloadTitle => _t('Télécharger le module IA', 'Download the AI module');
  String aiDownloadBody(String sizeMb) => _t(
      'Cette finition nécessite un modèle IA téléchargé une seule fois '
      '(~$sizeMb Mo). Continuer ?',
      'This finish needs an AI model downloaded once (~$sizeMb MB). Continue?');
  String get aiDownloadConfirm => _t('Télécharger', 'Download');
  String get aiDownloadCancel => _t('Annuler', 'Cancel');
  String get aiDownloading => _t('Téléchargement du module IA…', 'Downloading AI module…');
  String get aiReportIssue => _t('Signaler un résultat IA incorrect', 'Report an incorrect AI result');
  String get aiReportSubject => _t('VectorPop — signalement résultat IA', 'VectorPop — AI result report');
  String get aiReportBody => _t(
      'Décris ici le problème rencontré avec la finition IA (joins une capture '
      'si possible) :\n\n',
      'Describe the issue you encountered with the AI finishing (attach a '
      'screenshot if possible):\n\n');
}
