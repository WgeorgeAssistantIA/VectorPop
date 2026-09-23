import 'package:flutter/foundation.dart';
import 'package:posthog_flutter/posthog_flutter.dart';

/// Service centralisé de télémétrie et product analytics via PostHog pour VectorPop.
class AnalyticsService {
  static final AnalyticsService instance = AnalyticsService._();
  AnalyticsService._();

  static const String _apiKey = 'phc_yfH9dmW8EbueysuiXcL8yAam7yATkfFCfguT3e63bEcq';
  static const String _host = 'https://eu.i.posthog.com';

  bool _initialized = false;

  /// Initialise le SDK PostHog
  Future<void> init() async {
    if (_initialized) return;
    try {
      final config = PostHogConfig(_apiKey);
      config.host = _host;
      await Posthog().setup(config);
      _initialized = true;
      debugPrint('[AnalyticsService] PostHog configuré avec succès sur $_host');
    } catch (e) {
      debugPrint('[AnalyticsService] Erreur lors de l\'initialisation PostHog: $e');
    }
  }

  /// Capture générique d'un événement
  Future<void> logEvent(String name, [Map<String, Object>? properties]) async {
    try {
      if (!_initialized) await init();
      final props = <String, Object>{
        'app': 'vectorpop_android',
        ...?properties,
      };
      await Posthog().capture(
        eventName: name,
        properties: props,
      );
      debugPrint('[Analytics] 📊 $name -> $props');
    } catch (e) {
      debugPrint('[Analytics] ⚠️ Échec de capture $name: $e');
    }
  }

  // ─── Onboarding Funnel ──────────────────────────────────────────────────────

  void trackOnboardingStarted() => logEvent('onboarding_started');

  void trackOnboardingStep(int stepIndex, String stepTitle) => logEvent('onboarding_step_viewed', {
    'step_index': stepIndex,
    'step_title': stepTitle,
  });

  void trackOnboardingUsecaseSelected(String usecaseId) => logEvent('onboarding_usecase_selected', {
    'usecase_id': usecaseId,
  });

  void trackOnboardingCompleted({
    required String lang,
    String? usecase,
  }) {
    final props = <String, Object>{
      'lang': lang,
    };
    if (usecase != null) props['selected_usecase'] = usecase;
    logEvent('onboarding_completed', props);
  }

  void trackOnboardingSkipped(int atStep) => logEvent('onboarding_skipped', {
    'at_step': atStep,
  });

  // ─── Modèles Démo & Galerie ─────────────────────────────────────────────────

  void trackSampleModelSelected(String modelId, String title) => logEvent('sample_model_selected', {
    'model_id': modelId,
    'model_title': title,
  });

  void trackImagePicked({
    required int width,
    required int height,
    required int sizeBytes,
    required bool hasAlpha,
  }) => logEvent('image_picked', {
    'width': width,
    'height': height,
    'size_kb': (sizeBytes / 1024).round(),
    'has_alpha': hasAlpha,
  });

  // ─── Vectorisation & IA ─────────────────────────────────────────────────────

  void trackVectorizeStarted({
    required String preset,
    required int colorPrecision,
    required bool removeBg,
    required bool aiUpscale,
    required bool aiDetourage,
  }) => logEvent('vectorize_started', {
    'preset': preset,
    'color_precision': colorPrecision,
    'remove_bg': removeBg,
    'ai_upscale': aiUpscale,
    'ai_detourage': aiDetourage,
  });

  void trackVectorizeCompleted({
    required String preset,
    required int durationMs,
    required int svgSizeBytes,
  }) => logEvent('vectorize_completed', {
    'preset': preset,
    'duration_ms': durationMs,
    'svg_size_kb': (svgSizeBytes / 1024).round(),
  });

  void trackVectorizeFailed(String error) => logEvent('vectorize_failed', {
    'error': error,
  });

  // ─── Exports ────────────────────────────────────────────────────────────────

  void trackExportSvg() => logEvent('export_svg');

  void trackExportPng(int resolutionPx) => logEvent('export_png', {
    'resolution_px': resolutionPx,
  });

  // ─── Monétisation & Paywall ─────────────────────────────────────────────────

  void trackPaywallViewed(String triggerSource) => logEvent('paywall_viewed', {
    'source': triggerSource,
  });

  void trackPaywallBuyClicked(String price) => logEvent('paywall_buy_clicked', {
    'price': price,
  });

  void trackPaywallPurchased(String price) => logEvent('paywall_purchased', {
    'price': price,
  });

  void trackPaywallCancelled() => logEvent('paywall_buy_cancelled');

  void trackPaywallError({
    required String errorCode,
    required String errorMessage,
  }) => logEvent('paywall_buy_error', {
    'error_code': errorCode,
    'error_message': errorMessage,
  });

  void trackDailyLimitReached({
    required int dailyExports,
  }) => logEvent('daily_limit_reached', {
    'daily_exports': dailyExports,
  });

  void trackQuotaReached({
    required int totalExports,
  }) => logEvent('quota_reached', {
    'total_exports': totalExports,
  });

  void trackDesktopLinkOpened(String source) => logEvent('desktop_link_opened', {
    'source': source,
  });

  void trackReviewRequested() => logEvent('review_requested');

  void trackFirstExportCelebrated() => logEvent('first_export_celebrated');

  void trackCelebrationProClicked() => logEvent('first_export_celebration_pro_clicked');

  void trackZoomInteracted() => logEvent('preview_zoom_interacted');

  void trackWhatsNewViewed() => logEvent('whats_new_viewed');
}
