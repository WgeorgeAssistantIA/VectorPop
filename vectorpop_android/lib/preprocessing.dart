import 'dart:math' as math;

import 'package:image/image.dart' as img;

/// Pixel pre-processing ported from the desktop app's `vectorizer.py`
/// (`_remove_background` + the alpha-threshold step of `_preprocess`).
/// Runs before the RGBA buffer is handed to the native vtracer FFI call.
class Preprocessing {
  /// Makes a solid background transparent, estimated from the 4 corners —
  /// mirrors `_remove_background(img, tolerance)` in vectorizer.py. Only
  /// works on flat/uniform backgrounds; complex ones need manual cutout or a
  /// future AI matting pass (rembg equivalent, not ported yet).
  static img.Image removeBackground(img.Image src, {required int tolerance}) {
    final image = src.convert(numChannels: 4);
    final w = image.width, h = image.height;
    final corners = [
      image.getPixel(0, 0),
      image.getPixel(w - 1, 0),
      image.getPixel(0, h - 1),
      image.getPixel(w - 1, h - 1),
    ];
    final rs = corners.map((p) => p.r.toDouble()).toList()..sort();
    final gs = corners.map((p) => p.g.toDouble()).toList()..sort();
    final bs = corners.map((p) => p.b.toDouble()).toList()..sort();
    // Median of 4 samples: average of the two middle values.
    double median(List<double> v) => (v[1] + v[2]) / 2;
    final bgR = median(rs), bgG = median(gs), bgB = median(bs);

    final tolSq = (tolerance * tolerance).toDouble();
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        final p = image.getPixel(x, y);
        final dr = p.r - bgR, dg = p.g - bgG, db = p.b - bgB;
        final distSq = dr * dr + dg * dg + db * db;
        if (distSq <= tolSq) {
          image.setPixelRgba(x, y, p.r.toInt(), p.g.toInt(), p.b.toInt(), 0);
        }
      }
    }
    return image;
  }

  /// Hard alpha threshold: fully-opaque or fully-transparent, no in-between —
  /// mirrors the `keep_transparency` branch of `_preprocess` in
  /// vectorizer.py. Removes soft shadows and AA bleed that would otherwise
  /// become stray semi-transparent paths.
  static img.Image thresholdAlpha(img.Image src, {required int alphaThreshold}) {
    final image = src.convert(numChannels: 4);
    for (final p in image) {
      p.a = p.a >= alphaThreshold ? 255 : 0;
    }
    return image;
  }

  /// Flattens onto white — mirrors `keep_transparency = false`.
  static img.Image flattenOnWhite(img.Image src) {
    final image = src.convert(numChannels: 4);
    for (final p in image) {
      p.a = 255;
    }
    return image;
  }

  static img.Image adjustContrast(img.Image src, int contrast) {
    if (contrast == 0) return src;
    return img.contrast(src, contrast: 100 + math.max(-99, contrast));
  }

  /// Unsharp mask — mirrors `ImageFilter.UnsharpMask(radius=2, percent=sharpen*2,
  /// threshold=2)` in vectorizer.py: blur the image, then push each pixel away
  /// from its blurred value by `amount`, only where the difference exceeds
  /// `threshold` (avoids amplifying flat-color noise). Sharper edges before
  /// vtracer traces them = crisper, more confident paths.
  static img.Image sharpen(img.Image src, int sharpenPercent, {int radius = 2, int threshold = 2}) {
    if (sharpenPercent <= 0) return src;
    final amount = sharpenPercent * 2 / 100.0;
    final image = src.convert(numChannels: 4);
    final blurred = img.gaussianBlur(image.clone(), radius: radius);

    for (var y = 0; y < image.height; y++) {
      for (var x = 0; x < image.width; x++) {
        final p = image.getPixel(x, y);
        final b = blurred.getPixel(x, y);
        final dr = p.r - b.r, dg = p.g - b.g, db = p.b - b.b;
        if (dr.abs() < threshold && dg.abs() < threshold && db.abs() < threshold) {
          continue;
        }
        image.setPixelRgba(
          x,
          y,
          (p.r + dr * amount).clamp(0, 255).round(),
          (p.g + dg * amount).clamp(0, 255).round(),
          (p.b + db * amount).clamp(0, 255).round(),
          p.a.round(),
        );
      }
    }
    return image;
  }
}
