import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/book.dart';
import '../models/category.dart';
import '../models/ai_topic.dart';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();

  factory FirebaseService() {
    return _instance;
  }

  FirebaseService._internal();

  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // === STREAMS ===
  // Use getters instead of late final to ensure each subscriber
  // gets a fresh stream that immediately emits the current Firestore state.
  Stream<List<Category>> get categoriesStream => _db
      .collection('categories')
      .snapshots()
      .map((snap) => snap.docs.map((d) => Category.fromMap(d.data())).toList());

  Stream<List<Book>> get booksStream => _db
      .collection('books')
      .snapshots()
      .map((snap) => snap.docs.map((d) => Book.fromMap(d.data())).toList());

  Stream<List<AiTopic>> get aiTopicsStream => _db
      .collection('ai_topics')
      .snapshots()
      .map(
        (snap) =>
            snap.docs.map((d) => AiTopic.fromMap(d.id, d.data())).toList(),
      );

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
  late final Stream<List<Map<String, dynamic>>> readingSessionsStream = _db
      .collection('reading_sessions')
      .orderBy('timestamp', descending: true)
      .snapshots()
      .map((snap) => snap.docs.map((d) => d.data()).toList())
      .asBroadcastStream();

  late final Stream<List<Map<String, dynamic>>> activeReadersStreamAdmin = _db
      .collection('active_readers')
      .snapshots()
      .map((snap) {
        return snap.docs.map((d) {
          final data = d.data();
          data['id'] = d.id;
          return data;
        }).toList();
      })
      .asBroadcastStream();

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
}
