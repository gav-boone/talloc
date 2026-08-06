import 'package:hive/hive.dart';

part 'category.g.dart';

@HiveType(typeId: 0)
class CategoryModel extends HiveObject {
  @HiveField(0)
  late String id;

  @HiveField(1)
  late String name;

  @HiveField(2)
  late String emoji; // kept for Hive compat, unused

  @HiveField(3)
  late int colorValue;

  @HiveField(4)
  late bool isArchived;

  CategoryModel({
    required this.id,
    required this.name,
    this.emoji = '',
    required this.colorValue,
    this.isArchived = false,
  });
}
