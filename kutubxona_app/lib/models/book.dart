class Book {
  final String id;
  final String title;
  final String author;
  final String category;
  final String categorySlug;
  final String cover;
  final int? year;
  final String? date;
  final String? status;
  final String? fileId;
  final String? driveUrl;
  final String? format;
  final String? language;
  final String? size;

  Book({
    required this.id,
    required this.title,
    required this.author,
    required this.category,
    required this.categorySlug,
    required this.cover,
    this.year,
    this.date,
    this.status,
    this.fileId,
    this.driveUrl,
    this.format,
    this.language,
    this.size,
  });

  factory Book.fromMap(Map<String, dynamic> data) {
    final isAudio = data['categorySlug'] == 'audio-kitoblar' ||
        data['category'] == 'Audio Darslik';
    final fid = data['fileId'] as String?;
    String cover = data['cover'] ?? '';
    if (isAudio && fid != null && fid.length == 11) {
      cover = 'https://img.youtube.com/vi/$fid/maxresdefault.jpg';
    }
    return Book(
      id: (data['id'] ?? '').toString(),
      title: data['title'] ?? '',
      author: data['author'] ?? '',
      category: data['category'] ?? '',
      categorySlug: data['categorySlug'] ?? '',
      cover: cover,
      year: data['year'] is int ? data['year'] : null,
      date: data['date'],
      status: data['status'],
      fileId: data['fileId'],
      driveUrl: data['driveUrl'],
      format: data['format'],
      language: data['language'],
      size: data['size'],
    );
  }

  Map<String, dynamic> toMap() {
    final map = <String, dynamic>{
      'id': id,
      'title': title,
      'author': author,
      'category': category,
      'categorySlug': categorySlug,
      'cover': cover,
    };
    if (year != null) map['year'] = year;
    if (date != null) map['date'] = date;
    if (status != null) map['status'] = status;
    if (fileId != null) map['fileId'] = fileId;
    if (driveUrl != null) map['driveUrl'] = driveUrl;
    if (format != null) map['format'] = format;
    if (language != null) map['language'] = language;
    if (size != null) map['size'] = size;
    return map;
  }
}
