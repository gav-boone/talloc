import 'package:hive/hive.dart';

part 'goal.g.dart';

@HiveType(typeId: 2)
class Goal extends HiveObject {
  @HiveField(0)
  late String id;

  @HiveField(1)
  late String categoryId;

  @HiveField(2)
  late int targetBlocks;

  @HiveField(3)
  late String period; // 'daily' or 'weekly'

  @HiveField(4)
  late String type; // 'atLeast', 'atMost', 'exactly'

  Goal({
    required this.id,
    required this.categoryId,
    required this.targetBlocks,
    required this.period,
    this.type = 'atLeast',
  });
}
