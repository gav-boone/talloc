import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import 'package:talloc/models/goal.dart';
import 'package:uuid/uuid.dart';

final goalsProvider = StateNotifierProvider<GoalsNotifier, List<Goal>>((ref) {
  return GoalsNotifier();
});

final dailyGoalsProvider = Provider<List<Goal>>((ref) {
  return ref.watch(goalsProvider).where((g) => g.period == 'daily').toList();
});

final weeklyGoalsProvider = Provider<List<Goal>>((ref) {
  return ref.watch(goalsProvider).where((g) => g.period == 'weekly').toList();
});

class GoalsNotifier extends StateNotifier<List<Goal>> {
  static const _boxName = 'goals';
  final _uuid = const Uuid();

  Box<Goal> get _box => Hive.box<Goal>(_boxName);

  GoalsNotifier() : super([]) {
    _load();
  }

  void _load() {
    state = _box.values.toList();
  }

  Future<void> add({
    required String categoryId,
    required int targetBlocks,
    required String period,
    String type = 'atLeast',
  }) async {
    final goal = Goal(
      id: _uuid.v4(),
      categoryId: categoryId,
      targetBlocks: targetBlocks,
      period: period,
      type: type,
    );
    await _box.put(goal.id, goal);
    _load();
  }

  Future<void> delete(String id) async {
    await _box.delete(id);
    _load();
  }

  Future<void> update(Goal goal) async {
    await _box.put(goal.id, goal);
    _load();
  }
}
