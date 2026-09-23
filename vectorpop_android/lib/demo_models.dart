import 'package:flutter/material.dart';

/// Type de préréglage associé à un modèle démo.
enum DemoPresetType { flat, detailed, bw }

/// Modèle d'exemple interactif prêt à l'emploi.
class DemoModel {
  final String id;
  final String titleFr;
  final String titleEn;
  final String descFr;
  final String descEn;
  final String assetPath;
  final IconData icon;
  final DemoPresetType preset;
  final bool removeBackground;
  final double bgTolerance;
  final double colorPrecision;
  final double? cornerThreshold;
  final bool? mergeColors;
  final int? modePolygon;
  final bool? cleanEdges;
  final int? filterSpeckle;

  const DemoModel({
    required this.id,
    required this.titleFr,
    required this.titleEn,
    required this.descFr,
    required this.descEn,
    required this.assetPath,
    required this.icon,
    required this.preset,
    this.removeBackground = false,
    this.bgTolerance = 20,
    this.colorPrecision = 5,
    this.cornerThreshold,
    this.mergeColors,
    this.modePolygon,
    this.cleanEdges,
    this.filterSpeckle,
  });

  String title(bool isFr) => isFr ? titleFr : titleEn;
  String desc(bool isFr) => isFr ? descFr : descEn;
}

/// Pack des 4 modèles démo interactifs pour supprimer le Cold Start.
final List<DemoModel> kDemoModels = [
  const DemoModel(
    id: 'logo',
    titleFr: 'Logo & Badge',
    titleEn: 'Logo & Badge',
    descFr: 'Aplats nets, fond blanc supprimé',
    descEn: 'Clean flats, white background removed',
    assetPath: 'assets/samples/sample_logo.png',
    icon: Icons.shield_outlined,
    preset: DemoPresetType.flat,
    removeBackground: false,
    bgTolerance: 25,
    colorPrecision: 4,
    cornerThreshold: 20,
    mergeColors: true,
    modePolygon: 1,
    filterSpeckle: 0,
    cleanEdges: false,
  ),
  const DemoModel(
    id: 'mascot',
    titleFr: 'Mascotte & Sticker',
    titleEn: 'Mascot & Sticker',
    descFr: 'Richesse des calques et couleurs vives',
    descEn: 'Rich color layers & bright shades',
    assetPath: 'assets/samples/sample_mascot.png',
    icon: Icons.rocket_launch_outlined,
    preset: DemoPresetType.detailed,
    removeBackground: false,
    colorPrecision: 7,
  ),
  const DemoModel(
    id: 'sketch',
    titleFr: 'Croquis & Signature',
    titleEn: 'Sketch & Signature',
    descFr: 'Courbes pures en noir & blanc',
    descEn: 'Pure black & white vector curves',
    assetPath: 'assets/samples/sample_sketch.png',
    icon: Icons.draw_outlined,
    preset: DemoPresetType.bw,
    removeBackground: false,
  ),
  const DemoModel(
    id: 'icon',
    titleFr: 'Pictogramme / Icône',
    titleEn: 'App Icon / Glyph',
    descFr: 'Lissage parfait des angles et contours',
    descEn: 'Smooth corners and crisp contours',
    assetPath: 'assets/samples/sample_icon.png',
    icon: Icons.bolt_rounded,
    preset: DemoPresetType.flat,
    removeBackground: false,
    colorPrecision: 5,
  ),
];
