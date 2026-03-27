import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/book.dart';

class BookmarkService {
  static const _key = 'syt_bookmarks';

  Future<List<Book>> getBookmarks() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_key);
    if (stored == null || stored.isEmpty) return [];
    try {
      final List<dynamic> list = json.decode(stored);
      return list.map((e) => Book.fromMap(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> toggleBookmark(Book book) async {
    final prefs = await SharedPreferences.getInstance();
    final bookmarks = await getBookmarks();
    final isBookmarked = bookmarks.any(
      (b) => b.id.toString() == book.id.toString(),
    );
    List<Book> updated;
    if (isBookmarked) {
      updated = bookmarks
          .where((b) => b.id.toString() != book.id.toString())
          .toList();
    } else {
      updated = [...bookmarks, book];
    }
    await prefs.setString(
      _key,
      json.encode(updated.map((b) => b.toMap()).toList()),
    );
  }

  Future<bool> isBookmarked(String id) async {
    final bookmarks = await getBookmarks();
    return bookmarks.any((b) => b.id.toString() == id.toString());
  }
}
