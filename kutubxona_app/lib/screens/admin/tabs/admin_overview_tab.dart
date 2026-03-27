import 'package:flutter/material.dart';
import '../../../services/firebase_service.dart';
import '../../../theme/app_theme.dart';

class AdminOverviewTab extends StatelessWidget {
  AdminOverviewTab({super.key});

  final FirebaseService _fb = FirebaseService();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Umumiy Statistika',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          _buildStatsRow(),
          const SizedBox(height: 24),
          const Text(
            'Hozir o\'qiyotganlar',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          _buildActiveReaders(),
          const SizedBox(height: 24),
          const Text(
            'So\'nggi o\'qish sessiyalari',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          _buildRecentSessions(),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard('Kitoblar', Icons.book, _fb.booksStream),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            'Kategoriyalar',
            Icons.category,
            _fb.categoriesStream,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            'AI Mavzulari',
            Icons.smart_toy,
            _fb.aiTopicsStream,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard<T>(
    String title,
    IconData icon,
    Stream<List<T>> stream,
  ) {
    return StreamBuilder<List<T>>(
      stream: stream,
      builder: (context, snapshot) {
        final count = snapshot.data?.length ?? 0;
        return Card(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Icon(icon, size: 32, color: AppTheme.primaryDark),
                const SizedBox(height: 8),
                Text(
                  '$count',
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildActiveReaders() {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: _fb.activeReadersStreamAdmin,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        final readers = snapshot.data ?? [];
        final threeMinAgo =
            DateTime.now().millisecondsSinceEpoch - (3 * 60 * 1000);
        final active = readers
            .where((r) => r['timestamp'] > threeMinAgo)
            .toList();

        if (active.isEmpty) {
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.person_off,
                      size: 48,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Hozir hech kim o\'qimayapti',
                      style: TextStyle(color: Colors.grey.shade500),
                    ),
                  ],
                ),
              ),
            ),
          );
        }

        return Column(
          children: active.map((r) {
            return Card(
              margin: const EdgeInsets.only(bottom: 6),
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Colors.green,
                  child: Icon(Icons.book_online, color: Colors.white),
                ),
                title: Text(
                  '${r['firstName']} ${r['lastName']}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text(r['groupName'] ?? ''),
                trailing: const Text(
                  '🟢 Faol',
                  style: TextStyle(
                    color: Colors.green,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildRecentSessions() {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: _fb.readingSessionsStream,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        final sessions = snapshot.data ?? [];
        final recent = sessions.take(10).toList();

        if (recent.isEmpty) {
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Text(
                  'Hozircha sessiya yo\'q',
                  style: TextStyle(color: Colors.grey.shade500),
                ),
              ),
            ),
          );
        }

        return Column(
          children: recent.map((s) {
            final dt = DateTime.fromMillisecondsSinceEpoch(s['timestamp'] ?? 0);
            return Card(
              margin: const EdgeInsets.only(bottom: 4),
              child: ListTile(
                leading: const Icon(
                  Icons.access_time,
                  color: AppTheme.primaryDark,
                ),
                title: Text(
                  '${s['firstName']} ${s['lastName']}',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                subtitle: Text(
                  '${s['groupName']} | ${dt.day}/${dt.month}/${dt.year} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}',
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }
}
