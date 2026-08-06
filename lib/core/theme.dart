import 'package:flutter/material.dart';

ThemeData appTheme() {
  return ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.teal,
      brightness: Brightness.dark,
      surface: const Color(0xFF1A2332),
      onSurface: Colors.white,
    ),
    scaffoldBackgroundColor: const Color(0xFF1F2B3D),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF1A2332),
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: Color(0xFF1A2332),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: const Color(0xFF1A2332),
      indicatorColor: Colors.teal.withOpacity(0.3),
    ),
    useMaterial3: true,
  );
}
