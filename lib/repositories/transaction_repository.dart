import 'package:hive/hive.dart';
import 'package:talloc/models/transaction.dart';
import 'package:uuid/uuid.dart';

class TransactionRepository {
  static const _boxName = 'transactions';
  final _uuid = const Uuid();

  Box<TimeTransaction> get _box => Hive.box<TimeTransaction>(_boxName);

  List<TimeTransaction> getAll() {
    return _box.values.toList()
      ..sort((a, b) => b.startTime.compareTo(a.startTime));
  }

  List<TimeTransaction> getForDate(DateTime date) {
    return _box.values.where((t) {
      return t.startTime.year == date.year &&
          t.startTime.month == date.month &&
          t.startTime.day == date.day;
    }).toList()
      ..sort((a, b) => a.startTime.compareTo(b.startTime));
  }

  List<TimeTransaction> getForDateRange(DateTime start, DateTime end) {
    return _box.values.where((t) {
      return t.startTime.isAfter(start.subtract(const Duration(seconds: 1))) &&
          t.startTime.isBefore(end.add(const Duration(seconds: 1)));
    }).toList()
      ..sort((a, b) => a.startTime.compareTo(b.startTime));
  }

  Future<TimeTransaction> add({
    required DateTime startTime,
    required int blocks,
    required String categoryId,
    String? note,
  }) async {
    final transaction = TimeTransaction(
      id: _uuid.v4(),
      startTime: startTime,
      blocks: blocks,
      categoryId: categoryId,
      note: note,
    );
    await _box.put(transaction.id, transaction);
    return transaction;
  }

  Future<void> update(TimeTransaction transaction) async {
    await _box.put(transaction.id, transaction);
  }

  Future<void> delete(String id) async {
    await _box.delete(id);
  }

  int getTotalBlocksForDate(DateTime date) {
    return getForDate(date).fold(0, (sum, t) => sum + t.blocks);
  }

  Map<String, int> getBlocksByCategoryForDate(DateTime date) {
    final transactions = getForDate(date);
    final map = <String, int>{};
    for (final t in transactions) {
      map[t.categoryId] = (map[t.categoryId] ?? 0) + t.blocks;
    }
    return map;
  }
}
