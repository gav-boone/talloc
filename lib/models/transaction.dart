import 'package:hive/hive.dart';

part 'transaction.g.dart';

@HiveType(typeId: 1)
class TimeTransaction extends HiveObject {
  @HiveField(0)
  late String id;

  @HiveField(1)
  late DateTime startTime;

  @HiveField(2)
  late int blocks;

  @HiveField(3)
  late String categoryId;

  @HiveField(4)
  late String? note;

  TimeTransaction({
    required this.id,
    required this.startTime,
    required this.blocks,
    required this.categoryId,
    this.note,
  });
}
