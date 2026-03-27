import 'package:flutter/material.dart';
import '../models/book.dart';
import '../models/category.dart';
import '../services/firebase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/book_card.dart';
import '../widgets/category_card.dart';
import 'category_screen.dart';
import 'catalog_screen.dart';
import 'book_details_screen.dart';
import 'admin/admin_login_screen.dart';
import 'package:url_launcher/url_launcher.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final firebase = FirebaseService();

    return StreamBuilder<List<Category>>(
      stream: firebase.categoriesStream,
      builder: (context, catSnap) {
        return StreamBuilder<List<Book>>(
          stream: firebase.booksStream,
          builder: (context, bookSnap) {
            final categories = catSnap.data ?? [];
            final books = bookSnap.data ?? [];

            final mainCats = categories
                .where((c) => c.group == 'maxsus')
                .toList();
            final umumtalimCats = categories
                .where((c) => c.group == 'umumtalim')
                .toList();
            final badiiyCats = categories
                .where((c) => c.group == 'badiiy')
                .toList();
            final audioCats = categories
                .where((c) => c.group == 'audio')
                .toList();

            final badiiySlugs = badiiyCats.map((c) => c.slug).toSet();
            final badiiyBooks = books
                .where((b) => badiiySlugs.contains(b.categorySlug))
                .take(4)
                .toList();

            final audioSlugs = audioCats.map((c) => c.slug).toSet();
            final audioBooks = books
                .where((b) => audioSlugs.contains(b.categorySlug))
                .take(4)
                .toList();

            final recentBooks = List<Book>.from(books)
              ..sort((a, b) {
                final da = a.date != null
                    ? DateTime.tryParse(a.date!)?.millisecondsSinceEpoch ?? 0
                    : 0;
                final db = b.date != null
                    ? DateTime.tryParse(b.date!)?.millisecondsSinceEpoch ?? 0
                    : 0;
                return db.compareTo(da);
              });
            final recentFour = recentBooks.take(4).toList();

            if (!catSnap.hasData && !bookSnap.hasData) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
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
                // Firebase streams are real-time, so we just provide satisfying UI feedback
                await Future.delayed(const Duration(milliseconds: 1200));
              },
              child: ListView(
                padding: const EdgeInsets.only(bottom: 32),
                children: [
                  // Hero Section
                  _buildHero(context),
                  const SizedBox(height: 24),

                  // Maxsus fanlar
                  if (mainCats.isNotEmpty) ...[
                    _sectionHeader(
                      context,
                      'Maxsus fanlar darsliklari',
                      onSeeAll: () => _openCatalog(context),
                    ),
                    _buildCategoryGrid(context, mainCats, books),
                    const SizedBox(height: 24),
                  ],

                  // Umumta'lim
                  if (umumtalimCats.isNotEmpty) ...[
                    _sectionHeader(context, "Umumta'lim fanlari"),
                    _buildCategoryGrid(context, umumtalimCats, books),
                    const SizedBox(height: 24),
                  ],

                  // Badiiy
                  if (badiiyCats.isNotEmpty) ...[
                    _sectionHeader(context, 'Badiiy adabiyotlar'),
                    _buildCategoryGrid(context, badiiyCats, books),
                    const SizedBox(height: 24),
                  ],

                  // Audio
                  if (audioCats.isNotEmpty) ...[
                    _sectionHeader(context, 'Audio Darslik'),
                    _buildCategoryGrid(context, audioCats, books),
                    const SizedBox(height: 24),
                  ],

                  // Badiiy kitoblar
                  if (badiiyBooks.isNotEmpty) ...[
                    _sectionHeader(
                      context,
                      'Badiiy kitoblar',
                      onSeeAll: () => _openCatalog(context),
                    ),
                    _buildBookGrid(context, badiiyBooks, categories),
                    const SizedBox(height: 24),
                  ],

                  // Audio kitoblar
                  if (audioBooks.isNotEmpty) ...[
                    _sectionHeader(
                      context,
                      '🎵 Audio Darslik',
                      onSeeAll: () => _openCatalog(context),
                    ),
                    _buildBookGrid(
                      context,
                      audioBooks,
                      categories,
                      isAudio: true,
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Yangi kitoblar
                  if (recentFour.isNotEmpty) ...[
                    _sectionHeader(
                      context,
                      "Yangi qo'shilgan kitoblar",
                      onSeeAll: () => _openCatalog(context),
                    ),
                    _buildBookGrid(context, recentFour, categories),
                  ],
                ],
              ),
            );
          },
        );
      },
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

  Widget _buildCategoryGrid(
    BuildContext context,
    List<Category> cats,
    List<Book> allBooks,
  ) {
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
          final count = allBooks
              .where((b) => b.categorySlug == cat.slug)
              .length;
          return CategoryCard(
            name: cat.name,
            iconName: cat.iconName,
            slug: cat.slug,
            bookCount: count,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
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
    List<Book> books,
    List<Category> categories, {
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
          final catGroup = categories
              .where((c) => c.slug == book.categorySlug)
              .firstOrNull
              ?.group;
          final bookIsAudio = isAudio || catGroup == 'audio';
          return BookCard(
            book: book,
            isAudio: bookIsAudio,
            onTap: bookIsAudio
                ? null
                : () => Navigator.push(
                    context,
                    MaterialPageRoute(
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
      MaterialPageRoute(builder: (_) => const CatalogScreen()),
    );
  }
}
