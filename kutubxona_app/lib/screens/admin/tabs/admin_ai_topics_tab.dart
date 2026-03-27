import 'package:flutter/material.dart';
import '../../../models/ai_topic.dart';
import '../../../services/firebase_service.dart';
import '../../../theme/app_theme.dart';

class AdminAiTopicsTab extends StatefulWidget {
  const AdminAiTopicsTab({super.key});

  @override
  State<AdminAiTopicsTab> createState() => _AdminAiTopicsTabState();
}

class _AdminAiTopicsTabState extends State<AdminAiTopicsTab> {
  final FirebaseService _fb = FirebaseService();

  void _showTopicDialog([AiTopic? topic]) {
    final titleCtrl = TextEditingController(text: topic?.title ?? '');
    final descCtrl = TextEditingController(text: topic?.description ?? '');
    final iconCtrl = TextEditingController(
      text: topic?.iconName ?? 'BrainCircuit',
    );
    final colorCtrl = TextEditingController(
      text: topic?.color ?? 'from-indigo-500 to-blue-500',
    );

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          topic == null ? 'Yangi AI Mavzu' : 'Tahrirlash: ${topic.title}',
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleCtrl,
                decoration: const InputDecoration(labelText: 'Sarlavha'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: descCtrl,
                decoration: const InputDecoration(
                  labelText: 'Qisqacha ta\'rif',
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 8),
              TextField(
                controller: iconCtrl,
                decoration: const InputDecoration(
                  labelText: 'Icon nomi (misol: BrainCircuit)',
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: colorCtrl,
                decoration: const InputDecoration(
                  labelText: 'Rang (misol: from-indigo-500 to-blue-500)',
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Bekor qilish'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (titleCtrl.text.isEmpty) return;
              final id =
                  topic?.id ??
                  titleCtrl.text.toLowerCase().replaceAll(' ', '-');
              final newTopic = AiTopic(
                id: id,
                title: titleCtrl.text,
                description: descCtrl.text,
                iconName: iconCtrl.text,
                color: colorCtrl.text,
              );
              if (topic == null) {
                await _fb.addAiTopic(newTopic);
              } else {
                await _fb.updateAiTopic(id, newTopic.toMap());
              }
              if (ctx.mounted) {
                Navigator.pop(ctx);
              }
            },
            child: const Text('Saqlash'),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(AiTopic topic) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("O'chirishni tasdiqlang"),
        content: Text("${topic.title} mavzusini o'chirasizmi?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Yo\'q'),
          ),
          TextButton(
            onPressed: () async {
              await _fb.deleteAiTopic(topic.id);
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
        StreamBuilder<List<AiTopic>>(
          stream: _fb.aiTopicsStream,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            final topics = snapshot.data ?? [];

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: topics.length,
              itemBuilder: (context, index) {
                final topic = topics[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: const Icon(
                      Icons.smart_toy,
                      color: AppTheme.primaryDark,
                    ),
                    title: Text(
                      topic.title,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      topic.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, color: Colors.blue),
                          onPressed: () => _showTopicDialog(topic),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => _confirmDelete(topic),
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        ),
        Positioned(
          right: 16,
          bottom: 16,
          child: FloatingActionButton(
            onPressed: () => _showTopicDialog(),
            child: const Icon(Icons.add),
          ),
        ),
      ],
    );
  }
}
