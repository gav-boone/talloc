import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

final _dailyGoalsProvider = StateNotifierProvider<_TextGoalsNotifier, List<Map<String, dynamic>>>((ref) {
  return _TextGoalsNotifier('daily_goals');
});

final _weeklyGoalsProvider = StateNotifierProvider<_TextGoalsNotifier, List<Map<String, dynamic>>>((ref) {
  return _TextGoalsNotifier('weekly_goals');
});

class _TextGoalsNotifier extends StateNotifier<List<Map<String, dynamic>>> {
  final String _key;
  Box get _box => Hive.box('settings');

  _TextGoalsNotifier(this._key) : super([]) {
    _load();
  }

  void _load() {
    final stored = _box.get(_key);
    if (stored != null && stored is List) {
      final goals = <Map<String, dynamic>>[];
      for (final item in stored) {
        if (item is Map) {
          goals.add({
            'text': item['text']?.toString() ?? '',
            'done': item['done'] == true,
          });
        }
      }
      state = goals;
    }
  }

  Future<void> _save() async {
    await _box.put(_key, state.map((g) => {'text': g['text'], 'done': g['done']}).toList());
  }

  Future<void> add(String goal) async {
    if (state.length >= 3) return;
    state = [...state, {'text': goal, 'done': false}];
    await _save();
  }

  Future<void> toggle(int index) async {
    final updated = [...state];
    updated[index] = {
      'text': updated[index]['text'],
      'done': !(updated[index]['done'] as bool),
    };
    state = updated;
    await _save();
  }

  Future<void> delete(int index) async {
    final updated = [...state];
    updated.removeAt(index);
    state = updated;
    await _save();
  }
}

class GoalsScreen extends ConsumerWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dailyGoals = ref.watch(_dailyGoalsProvider);
    final weeklyGoals = ref.watch(_weeklyGoalsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Goals')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _GoalSection(
              title: 'Daily Goals',
              goals: dailyGoals,
              onAdd: (text) => ref.read(_dailyGoalsProvider.notifier).add(text),
              onDelete: (i) => ref.read(_dailyGoalsProvider.notifier).delete(i),
              onToggle: (i) => ref.read(_dailyGoalsProvider.notifier).toggle(i),
            ),
            const SizedBox(height: 32),
            _GoalSection(
              title: 'Weekly Goals',
              goals: weeklyGoals,
              onAdd: (text) => ref.read(_weeklyGoalsProvider.notifier).add(text),
              onDelete: (i) => ref.read(_weeklyGoalsProvider.notifier).delete(i),
              onToggle: (i) => ref.read(_weeklyGoalsProvider.notifier).toggle(i),
            ),
          ],
        ),
      ),
    );
  }
}

class _GoalSection extends StatefulWidget {
  final String title;
  final List<Map<String, dynamic>> goals;
  final void Function(String) onAdd;
  final void Function(int) onDelete;
  final void Function(int) onToggle;

  const _GoalSection({
    required this.title,
    required this.goals,
    required this.onAdd,
    required this.onDelete,
    required this.onToggle,
  });

  @override
  State<_GoalSection> createState() => _GoalSectionState();
}

class _GoalSectionState extends State<_GoalSection> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.title,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        ...widget.goals.asMap().entries.map((entry) {
          final goal = entry.value;
          final isDone = goal['done'] as bool;
          return Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              children: [
                Checkbox(
                  value: isDone,
                  onChanged: (_) => widget.onToggle(entry.key),
                ),
                Expanded(
                  child: Text(
                    goal['text'] as String,
                    style: TextStyle(
                      color: isDone ? Colors.grey[600] : null,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 18, color: Colors.white),
                  onPressed: () => widget.onDelete(entry.key),
                ),
              ],
            ),
          );
        }),
        if (widget.goals.length < 3)
          Row(
            children: [
              const SizedBox(width: 48), // align with checkbox
              Expanded(
                child: TextField(
                  controller: _controller,
                  decoration: const InputDecoration(
                    hintText: 'Add a goal...',
                    isDense: true,
                    border: OutlineInputBorder(),
                  ),
                  onSubmitted: _submit,
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.add_circle_outline),
                onPressed: () => _submit(_controller.text),
              ),
            ],
          ),
      ],
    );
  }

  void _submit(String text) {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return;
    widget.onAdd(trimmed);
    _controller.clear();
  }
}
