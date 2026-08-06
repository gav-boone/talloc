import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:talloc/core/constants.dart';
import 'package:talloc/models/category.dart';
import 'package:talloc/models/transaction.dart';
import 'package:talloc/providers/category_providers.dart';
import 'package:talloc/providers/sleep_provider.dart';
import 'package:talloc/providers/transaction_providers.dart';
import 'package:talloc/screens/categories/categories_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  // Show 12 AM to 11:45 PM (24 hours × 4 blocks = 96 blocks)
  static const int _startHour = 0;
  static const int _endHour = 24;
  static const double _blockHeight = 20.0;
  static const double _hourHeight = _blockHeight * 4;

  late PageController _pageController;
  static const int _initialPage = 500; // middle point for infinite scroll

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _initialPage);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final transactions = ref.watch(todayTransactionsProvider);
    final categories = ref.watch(categoriesProvider);
    final selectedDate = ref.watch(selectedDateProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.chevron_left),
          onPressed: () => _changeDay(-1),
        ),
        title: GestureDetector(
          onTap: () => _pickDate(selectedDate),
          child: Text(_formatDate(selectedDate)),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: () => _changeDay(1),
          ),
        ],
      ),
      body: PageView.builder(
        controller: _pageController,
        onPageChanged: (page) {
          final offset = page - _initialPage;
          final today = DateTime.now();
          final baseDate = DateTime(today.year, today.month, today.day);
          ref.read(selectedDateProvider.notifier).state =
              baseDate.add(Duration(days: offset));
        },
        itemBuilder: (context, index) {
          return _buildDayCalendar(transactions, categories);
        },
      ),
    );
  }

  void _changeDay(int offset) {
    final newPage = _pageController.page!.round() + offset;
    _pageController.animateToPage(
      newPage,
      duration: const Duration(milliseconds: 150),
      curve: Curves.easeInOut,
    );
  }

  Future<void> _pickDate(DateTime current) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: current,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 1)),
    );
    if (picked != null) {
      final today = DateTime.now();
      final baseDate = DateTime(today.year, today.month, today.day);
      final offset = picked.difference(baseDate).inDays;
      _pageController.jumpToPage(_initialPage + offset);
      ref.read(selectedDateProvider.notifier).state = picked;
    }
  }

  Widget _buildSleepButton() {
    final bedtime = ref.watch(sleepProvider);
    final isAsleep = bedtime != null;

    if (isAsleep) {
      // Show "Wake Up" button
      return IconButton(
        icon: const Icon(Icons.wb_sunny_outlined),
        tooltip: 'Wake Up',
        onPressed: () => _handleWakeUp(bedtime),
      );
    } else {
      // Show "Go to Sleep" button
      return IconButton(
        icon: const Icon(Icons.bedtime_outlined),
        tooltip: 'Go to Sleep',
        onPressed: _handleGoToSleep,
      );
    }
  }

  void _handleGoToSleep() async {
    // Called from bottom sheet with the block's hour/minute already set
    // We don't need this anymore - handled inline in _onBlockTap
  }

  void _handleGoToSleepAt(int hour, int minute) async {
    final date = ref.read(selectedDateProvider);
    final bedtime = DateTime(date.year, date.month, date.day, hour, minute);
    await ref.read(sleepProvider.notifier).goToSleep(bedtime);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Bedtime set: ${_formatHour(hour)}:${minute.toString().padLeft(2, '0')}'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _handleWakeUp(DateTime bedtime) async {
    // This is now unused - wake up is handled inline in _onBlockTap
  }

  void _handleWakeUpAt(DateTime bedtime, int hour, int minute) async {
    final date = ref.read(selectedDateProvider);
    final wakeTime = DateTime(date.year, date.month, date.day, hour, minute);

    // Calculate total duration
    final duration = wakeTime.difference(bedtime);
    final totalBlocks = (duration.inMinutes / blockSize).round();

    if (totalBlocks <= 0) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Wake time must be after bedtime.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
      return;
    }

    // Find or create Sleep category
    final categories = ref.read(categoriesProvider);
    var sleepCat = categories.where((c) => c.name == 'Sleep').firstOrNull;
    if (sleepCat == null) {
      await ref.read(categoriesProvider.notifier).add(
            name: 'Sleep',
            colorValue: 0xFF1A237E,
          );
      final updatedCats = ref.read(categoriesProvider);
      sleepCat = updatedCats.where((c) => c.name == 'Sleep').firstOrNull;
    }

    if (sleepCat != null) {
      // Check if sleep spans midnight
      final midnight = DateTime(wakeTime.year, wakeTime.month, wakeTime.day);

      if (bedtime.isBefore(midnight)) {
        // Split into two: before midnight + after midnight
        final beforeMidnightMinutes = midnight.difference(bedtime).inMinutes;
        final beforeBlocks = (beforeMidnightMinutes / blockSize).round();
        final afterBlocks = totalBlocks - beforeBlocks;

        // Log pre-midnight portion (on bedtime's day)
        if (beforeBlocks > 0) {
          final repo = ref.read(transactionRepositoryProvider);
          await repo.add(
            startTime: bedtime,
            blocks: beforeBlocks,
            categoryId: sleepCat.id,
            note: 'Sleep',
          );
        }

        // Log post-midnight portion (on wake day = today's view)
        if (afterBlocks > 0) {
          await ref.read(todayTransactionsProvider.notifier).add(
                startTime: midnight,
                blocks: afterBlocks,
                categoryId: sleepCat.id,
                note: 'Sleep',
              );
        }
      } else {
        // Same day, just log it
        await ref.read(todayTransactionsProvider.notifier).add(
              startTime: bedtime,
              blocks: totalBlocks,
              categoryId: sleepCat.id,
              note: 'Sleep',
            );
      }
    }

    await ref.read(sleepProvider.notifier).wakeUp();

    if (mounted) {
      final hours = duration.inHours;
      final mins = duration.inMinutes % 60;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Logged ${hours}h ${mins}m of sleep.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Widget _buildDayCalendar(
    List<TimeTransaction> transactions,
    List<CategoryModel> categories,
  ) {
    final totalHours = _endHour - _startHour;

    return _AutoScrollToNow(
      startHour: _startHour,
      hourHeight: _hourHeight,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Time labels column
          SizedBox(
            width: 52,
            child: Column(
              children: List.generate(totalHours, (i) {
                final hour = _startHour + i;
                return SizedBox(
                  height: _hourHeight,
                  child: Align(
                    alignment: Alignment.topRight,
                    child: Padding(
                      padding: const EdgeInsets.only(right: 8, top: 0),
                      child: Text(
                        _formatHour(hour),
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),

          // Calendar grid
          Expanded(
            child: Stack(
              children: [
                // Grid lines + tap targets
                Column(
                  children: List.generate(totalHours * 4, (blockIndex) {
                    final hour = _startHour + (blockIndex ~/ 4);
                    final quarter = blockIndex % 4;
                    final isHourLine = quarter == 0;

                    return GestureDetector(
                      onTap: () => _onBlockTap(hour, quarter * 15),
                      child: Container(
                        height: _blockHeight,
                        decoration: BoxDecoration(
                          border: Border(
                            top: isHourLine
                                ? BorderSide(color: Colors.grey[300]!)
                                : BorderSide(
                                    color: Colors.grey[200]!,
                                    width: 0.5,
                                  ),
                          ),
                        ),
                      ),
                    );
                  }),
                ),

                // Current time indicator
                _buildNowIndicator(),

                // Sleep indicator
                _buildSleepIndicator(),

                // Logged transactions as colored blocks
                ..._buildTransactionBlocks(transactions, categories),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNowIndicator() {
    final now = DateTime.now();
    final minutesSinceStart = (now.hour - _startHour) * 60 + now.minute;
    if (minutesSinceStart < 0 || minutesSinceStart > (_endHour - _startHour) * 60) {
      return const SizedBox.shrink();
    }
    final top = (minutesSinceStart / 15) * _blockHeight;

    return Positioned(
      top: top,
      left: 0,
      right: 0,
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: Colors.red,
              shape: BoxShape.circle,
            ),
          ),
          Expanded(
            child: Container(
              height: 1.5,
              color: Colors.red,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSleepIndicator() {
    final bedtime = ref.watch(sleepProvider);
    if (bedtime == null) return const SizedBox.shrink();

    // Only show on the day bedtime was assigned
    final selectedDate = ref.watch(selectedDateProvider);
    if (bedtime.year != selectedDate.year ||
        bedtime.month != selectedDate.month ||
        bedtime.day != selectedDate.day) {
      return const SizedBox.shrink();
    }

    final minutesSinceStart = (bedtime.hour - _startHour) * 60 + bedtime.minute;
    if (minutesSinceStart < 0 || minutesSinceStart > (_endHour - _startHour) * 60) {
      return const SizedBox.shrink();
    }
    final top = (minutesSinceStart / 15) * _blockHeight;

    return Positioned(
      top: top,
      left: 0,
      right: 0,
      child: Row(
        children: [
          const Icon(Icons.bedtime, size: 12, color: Color(0xFF1A237E)),
          Expanded(
            child: Container(
              height: 1.5,
              color: const Color(0xFF1A237E),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildTransactionBlocks(
    List<TimeTransaction> transactions,
    List<CategoryModel> categories,
  ) {
    return transactions.map((t) {
      final category =
          categories.where((c) => c.id == t.categoryId).firstOrNull;
      if (category == null) return const SizedBox.shrink();

      final minutesSinceStart =
          (t.startTime.hour - _startHour) * 60 + t.startTime.minute;
      if (minutesSinceStart < 0) return const SizedBox.shrink();

      final top = (minutesSinceStart / 15) * _blockHeight;
      final height = t.blocks * _blockHeight;

      return Positioned(
        top: top,
        left: 4,
        right: 4,
        height: height,
        child: GestureDetector(
          onTap: () => _onTransactionTap(t, category),
          onLongPress: () => _onTransactionLongPress(t, category),
          child: Container(
            decoration: BoxDecoration(
              color: Color(category.colorValue).withOpacity(0.85),
              borderRadius: BorderRadius.circular(4),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  category.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                if (t.note != null && t.note!.isNotEmpty)
                  Text(
                    t.note!,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 10,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
        ),
      );
    }).toList();
  }

  void _onBlockTap(int hour, int minute) {
    final categories = ref.read(categoriesProvider);
    if (categories.isEmpty) return;

    final bedtime = ref.read(sleepProvider);
    final isAsleep = bedtime != null;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _LogTimeSheet(
        hour: hour,
        minute: minute,
        categories: categories,
        isAsleep: isAsleep,
        onSleep: () {
          Navigator.pop(context);
          if (isAsleep) {
            _handleWakeUpAt(bedtime!, hour, minute);
          } else {
            _handleGoToSleepAt(hour, minute);
          }
        },
        onManageCategories: () {
          Navigator.pop(context);
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const CategoriesScreen()),
          );
        },
        onSave: (categoryId, blocks, note) {
          final date = ref.read(selectedDateProvider);
          final startTime = DateTime(date.year, date.month, date.day, hour, minute);
          ref.read(todayTransactionsProvider.notifier).add(
                startTime: startTime,
                blocks: blocks,
                categoryId: categoryId,
                note: note,
              );
          Navigator.pop(context);
        },
      ),
    );
  }

  void _onTransactionTap(TimeTransaction t, CategoryModel category) {
    final categories = ref.read(categoriesProvider);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _LogTimeSheet(
        hour: t.startTime.hour,
        minute: t.startTime.minute,
        categories: categories,
        initialCategoryId: t.categoryId,
        initialBlocks: t.blocks,
        initialNote: t.note,
        isEditing: true,
        onManageCategories: () {
          Navigator.pop(context);
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const CategoriesScreen()),
          );
        },
        onSave: (categoryId, blocks, note) {
          t.categoryId = categoryId;
          t.blocks = blocks;
          t.note = note;
          ref.read(todayTransactionsProvider.notifier).update(t);
          Navigator.pop(context);
        },
        onDelete: () {
          ref.read(todayTransactionsProvider.notifier).delete(t.id);
          Navigator.pop(context);
        },
      ),
    );
  }

  void _onTransactionLongPress(TimeTransaction t, CategoryModel category) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(category.name),
        content: Text(
          '${t.blocks * blockSize} min at ${_formatHour(t.startTime.hour)}:${t.startTime.minute.toString().padLeft(2, '0')}',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          TextButton(
            onPressed: () {
              ref.read(todayTransactionsProvider.notifier).delete(t.id);
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  String _formatHour(int hour) {
    if (hour == 0) return '12 AM';
    if (hour < 12) return '$hour AM';
    if (hour == 12) return '12 PM';
    return '${hour - 12} PM';
  }

  String _formatDate(DateTime date) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${days[date.weekday - 1]}, ${months[date.month - 1]} ${date.day}';
  }
}

/// Bottom sheet for quick time logging
class _LogTimeSheet extends StatefulWidget {
  final int hour;
  final int minute;
  final List<CategoryModel> categories;
  final void Function(String categoryId, int blocks, String? note) onSave;
  final VoidCallback? onDelete;
  final VoidCallback? onSleep;
  final VoidCallback? onManageCategories;
  final String? initialCategoryId;
  final int? initialBlocks;
  final String? initialNote;
  final bool isEditing;
  final bool isAsleep;

  const _LogTimeSheet({
    required this.hour,
    required this.minute,
    required this.categories,
    required this.onSave,
    this.onDelete,
    this.onSleep,
    this.onManageCategories,
    this.initialCategoryId,
    this.initialBlocks,
    this.initialNote,
    this.isEditing = false,
    this.isAsleep = false,
  });

  @override
  State<_LogTimeSheet> createState() => _LogTimeSheetState();
}

class _LogTimeSheetState extends State<_LogTimeSheet> {
  late String? _selectedCategoryId;
  late int _blocks;
  late TextEditingController _noteController;

  @override
  void initState() {
    super.initState();
    _selectedCategoryId = widget.initialCategoryId;
    _blocks = widget.initialBlocks ?? 1;
    _noteController = TextEditingController(text: widget.initialNote ?? '');
  }

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  String get _timeLabel {
    final h = widget.hour;
    final m = widget.minute;
    final period = h >= 12 ? 'PM' : 'AM';
    final displayHour = h == 0 ? 12 : (h > 12 ? h - 12 : h);
    return '$displayHour:${m.toString().padLeft(2, '0')} $period';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Text(
                  widget.isEditing ? 'Edit at $_timeLabel' : 'Log at $_timeLabel',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ),
              if (widget.isEditing && widget.onDelete != null)
                IconButton(
                  onPressed: widget.onDelete,
                  icon: const Icon(Icons.delete_outline),
                  color: Colors.red,
                ),
            ],
          ),

          const SizedBox(height: 20),

          // Duration selector with +/- buttons
          Text(
            'Duration',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton.outlined(
                onPressed: _blocks > 1 ? () => setState(() => _blocks--) : null,
                icon: const Icon(Icons.remove),
              ),
              const SizedBox(width: 20),
              Text(
                '${_blocks * blockSize} min',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(width: 20),
              IconButton.outlined(
                onPressed: _blocks < 16 ? () => setState(() => _blocks++) : null,
                icon: const Icon(Icons.add),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Category selector
          Text(
            'Category',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: widget.categories.map((cat) {
              final isSelected = _selectedCategoryId == cat.id;
              return GestureDetector(
                onTap: () => setState(() => _selectedCategoryId = cat.id),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? Color(cat.colorValue)
                        : Color(cat.colorValue).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: Color(cat.colorValue),
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Text(
                    cat.name,
                    style: TextStyle(
                      fontSize: 13,
                      color: isSelected
                          ? Colors.white
                          : Color(cat.colorValue),
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.normal,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),

          if (widget.onManageCategories != null)
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: widget.onManageCategories,
                child: const Text('Manage Categories'),
              ),
            ),

          const SizedBox(height: 12),

          // Optional description
          TextField(
            controller: _noteController,
            decoration: const InputDecoration(
              hintText: 'Description (optional)',
              border: OutlineInputBorder(),
              isDense: true,
            ),
            maxLines: 1,
          ),

          const SizedBox(height: 20),

          // Sleep button
          if (!widget.isEditing)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: SizedBox(
                width: double.infinity,
                height: 44,
                child: OutlinedButton.icon(
                  onPressed: widget.onSleep,
                  icon: Icon(widget.isAsleep
                      ? Icons.wb_sunny_outlined
                      : Icons.bedtime_outlined),
                  label: Text(widget.isAsleep ? 'Wake Up' : 'Go to Sleep'),
                ),
              ),
            ),

          // Save button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: FilledButton(
              onPressed: _selectedCategoryId == null
                  ? null
                  : () => widget.onSave(
                        _selectedCategoryId!,
                        _blocks,
                        _noteController.text.trim().isNotEmpty
                            ? _noteController.text.trim()
                            : null,
                      ),
              child: Text(widget.isEditing ? 'Save' : 'Log It'),
            ),
          ),
        ],
      ),
    );
  }
}


/// A widget that wraps content in a ScrollView and auto-scrolls to current time
class _AutoScrollToNow extends StatefulWidget {
  final int startHour;
  final double hourHeight;
  final Widget child;

  const _AutoScrollToNow({
    required this.startHour,
    required this.hourHeight,
    required this.child,
  });

  @override
  State<_AutoScrollToNow> createState() => _AutoScrollToNowState();
}

class _AutoScrollToNowState extends State<_AutoScrollToNow> {
  final ScrollController _controller = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToNow();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _scrollToNow() {
    final now = DateTime.now();
    final hourOffset = now.hour - widget.startHour;
    if (hourOffset > 0 && _controller.hasClients) {
      final targetScroll = (hourOffset - 2) * widget.hourHeight;
      _controller.jumpTo(
        targetScroll.clamp(0.0, _controller.position.maxScrollExtent),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      controller: _controller,
      padding: const EdgeInsets.only(bottom: 80),
      child: widget.child,
    );
  }
}
