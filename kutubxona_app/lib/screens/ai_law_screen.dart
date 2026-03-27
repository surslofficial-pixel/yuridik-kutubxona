import 'package:flutter/material.dart';
import '../models/ai_topic.dart';
import '../models/book.dart';
import '../services/firebase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/book_card.dart';
import 'book_details_screen.dart';

class AiLawScreen extends StatefulWidget {
  const AiLawScreen({super.key});

  @override
  State<AiLawScreen> createState() => _AiLawScreenState();
}

class _AiLawScreenState extends State<AiLawScreen> {
  final _firebase = FirebaseService();
  AiTopic? _activeTopic;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<AiTopic>>(
      stream: _firebase.aiTopicsStream,
      builder: (context, topicSnap) {
        return StreamBuilder<List<Book>>(
          stream: _firebase.booksStream,
          builder: (context, bookSnap) {
            final topics = topicSnap.data ?? [];
            final books = bookSnap.data ?? [];

            if (_activeTopic != null) {
              return _buildTopicDetail(context, _activeTopic!, books);
            }

            return ListView(
              padding: const EdgeInsets.only(bottom: 32),
              children: [
                // Hero
                _buildHero(),
                const SizedBox(height: 24),

                // Section title
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    children: [
                      Text(
                        "O'rganish yo'nalishlari",
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.textPrimary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 6),
                      Text(
                        "Raqamli asr huquqshunosi bo'lish uchun zarur bo'lgan bilimlar.",
                        style: TextStyle(
                          fontSize: 14,
                          color: AppTheme.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Topics grid
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    children: topics.map((topic) {
                      final topicBooks = books
                          .where((b) => b.categorySlug == 'ai-${topic.id}')
                          .toList();
                      return _buildTopicCard(context, topic, topicBooks.length);
                    }).toList(),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildHero() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              colors: [Colors.white, Color(0xFF94A3B8)],
            ).createShader(bounds),
            child: const Text(
              'AI & Huquq',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                height: 1.1,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            "Kelajak huquqshunosligi. Sun'iy intellekt va raqamli texnologiyalar huquqi.",
            style: TextStyle(
              fontSize: 13,
              color: Colors.white.withValues(alpha: 0.7),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopicCard(BuildContext context, AiTopic topic, int bookCount) {
    final gradient = AppTheme.getAiTopicGradient(topic.color);
    final icon = AppTheme.getCategoryIcon(topic.iconName);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: () => setState(() => _activeTopic = topic),
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppTheme.borderLight),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: gradient),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(icon, size: 22, color: Colors.white),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      topic.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                topic.description,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppTheme.textSecondary,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.only(top: 12),
                decoration: const BoxDecoration(
                  border: Border(top: BorderSide(color: AppTheme.borderLight)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.menu_book,
                          size: 14,
                          color: Color(0xFF22C55E),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '$bookCount ta kitob',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF22C55E),
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Text(
                          "O'qish",
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: gradient[0],
                          ),
                        ),
                        Icon(Icons.chevron_right, size: 18, color: gradient[0]),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopicDetail(
    BuildContext context,
    AiTopic topic,
    List<Book> allBooks,
  ) {
    final topicBooks = allBooks
        .where((b) => b.categorySlug == 'ai-${topic.id}')
        .toList();
    final gradient = AppTheme.getAiTopicGradient(topic.color);
    final icon = AppTheme.getCategoryIcon(topic.iconName);

    return ListView(
      padding: const EdgeInsets.only(bottom: 32),
      children: [
        // Back + header
        Padding(
          padding: const EdgeInsets.fromLTRB(8, 8, 16, 0),
          child: Row(
            children: [
              IconButton(
                onPressed: () => setState(() => _activeTopic = null),
                icon: const Icon(Icons.arrow_back),
              ),
              const Text(
                "Barcha yo'nalishlar",
                style: TextStyle(fontSize: 14, color: AppTheme.textSecondary),
              ),
            ],
          ),
        ),
        Container(
          margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: gradient),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: gradient[0].withValues(alpha: 0.3),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, size: 28, color: Colors.white),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      topic.title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      topic.description,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withValues(alpha: 0.8),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Mavjud kitoblar (${topicBooks.length} ta)',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
            ),
          ),
        ),
        const SizedBox(height: 12),

        if (topicBooks.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 40),
            child: Column(
              children: [
                Icon(
                  Icons.menu_book_outlined,
                  size: 48,
                  color: Colors.grey[300],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Hali kitoblar yuklanmagan',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          )
        else
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.58,
              ),
              itemCount: topicBooks.length,
              itemBuilder: (context, i) {
                final book = topicBooks[i];
                return BookCard(
                  book: book,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BookDetailsScreen(bookId: book.id),
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}
