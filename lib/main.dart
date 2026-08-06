import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:talloc/app.dart';
import 'package:talloc/models/category.dart';
import 'package:talloc/models/goal.dart';
import 'package:talloc/models/transaction.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Hive.initFlutter();

  Hive.registerAdapter(CategoryModelAdapter());
  Hive.registerAdapter(TimeTransactionAdapter());
  Hive.registerAdapter(GoalAdapter());

  await Hive.openBox<CategoryModel>('categories');
  await Hive.openBox<TimeTransaction>('transactions');
  await Hive.openBox<Goal>('goals');
  await Hive.openBox('settings');

  runApp(const ProviderScope(child: TallocApp()));
}
