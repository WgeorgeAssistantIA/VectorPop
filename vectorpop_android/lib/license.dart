import 'dart:async';

import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Same pattern as InOneShot/VoxCut Android: non-consumable in-app purchase
/// via Google Play Billing. Play Store forbids third-party payment
/// processors for digital content bought inside the app, so the desktop's
/// Lemon Squeezy flow is replaced here by Play Billing (the "billing"
/// permission comes bundled with in_app_purchase's manifest).
class LicenseConfig {
  static const productId = 'vectorpop_pro';
  static const freeDailyMax = 3;
  static const fallbackPrice = '19,99 €';
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
    _lastError = null;
    if (_product == null) {
      _lastError = 'unavailable';
      onChanged?.call();
      return;
    }
    await _iap.buyNonConsumable(purchaseParam: PurchaseParam(productDetails: _product!));
  }

  Future<void> restorePurchases() async {
    _lastError = null;
    await _iap.restorePurchases();
  }

  Future<void> _onPurchaseUpdate(List<PurchaseDetails> purchases) async {
    for (final p in purchases) {
      if (p.productID != LicenseConfig.productId) continue;
      if (p.status == PurchaseStatus.pending) {
        _purchasePending = true;
        onChanged?.call();
      } else if (p.status == PurchaseStatus.purchased || p.status == PurchaseStatus.restored) {
        if (p.pendingCompletePurchase) await _iap.completePurchase(p);
        _purchasePending = false;
        await _setPro(true);
      } else if (p.status == PurchaseStatus.error) {
        _purchasePending = false;
        _lastError = p.error?.message ?? 'Purchase error';
        onChanged?.call();
      } else if (p.status == PurchaseStatus.canceled) {
        _purchasePending = false;
        onChanged?.call();
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

/// Daily export counter for the free tier — mirrors `UsageTracker` in the
/// desktop app's license.py. Reset automatically at midnight (local date).
class UsageTracker {
  static const _kDate = 'usage_date';
  static const _kCount = 'usage_count';

  SharedPreferences? _prefs;

  Future<void> load() async {
    _prefs ??= await SharedPreferences.getInstance();
    _resetIfNewDay();
  }

  String _today() {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  void _resetIfNewDay() {
    final prefs = _prefs;
    if (prefs == null) return;
    if (prefs.getString(_kDate) != _today()) {
      prefs.setString(_kDate, _today());
      prefs.setInt(_kCount, 0);
    }
  }

  int exportsToday() {
    _resetIfNewDay();
    return _prefs?.getInt(_kCount) ?? 0;
  }

  int remaining() =>
      (LicenseConfig.freeDailyMax - exportsToday()).clamp(0, LicenseConfig.freeDailyMax);

  bool canExport() => exportsToday() < LicenseConfig.freeDailyMax;

  Future<void> recordExport() async {
    _resetIfNewDay();
    final prefs = _prefs;
    if (prefs == null) return;
    await prefs.setInt(_kCount, exportsToday() + 1);
  }
}
