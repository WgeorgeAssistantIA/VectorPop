import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'services/analytics_service.dart';

/// Same pattern as InOneShot/VoxCut Android: non-consumable in-app purchase
/// via Google Play Billing. Play Store forbids third-party payment
/// processors for digital content bought inside the app, so the desktop's
/// Lemon Squeezy flow is replaced here by Play Billing (the "billing"
/// permission comes bundled with in_app_purchase's manifest).
class LicenseConfig {
  static const productId = 'vectorpop_pro';
  static const freeLifetimeMax = 3;
  static const freeDailyMax = 3;
  static const fallbackPrice = '12,99 €';
}

class LicenseManager {
  static const _prefKey = 'is_pro';

  final InAppPurchase _iap = InAppPurchase.instance;
  StreamSubscription<List<PurchaseDetails>>? _sub;

  bool _isPro = false;
  bool _loaded = false;
  ProductDetails? _product;
  String? _lastError;
  bool _purchasePending = false;

  bool get loaded => _loaded;
  bool isPro() => _isPro;

  /// Price string from the Play Store (localized) or a fallback if the store
  /// isn't reachable yet.
  String get formattedPrice => _product?.price ?? LicenseConfig.fallbackPrice;

  String? get lastError => _lastError;
  bool get purchasePending => _purchasePending;
  bool get canBuy => _product != null;

  @visibleForTesting
  set mockProduct(ProductDetails? p) => _product = p;

  void Function()? onChanged;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _isPro = prefs.getBool(_prefKey) ?? false;
    _loaded = true;

    if (!await _iap.isAvailable()) return;

    _sub?.cancel();
    _sub = _iap.purchaseStream.listen(_onPurchaseUpdate, onError: (e) {
      _lastError = '$e';
      onChanged?.call();
    });

    final res = await _iap.queryProductDetails({LicenseConfig.productId});
    if (res.productDetails.isNotEmpty) {
      _product = res.productDetails.first;
      onChanged?.call();
    }
    // Auto-restore any prior non-consumable purchase (e.g. after reinstall
    // or on a new device signed into the same Play account).
    await _iap.restorePurchases();
  }

  Future<void> buyPro() async {
    if (_purchasePending) return;
    _lastError = null;
    if (_product == null) {
      _lastError = 'unavailable';
      onChanged?.call();
      return;
    }
    _purchasePending = true;
    onChanged?.call();
    try {
      final launched = await _iap.buyNonConsumable(purchaseParam: PurchaseParam(productDetails: _product!));
      if (!launched) {
        _purchasePending = false;
        _lastError = 'launch_failed';
        onChanged?.call();
      }
    } catch (e) {
      _purchasePending = false;
      _lastError = '$e';
      onChanged?.call();
    }
  }

  Future<void> restorePurchases() async {
    _lastError = null;
    await _iap.restorePurchases();
  }

  Future<void> _onPurchaseUpdate(List<PurchaseDetails> purchases) async {
    for (final p in purchases) {
      // 1. User canceled: in_app_purchase_android synthesizes an empty productID on cancellation
      if (p.status == PurchaseStatus.canceled) {
        _purchasePending = false;
        if (p.pendingCompletePurchase) await _iap.completePurchase(p);
        AnalyticsService.instance.trackPaywallCancelled();
        onChanged?.call();
        continue;
      }

      // 2. Billing error: in_app_purchase_android also synthesizes an empty productID on error
      if (p.status == PurchaseStatus.error) {
        _purchasePending = false;
        if (p.pendingCompletePurchase) await _iap.completePurchase(p);
        _lastError = p.error?.message ?? 'Purchase error';
        AnalyticsService.instance.trackPaywallError(
          errorCode: p.error?.code ?? 'unknown',
          errorMessage: p.error?.message ?? 'Purchase error',
        );
        onChanged?.call();
        continue;
      }

      // 3. Purchase pending
      if (p.status == PurchaseStatus.pending) {
        _purchasePending = true;
        onChanged?.call();
        continue;
      }

      // 4. Successful purchase or restore
      if (p.status == PurchaseStatus.purchased || p.status == PurchaseStatus.restored) {
        // Only trigger mismatch if productID is non-empty and different from our product.
        // NOTE: This assumes VectorPop only sells a single in-app product (vectorpop_pro).
        // If a 2nd product is ever added, explicit product routing is required.
        if (p.productID.isNotEmpty && p.productID != LicenseConfig.productId) {
          _purchasePending = false;
          if (p.pendingCompletePurchase) await _iap.completePurchase(p);
          AnalyticsService.instance.trackPaywallError(
            errorCode: 'unexpected_product_id',
            errorMessage: 'ID mismatch: ${p.productID} != ${LicenseConfig.productId}',
          );
          onChanged?.call();
          continue;
        }

        _purchasePending = false;
        if (p.pendingCompletePurchase) await _iap.completePurchase(p);
        // Tracked here (once per real completed transaction) rather than
        // from the paywall UI, which only sees the first purchase of a
        // session and silently misses any that complete after it closes.
        if (p.status == PurchaseStatus.purchased) {
          AnalyticsService.instance.trackPaywallPurchased(formattedPrice);
        }
        await _setPro(true);
      }
    }
  }

  Future<void> _setPro(bool value) async {
    _isPro = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefKey, value);
    onChanged?.call();
  }

  void dispose() => _sub?.cancel();
}

/// Export counter for the free tier.
/// - Early users (installed before lifetime quota) keep their 3 daily exports.
/// - New users receive 3 lifetime trial exports.
class UsageTracker {
  static const _kCount = 'usage_count';
  static const _kTotal = 'total_vectorizations';

  SharedPreferences? _prefs;

  bool get isEarlyUser => false;

  Future<void> load() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  int totalExports() {
    return _prefs?.getInt(_kTotal) ?? _prefs?.getInt(_kCount) ?? 0;
  }

  int exportsToday() => totalExports();

  int get maxQuota => LicenseConfig.freeLifetimeMax;

  int remaining() {
    return (LicenseConfig.freeLifetimeMax - totalExports()).clamp(0, LicenseConfig.freeLifetimeMax);
  }

  bool canExport() {
    return totalExports() < LicenseConfig.freeLifetimeMax;
  }

  Future<void> recordExport() async {
    final prefs = _prefs;
    if (prefs == null) return;
    final next = totalExports() + 1;
    await prefs.setInt(_kTotal, next);
    await prefs.setInt(_kCount, next);
  }
}
