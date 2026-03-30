import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image/image.dart' as img;
import '../../../models/book.dart';
import '../../../models/category.dart';
import '../../../services/firebase_service.dart';
import '../../../theme/app_theme.dart';

class AdminBooksTab extends StatefulWidget {
  const AdminBooksTab({super.key});

  @override
  State<AdminBooksTab> createState() => _AdminBooksTabState();
}

class _AdminBooksTabState extends State<AdminBooksTab> {
  final FirebaseService _fb = FirebaseService();
  String _searchQuery = '';

  String? _extractYouTubeId(String url) {
    if (url.isEmpty) return null;
    final regex = RegExp(r'(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})');
    final match = regex.firstMatch(url);
    if (match != null) return match.group(1);
    if (RegExp(r'^[a-zA-Z0-9_-]{11}$').hasMatch(url)) return url;
    return null;
  }

  void _showBookDialog([Book? book]) {
    final titleCtrl = TextEditingController(text: book?.title ?? '');
    final authorCtrl = TextEditingController(text: book?.author ?? '');
    String category = book?.category ?? 'Biznes huquqi';
    final coverCtrl = TextEditingController(text: book?.cover ?? '');
    final driveLinkCtrl = TextEditingController(
      text: book?.fileId != null
          ? 'https://drive.google.com/file/d/${book?.fileId}/view'
          : '',
    );
    String format = book?.format ?? 'PDF';
    String language = book?.language ?? 'O\'zbek';
    final yearCtrl = TextEditingController(text: book?.year?.toString() ?? '');
    final dateCtrl = TextEditingController(text: book?.date ?? '');
    final sizeCtrl = TextEditingController(text: book?.size ?? '');
    bool isUploading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setStateBuilder) {
          Future<void> autoFetchYouTube(String url) async {
            final ytId = _extractYouTubeId(url);
            if (ytId != null && ytId.length == 11) {
              try {
                final res = await http.get(
                  Uri.parse(
                    'https://noembed.com/embed?url=https://www.youtube.com/watch?v=$ytId',
                  ),
                );
                if (res.statusCode == 200) {
                  final data = jsonDecode(res.body);
                  setStateBuilder(() {
                    if (titleCtrl.text.isEmpty) {
                      titleCtrl.text = data['title'] ?? '';
                    }
                    if (authorCtrl.text.isEmpty) {
                      authorCtrl.text = data['author_name'] ?? '';
                    }
                    if (coverCtrl.text.isEmpty) {
                      coverCtrl.text =
                          data['thumbnail_url'] ??
                          'https://img.youtube.com/vi/$ytId/hqdefault.jpg';
                    }
                    if (yearCtrl.text.isEmpty) {
                      yearCtrl.text = DateTime.now().year.toString();
                    }
                    if (dateCtrl.text.isEmpty) {
                      dateCtrl.text = DateTime.now()
                          .toIso8601String()
                          .split('T')
                          .first;
                    }
                  });
                }
              } catch (_) {}
            }
          }

          Future<void> pickImage() async {
            final picker = ImagePicker();
            final xFile = await picker.pickImage(source: ImageSource.gallery);
            if (xFile != null) {
              setStateBuilder(() => isUploading = true);
              try {
                final bytes = await xFile.readAsBytes();
                img.Image? image = img.decodeImage(bytes);
                if (image != null) {
                  img.Image resized = img.copyResize(image, width: 300);
                  if (resized.height > 450) {
                    resized = img.copyResize(image, height: 450);
                  }
                  final jpg = img.encodeJpg(resized, quality: 60);
                  final base64String =
                      'data:image/jpeg;base64,${base64Encode(jpg)}';
                  setStateBuilder(() => coverCtrl.text = base64String);
                }
              } catch (e) {
                debugPrint('Image pick error: $e');
              }
              setStateBuilder(() => isUploading = false);
            }
          }

          return Container(
            height: MediaQuery.of(context).size.height * 0.92,
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Column(
              children: [
                // Handle bar
                Container(
                  margin: const EdgeInsets.only(top: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                // Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryDark.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          book == null ? Icons.add_rounded : Icons.edit_rounded,
                          color: AppTheme.primaryDark,
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          book == null ? 'Yangi kitob qo\'shish' : 'Tahrirlash',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: const Icon(Icons.close_rounded),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.grey.shade100,
                        ),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 24),
                // Form
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _formField(
                          'Kitob nomi *',
                          titleCtrl,
                          Icons.book_rounded,
                        ),
                        const SizedBox(height: 14),
                        _formField('Muallif', authorCtrl, Icons.person_rounded),
                        const SizedBox(height: 14),
                        // Category dropdown
                        StreamBuilder<List<Category>>(
                          stream: _fb.categoriesStream,
                          builder: (context, snap) {
                            final cats = snap.data ?? [];
                            if (cats.isEmpty) return const SizedBox();
                            if (!cats.any((c) => c.name == category)) {
                              category = cats.first.name;
                            }
                            return DropdownButtonFormField<String>(
                              initialValue: category,
                              items: cats
                                  .map(
                                    (c) => DropdownMenuItem(
                                      value: c.name,
                                      child: Text(c.name),
                                    ),
                                  )
                                  .toList(),
                              onChanged: (v) =>
                                  setStateBuilder(() => category = v!),
                              decoration: InputDecoration(
                                labelText: 'Kategoriya',
                                prefixIcon: const Icon(
                                  Icons.category_rounded,
                                  size: 20,
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                filled: true,
                                fillColor: Colors.grey.shade50,
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 14),
                        _formField(
                          'Fayl (Google Drive / YouTube)',
                          driveLinkCtrl,
                          Icons.link_rounded,
                          onChanged: format == 'Audio'
                              ? autoFetchYouTube
                              : null,
                        ),
                        const SizedBox(height: 14),
                        // Cover with image picker
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Expanded(
                              child: _formField(
                                'Muqova rasm URL/Base64',
                                coverCtrl,
                                Icons.image_rounded,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              decoration: BoxDecoration(
                                color: AppTheme.primaryDark.withValues(
                                  alpha: 0.1,
                                ),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: IconButton(
                                icon: isUploading
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : const Icon(
                                        Icons.add_photo_alternate_rounded,
                                        color: AppTheme.primaryDark,
                                      ),
                                onPressed: isUploading ? null : pickImage,
                              ),
                            ),
                          ],
                        ),
                        // Cover preview
                        if (coverCtrl.text.isNotEmpty)
                          Container(
                            margin: const EdgeInsets.only(top: 12),
                            height: 120,
                            width: 90,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.borderLight),
                            ),
                            clipBehavior: Clip.antiAlias,
                            child: coverCtrl.text.startsWith('data:image')
                                ? Image.memory(
                                    base64Decode(
                                      coverCtrl.text.split(',').last,
                                    ),
                                    fit: BoxFit.cover,
                                  )
                                : Image.network(
                                    coverCtrl.text,
                                    fit: BoxFit.cover,
                                    errorBuilder: (c, e, s) =>
                                        const Icon(Icons.broken_image_rounded),
                                  ),
                          ),
                        const SizedBox(height: 14),
                        // Format & Language row
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                initialValue: format,
                                items: ['PDF', 'Audio']
                                    .map(
                                      (f) => DropdownMenuItem(
                                        value: f,
                                        child: Text(f),
                                      ),
                                    )
                                    .toList(),
                                onChanged: (v) =>
                                    setStateBuilder(() => format = v!),
                                decoration: InputDecoration(
                                  labelText: 'Format',
                                  prefixIcon: const Icon(
                                    Icons.description_rounded,
                                    size: 20,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  filled: true,
                                  fillColor: Colors.grey.shade50,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                initialValue: language,
                                items: ['O\'zbek', 'Rus', 'Ingliz']
                                    .map(
                                      (l) => DropdownMenuItem(
                                        value: l,
                                        child: Text(l),
                                      ),
                                    )
                                    .toList(),
                                onChanged: (v) =>
                                    setStateBuilder(() => language = v!),
                                decoration: InputDecoration(
                                  labelText: 'Til',
                                  prefixIcon: const Icon(
                                    Icons.language_rounded,
                                    size: 20,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  filled: true,
                                  fillColor: Colors.grey.shade50,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        // Year & Size row
                        Row(
                          children: [
                            Expanded(
                              child: _formField(
                                'Yil',
                                yearCtrl,
                                Icons.calendar_today_rounded,
                                keyboardType: TextInputType.number,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _formField(
                                'Hajmi (12 MB)',
                                sizeCtrl,
                                Icons.storage_rounded,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        _formField(
                          'Sana (YYYY-MM-DD)',
                          dateCtrl,
                          Icons.date_range_rounded,
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
                // Bottom buttons
                Container(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border(
                      top: BorderSide(color: Colors.grey.shade200),
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(ctx),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            side: BorderSide(color: Colors.grey.shade300),
                          ),
                          child: const Text('Bekor qilish'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            if (titleCtrl.text.isEmpty) return;
                            String? fileId;
                            if (driveLinkCtrl.text.isNotEmpty) {
                              final ytId = _extractYouTubeId(
                                driveLinkCtrl.text,
                              );
                              if (ytId != null && ytId.length >= 10) {
                                fileId = ytId;
                              } else {
                                final driveMatch = RegExp(
                                  r'\/d\/([a-zA-Z0-9_-]+)',
                                ).firstMatch(driveLinkCtrl.text);
                                fileId =
                                    driveMatch?.group(1) ??
                                    driveLinkCtrl.text.trim();
                              }
                            }
                            final newBook = Book(
                              id:
                                  book?.id ??
                                  DateTime.now().millisecondsSinceEpoch
                                      .toString(),
                              title: titleCtrl.text,
                              author: authorCtrl.text,
                              category: category,
                              categorySlug: category.toLowerCase().replaceAll(
                                ' ',
                                '-',
                              ),
                              cover: coverCtrl.text.isEmpty
                                  ? "https://images.unsplash.com/photo-1589829085413-56de8ae18c73"
                                  : coverCtrl.text,
                              year: int.tryParse(yearCtrl.text),
                              date: dateCtrl.text,
                              status: "Faol",
                              fileId: fileId,
                              format: format,
                              language: language,
                              size: sizeCtrl.text,
                            );
                            if (book == null) {
                              await _fb.addBook(newBook);
                            } else {
                              await _fb.updateBook(book.id, newBook.toMap());
                            }
                            if (ctx.mounted) Navigator.pop(ctx);
                          },
                          icon: const Icon(Icons.check_rounded, size: 20),
                          label: const Text('Saqlash'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryDark,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _formField(
    String label,
    TextEditingController ctrl,
    IconData icon, {
    TextInputType? keyboardType,
    void Function(String)? onChanged,
  }) {
    return TextField(
      controller: ctrl,
      keyboardType: keyboardType,
      onChanged: onChanged != null ? (v) => onChanged(v) : null,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
        filled: true,
        fillColor: Colors.grey.shade50,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
      ),
    );
  }

  void _confirmDelete(Book book) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.delete_outline_rounded,
                color: Colors.red.shade600,
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            const Text("O'chirishni tasdiqlang"),
          ],
        ),
        content: Text(
          '"${book.title}" kitobini o\'chirasizmi?\nBu amalni qaytarib bo\'lmaydi.',
          style: const TextStyle(height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Yo\'q'),
          ),
          ElevatedButton(
            onPressed: () async {
              await _fb.deleteBook(book.id);
              if (ctx.mounted) Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text("O'chirish"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
            decoration: InputDecoration(
              prefixIcon: const Icon(
                Icons.search_rounded,
                color: AppTheme.textTertiary,
              ),
              hintText: 'Kitob nomi yoki muallifni qidiring...',
              hintStyle: const TextStyle(fontSize: 14),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: AppTheme.borderLight),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: AppTheme.borderLight),
              ),
            ),
          ),
        ),
        // Books list
        Expanded(
          child: StreamBuilder<List<Book>>(
            stream: _fb.booksStream,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(
                  child: CircularProgressIndicator(color: AppTheme.primaryDark),
                );
              }
              var books = snapshot.data ?? [];
              if (_searchQuery.isNotEmpty) {
                books = books
                    .where(
                      (b) =>
                          b.title.toLowerCase().contains(_searchQuery) ||
                          b.author.toLowerCase().contains(_searchQuery),
                    )
                    .toList();
              }

              if (books.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.menu_book_outlined,
                        size: 64,
                        color: Colors.grey.shade300,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Kitob topilmadi',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey.shade400,
                        ),
                      ),
                    ],
                  ),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 80),
                itemCount: books.length,
                itemBuilder: (context, index) {
                  final book = books[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.borderLight),
                    ),
                    child: InkWell(
                      onTap: () => _showBookDialog(book),
                      borderRadius: BorderRadius.circular(16),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            // Cover
                            Container(
                              width: 50,
                              height: 70,
                              decoration: BoxDecoration(
                                color: Colors.grey.shade100,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: book.cover.startsWith('data:image')
                                  ? Image.memory(
                                      base64Decode(book.cover.split(',').last),
                                      fit: BoxFit.cover,
                                    )
                                  : CachedNetworkImage(
                                      imageUrl: book.cover,
                                      fit: BoxFit.cover,
                                      placeholder: (c, url) => Container(
                                        color: Colors.grey.shade100,
                                        child: const Center(
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                          ),
                                        ),
                                      ),
                                      errorWidget: (c, url, error) =>
                                          const Icon(
                                            Icons.menu_book_rounded,
                                            color: AppTheme.textTertiary,
                                          ),
                                    ),
                            ),
                            const SizedBox(width: 12),
                            // Info
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    book.title,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14,
                                      color: AppTheme.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    book.author,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppTheme.textSecondary,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      _chip(
                                        book.category,
                                        AppTheme.primaryDark,
                                      ),
                                      const SizedBox(width: 6),
                                      _chip(
                                        book.format ?? 'PDF',
                                        book.format == 'Audio'
                                            ? const Color(0xFF8B5CF6)
                                            : const Color(0xFF10B981),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            // Actions
                            Column(
                              children: [
                                _actionButton(
                                  Icons.edit_rounded,
                                  const Color(0xFF3B82F6),
                                  () => _showBookDialog(book),
                                ),
                                const SizedBox(height: 4),
                                _actionButton(
                                  Icons.delete_outline_rounded,
                                  Colors.red,
                                  () => _confirmDelete(book),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _chip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: color,
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  Widget _actionButton(IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, size: 18, color: color),
      ),
    );
  }
}
