import 'package:flutter/material.dart';
import '../../../models/book.dart';
import '../../../services/firebase_service.dart';
import '../../../theme/app_theme.dart';

class AdminOverviewTab extends StatelessWidget {
  AdminOverviewTab({super.key});

  final FirebaseService _fb = FirebaseService();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E3A8A), Color(0xFF3B82F6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '👋 Xush kelibsiz, Admin!',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Kutubxona boshqaruvini bu yerdan nazorat qiling',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.8),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Real-time downloads count
          _buildDownloadsCounter(),
          const SizedBox(height: 24),

          // Stats grid
          _buildStatsGrid(),
          const SizedBox(height: 24),

          // Active readers
          _buildSectionHeader(
            Icons.people_rounded,
            Colors.green,
            'Hozir o\'qiyotganlar',
          ),
          const SizedBox(height: 12),
          _buildActiveReaders(),
          const SizedBox(height: 24),

          // Top books
          _buildSectionHeader(
            Icons.trending_up_rounded,
            Colors.orange,
            'Eng ko\'p o\'qilgan kitoblar',
          ),
          const SizedBox(height: 12),
          _buildTopBooks(),
          const SizedBox(height: 24),

          // Top authors
          _buildSectionHeader(
            Icons.star_rounded,
            Colors.amber.shade600,
            'Top Mualliflar',
          ),
          const SizedBox(height: 12),
          _buildTopAuthors(),
          const SizedBox(height: 24),

          // Recent sessions
          _buildSectionHeader(
            Icons.history_rounded,
            AppTheme.primaryDark,
            'So\'nggi sessiyalar',
          ),
          const SizedBox(height: 12),
          _buildRecentSessions(),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(IconData icon, Color color, String title) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildDownloadsCounter() {
    return StreamBuilder<int>(
      stream: _fb.downloadsCountStream,
      builder: (context, snapshot) {
        final count = snapshot.data ?? 0;
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF8B5CF6), Color(0xFFC084FC)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF8B5CF6).withValues(alpha: 0.3),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.download_rounded,
                  color: Colors.white,
                  size: 32,
                ),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Ilovani yuklab olganlar',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$count nafar',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatsGrid() {
    return Row(
      children: [
        Expanded(
          child: _buildGradientStatCard(
            'Kitoblar',
            Icons.menu_book_rounded,
            _fb.booksStream,
            const [Color(0xFF2563EB), Color(0xFF60A5FA)],
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildGradientStatCard(
            'Kategoriyalar',
            Icons.category_rounded,
            _fb.categoriesStream,
            const [Color(0xFF10B981), Color(0xFF34D399)],
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildGradientStatCard(
            'AI Mavzu',
            Icons.smart_toy_rounded,
            _fb.aiTopicsStream,
            const [Color(0xFF8B5CF6), Color(0xFFA78BFA)],
          ),
        ),
      ],
    );
  }

  Widget _buildGradientStatCard<T>(
    String title,
    IconData icon,
    Stream<List<T>> stream,
    List<Color> gradientColors,
  ) {
    return StreamBuilder<List<T>>(
      stream: stream,
      builder: (context, snapshot) {
        final count = snapshot.data?.length ?? 0;
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: gradientColors,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: gradientColors.first.withValues(alpha: 0.3),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              Icon(icon, size: 28, color: Colors.white.withValues(alpha: 0.9)),
              const SizedBox(height: 8),
              Text(
                '$count',
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                title,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Colors.white.withValues(alpha: 0.85),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildActiveReaders() {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: _fb.activeReadersStreamAdmin,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(color: AppTheme.primaryDark),
          );
        }
        final readers = snapshot.data ?? [];
        final threeMinAgo =
            DateTime.now().millisecondsSinceEpoch - (3 * 60 * 1000);
        final active = readers
            .where((r) => r['timestamp'] > threeMinAgo)
            .toList();

        if (active.isEmpty) {
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.borderLight),
            ),
            child: Column(
              children: [
                Icon(
                  Icons.person_off_rounded,
                  size: 44,
                  color: Colors.grey.shade300,
                ),
                const SizedBox(height: 8),
                Text(
                  'Hozir hech kim o\'qimayapti',
                  style: TextStyle(
                    color: Colors.grey.shade400,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          );
        }

        return Column(
          children: active.map((r) {
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.green.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.menu_book_rounded,
                      color: Colors.green,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${r['firstName']} ${r['lastName']}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          r['groupName'] ?? '',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.circle, size: 8, color: Colors.green),
                        SizedBox(width: 4),
                        Text(
                          'Faol',
                          style: TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildRecentSessions() {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: _fb.readingSessionsStream,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(color: AppTheme.primaryDark),
          );
        }
        final sessions = snapshot.data ?? [];
        final recent = sessions.take(10).toList();

        if (recent.isEmpty) {
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.borderLight),
            ),
            child: Text(
              'Hozircha sessiya yo\'q',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade400),
            ),
          );
        }

        return Column(
          children: recent.map((s) {
            final dt = DateTime.fromMillisecondsSinceEpoch(s['timestamp'] ?? 0);
            return Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.borderLight),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryDark.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.access_time_rounded,
                      color: AppTheme.primaryDark,
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${s['firstName']} ${s['lastName']}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          s['groupName'] ?? '',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppTheme.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '${dt.day}/${dt.month} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}',
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppTheme.textTertiary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildTopBooks() {
    return StreamBuilder<List<Book>>(
      stream: _fb.booksStream,
      builder: (context, snapshot) {
        if (!snapshot.hasData)
          return const Center(
            child: CircularProgressIndicator(color: AppTheme.primaryDark),
          );
        final books = List<Book>.from(snapshot.data!);
        books.sort((a, b) => b.viewCount.compareTo(a.viewCount));
        final topBooks = books.take(5).toList();

        if (topBooks.isEmpty || topBooks.first.viewCount == 0) {
          return const Text(
            'Hali o\'qilgan kitoblar yo\'q',
            style: TextStyle(color: Colors.grey),
          );
        }

        return Column(
          children: topBooks
              .where((b) => b.viewCount > 0)
              .map(
                (b) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderLight),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.auto_graph_rounded,
                        color: Colors.orange,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          b.title,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.orange.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${b.viewCount} marta',
                          style: const TextStyle(
                            color: Colors.orange,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              )
              .toList(),
        );
      },
    );
  }

  Widget _buildTopAuthors() {
    return StreamBuilder<List<Book>>(
      stream: _fb.booksStream,
      builder: (context, snapshot) {
        if (!snapshot.hasData)
          return const Center(
            child: CircularProgressIndicator(color: AppTheme.primaryDark),
          );
        final books = snapshot.data!;

        final authorViews = <String, int>{};
        for (var b in books) {
          if (b.author.isNotEmpty) {
            authorViews[b.author] = (authorViews[b.author] ?? 0) + b.viewCount;
          }
        }

        var sortedAuthors = authorViews.entries.toList()
          ..sort((a, b) => b.value.compareTo(a.value));
        final topAuthors = sortedAuthors.take(5).toList();

        if (topAuthors.isEmpty || topAuthors.first.value == 0) {
          return const Text(
            'Hali statistika yo\'q',
            style: TextStyle(color: Colors.grey),
          );
        }

        return Column(
          children: topAuthors
              .where((e) => e.value > 0)
              .map(
                (e) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderLight),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.amber.withValues(alpha: 0.2),
                        child: const Icon(
                          Icons.person_rounded,
                          color: Colors.amber,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          e.key,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                      Text(
                        '${e.value} o\'qish',
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              )
              .toList(),
        );
      },
    );
  }
}
