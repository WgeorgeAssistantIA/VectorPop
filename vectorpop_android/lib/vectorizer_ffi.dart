import 'dart:ffi';
import 'dart:io';
import 'dart:typed_data';
import 'package:ffi/ffi.dart';

/// Mirrors `VectorizeParams` in rust/src/lib.rs — field order and types must
/// match exactly, C ABI has no name-based binding.
final class _NativeParams extends Struct {
  @Bool()
  external bool colorModeBinary;
  @Int32()
  external int filterSpeckle;
  @Int32()
  external int colorPrecision;
  @Int32()
  external int layerDifference;
  @Int32()
  external int cornerThreshold;
  @Double()
  external double lengthThreshold;
  @Int32()
  external int spliceThreshold;
  @Int32()
  external int pathPrecision;
  @Int32()
  external int modePolygon;
  @Int32()
  external int maxColors;
}

typedef _VectorizeNative = Pointer<Utf8> Function(
  Pointer<Uint8> pixels,
  IntPtr width,
  IntPtr height,
  Pointer<_NativeParams> params,
);
typedef _VectorizeDart = Pointer<Utf8> Function(
  Pointer<Uint8> pixels,
  int width,
  int height,
  Pointer<_NativeParams> params,
);

typedef _FreeStringNative = Void Function(Pointer<Utf8>);
typedef _FreeStringDart = void Function(Pointer<Utf8>);

class VectorizeParams {
  final bool colorModeBinary;
  final int filterSpeckle;
  final int colorPrecision;
  final int layerDifference;
  final int cornerThreshold;
  final double lengthThreshold;
  final int spliceThreshold;
  final int pathPrecision;
  final int modePolygon; // 0 = spline, 1 = polygon, 2 = pixel/none
  final int maxColors; // 0 = off

  const VectorizeParams({
    this.colorModeBinary = false,
    this.filterSpeckle = 4,
    this.colorPrecision = 6,
    this.layerDifference = 16,
    this.cornerThreshold = 60,
    this.lengthThreshold = 4.0,
    this.spliceThreshold = 45,
    this.pathPrecision = 2,
    this.modePolygon = 0,
    this.maxColors = 0,
  });
}

/// Thin wrapper around the native `vectorpop_core` library.
class VectorizerFfi {
  static final DynamicLibrary _lib = _open();
  static final _VectorizeDart _vectorize = _lib
      .lookup<NativeFunction<_VectorizeNative>>('vectorpop_vectorize')
      .asFunction();
  static final _FreeStringDart _freeString = _lib
      .lookup<NativeFunction<_FreeStringNative>>('vectorpop_free_string')
      .asFunction();

  static DynamicLibrary _open() {
    if (Platform.isAndroid) {
      return DynamicLibrary.open('libvectorpop_core.so');
    }
    throw UnsupportedError('vectorpop_core is only built for Android so far');
  }

  /// [rgba] must be exactly `width * height * 4` bytes (row-major, no
  /// padding, straight — not premultiplied — alpha).
  static String vectorize({
    required Uint8List rgba,
    required int width,
    required int height,
    VectorizeParams params = const VectorizeParams(),
  }) {
    final pixelsPtr = calloc<Uint8>(rgba.length);
    final paramsPtr = calloc<_NativeParams>();
    try {
      pixelsPtr.asTypedList(rgba.length).setAll(0, rgba);

      final p = paramsPtr.ref;
      p.colorModeBinary = params.colorModeBinary;
      p.filterSpeckle = params.filterSpeckle;
      p.colorPrecision = params.colorPrecision;
      p.layerDifference = params.layerDifference;
      p.cornerThreshold = params.cornerThreshold;
      p.lengthThreshold = params.lengthThreshold;
      p.spliceThreshold = params.spliceThreshold;
      p.pathPrecision = params.pathPrecision;
      p.modePolygon = params.modePolygon;
      p.maxColors = params.maxColors;

      final resultPtr = _vectorize(pixelsPtr, width, height, paramsPtr);
      if (resultPtr == nullptr) {
        throw StateError('Vectorization failed in native code');
      }
      try {
        return resultPtr.toDartString();
      } finally {
        _freeString(resultPtr);
      }
    } finally {
      calloc.free(pixelsPtr);
      calloc.free(paramsPtr);
    }
  }
}
