import 'dart:async';
import 'dart:io';
import 'dart:isolate';
import 'dart:typed_data' show Uint8List;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show RootIsolateToken, BackgroundIsolateBinaryMessenger;
import 'package:flutter_svg/flutter_svg.dart';
import 'package:image/image.dart' as img;
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import 'ai_common.dart';
import 'ai_detourage.dart';
import 'ai_upscale.dart';
import 'color_cleanup.dart';
import 'i18n.dart';
import 'license.dart';
import 'preprocessing.dart';
import 'vectorizer_ffi.dart';

void main() => runApp(const VectorPopApp());

/// Top-level so the closure captured by [Isolate.run] only closes over its
/// own parameters -- an inline closure inside a State method can end up
/// sharing the method's compiler-generated context with sibling closures
/// (e.g. the surrounding `setState` calls), which drags `this` (and the
/// whole widget tree behind it) along and makes the isolate message
/// unsendable at runtime (`flutter analyze` does not catch this).
Future<img.Image?> _decodeImageBytes(Uint8List bytes) {
  return Isolate.run(() => img.decodeImage(bytes));
}

Future<img.Image> _runAiUpscaleIsolate(img.Image source, RootIsolateToken token) {
  return Isolate.run(() async {
    BackgroundIsolateBinaryMessenger.ensureInitialized(token);
    return AiUpscale.upscaleX4(source);
  });
}

Future<img.Image> _runAiDetourageIsolate(img.Image source, RootIsolateToken token) {
  return Isolate.run(() async {
    BackgroundIsolateBinaryMessenger.ensureInitialized(token);
    return AiDetourage.removeBackground(source);
  });
}

Future<String> _runVectorizePipeline({
  required img.Image source,
  required bool aiDetourageRan,
  required bool removeBg,
  required int bgTol,
  required bool keepTrans,
  required int alphaThresh,
  required int contrast,
  required int sharpen,
  required bool modeBinary,
  required bool mergeColors,
  required int precision,
  required int mergeThresh,
  required bool cleanEdges,
  required int filterSpeckle,
  required int cornerThresh,
  required int layerDiff,
}) {
  return Isolate.run(() {
    var working = source;
    if (!aiDetourageRan && removeBg) {
      working = Preprocessing.removeBackground(working, tolerance: bgTol);
    }
    working = keepTrans
        ? Preprocessing.thresholdAlpha(working, alphaThreshold: alphaThresh)
        : Preprocessing.flattenOnWhite(working);
    working = Preprocessing.adjustContrast(working, contrast);
    working = Preprocessing.sharpen(working, sharpen);

    if (!modeBinary && mergeColors) {
      final opaque = <bool>[];
      final withAlpha = working.convert(numChannels: 4);
      for (var y = 0; y < withAlpha.height; y++) {
        for (var x = 0; x < withAlpha.width; x++) {
          opaque.add(withAlpha.getPixel(x, y).a > 0);
        }
      }
      final colorCount = (1 << precision).clamp(2, 256);
      working = ColorCleanup.quantize(working, colorCount);
      working = ColorCleanup.mergeNearColors(working, mergeThresh);
      if (cleanEdges) {
        working = ColorCleanup.suppressAaFringes(working, opaque: opaque);
      }
      final restored = working.convert(numChannels: 4);
      for (var y = 0; y < restored.height; y++) {
        for (var x = 0; x < restored.width; x++) {
          if (!opaque[y * restored.width + x]) {
            final p = restored.getPixel(x, y);
            restored.setPixelRgba(x, y, p.r.toInt(), p.g.toInt(), p.b.toInt(), 0);
          }
        }
      }
      working = restored;
    }

    final rgba = working.convert(numChannels: 4);
    return VectorizerFfi.vectorize(
      rgba: rgba.getBytes(order: img.ChannelOrder.rgba),
      width: rgba.width,
      height: rgba.height,
      params: VectorizeParams(
        colorModeBinary: modeBinary,
        colorPrecision: precision,
        filterSpeckle: filterSpeckle,
        cornerThreshold: cornerThresh,
        layerDifference: layerDiff,
      ),
    );
  });
}

/// Brand palette lifted from the desktop app's theme.py (the "feather"
/// gradient: violet -> magenta -> cyan).
class Brand {
  static const accent1 = Color(0xFF7A52F5); // violet
  static const accent2 = Color(0xFFC92BC0); // magenta
  static const accent3 = Color(0xFF3FD7FB); // cyan

  static const gradient = LinearGradient(
    colors: [accent1, accent2, accent3],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );
}

class VectorPopApp extends StatefulWidget {
  const VectorPopApp({super.key});

  @override
  State<VectorPopApp> createState() => _VectorPopAppState();
}

class _VectorPopAppState extends State<VectorPopApp> {
  ThemeMode _themeMode = ThemeMode.system;
  AppLang _lang = AppLang.fr;

  void _toggleTheme() {
    setState(() {
      final isDark = _themeMode == ThemeMode.dark ||
          (_themeMode == ThemeMode.system &&
              WidgetsBinding.instance.platformDispatcher.platformBrightness == Brightness.dark);
      _themeMode = isDark ? ThemeMode.light : ThemeMode.dark;
    });
  }

