import 'package:flutter_test/flutter_test.dart';
import 'package:kutubxona_app/main.dart';

void main() {
  testWidgets('App renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(const KutubxonaApp());
    // Basic smoke test
    expect(find.text('Bosh sahifa'), findsWidgets);
  });
}
