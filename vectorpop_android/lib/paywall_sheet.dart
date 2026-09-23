import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'i18n.dart';
import 'license.dart';
import 'services/analytics_service.dart';

/// BottomSheet de paywall premium haute conversion pour VectorPop Android.
class PaywallSheet extends StatelessWidget {
  final L10n t;
  final LicenseManager license;
  final int totalExports;
  final VoidCallback onBuy;
  final VoidCallback onRestore;

  const PaywallSheet({
    super.key,
    required this.t,
    required this.license,
    required this.totalExports,
    required this.onBuy,
    required this.onRestore,
  });

  static const Color _accentViolet = Color(0xFF7A52F5);
  static const Color _accentMagenta = Color(0xFFC92BC0);
  static const Color _accentCyan = Color(0xFF3FD7FB);

  static const LinearGradient _brandGradient = LinearGradient(
    colors: [_accentViolet, _accentMagenta, _accentCyan],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF130F26) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1A1A1A);
    final subtitleColor = isDark ? Colors.white70 : Colors.black54;

    final isTablet = MediaQuery.of(context).size.width > 600;

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: isTablet 
            ? BorderRadius.circular(28) 
            : const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.12) : Colors.black12,
        ),
      ),
      padding: EdgeInsets.fromLTRB(
        24,
        14,
        24,
        MediaQuery.of(context).viewInsets.bottom + MediaQuery.of(context).padding.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // En-tête : Barre de saisie (mobile) + Bouton Fermer
            Stack(
              alignment: Alignment.center,
              children: [
                // Barre de saisie (handle)
                Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : Colors.black26,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                // Bouton Fermer
                Align(
                  alignment: Alignment.centerRight,
                  child: IconButton(
                    icon: const Icon(Icons.close_rounded),
                    iconSize: 20,
                    color: isDark ? Colors.white54 : Colors.black54,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Bannière ROI cumulé (si l'utilisateur a déjà vectorisé)
            if (totalExports > 0) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: const Color(0xFF10B981).withValues(alpha: 0.40),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.bolt_rounded, color: Color(0xFF10B981), size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        t.paywallRoiBanner(totalExports),
                        style: const TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          height: 1.3,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Badge Accès à vie
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: _accentMagenta.withValues(alpha: 0.16),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: _accentMagenta.withValues(alpha: 0.45),
                ),
              ),
              child: Text(
                t.paywallLifetimeBadge,
                style: const TextStyle(
                  color: _accentMagenta,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.6,
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Icône Médaillon Dégradé
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                gradient: _brandGradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.workspace_premium_rounded,
                color: Colors.white,
                size: 34,
              ),
            ),
            const SizedBox(height: 12),

            // Titre & Sous-titre
            Text(
              totalExports >= 3 ? t.paywallPostQuotaTitle : t.paywallTitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: textColor,
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              totalExports >= 3 ? t.paywallPostQuotaSubtitle : t.paywallSubtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: subtitleColor,
                fontSize: 13.5,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 20),

            // 4 Avantages Pro
            _benefitRow(
              icon: Icons.all_inclusive_rounded,
              text: t.paywallFeatureSvg,
              isDark: isDark,
            ),
            const SizedBox(height: 10),
            _benefitRow(
              icon: Icons.photo_size_select_large_rounded,
              text: t.paywallFeaturePng,
              isDark: isDark,
            ),
            const SizedBox(height: 10),
            _benefitRow(
              icon: Icons.auto_awesome_rounded,
              text: t.paywallFeatureAi,
              isDark: isDark,
            ),
            const SizedBox(height: 10),
            _benefitRow(
              icon: Icons.verified_user_rounded,
              text: t.paywallFeatureLicense,
              isDark: isDark,
            ),
            const SizedBox(height: 22),

            // Bouton Acheter Principal
            Container(
              width: double.infinity,
              height: 52,
              decoration: BoxDecoration(
                gradient: _brandGradient,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: _accentMagenta.withValues(alpha: 0.4),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: (!license.canBuy || license.purchasePending) ? null : onBuy,
                  borderRadius: BorderRadius.circular(16),
                  child: Center(
                    child: license.purchasePending
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            license.canBuy
                                ? t.paywallBtnBuy(license.formattedPrice)
                                : t.buyProUnavailable,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),
              ),
            ),

            if (license.lastError != null) ...[
              const SizedBox(height: 8),
              Text(
                license.lastError!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.redAccent, fontSize: 12),
              ),
            ],

            const SizedBox(height: 6),

            // Restaurer les achats
            TextButton(
              onPressed: onRestore,
              child: Text(
                t.paywallBtnRestore,
                style: TextStyle(
                  color: isDark ? Colors.white54 : Colors.black54,
                  fontSize: 13,
                ),
              ),
            ),

            // Micro-copy réassurance Google Play
            Text(
              t.paywallReassurance,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: isDark ? Colors.white38 : Colors.black38,
                fontSize: 11,
              ),
            ),
            const SizedBox(height: 14),

            // Passerelle Cross-Sell Desktop
            InkWell(
              onTap: () {
                AnalyticsService.instance.trackDesktopLinkOpened('paywall_footer');
                launchUrl(
                  Uri.parse(
                    'https://www.vectorpop.fr/?utm_source=android&utm_medium=paywall_footer&utm_campaign=desktop_bridge',
                  ),
                  mode: LaunchMode.externalApplication,
                );
              },
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withValues(alpha: 0.04) : Colors.black.withValues(alpha: 0.03),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: _accentCyan.withValues(alpha: 0.35),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.laptop_chromebook_rounded, size: 16, color: _accentCyan),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        '${t.paywallDesktopHint} vectorpop.fr ↗',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isDark ? Colors.white70 : Colors.black87,
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _benefitRow({
    required IconData icon,
    required String text,
    required bool isDark,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: _accentViolet.withValues(alpha: 0.14),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 18, color: _accentViolet),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              color: isDark ? Colors.white : Colors.black87,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }
}
