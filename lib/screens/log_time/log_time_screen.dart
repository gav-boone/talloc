import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:talloc/core/constants.dart';
import 'package:talloc/models/category.dart';
import 'package:talloc/providers/category_providers.dart';
import 'package:talloc/providers/transaction_providers.dart';

class LogTimeScreen extends ConsumerStatefulWidget {
  const LogTimeScreen({super.key});

  @override
  ConsumerState<LogTimeScreen> createState() => _LogTimeScreenState();
}

class _LogTimeScreenState extends ConsumerState<LogTimeScreen> {
  CategoryModel? _selectedCategory;
  int _blocks = 1;
  TimeOfDay _startTime = TimeOfDay.now();
  final _noteController = TextEditingController();

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Log Time'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Category selection
            Text(
              'Category',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            _buildCategoryGrid(categories),

            const SizedBox(height: 28),

            // Block count
            Text(
              'Duration',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            _buildBlockSelector(),

            const SizedBox(height: 28),

            // Start time
            Text(
              'Start Time',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            _buildTimePicker(),

            const SizedBox(height: 28),

            // Note
            TextField(
              controller: _noteController,
              decoration: const InputDecoration(
                labelText: 'Note (optional)',
                border: OutlineInputBorder(),
                hintText: 'What were you working on?',
              ),
              maxLines: 2,
            ),

            const SizedBox(height: 32),

            // Save button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton.icon(
                onPressed: _selectedCategory == null ? null : _save,
                icon: const Icon(Icons.check),
                label: Text(
                  _selectedCategory == null
                      ? 'Select a category'
                      : 'Log ${_blocks * blockSize} min of ${_selectedCategory!.name}',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryGrid(List<CategoryModel> categories) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: categories.map((cat) {
        final isSelected = _selectedCategory?.id == cat.id;
        return GestureDetector(
          onTap: () => setState(() => _selectedCategory = cat),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: isSelected
                  ? Color(cat.colorValue)
                  : Color(cat.colorValue).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Color(cat.colorValue),
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  cat.name,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Color(cat.colorValue),
                    fontWeight:
                        isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildBlockSelector() {
    return Row(
      children: [
        IconButton.filled(
          onPressed: _blocks > 1 ? () => setState(() => _blocks--) : null,
          icon: const Icon(Icons.remove),
        ),
        const SizedBox(width: 16),
        Column(
          children: [
            Text(
              '$_blocks',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              '${_blocks * blockSize} min',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
          ],
        ),
        const SizedBox(width: 16),
        IconButton.filled(
          onPressed:
              _blocks < 8 ? () => setState(() => _blocks++) : null,
          icon: const Icon(Icons.add),
        ),
        const SizedBox(width: 24),
        // Quick-select chips
        ...([1, 2, 4].map((b) => Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ActionChip(
                label: Text('${b * blockSize}m'),
                onPressed: () => setState(() => _blocks = b),
                backgroundColor:
                    _blocks == b ? Theme.of(context).colorScheme.primaryContainer : null,
              ),
            ))),
      ],
    );
  }

  Widget _buildTimePicker() {
    return InkWell(
      onTap: _pickTime,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[400]!),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            const Icon(Icons.access_time),
            const SizedBox(width: 12),
            Text(
              _startTime.format(context),
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const Spacer(),
            TextButton(
              onPressed: () => setState(() => _startTime = TimeOfDay.now()),
              child: const Text('Now'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _startTime,
    );
    if (picked != null) {
      setState(() => _startTime = picked);
    }
  }

  void _save() {
    final now = DateTime.now();
    final startDateTime = DateTime(
      now.year,
      now.month,
      now.day,
      _startTime.hour,
      _startTime.minute,
    );

    ref.read(todayTransactionsProvider.notifier).add(
          startTime: startDateTime,
          blocks: _blocks,
          categoryId: _selectedCategory!.id,
          note: _noteController.text.trim().isNotEmpty
              ? _noteController.text.trim()
              : null,
        );

    Navigator.pop(context);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Logged ${_blocks * blockSize} min of ${_selectedCategory!.name}',
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
