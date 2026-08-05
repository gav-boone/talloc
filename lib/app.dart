import 'package:device_preview/device_preview.dart';
import 'package:flutter/material.dart';
import 'package:talloc/core/constants.dart';
import 'package:talloc/core/theme.dart';
import 'package:talloc/screens/home/home_screen.dart';

class TallocApp extends StatelessWidget {
  const TallocApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: appName,
      theme: appTheme(),
      home: const HomeScreen(),
      locale: DevicePreview.locale(context),
      builder: DevicePreview.appBuilder,
    );
  }
}
