import 'package:flutter/foundation.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'analytics_service.dart';

/// Service gérant les demandes d'avis Google Play Store au moment propice (CRO).
class ReviewService {
  static final ReviewService instance = ReviewService._();
  ReviewService._();

  final InAppReview _inAppReview = InAppReview.instance;
  static const String _kKeyHasRequestedReview = 'has_requested_in_app_review';
  static const String _kKeySuccessCount = 'export_success_count';
  static const int _kMinSuccesses = 1;

  /// Incrémente le compteur de succès et indique si une demande d'avis doit être effectuée.
  Future<bool> recordSuccessAndShouldAsk() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final alreadyRequested = prefs.getBool(_kKeyHasRequestedReview) ?? false;
      if (alreadyRequested) {
        AnalyticsService.instance.trackReviewSkipped('already_requested');
        return false;
      }

      final count = (prefs.getInt(_kKeySuccessCount) ?? 0) + 1;
      await prefs.setInt(_kKeySuccessCount, count);

      return count >= _kMinSuccesses;
    } catch (e) {
      debugPrint('[ReviewService] Erreur recordSuccess: $e');
      return false;
    }
  }

  /// Déclenche la boîte de dialogue native In-App Review du Play Store
  /// Enregistre has_requested_in_app_review uniquement après confirmation de isAvailable().
  Future<bool> requestReview() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final alreadyRequested = prefs.getBool(_kKeyHasRequestedReview) ?? false;
      if (alreadyRequested) {
        AnalyticsService.instance.trackReviewSkipped('already_requested');
        return false;
      }

      final isAvailable = await _inAppReview.isAvailable();
      if (!isAvailable) {
        debugPrint('[ReviewService] In-App Review non disponible sur cet appareil.');
        AnalyticsService.instance.trackReviewSkipped('unavailable');
        return false;
      }

      await prefs.setBool(_kKeyHasRequestedReview, true);
      await _inAppReview.requestReview();
      AnalyticsService.instance.trackReviewRequested();
      debugPrint('[ReviewService] Demande d\'avis in-app Play Store envoyée.');
      return true;
    } catch (e) {
      debugPrint('[ReviewService] Erreur requestReview: $e');
      AnalyticsService.instance.trackReviewSkipped('error');
      return false;
    }
  }

  /// Vérifie si le seuil d'exports est atteint et déclenche la review si opportun.
  Future<void> requestReviewIfAppropriate() async {
    final shouldAsk = await recordSuccessAndShouldAsk();
    if (shouldAsk) {
      await requestReview();
    }
  }

  /// Ouvre directement la page Play Store pour laisser une note ou un commentaire.
  Future<void> openStoreListing() async {
    try {
      await _inAppReview.openStoreListing();
    } catch (e) {
      debugPrint('[ReviewService] Impossible d\'ouvrir la page Play Store: $e');
    }
  }
}
