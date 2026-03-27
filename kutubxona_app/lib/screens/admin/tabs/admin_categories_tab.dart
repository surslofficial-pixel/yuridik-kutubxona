import 'package:flutter/material.dart';
import '../../../models/category.dart';
import '../../../services/firebase_service.dart';
import '../../../theme/app_theme.dart';

class AdminCategoriesTab extends StatefulWidget {
  const AdminCategoriesTab({super.key});

  @override
  State<AdminCategoriesTab> createState() => _AdminCategoriesTabState();
}

class _AdminCategoriesTabState extends State<AdminCategoriesTab> {
  final FirebaseService _fb = FirebaseService();

  void _showCategoryDialog([Category? category]) {
    final nameCtrl = TextEditingController(text: category?.name ?? '');
    final iconCtrl = TextEditingController(
      text: category?.iconName ?? 'BookOpen',
    );
    final colorCtrl = TextEditingController(
      text: category?.color ?? 'bg-blue-100 text-blue-600',
    );
    final slugCtrl = TextEditingController(text: category?.slug ?? '');
    String group = category?.group ?? 'maxsus';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setStateBuilder) => AlertDialog(
          title: Text(
            category == null
                ? 'Yangi Kategoriya'
                : 'Tahrirlash: ${category.name}',
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Nomi'),
                ),
                const SizedBox(height: 8),
                if (category == null)
                  TextField(
                    controller: slugCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Slug (Lotin harflarda)',
                    ),
                  ),
                const SizedBox(height: 8),
                TextField(
                  controller: iconCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Icon nomi (misol: BookOpen)',
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: colorCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Rang (misol: bg-red-100 text-red-600)',
                  ),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: group,
                  items: ['maxsus', 'umumtalim', 'badiiy', 'audio', 'ai']
                      .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                      .toList(),
                  onChanged: (v) =>
                      setStateBuilder(() => group = v ?? 'maxsus'),
                  decoration: const InputDecoration(labelText: 'Guruh'),
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
                if (nameCtrl.text.isEmpty) return;
                final slug =
                    category?.slug ??
                    (slugCtrl.text.isEmpty
                        ? nameCtrl.text.toLowerCase().replaceAll(' ', '-')
                        : slugCtrl.text);
                final newCat = Category(
                  name: nameCtrl.text,
                  iconName: iconCtrl.text,
                  color: colorCtrl.text,
                  slug: slug,
                  group: group,
                );

                if (category == null) {
                  await _fb.addCategory(newCat);
                } else {
                  await _fb.updateCategory(category.slug, newCat.toMap());
                }
                if (ctx.mounted) {
                  Navigator.pop(ctx);
                }
              },
              child: const Text('Saqlash'),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(Category category) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("O'chirishni tasdiqlang"),
        content: Text("${category.name} kategoriyasini o'chirasizmi?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Yo\'q'),
          ),
          TextButton(
            onPressed: () async {
              await _fb.deleteCategory(category.slug);
              if (ctx.mounted) Navigator.pop(ctx);
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
        StreamBuilder<List<Category>>(
          stream: _fb.categoriesStream,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            final categories = snapshot.data ?? [];

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final cat = categories[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: const Icon(
                      Icons.category,
                      color: AppTheme.primaryDark,
                    ),
                    title: Text(
                      cat.name,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text('Guruh: ${cat.group} | Slug: ${cat.slug}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, color: Colors.blue),
                          onPressed: () => _showCategoryDialog(cat),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => _confirmDelete(cat),
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
            onPressed: () => _showCategoryDialog(),
            child: const Icon(Icons.add),
          ),
        ),
      ],
    );
  }
}
