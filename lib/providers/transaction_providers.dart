import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:talloc/models/transaction.dart';
import 'package:talloc/repositories/transaction_repository.dart';

final transactionRepositoryProvider = Provider<TransactionRepository>((ref) {
  return TransactionRepository();
});

final selectedDateProvider = StateProvider<DateTime>((ref) {
  final now = DateTime.now();
  return DateTime(now.year, now.month, now.day);
});

final todayTransactionsProvider =
    StateNotifierProvider<TransactionsNotifier, List<TimeTransaction>>((ref) {
  final repo = ref.watch(transactionRepositoryProvider);
  final date = ref.watch(selectedDateProvider);
  return TransactionsNotifier(repo, date);
});

class TransactionsNotifier extends StateNotifier<List<TimeTransaction>> {
  final TransactionRepository _repo;
  final DateTime _date;

  TransactionsNotifier(this._repo, this._date) : super([]) {
    _load();
  }

  void _load() {
    state = _repo.getForDate(_date);
  }

  Future<void> add({
    required DateTime startTime,
    required int blocks,
    required String categoryId,
    String? note,
  }) async {
    await _repo.add(
      startTime: startTime,
      blocks: blocks,
      categoryId: categoryId,
      note: note,
    );
    _load();
  }

  Future<void> delete(String id) async {
    await _repo.delete(id);
    _load();
  }

  Future<void> update(TimeTransaction transaction) async {
    await _repo.update(transaction);
    _load();
  }

  void refresh() {
    _load();
  }

  int get totalBlocks => state.fold(0, (sum, t) => sum + t.blocks);

  Map<String, int> get blocksByCategory {
    final map = <String, int>{};
    for (final t in state) {
      map[t.categoryId] = (map[t.categoryId] ?? 0) + t.blocks;
    }
    return map;
  }
}
