import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:talloc/models/category.dart';
import 'package:talloc/repositories/category_repository.dart';

final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  return CategoryRepository();
});

final categoriesProvider =
    StateNotifierProvider<CategoriesNotifier, List<CategoryModel>>((ref) {
  final repo = ref.watch(categoryRepositoryProvider);
  return CategoriesNotifier(repo);
});

class CategoriesNotifier extends StateNotifier<List<CategoryModel>> {
  final CategoryRepository _repo;

  CategoriesNotifier(this._repo) : super([]) {
    _load();
  }

  Future<void> _load() async {
    await _repo.seedDefaults();
    state = _repo.getAll();
  }

  Future<void> add({
    required String name,
    required int colorValue,
  }) async {
    await _repo.add(name: name, colorValue: colorValue);
    state = _repo.getAll();
  }

  Future<void> update(CategoryModel category) async {
    await _repo.update(category);
    state = _repo.getAll();
  }

  Future<void> archive(String id) async {
    await _repo.archive(id);
    state = _repo.getAll();
  }

  void refresh() {
    state = _repo.getAll();
  }
}
