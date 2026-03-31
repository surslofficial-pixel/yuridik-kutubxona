import 'package:flutter_cache_manager/flutter_cache_manager.dart';

/// Custom cache manager that limits image cache to 50 MB and 200 files.
/// Cached images expire after 7 days.
class AppCacheManager {
  static const _key = 'kutubxonaCachedImages';

  static final CacheManager instance = CacheManager(
    Config(
      _key,
      maxNrOfCacheObjects: 200,
      stalePeriod: const Duration(days: 7),
    ),
  );

  /// Clears all cached images.
  static Future<void> clearCache() async {
    await instance.emptyCache();
    await DefaultCacheManager().emptyCache();
  }
}
