import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/book.dart';
import '../models/category.dart';
import '../services/firebase_service.dart';
import '../services/bookmark_service.dart';
import '../theme/app_theme.dart';
import '../widgets/reader_form_dialog.dart';
import '../widgets/smooth_page_route.dart';
import '../widgets/base64_image.dart';
import '../services/app_cache_manager.dart';
import 'reader_screen.dart';

class BookDetailsScreen extends StatefulWidget {
  final String bookId;

  const BookDetailsScreen({super.key, required this.bookId});

  @override
  State<BookDetailsScreen> createState() => _BookDetailsScreenState();
}

class _BookDetailsScreenState extends State<BookDetailsScreen> {
  final _firebase = FirebaseService();
  final _bookmarkService = BookmarkService();
  bool _isBookmarked = false;
  bool _hasRated = false;
  int _selectedRating = 0;

  StreamSubscription? _catsSub;
  StreamSubscription? _booksSub;

  List<Category> _categories = [];
  List<Book> _books = [];

  @override
  void initState() {
    super.initState();
    _checkBookmark();
    _checkIfRated();
    _catsSub = _firebase.categoriesStream.listen((cats) {
      if (mounted) setState(() => _categories = cats);
    });
    _booksSub = _firebase.booksStream.listen((books) {
      if (mounted) setState(() => _books = books);
    });
  }

  @override
  void dispose() {
    _catsSub?.cancel();
    _booksSub?.cancel();
    super.dispose();
  }

  Future<void> _checkBookmark() async {
    final result = await _bookmarkService.isBookmarked(widget.bookId);
    if (mounted) setState(() => _isBookmarked = result);
  }

