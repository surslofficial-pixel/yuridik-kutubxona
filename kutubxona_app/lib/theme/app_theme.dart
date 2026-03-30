import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

class AppTheme {
  // Brand colors
  static const Color primaryDark = Color(0xFF1E3A8A);
  static const Color primaryBlue = Color(0xFF3B82F6);
  static const Color primaryLight = Color(0xFF60A5FA);
  static const Color accentGreen = Color(0xFF059669);
  static const Color accentEmerald = Color(0xFF10B981);
  static const Color surfaceLight = Color(0xFFF8FAFC);
  static const Color surfaceCard = Colors.white;
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textTertiary = Color(0xFF94A3B8);
  static const Color borderLight = Color(0xFFE2E8F0);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: surfaceLight,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryDark,
        primary: primaryDark,
        secondary: primaryBlue,
        surface: surfaceLight,
        brightness: Brightness.light,
      ),
      textTheme: GoogleFonts.interTextTheme(),
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 1,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: primaryDark,
        ),
        iconTheme: const IconThemeData(color: primaryDark),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: borderLight, width: 1),
        ),
        color: surfaceCard,
        surfaceTintColor: Colors.transparent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryDark,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryDark,
          side: const BorderSide(color: borderLight),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primaryBlue, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: primaryDark,
        unselectedItemColor: textTertiary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w500,
        ),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }

  // Category color mapping helper
  static Color getCategoryColor(String slug) {
    final colors = {
      'biznes-huquqi': const Color(0xFF3B82F6),
      'davlat-va-huquq-nazariyasi': const Color(0xFF6366F1),
      'ekologiya-huquqi': const Color(0xFF22C55E),
      'fuqarolik-huquqi': const Color(0xFFF97316),
      'fuqarolik-protsessual-huquqi': const Color(0xFFF59E0B),
      'jinoyat-huquqi': const Color(0xFFEF4444),
      'jinoyat-protsessual-huquqi': const Color(0xFFF43F5E),
      'konstitutsiyaviy-huquq': const Color(0xFF06B6D4),
      'kriminalistika': const Color(0xFF64748B),
      'mehnat-huquqi': const Color(0xFF14B8A6),
      'yuridik-xizmat': const Color(0xFFA855F7),
      'umumtalim-fanlari': const Color(0xFF3B82F6),
      'badiiy-adabiyot': const Color(0xFFEC4899),
      'audio-kitoblar': const Color(0xFF10B981),
    };
    return colors[slug] ?? const Color(0xFF3B82F6);
  }

  static Color getCategoryBgColor(String slug) {
    return getCategoryColor(slug).withValues(alpha: 0.1);
  }

  // AI Topic gradient colors
  static List<Color> getAiTopicGradient(String colorStr) {
    final gradients = {
      'from-indigo-500 to-blue-500': [
        const Color(0xFF6366F1),
        const Color(0xFF3B82F6),
      ],
      'from-purple-500 to-pink-500': [
        const Color(0xFFA855F7),
        const Color(0xFFEC4899),
      ],
      'from-rose-500 to-orange-500': [
        const Color(0xFFF43F5E),
        const Color(0xFFF97316),
      ],
      'from-amber-500 to-yellow-500': [
        const Color(0xFFF59E0B),
        const Color(0xFFEAB308),
      ],
      'from-emerald-500 to-teal-500': [
        const Color(0xFF10B981),
        const Color(0xFF14B8A6),
      ],
      'from-cyan-500 to-blue-600': [
        const Color(0xFF06B6D4),
        const Color(0xFF2563EB),
      ],
    };
    return gradients[colorStr] ??
        [const Color(0xFF6366F1), const Color(0xFF3B82F6)];
  }

  // Icon mapping
  static IconData getCategoryIcon(String iconName) {
    final icons = {
      'Briefcase': LucideIcons.briefcase,
      'Landmark': LucideIcons.landmark,
      'Leaf': LucideIcons.leaf,
      'Users': LucideIcons.users,
      'FileText': LucideIcons.fileText,
      'Shield': LucideIcons.shield,
      'Gavel': LucideIcons.gavel,
      'Scale': LucideIcons.scale,
      'FileSearch': LucideIcons.fileSearch,
      'BookOpen': LucideIcons.bookOpen,
      'Settings': LucideIcons.settings,
      'LayoutDashboard': LucideIcons.layoutDashboard,
      'GraduationCap': LucideIcons.graduationCap,
      'Library': LucideIcons.library,
      'Fingerprint': LucideIcons.fingerprint,
      'Building2': LucideIcons.building2,
      'BrainCircuit': LucideIcons.brainCircuit,
      'ShieldAlert': LucideIcons.shieldAlert,
      'Sparkles': LucideIcons.sparkles,
      'Database': LucideIcons.database,
      'Lock': LucideIcons.lock,
      'Headphones': LucideIcons.headphones,
      'Globe': LucideIcons.globe,
    };
    return icons[iconName] ?? LucideIcons.bookOpen;
  }
}
