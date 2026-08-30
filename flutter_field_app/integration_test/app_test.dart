import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:flutter_field_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('end-to-end full app test', (tester) async {
    app.main();
    await tester.pumpAndSettle();

    // Verify Login Screen
    expect(find.text('MapanSetu Officer Login'), findsWidgets);
    
    // Tap English -> Hindi Switch
    await tester.tap(find.text('English'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('हिंदी').last);
    await tester.pumpAndSettle();

    // Verify Translation to Hindi on Login Screen
    expect(find.text('मापनसेतु अधिकारी लॉगिन'), findsWidgets);
    
    // Switch back to English
    await tester.tap(find.text('हिंदी'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('English').last);
    await tester.pumpAndSettle();

    // Perform Login
    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle(const Duration(seconds: 2));

    // Verify Dashboard navigation
    expect(find.text('Dashboard'), findsWidgets);
    
    // Test Responsiveness / Navigation
    await tester.tap(find.byIcon(Icons.assignment));
    await tester.pumpAndSettle();
    expect(find.text('Assigned Inspections'), findsWidgets);
    
    // Navigate to Sync Center
    await tester.tap(find.byIcon(Icons.sync));
    await tester.pumpAndSettle();
    expect(find.text('Sync Center'), findsWidgets);
  });
}
