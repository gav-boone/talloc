import 'package:hive/hive.dart';
import 'package:talloc/models/category.dart';
import 'package:uuid/uuid.dart';

class CategoryRepository {
  static const _boxName = 'categories';
  final _uuid = const Uuid();

  Box<CategoryModel> get _box => Hive.box<CategoryModel>(_boxName);

  List<CategoryModel> getAll() {
    return _box.values.where((c) => !c.isArchived).toList();
  }

  List<CategoryModel> getAllIncludingArchived() {
    return _box.values.toList();
  }

  CategoryModel? getById(String id) {
    return _box.values.where((c) => c.id == id).firstOrNull;
  }

  Future<CategoryModel> add({
    required String name,
    required int colorValue,
  }) async {
    final category = CategoryModel(
      id: _uuid.v4(),
      name: name,
      colorValue: colorValue,
    );
    await _box.put(category.id, category);
    return category;
  }

  Future<void> update(CategoryModel category) async {
    await _box.put(category.id, category);
  }

  Future<void> archive(String id) async {
    final category = getById(id);
    if (category != null) {
      category.isArchived = true;
      await category.save();
    }
  }

  Future<void> delete(String id) async {
    await _box.delete(id);
  }

  Future<void> seedDefaults() async {
    if (_box.isNotEmpty) return;

    final defaults = [
      ('Deep Work', 0xFF42A5F5),
      ('Exercise', 0xFF66BB6A),
      ('Reading', 0xFFAB47BC),
      ('Social', 0xFFFF7043),
      ('Rest', 0xFF26C6DA),
      ('Scrolling', 0xFFEC407A),
      ('Meals', 0xFFA1887F),
      ('Chores', 0xFF78909C),
    ];

    for (final (name, color) in defaults) {
      await add(name: name, colorValue: color);
    }
  }
}
