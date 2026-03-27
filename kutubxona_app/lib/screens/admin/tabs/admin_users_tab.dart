import 'dart:io';
import 'package:flutter/material.dart';
import 'package:csv/csv.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../../models/book.dart';
import '../../../services/firebase_service.dart';

class AdminUsersTab extends StatefulWidget {
  const AdminUsersTab({super.key});

  @override
  State<AdminUsersTab> createState() => _AdminUsersTabState();
}

class _AdminUsersTabState extends State<AdminUsersTab> {
  final FirebaseService _fb = FirebaseService();
  String _searchQuery = '';

  void _exportCsv(List<Map<String, dynamic>> usersStats) async {
    List<List<dynamic>> rows = [
      [
        '№',
        'Ism',
        'Familiya',
        'Guruh/Manzil',
        "O'qilgan kitoblar",
        'Jami o\'qishlar',
        'Oxirgi marta',
        'Holat',
      ],
    ];

    for (int i = 0; i < usersStats.length; i++) {
      final u = usersStats[i];
      final readBooksStr = u['readBooks'].entries
          .map((e) => '${e.key} (${e.value} marta)')
          .join(', ');
      final dt = DateTime.fromMillisecondsSinceEpoch(u['lastRead']);

      rows.add([
        i + 1,
        u['firstName'],
        u['lastName'],
        u['groupName'],
        readBooksStr,
        u['reads'],
        '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}',
        u['status'],
      ]);
    }

    String csvStr = const CsvEncoder().convert(rows);
    final dir = await getTemporaryDirectory();
    final path =
        '${dir.path}/kutubxona_hisobot_${DateTime.now().millisecondsSinceEpoch}.csv';
    final file = File(path);
    await file.writeAsString(csvStr);

    await SharePlus.instance.share(
      ShareParams(files: [XFile(path)], text: 'Kutubxona kitobxonlar hisoboti'),
    );
  }

  void _confirmDelete(Map<String, dynamic> user) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("O'chirishni tasdiqlang"),
        content: Text(
          "${user['name']} foydalanuvchisining barcha statistikasini o'chirasizmi?",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Yo\'q'),
          ),
          TextButton(
            onPressed: () async {
              await _fb.deleteUserSessions(
                user['firstName'],
                user['lastName'],
                user['groupName'],
              );
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
    return StreamBuilder<List<Book>>(
      stream: _fb.booksStream,
      builder: (context, booksSnap) {
        return StreamBuilder<List<Map<String, dynamic>>>(
          stream: _fb.readingSessionsStream,
          builder: (context, sessionSnap) {
            return StreamBuilder<List<Map<String, dynamic>>>(
              stream: _fb.activeReadersStreamAdmin,
              builder: (context, activeSnap) {
                if (sessionSnap.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                final booksList = booksSnap.data ?? [];
                final booksMap = {
                  for (var b in booksList) b.id.toString(): b.title,
                };

                final sessions = sessionSnap.data ?? [];
                final activeReaders = activeSnap.data ?? [];
                final threeMinAgo =
                    DateTime.now().millisecondsSinceEpoch - (3 * 60 * 1000);

                final activeKeys = activeReaders
                    .where((act) => act['timestamp'] > threeMinAgo)
                    .map(
                      (act) =>
                          '${act['firstName']}-${act['lastName']}-${act['groupName']}'
                              .toLowerCase(),
                    )
                    .toSet();

                final Map<String, Map<String, dynamic>> userMap = {};

                for (var session in sessions) {
                  final key =
                      '${session['firstName']}-${session['lastName']}-${session['groupName']}'
                          .toLowerCase();
                  final title =
                      booksMap[session['bookId'].toString()] ??
                      "Noma'lum kitob";

                  if (userMap.containsKey(key)) {
                    userMap[key]!['reads'] += 1;
                    userMap[key]!['readBooks'][title] =
                        (userMap[key]!['readBooks'][title] ?? 0) + 1;
                    if (session['timestamp'] > userMap[key]!['lastRead']) {
                      userMap[key]!['lastRead'] = session['timestamp'];
                    }
                  } else {
                    userMap[key] = {
                      'firstName': session['firstName'],
                      'lastName': session['lastName'],
                      'groupName': session['groupName'],
                      'name': '${session['firstName']} ${session['lastName']}',
                      'reads': 1,
                      'lastRead': session['timestamp'],
                      'readBooks': {title: 1},
                      'status': activeKeys.contains(key)
                          ? 'Faol O\'qimoqda'
                          : 'Faol emas',
                    };
                  }
                }

                List<Map<String, dynamic>> usersStats = userMap.values.toList()
                  ..sort(
                    (a, b) =>
                        (b['lastRead'] as int).compareTo(a['lastRead'] as int),
                  );

                if (_searchQuery.isNotEmpty) {
                  usersStats = usersStats
                      .where(
                        (u) =>
                            u['name'].toString().toLowerCase().contains(
                              _searchQuery,
                            ) ||
                            u['groupName'].toString().toLowerCase().contains(
                              _searchQuery,
                            ),
                      )
                      .toList();
                }

                return Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          TextField(
                            onChanged: (v) =>
                                setState(() => _searchQuery = v.toLowerCase()),
                            decoration: InputDecoration(
                              prefixIcon: const Icon(Icons.search),
                              hintText:
                                  'Ism, Familiya yoki Guruhni qidiring...',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () => _exportCsv(usersStats),
                              icon: const Icon(Icons.download),
                              label: const Text('Hisobot yuklash (CSV)'),
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                  vertical: 14,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(8),
                        itemCount: usersStats.length,
                        itemBuilder: (context, index) {
                          final u = usersStats[index];
                          final dt = DateTime.fromMillisecondsSinceEpoch(
                            u['lastRead'],
                          );
                          final isFaol = u['status'] == 'Faol O\'qimoqda';
                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: isFaol
                                    ? Colors.green
                                    : Colors.grey,
                                child: Icon(
                                  isFaol ? Icons.book_online : Icons.person,
                                  color: Colors.white,
                                ),
                              ),
                              title: Text(
                                '${u['name']} (${u['groupName']})',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              subtitle: Text(
                                'Jami o\'qishlar: ${u['reads']}\nOxirgi faollik: ${dt.hour}:${dt.minute.toString().padLeft(2, '0')} ${dt.day}/${dt.month}/${dt.year}',
                                maxLines: 2,
                              ),
                              isThreeLine: true,
                              trailing: IconButton(
                                icon: const Icon(
                                  Icons.delete,
                                  color: Colors.red,
                                ),
                                onPressed: () => _confirmDelete(u),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                );
              },
            );
          },
        );
      },
    );
  }
}
