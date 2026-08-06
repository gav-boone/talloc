import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:talloc/models/category.dart';
import 'package:talloc/providers/category_providers.dart';

class CategoriesScreen extends ConsumerWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categories = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Categories'),
      ),
      body: categories.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final category = categories[index];
                return _CategoryTile(category: category);
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context, ref),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => _AddCategoryDialog(ref: ref),
    );
  }
}

class _CategoryTile extends ConsumerWidget {
  final CategoryModel category;

  const _CategoryTile({required this.category});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: Color(category.colorValue),
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        title: Text(category.name),
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            if (value == 'edit') {
              _showEditDialog(context, ref);
            } else if (value == 'archive') {
              ref.read(categoriesProvider.notifier).archive(category.id);
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(value: 'edit', child: Text('Edit')),
            const PopupMenuItem(value: 'archive', child: Text('Archive')),
          ],
        ),
      ),
    );
  }

  void _showEditDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) =>
          _AddCategoryDialog(ref: ref, existing: category),
    );
  }
}

class _AddCategoryDialog extends StatefulWidget {
  final WidgetRef ref;
  final CategoryModel? existing;

  const _AddCategoryDialog({required this.ref, this.existing});

  @override
  State<_AddCategoryDialog> createState() => _AddCategoryDialogState();
}

class _AddCategoryDialogState extends State<_AddCategoryDialog> {
  late TextEditingController _nameController;
  late int _selectedColor;

  static const _colorOptions = [
    0xFF1565C0, // blue
    0xFF2E7D32, // green
    0xFF6A1B9A, // purple
    0xFFE65100, // orange
    0xFF00838F, // teal
    0xFFAD1457, // pink
    0xFF4E342E, // brown
    0xFF546E7A, // grey
    0xFFC62828, // red
    0xFF283593, // indigo
  ];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.existing?.name ?? '');
    _selectedColor = widget.existing?.colorValue ?? _colorOptions[0];
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.existing == null ? 'Add Category' : 'Edit Category'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Name',
              hintText: 'e.g., Deep Work',
            ),
            autofocus: true,
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _colorOptions.map((color) {
              final isSelected = color == _selectedColor;
              return GestureDetector(
                onTap: () => setState(() => _selectedColor = color),
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: Color(color),
                    shape: BoxShape.circle,
                    border: isSelected
                        ? Border.all(color: Colors.white, width: 3)
                        : null,
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: Color(color).withOpacity(0.6),
                              blurRadius: 6,
                            )
                          ]
                        : null,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _save,
          child: const Text('Save'),
        ),
      ],
    );
  }

  void _save() {
    final name = _nameController.text.trim();

    if (name.isEmpty) return;

    if (widget.existing != null) {
      final updated = widget.existing!;
      updated.name = name;
      updated.colorValue = _selectedColor;
      widget.ref.read(categoriesProvider.notifier).update(updated);
    } else {
      widget.ref.read(categoriesProvider.notifier).add(
            name: name,
            colorValue: _selectedColor,
          );
    }

    Navigator.pop(context);
  }
}
