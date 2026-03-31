import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/book.dart';
import '../theme/app_theme.dart';
import '../services/app_cache_manager.dart';
import 'base64_image.dart';

class BookListTile extends StatelessWidget {
  final Book book;
  final VoidCallback? onTap;
  final bool isAudio;

  const BookListTile({
    super.key,
    required this.book,
    this.onTap,
    this.isAudio = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120, // Strict height for itemExtent optimization
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isAudio
              ? const Color(0xFF10B981).withValues(alpha: 0.3)
              : AppTheme.borderLight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          splashColor:
              (isAudio ? const Color(0xFF10B981) : AppTheme.primaryBlue)
                  .withValues(alpha: 0.1),
          highlightColor:
              (isAudio ? const Color(0xFF10B981) : AppTheme.primaryBlue)
                  .withValues(alpha: 0.05),
          child: Row(
            children: [
              // Cover Image
              SizedBox(
                width: 90,
                height: 120,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    book.cover.startsWith('data:image')
                        ? Base64Image(
                            base64String: book.cover,
                            fit: BoxFit.cover,
                            errorWidget: Container(
                              color: Colors.grey[100],
                              child: const Icon(
                                Icons.broken_image_outlined,
                                color: Colors.grey,
                              ),
                            ),
                          )
                        : CachedNetworkImage(
                            cacheManager: AppCacheManager.instance,
                            imageUrl: book.cover,
                            fit: BoxFit.cover,
                            placeholder: (_, _) => Container(
                              color: Colors.grey[100],
                              child: const Icon(
                                Icons.image_outlined,
                                color: Colors.grey,
                              ),
                            ),
                            errorWidget: (_, _, _) => Container(
                              color: Colors.grey[100],
                              child: const Icon(
                                Icons.broken_image_outlined,
                                color: Colors.grey,
                              ),
                            ),
                          ),
                    if (isAudio)
                      Positioned(
                        top: 4,
                        left: 4,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: const Color(
                                  0xFF10B981,
                                ).withValues(alpha: 0.4),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.play_arrow,
                            size: 14,
                            color: Colors.white,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              // Info
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        book.category,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isAudio
                              ? const Color(0xFF059669)
                              : AppTheme.primaryBlue,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        book.title,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                          height: 1.2,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const Spacer(),
                      if (book.author.isNotEmpty)
                        Text(
                          book.author,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
              ),
              const Padding(
                padding: EdgeInsets.only(right: 16),
                child: Icon(Icons.chevron_right, color: Colors.grey, size: 20),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
