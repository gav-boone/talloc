import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

/// Stores bedtime as ISO string in a simple Hive box.
/// null = not asleep, non-null = went to bed at that time.
final sleepProvider = StateNotifierProvider<SleepNotifier, DateTime?>((ref) {
  return SleepNotifier();
});

class SleepNotifier extends StateNotifier<DateTime?> {
  static const _boxName = 'settings';
  static const _key = 'bedtime';

  SleepNotifier() : super(null) {
    _load();
  }

  Future<void> _load() async {
    final box = await Hive.openBox(_boxName);
    final stored = box.get(_key);
    if (stored != null) {
      state = DateTime.tryParse(stored);
    }
  }

  Future<void> goToSleep(DateTime bedtime) async {
    state = bedtime;
    final box = Hive.box(_boxName);
    await box.put(_key, bedtime.toIso8601String());
  }

  Future<void> wakeUp() async {
    state = null;
    final box = Hive.box(_boxName);
    await box.delete(_key);
  }
}
