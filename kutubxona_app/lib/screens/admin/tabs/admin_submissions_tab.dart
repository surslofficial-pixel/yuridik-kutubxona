import 'package:flutter/material.dart';
import '../../../services/firebase_service.dart';
import '../../../theme/app_theme.dart';

class AdminSubmissionsTab extends StatelessWidget {
  AdminSubmissionsTab({super.key});

  final FirebaseService _fb = FirebaseService();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: _fb.pendingSubmissionsStream,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(color: AppTheme.primaryDark),
          );
        }
        final items = snapshot.data ?? [];
        if (items.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.inbox_rounded, size: 64, color: Colors.grey[300]),
                const SizedBox(height: 16),
                Text(
                  'Hozircha yangi takliflar yo\'q',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[500],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            return _SubmissionCard(
              item: item,
              onApprove: () => _approveDialog(context, item),
              onReject: () => _rejectDialog(context, item),
            );
          },
        );
      },
    );
  }

  void _approveDialog(BuildContext context, Map<String, dynamic> item) {
    final categoryCtrl = TextEditingController(text: item['category'] ?? '');
    final slugCtrl = TextEditingController(text: item['categorySlug'] ?? '');

    showDialog(
      context: context,
      builder: (c) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Color(0xFF10B981)),
            SizedBox(width: 8),
            Text('Tasdiqlash', style: TextStyle(fontSize: 18)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('"${item['title']}" kitobini tasdiqlaysizmi?'),
            const SizedBox(height: 16),
            TextField(
              controller: categoryCtrl,
              decoration: const InputDecoration(
                labelText: 'Kategoriya nomi',
                border: OutlineInputBorder(),
                isDense: true,
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: slugCtrl,
              decoration: const InputDecoration(
                labelText: 'Kategoriya slug',
                border: OutlineInputBorder(),
                isDense: true,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(c),
            child: const Text('BEKOR', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(c);
              await _fb.approveSubmission(item['id'], {
                'title': item['title'] ?? '',
                'author': item['author'] ?? '',
                'driveUrl': item['driveUrl'] ?? '',
                'category': categoryCtrl.text.trim(),
                'categorySlug': slugCtrl.text.trim(),
                'cover': '',
                'status': 'active',
              });
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      '✅ Kitob tasdiqlandi va kutubxonaga qo\'shildi!',
                    ),
                    backgroundColor: Color(0xFF10B981),
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
            ),
            child: const Text('TASDIQLASH'),
          ),
        ],
      ),
    );
  }

  void _rejectDialog(BuildContext context, Map<String, dynamic> item) {
    showDialog(
      context: context,
      builder: (c) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.cancel, color: Colors.red),
            SizedBox(width: 8),
            Text('Rad etish', style: TextStyle(fontSize: 18)),
          ],
        ),
        content: Text('"${item['title']}" taklifini rad etasizmi?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(c),
            child: const Text('BEKOR', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(c);
              await _fb.rejectSubmission(item['id']);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Taklif rad etildi'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('RAD ETISH'),
          ),
        ],
      ),
    );
  }
}

class _SubmissionCard extends StatelessWidget {
  final Map<String, dynamic> item;
  final VoidCallback onApprove;
  final VoidCallback onReject;

  const _SubmissionCard({
    required this.item,
    required this.onApprove,
    required this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with sender
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF7C3AED).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.person_rounded,
                  color: Color(0xFF7C3AED),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item['senderName'] ?? 'Noma\'lum',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    Text(
                      item['category'] ?? '',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'Kutilmoqda',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFB45309),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Book info
          Text(
            item['title'] ?? 'Nomsiz',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Muallif: ${item['author'] ?? "Noma'lum"}',
            style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
          ),
          if (item['description'] != null &&
              (item['description'] as String).isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              item['description'],
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
                height: 1.4,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          if (item['driveUrl'] != null &&
              (item['driveUrl'] as String).isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.link, size: 14, color: Color(0xFF2563EB)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    item['driveUrl'],
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF2563EB),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onReject,
                  icon: const Icon(Icons.close, size: 16),
                  label: const Text('Rad etish'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onApprove,
                  icon: const Icon(Icons.check, size: 16),
                  label: const Text('Tasdiqlash'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
