import 'package:flutter/material.dart';
import '../models/book.dart';
import '../models/category.dart';
import '../services/firebase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/book_card.dart';
import '../widgets/category_card.dart';
import '../widgets/smooth_page_route.dart';
import 'book_details_screen.dart';
import 'category_screen.dart';

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  final _firebase = FirebaseService();
  String _searchQuery = '';
  String? _selectedCategory;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Category>>(
      stream: _firebase.categoriesStream,
      builder: (context, catSnap) {
        return StreamBuilder<List<Book>>(
          stream: _firebase.booksStream,
          builder: (context, bookSnap) {
            final categories = catSnap.data ?? [];
            final books = bookSnap.data ?? [];

            final filteredBooks = books.where((b) {
              final matchSearch =
                  _searchQuery.isEmpty ||
                  b.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                  b.author.toLowerCase().contains(_searchQuery.toLowerCase());
              final matchCategory =
                  _selectedCategory == null ||
                  b.categorySlug == _selectedCategory;
              return matchSearch && matchCategory;
            }).toList();

            return Scaffold(
              backgroundColor: AppTheme.surfaceLight,
              body: SafeArea(
                child: RefreshIndicator(
                  color: AppTheme.primaryBlue,
                  backgroundColor: Colors.white,
                  onRefresh: () async {
                    await Future.delayed(const Duration(milliseconds: 1200));
                  },
                  child: CustomScrollView(
                    slivers: [
                      // Header
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Kitoblar katalogi',
                                style: TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                "Barcha mavjud kitoblarni ko'ring, qidiring va o'qing.",
                                style: TextStyle(
                                  fontSize: 14,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                              const SizedBox(height: 16),
                              // Search bar
                              TextField(
                                onChanged: (v) =>
                                    setState(() => _searchQuery = v),
                                decoration: InputDecoration(
                                  hintText:
                                      "Kitob nomi yoki muallif bo'yicha qidirish...",
                                  hintStyle: const TextStyle(fontSize: 14),
                                  prefixIcon: const Icon(
                                    Icons.search,
                                    color: AppTheme.textTertiary,
                                  ),
                                  filled: true,
                                  fillColor: Colors.white,
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(16),
                                    borderSide: const BorderSide(
                                      color: AppTheme.borderLight,
                                    ),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(16),
                                    borderSide: const BorderSide(
                                      color: AppTheme.borderLight,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      // Category filter chips
                      SliverToBoxAdapter(
                        child: SizedBox(
                          height: 42,
                          child: ListView(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            children: [
                              _filterChip('Barchasi', null),
                              const SizedBox(width: 8),
                              ...categories.map((c) {
                                return Padding(
                                  padding: const EdgeInsets.only(right: 8),
                                  child: _filterChip(c.name, c.slug),
                                );
                              }),
                            ],
                          ),
                        ),
                      ),

                      const SliverToBoxAdapter(child: SizedBox(height: 16)),

                      // Books grid
                      if (filteredBooks.isEmpty)
                        SliverToBoxAdapter(
                          child: Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 60),
                              child: Column(
                                children: [
                                  Icon(
                                    Icons.menu_book_outlined,
                                    size: 64,
                                    color: Colors.grey[300],
                                  ),
                                  const SizedBox(height: 16),
                                  const Text(
                                    'Kitob topilmadi',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.textSecondary,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  const Text(
                                    "Boshqa kalit so'z bilan qidiring.",
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppTheme.textTertiary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        )
                      else
                        SliverPadding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          sliver: SliverGrid(
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  mainAxisSpacing: 12,
                                  crossAxisSpacing: 12,
                                  childAspectRatio: 0.48,
                                ),
                            delegate: SliverChildBuilderDelegate((context, i) {
                              final book = filteredBooks[i];
                              final catGroup = categories
                                  .where((c) => c.slug == book.categorySlug)
                                  .firstOrNull
                                  ?.group;
                              final isAudio = catGroup == 'audio';
                              return BookCard(
                                book: book,
                                isAudio: isAudio,
                                onTap: isAudio
                                    ? null
                                    : () => Navigator.push(
                                        context,
                                        SmoothPageRoute(
                                          builder: (_) => BookDetailsScreen(
                                            bookId: book.id,
                                          ),
                                        ),
                                      ),
                              );
                            }, childCount: filteredBooks.length),
                          ),
                        ),
                      const SliverToBoxAdapter(child: SizedBox(height: 24)),

                      // Categories sections
                      _categorySectionSliver(
                        'Maxsus fanlar darsliklari',
                        categories.where((c) => c.group == 'maxsus').toList(),
                        books,
                      ),
                      _categorySectionSliver(
                        "Umumta'lim fanlari",
                        categories
                            .where((c) => c.group == 'umumtalim')
                            .toList(),
                        books,
                      ),
                      _categorySectionSliver(
                        'Badiiy adabiyotlar',
                        categories.where((c) => c.group == 'badiiy').toList(),
                        books,
                      ),
                      _categorySectionSliver(
                        'Audio kitoblar',
                        categories.where((c) => c.group == 'audio').toList(),
                        books,
                      ),

                      const SliverToBoxAdapter(child: SizedBox(height: 40)),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _filterChip(String label, String? slug) {
    final isSelected = _selectedCategory == slug;
    return GestureDetector(
      onTap: () => setState(() => _selectedCategory = slug),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryDark : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppTheme.primaryDark : AppTheme.borderLight,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _categorySectionSliver(
    String title,
    List<Category> cats,
    List<Book> allBooks,
  ) {
    if (cats.isEmpty) return const SliverToBoxAdapter(child: SizedBox.shrink());

    return SliverToBoxAdapter(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
          ),
          SizedBox(
            height: 120,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: cats.length,
              separatorBuilder: (_, _) => const SizedBox(width: 10),
              itemBuilder: (context, i) {
                final cat = cats[i];
                final count = allBooks
                    .where((b) => b.categorySlug == cat.slug)
                    .length;
                return SizedBox(
                  width: 110,
                  child: CategoryCard(
                    name: cat.name,
                    iconName: cat.iconName,
                    slug: cat.slug,
                    bookCount: count,
                    onTap: () => Navigator.push(
                      context,
                      SmoothPageRoute(
                        builder: (_) => CategoryScreen(
                          slug: cat.slug,
                          categoryName: cat.name,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