  void _toggleLang() {
    setState(() => _lang = _lang == AppLang.fr ? AppLang.en : AppLang.fr);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VectorPop',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Brand.accent1,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF4F5FA),
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Brand.accent1,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFF1B1C25),
        cardColor: const Color(0xFF242631),
      ),
      home: VectorizeScreen(
        onToggleTheme: _toggleTheme,
        themeMode: _themeMode,
        lang: _lang,
        onToggleLang: _toggleLang,
      ),
    );
  }
}

enum _Preset { flat, detailed, bw, custom }

class _Settings {
  bool colorModeBinary = false;
  double colorPrecision = 6;
  double filterSpeckle = 4;
  double cornerThreshold = 60;
  double layerDifference = 16;
  bool removeBackground = false;
  double bgTolerance = 32;
  bool keepTransparency = true;
  double alphaThreshold = 128;
  double contrast = 0;
  double sharpen = 0;
  bool mergeColors = true;
  double mergeThreshold = 24;
  bool cleanEdges = true;
  bool aiUpscale = false;
  bool aiDetourage = false;

  void applyPreset(_Preset preset) {
    switch (preset) {
      case _Preset.flat:
        colorModeBinary = false;
        filterSpeckle = 4;
        colorPrecision = 6;
        cornerThreshold = 60;
        layerDifference = 16;
        mergeColors = true;
        mergeThreshold = 24;
        cleanEdges = true;
        break;
      case _Preset.detailed:
        colorModeBinary = false;
        filterSpeckle = 2;
        colorPrecision = 8;
        layerDifference = 8;
        cornerThreshold = 40;
        mergeColors = false;
        cleanEdges = false;
        break;
      case _Preset.bw:
        colorModeBinary = true;
        filterSpeckle = 4;
        cornerThreshold = 60;
        break;
      case _Preset.custom:
        break;
    }
  }
}

class VectorizeScreen extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final ThemeMode themeMode;
  final AppLang lang;
  final VoidCallback onToggleLang;

  const VectorizeScreen({
    super.key,
    required this.onToggleTheme,
    required this.themeMode,
    required this.lang,
    required this.onToggleLang,
  });

  @override
  State<VectorizeScreen> createState() => _VectorizeScreenState();
}

class _VectorizeScreenState extends State<VectorizeScreen> {
  File? _sourceFile;
  img.Image? _decoded;
  String? _svg;
  bool _busy = false;
  String? _error;
  bool _showAfter = true;
  _Preset _preset = _Preset.flat;
  final _settings = _Settings();
  Timer? _debounce;
  final _license = LicenseManager();
  final _usage = UsageTracker();
  bool _licenseLoaded = false;
  bool _aiUpscaleAvailable = false;
  bool _aiDetourageAvailable = false;

  L10n get t => L10n(widget.lang);

  @override
  void initState() {
    super.initState();
    _initLicense();
  }

