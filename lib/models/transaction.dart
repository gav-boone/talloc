class Transaction {
  final int id;
  final DateTime startTime;
  final int blocks;
  final String categoryId;
  final String description;

  const Transaction({
    this.id = 0,
    required this.startTime,
    required this.blocks,
    required this.categoryId,
    required this.description,
  });
}
