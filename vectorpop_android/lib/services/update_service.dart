import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:in_app_update/in_app_update.dart';
import 'package:url_launcher/url_launcher.dart';

/// Service gérant la détection et l'exécution des mises à jour officielles Google Play pour VectorPop.
class UpdateService {
  UpdateService._();
  static final UpdateService instance = UpdateService._();

  AppUpdateInfo? _updateInfo;
  bool _checking = false;

  AppUpdateInfo? get updateInfo => _updateInfo;

  /// Vérifie si une mise à jour est disponible sur Google Play Store.
  /// Cette méthode est non-bloquante et sécurisée (ignore les erreurs en debug/local).
  Future<AppUpdateInfo?> checkForUpdate() async {
    if (!Platform.isAndroid || kIsWeb) return null;
    if (_checking) return _updateInfo;

    _checking = true;
    try {
      final info = await InAppUpdate.checkForUpdate();
      _updateInfo = info;
      debugPrint('[UpdateService] Google Play Update availability: ${info.updateAvailability}');
      return info;
    } catch (e) {
      debugPrint('[UpdateService] Update check skipped/error: $e');
      return null;
    } finally {
      _checking = false;
    }
  }

  /// Déclenche la mise à jour immédiate.
  Future<AppUpdateResult> performImmediateUpdate() async {
    try {
      return await InAppUpdate.performImmediateUpdate();
    } catch (e) {
      debugPrint('[UpdateService] Immediate update error: $e');
      await openPlayStoreListing();
      return AppUpdateResult.inAppUpdateFailed;
    }
  }

  /// Déclenche la mise à jour flexible (en tâche de fond).
  Future<AppUpdateResult> startFlexibleUpdate() async {
    try {
      final result = await InAppUpdate.startFlexibleUpdate();
      if (result == AppUpdateResult.success) {
        await InAppUpdate.completeFlexibleUpdate();
      }
      return result;
    } catch (e) {
      debugPrint('[UpdateService] Flexible update error: $e');
      await openPlayStoreListing();
      return AppUpdateResult.inAppUpdateFailed;
    }
  }

  /// Ouvre directement la page de l'application sur le Play Store
  Future<void> openPlayStoreListing() async {
    const playStoreUrl = 'market://details?id=com.lafabriknumerique.vectorpop';
    const webFallbackUrl = 'https://play.google.com/store/apps/details?id=com.lafabriknumerique.vectorpop';
    
    try {
      final uri = Uri.parse(playStoreUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(Uri.parse(webFallbackUrl), mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      debugPrint('[UpdateService] Could not open store: $e');
    }
  }
}
