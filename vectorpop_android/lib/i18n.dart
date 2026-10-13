import 'i18n/strings.dart';
export 'i18n/strings.dart';

/// Énumération des 15 langues pour compatibilité descendante avec les tests
/// et le code existant.
enum AppLang {
  en,
  fr,
  es,
  pt,
  de,
  it,
  hi,
  zh,
  ja,
  ko,
  ar,
  ru,
  id,
  tr,
  vi;

  String get code => name;

  static AppLang fromCode(String code) {
    return AppLang.values.firstWhere(
      (l) => l.name == code.toLowerCase(),
      orElse: () => AppLang.en,
    );
  }
}

/// Classe L10n facilitant l'accès typé aux traductions, rétro-compatible
/// avec le code et les tests unitaires existants.
class L10n {
  final dynamic lang;

  const L10n([this.lang = AppLang.fr]);

  String get langCode {
    if (lang is AppLang) return (lang as AppLang).code;
    if (lang is String && (lang as String).isNotEmpty) return lang as String;
    return 'fr';
  }

  bool get isFr => lang == AppLang.fr || lang == 'fr';

  String _tr(String key, [Map<String, String>? params]) => tr(langCode, key, params);

  String get appTitle => _tr('app_title');
  String get pickImage => _tr('pick_image');
  String get newImage => _tr('new_image');
  String get changeImage => _tr('change_image');
  String get exportSvg => _tr('export_svg');
  String get noImage => _tr('no_image');
  String get emptyStateSubtitle => _tr('empty_state_subtitle');
  String get before => _tr('before');
  String get after => _tr('after');
  String get preset => _tr('preset');
  String get settings => _tr('settings');
  String get backgroundAndTransparency => _tr('bg_and_transparency');
  String get touchUp => _tr('touch_up');

  String get colorPrecision => _tr('color_precision');
  String get colorPrecisionHelp => _tr('color_precision_help');
  String get filterSpeckle => _tr('filter_speckle');
  String get filterSpeckleHelp => _tr('filter_speckle_help');
  String get layerDifference => _tr('layer_difference');
  String get layerDifferenceHelp => _tr('layer_difference_help');
  String get cornerThreshold => _tr('corner_threshold');
  String get cornerThresholdHelp => _tr('corner_threshold_help');
  String get removeBackground => _tr('remove_background');
  String get removeBackgroundHelp => _tr('remove_background_help');
  String get bgTolerance => _tr('bg_tolerance');
  String get bgToleranceHelp => _tr('bg_tolerance_help');
  String get keepTransparency => _tr('keep_transparency');
  String get keepTransparencyHelp => _tr('keep_transparency_help');
  String get contrast => _tr('contrast');
  String get contrastHelp => _tr('contrast_help');
  String get sharpen => _tr('sharpen');
  String get sharpenHelp => _tr('sharpen_help');
  String get colors => _tr('colors');
  String get mergeColors => _tr('merge_colors');
  String get mergeColorsHelp => _tr('merge_colors_help');
  String get mergeThreshold => _tr('merge_threshold');
  String get mergeThresholdHelp => _tr('merge_threshold_help');
  String get cleanEdges => _tr('clean_edges');
  String get cleanEdgesHelp => _tr('clean_edges_help');

  String get presetFlatTitle => _tr('preset_flat_title');
  String get presetFlatDesc => _tr('preset_flat_desc');
  String get presetDetailedTitle => _tr('preset_detailed_title');
  String get presetDetailedDesc => _tr('preset_detailed_desc');
  String get presetBwTitle => _tr('preset_bw_title');
  String get presetBwDesc => _tr('preset_bw_desc');

  String get lightMode => _tr('light_mode');
  String get darkMode => _tr('dark_mode');

  String get exportTitle => _tr('export_title');
  String get exportFormat => _tr('export_format');
  String get exportSize => _tr('export_size');
  String get exportCancel => _tr('export_cancel');
  String get exportConfirm => _tr('export_confirm');
  String get exportCustomSize => _tr('export_custom_size');
  String get exportCustomSizeLabel => _tr('export_custom_size_label');