  Future<void> _initLicense() async {
    // The billing service pushes updates for us (product loaded, purchase
    // completed, pending state, errors) so the UI can rebuild without us
    // polling: just wire the callback and trigger a rebuild on each event.
    _license.onChanged = () {
      if (mounted) setState(() {});
    };
    await _license.load();
    await _usage.load();
    final upAvailable = await AiUpscale.isAvailable();
    final detAvailable = await AiDetourage.isAvailable();
    if (!mounted) return;
    setState(() {
      _licenseLoaded = true;
      _aiUpscaleAvailable = upAvailable;
      _aiDetourageAvailable = detAvailable;
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _license.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (picked == null) return;
    final file = File(picked.path);
    final bytes = await file.readAsBytes();
    
    setState(() {
      _busy = true;
      _error = null;
    });
    await Future.delayed(const Duration(milliseconds: 50));

    final decoded = await _decodeImageBytes(bytes);
    if (decoded == null) {
      setState(() {
        _busy = false;
        _error = t.lang == AppLang.fr
            ? 'Format image non reconnu'
            : 'Unrecognized image format';
      });
      return;
    }
    setState(() {
      _sourceFile = file;
      _decoded = decoded;
      _svg = null;
      _error = null;
      _showAfter = false; // Show the original image first
      _busy = false; // We are done loading the image
    });
  }

  void _scheduleVectorize({bool immediate = false}) {
    _debounce?.cancel();
    if (_decoded == null) return;
    if (immediate) {
      _vectorize();
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 350), _vectorize);
  }

  Future<void> _vectorize() async {
    final decoded = _decoded;
    if (decoded == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    // Let the UI render the loading state
    await Future.delayed(const Duration(milliseconds: 50));

    try {
      var working = decoded;
      // Finition IA en tout premier : elle redessine la source AVANT le
      // reste du pipeline, comme cote desktop (ai_upscale.py) -- les etapes
      // suivantes (fond, seuillage, contraste...) travaillent alors sur une
      // image deja nettoyee/agrandie.
      //
      // Chaque appel tourne dans son propre Isolate.run() : les boucles
      // pixel-par-pixel de conversion NCHW/masque (ai_upscale.dart,
      // ai_detourage.dart) sont du Dart pur et bloqueraient sinon le thread
      // UI pendant plusieurs secondes sur une grosse image (ANR). Le plugin
      // onnxruntime parle par MethodChannel, qui n'existe pas dans un isolate
      // frais -- BackgroundIsolateBinaryMessenger le reconnecte au moteur
      // Flutter via le token du isolate racine.
      final rootIsolateToken = RootIsolateToken.instance!;
      if (_settings.aiUpscale && _aiUpscaleAvailable) {
        working = await _runAiUpscaleIsolate(working, rootIsolateToken);
      }
      final aiDetourageRan = _settings.aiDetourage && _aiDetourageAvailable;
      if (aiDetourageRan) {
        working = await _runAiDetourageIsolate(working, rootIsolateToken);
      }

      final svg = await _runVectorizePipeline(
        source: working,
        aiDetourageRan: aiDetourageRan,
        removeBg: _settings.removeBackground,
        bgTol: _settings.bgTolerance.round(),
        keepTrans: _settings.keepTransparency,
        alphaThresh: _settings.alphaThreshold.round(),
        contrast: _settings.contrast.round(),
        sharpen: _settings.sharpen.round(),
        modeBinary: _settings.colorModeBinary,
        mergeColors: _settings.mergeColors,
        precision: _settings.colorPrecision.round(),
        mergeThresh: _settings.mergeThreshold.round(),
        cleanEdges: _settings.cleanEdges,
        filterSpeckle: _settings.filterSpeckle.round(),
        cornerThresh: _settings.cornerThreshold.round(),
        layerDiff: _settings.layerDifference.round(),
      );
      if (!mounted) return;
      setState(() {
        _svg = svg;
        _showAfter = true; // Auto-switch to the result view
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _exportSvg() async {
    final svg = _svg;
    if (svg == null) return;
    if (!_license.isPro() && !_usage.canExport()) {
      await _showQuotaReachedDialog();
      return;
    }
    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/vectorpop_export.svg');
    await file.writeAsString(svg);
    if (!_license.isPro()) await _usage.recordExport();
    if (mounted) setState(() {});
    await Share.shareXFiles([XFile(file.path)]);
  }

  Future<void> _exportPng(int longSidePx) async {
    final svg = _svg;
    if (svg == null) return;
    setState(() => _busy = true);
    try {
      final loader = SvgStringLoader(svg);
      final pictureInfo = await vg.loadPicture(loader, null);
      final srcW = pictureInfo.size.width;
      final srcH = pictureInfo.size.height;
      final scale = longSidePx / (srcW > srcH ? srcW : srcH);
      final targetW = (srcW * scale).round().clamp(1, 8192);
      final targetH = (srcH * scale).round().clamp(1, 8192);

      final recorder = ui.PictureRecorder();
      final canvas = Canvas(recorder);
      canvas.scale(scale);
      canvas.drawPicture(pictureInfo.picture);
      final picture = recorder.endRecording();
      final image = await picture.toImage(targetW, targetH);
      final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
      pictureInfo.picture.dispose();
      image.dispose();
      if (bytes == null) throw StateError('PNG encode failed');

      final dir = await getTemporaryDirectory();
      final file = File('${dir.path}/vectorpop_export.png');
      await file.writeAsBytes(bytes.buffer.asUint8List(), flush: true);
      if (!mounted) return;
      await Share.shareXFiles([XFile(file.path)]);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _showExportDialog() async {
    if (_svg == null) return;
    var format = 'svg';
    var size = 1024;
    var isCustom = false;
    final sizes = [128, 256, 512, 1024, 2048, 4096];
    final customController = TextEditingController();

    await showDialog<void>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(t.exportTitle),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t.exportFormat, style: Theme.of(context).textTheme.labelLarge),
                const SizedBox(height: 8),
                SegmentedButton<String>(
                  segments: [
                    const ButtonSegment(value: 'svg', label: Text('SVG')),
                    ButtonSegment(
                      value: 'png',
                      label: Text('PNG'),
                      icon: _license.isPro() ? null : const Icon(Icons.lock_outline, size: 14),
                    ),
                  ],
                  selected: {format},
                  onSelectionChanged: (s) => setDialogState(() => format = s.first),
                ),
                if (format == 'png') ...[
                  const SizedBox(height: 16),
                  Text(t.exportSize, style: Theme.of(context).textTheme.labelLarge),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      ...sizes.map((s) => ChoiceChip(
                            label: Text('${s}px'),
                            selected: !isCustom && size == s,
                            onSelected: (_) => setDialogState(() {
                              isCustom = false;
                              size = s;
                            }),
                          )),
                      ChoiceChip(
                        label: Text(t.exportCustomSize),
                        selected: isCustom,
                        onSelected: (_) => setDialogState(() => isCustom = true),
                      ),
                    ],
                  ),
                  if (isCustom) ...[
                    const SizedBox(height: 12),
                    TextField(
                      controller: customController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: t.exportCustomSizeLabel,
                        border: const OutlineInputBorder(),
                        isDense: true,
                      ),
                      onChanged: (v) => size = int.tryParse(v) ?? size,
                    ),
                  ],
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(t.exportCancel),
            ),
            FilledButton(
              onPressed: () {
                if (isCustom) {
                  size = int.tryParse(customController.text) ?? size;
                }
                Navigator.of(context).pop();
                if (format == 'svg') {
                  _exportSvg();
                } else if (!_license.isPro()) {
                  _showPngProOnlyDialog();
                } else {
                  _exportPng(size.clamp(16, 8192));
                }
              },
              child: Text(t.exportConfirm),
            ),
          ],
        ),
      ),
    );
  }

