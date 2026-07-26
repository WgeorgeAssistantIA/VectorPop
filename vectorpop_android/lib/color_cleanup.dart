import 'dart:math' as math;

import 'package:image/image.dart' as img;

/// Ports of `_merge_near_colors` and `_suppress_aa_fringes` from the desktop
/// app's `vectorizer.py`. Both operate on an already color-quantized RGB
/// image and clean it up before vtracer traces it: fewer, cleaner color
/// layers means fewer, cleaner SVG paths.
class ColorCleanup {
  /// Reduces to [numColors] colors — mirrors
  /// `rgb.quantize(colors=n, method=Image.MEDIANCUT)`.
  static img.Image quantize(img.Image src, int numColors) {
    final n = numColors.clamp(2, 256);
    return img.quantize(src, numberOfColors: n, method: img.QuantizeMethod.octree);
  }

  /// Merges perceptually-close colors into one, keeping the most frequent
  /// color of each cluster as representative — mirrors `_merge_near_colors`.
  /// Fewer near-duplicate shades survive quantization noise -> flatter
  /// aplats, fewer vtracer layers.
  static img.Image mergeNearColors(img.Image src, int threshold) {
    if (threshold <= 0) return src;
    final w = src.width, h = src.height;
    final image = src.convert(numChannels: 4);

    final counts = <int, int>{};
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        final p = image.getPixel(x, y);
        final packed = (p.r.toInt() << 16) | (p.g.toInt() << 8) | p.b.toInt();
        counts[packed] = (counts[packed] ?? 0) + 1;
      }
    }
    final colors = counts.keys.toList()..sort((a, b) => counts[b]!.compareTo(counts[a]!));

    final reps = <List<double>>[]; // representative colors, most frequent first
    final remap = <int, int>{}; // original packed color -> representative packed color
    final thrSq = (threshold * threshold).toDouble();
    for (final c in colors) {
      final ci = [
        ((c >> 16) & 0xFF).toDouble(),
        ((c >> 8) & 0xFF).toDouble(),
        (c & 0xFF).toDouble(),
      ];
      var merged = false;
      for (final r in reps) {
        final dr = ci[0] - r[0], dg = ci[1] - r[1], db = ci[2] - r[2];
        if (dr * dr + dg * dg + db * db <= thrSq) {
          remap[c] = ((r[0].round() << 16) | (r[1].round() << 8) | r[2].round());
          merged = true;
          break;
        }
      }
      if (!merged) {
        reps.add(ci);
        remap[c] = c;
      }
    }

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        final p = image.getPixel(x, y);
        final packed = (p.r.toInt() << 16) | (p.g.toInt() << 8) | p.b.toInt();
        final target = remap[packed]!;
        if (target != packed) {
          image.setPixelRgba(
              x, y, (target >> 16) & 0xFF, (target >> 8) & 0xFF, target & 0xFF, p.a.toInt());
        }
      }
    }
    return image;
  }

  /// Removes the thin "ribbon" color layers created by source anti-aliasing
  /// — mirrors `_suppress_aa_fringes` / `_suppress_aa_fringes_once`. After
  /// quantization, edge pixels (half shape, half background) survive as
  /// their own wafer-thin layer that vtracer traces as an ugly halo. Peeled
  /// pass by pass (an AA edge is often several stacked bands): a band is
  /// either a genuine AA fringe (color sits strictly between its two
  /// neighbors) — removed and symmetrically re-filled from both sides — or a
  /// near-duplicate of one neighbor (quantization noise) — recolored into it
  /// without touching geometry. A solid thin stroke (a real letter, a star
  /// point) matches neither test and survives untouched.
  static img.Image suppressAaFringes(
    img.Image rgb, {
    required List<bool> opaque,
    int mixTol = 40,
    int dupTol = 48,
    double maxFrac = 0.10,
    int maxPass = 3,
  }) {
    var current = rgb;
    for (var pass = 0; pass < maxPass; pass++) {
      final next = _suppressOnce(current, opaque, mixTol.toDouble(), dupTol.toDouble(), maxFrac);
      if (next == null) break;
      current = next;
    }
    return current;
  }

  static img.Image? _suppressOnce(
    img.Image rgb,
    List<bool> opaque,
    double mixTol,
    double dupTol,
    double maxFrac,
  ) {
    final w = rgb.width, h = rgb.height;
    final image = rgb.convert(numChannels: 4);

    final colorToLabel = <int, int>{};
    final colors = <int>[];
    final labels = List<int>.filled(w * h, -1);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        final i = y * w + x;
        if (!opaque[i]) continue;
        final p = image.getPixel(x, y);
        final packed = (p.r.toInt() << 16) | (p.g.toInt() << 8) | p.b.toInt();
        var lbl = colorToLabel[packed];
        if (lbl == null) {
          lbl = colors.length;
          colorToLabel[packed] = lbl;
          colors.add(packed);
        }
        labels[i] = lbl;
      }
    }
    final numColors = colors.length;
    if (numColors < 3) return null;

    var nOpaque = 0;
    final areas = List<int>.filled(numColors, 0);
    final minX = List<int>.filled(numColors, 1 << 30);
    final maxX = List<int>.filled(numColors, -1);
    final minY = List<int>.filled(numColors, 1 << 30);
    final maxY = List<int>.filled(numColors, -1);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        final lbl = labels[y * w + x];
        if (lbl < 0) continue;
        nOpaque++;
        areas[lbl]++;
        if (x < minX[lbl]) minX[lbl] = x;
        if (x > maxX[lbl]) maxX[lbl] = x;
        if (y < minY[lbl]) minY[lbl] = y;
        if (y > maxY[lbl]) maxY[lbl] = y;
      }
    }
    if (nOpaque == 0) return null;

    final fringe = List<bool>.filled(w * h, false);
    final recolor = <int, int>{};

    for (var ci = 0; ci < numColors; ci++) {
      final area = areas[ci];
      if (area == 0 || area > maxFrac * nOpaque) continue;

      final y0 = math.max(0, minY[ci] - 3), y1 = math.min(h, maxY[ci] + 4);
      final x0 = math.max(0, minX[ci] - 3), x1 = math.min(w, maxX[ci] + 4);
      final subW = x1 - x0, subH = y1 - y0;
      final sub = List<bool>.filled(subW * subH, false);
      for (var y = y0; y < y1; y++) {
        for (var x = x0; x < x1; x++) {
          if (labels[y * w + x] == ci) sub[(y - y0) * subW + (x - x0)] = true;
        }
      }

      var core = _erode(sub, subW, subH);
      core = _erode(core, subW, subH);
      var coreCount = 0;
      for (final b in core) {
        if (b) coreCount++;
      }
      if (coreCount > math.max(2, 0.02 * area)) continue; // has a body: not a fringe

      final ring = _ringOf(sub, subW, subH);
      final neighCounts = <int, int>{};
      for (var y = 0; y < subH; y++) {
        for (var x = 0; x < subW; x++) {
          if (!ring[y * subW + x]) continue;
          final lbl = labels[(y + y0) * w + (x + x0)];
          if (lbl >= 0 && lbl != ci) {
            neighCounts[lbl] = (neighCounts[lbl] ?? 0) + 1;
          }
        }
      }
      if (neighCounts.isEmpty) continue;
      final sortedNeigh = neighCounts.keys.toList()
        ..sort((a, b) => neighCounts[b]!.compareTo(neighCounts[a]!));
      final la = sortedNeigh[0];
      final lb = sortedNeigh.length > 1 ? sortedNeigh[1] : la;

      final ca = _rgbOf(colors[la]), cb = _rgbOf(colors[lb]), cc = _rgbOf(colors[ci]);
      final abx = cb[0] - ca[0], aby = cb[1] - ca[1], abz = cb[2] - ca[2];
      final denom = abx * abx + aby * aby + abz * abz;
      var t = denom == 0
          ? 0.0
          : (((cc[0] - ca[0]) * abx) + ((cc[1] - ca[1]) * aby) + ((cc[2] - ca[2]) * abz)) / denom;
      t = t.clamp(0.0, 1.0);
      final projR = ca[0] + t * abx, projG = ca[1] + t * aby, projB = ca[2] + t * abz;
      final dist = math.sqrt(
          math.pow(cc[0] - projR, 2) + math.pow(cc[1] - projG, 2) + math.pow(cc[2] - projB, 2));
      final dA = math.sqrt(
          math.pow(cc[0] - ca[0], 2) + math.pow(cc[1] - ca[1], 2) + math.pow(cc[2] - ca[2], 2));
      final dB = math.sqrt(
          math.pow(cc[0] - cb[0], 2) + math.pow(cc[1] - cb[1], 2) + math.pow(cc[2] - cb[2], 2));

      if (la != lb && t >= 0.15 && t <= 0.85 && dist <= mixTol) {
        for (var y = 0; y < subH; y++) {
          for (var x = 0; x < subW; x++) {
            if (sub[y * subW + x]) fringe[(y + y0) * w + (x + x0)] = true;
          }
        }
      } else if (math.min(dA, dB) <= dupTol) {
        recolor[ci] = dA <= dB ? la : lb;
      }
    }

    final hasFringe = fringe.contains(true);
    if (!hasFringe && recolor.isEmpty) return null;

    final outLabels = List<int>.from(labels);
    recolor.forEach((ci, target) {
      for (var i = 0; i < w * h; i++) {
        if (labels[i] == ci) outLabels[i] = target;
      }
    });

    if (hasFringe) {
      for (var i = 0; i < w * h; i++) {
        if (fringe[i]) outLabels[i] = -2;
      }
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (var pass = 0; pass < 8; pass++) {
        var remaining = false;
        final next = List<int>.from(outLabels);
        for (var y = 0; y < h; y++) {
          for (var x = 0; x < w; x++) {
            final i = y * w + x;
            if (outLabels[i] != -2) continue;
            remaining = true;
            final cands = <int>[];
            for (final d in dirs) {
              final nx = x + d[1], ny = y + d[0];
              cands.add(nx < 0 || nx >= w || ny < 0 || ny >= h ? -1 : outLabels[ny * w + nx]);
            }
            var bestIdx = -1, bestScore = -1;
            for (var a = 0; a < 4; a++) {
              if (cands[a] < 0) continue;
              var score = 0;
              for (var b = 0; b < 4; b++) {
                if (cands[b] >= 0 && cands[a] == cands[b]) score++;
              }
              if (score > bestScore) {
                bestScore = score;
                bestIdx = a;
              }
            }
            if (bestIdx >= 0 && bestScore > 0) {
              next[i] = cands[bestIdx];
            }
          }
        }
        outLabels.setAll(0, next);
        if (!remaining) break;
      }
    }

    final out = img.Image(width: w, height: h, numChannels: 4);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        final i = y * w + x;
        final origA = image.getPixel(x, y).a.toInt();
        final lbl = outLabels[i];
        if (lbl >= 0) {
          final packed = colors[lbl];
          out.setPixelRgba(x, y, (packed >> 16) & 0xFF, (packed >> 8) & 0xFF, packed & 0xFF, origA);
        } else {
          final p = image.getPixel(x, y);
          out.setPixelRgba(x, y, p.r.toInt(), p.g.toInt(), p.b.toInt(), origA);
        }
      }
    }
    return out;
  }

  static List<double> _rgbOf(int packed) =>
      [((packed >> 16) & 0xFF).toDouble(), ((packed >> 8) & 0xFF).toDouble(), (packed & 0xFF).toDouble()];

  static bool _at(List<bool> m, int w, int h, int x, int y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    return m[y * w + x];
  }

  static List<bool> _erode(List<bool> m, int w, int h) {
    final out = List<bool>.filled(w * h, false);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        if (!m[y * w + x]) continue;
        out[y * w + x] =
            _at(m, w, h, x - 1, y) && _at(m, w, h, x + 1, y) && _at(m, w, h, x, y - 1) && _at(m, w, h, x, y + 1);
      }
    }
    return out;
  }

  static List<bool> _ringOf(List<bool> sub, int w, int h) {
    final out = List<bool>.filled(w * h, false);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        if (sub[y * w + x]) continue;
        if (_at(sub, w, h, x - 1, y) ||
            _at(sub, w, h, x + 1, y) ||
            _at(sub, w, h, x, y - 1) ||
            _at(sub, w, h, x, y + 1)) {
          out[y * w + x] = true;
        }
      }
    }
    return out;
  }
}
