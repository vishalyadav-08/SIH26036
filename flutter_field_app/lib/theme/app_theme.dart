import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // MapanSetu Design System Colors
  static const Color surface = Color(0xFFF8F9FA);
  static const Color surfaceDim = Color(0xFFDBD9E1);
  static const Color surfaceBright = Color(0xFFFBF8FF);
  
  static const Color surfaceContainerLowest = Color(0xFFFFFFFF);
  static const Color surfaceContainerLow = Color(0xFFF5F2FB);
  static const Color surfaceContainer = Color(0xFFEEEEEF);
  static const Color surfaceContainerHigh = Color(0xFFEAE7EF);
  static const Color surfaceContainerHighest = Color(0xFFE4E1EA);

  static const Color onSurface = Color(0xFF1B1B21);
  static const Color onSurfaceVariant = Color(0xFF454652);
  static const Color inverseSurface = Color(0xFF303036);
  static const Color inverseOnSurface = Color(0xFFF2EFF8);

  static const Color outline = Color(0xFF767683);
  static const Color outlineVariant = Color(0xFFC6C5D4);
  static const Color surfaceTint = Color(0xFF4C56AF);

  static const Color primary = Color(0xFF000666);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color primaryContainer = Color(0xFF1A237E);
  static const Color onPrimaryContainer = Color(0xFF8690EE);
  static const Color inversePrimary = Color(0xFFBDC2FF);

  static const Color secondary = Color(0xFF5A5D72);
  static const Color onSecondary = Color(0xFFFFFFFF);
  static const Color secondaryContainer = Color(0xFFDCDEF7);
  static const Color onSecondaryContainer = Color(0xFF5E6177);

  static const Color tertiary = Color(0xFF76546D);
  static const Color onTertiary = Color(0xFFFFFFFF);
  static const Color tertiaryContainer = Color(0xFF5C1800);
  static const Color onTertiaryContainer = Color(0xFFE17C5A);

  static const Color error = Color(0xFFBA1A1A);
  static const Color onError = Color(0xFFFFFFFF);
  static const Color errorContainer = Color(0xFFFFDAD6);
  static const Color onErrorContainer = Color(0xFF93000A);

  static const Color primaryFixed = Color(0xFFE0E0FF);
  static const Color primaryFixedDim = Color(0xFFBDC2FF);
  static const Color onPrimaryFixed = Color(0xFF000767);
  static const Color onPrimaryFixedVariant = Color(0xFF343D96);

  static const Color secondaryFixed = Color(0xFFDFE1FA);
  static const Color secondaryFixedDim = Color(0xFFC3C5DD);
  static const Color onSecondaryFixed = Color(0xFF171A2C);
  static const Color onSecondaryFixedVariant = Color(0xFF42465A);

  static const Color background = Color(0xFFFBF8FF);
  static const Color onBackground = Color(0xFF1B1B21);

  static const Color success = Color(0xFF2E7D32);
  static const Color successContainer = Color(0xFFC8E6C9);
  static const Color onSuccessContainer = Color(0xFF003300);

  static const Color warning = Color(0xFFF9A825);
  static const Color warningContainer = Color(0xFFFFF9C4);
  static const Color onWarningContainer = Color(0xFF332B00);

  // Spacing
  static const double micro = 4.0;
  static const double compact = 8.0;
  static const double gap = 12.0;
  static const double standard = 16.0;
  static const double card = 24.0;
  static const double section = 32.0;
  static const double major = 48.0;

  // Roundness
  static const double radiusSm = 4.0;
  static const double radiusMd = 8.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 24.0;
  static const double radiusFull = 9999.0;

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.light(
        primary: primary,
        onPrimary: onPrimary,
        primaryContainer: primaryContainer,
        onPrimaryContainer: onPrimaryContainer,
        secondary: secondary,
        onSecondary: onSecondary,
        secondaryContainer: secondaryContainer,
        onSecondaryContainer: onSecondaryContainer,
        tertiary: tertiary,
        onTertiary: onTertiary,
        tertiaryContainer: tertiaryContainer,
        onTertiaryContainer: onTertiaryContainer,
        surface: surface,
        onSurface: onSurface,
        onSurfaceVariant: onSurfaceVariant,
        outline: outline,
        outlineVariant: outlineVariant,
        error: error,
        onError: onError,
        errorContainer: errorContainer,
        onErrorContainer: onErrorContainer,
      ),
      scaffoldBackgroundColor: background,
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 57, height: 64 / 57, color: onSurface, fontWeight: FontWeight.w400),
        displayMedium: GoogleFonts.inter(fontSize: 45, height: 52 / 45, color: onSurface, fontWeight: FontWeight.w400),
        displaySmall: GoogleFonts.inter(fontSize: 36, height: 44 / 36, color: onSurface, fontWeight: FontWeight.bold),
        headlineLarge: GoogleFonts.inter(fontSize: 32, height: 40 / 32, color: onSurface, fontWeight: FontWeight.w400),
        headlineMedium: GoogleFonts.inter(fontSize: 28, height: 36 / 28, color: onSurface, fontWeight: FontWeight.w600),
        headlineSmall: GoogleFonts.inter(fontSize: 24, height: 32 / 24, color: onSurface, fontWeight: FontWeight.w700),
        titleLarge: GoogleFonts.inter(fontSize: 22, height: 28 / 22, color: onSurface, fontWeight: FontWeight.w600),
        titleMedium: GoogleFonts.inter(fontSize: 16, height: 24 / 16, letterSpacing: 0.15, color: onSurface, fontWeight: FontWeight.w500),
        titleSmall: GoogleFonts.inter(fontSize: 14, height: 20 / 14, letterSpacing: 0.1, color: onSurface, fontWeight: FontWeight.w500),
        bodyLarge: GoogleFonts.inter(fontSize: 16, height: 24 / 16, letterSpacing: 0.5, color: onSurface, fontWeight: FontWeight.w400),
        bodyMedium: GoogleFonts.inter(fontSize: 14, height: 20 / 14, letterSpacing: 0.25, color: onSurface, fontWeight: FontWeight.w400),
        bodySmall: GoogleFonts.inter(fontSize: 12, height: 16 / 12, letterSpacing: 0.4, color: onSurfaceVariant, fontWeight: FontWeight.w400),
        labelLarge: GoogleFonts.inter(fontSize: 14, height: 20 / 14, letterSpacing: 0.1, color: onSurface, fontWeight: FontWeight.w500),
        labelMedium: GoogleFonts.inter(fontSize: 12, height: 16 / 12, letterSpacing: 0.5, color: onSurfaceVariant, fontWeight: FontWeight.w500),
        labelSmall: GoogleFonts.inter(fontSize: 11, height: 16 / 11, letterSpacing: 0.5, color: onSurfaceVariant, fontWeight: FontWeight.w500),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        foregroundColor: primary,
        elevation: 0,
        centerTitle: false,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: onPrimary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusMd),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
    );
  }
}
