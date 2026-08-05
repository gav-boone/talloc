import 'package:flutter_test/flutter_test.dart';
import 'package:talloc/app.dart';

void main() {
  testWidgets('App renders', (WidgetTester tester) async {
    await tester.pumpWidget(const TallocApp());
    expect(find.text('Talloc'), findsNothing); // placeholder — update when we add real content
  });
}
