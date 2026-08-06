import 'package:flutter/material.dart';
import 'package:talloc/core/constants.dart';
import 'package:talloc/core/theme.dart';
import 'package:talloc/screens/main_shell.dart';

class TallocApp extends StatelessWidget {
  const TallocApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: appName,
      theme: appTheme(),
      home: const MainShell(),
      debugShowCheckedModeBanner: false,
    );
  }
}
