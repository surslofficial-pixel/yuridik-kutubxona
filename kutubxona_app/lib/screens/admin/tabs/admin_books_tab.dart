import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:image/image.dart' as img;
import '../../../models/book.dart';
import '../../../models/category.dart';
import '../../../services/firebase_service.dart';

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

    showDialog(
      context: context,
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
                // error decoding
              }
              setStateBuilder(() => isUploading = false);
            }
          }

          return AlertDialog(
            title: Text(
              book == null ? 'Yangi Kitob' : 'Tahrirlash: ${book.title}',
            ),
            content: SizedBox(
              width: double.maxFinite,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: titleCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Kitob nomi *',
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: authorCtrl,
                      decoration: const InputDecoration(labelText: 'Muallif'),
                    ),
                    const SizedBox(height: 8),

                    StreamBuilder<List<Category>>(
                      stream: _fb.categoriesStream,
                      builder: (context, snap) {
                        final cats = snap.data ?? [];
                        if (cats.isEmpty) {
                          return const SizedBox();
                        }
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
                          decoration: const InputDecoration(
                            labelText: 'Kategoriya',
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: driveLinkCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Fayl (Google Drive link yoki YouTube ID)',
                      ),
                      onChanged: (v) {
                        if (format == 'Audio') {
                          autoFetchYouTube(v);
                        }
                      },
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: coverCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Muqova rasm URL/Base64',
                            ),
                          ),
                        ),
                        IconButton(
                          icon: isUploading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.image_search),
                          onPressed: isUploading ? null : pickImage,
                        ),
                      ],
                    ),
                    if (coverCtrl.text.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: coverCtrl.text.startsWith('data:image')
                            ? Image.memory(
                                base64Decode(coverCtrl.text.split(',').last),
                                height: 100,
                              )
                            : Image.network(
                                coverCtrl.text,
                                height: 100,
                                errorBuilder: (c, e, s) =>
                                    const Icon(Icons.broken_image),
                              ),
                      ),
                    const SizedBox(height: 8),
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
                            decoration: const InputDecoration(
                              labelText: 'Format',
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
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
                            decoration: const InputDecoration(labelText: 'Til'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: yearCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Yil'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: sizeCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Hajmi (masalan: 12 MB)',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: dateCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Sana (YYYY-MM-DD)',
                      ),
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Bekor qilish'),
              ),
              ElevatedButton(
                onPressed: () async {
                  if (titleCtrl.text.isEmpty) {
                    return;
                  }

                  String? fileId;
                  if (driveLinkCtrl.text.isNotEmpty) {
                    final ytId = _extractYouTubeId(driveLinkCtrl.text);
                    if (ytId != null && ytId.length >= 10) {
                      fileId = ytId;
                    } else {
                      final driveMatch = RegExp(
                        r'\/d\/([a-zA-Z0-9_-]+)',
                      ).firstMatch(driveLinkCtrl.text);
                      fileId =
                          driveMatch?.group(1) ?? driveLinkCtrl.text.trim();
                    }
                  }

                  final newBook = Book(
                    id:
                        book?.id ??
                        DateTime.now().millisecondsSinceEpoch.toString(),
                    title: titleCtrl.text,
                    author: authorCtrl.text,
                    category: category,
                    categorySlug: category.toLowerCase().replaceAll(' ', '-'),
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

                  if (ctx.mounted) {
                    Navigator.pop(ctx);
                  }
                },
                child: const Text('Saqlash'),
              ),
            ],
          );
        },
      ),
    );
  }

  void _confirmDelete(Book book) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("O'chirishni tasdiqlang"),
        content: Text("${book.title} kitobini o'chirasizmi?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Yo\'q'),
          ),
          TextButton(
            onPressed: () async {
              await _fb.deleteBook(book.id);
              if (ctx.mounted) {
                Navigator.pop(ctx);
              }
            },
            child: const Text('Ha', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                onChanged: (v) =>
                    setState(() => _searchQuery = v.toLowerCase()),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search),
                  hintText: 'Kitob nomati yoki muallifini qidiring...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
            Expanded(
              child: StreamBuilder<List<Book>>(
                stream: _fb.booksStream,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
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

                  return ListView.builder(
                    padding: const EdgeInsets.all(8),
                    itemCount: books.length,
                    itemBuilder: (context, index) {
                      final book = books[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: Container(
                            width: 40,
                            height: 60,
                            color: Colors.grey.shade200,
                            child: book.cover.startsWith('data:image')
                                ? Image.memory(
                                    base64Decode(book.cover.split(',').last),
                                    fit: BoxFit.cover,
                                  )
                                : Image.network(
                                    book.cover,
                                    fit: BoxFit.cover,
                                    errorBuilder: (c, e, s) =>
                                        const Icon(Icons.book),
                                  ),
                          ),
                          title: Text(
                            book.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text(
                            '${book.author}\n${book.category} | ${book.format}',
                            maxLines: 2,
                          ),
                          isThreeLine: true,
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(
                                  Icons.edit,
                                  color: Colors.blue,
                                ),
                                onPressed: () => _showBookDialog(book),
                              ),
                              IconButton(
                                icon: const Icon(
                                  Icons.delete,
                                  color: Colors.red,
                                ),
                                onPressed: () => _confirmDelete(book),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
        Positioned(
          right: 16,
          bottom: 16,
          child: FloatingActionButton(
            onPressed: () => _showBookDialog(),
            child: const Icon(Icons.add),
          ),
        ),
      ],
    );
  }
}
