import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_filex/open_filex.dart';
import 'theme/app_theme.dart';
import 'screens/home_screen.dart';
import 'screens/catalog_screen.dart';
import 'screens/ai_law_screen.dart';
import 'screens/ai_chat_screen.dart';
import 'screens/saved_books_screen.dart';
import 'screens/about_screen.dart';

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

  @override
  void initState() {
    super.initState();
    _checkForUpdates();
  }

  Future<void> _checkForUpdates() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      final currentVersion = packageInfo.version;

      final doc = await FirebaseFirestore.instance
          .collection('settings')
          .doc('app_info')
          .get();

      if (doc.exists &&
          doc.data() != null &&
          doc.data()!.containsKey('latestVersion')) {
        final latestVersion = doc['latestVersion'] as String;
        if (latestVersion != currentVersion &&
            latestVersion.compareTo(currentVersion) > 0) {
          if (!mounted) return;
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              title: const Row(
                children: [
                  Icon(Icons.system_update, color: AppTheme.primaryBlue),
                  SizedBox(width: 8),
                  Text(
                    'Yangilanish mavjud!',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              content: Text(
                'Ilovaning yangi versiyasi ($latestVersion) chiqdi. Yangi imkoniyatlardan foydalanish uchun hoziroq yuklab oling.\n\nSizdagi versiya: $currentVersion',
                style: const TextStyle(fontSize: 14, height: 1.4),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text(
                    'KEYINROQ',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  onPressed: () {
                    Navigator.pop(context); // close the update prompt
                    _downloadAndInstall(latestVersion);
                  },
                  child: const Text('YUKLAB OLISH'),
                ),
              ],
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('Update check failed: $e');
    }
  }

  Future<void> _downloadAndInstall(String latestVersion) async {
    final progressNotifier = ValueNotifier<double>(0.0);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Ilova yuklanmoqda...',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        content: ValueListenableBuilder<double>(
          valueListenable: progressNotifier,
          builder: (context, value, child) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                LinearProgressIndicator(
                  value: value,
                  backgroundColor: Colors.grey[200],
                  valueColor: const AlwaysStoppedAnimation<Color>(
                    AppTheme.primaryBlue,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  '${(value * 100).toStringAsFixed(1)} %',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            );
          },
        ),
      ),
    );

    try {
      final dio = Dio();
      final tempDir = await getTemporaryDirectory();
      final filePath = '${tempDir.path}/app-release-$latestVersion.apk';

      await dio.download(
        'https://github.com/surslofficial-pixel/yuridik-kutubxona/releases/latest/download/app-release.apk',
        filePath,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            progressNotifier.value = received / total;
          }
        },
      );

      if (mounted) {
        Navigator.pop(context); // close progress dialog
      }
      await OpenFilex.open(filePath);
    } catch (e) {
      if (mounted) Navigator.pop(context);
      debugPrint('Download error: $e');
    }
  }

  final _pages = const [
    HomeScreen(),
    CatalogScreen(),
    AiLawScreen(),
    const AiChatScreen(),
    const SavedBooksScreen(),
    const AboutScreen(),
  ];

  final _titles = const [
    'Bosh sahifa',
    'Katalog',
    'AI & Huquq',
    'AI Kutubxonachi',
    'Saqlanganlar',
    'Dastur haqida',
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
                _navItem(
                  5,
                  Icons.info_outline,
                  Icons.info,
                  'Haqida',
                  const Color(0xFF6366F1),
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
