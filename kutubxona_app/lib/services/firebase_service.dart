import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/book.dart';
import '../models/category.dart';
import '../models/ai_topic.dart';

/// Singleton service that caches Firestore streams as broadcast streams.
/// Every widget that calls [booksStream] etc. gets the SAME underlying
/// Firestore snapshot listener, avoiding duplicate network connections.
class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();

  factory FirebaseService() {
    return _instance;
  }

  FirebaseService._internal() {
    // Initialize cached broadcast streams once, during singleton creation.
    _categoriesBroadcast = _db
        .collection('categories')
        .snapshots()
        .map(
          (snap) => snap.docs.map((d) => Category.fromMap(d.data())).toList(),
        )
        .asBroadcastStream();

    _booksBroadcast = _db
        .collection('books')
        .snapshots()
        .map((snap) => snap.docs.map((d) => Book.fromMap(d.data())).toList())
        .asBroadcastStream();

    _aiTopicsBroadcast = _db
        .collection('ai_topics')
        .snapshots()
        .map(
          (snap) =>
              snap.docs.map((d) => AiTopic.fromMap(d.id, d.data())).toList(),
        )
        .asBroadcastStream();

    // Keep a local cache of the latest values so new subscribers
    // can get data immediately without waiting for the next Firestore emit.
    _categoriesBroadcast.listen((cats) => _cachedCategories = cats);
    _booksBroadcast.listen((books) => _cachedBooks = books);
    _aiTopicsBroadcast.listen((topics) => _cachedAiTopics = topics);
  }

  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Cached broadcast streams — single Firestore listener per collection
  late final Stream<List<Category>> _categoriesBroadcast;
  late final Stream<List<Book>> _booksBroadcast;
  late final Stream<List<AiTopic>> _aiTopicsBroadcast;

  // In-memory latest value cache
  List<Category>? _cachedCategories;
  List<Book>? _cachedBooks;
  List<AiTopic>? _cachedAiTopics;

  /// Returns a stream that first yields the cached value (for late subscribers),
  /// then forwards all future emissions from the shared broadcast stream.
  /// This ensures screens navigated to AFTER initial data load still get data.
  Stream<List<Category>> get categoriesStream async* {
    if (_cachedCategories != null) yield _cachedCategories!;
    yield* _categoriesBroadcast;
  }

  Stream<List<Book>> get booksStream async* {
    if (_cachedBooks != null) yield _cachedBooks!;
    yield* _booksBroadcast;
  }

  Stream<List<AiTopic>> get aiTopicsStream async* {
    if (_cachedAiTopics != null) yield _cachedAiTopics!;
    yield* _aiTopicsBroadcast;
  }

  // Direct cached access (synchronous, for widgets that already loaded data)
  List<Category> get cachedCategories => _cachedCategories ?? [];
  List<Book> get cachedBooks => _cachedBooks ?? [];
  List<AiTopic> get cachedAiTopics => _cachedAiTopics ?? [];

  // === READING SESSIONS ===
  Future<void> addReadingSession({
    required String firstName,
    required String lastName,
    required String groupName,
    required String bookId,
  }) async {
    await _db.collection('reading_sessions').add({
      'firstName': firstName,
      'lastName': lastName,
      'groupName': groupName,
      'bookId': bookId,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    });
  }

  // === ACTIVE READERS ===
  Future<String> setActiveReader({
    required String firstName,
    required String lastName,
    required String groupName,
    required String bookId,
  }) async {
    final docRef = await _db.collection('active_readers').add({
      'firstName': firstName,
      'lastName': lastName,
      'groupName': groupName,
      'bookId': bookId,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    });
    return docRef.id;
  }

  Future<void> removeActiveReader(String id) async {
    if (id.isNotEmpty) {
      await _db.collection('active_readers').doc(id).delete();
    }
  }

  Future<void> updateActiveReaderTimestamp(String id) async {
    if (id.isNotEmpty) {
      await _db.collection('active_readers').doc(id).update({
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      });
    }
  }

  // === ADMIN BOOKS CRUD ===
  Future<void> addBook(Book book) async {
    await _db.collection('books').doc(book.id).set(book.toMap());
  }

  Future<void> updateBook(String id, Map<String, dynamic> data) async {
    await _db.collection('books').doc(id).update(data);
  }

  Future<void> deleteBook(String id) async {
    await _db.collection('books').doc(id).delete();
  }

  // === ADMIN CATEGORIES CRUD ===
  Future<void> addCategory(Category category) async {
    await _db.collection('categories').doc(category.slug).set(category.toMap());
  }

  Future<void> updateCategory(String slug, Map<String, dynamic> data) async {
    await _db.collection('categories').doc(slug).update(data);
  }

  Future<void> deleteCategory(String slug) async {
    await _db.collection('categories').doc(slug).delete();
  }

  // === ADMIN AI TOPICS CRUD ===
  Future<void> addAiTopic(AiTopic topic) async {
    await _db.collection('ai_topics').doc(topic.id).set(topic.toMap());
  }

  Future<void> updateAiTopic(String id, Map<String, dynamic> data) async {
    await _db.collection('ai_topics').doc(id).update(data);
  }

  Future<void> deleteAiTopic(String id) async {
    await _db.collection('ai_topics').doc(id).delete();
  }

  // === ADMIN ANALYTICS ===
  Stream<List<Map<String, dynamic>>> get readingSessionsStream => _db
      .collection('reading_sessions')
      .orderBy('timestamp', descending: true)
      .snapshots()
      .map((snap) => snap.docs.map((d) => d.data()).toList());

  Stream<List<Map<String, dynamic>>> get activeReadersStreamAdmin =>
      _db.collection('active_readers').snapshots().map((snap) {
        return snap.docs.map((d) {
          final data = d.data();
          data['id'] = d.id;
          return data;
        }).toList();
      });

  Future<void> deleteUserSessions(
    String firstName,
    String lastName,
    String groupName,
  ) async {
    final snap = await _db
        .collection('reading_sessions')
        .where('firstName', isEqualTo: firstName)
        .where('lastName', isEqualTo: lastName)
        .where('groupName', isEqualTo: groupName)
        .get();
    for (var doc in snap.docs) {
      await doc.reference.delete();
    }
  }

  Future<void> updateUserSessions(
    Map<String, String> oldIdentity,
    Map<String, String> newIdentity,
  ) async {
    final snap = await _db
        .collection('reading_sessions')
        .where('firstName', isEqualTo: oldIdentity['firstName'])
        .where('lastName', isEqualTo: oldIdentity['lastName'])
        .where('groupName', isEqualTo: oldIdentity['groupName'])
        .get();
    for (var doc in snap.docs) {
      await doc.reference.update(newIdentity);
    }
  }

  // === APP ANALYTICS ===
  Future<void> logAppInstallation() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isFirstLaunch = prefs.getBool('isFirstLaunch') ?? true;
      if (isFirstLaunch) {
        await _db.collection('stats').doc('app_info').set({
          'downloads_count': FieldValue.increment(1),
        }, SetOptions(merge: true));
        await prefs.setBool('isFirstLaunch', false);
      }
    } catch (_) {
      // Safely ignore if prefs or network fails on first launch
    }
  }

  Stream<int> get downloadsCountStream => _db
      .collection('stats')
      .doc('app_info')
      .snapshots()
      .map((snap) => (snap.data()?['downloads_count'] as int?) ?? 0);
}
