import 'dart:async';
import 'package:flutter/material.dart';
import '../models/book.dart';
import '../models/category.dart';
import '../services/firebase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/book_card.dart';
import '../widgets/smooth_page_route.dart';
import 'book_details_screen.dart';

class CategoryScreen extends StatefulWidget {
  final String slug;
  final String categoryName;

  const CategoryScreen({
    super.key,
    required this.slug,
    required this.categoryName,
  });

  @override
  State<CategoryScreen> createState() => _CategoryScreenState();
}

class _CategoryScreenState extends State<CategoryScreen> {
  final _firebase = FirebaseService();
  StreamSubscription? _catsSub;
  StreamSubscription? _booksSub;
  List<Category> _categories = [];
  List<Book> _allBooks = [];

  @override
  void initState() {
    super.initState();
    _catsSub = _firebase.categoriesStream.listen((cats) {
      if (mounted) setState(() => _categories = cats);
    });
    _booksSub = _firebase.booksStream.listen((books) {
      if (mounted) setState(() => _allBooks = books);
    });
  }

  @override
  void dispose() {
    _catsSub?.cancel();
    _booksSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final category = _categories
        .where((c) => c.slug == widget.slug)
        .firstOrNull;
    final books = _allBooks
        .where((b) => b.categorySlug == widget.slug)
        .toList();
    final isAudioCategory = category?.group == 'audio';

    return Scaffold(
      backgroundColor: AppTheme.surfaceLight,
      appBar: AppBar(
        title: Text(widget.categoryName),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _allBooks.isEmpty
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.primaryDark),
            )
          : books.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.search_off,
                        size: 40,
                        color: Colors.grey[400],
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Kitoblar topilmadi',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      "Hozircha bu yo'nalishda kitoblar mavjud emas.",
                      style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            )
          : CustomScrollView(
              slivers: [
                // Category header
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        if (category != null)
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: AppTheme.getCategoryBgColor(widget.slug),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Icon(
                              AppTheme.getCategoryIcon(category.iconName),
                              size: 28,
                              color: AppTheme.getCategoryColor(widget.slug),
                            ),
                          ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.categoryName,
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              Text(
                                '${books.length} ta kitob mavjud',
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Books grid
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
                      final book = books[i];
                      return BookCard(
                        book: book,
                        isAudio: isAudioCategory,
                        onTap: () => Navigator.push(
                          context,
                          SmoothPageRoute(
                            builder: (_) => BookDetailsScreen(bookId: book.id),
                          ),
                        ),
                      );
                    }, childCount: books.length),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 40)),
              ],
            ),
    );
  }
}
