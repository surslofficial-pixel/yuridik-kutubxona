import 'dart:io';
import 'package:flutter/material.dart';
import 'package:csv/csv.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../../models/book.dart';
import '../../../services/firebase_service.dart';
import '../../../theme/app_theme.dart';

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
            const Expanded(child: Text("O'chirish")),
          ],
        ),
        content: Text(
          '"${user['name']}" ning barcha statistikasini o\'chirasizmi?\nBu amalni qaytarib bo\'lmaydi.',
          style: const TextStyle(height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Yo\'q'),
          ),
          ElevatedButton(
            onPressed: () async {
              await _fb.deleteUserSessions(
                user['firstName'],
                user['lastName'],
                user['groupName'],
              );
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
                  return const Center(
                    child: CircularProgressIndicator(
                      color: AppTheme.primaryDark,
                    ),
                  );
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
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                      child: Column(
                        children: [
                          TextField(
                            onChanged: (v) =>
                                setState(() => _searchQuery = v.toLowerCase()),
                            decoration: InputDecoration(
                              prefixIcon: const Icon(
                                Icons.search_rounded,
                                color: AppTheme.textTertiary,
                              ),
                              hintText:
                                  'Ism, Familiya yoki Guruhni qidiring...',
                              hintStyle: const TextStyle(fontSize: 14),
                              filled: true,
                              fillColor: Colors.white,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(14),
                                borderSide: const BorderSide(
                                  color: AppTheme.borderLight,
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(14),
                                borderSide: const BorderSide(
                                  color: AppTheme.borderLight,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () => _exportCsv(usersStats),
                              icon: const Icon(
                                Icons.download_rounded,
                                size: 20,
                              ),
                              label: Text(
                                'Hisobot yuklash  (${usersStats.length} ta)',
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 14,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Users count
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          Text(
                            'Jami: ${usersStats.length} ta foydalanuvchi',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppTheme.textTertiary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.green.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '🟢 ${activeKeys.length} ta faol',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.green,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        itemCount: usersStats.length,
                        itemBuilder: (context, index) {
                          final u = usersStats[index];
                          final dt = DateTime.fromMillisecondsSinceEpoch(
                            u['lastRead'],
                          );
                          final isFaol = u['status'] == 'Faol O\'qimoqda';
                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isFaol
                                    ? Colors.green.withValues(alpha: 0.3)
                                    : AppTheme.borderLight,
                              ),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Row(
                                children: [
                                  // Avatar
                                  Container(
                                    width: 44,
                                    height: 44,
                                    decoration: BoxDecoration(
                                      color: isFaol
                                          ? Colors.green.withValues(alpha: 0.1)
                                          : Colors.grey.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: Icon(
                                      isFaol
                                          ? Icons.menu_book_rounded
                                          : Icons.person_rounded,
                                      color: isFaol
                                          ? Colors.green
                                          : Colors.grey,
                                      size: 22,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Flexible(
                                              child: Text(
                                                u['name'],
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w700,
                                                  fontSize: 14,
                                                  color: AppTheme.textPrimary,
                                                ),
                                              ),
                                            ),
                                            if (isFaol) ...[
                                              const SizedBox(width: 6),
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 6,
                                                      vertical: 2,
                                                    ),
                                                decoration: BoxDecoration(
                                                  color: Colors.green
                                                      .withValues(alpha: 0.1),
                                                  borderRadius:
                                                      BorderRadius.circular(6),
                                                ),
                                                child: const Text(
                                                  'FAOL',
                                                  style: TextStyle(
                                                    fontSize: 9,
                                                    fontWeight: FontWeight.w700,
                                                    color: Colors.green,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ],
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          u['groupName'],
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: AppTheme.textSecondary,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Icon(
                                              Icons.menu_book_outlined,
                                              size: 13,
                                              color: Colors.grey.shade400,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              '${u['reads']}',
                                              style: const TextStyle(
                                                fontSize: 11,
                                                color: AppTheme.textTertiary,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(width: 10),
                                            Icon(
                                              Icons.access_time_rounded,
                                              size: 13,
                                              color: Colors.grey.shade400,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              '${dt.hour}:${dt.minute.toString().padLeft(2, '0')} ${dt.day}/${dt.month}/${dt.year}',
                                              style: const TextStyle(
                                                fontSize: 11,
                                                color: AppTheme.textTertiary,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  InkWell(
                                    onTap: () => _confirmDelete(u),
                                    borderRadius: BorderRadius.circular(10),
                                    child: Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: Colors.red.withValues(
                                          alpha: 0.08,
                                        ),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: const Icon(
                                        Icons.delete_outline_rounded,
                                        size: 18,
                                        color: Colors.red,
                                      ),
                                    ),
                                  ),
                                ],
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
