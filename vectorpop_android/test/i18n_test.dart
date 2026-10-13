import 'package:flutter_test/flutter_test.dart';
import 'package:vectorpop/i18n.dart';

void main() {
  group('i18n 15 Languages Test Suite', () {
    test('contains exactly 15 languages in kLanguages and kStrings', () {
      expect(kLanguages.length, 15);
      expect(kStrings.length, 15);

      final expectedCodes = [
        'en',
        'fr',
        'es',
        'pt',
        'de',
        'it',
        'hi',
        'zh',
        'ja',
        'ko',
        'ar',
        'ru',
        'id',
        'tr',
        'vi',
      ];

      for (final code in expectedCodes) {
        expect(kLanguages.any((l) => l.code == code), isTrue,
            reason: 'Language $code missing from kLanguages');
        expect(kStrings.containsKey(code), isTrue,
            reason: 'Language $code missing from kStrings');
      }
    });

    test('no missing keys across all 15 languages compared to English', () {
      final enKeys = kStrings['en']!.keys.toSet();
      expect(enKeys.isNotEmpty, isTrue);

      for (final lang in kLanguages) {
        final langKeys = kStrings[lang.code]!.keys.toSet();
        final missing = enKeys.difference(langKeys);
        expect(missing, isEmpty,
            reason: 'Language ${lang.code} is missing keys: $missing');
      }
    });

    test('placeholder token parity (%param%) across all languages', () {
      final tokenRegex = RegExp(r'%[a-zA-Z0-9_]+%');

      for (final key in kStrings['en']!.keys) {
        final enTokens = tokenRegex
            .allMatches(kStrings['en']![key]!)
            .map((m) => m.group(0)!)
            .toSet();

        for (final lang in kLanguages) {
          final targetVal = kStrings[lang.code]![key]!;
          final targetTokens = tokenRegex
              .allMatches(targetVal)
              .map((m) => m.group(0)!)
              .toSet();

          expect(targetTokens, equals(enTokens),
              reason:
                  'Token mismatch in key "$key" for lang "${lang.code}": expected $enTokens but got $targetTokens');
        }
      }
    });

    test('newline parity (\\n) across all languages', () {
      for (final key in kStrings['en']!.keys) {
        final enNewlines = '\n'.allMatches(kStrings['en']![key]!).length;

        for (final lang in kLanguages) {
          final targetVal = kStrings[lang.code]![key]!;
          final targetNewlines = '\n'.allMatches(targetVal).length;

          expect(targetNewlines, equals(enNewlines),
              reason:
                  'Newline count mismatch in key "$key" for lang "${lang.code}": expected $enNewlines but got $targetNewlines');
        }
      }
    });

    test('RTL detection correctly identifies Arabic', () {
      expect(isRtlLang('ar'), isTrue);
      expect(isRtlLang('AR'), isTrue);
      expect(isRtlLang('fr'), isFalse);
      expect(isRtlLang('en'), isFalse);
      expect(isRtlLang('zh'), isFalse);
      expect(isRtlLang('hi'), isFalse);
    });

    test('defaultLangFromLocale resolves properly with English fallback', () {
      expect(defaultLangFromLocale('fr'), 'fr');
      expect(defaultLangFromLocale('FR'), 'fr');
      expect(defaultLangFromLocale('fr_FR'), 'fr');
      expect(defaultLangFromLocale('es_ES'), 'es');
      expect(defaultLangFromLocale('pt_BR'), 'pt');
      expect(defaultLangFromLocale('de_DE'), 'de');
      expect(defaultLangFromLocale('it_IT'), 'it');
      expect(defaultLangFromLocale('hi_IN'), 'hi');
      expect(defaultLangFromLocale('zh_CN'), 'zh');
      expect(defaultLangFromLocale('ja_JP'), 'ja');
      expect(defaultLangFromLocale('ko_KR'), 'ko');
      expect(defaultLangFromLocale('ar_EG'), 'ar');
      expect(defaultLangFromLocale('ru_RU'), 'ru');
      expect(defaultLangFromLocale('id_ID'), 'id');
      expect(defaultLangFromLocale('tr_TR'), 'tr');
      expect(defaultLangFromLocale('vi_VN'), 'vi');

      // Unsupported locales fallback to 'en'
      expect(defaultLangFromLocale('nl'), 'en');
      expect(defaultLangFromLocale('pl'), 'en');
      expect(defaultLangFromLocale('sv'), 'en');
      expect(defaultLangFromLocale('xx'), 'en');
    });

    test('L10n backward compatibility works for String and AppLang', () {
      final l10nFrEnum = L10n(AppLang.fr);
      final l10nFrStr = L10n('fr');
      final l10nEnEnum = L10n(AppLang.en);
      final l10nAr = L10n('ar');

      expect(l10nFrEnum.newImage, 'Nouvelle image');
      expect(l10nFrStr.newImage, 'Nouvelle image');
      expect(l10nEnEnum.newImage, 'New image');
      expect(l10nAr.newImage, isNotEmpty);

      expect(l10nFrEnum.paywallFeatureSvg, contains('SVG'));
      expect(l10nEnEnum.paywallFeatureSvg, contains('SVG'));
    });

    test('vectorize button, error and demo samples are translated (no FR/EN only)', () {
      final en = L10n('en');
      for (final lang in AppLang.values) {
        final t = L10n(lang);
        expect(t.processing, isNotEmpty);
        expect(t.startVectorization, isNotEmpty);
        expect(t.imageFormatUnrecognized, isNotEmpty);
        for (final id in ['logo', 'mascot', 'sketch', 'icon']) {
          expect(t.demoTitle(id), isNotEmpty);
          expect(t.demoDesc(id), isNotEmpty);
        }
        if (lang != AppLang.en && lang != AppLang.fr) {
          expect(t.startVectorization, isNot(en.startVectorization));
          expect(t.processing, isNot(en.processing));
        }
      }
    });
  });
}
