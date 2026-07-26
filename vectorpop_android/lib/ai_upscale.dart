import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_onnxruntime/flutter_onnxruntime.dart';
import 'package:image/image.dart' as img;

import 'ai_common.dart';

/// Finition IA : upscale x4 (Real-ESRGAN ONNX) avant le trace, port du
/// module desktop `ai_upscale.py`. Memes poids, meme URL/SHA256 -- deja
/// heberges pour le desktop, donc rien de nouveau a publier pour cette
/// fonctionnalite.
class AiUpscaleWeightsMissing implements Exception {
  final String message;
  AiUpscaleWeightsMissing(this.message);
  @override
  String toString() => message;
}

class AiUpscale {
  static const _weightsVersion = '1';
  static const _fileName = 'realesr-general-x4v3.onnx';
  static const _sha256 =
      '09b757accd747d7e423c1d352b3e8f23e77cc5742d04bae958d4eb8082b76fa4';
  static const _url = 'https://github.com/WgeorgeAssistantIA/VectorPop/releases/'
      'download/ai-upscale-v$_weightsVersion/$_fileName';

  /// Au-dela, le trace deviendrait enorme (temps + poids SVG) pour zero gain
  /// visuel -- meme garde-fou que le desktop (ai_upscale.py).
  static const maxSideOut = 4800;

  static Future<File> _weightsFile() async {
    final dir = await aiModelsDir();
    return File('${dir.path}/$_fileName');
  }

  static Future<bool> isAvailable() async => (await _weightsFile()).exists();

  static Future<void> downloadWeights({
    void Function(int done, int total)? progress,
    bool Function()? shouldCancel,
  }) async {
    await downloadVerified(
      url: _url,
      dest: await _weightsFile(),
      expectedSha256: _sha256,
      progress: progress,
      shouldCancel: shouldCancel,
    );
  }

  /// Upscale x4 d'une image RGB/RGBA. Decoupe en tuiles avec recouvrement
  /// (memoire bornee), le recouvrement est rogne pour eviter tout raccord
  /// visible -- meme logique que `upscale_x4` cote desktop. L'alpha est
  /// agrandi separement (resize geometrique) : le seuillage du pipeline le
  /// re-binarise de toute facon ensuite.
  static Future<img.Image> upscaleX4(
    img.Image source, {
    int tile = 256,
    int overlap = 12,
    void Function(int done, int total)? progress,
    bool Function()? shouldCancel,
  }) async {
    final w = source.width, h = source.height;
    if ((w > h ? w : h) * 4 > maxSideOut) {
      throw AiUpscaleWeightsMissing(
          'Image trop grande pour la finition IA (max ${maxSideOut ~/ 4} px de cote).');
    }
    if (!await isAvailable()) {
      throw AiUpscaleWeightsMissing(
          'La finition IA necessite le telechargement des poids IA.');
    }

    final hasAlpha = source.numChannels == 4;
    img.Image? alphaAsRgb;
    if (hasAlpha) {
      alphaAsRgb = img.Image(width: w, height: h, numChannels: 3);
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          final a = source.getPixel(x, y).a.toInt();
          alphaAsRgb.setPixelRgb(x, y, a, a, a);
        }
      }
    }

    final ort = OnnxRuntime();
    final session = await ort.createSession((await _weightsFile()).path);
    final inputName = session.inputNames.first;
    final outputName = session.outputNames.first;

    final out = img.Image(width: w * 4, height: h * 4, numChannels: 3);
    try {
      final xs = [for (var x = 0; x < w; x += tile) x];
      final ys = [for (var y = 0; y < h; y += tile) y];
      final total = xs.length * ys.length;
      var done = 0;

      for (final y0 in ys) {
        for (final x0 in xs) {
          if (shouldCancel != null && shouldCancel()) {
            throw AiDownloadCancelled();
          }
          final y1 = (y0 + tile) > h ? h : y0 + tile;
          final x1 = (x0 + tile) > w ? w : x0 + tile;
          final py0 = (y0 - overlap) < 0 ? 0 : y0 - overlap;
          final px0 = (x0 - overlap) < 0 ? 0 : x0 - overlap;
          final py1 = (y1 + overlap) > h ? h : y1 + overlap;
          final px1 = (x1 + overlap) > w ? w : x1 + overlap;
          final tileW = px1 - px0, tileH = py1 - py0;

          final cropped = img.copyCrop(source, x: px0, y: py0, width: tileW, height: tileH);
          final rgbBytes = cropped.getBytes(order: img.ChannelOrder.rgb);
          final input = rgbToNchw(rgbBytes, tileW, tileH);
          final inputTensor = await OrtValue.fromList(input, [1, 3, tileH, tileW]);
          final outputs = await session.run({inputName: inputTensor});
          await inputTensor.dispose();

          final outTensor = outputs[outputName]!;
          final outFlat = (await outTensor.asFlattenedList()).cast<double>();
          for (final o in outputs.values) {
            await o.dispose();
          }

          final outTileW = tileW * 4, outTileH = tileH * 4;
          final outRgbBytes = Uint8List.fromList(nchwToRgbBytes(outFlat, outTileW, outTileH));
          final outTileImg = img.Image.fromBytes(
            width: outTileW,
            height: outTileH,
            bytes: outRgbBytes.buffer,
            numChannels: 3,
            order: img.ChannelOrder.rgb,
          );

          final cy0 = (y0 - py0) * 4, cx0 = (x0 - px0) * 4;
          final coreW = (x1 - x0) * 4, coreH = (y1 - y0) * 4;
          for (var yy = 0; yy < coreH; yy++) {
            for (var xx = 0; xx < coreW; xx++) {
              final p = outTileImg.getPixel(cx0 + xx, cy0 + yy);
              out.setPixelRgb(x0 * 4 + xx, y0 * 4 + yy, p.r.toInt(), p.g.toInt(), p.b.toInt());
            }
          }

          done++;
          progress?.call(done, total);
        }
      }
    } finally {
      await session.close();
    }

    if (!hasAlpha) return out;
    final bigAlpha = img.copyResize(alphaAsRgb!, width: w * 4, height: h * 4,
        interpolation: img.Interpolation.cubic);
    final result = out.convert(numChannels: 4);
    for (var y = 0; y < result.height; y++) {
      for (var x = 0; x < result.width; x++) {
        final a = bigAlpha.getPixel(x, y).r.toInt();
        final p = result.getPixel(x, y);
        result.setPixelRgba(x, y, p.r.toInt(), p.g.toInt(), p.b.toInt(), a);
      }
    }
    return result;
  }
}