  void _update(VoidCallback fn, {bool immediate = false}) {
    setState(() {
      fn();
      _preset = _Preset.custom;
    });
  }

  /// Confirme puis telecharge un modele IA a la demande (progression +
  /// annulation), reutilise pour la finition et le detourage. Renvoie
  /// `true` seulement si le modele est pret a l'usage a l'issue de l'appel.
  Future<bool> _ensureAiWeights({
    required bool Function() isAvailable,
    required Future<void> Function({
      required void Function(int done, int total) progress,
      required bool Function() shouldCancel,
    }) download,
    required String sizeMb,
  }) async {
    if (isAvailable()) return true;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t.aiDownloadTitle),
        content: Text(t.aiDownloadBody(sizeMb)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(t.aiDownloadCancel),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(t.aiDownloadConfirm),
          ),
        ],
      ),
    );
    if (confirmed != true) return false;
    if (!mounted) return false;
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => _AiDownloadDialog(
        title: t.aiDownloading,
        cancelLabel: t.aiDownloadCancel,
        download: download,
      ),
    );
    return result == true;
  }

  Future<void> _onToggleAiUpscale(bool v) async {
    if (!_license.isPro()) {
      _showProDialog();
      return;
    }
    if (v && !_aiUpscaleAvailable) {
      final ok = await _ensureAiWeights(
        isAvailable: () => _aiUpscaleAvailable,
        download: ({required progress, required shouldCancel}) =>
            AiUpscale.downloadWeights(progress: progress, shouldCancel: shouldCancel),
        sizeMb: '5',
      );
      if (!ok || !mounted) return;
      setState(() => _aiUpscaleAvailable = true);
    }
    _update(() => _settings.aiUpscale = v, immediate: true);
  }

  Future<void> _onToggleAiDetourage(bool v) async {
    if (!_license.isPro()) {
      _showProDialog();
      return;
    }
    if (v && !_aiDetourageAvailable) {
      final ok = await _ensureAiWeights(
        isAvailable: () => _aiDetourageAvailable,
        download: ({required progress, required shouldCancel}) =>
            AiDetourage.downloadWeights(progress: progress, shouldCancel: shouldCancel),
        sizeMb: '4',
      );
      if (!ok || !mounted) return;
      setState(() => _aiDetourageAvailable = true);
    }
    _update(() => _settings.aiDetourage = v, immediate: true);
  }

  /// Bouton "signaler" requis par les politiques Play/Store sur le contenu
  /// genere par IA (equivalent Android de la regle 11.16 Microsoft Store deja
  /// appliquee cote desktop) : toujours visible, pas conditionne a l'usage
  /// effectif d'une finition IA.
  Future<void> _reportAiIssue() async {
    final uri = Uri(
      scheme: 'mailto',
      path: 'george.william@hotmail.fr',
      query: 'subject=${Uri.encodeComponent(t.aiReportSubject)}'
          '&body=${Uri.encodeComponent(t.aiReportBody)}',
    );
    await launchUrl(uri);
  }


  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        title: ShaderMask(
          shaderCallback: (bounds) => Brand.gradient.createShader(bounds),
          child: const Text('VectorPop', style: TextStyle(color: Colors.white)),
        ),
        actions: [
          _buildProBadge(),
          TextButton(
            onPressed: widget.onToggleLang,
            child: Text(
              widget.lang == AppLang.fr ? 'FR' : 'EN',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          IconButton(
            tooltip: t.aiReportIssue,
            onPressed: _reportAiIssue,
            icon: const Icon(Icons.flag_outlined),
          ),
          IconButton(
            tooltip: t.helpDialogTitle,
            onPressed: _showHelpDialog,
            icon: const Icon(Icons.help_outline),
          ),
          IconButton(
            tooltip: isDark ? t.lightMode : t.darkMode,
            onPressed: widget.onToggleTheme,
            icon: Icon(isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined),
          ),
          IconButton(
            tooltip: t.exportTitle,
            onPressed: _svg == null ? null : _showExportDialog,
            icon: const Icon(Icons.ios_share),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isLandscape = constraints.maxWidth > constraints.maxHeight;
            final preview = _buildPreview();
            final controls = _buildControlsPanel();
            if (isLandscape) {
              return Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(flex: 3, child: Padding(padding: const EdgeInsets.all(16), child: preview)),
                  SizedBox(
                    width: 340,
                    child: Material(
                      elevation: 1,
                      child: controls,
                    ),
                  ),
                ],
              );
            }
            return Column(
              children: [
                Expanded(child: Padding(padding: const EdgeInsets.all(16), child: preview)),
                SizedBox(height: 320, child: Material(elevation: 1, child: controls)),
              ],
            );
          },
        ),
      ),
    );
  }

  void _applyRecipe(void Function(_Settings s) apply) {
    setState(() {
      apply(_settings);
      _preset = _Preset.custom;
    });
  }

  Future<void> _showHelpDialog() async {
    final recipes = <(String, String, void Function(_Settings))>[
      (
        t.recipeFlatTitle,
        t.recipeFlatDesc,
        (s) {
          s.colorModeBinary = false;
          s.colorPrecision = 6;
          s.mergeColors = true;
          s.mergeThreshold = 24;
          s.cleanEdges = true;
          s.removeBackground = false;
        },
      ),
      (
        t.recipeGlossyTitle,
        t.recipeGlossyDesc,
        (s) {
          s.colorModeBinary = false;
          s.colorPrecision = 8;
          s.cornerThreshold = 40;
          s.filterSpeckle = 6;
          s.mergeColors = false;
          s.removeBackground = false;
        },
      ),
      (
        t.recipeBwTitle,
        t.recipeBwDesc,
        (s) {
          s.colorModeBinary = true;
          s.removeBackground = false;
        },
      ),
      (
        t.recipePhotoTitle,
        t.recipePhotoDesc,
        (s) {
          s.colorModeBinary = false;
          s.colorPrecision = 8;
          s.filterSpeckle = 6;
          s.mergeColors = false;
        },
      ),
      (
        t.recipeBgTitle,
        t.recipeBgDesc,
        (s) {
          s.colorModeBinary = false;
          s.removeBackground = true;
          s.bgTolerance = 32;
        },
      ),
    ];
    final tips = <(String, String)>[
      (t.tipBandsProb, t.tipBandsSol),
      (t.tipHeavyProb, t.tipHeavySol),
      (t.tipJaggedProb, t.tipJaggedSol),
      (t.tipNoiseProb, t.tipNoiseSol),
    ];

    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t.helpDialogTitle),
        content: SizedBox(
          width: 480,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(t.helpDialogIntro, style: const TextStyle(fontSize: 13)),
                const SizedBox(height: 16),
                for (final r in recipes) _recipeCard(r.$1, r.$2, r.$3),
                const SizedBox(height: 12),
                Text(t.troubleshootTitle, style: Theme.of(context).textTheme.labelLarge),
                const SizedBox(height: 8),
                for (final tip in tips) _tipRow(tip.$1, tip.$2),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(t.exportCancel),
          ),
        ],
      ),
    );
  }

  Widget _recipeCard(String title, String desc, void Function(_Settings) apply) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5, color: Brand.accent1)),
          const SizedBox(height: 4),
          Text(desc, style: const TextStyle(fontSize: 12.5)),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: Brand.gradient,
                borderRadius: BorderRadius.circular(8),
              ),
              child: FilledButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  _applyRecipe(apply);
                },
                style: FilledButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                ),
                child: Text(t.recipeApplyBtn),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tipRow(String problem, String solution) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: scheme.surfaceContainerHighest.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.lightbulb_outline, size: 15, color: scheme.onSurfaceVariant),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(problem, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w500)),
                const SizedBox(height: 2),
                Text(solution,
                    style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProBadge() {
    final isPro = _licenseLoaded && _license.isPro();
    if (isPro) {
      return Padding(
        padding: const EdgeInsets.only(right: 4),
        child: Chip(
          avatar: const Icon(Icons.workspace_premium, size: 16, color: Colors.white),
          label: Text(t.pro, style: const TextStyle(color: Colors.white, fontSize: 12)),
          backgroundColor: Brand.accent1,
          visualDensity: VisualDensity.compact,
          padding: EdgeInsets.zero,
        ),
      );
    }
    return TextButton.icon(
      onPressed: _showProDialog,
      icon: const Icon(Icons.workspace_premium_outlined, size: 16),
      label: Text(t.goPro),
    );
  }

  Future<void> _showProDialog() async {
    // Auto-close the dialog once the purchase succeeds so the user isn't
    // stuck on the CTA after Play returns them to the app.
    void listener() {
      if (!mounted) return;
      setState(() {});
      if (_license.isPro() && Navigator.of(context, rootNavigator: true).canPop()) {
        Navigator.of(context, rootNavigator: true).pop();
      }
    }

    final previous = _license.onChanged;
    _license.onChanged = () {
      previous?.call();
      listener();
    };

    await showDialog<void>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          // Local rebuild so the dialog reflects pending/error transitions.
          _license.onChanged = () {
            previous?.call();
            listener();
            setDialogState(() {});
          };
          return AlertDialog(
            title: Text(t.proBenefitsTitle),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _benefitRow(Icons.high_quality_outlined, t.proBenefitPng),
                _benefitRow(Icons.all_inclusive, t.proBenefitUnlimited),
                const SizedBox(height: 10),
                Text(t.proBenefitBoth, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                if (_license.purchasePending) ...[
                  const SizedBox(height: 12),
                  Row(children: [
                    const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                    const SizedBox(width: 8),
                    Text(t.purchasePending, style: const TextStyle(fontSize: 12)),
                  ]),
                ],
                if (_license.lastError != null) ...[
                  const SizedBox(height: 8),
                  Text(_license.lastError!,
                      style: const TextStyle(color: Colors.red, fontSize: 12)),
                ],
              ],
            ),
            actions: [
              TextButton(
                onPressed: () async {
                  await _license.restorePurchases();
                },
                child: Text(t.restorePurchases),
              ),
              FilledButton(
                onPressed: _license.canBuy && !_license.purchasePending
                    ? () async {
                        await _license.buyPro();
                      }
                    : null,
                child: Text(_license.canBuy
                    ? t.buyProForPrice(_license.formattedPrice)
                    : t.buyProUnavailable),
              ),
            ],
          );
        },
      ),
    );
    _license.onChanged = previous;
  }

  Widget _benefitRow(IconData icon, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Brand.accent1),
          const SizedBox(width: 8),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 13))),
        ],
      ),
    );
  }

  Future<void> _showQuotaReachedDialog() async {
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t.quotaReachedTitle),
        content: Text(t.quotaReachedBody(LicenseConfig.freeDailyMax)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(t.exportCancel),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(context).pop();
              _showProDialog();
            },
            child: Text(t.goPro),
          ),
        ],
      ),
    );
  }

  Future<void> _showPngProOnlyDialog() async {
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t.pngProOnlyTitle),
        content: Text(t.pngProOnlyBody),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(t.exportCancel),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(context).pop();
              _showProDialog();
            },
            child: Text(t.goPro),
          ),
        ],
      ),
    );
  }

  Widget _buildPreview() {
    return Column(
      children: [
        Expanded(
          child: Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
              borderRadius: BorderRadius.circular(16),
            ),
            clipBehavior: Clip.antiAlias,
            child: Stack(
              alignment: Alignment.center,
              children: [
                _buildPreviewContent(),
                if (_busy)
                  const Positioned(
                    top: 12,
                    right: 12,
                    child: SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2.4),
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        if (_error != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(_error!, style: const TextStyle(color: Colors.red)),
          ),
        if (_sourceFile != null)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SegmentedButton<bool>(
                segments: [
                  ButtonSegment(
                      value: false, label: Text(t.before), icon: const Icon(Icons.image_outlined)),
                  ButtonSegment(
                      value: true, label: Text(t.after), icon: const Icon(Icons.auto_awesome)),
                ],
                selected: {_showAfter},
                onSelectionChanged: (s) => setState(() => _showAfter = s.first),
              ),
              const SizedBox(width: 12),
              FilledButton.tonalIcon(
                onPressed: _svg == null ? null : _showExportDialog,
                icon: const Icon(Icons.ios_share, size: 18),
                label: Text(t.exportTitle),
              ),
            ],
          ),
        if (_sourceFile != null && _licenseLoaded && !_license.isPro())
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(
              t.remainingToday(_usage.remaining(), LicenseConfig.freeDailyMax),
              style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurfaceVariant),
            ),
          ),
      ],
    );
  }

  Widget _buildPreviewContent() {
    if (_sourceFile == null) {
      return Center(
        child: Text(t.noImage, style: const TextStyle(color: Colors.grey)),
      );
    }
    if (_showAfter && _svg != null) {
      return _CheckerBackground(
        child: SvgPicture.string(_svg!, fit: BoxFit.contain),
      );
    }
    return _CheckerBackground(
      child: Image.file(_sourceFile!, fit: BoxFit.contain),
    );
  }

  Widget _buildControlsPanel() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_sourceFile == null)
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: Brand.gradient,
              borderRadius: BorderRadius.circular(10),
            ),
            child: FilledButton.icon(
              onPressed: _pickImage,
              icon: const Icon(Icons.image_outlined),
              label: Text(t.pickImage),
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(44),
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
              ),
            ),
          )
        else
          Row(
            children: [
              Expanded(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: Brand.gradient,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: FilledButton.icon(
                    onPressed: _busy ? null : () => _scheduleVectorize(immediate: true),
                    icon: _busy
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.play_arrow),
                    label: Text(
                      _busy
                          ? (t.lang == AppLang.fr
                              ? 'Traitement en cours...'
                              : 'Processing...')
                          : (t.lang == AppLang.fr
                              ? 'Lancer la vectorisation'
                              : 'Start vectorization'),
                    ),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(44),
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      disabledBackgroundColor: Colors.transparent,
                      disabledForegroundColor: Colors.white70,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filledTonal(
                onPressed: _busy ? null : _pickImage,
                icon: const Icon(Icons.image_search),
                tooltip: t.pickImage,
              ),
            ],
          ),
        const SizedBox(height: 20),
        Text(t.preset, style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 8),
        _presetCard(t.presetFlatTitle, t.presetFlatDesc, _Preset.flat),
        _presetCard(t.presetDetailedTitle, t.presetDetailedDesc, _Preset.detailed),
        _presetCard(t.presetBwTitle, t.presetBwDesc, _Preset.bw),
        const SizedBox(height: 8),
        _section(
          title: t.settings,
          icon: Icons.tune,
          initiallyExpanded: true,
          children: [
            _slider(
              t.colorPrecision,
              _settings.colorPrecision,
              1,
              8,
              (v) => _update(() => _settings.colorPrecision = v),
              help: t.colorPrecisionHelp,
            ),
            _slider(
              t.filterSpeckle,
              _settings.filterSpeckle,
              0,
              20,
              (v) => _update(() => _settings.filterSpeckle = v),
              help: t.filterSpeckleHelp,
            ),
            _slider(
              t.layerDifference,
              _settings.layerDifference,
              0,
              48,
              (v) => _update(() => _settings.layerDifference = v),
              help: t.layerDifferenceHelp,
            ),
            _slider(
              t.cornerThreshold,
              _settings.cornerThreshold,
              0,
              180,
              (v) => _update(() => _settings.cornerThreshold = v),
              help: t.cornerThresholdHelp,
            ),
          ],
        ),
        _section(
          title: t.colors,
          icon: Icons.palette_outlined,
          children: [
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              dense: true,
              title: Text(t.mergeColors),
              subtitle: Text(t.mergeColorsHelp, style: const TextStyle(fontSize: 11)),
              value: _settings.mergeColors,
              onChanged: (v) => _update(() => _settings.mergeColors = v, immediate: true),
            ),
            if (_settings.mergeColors)
              _slider(
                t.mergeThreshold,
                _settings.mergeThreshold,
                0,
                100,
                (v) => _update(() => _settings.mergeThreshold = v),
                help: t.mergeThresholdHelp,
              ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              dense: true,
              title: Text(t.cleanEdges),
              subtitle: Text(t.cleanEdgesHelp, style: const TextStyle(fontSize: 11)),
              value: _settings.cleanEdges,
              onChanged: _settings.mergeColors
                  ? (v) => _update(() => _settings.cleanEdges = v, immediate: true)
                  : null,
            ),
          ],
        ),
        _section(
          title: t.backgroundAndTransparency,
          icon: Icons.layers_outlined,
          children: [
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              dense: true,
              title: Text(t.removeBackground),
              subtitle: Text(t.removeBackgroundHelp, style: const TextStyle(fontSize: 11)),
              value: _settings.removeBackground,
              onChanged: (v) => _update(() => _settings.removeBackground = v, immediate: true),
            ),
            if (_settings.removeBackground)
              _slider(
                t.bgTolerance,
                _settings.bgTolerance,
                0,
                120,
                (v) => _update(() => _settings.bgTolerance = v),
                help: t.bgToleranceHelp,
              ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              dense: true,
              title: Text(t.keepTransparency),
              subtitle: Text(t.keepTransparencyHelp, style: const TextStyle(fontSize: 11)),
              value: _settings.keepTransparency,
              onChanged: (v) => _update(() => _settings.keepTransparency = v, immediate: true),
            ),
          ],
        ),
        _section(
          title: t.touchUp,
          icon: Icons.auto_fix_high_outlined,
          children: [
            _slider(
              t.contrast,
              _settings.contrast,
              -50,
              50,
              (v) => _update(() => _settings.contrast = v),
              help: t.contrastHelp,
            ),
            _slider(
              t.sharpen,
              _settings.sharpen,
              0,
              100,
              (v) => _update(() => _settings.sharpen = v),
              help: t.sharpenHelp,
            ),
          ],
        ),
        _section(
          title: t.aiSection,
          icon: Icons.auto_awesome_outlined,
          children: [
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              dense: true,
              title: Row(
                children: [
                  Expanded(child: Text(t.aiUpscale)),
                  if (!_license.isPro())
                    const Padding(
                      padding: EdgeInsets.only(left: 4),
                      child: Icon(Icons.lock_outline, size: 14),
                    ),
                ],
              ),
              subtitle: Text(t.aiUpscaleHelp, style: const TextStyle(fontSize: 11)),
              value: _settings.aiUpscale,
              onChanged: _onToggleAiUpscale,
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              dense: true,
              title: Row(
                children: [
                  Expanded(child: Text(t.aiDetourage)),
                  if (!AiDetourage.isPublished)
                    Text(t.aiComingSoon,
                        style: TextStyle(fontSize: 10, color: Theme.of(context).colorScheme.onSurfaceVariant))
                  else if (!_license.isPro())
                    const Icon(Icons.lock_outline, size: 14),
                ],
              ),
              subtitle: Text(t.aiDetourageHelp, style: const TextStyle(fontSize: 11)),
              value: _settings.aiDetourage,
              onChanged: AiDetourage.isPublished ? _onToggleAiDetourage : null,
            ),
          ],
        ),
        const SizedBox(height: 12),
      ],
    );
  }

  /// Collapsible settings group — progressive disclosure like the desktop
  /// app's grouped panels, so the panel isn't a wall of sliders by default.
  Widget _section({
    required String title,
    required IconData icon,
    required List<Widget> children,
    bool initiallyExpanded = false,
  }) {
    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: Card(
        margin: const EdgeInsets.only(bottom: 10),
        elevation: 0,
        color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        clipBehavior: Clip.antiAlias,
        child: ExpansionTile(
          initiallyExpanded: initiallyExpanded,
          tilePadding: const EdgeInsets.symmetric(horizontal: 12),
          childrenPadding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
          leading: Icon(icon, size: 19, color: Brand.accent1),
          title: Text(title, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600)),
          children: children,
        ),
      ),
    );
  }

  Widget _presetCard(String title, String desc, _Preset preset) {
    final selected = _preset == preset;
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () {
          setState(() {
            _preset = preset;
            _settings.applyPreset(preset);
          });
        },
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: selected ? Brand.accent1 : scheme.outlineVariant,
              width: selected ? 1.6 : 1,
            ),
            color: selected ? Brand.accent1.withValues(alpha: 0.08) : null,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  if (selected)
                    const Padding(
                      padding: EdgeInsets.only(right: 6),
                      child: Icon(Icons.check_circle, size: 16, color: Brand.accent1),
                    ),
                  Expanded(
                    child: Text(title,
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  ),
                ],
              ),
              const SizedBox(height: 3),
              Text(desc, style: TextStyle(fontSize: 11.5, color: scheme.onSurfaceVariant)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _slider(
    String label,
    double value,
    double min,
    double max,
    ValueChanged<double> onChanged, {
    String? help,
  }) {
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Row(
        children: [
          SizedBox(
            width: 120,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  child: Text(
                    label,
                    style: const TextStyle(fontSize: 12.5),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (help != null)
                  Tooltip(
                    message: help,
                    triggerMode: TooltipTriggerMode.tap,
                    showDuration: const Duration(seconds: 6),
                    margin: const EdgeInsets.symmetric(horizontal: 24),
                    textStyle: const TextStyle(fontSize: 12.5, color: Colors.white),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade800,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Padding(
                      padding: EdgeInsets.only(left: 3),
                      child: Icon(Icons.info_outline, size: 14, color: Colors.grey),
                    ),
                  ),
              ],
            ),
          ),
          Expanded(
            child: SliderTheme(
              data: SliderTheme.of(context).copyWith(
                trackShape: _GradientSliderTrackShape(),
                thumbColor: Brand.accent1,
                overlayColor: Brand.accent1.withValues(alpha: 0.15),
              ),
              child: Slider(
                value: value.clamp(min, max),
                min: min,
                max: max,
                divisions: (max - min).round().clamp(1, 200),
                label: value.round().toString(),
                onChanged: onChanged,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Blocking progress dialog for an on-demand AI model download. Starts the
/// download in `initState` and pops itself with `true`/`false` once it
/// resolves, so the caller only has to await `showDialog`.
class _AiDownloadDialog extends StatefulWidget {
  final String title;
  final String cancelLabel;
  final Future<void> Function({
    required void Function(int done, int total) progress,
    required bool Function() shouldCancel,
  }) download;

  const _AiDownloadDialog({
    required this.title,
    required this.cancelLabel,
    required this.download,
  });

  @override
  State<_AiDownloadDialog> createState() => _AiDownloadDialogState();
}

class _AiDownloadDialogState extends State<_AiDownloadDialog> {
  int _done = 0;
  int _total = 0;
  bool _cancelled = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    widget.download(
      progress: (done, total) {
        if (!mounted) return;
        setState(() {
          _done = done;
          _total = total;
        });
      },
      shouldCancel: () => _cancelled,
    ).then((_) {
      if (mounted) Navigator.of(context).pop(true);
    }).catchError((Object e) {
      if (!mounted) return;
      if (e is AiDownloadCancelled) {
        Navigator.of(context).pop(false);
        return;
      }
      setState(() => _error = '$e');
    });
  }

  @override
  Widget build(BuildContext context) {
    final progress = _total > 0 ? _done / _total : null;
    return AlertDialog(
      title: Text(widget.title),
      content: _error != null
          ? Text(_error!, style: const TextStyle(color: Colors.red))
          : Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                LinearProgressIndicator(value: progress),
                if (_total > 0)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      '${(_done / 1048576).toStringAsFixed(1)} / '
                      '${(_total / 1048576).toStringAsFixed(1)} Mo',
                      style: const TextStyle(fontSize: 11),
                    ),
                  ),
              ],
            ),
      actions: [
        TextButton(
          onPressed: () {
            _cancelled = true;
            Navigator.of(context).pop(false);
          },
          child: Text(widget.cancelLabel),
        ),
      ],
    );
  }
}

/// Checkerboard behind previews so transparency is visible, like the desktop
/// app's canvas.
class _CheckerBackground extends StatelessWidget {
  final Widget child;
  const _CheckerBackground({required this.child});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(color: isDark ? const Color(0xFF20222C) : const Color(0xFFEDEDF3)),
      child: Padding(padding: const EdgeInsets.all(12), child: child),
    );
  }
}

