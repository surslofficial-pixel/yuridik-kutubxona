import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'theme/app_theme.dart';
import 'screens/home_screen.dart';
import 'screens/catalog_screen.dart';
import 'screens/ai_law_screen.dart';
import 'screens/ai_chat_screen.dart';
import 'screens/saved_books_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: const FirebaseOptions(
      apiKey: 'AIzaSyCM09hfTog_9LdnKxDjXpfOwyQpYlEHOaQ',
      appId: '1:1029107483153:web:c9eca152e270f3dc6aa7b0',
      messagingSenderId: '1029107483153',
      projectId: 'surxondaryoyuridikkutubhonasi',
      storageBucket: 'surxondaryoyuridikkutubhonasi.firebasestorage.app',
    ),
  );
  runApp(const KutubxonaApp());
}

class KutubxonaApp extends StatelessWidget {
  const KutubxonaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Surxondaryo Yuridik Texnikumi Kutubxonasi',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MainShell(),
    );
  }
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final _pages = const [
    HomeScreen(),
    CatalogScreen(),
    AiLawScreen(),
    AiChatScreen(),
    SavedBooksScreen(),
  ];

  final _titles = const [
    'Bosh sahifa',
    'Katalog',
    'AI & Huquq',
    'AI Kutubxonachi',
    'Saqlanganlar',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _currentIndex == 3
          ? null
          : AppBar(title: Text(_titles[_currentIndex]), centerTitle: false),
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 12,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _navItem(
                  0,
                  Icons.home_outlined,
                  Icons.home,
                  'Bosh sahifa',
                  const Color(0xFF2563EB),
                ),
                _navItem(
                  1,
                  Icons.local_library_outlined,
                  Icons.local_library,
                  'Katalog',
                  const Color(0xFFF97316),
                ),
                _navItem(
                  2,
                  Icons.menu_book_outlined,
                  Icons.menu_book,
                  'AI & Huquq',
                  const Color(0xFFEF4444),
                ),
                _navItem(
                  3,
                  Icons.auto_awesome_outlined,
                  Icons.auto_awesome,
                  'AI Chat',
                  const Color(0xFF059669),
                ),
                _navItem(
                  4,
                  Icons.bookmark_outline,
                  Icons.bookmark,
                  'Saqlangan',
                  const Color(0xFF8B5CF6),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(
    int index,
    IconData icon,
    IconData activeIcon,
    String label,
    Color color,
  ) {
    final isActive = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: isActive
            ? BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
              )
            : null,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isActive ? activeIcon : icon,
              size: 22,
              color: isActive ? color : AppTheme.textTertiary,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive ? color : AppTheme.textTertiary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