  String get pro => _tr('pro');
  String get goPro => _tr('go_pro');
  String get proActive => _tr('pro_active');
  String get proBenefitsTitle => _tr('pro_benefits_title');
  String get proBenefitPng => _tr('pro_benefit_png');
  String get proBenefitUnlimited => _tr('pro_benefit_unlimited');
  String get proBenefitBoth => _tr('pro_benefit_both');
  String buyProForPrice(String price) => _tr('buy_pro_for_price', {'price': price});
  String get buyProUnavailable => _tr('buy_pro_unavailable');
  String get restorePurchases => _tr('restore_purchases');
  String get purchasePending => _tr('purchase_pending');
  String get quotaReachedTitle => _tr('quota_reached_title');
  String quotaReachedBody(int max) => quotaReachedBodyLifetime(max);
  String quotaReachedBodyLifetime(int max) => _tr('quota_reached_body_lifetime', {'max': '$max'});
  String quotaReachedBodyDaily(int max) => _tr('quota_reached_body_daily', {'max': '$max'});
  String get pngProOnlyTitle => _tr('png_pro_only_title');
  String get pngProOnlyBody => _tr('png_pro_only_body');
  String remainingExports(int n, int max) => _tr('remaining_exports', {'n': '$n', 'max': '$max'});
  String remainingToday(int n, int max) => _tr('remaining_today', {'n': '$n', 'max': '$max'});
  String get lastFreeExportNotice => _tr('last_free_export_notice');

  // PaywallSheet Premium strings
  String get paywallLifetimeBadge => _tr('paywall_lifetime_badge');
  String paywallRoiBanner(int count) => _tr('paywall_roi_banner', {
        'count': '$count',
        'plural': count > 1 ? (langCode == 'fr' || langCode == 'en' || langCode == 'es' ? 's' : '') : '',
      });
  String get paywallTitle => _tr('paywall_title');
  String get paywallSubtitle => _tr('paywall_subtitle');
  String get paywallPostQuotaTitle => _tr('paywall_post_quota_title');
  String get paywallPostQuotaSubtitle => _tr('paywall_post_quota_subtitle');
  String get paywallFeatureSvg => _tr('paywall_feature_svg');
  String get paywallFeaturePng => _tr('paywall_feature_png');
  String get paywallFeatureAi => _tr('paywall_feature_ai');
  String get paywallFeatureLicense => _tr('paywall_feature_license');
  String paywallBtnBuy(String price) => _tr('paywall_btn_buy', {'price': price});
  String get paywallBtnRestore => _tr('paywall_btn_restore');
  String get paywallDesktopHint => _tr('paywall_desktop_hint');
  String get paywallReassurance => _tr('paywall_reassurance');

  String get helpDialogTitle => _tr('help_dialog_title');
  String get helpDialogIntro => _tr('help_dialog_intro');
  String get recipeApplyBtn => _tr('recipe_apply_btn');
  String get troubleshootTitle => _tr('troubleshoot_title');

  String get recipeFlatTitle => presetFlatTitle;
  String get recipeFlatDesc => _tr('recipe_flat_desc');
  String get recipeGlossyTitle => _tr('recipe_glossy_title');
  String get recipeGlossyDesc => _tr('recipe_glossy_desc');
  String get recipeBwTitle => presetBwTitle;
  String get recipeBwDesc => presetBwDesc;
  String get recipePhotoTitle => _tr('recipe_photo_title');
  String get recipePhotoDesc => _tr('recipe_photo_desc');
  String get recipeBgTitle => _tr('recipe_bg_title');
  String get recipeBgDesc => _tr('recipe_bg_desc');

  String get tipBandsProb => _tr('tip_bands_prob');
  String get tipBandsSol => _tr('tip_bands_sol');
  String get tipHeavyProb => _tr('tip_heavy_prob');
  String get tipHeavySol => _tr('tip_heavy_sol');
  String get tipJaggedProb => _tr('tip_jagged_prob');
  String get tipJaggedSol => _tr('tip_jagged_sol');
  String get tipNoiseProb => _tr('tip_noise_prob');
  String get tipNoiseSol => _tr('tip_noise_sol');

