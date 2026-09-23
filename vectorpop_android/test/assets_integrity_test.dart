import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:vectorpop/demo_models.dart';

void main() {
  test('All 4 sample assets exist and have valid PNG file signatures', () {
    for (final model in kDemoModels) {
      final file = File(model.assetPath);
      expect(file.existsSync(), isTrue, reason: '${model.assetPath} should exist');

      final bytes = file.readAsBytesSync();
      expect(bytes.length, greaterThan(1000), reason: '${model.assetPath} should not be empty');

      // PNG magic number: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
      expect(bytes[0], 0x89);
      expect(bytes[1], 0x50);
      expect(bytes[2], 0x4E);
      expect(bytes[3], 0x47);
    }
  });
}
