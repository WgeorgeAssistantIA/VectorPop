
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'i18n.dart';
import 'services/analytics_service.dart';

/// Écran d'onboarding immersif en 4 étapes avec profiling métier pour VectorPop.
class OnboardingScreen extends StatefulWidget {
  final AppLang lang;
  final VoidCallback onFinish;

  const OnboardingScreen({
    super.key,
    required this.lang,
    required this.onFinish,
  });

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  String _selectedProfile = 'logo';

  static const Color _accentViolet = Color(0xFF7A52F5);
  static const Color _accentMagenta = Color(0xFFC92BC0);
  static const Color _accentCyan = Color(0xFF3FD7FB);

  static const LinearGradient _brandGradient = LinearGradient(
    colors: [_accentViolet, _accentMagenta, _accentCyan],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  L10n get t => L10n(widget.lang);

  @override
  void initState() {
    super.initState();
    AnalyticsService.instance.trackOnboardingStarted();
    AnalyticsService.instance.trackOnboardingStep(0, 'welcome');
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onPageChanged(int index) {
    setState(() => _currentPage = index);
    final names = ['welcome', 'how_it_works', 'profiling', 'privacy_quota'];
    AnalyticsService.instance.trackOnboardingStep(index, names[index]);
  }

  Future<void> _completeOnboarding() async {
    AnalyticsService.instance.trackOnboardingCompleted(
      lang: widget.lang == AppLang.fr ? 'fr' : 'en',
      usecase: _selectedProfile,
    );
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('has_seen_onboarding', true);
    await prefs.setString('selected_profile', _selectedProfile);
    await prefs.setString('selected_sample_key', _selectedProfile);

    widget.onFinish();
  }

  void _skipOnboarding() {
    AnalyticsService.instance.trackOnboardingSkipped(_currentPage + 1);
    _completeOnboarding();
  }

  void _nextPage() {
    if (_currentPage < 3) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeInOutCubic,
      );
    } else {
      _completeOnboarding();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF130F26) : const Color(0xFFF7F8FD);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar: Skip Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: Image.asset('assets/icon/icon.png'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'VectorPop',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
                  if (_currentPage < 3)
                    TextButton(
                      onPressed: _skipOnboarding,
                      child: Text(
                        t.onboardingSkip,
                        style: TextStyle(
                          color: isDark ? Colors.white60 : Colors.black54,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    )
                  else
                    const SizedBox(height: 48),
                ],
              ),
            ),

            // Page Views
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: _onPageChanged,
                children: [
                  _buildWelcomePage(isDark),
                  _buildHowItWorksPage(isDark),
                  _buildProfilingPage(isDark),
                  _buildPrivacyQuotaPage(isDark),
                ],
              ),
            ),

            // Bottom Navigation & Indicator
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 12, 24, 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Indicators
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(4, (index) {
                      final isActive = index == _currentPage;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: isActive ? 26 : 7,
                        height: 7,
                        decoration: BoxDecoration(
                          color: isActive
                              ? _accentViolet
                              : (isDark ? Colors.white24 : Colors.black12),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 20),

                  // Action Button
                  Container(
                    width: double.infinity,
                    height: 52,
                    decoration: BoxDecoration(
                      gradient: _brandGradient,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: _accentMagenta.withValues(alpha: 0.35),
                          blurRadius: 14,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: _nextPage,
                        borderRadius: BorderRadius.circular(16),
                        child: Center(
                          child: Text(
                            _currentPage == 3
                                ? t.onboardingGetStarted
                                : t.onboardingNext,
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
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Écran 1 : Bienvenue & Promesse ─────────────────────────────────────────

  Widget _buildWelcomePage(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Column(
        children: [
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: _brandGradient,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: _accentViolet.withValues(alpha: 0.35),
                  blurRadius: 30,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: const Icon(
              Icons.auto_awesome_rounded,
              color: Colors.white,
              size: 40,
            ),
          ),
          const SizedBox(height: 28),
          Text(
            t.onboardingWelcomeTitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 25,
              fontWeight: FontWeight.w800,
              height: 1.25,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            t.onboardingWelcomeDesc,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14.5,
              color: isDark ? Colors.white70 : Colors.black87,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 26),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            alignment: WrapAlignment.center,
            children: [
              _featureBadge(Icons.check_circle_outline, 'SVG W3C Standard', isDark),
              _featureBadge(Icons.all_inclusive, 'Zoom Infini', isDark),
              _featureBadge(Icons.auto_awesome, 'Finitions IA Locales', isDark),
            ],
          ),
        ],
      ),
    );
  }

  Widget _featureBadge(IconData icon, String label, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withValues(alpha: 0.06) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.12) : Colors.black12,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: _accentViolet),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  // ─── Écran 2 : Démonstration Bitmap vs SVG ──────────────────────────────────

  Widget _buildHowItWorksPage(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Column(
        children: [
          const SizedBox(height: 10),
          Text(
            t.onboardingHowTitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              height: 1.25,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            t.onboardingHowDesc,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: isDark ? Colors.white70 : Colors.black87,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),

          // Example 1: Logo
          _buildComparisonRow(
            isDark: isDark,
            leftWidget: Transform.scale(
              scale: 12.0,
              child: Image.asset(
                'assets/samples/sample_logo.png',
                fit: BoxFit.contain,
                filterQuality: FilterQuality.none, // Pixelated
              ),
            ),
            rightWidget: Transform.scale(
              scale: 12.0,
              child: SvgPicture.asset(
                'assets/samples/sample_logo.svg',
                fit: BoxFit.contain,
              ),
            ),
          ),
          const SizedBox(height: 24),
          
          // Example 2: Pop colors (Brand Turquoise & Violet)
          _buildComparisonRow(
            isDark: isDark,
            leftWidget: CustomPaint(
              painter: PixelatedDiamondPainter(),
              size: const Size(double.infinity, double.infinity),
            ),
            rightWidget: Stack(
              children: [
                Row(
                  children: [
                    Expanded(child: Container(color: const Color(0xFF3FD7FB))), // Cyan / Turquoise
                    Expanded(child: Container(color: const Color(0xFF7A52F5))), // Violet
                  ],
                ),
                Center(
                  child: Transform.rotate(
                    angle: 0.785398, // 45 degrees
                    child: Container(width: 85, height: 85, color: Colors.white), 
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComparisonRow({
    required bool isDark,
    required Widget leftWidget,
    required Widget rightWidget,
  }) {
    return Row(
      children: [
        // Côté Bitmap
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1834) : Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: Colors.redAccent.withValues(alpha: 0.35),
              ),
            ),
            child: Column(
              children: [
                AspectRatio(
                  aspectRatio: 1.0,
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.04),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: leftWidget,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'PNG / JPEG',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 4),
                Text(
                  t.onboardingBitmapLabel,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 11, color: Colors.redAccent),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 14),

        // Côté Vectoriel
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1834) : Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: const Color(0xFF10B981).withValues(alpha: 0.45),
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF10B981).withValues(alpha: 0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                AspectRatio(
                  aspectRatio: 1.0,
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.04),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: rightWidget,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Vectoriel SVG',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 4),
                Text(
                  t.onboardingVectorLabel,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 11, color: Color(0xFF10B981)),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ─── Écran 3 : Profiling Métier ─────────────────────────────────────────────

  Widget _buildProfilingPage(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Column(
        children: [
          const SizedBox(height: 6),
          Text(
            t.onboardingProfileTitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 23,
              fontWeight: FontWeight.w800,
              height: 1.25,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            t.onboardingProfileDesc,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13.5,
              color: isDark ? Colors.white70 : Colors.black87,
            ),
          ),
          const SizedBox(height: 20),

          _profileCard(
            id: 'logo',
            title: t.profileLogoTitle,
            desc: t.profileLogoDesc,
            icon: Icons.shield_outlined,
            isDark: isDark,
          ),
          const SizedBox(height: 10),
          _profileCard(
            id: 'mascot',
            title: t.profileMascotTitle,
            desc: t.profileMascotDesc,
            icon: Icons.rocket_launch_outlined,
            isDark: isDark,
          ),
          const SizedBox(height: 10),
          _profileCard(
            id: 'sketch',
            title: t.profileSketchTitle,
            desc: t.profileSketchDesc,
            icon: Icons.draw_outlined,
            isDark: isDark,
          ),
          const SizedBox(height: 10),
          _profileCard(
            id: 'print',
            title: t.profilePrintTitle,
            desc: t.profilePrintDesc,
            icon: Icons.palette_outlined,
            isDark: isDark,
          ),
        ],
      ),
    );
  }

  Widget _profileCard({
    required String id,
    required String title,
    required String desc,
    required IconData icon,
    required bool isDark,
  }) {
    final isSelected = _selectedProfile == id;
    final cardBg = isDark ? const Color(0xFF1D1733) : Colors.white;

    return InkWell(
      onTap: () {
        setState(() => _selectedProfile = id);
        AnalyticsService.instance.trackOnboardingUsecaseSelected(id);
      },
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? _accentViolet
                : (isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black12),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: _accentViolet.withValues(alpha: 0.22),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isSelected
                    ? _accentViolet.withValues(alpha: 0.18)
                    : (isDark ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.04)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: isSelected ? _accentViolet : (isDark ? Colors.white70 : Colors.black87),
                size: 22,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    desc,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white54 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle_rounded, color: _accentViolet, size: 22)
            else
              Icon(
                Icons.radio_button_unchecked_rounded,
                color: isDark ? Colors.white24 : Colors.black26,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }

  // ─── Écran 4 : Confidentialité & Quotas ─────────────────────────────────────

  Widget _buildPrivacyQuotaPage(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Column(
        children: [
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withValues(alpha: 0.12),
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFF10B981).withValues(alpha: 0.4),
              ),
            ),
            child: const Icon(
              Icons.lock_outline_rounded,
              color: Color(0xFF10B981),
              size: 48,
            ),
          ),
          const SizedBox(height: 22),
          Text(
            t.onboardingPrivacyTitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 23,
              fontWeight: FontWeight.w800,
              height: 1.25,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            t.onboardingPrivacyDesc,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: isDark ? Colors.white70 : Colors.black87,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 24),

          // Encart Quota
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1834) : Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: _accentMagenta.withValues(alpha: 0.35),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _accentMagenta.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.card_giftcard_rounded, color: _accentMagenta, size: 28),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        t.onboardingQuotaTitle,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        t.onboardingQuotaDesc,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.white60 : Colors.black54,
                          height: 1.35,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class PixelatedDiamondPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    const int gridSize = 16;
    final double cellSize = size.width / gridSize;
    final Paint paint = Paint();
    
    for (int y = 0; y < gridSize; y++) {
      for (int x = 0; x < gridSize; x++) {
        // Base background (cyan left, violet right)
        Color color = x < gridSize / 2 ? const Color(0xFF3FD7FB) : const Color(0xFF7A52F5);
        
        // White diamond in the center
        double cx = gridSize / 2 - 0.5;
        double cy = gridSize / 2 - 0.5;
        if ((x - cx).abs() + (y - cy).abs() <= 4) {
          color = Colors.white;
        }
        
        paint.color = color;
        canvas.drawRect(Rect.fromLTWH(x * cellSize, y * cellSize, cellSize, cellSize), paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