  String get aiSection => _tr('ai_section');
  String get aiUpscale => _tr('ai_upscale');
  String get aiUpscaleHelp => _tr('ai_upscale_help');
  String get aiDetourage => _tr('ai_detourage');
  String get aiDetourageHelp => _tr('ai_detourage_help');
  String get aiComingSoon => _tr('ai_coming_soon');
  String get aiDownloadTitle => _tr('ai_download_title');
  String aiDownloadBody(String sizeMb) => _tr('ai_download_body', {'sizeMb': sizeMb});
  String get aiDownloadConfirm => _tr('ai_download_confirm');
  String get aiDownloadCancel => _tr('ai_download_cancel');
  String get aiDownloading => _tr('ai_downloading');
  String get aiReportIssue => _tr('ai_report_issue');
  String get aiReportSubject => _tr('ai_report_subject');
  String get aiReportBody => _tr('ai_report_body');

  // Onboarding & Modèles Démo
  String get onboardingWelcomeTitle => _tr('onboarding_welcome_title');
  String get onboardingWelcomeDesc => _tr('onboarding_welcome_desc');
  String get onboardingHowTitle => _tr('onboarding_how_title');
  String get onboardingHowDesc => _tr('onboarding_how_desc');
  String get onboardingBitmapLabel => _tr('onboarding_bitmap_label');
  String get onboardingVectorLabel => _tr('onboarding_vector_label');
  String get onboardingProfileTitle => _tr('onboarding_profile_title');
  String get onboardingProfileDesc => _tr('onboarding_profile_desc');
  String get profileLogoTitle => _tr('profile_logo_title');
  String get profileLogoDesc => _tr('profile_logo_desc');
  String get profileMascotTitle => _tr('profile_mascot_title');
  String get profileMascotDesc => _tr('profile_mascot_desc');
  String get profileSketchTitle => _tr('profile_sketch_title');
  String get profileSketchDesc => _tr('profile_sketch_desc');
  String get profilePrintTitle => _tr('profile_print_title');
  String get profilePrintDesc => _tr('profile_print_desc');

  String get onboardingPrivacyTitle => _tr('onboarding_privacy_title');
  String get onboardingPrivacyDesc => _tr('onboarding_privacy_desc');
  String get onboardingQuotaTitle => _tr('onboarding_quota_title');
  String get onboardingQuotaDesc => _tr('onboarding_quota_desc');

  String get onboardingNext => _tr('onboarding_next');
  String get onboardingGetStarted => _tr('onboarding_get_started');
  String get onboardingSkip => _tr('onboarding_skip');

  String get tryDemoSample => _tr('try_demo_sample');
  String get demoSamplesAction => _tr('demo_samples_action');
  String get loadingSample => _tr('loading_sample');

  String get resetZoom => _tr('reset_zoom');
  String get pinchToZoomHint => _tr('pinch_to_zoom_hint');

  String get celebrationTitle => _tr('celebration_title');
  String get celebrationSubtitle => _tr('celebration_subtitle');
  String get celebrationPillarLocal => _tr('celebration_pillar_local');
  String get celebrationPillarLocalDesc => _tr('celebration_pillar_local_desc');
  String get celebrationPillarVector => _tr('celebration_pillar_vector');
  String get celebrationPillarVectorDesc => _tr('celebration_pillar_vector_desc');
  String get celebrationProPromo => _tr('celebration_pro_promo');
  String get celebrationDiscoverPro => _tr('celebration_discover_pro');
  String get celebrationContinueFree => _tr('celebration_continue_free');

  String get langPickerTitle => _tr('lang_picker_title');
  String get close => _tr('close');
  String get openFile => _tr('open_file');
  String get share => _tr('share');
  String get exportSuccessTitle => _tr('export_success_title');
  String get exportSuccessBody => _tr('export_success_body');
  String get menuLanguage => _tr('menu_language');
  String get vectorizeError => _tr('vectorize_error');
  String get imageFormatUnrecognized => _tr('image_format_unrecognized');
  String get processing => _tr('processing');
  String get startVectorization => _tr('start_vectorization');
  String demoTitle(String id) => _tr('demo_${id}_title');
  String demoDesc(String id) => _tr('demo_${id}_desc');
}