/// Paints the active portion of a [Slider] with the VectorPop brand gradient
/// (violet -> magenta -> cyan), mirroring the desktop app's QSS
/// `QSlider::sub-page` gradient.
class _GradientSliderTrackShape extends RoundedRectSliderTrackShape {
  _GradientSliderTrackShape();

  @override
  void paint(
    PaintingContext context,
    Offset offset, {
    required RenderBox parentBox,
    required SliderThemeData sliderTheme,
    required Animation<double> enableAnimation,
    required Offset thumbCenter,
    Offset? secondaryOffset,
    bool isEnabled = false,
    bool isDiscrete = false,
    required TextDirection textDirection,
    double additionalActiveTrackHeight = 2,
  }) {
    final trackRect = getPreferredRect(
      parentBox: parentBox,
      offset: offset,
      sliderTheme: sliderTheme,
      isEnabled: isEnabled,
      isDiscrete: isDiscrete,
    );

    final inactivePaint = Paint()..color = sliderTheme.inactiveTrackColor ?? Colors.grey;
    final activeRect = Rect.fromLTRB(trackRect.left, trackRect.top, thumbCenter.dx, trackRect.bottom);
    final activeGradientPaint = Paint()
      ..shader = Brand.gradient.createShader(Rect.fromLTRB(
        trackRect.left,
        trackRect.top,
        trackRect.right,
        trackRect.bottom,
      ));

    final canvas = context.canvas;
    canvas.drawRRect(
      RRect.fromRectAndRadius(trackRect, const Radius.circular(3)),
      inactivePaint,
    );
    if (activeRect.width > 0) {
      canvas.save();
      canvas.clipRRect(RRect.fromRectAndRadius(trackRect, const Radius.circular(3)));
      canvas.drawRect(activeRect, activeGradientPaint);
      canvas.restore();
    }
  }
}
