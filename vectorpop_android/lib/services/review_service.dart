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

  /// Déclenche la boîte de dialogue native In-App Review du Play Store
  /// après validation que l'utilisateur a prouvé sa satisfaction (ex: 2ème export réussi)
  /// et qu'il n'a pas déjà été sollicité.
  Future<void> requestReviewIfAppropriate() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final alreadyRequested = prefs.getBool(_kKeyHasRequestedReview) ?? false;
      if (alreadyRequested) return;

      final isAvailable = await _inAppReview.isAvailable();
      if (!isAvailable) {
        debugPrint('[ReviewService] In-App Review non disponible sur cet appareil.');
        return;
      }

      await _inAppReview.requestReview();
      await prefs.setBool(_kKeyHasRequestedReview, true);
      AnalyticsService.instance.trackReviewRequested();
      debugPrint('[ReviewService] Demande d\'avis in-app Play Store envoyée.');
    } catch (e) {
      debugPrint('[ReviewService] Erreur lors de la demande d\'avis: $e');
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
