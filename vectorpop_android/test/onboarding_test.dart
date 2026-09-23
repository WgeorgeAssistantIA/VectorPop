import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vectorpop/i18n.dart';
import 'package:vectorpop/onboarding_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('OnboardingScreen renders step 1 and handles Skip', (WidgetTester tester) async {
    var finished = false;

    await tester.pumpWidget(
      MaterialApp(
        home: OnboardingScreen(
          lang: AppLang.fr,
          onFinish: () {
            finished = true;
          },
        ),
      ),
    );

    // Initial step texts
    expect(find.text('Passer'), findsOneWidget);
    expect(find.text('Suivant'), findsOneWidget);

    // Tap Skip
    await tester.tap(find.text('Passer'));
    await tester.pumpAndSettle();

    expect(finished, isTrue);

    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getBool('has_seen_onboarding'), isTrue);
  });

  testWidgets('OnboardingScreen navigates steps and saves profile on finish', (WidgetTester tester) async {
    var finished = false;

    await tester.pumpWidget(
      MaterialApp(
        home: OnboardingScreen(
          lang: AppLang.fr,
          onFinish: () {
            finished = true;
          },
        ),
      ),
    );

    // Go to step 2
    await tester.tap(find.text('Suivant'));
    await tester.pumpAndSettle();

    // Go to step 3 (Profiling)
    await tester.tap(find.text('Suivant'));
    await tester.pumpAndSettle();

    // Go to step 4 (Privacy & Start)
    await tester.tap(find.text('Suivant'));
    await tester.pumpAndSettle();

    expect(find.text('Commencer à vectoriser'), findsOneWidget);

    await tester.tap(find.text('Commencer à vectoriser'));
    await tester.pumpAndSettle();

    expect(finished, isTrue);

    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getBool('has_seen_onboarding'), isTrue);
  });
}
