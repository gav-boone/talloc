class Category {
  final int id;
  final String name;
  final String emoji;
  final int colorValue;
  final bool isArchived;

  const Category({
    this.id = 0,
    required this.name,
    required this.emoji,
    required this.colorValue,
    this.isArchived = false,
  });
}