  void _openReader(Book book, bool isAudio) {
    showDialog(
      context: context,
      builder: (_) => ReaderFormDialog(
        bookId: book.id,
        isAudio: isAudio,
        onConfirm: (firstName, lastName, groupName) {
          Navigator.pop(context); // close dialog
          _firebase.addReadingSession(
            firstName: firstName,
            lastName: lastName,
            groupName: groupName,
            bookId: book.id,
          );
          Navigator.push(
            context,
            SmoothPageRoute(
              builder: (_) => ReaderScreen(
                book: book,
                firstName: firstName,
                lastName: lastName,
                groupName: groupName,
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final categories = _categories;
    final books = _books;
    final book = books
        .where((b) => b.id.toString() == widget.bookId)
        .firstOrNull;

    return Scaffold(
      backgroundColor: AppTheme.surfaceLight,
      body: book == null
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.primaryDark),
            )
          : _buildContent(context, book, categories),
    );
  }

  Widget _buildContent(
    BuildContext context,
    Book book,
    List<Category> categories,
  ) {
    final catGroup = categories
        .where((c) => c.name == book.category)
        .firstOrNull
        ?.group;
    final isAudio = catGroup == 'audio' || book.category == 'Audio Darslik';

    return CustomScrollView(
      slivers: [
        // AppBar with cover
        SliverAppBar(
          expandedHeight: 350,
          pinned: true,
          backgroundColor: AppTheme.primaryDark,
          leading: IconButton(
            icon: const CircleAvatar(
              backgroundColor: Colors.black26,
              child: Icon(Icons.arrow_back, color: Colors.white, size: 20),
            ),
            onPressed: () => Navigator.pop(context),
          ),
          flexibleSpace: FlexibleSpaceBar(
            background: Stack(
              fit: StackFit.expand,
              children: [
                book.cover.startsWith('data:image')
                    ? Base64Image(
                        base64String: book.cover,
                        fit: BoxFit.cover,
                        errorWidget: Container(
                          color: Colors.grey[200],
                          child: const Icon(
                            Icons.broken_image,
                            size: 60,
                            color: Colors.grey,
                          ),
                        ),
                      )
                    : CachedNetworkImage(
                        cacheManager: AppCacheManager.instance,
                        imageUrl: book.cover,
                        fit: BoxFit.cover,
                        errorWidget: (_, _, _) => Container(
                          color: Colors.grey[200],
                          child: const Icon(
                            Icons.broken_image,
                            size: 60,
                            color: Colors.grey,
                          ),
                        ),
                      ),
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.7),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Book info
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: isAudio
                        ? const Color(0xFFF3E8FF)
                        : const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isAudio)
                        const Padding(
                          padding: EdgeInsets.only(right: 4),
                          child: Icon(
                            Icons.headphones,
                            size: 14,
                            color: Color(0xFF7C3AED),
                          ),
                        ),
                      Text(
                        book.category,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isAudio
                              ? const Color(0xFF7C3AED)
                              : const Color(0xFF1D4ED8),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Title
                Text(
                  book.title,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textPrimary,
                    height: 1.2,
                  ),
                ),

                if (book.author.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      book.author,
                      style: const TextStyle(
                        fontSize: 16,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ),

                // Rating bar
                const SizedBox(height: 16),
                _buildRatingSection(book),

                const SizedBox(height: 20),

                // Action buttons
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _openReader(book, isAudio),
                        icon: Icon(
                          isAudio ? Icons.headphones : Icons.menu_book_outlined,
                          size: 18,
                        ),
                        label: Text(isAudio ? 'Eshitish' : "O'qish"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isAudio
                              ? const Color(0xFF7C3AED)
                              : AppTheme.primaryDark,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    OutlinedButton.icon(
                      onPressed: () async {
                        await _bookmarkService.toggleBookmark(book);
                        _checkBookmark();
                      },
                      icon: Icon(
                        _isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                        size: 18,
                        color: _isBookmarked ? const Color(0xFFEAB308) : null,
                      ),
                      label: Text(_isBookmarked ? 'Saqlangan' : 'Saqlash'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          vertical: 14,
                          horizontal: 16,
                        ),
                        side: BorderSide(
                          color: _isBookmarked
                              ? const Color(0xFFEAB308)
                              : AppTheme.borderLight,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  ],
                ),

                // Info cards (non-audio only)
                if (!isAudio) ...[
                  const SizedBox(height: 24),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    childAspectRatio: 2.2,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    children: [
                      _infoCard(
                        'Nashr yili',
                        book.year?.toString() ?? "Ma'lum emas",
                      ),
                      _infoCard('Fayl hajmi', book.size ?? "Ma'lum emas"),
                      _infoCard('Format', book.format ?? 'PDF'),
                      _infoCard('Til', book.language ?? "O'zbek"),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _infoCard(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _checkIfRated() async {
    final rated = await _firebase.hasRatedBook(widget.bookId);
    if (mounted) setState(() => _hasRated = rated);
  }

  Widget _buildRatingSection(Book book) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(
                Icons.star_rounded,
                color: Color(0xFFF59E0B),
                size: 28,
              ),
              const SizedBox(width: 8),
              Text(
                book.rating > 0 ? book.rating.toStringAsFixed(1) : '—',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF92400E),
                ),
              ),
              const SizedBox(width: 6),
              Text(
                '(${book.ratingCount} baho)',
                style: const TextStyle(fontSize: 13, color: Color(0xFFB45309)),
              ),
              const Spacer(),
              if (_hasRated)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.check_circle,
                        size: 14,
                        color: Color(0xFF059669),
                      ),
                      SizedBox(width: 4),
                      Text(
                        'Baholangan',
                        style: TextStyle(
                          fontSize: 11,
                          color: Color(0xFF059669),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          if (!_hasRated) ...[
            const SizedBox(height: 12),
            const Text(
              'Bu kitobni baholang:',
              style: TextStyle(fontSize: 13, color: Color(0xFF92400E)),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                final starIndex = index + 1;
                return GestureDetector(
                  onTap: () async {
                    setState(() => _selectedRating = starIndex);
                    await _firebase.rateBook(widget.bookId, starIndex);
                    if (mounted) {
                      setState(() => _hasRated = true);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Rahmat! Bahoyingiz qabul qilindi ⭐'),
                          backgroundColor: Color(0xFF059669),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    }
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    child: Icon(
                      starIndex <= _selectedRating
                          ? Icons.star_rounded
                          : Icons.star_outline_rounded,
                      color: const Color(0xFFF59E0B),
                      size: 40,
                    ),
                  ),
                );
              }),
            ),
          ],
        ],
      ),
    );
  }
}
