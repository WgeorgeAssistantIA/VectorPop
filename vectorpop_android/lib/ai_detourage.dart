import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_onnxruntime/flutter_onnxruntime.dart';
import 'package:image/image.dart' as img;

import 'ai_common.dart';

/// Detourage IA : suppression de fond par segmentation de saillance
/// (u2netp.onnx, meme modele leger que rembg utilise par defaut sur mobile --
/// 4 Mo contre 168 Mo pour u2net "qualite"), port du module desktop
/// (rembg, via ai_module.py). Le masque remplace/complete la suppression de
/// fond par couleur deja presente dans les reglages.
///
class AiDetourageWeightsMissing implements Exception {
  final String message;
  AiDetourageWeightsMissing(this.message);
  @override
  String toString() => message;
}

class AiDetourage {
  static const _published = true;
  static const _weightsVersion = '1';
  static const _fileName = 'u2netp.onnx';
  static const _sha256 =
      '309c8469258dda742793dce0ebea8e6dd393174f89934733ecc8b14c76f4ddd8';
  static const _url = 'https://github.com/WgeorgeAssistantIA/VectorPop/releases/'
      'download/ai-detourage-v$_weightsVersion/$_fileName';

  static const _inputSize = 320;
  // ImageNet normalization -- meme pretraitement que le u2net original.
  static const _mean = [0.485, 0.456, 0.406];
  static const _std = [0.229, 0.224, 0.225];

  static Future<File> _weightsFile() async {
    final dir = await aiModelsDir();
    return File('${dir.path}/$_fileName');
  }

  static bool get isPublished => _published;

  static Future<bool> isAvailable() async {
    if (!_published) return false;
    return (await _weightsFile()).exists();
  }

  static Future<void> downloadWeights({
    void Function(int done, int total)? progress,
    bool Function()? shouldCancel,
  }) async {
    if (!_published) {
      throw AiDetourageWeightsMissing(
          'Le detourage IA n\'est pas encore disponible sur cette version.');
    }
    await downloadVerified(
      url: _url,
      dest: await _weightsFile(),
      expectedSha256: _sha256,
      progress: progress,
      shouldCancel: shouldCancel,
    );
  }

  /// Applique le detourage IA : calcule un masque de saillance (0..255) et
  /// l'utilise comme canal alpha, intersecte avec l'alpha existant (ne
  /// jamais rendre opaque un pixel deja transparent).
  static Future<img.Image> removeBackground(img.Image source) async {
    if (!await isAvailable()) {
      throw AiDetourageWeightsMissing(
          'Le detourage IA necessite le telechargement des poids IA.');
    }
    final w = source.width, h = source.height;

    final resized = img.copyResize(source, width: _inputSize, height: _inputSize,
        interpolation: img.Interpolation.cubic);
    final rgbBytes = resized.getBytes(order: img.ChannelOrder.rgb);
    final input = Float32List(3 * _inputSize * _inputSize);
    final plane = _inputSize * _inputSize;
    for (var i = 0; i < plane; i++) {
      input[i] = (rgbBytes[i * 3] / 255.0 - _mean[0]) / _std[0];
      input[plane + i] = (rgbBytes[i * 3 + 1] / 255.0 - _mean[1]) / _std[1];
      input[2 * plane + i] = (rgbBytes[i * 3 + 2] / 255.0 - _mean[2]) / _std[2];
    }

    final ort = OnnxRuntime();
    final session = await ort.createSession((await _weightsFile()).path);
    List<double> maskFlat;
    try {
      final inputName = session.inputNames.first;
      final outputName = session.outputNames.first;
      final inputTensor = await OrtValue.fromList(input, [1, 3, _inputSize, _inputSize]);
      final outputs = await session.run({inputName: inputTensor});
      await inputTensor.dispose();
      final outTensor = outputs[outputName]!;
      maskFlat = (await outTensor.asFlattenedList()).cast<double>();
      for (final o in outputs.values) {
        await o.dispose();
      }
    } finally {
      await session.close();
    }

    // Etirement min-max, comme rembg normalise la sortie brute de u2net.
    var lo = maskFlat[0], hi = maskFlat[0];
    for (final v in maskFlat) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    final range = (hi - lo) < 1e-6 ? 1.0 : (hi - lo);

    final maskImg = img.Image(width: _inputSize, height: _inputSize, numChannels: 3);
    for (var y = 0; y < _inputSize; y++) {
      for (var x = 0; x < _inputSize; x++) {
        final v = ((maskFlat[y * _inputSize + x] - lo) / range * 255.0 + 0.5)
            .clamp(0, 255)
            .floor();
        maskImg.setPixelRgb(x, y, v, v, v);
      }
    }
    final bigMask = img.copyResize(maskImg, width: w, height: h,
        interpolation: img.Interpolation.cubic);

    final result = source.convert(numChannels: 4);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        final maskA = bigMask.getPixel(x, y).r.toInt();
        final p = result.getPixel(x, y);
        final a = maskA < p.a.toInt() ? maskA : p.a.toInt();
        result.setPixelRgba(x, y, p.r.toInt(), p.g.toInt(), p.b.toInt(), a);
      }
    }
    return result;
  }
}
