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
  String get emptyStateSubtitle => _t(
      'Importez un logo, croquis ou icône pour générer un SVG net et léger, ou testez nos modèles prêts à l\'emploi :',
      'Import a logo, sketch, or icon to generate clean, sharp SVG vectors, or try our ready-to-use samples:');
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
  String quotaReachedBody(int max) => quotaReachedBodyLifetime(max);
  String quotaReachedBodyLifetime(int max) => _t(
      'Vous avez utilisé vos $max exports gratuits d\'essai. '
      'Continuez à convertir vos images avec VectorPop Pro.',
      'You\'ve used your $max free trial exports. '
      'Keep converting images with VectorPop Pro.');
  String quotaReachedBodyDaily(int max) => _t(
      'Vous avez utilisé vos $max exports gratuits aujourd\'hui. '
      'Revenez demain ou passez Pro pour des exports illimités.',
      'You\'ve used your $max free exports for today. '
      'Come back tomorrow or go Pro for unlimited exports.');
  String get pngProOnlyTitle => _t('Export PNG réservé au Pro', 'PNG export is Pro-only');
  String get pngProOnlyBody => _t(
      'L\'export PNG haute définition fait partie de VectorPop Pro.',
      'High-resolution PNG export is part of VectorPop Pro.');
  String remainingExports(int n, int max) =>
      _t('$n/$max exports gratuits restants', '$n/$max free exports left');
  String remainingToday(int n, int max) =>
      _t('$n/$max exports gratuits restants aujourd\'hui', '$n/$max free exports left today');
  String get lastFreeExportNotice => _t(
      'Dernier export d\'essai gratuit utilisé. Continuez avec VectorPop Pro !',
      'Last free trial export used. Keep converting with VectorPop Pro!');

  // PaywallSheet Premium strings
  String get paywallLifetimeBadge =>
      _t('ACCÈS À VIE — SANS ABONNEMENT', 'LIFETIME ACCESS — NO SUBSCRIPTION');
  String paywallRoiBanner(int count) => _t(
      'Vous avez déjà vectorisé $count image${count > 1 ? 's' : ''} avec VectorPop',
      'You have already vectorized $count image${count > 1 ? 's' : ''} with VectorPop');
  String get paywallTitle => 'VectorPop Pro';
  String get paywallSubtitle => _t(
      'Débloquez la vectorisation sans limite', 'Unlock unlimited vectorization');
  String get paywallPostQuotaTitle => _t(
      'Continuez avec VectorPop Pro', 'Keep converting with VectorPop Pro');
  String get paywallPostQuotaSubtitle => _t(
      'Vous avez utilisé vos 3 exports gratuits. Accès à vie sans abonnement.',
      'You\'ve used your 3 free exports. Lifetime access, no subscription.');
  String get paywallFeatureSvg => _t(
      'Exports SVG illimités à vie (sans plafond)',
      'Lifetime unlimited SVG exports (no limits)');
  String get paywallFeaturePng => _t(
      'Exports PNG Ultra-HD jusqu\'à 8192px (8K)',
      'Ultra-HD PNG exports up to 8192px (8K)');
  String get paywallFeatureAi => _t(
      'Finitions IA illimitées (Détourage + Upscale x4 en local)',
      'Unlimited AI finishing (Cutout + 4x Upscale locally)');
  String get paywallFeatureLicense => _t(
      'Licence commerciale à vie & zéro filigrane',
      'Lifetime commercial license & zero watermark');
  String paywallBtnBuy(String price) =>
      _t('Débloquer VectorPop Pro — $price', 'Unlock VectorPop Pro — $price');
  String get paywallBtnRestore => _t('Restaurer mes achats', 'Restore purchases');
  String get paywallDesktopHint =>
      _t('Besoin de gros volumes sur PC ? Découvrez', 'Need heavy batches on PC? Check out');
  String get paywallReassurance => _t(
      'Paiement unique et sécurisé via Google Play. Aucun prélèvement récurrent.',
      'One-time secure payment via Google Play. No recurring subscription.');

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

  // ─── Onboarding & Modèles Démo ──────────────────────────────────────────────
  String get onboardingWelcomeTitle => _t(
      'Transformez vos images en tracés parfaits',
      'Turn your images into perfect vectors');
  String get onboardingWelcomeDesc => _t(
      'Convertissez vos logos, dessins et mascottes en fichiers SVG nets à l\'infini, légers et prêts pour l\'impression.',
      'Convert logos, sketches, and graphics into infinitely sharp, lightweight, print-ready SVG files.');

  String get onboardingHowTitle => _t(
      'Adieu les pixels, place à la netteté',
      'Farewell pixels, welcome pure vectors');
  String get onboardingHowDesc => _t(
      'Le format vectoriel SVG ne perd jamais en qualité : zoomez à 1000%, imprimez en grand format ou exportez en 8K sans aucun flou.',
      'SVG never loses quality: zoom to 1000%, print large-scale, or export in 8K with zero blur or degradation.');
  String get onboardingBitmapLabel => _t('Image Bitmap (floue au zoom)', 'Bitmap image (pixelated)');
  String get onboardingVectorLabel => _t('Vectoriel SVG (net à l\'infini)', 'SVG Vector (infinitely sharp)');

  String get onboardingProfileTitle => _t(
      'Quel est votre usage principal ?',
      'What is your primary use case?');
  String get onboardingProfileDesc => _t(
      'VectorPop pré-calibrera le préréglage optimal pour vos créations.',
      'VectorPop will pre-tune optimal settings for your workflow.');
  String get profileLogoTitle => _t('Logos & Identité de marque', 'Logos & Brand Identity');
  String get profileLogoDesc => _t('Aplats nets et suppression de fond uni', 'Clean solid shapes & flat background removal');
  String get profileMascotTitle => _t('Mascottes & Illustrations', 'Mascots & Illustrations');
  String get profileMascotDesc => _t('Nuances riches et calques multi-couleurs', 'Rich color shades & multi-layer depth');
  String get profileSketchTitle => _t('Signatures & Gravure N&B', 'Signatures & B&W Engraving');
  String get profileSketchDesc => _t('Courbes pures pour découpe laser, tampon, vinyle', 'Pure contours for laser, stamp, vinyl cut');
  String get profilePrintTitle => _t('Flocage & Sérigraphie', 'Apparel & Screen Printing');
  String get profilePrintDesc => _t('Séparation des teintes et contours francs', 'Color separation and bold vector outlines');

  String get onboardingPrivacyTitle => _t(
      '100% Local & Respect de votre vie privée',
      '100% On-Device & Private');
  String get onboardingPrivacyDesc => _t(
      'Vos images ne quittent jamais votre smartphone. Aucun compte requis, tout le traitement est exécuté localement en natif.',
      'Your images never leave your phone. No account required, all processing runs locally on-device.');
  String get onboardingQuotaTitle => _t(
      '3 exports gratuits offerts pour tester',
      '3 free trial exports included');
  String get onboardingQuotaDesc => _t(
      'Testez en conditions réelles sans engagement. Passez Pro à tout moment pour débloquer les exports illimités à vie.',
      'Test freely with full quality. Go Pro anytime to unlock lifetime unlimited exports.');

  String get onboardingNext => _t('Suivant', 'Next');
  String get onboardingGetStarted => _t('Commencer à vectoriser', 'Start vectorizing');
  String get onboardingSkip => _t('Passer', 'Skip');

  String get newImage => _t('Nouvelle image', 'New image');
  String get changeImage => _t('Changer d\'image', 'Change image');
  String get tryDemoSample => _t('Ou essayez un exemple en 1 clic :', 'Or try a sample in 1 tap:');
  String get demoSamplesAction => _t('Exemples', 'Samples');
  String get loadingSample => _t('Chargement de l\'exemple…', 'Loading sample…');

  String get resetZoom => _t('Réinitialiser le zoom', 'Reset zoom');
  String get pinchToZoomHint => _t('Pincez pour zoomer', 'Pinch to zoom');

  String get celebrationTitle => _t('Félicitations pour votre 1er export !', 'Congratulations on your 1st export!');
  String get celebrationSubtitle => _t(
      'Votre image a été convertie en un tracé vectoriel ultra-net, prêt pour la gravure, l\'impression ou le web.',
      'Your image has been converted into razor-sharp vectors, ready for engraving, printing, or web.');
  String get celebrationPillarLocal => _t('100% Local & Privé', '100% On-Device & Private');
  String get celebrationPillarLocalDesc => _t(
      'Calculé sur votre appareil, aucune image n\'a été envoyée sur un serveur distant.',
      'Processed right on your device, zero images sent to external servers.');
  String get celebrationPillarVector => _t('Netteté infinie', 'Infinite Sharpness');
  String get celebrationPillarVectorDesc => _t(
      'Le format SVG ne pixellise jamais, même imprimé sur une bâche de 10 mètres.',
      'SVG never degrades or blurs, even if printed on a billboard.');
  String get celebrationProPromo => _t(
      'Besoin d\'exports illimités et du PNG Ultra-HD jusqu\'à 8K ?',
      'Need unlimited exports and Ultra-HD PNG up to 8K?');
  String get celebrationDiscoverPro => _t('Découvrir VectorPop Pro (À vie)', 'Discover VectorPop Pro (Lifetime)');
  String get celebrationContinueFree => _t('Continuer avec la version gratuite', 'Continue with free version');
}
