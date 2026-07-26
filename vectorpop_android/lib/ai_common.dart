import 'dart:io';
import 'dart:typed_data';

import 'package:crypto/crypto.dart';
import 'package:path_provider/path_provider.dart';

/// Shared download-on-demand infrastructure for the AI features (finition IA
/// upscale, detourage IA), mirroring the desktop app's ai_module.py /
/// ai_upscale.py pattern: weights are NOT bundled in the APK (they only
/// matter to Pro users who opt in), fetched from a GitHub release into the
/// app's support directory, and verified against a pinned SHA256 before use.
class AiDownloadCancelled implements Exception {}

class AiWeightsCorrupted implements Exception {
  final String expected;
  final String got;
  AiWeightsCorrupted(this.expected, this.got);

  @override
  String toString() => 'Empreinte inattendue (attendu ${expected.substring(0, 16)}…, '
      'obtenu ${got.substring(0, 16)}…)';
}

Future<Directory> aiModelsDir() async {
  final base = await getApplicationSupportDirectory();
  final dir = Directory('${base.path}/ai_models');
  if (!await dir.exists()) await dir.create(recursive: true);
  return dir;
}

Future<String> sha256OfFile(File file) async {
  final digest = await sha256.bind(file.openRead()).first;
  return digest.toString();
}

/// Downloads [url] to [dest], reporting progress and honoring cancellation.
/// Verifies [expectedSha256] before replacing any prior file at [dest]; a
/// mismatched or cancelled download leaves no partial file behind.
Future<void> downloadVerified({
  required String url,
  required File dest,
  required String expectedSha256,
  void Function(int done, int total)? progress,
  bool Function()? shouldCancel,
}) async {
  final tmp = File('${dest.path}.tmp');
  final client = HttpClient();
  try {
    final req = await client.getUrl(Uri.parse(url));
    req.headers.set(HttpHeaders.userAgentHeader, 'VectorPop');
    final res = await req.close();
    if (res.statusCode != 200) {
      throw HttpException('HTTP ${res.statusCode} en telechargeant $url');
    }
    final total = res.contentLength > 0 ? res.contentLength : 0;
    var done = 0;
    final sink = tmp.openWrite();
    await for (final chunk in res) {
      if (shouldCancel != null && shouldCancel()) {
        await sink.close();
        throw AiDownloadCancelled();
      }
      sink.add(chunk);
      done += chunk.length;
      progress?.call(done, total);
    }
    await sink.close();

    final got = await sha256OfFile(tmp);
    if (got != expectedSha256) {
      throw AiWeightsCorrupted(expectedSha256, got);
    }
    if (await dest.exists()) await dest.delete();
    await tmp.rename(dest.path);
  } finally {
    client.close(force: true);
    if (await tmp.exists()) await tmp.delete();
  }
}

/// Converts a `image` package pixel buffer region into the NCHW float32
/// tensor onnxruntime expects, normalized to [0, 1] — same layout as the
/// desktop's `rgb.transpose(2, 0, 1)[None]` in ai_upscale.py.
Float32List rgbToNchw(List<int> rgbBytes, int width, int height) {
  final out = Float32List(3 * width * height);
  final plane = width * height;
  for (var i = 0; i < plane; i++) {
    out[i] = rgbBytes[i * 3] / 255.0;
    out[plane + i] = rgbBytes[i * 3 + 1] / 255.0;
    out[2 * plane + i] = rgbBytes[i * 3 + 2] / 255.0;
  }
  return out;
}

/// Inverse of [rgbToNchw]: reads back an NCHW float32 tensor (values assumed
/// already clamped to [0, 1] by the caller) into interleaved RGB bytes.
List<int> nchwToRgbBytes(List<double> nchw, int width, int height) {
  final out = Uint8List(3 * width * height);
  final plane = width * height;
  for (var i = 0; i < plane; i++) {
    out[i * 3] = (nchw[i].clamp(0.0, 1.0) * 255.0 + 0.5).floor();
    out[i * 3 + 1] = (nchw[plane + i].clamp(0.0, 1.0) * 255.0 + 0.5).floor();
    out[i * 3 + 2] = (nchw[2 * plane + i].clamp(0.0, 1.0) * 255.0 + 0.5).floor();
  }
  return out;
}
