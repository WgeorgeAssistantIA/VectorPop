import 'package:flutter/material.dart';
import '../i18n/strings.dart';
import '../services/analytics_service.dart';

/// Feuille modale de sélection de la langue parmi les 15 langues supportées.
class LanguageSheet extends StatelessWidget {
  final String currentLang;
  final ValueChanged<String> onSelect;

  const LanguageSheet({
    super.key,
    required this.currentLang,
    required this.onSelect,
  });

  /// Affiche le sélecteur de langue dans un BottomSheet modal.
  static void show(
    BuildContext context, {
    required String currentLang,
    ValueChanged<String>? onSelect,
    ValueChanged<String>? onLanguageSelected,
    String source = 'menu',
  }) {
    final callback = onSelect ?? onLanguageSelected ?? (_) {};
    var chosen = false;
    AnalyticsService.instance.trackLanguagePickerOpened(
      source: source,
      current: currentLang,
    );
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => LanguageSheet(
        currentLang: currentLang,
        onSelect: (code) {
          chosen = code != currentLang;
          callback(code);
        },
      ),
    ).whenComplete(() {
      if (!chosen) {
        AnalyticsService.instance.trackLanguagePickerDismissed(
          source: source,
          current: currentLang,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.75,
      ),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1834) : theme.cardColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? Colors.white24 : Colors.black12,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),
          // Titre
          Text(
            tr(currentLang, 'lang_picker_title'),
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 12),
          // Liste défilable des 15 langues
          Flexible(
            child: ListView.separated(
              shrinkWrap: true,
              physics: const BouncingScrollPhysics(),
              itemCount: kLanguages.length,
              separatorBuilder: (_, _) => Divider(
                height: 1,
                color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05),
              ),
              itemBuilder: (context, index) {
                final lang = kLanguages[index];
                final isSelected = lang.code == currentLang;

                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  onTap: () {
                    onSelect(lang.code);
                    Navigator.pop(context);
                  },
                  leading: Text(
                    lang.flag,
                    style: const TextStyle(fontSize: 26),
                  ),
                  title: Text(
                    lang.name,
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      color: isSelected
                          ? theme.colorScheme.primary
                          : (isDark ? Colors.white : Colors.black87),
                    ),
                  ),
                  trailing: isSelected
                      ? Icon(
                          Icons.check_circle_rounded,
                          color: theme.colorScheme.primary,
                          size: 22,
                        )
                      : null,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
