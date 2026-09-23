import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vectorpop/i18n.dart';
import 'package:vectorpop/license.dart';
import 'package:vectorpop/paywall_sheet.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('PaywallSheet displays ROI banner, lifetime badge, and triggers buy/restore', (WidgetTester tester) async {
    var buyClicked = false;
    var restoreClicked = false;

    final license = LicenseManager();
    license.mockProduct = ProductDetails(
      id: LicenseConfig.productId,
      title: 'VectorPop Pro',
      description: 'Lifetime Access',
      price: '19,99 €',
      rawPrice: 19.99,
      currencyCode: 'EUR',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: PaywallSheet(
            t: const L10n(AppLang.fr),
            license: license,
            totalExports: 8,
            onBuy: () {
              buyClicked = true;
            },
            onRestore: () {
              restoreClicked = true;
            },
          ),
        ),
      ),
    );

    // Verify ROI banner text
    expect(find.textContaining('8 images'), findsOneWidget);

    // Verify Lifetime badge
    expect(find.text('ACCÈS À VIE — SANS ABONNEMENT'), findsOneWidget);

    // Verify 4 Pillars
    expect(find.text(const L10n(AppLang.fr).paywallFeatureSvg), findsOneWidget);
    expect(find.text(const L10n(AppLang.fr).paywallFeaturePng), findsOneWidget);

    // Verify Buy CTA button tap
    final buyBtn = find.textContaining('Débloquer');
    expect(buyBtn, findsOneWidget);
    await tester.tap(buyBtn);
    await tester.pump();
    expect(buyClicked, isTrue);

    // Verify Restore button tap
    final restoreBtn = find.text('Restaurer mes achats');
    expect(restoreBtn, findsOneWidget);
    await tester.ensureVisible(restoreBtn);
    await tester.tap(restoreBtn);
    await tester.pump();
    expect(restoreClicked, isTrue);
  });
}
