import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vectorpop/license.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('UsageTracker Tests', () {
    test('New user: gets 3 lifetime exports, blocked at 4th export', () async {
      final tracker = UsageTracker();
      await tracker.load();

      expect(tracker.isEarlyUser, isFalse);
      expect(tracker.exportsToday(), 0);
      expect(tracker.totalExports(), 0);
      expect(tracker.remaining(), LicenseConfig.freeLifetimeMax);
      expect(tracker.canExport(), isTrue);

      await tracker.recordExport();
      expect(tracker.exportsToday(), 1);
      expect(tracker.totalExports(), 1);
      expect(tracker.remaining(), LicenseConfig.freeLifetimeMax - 1);
      expect(tracker.canExport(), isTrue);

      await tracker.recordExport();
      await tracker.recordExport();
      expect(tracker.exportsToday(), 3);
      expect(tracker.totalExports(), 3);
      expect(tracker.remaining(), 0);
      expect(tracker.canExport(), isFalse);
    });

    test('New user: lifetime quota persists across days', () async {
      SharedPreferences.setMockInitialValues({
        'is_early_user': false,
        'total_vectorizations': 3,
      });

      final tracker = UsageTracker();
      await tracker.load();

      expect(tracker.isEarlyUser, isFalse);
      expect(tracker.totalExports(), 3);
      expect(tracker.remaining(), 0);
      expect(tracker.canExport(), isFalse);
    });

    test('UsageTracker: 3 lifetime trial exports strictly enforced', () async {
      SharedPreferences.setMockInitialValues({
        'has_seen_onboarding': true,
        'total_vectorizations': 3,
      });

      final tracker = UsageTracker();
      await tracker.load();

      expect(tracker.totalExports(), 3);
      expect(tracker.remaining(), 0);
      expect(tracker.canExport(), isFalse);
    });
  });
}
