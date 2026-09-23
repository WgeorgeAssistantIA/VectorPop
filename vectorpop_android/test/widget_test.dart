// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:vectorpop/demo_models.dart';
import 'package:vectorpop/export_celebration_sheet.dart';
import 'package:vectorpop/i18n.dart';
import 'package:vectorpop/main.dart';

void main() {
  testWidgets('VectorPopApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const VectorPopApp());
    expect(find.byType(VectorPopApp), findsOneWidget);
  });

  test('DemoModels has 4 preconfigured sample models', () {
    expect(kDemoModels.length, 4);
    expect(kDemoModels.any((m) => m.id == 'logo'), isTrue);
    expect(kDemoModels.any((m) => m.id == 'mascot'), isTrue);
    expect(kDemoModels.any((m) => m.id == 'sketch'), isTrue);
    expect(kDemoModels.any((m) => m.id == 'icon'), isTrue);
  });

  testWidgets('ExportCelebrationSheet renders and invokes callback', (WidgetTester tester) async {
    var proClicked = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ExportCelebrationSheet(
            lang: AppLang.fr,
            onDiscoverPro: () {
              proClicked = true;
            },
          ),
        ),
      ),
    );

    expect(find.text('Félicitations pour votre 1er export !'), findsOneWidget);
    expect(find.text('Découvrir VectorPop Pro (À vie)'), findsOneWidget);
    expect(find.text('Continuer avec la version gratuite'), findsOneWidget);

    await tester.tap(find.text('Découvrir VectorPop Pro (À vie)'));
    await tester.pumpAndSettle();
    expect(proClicked, isTrue);
  });

  test('i18n contains newImage and 8K PNG strings', () {
    final fr = L10n(AppLang.fr);
    final en = L10n(AppLang.en);

    expect(fr.newImage, 'Nouvelle image');
    expect(en.newImage, 'New image');

    expect(fr.paywallFeaturePng, contains('8192px (8K)'));
    expect(en.paywallFeaturePng, contains('8192px (8K)'));
  });
}
