import 'package:flutter/material.dart';

import 'i18n.dart';
import 'services/analytics_service.dart';

/// Sheet de célébration affichée lors du 1er export réussi (*Aha! Moment*).
/// Félicite l'utilisateur, ancre la valeur perçue du tracé vectoriel local,
/// et présente doucement l'offre Pro à vie sans bloquer l'usage gratuit.
class ExportCelebrationSheet extends StatefulWidget {
  final AppLang lang;
  final VoidCallback onDiscoverPro;

  final bool isDialog;

  const ExportCelebrationSheet({
    super.key,
    required this.lang,
    required this.onDiscoverPro,
    this.isDialog = false,
  });

  static Future<void> show({
    required BuildContext context,
    required AppLang lang,
    required VoidCallback onDiscoverPro,
  }) {
    AnalyticsService.instance.trackFirstExportCelebrated();
    final isTablet = MediaQuery.of(context).size.width > 600;
    if (isTablet) {
      return showDialog<void>(
        context: context,
        builder: (ctx) => Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(28),
              child: ExportCelebrationSheet(
                lang: lang,
                onDiscoverPro: onDiscoverPro,
                isDialog: true,
              ),
            ),
          ),
        ),
      );
    }
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => ExportCelebrationSheet(
        lang: lang,
        onDiscoverPro: onDiscoverPro,
      ),
    );
  }

  @override
  State<ExportCelebrationSheet> createState() => _ExportCelebrationSheetState();
}

class _ExportCelebrationSheetState extends State<ExportCelebrationSheet> {
  static const _accentViolet = Color(0xFF7A52F5);
  static const _accentMagenta = Color(0xFFC92BC0);
  static const _accentCyan = Color(0xFF3FD7FB);

  static const _gradient = LinearGradient(
    colors: [_accentViolet, _accentMagenta, _accentCyan],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final t = L10n(widget.lang);

    final bg = isDark ? const Color(0xFF1E1834) : Colors.white;
    final cardBg = isDark
        ? Colors.white.withValues(alpha: 0.05)
        : Colors.black.withValues(alpha: 0.03);

    return Container(
      decoration: BoxDecoration(
        color: bg,
        borderRadius: widget.isDialog
            ? BorderRadius.circular(28)
            : const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 24,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (!widget.isDialog) ...[
                // Poignée de glissement
                Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : Colors.black26,
                    borderRadius: BorderRadius.circular(2.5),
                  ),
                ),
                const SizedBox(height: 20),
              ] else
                const SizedBox(height: 8),

              // Médaillon festif
              Container(
                width: 68,
                height: 68,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [
                      _accentMagenta.withValues(alpha: 0.25),
                      _accentViolet.withValues(alpha: 0.20),
                    ],
                  ),
                ),
                child: const Center(
                  child: Icon(
                    Icons.celebration_rounded,
                    size: 36,
                    color: _accentMagenta,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Titre élogieux
              Text(
                t.celebrationTitle,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.3,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),

              // Sous-titre
              Text(
                t.celebrationSubtitle,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: isDark ? Colors.white70 : Colors.black54,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),

              // Piliers de valeur
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
                  ),
                ),
                child: Column(
                  children: [
                    _buildPillarRow(
                      icon: Icons.security_rounded,
                      color: _accentCyan,
                      title: t.celebrationPillarLocal,
                      desc: t.celebrationPillarLocalDesc,
                      isDark: isDark,
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 10),
                      child: Divider(height: 1),
                    ),
                    _buildPillarRow(
                      icon: Icons.all_inclusive_rounded,
                      color: _accentMagenta,
                      title: t.celebrationPillarVector,
                      desc: t.celebrationPillarVectorDesc,
                      isDark: isDark,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Carte teaser Pro
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      _accentViolet.withValues(alpha: 0.12),
                      _accentMagenta.withValues(alpha: 0.10),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: _accentMagenta.withValues(alpha: 0.3),
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      t.celebrationProPromo,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: _gradient,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: _accentMagenta.withValues(alpha: 0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: FilledButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          AnalyticsService.instance.trackCelebrationProClicked();
                          widget.onDiscoverPro();
                        },
                        icon: const Icon(Icons.workspace_premium_rounded, size: 20),
                        label: Text(
                          t.celebrationDiscoverPro,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        style: FilledButton.styleFrom(
                          minimumSize: const Size.fromHeight(46),
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),

              // Bouton continuer gratuitement
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text(
                  t.celebrationContinueFree,
                  style: TextStyle(
                    color: isDark ? Colors.white60 : Colors.black54,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPillarRow({
    required IconData icon,
    required Color color,
    required String title,
    required String desc,
    required bool isDark,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? Colors.white60 : Colors.black54,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
