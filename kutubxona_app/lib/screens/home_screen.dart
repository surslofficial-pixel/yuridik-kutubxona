import 'dart:async';
import 'package:flutter/material.dart';
import '../models/book.dart';
import '../models/category.dart';
import '../services/firebase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/book_card.dart';
import '../widgets/category_card.dart';
import '../widgets/smooth_page_route.dart';
import 'category_screen.dart';
import 'catalog_screen.dart';
import 'book_details_screen.dart';
import 'admin/admin_login_screen.dart';
import 'package:url_launcher/url_launcher.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with AutomaticKeepAliveClientMixin {
  final _firebase = FirebaseService();

  // Proper subscription tracking for memory leak prevention
  StreamSubscription? _catsSub;
  StreamSubscription? _booksSub;

  List<Category> _categories = [];
  List<Book> _books = [];

  // Pre-computed data (avoid recomputing in build())
  Map<String, int> _bookCountBySlug = {};
  List<Category> _mainCats = [];
  List<Category> _umumtalimCats = [];
  List<Category> _badiiyCats = [];
  List<Category> _audioCats = [];
  List<Book> _badiiyBooks = [];
  List<Book> _audioBooks = [];
  List<Book> _recentFour = [];

  bool get _isLoading => _categories.isEmpty && _books.isEmpty;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _catsSub = _firebase.categoriesStream.listen((cats) {
      if (mounted) {
        _categories = cats;
        _recompute();
      }
    });
    _booksSub = _firebase.booksStream.listen((books) {
      if (mounted) {
        _books = books;
        _recompute();
      }
    });
  }

  /// Pre-compute all derived lists ONCE per data change, not per build().
  void _recompute() {
    final categories = _categories;
    final books = _books;

    // Book count cache
    final countMap = <String, int>{};
    for (final b in books) {
      countMap[b.categorySlug] = (countMap[b.categorySlug] ?? 0) + 1;
    }
    _bookCountBySlug = countMap;

    // Category groups
    _mainCats = categories.where((c) => c.group == 'maxsus').toList();
    _umumtalimCats = categories.where((c) => c.group == 'umumtalim').toList();
    _badiiyCats = categories.where((c) => c.group == 'badiiy').toList();
    _audioCats = categories.where((c) => c.group == 'audio').toList();

    // Badiiy books
    final badiiySlugs = _badiiyCats.map((c) => c.slug).toSet();
    _badiiyBooks = books
        .where((b) => badiiySlugs.contains(b.categorySlug))
        .take(4)
        .toList();

    // Audio books
    final audioSlugs = _audioCats.map((c) => c.slug).toSet();
    _audioBooks = books
        .where((b) => audioSlugs.contains(b.categorySlug))
        .take(4)
        .toList();

    // Recent books (sorted once, not in build)
    final sorted = List<Book>.from(books)
      ..sort((a, b) {
        final da = a.date != null
            ? DateTime.tryParse(a.date!)?.millisecondsSinceEpoch ?? 0
            : 0;
        final db = b.date != null
            ? DateTime.tryParse(b.date!)?.millisecondsSinceEpoch ?? 0
            : 0;
        return db.compareTo(da);
      });
    _recentFour = sorted.take(4).toList();

    setState(() {});
  }

  @override
  void dispose() {
    _catsSub?.cancel();
    _booksSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppTheme.primaryDark),
            SizedBox(height: 16),
            Text(
              'Iltimos kuting, yuklanmoqda...',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: AppTheme.primaryBlue,
      backgroundColor: Colors.white,
      onRefresh: () async {
        await Future.delayed(const Duration(milliseconds: 1200));
      },
      child: ListView(
        padding: const EdgeInsets.only(bottom: 32),
        children: [
          _buildHero(context),
          const SizedBox(height: 24),

          if (_mainCats.isNotEmpty) ...[
            _sectionHeader(
              context,
              'Maxsus fanlar darsliklari',
              onSeeAll: () => _openCatalog(context),
            ),
            _buildCategoryGrid(context, _mainCats),
            const SizedBox(height: 24),
          ],

          if (_umumtalimCats.isNotEmpty) ...[
            _sectionHeader(context, "Umumta'lim fanlari"),
            _buildCategoryGrid(context, _umumtalimCats),
            const SizedBox(height: 24),
          ],

          if (_badiiyCats.isNotEmpty) ...[
            _sectionHeader(context, 'Badiiy adabiyotlar'),
            _buildCategoryGrid(context, _badiiyCats),
            const SizedBox(height: 24),
          ],

          if (_audioCats.isNotEmpty) ...[
            _sectionHeader(context, 'Audio Darslik'),
            _buildCategoryGrid(context, _audioCats),
            const SizedBox(height: 24),
          ],

          if (_badiiyBooks.isNotEmpty) ...[
            _sectionHeader(
              context,
              'Badiiy kitoblar',
              onSeeAll: () => _openCatalog(context),
            ),
            _buildBookGrid(context, _badiiyBooks),
            const SizedBox(height: 24),
          ],

          if (_audioBooks.isNotEmpty) ...[
            _sectionHeader(
              context,
              '🎵 Audio Darslik',
              onSeeAll: () => _openCatalog(context),
            ),
            _buildBookGrid(context, _audioBooks, isAudio: true),
            const SizedBox(height: 24),
          ],

          if (_recentFour.isNotEmpty) ...[
            _sectionHeader(
              context,
              "Yangi qo'shilgan kitoblar",
              onSeeAll: () => _openCatalog(context),
            ),
            _buildBookGrid(context, _recentFour),
          ],
        ],
      ),
    );
  }

  Widget _buildHero(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E3A8A), Color(0xFF3B82F6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E3A8A).withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GestureDetector(
            onLongPress: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AdminLoginScreen()),
              );
            },
            child: const Text(
              "Surxondaryo Yuridik Texnikumi Kutubxonasi",
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w800,
                height: 1.2,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Surxondaryo yuridik texnikumi talabalari uchun maxsus ishlab chiqilgan zamonaviy kitoblar bazasi.',
            style: TextStyle(
              fontSize: 13,
              color: Colors.white.withValues(alpha: 0.85),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              ElevatedButton(
                onPressed: () {
                  final url = Uri.parse('https://sursl.uz/');
                  launchUrl(url, mode: LaunchMode.externalApplication);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFF1E3A8A),
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 10,
                  ),
                ),
                child: const Text(
                  'Rasmiy veb-sayt',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(
    BuildContext context,
    String title, {
    VoidCallback? onSeeAll,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
          ),
          if (onSeeAll != null)
            TextButton(
              onPressed: onSeeAll,
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "Barchasini ko'rish",
                    style: TextStyle(fontSize: 13, color: AppTheme.primaryBlue),
                  ),
                  SizedBox(width: 2),
                  Icon(
                    Icons.chevron_right,
                    size: 18,
                    color: AppTheme.primaryBlue,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCategoryGrid(BuildContext context, List<Category> cats) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.3,
        ),
        itemCount: cats.length,
        itemBuilder: (context, i) {
          final cat = cats[i];
          // Use pre-computed book count map instead of O(n) scan
          final count = _bookCountBySlug[cat.slug] ?? 0;
          return CategoryCard(
            name: cat.name,
            iconName: cat.iconName,
            slug: cat.slug,
            bookCount: count,
            onTap: () => Navigator.push(
              context,
              SmoothPageRoute(
                builder: (_) =>
                    CategoryScreen(slug: cat.slug, categoryName: cat.name),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBookGrid(
    BuildContext context,
    List<Book> books, {
    bool isAudio = false,
  }) {
    final displayBooks = books.take(4).toList();
    if (displayBooks.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.48,
        ),
        itemCount: displayBooks.length,
        itemBuilder: (context, i) {
          final book = displayBooks[i];
          final catGroup = _categories
              .where((c) => c.slug == book.categorySlug)
              .firstOrNull
              ?.group;
          final bookIsAudio = isAudio || catGroup == 'audio';
          return BookCard(
            book: book,
            isAudio: bookIsAudio,
            onTap: () => Navigator.push(
              context,
              SmoothPageRoute(
                builder: (_) => BookDetailsScreen(bookId: book.id),
              ),
            ),
          );
        },
      ),
    );
  }

  void _openCatalog(BuildContext context) {
    Navigator.push(
      context,
      SmoothPageRoute(builder: (_) => const CatalogScreen()),
    );
  }
}
